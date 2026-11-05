# Anexos 3D (bajo demanda)

Detalle de recursos que **no** se cargan siempre. La skill `modelo-3d-blender`
solo los activa cuando la toma lo pide.

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

## Caja de herramientas 3D

No se instala todo. Consulta `python scripts/herramientas.py necesita "<tarea>"`
y usa solo lo que la toma pida. Las de tipo `builtin` ya vienen con Blender: se
activan o se usan, no se instalan.

### Cuándo usar cada plugin (y para qué es bueno)

| Herramienta | Cuándo usarla | Para qué es buena |
|---|---|---|
| `cad-sketcher` | pieza de producto con medidas exactas del BOM | bocetos CAD con restricciones; cotas reales, nada a ojo |
| `bonsai` (BlenderBIM) | edificio o infraestructura con datos | IFC estructurado: muros, losas, puertas con datos reales de construcción |
| `building-tools` | edificio paramétrico rápido | genera pisos/ventanas/puertas; alternativa ligera a Bonsai |
| `sverchok` | patrones y estructuras complejas | diseño paramétrico por nodos (modular) |
| `sun-position` | luz exterior realista | sol por hora y lugar, sin costo |
| `node-wrangler` | materiales y shaders | acelera el flujo de nodos; materiales más ricos en menos pasos |
| `tissue` | celosías, teselados, retículas | orgánico estructural computacional |
| `blendergis` | terreno o ciudad real del municipio piloto | contexto geográfico real (zona pequeña) |
| `blosm` | manzana o barrio OSM | contexto urbano (moderado; ciudad entera no) |
| `camera-shakify` | cámara a mano natural | movimiento realista, casi sin costo |
| `decimate` | malla pesada, bajar carga | reduce polígonos sin destruir (ver *Polígonos y LOD*) |
| `polyhaven` | HDRI y materiales CC0 | iluminación y materiales reales |
| `geonodes` | variantes paramétricas | discurso modular/replicable |
| `mpfb2` | personas en escena | figuras humanas libres, licencia limpia |
| `rigify` | animar personaje | rig incluido en Blender |
| `gltf-export` | asset para la web demo | un modelo sirve para render y web |
| `blender-mcp` | iterar geometría en vivo con el humano | control interactivo; exige permiso |

- **Blender Extensions** (`blender --command extension install <id>`): vía
  oficial para instalar addons; preferirla sobre descargas manuales.
- **Nunca** mallas ni texturas generadas por IA (Tripo, Hyper3D, Rodin, TripoSR,
  TRELLIS, Hunyuan3D, Dream Textures): licencia y coste inciertos para la entrega
  oficial, y consumen mucha VRAM.

### Rendimiento (no matar la PC)

- Construir en EEVEE; Cycles solo para el render final.
- OpenImageDenoise activo y 64–128 muestras en vez de miles.
- Instancias (Alt+D) y Geometry Nodes en vez de duplicar geometría.
- Modificadores sin aplicar y LOD bajo en vista; calidad alta solo al renderizar.
- Texturas 1K–2K (no 8K); bajar resolución del render al 50 % en pruebas.
- Evitar simulaciones pesadas (fluidos, partículas, Molecular Plus) y
  subdivisiones altas.

### Polígonos y LOD (reducir carga sin perder calidad)

No existe el plugin que "baje lo justo y no se vea mal": perder calidad es
inherente a decimar. Lo que sí hay es bajar carga **sin destruir** y decidir
dónde el detalle no se ve. Es un bucle, no un clic:

1. **Simplificar para previsualizar, no para entregar**: activa *Render
   Properties → Simplify* (baja la subdivisión de viewport/render). No cambia la
   geometría: solo acelera las iteraciones.
2. **Decimate sin aplicar**: añade el modificador *Decimate* y déjalo sin
   aplicar hasta el final. Modos: `COLLAPSE` (mallas densas/orgánicas),
   `PLANAR` (caras planas: polígonos "gratis"), `UNSUBDIVIDE` (topología de
   rejilla). Bajando el ratio poco a poco se ve el punto exacto donde empieza a
   degradar.
3. **Decimar donde no se ve**: reduce más la cara trasera y las piezas lejos de
   cámara; conserva el detalle de la pieza protagonista (la que sostiene el
   `rubric_item`).
4. **Itera con el bucle de crítica**: render `revisar`, compara contra la ficha
   qué ya no se lee y ajusta el ratio. Máximo 2 vueltas; si no convence,
   simplifica la toma, no sigas bajando polígonos hasta la basura.
5. **LOD por tier**: en `draft`/`revisar` usa subdivisión y resolución bajas;
   sube solo en `final`. El mismo `.blend` sirve para todo: nunca se destruye la
   versión de alta.

### Arquitectura modular del build (subagentes)

Se construye por piezas paramétricas e independientes, no con un guion
monolítico. Cambiar una medida no destruye nada.

- **Capa de configuración**: `cfg = leer_bom("budget/bom.csv")` una vez al
  principio; toda medida sale de `cfg`, ningún número mágico en el cuerpo.
- **Una función por pieza**, idempotente: `build_carcasa(cfg)` borra sus propios
  objetos por nombre y los reconstruye; devuelve la lista creada.
- **Archivos por responsabilidad = un subagente por archivo**:

```
blender/
  lib_materiales.py      # materiales y shaders (dueño: subagente materiales)
  lib_mesh.py            # piezas reutilizables y ayudantes (dueño: subagente mesh)
  build_<pieza>.py       # ensamblado paramétrico (dueño: subagente modelo)
  escena.py              # cámara, luz, fondo, HUD (dueño: subagente escena)
```

  Cada subagente es dueño de su archivo y nadie más lo escribe: sin estado
  compartido en la sesión de Blender, sin choques (el orquestador reparte por
  archivo).
- **Cambiar una medida → solo lo afectado se rehace**:
  `cfg['bateria']['diametro_mm']` cambia la batería y lo que la referencia; el
  resto queda intacto. Re-correr el script solo toca el alcance de su archivo.
- **Banderas** `--render` / `--novideo` separan lo caro de lo barato. El `.blend`
  se guarda armado para retocar sin reconstruir.
