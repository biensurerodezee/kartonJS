import { describe, it, expect, beforeEach } from 'vitest';
import { KartonElement, html } from '../../KartonElement.js';

describe('SyncAttrEffect', () => {
  customElements.define('test-sync-attr', class extends KartonElement {
    init() {
      [this.status, this.setStatus] = this.State('status', 'ok');
      this.SyncAttrEffect('data-status', this.status);
    }

    template() {
      return html`<div>${this.status()}</div>`;
    }
  });

  let el;

  beforeEach(() => {
    document.body.innerHTML = '';
    el = document.createElement('test-sync-attr');
    document.body.appendChild(el);
  });

  it('syncs attribute with state value', async () => {
    await new Promise(requestAnimationFrame);
    expect(el.getAttribute('data-status')).toBe('ok');

    el.setStatus('fail');
    await new Promise(requestAnimationFrame);
    expect(el.getAttribute('data-status')).toBe('fail');
  });
});

