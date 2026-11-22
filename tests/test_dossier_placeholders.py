"""El dossier impreso no inventa los datos que el equipo no escribio (H-43).

Antes: `preparePrintDossierHTML()` rellenaba los huecos con frases que parecen
reales ("ciudad piloto", "Equipo de Innovacion", "la sede") y el PDF que va al
jurado se leia como un proyecto completo. Estas pruebas cargan `app.js` real en
Node con un navegador minimo y miran el HTML que sale.
"""

import re
import shutil
from functools import partial
from pathlib import Path

import pytest

from tests.support import correr_node

NODE = shutil.which("node")
PROBE = Path(__file__).parent / "js" / "dossier_probe.js"

pytestmark = pytest.mark.skipif(NODE is None, reason="node no disponible para probar el dossier")

correr = partial(correr_node, NODE, PROBE, "dossier")

RETO = {"id": "R-01", "title": "Reto del agua", "ods": ["ODS 6"]}
COMPLETO = {
    "rally_type": "nacional",
    "team_name": "Equipo Semilla",
    "university": "UNI",
    "city": "Jinotega",
    "project_name": "Agua Clara",
    "challenge_id": "R-01",
    "challenges": [RETO],
}
SIN_DATOS = {"challenge_id": "R-01", "challenges": [RETO]}
FRASES_FALSAS = ["ciudad piloto", "Equipo de Innovación", "la sede", "PROYECTO DE INNOVACIÓN"]
# "la sede" se queda en `sedeName()`: ahi es un sustantivo generico dentro de una
# frase ("el equipo de la sede"), no un dato inventado. El dossier no lo usa.
FRASES_EN_LINEA_DE_DATO = ["ciudad piloto", "Equipo de Innovación", "PROYECTO DE INNOVACIÓN"]


def _html(estado):
    datos = correr(estado)
    assert datos["ok"], datos.get("error")
    return datos["html"]


def _faltas(html):
    return sorted(set(re.findall(r"\[FALTA: [^\]]+\]", html)))


def test_un_proyecto_completo_no_lleva_faltantes():
    html = _html(COMPLETO)
    assert _faltas(html) == []
    assert "Jinotega" in html
    assert "Equipo Semilla" in html


@pytest.mark.parametrize("frase", FRASES_FALSAS)
def test_un_proyecto_vacio_no_inventa_datos(frase):
    assert frase not in _html(SIN_DATOS)


@pytest.mark.parametrize(
    "etiqueta",
    ["nombre del equipo", "universidad", "ciudad o municipio", "nombre del proyecto"],
)
def test_cada_dato_que_falta_se_declara_faltante(etiqueta):
    assert f"[FALTA: {etiqueta}]" in _html(SIN_DATOS)


def test_solo_falta_lo_que_falta():
    estado = dict(COMPLETO)
    estado.pop("city")
    faltas = _faltas(_html(estado))
    assert faltas == ["[FALTA: ciudad o municipio]"]


def test_app_js_ya_no_rellena_huecos_con_frases_que_parecen_reales():
    fuente = (Path(__file__).resolve().parents[1] / "dashboard" / "app.js").read_text(encoding="utf-8")
    for frase in FRASES_EN_LINEA_DE_DATO:
        assert f'|| "{frase}"' not in fuente
    assert "[FALTA: " in fuente
