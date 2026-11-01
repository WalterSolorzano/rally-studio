#!/usr/bin/env python3
"""Tests de pre_render_check.py."""

from scripts.pre_render_check import check, main

FILAS_OK = [
    {"id": "A", "depends_on": "B", "status": "pendiente"},
    {"id": "B", "depends_on": "", "status": "integrado"},
]

FILAS_MULTI = [
    {"id": "A", "depends_on": "B, C", "status": "pendiente"},
    {"id": "B", "depends_on": "", "status": "integrado"},
    {"id": "C", "depends_on": "", "status": "revisado"},
]


def test_dep_integrado_ok():
    assert check("A", FILAS_OK) == []


def test_dep_no_existe():
    filas = [{"id": "A", "depends_on": "Z", "status": "pendiente"}]
    err = check("A", filas)
    assert any("no existe en shotlist" in e for e in err), err


def test_dep_no_entregada():
    err = check("A", FILAS_MULTI)
    assert any("toma 'C' no entregada (status=revisado)" in e for e in err), err


def test_shot_no_existe():
    err = check("NO_EXISTE", FILAS_OK)
    assert any("no existe en shotlist" in e for e in err), err


def test_sin_dependencias_ok():
    filas = [{"id": "S", "depends_on": "", "status": "draft"}]
    assert check("S", filas) == []


def test_main_exit_0_integrado(tmp_path, monkeypatch):
    csv_path = tmp_path / "shotlist.csv"
    csv_path.write_text("id,depends_on,status\nA,B,pendiente\nB,,integrado\n", encoding="utf-8")
    monkeypatch.setattr("scripts.pre_render_check.SHOTLIST", csv_path)
    assert main(["A"]) == 0


def test_main_exit_1_no_entregada(tmp_path, monkeypatch, capsys):
    csv_path = tmp_path / "shotlist.csv"
    csv_path.write_text("id,depends_on,status\nA,B,pendiente\nB,,revisado\n", encoding="utf-8")
    monkeypatch.setattr("scripts.pre_render_check.SHOTLIST", csv_path)
    assert main(["A"]) == 1
    out = capsys.readouterr().out
    assert "toma 'B' no entregada (status=revisado)" in out
