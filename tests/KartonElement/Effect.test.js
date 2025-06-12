import { describe, it, expect, beforeEach } from 'vitest';
import { KartonElement, html } from '../../KartonElement.js';

describe('Effect', () => {
  customElements.define('test-effect', class extends KartonElement {
    init() {
      [this.flag, this.setFlag] = this.State('flag', false);
      this.runCount = 0;
      this.Effect(() => {
        this.runCount++;
      }, [this.flag], { immediate: true });
    }

    template() {
      return html`<div>${this.flag()}</div>`;
    }
  });

  let el;

  beforeEach(() => {
    document.body.innerHTML = '';
    el = document.createElement('test-effect');
    document.body.appendChild(el);
  });

  it('runs effect initially and on change', async () => {
    await new Promise(requestAnimationFrame); // Wait for initial effect
    expect(el.runCount).toBe(1);
    el.setFlag(true);
    await new Promise(requestAnimationFrame);
    expect(el.runCount).toBe(2);
  });
});

