let data = {
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
  table3: [
    { name: 'a', imageUrl: 'https://cdn.goope.jp/45227/161123133219uvsp_l.jpg' },
    { name: 'b', imageUrl: 'https://cdn.goope.jp/45227/161123133242xhrd_l.jpg' },
    { name: 'c', imageUrl: 'https://cdn.goope.jp/45227/161123133257tc3t_l.jpg' },
    { name: 'd', imageUrl: 'https://cdn.goope.jp/45227/161123133322kjgc_l.jpg' },
    { name: 'e', imageUrl: 'https://cdn.goope.jp/45227/161123133340ta2s_l.jpg' },
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
    try {
      const funcExpr = new Function('$', '$root', `return ${expr};`);
      return funcExpr(current, root);
    } catch (e) {
      console.error(e);
    }
  }, root);
  return {
    $: current,
    $root: root,
  };
}

const ATTR_FOR = 'data-b-for';
const ATTR_FOR__CLONE = 'data-b-for_clone';
const ATTR_FOR__INDEX = 'data-b-for_index';
const ATTR_CONTENT = 'data-b-content';
const ATTR_ATTRIBUTES = 'data-b-attributes';
const ATTR_IF = 'data-b-if';
const ATTR_IF__HIDDEN = 'data-b-if_hidden';

const EVENT_RENDERED = 'b:rendered'
const EVENT_SET_DATA = 'b:setData'

function is(element: Element, attr: string) {
  return element.getAttribute(attr) !== null;
}

function toSelector(attrs: string[]): string {
  return attrs.map(attr => `[${attr}]`).join(',');
}

function getContextExprs(element: Element): string[] {
  function _get(_element: Element): string[] {
    const next = _element.parentElement?.closest<HTMLElement>(toSelector([ATTR_FOR, ATTR_FOR__CLONE]));
    if (next) {
      let contextExpr: string | undefined;
      if (is(next, ATTR_FOR)) {
        const base = next.getAttribute(ATTR_FOR) ?? '';
        contextExpr = `${base}[0]`;
      } else if (is(next, ATTR_FOR__CLONE)) {
        const base = next.getAttribute(ATTR_FOR__CLONE) ?? '';
        const index = Number(next.getAttribute(ATTR_FOR__INDEX));
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
  function _render(root: Element) {
    [...root.querySelectorAll(toSelector([ATTR_FOR__CLONE]))].forEach((element) => element.remove());
    let createdElements: Element[] = [];
    [...root.querySelectorAll<HTMLElement>(toSelector([ATTR_CONTENT, ATTR_FOR, ATTR_FOR__CLONE, ATTR_ATTRIBUTES, ATTR_IF]))]
      .forEach((element) => {
        if (is(element, ATTR_CONTENT)) {
          const expr = element.getAttribute(ATTR_CONTENT) ?? '';
          const contextExprs = getContextExprs(element);
          element.textContent = extractDataByJSExpr(data, [...contextExprs, expr]).$;
        } else if (is(element, ATTR_ATTRIBUTES)) {
          const expr = element.getAttribute(ATTR_ATTRIBUTES) ?? '';
          const contextExprs = getContextExprs(element);
          const attrValues = extractDataByJSExpr(data, [...contextExprs, expr]).$;
          if (typeof attrValues === 'object' && !Array.isArray(attrValues)) {
            Object.entries(attrValues as Record<string, any>)
              .forEach(([attr, value]) => {
                element.setAttribute(attr, value);
              });
          }
        } else if (is(element, ATTR_IF)) {
          const expr = element.getAttribute(ATTR_IF) ?? '';
          const contextExprs = getContextExprs(element);
          const result = !!extractDataByJSExpr(data, [...contextExprs, expr]).$;
          if (result) {
            element.removeAttribute(ATTR_IF__HIDDEN);
          } else {
            element.setAttribute(ATTR_IF__HIDDEN, '');
          }
        } else if (is(element, ATTR_FOR)) {
          const contextExprs = getContextExprs(element);
          const expr = element.getAttribute(ATTR_FOR) ?? '';
          const d = extractDataByJSExpr(data, [...contextExprs, expr]).$;

          const copiedElements = [...Array.isArray(d) ? d : []]
            .map((_, i) => i)
            .slice(1)
            .map(i => {
              const copiedElement = element.cloneNode(true) as HTMLElement;
              copiedElement.setAttribute(ATTR_FOR__CLONE, copiedElement.getAttribute(ATTR_FOR) ?? '')
              copiedElement.removeAttribute(ATTR_FOR);
              copiedElement.setAttribute(ATTR_FOR__INDEX, `${i}`);
              return copiedElement;
            });

          copiedElements.forEach((copiedElement, i) => {
            const base = copiedElements[i - 1] ?? element;
            element.parentElement?.insertBefore(copiedElement, base.nextSibling);
          });

          createdElements = [...createdElements, ...copiedElements];
        }
      });
    createdElements.forEach(element => _render(element));

  }
  _render(root);
  window.dispatchEvent(new CustomEvent(EVENT_RENDERED));
}

window.addEventListener('DOMContentLoaded', () => {
  render(document.body);
});

window.addEventListener(EVENT_SET_DATA as string, (event: any) => {
  data = event.detail.data;
  render(document.body);
});
