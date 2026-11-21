"""Fase 7, item 400: los 8 entregables de AGENTS.md, medidos uno por uno.

La tabla del checklist SIRLI tenia 8 lineas y el verificador de etapa cubria menos:
`budget.xlsx`, `narration.mp4`, `video_url` y `site_url` no aparecian por ningun lado.
"""
import pathlib
import sys

RAIZ = pathlib.Path(__file__).resolve().parent.parent
if str(RAIZ / "scripts") not in sys.path:
    sys.path.insert(0, str(RAIZ / "scripts"))

import verificar_fases  # noqa: E402


def _raiz_falsa(tmp_path: pathlib.Path) -> pathlib.Path:
    for rel in ("docs", "budget", "script", "assets/voice"):
        (tmp_path / rel).mkdir(parents=True, exist_ok=True)
    return tmp_path


def test_son_exactamente_ocho():
    assert len(verificar_fases.ENTREGABLES_AGENTS) == 8
    assert len(verificar_fases.checklist_entrega({})) == 8


def test_nombres_cubren_la_tabla_de_agents():
    nombres = [i["nombre"] for i in verificar_fases.checklist_entrega({})]
    assert nombres == [
        "brief.json validado",
        "docs/pautado_draft.docx",
        "budget/budget.xlsx",
        "docs/canvas.md",
        "script/script.md",
        "assets/voice/narration.mp4",
        "video_url en YouTube",
        "site_url publicada",
    ]


def test_carpeta_vacia_no_aprueba_ningun_archivo(tmp_path):
    raiz = _raiz_falsa(tmp_path)
    items = {i["nombre"]: i["existe"] for i in verificar_fases.checklist_entrega({}, raiz)}
    assert not any(items.values())


def test_cada_entregable_se_mide_por_su_archivo(tmp_path):
    raiz = _raiz_falsa(tmp_path)
    (raiz / "docs" / "pautado_draft.docx").write_bytes(b"PK")
    items = {i["nombre"]: i["existe"] for i in verificar_fases.checklist_entrega({}, raiz)}
    assert items["docs/pautado_draft.docx"] is True
    assert items["budget/budget.xlsx"] is False
    assert items["assets/voice/narration.mp4"] is False


def test_el_brief_cuenta_solo_con_certamen_y_horas(tmp_path):
    raiz = _raiz_falsa(tmp_path)
    vacio = {i["nombre"]: i["existe"] for i in verificar_fases.checklist_entrega({}, raiz)}
    assert vacio["brief.json validado"] is False

    lleno = {i["nombre"]: i["existe"] for i in verificar_fases.checklist_entrega(
        {"rally_type": "latam", "hours_total": 28}, raiz)}
    assert lleno["brief.json validado"] is True


def test_video_y_site_se_leen_del_brief(tmp_path):
    raiz = _raiz_falsa(tmp_path)
    brief = {
        "video_url": "https://youtu.be/x",
        "site_url": "   ",
    }
    items = {i["nombre"]: i["existe"] for i in verificar_fases.checklist_entrega(brief, raiz)}
    assert items["video_url en YouTube"] is True
    assert items["site_url publicada"] is False
