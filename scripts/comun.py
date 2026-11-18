#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""Base compartida del sistema: una sola fuente para lo que estaba copiado.

Antes de este archivo, las fracciones de los cuatro actos y su color vivian
repetidos en varios generadores, y ya habian derivado:

* `scripts/gen_storyboard_visual.py:43` pintaba el Acto I de rojo
  (`#f81110`), que el proyecto reserva para "grabando".
* `scripts/gen_report_figures.py:208` ubicaba el Acto III en el segundo 60 y el
  IV en el 95, cuando la rubrica dice 39.6 y 74.4.

Aqui no se inventa nada: las fracciones se **leen** de
`knowledge/rubric_matrices.md` (§3), que es el documento que manda. Si ese
documento cambia, cambia todo lo que use este modulo.

Uso desde cualquier script del repo:

    import sys
    from pathlib import Path
    sys.path.insert(0, str(Path(__file__).resolve().parents[N] / "scripts"))
    from comun import ACTOS, COLORES, DURACION, mmss, utf8
"""
from __future__ import annotations

import json
import math
import re
import sys
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
RUBRICA = RAIZ / "knowledge" / "rubric_matrices.md"
PALETA = RAIZ / "brand" / "palette.json"

DURACION = 120.0  # segundos de video que exige el certamen

# Etiqueta interna de cada acto. La rubrica los llama Problema / Solucion /
# Prefactibilidad / Cierre; el equipo los nombra asi desde el primer dia y no
# conviene cambiar lo que ya se lee en pantalla.
ETIQUETAS = {"I": "Dolor", "II": "Caja negra", "III": "Prefactibilidad", "IV": "Cierre"}

# Escala de interfaz. Sin rojo: el rojo se reserva para "grabando".
COLORES = {"I": "#0d1b35", "II": "#0866f5", "III": "#0284c7", "IV": "#94a3b8"}

# Respaldo si el documento de rubrica no se puede leer. Es el mismo numero que
# esta escrito alla; no es una segunda verdad.
_FRACCIONES_RESPALDO = {"I": 0.17, "II": 0.33, "III": 0.29, "IV": 0.21}

_FILA = re.compile(r"^\|\s*(I{1,3}V?|IV)\s*[—-]\s*([^|]+?)\s*\|\s*(\d{1,2})\s*%\s*\|", re.M)


def _leer_fracciones() -> dict[str, float]:
    try:
        texto = RUBRICA.read_text(encoding="utf-8")
    except OSError:
        return dict(_FRACCIONES_RESPALDO)
    hallado = {}
    for romano, _nombre, pct in _FILA.findall(texto):
        valor = round(int(pct) / 100.0, 4)
        if romano not in hallado or hallado[romano] + valor <= 1.0001:
            hallado.setdefault(romano, valor)
    if set(hallado) != set(_FRACCIONES_RESPALDO):
        return dict(_FRACCIONES_RESPALDO)
    suma = sum(hallado.values())
    if abs(suma - 1.0) > 0.001:
        return dict(_FRACCIONES_RESPALDO)
    return hallado


FRACCIONES = _leer_fracciones()

#: [(clave, etiqueta, fraccion)] en el orden del video.
ACTOS = [(clave, ETIQUETAS[clave], FRACCIONES[clave]) for clave in ("I", "II", "III", "IV")]


def ventanas(total: float = DURACION) -> list[dict]:
    """Reparte `total` segun las fracciones y devuelve inicio/fin de cada acto.

    Es el unico lugar donde se calculan los cortes: antes cada generador los
    escribia a mano y por eso el Acto III aparecia en el segundo 60 en una
    figura y en el 39.6 en otra.
    """
    reloj = 0.0
    salida = []
    for clave, etiqueta, frac in ACTOS:
        largo = round(total * frac, 2)
        salida.append({
            "id": clave, "etiqueta": etiqueta, "fraccion": frac,
            "ini": round(reloj, 2), "fin": round(reloj + largo, 2),
            "dur": largo, "color": COLORES[clave],
        })
        reloj += largo
    return salida


def mmss(segundos: float) -> str:
    segundos = max(0.0, float(segundos))
    return "%02d:%02d" % (int(segundos // 60), int(segundos % 60))


def utf8() -> None:
    """Consola en UTF-8: sin esto, `→` y `·` revientan en Windows."""
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
        sys.stderr.reconfigure(encoding="utf-8", errors="replace")
    except Exception:  # noqa: BLE001
        pass


def lista_de(valor) -> list[str]:
    """Lista de textos a partir de `None`, lista o cadena separada por comas.

    Antes vivia copiada en `build_shotlist._v` y `pre_render_check._v`.
    """
    if valor is None:
        return []
    if isinstance(valor, list):
        return [str(x).strip() for x in valor if str(x).strip()]
    return [t.strip() for t in str(valor).split(",") if t.strip()]


def wilson(k: int, n: int, z: float = 1.96) -> tuple[float, float]:
    """Intervalo de confianza de Wilson para una proporcion k/n.

    Antes vivia copiada en `sirli_modelo.py` y `sirli_modelo_solucion.py`.
    """
    if n == 0:
        return (0.0, 0.0)
    p = k / n
    d = 1 + z * z / n
    c = (p + z * z / (2 * n)) / d
    m = z * math.sqrt(p * (1 - p) / n + z * z / (4 * n * n)) / d
    return (max(0.0, c - m), min(1.0, c + m))


def leer_json(ruta: Path | str, defecto=None):
    try:
        return json.loads(Path(ruta).read_text(encoding="utf-8"))
    except Exception:  # noqa: BLE001
        return defecto


def escribir_json(ruta: Path | str, datos) -> Path:
    destino = Path(ruta)
    destino.parent.mkdir(parents=True, exist_ok=True)
    destino.write_text(json.dumps(datos, ensure_ascii=False, indent=2), encoding="utf-8")
    return destino


def paleta() -> dict:
    """Colores del proyecto. `brand/palette.json` manda; esto solo lo lee."""
    datos = leer_json(PALETA, {}) or {}
    return {k: v for k, v in datos.items() if not k.startswith("_")}


def main() -> int:
    utf8()
    print("actos    " + "  ".join("%s=%s %.0f%%" % (c, e, f * 100) for c, e, f in ACTOS))
    for v in ventanas():
        print("  %-3s %-15s %s -> %s  (%.1f s)  %s"
              % (v["id"], v["etiqueta"], mmss(v["ini"]), mmss(v["fin"]), v["dur"], v["color"]))
    print("paleta   " + json.dumps(paleta(), ensure_ascii=False))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
