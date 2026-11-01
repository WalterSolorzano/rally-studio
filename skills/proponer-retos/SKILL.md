---
name: proponer-retos
description: Genera soluciones aplicables para los retos que da el usuario, con precedentes ganadores, razonamiento problema-causa-insight-solución y dossier PDF. Úsala cuando el equipo ya tiene retos del comité y necesita propuestas sustentadas.
---

# Soluciones para retos

## Regla dura

**Este sistema no crea retos.** El usuario o el comité entregan los retos; la skill
propone **soluciones** para esos retos. Si no hay retos, pídelos o impórtalos; no inventes.

## Cuándo usarla

- El usuario tiene los retos del comité y pide ideas de solución.
- Quiere un dossier PDF para deliberar con el equipo.
- Pide reformular una solución existente con otro enfoque.

## Procedimiento

1. Lee `brief.json`: `rally_type` (`nacional` 24 h o `latam` 28 h), categoría, ciudad y equipo.
   Si falta el certamen, pregúntalo antes de generar.
2. Asegura el banco de retos:
   - Si `research/challenges.json` tiene retos, úsalo.
   - Si está vacío y existen los retos del comité en `brain/corpus/retos.md`:
     `python scripts/soluciones_motor.py --importar-brain`
   - Si no hay ninguna fuente, pide al usuario el texto de los retos. No los redactes tú.
3. Genera el JSON de soluciones:
   ```bash
   python scripts/soluciones_motor.py --todos --certamen nacional --grafo \
     --json docs/_build/soluciones.json
   ```
   Para un solo reto: `--reto DESAFIO_01 --certamen latam`.
   Categoría forzada (solo si el usuario la conoce): `--categoria social|tecnologica|procesos`
   (Nacional) o `--categoria innovacion|impacto_social` (Latam).
4. Genera el PDF:
   ```bash
   python scripts/gen_soluciones_pdf.py --json docs/_build/soluciones.json \
     --out docs/Dossier_Soluciones_<certamen>.pdf
   ```
   Entrega la ruta del PDF. No pegues el JSON crudo en el chat.
5. Revisa el resultado antes de entregarlo:
   - Cada solución debe traer cadena de razonamiento (problema → causa raíz → insight →
     solución → métrica) y un precedente con año, equipo y proyecto.
   - **Dos soluciones por reto**, con mecanismo distinto e independiente (no "fase 2").
   - Cada solución trae su párrafo «En la práctica»: quién lo opera, quién paga, de dónde
     salen insumos y equipos.
   - Antes de citar año, rally, equipo o puesto, contrasta con `knowledge/ERRATAS.md`.
   - Si una ruta es `exploratoria`, dilo: no hay precedente directo y debe validarse.
   - Las cifras de impacto solo aparecen si tienen fuente en el corpus.
   - La categoría debe estar justificada, no asumida.

La doctrina completa (análisis sistémico, familias de mecanismos, pruebas de descarte,
banderas de riesgo y anatomía del dossier) vive en `skills/dossier-soluciones/SKILL.md`.
Esta skill solo opera el motor.

## Qué no hacer

- **Nunca** propongas retos nuevos ni reformules el enunciado del comité.
- **Nunca** incluyas una sección de «lo que el jurado va a atacar»: no hay réplica. El
  riesgo se escribe como bandera con la condición que lo resuelve.
- **Nunca** muestres estadísticas internas (saturación, score, probabilidad de victoria).
  Solo datos de impacto con fuente para vender la idea.
- **Nunca** inventes cifras, precios, beneficiarios ni precedentes.
- No prometas que una solución "gana": presenta la ruta y su evidencia.
- No entregues soluciones genéricas sin caso, sin causa raíz o sin métrica.

## Formato de cada solución

| Campo | Contenido |
|---|---|
| Título | Solución concreta, no el nombre del reto |
| Concepto | Qué se construye y por qué funciona |
| Cadena | Problema → causa raíz → insight → solución → métrica |
| Precedente | Año, equipo, proyecto, puesto, video |
| Impacto | Dato + fuente; si no hay, "por validar con el equipo" |
| Recursos | Componentes y materiales detectados |
| Rúbrica | Criterio principal y secundario con puntos |
| Bandera de riesgo | La bandera y la condición que la resuelve |
| En la práctica | Quién opera, quién paga, insumos, arranque (350–450 caracteres) |
| Pitch | Una frase para el video |

## Punteros

- Motor: `scripts/soluciones_motor.py`
- PDF: `scripts/gen_soluciones_pdf.py` + `docs/assets/soluciones.css`
- Casos: `knowledge/retos_razonamiento.json`
- Erratas y fechas: `knowledge/ERRATAS.md`
- Doctrina: `skills/dossier-soluciones/SKILL.md`
- Ganadores: `research/sirli/winners.jsonl`, `knowledge/winners_analysis.md`
- Cerebro: `brain/corpus/retos.md`, `graphify-out/graph.json`
- Rúbricas: `.agents/rules/rubricas-y-puntajes.md`
- Documentación: `docs/MOTOR_SOLUCIONES.md`
