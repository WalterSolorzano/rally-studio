#!/usr/bin/env python3
"""Deja una propuesta de contenido en el buzón de Rally Studio.

Uso:
    python scripts/servir_propuesta.py --tab pautado --slot problema \
        --kind text --title "Propuesta de problema" --payload propuesta.json

El archivo --payload es el `payload` del sobre (JSON). La propuesta aparece en
la ventana (a) como aceptar/descartar; no se aplica sola.
"""

from __future__ import annotations

import argparse
import json
import os
import sys
import uuid
from datetime import datetime
from pathlib import Path

try:
    from content_store import ALLOWED_TABS, SLOTS_BY_TAB, validate_envelope
except ImportError:  # cuando se ejecuta desde la raíz del repo
    from scripts.content_store import ALLOWED_TABS, SLOTS_BY_TAB, validate_envelope

REPO_ROOT = Path(__file__).resolve().parent.parent
DEFAULT_DATA_DIR = REPO_ROOT / "dashboard" / "data"


def construir_sobre(args) -> dict:
    payload_path = Path(args.payload)
    payload = json.loads(payload_path.read_text(encoding="utf-8-sig"))
    if not isinstance(payload, dict):
        payload = {"value": payload}

    return {
        "id": f"{args.tab}-{args.slot}-{uuid.uuid4().hex[:8]}",
        "tab": args.tab,
        "slot": args.slot,
        "kind": args.kind,
        "title": args.title,
        "source": args.source,
        "created_at": datetime.now().astimezone().isoformat(timespec="seconds"),
        "confidence": args.confidence,
        "simulated": bool(args.simulated),
        "payload": payload,
    }


def main(argv=None) -> int:
    parser = argparse.ArgumentParser(description="Servir una propuesta al buzón de Rally Studio")
    parser.add_argument("--tab", required=True, help=f"una de: {', '.join(ALLOWED_TABS)}")
    parser.add_argument("--slot", required=True, help="slot dentro de la pestaña")
    parser.add_argument("--kind", required=True, help="tipo de contenido (text, budget-json, ...)")
    parser.add_argument("--title", required=True)
    parser.add_argument("--payload", required=True, help="archivo JSON con el payload")
    parser.add_argument("--source", default="")
    parser.add_argument("--confidence", default="media")
    parser.add_argument("--simulated", action="store_true", help="marcar como dato simulado")
    args = parser.parse_args(argv)

    try:
        sobre = construir_sobre(args)
    except (OSError, ValueError) as exc:
        print(f"No se pudo leer el payload: {exc}", file=sys.stderr)
        return 2

    errores = validate_envelope(sobre)
    if errores:
        for error in errores:
            print(f"- {error}", file=sys.stderr)
        print(
            f"Slots válidos para {sobre['tab']}: {', '.join(SLOTS_BY_TAB.get(sobre['tab'], []))}",
            file=sys.stderr,
        )
        return 1

    data_dir = Path(os.environ.get("RALLY_DATA_DIR", str(DEFAULT_DATA_DIR)))
    content_dir = data_dir / "content"
    content_dir.mkdir(parents=True, exist_ok=True)
    destino = content_dir / f"{sobre['id']}.json"
    destino.write_text(json.dumps(sobre, ensure_ascii=False, indent=2), encoding="utf-8")

    print(destino)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
