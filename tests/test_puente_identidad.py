"""Tests del puente de identidad: la identidad del equipo llega a tokens sin heredar el motor."""
from __future__ import annotations

import json
import pathlib
import sys

import pytest

RAIZ = pathlib.Path(__file__).resolve().parent.parent
sys.path.insert(0, str(RAIZ / "scripts"))

import gen_palette  # noqa: E402
import puente_identidad as puente  # noqa: E402

# Fixture neutro [SIMULADO]: no es la paleta de ningun proyecto real.
IDENTIDAD = {
    "pal": {
        "bg": "#f6f7f8",
        "bg2": "#eceef0",
        "ac": "#1f6f5c",
        "ink": "#1a2320",
        "mu": "#5b6a64",
        "gl": "#c9a227",
    },
    "fonts": {"t": "Fraunces", "b": "Public Sans", "l": "IBM Plex Mono"},
}


def test_mapeo_cubre_los_tokens_requeridos():
    css = gen_palette.tokens_css(puente.mapear(IDENTIDAD))
    requeridas = [
        "--bg-app", "--bg-subtle", "--bg-secondary",
        "--text-title", "--text-main", "--text-body", "--text-muted", "--text-faint",
        "--border-light", "--border-strong",
        "--color-primary", "--color-primary-hover", "--color-accent", "--border-focus",
        "--status-err",
    ]
    faltan = [t for t in requeridas if t not in css]
    assert not faltan, faltan


def test_tokens_no_llevan_familias_del_motor():
    css = gen_palette.tokens_css(puente.mapear(IDENTIDAD))
    assert "Plus Jakarta" not in css
    assert "JetBrains" not in css
    assert "--font-display: 'Fraunces'" in css
    assert "--font-ui: 'Public Sans'" in css


def test_texto_legible_tras_ajuste():
    pal = puente.mapear(IDENTIDAD)
    for clave in ("text_main", "text_body", "primary"):
        assert gen_palette.contraste(pal[clave], pal["bg"]) >= 4.5


def test_ink_claro_se_oscurece_hasta_pasar_aa():
    claro = {"pal": {**IDENTIDAD["pal"], "ink": "#cfd4d1"}, "fonts": {}}
    pal = puente.mapear(claro)
    assert gen_palette.contraste(pal["text_main"], pal["bg"]) >= 4.5
    assert pal["text_main"] != "#cfd4d1"


def test_familia_fuera_de_biblioteca_se_descarta():
    raro = {"pal": IDENTIDAD["pal"], "fonts": {"t": "Satoshi", "b": "Public Sans", "l": "IBM Plex Mono"}}
    fuentes = puente.mapear(raro)["_fuentes"]
    assert fuentes["display"] == ""
    assert fuentes["ui"] == "Public Sans"


def test_etiqueta_no_mono_no_se_usa_como_mono():
    identidad = {"pal": IDENTIDAD["pal"], "fonts": {"t": "Fraunces", "b": "Public Sans", "l": "Space Grotesk"}}
    assert puente.mapear(identidad)["_fuentes"]["mono"] == ""


def test_sin_ink_falla():
    with pytest.raises(ValueError, match="faltan"):
        puente.mapear({"pal": {"bg": "#f6f7f8", "ac": "#1f6f5c"}, "fonts": {}})


def test_desenvolver_acepta_envuelto_en_data():
    assert puente.desenvolver({"data": {"pal": IDENTIDAD["pal"]}})["pal"] == IDENTIDAD["pal"]


def test_cli_escribe_paleta_aprobada(tmp_path, monkeypatch, capsys):
    archivo = tmp_path / "identidad.json"
    archivo.write_text(json.dumps(IDENTIDAD), encoding="utf-8")
    monkeypatch.setattr(puente, "PALETTE", tmp_path / "palette.json")
    monkeypatch.setattr(puente, "TOKENS", tmp_path / "tokens.css")
    monkeypatch.setattr(sys, "argv", ["puente", "--archivo", str(archivo), "--si"])

    assert puente.main() == 0
    datos = json.loads((tmp_path / "palette.json").read_text(encoding="utf-8"))
    assert datos["_status"] == "aprobada"
    assert datos["_generado_por"] == "scripts/puente_identidad.py"
    assert (tmp_path / "tokens.css").read_text(encoding="utf-8").count("--bg-app") == 1


def test_cli_sin_si_no_escribe(tmp_path, monkeypatch):
    archivo = tmp_path / "identidad.json"
    archivo.write_text(json.dumps(IDENTIDAD), encoding="utf-8")
    monkeypatch.setattr(puente, "PALETTE", tmp_path / "palette.json")
    monkeypatch.setattr(puente, "TOKENS", tmp_path / "tokens.css")
    monkeypatch.setattr(sys, "argv", ["puente", "--archivo", str(archivo)])

    assert puente.main() == 0
    assert not (tmp_path / "palette.json").exists()


def test_cli_identidad_incompleta_sale_2(tmp_path, monkeypatch):
    archivo = tmp_path / "identidad.json"
    archivo.write_text(json.dumps({"pal": {"bg": "#f6f7f8"}}), encoding="utf-8")
    monkeypatch.setattr(sys, "argv", ["puente", "--archivo", str(archivo)])
    assert puente.main() == 2
