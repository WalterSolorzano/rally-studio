---
name: ingestar-investigacion
description: Procesa un PDF, DOCX o MD que trae el usuario desde fuera (por ejemplo una investigación hecha en z.ai), extrae el contenido, lo contrasta, lo alinea a la rúbrica y lo sirve como propuesta. Úsala cuando el usuario adjunte un documento o diga "te traje la investigación".
---

# La Chismosa del Barrio — Ingestar investigación externa

## Navegador obligatorio (browser MCP)

Ninguna cifra entra a `research/claims.json` sin haber sido abierta en el
navegador real.

1. Cada estadística del documento externo se contrasta contra su **fuente
   primaria** abierta en el navegador MCP; se copian `stat`, `source`, `url`,
   `year` y `accessed` de lo que se ve en pantalla.
2. Guarda captura PNG de la fuente (`research/shots/<slug>.png`) cuando el dato
   sea central para el pautado.
3. Si la cifra no se puede verificar, **no se inventa**: se marca `[SIMULADO]` o
   se sirve con `--simulated`.
4. Si el navegador MCP no está conectado, detente y pide instalar la extensión y
   abrir la sesión.
5. `handoff` solo para login/2FA; nunca resuelvas captchas.

## Cuándo usarla

- El usuario entrega un PDF, DOCX o MD producido fuera (z.ai, ChatGPT, un informe propio).
- Pide "analiza esto", "límpialo", "pásalo al presupuesto" o "corrige esto contra las bases".

## Retos del comité: PDF oficial o video de YouTube

Cuando lo que llega son **los retos** (no una investigación), el destino no es el pautado:
es `research/challenges.json` y la pestaña `challenges`.

### PDF de retos
1. Extráelo a texto sin IA:
   `python -c "import pdfplumber,sys; pdf=pdfplumber.open(sys.argv[1]); open(sys.argv[2],'w',encoding='utf-8').write('\n'.join((p.extract_text() or '') for p in pdf.pages))" retos.pdf retos.txt`
2. Ingiere: `python scripts/ingest_challenges.py retos.txt --certamen nacional|latam`
   (con `--dossier` sale además el PDF de soluciones).
3. Verifica el conteo: `research/challenges.json` debe tener tantos `id` como retos oficiales.
4. Sirve la lista a la pestaña `challenges` con la skill `servir-a-ventana`.

### Video de YouTube con los retos
1. Baja los subtítulos (no el video):
   `yt-dlp --skip-download --write-auto-subs --write-subs --sub-langs "es.*,en.*" --sub-format vtt -o "%(id)s" "<URL>"`
2. Ingiere el `.vtt` (o `.srt`): `python scripts/ingest_challenges.py archivo.es.vtt --certamen nacional|latam`
3. Si el video no trae subtítulos, **no inventes retos**: pide la transcripción, el PDF o el
   enlace del acta. Los retos se guardan literales, nunca resumidos.

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

## Detalle completo (leer antes de producir)

El procedimiento largo, las tablas y los ejemplos de esta skill están en
`references/detalle.md`. Es obligatorio leerlo antes de generar contenido: ahí viven las
reglas que no caben en esta portada.
