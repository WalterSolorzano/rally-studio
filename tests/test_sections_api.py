import json
import os
import socket
import subprocess
import sys
import time
import urllib.error
import urllib.request
from pathlib import Path

import pytest

REPO_ROOT = Path(__file__).resolve().parent.parent

# El servicio exige llave desde 2026-11: cada prueba abre sesion con la maestra.
_SESION = {"token": ""}


def _free_port() -> int:
    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    s.bind(("127.0.0.1", 0))
    port = s.getsockname()[1]
    s.close()
    return port


@pytest.fixture
def servidor(tmp_path):
    port = _free_port()
    data_dir = tmp_path / "data"
    data_dir.mkdir()
    env = os.environ.copy()
    env.update({
        "RALLY_SERVICE_PORT": str(port),
        "RALLY_DATA_DIR": str(data_dir),
        "PYTHONIOENCODING": "utf-8",
    })
    proc = subprocess.Popen(
        [sys.executable, "scripts/rally_service.py"],
        cwd=str(REPO_ROOT), env=env,
        stdout=subprocess.PIPE, stderr=subprocess.STDOUT,
    )
    base = f"http://127.0.0.1:{port}"
    deadline = time.time() + 30
    while time.time() < deadline:
        try:
            with urllib.request.urlopen(base + "/health", timeout=1) as r:
                if r.status == 200:
                    break
        except Exception:
            time.sleep(0.15)
    else:
        proc.kill()
        pytest.fail("servidor no arranco: " + proc.stdout.read().decode("utf-8", "replace"))
    yield base, data_dir
    proc.terminate()
    try:
        proc.wait(timeout=5)
    except Exception:
        proc.kill()


@pytest.fixture(autouse=True)
def sesion(servidor):
    base, data_dir = servidor
    llave = (Path(data_dir) / "acceso.txt").read_text(encoding="utf-8").strip()
    status, body, _ = call(
        "POST", base + "/api/entrar?project=main", {"llave": llave, "nombre": "Ana"}
    )
    assert status == 200, body
    _SESION["token"] = body["session"]
    yield
    _SESION["token"] = ""


def call(method, url, payload=None, origin=None, token=None):
    data = None if payload is None else json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(url, data=data, method=method)
    req.add_header("Content-Type", "application/json")
    elegido = _SESION["token"] if token is None else token
    if elegido:
        req.add_header("Authorization", "Bearer " + elegido)
    if origin:
        req.add_header("Origin", origin)
    try:
        with urllib.request.urlopen(req, timeout=6) as resp:
            raw = resp.read().decode("utf-8")
            return resp.status, (json.loads(raw) if raw else {}), dict(resp.headers)
    except urllib.error.HTTPError as exc:
        raw = exc.read().decode("utf-8")
        return exc.code, (json.loads(raw) if raw else {}), dict(exc.headers)


def test_sections_conflict_lock_and_events(servidor):
    base, _ = servidor
    status, body, _ = call("GET", base + "/api/sections?since=0")
    assert status == 200 and body["sections"] == {}

    status, body, _ = call("POST", base + "/api/sections/team", {
        "data": {"team_name": "Ana"}, "base_version": 0,
        "actor": "Ana", "actor_id": "a",
    })
    assert status == 200 and body["section"]["version"] == 1

    # Otra persona edito sobre la version 0: no puede pisar.
    status, body, _ = call("POST", base + "/api/sections/team", {
        "data": {"team_name": "Bea"}, "base_version": 0,
        "actor": "Bea", "actor_id": "b",
    })
    assert status == 409
    assert body["current"]["data"]["team_name"] == "Ana"

    # Con la version correcta si guarda.
    status, body, _ = call("POST", base + "/api/sections/team", {
        "data": {"team_name": "Bea"}, "base_version": 1,
        "actor": "Bea", "actor_id": "b",
    })
    assert status == 200 and body["section"]["version"] == 2

    # Bloqueo visible y expirable.
    status, body, _ = call("POST", base + "/api/sections/team/lock", {
        "actor": "Ana", "actor_id": "a", "ttl_minutes": 10,
    })
    assert status == 200 and body["section"]["lock_owner"] == "Ana"
    assert 9.5 * 60 <= body["section"]["lock_until"] - time.time() <= 10.5 * 60

    # Un segundo miembro de verdad (no un `actor` de mentira) choca con el bloqueo.
    status, body, _ = call("POST", base + "/api/invites", {"ttl_hours": 2})
    assert status == 200
    status, body, _ = call(
        "POST", base + "/api/project/claim",
        {"token": body["url_path"].split("t=", 1)[1], "name": "Bea", "device_id": "dev-bea"},
        token="",
    )
    assert status == 200, body
    bea = body["session"]

    status, body, _ = call("POST", base + "/api/sections/team", {
        "data": {"team_name": "Bea"}, "base_version": 2,
        "actor": "Bea", "actor_id": "b",
    }, token=bea)
    assert status == 423 and body["lock"]["lock_owner"] == "Ana"

    status, _, _ = call("POST", base + "/api/sections/team/unlock", {
        "actor": "Ana", "actor_id": "a",
    })
    assert status == 200

    status, body, _ = call("POST", base + "/api/sections/team", {
        "data": {"team_name": "Bea"}, "base_version": 2,
        "actor": "Bea", "actor_id": "b",
    }, token=bea)
    assert status == 200 and body["section"]["version"] == 3

    status, body, _ = call("GET", base + "/api/state")
    assert status == 200 and body["state"]["team"]["team_name"] == "Bea"

    status, body, _ = call("GET", base + "/api/events?since=0")
    assert status == 200
    actions = [e["action"] for e in body["events"]]
    assert "write" in actions and "lock" in actions and "unlock" in actions

    # Una pestaña vieja que manda el estado completo no pisa la seccion nueva.
    status, body, _ = call("POST", base + "/api/state", {
        "state": {"team": {"team_name": "Viejo"}},
    })
    assert status == 200 and body["mode"] == "legacy-import"
    status, body, _ = call("GET", base + "/api/state")
    assert body["state"]["team"]["team_name"] == "Bea"


def test_cors_private_only(servidor):
    base, _ = servidor
    status, _, headers = call("OPTIONS", base + "/api/sections", origin="http://192.168.1.50:8099")
    assert status == 204
    assert headers.get("Access-Control-Allow-Origin") == "http://192.168.1.50:8099"

    status, _, headers = call("OPTIONS", base + "/api/sections", origin="http://evil.example")
    assert status == 403
    assert "Access-Control-Allow-Origin" not in headers

    status, body, _ = call("POST", base + "/api/sections/team", {
        "data": {"team_name": "Lan"}, "base_version": 0,
        "actor": "Ana", "actor_id": "a",
    }, origin="http://192.168.1.50:8099")
    assert status == 200 and body["ok"] is True


def test_legacy_state_json_se_migra_sin_perder(servidor):
    base, data_dir = servidor
    legacy = {
        "team_name": "Ñandú",
        "pautado": {"problema": "Texto legado", "solucion": "Otra sección"},
        "budget": [{"element": "Sensor", "units": 1, "unit_cost": 50}],
    }
    (data_dir / "state.json").write_text(json.dumps(legacy, ensure_ascii=False), encoding="utf-8")

    status, body, _ = call("GET", base + "/api/sections?since=0")
    assert status == 200
    assert body["sections"]["team_name"]["data"] == "Ñandú"
    assert body["sections"]["pautado.problema"]["data"] == "Texto legado"

    status, body, _ = call("GET", base + "/api/state")
    assert status == 200
    assert body["state"]["pautado"]["solucion"] == "Otra sección"
