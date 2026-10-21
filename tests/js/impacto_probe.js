// Sonda de pruebas para el modulo impacto: estado compartido.
// Carga design/shared.js (y mas adelante impacto.js) en Node con navegador
// minimo simulado. Uso: node impacto_probe.js <comando> [json]
"use strict";

const fs = require("fs");
const path = require("path");
const vm = require("vm");

const store = Object.create(null);

function memoria(destino) {
  return {
    getItem: (k) => (k in destino ? destino[k] : null),
    setItem: (k, v) => {
      destino[k] = String(v);
    },
    removeItem: (k) => {
      delete destino[k];
    },
  };
}

const sandbox = {
  console,
  JSON,
  Object,
  Array,
  String,
  Number,
  Boolean,
  Math,
  Date,
  Promise,
  Error,
  isFinite,
  encodeURIComponent,
  location: { protocol: "http:" },
  localStorage: memoria(store),
  sessionStorage: memoria(Object.create(null)),
  document: { readyState: "complete" },
  fetch: () => Promise.reject(new Error("sin red en la sonda")),
};
sandbox.window = sandbox;
sandbox.globalThis = sandbox;

vm.createContext(sandbox);
vm.runInContext(fs.readFileSync(path.join(__dirname, "..", "..", "design", "shared.js"), "utf8"), sandbox);

// Modulos que la sonda del modulo impacto puede necesitar (si existen).
for (const archivo of ["ods_data.js", "impacto.js"]) {
  const ruta = path.join(__dirname, "..", "..", "design", archivo);
  if (fs.existsSync(ruta)) {
    vm.runInContext(fs.readFileSync(ruta, "utf8"), sandbox);
  }
}

function salir(obj) {
  process.stdout.write(JSON.stringify(obj));
}

const comando = process.argv[2];

switch (comando) {
  case "odsof":
    salir({
      d12: typeof sandbox.odsOf === "function" ? sandbox.odsOf(process.argv[3] || "ODS 12") : null,
    });
    break;
  case "odsof-lote": {
    const textos = JSON.parse(process.argv[3] || "[]");
    salir(
      textos.map((t) => (typeof sandbox.odsOf === "function" ? sandbox.odsOf(t) : "__ausente__"))
    );
    break;
  }
  case "por-defecto": {
    const def = typeof sandbox.impactoPorDefecto === "function" ? sandbox.impactoPorDefecto() : null;
    if (!def) { salir({ error: "impactoPorDefecto ausente" }); break; }
    salir({
      claves: { preset: def.preset === "", dur: def.dur === 5, odsOn: !!def.odsOn, textos: !!def.textos,
        plan: !!def.plan, narracion: !!def.narracion, anim: !!def.anim },
      plan: def.plan && def.plan.modo === "" && Array.isArray(def.plan.programas),
      animOK: !!def.anim && def.anim.mosaico && def.anim.mosaico.entrada === "banda"
        && def.anim.mosaico.enfasis === "pulso" && def.anim.mosaico.salida === "fade"
        && def.anim.ficha && def.anim.ficha.entrada === "fade"
        && def.anim.ficha.enfasis === "pop" && def.anim.ficha.salida === "none"
        && def.anim.plan && def.anim.plan.entrada === "wipe"
        && def.anim.plan.enfasis === "none" && def.anim.plan.salida === "fade",
    });
    break;
  }
  case "normalize": {
    const id = JSON.parse(process.argv[3] || "{}");
    const n = sandbox.normalizeIdentity(id);
    salir({
      impact: n.impacto && n.impacto.odsOn && n.impacto.odsOn["12"] === false,
     impactoCompleto: !!n.impacto && n.impacto.dur === 5 && !!n.impacto.anim,
    });
    break;
  }
  default:
    salir({ error: "comando desconocido: " + comando });
}
