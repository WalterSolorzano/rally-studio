"""Fase 7, item 408: un solo render a la vez.

La regla 8 de AGENTS.md pide consultar render_watch.py antes de lanzar un render.
Antes solo median RAM y CPU: dos renders simultaneos pasaban los dos.
"""
import json
import pathlib
import sys

import pytest

RAIZ = pathlib.Path(__file__).resolve().parent.parent
if str(RAIZ / "scripts") not in sys.path:
    sys.path.insert(0, str(RAIZ / "scripts"))

import render_watch  # noqa: E402


@pytest.fixture(autouse=True)
def candado_en_tmp(tmp_path, monkeypatch):
    monkeypatch.setattr(render_watch, "LOCK_RENDER", tmp_path / "rally_render.lock")
    yield
    (tmp_path / "rally_render.lock").unlink(missing_ok=True)


def test_el_primer_render_toma_el_turno():
    assert render_watch.turno_de_render("blender") is True
    assert render_watch.LOCK_RENDER.exists()


def test_el_segundo_render_espera(capsys):
    assert render_watch.turno_de_render("blender") is True
    assert render_watch.turno_de_render("tts") is False
    assert "[TURNO]" in capsys.readouterr().out


def test_al_liberar_el_gpu_queda_libre():
    assert render_watch.turno_de_render("blender") is True
    render_watch.liberar_render()
    assert not render_watch.LOCK_RENDER.exists()
    assert render_watch.turno_de_render("tts") is True


def test_un_candado_de_proceso_muerto_no_bloquea(monkeypatch):
    render_watch.LOCK_RENDER.write_text(
        json.dumps({"pid": 999999, "etiqueta": "render cancelado"}), encoding="utf-8")
    monkeypatch.setattr(render_watch.psutil, "pid_exists", lambda pid: False)
    assert render_watch.turno_de_render("blender") is True
    datos = json.loads(render_watch.LOCK_RENDER.read_text(encoding="utf-8"))
    assert datos["etiqueta"] == "blender"


def test_un_candado_corrupto_no_bloquea_para_siempre(monkeypatch):
    render_watch.LOCK_RENDER.write_text("{no es json", encoding="utf-8")
    monkeypatch.setattr(render_watch.psutil, "pid_exists", lambda pid: False)
    assert render_watch.turno_de_render("tts") is True


def test_dos_copias_aisladas_compiten_por_el_mismo_candado(tmp_path):
    """El candado no vive en el repo: dos workbenches distintos no pueden renderizar a la vez."""
    assert render_watch.LOCK_RENDER.parent != RAIZ
