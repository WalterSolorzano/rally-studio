---
trigger: model_decision
description: Aplica cuando la tarea produce o revisa una pantalla, un HTML o una pieza servida a la ventana, y hay que decidir qué texto, iconos o datos se ven.
---

# Ley de interfaz mínima

Aplica a **toda** interfaz del repositorio: `dashboard/`, `site/`, `dossier_preview.html`,
`stats.html`, `graph.html`, `join.html`, `admin.html` y cualquier HTML que produzca una skill
(`script/teleprompter.html`, `docs/storyboard_visual.html`, propuestas servidas a la ventana).

## La ley

1. **Ni un párrafo.** Una interfaz no explica, muestra. Si hace falta una frase para que se
   entienda, la interfaz está mal. Máximo: una etiqueta de una o dos palabras.
2. **Nada de datos técnicos visibles.** Rutas, nombres de variables, nombres de archivo,
   versiones, ids internos, siglas del motor (`shotlist.csv`, `PAUTADO_MIN`, `state.json`,
   `dim_*_mm`) no salen en pantalla. Van en `title`, en `data-*` o en logs.
3. **Icono antes que palabra.** Si un icono se entiende, no lleva texto. Si no se entiende,
   lleva una palabra, nunca una oración. Todo icono tiene `title` y `aria-label`.
4. **Número solo si se usa para decidir.** Un cronómetro, una diferencia de segundos o un
   porcentaje de movimiento se quedan porque accionan una decisión. Un conteo de líneas de
   código, no.
5. **Sin emojis como iconos.** SVG en línea, trazo `currentColor`, 16–18 px.
6. **Prohibido el texto de estado largo.** `"Tomas fijas de más de 2.5 s: S06"` se convierte en
   un icono de alerta + `S06` + `3.2 s`. El detalle vive en `title`.
7. **Cero texto de ayuda permanente.** Si hace falta ayuda, va detrás de un icono de
   información que se abre y se cierra.

## Prueba de aceptación

Antes de dar por buena una pantalla:

- Cuenta los párrafos. Debe ser **0**.
- Cuenta las palabras de UI que no son nombres propios ni unidades. Cada una debe justificar
  su existencia contra el punto 3.
- Revisa que ningún `title` esté vacío en un icono.
- A 390 px de ancho no debe aparecer scroll horizontal ni texto cortado.

## Dónde NO aplica

- `docs/*.md`, pautado, guion, presupuesto: son documentos, no interfaces.
- Mensajes de error de CLI (`scripts/*.py`): el usuario que los lee es un agente.
- `title` y `aria-label`: ahí sí se explica, porque no ocupa pantalla.
