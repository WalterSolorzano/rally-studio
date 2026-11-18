---
name: modelo-3d-blender
description: Genera modelos o renders 3D con Blender para el video, con ficha técnica previa justificada por la rúbrica y sin improvisación. Úsala solo para piezas 3D; nunca para texto, diagramas ni diseño plano.
---

# El Quemador de Tostadas — Modelo 3D con Blender

## Cuándo usarla

- Hay una toma con `owner: modeler` en `shots/*.yaml` / `script/shotlist.csv`.
- El guion necesita mostrar algo que no existe en fotografía.

**No la uses** para íconos, ilustraciones planas, diagramas ni mockups web.

## Antes de modelar: jerarquía de restricciones

Cuando dos fuentes de medidas se contradicen, no se promedia ni se elige la más
cómoda. Se ordena así:

1. **Restricción dura**: lo que no puede encogerse (un componente comprado con
   tamaño real, la boca de una sirena, el diámetro de una batería, la mano que
   lo va a abrir). Manda.
2. **Medida de referencia**: medidas de catálogo, cajas IP65 genéricas, planos de
   proveedor. Son punto de partida para costear, **no** obligación geométrica.
3. **Conveniencia narrativa**: lo que queda bien en cámara. Se cede primero.

La carcasa se **deriva del contenido**, no al revés: se suman los volúmenes
reales, se añade holgura (≥0.5 mm pieza móvil, ≥2 mm pared a componente) y de ahí
sale la envolvente. Si la ficha dice "caja de 158×90×65" pero dentro no cabe la
sirena, la ficha está mal y se corrige antes de modelar, dejando escrito en la
ficha qué restricción mandó y qué fuente se descartó.

## Procedimiento (en orden; sin saltar pasos)

1. **Confirma la toma**: lee tu fila (`rubric_item`, `quality_tier`, `depends_on`,
   duración en cámara). Sin `rubric_item` la pieza no se produce; si falta un
   dato, pregunta al director.
2. **Compila los contratos**: `python scripts/build_shotlist.py` debe escribir
   `script/shotlist.csv` sin errores. Si falla, corrige `shots/*.yaml` antes de modelar.
3. **Busca antes de modelar**: modelos CC0 (Poly Haven, Kenney) o del proyecto.
   Solo se modela lo que no existe o debe seguir el diseño propio con exactitud.
4. **Instala el addon** antes de abrir Blender, según lo que pida la tarea:
   `python scripts/herramientas.py necesita "<tarea>"` sugiere solo lo que la
   tarea dispara; instala UNA con `python scripts/herramientas.py instalar <id> --si`
   (blender-mcp solo con autorización del director; nunca mallas ni texturas
   generadas por IA). Para el paquete por tipo de proyecto:
   `python scripts/blender_addons.py --proyecto <tipo> --instalar`
   (producto → BlenderKit; arquitectura → Archimesh + MeasureIt), que deja el
   registro en `blender/addons_instalados.json`. La tabla de cuándo usar cada
   plugin y para qué es bueno está en `anexos-3d.md`.
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
    atraviesa ni se superpone (colisiones, tornillos, cables sin recorrido) y que
    ningún componente interno sale de su contenedor; luego corre
    `pre_render_check.py <shot_id>`. Método y trampas en *Auditoría geométrica*
    más abajo. Solo pasa si está limpia.
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
12. **Sostenibilidad y costo de materiales (plus, no obligatorio)**: para cada material
    anota si es **reciclado o reciclable**, de **proveedor local**, **duradero** (vida
    útil y resistencia UV/humedad) y su **costo relativo**. Cuando dos materiales
    resuelven lo mismo en cámara, elige el reciclado/local/duradero y **dilo en la
    ficha como argumento de pitch** (economía circular, mantenimiento, repuesto).
    Un modelo con carcasa de ABS reciclado y aluminio recuperado suma; uno con
    plástico virgen importado no resta, pero desaprovecha un punto fácil.
    Si el material barato arruina la lectura en 3 s, gana la lectura: el plus nunca
    justifica un render ilegible.

## Detalle completo (leer antes de producir)

El procedimiento largo, las tablas y los ejemplos de esta skill están en
`references/detalle.md`. Es obligatorio leerlo antes de generar contenido: ahí viven las
reglas que no caben en esta portada.
