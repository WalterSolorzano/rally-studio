#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""Busca repeticiones y fallas estructurales en el repositorio.

No corrige nada: mide. Salida legible por consola y JSON en `docs/auditoria.json`.

Que mide:
1. Funciones con el mismo nombre definidas en varios archivos (logica copiada).
2. Utilidades copiadas (shims de utf8, lectores de json, helpers de color).
3. Literales repetidos que deberian vivir en un solo sitio (colores, fracciones
   de acto, nombres de carpeta).
4. Archivos con contenido identico (md5) entre los versionados.
5. Archivos versionados que nadie menciona (posible basura).
6. Carpetas de primer nivel y su peso versionado.

Uso:
    python tools/auditar_repeticiones.py
    python tools/auditar_repeticiones.py --top 15
"""
from __future__ import annotations

import argparse
import collections
import hashlib
import json
import re
import subprocess
import sys
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
SALIDA = RAIZ / "docs" / "auditoria.json"

TEXTO = {".py", ".js", ".html", ".css", ".md", ".json", ".csv", ".yaml", ".yml"}
IGNORAR_DIR = {
    ".git", "node_modules", "__pycache__", "tmp", ".playwright-mcp", ".superpowers",
    ".impeccable", "audit", ".opencode", ".agents", "assets", "graphify-out",
    "research", "dossier_latam_2026", "plantillas",
}

DEF_RE = re.compile(r"^(?:async\s+)?def\s+([a-zA-Z_][\w]*)\s*\(", re.M)
FN_RE = re.compile(r"^(?:export\s+)?function\s+([a-zA-Z_$][\w$]*)\s*\(", re.M)
HEX_RE = re.compile(r"#[0-9a-fA-F]{6}\b")
FRAC_RE = re.compile(r"\b(17|33|29|21)\b")


def versionados() -> list[str]:
    try:
        out = subprocess.run(
            ["git", "ls-files"], cwd=RAIZ, capture_output=True, text=True, timeout=60,
            encoding="utf-8", errors="replace")
        return [l.strip() for l in out.stdout.splitlines() if l.strip()]
    except Exception:  # noqa: BLE001
        return []


def peso(rel: str) -> int:
    try:
        return (RAIZ / rel).stat().st_size
    except OSError:
        return 0


def leer(rel: str) -> str:
    try:
        return (RAIZ / rel).read_text(encoding="utf-8", errors="replace")
    except OSError:
        return ""


def main() -> int:
    ap = argparse.ArgumentParser(description="Repeticiones y basura del repositorio")
    ap.add_argument("--top", type=int, default=12)
    args = ap.parse_args()
    sys.stdout.reconfigure(encoding="utf-8")

    archivos = versionados()
    codigo = [f for f in archivos if Path(f).suffix.lower() in TEXTO
              and not (set(Path(f).parts) & IGNORAR_DIR)]

    defs: dict[str, list[str]] = collections.defaultdict(list)
    herencia: dict[str, list[str]] = collections.defaultdict(list)
    for rel in codigo:
        texto = leer(rel)
        if not texto:
            continue
        for m in DEF_RE.finditer(texto):
            defs[m.group(1)].append(rel)
        for m in FN_RE.finditer(texto):
            defs[m.group(1)].append(rel)
        if "reconfigure(encoding=\"utf-8\")" in texto or "TextIOWrapper(sys.stdout.buffer" in texto:
            herencia["shim_utf8"].append(rel)
        if "def _leer(" in texto or "def _json(" in texto:
            herencia["lectores_repetidos"].append(rel)
        if len(HEX_RE.findall(texto)) >= 8:
            herencia["paleta_local"].append(rel)
        if len(FRAC_RE.findall(texto)) >= 3:
            herencia["fracciones_acto"].append(rel)

    repetidas = {k: sorted(set(v)) for k, v in defs.items() if len(set(v)) > 1}

    # contenido identico
    huellas: dict[str, list[str]] = collections.defaultdict(list)
    for rel in archivos:
        if Path(rel).suffix.lower() not in TEXTO:
            continue
        p = RAIZ / rel
        try:
            huellas[hashlib.md5(p.read_bytes()).hexdigest()].append(rel)
        except OSError:
            continue
    identicos = [v for v in huellas.values() if len(v) > 1]

    # carpetas de primer nivel
    carpetas: dict[str, list[int]] = collections.defaultdict(lambda: [0, 0])
    for rel in archivos:
        raiz = rel.split("/")[0] if "/" in rel else "(archivo suelto)"
        carpetas[raiz][0] += 1
        carpetas[raiz][1] += peso(rel)

    # huerfanos: nombre de archivo que no aparece en ningun otro archivo
    nombres = {rel: Path(rel).name for rel in archivos
               if Path(rel).suffix.lower() in {".py", ".js", ".html", ".json", ".md"}}
    corpus = "\n".join(leer(r) for r in codigo if Path(r).suffix.lower() in {".py", ".js", ".html", ".md", ".json"})
    huerfanos = sorted(rel for rel, nom in nombres.items()
                       if corpus.count(nom) <= 1 and not rel.startswith(("docs/", "README"))
                       and Path(rel).name not in {"__init__.py", "AGENTS.md"})

    datos = {
        "versionados": len(archivos),
        "peso_total_kb": round(sum(peso(r) for r in archivos) / 1024, 1),
        "codigo_analizado": len(codigo),
        "funciones_repetidas": {k: v for k, v in sorted(repetidas.items(), key=lambda kv: -len(kv[1]))},
        "utilidades_copiadas": {k: sorted(set(v)) for k, v in herencia.items()},
        "archivos_identicos": identicos,
        "carpetas": {k: {"archivos": v[0], "kb": round(v[1] / 1024, 1)}
                     for k, v in sorted(carpetas.items(), key=lambda kv: -kv[1][1])},
        "huerfanos": huerfanos,
    }
    SALIDA.write_text(json.dumps(datos, ensure_ascii=False, indent=2), encoding="utf-8")

    print("versionados=%d  peso=%.1f MB  analizados=%d"
          % (datos["versionados"], datos["peso_total_kb"] / 1024, datos["codigo_analizado"]))
    print("\nFUNCIONES CON EL MISMO NOMBRE EN VARIOS ARCHIVOS")
    for nombre, donde in list(datos["funciones_repetidas"].items())[:args.top]:
        print("  %-28s %d archivos" % (nombre, len(donde)))
    print("\nUTILIDADES COPIADAS")
    for clave, donde in datos["utilidades_copiadas"].items():
        print("  %-22s %2d archivos" % (clave, len(donde)))
    print("\nARCHIVOS CON CONTENIDO IDENTICO")
    for grupo in identicos[:args.top]:
        print("  " + " == ".join(grupo))
    if not identicos:
        print("  (ninguno)")
    print("\nCARPETAS POR PESO")
    for raiz, info in list(datos["carpetas"].items())[:args.top]:
        print("  %-26s %5d archivos %8.1f MB" % (raiz, info["archivos"], info["kb"] / 1024))
    print("\nHUERFANOS (nadie los nombra): %d" % len(huerfanos))
    for rel in huerfanos[:args.top]:
        print("  " + rel)
    print("\n-> %s" % SALIDA.relative_to(RAIZ))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
