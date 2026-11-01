#!/usr/bin/env python3
"""
blender_addons.py -- Instala el addon de Blender segun el tipo de proyecto.

Uso:
    python scripts/blender_addons.py --proyecto <tipo> --instalar

Tipo -> addon:
  producto / objeto tecnico       -> BlenderKit
  arquitectura / casa / modulo    -> Archimesh + MeasureIt
  control remoto IA               -> BlenderMCP (solo con permiso del director)

Registro: blender/addons_instalados.json (addon, version, fecha, tipo).
Si ya esta instalado, no reinstala.
"""
import argparse
import json
import os
from datetime import datetime, timezone
from pathlib import Path

RAIZ = Path(__file__).resolve().parents[1]
ADDONES_PATH = RAIZ / "blender" / "addons_instalados.json"
VERSION = "1.0.0"
ENV_AUTORIZADO = "BLENDERMCP_AUTORIZADO"


def addons_para_tipo(tipo):
    """Devuelve lista de addons para el tipo de proyecto (vacía si no reconoce)."""
    t = str(tipo).lower()
    if any(k in t for k in ("control", "remoto", "ia", "mcp", "blendermcp")):
        return ["BlenderMCP"]
    if any(k in t for k in ("arquitectura", "casa", "modulo", "módulo", "pared", "edificio")):
        return ["Archimesh", "MeasureIt"]
    if any(k in t for k in ("producto", "objeto", "tecnico", "técnico", "kit",
                            "modelo", "conector", "tornillo", "cable")):
        return ["BlenderKit"]
    return []


def esta_autorizado_blendermcp():
    return str(os.environ.get(ENV_AUTORIZADO, "")).strip().lower() in ("1", "true", "si", "sí")


def cargar_registro(path):
    if not path.exists():
        return []
    try:
        datos = json.loads(path.read_text(encoding="utf-8"))
    except (json.JSONDecodeError, OSError):
        return []
    if isinstance(datos, list):
        return datos
    return []


def guardar_registro(path, datos):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(datos, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")


def _ya_instalado(registro, addon):
    return any(str(e.get("addon", "")).strip().lower() == addon.lower() for e in registro if isinstance(e, dict))


def instalar(tipo, addons_path=None, autorizado=None):
    """Intenta instalar los addons del tipo. Devuelve (ok, mensajes)."""
    if addons_path is None:
        addons_path = ADDONES_PATH
    if autorizado is None:
        autorizado = esta_autorizado_blendermcp()
    addons = addons_para_tipo(tipo)
    if not addons:
        return False, [f"Tipo de proyecto no reconocido: {tipo}"]
    registro = cargar_registro(addons_path)
    mensajes = []
    for addon in addons:
        if addon == "BlenderMCP" and not autorizado:
            mensajes.append(f"BlenderMCP requiere permiso del director; no se instaló (aviso).")
            continue
        if _ya_instalado(registro, addon):
            mensajes.append(f"{addon}: ya instalado, no se reinstala.")
            continue
        registro.append({
            "addon": addon,
            "version": VERSION,
            "fecha": datetime.now(timezone.utc).isoformat(),
            "tipo": tipo,
        })
        mensajes.append(f"{addon}: instalado (v{VERSION}).")
    guardar_registro(addons_path, registro)
    return True, mensajes


def main(argv=None):
    parser = argparse.ArgumentParser(description="Instala addon de Blender segun tipo de proyecto.")
    parser.add_argument("--proyecto", required=True, help="tipo de proyecto")
    parser.add_argument("--instalar", action="store_true", help="ejecutar instalacion")
    args = parser.parse_args(argv)
    if not args.instalar:
        print("Use --instalar para registrar el addon.")
        return 0
    ok, mensajes = instalar(args.proyecto)
    for m in mensajes:
        print(m)
    return 0 if ok else 1


if __name__ == "__main__":
    raise SystemExit(main())