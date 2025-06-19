import { describe, it, expect, beforeEach, vi } from 'vitest';
import { KartonElement, html } from '../../KartonElement.js';

describe('BusState', () => {
  customElements.define('test-bus', class extends KartonElement {
    init() {
      [this.shared, this.setShared] = this.BusState('sharedKey', 1);
    }

    template() {
      return html`${this.shared()}`;
    }
  });

  let el1, el2;

  beforeEach(() => {
    document.body.innerHTML = '';
    el1 = document.createElement('test-bus');
    el2 = document.createElement('test-bus');
    document.body.append(el1, el2);
  });

  it('initializes with the provided initial value', () => {
    expect(el1.shared()).toBe(1);
    expect(el2.shared()).toBe(1);
  });

  it('does not trigger unnecessary updates if value stays the same', async () => {
    const spy = vi.fn();
    spy.mockClear();
    el1.Effect(spy, [el1.shared]);
    el2.setShared(1); // same as initial
    await Promise.resolve();
    expect(spy).toHaveBeenCalledTimes(1); // only initial run
  });

  it('syncs shared state between components', async () => {
    el1.setShared(99);
    await Promise.resolve();
    expect(el2.shared()).toBe(99);
  });

  it('propagates changes in el2 back to el1', async () => {
    el2.setShared(42);
    await Promise.resolve();
    expect(el1.shared()).toBe(42);
  });

  it('removes bus listeners when disconnected', async () => {
    el1.setShared(123);
    document.body.removeChild(el2); // triggers `disconnectedCallback`
    el1.setShared(456);
    await Promise.resolve();
    expect(el2.shared()).not.toBe(456); // el2 is no longer subscribed
  });

  it('re-subscribes when re-added', async () => {
    document.body.removeChild(el2);
    await Promise.resolve(); // give time for unsub to propagate
    el1.setShared(55);
    document.body.append(el2);
    el2.setShared(88);
    await new Promise(r => setTimeout(r, 0));
    expect(el1.shared()).toBe(88);
  });

});

