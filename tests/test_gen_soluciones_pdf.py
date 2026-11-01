import json
from pathlib import Path

import pytest

from scripts.gen_soluciones_pdf import (
    assert_sin_estadisticas_internas,
    find_chrome,
    html_to_pdf,
    render_html,
    stats_winners,
)
from scripts.soluciones_motor import generar_soluciones


RETO = {
    "id": "01",
    "title": "Redes de sensores comunitarios para alerta temprana de inundaciones",
    "description": "Monitoreo hiperlocal con telemetria y sensores de nivel en cauces urbanos.",
    "ods_ids": ["ODS 11", "ODS 13"],
    "category_fit": "tecnologica",
}

CASO = {
    "id": "techriders_2024",
    "temas": ["agua", "sensores", "telemetria", "inundaciones", "alerta"],
    "year": 2024,
    "rally": "latam",
    "categoria": "innovacion",
    "equipo": "Techriders",
    "proyecto": "Micropresas telemetradas",
    "puesto": "1er lugar internacional Innovación",
    "problema": "Sequias y escorrentias sin monitoreo.",
    "causa_raiz": "Captacion dispersa sin datos en tiempo real.",
    "insight": "La micropresa necesita telemetria para operar sola.",
    "solucion": "Micropresa con valvulas automatizadas y sensores LoRaWAN.",
    "metrica": "4 hectareas irrigadas con 4,500 USD de lote piloto.",
    "fuente": "knowledge/winners_analysis.md",
    "video_url": "https://www.youtube.com/watch?v=MIvlD31HfIk",
}


def payload():
    bloque = generar_soluciones(RETO, "nacional", "tecnologica", [CASO])
    return {"certamen": "nacional", "equipo": "Equipo Prueba", "ciudad": "Managua", "retos": [bloque]}


def test_html_incluye_reto_y_precedente():
    doc = render_html(payload(), css="body{}", stats={})
    assert "Redes de sensores comunitarios" in doc
    assert "Techriders" in doc
    assert "Micropresas telemetradas" in doc


def test_html_sin_estadisticas_internas():
    doc = render_html(payload(), css="body{}", stats={})
    for prohibida in ("saturación", "saturacion", "probabilidad", "win rate", "score"):
        assert prohibida not in doc.lower()


def test_html_marca_impacto_pendiente_si_no_hay_cifra():
    bloque = generar_soluciones(
        RETO, "nacional", "tecnologica",
        [dict(CASO, metrica="No documentado en la fuente")],
    )
    doc = render_html({"certamen": "nacional", "retos": [bloque]}, css="", stats={})
    assert "Por validar con el equipo" in doc


def test_validador_rechaza_estadisticas_internas():
    with pytest.raises(ValueError):
        assert_sin_estadisticas_internas("el score interno es 82")
    with pytest.raises(ValueError):
        assert_sin_estadisticas_internas("probabilidad de victoria")
    assert_sin_estadisticas_internas("impacto verificado con fuente")


def test_stats_winners_lee_indice_real():
    stats = stats_winners()
    assert stats["total"] > 1000
    assert stats["year_min"] >= 2017
    assert stats["retos"] > 10


def test_pdf_se_genera_si_hay_navegador(tmp_path):
    try:
        find_chrome()
    except SystemExit:
        pytest.skip("Sin Chrome/Edge en este entorno")
    doc = render_html(payload(), css="body{font-family:sans-serif}", stats={})
    html_path = tmp_path / "d.html"
    html_path.write_text(doc, encoding="utf-8")
    pdf = html_to_pdf(html_path, tmp_path / "d.pdf")
    assert pdf.exists()
    assert pdf.stat().st_size > 10_000
