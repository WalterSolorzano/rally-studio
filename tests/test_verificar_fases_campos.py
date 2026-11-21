"""Cada etapa debe medirse con un campo que exista de verdad (H-33).

La fase 03 declaraba `campo: "solution"`, clave que ni `brief.json` ni
`CAMPOS_BRIEF` (lo que el motor copia desde el tablero) tienen. Ninguna pantalla
la creaba, asi que la fase 03 no podia pasar nunca y las fases 04, 06 y 07 salian
como "etapa saltada". Esta prueba mide la causa, no el sintoma: todo campo de
etapa tiene que ser un campo que el puente de estado sepa copiar.
"""

import sys
from pathlib import Path

import pytest

RAIZ = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(RAIZ / "scripts"))

import verificar_fases as vf  # noqa: E402


def _campos_del_puente():
    import rally_service

    return set(rally_service.CAMPOS_BRIEF)


BRIEF_BASE = {
    "rally_type": "nacional",
    "hours_total": 24,
    "team_name": "Equipo X",
    "university": "UNI",
    "city": "Leon",
    "challenge_id": "r-01",
    "challenge_title": "Agua en el campo",
}


@pytest.mark.parametrize("etapa", vf.ETAPAS, ids=[e["id"] for e in vf.ETAPAS])
def test_todo_campo_de_etapa_lo_copia_el_puente_de_estado(etapa):
    campo = etapa.get("campo")
    if campo is None:
        return
    assert campo in _campos_del_puente(), (
        "la etapa %s mide el campo %r, que el espejo de estado nunca copia a "
        "brief.json: la fase no puede pasar desde el tablero" % (etapa["id"], campo)
    )


def test_los_campos_del_panel_son_todos_copiados_por_el_puente():
    assert vf.CAMPOS_PANEL <= _campos_del_puente()


def test_la_fase_de_solucion_existe_cuando_hay_descripcion():
    etapa = next(e for e in vf.ETAPAS if e["id"] == "03")
    brief = dict(BRIEF_BASE, description_one_line="Sensores de humedad para productores")
    assert vf.existe(etapa, brief, {}) is True


def test_la_fase_de_solucion_no_existe_sin_descripcion():
    etapa = next(e for e in vf.ETAPAS if e["id"] == "03")
    assert vf.existe(etapa, BRIEF_BASE, {}) is False


def test_con_solucion_escrita_las_fases_posteriores_no_salen_saltadas():
    brief = dict(
        BRIEF_BASE,
        description_one_line="Sensores de humedad para productores",
        ods_ids=["6"],
        national_plan_axis="Eje 3",
    )
    assert vf.existe(next(e for e in vf.ETAPAS if e["id"] == "03"), brief, {}) is True
    assert vf.existe(next(e for e in vf.ETAPAS if e["id"] == "04"), brief, {}) is True
