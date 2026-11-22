// Sonda: carga dashboard/app.js en Node con navegador minimo y devuelve el HTML
// del dossier de impresion. Uso: node dossier_probe.js <estado.json>
"use strict";

const fs = require("fs");
const path = require("path");
const vm = require("vm");

const RAIZ = path.resolve(__dirname, "..", "..");
const fuente = fs.readFileSync(path.join(RAIZ, "dashboard", "app.js"), "utf8");

const estado = JSON.parse(process.argv[3] || "{}");

const nodo = () => ({
  style: {},
  classList: { add() {}, remove() {}, toggle() {}, contains: () => false },
  setAttribute() {},
  removeAttribute() {},
  appendChild() {},
  removeChild() {},
  remove() {},
  addEventListener() {},
  querySelector: () => null,
  querySelectorAll: () => [],
  getContext: () => null,
  focus() {},
  click() {},
  innerHTML: "",
  textContent: "",
  value: "",
  dataset: {},
});

const documento = {
  body: Object.assign(nodo(), { appendChild() {} }),
  documentElement: nodo(),
  head: nodo(),
  readyState: "complete",
  addEventListener() {},
  querySelector: () => nodo(),
  querySelectorAll: () => [],
  getElementById: () => nodo(),
  createElement: () => nodo(),
  createTextNode: () => nodo(),
  createDocumentFragment: () => nodo(),
};

const almacen = Object.create(null);
const memoria = {
  getItem: (k) => (k in almacen ? almacen[k] : null),
  setItem: (k, v) => {
    almacen[k] = String(v);
  },
  removeItem: (k) => {
    delete almacen[k];
  },
  key: (i) => Object.keys(almacen)[i] ?? null,
  get length() {
    return Object.keys(almacen).length;
  },
};

const sandbox = {
  console,
  JSON,
  Object,
  Array,
  String,
  Number,
  Boolean,
  Math,
  Date,
  Promise,
  Error,
  RegExp,
  Set,
  Map,
  isFinite,
  parseInt,
  parseFloat,
  encodeURIComponent,
  decodeURIComponent,
  setTimeout: (f) => 0,
  clearTimeout() {},
  setInterval: () => 0,
  clearInterval() {},
  requestAnimationFrame: (f) => 0,
  cancelAnimationFrame() {},
  alert() {},
  confirm: () => false,
  prompt: () => null,
  location: { protocol: "http:", hostname: "localhost", search: "", href: "http://localhost/" },
  navigator: { userAgent: "node", clipboard: { writeText: async () => {} }, language: "es" },
  localStorage: memoria,
  sessionStorage: Object.assign(Object.create(null), memoria),
  fetch: async () => ({ ok: false, status: 404, json: async () => ({}), text: async () => "" }),
  document: documento,
  URL: { createObjectURL: () => "blob:x", revokeObjectURL() {} },
  Blob: class { constructor() {} },
  FileReader: class { readAsText() {} },
  Event: class { constructor(t) { this.type = t; } },
  CustomEvent: class { constructor(t) { this.type = t; } },
  HTMLElement: class {},
  MutationObserver: class { observe() {} disconnect() {} },
  IntersectionObserver: class { observe() {} disconnect() {} },
  matchMedia: () => ({ matches: false, addEventListener() {}, addListener() {} }),
};
sandbox.addEventListener = () => {};
sandbox.removeEventListener = () => {};
sandbox.window = sandbox;
sandbox.globalThis = sandbox;
sandbox.self = sandbox;

let resultado;
try {
  const contexto = vm.createContext(sandbox);
  const escape = path.join(RAIZ, "dashboard", "escape.js");
  if (fs.existsSync(escape)) {
    vm.runInContext(fs.readFileSync(escape, "utf8"), contexto, { filename: "escape.js" });
  }
  // app_video.js define escapeHtml y se carga despues de app.js en index.html.
  vm.runInContext(
    "var escapeHtml = function (v) { return window.RallyEsc ? window.RallyEsc.esc(v) : String(v == null ? '' : v); };",
    contexto
  );
  vm.runInContext(fuente, contexto, { filename: "app.js", timeout: 20000 });
  if (typeof contexto.getInitialState !== "function") {
    throw new Error("getInitialState no quedo expuesta");
  }
  vm.runInContext(
    "state = Object.assign(state, " + JSON.stringify(estado) + ");",
    contexto
  );
  contexto.OFFICIAL_CHALLENGES_2026 = [
    { id: "R-01", title: "Reto de prueba", ods: ["ODS 9"] },
  ];
  const html = contexto.preparePrintDossierHTML();
  resultado = { ok: true, html: String(html), largo: String(html).length };
} catch (error) {
  resultado = { ok: false, error: String(error && error.stack ? error.stack : error) };
}

process.stdout.write(JSON.stringify(resultado));
