import { KartonElement, html, isDev } from '../KartonElement.js';
import './components/karton-home.js';
import './components/karton-settings.js';
import './components/karton-about.js';
import './components/karton-notfound.js';
import './components/karton-counter.js';
import './components/karton-router.js';

customElements.define('karton-app', class extends KartonElement {

  init() {
    // route State
    [this.route, this.setRoute] = this.BusState('route');

    // color theme State
    [this.colorTheme, this.setColorTheme] = this.BusState('colorTheme', null, localStorage);
    this.Effect(() => {
      document.body.className = this.colorTheme();
    }, [this.colorTheme], 'color-theme');

  }

  template() {
    return html`
      <header>
        <h5>${this.getAttribute('title')}</h5>
      </header>
      <nav>
        <button @click=${() => this.setRoute('/')}>Home 🛖</button>
        <a href="/counter/kc">Counter 🧮</a>
        <button @click=${() => this.setRoute('/settings/info')}>Settings ℹ️</button>
        <a href="/settings/color">Settings 🎨</a>
        <button @click=${() => document.querySelector("karton-router").setRoute("/about/us/and/some more")}>About 📄</button>
      </nav>
      <main>
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
      </main>
      <footer>
        <div>${this.getAttribute('footnote')}</div>
      </footer>
    `;
  }
  
});

