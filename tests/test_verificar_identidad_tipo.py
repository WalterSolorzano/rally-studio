"""F5: G3 se mide contra el sistema propio de la pieza, no contra los topes del motor.

Fixtures neutros. El bisel de un telefono no es un radio de tarjeta: la landing
no admite 38 px y la pieza app-movil si.
"""
from __future__ import annotations

import importlib.util
import json
import pathlib

RAIZ = pathlib.Path(__file__).resolve().parent.parent

TOKENS_OK = """:root {
  --bg-app: #ffffff;
  --bg-subtle: #f4f6f5;
  --bg-secondary: #eef1f0;
  --text-title: #10201a;
  --text-main: #1b2b25;
  --text-body: #33433c;
  --text-muted: #4e5d56;
  --text-faint: #5f6d66;
  --border-light: #dfe5e1;
  --border-strong: #748b81;
  --border-focus: #1f6f5c;
  --color-primary: #1f6f5c;
  --color-primary-hover: #175548;
  --color-accent: #b5732a;
  --status-err: #b3261e;
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 18px;
  --shadow-1: 0 1px 2px rgb(0 0 0 / 0.06);
  --motion-fast: 120ms;
  --motion-base: 200ms;
  --motion-slow: 320ms;
}
"""

PALETA_OK = {"_status": "aprobada", "bg": "#ffffff", "ink": "#1b2b25", "ac": "#1f6f5c"}


def _modulo():
    spec = importlib.util.spec_from_file_location(
        "verificar_identidad_f5", RAIZ / "scripts" / "verificar_identidad.py"
    )
    modulo = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(modulo)
    return modulo


def _raiz(tmp_path: pathlib.Path, css: str, html: str = "<p>Hola</p>",
          paleta: dict | None = None, tokens: str = TOKENS_OK) -> pathlib.Path:
    (tmp_path / "brand").mkdir()
    (tmp_path / "site").mkdir()
    (tmp_path / "brand" / "palette.json").write_text(
        json.dumps(paleta or PALETA_OK), encoding="utf-8"
    )
    (tmp_path / "brand" / "tokens.css").write_text(tokens, encoding="utf-8")
    (tmp_path / "site" / "style.css").write_text(css, encoding="utf-8")
    (tmp_path / "site" / "index.html").write_text(html, encoding="utf-8")
    return tmp_path


def _correr(tmp_path, monkeypatch, *argv) -> tuple[int, str, object]:
    vi = _modulo()
    monkeypatch.setattr(vi, "RAIZ", tmp_path)
    monkeypatch.setattr(vi, "PALETTE", tmp_path / "brand" / "palette.json")
    monkeypatch.setattr(vi, "TOKENS", tmp_path / "brand" / "tokens.css")
    monkeypatch.setattr(vi, "SITE", tmp_path / "site")
    monkeypatch.setattr(vi, "STATE", tmp_path / "state.json")
    vi.fallos.clear()
    codigo = vi.main(list(argv))
    return codigo, "\n".join(vi.fallos), vi


def test_pieza_pulida_pasa(tmp_path, monkeypatch):
    raiz = _raiz(tmp_path, ".tarjeta { border-radius: var(--radius-lg); }")
    codigo, fallos, _ = _correr(raiz, monkeypatch)
    assert codigo == 0, fallos


def test_bisel_de_38px_pasa_en_app_movil(tmp_path, monkeypatch):
    raiz = _raiz(tmp_path, ".bisel { border-radius: 38px; }")
    codigo, fallos, _ = _correr(raiz, monkeypatch, "--tipo", "app-movil")
    assert codigo == 0, fallos


def test_bisel_de_38px_falla_en_landing(tmp_path, monkeypatch):
    raiz = _raiz(tmp_path, ".bisel { border-radius: 38px; }")
    codigo, fallos, _ = _correr(raiz, monkeypatch)
    assert codigo == 1
    assert "38px" in fallos


def test_radio_fuera_de_la_escala_falla_en_cualquier_pieza(tmp_path, monkeypatch):
    raiz = _raiz(tmp_path, ".tarjeta { border-radius: 40px; }")
    codigo, fallos, _ = _correr(raiz, monkeypatch, "--tipo", "app-movil")
    assert codigo == 1
    assert "40px" in fallos


def test_motion_fuera_de_los_roles_declarados_falla(tmp_path, monkeypatch):
    raiz = _raiz(tmp_path, ".boton { transition: opacity 400ms ease-out; }")
    codigo, fallos, _ = _correr(raiz, monkeypatch)
    assert codigo == 1
    assert "400ms" in fallos


def test_sombra_sin_token_falla(tmp_path, monkeypatch):
    raiz = _raiz(tmp_path, ".carta { box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2); }")
    codigo, fallos, _ = _correr(raiz, monkeypatch)
    assert codigo == 1
    assert "sombra" in fallos


def test_keyframes_sin_reduced_motion_falla(tmp_path, monkeypatch):
    raiz = _raiz(tmp_path, "@keyframes sube { from { opacity: 0; } }\n.carta { animation: sube 200ms; }")
    codigo, fallos, _ = _correr(raiz, monkeypatch)
    assert codigo == 1
    assert "prefers-reduced-motion" in fallos


def test_texto_faint_ilegible_falla(tmp_path, monkeypatch):
    tokens = TOKENS_OK.replace("--text-faint: #5f6d66;", "--text-faint: #c9d1cc;")
    raiz = _raiz(tmp_path, ".nota { color: var(--text-faint); }", tokens=tokens)
    codigo, fallos, _ = _correr(raiz, monkeypatch)
    assert codigo == 1
    assert "--text-faint" in fallos


def test_borde_fuerte_bajo_3a1_falla(tmp_path, monkeypatch):
    tokens = TOKENS_OK.replace("--border-strong: #748b81;", "--border-strong: #dfe5e1;")
    raiz = _raiz(tmp_path, ".campo { border: 1px solid var(--border-strong); }", tokens=tokens)
    codigo, fallos, _ = _correr(raiz, monkeypatch)
    assert codigo == 1
    assert "--border-strong" in fallos


def test_estilo_inline_falla(tmp_path, monkeypatch):
    raiz = _raiz(tmp_path, ".a { border-radius: 4px; }", html='<p style="color: red">Hola</p>')
    codigo, fallos, _ = _correr(raiz, monkeypatch)
    assert codigo == 1
    assert "inline" in fallos


def test_cifras_alineadas_exigen_tabular_nums(tmp_path, monkeypatch):
    raiz = _raiz(tmp_path, ".detalle { font-family: var(--font-mono); }")
    codigo, fallos, _ = _correr(raiz, monkeypatch)
    assert codigo == 1
    assert "tabular-nums" in fallos
