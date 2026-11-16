# Rodaje: qué hace el sistema y dónde queda cada cosa

Documento de referencia para el que graba. La interfaz no muestra nada de esto
(ley de interfaz mínima: cero párrafos en pantalla).

## Qué genera el sistema

```
research/challenges.json      ─┐
research/claims.json          ─┼─> pautado (06) ─> script/script.md ─┐
budget/budget.json            ─┘                                     │
                                                                     v
                        shots/*.yaml ──build_shotlist.py──> script/shotlist.csv
                                                                     │
                                             script/movimiento.json ─┤
                                             script/refs/<ID>.jpg  ──┤
                                                                     v
                                          gen_teleprompter.py  ─>  script/teleprompter.html
                                                                     │
                                                     tools/exportar_pdf.py
                                                                     v
                                                     script/guion_rodaje.pdf
```

- **script/script.md**: el guion. Es la única fuente del texto que se lee.
- **script/shotlist.csv**: el plan de tomas (id, acto, duración, qué se ve, audio, corte).
- **script/movimiento.json**: el tipo de movimiento de cada toma y la referencia visual.
- **script/refs/**: los cuadros de referencia, `S01.jpg`, `S02.jpg`…
- **script/teleprompter.html**: el entregable interactivo (Tomas y Rodar).
- **script/guion_rodaje.pdf**: la misma ficha en papel, para quien graba con la
  cámara nativa del teléfono.

## Cómo se escribe lo que se lee

El panel de Rodar no inventa texto: pinta `script.md` partido por actos y por frases.
El reparto entre tomas es por tiempo (palabras acumuladas dentro del acto), así que
cada cuadrito de papel cae junto al cuadro que se ve mientras se dice.

## Cómo "escucha" el micrófono

- Usa `SpeechRecognition` / `webkitSpeechRecognition` del navegador. En Chrome y Edge
  ese motor manda el audio a los servidores del proveedor para transcribirlo: **no es
  local** y **necesita internet**. Firefox y Safari no lo traen.
- El texto reconocido se compara palabra por palabra con el guion
  (`norm` → sin acentos, `alinear` tolera ruido y saltos del reconocedor).
- El avance del texto no salta: persigue la palabra dicha con un paso continuo
  (`(wpm/60)*dt*2.2`), corrige hacia atrás si te adelantaste y cambia de acto solo.
- Nada de lo reconocido se guarda ni se envía a otro sitio: vive en memoria de la
  pestaña y muere al cerrarla.
- Si no hay permiso de micrófono o no hay motor, se avisa en una línea y el texto
  sigue avanzando por tiempo, como un teleprompter normal.

## Dónde se envía el video

- **A ningún lado.** `MediaRecorder` guarda el clip en memoria del navegador y al
  cortar lo descarga como archivo local: `toma_S03_2026-11-16T18-22-05.webm`.
- El nombre lleva la toma en curso para que el editor sepa a qué cuadro pertenece.
- No hay subida, ni cuenta, ni servidor. Si se pierde la pestaña, se pierde el clip:
  graba tomas cortas y descárgalas al terminar cada una.

## Dónde se logra la mejor calidad

| Decisión | Qué hacer | Por qué |
|---|---|---|
| Resolución | 3840×2160 pedidos; el navegador entrega lo que la cámara permita | el plan es 16:9 y 4K permite reencuadrar en edición |
| Cuadros | 60 fps ideales | el video tiene movimiento: 60 fps evita el barrido feo en paneos |
| Caudal | 24 Mbps si la cámara da 4K, 12 Mbps si da 1080 | el sistema lo elige solo con `getSettings().height` |
| Códec | VP9 > VP8 (se elige por `isTypeSupported`) | mejor compresión al mismo bitrate |
| Luz | ventana de frente, nunca contraluz | el sensor del teléfono sube ISO y aparece ruido |
| Audio | grabar cerca y sin viento; si el sonido importa, audio aparte | el micro del teléfono es el eslabón débil |
| Estabilidad | teléfono fijo o con apoyo | el movimiento debe ser intencional, no temblor |
| Toma | cuenta atrás de 3 s antes de grabar | evita el primer segundo de manos y dudas |

Límite real: WebM en el navegador no es el formato final. El editor convierte a
H.264/MP4 al montar; no se pierde calidad por grabar en WebM a 24 Mbps.

## Cuando no se quiere la interfaz

1. `python tools/exportar_pdf.py` (o el botón de impresora en la página).
2. Grabar con la app de cámara del teléfono, en 4K y 60 fps.
3. Nombrar el archivo con el id de la toma: `S03.mp4`.
4. Comparar contra el cuadro de referencia del PDF y la nota de audio y corte que va
   debajo de cada imagen.

## Reglas que el sistema audita solo (no se muestran)

- Metraje total ≤ 120 s.
- Palabras entre 240 y 270.
- ≥ 90 % del metraje con movimiento; ninguna toma fija de más de 2,5 s.
- Cada toma con tipo de movimiento y referencia visual.

Se ven en la salida de `gen_teleprompter.py` y en `docs/MAPA_SISTEMA.md` §4.
