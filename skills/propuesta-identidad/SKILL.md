---
name: propuesta-identidad
description: Convierte el nombre, logo o una idea del equipo en propuestas de identidad visual (paleta, tipografías, tokens, dirección de logotipo). Úsala cuando el usuario no tiene marca, no le gusta la que tiene o pide que la interfaz se vea mejor.
---

# El Diseñador de Carretera Masaya — Propuesta de identidad visual

## Navegador obligatorio (browser MCP)

La foto real y la verificación visual **no se hacen sin el navegador**.

1. La foto de la problemática se busca y se descarga **desde la página real** de
   Unsplash o Pexels, abierta en el navegador MCP; se registra autor y URL.
2. Verifica las **6 variantes `fx-*` a 1280×720** abriendo `/design/` en el
   navegador y capturando cada una: contraste, margen ≥6 % y texto legible.
3. Sin captura no hay aprobación del thumbnail.
4. Si el navegador MCP no está conectado, detente y pide instalar la extensión y
   abrir la sesión.
5. `handoff` solo para login/2FA; nunca resuelvas captchas.

## Cuándo usarla

- El equipo no tiene logo, paleta ni tipografías.
- El usuario dice "no me gusta cómo se ve" o "propón una identidad".
- Hay un logo y hace falta derivar el resto del sistema.

No la uses para el dossier de soluciones ni para contenido de retos: eso es
`dossier-soluciones`.

## Procedimiento

1. **Primera pregunta, siempre: ¿ya existe una paleta aprobada?** Lee
   `brand/palette.json` y `brand/tokens.css` y pregúntalo explícito. Si ya hay
   paleta aprobada, se usa esa y aquí solo se verifica contraste y tokens; no se
   propone otra.
2. Haz las preguntas de diseño antes de proponer: nombre del proyecto, a qué se dedica,
   público, tono (sobrio / cálido / técnico), si hay logo o color obligatorio y en qué
   dispositivo se verá. Si el usuario ya las respondió en la conversación, no las repitas.
3. La paleta se deriva **del reto**, no del logo. `python scripts/gen_palette.py` lee
   `brief.json` (`challenge_title`, sector, ciudad) y propone tres rutas A/B/C con el
   contraste WCAG de cada una. El logo, si existe, solo ajusta el ancla: nunca la define.
4. Sirve las **tres rutas** al buzón (`--tab team --slot main`) con su contraste impreso.
   El humano compara y elige una. Sin elección no se escriben tokens.
5. Aprobación explícita: `python scripts/gen_palette.py --ruta B --si`. Solo entonces se
   escriben `brand/palette.json` (`_status: "aprobada"`) y `brand/tokens.css`.
6. Verifica: `python scripts/verificar_identidad.py` debe imprimir `OK` (contraste >= 4.5,
   cero hex literal en `site/`, tokens completos).
7. Esto no se hace en un solo paso ni en un minuto: sin tres rutas servidas y una aceptada,
   escribir en `site/`, `script/` o `budget/` está prohibido. Ver
   `.agents/rules/proceso-obligatorio.md`.

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

## Detalle completo (leer antes de producir)

El procedimiento largo, las tablas y los ejemplos de esta skill están en
`references/detalle.md`. Es obligatorio leerlo antes de generar contenido: ahí viven las
reglas que no caben en esta portada.
