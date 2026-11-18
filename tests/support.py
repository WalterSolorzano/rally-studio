import json
import os
import socket
import subprocess
import sys
import urllib.error
import urllib.request
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent


def free_port() -> int:
    s = socket.socket()
    s.bind(("127.0.0.1", 0))
    port = s.getsockname()[1]
    s.close()
    return port


def correr_node(node, probe, comando, arg=None):
    """Corre una sonda de Node y devuelve su JSON.

    Antes vivia copiada en cuatro pruebas (challenges_parse, content_bridge,
    design_impacto, design_palette), palabra por palabra.
    """
    args = [node, str(probe), comando]
    if arg is not None:
        args.append(json.dumps(arg, ensure_ascii=False))
    salida = subprocess.run(args, capture_output=True, text=True, encoding="utf-8", timeout=30)
    assert salida.returncode == 0, salida.stderr
    return json.loads(salida.stdout)


def call(method, url, payload=None, headers=None, origin=None):
    data = None if payload is None else json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(url, data=data, method=method)
    req.add_header("Content-Type", "application/json")
    for key, value in (headers or {}).items():
        req.add_header(key, value)
    if origin:
        req.add_header("Origin", origin)
    try:
        with urllib.request.urlopen(req, timeout=6) as resp:
            raw = resp.read().decode("utf-8")
            return resp.status, _json(raw), dict(resp.headers)
    except urllib.error.HTTPError as exc:
        raw = exc.read().decode("utf-8")
        return exc.code, _json(raw), dict(exc.headers)


def _json(raw):
    try:
        return json.loads(raw) if raw else {}
    except ValueError:
        return {}


def auth(token):
    return {"Authorization": "Bearer " + token}


def bootstrap(base, project, name):
    data_dir = os.environ["RALLY_TEST_DATA_DIR"]
    out = subprocess.run(
        [sys.executable, "scripts/crear_proyecto.py", "--project", project,
         "--name", name, "--data-dir", data_dir],
        cwd=str(REPO_ROOT), capture_output=True, text=True, encoding="utf-8", timeout=30,
    )
    assert out.returncode == 0, out.stderr
    data = json.loads(out.stdout)
    return {
        "admin_token": data["token"],
        "join_token": data["join_url"].split("t=", 1)[1],
        "member": data["member"],
        "project": project,
    }


def llave(data_dir):
    """La llave maestra que el servidor escribe al arrancar."""
    return (Path(data_dir) / "acceso.txt").read_text(encoding="utf-8").strip()


def entrar(base, data_dir, project="main", nombre="Admin"):
    """Abre sesion con la llave maestra y devuelve el token de sesion."""
    status, body, _ = call(
        "POST", base + "/api/entrar?project=" + project,
        {"llave": llave(data_dir), "nombre": nombre},
    )
    assert status == 200, body
    return body["session"]


def claim(base, invite_token, name):
    status, body, _ = call("POST", base + "/api/project/claim",
                           {"token": invite_token, "name": name, "device_id": "dev-" + name})
    assert status == 200, body
    return body


def approve(base, project, member_id, admin_token, approved=True):
    status, body, _ = call(
        "POST", base + "/api/members/" + member_id + "/approve?project=" + project,
        {"approved": approved}, headers=auth(admin_token),
    )
    assert status == 200, body
    return body
