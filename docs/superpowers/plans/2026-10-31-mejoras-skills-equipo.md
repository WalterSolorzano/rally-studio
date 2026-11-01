# Mejoras de documentación skills del equipo de agentes Rally Studio

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Añadir pasos de validación y buenas prácticas a 9 skills de documentación del equipo de agentes (todas menos `servir-a-ventana`, que el usuario descartó), sin tocar el motor del sistema.

**Architecture:** Cada skill se modifica de forma independiente editando solo `skills/<nombre>/SKILL.md`. Las tareas no comparten estado ni interfaces de código; son cambios de texto independientes. Un revisor puede aprobar o rechazar cada task sin afectar a las demás.

**Tech Stack:** Markdown (SKILL.md), scripts existentes del repo (`scripts/gpu_lock.py`, `scripts/build_shotlist.py`, `scripts/arsenal.py`, `scripts/sync_corpus.py`, `scripts/publish_site.py`, `scripts/gen_palette.py`), archivos de reglas (`.agents/rules/`), `brief.json`, `env.json`, `research/claims.json`.

**Spec:** decisiones del usuario en esta sesión (mejoras 1,2,3,4,5,6,7,9,10; descartada la 8), `AGENTS.md`, `PRODUCT.md`.

## Global Constraints

- No tocar `rally_service.py`, `dashboard/app.js`, `dashboard/index.html`, cálculos de rúbrica, validaciones, `localStorage` ni reglas de negocio del evento (frontera del profe / AGENTS.md).
- No inventar datos: cada estadística debe venir de `research/claims.json` o decirse como estimación.
- `brief.json` es fuente única de verdad; no hardcodear nombres de proyecto.
- Cero emojis, cero morado `#7c3aed`, cero degradados "estilo IA", cero glassmorphism, cero tarjetas repetidas.
- Video ≤ 120 s; 4 actos PAS-V.
- Un proceso GPU pesado a la vez (`gpu_lock.py`); el PC puede ir cargado pero no debe colapsar.

## Review Focus

1. Guardia GPU/CPU/RAM invocada antes de render Blender, TTS o ffmpeg en `orquestador` — sin esto el PC puede colapsar.
2. `proponer-retos` no hardcodea reto ni biblioteca: el reto y la biblioteca se definen en el momento con el usuario.
3. `propuesta-diseno` obliga a instalar `impeccable` y `frontend-design`, y a hacer preguntas de diseño al usuario antes de proponer.
4. `guiar-usuario` cita `AGENTS.md` y la tabla de 13 etapas; no avanza inventando datos.
5. `ingestar-investigacion` documenta reconstrucción del cerebro Graphify (`brain/sync_corpus.py` + `graphify-out/`).
6. `publicar-sitio` documenta activación de GitHub Pages (workflow `.github/workflows/pages.yml`) y Netlify.
7. `contexto-rally` diferencia modo Nacional (24 h, C$, siglas locales, municipio real) vs Latam (28 h, USD, sin siglas locales, piloto modular replicable).
8. `sugerir-por-fase` valida cada sugerencia contra la rúbrica del certamen activo (`.agents/rules/rubricas-y-puntajes.md`).
9. `auditar-entregable` incluye `arsenal.py check-todo` (duración ≤ 120 s, coherencia de cifras, caracteres por campo) antes de SIRLI.
10. Ninguna task toca archivos protegidos del motor; verificar con `git diff --name-only` que solo cambian `skills/*/SKILL.md`.

---

### Task 1: orquestador — chequeo de guardia GPU antes de procesos pesados

**Files:**
- Modify: `skills/orquestador/SKILL.md` (añadir sección de guardia de recursos antes de despachar render/TTS/ffmpeg)

**Interfaces:**
- Consumes: `scripts/gpu_lock.py` (comando `run --owner <agente> --priority <baja|media|alta> -- <comando>`), `env.json` (tiers, caps).
- Produces: texto de SKILL.md con paso obligatorio de chequeo de guardia.

- [ ] **Step 1: Escribir el paso de guardia en SKILL.md**

Añadir a `skills/orquestador/SKILL.md`, tras la regla 4 del guardia, un paso obligatorio:

> Antes de despachar cualquier especialista que ejecute un binario pesado (render Blender headless, TTS con `gen_voice.py`, grabación web con Playwright, exportación ffmpeg), el director ejecuta:
> `python scripts/gpu_lock.py run --owner <especialista> --priority <alta|media|baja> -- <comando>`
> Nunca llamar a blender, ffmpeg ni TTS directo. Si el recurso está ocupado, el guardia bloquea y el director informa al usuario el tiempo estimado de cola. El PC puede ir cargado pero no debe colapsar: máximo 3 especialistas concurrentes (2 típico + 1 esperando).

- [ ] **Step 2: Verificar que solo se tocó skills/orquestador/SKILL.md**

Run: `git diff --name-only` (o `cmd /c git diff --name-only` en PowerShell de Windows)
Expected: solo `skills/orquestador/SKILL.md` aparece; ningún archivo del motor.

- [ ] **Step 3: Commit**

```bash
git add skills/orquestador/SKILL.md
git commit -m "docs(skill): orquestador añade chequeo de guardia GPU antes de procesos pesados"
```

---

### Task 2: proponer-retos — validar claims.json; reto y biblioteca se definen en el momento

**Files:**
- Modify: `skills/proponer-retos/SKILL.md` (añadir validación obligatoria de claims.json y no hardcodear reto/biblioteca)

**Interfaces:**
- Consumes: `research/claims.json`, `research/challenges.json`, `brief.json` (rally_type, categoría, ciudad).
- Produces: texto de SKILL.md con regla de validar claims y definir reto+biblioteca con el usuario en el momento.

- [ ] **Step 1: Escribir regla de validación de claims en SKILL.md**

Añadir a `skills/proponer-retos/SKILL.md`, en Procedimiento paso 2 o nueva regla:

> Antes de proponer un reto, validar que la cifra o precedente que se cite exista en `research/claims.json` (con fuente, URL y año). Si una cifra no está ahí, no se escribe como hecho: se describe el problema sin número o se marca como estimación.
>
> El reto a escoger y la biblioteca/tecnología a usar **no se saben de antemano**: se definen en el momento con el usuario, después de leer `brief.json` (certamen, categoría, ciudad) y `research/challenges.json`. No se hardcodea ningún reto ni ninguna biblioteca.

- [ ] **Step 2: Verificar que solo se tocó skills/proponer-retos/SKILL.md**

Run: `git diff --name-only`
Expected: solo `skills/proponer-retos/SKILL.md`.

- [ ] **Step 3: Commit**

```bash
git add skills/proponer-retos/SKILL.md
git commit -m "docs(skill): proponer-retos valida claims.json y define reto+biblioteca en el momento"
```

---

### Task 3: propuesta-diseno — instalar impeccable y frontend-design, preguntas de diseño al usuario

**Files:**
- Modify: `skills/propuesta-diseno/SKILL.md` (añadir requisito de instalar skills impeccable y frontend-design, y preguntas de diseño al usuario)

**Interfaces:**
- Consumes: `brand/logo.png`, `brand/palette.json`, `brand/tokens.css`, `scripts/gen_palette.py`, `PRODUCT.md`, `DESIGN.md`.
- Produces: texto de SKILL.md con pasos de instalación de skills y preguntas de diseño.

- [ ] **Step 1: Escribir requisitos de skills y preguntas de diseño en SKILL.md**

Añadir a `skills/propuesta-diseno/SKILL.md`, al inicio del Procedimiento o como nueva sección "Requisitos previos":

> **Requisitos previos (obligatorios):**
> - Instalar la skill `impeccable` (`npx skills add impeccable`) y la skill `frontend-design` (`npx skills add frontend-design`) antes de generar cualquier propuesta visual. Sin ambas skills instaladas, no se procede.
> - Hacer preguntas de diseño al usuario antes de proponer: nombre del proyecto, a qué se dedica, público, tono (sobrio / cálido / técnico), si ya hay logo o color obligatorio, y en qué dispositivo se verá principalmente. Nunca proponer sin estas respuestas.

- [ ] **Step 2: Verificar que solo se tocó skills/propuesta-diseno/SKILL.md**

Run: `git diff --name-only`
Expected: solo `skills/propuesta-diseno/SKILL.md`.

- [ ] **Step 3: Commit**

```bash
git add skills/propuesta-diseno/SKILL.md
git commit -m "docs(skill): propuesta-diseno exige impeccable y frontend-design y preguntas de diseño al usuario"
```

---

### Task 4: guiar-usuario — citar AGENTS.md y las 13 etapas del flujo

**Files:**
- Modify: `skills/guiar-usuario/SKILL.md` (añadir referencia explícita a AGENTS.md y tabla de 13 etapas)

**Interfaces:**
- Consumes: `AGENTS.md` (sección "El flujo (13 etapas)"), `brief.json`.
- Produces: texto de SKILL.md con referencia a AGENTS.md y 13 etapas.

- [ ] **Step 1: Escribir referencia a AGENTS.md y 13 etapas en SKILL.md**

Añadir a `skills/guiar-usuario/SKILL.md`, en Procedimiento o Reglas:

> Antes de guiar, leer `AGENTS.md` sección "El flujo (13 etapas)" (certamen → team → challenges → solution → impact → multi_ai → pautado → budget → resources → canvas → script → webdemo → timeline). Elegir la primera etapa incompleta y avanzar solo cuando la anterior esté completa. Nunca inventar datos para poder avanzar; si falta una respuesta, la etapa queda abierta y se pregunta al usuario.

- [ ] **Step 2: Verificar que solo se tocó skills/guiar-usuario/SKILL.md**

Run: `git diff --name-only`
Expected: solo `skills/guiar-usuario/SKILL.md`.

- [ ] **Step 3: Commit**

```bash
git add skills/guiar-usuario/SKILL.md
git commit -m "docs(skill): guiar-usuario cita AGENTS.md y las 13 etapas del flujo"
```

---

### Task 5: ingestar-investigacion — documentar reconstrucción del cerebro Graphify

**Files:**
- Modify: `skills/ingestar-investigacion/SKILL.md` (añadir paso de reconstrucción del cerebro Graphify)

**Interfaces:**
- Consumes: `brain/sync_corpus.py`, `graphify-out/`, `brain/corpus/`, `brain/README.md`.
- Produces: texto de SKILL.md con paso de reconstrucción del cerebro.

- [ ] **Step 1: Escribir paso de reconstrucción del cerebro en SKILL.md**

Añadir a `skills/ingestar-investigacion/SKILL.md`, al final del Procedimiento o como nueva sección:

> **Reconstruir el cerebro Graphify (cuando se añade nueva investigación al corpus):**
> 1. Colocar la nueva fuente en `brain/corpus/`.
> 2. Ejecutar `python brain/sync_corpus.py`.
> 3. Recompilar: `/graphify brain/corpus` (o regenerar `graphify-out/`).
> El cerebro guarda solo conocimiento de dominio (rúbricas, ganadores, retos, claims, patrones de pitch). Nunca guarda el motor, ni instrucciones de instalación, ni proyectos anteriores.

- [ ] **Step 2: Verificar que solo se tocó skills/ingestar-investigacion/SKILL.md**

Run: `git diff --name-only`
Expected: solo `skills/ingestar-investigacion/SKILL.md`.

- [ ] **Step 3: Commit**

```bash
git add skills/ingestar-investigacion/SKILL.md
git commit -m "docs(skill): ingestar-investigacion documenta reconstrucción del cerebro Graphify"
```

---

### Task 6: publicar-sitio — documentar despliegue en GitHub Pages

**Files:**
- Modify: `skills/publicar-sitio/SKILL.md` (añadir pasos de activación de GitHub Pages y Netlify)

**Interfaces:**
- Consumes: `.github/workflows/pages.yml`, `docs/INSTALACION_Y_DESPLIEGUE.md` (sección 8), `site/`, `brief.json` (site_url).
- Produces: texto de SKILL.md con pasos de GitHub Pages y Netlify.

- [ ] **Step 1: Escribir pasos de GitHub Pages y Netlify en SKILL.md**

Añadir a `skills/publicar-sitio/SKILL.md`, en Procedimiento paso 4 o nueva sección "Despliegue":

> **GitHub Pages:** activar en Settings → Pages → Source: GitHub Actions (workflow `.github/workflows/pages.yml` incluido en el repo). Luego commit y `git push` del `site/`.
>
> **Netlify:** instalar Netlify CLI, autenticarse, y correr `netlify deploy --prod --dir=site`.
>
> Si no hay credenciales listas, no pedir tokens: explicar los dos caminos en 4 líneas y dejar `site/` listo para que el usuario publique desde su cuenta. Escribir la URL resultante en `brief.json` (`site_url`) y servir al checklist (`--tab timeline --slot main`).

- [ ] **Step 2: Verificar que solo se tocó skills/publicar-sitio/SKILL.md**

Run: `git diff --name-only`
Expected: solo `skills/publicar-sitio/SKILL.md`.

- [ ] **Step 3: Commit**

```bash
git add skills/publicar-sitio/SKILL.md
git commit -m "docs(skill): publicar-sitio documenta despliegue en GitHub Pages y Netlify"
```

---

### Task 7: contexto-rally — diferenciar modo Nacional vs Latam

**Files:**
- Modify: `skills/contexto-rally/SKILL.md` (añadir distinción de modo rally_type Nacional/Latam)

**Interfaces:**
- Consumes: `brief.json` (`rally_type`), `.agents/rules/modos-rally.md`, `AGENTS.md` (modo de operación según rally_type).
- Produces: texto de SKILL.md con distinción Nacional (24 h, C$, siglas locales, municipio real) vs Latam (28 h, USD, sin siglas locales, piloto modular replicable).

- [ ] **Step 1: Escribir distinción Nacional vs Latam en SKILL.md**

Añadir a `skills/contexto-rally/SKILL.md`, en Reglas o como nueva sección "Modo del certamen":

> Confirmar `rally_type` en `brief.json` antes de leer cualquier fuente del otro certamen.
>
> - **Nacional (24 h):** municipio real de Nicaragua, eje del Plan Nacional de Lucha contra la Pobreza 2022–2026, presupuesto en córdobas (C$) con tasa del BCN declarada en `brief.json`, siglas locales (CNU, MINJUVE, TELCOR, INATEC, MEFCCA), Ciudades Creativas si aplica, ODS animados con la paleta del proyecto.
> - **Latam (28 h):** el municipio es laboratorio piloto (no el único destino), solución modular, paramétrica y replicable en toda América Latina, presupuesto en USD (sin C$ ni tasas locales), sin siglas gubernamentales locales, cierre del video: "piloto en [ciudad], replicable en toda América Latina".

- [ ] **Step 2: Verificar que solo se tocó skills/contexto-rally/SKILL.md**

Run: `git diff --name-only`
Expected: solo `skills/contexto-rally/SKILL.md`.

- [ ] **Step 3: Commit**

```bash
git add skills/contexto-rally/SKILL.md
git commit -m "docs(skill): contexto-rally diferencia modo Nacional (24h) vs Latam (28h)"
```

---

### Task 9: sugerir-por-fase — validar sugerencias contra la rúbrica del certamen activo

**Files:**
- Modify: `skills/sugerir-por-fase/SKILL.md` (añadir validación de cada sugerencia contra la rúbrica activa)

**Interfaces:**
- Consumes: `.agents/rules/rubricas-y-puntajes.md`, `GET http://localhost:8000/api/state`, `AGENTS.md`.
- Produces: texto de SKILL.md con regla de validar contra rúbrica antes de devolver sugerencias.

- [ ] **Step 1: Escribir regla de validación contra rúbrica en SKILL.md**

Añadir a `skills/sugerir-por-fase/SKILL.md`, tras el paso 3 o como nueva regla:

> Cada sugerencia debe validarse contra la rúbrica del certamen activo (`.agents/rules/rubricas-y-puntajes.md`) antes de devolverse: indicar el criterio de mayor peso que toca y por qué sube puntaje. Ninguna sugerencia se da sin esta validación. Si falta un dato de base, esa es la primera sugerencia: conseguirlo.

- [ ] **Step 2: Verificar que solo se tocó skills/sugerir-por-fase/SKILL.md**

Run: `git diff --name-only`
Expected: solo `skills/sugerir-por-fase/SKILL.md`.

- [ ] **Step 3: Commit**

```bash
git add skills/sugerir-por-fase/SKILL.md
git commit -m "docs(skill): sugerir-por-fase valida sugerencias contra la rúbrica del certamen activo"
```

---

### Task 10: auditar-entregable — incluir arsenal.py check-todo antes de SIRLI

**Files:**
- Modify: `skills/auditar-entregable/SKILL.md` (añadir paso obligatorio de `arsenal.py check-todo`)

**Interfaces:**
- Consumes: `python arsenal.py check-todo` (duración ≤ 120 s, coherencia de cifras, caracteres por campo), `.agents/rules/rubricas-y-puntajes.md`.
- Produces: texto de SKILL.md con paso de arsenal.py check-todo antes de SIRLI.

- [ ] **Step 1: Escribir paso de arsenal.py check-todo en SKILL.md**

Añadir a `skills/auditar-entregable/SKILL.md`, en Procedimiento o Reglas:

> Antes de dar un entregable como listo para SIRLI, ejecutar obligatoriamente:
> `python arsenal.py check-todo`
> (valida duración del video ≤ 120 s, coherencia de cifras entre guion y presupuesto, y caracteres por campo del pautado). Lo que falle vuelve a su especialista; el director no lo arregla a mano. Sin este check sin errores, no se sube a SIRLI.

- [ ] **Step 2: Verificar que solo se tocó skills/auditar-entregable/SKILL.md**

Run: `git diff --name-only`
Expected: solo `skills/auditar-entregable/SKILL.md`.

- [ ] **Step 3: Commit**

```bash
git add skills/auditar-entregable/SKILL.md
git commit -m "docs(skill): auditar-entregable incluye arsenal.py check-todo antes de SIRLI"
```

---

**Nota de ejecución:** Las 10 tasks son independientes (cada una edita un archivo SKILL.md distinto, sin tocar el motor). Se recomiendan ejecutar de forma **Native** (una misma sesión, commits separados por task) por ser cambios de documentación sin dependencias entre sí y bajo costo de error. Si se prefiere revisión independiente por task, usar **Subagent-driven**.
