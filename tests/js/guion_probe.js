// Sonda del medidor de palabras del guion: evalua el bloque real de
// dashboard/app_video.js (constantes + scriptPalabrasDe + scriptPalabras +
// scriptMeterTexto) en un contexto vacio y devuelve el veredicto por conteo.
//
// Uso: node guion_probe.js [conteos coma-separados]
// Salida: { ok, wpm, min, max, casos: [{n, segundos, mensaje}] }
"use strict";

const fs = require("fs");
const path = require("path");
const vm = require("vm");

const RAIZ = path.resolve(__dirname, "..", "..");
const FUENTE = path.join(RAIZ, "dashboard", "app_video.js");

function bloqueDelMedidor() {
  const texto = fs.readFileSync(FUENTE, "utf8");
  const inicio = texto.indexOf("const GUION_WPM");
  const fin = texto.indexOf("function copyFullScript");
  if (inicio < 0 || fin < 0 || fin < inicio) throw new Error("no encontre el medidor del guion");
  return texto.slice(inicio, fin);
}

function medir(conteos) {
  const contexto = { state: { script: {} }, console };
  vm.createContext(contexto);
  vm.runInContext(bloqueDelMedidor(), contexto, { filename: "app_video.js:medidor" });
  vm.runInContext("function rsWordCount(t){return String(t||'').trim().split(/\\s+/).filter(Boolean).length}", contexto);

  const casos = conteos.map((n) => {
    const palabras = Array.from({ length: n }, (_, i) => "p" + (i + 1)).join(" ");
    contexto.state.script = { acto1: palabras, acto2: "", acto3: "", acto4: "" };
    const segundos = vm.runInContext("Math.round((scriptPalabras() / GUION_WPM) * 60)", contexto);
    return { n, segundos, mensaje: vm.runInContext("scriptMeterTexto()", contexto) };
  });

  return {
    ok: true,
    wpm: vm.runInContext("GUION_WPM", contexto),
    min: vm.runInContext("GUION_MIN_PALABRAS", contexto),
    max: vm.runInContext("GUION_MAX_PALABRAS", contexto),
    casos,
  };
}

try {
  const arg = process.argv[2] || "0,100,240,250,269,270,280";
  const conteos = arg.split(",").map((x) => parseInt(x.trim(), 10)).filter((n) => Number.isFinite(n));
  process.stdout.write(JSON.stringify(medir(conteos)) + "\n");
} catch (error) {
  process.stdout.write(JSON.stringify({ ok: false, error: String(error && error.message) }) + "\n");
}
