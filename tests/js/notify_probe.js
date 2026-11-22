/* Sonda de notify.js: carga el archivo real en vm y despacha eventos
 * `rally:aviso` en el documento falso. Uso: node notify_probe.js <json_avisos>
 */
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const fuente = fs.readFileSync(path.join(__dirname, "..", "..", "dashboard", "notify.js"), "utf8");
const avisos = JSON.parse(
  process.argv[2] && process.argv[2][0] === "@"
    ? fs.readFileSync(process.argv[2].slice(1), "utf8")
    : process.argv[2] || "[]"
);

const almacen = new Map();
const lanzadas = [];
const oyentes = {};

function Notification(titulo, opciones) {
  lanzadas.push({ titulo: titulo, body: opciones && opciones.body });
}
Notification.permission = "granted";

const sandbox = {
  localStorage: {
    getItem: (k) => (almacen.has(k) ? almacen.get(k) : null),
    setItem: (k, v) => almacen.set(k, String(v)),
  },
  Notification: Notification,
  navigator: { setAppBadge: null },
  fetch: () => Promise.resolve({ ok: false, status: 404, json: () => Promise.resolve(null) }),
  setTimeout: () => 0,
  setInterval: () => 0,
  console: console,
  document: {
    addEventListener: (nombre, fn) => {
      oyentes[nombre] = fn;
    },
  },
  state: { avisos: [] },
};
sandbox.window = sandbox;
vm.createContext(sandbox);
vm.runInContext(fuente, sandbox);

const permiso = sandbox.RallyNotificar.pedir();
permiso.then(() => {
  for (const a of avisos) {
    oyentes["rally:aviso"]({ detail: a });
  }

  console.log(JSON.stringify({
    ok: true,
    lanzadas: lanzadas.length,
    cuerpos: lanzadas.map((l) => l.body),
    historial: sandbox.RallyNotificar._historial().map((h) => h.cuerpo),
  }));
});
