"""Pruebas del modulo Impacto y Plan Pais (design/).

La logica pura vive en design/shared.js (estado impacto, parser ODS) y en
design/impacto.js (composicion, animacion, IA). Se cargan en Node con
tests/js/impacto_probe.js aunque el modulo siga sin existencia completa:
la sonda carga los archivos si estan en disco.
"""
import json
import shutil
import subprocess
from pathlib import Path

import pytest

NODE = shutil.which("node")
PROBE = Path(__file__).parent / "js" / "impacto_probe.js"
RAIZ = Path(__file__).parent.parent

pytestmark = pytest.mark.skipif(NODE is None, reason="node no disponible para probar el modulo impacto")


def correr(comando, arg=None):
    args = [NODE, str(PROBE), comando]
    if arg is not None:
        args.append(json.dumps(arg, ensure_ascii=False))
    salida = subprocess.run(args, capture_output=True, text=True, encoding="utf-8", timeout=30)
    assert salida.returncode == 0, salida.stderr
    return json.loads(salida.stdout)


# --- parser tolerante de ODS (shared.js: odsOf) ---

@pytest.mark.parametrize("texto,esperado", [
    ("ODS 12", 12),
    ("ODS11", 11),
    ("ods 9", 9),
    ("", None),
    ("Reto 3", None),
])
def test_odsof_parsea_variantes_con_digitos(texto, esperado):
    datos = correr("odsof-lote", [texto])[0]
    assert datos == esperado


# --- estado impacto por defecto (shared.js: impactoPorDefecto) ---

def test_impacto_por_defecto_cumple_el_contrato():
    datos = correr("por-defecto")
    assert "error" not in datos
    assert datos["claves"] == {
        "preset": True, "dur": True, "odsOn": True, "textos": True,
        "plan": True, "narracion": True, "anim": True,
    }
    assert datos["plan"] is True
    assert datos["animOK"] is True


# --- normalizacion preserva impacto (shared.js: normalizeIdentity) ---

def test_normalize_identity_preserva_impacto_y_rellena_defaults():
    identidad = {"team": {"name": "x", "university": "UNI", "city": "Managua"}, "pal": {}, "impacto": {"odsOn": {"12": False}}}
    datos = correr("normalize", identidad)
    assert datos["impact"] is True
    assert datos["impactoCompleto"] is True
