#!/usr/bin/env python3
"""
herramientas.py -- Caja de herramientas externa bajo demanda.

Nunca instala la caja completa: solo la herramienta cuyo disparador coincide
con la tarea actual.

Uso:
    python scripts/herramientas.py listar
    python scripts/herramientas.py necesita "render 3d con personas"
    python scripts/herramientas.py instalar blender-mcp --si

Catalogo: docs/herramientas.json (fuente unica).
"""
import argparse
import json
import subprocess
import sys
from pathlib import Path

RAIZ = Path(__file__).resolve().parents[1]
CATALOGO_PATH = RAIZ / "docs" / "herramientas.json"
CONFIG_PATH = RAIZ / "opencode.json"


def cargar_catalogo(path=CATALOGO_PATH):
    """Devuelve la lista de herramientas del catalogo."""
    datos = json.loads(Path(path).read_text(encoding="utf-8"))
    return datos.get("herramientas", [])


def buscar(herramientas, id_herramienta):
    """Devuelve la herramienta con ese id o None."""
    for h in herramientas:
        if h.get("id") == id_herramienta:
            return h
    return None


def seleccionar(herramientas, tarea):
    """Devuelve solo las herramientas cuyo se_usa_cuando aparece en la tarea."""
    texto = str(tarea).lower()
    return [
        h for h in herramientas
        if any(disparador.lower() in texto for disparador in h.get("se_usa_cuando", []))
    ]


def _habilitar_mcp(id_herramienta, config_path):
    path = Path(config_path)
    cfg = json.loads(path.read_text(encoding="utf-8")) if path.exists() else {}
    mcp = cfg.setdefault("mcp", {})
    entrada = mcp.get(id_herramienta)
    if not entrada:
        return 1, f"ERROR: {id_herramienta} no esta declarado en {path.name}; agregalo antes de habilitarlo."
    entrada["enabled"] = True
    path.write_text(json.dumps(cfg, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    return 0, f"OK {id_herramienta} habilitado en {path.name}."


def instalar(herramienta, si=False, simular=False, config_path=CONFIG_PATH, ejecutar=None):
    """Instala o habilita una sola herramienta. Devuelve (codigo, mensaje)."""
    if herramienta is None:
        return 1, "ERROR: herramienta desconocida."

    tipo = herramienta.get("tipo")
    id_herramienta = herramienta.get("id", "?")
    comando = herramienta.get("instalar")

    if tipo in ("builtin", "api"):
        return 0, f"OK {id_herramienta}: no requiere instalacion. {herramienta.get('nota', '')}".strip()

    if tipo == "mcp":
        if not si:
            return 1, f"AVISO {id_herramienta}: requiere --si y autorizacion del director."
        if simular:
            return 0, f"SIMULADO: habilitaria {id_herramienta} en {Path(config_path).name}."
        return _habilitar_mcp(id_herramienta, config_path)

    if not comando:
        origen = herramienta.get("origen", "")
        if origen == "superpowers":
            return 0, f"OK {id_herramienta}: ya disponible en superpowers; cargar con la herramienta skill."
        return 0, f"OK {id_herramienta}: instalacion manual. {herramienta.get('nota', '')}".strip()

    if not si:
        return 1, f"AVISO {id_herramienta}: requiere --si. Comando: {comando}"

    if simular:
        return 0, f"SIMULADO: {comando}"

    corrida = ejecutar or subprocess.run
    resultado = corrida(comando, shell=True, cwd=RAIZ)
    if getattr(resultado, "returncode", 1) != 0:
        return 1, f"ERROR: fallo al instalar {id_herramienta}."
    return 0, f"OK {id_herramienta} instalado."


def main(argv=None):
    parser = argparse.ArgumentParser(description="Caja de herramientas externa bajo demanda.")
    sub = parser.add_subparsers(dest="accion", required=True)

    sub.add_parser("listar", help="Lista el catalogo completo.")

    p_necesita = sub.add_parser("necesita", help="Sugiere solo lo que la tarea necesita.")
    p_necesita.add_argument("tarea", help="Descripcion de la tarea actual.")

    p_instalar = sub.add_parser("instalar", help="Instala o habilita UNA herramienta.")
    p_instalar.add_argument("id", help="Id del catalogo.")
    p_instalar.add_argument("--si", action="store_true", help="Confirma la instalacion.")
    p_instalar.add_argument("--simular", action="store_true", help="Muestra que haria, sin ejecutar.")

    args = parser.parse_args(argv)
    herramientas = cargar_catalogo()

    if args.accion == "listar":
        for h in herramientas:
            print(f"{h['id']}\t{h.get('tipo')}\t{h.get('agente')}")
        return 0

    if args.accion == "necesita":
        elegidas = seleccionar(herramientas, args.tarea)
        if not elegidas:
            print("Nada que instalar: la tarea no dispara ninguna herramienta externa.")
            return 0
        for h in elegidas:
            print(f"{h['id']}\t{h.get('tipo')}\t{h.get('agente')}\t{h.get('instalar') or 'sin instalacion'}")
        return 0

    herramienta = buscar(herramientas, args.id)
    codigo, mensaje = instalar(herramienta, si=args.si, simular=args.simular)
    print(mensaje, file=sys.stderr if codigo else sys.stdout)
    return codigo


if __name__ == "__main__":
    raise SystemExit(main())
