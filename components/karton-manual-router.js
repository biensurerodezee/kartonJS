import { KartonElement, html, router, isDev } from '../KartonElement.js';
import './karton-home.js';
import './karton-settings.js';
import './karton-about.js';
import './karton-notfound.js';
import './karton-counter.js';

customElements.define('karton-swtich', class extends KartonElement {

  init() {
    // uncomment to use localStorage instead of default memoryStorage for States
    this.Storage = localStorage; // or sessionStorage

    // define State page for routing
    [this.route, this.setRoute] = this.State('route', { page: 'home', params: {} });
    // Setup router (opt-in)
    
    const attributeArray = [...this.attributes];
    console.log("AttributeArray", attributeArray);
    this.routes = {};
    attributeArray.forEach((attribute) => {
      var path;
      var elem;
      if ( attribute.value.indexOf('$') ) {
        const ac = attribute.value.split('$');
        path = ac[0];
        elem = ac[1];
      } else {
        path = attribute.value;
        elem = `karton-${attribute.name}`;
      }
      this.routes[path] = (params) => this.setRoute({ page: attribute.name, params });
      
      this.routes[path]['element'] = `<${elem} id="1" />`;
    });
    router.define(this.routes, () => this.setRoute({ page: 'notfound', params: {} }));
    // Enable link interception
    router.enable(); // Add this to make <a href="/path"> work without full reload
  }

  template() {
    return html`
        ${
          this.route().page === 'home' ? html`<karton-home test="1" />` :
          this.route().page === 'counter' ? html`<karton-counter id="${this.route().params.id}" step="${this.route().params['step']}" />` :
          this.route().page === 'settings' ? html`<karton-settings section="${this.route().params.section}" />` :
          this.route().page === 'about' ? html`<karton-about topic="${this.route().params.wildcard}" />` :
          html`<karton-notfound />`
        }
    `;
  }

});

