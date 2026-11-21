/* avatars.js -- Catalogo de personajes del estudio.
 *
 * Estilo: calcomania meme dibujada a mano. Cabeza grande, contorno negro
 * grueso, pelo como masa negra maciza, cara blanca, gesto exagerado y un
 * accesorio que delate al personaje. Sin nombre propio: el rotulo es el rol.
 * Cada personaje guarda su `porque` y lo inyecta como <title> en el propio SVG.
 */
(function () {
  "use strict";
  if (typeof window === "undefined") return;

  var N = "#111111";
  var BL = "#0866F5";
  var TJ = "#2aa7ad";
  var RO = "#b3261e";
  var VE = "#35C46A";
  var OR = "#F0B429";
  var GRIS = "#C9CED6";
  var HUMO = "#E3ECFB";
  var OLIVA = "#7A8B4A";
  var CAFE = "#8A5223";
  var AZUL = "#22304A";
  var PIEL = "#FFFFFF";

  /* Trazo base: todo el dibujo usa el mismo grosor de linea. */
  var G = 3.1;

  function svg(inner, porque) {
    return (
      '<svg class="rav-avatar" viewBox="0 0 96 96" xmlns="http://www.w3.org/2000/svg" ' +
      'aria-hidden="true" focusable="false">' +
      (porque ? "<title>" + porque + "</title>" : "") +
      inner +
      "</svg>"
    );
  }

  /* Cara: mancha blanca con contorno grueso, ligeramente mas ancha abajo. */
  function cara(cx, cy, rx, ry) {
    var d =
      "M" + (cx - rx) + " " + (cy - ry * 0.2) +
      " C" + (cx - rx * 1.05) + " " + (cy - ry * 1.15) + " " + (cx + rx * 1.05) + " " + (cy - ry * 1.15) +
      " " + (cx + rx) + " " + (cy - ry * 0.2) +
      " C" + (cx + rx * 1.02) + " " + (cy + ry * 0.9) + " " + (cx + rx * 0.6) + " " + (cy + ry * 1.05) +
      " " + cx + " " + (cy + ry * 1.05) +
      " C" + (cx - rx * 0.6) + " " + (cy + ry * 1.05) + " " + (cx - rx * 1.02) + " " + (cy + ry * 0.9) +
      " " + (cx - rx) + " " + (cy - ry * 0.2) + " Z";
    return '<path d="' + d + '" fill="' + PIEL + '" stroke="' + N + '" stroke-width="' + G + '" stroke-linejoin="round"/>';
  }

  /* Ojo: punto negro con brillo. */
  function ojo(cx, cy, r) {
    r = r || 3.4;
    return (
      '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="' + N + '"/>' +
      '<circle cx="' + (cx + r * 0.35) + '" cy="' + (cy - r * 0.45) + '" r="' + (r * 0.3).toFixed(1) + '" fill="#fff"/>'
    );
  }

  /* Boca abierta de meme: dientes blancos, linea de encia y, si toca, frenillos. */
  function boca(cx, cy, ancho, alto, frenillos) {
    var w = ancho || 34;
    var h = alto || 13;
    var x1 = cx - w / 2;
    var x2 = cx + w / 2;
    var out =
      '<path d="M' + x1 + " " + cy + " Q" + cx + " " + (cy + h * 1.9) + " " + x2 + " " + cy +
      " Q" + cx + " " + (cy - h * 0.35) + " " + x1 + " " + cy + ' Z" fill="#2a0a0a" stroke="' + N +
      '" stroke-width="' + G + '" stroke-linejoin="round"/>' +
      '<path d="M' + (x1 + 2) + " " + (cy + 1) + " Q" + cx + " " + (cy + h * 0.95) + " " + (x2 - 2) + " " + (cy + 1) +
      " Q" + cx + " " + (cy + h * 0.25) + " " + (x1 + 2) + " " + (cy + 1) + ' Z" fill="#fff" stroke="' + N +
      '" stroke-width="2.2"/>';
    if (frenillos) {
      out +=
        '<path d="M' + (x1 + 3) + " " + (cy + 3.4) + " Q" + cx + " " + (cy + h * 0.8) + " " + (x2 - 3) + " " + (cy + 3.4) +
        '" fill="none" stroke="' + N + '" stroke-width="2"/>';
      for (var i = 1; i <= 4; i++) {
        var x = x1 + ((x2 - x1) * i) / 5;
        out +=
          '<rect x="' + (x - 2.6) + '" y="' + (cy + 2) + '" width="5.2" height="5.4" fill="' + GRIS +
          '" stroke="' + N + '" stroke-width="1.4"/>';
      }
    }
    return out;
  }

  /* Hombrs y torso simple, cortado por el borde inferior del cuadro. */
  function torso(fill, extra) {
    return (
      '<path d="M10 96 C10 78 26 66 48 66 C70 66 86 78 86 96 Z" fill="' + fill +
      '" stroke="' + N + '" stroke-width="' + G + '" stroke-linejoin="round"/>' +
      (extra || "")
    );
  }

  var LISTA = [
    {
      id: "av_profe",
      rol: "Director",
      porque: "El Profe de La Casa de Papel: el que piensa el plan y nunca se altera.",
      cuerpo:
        torso(AZUL) +
        // pelo corto pegado
        '<path d="M22 36 C22 14 74 14 74 36 C66 27 30 27 22 36 Z" fill="' + N + '"/>' +
        cara(48, 44, 27, 24) +
        // barba maciza
        '<path d="M22 46 C22 70 74 70 74 46 C66 60 30 60 22 46 Z" fill="' + N + '"/>' +
        // lentes redondos
        '<circle cx="37" cy="42" r="11" fill="none" stroke="' + N + '" stroke-width="3.4"/>' +
        '<circle cx="60" cy="42" r="11" fill="none" stroke="' + N + '" stroke-width="3.4"/>' +
        '<path d="M48 42 L49 42" stroke="' + N + '" stroke-width="3.4"/>' +
        '<path d="M26 40 L21 38 M71 40 L76 38" stroke="' + N + '" stroke-width="4"/>' +
        ojo(37, 42, 3.2) +
        ojo(60, 42, 3.2) +
        // plano en la mano
        '<rect x="58" y="68" width="24" height="17" rx="2" fill="' + HUMO + '" stroke="' + N + '" stroke-width="4" transform="rotate(-7 70 76)"/>' +
        '<path d="M63 73 L76 71 M63 78 L74 77" stroke="' + BL + '" stroke-width="2.2"/>',
    },
    {
      id: "av_tito",
      rol: "Guion",
      porque: "El Chavo: la historia siempre pasa en la misma vecindad.",
      cuerpo:
        torso("#EFE3C2") +
        '<path d="M18 80 L78 80 M16 88 L80 88" stroke="' + N + '" stroke-width="4"/>' +
        cara(48, 46, 26, 23) +
        // gorro con orejeras
        '<path d="M23 36 C23 15 73 15 73 36 Z" fill="#D8C08A" stroke="' + N + '" stroke-width="' + G + '" stroke-linejoin="round"/>' +
        '<path d="M23 33 C14 33 14 48 23 48 Z" fill="#C9AE78" stroke="' + N + '" stroke-width="' + G + '"/>' +
        '<path d="M73 33 C82 33 82 48 73 48 Z" fill="#C9AE78" stroke="' + N + '" stroke-width="' + G + '"/>' +
        '<path d="M24 29 L72 29" stroke="' + N + '" stroke-width="4"/>' +
        ojo(38, 46, 3.6) +
        ojo(59, 46, 3.6) +
        '<circle cx="31" cy="55" r="2" fill="' + N + '"/><circle cx="37" cy="57" r="2" fill="' + N + '"/>' +
        '<circle cx="60" cy="57" r="2" fill="' + N + '"/><circle cx="66" cy="55" r="2" fill="' + N + '"/>' +
        boca(48, 58, 26, 9, false),
    },
    {
      id: "av_beto",
      rol: "Presupuesto",
      porque: "Betty la fea: la unica que entiende los numeros, y aun asi nadie le cree.",
      cuerpo:
        torso(CAFE) +
        '<path d="M36 64 L48 88 L60 64 C53 61 43 61 36 64 Z" fill="' + OLIVA + '" stroke="' + N + '" stroke-width="' + G + '"/>' +
        '<circle cx="48" cy="82" r="3.4" fill="' + BL + '" stroke="' + N + '" stroke-width="2"/>' +
        // pelo: casquete + mechones laterales largos
        '<path d="M18 46 C18 14 78 14 78 46 Z" fill="' + N + '"/>' +
        '<path d="M20 40 C13 60 13 80 20 94 L35 94 C28 74 28 54 31 44 Z" fill="' + N + '"/>' +
        '<path d="M76 40 C83 60 83 80 76 94 L61 94 C68 74 68 54 65 44 Z" fill="' + N + '"/>' +
        cara(48, 46, 26, 23) +
        // flequillo
        '<path d="M23 36 C27 22 69 22 73 36 C62 29 34 29 23 36 Z" fill="' + N + '"/>' +
        // lentes rojos
        '<rect x="24" y="34" width="21" height="17" rx="6" fill="none" stroke="' + RO + '" stroke-width="3.4"/>' +
        '<rect x="51" y="34" width="21" height="17" rx="6" fill="none" stroke="' + RO + '" stroke-width="3.4"/>' +
        '<path d="M45 41 L51 41" stroke="' + RO + '" stroke-width="3.4"/>' +
        '<path d="M24 39 L18 37 M72 39 L78 37" stroke="' + RO + '" stroke-width="4"/>' +
        ojo(34, 43, 3.2) +
        ojo(62, 43, 3.2) +
        boca(48, 56, 36, 12, true) +
        // carpeta amarilla
        '<rect x="56" y="70" width="26" height="20" rx="2" fill="' + OR + '" stroke="' + N + '" stroke-width="' + G + '" transform="rotate(-6 69 80)"/>',
    },
    {
      id: "av_pliego",
      rol: "Pautado",
      porque: "El Profesor Jirafales: da la clase completa aunque nadie la pida.",
      cuerpo:
        torso("#5A6472") +
        '<path d="M39 64 L48 84 L57 64 Z" fill="#fff" stroke="' + N + '" stroke-width="3"/>' +
        '<path d="M44 66 L48 78 L52 66 Z" fill="' + RO + '" stroke="' + N + '" stroke-width="2.2"/>' +
        cara(48, 46, 26, 23) +
        // sombrero de paja
        '<ellipse cx="48" cy="26" rx="36" ry="7" fill="#D8C08A" stroke="' + N + '" stroke-width="' + G + '"/>' +
        '<path d="M31 26 C31 8 65 8 65 26 Z" fill="#E7D3A6" stroke="' + N + '" stroke-width="' + G + '"/>' +
        '<path d="M31 22 L65 22" stroke="' + RO + '" stroke-width="3.4"/>' +
        ojo(37, 39, 3.6) +
        ojo(60, 39, 3.6) +
        // bigote de brocha
        '<path d="M25 58 C33 48 45 51 48 56 C51 51 63 48 71 58 C62 68 53 64 48 61 C43 64 34 68 25 58 Z" fill="' + N + '"/>' +
        '<path d="M84 62 C92 70 88 86 76 90" fill="none" stroke="' + N + '" stroke-width="' + G + '" stroke-linecap="round"/>',
    },
    {
      id: "av_lola",
      rol: "Canvas",
      porque: "Bob Ross: los errores son solo arboles felices.",
      cuerpo:
        torso("#2F5D8A") +
        // afro como masa unica
        '<ellipse cx="48" cy="32" rx="33" ry="24" fill="' + N + '"/>' +
        '<ellipse cx="18" cy="34" rx="12" ry="16" fill="' + N + '"/>' +
        '<ellipse cx="78" cy="34" rx="12" ry="16" fill="' + N + '"/>' +
        cara(48, 48, 25, 22) +
        ojo(39, 44, 3.4) +
        ojo(58, 44, 3.4) +
        // barba
        '<path d="M27 56 C29 72 67 72 69 56 C61 65 35 65 27 56 Z" fill="' + N + '"/>' +
        boca(48, 58, 20, 8, false) +
        // paleta
        '<ellipse cx="20" cy="84" rx="13" ry="10" fill="#C98A5C" stroke="' + N + '" stroke-width="' + G + '" transform="rotate(-18 20 84)"/>' +
        '<circle cx="16" cy="80" r="2.8" fill="' + RO + '"/><circle cx="25" cy="80" r="2.8" fill="' + BL + '"/>' +
        '<circle cx="21" cy="88" r="2.8" fill="' + VE + '"/>' +
        '<path d="M31 74 L42 65" stroke="' + N + '" stroke-width="3.4" stroke-linecap="round"/>',
    },
    {
      id: "av_pepe",
      rol: "Documentos",
      porque: "Hermione: si no esta escrito, no existe.",
      cuerpo:
        torso("#3B3F4A") +
        '<path d="M32 72 C40 82 56 82 64 72" fill="none" stroke="' + RO + '" stroke-width="6"/>' +
        // melena
        '<path d="M14 50 C4 16 92 16 82 50 C86 70 78 86 68 92 C72 70 68 58 61 52 C55 64 41 64 35 52 C28 58 24 70 28 92 C18 86 10 70 14 50 Z" fill="#4A2E1B"/>' +
        cara(48, 46, 25, 23) +
        '<path d="M20 34 C26 20 70 20 76 34 C64 27 32 27 20 34 Z" fill="#4A2E1B" stroke="' + N + '" stroke-width="3"/>' +
        ojo(38, 45, 3.4) +
        ojo(59, 45, 3.4) +
        boca(48, 58, 22, 8, false) +
        // libro
        '<rect x="8" y="68" width="32" height="24" rx="2" fill="' + BL + '" stroke="' + N + '" stroke-width="' + G + '"/>' +
        '<path d="M8 76 L40 76" stroke="#fff" stroke-width="3"/>' +
        '<path d="M14 84 L34 84" stroke="#fff" stroke-width="2.4"/>',
    },
    {
      id: "av_tere",
      rol: "Editor de video",
      porque: "El que edita a las 3 a.m.: lleva tres noches sin dormir y aun asi sonrie.",
      cuerpo:
        '<path d="M8 96 C8 66 26 52 48 52 C70 52 88 66 88 96 Z" fill="' + AZUL + '" stroke="' + N + '" stroke-width="' + G + '"/>' +
        cara(48, 48, 24, 22) +
        // capucha
        '<path d="M20 46 C20 22 76 22 76 46 L76 34 C68 16 28 16 20 34 Z" fill="' + AZUL + '" stroke="' + N + '" stroke-width="' + G + '"/>' +
        // audifonos
        '<path d="M18 44 C18 16 78 16 78 44" fill="none" stroke="' + N + '" stroke-width="4"/>' +
        '<rect x="9" y="42" width="13" height="18" rx="5" fill="' + BL + '" stroke="' + N + '" stroke-width="4"/>' +
        '<rect x="74" y="42" width="13" height="18" rx="5" fill="' + BL + '" stroke="' + N + '" stroke-width="4"/>' +
        // lentes
        '<circle cx="39" cy="46" r="9.5" fill="none" stroke="' + N + '" stroke-width="4.4"/>' +
        '<circle cx="58" cy="46" r="9.5" fill="none" stroke="' + N + '" stroke-width="4.4"/>' +
        '<path d="M48.5 46 L49.5 46" stroke="' + N + '" stroke-width="4"/>' +
        ojo(39, 46, 3) +
        ojo(58, 46, 3) +
        // ojeras
        '<path d="M31 57 Q39 61 47 57 M51 57 Q59 61 66 57" fill="none" stroke="' + N + '" stroke-width="2.6"/>' +
        boca(48, 60, 20, 7, false) +
        // laptop
        '<rect x="22" y="78" width="52" height="20" rx="2" fill="#0F1726" stroke="' + N + '" stroke-width="' + G + '"/>' +
        '<path d="M30 84 L62 84 M30 90 L54 90" stroke="' + VE + '" stroke-width="2.6"/>',
    },
    {
      id: "av_lupe",
      rol: "Investigacion",
      porque: "Sherlock Holmes: todo dato tiene una huella.",
      cuerpo:
        torso("#6B5B45") +
        cara(48, 48, 25, 22) +
        // gorra de dos viseras
        '<path d="M26 34 C26 14 70 14 70 34 Z" fill="#8A7A5C" stroke="' + N + '" stroke-width="' + G + '" stroke-linejoin="round"/>' +
        '<path d="M26 33 C16 36 14 43 23 45 M70 33 C80 36 82 43 73 45" fill="#8A7A5C" stroke="' + N + '" stroke-width="' + G + '"/>' +
        '<path d="M34 31 L62 31" stroke="' + N + '" stroke-width="3"/>' +
        ojo(40, 46, 3.2) +
        ojo(57, 46, 3.2) +
        boca(48, 58, 18, 7, false) +
        // pipa
        '<path d="M62 58 C76 61 80 68 71 74" fill="none" stroke="' + N + '" stroke-width="' + G + '" stroke-linecap="round"/>' +
        '<circle cx="69" cy="74" r="4.6" fill="#7a4a2a" stroke="' + N + '" stroke-width="3"/>' +
        // lupa
        '<circle cx="72" cy="38" r="12" fill="#cfe6ff" fill-opacity=".45" stroke="' + N + '" stroke-width="3.4"/>' +
        '<path d="M81 48 L90 58" stroke="' + N + '" stroke-width="3.8" stroke-linecap="round"/>',
    },
    {
      id: "av_mel",
      rol: "Voz",
      porque: "El trapero del barrio: mic, cadena y cero pena para hablar en publico.",
      cuerpo:
        torso("#12161F") +
        '<path d="M36 68 C36 84 60 84 60 68" fill="none" stroke="' + OR + '" stroke-width="4.4"/>' +
        '<circle cx="48" cy="84" r="5" fill="' + OR + '" stroke="' + N + '" stroke-width="2.6"/>' +
        cara(48, 48, 25, 22) +
        // gorra
        '<path d="M26 36 C26 15 70 15 70 36 Z" fill="' + BL + '" stroke="' + N + '" stroke-width="' + G + '" stroke-linejoin="round"/>' +
        '<path d="M70 34 C84 34 86 42 71 42" fill="' + BL + '" stroke="' + N + '" stroke-width="' + G + '"/>' +
        // lentes blancos
        '<rect x="25" y="41" width="20" height="15" rx="3" fill="#fff" stroke="' + N + '" stroke-width="' + G + '"/>' +
        '<rect x="51" y="41" width="20" height="15" rx="3" fill="#fff" stroke="' + N + '" stroke-width="' + G + '"/>' +
        '<path d="M45 48 L51 48" stroke="' + N + '" stroke-width="' + G + '"/>' +
        ojo(35, 48.5, 2.8) +
        ojo(61, 48.5, 2.8) +
        boca(48, 60, 26, 9, false) +
        // microfono
        '<rect x="76" y="70" width="11" height="22" rx="5.5" fill="' + GRIS + '" stroke="' + N + '" stroke-width="' + G + '"/>' +
        '<path d="M72 72 L63 63" stroke="' + N + '" stroke-width="3.6" stroke-linecap="round"/>',
    },
    {
      id: "av_cesar",
      rol: "Modelo 3D",
      porque: "Steve de Minecraft: el cubo primero, la belleza despues.",
      cuerpo:
        '<path d="M14 96 C14 78 28 68 48 68 C68 68 82 78 82 96 Z" fill="' + TJ + '" stroke="' + N + '" stroke-width="' + G + '"/>' +
        // cabeza cuadrada
        '<path d="M22 20 L74 20 L74 64 L22 64 Z" fill="#C98A5C" stroke="' + N + '" stroke-width="' + G + '" stroke-linejoin="round"/>' +
        '<path d="M22 30 L74 30 L74 20 L22 20 Z" fill="#4A2E1B" stroke="' + N + '" stroke-width="4"/>' +
        '<rect x="31" y="42" width="11" height="10" fill="#fff" stroke="' + N + '" stroke-width="3"/>' +
        '<rect x="54" y="42" width="11" height="10" fill="#fff" stroke="' + N + '" stroke-width="3"/>' +
        '<rect x="34" y="44" width="6" height="5" fill="' + N + '"/>' +
        '<rect x="57" y="44" width="6" height="5" fill="' + N + '"/>' +
        '<path d="M38 55 L58 55" stroke="' + N + '" stroke-width="4"/>' +
        '<path d="M22 36 L16 36 M74 36 L80 36" stroke="' + N + '" stroke-width="3.4"/>' +
        // cubo isometrico
        '<path d="M72 76 L86 83 L72 90 L58 83 Z" fill="' + BL + '" stroke="' + N + '" stroke-width="3.4"/>' +
        '<path d="M58 83 L72 90 L72 96 L58 89 Z" fill="#0057E7" stroke="' + N + '" stroke-width="3.4"/>' +
        '<path d="M86 83 L72 90 L72 96 L86 89 Z" fill="#4B8DF8" stroke="' + N + '" stroke-width="3.4"/>',
    },
    {
      id: "av_nato",
      rol: "Web",
      porque: "El hacker de pelicula: dos pantallas verdes y una capucha.",
      cuerpo:
        '<path d="M6 96 C6 62 26 50 48 50 C70 50 90 62 90 96 Z" fill="#1B2537" stroke="' + N + '" stroke-width="' + G + '"/>' +
        '<path d="M18 46 C18 18 78 18 78 46 L78 34 C70 14 26 14 18 34 Z" fill="#1B2537" stroke="' + N + '" stroke-width="' + G + '"/>' +
        cara(48, 50, 24, 22) +
        ojo(40, 48, 3.4) +
        ojo(57, 48, 3.4) +
        boca(48, 60, 18, 8, false) +
        '<rect x="20" y="78" width="56" height="20" rx="2" fill="#0B2E16" stroke="' + N + '" stroke-width="' + G + '"/>' +
        '<path d="M28 84 L54 84 M28 90 L62 90" stroke="' + VE + '" stroke-width="2.6"/>' +
        '<path d="M6 80 C14 75 20 75 24 75 M90 80 C82 75 76 75 72 75" stroke="' + N + '" stroke-width="4"/>',
    },
    {
      id: "av_vigia",
      rol: "Auditor",
      porque: "El ojo que todo lo ve: revisa lo que nadie quiere que revisen.",
      cuerpo:
        '<path d="M6 48 C6 16 90 16 90 48 C90 80 6 80 6 48 Z" fill="#fff" stroke="' + N +
        '" stroke-width="3.8" stroke-linejoin="round"/>' +
        '<circle cx="48" cy="48" r="18" fill="' + BL + '" stroke="' + N + '" stroke-width="' + G + '"/>' +
        '<circle cx="48" cy="48" r="8" fill="' + N + '"/>' +
        '<circle cx="53" cy="43" r="3" fill="#fff"/>' +
        '<path d="M48 8 L48 2 M24 14 L17 7 M72 14 L79 7 M8 48 L1 48 M88 48 L95 48 M24 82 L17 89 M72 82 L79 89 M48 88 L48 94" ' +
        'stroke="' + N + '" stroke-width="4.4" stroke-linecap="round"/>',
    },
    {
      id: "av_mentor",
      rol: "Mentor",
      porque: "El profe con birrete y libreta: no produce, pregunta y desbloquea.",
      cuerpo:
        torso(OLIVA) +
        '<path d="M22 24 L48 12 L74 24 L48 36 Z" fill="' + AZUL + '" stroke="' + N + '" stroke-width="' + G + '" stroke-linejoin="round"/>' +
        '<path d="M70 26 L70 40" stroke="' + N + '" stroke-width="3.4"/>' +
        '<circle cx="70" cy="42" r="3.4" fill="' + OR + '" stroke="' + N + '" stroke-width="2"/>' +
        '<path d="M22 36 C22 16 74 16 74 36 C66 27 30 27 22 36 Z" fill="' + GRIS + '"/>' +
        cara(48, 46, 26, 23) +
        ojo(38, 44, 3.4) +
        ojo(59, 44, 3.4) +
        '<path d="M33 35 L44 35 M53 35 L64 35" stroke="' + N + '" stroke-width="3" stroke-linecap="round"/>' +
        boca(48, 57, 24, 8, false) +
        '<rect x="12" y="70" width="26" height="18" rx="2" fill="' + HUMO + '" stroke="' + N + '" stroke-width="' + G + '" transform="rotate(-8 25 79)"/>' +
        '<path d="M17 75 L33 73 M17 80 L31 79" stroke="' + BL + '" stroke-width="2.2"/>',
    },
    {
      id: "av_visitante",
      rol: "Visitante",
      porque: "El que pasa a mirar con su gafete: ve todo, no toca nada.",
      cuerpo:
        torso(GRIS) +
        '<path d="M20 34 C20 15 76 15 76 34 Z" fill="' + BL + '" stroke="' + N + '" stroke-width="' + G + '" stroke-linejoin="round"/>' +
        '<path d="M76 34 L88 40 L76 44 Z" fill="' + BL + '" stroke="' + N + '" stroke-width="' + G + '" stroke-linejoin="round"/>' +
        cara(48, 48, 25, 22) +
        ojo(38, 46, 3.6) +
        ojo(59, 46, 3.6) +
        boca(48, 58, 22, 7, false) +
        '<rect x="61" y="72" width="18" height="13" rx="2" fill="#fff" stroke="' + N + '" stroke-width="3"/>' +
        '<path d="M70 72 L70 65" stroke="' + N + '" stroke-width="2.6"/>' +
        '<path d="M65 78 L75 78" stroke="' + BL + '" stroke-width="2.2"/>',
    },
    {
      id: "av_admin",
      rol: "Admin",
      porque: "El que abre y cierra la puerta: lleva la llave y el registro.",
      cuerpo:
        torso(AZUL) +
        '<path d="M22 36 C22 15 74 15 74 36 C66 27 30 27 22 36 Z" fill="' + N + '"/>' +
        cara(48, 46, 26, 23) +
        ojo(38, 44, 3.4) +
        ojo(59, 44, 3.4) +
        boca(48, 57, 26, 9, false) +
        '<circle cx="24" cy="76" r="7" fill="none" stroke="' + OR + '" stroke-width="4.2"/>' +
        '<path d="M29 81 L44 96 M36 88 L40 84 M40 92 L44 88" stroke="' + OR + '" stroke-width="4.2" stroke-linecap="round"/>',
    },
  ];
  var POR_ROL = { admin: "av_admin", mentor: "av_mentor", visitor: "av_visitante" };

  var POR_ID = {};
  LISTA.forEach(function (a) {
    POR_ID[a.id] = a;
  });

  var LEGADO = {
    nodo_alfa: "av_profe",
    nodo_beta: "av_tito",
    nodo_gamma: "av_beto",
    nodo_delta: "av_lola",
    nodo_epsilon: "av_lupe",
    nodo_omega: "av_vigia",
  };

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
    { id: "auditor", nombre: "Auditor" },
  ];
  var ROL_POR_ID = {};
  ROLES.forEach(function (r) {
    ROL_POR_ID[r.id] = r.nombre;
  });

  function porId(id) {
    return POR_ID[id] || LISTA[0];
  }

  window.RAV = {
    lista: LISTA.map(function (a) {
      // `nombre` es lo que la pagina pinta bajo cada avatar (join y perfil):
      // el rotulo del personaje es su rol, no un nombre propio.
      return { id: a.id, nombre: a.rol, rol: a.rol, porque: a.porque };
    }),
    roles: ROLES,
    svg: function (id) {
      var a = porId(id);
      return svg(a.cuerpo, a.porque);
    },
    nombre: function (id) {
      return porId(id).rol;
    },
    rol: function (id) {
      return porId(id).rol;
    },
    porque: function (id) {
      return porId(id).porque;
    },
    rolNombre: function (id) {
      return ROL_POR_ID[id] || id;
    },
    normalizar: function (id) {
      if (!id) return LISTA[0].id;
      if (POR_ID[id]) return id;
      if (LEGADO[id]) return LEGADO[id];
      return LISTA[0].id;
    },
    porRol: function (role) {
      return POR_ROL[role] || "";
    },
  };
})();
