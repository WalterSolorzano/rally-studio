# -*- coding: utf-8 -*-
"""El generador del dossier pulido: maqueta, no contenido."""
import json
import shutil
from pathlib import Path

import pytest

from scripts import gen_dossier


def reto() -> dict:
    solucion = {
        "nombre": "Solucion de prueba",
        "claim": "Una frase que dice que hace.",
        "que_es": (
            "Que es: un equipo de riego con motor electrico rescatado que la asociacion "
            "de productores instala en su parcela. El motor de la lavadora vieja gira la "
            "bomba de impulsion y lleva agua desde el canal hasta los surcos sin pagar "
            "bombero ni renta diaria. La presidenta de la asociacion enciende el "
            "interruptor cada manana y el caudal sale por la manguera durante las horas "
            "de calor. En lugar de alquilar una bomba por hora, la asociacion riega con "
            "un activo propio que reparan ellos mismos con piezas del mercado. Por eso no "
            "es el servicio de riego que hoy se renta: el equipo es suyo, funciona sin "
            "operador externo y el costo por quintal baja."
        ),
        "como": ["Paso uno.", "Paso dos.", "Paso tres.", "Paso cuatro."],
        "beneficiario": "Cuarenta familias del barrio.",
        "componentes": ["Componente uno", "Componente dos"],
        "costo": "USD 200 por unidad.",
        "metricas": ["Quintales por semana", "Costo por quintal", "Familias atendidas"],
    }
    return {
        "id": "01",
        "titulo": "Reto de prueba",
        "categoria": "Impacto Social",
        "categoria_porque": "porque atiende a familias de bajos ingresos",
        "descripcion": "Descripcion del reto entregado por el comite.",
        "propuesta": dict(solucion, nombre="Opcion uno"),
        "alterna": dict(solucion, nombre="Opcion dos"),
        "realidad": {"a": "La opera una cooperativa.", "b": "La opera una junta vecinal."},
        "detalles": [["Economia circular", "Se usa entero."], ["Empleo local", "Dos puestos."],
                     ["Datos abiertos", "Se publica el peso."]],
        "insignias": [["Premio Latinoamerica Verde", "categoria residuos"],
                      ["Fondo nacional de innovacion", "piloto replicable"]],
        "ods": [["ODS 12", "Produccion y consumo responsables", "Alarga la vida util."],
                ["ODS 8", "Trabajo decente y crecimiento economico", "Pago por servicio."],
                ["ODS 7", "Energia asequible y no contaminante", "Aprovecha lo instalado."]],
        "cadena": {"problema": "Se tira lo que sirve.", "causa_raiz": "Nadie mide lo que queda.",
                   "insight": "El objeto vale por su funcion.", "solucion": "Medir y adaptar.",
                   "metrica": "Unidades recuperadas por mes."},
        "senal": "Los ganadores miden antes de invertir.",
        "analogias": [{"year": 2026, "equipo": "Equipo A", "proyecto": "Proyecto A",
                       "puesto": "1er lugar", "que_hicieron": "Midieron antes de invertir.",
                       "por_que": "Mismo mecanismo.",
                       "video": "https://www.youtube.com/watch?v=abc"},
                      {"year": 2024, "equipo": "Equipo B", "proyecto": "Proyecto B",
                       "puesto": "2do lugar", "que_hicieron": "Adaptaron en el sitio.",
                       "por_que": "Misma logica.", "video": ""}],
        "pitch": "Una frase de cierre para el video.",
    }


@pytest.fixture()
def datos(tmp_path: Path) -> Path:
    ruta = tmp_path / "soluciones.json"
    ruta.write_text(json.dumps({"meta": {"titulo": "Dossier de prueba"}, "retos": [reto()]},
                               ensure_ascii=False), encoding="utf-8")
    return ruta


def test_html_lleva_dos_opciones_y_nada_prohibido(datos: Path, tmp_path: Path):
    destino = tmp_path / "dossier.pdf"
    assert gen_dossier.main(["--json", str(datos), "--pdf", str(destino), "--html-only"]) == 0

    html = destino.with_suffix(".html").read_text(encoding="utf-8")
    assert html.count("Opcion uno") >= 1 and html.count("Opcion dos") >= 1
    assert "En la practica".lower() or "En la pr" in html
    for prohibida in ("saturacion", "probabilidad", "win rate", "winrate", "score"):
        assert prohibida not in html.lower()
    assert "No documentado" not in html
    assert "jurado" not in html.lower()


def test_ods_como_imagen_oficial(datos: Path, tmp_path: Path):
    destino = tmp_path / "dossier.pdf"
    gen_dossier.main(["--json", str(datos), "--pdf", str(destino), "--html-only"])
    html = destino.with_suffix(".html").read_text(encoding="utf-8")

    assert html.count('class="ods-logo"') == 3
    assert "fuentes/ods/ods12.jpg" in html
    assert "file:///" in html  # rutas absolutas para Chrome headless


def test_generador_no_trae_contenido(datos: Path):
    """El contenido vive en el JSON: el script no lleva retos adentro."""
    fuente = Path(gen_dossier.__file__).read_text(encoding="utf-8")

    for palabra in ("MotorListo", "Molino Vecinal", "Abono de Mercado", "Retencion"):
        assert palabra not in fuente


def test_insignias_con_color_por_tipo(datos: Path, tmp_path: Path):
    """Las insignias llevan clase según tipo: premio, fondo, marco."""
    destino = tmp_path / "dossier.pdf"
    gen_dossier.main(["--json", str(datos), "--pdf", str(destino), "--html-only"])
    html = destino.with_suffix(".html").read_text(encoding="utf-8")
    assert "insignia--premio" in html
    assert "insignia--fondo" in html
    css = Path("docs/assets/dossier.css").read_text(encoding="utf-8")
    for clase in ("insignia--premio", "insignia--fondo", "insignia--marco"):
        assert clase in css, f"CSS sin {clase}"


def test_que_es_rango_palabras_rechaza_corto(tmp_path: Path):
    """que_es fuera de 80-150 palabras hace fallar la carga."""
    data = {"meta": {"titulo": "X"}, "retos": [reto()]}
    data["retos"][0]["propuesta"]["que_es"] = "Que es corto."
    ruta = tmp_path / "corto.json"
    ruta.write_text(json.dumps(data, ensure_ascii=False), encoding="utf-8")
    with pytest.raises(ValueError, match="80"):
        gen_dossier.cargar(ruta)


def test_que_es_rango_palabras_rechaza_largo(tmp_path: Path):
    data = {"meta": {"titulo": "X"}, "retos": [reto()]}
    data["retos"][0]["alterna"]["que_es"] = " ".join(["palabra"] * 160)
    ruta = tmp_path / "largo.json"
    ruta.write_text(json.dumps(data, ensure_ascii=False), encoding="utf-8")
    with pytest.raises(ValueError, match="150"):
        gen_dossier.cargar(ruta)


@pytest.mark.skipif(shutil.which("chrome") is None and not gen_dossier.CHROME.exists(),
                    reason="sin Chrome no se puede comprobar el PDF")
def test_pdf_tres_paginas_por_reto(datos: Path, tmp_path: Path):
    fitz = pytest.importorskip("fitz")
    destino = tmp_path / "dossier.pdf"
    assert gen_dossier.main(["--json", str(datos), "--pdf", str(destino)]) == 0

    documento = fitz.open(str(destino))
    assert documento.page_count == 3
    texto = "".join(p.get_text() for p in documento)
    assert texto.lower().count("en la pr") >= 2
    assert sum(len(p.get_images()) for p in documento) == 3
