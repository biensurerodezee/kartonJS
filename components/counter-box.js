import { KartonElement, html, logdev } from '../KartonElement.js';

customElements.define('counter-box', class extends KartonElement {

  static get observedAttributes() {
    return ['step', 'multiply'];
  }

  iNum = 0;

  init() {
    // uncomment to use localStorage instead of default memoryStorage for States
    //this.Storage = localStorage; // or sessionStorage

    // step State (synchronizes with attribute 'step')
    [this.step, this.setStep] = this.BusState('step', 1);
    // step State (synchronizes with attribute 'multiply')
    [this.multiply, this.setMultiply] = this.State('multiply', 1);
    
    // count State (synchronizes with attribute 'count')
    [this.count, this.setCount] = this.State(`${this.id}:count`, 0);
    this.SyncAttrEffect('count', this.count);
    
    // Checked BoolAttrEffect (true/false add/remove attribute 'checked')
    [this.check, this.setCheck] = this.State(`${this.id}:check`, false);
    this.BoolAttrEffect('checked', this.check);
    
    // Hide html ?attribute (true/false add/remove attribute 'hidden')
    [this.hide, this.setHide] = this.State(`${this.id}:hide`, false);

    // Computed value
    this.Compute = this.Computed(() => {
      return this.count() * this.multiply()
    }, [this.count, this.multiply]);

    this.Effect(() => {
      const iNum = ++this.iNum;
      logdev(`[${this.id}] ⚙️ Effect starting for interval #${iNum}`);

      const interval = setInterval(() =>
        logdev(`[${this.id}] ⏱️ interval #${iNum} running`), 2000);

      return () => {
        logdev(`[${this.id}] 🧹 Cleanup for interval #${iNum}`);
        clearInterval(interval);
      };
    }, [this.check], 'check-interval');

  }
  
  template() {
    return html`
      <section>
        <p ?hidden=${this.hide()}>Step: ${this.step()} | Count: ${this.count()} | Multiply: ${this.multiply()}</p>
        <button @click=${() => this.setCount(0)}>reset</button>
        <button @click=${() => this.setCount(this.count() + this.step())}>count</button>
        <button @click=${() => alert('compute: ' + this.Compute())}>compute</button>
        <button @click=${() => this.setCheck(!this.check())}>check</button>
        <button @click=${() => this.setHide(!this.hide())}>hide</button>
      </section>
    `;
  }

});

