"""F1: la capa proyecto no arrastra la identidad del motor.

Fixtures neutros [SIMULADO]: ningun color ni familia del workbench.
"""
from __future__ import annotations

import importlib.util
import json
import pathlib

RAIZ = pathlib.Path(__file__).resolve().parent.parent
_spec = importlib.util.spec_from_file_location(
    "verificar_frontera", RAIZ / "scripts" / "verificar_frontera.py"
)
vf = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(vf)

PALETA_NEUTRA = {
    "_status": "aprobada",
    "bg": "#f6f7f8",
    "ink": "#1a2320",
    "ac": "#1f6f5c",
    "_fuentes": {"display": "Fraunces", "ui": "Public Sans", "mono": "IBM Plex Mono"},
}


def _preparar(tmp_path: pathlib.Path, paleta: dict | None = None) -> pathlib.Path:
    (tmp_path / "brand").mkdir()
    (tmp_path / "site").mkdir()
    (tmp_path / "design").mkdir()
    (tmp_path / "dashboard").mkdir()
    (tmp_path / "brand" / "palette.json").write_text(
        json.dumps(paleta or PALETA_NEUTRA), encoding="utf-8"
    )
    (tmp_path / "brand" / "tokens.css").write_text(
        ":root { --bg-app: #f6f7f8; --font-ui: 'Public Sans', system-ui; }",
        encoding="utf-8",
    )
    (tmp_path / "site" / "index.html").write_text("<p>Hola</p>", encoding="utf-8")
    (tmp_path / "design" / "kit.html").write_text("<main>Kit</main>", encoding="utf-8")
    return tmp_path


def _correr(tmp_path: pathlib.Path, capsys) -> tuple[int, str]:
    codigo = vf.main(["--raiz", str(tmp_path)])
    return codigo, capsys.readouterr().out


def test_capa_proyecto_limpia_pasa(tmp_path, capsys):
    raiz = _preparar(tmp_path)
    codigo, salida = _correr(raiz, capsys)
    assert codigo == 0
    assert "OK   frontera" in salida


def test_hex_del_motor_en_site_falla(tmp_path, capsys):
    raiz = _preparar(tmp_path)
    (raiz / "site" / "style.css").write_text("a{color:#0866F5}", encoding="utf-8")
    codigo, salida = _correr(raiz, capsys)
    assert codigo == 1
    assert "#0866F5" in salida


def test_familia_del_motor_en_tokens_sin_aprobar_falla(tmp_path, capsys):
    raiz = _preparar(tmp_path)
    (raiz / "brand" / "tokens.css").write_text(
        ":root { --font-ui: 'Plus Jakarta Sans', sans-serif; }", encoding="utf-8"
    )
    codigo, salida = _correr(raiz, capsys)
    assert codigo == 1
    assert "Plus Jakarta Sans" in salida


def test_familia_aprobada_por_el_humano_pasa(tmp_path, capsys):
    paleta = dict(PALETA_NEUTRA, _fuentes={"display": "Plus Jakarta Sans"})
    raiz = _preparar(tmp_path, paleta)
    (raiz / "brand" / "tokens.css").write_text(
        ":root { --font-display: 'Plus Jakarta Sans', sans-serif; }", encoding="utf-8"
    )
    codigo, _ = _correr(raiz, capsys)
    assert codigo == 0


def test_color_aprobado_en_paleta_pasa(tmp_path, capsys):
    paleta = dict(PALETA_NEUTRA, apoyo="#334155")
    raiz = _preparar(tmp_path, paleta)
    (raiz / "site" / "style.css").write_text("a{color:#334155}", encoding="utf-8")
    codigo, _ = _correr(raiz, capsys)
    assert codigo == 0


def test_clase_del_motor_en_site_falla(tmp_path, capsys):
    raiz = _preparar(tmp_path)
    (raiz / "site" / "index.html").write_text(
        '<span class="status-dot"></span>', encoding="utf-8"
    )
    codigo, salida = _correr(raiz, capsys)
    assert codigo == 1
    assert "status-dot" in salida


def test_kit_del_sistema_con_marca_propia_informa_sin_fallar(tmp_path, capsys):
    raiz = _preparar(tmp_path)
    (raiz / "design" / "thumb.html").write_text(
        '<span class="status-dot"></span><b>// RALLY STUDIO</b>', encoding="utf-8"
    )
    codigo, salida = _correr(raiz, capsys)
    assert codigo == 0
    assert "INFO design/thumb.html" in salida


def test_copia_del_kit_publicada_en_site_tampoco_falla(tmp_path, capsys):
    raiz = _preparar(tmp_path)
    (raiz / "site" / "diseno").mkdir()
    (raiz / "site" / "diseno" / "kit.css").write_text("a{color:#0866F5}", encoding="utf-8")
    codigo, salida = _correr(raiz, capsys)
    assert codigo == 0
    assert "INFO site/diseno/kit.css" in salida


def test_marca_del_workbench_en_site_falla(tmp_path, capsys):
    raiz = _preparar(tmp_path)
    (raiz / "site" / "index.html").write_text("<b>// RALLY STUDIO</b>", encoding="utf-8")
    codigo, salida = _correr(raiz, capsys)
    assert codigo == 1
    assert "RALLY STUDIO" in salida


def test_motor_importando_tokens_del_proyecto_falla(tmp_path, capsys):
    raiz = _preparar(tmp_path)
    (raiz / "dashboard" / "style.css").write_text(
        '@import url("../brand/tokens.css");', encoding="utf-8"
    )
    codigo, salida = _correr(raiz, capsys)
    assert codigo == 1
    assert "dashboard/style.css" in salida


def test_extension_declarada_del_motor_usa_tokens_sin_fallar(tmp_path, capsys):
    raiz = _preparar(tmp_path)
    entrega = raiz / "dashboard" / "entregables"
    entrega.mkdir()
    (entrega / "teleprompter.html").write_text(
        '@import url("../../brand/tokens.css");', encoding="utf-8"
    )
    codigo, _ = _correr(raiz, capsys)
    assert codigo == 0


def test_otra_entrega_del_motor_importando_tokens_falla(tmp_path, capsys):
    raiz = _preparar(tmp_path)
    entrega = raiz / "dashboard" / "entregables"
    entrega.mkdir()
    (entrega / "storyboard.html").write_text(
        '@import url("../../brand/tokens.css");', encoding="utf-8"
    )
    codigo, salida = _correr(raiz, capsys)
    assert codigo == 1
    assert "entregables/storyboard.html" in salida
