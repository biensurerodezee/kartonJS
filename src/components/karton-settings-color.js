import { KartonElement, html, isDev } from '../../KartonElement.js';
import './karton-card.js';

customElements.define('karton-settings-color', class extends KartonElement {

  init() {
    // uncomment to use localStorage instead of default memoryStorage for States
    this.Storage = localStorage; // or sessionStorage

    // color theme State
    [this.colorTheme, this.setColorTheme] = this.BusState('colorTheme');
    
    requestAnimationFrame(() => {
      document.querySelector('#colorThemeSelect').value = this.colorTheme();
      document.querySelector('#colorThemeSelect').setCustomValidity("Invalid field.");
    });
    
  }

  template() {
    return html`
      <div>
        <karton-card>
          <template slot="header">Theme Color</template>
          <template slot="main">
          <div>
            <p>
              <label>color theme</label>
              <select id="colorThemeSelect" onchange="document.querySelector('karton-settings-color').setColorTheme(this.value)">
                <option value="light">light</option>
                <option value="dark">dark</option>
              </select>
            </p>
          </div>
          </template>
          <template slot="footer">you choose</template>
        </karton-card>
      </div>
    `;
  }

});
