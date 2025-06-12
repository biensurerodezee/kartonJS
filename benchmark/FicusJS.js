import { createCustomElement } from 'https://cdn.skypack.dev/ficusjs@3/custom-element'

createCustomElement('ficus-hello', {
  render () {
    let name = 'World';
    return `<div>Hello ${name}</div>`;
  }
});

