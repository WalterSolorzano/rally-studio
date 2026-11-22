"""El encabezado es la etiqueta sola; una frase que empieza con el nombre de un campo no lo es.

Antes bastaba que la linea empezara con el nombre del campo: dentro de PROBLEMA, la
frase "Impacto: 40 familias sin agua" se tomaba como el encabezado de IMPACTO. El texto
de esa linea se perdia, lo que venia despues se contaba en el campo equivocado y el
conteo de PROBLEMA bajaba lo suficiente para que un exceso real pasara en silencio.
"""
from __future__ import annotations

import pathlib
import sys

import docx
import pytest

RAIZ = pathlib.Path(__file__).resolve().parents[1]
if str(RAIZ) not in sys.path:
    sys.path.insert(0, str(RAIZ))

from checks import campo_chars  # noqa: E402


def _docx(tmp_path: pathlib.Path, secciones) -> pathlib.Path:
    documento = docx.Document()
    for titulo, cuerpo in secciones:
        documento.add_heading(f"{titulo} (Límite: 1250 caracteres con espacios)", level=1)
        documento.add_paragraph(cuerpo)
    ruta = tmp_path / "pautado.docx"
    documento.save(str(ruta))
    return ruta


def test_una_frase_que_empieza_con_el_nombre_no_es_encabezado():
    texto = "\n".join([
        "PROBLEMA (Limite: 1250 caracteres)",
        "Linea uno del problema.",
        "Impacto: 40 familias sin agua.",
        "Linea dos del problema.",
    ])
    secciones = campo_chars.secciones_por_encabezado(texto)
    assert "Linea dos del problema." in secciones["problema"]
    assert "Impacto: 40 familias sin agua." in secciones["problema"]
    assert "impacto" not in secciones


def test_el_encabezado_real_con_su_tope_se_sigue_reconociendo():
    texto = "\n".join([
        "PROBLEMA (Límite: 1250 caracteres con espacios)",
        "Texto del problema.",
        "SOLUCION:",
        "Texto de la solucion.",
    ])
    secciones = campo_chars.secciones_por_encabezado(texto)
    assert secciones["problema"] == "Texto del problema."
    assert secciones["solucion"] == "Texto de la solucion."


def test_un_exceso_real_no_se_esconde_tras_una_linea_que_parece_encabezado(tmp_path):
    contenido = ("a " * 700) + "\nImpacto: 40 familias sin agua.\n"
    ruta = _docx(tmp_path, [
        ("PROBLEMA", contenido),
        ("SOLUCION", "Bomba solar comunitaria."),
        ("IMPACTO", "Cuarenta familias."),
        ("INNOVACION", "Bomba con telemetria."),
        ("PREFACTIBILIDAD", "Costo estimado: C$ 24 300."),
    ])
    _, conteos = campo_chars.revisar(ruta)
    assert conteos["problema"] > campo_chars.LIMITS["problema"]
    assert conteos["impacto"] == len("Cuarenta familias.")


def test_el_texto_de_la_linea_no_se_pierde(tmp_path):
    ruta = _docx(tmp_path, [
        ("PROBLEMA", "Primera linea.\nSolucion: filtro de arena."),
        ("SOLUCION", "Filtro de arena."),
    ])
    _, conteos = campo_chars.revisar(ruta)
    assert conteos["problema"] == len("Primera linea. Solucion: filtro de arena.")
    assert conteos["solucion"] == len("Filtro de arena.")


@pytest.mark.parametrize("linea", [
    "PROBLEMA",
    "PROBLEMA:",
    "Problema (máx. 1250 caracteres)",
    "  IMPACTO  ",
])
def test_formas_validas_de_encabezado(linea):
    texto = f"{linea}\nContenido."
    secciones = campo_chars.secciones_por_encabezado(texto)
    assert list(secciones) == [campo_chars._normalizar(linea.split(" (")[0].strip(" :"))]
