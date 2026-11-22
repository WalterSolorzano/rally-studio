import json
import shutil
import subprocess
import sys
from pathlib import Path

import pytest

REPO_ROOT = Path(__file__).resolve().parent.parent
SONDA = REPO_ROOT / "tests" / "js" / "chat_probe.js"

pytestmark = pytest.mark.skipif(
    sys.platform != "win32" and shutil.which("node") is None,
    reason="necesita Node",
)

BASE = {
    "project_name": "Semilla",
    "team_name": "Equipo Semilla",
    "university": "UNI",
    "city": "Jinotega",
    "challenge_id": "R-01",
    "challenge_title": "Agua",
    "category": "Social",
    "rally_type": "latam",
    "hours_total": 28,
    "solution_thesis": "Tesis real",
    "solution_simple": "Simple real",
    "solution_approved": True,
    "pautado": {"problema": "a", "solucion": "b", "impacto": "c", "innovacion": "d", "prefactibilidad": "e"},
    "budget": [{"units": 2, "unit_cost": 1500, "url": "https://x"}],
    "model_canvas": {
        "socios": "v", "actividades": "v", "propuesta": "v", "relaciones": "v", "segmentos": "v",
        "recursos": "v", "canales": "v", "costes": "v", "ingresos": "v",
    },
    "script": {"acto1": "a b", "acto2": "a b", "acto3": "a b", "acto4": "a b"},
    "shot_plan": [{"id": 1}],
}


def _correr(estado):
    proceso = subprocess.run(
        ["node", str(SONDA), json.dumps(estado, ensure_ascii=False)],
        capture_output=True, text=True, encoding="utf-8", timeout=60,
        cwd=str(REPO_ROOT),
    )
    datos = json.loads(proceso.stdout)
    assert datos.get("ok") is True, datos
    return datos


def test_proyecto_completo_no_reporta_huecos():
    datos = _correr(BASE)
    assert datos["huecos"] == []


def test_la_solucion_aprobada_se_resume_y_no_se_declara_hueco():
    datos = _correr(BASE)
    assert "Tesis real" in datos["resumen"]
    assert "aprobada por el equipo" in datos["resumen"]
    assert not any("solución" in h and "aprobar" not in h for h in datos["huecos"])


def test_solucion_escrita_sin_aprobar_pide_aprobacion():
    estado = dict(BASE, solution_approved=False)
    datos = _correr(estado)
    assert datos["huecos"] == ["aprobar la solución (fase 03)"]
    assert "sin aprobar" in datos["resumen"]


def test_la_version_simple_basta_como_solucion_escrita():
    estado = dict(BASE, solution_thesis="")
    datos = _correr(estado)
    assert "Simple real" in datos["resumen"]
    assert datos["huecos"] == []


def test_ventana_vacia_sigue_pidiendo_la_solucion():
    datos = _correr({})
    assert "solución (fase 03)" in datos["huecos"]


def test_canvas_cuenta_solo_los_nueve_cuadrantes():
    estado = json.loads(json.dumps(BASE))
    estado["model_canvas"]["nota_vieja"] = "x"
    datos = _correr(estado)
    assert "9/9 cuadrantes" in datos["resumen"]
    assert "10/9" not in datos["resumen"]
    assert "fuera del lienzo" in datos["resumen"]
    assert datos["huecos"] == []


def test_una_clave_fuera_del_lienzo_no_llena_el_canvas():
    estado = json.loads(json.dumps(BASE))
    estado["model_canvas"] = {"nota_vieja": "x"}
    datos = _correr(estado)
    assert "0/9 cuadrantes" in datos["resumen"]
    assert "canvas (fase 09)" in datos["huecos"]


def test_el_techo_del_guion_es_270_palabras():
    datos = _correr(BASE)
    assert "techo 240–270" in datos["resumen"]


def test_el_chat_no_vuelve_a_leer_claves_inexistentes():
    fuente = (REPO_ROOT / "dashboard" / "chat.js").read_text(encoding="utf-8-sig")
    assert "txt(st.solution)" not in fuente
    assert "txt(st.problem)" not in fuente
    assert "solution_approved" in fuente
