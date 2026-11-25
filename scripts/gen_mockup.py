#!/usr/bin/env python3
"""gen_mockup.py -- Maqueta de la pieza de producto (compuerta G2).

Produce la escena que el humano aprueba mirando: el aparato con la pantalla
principal y, al lado, el tablero de identidad (muestras contiguas de color,
especimen tipografico, principios medidos). Nada de codigo de producto: esto
es la maqueta que se captura y se sirve al buzon antes de construir.

Solo var(--…): la identidad sale de brand/tokens.css. Si la identidad no esta
aprobada, el script se detiene: no inventa colores.

Uso:
    python scripts/gen_mockup.py
    python scripts/gen_mockup.py --salida design/mockup.html

Salidas: design/mockup.html + design/mockup.css
"""
from __future__ import annotations

import argparse
import json
import pathlib
import string
import sys

RAIZ = pathlib.Path(__file__).resolve().parent.parent
BRIEF = RAIZ / "brief.json"
PALETTE = RAIZ / "brand" / "palette.json"
TOKENS = RAIZ / "brand" / "tokens.css"
PLANTILLA = RAIZ / "scripts" / "templates" / "app-movil"

sys.path.insert(0, str(RAIZ / "scripts"))
import gen_palette as gp  # noqa: E402  (contraste: una sola implementacion)

MAPA_COLORES = [
    ("--bg-app", "superficie"),
    ("--color-primary", "accion"),
    ("--text-title", "tinta"),
    ("--color-accent", "acento"),
    ("--bg-subtle", "apoyo"),
]


def leer_tokens() -> dict[str, str]:
    texto = TOKENS.read_text(encoding="utf-8") if TOKENS.exists() else ""
    return dict(gp.re.findall(r"(--[a-z0-9-]+):\s*(#[0-9a-fA-F]{6})", texto))


def _esc(texto: str) -> str:
    return (str(texto).replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;"))


def construir(brief: dict, paleta: dict, con_fuentes: bool = False) -> tuple[str, str]:
    titulo = _esc(brief.get("project_name") or "")
    plan = brief.get("producto") or {}
    pantallas = [p for p in (plan.get("pantallas") or []) if isinstance(p, dict)]
    if not pantallas:
        pantallas = [{
            "id": "principal",
            "muestra": brief.get("description_one_line") or "la accion central del producto",
            "accion_simulada": "tocar y continuar",
            "primero": True,
        }]
    pantallas = sorted(pantallas, key=lambda p: 0 if p.get("primero") else 1)
    primera = pantallas[0]

    filas = []
    for i, pantalla in enumerate(pantallas[1:3]):
        activa = " activa" if i == 0 else ""
        filas.append(
            f'      <li class="fila{activa}"><span class="marca"></span>'
            f'<span>{_esc(pantalla.get("muestra") or pantalla.get("id") or "")}</span></li>'
        )

    tokens = leer_tokens()
    bloque_detalle = ""
    filas_detalle = [f for f in (plan.get("detalle") or []) if isinstance(f, dict)][:2]
    if filas_detalle:
        lineas = [
            f'      <div><span>{_esc(f.get("etiqueta") or "")}</span>'
            f'<span>{_esc(f.get("valor") or "")}</span></div>'
            for f in filas_detalle
        ]
        bloque_detalle = '    <div class="detalle">\n' + "\n".join(lineas) + "\n    </div>"
    base = tokens.get("--bg-app", "#ffffff")
    swatches, rotulos = [], []
    for variable, nombre in MAPA_COLORES:
        swatches.append("<span></span>")
        color = tokens.get(variable)
        if color and color.lower() == base.lower():
            dato = "fondo"
        elif color:
            dato = f"{gp.contraste(color, base)}:1"
        else:
            dato = "—"
        rotulos.append(f'<span><b>{nombre}</b><i>{dato}</i></span>')

    fuentes = paleta.get("_fuentes") or {}
    c_prim = paleta.get("_contraste_primary_bg")
    c_texto = paleta.get("_contraste_texto_bg")
    principio_uno = (
        f"Texto sobre superficie {c_texto}:1; el nombre del proyecto manda en la "
        "primera pantalla y no compite con nada."
    )
    principio_dos = (
        f"Accion a {c_prim}:1; el acento solo en el marcador activo y nunca como texto."
    )
    motion = plan.get("motion") or {}
    if motion.get("duracion"):
        principio_tres = (
            f"Transicion de {_esc(str(motion.get('duracion')))}"
            f"{' ' + _esc(str(motion.get('tipo'))) if motion.get('tipo') else ''}; "
            f"con reduced-motion {_esc(str(motion.get('reduced') or 'no hay movimiento'))}."
        )
    else:
        principio_tres = "Movimiento declarado en el plan antes de construir la pieza."

    texto_bajada = (plan.get("bajada") or "").strip()
    bloque_bajada = (
        f'    <p class="pantalla-texto">{_esc(texto_bajada)}</p>' if texto_bajada else ""
    )

    valores = {
        "titulo": titulo,
        "lema": _esc(plan.get("metafora") or brief.get("description_one_line")
                     or "La accion en una pantalla"),
        "bajada": bloque_bajada,
        "pantalla_id": _esc((primera.get("id") or "principal").capitalize()),
        "muestra": _esc(primera.get("muestra") or ""),
        "protagonista": _esc(plan.get("protagonista") or plan.get("metafora") or ""),
        "protagonista_valor": _esc(
            plan.get("protagonista_valor") or primera.get("muestra") or ""
        ),
        "accion": _esc(primera.get("accion_simulada") or "Continuar"),
        "filas": "\n".join(filas),
        "detalle": bloque_detalle,
        "swatches": "".join(swatches),
        "rotulos": "".join(rotulos),
        "fuente_display": _esc(fuentes.get("display") or "sistema"),
        "fuente_ui": _esc(fuentes.get("ui") or "sistema"),
        "fuente_mono": _esc(fuentes.get("mono") or "sistema"),
        "principio_uno": _esc(principio_uno),
        "principio_dos": _esc(principio_dos),
        "principio_tres": _esc(principio_tres),
        "nota": "[SIMULADO] maqueta con datos del brief; no publica cifras nuevas",
        "fuentes_link": '<link rel="stylesheet" href="fonts/fonts.css">'
        if con_fuentes else "<!-- fuentes locales: python scripts/bajar_fuentes.py -->",
    }

    html = string.Template((PLANTILLA / "mockup.html").read_text(encoding="utf-8"))
    css = (PLANTILLA / "mockup.css").read_text(encoding="utf-8")
    return html.safe_substitute(valores), css


def main() -> int:
    parser = argparse.ArgumentParser(description="Maqueta de la pieza de producto (G2).")
    parser.add_argument("--salida", default="design/mockup.html", help="ruta del HTML")
    args = parser.parse_args()

    if not BRIEF.exists():
        print("FAIL brief.json no existe")
        return 2
    brief = json.loads(BRIEF.read_text(encoding="utf-8-sig"))
    if not (brief.get("project_name") or "").strip():
        print("FAIL falta project_name en brief.json: sin nombre no hay escena que aprobar")
        return 2

    if not PALETTE.exists():
        print("FAIL brand/palette.json no existe: primero propuesta-identidad")
        return 2
    paleta = json.loads(PALETTE.read_text(encoding="utf-8-sig"))
    if paleta.get("_status") != "aprobada":
        print(f"FAIL identidad {paleta.get('_status')!r}: se aprueba antes de maquetar")
        return 2

    destino = pathlib.Path(args.salida)
    if not destino.is_absolute():
        destino = RAIZ / destino
    con_fuentes = (destino.parent / "fonts" / "fonts.css").exists()
    html, css = construir(brief, paleta, con_fuentes)
    destino.parent.mkdir(parents=True, exist_ok=True)
    destino.write_text(html, encoding="utf-8")
    destino.with_name("mockup.css").write_text(css, encoding="utf-8")
    try:
        visible = destino.relative_to(RAIZ)
    except ValueError:
        visible = destino
    print(f"OK: {visible}")
    print(f"OK: {visible.with_name('mockup.css')}")
    print("siguiente: capturar a 1440x900 y servir al buzon (--tab webdemo --slot main)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
