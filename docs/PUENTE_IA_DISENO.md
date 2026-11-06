# Puente IA ↔ diseño

La identidad visual (paleta, tipografías, equipo, láminas) vive en `design/`. Este
documento fija el estándar para que **la misma identidad** se pueda editar de dos formas:

1. **Desde la ventana visual** (`design/index.html`, `kit.html`, `thumb.html`, `impacto.html`):
   el usuario toca controles o le pide un cambio a la IA en el panel flotante.
2. **Desde la consola del agente**: la IA lee el estado, propone un cambio y lo aplica con
   las mismas reglas.

Las dos rutas pasan por la misma función, `RallyDiseno.aplicarPatch()`. No hay una segunda
verdad.

---

## 1. Mapa de almacenamiento

| Qué | Dónde | Quién escribe |
|---|---|---|
| Identidad completa | `localStorage["rally_design_v5"]` (navegador del usuario) | `shared.js` → `saveIdentity()` |
| Identidad migrada de versiones viejas | `localStorage["rally_design_v4"]` (solo lectura) | `loadIdentity()` migra y borra el uso |
| Identidad como sección del proyecto | `/api/sections/design_identity` → `dashboard/data/sections.db` | `RallyDiseno.sincronizar()` o `publicar_seccion.py` |
| Versión de sección ya aplicada | `localStorage["rally_design_sync_v"]` | `RallyDiseno.cargarRemoto()` |
| Espejo de secciones para el tablero | `dashboard/data/state.json` | `section_store.py` |
| Propuestas pendientes (Aceptar / Descartar) | `dashboard/data/content/<id>.json` | `servir_propuesta.py` |
| Propuestas aceptadas / descartadas | `dashboard/data/applied/`, `dashboard/data/discarded/` | `content_store.py` |
| Logos, fotos y capturas subidas | `design/assets/` | módulo de diseño (subida del usuario) |
| Código del módulo | `design/` (`shared.js`, `ia.js`, `ventana.js`, `kit.js`, `thumb.js`, `impacto.js`) | agentes de contenido |
| Presets exportados | `design/presets.json` | `scripts/gen_presets_json.py` |
| Marca del proyecto (la que distribuye la solución) | dentro de la identidad: `team.proyecto` = `{name, claim, sector, logoText, logoImg, slogan, problem, solution, audience, tone, mission, vision, inspiration, style, pal, fonts, nameIdeas, claimIdeas}` | `kit.js` → `saveIdentity()` |

La identidad **no** se guarda en el repositorio: es por navegador y por perfil. Lo que sí
queda en disco es la copia de sección (`sections.db`) y su espejo (`state.json`).

Reglas de conflicto:

- El servidor exige `base_version`. Si otra persona guardó antes, responde **409** y
  `RallyDiseno` conserva la copia local, sin pisar nada.
- Nunca se escribe `localStorage` a mano desde fuera del módulo; siempre `aplicarPatch()`.

---

## 2. API estándar (`window.RallyDiseno`, en `design/shared.js`)

| Miembro | Para qué |
|---|---|
| `MAPA` | Este mapa, en objeto, para mostrarlo en pantalla o citarlo. |
| `leer()` | Identidad normalizada actual. |
| `estadoParaIA()` | Versión compacta sin logos en dataURL; es lo que se le manda al modelo. |
| `validar(patch)` | Rechaza claves fuera de la lista permitida. |
| `aplicarPatch(patch)` | Fusiona, sanea la paleta, guarda, repinta y sincroniza. |
| `alCambiar(fn)` / evento `rally:diseno` | Aviso a otros componentes. |
| `promptEdicion(instruccion)` | Prompt canónico: el modelo responde **solo JSON**. |
| `pedirEdicion(instruccion, cb)` | Usa `RallyIA` si está cargado; si no, devuelve `status:"manual"` con el prompt. |
| `sugerir(cb)` | Propone el cambio de mayor impacto y lo aplica. |
| `sincronizar(cb)` | Escribe `design_identity` en el servidor local. |
| `leerSeccion(cb)` | Lee `design_identity` sin aplicar nada. |
| `cargarRemoto(cb)` | Aplica la sección solo si su versión supera `rally_design_sync_v`. |
| `panel()` | Inyecta el botón **IA diseño** en la esquina inferior izquierda. |

Claves permitidas en un patch:

```
style, pal, fonts, team, mem, styles, decor, bio, impacto
```

Ejemplos válidos:

```json
{"pal": {"ac": "#0F766E"}}
{"team": {"name": "Nombre real"}, "fonts": {"t": "Archivo Narrow"}}
{"impacto": {"plan": {"municipio": "Estelí"}}}
```

La paleta pasa por `_sanearPal()`, que corrige contraste y descarta morados **sin cambiar el
lado claro u oscuro**: un fondo `#14100c` sigue oscuro y su tinta sigue clara. Las llaves
`bg2`, `mu` y `gl` quedan del mismo lado que `bg`. Un patch nunca puede introducir llaves
nuevas ni reemplazar la identidad completa.

El kit de prensa no usa esa paleta tal cual: `kitPaper()` fuerza papel claro (blanco si
hace falta) para que la hoja impresa sea legible aunque la marca sea oscura.

### Marca del proyecto (independiente de la del equipo)

`team.proyecto` guarda la marca de la solución que distribuye el proyecto. **No hereda** la
paleta ni las fuentes del equipo: tiene su propio `pal` y `fonts`, y el kit los usa solo en
su bloque. El botón `Llevar esta identidad al kit completo` es la única vía para copiarla al
resto de la hoja.

- Si no hay nombre, el asistente lo pide y no inventa un proyecto: exige `problem` y
  `audience` antes de generar propuestas.
- Los nombres salen de patrones reales del banco SIRLI (`research/sirli/winners.jsonl`,
  5.136 registros): marca inventada (NEXORA, KINETIX), objeto cotidiano (AVOCADO, LUMBRE),
  compuesto (NEXO-SOSTENIBLE, ALTIPLANO 360), territorio + número, sufijo técnico
  (BIOINNOVATECH) y juego de palabras (DESUCHO, ERROR 404). Cada propuesta declara su patrón.
- El slogan y la misión se arman solo con lo que el usuario escribió (`problem`, `solution`,
  `audience`); no se agregan cifras ni públicos no declarados.
- Los 12 estilos de marca (`PROJ_STYLES`) combinan la taxonomía de `rebrand.gallery`
  (minimal, geométrico, 3D, patrón, wordmark; vibrante, cercano, confiado, humano, cálido) y
  los 12 arquetipos de marca (Mark & Pearson). Cada estilo trae paleta y pareja tipográfica
  de `FONT_LIBRARY`; un estilo recomendado depende del sector detectado y del tono.
- La tipografía elegida se valida con `fuenteOk()`; ninguna familia fuera de la biblioteca
  entra. Las paletas del catálogo no usan morado.

### Barreras puestas

| Si la IA o el usuario... | El sistema... |
|---|---|
| propone una llave desconocida | rechaza el patch entero (`validar`) |
| mete un morado | lo rota a un tono seguro |
| pide un tipo de letra fuera de `FONT_LIBRARY` | la descarta y conserva la actual (`fuenteOk`) |
| pasa una familia con `;`, `@import` o comillas | no inyecta nada (`_familiaSegura`) |
| elige una tipografía vieja (Times, Georgia, Arial, Comic Sans…) | la retira con `esFuenteVetada()` y el kit dice `Fuente retirada: … es tipografia vieja.` |
| pasa una URL de fuente que no es https de Google, Bunny, Typekit o jsDelivr | devuelve `false` y el kit avisa |
| sube al thumbnail algo que no es `image/*` | `Solo imagenes: JPG, PNG o WebP.` |
| sube una imagen de más de 3.5 MB | `Maximo 3.5 MB: comprime o recorta antes de cargarla.` |
| llena el almacenamiento del navegador | `saveIdentity` avisa por consola y devuelve `false` |
| intenta pisar una sección más nueva | 409: se conserva lo local |

Los datos del thumbnail viajan en la identidad local, no en la sección: `thHeroImg`
(dataURL de la foto), `thHeroFx` (`foco`/`zoom`/`barrido`/`blur`) y `thHeroConcept`.
`estadoParaIA()` los resume como concepto y efecto, nunca como base64.

La marca del proyecto que distribuye la solución vive en `team.proyecto` (anidada dentro de
la identidad), no en la raíz: el kit la imprime como bloque propio y la IA la puede cambiar
con `{"team": {"proyecto": {"name": "…", "claim": "…", "sector": "…"}}}`.

---

## 3. Uso desde la ventana visual

Cada página de `design/` muestra el botón **IA diseño**. Abre un panel con:

- **Pedir cambio** — texto libre (“acento verde, titular Archivo”). Si hay proveedor de IA,
  aplica y repinta; si no, muestra el prompt para llevarlo a mano.
- **Sugerir** — la IA elige el cambio de mayor impacto.
- **Copiar prompt** — deja el prompt en el campo inferior y lo copia al portapapeles.
- **Aplicar JSON** — pega la respuesta de una IA externa y se aplica con las mismas reglas.
- **Sincronizar** — escribe `design_identity` en el servidor local.

Requisito para sincronizar: abrir el módulo como
`http://127.0.0.1:8000/design/...`. En `file://` solo funciona la edición local.

Después de aplicar, el módulo llama a su propia función de repintado (`all`, `renderKit`,
`renderThumb`, `pintar`) o a `window.__rallyDisenoRefresh` si existe.

---

## 4. Uso desde la consola del agente

La IA de consola no puede tocar `localStorage` del navegador del usuario. Para proponer
cambios tiene dos caminos:

**A. Escribir la sección** (la ventana y el módulo pueden leerla):

```bash
python scripts/publicar_seccion.py --project "<proyecto>" \
  --section design_identity --payload cambio.json
```

`--payload` es el archivo con el objeto de la sección, por ejemplo
`{"identidad": {...}, "actualizado": "2026-11-06T00:00:00Z"}`. Requiere `--token` o
`RALLY_SESSION_TOKEN`; en el proyecto abierto por defecto puede no hacer falta, pero el
script hoy lo exige. Es la deuda conocida de este puente.

**B. Entregar la propuesta por el buzón** (Aceptar / Descartar):

```bash
python scripts/servir_propuesta.py --tab design --slot main --kind json \
  --title "Ajuste de paleta" --payload cambio.json
```

Hoy ese comando **falla**: `design` no está en `ALLOWED_TABS` de
`scripts/content_store.py` ni en `CAMPOS_POR_TAB` de `dashboard/content_bridge.js`. Mientras
no se habilite, el camino real es **A** o pegar el JSON en el panel del módulo.

---

## 5. Qué falta y quién lo decide

- Añadir `design` al puente del buzón requiere tocar `dashboard/content_bridge.js`
  (ventana). No lo hace el agente de contenido sin permiso.
- `publicar_seccion.py` exige token incluso en el proyecto abierto; relajarlo es cambio de
  motor.
- Las cifras y los textos del equipo se cargan de `brief.json`; con `brief.json` vacío la
  identidad sigue en valores de plantilla. Nada de esto inventa datos.
