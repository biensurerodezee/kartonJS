import { KartonElement, html } from './KartonElement.js';

customElements.define('counter-box', class extends KartonElement {
  init() {
    // Set increase to 1 when the step attribute is not set
    this.increase = this.step() ?? 1;

    // Count implemented in code?? Unnecessary, because all attributes (except "id" and "class") are automatically picked up as busState props.
    // [this.count, this.setCount] = this.busState('count', 0);

    // Computed value
    this.double = this.Computed(() => {
      return this.count() * 2;
    }, [this.count]);

    // Local component-only state
    [this.checkedTotal, this.setCheckedTotal] = this.State('checkedTotal', false);
    [this.checkedTotalDouble, this.setCheckedTotalDouble] = this.State('checkedTotalDouble', false);

    this.Effect(() => {
      console.log(`'count' changed by '${this.increase}':`, this.count());
      // reflect change in attribute
      this.setAttribute("count", this.count());
    }, [this.count]);

    this.Effect(() => {
      console.log(`'checkedTotal' checked:`, this.checkedTotal());
    }, [this.checkedTotal]);

    this.Effect(() => {
      console.log(`'checkedTotalDouble' checked:`, this.checkedTotalDouble());
    }, [this.checkedTotalDouble]);

    this.Effect(() => {
      const log = () => console.log(`Interval running with count: ${this.count()}`);
      const id = setInterval(log, 2000);
      return () => {
        console.log('Interval cleared');
        clearInterval(id);
      };
    }, [this.count]);

    console.log("this", this);
  }

  showAlertTotal() {
    alert('total: ' + this.count());
    this.setCheckedTotal(!this.checkedTotal());
  }

  showAlertTotalDouble() {
    alert('totalDouble: ' + this.double());
    this.setCheckedTotalDouble(!this.checkedTotalDouble());
  }

  template() {
    return html`
      <div>
        <p>Count: ${this.count()}, Double: ${this.double()}</p>
        <button @click=${() => this.setCount(this.count() + this.increase)}>calc</button>
        <button @click=${() => this.showAlertTotal()}>total</button>
        <button @click=${() => this.showAlertTotalDouble()}>totalDouble</button>
        *<slot></slot>*
      </div>
    `;
  }
});

