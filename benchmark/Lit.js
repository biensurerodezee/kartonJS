import { LitElement, html } from 'https://esm.sh/lit';

class LitHello extends LitElement {
  static properties = {
    name: {}
  };

  constructor() {
    super();
    this.name = 'World';
  }

  render() {
    return html`<div>Hello ${this.name}</div>`;
  }
}
customElements.define('lit-hello', LitHello);

