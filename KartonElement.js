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

  constructor() {
    super();
    this.attachLightDom();
  }

  attachLightDom() {
    // Light DOM by default
  }

  connectedCallback() {
    this.init();
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
    if (typeof this.template === 'function') {
      uhtmlRender(this, this.template());
    }
    queueMicrotask(() => this.runEffects());
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
      try {
        const stored = storage.getItem(key);
        this.#state[key] = stored !== null ? JSON.parse(stored) : initialValue;
      } catch {
        this.#state[key] = initialValue;
      }
    }
    const setState = (newVal) => {
      if (this.#state[key] !== newVal) {
        this.#state[key] = newVal;
        try {
          storage.setItem(key, JSON.stringify(newVal));
        } catch {}
        this.render();
      }
    };
    return [() => this.#state[key], setState];
  }

  busState(key, initialValue, storage = localStorage) {
    if (!(key in this.#state)) {
      try {
        const stored = storage.getItem(key);
        this.#state[key] = stored !== null ? JSON.parse(stored) : initialValue;
      } catch {
        this.#state[key] = initialValue;
      }

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
        try {
          storage.setItem(key, JSON.stringify(newVal));
        } catch {}
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

