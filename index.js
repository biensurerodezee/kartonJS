"use strict";
var __defProp = Object.defineProperty;
var __typeError = (msg) => {
  throw TypeError(msg);
};
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
var __accessCheck = (obj, member, msg) => member.has(obj) || __typeError("Cannot " + msg);
var __privateGet = (obj, member, getter) => (__accessCheck(obj, member, "read from private field"), getter ? getter.call(obj) : member.get(obj));
var __privateAdd = (obj, member, value) => member.has(obj) ? __typeError("Cannot add the same private member more than once") : member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
var __privateSet = (obj, member, value, setter) => (__accessCheck(obj, member, "write to private field"), setter ? setter.call(obj, value) : member.set(obj, value), value);
var _firstChild, _lastChild, _nodes, _state, _effects, _unsubscribers, _renderPending;
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
/*! (c) Andrea Giammarchi */
const cleared = (self) => {
  const entries = [...self];
  self.clear();
  return entries;
};
class Effect extends Set {
  constructor(_) {
    super()._ = _;
  }
  dispose() {
    var _a;
    for (const entry of cleared(this)) {
      entry.delete(this);
      (_a = entry.dispose) == null ? void 0 : _a.call(entry);
    }
  }
}
let current = null;
const create$2 = (block) => {
  const fx = new Effect(() => {
    const prev = current;
    current = fx;
    try {
      block();
    } finally {
      current = prev;
    }
  });
  return fx;
};
const effect = (fn) => {
  let teardown, fx = create$2(() => {
    var _a;
    (_a = teardown == null ? void 0 : teardown.call) == null ? void 0 : _a.call(teardown);
    teardown = fn();
  });
  if (current) current.add(fx);
  return fx._(), () => {
    var _a;
    return (_a = teardown == null ? void 0 : teardown.call) == null ? void 0 : _a.call(teardown), fx.dispose();
  };
};
class Signal extends Set {
  /** @param {T} value the value carried through the signal */
  constructor(_) {
    super()._ = _;
  }
  /** @returns {T} */
  get value() {
    if (current) current.add(this.add(current));
    return this._;
  }
  /** @param {T} value the new value carried through the signal */
  set value(_) {
    if (this._ !== _) {
      this._ = _;
      for (const effect2 of cleared(this)) {
        effect2._();
      }
    }
  }
  // EXPLICIT NO SIDE EFFECT
  peek() {
    return this._;
  }
  // IMPLICIT SIDE EFFECT
  toJSON() {
    return this.value;
  }
  valueOf() {
    return this.value;
  }
  toString() {
    return String(this.value);
  }
}
const signal = (value) => new Signal(value);
class Computed extends Signal {
  /**
   * @param {(v?: T) => T} fn the callback invoked when its signals changes
   * @param {T | undefined} value the optional initial value of the callback
   */
  constructor(fn, value) {
    super(value).f = fn;
    this.e = null;
  }
  /** @readonly @returns {T} */
  get value() {
    if (!this.e)
      (this.e = create$2(() => {
        super.value = this.f(this._);
      }))._();
    return super.value;
  }
  /** @throws {Error} */
  set value(_) {
    throw new Error("computed is read-only");
  }
}
const computed = (fn, value) => new Computed(fn, value);
const udomdiff = (parentNode, a, b, get, before) => {
  const bLength = b.length;
  let aEnd = a.length;
  let bEnd = bLength;
  let aStart = 0;
  let bStart = 0;
  let map = null;
  while (aStart < aEnd || bStart < bEnd) {
    if (aEnd === aStart) {
      const node = bEnd < bLength ? bStart ? get(b[bStart - 1], -0).nextSibling : get(b[bEnd], 0) : before;
      while (bStart < bEnd)
        parentNode.insertBefore(get(b[bStart++], 1), node);
    } else if (bEnd === bStart) {
      while (aStart < aEnd) {
        if (!map || !map.has(a[aStart]))
          parentNode.removeChild(get(a[aStart], -1));
        aStart++;
      }
    } else if (a[aStart] === b[bStart]) {
      aStart++;
      bStart++;
    } else if (a[aEnd - 1] === b[bEnd - 1]) {
      aEnd--;
      bEnd--;
    } else if (a[aStart] === b[bEnd - 1] && b[bStart] === a[aEnd - 1]) {
      const node = get(a[--aEnd], -0).nextSibling;
      parentNode.insertBefore(
        get(b[bStart++], 1),
        get(a[aStart++], -0).nextSibling
      );
      parentNode.insertBefore(get(b[--bEnd], 1), node);
      a[aEnd] = b[bEnd];
    } else {
      if (!map) {
        map = /* @__PURE__ */ new Map();
        let i = bStart;
        while (i < bEnd)
          map.set(b[i], i++);
      }
      if (map.has(a[aStart])) {
        const index = map.get(a[aStart]);
        if (bStart < index && index < bEnd) {
          let i = aStart;
          let sequence = 1;
          while (++i < aEnd && i < bEnd && map.get(a[i]) === index + sequence)
            sequence++;
          if (sequence > index - bStart) {
            const node = get(a[aStart], 0);
            while (bStart < index)
              parentNode.insertBefore(get(b[bStart++], 1), node);
          } else {
            parentNode.replaceChild(
              get(b[bStart++], 1),
              get(a[aStart++], -1)
            );
          }
        } else
          aStart++;
      } else
        parentNode.removeChild(get(a[aStart++], -1));
    }
  }
  return b;
};
const { isArray } = Array;
const { getPrototypeOf, getOwnPropertyDescriptor } = Object;
const SVG_NAMESPACE = "http://www.w3.org/2000/svg";
const empty = [];
const newRange = () => document.createRange();
const set = (map, key, value) => {
  map.set(key, value);
  return value;
};
const gPD = (ref2, prop) => {
  let desc;
  do {
    desc = getOwnPropertyDescriptor(ref2, prop);
  } while (!desc && (ref2 = getPrototypeOf(ref2)));
  return desc;
};
const find = (content, path) => path.reduceRight(childNodesIndex, content);
const childNodesIndex = (node, i) => node.childNodes[i];
const ELEMENT_NODE = 1;
const COMMENT_NODE = 8;
const DOCUMENT_FRAGMENT_NODE = 11;
const { setPrototypeOf } = Object;
const custom = (Class) => {
  function Custom(target) {
    return setPrototypeOf(target, new.target.prototype);
  }
  Custom.prototype = Class.prototype;
  return Custom;
};
let range$1;
const drop$1 = (firstChild, lastChild, preserve) => {
  if (!range$1) range$1 = newRange();
  if (preserve)
    range$1.setStartAfter(firstChild);
  else
    range$1.setStartBefore(firstChild);
  range$1.setEndAfter(lastChild);
  range$1.deleteContents();
  return firstChild;
};
const remove$1 = ({ firstChild, lastChild }, preserve) => drop$1(firstChild, lastChild, preserve);
let checkType = false;
const diffFragment = (node, operation) => checkType && node.nodeType === DOCUMENT_FRAGMENT_NODE ? 1 / operation < 0 ? operation ? remove$1(node, true) : node.lastChild : operation ? node.valueOf() : node.firstChild : node;
const comment = (value) => document.createComment(value);
class PersistentFragment extends custom(DocumentFragment) {
  constructor(fragment) {
    super(fragment);
    __privateAdd(this, _firstChild, comment("<>"));
    __privateAdd(this, _lastChild, comment("</>"));
    __privateAdd(this, _nodes, empty);
    this.replaceChildren(...[
      __privateGet(this, _firstChild),
      ...fragment.childNodes,
      __privateGet(this, _lastChild)
    ]);
    checkType = true;
  }
  get firstChild() {
    return __privateGet(this, _firstChild);
  }
  get lastChild() {
    return __privateGet(this, _lastChild);
  }
  get parentNode() {
    return __privateGet(this, _firstChild).parentNode;
  }
  remove() {
    remove$1(this, false);
  }
  replaceWith(node) {
    remove$1(this, true).replaceWith(node);
  }
  valueOf() {
    const { parentNode } = this;
    if (parentNode === this) {
      if (__privateGet(this, _nodes) === empty)
        __privateSet(this, _nodes, [...this.childNodes]);
    } else {
      if (parentNode) {
        let { firstChild, lastChild } = this;
        __privateSet(this, _nodes, [firstChild]);
        while (firstChild !== lastChild)
          __privateGet(this, _nodes).push(firstChild = firstChild.nextSibling);
      }
      this.replaceChildren(...__privateGet(this, _nodes));
    }
    return this;
  }
}
_firstChild = new WeakMap();
_lastChild = new WeakMap();
_nodes = new WeakMap();
const setAttribute = (element, name, value) => element.setAttribute(name, value);
const removeAttribute = (element, name) => element.removeAttribute(name);
const aria = (element, value) => {
  for (const key in value) {
    const $ = value[key];
    const name = key === "role" ? key : `aria-${key}`;
    if ($ == null) removeAttribute(element, name);
    else setAttribute(element, name, $);
  }
  return value;
};
let listeners;
const at = (element, value, name) => {
  name = name.slice(1);
  if (!listeners) listeners = /* @__PURE__ */ new WeakMap();
  const known2 = listeners.get(element) || set(listeners, element, {});
  let current2 = known2[name];
  if (current2 && current2[0]) element.removeEventListener(name, ...current2);
  current2 = isArray(value) ? value : [value, false];
  known2[name] = current2;
  if (current2[0]) element.addEventListener(name, ...current2);
  return value;
};
const hole = (detail2, value) => {
  const { t: node, n: hole2 } = detail2;
  let nullish = false;
  switch (typeof value) {
    case "object":
      if (value !== null) {
        (hole2 || node).replaceWith(detail2.n = value.valueOf());
        break;
      }
    case "undefined":
      nullish = true;
    default:
      node.data = nullish ? "" : value;
      if (hole2) {
        detail2.n = null;
        hole2.replaceWith(node);
      }
      break;
  }
  return value;
};
const className = (element, value) => maybeDirect(
  element,
  value,
  value == null ? "class" : "className"
);
const data = (element, value) => {
  const { dataset } = element;
  for (const key in value) {
    if (value[key] == null) delete dataset[key];
    else dataset[key] = value[key];
  }
  return value;
};
const direct = (ref2, value, name) => ref2[name] = value;
const dot = (element, value, name) => direct(element, value, name.slice(1));
const maybeDirect = (element, value, name) => value == null ? (removeAttribute(element, name), value) : direct(element, value, name);
const ref = (element, value) => (typeof value === "function" ? value(element) : value.current = element, value);
const regular = (element, value, name) => (value == null ? removeAttribute(element, name) : setAttribute(element, name, value), value);
const style = (element, value) => value == null ? maybeDirect(element, value, "style") : direct(element.style, value, "cssText");
const toggle = (element, value, name) => (element.toggleAttribute(name.slice(1), value), value);
const array = (node, value, prev) => {
  const { length } = value;
  node.data = `[${length}]`;
  if (length)
    return udomdiff(node.parentNode, prev, value, diffFragment, node);
  switch (prev.length) {
    case 1:
      prev[0].remove();
    case 0:
      break;
    default:
      drop$1(
        diffFragment(prev[0], 0),
        diffFragment(prev.at(-1), -0),
        false
      );
      break;
  }
  return empty;
};
const attr = /* @__PURE__ */ new Map([
  ["aria", aria],
  ["class", className],
  ["data", data],
  ["ref", ref],
  ["style", style]
]);
const attribute = (element, name, svg2) => {
  var _a;
  switch (name[0]) {
    case ".":
      return dot;
    case "?":
      return toggle;
    case "@":
      return at;
    default:
      return svg2 || "ownerSVGElement" in element ? name === "ref" ? ref : regular : attr.get(name) || (name in element ? name.startsWith("on") ? direct : ((_a = gPD(element, name)) == null ? void 0 : _a.set) ? maybeDirect : regular : regular);
  }
};
const text = (element, value) => (element.textContent = value == null ? "" : value, value);
const abc = (a, b, c) => ({ a, b, c });
const bc = (b, c) => ({ b, c });
const detail = (u, t, n, c) => ({ v: empty, u, t, n, c });
const cache$1 = () => abc(null, null, empty);
const create$1 = (parse) => (
  /**
   * @param {TemplateStringsArray} template
   * @param {any[]} values
   * @returns {import("./literals.js").Cache}
   */
  (template2, values) => {
    const { a: fragment, b: entries, c: direct2 } = parse(template2, values);
    const root = document.importNode(fragment, true);
    let details = empty;
    if (entries !== empty) {
      details = [];
      for (let current2, prev, i = 0; i < entries.length; i++) {
        const { a: path, b: update, c: name } = entries[i];
        const node = path === prev ? current2 : current2 = find(root, prev = path);
        details[i] = detail(
          update,
          node,
          name,
          update === array ? [] : update === hole ? cache$1() : null
        );
      }
    }
    return bc(
      direct2 ? root.firstChild : new PersistentFragment(root),
      details
    );
  }
);
const TEXT_ELEMENTS = /^(?:plaintext|script|style|textarea|title|xmp)$/i;
const VOID_ELEMENTS = /^(?:area|base|br|col|embed|hr|img|input|keygen|link|menuitem|meta|param|source|track|wbr)$/i;
const elements = /<([a-zA-Z0-9]+[a-zA-Z0-9:._-]*)([^>]*?)(\/?)>/g;
const attributes = /([^\s\\>"'=]+)\s*=\s*(['"]?)\x01/g;
const holes = /[\x01\x02]/g;
const parser$1 = (template2, prefix2, xml) => {
  let i = 0;
  return template2.join("").trim().replace(
    elements,
    (_, name, attrs, selfClosing) => `<${name}${attrs.replace(attributes, "=$2$1").trimEnd()}${selfClosing ? xml || VOID_ELEMENTS.test(name) ? " /" : `></${name}` : ""}>`
  ).replace(
    holes,
    (hole2) => hole2 === "" ? `<!--${prefix2 + i++}-->` : prefix2 + i++
  );
};
let template = document.createElement("template"), svg, range;
const createContent = (text2, xml) => {
  if (xml) {
    if (!svg) {
      svg = document.createElementNS(SVG_NAMESPACE, "svg");
      range = newRange();
      range.selectNodeContents(svg);
    }
    return range.createContextualFragment(text2);
  }
  template.innerHTML = text2;
  const { content } = template;
  template = template.cloneNode(false);
  return content;
};
const createPath = (node) => {
  const path = [];
  let parentNode;
  while (parentNode = node.parentNode) {
    path.push(path.indexOf.call(parentNode.childNodes, node));
    node = parentNode;
  }
  return path;
};
const textNode = () => document.createTextNode("");
const resolve = (template2, values, xml) => {
  const content = createContent(parser$1(template2, prefix, xml), xml);
  const { length } = template2;
  let entries = empty;
  if (length > 1) {
    const replace = [];
    const tw = document.createTreeWalker(content, 1 | 128);
    let i = 0, search = `${prefix}${i++}`;
    entries = [];
    while (i < length) {
      const node = tw.nextNode();
      if (node.nodeType === COMMENT_NODE) {
        if (node.data === search) {
          const update = isArray(values[i - 1]) ? array : hole;
          if (update === hole) replace.push(node);
          entries.push(abc(createPath(node), update, null));
          search = `${prefix}${i++}`;
        }
      } else {
        let path;
        while (node.hasAttribute(search)) {
          if (!path) path = createPath(node);
          const name = node.getAttribute(search);
          entries.push(abc(path, attribute(node, name, xml), name));
          removeAttribute(node, search);
          search = `${prefix}${i++}`;
        }
        if (!xml && TEXT_ELEMENTS.test(node.localName) && node.textContent.trim() === `<!--${search}-->`) {
          entries.push(abc(path || createPath(node), text, null));
          search = `${prefix}${i++}`;
        }
      }
    }
    for (i = 0; i < replace.length; i++)
      replace[i].replaceWith(textNode());
  }
  const { childNodes } = content;
  let { length: len } = childNodes;
  if (len < 1) {
    len = 1;
    content.appendChild(textNode());
  } else if (len === 1 && // ignore html`static` or svg`static` because
  // these nodes can be passed directly as never mutated
  length !== 1 && childNodes[0].nodeType !== ELEMENT_NODE) {
    len = 0;
  }
  return set(cache, template2, abc(content, entries, len === 1));
};
const cache = /* @__PURE__ */ new WeakMap();
const prefix = "isµ";
const parser = (xml) => (template2, values) => cache.get(template2) || resolve(template2, values, xml);
const createHTML = create$1(parser(false));
const createSVG = create$1(parser(true));
const unroll = (info, { s, t, v }) => {
  if (info.a !== t) {
    const { b, c } = (s ? createSVG : createHTML)(t, v);
    info.a = t;
    info.b = b;
    info.c = c;
  }
  for (let { c } = info, i = 0; i < c.length; i++) {
    const value = v[i];
    const detail2 = c[i];
    switch (detail2.u) {
      case array:
        detail2.v = array(
          detail2.t,
          unrollValues(detail2.c, value),
          detail2.v
        );
        break;
      case hole:
        const current2 = value instanceof Hole ? unroll(detail2.c || (detail2.c = cache$1()), value) : (detail2.c = null, value);
        if (current2 !== detail2.v)
          detail2.v = hole(detail2, current2);
        break;
      default:
        if (value !== detail2.v)
          detail2.v = detail2.u(detail2.t, value, detail2.n, detail2.v);
        break;
    }
  }
  return info.b;
};
const unrollValues = (stack, values) => {
  let i = 0, { length } = values;
  if (length < stack.length) stack.splice(length);
  for (; i < length; i++) {
    const value = values[i];
    if (value instanceof Hole)
      values[i] = unroll(stack[i] || (stack[i] = cache$1()), value);
    else stack[i] = null;
  }
  return values;
};
class Hole {
  constructor(svg2, template2, values) {
    this.s = svg2;
    this.t = template2;
    this.v = values;
  }
  toDOM(info = cache$1()) {
    return unroll(info, this);
  }
}
/*! (c) Andrea Giammarchi - MIT */
const tag = (svg2) => (template2, ...values) => new Hole(svg2, template2, values);
const html = tag(false);
const known = /* @__PURE__ */ new WeakMap();
const render$1 = (where, what, check) => {
  const info = known.get(where) || set(known, where, cache$1());
  const { b } = info;
  const hole2 = what;
  const node = hole2 instanceof Hole ? hole2.toDOM(info) : hole2;
  if (b !== node)
    where.replaceChildren((info.b = node).valueOf());
  return where;
};
const registry = new FinalizationRegistry(
  ([onGarbageCollected, held, debug]) => {
    if (debug) console.debug(`%c${String(held)}`, "font-weight:bold", "collected");
    onGarbageCollected(held);
  }
);
const nullHandler = /* @__PURE__ */ Object.create(null);
const create = (hold, onGarbageCollected, { debug, handler, return: r, token = hold } = nullHandler) => {
  const target = r || new Proxy(hold, handler || nullHandler);
  const args = [target, [onGarbageCollected, hold, !!debug]];
  if (token !== false) args.push(token);
  registry.register(...args);
  return target;
};
const drop = (token) => registry.unregister(token);
const effects = /* @__PURE__ */ new WeakMap();
const onGC = (dispose) => dispose();
let remove = true;
const attach = (effect2) => {
  return (where, what) => {
    remove = typeof what !== "function";
    detach(where);
    if (remove) return render$1(where, what);
    remove = true;
    const wr = new WeakRef(where);
    const dispose = effect2(() => {
      render$1(wr.deref(), what());
    });
    effects.set(where, dispose);
    return create(dispose, onGC, { return: where });
  };
};
const detach = (where) => {
  const dispose = effects.get(where);
  if (dispose) {
    if (remove) effects.delete(where);
    drop(dispose);
    dispose();
  }
};
const render = attach(effect);
const isDev = location.hostname === "localhost" || location.hostname === "127.0.0.1";
const logdev = (...m) => isDev && console.debug(`[KartonJS]`, ...m);
const memoryStorage = {
  items: {},
  setItem: (key, value) => memoryStorage.items[key] = value,
  getItem: (key) => memoryStorage.items[key] || null,
  removeItem: (key) => delete memoryStorage[key],
  clear: () => memoryStorage.items = {}
};
async function sleepUntilAnimationFrame() {
  await new Promise(requestAnimationFrame);
  return true;
}
const stateBus = /* @__PURE__ */ (() => {
  const listeners2 = /* @__PURE__ */ new Map();
  return {
    subscribe(key, callback) {
      if (!listeners2.has(key)) listeners2.set(key, /* @__PURE__ */ new Set());
      listeners2.get(key).add(callback);
      return () => listeners2.get(key).delete(callback);
    },
    publish(key, value) {
      if (listeners2.has(key)) {
        for (const cb of listeners2.get(key)) cb(value);
        return true;
      } else {
        return;
      }
    }
  };
})();
class KartonElement extends HTMLElement {
  constructor() {
    super();
    __privateAdd(this, _state, {});
    __privateAdd(this, _effects, []);
    __privateAdd(this, _unsubscribers, []);
    __privateAdd(this, _renderPending, false);
    __publicField(this, "Storage", memoryStorage);
    __publicField(this, "$", (s) => document.querySelector(s));
    __publicField(this, "$$", (s) => document.querySelectorAll(s));
    this.attachLightDom();
  }
  attachLightDom() {
  }
  extractTemplateSlots(host = this) {
    var _a;
    const slotMap = {};
    const templates = host.querySelectorAll("template[slot]");
    for (const tmpl of templates) {
      const name = tmpl.getAttribute("slot");
      const fragment = tmpl.content.cloneNode(true);
      if (["application/json", "json"].includes(((_a = tmpl.getAttribute("type")) == null ? void 0 : _a.toLowerCase()) || "")) {
        const rawContent = fragment.textContent;
        slotMap[name] = this.safeJsonParse(rawContent);
      } else {
        slotMap[name] = fragment;
      }
      tmpl.remove();
    }
    return slotMap;
  }
  slot(name) {
    return this.slots[name] || this.defaultContent[name] || "?? undefined slot ??";
  }
  safeJsonParse(json) {
    try {
      return JSON.parse(json);
    } catch (e) {
      logdev(`<${this.tagName.toLowerCase()} id=${this.i}> Failed to parse JSON script config within element`, e);
      return null;
    }
  }
  connectedCallback() {
    this.i = this.id || "anonymous";
    if (isDev) {
      if (!window.__Karton__) {
        window.__Karton__ = { instances: /* @__PURE__ */ new Set() };
      }
      window.__Karton__.instances.add(this);
    }
    this.init();
    if (typeof this.template === "function") {
      try {
        render(this, this.template.bind(this));
      } catch (e) {
        throw console.error("Error during rendering!\nPlease notice that KartonElement is using render() from 'uthml' and for example: class=\"button ${varname}\" is not allowed, only class=${varname}.\nTo know for sure that your template renders, please read: https://webreflection.github.io/uhtml/", e);
      }
    }
  }
  disconnectedCallback() {
    var _a;
    for (const unsub of __privateGet(this, _unsubscribers)) unsub();
    __privateSet(this, _unsubscribers, []);
    (_a = window.__Karton__) == null ? void 0 : _a.instances.delete(this);
    for (const { label, cleanup } of __privateGet(this, _effects)) {
      logdev(`<${this.tagName.toLowerCase()} id=${this.i}> Cleaning up effect: ${label}`);
      if (typeof cleanup === "function") cleanup();
    }
    __privateSet(this, _effects, []);
  }
  init() {
  }
  coerce(v) {
    if (v === "true") return true;
    if (v === "false") return false;
    if (!isNaN(parseFloat(v)) && isFinite(v)) return Number(v);
    return v;
  }
  State(key, initialValue, storage = this.Storage) {
    if (!(key in __privateGet(this, _state))) {
      let value;
      if (this.hasAttribute(key)) {
        value = this.coerce(this.getAttribute(key)) || this.hasAttribute(key) && this.getAttribute(key) !== "false";
        logdev(`<${this.tagName.toLowerCase()} id=${this.i}> State '${key}' initialized by getAttribute:`, value);
      } else if (storage.getItem(key) !== null) {
        value = this.coerce(storage.getItem(key));
        logdev(`<${this.tagName.toLowerCase()} id=${this.i}> State '${key}' initialized by Storage:`, value);
      } else {
        value = initialValue;
        logdev(`<${this.tagName.toLowerCase()} id=${this.i}> State '${key}' initialized by initialValue:`, value);
      }
      const s2 = signal(value);
      __privateGet(this, _state)[key] = s2;
      const cleanup = effect(() => {
        logdev(`<${this.tagName.toLowerCase()} id=${this.i}> State '${key}' changed: `, s2.value);
        this.reflectAttribute(key, s2.value) && logdev(`attribute reflected '${key}':`, s2.value);
        storage.setItem(key, s2.value) && logdev(`stored in Storage '${key}':`, s2.value);
      });
      __privateGet(this, _effects).push({ label: `state:${key}`, cleanup });
    }
    const s = __privateGet(this, _state)[key];
    return [() => s.value, (v) => s.value = v];
  }
  BusState(key, initialValue, storage = this.Storage) {
    let s;
    const alreadyExists = key in __privateGet(this, _state);
    if (!alreadyExists) {
      let value;
      if (this.hasAttribute(key)) {
        value = this.coerce(this.getAttribute(key)) || this.hasAttribute(key) && this.getAttribute(key) !== "false";
        logdev(`<${this.tagName.toLowerCase()} id=${this.i}> BusState '${key}' initialized by getAttribute:`, value);
      } else if (storage.getItem(key) !== null) {
        value = this.coerce(storage.getItem(key));
        logdev(`<${this.tagName.toLowerCase()} id=${this.i}> BusState '${key}' initialized by Storage:`, value);
      } else {
        value = initialValue;
        logdev(`<${this.tagName.toLowerCase()} id=${this.i}> BusState '${key}' initialized by initialValue:`, value);
      }
      s = signal(value);
      __privateGet(this, _state)[key] = s;
    } else {
      s = __privateGet(this, _state)[key];
    }
    const unsubscribe = stateBus.subscribe(key, (newVal) => {
      logdev(`[${this.id}] SUB: ${key} =`, newVal);
      if (s.value !== newVal) s.value = newVal;
    });
    __privateGet(this, _unsubscribers).push(unsubscribe);
    const hasEffect = __privateGet(this, _effects).some((e) => e.label === `bus:${key}`);
    if (!hasEffect) {
      const cleanup = effect(() => {
        logdev(`<${this.tagName.toLowerCase()} id=${this.i}> BusState '${key}' changed:`, s.value);
        stateBus.publish(key, s.value) && logdev(`PUB '${key}':`, s.value);
        this.reflectAttribute(key, s.value) && logdev(`attribute reflected '${key}':`, s.value);
        storage.setItem(key, s.value) && logdev(`stored in Storage '${key}':`, s.value);
      });
      __privateGet(this, _effects).push({ label: `bus:${key}`, cleanup });
    }
    return [() => s.value, (v) => s.value = v];
  }
  StateSignal(initialValue) {
    const s = signal(initialValue);
    return [() => s.value, (v) => s.value = v];
  }
  reflectAttribute(key, val) {
    let oAttr = this.constructor.observedAttributes || [];
    if (oAttr.includes(key) && val !== null) {
      return this.setAttribute(key, val);
    } else {
      return;
    }
  }
  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) return;
    logdev(`<${this.tagName.toLowerCase()} id=${this.i}> '${name}' attributeChanged:`, oldValue, "→", newValue);
    const coerced = this.coerce(newValue) || this.hasAttribute(name) && this.getAttribute(name) !== "false";
    if (name in __privateGet(this, _state) && __privateGet(this, _state)[name].value !== coerced) {
      __privateGet(this, _state)[name].value = coerced;
      stateBus.publish(name, coerced);
    }
  }
  Effect(fn, depsOrLabel) {
    let label = "anonymous";
    let deps = null;
    if (Array.isArray(depsOrLabel)) {
      deps = depsOrLabel;
    } else if (typeof depsOrLabel === "string") {
      label = depsOrLabel;
    }
    const run = () => {
      logdev(`<${this.tagName.toLowerCase()} id=${this.i}> Effect Triggered: ${label}`);
      const result = fn();
      return typeof result === "function" ? result : null;
    };
    const cleanup = deps ? effect(() => {
      deps.map((d) => d());
      return run();
    }) : effect(run);
    __privateGet(this, _effects).push({ label, cleanup });
  }
  runEffects() {
    __privateGet(this, _effects).forEach((effect2) => {
      const shouldRun = effect2.last.length !== effect2.deps.length || effect2.deps.some((dep, i) => dep() !== effect2.last[i]);
      if (shouldRun) {
        if (typeof effect2.cleanup === "function") {
          effect2.cleanup();
        }
        const result = effect2.fn();
        effect2.cleanup = typeof result === "function" ? result : null;
        effect2.last = effect2.deps.map((dep) => dep());
      }
    });
  }
  Computed(computeFn, key) {
    if (typeof computeFn !== "function") {
      throw new Error(`Computed expects a function, but got: ${typeof computeFn}`);
    }
    if (!(key in __privateGet(this, _state))) {
      const c2 = computed(computeFn);
      __privateGet(this, _state)[key] = c2;
      const cleanup = effect(() => {
        const val = c2.value;
        logdev(`<${this.tagName.toLowerCase()} id=${this.i}> '${key}' computed updated:`, val);
      });
      __privateGet(this, _effects).push({ label: `computed:${key}`, cleanup });
    }
    const c = __privateGet(this, _state)[key];
    return () => c.value;
  }
  BoolAttrEffect(attr2, getter) {
    this.Effect(() => {
      const val = getter();
      if (val === false || val === null || val === void 0) {
        this.removeAttribute(attr2);
        logdev(`<${this.tagName.toLowerCase()} id=${this.i}> attribute '${attr2}' removed`);
      } else {
        this.setAttribute(attr2, "");
        logdev(`<${this.tagName.toLowerCase()} id=${this.i}> attribute '${attr2}' added`);
      }
    }, [getter]);
  }
  SyncAttrEffect(attrName, getter) {
    this.Effect(() => {
      this.setAttribute(attrName, getter());
    }, [() => getter()]);
  }
}
_state = new WeakMap();
_effects = new WeakMap();
_unsubscribers = new WeakMap();
_renderPending = new WeakMap();
exports.KartonElement = KartonElement;
exports.html = html;
exports.isDev = isDev;
exports.logdev = logdev;
exports.memoryStorage = memoryStorage;
exports.sleepUntilAnimationFrame = sleepUntilAnimationFrame;
//# sourceMappingURL=index.js.map
