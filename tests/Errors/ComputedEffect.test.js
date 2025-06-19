import { describe, it, expect, vi } from 'vitest';
import { KartonElement } from '../../KartonElement.js';

class TestComponent extends KartonElement {
  init() {
    const [getA, setA] = this.State('a', 1);
    const [getB, setB] = this.State('b', 2);
    this.getA = getA;
    this.setA = setA;
    this.getB = getB;
    this.setB = setB;

    this.getSum = this.Computed(() => getA() + getB(), 'sum');

    this.spy = vi.fn();
    this.Effect(() => this.spy(this.getSum()), 'sumEffect');
  }
}

customElements.define('test-computed-effect', TestComponent);

describe('KartonElement.Computed + Effect', () => {
  it('runs effect on initial computed value', async () => {
    const el = new TestComponent();
    document.body.appendChild(el);

    expect(el.spy).toHaveBeenCalledTimes(1);
    expect(el.spy).toHaveBeenCalledWith(3);

    el.remove();
  });

  it('re-runs effect when computed changes', async () => {
    const el = new TestComponent();
    document.body.appendChild(el);

    el.spy.mockClear();

    el.setA(4); // now sum = 6
    await Promise.resolve(); // wait for effect cycle

    expect(el.getSum()).toBe(6);
    expect(el.spy).toHaveBeenCalledTimes(1);
    expect(el.spy).toHaveBeenCalledWith(6);

    el.remove();
  });

  it('does not re-run effect when computed value stays the same', async () => {
    const el = new TestComponent();
    document.body.appendChild(el);

    el.spy.mockClear();

    el.setA(1); // same as initial value → sum remains 3
    await Promise.resolve();

    expect(el.getSum()).toBe(3);
    expect(el.spy).toHaveBeenCalledTimes(1);

    el.remove();
  });

  it('effect runs again if computed updates to new value', async () => {
    const el = new TestComponent();
    document.body.appendChild(el);

    el.setB(5); // sum = 6
    await Promise.resolve();

    expect(el.getSum()).toBe(6);
    expect(el.spy).toHaveBeenLastCalledWith(6);
    expect(el.spy).toHaveBeenCalledTimes(2); // initial + 1

    el.remove();
  });
});

