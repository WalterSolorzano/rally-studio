// Sonda de dashboard/admin.js: guardar un token que no sirve.
// Uso: node tests/js/admin_probe.js bueno|malo
// Imprime {ok, token, mensaje, pide} para medir si el token viejo sobrevive.
"use strict";

const fs = require("fs");
const path = require("path");
const vm = require("vm");

const RAIZ = path.resolve(__dirname, "..", "..");
const FUENTE = fs.readFileSync(path.join(RAIZ, "dashboard", "admin.js"), "utf8");

function elemento() {
  const el = {
    textContent: "",
    value: "",
    disabled: false,
    hidden: true,
    innerHTML: "",
    src: "",
    dataset: {},
    listeners: {},
    classList: { toggle() {} },
    addEventListener(tipo, fn) { (el.listeners[tipo] = el.listeners[tipo] || []).push(fn); },
    removeAttribute() { el.src = ""; },
    setAttribute() {},
    appendChild() {},
    prepend() {},
    querySelector() { return null; },
    querySelectorAll() { return []; },
    focus() {},
    fire(tipo, evento) { (el.listeners[tipo] || []).forEach((fn) => fn(evento || {})); },
  };
  return el;
}

const ids = [
  "admin-status", "members-list", "create-invite", "copy-invite", "invite-url",
  "invite-ttl", "admin-token", "save-token", "session-state", "admin-who",
  "save-certamen", "identity-form", "id-squad", "id-uni", "id-city",
  "id-logo-file", "identity-logo-preview", "logo-hint", "close-all", "load-audit",
  "audit-list", "save-identity",
];
const nodos = {};
ids.forEach((id) => { nodos[id] = elemento(); });

const almacen = new Map([["rally_session_token", "bueno"], ["rally_member_role", "admin"]]);
if (process.argv[3] === "sinprevia") almacen.delete("rally_session_token");
const storage = {
  getItem(k) { return almacen.has(k) ? almacen.get(k) : null; },
  setItem(k, v) { almacen.set(k, String(v)); },
  removeItem(k) { almacen.delete(k); },
};

const escenario = process.argv[2] || "malo";
let pide = 0;

function respuesta(metodo, url, headers, cuerpo) {
  const auth = (headers && (headers.Authorization || headers.authorization)) || "";
  pide += 1;
  if (url.indexOf("/api/session") === 0) {
    if (auth !== "Bearer bueno") {
      return { estado: 401, cuerpo: { ok: false, error: "no-autenticado" } };
    }
    return { estado: 200, cuerpo: { ok: true, project: "main", member: { id: "m1", name: "Ana", role: "admin" } } };
  }
  if (url.indexOf("/api/sections") === 0) {
    return { estado: 200, cuerpo: { ok: true, sections: {} } };
  }
  if (url.indexOf("/api/members") === 0) {
    return { estado: 200, cuerpo: { ok: true, members: [] } };
  }
  return { estado: 200, cuerpo: { ok: true } };
}

const fetchFalso = function (url, opciones) {
  const opcionesReales = opciones || {};
  const r = respuesta(opcionesReales.method || "GET", url, opcionesReales.headers, opcionesReales.body);
  return Promise.resolve({
    status: r.estado,
    ok: r.estado >= 200 && r.estado < 300,
    json: () => Promise.resolve(r.cuerpo),
  });
};

const sandbox = {
  window: {},
  document: {
    getElementById: (id) => nodos[id] || null,
    querySelector: () => null,
    querySelectorAll: () => [],
    createElement: () => elemento(),
  },
  location: { search: "", origin: "http://localhost:8000" },
  localStorage: storage,
  fetch: fetchFalso,
  confirm: () => true,
  navigator: { clipboard: { writeText: () => Promise.resolve() } },
  URLSearchParams,
  Date,
  console,
  setTimeout,
  clearTimeout,
};
sandbox.window = sandbox;
sandbox.confirm = () => true;

vm.createContext(sandbox);
try {
  vm.runInContext(FUENTE, sandbox, { filename: "admin.js" });
} catch (error) {
  console.log(JSON.stringify({ ok: false, error: String(error) }));
  process.exit(0);
}

async function esperar(ms) {
  await new Promise((listo) => setTimeout(listo, ms));
}

(async function () {
  await esperar(30);

  if (escenario === "malo") {
    nodos["admin-token"].value = "malo";
    nodos["save-token"].fire("click");
    await esperar(30);
  }

  console.log(JSON.stringify({
    ok: true,
    escenario,
    token: almacen.get("rally_session_token") || null,
    mensaje: nodos["admin-status"].textContent,
    sesion: nodos["session-state"].textContent,
    pide,
  }));
})();
