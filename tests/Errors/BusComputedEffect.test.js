import { describe, it, expect, vi } from 'vitest';
import { KartonElement, BusState } from '../../KartonElement.js';

class BusComponent extends KartonElement {
  init() {
    const [getCount, setCount] = this.BusState('sharedCount', 0);
    this.getCount = getCount;
    this.setCount = setCount;

    this.getDouble = this.Computed(() => getCount() * 2, 'double');

    this.spy = vi.fn();
    this.Effect(() => this.spy(this.getDouble()), 'doubleEffect');
  }
}

customElements.define('bus-component', BusComponent);

describe('KartonElement + BusState + Computed + Effect', () => {
  it('runs effect on initial BusState computed value', () => {
    const el = new BusComponent();
    document.body.appendChild(el);

    expect(el.spy).toHaveBeenCalledTimes(1);
    expect(el.spy).toHaveBeenCalledWith(0);

    el.remove();
  });

  it('re-runs effect when BusState changes', async () => {
    const el = new BusComponent();
    document.body.appendChild(el);
    el.spy.mockClear();

    el.setCount(3); // sharedCount = 3 → double = 6
    await Promise.resolve();

    expect(el.getDouble()).toBe(6);
    expect(el.spy).toHaveBeenCalledTimes(1);
    expect(el.spy).toHaveBeenCalledWith(6);

    el.remove();
  });

  it('effect does not re-run when computed value is unchanged', async () => {
    const el = new BusComponent();
    document.body.appendChild(el);
    el.setCount(2);
    await Promise.resolve();

    el.spy.mockClear();
    el.setCount(2); // same value → no change
    await Promise.resolve();

    expect(el.spy).not.toHaveBeenCalled();

    el.remove();
  });

  it('multiple components react to shared BusState', async () => {
    const el1 = new BusComponent();
    const el2 = new BusComponent();
    document.body.append(el1, el2);

    el1.spy.mockClear();
    el2.spy.mockClear();

    el1.setCount(5);
    await Promise.resolve();

    expect(el1.getDouble()).toBe(10);
    expect(el2.getDouble()).toBe(10);

    expect(el1.spy).toHaveBeenCalledWith(10);
    expect(el2.spy).toHaveBeenCalledWith(10);

    expect(el1.spy).toHaveBeenCalledTimes(1);
    expect(el2.spy).toHaveBeenCalledTimes(1);

    el1.remove();
    el2.remove();
  });
});

