"""H-48: el puente de contenido no puede inventar el costo de una partida.

Medido antes del arreglo: una propuesta con `unit_cost_usd` entraba con costo 0,
y una propuesta en córdobas sin tasa BCN entraba como si fueran dólares (4 000 C$
= 4 000 USD, treinta y seis veces su valor), con lo que el tablero daba por
cumplida la banda de presupuesto.
"""
from __future__ import annotations

import json
import shutil
import subprocess
from pathlib import Path

import pytest

BASE = Path(__file__).resolve().parent.parent
PROBE = BASE / "tests" / "js" / "content_bridge_probe.js"

pytestmark = pytest.mark.skipif(
    shutil.which("node") is None, reason="Node no esta instalado"
)


def _correr(comando: str, estado: dict, payload: dict) -> dict:
    proceso = subprocess.run(
        ["node", str(PROBE), comando,
         json.dumps(estado, ensure_ascii=False),
         json.dumps(payload, ensure_ascii=False)],
        capture_output=True, text=True, encoding="utf-8", errors="replace", timeout=30,
    )
    assert proceso.returncode == 0, proceso.stderr
    datos = json.loads(proceso.stdout)
    assert datos["ok"] is True, datos.get("error")
    return datos


def _filas(estado: dict, payload: dict) -> list | None:
    return _correr("filas", estado, payload)["filas"]


def test_unit_cost_se_lee_como_antes() -> None:
    filas = _filas({"rally_type": "latam"},
                   {"items": [{"element": "Sensores", "units": 4, "unit_cost": 25, "url": "https://x"}]})
    assert filas[0]["unit_cost"] == 25
    assert filas[0]["units"] == 4
    assert filas[0]["element"] == "Sensores"


def test_unit_cost_usd_ya_no_entra_en_cero() -> None:
    """La clave que usa budget/budget.json del rally tambien vale."""
    filas = _filas({"rally_type": "latam"},
                   {"items": [{"element": "Sensores", "units": 4, "unit_cost_usd": 25}]})
    assert filas[0]["unit_cost"] == 25


def test_unit_cost_nio_se_convierte_con_la_tasa_del_estado() -> None:
    filas = _filas({"rally_type": "nacional", "exchange_rate_bcn": 36.62},
                   {"items": [{"element": "Sensores", "units": 4, "unit_cost_nio": 3662}]})
    assert filas[0]["unit_cost"] == pytest.approx(100.0, rel=0.01)


def test_cordobas_sin_tasa_no_se_entregan_como_dolares() -> None:
    """4 000 C$ no son 4 000 USD: sin tasa, el puente no fabrica el costo."""
    assert _filas({"rally_type": "nacional"}, {"currency": "NIO",
                  "items": [{"element": "Sensores", "units": 4, "unit_cost": 1000}]}) is None


def test_cordobas_con_tasa_se_convierten() -> None:
    filas = _filas({"rally_type": "nacional", "exchange_rate_bcn": 36.62},
                   {"currency": "NIO",
                    "items": [{"element": "Sensores", "units": 4, "unit_cost": 1000}]})
    total = sum(f["units"] * f["unit_cost"] for f in filas)
    assert total == pytest.approx(109.23, rel=0.01)


def test_la_propuesta_puede_traer_su_propia_tasa() -> None:
    filas = _filas({"rally_type": "nacional"},
                   {"currency": "NIO", "exchange_rate_bcn": 36.62,
                    "items": [{"element": "Sensores", "units": 4, "unit_cost": 1000}]})
    assert filas[0]["unit_cost"] == pytest.approx(27.31, rel=0.01)


def test_fusionar_sin_tasa_no_toca_el_presupuesto() -> None:
    datos = _correr("fusionar", {"rally_type": "nacional", "budget": []},
                    {"tab": "budget", "payload": {"currency": "NIO",
                     "items": [{"element": "Sensores", "units": 4, "unit_cost": 1000}]}})
    assert datos["cambio"] is False
    assert datos["estado"]["budget"] == []
    assert datos["avisos"] == 1, "el equipo tiene que enterarse de que no se aplicó"


def test_fusionar_con_tasa_escribe_el_presupuesto_en_usd() -> None:
    datos = _correr("fusionar",
                    {"rally_type": "nacional", "exchange_rate_bcn": 36.62, "budget": []},
                    {"tab": "budget", "payload": {"currency": "NIO",
                     "items": [{"element": "Sensores", "units": 4, "unit_cost": 1000}]}})
    assert datos["cambio"] is True
    fila = datos["estado"]["budget"][0]
    assert fila["element"] == "Sensores"
    assert fila["unit_cost"] == pytest.approx(27.31, rel=0.01)


def test_el_puente_lee_las_tres_claves_de_costo() -> None:
    fuente = (BASE / "dashboard" / "content_bridge.js").read_text(encoding="utf-8")
    assert "unit_cost_usd" in fuente
    assert "unit_cost_nio" in fuente
    assert "if (tasa > 0) unitCost = unitCost / tasa;" in fuente
    assert "else if (unitCost > 0) return null;" in fuente
