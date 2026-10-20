---
name: modelo-3d-blender
description: Genera modelos o renders 3D con Blender para el video del proyecto, siempre que el usuario lo pida explícitamente y con una referencia visual. Úsala solo para piezas 3D, nunca para texto ni diseño plano.
---

# Modelo 3D con Blender

## Cuándo usarla

- El usuario pide un modelo, una animación o un render 3D para el video.
- El guion necesita mostrar un objeto que no existe en fotografía.

**No la uses** para íconos, ilustraciones planas, diagramas ni mockups web.

## Procedimiento

1. Confirma el pedido y consigue la referencia: una imagen, un boceto o una descripción con
   proporciones y materiales. Sin referencia, pide una antes de modelar.
2. Comprueba que no hay otro proceso pesado corriendo:

```bash
python scripts/render_watch.py
```

   Si hay un render o un TTS activo, espera o pregunta. **Un proceso GPU a la vez.**
3. Modela en Blender headless con un script reproducible en `scripts/` (no a mano en la
   interfaz). Deja el `.blend` y el script versionados.
4. Renderiza primero en baja resolución para revisar encuadre y materiales.
5. Solo cuando el usuario apruebe el encuadre, lanza el render final.
6. Guarda la salida en `dashboard/assets/` con el nombre `asset_<shotlist_id>_<descripcion>.<ext>`
   y sírvela a la ventana (`--tab resources --slot main`).

## Jerarquía de assets (antes de modelar)

1. **Prop de fondo** (café, vegetación, mobiliario, herramientas): primero Poly Haven (CC0),
   Kenney (CC0) o BlenderKit. Son assets reales, sin GPU y sin aspecto IA.
2. **Prop específico que no existe en CC0**: image-to-3D (TripoSR o TRELLIS.2 vía Spaces)
   **solo** para fondo. Nunca para la pieza que el jurado evalúa.
3. **Pieza protagonista** (compuerta, sensor, biofiltro, mecanismo): modelado manual.
   El jurado evalúa viabilidad técnica; una pieza IA se percibe como truco.

## Reglas

- No renderices en resolución final antes de que el equipo esté cerca de cerrar el video
  (regla del repo: nunca antes de T-2h).
- Un proceso de render a la vez; nunca en paralelo con TTS, Playwright o ffmpeg.
- Si el equipo no tiene GPU suficiente (menos de 4 GB de VRAM), dilo y propón alternativa
  2D o un modelo de baja poligonización.
- **Presupuesto de render**: si un frame tarda más de 5 s o la animación completa supera
  20 min en Cycles 1080p, baja muestras, resolución o elimina el 3D. Un render largo no
  aporta comprensión y consume horas de rally.
- El MCP de Blender es opcional y no se instala solo: si hace falta, pide permiso.

## Punteros

- Vigilante de procesos: `scripts/render_watch.py`.
- Convención de assets: `script/shotlist.csv`.
- Destino: `dashboard/assets/`.
- Registro de licencias y versiones: `arsenal.lock.yaml`.
