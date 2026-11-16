# Mapa del teléfono

Qué alcanza la app cuando se abre en un móvil (360 px) y dónde aterriza cada
entregable que produce la IA. Todo lo de aquí está comprobado con Playwright
`channel=chrome`, viewport `360x740`, `is_mobile=True`.

Una sola app: `rally_service.py` sirve `dashboard/` y, desde ahí, todo lo demás.

---

## 1. Barra inferior (7 puertas, siempre visibles)

`#mobile-bottom-bar` — `display: flex`, 54 px de alto, 7 pestañas de 50 px,
`scrollWidth - clientWidth = 0`, `documentElement.scrollWidth == clientWidth == 360`.

| # | Etiqueta | Icono | Abre | Qué es |
|---|----------|-------|------|--------|
| 1 | Resumen | chart | `switchTab('resumen')` | Tablero del rally |
| 2 | Fases | menu | `toggleSidebar()` | Cajón con las 14 fases |
| 3 | Auditoría | shield | `togglePanel()` | Inspector de rúbrica |
| 4 | Tiempo | clock | `switchTab('timeline')` | Checklist + **avisos de la IA** |
| 5 | Entregas | download | `entregables/index.html` | **Bandeja de archivos de la IA** |
| 6 | Grafo | network | `graph.html` | Corpus (177 nodos) |
| 7 | Debrief | chart | `stats.html` | Horas, producción, quién tomó qué |

`style.css` (bloque `max-width: 768px`) les da `flex: 1 1 0; min-width: 0` y
etiqueta a 9 px con elipsis: caben siete en 360 px sin desbordar.

## 2. Cajón lateral (14 fases, con candado)

`toggleSidebar()` → `body.sidebar-drawer-open #sidebar`. Cada fase se abre con
`switchTab(id)` y solo si `NAV_TABS[i].level <= getWorkflowStage()`.

| Nivel | Etapa | Fases |
|-------|-------|-------|
| 0 | arranque | resumen, certamen |
| 1 | equipo | team, timeline |
| 2 | retos | challenges |
| 3 | solución | solution, impact |
| 4 | despacho | multi_ai, pautado, budget, resources, canvas |
| 5 | guion | script, webdemo |

Antes de la etapa 2 el cuerpo lleva `setup-mode`: se ocultan el resumen, la
auditoría y la barra. Es a propósito — sin certamen no hay nada que mostrar.

## 3. Otras pantallas

| Pantalla | Cómo llega el teléfono | Nota |
|----------|------------------------|------|
| `admin.html` | modal de identidad → "Accesos del equipo" | El enlace de la topbar (`.btn-graph-link`) está oculto en móvil; el del modal no. |
| `stats.html` | barra inferior → Debrief | |
| `graph.html` | barra inferior → Grafo | |
| `entregables/index.html` | barra inferior → Entregas **y** tarjeta "Entregables de la IA" en `resources` | |
| `join.html` | URL directa (`/join.html?token=…`) | Alta de miembros |
| `/site/`, `/docs/…` | URL directa | `serve_custom_file` sirve `BASE_DIR` cuando no está en `dashboard/` |

## 4. Servido por `rally_service.py`

`/` y `/dashboard/*` → `dashboard/`. Si el archivo no está ahí, se prueba
`BASE_DIR` (así `/site/index.html`, `/budget/budget.xlsx`, `/script/shotlist.csv`
y `/entregables/*` responden con su MIME real). Directorios → su `index.html`.

Comprobado con HTTP 200: `/entregables/index.html` (`text/html`),
`/entregables/teleprompter.html`, `/`, `/app.js` (`application/javascript`).

---

## 5. Dónde caen los entregables de la IA

Tres canales, según el tamaño de la pieza.

| Tipo de pieza | Productor | Destino en la UI | Cómo la abre el teléfono |
|---------------|-----------|------------------|--------------------------|
| **Texto que cabe en un campo** (problema, solución, impacto, innovación, prefactibilidad, actos 1-4, filas de presupuesto) | `content_bridge.js` → `/api/content` (poll 2 s) | Dock de propuestas → **Aceptar** escribe en `state.pautado` / `state.script` / `state.budget` | La fase correspondiente del cajón |
| **Aviso de cierre** (lo que no cabe en un campo: "PDF listo", "teleprompter publicado") | `content_bridge.js` rama `timeline` → `state.avisos` (máx. 5) | Bloque **"Avisos de la IA · N"** arriba de `timeline`; cada fila con botón **Abrir** si trae `url` http(s) | Barra inferior → Tiempo |
| **Archivo** (PDF de rodaje, teleprompter, xlsx, csv, docx, mp4) | `tools/publicar_entregables.py` copia a `dashboard/entregables/` y regenera el índice | `entregables/index.html` (más la tarjeta "Entregables de la IA" en `resources`) | Barra inferior → Entregas |

Comprobado en la corrida: `#avisos-ia` → `titulo: "Avisos de la IA · 2"`,
`filas: 2`, `abrir: ["http://localhost:8000/entregables/guion_rodaje.pdf"]`;
`#entregables-ia` → `visible: true`, `href: "entregables/index.html"`,
texto "Abrir bandeja". Consola: 0 errores.

### Reglas del enrutado

- Si el entregable es **texto** → campo de la fase. No se inventa un archivo.
- Si es **aviso** → `state.avisos`. Nunca se descarta: sin el bloque de
  `timeline` el aviso se guardaba y nadie lo volvía a ver.
- Si es **archivo** → `dashboard/entregables/`. Es la única carpeta que el
  teléfono abre de un toque y que sobrevive a la recarga.
- `state.avisos` se guarda en `localStorage` (`…_v4`), así que el aviso sigue
  ahí después de cerrar la pestaña.

---

## 6. Notificaciones del teléfono

Archivo: `dashboard/notify.js` (se sirve con la app, no necesita servidor de push).

| Hecho | Quién lo emite | Tipo |
|---|---|---|
| La IA propone algo que hay que aceptar | `content_bridge.js` (tarjeta del dock) | `propuesta` |
| Un agente terminó un paso | `content_bridge.js` (sobre `notice`) | `avance` |
| Alguien actualizó una sección | `section_sync.js` (versión mayor a la conocida) | `cambio` |
| Alguien actualizó un archivo | `presence.js` (`/api/sync/changes`) | `cambio` |
| Entró una persona nueva | `presence.js` (chips de `/api/presence`) | `equipo` |

- El bus es un evento del documento: `rally:aviso` con `{tipo, id, titulo, texto, tab, slot, fuente, url}`.
  Cualquier script futuro (un agente nuevo, un bot) puede emitirlo sin tocar `notify.js`.
- El permiso se pide con el botón **Activar** de la tarjeta *Notificaciones* (fila de
  iconos en Resumen). El navegador exige un toque del usuario, nunca se pide al cargar.
- Cada aviso se notifica una sola vez por `id` (200 recordados). El texto del cuerpo viene
  del propio aviso: `publicar_avance.py --title/--texto/--url` decide el título y el mensaje.
- Interruptores por tipo en la misma tarjeta: `propuesta`, `avance`, `cambio`, `equipo`.
- Tocar la notificación la abre en el aviso que la produjo (`notificationclick` en `sw.js`
  usa `data.url`; sin URL, enfoca la ventana de la app).
- Requiere contexto seguro: `http://localhost` sí, `http://192.168.x.x` (LAN por HTTP) no.
  Para el teléfono hace falta HTTPS (túnel Tailscale) o el APK con permiso de notificaciones.

### Segunda fuente: `dashboard/data/avisos.json`

Cuando no hay servidor de por medio (GitHub Pages, o un agente que corre fuera de esta
máquina), la app lee igualmente un archivo y emite los mismos avisos:

```bash
python scripts/publicar_avance.py --texto "Terminé el acto 3" --fuente voz --archivo
```

- `--archivo` deja el aviso también en `dashboard/data/avisos.json` (`{"avisos": [...]}`,
  últimos 50, purga por `--horas`). Sin la bandera, el aviso sólo va al buzón del servidor.
- `notify.js` pide `data/avisos.json` cada 30 s (`cache: no-store`), acepta lista o el objeto
  con la clave `avisos`, y pasa cada entrada por el mismo filtro de permisos, interruptores y
  `id` ya notificado. Si el archivo responde 404 deja de buscarlo.
- En Pages lo publica el push: `pages.yml` copia `dashboard/.` entero y sólo borra `data/content`,
  `state.json`, `applied` y `discarded`. Los `.db` no se publican porque están en `.gitignore`.
- Latencia = lo que tarde el commit, no segundos. Sirve como bitácora, no como tiempo real.

## 7. Entrar: llave del equipo e invitaciones

La app no se abre para cualquiera que esté en el mismo wifi.

- Al primer arranque `scripts/rally_service.py` escribe una llave en
  `dashboard/data/acceso.txt` (formato `XXXXXX-XXXXXX-XXXXXX`) y la imprime en la
  consola. Esa llave es la puerta del equipo.
- `login.html` pide la llave. Con ella se abre una sesión (`cookie rally_sesion`
  válida 30 días, `HttpOnly`) y se entra al tablero. Sin ella, cualquier ruta que
  no sea pública responde 302 a `login.html` (o 401 si es `/api/*`).
- `admin.html` reparte invitaciones: cada una es un enlace `join.html?t=…` de 48
  horas. Quien lo abre escribe su nombre y queda como miembro con su propio
  token; el servidor no vuelve a pedir la llave.
- Revocar a alguien es borrar su miembro en `admin.html`: su cookie deja de
  valer porque el token se comprueba contra `members.db` en cada petición.
- Si el proyecto no tiene miembros (base recién copiada), `login.html` muestra el
  campo de nombre y crea el primer administrador con la llave maestra.

## 8. App Android

`apk/` tiene el código de la app (una sola vista con WebView) y `apk/README.md`
explica cómo cambiar la dirección y compilarla. Lo compilado no está en el
repositorio: cada equipo genera su APK con su URL.

```bash
python apk/build.py --url http://192.168.1.50:8000/
```

## 9. Pendiente

- `dashboard/entregables/index.html` lista hoy lo que dejó la última corrida de
  `publicar_entregables.py`; si se agrega un tipo nuevo de archivo, hay que
  enseñarle el nombre y la etiqueta en ese script, no en el HTML.
- La tarjeta `#entregables-ia` ya es una tabla de tres filas; si aparece un archivo nuevo
  en `dashboard/entregables/`, se agrega la fila en `renderViewResources()`.
- Un tipo de aviso nuevo se agrega en `DEFECTO` de `notify.js` y en las filas de
  `renderNotificar()`; sin esos dos toques, el evento se ignora en silencio.
