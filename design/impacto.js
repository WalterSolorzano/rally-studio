// Modulo Impacto y Plan Pais: laminas ODS + plan nacional, animadas y grabables.
// Estado en la identidad compartida (S.impacto). El compositor de primitivas
// alimenta DOM y canvas desde la misma fuente (ver composicion, Task 4+).
"use strict";

var IMP = loadIdentity();

var IMP_TIPOS = ['mosaico', 'ficha', 'plan'];

// Escala exacta del escenario al ancho disponible (la del CSS es un respaldo).
function _escalarEscenario() {
  var stage = document.querySelector('.thumb-stage');
  var el = document.getElementById('laminaImp');
  if (!stage || !el) return;
  var k = stage.clientWidth / 1920;
  el.style.setProperty('--k', k);
}

function pintar() {
  // Stub: el compositor de laminas llega en la tarea de composicion.
  if (typeof compositorListo === 'undefined') return;
}

function arranqueImpacto() {
  _escalarEscenario();
  window.addEventListener('resize', _escalarEscenario);
  cargarBrief(IMP, function (ok, b) {
    if (b) IMP._brief = b;
    pintar();
  });
  pintar();
}

document.addEventListener('DOMContentLoaded', arranqueImpacto);
