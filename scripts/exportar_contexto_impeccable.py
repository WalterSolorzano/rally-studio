#!/usr/bin/env python3
"""exportar_contexto_impeccable.py -- contexto de diseno del PROYECTO para impeccable.

`.impeccable/design.json` describe el workbench (motor). Este export escribe
`.impeccable/proyecto/design.json` desde `brand/tokens.css` y el plan de producto
de `brief.json`, para que impeccable audite `site/` y `design/` con la vara del
proyecto y no con la del motor.

Uso:
    python scripts/exportar_contexto_impeccable.py [--si]
Sin `--si` solo imprime lo que escribiria.
"""
from __future__ import annotations

import argparse
import json
import pathlib
import re
import sys

RAIZ = pathlib.Path(__file__).resolve().parent.parent
BRIEF = RAIZ / "brief.json"
TOKENS = RAIZ / "brand" / "tokens.css"
MOTOR = RAIZ / ".impeccable" / "design.json"
SALIDA = RAIZ / ".impeccable" / "proyecto" / "design.json"

TOKEN = re.compile(r"^\s*(--[a-z0-9-]+)\s*:\s*([^;]+);", re.IGNORECASE)


def leer_tokens(ruta: pathlib.Path) -> dict[str, str]:
    if not ruta.exists():
        return {}
    tokens: dict[str, str] = {}
    for linea in ruta.read_text(encoding="utf-8", errors="replace").splitlines():
        m = TOKEN.match(linea)
        if m:
            tokens[m.group(1)] = m.group(2).strip()
    return tokens


def leer_json(ruta: pathlib.Path) -> dict:
    if not ruta.exists():
        return {}
    try:
        return json.loads(ruta.read_text(encoding="utf-8-sig")) or {}
    except json.JSONDecodeError:
        return {}


def marcar_motor(ruta: pathlib.Path, seco: bool) -> bool:
    """El design.json de la raiz es del workbench: se dice, no se reescribe."""
    if not ruta.exists():
        return False
    datos = leer_json(ruta)
    if datos.get("scope") == "motor":
        return False
    datos["scope"] = "motor"
    datos["scopeNote"] = (
        "Contexto del workbench (dashboard/). No aplica a site/, brand/ ni design/."
    )
    if not seco:
        ruta.write_text(json.dumps(datos, indent=2, ensure_ascii=False) + "\n",
                        encoding="utf-8")
    return True


def contexto(tokens: dict[str, str], brief: dict) -> dict:
    plan = brief.get("producto") or {}
    paleta = {k: v for k, v in tokens.items()
              if k.startswith(("--bg", "--text", "--border", "--color", "--status"))}
    escalas = {k: v for k, v in tokens.items()
               if k.startswith(("--radius", "--space", "--shadow", "--motion", "--font"))}
    return {
        "schemaVersion": 2,
        "scope": "proyecto",
        "scopeNote": (
            "Identidad de la capa proyecto, derivada de brand/tokens.css y del plan de "
            "producto. Auditar site/ y design/ contra esto, nunca contra DESIGN.md."
        ),
        "project": brief.get("project_name") or "",
        "piece_type": plan.get("piece_type") or "",
        "direccion": (plan.get("direccion") or ""),
        "colors": paleta,
        "typography": {k: v for k, v in escalas.items() if k.startswith("--font")},
        "scales": {k: v for k, v in escalas.items() if not k.startswith("--font")},
        "rules": [
            "Cero hex literal: todo color sale de estos tokens.",
            "El decorativo (--color-accent-decor) nunca lleva texto.",
            "Contraste medido, no estimado.",
            "Movimiento con salida prefers-reduced-motion.",
        ],
    }


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Exporta el contexto del proyecto para impeccable.")
    parser.add_argument("--si", action="store_true", help="escribe los archivos")
    args = parser.parse_args(argv)

    tokens = leer_tokens(TOKENS)
    brief = leer_json(BRIEF)
    datos = contexto(tokens, brief)

    marcado = marcar_motor(MOTOR, seco=not args.si)
    if not args.si:
        print(f"OK: {len(datos['colors'])} colores, {len(datos['typography'])} familias")
        print(f"OK: se escribiria {SALIDA.relative_to(RAIZ).as_posix()}")
        print("OK: motor marcado como scope=motor" if marcado else "OK: motor ya marcado")
        print("falta --si para escribir")
        return 0

    SALIDA.parent.mkdir(parents=True, exist_ok=True)
    SALIDA.write_text(json.dumps(datos, indent=2, ensure_ascii=False) + "\n",
                      encoding="utf-8")
    print(f"OK: {SALIDA.relative_to(RAIZ).as_posix()}")
    print("OK: .impeccable/design.json es contexto del motor")
    return 0


if __name__ == "__main__":
    sys.exit(main())
