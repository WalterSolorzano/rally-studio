"""La puerta de entrada no puede mandar a otro sitio ni culpar a la llave buena.

Medido con `tests/js/login_probe.js` sobre `dashboard/login.js` real:

- `login.html?volver=/\\evil.example/x` terminaba en `location.replace("/\\\\evil.example/x")`,
  que el navegador lee como `//evil.example/x` (otro dominio) con la sesión ya
  guardada en `localStorage`.
- En modo estático sin `crypto.subtle`, la llave correcta recibía «Esa llave no
  abre esta puerta.»: la culpa era del navegador, no de quien escribía.
"""
from __future__ import annotations

import json
import shutil
import subprocess
import sys
from pathlib import Path

import pytest

RAIZ = Path(__file__).resolve().parent.parent
SONDA = RAIZ / "tests" / "js" / "login_probe.js"
NODE = shutil.which("node")

pytestmark = pytest.mark.skipif(NODE is None, reason="necesita Node")


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
    datos = json.loads(salida.stdout)
    assert datos.get("ok") is True, datos.get("error")
    return datos


def test_volver_normal_sigue_llevando_a_la_pagina_pedida():
    datos = _correr("volver-bueno")
    assert datos["reemplazo"] == ["/perfil.html"]


@pytest.mark.parametrize("escenario", ["volver-malo"])
def test_volver_con_barra_invertida_no_sale_del_sitio(escenario):
    datos = _correr(escenario)
    destino = datos["reemplazo"][0]
    assert "evil" not in destino
    assert not destino.startswith("//")
    assert not destino.startswith("/\\")
    assert destino == "/"


def test_un_enlace_de_invitacion_pegado_va_a_join():
    datos = _correr("invitacion-pegada")
    assert datos["reemplazo"] == ["join.html?t=tok-123"]


def test_sin_crypto_no_se_culpa_a_la_llave():
    datos = _correr("estatico-sin-subtle")
    assert "no abre esta puerta" not in datos["estado"]
    assert "https" in datos["estado"] or "localhost" in datos["estado"]
    assert datos["reemplazo"] == []
    assert "rally_session_token" not in datos["guardado"]


def test_los_codigos_del_motor_se_explican():
    assert "tu llave" in _correr("llave-vacia")["estado"].lower()
    assert "no coinciden" in _correr("clave-invalida")["estado"]
    assert "todavía no aprueba" in _correr("pendiente")["estado"]


def test_el_arreglo_sigue_en_el_codigo():
    fuente = (RAIZ / "dashboard" / "login.js").read_text(encoding="utf-8")
    assert 'ruta.charAt(1) !== "\\\\"' in fuente
    assert 'return Promise.reject(new Error("sin-crypto"))' in fuente
    assert 'Promise.resolve("")' not in fuente
