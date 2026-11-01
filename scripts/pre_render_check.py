#!/usr/bin/env python3
"""
pre_render_check.py -- Bloquea el render si las dependencias de una toma no
estran "integrado".

Lee script/shotlist.csv y, para cada depends_on del shot_id dado:
  - dep no existe -> error
  - dep status != "integrado" -> error "toma '{dep}' no entregada (status={status})"

Uso:
    python scripts/pre_render_check.py <shot_id>

Exit 0 si todo integrado; exit 1 con errores impresos.
"""
import csv
import sys
from pathlib import Path

RAIZ = Path(__file__).resolve().parents[1]
SHOTLIST = RAIZ / "script" / "shotlist.csv"


def _v(valor):
    if valor is None:
        return []
    if isinstance(valor, list):
        return [str(x).strip() for x in valor if str(x).strip()]
    return [t.strip() for t in str(valor).split(",") if t.strip()]


def _cargar_filas(csv_path):
    filas = []
    if not csv_path.exists():
        return filas
    with csv_path.open(newline="", encoding="utf-8") as f:
        for row in csv.DictReader(f):
            filas.append(row)
    return filas


def check(shot_id, filas):
    """Devuelve errores de dependencias para shot_id (lista vacia = ok)."""
    errores = []
    shot = None
    for f in filas:
        if f.get("id") == shot_id:
            shot = f
            break
    if shot is None:
        errores.append(f"toma '{shot_id}' no existe en shotlist")
        return errores
    ids = {f.get("id") for f in filas}
    for dep in _v(shot.get("depends_on")):
        if dep not in ids:
            errores.append(f"toma '{shot_id}': depends_on '{dep}' no existe en shotlist")
        else:
            dep_row = next(f for f in filas if f.get("id") == dep)
            status = str(dep_row.get("status", "")).strip()
            if status != "integrado":
                errores.append(f"toma '{dep}' no entregada (status={status})")
    return errores


def main(argv=None):
    argv = sys.argv[1:] if argv is None else argv
    if len(argv) != 1:
        print("Uso: python scripts/pre_render_check.py <shot_id>")
        return 2
    shot_id = argv[0]
    filas = _cargar_filas(SHOTLIST)
    errores = check(shot_id, filas)
    for e in errores:
        print(e)
    return 1 if errores else 0


if __name__ == "__main__":
    sys.exit(main())
