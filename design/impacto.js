// Modulo Impacto y Plan Pais: laminas ODS + plan nacional, animadas y grabables.
// Estado en la identidad compartida (S.impacto). Un compositor de primitivas
// (componerLamina) alimenta DOS pintores — DOM para editar y canvas para
// export/grabar — desde la misma fuente: cero drift visual.
"use strict";

var IMP = loadIdentity();

var IMP_TIPOS = ['mosaico', 'ficha', 'plan'];
var IMP_ANCHO = 1920;
var IMP_ALTO = 1080;

// Programas articulables del plan nacional (rutura: chips checkbox).
var IMP_PROGRAMAS = [
  'Red de Ciudades Creativas',
  'Soberanía Alimentaria',
  'Ley 763 · Sándwich Nutritivo',
  'Bono Productivo Alimentario',
  'ENAPRECA'
];

function _escenario(el, prims) {
  if (!el) return;
  pintarDOM(el, prims);
}

// ---------- union brief + catálogo: que ODS van a la lamina ----------

function odsActivos(ident, briefOds) {
  var cat = (typeof ODS_DATA !== 'undefined') ? ODS_DATA : [];
  var guardados = (ident && ident.impacto && ident.impacto.odsOn) || {};
  var enBrief = [];
  (briefOds || []).forEach(function (t) {
    var n = odsOf(t);
    if (n && enBrief.indexOf(n) < 0) enBrief.push(n);
  });
  var salida = [];
  var vistos = {};
  enBrief.forEach(function (id) {
    if (!cat.some(function (o) { return o.id === id; })) return;
    salida.push({ id: id, on: guardados[id] !== false, brief: true });
    vistos[id] = true;
  });
  cat.forEach(function (o) {
    if (vistos[o.id]) return;
    salida.push({ id: o.id, on: guardados[o.id] === true, brief: false });
  });
  return salida;
}

function modoEfectivo(ident, brief) {
  var m = ident && ident.impacto && ident.impacto.plan && ident.impacto.plan.modo;
  if (m === 'nacional' || m === 'latam') return m;
  var rt = (ident && ident.rallyType) || (brief && brief.rally_type);
  return rt === 'latam' ? 'latam' : 'nacional';
}

// Tinta legible sobre un bloque de color: blanco si alcanza, si no el
// propio tono del bloque oscurecido (nunca gris neutro) hasta 4.5:1.
function tintaSobre(hexFondo) {
  if (contrastRatio('#FFFFFF', hexFondo) >= 4.5) return '#FFFFFF';
  for (var f = 0.85; f >= 0.05; f -= 0.05) {
    var c = darken(hexFondo, f);
    if (contrastRatio(c, hexFondo) >= 4.5) return c;
  }
  if (contrastRatio('#0D1B35', hexFondo) >= 4.5) return '#0D1B35';
  return '#000000';
}

// ---------- compositor: laminas como primitivas 1920x1080 ----------
// estado: {imp, pal, fonts, team, modo, brief}.

function _fontDe(estado, rol) {
  return (estado && estado.fonts && estado.fonts[rol]) || 'Barlow';
}

function _modosPlan(estado) {
  return modoEfectivo({ impacto: { plan: { modo: estado.imp.plan.modo } }, rallyType: estado.modo }, estado.brief);
}

// Encabezado comun a las tres laminas: marca + titulo del modulo.
function _cabecera(estado, titulo, subTxt) {
  var prims = [];
  var tinta = estado.pal.ink;
  prims.push({ k: 'txt', x: 84, y: 64, text: 'RALLY STUDIO', font: _fontDe(estado, 'l'), size: 22, weight: 700, color: estado.pal.ac, letter: 3 });
  prims.push({ k: 'txt', x: 84, y: 104, text: titulo, font: _fontDe(estado, 't'), size: 54, weight: 900, color: tinta });
  prims.push({ k: 'txt', x: 84, y: 172, text: subTxt, font: _fontDe(estado, 'b'), size: 30, weight: 500, color: estado.pal.mu });
  prims.push({ k: 'txt', x: 1836, y: 104, text: (estado.team && estado.team.name) || '', font: _fontDe(estado, 'b'), size: 30, weight: 700, color: tinta, align: 'right' });
  return prims;
}

function _pie(estado, ancho) {
  var uni = (estado.team && [estado.team.university, estado.team.city].filter(Boolean).join(' · ')) || '';
  var prims = [];
  prims.push({ k: 'rect', x: 84, y: 984, w: 96, h: 4, color: estado.pal.ac });
  if (uni) prims.push({ k: 'txt', x: 84, y: 1000, text: uni, font: _fontDe(estado, 'b'), size: 24, weight: 500, color: estado.pal.mu });
  return prims;
}

// Preset demosaico: 'bloques' | 'bandas' | 'ficha' (grilla compacta).
function _laminMosaico(estado, odsSel) {
  var prims = _cabecera(estado, 'Impacto en ODS', 'Objetivos de Desarrollo Sostenible que atiende la solución');
  var n = odsSel.length;
  var preset = estado.imp.preset || 'bloques';
  if (!n) return prims;
  var cols = n <= 1 ? 1 : n <= 4 ? 2 : n <= 9 ? 3 : n <= 12 ? 4 : 5;
  var filas = Math.ceil(n / cols);
  var margenX = 84, margenY = 236, hueco = 22;
  var abajo = 120;
  var cw = (IMP_ANCHO - margenX * 2 - hueco * (cols - 1)) / cols;
  var ch = (IMP_ALTO - margenY - abajo - hueco * (filas - 1)) / filas;
  if (preset === 'bandas') {
    cols = 1;
    filas = n;
    hueco = 14;
    cw = IMP_ANCHO - margenX * 2;
    ch = (IMP_ALTO - margenY - abajo - hueco * (filas - 1)) / filas;
  }
  odsSel.forEach(function (o, i) {
    var od = ODS_DATA[o.id - 1];
    if (!od) return;
    var col = i % cols, fil = Math.floor(i / cols);
    var x = margenX + col * (cw + hueco);
    var y = margenY + fil * (ch + hueco);
    var tinta = tintaSobre(od.color);
    prims.push({ k: 'rect', x: x, y: y, w: cw, h: ch, color: od.color });
    prims.push({ k: 'ico', x: x + 26, y: y + 26, s: Math.min(64, ch * 0.3), color: tinta, path: od.icon });
    prims.push({ k: 'txt', x: x + 26, y: y + ch - 96, text: od.code, font: _fontDe(estado, 'l'), size: 26, weight: 700, color: tinta });
    prims.push({ k: 'txt', x: x + 26, y: y + ch - 64, text: od.name, font: _fontDe(estado, 'b'), size: 30, weight: 700, color: tinta });
    if (preset !== 'bandas' && ch > 190) {
      prims.push({ k: 'txt', x: x + 26, y: y + 104, text: od.shortTarget, font: _fontDe(estado, 'b'), size: 21, weight: 500, color: tinta });
    }
  });
  return prims.concat(_pie(estado, IMP_ANCHO));
}

// Ficha de UN ODS: bloque de color a la izquierda + meta y conexión.
function _laminaFicha(estado, odsSel) {
  var o = odsSel[0];
  var od = o && ODS_DATA[o.id - 1];
  var prims = _cabecera(estado, 'Ficha de impacto', 'Cómo la solución conecta con este ODS');
  if (!od) return prims;
  var bx = 200, bw = 420, tam = 640;
  var tinta = tintaSobre(od.color);
  prims.push({ k: 'rect', x: bx, y: 300, w: bw, h: tam, color: od.color });
  prims.push({ k: 'ico', x: bx + 40, y: 340, s: 84, color: tinta, path: od.icon });
  prims.push({ k: 'txt', x: bx + 40, y: 850, text: od.code, font: _fontDe(estado, 'l'), size: 34, weight: 700, color: tinta });
  prims.push({ k: 'txt', x: 700, y: 320, text: od.name, font: _fontDe(estado, 't'), size: 72, weight: 900, color: estado.pal.ink });
  prims.push({ k: 'txt', x: 700, y: 430, text: od.shortTarget, font: _fontDe(estado, 'b'), size: 34, weight: 600, color: estado.pal.ac });
  var conecta = (estado.imp.textos['conecta' + o.id]) || 'La solución atiende esta meta directamente en el territorio, con pruebas y costo bajo.';
  prims.push({ k: 'txt', x: 700, y: 520, text: conecta, font: _fontDe(estado, 'b'), size: 30, weight: 400, color: estado.pal.ink });
  prims = prims.concat(_cabeceraQo(estado));
  return prims;
}

function _cabeceraQo(estado) {
  return [];
}

// Lámina plan: banda superior PNDH (nacional) o agenda sostenible (latam).
function _laminaPlan(estado, odsSel, modo) {
  var prims = [];
  var nacional = modo !== 'latam';
  var bandaY = 96, bandaH = 150;
  var banda = nacional ? estado.pal.ink : estado.pal.ac;
  var tintaBanda = tintaSobre(banda);
  var titulo = nacional ? 'Plan Nacional de Lucha contra la Pobreza 2022–2026' : 'Agenda sostenible para América Latina';
  var eje = (estado.brief && estado.brief.national_plan_axis) || (nacional ? '' : 'Ejes replicables en todo el territorio');
  prims.push({ k: 'rect', x: 84, y: bandaY, w: IMP_ANCHO - 168, h: bandaH, color: banda });
  prims.push({ k: 'txt', x: 124, y: bandaY + 30, text: titulo, font: _fontDe(estado, 't'), size: 42, weight: 900, color: tintaBanda });
  if (eje) {
    prims.push({ k: 'txt', x: 124, y: bandaY + 88, text: 'Eje: ' + eje, font: _fontDe(estado, 'b'), size: 26, weight: 500, color: tintaBanda });
  }
  var y = bandaY + bandaH + 60;
  prims.push({ k: 'txt', x: 84, y: y, text: nacional ? 'Programas articulados' : 'Alineamientos de agenda', font: _fontDe(estado, 'b'), size: 26, weight: 700, color: estado.pal.ac });
  y += 52;
  var progs = (estado.imp.plan.programas || []).slice(0, 6);
  var cx = 84, cy = y;
  progs.forEach(function (p, i) {
    var woaprox = 12 + p.length * 11.4;
    var chipH = 52;
    if (cx + woaprox > IMP_ANCHO - 84) { cx = 84; cy += chipH + 18; }
    prims.push({ k: 'rect', x: cx, y: cy, w: woaprox, h: chipH, color: estado.pal.gl, r: 26 });
    prims.push({ k: 'txt', x: cx + 20, y: cy + 13, text: p, font: _fontDe(estado, 'b'), size: 22, weight: 600, color: estado.pal.ink });
    cx += woaprox + 18;
  });
  cy = Math.max(cy + 92, y + 92);
  var muni = estado.imp.plan.municipio;
  if (muni) {
    prims.push({ k: 'txt', x: 84, y: cy, text: 'Anclaje territorial: ' + muni, font: _fontDe(estado, 'b'), size: 30, weight: 700, color: estado.pal.ink });
    cy += 56;
  }
  var cifra = estado.imp.plan.cifra;
  if (cifra) {
    prims.push({ k: 'txt', x: 84, y: cy + 8, text: cifra, font: _fontDe(estado, 'l'), size: 44, weight: 700, color: estado.pal.ac });
    cy += 72;
  }
  var texto = estado.imp.plan.texto;
  if (texto) {
    prims.push({ k: 'txt', x: 84, y: cy, text: texto, font: _fontDe(estado, 'b'), size: 24, weight: 400, color: estado.pal.mu });
  }
  prims = prims.concat(_pie(estado));
  return prims;
}

function componerLamina(tipo, estado, odsSel) {
  var bandera = _modosPlan(estado);
  odsSel = (odsSel || []).filter(function (o) { return o.on !== false && ODS_DATA[o.id - 1]; });
  if (tipo === 'ficha') return _laminaFicha(estado, odsSel);
  if (tipo === 'plan') return _laminaPlan(estado, odsSel, bandera);
  return _laminMosaico(estado, odsSel);
}

// ---------- pintor DOM ----------

function pintarDOM(el, prims) {
  if (!el) return;
  el.innerHTML = '';
  (prims || []).forEach(function (p) {
    if (p.k === 'rect') {
      var d = document.createElement('div');
      d.className = 'p-rect';
      d.style.cssText = 'left:' + p.x + 'px;top:' + p.y + 'px;width:' + p.w + 'px;height:' + p.h + 'px;background:' + p.color + (p.r ? (';border-radius:' + p.r + 'px') : '');
      el.appendChild(d);
    } else if (p.k === 'txt') {
      var s = document.createElement('p');
      s.className = 'p-txt';
      s.style.cssText = 'left:' + p.x + 'px;top:' + p.y + 'px;color:' + p.color +
        ';font:' + (p.weight || 400) + ' ' + p.size + 'px ' + p.font +
        (p.letter ? (';letter-spacing:' + p.letter + 'px') : '') +
        (p.align === 'right' ? (';left:auto;right:' + (IMP_ANCHO - p.x) + 'px') : '') +
        (p.align === 'center' ? (';transform:translateX(-50%)') : '') + ';text-align:' + (p.align || 'left') + ';';
      s.textContent = p.text;
      el.appendChild(s);
    } else if (p.k === 'ico') {
      var g = document.createElement('div');
      g.className = 'p-ico';
      g.style.cssText = 'left:' + p.x + 'px;top:' + p.y + 'px;width:' + p.s + 'px;height:' + p.s + 'px;color:' + p.color + ';';
      g.innerHTML = '<svg viewBox="0 0 24 24" width="' + p.s + '" height="' + p.s + '" fill="currentColor" stroke="currentColor">' + p.path + '</svg>';
      el.appendChild(g);
    }
  });
}

// ---------- pintor canvas ----------

function pintarCanvas(ctx, prims, escala) {
  ctx.save();
  ctx.scale(escala || 1, escala || 1);
  (prims || []).forEach(function (p) {
    var i;
    if (p.k === 'rect') {
      ctx.fillStyle = p.color;
      ctx.beginPath();
      if (p.r && ctx.roundRect) ctx.roundRect(p.x, p.y, p.w, p.h, p.r);
      else ctx.rect(p.x, p.y, p.w, p.h);
      ctx.fill();
    } else if (p.k === 'txt') {
      ctx.fillStyle = p.color;
      ctx.font = (p.weight || 400) + ' ' + p.size + 'px ' + p.font;
      if (p.letter !== undefined && 'letterSpacing' in ctx) ctx.letterSpacing = p.letter + 'px';
      else if ('letterSpacing' in ctx) ctx.letterSpacing = '0px';
      ctx.textAlign = p.align === 'center' ? 'center' : (p.align === 'right' ? 'right' : 'left');
      ctx.textBaseline = 'top';
      ctx.fillText(p.text, p.x, p.y);
    } else if (p.k === 'ico') {
      var k_ico = (p.s || 24) / 24;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.scale(k_ico, k_ico);
      ctx.fillStyle = p.color;
      ctx.strokeStyle = p.color;
      var piezas = String(p.path || '').match(/<(path|circle)[^>]*>/g) || [];
      for (i = 0; i < piezas.length; i++) {
        var pieza = piezas[i];
        var dh = (pieza.match(/d="([^"]*)"/) || [])[1];
        var esLinea = /fill="none"/.test(pieza);
        var sw = (pieza.match(/stroke-width="([\d.]+)"/) || [])[1];
        var esCirculo = /<circle/.test(pieza);
        if (esCirculo) {
          var ccx = +((pieza.match(/cx="([-\d.]+)"/) || [])[1]);
          var ccy = +((pieza.match(/cy="([-\d.]+)"/) || [])[1]);
          var rr = +((pieza.match(/r="([\d.]+)"/) || [])[1]);
          ctx.beginPath();
          ctx.arc(ccx, ccy, rr, 0, Math.PI * 2);
          if (esLinea) { if (sw) ctx.lineWidth = +sw; ctx.stroke(); }
          else ctx.fill();
        } else if (dh && typeof Path2D !== 'undefined') {
          try {
            var pd = new Path2D(dh);
            if (esLinea) { if (sw) ctx.lineWidth = +sw; ctx.stroke(pd); }
            else ctx.fill(pd);
          } catch (e2) {}
        }
      }
      ctx.restore();
    }
  });
  ctx.restore();
}

// ---------- presets del modulo (editables via identidad y UI) ----------

var RALLY_IMPACTO_PRESETS = [
  { id: 'bloques', nombre: 'Bloques', tipo: 'mosaico' },
  { id: 'bandas', nombre: 'Bandas horizontales', tipo: 'mosaico' },
  { id: 'ficha', nombre: 'Ficha individual', tipo: 'ficha' }
];

// PENDIENTE tareas 5–8: animacion (tamanosFase/faseEn), export PNG,
// grabacion WebM con microfono y fallback ZIP, narration con IA.

// Escala exacta del escenario al ancho disponible (la del CSS es respaldo).
function _escalarEscenario() {
  var stage = document.querySelector('.thumb-stage');
  var el = document.getElementById('laminaImp');
  if (!stage || !el) return;
  var k = stage.clientWidth / IMP_ANCHO;
  el.style.setProperty('--k', k);
}

// Estado global de la lamina actual para pintar (lleno por la UI en tareas 5+).
var IMP_SELECCION = null;
var compositorListo = true;

function pintar() {
  var tipo = (IMP_IDENT_TIPO && IMP_IDENT_TIPO()) || 'mosaico';
  var estado = {
    imp: IMP.impacto, pal: IMP.pal, fonts: IMP.fonts, team: IMP.team,
    modo: (IMP.rallyType || ''), brief: IMP._brief || {}
  };
  var sel = IMP_SELECCION || odsActivos(IMP, (IMP._brief && IMP._brief.ods_ids) || []).filter(function (o) { return o.on; });
  var el = document.getElementById('laminaImp');
  if (el) _escenario(el, componerLamina(tipo, estado, sel));
}

var IMP_IDENT_TIPO = function () {
  var s = document.getElementById('laminaSel');
  return s ? s.value : 'mosaico';
};

function arranqueImpacto() {
  _escalarEscenario();
  window.addEventListener('resize', _escalarEscenario);
  cargarBrief(IMP, function (ok, b) {
    if (b) { IMP._brief = b; aplicarBrief(b, IMP); }
    pintar();
  });
  pintar();
}

document.addEventListener('DOMContentLoaded', arranqueImpacto);
