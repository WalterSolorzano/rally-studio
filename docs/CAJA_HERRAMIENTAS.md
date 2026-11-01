# Caja de herramientas externa (bajo demanda)

> **Regla:** instalar **solo** la herramienta cuyo disparador coincide con la
> tarea actual. Prohibido instalar la caja completa "por si acaso".

Fuente única: [`docs/herramientas.json`](herramientas.json). Este documento lo
explica; el JSON manda.

## Cómo se usa

```bash
# 1. Ver qué hay
python scripts/herramientas.py listar

# 2. Preguntar solo por la tarea actual (no instala nada)
python scripts/herramientas.py necesita "render 3d con figuras humanas"

# 3. Instalar UNA herramienta, con confirmación explícita
python scripts/herramientas.py instalar anatomy --si

# 4. Ver qué haría, sin ejecutar
python scripts/herramientas.py instalar blender-mcp --simular
```

Sin `--si` no se instala nada. Las herramientas `builtin` y `api` no se
instalan: solo se explican. Las de `origen: superpowers` ya vienen con el
harness y se cargan con la herramienta `skill`.

## Reparto por agente

| Agente | Herramientas | Se activa cuando |
|---|---|---|
| orquestador | `dispatching-parallel-agents`, `subagent-driven-development`, `writing-plans` | hay 2+ tareas independientes o un plan por tareas |
| modeler | `blender-mcp`, `anatomy`, `blender-extensions`, `mpfb2`, `rigify`, `gltf-export`, `polyhaven`, `geonodes` | la toma pide control en vivo, personas, rig, asset web o variantes |
| grafista2d | `impeccable`, `frontend-design`, `ui-ux-pro-max`, `design-system` | hay interfaz, paleta o tokens que decidir |
| investigador | `firecrawl-research-index`, `firecrawl-developer-index` | hay papers o documentación técnica que verificar |
| profe (builder) | `test-driven-development`, `verification-before-completion`, `systematic-debugging` | se toca código o hay un bug que reproducir |
| pautador | `slides` | el usuario pide pitch deck además del video |
| todos | `caveman-compress`, `cavecrew` | la sesión se alarga y hay que comprimir contexto |

## Reglas de carga

1. **Un disparador, una herramienta.** Si `necesita` no devuelve nada, no se
   instala nada.
2. **Máximo una instalación por tarea.** Si hacen falta dos, se justifica.
3. **`blender-mcp` está desactivado por defecto** en `opencode.json`. Solo se
   habilita con autorización del director (`BLENDERMCP_AUTORIZADO`) y `--si`.
4. **Nada de mallas generadas por IA** (Tripo, Hyper3D, Rodin): licencia y
   coste inciertos para una entrega oficial. Están listadas como `no_usar` en
   el catálogo.
5. **No duplicar lo que ya existe:** si `brand/tokens.css` resuelve la paleta,
   no se instala `ui-ux-pro-max`; si el claim ya está en
   `research/claims.json`, no se instala el buscador de papers.
6. **Sin instalar en el arranque.** `scripts/setup_agente.ps1` deja el sistema
   listo; las herramientas externas se piden cuando la tarea las pide.

## Tecnología Blender heredada

| Tecnología | Qué aporta | Cuándo |
|---|---|---|
| Blender Extensions (`extensions.blender.org`) | addons oficiales sin descargas manuales | instalar un addon |
| BlenderMCP | control en vivo desde el agente | iterar geometría con el humano mirando |
| MPFB2 (MakeHuman) | figuras humanas libres y con licencia limpia | escena con personas |
| Rigify | rig humano incluido en Blender | animar un personaje |
| glTF/GLB | asset reutilizable en render y webdemo | el modelo también va a la web |
| Poly Haven / ambientCG | HDRIs y materiales CC0 | iluminación y materiales |
| Geometry Nodes | variantes paramétricas | discurso modular/replicable |

`anatomy` complementa a Blender: figura didáctica para explicar, no reemplaza
el render del producto.
