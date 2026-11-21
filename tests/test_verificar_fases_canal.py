import json
import sys
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(RAIZ / "scripts"))

import verificar_fases as vf  # noqa: E402


def _canal(tmp_path, contratos):
    canal = tmp_path / "canal"
    canal.mkdir()
    for nombre, datos in contratos.items():
        (canal / nombre).write_text(json.dumps(datos), encoding="utf-8")
    return tmp_path


def test_sin_carpeta_canal_no_falla(tmp_path):
    assert vf.revisar_canal(tmp_path) == ""


def test_canal_con_un_solo_contrato_es_valido(tmp_path):
    raiz = _canal(tmp_path, {"01-pautador.json": {
        "rol": "pautador",
        "orden": 1,
        "hechos": {"modo": "latam"},
        "entregable": "docs/pautado_draft.docx",
    }})
    assert vf.revisar_canal(raiz) == ""


def test_canal_roto_devuelve_motivo(tmp_path):
    raiz = _canal(tmp_path, {"02-presupuestador.json": {
        "rol": "presupuestador",
        "orden": 2,
    }})
    motivo = vf.revisar_canal(raiz)
    assert "canal" in motivo and "01" in motivo


def test_verificar_canal_es_compuerta_registrada():
    assert "verificar_canal.py" in vf.COMPUERTAS
