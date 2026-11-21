# Comunicación entre IAs: canales, consentimiento y contenido — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Cerrar los cuatro huecos de la auditoría de comunicación entre IAs: canal de contratos no exigido, escritura directa por defecto, autor anónimo y contenido sin revisar antes de llegar a la ventana.

**Architecture:** Cuatro cambios independientes sobre la capa de contenido y las compuertas. No se toca el motor (`scripts/rally_service.py`, `dashboard/`, cálculos de rúbrica): todo vive en `scripts/verificar_fases.py`, `scripts/servir_propuesta.py`, `scripts/publicar_seccion.py` y `scripts/content_store.py`.

**Tech Stack:** Python 3 (stdlib), pytest, servidor local de Rally Studio con tokens de sesión.

**Spec:** `docs/HALLAZGOS_SIMULACRO.md` y `.agents/rules/proceso-obligatorio.md` §5.0; hallazgos H1–H4 de la auditoría del 2026-11-21 (registrados abajo).

## Global Constraints

- Frontera dura: no editar `scripts/rally_service.py`, `dashboard/index.html`, `dashboard/app.js` ni validadores de rúbrica.
- Todo texto que lee el humano pasa por `chequear_slop_ia()` (`scripts/check_anti_generico.py:320`); su lista `SLOP_IA_PATTERNS` (`:216`) manda.
- Límites de caracteres: única fuente `checks.campo_chars.limites_para(evento)` (`checks/campo_chars.py:36`); latam `{problema:1250, solucion:1250, impacto:1000, innovacion:1000, prefactibilidad:1500}`, nacional `{}`.
- La ventana nunca sobrescribe sin Aceptar/Descartar: el buzón es el default; la escritura directa es opt-in explícito.
- Códigos de salida: 0 ok, 1 sobre inválido (incluye `payload` que no es objeto), 2 conflicto, 3 bloqueada, 4 no autorizado, 5 contenido rechazado (slop, tope, URL), 6 falta autor (`--actor-id` vacío o `"ia"` en la escritura directa).
- Nada de comentarios decorativos; solo decisiones y límites.

## Review Focus

1. Servidor caído con `--directo`: hoy `urllib.error.URLError` escapa del `try` de `servir_propuesta.main` y revienta con traza; debe salir con código 4 y mensaje.
2. `--simulated` junto a `--directo`: el orden de guardas debe dejar `simulated` fuera del camino directo siempre.
3. `canal/` con un solo contrato (`01-x.json`): debe considerarse válido; la compuerta no puede exigir continuidad que aún no existe.
4. Texto con acentos y emoji: el tope de caracteres cuenta code points, no bytes.
5. Payload no-dict en el buzón: error legible, nunca excepción sin capturar.

---

### Task 1: La compuerta de fases audita el canal de contratos

**Files:**
- Modify: `scripts/verificar_fases.py:41-48` (registro `COMPUERTAS`), `scripts/verificar_fases.py:391-410` (arranque de `main`)
- Test: `tests/test_verificar_fases_canal.py`

**Interfaces:**
- Consumes: `scripts/verificar_canal.verificar(carpeta: Path, brief: Path | None) -> list[str]`.
- Produces: `revisar_canal(raiz: pathlib.Path) -> str` — cadena vacía si no hay `canal/` o si pasa; motivo del fallo si rompe.

- [ ] **Step 1: Write the failing test**

```python
# tests/test_verificar_fases_canal.py
import json, sys
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(RAIZ / "scripts"))

import verificar_fases as vf  # noqa: E402


def _canal(tmp_path, contratos):
    canal = tmp_path / "canal"
    canal.mkdir()
    for nombre, datos in contratos.items():
        (canal / nombre).write_text(json.dumps(datos), encoding="utf-8")
    return tmp_path


def test_sin_carpeta_canal_no_falla(tmp_path):
    assert vf.revisar_canal(tmp_path) == ""


def test_canal_con_un_solo_contrato_es_valido(tmp_path):
    raiz = _canal(tmp_path, {"01-pautador.json": {
        "rol": "pautador", "orden": 1,
        "hechos": {"modo": "latam"},
        "entregable": "docs/pautado_draft.docx",
    }})
    assert vf.revisar_canal(raiz) == ""


def test_canal_roto_devuelve_motivo(tmp_path):
    raiz = _canal(tmp_path, {"02-presupuestador.json": {
        "rol": "presupuestador", "orden": 2,
    }})
    motivo = vf.revisar_canal(raiz)
    assert "canal" in motivo and "01" in motivo


def test_verificar_canal_es_compuerta_registrada():
    assert "verificar_canal.py" in vf.COMPUERTAS
```

- [ ] **Step 2: Run test to verify it fails**

Run: `python -m pytest tests/test_verificar_fases_canal.py -q`
Expected: FAIL con `AttributeError: module 'verificar_fases' has no attribute 'revisar_canal'`.

- [ ] **Step 3: Implement `revisar_canal(raiz: pathlib.Path) -> str` en `scripts/verificar_fases.py`**

Regístralo en `COMPUERTAS` y escribe:

```python
def revisar_canal(raiz: pathlib.Path) -> str:
    carpeta = raiz / "canal"
    if not carpeta.is_dir():
        return ""
    if str(SCRIPTS) not in sys.path:
        sys.path.insert(0, str(SCRIPTS))
    import verificar_canal
    brief = raiz / "brief.json"
    fallos = verificar_canal.verificar(carpeta, brief if brief.is_file() else None)
    if not fallos:
        return ""
    return "canal entre roles roto (%d fallo(s)): %s" % (len(fallos), fallos[0][:120])
```

En `main()`, tras el bloque de bitácora (antes de "4. siguiente etapa"):

```python
    motivo = revisar_canal(RAIZ)
    if motivo:
        fail(motivo)
    else:
        ok("canal entre roles")
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `python -m pytest tests/test_verificar_fases_canal.py tests/test_verificar_canal.py tests/test_verificar_fases_campos.py -q`
Expected: PASS (los 4 nuevos + 47 + los existentes).

Run: `python scripts/verificar_fases.py`
Expected: imprime `OK   canal entre roles` y `EXIT=0` (hoy no existe `canal/`).

- [ ] **Step 5: Commit**

```bash
git add scripts/verificar_fases.py tests/test_verificar_fases_canal.py
git commit -m "feat: la compuerta de fases audita el canal de contratos"
```

---

### Task 2: Escritura directa solo con `--directo`

**Files:**
- Modify: `scripts/servir_propuesta.py:103-118` (argparse), `scripts/servir_propuesta.py:136-158` (guarda del camino directo)
- Test: `tests/test_servir_directo.py:40-58` (modificar), nuevo test en el mismo archivo

**Interfaces:**
- Produces: flag CLI `--directo` (bool, default `False`). El camino directo exige `--directo` **y** token **y** `not --simulated`.

- [ ] **Step 1: Write the failing test**

Modifica `test_cli_escribe_directo_cuando_hay_token` para añadir `"--directo",` a la lista de argumentos (entre `"--payload", str(payload),` y `"--server", base,`). Añade:

```python
def test_sin_directo_escribe_buzon_aunque_haya_token(servidor, tmp_path):
    base, data_dir = servidor
    boot = bootstrap(base, "equipo01", "Ana")
    payload = tmp_path / "propuesta.json"
    payload.write_text(json.dumps({"text": "Hola buzon"}), encoding="utf-8")
    out = subprocess.run(
        [sys.executable, "scripts/servir_propuesta.py",
         "--tab", "pautado", "--slot", "problema", "--kind", "text",
         "--title", "Problema", "--payload", str(payload),
         "--server", base, "--project", "equipo01", "--token", boot["admin_token"]],
        cwd=str(REPO_ROOT), capture_output=True, text=True, encoding="utf-8", timeout=30,
    )
    assert out.returncode == 0, out.stderr
    assert len(list((data_dir / "content").glob("*.json"))) == 1
    status, body, _ = call("GET", base + "/api/sections?project=equipo01",
                           headers=auth(boot["admin_token"]))
    assert status == 200
    assert "pautado.problema" not in body["sections"]
```

- [ ] **Step 2: Run test to verify it fails**

Run: `python -m pytest tests/test_servir_directo.py -q`
Expected: FAIL — `test_sin_directo...` encuentra la sección escrita en el servidor (hoy el token basta).

- [ ] **Step 3: Implementa el flag en `scripts/servir_propuesta.py`**

Añade al parser:

```python
    parser.add_argument("--directo", action="store_true",
                        help="escribe en el servidor sin Aceptar/Descartar (opt-in)")
```

Cambia la condición de la línea 137 a:

```python
    if seccion and args.token and args.directo and not args.simulated:
```

`--mailbox` sigue aceptándose (compatibilidad) pero ya no decide nada; ajusta su ayuda a `"obsoleto: el buzón es el default"`. Actualiza el docstring del módulo: la propuesta aparece en la ventana salvo `--directo`.

- [ ] **Step 4: Run tests to verify they pass**

Run: `python -m pytest tests/test_servir_directo.py tests/test_publicar_seccion.py -q`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add scripts/servir_propuesta.py tests/test_servir_directo.py
git commit -m "fix: la escritura directa exige --directo; el buzon es el default"
```

---

### Task 3: Cada propuesta firma a su autor

**Files:**
- Modify: `scripts/servir_propuesta.py:56-73` (`construir_sobre`), `:137-158` (llamada a `publicar`)
- Modify: `scripts/publicar_seccion.py:127-137` (CLI)
- Test: `tests/test_servir_directo.py` (dos casos nuevos)

**Interfaces:**
- Consumes: `publicar(server, project, section, data, token, base_version=None, actor="IA", actor_id="ia")` — ya existe (`publicar_seccion.py:62-64`).
- Produces: sobre con campos `"actor"` y `"actor_id"`; el camino directo rechaza `actor_id` vacío o `"ia"` con código 5.

- [ ] **Step 1: Write the failing test**

```python
def test_directo_sin_actor_id_es_rechazado(servidor, tmp_path):
    base, _ = servidor
    boot = bootstrap(base, "equipo01", "Ana")
    payload = tmp_path / "p.json"
    payload.write_text(json.dumps({"text": "Sin firma"}), encoding="utf-8")
    out = subprocess.run(
        [sys.executable, "scripts/servir_propuesta.py",
         "--tab", "pautado", "--slot", "problema", "--kind", "text",
         "--title", "T", "--payload", str(payload),
         "--server", base, "--project", "equipo01",
         "--token", boot["admin_token"], "--directo"],
        cwd=str(REPO_ROOT), capture_output=True, text=True, encoding="utf-8", timeout=30,
    )
    assert out.returncode == 5
    assert "actor-id" in out.stderr


def test_el_sobre_del_buzon_firma_al_autor(tmp_path, monkeypatch):
    payload = tmp_path / "p.json"
    payload.write_text(json.dumps({"text": "Firmado"}), encoding="utf-8")
    monkeypatch.setenv("RALLY_DATA_DIR", str(tmp_path / "datos"))
    codigo = main([
        "--tab", "pautado", "--slot", "problema", "--kind", "text",
        "--title", "T", "--payload", str(payload),
        "--actor", "presupuestador", "--actor-id", "presupuestador",
    ])
    assert codigo == 0
    sobres = list((tmp_path / "datos" / "content").glob("*.json"))
    env = json.loads(sobres[0].read_text(encoding="utf-8"))
    assert env["actor"] == "presupuestador"
    assert env["actor_id"] == "presupuestador"
```

- [ ] **Step 2: Run test to verify it fails**

Run: `python -m pytest tests/test_servir_directo.py -q`
Expected: FAIL — el primer caso escribe en el servidor (código 0), el segundo no encuentra `actor` en el sobre.

- [ ] **Step 3: Implementa actor/autor en `servir_propuesta.py`**

Parser:

```python
    parser.add_argument("--actor", default="IA")
    parser.add_argument("--actor-id", default=os.environ.get("RALLY_ACTOR_ID", ""))
```

En `construir_sobre`, agrega `"actor": args.actor, "actor_id": args.actor_id,` al dict del sobre. La guarda aplica solo al camino directo (un `--simulated --directo` sin firma cae al buzón, no se rechaza):

```python
    directo = bool(seccion and args.token and args.directo and not args.simulated)
    if directo and str(args.actor_id).strip().lower() in ("", "ia"):
        print("Falta --actor-id: la escritura directa firma al especialista, no 'ia'",
              file=sys.stderr)
        return 6
    if directo:
```

Pasa `actor=args.actor, actor_id=args.actor_id` a `publicar(...)`. Y captura la red caída del camino directo:

```python
        except (OSError, RuntimeError) as exc:
            print(f"No se pudo publicar: {exc}", file=sys.stderr)
            return 4
```

En `publicar_seccion.py`, añade `--actor` (default `"IA"`) y `--actor-id` (default `os.environ.get("RALLY_ACTOR_ID", "ia")`), pásalos a `publicar` y rechaza la firma anónima con el mismo criterio: `return 6` si `actor_id` es vacío o `"ia"`.

- [ ] **Step 4: Run tests to verify they pass**

Run: `python -m pytest tests/test_servir_directo.py tests/test_publicar_seccion.py tests/test_content_store.py -q`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add scripts/servir_propuesta.py scripts/publicar_seccion.py tests/test_servir_directo.py
git commit -m "feat: cada propuesta firma a su autor y la escritura directa lo exige"
```

---

### Task 4: El contenido se revisa antes de llegar a la ventana

**Files:**
- Modify: `scripts/content_store.py:48-81` (junto a `validate_envelope`)
- Modify: `scripts/servir_propuesta.py:120-134` (tras `validate_envelope`)
- Test: `tests/test_servir_contenido.py`

**Interfaces:**
- Consumes: `chequear_slop_ia(texto: str) -> list[tuple[str, str, str]]`; `checks.campo_chars.limites_para(evento: str | None = "latam") -> dict[str, int]`.
- Produces: `revisar_contenido(tab: str, slot: str, payload: dict, evento: str = "latam") -> list[str]`.

- [ ] **Step 1: Write the failing test**

```python
# tests/test_servir_contenido.py
import sys
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(RAIZ / "scripts"))

from content_store import revisar_contenido  # noqa: E402


def test_texto_con_slop_es_rechazado():
    errores = revisar_contenido("pautado", "problema", {"text": "Es importante destacar que el sistema es robusto."})
    assert errores and "slop" in errores[0].lower()


def test_texto_que_excede_el_tope_es_rechazado():
    errores = revisar_contenido("pautado", "impacto", {"text": "a" * 1001})
    assert any("1000" in e for e in errores)


def test_nacional_no_fija_topes():
    assert revisar_contenido("pautado", "impacto", {"text": "a" * 1001}, evento="nacional") == []


def test_presupuesto_sin_url_es_rechazado():
    errores = revisar_contenido("budget", "costos", {"items": [
        {"element": "Tanque", "units": 1, "unit_cost": 300},
    ]})
    assert any("url" in e.lower() for e in errores)


def test_texto_limpio_pasa():
    assert revisar_contenido("pautado", "problema", {"text": "El agua llega dos horas al día."}) == []
```

- [ ] **Step 2: Run test to verify it fails**

Run: `python -m pytest tests/test_servir_contenido.py -q`
Expected: FAIL con `ImportError: cannot import name 'revisar_contenido'`.

- [ ] **Step 3: Implementa `revisar_contenido(tab: str, slot: str, payload: dict, evento: str = "latam") -> list[str]` en `scripts/content_store.py`**

Reglas exactas:
- `pautado`/`script`: `texto = payload.get("text")`; si no es `str`, `["falta texto"]`. En `pautado`, tope = `limites_para(evento).get(slot)`; si existe y `len(texto) > tope`, `[f"{slot}: {len(texto)} > {tope} caracteres"]`.
- Ambos: `chequear_slop_ia(texto)`; cada hallazgo agrega `f"slop: {patron}"` usando el segundo elemento de la tupla.
- `budget`: `items` debe ser lista; cada fila exige `element`, `units`, `unit_cost`, `url` no vacíos; error `f"fila {i}: falta {campo}"`.
- Cualquier otro tab: `[]`.

Importa dentro de la función, con la raíz del repo en `sys.path` primero (el módulo se ejecuta como `scripts/content_store.py`, donde `sys.path[0]` es `scripts/`):

```python
def _raiz_en_path() -> None:
    raiz = str(Path(__file__).resolve().parent.parent)
    if raiz not in sys.path:
        sys.path.insert(0, raiz)
```

y dentro de `revisar_contenido`: `_raiz_en_path()`, `from check_anti_generico import chequear_slop_ia`, `from checks.campo_chars import limites_para`. Añade `import sys` al encabezado de `content_store.py`.

En `servir_propuesta.main`, tras `validate_envelope`:

```python
    evento = "latam"
    brief = REPO_ROOT / "brief.json"
    if brief.is_file():
        try:
            evento = json.loads(brief.read_text(encoding="utf-8-sig")).get("rally_type") or "latam"
        except (OSError, ValueError):
            pass
    problemas = revisar_contenido(sobre["tab"], sobre["slot"], sobre["payload"], evento)
    if problemas:
        for p in problemas:
            print(f"- {p}", file=sys.stderr)
        print("Propuesta rechazada por contenido: corrige y vuelve a servir.", file=sys.stderr)
        return 5
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `python -m pytest tests/test_servir_contenido.py tests/test_servir_directo.py tests/test_content_store.py tests/test_check_anti_generico.py -q`
Expected: PASS. Si una prueba existente sirve un `pautado` con slop, corrige el fixture (el contenido de prueba debe cumplir la regla, no la regla ceder).

- [ ] **Step 5: Commit**

```bash
git add scripts/content_store.py scripts/servir_propuesta.py tests/test_servir_contenido.py
git commit -m "feat: el contenido se revisa (slop, topes, urls) antes del buzon"
```

---

## Verificación final

```bash
python -m pytest tests -q
python scripts/verificar_fases.py
python scripts/verificar_canal.py canal --brief brief.json   # solo si canal/ existe
```

Expected: suite verde; compuerta imprime `OK   canal entre roles` y `EXIT=0`; canal OK o sin carpeta.

---

## Estado implementado (2026-11-21)

Commits en `main`: `7be6440`, `12b461f`, `e267e47`, `d9a25bd`, `cc949be`.

- Tasks 1–4 completas. Suite: `pytest tests -q` → 894 passed; `python scripts/verificar_fases.py` → `OK   canal entre roles`, `EXIT=0`; `dashboard/data/content` vacío.
- Corregido tras revisión independiente: `verificar_canal.py` y su test versionados (C1); `revisar_canal` captura `ImportError`; `_raiz_en_path` añade `scripts/` para el import como paquete (I1); `budget` acepta `element` o `concept` (M2); `publicar_seccion.py` exige `--actor-id` real (M3); contratos con BOM se leen `utf-8-sig` (M7).
- Corregido al cierre: guarda de actor solo en el camino directo, así `--simulated --directo` cae al buzón (M1); 5 = contenido / 6 = falta autor (M4); `construir_sobre` ya no envuelve un payload no-dict en `{"value": ...}`, el sobre lo rechaza con `payload debe ser un objeto` (M5); versionados los tests de assets, campos y checklist (M6).
