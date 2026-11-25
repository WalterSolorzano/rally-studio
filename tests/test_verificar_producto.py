"""Compuerta del plan de producto: plan completo pasa, negativos fallan."""
from __future__ import annotations

import json
import pathlib
import subprocess
import sys

RAIZ = pathlib.Path(__file__).resolve().parent.parent
SCRIPT = RAIZ / "scripts" / "verificar_producto.py"

# Plan neutro [SIMULADO]: ninguna pieza real, ningun dato de otro proyecto.
PLAN = {
    "piece_type": "app-movil",
    "plataforma": "Android 12+, uso a una mano",
    "protagonista": "telefono con la pantalla del registro abierto",
    "metafora": "una libreta que se llena sola",
    "pantallas": [
        {"id": "principal", "muestra": "registro del dia", "accion_simulada": "marcar y guardar", "primero": True},
        {"id": "historial", "muestra": "serie de la semana", "accion_simulada": "abrir una fila"},
    ],
    "estados": ["hover", "focus", "disabled", "vacío", "error"],
    "motion": {"que": "entrada de la fila nueva", "duracion": "160ms", "tipo": "ease-out",
               "reduced": "solo cambio de opacidad"},
    "iconografia": "trazo uniforme 1.5px sin relleno",
    "data_source": "research/claims.json + mock [SIMULADO]",
    "marco": "bisel de telefono 390x844",
    "modulos": {
        "core": ["registro", "historial"],
        "opcional": ["exportar"],
        "descartable": [{"nombre": "ajustes", "motivo": "no se juzga en 120 s"}],
    },
}


def correr(tmp_path, brief) -> subprocess.CompletedProcess:
    archivo = tmp_path / "brief.json"
    archivo.write_text(json.dumps(brief, ensure_ascii=False), encoding="utf-8")
    return subprocess.run(
        [sys.executable, str(SCRIPT), "--brief", str(archivo)],
        capture_output=True, text=True, encoding="utf-8", errors="replace",
    )


def test_plan_completo_pasa(tmp_path):
    r = correr(tmp_path, {"producto": PLAN})
    assert r.returncode == 0, r.stdout + r.stderr
    assert "OK   tipo de pieza" in r.stdout


def test_sin_plan_es_pendiente(tmp_path):
    r = correr(tmp_path, {})
    assert r.returncode == 0
    assert "PENDIENTE" in r.stdout


def test_sin_protagonista_falla(tmp_path):
    plan = {**PLAN, "protagonista": ""}
    r = correr(tmp_path, {"producto": plan})
    assert r.returncode == 1
    assert "sin protagonista" in r.stdout


def test_cuatro_pantallas_falla(tmp_path):
    extra = {"id": "extra", "muestra": "x", "accion_simulada": "y"}
    plan = {**PLAN, "pantallas": PLAN["pantallas"] + [extra, {**extra, "id": "otra"}]}
    r = correr(tmp_path, {"producto": plan})
    assert r.returncode == 1
    assert "techo es 3" in r.stdout


def test_motion_sin_reduced_falla(tmp_path):
    motion = {k: v for k, v in PLAN["motion"].items() if k != "reduced"}
    r = correr(tmp_path, {"producto": {**PLAN, "motion": motion}})
    assert r.returncode == 1
    assert "prefers-reduced-motion" in r.stdout


def test_sin_data_source_falla(tmp_path):
    r = correr(tmp_path, {"producto": {**PLAN, "data_source": ""}})
    assert r.returncode == 1
    assert "sin data_source" in r.stdout


def test_descartable_sin_motivo_falla(tmp_path):
    modulos = {**PLAN["modulos"], "descartable": [{"nombre": "ajustes"}]}
    r = correr(tmp_path, {"producto": {**PLAN, "modulos": modulos}})
    assert r.returncode == 1
    assert "sin nombre o sin motivo" in r.stdout


def test_dos_primeras_pantallas_falla(tmp_path):
    pantallas = [{**PLAN["pantallas"][0]}, {**PLAN["pantallas"][1], "primero": True}]
    r = correr(tmp_path, {"producto": {**PLAN, "pantallas": pantallas}})
    assert r.returncode == 1
    assert "exactamente una" in r.stdout
