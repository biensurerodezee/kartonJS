import { KartonElement, html, logdev } from '../../KartonElement.js';

/*
<!-- Example KartonRouter Configuration --> 
<karton-router>
  <script type="application/json">
    [
      { "path": "/", "component": "karton-home", "title": "Home - Karton App" },
      { "path": "counter/:id", "component": "karton-counter", "title": "Counter" },
      { "path": "settings/:section", "component": "karton-settings", "title": "Settings" },
      { "path": "about/*", "component": "karton-about", "title": "About Us" },
      { "path": "*", "component": "karton-notfound", "title": "Not Found" }
    ]
  </script>
</karton-router>
*/

const router = {
  routes: [],
  fallback: null,
  setOutput: null,

  defineRoutes(routeTree, setOutputFn) {
    this.routes = [];
    this.setOutput = setOutputFn;

    const buildRoutes = (routes, parentPath = '') => {
      for (const route of routes) {
        let fullPath = route.index
          ? parentPath
          : `${parentPath}/${route.path || ''}`.replace(/\/+/g, '/');

        const keys = [];
        const regex = fullPath
          .split('/')
          .map(part => {
            if (part.startsWith(':')) {
              keys.push(part.slice(1));
              return '([^/]+)';
            } else if (part === '*') {
              keys.push('wildcard');
              return '(.*)';
            }
            return part;
          })
          .join('/');

        this.routes.push({
          regex: new RegExp(`^${regex}$`),
          keys,
          component: route.component,
          title: route.title || null,
        });

        if (route.children) {
          buildRoutes(route.children, fullPath);
        }
      }
    };

    buildRoutes(routeTree);
    window.addEventListener('popstate', () => this.resolve(location.pathname));
    this.resolve(location.pathname);
  },

  navigate(path) {
    history.pushState(null, '', path);
    this.resolve(path);
  },

  resolve(path) {
    for (const route of this.routes) {
      const match = path.match(route.regex);
      if (match) {
        const params = {};
        route.keys.forEach((key, i) => {
          params[key] = decodeURIComponent(match[i + 1] || '');
        });
        this.render(route.component, params);
        return;
      }
    }
    if (this.fallback) this.render(this.fallback, {});
  },

  render(tagName, params) {
    if (!this.setOutput) return;

    const el = document.createElement(tagName);
    for (const [key, value] of Object.entries(params)) {
      el.setAttribute(key, value);
    }

    // Optional: find matching route again to get the title
    const match = this.routes.find(r => r.component === tagName);
    if (match?.title) {
      document.title = match.title;
    }

    this.setOutput(el);
  },

  enable() {
    document.addEventListener('click', e => {
      const a = e.target.closest('a[href]');
      if (
        a &&
        a.origin === location.origin &&
        !a.hasAttribute('data-external') &&
        !e.ctrlKey && !e.metaKey && !e.shiftKey && !e.altKey &&
        e.button === 0
      ) {
        e.preventDefault();
        this.navigate(a.pathname);
      }
    });
  }
};

customElements.define('karton-router', class extends KartonElement {

  static get observedAttributes() {
    return ['route'];
  }

  init() {
    [this.route, this.setRoute] = this.BusState('route', location.pathname + location.search);
    [this.routeOut, this.setRouteOut] = this.State(null);

    // Navigation effect
    this.Effect(() => {
      logdev("Router Navigation Effect to: " + this.route());
      router.navigate(this.route());
    }, [this.route], 'route-navigate');

    // Read embedded <script> for routes
    const routes = this.parseScriptConfig();
    if (routes) {
        router.defineRoutes(routes, this.setRouteOut);
    } else {
      console.warn("No route config found inside <karton-router>");
    }

    router.enable();
  }


  template() {
    return html`${this.routeOut()}`;
  }
});


