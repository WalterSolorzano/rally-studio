"""Fase 7, item 399 y 409: el cronometro del certamen y el aviso horario.

La skill control-tiempo-entrega promete estado horario y congelamiento de assets
al 75 %. Antes de este tramo, esas reglas solo existian como prosa: ningun
script calculaba el porcentaje ni decia que entregables faltaban.
"""
import json
import pathlib
import sys

import pytest

RAIZ = pathlib.Path(__file__).resolve().parent.parent
if str(RAIZ) not in sys.path:
    sys.path.insert(0, str(RAIZ))

import arsenal  # noqa: E402


@pytest.mark.parametrize("porcentaje,fase", [
    (0.0, "producir"),
    (0.34, "producir"),
    (0.35, "revisar"),
    (0.50, "revisar"),
    (0.55, "integrar"),
    (0.74, "integrar"),
    (0.75, "congelar assets y preparar exportacion"),
    (0.89, "congelar assets y preparar exportacion"),
    (0.90, "entregar y verificar"),
    (1.0, "entregar y verificar"),
])
def test_fase_de_tiempo_respeta_las_bandas(porcentaje, fase):
    assert arsenal.fase_de_tiempo(porcentaje) == fase


def test_al_75_por_ciento_se_congelan_los_assets():
    """Item 399: al 75 % el sistema avisa y congela; al 74 % no."""
    antes = arsenal.estado_de_tiempo({"hours_total": 24, "hours_remaining": 6.24}, [])
    justo = arsenal.estado_de_tiempo({"hours_total": 24, "hours_remaining": 6.0}, [])
    assert antes["porcentaje_alcanzado"] == pytest.approx(74.0)
    assert antes["congelar_assets"] is False and antes["alerta_roja"] is False
    assert justo["porcentaje_alcanzado"] == pytest.approx(75.0)
    assert justo["congelar_assets"] is True and justo["alerta_roja"] is True


def test_sin_hours_total_el_porcentaje_no_se_rompe():
    estado = arsenal.estado_de_tiempo({"hours_total": 0, "hours_remaining": 5}, [])
    assert estado["porcentaje_alcanzado"] == 0.0
    assert estado["congelar_assets"] is False


def test_el_restante_no_se_sale_de_rango():
    alto = arsenal.estado_de_tiempo({"hours_total": 28, "hours_remaining": 99}, [])
    bajo = arsenal.estado_de_tiempo({"hours_total": 28, "hours_remaining": -3}, [])
    assert alto["porcentaje_alcanzado"] == 0.0
    assert bajo["porcentaje_alcanzado"] == 100.0


def test_los_pendientes_que_recibe_van_en_el_estado():
    estado = arsenal.estado_de_tiempo(
        {"hours_total": 28, "hours_remaining": 25}, ["06 pautado", "10 script"])
    assert estado["entregables_pendientes"] == ["06 pautado", "10 script"]


def test_aviso_horario_a_la_hora_3_nombra_lo_que_falta(tmp_path, capsys):
    """Item 409: reloj simulado a la hora 3 de 28 -> aviso con los pendientes."""
    brief = tmp_path / "brief.json"
    brief.write_text(json.dumps({
        "rally_type": "latam",
        "hours_total": 28,
        "hours_remaining": 25,
    }), encoding="utf-8")

    codigo = arsenal.main(["check-tiempo", "--brief", str(brief), "--restante", "25"])
    salida = capsys.readouterr().out

    assert codigo == 0
    assert "AVISO HORARIO" in salida
    assert "LATAM" in salida
    assert "transcurrido : 3 h" in salida
    assert "restante     : 25 h" in salida
    assert "faltan       :" in salida


def test_salida_json_tiene_las_claves_de_la_skill(tmp_path, capsys):
    brief = tmp_path / "brief.json"
    brief.write_text(json.dumps({
        "rally_type": "nacional",
        "hours_total": 24,
        "hours_remaining": 6,
    }), encoding="utf-8")

    arsenal.main(["check-tiempo", "--brief", str(brief), "--json"])
    datos = json.loads(capsys.readouterr().out)

    assert set(datos) == {
        "rally_type", "hours_total", "hours_remaining", "porcentaje_alcanzado",
        "fase", "entregables_pendientes", "congelar_assets", "alerta_roja",
    }
    assert datos["rally_type"] == "nacional"
    assert datos["alerta_roja"] is True
