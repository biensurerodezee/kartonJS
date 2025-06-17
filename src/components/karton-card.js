import { KartonElement, html } from '../../KartonElement.js';

/*
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
*/

customElements.define('karton-card', class extends KartonElement {
  init() {
    // Extract slotted content just like native slots
    const slots = this.slots = this.extractTemplateSlots();

    // Content Defaults
    this.defaultContent = {
      header: document.createTextNode("header default"),
      main: document.createElement('div').appendChild(document.createTextNode('-')).parentNode,
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
});

