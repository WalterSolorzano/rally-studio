"""Repite los escenarios B0 contra el canal ya arreglado y mide deteccion por regla.

El plan exige >= 5 corridas por escenario antes de dar una regla por buena. Esto no
simula un equipo: mide la unica parte que se puede medir sin depender de la suerte de
un modelo, que es si el auditor distingue un canal sano de uno roto. Cada corrida deja
una traza JSON; el resumen final dice, por escenario y por fallo inyectado, si el
auditor lo detecto.

Uso:
    python scripts/medir_b0.py [--corridas 5] [--guardar <carpeta>]

Cada escenario genera una corrida sana (debe pasar) y N-1 corridas con un fallo
inyectado distinto (cada una debe fallar). Un canal sano que falla es un falso
positivo del auditor, y vale tanto como un fallo no detectado.
"""

from __future__ import annotations

import argparse
import copy
import json
import sys
import tempfile
from pathlib import Path

RAIZ = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(RAIZ / "scripts"))

from verificar_canal import verificar  # noqa: E402

MOD0 = {"modo": "nacional", "horas_total": 24}


def _contrato(rol: str, orden: int, lee, hechos: dict, **extra) -> dict:
    c = {
        "rol": rol,
        "orden": orden,
        "lee_de": lee,
        "hechos": dict(hechos),
        "preguntas_abiertas": [],
        "preguntas_contestadas": [],
        "entregable": f"{rol} entrega su parte",
    }
    c.update(extra)
    return c


def _canal_sano() -> dict[str, dict]:
    """Canal de 3 contratos: pautador, presupuestador y mentor, todo declarado."""
    h1 = dict(MOD0, cooperativa="COOPAGUA Somoto", costo_piloto_nio="C$ 24 300")
    c1 = _contrato(
        "pautador", 1, [],
        h1,
        preguntas_abiertas=["Cual es el precio del tanque de 500 litros?"],
        entregable="Agua acarreada 900 m; 40 familias; COOPAGUA Somoto",
    )
    h2 = dict(
        MOD0,
        base_calculo="unidad",
        unidad_de_la_base="una casa con el sistema instalado y probado",
        operador="COOPAGUA Somoto administra el comite de agua",
        costo_piloto_nio="C$ 24 300",
    )
    c2 = _contrato(
        "presupuestador", 2, ["01-pautador.json"],
        h2,
        partidas=[{
            "concepto": "Sistema completo instalado y probado",
            "unidades": 2,
            "costo_unitario_nio": 12150,
            "base_calculo": "unidad",
        }],
        cuadre={"suma_partidas_nio": 24300, "diferencia_nio": 0},
        preguntas_contestadas=[{
            "pregunta": "Cual es el precio del tanque de 500 litros?",
            "respuesta": "[FALTA: cotizacion del proveedor]",
        }],
    )
    c3 = _contrato("mentor", 3, ["02-presupuestador.json"], dict(MOD0), entregable="mentoria")
    return {"01-pautador.json": c1, "02-presupuestador.json": c2, "03-mentor.json": c3}


def _canal_con_corte() -> dict[str, dict]:
    """Canal donde el rol 2 se corto a mitad y el rol 2b reanudo."""
    canales = _canal_sano()
    cortado = copy.deepcopy(canales["02-presupuestador.json"])
    cortado["estado"] = "parcial"
    cortado["conservado"] = ["precio de la bomba", "unidad de la base"]
    cortado["falta"] = ["precio del tanque", "tarifa de flete"]
    reanuda = _contrato(
        "presupuestador", 3, ["02-presupuestador.json"],
        dict(dict(MOD0), base_calculo="unidad", operador="COOPAGUA Somoto administra el comite"),
        hechos_extra=None,
    )
    reanuda["hechos"]["recuperado_de"] = "02-presupuestador.json"
    reanuda["preguntas_contestadas"] = [{
        "pregunta": "Cual es el precio del tanque de 500 litros?",
        "respuesta": "[FALTA: cotizacion del proveedor]",
    }]
    return {
        "01-pautador.json": canales["01-pautador.json"],
        "02-presupuestador.json": cortado,
        "03-presupuestador.json": reanuda,
    }


def _romper(canales: dict[str, dict], arreglo) -> dict[str, dict]:
    roto = copy.deepcopy(canales)
    arreglo(roto)
    return roto


# Cada escenario: nombre, canal base, lista de (etiqueta, arreglo o None).
# None = corrida sana; el resto inyecta un fallo que debe detectarse.


def _esc1() -> tuple[str, dict, list]:
    base = _canal_sano()
    return "1 · Cacao Norte · comunicacion entre roles", base, [
        ("sano", None),
        ("sin lee_de", lambda c: c["02-presupuestador.json"].pop("lee_de")),
        ("pregunta sin contestar", lambda c: c["02-presupuestador.json"].__setitem__(
            "preguntas_contestadas", [])),
        ("cifra cambiada sin motivo", lambda c: c["02-presupuestador.json"]["hechos"].__setitem__(
            "costo_piloto_nio", "C$ 31 000")),
        ("mismo orden dos veces", lambda c: c["03-mentor.json"].__setitem__("orden", 2)),
        ("salto de orden", lambda c: c["03-mentor.json"].__setitem__("orden", 5)),
    ]


def _esc2() -> tuple[str, dict, list]:
    base = _canal_con_corte()

    def sin_conservado(c):
        c["02-presupuestador.json"].pop("conservado")

    def sin_falta(c):
        c["02-presupuestador.json"].pop("falta")

    def sin_recuperado(c):
        c["03-presupuestador.json"]["hechos"].pop("recuperado_de")

    def recuperado_ajeno(c):
        c["03-presupuestador.json"]["hechos"]["recuperado_de"] = "09-otro.json"

    return "2 · Rio Seco · corte de red a mitad de encargo", base, [
        ("sano", None),
        ("corte sin conservado", sin_conservado),
        ("corte sin falta", sin_falta),
        ("reanuda sin recuperado_de", sin_recuperado),
        ("recuperado_de ajeno", recuperado_ajeno),
    ]


def _esc3() -> tuple[str, dict, list]:
    base = _canal_sano()
    return "3 · Loma Alta · cambio de reto a la hora 20", base, [
        ("sano", None),
        ("modo contradictorio", lambda c: c["02-presupuestador.json"]["hechos"].__setitem__(
            "modo", "latam")),
        ("horas cambiadas", lambda c: c["02-presupuestador.json"]["hechos"].__setitem__(
            "horas_total", 28)),
        ("primer contrato sin modo", lambda c: c["01-pautador.json"]["hechos"].pop("modo")),
    ]


def _esc4() -> tuple[str, dict, list]:
    base = _canal_sano()

    def doble_conteo(c):
        c["02-presupuestador.json"]["partidas"].append(
            {"concepto": "Bomba manual de doble accion", "unidades": 2,
             "costo_unitario_nio": 6500, "base_calculo": "unidad"})

    def mayoria_en_cero(c):
        c["02-presupuestador.json"]["partidas"] = [
            {"concepto": "Sistema completo instalado y probado", "unidades": 2,
             "costo_unitario_nio": 12150, "base_calculo": "unidad"},
            {"concepto": "Tanque 500 litros", "unidades": 2, "costo_unitario_nio": 0},
            {"concepto": "Base de concreto", "unidades": 2, "costo_unitario_nio": 0},
            {"concepto": "Flete", "unidades": 1, "costo_unitario_nio": 0},
        ]

    def opera_sin_declarar(c):
        c["02-presupuestador.json"]["hechos"].pop("operador")
        c["02-presupuestador.json"]["entregable"] = (
            "COOPAGUA Somoto opera y da mantenimiento al sistema en cada casa")

    def sin_base(c):
        c["02-presupuestador.json"]["hechos"].pop("base_calculo")

    return "4 · Marea Baja · documento con instrucciones inyectadas", base, [
        ("sano", None),
        ("doble conteo", doble_conteo),
        ("presupuesto con mayoria en cero", mayoria_en_cero),
        ("opera sin declarar responsable", opera_sin_declarar),
        ("sin base de calculo", sin_base),
    ]


ESCENARIOS = [_esc1, _esc2, _esc3, _esc4]


def correr(carpeta: Path, contratos: dict[str, dict]) -> list[str]:
    carpeta.mkdir(parents=True, exist_ok=True)
    for viejo in carpeta.glob("*.json"):
        viejo.unlink()
    for nombre, datos in contratos.items():
        (carpeta / nombre).write_text(
            json.dumps(datos, ensure_ascii=False, indent=2), encoding="utf-8")
    return verificar(carpeta)


def main(argv: list[str] | None = None) -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--guardar", default=str(Path(tempfile.gettempdir()) / "opencode" / "b0"))
    args = ap.parse_args(argv)

    destino = Path(args.guardar)
    destino.mkdir(parents=True, exist_ok=True)

    print("=" * 78)
    print("B0 · repeticion de escenarios contra el canal arreglado")
    print("=" * 78)

    total = detectados = falsos_positivos = 0
    detalle = []

    for constructor in ESCENARIOS:
        nombre, base, corridas = constructor()
        print(f"\n{nombre}")
        for i, (etiqueta, arreglo) in enumerate(corridas, 1):
            contratos = base if arreglo is None else _romper(base, arreglo)
            carpeta = destino / f"{constructor.__name__}-corrida{i}"
            fallos = correr(carpeta, contratos)
            esperado_roto = arreglo is not None
            detectado = bool(fallos)
            ok = detectado == esperado_roto
            total += 1
            if esperado_roto and detectado:
                detectados += 1
            if not esperado_roto and detectado:
                falsos_positivos += 1
            if not esperado_roto:
                veredicto = "PASA" if ok else "FALSO POSITIVO"
            else:
                veredicto = "DETECTADO" if ok else "NO DETECTADO"
            print(f"  corrida {i} · {etiqueta:<38} {veredicto}")
            for f in fallos[:2]:
                print(f"      {f[:110]}")
            detalle.append({
                "escenario": nombre,
                "corrida": i,
                "etiqueta": etiqueta,
                "esperado_roto": esperado_roto,
                "detectado": detectado,
                "veredicto": veredicto,
                "fallos": fallos,
            })
            (carpeta / "traza.json").write_text(
                json.dumps(detalle[-1], ensure_ascii=False, indent=2), encoding="utf-8")

    inyectados = total - len(ESCENARIOS)
    print("\n" + "=" * 78)
    print(f"  corridas: {total}   fallos inyectados: {inyectados}   detectados: {detectados}")
    print(f"  falsos positivos sobre canales sanos: {falsos_positivos}")
    print(f"  trazas en {destino}")
    print("=" * 78)

    resumen = destino / "resumen.json"
    resumen.write_text(json.dumps(detalle, ensure_ascii=False, indent=2), encoding="utf-8")
    return 0 if (detectados == inyectados and falsos_positivos == 0) else 1


if __name__ == "__main__":
    raise SystemExit(main())
