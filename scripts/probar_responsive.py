#!/usr/bin/env python
"""Prueba de responsive del sitio del proyecto, por tipo de pieza.

landing     abre site/index.html en 390 / 768 / 1440 px (las tres vistas de siempre).
app-movil   mide la escena a 1440x900 y la pantalla a 390x844 con is_mobile,
            has_touch y UA de iPhone, dentro del bisel.
web-app     escena a 1440x900 y revision de desborde a 390.
pieza-3d    igual que web-app.

Falla si hay scroll horizontal, si el cuerpo baja de 14 px en movil o si algun
elemento desborda el ancho. Deja capturas en audit/<tipo>-<ancho>.png.
"""
from __future__ import annotations

import argparse
import pathlib
import sys

from playwright.sync_api import sync_playwright

RAIZ = pathlib.Path(__file__).resolve().parent.parent
PAGINA = RAIZ / "site" / "index.html"
AUDIT = RAIZ / "audit"
VISTAS = [(390, 844, "movil"), (768, 1024, "tablet"), (1440, 900, "escritorio")]
ESCENA = [(1440, 900, "escritorio")]
IPHONE_UA = (
    "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 "
    "(KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1"
)

MEDIR = """
() => {
  const de = document.documentElement;
  const ancho = window.innerWidth;
  const desbordes = [...document.querySelectorAll('body *')]
    .filter(el => el.getBoundingClientRect().right > ancho + 1)
    .slice(0, 5)
    .map(el => el.tagName.toLowerCase() + (el.className ? '.' + String(el.className).split(' ')[0] : ''));
  const bisel = document.querySelector('.bisel');
  const pantalla = document.querySelector('.pantalla');
  const caja = el => el ? el.getBoundingClientRect() : null;
  return {
    scrollWidth: de.scrollWidth,
    clientWidth: de.clientWidth,
    cuerpo: parseFloat(getComputedStyle(document.body).fontSize),
    fuente: getComputedStyle(document.body).fontFamily,
    desbordes,
    titulo: document.title,
    texto: document.body.innerText.trim().slice(0, 40),
    bisel: caja(bisel),
    pantalla: caja(pantalla),
    tactil: navigator.maxTouchPoints > 0,
  };
}
"""


def medir(pagina, url: str) -> dict:
    errores: list[str] = []
    pagina.on("console", lambda m: errores.append(m.text) if m.type == "error" else None)
    pagina.on("pageerror", lambda e: errores.append(str(e)))
    pagina.goto(url, wait_until="load")
    datos = pagina.evaluate(MEDIR)
    datos["errores"] = errores
    return datos


def revisar(fallos: list[str], etiqueta: str, datos: dict, ancho: int) -> None:
    if datos["scrollWidth"] > datos["clientWidth"] + 1:
        fallos.append("%s %d px: scroll horizontal (%d > %d) en %s"
                      % (etiqueta, ancho, datos["scrollWidth"], datos["clientWidth"],
                         datos["desbordes"]))
    if ancho <= 390 and datos["cuerpo"] < 14:
        fallos.append("%s %d px: cuerpo %.1f px (< 14 px)" % (etiqueta, ancho, datos["cuerpo"]))
    if datos["desbordes"]:
        fallos.append("%s %d px: desbordan %s" % (etiqueta, ancho, datos["desbordes"]))
    if "serif" in datos["fuente"] and "sans-serif" not in datos["fuente"]:
        fallos.append("%s %d px: body cae a serif (%s)" % (etiqueta, ancho, datos["fuente"]))
    if datos["errores"]:
        fallos.append("%s %d px: consola con %d error(es)" % (etiqueta, ancho, len(datos["errores"])))
    if not datos["texto"]:
        fallos.append("%s %d px: pagina sin texto" % (etiqueta, ancho))


def capturar(navegador, url: str, ancho: int, alto: int, destino: pathlib.Path,
             movil: bool = False) -> dict:
    contexto = navegador.new_context(
        viewport={"width": ancho, "height": alto},
        is_mobile=movil,
        has_touch=movil,
        user_agent=IPHONE_UA if movil else None,
    )
    pagina = contexto.new_page()
    datos = medir(pagina, url)
    pagina.screenshot(path=str(destino), full_page=True)
    pagina.close()
    contexto.close()
    return datos


def main() -> int:
    parser = argparse.ArgumentParser(description="Responsive del sitio por tipo de pieza.")
    parser.add_argument("--pagina", default=str(PAGINA))
    parser.add_argument("--tipo", default="landing",
                        choices=("landing", "app-movil", "web-app", "pieza-3d"))
    args = parser.parse_args()
    pagina = pathlib.Path(args.pagina).resolve()
    if not pagina.exists():
        raise SystemExit("site/index.html no existe: correr scripts/gen_site.py primero.")
    AUDIT.mkdir(exist_ok=True)
    fallos: list[str] = []
    url = pagina.as_uri()
    tipo = args.tipo

    with sync_playwright() as p:
        navegador = p.chromium.launch()

        if tipo == "app-movil":
            datos = capturar(navegador, url, 1440, 900, AUDIT / "app-movil-1440.png")
            revisar(fallos, "escena", datos, 1440)
            bisel = datos["bisel"]
            if not bisel:
                fallos.append("escena: no hay .bisel que medir")
            else:
                if not 380 <= bisel["width"] <= 400:
                    fallos.append("escena: bisel de %.0f px (esperado 390)" % bisel["width"])
                if not 838 <= bisel["height"] <= 850:
                    fallos.append("escena: bisel de %.0f px de alto (esperado 844)" % bisel["height"])
            print("escena     1440x900  bisel %.0f x %.0f"
                  % (bisel["width"], bisel["height"]) if bisel else "escena     1440x900  sin bisel")

            movil = capturar(navegador, url, 390, 844, AUDIT / "app-movil-390.png", movil=True)
            revisar(fallos, "pantalla", movil, 390)
            if not movil["pantalla"]:
                fallos.append("pantalla: no hay .pantalla dentro del bisel")
            elif movil["pantalla"]["height"] < 600:
                fallos.append("pantalla: %.0f px de alto, el contenido no llena el bisel"
                              % movil["pantalla"]["height"])
            if not movil["tactil"]:
                fallos.append("pantalla: la emulacion no reporta pantalla tactil")
            print("pantalla    390x844  pantalla %.0f x %.0f  tactil %s"
                  % (movil["pantalla"]["width"], movil["pantalla"]["height"], movil["tactil"])
                  if movil["pantalla"] else "pantalla    390x844  sin pantalla")
        else:
            vistas = VISTAS if tipo == "landing" else ESCENA
            for ancho, alto, etiqueta in vistas:
                destino = AUDIT / ("%s-%d.png" % (tipo, ancho))
                datos = capturar(navegador, url, ancho, alto, destino)
                revisar(fallos, etiqueta, datos, ancho)
                print("%-10s %4d px  scroll %d/%d  cuerpo %.0f px  desbordes %d"
                      % (etiqueta, ancho, datos["scrollWidth"], datos["clientWidth"],
                         datos["cuerpo"], len(datos["desbordes"])))
            if tipo != "landing":
                datos = capturar(navegador, url, 390, 844, AUDIT / ("%s-390.png" % tipo), movil=True)
                revisar(fallos, "movil", datos, 390)
                print("movil       390 px  scroll %d/%d" % (datos["scrollWidth"], datos["clientWidth"]))

        navegador.close()

    for f in fallos:
        print("FAIL " + f)
    if not fallos:
        print("OK: responsive de %s sin scroll horizontal, cuerpo >= 14 px, consola limpia" % tipo)
        print("OK: capturas en audit/%s-*.png" % tipo)
    return 1 if fallos else 0


if __name__ == "__main__":
    sys.exit(main())
