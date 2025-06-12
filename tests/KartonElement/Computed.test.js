import { describe, it, expect, beforeEach } from 'vitest';
import { KartonElement, html } from '../../KartonElement.js';

describe('Computed', () => {
  customElements.define('test-computed', class extends KartonElement {
    init() {
      [this.a, this.setA] = this.State('a', 1);
      [this.b, this.setB] = this.State('b', 2);
      this.sum = this.Computed(() => this.a() + this.b(), 'sum');
    }

    template() {
      return html`<div>${this.sum()}</div>`;
    }
  });

  let el;

  beforeEach(() => {
    document.body.innerHTML = '';
    el = document.createElement('test-computed');
    document.body.appendChild(el);
  });

  it('computes derived value correctly', () => {
    expect(el.sum()).toBe(3);
  });

  it('updates computed when dependencies change', async () => {
    el.setA(5);
    el.setB(10);
    await Promise.resolve();
    expect(el.sum()).toBe(15);
  });
  
  it('updates Computed state on dependency change', async () => {
    customElements.define('test-computed-2', class extends KartonElement {
      init() {
        const [a, setA] = this.StateSignal(2);
        this.a = a;
        this.setA = setA;
        this.double = this.Computed(() => a() * 2, 'double');
      }
      template() {
        return html`<p>${this.double()}</p>`;
      }
    });

    const el = document.createElement('test-computed-2');
    document.body.appendChild(el);
    await Promise.resolve();

    expect(el.double()).toBe(4);
    el.setA(5);
    await Promise.resolve();
    expect(el.double()).toBe(10);
  });
  
});

