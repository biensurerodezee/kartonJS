import { KartonElement, html, isDev } from '../../KartonElement.js';
import './karton-card.js';

customElements.define('karton-settings-info', class extends KartonElement {

  template() {
    return html`
      <div>
        <karton-card>
          <template slot="header">Settings Info</template>
          <template slot="main">
          <div>
            <p>
              Welcome to the information about settings.
              Well that was it!
            </p>
          </div>
          </template>
          <template slot="footer"><hr></template>
        </karton-card>
      </div>
    `;
  }

});

