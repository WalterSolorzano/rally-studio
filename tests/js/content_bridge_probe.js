/* Sonda del puente de contenido: carga dashboard/content_bridge.js real en un
 * navegador mínimo y mide lo que hace con un presupuesto propuesto.
 *
 * Uso: node content_bridge_probe.js <filas|fusionar> <estado.json|@ruta> <payload.json|@ruta>
 * Salida: {ok, filas} o {ok, cambio, estado} (o {ok:false, error}).
 */
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const BRIDGE = path.resolve(__dirname, "..", "..", "dashboard", "content_bridge.js");
const STORAGE_KEY = "rally_studio_production_state_2026_v4";

function leer(arg, porDefecto) {
  if (!arg) return porDefecto;
  if (arg[0] === "@") return fs.readFileSync(arg.slice(1), "utf8");
  return arg;
}

const comando = process.argv[2] || "filas";
const estado = JSON.parse(leer(process.argv[3], "{}"));
const payload = JSON.parse(leer(process.argv[4], "{}"));

const almacen = new Map();
almacen.set(STORAGE_KEY, JSON.stringify(estado));

function elemento() {
  return {
    style: {}, dataset: {}, children: [], innerHTML: "", textContent: "",
    setAttribute() {}, getAttribute() { return null; }, appendChild() {},
    insertBefore() {}, remove() {}, addEventListener() {},
    closest() { return null; }, querySelector() { return null; },
    querySelectorAll() { return []; }
  };
}

const avisos = [];
const contexto = {
  console,
  localStorage: {
    getItem: (k) => (almacen.has(k) ? almacen.get(k) : null),
    setItem: (k, v) => almacen.set(k, String(v)),
    removeItem: (k) => almacen.delete(k)
  },
  sessionStorage: { getItem: () => null, setItem: () => {}, removeItem: () => {} },
  location: { protocol: "http:", reload() {} },
  document: {
    readyState: "complete",
    body: elemento(), head: elemento(),
    getElementById: () => null,
    querySelector: () => null,
    querySelectorAll: () => [],
    createElement: () => elemento(),
    addEventListener() {},
    dispatchEvent: (ev) => { avisos.push(ev && ev.detail); }
  },
  setTimeout, clearTimeout,
  setInterval: () => 0, clearInterval: () => {},
  fetch: () => Promise.resolve({ ok: true, json: () => Promise.resolve({}) }),
  BroadcastChannel: function () { return { postMessage() {}, close() {} }; },
  CustomEvent: function (tipo, datos) { this.type = tipo; this.detail = datos; },
  Promise, JSON, String, Number, Array, Object, isFinite, Date, encodeURIComponent
};
contexto.window = contexto;
contexto.window.addEventListener = () => {};

let salida;
try {
  vm.createContext(contexto);
  vm.runInContext(fs.readFileSync(BRIDGE, "utf8"), contexto, { filename: "content_bridge.js" });
  const puente = contexto.window.RallyContentBridge;
  if (comando === "filas") {
    salida = { ok: true, filas: puente._filas(payload) };
  } else {
    const cambio = puente._fusionar(Object.assign({ id: "p1" }, payload));
    const guardado = almacen.get(STORAGE_KEY);
    salida = { ok: true, cambio: cambio, estado: JSON.parse(guardado), avisos: avisos.length };
  }
} catch (error) {
  salida = { ok: false, error: String(error && error.message || error) };
}

process.stdout.write(JSON.stringify(salida));
process.exit(0);
