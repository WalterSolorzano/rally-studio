# Base dura: una sola interfaz, una sola verdad, cero copias

Este documento fija la estructura. Lo que está aquí ya está medido o ya está hecho;
lo que falta está marcado como tal y no se ejecuta sin permiso.

## 1. La interfaz es una

`scripts/rally_service.py` sirve **solo** `dashboard/` (`rally_service.py:363-365`,
`directory=str(DASHBOARD_DIR)`). Eso no es un límite: es la regla. Todo lo que el equipo
usa durante el rally vive detrás de un solo puerto, `http://localhost:8000`.

| pantalla | cómo se llega | estado |
|---|---|---|
| `dashboard/index.html` (14 pestañas) | entrada `/` | producto |
| `dashboard/graph.html` | botón **Grafo** (topbar y barra móvil) | producto |
| `dashboard/stats.html` | botón **Resumen** (topbar y barra móvil) | producto; la puerta se agregó el 2026-11-16 |
| `dashboard/join.html` | enlace de invitación que arma `member_store.py` | producto |
| `dashboard/admin.html` | control de miembros | producto |

Seis pestañas en la barra móvil caben: medido con el CSS real a 360, 390 y 430 px
(58–65 px cada una, `desborda: false`).

Fuera de `dashboard/` no hay interfaz de producto. Hay **entregables**, que son archivos
sueltos porque se publican, se imprimen o se copian al teléfono:
`script/teleprompter.html` (autocontenido, 0 red) y `script/guion_rodaje.pdf`.
Y hay **material de trabajo**, que no se sirve: `dossier_latam_2026/` (proyecto de
referencia) y `graphify-out/` (el cerebro compilado).

## 2. Cómo se refresca sin que nadie apriete nada

La infraestructura ya existe; no hay que inventarla:

| pieza | cadencia | archivo |
|---|---|---|
| buzón de propuestas (Aceptar / Descartar) | **2 s** (`POLL_MS = 2000`) | `dashboard/content_bridge.js:14`, `:511` |
| presencia y cambios del estado | **4 s** (`TTL_MS = 4000`) | `dashboard/presence.js:17`, `:134-136` |

Traducción para la IA madre: **escribe, no empujes**. Cada subagente que termina deja su
resultado con `python scripts/servir_propuesta.py --tab <pestaña> --slot <ranura> …`, y la
ventana lo muestra como tarjeta de aceptación en menos de 2 segundos. No hay websockets,
no hay recarga, no hay que avisar a nadie. Si el humano acepta, el estado cambia y los
demás clientes lo ven en el siguiente latido.

Lo único que **no** entra por el buzón: las páginas de `dashboard/` (grafo, resumen). Para
esas, el refresco es al abrir; no se actualizan en vivo y no hace falta que lo hagan.

## 3. Una sola verdad por número

Antes de esta limpieza, el reparto de los cuatro actos estaba escrito a mano en varios
generadores y ya había derivado. Medido:

| archivo | qué decía | qué dice la rúbrica |
|---|---|---|
| `skills/storyboard/gen_storyboard_visual.py:29` | Acto I en rojo `#f81110` | el rojo se reserva para "grabando" |
| `scripts/gen_report_figures.py:208` | Acto III empieza en 60 s, IV en 95 s | 39.6 s y 74.4 s |

Arreglo: **`scripts/comun.py`**. No guarda los números: los **lee** de
`knowledge/rubric_matrices.md` §3, que es el documento que manda. Si la rúbrica cambia,
cambia todo lo que lo use.

```
$ python scripts/comun.py
actos    I=Dolor 17%  II=Caja negra 33%  III=Prefactibilidad 29%  IV=Cierre 21%
  I   Dolor           00:00 -> 00:20  (20.4 s)  #0d1b35
  II  Caja negra      00:20 -> 01:00  (39.6 s)  #0866f5
  III Prefactibilidad 01:00 -> 01:34  (34.8 s)  #0284c7
  IV  Cierre          01:34 -> 02:00  (25.2 s)  #94a3b8
```

Ya lo usan: `skills/guion-storyboard/gen_teleprompter.py`,
`skills/storyboard/gen_storyboard_visual.py`, `scripts/gen_report_figures.py`.
Regla desde hoy: **ningún script vuelve a escribir 0.17/0.33/0.29/0.21 ni un color de acto.**

Lo que sigue copiado, medido con `tools/auditar_repeticiones.py` (311 archivos de código):

| repetición | archivos | destino |
|---|---|---|
| shim de UTF-8 para consola | 20 | `comun.utf8()` |
| paleta local escrita a mano | 37 | tokens de `brand/` |
| fracciones de acto | 25 | `comun.ventanas()` → ya cubierto en los 3 generadores; quedan documentos |
| `main()` | 72 | correcto: es el punto de entrada de cada herramienta |

## 4. Qué se retiró

| ruta | peso | motivo |
|---|---|---|
| `plantillas/storyboard_ejemplo/` (61 archivos) | 15.28 MB | storyboard viejo de un proyecto ficticio; lo reemplaza `gen_teleprompter.py --demo` |
| `dossier_latam_2026/archivado_2026-11-05/dossier_latam_2026.html` | 105 kB | duplicado byte a byte (mismo MD5) |
| `dashboard/dossier_preview.html` | 5.8 kB | huérfano real: 0 referencias en todo el repo |

Dos planes sueltos en la raíz tampoco los lee nadie (`git grep` = 0), pero son el registro
de trabajo ya hecho, no basura: `.plan-ia-gratis.md` (integración IA gratuita, con su
evidencia) y `PLAN_README_PULIDO.md`. Se quedan hasta que decidas si van a `docs/planes/`.

Archivos idénticos que **se quedan** porque son espejos deliberados: `brain/corpus/*` copia
`knowledge/*` para que el cerebro se distribuya solo; `docs/MANUAL_MAESTRO_RALLY_INNOVACION_2026.md`
y su versión LATAM salen del mismo generador (`generate_master_pdf.py:590` copia el PDF).

## 5. Fallas de lógica encontradas y corregidas

| dónde | falla | arreglo |
|---|---|---|
| `skills/storyboard/gen_storyboard_visual.py:399` | `KeyError: 'owner'` y el tablero entero no se generaba si el CSV no traía la columna | `.get("owner") or "sin dueño"` |
| `skills/storyboard/gen_storyboard_visual.py:29` | Acto I de rojo | color de `comun.COLORES` |
| `scripts/gen_report_figures.py:208` | cortes de acto en 0/20/60/95 s | `comun.ventanas()` → 0/20.4/60.0/94.8 s |
| `scripts/watch_stats.py:81-128` | manda el aviso del resumen a `timeline`, y `content_bridge.js` no tenía rama para esa pestaña: el aviso se descartaba | rama `timeline` en `fusionar()`: guarda en `state.avisos` (máx. 5) y el botón dice «Abrir»; al aceptar abre `payload.url` |
| `dashboard/stats.html` | no había contadores de render, fallos ni correcciones, y el modelo no los registraba | `scripts/registro_produccion.py` + instrumentación de `gpu_lock.py run` → `logs/produccion.jsonl` → `build_stats.py` → bloque «La máquina también trabajó» |

## 6. Verificación de que no rompí nada

```
$ python skills/guion-storyboard/gen_teleprompter.py --demo --out tmp/teleprompter_demo.html
OK  tomas=6  palabras=149  metraje=30.2s  movimiento=89.4%
    acto  voz(s)  metraje(s)  objetivo(s)  juicio
    I       18.2        10.0         20.4  La voz no cabe: ...
    TOTAL voz=66.2s metraje=30.2s objetivo=120s  Corto: 149 palabras (minimo 240).

$ python skills/storyboard/gen_storyboard_visual.py --csv tmp/csv_prueba.csv --out tmp/sb_prueba.html
OK: tmp/sb_prueba.html · 6 tomas · 30.2 s · 6 items de rubrica
  <div class="act" style="--c:#0d1b35"><h2>Acto I · Dolor</h2><span>0:00.0 – 0:20.4 ...
  <div class="act" style="--c:#0866f5"><h2>Acto II · Caja negra</h2><span>0:20.4 – 1:00.0 ...

$ python scripts/gen_report_figures.py
figuras generadas en docs/figures     # fig05: <!-- 0.0–20.4 s --> <!-- 20.4–60.0 s --> <!-- 60.0–94.8 s --> <!-- 94.8–120.0 s -->

$ python -m pytest tests -q
60 failed, 249 passed
```

Los 60 fallos son **preexistentes** y de otro origen: pruebas de Node (`document` inexistente
en `vm`), límite de 8000 bytes en `SKILL.md` y `retos_razonamiento.json` en versión 2. El
conteo es idéntico al de antes de tocar nada, así que no hay regresión.

## 7. Lo que falta y necesita tu permiso

1. **`budget/budget.json` es idéntico byte a byte a `research/claims.json`.** El presupuesto
   nunca se llenó: alguien copió el archivo equivocado. No se puede arreglar sin los precios
   reales del equipo.
2. **`main` repetida en 72 scripts.** Cada script trae su propio `main()`; unificarlos toca
   la interfaz de la CLI de medio repositorio. Es el único trabajo de deduplicación que
   queda grande de verdad.
3. **`shim_utf8` en 20 scripts y `paleta_local` en 37.** Mismo patrón: la utilidad existe en
   `scripts/comun.py`, pero reemplazarla en 20–37 archivos de golpe es un cambio grande.

Hecho: los contadores de producción (§5), el aviso del resumen (§5), la puerta a
`stats.html` y la puerta a `dashboard/admin.html` («Accesos» en la barra superior y en el
modal de identidad, que es la que llega en móvil), y el tipo MIME de `manifest.webmanifest`.
