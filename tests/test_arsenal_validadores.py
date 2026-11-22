"""Fase 7, item 410: arsenal.py check-todo no envia a SIRLI con un validador en rojo.

La regla 11 de AGENTS.md pide los tres validadores antes del envio, pero check-todo
solo corria duracion, coherencia y caracteres: `validate_brief.py`,
`validate_budget.py` y `validate_pautado.py` no se ejecutaban en ninguna parte.
"""
import pathlib
import sys

RAIZ = pathlib.Path(__file__).resolve().parent.parent
if str(RAIZ) not in sys.path:
    sys.path.insert(0, str(RAIZ))

import arsenal  # noqa: E402


def _validador(carpeta: pathlib.Path, nombre: str, codigo: int, mensaje: str = ""):
    (carpeta / nombre).write_text(
        "import sys\n"
        f"print({mensaje!r})\n"
        f"sys.exit({codigo})\n",
        encoding="utf-8",
    )


def test_los_tres_validadores_en_verde_pasan(tmp_path):
    for nombre in arsenal.VALIDADORES_SIRLI:
        _validador(tmp_path, nombre, 0, "todo bien")
    resultados = arsenal.ejecutar_validadores(tmp_path)
    assert [r["codigo"] for r in resultados] == [0, 0, 0]
    assert all(r["detalle"] == "todo bien" for r in resultados)


def test_un_validador_en_rojo_detiene_el_envio(tmp_path, capsys):
    _validador(tmp_path, "validate_brief.py", 0, "brief ok")
    _validador(tmp_path, "validate_budget.py", 3, "ERROR: partida sin URL")
    _validador(tmp_path, "validate_pautado.py", 0, "pautado ok")

    codigo = arsenal.main(["check-validadores", "--scripts", str(tmp_path)])
    salida = capsys.readouterr().out

    assert codigo == 1
    assert "ERROR: partida sin URL" in salida
    assert "validate_budget.py" in salida and "REVISAR" in salida


def test_validadores_en_verde_dan_codigo_cero(tmp_path, capsys):
    for nombre in arsenal.VALIDADORES_SIRLI:
        _validador(tmp_path, nombre, 0, "ok")
    assert arsenal.main(["check-validadores", "--scripts", str(tmp_path)]) == 0


def test_un_validador_ausente_cuenta_como_fallo(tmp_path):
    resultados = arsenal.ejecutar_validadores(tmp_path)
    assert [r["codigo"] for r in resultados] == [127, 127, 127]
    assert all(r["detalle"] == "no existe" for r in resultados)


def test_check_todo_incluye_los_validadores_y_se_detiene(monkeypatch, capsys):
    """Item 410: con los otros checks en verde, un validador rojo igual frena el envio."""
    monkeypatch.setattr(arsenal, "cmd_duracion", lambda args: 0)
    monkeypatch.setattr(arsenal, "cmd_coherencia", lambda args: 0)
    monkeypatch.setattr(arsenal, "cmd_campo", lambda args: 0)
    monkeypatch.setattr(arsenal, "ejecutar_validadores", lambda scripts=None, **k: [
        {"nombre": "validate_brief.py", "codigo": 1, "detalle": "falta project_name"},
    ])

    codigo = arsenal.main([
        "check-todo", "--docx", "x.docx", "--plantilla", "y.docx",
        "--guion", "g.md", "--narracion", "n.txt", "--pautado", "p.docx",
    ])
    salida = capsys.readouterr().out

    assert codigo == 1
    assert "Validadores antes de SIRLI" in salida
    assert "falta project_name" in salida
    assert "validadores" in salida
