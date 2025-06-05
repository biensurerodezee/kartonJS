import { KartonElement, html } from './KartonElement.js';

customElements.define('counter-box', class extends KartonElement {
  init() {
    this.increase = this.hasAttribute('step') ? parseInt(this.getAttribute('step'), 10) : 1;

    // Shared state across components (in-memory + localStorage)
    [this.count, this.setCount] = this.busState('count', 0);

    // const [shared, setShared] = this.busState('mySharedValue', 123); // uses localStorage by default
    // const [sessionBus, setSessionBus] = this.busState('myTempVal', 0, sessionStorage);

    // Local component-only state
    [this.checkedTotal, this.setCheckedTotal] = this.State('checkedTotal', false);

    this.Effect(() => {
      console.log(`'count' changed by '${this.increase}':`, this.count());
    }, [this.count]);

    this.Effect(() => {
      console.log(`'checkedTotal' checked:`, this.checkedTotal());
    }, [this.checkedTotal]);

    this.Effect(() => {
      const log = () => console.log(`Interval running with count: ${this.count()}`);
      const id = setInterval(log, 2000);
      return () => {
        console.log('Interval cleared');
        clearInterval(id);
      };
    }, [this.count]);
  }

  showAlertTotal() {
    alert('total: ' + this.count());
    this.setCheckedTotal(!this.checkedTotal());
  }

  template() {
    return html`
      <div>
        <p>Count: ${this.count()}</p>
        <button @click=${() => this.setCount(this.count() + this.increase)}>+</button>
        <button @click=${() => this.showAlertTotal()}>total</button>
      </div>
    `;
  }
});

