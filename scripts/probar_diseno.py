#!/usr/bin/env python3
"""probar_diseno.py -- Compuerta G2 de la pieza: lo que delata a una plantilla.

Caza morado de IA y sus vecinos, glassmorphism, emojis, rejillas de tarjetas
clonadas, espaciado fuera de la escala declarada, mas de tres familias, iconos
con trazo desigual y un protagonista que no manda en la primera pantalla.

Lo que el plan no declara no se inventa: se avisa como INFO y no se falla.
Los datos del producto salen de brief.json (bloque producto).

Uso:
    python scripts/probar_diseno.py [--raiz .] [--tipo landing|app-movil|web-app|pieza-3d]
Salida: lineas OK/FAIL/INFO y codigo 1 si hay una huella de plantilla.
"""
from __future__ import annotations

import argparse
import colorsys
import json
import pathlib
import re
import sys

EMOJI = re.compile("[\U0001F300-\U0001FAFF\u2600-\u27BF\u2B00-\u2BFF]")
HEX = re.compile(r"#[0-9a-fA-F]{6}\b")
HEX3 = re.compile(r"#[0-9a-fA-F]{3}\b")
FAMILIA = re.compile(r"font-family:\s*([^;}]+)")
ESPACIO = re.compile(r"(?:padding|margin|gap)(?:-[a-z]+)?:\s*([^;}]+)")
PX = re.compile(r"(-?\d+(?:\.\d+)?)px")
STROKE = re.compile(r"stroke-width=\"([\d.]+)\"")
PLANTILLA_CARD = re.compile(r"\b(?:tarjeta|card)(?:[-_][a-z0-9-]+)?\b")
PROTAGONISTAS = (".protagonista", ".bisel", ".ventana", ".visor-marco", ".hero")
METADATOS = (".tablero", ".ficha", ".lateral", ".panel")
TOKENS_EXENTO = "tokens.css"


def _morado(hexa: str) -> bool:
    h = hexa.lstrip("#")
    if len(h) == 3:
        h = "".join(c * 2 for c in h)
    r, g, b = (int(h[i:i + 2], 16) / 255 for i in (0, 2, 4))
    tono, luz, saturacion = colorsys.rgb_to_hls(r, g, b)
    grados = tono * 360
    return 250 <= grados <= 330 and saturacion > 0.35 and 0.15 < luz < 0.9


def _leer(ruta: pathlib.Path) -> str:
    return ruta.read_text(encoding="utf-8", errors="replace") if ruta.exists() else ""


def piezas(raiz: pathlib.Path) -> tuple[list[pathlib.Path], list[pathlib.Path]]:
    site = raiz / "site"
    hojas = [p for p in site.glob("*.css") if p.name != TOKENS_EXENTO] if site.exists() else []
    paginas = list(site.glob("*.html")) if site.exists() else []
    return hojas, paginas


def plan(raiz: pathlib.Path) -> dict:
    ruta = raiz / "brief.json"
    try:
        return json.loads(_leer(ruta) or "{}").get("producto") or {}
    except ValueError:
        return {}


def escalas(raiz: pathlib.Path) -> dict[str, list[str]]:
    """Valores declarados en tokens: espacio, radio, motion."""
    texto = _leer(raiz / "brand" / "tokens.css")
    tokens = dict(re.findall(r"(--[a-z0-9-]+):\s*([^;\n}]+)", texto))
    return {
        prefijo: [v.strip() for k, v in tokens.items() if v.strip() and k.startswith(prefijo)]
        for prefijo in ("--space-", "--radius-", "--motion-")
    }


ESTADOS = {
    "hover": (":hover",),
    "focus": (":focus", ":focus-visible"),
    "disabled": ("disabled", 'data-state="disabled"'),
    "vacio": ("vacio", "empty", 'data-state="vacio"'),
    "error": ("error", 'data-state="error"'),
}


def _estado_dibujado(estado: str, cuerpo: str) -> bool:
    pistas = ESTADOS.get(estado.lower(), (estado,))
    return any(pista in cuerpo for pista in pistas)


def revisar(raiz: pathlib.Path, tipo: str = "landing") -> list[str]:
    fallos: list[str] = []
    hojas, paginas = piezas(raiz)
    producto = plan(raiz)
    declarado = escalas(raiz)
    cuerpo_pieza = "".join(_leer(h) for h in hojas) + "".join(_leer(p) for p in paginas)

    if not hojas and not paginas:
        return ["site/ sin pieza que revisar"]

    for hoja in hojas:
        texto = _leer(hoja)
        nombre = hoja.name
        for hexa in HEX.findall(texto) + HEX3.findall(texto):
            if _morado(hexa):
                fallos.append(f"{nombre}: {hexa} es morado de IA o vecino")
        if "backdrop-filter" in texto or "blur(" in texto:
            fallos.append(f"{nombre}: glassmorphism (backdrop-filter o blur)")
        if re.search(r"background:\s*rgba\([^)]*,\s*0?\.\d", texto) and "blur" not in texto:
            fallos.append(f"{nombre}: fondo translucido de plantilla")
        familias = set()
        for valor in FAMILIA.findall(texto):
            for familia in valor.split(","):
                limpio = familia.strip().strip("\"'")
                if limpio and "var(" not in limpio and limpio not in {"inherit", "system-ui"}:
                    familias.add(limpio)
        if len(familias) > 3:
            fallos.append(f"{nombre}: {len(familias)} familias ({', '.join(sorted(familias)[:4])})")
        if tipo != "landing" and declarado["--space-"]:
            escala = {int(float(p)) for v in declarado["--space-"] for p in PX.findall(v)}
            fuera = set()
            for valor in ESPACIO.findall(texto):
                for p in PX.findall(re.sub(r"var\([^)]*\)", "", valor)):
                    if abs(float(p)) >= 8 and int(float(p)) not in escala:
                        fuera.add(f"{p}px")
            if fuera:
                fallos.append(f"{nombre}: espaciado fuera de la escala {', '.join(sorted(fuera)[:4])}")
        if "@keyframes" in texto and "prefers-reduced-motion" not in texto:
            fallos.append(f"{nombre}: @keyframes sin prefers-reduced-motion")

    for pagina in paginas:
        texto = _leer(pagina)
        nombre = pagina.name
        if "style=" in texto:
            fallos.append(f"{nombre}: estilos inline")
        encontrado = EMOJI.search(texto)
        if encontrado:
            fallos.append(f"{nombre}: emoji {encontrado.group(0)!r} como icono")
        if HEX.search(texto) or HEX3.search(re.sub(r"<!--.*?-->", "", texto, flags=re.S)):
            fallos.append(f"{nombre}: color literal en el HTML")
        trazos = set(STROKE.findall(texto))
        if len(trazos) > 1:
            fallos.append(f"{nombre}: trazos de icono desiguales ({', '.join(sorted(trazos))})")
        for selector in PROTAGONISTAS:
            clase = selector.lstrip(".")
            patron = re.compile(rf"class=\"[^\"]*\b{re.escape(clase)}\b")
            if patron.search(texto):
                break
        else:
            fallos.append(f"{nombre}: sin protagonista declarado ({', '.join(PROTAGONISTAS)})")
        if len(PLANTILLA_CARD.findall(texto)) >= 6:
            fallos.append(f"{nombre}: rejilla de tarjetas clonadas")
        for estado in producto.get("estados") or []:
            if not isinstance(estado, str):
                continue
            if not _estado_dibujado(estado, cuerpo_pieza):
                fallos.append(f"la pieza no dibuja el estado declarado '{estado}'")

    return fallos


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Huellas de plantilla en la pieza.")
    parser.add_argument("--raiz", default=".")
    parser.add_argument("--tipo", default="landing",
                        choices=("landing", "app-movil", "web-app", "pieza-3d"))
    args = parser.parse_args(argv)
    raiz = pathlib.Path(args.raiz).resolve()
    fallos = revisar(raiz, args.tipo)
    if fallos:
        for fallo in fallos:
            print(f"FAIL {fallo}")
        print(f"FAIL diseno: {len(fallos)} huella(s) de plantilla en la pieza")
        return 1
    hojas, paginas = piezas(raiz)
    print(f"OK   diseno: {len(hojas) + len(paginas)} archivo(s) sin huellas de plantilla")
    print("OK   diseno: sin morado de IA, sin glassmorphism, sin emojis, sin tarjetas clonadas")
    return 0


if __name__ == "__main__":
    sys.exit(main())
