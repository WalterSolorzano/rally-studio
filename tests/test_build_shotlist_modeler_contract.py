#!/usr/bin/env python3
"""Tests del contrato modeler en build_shotlist.py."""

import textwrap
from pathlib import Path

from scripts.build_shotlist import cargar_shots

BASE_MODELO = textwrap.dedent("""\
    id: {id}
    act: "1"
    description: toma modelo
    asset_id: "{asset_id}"
    asset_type: objeto
    duration_s: 5
    status: pendiente
    owner: modeler
    rubric_item: D1
    claim_ids: []
    quality_tier: draft
    depends_on: []
""")

BOM_CON_DIM = textwrap.dedent("""\
    asset_id,nombre,tipo,dim_ancho_mm,dim_alto_mm,dim_fondo_mm
    tornillo_m3,Tornillo M3,herraje,5,5,12
""")

BOM_SIN_DIM = textwrap.dedent("""\
    asset_id,nombre,tipo
    tornillo_m3,Tornillo M3,herraje
""")


def _escribir(tmp_path: Path, nombre: str, contenido: str) -> Path:
    p = tmp_path / nombre
    p.write_text(contenido, encoding="utf-8")
    return p


def _shots(tmp_path: Path) -> Path:
    d = tmp_path / "shots"
    d.mkdir()
    return d


def _bom(tmp_path: Path, contenido: str) -> Path:
    p = tmp_path / "budget" / "bom.csv"
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(contenido, encoding="utf-8")
    return p


def test_modeler_sin_asset_id(tmp_path):
    shots = _shots(tmp_path)
    _escribir(shots, "s1.yaml", BASE_MODELO.format(id="s1", asset_id=""))
    _, errores = cargar_shots(dir_shots=shots, bom_path=_bom(tmp_path, BOM_CON_DIM))
    assert any("falta asset_id (obligatorio para modeler)" in e for e in errores), errores


def test_modeler_asset_id_no_en_bom(tmp_path):
    shots = _shots(tmp_path)
    _escribir(shots, "s2.yaml", BASE_MODELO.format(id="s2", asset_id="no_existe"))
    _, errores = cargar_shots(dir_shots=shots, bom_path=_bom(tmp_path, BOM_CON_DIM))
    assert any("asset_id 'no_existe' no existe en budget/bom.csv" in e for e in errores), errores


def test_modeler_bom_sin_columnas_dim_mm(tmp_path):
    shots = _shots(tmp_path)
    _escribir(shots, "s3.yaml", BASE_MODELO.format(id="s3", asset_id="tornillo_m3"))
    _, errores = cargar_shots(dir_shots=shots, bom_path=_bom(tmp_path, BOM_SIN_DIM))
    assert any("tornillo_m3' carece de dim_*_mm" in e for e in errores), errores


def test_modeler_valido_pasa(tmp_path):
    shots = _shots(tmp_path)
    _escribir(shots, "s4.yaml", BASE_MODELO.format(id="s4", asset_id="tornillo_m3"))
    filas, errores = cargar_shots(dir_shots=shots, bom_path=_bom(tmp_path, BOM_CON_DIM))
    modeler_err = [e for e in errores if "modeler" in e or "dim_*_mm" in e or "budget/bom.csv" in e]
    assert modeler_err == [], modeler_err
    assert len(filas) == 1
