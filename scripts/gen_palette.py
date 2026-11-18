#!/usr/bin/env python3
"""gen_palette.py -- Deriva la identidad cromatica del proyecto desde el reto.

La capa proyecto nace vacia (brand/palette.json en _status: pendiente).
Este script no adivina ni hereda colores de Rally Studio: lee brief.json,
traduce el sector y el territorio a una familia cromatica y propone tres
rutas A/B/C con contraste WCAG medido.

Uso:
    python scripts/gen_palette.py                 # propone A/B/C, no aprueba nada
    python scripts/gen_palette.py --ruta B --si   # aprueba B y escribe tokens

Salidas:
    brand/palette.propuestas.json   (siempre, las tres rutas)
    brand/palette.json              (solo con --ruta X --si)
    brand/tokens.css                (solo con --ruta X --si)
"""
from __future__ import annotations

import argparse
import hashlib
import json
import pathlib
import sys

RAIZ = pathlib.Path(__file__).resolve().parent.parent
BRIEF = RAIZ / "brief.json"
PALETTE = RAIZ / "brand" / "palette.json"
PROPUESTAS = RAIZ / "brand" / "palette.propuestas.json"
TOKENS = RAIZ / "brand" / "tokens.css"

# Familia cromatica por sector. El reto manda; lo que no este aqui cae al hash.
SECTOR_HUE = {
    "agua": 200, "sanit": 200, "hídric": 200, "hidric": 200,
    "agro": 95, "aliment": 95, "cosecha": 95, "maíz": 95, "maiz": 95,
    "residuo": 70, "basura": 70, "recicl": 70, "desecho": 70,
    "energ": 35, "solar": 35, "electric": 45,
    "salud": 165, "medic": 165, "clinic": 165, "discapac": 165,
    "educ": 230, "escuel": 230, "aprend": 230,
    "movil": 215, "transport": 215, "logístic": 215, "logistic": 215,
    "vivienda": 15, "habita": 15, "construc": 20,
    "seguridad": 250, "emergenc": 250, "riesgo": 10,
    "mujer": 320, "género": 320, "genero": 320,
    "turism": 175, "cultura": 290, "artesan": 25,
}

RUTAS = {
    "A": "analoga: un solo tono y sus vecinos. Sobria, institucional.",
    "B": "complementaria: tono del reto + acento opuesto. Alta recordacion.",
    "C": "triada dividida: tono del reto + dos acentos separados. Versatil.",
}


# --- utilidades de color -------------------------------------------------

def hsl_to_rgb(h: float, s: float, l: float) -> tuple[int, int, int]:
    h = h % 360
    c = (1 - abs(2 * l - 1)) * s
    x = c * (1 - abs((h / 60) % 2 - 1))
    m = l - c / 2
    if h < 60:
        r, g, b = c, x, 0
    elif h < 120:
        r, g, b = x, c, 0
    elif h < 180:
        r, g, b = 0, c, x
    elif h < 240:
        r, g, b = 0, x, c
    elif h < 300:
        r, g, b = x, 0, c
    else:
        r, g, b = c, 0, x
    return tuple(round((v + m) * 255) for v in (r, g, b))


def hex_of(h: float, s: float, l: float) -> str:
    return "#%02x%02x%02x" % hsl_to_rgb(h, s, l)


def luminance(hex_color: str) -> float:
    h = hex_color.lstrip("#")
    canales = [int(h[i:i + 2], 16) / 255.0 for i in (0, 2, 4)]
    canales = [c / 12.92 if c <= 0.03928 else ((c + 0.055) / 1.055) ** 2.4 for c in canales]
    return 0.2126 * canales[0] + 0.7152 * canales[1] + 0.0722 * canales[2]


def contraste(a: str, b: str) -> float:
    la, lb = luminance(a), luminance(b)
    return round((max(la, lb) + 0.05) / (min(la, lb) + 0.05), 2)


def grado(ratio: float) -> str:
    if ratio >= 7.0:
        return "AAA"
    if ratio >= 4.5:
        return "AA"
    return "FALLA"


# --- derivacion desde el reto --------------------------------------------

def leer_brief() -> dict:
    if not BRIEF.exists():
        raise SystemExit("brief.json no existe. Define el reto antes de generar identidad.")
    return json.loads(BRIEF.read_text(encoding="utf-8-sig"))


def texto_del_reto(brief: dict) -> str:
    campos = ("challenge_title", "challenge_description", "sector", "city", "country")
    partes = [str(brief.get(c, "") or "") for c in campos]
    if not any(p.strip() for p in partes):
        raise SystemExit(
            "brief.json sin reto: faltan challenge_title / sector / city. "
            "La identidad se deriva del reto, no se inventa."
        )
    return " ".join(partes).lower().strip()


def hue_del_reto(texto: str) -> tuple[int, str]:
    for clave, hue in SECTOR_HUE.items():
        if clave in texto:
            return hue, f"sector:{clave}"
    digest = hashlib.sha256(texto.encode("utf-8")).digest()
    return digest[0] * 360 // 256, "territorio:hash"


def asegurar_contraste(h: float, s: float, l: float, fondo: str, minimo: float = 4.5):
    """Oscurece hasta que el par cumpla. Devuelve (hex, contraste, grado)."""
    for _ in range(30):
        color = hex_of(h, s, l)
        ratio = contraste(color, fondo)
        if ratio >= minimo:
            return color, ratio, grado(ratio)
        l = max(0.0, l - 0.02)
    color = hex_of(h, s, max(l, 0.05))
    return color, contraste(color, fondo), grado(contraste(color, fondo))


def construir_ruta(nombre: str, hue: int, fondo_tono: float) -> dict:
    # Cada ruta cambia tambien el ancla, no solo el acento: A sobria,
    # B saturada, C terrosa. Asi el humano elige de verdad entre tres.
    ancla = {
        "A": {"h": 0, "s": 0.50, "l": 0.44, "bg_s": 0.10, "bg_l": 0.985},
        "B": {"h": 0, "s": 0.74, "l": 0.36, "bg_s": 0.24, "bg_l": 0.975},
        "C": {"h": 14, "s": 0.60, "l": 0.40, "bg_s": 0.34, "bg_l": 0.955},
    }[nombre]
    h_base = hue + ancla["h"]
    bg = hex_of(h_base, ancla["bg_s"], ancla["bg_l"])
    bg_subtle = hex_of(h_base, min(ancla["bg_s"] + 0.04, 0.40), fondo_tono)
    bg_secondary = hex_of(h_base, min(ancla["bg_s"] + 0.08, 0.44), fondo_tono - 0.02)
    text_title = hex_of(h_base, 0.32, 0.13)
    text_main = hex_of(h_base, 0.24, 0.19)
    text_body = hex_of(h_base, 0.14, 0.30)
    text_muted = hex_of(h_base, 0.18, 0.46)
    text_faint = hex_of(h_base, 0.14, 0.58)
    border_light = hex_of(h_base, 0.30, 0.88)
    border_strong = hex_of(h_base, 0.20, 0.76)

    if nombre == "A":
        h_acento = h_base + 24
    elif nombre == "B":
        h_acento = h_base + 180
    else:
        h_acento = h_base + 150

    primary, c_prim, g_prim = asegurar_contraste(h_base, ancla["s"], ancla["l"], bg)
    primary_hover, _, _ = asegurar_contraste(h_base, ancla["s"], ancla["l"] - 0.08, bg)
    acento, c_acen, g_acen = asegurar_contraste(h_acento, 0.55, 0.40, bg)
    c_texto = contraste(text_main, bg)

    return {
        "ruta": nombre,
        "descripcion": RUTAS[nombre],
        "primary": primary,
        "primary_hover": primary_hover,
        "accent": acento,
        "bg": bg,
        "bg_subtle": bg_subtle,
        "bg_secondary": bg_secondary,
        "text_title": text_title,
        "text_main": text_main,
        "text_body": text_body,
        "text_muted": text_muted,
        "text_faint": text_faint,
        "border_light": border_light,
        "border_strong": border_strong,
        "_contraste_primary_bg": c_prim,
        "_grado_primary": g_prim,
        "_contraste_accent_bg": c_acen,
        "_grado_accent": g_acen,
        "_contraste_texto_bg": c_texto,
    }


def proponer(brief: dict) -> dict:
    texto = texto_del_reto(brief)
    hue, origen = hue_del_reto(texto)
    rutas = {n: construir_ruta(n, hue, 0.965) for n in ("A", "B", "C")}
    return {
        "_status": "propuesta",
        "_origen_hue": origen,
        "_reto": brief.get("challenge_title") or "(sin titulo)",
        "_regla": "3 rutas, una aprobada por el humano. Nada se aplica sin --ruta X --si.",
        "rutas": rutas,
    }


def tokens_css(pal: dict) -> str:
    err, _, g_err = asegurar_contraste(0, 0.72, 0.42, pal["bg"])
    return f"""/* brand/tokens.css -- generado por scripts/gen_palette.py (ruta {pal['ruta']}).
 * Capa proyecto. No editar a mano: se regenera.
 * Planta 60-30-10. Contrastes: primary/bg {pal['_contraste_primary_bg']} ({pal['_grado_primary']}),
 * accent/bg {pal['_contraste_accent_bg']}, texto/bg {pal['_contraste_texto_bg']}.
 */
:root {{
  /* 60 % superficie */
  --bg-app: {pal['bg']};
  --bg-subtle: {pal['bg_subtle']};
  --bg-secondary: {pal['bg_secondary']};
  --bg-muted: {pal['bg_subtle']};

  /* 30 % tinta */
  --text-title: {pal['text_title']};
  --text-main: {pal['text_main']};
  --text-body: {pal['text_body']};
  --text-muted: {pal['text_muted']};
  --text-faint: {pal['text_faint']};
  --border-light: {pal['border_light']};
  --border-strong: {pal['border_strong']};

  /* 10 % accion */
  --color-primary: {pal['primary']};
  --color-primary-hover: {pal['primary_hover']};
  --color-accent: {pal['accent']};
  --border-focus: {pal['primary']};
  --status-ok: {pal['primary']};

  /* <1 % semantica: no es identidad, es error */
  --status-err: {err};
  --status-err-text: {err};

  --font-ui: 'Plus Jakarta Sans', system-ui, -apple-system, "Segoe UI", sans-serif;
  --font-mono: 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 18px;
  --space-1: 4px; --space-2: 8px; --space-3: 12px;
  --space-4: 16px; --space-5: 24px; --space-6: 32px; --space-7: 48px;
}}
"""


def main() -> int:
    parser = argparse.ArgumentParser(description="Deriva la paleta del proyecto desde el reto.")
    parser.add_argument("--ruta", choices=["A", "B", "C"], help="ruta a aprobar")
    parser.add_argument("--si", action="store_true", help="confirma la aprobacion humana")
    args = parser.parse_args()

    brief = leer_brief()
    propuesta = proponer(brief)
    PROPUESTAS.write_text(json.dumps(propuesta, indent=2, ensure_ascii=False), encoding="utf-8")

    print(f"reto    {propuesta['_reto']}")
    print(f"origen  {propuesta['_origen_hue']}")
    print()
    for nombre, r in propuesta["rutas"].items():
        print(f"  {nombre}  {r['primary']}  acento {r['accent']}  "
              f"contraste {r['_contraste_primary_bg']}:1 ({r['_grado_primary']})")
        print(f"     {r['descripcion']}")
    print()
    try:
        ruta_visible = PROPUESTAS.relative_to(RAIZ)
    except ValueError:
        ruta_visible = PROPUESTAS
    print(f"propuestas escritas: {ruta_visible}")
    print("nada aprobado todavia: falta --ruta X --si")

    if not (args.ruta and args.si):
        return 0

    elegida = dict(propuesta["rutas"][args.ruta])
    elegida["_status"] = "aprobada"
    elegida["_generado_por"] = "scripts/gen_palette.py"
    elegida["_reto"] = propuesta["_reto"]
    PALETTE.write_text(json.dumps(elegida, indent=2, ensure_ascii=False), encoding="utf-8")
    TOKENS.write_text(tokens_css(elegida), encoding="utf-8")
    print(f"OK: ruta {args.ruta} aprobada -> brand/palette.json")
    print("OK: brand/tokens.css regenerado")
    return 0


if __name__ == "__main__":
    sys.exit(main())
