#!/usr/bin/env python3
"""Genera la página online de un proyecto de Rally Design.

La página es estática: se publica en GitHub Pages/Netlify y habla con la
ISLA de IA compartida (un solo backend para todos los proyectos). Al crear
un rally/proyecto nuevo, este script deja la página lista en segundos.

Uso:
    python scripts/gen_pagina_diseno.py --slug equipo-nicaragua
    python scripts/gen_pagina_diseno.py --slug equipo-nicaragua --out site/diseno

La URL de la isla sale de la variable de entorno RALLY_AI_BASE_URL.
Si no está definida, la página se publica sin IA (el editor avisa y sigue
funcionando a mano).
"""

from __future__ import annotations

import argparse
import json
import os
import shutil
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
DESIGN_DIR = REPO_ROOT / "design"
DEFAULT_OUT = REPO_ROOT / "site" / "diseno"

# Archivos del módulo que se copian a la página publicada.
COPIAR_HTML = ["index.html", "kit.html", "thumb.html", "impacto.html"]
COPIAR_JS = [
    "shared.js", "presets.js", "fonts.js", "mapa_ni.js", "ia.js",
    "kit.js", "thumb.js", "impacto.js", "ods_data.js",
]
COPIAR_CSS = ["kit.css", "impacto.css"]

# Variables que consume la página de diseño. Se sobrescriben con la paleta
# aprobada del proyecto: sin esto la página sale con los colores de la plantilla
# y el equipo entrega una identidad que nunca eligió.
VARS_DISENO = {
    "--bg": ("bg", "bg_app"),
    "--bg2": ("bg_subtle", "bg_secondary"),
    "--ink": ("text_title", "text_main"),
    "--mu": ("text_muted", "text_body"),
    "--ac": ("primary", "accent"),
}


def escribir_paleta(dest: Path) -> str:
    """Vuelca la paleta aprobada sobre las variables de la página de diseño.

    Devuelve el aviso si no hay paleta aprobada: sin ella la página sale con los
    colores de la plantilla, y eso es identidad ajena.
    """
    try:
        from comun import paleta as paleta_proyecto

        colores = paleta_proyecto()
    except SystemExit:
        return "paleta pendiente: correr scripts/gen_palette.py y aprobar una ruta A/B/C"
    pares = []
    for var, claves in VARS_DISENO.items():
        for clave in claves:
            valor = colores.get(clave)
            if valor:
                pares.append("%s:%s" % (var, valor))
                break
    if not pares:
        return "paleta aprobada sin colores utiles para la página"
    (dest / "tokens.css").write_text(":root{%s}\n" % ";".join(pares), encoding="utf-8")
    return ""


def enlazar_tokens(dest: Path) -> int:
    """Enlaza tokens.css al final del head: gana sobre el estilo de la plantilla."""
    enlazados = 0
    for nombre in COPIAR_HTML:
        archivo = dest / nombre
        if not archivo.exists():
            continue
        html = archivo.read_text(encoding="utf-8")
        if "tokens.css" in html or "</head>" not in html:
            continue
        html = html.replace(
            "</head>", '<link rel="stylesheet" href="tokens.css">\n</head>', 1
        )
        archivo.write_text(html, encoding="utf-8")
        enlazados += 1
    return enlazados


def _safe_slug(s: str) -> str:
    out = "".join(c if (c.isalnum() or c in "-_") else "-" for c in (s or "").strip().lower())
    out = "-".join(p for p in out.split("-") if p)
    return out or "proyecto"


def _js_str(v) -> str:
    """Valor JS seguro (sin comillas dobles ni saltos de línea)."""
    if v is None:
        return ""
    return str(v).replace("\\", "\\\\").replace('"', '\\"').replace("\r", " ").replace("\n", " ")


def leer_brief(path: Path) -> dict:
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except Exception:
        return {}


def contenido_desde_brief(brief: dict, slug: str) -> dict:
    """Traduce el brief a los campos que la lámina muestra.

    Todo lo que no exista en el brief queda como marcador editable:
    nunca se inventa contenido del equipo.
    """
    name = brief.get("team_name") or brief.get("project_name") or ""
    tag = "#" + _safe_slug(name.replace(" ", "-")) if name else "#GRUPO"
    titulo = brief.get("project_name") or brief.get("description_one_line") or ""
    rally = brief.get("rally_type") or ""
    kicker = ("Rally Latinoamericano de Innovación" if rally == "latam"
              else "Rally Nacional de Innovación" if rally == "nacional"
              else "Rally Latinoamericano de Innovación")
    foot = " · ".join(x for x in [brief.get("university"), brief.get("city")] if x)
    return {
        "team": {
            "name": name or "Nombre del grupo",
            "tag": tag if name else "#GRUPO",
            "kicker": kicker,
            "title": titulo or "Título de portada: una frase que resuma el reto",
            "pais": "01",
            "reto": "01",
            "paisNombre": "Nicaragua",
            "evento": brief.get("challenge_title") or "Nombre del evento",
            "foot": foot or "Pie del carrusel",
            "university": brief.get("university") or "Nombre de la universidad",
            "city": brief.get("city") or "Ciudad",
            "logo": "", "logoUni": "", "logoEvento": "", "hero": "",
        },
        "mem": [],
    }


def escribir_contenido(dest: Path, contenido: dict) -> None:
    t = contenido["team"]
    mem = contenido["mem"]
    if mem:
        filas = ",\n".join(
            "    { n: '%s', s: '%s', c: '%s', r: '%s', e: '%s', photo: '', ac: '', bg: '' }" % (
                _js_str(m["n"]), _js_str(m["s"]), _js_str(m["c"]), _js_str(m["r"]), _js_str(m["e"])
            ) for m in mem
        )
        bloque = "  mem: [\n%s\n  ]" % filas
    else:
        # Sin integrantes declarados no se pone una persona de ejemplo: "Nombre
        # Apellido | Rol" se graba en el video y parece un dato real.
        bloque = "  mem: []"
    texto = (
        "/* Contenido del proyecto (generado por scripts/gen_pagina_diseno.py).\n"
        "   Editable en el navegador: el editor guarda los cambios en su navegador. */\n"
        "var RALLY_CONTENIDO = {\n"
        "  team: {\n"
        "    name: '%s',\n"
        "    tag: '%s',\n"
        "    kicker: '%s',\n"
        "    title: '%s',\n"
        "    pais: '%s',\n"
        "    reto: '%s',\n"
        "    paisNombre: '%s',\n"
        "    evento: '%s',\n"
        "    foot: '%s',\n"
        "    university: '%s',\n"
        "    city: '%s',\n"
        "    logo: '', logoUni: '', logoEvento: '', hero: ''\n"
        "  },\n"
        "%s\n"
        "};\n"
    ) % (
        _js_str(t["name"]), _js_str(t["tag"]), _js_str(t["kicker"]), _js_str(t["title"]),
        _js_str(t["pais"]), _js_str(t["reto"]), _js_str(t["paisNombre"]), _js_str(t["evento"]),
        _js_str(t["foot"]), _js_str(t["university"]), _js_str(t["city"]), bloque,
    )
    (dest / "contenido.js").write_text(texto, encoding="utf-8")


def escribir_config(dest: Path, base: str, cuota: int, modelo: str = "") -> None:
    texto = (
        "/* Configuración de la página publicada.\n"
        "   base = URL de la isla compartida de IA. Vacío = sin IA (modo manual).\n"
        "   model = modelo de IA; vacío deja que el servidor elija. */\n"
        "var RALLY_IA_CONFIG = {\n"
        "  base: '%s',\n"
        "  dailyQuota: %d,\n"
        "  model: '%s'\n"
        "};\n"
    ) % (_js_str(base.rstrip("/")), cuota, _js_str(modelo))
    (dest / "config.js").write_text(texto, encoding="utf-8")


def main(argv=None) -> int:
    ap = argparse.ArgumentParser(description="Genera la página online de Rally Design")
    ap.add_argument("--slug", required=True, help="nombre corto del proyecto")
    ap.add_argument("--out", default=None, help="carpeta destino (default: site/diseno)")
    ap.add_argument("--brief", default=None, help="ruta al brief.json")
    ap.add_argument("--base", default=None, help="URL de la isla (default: env RALLY_AI_BASE_URL)")
    ap.add_argument("--cuota", type=int, default=12, help="generaciones de IA por día")
    ap.add_argument("--model", default=os.environ.get("RALLY_AI_MODEL", "opencode-go/deepseek-v4.1-flash"),
                    help="modelo de IA (default: env RALLY_AI_MODEL)")
    args = ap.parse_args(argv)

    slug = _safe_slug(args.slug)
    out = Path(args.out).resolve() if args.out else DEFAULT_OUT
    out.mkdir(parents=True, exist_ok=True)

    brief_path = Path(args.brief).resolve() if args.brief else REPO_ROOT / "brief.json"
    brief = leer_brief(brief_path)

    for nombre in COPIAR_HTML:
        src = DESIGN_DIR / nombre
        if src.exists():
            shutil.copy2(src, out / nombre)
    for nombre in COPIAR_JS:
        src = DESIGN_DIR / nombre
        if src.exists():
            shutil.copy2(src, out / nombre)
    for nombre in COPIAR_CSS:
        src = DESIGN_DIR / nombre
        if src.exists():
            shutil.copy2(src, out / nombre)
    if (DESIGN_DIR / "assets").is_dir():
        destino_assets = out / "assets"
        if destino_assets.exists():
            shutil.rmtree(destino_assets)
        shutil.copytree(DESIGN_DIR / "assets", destino_assets)

    escribir_contenido(out, contenido_desde_brief(brief, slug))

    base = args.base if args.base is not None else os.environ.get("RALLY_AI_BASE_URL", "")
    escribir_config(out, base or "", args.cuota, args.model or "")

    avisos = []
    if not base:
        avisos.append("Sin RALLY_AI_BASE_URL: la página se publica sin IA (modo manual).")
    aviso_paleta = escribir_paleta(out)
    if aviso_paleta:
        avisos.append(aviso_paleta)
    else:
        enlazar_tokens(out)
    if not (brief.get("project_name") or brief.get("team_name")):
        avisos.append(
            "brief.json vacío: la página sale con marcadores en lugar del proyecto."
        )

    print(json.dumps({
        "ok": True,
        "slug": slug,
        "out": str(out),
        "isla": base or "",
        "ia": bool(base),
        "advertencia": " ".join(avisos),
    }, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
