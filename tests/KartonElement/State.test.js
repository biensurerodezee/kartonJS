import { describe, it, expect, beforeEach } from 'vitest';
import { KartonElement, html, memoryStorage } from '../../KartonElement.js';

describe('State', () => {
  customElements.define('test-state', class extends KartonElement {
    init() {
      [this.count, this.setCount] = this.State('count', 0);
    }

    template() {
      return html`<span>${this.count()}</span>`;
    }
  });

  let el;

  beforeEach(() => {
    document.body.innerHTML = '';
    el = document.createElement('test-state');
    document.body.appendChild(el);
  });

  it('initializes state to the default', () => {
    expect(el.count()).toBe(0);
  });

  it('updates state with setter', async () => {
    el.setCount(42);
    await Promise.resolve();
    expect(el.count()).toBe(42);
  });

  it('reflects attribute if present', () => {
    el.remove();
    el = document.createElement('test-state');
    el.setAttribute('count', '7');
    document.body.appendChild(el);
    expect(el.count()).toBe(7);
  });

  it('initializes State from attribute', async () => {
    customElements.define('test-attr-init', class extends KartonElement {
      static get observedAttributes() { return ['count']; }
      init() {
        const [count] = this.State('count', 0);
        this.count = count;
      }
      template() {
        return html`<p>${this.count()}</p>`;
      }
    });

    const el = document.createElement('test-attr-init');
    el.setAttribute('count', '5');
    document.body.appendChild(el);
    await Promise.resolve();
    expect(el.count()).toBe(5);
  });

  it('initializes State from memoryStorage', async () => {
    memoryStorage.setItem('count', 42);

    customElements.define('test-storage-init', class extends KartonElement {
      init() {
        const [count] = this.State('count', 0);
        this.count = count;
      }
      template() {
        return html`<p>${this.count()}</p>`;
      }
    });

    const el = document.createElement('test-storage-init');
    document.body.appendChild(el);
    await Promise.resolve();
    expect(el.count()).toBe(42);
  });

});

