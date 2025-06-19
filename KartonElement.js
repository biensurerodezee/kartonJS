import { effect, signal, computed } from 'uhtml/signal';
import { reactive, html } from 'uhtml/reactive';

// define Renderer
const render = reactive(effect); // 🆕 replaces uhtmlRender

// HTML
export { html };

// DEV env
export const isDev = location.hostname === 'localhost' || location.hostname === '127.0.0.1';
//export const isDev = false;

// logdev
export const logdev = (...m) => (isDev) && console.debug(`[KartonJS]`, ...m);

// memoryStorage 
export const memoryStorage = {
  items: {},
  setItem: (key, value) => memoryStorage.items[key] = value,
  getItem: (key) => memoryStorage.items[key] || null,
  removeItem: (key) => delete memoryStorage[key],
  clear: () => memoryStorage.items = {}
};

// wait for requestAnimationFrame
export async function sleepUntilAnimationFrame() { 
  await new Promise(requestAnimationFrame);
  return true;
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
        return true;
      } else {
        return;
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

  $ = (s) => document.querySelector(s);  
  $$ = (s) => document.querySelectorAll(s);

  constructor() {
    super();
    this.attachLightDom();
  }

  attachLightDom() {
    // optional: you can just use `this` since it's light DOM by default
  }

  extractTemplateSlots(host = this) {
    const slotMap = {};
    const templates = host.querySelectorAll('template[slot]');
    for (const tmpl of templates) {
      const name = tmpl.getAttribute('slot');
      const fragment = tmpl.content.cloneNode(true);
      if( ["application/json", "json"].includes(tmpl.getAttribute('type')?.toLowerCase() || "") ) {
        const rawContent = fragment.textContent;
        slotMap[name] = this.safeJsonParse(rawContent);
      } else {
        slotMap[name] = fragment;
      }
      tmpl.remove(); // Optional: remove templates so they don't render in DOM
    }
    
    return slotMap;
  }
  
  slot(name) {
    return this.slots[name] || this.defaultContent[name] || "?? undefined slot ??";
  }
  
  safeJsonParse(json) {
      try {
        return JSON.parse(json);
      } catch (e) {
        logdev(`<${this.tagName.toLowerCase()} id=${this.i}> Failed to parse JSON script config within element`, e);
        return null;
      }
  }

  connectedCallback() {
    // Define i
    this.i = this.id || "anonymous";
  
    // Define Development tools integration
    if (isDev) {
      if (!window.__Karton__) {
        window.__Karton__ = { instances: new Set() };
      }
      window.__Karton__.instances.add(this);
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
      logdev(`<${this.tagName.toLowerCase()} id=${this.i}> Cleaning up effect: ${label}`);
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
        value = this.coerce(this.getAttribute(key)) || this.hasAttribute(key) && this.getAttribute(key) !== 'false';
        logdev(`<${this.tagName.toLowerCase()} id=${this.i}> State '${key}' initialized by getAttribute:`, value);
      } else if (storage.getItem(key) !== null) {
        value = this.coerce(storage.getItem(key));
        logdev(`<${this.tagName.toLowerCase()} id=${this.i}> State '${key}' initialized by Storage:`, value);
      } else {
        value = initialValue;
        logdev(`<${this.tagName.toLowerCase()} id=${this.i}> State '${key}' initialized by initialValue:`, value);
      }

      const s = signal(value);
      this.#state[key] = s;

      const cleanup = effect(() => {
        logdev(`<${this.tagName.toLowerCase()} id=${this.i}> State '${key}' changed: `, s.value);
        this.reflectAttribute(key, s.value) && logdev(`attribute reflected '${key}':`, s.value);
        storage.setItem(key, s.value) && logdev(`stored in Storage '${key}':`, s.value);
      });

      this.#effects.push({ label: `state:${key}`, cleanup });
    }

    const s = this.#state[key];
    return [() => s.value, v => s.value = v];
  }

  BusState(key, initialValue, storage = this.Storage) {
    let s;
    const alreadyExists = key in this.#state;
    if (!alreadyExists) {
      let value;
      if (this.hasAttribute(key)) {
        value = this.coerce(this.getAttribute(key)) || this.hasAttribute(key) && this.getAttribute(key) !== 'false';
        logdev(`<${this.tagName.toLowerCase()} id=${this.i}> BusState '${key}' initialized by getAttribute:`, value);
      } else if (storage.getItem(key) !== null) {
        value = this.coerce(storage.getItem(key));
        logdev(`<${this.tagName.toLowerCase()} id=${this.i}> BusState '${key}' initialized by Storage:`, value);
      } else {
        value = initialValue;
        logdev(`<${this.tagName.toLowerCase()} id=${this.i}> BusState '${key}' initialized by initialValue:`, value);
      }
      s = signal(value);
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
        logdev(`<${this.tagName.toLowerCase()} id=${this.i}> BusState '${key}' changed:`, s.value);
        stateBus.publish(key, s.value) && logdev(`PUB '${key}':`, s.value);
        this.reflectAttribute(key, s.value) && logdev(`attribute reflected '${key}':`, s.value);
        storage.setItem(key, s.value) && logdev(`stored in Storage '${key}':`, s.value);
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
    if (oAttr.includes(key) && val !== null) {
      return this.setAttribute(key, val);
    } else {
      return;
    }
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) return;
    logdev(`<${this.tagName.toLowerCase()} id=${this.i}> '${name}' attributeChanged:`, oldValue, '→', newValue);

    const coerced = this.coerce(newValue) || this.hasAttribute(name) && this.getAttribute(name) !== 'false';
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
      logdev(`<${this.tagName.toLowerCase()} id=${this.i}> Effect Triggered: ${label}`);
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
        logdev(`<${this.tagName.toLowerCase()} id=${this.i}> '${key}' computed updated:`, val);
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
        logdev(`<${this.tagName.toLowerCase()} id=${this.i}> attribute '${attr}' removed`);
      } else {
        this.setAttribute(attr, '');
        logdev(`<${this.tagName.toLowerCase()} id=${this.i}> attribute '${attr}' added`);
      }
    }, [getter]);
  }

  SyncAttrEffect(attrName, getter) {
    this.Effect(() => {
      this.setAttribute(attrName, getter());
    }, [() => getter()]);
  }

}
