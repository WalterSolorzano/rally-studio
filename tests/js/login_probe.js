/* Sonda de dashboard/login.js: monta la puerta y mide que dice y a donde manda.
 *
 * Uso: node tests/js/login_probe.js <escenario>
 *   llave-vacia | clave-invalida | pendiente | invitacion-pegada |
 *   volver-malo | volver-bueno | estatico-sin-subtle
 */
"use strict";

const fs = require("fs");
const path = require("path");
const vm = require("vm");

const RAIZ = path.resolve(__dirname, "..", "..");
const FUENTE = fs.readFileSync(path.join(RAIZ, "dashboard", "login.js"), "utf8");

function elemento(id) {
  return {
    id: id,
    textContent: "",
    value: "",
    type: "password",
    required: false,
    disabled: false,
    placeholder: "",
    style: {},
    attrs: {},
    listeners: {},
    focus() {},
    addEventListener(tipo, fn) {
      (this.listeners[tipo] = this.listeners[tipo] || []).push(fn);
    },
    setAttribute(k, v) {
      this.attrs[k] = String(v);
    },
    getAttribute(k) {
      return k in this.attrs ? this.attrs[k] : null;
    },
    removeAttribute(k) {
      delete this.attrs[k];
    },
    fire(tipo, evento) {
      (this.listeners[tipo] || []).forEach((fn) => fn(evento || { preventDefault() {} }));
    },
  };
}

const IDS = [
  "puerta-form", "puerta-form-llave", "puerta-panel-llave", "puerta-llave",
  "puerta-nombre", "puerta-persona", "puerta-clave", "puerta-modo",
  "puerta-entrar", "puerta-entrar-llave", "puerta-ver", "puerta-estado",
  "puerta-nota", "puerta-miembros",
];

function correr(escenario) {
  const nodos = {};
  IDS.forEach((id) => { nodos[id] = elemento(id); });

  const guardado = new Map();
  const reemplazos = [];

  const busquedas = {
    "llave-vacia": { search: "" },
    "clave-invalida": { search: "" },
    pendiente: { search: "" },
    "invitacion-pegada": { search: "" },
    "volver-malo": { search: "?volver=" + encodeURIComponent("/\\evil.example/x") },
    "volver-bueno": { search: "?volver=" + encodeURIComponent("/perfil.html") },
    "estatico-sin-subtle": { search: "" },
  };
  const busqueda = (busquedas[escenario] || { search: "" }).search;

  const respuestas = {
    "llave-vacia": { ok: false, status: 400, body: { ok: false, error: "llave-vacia" } },
    "clave-invalida": { ok: false, status: 401, body: { ok: false, error: "clave-invalida" } },
    pendiente: { ok: false, status: 403, body: { ok: false, error: "pendiente" } },
    "invitacion-pegada": { ok: true, status: 200, body: { ok: true } },
    "volver-malo": {
      ok: true, status: 200,
      body: { ok: true, project: "main", session: "sess", member: { id: "m1", name: "Ana", role: "admin" } },
    },
    "volver-bueno": {
      ok: true, status: 200,
      body: { ok: true, project: "main", session: "sess", member: { id: "m1", name: "Ana", role: "admin" } },
    },
    "estatico-sin-subtle": { ok: true, status: 200, body: { ok: true } },
  };

  const pide = [];

  const sandbox = {
    console: console,
    URLSearchParams: URLSearchParams,
    TextEncoder: TextEncoder,
    setTimeout: setTimeout,
    clearTimeout: clearTimeout,
    location: {
      search: busqueda,
      hostname: escenario === "estatico-sin-subtle" ? "equipo.github.io" : "127.0.0.1",
      protocol: "http:",
      replace(url) { reemplazos.push(String(url)); },
    },
    crypto: escenario === "estatico-sin-subtle"
      ? {}
      : { subtle: { digest: () => Promise.resolve(new ArrayBuffer(32)) } },
    localStorage: {
      getItem(k) { return guardado.has(k) ? guardado.get(k) : null; },
      setItem(k, v) { guardado.set(k, String(v)); },
      removeItem(k) { guardado.delete(k); },
    },
    document: {
      getElementById(id) { return nodos[id] || null; },
    },
  };
  sandbox.window = sandbox;
  // La llave correcta del modo estatico, para que el fallo no sea el valor.
  sandbox.__llaveCorrecta = "rally-latam-2026";

  sandbox.fetch = function (url, opciones) {
    pide.push({ url: String(url), cuerpo: (opciones && opciones.body) || null });
    if (String(url).indexOf("/api/acceso/estado") >= 0) {
      return Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ ok: true, protegido: true, miembros: 2 }),
      });
    }
    const r = respuestas[escenario] || respuestas["volver-bueno"];
    return Promise.resolve({
      ok: r.ok,
      status: r.status,
      json: () => Promise.resolve(r.body),
    });
  };

  vm.createContext(sandbox);
  try {
    vm.runInContext(FUENTE, sandbox, { filename: "login.js" });
  } catch (error) {
    return Promise.resolve({ ok: false, escenario: escenario, error: String(error && error.message) });
  }

  // La puerta visible es nombre + clave; la llave vive plegada al pie.
  // Primero se deja que el fetch de estado diga si el proyecto ya tiene gente,
  // y solo despues se rellena la forma que corresponde y se envia.
  const esperar = (ms) => new Promise((listo) => setTimeout(listo, ms));
  const conLlave = escenario === "llave-vacia" || escenario === "invitacion-pegada" ||
    escenario === "estatico-sin-subtle";

  return esperar(20)
    .then(() => {
      if (escenario === "clave-invalida" || escenario === "pendiente") {
        nodos["puerta-persona"].value = "Ana";
        nodos["puerta-clave"].value = "secreta";
      } else if (escenario === "invitacion-pegada") {
        nodos["puerta-llave"].value = "https://equipo.example/join.html?t=tok-123";
      } else if (escenario === "estatico-sin-subtle") {
        nodos["puerta-llave"].value = "rally-latam-2026";
      } else if (escenario === "llave-vacia") {
        nodos["puerta-llave"].value = "   ";
      } else {
        nodos["puerta-persona"].value = "Ana";
        nodos["puerta-clave"].value = "secreta";
      }

      nodos[conLlave ? "puerta-form-llave" : "puerta-form"].fire("submit");
      return esperar(60);
    })
    .then(() => ({
      ok: true,
      escenario: escenario,
      estado: nodos["puerta-estado"].textContent,
      nota: nodos["puerta-nota"].textContent,
      reemplazo: reemplazos,
      guardado: Array.from(guardado.keys()),
      pide: pide.length,
    }));
}

correr(process.argv[2] || "volver-bueno")
  .then((datos) => {
    process.stdout.write(JSON.stringify(datos));
    process.exit(0);
  })
  .catch((error) => {
    process.stdout.write(JSON.stringify({ ok: false, error: String(error && error.stack) }));
    process.exit(0);
  });
