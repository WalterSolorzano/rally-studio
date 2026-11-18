import json
import os
import subprocess
import sys
import time
import urllib.error
import urllib.request
from pathlib import Path

import pytest

from tests.support import bootstrap, call, free_port, llave

REPO_ROOT = Path(__file__).resolve().parent.parent


@pytest.fixture
def servidor(tmp_path):
    port = free_port()
    data_dir = tmp_path / "data"
    data_dir.mkdir()

    env = os.environ.copy()
    env["RALLY_SERVICE_PORT"] = str(port)
    env["RALLY_DATA_DIR"] = str(data_dir)
    env["PYTHONIOENCODING"] = "utf-8"

    proc = subprocess.Popen(
        [sys.executable, "scripts/rally_service.py"],
        cwd=str(REPO_ROOT),
        env=env,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
    )
    base = f"http://127.0.0.1:{port}"

    deadline = time.time() + 30
    while time.time() < deadline:
        try:
            with urllib.request.urlopen(base + "/health", timeout=1) as resp:
                if resp.status == 200:
                    break
        except Exception:
            time.sleep(0.2)
    else:
        proc.kill()
        salida = proc.stdout.read().decode("utf-8", "replace")
        pytest.fail(f"el servidor no arrancó: {salida}")

    yield base, data_dir / "content"

    proc.terminate()
    try:
        proc.wait(timeout=5)
    except Exception:
        proc.kill()


_SESION = {"token": ""}


@pytest.fixture(autouse=True)
def sesion(servidor):
    """La puerta del servicio exige llave: cada prueba abre sesion con la maestra."""
    base, content_dir = servidor
    llave = (content_dir.parent / "acceso.txt").read_text(encoding="utf-8").strip()
    estado, cuerpo = post_json(
        base + "/api/entrar?project=main", {"llave": llave, "nombre": "Admin"}
    )
    assert estado == 200, cuerpo
    _SESION["token"] = cuerpo["session"]
    yield
    _SESION["token"] = ""


def _abrir(url, data=None, metodo="GET", cabeceras=None):
    req = urllib.request.Request(url, data=data, method=metodo)
    req.add_header("Content-Type", "application/json")
    if _SESION["token"]:
        req.add_header("Authorization", "Bearer " + _SESION["token"])
    for clave, valor in (cabeceras or {}).items():
        req.add_header(clave, valor)
    return req


def get_json(url):
    try:
        with urllib.request.urlopen(_abrir(url), timeout=5) as resp:
            return resp.status, json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as exc:
        cuerpo = exc.read().decode("utf-8")
        return exc.code, (json.loads(cuerpo) if cuerpo else {})


def post_json(url, payload=None):
    data = b"" if payload is None else json.dumps(payload).encode("utf-8")
    req = _abrir(url, data=data, metodo="POST")
    try:
        with urllib.request.urlopen(req, timeout=5) as resp:
            return resp.status, json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as exc:
        cuerpo = exc.read().decode("utf-8")
        return exc.code, (json.loads(cuerpo) if cuerpo else {})


def envelope(item_id="p1", tab="pautado", slot="problema"):
    return {
        "id": item_id, "tab": tab, "slot": slot, "kind": "text",
        "title": "Propuesta", "source": "test",
        "created_at": "2026-10-19T10:00:00-06:00",
        "confidence": "media", "simulated": False,
        "payload": {"text": "Hola"},
    }


def test_content_roundtrip(servidor):
    base, content_dir = servidor

    status, body = post_json(base + "/api/state", {"state": {"team_name": "Ñandú"}})
    assert status == 200 and body["ok"] is True

    status, body = get_json(base + "/api/state")
    assert status == 200
    assert body["state"]["team_name"] == "Ñandú"

    status, body = get_json(base + "/api/content/manifest")
    assert status == 200
    assert body["items"] == []

    content_dir.mkdir(parents=True, exist_ok=True)
    (content_dir / "p1.json").write_text(
        json.dumps(envelope(), ensure_ascii=False), encoding="utf-8"
    )

    status, body = get_json(base + "/api/content/manifest")
    assert status == 200
    assert [i["id"] for i in body["items"]] == ["p1"]

    status, body = get_json(base + "/api/content/p1")
    assert status == 200
    assert body["payload"] == {"text": "Hola"}

    status, body = post_json(base + "/api/content/p1/apply")
    assert status == 200 and body["ok"] is True

    status, body = get_json(base + "/api/content/manifest")
    assert body["items"] == []

    status, body = post_json(base + "/api/content/p1/apply")
    assert status == 200 and body["ok"] is True


def test_content_manifest_survives_corrupt_file(servidor):
    base, content_dir = servidor
    content_dir.mkdir(parents=True, exist_ok=True)
    (content_dir / "roto.json").write_text("{no es json", encoding="utf-8")

    status, body = get_json(base + "/api/content/manifest")
    assert status == 200
    assert body["items"] == []


def test_content_rejects_bad_id(servidor):
    base, _ = servidor
    status, _body = get_json(base + "/api/content/..%2f..%2fetc%2fpasswd")
    assert status == 404


def test_content_schema_lists_tabs(servidor):
    base, _ = servidor
    status, body = get_json(base + "/api/content/schema")
    assert status == 200
    assert "pautado" in body["tabs"]
    assert "problema" in body["slots"]["pautado"]


def _request(base, path, metodo="GET", cuerpo=None, cabeceras=None):
    data = json.dumps(cuerpo).encode("utf-8") if cuerpo is not None else None
    req = _abrir(base + path, data=data, metodo=metodo, cabeceras=cabeceras)
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            return resp.status, dict(resp.headers), resp.read().decode("utf-8")
    except urllib.error.HTTPError as e:
        return e.code, dict(e.headers), e.read().decode("utf-8")


def test_new_routes_do_not_advertise_cross_origin(servidor):
    base, _ = servidor
    estado, cabeceras, _ = _request(base, "/api/state")
    assert estado == 200
    assert "Access-Control-Allow-Origin" not in cabeceras


def test_post_from_foreign_origin_is_rejected(servidor):
    base, _ = servidor
    estado, _, _ = _request(base, "/api/state", "POST", {"state": {"a": 1}}, {"Origin": "http://malo.example"})
    assert estado == 403
    estado_propio, _, _ = _request(base, "/api/state", "POST", {"state": {"a": 1}}, {"Origin": base})
    assert estado_propio == 200



def test_no_se_puede_salir_de_la_carpeta_con_dos_puntos(servidor):
    """`..` en la ruta no puede esquivar la lista de archivos privados.

    Antes, `/dashboard/../dashboard/data/members.db` no empezaba por `data/`,
    así que `private_static` lo dejaba pasar y entregaba la base de miembros.
    """
    base, _ = servidor
    for ruta in (
        "/dashboard/../dashboard/data/members.db",
        "/dashboard/../dashboard/data/state.json",
        "/dashboard/../../brief.json",
    ):
        estado, _, _ = _request(base, ruta)
        assert estado in (400, 403, 404), f"{ruta} devolvió {estado}"


def test_ruta_absoluta_y_archivos_ocultos_no_se_sirven(servidor):
    """`/C:/...` pasa `PurePosixPath` y `DASHBOARD_DIR / rel` devuelve la ruta
    absoluta: se servía cualquier archivo del disco. Y `.git/`, `.env` y `*.key`
    son configuración, no contenido del proyecto."""
    base, _ = servidor
    for ruta in (
        "/C:/Windows/win.ini",
        "/dashboard/C:/Windows/win.ini",
        "//servidor/recurso",
        "/dashboard/.env",
        "/.git/config",
        "/scripts/freellmapi.key",
    ):
        estado, _, cuerpo = _request(base, ruta)
        assert estado in (400, 403, 404), f"{ruta} devolvió {estado}"
        assert "win.ini" not in cuerpo and "[core]" not in cuerpo


def test_asset_delete_exige_id_valido_y_rol(servidor):
    """`aid="*"` en `glob(aid + "__*")` borraba TODOS los recursos del equipo."""
    base, _ = servidor
    estado, _, _ = _request(base, "/api/asset-delete", "POST", {"id": "*"})
    assert estado == 400


def _claim_member(base, name="Miembro"):
    est, inv = post_json(base + "/api/invites?project=main", {"ttl_hours": 48})
    assert est == 200, inv
    est, claimed = post_json(
        base + "/api/project/claim?project=main", {"token": inv["token"], "name": name}
    )
    assert est == 200, claimed
    # El que se une queda pendiente: el admin lo aprueba y solo entonces entra.
    est, aprobado = post_json(
        base + "/api/members/" + claimed["member"]["id"] + "/approve?project=main",
        {"approved": True},
    )
    assert est == 200, aprobado
    return claimed["member"]["id"], claimed["session"]


def test_miembro_no_edita_identidad_ni_cambia_roles(servidor):
    base, _ = servidor
    member_id, member_token = _claim_member(base)
    admin_token = _SESION["token"]

    est, _ = post_json(base + "/api/sections/team_name/lock?project=main",
                       {"data": None, "base_version": 0})
    assert est == 200
    est, _ = post_json(base + "/api/sections/team_name?project=main",
                       {"data": "Squad", "base_version": 0})
    assert est == 200

    _SESION["token"] = member_token
    try:
        est, body = post_json(base + "/api/sections/team_name?project=main",
                              {"data": "Hack", "base_version": 1})
        assert est == 403 and body["error"] == "sin-permiso"

        est, _ = post_json(base + "/api/sections/rally_type?project=main",
                           {"data": "latam", "base_version": 0})
        assert est == 403

        # Las secciones de contenido siguen abiertas para el miembro.
        est, _ = post_json(base + "/api/sections/solution/lock?project=main", {})
        assert est == 200
        est, _ = post_json(base + "/api/sections/solution?project=main",
                           {"data": {"texto": "ok"}, "base_version": 0})
        assert est == 200

        est, _ = post_json(
            base + "/api/members/" + member_id + "/role?project=main", {"role": "admin"}
        )
        assert est == 403
    finally:
        _SESION["token"] = admin_token

    est, body = post_json(
        base + "/api/members/" + member_id + "/role?project=main", {"role": "operator"}
    )
    assert est == 200 and body["member"]["role"] == "operator"


# --- tunel con HTTPS: la IP real del visitante ---

class _Falso:
    """Lo minimo que _client_ip lee de un handler."""

    def __init__(self, peer, headers=None):
        self.client_address = (peer, 54321)
        self.headers = headers or {}


def _rs():
    import sys as _sys

    _sys.path.insert(0, str(REPO_ROOT / "scripts"))
    import rally_service as rs  # noqa: E402

    return rs


def test_cabecera_de_proxy_se_ignora_si_no_viene_de_la_maquina(monkeypatch):
    """Un vecino del WiFi no puede hacerse pasar por local."""
    rs = _rs()
    monkeypatch.delenv("RALLY_TRUST_PROXY", raising=False)
    falso = _Falso("192.168.1.50", {"X-Forwarded-For": "127.0.0.1"})
    assert rs._client_ip(falso) == "192.168.1.50"


def test_cabecera_de_proxy_se_cree_cuando_viene_del_tunel_local(monkeypatch):
    rs = _rs()
    monkeypatch.delenv("RALLY_TRUST_PROXY", raising=False)
    assert rs._client_ip(_Falso("127.0.0.1", {"X-Forwarded-For": "203.0.113.9"})) == "203.0.113.9"
    assert rs._client_ip(_Falso("::1", {"CF-Connecting-IP": "198.51.100.7"})) == "198.51.100.7"
    # basura en la cabecera: se ignora y queda el par real
    assert rs._client_ip(_Falso("127.0.0.1", {"X-Forwarded-For": "no-soy-ip"})) == "127.0.0.1"


def test_trust_proxy_en_cero_apaga_la_lectura(monkeypatch):
    rs = _rs()
    monkeypatch.setenv("RALLY_TRUST_PROXY", "0")
    assert rs._client_ip(_Falso("127.0.0.1", {"X-Forwarded-For": "203.0.113.9"})) == "127.0.0.1"


def test_llave_maestra_no_abre_desde_ip_publica(servidor):
    """Aunque llegue por el tunel, la llave maestra sigue siendo solo local."""
    base, content = servidor
    data_dir = content.parent
    status, body, _ = call(
        "POST", base + "/api/entrar?project=main",
        {"llave": llave(str(data_dir)), "nombre": "Admin"},
        headers={"X-Forwarded-For": "203.0.113.9"},
    )
    assert status == 403, body
    assert body["error"] == "llave-solo-local"


def test_la_llave_maestra_sigue_abriendo_desde_la_maquina(servidor):
    base, content = servidor
    data_dir = content.parent
    status, body, _ = call(
        "POST", base + "/api/entrar?project=main",
        {"llave": llave(str(data_dir)), "nombre": "Admin"},
    )
    assert status == 200, body
    assert body["session"]


def test_sondas_desde_ip_publica_terminan_en_bloqueo(servidor, monkeypatch):
    """Veinte pedidos privados sin sesion y el que insiste queda fuera."""
    base, content = servidor
    monkeypatch.setenv("RALLY_TEST_DATA_DIR", str(content.parent))
    bootstrap(base, "tunel", "Ana")
    visto = None
    for _ in range(30):
        visto, _, _ = call(
            "GET", base + "/api/sections?project=tunel",
            headers={"X-Forwarded-For": "198.51.100.44"},
        )
    assert visto == 429
