#!/usr/bin/env python3
"""registro_produccion.py -- bitacora de los trabajos pesados.

Un renglon por evento en `logs/produccion.jsonl`. Escribe `gpu_lock.py` cada vez
que lanza un comando pesado, y cualquier script que quiera dejar constancia de un
render, un fallo o una correccion.

El resumen lo consume `scripts/build_stats.py` para el debrief del cierre: cuantos
renders hubo, cuanto tiempo de maquina costo y cuantas veces hubo que rehacer algo.

Uso:
    from registro_produccion import registrar
    registrar("render", ok=True, segundos=92.4, comando="blender ...", owner="modeler")

    python scripts/registro_produccion.py            # resumen de la sesion
    python scripts/registro_produccion.py --todo     # historico completo
"""
from __future__ import annotations

import argparse
import json
import time
from pathlib import Path

RAIZ = Path(__file__).resolve().parents[1]
ARCHIVO = RAIZ / "logs" / "produccion.jsonl"

TIPOS = ("render", "fallo", "correccion", "bloqueo", "limpieza")


def _ahora() -> str:
    return time.strftime("%Y-%m-%dT%H:%M:%S")


def registrar(tipo: str, **datos) -> None:
    """Agrega un evento. Nunca lanza: si no se puede escribir, la produccion sigue."""
    try:
        ARCHIVO.parent.mkdir(parents=True, exist_ok=True)
        evento = {"ts": _ahora(), "epoch": round(time.time(), 3), "tipo": tipo}
        evento.update({k: v for k, v in datos.items() if v is not None})
        with ARCHIVO.open("a", encoding="utf-8") as f:
            f.write(json.dumps(evento, ensure_ascii=False) + "\n")
    except OSError:
        pass


def eventos() -> list[dict]:
    if not ARCHIVO.exists():
        return []
    salida = []
    try:
        for linea in ARCHIVO.read_text(encoding="utf-8", errors="replace").splitlines():
            linea = linea.strip()
            if not linea:
                continue
            try:
                dato = json.loads(linea)
            except json.JSONDecodeError:
                continue
            if isinstance(dato, dict):
                salida.append(dato)
    except OSError:
        pass
    return salida


def resumen(desde_epoch: float = 0.0) -> dict:
    """Cuenta renders, tiempo de maquina, fallos y correcciones de la sesion.

    Una 'correccion' es el mismo comando lanzado otra vez: significa que hubo que
    rehacer el trabajo. No se cuentan como correccion los comandos distintos.
    """
    vistos: dict[str, int] = {}
    r = {
        "renders": 0, "renders_ok": 0, "renders_fallidos": 0,
        "segundos": 0.0, "bloqueos": 0, "limpiezas": 0, "correcciones": 0,
        "fallos": 0, "ultimo": "",
    }
    for ev in eventos():
        if float(ev.get("epoch", 0) or 0) < desde_epoch:
            continue
        tipo = str(ev.get("tipo", ""))
        if tipo == "render":
            r["renders"] += 1
            seg = float(ev.get("segundos", 0) or 0)
            r["segundos"] += seg
            if ev.get("ok"):
                r["renders_ok"] += 1
            else:
                r["renders_fallidos"] += 1
                r["fallos"] += 1
            cmd = str(ev.get("comando", ""))
            if cmd:
                vistos[cmd] = vistos.get(cmd, 0) + 1
                if vistos[cmd] > 1:
                    r["correcciones"] += 1
        elif tipo == "correccion":
            r["correcciones"] += 1
        elif tipo == "fallo":
            r["fallos"] += 1
        elif tipo == "bloqueo":
            r["bloqueos"] += 1
        elif tipo == "limpieza":
            r["limpiezas"] += 1
        if ev.get("ts"):
            r["ultimo"] = str(ev["ts"])
    r["segundos"] = round(r["segundos"], 1)
    r["minutos"] = round(r["segundos"] / 60.0, 1)
    return r


def main() -> int:
    try:
        from comun import utf8

        utf8()
    except Exception:  # noqa: BLE001 - la bitacora no debe caer por la consola
        pass

    ap = argparse.ArgumentParser(description="Bitacora de produccion")
    ap.add_argument("--todo", action="store_true", help="historico completo, no solo la sesion")
    args = ap.parse_args()

    desde = 0.0
    if not args.todo:
        try:
            estado = json.loads((RAIZ / "dashboard" / "state.json").read_text(encoding="utf-8"))
            desde = float(estado.get("start_timestamp", 0) or 0) / 1000.0
        except (OSError, json.JSONDecodeError, ValueError):
            desde = 0.0

    r = resumen(desde)
    if not ARCHIVO.exists():
        print("sin bitacora todavia: %s" % ARCHIVO.relative_to(RAIZ))
        return 0
    print("renders=%d  ok=%d  fallidos=%d  tiempo=%.1f min  correcciones=%d  bloqueos=%d"
          % (r["renders"], r["renders_ok"], r["renders_fallidos"], r["minutos"],
             r["correcciones"], r["bloqueos"]))
    if r["ultimo"]:
        print("ultimo evento: %s" % r["ultimo"])
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
