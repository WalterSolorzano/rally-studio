#!/usr/bin/env python3
"""verificar_identidad.py -- Compuertas G1 y G3 del plan.

Comprueba que la capa proyecto no arrastre identidad ajena y que, cuando
exista identidad, sea la aprobada y cumpla contraste.

G3 se mide contra el sistema propio: radios, sombras y motion salen de los
roles declarados en brand/tokens.css; los pisos universales solo aplican
cuando la identidad aun no existe. `--tipo` reconoce el bisel de una pieza
de dispositivo, que no es un radio de tarjeta.

Estados validos:
    base vacia   -> brand/palette.json pendiente, cero hex en site/, tokens sin hex  -> OK
    identidad    -> _status aprobada, tokens completos, contraste >= 4.5            -> OK

Uso:
    python scripts/verificar_identidad.py [--tipo landing|app-movil|web-app|pieza-3d]
Salida: lineas "OK/FAIL <chequeo>" y codigo 1 si algo falla.
"""
from __future__ import annotations

import argparse
import json
import os
import pathlib
import re
import sys

RAIZ = pathlib.Path(__file__).resolve().parent.parent
PALETTE = RAIZ / "brand" / "palette.json"
TOKENS = RAIZ / "brand" / "tokens.css"
SITE = RAIZ / "site"
STATE = pathlib.Path(
    os.environ.get("RALLY_DATA_DIR", str(RAIZ / "dashboard" / "data"))
) / "state.json"

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


def leer_escalas() -> dict[str, str]:
    """Todo token con su valor crudo: radios, sombras, motion y colores."""
    texto = TOKENS.read_text(encoding="utf-8") if TOKENS.exists() else ""
    return {k: v.strip() for k, v in re.findall(r"(--[a-z0-9-]+):\s*([^;\n}]+)", texto)}


RADIO_MAX = 18           # piso universal cuando el plan no declara escala
SOMBRAS_MAX = 2          # piso universal: fuera de eso, la pieza parece flotar
TOPE_DISPOSITIVO = 44    # bisel de telefono o marco de ventana: plasma, no tarjeta
SELECTORES_DISPOSITIVO = (".bisel", ".telefono", ".ventana", ".visor-marco")
MOTION_PISO = {"120ms"}  # piso universal cuando el plan no declara motion
NUMERICO = re.compile(r"\.(?:cifra|dato|detalle|tabla|precio|costo|lista)|var\(--font-mono\)")
BLOQUE = re.compile(r"([^{}]+)\{([^{}]*)\}")


def verificar_gramatica(tipo: str = "landing") -> None:
    """G3 -- la pieza respeta el sistema que ella misma declara (SS2.2)."""
    hojas = [a for a in SITE.glob("*.css")]
    if not hojas:
        fail("site/ sin CSS: no hay capa visual que verificar")
        return

    for pagina in SITE.glob("*.html"):
        if "style=" in pagina.read_text(encoding="utf-8"):
            fail(f"{pagina.name} con estilos inline: prohibido (SS2.2 regla 10)")

    tokens = leer_escalas()
    radios = {v for k, v in tokens.items() if k.startswith("--radius-")}
    sombras = [v for k, v in tokens.items() if k.startswith("--shadow-")]
    motion = {v for k, v in tokens.items() if k.startswith("--motion-")} or MOTION_PISO
    tope_piso = max((int(v[:-2]) for v in radios if v.endswith("px")), default=RADIO_MAX)

    for hoja in hojas:
        texto = hoja.read_text(encoding="utf-8")
        nombre = hoja.name
        malos: list[str] = []
        sombra_mala: list[str] = []
        duraciones: set[str] = set()

        for selector, cuerpo in BLOQUE.findall(texto):
            tope = tope_piso
            if tipo != "landing" and any(s in selector for s in SELECTORES_DISPOSITIVO):
                tope = max(tope, TOPE_DISPOSITIVO)
            for valor in re.findall(r"border-radius:\s*([^;}]+)", cuerpo):
                for parte in valor.split():
                    if parte.endswith("px") and float(parte[:-2]) > tope:
                        malos.append(f"{selector.strip()}:{parte}")
            for valor in re.findall(r"box-shadow:\s*([^;}]+)", cuerpo):
                if valor.strip() not in {"none"} and "var(--" not in valor:
                    sombra_mala.append(selector.strip())
            for valor in re.findall(r"(?:transition|animation)(?:-duration)?:\s*([^;}]+)", cuerpo):
                duraciones |= {d for d in re.findall(r"\d+m?s", valor) if d}

        if malos:
            fail(f"{nombre}: radio(s) {', '.join(sorted(set(malos))[:4])} fuera de la escala")
        else:
            ok(f"G3 {nombre}: radios dentro de la escala ({tope_piso}px)")

        if len(sombras) > SOMBRAS_MAX and not sombra_mala:
            fail(f"{nombre}: {len(sombras)} roles de sombra (>{SOMBRAS_MAX})")
        if sombra_mala:
            fail(f"{nombre}: sombra(s) fuera de token en {', '.join(sorted(set(sombra_mala))[:3])}")
        else:
            ok(f"G3 {nombre}: sombras derivadas de token")

        fuera = {d for d in duraciones if d not in motion}
        if fuera:
            fail(f"{nombre}: motion {', '.join(sorted(fuera))} fuera de {', '.join(sorted(motion))}")
        else:
            ok(f"G3 {nombre}: motion dentro de los roles declarados")

        if NUMERICO.search(texto):
            if "font-variant-numeric" not in texto:
                fail(f"{nombre}: cifras alineadas sin tabular-nums (SS2.2 regla 3)")
            else:
                ok(f"G3 {nombre}: cifras tabulares donde hay columnas")
        if "@keyframes" in texto and "prefers-reduced-motion" not in texto:
            fail(f"{nombre}: @keyframes sin bloque prefers-reduced-motion")
        if "@keyframes" in texto:
            ok(f"G3 {nombre}: movimiento con respeto por reduced-motion")


def _texto(valor) -> str:
    if isinstance(valor, str):
        return valor
    if isinstance(valor, dict):
        return " ".join(_texto(v) for v in valor.values())
    if isinstance(valor, list):
        return " ".join(_texto(v) for v in valor)
    return ""


# Palabras que no tienen uso honesto en un pautado: si aparecen, hay que poner el dato.
DUROS = """paradigma sinergia sinérgico holístico transversal multifacético invaluable
imprescindible zeitgeist crisol pináculo embarcarse conceptualizar desbloquear empoderar
beneficubrimiento influenciativa emocionabilidad intelligentización""".split()

# Se aceptan en su sentido técnico, pero se avisan para que nadie las use de relleno.
BLANDOS = """fundamental crucial clave esencial vital robusto estimulante ejemplar emocionante
transformador innovador dinámico versátil integral exhaustivo estratégico óptimo meticuloso
vibrante ecosistema panorama paisaje tapiz catalizador ámbito reino mosaico nexo trayectoria
esfera terreno profundizar desglosar destacar explorar aprovechar potenciar impulsar maximizar
optimizar navegar elevar además asimismo diversos numerosos múltiples encapsula notable
subrayar escrutinio perfecto interrelación testimonio legado""".split()

FRASES_PROHIBIDAS = [
    "no es solo", "es importante destacar", "al final del día",
    "juega un papel fundamental", "marca un hito", "sin más preámbulos",
    "profundicemos en", "claro, aquí tienes", "espero que esto te ayude",
    "como modelo de lenguaje", "en conclusión", "en definitiva",
    "cabe destacar", "vale la pena", "en última instancia",
    "en el panorama actual", "en un mundo cada vez más",
    "utm_source=chatgpt.com", "turn0search0", "oaicite",
]

SECCIONES_REDACCION = ("pautado", "script", "model_canvas", "challenges",
                       "solution_simple", "solution_thesis", "description_one_line")


def verificar_redaccion() -> None:
    """G4 -- el texto del proyecto no habla como una IA (skills/_comun/patrones-ia.md)."""
    if not STATE.exists():
        ok("G4 redaccion: sin state.json, no hay texto que revisar")
        return
    try:
        datos = json.loads(STATE.read_text(encoding="utf-8-sig"))
    except (OSError, ValueError) as exc:
        fail(f"G4 redaccion: state.json ilegible ({exc})")
        return

    duros: list[str] = []
    blandos: list[str] = []
    frases: list[str] = []
    for seccion in SECCIONES_REDACCION:
        blob = _texto(datos.get(seccion)).lower()
        if not blob:
            continue
        for palabra in DUROS:
            if re.search(rf"\b{re.escape(palabra)}\b", blob):
                duros.append(f"{seccion}:{palabra}")
        for palabra in BLANDOS:
            if re.search(rf"\b{re.escape(palabra)}\b", blob):
                blandos.append(f"{seccion}:{palabra}")
        for frase in FRASES_PROHIBIDAS:
            if frase in blob:
                frases.append(f"{seccion}:'{frase}'")

    if duros or frases:
        if duros:
            fail(f"G4 redaccion: {len(duros)} palabra(s) vetada(s) -- {', '.join(duros[:6])}")
        if frases:
            fail(f"G4 redaccion: {len(frases)} frase(s) de IA -- {', '.join(frases[:6])}")
    else:
        ok("G4 redaccion: sin patrones de IA vetados")

    if blandos:
        print(f"AVISO G4 redaccion: {len(blandos)} palabra(s) de relleno -- {', '.join(blandos[:8])}")


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Identidad del proyecto por tipo de pieza.")
    parser.add_argument(
        "--tipo", default="landing",
        choices=("landing", "app-movil", "web-app", "pieza-3d"),
        help="pieza generada en site/; el bisel de dispositivo solo es legal fuera de la landing",
    )
    args = parser.parse_args(argv)
    verificar_redaccion()

    if not PALETTE.exists():
        fail("brand/palette.json no existe: la capa proyecto debe declarar su estado")
        return 1

    datos = json.loads(PALETTE.read_text(encoding="utf-8-sig"))
    estado = datos.get("_status")
    colores = {k: v for k, v in datos.items() if not k.startswith("_")}

    # G1b -- cero hex en la capa publica del proyecto. tokens.css es la fuente
    # de color copiada a site/ al generar: ahi el hex es el dato, no una huella.
    sucios = []
    for patron in ("*.css", "*.html"):
        for archivo in SITE.glob(patron):
            if archivo.name == "tokens.css":
                continue
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

    verificar_gramatica(args.tipo)

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
    suelo = tokens.get("--bg-subtle", bg)
    # Todos los pares textuales, incluidos muted y faint, sobre las dos superficies.
    for nombre in ("--text-title", "--text-main", "--text-body", "--text-muted", "--text-faint"):
        if nombre not in tokens:
            continue
        for fondo_nombre, fondo in (("--bg-app", bg), ("--bg-subtle", suelo)):
            ratio = contraste(tokens[nombre], fondo)
            if ratio < 4.5:
                fail(f"{nombre} sobre {fondo_nombre} = {ratio}:1 (< 4.5 AA)")
            else:
                ok(f"{nombre} sobre {fondo_nombre} = {ratio}:1")
    # Elementos no textuales esenciales: borde fuerte y anillo de foco, 3:1.
    for nombre in ("--border-strong", "--border-focus"):
        if nombre not in tokens:
            continue
        ratio = contraste(tokens[nombre], bg)
        if ratio < 3:
            fail(f"{nombre} sobre --bg-app = {ratio}:1 (< 3:1 no textual)")
        else:
            ok(f"{nombre} sobre --bg-app = {ratio}:1 (>= 3:1)")
    for nombre in ("--color-primary", "--color-primary-hover"):
        if nombre not in tokens:
            continue
        ratio = contraste(tokens[nombre], bg)
        if ratio < 4.5:
            fail(f"{nombre} sobre --bg-app = {ratio}:1 (< 4.5 AA)")
        else:
            ok(f"{nombre} sobre --bg-app = {ratio}:1")

    return 1 if fallos else 0


if __name__ == "__main__":
    raise SystemExit(main())
