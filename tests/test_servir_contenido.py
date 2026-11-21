import sys
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(RAIZ / "scripts"))

from content_store import revisar_contenido  # noqa: E402


def test_texto_con_slop_es_rechazado():
    errores = revisar_contenido(
        "pautado", "problema",
        {"text": "Es importante destacar que el sistema es robusto."},
    )
    assert errores and "slop" in errores[0].lower()


def test_texto_que_excede_el_tope_es_rechazado():
    errores = revisar_contenido("pautado", "impacto", {"text": "a" * 1001})
    assert any("1000" in e for e in errores)


def test_nacional_no_fija_topes():
    assert revisar_contenido(
        "pautado", "impacto", {"text": "a" * 1001}, evento="nacional"
    ) == []


def test_presupuesto_sin_url_es_rechazado():
    errores = revisar_contenido("budget", "costos", {"items": [
        {"element": "Tanque", "units": 1, "unit_cost": 300},
    ]})
    assert any("url" in e.lower() for e in errores)


def test_texto_limpio_pasa():
    assert revisar_contenido(
        "pautado", "problema", {"text": "El agua llega dos horas al día."}
    ) == []


def test_payload_sin_texto_es_rechazado():
    assert revisar_contenido("pautado", "problema", {"value": 3}) == ["falta texto"]
