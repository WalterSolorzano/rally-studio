#!/usr/bin/env python3
"""puente_identidad.py -- Lleva la identidad aprobada del proyecto a tokens.

Una sola fuente: la identidad que el humano aprobo en design/ (seccion
`design_identity` de dashboard/data/sections.db) o el JSON exportado que se
pase. Escribe brand/palette.json y brand/tokens.css reutilizando
gen_palette.tokens_css: mismos nombres de token, misma planta 60-30-10, una
sola implementacion.

La tipografia sale de la eleccion del equipo (`fonts.t/b/l`) y solo se acepta
si la familia existe en FONT_LIBRARY (design/fonts.js). Si no, el token queda
con la pila neutral: el motor nunca se cuela por defecto.

Uso:
    python scripts/puente_identidad.py              # lee y muestra el mapeo
    python scripts/puente_identidad.py --si         # escribe palette + tokens
    python scripts/puente_identidad.py --archivo identidad.json --si

Salida: lineas "OK/AVISO/FAIL", codigo 2 si la identidad no trae lo minimo.
"""
from __future__ import annotations

import argparse
import json
import pathlib
import re
import sqlite3
import sys

RAIZ = pathlib.Path(__file__).resolve().parent.parent
SECCION = "design_identity"
SECCIONES_DB = RAIZ / "dashboard" / "data" / "sections.db"
PALETTE = RAIZ / "brand" / "palette.json"
TOKENS = RAIZ / "brand" / "tokens.css"

sys.path.insert(0, str(RAIZ / "scripts"))
import gen_palette as gp  # noqa: E402  (tokens_css y contraste: una sola fuente)

HEX = re.compile(r"^#[0-9a-fA-F]{6}$")
MINIMO = 4.5


def _rgb(color: str) -> tuple[int, int, int]:
    h = color.lstrip("#")
    return int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16)


def _hex(r: float, g: float, b: float) -> str:
    return "#%02x%02x%02x" % tuple(max(0, min(255, round(v))) for v in (r, g, b))


def mezclar(a: str, b: str, t: float) -> str:
    ra, ga, ba = _rgb(a)
    rb, gb, bb = _rgb(b)
    return _hex(ra + (rb - ra) * t, ga + (gb - ga) * t, ba + (bb - ba) * t)


def ajustar(color: str, fondo: str, minimo: float = MINIMO) -> str:
    """Mueve el color hacia negro o blanco (segun el fondo) hasta pasar AA."""
    if gp.contraste(color, fondo) >= minimo:
        return color
    destino = "#000000" if gp.luminance(fondo) > 0.35 else "#ffffff"
    for paso in range(1, 21):
        candidato = mezclar(color, destino, paso * 0.05)
        if gp.contraste(candidato, fondo) >= minimo:
            return candidato
    return destino


def desenvolver(datos) -> dict:
    """Acepta la identidad cruda o envuelta en data/payload/seccion."""
    if not isinstance(datos, dict):
        raise ValueError("la identidad no es un objeto JSON")
    if isinstance(datos.get("pal"), dict):
        return datos
    for clave in ("data", "payload", "identidad", "seccion"):
        if isinstance(datos.get(clave), dict):
            return desenvolver(datos[clave])
    raise ValueError("la identidad no trae 'pal'")


def leer_seccion(ruta_db: pathlib.Path) -> dict:
    if not ruta_db.exists():
        raise FileNotFoundError(
            f"{ruta_db} no existe: aun no hay identidad aprobada en el navegador"
        )
    conexion = sqlite3.connect(f"file:{ruta_db}?mode=ro", uri=True)
    try:
        fila = conexion.execute(
            "SELECT data FROM sections WHERE key = ? ORDER BY version DESC LIMIT 1",
            (SECCION,),
        ).fetchone()
    finally:
        conexion.close()
    if not fila:
        raise KeyError(f"no hay fila '{SECCION}' en sections: falta aprobar la identidad")
    datos = fila[0]
    if isinstance(datos, bytes):
        datos = datos.decode("utf-8")
    return json.loads(datos) if isinstance(datos, str) else datos


def fuentes_aprobadas(fonts: dict) -> dict:
    disponibles = gp.familias_disponibles()
    elegidas = {
        "display": fonts.get("t") or "",
        "ui": fonts.get("b") or "",
        "mono": fonts.get("l") or "",
    }
    if elegidas["mono"] and "mono" not in elegidas["mono"].lower():
        elegidas["mono"] = ""
    fuera = [f for f in elegidas.values() if f and f not in disponibles]
    for nombre, familia in elegidas.items():
        if familia in fuera:
            print(f"AVISO tipografia: '{familia}' no esta en FONT_LIBRARY, se descarta")
            elegidas[nombre] = ""
    return elegidas


def mapear(identidad: dict) -> dict:
    pal = identidad.get("pal") or {}
    faltan = [k for k in ("bg", "ink", "ac") if not HEX.match(str(pal.get(k) or ""))]
    if faltan:
        raise ValueError(f"identidad incompleta: faltan {', '.join(faltan)} (hex #rrggbb)")

    bg = pal["bg"].lower()
    bg2 = pal["bg2"] if HEX.match(str(pal.get("bg2") or "")) else mezclar(bg, "#ffffff", 0.35)
    ink = ajustar(pal["ink"].lower(), bg)
    mu = ajustar((pal.get("mu") or ink).lower(), bg)
    ac = ajustar(pal["ac"].lower(), bg)
    decor = (pal.get("gl") or "").lower()
    decor = decor if HEX.match(decor) else mezclar(ac, bg, 0.45)

    return {
        "ruta": "proyecto",
        "descripcion": "Identidad aprobada por el equipo en el kit de identidad.",
        "primary": ac,
        "primary_hover": ajustar(mezclar(ac, "#000000", 0.15), bg),
        "accent": decor,
        "accent_decor": gp.decorativo(decor, bg),
        "bg": bg,
        "bg_subtle": bg2,
        "bg_secondary": mezclar(bg2, bg, 0.5),
        "text_title": ink,
        "text_main": ink,
        "text_body": ajustar(mezclar(ink, bg, 0.25), bg),
        "text_muted": mu,
        "text_faint": ajustar(mezclar(mu, bg, 0.3), bg),
        "border_light": mezclar(bg, ink, 0.14),
        "border_strong": mezclar(bg, ink, 0.32),
        "_contraste_primary_bg": gp.contraste(ac, bg),
        "_grado_primary": gp.grado(gp.contraste(ac, bg)),
        "_contraste_accent_bg": gp.contraste(decor, bg),
        "_grado_accent": gp.grado(gp.contraste(decor, bg)),
        "_contraste_texto_bg": gp.contraste(ink, bg),
        "_fuentes": fuentes_aprobadas(identidad.get("fonts") or {}),
        "_fuente_porque": "Elegida por el equipo en el kit de identidad; verificada contra FONT_LIBRARY.",
    }


def main() -> int:
    parser = argparse.ArgumentParser(description="Identidad aprobada a tokens del proyecto.")
    parser.add_argument("--archivo", help="JSON exportado de la identidad (alternativa a la seccion)")
    parser.add_argument("--db", default=str(SECCIONES_DB), help="ruta a sections.db")
    parser.add_argument("--si", action="store_true", help="confirma la escritura")
    args = parser.parse_args()

    try:
        crudos = (
            json.loads(pathlib.Path(args.archivo).read_text(encoding="utf-8-sig"))
            if args.archivo
            else leer_seccion(pathlib.Path(args.db))
        )
    except (OSError, ValueError, KeyError, sqlite3.Error) as exc:
        print(f"FAIL identidad: {exc}")
        return 2

    try:
        pal = mapear(desenvolver(crudos))
    except ValueError as exc:
        print(f"FAIL identidad: {exc}")
        return 2

    for clave in ("bg", "text_main", "primary", "accent"):
        print(f"  {clave:<11} {pal[clave]}")
    f = pal["_fuentes"]
    print(f"  tipografia  {f['display'] or '(neutra)'} / {f['ui'] or '(neutra)'} / {f['mono'] or '(neutra)'}")
    print(f"  contraste primary/bg {pal['_contraste_primary_bg']}:1, texto/bg {pal['_contraste_texto_bg']}:1")

    if not args.si:
        print("nada escrito: falta --si (la identidad se aprueba antes de aplicarse)")
        return 0

    PALETTE.write_text(json.dumps(
        {**{k: v for k, v in pal.items() if not k.startswith("_")},
         "_status": "aprobada",
         "_generado_por": "scripts/puente_identidad.py",
         "_fuente": args.archivo or "design_identity",
         "_fuentes": pal["_fuentes"],
         "_fuente_porque": pal["_fuente_porque"]},
        indent=2, ensure_ascii=False), encoding="utf-8")
    TOKENS.write_text(gp.tokens_css(pal), encoding="utf-8")
    print("OK: brand/palette.json aprobada")
    print("OK: brand/tokens.css regenerado desde la identidad del equipo")
    return 0


if __name__ == "__main__":
    sys.exit(main())
