# Auditoría del sistema — calidad, estabilidad y trazabilidad

Fecha: 2026-11-21 · Alcance: motor HTTP, stores/seguridad, generadores/validadores, tooling/CI.
Método: 4 auditores de solo lectura en paralelo + verificación manual línea por línea de todo lo marcado **V**.
Sin modificar archivos del motor. Los hallazgos H-1..H-67 de `docs/HALLAZGOS_SIMULACRO.md` no se repiten.

Leyenda: **V** = verificado por lectura directa del archivo citado en esta sesión · **R** = reportado por auditor, pendiente de lectura propia.

## Estado de corrección

Corregido y con pruebas verdes (`902 passed`, smoke 6/6, suites Node ok): C-1, C-2, C-3 (escape),
C-4, C-7, C-8, H-1, H-2, H-3, H-5, H-6, H-10, H-11, H-13, H-18, H-20, H-22, M-1, M-2 y M-3.
Pendientes que cambian veredictos: H-19, H-23. Diferidos por decisión de producto: el resto
(ver `docs/PLAN_AUDITORIA_2026-11-21.md`).

## Línea base (medida, no estimada)

| Comprobación | Resultado |
|---|---|
| `python -m pytest tests -q` | **901 passed**, 110 s, 0 fallos |
| `python smoke.py` | **6/6 PASA** |
| `python arsenal.py check-todo` | exit 1 — correcto para proyecto vacío |
| `node tests/super_agents_core.test.js` | pasa |
| `node tests/test_ia_cliente.mjs` | 20 ok / 0 fail |
| `node tests/test_ia_isla_e2e.mjs` | SKIP (sin motor IA) |

Las suites Node **no se ejecutan en CI** (ver T-4). No hay ninguna prueba de concurrencia (`grep threading` en `tests/`: 0).

---

## CRÍTICO

### C-1 · El motor silencia toda excepción no capturada — **V**
`scripts/rally_service.py:4187-4189`
```python
def handle_error(self, request, client_address):
    # Ignorar desconexiones abruptas del navegador
    pass
```
Cualquier fallo de un handler (persistencia, JSON, disco lleno) no deja traza ni respuesta: el cliente ve la conexión cortada. Sin esto, la mitad de los hallazgos siguientes son invisibles en producción.
**Fix:** log de `traceback.format_exc()` con IP y ruta + respuesta 500 JSON.

### C-2 · `server.js` publica el repositorio entero sin auth y muere con `%` — **V**
`server.js:6` `ROOT = __dirname`; `:47` `path.join(ROOT, decodeURIComponent(reqPath))`; `:69` `'Access-Control-Allow-Origin': '*'`; `:79` `listen(PORT, '0.0.0.0')`.
Un `GET /%` lanza `URIError` dentro del callback y mata el proceso (no hay `uncaughtException`). Y expone `brief.json`, `scripts/freellmapi.key`, `scripts/sync.token`, `dashboard/data/members.db`, `dashboard/data/acceso.txt` a cualquiera en la LAN, con CORS abierto.
**Fix:** try/catch → 400, `server.on('clientError')`, lista blanca de extensiones bajo `dashboard/`, sin CORS, `127.0.0.1`.

### C-3 · XSS almacenado en el modal de retos con la sesión en `localStorage` — **V**
`dashboard/app.js:6685` `${ch.title}` (y `:6677` id, `:6679` category) dentro de `innerHTML`; el token vive en `localStorage` (`login.js:168`, `join.js:550`, `admin.js:41/131-140`, `content_bridge.js:360`, `section_sync.js:80`, `perfil.js:66`).
Un reto importado de docx/OCR con `<img onerror=...>` ejecuta en el navegador de cada miembro y exfiltra el token = robo de sesión del equipo.
**Fix:** escapar con el helper de `RallyEsc`/`escapeHtml`; mover el token a cookie `HttpOnly` (el servidor ya la emite).

### C-4 · El mínimo de 150 caracteres por sección no existe en ningún validador — **V**
`checks/campo_chars.py:169` solo tiene `if cuenta > limite:` (máximo). `scripts/content_store.py:112-114` igual. El encabezado crea la clave vacía (`campo_chars.py:129` `secciones.setdefault(actual, [])`) → `" ".join([]) == ""` → cuenta 0 → **pasa**.
La rúbrica (`knowledge/rubric_matrices.md:118`, `.agents/rules/pautado-y-guion.md:20`) exige mínimo 150. Y `tests/test_arsenal.py:152-156` **certifica** 100 caracteres como válidos.
**Fix:** `MINIMOS` por campo, `cuenta < MINIMOS[campo]` ⇒ crítico; cero ⇒ "sección vacía"; corregir el test.

### C-5 · Los 120 s no los mide ninguna compuerta de fase — **V**
`scripts/verificar_fases.py:41` `COMPUERTAS` no incluye `arsenal.py`; `:182` `"10": ["validate_pautado.py"]`; `:184` `"12": ["validate_brief.py","validate_budget.py","validate_pautado.py"]`; `:349-350` citar un binario no registrado **falla** la bitácora.
Resultado: `arsenal.py check-duracion` es la única medición real de duración y no se puede citar como evidencia de fase.
**Fix:** registrar `arsenal.py` en `COMPUERTAS` y en `COMPUERTAS_DE["10"]`/`["12"]`; fase 10 exige `check-duracion` sobre el archivo final.

### C-6 · El Excel de presupuesto y el validador leen archivos distintos — **V**
`scripts/gen_budget.py:75` `items = con_estado_vivo(json.loads(BUDGET_JSON...))` (fusiona `dashboard/data/state.json`, `:38-58`); `scripts/validate_budget.py:26` lee `budget.json` crudo.
Editar precios en la ventana cambia los totales del entregable sin que ninguna validación lo vea: cifra entregada ≠ cifra auditada.
**Fix:** validar la lista fusionada, o fallar si `state.json` y `budget.json` discrepan en `units/unit_cost/url`.

### C-7 · `brief.json` se puede destruir solo — **V**
`scripts/rally_service.py:323-330` `except (OSError, ValueError): actual = {}`; `:345-347` `ruta.write_text(json.dumps(actual...))` sin tmp+rename ni lock.
Si el archivo queda truncado (corte, dos escrituras), la siguiente escritura de sección reemplaza el brief con solo los campos del estado y **borra el resto**.
**Fix:** abortar si el JSON no parsea; escribir `brief.<uuid>.tmp` + `os.replace`; lock de escritura.

### C-8 · El candado de GPU no garantiza exclusión — **V**
`scripts/gpu_lock.py:417-421` lanza `subprocess.Popen(cmd)` **antes** de `acquire(...)`: el hijo pesado corre sin guardia mientras se negocia el lock.
`:285-303` lee `holders`, decide `len(vivos) < capacidad` y reescribe la lista completa sin CAS: dos procesos que leen 0 holders adquieren el mismo slot. `_escribir_nuevo` es atómico (`O_CREAT|O_EXCL`, `:174`) solo en la **creación**; `_reeescribir` (`:184-193`) es tmp+replace (sin corrupción, pero con actualización perdida).
**Fix:** `acquire` antes de `Popen`; CAS por relectura+verificación o un archivo por slot con `O_CREAT|O_EXCL`.

---

## ALTO

| ID | file:line | Problema | Fix |
|---|---|---|---|
| H-1 **V** | `rally_service.py:927`, `:1395-1421`, `:3210-3227` | Doble puerta: `/api/sync/*` pasa por `paso_la_puerta` (401 sin sesión) pero `sincronizar_nube.py:76` solo manda `X-Rally-Sync-Token`. La sync con la nube **nunca funciona**. | Añadir `/api/sync/` a `PREFIJOS_LIBRES`; la autorización real queda en `sync_authorized`. |
| H-2 **V** | `section_store.py:328-331` vs `admin.js:197-205` | `admin.js` escribe sin `/lock`; el store exige candado vivo para toda clave no local ⇒ 423 permanente en certamen/identidad. | Encadenar `POST /lock` antes de escribir. |
| H-3 **V** | `section_sync.js:37-41`, `:511` | `NO_LOCK` (rally_type, hours_remaining, category, exchange_rate_bcn, …) se salta el lock con un 200 falso y el servidor responde 423 ⇒ esas claves **nunca** sincronizan. | Declararlas en `CLAVES_LOCALES` del store o quitarlas de `NO_LOCK`. |
| H-4 **V** | `rally_service.py:1661` | `actor_id` lo elige el cliente: enviar `actor_id:"ia"` da el token de propiedad compartido de los agentes ⇒ se puede escribir sobre el candado de una IA y la autoría se pierde. | Derivar `actor_id` de la sesión + `agent_run_id` del servidor. |
| H-5 **V** | `nube_store.py:173-178` | `cursor` = `MAX(id)` del rally aunque `limit` trunque la página: el cliente guarda un cursor por delante de cambios que nunca recibió. | `cursor = changes[-1]["id"]` o 0; añadir `has_more`. |
| H-6 **V** | `sincronizar_nube.py:314-343` | `do_pull` avanza el cursor al final del feed aunque una descarga falle (`continue` en `:318`): ese cambio se pierde para siempre. | Avanzar el cursor solo hasta el último cambio aplicado. |
| H-7 **R** | `rally_service.py:2212` | Estáticos con `read_bytes()` completo: sin `Range`/206, un mp4 de 200 MB se carga entero por petición y no se puede reproducir por partes. | `shutil.copyfileobj` + `Range` + tope de tamaño. |
| H-8 **R** | `rally_service.py:365` | `mirror_state_to_disk` responde 200 aunque falle la persistencia: generadores leen datos viejos sin aviso. | Propagar `mirror:false` o reintento con evento de auditoría. |
| H-9 **R** | `member_store.py:588` | El `token_hash` del miembro vale como sesión permanente, sin IP ni caducidad: sirve desde cualquier máquina para siempre. | Exigir fila en `sessions` con IP + expiración. |
| H-10 **V** | `.github/workflows/tests.yml:26-29` | El job instala `requirements-dev.txt` y luego `python -m playwright install`: playwright está comentado en `requirements.txt:19` y ausente de `requirements-dev.txt` (2 líneas) ⇒ el paso falla y **pytest nunca corre**. Además fija Python 3.12 (local 3.13). | Añadir `playwright>=1.44` a dev y alinear la versión. |
| H-11 **V** | `.github/workflows/tests.yml:32` | CI solo corre pytest; las 3 suites Node no se ejecutan jamás. | `actions/setup-node@v4` + `node --test`. |
| H-12 **R** | `.github/workflows/pages.yml:7-42` | Pages publica en cada push a `main` sin depender de tests, con `cp -r dashboard/.` y lista negra de borrado: cualquier archivo de datos nuevo se publica. | `needs` del workflow de tests + lista blanca. |
| H-13 **V** | `requirements.txt:6-11` | `arsenal.py` importa `yaml`; PyYAML no está declarado ⇒ instalación limpia revienta en la ruta corta. | `pyyaml>=6.0` en el bloque A. |
| H-14 **R** | `.env.example:13-14` | Documenta `.env` como único lugar de claves y ningún código lo carga. | Cargar `.env` al arrancar o retirar la instrucción. |
| H-15 **R** | `setup_ia_gratis.ps1:118-144` | Descarga un binario remoto y lo ejecuta; si el release no publica `sha256`, avisa y **continúa**. | Abortar sin digest; verificar Authenticode. |
| H-16 **R** | `verificar_guion.py:156-171` | La estructura de 4 actos no se valida (solo cero palabras, tope y nombre). Además el reparto de actos difiere en 3 sitios: `script/script.md:12-15` 20/40/40/20, `gen_script.py:331-390` 20/40/35/25, `rubric_matrices.md:103-108` 17/33/29/21 %. | Contar actos y exigir 4; una sola fuente `comun.ACTOS`. |
| H-17 **R** | `checks/coherencia.py:24-27,164-171` | Una sola palabra ("límite", "máximo", "segundo") borra la línea entera del cruce de cifras: un dato falso en esa línea pasa. | Anclar el filtro a la línea estructural; si se descarta >20 %, fallar. |
| H-18 **R** | `checks/coherencia.py:64,79-83,150,312,318` | "43 por ciento" en dígitos se parte en 43 + 100 y pierde la marca de porcentaje ⇒ deja de ser bloqueante. | Aplicar `_POR_CIENTO` antes de `_NUMERO_HABLADO`. |
| H-19 **R** | `validate_brief.py:58-90,144-146` | Los requisitos del modo (municipio real, eje PNDH; sin tasa/siglas en Latam) son avisos: `exit 0`. | Mover a `errors`. |
| H-20 **R** | `campo_chars.py:92-94,147-148` | El tope se sobrescribe con la plantilla sin cota (`limites.update(...)` sin `min()`); con la referencia oficial acentuada el parseo lee 3 de 5 campos ("PROBLEMÁTICA", "PRE FACTIBILIDAD" no casan). | `min(declarado, LIMITS[campo])`; regex con acentos. |
| H-21 **R** | `campo_chars.py:109-113,136-140` | Texto fuera de `{SEC_*}` no se cuenta nunca: relleno alrededor del bloque escapa al tope. | Sumar párrafos huérfanos al campo en curso. |
| H-22 **R** | `gen_script.py:31-33,414`, `verificar_guion.py:33,39` | 270 palabras ÷ 130 ppm = **124,6 s** > 120 s; el guard por acto usa 144 ppm. | `PALABRAS_MAX = 260`; mismo WPM en ambos. |
| H-23 **R** | `gen_script.py:537-544` | Guion fuera de rango: WARN y `return 0`, y escribe igual los 3 artefactos. | Validar antes de escribir; `return 1`. |
| H-24 **R** | `verificar_identidad.py:154-162` | El veto de redacción IA es fail-open sin `state.json` y nunca lee el docx/md entregable. | Ausencia ⇒ fail; leer el entregable real. |
| H-25 **R** | `gen_budget.py:177-178`, `gen_pautado.py:96`, `validate_budget.py:87-89` | Sin trazabilidad: el XLSX descarta la fecha de cotización, el pautado no cita URL/fecha de acceso, `date` acepta cualquier texto. | Columna Fecha/URL en el XLSX; formatear `date` ISO no futura. |

---

## MEDIO / BAJO

- **M-1 V** `sirli_excel.py` mojibake real (74 secuencias): `wb.create_sheet("MetodologÃ­a")` (`:274`), `desaf[iÃ­]o` (`:90`) no matchea "desafío", `â€“` (`:86`) no parte títulos con guion largo. Sin tests. → reescribir los literales en UTF-8.
- **M-2 V** `validate_budget.py:48,51` `"â•" * 60` imprime basura (cosmético).
- **M-3 V** `section_sync.js:543` si falla la escritura tras el lock, `continue` sin `unlock` ⇒ bloqueo de hasta 10 min para el equipo.
- **M-4 R** `rally_service.py:2147` `/api/scan-sources` devuelve rutas absolutas del disco del anfitrión.
- **M-5 R** `rally_service.py:2345` CSRF: sin cabecera `Origin` se considera válido.
- **M-6 R** `rally_service.py:2022` cada escritura reescribe `state.json` **y** `brief.json` sin lock (escritura perdida entre hilos + request lento).
- **M-7 R** `nube_store`/`servir_propuesta.py:197`/`publicar_avance.py:117,154` sobres no atómicos y `avisos.json` read-modify-write sin lock.
- **M-8 R** `section_store.py:216,338` corrupción JSON silenciada (`data = None`), sin evento ni historial.
- **M-9 R** `gpu_lock.py:237` TTL vence a un titular vivo: render > 25 min pierde la GPU a mitad.
- **M-10 R** `heavy_guard.py:60` bypass: basta que el comando contenga `gpu_lock.py` y ` run `.
- **M-11 R** `gpu_lock.py:478-482` `release --force` sin autenticación.
- **M-12 R** `render_watch.py:25` segundo candado de GPU que ningún script de producción usa.
- **M-13 R** `arsenal.py:118` `refresh --write` fija la fecha `2026-10-19` para siempre.
- **M-14 R** `content_store.py:19` catálogo de pestañas duplicado y divergente (`impact` vs `impact_alignment`).
- **M-15 R** `comun.py:36`, `duracion.py:20`, `verificar_guion.py:39`, `campo_chars.py:22` — el mismo límite (120 s, topes) en 4+ sitios.
- **L-1 R** `member_store.py:627`, `section_store.py:444` auditoría incompleta: `revoke_member`/`set_role` no escriben evento; `unlock` firma al dueño anterior.

---

## Lo que sí está sólido

- Secciones: `BEGIN IMMEDIATE`, `base_version`, `section_history` (`section_store.py:316-340`).
- Comparaciones de token timing-safe (`compare_digest`), sin fugas en logs.
- 901 tests + smoke 6/6 coherentes con el estado real del repo.

## Prioridad de arreglo

1. C-1 (log de errores) — sin esto no se depura nada más.
2. C-2, C-3 — exposición de llave maestra y robo de sesión.
3. C-7, C-8 — pérdida de datos y doble render.
4. C-4, C-5, C-6 — rúbrica y presupuesto auditables.
5. H-1/H-2/H-3 — candados y sync (funcionalidad rota).
6. H-10/H-11/H-13 — CI que mienta que valida.
