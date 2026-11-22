"""La suite del núcleo de Super Agentes existe: que se ejecute de verdad.

`tests/super_agents_core.test.js` nació sin `window`, sin `location` y con la
clave de localStorage vieja (`_v3`), así que reventaba en la primera línea de
`dashboard/super_agents.js` y sus 319 líneas de asserts nunca corrieron.
Ningún test de pytest lo llamaba, así que nadie lo notó.
"""
from __future__ import annotations

import shutil
import subprocess
import sys
from pathlib import Path

import pytest

RAIZ = Path(__file__).resolve().parents[1]
SUITE = RAIZ / "tests" / "super_agents_core.test.js"
NODE = shutil.which("node")

pytestmark = pytest.mark.skipif(NODE is None, reason="node no está instalado")


def _correr() -> subprocess.CompletedProcess:
    return subprocess.run(
        [NODE, str(SUITE)],
        cwd=str(RAIZ),
        capture_output=True,
        text=True,
        encoding="utf-8",
        errors="replace",
        timeout=120,
    )


def test_la_suite_del_nucleo_corre_y_pasa():
    r = _correr()
    salida = (r.stdout or "") + (r.stderr or "")
    assert r.returncode == 0, salida[-2000:]
    assert "SUITE COMPLETA" in salida, salida[-2000:]


def test_el_arnes_del_navegador_esta_montado():
    """Sin window, location y escape.js la suite muere antes de medir nada."""
    fuente = SUITE.read_text(encoding="utf-8")
    assert "ctx.window = ctx;" in fuente
    assert "escape.js" in fuente
    assert 'location: { protocol:' in fuente
    assert 'rally_studio_production_state_2026_v4' in fuente
    assert 'rally_studio_production_state_2026_v3' not in fuente


def test_los_centavos_del_canvas_no_se_vuelven_ceros():
    """'5,000.00' son cinco mil; quitar todos los separadores da quinientos mil."""
    produccion = (RAIZ / "dashboard" / "super_agents.js").read_text(encoding="utf-8")
    assert "function aNumero(token)" in produccion
    assert 't.lastIndexOf(",") > t.lastIndexOf(".")' in produccion
    assert 'parseFloat(m[0].replace(/[.,]/g, ""))' not in produccion
    suite = SUITE.read_text(encoding="utf-8")
    assert "C$ 5,000.00" in suite


if __name__ == "__main__":
    sys.exit(pytest.main([__file__, "-q"]))
