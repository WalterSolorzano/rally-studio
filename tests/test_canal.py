# -*- coding: utf-8 -*-
"""Respaldo de contratos del canal: la version anterior nunca se pierde.

1. Primera escritura: no hay .bak, no hay nada que respaldar.
2. Segunda escritura sobre el mismo archivo: el .bak guarda la version anterior.
3. Tercera escritura: el .bak guarda la segunda, no la primera (es la version previa).
4. La escritura es atomica: no queda .tmp al terminar.
5. Nombre fuera de NN-rol.json: rechazado antes de tocar el disco.
6. `verificar_canal` ignora los .bak: respaldar no ensucia la auditoria.
"""

import json
from pathlib import Path

import pytest

from scripts.canal import escribir, hubo_sobrescritura, recuperar, ruta_respaldo
from scripts.verificar_canal import verificar


def _contrato(costo: str) -> dict:
    return {
        "rol": "presupuestador",
        "orden": 2,
        "lee_de": ["01-pautador.json"],
        "hechos": {"modo": "nacional", "costo_piloto": costo},
        "preguntas_abiertas": [],
        "preguntas_contestadas": [],
        "entregable": "budget.costos",
    }


def test_primera_escritura_no_deja_respaldo(tmp_path):
    escribir(tmp_path, "02-presupuestador.json", _contrato("C$ 24 300"))
    assert (tmp_path / "02-presupuestador.json").is_file()
    assert not ruta_respaldo(tmp_path, "02-presupuestador.json").exists()
    assert recuperar(tmp_path, "02-presupuestador.json") is None
    assert hubo_sobrescritura(tmp_path, "02-presupuestador.json") is False


def test_segunda_escritura_guarda_la_anterior(tmp_path):
    # El caso de H-13: dos escrituras sobre el mismo contrato. Antes la primera se perdia.
    escribir(tmp_path, "02-presupuestador.json", _contrato("C$ 24 300"))
    escribir(tmp_path, "02-presupuestador.json", _contrato("C$ 31 000"))

    actual = json.loads((tmp_path / "02-presupuestador.json").read_text(encoding="utf-8"))
    anterior = recuperar(tmp_path, "02-presupuestador.json")

    assert actual["hechos"]["costo_piloto"] == "C$ 31 000"
    assert anterior is not None
    assert anterior["hechos"]["costo_piloto"] == "C$ 24 300"
    assert hubo_sobrescritura(tmp_path, "02-presupuestador.json") is True


def test_tercera_escritura_respalda_la_segunda(tmp_path):
    escribir(tmp_path, "02-presupuestador.json", _contrato("C$ 24 300"))
    escribir(tmp_path, "02-presupuestador.json", _contrato("C$ 31 000"))
    escribir(tmp_path, "02-presupuestador.json", _contrato("C$ 40 000"))
    anterior = recuperar(tmp_path, "02-presupuestador.json")
    assert anterior["hechos"]["costo_piloto"] == "C$ 31 000"


def test_no_quedan_temporales(tmp_path):
    escribir(tmp_path, "02-presupuestador.json", _contrato("C$ 24 300"))
    escribir(tmp_path, "02-presupuestador.json", _contrato("C$ 31 000"))
    sobrantes = [p.name for p in tmp_path.iterdir() if p.name.endswith(".tmp")]
    assert sobrantes == []


def test_nombre_invalido_no_toca_el_disco(tmp_path):
    with pytest.raises(ValueError):
        escribir(tmp_path, "presupuesto.json", _contrato("C$ 24 300"))
    with pytest.raises(ValueError):
        escribir(tmp_path, "02-Presupuestador.json", _contrato("C$ 24 300"))
    assert list(tmp_path.iterdir()) == []


def test_el_respaldo_no_ensucia_la_auditoria(tmp_path):
    escribir(tmp_path, "01-pautador.json", {
        "rol": "pautador",
        "orden": 1,
        "lee_de": [],
        "hechos": {"modo": "nacional", "cooperativa": "COOPAGUA Somoto"},
        "preguntas_abiertas": [],
        "preguntas_contestadas": [],
        "entregable": "pautado.problema",
    })
    escribir(tmp_path, "01-pautador.json", {
        "rol": "pautador",
        "orden": 1,
        "lee_de": [],
        "hechos": {"modo": "nacional", "cooperativa": "COOPAGUA Somoto",
                   "costo_piloto": "C$ 24 300"},
        "preguntas_abiertas": [],
        "preguntas_contestadas": [],
        "entregable": "pautado.problema",
    })
    escribir(tmp_path, "02-presupuestador.json", _contrato("C$ 24 300"))

    assert (tmp_path / "01-pautador.json.bak").is_file()
    assert verificar(tmp_path) == []
