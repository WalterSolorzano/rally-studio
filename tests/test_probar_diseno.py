"""G2: la pieza no delata a una plantilla.

Fixtures neutros [SIMULADO]: modo claro/oscuro se decide por el plan, no por
un color de marca ajeno.
"""
from __future__ import annotations

import importlib.util
import json
import pathlib

RAIZ = pathlib.Path(__file__).resolve().parent.parent
_spec = importlib.util.spec_from_file_location(
    "probar_diseno", RAIZ / "scripts" / "probar_diseno.py"
)
pd = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(pd)

TOKENS = """
:root {
  --space-2: 8px; --space-3: 12px; --space-4: 16px; --space-5: 24px;
  --radius-sm: 4px; --radius-md: 8px;
  --motion-fast: 120ms;
}
"""

HOJA = """
.pantalla { padding: var(--space-4); gap: var(--space-3); }
.protagonista { padding: var(--space-5); background: var(--bg-subtle); }
.detalle { font-variant-numeric: tabular-nums; }
"""

PAGINA = """
<main class="escena"><section class="pantalla protagonista"><p>Cosecha</p></section></main>
"""


def _raiz(tmp_path, hoja=HOJA, pagina=PAGINA, estados=None) -> pathlib.Path:
    (tmp_path / "brand").mkdir()
    (tmp_path / "site").mkdir()
    (tmp_path / "brand" / "tokens.css").write_text(TOKENS, encoding="utf-8")
    (tmp_path / "site" / "pagina.css").write_text(hoja, encoding="utf-8")
    (tmp_path / "site" / "index.html").write_text(pagina, encoding="utf-8")
    brief = {"producto": {"estados": estados or []}}
    (tmp_path / "brief.json").write_text(json.dumps(brief), encoding="utf-8")
    return tmp_path


def test_pieza_pulida_pasa(tmp_path):
    assert pd.revisar(_raiz(tmp_path), "app-movil") == []


def test_morado_de_ia_falla(tmp_path):
    raiz = _raiz(tmp_path, hoja=HOJA + ".marca{color:#7c3aed}")
    fallos = pd.revisar(raiz, "landing")
    assert any("morado" in f for f in fallos)


def test_azul_de_marca_no_es_morado(tmp_path):
    raiz = _raiz(tmp_path, hoja=HOJA + ".marca{color:#0866f5}")
    assert not any("morado" in f for f in pd.revisar(raiz, "landing"))


def test_glassmorphism_falla(tmp_path):
    raiz = _raiz(tmp_path, hoja=HOJA + ".x{backdrop-filter: blur(8px)}")
    assert any("glassmorphism" in f for f in pd.revisar(raiz, "landing"))


def test_espaciado_fuera_de_la_escala_falla(tmp_path):
    raiz = _raiz(tmp_path, hoja=HOJA + ".x{padding: 20px}")
    assert any("escala" in f for f in pd.revisar(raiz, "app-movil"))


def test_espaciado_fuera_de_la_escala_se_ignora_en_landing(tmp_path):
    raiz = _raiz(tmp_path, hoja=HOJA + ".x{padding: 20px}")
    assert not any("escala" in f for f in pd.revisar(raiz, "landing"))


def test_cuatro_familias_falla(tmp_path):
    hoja = HOJA + (
        ".a{font-family:'Uno',sans-serif}.b{font-family:'Dos',sans-serif}"
        ".c{font-family:'Tres',sans-serif}.d{font-family:'Cuatro',sans-serif}"
    )
    raiz = _raiz(tmp_path, hoja=hoja)
    assert any("familias" in f for f in pd.revisar(raiz, "landing"))


def test_keyframes_sin_reduced_falla(tmp_path):
    raiz = _raiz(tmp_path, hoja=HOJA + "@keyframes latir{from{opacity:.2}to{opacity:1}}")
    assert any("reduced" in f for f in pd.revisar(raiz, "landing"))


def test_estilo_inline_falla(tmp_path):
    pagina = '<main class="hero" style="color:red"><p>x</p></main>'
    raiz = _raiz(tmp_path, pagina=pagina)
    assert any("inline" in f for f in pd.revisar(raiz, "landing"))


def test_emoji_como_icono_falla(tmp_path):
    pagina = '<main class="hero"><p>Cosecha \U0001F33E</p></main>'
    raiz = _raiz(tmp_path, pagina=pagina)
    assert any("emoji" in f for f in pd.revisar(raiz, "landing"))


def test_color_literal_en_html_falla(tmp_path):
    pagina = '<main class="hero" data-x="#aabbcc"><p>x</p></main>'
    raiz = _raiz(tmp_path, pagina=pagina)
    assert any("color literal" in f for f in pd.revisar(raiz, "landing"))


def test_trazos_desiguales_falla(tmp_path):
    pagina = (
        '<main class="hero"><svg stroke-width="1.5"></svg>'
        '<svg stroke-width="2.5"></svg></main>'
    )
    raiz = _raiz(tmp_path, pagina=pagina)
    assert any("trazos" in f for f in pd.revisar(raiz, "landing"))


def test_sin_protagonista_falla(tmp_path):
    raiz = _raiz(tmp_path, pagina="<main><section><p>x</p></section></main>")
    assert any("protagonista" in f for f in pd.revisar(raiz, "landing"))


def test_rejilla_de_tarjetas_clonadas_falla(tmp_path):
    pagina = '<main class="hero">' + "".join(
        f'<div class="tarjeta"><p>{i}</p></div>' for i in range(6)
    ) + "</main>"
    raiz = _raiz(tmp_path, pagina=pagina)
    assert any("tarjetas clonadas" in f for f in pd.revisar(raiz, "landing"))


def test_estado_declarado_sin_dibujar_falla(tmp_path):
    raiz = _raiz(tmp_path, estados=["hover", "disabled"])
    fallos = pd.revisar(raiz, "landing")
    assert any("hover" in f for f in fallos)
    assert any("disabled" in f for f in fallos)


def test_estado_declarado_y_dibujado_pasa(tmp_path):
    hoja = HOJA + '.accion:hover{filter:brightness(.94)}[disabled]{opacity:.55}'
    raiz = _raiz(tmp_path, hoja=hoja, estados=["hover", "disabled"])
    assert pd.revisar(raiz, "landing") == []


def test_site_vacio_falla(tmp_path):
    (tmp_path / "site").mkdir()
    assert pd.revisar(tmp_path, "landing") == ["site/ sin pieza que revisar"]


def test_main_devuelve_uno_con_huella(tmp_path, capsys):
    raiz = _raiz(tmp_path, hoja=HOJA + ".x{backdrop-filter: blur(4px)}")
    codigo = pd.main(["--raiz", str(raiz), "--tipo", "landing"])
    assert codigo == 1
    assert "FAIL diseno" in capsys.readouterr().out


def test_main_devuelve_cero_limpio(tmp_path, capsys):
    raiz = _raiz(tmp_path)
    assert pd.main(["--raiz", str(raiz)]) == 0
    assert "OK   diseno" in capsys.readouterr().out
