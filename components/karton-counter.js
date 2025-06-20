import { KartonElement, html, isDev } from '../KartonElement.js';
import './counter-box.js';

customElements.define('karton-counter', class extends KartonElement {

  static get observedAttributes() {
    return ['step', 'multiply'];
  }

  init() {
    // step State
    [this.step, this.setStep] = this.BusState('step', 1, localStorage);
    
    // multiply State
    [this.multiply, this.setMultiply] = this.State('multiply', 2, localStorage);
  }

  resetCount() {
    alert('reset step: #cb1 (and with #cb2 and #cb3 through BusState pub/sub)');
    document.querySelector('#cb1').setAttribute('step', 0);
    // cb2 and cb3 will be updated via the BusState subscription
  }
  
  logStorage() {
    console.log("[KartonJS][Storage] item: ", this.Storage);
  }

  template() {
    return html`
      <div>
        <button @click=${() => this.setStep(this.step() - 1 )}>step -</button>
        <button @click=${() => this.setStep(this.step() + 1 )}>step +</button> &nbsp;
        <button @click=${() => this.setMultiply(this.multiply() - 1 )}>multiply -</button>
        <button @click=${() => this.setMultiply(this.multiply() + 1 )}>multiply +</button>
        <button @click=${() => this.logStorage()}>Log Storage</button>
      </div>
      <div>
        <counter-box id="cb1" step=${this.step()} multiply=${this.multiply()}></counter-box>
        <counter-box id="cb2" step=${this.step()} multiply=${this.multiply()}></counter-box>
        <counter-box id="cb3" step=${this.step()} multiply=${this.multiply()}></counter-box>
      </div>
      <div>
        <button id="delcb1" onclick="document.querySelector('#cb1').remove();">delete cb1</button>
        <button id="delcb2" onclick="document.querySelector('#cb2').remove();">delete cb2</button>
        <button id="delcb3" onclick="document.querySelector('#cb3').remove();">delete cb3</button>
        <button @click="${() => { localStorage.clear(); } }">clear localStorage</button>
        <button @click=${() => this.resetCount() }>reset step</button>
        ${isDev ? html`<button onclick="window.__Karton__.instances.forEach(x => console.log(x.tagName.toLowerCase(), x.i, x.template()))">log all KartonElement templates</button>` : null}
      </div>
    `;
  }

});

