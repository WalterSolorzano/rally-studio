// Sonda de dashboard/chat.js: evalúa resumenEstado() y huecos() reales.
// Uso: node chat_probe.js <json_estado>
// Devuelve {ok, resumen, huecos}.
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const RAIZ = path.resolve(__dirname, "..", "..");
const fuente = fs.readFileSync(path.join(RAIZ, "dashboard", "chat.js"), "utf8");

const inicio = fuente.indexOf("function txt(");
const fin = fuente.indexOf("function resumenAgentes(");
if (inicio < 0 || fin < 0 || fin <= inicio) {
  console.log(JSON.stringify({ ok: false, error: "no se pudo aislar el bloque de resumen" }));
  process.exit(0);
}

const contexto = { console: console };
vm.createContext(contexto);
try {
  vm.runInContext(fuente.slice(inicio, fin), contexto, { filename: "chat_bloque.js" });
} catch (e) {
  console.log(JSON.stringify({ ok: false, error: String(e && e.message) }));
  process.exit(0);
}

let estado = {};
try {
  estado = JSON.parse(process.argv[2] || "{}");
} catch (e) {
  estado = {};
}

try {
  const resumen = vm.runInContext("resumenEstado", contexto)(estado);
  const faltan = vm.runInContext("huecos", contexto)(estado);
  console.log(JSON.stringify({ ok: true, resumen: resumen, huecos: faltan }));
} catch (e) {
  console.log(JSON.stringify({ ok: false, error: String(e && e.message) }));
}
