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
y usa solo lo que la toma pida:

- **BlenderMCP** (`blender-mcp`): control en vivo para iterar geometría con el
  humano mirando. Desactivado por defecto; exige `BLENDERMCP_AUTORIZADO` y
  `python scripts/herramientas.py instalar blender-mcp --si`.
- **Blender Extensions** (`blender --command extension install <id>`): vía
  oficial para addons; preferirla sobre descargas manuales.
- **MPFB2**: figuras humanas libres cuando la escena lleva personas.
- **Rigify**: rig incluido en Blender; solo si hay animación de personaje.
- **glTF/GLB**: exporta el asset para que también sirva a la web demo.
- **Poly Haven / ambientCG**: HDRIs y materiales CC0 para iluminación.
- **Geometry Nodes**: variantes paramétricas para el discurso modular.
- **Nunca** mallas generadas por IA (Tripo, Hyper3D, Rodin): licencia y coste
  inciertos para la entrega oficial.
