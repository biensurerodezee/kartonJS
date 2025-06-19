import { KartonElement, html } from '../../KartonElement.js';

export class KartonStatusBar extends KartonElement {
  static get observedAttributes() {
    return ['text', 'color', 'height', 'hidden'];
  }

  init() {
    // Reactive state
    [this.getText, this.setText] = this.State('text', '');
    [this.getColor, this.setColor] = this.State('color', '#909090');
    [this.getHeight, this.setHeight] = this.State('height', '24px');
    [this.getHide, this.setHide] = this.State('hide-status-bar', false);
    
    // Show/Hide Effect
    this.BoolAttrEffect('hidden', this.getHide);
    
    // Set StyleSchema
    this.styleSchema = `
        karton-status-bar {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.85rem;
          font-weight: 500;
          z-index: 9999;
          color: #000;
          background-color: ${this.getColor()};
          height: ${this.getHeight()};
          padding: 0 1rem;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          transition: background-color 0.3s ease;
        }
        
        [hidden] {
          visibility: hidden;
        }
    `;
  }

  template() {
    return html`
      <style>${this.styleSchema}</style>

      ${this.getText()}
    `;
  }
}

customElements.define('karton-status-bar', KartonStatusBar);

