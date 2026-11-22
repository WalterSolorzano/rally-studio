"""El auditor de presupuesto no puede aprobar filas que no compran nada (H-34).

Medido antes del arreglo: `units: 0` y `units: -3` pasaban con codigo 0, `units: "dos"`
reventaba con traceback, un `budget.json` con forma de objeto reventaba con traceback y
una lista vacia anunciaba "VALIDACION EXITOSA" sobre cero partidas.

Cada caso corre el validador real en un directorio temporal: el script mide archivos, no
funciones sueltas, y aqui se mide lo mismo que corre el equipo.
"""

import json
import subprocess
import sys
from pathlib import Path

import pytest

RAIZ = Path(__file__).resolve().parent.parent
SCRIPT = RAIZ / "scripts" / "validate_budget.py"

BRIEF = {"rally_type": "latam", "hours_total": 28}

FILA_OK = {
    "element": "Sensor de humedad",
    "description": "Sonda capacitiva de suelo que mide humedad y temperatura para riego",
    "units": 2,
    "unit_cost_usd": 45.0,
    "url": "https://example.com/sensor",
    "date": "2026-06-01",
}


def corre(items):
    import tempfile

    with tempfile.TemporaryDirectory() as tmp:
        raiz = Path(tmp)
        (raiz / "budget").mkdir()
        (raiz / "brief.json").write_text(json.dumps(BRIEF), encoding="utf-8")
        (raiz / "budget" / "budget.json").write_text(json.dumps(items), encoding="utf-8")
        p = subprocess.run(
            [sys.executable, str(SCRIPT)],
            cwd=str(raiz), capture_output=True, text=True,
            encoding="utf-8", errors="replace",
        )
    return p.returncode, (p.stdout or "") + (p.stderr or "")


def test_una_partida_correcta_pasa():
    codigo, salida = corre([dict(FILA_OK)])
    assert codigo == 0, salida
    assert "Traceback" not in salida


@pytest.mark.parametrize("units", [0, -3])
def test_una_cantidad_que_no_suma_es_error(units):
    codigo, salida = corre([dict(FILA_OK, units=units)])
    assert codigo == 1, salida
    assert "units debe ser mayor que cero" in salida


def test_una_cantidad_escrita_con_palabras_no_revienta():
    codigo, salida = corre([dict(FILA_OK, units="dos")])
    assert codigo == 1, salida
    assert "Traceback" not in salida
    assert "units no es un numero" in salida


def test_un_budget_con_forma_de_objeto_no_revienta():
    codigo, salida = corre({"element": "Sensor"})
    assert codigo == 1, salida
    assert "Traceback" not in salida
    assert "debe ser una lista" in salida


def test_un_budget_sin_partidas_no_anuncia_exito():
    codigo, salida = corre([])
    assert codigo == 1, salida
    assert "VALIDACION EXITOSA" not in salida


def test_una_fila_que_no_es_objeto_se_reporta_sin_romper_el_resto():
    codigo, salida = corre([dict(FILA_OK), "sensor"])
    assert codigo == 1, salida
    assert "Fila 2: no es un objeto" in salida
    assert "Traceback" not in salida
