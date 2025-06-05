import { render as uhtmlRender, html } from 'uhtml';

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

export class KartonElement extends HTMLElement {
  #state = {};
  #effects = [];
  #unsubscribers = [];
  #renderPending = false;

  #coerceAttr(value) {
    if (value === 'true') return true;
    if (value === 'false') return false;
    if (!isNaN(value)) return Number(value);
    return value;
  }

  constructor() {
    super();
    this.attachLightDom();
  }

  attachLightDom() {
    // Light DOM by default
  }

  initializePropsFromAttributes() {
    for (const { name, value } of Array.from(this.attributes)) {
      if ( name !== "id" && name !== "class" ) {
        const coerced = this.#coerceAttr(value);
        const [getter, setter] = this.busState(name, coerced);
        //Object.defineProperty(this, name, {
        //  configurable: true,
        //  get: getter,
        //  set: setter,
        //});
        this[`${name}`] = getter;
        this[`set${name[0].toUpperCase() + name.slice(1)}`] = setter;
      }
    }
  }

  connectedCallback() {
    this.initializePropsFromAttributes(); // auto-convert attributes to busState
    this.init(); // user-defined
    this.render();
  }

  disconnectedCallback() {
    // Clean up any bus subscriptions
    for (const unsub of this.#unsubscribers) unsub();
    this.#unsubscribers = [];
  }

  init() {
    // To be overridden by subclasses
  }

  render() {
    if (this.#renderPending) return;
    this.#renderPending = true;

    queueMicrotask(() => {
      this.#renderPending = false;
      if (typeof this.template === 'function') {
        uhtmlRender(this, this.template());
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
      console.log('Invalid dependency in Computed!', dep);
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
    }
    const setState = (newVal) => {
      if (this.#state[key] !== newVal) {
        this.#state[key] = newVal;
        this.render();
      }
    };
    return [() => this.#state[key], setState];
  }

  localState(key, initialValue) {
    return this.#storageState(key, initialValue, localStorage);
  }

  sessionState(key, initialValue) {
    return this.#storageState(key, initialValue, sessionStorage);
  }

  #storageState(key, initialValue, storage) {
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
      const stored = storage.getItem(key);
      this.#state[key] = stored !== null ? this.#coerceAttr(stored) : initialValue;
      const unsubscribe = stateBus.subscribe(key, val => {
        if (this.#state[key] !== val) {
          this.#state[key] = val;
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
        this.render();
      }
    };

    return [() => this.#state[key], setState];
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

export { html };

