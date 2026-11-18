# Admin de Rally Studio — revisión y plan de UI/poderes

Fecha: 2026-11-17 · Alcance: `dashboard/admin.html`, `dashboard/admin.js`,
`dashboard/perfil.html`, `dashboard/login.js`, `scripts/member_store.py`,
`scripts/rally_service.py`, `dashboard/app.js`, `dashboard/style.css`, `brand/palette.json`.

---

## 1. Qué es hoy el "admin"

`admin.html` **no administra el proyecto**: administra accesos. Tiene tres paneles
(`admin.html:56-78`):

1. **Sesión de operador** — pegar el token que imprime `crear_proyecto.py`.
2. **Invitar a una persona** — crear enlace de un solo uso, TTL fijo 48 h.
3. **Miembros del proyecto** — nombre, rol, último acceso, botón *Retirar*.

El tipo de rally, el nombre del grupo, la universidad, la ciudad y el logo **no viven aquí**:
viven en el workbench (`app.js:3097` `renderViewCertamen`, `app.js:3217` `renderViewTeam`)
y los puede cambiar cualquiera que tenga el navegador abierto.

## 2. Poderes reales (código, no intención)

Roles en `scripts/member_store.py:21`: `admin`, `operator`, `member`.
El admin nace con la llave maestra o `crear_proyecto.py` (`member_store.py:125`).

| Poder | Endpoint / función | admin | operator | member |
|---|---|---|---|---|
| Ver estado y secciones | `GET /api/state`, `/api/sections` (`rally_service.py:539,549`) | sí | sí | sí |
| Escribir secciones (con lock) | `POST /api/sections/<id>` (`rally_service.py:1543`) | sí | sí | sí |
| Subir assets | `POST /api/asset-upload` (`rally_service.py:973`) | sí | sí | sí |
| Listar miembros | `GET /api/members` (`rally_service.py:601`) | sí | sí | **403** |
| Crear invitación | `POST /api/invites` (`rally_service.py:1394`) | sí | sí | **403** |
| Retirar acceso | `POST /api/members/<id>/revoke` (`rally_service.py:1474`) | sí | sí | **403** |
| Compilar Word | `POST /api/compile-docx` (`rally_service.py:893`) | sí | sí | **403** |
| Cambiar plantilla Word | `POST /api/template-upload` (`rally_service.py:904`) | sí | sí | **403** |
| Borrar assets | `POST /api/asset-delete` (`rally_service.py:998`) | sí | sí | **403** |
| Importar estado completo | `POST /api/state`, `/api/sections/import` (`rally_service.py:1493,1516`) | sí | sí | **403** |
| Cambiar rol de alguien | `MemberStore.set_role` (`member_store.py:388`) | **sin ruta HTTP** | — | — |

Regla dura existente: no se puede retirar ni degradar al último admin
(`member_store.py:372-379, 398-405` → error `ultimo-admin`).

**Hallazgo crítico:** `set_role` existe en el store pero **no hay endpoint** que lo exponga
(no aparece en `RUTAS_POST`, `rally_service.py:718-734`). Hoy no se puede nombrar un segundo
admin ni convertir un miembro en operador desde la UI.

**Hallazgo crítico:** `rally_type`, `team_name`, `university`, `city`, `team_logo_img` son
estado de cliente (`saveState`, `app.js:922`) y se sincronizan como secciones. **No hay
guardia de rol**: un `member` puede cambiarlos. El "flujo lineal" no está preparado por el
admin; lo prepara quien tenga la pestaña.

## 3. Flujo lineal actual

`getWorkflowStage()` (`app.js:711`):

```
0 Certamen  → 1 Equipo (nombre + universidad) → 2 Reto → 3 Solución
→ 4 Despacho/Pautado/Presupuesto → 5 Guion/Prototipo
```

`NAV_TABS` (`app.js:720-735`) tiene 14 pestañas. El setup se cierra con
`setupIsDone()` (`app.js:3043`): exige `rally_type`, `team_name`, `university` y
`challenge_id`. Desde la etapa 3, certamen y equipo dejan de ser pasos y pasan a fichas
`renderCertamenSummary` / `renderTeamSummary` (`app.js:3053,3073`) editables con
`editSetup()` (`app.js:3047`).

Problemas del flujo:

- El paso 0 y 1 son **de una persona** (la que decide certamen, marca y logo) pero el
  workbench los presenta como tareas de todo el equipo.
- No hay "handoff": nadie ve que el admin ya dejó listo certamen + identidad, ni que falta.
- Cambiar certamen reinicia el cronómetro (`selectCertamen`, `app.js:3192-3201`) sin aviso
  de que recalcula horas, moneda y rúbrica.

## 4. Paleta: el admin está fuera de sistema

`admin.html:12-41` usa variables que **no existen** en `style.css`:
`--accent`, `--muted`, `--line`, `--surface`, `--danger`. Al no existir, caen a los
fallbacks duros: `#1f6f5c` (verde), `#5c625f`, `#d9d4c8`, `#a3341f`. Resultado: el admin
se ve verde/beige mientras el workbench es azul.

Tokens reales del sistema (`style.css:6-70`):

```
--color-primary #0866F5 · --color-primary-hover #0057E7
--color-navy #0D1B35 · --color-accent #0284C7
--bg-app #FFFFFF · --bg-subtle #F8FAFD · --bg-secondary #F0F6FF
--border-light #DCE7F5 · --border-strong #CBD5E1
--text-title #0D1B35 · --text-body #334155 · --text-muted #4E6285 · --text-faint #6B7C97
--status-err-text #DC2626 · --radius-sm/md/lg 8/12/18
--font-ui Plus Jakarta Sans · --font-mono JetBrains Mono
```

`brand/palette.json` dice `primary #1d45b9`, `secondary #f81110`, `accent #2aa7ad`. Hay dos
fuentes de verdad. **Decisión para el admin:** usar los tokens de `style.css` (es lo que el
usuario ve en el workbench) y alinear `brand/palette.json` en una tarea aparte.

`perfil.html:12-70` sí usa los tokens correctos; sirve de referencia de estilo.

También incumple la ley de interfaz mínima (`.agents/rules/ui-minima.md`): párrafos de ayuda,
texto técnico visible (`crear_proyecto.py`, "token de operador"), botones sin icono.

## 5. Plan de UI propuesto

Una sola página `admin.html` con tres bloques verticales + un bloque avanzado plegado.
Cero párrafos; etiquetas de 1-2 palabras; icono SVG 16-18 px con `title` y `aria-label`.

### 5.1 Cabecera

```
[← Trabajo]   Admin            [avatar] Nombre · rol
```

Miga de progreso: `01 Certamen ✓ · 02 Identidad ✓ · 03 Equipo ○` (número solo porque decide).

### 5.2 Bloque A — Certamen (admin/operator)

Dos tarjetas grandes, reutilizando `.certamen-card` del workbench:

- **Latam 28 h** (logo `logo_rally_latam.png`, badge `28 H`)
- **Nacional 24 h** (logo `logo_rally_nacional.png`, badge `24 H`)

Selección = radio; estado seleccionado con borde `--color-primary` y check SVG.
Si ya hay trabajo (`challenge_id` o `solution_approved`), confirmación breve:
"Recalcula horas, moneda y rúbrica" con Acción/Cancelar.

### 5.3 Bloque B — Identidad (admin/operator)

Formulario de 2 columnas, mismo layout que `renderViewTeam` (`app.js:3241`):

- Squad (input, requerido)
- Universidad (input, requerido)
- Ciudad (input)
- Logo (dropzone → preview 130×130; PNG/JPG/SVG/WebP)
- Previsualización: logo + `logo_uni_official.png` + logo del rally + nombre.

Guardar es explícito ("Guardar identidad"), no por tecla. Estado `--status-ok-*`.
Los miembros ven esta ficha en modo lectura (sin inputs) con chip "Definido por admin".

### 5.4 Bloque C — Accesos (admin/operator)

- **Invitar** — botón primario + selector TTL (24/48/168 h) detrás de un icono.
  Al crear: enlace en `<output>` monoespaciado + botón copiar.
- **Miembros** — fila: avatar, nombre, chip de rol, último acceso, acciones.
  - admin: puede cambiar rol (select admin/operator/member) y retirar.
  - operator: puede invitar y retirar miembros; **no** cambia roles.
  - El último admin no muestra "Retirar" ni permite degradarse (ya lo impide el backend).
- Chip de rol con tokens: `admin` → `--color-primary`, `operator` → `--color-accent`,
  `member` → `--text-muted`. Sin colores nuevos.

### 5.5 Bloque D — Avanzado (plegado, admin)

- Sesión/token (lo que hoy es el bloque 1) — mover aquí, con icono llave.
- Plantilla Word, exportar respaldo, reiniciar proyecto (con confirmación).
- Nunca texto de ruta o de script en pantalla; solo `title`.

### 5.6 Estados vacíos / errores

- Sin sesión: una línea + icono llave + campo. Sin explicación de `crear_proyecto.py`.
- 403: `Sin permiso` + icono candado.
- 401: `Acceso vencido` + enlace "Pedir enlace".

## 6. Poderes objetivo (cambios de backend necesarios)

1. **Nueva ruta** `POST /api/members/<id>/role` → `MemberStore.set_role`, solo `admin`,
   con guardia `ultimo-admin`. (Hoy `set_role` es código muerto.)
2. **Guardia de identidad**: `POST /api/sections/certamen` y `/team*` (o un endpoint
   `PUT /api/project/identity`) que exija `admin`/`operator` para `rally_type`,
   `team_name`, `university`, `city`, `team_logo_img`.
3. **Lectura abierta**: `GET` de identidad para todos los roles (miembro ve ficha).
4. **Auditoría**: registrar `role_changed`, `identity_changed`, `certamen_changed` en el
   feed de eventos (`/api/events`).

Matriz objetivo:

| Poder | admin | operator | member |
|---|---|---|---|
| Ver identidad y certamen | sí | sí | sí |
| Editar certamen / identidad | sí | sí | no |
| Invitar / retirar | sí | sí | no |
| Cambiar roles | sí | no | no |
| Plantilla Word / compilar / borrar assets | sí | sí | no |
| Reiniciar proyecto | sí | no | no |
| Editar secciones de contenido | sí | sí | sí |

## 7. Flujo lineal "preparado por el admin"

```
Admin abre /admin
  → elige certamen            (stage 0 bloqueado para el equipo)
  → define squad/uni/ciudad/logo (stage 1)
  → invita 4–10 personas       (SIRLI)
  → [Listo]  pasa la posta
Equipo abre /                   → arranca en Retos (stage 2)
```

Reglas de presentación:

- En el workbench, si el rol es `member` y falta identidad: banner no bloqueante
  "Falta identidad" con enlace a `/admin` (solo lectura).
- Si `rally_type` y `team_name` existen, el workbench arranca en `resumen`
  (ya ocurre, `app.js:885-889`).
- `editSetup('certamen'|'team')` solo se muestra a `admin`/`operator`; el resto ve
  "Definido por admin".

## 8. Orden de implementación

1. **Tokens**: quitar `<style>` con fallbacks de `admin.html`; mover estilos a `style.css`
   usando `--border-light`, `--bg-surface`, `--text-muted`, `--color-primary`,
   `--status-err-*`, `--radius-*`, `--space-*`.
2. **Reordenar** `admin.html` en bloques A–D con iconos SVG existentes (`SVG.users`,
   `SVG.upload`; añadir `SVG.lock`, `SVG.shield`).
3. **`admin.js`**: funciones `cargarIdentidad`, `guardarIdentidad`,
   `cambiarRol`; leer/escribir `/api/sections/...` y `/api/members`.
4. **Backend**: ruta de rol + guardia de identidad + auditoría.
5. **`app.js`**: ocultar `editSetup` a miembros; ficha de identidad en lectura.
6. **Pruebas**: `tests/test_ui_contracts.py` (ya valida `admin.html/js`), añadir
   contrato de rol y de guardia de identidad.

## 9. Criterios de aceptación

- `admin.html` no define colores ni radios propios; todo sale de `style.css`.
- Cero párrafos de ayuda en la pantalla; cero nombres de archivo o de script visibles.
- Un `member` recibe 403 al intentar cambiar certamen o identidad.
- El último admin no puede retirarse ni degradarse (UI + backend).
- Un `admin` puede ascender a `operator`/`admin` y el cambio se refleja sin recargar.
- A 390 px no hay scroll horizontal; las filas de miembros colapsan a 2 columnas.
- El workbench muestra "Definido por admin" a los miembros y "Editar" solo a admin/operator.

---

### Evidencia usada

- `dashboard/admin.html:12-78` (paneles y CSS con fallbacks)
- `dashboard/admin.js:109-225` (miembros, invitación, sesión)
- `scripts/member_store.py:21,125,144,364,388` (roles, bootstrap, revoke, set_role)
- `scripts/rally_service.py:539-607,718-734,893-1001,1394-1417,1493-1537,1543-1568`
- `dashboard/app.js:711-735,3043-3212,3217-3454`
- `dashboard/style.css:6-70` · `brand/palette.json`
- `.agents/rules/ui-minima.md`
