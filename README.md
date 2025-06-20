# KartonJS 📦

KartonJS is a lightweight, class-based Web Component framework with built-in reactive state, effects, computed values, and a slot-friendly templating system using uhtml.  
Inspired by Lit but with a simpler mental model, it's ideal for building modern web apps without boilerplate.  


## 📦 Exports

- [kartonjs](https://cdn.jsdelivr.net/npm/kartonjs/KartonElement.js) as default { KartonElement, html, logdev, isDev }. `KartonElement` the element to extend for your webcomponents. `html` the uhtml literal function to generate templates to render. `logdev` a logdev("a message") for and on development. `isDev` a boolean rather you are on a local system or live.
- [kartonjs/components/card](https://cdn.jsdelivr.net/npm/kartonjs/components/karton-card) a card with slots in lightDOM.
- [kartonjs/components/input-area](https://cdn.jsdelivr.net/npm/kartonjs/components/karton-input-area) an input textarea wit the comfort of having a value property.
- [kartonjs/components/status-bar](https://cdn.jsdelivr.net/npm/kartonjs/components/karton-card) a status bar with custom message.
- [kartonjs/components/toast](https://cdn.jsdelivr.net/npm/kartonjs/components/karton-card) toasts fully configurable with slots.
- [kartonjs/components/router](https://cdn.jsdelivr.net/npm/kartonjs/components/karton-card) a router that gives you variables and wildcards, configures in JSON format.
- [kartonjs/components/switch](https://cdn.jsdelivr.net/npm/kartonjs/components/karton-card) a switch (show/hide) with equal router functionality, configures also in JSON format.


 

## 🚀 Getting Started

1. Install

Include via CDN:

```html
<script type="module">
import { KartonElement, html } 'https://cdn.jsdelivr.net/npm/kartonjs/KartonElement.js';
</script>

```

Or use locally in a module project:

```bash
npm install kartonjs
```

There is also a npx command to skaffold a `kartonjs` project at once:
```bash
npx create-karton-app my-app
```

2. Create Your First Component

```js
import { KartonElement, html } from 'kartonjs';

class HelloWorld extends KartonElement {
  init() {
    this.State('name', 'World');
  }

  template() {
    return html<p>Hello, ${this.name}!</p>;
  }
}

customElements.define('hello-world', HelloWorld);
```

## 🪜 Examples

- [examples/card/](https://kartonjs.surge.sh/examples/card) a card with slots in lightDOM.


- [kartonjs/components/input-area](https://cdn.jsdelivr.net/npm/kartonjs/components/karton-input-area) an input textarea wit the comfort of having a value property.
- [kartonjs/components/status-bar](https://cdn.jsdelivr.net/npm/kartonjs/components/karton-card) a status bar with custom message.
- [kartonjs/components/toast](https://cdn.jsdelivr.net/npm/kartonjs/components/karton-card) toasts fully configurable with slots.
- [kartonjs/components/router](https://cdn.jsdelivr.net/npm/kartonjs/components/karton-card) a router that gives you variables and wildcards, configures in JSON format.
- [kartonjs/components/switch](https://cdn.jsdelivr.net/npm/kartonjs/components/karton-card) a switch (show/hide) with equal router functionality, configures also in JSON

----------

## 📚 KartonElement API Reference

### constructor()

Initializes the element, sets up private state containers, and attaches light DOM.

```js  
  constructor() {  
    super();  
    this.attachLightDom();  
    // Initializes internal private state and effect arrays  
  }  
```

### attachLightDom()

Called during construction. By default empty because Karton uses light DOM rendering (no shadow DOM).

Override to attach shadow DOM if desired.

```js  
attachLightDom() {  
  // Default: do nothing  
  // Override to attach Shadow DOM, e.g.:  
  // this.attachShadow({ mode: 'open' });  
}  
```

### extractTemplateSlots(host = this)

Extracts `<template slot="...">` elements from the host, parsing JSON if template type is JSON, and returns a map of slot names to content fragments or JSON objects.

```js  
extractTemplateSlots(host = this) {  
  const slotMap = {};  
  const templates = host.querySelectorAll('template[slot]');  
  for (const tmpl of templates) {  
    const name = tmpl.getAttribute('slot');  
    const fragment = tmpl.content.cloneNode(true);  
    if (["application/json", "json"].includes(tmpl.getAttribute('type')?.toLowerCase() || "")) {  
      const rawContent = fragment.textContent;  
      slotMap[name] = this.safeJsonParse(rawContent);  
    } else {  
      slotMap[name] = fragment;  
    }  
    tmpl.remove(); // Remove templates from DOM  
  }  
  return slotMap;  
}  
```

### slot(name)

Returns the stored content for the named slot or fallback content.

```js  
slot(name) {  
  return this.slots[name] || this.defaultContent[name] || "?? undefined slot ??";  
}  
```

### safeJsonParse(json)

Safely parses JSON strings, logs error if failed.

```js  
safeJsonParse(json) {  
  try {  
    return JSON.parse(json);  
  } catch (e) {  
    logdev(`<${this.tagName.toLowerCase()} id=${this.i}> Failed to parse JSON script config within element`, e);  
  return null;  
  }  
}  
```

### connectedCallback()

Lifecycle hook when element is inserted into DOM. Initializes ID, adds devtools integration if in dev mode, calls `init()`, then calls `render()` if a `template` function exists.

```js  
connectedCallback() {  
  this.i = this.id || "anonymous";

  if (isDev) {  
    if (!window.**Karton**) {  
      window.**Karton** = { instances: new Set() };  
    }  
    window.**Karton**.instances.add(this);  
  }

  this.init();

  if (typeof this.template === 'function') {  
    render(this, this.template.bind(this));  
  }  
}  
```

### disconnectedCallback()

Cleanup lifecycle hook: unsubscribes all listeners, cleans up effects, removes from devtools.

```js  
disconnectedCallback() {  
  for (const unsub of this.#unsubscribers) unsub();  
  this.#unsubscribers = [];

  window.**Karton**?.instances.delete(this);

  for (const { label, cleanup } of this.#effects) {  
    logdev(`<${this.tagName.toLowerCase()} id=${this.i}> Cleaning up effect: ${label}`);  
    if (typeof cleanup === 'function') cleanup();  
  }  
  this.#effects = [];  
}  
```

### init()

User-overridable method for initialization logic.

```js  
init() {  
  // Override in subclasses  
}  
```

### coerce(value)

Coerces string attribute values to native types:

-   `"true"` → `true`
    
-   `"false"` → `false`
    
-   numeric strings → `Number`
    
-   else returns original string
    

```js  
coerce(v) {  
  if (v === 'true') return true;  
  if (v === 'false') return false;  
  if (!isNaN(parseFloat(v)) && isFinite(v)) return Number(v);  
  return v;  
}  
```

### State(key, initialValue, storage = this.Storage)

Creates a reactive state signal for `key`. Initialized from attribute, storage, or initial value. Reflects changes to attribute and storage. Returns `[getter, setter]`.

```js  
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
```

### BusState(key, initialValue, storage = this.Storage)

Creates a globally shared reactive state with pub/sub synchronization. Returns `[getter, setter]`.

```js  
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
```

### StateSignal(initialValue)

Creates an isolated reactive signal without storage or attribute reflection.

```js  
StateSignal(initialValue) {  
  const s = signal(initialValue);  
  return [() => s.value, v => s.value = v];  
}  
```

### reflectAttribute(key, val)

Reflects a state value to an observed attribute (if it exists).

```js  
reflectAttribute(key, val) {  
  let oAttr = this.constructor.observedAttributes || [];  
  if (oAttr.includes(key) && val !== null) {  
    return this.setAttribute(key, val);  
  }  
  return;  
}  
```

### attributeChangedCallback(name, oldValue, newValue)

Called on attribute changes. Coerces and updates internal state and publishes changes on the bus.

```js  
attributeChangedCallback(name, oldValue, newValue) {  
  if (oldValue === newValue) return;  
  logdev(`<${this.tagName.toLowerCase()} id=${this.i}> '${name}' attributeChanged:`, oldValue, '→', newValue);

  const coerced = this.coerce(newValue) || (this.hasAttribute(name) && this.getAttribute(name) !== 'false');  
  if (name in this.#state && this.#state[name].value !== coerced) {  
    this.#state[name].value = coerced;  
    stateBus.publish(name, coerced);  
  }  
}  
```

### Effect(fn, depsOrLabel)

Runs a reactive effect, optionally tracking dependencies and supports cleanup.

```js  
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
    deps.map(d => d()); // track dependencies  
    return run();  
  })  
  : effect(run);

  this.#effects.push({ label, cleanup });  
}  
```

### Computed(computeFn, key)

Creates a cached computed signal based on `computeFn`. Returns a getter function.

```js  
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
```

BoolAttrEffect(attr, getter)

Adds or removes a boolean attribute reactively based on a getter function.

```js
BoolAttrEffect(attr, getter) {
  this.Effect(() => {
    const val = getter();
    if (val === false || val === null || val === undefined) {
      this.removeAttribute(attr);
      logdev(<${this.tagName.toLowerCase()} id=${this.i}> attribute '${attr}' removed);
    } else {
      this.setAttribute(attr, '');
      logdev(<${this.tagName.toLowerCase()} id=${this.i}> attribute '${attr}' added);
    }
  }, [getter]);
}
```
SyncAttrEffect(attrName, getter)

Keeps a string attribute in sync with a reactive getter function.

```js
SyncAttrEffect(attrName, getter) {
    this.Effect(() => {
    this.setAttribute(attrName, getter());
  }, [() => getter()]);
}
```


## License

MIT © Biensure Rodezee

