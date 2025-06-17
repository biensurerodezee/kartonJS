import { KartonElement, html } from '../../KartonElement.js';
import './karton-settings-info.js';
import './karton-settings-color.js';

customElements.define('karton-settings', class extends KartonElement {

  static get observedAttributes() {
    return ['section'];
  }

  init() {
    // Sync with router param `:section`
    [this.section, this.setSection] = this.State('section');

    // Auto-scroll to that section when updated
    this.Effect(() => {
      const targetId = this.section();
      if (!targetId) return;
      // Wait a tick to ensure DOM is rendered
      requestAnimationFrame(() => {
        const el = this.querySelector(`#${targetId}`);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    }, [this.section], 'scroll-to-section');
  }

  template() {
    return html`
      <BR><BR><BR><BR>
      <section id="info">
        <karton-settings-info />
      </section>
      <BR><BR><BR><BR>
      <section id="color">
        <karton-settings-color />
      </section>
      <BR><BR><BR><BR>
      <BR><BR><BR><BR>
      <BR><BR><BR><BR>
    `;
  }

});

