# -*- coding: utf-8 -*-
"""Compuerta anti-genérico: calibración con casos sintéticos.

Casos tomados de GOAL_INSTALACION.md del paquete proponer-retos-pulido:
1. Caso PASS: opción con encaje literal, métrica con unidad y pagador con cargo.
2. Caso RECHAZADA: reacondicionamiento como núcleo (FORBIDDEN 1.4b).
3. Caso RECHAZADA: término del enunciado cambiado (domésticos → industriales).
4. Motor: la ruta sin campos de ficha pasa por normalizar y cae con MOTOR_SCHEMA.
"""

import json
import re
from pathlib import Path

from scripts.check_anti_generico import (
    chequear_gemelas,
    chequear_opcion,
    chequear_slop_ia,
    cargar_solutions,
    main,
    normalizar_reto,
)

# JSON vivos del pipeline de dossier que deben estar en UTF-8 limpio.
RAIZ = Path(__file__).resolve().parents[1]
# JSON del pipeline de dossier que existan en disco (la carpeta es opcional).
PATRON_PIPELINE = "dossier*/_skill_run/**/*.json"
# UTF-8 doble-codificado: bytes UTF-8 decodificados como latin-1 (Ã© → é).
MOJIBAKE_RX = re.compile("[\u00c3\u00c2][\x80-\xff]")

def test_pipeline_json_sin_mojibake():
    """Los JSON del pipeline, si hay carpeta de dossier, no traen UTF-8 doble-codificado."""
    sucios = []
    for ruta in sorted(RAIZ.glob(PATRON_PIPELINE)):
        rel = ruta.relative_to(RAIZ).as_posix()
        texto = ruta.read_text(encoding="utf-8")
        m = MOJIBAKE_RX.search(texto)
        if m:
            i = m.start()
            ctx = texto[max(0, i - 25):i + 25]
            sucios.append("%s: %r ...%r..." % (rel, m.group(0), ctx))
    assert not sucios, "mojibake en pipeline:\n" + "\n".join(sucios)


ENUNCIADO_PASS = (
    "Los mercados generan residuos organicos que van al botadero."
)

OPCION_PASS = {
    "id": "01",
    "titulo": "Bandejas separadoras con biodigestor de mercado",
    "que_es": (
        "Bandejas separadoras en cada puesto del mercado que recolectan residuos "
        "organicos antes del botadero; el biodigestor del mercado los convierte en biol."
    ),
    "como_funciona": [
        "Cada puesto recibe una bandeja de residuos organicos.",
        "La cooperativa del mercado vacia las bandejas cada dia.",
        "El biodigestor del mercado recibe los residuos y produce biol.",
        "El biol se entrega a los puestos de hortaliza del mismo mercado.",
    ],
    "pagador": "Alcaldia · Aseo Urbano · Director · bandejas",
    "metrica": "8.4 toneladas/semana de residuos organicos · fuente: claims.json",
    "ya_existe": "Botadero municipal · diferencia: el residuo deja de ir al botadero",
    "precedente": "—",
    "costo": "USD 1.200 = bandejas 400 + biodigestor 800 · fuente: cotizacion 2026-10",
    "por_validar": "El biodigestor aguanta la humedad del mercado + prueba barata: 1 semana, 2 bandejas",
    "pitch": "Bandejas que convierten los residuos del mercado en biol para sus puestos.",
}


def test_caso_pass():
    r = chequear_opcion("TEST_01", ENUNCIADO_PASS, OPCION_PASS)
    assert r.estado == "PASS", r.motivos


def test_reacondicionamiento_rechazado():
    opcion = {
        "id": "01",
        "titulo": "Reacondicionar motores",
        "que_es": "Reacondicionar motores danados con testeo y cambio de pieza para revender.",
        "metrica": "50 motores/mes · fuente: por validar",
        "pagador": "Taller · venta · Gerente · motor",
        "costo": "—",
    }
    r = chequear_opcion(
        "TEST_02",
        "Talleres reciben motores domesticos danados que terminan como chatarra.",
        opcion,
    )
    assert r.estado == "RECHAZADA"
    assert any("1.4b_reacondicionamiento" in m for m in r.motivos), r.motivos


def test_termino_enunciado_cambiado():
    opcion = {
        "id": "01",
        "titulo": "Banco de prueba para motores industriales",
        "que_es": (
            "Banco de prueba con corrida para motores industriales danados que entrega "
            "veredicto y ruta de uso en el mismo turno."
        ),
        "metrica": "40 motores/mes · fuente: por validar",
        "pagador": "Escuela tecnica · programa de empleo · Director · banco de prueba",
        "costo": "USD 300 = tablones 100 + multímetro 120 + poste 80",
    }
    r = chequear_opcion(
        "TEST_03",
        "Los talleres reciben motores domesticos danados que terminan como chatarra.",
        opcion,
    )
    assert r.estado == "RECHAZADA"
    assert any("TERMINO_ENUNCIADO" in m for m in r.motivos), r.motivos


def test_ruta_del_motor_incompleta_rechazada():
    opcion = {
        "id": "ruta-1",
        "titulo": "Riego de motor recuperado",
        "concepto": "Bomba de riego con motor domestico recuperado para el huerto del barrio.",
        "cadena_razonamiento": {
            "problema": "Motores funcionales terminan como chatarra.",
            "causa_raiz": "El dueño no puede probar si sirve.",
            "insight": "No hay punto comunitario de chequeo.",
            "solucion": "Chequeo de 5 minutos y segundo uso visible.",
            "metrica": "10 motores con segundo uso operando en 60 dias.",
            "fuente": "retos_razonamiento.json",
        },
        "pitch": "Motores que vuelven al uso.",
    }
    rid, enunciado, opciones = normalizar_reto(
        {
            "reto": {
                "id": "DESAFIO_01",
                "title": "Segunda vida de los motores electricos domesticos",
                "description": "Sector: electrodomesticos en desuso.",
            },
            "soluciones": [opcion],
        }
    )
    assert rid == "DESAFIO_01"
    assert "motores electricos" in enunciado
    r = chequear_opcion(rid, enunciado, opciones[0])
    assert r.estado == "RECHAZADA"
    assert any("MOTOR_SCHEMA" in m for m in r.motivos), r.motivos


def test_main_exit_codes_y_reportes(tmp_path):
    bueno = {
        "reto_id": "TEST_01",
        "reto_enunciado": ENUNCIADO_PASS,
        "opciones": [OPCION_PASS],
    }
    malo = {
        "reto_id": "TEST_02",
        "reto_enunciado": "Talleres reciben motores domesticos danados que terminan como chatarra.",
        "opciones": [
            {
                "id": "01",
                "titulo": "Reacondicionar motores",
                "que_es": "Reacondicionar motores danados con testeo y cambio de pieza para revender.",
                "metrica": "50 motores/mes · fuente: por validar",
            }
        ],
    }
    f_bueno = tmp_path / "bueno.json"
    f_malo = tmp_path / "malo.json"
    f_bueno.write_text(json.dumps(bueno), encoding="utf-8")
    f_malo.write_text(json.dumps(malo), encoding="utf-8")

    out_md = tmp_path / "compuerta.md"
    out_json = tmp_path / "compuerta.json"
    assert main(["--json", str(f_bueno), "--out-md", str(out_md), "--out-json", str(out_json)]) == 0
    assert "PASS" in out_md.read_text(encoding="utf-8")
    assert json.loads(out_json.read_text(encoding="utf-8"))

    assert main(["--json", str(f_malo)]) == 1


def test_cargar_solutions_acepta_formato_motor(tmp_path):
    data = {
        "certamen": "latam",
        "retos": [
            {
                "reto": {"id": "DESAFIO_01", "title": "T", "description": "D"},
                "soluciones": [{"id": "ruta-1", "titulo": "X"}],
            }
        ],
    }
    f = tmp_path / "motor.json"
    f.write_text(json.dumps(data), encoding="utf-8")
    retos = cargar_solutions(f)
    assert len(retos) == 1
    rid, enunciado, opciones = normalizar_reto(retos[0])
    assert rid == "DESAFIO_01"
    assert enunciado == "T D"
    assert opciones[0]["id"] == "ruta-1"


# --- Reglas nuevas (corrección dossier 2026-01-05) ---

def _opcion_base(**kw):
    o = {
        "id": "01",
        "titulo": "Equipo de riego para la asociacion",
        "que_es": "Bomba de riego con motor electrico que la asociacion opera en la parcela todos los dias de riego.",
        "como_funciona": ["Paso uno.", "Paso dos.", "Paso tres.", "Paso cuatro."],
        "pagador": "Asociacion · partida de riego · Presidente · bomba",
        "metrica": "10 quintales/semana · fuente: por validar",
        "precedente": "—",
        "pitch": "Bomba que riega con motor rescatado.",
    }
    o.update(kw)
    return o


def test_que_es_largo_rechazado():
    largo = " ".join(["palabra"] * 160)
    r = chequear_opcion("T_LARGO", "motores domesticos en desuso", _opcion_base(que_es=largo))
    assert r.estado == "RECHAZADA", r.motivos
    assert any("QUE_ES_LARGO" in m for m in r.motivos), r.motivos


def test_mojibake_rechazado():
    r = chequear_opcion(
        "T_MOJI",
        "proteccion de polinizadores",
        _opcion_base(que_es="Refugio de polinizadores: ProtecciÃ³n de abejas en el municipio."),
    )
    assert r.estado == "RECHAZADA", r.motivos
    assert any("MOJIBAKE" in m for m in r.motivos), r.motivos


def test_celular_desuso_rechazado():
    r = chequear_opcion(
        "T_CEL",
        "sensores para agricultura",
        _opcion_base(que_es="Estacion que usa celulares en desuso como sensor de humedad del suelo."),
    )
    assert r.estado == "RECHAZADA", r.motivos
    assert any("1.4c" in m for m in r.motivos), r.motivos


def test_tetrapak_fuera_de_precedente_rechazado():
    r = chequear_opcion(
        "T_TP",
        "empaque de alimentos",
        _opcion_base(que_es="Empaque que sigue el metodo Tetra Pak 2025 para conservar alimentos en la comunidad."),
    )
    assert r.estado == "RECHAZADA", r.motivos
    assert any("NAME_DROPPING" in m for m in r.motivos), r.motivos


def test_tetrapak_en_precedente_no_name_dropping():
    r = chequear_opcion(
        "T_TP2",
        "empaque de alimentos",
        _opcion_base(precedente="Tetra Pak · 2025 · equipo X · empaque de alimentos"),
    )
    assert not any("NAME_DROPPING" in m for m in r.motivos), r.motivos


def test_opciones_gemelas_rechazadas():
    a = _opcion_base(id="01", que_es="Tablero de prioridades que ordena las tareas del rescate en la comunidad.")
    b = _opcion_base(id="02", que_es="Tablero de prioridades que ordena las tareas del rescate en la comunidad.")
    motivos = chequear_gemelas([a, b])
    assert motivos, "opciones gemelas deben rechazarse"


# --- SLOP_IA: huellas de texto escrito por IA (lista del humano, 2026-11-20) ---

SLOP_TEXTO_IA = (
    "En el mundo cada vez más competitivo, es importante destacar que nuestra plataforma "
    "juega un papel fundamental: no es solo una app, es un ecosistema integral y robusto. "
    "Además, cabe destacar que profundizamos en la sinergia del paradigma. En conclusión, "
    "es fundamental aprovechar el potencial del reino digital. Juega un papel crucial. "
    "Claro, aquí tienes!"
)

TEXTO_HUMANO = (
    "El piloto cuesta C$ 24 300 y atiende 40 familias en Somoto. "
    "La bomba se arma en el taller de la cooperativa con repuestos del mercado local. "
    "Medimos litros por hora durante tres días: el pozo se seca tres meses al año."
)


def test_slop_ia_marca_texto_generado():
    cats = {c for c, _m, _d in chequear_slop_ia(SLOP_TEXTO_IA)}
    for esperada in (
        "2.1_adjetivo_relleno",
        "2.2_sustantivo_gastado",
        "2.3_verbo_corporativo",
        "2.4_conector_hueco",
        "2.7_muletilla",
        "2.8_negacion_contraste",
        "2.8b_cierre_ceremonioso",
    ):
        assert esperada in cats, f"falta {esperada} en {cats}"


def test_slop_ia_no_marca_texto_humano():
    assert chequear_slop_ia(TEXTO_HUMANO) == []


def test_slop_ia_llega_al_rechazo_de_opcion():
    r = chequear_opcion(
        "T_SLOP",
        "agua de consumo en el barrio",
        _opcion_base(que_es=SLOP_TEXTO_IA),
    )
    assert any("SLOP_IA" in m for m in r.motivos), r.motivos
    assert r.estado == "RECHAZADA", r.estado


def test_slop_ia_artefactos_de_chatbot():
    cats = {c for c, _m, _d in chequear_slop_ia(
        "Fuente: ejemplo.com/?utm_source=chatgpt.com y turn0search2 y 【1†fuente】"
    )}
    assert "2.11_artefacto_tecnico" in cats, cats


# --- H-39: compuerta que no audita no está en verde -------------------------


def test_gemelas_compara_todos_los_pares():
    """Con solo [0] contra [1], una tercera opción clonada de la primera pasaba."""
    idea = "Tablero de prioridades que ordena las tareas del rescate en la comunidad."
    opciones = [
        _opcion_base(id="01", que_es=idea),
        _opcion_base(id="02", que_es="Filtro de zeolita en el desague que adsorbe el aceite antes del rio."),
        _opcion_base(id="03", que_es=idea),
    ]
    motivos = chequear_gemelas(opciones)
    assert len(motivos) == 1, motivos
    assert "01 y 03" in motivos[0], motivos


def test_gemelas_tres_iguales_reportan_tres_pares():
    idea = "Tablero de prioridades que ordena las tareas del rescate en la comunidad."
    motivos = chequear_gemelas([_opcion_base(id=i, que_es=idea) for i in ("01", "02", "03")])
    assert len(motivos) == 3, motivos


def test_ficha_suelta_se_audita_en_vez_de_saltarse(tmp_path):
    ficha = _opcion_base(id="01", que_es="Reacondicionamiento de motores usados del taller.")
    ficha["reto_id"] = "DESAFIO_01"
    ruta = tmp_path / "ficha.json"
    ruta.write_text(json.dumps(ficha), encoding="utf-8")
    rid, _enunciado, opciones = normalizar_reto(cargar_solutions(ruta)[0])
    assert rid == "DESAFIO_01"
    assert len(opciones) == 1, "la ficha suelta debe entrar a la compuerta"


def test_lista_vacia_no_se_declara_en_verde(tmp_path, capsys):
    ruta = tmp_path / "vacio.json"
    ruta.write_text("[]", encoding="utf-8")
    assert main(["--json", str(ruta)]) == 2
    assert "no trae retos que auditar" in capsys.readouterr().err


def test_json_truncado_avisa_sin_traceback(tmp_path, capsys):
    ruta = tmp_path / "roto.json"
    ruta.write_text('{"reto_id": "DESAFIO_01", "opciones": [', encoding="utf-8")
    assert main(["--json", str(ruta)]) == 2
    assert "no se puede leer como JSON" in capsys.readouterr().err


def test_json_sin_opciones_auditables_no_se_declara_en_verde(tmp_path, capsys):
    ruta = tmp_path / "raro.json"
    ruta.write_text(json.dumps({"reto_id": "DESAFIO_01", "otra_cosa": 1}), encoding="utf-8")
    assert main(["--json", str(ruta)]) == 2
    assert "no trae opciones auditables" in capsys.readouterr().err
