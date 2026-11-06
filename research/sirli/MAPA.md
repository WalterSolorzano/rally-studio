# Mapa del proyecto SIRLI — de lo planteado a lo entregado

Documento de cierre. Recorre **todas las etapas que se planearon al inicio** (ver
`analisis/plan_investigacion.md`), qué se ejecutó de cada una, con qué artefacto y en qué
estado quedó. Cifras verificadas el 06/11/2026 contra los archivos del repositorio.

Pregunta rectora: *¿qué distingue a un video premiado del SIRLI 2017–2026, y cuánto vale de
verdad un video en términos de probabilidad de ganar?*

---

## 1. Etapas del pipeline

| # | Etapa planeada | Script | Artefacto | Estado |
|---|---|---|---|---|
| 0 | Plan de investigación | `analisis/plan_investigacion.md` | plan de 10 secciones | hecho |
| 1 | Scraping del banco de ganadores | `scripts/scrape_ganadores_sirli.py` | `winners.jsonl`, `winners.csv`, `raw/*.gz` (31), `manifest.json` | hecho |
| 2 | Índice de videos | `scripts/sirli_videos.py queue` | `video_index.json`, `video_queue*.jsonl` | hecho |
| 3 | Metadatos de YouTube | `scripts/sirli_meta.py` | `meta/videos.jsonl` (4.709) | hecho |
| 4 | Miniaturas | `scripts/sirli_thumbs.py` | `meta/thumbs/*.jpg` (4.196) | hecho |
| 5 | Subtítulos de YouTube | `sirli_videos.py subs` | `transcripts/*.json` (parcial) | hecho |
| 6 | Hojas de fotogramas 3×2 | `sirli_videos.py frames` | `frames/*.jpg` (112) | hecho, tope por videos caídos |
| 7 | Voz a texto (ASR local) | `scripts/sirli_asr.py` | `transcripts/*.json`, `analisis/audio.csv` | hecho |
| 8 | Pares 2.º/3.º para comparar guiones | `scripts/sirli_pares.py` | `video_queue_pares.txt` | hecho |
| 9 | Dataset de features | `scripts/sirli_dataset.py` | `dataset_videos.csv` 5.117 × 46 | hecho |
| 10 | Métricas visuales | `scripts/sirli_visual_stats.py` | `visual.csv` (4.196 filas), `resumen_visual.json` | hecho |
| 11 | Figuras descriptivas | `scripts/sirli_figuras.py` | `figuras/fig01…fig16` | hecho |
| 12 | Modelo de pronóstico | `scripts/sirli_modelo.py` | `modelo_baseline.json` | hecho |
| 13 | Probabilidad absoluta (censura del podio) | `scripts/sirli_probabilidad.py` | `probabilidad.json`, `fig16_probabilidad.png` | hecho |
| 14 | 42 hipótesis + informe profundo | `scripts/sirli_sistemico.py` | `sistemico.json`, `investigacion_profunda.md`, fig11–fig15 | hecho |
| 15 | One-pager ejecutivo | `scripts/sirli_resumen_ejecutivo.py` | `resumen_ejecutivo.md`, `hipotesis.csv` | hecho |
| 16 | Excel del banco | `scripts/sirli_excel.py` | `excel/ganadores_sirli.xlsx` (2,1 MB, 5 hojas) | hecho |
| 17 | Libro (md/docx/html) | `scripts/sirli_libro.py` + `scripts/libro/*` | `analisis/libro.md`, `.docx`, `.html`, `libro.css` | hecho |
| 18 | Orquestador de cierre | `scripts/sirli_final2.py` | `cierre2.json` | hecho |

Los pasos 6–7 y la fase de 300 fotogramas son los únicos con pérdida estructural: YouTube
devolvió los videos caídos (cuenta eliminada, privado, bloqueo de derechos).

---

## 2. Banco de datos (lo que se scrapeó)

| Métrica | Valor |
|---|---|
| Premios registrados | **5.136** |
| Años | 2017 – 2026 (10 ediciones) |
| Países | 14 |
| Premios de Nicaragua | 1.259 |
| Primeros lugares | 2.425 |
| Premios con video enlazado | 5.120 |
| Videos únicos | 4.709 |
| Premios con desafío identificado | 5.136 (100 %) |
| HTML original archivado | 31 archivos `.html.gz` |

Fuente: `https://sirli.org/ganadores/`, tres colecciones (`sede`, `nacional`,
`internacional`). El registro solo contiene **podio** (1.º, 2.º, 3.º): no hay perdedores, y
antes de 2021 casi solo hay primeros puestos. Toda tasa se calcula con 2021+ (`CORE`).

---

## 3. Cobertura del video y del texto

| Capa | Planeado | Obtenido | % |
|---|---|---|---|
| Metadatos | 4.709 | 4.688 → **4.709** | 100 % |
| Miniatura | 4.709 | 4.196 | 89,1 % |
| Hoja de fotogramas | ~600 en cola | 112 | tope por caídos |
| Transcripción con texto | ~1.250 estimadas | **906** (948 archivos) | 72 % del objetivo |
| Rasgos de audio | 1 por transcripción | 583 filas | — |
| Videos marcados caídos | — | 526 (`asr_dead.txt`) | irrecoverable |

El plan estimaba ~1.250 transcripciones «si se corre el punto 3». Se corrieron tres barridos
(intl, Nicaragua sede, todos los primeros lugares) con 4 procesos × 3 hilos; el techo real lo
puso YouTube, no la CPU. Cada video caído se intentó con 4 clientes de reproductor antes de
marcarlo; los 526 están documentados con su motivo en `asr_dead.txt`.

---

## 4. Hipótesis (sección 5 del plan)

42 creencias puestas a prueba con prueba formal y corrección por comparaciones múltiples.

| Grupo | n |
|---|---|
| A favor (evidencia sólida) | 3 |
| Señal débil (7 + 1 negativa) | 8 |
| Sin evidencia | 25 |
| No concluyente | 3 |
| Artefacto aritmético | 2 |
| Descriptiva | 1 |

Las tres que sobrevivieron:

1. **H01 — delegación.** Un equipo con más integrantes nombrados gana +19,3 pp.
2. **H30 — nombre del proyecto en la descripción.** +10,1 pp.
3. **H42 — videos ≤ 110 s.** Cuestan −6,0 pp (el «más corto es mejor» no se sostiene).

Hallazgos que contradijeron la intuición previa: el tamaño del desafío **no** afecta
(quintiles 39,9 / 39,5 / 43,7 / 41,1 / 40,8 %), y el uso de *testimonio* bajó a 0 % en los
guiones premiados recientes. El informe intermedio (`hipotesis.md`) quedó **supersedido** por
`investigacion_profunda.md`.

---

## 5. Probabilidad absoluta

`por_pais` y `sedes_nicaragua` en `probabilidad.json`; banda calculada por escenarios de
censura del podio (k = 3…30 grupos por sede), no por ajuste paramétrico (la binomial negativa
colapsó).

- Banda global de P(1.º): **41,5 % → 5,6 %** según tamaño del grupo.
- Entre premiados: **41,1 %**.
- Nicaragua (2021+): 483 grupos, 1.124 premios, techo 43,0 %, media 20,8 %, grande 12,1 %.
- Apéndice L del libro lista las **182 sedes de Nicaragua** con su banda.

Advertencia metodológica conservada en el libro: `sede_size` es el número de equipos
premiados de esa institución en esa edición, no el tamaño de la ciudad; el efecto 85,1 % → 33,4 %
es en buena parte un artefacto de 1/n.

---

## 6. Entregables

| Entregable | Archivo | Tamaño | Estado |
|---|---|---|---|
| Libro Markdown | `analisis/libro.md` | 191.867 B · 36.453 palabras · 34 capítulos · 76 tablas · 17 figuras | hecho |
| Libro Word | `analisis/libro.docx` | 1.225.645 B | **regenerado** 06/11 |
| Libro HTML autocontenido | `analisis/libro.html` | 2.096.697 B | **regenerado** 06/11 |
| Excel del banco | `excel/ganadores_sirli.xlsx` | 2.191.892 B | hecho |
| Informe profundo | `analisis/investigacion_profunda.md` | 29.323 B | hecho |
| Resumen ejecutivo | `analisis/resumen_ejecutivo.md` | 4.432 B | hecho |
| Dataset | `analisis/dataset_videos.csv` | 5.117 × 46 | hecho |
| Figuras | `analisis/figuras/fig01…fig16` | 16 PNG | hecho |

El libro cubre: historia, geografía, desafíos, método, biblioteca de hipótesis, análisis
sistémico, imagen, voz y guion, psicología del jurado, Nicaragua, internacional, año por año,
manual de pitch, qué compone a un ganador, probabilidad y límites; más apéndices A–L.

---

## 7. Defecto encontrado y corregido al cerrar

`scripts/sirli_final2.py` exportaba con `python -m pandoc`, módulo que no existe: la corrida
del 23/10 terminó `rc=1` y dejó el `.docx` y el `.html` viejos (13:53) frente a un
`libro.md` nuevo (19:23). Se añadió `corre_exe()` y el paso ahora invoca el binario
`pandoc` 3.6.3. Exportación verificada: `docx rc=0`, `html rc=0`.

---

## 8. Pendiente real

- 526 videos caídos: no recuperables sin cookies de una cuenta con acceso.
- 21 metadatos que YouTube bloqueó por *rate limit*: reintentables con enfriamiento.
- `visual/*.json` (descripción gráfica por video) no se generó; `visual.csv` sí trabaja sobre
  las 4.196 miniaturas y las 112 hojas, que es lo que usa el libro.
- Enriquecer texto de 2.º/3.º nicaragüenses para que la Familia D de hipótesis (guion
  comparado) deje de estar sesgada en contra.

---

## 9. Reproducción

```bash
python scripts/scrape_ganadores_sirli.py
python scripts/sirli_videos.py queue --since-year 2022 --sede-sample 8
python scripts/sirli_videos.py subs && python scripts/sirli_videos.py frames
python scripts/sirli_meta.py --workers 10 && python scripts/sirli_thumbs.py
python scripts/sirli_asr.py --scope todos --places 1 --model small --shard 0 --shards 4
python scripts/sirli_dataset.py && python scripts/sirli_visual_stats.py
python scripts/sirli_figuras.py && python scripts/sirli_modelo.py
python scripts/sirli_probabilidad.py && python scripts/sirli_sistemico.py
python scripts/sirli_resumen_ejecutivo.py && python scripts/sirli_excel.py
python scripts/sirli_libro.py && pandoc analisis/libro.md -o analisis/libro.docx --toc
```

Todo el pipeline cabe en `python scripts/sirli_final2.py --extra-asr` (no apaga la PC).
