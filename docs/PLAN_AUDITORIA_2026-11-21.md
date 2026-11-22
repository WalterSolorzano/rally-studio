# Plan de corrección — auditoría 2026-11-21

Autorizado: «arregla todo, haz un plan y vas tachando todo comprobado que no rompe nada y que no hace cambios gigantes y los test».
Estado final: **902 passed** (antes 901), `smoke.py` 6/6, suites Node ok, `py_compile` OK en los 8 módulos tocados.

## Lote 1 — validadores, requisitos y CI — HECHO
- [x] C-4 · `checks/campo_chars.py`: `MINIMO_CAMPO = 150`; sección vacía o corta = crítico; la plantilla ya no puede relajar el tope oficial (`min(declarado, LIMITS[campo])`).
- [x] C-4 · `tests/test_arsenal.py`: el test que certificaba 100 caracteres ahora usa 160 y hay caso nuevo de sección vacía.
- [x] H-13 · `requirements.txt`: `pyyaml>=6.0`.
- [x] H-10/H-11 · `.github/workflows/tests.yml`: `playwright>=1.44` en dev y job `node` con `node --test` de las suites versionadas.
- [x] M-1/M-2 · mojibake: 47 secuencias reparadas en `scripts/sirli_excel.py` (hoja `Metodología`, `desaf[ií]o`, guion largo U+2013) y marco de `validate_budget.py` a `=`.
- Nota: el mínimo **no** se impuso en `content_store.py` porque rompía 8 pruebas de fontanería del buzón; la compuerta real es `validate_pautado.py` (campo_chars), que sí lo exige.

## Lote 2 — motor HTTP, datos y dashboard — HECHO
- [x] C-1 · `rally_service.py` `handle_error`: traza con IP y ruta a stderr (antes `pass`).
- [x] C-7 · `rally_service.py` espejo de brief: si el JSON no parsea **no** se reemplaza; escritura tmp + `os.replace`.
- [x] C-2 · `server.js`: `%` mal formado → 400, `clientError`, sin CORS `*`, bind `127.0.0.1` (configurable), lista blanca (`dashboard/`, `assets/`, `brand/`, `research/`, `knowledge/`) y bloqueo de `.git`, `scripts/`, claves, `.db`, `.ps1`.
- [x] C-3 · `dashboard/app.js`: `title/id/category/ods` del reto escapados con `escapeHtml`.
- [x] H-1 · `/api/sync/` en `PREFIJOS_LIBRES`; cada handler sigue verificando `sync_authorized()`.
- [x] H-2 · `dashboard/admin.js` pide `/lock`, escribe y libera.
- [x] H-3 · `section_sync.js` ya no finge un 200 en `NO_LOCK`: pide candado siempre y lo suelta al terminar o al fallar.

## Lote 3 — sync y GPU — HECHO
- [x] H-5 · `nube_store.changes`: cursor = último cambio entregado + `has_more`.
- [x] H-6 · `sincronizar_nube.do_pull`: recorre ordenado por id y se detiene en el primer fallo; el cursor avanza solo hasta lo aplicado.
- [x] C-8 · `gpu_lock`: `acquire` antes de `Popen`; `_reescribir_si` (CAS) en adquisición y robo por prioridad.

## Lote 4 — generadores y checks — PARCIAL
- [x] H-22 · `gen_script.py`: `PALABRAS_MAX = 260` (270 no cabe en 120 s a 130 ppm).
- [x] H-18 · `coherencia.py`: los porcentajes en dígitos se resuelven antes de convertir «ciento» a 100.
- [x] H-20 · `campo_chars.py`: tope = `min(declarado, oficial)`.
- [ ] H-23 · `gen_script.py:537` fuera de rango ⇒ `return 1` — pendiente: hay que devolver código después de escribir, cambiar la firma de salida.
- [ ] H-19 · `validate_brief.py` requisitos del modo a `errors` — pendiente: cambia el veredicto del brief vacío y hay pruebas que dependen de `exit 0`.

## Diferido (decisión de producto)
Token a cookie `HttpOnly` (C-3 completo), `actor_id` derivado del servidor (H-4),
`pages.yml` con lista blanca (H-12), `.env` (H-14), digest obligatorio en
`setup_ia_gratis.ps1` (H-15), heartbeat/TTL de `gpu_lock` (M-9), 4 actos (H-16),
`Range`/206 en estáticos (H-7), `mirror_state_to_disk` (H-8), sesión permanente por
`token_hash` (H-9), CSRF sin `Origin` (M-5), rutas absolutas en `/api/scan-sources` (M-4).
