# Cómo crear modelos 3D (referencia)

## Primero, la pregunta que ahorra la GPU

¿El volumen se puede resolver con CSS y `var()`? Si es un mockup, un halo, un anillo
o un fondo con perspectiva: **sí**. Usa `skills/_comun/recetas-visuales.md` y no
abras Blender. Blender para un brillo de pantalla es tiempo robado al rally.

## Cuándo sí es Blender

La pieza es un objeto físico que el jurado debe reconocer (equipo, prototipo,
contenedor), tiene dimensiones reales y aparece de verdad en el video o en la
landing. Entonces se sigue `skills/modelo-3d-blender/SKILL.md`:

1. Ficha técnica aprobada por el humano antes de encender la GPU: qué es, medidas de
   `budget/bom.csv` o del reto, material, ángulo del render, formato de salida.
2. `scripts/render_watch.py` antes de lanzar: un proceso GPU a la vez, `gpu_lock`
   tomado.
3. Modelo reproducible por script, no modelado a mano: el `.py` vive junto al `.blend`
   para poder regenerarlo.
4. Auditoría geométrica: malla cerrada, escala en metros, cero caras sueltas.
5. Entrega en `dashboard/assets/` con `asset_<shotlist_id>_<descripcion>.<ext>`.

## Reemplazos

| En vez de | Usa |
|---|---|
| Render de una esfera para un dato | `esfera-volumetrica.css` |
| Render de un teléfono | `bisel-dispositivo.css` |
| Render de un suelo | `planos-horizonte.css` |
| Render de un aro de avance | `anillo-progreso.css` |
| Render de un fondo con niebla | `halo-suave.css` + `capas-atmosfera.css` |

Prohibido: Tripo, Hyper3D y Rodin (malla por IA con licencia y coste inciertos).
`blender-mcp` queda desactivado hasta autorización explícita.
