import { KartonElement, html, isDev } from '../../../KartonElement.js';
import '../../../src/components/karton-home.js';
import '../../../src/components/karton-settings.js';
import '../../../src/components/karton-about.js';
import '../../../src/components/karton-notfound.js';
import '../../../src/components/karton-counter.js';
import '../../../src/components/karton-switch.js';

customElements.define('karton-app', class extends KartonElement {

  init() {
    // route State
    [this.route, this.setRoute] = this.BusState('route', location.pathname + location.search);

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
        <a href="/examples/switch/counter/kc">Counter 🧮</a>
        <button @click=${() => this.setRoute('/settings/info')}>Settings ℹ️</button>
        <a href="/examples/switch/settings/color">Settings 🎨</a>
        <button @click=${() => document.querySelector("karton-switch").setRoute("/about/us/and/some more")}>About 📄</button>
      </nav>
      <main>
        <karton-switch base-path="/examples/switch"> <!-- For no local a href preventDefault, add attribute: disable-router-links -->
          <template slot="routes" type="application/json">
            [
              { "path": "/", "component": "karton-home", "title": "Home - Karton App" },
              { "path": "counter/:id", "component": "karton-counter", "title": "Counter" },
              { "path": "settings/:section", "component": "karton-settings", "title": "Settings" },
              { "path": "about/*", "component": "karton-about", "title": "About Us" },
              { "path": "*", "component": "karton-notfound", "title": "Not Found" }
            ]
          </template>
        </karton-switch>
      </main>
      <footer>
        <div>${this.getAttribute('footnote')}</div>
      </footer>
    `;
  }
  
});

