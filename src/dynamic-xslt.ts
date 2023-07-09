const data = {
  table1: [
    { name: 'taro', sex: 'male', age: 28 },
    { name: 'hanako', sex: 'female', age: 32 },
    { name: 'mike', sex: 'male', age: 21 },
    { name: 'jane', sex: 'female', age: 25 },
    { name: 'james', sex: 'male', age: 33 },
  ],
  table2: [
    { name: 'yamada', sex: 'male', job: 'engineer' },
    { name: 'suzuki', sex: 'female', job: 'designer' },
    { name: 'sato', sex: 'male', job: 'sales' },
    { name: 'tanaka', sex: 'female', job: 'researcher' },
  ],
}


function extractDataByPath(path: string, data: any) {
  let index = 0;

  const pathArray: (string | number)[] = [];

  function readChildName() {
    let name = ''
    while (index < path.length) {
      const char = path[index];
      if (/[a-zA-Z0-9_]/.test(char)) {
        index++;
        name += char;
      } else {
        if (!name) throw new Error(`Invalid string '${char}'.`);
        pathArray.push(name);
        return;
      }
    }
    pathArray.push(name);
  }

  function readAccessor() {
    {
      const char = path[index];
      if (/\[/.test(char)) {
        index++;
      } else {
        throw new Error('`[` expected');
      }
    }
    let numStr = '';
    while (index < path.length) {
      const char = path[index];
      if (/[0-9]/.test(char)) {
        numStr += char;
        index++;
      } else {
        if (!numStr) throw new Error('Invalid number.');
        pathArray.push(numStr);
        break;
      }
    }
    {
      const char = path[index];
      if (/\]/.test(char)) {
        index++;
      } else {
        throw new Error('`]` expected');
      }
    }
  }

  function readDivider() {
    const char = path[index];
    if (/\//.test(char)) {
      index++;
    } else {
      throw new Error('`/` expected.');
    }
  }

  function end() {
    if (index === path.length) {
      // noop
    } else {
      throw new Error('end expected');
    }
  }


  try {
    readDivider();
  } catch {}
  while (index < path.length) {
    readChildName();
    try {
      readAccessor();
    } catch {}

    try {
      readDivider();
    } catch {
      end();
    }
  }

  function _extract(data: any, depth: number = 0): any {
    const path = pathArray[depth];
    let value: any;
    if (Array.isArray(data) && typeof path === 'number') {
      value = data[path];
    } else if (typeof data === 'object' && typeof path === 'string') {
      value = data[path];
    }

    if (Array.isArray(value) || typeof value === 'object') {
      if (depth < pathArray.length - 1) {
        return _extract(value, depth + 1);
      } else {
        return value;
      }
    } else if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean' || value == null) {
      return value;
    } else {
      throw new Error('Unexpected value!')
    }
  }

  return _extract(data);
}


class DXSLContext extends HTMLElement {
  #basePath: string;
  constructor(basePath: string) {
    super();
    this.#basePath = basePath;
  }

  get contextPath() {
    return this.#basePath;
  }
}

class DXSLForEach extends HTMLElement {
  #observer: MutationObserver;
  #childFragment: DocumentFragment | null = null;


  get #match(): string | null {
    return this.getAttribute('match');
  }

  get #data(): any[] {
    const match = this.#match;
    if (!match) return [];

    const d = extractDataByPath(match, data);

    if (Array.isArray(d)) {
      return d;
    } else {
      return [];
    }
  }

  constructor() {
    super();

    this.#observer = new MutationObserver(() => {
      this.#render();
    });

    this.#observer.observe(this, {
      childList: true,
      subtree: true,
    });
  }

  connectedCallback() {
    this.#render();
    if (this.#childFragment) {
      this.#observer.disconnect();
    };
  }

  attributeChangedCallback() {
    this.#render();
  }
  static get observedAttributes() {
    return ['match'];
  }

  #render() {
    if (!this.#childFragment && this.childNodes.length > 0) {
      const childFragment = document.createDocumentFragment();
      childFragment.append(...this.childNodes);
      this.#childFragment = childFragment;
    }
    if (!this.#childFragment) return;

    const children = this.#data
      .map((_, i) => {
        const itemContext = new DXSLContext(`${this.#match!}[${i}]`)
        itemContext.appendChild(this.#childFragment!.cloneNode(true));
        return itemContext;
      });

    this.replaceChildren(...children);
  }
}

class DXSLValueOf extends HTMLElement {
  #observer: MutationObserver;

  get #key(): string | null {
    return this.getAttribute('key');
  }

  get #contextPath(): string | null {
    const elem = this.closest<DXSLContext>('dxsl-context');
    return elem?.contextPath ?? null;
  }

  constructor() {
    super();

    this.#observer = new MutationObserver(() => {
      this.#render();
    });

    this.#observer.observe(this, {
      childList: true,
      subtree: true,
    });
  }

  connectedCallback() {
    this.#render();
  }

  attributeChangedCallback() {
    this.#render();
  }

  static get observedAttributes() {
    return ['key'];
  }

  #render() {
    this.textContent = extractDataByPath(`${this.#contextPath ?? ''}/${this.#key ?? ''}`, data);
  }
}
function registerComponents() {
  customElements.define('dxsl-context', DXSLContext);
  customElements.define('dxsl-for-each', DXSLForEach);
  customElements.define('dxsl-value-of', DXSLValueOf);
}

registerComponents();
