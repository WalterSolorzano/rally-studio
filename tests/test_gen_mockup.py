"""Maqueta de producto: se genera desde la identidad aprobada y no lleva hex literal."""
from __future__ import annotations

import json
import pathlib
import sys

import pytest

RAIZ = pathlib.Path(__file__).resolve().parent.parent
sys.path.insert(0, str(RAIZ / "scripts"))

import gen_mockup  # noqa: E402

# Fixture neutro [SIMULADO]: no es la identidad de ningun proyecto real.
PALETA = {
    "_status": "aprobada",
    "_fuentes": {"display": "Fraunces", "ui": "Public Sans", "mono": "IBM Plex Mono"},
    "_contraste_primary_bg": 5.12,
    "_contraste_texto_bg": 12.4,
    "bg": "#f6f7f8",
    "primary": "#1f6f5c",
}
TOKENS = """:root {
  --bg-app: #f6f7f8;
  --bg-subtle: #eceef0;
  --bg-secondary: #f1f2f4;
  --text-title: #1a2320;
  --text-main: #1a2320;
  --text-body: #2f3b36;
  --text-muted: #5b6a64;
  --text-faint: #74837d;
  --border-light: #d7dbd8;
  --border-strong: #a9b2ad;
  --color-primary: #1f6f5c;
  --color-primary-hover: #185a4b;
  --color-accent: #c9a227;
  --border-focus: #1f6f5c;
  --status-err: #b3261e;
}
"""
BRIEF = {
    "project_name": "Proyecto de prueba",
    "description_one_line": "Registra el consumo de agua de una escuela.",
    "producto": {
        "metafora": "Una libreta que se llena sola.",
        "pantallas": [
            {"id": "registro", "muestra": "Registro del dia", "accion_simulada": "Guardar", "primero": True},
            {"id": "historial", "muestra": "Serie de la semana", "accion_simulada": "Abrir fila"},
            {"id": "ajustes", "muestra": "Ajustes", "accion_simulada": "Cambiar"},
            {"id": "cuarta", "muestra": "No deberia salir", "accion_simulada": "x"},
        ],
    },
}


@pytest.fixture()
def salida(tmp_path, monkeypatch):
    brief = tmp_path / "brief.json"
    paleta = tmp_path / "palette.json"
    tokens = tmp_path / "tokens.css"
    brief.write_text(json.dumps(BRIEF, ensure_ascii=False), encoding="utf-8")
    paleta.write_text(json.dumps(PALETA), encoding="utf-8")
    tokens.write_text(TOKENS, encoding="utf-8")
    monkeypatch.setattr(gen_mockup, "BRIEF", brief)
    monkeypatch.setattr(gen_mockup, "PALETTE", paleta)
    monkeypatch.setattr(gen_mockup, "TOKENS", tokens)
    monkeypatch.setattr(sys, "argv", ["gen_mockup", "--salida", str(tmp_path / "design" / "mockup.html")])
    return tmp_path


def test_genera_html_y_css(salida):
    assert gen_mockup.main() == 0
    html = (salida / "design" / "mockup.html").read_text(encoding="utf-8")
    assert "<main class=\"escena\">" in html
    assert (salida / "design" / "mockup.css").exists()


def test_sin_hex_literal_en_el_html(salida):
    gen_mockup.main()
    html = (salida / "design" / "mockup.html").read_text(encoding="utf-8")
    assert "#" not in html.replace("#pantalla", "")


def test_solo_tres_pantallas_y_la_primera_activa(salida):
    gen_mockup.main()
    html = (salida / "design" / "mockup.html").read_text(encoding="utf-8")
    # la primera pantalla es el protagonista; las otras dos son las filas de la lista
    assert html.count('class="fila') == 2
    assert "No deberia salir" not in html
    assert 'class="fila activa"' in html
    assert 'class="protagonista-valor"' in html


def test_accento_nunca_como_texto(salida):
    gen_mockup.main()
    css = (salida / "design" / "mockup.css").read_text(encoding="utf-8")
    assert "--color-accent" in css
    assert "color: var(--color-accent)" not in css


def test_sin_nombre_de_proyecto_se_detiene(salida):
    (salida / "brief.json").write_text(json.dumps({"project_name": ""}), encoding="utf-8")
    assert gen_mockup.main() == 2


def test_sin_identidad_aprobada_se_detiene(salida):
    (salida / "palette.json").write_text(json.dumps({"_status": "pendiente"}), encoding="utf-8")
    assert gen_mockup.main() == 2


def test_css_cumple_los_topes_de_la_compuerta(salida):
    gen_mockup.main()
    css = (salida / "design" / "mockup.css").read_text(encoding="utf-8")
    assert "font-variant-numeric" in css
    assert css.count("box-shadow") <= 2
    assert "prefers-reduced-motion" in css
    import re
    radios = [float(v) for v in re.findall(r"border-radius:\s*(\d+(?:\.\d+)?)px", css)]
    assert radios and max(radios) <= 18
