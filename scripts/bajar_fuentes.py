#!/usr/bin/env python3
"""bajar_fuentes.py -- Fuentes del proyecto en local, sin CDN en el entregable.

Descarga los woff2 de la pareja aprobada desde Google Fonts y escribe un
`fonts.css` con @font-face relativo. La maqueta y el sitio quedan autocontenidos:
si no hay red, el generador cae a la pila del sistema y lo dice.

Uso:
    python scripts/bajar_fuentes.py --salida site/fonts
Salidas: <salida>/<familia>.woff2 + <salida>/fonts.css
Licencia: las familias se piden a Google Fonts bajo SIL Open Font License 1.1;
registro en `arsenal.lock.yaml` (seccion `fuentes`) y sin CDN en el entregable.
"""
from __future__ import annotations

import argparse
import json
import pathlib
import re
import sys
import urllib.request

RAIZ = pathlib.Path(__file__).resolve().parent.parent
PALETTE = RAIZ / "brand" / "palette.json"

UA = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/120.0 Safari/537.36"
)
PESOS = (400, 500)


def pedir(url: str) -> bytes:
    peticion = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(peticion, timeout=20) as respuesta:
        return respuesta.read()


def css_de(familia: str) -> str:
    nombre = familia.replace(" ", "+")
    url = (
        "https://fonts.googleapis.com/css2?"
        f"family={nombre}:wght@{';'.join(str(p) for p in PESOS)}&display=swap"
    )
    return pedir(url).decode("utf-8")


def bajar(familia: str, carpeta: pathlib.Path) -> list[str]:
    """Baja los pesos pedidos. Devuelve las rutas locales escritas."""
    css = css_de(familia)
    salida: list[str] = []
    bloques = re.findall(r"@font-face\s*{[^}]+}", css)
    for bloque in bloques:
        peso = re.search(r"font-weight:\s*(\d+)", bloque)
        url = re.search(r"url\((https://[^)]+\.woff2)\)", bloque)
        if not peso or not url:
            continue
        destino = carpeta / f"{familia.replace(' ', '')}-{peso.group(1)}.woff2"
        if not destino.exists():
            destino.write_bytes(pedir(url.group(1)))
        salida.append(destino.name)
    return sorted(set(salida))


def fonts_css(fuentes: dict[str, str], archivos: dict[str, list[str]]) -> str:
    lineas = ["/* Fonts del proyecto (OFL). Generado por scripts/bajar_fuentes.py. */"]
    roles = {"display": "font-display", "ui": "font-ui", "mono": "font-mono"}
    for rol, familia in fuentes.items():
        if rol not in roles or not familia:
            continue
        for archivo in archivos.get(familia, []):
            peso = re.search(r"-(\d+)\.woff2$", archivo)
            lineas.append(
                "@font-face {\n"
                f"  font-family: '{familia}';\n"
                f"  src: url('{archivo}') format('woff2');\n"
                f"  font-weight: {peso.group(1) if peso else 400};\n"
                "  font-display: swap;\n"
                "}"
            )
    return "\n".join(lineas) + "\n"


def main() -> int:
    parser = argparse.ArgumentParser(description="Baja las fuentes aprobadas a local.")
    parser.add_argument("--salida", default="site/fonts")
    args = parser.parse_args()

    if not PALETTE.exists():
        print("FAIL brand/palette.json no existe")
        return 2
    paleta = json.loads(PALETTE.read_text(encoding="utf-8-sig"))
    fuentes = {k: v for k, v in (paleta.get("_fuentes") or {}).items() if v}
    if not fuentes:
        print("FAIL la paleta no declara _fuentes: se aprueba la pareja tipografica antes")
        return 2

    carpeta = RAIZ / args.salida if not pathlib.Path(args.salida).is_absolute() else pathlib.Path(args.salida)
    carpeta.mkdir(parents=True, exist_ok=True)
    archivos: dict[str, list[str]] = {}
    for familia in sorted(set(fuentes.values())):
        try:
            archivos[familia] = bajar(familia, carpeta)
        except Exception as error:  # noqa: BLE001 -- sin red no se bloquea la maqueta
            print(f"AVISO {familia}: {type(error).__name__}; se usa la pila del sistema")
    if not archivos:
        print("FAIL ninguna fuente se pudo bajar: revisa la red")
        return 1

    (carpeta / "fonts.css").write_text(fonts_css(fuentes, archivos), encoding="utf-8")
    print(f"OK: {len(archivos)} familias en {carpeta}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
