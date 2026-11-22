# -*- coding: utf-8 -*-
"""Las skills prometen medidores: esta prueba exige que existan y coincidan.

Una skill es una instrucción que se ejecuta. Si manda correr un script que no
está, o describe bandas de tiempo que el programa calcula de otra forma, la IA
obedece a la prosa y el jurado lee otro resultado (H-40).
"""

import json
import re
import subprocess
import sys
from pathlib import Path

import pytest

from arsenal import FASES_TIEMPO, fase_de_tiempo

RAIZ = Path(__file__).resolve().parents[1]
SKILLS = sorted(RAIZ.glob("skills/*/SKILL.md"))
RX_SCRIPT = re.compile(r"python\s+((?:scripts|checks)/[A-Za-z0-9_]+\.py|arsenal\.py)")


def _skill(nombre: str) -> str:
    return (RAIZ / "skills" / nombre / "SKILL.md").read_text(encoding="utf-8")


def test_toda_skill_tiene_sku():
    assert len(SKILLS) >= 16, [p.parent.name for p in SKILLS]


@pytest.mark.parametrize("skill", SKILLS, ids=lambda p: p.parent.name)
def test_los_scripts_que_manda_correr_existen(skill):
    texto = skill.read_text(encoding="utf-8")
    faltan = [ref for ref in sorted(set(RX_SCRIPT.findall(texto))) if not (RAIZ / ref).exists()]
    assert not faltan, f"skills/{skill.parent.name}/SKILL.md manda correr {faltan}"


def test_control_tiempo_no_tiene_dos_tablas_de_bandas():
    texto = _skill("control-tiempo-entrega")
    # La tabla vieja (0-50 / 50-75) contradecía el prompt de la misma skill.
    assert "0% - 50%" not in texto
    assert "50% - 75%" not in texto


def test_control_tiempo_describe_las_bandas_que_el_codigo_calcula():
    texto = _skill("control-tiempo-entrega")
    esperadas = {
        "0 % - 35 %": fase_de_tiempo(0.10),
        "35 % - 55 %": fase_de_tiempo(0.40),
        "55 % - 75 %": fase_de_tiempo(0.60),
        "75 %": fase_de_tiempo(0.80),
        "90 % - 100 %": fase_de_tiempo(0.95),
    }
    assert esperadas["0 % - 35 %"] == "producir"
    assert esperadas["35 % - 55 %"] == "revisar"
    assert esperadas["55 % - 75 %"] == "integrar"
    assert "congelar" in esperadas["75 %"]
    assert "entregar" in esperadas["90 % - 100 %"]
    for banda in esperadas:
        assert banda in texto, f"falta la banda {banda} en la skill"


def test_control_tiempo_manda_los_comandos_que_existen():
    texto = _skill("control-tiempo-entrega")
    for comando in ("arsenal.py check-tiempo", "arsenal.py check-validadores",
                    "arsenal.py check-todo"):
        assert comando in texto, f"la skill no nombra {comando}"


def test_check_tiempo_json_entrega_las_claves_prometidas(tmp_path):
    texto = _skill("control-tiempo-entrega")
    prometidas = {
        "rally_type", "hours_total", "hours_remaining", "porcentaje_alcanzado",
        "fase", "entregables_pendientes", "congelar_assets", "alerta_roja",
    }
    assert all(clave in texto for clave in prometidas)

    brief = tmp_path / "brief.json"
    brief.write_text(json.dumps({
        "rally_type": "latam", "hours_total": 28, "hours_remaining": 21,
        "project_name": "", "team_name": "", "university": "", "city": "",
    }), encoding="utf-8")
    p = subprocess.run(
        [sys.executable, str(RAIZ / "arsenal.py"), "check-tiempo",
         "--brief", str(brief), "--json"],
        capture_output=True, text=True, errors="replace", cwd=str(RAIZ),
    )
    assert p.returncode == 0, p.stderr
    datos = json.loads(p.stdout)
    assert set(datos) == prometidas, sorted(datos)
    assert datos["porcentaje_alcanzado"] == 25.0
    assert datos["fase"] == "producir"
    assert datos["congelar_assets"] is False


def test_las_bandas_del_codigo_son_las_de_la_skill():
    limites = [tope for tope, _fase in FASES_TIEMPO]
    assert limites == [0.35, 0.55, 0.75, 0.90, 1.01]


# --- Los espejos de skills no pueden quedarse viejos ------------------------


ESPEJOS = (".opencode/skills", ".agents/skills")


def test_toda_skill_tiene_espejo_en_los_dos_destinos():
    faltan = {
        espejo: [p.parent.name for p in SKILLS
                 if not (RAIZ / espejo / p.parent.name / "SKILL.md").exists()]
        for espejo in ESPEJOS
    }
    assert not any(faltan.values()), faltan


@pytest.mark.parametrize("espejo", ESPEJOS)
@pytest.mark.parametrize("skill", SKILLS, ids=lambda p: p.parent.name)
def test_el_espejo_es_identico_a_la_fuente(espejo, skill):
    # Editar `skills/` y dejar el espejo viejo hace que la IA cargue la versión
    # anterior: el mismo texto, dos verdades.
    fuente = skill.read_bytes()
    copia = (RAIZ / espejo / skill.parent.name / "SKILL.md").read_bytes()
    assert copia == fuente, f"{espejo}/{skill.parent.name}/SKILL.md está desincronizado"
