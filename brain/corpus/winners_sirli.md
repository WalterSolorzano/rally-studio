# Winners SIRLI — banco de ganadores Rally

## Fuente
`research/sirli/winners.jsonl` (maestro, un JSON por línea) y `research/sirli/winners.csv` (misma tabla, separador `;`, BOM).

## Alcance
- Registros totales: 5,136
- Años cubiertos: 2017–2026
- Colecciones: internacional (LATAM), nacional, sede
- Países: 14
- Campos por registro: year, collection, place, place_label, team, category, challenge, challenge_number, challenge_name, sede, country, country_code, video_url, video_id, source_url, id, solucion

## Soluciones documentadas
- Con solución extraída de transcripciones: 1,108
- Sin solución ("no documentado en la fuente"): 4,028
- Cobertura de solucion: ~21.6 %

## Uso en el grafo
Nodo de referencia cruzada para `ganadores_latam.md`, `ganadores_analisis.md`, `patrones_buenas_soluciones.md` y `transcripciones_primeros_lugares_nic.md`. Permite vincular equipo → reto → solución → video.
