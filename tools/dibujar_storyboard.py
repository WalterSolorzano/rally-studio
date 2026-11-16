#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
dibujar_storyboard.py -- compone las referencias visuales del storyboard demo.

No inventa escenas: toma el arte que ya existe en el repositorio
(assets/covers/portada_video_16x9.png) y lo reencuadra como un tablero de
storyboard paso a paso. Cada cuadro sale 16:9 a 1280x720 con las flechas de
movimiento dibujadas encima, porque una toma sin movimiento es tiempo muerto.

Uso:
    python tools/dibujar_storyboard.py
    python tools/dibujar_storyboard.py --origen assets/covers/portada_video_16x9.png \\
        --destino script/refs/demo
"""
from __future__ import annotations

import argparse
import io
import sys
from pathlib import Path

from PIL import Image, ImageDraw

if sys.platform == "win32":
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")

RAIZ = Path(__file__).resolve().parents[1]
W, H = 1280, 720

# Coordenadas en el espacio de 1280x720 del arte normalizado.
# (id, caja de recorte, flechas [(x0,y0,x1,y1)], color del acto)
CUADROS = [
    ("S01", (870, 210, 1070, 322), [(1150, 590, 1040, 590)], "#0d1b35"),        # rostro, push-in
    ("S02", (760, 360, 1020, 506), [(850, 470, 990, 470)], "#0d1b35"),          # mano llevando el producto
    ("S03", (620, 155, 900, 312), [(640, 215, 870, 215), (640, 255, 870, 255)], "#0866f5"),  # flujo interno
    ("S04", (900, 360, 1140, 495), [(930, 480, 1090, 400)], "#0284c7"),         # contador del costo
    ("S05", (560, 120, 1040, 390), [(600, 660, 720, 610), (700, 690, 820, 640)], "#0284c7"),  # handheld
    ("S06", (890, 225, 1030, 304), [(1210, 650, 1080, 650)], "#94a3b8"),        # vuelta al rostro
]


def encuadrar(arte: Image.Image, caja: tuple[int, int, int, int]) -> Image.Image:
    x0, y0, x1, y1 = caja
    x0, y0 = max(0, x0), max(0, y0)
    x1, y1 = min(arte.width, x1), min(arte.height, y1)
    corte = arte.crop((x0, y0, x1, y1))
    # respeta 16:9 sin deformar: recorta el sobrante del lado largo
    objetivo = W / H
    if corte.width / corte.height > objetivo:
        nuevo = round(corte.height * objetivo)
        dx = (corte.width - nuevo) // 2
        corte = corte.crop((dx, 0, dx + nuevo, corte.height))
    else:
        nuevo = round(corte.width / objetivo)
        dy = (corte.height - nuevo) // 2
        corte = corte.crop((0, dy, corte.width, dy + nuevo))
    return corte.resize((W, H), Image.LANCZOS)


def flechas(dib: ImageDraw.ImageDraw, trazos, color: str) -> None:
    for x0, y0, x1, y1 in trazos:
        if (x0, y0) == (x1, y1):
            continue
        dib.line([(x0, y0), (x1, y1)], fill=color + "d9", width=9, joint="curve")
        # punta
        largo = 34
        dx, dy = x1 - x0, y1 - y0
        mod = max(1.0, (dx * dx + dy * dy) ** 0.5)
        ux, uy = dx / mod, dy / mod
        px, py = -uy, ux
        dib.polygon([(x1, y1),
                     (x1 - ux * largo + px * largo * 0.55, y1 - uy * largo + py * largo * 0.55),
                     (x1 - ux * largo - px * largo * 0.55, y1 - uy * largo - py * largo * 0.55)],
                    fill=color + "d9")


def main() -> int:
    ap = argparse.ArgumentParser(description="Referencias visuales del storyboard desde el arte del repo.")
    ap.add_argument("--origen", default="assets/covers/portada_video_16x9.png")
    ap.add_argument("--destino", default="script/refs/demo")
    args = ap.parse_args()

    origen = RAIZ / args.origen
    if not origen.is_file():
        print("! no existe " + str(origen))
        return 2
    destino = RAIZ / args.destino
    destino.mkdir(parents=True, exist_ok=True)

    arte = Image.open(origen).convert("RGB")
    arte = arte.resize((W, round(arte.height * W / arte.width)), Image.LANCZOS)
    for sid, caja, trazos, color in CUADROS:
        cuadro = encuadrar(arte, caja)
        dib = ImageDraw.Draw(cuadro, "RGBA")
        flechas(dib, trazos, color)
        salida = destino / (sid + ".png")
        cuadro.save(salida, "PNG", optimize=True)
        print("OK  %s  %dx%d  -> %s" % (sid, W, H, salida.relative_to(RAIZ)))
    print("Listo: %d cuadros. Regenera el entregable con --demo." % len(CUADROS))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
