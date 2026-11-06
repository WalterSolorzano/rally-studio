# Videos sin audio — catálogo no mapeable para análisis de solución

## Fuente
`research/sirli/datos/videos_sin_audio.tsv` (generado del pipeline ASR sobre `research/sirli/transcripts/` y `research/sirli/meta/videos.jsonl`).

## Corrección de clasificación (06/11/2026)
Se auditó cada video del TSV contra `meta/videos.jsonl` (campo `has_captions` de YouTube) y contra la existencia de `transcripts/<video_id>.json`.

Resultado:
- **Verdaderamente sin audio/captions** (`has_captions=false|null`): **182** videos. Permanecen en `videos_sin_audio.tsv`.
- **Falsos positivos corregidos** (`has_captions=true` pero sin transcript local): **425** videos. Movidos a `research/sirli/datos/captions_pendientes.tsv` (motivo `captions_disponibles_no_descargadas`). El video existe y tiene subtítulos en YouTube; solo falta descargarlos. Ejemplo: `rPtgPdNEodI` (AXIOMA, 119 s, 27 vistas, `has_captions=true`) fue desmarcado erróneamente como "this video is not available".
- Sin archivo de transcript local: 564 de 607 (los 425 pendientes + 137 de los 182 sin captions).

## Archivos de datos
- `videos_sin_audio.tsv` / `.json`: 182 videos realmente sin captions.
- `captions_pendientes.tsv` / `.json`: 425 videos con captions disponibles pero no descargadas (pendientes de reprocesar con ASR).

## Uso en el grafo
Referencia cruzada con `8. Los videos: catálogo y lectura caso por caso` y `ganadores_analisis.md` (sección "Videos sin audio (no mapeables para análisis de solución)"). Sirve para descartar falsos positivos al contar casos ganadores.

## Verdaderos sin audio por año
2017: 12 · 2018: 1 · 2019: 6 · 2020: 5 · 2021: 12 · 2022: 31 · 2023: 41 · 2024: 37 · 2025: 28 · 2026: 9

## Captions pendientes por año
2020: 15 · 2021: 35 · 2022: 44 · 2023: 63 · 2024: 87 · 2025: 69 · 2026: 112
