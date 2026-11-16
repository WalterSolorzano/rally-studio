#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""Publica los entregables dentro de la unica raiz que sirve el workbench.

`rally_service.py` sirve solo `dashboard/` (rally_service.py:363-365), asi que un
archivo que vive en `script/` no se puede abrir desde el navegador del equipo.
Este modulo copia el entregable a `dashboard/entregables/` y reescribe el indice
que lo lista. El original no se mueve: `script/` sigue siendo el lugar de trabajo.

Uso:
    python tools/publicar_entregables.py            # republica lo que exista e indexa
    python tools/publicar_entregables.py --lista    # solo muestra el indice
"""
from __future__ import annotations

import argparse
import io
import shutil
import sys
from datetime import datetime
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
DESTINO = RAIZ / "dashboard" / "entregables"

# lo que se publica por defecto: (origen, nombre en el indice, etiqueta)
CATALOGO = [
    ("script/teleprompter.html", "teleprompter.html", "Plan de rodaje"),
    ("script/guion_rodaje.pdf", "guion_rodaje.pdf", "Ficha en papel"),
    ("docs/storyboard_visual.html", "storyboard.html", "Tablero de tomas"),
    ("dashboard/data/stats.generated.js", None, None),  # se ignora: no es entregable
]

ETIQUETAS = {
    "teleprompter.html": "Plan de rodaje",
    "guion_rodaje.pdf": "Ficha en papel",
    "storyboard.html": "Tablero de tomas",
    "manifest.webmanifest": "Manifiesto de la app",
}


def _utf8() -> None:
    if hasattr(sys.stdout, "buffer"):
        sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")


def publicar(origen: Path, nombre: str | None = None) -> Path | None:
    """Copia un archivo a dashboard/entregables/. Devuelve el destino o None."""
    origen = Path(origen)
    if not origen.exists():
        return None
    DESTINO.mkdir(parents=True, exist_ok=True)
    destino = DESTINO / (nombre or origen.name)
    if destino.resolve() == origen.resolve():
        return destino
    shutil.copy2(origen, destino)
    return destino


def publicar_hermanos(html: Path) -> list[Path]:
    """Copia el HTML y los archivos que lo acompanan (manifest e iconos)."""
    copiados = []
    for extra in ("manifest.webmanifest", "icono-192.png", "icono-512.png"):
        vecino = Path(html).parent / extra
        copiado = publicar(vecino)
        if copiado:
            copiados.append(copiado)
    return copiados


def _kb(p: Path) -> str:
    kb = p.stat().st_size / 1024
    return f"{kb/1024:.1f} MB" if kb > 1024 else f"{kb:.0f} kB"


def reindexar() -> Path:
    """Reescribe dashboard/entregables/index.html con lo que hay en la carpeta."""
    DESTINO.mkdir(parents=True, exist_ok=True)
    archivos = sorted(
        [p for p in DESTINO.iterdir() if p.is_file() and p.name not in {"index.html"}
         and p.suffix.lower() in {".html", ".pdf"}],
        key=lambda p: p.name,
    )
    filas = []
    for p in archivos:
        fecha = datetime.fromtimestamp(p.stat().st_mtime).strftime("%d %b %H:%M")
        etiqueta = ETIQUETAS.get(p.name, p.stem.replace("_", " "))
        filas.append(
            f'<a class="fila" href="{p.name}"><b>{etiqueta}</b>'
            f'<span>{p.name}</span><i>{_kb(p)}</i><i>{fecha}</i></a>'
        )
    if not filas:
        filas.append('<p class="vacio">Sin entregables publicados.</p>')

    html = """<!doctype html>
<html lang="es"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light">
<title>Entregables</title>
<style>
:root{--ink:#0d1b35;--muted:#8fa0b8;--line:#dce7f5;--primary:#0866f5;
--mono:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;
--sans:system-ui,-apple-system,"Segoe UI",Roboto,sans-serif}
*{box-sizing:border-box}
body{margin:0;background:#fff;color:var(--ink);font-family:var(--sans);
-webkit-font-smoothing:antialiased}
main{max-width:640px;margin:0 auto;padding:28px 20px 60px}
h1{margin:0 0 2px;font-size:22px;letter-spacing:-.01em}
p.sub{margin:0 0 22px;font-family:var(--mono);font-size:11px;color:var(--muted);
letter-spacing:.04em;text-transform:uppercase}
.fila{display:grid;grid-template-columns:1fr auto auto;gap:14px;align-items:baseline;
padding:14px 2px;border-bottom:1px solid var(--line);text-decoration:none;color:inherit}
.fila:first-of-type{border-top:1px solid var(--line)}
.fila b{font-weight:600;font-size:15px}
.fila span{grid-column:1;font-family:var(--mono);font-size:11px;color:var(--muted)}
.fila i{font-style:normal;font-family:var(--mono);font-size:11px;color:var(--muted)}
.fila:hover b{color:var(--primary)}
.vacio{color:var(--muted);font-family:var(--mono);font-size:12px}
a.volver{display:inline-block;margin-top:26px;font-family:var(--mono);font-size:11px;
color:var(--muted);text-decoration:none;letter-spacing:.04em}
a.volver:hover{color:var(--primary)}
</style></head><body><main>
<h1>Entregables</h1>
<p class="sub">lo que se copia al telefono o se imprime</p>
""" + "\n".join(filas) + """
<a class="volver" href="../index.html">&#8592; workbench</a>
</main></body></html>
"""
    destino = DESTINO / "index.html"
    destino.write_text(html, encoding="utf-8")
    return destino


def main() -> int:
    _utf8()
    ap = argparse.ArgumentParser(description="Publica los entregables en dashboard/entregables/")
    ap.add_argument("--lista", action="store_true", help="solo listar el indice actual")
    args = ap.parse_args()

    if not args.lista:
        for ruta, nombre, _ in CATALOGO:
            if nombre is None:
                continue
            if publicar(RAIZ / ruta, nombre):
                print("  publicado " + nombre)
        for extra in ("manifest.webmanifest", "icono-192.png", "icono-512.png"):
            publicar(RAIZ / "script" / extra)

    indice = reindexar()
    publicados = [p.name for p in DESTINO.iterdir() if p.is_file() and p.name != "index.html"]
    print("OK  %s  (%d archivos)" % (indice.relative_to(RAIZ), len(publicados)))
    for p in sorted(publicados):
        print("    " + p)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
