---
name: ingestar-investigacion
description: Procesa un PDF, DOCX o MD que trae el usuario desde fuera (por ejemplo una investigación hecha en z.ai), extrae el contenido, lo contrasta, lo alinea a la rúbrica y lo sirve como propuesta. Úsala cuando el usuario adjunte un documento o diga "te traje la investigación".
---

# La Chismosa del Barrio — Ingestar investigación externa

## Cuándo usarla

- El usuario entrega un PDF, DOCX o MD producido fuera (z.ai, ChatGPT, un informe propio).
- Pide "analiza esto", "límpialo", "pásalo al presupuesto" o "corrige esto contra las bases".

## Procedimiento

1. **Extrae el texto sin IA.** No dependas del modelo para leer el archivo. Escribe el
   archivo **desde Python en UTF-8** — en Windows, redirigir con `>` o `| Out-File`
   reencoda por cp1252 y produce mojibake o `UnicodeEncodeError`:

```bash
python -c "import pdfplumber,sys; pdf=pdfplumber.open(sys.argv[1]); t='\n'.join((p.extract_text() or '') for p in pdf.pages); open(sys.argv[2],'w',encoding='utf-8').write(t)" informe.pdf extraido.txt
```

   Para DOCX: `python -c "import docx,sys; d=docx.Document(sys.argv[1]); t='\n'.join(p.text for p in d.paragraphs); open(sys.argv[2],'w',encoding='utf-8').write(t)" informe.docx extraido.txt`

   Para leer por pantalla: `set PYTHONIOENCODING=utf-8` (PowerShell: `$env:PYTHONIOENCODING="utf-8"`).

2. **Lee `extraido.txt` por rangos.** No lo vuelques entero en el contexto.
   Limpia primero el relleno de Word: U+2002/U+2003 (en/em quads) y espacios dobles —
   inflan el conteo de caracteres de cada sección.
3. **Separa hechos de opiniones.** Toda cifra que vayas a usar debe existir en
   `research/claims.json` o venir con fuente y año en el documento. Si no, márcala como
   estimación y dilo. Si `claims.json` está vacío, toda cifra queda "solo con respaldo
   del documento": exige fuente + año en el propio documento y sirve con `--simulated`.
4. **Alinea al certamen activo** (`brief.json` → `rally_type`), usando
   `.agents/rules/modos-rally.md` y `.agents/rules/rubricas-y-puntajes.md`.
   Si `rally_type` está vacío: **no adivines** — pregunta el certamen o infírelo del
   documento solo para analizar, marcándolo como supuesto, y no cierres nada hasta que
   el usuario confirme.
   Cuenta caracteres por sección contra los topes (`knowledge/rubric_matrices.md` §4;
   Latam: 1250/1250/1000/1000/1500). Si una sección se pasa, recórtala y avisa.
5. **Decide el destino**: qué pestaña y qué ranura. Presupuesto → `budget/costos`;
   problema/solución/impacto → `pautado/<slot>`; guion → `script/actoN`.
6. **Sirve la propuesta** con la skill `servir-a-ventana`. Marca `--simulated` si algo no
   es real o no tiene respaldo.
7. **Resume al usuario en 5 líneas**: qué trajo el documento, qué se corrigió, qué se
   descartó y por qué, y dónde quedó la propuesta.

> **Reconstruir el cerebro Graphify (cuando se añade nueva investigación al corpus):**
> 1. Colocar la nueva fuente en `brain/corpus/`.
> 2. Ejecutar `python brain/sync_corpus.py`.
> 3. Recompilar: `/graphify brain/corpus` (o regenerar `graphify-out/`).
> El cerebro guarda solo conocimiento de dominio (rúbricas, ganadores, retos, claims, patrones de pitch). Nunca guarda el motor, ni instrucciones de instalación, ni proyectos anteriores.

## Reglas

- El documento externo **no manda** sobre las bases del evento. Si contradice una regla, la
  regla gana y se avisa.
- **Pruebas aisladas**: para probar la ingesta sin ensuciar el buzón del proyecto, sirve
  con `RALLY_DATA_DIR=<sandbox>` apuntando fuera de `dashboard/data/` (sin token, sin
  `--mailbox`, sin servidor). El repo activo no debe recibir sobres de una prueba.
- No inventes URLs ni proveedores para "completar" un presupuesto.
- Para papers usa `firecrawl-research-index`; para documentación técnica o errores de librería, `firecrawl-developer-index`. Instálalas solo cuando la tarea las pida (`python scripts/herramientas.py necesita "<tarea>"`); si el claim ya está en `research/claims.json`, no instales nada.
- Si el documento trae datos personales o internos, no los publiques en `site/`.
- Si la extracción falla (PDF escaneado), dilo: ofrece OCR (`/api/ocr`) o pide una versión
  con texto.

## Generación de prompts para llevar la investigación a otra IA

Cuando el usuario quiera exportar el documento extraído a otra IA
(OpenAI, Claude, Gemini, OpenCode, Antigravity…), genera el prompt con esta
estructura:

```
Rol: analista de investigación externa para rallues de innovación.
Contexto: Certamen <rally_type>, documento <nombre_archivo>, tipo <pdf|docx|md>.
Entrada: `extraido.txt` (texto extraído en UTF-8), `research/claims.json`,
  `.agents/rules/modos-rally.md`, `.agents/rules/rubricas-y-puntajes.md`.
Tarea: Extraer contenido, contrastar con la rúbrica y alinearlo al certamen
  activo para servir como propuesta.
Restricciones:
  - Extrae el texto sin IA; no dependas del modelo para leer el archivo.
  - Toda cifra que se use debe existir en `research/claims.json` o venir con
    fuente y año en el documento. Si no, márcala como estimación.
  - Alinea al certamen activo (`brief.json` → `rally_type`).
  - Si `rally_type` está vacío: no adivines — pregunta el certamen.
  - Sin emojis, sin degradados estilo IA, sin glassmorphism.
  - Idioma: español.
Formato de salida: JSON con claves archivo, tipo, hechos ([]), opiniones ([]),
  cifras_con_fuente ([]), estimaciones ([]), destino_pestana, destino_slot,
  simulado.
Idioma: español.
```

## Cómo sugerir un título o nombre de proyecto o producto

Sigue los patrones reales del banco SIRLI (`research/sirli/winners.jsonl`):

- **Inventado**: NEXORA, KINETIX
- **Objeto**: AVOCADO, LUMBRE
- **Compuesto**: NEXO-SOSTENIBLE
- **Territorio + número**: ALTIPLANO 360
- **Sufijo técnico**: BIOINNOVATECH
- **Juego**: DESUCHO, ERROR 404

Reglas:
- Nunca repites el nombre del proyecto más de una vez por sección.
- No hardcodees el nombre en scripts; léelo siempre de `brief.json`.

## Cómo enseñar visualmente

- Contraste garantizado: texto claro sobre fondo oscuro, o sombra de texto
  desplazada.
- Elementos gráficos se exportan como PNG 2048×2048 con fondo transparente.
- Sin emojis como íconos en la web demo.

## Cómo redactar guiones cuidando la pronunciación y el orden de palabras

- Escribe para ser escuchado, no leído: oraciones cortas, sujeto-verbo-objeto,
  evita subordinadas encajadas.
- Acentos reales en español; acrónimos se deletrean si no son de uso común.
- Cada cambio de idea necesita una pausa o transición explícita.
- Máximo 240-270 palabras (≈130-140 WPM) para ≤ 120 s de audio.

## Cómo crear modelos 3D (referencia)

Ver `skills/modelo-3d-blender/SKILL.md` para el procedimiento completo de
modelado 3D con Blender y generación de renders para el video.

## Cómo sugerir elementos gráficos

- Sin emojis como íconos en la web demo.
- Sin cards genéricas, sin morado (#7c3aed o similar), sin fuentes fuera de
  `brand/tokens.css`.

## Punteros

- Estadísticas citables: `research/claims.json`
- Reglas del certamen: `.agents/rules/modos-rally.md`
- Puntajes: `.agents/rules/rubricas-y-puntajes.md`
- Entrega a la ventana: skill `servir-a-ventana`
