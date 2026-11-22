// Sonda de pruebas para la importacion de proyecto en dashboard/app.js
// Extrae el bloque de importacion y lo corre con un navegador mínimo simulado.
// Uso: node import_probe.js <comando> [json]
"use strict";

const fs = require("fs");
const path = require("path");
const vm = require("vm");

const fuente = fs.readFileSync(path.join(__dirname, "..", "..", "dashboard", "app.js"), "utf8");

const INICIO = "// ── IMPORTAR: VALIDAR Y RESPALDAR ANTES DE REEMPLAZAR";
const FIN = "function copySyncToken()";
const desde = fuente.indexOf(INICIO);
const hasta = fuente.indexOf(FIN);
if (desde < 0 || hasta < 0 || hasta < desde) {
  throw new Error("no se encontro el bloque de importacion en app.js");
}
const bloque = fuente.slice(desde, hasta);

const mem = Object.create(null);
const llamadas = [];

const sandbox = {
  console,
  JSON,
  Object,
  Array,
  String,
  Number,
  Boolean,
  Date,
  Error,
  localStorage: {
    getItem: (k) => (k in mem ? mem[k] : null),
    setItem: (k, v) => {
      mem[k] = String(v);
    },
    removeItem: (k) => {
      delete mem[k];
    },
  },
  alert: (m) => llamadas.push({ kind: "alert", mensaje: m }),
  getInitialState: () => ({
    rally_type: null,
    hours_total: 28,
    team_name: "",
    team_logo: "shield",
    challenges: [],
    team_members_count: 6,
  }),
  saveState: () => llamadas.push({ kind: "save" }),
  syncUI: () => llamadas.push({ kind: "sync" }),
  state: { team_name: "Equipo viejo" },
};
sandbox.window = sandbox;
sandbox.globalThis = sandbox;

vm.createContext(sandbox);
vm.runInContext(bloque, sandbox);

function salir(obj) {
  process.stdout.write(JSON.stringify(obj));
}

function main() {
  const comando = process.argv[2] || "";
  const arg = process.argv[3];
  const datos = arg ? JSON.parse(arg) : undefined;

  try {
    if (comando === "validar") {
      salir({ resultado: sandbox.validarProyectoImportado(datos) });
      return;
    }
    if (comando === "aplicar") {
      const resultado = sandbox.aplicarProyectoImportado(datos, "import");
      salir({
        resultado,
        estado: sandbox.state,
        respaldo: mem["rally_state_backup"] ? JSON.parse(mem["rally_state_backup"]) : null,
        llamadas,
      });
      return;
    }
  } catch (err) {
    salir({ error: String(err && err.message ? err.message : err) });
    return;
  }
  throw new Error("comando desconocido: " + comando);
}

main();
