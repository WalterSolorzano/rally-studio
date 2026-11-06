---
name: propuesta-identidad
description: Convierte el nombre, logo o una idea del equipo en propuestas de identidad visual (paleta, tipografías, tokens, dirección de logotipo). Úsala cuando el usuario no tiene marca, no le gusta la que tiene o pide que la interfaz se vea mejor.
---

# El Diseñador de Carretera Masaya — Propuesta de identidad visual

## Cuándo usarla

- El equipo no tiene logo, paleta ni tipografías.
- El usuario dice "no me gusta cómo se ve" o "propón una identidad".
- Hay un logo y hace falta derivar el resto del sistema.

No la uses para el dossier de soluciones ni para contenido de retos: eso es
`dossier-soluciones`.

## Procedimiento

1. Haz las preguntas de diseño antes de proponer: nombre del proyecto, a qué se dedica,
   público, tono (sobrio / cálido / técnico), si hay logo o color obligatorio y en qué
   dispositivo se verá. Si el usuario ya las respondió en la conversación, no las repitas.
2. Si hay logo (`brand/logo.png` o el que indique), extrae 2–3 colores dominantes. Si no
   hay, parte del nombre y del sector.
3. Propón **2 direcciones** distintas, no una. Cada una trae:
   - paleta de 5 colores con HEX y contraste del primario sobre el fondo (mínimo 4.5:1,
     objetivo 7:1);
   - pareja tipográfica (títulos + UI + datos) justificada en una línea;
   - 3 palabras de personalidad y 2 anti-ejemplos ("esto no es");
   - una frase de concepto para el logotipo.
4. Recomienda una y explica por qué en dos líneas.
5. Cuando el usuario elija, escribe `brand/palette.json` y `brand/tokens.css`, y sirve la
   propuesta a la ventana (`--tab team --slot main` para identidad, `--tab resources
   --slot main` para piezas gráficas).
6. Verifica contraste antes de dar por buena una paleta.

## El módulo de diseño (`design/`)

Cuatro piezas comparten una sola identidad (`localStorage["rally_design_v5"]`):

| Pieza | Archivo | Qué produce |
|---|---|---|
| Carrusel | `design/index.html` | 6 portadas de equipo (puede usar figuras básicas) |
| Kit de prensa | `design/kit.html` | Hoja institucional con logos y contacto |
| Thumbnail | `design/thumb.html` | Portada 1280×720 del video |
| Impacto | `design/impacto.html` | Lámina de ODS y Plan País |

Reglas que valen en las cuatro:

- La identidad se lee y se escribe solo con `RallyDiseno` (`design/shared.js`). No tocar
  `localStorage` a mano ni reemplazar `S` por referencia: `_espejar` muta el objeto vivo
  porque `cargarBrief(S, cb)` conserva esa referencia.
- Un cambio de identidad entra por `RallyDiseno.aplicarPatch(patch)`; las claves permitidas
  son `style, pal, fonts, team, mem, styles, decor, bio, impacto`. Cualquier otra se rechaza.
- La paleta de identidad usa roles `bg, bg2, ac, ink, mu, gl`; `sanitizePalette` trabaja con
  `bg, primary, secondary, accent` y **borra `ac`** si se le pasa la identidad cruda.
  Usar siempre `_sanearPal`.
- `_sanearPal` respeta el lado claro u oscuro: un fondo `#14100c` sigue oscuro y su tinta
  sigue clara. Corrige solo el contraste (tinta ≥4.5:1, marca ≥3:1) y los morados.
- `paperColor()` devuelve el fondo real de la identidad; `legibleInk(paper)` y
  `brandColor(paper)` calculan la tinta y la marca legibles sobre ese papel.
- El kit de prensa es una hoja impresa: usa `kitPaper()` (siempre clara, `#FFFFFF` como
  último recurso) y nunca hereda un fondo oscuro. Sin esa guarda el nombre del grupo sale
  crema sobre blanco.
- La sección del servidor es `design_identity` (`/api/sections/design_identity`,
  `dashboard/data/sections.db`, espejo en `dashboard/data/state.json`). Se aplica al cargar
  solo si su versión supera `localStorage["rally_design_sync_v"]`; ante 409 se conserva lo
  local y no se pisa nada.

### Marca del proyecto (no la del equipo)

- Vive anidada en `team.proyecto` y **no hereda** la paleta ni las fuentes del equipo. El kit
  la pinta aparte; `Llevar esta identidad al kit completo` es la única vía para copiarla.
- Si falta el nombre, el asistente lo pide y exige `problem` y `audience` antes de sugerir:
  no inventa proyecto, público ni cifras.
- Nombres por patrones reales del banco SIRLI (`research/sirli/winners.jsonl`): inventado
  (NEXORA, KINETIX), objeto (AVOCADO, LUMBRE), compuesto (NEXO-SOSTENIBLE), territorio + número
  (ALTIPLANO 360), sufijo técnico (BIOINNOVATECH) y juego (DESUCHO, ERROR 404).
- Slogan, misión, visión e inspiración se recombina solo con lo que el usuario escribió.
- `PROJ_STYLES` trae 12 estilos (eco, juvenil, institucional, tech, comunitaria, premium,
  cultural, artesanal, deportiva, minimal, científica, experimental) basados en la taxonomía
  de `rebrand.gallery` y los 12 arquetipos de marca. Cada uno trae paleta, pareja tipográfica
  validada por `fuenteOk()` y marcas de referencia; el recomendado sale del sector y el tono.
- Las paletas no se improvisan: parten de sistemas probados en campo (Patagonia, IBM Carbon,
  Duolingo, Aesop, Nike, Nature, etc.). `ac` y `ink` deben pasar AA (≥4.5:1) sobre `bg` y
  `bg2`; `ac2` es solo acento decorativo y nunca lleva texto encima. El amarillo no se mezcla
  con café por defecto: si aparece, es un acento secundario con su pareja declarada.
- Las paletas del catálogo no usan morado. Ninguna familia fuera de `FONT_LIBRARY` se acepta.
- Cada estilo declara su pareja tipográfica y el **porqué** (`PROJ_FONT_WHY`): el kit la imprime
  bajo `Títulos: X · Cuerpo: Y` y muestra H1, H2, H3 y párrafo con esa pareja. Nada de serif
  genérica tipo Times: `institucional` usa Fraunces + Inter, `comunitaria` Petrona + Public Sans
  y `premium` Bodoni Moda + Jost.
- Los elementos gráficos se exportan como PNG **2048×2048 con fondo transparente** (mosaico o
  motivo, en color de marca o blanco) desde `descargarPatronPNG()`; el kit y el thumbnail se
  exportan como PNG y PDF reales, no como data URI sin extensión.

## Fuentes

- Biblioteca única: `design/fonts.js` → `FONT_LIBRARY` (**243 familias** verificadas por HTTP en
  10 grupos: sans 50, serif 39, display 39, condensada 9, cartoon 25, elegante 6,
  experimental 27, manuscrita 20, tecnica 12, mono 16), servidas desde Google Fonts con
  `loadFont(familia, pesos)`.
- `allFontOptions()` arma el selector con esos grupos; `parejaAleatoria()` elige título y
  cuerpo de grupos distintos para que dos propuestas no salgan con la misma pareja.
- Vetadas las tipografías viejas: `FONT_VETADAS` (Times New Roman, Georgia, Garamond, Arial,
  Courier, Verdana, Calibri, Comic Sans, Impact, Papyrus, Futura…) y `esFuenteVetada()` las
  rechaza tanto en `loadFont` como en `loadFontFromUrl` (por el `family=` de la URL). El kit
  avisa `'Fuente retirada: … es tipografia vieja.'`.
- `loadFontFromUrl` solo acepta `https` de `fonts.googleapis.com`, `fonts.gstatic.com`,
  `fonts.bunny.net`, `use.typekit.net` o `cdn.jsdelivr.net`. Cualquier otro host se bloquea y
  el kit lo informa en `statusKit`.
- `loadFont` sanea familia (`^[A-Za-z0-9][A-Za-z0-9 -]{0,60}$`) y pesos (`400;700` si vienen
  corruptos). Familia inválida no genera `<link>`.
- Una fuente sugerida por IA solo se aplica si está en `FONT_LIBRARY` (`fuenteOk()` en
  `kit.js`); si no, se queda la actual. Nunca inventar familias; `ia.js` arma sus prompts de
  `_titulos()` / `_cuerpos()` leyendo la biblioteca, no una lista fija.

## Prohibiciones gráficas

- **Thumbnail y piezas de portada:** prohibido resolver el gráfico con cuadrados,
  rectángulos, círculos o triángulos. Se usa foto real, vector complejo o un modelo de
  Blender; banco de imágenes cuando falte el objeto.
- **Carrusel:** sí puede usar figuras básicas como estructura.
- La imagen del thumbnail debe mostrar el **reto ya resuelto y su impacto**, no decoración.
  Se guarda en `S.thHeroImg` (local, dataURL, no se sincroniza), con efecto en `S.thHeroFx`
  (`foco | zoom | barrido | blur`).
- **Prioriza una foto real de la problemática y del reto** (personas, oficio, territorio,
  comunidad) sobre cualquier ilustración o render. Fuentes: Unsplash, Pexels o foto propia.
  Una ilustración solo si no existe registro fotográfico de la escena. Si no hay foto real,
  la portada queda marcada como pendiente: no se rellena con figuras ni se inventa la escena.
- La imagen no lleva texto, logos ni marcas de agua: el texto lo pone la plantilla.

## Reglas del thumbnail (fallos reales que no se repiten)

Comprobarlas en las seis variantes (`editorial, mapa, bold, minimal, poster, diagonal`),
no solo en la activa:

- **Contraste de titular:** claro sobre fondo oscuro, tinta sobre papel claro. Nunca tinta
  oscura sobre fondo oscuro; el caso `editorial` sin foto es oscuro y exige titular claro.
  Si la identidad trae un `bg` oscuro, `minimal` fuerza papel blanco (`thumbPaper()`).
- **Contraste de etiquetas:** ningún texto con menos de 4.5:1. La etiqueta de la esquina no
  usa fondos translúcidos claros con texto blanco (caso `diagonal`).
- **Croquis de Nicaragua siempre visible y completo:** dentro del lienzo, sin recortes en
  los bordes, con opacidad y trazo suficientes para reconocerse en las seis variantes. Si un
  adorno (círculo, disco, degradado) lo tapa, se quita el adorno. Pisos verificados en
  `kit.css`: `minimal` relleno ≥ .45, `bold` trazo 1.5 op .75, `poster` trazo 1.6 sobre
  papel, `diagonal` 28% abajo a la derecha. El croquis nunca va debajo de un adorno con
  `z-index` mayor.
- **Sin número de reto en la esquina:** "01" no comunica nada a un jurado. La esquina lleva
  una etiqueta de texto o el hashtag del equipo (`retoLabel()`); nunca un número suelto.
- **Sin duplicar el nombre del grupo:** vive en la cabecera. El pie muestra ciudad o
  etiqueta propia, jamás el mismo nombre (`kickerText()`).
- **Titular centrado verticalmente** entre la cabecera y la banda de firma, no pegado arriba.
- **Sin figuras básicas** (círculos, discos, triángulos) como decoración de portada.


## Prueba antes de entregar

1. `node --check` en `shared.js`, `fonts.js`, `ia.js`, `kit.js`, `thumb.js`.
2. Abrir las cuatro páginas desde `http://127.0.0.1:8000/design/` y confirmar que
   `RallyDiseno` y el botón **IA diseño** existen.
3. `RallyDiseno.aplicarPatch({pal:{ac:'#…'}})` cambia `S.pal.ac`, el storage y el DOM.
4. `RallyDiseno.sincronizar()` devuelve `version`; recargar en perfil limpio aplica la
   sección remota.
5. En thumbnail: `minimal` sin imagen es tinta sobre papel claro; `editorial` sin imagen es
   titular claro sobre fondo oscuro. Con imagen, el titular es blanco y la capa `.hero`
   tiene la clase `fx-*`. Capturar las seis variantes a 1280×720 y mirar la imagen: el
   croquis debe reconocerse completo en cada una, sin "01" en la esquina ni nombre de grupo
   repetido en el pie.

## Generación de prompts para llevar la identidad a otra IA

Cuando el usuario quiera exportar la paleta, tipografías o tokens a otra IA
(OpenAI, Claude, Gemini, OpenCode, Antigravity…), genera el prompt con esta
estructura:

```
Rol: diseñador de identidad visual para proyectos de innovación universitaria.
Contexto: Rally de innovación, certamen <rally_type>, proyecto <project_name>,
  equipo <team_name>, ciudad <city>.
Entrada: `brand/palette.json`, `brand/tokens.css`, `design/fonts.js` (FONT_LIBRARY),
  `PRODUCT.md`, `DESIGN.md`.
Tarea: Generar propuestas de identidad visual (paleta, tipografías, tokens,
  dirección de logotipo, elementos gráficos).
Restricciones:
  - Sin morado (#7c3aed o similar), sin degradados estilo IA, sin glassmorphism,
    sin tarjetas repetidas.
  - Sin emojis como íconos en la web demo.
  - Fuentes solo de `FONT_LIBRARY` (243 familias verificadas).
  - Contraste WCAG AA como piso, AAA como meta.
  - Paleta de 5 colores con HEX y contraste del primario sobre el fondo
    (mínimo 4.5:1, objetivo 7:1).
  - Nombrado de assets: asset_<shotlist_id>_<descripcion>.<ext>.
Formato de salida: JSON con claves proyecto, equipo, ciudad, direccion (2
  opciones), paleta (5 colores HEX), tipografias (titulos/cuerpo/datos),
  personalidad (3 palabras), anti_ejemplos (2), concepto_logo, elementos_graficos
  (descripción de cada uno), contraste_verificado.
Idioma: español.
```

## Cómo sugerir un título o nombre de proyecto o producto

Sigue los patrones reales del banco SIRLI (`research/sirli/winners.jsonl`):

- **Inventado**: NEXORA, KINETIX
- **Objeto**: AVOCADO, LUMBRE
- **Compuesto**: NEXO-SOSTENIBLE
- **Territorio + número**: ALTIPLANO 360
- **Sufijo técnico**: BIOINNOVATECH
- **Juego**: DESUCHO, ERROR 404

Reglas:
- Nunca repites el nombre del proyecto más de una vez por sección.
- No hardcodees el nombre en scripts; léelo siempre de `brief.json`.
- El nombre debe entenderse fuera del país (Latam) o tener arraigo cultural
  (Nacional).
- El nombre no va en los primeros 20 s del video.
- Slogan, misión, visión e inspiración se recombina solo con lo que el usuario
  escribió. No inventas proyecto, público ni cifras.

## Cómo enseñar visualmente (identidad y materiales didácticos)

- Una sola distancia focal por secuencia con rótulos.
- Antes de dar por bueno un rótulo, mídelo: proyecta su caja a coordenadas de
  pantalla (u,v) y comprueba que queda dentro del cuadro con margen ≥6 %.
- Contraste garantizado: texto claro emisivo sobre placa oscura propia, o sombra
  de texto desplazada. Nunca texto gris sobre fondo iluminado.
- Un rótulo sin flecha que apunte a la pieza no dice nada.
- Varios rótulos en el mismo lado se pisan: lleva un registro por lado y reubica
  el siguiente candidato vertical hasta que no choque.
- Tipografía: regular antes que bold (el bold a 540p embota los acentos),
  acentos reales en español, tamaño ≥2 % de la altura del cuadro.
- El croquis de Nicaragua siempre visible y completo, sin recortes en los bordes.

## Cómo redactar guiones cuidando la pronunciación y el orden de palabras

- Escribe para ser escuchado, no leído: oraciones cortas, sujeto-verbo-objeto,
  evita subordinadas encajadas.
- Acentos reales en español; acrónimos se deletrean si no son de uso común.
- Cada cambio de idea necesita una pausa o transición explícita.
- Máximo 240-270 palabras (≈130-140 WPM) para ≤ 120 s de audio.
- No repitas el nombre del proyecto más de una vez por sección.

## Cómo sugerir elementos gráficos

- Thumbnail y piezas de portada: prohibido resolver con cuadrados, rectángulos,
  círculos o triángulos. Usa foto real, vector complejo o un modelo de Blender.
- La imagen del thumbnail muestra el reto ya resuelto y su impacto, no
  decoración.
- Prioriza una foto real de la problemática y del reto (personas, oficio,
  territorio, comunidad) sobre cualquier ilustración o render.
- La imagen no lleva texto, logos ni marcas de agua: el texto lo pone la
  plantilla.
- Elementos gráficos se exportan como PNG 2048×2048 con fondo transparente.
- Sin emojis como íconos en la web demo.
- Sin cards genéricas, sin morado (#7c3aed o similar), sin fuentes fuera de
  `brand/tokens.css`.

## Cómo crear modelos 3D (referencia)

Cuando la identidad necesite un modelo 3D para el video, la skill
`modelo-3d-blender` genera modelos o renders 3D con Blender, con ficha técnica
previa justificada por la rúbrica. Ver `skills/modelo-3d-blender/SKILL.md`.

- Nada de fuentes fuera de las declaradas en `brand/tokens.css` sin decirlo y justificarlo.
- Propón; no cambies la identidad del usuario sin que la acepte.
- Contraste WCAG AA como piso, AAA como meta.
- Si el equipo ya fijó marca y no quiere cambiarla, esta skill no se ejecuta.

## Herramientas opcionales

`ui-ux-pro-max`, `impeccable` y `design-system` **no son requisitos**. Si hacen falta,
consúltalas con `python scripts/herramientas.py necesita "<tarea>"` e instala solo esa,
una por tarea. Sin ellas la skill funciona: la identidad se resuelve con preguntas,
contraste medido y tokens escritos a mano.

## Punteros

- Paleta vigente: `brand/palette.json`.
- Tokens: `brand/tokens.css`.
- Generador desde logo: `scripts/gen_palette.py`.
- Doctrina visual del producto: `PRODUCT.md` y `DESIGN.md`.
