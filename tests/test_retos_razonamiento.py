"""Validación del banco de casos de razonamiento (knowledge/retos_razonamiento.json)."""

import json
import unicodedata
from pathlib import Path

import pytest

REPO_ROOT = Path(__file__).resolve().parents[1]
DATA_PATH = REPO_ROOT / "knowledge" / "retos_razonamiento.json"

RALLY_CATEGORIAS = {
    "nacional": {"tecnologica", "social", "procesos"},
    "latam": {"innovacion", "impacto_social"},
}

CAMPOS_OBLIGATORIOS = (
    "id",
    "year",
    "rally",
    "categoria",
    "equipo",
    "proyecto",
    "puesto",
    "problema",
    "causa_raiz",
    "insight",
    "solucion",
    "metrica",
    "fuente",
)


@pytest.fixture(scope="module")
def data():
    assert DATA_PATH.exists(), f"No existe {DATA_PATH}"
    return json.loads(DATA_PATH.read_text(encoding="utf-8"))


@pytest.fixture(scope="module")
def casos(data):
    assert isinstance(data, dict), "La raíz del JSON debe ser un objeto"
    assert "casos" in data and isinstance(data["casos"], list), "Falta la lista 'casos'"
    return data["casos"]


def test_version_presente(data):
    assert data.get("version") == 1


def test_cantidad_minima(casos):
    assert len(casos) >= 15, f"Se esperaban al menos 15 casos, hay {len(casos)}"
    assert len(casos) <= 20, f"Se esperaban como máximo 20 casos, hay {len(casos)}"


def test_ids_unicos(casos):
    ids = [c.get("id") for c in casos]
    assert all(ids), "Hay casos sin id"
    duplicados = {i for i in ids if ids.count(i) > 1}
    assert not duplicados, f"IDs duplicados: {sorted(duplicados)}"


def test_campos_obligatorios_no_vacios(casos):
    for caso in casos:
        for campo in CAMPOS_OBLIGATORIOS:
            assert campo in caso, f"{caso.get('id')}: falta el campo '{campo}'"
            valor = caso[campo]
            if isinstance(valor, str):
                assert valor.strip(), f"{caso.get('id')}: campo '{campo}' vacío"
            else:
                assert valor is not None, f"{caso.get('id')}: campo '{campo}' nulo"


def test_temas_no_vacio(casos):
    for caso in casos:
        temas = caso.get("temas")
        assert isinstance(temas, list), f"{caso.get('id')}: 'temas' debe ser lista"
        assert temas, f"{caso.get('id')}: 'temas' vacío"
        assert 4 <= len(temas) <= 8, f"{caso.get('id')}: se esperaban 4-8 temas"
        for tema in temas:
            assert isinstance(tema, str) and tema.strip(), f"{caso.get('id')}: tema inválido"
            assert tema == tema.lower(), f"{caso.get('id')}: tema no está en minúsculas: {tema}"
            normalizado = unicodedata.normalize("NFKD", tema)
            sin_tildes = "".join(ch for ch in normalizado if not unicodedata.combining(ch))
            assert tema == sin_tildes, f"{caso.get('id')}: tema con tilde: {tema}"


def test_rally_y_categoria_validos(casos):
    for caso in casos:
        rally = caso.get("rally")
        categoria = caso.get("categoria")
        assert rally in RALLY_CATEGORIAS, f"{caso.get('id')}: rally inválido '{rally}'"
        assert categoria in RALLY_CATEGORIAS[rally], (
            f"{caso.get('id')}: categoria '{categoria}' no válida para rally '{rally}'"
        )


def test_year_en_rango(casos):
    # 2019-2026 es el núcleo pedido; se admiten los precursores icónicos
    # Geckakz (2016) y BottleLife (2017) incluidos por requisito explícito.
    for caso in casos:
        year = caso.get("year")
        assert isinstance(year, int), f"{caso.get('id')}: year debe ser entero"
        assert 2016 <= year <= 2026, f"{caso.get('id')}: year fuera de rango ({year})"


def test_fuente_existe_en_disco(casos):
    for caso in casos:
        fuente = caso.get("fuente", "")
        assert isinstance(fuente, str) and fuente.strip(), f"{caso.get('id')}: fuente vacía"
        ruta = (REPO_ROOT / fuente.replace("\\", "/")).resolve()
        assert ruta.exists() and ruta.is_file(), f"{caso.get('id')}: fuente inexistente '{fuente}'"


def test_video_url_formato(casos):
    for caso in casos:
        url = caso.get("video_url")
        assert isinstance(url, str), f"{caso.get('id')}: 'video_url' debe ser cadena"
        if url:
            assert url.startswith("https://"), f"{caso.get('id')}: video_url inválida '{url}'"


def test_cobertura_certamenes_y_categorias(casos):
    combinaciones = {(c["rally"], c["categoria"]) for c in casos}
    esperadas = {
        ("nacional", "tecnologica"),
        ("nacional", "social"),
        ("nacional", "procesos"),
        ("latam", "innovacion"),
        ("latam", "impacto_social"),
    }
    faltantes = esperadas - combinaciones
    assert not faltantes, f"Faltan combinaciones rally/categoría: {sorted(faltantes)}"
