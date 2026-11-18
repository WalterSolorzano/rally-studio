---
trigger: model_decision
description: Aplica cuando una tarea implica escribir una sección del estado del proyecto desde el agente o desde un script, y cuando el servidor responde 423.
---

# Escribir una sección exige candado

Regla dura. Sirve para que dos personas (o una persona y un agente) no se pisen una sección.

## El orden, siempre el mismo

1. `POST /api/sections/<key>/lock` con el `actor_id` que va a escribir.
2. `POST /api/sections/<key>` con `data` y `base_version` (la versión que se leyó).
3. `POST /api/sections/<key>/unlock` al terminar.

## Si el candado responde 423

**No escribes.** No reinterpretas la sección, no la reescribes desde cero, no cambias el
`actor_id` para esquivar el bloqueo, no la fuerzas por otra vía (SQL directo, edición del
archivo, `import_state`).

Avisas al humano: quién tiene el candado, hasta cuándo, y qué querías cambiar. El que la
está editando decide si te la cede.

## Si el candado responde 409

La versión cambió mientras trabajabas. Vuelves a leer, rehaces el cambio sobre la versión
nueva y lo intentas otra vez. Nunca pisas a ciegas.

## Excepciones

- `dashboard/section_sync.js` ya hace este ciclo; no lo repitas a mano en la ventana.
- `handle_post_state`, `import_state` y las claves `NO_LOCK` (`active_tab`, `_sync_ts`,
  `authorship`, `active_locks`) no llevan candado: son estado local de la ventana, no
  contenido del entregable.
- Para proponer contenido sin escribir estado usa el buzón:
  `python scripts/servir_propuesta.py ...`. La ventana lo muestra como Aceptar / Descartar.
