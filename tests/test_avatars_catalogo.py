"""El catálogo de avatares tiene que traer el rótulo que las páginas pintan.

Medido: `RAV.lista` devolvía `{id, rol, porque}` y `join.js` y `perfil.js`
escriben `avatar.nombre` bajo cada personaje, así que las doce tarjetas de la
página de invitación y de la de perfil mostraban la palabra «undefined».
"""
from __future__ import annotations

import json
import shutil
import subprocess
from pathlib import Path

import pytest

RAIZ = Path(__file__).resolve().parent.parent
SONDA = RAIZ / "tests" / "js" / "avatars_probe.js"
NODE = shutil.which("node")

pytestmark = pytest.mark.skipif(NODE is None, reason="necesita Node")


def _correr() -> dict:
    salida = subprocess.run(
        [NODE, str(SONDA)],
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


def test_ningun_avatar_sale_sin_rotulo():
    datos = _correr()
    assert datos["total"] == 15
    assert datos["sinNombre"] == 0


def test_cada_rol_de_entrada_tiene_su_personaje():
    """Mentor, visitante y admin entran con cara propia, no con la de un oficio."""
    datos = _correr()
    for rol, avatar in datos["porRol"].items():
        assert avatar, rol
        assert avatar in datos["conNombre"], rol


def test_el_rotulo_es_el_rol_del_personaje():
    datos = _correr()
    assert datos["primero"]["nombre"] == "Director"
    assert datos["primero"]["rol"] == "Director"
    assert "sinNombre" in datos["campos"] or "nombre" in datos["campos"]


def test_el_catalogo_conserva_lo_que_ya_usaba_la_app():
    datos = _correr()
    assert datos["roles"] == 12
    assert datos["nombreDePrimero"] == "Director"
    assert datos["rolNombre"] == "Guion"
    assert datos["etiquetaLegada"] == "av_profe"


def test_las_paginas_siguen_pintando_el_rotulo():
    for pagina in ("join.js", "perfil.js"):
        fuente = (RAIZ / "dashboard" / pagina).read_text(encoding="utf-8")
        assert "avatar.nombre" in fuente, pagina
    catalogo = (RAIZ / "dashboard" / "avatars.js").read_text(encoding="utf-8")
    assert "nombre: a.rol" in catalogo
