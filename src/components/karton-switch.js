import { KartonElement, html, logdev } from '../../KartonElement.js';

export class KartonSwitch extends KartonElement {
  routes = [];
  route = null;
  current = null;
  instances = {};
  basePath = '';

  defineRoutes(routeTree) {
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

    // Pre-instantiate and append once
    for (const route of this.routes) {
      if (!this.instances[route.component]) {
        const el = document.createElement(route.component);
        el.hidden = true;
        this.instances[route.component] = el;
        this.appendChild(el); // ✅ Append once
      }
    }

    window.addEventListener('popstate', () => this.resolve(location.pathname));
    this.resolve(location.pathname);
  }

  navigate(path) {
    const fullPath = path.startsWith(this.basePath)
      ? path
      : this.basePath + (path.startsWith('/') ? path : '/' + path);

    history.pushState(null, '', fullPath);
    this.resolve(fullPath);
  }

  resolve(path) {
    if (this.basePath && path.startsWith(this.basePath)) {
      path = path.slice(this.basePath.length) || '/';
    }

    for (const route of this.routes) {
      const match = path.match(route.regex);
      if (match) {
        const params = {};
        route.keys.forEach((key, i) => {
          params[key] = decodeURIComponent(match[i + 1] || '');
        });

        this.activate(route.component, params);
        return;
      }
    }

    console.warn('No matching route:', path);
  }

  activate(tagName, params) {
    for (const [name, el] of Object.entries(this.instances)) {
      el.hidden = name !== tagName;
    }

    const el = this.instances[tagName];
    if (!el) return;

    for (const [key, value] of Object.entries(params)) {
      el.setAttribute(key, value);
    }

    const match = this.routes.find(r => r.component === tagName);
    if (match?.title) {
      document.title = match.title;
    }

    this.current = tagName;
  }

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

        let path = a.pathname;
        if (this.basePath && path.startsWith(this.basePath)) {
          path = path.slice(this.basePath.length) || '/';
        }

        this.setRoute(path);
      }
    });
  }

  static get observedAttributes() {
    return ['route'];
  }

  init() {
    if (this.hasAttribute('base-path')) {
      let bp = this.getAttribute('base-path').trim();
      this.basePath = bp.endsWith('/') ? bp.slice(0, -1) : bp;
      if (!this.basePath.startsWith('/')) this.basePath = '/' + this.basePath;
    }

    [this.route, this.setRoute] = this.BusState('route', location.pathname + location.search);

    if (!this.hasAttribute('disable-switch-links')) {
      this.enable();
    }

    const templateSlots = this.extractTemplateSlots();
    if (templateSlots !== {} && 'routes' in templateSlots) {
      this.defineRoutes(templateSlots.routes);
    } else {
      console.warn('No route template config found inside <karton-switch>');
    }

    this.Effect(() => {
      logdev('Switch navigating to: ' + this.route());
      this.navigate(this.route());
    }, [this.route], 'karton-switch-navigate');
  }

  // ✅ Only runs once — no re-rendering!
  //template() {
  //  return html``;
  //}
}

customElements.define('karton-switch', KartonSwitch);

