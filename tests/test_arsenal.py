import pathlib
import struct
import sys
import wave

import pytest

RAIZ = pathlib.Path(__file__).resolve().parent.parent
if str(RAIZ) not in sys.path:
    sys.path.insert(0, str(RAIZ))

from checks import campo_chars, coherencia, duracion  # noqa: E402


@pytest.mark.parametrize("token,esperado", [
    ("1,250", "1250"),
    ("1.250", "1250"),
    ("1250", "1250"),
    ("64", "64"),
    ("4,850.00", "4850"),
    ("12,5", "12.5"),
])
def test_normaliza_miles_y_decimales(token, esperado):
    assert coherencia._canonico(coherencia._normalizar_token(token)) == esperado


def test_coherencia_detecta_porcentajes_distintos():
    a = coherencia.desde_texto("Cubre el 64% de la demanda.")
    b = coherencia.desde_texto("Cubre el 46% de la demanda.")
    hallazgos = coherencia.comparar({"guion": a, "pautado": b})
    numeros = {h["numero"] for h in hallazgos}
    assert {"64", "46"} <= numeros
    assert all(h["gravedad"] == "importante" for h in hallazgos)


def test_coherencia_ignora_limites_y_marcas_de_tiempo():
    texto = "Max. 1,250 caracteres\n[0:00 - 0:20] Hola\nAhorra 300 litros."
    numeros = coherencia.desde_texto(texto)
    assert "300" in numeros
    assert "1250" not in numeros
    assert "0" not in numeros and "20" not in numeros


def test_topes_de_pautado_coinciden_en_todo_el_sistema():
    """Un solo juego de topes: validador, servicio y dashboard.

    El fallo real fue que prefactibilidad vivía con 1,000 en el validador y en
    la hoja imprimible mientras la maqueta oficial fija 1,500 (y el impacto
    quedó intercambiado con ella).
    """
    import re

    esperado = {
        "problema": 1250,
        "solucion": 1250,
        "impacto": 1000,
        "innovacion": 1000,
        "prefactibilidad": 1500,
    }
    assert campo_chars.LIMITS == esperado

    servicio = (RAIZ / "scripts" / "rally_service.py").read_text(encoding="utf-8")
    inicio = servicio.index("PAUTADO_SECTIONS = {")
    latam = servicio[inicio:servicio.index('"nacional"', inicio)]
    for clave, tope in esperado.items():
        assert re.search(
            r'"%s":\s*\{"label":[^}]*?"limit":\s*%d,' % (clave, tope), latam, re.S
        ), (clave, tope)

    app = (RAIZ / "dashboard" / "app.js").read_text(encoding="utf-8")
    inicio = app.index("const PAUTADO_LIMITS")
    bloque = app[inicio:app.index("}", inicio)]
    for clave, tope in esperado.items():
        assert re.search(r"^\s*%s:\s*%d" % (clave, tope), bloque, re.M), (clave, tope)

    # La hoja imprimible no puede volver a escribir el tope a mano.
    assert "/ 1,000 caracteres" not in app
    assert "/ 1,250 caracteres" not in app


def test_coherencia_pasa_si_las_cifras_coinciden():
    a = coherencia.desde_texto("Ahorra 1,250 litros y cubre 64%.")
    b = coherencia.desde_texto("Ahorra 1250 litros y cubre 64 %.")
    assert coherencia.comparar({"guion": a, "pautado": b}) == []


def test_coherencia_ignora_codigos_ods_id_de_reto_y_segundos_de_acto():
    guion = coherencia.desde_texto("Acto 1 (20s) ODS 11 y ODS 13, reto DESAFIO_02.")
    pautado = coherencia.desde_texto("Alineado al ODS 11.")
    assert coherencia.comparar({"guion": guion, "pautado": pautado}) == []


def test_coherencia_ignora_cifras_con_fuente_en_claims(monkeypatch):
    monkeypatch.setattr(
        coherencia,
        "_cifras_de_claims",
        lambda ruta=None: set(coherencia.desde_texto("560 desastres al año")),
    )
    a = coherencia.desde_texto("Cada año ocurren 560 desastres.")
    b = coherencia.desde_texto("El alerta temprana cuesta menos.")
    assert coherencia.comparar({"guion": a, "pautado": b}) == []


def test_coherencia_ignora_cifras_de_la_partida_del_presupuesto(monkeypatch):
    monkeypatch.setattr(coherencia, "_cifras_de_claims", lambda ruta=None: set())
    monkeypatch.setattr(
        coherencia,
        "_cifras_de_presupuesto",
        lambda ruta=None: set(coherencia.desde_texto("2210 25")),
    )
    a = coherencia.desde_texto("Costo total 2,210 USD y 25 puntos de medicion.")
    b = coherencia.desde_texto("Cubre 56 viviendas.")
    hallazgos = coherencia.comparar({"pautado": a, "guion": b})
    assert not [h for h in hallazgos if h["numero"] in ("2210", "25")]


def _docx_con_marcadores(ruta: pathlib.Path, impacto_chars: int = 10):
    import docx

    doc = docx.Document()
    doc.add_paragraph("{SEC_PROBLEMA}Texto corto{SEC_END}")
    doc.add_paragraph("{SEC_IMPACTO}" + ("x" * impacto_chars) + "{SEC_END}")
    doc.save(str(ruta))


def test_campo_cuenta_y_detecta_exceso(tmp_path):
    ruta = tmp_path / "pautado.docx"
    _docx_con_marcadores(ruta, impacto_chars=1600)
    hallazgos, conteos = campo_chars.revisar(ruta, tmp_path / "sin_plantilla.docx")
    assert conteos["problema"] == len("Texto corto")
    assert any(h["campo"] == "impacto" and h["gravedad"] == "critico" for h in hallazgos)


def test_campo_respeta_limite(tmp_path):
    ruta = tmp_path / "pautado.docx"
    _docx_con_marcadores(ruta, impacto_chars=100)
    hallazgos, _ = campo_chars.revisar(ruta, tmp_path / "sin_plantilla.docx")
    assert not [h for h in hallazgos if h["gravedad"] == "critico"]


def test_limites_desde_plantilla(tmp_path):
    import docx

    ruta = tmp_path / "plantilla.docx"
    doc = docx.Document()
    doc.add_paragraph("Problema (max. 1,100 caracteres)")
    doc.add_paragraph("Impacto (max. 1,400 caracteres)")
    doc.save(str(ruta))
    limites = campo_chars.limites_desde_plantilla(ruta)
    assert limites == {"problema": 1100, "impacto": 1400}


def test_nacional_no_aplica_topes_de_latam(tmp_path):
    """El Rally Nacional no fija tope: un texto largo no puede salir excedido."""
    assert campo_chars.limites_para("nacional") == {}
    assert campo_chars.limites_para("latam") == campo_chars.LIMITS

    ruta = tmp_path / "nacional.docx"
    _docx_con_marcadores(ruta, impacto_chars=4000)
    hallazgos, conteos = campo_chars.revisar(ruta, tmp_path / "sin_plantilla.docx", "nacional")
    assert not [h for h in hallazgos if h["gravedad"] == "critico"]
    assert conteos["impacto"] >= 4000

    latam, _ = campo_chars.revisar(ruta, tmp_path / "sin_plantilla.docx", "latam")
    assert [h for h in latam if h["gravedad"] == "critico"]


def _wav(ruta: pathlib.Path, segundos: float):
    with wave.open(str(ruta), "w") as f:
        f.setnchannels(1)
        f.setsampwidth(2)
        f.setframerate(16000)
        for i in range(int(16000 * segundos)):
            f.writeframes(struct.pack("<h", int(2000 * (i % 80 < 40))))


def test_duracion_mide_un_segundo(tmp_path):
    if not duracion.find_ffmpeg():
        pytest.skip("sin ffmpeg")
    ruta = tmp_path / "tono.wav"
    _wav(ruta, 1.0)
    segundos, _, _ = duracion.medir(ruta)
    assert segundos is not None
    assert 0.8 <= segundos <= 1.3


def test_duracion_rechaza_exceso(tmp_path, monkeypatch):
    monkeypatch.setattr(duracion, "medir", lambda ruta: (121.5, True, "test"))
    hallazgos = duracion.revisar(tmp_path / "video.mp4")
    assert hallazgos[0]["gravedad"] == "critico"
    assert "121.5" in hallazgos[0]["que"]


def test_arsenal_check_todo_sin_artefactos_devuelve_1():
    import arsenal

    codigo = arsenal.main(["check-duracion", "no_existe.mp4"])
    assert codigo == 1
