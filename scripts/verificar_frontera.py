#!/usr/bin/env python3
"""verificar_frontera.py -- Compuerta de identidad entre capas (F1).

Caza huellas del motor dentro de la capa proyecto y el sentido inverso.

    motor -> proyecto   site/**, brand/tokens.css, design/*.html|css
                        hexes, familias, clases y la marca del workbench.
    proyecto -> motor   dashboard/**  no puede importar brand/tokens.css.

Una huella se perdona solo si consta como eleccion aprobada del proyecto en
brand/palette.json (una familia de `_fuentes`, un color de la paleta).

Uso:
    python scripts/verificar_frontera.py [--raiz .]
Salida: lineas OK/FAIL y codigo 1 si hay una huella sin aprobar.
"""
from __future__ import annotations

import argparse
import json
import pathlib
import re
import sys

HEXES = [
    "#0866F5", "#0057E7", "#0D1B35", "#091E42", "#0284C7", "#DCE7F5",
    "#F8FAFD", "#F0F6FF", "#EFF6FF", "#BFDBFE", "#5C7193", "#94A3B8",
    "#13213A", "#334155", "#CBD5E1",
]
FAMILIAS = ["Plus Jakarta Sans", "JetBrains Mono", "Caveat"]
CLASES = ["tactical-status-pill", "status-dot", "brand-divider"]
MARCAS = ["// RALLY STUDIO", "RALLY STUDIO"]

PROYECTO = ("site", "brand/tokens.css")
MOTOR = ("dashboard",)
# Extension declarada del motor: usa su identidad a proposito, no es capa proyecto.
EXTENSIONES_MOTOR = ("dashboard/entregables/teleprompter.html",)


def _colores(dato, salida: set[str]) -> set[str]:
    if isinstance(dato, dict):
        for valor in dato.values():
            _colores(valor, salida)
    elif isinstance(dato, list):
        for valor in dato:
            _colores(valor, salida)
    elif isinstance(dato, str) and re.fullmatch(r"#[0-9a-fA-F]{6}", dato):
        salida.add(dato.upper())
    return salida


def aprobado(raiz: pathlib.Path) -> tuple[set[str], set[str]]:
    """Colores y familias que el humano aprobo para este proyecto."""
    ruta = raiz / "brand" / "palette.json"
    if not ruta.exists():
        return set(), set()
    try:
        paleta = json.loads(ruta.read_text(encoding="utf-8-sig"))
    except json.JSONDecodeError:
        return set(), set()
    colores = _colores(paleta, set())
    familias = {v for v in (paleta.get("_fuentes") or {}).values() if v}
    return colores, familias


SISTEMA = ("design", "site/diseno")


def capa(rel: str) -> str:
    """Capa de un archivo: proyecto (deliverable), sistema (kit de Rally Studio) o motor."""
    for prefijo in SISTEMA:
        if rel == prefijo or rel.startswith(prefijo + "/"):
            return "sistema"
    return "proyecto"


def archivos_de_proyecto(raiz: pathlib.Path) -> list[pathlib.Path]:
    salida: list[pathlib.Path] = []
    site = raiz / "site"
    if site.exists():
        salida += [p for p in site.rglob("*") if p.suffix in {".html", ".css"}]
    tokens = raiz / "brand" / "tokens.css"
    if tokens.exists():
        salida.append(tokens)
    design = raiz / "design"
    if design.exists():
        salida += [p for p in design.glob("*.html")]
        salida += [p for p in design.glob("*.css")]
    return salida


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Huellas del motor en la capa proyecto.")
    parser.add_argument("--raiz", default=".")
    args = parser.parse_args(argv)
    raiz = pathlib.Path(args.raiz).resolve()

    colores_ok, familias_ok = aprobado(raiz)
    fallos: list[str] = []
    avisos: list[str] = []

    for archivo in archivos_de_proyecto(raiz):
        try:
            texto = archivo.read_text(encoding="utf-8", errors="replace")
        except OSError:
            continue
        rel = archivo.relative_to(raiz).as_posix()
        # El kit del sistema (design/, site/diseno/) viste la marca de Rally Studio:
        # no es entregable del proyecto y no adopta tokens del proyecto. Se informa, no falla.
        destino = avisos if capa(rel) == "sistema" else fallos
        for hexa in HEXES:
            if hexa.upper() in colores_ok:
                continue
            if re.search(hexa, texto, re.IGNORECASE):
                destino.append(f"{rel}: color del motor {hexa} sin aprobar")
        for familia in FAMILIAS:
            if familia in familias_ok:
                continue
            if familia in texto:
                destino.append(f"{rel}: familia del motor {familia} sin aprobar")
        for clase in CLASES:
            if re.search(rf"[\"'\s.]{clase}\b", texto):
                destino.append(f"{rel}: clase del motor .{clase}")
        for marca in MARCAS:
            if marca in texto:
                destino.append(f"{rel}: marca del workbench '{marca}'")
                break

    for carpeta in MOTOR:
        base = raiz / carpeta
        if not base.exists():
            continue
        for pagina in list(base.rglob("*.css")) + list(base.rglob("*.html")):
            rel = pagina.relative_to(raiz).as_posix()
            if rel in EXTENSIONES_MOTOR:
                continue
            texto = pagina.read_text(encoding="utf-8", errors="replace")
            if "brand/tokens.css" in texto or "brand\\tokens.css" in texto:
                fallos.append(f"{rel}: el motor importa tokens del proyecto")

    for aviso in avisos:
        print(f"INFO {aviso}")

    if fallos:
        for fallo in fallos:
            print(f"FAIL {fallo}")
        print(f"FAIL frontera: {len(fallos)} huella(s) del motor en la capa proyecto")
        return 1
    print("OK   frontera: la capa proyecto no arrastra identidad del motor")
    print(f"OK   frontera: {len(archivos_de_proyecto(raiz))} archivo(s) revisados, "
          f"{len(avisos)} huella(s) informadas en el kit del sistema")
    print("OK   frontera: dashboard/ no importa brand/tokens.css")
    return 0


if __name__ == "__main__":
    sys.exit(main())
