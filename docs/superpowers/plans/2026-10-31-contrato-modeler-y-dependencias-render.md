# Contrato modeler (A) + dependencias render (E) + addons + calidad técnica — Plan

> Subagent-driven: cada tarea es un paso con test propio. Ejecutar en orden.

**Goal:** Rechazar tomas modeler sin contrato válido (rúbrica, `bom.csv`, dimensiones mm), bloquear render si `depends_on` no está `integrado`, exigir ficha técnica de calidad (tornillos, cables, tolerancias, colisiones), e instalar addon de Blender según tipo de proyecto (BlenderKit, Archimesh+MeasureIt, BlenderMCP con permiso). Anatomy = referencia de auditoría geométrica pre-render.

**Tech Stack:** Python 3.10+, PyYAML, csv, pathlib. Blender (headless) para addons.

**Files touch:** `scripts/build_shotlist.py`, `scripts/pre_render_check.py` (nuevo), `scripts/blender_addons.py` (nuevo), `skills/modelo-3d-blender/SKILL.md`, `tests/test_build_shotlist_modeler_contract.py` (nuevo), `tests/test_pre_render_check.py` (nuevo), `tests/test_blender_addons.py` (nuevo).

**Constraints:** stdlib + PyYAML solo. Si hay error, `build_shotlist.py` no escribe CSV. `pre_render_check.py` corre ANTES de `gpu_lock run -- blender`. BlenderMCP requiere permiso del director antes de instalar.

---

### Task 1: Contrato modeler + ficha técnica calidad (A)

**Modify:** `scripts/build_shotlist.py`
- En `cargar_shots()`, si `owner == "modeler"`:
  - falta `asset_id` → error `"falta asset_id (obligatorio para modeler)"`
  - `asset_id` no en `budget/bom.csv` → error `"asset_id '{id}' no existe en budget/bom.csv"`
  - fila de bom sin columnas `dim_*_mm` → error `"budget/bom.csv: '{asset_id}' carece de dim_*_mm"`
- Mensaje de error incluye ruta del YAML y campo.

**Test:** `tests/test_build_shotlist_modeler_contract.py` — toma modeler sin bom / sin dims / sin asset_id debe fallar compilación.

---

### Task 2: Guardia de dependencias antes del render (E)

**Create:** `scripts/pre_render_check.py`
- CLI: `python scripts/pre_render_check.py <shot_id>`
- Lee `script/shotlist.csv`; para cada `depends_on`:
  - dep no existe → error
  - dep `status != "integrado"` → error `"toma '{dep}' no entregada (status={status})"`
- Exit 0 si todo integrado; exit 1 con errores si no.

**Test:** `tests/test_pre_render_check.py`

---

### Task 3: Addons de Blender según tipo de proyecto (nuevo)

**Create:** `scripts/blender_addons.py`
- CLI: `python scripts/blender_addons.py --proyecto <tipo> --instalar`
- Detecta tipo por `brief.json` / solución:
  - producto/objeto técnico → **BlenderKit** (modelos existentes: tornillos, conectores, cables; buscar antes de modelar)
  - arquitectura/casa/módulo → **Archimesh + MeasureIt** (paredes reales, acotado mm)
  - control remoto por IA → **BlenderMCP** (solo con permiso del director; instalar solo si el usuario lo autoriza)
- Registra addon instalado en `blender/addons_instalados.json` (fecha, versión).
- Si ya instalado, no reinstala.

**Test:** `tests/test_blender_addons.py`

---

### Task 4: Actualizar skill de Blender

**Modify:** `skills/modelo-3d-blender/SKILL.md`
- Paso nuevo: compilar contratos (`build_shotlist.py`) antes de modelar.
- Paso nuevo: `pre_render_check.py <shot_id>` ok antes de abrir Blender / render.
- Ficha técnica exige: tipo y medida de cada tornillo (M3/M4/M5, largo, cabeza, posición x,y,z), cables (origen/destino, diámetro, holgura, borneras), tolerancias (holgura ≥0.5 mm entre piezas móviles), declaración de sin colisiones / sin superposición, dimensiones de `bom.csv`.
- Addon: ejecutar `blender_addons.py` antes de abrir Blender según tipo de proyecto.
- Anatomy: correr auditoría geométrica externa sobre la pieza antes del render `final` (verificar que nada atraviese nada).

---

**¿Confirmas para lanzar el subagent a ejecutar este plan (subagent-driven)?** Usaré deepseek-v4.1-flash. Si confirmas, despacho al subagent ahora.

<dcp-system-reminder>
Evaluate the conversation for compressible ranges.

If any messages are cleanly closed and unlikely to be needed again, use the compress tool on them.
If direction has shifted, compress earlier ranges that are now less relevant.

The goal is to filter noise and distill key information so context accumulation stays under control.
Keep active context uncompressed.

Compressed block context:
- Active compressed blocks in this session: 0 (none)
- If your selected compression range includes any listed block, include each required placeholder exactly once in the summary using `@b1@`.
</dcp-system-reminder>

@19@