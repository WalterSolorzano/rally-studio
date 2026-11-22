# -*- coding: utf-8 -*-
"""El pautado no repite el nombre del proyecto mas de una vez por seccion.

Regla 3 de `AGENTS.md`. Se mide sobre el docx entregado, no sobre la nota de
proceso: un pautado que dice el nombre tres veces en el problema gasta
caracteres del tope y suena a slogan.
"""

import json
import sys
from pathlib import Path

import pytest

RAIZ = Path(__file__).resolve().parents[1]
if str(RAIZ) not in sys.path:
    sys.path.insert(0, str(RAIZ))
if str(RAIZ / "scripts") not in sys.path:
    sys.path.insert(0, str(RAIZ / "scripts"))

import validate_pautado as vp  # noqa: E402

docx = pytest.importorskip("docx")

PROBLEMA = ("PROBLEMA", "En Somoto el pozo queda a novecientos metros de las casas.")
SOLUCION = ("SOLUCION", "El sistema se instala en dos puntos del barrio.")


def _escribir(tmp_path: Path, project_name: str, secciones: list[tuple[str, str]]) -> None:
    (tmp_path / "brief.json").write_text(
        json.dumps({"rally_type": "nacional", "project_name": project_name},
                   ensure_ascii=False),
        encoding="utf-8",
    )
    documento = docx.Document()
    for encabezado, cuerpo in secciones:
        documento.add_paragraph(encabezado)
        documento.add_paragraph(cuerpo)
    (tmp_path / "docs").mkdir(exist_ok=True)
    documento.save(str(tmp_path / "docs" / "pautado_draft.docx"))


def test_una_mencion_por_seccion_pasa(tmp_path, monkeypatch):
    monkeypatch.chdir(tmp_path)
    _escribir(tmp_path, "Agua Cerca", [
        PROBLEMA, SOLUCION,
        ("IMPACTO", "Agua Cerca llega a cuarenta familias."),
    ])
    assert vp.secciones_con_nombre_repetido(
        vp.texto_docx(vp.DRAFT_PATH), "Agua Cerca") == []


def test_dos_menciones_en_la_misma_seccion_se_marcan(tmp_path):
    _escribir(tmp_path, "Agua Cerca", [
        ("PROBLEMA", "Agua Cerca nace del acarreo. Agua Cerca lo resuelve."),
        SOLUCION,
    ])
    hallado = vp.secciones_con_nombre_repetido(
        vp.texto_docx(tmp_path / "docs" / "pautado_draft.docx"), "Agua Cerca")
    assert hallado == ["problema"]


def test_la_medicion_ignora_mayusculas(tmp_path):
    _escribir(tmp_path, "Agua Cerca", [
        ("PROBLEMA", "AGUA CERCA acarrea. agua cerca instala."),
    ])
    assert vp.secciones_con_nombre_repetido(
        vp.texto_docx(tmp_path / "docs" / "pautado_draft.docx"), "Agua Cerca") == ["problema"]


def test_sin_nombre_en_el_brief_no_hay_nada_que_medir(tmp_path):
    _escribir(tmp_path, "", [PROBLEMA, SOLUCION])
    texto = vp.texto_docx(tmp_path / "docs" / "pautado_draft.docx")
    assert vp.nombre_del_proyecto  # existe la funcion
    assert vp.secciones_con_nombre_repetido(texto, "") == []


def test_main_bloquea_el_pautado_que_repite_el_nombre(tmp_path, monkeypatch):
    monkeypatch.chdir(tmp_path)
    _escribir(tmp_path, "Agua Cerca", [
        ("PROBLEMA", "Agua Cerca acarrea. Agua Cerca instala."),
        SOLUCION,
    ])
    with pytest.raises(SystemExit) as salida:
        vp.main()
    assert salida.value.code == 1


def test_main_acepta_el_pautado_con_una_mencion(tmp_path, monkeypatch):
    monkeypatch.chdir(tmp_path)
    _escribir(tmp_path, "Agua Cerca", [
        PROBLEMA,
        ("SOLUCION", "Agua Cerca se instala en dos puntos del barrio."),
    ])
    vp.main()


def test_main_sin_documento_devuelve_uno(tmp_path, monkeypatch):
    monkeypatch.chdir(tmp_path)
    with pytest.raises(SystemExit) as salida:
        vp.main()
    assert salida.value.code == 1


# ── H-35: documento vacio, marcador en tabla y docx ilegible ────────────────


def _guardar(tmp_path: Path, documento) -> None:
    (tmp_path / "docs").mkdir(exist_ok=True)
    documento.save(str(tmp_path / "docs" / "pautado_draft.docx"))


def test_nacional_sin_secciones_no_anuncia_exito(tmp_path, monkeypatch, capsys):
    """En Nacional no hay topes, y ese `return` temprano saltaba el hallazgo critico."""
    monkeypatch.chdir(tmp_path)
    (tmp_path / "brief.json").write_text(json.dumps({"rally_type": "nacional"}), encoding="utf-8")
    documento = docx.Document()
    documento.add_paragraph("Un texto suelto sin encabezados del pautado.")
    _guardar(tmp_path, documento)
    with pytest.raises(SystemExit) as salida:
        vp.main()
    assert salida.value.code == 1
    assert "No se reconocio ningun campo" in capsys.readouterr().out


def test_un_pendiente_dentro_de_una_tabla_se_detecta(tmp_path, monkeypatch, capsys):
    """La tabla tambien la lee el jurado; antes solo se miraban los parrafos."""
    monkeypatch.chdir(tmp_path)
    (tmp_path / "brief.json").write_text(json.dumps({"rally_type": "latam"}), encoding="utf-8")
    documento = docx.Document()
    for titulo, tope in (("PROBLEMA", 1250), ("SOLUCION", 1250), ("IMPACTO", 1000),
                         ("INNOVACION", 1000), ("PREFACTIBILIDAD", 1500)):
        documento.add_heading(f"{titulo} (Limite: {tope} caracteres)", level=1)
        documento.add_paragraph(
            "Texto de relleno sin marcadores internos que describe la seccion con "
            "suficiente detalle para superar el minimo de la rubrica y llegar al "
            "chequeo de pendientes del documento.")
    tabla = documento.add_table(rows=1, cols=1)
    tabla.rows[0].cells[0].text = "[PENDIENTE] Falta el costo de implementacion"
    _guardar(tmp_path, documento)
    with pytest.raises(SystemExit) as salida:
        vp.main()
    assert salida.value.code == 1
    assert "[PENDIENTE]" in capsys.readouterr().out


def test_un_docx_ilegible_da_un_mensaje_y_no_un_traceback(tmp_path, monkeypatch, capsys):
    monkeypatch.chdir(tmp_path)
    (tmp_path / "brief.json").write_text(json.dumps({"rally_type": "latam"}), encoding="utf-8")
    (tmp_path / "docs").mkdir()
    (tmp_path / "docs" / "pautado_draft.docx").write_bytes(b"esto no es un docx")
    with pytest.raises(SystemExit) as salida:
        vp.main()
    assert salida.value.code == 1
    assert "no se puede abrir como Word" in capsys.readouterr().out
