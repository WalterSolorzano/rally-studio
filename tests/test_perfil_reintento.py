"""perfil.js no puede quedarse con los controles congelados tras un fallo.

Medido: con `GET /api/member/yo` en 500, `cargar()` deshabilitaba los avatares
antes de pedir y solo `pintar()` los volvía a habilitar. Si la lectura falla,
la página queda con los tres personajes en gris y sin forma de reintentar desde
la interfaz.
"""
from __future__ import annotations

import json
import shutil
import subprocess
import sys
from pathlib import Path

import pytest

RAIZ = Path(__file__).resolve().parent.parent
SONDA = RAIZ / "tests" / "js" / "perfil_probe.js"
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


def test_si_la_lectura_falla_los_avatares_siguen_disponibles():
    datos = _correr("yo500")
    assert datos["ok"] is True
    assert datos["radios"] == 7
    assert datos["deshabilitadosDespues"] == 0


def test_si_la_lectura_falla_se_avisa_al_usuario():
    datos = _correr("yo500")
    assert "No se pudo leer tu perfil" in datos["estado"]


def test_el_camino_feliz_no_cambia():
    datos = _correr("ok")
    assert datos["deshabilitadosDespues"] == 0
    assert "Ana" in datos["quien"]


def test_el_guardado_fallido_restaura_los_avatares():
    datos = _correr("avatar500")
    assert datos["deshabilitadosDespues"] == 0
    assert "No se pudo guardar" in datos["avatarEstado"]


def test_el_arreglo_sigue_en_el_codigo():
    fuente = (RAIZ / "dashboard" / "perfil.js").read_text(encoding="utf-8")
    assert "casillasRoles.forEach(function (casilla) { casilla.disabled = false; });" in fuente
    assert "la página no puede quedarse congelada" in fuente
