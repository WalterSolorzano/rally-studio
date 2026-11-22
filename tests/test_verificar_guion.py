# -*- coding: utf-8 -*-
"""Verificador de guion: duracion, nombre fuera de los primeros 20 s y prosa.

Los casos usan texto sintetico. La regla del nombre no se puede medir si el
guion no trae nombre, y eso tambien se comprueba.
"""

from scripts.verificar_guion import main, palabras, verificar

RELLENO = "agua " * 60


def _guion(nombre_posicion: int | None = None, nombre: str = "Cacao Norte") -> str:
    cuerpo = []
    for i in range(80):
        cuerpo.append(nombre if nombre_posicion == i else "agua")
    texto = " ".join(cuerpo)
    return f"## ACTO 1 - PROBLEMA\n{texto}\n\n## ACTO 2 - AGITACION\nagua agua agua\n"


def test_guion_valido_pasa():
    r = verificar(_guion(), nombre="Cacao Norte")
    assert r["fallos"] == []
    assert r["duracion_s"] <= 120


def test_guion_largo_se_rechaza():
    texto = "## ACTO 1\n" + "agua " * 300
    r = verificar(texto, nombre=None)
    assert any("supera el tope" in f for f in r["fallos"])


def test_nombre_en_el_primer_acto_se_rechaza():
    r = verificar(_guion(nombre_posicion=2), nombre="Cacao Norte")
    assert any("aparece en el segundo" in f for f in r["fallos"])


def test_nombre_tardio_pasa():
    r = verificar(_guion(nombre_posicion=60), nombre="Cacao Norte")
    assert r["segundo_del_nombre"] >= 20
    assert r["fallos"] == []


def test_nombre_no_medible_si_no_hay_nombre():
    r = verificar("## ACTO 1\nagua agua agua", nombre=None)
    assert r["nombre_medible"] is False
    assert r["fallos"] == []


def test_palabra_suelta_del_nombre_no_lo_detecta():
    # «Agua Cerca»: un acto que empieza hablando de agua no cuenta como nombre.
    texto = "## ACTO 1\n" + "agua " * 60 + "Agua Cerca " + "agua " * 60
    r = verificar(texto, nombre="Agua Cerca")
    assert r["segundo_del_nombre"] is not None
    assert r["segundo_del_nombre"] >= 20


def test_slop_en_un_acto_se_rechaza():
    texto = "## ACTO 1\nEs fundamental impulsar un ecosistema robusto. agua agua\n"
    r = verificar(texto, nombre=None)
    assert any(f.startswith("slop") for f in r["fallos"])


def test_slop_fuera_de_los_actos_no_cuenta():
    texto = (
        "## MEDICION\n- se elimino: Es fundamental impulsar un ecosistema robusto.\n\n"
        "## ACTO 1\nagua agua agua\n"
    )
    r = verificar(texto, nombre=None)
    assert r["fallos"] == []


def test_solo_cuenta_el_texto_de_los_actos():
    texto = (
        "## PREGUNTAS\n" + "pregunta " * 200 + "\n\n"
        "## ACTO 1\nagua agua agua\n\n"
        "## MEDICION\n" + "medicion " * 200
    )
    assert len(palabras(texto)) == 3


def test_main_devuelve_codigos(tmp_path):
    archivo = tmp_path / "guion.md"
    archivo.write_text(_guion(), encoding="utf-8")
    assert main([str(archivo), "--nombre", "Cacao Norte"]) == 0
    archivo.write_text("## ACTO 1\n" + "agua " * 400, encoding="utf-8")
    assert main([str(archivo)]) == 1
    assert main([str(tmp_path / "no-existe.md")]) == 2


def test_la_cita_en_blockquote_es_narracion():
    """Un guion real puso la voz en `>`; contarla en cero y decir OK es el peor fallo."""
    texto = (
        "## Acto 1 - Problema\n\n**Narracion**\n\n"
        "> El pozo queda a novecientos metros de las casas.\n\n"
        "**Tomas**\n\n| # | Seg | Que se ve |\n|---|---|---|\n"
        "| 1 | 0-3 | balde vacio |\n"
    )
    assert palabras(texto) == ["El", "pozo", "queda", "a", "novecientos", "metros",
                               "de", "las", "casas."]


def test_la_tabla_de_tomas_no_cuenta_como_narracion():
    texto = (
        "## Acto 1\n\n**Narracion**\n\nagua agua agua\n\n"
        "**Tomas**\n\n| 1 | 0-3 | Sello de COOPAGUA sobre documento |\n"
    )
    r = verificar(texto, nombre=None)
    assert not any("sello" in f.lower() for f in r["fallos"])


def test_una_marca_falta_dentro_de_la_oracion_no_borra_la_oracion():
    texto = (
        "## Acto 1\n\n**Narracion**\n\n"
        "El sistema se instala en dos puntos [FALTA: especificacion tecnica] y se "
        "entrega probado por el comite.\n"
    )
    assert len(palabras(texto)) == 14


def test_cero_palabras_narradas_es_fallo_y_no_aprobacion():
    texto = "## Notas de produccion\n\n- ninguna toma pasa de 3 s.\n"
    r = verificar(texto, nombre=None)
    assert r["palabras"] == 0
    assert any("no se pudo medir" in f for f in r["fallos"])


def test_la_etiqueta_de_narracion_manda_sobre_las_notas():
    texto = (
        "## Acto 1\n\nNota de produccion: congelar assets a la hora 18.\n\n"
        "**Narracion**\n\nagua agua agua\n"
    )
    assert palabras(texto) == ["agua", "agua", "agua"]


# ── H-36: la velocidad declarada no puede ser cualquier numero ──────────────


def test_wpm_cero_no_revienta_y_se_rechaza():
    r = verificar(_guion(), nombre="Cacao Norte", wpm=0)
    assert any("fuera del rango de locucion" in f for f in r["fallos"])
    assert r["wpm"] == 130


def test_wpm_negativo_se_rechaza():
    r = verificar(_guion(), nombre="Cacao Norte", wpm=-50)
    assert any("fuera del rango de locucion" in f for f in r["fallos"])


def test_wpm_inventado_no_acorta_el_video():
    """300 palabras a 100000 wpm «caben» en 0 s: eso no es medir, es saltarse la regla."""
    texto = "## ACTO 1\n" + "agua " * 400
    r = verificar(texto, nombre=None, wpm=100000)
    assert r["duracion_s"] > 120
    assert any("fuera del rango de locucion" in f for f in r["fallos"])
    assert any("supera el tope" in f for f in r["fallos"])


def test_wpm_en_el_rango_humano_se_respeta(tmp_path):
    archivo = tmp_path / "guion.md"
    archivo.write_text(_guion(), encoding="utf-8")
    assert main([str(archivo), "--nombre", "Cacao Norte", "--wpm", "110"]) == 0
    assert main([str(archivo), "--nombre", "Cacao Norte", "--wpm", "0"]) == 1
