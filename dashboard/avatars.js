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

  /* --- Accesorios: el tono se elige aparte, para eso esta TONOS --- */
  var ACCESORIOS = [
    { id: "a0", nombre: "Sin accesorio" },
    { id: "a1", nombre: "Lentes" },
    { id: "a2", nombre: "Lentes de sol" },
    { id: "a3", nombre: "Casco de ingeniero" },
    { id: "a5", nombre: "Gorra" },
    { id: "a6", nombre: "Audifonos" }
  ];

  /* Tonos del accesorio: mismos colores del sistema, sin morados ni neones. */
  var TONOS = [
    { id: "t1", nombre: "Azul Rally", color: "#0866F5" },
    { id: "t2", nombre: "Verde", color: "#35C46A" },
    { id: "t3", nombre: "Ambar", color: "#F0B429" },
    { id: "t4", nombre: "Turquesa", color: "#2AA7AD" },
    { id: "t5", nombre: "Rojo", color: "#B3261E" },
    { id: "t6", nombre: "Blanco", color: "#FFFFFF" },
    { id: "t7", nombre: "Azul noche", color: "#22304A" },
    { id: "t8", nombre: "Naranja", color: "#EF7A22" }
  ];

  var TONO_POR_ID = {};
  TONOS.forEach(function (t) { TONO_POR_ID[t.id] = t; });

  var TONO_DEFECTO = { a1: "t7", a2: "t7", a3: "t3", a5: "t1", a6: "t7", a0: "t1" };

  var CAMISA_POR_ID = {};
  CAMISAS.forEach(function (c) { CAMISA_POR_ID[c.id] = c; });
  var PELO_POR_ID = {};
  PELOS.forEach(function (p) { PELO_POR_ID[p.id] = p; });
  var ACC_POR_ID = {};
  ACCESORIOS.forEach(function (a) { ACC_POR_ID[a.id] = a; });
  /* Los cuatro cascos viejos son el mismo casco con distinto tono. */
  ACC_POR_ID.a4 = ACC_POR_ID.a3;
  ACC_POR_ID.a7 = ACC_POR_ID.a3;
  ACC_POR_ID.a8 = ACC_POR_ID.a3;
  var ACC_ALIAS = { a4: "t8", a7: "t6", a8: "t1" };

  /* ------------------------------ piezas ------------------------------ */

  function camisa(color) {
    // Camiseta con cuello, costura de manga y cuello del personaje: no un bloque plano.
    return (
      '<path d="M44 52 h8 v20 h-8 Z" fill="' + BLANCO + '"/>' +
      '<path d="M12 96 C12 79 26 72 48 72 C70 72 84 79 84 96 Z" fill="' + color +
      '" stroke="' + TINTA + '" stroke-width="' + G + '" stroke-linejoin="round"/>' +
      '<path d="M37 73 Q48 87 59 73" fill="none" stroke="' + TINTA +
      '" stroke-width="2.6" stroke-linecap="round"/>' +
      '<path d="M12 96 C12 79 26 72 48 72 C70 72 84 79 84 96 Z" fill="none" stroke="' + BLANCO +
      '" stroke-width="1.6" stroke-linejoin="round" opacity=".22"/>' +
      '<path d="M28 78 C24 84 23 91 23 96 M68 78 C72 84 73 91 73 96" fill="none" stroke="' +
      TINTA + '" stroke-width="2" stroke-linecap="round" opacity=".32"/>' +
      '<path d="M41 77 Q48 84 55 77" fill="none" stroke="' + BLANCO +
      '" stroke-width="1.8" stroke-linecap="round" opacity=".3"/>'
    );
  }

  function cara() {
    return (
      '<circle cx="23" cy="44" r="5" fill="' + BLANCO + '" stroke="' + TINTA +
      '" stroke-width="' + G + '"/>' +
      '<circle cx="73" cy="44" r="5" fill="' + BLANCO + '" stroke="' + TINTA +
      '" stroke-width="' + G + '"/>' +
      '<ellipse cx="48" cy="40" rx="23" ry="23.5" fill="' + BLANCO +
      '" stroke="' + TINTA + '" stroke-width="' + G + '"/>'
    );
  }

  function ojos() {
    // Ojo de dibujo amable: blanco con pupila, no un punto negro.
    function uno(x, y) {
      return (
        '<ellipse cx="' + x + '" cy="' + y + '" rx="4" ry="4.5" fill="' + BLANCO +
        '" stroke="' + TINTA + '" stroke-width="1.8"/>' +
        '<circle cx="' + x + '" cy="' + (y + 0.5) + '" r="2" fill="' + TINTA + '"/>' +
        '<circle cx="' + (x - 0.9) + '" cy="' + (y - 1) + '" r="0.8" fill="' + BLANCO + '"/>'
      );
    }
    return uno(39, 41) + uno(57, 41);
  }

  function cejas() {
    return (
      '<path d="M34 31.4 C37 29.8 41 29.7 44 31" fill="none" stroke="' + TINTA +
      '" stroke-width="2.3" stroke-linecap="round"/>' +
      '<path d="M52 31 C55 29.7 59 29.8 62 31.4" fill="none" stroke="' + TINTA +
      '" stroke-width="2.3" stroke-linecap="round"/>'
    );
  }

  function boca() {
    return (
      '<path d="M41 52.5 q7 6.5 14 0" fill="none" stroke="' + TINTA +
      '" stroke-width="2.8" stroke-linecap="round"/>' +
      '<ellipse cx="29" cy="48" rx="3.6" ry="2.2" fill="#0866F5" opacity=".16"/>' +
      '<ellipse cx="67" cy="48" rx="3.6" ry="2.2" fill="#0866F5" opacity=".16"/>'
    );
  }

  function peloAtras(tipo) {
    var trazo = ' stroke="' + TINTA + '" stroke-width="' + G + '" stroke-linejoin="round"';
    var negro = ' fill="' + TINTA + '"';
    if (tipo === "p3") {
      // Melena: dos mechones anchos a los lados; en la cara no se ve nada de esto.
      return (
        '<path d="M17 33 C17 16 79 16 79 33 L79 62 Q79 68 72 68 L67 68 L67 37 ' +
        'C67 30 59 27 48 27 C37 27 29 30 29 37 L29 68 L24 68 Q17 68 17 62 Z"' + negro + trazo + "/>"
      );
    }
    if (tipo === "p4") {
      return '<circle cx="48" cy="13" r="7.4"' + negro + trazo + "/>";
    }
    return "";
  }

  function peloFrente(tipo) {
    var trazo = ' stroke="' + TINTA + '" stroke-width="' + G + '" stroke-linejoin="round"';
    var negro = ' fill="' + TINTA + '"';
    var brillo = '<path d="M35 24 C41 20 56 20 62 24" fill="none" stroke="' + BLANCO +
      '" stroke-width="1.9" stroke-linecap="round" opacity=".3"/>';
    if (tipo === "p0") {
      // Rapado: pegado al craneo, con volumen minimo.
      return (
        '<path d="M25 41 C25 21 71 21 71 41 C70 32 65 27.5 57 27 C48 26.2 36 29 30 34 ' +
        'C27.5 36.4 25.6 38.6 25 41 Z"' + negro + trazo + "/>" +
        '<path d="M36 25 C42 22 54 22 60 25" fill="none" stroke="' + BLANCO +
        '" stroke-width="1.6" stroke-linecap="round" opacity=".22"/>'
      );
    }
    if (tipo === "p1") {
      return (
        '<path d="M24 43 C24 19 72 19 72 43 C71 32 66 26.5 57 25.8 C47 25 35 28.5 29 33.6 ' +
        'C26.4 36.2 24.6 39.6 24 43 Z"' + negro + trazo + "/>" +
        '<path d="M33 29.5 C38 26 44 25 49 25.4" fill="none" stroke="' + BLANCO +
        '" stroke-width="2.2" stroke-linecap="round" opacity=".4"/>'
      );
    }
    if (tipo === "p2") {
      var out = '<path d="M25 30 C25 17 71 17 71 30 Z"' + negro + trazo + "/>";
      var xs = [27, 34, 41, 48, 55, 62, 69];
      for (var i = 0; i < xs.length; i++) {
        out += '<circle cx="' + xs[i] + '" cy="' + (23 - (i % 2) * 4) + '" r="5.6"' + negro + trazo + "/>";
      }
      return out + brillo;
    }
    if (tipo === "p3") {
      // Flequillo: tapa la frente sin comerse la cara.
      return (
        '<path d="M24 31 C25 16 72 17 70 30 C66 24 58 22.5 48 23.5 C38 24.5 29 27 24 31 Z"' +
        negro + trazo + "/>" +
        '<path d="M32 26 C42 22 58 22 66 26" fill="none" stroke="' + BLANCO +
        '" stroke-width="1.9" stroke-linecap="round" opacity=".26"/>'
      );
    }
    if (tipo === "p4") {
      return (
        '<path d="M25 37 C25 18 71 18 71 37 C67 27 29 27 25 37 Z"' + negro + trazo + "/>" +
        '<path d="M43 20 q5 -3 10 0" fill="none" stroke="' + TINTA + '" stroke-width="2.2"/>' + brillo
      );
    }
    return (
      '<path d="M24 43 C24 19 72 19 72 43 C71 32 66 26.5 57 25.8 C47 25 35 28.5 29 33.6 ' +
      'C26.4 36.2 24.6 39.6 24 43 Z"' + negro + trazo + "/>" +
      '<path d="M36 26 C44 22 56 22 64 27" fill="none" stroke="' + BLANCO +
      '" stroke-width="2.4" stroke-linecap="round" opacity=".55"/>'
    );
  }

  function accesorio(tipo, tono) {
    var trazo = ' stroke="' + TINTA + '" stroke-width="2.8"';
    if (tipo === "a1") {
      // Los anteojos son aro con el tono elegido: los ojos de abajo se siguen viendo.
      return (
        '<circle cx="39" cy="41" r="7" fill="none" stroke="' + tono + '" stroke-width="2.8"/>' +
        '<circle cx="57" cy="41" r="7" fill="none" stroke="' + tono + '" stroke-width="2.8"/>' +
        '<path d="M46 41 h4" stroke="' + tono + '" stroke-width="2.6" stroke-linecap="round"/>' +
        '<path d="M32 39.5 L27 38 M64 39.5 L69 38" stroke="' + tono +
        '" stroke-width="2.4" stroke-linecap="round"/>'
      );
    }
    if (tipo === "a2") {
      return (
        '<rect x="29.5" y="33" width="18.5" height="16" rx="5.5" fill="' + tono + '"' + trazo + "/>" +
        '<rect x="48" y="33" width="18.5" height="16" rx="5.5" fill="' + tono + '"' + trazo + "/>" +
        '<path d="M48 39 h0.5" stroke="' + TINTA + '" stroke-width="3" stroke-linecap="round"/>' +
        '<path d="M34 37 L39 36" stroke="' + BLANCO + '" stroke-width="2" opacity=".55" stroke-linecap="round"/>'
      );
    }
    if (tipo === "a3") {
      // Casco de ingeniero: copa con cresta, ala ancha y el tono que se elija.
      return (
        '<path d="M26 31 C26 8 70 8 70 31 Z" fill="' + tono + '" stroke="' + TINTA +
        '" stroke-width="' + G + '" stroke-linejoin="round"/>' +
        '<rect x="17" y="29" width="62" height="8.5" rx="4.25" fill="' + tono + '" stroke="' + TINTA +
        '" stroke-width="' + G + '"/>' +
        '<path d="M48 9.5 v20" fill="none" stroke="' + TINTA + '" stroke-width="2.6" opacity=".4"/>' +
        '<path d="M33 17 C30 20 28 25 27.5 29" fill="none" stroke="' + BLANCO +
        '" stroke-width="2.2" stroke-linecap="round" opacity=".5"/>' +
        '<circle cx="57" cy="20" r="2" fill="' + TINTA + '" opacity=".25"/>'
      );
    }
    if (tipo === "a5") {
      return (
        '<path d="M25 32 C25 14 71 14 71 32 Z" fill="' + tono + '" stroke="' + TINTA +
        '" stroke-width="' + G + '" stroke-linejoin="round"/>' +
        '<path d="M70 31 q14 2 14 8 h-14 Z" fill="' + tono + '" stroke="' + TINTA +
        '" stroke-width="' + G + '" stroke-linejoin="round"/>' +
        '<path d="M25 30 L25 34" stroke="' + TINTA + '" stroke-width="3" stroke-linecap="round"/>' +
        '<circle cx="48" cy="17" r="2.6" fill="' + BLANCO + '"/>'
      );
    }
    if (tipo === "a6") {
      return (
        '<path d="M25 46 C25 11 71 11 71 46" fill="none" stroke="' + TINTA + '" stroke-width="' + G +
        '" stroke-linecap="round"/>' +
        '<rect x="17.5" y="35" width="11" height="17" rx="5" fill="' + tono + '" stroke="' + TINTA +
        '" stroke-width="2.6"/>' +
        '<rect x="67.5" y="35" width="11" height="17" rx="5" fill="' + tono + '" stroke="' + TINTA +
        '" stroke-width="2.6"/>'
      );
    }
    return "";
  }

  /* ------------------------------ ensamble ------------------------------ */

  function pintar(partes) {
    var color = (CAMISA_POR_ID[partes.camisa] || CAMISAS[0]).color;
    var tono = (TONO_POR_ID[partes.tono] || TONO_POR_ID[TONO_DEFECTO[partes.accesorio] || "t1"]).color;
    return (
      '<svg class="rav-avatar" viewBox="0 0 96 96" xmlns="http://www.w3.org/2000/svg" ' +
      'aria-hidden="true" focusable="false">' +
      camisa(color) +
      peloAtras(partes.pelo) +
      cara() +
      peloFrente(partes.pelo) +
      cejas() +
      ojos() +
      boca() +
      accesorio(partes.accesorio, tono) +
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

  /* "av_profe~p1~a3~c2~t5" -> {base, pelo, accesorio, camisa, tono} */
  function partes(id) {
    var texto = String(id || "").trim();
    var trozos = texto.split("~");
    var base = POR_ID[trozos[0]] ? trozos[0] : LEGADO[trozos[0]] || "";
    var preset = base ? POR_ID[base] : POR_DEFECTO;
    var basePelo = PELO_POR_ID[trozos[1]] ? trozos[1] : preset.pelo;
    var baseAcc = ACC_POR_ID[trozos[2]] ? canonicalAcc(trozos[2]) : preset.accesorio;
    var baseCam = CAMISA_POR_ID[trozos[3]] ? trozos[3] : preset.camisa;
    var tono = TONO_DEFECTO[baseAcc] || "t1";
    if (ACC_ALIAS[preset.accesorio] && !trozos[4]) tono = ACC_ALIAS[preset.accesorio];
    if (TONO_POR_ID[trozos[4]]) tono = trozos[4];
    return {
      base: base || POR_DEFECTO.base,
      pelo: basePelo,
      accesorio: baseAcc,
      camisa: baseCam,
      tono: tono
    };
  }

  function canonicalAcc(id) {
    return id === "a4" || id === "a7" || id === "a8" ? "a3" : id;
  }

  function espec(base, eleccion) {
    var p = partes(base);
    var e = eleccion || {};
    if (PELO_POR_ID[e.pelo]) p.pelo = e.pelo;
    if (ACC_POR_ID[e.accesorio]) p.accesorio = canonicalAcc(e.accesorio);
    if (CAMISA_POR_ID[e.camisa]) p.camisa = e.camisa;
    if (TONO_POR_ID[e.tono]) p.tono = e.tono;
    return p.base + "~" + p.pelo + "~" + p.accesorio + "~" + p.camisa + "~" + p.tono;
  }

  function etiqueta(eleccion) {
    var p = partes(eleccion && eleccion.base ? eleccion.base : POR_DEFECTO.base);
    var pelo = (PELO_POR_ID[eleccion && eleccion.pelo] || PELO_POR_ID[p.pelo]).nombre;
    var acc = (ACC_POR_ID[eleccion && eleccion.accesorio] || ACC_POR_ID[p.accesorio]).nombre;
    var cam = (CAMISA_POR_ID[eleccion && eleccion.camisa] || CAMISA_POR_ID[p.camisa]).nombre;
    if (p.accesorio === "a0" || (eleccion && eleccion.accesorio === "a0")) return pelo + " · " + cam;
    return pelo + " · " + acc + " · " + cam;
  }

  window.RAV = {
    lista: PRESETS.map(function (a) {
      // `nombre` es lo que la pagina pinta bajo cada personaje por defecto:
      // el rotulo del preset es el rol, no un nombre propio.
      return { id: a.id, nombre: a.rol, rol: a.rol, porque: a.porque };
    }),
    roles: ROLES,
    capas: { pelos: PELOS, accesorios: ACCESORIOS, camisas: CAMISAS, tonos: TONOS },
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
