import { KartonElement, html } from '../../KartonElement.js';

/*
// 1. import
import './components/karton-toast.js';

// 2. html
<karton-toast></karton-toast>

// 3. script
<script>
  kartonToast("Something happened!");
  kartonToast("Success!", { type: "success" });
  kartonToast("An error occurred!", { type: "error", duration: 5000 });
</script>
*/

export class KartonToast extends KartonElement {
  init() {
    const [getToasts, setToasts] = this.State('toasts', []);
    this.getToasts = getToasts;
    this.setToasts = setToasts;

    this.nextId = 0;

    this.exposeGlobal(); // Optional helper
  }

  exposeGlobal() {
    // Allow triggering from anywhere
    window.kartonToast = (msg, opts = {}) => {
      this.addToast(msg, opts);
    };
  }
  
  disconnectedCallback() {
    super.disconnectedCallback?.();
    if (window.kartonToast === this.addToast) {
      delete window.kartonToast;
    }
  }

  addToast(message, { duration = 10000, type = 'info' } = {}) {
    const id = ++this.nextId;
    const classNames = `toast ${type}`;
    const toast = { id, message, classNames };

    this.setToasts([...this.getToasts(), toast]);

    if (duration > 0) {
      setTimeout(() => this.removeToast(id), duration);
    }
  }

  removeToast(id) {
    const el = this.querySelector(`.toast[data-id="${id}"]`);
    if (el) {
      el.classList.add('removed');
      setTimeout(() => {
        this.setToasts(this.getToasts().filter(t => t.id !== id));
      }, 300); // match the fade-out duration
    } else {
      this.setToasts(this.getToasts().filter(t => t.id !== id));
    }
  }

  template() {
    return html`
      <style>
        karton-toast {
          position: fixed;
          bottom: 1rem;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          z-index: 10000;
          pointer-events: none;
        }

        .toast {
          background: #333;
          color: white;
          padding: 0.75rem 1.25rem;
          border-radius: 0.5rem;
          min-width: 200px;
          max-width: 300px;
          text-align: center;
          pointer-events: auto;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
          opacity: 0.95;
          justify-content: space-between;
          align-items: center;
          color: white;
          text-align: center;
          pointer-events: auto;
          font-size: 1.5rem;
          display: block;
          margin: 1rem 0;
          transition: opacity 0.3s ease-in-out, transform 0.3s ease;
        }
        
        .toast.removed {
          opacity: 0;
          transform: translateY(20px);
        }

        .toast.success { background: #4caf50; }
        .toast.error   { background: #f44336; }
        .toast.info    { background: #2196f3; }

        .close {
          cursor: pointer;
          margin-left: 1rem;
          font-weight: bold;
        }
      </style>

      ${this.getToasts().map(toast => html`
        <div class=${toast.classNames} data-id=${toast.id} role="status" aria-live="polite">
          <span>${toast.message}</span>
          <span class="close" @click=${() => this.removeToast(toast.id)}>×</span>
        </div>
      `)}
    `;
  }
}

customElements.define('karton-toast', KartonToast);

