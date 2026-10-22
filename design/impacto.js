// Modulo Impacto y Plan Pais: laminas ODS + plan nacional, animadas y grabables.
// Estado en la identidad compartida (S.impacto). Un compositor de primitivas
// (componerLamina) alimenta DOS pintores — DOM para editar y canvas para
// export/grabar — desde la misma fuente: cero drift visual.
"use strict";

var IMP = loadIdentity();

var IMP_TIPOS = ['mosaico', 'ficha', 'plan'];
var IMP_ANCHO = 1920;
var IMP_ALTO = 1080;
var IMP_SELECCION = null;   // ODS elegido para la lámina ficha (runtime)
var compositorListo = true; // flag de la tarea de composicion (stub legado)

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

// ---------- Task 5: timeline de animacion ----------

// Vocabulario cerrado: entrada fade|slide-izq|slide-arriba|wipe|banda,
// enfasis none|pulso|pop, salida none|fade|slide.
var IMP_ANIM_OPCIONES = {
  entrada: ['fade', 'slide-izq', 'slide-arriba', 'wipe', 'banda'],
  enfasis: ['none', 'pulso', 'pop'],
  salida: ['none', 'fade', 'slide']
};
var IMP_ANIM_CLASES = {
  'fade': 'impInFade', 'slide-izq': 'impInSlideIzq', 'slide-arriba': 'impInSlideArriba',
  'wipe': 'impInWipe', 'banda': 'impInBanda',
  'pulso': 'impEnfPulso', 'pop': 'impEnfPop',
  'salida-fade': 'impOutFade', 'salida-slide': 'impOutSlide'
};

// Tamaios de fase en segundos: entrada 20% (min 0.6), enfasis 30% (si != none),
// salida 20%, el resto hold. dur admitido: 3..10 s.
function tamanosFase(entrada, enfasis, salida, dur) {
  if (!(dur >= 3 && dur <= 10)) throw new RangeError('dur fuera de 3-10');
  var tIn = Math.max(0.6, dur * 0.2);
  var tEn = (enfasis && enfasis !== 'none') ? dur * 0.3 : 0;
  var tOut = (salida && salida !== 'none') ? dur * 0.2 : 0;
  return { tIn: tIn, tEn: tEn, tOut: tOut, dur: dur, entrada: entrada, enfasis: enfasis, salida: salida };
}

function faseEn(t, fases) {
  var d = fases.dur;
  if (t >= d) return 'fin';
  if (t < fases.tIn) return 'in';
  if (fases.tEn && t < fases.tIn + fases.tEn) return 'enf';
  if (fases.tOut && t >= d - fases.tOut) return 'out';
  return 'hold';
}

// ---------- reproductor DOM ----------

// Escala exacta del escenario al ancho disponible (la del CSS es respaldo).
function _escalarEscenario() {
  var stage = document.querySelector('.thumb-stage');
  var el = document.getElementById('laminaImp');
  if (!stage || !el) return;
  var k = stage.clientWidth / IMP_ANCHO;
  el.style.setProperty('--k', k);
}

var _impTimers = [];

function _impSetAnim(hijos, clase, t) {
  if (!clase) return;
  hijos.forEach(function (h) {
    h.style.animation = ''; void h.offsetWidth;
    h.style.animation = clase + ' ' + t + 's cubic-bezier(.33,1,.68,1) both';
  });
}

function reproducirAnimacion(tipo) {
  var a = (IMP.impacto.anim && IMP.impacto.anim[tipo]) || {};
  var dur = a.dur || IMP.impacto.dur || 5;
  var fases = tamanosFase(a.entrada || 'fade', a.enfasis || 'none', a.salida || 'none', dur);
  var el = document.getElementById('laminaImp');
  if (!el) return fases;
  var hijos = Array.prototype.slice.call(el.children);
  var estado = document.getElementById('statusRepro');
  _impClearTimers();
  if (estado) estado.textContent = 'Reproduciendo (' + dur + ' s)…';
  _impSetAnim(hijos, IMP_ANIM_CLASES[a.entrada || 'fade'], fases.tIn);
  if (fases.tEn) {
    _impTimers.push(setTimeout(function () {
      _impSetAnim(hijos, IMP_ANIM_CLASES[a.enfasis || 'none'], fases.tEn);
    }, fases.tIn * 1000));
  }
  if (fases.tOut) {
    _impTimers.push(setTimeout(function () {
      _impSetAnim(hijos, IMP_ANIM_CLASES['salida-' + (a.salida || 'fade')], fases.tOut);
    }, (fases.dur - fases.tOut) * 1000));
  }
  _impTimers.push(setTimeout(function () {
    hijos.forEach(function (h) { h.style.animation = ''; });
    if (estado) estado.textContent = 'Reproducido. La lamina queda en su frame final.';
  }, fases.dur * 1000 + 120));
  return fases;
}

function _impClearTimers() {
  _impTimers.forEach(clearTimeout);
  _impTimers = [];
}

// ---------- guardado y cableado de UI ----------

function _guardar() { saveIdentity(IMP); }

function _estadoLamina() {
  return {
    imp: IMP.impacto, pal: IMP.pal, fonts: IMP.fonts, team: IMP.team,
    modo: IMP.rallyType || '', brief: IMP._brief || {}
  };
}

function _odsSelPara(tipo) {
  var activos = odsActivos(IMP, (IMP._brief && IMP._brief.ods_ids) || []);
  if (tipo === 'plan') return activos.filter(function (o) { return o.on; });
  if (tipo === 'ficha') {
    var sel = IMP_SELECCION;
    var ods = sel && ODS_DATA[sel - 1] ? [{ id: sel, on: true }] : null;
    if (ods) return ods;
    var on = activos.filter(function (o) { return o.on; });
    return on.length ? [on[0]] : [];
  }
  return activos.filter(function (o) { return o.on; });
}

function pintar() {
  var tipo = IMP_IDENT_TIPO();
  var el = document.getElementById('laminaImp');
  if (el) _escenario(el, componerLamina(tipo, _estadoLamina(), _odsSelPara(tipo)));
  var w = document.getElementById('fichaOdsWrap');
  if (w) w.style.display = tipo === 'ficha' ? '' : 'none';
}

var compositorListo = true;

var IMP_IDENT_TIPO = function () {
  var s = document.getElementById('laminaSel');
  return s ? s.value : 'mosaico';
};

// Chips ODS del brief + override manual (persistente).
function renderChips() {
  var wrap = document.getElementById('chipsOds');
  if (!wrap) return;
  var activos = odsActivos(IMP, (IMP._brief && IMP._brief.ods_ids) || []);
  wrap.innerHTML = '';
  activos.forEach(function (o) {
    var od = ODS_DATA[o.id - 1];
    var l = document.createElement('label');
    l.className = 'check';
    var c = document.createElement('input');
    c.type = 'checkbox';
    c.checked = !!o.on;
    c.addEventListener('change', function () {
      IMP.impacto.odsOn[o.id] = c.checked;
      _guardar();
      renderChips();
      pintar();
    });
    var sw = document.createElement('span');
    sw.className = 'chipcolor';
    sw.style.background = od.color;
    l.appendChild(c);
    l.appendChild(sw);
    l.appendChild(document.createTextNode(od.code + ' · ' + od.name));
    wrap.appendChild(l);
  });
}

function renderFichaOds() {
  var s = document.getElementById('fichaOds');
  if (!s) return;
  s.innerHTML = '';
  var activos = odsActivos(IMP, (IMP._brief && IMP._brief.ods_ids) || []).filter(function (o) { return o.on; });
  if (!IMP_SELECCION && activos.length) IMP_SELECCION = activos[0].id;
  activos.forEach(function (o) {
    var od = ODS_DATA[o.id - 1];
    var op = document.createElement('option');
    op.value = o.id;
    op.textContent = od.code + ' · ' + od.name;
    s.appendChild(op);
  });
  if (IMP_SELECCION) s.value = String(IMP_SELECCION);
  s.addEventListener('change', function () {
    IMP_SELECCION = +s.value;
    pintar();
  });
}

// Plan País: modo, programas, municipio, cifra, texto.
function wirePlan() {
  var p = IMP.impacto.plan;
  var sel = document.getElementById('planModo');
  if (sel) {
    sel.value = p.modo || '';
    sel.addEventListener('change', function () { p.modo = sel.value; _guardar(); dibujarChipsProgramas(); pintar(); });
  }
  ['planMuni', 'planCifra', 'planTexto'].forEach(function (id) {
    var el = document.getElementById(id);
    if (!el) return;
    var campo = { planMuni: 'municipio', planCifra: 'cifra', planTexto: 'texto' }[id];
    el.value = p[campo] || '';
    el.addEventListener('input', function () { p[campo] = el.value; _guardar(); if (IMP_IDENT_TIPO() === 'plan') pintar(); });
  });
  dibujarChipsProgramas();
}

function dibujarChipsProgramas() {
  var wrap = document.getElementById('planProg');
  if (!wrap) return;
  var p = IMP.impacto.plan;
  var esLatam = modoEfectivo(IMP, IMP._brief) === 'latam';
  wrap.innerHTML = '';
  if (esLatam) {
    var inp = document.createElement('input');
    inp.type = 'text';
    inp.placeholder = 'Alineamientos de agenda separados por coma';
    inp.value = (p.programas || []).join(', ');
    inp.addEventListener('input', function () {
      p.programas = inp.value.split(',').map(function (x) { return x.trim(); }).filter(Boolean);
      _guardar();
      if (IMP_IDENT_TIPO() === 'plan') pintar();
    });
    wrap.className = '';
    wrap.appendChild(inp);
    return;
  }
  wrap.className = 'chip-row';
  IMP_PROGRAMAS.forEach(function (nombre) {
    var l = document.createElement('label');
    l.className = 'check';
    var c = document.createElement('input');
    c.type = 'checkbox';
    c.checked = (p.programas || []).indexOf(nombre) >= 0;
    c.addEventListener('change', function () {
      var arr = (p.programas || []).slice();
      var i = arr.indexOf(nombre);
      if (c.checked && i < 0) arr.push(nombre);
      if (!c.checked && i >= 0) arr.splice(i, 1);
      p.programas = arr;
      _guardar();
      pintar();
    });
    l.appendChild(c);
    l.appendChild(document.createTextNode(nombre));
    wrap.appendChild(l);
  });
}

// Animación: selects por tipo + dur por tipo (override del dur global).
var IMP_TIPO_ETIQUETA = { mosaico: 'Mosaico ODS', ficha: 'Ficha', plan: 'Plan País' };

function renderAnimBody() {
  var body = document.getElementById('animBody');
  if (!body) return;
  body.innerHTML = '';
  IMP_TIPOS.forEach(function (tipo) {
    var a = (IMP.impacto.anim[tipo] = IMP.impacto.anim[tipo] || impactoPorDefecto().anim[tipo]);
    var tit = document.createElement('div');
    tit.className = 'field';
    tit.innerHTML = '<label>' + (IMP_TIPO_ETIQUETA[tipo] || tipo) + '</label>';
    var grid = document.createElement('div');
    grid.className = 'grid g2';
    [['entrada', 'Entrada'], ['enfasis', 'Énfasis'], ['salida', 'Salida']].forEach(function (par) {
      var campo = par[0], etiqueta = par[1];
      var caja = document.createElement('div');
      caja.innerHTML = '<label class="mini">' + etiqueta + '</label>';
      var s = document.createElement('select');
      IMP_ANIM_OPCIONES[campo].forEach(function (op) {
        var o = document.createElement('option');
        o.value = op;
        o.textContent = op;
        s.appendChild(o);
      });
      s.value = a[campo] || 'none';
      s.addEventListener('change', function () {
        a[campo] = s.value;
        _guardar();
      });
      caja.appendChild(s);
      grid.appendChild(caja);
    });
    var cajaDur = document.createElement('div');
    cajaDur.innerHTML = '<label class="mini">Segundos (3–10)</label>';
    var dur = document.createElement('input');
    dur.type = 'number';
    dur.min = 3; dur.max = 10; dur.step = 0.5;
    dur.value = a.dur || IMP.impacto.dur || 5;
    dur.addEventListener('change', function () {
      var v = Math.min(10, Math.max(3, parseFloat(dur.value) || 5));
      dur.value = v;
      a.dur = v;
      _guardar();
    });
    cajaDur.appendChild(dur);
    grid.appendChild(cajaDur);
    tit.appendChild(grid);
    body.appendChild(tit);
  });
  var btn = document.createElement('button');
  btn.className = 'sec';
  btn.textContent = 'Ver animación de esta lámina';
  btn.addEventListener('click', function () { reproducirAnimacion(IMP_IDENT_TIPO()); });
  body.appendChild(btn);
}

function arranqueImpacto() {
  _escalarEscenario();
  window.addEventListener('resize', _escalarEscenario);
  var sel = document.getElementById('laminaSel');
  if (sel) sel.addEventListener('change', pintar);
  var archivo = document.getElementById('archivo');
  if (archivo && !archivo.value) archivo.value = _prefijoArchivo();
  var btnExport = document.getElementById('exportPng');
  if (btnExport) btnExport.addEventListener('click', function () { exportarPNG(IMP_IDENT_TIPO()); });
  var btnVer = document.getElementById('verAnim');
  if (btnVer) btnVer.addEventListener('click', function () { reproducirAnimacion(IMP_IDENT_TIPO()); });
  var btnGrabar = document.getElementById('grabar');
  if (btnGrabar) btnGrabar.addEventListener('click', function () { _grabarActual(); });
  cargarBrief(IMP, function (ok, b) {
    if (b) { IMP._brief = b; aplicarBrief(b, IMP); }
    renderChips();
    renderFichaOds();
    wirePlan();
    renderAnimBody();
    pintar();
  });
  pintar();
}

function _prefijoArchivo() {
  var n = (IMP.team && IMP.team.name) || '';
  return String(n).toLowerCase().replace(/[^a-z0-9]+/g, '').slice(0, 12);
}

function _archivoDetalle(ext, tipo) {
  var inp = document.getElementById('archivo');
  var det = ((inp && inp.value) || '').replace(/[\\/:*?"<>|]+/g, '').trim() || tipo;
  return 'clip_' + det + '.' + ext;
}

// ---------- Task 6: export PNG (frame final, escala 2) ----------

function _descargar(blob, nombre) {
  var a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = nombre;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(function () { URL.revokeObjectURL(a.href); }, 4000);
}

function exportarPNG(tipo) {
  var estado = _estadoLamina();
  var prims = componerLamina(tipo, estado, _odsSelPara(tipo));
  var cv = document.createElement('canvas');
  cv.width = IMP_ANCHO * 2;
  cv.height = IMP_ALTO * 2;
  var ctx = cv.getContext('2d');
  ctx.fillStyle = (estado.pal && estado.pal.bg) || '#FFFFFF';
  ctx.fillRect(0, 0, cv.width, cv.height);
  pintarCanvas(ctx, prims, 2);
  var st = document.getElementById('statusExport');
  if (st) st.textContent = 'Renderizando PNG…';
  cv.toBlob(function (blob) {
    if (!blob) { if (st) st.textContent = 'El navegador rechazó el PNG (blob vacío).'; return; }
    _descargar(blob, _archivoDetalle('png', tipo));
    if (st) st.textContent = 'PNG exportado a 3840×2160.';
  }, 'image/png');
}

// ---------- Task 7: grabar clip (WebM + audio opcional, fallback ZIP) ----------

function planificarGrabacion(segundos, hayRecorder) {
  if (!(segundos >= 3 && segundos <= 10)) throw new RangeError('dur fuera de 3-10');
  return hayRecorder
    ? { modo: 'webm', fps: 24 }
    : { modo: 'png', fps: 24, frames: Math.round(24 * segundos) };
}

// Pinta el cuadro en tiempo t con los efectos de la animacion (canvas).
function _pintarCuadro(ctx, prims, t, fases, estado) {
  var W = IMP_ANCHO, H = IMP_ALTO;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = (estado.pal && estado.pal.bg) || '#FFFFFF';
  ctx.fillRect(0, 0, W, H);
  var fase = faseEn(t, fases);
  var a = (estado && estado.imp && estado.imp.anim) || {};
  ctx.save();
  if (fase === 'in') {
    var p = fases.tIn ? Math.min(1, t / fases.tIn) : 1;
    var eIn = 1 - Math.pow(1 - p, 3); // ease-out cubic
    var ent = fases.entrada;
    if (ent === 'slide-izq') ctx.translate((1 - eIn) * -48, 0);
    else if (ent === 'slide-arriba') ctx.translate(0, (1 - eIn) * 32);
    else if (ent === 'wipe') { ctx.beginPath(); ctx.rect(0, 0, eIn * W, H); ctx.clip(); }
    else if (ent === 'banda') { ctx.beginPath(); ctx.rect(0, 0, W, eIn * H); ctx.clip(); }
    else ctx.globalAlpha = eIn; // fade
  } else if (fase === 'out') {
    var po = fases.tOut ? Math.min(1, (t - (fases.dur - fases.tOut)) / fases.tOut) : 0;
    ctx.globalAlpha = 1 - po;
    if (fases.salida === 'slide') ctx.translate(po * 40, 0);
  } else if (fase === 'enf') {
    var pe = fases.tEn ? (t - fases.tIn) / fases.tEn : 0;
    var s = 1 + 0.035 * Math.sin(pe * Math.PI);
    ctx.translate(W / 2, H / 2);
    ctx.scale(s, s);
    ctx.translate(-W / 2, -H / 2);
  }
  pintarCanvas(ctx, prims, 1);
  ctx.restore();
}

function _pintarCuenta(ctx, estado, n) {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = (estado.pal && estado.pal.bg) || '#FFFFFF';
  ctx.fillRect(0, 0, IMP_ANCHO, IMP_ALTO);
  var tinta = (estado.pal && estado.pal.ink) || '#0D1B35';
  ctx.fillStyle = tinta;
  ctx.font = '900 340px ' + ((estado.fonts && estado.fonts.t) || 'Barlow');
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(String(n), IMP_ANCHO / 2, IMP_ALTO / 2);
}

function grabarClip(tipo, segundos, streamAudio) {
  return new Promise(function (resolve, reject) {
    var st = document.getElementById('statusExport');
    var estado = _estadoLamina();
    var prims = componerLamina(tipo, estado, _odsSelPara(tipo));
    var an = (IMP.impacto.anim && IMP.impacto.anim[tipo]) || {};
    var fases = tamanosFase(an.entrada || 'fade', an.enfasis || 'none', an.salida || 'none', segundos);
    var cv = document.createElement('canvas');
    cv.width = IMP_ANCHO;
    cv.height = IMP_ALTO;
    var ctx = cv.getContext('2d');
    function aviso(txt) { if (st) st.textContent = txt; }

    // Fallback: captura frame por frame a 24 fps y empaqueta en ZIP (o PNG suelto).
    function fallarAPNG(origen) {
      aviso('La grabación WebM falló (' + (origen && origen.message ? origen.message : 'error') + '); secuencia a PNG…');
      var plan = planificarGrabacion(segundos, false);
      var urls = [];
      var i;
      try {
        for (i = 0; i < plan.frames; i++) {
          _pintarCuadro(ctx, prims, i / plan.fps, fases, estado);
          urls.push(cv.toDataURL('image/png'));
        }
      } catch (e1) { reject(e1); return; }
      if (typeof JSZip === 'undefined') {
        aviso('Sin JSZip: se baja el frame final como PNG.');
        _pintarCuadro(ctx, prims, fases.dur, fases, estado);
        cv.toBlob(function (blob) {
          if (blob) _descargar(blob, _archivoDetalle('png', tipo));
          resolve({ png: true });
        }, 'image/png');
        return;
      }
      var zip = new JSZip();
      var carpeta = zip.folder('frames');
      urls.forEach(function (u, k) { carpeta.file('f' + String(k).padStart(4, '0') + '.png', u.split(',')[1], { base64: true }); });
      zip.generateAsync({ type: 'blob' }).then(function (blob) {
        _descargar(blob, _archivoDetalle('zip', tipo));
        aviso('MediaRecorder no disponible: se exportó la secuencia PNG (' + plan.frames + ' frames).');
        resolve({ zip: true });
      })['catch'](reject);
    }

    function empezarRec() {
      try {
        var stream = cv.captureStream(24);
        if (streamAudio && streamAudio.getAudioTracks && streamAudio.getAudioTracks().length) {
          stream.addTrack(streamAudio.getAudioTracks()[0]);
        }
        var mime = null;
        ['video/webm;codecs=vp8,opus', 'video/webm'].forEach(function (m) {
          if (!mime) { try { if (MediaRecorder.isTypeSupported(m)) mime = m; } catch (e0) {} }
        });
        var rec = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined);
        var pedazos = [];
        rec.ondataavailable = function (e) { if (e.data && e.data.size) pedazos.push(e.data); };
        rec.onstop = function () {
          if (!pedazos.length) return fallarAPNG({ message: 'grabación vacía' });
          aviso('Clip WebM listo (' + segundos + ' s' + (streamAudio ? ', con audio' : '') + ').');
          resolve(new Blob(pedazos, { type: 'video/webm' }));
        };
        _pintarCuadro(ctx, prims, 0, fases, estado);
        rec.start(200);
        var t0 = performance.now();
        (function ciclo() {
          var t = (performance.now() - t0) / 1000;
          _pintarCuadro(ctx, prims, Math.min(t, fases.dur), fases, estado);
          aviso('Grabando… ' + Math.max(0, segundos - t).toFixed(1) + ' s');
          if (t >= segundos) {
            rec.stop();
            setTimeout(function () { _pintarCuadro(ctx, prims, fases.dur, fases, estado); }, 30);
          }
          else requestAnimationFrame(ciclo);
        })();
      } catch (e2) { fallarAPNG(e2); }
    }

    // Cuenta regresiva 3-2-1 (visible, fuera de la grabación).
    var cuenta = 3;
    (function regresa() {
      _pintarCuenta(ctx, estado, cuenta);
      aviso(cuenta > 1 ? 'Preparado… comienza en ' + (cuenta - 1) : '¡Ya!');
      if (cuenta === 0) return empezarRec();
      cuenta--;
      setTimeout(regresa, 800);
    })();
  });
}

// Orquestador del botón Grabar: micrófono opcional + duración del tipo + descarga.
function _grabarActual() {
  var tipo = IMP_IDENT_TIPO();
  var an = (IMP.impacto.anim && IMP.impacto.anim[tipo]) || {};
  var dur = an.dur || IMP.impacto.dur || 5;
  var chkMico = document.getElementById('chkMico');
  var st = document.getElementById('statusExport');
  var pedir = (chkMico && chkMico.checked && navigator.mediaDevices && navigator.mediaDevices.getUserMedia)
    ? navigator.mediaDevices.getUserMedia({ audio: true })
    : Promise.resolve(null);
  pedir.then(function (stream) {
    return grabarClip(tipo, dur, stream).then(function (blob) {
      if (blob && blob.type && blob.type.indexOf('video/webm') === 0) {
        _descargar(blob, _archivoDetalle('webm', tipo));
      } else if (blob && blob.zip) {
        avisoEstado('MediaRecorder no disponible: se exportó la secuencia PNG en ZIP.');
      } else if (blob && blob.png) {
        avisoEstado('MediaRecorder no disponible y sin JSZip: se bajó el frame final en PNG.');
      }
    });
  })['catch'](function (e) {
    if (st) st.textContent = (e && e.name === 'NotAllowedError')
      ? 'Permiso de micrófono denegado. Desmarca "con micrófono" o permite el acceso.'
      : 'La grabación falló: ' + (e && e.message ? e.message : 'error desconocido');
  });
  function avisoEstado(txt) { if (st) st.textContent = txt; }
}

document.addEventListener('DOMContentLoaded', arranqueImpacto);
