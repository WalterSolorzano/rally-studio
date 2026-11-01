import json
from pathlib import Path


def test_brief_is_blank_template():
    brief = json.loads(Path("brief.json").read_text(encoding="utf-8"))
    for campo in ("project_name", "team_name", "university", "city", "challenge_id"):
        assert brief[campo] == ""


def test_no_demo_project_identity():
    for p in [Path("brief.json"), Path("README.md"), Path("docs/DESCARGA.md")]:
        texto = p.read_text(encoding="utf-8")
        assert "hidro-vigia" not in texto
        assert "mentes-pinoleras" not in texto


def test_personal_artifacts_absent():
    for ruta in ("budget/screenshots", "dashboard/assets_uploads"):
        assert not Path(ruta).exists()


def test_corpus_still_present():
    for ruta in ("research/claims.json", "knowledge/rubric_latam.md",
                 "knowledge/INDICE.md", "AGENTS.md", "docs/INSTALACION_AGENTE.md"):
        assert Path(ruta).exists()


def test_artefactos_son_plantillas_vacias():
    assert json.loads(Path("research/claims.json").read_text(encoding="utf-8")) == []
    assert json.loads(Path("budget/budget.json").read_text(encoding="utf-8")) == []


def test_no_demo_content_in_artefactos():
    """El paquete base no puede traer el proyecto demo en ningun entregable."""
    prohibidos = (
        "HIDRO-VIGIA", "AquaNica", "Nandú", "Nandu", "Mentes Pinoleras",
        "María López", "Carlos Méndez", "Ana Ruiz",
        "Sistema modular de captación", "LoRaWAN",
    )
    rutas = (
        "research/claims.json", "budget/budget.json",
        "script/script.md", "script/narration.txt", "script/shotlist.csv",
        "site/index.html", "docs/canvas.md", "docs/bibliography.md",
        "dashboard/data/stats.generated.js", "dashboard/data/stats.generated.json",
    )
    for ruta in rutas:
        p = Path(ruta)
        if not p.exists():
            continue
        texto = p.read_text(encoding="utf-8", errors="replace")
        for palabra in prohibidos:
            assert palabra not in texto, f"{ruta} contiene residuo demo: {palabra}"
