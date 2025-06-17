# KartonJS

`KartonJS` is a minimalist, reactive base class for building fast, maintainable Web Components.  
It provides fine-grained reactive state, computed properties, effect hooks, and declarative attribute reflection — all powered by `uhtml` signals and reactive primitives.

---

## Table of Contents

- [Features](#features)  
- [Installation](#installation)  
- [Getting Started](#getting-started)  
- [API](#api)  
  - [`State`](#statekey-initialvalue-storage)  
  - [`BusState`](#busstatekey-initialvalue-storage)  
  - [`StateSignal`](#statesignalinitialvalue)  
  - [`Computed`](#computedcomputefn-key)  
  - [`Effect`](#effectfn-depsorlabel)  
  - [`BoolAttrEffect`](#boolattreffectattr-getter)  
  - [`SyncAttrEffect`](#syncattreffectattrname-getter)  
- [Advanced Usage](#advanced-usage)  
- [Development](#development)  
- [Contributing](#contributing)  
- [License](#license)  

---

## Features

- **Reactive State** — easily create reactive properties linked to attributes and persistent storage.  
- **Global Shared State** — via a built-in pub/sub Bus system for sync across components.  
- **Computed Values** — derive reactive values from other reactive state.  
- **Effect Hooks** — declarative side effects with automatic dependency tracking.  
- **Attribute Reflection** — sync boolean and regular attributes with state seamlessly.  
- **Lightweight & Minimal** — built on top of `uhtml`, no heavy dependencies.  
- **Slots and Template Parsing** — support for content projection and JSON config parsing.  
- **Works with Shadow or Light DOM** — flexible rendering strategies.

---

## Installation

Install the dependency required by `KartonJS`:

```bash
npm install kartonjs
# or
yarn add kartonjs
```

Then import `KartonElement` and extend it in your own components:

```js
import { KartonElement, html } from './KartonElement.js';
```

---

## Getting Started

Here is a simple counter component using `KartonElement`:

```js
import { KartonElement, html } from './KartonElement.js';

class MyCounter extends KartonElement {
  static observedAttributes = ['count'];

  init() {
    // Initialize reactive state 'count' with default 0
    const [getCount, setCount] = this.State('count', 0);
    this.getCount = getCount;
    this.setCount = setCount;
  }

  template() {
    return html\`
      <div>
        <p>Count: \${this.getCount()}</p>
        <button @click=\${() => this.setCount(this.getCount() + 1)}>Increment</button>
      </div>
    \`;
  }
}

customElements.define('my-counter', MyCounter);
```

Use it in HTML:

```html
<my-counter></my-counter>
```

---

## API

### `State(key, initialValue, storage = this.Storage)`

Creates a reactive state signal tied to a key.  
- Initializes from attribute, then storage, then fallback to `initialValue`.  
- Automatically reflects changes to attributes and storage.  
- Returns `[getter, setter]` tuple.

```js
const [getValue, setValue] = this.State('myKey', 'default');
```

---

### `BusState(key, initialValue, storage = this.Storage)`

Similar to `State()`, but state is shared globally across all components via a pub/sub bus.  
Updates in one component sync across others.

```js
const [getShared, setShared] = this.BusState('sharedKey', 42);
```

---

### `StateSignal(initialValue)`

Creates a standalone reactive signal not tied to attribute or storage.

```js
const [getVal, setVal] = this.StateSignal('hello');
```

---

### `Computed(computeFn, key)`

Creates a computed reactive property derived from other signals.

```js
const getComputed = this.Computed(() => this.getCount() * 2, 'doubleCount');
console.log(getComputed()); // reactive computed value
```

---

### `Effect(fn, depsOrLabel)`

Runs a side-effect function reactively, rerunning when dependencies change.

```js
this.Effect(() => {
  console.log('Count changed:', this.getCount());
}, [this.getCount]);
```

---

### `BoolAttrEffect(attr, getter)`

Reflects a boolean attribute based on the `getter` value.

```js
this.BoolAttrEffect('disabled', () => this.getCount() > 5);
```

---

### `SyncAttrEffect(attrName, getter)`

Reflects an attribute with a value returned by `getter`.

```js
this.SyncAttrEffect('aria-label', () => \`Count is \${this.getCount()}\`);
```

---

## Advanced Usage

- Use `extractTemplateSlots()` to extract `<template slot="...">` content for flexible slot management.  
```html
<!-- Example KartonCard Configuration --> 
<karton-card>
  <template slot="header">🌟 My Header</template>
  <template slot="main">
    <div>
      <p>Welcome to the beginning body!</p>
      <p>Welcome to the main body!</p>
      <p>Welcome to the end of the body!</p>
    </div>
  </template>
  <template slot="footer">📎 Footer content</template>
</karton-card>
```
[Example with Card](https://kartonjs.surge.sh/examples/card/)

- Use `parseScriptConfig()` to parse embedded JSON configuration from a `<script type="application/json">` element inside your component.
```html
<!-- Example KartonRouter Configuration --> 
<karton-router>
  <script type="application/json">
    [
      { "path": "/", "component": "karton-home", "title": "Home - Karton App" },
      { "path": "counter/:id", "component": "karton-counter", "title": "Counter" },
      { "path": "settings/:section", "component": "karton-settings", "title": "Settings" },
      { "path": "about/*", "component": "karton-about", "title": "About Us" },
      { "path": "*", "component": "karton-notfound", "title": "Not Found" }
    ]
  </script>
</karton-router>
```
[Example with Router](https://kartonjs.surge.sh/examples/router/)

---

## Development

- The class logs debug info when served on localhost or 127.0.0.1.  
- Dev logs can be enabled/disabled via the `isDev` flag.  
- State is persisted by default in `memoryStorage`, but can be overridden.

Like this:
```js
import { KartonElement, html, logdev, isDev, memoryStorage } from './KartonElement.js';

class MyCounter extends KartonElement {
  static observedAttributes = ['count'];

  init() {
    // this changes the default State and BusState storage to localStorage
    isDev && this.Storage = localStorage; // or sessionStorage // default is memoryStorage
    
    // log memoryStorage on non-dev env
    !isDev && console.log(memoryStorage);
    

    
    // Initialize reactive state 'count' with default 0
    const [getCount, setCount] = this.State('count', 0);
    // log on DEV only
    logdev("Hello DEV this is the current count", getCount());
    
    this.getCount = getCount;
    this.setCount = setCount;
    
  }

  template() {
    return html\`
      <div>
        <p>Count: \${this.getCount()}</p>
        <button @click=\${() => this.setCount(this.getCount() + 1)}>Increment</button>
      </div>
    \`;
  }
}

customElements.define('my-counter', MyCounter);
```

---

## Contributing

Feel free to open issues or PRs on the repository.

---

## License

MIT License

---

