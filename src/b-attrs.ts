const data = {
  table1: [
    { name: 'taro', sex: 'male', age: 28 },
    { name: 'hanako', sex: 'female', age: 32 },
    { name: 'mike', sex: 'male', age: 21 },
    { name: 'jane', sex: 'female', age: 25 },
    { name: 'james', sex: 'male', age: 33 },
  ],
  table2: [
    { name: 'yamada', sex: 'male', job: 'engineer', roles: ['manager', 'engineer'] },
    { name: 'suzuki', sex: 'female', job: 'designer', roles: ['head', 'designer'] },
    { name: 'sato', sex: 'male', job: 'sales', roles: ['sub'] },
    { name: 'tanaka', sex: 'female', job: 'researcher', roles: [] },
  ],
  tableGroup1: {
    fruits: [
      {
        name: 'orange',
      },
      {
        name: 'apple',
      },
      {
        name: 'grape',
      },
    ],
    animals: [
      {
        name: 'cat',
      },
      {
        name: 'dog',
      },
      {
        name: 'bear',
      },
      {
        name: 'rabbit',
      },
    ]
  },
}

function extractDataByJSExpr(data: any, exprs: string[]): { $: any; $root: any } {
  // console.log('[debug]func', data, exprs)
  const root = data;
  const current = exprs.reduce<any>((current, expr) => {
    const funcExpr = new Function('$', '$root', `return ${expr};`);
    return funcExpr(current, root);
  }, root);
  return {
    $: current,
    $root: root,
  };
}

function getContextExprs(element: Element): string[] {
  function _get(element: Element): string[] {
    const next = element.parentElement?.closest('[data-b-context]');
    if (next instanceof HTMLElement) {
      const contextExpr = next.dataset.bContext;
      if (contextExpr) {
        return [..._get(next), contextExpr];
      }
    }
    return [];
  }
  return _get(element);
}

function render(root: Element) {
  Array.from(root.querySelectorAll('[data-b-value-of]')).map((element) => {
    if (!(element instanceof HTMLElement)) return;
    const expr = element.dataset.bValueOf ?? '';
    const contextExprs = getContextExprs(element);
    element.textContent = extractDataByJSExpr(data, [...contextExprs, expr]).$;
  });

  Array.from(root.querySelectorAll('[data-b-for-each]')).map((element) => {
    if (!(element instanceof HTMLElement)) return;

    const contextExprs = getContextExprs(element);
    const expr = element.dataset.bForEach ?? '';
    delete element.dataset.bForEach;

    const templateElement = document.createElement('template');
    templateElement.innerHTML = element.outerHTML;

    const d = extractDataByJSExpr(data, [...contextExprs, expr]).$;
    console.log('d', d, [...contextExprs, expr])

    const copiedElements = (Array.isArray(d) ? d : []).map((_, i) => {
      const copiedElement = templateElement.content.cloneNode(true) as Element;
      return copiedElement;
    });

    element.replaceWith(templateElement, ...copiedElements);

    [...(templateElement.parentElement?.querySelectorAll(':scope > *:not(template)') ?? [])].forEach((copiedElement, i) => {
      copiedElement.setAttribute('data-b-context', `${expr}[${i}]`);
      render(copiedElement);
    });
  });
}

window.addEventListener('DOMContentLoaded', () => {
  render(document.body);
});
