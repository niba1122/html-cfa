// import './style.css';

const STYLE = `
dxsl-internal-context {
  display: contents;
}

dxsl-for-each {
  display: contents;
}

dxsl-value-of {
  display: contents;
}
`

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


class DXSLInternalContext extends HTMLElement {
  get contextExprs(): string[] {
    const elem = this.parentElement?.closest<DXSLInternalContext>('dxsl-internal-context');
    const prevContextExprs = elem?.contextExprs ?? [];
    const contextExpr = this.getAttribute('select');
    if (contextExpr) {
      return [...prevContextExprs, contextExpr];
    } else {
      return prevContextExprs;
    }
  }
}

class DXSLForEach extends HTMLElement {
  get #childTemplate(): HTMLTemplateElement | null {
    return this.getElementsByTagName('template')[0] ?? null;
  }

  get #select(): string | null {
    return this.getAttribute('select');
  }

  get #contextExprs(): string[] {
    const elem = this.parentElement?.closest<DXSLInternalContext>('dxsl-internal-context');
    const prevContextExprs = elem?.contextExprs ?? [];
    const contextExpr = this.getAttribute('select');
    if (contextExpr) {
      return [...prevContextExprs, contextExpr];
    } else {
      return prevContextExprs;
    }
  }

  get #data(): any[] {
    const { $ } = extractDataByJSExpr(data, this.#contextExprs);
    // console.log('[debug] for-each', this.#contextExprs, $, data);

    if (Array.isArray($)) {
      return $;
    } else {
      return [];
    }
  }

  constructor() {
    super();

    if (document.readyState === 'loading' && !this.parentElement?.closest<DXSLInternalContext>('dxsl-internal-context')) {
      window.requestAnimationFrame(() => this.#render());
    }
  }

  connectedCallback() {
    this.#render();
  }

  attributeChangedCallback() {
    this.#render();
  }
  static get observedAttributes() {
    return ['select'];
  }

  #render() {
    if (!this.#select) return;
    // console.log('[debug]render', this.#childTemplate, this.#data)
    if (!this.#childTemplate && this.childNodes.length > 0) {
      const templateDOM = document.createElement('template');
      templateDOM.innerHTML = this.innerHTML;
      this.replaceChildren(templateDOM);
    }
    if (!this.#childTemplate) return;

    const itemContexts = this.#data
      .map((_, i) => {
        const itemContext = document.createElement('dxsl-internal-context');
        itemContext.setAttribute('select', `${this.#select}[${i}]`)
        return itemContext;
      });
    this.replaceChildren(this.#childTemplate, ...itemContexts);
    // connectedcallbackを正しく発火させるために、contextを先に追加してから各要素を追加する
    itemContexts.forEach(itemContext => {
      itemContext.appendChild(this.#childTemplate!.content.cloneNode(true));
    })
  }
}

class DXSLValueOf extends HTMLElement {
  get #contextExprs(): string[] {
    const elem = this.parentElement?.closest<DXSLInternalContext>('dxsl-internal-context');
    const prevContextExprs = elem?.contextExprs ?? [];
    const contextExpr = this.getAttribute('select')
    if (contextExpr) {
      return [...prevContextExprs, contextExpr];
    } else {
      return prevContextExprs;
    }
  }

  constructor() {
    super();
    if (document.readyState === 'loading' && !this.parentElement?.closest<DXSLInternalContext>('dxsl-internal-context')) {
      window.requestAnimationFrame(() => this.#render());
    }
  }

  connectedCallback() {
    this.#render();
  }

  // attributeChangedCallback() {
  //   this.#render();
  // }

  static get observedAttributes() {
    return ['select'];
  }

  #render() {
    // console.log('[debug] before value-of', this.#contextExprs)
    if (!this.#contextExprs) {
      return;
    }
    // console.log('[debug] value-of path', this.#contextExprs, data);
    this.textContent = extractDataByJSExpr(data, this.#contextExprs).$;
  }
}
function registerComponents() {
  customElements.define('dxsl-internal-context', DXSLInternalContext);

  customElements.define('dxsl-for-each', DXSLForEach);
  customElements.define('dxsl-value-of', DXSLValueOf);

  const styleDOM = document.createElement('style');
  styleDOM.textContent = STYLE;
  document.head.appendChild(styleDOM);
}

registerComponents();
