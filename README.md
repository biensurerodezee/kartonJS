# 🧱 KartonJS App

A modern, minimalist web app built with KartonJS — a lightweight web component framework. This app features:

    💡 Declarative UI using tagged template literals

    🔁 Reactive State system

    🔗 Parameterized client-side routing

    🧩 Modular components (<karton-home>, <karton-counter>, etc.)

    ⚡ Fast navigation with no reloads

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


📁 Project Structure

.
├── index.html
├── src/
│   ├── index.js                # Main app definition (`<karton-app>`)
│   ├── KartonElement.js        # Core KartonJS library
│   └── components/
│       ├── karton-home.js
│       ├── karton-counter.js
│       ├── karton-settings.js
│       ├── karton-about.js
│       └── karton-notfound.js

🚀 Getting Started
Prerequisites

No build step needed. Just serve with a local server (e.g. using VS Code Live Server, Python, or Vite).
Example using Python

python3 -m http.server 8080

Then visit: http://localhost:8080
## 🧠 Core Concepts

##🧩 KartonElement

Custom elements are defined by extending KartonElement. This class provides:

    State() for local reactive state

    html for templating (based on uhtml)

    router for SPA-like navigation

    Optional localStorage/sessionStorage persistence

🔀 Routing

KartonJS includes a lightweight router:

router.define({
  '/': () => setRoute({ page: 'home', params: {} }),
  '/counter/:id/:id2': (params) => setRoute({ page: 'counter', params }),
  '/settings/:section': (params) => setRoute({ page: 'settings', params }),
  '/about/:topic': (params) => setRoute({ page: 'about', params }),
  '/wild/*rest': (params) => setRoute({ page: 'wild', params }),
}, () => setRoute({ page: 'notfound', params: {} }));

✅ Features:

    Supports multiple dynamic parameters (/counter/:id/:id2)

    Named params passed to handler as object (params.id, params.section, etc.)

    Wildcard support (*rest captures the rest of the path as a string)

    Automatic fallback to notfound

Navigation

Use:

router.navigate('/counter/42/abc');

or bind to elements:

<button @click=${() => router.navigate('/about/us')}>About</button>

🔄 Reactive State

[this.route, this.setRoute] = this.State('route', { page: 'home', params: {} });

State updates automatically trigger DOM re-render. State can be persisted:

this.Storage = localStorage; // or sessionStorage

✨ Example: Main Component

customElements.define('karton-app', class extends KartonElement {
  init() {
    [this.route, this.setRoute] = this.State('route', { page: 'home', params: {} });

    router.define({
      '/': () => this.setRoute({ page: 'home', params: {} }),
      '/counter/:id/:id2': (params) => this.setRoute({ page: 'counter', params }),
      '/settings/:section': (params) => this.setRoute({ page: 'settings', params }),
      '/about/:topic': (params) => this.setRoute({ page: 'about', params }),
      '/wild/*rest': (params) => this.setRoute({ page: 'wild', params }),
    }, () => this.setRoute({ page: 'notfound', params: {} }));
  }

  template() {
    return html`
      <nav>
        <button @click=${() => router.navigate('/')}>Home</button>
        <button @click=${() => router.navigate('/counter/123/xyz')}>Counter</button>
        <button @click=${() => router.navigate('/settings/profile')}>Settings</button>
        <button @click=${() => router.navigate('/about/contact')}>About</button>
        <button @click=${() => router.navigate('/wild/anything/goes/here')}>Wildcard</button>
      </nav>

      <main>
        ${this.route().page === 'home' ? html`<karton-home />` : ''}
        ${this.route().page === 'counter' ? html`
          <karton-counter id="${this.route().params.id}" id2="${this.route().params.id2}" />
        ` : ''}
        ${this.route().page === 'settings' ? html`
          <karton-settings section="${this.route().params.section}" />
        ` : ''}
        ${this.route().page === 'about' ? html`
          <karton-about topic="${this.route().params.topic}" />
        ` : ''}
        ${this.route().page === 'wild' ? html`
          <div>Wildcard path: ${this.route().params.rest}</div>
        ` : ''}
        ${this.route().page === 'notfound' ? html`<karton-notfound />` : ''}
      </main>
    `;
  }
});

🔧 Components

Each component is a custom element extending KartonElement and defining a template().

Example:

customElements.define('karton-counter', class extends KartonElement {
  template() {
    return html`<h1>Counter Page - ID: ${this.getAttribute('id')}</h1>`;
  }
});

🛠 Development Tips

    Use browser DevTools + localStorage.clear() to reset app state

    To debug route updates, log this.route() in template()

    Define reusable State()s for global state if needed

📦 Deployment

No build step required. You can host on any static file host like GitHub Pages, Netlify, Vercel.
🧪 Testing

Coming soon. You can use Vitest or plain JS DOM for unit testing custom elements.
📄 License

MIT — use freely, attribute where due.

Let me know if you'd like a version with screenshots, example apps, or how to extend this architecture with plugins or global effects.
