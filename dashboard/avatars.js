/* avatars.js -- Fabrica de personajes del estudio.
 *
 * Un personaje no es un dibujo fijo: es una cara armada por capas.
 *   camisa  (8 tonos de la paleta del sistema)
 *   pelo    (6 cortes)
 *   accesorio (9: lentes, sol, casco de ingeniero en 4 tonos, gorra, audifonos)
 *
 * La eleccion viaja como texto: "av_profe~p1~a3~c2".
 * El personaje es independiente del rol: el rol dice que hace, la cara dice
 * como se ve. Los quince ids viejos sobreviven como combinaciones por defecto.
 */
(function () {
  "use strict";
  if (typeof window === "undefined") return;

  var TINTA = "#0D1B35";
  var BLANCO = "#FFFFFF";
  var G = 3;

  /* --- Camisas: solo tonos que viven en brand/tokens.css --- */
  var CAMISAS = [
    { id: "c1", nombre: "Azul Rally", color: "#0866F5" },
    { id: "c2", nombre: "Verde", color: "#35C46A" },
    { id: "c3", nombre: "Ambar", color: "#F0B429" },
    { id: "c4", nombre: "Turquesa", color: "#2AA7AD" },
    { id: "c5", nombre: "Rojo", color: "#B3261E" },
    { id: "c6", nombre: "Gris", color: "#C9CED6" },
    { id: "c7", nombre: "Azul noche", color: "#22304A" },
    { id: "c8", nombre: "Oliva", color: "#7A8B4A" }
  ];

  /* --- Pelos --- */
  var PELOS = [
    { id: "p0", nombre: "Rapado" },
    { id: "p1", nombre: "Corto" },
    { id: "p2", nombre: "Rizado" },
    { id: "p3", nombre: "Largo" },
    { id: "p4", nombre: "Mono alto" },
    { id: "p5", nombre: "Raya al lado" }
  ];

  /* --- Accesorios: casco de ingeniero en varios tonos --- */
  var ACCESORIOS = [
    { id: "a0", nombre: "Sin accesorio" },
    { id: "a1", nombre: "Lentes" },
    { id: "a2", nombre: "Lentes de sol" },
    { id: "a3", nombre: "Casco amarillo" },
    { id: "a4", nombre: "Casco naranja" },
    { id: "a7", nombre: "Casco blanco" },
    { id: "a8", nombre: "Casco azul" },
    { id: "a5", nombre: "Gorra" },
    { id: "a6", nombre: "Audifonos" }
  ];

  var CAMISA_POR_ID = {};
  CAMISAS.forEach(function (c) { CAMISA_POR_ID[c.id] = c; });
  var PELO_POR_ID = {};
  PELOS.forEach(function (p) { PELO_POR_ID[p.id] = p; });
  var ACC_POR_ID = {};
  ACCESORIOS.forEach(function (a) { ACC_POR_ID[a.id] = a; });

  /* ------------------------------ piezas ------------------------------ */

  function camisa(color) {
    // Camiseta con cuello redondo y costura de manga: menos bloque, mas prenda.
    return (
      '<path d="M13 96 C13 79 27 70 48 70 C69 70 83 79 83 96 Z" fill="' + color +
      '" stroke="' + TINTA + '" stroke-width="' + G + '" stroke-linejoin="round"/>' +
      '<path d="M38 71 Q48 84 58 71" fill="none" stroke="' + TINTA +
      '" stroke-width="2.6" stroke-linecap="round"/>' +
      '<path d="M29 76 C25 82 24 89 24 96 M67 76 C71 82 72 89 72 96" fill="none" stroke="' +
      TINTA + '" stroke-width="2" stroke-linecap="round" opacity=".35"/>' +
      '<path d="M40 79 Q48 87 56 79" fill="none" stroke="' + BLANCO +
      '" stroke-width="1.8" stroke-linecap="round" opacity=".28"/>'
    );
  }

  function cara() {
    return (
      '<circle cx="26" cy="43" r="4.6" fill="' + BLANCO + '" stroke="' + TINTA +
      '" stroke-width="' + G + '"/>' +
      '<circle cx="70" cy="43" r="4.6" fill="' + BLANCO + '" stroke="' + TINTA +
      '" stroke-width="' + G + '"/>' +
      '<ellipse cx="48" cy="41" rx="21" ry="22.5" fill="' + BLANCO +
      '" stroke="' + TINTA + '" stroke-width="' + G + '"/>'
    );
  }

  function ojos() {
    // Ojo de dibujo: punto con brillo. Un aro dentro de otro aro se lee mal.
    function uno(x, y) {
      return (
        '<circle cx="' + x + '" cy="' + y + '" r="3.4" fill="' + TINTA + '"/>' +
        '<circle cx="' + (x - 1) + '" cy="' + (y - 1.2) + '" r="1" fill="' + BLANCO + '"/>'
      );
    }
    return uno(40, 42) + uno(56, 42);
  }

  function boca() {
    return (
      '<path d="M41 52 q7 6 14 0" fill="none" stroke="' + TINTA +
      '" stroke-width="2.6" stroke-linecap="round"/>' +
      '<ellipse cx="30" cy="48" rx="3.4" ry="2" fill="#0866F5" opacity=".14"/>' +
      '<ellipse cx="66" cy="48" rx="3.4" ry="2" fill="#0866F5" opacity=".14"/>'
    );
  }

  function pelo(tipo) {
    var trazo = ' stroke="' + TINTA + '" stroke-width="' + G + '" stroke-linejoin="round"';
    var negro = ' fill="' + TINTA + '"';
    var brillo = '<path d="M34 27 C40 23 56 23 62 27" fill="none" stroke="' + BLANCO +
      '" stroke-width="1.8" stroke-linecap="round" opacity=".3"/>';
    if (tipo === "p0") {
      // Rapado: pelo corto pegado, pero con volumen: nunca una calva.
      return (
        '<path d="M26 42 C26 22 70 22 70 42 C67 33 62 30 56 29.5 C47 29 33 32 29 36 ' +
        'C27 38 26.5 40 26 42 Z"' + negro + trazo + "/>" + brillo
      );
    }
    if (tipo === "p1") {
      return (
        '<path d="M25 44 C25 18 71 18 71 44 C68 33 64 29 56 28 C48 27 36 30 30 34 ' +
        'C27 36 26 40 25 44 Z"' + negro + trazo + "/>" + brillo
      );
    }
    if (tipo === "p2") {
      var out = '<path d="M26 33 C26 20 70 20 70 33 Z"' + negro + trazo + "/>";
      var xs = [28, 35, 42, 49, 56, 63, 68];
      for (var i = 0; i < xs.length; i++) {
        out += '<circle cx="' + xs[i] + '" cy="' + (26 - (i % 2) * 5) + '" r="5.8"' + negro + trazo + "/>";
      }
      return out;
    }
    if (tipo === "p3") {
      return (
        '<path d="M22 62 L22 33 C22 15 74 15 74 33 L74 62 L65 62 L65 36 C65 27 55 23 48 23 ' +
        'C41 23 31 27 31 36 L31 62 Z"' + negro + trazo + "/>" +
        '<path d="M31 30 C38 24 58 24 65 30" fill="none" stroke="' + BLANCO +
        '" stroke-width="1.8" stroke-linecap="round" opacity=".25"/>'
      );
    }
    if (tipo === "p4") {
      return (
        '<path d="M25 40 C25 18 71 18 71 40 C66 28 30 28 25 40 Z"' + negro + trazo + "/>" +
        '<circle cx="48" cy="15" r="6.6"' + negro + trazo + "/>" +
        '<path d="M43 21 q5 2 10 0" fill="none" stroke="' + TINTA + '" stroke-width="2.2"/>' + brillo
      );
    }
    return (
      '<path d="M25 44 C25 18 71 18 71 44 C68 33 64 29 56 28 C48 27 36 30 30 34 ' +
      'C27 36 26 40 25 44 Z"' + negro + trazo + "/>" +
      '<path d="M36 27 C44 23 56 23 64 28" fill="none" stroke="' + BLANCO +
      '" stroke-width="2.2" stroke-linecap="round" opacity=".55"/>'
    );
  }

  function accesorio(tipo, camisaColor) {
    var trazo = ' stroke="' + TINTA + '" stroke-width="2.8"';
    if (tipo === "a1") {
      // Los anteojos son solo el aro: los ojos de abajo se siguen viendo.
      return (
        '<circle cx="40" cy="42" r="6.6" fill="none"' + trazo + "/>" +
        '<circle cx="56" cy="42" r="6.6" fill="none"' + trazo + "/>" +
        '<path d="M46.8 42 h2.8" stroke="' + TINTA + '" stroke-width="2.6" stroke-linecap="round"/>'
      );
    }
    if (tipo === "a2") {
      return (
        '<rect x="31" y="34" width="18" height="15" rx="5" fill="#22304A" stroke="' + TINTA +
        '" stroke-width="2.8"/>' +
        '<rect x="47" y="34" width="18" height="15" rx="5" fill="#22304A" stroke="' + TINTA +
        '" stroke-width="2.8"/>' +
        '<path d="M47 40 h2" stroke="' + TINTA + '" stroke-width="2.8"/>'
      );
    }
    // Casco de ingeniero: mismo dibujo, cuatro tonos de la paleta.
    var CASCOS = { a3: "#F0B429", a4: "#EF7A22", a7: "#FFFFFF", a8: "#0866F5" };
    if (CASCOS[tipo]) {
      var tono = CASCOS[tipo];
      return (
        '<path d="M26 32 C26 10 70 10 70 32 Z" fill="' + tono + '" stroke="' + TINTA +
        '" stroke-width="' + G + '" stroke-linejoin="round"/>' +
        '<rect x="19" y="29" width="58" height="8" rx="4" fill="' + tono + '" stroke="' + TINTA +
        '" stroke-width="' + G + '"/>' +
        '<path d="M48 11 v18" fill="none" stroke="' + TINTA + '" stroke-width="2.4" opacity=".45"/>' +
        '<path d="M33 20 C29 23 27 27 27 31" fill="none" stroke="' + BLANCO +
        '" stroke-width="2" stroke-linecap="round" opacity=".45"/>'
      );
    }
    if (tipo === "a5") {
      return (
        '<path d="M27 31 C27 13 69 13 69 31 Z" fill="' + camisaColor + '" stroke="' + TINTA +
        '" stroke-width="' + G + '" stroke-linejoin="round"/>' +
        '<path d="M69 30 q13 2 13 7 h-13 Z" fill="' + camisaColor + '" stroke="' + TINTA +
        '" stroke-width="' + G + '" stroke-linejoin="round"/>' +
        '<circle cx="48" cy="16" r="2.4" fill="' + BLANCO + '"/>'
      );
    }
    if (tipo === "a6") {
      return (
        '<path d="M27 44 C27 14 69 14 69 44" fill="none" stroke="' + TINTA + '" stroke-width="' + G +
        '" stroke-linecap="round"/>' +
        '<rect x="21" y="36" width="10" height="16" rx="4.5" fill="#22304A" stroke="' + TINTA +
        '" stroke-width="2.6"/>' +
        '<rect x="65" y="36" width="10" height="16" rx="4.5" fill="#22304A" stroke="' + TINTA +
        '" stroke-width="2.6"/>'
      );
    }
    return "";
  }

  /* ------------------------------ ensamble ------------------------------ */

  function pintar(partes) {
    var color = (CAMISA_POR_ID[partes.camisa] || CAMISAS[0]).color;
    var capaPelo = partes.pelo;
    var atras = capaPelo === "p3" ? pelo(capaPelo) : "";
    var adelante = atras ? "" : pelo(capaPelo);
    return (
      '<svg class="rav-avatar" viewBox="0 0 96 96" xmlns="http://www.w3.org/2000/svg" ' +
      'aria-hidden="true" focusable="false">' +
      camisa(color) +
      atras +
      cara() +
      adelante +
      ojos() +
      boca() +
      accesorio(partes.accesorio, color) +
      "</svg>"
    );
  }

  /* ------------------------------ presets ------------------------------ */

  var POR_DEFECTO = { base: "av_profe", pelo: "p1", accesorio: "a1", camisa: "c1" };

  var PRESETS = [
    { id: "av_profe", rol: "Director", pelo: "p1", accesorio: "a1", camisa: "c1",
      porque: "Director: ordena la idea y decide que se corta." },
    { id: "av_tito", rol: "Guion", pelo: "p2", accesorio: "a0", camisa: "c4",
      porque: "Guion: escribe lo que se dice y lo que se calla." },
    { id: "av_beto", rol: "Presupuesto", pelo: "p0", accesorio: "a2", camisa: "c7",
      porque: "Presupuesto: cada cordoba tiene nombre y apellido." },
    { id: "av_pliego", rol: "Pautado", pelo: "p5", accesorio: "a1", camisa: "c2",
      porque: "Pautado: cinco secciones, ni una palabra de mas." },
    { id: "av_lola", rol: "Canvas", pelo: "p3", accesorio: "a0", camisa: "c3",
      porque: "Canvas: socios, costos e ingresos en un solo mapa." },
    { id: "av_pepe", rol: "Documentos", pelo: "p4", accesorio: "a1", camisa: "c6",
      porque: "Documentos: el que arma el entregable final." },
    { id: "av_tere", rol: "Editor de video", pelo: "p3", accesorio: "a6", camisa: "c5",
      porque: "Editor de video: corta y pega hasta que los 120 s cuadran." },
    { id: "av_lupe", rol: "Investigacion", pelo: "p1", accesorio: "a6", camisa: "c8",
      porque: "Investigacion: sin fuente no existe." },
    { id: "av_mel", rol: "Voz", pelo: "p2", accesorio: "a5", camisa: "c1",
      porque: "Voz: la narracion y el tono del video." },
    { id: "av_cesar", rol: "Modelo 3D", pelo: "p0", accesorio: "a4", camisa: "c7",
      porque: "Modelo 3D: mide antes de renderizar." },
    { id: "av_nato", rol: "Web", pelo: "p5", accesorio: "a2", camisa: "c4",
      porque: "Web: la demo que se ve en el video." },
    { id: "av_vigia", rol: "Auditor", pelo: "p1", accesorio: "a3", camisa: "c6",
      porque: "Auditor: revisa contra la rubrica, no contra el gusto." },
    { id: "av_mentor", rol: "Mentor", pelo: "p1", accesorio: "a1", camisa: "c7",
      porque: "Mentor: pregunta, corrige y desbloquea." },
    { id: "av_visitante", rol: "Visitante", pelo: "p0", accesorio: "a0", camisa: "c6",
      porque: "Visitante: mira todo y no escribe nada." },
    { id: "av_admin", rol: "Admin", pelo: "p4", accesorio: "a0", camisa: "c5",
      porque: "Admin: abre y cierra puertas." }
  ];

  var POR_ID = {};
  PRESETS.forEach(function (a) { POR_ID[a.id] = a; });

  var LEGADO = {
    nodo_alfa: "av_profe",
    nodo_beta: "av_tito",
    nodo_gamma: "av_beto",
    nodo_delta: "av_lola",
    nodo_epsilon: "av_lupe",
    nodo_omega: "av_vigia"
  };

  var POR_ROL = { admin: "av_admin", mentor: "av_mentor", visitor: "av_visitante" };

  var ROLES = [
    { id: "director", nombre: "Director" },
    { id: "guion", nombre: "Guion" },
    { id: "presupuesto", nombre: "Presupuesto" },
    { id: "pautado", nombre: "Pautado" },
    { id: "canvas", nombre: "Canvas" },
    { id: "documentos", nombre: "Documentos" },
    { id: "editor-video", nombre: "Editor de video" },
    { id: "investigacion", nombre: "Investigación" },
    { id: "voz", nombre: "Voz" },
    { id: "modelo-3d", nombre: "Modelo 3D" },
    { id: "web", nombre: "Web" },
    { id: "auditor", nombre: "Auditor" }
  ];
  var ROL_POR_ID = {};
  ROLES.forEach(function (r) { ROL_POR_ID[r.id] = r.nombre; });

  /* ------------------------------ lectura de la eleccion ------------------------------ */

  /* "av_profe~p1~a3~c2" -> {base, pelo, accesorio, camisa} */
  function partes(id) {
    var texto = String(id || "").trim();
    var trozos = texto.split("~");
    var base = POR_ID[trozos[0]] ? trozos[0] : LEGADO[trozos[0]] || "";
    var preset = base ? POR_ID[base] : POR_DEFECTO;
    var salida = {
      base: base || POR_DEFECTO.base,
      pelo: preset.pelo,
      accesorio: preset.accesorio,
      camisa: preset.camisa
    };
    if (PELO_POR_ID[trozos[1]]) salida.pelo = trozos[1];
    if (ACC_POR_ID[trozos[2]]) salida.accesorio = trozos[2];
    if (CAMISA_POR_ID[trozos[3]]) salida.camisa = trozos[3];
    return salida;
  }

  function espec(base, eleccion) {
    var p = partes(base);
    var e = eleccion || {};
    if (PELO_POR_ID[e.pelo]) p.pelo = e.pelo;
    if (ACC_POR_ID[e.accesorio]) p.accesorio = e.accesorio;
    if (CAMISA_POR_ID[e.camisa]) p.camisa = e.camisa;
    return p.base + "~" + p.pelo + "~" + p.accesorio + "~" + p.camisa;
  }

  function etiqueta(eleccion) {
    var p = partes(eleccion && eleccion.base ? eleccion.base : POR_DEFECTO.base);
    var pelo = (PELO_POR_ID[eleccion && eleccion.pelo] || PELO_POR_ID[p.pelo]).nombre;
    var acc = (ACC_POR_ID[eleccion && eleccion.accesorio] || ACC_POR_ID[p.accesorio]).nombre;
    var cam = (CAMISA_POR_ID[eleccion && eleccion.camisa] || CAMISA_POR_ID[p.camisa]).nombre;
    return pelo + " · " + acc + " · " + cam;
  }

  window.RAV = {
    lista: PRESETS.map(function (a) {
      // `nombre` es lo que la pagina pinta bajo cada personaje por defecto:
      // el rotulo del preset es el rol, no un nombre propio.
      return { id: a.id, nombre: a.rol, rol: a.rol, porque: a.porque };
    }),
    roles: ROLES,
    capas: { pelos: PELOS, accesorios: ACCESORIOS, camisas: CAMISAS },
    partes: partes,
    espec: espec,
    etiqueta: etiqueta,
    svg: function (id) {
      return pintar(partes(id));
    },
    nombre: function (id) {
      var p = partes(id);
      return (POR_ID[p.base] || PRESETS[0]).rol;
    },
    rol: function (id) {
      return this.nombre(id);
    },
    porque: function (id) {
      var p = partes(id);
      return (POR_ID[p.base] || PRESETS[0]).porque;
    },
    rolNombre: function (id) {
      return ROL_POR_ID[id] || id;
    },
    normalizar: function (id) {
      var p = partes(id);
      return p.base;
    },
    porRol: function (role) {
      return POR_ROL[role] || "";
    }
  };
})();
