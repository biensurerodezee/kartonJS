import { KartonElement, html } from '../../KartonElement.js';

/*
// 1. import
import './components/karton-input-area.js';

// 2. html
  <karton-input-area
    id="inputMessage"
    placeholder="Write your message here..."
    value="Initial content"
    rows="5"
  ></karton-input-area>
  
// 3. script
<script>
  setTimeout(() => {
        const inputMessage = document.querySelector('#inputMessage').value;
        alert("Your input (after 10 seconds): " + inputMessage)
  }, 10000);
</script>
*/

export class KartonInputArea extends KartonElement {
  static get observedAttributes() {
    return ['value', 'placeholder', 'rows'];
  }

  init() {
    const initial = this.getAttribute('value') ?? '';
    [this.valueState, this.setValue] = this.State(initial);

    this.onInput = e => {
      const val = e.target.value;
      this.setValue(val);
      this.setAttribute('value', val);
    };
  }

  attributeChangedCallback(name, oldVal, newVal) {
    if (name === 'value' && this.setValue && newVal !== this.valueState()) {
      this.setValue(newVal ?? '');
    }
  }

  // ✅ Native-like .value property
  get value() {
    return this.valueState?.() ?? '';
  }

  set value(newVal) {
    this.setValue?.(newVal ?? '');
    this.setAttribute('value', newVal);
  }

  // ✅ Native-like focus/select passthroughs
  get textarea() {
    return this.querySelector('textarea');
  }

  focus() {
    this.textarea?.focus();
  }

  select() {
    this.textarea?.select();
  }

  template() {
    const val = this.valueState?.() ?? '';
    const placeholder = this.getAttribute('placeholder') || '';
    const rows = this.getAttribute('rows') || 4;

    return html`
      <textarea
        rows=${rows}
        placeholder=${placeholder}
        .value=${val}
        @input=${this.onInput}
      ></textarea>
    `;
  }
}

customElements.define('karton-input-area', KartonInputArea);

