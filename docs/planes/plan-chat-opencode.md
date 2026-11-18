# Plan: todas las UIs conectadas + chat con OpenCode

Estado: **A, B y C1 hechas** (puertas abiertas, rutas relativas y el chat funcionando).
C2 (consulta al corpus desde el servidor), C3 (streaming) y C4 (memoria compartida) tocan
`scripts/rally_service.py` o `dashboard/data/`: eso es motor y se hace solo con permiso.
El chat de hoy no los necesita para responder: OpenCode lee el repositorio por su cuenta.

---

## A. Revisión: qué UI existe y quién la abre

Un archivo existe, pero si nada lo enlaza el usuario nunca lo ve. Así estaban las cosas
cuando abrí el repositorio (`docs/MAPA_UIS.md` + barrido de `href` en `dashboard/*.js`).

| UI | Para qué sirve | Puerta antes | Puerta ahora |
|---|---|---|---|
| `dashboard/index.html` | workbench de 13 fases | es la raíz | raíz |
| `dashboard/stats.html` | debrief al cerrar | menú ⋮ → «Debrief» (`app.js:1999`) | igual |
| `dashboard/graph.html` | grafo del corpus | menú ⋮ → «Grafo» (`app.js:2000`) | **contenido reemplazado**: dibujaba 177 nodos de octubre con archivos ya borrados; ahora es el cerebro real (642 nodos / 650 relaciones / 129 comunidades) |
| `dashboard/admin.html` | invitar, retirar acceso | menú ⋮ + modal de identidad | igual |
| `script/teleprompter.html` | leer el guion grabando | pestaña 10 → «Abrir teleprompter» con ruta absoluta `/script/...` | ruta relativa `../script/...` y además puerta directa en el menú ⋮ |
| `dashboard/entregables/index.html` | mini-app PWA del teleprompter | nadie (solo `sw.js` la cachea) | se queda como entrega, no es producto |
| `design/index.html` | carrusel del equipo (4:5) | **ninguna** | menú ⋮ → «Diseño del proyecto» |
| `design/kit.html` | kit de prensa | solo desde `design/index.html` | igual (ya no está aislado) |
| `design/thumb.html` | thumbnail de YouTube | solo desde `design/index.html` | igual |
| `design/impacto.html` | Impacto y Plan País | solo desde `design/index.html` | igual |
| `site/index.html` | web demo que se graba | pestaña 11, iframe `src="/site/"` | `../site/` |
| `docs/storyboard_visual.html` | hoja de contactos imprimible | nadie | entrega, no producto |
| `docs/assets/informe_template.html` | plantilla del informe | nadie | entrega |

### Lo que estaba roto de verdad

1. **El grafo mentía.** `dashboard/graph.html` y `dashboard/graph.json` eran del 18–19 de
   octubre: 177 nodos, con referencias a `WhatsApp Image 2026-10-16....jpeg` (la rúbrica
   como imagen, ya eliminada) y al `LEEME.md` viejo. El botón «Grafo de conocimiento»
   abría un cerebro desconectado del que hoy usa el agente.
2. **El kit de diseño no tenía puerta.** Cuatro páginas terminadas
   (`design/index|kit|thumb|impacto.html`) sin un solo enlace desde el workbench.
3. **Rutas absolutas.** 14 enlaces empezaban con `/` (`/script/...`, `/site/`,
   `/budget/...`, `/docs/...`, `/plantillas/...`, `/assets/voice/...`). En el programa
   local funcionan por casualidad (el servidor sirve la raíz del repositorio); en la copia
   estática de GitHub Pages, donde el proyecto cuelga de `usuario.github.io/repo/`, todas
   dan 404. El «modo copia» avisa que la IA no funciona, pero no que las descargas están
   rotas.

Las tres se corrigieron con `../` (funcionan en los dos modos, porque `dashboard/` está
siempre un nivel por debajo de la raíz) y con la copia del grafo del cerebro sobre el
viejo. Nada de esto toca la máquina de estado: son plantillas de HTML dentro de
`renderTopbar()` y de las vistas de vídeo.

---

## B. Regla que sigue valiendo

- `design/*.js` son **datos generados** (`scripts/gen_pagina_diseno.py`); no se editan a
  mano, se regeneran.
- `script/teleprompter.html` es **entregable** (`skills/guion-storyboard/gen_teleprompter.py`),
  no se edita a mano.
- `dashboard/graph.html` es una **foto** del cerebro. Si el corpus cambia:

```powershell
graphify update brain/corpus
Copy-Item brain\corpus\graphify-out\graph.html dashboard\graph.html -Force
Copy-Item brain\corpus\graphify-out\graph.json dashboard\graph.json -Force
```

---

## C. El chat: una ventana para preguntarle al proyecto

### Qué es

Un panel lateral (no una pestaña 14) que se abre con un icono en la barra superior y responde
con el contexto real: `brief.json`, el estado de la ventana, el corpus del cerebro y los
entregables ya escritos. Sin subir nada a ninguna nube distinta de la que ya usa el agente.

### Por qué no una pestaña

Una pestaña más rompe el flujo de 13 etapas y obliga a `NAV_TABS` (motor). El panel lateral
ya está resuelto en `dashboard/super_agents.js` (`.rsa-menu`, `openMenu`, overlay con
`el()`), así que el chat reusa ese patrón y no inventa navegación.

### Qué ya existe (no hay que construirlo)

| Pieza | Dónde | Qué da |
|---|---|---|
| `POST /api/ai` | `rally_service.py:761` | `{prompt, model}` → `{status:"started", job, model}`; cobra cupo, deduplica, cachea |
| `GET /api/ai/progress?job=` | `rally_service.py:524` | texto parcial y estado del job |
| `GET /api/ai/cancel?job=` | `rally_service.py:517` | cortar el proceso |
| `GET /api/state` | `rally_service.py` | lo que el usuario tiene escrito ahora |
| Ejecutor | `_ai_job_worker` (`rally_service.py:3271`) | `opencode run --model …` con el prompt por stdin |
| Guardas | `_ai_spend_check`, `AI_BURST_MAX=6/min`, `AI_DAILY_MAX=120/día`, `AI_MAX_PROMPT=30000` | el chat no puede desbocar el gasto |
| Modelo | `AI_DEFAULT_MODEL = opencode-go/deepseek-v4.1-flash` | el barato; `_model_allowed` bloquea el resto |
| Cerebro | `graphify query --graph brain/corpus/graphify-out/graph.json` | local, gratis, devuelve nodos con archivo |

El chat es, entonces, **una vista del `/api/ai` que ya existe**. Lo único nuevo es cómo se
arma el contexto y cómo se ve.

### Cómo se arma el contexto (3 capas, de barato a caro)

1. **Siempre (gratis, cliente):** un bloque fijo con `brief.json` + el resumen del estado
   (`/api/state`: certamen, fase, qué secciones están cerradas, total del presupuesto, palabras
   del guion) + la tabla de las 13 etapas con su estado. Son ~1 200 caracteres y responde el
   90 % de las preguntas («¿qué me falta?», «¿cuánto llevo gastado?»).
2. **Si la pregunta no es del estado (cliente → servidor):** `GET /api/cerebro/query?q=…`
   *(nuevo, motor)* devuelve los 5 nodos del grafo que tratan el tema con su `source_file`, y
   el cliente añade el título y la ruta. Cuesta 0 tokens: es `graphify query`, no un modelo.
3. **Si hay que citar texto:** el cliente pide el archivo por `/docs/…` o `/knowledge/…` y
   adjunta solo el rango alrededor del nodo. Nunca el documento entero.

La pregunta sale como:

```
Rol: asistente del equipo en un rally de innovación (Latam 28 h / Nacional 24 h).
Contexto del proyecto: <brief.json resumido>
Estado de la ventana: <fases cerradas, pautado, presupuesto, guion>
Fuentes del corpus que tratan el tema: <hasta 5 nodos con archivo>
Reglas: responde en español, sin inventar cifras; si un dato no está en las fuentes,
dilo. No repitas el nombre del proyecto más de una vez.
Pregunta: <lo que escribió el usuario>
```

Se reusa `AI_PROMPT_GUARD` (ya se antepone en el worker) y el modelo barato.

### Cuánto cuesta: tokens, precio y topes

El chat no elige modelo. `RSA.analyze` manda solo el prompt y `scripts/rally_service.py`
usa `AI_DEFAULT_MODEL = opencode-go/deepseek-v4.1-flash`; la lista permitida en el servidor
es `opencode-go/`, así que el chat no puede saltar a uno más caro aunque alguien lo intente.

| Dato | Valor | De dónde sale |
|---|---|---|
| Modelo | `opencode-go/deepseek-v4.1-flash` | `AI_DEFAULT_MODEL` en `rally_service.py` |
| Entrada | **$0.14 / millón** de tokens | tarifa de referencia en `AGENTS.md` |
| Salida | **$0.28 / millón** de tokens | idem |
| Costo por pregunta | ≈ **$0.0006** | 2.215 caracteres de contexto ≈ 615 tokens de entrada + ~250 de salida |
| Tope del servidor | **6/min** y **120/día** | `AI_BURST_MAX`, `AI_DAILY_MAX` |
| Tope del chat | **60/día** y **$0.05/día** | se deja la mitad del cupo diario para los 16 agentes |
| Techo de prompt | 9.000 caracteres (cliente) / 30.000 (servidor) | `MAX_PROMPT`, `AI_MAX_PROMPT` |

Cien preguntas de este chat cuestan **seis centavos de dólar**. El límite no está para
ahorrar dinero, está para que una tecla trabada no abra 40 procesos de OpenCode.

**Cómo se cuenta.** Ni `POST /api/ai` ni `GET /api/ai/progress` devuelven el consumo real:
OpenCode escribe la respuesta, no la telemetría del modelo. Por eso se estima con un factor
declarado —`CARACTERES_POR_TOKEN = 3.6` para español— y se muestra con «≈» delante. Si
mañana el servidor devolviera `usage`, basta con cambiar `anotarUso()`; la fórmula ya está
separada.

**Dónde se ve.** Pie del panel, en `--font-mono` y `--text-faint`:

```
deepseek · 7/60 hoy · ≈14,2k tokens · ≈$0,0043        · 1 agente trabajando
```

El acumulado del proyecto (no solo el día) va en el `title` del mismo texto, para no gastar
espacio. El registro vive en `localStorage` bajo `rally_chat_uso_v1`, separado por proyecto
y reiniciado por fecha: no hace falta que el servidor guarde nada.

### Adjuntos: imágenes, videos, audio y textos largos

El modelo **no** puede abrir carpetas. Todo prompt pasa por `AI_PROMPT_GUARD` en
`scripts/rally_service.py`, que prohíbe usar herramientas, shell y leer archivos. Antes de
resolverlo, el chat pedía «ejecuta `graphify query`» y el modelo contestaba *«no puedo
listar archivos sin ejecutar PowerShell, y estas reglas me prohíben usar herramientas»*.

Solución: el **cliente** inyecta el inventario y el **servidor** sigue ciego y seguro.

1. `python scripts/gen_recursos.py` recorre 12 carpetas (`assets`, `docs`, `design`,
   `script`, `site`, `budget`, `brain`, `knowledge`, `research`, `brand`, `plantillas`,
   `designs`), salta `research/sirli/` (5.491 miniaturas), `graphify-out/`, entornos
   virtuales y archivos de más de 8 MB, y escribe `assets/recursos.json`:
   **247 archivos, 19 kB** (audio 17, imagen 69, pdf 5, texto 152, video 4).
2. `inventarioPara(pregunta)` puntúa por tipo pedido y por palabras de la pregunta que
   aparecen en la ruta; manda hasta 24 líneas `- ruta (tipo, kb)`. Cuesta ~800 caracteres,
   no 5.000.
3. La respuesta se escanea con `RX_RUTA` (solo carpetas permitidas, nunca `../`, nunca
   `C:\`). Cada ruta se pinta sola: imagen en `<figure>` con zoom, video y audio con
   controles, texto con «ver» → `pre` desplazable + «copiar todo», pdf y demás como fila
   con enlace. Si el navegador no puede reproducir el medio, la figura se degrada a la fila
   con enlace en vez de desaparecer.
4. Toda burbuja del asistente lleva un botón de copiar en la esquina (aparece al pasar el
   ratón; en móvil, siempre).

Roturas conocidas y anotadas:

- **H.264/AAC**: el Chromium que usa Playwright no trae códecs propietarios, así que un MP4
  válido da `error 4`. Con Chrome (`channel="chrome"`) reproduce. No es un fallo del chat;
  el `<video>` de Chrome, Edge y Safari funciona.
- **Range**: `rally_service.py` no responde `Accept-Ranges`, así que un video largo no
  permite saltar a un minuto concreto. Se ve completo. Arreglarlo es motor y no urge.

### Cómo se ve (tokens de `dashboard/style.css`)

Nada nuevo de color: se usan las variables que ya existen.

| Elemento | Token |
|---|---|
| Panel | `--bg-surface`, borde `--border-light`, `--shadow-lg`, `--radius-lg` |
| Cabecera | `--font-mono`, `--text-xs`, `letter-spacing .18em`, `--text-muted` |
| Mensaje del usuario | fondo `--color-navy`, texto `--bg-surface`, `--radius-md` |
| Mensaje del asistente | fondo `--bg-subtle`, texto `--text-body`, borde `--border-light` |
| Cita de fuente | `--font-mono`, `--text-xs`, `--color-accent`, subrayado punteado |
| Botón enviar | `--color-primary`, hover `--color-primary-hover` |
| Esperando | `SVG.spinner` + `--text-faint` |
| Error / sin proveedor | `--status-err-bg`, `--status-err-text` |
| En modo copia | aviso `--status-warn-*`: «el chat vive en el programa local» |

Ley de interfaz mínima: cero párrafos de ayuda, icono antes que palabra, y a la derecha
solo el número de fuentes consultadas (`3 fuentes`), porque ese sí cambia la decisión de
seguir preguntando.

### Fases

**F1 — chat útil, cero motor. HECHO.** `dashboard/chat.js` (panel + historial en
`localStorage` por proyecto + capa 1 de contexto + `POST /api/ai` vía `RSA.analyze`).
No reimplementa el cliente de IA: reusa el de `super_agents.js`, que ya resuelve POST,
poll de 2 s, cancelación y los mensajes de error (`rate-limit`, `no-provider`, `down`).
Se carga con `<script src="chat.js" defer>` después de `super_agents.js` y se suma al
cascarón de `sw.js` (caché v4). El botón flotante no toca `NAV_TABS`.

Prueba viva (servidor local, 2026-11-17): pregunta «¿qué me falta para el video y cuánto
mide mi guion?» → respuesta en 5,1 s: *«0 tomas en el plan de rodaje y 0 assets subidos
(fase 10), y tu guion mide 137 palabras — unos 60–65 s».* El prompt armado mide 2.215
caracteres e incluye estado real (pautado 300/300/848/300/300 caracteres, presupuesto 1
fila, canvas 0/9, guion 137 palabras).

**C2 — cerebro en el chat (motor).** `GET /api/cerebro/query?q=` que envuelve
`graphify query` con caché de 5 min y devuelve JSON (`id, título, source_file, comunidad`).
Cambia `scripts/rally_service.py`: **necesita permiso**. Hoy el chat no lo necesita porque
`opencode run` corre dentro del repositorio y puede ejecutar `graphify query` él mismo —
el prompt se lo indica con la ruta exacta del grafo. El endpoint solo ahorraría ese paso.

**C3 — streaming (motor).** `GET /api/ai/stream?job=` con SSE para no esperar a que el
proceso termine; el poll de 2 s ya funciona y no urge.

**C4 — memoria (opcional).** `dashboard/data/chat.json` por proyecto, para que el chat
recuerde lo hablado entre pestañas y equipos. Es `dashboard/data/`, no motor, pero comparte
candado `private_static`, así que también pide permiso.

### Criterios de aceptación

- Pregunta «¿qué me falta para el guion?» y responde con las fases reales del `state`, no
  con una lista genérica.
- Pregunta «¿qué dice la rúbrica de impacto?» y cita `knowledge/rubric_matrices.md` (F2).
- Si no hay proveedor, dice `Sin IA conectada` con el mismo texto que hoy da
  `ai_provider_summary()`, no un error críptico.
- En GitHub Pages aparece el aviso de modo copia y el cuadro de texto se desactiva: el chat
  no finge funcionar.
- Un solo job vivo por pestaña: abrir/cerrar el panel lo cancela (`/api/ai/cancel`).
- No rompe presupuesto: el contexto fijo es < 2 000 caracteres, así que el caché por hash
  de `_ai_cache_key` sigue sirviendo y las preguntas repetidas no se cobran dos veces.

### Riesgos anotados

- `opencode run` arranca un proceso por pregunta: en una laptop con el render 3D corriendo
  compite por CPU. El tope `AI_MAX_RUNNING` ya lo limita; el chat debe decirlo con
  `--text-faint` («hay un agente trabajando»).
- El contexto puede filtrar rutas internas a una pregunta fuera de tema. Nada sensible vive
  en `brief.json`, pero el panel no debe adjuntar `dashboard/data/` (credenciales de
  proyecto) — se excluye explícitamente.
- Si mañana el corpus crece, la capa 2 devuelve 5 nodos; si llegan 30, el prompt se corta
  por `AI_MAX_PROMPT`. El recorte es del cliente, por orden de relevancia del grafo.
