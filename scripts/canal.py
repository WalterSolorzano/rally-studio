"""Escritura de contratos del canal con respaldo de la version anterior.

Un contrato es el unico registro de lo que un rol entrego. Si dos escrituras caen sobre
el mismo NN-rol.json, la segunda borra a la primera y nada lo avisa: el canal parece
completo y un rol nunca trabajo. Guardar por aqui deja la version anterior en
NN-rol.json.bak antes de reemplazar, y escribe con archivo temporal + os.replace para
que un corte a mitad no deje el contrato a medias.

Uso:
    from scripts.canal import escribir, recuperar
    escribir(carpeta, "02-presupuestador.json", datos)
    anterior = recuperar(carpeta, "02-presupuestador.json")
"""

from __future__ import annotations

import json
import os
import re
from pathlib import Path

PATRON = re.compile(r"^(\d{2})-([a-z0-9_]+)\.json$")


def _validar(nombre: str) -> None:
    if not PATRON.match(str(nombre)):
        raise ValueError(
            f"nombre de contrato invalido: {nombre!r}. Se espera NN-rol.json "
            "(dos digitos, guion, rol en minusculas)"
        )


def ruta_respaldo(carpeta: str | Path, nombre: str) -> Path:
    """NN-rol.json -> NN-rol.json.bak, al lado del contrato."""
    return Path(carpeta) / f"{nombre}.bak"


def escribir(carpeta: str | Path, nombre: str, datos: dict) -> Path:
    """Guarda el contrato. Si ya existia, la version anterior queda en .bak.

    Devuelve la ruta del contrato escrito.
    """
    _validar(nombre)
    carpeta = Path(carpeta)
    carpeta.mkdir(parents=True, exist_ok=True)
    destino = carpeta / nombre
    texto = json.dumps(datos, ensure_ascii=False, indent=2)

    temporal = carpeta / f".{nombre}.tmp"
    temporal.write_text(texto, encoding="utf-8")
    try:
        json.loads(temporal.read_text(encoding="utf-8"))
    except ValueError as exc:
        temporal.unlink(missing_ok=True)
        raise ValueError(f"{nombre}: el contrato no es JSON valido ({exc})") from exc

    if destino.exists():
        os.replace(destino, ruta_respaldo(carpeta, nombre))
    os.replace(temporal, destino)
    return destino


def recuperar(carpeta: str | Path, nombre: str) -> dict | None:
    """Devuelve la version anterior del contrato, o None si nunca se sobrescribio."""
    _validar(nombre)
    respaldo = ruta_respaldo(carpeta, nombre)
    if not respaldo.is_file():
        return None
    return json.loads(respaldo.read_text(encoding="utf-8"))


def hubo_sobrescritura(carpeta: str | Path, nombre: str) -> bool:
    """True si existe un .bak: alguien escribio encima de un contrato ya entregado."""
    _validar(nombre)
    return ruta_respaldo(carpeta, nombre).is_file()
