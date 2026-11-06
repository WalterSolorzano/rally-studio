# Analisis de patrones de buenas soluciones (SIRLI)

Fuente: `research/sirli/analisis/modelo_solucion.json` (949 videos con transcripcion real)
unido a `research/sirli/analisis/dataset_videos.csv` (5,117 filas).

Este archivo contiene **analisis de patrones**, no proyectos hardcodeados.
No se deben copiar proyectos de años anteriores como plantilla. Se deben extraer
los patrones de lo que funciona y aplicarlos al reto actual.

## 1. Tipos de solucion que mas ganan (sede NIC, n=620)

| Tipo de solucion | n | gana | won_rate |
|---|---|---|---|
| dispositivo_fisico | 224 | 121 | 54.0% |
| sistema_digital | 84 | 42 | 50.0% |
| otro_no_clasificado | 39 | 20 | 51.3% |
| proceso_servicio | 53 | 24 | 45.3% |
| material_producto | 172 | 71 | 41.3% |
| infraestructura | 48 | 18 | 37.5% |

**Patron:** en sede NIC, dispositivos fisicos y sistemas digitales tienen la mayor tasa de ganar.
Infraestructura y material_producto tienen won_rate mas bajo.

## 2. Tipos de solucion que mas ganan (LATAM: nacional + internacional, n=124)

Muestras muy pequenas (n < 20 por tipo), diferencias no concluyentes. No usar para decidir.

## 3. Patrones de soluciones ganadoras (extraidos de transcripciones reales)

Estos patrones aparecen repetidamente en los videos de primero lugar con transcripcion:

- **Solucion concreta y tangible**: describen un dispositivo, app o proceso específico, no una idea vaga.
- **Medible**: citan metricas concretas (costo, litros, vatios, metros cuadrados, personas beneficiadas).
- **Desafio alineado**: el proyecto responde directamente al desafio del año, no un tema ajeno.
- **Equipo identificado**: nombre del equipo, universidad y carrera claramente dichos.
- **Audio claro**: videos con audio transcribible tienen mas probabilidad de estar bien explicados.
- **Duracion <= 110 s**: videos mas cortos tienden a ganar mas (hipotesis H42: -6.0 pp por exceder).

## 4. Anti-patrones (soluciones que NO ganan)

- No hay audio (video muerto/privado): no se puede evaluar.
- Solucion vaga sin detalles tecnicos.
- Metrica ausente o "no documentado".
- Proyecto no alineado al desafio del ano.

## 5. Uso en skills

Las skills (`proponer-retos`, `dossier-soluciones`, `guion-pas-v`) deben:
- Leer los datos de `knowledge/retos_razonamiento.json` y `research/sirli/winners.jsonl`.
- Aplicar los patrones de esta guia para evaluar si una solucion propuesta es buena.
- NO hardcodear proyectos especificos de ediciones anteriores como ejemplos a copiar.
- Usar `videos_sin_audio.tsv` para descartar videos sin audio al mapear.

## Archivos de datos

- `knowledge/retos_razonamiento.json` — 101 casos (version 2), 91 con video_url
- `research/sirli/videos_sin_audio.tsv` — 607 videos sin audio (grupo, url, motivo)
- `research/sirli/analisis/modelo_solucion.json` — analisis de tipos de solucion
