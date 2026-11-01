#!/usr/bin/env python3
"""Tests de herramientas.py: caja bajo demanda, sin sobrecarga."""

import json

from scripts.herramientas import buscar, cargar_catalogo, instalar, seleccionar


def test_catalogo_completo_y_sin_ia_de_malla():
    herramientas = cargar_catalogo()
    ids = [h["id"] for h in herramientas]
    assert len(herramientas) >= 20
    assert len(ids) == len(set(ids))
    for descartada in ("tripo", "hyper3d", "rodin"):
        assert descartada not in ids


def test_selecciona_solo_lo_que_la_tarea_necesita():
    herramientas = cargar_catalogo()
    elegidas = seleccionar(herramientas, "render 3d con figuras humanas y control en vivo")
    ids = {h["id"] for h in elegidas}
    assert "anatomy" in ids
    assert "blender-mcp" in ids
    assert len(elegidas) < len(herramientas)


def test_tarea_sin_disparadores_no_instala_nada():
    assert seleccionar(cargar_catalogo(), "escribir el pautado de impacto social") == []


def test_builtin_no_requiere_instalacion():
    herramienta = buscar(cargar_catalogo(), "geonodes")
    codigo, mensaje = instalar(herramienta)
    assert codigo == 0
    assert "no requiere instalacion" in mensaje


def test_mcp_sin_confirmacion_no_toca_config(tmp_path):
    config = tmp_path / "opencode.json"
    config.write_text(json.dumps({"mcp": {"blender-mcp": {"enabled": False}}}), encoding="utf-8")
    herramienta = buscar(cargar_catalogo(), "blender-mcp")
    codigo, _ = instalar(herramienta, config_path=config)
    assert codigo == 1
    assert json.loads(config.read_text(encoding="utf-8"))["mcp"]["blender-mcp"]["enabled"] is False


def test_mcp_con_confirmacion_habilita_en_config(tmp_path):
    config = tmp_path / "opencode.json"
    config.write_text(json.dumps({"mcp": {"blender-mcp": {"enabled": False}}}), encoding="utf-8")
    herramienta = buscar(cargar_catalogo(), "blender-mcp")
    codigo, _ = instalar(herramienta, si=True, config_path=config)
    assert codigo == 0
    assert json.loads(config.read_text(encoding="utf-8"))["mcp"]["blender-mcp"]["enabled"] is True


def test_skill_superpowers_ya_disponible():
    herramienta = buscar(cargar_catalogo(), "writing-plans")
    codigo, mensaje = instalar(herramienta)
    assert codigo == 0
    assert "superpowers" in mensaje


def test_herramienta_desconocida_falla():
    codigo, mensaje = instalar(None)
    assert codigo == 1
    assert "desconocida" in mensaje
