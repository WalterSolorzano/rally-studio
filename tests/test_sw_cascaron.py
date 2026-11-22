"""El service worker no puede entregar el HTML del cascarón como si fuera un script.

Medido con `tests/js/sw_probe.js` sobre `dashboard/sw.js` real, sin red:

- antes: una petición de `escape.js` sin copia en caché recibía el `index.html`
  cacheado. El navegador lo mete en un `<script>` y falla con error de sintaxis,
  así que `window.RallyEsc` no existe y todos los módulos del tablero revientan.
- después: la navegación cae en el cascarón (bien) y cualquier otro recurso sin
  copia falla como error de red, que es lo que de verdad pasó.
"""
from __future__ import annotations

import json
import shutil
import subprocess
import sys
from pathlib import Path

import pytest

RAIZ = Path(__file__).resolve().parent.parent
SONDA = RAIZ / "tests" / "js" / "sw_probe.js"
SW = RAIZ / "dashboard" / "sw.js"
NODE = shutil.which("node")

pytestmark = pytest.mark.skipif(NODE is None, reason="necesita Node")


def _correr(tipo: str) -> dict:
    salida = subprocess.run(
        [NODE, str(SONDA), tipo],
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


def test_la_navegacion_sin_red_abre_el_cascaron():
    assert _correr("navegacion")["resultado"] == "HTML-CASCARON"


def test_un_script_sin_copia_no_recibe_html():
    datos = _correr("script")
    assert datos["resultado"] != "HTML-CASCARON"
    assert datos["resultado"] == "error-de-red"


def test_un_recurso_con_copia_se_sirve_del_cache():
    assert _correr("imagen")["resultado"] == "PNG-CASCARON"


def test_un_recurso_sin_copia_no_recibe_el_cascaron():
    assert _correr("imagen-sin-copia")["resultado"] == "error-de-red"


def test_una_peticion_que_no_es_get_no_se_toca():
    assert _correr("post")["resultado"] == "sin-respuesta"


def test_el_arreglo_sigue_en_el_codigo():
    fuente = SW.read_text(encoding="utf-8")
    assert 'pedido.mode === "navigate"' in fuente
    assert 'throw new Error("sin-red-y-sin-copia")' in fuente
    assert 'return guardado || caches.match("./index.html")' not in fuente
