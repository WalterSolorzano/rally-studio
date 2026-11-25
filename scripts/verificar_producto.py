#!/usr/bin/env python3
"""verificar_producto.py -- Compuerta del plan de producto (fase 11).

El producto se diseña en tramos: alcance, maqueta, sistema, pieza. Este script
comprueba que el plan aprobado esta completo y que las decisiones dificiles
estan escritas (que entra, que se descarta y por que).

Estados validos:
    sin plan      -> brief.json sin 'producto'                          -> PENDIENTE (0)
    plan completo -> todos los campos, <=3 pantallas, motion con reduced -> OK (0)
    plan a medias -> falta algo                                         -> FAIL (1)

Uso:
    python scripts/verificar_producto.py
    python scripts/verificar_producto.py --brief tests/fixtures/brief_plan.json
"""
from __future__ import annotations

import argparse
import json
import pathlib
import sys
import unicodedata

RAIZ = pathlib.Path(__file__).resolve().parent.parent
BRIEF = RAIZ / "brief.json"
TIPOS = {"app-movil", "web-app", "landing", "pieza-3d", "widget"}
ESTADOS_MINIMOS = {"hover", "focus", "disabled", "vacio", "error"}

fallos: list[str] = []


def ok(msg: str) -> None:
    print(f"OK   {msg}")


def fail(msg: str) -> None:
    print(f"FAIL {msg}")
    fallos.append(msg)


def _plano(texto: str) -> str:
    sin_acentos = unicodedata.normalize("NFKD", str(texto))
    return "".join(c for c in sin_acentos if not unicodedata.combining(c)).lower().strip()


def _texto(valor) -> bool:
    return isinstance(valor, str) and len(valor.strip()) >= 2


def verificar(plan: dict) -> None:
    if plan.get("piece_type") not in TIPOS:
        fail(f"piece_type {plan.get('piece_type')!r} fuera de {sorted(TIPOS)}")
    else:
        ok(f"tipo de pieza: {plan['piece_type']}")

    for campo in ("plataforma", "protagonista", "metafora", "iconografia", "data_source", "marco"):
        if not _texto(plan.get(campo)):
            fail(f"sin {campo}: el plan no declara lo que la pieza muestra")
    if plan.get("protagonista") and _texto(plan.get("protagonista")):
        ok(f"protagonista: {plan['protagonista'][:60]}")

    pantallas = plan.get("pantallas")
    if not isinstance(pantallas, list) or not pantallas:
        fail("sin pantallas: la pieza no tiene donde ocurrir")
    elif len(pantallas) > 3:
        fail(f"{len(pantallas)} pantallas: el techo es 3")
    else:
        ok(f"{len(pantallas)} pantalla(s)")
        for i, pantalla in enumerate(pantallas, 1):
            if not isinstance(pantalla, dict):
                fail(f"pantalla {i} no es objeto")
                continue
            for campo in ("id", "muestra", "accion_simulada"):
                if not _texto(pantalla.get(campo)):
                    fail(f"pantalla {i}: sin {campo}")
        primeros = [p for p in pantallas if isinstance(p, dict) and p.get("primero") is True]
        if len(primeros) != 1:
            fail(f"{len(primeros)} pantallas marcadas primero: debe haber exactamente una")
        else:
            ok(f"primera pantalla: {primeros[0].get('id')}")

    estados = {_plano(e) for e in plan.get("estados") or [] if isinstance(e, str)}
    faltan = sorted(ESTADOS_MINIMOS - estados)
    if faltan:
        fail(f"estados sin declarar: {', '.join(faltan)}")
    else:
        ok(f"{len(estados)} estados declarados")

    motion = plan.get("motion")
    if not isinstance(motion, dict):
        fail("sin motion: no hay momento de movimiento declarado")
    else:
        for campo in ("que", "duracion", "tipo", "reduced"):
            if not _texto(motion.get(campo)):
                fail(f"motion sin {campo}" + (" (prefers-reduced-motion obligatorio)" if campo == "reduced" else ""))
        if all(_texto(motion.get(c)) for c in ("que", "duracion", "tipo", "reduced")):
            ok(f"motion: {motion['que'][:40]} a {motion['duracion']}")

    modulos = plan.get("modulos")
    if not isinstance(modulos, dict):
        fail("sin modulos: no se decidio que entra y que no")
        return
    core = modulos.get("core")
    if not isinstance(core, list) or not core:
        fail("modulos.core vacio: sin nucleo no hay producto")
    else:
        ok(f"{len(core)} modulo(s) core")
    descartables = modulos.get("descartable")
    if not isinstance(descartables, list):
        fail("modulos.descartable ausente: lo que se descarta queda escrito, no implicito")
    else:
        for item in descartables:
            if not isinstance(item, dict) or not _texto(item.get("nombre")) or not _texto(item.get("motivo")):
                fail(f"descartable sin nombre o sin motivo: {item!r}")
        if descartables and not fallos:
            ok(f"{len(descartables)} modulo(s) descartado(s) con motivo")


def main() -> int:
    parser = argparse.ArgumentParser(description="Verifica el plan de producto del proyecto.")
    parser.add_argument("--brief", default=str(BRIEF), help="ruta al brief.json")
    args = parser.parse_args()

    ruta = pathlib.Path(args.brief)
    if not ruta.exists():
        print("PENDIENTE producto: no existe brief.json")
        return 0
    try:
        brief = json.loads(ruta.read_text(encoding="utf-8-sig"))
    except ValueError as exc:
        fail(f"brief.json ilegible: {exc}")
        return 1

    plan = brief.get("producto")
    if not plan:
        print("PENDIENTE producto: sin plan aprobado (estado valido antes de la fase 11)")
        return 0
    if not isinstance(plan, dict):
        fail("producto debe ser un objeto con el plan")
        return 1

    verificar(plan)
    return 1 if fallos else 0


if __name__ == "__main__":
    sys.exit(main())
