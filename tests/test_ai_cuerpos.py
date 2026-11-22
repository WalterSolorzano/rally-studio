"""Un cuerpo mal formado es culpa del cliente: 400, no 500 con traza de Python.

Medido en `/api/ai/quick`, `/api/ai`, `/api/ai/design`, `/api/compile-docx`,
`/api/compile-guion-docx` y `/api/template-upload`:

    {"  -> 500 {"message": "Expecting property name ... (char 1)"}
    []   -> 500 {"message": "'list' object has no attribute 'get'"}
"""
from __future__ import annotations

import json
import os
import subprocess
import sys
import time
import urllib.error
import urllib.request
from pathlib import Path

import pytest

from tests.support import free_port

REPO_ROOT = Path(__file__).resolve().parent.parent

RUTAS_JSON = [
    "/api/ai/quick",
    "/api/ai",
    "/api/ai/design",
    "/api/compile-docx",
    "/api/compile-guion-docx",
    "/api/template-upload",
    # H-62: estas dos leian el cuerpo con json.loads crudo y respondian 500
    # con el mensaje de Python (o 422 «bad-image» por un JSON roto).
    "/api/asset-delete",
    "/api/ocr",
]

_SESION = {"token": ""}


@pytest.fixture
def servidor(tmp_path):
    port = free_port()
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
            with urllib.request.urlopen(base + "/health", timeout=1):
                break
        except Exception:
            time.sleep(0.15)
    else:
        proc.kill()
        pytest.fail("servidor no arranco")

    llave = (data_dir / "acceso.txt").read_text(encoding="utf-8").strip()
    status, body = _crudo(base, "/api/entrar", {"llave": llave, "nombre": "Ana"}, token="")
    assert status == 200, body
    _SESION["token"] = body["session"]

    yield base
    _SESION["token"] = ""
    proc.terminate()
    try:
        proc.wait(timeout=5)
    except Exception:
        proc.kill()


def _crudo(base, ruta, cuerpo, token=None):
    datos = cuerpo if isinstance(cuerpo, bytes) else json.dumps(cuerpo).encode("utf-8")
    req = urllib.request.Request(base + ruta, data=datos, method="POST")
    req.add_header("Content-Type", "application/json")
    elegido = _SESION["token"] if token is None else token
    if elegido:
        req.add_header("Authorization", "Bearer " + elegido)
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            raw = resp.read().decode("utf-8")
            return resp.status, (json.loads(raw) if raw else {})
    except urllib.error.HTTPError as exc:
        raw = exc.read().decode("utf-8")
        return exc.code, (json.loads(raw) if raw else {})


@pytest.mark.parametrize("ruta", RUTAS_JSON)
def test_json_roto_responde_400(servidor, ruta):
    status, body = _crudo(servidor, ruta, b"{")
    assert status == 400, (status, body)
    assert body["message"] == "cuerpo-json-invalido", body


@pytest.mark.parametrize("ruta", RUTAS_JSON)
def test_lista_en_la_raiz_responde_400(servidor, ruta):
    status, body = _crudo(servidor, ruta, [])
    assert status == 400, (status, body)
    assert body["message"] == "se-esperaba-un-objeto", body


@pytest.mark.parametrize("ruta", RUTAS_JSON)
def test_ninguna_respuesta_lleva_la_traza_de_python(servidor, ruta):
    _, body = _crudo(servidor, ruta, b"{")
    texto = json.dumps(body, ensure_ascii=False)
    for huella in ("Expecting", "attribute", "Traceback", "line 1 column"):
        assert huella not in texto, texto


def test_ai_quick_no_acepta_texto_que_no_sea_cadena(servidor):
    status, body = _crudo(servidor, "/api/ai/quick", {"text": 42})
    assert status == 400
    assert body["message"] == "texto-no-es-cadena"


def test_ai_quick_sigue_diciendo_que_el_texto_esta_vacio(servidor):
    status, body = _crudo(servidor, "/api/ai/quick", {"text": "   "})
    assert status == 400
    assert body["message"] == "Texto vacio"


def test_el_arreglo_sigue_en_el_codigo():
    fuente = (REPO_ROOT / "scripts" / "rally_service.py").read_text(encoding="utf-8")
    assert "def cuerpo_objeto(self)" in fuente
    assert "cuerpo-json-invalido" in fuente
    assert fuente.count("self.cuerpo_objeto()") >= 7, "las rutas de IA, .docx, assets y OCR deben usarlo"


def test_ocr_sin_imagen_no_se_confunde_con_una_imagen_danada(servidor):
    status, body = _crudo(servidor, "/api/ocr", {"image": 42})
    assert status == 400, body
    assert body["message"] == "imagen-requerida"


def test_borrar_recurso_sigue_rechazando_un_id_que_no_es_id(servidor):
    status, body = _crudo(servidor, "/api/asset-delete", {"id": "*"})
    assert status == 400, body
    assert body["message"] == "id invalido"
