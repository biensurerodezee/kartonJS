import { KartonElement, html } from '../KartonElement.js';

/*
// 1. import
import './components/karton-card.js';

// 2. configure 
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
*/

export class KartonCard extends KartonElement {
  init() {
    // Extract slotted content just like native slots
    const slots = this.slots = this.extractTemplateSlots();

    // Content Defaults
    this.defaultContent = {
      header: document.createTextNode("header default"),
      main: document.createElement('div').appendChild(document.createTextNode('main default')).parentNode,
      footer: document.createTextNode("footer default")
    };    
  }

  template() {
    return html`
      <div class="card">
        <header>${this.slot('header')}</header>
        <main>${this.slot('main')}</main>
        <footer>${this.slot('footer')}</footer>
      </div>
    `;
  }
}

customElements.define('karton-card', KartonCard);

