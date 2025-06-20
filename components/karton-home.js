import { KartonElement, html } from '../KartonElement.js';
import './karton-card.js';

customElements.define('karton-home', class extends KartonElement {
  
  template() {
    return html`
      <karton-card>
        <template slot="header">🌟 Home KartonCard</template>
        <template slot="main">
          <div>
            <p>Home, have fun with this live presentation of components:</p>
            <ul>
              <li><a href="https://kartonjs.surge.sh/examples/card/">card</a></li>
              <li><a href="https://kartonjs.surge.sh/examples/activity-indicator/">activity-indicator</a></li>
              <li><a href="https://kartonjs.surge.sh/examples/status-bar/">status-bar</a></li>
              <li><a href="https://kartonjs.surge.sh/examples/input-area/">input-area</a></li>
              <li><a href="https://kartonjs.surge.sh/examples/toast/">toast</a></li>
              <li><a href="https://kartonjs.surge.sh/examples/router/">router</a></li>
              <li><a href="https://kartonjs.surge.sh/examples/switch/">switch</a></li>
            </ul>
          </div>
        </template>
        <template slot="footer">📎 look at my footer</template>
      </karton-card>
    `;
  }

});

