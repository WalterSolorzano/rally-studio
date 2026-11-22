"""El resumen de stats no puede imprimir `NaN` ni inventarse un cero.

Medido con la sonda `tests/js/stats_view_probe.js` (carga `dashboard/stats.js`
real en `vm`) sobre datos con un tramo sin `pct`, `hours_remaining: "poco"`,
`frentes: "muchos"` y `signals: "?"`:

    antes   #stack-bar     --w:NaN%   title="pautado: NaN%"
            #split-legend  NaN%
            #roster-body   NaN
            #closing-line  Quedan 0.0 h.
    después #stack-bar     --w:0%     title="pautado: —%"
            #split-legend  —%
            #roster-body   —
            #closing-line  Quedan — h.

`NaN` es una fuga del lenguaje y `0` es un dato inventado: el resumen promete
leer el estado del proyecto y no puede rellenar lo que no sabe.
"""
from __future__ import annotations

import json
import shutil
import subprocess
import sys
from pathlib import Path

import pytest

REPO_ROOT = Path(__file__).resolve().parent.parent
SONDA = REPO_ROOT / "tests" / "js" / "stats_view_probe.js"

pytestmark = pytest.mark.skipif(
    sys.platform != "win32" and shutil.which("node") is None,
    reason="necesita Node",
)

VACIO = {"session": {}, "headline": {}}

COMPLETO = {
    "session": {"rally_type": "nacional", "duration_h": 24},
    "headline": {"hours_remaining": 3.5, "duration_h": 24},
    "people": [{"name": "Ana", "frentes": 2, "signals": 5, "coverage": 50, "mvp": True}],
    "time_split": [
        {"label": "pautado", "color": "#111", "pct": 40},
        {"label": "guion", "color": "#222", "pct": 60},
    ],
    "produccion": {"renders": 4, "ok": 3},
}

BASURA = {
    "session": {"rally_type": "nacional", "duration_h": 24},
    "headline": {"hours_remaining": "poco", "duration_h": 24},
    "people": [{"name": "Ana", "frentes": "muchos", "signals": "?", "coverage": "alta"}],
    "time_split": [{"label": "pautado", "color": "#111"}],
    "produccion": {"renders": "cuatro"},
}


def _render(datos):
    salida = subprocess.run(
        ["node", str(SONDA), "render", json.dumps(datos, ensure_ascii=False)],
        capture_output=True,
        text=True,
        encoding="utf-8",
        timeout=30,
    )
    assert salida.returncode == 0, salida.stderr
    cuerpo = json.loads(salida.stdout)
    assert cuerpo["ok"], cuerpo
    return cuerpo


def test_el_resumen_vacio_no_filtra_nada():
    assert _render(VACIO)["sospechas"] == []


def test_el_resumen_completo_sigue_leyendo_bien():
    cuerpo = _render(COMPLETO)
    assert cuerpo["sospechas"] == []
    assert "40%" in cuerpo["vistas"]["#stack-bar"]["html"]
    assert "Quedan 3.5 h." in cuerpo["vistas"]["#closing-line"]["html"]


def test_los_datos_que_no_son_numeros_no_imprimen_nan():
    cuerpo = _render(BASURA)
    assert cuerpo["sospechas"] == [], cuerpo["sospechas"]
    assert "--w:0%" in cuerpo["vistas"]["#stack-bar"]["html"]
    assert "—%" in cuerpo["vistas"]["#stack-bar"]["html"]
    cierre = cuerpo["vistas"]["#closing-line"]["html"]
    assert "Quedan — h." in cierre
    assert "0.0 h" not in cierre


def test_el_arreglo_sigue_en_el_codigo():
    fuente = (REPO_ROOT / "dashboard" / "stats.js").read_text(encoding="utf-8")
    assert 'if (!Number.isFinite(num)) return "—";' in fuente
    assert "function pctDe(" in fuente
    assert "--w:${Number(item.pct)}%" not in fuente
