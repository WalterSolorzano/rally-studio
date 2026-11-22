"""Un token equivocado en el panel no puede llevarse la sesión que sí servía.

Medido: `guardarSesion()` escribía el token en `localStorage` antes de probarlo
y no tenía rama de fallo, así que un dedazo dejaba al admin fuera, con la
pantalla muda y diciendo «Sesión vencida.».
"""
from __future__ import annotations

import json
import shutil
import subprocess
import sys
from pathlib import Path

import pytest

RAIZ = Path(__file__).resolve().parent.parent
SONDA = RAIZ / "tests" / "js" / "admin_probe.js"
NODE = shutil.which("node")

pytestmark = pytest.mark.skipif(NODE is None, reason="necesita Node")


def _correr(escenario: str, extra: str | None = None) -> dict:
    comando = [NODE, str(SONDA), escenario]
    if extra:
        comando.append(extra)
    salida = subprocess.run(
        comando,
        capture_output=True,
        text=True,
        encoding="utf-8",
        errors="replace",
        timeout=60,
    )
    assert salida.returncode == 0, salida.stderr
    return json.loads(salida.stdout)


def test_el_token_bueno_se_guarda_sin_mensaje():
    datos = _correr("bueno")
    assert datos["ok"] is True
    assert datos["token"] == "bueno"
    assert datos["mensaje"] == ""
    assert "Ana" in datos["sesion"]


def test_el_token_malo_conserva_la_sesion_anterior():
    datos = _correr("malo")
    assert datos["token"] == "bueno"
    assert "conservó la sesión anterior" in datos["mensaje"]
    assert "Ana" in datos["sesion"]


def test_el_token_malo_sin_sesion_previa_pide_uno_nuevo():
    datos = _correr("malo", "sinprevia")
    assert datos["token"] is None
    assert "Pide uno nuevo" in datos["mensaje"]
    assert "Sin sesión" in datos["sesion"]


def test_el_arreglo_sigue_en_el_codigo():
    fuente = (RAIZ / "dashboard" / "admin.js").read_text(encoding="utf-8")
    assert 'const previo = localStorage.getItem("rally_session_token")' in fuente
    assert 'localStorage.removeItem("rally_session_token")' in fuente
    assert "Se conservó la sesión anterior" in fuente
