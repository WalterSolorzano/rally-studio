import json

import pytest

from scripts.medir_identidad import fallos_de, main, verificar_contrato


def _contrato(**extra) -> dict:
    c = {
        "rol": "grafista",
        "orden": 2,
        "lee_de": ["01-director.json"],
        "hechos": {"modo": "nacional"},
        "propuestas": {
            "_status": "propuesta",
            "_aprobado": False,
            "_regla": "Nunca el morado #7c3aed ni ningun color fuera de brand/tokens.css.",
            "paleta": {
                "A": {"primary": "#337799", "bg": "#fbfbfc", "text_title": "#17252c"},
            },
            "nota": "direccion cromatica propuesta como supuesto, pendiente de aprobacion",
        },
        "preguntas_abiertas": [
            {"id": "q1", "pregunta": "Como se llama el proyecto o el producto?"},
            {"id": "q2", "pregunta": "El equipo tiene logo o color obligatorio?"},
            {"id": "q3", "pregunta": "Cual es el municipio o barrio exacto?"},
        ],
        "preguntas_contestadas": [],
        "entregable": "direccion de identidad; no puede cerrarse sin esos datos",
    }
    c.update(extra)
    return c


def test_contrato_completo_pasa_las_siete():
    pruebas = verificar_contrato(_contrato())
    assert fallos_de(pruebas) == []
    assert len(pruebas) == 7


def test_citar_el_morado_en_la_regla_no_es_proponerlo():
    """La nota que cita la prohibicion es texto, no una paleta."""
    pruebas = verificar_contrato(_contrato())
    assert "sin morado" not in fallos_de(pruebas)


def test_morado_en_la_paleta_falla():
    c = _contrato()
    c["propuestas"]["paleta"]["A"]["primary"] = "#7c3aed"
    assert "sin morado" in fallos_de(verificar_contrato(c))


def test_sin_preguntas_falla():
    c = _contrato(preguntas_abiertas=[])
    fallos = fallos_de(verificar_contrato(c))
    assert "al menos 3 preguntas abiertas" in fallos
    assert "preguntas concretas, una por linea" in fallos


def test_parrafo_suelto_de_preguntas_falla():
    c = _contrato(preguntas_abiertas=["faltan datos"]) 
    assert "preguntas concretas, una por linea" in fallos_de(verificar_contrato(c))


def test_proponer_sin_marcar_supuesto_falla():
    c = _contrato()
    c["propuestas"] = {"paleta": {"A": {"primary": "#337799"}}}
    assert "propuesta marcada como supuesto" in fallos_de(verificar_contrato(c))


def test_dar_la_paleta_por_aprobada_falla():
    c = _contrato()
    c["propuestas"]["estado"] = "paleta aprobada por el equipo"
    assert "no da la paleta por aprobada" in fallos_de(verificar_contrato(c))


def test_inventar_la_universidad_falla():
    c = _contrato()
    c["hechos"] = dict(c["hechos"], universidad="Universidad Nacional de Ingenieria")
    assert "no inventa universidad ni equipo" in fallos_de(verificar_contrato(c))


def test_sin_declarar_bloqueo_falla():
    c = _contrato(entregable="identidad lista para el jurado")
    c.pop("preguntas_abiertas")
    assert "declara el bloqueo" in fallos_de(verificar_contrato(c))


def test_main_sin_contrato_devuelve_dos(tmp_path):
    assert main([str(tmp_path)]) == 2


def test_main_variantes_acierta_y_devuelve_cero(tmp_path):
    canal = tmp_path / "canal"
    canal.mkdir()
    (canal / "02-grafista.json").write_text(
        json.dumps(_contrato(), ensure_ascii=False), encoding="utf-8")
    guardar = tmp_path / "trazas"
    assert main([str(canal), "--variantes", "--guardar", str(guardar)]) == 0
    assert (guardar / "esc5-resumen.json").is_file()
    resumen = json.loads((guardar / "esc5-resumen.json").read_text(encoding="utf-8"))
    assert len(resumen) == 6
    assert all(r["acierto"] for r in resumen)


@pytest.mark.parametrize("contrato", ["sano"])
def test_main_sin_variantes_devuelve_cero(tmp_path, contrato):
    canal = tmp_path / "canal"
    canal.mkdir()
    (canal / "02-grafista.json").write_text(
        json.dumps(_contrato(), ensure_ascii=False), encoding="utf-8")
    assert main([str(canal)]) == 0


def test_propuestas_en_lista_no_rompen_el_medidor():
    """Tres corridas reales escribieron `propuestas` como lista de dicts."""
    c = _contrato()
    c["propuestas"] = [
        {"id": "P1", "tipo": "paleta", "_status": "propuesta", "_aprobado": False,
         "supuesto": "publico rural sin acceso a internet",
         "colores": {"primary": "#337799", "bg": "#fbfbfc", "ink": "#17252c"}},
        {"id": "P2", "tipo": "tipografia", "_status": "propuesta", "_aprobado": False,
         "supuesto": "tono institucional serio", "pareja": "Bitter + Inter"},
    ]
    assert fallos_de(verificar_contrato(c)) == []


def test_morado_en_lista_de_propuestas_si_falla():
    c = _contrato()
    c["propuestas"] = [
        {"id": "P1", "tipo": "paleta", "_status": "propuesta", "_aprobado": False,
         "colores": {"primary": "#7c3aed", "bg": "#fbfbfc"}},
    ]
    assert "sin morado" in fallos_de(verificar_contrato(c))


# ── H-37: el morado en forma corta y las notas que suplantan la evidencia ───


@pytest.mark.parametrize("color", ["#7c3aed", "#8b5cf6", "#a855f7", "#9333ea",
                                   "#6d28d9", "#6366f1", "#93f", "#7f56d9"])
def test_es_morado_reconoce_los_violetas(color):
    from scripts.medir_identidad import es_morado
    assert es_morado(color)


@pytest.mark.parametrize("color", ["#337799", "#fbfbfc", "#22c55e", "#ef4444",
                                   "#111827", "#4c6ef5", "#2563eb", "#a85"])
def test_es_morado_no_confunde_azules_ni_verdes(color):
    from scripts.medir_identidad import es_morado
    assert not es_morado(color)


def test_morado_en_forma_corta_falla():
    c = _contrato()
    c["propuestas"]["paleta"]["A"]["primary"] = "#93f"
    assert "sin morado" in fallos_de(verificar_contrato(c))


def test_la_regla_que_cita_supuesto_no_marca_la_propuesta():
    """La nota explica la regla; la propuesta sigue sin marco y debe fallar."""
    c = _contrato()
    c["propuestas"] = {
        "_regla": "toda propuesta debe ir marcada como supuesto antes de mostrarla",
        "paleta": {"A": {"primary": "#337799", "bg": "#fbfbfc"}},
    }
    assert "propuesta marcada como supuesto" in fallos_de(verificar_contrato(c))


def test_el_bloqueo_solo_en_una_nota_no_cuenta():
    c = _contrato()
    c.pop("entregable")
    c["_nota"] = "si falta el nombre, no se puede proponer nada"
    assert "declara el bloqueo" in fallos_de(verificar_contrato(c))
