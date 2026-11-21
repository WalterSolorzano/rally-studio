#!/usr/bin/env python3
"""Deja una propuesta de contenido en el buzón de Rally Studio.

Uso:
    python scripts/servir_propuesta.py --tab pautado --slot problema \
        --kind text --title "Propuesta de problema" --payload propuesta.json

El archivo --payload es el `payload` del sobre (JSON). La propuesta aparece en
la ventana (a) como aceptar/descartar; no se aplica sola. Solo con `--directo`,
token y sin `--simulated` escribe la sección en el servidor sin revisión humana.
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
    from content_store import ALLOWED_TABS, SLOTS_BY_TAB, revisar_contenido, validate_envelope
    from publicar_seccion import Bloqueada, Conflicto, NoAutorizado, publicar
except ImportError:  # cuando se ejecuta desde la raíz del repo
    from scripts.content_store import ALLOWED_TABS, SLOTS_BY_TAB, revisar_contenido, validate_envelope
    from scripts.publicar_seccion import Bloqueada, Conflicto, NoAutorizado, publicar

REPO_ROOT = Path(__file__).resolve().parent.parent
DEFAULT_DATA_DIR = REPO_ROOT / "dashboard" / "data"

SECCION_POR_TAB = {
    "pautado": lambda slot: f"pautado.{slot}",
    "script": lambda slot: f"script.{slot}",
    "budget": lambda slot: "budget",
    "canvas": lambda slot: "model_canvas",
    "challenges": lambda slot: "challenges",
    "resources": lambda slot: "resources",
}


def seccion_destino(tab: str, slot: str):
    fn = SECCION_POR_TAB.get(tab)
    return fn(slot) if fn else None


def dato_directo(tab: str, payload):
    """Convierte el payload del sobre al dato que guarda la sección."""
    if tab in ("pautado", "script") and isinstance(payload, dict):
        return payload.get("text", payload)
    if tab == "budget" and isinstance(payload, dict) and "items" in payload:
        return payload["items"]
    return payload


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
        "actor": args.actor,
        "actor_id": args.actor_id,
        "confidence": args.confidence,
        "simulated": bool(args.simulated),
        "payload": payload,
    }


BANDERAS_CON_VALOR = (
    "--tab", "--slot", "--kind", "--title", "--payload", "--source",
    "--confidence", "--token", "--server", "--project", "--actor", "--actor-id",
)


def _unir_valores(argv):
    """Une `--bandera valor` en `--bandera=valor`.

    argparse lee un valor que empieza por `-` como si fuera otra opcion y
    aborta con «expected one argument». Los tokens salen de
    `secrets.token_urlsafe`, que usa el alfabeto URL-safe: uno de cada sesenta
    empieza por `-`, y el CLI rechazaba un token valido sin decir que servia.
    """
    salida = []
    i = 0
    while i < len(argv):
        actual = argv[i]
        if actual in BANDERAS_CON_VALOR and i + 1 < len(argv):
            salida.append(f"{actual}={argv[i + 1]}")
            i += 2
            continue
        salida.append(actual)
        i += 1
    return salida


def main(argv=None) -> int:
    parser = argparse.ArgumentParser(description="Servir una propuesta al buzón de Rally Studio")
    parser.add_argument("--tab", required=True, help=f"una de: {', '.join(ALLOWED_TABS)}")
    parser.add_argument("--slot", required=True, help="slot dentro de la pestaña")
    parser.add_argument("--kind", required=True, help="tipo de contenido (text, budget-json, ...)")
    parser.add_argument("--title", required=True)
    parser.add_argument("--payload", required=True, help="archivo JSON con el payload")
    parser.add_argument("--source", default="")
    parser.add_argument("--confidence", default="media")
    parser.add_argument("--actor", default="IA", help="rol que firma la propuesta")
    parser.add_argument("--actor-id", default=os.environ.get("RALLY_ACTOR_ID", ""),
                        help="identificador del rol (obligatorio con --directo)")
    parser.add_argument("--simulated", action="store_true", help="marcar como dato simulado")
    parser.add_argument("--token", default=os.environ.get("RALLY_SESSION_TOKEN", ""))
    parser.add_argument("--server", default=os.environ.get("RALLY_SERVER", "http://127.0.0.1:8000"))
    parser.add_argument("--project", default=os.environ.get("RALLY_PROJECT", "main"))
    parser.add_argument("--mailbox", action="store_true",
                        help="obsoleto: el buzón es el default")
    parser.add_argument("--directo", action="store_true",
                        help="escribe en el servidor sin pasar por aceptar/descartar (opt-in)")
    args = parser.parse_args(_unir_valores(sys.argv[1:] if argv is None else list(argv)))

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

    evento = "latam"
    brief = REPO_ROOT / "brief.json"
    if brief.is_file():
        try:
            evento = json.loads(brief.read_text(encoding="utf-8-sig")).get("rally_type") or "latam"
        except (OSError, ValueError):
            pass
    problemas = revisar_contenido(sobre["tab"], sobre["slot"], sobre["payload"], evento)
    if problemas:
        for p in problemas:
            print(f"- {p}", file=sys.stderr)
        print("Propuesta rechazada por contenido: corrige y vuelve a servir.", file=sys.stderr)
        return 5

    seccion = seccion_destino(args.tab, args.slot)
    if args.directo and str(args.actor_id).strip().lower() in ("", "ia"):
        print("Falta --actor-id: la escritura directa firma al especialista, no 'ia'",
              file=sys.stderr)
        return 5
    if seccion and args.token and args.directo and not args.simulated:
        try:
            body = publicar(
                args.server, args.project, seccion,
                dato_directo(args.tab, sobre["payload"]),
                args.token,
                actor=args.actor, actor_id=args.actor_id,
            )
        except Conflicto as exc:
            print(json.dumps({"ok": False, "error": "conflicto", **exc.body}, ensure_ascii=False))
            return 2
        except Bloqueada as exc:
            print(json.dumps({"ok": False, "error": "bloqueada", **exc.body}, ensure_ascii=False))
            return 3
        except NoAutorizado as exc:
            print(json.dumps({"ok": False, "error": "no-autorizado", **exc.body}, ensure_ascii=False))
            return 4
        except (OSError, RuntimeError) as exc:
            print(f"No se pudo publicar: {exc}", file=sys.stderr)
            return 4
        section = body.get("section") or {}
        print(json.dumps({
            "ok": True, "mode": "directo", "section": seccion,
            "version": section.get("version"),
        }, ensure_ascii=False))
        return 0

    data_dir = Path(os.environ.get("RALLY_DATA_DIR", str(DEFAULT_DATA_DIR)))
    content_dir = data_dir / "content"
    content_dir.mkdir(parents=True, exist_ok=True)

    destino = content_dir / f"{sobre['id']}.json"
    destino.write_text(json.dumps(sobre, ensure_ascii=False, indent=2), encoding="utf-8")

    print(destino)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
