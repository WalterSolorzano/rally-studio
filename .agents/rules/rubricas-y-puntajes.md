---
trigger: model_decision
description: Aplica al generar, revisar o puntuar cualquier entregable contra la rúbrica oficial de 100 puntos del certamen activo.
---

# Rúbricas y puntajes

Fuente única: `knowledge/rubric_matrices.md`. Este archivo no duplica ítems ni pesos.

## Qué usar según el certamen

| `rally_type` | Matriz | Cómo se audita |
|---|---|---|
| `latam` | 19 ítems oficiales, 30/20/20/20/10 | se puntúa ítem por ítem con el texto literal |
| `nacional` | **no verificada** | **no se puntúa**; se reporta «estimación sin rúbrica oficial» y se usa la lista de cobertura de la sección 2 |

Si llegan las bases del Nacional, se cargan en `rubric_matrices.md` como `[BASES]` y
esta tabla cambia a «verificada». No se completa con supuestos.

## Cómo revisar un entregable

1. Identifica el ítem de la matriz que el entregable alimenta.
2. Contrasta con el texto literal del ítem. Nombra el ítem incumplido, no "mejorable".
3. Propón la corrección concreta (texto, cifra, fuente).
4. Si falta un dato, **no lo inventes**: pídelo o márcalo como `[SIMULADO]`.

## Errores que restan de inmediato

Lista cerrada en `knowledge/rubric_matrices.md` §5. No se añaden causas «oficiales» que
las bases no digan.
