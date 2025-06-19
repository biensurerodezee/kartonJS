import { KartonElement, html, logdev } from '../../KartonElement.js';

export class KartonRouter extends KartonElement {
  routes = [];
  fallback = null;
  setOutput = null;
  basePath = '';

  defineRoutes(routeTree, setOutputFn) {
    this.routes = [];
    if (typeof setOutputFn !== 'function') {
      console.error("No output function given to defineRoutes(routeTree, ...) second argument, the router can't show anything like this.");
      return;
    }
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
  }

  navigate(path) {
    const fullPath = path.startsWith(this.basePath)
      ? path
      : this.basePath + (path.startsWith('/') ? path : '/' + path);

    history.pushState(null, '', fullPath);
    this.resolve(fullPath);
  }

  resolve(path) {
    // Strip basePath for matching
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
        this.render(route.component, params);
        return;
      }
    }

    if (this.fallback) this.render(this.fallback, {});
  }

  render(tagName, params) {
    if (!this.setOutput) return;

    const el = document.createElement(tagName);
    for (const [key, value] of Object.entries(params)) {
      el.setAttribute(key, value);
    }

    const match = this.routes.find(r => r.component === tagName);
    if (match?.title) {
      document.title = match.title;
    }

    this.setOutput(el);
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
    // Normalize and read basePath
    if (this.hasAttribute('base-path')) {
      let bp = this.getAttribute('base-path').trim();
      this.basePath = bp.endsWith('/') ? bp.slice(0, -1) : bp;
      if (!this.basePath.startsWith('/')) this.basePath = '/' + this.basePath;
    }

    [this.route, this.setRoute] = this.BusState('route', location.pathname + location.search);
    [this.routeOut, this.setRouteOut] = this.State('routeOut');

    this.Effect(() => {
      logdev('Router Navigation to: ', this.route());
      this.navigate(this.route());
    }, [this.route], 'route-navigate');

    const templateSlots = this.extractTemplateSlots();
    if (templateSlots !== {} && 'routes' in templateSlots) {
      this.defineRoutes(templateSlots.routes, this.setRouteOut);
    } else {
      console.warn('No route template config found inside <karton-router>');
    }

    if (!this.hasAttribute('disable-router-links')) {
      this.enable();
    } else {
      logdev('disabled-router-links: local links will refresh page.');
    }
  }

  template() {
    return html`${this.routeOut()}`;
  }
}

customElements.define('karton-router', KartonRouter);
