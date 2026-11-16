# -*- coding: utf-8 -*-
"""Pone aria-label en cada boton y aria-hidden en cada icono de la plantilla.

La ley de interfaz minima exige icono con `title` y `aria-label`; los iconos SVG
decorativos no deben anunciarse. Este script es idempotente.
"""
import re
from pathlib import Path

PLANTILLA = Path(__file__).resolve().parents[1] / "skills" / "guion-storyboard" / "plantilla_teleprompter.html"


def main():
    t = PLANTILLA.read_text(encoding="utf-8")
    antes_btn = 0
    antes_svg = 0

    def btn(m):
        nonlocal antes_btn
        tag = m.group(0)
        if "aria-label" in tag:
            return tag
        mt = re.search(r'title="([^"]+)"', tag)
        if not mt:
            return tag
        antes_btn += 1
        return tag[:-1] + f' aria-label="{mt.group(1)}">'

    def svg(m):
        nonlocal antes_svg
        tag = m.group(0)
        if "aria-hidden" in tag:
            return tag
        antes_svg += 1
        return tag.replace("<svg", '<svg aria-hidden="true" focusable="false"', 1)

    t = re.sub(r"<button[^>]*>", btn, t)
    t = re.sub(r"<svg[^>]*>", svg, t)
    PLANTILLA.write_text(t, encoding="utf-8")
    print(f"OK  botones_con_aria={antes_btn}  svg_ocultos={antes_svg}")


if __name__ == "__main__":
    main()
