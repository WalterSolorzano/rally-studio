# Mapa de interfaces: qué es producto, qué es demo y qué no debería existir

Regla de este documento: **si una pantalla no cae en uno de los tres destinos, se archiva.**

| destino | quiere decir | viaja a GitHub |
|---|---|---|
| **producto** | lo usa el equipo durante el rally | sí |
| **entregable** | lo que se entrega o se publica fuera | sí (plantilla) / no (salida) |
| **demo y desarrollo** | sirve para probar el sistema | **no** |

La frontera real no es una opinión: es `git ls-files`. Lo que no está versionado no
llega al repositorio, y el `.gitignore` ya excluye `tmp/`, `.superpowers/`,
`.impeccable/`, `.opencode/skills/` y `.agents/skills/`.

Medición del 2026-11-16: **2110 archivos versionados, 112.5 MB**.

## 1. Producto (el workbench)

| archivo | kB | quien lo abre | dueño |
|---|---|---|---|
| `index.html` | 2.0 | entrada; redirige a `dashboard/` | producto |
| `dashboard/index.html` | 1.7 | shell del workbench (14 pestañas) | MOTOR |
| `dashboard/join.html` | 2.6 | `scripts/member_store.py` arma la invitación | producto |
| `dashboard/admin.html` | 4.8 | control de miembros e invitaciones | producto |
| `dashboard/graph.html` | 496.1 | `app.js` menú ⋮ → «Grafo de conocimiento» (cerebro del corpus, 642 nodos) | producto |
| `dashboard/chat.js` | 25.7 | botón flotante «Preguntar al proyecto» (panel lateral, no pestaña) | producto |
| `dashboard/stats.html` | 16.6 | **debrief de después del rally**: horas de sesión, entregables cerrados, pautado, preparación, equipo, hora pico, frentes abiertos, MVP, quién tomó qué, reparto y procedencia. La abre `scripts/watch_stats.py` y nadie la enlaza desde las pestañas | producto, le falta la puerta |
| `dashboard/dossier_preview.html` | 5.8 | **nadie dentro del workbench** | huérfana |

## 2. Entregables (se generan por proyecto, no se editan)

| archivo | quien lo produce | destino |
|---|---|---|
| `script/teleprompter.html` | `skills/guion-storyboard/gen_teleprompter.py` | un solo archivo, 0 red |
| `script/guion_rodaje.pdf` | `tools/exportar_pdf.py` | papel para grabar |
| `docs/storyboard_visual.html` | `scripts/gen_storyboard_visual.py` | hoja de contactos imprimible |
| `design/index.html`, `kit`, `thumb`, `impacto` | `scripts/gen_pagina_diseno.py` (+ `design/*.js`) | kit de prensa y portada del video |
| `site/index.html` | `scripts/publish_site.py` | web demo publicada |
| `docs/assets/informe_template.html` | `scripts/build_report_pdf.py` | plantilla del informe |
| `assets/covers/_render.html` | render de portada 16:9 | auxiliar |
| `research/sirli/analisis/libro.html` | análisis del corpus SIRLI | documento de investigación |

## 3. Demo y desarrollo (no van al repositorio)

| ruta | peso local | por qué sobra |
|---|---|---|
| `tmp/` | 6.9 GB | andamios de sesión: scrapes SIRLI, `pack_probe`, `pack_probe2`, demo del teleprompter |
| `.playwright-mcp/`, `.superpowers/`, `.impeccable/`, `audit/` | 35 MB | capturas y planes de agentes |
| `.opencode/skills/`, `.agents/skills/` | 1 MB | reflejo de `skills/` que crea `sync_skills.py` |

Ninguna de estas rutas entra en `git ls-files`. El problema no era que existieran:
era que **tres pantallas de demo estaban versionadas como si fueran producto**.

## 4. Lo que se retiró el 2026-11-16

| ruta | peso | motivo |
|---|---|---|
| `plantillas/storyboard_ejemplo/` (61 archivos) | 15.28 MB | el storyboard viejo: 14 tomas de un proyecto ficticio, con un PDF de 3.4 MB y 40 fotogramas de YouTube. Sustituido por `gen_teleprompter.py --demo`, que produce el mismo ejemplo sin guardar material ajeno |

`README.md` §Storyboard se actualizó: ya no ofrece el ejemplo borrado y apunta a
`gen_teleprompter.py` y a `tools/exportar_pdf.py`.

## 5. Rutas que parecían basura y no lo son

| ruta | peso | qué es en realidad |
|---|---|---|
| ~~`dossier_latam_2026/`~~ | — | **borrado**: dossier de un rally pasado (7.34 MB) que sesgaba al agente con soluciones inventadas. `tests/test_check_anti_generico.py` ya no lo exige; valida cualquier `dossier*/_skill_run/**/*.json` que exista |
| `graphify-out/` (20 archivos) | 0.93 MB | **el cerebro**: grafo de la investigación profunda (`brain/corpus/` compilado) que la IA consulta para saber cómo moverse. `graphify-out/graph.html` (403 kB) es su vista y no es el mismo build que `dashboard/graph.html` (188 kB). Se queda |
| `dashboard/stats.html` | 16.6 kB | **debrief de después del rally**: lo que se mira al cerrar, no durante. Que ninguna pestaña la enlace no es un descuido del archivo, es que falta el botón de entrada |

Único huérfano real que queda: `dashboard/dossier_preview.html` (5.8 kB), solo lo
mencionan documentos.

## 6. Lo que `stats.html` mide hoy y lo que le falta

Fuente: `dashboard/data/stats.generated.js`, calculado por `scripts/build_stats.py` a
partir de `state.json`; `scripts/watch_stats.py` lo recompila cuando cambia el estado.

| ya mide | de dónde sale |
|---|---|
| horas de sesión, entregables cerrados, pautado escrito, preparación | `state.json` |
| hora de máxima señal, señales por hora, pico del equipo | movimientos registrados |
| MVP operativo (frentes, señales, carga) | asignaciones |
| quién tomó qué, reparto de frentes, logros | roster y frentes |
| renders lanzados, minutos de máquina, rehaceres, fallos, esperas de GPU | `logs/produccion.jsonl` vía `registro_produccion.resumen()` |

| falta, y el usuario lo espera | por qué no sale |
|---|---|
| tiempo de render por pieza individual | la bitácora guarda el comando y sus segundos; falta agrupar por pieza (nombre de asset) |
| tiempo por persona fuera de frentes | solo se registran movimientos, no minutos de trabajo |

## 7. Huecos de producto que quedan

1. **`budget/budget.json` es una copia byte a byte de `research/claims.json`.** El
   presupuesto nunca se llenó; falta que el equipo aporte precios y enlaces.
2. **`main()` repetido en 72 scripts, `shim_utf8` en 20 y `paleta_local` en 37.** La
   utilidad compartida existe (`scripts/comun.py`), pero reemplazarla de golpe en decenas
   de archivos es un cambio grande, no una conexión pendiente.

Cerrado el 2026-11-16: la puerta a `stats.html` (botón «Resumen»), la puerta a
`dashboard/admin.html` («Accesos» en la barra superior y en el modal de identidad, que es
la que funciona en móvil), los contadores de producción del debrief (§6) y el tipo MIME de
`manifest.webmanifest` (`application/manifest+json`). Barrido de enlaces locales y de
handlers inline: cero referencias roas, cero handlers sin definición.

