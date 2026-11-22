"""Verifica un guion de rally contra las reglas medibles del certamen.

Reglas (knowledge/rubric_matrices.md 3 y AGENTS.md):
  1. Duracion <= 120 s medidos en el audio, con las palabras por minuto declaradas.
  2. El nombre del proyecto no aparece en los primeros 20 s.
  3. Sin patrones de prosa generica (SLOP_IA) ni frases prohibidas.

Uso:
    python scripts/verificar_guion.py script/script.md
    python scripts/verificar_guion.py guion.txt --nombre "Cacao Norte" --wpm 135

Si no se pasa --nombre, se lee `project_name` de brief.json. Un brief vacio no es
error: la regla del nombre se informa como no medible.
"""

from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
if str(RAIZ) not in sys.path:
    sys.path.insert(0, str(RAIZ))

from scripts.check_anti_generico import (  # noqa: E402
    chequear_forbidden_phrases,
    chequear_slop_ia,
)

WPM_POR_DEFECTO = 130
# Rango humano de locucion. Fuera de ahi el numero no describe a nadie: 0 revienta
# la division y 100000 "hace entrar" cualquier guion en 120 s. Un tope inventado
# no es una medicion, es una forma de saltarse la regla.
WPM_MIN = 60
WPM_MAX = 240
TOPE_SEGUNDOS = 120
SEGUNDOS_SIN_NOMBRE = 20
ACENTOS = str.maketrans("áéíóúüñÁÉÍÓÚÜÑ", "aeiouunAEIOUUN")


def _plano(texto: str) -> str:
    return str(texto).translate(ACENTOS).lower()


ETIQUETA = re.compile(r"^\s*\*\*(.+?)\*\*\s*$")
MARCAS_DE_NARRACION = ("narraci", "voz en off", "locuci", "texto en camara", "texto en cámara")


def _bloques(texto: str) -> list[tuple[str, list[list[str]]]]:
    """Parte por encabezado markdown o etiqueta en negrita suelta."""
    bloques: list[tuple[str, list[list[str]]]] = [("", [[]])]
    for linea in texto.splitlines():
        titulo = None
        if re.match(r"^\s*#{1,6}\s", linea):
            titulo = linea
        else:
            etiqueta = ETIQUETA.match(linea)
            if etiqueta:
                titulo = etiqueta.group(1)
        if titulo is not None:
            bloques.append((_plano(titulo), [[]]))
            continue
        if not linea.strip():
            bloques[-1][1].append([])
            continue
        bloques[-1][1].append([linea])
    return [(titulo, ["\n".join(g) for g in grupos if g]) for titulo, grupos in bloques]


def lineas_narradas(texto: str) -> list[str]:
    """Solo lo que se dice en voz alta.

    Tres reglas, aprendidas midiendo guiones reales:
      1. Si hay una etiqueta de narracion ("Narracion", "Voz en off"), manda esa.
      2. Si no, valen los bloques de acto.
      3. Dentro del bloque se descarta todo lo que no se pronuncia: tablas de tomas,
         vinetas, etiquetas, marcas [FALTA], reglas de produccion y encabezados.
    La cita en blockquote (`>`) si se conserva: es una forma comun de marcar lo hablado.
    """
    bloques = _bloques(texto)
    narracion = [
        cuerpo
        for titulo, cuerpo in bloques
        if any(marca in titulo for marca in MARCAS_DE_NARRACION)
    ]
    if not narracion:
        narracion = [
            cuerpo for titulo, cuerpo in bloques if re.search(r"\bacto\b|\bact\b", titulo)
        ]
    if not narracion:
        narracion = [cuerpo for _, cuerpo in bloques]
    crudo = "\n".join(cuerpo for grupo in narracion for cuerpo in grupo)

    lineas = []
    for linea in crudo.splitlines():
        limpia = linea.strip()
        if limpia.startswith(">"):
            limpia = limpia.lstrip(">").strip()
        if not limpia:
            continue
        if limpia.startswith(("#", "|", "*", "---", "**")):
            continue
        if re.match(r"^\d+\.\s", limpia) or limpia.startswith("- "):
            continue
        if re.match(r"^(acto|escena|shot|toma|imagen|tomas)\b", _plano(limpia)):
            continue
        if "[falta" in _plano(limpia):
            # Una marca dentro de una oracion no borra la oracion: se quita la marca.
            limpia = re.sub(r"\[falta[^\]]*\]", " ", limpia, flags=re.IGNORECASE)
            limpia = re.sub(r"\s{2,}", " ", limpia).strip()
            if len(limpia.split()) < 3:
                continue
        lineas.append(limpia)
    return lineas


def texto_narrado(texto: str) -> str:
    return "\n".join(lineas_narradas(texto))


def palabras(texto: str) -> list[str]:
    """Solo la narracion, ya limpia."""
    return re.findall(r"[A-Za-zÁÉÍÓÚÜÑáéíóúüñ0-9$.,]+", texto_narrado(texto))


def verificar(texto: str, nombre: str | None = None, wpm: int = WPM_POR_DEFECTO) -> dict:
    fallos: list[str] = []
    if not isinstance(wpm, (int, float)) or not WPM_MIN <= wpm <= WPM_MAX:
        fallos.append(
            f"wpm declarado {wpm!r} fuera del rango de locucion ({WPM_MIN}-{WPM_MAX}); "
            f"se mide con {WPM_POR_DEFECTO} wpm. Declarar una velocidad imposible no "
            "acorta el video"
        )
        wpm = WPM_POR_DEFECTO
    narrado = texto_narrado(texto)
    tokens = palabras(narrado)
    total = len(tokens)
    duracion_s = round(total / wpm * 60, 1)
    plano = [re.sub(r"[^a-z0-9]", "", _plano(t)) for t in tokens]

    objetivo = _plano(nombre).strip() if nombre else ""
    parte_nombre = objetivo.split() if objetivo else []
    primera = None
    if parte_nombre:
        for i in range(len(plano) - len(parte_nombre) + 1):
            if plano[i : i + len(parte_nombre)] == parte_nombre:
                primera = i
                break
    segundo_nombre = (
        round(primera / total * duracion_s, 1) if primera is not None and total else None
    )

    if total == 0:
        fallos.append(
            "no se pudo medir: cero palabras narradas. El guion no tiene texto "
            "reconocible como narracion (etiqueta 'Narracion', bloque de acto o parrafo)"
        )
    if duracion_s > TOPE_SEGUNDOS:
        fallos.append(f"duracion {duracion_s} s supera el tope de {TOPE_SEGUNDOS} s")
    if segundo_nombre is not None and segundo_nombre < SEGUNDOS_SIN_NOMBRE:
        fallos.append(
            f"el nombre del proyecto aparece en el segundo {segundo_nombre}"
            f" (minimo {SEGUNDOS_SIN_NOMBRE} s)"
        )
    for categoria, frase, desc in chequear_slop_ia(narrado):
        fallos.append(f"slop {categoria}: {frase!r} — {desc}")
    for categoria, frase, desc in chequear_forbidden_phrases(narrado):
        fallos.append(f"prohibido {categoria}: {frase!r} — {desc}")

    return {
        "palabras": total,
        "duracion_s": duracion_s,
        "wpm": wpm,
        "nombre": nombre or None,
        "segundo_del_nombre": segundo_nombre,
        "nombre_medible": segundo_nombre is not None,
        "fallos": fallos,
    }


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Verifica un guion de rally.")
    parser.add_argument("archivo")
    parser.add_argument("--nombre", default=None)
    parser.add_argument("--wpm", type=int, default=WPM_POR_DEFECTO)
    args = parser.parse_args(argv)

    ruta = Path(args.archivo)
    if not ruta.is_file():
        print(f"ERROR: no existe {ruta}")
        return 2
    nombre = args.nombre
    if not nombre:
        brief = RAIZ / "brief.json"
        if brief.is_file():
            nombre = json.loads(brief.read_text(encoding="utf-8")).get("project_name") or None

    r = verificar(ruta.read_text(encoding="utf-8"), nombre, args.wpm)
    print(f"palabras: {r['palabras']} | duracion: {r['duracion_s']} s a {r['wpm']} wpm")
    if r["nombre_medible"]:
        print(f"nombre '{r['nombre']}': segundo {r['segundo_del_nombre']}")
    else:
        print("nombre del proyecto: no medible (sin nombre en el guion o en brief.json)")
    if r["fallos"]:
        print(f"GUION RECHAZADO ({len(r['fallos'])} fallos):")
        for f in r["fallos"]:
            print(f"  - {f}")
        return 1
    print("GUION OK")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
