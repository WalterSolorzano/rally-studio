import json
import shutil
import subprocess
from pathlib import Path

import pytest

NODE = shutil.which("node")
PROBE = Path(__file__).parent / "js" / "bridge_probe.js"

pytestmark = pytest.mark.skipif(NODE is None, reason="node no disponible para probar el puente")


def correr(comando, arg=None):
    args = [NODE, str(PROBE), comando]
    if arg is not None:
        args.append(json.dumps(arg, ensure_ascii=False))
    salida = subprocess.run(args, capture_output=True, text=True, encoding="utf-8", timeout=30)
    assert salida.returncode == 0, salida.stderr
    return json.loads(salida.stdout)


def test_budget_rows_fill_element_and_concept():
    datos = correr("filas", {"items": [{"concept": "Cable UTP", "units": 2, "unit_cost": 5}]})
    fila = datos["filas"][0]
    assert fila["element"] == "Cable UTP"
    assert fila["concept"] == "Cable UTP"


def test_merge_team_fields_from_team_tab():
    datos = correr(
        "fusionar",
        {"tab": "team", "slot": "main", "payload": {"team_name": "Ñandú Innovación"}},
    )
    assert datos["ok"] is True
    assert datos["estado"]["team_name"] == "Ñandú Innovación"


def test_merge_unknown_tab_is_rejected():
    datos = correr("fusionar", {"tab": "canvas", "slot": "main", "payload": {"texto": "x"}})
    assert datos["ok"] is False
    assert "propuestas" not in datos["estado"]


def test_accept_failure_returns_false():
    datos = correr("aceptar-falla")
    assert datos["ok"] is False


def test_state_is_posted_to_server():
    datos = correr("subir-estado", {"team_name": "Ñandú"})
    assert any(
        c.get("kind") == "fetch" and c.get("url") == "/api/state" and c.get("method") == "POST"
        for c in datos["llamadas"]
    )


def test_health_reports_offline_after_two_failures():
    datos = correr("sinred")
    assert datos["salud"] == "apagado"
