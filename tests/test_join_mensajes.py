"""join.js no muestra códigos del motor ni culpa a la red cuando no la hubo.

Medido: `mostrar(body.error)` imprimía `invite-usado`, `invite-expirado` y
`clave-corta` tal cual, y un fallo de `crypto.randomUUID` (contexto inseguro en
red local) llegaba al usuario como «No se pudo contactar al servidor».
"""
from __future__ import annotations

import json
import shutil
import subprocess
import sys
from pathlib import Path

import pytest

RAIZ = Path(__file__).resolve().parent.parent
SONDA = RAIZ / "tests" / "js" / "join_probe.js"
NODE = shutil.which("node")

pytestmark = pytest.mark.skipif(
    sys.platform != "win32" and NODE is None, reason="necesita Node"
)


def _correr(escenario: str) -> dict:
    salida = subprocess.run(
        [NODE, str(SONDA), escenario],
        capture_output=True,
        text=True,
        encoding="utf-8",
        errors="replace",
        timeout=60,
    )
    assert salida.returncode == 0, salida.stderr
    return json.loads(salida.stdout)


@pytest.mark.parametrize(
    "escenario, esperado",
    [
        ("usado", "ya se usó"),
        ("expirado", "venció"),
        ("corta", "al menos 6 caracteres"),
    ],
)
def test_los_codigos_del_motor_se_explican(escenario, esperado):
    datos = _correr(escenario)
    assert datos["ok"] is True
    assert esperado in datos["estado"]


def test_sin_crypto_igual_entra():
    datos = _correr("nocrypto")
    assert datos["pide"] == 1
    assert datos["reemplazo"] == ["/?project=main"]


def test_sin_sesion_avisa_y_no_guarda_nada():
    datos = _correr("sinsesion")
    assert datos["reemplazo"] == []
    assert "sin sesión" in datos["estado"]
    assert "rally_session_token" not in datos["guardado"]


def test_el_exito_guarda_la_sesion_y_el_proyecto():
    datos = _correr("ok")
    assert datos["reemplazo"] == ["/?project=main"]
    for clave in ("rally_session_token", "rally_project", "rally_member_id"):
        assert clave in datos["guardado"]


def test_el_arreglo_sigue_en_el_codigo():
    fuente = (RAIZ / "dashboard" / "join.js").read_text(encoding="utf-8")
    assert "function mensajeDe(" in fuente
    assert "typeof window.crypto.randomUUID === \"function\"" in fuente
    assert "mostrar(body.error ||" not in fuente
