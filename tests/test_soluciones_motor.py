import json

import pytest

from scripts.soluciones_motor import (
    cargar_retos,
    clasificar,
    generar_soluciones,
    importar_desde_brain,
    main,
    recursos_de,
    rubrica_para,
)


RETO_AGUA = {
    "id": "01",
    "title": "Redes de sensores comunitarios para alerta temprana de inundaciones",
    "description": "Monitoreo hiperlocal con telemetria y sensores de nivel en cauces urbanos.",
    "ods_ids": ["ODS 11", "ODS 13"],
    "category_fit": "tecnologica",
    "hardware_feasible_24h": True,
}

CASO_AGUA = {
    "id": "techriders_2024",
    "temas": ["agua", "micropresas", "sensores", "telemetria", "sequia", "riego"],
    "year": 2024,
    "rally": "latam",
    "categoria": "innovacion",
    "equipo": "Techriders",
    "proyecto": "Micropresas telemetradas",
    "puesto": "1er lugar internacional Innovación",
    "problema": "Sequias y escorrentias en laderas sin monitoreo.",
    "causa_raiz": "Captacion dispersa sin datos en tiempo real.",
    "insight": "La micropresa necesita telemetria para operar sola.",
    "solucion": "Micropresa con valvulas automatizadas y sensores LoRaWAN.",
    "metrica": "4 hectareas irrigadas con 4,500 USD de lote piloto.",
    "fuente": "knowledge/winners_analysis.md",
    "video_url": "https://www.youtube.com/watch?v=MIvlD31HfIk",
}


def test_cargar_retos_falla_si_banco_vacio(tmp_path):
    path = tmp_path / "challenges.json"
    path.write_text("[]", encoding="utf-8")
    with pytest.raises(SystemExit):
        cargar_retos(path)


def test_cargar_retos_no_inventa_si_falta_archivo(tmp_path):
    with pytest.raises(SystemExit):
        cargar_retos(tmp_path / "no-existe.json")


def test_main_no_usa_historial_como_retos_activos():
    assert main(["--todos", "--certamen", "latam"]) == 2


def test_categoria_nacional_social():
    reto = {"title": "Inclusion de personas con discapacidad", "description": "Comunidad vulnerable"}
    assert clasificar(reto, "nacional")[0] == "social"


def test_categoria_nacional_procesos():
    reto = {"title": "Trazabilidad de la cadena de cafe", "description": "Gestion postcosecha"}
    assert clasificar(reto, "nacional")[0] == "procesos"


def test_categoria_latam_impacto_social():
    reto = {"title": "Agua segura para comunidades rurales", "description": "Inclusion y salud"}
    assert clasificar(reto, "latam")[0] == "impacto_social"


def test_categoria_forzada_invalida_falla():
    with pytest.raises(ValueError):
        clasificar(RETO_AGUA, "latam", "procesos")


def test_rutas_citan_precedente_cuando_hay_caso():
    salida = generar_soluciones(RETO_AGUA, "nacional", "tecnologica", [CASO_AGUA])
    assert salida["categoria"] == "tecnologica"
    assert salida["soluciones"]
    for ruta in salida["soluciones"]:
        assert ruta["etiqueta"] == "precedente"
        assert ruta["precedentes"]
        assert ruta["precedentes"][0]["year"] == 2024
        assert ruta["precedentes"][0]["equipo"] == "Techriders"


def test_sin_coincidencia_marca_exploratoria():
    reto = {"id": "99", "title": "Tema sin corpus", "description": "Asunto desconocido"}
    salida = generar_soluciones(reto, "nacional", "tecnologica", [CASO_AGUA])
    ruta = salida["soluciones"][0]
    assert ruta["etiqueta"] == "exploratoria"
    assert ruta["precedentes"] == []


def test_impacto_solo_con_fuente():
    salida = generar_soluciones(RETO_AGUA, "nacional", "tecnologica", [CASO_AGUA])
    for ruta in salida["soluciones"]:
        for dato in ruta["impacto"]:
            assert dato["fuente"]


def test_impacto_vacio_si_no_hay_metrica():
    caso = dict(CASO_AGUA, metrica="No documentado en la fuente")
    salida = generar_soluciones(RETO_AGUA, "nacional", "tecnologica", [caso])
    for ruta in salida["soluciones"]:
        assert ruta["impacto"] == []


def test_salida_sin_estadisticas_internas():
    salida = generar_soluciones(RETO_AGUA, "nacional", "tecnologica", [CASO_AGUA])
    texto = json.dumps(salida, ensure_ascii=False).lower()
    for prohibida in ("saturacion", "saturación", "probabilidad", "win rate", "score"):
        assert prohibida not in texto


MARCA = "MARCA-VISIBLE-2024"
INTERNAS = ("saturacion", "saturación", "score", "probabilidad", "win rate", "victoria")


def _solucion(nombre: str) -> dict:
    que_es = (
        f"{nombre} lleva el agua del pozo comunal a la puerta de la casa sin que nadie "
        "cargue el balde. Un filtro de sedimentos, una bomba manual de doble accion y un "
        "tanque de quinientos litros se instalan en dos puntos del barrio. El comite de "
        "agua mide el caudal cada semana y anota los dias sin servicio. La cooperativa "
        "cobra una cuota de mantenimiento que cubre el cambio de empaques y la revision "
        "de la valvula. El piloto se prueba en dos casas antes de crecer al resto del "
        f"barrio y cada instalacion queda con su acta firmada. {MARCA}."
    )
    return {
        "nombre": f"{nombre} {MARCA}",
        "claim": "Agua en el patio, no en la espalda.",
        "que_es": que_es,
        "como": ["Se mide la distancia al pozo", "Se instala el sistema en dos puntos",
                 "El comite mide el caudal cada semana", "Se firma el acta de prueba"],
        "beneficiario": "Cuarenta familias del barrio Los Encuentros",
        "componentes": ["Bomba manual", "Tanque de 500 litros", "Base de concreto"],
        "costo": "C$ 24 300",
        "metricas": ["Viajes de acarreo por semana", "Dias sin servicio al mes"],
    }


def _reto_dossier() -> dict:
    return {
        "id": "01",
        "titulo": f"Agua acarreada 900 metros en Somoto {MARCA}",
        "categoria": "tecnologica",
        "categoria_porque": "El enunciado apunta a bienes fisicos (3 senales).",
        "descripcion": "Cuarenta familias acarrean agua desde un pozo comunal.",
        "realidad": {"a": "El pozo funciona y la distancia es el problema.",
                     "b": "El comite ya existe y cobra cuota de mantenimiento."},
        "detalles": [("Distancia", "900 metros medidos"),
                     ("Sequia", "Tres meses al ano"),
                     ("Prueba", "Dos casas con acta firmada")],
        "senal": "Los equipos que ganan prueban el piloto antes de escalar.",
        "insignias": [("Premio", "Primer lugar nacional 2024"),
                      ("Marco", "ODS 6")],
        "ods": [("ODS 6", "Agua limpia y saneamiento", "Reduce el acarreo diario")],
        "analogias": [{"year": 2024, "equipo": "TechRiders", "proyecto": "Micropresas · Agua",
                       "puesto": "1er lugar", "que_hicieron": "Instalaron dos pilotos medidos",
                       "por_que": "Mismo problema de acarreo", "video": ""}],
        "cadena": {"problema": "Acarreo de agua", "causa_raiz": "No hay tuberia",
                   "insight": "El pozo sobra, falta el tramo",
                   "solucion": "Sistema en dos puntos", "metrica": "Viajes por semana"},
        "pitch": f"Sesenta segundos para contar el piloto. {MARCA}",
        "propuesta": _solucion("Agua Cerca"),
        "alterna": _solucion("Tramo Corto"),
    }


def _texto_docx(ruta) -> str:
    from docx import Document

    doc = Document(str(ruta))
    partes = [p.text for p in doc.paragraphs]
    for tabla in doc.tables:
        for fila in tabla.rows:
            partes.extend(c.text for c in fila.cells)
    return "\n".join(partes)


def _texto_xlsx(ruta) -> str:
    from openpyxl import load_workbook

    wb = load_workbook(str(ruta))
    partes = []
    for hoja in wb.worksheets:
        for fila in hoja.iter_rows(values_only=True):
            partes.extend(str(c) for c in fila if c is not None)
    return "\n".join(partes)


def _texto_pdf(ruta) -> str:
    pypdf = pytest.importorskip("pypdf")
    lector = pypdf.PdfReader(str(ruta))
    return "\n".join(pagina.extract_text() or "" for pagina in lector.pages)


def _sin_internas(texto: str) -> list[str]:
    plano = texto.lower()
    return [p for p in INTERNAS if p in plano]


def test_el_dossier_generado_no_lleva_estadisticas_internas(tmp_path):
    """La regla no es del JSON del motor: es del PDF, el Word y el Excel que salen."""
    from scripts import gen_dossier

    datos = tmp_path / "soluciones.json"
    datos.write_text(json.dumps({"meta": {"titulo": f"Dossier {MARCA}",
                                          "subtitulo": "Soluciones para los retos",
                                          "certamen": "Nacional", "equipo": "Loma Alta",
                                          "fecha": "2026-11-20"},
                                 "retos": [_reto_dossier()]}, ensure_ascii=False),
                     encoding="utf-8")
    pdf = tmp_path / "d.pdf"
    docx = tmp_path / "d.docx"
    xlsx = tmp_path / "d.xlsx"
    assert gen_dossier.main(["--json", str(datos), "--pdf", str(pdf),
                             "--docx", str(docx), "--xlsx", str(xlsx)]) == 0

    textos = {"docx": _texto_docx(docx), "xlsx": _texto_xlsx(xlsx)}
    if gen_dossier.CHROME.exists():
        textos["pdf"] = _texto_pdf(pdf)
    assert "pdf" in textos or not gen_dossier.CHROME.exists()

    for formato, texto in textos.items():
        # Primero se comprueba que la lectura es real: si el extractor devolviera
        # vacio, el chequeo de abajo pasaria sin haber medido nada.
        assert MARCA in texto, f"{formato}: no se pudo leer el contenido generado"
        assert _sin_internas(texto) == [], f"{formato}: {_sin_internas(texto)}"


def test_el_medidor_detecta_la_estadistica_si_estuviera(tmp_path):
    """Prueba al revés: si la cifra interna llegara al documento, se veria."""
    from scripts import gen_dossier

    reto = _reto_dossier()
    reto["senal"] = "Probabilidad de victoria 0.87 segun el score interno."
    datos = tmp_path / "s.json"
    datos.write_text(json.dumps({"meta": {"titulo": "D", "subtitulo": "x", "certamen": "N",
                                          "equipo": "E", "fecha": "2026"},
                                 "retos": [reto]}, ensure_ascii=False), encoding="utf-8")
    docx = tmp_path / "d.docx"
    assert gen_dossier.main(["--json", str(datos), "--docx", str(docx)]) == 0
    texto = _texto_docx(docx)
    assert MARCA in texto
    assert set(_sin_internas(texto)) >= {"probabilidad", "score", "victoria"}


def test_recursos_detecta_componentes():
    nombres = recursos_de("Sensores LoRaWAN, panel solar y valvula automatizada")
    assert "Módulo LoRaWAN" in nombres
    assert "Panel solar" in nombres
    assert "Válvula" in nombres


def test_rubrica_social_prioriza_impacto():
    criterios = rubrica_para("nacional", "social")
    assert "Impacto" in criterios[0]["criterio"]


def test_rubrica_latam_innovacion_prioriza_innovacion():
    criterios = rubrica_para("latam", "innovacion")
    assert "Innovación" in criterios[0]["criterio"]


def test_importar_desde_brain_lee_registros_reales():
    retos = importar_desde_brain()
    assert len(retos) >= 5
    primero = retos[0]
    assert primero["id"] == "DESAFIO_01"
    assert primero["title"]
    assert primero["category_fit"] in ("social", "tecnologica", "procesos")
    assert primero["ods_ids"]
    assert isinstance(primero["hardware_feasible_24h"], bool)


def test_importar_desde_brain_falla_si_falta(tmp_path):
    with pytest.raises(SystemExit):
        importar_desde_brain(tmp_path / "no-existe.md")

