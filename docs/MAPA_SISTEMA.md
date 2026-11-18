# Mapa del sistema Rally Studio

Generado por `python tools/mapa_sistema.py`. No editar a mano: se regenera.

Conteo: **16 skills**, **15 pestanas**, **88 scripts**, **13 entregables**.

## Pestanas de la ventana (13 etapas + resumen)

| # | Pestana | Nivel | Se abre cuando |
|---|---|---|---|
| `resumen` | Resumen del Rally | 0 | () => true, summary: true |
| `certamen` | 00 Certamen | 0 | () => true |
| `team` | 01 Identidad de Equipo | 1 | () => !!state.rally_type |
| `identidad` | Paleta y marca del proyecto | 1 | () => !!state.rally_type |
| `challenges` | 02 Retos del Comité | 2 | () => !!state.rally_type && !!state.team_name |
| `solution` | 03 Taller de Solución | 3 | () => !!state.challenge_id |
| `impact` | 04 Impacto, ODS & Plan País | 3 | () => !!state.challenge_id |
| `multi_ai` | 05 Despacho Multi-IA | 4 | () => state.solution_approved |
| `pautado` | 06 Pautado Oficial | 4 | () => state.solution_approved && isPautadoComplete() |
| `budget` | 07 Presupuesto de Marcha | 4 | () => state.solution_approved && isBudgetValid() |
| `resources` | 08 Bóveda de Recursos | 4 | () => state.solution_approved |
| `canvas` | 09 Modelo Canvas | 4 | () => state.solution_approved |
| `script` | 10 Guion del Video | 5 | () => isPautadoWritten() && isBudgetValid() |
| `webdemo` | 11 Prototipo para Video | 5 | () => isPautadoWritten() && isBudgetValid() |
| `timeline` | 12 Cierre | 1 | () => !!state.rally_type |

## Skills

| Skill | Lineas | Produce/usa | Scripts | Extras |
|---|---|---|---|---|
| `auditar-entregable` | 123 | Revisa un entregable contra la rúbrica del certamen, las bases del evento y el propósito del grupo, y devuelve | — | — |
| `contexto-rally` | 113 | Carga el contexto del proyecto antes de trabajar. Lee brief.json, el índice del corpus y el estado vivo de la  | — | — |
| `control-tiempo-entrega` | 77 | Controla el cronómetro del certamen, avisa estado horario, congela entregables al 75% del tiempo y valida el c | — | — |
| `dossier-soluciones` | 75 | Convierte los retos del comité o del usuario en un dossier formal de 3 páginas por reto (PDF, Word, Excel) con | `gen_dossier.py`, `soluciones_motor.py` | — |
| `guiar-usuario` | 82 | Lleva al usuario por las 13 etapas del workbench, detecta qué falta en cada una y lo pregunta de a una. Úsala  | — | — |
| `guion-storyboard` | 227 | Escribe el guion PAS-V y el plan de tomas como un solo entregable de rodaje (script/teleprompter.html) con dos | `build_shotlist.py`, `rally_service.py`, `a11y_plantilla.py`, `dibujar_storyboard.py`, `exportar_pdf.py`, `servir_rodaje.py` | fuentes.css, gen_teleprompter.py, plantilla_teleprompter.html |
| `ingestar-investigacion` | 107 | Procesa un PDF, DOCX o MD que trae el usuario desde fuera (por ejemplo una investigación hecha en z.ai), extra | `herramientas.py`, `ingest_challenges.py` | — |
| `modelo-3d-blender` | 115 | Genera modelos o renders 3D con Blender para el video, con ficha técnica previa justificada por la rúbrica y s | `blender_addons.py`, `build_shotlist.py`, `gpu_lock.py`, `herramientas.py`, `pre_render_check.py` | anexos-3d.md |
| `orquestador` | 389 | Orquesta agentes especialistas con contratos por archivo y guardia de recursos. La fase base son dos roles (di | `build_shotlist.py`, `gen_script.py`, `gen_storyboard_visual.py`, `gpu_lock.py`, `heavy_guard.py`, `herramientas.py`, `orchestrate.py`, `render_contadores.py`, `verificar_fases.py`, `remix_audio.py` | — |
| `presupuesto` | 127 | Arma el presupuesto del prototipo con filas justificadas, precios creíbles y enlace de respaldo, en la moneda  | — | — |
| `proponer-retos` | 119 | Genera soluciones aplicables para los retos que da el usuario, con precedentes ganadores y razonamiento proble | `check_anti_generico.py`, `dossier_desde_motor.py`, `gen_dossier.py`, `soluciones_motor.py` | — |
| `propuesta-identidad` | 116 | Convierte el nombre, logo o una idea del equipo en propuestas de identidad visual (paleta, tipografías, tokens | `gen_palette.py`, `verificar_identidad.py` | — |
| `publicar-sitio` | 154 | Construye y publica la web demo del proyecto en GitHub Pages o Netlify. Úsala cuando el usuario quiere que su  | `gen_site.py`, `probar_responsive.py`, `publish_site.py` | — |
| `servir-a-ventana` | 90 | Entrega una propuesta a la interfaz para que el usuario la acepte o la descarte. Arma el sobre, elige pestaña  | `content_store.py`, `servir_propuesta.py` | — |
| `sharktank` | 162 | Úsala cuando el equipo tenga una idea de proyecto (reto + solución) y pida ver sus fallas, riesgos o puntos dé | `gen_sharktank_pdf.py`, `servir_propuesta.py` | — |
| `sugerir-por-fase` | 94 | Da sugerencias cortas y accionables para una etapa concreta del flujo (certamen, equipo, retos, solución, impa | — | — |

## Modulos del dashboard

| Modulo | Que es | Frontera |
|---|---|---|
| `dashboard/app.js` | maquina de estado + 14 pestanas + renderers | MOTOR: no se edita por contenido |
| `dashboard/content_bridge.js` | acepta propuestas del buzon (Aceptar/Descartar) | puente contenido->ventana |
| `dashboard/section_sync.js` | sincroniza secciones entre miembros del equipo | colaboracion |
| `dashboard/super_agents.js` | 6 super agentes de revision por pestana | auditoria inline |
| `dashboard/super_agents_rubrics.js` | rubricas que usan esos agentes | datos de auditoria |
| `dashboard/challenge_parser.js` | parsea retos pegados por el usuario | entrada de retos |
| `dashboard/stats.html/.js` | panel de estadisticas del corpus SIRLI | vitrina |
| `dashboard/graph.html` | grafo de conocimiento navegable | vitrina |
| `dashboard/dossier_preview.html` | previsualiza el dossier antes de exportar | vitrina |
| `dashboard/join.html/.js` | union de miembros por invitacion | multijugador |
| `dashboard/admin.html/.js` | administracion del proyecto | multijugador |
| `dashboard/presence.js` | quien esta en linea y en que pestana | multijugador |

## Entregables

| Entregable | Sirve para | Lo produce | Donde se sirve |
|---|---|---|---|
| `brief.json` | estado unico del proyecto | scripts/init_brief.py, crear_proyecto.py | tabs certamen/team/challenges |
| `pautado (5 secciones)` | texto oficial del comite | scripts/gen_pautado.py | tab pautado -> servir_propuesta.py |
| `budget/budget.json + xlsx` | prefactibilidad economica | scripts/gen_budget.py, validate_budget.py | tab budget |
| `budget/bom.csv` | piezas y dimensiones para modelar | skills/presupuesto + modeler | skills/modelo-3d-blender |
| `docs/canvas.md` | modelo de negocio | scripts/gen_canvas.py | tab canvas |
| `script/script.md` | guion PAS-V 4 actos <=120 s | scripts/gen_script.py | tab script |
| `shots/*.yaml -> script/shotlist.csv` | contrato de tomas | scripts/build_shotlist.py | skills/guion-storyboard |
| `docs/storyboard_visual.html` | tablero de rodaje | scripts/gen_storyboard_visual.py | generado desde el CSV |
| `assets/voice/narration.mp4` | locucion <=120 s | scripts/gen_voice.py | etapa voz |
| `video final` | YouTube con URL en brief.json | editor + arsenal.py check-duracion | tab timeline |
| `site/ publicado` | web demo | scripts/publish_site.py | tab webdemo |
| `dossier (PDF/Word/Excel)` | soluciones sustentadas | scripts/gen_dossier.py | skills/dossier-soluciones |
| `knowledge/INDICE.md` | mapa del corpus | scripts/gen_indice.py | documento |

## Scripts

| Script | Lineas | Que hace | Critico |
|---|---|---|---|
| `blender_addons.py` | 110 | blender_addons.py -- Instala el addon de Blender segun el tipo de proyecto. |  |
| `build_report_pdf.py` | 160 | Construye docs/INFORME_INVESTIGACION.pdf con la identidad del proyecto. |  |
| `build_shotlist.py` | 187 | build_shotlist.py -- Compila los contratos de tomas en la shotlist del video. | si |
| `build_stats.py` | 886 | Generate dashboard/data/stats.generated.js from the current project. |  |
| `check_anti_generico.py` | 700 | check_anti_generico.py |  |
| `comun.py` | 178 | Base compartida del sistema: una sola fuente para lo que estaba copiado. |  |
| `content_store.py` | 222 | Almacén de propuestas de contenido y espejo del estado del usuario. |  |
| `crear_proyecto.py` | 69 | Crea el proyecto local, su admin y la primera invitación. |  |
| `dossier_desde_motor.py` | 301 | Convierte la salida del motor de soluciones en las fichas que maqueta gen_dossier.py. |  |
| `gen_analisis_pdf.py` | 436 | Genera el PDF de investigacion de ganadores con la identidad del proyecto. |  |
| `gen_bibliography.py` | 85 | gen_bibliography.py -- Genera docs/bibliography.md en formato APA 7 a partir de |  |
| `gen_budget.py` | 244 | gen_budget.py -- Genera budget/budget.xlsx con formato formal a partir de budget/budget.json. | si |
| `gen_canvas.py` | 166 | gen_canvas.py -- Genera docs/canvas.md a partir de brief.json y budget/budget.json. |  |
| `gen_challenges_doc.py` | 245 | gen_challenges_doc.py -- Genera el documento Word editable oficial de deliberación del equipo: |  |
| `gen_dossier.py` | 937 | Genera el dossier de soluciones en PDF, Word y Excel a partir de un JSON. |  |
| `gen_indice.py` | 436 | Genera `knowledge/INDICE.md`: el mapa del corpus para el agente (b). |  |
| `gen_mapa_nicaragua.py` | 108 | Genera la silueta de Nicaragua (path SVG) para el modulo design/. |  |
| `gen_ods_data.py` | 80 | Genera design/ods_data.js desde el catalogo ODS del dashboard. |  |
| `gen_pagina_diseno.py` | 267 | Genera la página online de un proyecto de Rally Design. |  |
| `gen_palette.py` | 293 | gen_palette.py -- Deriva la identidad cromatica del proyecto desde el reto. |  |
| `gen_pautado.py` | 210 | gen_pautado.py -- Genera docs/pautado_draft.docx a partir de brief.json, claims.json | si |
| `gen_presets_json.py` | 50 | Genera design/presets.json a partir de design/presets.js (fuente de verdad). |  |
| `gen_readme.py` | 143 | gen_readme.py -- Genera y actualiza dinamicamente el README.md maestro del proyecto. |  |
| `gen_readme_cerebro.py` | 345 | Genera `assets/readme/cerebro.png` desde los datos reales del repositorio. |  |
| `gen_recursos.py` | 120 | Inventario de recursos que el chat puede mostrar: `assets/recursos.json`. |  |
| `gen_report_figures.py` | 574 | Genera las figuras del informe de investigacion. |  |
| `gen_script.py` | 573 | gen_script.py -- Genera script/script.md, script/shotlist.csv y script/narration.txt | si |
| `gen_sharktank_pdf.py` | 236 | Genera el PDF de salud de la idea (skill sharktank). |  |
| `gen_site.py` | 373 | Genera site/index.html a partir del brief y de la identidad aprobada. |  |
| `gen_storyboard_visual.py` | 606 | Genera el tablero visual de rodaje (hoja de contactos + una fila por toma). |  |
| `gen_voice.py` | 323 | gen_voice.py -- Sintetizador de voz adaptativo para el video pitch (<= 120s). | si |
| `generate_master_pdf.py` | 640 | — |  |
| `gpu_lock.py` | 497 | gpu_lock.py -- Guardia de recursos (gpu / cpu / ram) para procesos pesados. |  |
| `heavy_guard.py` | 83 | heavy_guard.py -- Bloquea llamadas DIRECTAS a binarios pesados. |  |
| `herramientas.py` | 137 | herramientas.py -- Caja de herramientas externa bajo demanda. |  |
| `ingest_challenges.py` | 197 | ingest_challenges.py -- Ingesta de desafíos desde múltiples formatos: |  |
| `init_brief.py` | 114 | init_brief.py — Entrevista interactiva para poblar brief.json |  |
| `member_store.py` | 582 | Miembros, invitaciones y sesiones de un proyecto local. |  |
| `moneda.py` | 120 | moneda.py -- Resuelve la moneda del presupuesto segun el certamen. |  |
| `nube_store.py` | 260 | Sincronizacion de archivos del rally entre host local y la isla (Fase 2.1). |  |
| `orchestrate.py` | 185 | orchestrate.py -- Tablero de solo lectura del equipo de especialistas. |  |
| `pre_render_check.py` | 73 | pre_render_check.py -- Bloquea el render si las dependencias de una toma no |  |
| `probar_responsive.py` | 94 | Prueba de responsive del sitio del proyecto. |  |
| `publicar_avance.py` | 163 | Publica un avance de agente en la bitacora viva de Rally Studio. |  |
| `publicar_seccion.py` | 181 | Escribe una sección directamente en el servidor de Rally Studio. |  |
| `publish_site.py` | 43 | publish_site.py -- Script de publicacion y despliegue para la web demo en Netlify CLI o GitHub Pages. |  |
| `rally_clock.py` | 70 | rally_clock.py -- Cronometro regresivo inteligente y avisos criticos para competencias de 24h/28h. |  |
| `rally_service.py` | 4046 | rally_service.py -- Backend HTTP ligero y autónomo para Rally Studio & Workbench. |  |
| `registro_produccion.py` | 145 | registro_produccion.py -- bitacora de los trabajos pesados. |  |
| `render_contadores.py` | 180 | render_contadores.py -- Graba plantillas/contadores/index.html como MP4 del Acto IV. |  |
| `render_watch.py` | 65 | render_watch.py -- Monitor de recursos (RAM y GPU) en tiempo real. |  |
| `score_challenges.py` | 167 | score_challenges.py -- Motor analitico de clasificacion y probabilidad de victoria para desafios. |  |
| `scrape_ganadores_sirli.py` | 321 | Extractor del banco de ganadores de SIRLI (sirli.org). |  |
| `section_store.py` | 451 | Almacen de secciones versionadas para Rally Studio. |  |
| `servir_propuesta.py` | 145 | Deja una propuesta de contenido en el buzón de Rally Studio. | si |
| `sincronizar_nube.py` | 427 | sincronizar_nube.py -- Puente entre los archivos del rally (local) y la isla. |  |
| `sirli_analisis.py` | 160 | Analisis del corpus de videos ganadores SIRLI. |  |
| `sirli_asr.py` | 418 | Transcribe en local los videos que YouTube no expone con subtitulos. |  |
| `sirli_cierre.py` | 42 | Orquesta el cierre del pipeline y apaga la maquina al terminar. |  |
| `sirli_dataset.py` | 248 | Construye el dataset de modelado: una fila por video con sus caracteristicas. |  |
| `sirli_excel.py` | 302 | Arma el Excel del banco de ganadores SIRLI. |  |
| `sirli_figuras.py` | 301 | Genera las figuras 1-8 del plan de investigacion a partir del dataset. |  |
| `sirli_final2.py` | 219 | Cierra la fase grande: espera al ASR, saca fotogramas y regenera todo el libro. |  |
| `sirli_finalizar.py` | 107 | Espera a que terminen metadatos y transcripciones, arma el Excel, limpia y apaga. |  |
| `sirli_hipotesis.py` | 288 | Calcula la evidencia de las hipotesis de la investigacion y escribe hipotesis.md. |  |
| `sirli_libro.py` | 69 | Ensambla el libro completo a partir de las partes en `scripts/libro/`. |  |
| `sirli_meta.py` | 207 | Descarga metadatos de los videos del banco SIRLI sin usar la API de reproductor. |  |
| `sirli_modelo.py` | 134 | Linea base del modelo: predecir primer lugar con variables de evento y de video. |  |
| `sirli_modelo_solucion.py` | 285 | Modelo de tipo de solución SIRLI. |  |
| `sirli_pares.py` | 46 | Genera la lista de contrapartes emparejadas para la familia D. |  |
| `sirli_probabilidad.py` | 270 | Probabilidad absoluta de ganar: qué se puede identificar y qué no. |  |
| `sirli_probe_intl.py` | 124 | Sonda lenta de los 58 videos internacionales. |  |
| `sirli_queue_frames2.py` | 66 | Prepara la cola de fotogramas para los videos que aún no tienen hoja de contacto. |  |
| `sirli_resumen_ejecutivo.py` | 165 | Resumen ejecutivo de una página y tabla de hipótesis en CSV. |  |
| `sirli_sistemico.py` | 1219 | Investigación profunda SIRLI: biblioteca de hipótesis + análisis sistémico. |  |
| `sirli_thumbs.py` | 55 | Baja la miniatura de cada video ganador a research/sirli/meta/thumbs/. |  |
| `sirli_videos.py` | 452 | Pipeline de video del banco de ganadores SIRLI. |  |
| `sirli_visual_resumen.py` | 53 | Consolida las descripciones visuales de research/sirli/visual/*.json. |  |
| `sirli_visual_stats.py` | 208 | Mide color, brillo, saturacion, densidad de bordes y caras en miniaturas y fotogramas. |  |
| `soluciones_motor.py` | 653 | Motor de soluciones para retos del Rally. |  |
| `store_base.py` | 31 | Base comun de los almacenes SQLite del proyecto. |  |
| `sync_skills.py` | 44 | Sincroniza la carpeta madre skills/ hacia .agents/skills/ y .opencode/skills/. |  |
| `validate_brief.py` | 94 | validate_brief.py -- Falla con SystemExit si brief.json esta incompleto. | si |
| `validate_budget.py` | 119 | validate_budget.py -- Valida budget/budget.json contra las reglas de rally: | si |
| `validate_pautado.py` | 100 | validate_pautado.py -- Valida y cuenta caracteres (con espacios) por seccion en docs/pautado_draft.docx. | si |
| `verificar_fases.py` | 453 | verificar_fases.py -- Compuerta de orden y dependencia entre las 13 etapas. |  |
| `verificar_identidad.py` | 177 | verificar_identidad.py -- Compuerta G1 del plan. |  |
| `watch_stats.py` | 219 | Watch the live rally state and generate the recap automatically. |  |

## Herramientas de analisis (`tools/`)

No son motor: son inspectores de solo lectura que se corren a mano.

| Archivo | Uso |
|---|---|
| `tools/a11y_plantilla.py` | Pone aria-label en cada boton y aria-hidden en cada icono de la plantilla. |
| `tools/auditar_repeticiones.py` | Busca repeticiones y fallas estructurales en el repositorio. |
| `tools/dibujar_storyboard.py` | dibujar_storyboard.py -- compone las referencias visuales del storyboard demo. |
| `tools/embeber_fuentes.py` | Genera la hoja @font-face con las fuentes de la marca incrustadas en base64. |
| `tools/exportar_pdf.py` | Exporta el plan de rodaje a PDF sin abrir el navegador a mano. |
| `tools/make_audio_assets.py` | Genera la banda sonora y los SFX del video (100% sintesis DSP, sin samples de terceros). |
| `tools/mapa_sistema.py` | mapa_sistema.py -- Inventario verificable de Rally Studio. |
| `tools/parse_detect.py` | — |
| `tools/publicar_entregables.py` | Publica los entregables dentro de la unica raiz que sirve el workbench. |
| `tools/remix_audio.py` | Mezclador de audio del video: cues por acto + ducking contra la voz + SFX. |
| `tools/servir_rodaje.py` | Sirve el plan de rodaje en la red local para abrirlo desde el telefono. |
| `tools/unificar_comun.py` | Extrae las secciones repetidas de skills/*/SKILL.md a skills/_comun/ y deja un puntero. |

## Cruces automaticos

- Scripts sin skill que los cite: **63** (build_report_pdf.py, build_stats.py, comun.py, crear_proyecto.py, gen_analisis_pdf.py, gen_bibliography.py, gen_budget.py, gen_canvas.py, gen_challenges_doc.py, gen_indice.py, gen_mapa_nicaragua.py, gen_ods_data.py…)
- Skills sin ningun script: auditar-entregable, contexto-rally, control-tiempo-entrega, guiar-usuario, presupuesto, sugerir-por-fase
- Boilerplate repetido por skill:
  - Cómo sugerir un título o nombre de proyecto o producto: en 8 de 16 skills
  - Cómo enseñar visualmente: en 8 de 16 skills
  - Cómo redactar guiones cuidando la pronunciación: en 8 de 16 skills
  - Cómo crear modelos 3D: en 8 de 16 skills
  - Cómo sugerir elementos gráficos: en 8 de 16 skills


## 1. Como se encadena hoy (una sola ruta)

```
brief.json
   |  (00 certamen, 01 equipo, 02 retos del comite)
   v
research/challenges.json  --(proponer-retos / soluciones_motor)-->  solucion aprobada
   |                                                                     |
   |  (03 taller, 04 impacto, 05 despacho)                               |
   v                                                                     v
research/claims.json  --(investigacion)-->  pautado (06)  --->  budget (07)  --->  canvas (09)
   |                                              |                  |
   |                                              +------------------+--> script/script.md (10)
   |                                                                     |
   |         shots/*.yaml --build_shotlist--> shotlist.csv + movimiento.json
   |                                                  |
   |                                 gen_teleprompter --> script/teleprompter.html  (rodaje)
   v                                                                     v
 assets 3D (modelo-3d-blender) ---> renders -----> video 120 s (11, 12) ---> YouTube
```

El eslabon que estaba roto —**guion -> shots -> shotlist -> tablero**— ya es uno solo:
`script/script.md` y `script/shotlist.csv` siguen mandando, `script/movimiento.json` añade el
movimiento por toma y `gen_teleprompter.py` los junta en `script/teleprompter.html`, que se usa
en el rodaje desde el telefono. `docs/storyboard_visual.html` queda como hoja imprimible, no
como paso obligatorio.

### 1.1 De donde sale cada cosa (corpus -> consumidores)

La investigacion profunda no alimenta una sola pestana: es la base de datos que nutre seis
consumidores distintos. Si se rompe `research/claims.json`, se caen todos a la vez.

| Fuente | Consumidor | Como llega |
|---|---|---|
| `research/claims.json` | pautado (06), guion, dossier, presupuesto | cifra citada con URL y año; `validate_pautado.py` e `arsenal.py check-coherencia` la vigilan |
| `knowledge/winners_database.json` + `winners_latam.md` | propuesta-identidad, proponer-retos, guion | nombre, patron de pitch y color ganador por año/equipo |
| `knowledge/retos_razonamiento.json` | soluciones_motor -> dossier-soluciones | cadena problema-causa-insight-solucion-metrica y precedente |
| `knowledge/rubric_matrices.md` §3 §4 | guion-storyboard, pautado, storyboard | fracciones 17/33/29/21 y limites de caracteres (una sola fuente) |
| `knowledge/voice_notes.md` | guion, gen_voice | WPM, pausas, modo de decir |
| `research/sirli/winners.jsonl` | propuesta-identidad, contexto-rally | patrones de nombre (inventado, objeto, compuesto, territorio, sufijo, juego) |
| `assets/` (audio, covers, gif) | storyboard -> teleprompter | pista de audio por acto y portada real, no cards genericas |

Regla: un dato entra a la ventana solo si existe en una de estas fuentes. Lo que no esta,
se pregunta, no se inventa.

## 2. Que se puede unir (ordenado por ahorro real)

### 2.1 Guion + storyboard -> un entregable vivo (prioridad 1) — HECHO
Hoy: `script/script.md` (texto), `script/shotlist.csv` (contrato), `docs/storyboard_visual.html`
(hoja de contactos) y la pestana `script` del dashboard. Cuatro vistas del mismo objeto.

Fusion propuesta: **`script/teleprompter.html`**, generado por
`skills/guion-storyboard/gen_teleprompter.py`, con dos modos en la misma pagina:
direccion de tomas (que se ve, que se oye, como entra y sale, con la referencia visual de
cada toma) y rodaje (teleprompter en el telefono que avanza con la voz del que lee y graba
a 4K). El guion y el CSV siguen siendo la fuente de verdad; el HTML es la vista de rodaje.
Ver `skills/guion-storyboard/SKILL.md`.

Estado: construido. `gen_teleprompter.py` + `plantilla_teleprompter.html` generan el HTML,
`script/movimiento.json` declara el movimiento por toma. Las antiguas `guion-pas-v` y
`storyboard` quedaron consolidadas en `guion-storyboard` y ya no existen como carpetas.
La regla de movimiento (fija > 2.5 s = tiempo muerto) y el ritmo (240-270
palabras, 135 ppm) se auditan en la consola del generador: son decisiones del especialista,
no campos que el equipo ajuste.

Salida en papel: `tools/exportar_pdf.py` imprime el mismo HTML a `script/guion_rodaje.pdf`
(guion en cuadritos a la izquierda, referencia a la derecha, audio y corte en letra minima
debajo del cuadro) para quien graba con la camara nativa del telefono. Como se transcribe,
donde queda el clip y donde se logra la mejor calidad: `docs/RODAJE.md`.

### 2.2 Boilerplate de skills -> un solo bloque compartido (prioridad 2) — HECHO
Cinco secciones se repetian en casi todos los SKILL.md: sugerir nombre, ensenar
visualmente, redactar guiones, crear 3D, elementos graficos.

Estado: `tools/unificar_comun.py` agrupa las secciones por texto normalizado, elige la
variante dominante, la escribe en `skills/_comun/{nombres,ensenanza-visual,guiones,
modelos-3d,elementos-graficos}.md` y deja un puntero de dos lineas en cada skill. Solo
sustituye variantes que son subconjunto del canonico: si una skill tiene una version mas
rica (el procedimiento 3D real de `modelo-3d-blender`, la ensenanza visual de
`auditar-entregable`) se queda donde esta. Resultado medido: 49 punteros, 13,4 KB -> 1,6 KB
en secciones repetidas, `skills/*.md` paso de 242 KB a 233 KB sin perder ni una regla.
Idempotente (`--forzar` para regenerar los canonicos).

### 2.3 Dos skills de soluciones -> una con dos salidas (prioridad 3) — NO EJECUTADO
`proponer-retos` y `dossier-soluciones` comparten compuerta de nueve campos, cadena
problema-causa-insight-solucion-metrica y el mismo generador de PDF. `proponer-retos`
deberia ser el paso 1 (ficha en chat) y `dossier-soluciones` el paso 2 (PDF/Word/Excel),
declarado dentro del mismo skill como seccion "salida larga".
No se ejecuto a proposito: son 199 + 611 lineas y el motor de soluciones
(`scripts/soluciones_motor.py`) importa ambas por nombre; fusionar sin pruebas del motor
rompe el flujo que hoy funciona. Queda como propuesta con dueño.
No fusionar `sharktank`: es lente de riesgo, no de produccion.

### 2.4 Duplicacion de skills en tres carpetas (prioridad 2, mecanica) — HECHO
`skills/` es la fuente; `.opencode/skills/` y `.agents/skills/` son copias.
Estado: `python scripts/sync_skills.py` corrido -> 18 skills en las tres carpetas
(antes `.agents/skills` tenia 3 de 17). Correrlo despues de cualquier cambio en `skills/`.

### 2.5 Tabs que no tienen dueño de contenido — DECLARADO
`stats`, `graph`, `dossier_preview`, `join`, `admin` no aparecen en ninguna skill: son
vitrinas y multijugador. No falta skill; quedan declaradas "fuera del flujo" para que
nadie las busque en el guion.

## 3. Que depende de que (para no romper al fusionar)

| Si cambia... | Se rompe | Mitigacion |
|---|---|---|
| columnas de `script/shotlist.csv` | `build_shotlist.py`, tablero, teleprompter | el teleprompter lee por nombre de columna y tolera faltantes |
| orden de actos o fracciones 17/33/29/21 | guion, storyboard, teleprompter, auditoria | una sola constante en `rubric_matrices.md` §3 |
| `NAV_TABS` (ids) | `content_bridge.js` (slots por tab), `servir_propuesta.py` | no renombrar ids; el teleprompter se enlaza como archivo, no como tab |
| `state.script.actoN` | tab script, super_agents, teleprompter (modo vivo) | el teleprompter acepta `--acts` desde el estado o desde el markdown |
| `budget/bom.csv` cabecera `dim_*_mm` | todas las tomas `modeler` | congelar cabecera |

## 4. Regla de movimiento del video (lo que el usuario reclama)

Una imagen fija mas de ~2,5 s es tiempo muerto. El sistema no lo medía: `shotlist.csv` no
tenia campo de movimiento y el tablero no lo mostraba. El entregable unificado agrega
`script/movimiento.json` (sidecar, no toca el motor) con
`{ "<shot_id>": {"tipo": "...", "detalle": "..."} }`, tipos admitidos:
`camara` (paneo, dolly, seguimiento, handheld), `objeto` (el mecanismo se mueve),
`motion2d` (graficos animados, contadores, barras), `persona` (accion real),
`transicion` (match cut, whip pan, J-cut), `3d` (orbit, explosionada, corte animado).
El generador audita toda toma sin movimiento o con `duration_s > 2.5` y tipo estatico, y
cuenta el porcentaje de metraje en movimiento: `movimiento=89.4%`, `violaciones_estaticas=1`.
Es una regla de autoria, no un indicador de pantalla: el equipo no lo ve ni lo ajusta.

Cada toma ademas necesita un **cuadro de referencia** visible: el generador busca `ref` en el
`shotlist.csv` o en `movimiento.json`, y si no, `script/refs/<ID>.jpg|png|webp`. La imagen se
incrusta como data URI a 760 px, de modo que el entregable sigue siendo un solo archivo que
abre sin red en el telefono. Sin referencia, la tarjeta muestra un marco `crear` y el
generador lo lista en avisos. Para el tablero demo, `tools/dibujar_storyboard.py` reencuadra
el arte que ya existe en `assets/covers/` y dibuja encima las flechas de movimiento: seis
cuadros 16:9 en `script/refs/demo/`, numerados por paso.

## 5. Ley de interfaz minima (aplicada al entregable de rodaje)

Regla del usuario: nada de parrafos, nada de datos tecnicos en pantalla, icono antes que
palabra. Queda escrita en `.agents/rules/ui-minima.md` y aplicada en
`skills/guion-storyboard/plantilla_teleprompter.html`:

- cabecera: nombre + dos botones con icono y una palabra (Tomas, Rodar);
- tomas: reparto de los 4 actos y dos cifras (palabras, duracion); tablero visual, un cuadro
  16:9 por toma (numero de paso, duracion) con id, timecode, descripcion y detalle plegable
  (movimiento, audio, corte, rubrica, dueno);
- rodar: teleprompter con HUD de dos datos (toma en curso y siguiente) y controles solo con
  icono; el texto avanza con la voz del que lee.

Paleta: la de la app (`brand/tokens.css`, fondo blanco y texto `#111`), no un tema oscuro
propio. Unica excepcion justificada: el panel de rodaje `.tel` es negro porque esa pantalla
queda frente a la cara del actor y no debe iluminar la escena. Iconos con `title` +
`aria-label` (11 botones) y SVG con `aria-hidden` (28), verificados por
`tools/a11y_plantilla.py`.

Pantallas pendientes de pasar por la misma ley, en orden de trafico: `dashboard` (tabs
pautado y presupuesto muestran ayudas largas), `stats.html`, `graph.html`, `admin.html`,
`join.html`, `dossier_preview.html`. Criterio de aceptacion en la propia regla: contar
parrafos, debe dar cero.
