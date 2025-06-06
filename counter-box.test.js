import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
//import '@testing-library/jest-dom'; // for better matchers like toBeInTheDocument()
import { fireEvent } from '@testing-library/dom';

// Import your component to define the custom element
import './counter-box.js';
import { CounterBox } from './counter-box.js';  // adjust path as needed

describe('counter-box component', () => {
  let container;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
    container = null;
  });

  it('should initialize state from attributes', async () => {
    container.innerHTML = `<counter-box id="test1" count="10" step="3" checked></counter-box>`;
    const el = container.querySelector('counter-box');
    // Wait for microtask for render
    await Promise.resolve();

    expect(el.count()).toBe(10);
    expect(el.step()).toBe(3);
    expect(el.checked()).toBe(true);
  });

  it('should update state and reflect attributes', async () => {
    container.innerHTML = `<counter-box id="test2" count="0" step="1" checked></counter-box>`;
    const el = container.querySelector('counter-box');
    await Promise.resolve();

    el.setCount(5);
    await Promise.resolve();

    expect(el.count()).toBe(5);
    expect(el.getAttribute('count')).toBe('5');
    // to checked false
    el.setChecked(false);
    await Promise.resolve();

    expect(el.checked()).toBe(false);
    expect(el.hasAttribute('checked')).toBe(false);
    // to checked true
    el.setChecked(true);
    await Promise.resolve();

    expect(el.checked()).toBe(true);
    expect(el.hasAttribute('checked')).toBe(true);
    // to checked false
    el.setChecked(false);
    await Promise.resolve();

    expect(el.checked()).toBe(false);
    expect(el.hasAttribute('checked')).toBe(false);
    // to checked true
    el.setChecked(true);
    await Promise.resolve();

    expect(el.checked()).toBe(true);
    expect(el.hasAttribute('checked')).toBe(true);
  });

  it('should update computed values when state changes', async () => {
    container.innerHTML = `<counter-box id="test3" count="2"></counter-box>`;
    const el = container.querySelector('counter-box');
    await Promise.resolve();

    expect(el.double()).toBe(4);

    el.setCount(7);
    await Promise.resolve();

    expect(el.double()).toBe(14);
  });

  it('should run effects on dependency changes', async () => {
    container.innerHTML = `<counter-box id="test4" count="1"></counter-box>`;
    const el = container.querySelector('counter-box');
    await Promise.resolve();

    let effectCount = 0;
    el.Effect(() => {
      effectCount++;
    }, [el.count]);

    el.setCount(2);
    await Promise.resolve();

    expect(effectCount).toBeGreaterThan(0);
  });

  it('should sync busState across instances', async () => {
    container.innerHTML = `
      <counter-box id="bus1" count="1"></counter-box>
      <counter-box id="bus2" count="1"></counter-box>
    `;
    const el1 = container.querySelector('#bus1');
    const el2 = container.querySelector('#bus2');
    await Promise.resolve();

    el1.setCount(10);
    await Promise.resolve();

    expect(el2.count()).toBe(10);
  });

  it('should call event handlers and update state', async () => {
    container.innerHTML = `<counter-box id="test5" count="0"></counter-box>`;
    const el = container.querySelector('counter-box');
    await Promise.resolve();

    // Find "calculate" button by text content and click it
    const button = el.shadowRoot.querySelector('button:nth-child(3)'); // safer to query by something more reliable in real tests
    button.click();
    await Promise.resolve();

    expect(el.count()).toBe(el.step()); // step default is 1, count increments by step on calculate button
  });
  
  it('should render slot content inside the component', () => {
    const el = document.createElement('counter-box');
    el.innerHTML = `<span id="injected">Hello Slot</span>`;
    document.body.appendChild(el);

    const slotted = el.querySelector('#injected');
    expect(slotted).not.toBeNull();
    expect(el.contains(slotted)).toBe(true);
    expect(slotted?.textContent).toBe('Hello Slot');
  });
  
  it('should respond to dynamic attribute changes', async () => {
    const el = document.createElement('counter-box');
    el.setAttribute('checked', '');
    document.body.appendChild(el);

    expect(el.checked()).toBe(true);

    el.removeAttribute('checked');
    await Promise.resolve(); // wait for microtasks
    expect(el.checked()).toBe(false);
  });
});
