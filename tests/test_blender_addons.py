#!/usr/bin/env python3
"""Tests de blender_addons.py."""

import json
from pathlib import Path

from scripts.blender_addons import addons_para_tipo, instalar, main


def test_addons_por_tipo():
    assert addons_para_tipo("producto") == ["BlenderKit"]
    assert addons_para_tipo("objeto tecnico") == ["BlenderKit"]
    assert addons_para_tipo("arquitectura") == ["Archimesh", "MeasureIt"]
    assert addons_para_tipo("casa") == ["Archimesh", "MeasureIt"]
    assert addons_para_tipo("modulo") == ["Archimesh", "MeasureIt"]
    assert addons_para_tipo("control remoto IA") == ["BlenderMCP"]
    assert addons_para_tipo("desconocido") == []


def test_instala_blenderkit(tmp_path):
    path = tmp_path / "addons_instalados.json"
    ok, msgs = instalar("producto", addons_path=path)
    assert ok
    datos = json.loads(path.read_text(encoding="utf-8"))
    assert any(d["addon"] == "BlenderKit" for d in datos)
    assert any("BlenderKit" in m for m in msgs)


def test_no_reinstala(tmp_path):
    path = tmp_path / "addons_instalados.json"
    instalar("producto", addons_path=path)
    ok, msgs = instalar("producto", addons_path=path)
    assert ok
    datos = json.loads(path.read_text(encoding="utf-8"))
    assert [d for d in datos if d["addon"] == "BlenderKit"] == [datos[0]]
    assert any("ya instalado" in m for m in msgs)


def test_blendermcp_sin_permiso_no_instala(tmp_path, monkeypatch):
    path = tmp_path / "addons_instalados.json"
    monkeypatch.delenv("BLENDERMCP_AUTORIZADO", raising=False)
    ok, msgs = instalar("control remoto IA", addons_path=path, autorizado=False)
    assert ok
    datos = json.loads(path.read_text(encoding="utf-8"))
    assert datos == []
    assert any("permiso del director" in m for m in msgs)


def test_blendermcp_con_permiso_instala(tmp_path, monkeypatch):
    path = tmp_path / "addons_instalados.json"
    monkeypatch.setenv("BLENDERMCP_AUTORIZADO", "1")
    ok, msgs = instalar("control remoto IA", addons_path=path, autorizado=True)
    assert ok
    datos = json.loads(path.read_text(encoding="utf-8"))
    assert any(d["addon"] == "BlenderMCP" for d in datos)
    assert any("BlenderMCP" in m for m in msgs)


def test_main_arquitectura(tmp_path, monkeypatch):
    path = tmp_path / "addons_instalados.json"
    monkeypatch.setattr("scripts.blender_addons.ADDONES_PATH", path)
    code = main(["--proyecto", "arquitectura", "--instalar"])
    assert code == 0
    datos = json.loads(path.read_text(encoding="utf-8"))
    assert {d["addon"] for d in datos} == {"Archimesh", "MeasureIt"}
