/* Sonda de dashboard/avatars.js: carga el catalogo real y mide que campos
 * recibe la pagina. Uso: node tests/js/avatars_probe.js
 */
"use strict";

const fs = require("fs");
const path = require("path");
const vm = require("vm");

const RAIZ = path.resolve(__dirname, "..", "..");
const fuente = fs.readFileSync(path.join(RAIZ, "dashboard", "avatars.js"), "utf8");

const sandbox = { console: console, JSON: JSON, Object: Object, String: String, Array: Array };
sandbox.window = sandbox;
vm.createContext(sandbox);

let salida;
try {
  vm.runInContext(fuente, sandbox, { filename: "avatars.js" });
  const rav = sandbox.window.RAV;
  salida = {
    ok: true,
    total: rav.lista.length,
    primero: rav.lista[0],
    campos: Object.keys(rav.lista[0]).sort(),
    sinNombre: rav.lista.filter((a) => !a.nombre || a.nombre === "undefined").length,
    roles: rav.roles.length,
    nombreDePrimero: rav.nombre(rav.lista[0].id),
    rolNombre: rav.rolNombre("guion"),
    etiquetaLegada: rav.normalizar("nodo_alfa"),
    porRol: {
      admin: rav.porRol("admin"),
      mentor: rav.porRol("mentor"),
      visitor: rav.porRol("visitor"),
    },
    conNombre: rav.lista.filter((a) => a.nombre && a.nombre !== "undefined").map((a) => a.id),
  };
} catch (error) {
  salida = { ok: false, error: String(error && error.message) };
}

process.stdout.write(JSON.stringify(salida));
process.exit(0);
