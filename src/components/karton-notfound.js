import { KartonElement, html } from '../../KartonElement.js';

customElements.define('karton-notfound', class extends KartonElement {

  template() {
    return html`<p>404: Page not found</p>`;
  }

});

