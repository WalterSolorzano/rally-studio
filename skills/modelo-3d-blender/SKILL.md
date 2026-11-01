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

1. **Confirma la toma**: lee tu fila (toma, acto, duración en cámara,
   `rubric_item`, `quality_tier`, `depends_on`). Si falta algún dato,
   pregunta al director y no inventes nada. Sin `rubric_item`, la pieza
   no se produce.
2. **Compila los contratos**: ejecuta `python scripts/build_shotlist.py`.
   Debe terminar sin errores y escribir `script/shotlist.csv`. Con errores
   no hay CSV ni modelo: corrige los YAML de `shots/` y vuelve a compilar
   antes de modelar.
3. **Busca antes de modelar**: revisa primero modelos existentes (bibliotecas
   CC0 tipo Poly Haven o Kenney, repositorios abiertos, o modelos que el propio
   proyecto aporte). Solo se modela lo que no se encontró o que debe seguir el
   diseño propio con exactitud.
4. **Instala el addon según el tipo de proyecto** (antes de abrir Blender):
   ```bash
   python scripts/blender_addons.py --proyecto <tipo> --instalar
   ```
   producto/objeto técnico → BlenderKit; arquitectura/casa/módulo →
   Archimesh + MeasureIt; control remoto IA → BlenderMCP (solo con permiso
   del director). Queda registrado en `blender/addons_instalados.json`.
5. **Toma el guardia de recursos** (obligatorio; nada directo):
   ```bash
   python scripts/gpu_lock.py run --owner modeler_<pieza> --priority media -- <comando>
   ```
   Para chequear sin tomar: `python scripts/gpu_lock.py status`.
   Desde un script Python: `from gpu_lock import acquire, release`.
   Si el recurso está ocupado, espera; no fuerce nada.
6. **Escribe la ficha técnica** `blender/ficha_<shot_id>.md` (protocolo abajo)
   y pide al director que la revise antes de abrir Blender.
7. **pre_render_check antes de Blender / render**: ejecuta
   ```bash
   python scripts/pre_render_check.py <shot_id>
   ```
   Debe salir con código 0 (todas las `depends_on` en `integrado`) antes de
   abrir Blender o lanzar cualquier render.
8. **Modela con script reproducible** (no a mano en la interfaz). Deja el
   `.blend` y el script en `blender/`. Las dimensiones salen de
   `budget/bom.csv` (`dim_*_mm`): nada se dimensiona a ojo.
9. **Renderiza en el tier de la toma**, leyendo `env.json`:
   - `draft`: EEVEE, 50 %, ≤ 5 min (exploración descartable).
   - `revisar` (tier de aprobación): EEVEE, 100 %, ≤ 20 min.
   - `final` (Cycles): solo cuando el reloj del rally pasó el
     `caps.render_final_%` (~75 % del tiempo transcurrido) y con
     `hours_total` definido en `brief.json`. Sin proyecto: no existe.
10. **Aprobación antes del final**: solo con el humano conforme al encuadre de
    `revisar` se lanza el `final`.
11. **Auditoría geométrica (Anatomy)**: antes del render `final`, corre la
    auditoría geométrica externa sobre la pieza y verifica que nada atraviese
    nada (sin colisiones ni superposiciones). Solo pasa a `final` si está limpia.
12. **Entrega**: guarda la salida en `dashboard/assets/` como
    `asset_<shotlist_id>_<descripcion>.<ext>`, sírvela a la ventana
    (`--tab resources --slot main`) y anota los minutos en
    `blender/horas_3d.csv` (columnas: fecha, shot_id, minutos).

## Ficha técnica obligatoria (antes de modelar)

Sin ficha revisada, Blender no abre. La ficha existe por una toma y responde
un criterio de la rúbrica:

1. **Propósito**: shot_id, acto, duración en cámara, qué debe comunicar la
   pieza y a qué `rubric_item` responde.
2. **Materiales ANTES de la geometría** (tabla: pieza / material / por qué /
   costo relativo / color en cámara). El material define rugosidad, reflejo,
   cómo recibe la luz y cuánta poligonización basta. Elegir material después
   de modelar es improvisación: prohibido.
3. **Componentes reales y dimensiones de bom.csv**: si la pieza lleva tecnología,
   los componentes concretos y sus medidas salen de `budget/bom.csv`
   (`dim_*_mm`; nombre o modelo real, sin inventar). Ningún cubo sin identidad.
   Si la pieza no lleva tecnología, decláralo explícito en la ficha.
4. **Tornillos**: tipo y medida de cada tornillo (M3 / M4 / M5, largo, tipo de
   cabeza, posición x,y,z). Ningún tornillo sin medida ni posición declarada.
5. **Cables**: origen y destino, diámetro, holgura y borneras de cada cable;
   espacio real para su recorrido.
6. **Tolerancias**: holgura ≥ 0.5 mm entre piezas móviles; declare cada
   holgura y su ubicación.
7. **Sin colisiones / sin superposición**: declaración expresa de que ninguna
   pieza atraviesa ni se superpone a otra (verificar con la auditoría Anatomy
   antes del render `final`).
8. **Interfaces físicas** (si el equipo lo pide por la naturaleza del proyecto):
   posición y material de cada tornillo, bornera, sub-carcasa, anclaje a la
   estructura.
9. **Diseño para cámara**: encuadre previsto, luz de 3 puntos, fondo, algo de
   referencia de escala, y qué no debe verse en el cuadro.
10. **Validación física mínima**: proporciones contrastadas contra las
    dimensiones del `bom.csv`; volumen y estabilidad plausibles (nada flota ni
    atraviesa paredes); detalle proporcional a su tamaño en el plano.
11. **Presupuesto por pieza**: tier y límites de `env.json` (poligonización
    objetivo, minutos máximos del tier). Si la pieza no cabe en su presupuesto:
    baja poligonización o propón eliminar la pieza al director.

## Jerarquía de assets (orden de decisión, no de gustos)

1. **Modelo existente** (CC0 / kit / modelo del proyecto): primera opción;
   cero GPU y sin apariencia genérica.
2. **Pieza protagonista que el kit no cubre**: modelado manual con ficha; es
   la pieza que sostiene el `rubric_item`, por eso sí merece horas.
3. **Nada de "relleno 3D"**: si una pieza no sostiene criterio de rúbrica ni
   la pide una toma, no se produce.

## Recursos de video explicativos (Anatomy)

**Anatomy** (`wheresryan22/anatomy`) es una skill para construir figuras
técnicas isométricas (SVG, WebGL, 3D) que explican cómo funciona una pieza,
mecanismo o proceso. Úsala como **recurso de video** cuando el guion necesite
mostrar algo que no se entiende solo con el render de Blender (ensamblaje,
flujo interno, diagrama de conexiones, sección de una carcasa).

- **Quién la usa:** el agente que despliega todo (director / orquestador) o el
  modeler, para generar recursos explicativos antes del render final de Blender.
- **Qué hace:** inventa un objeto físico cuya *forma es el concepto*, lo dibuja
  en partes sólidas y shadeadas, lo pone en movimiento suave bajo el cursor, y
  ejecuta su **propia auditoría geométrica** (`kit/audit.mjs`) para certificar
  que ninguna pieza atraviesa otra y que todo está bien ensamblado.
- **Instalación:** `npx skills add wheresryan22/anatomy` (no hay dependencias,
  solo Node.js).
- **Uso:** `/anatomy explain <idea que debe explicar el video>`.
- **Salida:** HTML autónomo, SVG suelto o componente React; apto para insertar
  en el video pitch como recurso explicativo.

Anatomy complementa a Blender, no lo reemplaza: Blender para el modelo 3D
fotorealista del producto; Anatomy para la figura didáctica que explica cómo
funciona.

## Reglas

- **Techo global de horas 3D**: `blender/horas_3d.csv` acumula minutos;
  `orchestrate.py status` los compara con `caps.max_3d_hours_total` de
  `env.json`. Al llegar al techo: bajar detalle o eliminar piezas. Nunca exceder.
- Un proceso pesado a la vez por recurso, garantizado por el guardia; nunca en
  paralelo con TTS, Playwright o ffmpeg si estos compiten por el mismo slot.
- Menos de 4 GB de VRAM (dato de `env.json`): dilo y propón alternativa 2D o
  una pieza de baja poligonización; no pongas en riesgo el cuelgue.
- Render final solo en su ventana del reloj (D7, paso 7 del procedimiento).
- El MCP de Blender es opcional: pide permiso antes de instalarlo.

## Punteros

- Spec del sistema: `docs/superpowers/specs/2026-10-21-orquestacion-especialistas-design.md`.
- Guardia de recursos: `scripts/gpu_lock.py` (status / acquire / run / release).
- Tablero del equipo: `python scripts/orchestrate.py status`.
- Contrato de tomas: `shots/*.yaml` → `script/shotlist.csv`.
- Fuente única de lo físico: `budget/bom.csv`.
- Destino de renders: `dashboard/assets/`.
- Registro de horas 3D: `blender/horas_3d.csv`.
