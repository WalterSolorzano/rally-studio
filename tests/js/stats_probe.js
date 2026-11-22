/* stats_probe.js -- ejercita peakSummary() del dashboard/stats.js real.
   Uso: node stats_probe.js <json_datos>
   Devuelve {ok, names, text}. */
"use strict";
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const RAIZ = path.resolve(__dirname, "..", "..");
const FUENTE = fs.readFileSync(path.join(RAIZ, "dashboard", "stats.js"), "utf8");
const INICIO = FUENTE.indexOf("const nf =");
const FIN = FUENTE.indexOf("function renderRhythm(");
if (INICIO < 0 || FIN < 0) {
  console.log(JSON.stringify({ ok: false, error: "no se encontro el bloque de peakSummary" }));
  process.exit(0);
}

function leer(arg) {
  if (arg && arg.startsWith("@")) return JSON.parse(fs.readFileSync(arg.slice(1), "utf8"));
  return JSON.parse(arg);
}

let datos;
try {
  datos = leer(process.argv[2] || "{}");
} catch (error) {
  console.log(JSON.stringify({ ok: false, error: `json invalido: ${error.message}` }));
  process.exit(0);
}

const contexto = {
  data: datos,
  window: { matchMedia: () => ({ matches: true }) },
  document: {
    querySelector: () => null,
    querySelectorAll: () => [],
    getElementById: () => null
  },
  URLSearchParams: class { has() { return false; } },
  navigator: { webdriver: false }
};
vm.createContext(contexto);

try {
  const resultado = vm.runInContext(FUENTE.slice(INICIO, FIN) + "\npeakSummary();", contexto);
  console.log(JSON.stringify({ ok: true, names: resultado.names, text: resultado.text }));
} catch (error) {
  console.log(JSON.stringify({ ok: false, error: String(error && error.message) }));
}
process.exit(0);
