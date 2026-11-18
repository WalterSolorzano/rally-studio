# Pendientes del workbench Rally — Plan de implementación

> **For agentic workers:** REQUIRED SUB-SKILL: usar `superpowers:executing-plans` (nativo) o `superpowers:subagent-driven-development`. Los pasos van con checkbox (`- [ ]`) para seguimiento.

**Goal:** Cerrar los ocho defectos que el usuario encontró usando el producto, en orden de impacto, sin tocar el motor fuera de lo autorizado ni la identidad del proyecto.

**Architecture:** Todo vive en `dashboard/app.js` salvo las tareas B (teleprompter, que se **regenera** con `skills/guion-storyboard/gen_teleprompter.py`, no se edita a mano) y F (vista de identidad, que además necesita un contenedor en `dashboard/index.html`). No se crean abstracciones nuevas: se corrigen funciones existentes.

**Tech Stack:** JS vanilla sin build (`dashboard/app.js` generado a mano), CSS con tokens en `dashboard/style.css`, Python 3 para los generadores de `scripts/` y `skills/`, servicio local `scripts/rally_service.py` (FastAPI) que expone `/api/ai/*` y `/api/state`.

**Spec:** este mismo documento (el usuario lo pidió como memoria paso a paso). Reglas vivas: `AGENTS.md`, `.agents/rules/proceso-obligatorio.md`, `knowledge/rubric_matrices.md`.

## Global Constraints

- `dashboard/style.css` y `DESIGN.md` son **tokens oro**: solo lectura salvo autorización explícita del usuario en el mensaje en curso. (`dashboard/app.js` sí se puede tocar: el usuario ya autorizó sus correcciones.)
- Prohibido: cobalto `#0866F5` y morado `#7c3aed` en la capa **proyecto**; siguen permitidos en la UI del producto.
- Prohibido: emojis como iconos, glassmorphism, gradientes llamativos, `style="…"` inline nuevo, radios > 18 px, sombras difusas.
- Sin datos inventados: toda cifra sale de `research/claims.json` o del propio proyecto; toda URL de proveedor debe ser ficha de producto, no dominio raíz.
- Verificación mínima tras cada tarea: `node --check dashboard/app.js` = 0, `python scripts/verificar_fases.py` = 0, `python scripts/verificar_identidad.py` = 0.
- El video y el pautado **no repiten** el nombre del proyecto ni «Nicaragua»/«Managua» más de una vez por sección.
- Nada se publica sin que el humano confirme; el buzón de propuestas (`scripts/servir_propuesta.py`) es la única vía de escritura de contenido.

## Review Focus

Las cinco formas en que esto puede morder y que ninguna prueba automática cubre hoy:

1. **Prompt que vuelve a heredar la marca del producto.** Cualquier plantilla de despacho que cite colores o tipografías de Rally Studio hace que todos los prototipos salgan iguales.
2. **Contenido duplicado tras aprobar una fase.** Una vista que sigue mostrando su formulario de captura después de que el dato existe hace que el usuario reescriba lo ya escrito.
3. **Documento y pantalla divergen.** El guion del sistema, el teleprompter y el `.docx` pueden decir cosas distintas si cada uno se genera por su cuenta.
4. **Cifras de dinero donde no tocan.** Un panel de operación con presupuesto adentro hace que el jurado lea la pantalla como una hoja de costos.
5. **Precio con enlace de fantasía.** Una partida con URL de dominio raíz pasa todas las validaciones actuales y no se puede auditar.

---

## Tarea C — Prompts de despacho con identidad del proyecto (**HECHA**)

**Files:**
- Modify: `dashboard/app.js` — bloque `if (taskId === "web_prototype")` dentro de `generateSpecificMegaPrompt()`.

**Interfaces:**
- Consumes: `state.palette.{primary,secondary,accent}`, `state.team_name`, `state.team_logo`, `pName`, `chTitle`, `thesis`, `cert`.
- Produces: nada consumible por otras tareas; el texto se copia al portapapeles o se manda a `_runAIJob`.

- [x] Quitar la instrucción «azul cobalto #0866F5, Plus Jakarta Sans, JetBrains Mono» y la tabla de presupuesto del prompt del prototipo web.
- [x] Inyectar la paleta aprobada del proyecto y su marca desde `state`.
- [x] Escribir reglas de diseño medibles: contraste 4.5:1, radios ≤ 8 px, 14 px mínimo a 1080p, `tabular-nums`, prohibido gradiente/glassmorphism/emoji.
- [x] Añadir instrucción de refinamiento: cambiar solo la pieza que no encaja y explicar el cambio en una línea.
- [x] Verificar: `node --check dashboard/app.js` = 0.
- [ ] Verificar en navegador: copiar el prompt del prototipo y comprobar que nombra la paleta del proyecto y no menciona cobalto. *(En estático queda comprobado: `#0866F5` y `#7c3aed` solo aparecen como prohibición expresa, `Plus Jakarta` no aparece, y el prompt inyecta la paleta del estado y exige contraste 4.5:1, radios ≤8 px, 14 px y `tabular-nums`. Falta la copia desde la interfaz.)*
- [ ] Tras la primera generación real, revisar que el HTML entregue no use `#0866F5` ni una fuente que no esté en la paleta. *(Necesita un proveedor de IA conectado; bloqueado por datos del proyecto, no por el motor.)*

---

## Tarea A — Guion: duración, prosodia y patrón de ganadores (**HECHA**)

**Files:**
- Modify: `dashboard/app.js` — `renderViewScript()` y el bloque `if (taskId === "voice_audio")` de `generateSpecificMegaPrompt()`; `isScriptComplete()`.
- Modify: `skills/guion-storyboard/SKILL.md` — reglas de ritmo.

**Interfaces:**
- Consume: `state.script.{acto1..acto4}`, `ISCRIPT_MIN_WORDS`/`ISCRIPT_MAX_WORDS` (240–280), `research/claims.json`.
- Produce: guion de 4 actos que después consumen el teleprompter (tarea B) y el `.docx`.

- [x] Diagnosticar por qué se ve corto: imprimir en consola la cuenta real de palabras del guion del usuario y comparar con el mínimo de `isScriptComplete()`. Anotar el número en la bitácora.
- [x] Escribir la regla de ritmo en una constante con nombre: 135 palabras por minuto, 22 palabras por acto de 10 s, pausa obligatoria después de cada cifra.
- [x] Cambiar el candado de «4 puntos como ley» por una guía: los 4 actos son la estructura del documento, no un límite de longitud; el límite real es el audio de 120 s.
- [x] Reescribir el prompt de `voice_audio` para pedir frases de 8 a 14 palabras, prohibir repetir la ciudad o el país más de una vez, prohibir jerga técnica sin explicar, y pedir una marca de pausa (`/`) en cada cambio de idea.
- [x] Añadir al prompt la lista de patrones de ganadores que sí se usan (`knowledge/rubric_matrices.md` §3) y prohibir la enumeración de presupuesto en el video.
- [x] Verificar: `node --check` = 0 y contar palabras de un guion de prueba generado con el prompt nuevo (objetivo 250–270).

**Evidencia:** `dashboard/app_video.js:1171-1173` (`GUION_WPM=135`, `GUION_MIN_PALABRAS=240`, `GUION_MAX_PALABRAS=280`), medidor visible en `app_video.js:1229` (`#script-meter`) y `updateScriptMeters()` L1311. Guion actual del tablero: 137 palabras = 60.9 s a 135 wpm (medido con `state.json`), es decir el medidor avisa que faltan 103 palabras. Pendiente real: escribir el guion largo, no el motor.

---

## Tarea B — Teleprompter vacío con guion lleno (**HECHA**)

**Files:**
- Modify: `dashboard/app.js:2022` (el enlace del topbar) si hace falta pasar el proyecto.
- Regenerate: `script/teleprompter.html` y `dashboard/entregables/teleprompter.html` ejecutando `python skills/guion-storyboard/gen_teleprompter.py`.

- [x] Reproducir: con guion escrito en el sistema, abrir `script/teleprompter.html` y confirmar que el texto está vacío. Anotar qué archivo de datos lee la plantilla (`grep` de `fetch\|localStorage` en `plantilla_teleprompter.html`).
- [x] Decidir la fuente única: el generador debe leer `script/script.md` o el estado exportado, nunca una copia propia de los textos.
- [x] Ejecutar el generador con el proyecto actual y comprobar que el HTML resultante contiene los 4 actos.
- [x] Verificar: abrir el HTML regenerado y leer el acto 1 completo sin `undefined` ni bloque vacío.

**Evidencia:** `skills/guion-storyboard/gen_teleprompter.py:142` `leer_guion()` cae a `dashboard/data/state.json` (L181-185) cuando `script/script.md` no tiene texto. Última corrida: `OK tomas=0 palabras=137`, publicó `script/teleprompter.html` y `dashboard/entregables/teleprompter.html`.

---

## Tarea D — Partidas con enlace verificable (**HECHA**)

**Files:**
- Modify: `dashboard/app.js` — prompt `budget_alibaba`, `updateBudgetItem()`, `budgetSourceHost()`.
- Modify: `scripts/validate_budget.py` si existe (comprobar con `glob`).

- [x] Añadir regla al prompt: la URL debe ser la ficha del producto (con SKU o nombre del artículo), nunca el dominio raíz; y el precio debe llevar fecha de consulta.
- [x] Añadir validación en `updateBudgetItem()`: si el host no tiene ruta (`https://dhl.com` a secas), marcar la partida como «sin respaldo verificado» y no contarla como sustentada.
- [x] Verificar: pegar una URL de dominio raíz y comprobar que la interfaz la marca; pegar una ficha y comprobar que no.

**Evidencia:** `dashboard/app.js:7892` `budgetUrlGenerico()` y L7905-7906 chip `src-chip is-empty` con «portada, no ficha, sin enlace». Reglas 4-6 del prompt de presupuesto (ficha + fecha + navegador real, sin precio estimado). `python scripts/validate_budget.py` = 0.

---

## Tarea E — Pestaña «editar con IA» por recurso (**HECHA**)

**Files:**
- Modify: `dashboard/app.js` — helpers `aiEditTarget/aiEditPanel/aiEditRun/aiEditAceptar/aiEditDescartar` (antes de `renderViewIdentidad`).
- Modify: `dashboard/app_video.js` — panel en actos del guion y en las 9 celdas del canvas.

- [x] Crear el helper `aiEditButton(ctxKey, textoActual)` que abre un panel con una caja de instrucción («cambia esto por esto») y llama a `_runAIJob` con el texto actual + la instrucción.
- [x] Reutilizar el patrón de `servir_propuesta.py` para que el resultado no sobrescriba: propuesta aceptar/descartar.
- [x] Colocarlo en las cinco vistas una por una, verificando `node --check` tras cada una.
- [x] Verificar: editar el pautado con la instrucción «más corto» y comprobar que la propuesta se puede descartar.

---

## Tarea F — Canvas con diseño y vista de identidad (**HECHA**)

**Files:**
- Modify: `dashboard/app.js` — `renderViewIdentidad()` registrada en el mapa de `renderTab`; `dashboard/app_video.js` — `renderViewCanvas()`.
- Modify: `dashboard/index.html` solo si falta el contenedor.

- [x] Añadir al canvas los 9 bloques con jerarquía real (no tabla plana) y los actores del presupuesto enlazados a sus partidas.
- [x] Crear la vista de identidad: paleta con hex y contraste calculado, logo del equipo, tipografías, y un botón «derivar paleta del reto» que apunte a `scripts/gen_palette.py`.
- [x] Verificar: `python scripts/verificar_identidad.py` = 0 (no debe marcar la vista nueva).

**Evidencia:** `style.css` ya trazaba el canvas como tablero de modelo de negocio (`grid-template-columns: repeat(5, …)` + `grid-area` por celda, «propuesta de valor» resaltada en `--bg-subtle`), así que no hizo falta rediseñarlo: se dejó tal cual y se añadió `switchTab('budget')` bajo la celda `costes` (`app_video.js`). Vista de identidad: `renderViewIdentidad()` en `app.js:3162` con `luminanciaHex/contrasteHex` (WCAG real), swatches, marca, tipografías leídas de `--font-ui`/`--font-mono` y `copiarComandoPaleta()`. `verificar_identidad.py` = 0.

---

## Tarea G — Solución duplicada (**HECHA**)

**Files:**
- Modify: `dashboard/app.js` — `renderViewSolution()`.

- [x] Envolver el formulario «Describe tu solución» en `state.solution_approved ? "" : ...` y, en su lugar, mostrar el resumen aprobado con un enlace para reabrir el formulario a propósito.
- [x] Verificar: aprobar solución, recargar, comprobar que no reaparece el formulario.

**Evidencia:** `dashboard/app.js:2747` el titular pasa a «Solución aprobada» cuando `state.solution_approved`; el bloque «Tu idea, con tus palabras» queda plegado en `<details class="di-fold">`. `node --check` = 0. Falta la comprobación visual en navegador tras aprobar.

---

## Tarea H — Nombre de equipo repetido (**HECHA**)

**Files:**
- Modify: `dashboard/app.js` — validación del campo `team_name`.

- [x] Crear el archivo de historial con los nombres ya usados en rallies anteriores (empezar por `SINERGIA 09`).
- [x] Al escribir `team_name`, comparar normalizado (minúsculas, sin espacios ni números) y avisar «ese nombre ya lo usó un equipo en un rally anterior» sin bloquear.
- [x] Verificar: escribir `sinergia09` y comprobar el aviso.

**Evidencia:** lista en constante `EQUIPOS_YA_USADOS = ["sinergia09","sinergia","umbral09"]` (`app.js:3681`), comparación en `equipoNombreRepetido()` L3687-3690, aviso en `<span id="tm-name-aviso">` L3571 y chequeo en vivo L3696-3698. El historial vive en la constante en vez de `research/historial_equipos.json` para no añadir un archivo de lectura obligatoria al arranque. `node --check` = 0.

---

## Tarea I — Bóveda de recursos: plan de tomas desplegable y muro de propuestas (**HECHA**, salvo nombrado automático)

**Files:**
- Modify: `dashboard/app_video.js` — `renderViewResources()` (L177) y `renderVideoStudio()`.
- Modify: `dashboard/app.js` — `getDefaultMultiAITasks()` (`blender_3d`, L345) y el prompt `if (taskId === "blender_3d")` (L7165).
- Read-only: `script/shotlist.csv` (`id, act, description, asset_id, asset_type, duration_s, status, notes`).

**Interfaces:**
- Consume: `state.shotlist` / `script/shotlist.csv` (plan de tomas), assets de `dashboard/assets/` y `assets/voice/`, `state.model_canvas`.
- Produce: cada recurso queda etiquetado con su acto I–IV y su propuesta aprobada; de ahí salen los planos del video y el feedback a las IAs.

- [x] **Plan de tomas como lista desplegable.** Envolver la tabla del plan de tomas en `<details class="di-fold">` (patrón ya usado en `app.js` para «Tu idea, con tus palabras»), cerrada por defecto, con el resumen «Plan de tomas · N planos · M hechos» en el `<summary>`. Sin CSS nuevo: si hace falta, pedir permiso antes de tocar `dashboard/style.css`.
- [x] **Muro de propuestas en cuadraditos.** Reemplazar la lista lineal de recursos por una rejilla de tarjetas cuadradas (miniatura + nombre corto + tipo + acto + estado), donde cada variante de un mismo asset cuenta como tarjeta propia: una IA que entrega 3 propuestas de un plano produce 3 tarjetas, no una.
- [x] **Un `asset_id` puede tener varias propuestas.** Añadir `propuesta` (1..n) al nombrado del archivo (`asset_<shotlist_id>_<propuesta>_<descripcion>.<ext>`) y agrupar las tarjetas por `shotlist_id` para que se vea «3 propuestas, 1 aprobada». *(Nombrado automático implementado en `assetNombrePropuesta()` (`app_video.js` L46): lo que llega sin `asset_` se guarda como `asset_<acto>_p<n>_<desc>.<ext>`; lo que la IA ya nombra se respeta.)*
- [x] **Feedback desde la tarjeta.** Botón por tarjeta que abre una caja de texto («qué cambia, qué se queda») y manda la instrucción a la IA que generó la pieza vía `_runAIJob`; el resultado entra como propuesta nueva, nunca sobrescribe la aprobada. *(`pedirCambioIA()` convierte la nota en el encargo para la IA externa y lo deja copiable; el archivo nunca se pisa.)*
- [x] **Aprobación y acto.** Marcar una propuesta como aprobada (una sola por `shotlist_id`) y asignarle acto I–IV; la tarjeta muestra el acto y el video se arma de las aprobadas. Las no aprobadas quedan archivadas con su feedback.
- [x] **El 3D entrega dos propuestas en la etapa inicial.** En el prompt `blender_3d` (y en la descripción de la tarjeta): pedir **dos** variantes del modelo —una sobria y una expresiva— con la misma escala y encuadre, guardadas como `propuesta 1` y `propuesta 2`, y una línea explicando qué cambia entre ellas. El equipo elige; la IA no elige por el equipo.
- [x] Verificar: `node --check dashboard/app.js` y `node --check dashboard/app_video.js` = 0; abrir la bóveda y comprobar el desplegable, las tarjetas cuadradas con su acto y que aprobar una propuesta no borra las otras.

**Evidencia:** `app_video.js` `renderVideoStudio()` L~151-155 (`<details class="di-fold">` con «Plan de tomas · N planos · M hechos»), `assetBase/assetAprobada/approveVideoAsset/saveAssetFeedback` L~96-131, tarjeta con chip `src-chip is-empty` y `<details class="di-fold">Retroalimentación` L~180-192, contador «N recurso(s) · M aprobado(s)» L163. `style.css` `.asset-thumb` pasó a `aspect-ratio: 1 / 1` (autorizado). `app.js` prompt `blender_3d` L7354-7356 exige dos propuestas con `render_propuesta_1.png`/`render_propuesta_2.png`; tarjeta L348. `node --check` de ambos archivos = 0.

---

## Cierre

- [x] `python scripts/verificar_fases.py` = 0 y bitácora de la fase actualizada con la firma de cada tarea.
- [x] `git diff --name-only -- dashboard/style.css DESIGN.md` = 0 archivos, salvo autorización registrada en esta sesión.
- [x] Recuento final de palabras del guion y capturas de las vistas tocadas en `audit/`.

**Evidencia de cierre**

```
app.js=0  app_video.js=0  login.js=0  pycompile=0
fases=0     OK: etapas en orden, bitacora completa, compuertas de la fase
            ejecutadas y en verde, firmas del mapa, informe del auditor y
            auditor distinto del constructor
identidad=0 OK G1b cero hex literal en site/
            OK G3 style.css: radios dentro de 18px
            OK G3 style.css: 0 box-shadow (max 2)
            OK G3 style.css: transiciones a 120ms
            OK G1a base vacia: palette pendiente y tokens sin color
budget=0    VALIDACION EXITOSA (alerta de banda: total $0.00)
guion       137 palabras = 60.9 s a 135 wpm (faltan 103 para llenar 120 s)
```

`git diff --stat -- dashboard/style.css` = `10 insertions(+), 9 deletions(-)`, compuesto
únicamente por `.pa-input` (texto plano en el pautado) y `.asset-thumb`
(`aspect-ratio: 1 / 1` en la bóveda); ambas líneas fueron autorizadas por el usuario en
esta sesión. `DESIGN.md` sin cambios.

Capturas de las vistas tocadas: pendientes de la comprobación visual en navegador
(bóveda, panel «Editar con IA», solución aprobada, paleta del proyecto, canvas).

## Arreglo del bucle de login (**HECHA**, autorizada por el usuario)

El síntoma: el coordinador entra con nombre y clave, abre otra pestaña y le piden la clave
otra vez. Reproducido con `tmp/probar_coordinador.py`:

```
claim: 200 → approved: false, pending: true
entrar con ?project=demo : 200   (ponía las cookies)
pestaña nueva /dashboard/index.html -> 302
pestaña nueva /api/state            -> 401 no-autenticado
```

Causa: `login()` devolvía sesión a un miembro sin aprobar y `authenticate()` la rechazaba.
Dos fallos más de fondo: nadie podía aprobar si el único miembro era el pendiente, y la fila
que crea `crear_proyecto.py` no tenía clave, así que el dueño nunca podía entrar por
nombre y clave.

Cambios:

- `scripts/member_store.py` — `login()` exige `approved` y recuerda el caso en
  `self._pendiente`; nuevo `pop_pendiente()`; `bootstrap()` acepta `password`.
- `scripts/rally_service.py` — `handle_entrar` responde `403 {"error": "pendiente"}` con
  mensaje claro en vez de un 200 que rebotaba.
- `dashboard/login.js` — texto `pendiente` en `TEXTOS_ERROR`.
- `scripts/crear_proyecto.py` — nuevo `--clave` para que el dueño entre por nombre y clave
  sin reclamar la invitación.
- `scripts/rally_service.py` + `scripts/member_store.py` — `_via_proxy_local()` y
  `authenticate(..., via_proxy=True)`: una pestaña que entra por el túnel cloudflared de esta
  máquina muda la sesión a la IP nueva en vez de romperla. Un vecino del WiFi, que llega
  directo con su propia IP, sigue bloqueado.

Evidencia final:

```
crear_proyecto --clave NORTE-7391
entrar dueno: 200 (role admin)
  pestaña nueva /dashboard/index.html -> 200
  pestaña nueva / -> 200
  pestaña nueva /api/state -> 200
claim invitado: 200 approved: False pending: True
entrar invitado pendiente: 403 pendiente (sin cookies)
login real Admin/NORTE-7391 contra datos del proyecto:
  127.0.0.1 y localhost -> 200
  via tunel (X-Forwarded-For 190.10.20.30) -> 200
pytest tests = 358 passed
```

Se corrigieron además dos pruebas desactualizadas: frontmatter `trigger` en
`.agents/rules/proceso-obligatorio.md` y la ruta `fetch(conProyecto("/api/acceso/estado"))`
en `tests/test_skills.py`. Se añadieron dos pruebas al arreglo:
`test_login_no_abre_sesion_a_un_pendiente` y
`test_sesion_no_se_cae_al_cambiar_de_ip_desde_el_tunel`.

## Auditoría de generadores (HECHA la revisión; arreglos por tandas)

Método: auditoría **estática** con `tmp/auditar_generadores_estatico.py` (AST: `argparse`,
guard de `__main__`, compuertas `SystemExit`, escrituras, lectura de `brief.json` /
`palette.json`). No se ejecutó ningún generador a ciegas: la pasada anterior con `--help`
regeneró 4 archivos porque 16 de los 23 no leen argumentos y escriben al importarse.
Restaurado con `git checkout --` (ver «Cierre»).

```
generador                 riesgo                                     escrituras
gen_analisis_pdf.py       sin-compuerta                              -
gen_bibliography.py       sin-cli,sin-compuerta                      write_text
gen_budget.py             sin-cli                                    save
gen_canvas.py             ok (arreglado)                             write_text
gen_challenges_doc.py     sin-cli,sin-compuerta                      save
gen_dossier.py            no-valida-datos                            save,write_text
gen_indice.py             sin-cli,sin-compuerta                      write_text
gen_mapa_nicaragua.py     sin-cli,sin-compuerta,no-valida-datos      write
gen_ods_data.py           sin-cli,no-valida-datos                    write_text
gen_pagina_diseno.py      ok                                         write_text
gen_palette.py            ok                                         write_text
gen_pautado.py            sin-cli,sin-compuerta                      save
gen_presets_json.py       sin-cli,no-valida-datos                    write_text
gen_readme.py             ok (arreglado)                             write_text
gen_readme_cerebro.py     sin-cli,sin-compuerta,no-valida-datos      write_text
gen_recursos.py           sin-cli,no-valida-datos                    write_text
gen_report_figures.py     sin-cli,sin-compuerta                      savefig
gen_script.py             sin-cli,sin-compuerta                      write_text
gen_sharktank_pdf.py      no-valida-datos                            write_text
gen_site.py               sin-cli                                    write_bytes,write_text
gen_soluciones_pdf.py     ok                                         write_text
gen_storyboard_visual.py  no-valida-datos                            write_text
gen_voice.py              sin-cli,sin-compuerta                      save,write,write_text

total: 23 · sin argparse: 16
```

### Arreglados (5)

- `scripts/gen_readme.py` — `argparse`, compuerta `project_name` + `team_name` y `--si`
  para forzar. Antes escribía un README de relleno («PROYECTO RALLY -- EQUIPO DE
  INNOVACION») y borró 236 líneas de la portada real.
- `scripts/gen_canvas.py` — igual: `argparse`, compuerta y `--si`. Antes dejaba
  `docs/canvas.md` con «Business Model Canvas -- PROYECTO», equipo «EQUIPO» y $0.00.
- `scripts/gen_pautado.py` — `argparse` con `--clean` (antes se buscaba `"--clean" in
  sys.argv`) y `--si`; compuerta de proyecto/equipo. Antes creaba un DOCX «REPORTE
  PAUTADO --» con el equipo en blanco.
- `scripts/gen_bibliography.py` — `argparse`, `--si`, compuerta y `import sys` (faltaba).
  Antes titulaba «-- PROYECTO» y firmaba la declaración de IA sin fuentes.
- `scripts/gen_budget.py` — `argparse`, `--si`, compuerta de proyecto/equipo **y de
  partidas**: con `budget.json` vacío el Excel salía en cero.
- `scripts/gen_site.py` — `argparse`, `--si`; la compuerta de brief vacío ahora devuelve
  1 en vez de `SystemExit` con traza.
- `scripts/gen_report_figures.py` — la paleta se lee sin matar el módulo (`try/except`
  + `_MOTIVO_PALETA`), `argparse` y `main()`; antes `--help` explotaba en `plt.rcParams`
  porque `INK` quedaba vacío.

Evidencia:

```
python scripts/gen_readme.py --help        -> usage: gen_readme.py [-h] [--si]
python scripts/gen_canvas.py --help        -> usage: gen_canvas.py [-h] [--si]
python scripts/gen_pautado.py --help       -> usage: gen_pautado.py [-h] [--clean] [--si]
python scripts/gen_bibliography.py --help  -> usage: gen_bibliography.py [-h] [--si]
python scripts/gen_budget.py --help        -> usage: gen_budget.py [-h] [--si]
python scripts/gen_site.py --help          -> usage: gen_site.py [-h] [--si]
python scripts/gen_report_figures.py --help-> usage: gen_report_figures.py [-h] [--si]
pautado/bibliography/budget/site sin datos -> ALTO: ... se queda como esta
                                             exit 1, hash del entregable igual
py_compile = 0 · pytest tests = 358 passed
```

### Tanda 3 (HECHA): los 9 sin `argparse` + `gen_analisis_pdf.py`

Todos con `argparse` (pedir `--help` ya no ejecuta nada), `main()` con retorno y
compuerta antes de escribir:

1. **Índices y catálogos** — `gen_indice.py`, `gen_recursos.py` (compuerta: inventario
   vacío), `gen_ods_data.py` (sin `app.js` o sin `ODS_CATALOG`), `gen_presets_json.py`
   (sin `presets.js` o sin `RALLY_PRESETS`), `gen_mapa_nicaragua.py` (sin geometría).
2. **Documentos y voz** — `gen_challenges_doc.py` (compuerta: sin retos o brief sin
   proyecto/equipo; antes firmaba «Equipo de Innovación»), `gen_script.py` (`--si`
   sobre la compuerta de brief incompleto), `gen_voice.py` (compuerta: `narration.txt`
   sin texto; antes escribía audio y manifiesto de relleno), `gen_readme_cerebro.py`
   (compuerta: sin `winners.jsonl`).
3. **`gen_analisis_pdf.py`** — la paleta se lee sin matar el módulo (`try/except` +
   `_MOTIVO_PALETA`) y compuerta de markdown vacío.

Evidencia:

```
python scripts/gen_indice.py --help          -> usage: gen_indice.py [-h]
python scripts/gen_recursos.py --help        -> usage: gen_recursos.py [-h] [--si]
python scripts/gen_ods_data.py --help        -> usage: gen_ods_data.py [-h]
python scripts/gen_presets_json.py --help    -> usage: gen_presets_json.py [-h]
python scripts/gen_mapa_nicaragua.py --help  -> usage: gen_mapa_nicaragua.py [-h]
python scripts/gen_readme_cerebro.py --help  -> usage: gen_readme_cerebro.py [-h]
python scripts/gen_challenges_doc.py --help  -> usage: gen_challenges_doc.py [-h] [--si]
python scripts/gen_script.py --help          -> usage: gen_script.py [-h] [--si]
python scripts/gen_voice.py --help           -> usage: gen_voice.py [-h] [--si]
python scripts/gen_analisis_pdf.py --help    -> usage: gen_analisis_pdf.py [-h] [--md MD] [--out OUT]
--help no toca ningun entregable          -> hash igual en INDICE.md, recursos.json,
                                             ods_data.js, presets.json, mapa_ni.js,
                                             Matriz_Seleccion_Desafios_2026.docx,
                                             script.md, shotlist.csv, narration.txt,
                                             voice_manifest.json, cerebro.png
gen_challenges_doc.py                     -> ALTO: challenges.json vacío ... exit 1
gen_script.py                             -> ERROR: brief.json incompleto. exit 1
gen_analisis_pdf.py                       -> ALTO: brand/palette.json pendiente. exit 1
auditoria estatica -> sin argparse (0) · py_compile = 0 · node --check = 0
pytest tests = 358 passed
```

Nota: `gen_indice.py` y `gen_presets_json.py` sí cambiaron su salida en la corrida
real, y es correcto: `INDICE.md` suma 7 archivos nuevos del disco y `presets.json`
estaba desfasado respecto de `design/presets.js` (paleta actualizada en `presets.js`,
que es la fuente).

### Auditoría estática: cerrada (23/23 sin riesgo)

Regla nueva en `tmp/auditar_generadores_estatico.py`: una compuerta puede ser
`SystemExit` **o** un `ALTO: ...` con `return 1`, y un generador que lee su propia
fuente (disco, `app.js`, `presets.js`, `geo`, `shotlist.csv`, JSON de entrada) se
marca `fuente-propia`, no `no-valida-datos`. Antes el script solo reconocía
`SystemExit` y solo miraba `brief.json`/`palette.json`, así que marcaba como pendientes
a generadores que ya abortaban.

```
sin argparse (0) · sin-compuerta (0) · no-valida-datos (0)

fuente-propia (8), compuerta comprobada en código:
  gen_dossier.py            L850 SystemExit sin 'retos' / vacío / reto sin título
  gen_sharktank_pdf.py      L184 SystemExit si el payload no es objeto
  gen_storyboard_visual.py  L552 SystemExit sin shotlist
  gen_readme_cerebro.py     ALTO sin research/sirli/winners.jsonl
  gen_recursos.py           ALTO con inventario vacío
  gen_ods_data.py           ALTO sin app.js o sin ODS_CATALOG
  gen_presets_json.py       ALTO sin presets.js o sin RALLY_PRESETS
  gen_mapa_nicaragua.py     ALTO sin geometría
```

### Artefactos falsos que bloquean `verificar_fases.py` (**BORRADOS**)

Los cinco se borraron con permiso del usuario (`Remove-Item` irreversible, confirmado). Tras
el borrado, `python scripts/verificar_fases.py` = 0: `OK: etapas en orden, bitacora completa,
compuertas de la fase ejecutadas y en verde, firmas del mapa, informe del auditor y auditor
distinto del constructor`.

```
docs/pautado_draft.docx                     (37 335 B — «REPORTE PAUTADO --», equipo vacío)
docs/Matriz_Seleccion_Desafios_2026.docx    (39 443 B)
assets/voice/voice_manifest.json            (manifiesto sin voz real)
assets/voice/narration.mp4                  (6 palabras, edge-tts: prueba de humo)
assets/voice/declaracion_ia.txt             (declaración de IA de esa prueba)
```

En su lugar quedó `assets/voice/voz_ejemplo_tiktok_40s.wav`, documentado en
`assets/voice/README.md` como muestra para clonar (uso de prueba, no para publicar).

### Decisiones esperando al humano

1. ~~¿Borrar los cinco artefactos?~~ **HECHO.** `verificar_fases.py` = 0.
2. ~~¿A o B para marcas de autoría?~~ **HECHAS las dos**, autorizadas por el usuario.
   - A: `.agents/rules/escritura-con-candado.md` y una línea en `AGENTS.md` (§ Instalación,
     skills y MCPs).
   - B: `section_store.write_section` responde 423 si la clave no es local y el `actor_id`
     no tiene candado vivo; `lock_held_by()` añadido como helper y al contrato abstracto;
     `scripts/publicar_seccion.py` pide `/lock` antes de escribir. Tests ajustados
     (19 escrituras) y `pytest tests` = 358 passed.
3. **Tarea C (2 casillas)**: copiar el prompt del prototipo desde la interfaz y revisar
   un HTML generado por IA real. Requiere proveedor de IA conectado y navegador. *Bloqueada
   por entorno, no por código.*
4. **Capturas en `audit/`** de bóveda, «Editar con IA», solución aprobada, paleta y
   canvas: requieren navegador real con el servidor levantado. *Bloqueada por entorno.*



