"""Genera la hoja @font-face con las fuentes de la marca incrustadas en base64.

Las fuentes viven en `docs/assets/fuentes/` (TTF). Se recortan al rango latino
y se convierten a WOFF2 para que el entregable de rodaje se abra desde el
teléfono sin red y se vea con la tipografía del DESIGN.md:
Plus Jakarta Sans (interfaz) y JetBrains Mono (cifras).

Uso:
    python tools/embeber_fuentes.py                 # escribe skills/guion-storyboard/fuentes.css
    python tools/embeber_fuentes.py --ruta X.css    # otra salida
    python tools/embeber_fuentes.py --dry-run       # solo reporta tamaños
"""

from __future__ import annotations

import argparse
import base64
import io
import sys
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
ORIGEN = RAIZ / "docs" / "assets" / "fuentes"
DESTINO = RAIZ / "skills" / "guion-storyboard" / "fuentes.css"

# (archivo, familia, peso)
FUENTES = [
    ("PlusJakartaSans-400.ttf", "Plus Jakarta Sans", 400),
    ("PlusJakartaSans-600.ttf", "Plus Jakarta Sans", 600),
    ("PlusJakartaSans-700.ttf", "Plus Jakarta Sans", 700),
    ("JetBrainsMono-400.ttf", "JetBrains Mono", 400),
    ("JetBrainsMono-600.ttf", "JetBrains Mono", 600),
]

# Latin básico + signos de apertura, acentos y comillas del español.
UNICODES = "U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+2000-206F,U+20AC,U+2122,U+2212"


def woff2(origen: Path) -> bytes:
    from fontTools import subset
    from fontTools.ttLib import TTFont

    fuente = TTFont(str(origen))
    opciones = subset.Options()
    opciones.flavor = "woff2"
    opciones.desubroutinize = True
    opciones.layout_features = ["kern", "liga", "calt", "tnum"]
    opciones.name_IDs = ["*"]
    opciones.notdef_outline = True

    recorte = subset.Subsetter(options=opciones)
    recorte.populate(unicodes=subset.parse_unicodes(UNICODES))
    recorte.subset(fuente)
    salida = io.BytesIO()
    fuente.flavor = "woff2"
    fuente.save(salida)
    return salida.getvalue()


def hoja(fuentes: list[tuple[str, str, int, bytes]]) -> str:
    partes = ["/* Fuentes de la marca incrustadas: el archivo se abre sin red. */"]
    for familia, _, peso, datos in fuentes:
        b64 = base64.b64encode(datos).decode("ascii")
        partes.append(
            "@font-face{font-family:'%s';font-style:normal;font-weight:%.0f;font-display:swap;"
            "src:url(data:font/woff2;base64,%s) format('woff2')}" % (familia, peso, b64)
        )
    return "\n".join(partes) + "\n"


def main(argv: list[str] | None = None) -> int:
    ap = argparse.ArgumentParser(description="Incrusta las fuentes de la marca en una hoja CSS.")
    ap.add_argument("--ruta", type=Path, default=DESTINO)
    ap.add_argument("--dry-run", action="store_true")
    args = ap.parse_args(argv)

    if not ORIGEN.is_dir():
        print("No existe %s" % ORIGEN)
        return 2

    hechas: list[tuple[str, str, int, bytes]] = []
    total = 0
    for nombre, familia, peso in FUENTES:
        origen = ORIGEN / nombre
        if not origen.is_file():
            print("! falta %s" % nombre)
            continue
        datos = woff2(origen)
        total += len(datos)
        print("  %-26s %5.1f kB -> %5.1f kB" % (nombre, origen.stat().st_size / 1024, len(datos) / 1024))
        hechas.append((familia, nombre, peso, datos))

    if not hechas:
        print("Nada que incrustar.")
        return 2

    print("woff2 total %.1f kB  |  base64 %.1f kB" % (total / 1024, total * 4 / 3 / 1024))
    if args.dry_run:
        return 0

    args.ruta.parent.mkdir(parents=True, exist_ok=True)
    args.ruta.write_text(hoja(hechas), encoding="utf-8", newline="\n")
    print("OK  %s  (%.1f kB)" % (args.ruta, args.ruta.stat().st_size / 1024))
    return 0


if __name__ == "__main__":
    sys.exit(main())
