import { effect, signal, computed } from 'uhtml/signal';
import { reactive, html } from 'uhtml/reactive';

// define Renderer
const render = reactive(effect); // 🆕 replaces uhtmlRender

// HTML
export { html };

// DEV env
//export const isDev = location.hostname === 'localhost' || location.hostname === '127.0.0.1';
export const isDev = false;
export const logdev = (...m) => (isDev) && console.debug(`[KartonJS]`, ...m);

// memoryStorage 
export const memoryStorage = {
  item: {},
  setItem: (key, value) => memoryStorage.item[key] = value,
  getItem: (key) => memoryStorage.item[key] || null,
  removeItem: (key) => delete memoryStorage[key],
  clear: () => memoryStorage.item = {}
}

// stateBus pub/sub - no export - only used within KartonElement
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

  Storage = memoryStorage;

  constructor() {
    super();
    this.attachLightDom();
  }

  attachLightDom() {
    // optional: you can just use `this` since it's light DOM by default
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
    // user-defined initialization
    this.init();
    // render
    if (typeof this.template === 'function') {
      render(this, this.template.bind(this));
    }
  }

  disconnectedCallback() {
    for (const unsub of this.#unsubscribers) unsub();
    this.#unsubscribers = [];

    window.__Karton__?.instances.delete(this);

    for (const { label, cleanup } of this.#effects) {
      logdev(`Cleaning up effect <${this.tagName.toLowerCase()} id=${this.id}>: ${label}`);
      if (typeof cleanup === 'function') cleanup();
    }
    this.#effects = [];
  }

  init() {
    // To be overridden by subclasses
  }

  coerce(v) {
    if (v === 'true') return true;
    if (v === 'false') return false;
    if (!isNaN(parseFloat(v)) && isFinite(v)) return Number(v);
    return v;
  }

  State(key, initialValue, storage = this.Storage) {
    if (!(key in this.#state)) {
      let value;

      if (this.hasAttribute(key)) {
        value = this.coerce(this.getAttribute(key));
        logdev(`State Initialized by Attribute <${this.tagName.toLowerCase()} id=${this.id}>: ${key} =`, value);
      } else if (storage.getItem(key) !== null) {
        value = this.coerce(storage.getItem(key));
        logdev(`State Initialized by Storage <${this.tagName.toLowerCase()} id=${this.id}>: ${key} =`, value);
      } else {
        value = initialValue;
        logdev(`State Initialized by Initial Value <${this.tagName.toLowerCase()} id=${this.id}>: ${key} =`, value);
      }

      const s = signal(value);
      this.#state[key] = s;

      const cleanup = effect(() => {
        const val = s.value;
        logdev(`State Changed <${this.tagName.toLowerCase()} id=${this.id}>: ${key} =`, val);
        this.reflectAttribute(key, val);
        storage.setItem(key, val);
      });

      this.#effects.push({ label: `state:${key}`, cleanup });
    }

    const s = this.#state[key];
    return [() => s.value, v => s.value = v];
  }

  BusState(key, initialValue) {
    let s;
    const alreadyExists = key in this.#state;
    if (!alreadyExists) {
      s = signal(initialValue);
      this.#state[key] = s;
    } else {
      s = this.#state[key];
    }

    const unsubscribe = stateBus.subscribe(key, newVal => {
      logdev(`[${this.id}] SUB: ${key} =`, newVal);
      if (s.value !== newVal) s.value = newVal;
    });
    this.#unsubscribers.push(unsubscribe);

    const hasEffect = this.#effects.some(e => e.label === `bus:${key}`);
    if (!hasEffect) {
      const cleanup = effect(() => {
        logdev(`[${this.id}] PUB: ${key} =`, s.value);
        stateBus.publish(key, s.value);
      });
      this.#effects.push({ label: `bus:${key}`, cleanup });
    }

    return [() => s.value, v => s.value = v];
  }

  StateSignal(initialValue) {
    const s = signal(initialValue);
    return [() => s.value, v => s.value = v];
  }

  reflectAttribute(key, val) {
    let oAttr = this.constructor.observedAttributes || [];
    if (oAttr.includes(key)) {
      this.setAttribute(key, val);
      logdev(`Attribute reflected: <${this.tagName.toLowerCase()} id=${this.id}> ${key} →`, val);
    }
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) return;
    logdev(`attributeChanged ${name} <${this.tagName.toLowerCase()} id=${this.id}>:`, oldValue, '→', newValue);

    const coerced = this.coerce(newValue);
    if (name in this.#state && this.#state[name].value !== coerced) {
      this.#state[name].value = coerced;
      stateBus.publish(name, coerced);
    }
  }

  Effect(fn, depsOrLabel) {
    let label = 'anonymous';
    let deps = null;

    if (Array.isArray(depsOrLabel)) {
      deps = depsOrLabel;
    } else if (typeof depsOrLabel === 'string') {
      label = depsOrLabel;
    }

    const run = () => {
      logdev(`Effect Triggered <${this.tagName.toLowerCase()} id=${this.id}>: ${label}`);
      const result = fn();
      return typeof result === 'function' ? result : null;
    };

    const cleanup = deps
      ? effect(() => {
          deps.map(d => d()); // for tracking
          return run();
        })
      : effect(run);

    this.#effects.push({ label, cleanup });
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

  Computed(computeFn, key) {
    if (typeof computeFn !== 'function') {
      throw new Error(`Computed expects a function, but got: ${typeof computeFn}`);
    }

    if (!(key in this.#state)) {
      const c = computed(computeFn);
      this.#state[key] = c;

      const cleanup = effect(() => {
        const val = c.value;
        logdev(`Computed Updated <${this.tagName.toLowerCase()} id=${this.id}>: ${key} =`, val);
      });

      this.#effects.push({ label: `computed:${key}`, cleanup });
    }

    const c = this.#state[key];
    return () => c.value;
  }
  
  BoolAttrEffect(attr, getter) {
    this.Effect(() => {
      const val = getter();
      if (val === false || val === null || val === undefined) {
        this.removeAttribute(attr);
      } else {
        this.setAttribute(attr, '');
      }
    }, [getter]);
  }

  SyncAttrEffect(attrName, getter) {
    this.Effect(() => {
      this.setAttribute(attrName, getter());
    }, [() => getter()]);
  }

}
