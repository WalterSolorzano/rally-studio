# -*- coding: utf-8 -*-
"""Reglas de contexto del certamen: municipio real, Plan Nacional y modo Latam.

Items 397 y 398 del plan: el jurado Nacional exige municipio real y enlace con el
Plan Nacional 2022-2026; en Latam el presupuesto va en USD y sin siglas locales.
Las dos se avisan, no invalidan el brief: el brief puede estar en construccion.
"""

import json
import sys
from pathlib import Path

import pytest

RAIZ = Path(__file__).resolve().parents[1]
for ruta in (RAIZ, RAIZ / "scripts"):
    if str(ruta) not in sys.path:
        sys.path.insert(0, str(ruta))

import validate_brief as vb


def _brief(**extra) -> dict:
    base = {
        "project_name": "Agua Cerca",
        "team_name": "Loma Alta",
        "university": "UNI",
        "city": "Somoto",
        "category": "Social",
        "challenge_id": "R-01",
        "challenge_title": "Agua rural",
        "rally_type": "nacional",
        "hours_total": 24,
        "has_logo": False,
        "has_palette": False,
        "has_components": False,
        "deliverable_type": "web",
        "description_one_line": "Sistema de agua para cuarenta familias.",
        "ods_ids": ["ODS6"],
        "national_plan_axis": "Eje de infraestructura rural",
    }
    base.update(extra)
    return base


def test_nacional_con_municipio_y_eje_no_avisa():
    assert vb.avisos_de_contexto(_brief()) == []


@pytest.mark.parametrize("ciudad", ["Nicaragua", "Nacional", "Latam", "", "América Latina"])
def test_nacional_sin_municipio_real_avisa(ciudad):
    avisos = vb.avisos_de_contexto(_brief(city=ciudad))
    assert any("municipio real" in a for a in avisos)


def test_nacional_sin_eje_del_plan_avisa():
    avisos = vb.avisos_de_contexto(_brief(national_plan_axis=""))
    assert any("national_plan_axis" in a for a in avisos)


def test_latam_limpio_no_avisa():
    brief = _brief(rally_type="latam", exchange_rate_bcn=0)
    brief.pop("national_plan_axis")
    assert vb.avisos_de_contexto(brief) == []


def test_latam_con_eje_nicaragüense_avisa():
    avisos = vb.avisos_de_contexto(_brief(rally_type="latam"))
    assert any("Latam" in a and "national_plan_axis" in a for a in avisos)


def test_latam_con_tasa_bcn_avisa():
    avisos = vb.avisos_de_contexto(_brief(rally_type="latam", exchange_rate_bcn=36.7))
    assert any("exchange_rate_bcn" in a and "USD" in a for a in avisos)


def test_latam_con_siglas_locales_avisa():
    avisos = vb.avisos_de_contexto(
        _brief(rally_type="latam", description_one_line="Taller con INATEC y MINJUVE.")
    )
    avisos_siglas = [a for a in avisos if "Siglas locales" in a]
    assert avisos_siglas and "INATEC" in avisos_siglas[0]


def test_latam_con_las_siglas_solo_en_el_nombre_del_equipo_no_avisa():
    """El nombre del equipo no es el pitch: ahi una sigla no rompe nada."""
    brief = _brief(rally_type="latam", team_name="Equipo INATEC")
    brief.pop("national_plan_axis")
    assert not any("Siglas locales" in a for a in vb.avisos_de_contexto(brief))


def test_main_avisa_sin_fallar(tmp_path, monkeypatch, capsys):
    (tmp_path / "brief.json").write_text(
        json.dumps(_brief(city="Nicaragua", national_plan_axis="")), encoding="utf-8")
    monkeypatch.chdir(tmp_path)
    vb.main()
    salida = capsys.readouterr().out
    assert "brief.json válido" in salida
    assert "municipio real" in salida


def test_main_con_brief_incompleto_sale_1(tmp_path, monkeypatch):
    datos = _brief()
    datos["project_name"] = ""
    (tmp_path / "brief.json").write_text(json.dumps(datos), encoding="utf-8")
    monkeypatch.chdir(tmp_path)
    with pytest.raises(SystemExit) as exc:
        vb.main()
    assert exc.value.code == 1
