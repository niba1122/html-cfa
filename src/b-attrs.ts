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

const ATTR_FOR_EACH = 'data-b-for-each';
const ATTR_FOR_EACH_CLONED = 'data-b-for-each-cloned';
const ATTR_FOR_EACH_INDEX = 'data-b-for-each-index';
const ATTR_VALUE_OF = 'data-b-value-of';

function is(element: Element, attr: string) {
  return element.getAttribute(attr) !== null;
}

function toSelector(attrs: string[]): string {
  return attrs.map(attr => `[${attr}]`).join(',');
}

function getContextExprs(element: Element): string[] {
  function _get(_element: Element): string[] {
    const next = _element.parentElement?.closest<HTMLElement>(toSelector([ATTR_FOR_EACH, ATTR_FOR_EACH_CLONED]));
    if (next) {
      let contextExpr: string | undefined;
      if (is(next, ATTR_FOR_EACH)) {
        const base = next.getAttribute(ATTR_FOR_EACH) ?? '';
        contextExpr = `${base}[0]`;
      } else if (is(next, ATTR_FOR_EACH_CLONED)) {
        const base = next.getAttribute(ATTR_FOR_EACH_CLONED) ?? '';
        const index = Number(next.getAttribute(ATTR_FOR_EACH_INDEX));
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
  [...root.querySelectorAll(toSelector([ATTR_FOR_EACH_CLONED]))].forEach((element) => element.remove());
  [...root.querySelectorAll<HTMLElement>(toSelector([ATTR_VALUE_OF, ATTR_FOR_EACH, ATTR_FOR_EACH_CLONED]))]
    .forEach((element) => {
      if (is(element, ATTR_VALUE_OF)) {
        const expr = element.getAttribute(ATTR_VALUE_OF) ?? '';
        const contextExprs = getContextExprs(element);
        element.textContent = extractDataByJSExpr(data, [...contextExprs, expr]).$;
      } else if (is(element, ATTR_FOR_EACH)) {
        const contextExprs = getContextExprs(element);
        const expr = element.getAttribute(ATTR_FOR_EACH) ?? '';
        const d = extractDataByJSExpr(data, [...contextExprs, expr]).$;

        const copiedElements = [...Array.isArray(d) ? d : []]
          .map((_, i) => i)
          .slice(1)
          .map(i => {
            const copiedElement = element.cloneNode(true) as HTMLElement;
            copiedElement.setAttribute(ATTR_FOR_EACH_CLONED, copiedElement.getAttribute(ATTR_FOR_EACH) ?? '')
            copiedElement.removeAttribute(ATTR_FOR_EACH);
            copiedElement.setAttribute(ATTR_FOR_EACH_INDEX, `${i}`);
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
