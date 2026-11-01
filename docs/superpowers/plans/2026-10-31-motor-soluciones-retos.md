# Motor de soluciones para retos Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Dado un reto que aporta el usuario, generar 2–3 soluciones aplicables y defendibles, fundadas en casos ganadores 2017–2026, y exportarlas a un dossier PDF que venda la idea con datos verificables.

**Architecture:** Un motor determinista (`scripts/soluciones_motor.py`) cruza el reto con un corpus curado de razonamiento de ganadores (`knowledge/retos_razonamiento.json`) y el índice real de 5,136 ganadores (`research/sirli/winners.jsonl`). Un generador (`scripts/gen_soluciones_pdf.py`) convierte la salida a HTML y luego a PDF con Chrome headless. El motor nunca inventa retos, cifras ni precedentes: lo que no tiene fuente se etiqueta.

**Tech Stack:** Python 3.10+, stdlib, Chrome/Edge headless. Sin dependencias nuevas.

**Spec:** aprobación del usuario en conversación (31 oct 2026): "nosotros no creamos retos, el usuario nos da los retos, nosotros proponemos soluciones; no mostrar estadísticas internas, solo estadísticas de datos para vender la idea; usar el cerebro Graphify si ayuda".

## Global Constraints

- El sistema **no propone retos**. Entrada obligatoria: `research/challenges.json` con retos del usuario/comité. Si está vacío, falla con instrucción de ingesta.
- **No mostrar estadísticas internas** (saturación, scores, probabilidad de victoria) en el PDF ni en la salida al usuario.
- **Solo datos verificables**: toda cifra de impacto debe venir de una fuente citada (corpus, claims o grafo). Si no hay, se omite y se marca `por validar`.
- Categorías válidas: Nacional = `tecnologica|social|procesos`; Latam = `innovacion|impacto_social`.
- Cada propuesta debe traer al menos un precedente ganador (año, equipo, proyecto, puesto) o la etiqueta `exploratoria`.
- No tocar `scripts/rally_service.py`, `dashboard/app.js` ni reglas de negocio.
- Los tests existentes deben seguir pasando.

---

### Task 1: Corpus de razonamiento de ganadores

**Files:**
- Create: `knowledge/retos_razonamiento.json`
- Create: `tests/test_retos_razonamiento.py`

**Interfaces:**
- Produces: lista `casos[]` con `id, temas[], year, rally, categoria, equipo, proyecto, puesto, problema, causa_raiz, insight, solucion, metrica, fuente, video_url`.

- [ ] Extraer 15–20 casos de `knowledge/winners_latam.md`, `knowledge/winners_analysis.md` y `knowledge/winners_database.json` (2019–2026).
- [ ] Cada caso con fuente exacta y sin inferencias sin marcar.
- [ ] Test: JSON válido, ids únicos, `temas` no vacío, `fuente` existente, categoría válida.

### Task 2: Motor de soluciones

**Files:**
- Create: `scripts/soluciones_motor.py`
- Create: `tests/test_soluciones_motor.py`

**Interfaces:**
- Produce: `generar_soluciones(reto, certamen, categoria, casos, propuestas=3) -> dict`.
- Consume: `knowledge/retos_razonamiento.json`, `research/sirli/winners.jsonl`, `brief.json`.
- CLI: `python scripts/soluciones_motor.py --reto 01 --json salida.json`.

- [ ] Clasificar el reto en la categoría del certamen activo con justificación.
- [ ] Emparejar reto→casos por `temas` (solapamiento normalizado).
- [ ] Generar 3 rutas: adaptación de precedente, híbrido hardware+software, ruta de proceso/servicio.
- [ ] Completar impacto solo con datos del caso/fuente; si falta, `por validar`.
- [ ] Etiquetar `exploratoria` cuando no haya precedente.
- [ ] Tests: no propone retos; categoría válida; precedente o etiqueta; cifras con fuente.

### Task 3: Dossier PDF

**Files:**
- Create: `scripts/gen_soluciones_pdf.py`
- Create: `docs/assets/soluciones.css`
- Create: `tests/test_gen_soluciones_pdf.py`

**Interfaces:**
- Consume la salida JSON del motor.
- Produce `docs/Dossier_Soluciones_<certamen>.pdf` + HTML intermedio.

- [ ] Renderizar portada, método (5,136 ganadores, 2017–2026), ficha por reto y tarjetas de solución.
- [ ] Incluir precedentes con año/equipo/puesto y enlace si existe.
- [ ] Incluir bloque "Impacto para vender la idea" solo con cifras con fuente.
- [ ] Prohibir en el HTML: `saturación`, `score`, `probabilidad`, `win rate`.
- [ ] Convertir a PDF con Chrome headless; fallar con mensaje claro si no hay navegador.
- [ ] Tests: HTML sin estadísticas internas; PDF existe y pesa > 10 KB.

### Task 4: Integración, skill y demo

**Files:**
- Modify: `skills/proponer-retos/SKILL.md`
- Modify: `scripts/ingest_challenges.py`
- Create: `docs/MOTOR_SOLUCIONES.md`
- Modify: `AGENTS.md` (fila de herramienta)

- [ ] Reescribir la skill: "propone soluciones para los retos que da el usuario; nunca crea retos".
- [ ] `ingest_challenges.py` genera también el dossier PDF.
- [ ] Importar el banco real de `brain/corpus/retos.md` a `research/challenges.json` (`--desde-brain`).
- [ ] Documentar comandos y límites.
- [ ] Correr demo con los retos reales y verificar PDF.
- [ ] Suite completa: los 4 fallos preexistentes del working tree no cuentan; el resto debe pasar.
