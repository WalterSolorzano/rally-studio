---
name: guion-storyboard
description: Escribe el guion PAS-V y el plan de tomas como un solo entregable de rodaje (script/teleprompter.html) con dos modos, Tomas y Rodar. Úsala cuando haya que escribir o revisar el guion del video, decidir qué se ve en cada segundo, comprobar si el texto entra en 120 s, exigir movimiento en cada toma, o preparar el teléfono para grabar con teleprompter. Reemplaza a guion-pas-v y storyboard.
---

# Guion y storyboard: un solo entregable

Un archivo. Tres modos. Nada se escribe dos veces.

```
reto → causa → insight → mecanismo → prueba
                                   ↓
                     script/script.md  (texto por acto)
                     script/movimiento.json (qué se mueve en cada toma)
                                   ↓
                     shots/*.yaml → scripts/build_shotlist.py → script/shotlist.csv
                                   ↓
                     script/teleprompter.html   ← el entregable
```

`shotlist.csv` lo compila el motor (`scripts/build_shotlist.py`); esta skill **no lo reescribe**.

## Regla de oro del video: movimiento o muerte

Una imagen fija más de **2.5 s** es tiempo muerto. Toda toma declara cómo se mueve:

| tipo | qué se mueve |
|---|---|
| `camara` | paneo, dolly, seguimiento, handheld |
| `objeto` | el mecanismo, el material, la mano |
| `motion2d` | gráficos, contadores, barras, mapas animados |
| `persona` | acción real, no posado |
| `transicion` | match cut, whip pan, J-cut |
| `3d` | orbit, explosión, corte animado del modelo |
| `estatico` | solo si dura menos de 2.5 s |

Meta: **≥ 90 % del metraje en movimiento**. El generador audita esa meta en consola (no en
la pantalla) y nombra cada toma que la rompe: `Tomas fijas de más de 2.5 s: S06`. Una toma
estática solo se acepta si dura menos de 2.5 s y existe como respiro deliberado.

## Cómo se produce

```bash
# 1. esqueleto del sidecar de movimiento (solo la primera vez)
python skills/guion-storyboard/gen_teleprompter.py --seed-mov

# 2. escribir el texto en script/script.md por actos (tabla A1..A4 o prosa "## Acto I")

# 3. compilar tomas desde shots/*.yaml (motor)
python scripts/build_shotlist.py

# 4. completar script/movimiento.json: {"S01": {"tipo": "persona", "detalle": "..."}}

# 5. generar el entregable
python skills/guion-storyboard/gen_teleprompter.py
```

Salida: `script/teleprompter.html`, autocontenido, sin red, sin dependencias.

Flags: `--script --csv --mov --refs --brief --out --wpm --demo --seed-mov`.
El ritmo de lectura **no es un control**: lo fija el especialista en 135 ppm (`--wpm` es solo
para pruebas). El usuario no calibra el ritmo, lo lee.
`--demo` usa tomas de ejemplo y sella la página con `DEMO`: sirve para revisar la interfaz,
nunca para entregar.

## La hoja en papel (para quien graba sin la interfaz)

```bash
python tools/exportar_pdf.py      # script/teleprompter.html -> script/guion_rodaje.pdf
```

El mismo HTML trae el bloque `#papel` y la hoja `@media print`; el botón de impresora de la
cabecera hace lo mismo sin consola. La hoja va en dos columnas: **el guion en cuadritos
pequeños a la izquierda**, cada frase en el cuadro donde se dice; **la referencia a la
derecha**, y debajo, en la letra más pequeña, solo el nombre del audio y del corte
(`S03 · 8 s · Pulso 90 bpm · Corte al movimiento`). Nada de tablas de metadatos: el que
graba lee el texto y mira el cuadro.

Cuándo se usa: teléfono con la cámara nativa (4K, 60 fps, archivo `S03.mp4`), gente sin
computadora, o cuando se quiere leer en papel en vez de en pantalla.

La hoja no muestra cifras: solo el sello `DEMO · NO ENTREGABLE` cuando los datos vienen de
`--demo`. Contar palabras y segundos es trabajo de quien produce, no del que graba, y vive
únicamente en la consola del generador.

## La medición: tres relojes, no uno

Por acto hay tres duraciones distintas y confundirlas produce números falsos:

| reloj | de dónde sale |
|---|---|
| voz | palabras del acto ÷ 135 ppm |
| metraje | suma de `duration_s` de las tomas de ese acto |
| objetivo | fracción de rúbrica del acto (17/33/29/21 de 120 s) |

El veredicto compara **voz contra metraje** —es lo que comparten el que habla y el que graba—
y el objetivo de rúbrica se informa al lado, sin juzgar. Antes el juicio se hacía contra el
objetivo e ignoraba el metraje real: un acto con 18 s de texto sobre 10 s de imagen decía
"faltan 2 s". Ahora dice "sobran 8 s" y la consola enseña las tres columnas:

```
acto  voz(s)  metraje(s)  objetivo(s)  juicio
I       18.2        10.0         20.4  La voz no cabe: 18.2 s de voz en 10.0 s de metraje (sobran 8.2 s)
TOTAL voz=66.2s metraje=30.2s objetivo=120s  Corto: 149 palabras (minimo 240).
```

## Referencias visuales (el storyboard se ve)

Cada toma necesita un cuadro de referencia. El generador lo busca así:

1. columna `ref` del `shotlist.csv` (ruta relativa a la raíz), o `"ref"` en `movimiento.json`;
2. `script/refs/<ID>.jpg|png|webp` (y `script/refs/demo/` en modo demo).

La imagen se incrusta como data URI a 760 px de ancho: el HTML sigue siendo un solo archivo
que abre sin red en el teléfono. Sin referencia, la tarjeta muestra un marco punteado `crear`
y el generador lo lista en los avisos.

Para el tablero demo las referencias se componen desde el arte que ya existe en el repo:

```bash
python tools/dibujar_storyboard.py    # reencuadra el arte y dibuja las flechas de movimiento
```

Cada cuadro sale 16:9 con el número de paso, la duración y la flecha de lo que se mueve.

Quién produce cada referencia (no se pide al azar):

| tipo de toma | referencia | dueño |
|---|---|---|
| `persona`, `objeto`, `camara` | foto real del sitio o del producto | investigador / grafista2d |
| `3d` | render del modelo desde Blender | modeler |
| `motion2d` | fotograma del gráfico en su punto medio | grafista2d |
| `transicion` | los dos fotogramas que se empalman | director |

Nombre obligatorio: `script/refs/<ID>.jpg` (`S01.jpg`). Sin cuadro no hay storyboard: la toma
queda en `crear` y el generador la denuncia.

## Los cuatro actos (rúbrica Latam, §3)

| acto | función | % | ventana |
|---|---|---|---|
| I | el dolor concreto | 17 % | 0:00–0:20.4 |
| II | el mecanismo (la caja negra) | 33 % | 0:20.4–1:00 |
| III | prefactibilidad: cuesta, funciona | 29 % | 1:00–1:34.8 |
| IV | cierre y replicabilidad | 21 % | 1:34.8–2:00 |

240–270 palabras totales. El nombre del proyecto no aparece en los primeros 20 s.
En Acto III como máximo tres cifras de dinero; nunca TIR ni VAN.

## Qué muestra cada modo

- **Tomas** — tablero visual: un cuadro 16:9 por toma con su número de paso y duración; debajo id,
  timecode y descripción; el detalle plegable guarda audio, corte, ítem de rúbrica, dueño y la
  dirección de cámara. Tocar el cuadro lo abre a pantalla completa. Se filtra por acto.
  Arriba: reparto de los 4 actos y dos cifras (palabras, duración). Nada más: lo que el equipo
  ve son las tomas, no métricas internas.
- **Rodar** — teleprompter: texto del acto que avanza con la voz (micrófono, palabra por palabra)
  o con el tiempo si no hay micro; frase actual resaltada, HUD con la toma en curso y la
  siguiente, barra de progreso, `wake lock`, tamaño de letra, pantalla completa y grabación con
  la cámara trasera a 4K si el teléfono lo permite (webm, 12 Mbps).

El movimiento y la duración son **reglas del especialista**: se auditan en la salida de consola
del generador (`movimiento=89.4%`, `violaciones_estaticas=1`, `Tomas fijas de más de 2.5 s: S06`)
y en `docs/MAPA_SISTEMA.md` §4. No se muestran como KPI ni como semáforo: el equipo no calibra
nada, solo rueda.

Atajos en Rodar: `espacio` rodar/pausa, `↑` `↓` ±2 s, `R` grabar.

## Contrato del sidecar `script/movimiento.json`

```json
{
  "_tipos": { "camara": "...", "objeto": "..." },
  "S01": { "tipo": "persona", "detalle": "respira y mira a cámara, mano trabajando" },
  "S03": { "tipo": "3d", "detalle": "orbit de 90 grados con corte visible" }
}
```

Sin entrada para una toma, la toma cuenta como estática y se marca como error.

## Grabación desde la página: qué hace cada pieza

| pieza | cómo | dato |
|---|---|---|
| cámara | `getUserMedia` trasera, 3840×2160, 60 fps ideales | el navegador entrega lo que la cámara permita |
| códec y caudal | VP9 > VP8; 24 Mbps si llega 4K, 12 Mbps si 1080 | se decide con `getSettings().height` |
| cuenta atrás | 3 s antes del primer frame, se cancela tocando | evita el arranque de manos y dudas |
| clip | `MediaRecorder` → descarga local `toma_<S0x>_<fecha>.webm` | no se sube a ningún servidor |
| micrófono | `SpeechRecognition` del navegador, alineación palabra a palabra | en Chrome/Edge el audio se transcribe en servidores del proveedor: requiere red |
| sin micrófono | el texto avanza por tiempo como teleprompter normal | nunca se bloquea la lectura |

Detalle completo, límites y recetas de calidad: `docs/RODAJE.md`.

## App en el teléfono (se actualiza desde la PC, gratis)

El entregable es **un solo archivo**. `gen_teleprompter.py` incrusta fuentes, referencias,
icono y manifest en base64: `script/teleprompter.html` se copia al teléfono (USB, Drive,
Telegram) y se abre con Chrome. Cero servidor, cero red, cero cuenta.

Medido: abierto como `file://` en una carpeta vacía → `isSecureContext: true`, 0 peticiones
externas, `getUserMedia`/`MediaRecorder`/`SpeechRecognition` presentes, 0 errores.

`python tools/servir_rodaje.py` queda solo como último recurso (misma wifi): ahí
`isSecureContext` es `false` y no hay `serviceWorker`, porque HTTP en una IP no es origen
seguro. Un APK propio se puede hacer gratis, pero Android pide confirmar cada instalación
(`INSTALL_PACKAGES` es permiso de sistema). Tabla completa: `docs/APP_MOVIL.md`.

## Interfaz

Cero párrafos, cero rutas o nombres de archivo en pantalla, icono antes que palabra, número
solo si acciona una decisión. Ver `.agents/rules/ui-minima.md`. La plantilla vive aparte en
`skills/guion-storyboard/plantilla_teleprompter.html`: se edita ahí, sin tocar el generador.

Paleta: la misma de la app (`brand/tokens.css`), fondo blanco y texto `#111`, para que la
página no se sienta de otro producto. La única superficie oscura es el panel de rodaje
(`.tel`), y es a propósito: esa pantalla queda frente a la cara del actor, no debe iluminar
la escena ni encandilar a quien lee. Ningún otro bloque usa negro.

Iconos con `title` y `aria-label`; SVG decorativos con `aria-hidden`. Lo verifica
`python tools/a11y_plantilla.py`.

## Límites

- No escribe en `dashboard/`, no toca `scripts/rally_service.py`, no recalcula rúbricas.
- No reescribe `script/shotlist.csv`: solo lo lee.
- No inventa cifras: costos salen de `budget/budget.json`, estadísticas de `research/claims.json`.
- Si `brief.json` no tiene proyecto, la página lo dice con un chip; no rellena con ejemplos.
