"""F6: una sola fuente por regla.

Cubre el cruce de `site/mock_data.json` con `brief.json` en `checks/coherencia.py`
y que `arsenal.py check-todo` ejecute la compuerta de diseno.
"""
from __future__ import annotations

import json
import pathlib
import re
import sys
from types import SimpleNamespace

RAIZ = pathlib.Path(__file__).resolve().parent.parent
if str(RAIZ) not in sys.path:
    sys.path.insert(0, str(RAIZ))

import arsenal  # noqa: E402
from checks import coherencia  # noqa: E402

MOCK = {
    "_simulado": True,
    "proyecto": {"nombre": "Huerta Cerca", "ciudad": "[SIMULADO]", "equipo": "Squad"},
    "producto": {"titulo": "la cosecha de hoy", "_nota": "[SIMULADO] pantalla unica"},
}


def test_el_nombre_de_la_maqueta_sale_del_brief():
    _, hallazgos = coherencia.revisar_mock(MOCK, {"project_name": "Huerta Cerca"})
    assert hallazgos == []


def test_un_nombre_inventado_en_la_maqueta_se_marca():
    _, hallazgos = coherencia.revisar_mock(MOCK, {"project_name": "Otro Proyecto"})
    assert len(hallazgos) == 1
    assert hallazgos[0]["gravedad"] == "importante"
    assert "Huerta Cerca" in hallazgos[0]["que"]


def test_lo_marcado_como_simulado_no_aporta_cifras():
    cifras, _ = coherencia.revisar_mock(MOCK, {"project_name": "Huerta Cerca"})
    assert cifras == {}


def test_una_cifra_sin_marca_si_se_cruza():
    mock = {"producto": {"precio": "C$ 450 por kit"}}
    cifras, _ = coherencia.revisar_mock(mock, {"project_name": "Huerta Cerca"})
    assert cifras


def test_sin_mock_no_hay_hallazgos():
    assert coherencia.revisar_mock({}, {"project_name": "X"}) == ({}, [])


def test_check_todo_ejecuta_la_compuerta_de_diseno(monkeypatch, capsys):
    """El paso 4 corre los cuatro validadores de diseno y producto."""
    vistos: list[str] = []

    def _run(comando, **kwargs):
        vistos.append(pathlib.Path(comando[1]).name)
        return SimpleNamespace(returncode=0, stdout="", stderr="")

    monkeypatch.setattr(arsenal.subprocess, "run", _run)
    monkeypatch.setattr(arsenal, "cmd_duracion", lambda args: 0)
    monkeypatch.setattr(arsenal, "cmd_coherencia", lambda args: 0)
    monkeypatch.setattr(arsenal, "cmd_campo", lambda args: 0)
    monkeypatch.setattr(arsenal, "ejecutar_validadores", lambda scripts=None, **k: [])

    codigo = arsenal.main([
        "check-todo", "--docx", "x.docx", "--plantilla", "y.docx",
        "--guion", "g.md", "--narracion", "n.txt", "--pautado", "p.docx",
    ])
    salida = capsys.readouterr().out

    assert codigo == 0
    assert {"verificar_producto.py", "verificar_identidad.py",
            "verificar_frontera.py", "probar_diseno.py"} <= set(vistos)
    assert "probar_diseno.py: PASA" in salida


def test_check_todo_reporta_revisar_si_la_pieza_tiene_plantilla(monkeypatch, capsys):
    def _run(comando, **kwargs):
        codigo = 1 if pathlib.Path(comando[1]).name == "probar_diseno.py" else 0
        return SimpleNamespace(returncode=codigo, stdout="", stderr="")

    monkeypatch.setattr(arsenal.subprocess, "run", _run)
    monkeypatch.setattr(arsenal, "cmd_duracion", lambda args: 0)
    monkeypatch.setattr(arsenal, "cmd_coherencia", lambda args: 0)
    monkeypatch.setattr(arsenal, "cmd_campo", lambda args: 0)
    monkeypatch.setattr(arsenal, "ejecutar_validadores", lambda scripts=None, **k: [])

    codigo = arsenal.main([
        "check-todo", "--docx", "x.docx", "--plantilla", "y.docx",
        "--guion", "g.md", "--narracion", "n.txt", "--pautado", "p.docx",
    ])
    salida = capsys.readouterr().out

    assert codigo == 1
    assert "probar_diseno.py: REVISAR" in salida


def test_la_maqueta_generada_no_copia_reglas_de_otra_skill():
    """publicar-sitio apunta a las duenas; no repite los numeros de identidad."""
    texto = (RAIZ / "skills" / "publicar-sitio" / "SKILL.md").read_text(encoding="utf-8")
    assert "skills/propuesta-identidad/SKILL.md" in texto
    assert "skills/_comun/capturas.md" in texto
    assert "375" not in texto and "1280" not in texto


def test_el_mapa_de_duenos_nombra_la_misma_duena_en_agentes_y_orquestador():
    def duenas(ruta: pathlib.Path) -> set[str]:
        texto = ruta.read_text(encoding="utf-8")
        return {linea.split("|")[2].strip() for linea in texto.splitlines()
                if linea.startswith("|") and "SKILL.md" in linea}

    mapa = duenas(RAIZ / "AGENTS.md")
    orquestador = duenas(RAIZ / "skills" / "orquestador" / "SKILL.md")
    assert mapa and mapa <= orquestador


def test_las_recetas_solo_usan_variables_de_token():
    recetas = sorted((RAIZ / "design" / "recetas").glob("*.css"))
    assert len(recetas) == 6
    for receta in recetas:
        texto = receta.read_text(encoding="utf-8")
        assert "var(--" in texto, receta.name
        assert not re.search(r"#[0-9a-fA-F]{3,8}\b", texto), f"{receta.name} escribio un hex literal"
