#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""Exporta el plan de rodaje a PDF sin abrir el navegador a mano.

Uso:
    python tools/exportar_pdf.py                        # script/teleprompter.html -> script/guion_rodaje.pdf
    python tools/exportar_pdf.py --html tmp/x.html --out tmp/x.pdf

El PDF sale del mismo HTML del teleprompter, usando el bloque #papel y la hoja
@media print. No imprime controles ni el panel de rodaje: solo la ficha.
"""
from __future__ import annotations

import argparse
import io
import sys
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent


def _utf8() -> None:
    if hasattr(sys.stdout, "buffer"):
        sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")


def exportar(html: Path, salida: Path) -> Path:
    from playwright.sync_api import sync_playwright

    salida.parent.mkdir(parents=True, exist_ok=True)
    url = html.resolve().as_uri()

    with sync_playwright() as p:
        navegador = None
        ultimo = None
        for intento in ({}, {"channel": "chrome"}, {"channel": "msedge"}):
            try:
                navegador = p.chromium.launch(**intento)
                break
            except Exception as exc:  # noqa: BLE001
                ultimo = exc
        if navegador is None:
            raise SystemExit(f"Sin navegador para imprimir: {ultimo}")

        pagina = navegador.new_page()
        pagina.goto(url, wait_until="load")
        pagina.wait_for_timeout(400)
        pagina.emulate_media(media="print")
        pagina.pdf(
            path=str(salida),
            format="A4",
            print_background=True,
            margin={"top": "13mm", "right": "12mm", "bottom": "12mm", "left": "12mm"},
        )
        navegador.close()
    return salida


def main() -> int:
    _utf8()
    ap = argparse.ArgumentParser(description="Plan de rodaje -> PDF")
    ap.add_argument("--html", default=str(RAIZ / "script" / "teleprompter.html"))
    ap.add_argument("--out", default=str(RAIZ / "script" / "guion_rodaje.pdf"))
    args = ap.parse_args()

    html = Path(args.html)
    if not html.exists():
        raise SystemExit(f"No existe {html}. Genera primero el teleprompter.")
    destino = exportar(html, Path(args.out))

    # Si el PDF salio al lugar de trabajo (`script/`), se copia a la carpeta
    # servible para que se pueda abrir y descargar desde el workbench.
    try:
        destino.resolve().relative_to((RAIZ / "script").resolve())
        sys.path.insert(0, str(RAIZ / "tools"))
        from publicar_entregables import publicar, reindexar

        if publicar(destino, "guion_rodaje.pdf"):
            reindexar()
            print("    -> publicado en dashboard/entregables/guion_rodaje.pdf")
    except ValueError:
        pass
    except Exception as exc:  # noqa: BLE001
        print("    ! no se pudo publicar en dashboard/entregables: %s" % exc)

    kb = destino.stat().st_size / 1024
    try:
        nombre = destino.relative_to(RAIZ)
    except ValueError:
        nombre = destino
    print(f"OK  {nombre}  {kb:.0f} kB")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
