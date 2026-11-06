# Modelo de tipo de solución basado en transcripciones reales

Fuente: `research/sirli/transcripts/*.json` (949 videos con texto >100 chars) unido con `research/sirli/analisis/dataset_videos.csv` por `video_id`.

Las categorías de tipo de solución **no son predefinidas**: emergen de indicadores de keyword que aparecen en el texto hablado real de las transcripciones (dispositivo, máquina, sensor, filtro, app, plataforma, proceso, método, materiales, residuos, infraestructura, construcción, etc.).

## Distribución por tipo de solución (n=949)

| Tipo de solución | Videos |
|---|---|
| dispositivo_fisico | 368 |
| material_producto | 258 |
| sistema_digital | 127 |
| proceso_servicio | 73 |
| infraestructura | 69 |
| otro_no_clasificado | 54 |

## Won rate (es 1.er lugar) por tipo y colección

### Sede (n=825)

| Tipo | n | gana | won_rate |
|---|---|---|---|
| dispositivo_fisico | 313 | 210 | 67.1% |
| sistema_digital | 114 | 72 | 63.2% |
| otro_no_clasificado | 50 | 31 | 62.0% |
| proceso_servicio | 67 | 38 | 56.7% |
| material_producto | 218 | 117 | 53.7% |
| infraestructura | 63 | 33 | 52.4% |

### Nacional (n=82)

| Tipo | n | gana | won_rate |
|---|---|---|---|
| infraestructura | 6 | 3 | 50.0% |
| proceso_servicio | 2 | 1 | 50.0% |
| material_producto | 24 | 11 | 45.8% |
| dispositivo_fisico | 36 | 16 | 44.4% |
| sistema_digital | 11 | 4 | 36.4% |
| otro_no_clasificado | 3 | 1 | 33.3% |

### Internacional (n=42)

| Tipo | n | gana | won_rate |
|---|---|---|---|
| sistema_digital | 2 | 1 | 50.0% |
| proceso_servicio | 4 | 2 | 50.0% |
| dispositivo_fisico | 19 | 5 | 26.3% |
| material_producto | 16 | 4 | 25.0% |
| otro_no_clasificado | 1 | 0 | 0.0% |

## Nacional NIC (sede NICARAGUA, n=620) vs LATAM (nacional+internacional, n=124)

### NACIONAL NIC

| Tipo | n | gana | won_rate |
|---|---|---|---|
| dispositivo_fisico | 224 | 121 | 54.0% |
| otro_no_clasificado | 39 | 20 | 51.3% |
| sistema_digital | 84 | 42 | 50.0% |
| proceso_servicio | 53 | 24 | 45.3% |
| material_producto | 172 | 71 | 41.3% |
| infraestructura | 48 | 18 | 37.5% |

### LATAM

| Tipo | n | gana | won_rate |
|---|---|---|---|
| infraestructura | 6 | 3 | 50.0% |
| proceso_servicio | 6 | 3 | 50.0% |
| sistema_digital | 13 | 5 | 38.5% |
| dispositivo_fisico | 55 | 21 | 38.2% |
| material_producto | 40 | 15 | 37.5% |
| otro_no_clasificado | 4 | 1 | 25.0% |

## Hallazgos clave

1. **En sede (NIC y otros países), dispositivo_físico y sistema_digital lideran** con won_rate >60%. En LATAM internacional las muestras son muy pequeñas (n<20 por tipo), por lo que las diferencias no son concluyentes.

2. **En Nacional NIC, dispositivo_físico sigue liderando** (54.0%) seguido de sistema_digital (50.0%). Material_producto e infraestructura tienen won_rate más bajo (41.3% y 37.5%).

3. **Sesgo de muestra:** solo 19.2% de videos de sede tienen transcripción (vs 72.4% internacional). Los resultados de sede se basan en ~825 de 4,697 videos de sede. Internacional tiene mejor cobertura pero n pequeño.

4. **`otro_no_clasificado` (54 videos)** tiene won_rate consistente (~62% sede, 33% LATAM) — sugiere que hay tipos de solución que el clasificador por keyword no captura aún.

## Archivos generados

- `research/sirli/analisis/modelo_solucion.json` — resultados estructurados
- `research/sirli/analisis/modelo_solucion_detalle.csv` — detalle por video (949 filas)
