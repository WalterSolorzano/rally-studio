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
import re
import sys

RAIZ = pathlib.Path(__file__).resolve().parent.parent
BRIEF = RAIZ / "brief.json"
PALETTE = RAIZ / "brand" / "palette.json"
PROPUESTAS = RAIZ / "brand" / "palette.propuestas.json"
TOKENS = RAIZ / "brand" / "tokens.css"
FONTS_JS = RAIZ / "design" / "fonts.js"

# La tipografia es decision del proyecto, no del motor. Cada ruta propone una
# pareja con su porque y solo se aprueba si las tres familias existen en
# FONT_LIBRARY (design/fonts.js). Nada de Plus Jakarta ni JetBrains por defecto.
PARES_TIPOGRAFICOS = {
    "A": {
        "display": "Libre Franklin",
        "ui": "Source Sans 3",
        "mono": "IBM Plex Mono",
        "porque": "Titular de peso institucional con lectura neutra; la mono solo para cifras.",
    },
    "B": {
        "display": "Space Grotesk",
        "ui": "Inter",
        "mono": "IBM Plex Mono",
        "porque": "Titular geometrico para una marca joven; cuerpo Inter por lectura en pantalla.",
    },
    "C": {
        "display": "Fraunces",
        "ui": "Public Sans",
        "mono": "IBM Plex Mono",
        "porque": "Titular serif de contraste alto para relato editorial; cuerpo neutro.",
    },
}
PILA_UI = 'system-ui, -apple-system, "Segoe UI", sans-serif'
PILA_MONO = "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace"

# Direccion visual: sale del plan de producto o del texto del reto, nunca fija.
DIRECCIONES = {
    "clara": {
        "bg_l": 0.985, "extra_s": 0.0, "tinta": "oscura",
        "porque": "superficie clara: el jurado lee de cerca y la pagina se imprime",
    },
    "nocturna": {
        "bg_l": 0.12, "extra_s": 0.10, "tinta": "clara",
        "porque": "superficie oscura: el producto vive de noche o en pantalla fija",
    },
    "calida": {
        "bg_l": 0.962, "extra_s": 0.24, "tinta": "oscura",
        "porque": "superficie tenida: comida, agro o artesania piden color de fondo, no gris",
    },
}
PISTAS_DIRECCION = (
    ("nocturna", ("nocturn", "noche", "madrugada", "24/7", "vigilancia")),
    ("calida", ("comida", "cocina", "cafe", "café", "cacao", "agro", "textil",
                "artesan", "turismo", "gastronom")),
)
# (saturacion, claridad) por rol de tinta, segun el fondo sea claro u oscuro.
_TINTA = {
    "oscura": {
        "title": (0.32, 0.13), "main": (0.24, 0.19), "body": (0.14, 0.30),
        "muted": (0.18, 0.46), "faint": (0.14, 0.58),
        "border_light": (0.30, 0.88), "border_strong": (0.20, 0.76),
    },
    "clara": {
        "title": (0.10, 0.97), "main": (0.10, 0.90), "body": (0.12, 0.78),
        "muted": (0.14, 0.62), "faint": (0.12, 0.50),
        "border_light": (0.18, 0.26), "border_strong": (0.18, 0.38),
    },
}

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
    """Mueve la claridad hasta que el par cumpla: primero oscurece, luego aclara."""
    for sentido in (1, -1):
        actual = l
        for _ in range(50):
            color = hex_of(h, s, min(max(actual, 0.0), 1.0))
            ratio = contraste(color, fondo)
            if ratio >= minimo:
                return color, ratio, grado(ratio)
            actual -= 0.02 * sentido
    color = hex_of(h, s, 0.05)
    return color, contraste(color, fondo), grado(contraste(color, fondo))


def familias_disponibles() -> set[str]:
    """Familias de design/fonts.js. Sin biblioteca no se propone tipografia."""
    if not FONTS_JS.exists():
        return set()
    texto = FONTS_JS.read_text(encoding="utf-8", errors="replace")
    return set(re.findall(r"family:\s*'([^']+)'", texto))


def par_tipografico(nombre: str) -> dict | None:
    """Pareja de la ruta validada contra FONT_LIBRARY; fuera de ella, None."""
    par = PARES_TIPOGRAFICOS.get(nombre)
    disponibles = familias_disponibles()
    if not par or not disponibles:
        return None
    if not all(par[k] in disponibles for k in ("display", "ui", "mono")):
        return None
    return dict(par)


def pila(familia: str | None, respaldo: str) -> str:
    return f"'{familia}', {respaldo}" if familia else respaldo


def sin_morado(hue: int) -> int:
    """Aleja el tono del morado de IA (#7c3aed y vecinos 250-330) sin tocar el resto."""
    h = hue % 360
    while 250 <= h <= 330:
        h = (h + 40) % 360
    return h


def _rgb(hexa: str) -> tuple[int, int, int]:
    h = hexa.lstrip("#")
    return int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16)


def decorativo(acento: str, fondo: str) -> str:
    """Version decorativa del acento: se acerca al fondo hasta quedar bajo 3:1.

    Por eso nunca lleva texto: si se usa como color de letra, no se lee.
    """
    a, f = _rgb(acento), _rgb(fondo)
    for peso in (0.55, 0.65, 0.75, 0.85):
        mezcla = "#%02X%02X%02X" % tuple(
            round(a[i] * peso + f[i] * (1 - peso)) for i in range(3)
        )
        if contraste(mezcla, fondo) < 3.0:
            return mezcla
    return fondo


def empujar(color: str, fondos: list[str], minimo: float) -> str:
    """Acerca un color al blanco o al negro hasta pasar el contraste minimo.

    Se mide contra cada fondo declarado: el par mas exigente manda, porque la
    pieza usa la misma tinta sobre --bg-app y --bg-subtle.
    """
    if all(contraste(color, f) >= minimo for f in fondos):
        return color
    r, g, b = _rgb(color)
    promedio = sum(_rgb(fondos[0])) / 3
    hacia = (0, 0, 0) if promedio > 127 else (255, 255, 255)
    for paso in range(1, 41):
        peso = paso / 40
        mezcla = "#%02X%02X%02X" % tuple(
            round(c * (1 - peso) + h * peso) for c, h in zip((r, g, b), hacia)
        )
        if all(contraste(mezcla, f) >= minimo for f in fondos):
            return mezcla
    return "#%02X%02X%02X" % hacia


def direccion_visual(brief: dict) -> dict:
    """Clara, nocturna o calida: la declara el plan de producto o la sugiere el reto."""
    producto = brief.get("producto") or {}
    declarada = str(
        producto.get("direccion") or brief.get("direccion_visual") or ""
    ).strip().lower()
    if declarada in DIRECCIONES:
        return {"nombre": declarada, "origen": "plan de producto",
                "porque": DIRECCIONES[declarada]["porque"]}
    piezas = (brief.get("challenge_title"), brief.get("solution"),
              brief.get("sector"), producto.get("problema"),
              producto.get("protagonista"))
    texto = " ".join(p for p in piezas if isinstance(p, str)).lower()
    for nombre, pistas in PISTAS_DIRECCION:
        if any(pista in texto for pista in pistas):
            return {"nombre": nombre, "origen": "texto del reto",
                    "porque": DIRECCIONES[nombre]["porque"]}
    return {"nombre": "clara", "origen": "defecto",
            "porque": DIRECCIONES["clara"]["porque"]}


def construir_ruta(nombre: str, hue: int, direccion: str = "clara") -> dict:
    # Cada ruta cambia tambien el ancla, no solo el acento: A sobria,
    # B saturada, C terrosa. Asi el humano elige de verdad entre tres.
    ancla = {
        "A": {"h": 0, "s": 0.50, "l": 0.44, "bg_s": 0.10},
        "B": {"h": 0, "s": 0.74, "l": 0.36, "bg_s": 0.24},
        "C": {"h": 14, "s": 0.60, "l": 0.40, "bg_s": 0.34},
    }[nombre]
    tono = DIRECCIONES[direccion]
    tinta = _TINTA[tono["tinta"]]
    h_base = hue + ancla["h"]
    bg_l = tono["bg_l"]
    bg_s = min(ancla["bg_s"] + tono["extra_s"], 0.44)
    signo = 1 if tono["tinta"] == "oscura" else -1
    bg = hex_of(h_base, bg_s, bg_l)
    bg_subtle = hex_of(h_base, min(bg_s + 0.04, 0.44), bg_l - 0.02 * signo)
    bg_secondary = hex_of(h_base, min(bg_s + 0.08, 0.44), bg_l - 0.04 * signo)
    text_title = hex_of(h_base, *tinta["title"])
    text_main = hex_of(h_base, *tinta["main"])
    text_body = hex_of(h_base, *tinta["body"])
    text_muted = empujar(hex_of(h_base, *tinta["muted"]), [bg, bg_subtle], 4.5)
    text_faint = empujar(hex_of(h_base, *tinta["faint"]), [bg, bg_subtle], 4.5)
    border_light = hex_of(h_base, *tinta["border_light"])
    border_strong = empujar(hex_of(h_base, *tinta["border_strong"]), [bg], 3.0)

    if nombre == "A":
        h_acento = h_base + 24
    elif nombre == "B":
        h_acento = h_base + 180
    else:
        h_acento = h_base + 150
    h_acento = sin_morado(h_acento)

    primary, c_prim, g_prim = asegurar_contraste(h_base, ancla["s"], ancla["l"], bg)
    primary_hover, _, _ = asegurar_contraste(h_base, ancla["s"], ancla["l"] - 0.08, bg)
    acento, c_acen, g_acen = asegurar_contraste(h_acento, 0.55, 0.40, bg)
    c_texto = contraste(text_main, bg)
    par = par_tipografico(nombre) or {}
    acento_decor = decorativo(acento, bg)

    return {
        "ruta": nombre,
        "descripcion": RUTAS[nombre],
        "direccion": direccion,
        "primary": primary,
        "primary_hover": primary_hover,
        "accent": acento,
        "accent_decor": acento_decor,
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
        "_roles": {
            "superficie": ["bg", "bg_subtle", "bg_secondary"],
            "tinta": ["text_title", "text_main", "text_body", "text_muted", "text_faint"],
            "borde": ["border_light", "border_strong"],
            "accion": ["primary", "primary_hover"],
            "acento": ["accent"],
            "decorativo": ["accent_decor"],
        },
        "_contraste_primary_bg": c_prim,
        "_grado_primary": g_prim,
        "_contraste_accent_bg": c_acen,
        "_grado_accent": g_acen,
        "_contraste_texto_bg": c_texto,
        "_contraste_decor_bg": contraste(acento_decor, bg),
        "_fuentes": {k: par[k] for k in ("display", "ui", "mono")} if par else {},
        "_fuente_porque": par.get("porque", ""),
    }


def proponer(brief: dict) -> dict:
    texto = texto_del_reto(brief)
    hue, origen = hue_del_reto(texto)
    direccion = direccion_visual(brief)
    rutas = {n: construir_ruta(n, hue, direccion["nombre"]) for n in ("A", "B", "C")}
    return {
        "_status": "propuesta",
        "_origen_hue": origen,
        "_direccion": direccion,
        "_reto": brief.get("challenge_title") or "(sin titulo)",
        "_regla": "3 rutas, una aprobada por el humano. Nada se aplica sin --ruta X --si.",
        "rutas": rutas,
    }


def tokens_css(pal: dict) -> str:
    err, _, g_err = asegurar_contraste(0, 0.72, 0.42, pal["bg"])
    decor = pal.get("accent_decor") or decorativo(pal["accent"], pal["bg"])
    direccion = pal.get("direccion") or "sin declarar"
    return f"""/* brand/tokens.css -- generado por scripts/gen_palette.py (ruta {pal['ruta']}).
 * Capa proyecto. No editar a mano: se regenera.
 * Direccion visual: {direccion}.
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

  /* Decorativo: bajo 3:1 contra el fondo. Nunca lleva texto. */
  --color-accent-decor: {decor};

  /* <1 % semantica: no es identidad, es error */
  --status-err: {err};
  --status-err-text: {err};

  /* Tipografia aprobada con la ruta, no la del motor */
  --font-display: {pila(pal.get('_fuentes', {}).get('display'), PILA_UI)};
  --font-ui: {pila(pal.get('_fuentes', {}).get('ui'), PILA_UI)};
  --font-mono: {pila(pal.get('_fuentes', {}).get('mono'), PILA_MONO)};

  /* Escalas del proyecto, no del motor */
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 18px;
  --space-1: 4px; --space-2: 8px; --space-3: 12px;
  --space-4: 16px; --space-5: 24px; --space-6: 32px; --space-7: 48px;
  --shadow-1: 0 1px 2px rgb(0 0 0 / 0.06);
  --shadow-2: 0 8px 24px -12px rgb(0 0 0 / 0.18);

  /* Movimiento: una tabla, tres duraciones, una curva */
  --motion-fast: 120ms;
  --motion-base: 200ms;
  --motion-slow: 320ms;
  --motion-ease: cubic-bezier(0.2, 0, 0, 1);
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
    print(f"direccion  {propuesta['_direccion']['nombre']} "
          f"({propuesta['_direccion']['origen']})")
    print(f"  {propuesta['_direccion']['porque']}")
    print()
    for nombre, r in propuesta["rutas"].items():
        print(f"  {nombre}  {r['primary']}  acento {r['accent']}  "
              f"contraste {r['_contraste_primary_bg']}:1 ({r['_grado_primary']})")
        print(f"     {r['descripcion']}")
        if r.get("_fuentes"):
            f = r["_fuentes"]
            print(f"     letra {f['display']} / {f['ui']} / {f['mono']}")
            print(f"     por que: {r['_fuente_porque']}")
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
    elegida["_direccion"] = propuesta["_direccion"]
    PALETTE.write_text(json.dumps(elegida, indent=2, ensure_ascii=False), encoding="utf-8")
    TOKENS.write_text(tokens_css(elegida), encoding="utf-8")
    print(f"OK: ruta {args.ruta} aprobada -> brand/palette.json")
    print("OK: brand/tokens.css regenerado")
    return 0


if __name__ == "__main__":
    sys.exit(main())
