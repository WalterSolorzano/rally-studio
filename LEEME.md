# Voces y archivos

Cada MP3 aparece en esta carpeta en cuanto su voz termina la narracion
completa. El nombre empieza con un numero: ese es el orden.

| archivo | tono | de donde sale la voz |
|---|---|---|
| `00_interna.mp3` | (sin dato) | la voz que trae el modelo de fabrica |
| `01_lv_comphistoriacam_2511_libri.mp3` | 82 Hz | Compendio de Historia de la América Central (lector: Agustín Gómez Carrillo) |
| `02_lv_habitanteysuesperanza_2410.mp3` | 85 Hz | El Habitante y Su Esperanza (lector: Pablo Neruda) |
| `03_lv_cuentos_2209_librivox.mp3` | 90 Hz | Cuentos escogidos (lector: Guy de Maupassant) |
| `04_lv_romanos_1103_librivox.mp3` | 91 Hz | Bible (Reina Valera 1909) NT 06: La Epistola del Apostol San Pablo a los Romanos (lector: Reina Valera) |
| `05_lv_una_comida_en_casa_de_ross.mp3` | 96 Hz | Una comida en casa de Rossini (lector: Alexandre Dumas) |
| `06_lv_fortunata_y_jacinta_2_2003.mp3` | 96 Hz | Fortunata y Jacinta: dos historias de casadas (Segunda Parte) (lector: Benito Pérez Galdós) |
| `07_lv_cuentosdeterror_2001_libri.mp3` | 97 Hz | Cuentos de terror (lector: Various) |
| `08_lv_voragine_2312_librivox.mp3` | 100 Hz | La Vorágine (lector: José Eustasio Rivera) |

Menos Hz = voz mas grave y mas ancha; eso es lo que suena a locutor.
Los primeros cuatro son los mas graves, y por eso son los que mas
probabilidad tienen de gustarte para narracion.

La misma narracion, en todas: `narracion.txt` (7 parrafos).
Ajustes: intensidad 0,8 / fidelidad 0,45 / ritmo pausado.

## Prompts para otra IA (bloque compartido por todas las skills)

Cada skill en `skills/<nombre>/SKILL.md` incluye un bloque "Generación de prompts para llevar el contenido a otra IA" con rol, contexto, entrada, tarea, restricciones, formato de salida JSON e idioma español. Listo para copiar y pegar en OpenAI, Claude, Gemini, OpenCode o Antigravity.

## Nombrado de proyecto o producto

Patrones del banco SIRLI (`research/sirli/winners.jsonl`):
- Inventado: NEXORA, KINETIX
- Objeto: AVOCADO, LUMBRE
- Compuesto: NEXO-SOSTENIBLE
- Territorio + número: ALTIPLANO 360
- Sufijo técnico: BIOINNOVATECH
- Juego: DESUCHO, ERROR 404

Reglas: nunca hardcodear el nombre en scripts (leer de `brief.json`), no repetir el nombre más de una vez por sección, el nombre no va en los primeros 20 s del video.

## Enseñanza visual y elementos gráficos

- Una distancia focal por secuencia con rótulos; medir rótulos en pantalla (margen ≥6 %).
- Contraste garantizado: texto claro sobre placa oscura, rótulos siempre con flecha.
- Thumbnail y portada: sin figuras básicas (cuadrados, círculos, triángulos); foto real de la problemática; sin texto/logos/marcas de agua en la imagen; PNG 2048×2048 fondo transparente.
- Sin emojis, sin morado (#7c3aed), sin cards genéricas, sin glassmorphism, fuentes solo de `brand/tokens.css`.
- Assets nombrados: `asset_<shotlist_id>_<descripcion>.<ext>`.

## Redacción de guiones (pronunciación y orden de palabras)

- Escribir para ser escuchado: sujeto-verbo-objeto, oraciones cortas, acentos reales en español.
- Pausa o transición por cada cambio de idea.
- Máximo 240-270 palabras (≈130-140 WPM) para ≤ 120 s de audio.
- Números dichos completos; coherencia con `budget/budget.json`; datos de `research/claims.json`.

## Crear modelos 3D (Blender)

Ver `skills/modelo-3d-blender/SKILL.md`: ficha técnica aprobada antes de GPU, modelo reproducible por script, dimensiones desde `budget/bom.csv`, auditoría geométrica, entrega en `dashboard/assets/`.

---

## Otras carpetas

- `emocion/`: la frase mas emocional del texto (la de Ruben Dario),
  con 3 voces y varias intensidades para comparar de oido.
  El nombre dice la intensidad: `__e0.65`, `__e0.8`, `__e1`.
- `candidatos/`: pruebas cortas anteriores (voz cortada: arreglado).
