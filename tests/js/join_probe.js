// Sonda de dashboard/join.js: monta un DOM minimo y mide que dice la pagina
// cuando el servidor rechaza, cuando falta la invitacion y cuando el navegador
// no ofrece crypto.randomUUID (contexto inseguro: http://192.168.x.x:8000).
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const RAIZ = path.resolve(__dirname, "..", "..");
const FUENTE = fs.readFileSync(path.join(RAIZ, "dashboard", "join.js"), "utf8");

function elemento(id) {
  return {
    id: id,
    textContent: "",
    innerHTML: "",
    disabled: false,
    value: "",
    focus: function () {},
    setAttribute: function (clave, valor) { this[clave] = valor; },
    addEventListener: function (tipo, fn) { this["on" + tipo] = fn; },
  };
}

function correr(escenario) {
  const ids = ["join-form", "join-name", "join-clave", "join-submit", "join-status", "join-avatares", "join-roles"];
  const nodos = {};
  ids.forEach(function (id) { nodos[id] = elemento(id); });

  const guardado = new Map();
  const remplazos = [];
  const pide = [];

  const form = nodos["join-form"];
  form.querySelector = function () { return null; };
  form.querySelectorAll = function () { return []; };

  const respuestas = {
    usado: { ok: false, estado: 400, cuerpo: { ok: false, error: "invite-usado" } },
    expirado: { ok: false, estado: 400, cuerpo: { ok: false, error: "invite-expirado" } },
    corta: { ok: false, estado: 400, cuerpo: { ok: false, error: "clave-corta" } },
    pendiente: { ok: true, estado: 200, cuerpo: { ok: true, pending: true } },
    sinsesion: { ok: true, estado: 200, cuerpo: { ok: true, project: "main" } },
    ok: {
      ok: true,
      estado: 200,
      cuerpo: {
        ok: true,
        session: "sess-1",
        project: "main",
        member: { id: "mem_1", name: "Ana", role: "member", avatar: "av_profe" },
      },
    },
  };

  const sandbox = {
    console: console,
    URLSearchParams: URLSearchParams,
    location: {
      search: escenario === "sininvitacion" ? "" : "?t=token123",
      replace: function (url) { remplazos.push(url); },
    },
    localStorage: {
      getItem: function (k) { return guardado.has(k) ? guardado.get(k) : null; },
      setItem: function (k, v) { guardado.set(k, String(v)); },
      removeItem: function (k) { guardado.delete(k); },
    },
    crypto: escenario === "nocrypto" ? {} : { randomUUID: function () { return "uuid-falso"; } },
    document: {
      getElementById: function (id) { return nodos[id] || null; },
    },
    window: { RAV: { lista: [{ id: "av_profe", nombre: "Profe" }], roles: [{ id: "guion", nombre: "Guion" }], svg: function () { return "<svg></svg>"; } } },
  };
  sandbox.window.document = sandbox.document;
  sandbox.RAV = sandbox.window.RAV;
  sandbox.fetch = function (url, opciones) {
    pide.push({ url: url, cuerpo: opciones && opciones.body });
    const r = respuestas[escenario] || respuestas.ok;
    return Promise.resolve({
      ok: r.ok,
      status: r.estado,
      json: function () { return Promise.resolve(r.cuerpo); },
    });
  };

  vm.createContext(sandbox);
  try {
    vm.runInContext(FUENTE, sandbox, { filename: "join.js" });
  } catch (error) {
    return Promise.resolve({ ok: false, escenario: escenario, error: String(error && error.message) });
  }

  nodos["join-name"].value = "Ana";
  nodos["join-clave"].value = escenario === "clavelarga" ? "secreta12" : "";

  const submit = form.onsubmit;
  if (!submit) return Promise.resolve({ ok: false, escenario: escenario, error: "sin manejador de submit" });

  const listo = submit({ preventDefault: function () {} });
  return Promise.resolve(listo).then(function () {
    return {
      ok: true,
      escenario: escenario,
      estado: nodos["join-status"].textContent,
      botonDeshabilitado: nodos["join-submit"].disabled,
      pide: pide.filter(function (p) {
        return String(p.url).indexOf("/api/project/claim") >= 0;
      }).length,
      reemplazo: remplazos,
      guardado: Array.from(guardado.keys()),
      antesDeSubmit: null,
    };
  });
}

const escenario = process.argv[2] || "usado";
correr(escenario)
  .then(function (datos) {
    process.stdout.write(JSON.stringify(datos));
    process.exit(0);
  })
  .catch(function (error) {
    process.stdout.write(JSON.stringify({ ok: false, error: String(error && error.stack) }));
    process.exit(0);
  });
