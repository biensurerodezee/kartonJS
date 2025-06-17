import { describe, it, expect } from 'vitest';
import { KartonElement, html } from '../../KartonElement.js';

describe('State errors', () => {
  it('throws if duplicate State keys are used', async () => {
    class DuplicateState extends KartonElement {
      init() {
        this.State('foo', 1);
        this.State('foo', 2); // Should throw
      }
      template() {
        return html``;
      }
    }

    customElements.define('test-dup-state', DuplicateState);

    const el = document.createElement('test-dup-state');
    try {
      document.body.appendChild(el);
      await Promise.resolve(); // Allow lifecycle
      throw new Error('Expected error for duplicate state was not thrown');
    } catch (e) {
      expect(e.message).toMatch(/duplicate/i);
    }
  });

  it('throws if State is called outside init()', async () => {
    class BadState extends KartonElement {
      constructor() {
        super();
        this.State('bad', 1); // Illegal
      }
      template() {
        return html``;
      }
    }

    customElements.define('test-bad-state', BadState);

    try {
      const el = document.createElement('test-bad-state');
      document.body.appendChild(el);
      await Promise.resolve();
      throw new Error('Expected error for calling State outside init was not thrown');
    } catch (e) {
      expect(e.message).toMatch(/init/i);
    }
  });

});

