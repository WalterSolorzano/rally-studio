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

## Checklist de realismo (antes del render de `revisar`)

- **Escala**: referencia humana u objeto conocido en cuadro; proporciones de `bom.csv`.
- **Apoyo y gravedad**: nada flota; el centro de masa cae dentro de la base y la ficha
  dice dónde se apoya.
- **Sombras de contacto**: contacto visible entre piezas y con el suelo.
- **Materiales**: rugosidad y reflejo del material declarado (metal no parece plástico).
- **Lectura en 3 segundos**: si no se entiende qué es, se corrige el encuadre o se
  simplifica la geometría.

## Auditoría geométrica: que la guarda pueda ver el fallo

Una comprobación exime exactamente lo que no mira. Si tu auditoría ignora los
subensambles (tornillos, cables, módulos, antenas), **no detectará un módulo
atravesando la pared**, que es el fallo más frecuente y el más visible en cámara.

Reglas:

- Además de "¿dos piezas se solapan?", comprueba **"¿esta pieza está dentro del
  volumen que la contiene?"**. Proyecta las 8 esquinas de cada componente interno
  contra la sección interior real a su altura, no contra el AABB del contenedor.
- Cada exclusión de la auditoría se justifica por escrito en el script; sin
  justificación, se quita la exclusión.
- La envolvente global se imprime en mm y se compara con el BOM en cada corrida.
  Un error de escala de 1000× es invisible hasta que miras el número.
- Reporta tres cifras siempre: objetos, triángulos y envolvente. Sirven de línea
  base para detectar que un cambio rompió algo.
- El diagnóstico barato es un rayo: lanza un rayo desde la cámara (o hacia abajo)
  y pregunta **qué objeto golpea**. Identifica en segundos qué pieza asoma, en vez
  de adivinar por el color del píxel.

## Cámara, rótulos y HUD

- **Una sola distancia focal por secuencia con rótulos.** Si el HUD se cuelga de
  la cámara, cualquier animación de `lens` (incluso el sobrepaso de una Bézier)
  escala y desplaza todo el texto. El zoom se hace **acercando la cámara**, no
  cambiando la lente.
- Antes de dar por bueno un rótulo, **mídelo**: proyecta su caja a coordenadas de
  pantalla (u,v) y comprueba que queda dentro del cuadro con margen ≥6 %. Estimar
  el ancho con `len(texto)` siempre falla.
- Contraste garantizado: texto claro emisivo sobre placa oscura propia
  (`visible_shadow = False`), o sombra de texto desplazada. Nunca texto gris
  sobre fondo iluminado, y nunca confiar en que el fondo será oscuro.
- Varios rótulos en el mismo lado se pisan: lleva un registro por lado y
  reubica el siguiente candidato vertical hasta que no choque.
- Un rótulo sin flecha que apunte a la pieza no dice nada. Flecha desde el borde
  del texto hasta el centro del bbox de la pieza, y clamp a los márgenes.

## Método de verificación (no confiar en la vista)

El ojo perdona defectos que el jurado no. Orden de verificación, de barato a caro:

1. **Números** del script (objetos, triángulos, envolvente, auditoría): cada corrida.
2. **Rayos** para identificar piezas concretas.
3. **Proyecciones** a u,v para encuadre y rótulos.
4. **Píxeles** (análisis de contraste) cuando la duda es si algo se lee.
5. **Fotogramas** extraídos del render final, no del visor.
6. Solo entonces, la vista humana.

Un render que "parece bien" a 960×540 puede tener texto cortado. Si hay una
medición disponible, la medición decide.

Para un video, el orden es: extrae **8–12 fotogramas del mp4 final**, uno por
parada del recorrido y uno por transición, y revísalos como una hoja de
contactos. Un bug de escala o de anclaje se ve en un fotograma suelto mucho antes
que viendo el video entero. Si sospechas de un objeto animado, lee sus **fcurves**
(qué valores clave hay realmente en cada fotograma) en vez de re-renderizar.

## Despiece y video de montaje

- **Producto armado primero**: cada elemento se enciende (emisión) **y** la cámara
  hace zoom a esa pieza mientras su nombre aparece al lado. Un plano general fijo
  con rótulos no se entiende.
- **Explosión por capas**, no por piezas sueltas: el bloque interior sube
  completo —PCB, módulos, batería, separadores y **todo el cableado**— para que
  cada cable conserve sus dos extremos y se vea a qué conecta.
- El interior debe **salir por encima del borde** de la carcasa: metido en una
  cavidad profunda no se ve desde ninguna cámara razonable.
- Muestra el **sentido de extracción** de los tornillos con guías punteadas desde
  el agujero hasta el tornillo explotado.
- Después del explosivo general, **un zoom por componente**, con encuadre que
  incluya su contexto (no la pieza aislada en el vacío).
- Si la pieza a resaltar tiene un bbox enorme y disperso (cables), encuadra con
  las piezas de referencia y resalta solo lo que importa.
- Reproduce el cierre: vuelta al producto armado. Un despiece que termina en el
  aire no cuenta una historia.
- **Ritmo medido, no "lo que entra"**: a 24 fps, ~7 s de giro del producto armado
  antes de despiezar, ~40 fotogramas por pieza en el recorrido, 4 s para la
  explosión, ~1.8 s por zoom, y cierre con la vuelta al armado. Menos de 1 s por
  parada no se lee: el espectador ve un parpadeo con texto encima.
- **Nada de cortes secos**: entre dos paradas, pasa por una pose intermedia en
  arco (se aleja, cambia de ángulo, vuelve a entrar). Cambiar `loc` y `rot`
  directamente en el mismo fotograma es un salto de eje que el jurado nota.
- Que la cámara **no se quede quieta** durante la fase de rótulos: deriva u
  orbita unos grados. Si la cámara está fija, el explotado se lee como un dibujo
  plano y además las flechas clavadas en pantalla parecen correctas.

## Video con HUD: las trampas que cuestan un render

Cada punto de aquí costó un render completo. Se verifican antes de lanzar.

1. **Fondo y piso finitos.** Si el piso o la pared de fondo miden menos que el
   radio de la trayectoria de cámara, la cámara sale de la escena y el fotograma
   queda **negro entero, HUD incluido**, sin ningún error en consola. Regla: el
   fondo va detrás del punto más lejano de la cámara y mide ≥10× el sujeto.
2. **Flecha anclada ≠ flecha clavada.** Si la flecha se dibuja una vez en
   espacio de pantalla, deja de apuntar a su pieza en cuanto la cámara se mueve,
   y la lámina miente. Se modela con malla **unitaria** y se recoloca cada 2–3
   fotogramas proyectando el punto 3D real de la pieza.
3. **Escala degenerada, no `return` temprano.** Una flecha que arranca con
   longitud cero y hace `return` sin fijar la escala guarda la escala de la malla
   unitaria; la interpolación la convierte en una pared de medio metro que tapa
   el cuadro. Fija siempre posición **y** escala degeneradas antes de salir.
4. **Interpolación LINEAR en los objetos del HUD.** El Bezier entre `0.001` y
   `1.0` pasa por valores intermedios durante los primeros fotogramas y produce
   estelas gigantes. Fuerza `interpolation = "LINEAR"` en todas las fcurves de
   los objetos de rótulo, placa y flecha.
5. **Placas medidas con el bbox local.** Centrar la placa con un offset simétrico
   corta el texto por un lado. Mide `bound_box` local del texto, alinea por el
   borde correcto y coloca el centro de la placa en el centro real del texto.
6. **El encuadre se resuelve proyectando, no con la caja 3D.** Calcular la
   distancia con el radio del bbox se equivoca ~30 %: ignora la orientación y el
   formato. Itera 5–8 veces: coloca la cámara, proyecta los puntos reales, ajusta
   distancia hasta que la huella ocupe la fracción de cuadro deseada y desplaza
   el objetivo para centrarla. `fill ≈ 0.85–0.90` llena el cuadro sin cortar.
7. **Aparición con golpe, no pegatina.** Los rótulos entran escalados de 0 a 1.05
   y vuelven a 1.0 en ~9 fotogramas, escalonados (~5 fotogramas entre uno y
   otro). Un rótulo que aparece a tamaño pleno de un cuadro al otro se ve falso.
8. **Unidades.** La pose de cámara y la geometría pueden estar en unidades
   distintas (mm vs m) mientras la conversión sea **única y explícita**; mezclarla
   en una misma función pone la cámara 1000× más cerca y el cuadro sale negro sin
   error. Imprime la pose final de la cámara en el log y compárala con el tamaño
   de la escena.
9. **Tipografía**: regular antes que bold (el bold a 540p embota los acentos),
   acentos reales en español, tamaño ≥2 % de la altura del cuadro, y comprueba en
   el log **qué fuente** se cargó: si el archivo no existe, Blender cae a Bfont
   en silencio.
10. **Cierre de calidad**: el tier de entrega del video suele ser uno menos que el
    de los stills (los stills se miran de cerca, el video se ve en movimiento).
    Anota el costo por fotograma medido tras los primeros 20 frames y recalcula
    el total antes de dejarlo corriendo.
11. **Rota la flecha con cuaterniones, nunca con Euler.** Entre dos claves casi
    opuestas (la pieza pasa de un lado al otro del rótulo) el Euler gira por el
    camino largo y, a mitad de trayecto, el vástago apunta al revés: la flecha
    sale del rótulo y se va al cielo aunque los dos extremos estén bien
    calculados. `rotation_mode = "QUATERNION"` e interpolar con
    `rotation_quaternion` (arco corto garantizado).
12. **El grosor se mide en fracción de cuadro.** Radio del vástago ≈0.0075 de la
    altura del HUD (≈4 px a 1080p) y punta de **4× ese radio**: si la punta solo
    dobla al vástago, la flecha se lee como un pelo y no como una flecha.
13. **Los props de escala estorban en el video.** Una regla o un grid en el piso
    sirven en el still, pero en los primeros planos cruzan el cuadro y salen
    cortados por el borde. Apágalos con claves de `hide_render` en la escena del
    video y déjalos solo en las láminas fijas.
14. **Un `dmin` fijo anula el `fill`.** Si la distancia mínima de seguridad es
    mayor que la que pide el relleno calculado por proyección, el sujeto queda
    siempre chico y el encuadre no responde a `fill`. El clamp va después del
    cálculo y hay que comprobar cuál de los dos manda en cada parada.
15. **Extrae los fotogramas de revisión a la resolución nativa del mp4.** Si el
    editor de video escala el material a otra resolución, el fotograma sale
    ampliado o recortado y parece un error de encuadre que no existe.

## Estimador de tiempo

Antes de reservar GPU, anota en la ficha: `minutos ≈ fotogramas × costo_por_fotograma +
modelado + correcciones`. Costo por tier: `draft` ≈2 s/fotograma, `revisar` ≈6 s, `final`
≈20 s (ajusta con la primera prueba real). Modelado: 20–40 min una pieza simple, 60–120 min
una protagonista. Si la suma supera `caps.max_3d_hours_total`, recorta detalle o elimina la
pieza antes de empezar, no a mitad del render.

El costo por fotograma **escala con los píxeles**: duplicar la resolución cuadruplica el
tiempo. Mide 20 fotogramas con la resolución de entrega real y multiplica antes de lanzar;
un tier "de calidad buena" elegido a ojo puede convertir 15 minutos en dos horas.

## Jerarquía de assets (orden de decisión, no de gustos)

1. **Modelo existente** (CC0 / kit / modelo del proyecto): primera opción;
   cero GPU y sin apariencia genérica.
2. **Pieza protagonista que el kit no cubre**: modelado manual con ficha; es
   la pieza que sostiene el `rubric_item`, por eso sí merece horas.
3. **Nada de "relleno 3D"**: si una pieza no sostiene criterio de rúbrica ni
   la pide una toma, no se produce.

## Arquitectura modular del build (subagentes)

El modelo se construye por piezas independientes y paramétricas, no con un
guion monolítico. Así cambiar una medida no obliga a reconstruir todo.

- **Capa de configuración**: lee `budget/bom.csv` (`dim_*_mm`) una vez, al
  principio, y guárdalo en un `cfg` (dict). Prohibido un número mágico en el
  cuerpo: toda medida sale de `cfg`.
- **Una función por pieza**: `build_carcasa(cfg)`, `build_tornillos(cfg)`, ...
  Cada función borra primero sus propios objetos por nombre (idempotente) y
  devuelve la lista de lo creado. Cambiar `cfg['bateria']['diametro_mm']` solo
  rehace la batería y lo que la referencia; el resto no se toca.
- **Archivos por responsabilidad → un subagente por archivo** (orquestador):
  `blender/lib_materiales.py`, `blender/lib_mesh.py`,
  `blender/build_<pieza>.py` (ensamblado), `blender/escena.py`
  (cámara/luz/fondo/HUD). Cada subagente es dueño de su archivo y nadie más lo
  toca: sin estado compartido, sin choques.
- **Idempotente y por banderas**: `--render`, `--novideo`; re-correr solo rehace
  el alcance de su archivo, nunca destruye el `.blend` armado.

Detalle (layout de archivos y ejemplo): `anexos-3d.md`.

## Anexos 3D (bajo demanda)

- **Figuras didácticas**: la skill externa `anatomy` sirve para figuras humanas
  didácticas del video; ver `anexos-3d.md`. No tiene relación con la auditoría
  geométrica del paso 12.
- **Caja de herramientas 3D**: BlenderMCP, extensions, MPFB2, Rigify, glTF,
  Poly Haven, Geometry Nodes, CAD Sketcher, Bonsai, Building Tools, Sverchok,
  Sun Position, Node Wrangler, Tissue, BlenderGIS/Blosm y Camera Shakify.
  No se instala todo: usa `python scripts/herramientas.py necesita "<tarea>"`
  e instala una sola con `--si`. BlenderMCP sigue desactivado hasta
  autorización. Nunca mallas ni texturas generadas por IA.

Detalle completo: `anexos-3d.md` (mismo directorio): tabla de cuándo usar cada
plugin, decimación de polígonos (LOD) y arquitectura modular del build.

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
- **Unidades**: una sola unidad de trabajo, declarada en la cabecera del script
  (recomendado: milímetros con una conversión única a metros). Si el script mezcla
  unidades, el resultado se ve mal sin dar error. Avisa la envolvente en mm en
  cada corrida para detectarlo.
- **Un guion reproducible por pieza**: `blender/build_<pieza>.py`, idempotente, con
  banderas para separar lo caro de lo barato (`--render`, `--novideo`). Nunca
  retoques a mano en el `.blend`: no se pueden repetir.
- **Nunca matar procesos por nombre** (`Stop-Process -Name blender`). Puede haber
  una sesión abierta del usuario. Mata por PID concreto del proceso que lanzaste,
  y si dudas, pregunta antes.
- Un `.blend` guardado y un mp4 renderizado son artefactos distintos: guarda el
  `.blend` en el estado **armado**, no en el explotado, para poder retocar sin
  reconstruir todo.
- **Cualquier cambio de factor global** (altura del explotado, escala de la pieza,
  distancia mínima de cámara) invalida la auditoría de colisiones anterior: se
  vuelve a pasar `check_geom.py` antes del siguiente render largo.
- Un video no se aprueba mirando el visor: se aprueba con una hoja de contactos
  de fotogramas extraídos del **mp4 final** y con el conteo de fotogramas y la
  duración comprobados (`frames ÷ fps`).

## Punteros

- Spec del sistema: `docs/superpowers/specs/2026-10-21-orquestacion-especialistas-design.md`.
- Guardia de recursos: `scripts/gpu_lock.py` (status / acquire / run / release).
- Tablero del equipo: `python scripts/orchestrate.py status`.
- Contrato de tomas: `shots/*.yaml` → `script/shotlist.csv`.
- Fuente única de lo físico: `budget/bom.csv`.
- Destino de renders: `dashboard/assets/`.
- Registro de horas 3D: `blender/horas_3d.csv`.
