/* Rally Design — catálogo de variantes visuales (fuente de verdad).
   Exportable a JSON con: python scripts/gen_presets_json.py

   Cada variante define SOLO estilo; el texto vive en contenido.js / brief.json:
     skin  → lenguaje visual (refined | bold | data | pop | comic)
     cover → composición de portada/cierre (a | b | c | d | e | f | g)
     card  → composición de la lámina de integrante (diagonal | right | band | circle | sticker | cutout)
     deco  → elemento gráfico de fondo (orbit | circuit | halftone | dots | grid | blob | none)
     pal   → bg, bg2, ac, ink, mu, gl
     fonts → t (titular), b (texto), l (etiquetas)

   Cada estilo usa una tipografía de titular propia: repetir la misma hace que
   los estilos se ven como la misma lámina con otro color. */
var RALLY_PRESETS = [
  {
    id: "orbita",
    name: "Órbita",
    skin: "refined",
    cover: "a",
    card: "diagonal",
    deco: "orbit",
    notes: "Referencia de marca: fondo casi negro azulado, acento rojo ladrillo, titular condensado de trazo medio y retícula de integrantes.",
    pal: { bg: "#0A0C12", bg2: "#12141A", ac: "#B8392E", ink: "#E9EDF3", mu: "#8C9199", gl: "#1B2130" },
    fonts: { t: "Archivo Narrow", b: "Barlow", l: "JetBrains Mono" }
  },
  {
    id: "papel",
    name: "Editorial",
    skin: "refined",
    cover: "b",
    card: "right",
    deco: "none",
    notes: "Revista en papel frío: titular contenido a la izquierda, cifras en columna a la derecha y nómina de integrantes con aire. Se lee, no grita.",
    pal: { bg: "#F5F6F8", bg2: "#E9ECF0", ac: "#A63A30", ink: "#171A20", mu: "#555D6A", gl: "#D7DCE3" },
    fonts: { t: "Bricolage Grotesque", b: "Barlow", l: "JetBrains Mono" }
  },
  {
    id: "cartel",
    name: "Afiche",
    skin: "bold",
    cover: "c",
    card: "band",
    deco: "none",
    notes: "Afiche nocturno: fondo tinta, titular condensado medido, cifras y nómina centradas en el bloque medio. Impacto sin huecos muertos.",
    pal: { bg: "#12151A", bg2: "#191D24", ac: "#E07A3C", ink: "#EEF1F5", mu: "#97A0AB", gl: "#242A33" },
    fonts: { t: "Anton", b: "Archivo", l: "JetBrains Mono" }
  },
  {
    id: "rejilla",
    name: "Rejilla",
    skin: "data",
    cover: "d",
    card: "right",
    deco: "grid",
    notes: "Sistema de datos: fondo azul profundo, retícula visible, etiquetas monoespaciadas y cifras como tabla. La foto va en degradado a la derecha, no en círculo.",
    pal: { bg: "#070d18", bg2: "#0b1424", ac: "#2f9bd6", ink: "#e8f1fa", mu: "#8fa3b8", gl: "#16233a" },
    fonts: { t: "Space Grotesk", b: "Archivo", l: "JetBrains Mono" }
  },
  {
    id: "burbuja",
    name: "Burbuja",
    skin: "pop",
    cover: "e",
    card: "band",
    deco: "halftone",
    notes: "Pop en blanco: fondo blanco, tinta azul profunda, titular redondeado con sombra corta, etiquetas en pastilla y foto en banda superior (nada de círculos).",
    pal: { bg: "#FFFFFF", bg2: "#F0F4FA", ac: "#1D4ED8", ink: "#0F172A", mu: "#64748B", gl: "#E2E8F0" },
    fonts: { t: "Fredoka", b: "Barlow", l: "JetBrains Mono" }
  },
  {
    id: "comic",
    name: "Tinta",
    skin: "comic",
    cover: "f",
    card: "cutout",
    deco: "none",
    notes: "Tinta sobre papel frío, sin trama ni estallidos: titular sólido, filetes finos y acento solo en las cifras. La versión adulta del trazo.",
    pal: { bg: "#F7F8FA", bg2: "#E9ECF1", ac: "#A8322E", ink: "#15181D", mu: "#525A66", gl: "#D9DEE6" },
    fonts: { t: "Archivo Black", b: "Barlow", l: "JetBrains Mono" }
  },
  {
    id: "estudio",
    name: "Estudio",
    skin: "refined",
    cover: "g",
    card: "right",
    deco: "none",
    notes: "Minimalista: blanco, una sola tinta de marca, mucho aire y una retícula de integrantes sin adornos. La versión limpia de la casa.",
    pal: { bg: "#FFFFFF", bg2: "#F0F6FF", ac: "#0866F5", ink: "#0D1B35", mu: "#5C7193", gl: "#DCE7F5" },
    fonts: { t: "Plus Jakarta Sans", b: "Barlow", l: "JetBrains Mono" }
  },
  {
    id: "neon",
    name: "Neón",
    skin: "bold",
    cover: "a",
    card: "diagonal",
    deco: "grid",
    notes: "Noche y lima: fondo casi negro, acento lima eléctrico, titular condensado con sombra dura y retícula técnica al fondo.",
    pal: { bg: "#0a0f0c", bg2: "#101812", ac: "#b8f336", ink: "#edf7e2", mu: "#8ca08b", gl: "#1c2a1e" },
    fonts: { t: "Oswald", b: "Barlow", l: "JetBrains Mono" }
  }
];
