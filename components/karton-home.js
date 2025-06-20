import { KartonElement, html } from '../KartonElement.js';
import './karton-card.js';

customElements.define('karton-home', class extends KartonElement {
  
  template() {
    return html`
      <karton-card>
        <template slot="header">🌟 Home KartonCard</template>
        <template slot="main">
          <div>
            <p>Home, have fun with this example app!</p>
          </div>
        </template>
        <template slot="footer">📎 look at my footer</template>
      </karton-card>
    `;
  }

});

