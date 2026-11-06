# Informe de estado — Transcripciones primeros lugares NIC (06/11/2026)

## Resumen ejecutivo

Se completó la transcripción ASR de los 108 primeros lugares NIC pendientes de video vivo. Resultado: 45 transcritos con texto, 63 sin audio (video no disponible/privado/eliminado). Total de transcripciones en disco: 994 (954 → 994). Caché de videos muertos: 527 ids en `research/sirli/asr_dead.txt`.

## Métricas clave

| Métrica | Valor |
|---|---|
| Premios totales (winners.jsonl) | 5,136 |
| Videos únicos (videos.jsonl) | 4,709 |
| Países | 14 |
| Años | 2017–2026 |
| NIC premios | 1,259 |
| NIC videos únicos | 1,159 |
| Primeros lugares NIC | ~581 |
| Transcripciones en disco | 994 |
| Transcripciones con texto | ~907 |
| Transcripciones NIC | 633 |
| Videos muertos (asr_dead.txt) | 527 |
| Libros generados | libro.md, libro.docx, libro.html |
| Palabras del libro | ~36,453 |
| Capítulos del libro | 34 |
| Tablas del libro | 76 |
| Figuras del libro | 17 |
| Páginas aproximadas | ~128 |

## ASR ejecutado esta sesión

- 3 procesos en paralelo: `python scripts\sirli_asr.py --scope todos --video-file research/sirli/video_queue_nic_primeros_ids.txt --model small --shard i --shards 3 --cpu-threads 4` (i=0,1,2)
- s0: 15 transcritos, 21 sin audio (36 videos)
- s1: 16 transcritos, 20 sin audio (36 videos)
- s2: 14 transcritos, 22 sin audio (36 videos)
- Total: 45 transcritos, 63 sin audio de 108
- CPU promedio durante ejecución: 59%
- Rendimiento: ~6 videos/min agregado (4× vs 1 proceso)
- Logs: `research/sirli/asr_nic_primeros_s0..2.log`

## Cerebro actualizado

Nuevo archivo: `brain/corpus/transcripciones_primeros_lugares_nic.md`

Contiene 16 casos con reto+solución extraídos de transcripciones nuevas (2017–2021), incluyendo:
- GUEGÜEN'SQUAD "Saving Energy" (energía de actividades cotidianas, 2 kW)
- COMTRANSENERGY (energía de transporte público, 110V)
- 3RT (paneles de plásticos termoestales para construcción)
- DIACREATE/Accray (harina de jacinto de agua + gandul para rumiantes; bloque de construcción)
- TEAM WOLF (plataforma de mentorías contra deserción universitaria)
- NICBLUE "Autism Plus" (app para inclusión de personas con TEA, 5 funciones)
- RCC ENERGY (detector de conexiones clandestinas, $107/u, LoRa)
- GRANITO DE ARENA / DSAA (separador de aceite de fritura, materiales reciclables)
- THE FOUR E & J "No Más" (alerta de violencia intrafamiliar, interruptor + LED + QR)
- PRO-FUTURE NICARAGUA (identificador de CO2 en aulas, bamboo + Arduino + UV-C)
- ESNIC (sistema comunitario de agua pluvial, 17 m³, 6 familias, $1,500)
- GUERREROS DEL AGUA "Niambura" (filtración y purificación de agua de lluvia)
- LOS AGÜIZOTES (vivienda rural autosostenible: biodigestor, cosechador de agua, bicicleta-generador)
- RAYA KA LAYA (almacenamiento de agua de lluvia, 90 días, piletas de barro, sensores, paneles solares)
- TENMECI HEALTH "10MH" (sensor de CO2 + purificación con piedra volcánica sebolitas)
- TLÁLOC "Lock Pluff" (sistema de cosecha/potabilización/almacenamiento de agua, app móvil, 42 galones)

## Próximos pasos pendientes

1. Escribir informes de estado (este documento)
2. Verificar que skills usen la información recopilada (brain/corpus)
3. Extraer reto+solución de transcripciones para skill propuestas de solución (hecho parcialmente en este documento)
4. Subir a GitHub al final

## Archivos relevantes

- `brain/corpus/transcripciones_primeros_lugares_nic.md` — casos extraídos (nuevo)
- `brain/corpus/ganadores_db.md` — casos ganadores por fase (existente)
- `brain/corpus/ganadores_analisis.md` — análisis por edición (existente)
- `brain/corpus/ganadores_cruzados.md` — índice cruzado con dataset (existente)
- `script/guion_guia.md` — guía de guion 4 micro-actos (existente)
- `research/sirli/transcripts/*.json` — 994 transcripciones en disco
- `research/sirli/asr_dead.txt` — 527 videos muertos
- `research/sirli/cierre2.json` — pipeline terminado 2026-11-06T17:42:50
