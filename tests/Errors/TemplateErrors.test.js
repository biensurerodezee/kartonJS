import { describe, it, expect } from 'vitest';
import { KartonElement } from '../../KartonElement.js';

describe('Template errors', () => {
  it('throws if template() is not implemented', async () => {
    class NoTemplate extends KartonElement {}

    customElements.define('test-no-template', NoTemplate);

    try {
      const el = document.createElement('test-no-template');
      document.body.appendChild(el);
      await Promise.resolve();
      throw new Error('Expected error for missing template() was not thrown');
    } catch (e) {
      expect(e.message).toMatch(/template/i);
    }
  });
});

