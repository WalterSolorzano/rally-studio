#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Extrae las secciones repetidas de skills/*/SKILL.md a skills/_comun/ y deja un puntero.

Las cinco secciones transversales (nombre, enseñanza visual, guiones, 3D, elementos
gráficos) se copiaban casi idénticas en cada skill. Este script:

1. Agrupa cada sección por texto normalizado (hash).
2. Elige como canónica la variante más larga del grupo mayoritario.
3. Escribe `skills/_comun/<slug>.md` con esa variante.
4. Reemplaza la sección en cada SKILL.md que la tenía por un puntero de dos líneas.

No toca el motor. Idempotente: si la sección ya es un puntero, no la repite.

Uso:
    python tools/unificar_comun.py --dry-run
    python tools/unificar_comun.py
    python tools/unificar_comun.py --reportar
"""
from __future__ import annotations

import argparse
import hashlib
import json
import re
from collections import defaultdict
from pathlib import Path

RAIZ = Path(__file__).resolve().parents[1]
SKILLS = RAIZ / "skills"
COMUN = SKILLS / "_comun"

# encabezado exacto -> slug del archivo compartido
SECCIONES = {
    "## Cómo sugerir un título o nombre de proyecto o producto": "nombres.md",
    "## Cómo enseñar visualmente": "ensenanza-visual.md",
    "## Cómo redactar guiones cuidando la pronunciación y el orden de palabras": "guiones.md",
    "## Cómo crear modelos 3D (referencia)": "modelos-3d.md",
    "## Cómo sugerir elementos gráficos": "elementos-graficos.md",
}

# el título alterno que usan algunas skills para la sección de 3D
ALIAS_3D = ("## Cómo crear modelos 3D", "## Cómo crear modelos 3D (referencia)")


def normaliza(t: str) -> str:
    return re.sub(r"\s+", " ", t).strip()


def partir(texto: str):
    """Devuelve (cabeza, [(encabezado, cuerpo_completo)], cola_fuera).

    Cada bloque va desde su `## ` hasta el siguiente `## ` de nivel 2.
    """
    lineas = texto.splitlines(keepends=True)
    idx = [i for i, l in enumerate(lineas) if l.startswith("## ")]
    if not idx:
        return texto, [], ""
    bloques = []
    for n, i in enumerate(idx):
        fin = idx[n + 1] if n + 1 < len(idx) else len(lineas)
        bloques.append("".join(lineas[i:fin]))
    cabeza = "".join(lineas[: idx[0]])
    # los encabezados de nivel 3+ viven dentro del bloque, así que no hay cola suelta
    return cabeza, bloques, ""


def encabezado(bloque: str) -> str:
    return bloque.splitlines()[0].strip()


def slug_de(enc: str):
    for clave, slug in SECCIONES.items():
        if enc.startswith(clave.split(" (")[0]):
            return slug
    if enc.startswith(ALIAS_3D[0]):
        return SECCIONES["## Cómo crear modelos 3D (referencia)"]
    return None


def recolectar():
    """slug -> {hash: (cuerpo, [skills])}"""
    datos = defaultdict(lambda: defaultdict(lambda: {"cuerpo": "", "skills": []}))
    for f in sorted(SKILLS.glob("*/SKILL.md")):
        texto = f.read_text(encoding="utf-8")
        _, bloques, _ = partir(texto)
        for b in bloques:
            slug = slug_de(encabezado(b))
            if not slug:
                continue
            h = hashlib.md5(normaliza(b).encode("utf-8")).hexdigest()[:8]
            slot = datos[slug][h]
            if not slot["cuerpo"]:
                slot["cuerpo"] = b
            slot["skills"].append(f.parent.name)
    return datos


def canonico(grupos):
    """(cuerpo canónico, hash, nº de skills) de la variante dominante."""
    orden = sorted(grupos.items(), key=lambda kv: (-len(kv[1]["skills"]), -len(kv[1]["cuerpo"])))
    h, slot = orden[0]
    return slot["cuerpo"], h, len(slot["skills"])


PUNTERO = "## {titulo}\nCompartido: `skills/_comun/{slug}`. Léelo antes de aplicar esta sección.\n\n"


def reescribir(dry: bool, forzar: bool = False):
    datos = recolectar()
    plan = {}
    for slug, grupos in datos.items():
        cuerpo, h, n = canonico(grupos)
        plan[slug] = {"cuerpo": cuerpo, "hash": h, "skills": n,
                      "variantes": {k: len(v["skills"]) for k, v in grupos.items()}}
    if dry:
        return plan

    COMUN.mkdir(parents=True, exist_ok=True)
    for slug, p in plan.items():
        destino = COMUN / slug
        # idempotente: el canónico ya escrito manda; no se degrada en la segunda pasada
        if destino.exists() and not forzar:
            continue
        destino.write_text(p["cuerpo"].rstrip() + "\n", encoding="utf-8")

    # solo se reemplaza lo que es subconjunto del canónico: una variante con más
    # contenido propio (p. ej. el procedimiento 3D real) se queda donde está.
    reemplazables = {}
    for slug, p in plan.items():
        destino = COMUN / slug
        canon_txt = normaliza(destino.read_text(encoding="utf-8")).strip() if destino.exists() \
            else normaliza(p["cuerpo"]).strip()
        ok = set()
        for v in datos[slug].values():
            if normaliza(v["cuerpo"]).strip() in canon_txt:
                ok.add(hashlib.md5(normaliza(v["cuerpo"]).encode("utf-8")).hexdigest()[:8])
        reemplazables[slug] = ok

    conservados = []
    tocados = []
    for f in sorted(SKILLS.glob("*/SKILL.md")):
        texto = f.read_text(encoding="utf-8")
        cabeza, bloques, _ = partir(texto)
        nuevo = []
        cambios = 0
        for b in bloques:
            slug = slug_de(encabezado(b))
            if slug and len(b) > 120 and "Compartido:" not in b:
                h = hashlib.md5(normaliza(b).encode("utf-8")).hexdigest()[:8]
                if h in reemplazables[slug]:
                    titulo = encabezado(b).lstrip("# ").strip()
                    nuevo.append(PUNTERO.format(titulo=titulo, slug=slug))
                    cambios += 1
                    continue
                conservados.append(f"{f.parent.name}::{encabezado(b)[3:][:40]}")
            nuevo.append(b)
        if cambios:
            f.write_text(cabeza + "".join(nuevo), encoding="utf-8")
            tocados.append((f.parent.name, cambios))
    return plan, tocados, conservados


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--dry-run", action="store_true")
    ap.add_argument("--reportar", action="store_true")
    ap.add_argument("--json", action="store_true")
    ap.add_argument("--forzar", action="store_true")
    args = ap.parse_args()

    if args.dry_run:
        plan = reescribir(True)
        for slug, p in plan.items():
            print(f"{slug:22s} canonico {p['hash']} en {p['skills']} skills | variantes {p['variantes']}")
        return
    plan, tocados, conservados = reescribir(False, args.forzar)
    total = sum(c for _, c in tocados)
    print(f"OK  _comun={len(plan)}  skills_tocadas={len(tocados)}  secciones_reemplazadas={total}")
    for nombre, c in tocados:
        print(f"    {nombre}: {c}")
    if conservados:
        print(f"    conservadas por tener contenido propio: {len(conservados)}")
        for c in conservados:
            print(f"      {c}")
    if args.json:
        print(json.dumps({k: {kk: vv for kk, vv in v.items() if kk != 'cuerpo'} for k, v in plan.items()},
                         ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
