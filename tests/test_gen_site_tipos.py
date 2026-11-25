"""F4: el sitio sabe dibujar cuatro tipos de pieza y publicarse autocontenido.

Fixtures neutros [SIMULADO]. Ningun nombre de proyecto real, ningun dato inventado.
"""
from __future__ import annotations

import importlib.util
import json
import pathlib

import pytest

RAIZ = pathlib.Path(__file__).resolve().parent.parent


def _modulo(nombre: str, archivo: pathlib.Path):
    spec = importlib.util.spec_from_file_location(nombre, archivo)
    modulo = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(modulo)
    return modulo


@pytest.fixture()
def gen_site(tmp_path, monkeypatch):
    gs = _modulo("gen_site_f4", RAIZ / "scripts" / "gen_site.py")
    (tmp_path / "brand").mkdir()
    (tmp_path / "brand" / "tokens.css").write_text(":root { --bg-app: #f6f7f8; }\n", encoding="utf-8")
    (tmp_path / "brief.json").write_text("{}", encoding="utf-8")
    monkeypatch.setattr(gs, "RAIZ", tmp_path)
    monkeypatch.setattr(gs, "BRIEF", tmp_path / "brief.json")
    monkeypatch.setattr(gs, "SALIDA", tmp_path / "site" / "index.html")
    monkeypatch.setattr(gs, "MOCK", tmp_path / "site" / "mock_data.json")
    return gs, tmp_path


@pytest.mark.parametrize("tipo", ["app-movil", "web-app", "pieza-3d"])
def test_cada_tipo_genera_su_pieza(gen_site, capsys, tipo):
    gs, raiz = gen_site
    assert gs.main(["--tipo", tipo]) == 0
    salida = capsys.readouterr().out
    assert "OK: site/index.html con la pieza " + tipo in salida
    assert (raiz / "site" / "index.html").exists()
    assert (raiz / "site" / "pagina.css").exists()
    assert (raiz / "site" / "tokens.css").exists()


def test_mock_data_se_marca_simulado_fuera_de_captura(gen_site, capsys):
    gs, raiz = gen_site
    assert gs.main(["--tipo", "app-movil"]) == 0
    capsys.readouterr()
    datos = json.loads((raiz / "site" / "mock_data.json").read_text(encoding="utf-8"))
    assert datos["_simulado"] is True
    assert "[SIMULADO]" in json.dumps(datos, ensure_ascii=False)


PLAN_COMPLETO = {
    "project_name": "Proyecto de prueba",
    "team_name": "Equipo de prueba",
    "city": "Ciudad de prueba",
    "producto": {
        "tipo": "app-movil",
        "plataforma": "Android",
        "protagonista": "La lista del dia",
        "metafora": "Una libreta que se ordena sola",
        "iconografia": "Trazo de 1.6 px, sin relleno",
        "marco": "Bisel de 390 por 844",
        "data_source": "Datos del equipo",
        "pantallas": [
            {"nombre": "Hoy", "primero": True},
            {"nombre": "Historial"},
        ],
        "motion": {"que": "Entrada de lista", "duracion": 160, "tipo": "ease-out",
                   "reduced": "sin desplazamiento"},
    },
}


def test_plan_completo_deja_el_area_de_captura_sin_marcas(gen_site, capsys):
    gs, raiz = gen_site
    (raiz / "brief.json").write_text(json.dumps(PLAN_COMPLETO), encoding="utf-8")
    assert gs.main(["--tipo", "app-movil"]) == 0
    capsys.readouterr()
    html = (raiz / "site" / "index.html").read_text(encoding="utf-8")
    assert "[SIMULADO]" not in html
    assert "La lista del dia" in html
    datos = json.loads((raiz / "site" / "mock_data.json").read_text(encoding="utf-8"))
    assert datos["_simulado"] is True


def test_la_pieza_no_lleva_hex_ni_enlaces_de_marca(gen_site, capsys):
    gs, raiz = gen_site
    assert gs.main(["--tipo", "web-app"]) == 0
    capsys.readouterr()
    html = (raiz / "site" / "index.html").read_text(encoding="utf-8")
    css = (raiz / "site" / "pagina.css").read_text(encoding="utf-8")
    assert not __import__("re").search(r"#[0-9a-fA-F]{6}\b", html + css)
    assert "../brand" not in html + css


def test_tipo_invalido_no_genera(gen_site):
    gs, raiz = gen_site
    with pytest.raises(SystemExit):
        gs.main(["--tipo", "revista"])
    assert not (raiz / "site" / "index.html").exists()


def test_landing_sin_reto_se_detiene(gen_site, capsys):
    gs, raiz = gen_site
    assert gs.main([]) == 1
    assert "ALTO" in capsys.readouterr().out
    assert not (raiz / "site" / "index.html").exists()


def test_landing_con_reto_y_paleta_pendiente_se_detiene(gen_site, monkeypatch, tmp_path):
    gs, raiz = gen_site
    (raiz / "brief.json").write_text(
        json.dumps({"project_name": "Proyecto de prueba", "solution": "Un paso\nOtro paso"}),
        encoding="utf-8",
    )
    # comun.paleta() lee su propia constante: sin paleta aprobada no hay pagina.
    with pytest.raises(SystemExit):
        gs.main([])


def test_autocontenido_detecta_enlace_a_brand_y_cdn(tmp_path, monkeypatch):
    pub = _modulo("publish_site_f4", RAIZ / "scripts" / "publish_site.py")
    (tmp_path / "index.html").write_text('<link href="../brand/tokens.css">', encoding="utf-8")
    (tmp_path / "pagina.css").write_text(
        '@import url("https://fonts.googleapis.com/css2?family=Inter");', encoding="utf-8"
    )
    (tmp_path / "diseno").mkdir()
    (tmp_path / "diseno" / "kit.html").write_text('<link href="../brand/tokens.css">', encoding="utf-8")
    monkeypatch.setattr(pub, "SITE_DIR", tmp_path)
    rotos = pub.autocontenido()
    assert any("../brand" in r for r in rotos)
    assert any("fonts.googleapis.com" in r for r in rotos)
    assert not any("diseno" in r for r in rotos)


def test_autocontenido_sitio_local_pasa(tmp_path, monkeypatch):
    pub = _modulo("publish_site_pasa", RAIZ / "scripts" / "publish_site.py")
    (tmp_path / "index.html").write_text('<link href="tokens.css">', encoding="utf-8")
    (tmp_path / "pagina.css").write_text('@font-face { src: url("fonts/x.woff2"); }', encoding="utf-8")
    monkeypatch.setattr(pub, "SITE_DIR", tmp_path)
    assert pub.autocontenido() == []
