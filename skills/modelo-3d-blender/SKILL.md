---
name: modelo-3d-blender
description: Genera modelos o renders 3D con Blender para el video, con ficha técnica previa justificada por la rúbrica y sin improvisación. Úsala solo para piezas 3D; nunca para texto, diagramas ni diseño plano.
---

# Modelo 3D con Blender

## Cuándo usarla

- Hay una toma con `owner: modeler` en `shots/*.yaml` / `script/shotlist.csv`.
- El guion necesita mostrar algo que no existe en fotografía.

**No la uses** para íconos, ilustraciones planas, diagramas ni mockups web.

## Procedimiento (en orden; sin saltar pasos)

1. **Confirma la toma**: lee tu fila (`rubric_item`, `quality_tier`, `depends_on`,
   duración en cámara). Sin `rubric_item` la pieza no se produce; si falta un
   dato, pregunta al director.
2. **Compila los contratos**: `python scripts/build_shotlist.py` debe escribir
   `script/shotlist.csv` sin errores. Si falla, corrige `shots/*.yaml` antes de modelar.
3. **Busca antes de modelar**: modelos CC0 (Poly Haven, Kenney) o del proyecto.
   Solo se modela lo que no existe o debe seguir el diseño propio con exactitud.
4. **Instala el addon** antes de abrir Blender:
   `python scripts/blender_addons.py --proyecto <tipo> --instalar`
   (producto → BlenderKit; arquitectura → Archimesh + MeasureIt; control IA →
   BlenderMCP solo con permiso). Queda en `blender/addons_instalados.json`.
5. **Escribe la ficha** `blender/ficha_<shot_id>.md` (protocolo abajo) y pide al
   director que la apruebe **antes** de reservar GPU. Sin ficha aprobada no se
   modela. Plazo: 30 min o el siguiente punto de control; si no responde, la
   pieza se aparca y se avisa. **Nunca** se autoaprueba.
6. **Toma el guardia** (solo con ficha aprobada):
   `python scripts/gpu_lock.py run --owner modeler_<pieza> --priority media -- <comando>`.
   Para ver sin tomar: `gpu_lock.py status`. Si está ocupado, espera; no fuerces.
7. **pre_render_check**: `python scripts/pre_render_check.py <shot_id>` debe salir
   0 (todas las `depends_on` en `integrado`) antes de abrir Blender o renderizar.
8. **Modela con script reproducible**, no a mano. `.blend` y script en `blender/`.
   Dimensiones desde `budget/bom.csv` (`dim_*_mm`): nada a ojo.
9. **Renderiza en el tier de la toma** (`env.json`; si no existe, `env.example.json`):
   `draft` EEVEE 50 % ≤5 min; `revisar` EEVEE 100 % ≤20 min; `final` Cycles solo
   pasado `caps.render_final_%` (~75 %) y con `hours_total` en `brief.json`.
   Si EEVEE falla o hay <4 GB de VRAM, usa Workbench o CPU en el mismo tier: la
   pieza no se cancela por un fallo de motor.
10. **Bucle de crítica (máx. 2 vueltas)**: render `revisar`, lista en la ficha qué
    no se lee en cámara y corrige. Si no convence, simplifica la toma o propón 2D.
11. **Aprobación antes del final**: solo con el humano conforme al encuadre de
    `revisar`. Sin respuesta no se lanza: se queda en `revisar` y se avisa.
12. **Auditoría geométrica**: antes del `final`, verifica en el `.blend` que nada
    atraviesa ni se superpone (colisiones, tornillos, cables sin recorrido) y corre
    `pre_render_check.py <shot_id>`. No existe script dedicado. Solo pasa si está limpia.
13. **Entrega**: salida en `dashboard/assets/` como
    `asset_<shotlist_id>_<descripcion>.<ext>`, servir a la ventana
    (`--tab resources --slot main`) y anotar minutos en `blender/horas_3d.csv`.

## Ficha técnica obligatoria (antes de modelar)

Sin ficha revisada, Blender no abre. La ficha existe por una toma y responde
un criterio de la rúbrica:

1. **Propósito**: shot_id, acto, duración en cámara, qué comunica y a qué `rubric_item` responde.
2. **Materiales antes de la geometría** (tabla pieza/material/por qué/costo relativo/color
   en cámara): definen rugosidad, reflejo, luz y polígonos. Elegirlos después es improvisar.
3. **Componentes y dimensiones de `budget/bom.csv`** (`dim_*_mm`, modelo real, sin
   inventar). Sin tecnología: decláralo.
4. **Tornillos**: M3/M4/M5, largo, cabeza y posición x,y,z. Ninguno sin medida.
5. **Cables**: origen, destino, diámetro, holgura, borneras y recorrido real.
6. **Tolerancias**: holgura ≥0.5 mm entre piezas móviles, con ubicación.
7. **Sin colisiones ni superposición**, verificado en la auditoría geométrica (paso 12).
8. **Interfaces físicas** (si aplica): tornillos, borneras, sub-carcasas y anclajes.
9. **Diseño para cámara**: encuadre, luz de 3 puntos, fondo, referencia de escala y qué
   no debe verse.
10. **Validación física mínima**: proporciones contra `bom.csv`, volumen y estabilidad
    plausibles, detalle proporcional a su tamaño en plano.
11. **Presupuesto por pieza**: tier de `env.json` (polígonos y minutos). Si no cabe, baja
    detalle o propón eliminar la pieza antes de empezar.

## Checklist de realismo (antes del render de `revisar`)

- **Escala**: referencia humana u objeto conocido en cuadro; proporciones de `bom.csv`.
- **Apoyo y gravedad**: nada flota; el centro de masa cae dentro de la base y la ficha
  dice dónde se apoya.
- **Sombras de contacto**: contacto visible entre piezas y con el suelo.
- **Materiales**: rugosidad y reflejo del material declarado (metal no parece plástico).
- **Lectura en 3 segundos**: si no se entiende qué es, se corrige el encuadre o se
  simplifica la geometría.

## Estimador de tiempo

Antes de reservar GPU, anota en la ficha: `minutos ≈ fotogramas × costo_por_fotograma +
modelado + correcciones`. Costo por tier: `draft` ≈2 s/fotograma, `revisar` ≈6 s, `final`
≈20 s (ajusta con la primera prueba real). Modelado: 20–40 min una pieza simple, 60–120 min
una protagonista. Si la suma supera `caps.max_3d_hours_total`, recorta detalle o elimina la
pieza antes de empezar, no a mitad del render.

## Jerarquía de assets (orden de decisión, no de gustos)

1. **Modelo existente** (CC0 / kit / modelo del proyecto): primera opción;
   cero GPU y sin apariencia genérica.
2. **Pieza protagonista que el kit no cubre**: modelado manual con ficha; es
   la pieza que sostiene el `rubric_item`, por eso sí merece horas.
3. **Nada de "relleno 3D"**: si una pieza no sostiene criterio de rúbrica ni
   la pide una toma, no se produce.

## Anexos 3D (bajo demanda)

- **Figuras didácticas**: la skill externa `anatomy` sirve para figuras humanas
  didácticas del video; ver `anexos-3d.md`. No tiene relación con la auditoría
  geométrica del paso 12.
- **Caja de herramientas 3D**: BlenderMCP, extensions, MPFB2, Rigify, glTF,
  Poly Haven y Geometry Nodes. No se instala todo: usa
  `python scripts/herramientas.py necesita "<tarea>"` e instala una sola con
  `--si`. BlenderMCP sigue desactivado hasta autorización. Nunca Tripo,
  Hyper3D ni Rodin.

Detalle completo: `anexos-3d.md` (mismo directorio).

## Reglas

- **Techo global de horas 3D**: `blender/horas_3d.csv` acumula minutos;
  `orchestrate.py status` los compara con `caps.max_3d_hours_total` de
  `env.json`. Al llegar al techo: bajar detalle o eliminar piezas. Nunca exceder.
- Un proceso pesado a la vez por recurso, garantizado por el guardia; nunca en
  paralelo con TTS, Playwright o ffmpeg si estos compiten por el mismo slot.
- Menos de 4 GB de VRAM (dato de `env.json`): dilo y propón alternativa 2D o
  una pieza de baja poligonización; no pongas en riesgo el cuelgue.
- Render final solo en su ventana del reloj (paso 9 del procedimiento).
- El MCP de Blender es opcional: pide permiso antes de instalarlo.

## Punteros

- Spec del sistema: `docs/superpowers/specs/2026-10-21-orquestacion-especialistas-design.md`.
- Guardia de recursos: `scripts/gpu_lock.py` (status / acquire / run / release).
- Tablero del equipo: `python scripts/orchestrate.py status`.
- Contrato de tomas: `shots/*.yaml` → `script/shotlist.csv`.
- Fuente única de lo físico: `budget/bom.csv`.
- Destino de renders: `dashboard/assets/`.
- Registro de horas 3D: `blender/horas_3d.csv`.
