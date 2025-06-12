import { describe, it, expect, beforeEach } from 'vitest';
import { KartonElement, html } from '../../KartonElement.js';

describe('BoolAttrEffect', () => {

  customElements.define('test-attr-toggle', class extends KartonElement {
    init() {
      [this.flag, this.setFlag] = this.State('flag', false);
      this.BoolAttrEffect('checked', this.flag);
    }

    template() {
      return html`<div>Flag is ${this.flag()}</div>`;
    }
  });

  let el;

  beforeEach(() => {
    document.body.innerHTML = ''; // Clear DOM
    el = document.createElement('test-attr-toggle');
    document.body.appendChild(el);
  });

  it('should not have the "checked" attribute initially', () => {
    expect(el.hasAttribute('checked')).toBe(false);
  });

  it('should add "checked" attribute when state is truthy', async () => {
    el.setFlag(true);
    await Promise.resolve(); // allow microtask to flush
    expect(el.hasAttribute('checked')).toBe(true);
  });

  it('should remove "checked" attribute when state is falsy', async () => {
    el.setFlag(true);
    await Promise.resolve(); // flush render
    el.setFlag(false);
    await Promise.resolve();
    expect(el.hasAttribute('checked')).toBe(false);
  });

  it('should react to various truthy values', async () => {
    el.setFlag(1);
    await Promise.resolve();
    expect(el.hasAttribute('checked')).toBe(true);

    el.setFlag('yes');
    await Promise.resolve();
    expect(el.hasAttribute('checked')).toBe(true);
  });

  it('should remove attribute for null or undefined', async () => {
    el.setFlag(null);
    await Promise.resolve();
    expect(el.hasAttribute('checked')).toBe(false);

    el.setFlag(undefined);
    await Promise.resolve();
    expect(el.hasAttribute('checked')).toBe(false);
  });
  
  it('reflects attribute when state changes', async () => {
    customElements.define('test-reflect', class extends KartonElement {
      static get observedAttributes() { return ['active']; }
      init() {
        const [active, setActive] = this.State('active', false);
        this.active = active;
        this.setActive = setActive;
      }
      template() {
        return html`<p>${this.active()}</p>`;
      }
    });

    const el = document.createElement('test-reflect');
    document.body.appendChild(el);
    await Promise.resolve();

    el.setActive(true);
    await Promise.resolve();
    expect(el.getAttribute('active')).toBe('true');
  });

});

