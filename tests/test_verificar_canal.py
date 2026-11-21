# -*- coding: utf-8 -*-
"""Auditor del canal entre roles: un caso roto por cada regla de 5.0.

1. Canal bien encadenado: sin fallos.
2. Rol 2 sin lee_de: falla.
3. lee_de apunta a un contrato inexistente: falla.
4. Pregunta abierta sin contestar: falla.
5. Misma cifra con otro valor y sin motivo: falla; con motivo en hechos: pasa.
6. Orden con salto: falla.
7. Canal vacío: falla.
"""

import json
from pathlib import Path

from scripts.verificar_canal import main, verificar


def _escribir(carpeta: Path, nombre: str, datos: dict) -> None:
    (carpeta / nombre).write_text(
        json.dumps(datos, ensure_ascii=False), encoding="utf-8"
    )


def test_contrato_con_bom_se_lee(tmp_path):
    """Un contrato guardado con BOM (Bloc de notas, PS 5) no puede tumbar la fase."""
    _canal_ok(tmp_path)
    ruta = tmp_path / "01-pautador.json"
    ruta.write_text(ruta.read_text(encoding="utf-8"), encoding="utf-8-sig")
    assert verificar(tmp_path) == []


def _canal_ok(carpeta: Path) -> None:
    _escribir(carpeta, "brief.json", {
        "rally_type": "latam",
        "hours_total": 28,
    })
    _escribir(carpeta, "01-pautador.json", {
        "rol": "pautador",
        "orden": 1,
        "lee_de": [],
        "hechos": {
            "modo": "latam",
            "cooperativa": "COOPAGUA Somoto",
            "costo_piloto": "C$ 24 300",
        },
        "preguntas_abiertas": ["¿Cuánto paga cada familia por la instalación?"],
        "preguntas_contestadas": [],
        "entregable": "pautado.problema",
    })
    _escribir(carpeta, "02-presupuestador.json", {
        "rol": "presupuestador",
        "orden": 2,
        "lee_de": ["01-pautador.json"],
        "hechos": {
            "modo": "latam",
            "cooperativa": "COOPAGUA Somoto",
            "costo_piloto": "C$ 24 300",
        },
        "preguntas_abiertas": [],
        "preguntas_contestadas": [
            {"pregunta": "precio por familia", "respuesta": "[FALTA: dato]"}
        ],
        "entregable": "budget.costos",
    })


def test_canal_bien_encadenado_no_tiene_fallos(tmp_path):
    _canal_ok(tmp_path)
    assert verificar(tmp_path) == []


def test_rol_sin_lee_de_falla(tmp_path):
    _canal_ok(tmp_path)
    datos = json.loads((tmp_path / "02-presupuestador.json").read_text(encoding="utf-8"))
    datos["lee_de"] = []
    _escribir(tmp_path, "02-presupuestador.json", datos)
    fallos = verificar(tmp_path)
    assert any("sin lee_de" in f for f in fallos)


def test_lee_de_inexistente_falla(tmp_path):
    _canal_ok(tmp_path)
    datos = json.loads((tmp_path / "02-presupuestador.json").read_text(encoding="utf-8"))
    datos["lee_de"] = ["01-inventado.json"]
    _escribir(tmp_path, "02-presupuestador.json", datos)
    fallos = verificar(tmp_path)
    assert any("no existe" in f for f in fallos)


def test_pregunta_abierta_sin_contestar_falla(tmp_path):
    _canal_ok(tmp_path)
    datos = json.loads((tmp_path / "02-presupuestador.json").read_text(encoding="utf-8"))
    datos["preguntas_contestadas"] = []
    _escribir(tmp_path, "02-presupuestador.json", datos)
    fallos = verificar(tmp_path)
    assert any("no contesta la pregunta" in f for f in fallos)


def test_cifra_con_otro_valor_falla(tmp_path):
    _canal_ok(tmp_path)
    datos = json.loads((tmp_path / "02-presupuestador.json").read_text(encoding="utf-8"))
    datos["hechos"]["costo_piloto"] = "C$ 31 500"
    _escribir(tmp_path, "02-presupuestador.json", datos)
    fallos = verificar(tmp_path)
    assert any("cambia de" in f for f in fallos)


def test_cifra_con_otro_valor_y_motivo_pasa(tmp_path):
    _canal_ok(tmp_path)
    datos = json.loads((tmp_path / "02-presupuestador.json").read_text(encoding="utf-8"))
    datos["hechos"]["costo_piloto"] = "C$ 31 500"
    datos["hechos"]["motivo_costo_piloto"] = "Suma repuestos y transporte al piloto inicial."
    _escribir(tmp_path, "02-presupuestador.json", datos)
    assert verificar(tmp_path) == []


def test_salto_de_orden_falla(tmp_path):
    _canal_ok(tmp_path)
    (tmp_path / "02-presupuestador.json").rename(tmp_path / "03-presupuestador.json")
    fallos = verificar(tmp_path)
    assert any("orden roto" in f for f in fallos)


def test_canal_vacio_falla(tmp_path):
    fallos = verificar(tmp_path)
    assert fallos and "canal vacio" in fallos[0]


def test_main_devuelve_codigos(tmp_path):
    _canal_ok(tmp_path)
    assert main([str(tmp_path)]) == 0
    (tmp_path / "02-presupuestador.json").unlink()
    assert main([str(tmp_path / "01-pautador.json").replace("01-pautador.json", "")]) in (0, 1)
    assert main([]) == 2
    assert main([str(tmp_path / "no-existe")]) == 2


def _presupuesto(tmp_path, partidas=None, respuesta="[FALTA: dato]", hechos=None):
    _canal_ok(tmp_path)
    datos = json.loads((tmp_path / "02-presupuestador.json").read_text(encoding="utf-8"))
    datos["partidas"] = partidas or []
    datos["hechos"]["base_calculo"] = "unidad"
    datos["hechos"].update(hechos or {})
    datos["preguntas_contestadas"] = [
        {
            "pregunta": "¿Cuánto paga cada familia por la instalación?",
            "respuesta": "[FALTA: precio por familia y por instalación]",
        },
        {"pregunta": "¿Quién opera el sistema?", "respuesta": respuesta},
    ]
    _escribir(tmp_path, "02-presupuestador.json", datos)


def test_partida_cerrada_con_su_desglose_es_doble_conteo(tmp_path):
    _presupuesto(tmp_path, [
        {"elemento": "Sistema completo instalado y probado", "unidades": 2,
         "costo_unitario_nio": 12150},
        {"elemento": "Bomba manual de doble acción", "unidades": 2,
         "costo_unitario_nio": 4000},
    ])
    fallos = verificar(tmp_path)
    assert any("doble conteo" in f for f in fallos)


def test_doble_conteo_con_las_claves_del_presupuesto_real(tmp_path):
    """El presupuesto real usa `element` y `unit_cost`; con esas claves tambien debe verlo."""
    _presupuesto(tmp_path, [
        {"element": "Sistema completo instalado y probado", "units": 2,
         "unit_cost": 12150},
        {"element": "Bomba manual de doble accion", "units": 2, "unit_cost": 4000},
    ])
    fallos = verificar(tmp_path)
    assert any("doble conteo" in f for f in fallos)


def test_doble_conteo_con_la_clave_concept(tmp_path):
    """El puente del buzon escribe `concept` y `unit_cost`."""
    _presupuesto(tmp_path, [
        {"concept": "Sistema completo instalado y probado", "units": 2, "unit_cost": 12150},
        {"concept": "Tanque de 500 litros", "units": 2, "unit_cost": 4000},
    ])
    fallos = verificar(tmp_path)
    assert any("doble conteo" in f for f in fallos)


def test_desglose_sin_partida_cerrada_pasa(tmp_path):
    _presupuesto(tmp_path, [
        {"elemento": "Bomba manual de doble acción", "unidades": 2,
         "costo_unitario_nio": 8000},
        {"elemento": "Tanque de 500 litros", "unidades": 2,
         "costo_unitario_nio": 5900},
        {"elemento": "Base de concreto", "unidades": 2, "costo_unitario_nio": 1200},
    ])
    assert verificar(tmp_path) == []


def test_presupuesto_con_mayoria_en_cero_falla(tmp_path):
    _presupuesto(tmp_path, [
        {"elemento": "Sistema completo instalado y probado", "unidades": 2,
         "costo_unitario_nio": 12150},
        {"elemento": "Bomba manual", "unidades": 0, "costo_unitario_nio": 0},
        {"elemento": "Tanque", "unidades": 0, "costo_unitario_nio": 0},
    ])
    fallos = verificar(tmp_path)
    assert any("sin costo" in f for f in fallos)


def test_operar_sin_declarar_responsable_falla(tmp_path):
    _presupuesto(tmp_path, respuesta="Opera COOPAGUA Somoto; el contrato dice que arma la bomba.")
    fallos = verificar(tmp_path)
    assert any("hechos.operador" in f for f in fallos)


def test_operar_con_responsable_declarado_pasa(tmp_path):
    _presupuesto(tmp_path, respuesta="Opera COOPAGUA Somoto; el contrato dice que arma la bomba.")
    datos = json.loads((tmp_path / "02-presupuestador.json").read_text(encoding="utf-8"))
    datos["hechos"]["operador"] = "COOPAGUA Somoto"
    _escribir(tmp_path, "02-presupuestador.json", datos)
    assert verificar(tmp_path) == []


def test_el_guionista_hereda_el_operador_del_presupuesto(tmp_path):
    """Quien cita un hecho ya fijado en el canal no lo esta inventando."""
    _presupuesto(tmp_path, PRESUPUESTO_MINIMO,
                 respuesta="[FALTA: el cargo del responsable]",
                 hechos={"operador": "COOPAGUA Somoto administra el comite"})
    guion = {
        "rol": "guionista",
        "orden": 3,
        "lee_de": ["02-presupuestador.json"],
        "hechos": {"modo": "latam", "horas_total": 28},
        "preguntas_abiertas": [],
        "preguntas_contestadas": [],
        "entregable": "COOPAGUA Somoto administra el comite y eso ordena el acto tres",
    }
    _escribir(tmp_path, "03-guionista.json", guion)
    assert verificar(tmp_path) == []


def test_el_operador_en_falta_no_sirve_para_heredar(tmp_path):
    """Declararlo como [FALTA] es justo lo contrario de declararlo."""
    _presupuesto(tmp_path, PRESUPUESTO_MINIMO,
                 respuesta="[FALTA: el cargo del responsable]",
                 hechos={"operador": "[FALTA: nadie lo ha aceptado]"})
    guion = {
        "rol": "guionista",
        "orden": 3,
        "lee_de": ["02-presupuestador.json"],
        "hechos": {"modo": "latam", "horas_total": 28},
        "preguntas_abiertas": [],
        "preguntas_contestadas": [],
        "entregable": "COOPAGUA Somoto administra el comite y eso ordena el acto tres",
    }
    _escribir(tmp_path, "03-guionista.json", guion)
    fallos = verificar(tmp_path)
    assert any("hechos.operador" in f for f in fallos)


PRESUPUESTO_MINIMO = [
    {"elemento": "Bomba manual de doble acción", "unidades": 2, "costo_unitario_nio": 12800},
    {"elemento": "Tanque de 500 litros", "unidades": 2, "costo_unitario_nio": 8000},
    {"elemento": "Base de concreto", "unidades": 2, "costo_unitario_nio": 3500},
]


def test_sin_base_de_calculo_falla(tmp_path):
    _presupuesto(tmp_path, PRESUPUESTO_MINIMO, hechos={"base_calculo": None})
    fallos = verificar(tmp_path)
    assert any("base_calculo" in f for f in fallos)


def test_por_lote_sin_tamano_falla(tmp_path):
    _presupuesto(tmp_path, PRESUPUESTO_MINIMO, hechos={"base_calculo": "lote"})
    fallos = verificar(tmp_path)
    assert any("tamano_lote" in f for f in fallos)


def test_por_lote_con_tamano_pasa(tmp_path):
    _presupuesto(
        tmp_path,
        PRESUPUESTO_MINIMO,
        hechos={"base_calculo": "por lote", "tamano_lote": 10},
    )
    assert verificar(tmp_path) == []


def test_fila_con_otra_base_falla(tmp_path):
    partidas = [dict(p) for p in PRESUPUESTO_MINIMO]
    partidas[1]["base_calculo"] = "lote"
    _presupuesto(tmp_path, partidas)
    fallos = verificar(tmp_path)
    assert any("una sola base por tabla" in f for f in fallos)


def test_por_piloto_pasa(tmp_path):
    _presupuesto(tmp_path, PRESUPUESTO_MINIMO, hechos={"base_calculo": "piloto"})
    assert verificar(tmp_path) == []


def test_dos_roles_en_el_mismo_orden_falla(tmp_path):
    # Dos contratos con el numero 02: el ultimo que escribe borra al primero
    # y el canal queda como si ese rol nunca hubiera trabajado.
    _canal_ok(tmp_path)
    datos = json.loads((tmp_path / "02-presupuestador.json").read_text(encoding="utf-8"))
    datos["rol"] = "financiero"
    _escribir(tmp_path, "02-financiero.json", datos)
    fallos = verificar(tmp_path)
    assert any("orden 2 repetido" in f for f in fallos)


def _corte(tmp_path: Path, estado: str = "parcial") -> None:
    """Canal de dos contratos donde el segundo se corto a mitad de encargo."""
    _canal_ok(tmp_path)
    cortado = {
        "rol": "presupuestador",
        "orden": 2,
        "estado": estado,
        "lee_de": ["01-pautador.json"],
        "hechos": {
            "modo": "latam",
            "cooperativa": "COOPAGUA Somoto",
            "costo_piloto": "C$ 24 300",
        },
        "conservado": ["precio de la bomba: C$ 12 800"],
        "falta": ["precio del flete"],
        "preguntas_abiertas": [],
        "preguntas_contestadas": [
            {"pregunta": "precio por familia", "respuesta": "[FALTA: dato]"}
        ],
        "entregable": "budget.costos",
    }
    _escribir(tmp_path, "02-presupuestador.json", cortado)
    _escribir(tmp_path, "03-guionista.json", {
        "rol": "guionista",
        "orden": 3,
        "lee_de": ["01-pautador.json", "02-presupuestador.json"],
        "hechos": {
            "modo": "latam",
            "cooperativa": "COOPAGUA Somoto",
            "costo_piloto": "C$ 24 300",
            "recuperado_de": "02-presupuestador.json",
        },
        "preguntas_abiertas": [],
        "preguntas_contestadas": [
            {"pregunta": "precio por familia", "respuesta": "[FALTA: dato]"}
        ],
        "entregable": "script.acto1",
    })


def test_corte_declarado_y_reanudado_pasa(tmp_path):
    _corte(tmp_path)
    assert verificar(tmp_path) == []


def test_el_contrato_cortado_no_debe_contestar_lo_que_le_faltaba(tmp_path):
    """Un corte no se cobra al contrato cortado: se cobra al que reanuda."""
    _corte(tmp_path)
    datos = json.loads((tmp_path / "02-presupuestador.json").read_text(encoding="utf-8"))
    datos["preguntas_contestadas"] = []
    _escribir(tmp_path, "02-presupuestador.json", datos)
    assert verificar(tmp_path) == []


def test_reanudar_sin_contestar_la_pregunta_del_cortado_falla(tmp_path):
    _corte(tmp_path)
    datos = json.loads((tmp_path / "03-guionista.json").read_text(encoding="utf-8"))
    datos["preguntas_contestadas"] = []
    _escribir(tmp_path, "03-guionista.json", datos)
    fallos = verificar(tmp_path)
    assert any("no contesta la pregunta de 01-pautador.json" in f for f in fallos)


def test_reanudar_sin_recuperado_de_falla(tmp_path):
    _corte(tmp_path)
    datos = json.loads((tmp_path / "03-guionista.json").read_text(encoding="utf-8"))
    del datos["hechos"]["recuperado_de"]
    _escribir(tmp_path, "03-guionista.json", datos)
    fallos = verificar(tmp_path)
    assert any("recuperado_de" in f for f in fallos)


def test_corte_sin_declarar_lo_conservado_falla(tmp_path):
    _corte(tmp_path)
    datos = json.loads((tmp_path / "02-presupuestador.json").read_text(encoding="utf-8"))
    del datos["conservado"]
    _escribir(tmp_path, "02-presupuestador.json", datos)
    fallos = verificar(tmp_path)
    assert any("conservado" in f for f in fallos)


def test_corte_sin_declarar_lo_pendiente_falla(tmp_path):
    _corte(tmp_path)
    datos = json.loads((tmp_path / "02-presupuestador.json").read_text(encoding="utf-8"))
    datos["falta"] = []
    _escribir(tmp_path, "02-presupuestador.json", datos)
    fallos = verificar(tmp_path)
    assert any("falta" in f for f in fallos)


def test_contrato_sin_estado_se_lee_completo(tmp_path):
    _canal_ok(tmp_path)
    assert verificar(tmp_path) == []


def test_cifra_con_otro_formato_es_la_misma_cifra(tmp_path):
    # «C$ 24 300» y «C$ 24300» son el mismo numero: no es un cambio, es el mismo dato
    # escrito de otra forma. Sin esto, cada rol que reescribe la cifra rompe el canal.
    _canal_ok(tmp_path)
    datos = json.loads((tmp_path / "02-presupuestador.json").read_text(encoding="utf-8"))
    datos["hechos"]["costo_piloto"] = "C$ 24300"
    _escribir(tmp_path, "02-presupuestador.json", datos)
    assert verificar(tmp_path) == []


def test_marca_falta_no_es_afirmar_que_opera(tmp_path):
    # «[FALTA: responsable de operacion]» declara la falta; no afirma que alguien opera.
    _canal_ok(tmp_path)
    datos = json.loads((tmp_path / "02-presupuestador.json").read_text(encoding="utf-8"))
    datos["preguntas_contestadas"] = [
        {"pregunta": "precio por familia", "respuesta": "[FALTA: dato]"},
    ]
    datos["resumen"] = "[FALTA: quien opera y quien da mantenimiento]"
    _escribir(tmp_path, "02-presupuestador.json", datos)
    assert verificar(tmp_path) == []


# --- H-14: el modo del rally lo fija brief.json, no la memoria de un rol ---


def _sin_brief(tmp_path: Path) -> None:
    """Canal sin brief al lado: solo queda el modo declarado en los contratos."""
    (tmp_path / "brief.json").unlink()


def test_primer_contrato_sin_modo_falla(tmp_path):
    _canal_ok(tmp_path)
    datos = json.loads((tmp_path / "01-pautador.json").read_text(encoding="utf-8"))
    del datos["hechos"]["modo"]
    _escribir(tmp_path, "01-pautador.json", datos)
    fallos = verificar(tmp_path)
    assert any("primer contrato sin hechos.modo" in f for f in fallos)


def test_modo_que_contradice_el_brief_falla(tmp_path):
    # El caso real de H-14: brief.json dice latam 28 h y el director trabaja nacional 24 h.
    _canal_ok(tmp_path)
    datos = json.loads((tmp_path / "02-presupuestador.json").read_text(encoding="utf-8"))
    datos["hechos"]["modo"] = "nacional"
    _escribir(tmp_path, "02-presupuestador.json", datos)
    fallos = verificar(tmp_path)
    assert any("declara modo nacional y brief.json dice latam" in f for f in fallos)


def test_horas_que_contradicen_el_brief_fallan(tmp_path):
    _canal_ok(tmp_path)
    datos = json.loads((tmp_path / "02-presupuestador.json").read_text(encoding="utf-8"))
    datos["hechos"]["horas_total"] = 24
    _escribir(tmp_path, "02-presupuestador.json", datos)
    fallos = verificar(tmp_path)
    assert any("declara 24 h y brief.json dice 28 h" in f for f in fallos)


def test_horas_que_no_corresponden_al_modo_fallan_sin_brief(tmp_path):
    # Sin brief: 28 h no pueden ser un rally nacional de 24 h.
    _canal_ok(tmp_path)
    for nombre in ("01-pautador.json", "02-presupuestador.json"):
        datos = json.loads((tmp_path / nombre).read_text(encoding="utf-8"))
        datos["hechos"]["modo"] = "nacional"
        _escribir(tmp_path, nombre, datos)
    _sin_brief(tmp_path)
    datos = json.loads((tmp_path / "02-presupuestador.json").read_text(encoding="utf-8"))
    datos["hechos"]["horas_total"] = 28
    _escribir(tmp_path, "02-presupuestador.json", datos)
    fallos = verificar(tmp_path)
    assert any("declara 28 h para un rally nacional" in f for f in fallos)


def test_modo_ambiguo_falla(tmp_path):
    _canal_ok(tmp_path)
    datos = json.loads((tmp_path / "02-presupuestador.json").read_text(encoding="utf-8"))
    datos["hechos"]["modo"] = "nacional o latam"
    _escribir(tmp_path, "02-presupuestador.json", datos)
    fallos = verificar(tmp_path)
    assert any("no dice un modo unico" in f for f in fallos)


def test_modo_consistente_entre_contratos_pasa_sin_brief(tmp_path):
    # Sin brief manda el primer contrato: los siguientes no lo contradicen.
    _canal_ok(tmp_path)
    for nombre in ("01-pautador.json", "02-presupuestador.json"):
        datos = json.loads((tmp_path / nombre).read_text(encoding="utf-8"))
        datos["hechos"]["modo"] = "nacional"
        _escribir(tmp_path, nombre, datos)
    _sin_brief(tmp_path)
    assert verificar(tmp_path) == []


def test_brief_explicito_manda_sobre_el_del_canal(tmp_path):
    # Copia aislada: el brief de la simulacion se pasa por ruta y gana sobre el que
    # hubiera al lado del canal.
    _canal_ok(tmp_path)
    aislado = tmp_path.parent / "brief-simulado.json"
    aislado.write_text(json.dumps({"rally_type": "nacional", "hours_total": 24}),
                       encoding="utf-8")
    fallos = verificar(tmp_path, brief=aislado)
    assert any("brief.json dice nacional" in f or "dice latam" in f for f in fallos)


def test_main_acepta_brief_explicito(tmp_path):
    _canal_ok(tmp_path)
    assert main([str(tmp_path)]) == 0
    assert main([str(tmp_path), "--brief"]) == 2
    assert main([str(tmp_path), "--brief", str(tmp_path / "no-existe.json")]) == 2


# --- H-38: la cifra escrita como numero JSON y el contrato ilegible ---


def test_cifra_numerica_con_otro_valor_falla(tmp_path):
    # 4500 y 6000 son la misma clase de dato que «USD 4500»; solo cambia la forma de
    # escribirlo. Si el auditor solo mira cadenas, la contradiccion numerica pasa.
    _canal_ok(tmp_path)
    for nombre in ("01-pautador.json", "02-presupuestador.json"):
        dato = json.loads((tmp_path / nombre).read_text(encoding="utf-8"))
        dato["hechos"]["costo_piloto"] = 4500
        _escribir(tmp_path, nombre, dato)
    assert verificar(tmp_path) == []
    otro = json.loads((tmp_path / "02-presupuestador.json").read_text(encoding="utf-8"))
    otro["hechos"]["costo_piloto"] = 6000
    _escribir(tmp_path, "02-presupuestador.json", otro)
    fallos = verificar(tmp_path)
    assert any("costo_piloto cambia" in f for f in fallos)


def test_cifra_numerica_igual_no_falla(tmp_path):
    _canal_ok(tmp_path)
    for nombre in ("01-pautador.json", "02-presupuestador.json"):
        dato = json.loads((tmp_path / nombre).read_text(encoding="utf-8"))
        dato["hechos"]["costo_piloto"] = 24300
        _escribir(tmp_path, nombre, dato)
    assert verificar(tmp_path) == []


def test_cifra_numerica_con_motivo_pasa(tmp_path):
    _canal_ok(tmp_path)
    uno = json.loads((tmp_path / "01-pautador.json").read_text(encoding="utf-8"))
    uno["hechos"]["costo_piloto"] = 24300
    _escribir(tmp_path, "01-pautador.json", uno)
    dos = json.loads((tmp_path / "02-presupuestador.json").read_text(encoding="utf-8"))
    dos["hechos"]["costo_piloto"] = 31500
    dos["hechos"]["motivo_costo_piloto"] = "Suma repuestos y transporte."
    _escribir(tmp_path, "02-presupuestador.json", dos)
    assert verificar(tmp_path) == []


def test_un_booleano_no_es_una_cifra(tmp_path):
    _canal_ok(tmp_path)
    for nombre in ("01-pautador.json", "02-presupuestador.json"):
        dato = json.loads((tmp_path / nombre).read_text(encoding="utf-8"))
        dato["hechos"]["aprobado"] = True
        _escribir(tmp_path, nombre, dato)
    otro = json.loads((tmp_path / "02-presupuestador.json").read_text(encoding="utf-8"))
    otro["hechos"]["aprobado"] = False
    _escribir(tmp_path, "02-presupuestador.json", otro)
    assert verificar(tmp_path) == []


def test_contrato_con_json_truncado_se_reporta_sin_traceback(tmp_path):
    _canal_ok(tmp_path)
    (tmp_path / "03-guionista.json").write_text('{"rol": "guionista", "orden": 3', encoding="utf-8")
    fallos = verificar(tmp_path)
    assert len(fallos) == 1
    assert "03-guionista.json" in fallos[0]
    assert "no se puede leer como JSON" in fallos[0]
    assert main([str(tmp_path)]) == 1


def test_contrato_que_no_es_objeto_se_reporta(tmp_path):
    _canal_ok(tmp_path)
    (tmp_path / "03-guionista.json").write_text("[]", encoding="utf-8")
    fallos = verificar(tmp_path)
    assert len(fallos) == 1 and "debe ser un objeto JSON" in fallos[0]
