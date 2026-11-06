# Análisis General Final — Rally de Innovación (LATAM + Nacional)

**Rally Sistem** — Análisis de ganadores, ediciones 2017–2026  
Generado desde `research/sirli/winners.jsonl` y `knowledge/winners_latam.md`  
Solo información importante. Sin datos inventados.

---

## 1. Qué es SIRLI y de dónde salen los datos

El SIRLI es un rally de innovación en tres rondas: **sede** local → **nacional** → **internacional** (LATAM). Cada equipo recibe un desafío, lo trabaja en 24–28 horas y entrega un video ≤120 s. El jurado premia los tres mejores de cada desafío.

| Métrica | Valor |
|---------|-------|
| Premios registrados | 5.136 |
| De sede | 4.715 (91,8 %) |
| Nacionales | 363 |
| Internacionales (LATAM) | 58 |
| Años cubiertos | 2017–2026 |
| Países | 14 |
| Videos con transcripción | 904 |
| Videos sin audio | 607 |

Fuente primaria: `sirli.org/ganadores`.  
Cada ganador mapeado tiene: **año, nombre del equipo, reto/desafío, solución, video**. Las soluciones se extraen de transcripciones de video; cuando no existen, se marcan como "no documentado en la fuente".

---

## 2. Cinco conclusiones clave

1. **El registro solo tiene premiados.** No hay grupo de control. Ninguna cifra es "probabilidad de ganar": es probabilidad de ser primero entre los tres premiados.
2. **La composición de la delegación explica más que el video.** Cuántos equipos lleva tu sede y cuántos comparten tu desafío pesa más que cualquier variable del video.
3. **Lo que se mide del video no distingue a nadie.** Duración, miniatura, título, subtítulos caen en el ruido tras corregir comparaciones múltiples (42 hipótesis probadas: 3 a favor, 0 en contra, 25 sin evidencia).
4. **El hueco más rentable no es técnico.** Ningún guion del corpus pone a hablar a un usuario real (0 %).
5. **El certamen se endureció.** En la sede de Nicaragua, la tasa de primer lugar cayó de 54,4 % (2021) a 38,6 % (2026).

---

## 3. Ganadores LATAM — Instancia internacional (58 equipos)

Podio continental por edición. Cada entrada: año, puesto, equipo, país, reto, solución, video.

| Año | Puesto | Equipo | País | Reto | Solución | Video |
|-----|--------|--------|------|------|----------|-------|
| 2016 | 1° Impacto Social | Geckakz | Nicaragua | Juego para niños no videntes | no documentado en la fuente | [SIRLI 2016](https://www.anfei.mx/actividades/rally-latinoamericano-2016-ganadores-internacionales/) |
| 2017 | 1° Impacto Social | BottleLife | Uruguay | Reutilización de envases plásticos | no documentado en la fuente | [YouTube](https://www.youtube.com/watch?v=yhVE1ZRDQZk) |
| 2019 | 3° Impacto Social | LEXONIC | Nicaragua | Parada de autobús sustentable (eólica+solar) | Estructura híbrida eólica-solar para parada de bus | [YouTube](https://www.youtube.com/watch?v=1NBgrCZ4sDI) |
| 2021 | 1° Innovación | MT Soluciones Creativas | Nicaragua | Vivienda energética autosustentable | Vivienda bioclimática con aislamiento y solar fotovoltaica | [YouTube](https://www.youtube.com/watch?v=AWLCV3DTDCA) |
| 2021 | 1° Impacto Social | INGENIARTE | Argentina | Violencia doméstica bajo encierro | Dispositivo discreto de auxilio silencioso ("Alertar") | [YouTube](https://www.youtube.com/watch?v=mgAvnq8aTJs) |
| 2022 | 1° Innovación | Seiketsu | México | Mordeduras de serpientes a la vista | Innovación para zonas rurales desatendidas | [YouTube](https://www.youtube.com/watch?v=f12vrC7C710) |
| 2023 | 1° Innovación | GÜEGÜENSE PINOLERO | Nicaragua | Vivienda Digna | Vivienda modular 44,18 m², SODIS, panel solar 400W, bambú | [YouTube](https://www.youtube.com/watch?v=AjtVryXaGDc) |
| 2024 | 1° Innovación | TECHRIDERS | Nicaragua | Micropresas o Microembalses | Sistema captación agua con telemetría LoRaWAN | [YouTube](https://youtu.be/MIvlD31HfIk) |
| 2025 | 1° Innovación | STEM SYNERGY | Nicaragua | Huertos verticales | Huertos verticales con recirculación hídrica, −40 % peso estructural | [YouTube](https://www.youtube.com/watch?v=JhqjBm20DXo) |
| 2025 | 1° Impacto Social | MENTES VOLCÁNICAS | Nicaragua | Aprovechamiento de Tetra Pak | Paneles constructivos sismorresistentes de residuos Tetra Pak | [YouTube](https://www.youtube.com/watch?v=_JSUKR1bPnE) |
| 2026 | 1° Innovación | NEXO-SOSTENIBLE | Chile | Residuos de poda y biomasa vegetal | no documentado en la fuente | [YouTube](https://youtu.be/i6fMS8UCgV0) |
| 2026 | 1° Impacto Social | INIVEZ | Venezuela | Segunda vida de motores eléctricos domésticos | no documentado en la fuente | [YouTube](https://youtu.be/YInXXmzd3kM) |

Tabla completa de los 58 ganadores LATAM: `knowledge/winners_latam.md` → sección LATAM.

---

## 4. Ganadores Nacionales — Instancia por país (363 equipos)

Primeros, segundos y terceros lugares nacionales por país y año.

Casos emblemáticos Nicaragua:

| Año | Puesto | Equipo | Sede | Reto | Solución | Video |
|-----|--------|--------|------|------|----------|-------|
| 2019 | 1° Nacional Innovación | ERGON | UNAN-Managua | Eficiencia energética entorno laboral | no documentado en la fuente | [SIRLI 2019](https://sirli.org/ganadores/nacional/2019/) |
| 2021 | 1° Nacional Innovación | MT Soluciones Creativas | UNI-RUPAP | Vivienda energética autosustentable | Vivienda bioclimática con aislamiento y solar | [YouTube](https://www.youtube.com/watch?v=AWLCV3DTDCA) |
| 2022 | 1° Nacional Innovación | INNOVACIÓN PINOLERA | UNI-RUPAP | Ahorro energético sector gastronómico | no documentado en la fuente | [YouTube](https://youtu.be/EQDVgGqz7PI) |
| 2023 | 1° Nacional Innovación | Güegüense Pinolero | UNI-RMAV | Vivienda Digna | Vivienda modular social | [YouTube](https://www.youtube.com/watch?v=AjtVryXaGDc) |
| 2024 | 1° Nacional Innovación | TECHRIDERS | UNI-RUSB | Micropresas o Microembalses | Sistema captación agua con telemetría LoRaWAN | [YouTube](https://youtu.be/MIvlD31HfIk) |
| 2025 | 1° Nacional Procesos | Operación Titán (Ollnari) | UNI-RUPAP/INATEC | Conectar artesanos con mercados | Plataforma digital artesanía | [YouTube](https://www.youtube.com/watch?v=v4kZD-S1NHk) |
| 2026 | 1° Nacional Innovación | IGNIS CODE | UAM-DIEM | Protección y fomento de polinizadores | Micro-refugios bio-climáticos autónomos | YouTube Oficial |
| 2026 | 1° Nacional Tecnológica | AVOCADO | UAM-Jaguares | Segunda vida de motores eléctricos | Reutilización de motores en desuso para tracción rural | YouTube Oficial |

Tabla completa de los 363 ganadores nacionales: `knowledge/winners_latam.md` → sección Nacional.

---

## 5. Patrones de soluciones ganadoras

**Patrones (sí ganan):**
- Solución tangible y técnica (dispositivo físico, prototipo 3D, sistema ciber-físico).
- Medible: métricas concretas (costo, litros, vatios, m², beneficiarios).
- Desafío alineado: responde directamente al reto del año.
- Doble codificación: narrativa local para jurado nacional + ingeniería universal para internacional.
- Duración ≤ 120 s.

**Anti-patrones (no ganan):**
- Solución vaga sin detalles técnicos.
- Métrica ausente o "no documentado".
- Proyecto no alineado al desafío del año.
- Video sin audio.

---

## 6. Videos sin audio (607)

607 videos sin audio registrados en `research/sirli/videos_sin_audio.tsv` (590 de `asr_dead.txt` + 43 transcripciones vacías). Cualquier mapeo futuro debe consultar este archivo antes de asumir que un grupo/link tiene audio.

---

## 7. Archivos de datos

| Archivo | Contenido |
|---------|-----------|
| `research/sirli/winners.jsonl` | 5.136 registros ganadores (año, colección, puesto, equipo, categoría, reto, solución, video, sede, país, fuente) |
| `research/sirli/winners.csv` | Misma CSV, delimitador `;` |
| `knowledge/winners_latam.md` | Tabla maestra LATAM + Nacional (año, puesto, nombre, reto, solución, video) |
| `knowledge/winners_analysis.md` | Análisis narrativo LATAM + Nacional |
| `knowledge/retos_razonamiento.json` | 101 casos de razonamiento (v2), 91 con video_url |
| `research/sirli/videos_sin_audio.tsv` | 607 videos sin audio |
| `brand/palette.json` | Paleta Rally Sistem: primary #1d45b9, secondary #f81110, accent #2aa7ad |

---

**Fin del documento.** Todo dato es trazable a `sirli.org/ganadores` o a transcripciones locales. No se inventan estadísticas.
