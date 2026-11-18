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


def test_teleprompter_de_muestra_no_trae_guion_ajeno():
    """La copia suelta del teleprompter es una muestra: el guion lo escribe el equipo.

    Se vigila porque un arreglo anterior quedo sin efecto y nada lo notó: el
    archivo seguia con el guion de cafe completo.
    """
    texto = Path("dashboard/entregables/teleprompter.html").read_text(encoding="utf-8")
    inicio = texto.index("const DATA = ") + len("const DATA = ")
    profundidad = 0
    fin = inicio
    for i, ch in enumerate(texto[inicio:], start=inicio):
        profundidad += (ch == "{") - (ch == "}")
        if profundidad == 0:
            fin = i + 1
            break
    datos = json.loads(texto[inicio:fin])
    assert datos["demo"] is True
    assert datos["total_palabras"] == 0
    for acto, cuerpo in datos["textos"].items():
        assert not cuerpo.strip(), f"el acto {acto} trae guion demo"
    volcado = json.dumps(datos, ensure_ascii=False)
    for prohibido in ("Marta", "Jinotega", "Alibaba", "cosechas"):
        assert prohibido not in volcado, f"teleprompter de muestra con residuo: {prohibido}"


def test_generadores_no_fijan_municipio_ni_marca_de_ejemplo():
    """Los generadores leen ciudad y nombre de brief.json; jamas los proponen."""
    import re

    cadena = re.compile(r'"[^"\n]*"|\'[^\'\n]*\'')
    marca = re.compile(r"\b[A-ZÁÉÍÓÚÑ]{3,}-[A-ZÁÉÍÓÚÑ]{2,}\b")
    municipio = re.compile(
        r"\b(?:Managua|Waslala|Matagalpa|Jinotega|Estelí|Granada|Masaya|León|Bluefields)\b"
    )
    # Unico archivo exento: cita precedentes reales de ganadores (UNI-RUPAP,
    # UNAN-FAREM, TECHRIDERS), que son conocimiento del certamen, no proyecto.
    exento = {"gen_report_figures.py"}
    hallazgos = []
    for ruta in sorted(Path("scripts").glob("gen_*.py")):
        if ruta.name in exento:
            continue
        for m in cadena.finditer(ruta.read_text(encoding="utf-8", errors="replace")):
            hallazgos += [(ruta.name, x) for x in marca.findall(m.group(0)) + municipio.findall(m.group(0))]
    assert hallazgos == [], f"ejemplo fijado en el codigo: {hallazgos}"


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
        "dashboard/app_video.js",
    )
    for ruta in rutas:
        p = Path(ruta)
        if not p.exists():
            continue
        texto = p.read_text(encoding="utf-8", errors="replace")
        for palabra in prohibidos:
            assert palabra not in texto, f"{ruta} contiene residuo demo: {palabra}"
