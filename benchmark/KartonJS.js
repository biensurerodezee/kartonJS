import { KartonElement, html } from '../KartonElement.js';

class KartonHello extends KartonElement {
  init() {
    [this.name, this.setName] = this.State('name', 'World');
  }

  template() {
    return html`<div>Hello ${this.name()}</div>`;
  }
}

customElements.define('karton-hello', KartonHello);

