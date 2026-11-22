import json
import shutil
import subprocess
import sys
from pathlib import Path

import pytest

REPO_ROOT = Path(__file__).resolve().parent.parent
SONDA = REPO_ROOT / "tests" / "js" / "stats_probe.js"

pytestmark = pytest.mark.skipif(
    sys.platform != "win32" and shutil.which("node") is None,
    reason="necesita Node",
)


def _medir(personas, nota, pico=4):
    datos = {
        "people": [{"name": nombre} for nombre in personas],
        "rhythm": {"peak_note": nota, "peak_count": pico},
    }
    salida = subprocess.run(
        ["node", str(SONDA), json.dumps(datos, ensure_ascii=False)],
        capture_output=True,
        text=True,
        encoding="utf-8",
        timeout=30,
    )
    assert salida.returncode == 0, salida.stderr
    datos_salida = json.loads(salida.stdout)
    assert datos_salida["ok"], datos_salida
    return datos_salida


NOTA = "4 señales de Anabel y Beto: Pautado, Presupuesto."


def test_un_nombre_corto_no_se_roba_el_de_otro():
    datos = _medir(["Ana"], NOTA)
    assert datos["names"] == []
    assert "Ana" not in datos["text"]


def test_el_nombre_completo_si_cuenta():
    datos = _medir(["Anabel"], NOTA)
    assert datos["names"] == ["Anabel"]


def test_dos_nombres_usan_movieron():
    datos = _medir(["Ana", "Beto"], "5 señales de Ana, Beto: Pautado.", pico=5)
    assert datos["names"] == ["Ana", "Beto"]
    assert "movieron" in datos["text"]
    assert "Ana y Beto" in datos["text"]


def test_un_solo_nombre_usa_movio():
    datos = _medir(["Anabel"], NOTA)
    assert "movió" in datos["text"]
    assert "movieron" not in datos["text"]


def test_un_frente_se_dice_en_singular():
    datos = _medir(["Anabel"], "1 señales de Anabel: Pautado.", pico=1)
    assert "1 frente" in datos["text"]
    assert "1 frentes" not in datos["text"]


def test_no_se_reparte_el_nombre_largo_entre_dos():
    datos = _medir(["María", "José María"], "3 señales de José María: Guion.", pico=3)
    assert datos["names"] == ["José"]


def test_un_nombre_con_punto_no_rompe_el_patron():
    datos = _medir(["Ana M."], "2 señales de Ana M.: Guion.", pico=2)
    assert datos["names"] == ["Ana"]


def test_sin_nombres_cae_en_senales_registradas():
    datos = _medir(["Ana"], "Todavía no hay suficientes señales para trazar un pico.", pico=0)
    assert datos["names"] == []
    assert "señales registradas" in datos["text"]


def test_el_texto_no_vuelve_a_usar_includes():
    fuente = (REPO_ROOT / "dashboard" / "stats.js").read_text(encoding="utf-8")
    assert "note.includes(person.name)" not in fuente
    assert "function menciona(" in fuente
