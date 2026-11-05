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

