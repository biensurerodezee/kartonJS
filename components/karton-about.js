import { KartonElement, html, logdev } from '../KartonElement.js';

customElements.define('karton-about', class extends KartonElement {
  
  init() {
    logdev(this);
    //this.wild = this
  }
  
  template() {
    return html`<p>About KartonJS, it was always light and it wraps up!</p>`;
  }

});

