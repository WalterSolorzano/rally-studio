# Pendientes de la ventana (no perder)

Estado: las pruebas A/B/C corren sobre `rallysistem_lab`; todo arreglo importante vuelve a este repo.
Regla fija: nada de nombres de proyecto en el código; todo sale de `brief.json` y del estado.

## Entregables (revisar antes de dar por cerrado)

- [x] Word del pautado: 5 secciones dentro de límite, compilado por `POST /api/compile-docx`.
- [x] Excel de presupuesto: `budget/budget.xlsx` con URL por partida.
- [x] Canvas: 9 cuadrantes en la plataforma y `docs/canvas.md` alineados.
- [x] Dossier PDF: `docs/Dossier_Soluciones.pdf` (PDF/Word/Excel) desde `research/soluciones_actuales.json` con `scripts/gen_dossier.py`.

## Correcciones pedidas (esta tanda)

1. [x] **Word: REFERENCIAS vacío.** Compila con 4 líneas (FAO ×2, IPBES, Rally Studio), orden
   alfabético, año y URL en cada una; la IA queda declarada. Evidencia: `compile_pautado_docx`
   sobre el `state.json` del lab → `filled 6`, `warnings []`, 33.044 B.
2. [x] **Espacios de más.** En el .docx compilado: 0 dobles espacios y 0 espacios antes de salto
   (`_norm_text`).
3. [x] **Párrafos al 100% del ancho.** `.pa-input` es `width: 100%; padding: 0; border: 0;
   background: transparent` (`style.css:6975`); no hay caja de 760 px en el redactor (el 760 px
   de `style.css:2283` es el modal de reto).
4. [x] **UI de redactor**: el contador de caracteres se pega al título (antes flotaba al otro
   extremo), el título de cada sección sube a 16 px/800 y los controles de equipo se van a la
   derecha (`.pa-take { margin-left: auto }`). El copiloto deja de ser seis botones grandes:
   se ve como opción discreta bajo el texto (`.pa-section .ai-chat-mini` sin borde ni fondo,
   sin la línea «Editar con IA»). La nota del límite de caracteres entró en «Plantilla oficial
   del evento» y `.pa-note` desapareció del CSS.
5. [x] **"listo" sin aprobación.** Cada sección exige botón `Terminado` y se cierra con
   **aprobación de 2 o más** (`RS_APPROVALS_MIN = 2`); el chip muestra quién editó.
6. [x] **Canvas: un solo "Editar con IA"**, no uno por cuadrante. `renderViewCanvas` no tiene
   botón IA por cuadrante; el único es «Contexto para IA» (`copyCanvasExternalPrompt`).
7. [x] **Guion como documento.** `POST /api/compile-guion-docx` compila `state.script` en
   `dashboard/docs/guion_draft.docx`: texto **corrido** (los actos solo miden tiempo, no van como
   encabezados), línea de equipo/sede/desafío, conteo de palabras y segundos, y «Plan de rodaje»
   con tabla desde `script/shotlist.csv` cuando tiene planos. Botón `Word` en la vista de guion.
   El subtítulo «Cuatro actos, de corrido…» ya no existía (0 coincidencias).
8. [x] **Teleprompter palabra por palabra al dar play.** No se veía porque `pintarTel()` solo
   marcaba párrafos cuando no había micrófono y el CSS no tenía reglas para `.w.dicho`/`.w.ahora`.
   Ahora la palabra en curso se marca siempre (con micro manda la voz, sin micro el reloj) y se
   pinta en cyan con las dichas atenuadas: verificado en Chrome, `.w.ahora` avanza
   «Cada → una → de → termina» cada ~0.5 s y el acto pasa I → II. El arreglo va en
   `skills/guion-storyboard/plantilla_teleprompter.html`, no en el HTML generado.
9. [x] **PDF del dossier con la paleta** del proyecto. Decisión del usuario: se queda el diseño
   fijo de `docs/assets/dossier.css`; no aplica.
10. [x] **Presupuesto**: fuera "Flete e importación a México" del `budget.json` y del estado vivo
    del lab; las 7 partidas que quedan son cosas que se compran. Cantidades alineadas al canvas
    (25 colmenas → 25 de cada pieza; el cable estaba en 12 y el nodo en 27 por ediciones sueltas).
    `gen_budget.py --si` → **$1,792.50**, 1 hoja, 7 renglones + total, URL en cada partida.
    **Para que no vuelva:** `gen_budget.py` ahora se detiene con `filas_prohibidas()` si alguna
    partida dice flete/arancel/aduan/importaci; `skills/presupuesto` fija que `units` sale del
    canvas o del BOM y que `logistica` es transporte local, nunca importación; las reglas viejas
    («línea obligatoria de flete 15-20 %») salieron de `knowledge/winners_database.json`,
    `brain/corpus/ganadores_db.md` y del README que generaba `gen_readme.py`.
    El Excel es una sola hoja por diseño: `gen_budget.py` no pagina ni reparte por categorías, y
    con 7 partidas cabe de sobra. La cifra del canvas (`recursos`) se ajustó al mismo total.
11. [x] **Canvas visual**: el tablero es una mesa (`--bg-subtle`, 14 px de aire); cada cuadrante es
    tarjeta blanca con borde, radio 10 y 196 px de alto, número en placa de color y título en
    `--text-body`, con un tono propio por bloque (`color-mix` primary→accent, sin colores
    ajenos); la propuesta de valor se tiñe y lleva el acento; el campo sube a 96 px (13 px/1.6)
    para texto largo y `:focus-within` cambia borde, no sombra. Subtítulo fuera
    (`app_video.js:732`). Verificado en Chrome a 1600 y 1064 px.
12. [x] **Word del dossier ya no trae la tabla «DATOS DE LA SOLUCIÓN».** Fuera de `_docx_reto` y
    `tabla_dos` eliminado del generador; el .docx sale con 0 coincidencias y 0 «Beneficiario».

## Pendiente del encargo A/B/C

- [ ] A3 en `script` y `budget`: escribir por la UI, recargar y confirmar en el servidor.
- [ ] B teclado: Esc cierra ficha del potenciador y chat; foco atrapado en el modal.
- [x] C: sellar el `?v=` del cache-bust desde el servicio (`7b0a030`).
- [ ] C: cadena completa en copia desechable, `RALLY_DATA_DIR` + túnel.

## Plan de corrección (tanda nueva, 18 nov)

Cada punto dice qué se toca y cómo se comprueba. Nada se da por hecho sin captura o salida real.

13. [x] **Bloqueo de patrones de redacción IA.** El veto vive en `skills/_comun/patrones-ia.md`
    (10 bloques: adjetivos de relleno, sustantivos gastados, verbos corporativos, conectores huecos,
    palabras sueltas, frases enteras, estructuras, formato, tono, artefactos como
    `?utm_source=chatgpt.com`). Se cita desde `.agents/rules/pautado-y-guion.md` (no existe
    `skills/pautado/`), `guion-storyboard`, `dossier-soluciones`, `proponer-retos`, `presupuesto`,
    `propuesta-identidad`, `auditar-entregable`, y el prompt del copiloto (`aiEditRun`,
    `dashboard/app.js:3532`). **No es solo una regla:** `verificar_identidad.py` gana el grupo **G4**
    (`verificar_redaccion()`), que lee `state.json` (respeta `RALLY_DATA_DIR`), recorre `pautado`,
    `script`, `model_canvas`, `challenges`, `solution_simple`, `solution_thesis`,
    `description_one_line`, y falla nombrando `seccion:palabra` para vetos duros y frases de IA;
    las palabras que sí tienen uso técnico (`clave`, `integral`, `destacar`…) solo avisan.
    Prueba real: base `OK G4 redaccion` + `AVISO … challenges:integral`; lab
    `OK G4 redaccion` + `AVISO … pautado:clave, challenges:integral`. Las dos corridas exit 0.

14. [x] **Guion de corrido con storyboard pequeño.** Fuera los rótulos `Acto I…IV`:
    `renderViewScript` pasó de `<section class="script-act">` con numeral y título a
    `div.script-block` dentro de `#script-edit.script-flow` (un área continua, separada por una
    línea fina). Debajo va `#script-board`: cuatro tarjetas `.script-board-card` con `≈Ns`
    (palabras ÷ `GUION_WPM` 135) y las primeras 8 palabras; se refresca en `updateScriptMeters`.
    `renderScriptRead` también perdió el numeral. Nuevo helper `scriptPalabrasDe(texto)`.
    CSS: `.script-acts/.script-act*` fuera; entran `.script-flow`, `.script-block`,
    `.script-block-tools`, `.script-board*`. Verificado en pantalla real (base servida con datos
    del lab, 8094): `actos:false`, `cards:4`, captura `sc_after.png` con el texto corrido.

15. [x] **Paleta y marca del proyecto.** `renderViewIdentidad` ahora muestra:
    - Paleta con uso declarado y contraste (ya estaba) tal cual.
    - **Tipografía con escala**: familias reales (`--font-ui`, `--font-mono`) y tabla
      `.brand-scale` con título 32/800, subtítulo 20/700, cuerpo 15/400, cifra 28/800 mono.
    - **Misión, visión, promesa y tono de voz**: cuatro campos editables en `.brand-fields`,
      guardados en `state.brand` con `setBrandField(clave, valor)`; vacíos si el equipo no los
      escribió (nada se inventa).
    - **Prompt de logotipo**: `promptLogoProyecto()` arma el encargo con nombre, reto, sector y
      ciudad (SVG, fondo transparente, versión en color y en negativo, variante cuadrada, formas
      del oficio, sin degradados ni marcas ajenas); `copiarPromptLogo()` lo copia.
    CSS nuevo: `.brand-scale`, `.brand-fields`, `.brand-field`, `.brand-field-k`, `.brand-prompt`
    (radios ≤8 px, sin sombras). `skills/propuesta-identidad/SKILL.md` documenta las cinco piezas.
    Verificado con captura real (`id15.png`, `id15b.png`) y `verificar_identidad.py` sin cambios
    de tokens.

16. [x] **Retos del comité: ancho completo, menos carga.** `.content-wrapper` gana la variante
    `.is-wide` (1760 px) que `renderTab` aplica solo a `challenges`. Medido en pantalla:
    `content-wrapper` 1200 → **1760**, `.cr-sheet` 1136 → **1696**. Carga: los comentarios del
    equipo y la lista de quién votó quedan plegados en dos `<details class="cr-fold">`; el veredicto,
    el voto y el botón de elegir siguen a la vista. Capturas `ch_before.png` / `ch_after.png`.

17. [x] **Canvas: PNG fiel y contenido honesto.**
    - Botón `PNG` (junto a `Restablecer` y `Markdown`) → `downloadCanvasPng()` dibuja el mismo
      tablero de la plataforma: 5 columnas, socios/propuesta/segmentos a dos filas, costes 2
      columnas, ingresos 3, tono por bloque mezclando `--color-primary` → `--color-accent` y la
      propuesta teñida. Encabezado con nombre del proyecto, equipo y ciudad desde el estado.
      Nombre del archivo desde `state.project_name`; la URL del blob se libera a los 30 s para que
      la descarga no se corte.
    - Contenido del lab reescrito y guardado por la UI real: «Socios» nombra meliponicultores,
      cooperativas, proveedores y el laboratorio de la UADY; «Recursos» ya no repite al equipo ni
      cita el presupuesto (diseño abierto, biblioteca de patrones, colmenas prestadas, guía);
      «Segmentos» lista personas (meliponicultores de traspatio, productores que ya venden,
      técnicos de campo), no tareas. Fuera «citado en el documento» y «quien paga no está definido».
    - `buildCanvasExternalPrompt()` lleva las reglas por cuadrante y el veto de
      `skills/_comun/patrones-ia.md`, para que la IA que redacta no repita la fórmula.
    Verificado: captura del PNG dibujado (`cv_png2.png`) con el layout de la mesa y los nueve
    textos. Nota: en este Chrome las descargas automáticas por CDP están bloqueadas (hasta un
    `data:` de 4 bytes se queda en `.tmp` y desaparece), así que la prueba es el render del blob,
    no el archivo en Descargas.

18. [x] **Canvas: estilos visuales del tablero.** El `select` de plantilla cambia el contenido;
    el segundo `select` (`.canvas-preset`, `onchange="canvasStyleChanged"`) cambia la piel. Cuatro
    estilos en `CANVAS_STYLES` + `getCanvasStyleId()` (`state.canvas_style`, default `mesa`), y el
    mismo juego se replica en el PNG con el objeto `tema` de `downloadCanvasPng()`:
    - `mesa` — «Mesa de trabajo»: tarjetas blancas sobre mesa gris, filete tenue y barra de acento
      arriba (el de antes).
    - `plano` — «Tarjetas hundidas»: página y mesa en blanco, tarjetas con fondo `--bg-subtle`,
      sin filetes ni barras; el numeral queda en marco (`placa: "line"`).
    - `solido` — «Bloques de color»: cada cuadrante teñido al 12 % con su `--cv-ink` sobre mesa
      teñida al 6 % de primary.
    - `contraste` — «Alto contraste»: mesa en `--text-title`, tarjetas al 34 % de tinta en pantalla
      (70 % en el PNG), título del cuadrante en placa blanca (`tituloFondo`), texto claro.
    Sin `border-left` ni barra lateral en ningún estilo: la separación de fases es por fondo.
    Aire vertical: `canvasPuntos()` deja una viñeta por línea, `.canvas-input` va a
    `line-height: 1.9` y `.canvas-slot > *:last-child { margin-top: auto }` ancla el copiloto al
    pie; el PNG reparte las líneas dentro de la tarjeta (clip propio) y separa párrafos con 8 px.
    Verificado en pantalla y en el PNG dibujado (`st3_*`, `st4_*`, `st5_*`, `st6_*`, `st7_*` con sus
    `png_*`) con datos del lab, `node --check` OK y `verificar_identidad.py` sin avisos nuevos.

## Pregunta pendiente: A3 / B / C

- **A3 en `script`**: conviene repetirlo **después** del punto 14; el 7 ya cambió la vista. El de
  `budget` sigue cerrado.
- **B teclado**: sigue en pie tal cual (Esc en potenciador y chat, foco atrapado).
- **C cadena en copia desechable**: el túnel es acción hacia fuera; no lo levanto sin tu «sí».

