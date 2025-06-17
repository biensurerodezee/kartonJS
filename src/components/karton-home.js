import { KartonElement, html, logdev } from '../../KartonElement.js';

customElements.define('karton-home', class extends KartonElement {
  
  template() {
    return html`<p>Home, have fun with this example app!</p>`;
  }

});

