"""Inventario de recursos que el chat puede mostrar: `assets/recursos.json`.

El chat del workbench no puede pedirle al modelo que liste carpetas (las reglas
fijas de `scripts/rally_service.py` prohíben herramientas y shell). Así que el
inventario se genera aquí y el panel se lo entrega al modelo ya filtrado: el
modelo solo cita una ruta exacta y el navegador la pinta.

Uso:
    python scripts/gen_recursos.py

Se vuelve a correr cuando entren assets nuevos. No borra nada.
"""

from __future__ import annotations

import argparse
import datetime as dt
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SALIDA = ROOT / "assets" / "recursos.json"

# Carpetas que el chat sabe mostrar (deben coincidir con CARPETAS de chat.js).
CARPETAS = [
    "assets", "docs", "design", "designs", "script", "site",
    "budget", "brain", "knowledge", "research", "brand", "plantillas",
]

# Extensiones útiles para el chat. Fuera: binarios, caché, salidas del grafo.
TIPOS = {
    "imagen": {".png", ".jpg", ".jpeg", ".webp", ".gif", ".svg", ".avif"},
    "video": {".mp4", ".webm", ".mov", ".m4v", ".ogv"},
    "audio": {".mp3", ".wav", ".ogg", ".m4a", ".aac"},
    "texto": {".md", ".txt", ".csv", ".json", ".jsonl", ".py", ".js", ".css",
              ".html", ".yml", ".yaml", ".tsv", ".srt", ".vtt"},
    "pdf": {".pdf"},
}

# Nunca: pesados, generados o privados.
EXCLUIR_DIR = {"node_modules", ".git", "__pycache__", "graphify-out", ".playwright-mcp",
               ".venv", "venv", ".opencode", ".agents", ".superpowers"}
EXCLUIR_ARCHIVO = {"assets/recursos.json"}
# Subárboles que no son recursos del proyecto: la base scrapeada de SIRLI tiene
# miles de miniaturas y el chat no las necesita.
EXCLUIR_PREFIJO = ("research/sirli/", "assets/readme/_")
MAX_BYTES = 8 * 1024 * 1024   # 8 MB: más que eso no se muestra en el panel


def tipo_de(sufijo: str) -> str | None:
    for nombre, set_ in TIPOS.items():
        if sufijo in set_:
            return nombre
    return None


def recorrer() -> list[dict]:
    filas: list[dict] = []
    for carpeta in CARPETAS:
        base = ROOT / carpeta
        if not base.is_dir():
            continue
        for archivo in base.rglob("*"):
            if not archivo.is_file():
                continue
            rel = archivo.relative_to(ROOT).as_posix()
            if rel in EXCLUIR_ARCHIVO:
                continue
            if rel.startswith(EXCLUIR_PREFIJO):
                continue
            if any(parte in EXCLUIR_DIR for parte in rel.split("/")):
                continue
            tipo = tipo_de(archivo.suffix.lower())
            if not tipo:
                continue
            try:
                kb = archivo.stat().st_size / 1024
                cuando = dt.datetime.fromtimestamp(archivo.stat().st_mtime).strftime("%Y-%m-%d")
            except OSError:
                continue
            if archivo.stat().st_size > MAX_BYTES:
                continue
            filas.append({"p": rel, "t": tipo, "kb": round(kb, 1), "f": cuando})
    filas.sort(key=lambda f: (f["t"], f["p"]))
    return filas


def main(argv=None) -> int:
    parser = argparse.ArgumentParser(
        description="Reinventaria assets/recursos.json para el chat del workbench."
    )
    parser.add_argument(
        "--si",
        action="store_true",
        help="escribe aunque el inventario salga vacio",
    )
    args = parser.parse_args(argv)
    filas = recorrer()
    if not filas and not args.si:
        # Un inventario vacio deja el panel sin recursos y parece un fallo del motor.
        print("ALTO: sin archivos que inventariar. assets/recursos.json se queda como esta.")
        return 1
    conteo: dict[str, int] = {}
    for f in filas:
        conteo[f["t"]] = conteo.get(f["t"], 0) + 1
    datos = {
        "generado": dt.datetime.now().strftime("%Y-%m-%d %H:%M"),
        "nota": "Inventario para el chat del workbench. Regenerar con python scripts/gen_recursos.py",
        "conteo": conteo,
        "archivos": filas,
    }
    SALIDA.parent.mkdir(parents=True, exist_ok=True)
    SALIDA.write_text(json.dumps(datos, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    print(f"{SALIDA.relative_to(ROOT)} -> {len(filas)} archivos {conteo} "
          f"({SALIDA.stat().st_size / 1024:.1f} kB)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
