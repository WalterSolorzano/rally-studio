"""presence.js no debe anunciar al autor su propio guardado.

Medido: con un cambio propio (actor == mi nombre) y uno ajeno, el módulo
despachaba un `rally:aviso` y un toast con mi propio nombre. El aviso es para
el equipo; quien acaba de guardar ya sabe que guardó.
"""
import json
import pathlib
import shutil
import subprocess

import pytest

REPO = pathlib.Path(__file__).resolve().parent.parent
SONDA = REPO / "tests" / "js" / "presence_probe.js"


pytestmark = pytest.mark.skipif(
    shutil.which("node") is None, reason="node no instalado"
)


def _correr(estado):
    salida = subprocess.run(
        ["node", str(SONDA), "avisos", json.dumps(estado, ensure_ascii=False)],
        cwd=str(REPO),
        capture_output=True,
        text=True,
        encoding="utf-8",
        errors="replace",
        timeout=60,
    )
    assert salida.stdout.strip(), salida.stderr
    datos = json.loads(salida.stdout)
    assert datos.get("ok"), datos.get("error")
    return datos


def _titulos(datos):
    return [aviso["titulo"] for aviso in datos["avisos"]]


def test_el_guardado_propio_no_se_anuncia():
    datos = _correr({
        "actor": "Yo",
        "pasos": [[], [{"id": 7, "actor": "Yo", "path": "dashboard/app.js"}]],
    })
    assert _titulos(datos) == []
    assert datos["toasts"] == []


def test_el_guardado_ajeno_si_se_anuncia():
    datos = _correr({
        "actor": "Yo",
        "pasos": [[], [{"id": 8, "actor": "Ana", "path": "content/propuesta_3.json"}]],
    })
    assert _titulos(datos) == ["Ana actualizó una propuesta nueva"]
    assert datos["toasts"] == ["Ana actualizó una propuesta nueva"]


def test_lo_propio_se_calla_y_lo_ajeno_se_anuncia_en_la_misma_tanda():
    datos = _correr({
        "actor": "Yo",
        "pasos": [[], [
            {"id": 7, "actor": "Yo", "path": "dashboard/app.js"},
            {"id": 8, "actor": "Ana", "path": "content/propuesta_3.json"},
        ]],
    })
    assert _titulos(datos) == ["Ana actualizó una propuesta nueva"]


def test_el_filtro_sigue_en_el_codigo():
    fuente = (REPO / "dashboard" / "presence.js").read_text(encoding="utf-8")
    assert 'if (String(ch.actor || "") === myName) return;' in fuente
