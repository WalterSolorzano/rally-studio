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
    chequear_opcion,
    cargar_solutions,
    main,
    normalizar_reto,
)

# JSON vivos del pipeline de dossier que deben estar en UTF-8 limpio.
RAIZ = Path(__file__).resolve().parents[1]
ARCHIVOS_PIPELINE = [
    "dossier_latam_2026/_skill_run/research/challenges.json",
    "dossier_latam_2026/_skill_run/dossier_content.json",
    "dossier_latam_2026/_skill_run/fichas_merged.json",
    "dossier_latam_2026/_skill_run/fichas2.json",
    "dossier_latam_2026/_skill_run/fichas.json",
]
# UTF-8 doble-codificado: bytes UTF-8 decodificados como latin-1 (Ã© → é).
MOJIBAKE_RX = re.compile("[\u00c3\u00c2][\x80-\xff]")

def test_pipeline_json_sin_mojibake():
    """Los JSON vivos del pipeline no contienen UTF-8 doble-codificado."""
    sucios = []
    for rel in ARCHIVOS_PIPELINE:
        ruta = RAIZ / rel
        assert ruta.exists(), f"falta {rel}"
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
