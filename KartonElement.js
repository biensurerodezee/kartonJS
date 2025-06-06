import { render as uhtmlRender, html } from 'uhtml';

// HTML
export { html };

// DEV env
const isDev = location.hostname === 'localhost' || location.hostname === '127.0.0.1';

// stateBus pub/sub
const stateBus = (() => {
  const listeners = new Map();

  return {
    subscribe(key, callback) {
      if (!listeners.has(key)) listeners.set(key, new Set());
      listeners.get(key).add(callback);
      return () => listeners.get(key).delete(callback);
    },
    publish(key, value) {
      if (listeners.has(key)) {
        for (const cb of listeners.get(key)) cb(value);
      }
    }
  };
})();

// KartonElement to be extended by you
export class KartonElement extends HTMLElement {
  #state = {};
  #effects = [];
  #unsubscribers = [];
  #renderPending = false;
  #cloneStyleSheets = true;
  globalStyleLinks = [...document.querySelectorAll('link[rel="stylesheet"]')]
    .map(link => html`<link rel="stylesheet" href="${link.href}">`);

  #coerceAttr(v) {
    if (v === 'true') return true;
    if (v === 'false') return false;
    if (!isNaN(parseFloat(v)) && isFinite(v)) return Number(v);
    return v;
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' }); // Shadow DOM enabled
  }

  connectedCallback() {
    // Define Development tools integration
    if (isDev) {
      if (!window.__Karton__) {
        window.__Karton__ = { instances: new Set() };
      }
      window.__Karton__.instances.add(this);

      this.debugName = this.getAttribute('id') || this.tagName.toLowerCase();  
    }
    // user-defined
    this.init();
    // render
    this.render();
  }

  disconnectedCallback() {
    // Clean up any bus subscriptions
    for (const unsub of this.#unsubscribers) unsub();
    this.#unsubscribers = [];
    // Cleanup Development tools integration
    if (window.__Karton__) {
      window.__Karton__.instances.delete(this);
    }
    // Call all effect cleanup functions
    for (const { fn, deps, last, cleanup } of this.#effects) {
      (typeof cleanup === "function") && cleanup();
    }
    this.#effects = [];
  }

  init() {
    // To be overridden by subclasses
  }

  render() {
    if (this.#renderPending) return;
    this.#renderPending = true;
    (isDev) && console.debug(`[KartonJS] Rendering <${this.tagName.toLowerCase()}>`);

    queueMicrotask(() => {
      this.#renderPending = false;
      if (typeof this.template === 'function') {
        uhtmlRender(this.shadowRoot, html`
          ${this.globalStyleLinks}
          ${this.template()}
        `);
      }
      this.runEffects();
    });
  }
  
  Computed(fn, deps = []) {
    const resolvedDeps = deps.map(dep => {
      if (typeof dep === 'function') return dep;
      if (typeof dep === 'string') {
        return () => {
          const val = this[dep];
          return typeof val === 'function' ? val() : val;
        };
      }
      console.warn('Invalid dependency in Computed:', dep);
      return () => undefined;
    });

    let value;
    const compute = () => {
      value = fn();
      this.render();
    };

    this.Effect(compute, resolvedDeps);
    return () => value;
  }

  State(key, initialValue) {
    if (!(key in this.#state)) {
      this.#state[key] = initialValue;
      (isDev) && console.debug(`[KartonJS] State initialized: ${key} =`, this.#state[key]);
    }
    const setState = (newVal) => {
      if (this.#state[key] !== newVal) {
        this.#state[key] = newVal;
        (isDev) && console.debug(`[KartonJS] State changed: ${key} →`, newVal);
        this.render();
      }
    };
    return [() => this.#state[key], setState];
  }

  storageState(key, initialValue, storage = localStorage) {
    if (!(key in this.#state)) {
        const stored = storage.getItem(key);
        this.#state[key] = stored !== null ? this.#coerceAttr(stored) : initialValue;
    }
    const setState = (newVal) => {
      if (this.#state[key] !== newVal) {
        this.#state[key] = newVal;
        storage.setItem(key, newVal);
        this.render();
      }
    };
    return [() => this.#state[key], setState];
  }

  busState(key, initialValue, storage = localStorage) {
    if (!(key in this.#state)) {
      // get initalValue from attribute when found
      if( this.hasAttribute(key) && this.getAttribute(key) !== "" ) {
        const attr = this.getAttribute(key);
        this.#state[key] = attr !== null ? this.#coerceAttr(attr) : initialValue;        
      } else {
        const stored = storage.getItem(key);
        this.#state[key] = stored !== null ? this.#coerceAttr(stored) : initialValue;
      }
      const unsubscribe = stateBus.subscribe(key, val => {
        console.log(`[busState subscribed] ${key} =`, val);
        if (this.#state[key] !== val) {
          this.#state[key] = val;
          this.reflectAttribute(key, val);
          this.render();
        }
      });

      this.#unsubscribers.push(unsubscribe);
    }

    const setState = (newVal) => {
      if (this.#state[key] !== newVal) {
        this.#state[key] = newVal;
        storage.setItem(key, newVal);
        stateBus.publish(key, newVal);
        this.reflectAttribute(key, newVal);
        this.render();
      }
    };

    return [() => this.#state[key], setState];
  }

  reflectAttribute(key, val) {
    if (typeof val === 'boolean') {
      if (val) this.setAttribute(key, '');
      else this.removeAttribute(key);
    } else {
      this.setAttribute(key, val);
    }
  }

  attributeChangedCallback(name, oldValue, newValue) {
    console.log(`[attributeChanged] ${name}:`, oldValue, '→', newValue);
    if (oldValue === newValue) return;

    let coerced;
    if (newValue === null) {
      coerced = false; // attribute was removed
    } else if (newValue === '') {
      coerced = true; // boolean attribute shorthand: <el checked>
    } else {
      coerced = this.#coerceAttr(newValue);
    }

    if (name in this.#state && this.#state[name] !== coerced) {
      this.#state[name] = coerced;
      stateBus.publish(name, coerced);
      this.render();
    }
  }

  Effect(fn, deps = []) {
    this.#effects.push({
      fn,
      deps,
      last: [],
      cleanup: null
    });
  }

  runEffects() {
    this.#effects.forEach(effect => {
      const shouldRun =
        effect.last.length !== effect.deps.length ||
        effect.deps.some((dep, i) => dep() !== effect.last[i]);

      if (shouldRun) {
        if (typeof effect.cleanup === 'function') {
          effect.cleanup();
        }

        const result = effect.fn();
        effect.cleanup = typeof result === 'function' ? result : null;
        effect.last = effect.deps.map(dep => dep());
      }
    });
  }
}
