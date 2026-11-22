"""El medidor de palabras del guion mide segundos, no costumbre.

Antes: 280 palabras a 135 ppm son 124 s y el aviso decia «Entra en los 120 s»;
el tablero, ademas, daba el guion por completo hasta 280. El techo ahora sale
del tiempo oficial del certamen (120 s) y del ritmo declarado.
"""
from __future__ import annotations

import json
import shutil
import subprocess
from pathlib import Path

import pytest

RAIZ = Path(__file__).resolve().parents[1]
SONDA = RAIZ / "tests" / "js" / "guion_probe.js"

pytestmark = pytest.mark.skipif(
    shutil.which("node") is None, reason="sin Node no se puede medir el medidor del guion"
)


def _medir(conteos="0,100,240,250,269,270,280"):
    salida = subprocess.run(
        [shutil.which("node"), str(SONDA), conteos],
        capture_output=True, text=True, encoding="utf-8", errors="replace", timeout=60,
    )
    datos = json.loads(salida.stdout)
    assert datos.get("ok") is True, datos
    return datos


def _caso(datos, n):
    return next(c for c in datos["casos"] if c["n"] == n)


def test_el_techo_sale_de_120_segundos_y_del_ritmo():
    datos = _medir()
    assert datos["wpm"] == 135
    assert datos["max"] == 270
    assert round(datos["max"] / datos["wpm"] * 60) == 120


def test_280_palabras_ya_no_dicen_que_entran_en_120_s():
    caso = _caso(_medir(), 280)
    assert caso["segundos"] == 124
    assert "Entra en los 120 s" not in caso["mensaje"]
    assert "Sobran 10" in caso["mensaje"]


def test_270_palabras_avisan_que_va_justo():
    caso = _caso(_medir(), 270)
    assert caso["segundos"] == 120
    assert "pero justo" in caso["mensaje"]
    assert "holgura" in caso["mensaje"]


def test_250_palabras_pasan_sin_advertencia():
    caso = _caso(_medir(), 250)
    assert caso["segundos"] == 111
    assert "Entra en los 120 s" in caso["mensaje"]
    assert "pero justo" not in caso["mensaje"]


def test_guion_corto_dice_cuantas_faltan():
    caso = _caso(_medir(), 100)
    assert "Faltan 140" in caso["mensaje"]


def test_guion_vacio_nombra_las_270_palabras():
    caso = _caso(_medir(), 0)
    assert "270 palabras" in caso["mensaje"]


def test_el_tablero_no_da_por_completo_un_guion_de_124_s():
    app = (RAIZ / "dashboard" / "app.js").read_text(encoding="utf-8")
    assert "totalWords <= 270" in app
    assert "totalWords <= 280" not in app


def test_los_dos_medidores_usan_el_mismo_techo():
    app = (RAIZ / "dashboard" / "app.js").read_text(encoding="utf-8")
    video = (RAIZ / "dashboard" / "app_video.js").read_text(encoding="utf-8")
    assert "GUION_SEGUNDOS_MAX = 120" in video
    assert "GUION_MAX_PALABRAS = Math.floor" in video
    assert "totalWords <= 270" in app
