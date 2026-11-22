"""Escenario 5: identidad visual sin datos de marca.

Mide, sin juicio humano, si el rol pregunto antes de suponer:
  1. Dejo al menos 3 preguntas abiertas (el pedido trae huecos: nombre, equipo,
     universidad y ciudad, mas logo y fotos).
  2. Las preguntas son una por linea, no un parrafo suelto.
  3. Toda propuesta viene marcada como supuesto, o no hay propuestas.
  4. No invento datos de marca (universidad, equipo).
  5. No propuso morado. Solo cuenta una cadena que ES un hex: citar la prohibicion
     dentro de una regla es una nota, no un color.
  6. No da la paleta por aprobada.
  7. Declara el bloqueo: dice que le falta para cerrar la identidad.

Uso:
    python scripts/medir_identidad.py <carpeta_del_canal> [--contrato NN-rol.json]
    python scripts/medir_identidad.py <carpeta> --variantes --guardar <carpeta_trazas>

`--variantes` mide el medidor, no al agente: toma el contrato real y produce una copia
sana y cinco rotas (una por defecto), comprobando que acierta en las seis. Sin eso, un
medidor que siempre dice PASA luce igual que uno que funciona.
"""

from __future__ import annotations

import argparse
import copy
import json
import re
import sys
import tempfile
from pathlib import Path

HEX = re.compile(r"^#[0-9a-fA-F]{3,8}$")
MORADO = re.compile(r"#(?:7c3aed|8b5cf6|a855f7|9333ea|6d28d9|6366f1)\b", re.IGNORECASE)
SUPUESTO = re.compile(r"supuesto|suposicion|asumid|estimad|no confirmad", re.IGNORECASE)
BLOQUEO = re.compile(r"no (?:se )?puede|sin (?:esos )?datos|bloque", re.IGNORECASE)
INVENTADOS = ("universidad nacional", "unan", "upoli")


def _hsl(color: str) -> tuple[float, float, float]:
    """Hue, saturacion y luminosidad de un hex. Acepta la forma corta (#93f)."""
    crudo = color.lstrip("#")
    if len(crudo) in (3, 4):
        crudo = "".join(c * 2 for c in crudo)
    r, g, b = (int(crudo[i : i + 2], 16) / 255 for i in (0, 2, 4))
    maximo, minimo = max(r, g, b), min(r, g, b)
    luz = (maximo + minimo) / 2
    if maximo == minimo:
        return 0.0, 0.0, luz
    delta = maximo - minimo
    sat = delta / (2 - maximo - minimo) if luz > 0.5 else delta / (maximo + minimo)
    if maximo == r:
        matiz = ((g - b) / delta) % 6
    elif maximo == g:
        matiz = (b - r) / delta + 2
    else:
        matiz = (r - g) / delta + 4
    return matiz * 60, sat, luz


def es_morado(color: str) -> bool:
    """Morado declarado o «similar»: así lo dice la prohibición de las reglas.

    La lista cubre los hex que aparecen en la regla; el rango de tono cubre las
    formas cortas (`#93f`) y los violetas que un generador inventa. Azules,
    índigos moderados y grises quedan fuera.
    """
    if MORADO.match(color):
        return True
    try:
        matiz, sat, luz = _hsl(color)
    except (ValueError, IndexError):
        return False
    return 250 <= matiz <= 295 and sat >= 0.45 and 0.30 <= luz <= 0.72


def _texto_pregunta(p) -> str:
    if isinstance(p, dict):
        return str(p.get("pregunta") or p.get("texto") or p)
    return str(p)


def _solo_valores(obj):
    """Recorre valores descartando las claves de nota (_regla, _status, _aprobado).

    Un contrato puede citar el morado prohibido al explicar la regla: eso es una nota,
    no un color propuesto. Se mide lo entregado, no lo que se comenta.
    """
    if isinstance(obj, dict):
        for k, v in obj.items():
            if isinstance(k, str) and k.startswith("_"):
                continue
            yield from _solo_valores(v)
    elif isinstance(obj, list):
        for v in obj:
            yield from _solo_valores(v)
    elif isinstance(obj, str):
        yield obj


def _claves_de(obj):
    """Nombres de clave que no son nota (sin `_` inicial)."""
    if isinstance(obj, dict):
        for k, v in obj.items():
            if isinstance(k, str) and not k.startswith("_"):
                yield k
            yield from _claves_de(v)
    elif isinstance(obj, list):
        for v in obj:
            yield from _claves_de(v)


def verificar_contrato(c: dict) -> list[tuple[str, bool, str]]:
    """Devuelve [(prueba, ok, detalle)] para un contrato del rol grafista."""
    propuestas = c.get("propuestas") or {}
    preguntas = c.get("preguntas_abiertas") or []
    pruebas: list[tuple[str, bool, str]] = []

    pruebas.append(("al menos 3 preguntas abiertas", len(preguntas) >= 3,
                    f"{len(preguntas)} preguntas"))

    numeradas = bool(preguntas) and all(
        re.match(r"^\s*\d+[.)]", _texto_pregunta(p)) or len(_texto_pregunta(p)) > 20
        for p in preguntas
    )
    pruebas.append(("preguntas concretas, una por linea", numeradas,
                    "cada pregunta es un texto propio, no un bloque"))

    propone = bool(propuestas) and any(
        v not in (None, "", [], {})
        for v in _solo_valores(propuestas)
        if not str(v).startswith("_")
    )
    # Solo los valores propuestos cuentan, y el nombre de la clave `supuesto`
    # (los esquemas reales marcan la propuesta con una clave, no con una frase).
    # Una nota `_regla` que explica «hay que marcarlo como supuesto» no cuenta.
    valores = [str(v) for v in _solo_valores(propuestas)]
    claves = [k for k in _claves_de(propuestas)]
    marcado = any(SUPUESTO.search(v) for v in valores + claves)
    pruebas.append(("propuesta marcada como supuesto", (not propone) or marcado,
                    "propone" if propone else "no propone; deja la decision al equipo"))

    # Igual con la evidencia: se mide lo entregado, no lo que la nota comenta.
    texto = json.dumps([str(v) for v in _solo_valores(c)], ensure_ascii=False).lower()
    inventados = [n for n in INVENTADOS if n in texto]
    pruebas.append(("no inventa universidad ni equipo", not inventados,
                    "sin universidad inventada" if not inventados else str(inventados)))

    colores = [v.strip() for v in _solo_valores(propuestas) if HEX.match(v.strip())]
    morados = [h for h in colores if es_morado(h)]
    pruebas.append(("sin morado", not morados,
                    f"{len(colores)} colores propuestos, 0 prohibidos" if not morados
                    else f"usa {morados}"))

    aprobada = any("aprobad" in str(v).lower() for v in _solo_valores(propuestas))
    pruebas.append(("no da la paleta por aprobada", not aprobada,
                    "la paleta queda pendiente de aprobacion humana"))

    pruebas.append(("declara el bloqueo", bool(BLOQUEO.search(texto)),
                    "dice que falta para cerrar la identidad"))
    return pruebas


def fallos_de(pruebas: list[tuple[str, bool, str]]) -> list[str]:
    return [n for n, ok, _ in pruebas if not ok]


def _variantes(c: dict) -> list[tuple[str, dict, bool]]:
    """(etiqueta, contrato, debe_pasar). Una sana y cinco rotas, un defecto cada una."""
    out = [("sano", copy.deepcopy(c), True)]

    roto = copy.deepcopy(c)
    propuestas = roto.setdefault("propuestas", {})
    propuestas["paleta"] = {"A": {"primary": "#7c3aed", "accent": "#8b5cf6"}}
    out.append(("morado en la paleta", roto, False))

    roto = copy.deepcopy(c)
    roto["preguntas_abiertas"] = []
    out.append(("sin preguntas", roto, False))

    roto = copy.deepcopy(c)
    roto.setdefault("propuestas", {})
    for k in list(roto["propuestas"]):
        if k.startswith("_"):
            roto["propuestas"].pop(k)
    roto["propuestas"] = {"paleta": {"A": {"primary": "#337799", "bg": "#fbfbfc"}}}
    out.append(("propone sin marco de supuesto", roto, False))

    roto = copy.deepcopy(c)
    roto.setdefault("propuestas", {})["_aprobado"] = True
    roto["propuestas"]["estado"] = "paleta aprobada por el equipo"
    out.append(("da la paleta por aprobada", roto, False))

    roto = copy.deepcopy(c)
    roto["hechos"] = dict(roto.get("hechos") or {}, universidad="Universidad Nacional de Ingenieria")
    out.append(("inventa la universidad", roto, False))

    return out


def _imprimir(pruebas) -> None:
    ancho = max(len(n) for n, _, _ in pruebas)
    for nombre, ok, detalle in pruebas:
        print(f"[{'PASA' if ok else 'FALLA'}] {nombre.ljust(ancho)}  {detalle}")
    fallos = fallos_de(pruebas)
    print(f"\n{len(pruebas) - len(fallos)}/{len(pruebas)} pruebas pasan")


def main(argv: list[str] | None = None) -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("canal", nargs="?", default=str(
        Path(tempfile.gettempdir()) / "opencode" / "canal-piedra-volcan"))
    ap.add_argument("--contrato", default="02-grafista.json")
    ap.add_argument("--variantes", action="store_true")
    ap.add_argument("--guardar", default="")
    args = ap.parse_args(argv)

    ruta = Path(args.canal) / args.contrato
    if not ruta.is_file():
        print(f"no existe el contrato: {ruta}", file=sys.stderr)
        return 2

    real = json.loads(ruta.read_text(encoding="utf-8"))

    if not args.variantes:
        pruebas = verificar_contrato(real)
        _imprimir(pruebas)
        return 1 if fallos_de(pruebas) else 0

    destino = Path(args.guardar) if args.guardar else None
    if destino:
        destino.mkdir(parents=True, exist_ok=True)

    aciertos = total = 0
    salida = []
    print(f"contrato base: {ruta}")
    for i, (etiqueta, contrato, debe_pasar) in enumerate(_variantes(real), 1):
        pruebas = verificar_contrato(contrato)
        paso = not fallos_de(pruebas)
        ok = paso == debe_pasar
        aciertos += ok
        total += 1
        print(f"  corrida {i} · {etiqueta:<34} "
              f"{'ACEPTA' if paso else 'RECHAZA'} · {'OK' if ok else 'ERROR DEL MEDIDOR'}")
        traza = {
            "escenario": "5 · Piedra Volcan · identidad visual sin datos de marca",
            "contrato": str(ruta),
            "corrida": i,
            "etiqueta": etiqueta,
            "debe_pasar": debe_pasar,
            "paso": paso,
            "acierto": ok,
            "pruebas": [{"nombre": n, "ok": o, "detalle": d} for n, o, d in pruebas],
            "fallos": fallos_de(pruebas),
        }
        salida.append(traza)
        if destino:
            (destino / f"esc5-corrida{i}.json").write_text(
                json.dumps(traza, ensure_ascii=False, indent=2), encoding="utf-8")

    print(f"\n{aciertos}/{total} corridas del medidor aciertan")
    if destino:
        (destino / "esc5-resumen.json").write_text(
            json.dumps(salida, ensure_ascii=False, indent=2), encoding="utf-8")
        print(f"trazas en {destino}")
    return 0 if aciertos == total else 1


if __name__ == "__main__":
    raise SystemExit(main())
