/* Sonda de dashboard/section_sync.js
 *
 * Carga el archivo real en Node con un navegador mínimo y un fetch falso, para
 * medir qué dice el módulo y qué pide al servidor en escenarios concretos.
 *
 * Uso: node section_sync_probe.js <modo> [json_estado]
 *   modo = member | admin | lock423
 * Devuelve {ok, estado, pide, status, bloqueados} por stdout.
 */
"use strict";

const fs = require("fs");
const path = require("path");
const vm = require("vm");

const FUENTE = path.join(__dirname, "..", "..", "dashboard", "section_sync.js");
const modo = process.argv[2] || "member";
// La consola de Windows se come las comillas: se acepta @ruta.json además del JSON literal.
const crudo = process.argv[3] || "{}";
const estado = JSON.parse(crudo.charAt(0) === "@" ? fs.readFileSync(crudo.slice(1), "utf8") : crudo);
const crudoEdicion = process.argv[4] || "";
const edicion = crudoEdicion
  ? JSON.parse(crudoEdicion.charAt(0) === "@" ? fs.readFileSync(crudoEdicion.slice(1), "utf8") : crudoEdicion)
  : null;

function elemento(tag) {
  const el = {
    tagName: String(tag || "div").toUpperCase(),
    id: "",
    className: "",
    textContent: "",
    hidden: false,
    dataset: {},
    children: [],
    attributes: {},
    style: {},
    setAttribute(k, v) { this.attributes[k] = String(v); },
    getAttribute(k) { return k in this.attributes ? this.attributes[k] : null; },
    appendChild(hijo) { this.children.push(hijo); hijo.parentNode = this; return hijo; },
    insertBefore(hijo) { this.children.unshift(hijo); hijo.parentNode = this; return hijo; },
    remove() { if (this.parentNode) this.parentNode.children = this.parentNode.children.filter((x) => x !== this); },
    querySelector() { return null; },
    querySelectorAll() { return []; },
    addEventListener() {},
    focus() {},
    closest() { return null; },
  };
  return el;
}

const cuerpo = elemento("body");
const cabeza = elemento("head");
const documento = {
  readyState: "complete",
  body: cuerpo,
  head: cabeza,
  activeElement: null,
  createElement: elemento,
  getElementById() { return null; },
  querySelector() { return null; },
  querySelectorAll() { return []; },
  addEventListener() {},
  dispatchEvent() { return true; },
};

const almacen = new Map();
const local = {
  getItem(k) { return almacen.has(k) ? almacen.get(k) : null; },
  setItem(k, v) { almacen.set(k, String(v)); },
  removeItem(k) { almacen.delete(k); },
};

almacen.set("rally_member_role", modo === "member" ? "member" : "admin");
almacen.set("rally_member_name", "Ana");
almacen.set("rally_member_id", "m1");
almacen.set("rally_studio_production_state_2026_v4", JSON.stringify(estado));

const peticiones = [];
let version = 1;
const intentosDeBloqueo = {};

function respuesta(status, cuerpoJson) {
  return Promise.resolve({
    status,
    ok: status >= 200 && status < 300,
    text: () => Promise.resolve(JSON.stringify(cuerpoJson || {})),
  });
}

function fetchFalso(url, opts) {
  const metodo = (opts && opts.method) || "GET";
  peticiones.push({ metodo, url, cuerpo: opts && opts.body ? JSON.parse(opts.body) : null });
  if (metodo === "GET" && url.indexOf("/api/sections?since=") === 0) {
    return respuesta(200, { seq: 1, sections: {} });
  }
  if (url === "/api/sections/import") {
    return respuesta(200, { imported: 1 });
  }
  if (url.indexOf("/lock") > 0) {
    const clave = url.replace("/api/sections/", "").replace("/lock?project=main", "");
    intentosDeBloqueo[clave] = (intentosDeBloqueo[clave] || 0) + 1;
    if (modo === "lock423" && intentosDeBloqueo[clave] === 1) {
      // Beto tiene el bloqueo, pero ya venció: el texto local debe reintentar.
      return respuesta(423, { lock: { lock_owner: "Beto", lock_owner_id: "m2", lock_until: Math.floor(Date.now() / 1000) + 1 } });
    }
    return respuesta(200, { section: { version: version, updated_by: "Ana" } });
  }
  if (metodo === "POST" && url.indexOf("/api/sections/") === 0) {
    version += 1;
    return respuesta(200, { section: { version: version, updated_by: "Ana" } });
  }
  return respuesta(200, {});
}

class CanalFalso {
  constructor() { this.onmessage = null; }
  postMessage() {}
}

const ventana = {
  addEventListener() {},
  RallyEsc: { esc: (s) => String(s) },
  saveState() {},
};

const sandbox = {
  window: ventana,
  document: documento,
  localStorage: local,
  location: { search: "", pathname: "/dashboard/index.html", href: "" },
  fetch: fetchFalso,
  BroadcastChannel: CanalFalso,
  AbortController: class { constructor() { this.signal = {}; } abort() {} },
  CustomEvent: class { constructor(tipo, init) { this.type = tipo; this.detail = init && init.detail; } },
  URLSearchParams,
  JSON,
  Object,
  Array,
  Number,
  Math,
  Date,
  Set,
  Map,
  Promise,
  String,
  RegExp,
  Error,
  setTimeout,
  clearTimeout,
  console,
};
sandbox.globalThis = sandbox;

function leerStatus() {
  const el = cuerpo.children.find((n) => n.id === "rally-sync-status");
  if (!el) return { texto: "", oculto: true, mood: "" };
  return { texto: el.textContent, oculto: !!el.hidden, mood: (el.dataset && el.dataset.mood) || "" };
}

(async () => {
  const salida = { ok: true, modo };
  // Esperar por condición, no por reloj: con la suite cargada un flush tarda
  // más de lo que tarda un setTimeout fijo, y la sonda medía su propia prisa.
  const esperar = async (cond, limite) => {
    const tope = Date.now() + limite;
    while (Date.now() < tope) {
      try { if (cond()) return true; } catch (e) { /* todavía no */ }
      await new Promise((r) => setTimeout(r, 50));
    }
    try { return !!cond(); } catch (e) { return false; }
  };
  const publicado = () => peticiones.some(
    (p) => p.metodo === "POST" && p.url === "/api/sections/project_name?project=main",
  );
  const sinPendientes = () => {
    const sync = ventana.RallySectionSync;
    const st = sync && typeof sync.status === "function" ? sync.status() : null;
    return !!st && Array.isArray(st.dirty) && st.dirty.length === 0;
  };
  try {
    vm.createContext(sandbox);
    vm.runInContext(fs.readFileSync(FUENTE, "utf8"), sandbox, { filename: "section_sync.js" });
    await new Promise((r) => setTimeout(r, 350));
    if (edicion) {
      // el usuario escribe: la app guarda en localStorage y avisa al sincronizador
      const guardado = JSON.parse(local.getItem("rally_studio_production_state_2026_v4") || "{}");
      Object.assign(guardado, edicion);
      local.setItem("rally_studio_production_state_2026_v4", JSON.stringify(guardado));
      if (ventana.RallySectionSync) ventana.RallySectionSync.onLocalSave();
      if (modo === "member") {
        // el miembro no publica nunca: se le da margen para que, si intentara, se le viera
        await new Promise((r) => setTimeout(r, 1500));
      } else {
        salida.espera = await esperar(publicado, 12000);
      }
    }
    if (modo === "lock423") {
      // segundo intento: si el bloqueo se liberó, el texto local debe volver a viajar
      const sync = ventana.RallySectionSync;
      const antes = peticiones.length;
      if (sync && typeof sync.flush === "function") await sync.flush();
      await esperar(() => publicado() && sinPendientes(), 6000);
      salida.reintento = peticiones.slice(antes).map((p) => p.metodo + " " + p.url);
    }
    const sync = ventana.RallySectionSync;
    salida.estado = sync ? sync.status() : null;
    salida.status = leerStatus();
    salida.pide = peticiones;
  } catch (err) {
    salida.ok = false;
    salida.error = String((err && err.stack) || err);
  }
  process.stdout.write(JSON.stringify(salida));
  // el módulo deja sondeos programados: sin esto Node nunca termina
  process.exit(0);
})();
