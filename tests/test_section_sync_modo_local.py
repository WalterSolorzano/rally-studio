"""Medición de dashboard/section_sync.js con la sonda de Node.

Cubre H-44: un miembro sin permiso de siembra veía «Sincronizado · equipo en
vivo» mientras el servidor no tenía el proyecto, y un 423 dejaba la sección
bloqueada para siempre sin reintentar cuando el bloqueo ajeno vencía.
"""
import json
import shutil
import subprocess
import sys
from pathlib import Path

import pytest

RAIZ = Path(__file__).resolve().parent.parent
SONDA = RAIZ / "tests" / "js" / "section_sync_probe.js"
NODE = shutil.which("node")

pytestmark = pytest.mark.skipif(NODE is None, reason="sin Node no se puede medir el navegador")

ESTADO = {"team_name": "Equipo Semilla", "university": "UNI", "city": "Jinotega"}
EDICION = {"project_name": "Semilla"}


def _correr(modo, edicion=None):
    args = [NODE, str(SONDA), modo, json.dumps(ESTADO, ensure_ascii=False)]
    if edicion is not None:
        args.append(json.dumps(edicion, ensure_ascii=False))
    salida = subprocess.run(args, capture_output=True, text=True, encoding="utf-8", timeout=60)
    assert salida.returncode == 0, salida.stderr
    datos = json.loads(salida.stdout)
    assert datos["ok"], datos.get("error")
    return datos


def _pide(datos):
    return [f"{p['metodo']} {p['url']}" for p in datos["pide"]]


def test_miembro_sin_permiso_no_dice_sincronizado():
    datos = _correr("member")
    assert "Sincronizado" not in datos["status"]["texto"]
    assert datos["status"]["mood"] == "local"
    assert "administrador" in datos["status"]["texto"]


def test_miembro_que_escribe_no_pierde_su_texto_en_silencio():
    datos = _correr("member", EDICION)
    assert datos["status"]["mood"] == "local"
    assert "este equipo" in datos["status"]["texto"]
    assert not [p for p in _pide(datos) if p.startswith("POST")]
    assert "project_name" in datos["estado"]["dirty"]


def test_admin_siembra_y_publica_lo_que_escribe():
    datos = _correr("admin", EDICION)
    pide = _pide(datos)
    assert "POST /api/sections/import?project=main" in pide
    assert "POST /api/sections/project_name?project=main" in pide
    assert datos["estado"]["dirty"] == []
    assert datos["status"]["mood"] == "ok"


def test_un_bloqueo_vencido_no_atrapa_el_texto_para_siempre():
    datos = _correr("lock423", EDICION)
    pide = _pide(datos)
    bloqueos = [p for p in pide if p.startswith("POST /api/sections/team_name/lock")]
    assert len(bloqueos) >= 2, "no reintentó después de que el bloqueo ajeno venció"
    assert "POST /api/sections/team_name?project=main" in pide
    assert datos["estado"]["dirty"] == []
    assert datos["status"]["mood"] == "ok"
