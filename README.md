# KartonJS

A lightweight, reactive web component framework using native custom elements and `uhtml` for fast, declarative rendering.

---

## Features

- Simple and minimal API inspired by Lit and FicusJS
- Reactive state and computed properties
- Light DOM rendering with `uhtml`
- Easy attribute and property synchronization
- Supports slots and Shadow DOM
- Built-in dev tools integration

---

## Installation

Install via npm:

```bash
npm install kartonjs
```
Or use a CDN for quick experiments:
```javascript
<script type="module" src="https://cdn.jsdelivr.net/npm/kartonjs/dist/karton.js"></script>
```

---

## Basic Usage

Create a custom element by extending KartonElement:

import { KartonElement, html } from 'kartonjs';

class MyElement extends KartonElement {
  template() {
    return html`<p>Hello KartonJS!</p>`;
  }
}

customElements.define('my-element', MyElement);

Use it in HTML:
```html
<my-element></my-element>
```

---

## Development

    Use your favorite bundler or dev server (e.g., Vite, Webpack)

    Write components in ES modules

    Enjoy hot reload and reactive updates

---

## Documentation

For detailed docs and examples, visit the KartonJS GitHub repository.
Contributing

Contributions are welcome! Please submit issues or pull requests.

---

## License

MIT © Your Name

---

Let me know if you want me to generate this as a `.md` file or add anything specific!
