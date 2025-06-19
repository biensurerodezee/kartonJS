import { KartonElement, html } from '../../KartonElement.js';

/*
// 1. import
import './components/karton-activity-indicator.js';

// 2. html
  <karton-activity-indicator
    size="50px"
    color="#b07d56"
    message="Loading, please wait..."
    animating
  ></karton-activity-indicator>
*/



export class KartonActivityIndicator extends KartonElement {
  static get observedAttributes() {
    return ['animating'];
  }

  init() {
    this.size = this.getAttribute('size') || '40px';
    this.color = this.getAttribute('color') || '#000';
    this.message = this.getAttribute('message') || '';
    this.spinnerStyle = `width: ${this.size}; height: ${this.size}; border-color: ${this.color} transparent transparent transparent;`; 

    // color theme State
    const hasAttrAnimating = this.hasAttribute('animating') || false;
    [this.animating, this.setAnimating] = this.State('animating', hasAttrAnimating);
    //console.log("this.animating()", this.animating());
  }

  template() {
    return html`
      <style>
        .indicator-wrapper {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 1rem;
        }

        .spinner {
          border: 4px solid rgba(0, 0, 0, 0.1);
          border-top: 4px solid var(--spinner-color, #000);
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        .hidden {
          display: none;
        }

        .message {
          margin-top: 0.5rem;
          font-size: 0.9rem;
          color: #333;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        [hidden] {
          visibility: hidden;
        }
      </style>
      <div class="indicator-wrapper" ?hidden=${!this.animating()}>
        <div class="spinner" style=${this.spinnerStyle}></div>
        ${this.message ? html`<div class="message">${this.message}</div>` : html``}
      </div>
    `;
  }

}

customElements.define('karton-activity-indicator', KartonActivityIndicator);

