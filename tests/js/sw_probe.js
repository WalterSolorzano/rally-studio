/* Sonda de dashboard/sw.js: mide que devuelve el service worker sin red.
 *
 * Uso: node tests/js/sw_probe.js <navegacion|script|imagen>
 * Imprime {ok, resultado, tipo} donde `resultado` es lo que resolvio
 * respondWith (o "sin-respuesta" si no llamo al evento).
 */
"use strict";

const fs = require("fs");
const path = require("path");
const vm = require("vm");

const RAIZ = path.resolve(__dirname, "..", "..");
const FUENTE = fs.readFileSync(path.join(RAIZ, "dashboard", "sw.js"), "utf8");

const ORIGEN = "https://equipo.example";

const TIPOS = {
  navegacion: { url: ORIGEN + "/dashboard/index.html", method: "GET", mode: "navigate", destination: "document" },
  script: { url: ORIGEN + "/dashboard/escape.js?v=20261117", method: "GET", mode: "no-cors", destination: "script" },
  imagen: { url: ORIGEN + "/dashboard/assets/app-icon-192.png", method: "GET", mode: "no-cors", destination: "image" },
  "imagen-sin-copia": { url: ORIGEN + "/dashboard/assets/otro.png", method: "GET", mode: "no-cors", destination: "image" },
  post: { url: ORIGEN + "/dashboard/app.js", method: "POST", mode: "cors", destination: "" },
};

const tipo = process.argv[2] || "script";
const pedido = TIPOS[tipo] || TIPOS.script;

// Caché simulada: solo el cascarón (lo que instala `addAll`).
const guardado = new Map([
  [ORIGEN + "/dashboard/", "HTML-CASCARON"],
  [ORIGEN + "/dashboard/index.html", "HTML-CASCARON"],
  [ORIGEN + "/dashboard/assets/app-icon-192.png", "PNG-CASCARON"],
]);

const almacenes = new Map();
const oyentes = {};

function cacheDe(nombre) {
  if (!almacenes.has(nombre)) almacenes.set(nombre, new Map(guardado));
  return almacenes.get(nombre);
}

const caches = {
  open: (nombre) => Promise.resolve({
    addAll: () => Promise.resolve(),
    put: (req, res) => { cacheDe(nombre).set(req.url || String(req), res); return Promise.resolve(); },
  }),
  keys: () => Promise.resolve(Array.from(almacenes.keys())),
  delete: () => Promise.resolve(true),
  match: (que) => {
    const clave = typeof que === "string" ? new URL(que, ORIGEN + "/dashboard/").href : que.url;
    for (const [, map] of almacenes.size ? almacenes : new Map([["rally-studio-v5", guardado]])) {
      if (map.has(clave)) return Promise.resolve(map.get(clave));
    }
    if (guardado.has(clave)) return Promise.resolve(guardado.get(clave));
    return Promise.resolve(undefined);
  },
};

const sandbox = {
  console: console,
  URL: URL,
  Promise: Promise,
  caches: caches,
  // Sin red: toda petición falla, como en el teléfono sin datos.
  fetch: () => Promise.reject(new Error("sin-red")),
  self: null,
  location: { origin: ORIGEN },
  clients: { claim: () => Promise.resolve(), matchAll: () => Promise.resolve([]) },
  skipWaiting: () => Promise.resolve(),
  addEventListener: (nombre, fn) => { (oyentes[nombre] = oyentes[nombre] || []).push(fn); },
};
sandbox.self = sandbox;
sandbox.globalThis = sandbox;

vm.createContext(sandbox);
vm.runInContext(FUENTE, sandbox, { filename: "sw.js" });

const manejadores = oyentes.fetch || [];
if (!manejadores.length) {
  console.log(JSON.stringify({ ok: false, error: "sw.js no registra un manejador de fetch" }));
  process.exit(0);
}

let promesa = null;
for (const fn of manejadores) {
  fn({ request: pedido, respondWith: (p) => { promesa = p; } });
  if (promesa) break;
}

if (!promesa) {
  console.log(JSON.stringify({ ok: true, tipo: tipo, resultado: "sin-respuesta", cuerpo: null }));
  process.exit(0);
}

Promise.resolve(promesa)
  .then((r) => {
    const cuerpo = typeof r === "string" ? r : (r && (r.cuerpo || r.body || r.status)) || null;
    console.log(JSON.stringify({ ok: true, tipo: tipo, resultado: cuerpo }));
  })
  .catch((e) => {
    console.log(JSON.stringify({ ok: true, tipo: tipo, resultado: "error-de-red", detalle: String(e && e.message) }));
  })
  .then(() => process.exit(0));
