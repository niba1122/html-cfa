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
  function _get(_element: Element): string[] {
    const next = _element.parentElement?.closest<HTMLElement>('[data-b-for-each], [data-b-for-each-cloned]');
    if (next) {
      let contextExpr: string | undefined;
      if (typeof next.dataset.bForEach === 'string') {
        const base = next.dataset.bForEach;
        // const index = Number(next.getAttribute('data-b-index'));
        contextExpr = `${base}[0]`;
      } else if (typeof next.dataset.bForEachCloned === 'string') {
        const base = next.dataset.bForEachCloned;
        const index = Number(next.getAttribute('data-b-index'));
        contextExpr = `${base}[${index}]`;
      }
      if (contextExpr) {
        return [..._get(next), contextExpr];
      }
    }
    return [];
  }
  return _get(element);
}

function render(root: Element) {
  [...root.querySelectorAll('[data-b-for-each-cloned]')].forEach((element) => element.remove());
  [...root.querySelectorAll<HTMLElement>('[data-b-value-of], [data-b-for-each], [data-b-for-each-cloned]')]
    .forEach((element) => {
      if (element.dataset.bValueOf !== undefined) {
        const expr = element.dataset.bValueOf ?? '';
        const contextExprs = getContextExprs(element);
        try {
          element.textContent = extractDataByJSExpr(data, [...contextExprs, expr]).$;
        } catch {

        }
      } else if (element.dataset.bForEach !== undefined) {
        const contextExprs = getContextExprs(element);
        const expr = element.dataset.bForEach ?? '';

        const d = extractDataByJSExpr(data, [...contextExprs, expr]).$;

        const copiedElements = [...Array.isArray(d) ? d : []]
          .map((_, i) => i)
          .slice(1)
          .map(i => {
            const copiedElement = element.cloneNode(true) as HTMLElement;
            copiedElement.setAttribute('data-b-for-each-cloned', copiedElement.dataset.bForEach ?? '')
            delete copiedElement.dataset.bForEach;
            copiedElement.setAttribute('data-b-index', `${i}`);
            return copiedElement;
          });

        copiedElements.forEach((copiedElement, i) => {
          const base = copiedElements[i - 1] ?? element;
          element.parentElement?.insertBefore(copiedElement, base.nextSibling);
        });

        copiedElements.forEach(copied => render(copied));
      }
    });
}

window.addEventListener('DOMContentLoaded', () => {
  render(document.body);
});
