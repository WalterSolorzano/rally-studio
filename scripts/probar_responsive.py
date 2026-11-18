#!/usr/bin/env python
"""Prueba de responsive del sitio del proyecto.

Abre site/index.html en 390 / 768 / 1440 px y falla si hay scroll horizontal,
si el cuerpo baja de 14 px en movil o si algun elemento desborda el ancho.
Deja capturas en audit/site-{ancho}.png.
"""
from __future__ import annotations

import pathlib
import sys

from playwright.sync_api import sync_playwright

RAIZ = pathlib.Path(__file__).resolve().parent.parent
PAGINA = RAIZ / "site" / "index.html"
AUDIT = RAIZ / "audit"
VISTAS = [(390, 844, "movil"), (768, 1024, "tablet"), (1440, 900, "escritorio")]

MEDIR = """
() => {
  const de = document.documentElement;
  const ancho = window.innerWidth;
  const desbordes = [...document.querySelectorAll('body *')]
    .filter(el => el.getBoundingClientRect().right > ancho + 1)
    .slice(0, 5)
    .map(el => el.tagName.toLowerCase() + (el.className ? '.' + String(el.className).split(' ')[0] : ''));
  return {
    scrollWidth: de.scrollWidth,
    clientWidth: de.clientWidth,
    cuerpo: parseFloat(getComputedStyle(document.body).fontSize),
    fuente: getComputedStyle(document.body).fontFamily,
    desbordes,
    titulo: document.title,
    texto: document.body.innerText.trim().slice(0, 40),
  };
}
"""


def main() -> int:
    if "--pagina" in sys.argv:
        pagina = pathlib.Path(sys.argv[sys.argv.index("--pagina") + 1]).resolve()
    else:
        pagina = PAGINA
    if not pagina.exists():
        raise SystemExit("site/index.html no existe: correr scripts/gen_site.py primero.")
    AUDIT.mkdir(exist_ok=True)
    fallos: list[str] = []
    url = pagina.as_uri()

    with sync_playwright() as p:
        navegador = p.chromium.launch()
        for ancho, alto, etiqueta in VISTAS:
            pagina = navegador.new_page(viewport={"width": ancho, "height": alto})
            errores: list[str] = []
            pagina.on("console", lambda m: errores.append(m.text) if m.type == "error" else None)
            pagina.on("pageerror", lambda e: errores.append(str(e)))
            pagina.goto(url, wait_until="load")
            datos = pagina.evaluate(MEDIR)
            captura = AUDIT / ("site-%d.png" % ancho)
            pagina.screenshot(path=str(captura), full_page=True)
            pagina.close()

            if datos["scrollWidth"] > datos["clientWidth"] + 1:
                fallos.append("%d px: scroll horizontal (%d > %d) en %s"
                              % (ancho, datos["scrollWidth"], datos["clientWidth"], datos["desbordes"]))
            if ancho <= 390 and datos["cuerpo"] < 14:
                fallos.append("%d px: cuerpo %.1f px (< 14 px)" % (ancho, datos["cuerpo"]))
            if datos["desbordes"]:
                fallos.append("%d px: desbordan %s" % (ancho, datos["desbordes"]))
            if "serif" in datos["fuente"] and "sans-serif" not in datos["fuente"]:
                fallos.append("%d px: body cae a serif (%s)" % (ancho, datos["fuente"]))
            if errores:
                fallos.append("%d px: consola con %d error(es)" % (ancho, len(errores)))
            if not datos["texto"]:
                fallos.append("%d px: pagina sin texto" % ancho)

            print("%-10s %4d px  scroll %d/%d  cuerpo %.0f px  desbordes %d  -> %s"
                  % (etiqueta, ancho, datos["scrollWidth"], datos["clientWidth"],
                     datos["cuerpo"], len(datos["desbordes"]),
                     "OK" if not fallos else "revisar"))
        navegador.close()

    for f in fallos:
        print("FAIL " + f)
    if not fallos:
        print("OK: responsive 390/768/1440 sin scroll horizontal, cuerpo >= 14 px, consola limpia")
        print("OK: capturas en audit/site-390.png, site-768.png, site-1440.png")
    return 1 if fallos else 0


if __name__ == "__main__":
    sys.exit(main())
