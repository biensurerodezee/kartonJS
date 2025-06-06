import { KartonElement, html } from './KartonElement.js';

customElements.define('counter-box', class extends KartonElement {
  static get observedAttributes() {
    return ['step', 'count', 'checked'];
  }

  init() {
    // uncomment to disable automatic global style import
    //this.globalStyleLinks = "";
  
    // Step busState with pub/sub
    [this.step, this.setStep] = this.busState('step', 1);

    // Count busState with pub/sub
    [this.count, this.setCount] = this.busState('count', 0);
    
    // Checked busState with pub/sub with type boolean
    [this.checked, this.setChecked] = this.busState('checked', true);

    // Computed value
    this.double = this.Computed(() => {
      return this.count() * 2;
    }, [this.count]);

    // Local component-only state
    [this.checkedTotal, this.setCheckedTotal] = this.State('checkedTotal', false);
    [this.checkedTotalDouble, this.setCheckedTotalDouble] = this.State('checkedTotalDouble', false);

    this.Effect(() => {
      console.log(`'count' changed by '${this.step()}':`, this.count());
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

  resetCount() {
    alert('reset: #' + this.id);
    document.querySelector(`#${this.id}`).setAttribute('count', 0);
  }

  template() {
    return html`
      <div>
        <p>Count: ${this.count()} | Step size: ${this.step()}</p>
        <button @click=${() => this.resetCount()}>reset</button>
        <button @click=${() => this.setStep(this.step() - 1 )}>step -</button>
        <button @click=${() => this.setCount(this.count() + this.step())}>calculate</button>
        <button @click=${() => this.setStep(this.step() + 1 )}>step +</button>
        <button @click=${() => this.showAlertTotal()}>total</button>
        <button @click=${() => this.showAlertTotalDouble()}>totalDouble</button>
        <button @click=${() => this.setChecked(!this.checked())}>check</button>
        *<slot></slot>*
        <button onclick="window.__Karton__.instances.forEach(x => x.render())">Force re-render all</button>
      </div>
    `;
  }
});

