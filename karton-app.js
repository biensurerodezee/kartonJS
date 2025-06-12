import { KartonElement, html, isDev } from './KartonElement.js';
import './counter-box.js';

customElements.define('karton-app', class extends KartonElement {

  init() {
    // uncomment to use localStorage instead of default memoryStorage for States
    this.Storage = localStorage; // or sessionStorage

    // step State
    [this.step, this.setStep] = this.BusState('step', 1);
    
    // multiply State
    [this.multiply, this.setMultiply] = this.State('multiply', 2);
  }

  resetCount() {
    alert('reset step: #cb1 (and with #cb2 and #cb3 through BusState pub/sub)');
    document.querySelector('#cb1').setAttribute('step', 0);
    // cb2 and cb3 will be updated via the BusState subscription
  }

  template() {
    return html`
      <header>
        <h1>${this.getAttribute('title')}</h1>
        <div>
          <button @click=${() => this.setStep(this.step() - 1 )}>step -</button>
          <button @click=${() => this.setStep(this.step() + 1 )}>step +</button> &nbsp;
          <button @click=${() => this.setMultiply(this.multiply() - 1 )}>multiply -</button>
          <button @click=${() => this.setMultiply(this.multiply() + 1 )}>multiply +</button>
        </div>
      </header>
      <main>
        <div>
          <counter-box id="cb1" multiply=${this.multiply()}></counter-box>
          <counter-box id="cb2" multiply=${this.multiply()}></counter-box>
          <counter-box id="cb3" multiply=${this.multiply()}></counter-box>
        </div>
        <hr>
      </main>
      <footer>
        <div>
          <button id="delcb1" onclick="document.querySelector('#cb1').remove();">delete cb1</button>
          <button id="delcb2" onclick="document.querySelector('#cb2').remove();">delete cb2</button>
          <button id="delcb3" onclick="document.querySelector('#cb3').remove();">delete cb3</button>
          <button @click="${() => { localStorage.clear(); } }">clear localStorage</button>
          <button @click=${() => this.resetCount() }>reset step</button>
          ${isDev ? html`<button onclick="window.__Karton__.instances.forEach(x => console.log(x.debugName, x.template()))">log all Kartonlement templates</button>` : null}
        </div>
        <div>${this.getAttribute('footnote')}</div>
      </footer>
    `;
  }

});

