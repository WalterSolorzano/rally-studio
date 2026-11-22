/* stats_view_probe.js -- ejercita los render de dashboard/stats.js real.
   Uso: node stats_view_probe.js render <json_datos>
   Devuelve {ok, vistas: {selector: {html, texto, attrs}}, sospechas: [...]}.
   Carga escape.js y stats.js de producción en un solo contexto `vm`; el DOM es
   un doble mínimo que guarda lo que cada render escribe. */
"use strict";
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const RAIZ = path.resolve(__dirname, "..", "..");
const FUENTE = fs.readFileSync(path.join(RAIZ, "dashboard", "stats.js"), "utf8");
const ESCAPE = fs.readFileSync(path.join(RAIZ, "dashboard", "escape.js"), "utf8");

function leer(arg) {
  if (arg && arg.startsWith("@")) return JSON.parse(fs.readFileSync(arg.slice(1), "utf8"));
  return JSON.parse(arg);
}

let datos;
try {
  datos = leer(process.argv[3] || "{}");
} catch (error) {
  console.log(JSON.stringify({ ok: false, error: `json invalido: ${error.message}` }));
  process.exit(0);
}

const registro = new Map();

function elemento(clave) {
  if (registro.has(clave)) return registro.get(clave);
  const attrs = {};
  const clases = new Set();
  const el = {
    id: clave,
    innerHTML: "",
    textContent: "",
    style: {},
    dataset: {},
    attrs,
    clases,
    classList: {
      add: (c) => clases.add(c),
      remove: (c) => clases.delete(c),
      contains: (c) => clases.has(c),
      toggle: (c) => (clases.has(c) ? clases.delete(c) : clases.add(c))
    },
    setAttribute: (k, v) => { attrs[k] = String(v); },
    getAttribute: (k) => (k in attrs ? attrs[k] : null),
    addEventListener: () => {},
    querySelector: (sel) => elemento("#" + String(sel).replace(/^[#.]/, "")),
    querySelectorAll: () => [],
    getBoundingClientRect: () => ({ top: 0, bottom: 10, left: 0, right: 10, width: 10, height: 10 })
  };
  Object.defineProperty(el, "src", { set: (v) => { attrs.src = String(v); }, get: () => attrs.src || "" });
  Object.defineProperty(el, "alt", { set: (v) => { attrs.alt = String(v); }, get: () => attrs.alt || "" });
  registro.set(clave, el);
  return el;
}

const cuerpo = elemento("body");

const ventana = {
  RALLY_STATS: datos,
  location: { search: "" },
  innerWidth: 1280,
  innerHeight: 800,
  matchMedia: () => ({ matches: true }),
  addEventListener: () => {},
  removeEventListener: () => {},
  setTimeout: (fn) => { if (typeof fn === "function") fn(); return 0; },
  print: () => {},
  IntersectionObserver: undefined
};

const documento = {
  readyState: "complete",
  body: cuerpo,
  documentElement: elemento("html"),
  querySelector: (sel) => elemento(sel),
  querySelectorAll: () => [],
  getElementById: (id) => elemento("#" + id),
  addEventListener: () => {}
};

const contexto = {
  window: ventana,
  document: documento,
  navigator: { webdriver: true },
  URLSearchParams: class { has() { return false; } },
  performance: { now: () => 0 },
  requestAnimationFrame: (fn) => { fn(1000); return 0; },
  Number,
  Math,
  String,
  Array,
  Object,
  JSON,
  console
};
ventana.document = documento;
ventana.navigator = contexto.navigator;
ventana.URLSearchParams = contexto.URLSearchParams;
ventana.requestAnimationFrame = contexto.requestAnimationFrame;
ventana.performance = contexto.performance;
vm.createContext(contexto);

const INTERES = [
  "#roster-body", "#roster-table", "#stack-bar", "#split-legend",
  "#achievements", "#produccion-filas", "#provenance-body",
  "#closing-line", "#provenance-copy", "#footer-real"
];

try {
  vm.runInContext(ESCAPE, contexto);
  vm.runInContext(FUENTE, contexto);
} catch (error) {
  console.log(JSON.stringify({ ok: false, error: String(error && error.message) }));
  process.exit(0);
}

const vistas = {};
const sospechas = [];
INTERES.forEach((sel) => {
  const el = registro.get(sel);
  if (!el) return;
  const html = String(el.innerHTML || "");
  const texto = String(el.textContent || "");
  vistas[sel] = { html: html.slice(0, 4000), texto: texto.slice(0, 1000), attrs: el.attrs };
  const junto = html + " " + texto + " " + JSON.stringify(el.attrs);
  ["NaN", "undefined", "[object Object]", "Infinity"].forEach((marca) => {
    if (junto.includes(marca)) {
      const donde = junto.includes(marca === "NaN" ? "NaN%" : marca) ? marca : marca;
      sospechas.push({ selector: sel, marca: donde });
    }
  });
});

console.log(JSON.stringify({ ok: true, vistas, sospechas }));
process.exit(0);
