import { KartonElement, html } from './KartonElement.js';

customElements.define('popup-game', class extends KartonElement {
  init() {
    // counter up
    [this.count, this.setCount] = this.State('count', 0);
    this.Effect(() => {
      console.log('Count changed:', this.count());
    }, [this.count]);  

    // substracter down
    [this.sub, this.setSub] = this.State('sub', 0);
    this.Effect(() => {
      console.log('Sub changed:', this.sub());
    }, [this.sub]);
  }

  increase() {
    this.setCount(this.count() + 1);
  }
  
  substract() {
    this.setSub(this.sub() - 1);
  }

  Boxed() {
    return html`
      <div>
        <p>Preview: ${this.count()}</p>
        <button @click=${() => this.increase()}>+</button>
      </div>
    `;
  }

  Unboxed() {  
    return html`
      <div style="background: white; padding: 2rem">
        <h1>Full View of Popup Game</h1>
        <button @click=${() => this.increase()}>+</button>
        <button @click=${() => alert('hi')}>Hi</button>
        <p>Count: ${this.count()}</p>
        <button @click=${() => this.substract()}>-</button>
        <p>Sub: ${this.sub()}</p>
      </div>
    `;
  }
});

