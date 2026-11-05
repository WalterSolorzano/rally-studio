---
name: proponer-retos
description: Genera soluciones aplicables para los retos que da el usuario, con precedentes ganadores, razonamiento problema-causa-insight-solución y dossier PDF. Úsala cuando el equipo ya tiene retos del comité y necesita propuestas sustentadas.
---

# Soluciones para retos

## 1. Misión

Para cada reto del comité, devolver **dos soluciones en ficha rápida** (no párrafos largos)
que pasen las nueve compuertas y el test de swap. Si una opción no pasa, se descarta y se
genera otra; nunca se maquilla la narrativa.

**Flujo.** Retos del comité → 2 fichas por reto → selección del equipo → dossier PDF
(`gen_dossier.py`).

**Banco interno.** Retos de `research/challenges.json` / `brain/corpus/retos.md`; precedentes
de `knowledge/retos_razonamiento.json` y `research/sirli/winners.jsonl`. **No se inventan
retos ni casos desde la memoria.** Doctrina: `dossier-soluciones/SKILL.md`. Antes de generar,
lee `references/goal.md` y `references/anti-generico.md`.

## 2. Regla dura

**Este sistema no crea retos.** El comité entrega los retos; la skill propone **soluciones**. Si no hay retos, pídelos o impórtalos; no inventes. Si te falta `rally_type`, pregunta antes de generar.

## 3. Cuándo usarla

- El usuario tiene los retos del comité y pide ideas de solución.
- Quiere un dossier PDF para deliberar con el equipo.
- Pide reformular una solución existente con otro enfoque.

## 4. Goal jerárquico

Orden estricto; si dos reglas compiten, gana la de arriba:

1. **Misión (北极星).** Dos fichas rápidas concretas por reto que pasen las nueve compuertas y el test de swap; ficha = lectura rápida del equipo.
2. **Banco interno como única fuente.** Retos del banco del usuario; precedentes solo de `knowledge/retos_razonamiento.json` o `research/sirli/winners.jsonl`. Dato fuera del banco → `por validar con el equipo`.
3. **Compuertas duras.** Las nueve de `dossier-soluciones` + test de swap + FORBIDDEN_PHRASES. Cualquier celda `RECHAZA` elimina la opción — sin negociación.
4. **No invención.** Cifras, precios, beneficiarios y precedentes solo de `research/claims.json`, `knowledge/retos_razonamiento.json` o `knowledge/ERRATAS.md`; lo demás `por validar con el equipo`.
5. **No herencia.** Ningún dossier o JSON anterior es fuente de verdad: escenas, objetos, costos, ODS, insignias y precedentes no se heredan.
6. **Operación.** El motor (`soluciones_motor.py`) genera, la skill aplica compuertas y devuelve fichas. El PDF se maqueta con `gen_dossier.py` solo para las opciones seleccionadas; la skill **no** edita CSS ni diseño.

El detalle del goal y el sistema de razonamiento forzado están en `references/goal.md`. Es **obligatorio** cargarlo antes de generar.

## 5. Procedimiento

1. **Precondición**: lee `brief.json`. Si falta `rally_type`, `equipo`, `ciudad` o `categoria`, pregunta antes de generar.
2. **Asegura el banco de retos** (del banco interno, no inventados):
    - Usa únicamente el archivo entregado por el usuario o comité, pasado explícitamente con
       `--retos-json <archivo>`. El historial de `research/` y `brain/` no es un banco activo.
    - Si el comité está en `brain/corpus/retos.md`: `python scripts/soluciones_motor.py
       --importar-brain --retos-json research/challenges.json`; luego ejecuta el motor otra
       vez pasando ese archivo con `--retos-json`.
    - Sin fuente explícita, pide el texto de los retos. No los redactes tú.
3. **Carga el goal**: lee `references/goal.md` y `references/anti-generico.md` antes de
   invocar el motor; sin ellos produce propuestas genéricas con la versión vieja.
4. **Genera el JSON de soluciones**:
   ```bash
    python scripts/soluciones_motor.py --todos --retos-json <retos_entregados.json> --certamen nacional --grafo \
     --json docs/_build/soluciones.json
   ```
    Para un solo reto: `--reto DESAFIO_01 --retos-json <retos_entregados.json> --certamen latam`.
   Categoría forzada (solo si el usuario la conoce): `--categoria social|tecnologica|procesos`
   (Nacional) o `--categoria innovacion|impacto_social` (Latam).
5. **Chain-of-thought antes de redactar**: por cada opción, escribe en
   `docs/_build/razonamiento_<certamen>.md` las 8 preguntas del goal (enunciado, actor,
   objeto, causa raíz, insight, mecanismo, métrica física, pagador con línea). **No inventes
   datos**: si una pregunta no se responde con el enunciado o el banco, la opción queda
   `RECHAZADA`.
6. **Compuerta de contenido**: corre las nueve compuertas de `dossier-soluciones` + test de
   swap + `FORBIDDEN_PHRASES` (`references/anti-generico.md`). Cualquier celda `RECHAZA`
   elimina la opción: se genera otra, no se baja el estándar.
   - **Lectura cuidadosa del término del enunciado** (smell #11): subraya objeto, actor,
     territorio y escala exactos del enunciado. Problema vecino («domésticos» → «de molinos»)
     = `RECHAZADA` en la compuerta 1 de Encaje literal.
   - **Baneos adicionales** (secciones 1.4b/1.4c de `anti-generico.md`): reacondicionamiento,
     cambio de pieza, testeo de usados, teléfonos y hardware donado como núcleo → `RECHAZADA`;
     se replantea transformando el recurso, no restaurándolo.
7. **Búsqueda de tecnologías nuevas** (`references/goal.md` §6b): búsqueda activa (no de
   memoria) de tecnologías, papers o casos recientes que aporten un mecanismo nuevo. Si aporta
   con URL y año → campo opcional `Mecanismo nuevo`; si no → se omite. Nunca inventes
   tecnologías: solo las de una fuente abrible.
8. **Devuelve las fichas en el chat** (formato `references/ficha-y-cascada.md` §2). No
   maquetes el PDF: el equipo revisa y selecciona primero.
9. **Si el equipo selecciona opciones**: genera el PDF solo con las seleccionadas:
   ```bash
   python scripts/gen_soluciones_pdf.py --json docs/_build/soluciones_seleccionadas.json \
     --out docs/Dossier_Soluciones_<certamen>.pdf
   ```
   Entrega la ruta; no pegues el JSON crudo en el chat.
   **Rechazo total del PDF** → ley de `dossier-soluciones/SKILL.md` «Ley de rechazo total»:
   borrar todas las soluciones, archivar baneadas solo si el usuario lo pide, regenerar
   desde cero sin leer archivos viejos.
10. **Auto-auditoría**: corre `scripts/check_anti_generico.py` sobre el JSON y luego el
    checklist de `references/anti-generico.md` ("Auto-auditoría antes de entregar"). Si algo
    falla, la opción vuelve al paso 5 — no se entrega con fallas.

## 6. Compuertas en cascada (anti-genérico)

Cascada completa: `references/ficha-y-cascada.md` §1. Doctrina de cada compuerta:
`dossier-soluciones/SKILL.md`.

## 7. Formato de cada solución (ficha rápida en chat)

Plantilla, reglas y "lo que NO va": `references/ficha-y-cascada.md` §2. Ficha compacta
<1 min, una opción por bloque, cada número con fuente; narrativa solo al dossier PDF.

## 8. Qué no hacer

Lista completa: `references/ficha-y-cascada.md` §3. Nunca inventar retos o cifras desde la
memoria, publicar sin pasar compuertas ni heredar de versiones anteriores.

## 9. Punteros

- Motor: `scripts/soluciones_motor.py` · PDF: `scripts/gen_soluciones_pdf.py` + `docs/assets/soluciones.css`
- Casos: `knowledge/retos_razonamiento.json` · Erratas: `knowledge/ERRATAS.md` · Ganadores: `research/sirli/winners.jsonl`
- Doctrina completa: `skills/dossier-soluciones/SKILL.md`
- **Goal maestro**: `references/goal.md` · **Detector anti-genérico**: `references/anti-generico.md`
- **Ficha, cascada y qué no hacer**: `references/ficha-y-cascada.md`
- Cerebro: `brain/corpus/retos.md` · Rúbricas: `.agents/rules/rubricas-y-puntajes.md` · Docs: `docs/MOTOR_SOLUCIONES.md`

## 10. Calibrar la compuerta

Antes de confiar en la cascada, pásale una solución que ya sabes que no sirve (de un dossier
anterior o descartada): debe devolver `RECHAZADA` con motivo. Si la aprueba, falta un campo o
una regla está floja. No se calibra con el caso que estás escribiendo, sino con uno que ya falló.
