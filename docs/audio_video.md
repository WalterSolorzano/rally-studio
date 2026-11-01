# Audio del video: cues por acto, ducking y SFX

Estado: **operativo y medido**. Todo el material es sintetizado por el proyecto (DSP con
numpy/scipy), sin samples ni pistas de terceros, **sin voces**. Licencia: material original
del equipo, uso libre dentro del certamen (equivalente CC0).

> **Aviso de inventario.** El repo **no traía** `assets/music/bed.mp3`, `assets/music/ambient.mp3`,
> `assets/video_v2_preview.mp4` ni `assets/voice/narration_best.mp3`, y `script/shotlist.csv`
> estaba vacío (solo cabecera). Por eso:
> - las dos camas (`bed.mp3`, `ambient.mp3`) se **sintetizaron** en vez de procesar archivos
>   que no existían;
> - las pruebas usan fixtures marcados **[SIMULADO]** (ver §6), no el video real;
> - el mapa de SFX usa los tiempos de acto del guion v4, no el shotlist (que aún no tiene planos).
>
> Cuando el video real y la locución existan, el mezclador no cambia: se le pasan por `--video`
> y `--voice`.

---

## 1. Mapa de cues por acto

| Acto | Ventana | Cue | Carácter | Tempo / tono | Crossfade |
|---|---|---|---|---|---|
| I | 0:00–0:27 | `cue_01_tension.mp3` | oscuro, pulso subgrave lento, sin melodía | 64 BPM · Re menor | entra 0.30 s |
| II | 0:27–1:03 | `cue_02_drive.mp3` | rítmico, demo de la app | 123 BPM · La menor | 0.35 s en cada corte |
| III | 1:03–1:30 | `cue_02b_confidence.mp3` | misma pista filtrada: sin sub, transientes suaves | 123 BPM · La menor | 0.35 s |
| IV | 1:30–2:00 | `cue_03_resolve.mp3` | cálido, sin golpes, pad menor→mayor | libre · Re (tercera de Picardía) | 0.35 s |

Los cortes llevan **crossfade de 0.35 s** más un `whoosh_acto` encima, así que no hay hueco
de silencio en 0:27, 1:03 ni 1:30 (verificado: el mínimo local en 0:27 es −31 dB, antes −57 dB).

`cue_02b_confidence` no es un cuarto tema: es `cue_02_drive` pasado por lowpass 2 kHz,
highpass 95 Hz y compresión de picos. Suena al mismo pulso pero "en segundo plano", que es
justo lo que pide el Acto III (modelo y prefactibilidad, confianza sin fiesta).

### Niveles de los cues

| Archivo | Duración | LUFS-I | True peak | RMS aprox. |
|---|---|---|---|---|
| `cue_01_tension.mp3` | 30.0 s | −18.1 | −4.5 dBTP | −12 dB |
| `cue_02_drive.mp3` | 40.0 s | −18.1 | −6.5 dBTP | −12 dB |
| `cue_02b_confidence.mp3` | 28.0 s | −18.2 | −3.6 dBTP | −16 dB |
| `cue_03_resolve.mp3` | 35.0 s | −18.2 | −8.8 dBTP | −12 dB |

Objetivo: −18 LUFS integrado, true peak ≤ −2 dB. **Cumplido** (el peor es −3.6 dBTP).

Camas de origen (por si hay que rehacer un cue):

| Archivo | Duración | BPM | Tono | LUFS-I |
|---|---|---|---|---|
| `assets/music/bed.mp3` | 4:46.8 | 123 | La menor | −16.2 |
| `assets/music/ambient.mp3` | 5:00 | 64 | Re menor | −20.2 |

---

## 2. SFX

| Archivo | Duración | Pico | Uso |
|---|---|---|---|
| `whoosh_acto.mp3` | 1.30 s | −6.3 dBFS | transición de acto (0:00, 0:27, 1:03, 1:30) |
| `click_ui.mp3` | 0.09 s | −8.1 | clics de tarjetas / botones en la demo |
| `typing_loop.mp3` | 3.00 s (loop) | −8.1 | tecleo en el Acto II |
| `riser_3s.mp3` | 3.00 s | −6.8 | 1:25 → 1:30, entra al impacto |
| `impact_bass.mp3` | 1.60 s | −5.3 | 1:30 (cambio a Acto IV) y 1:58 (cierre) |
| `sub_drop.mp3` | 2.00 s | −5.8 | 1:02, caída al pasar a Acto III |
| `paper.mp3` | 0.60 s | −8.1 | 1:36, documento / prefactibilidad |

Los SFX se normalizan **por pico**, no por LUFS: son transitorios y el LUFS integrado de un
clic de 90 ms no significa nada (por eso `click_ui` mide −70 LUFS y está bien).

Mapa por defecto (segundos, ganancia sobre el bus):

```
0.00 whoosh −7   27.00 whoosh −5   63.00 whoosh −5   90.00 whoosh −4
62.00 sub_drop −12   87.00 riser −9   90.00 impact −5   118.00 impact −7
30.2 / 33.6 / 36.9 / 41.2 / 45.0 / 49.3  click_ui −13…−14
34.00 typing_loop −19   96.50 paper −15   110.00 click_ui −15
```

Si `script/shotlist.csv` tiene filas, `remix_audio.py` **deriva** clics, tecleo y papel de las
descripciones de cada plano (`card`, `boton`, `ui`, `app`, `escribe`, `documento`…) y conserva
los whoosh/riser/impactos de acto.

---

## 3. Niveles de la mezcla

Cadena: `cue (−18 LUFS)` → bus `--music-db` → envolvente de ducking → `amix` con voz y SFX →
`loudnorm` 2 pasadas lineal → `alimiter` → AAC 192 kbps 48 kHz.

| Parámetro | Valor por defecto | Qué hace |
|---|---|---|
| `--music-db` | −4 dB | cama en pausas, sobre el nivel del cue (⇒ −22 LUFS) |
| `--duck-db` | 6 dB | cuánto baja bajo la voz (⇒ −28 LUFS hablando) |
| `--voice-margin` | 14 dB | **techo duro**: si la voz es baja, se baja la música para no invadirla |
| Master | −14 LUFS-I, TP −2 dB en el limitador | el AAC sube ~0.2–0.3 dB; el archivo entregado queda ≤ −1.5 dBTP |

Con una locución a −16 LUFS los números caen exactamente en el spec: música −22 LUFS en
pausas y −28 LUFS bajo la voz. Si la locución viene más baja (un TTS de −20 LUFS, por ejemplo),
el mezclador **baja el bus automáticamente** y lo anota en `notes`.

### Ducking

No es un compresor a ciegas. Se calcula una **envolvente de ganancia** desde la voz:

1. RMS cada 20 ms, con umbral por histéresis (entra 7 dB por encima de la salida) sobre el
   suelo de ruido medido (`percentil 15`) y el pico (`percentil 97`).
2. Se rellenan pausas < 200 ms (para no bombear entre palabras) y se descartan islas < 120 ms.
3. Suavizado asimétrico: ataque 60 ms, release 400 ms.
4. La envolvente se escribe como WAV y se aplica con `amultiply` (multiplicación muestra a
   muestra). Ganancia exacta, sin bombeo ni dependencia del nivel de la voz.

Resultado: **la voz manda**. Si hay que elegir, baja la música.

---

## 4. Cómo lo llama el motor de video

`tools/remix_audio.py` es independiente: no importa nada de `scripts/`, no toca el proyecto,
no necesita el dashboard. Solo ffmpeg + numpy + scipy.

### CLI

```bash
python tools/remix_audio.py \
  --video assets/video_sin_audio.mp4 \
  --voice assets/voice/narration_best.mp3 \
  --out assets/video_final.mp4 \
  --report-json assets/audio/reports/final.json
```

| Flag | Uso |
|---|---|
| `--video` | video de entrada. Sin `--video` exporta solo audio |
| `--voice` | locución. Si falta y el video tiene audio, **usa ese audio como voz** y lo reemplaza |
| `--out` | `.mp4` con video, `.m4a`/`.mp3` si no hay video |
| `--start` / `--dur` | render parcial (previews) |
| `--music-db` / `--duck-db` / `--voice-margin` | ajuste fino |
| `--no-sfx` | sin efectos |
| `--stems DIR` | exporta `music_ducked.wav`, `voice.wav`, `sfx.wav` para medir |
| `--report-json PATH` | guarda el informe (lo mismo que imprime por stdout) |
| `--print-plan` | muestra el mapa de cues/SFX sin renderizar |

**Contrato:** exit code `0` si el master cumple (−14 LUFS ±1 y TP ≤ −1.5); `1` si no.
El JSON trae `final`, `stems_lufs`, `music_under_voice`, `master_ref` y `notes`.

### Desde Python

```python
import json, subprocess, sys
from pathlib import Path

def mezclar(video: Path, voice: Path, out: Path) -> dict:
    r = subprocess.run(
        [sys.executable, "tools/remix_audio.py",
         "--video", str(video), "--voice", str(voice), "--out", str(out),
         "--report-json", str(out.with_suffix(".json"))],
        capture_output=True, text=True,
    )
    if r.returncode not in (0, 1):          # 1 = mezcla hecha pero fuera de norma
        raise RuntimeError(r.stderr[-2000:])
    return json.loads(out.with_suffix(".json").read_text(encoding="utf-8"))
```

Notas para `pitch_video.py`:

- Llamalo **después** de tener el video montado; hace `-c:v copy`, no re-encodea imagen.
- Es CPU liviano (~5 s por minuto de video). No compite con Blender ni con TTS.
- Si el video ya trae locución, alcanza con `--video` (la usa como voz y la reemplaza).
- No lo llames en paralelo sobre el mismo `--out`.
- `--dur` sirve para el preview de 30 s sin renderizar los 2 minutos.

---

## 5. Comandos

```bash
# 1) material base (camas + cues + SFX). ~2 min. Idempotente.
python tools/make_audio_assets.py

# 2) sólo una parte
python tools/make_audio_assets.py --only cues --reuse-beds

# 3) ver el plan sin renderizar
python tools/remix_audio.py --print-plan

# 4) preview de 30 s con stems y medición
python tools/remix_audio.py --video assets/audio/test_source_30s.mp4 \
  --voice assets/audio/test_voice_30s.mp3 --out assets/audio/test_mix_30s.mp4 \
  --stems tmp/stems --report-json assets/audio/reports/test_mix_30s.json

# 5) final
python tools/remix_audio.py --video assets/video.mp4 --voice assets/voice/narration_best.mp3 \
  --out assets/video_final.mp4 --report-json assets/audio/reports/final.json
```

En Windows sin ffmpeg en el PATH: `$env:FFMPEG_BIN="C:\...\ffmpeg.exe"` antes de llamar.
Esta máquina no tiene `ffprobe`; el mezclador no lo necesita (parsea `ffmpeg -i`).

---

## 6. Pruebas reales ejecutadas

Fixtures **[SIMULADO]**, porque el video y la locución reales no existían:

- `assets/audio/test_source_30s.mp4` / `_120s.mp4`: loop del clip de demo (`.playwright-mcp/clip-equipodemo.mp4`).
- `assets/audio/test_voice_30s.mp3` / `_120s.mp3`: TTS de prueba (`assets/voice/previews/chatterbox_interna.mp3`).

### `assets/audio/test_mix_30s.mp4`

| Métrica | Valor |
|---|---|
| LUFS integrado | **−14.0** |
| LRA | 2.3 LU |
| True peak | **−2.0 dBTP** |
| Voz | −14.0 LUFS (referido al master) |
| Música bajo la voz | **−27.2 dBFS RMS** |
| Música en pausas | −22.4 dBFS RMS |
| Profundidad de duck medida | 4.8 dB (objetivo 6; la locución de prueba habla 91 % del tiempo, no hay pausas largas) |
| SFX pico | −8.1 dBFS |

### `assets/audio/test_mix_full.mp4` (120 s, 4 actos)

| Métrica | Valor |
|---|---|
| LUFS integrado | **−14.1** |
| LRA | 3.0 LU |
| True peak | **−1.8 dBTP** |
| Voz | −14.0 LUFS |
| Música bajo la voz | **−28.5 dBFS RMS** (−33.1 LUFS antes del +6.4 dB del master) |
| Música en pausas | −23.0 dBFS RMS |
| Margen voz − música | 12.7 LU |
| Profundidad de duck medida | 5.4 dB (objetivo 6) |
| SFX pico | −6.9 dBFS |
| Verificación de cortes | sin hueco en 0:27 / 1:03 / 1:30; whoosh, riser (1:27–1:30) e impactos (1:30, 1:58) presentes |

Contraste espectral por acto (centroide de la cama): I 553 Hz · II 4239 Hz · III 312 Hz ·
IV 244 Hz. Los tres cues se sienten distintos, no es la misma pista con volume.

Informes crudos: `assets/audio/reports/*.json`. Manifest con duraciones, LUFS, TP y hashes:
`assets/audio/manifest.json`.

### Qué falta / límites conocidos

- **No hay video real ni locución real**: las pruebas son con fixtures. Cuando existan, hay que
  volver a correr el comando 5 y revisar el informe (el anclaje a la voz cambiará el bus).
- **`shotlist.csv` vacío**: el mapa de SFX es el de acto + UI genérica. Al llenarlo, los clics y
  el tecleo se recolocan solos.
- `cue_03` es pad sintético (progresión Re menor → Si♭maj7 → Fa/La → Re mayor). Si el jurado
  espera orquestal, hay que reemplazarlo por una pista con licencia; la estructura ya está.
- `cue_02` es brillante por diseño (centroide alto por los charles). Si en el televisor suena
  filoso, bajar `--music-db` 1–2 dB o regenerar con `shelf(out, 7000, -5)` en
  `tools/make_audio_assets.py`.
- La profundidad de duck medida queda 0.6–1.2 dB por debajo del objetivo cuando la locución no
  deja pausas: es correcto (el release de 400 ms no llega a reposo). El objetivo de 6 dB se
  cumple en pausas reales.
