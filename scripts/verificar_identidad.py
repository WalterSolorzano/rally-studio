#!/usr/bin/env python3
"""verificar_identidad.py -- Compuerta G1 del plan.

Comprueba que la capa proyecto no arrastre identidad ajena y que, cuando
exista identidad, sea la aprobada y cumpla contraste.

Estados validos:
    base vacia   -> brand/palette.json pendiente, cero hex en site/, tokens sin hex  -> OK
    identidad    -> _status aprobada, tokens completos, contraste >= 4.5            -> OK

Uso:
    python scripts/verificar_identidad.py
Salida: lineas "OK/FAIL <chequeo>" y codigo 1 si algo falla.
"""
from __future__ import annotations

import json
import pathlib
import re
import sys

RAIZ = pathlib.Path(__file__).resolve().parent.parent
PALETTE = RAIZ / "brand" / "palette.json"
TOKENS = RAIZ / "brand" / "tokens.css"
SITE = RAIZ / "site"

HEX = re.compile(r"#[0-9a-fA-F]{6}\b")
REQUERIDAS = [
    "--bg-app", "--bg-subtle", "--bg-secondary",
    "--text-title", "--text-main", "--text-body", "--text-muted", "--text-faint",
    "--border-light", "--border-strong",
    "--color-primary", "--color-primary-hover", "--color-accent", "--border-focus",
    "--status-err",
]

fallos: list[str] = []


def ok(msg: str) -> None:
    print(f"OK   {msg}")


def fail(msg: str) -> None:
    print(f"FAIL {msg}")
    fallos.append(msg)


def luminance(hex_color: str) -> float:
    h = hex_color.lstrip("#")
    c = [int(h[i:i + 2], 16) / 255.0 for i in (0, 2, 4)]
    c = [v / 12.92 if v <= 0.03928 else ((v + 0.055) / 1.055) ** 2.4 for v in c]
    return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]


def contraste(a: str, b: str) -> float:
    la, lb = luminance(a), luminance(b)
    return round((max(la, lb) + 0.05) / (min(la, lb) + 0.05), 2)


def leer_tokens() -> dict[str, str]:
    texto = TOKENS.read_text(encoding="utf-8") if TOKENS.exists() else ""
    return dict(re.findall(r"(--[a-z0-9-]+):\s*(#[0-9a-fA-F]{6})", texto))


RADIO_MAX = 18
SOMBRAS_MAX = 2


def verificar_gramatica() -> None:
    """G3 -- la capa proyecto respeta la gramatica heredada de DESIGN.md (SS2.2)."""
    hojas = [a for a in SITE.glob("*.css")]
    if not hojas:
        fail("site/ sin CSS: no hay capa visual que verificar")
        return

    for hoja in hojas:
        texto = hoja.read_text(encoding="utf-8")
        nombre = hoja.name

        # Inline styles en el HTML publicado
        for pagina in SITE.glob("*.html"):
            if "style=" in pagina.read_text(encoding="utf-8"):
                fail(f"{pagina.name} con estilos inline: prohibido (SS2.2 regla 10)")

        # Radios: solo px, 18 como techo; 50% se admite para puntos circulares
        malos = []
        for valor in re.findall(r"border-radius:\s*([^;}]+)", texto):
            for parte in valor.split():
                if not parte.endswith("px"):
                    continue
                if float(parte[:-2]) > RADIO_MAX:
                    malos.append(parte)
        if malos:
            fail(f"{nombre}: radio(s) {', '.join(sorted(set(malos)))} > {RADIO_MAX}px")
        else:
            ok(f"G3 {nombre}: radios dentro de {RADIO_MAX}px")

        # Profundidad plana
        sombras = re.findall(r"box-shadow:\s*([^;}]+)", texto)
        if len(sombras) > SOMBRAS_MAX:
            fail(f"{nombre}: {len(sombras)} box-shadow (> {SOMBRAS_MAX} permitidas)")
        else:
            ok(f"G3 {nombre}: {len(sombras)} box-shadow (max {SOMBRAS_MAX})")

        # Respuesta tactil: toda duracion es 120ms
        duraciones = {d for d in re.findall(r"transition:[^;]*?(\d+m?s)", texto) if d != "120ms"}
        if duraciones:
            fail(f"{nombre}: transiciones {', '.join(sorted(duraciones))} (regla: 120ms)")
        else:
            ok(f"G3 {nombre}: transiciones a 120ms")

        # Cifras tabulares cuando hay mono en un bloque numerico
        if "font-variant-numeric" not in texto:
            fail(f"{nombre}: sin font-variant-numeric (SS2.2 regla 3)")


def main() -> int:
    if not PALETTE.exists():
        fail("brand/palette.json no existe: la capa proyecto debe declarar su estado")
        return 1

    datos = json.loads(PALETTE.read_text(encoding="utf-8-sig"))
    estado = datos.get("_status")
    colores = {k: v for k, v in datos.items() if not k.startswith("_")}

    # G1b -- cero hex en la capa publica del proyecto
    sucios = []
    for patron in ("*.css", "*.html"):
        for archivo in SITE.glob(patron):
            for num, linea in enumerate(archivo.read_text(encoding="utf-8").splitlines(), 1):
                if HEX.search(linea):
                    try:
                        nombre = archivo.relative_to(RAIZ)
                    except ValueError:
                        nombre = archivo
                    sucios.append(f"{nombre}:{num}")
    if sucios:
        fail(f"{len(sucios)} hex literal(es) en site/: {', '.join(sucios[:5])}")
    else:
        ok("G1b cero hex literal en site/")

    verificar_gramatica()

    tokens = leer_tokens()

    if estado == "pendiente" and not colores:
        # Base vacia: correcto. Solo se exige que la plantilla no traiga color.
        if tokens:
            fail(f"brand/tokens.css con {len(tokens)} color(es) y paleta pendiente: identidad heredada")
        else:
            ok("G1a base vacia: palette pendiente y tokens sin color")
        return 1 if fallos else 0

    if estado != "aprobada":
        fail(f"brand/palette.json tiene colores pero _status={estado!r}: nada se aplica sin aprobacion")
        return 1

    ok("G1a paleta aprobada")
    faltan = [v for v in REQUERIDAS if v not in tokens]
    if faltan:
        fail(f"brand/tokens.css incompleto: faltan {', '.join(faltan[:6])}")
        return 1
    ok(f"tokens completos ({len(tokens)} variables)")

    bg = tokens["--bg-app"]
    for nombre in ("--text-main", "--text-body", "--color-primary", "--color-primary-hover"):
        ratio = contraste(tokens[nombre], bg)
        if ratio < 4.5:
            fail(f"{nombre} sobre --bg-app = {ratio}:1 (< 4.5 AA)")
        else:
            ok(f"{nombre} sobre --bg-app = {ratio}:1")

    return 1 if fallos else 0


if __name__ == "__main__":
    raise SystemExit(main())
