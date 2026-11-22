"""H-53: un aviso sin id no puede silenciar a todos los que vengan detrás.

notify.js marcaba como visto `String(detalle.id || "")`, así que el primer aviso
sin id guardaba la clave vacía y los siguientes se descartaban para siempre.
El puente de contenido emite avisos con `id: String((env && env.id) || "")`, y
un sobre sin id es normal.
"""
from __future__ import annotations

import json
import pathlib
import shutil
import subprocess

import pytest

RAIZ = pathlib.Path(__file__).resolve().parents[1]
SONDA = RAIZ / "tests" / "js" / "notify_probe.js"
NOTIFY = RAIZ / "dashboard" / "notify.js"

pytestmark = pytest.mark.skipif(
    shutil.which("node") is None, reason="sin Node no se puede ejecutar notify.js"
)


def _correr(tmp_path, avisos):
    ruta = tmp_path / "avisos.json"
    ruta.write_text(json.dumps(avisos, ensure_ascii=False), encoding="utf-8")
    salida = subprocess.run(
        ["node", str(SONDA), f"@{ruta}"],
        cwd=str(RAIZ), capture_output=True, text=True, encoding="utf-8", errors="replace",
        timeout=60,
    )
    assert salida.returncode == 0, salida.stderr
    return json.loads(salida.stdout.strip().splitlines()[-1])


def _aviso(tipo, texto, ident=""):
    return {"tipo": tipo, "id": ident, "titulo": "Rally Studio", "texto": texto}


def test_tres_avisos_sin_id_llegan_los_tres(tmp_path):
    datos = _correr(tmp_path, [
        _aviso("propuesta", "Propuesta A"),
        _aviso("cambio", "Cambio B"),
        _aviso("avance", "Avance D"),
    ])

    assert datos["lanzadas"] == 3
    assert datos["cuerpos"] == ["Propuesta A", "Cambio B", "Avance D"]


def test_el_mismo_aviso_sin_id_no_suena_dos_veces(tmp_path):
    datos = _correr(tmp_path, [
        _aviso("cambio", "Cambio B"),
        _aviso("cambio", "Cambio B"),
        _aviso("cambio", "Cambio C"),
    ])

    assert datos["cuerpos"] == ["Cambio B", "Cambio C"]


def test_el_id_explicito_sigue_deduplicando(tmp_path):
    datos = _correr(tmp_path, [
        _aviso("propuesta", "A", "p1"),
        _aviso("propuesta", "A repetida", "p1"),
        _aviso("propuesta", "B", "p2"),
    ])

    assert datos["cuerpos"] == ["A", "B"]


def test_el_aviso_de_equipo_sigue_apagado_por_defecto(tmp_path):
    datos = _correr(tmp_path, [_aviso("equipo", "Entró alguien")])

    assert datos["lanzadas"] == 0


def test_la_clave_vacia_ya_no_es_la_marca():
    fuente = NOTIFY.read_text(encoding="utf-8")

    assert "function claveDe(" in fuente
    assert "marcar(claveDe(detalle))" in fuente
    assert 'marcar(String(detalle.id || ""))' not in fuente
