# Índice de casos ganadores cruzado con dataset SIRLI

Cada entrada vincula un caso documentado en `brain/corpus/ganadores_db.md` con su fila real en
`research/sirli/winners.jsonl` (5.136 premios, 14 países, 2017–2026). `transcripción` indica si el
video tiene texto extraído en `research/sirli/transcripts/<video_id>.json`.

| Caso | Año | Equipo | Puesto | Colección | Video ID | Transcripción | Notas |
|---|---|---|---|---|---|---|---|
| DIGNA | 2023 | Güegüense Pinolero | 1.º lugar | sede+nacional+internacional | AjtVryXaGDc | No (0 chars) | Válido en 3 instancias |
| Techriders | 2024 | TECHRIDERS | 1.º lugar | nacional+internacional | MIvlD31HfIk | Sí | Falta fila sede |
| STEM Synergy | 2025 | STEM SYNERGY | 1.º lugar | nacional+internacional | JhqjBm20DXo | Sí | Falta fila sede |
| LexoStop | 2019 | LEXONIC | 1.º/3.º lugar | nacional+internacional | 1NBgrCZ4sDI | Sí | Falta fila sede |
| Ollnari | 2025 | Operación Titán / UNI | 1.º lugar | — | — | No | No está en winners.jsonl |
| Mentes Volcánicas | 2025 | UNI RUPAP | 1.º lugar | — | — | No | No está en winners.jsonl |
| Alertar | 2021 | Ingeniarte UNNE | 1.º lugar | — | — | No | No está en winners.jsonl (Alertar 2025 es 2.º lugar sede) |
| Nexus Innova | 2025 | UNAN-Managua | 1.º lugar | — | — | No | Nexus Innova 4.0 es 2.º lugar sede 2026, distinto |

**Cobertura del índice:** 4 de 8 casos tienen fila en el dataset; 4 de 8 tienen transcripción con texto.
**Casos sin dataset:** Ollnari, Mentes Volcánicas, Alertar, Nexus Innova (posiblemente scrapeados con
nombre de equipo distinto o fuera del subset NIC).
**Casos sin sede:** Techriders, STEM Synergy, LexoStop (tienen nacional e internacional pero no la
fila de sede correspondiente).

## Frases reales extraídas de transcripciones de ganadores

### STEM Synergy (JhqjBm20DXo, 2025, 1.º lugar Internacional Innovación)
- Apertura: "Hoy más que nunca la ciudad enfrentan el reto de producir sus propios alimentos de forma sostenible. Según la FAO, para el año 2050 la producción mundial deberá aumentar en un 60%"
- Cierre: "Con Plan B convertimos cualquier espacio en una oportunidad para cultivar vida, reducir el desperdicio y reconectar con la naturaleza."

### LexoStop / LEXONIC (1NBgrCZ4sDI, 2019, 3.º lugar Internacional Impacto Social)
- Apertura: "En la actualidad, existen muchas formas para generar energía, pero la principal forma de adquirirla es a base de la quema de hidrocarburos y carbón."
- Cierre: "LexoStop cambia la experiencia de las antiguas estaciones de autobuses por un espacio seguro, informativo y de satisfactoria estadía mientras se espera su transporte urbano."

**Uso:** Estas aperturas siguen el patrón Micro-Acto I (gancho + dolor cuantificado) y cierres siguen Micro-Acto IV (impacto + llamado a la acción). Ver `script/guion_guia.md`.
