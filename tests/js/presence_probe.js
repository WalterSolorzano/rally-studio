/* presence_probe.js -- corre dashboard/presence.js real en Node.
 *
 * Comandos:
 *   node presence_probe.js avisos <json>  estado {actor, cambios:[{id,actor,path}]}
 *
 * Devuelve {ok, avisos, toasts, pide}. `avisos` son los CustomEvent
 * "rally:aviso" despachados y `toasts` las llamadas a showToast().
 */
"use strict";

const fs = require("fs");
const path = require("path");
const vm = require("vm");

function salir(datos, codigo) {
  process.stdout.write(JSON.stringify(datos));
  process.exit(codigo || 0);
}

const RAIZ = path.resolve(__dirname, "..", "..");
const FUENTE = fs.readFileSync(path.join(RAIZ, "dashboard", "presence.js"), "utf8");
const ESTADO = JSON.parse(process.argv[3] || "{}");

const avisos = [];
const toasts = [];
const pide = [];
let paso = 0;
const tareas = [];

function elemento() {
  return {
    id: "",
    style: { cssText: "" },
    textContent: "",
    appendChild() {},
    setAttribute() {},
  };
}

const almacen = new Map();
const cuerpo = elemento();

const documento = {
  visibilityState: "visible",
  body: cuerpo,
  documentElement: cuerpo,
  addEventListener() {},
  getElementById() {
    return null;
  },
  createElement() {
    return elemento();
  },
  dispatchEvent(ev) {
    avisos.push(ev && ev.detail ? ev.detail : {});
    return true;
  },
};

function CustomEvent(tipo, opciones) {
  this.type = tipo;
  this.detail = (opciones || {}).detail;
}

const fetchFalso = function (url) {
  pide.push(String(url));
  let cuerpoRespuesta = {};
  if (String(url).indexOf("/api/presence") === 0) {
    cuerpoRespuesta = { ok: true, actors: [] };
  } else if (String(url).indexOf("/api/sync/changes") === 0) {
    const pasos = ESTADO.pasos || [ESTADO.cambios || []];
    const datos = pasos[Math.min(paso, pasos.length - 1)] || [];
    paso += 1;
    const cursor = datos.reduce(function (max, ch) {
      return Math.max(max, Number(ch.id) || 0);
    }, 0);
    cuerpoRespuesta = { ok: true, cursor: cursor, changes: datos };
  }
  return Promise.resolve({
    ok: true,
    json: function () {
      return Promise.resolve(cuerpoRespuesta);
    },
  });
};

const ventana = {
  location: { protocol: "http:", origin: "http://127.0.0.1:8000", search: "?project=main" },
  localStorage: {
    getItem(k) {
      return almacen.has(k) ? almacen.get(k) : null;
    },
    setItem(k, v) {
      almacen.set(k, String(v));
    },
  },
  fetch: fetchFalso,
  document: documento,
  CustomEvent: CustomEvent,
  URLSearchParams: URLSearchParams,
  showToast: function (texto) {
    toasts.push(String(texto));
  },
  setInterval: function (fn, ms) {
    tareas.push({ fn: fn, ms: ms });
    return tareas.length;
  },
  Date: Date,
  Math: Math,
  JSON: JSON,
  String: String,
  Number: Number,
  Object: Object,
  URLSearchParams: URLSearchParams,
};

// El nombre propio se fija antes de cargar el script.
almacen.set("rally_presence_name", ESTADO.actor || "Yo");

const sandbox = Object.assign({}, ventana, {
  window: null,
  document: documento,
  localStorage: ventana.localStorage,
  fetch: fetchFalso,
  CustomEvent: CustomEvent,
  URLSearchParams: URLSearchParams,
  setInterval: ventana.setInterval,
  showToast: ventana.showToast,
  console: console,
});
sandbox.window = sandbox;
vm.createContext(sandbox);

try {
  vm.runInContext(FUENTE, sandbox, { filename: "presence.js" });
} catch (error) {
  salir({ ok: false, error: String(error && error.message) }, 0);
}

// El último setInterval es pollChanges; se corre dos veces para que siembre
// el cursor y luego publique el cambio.
const cambios = tareas[tareas.length - 1];
if (!cambios) salir({ ok: false, error: "sin intervalo de cambios" }, 0);

function esperar() {
  return new Promise(function (listo) {
    setImmediate(listo);
  });
}

(async function () {
  cambios.fn();
  await esperar();
  await esperar();
  cambios.fn();
  await esperar();
  await esperar();
  salir({ ok: true, avisos: avisos, toasts: toasts, pide: pide });
})();
