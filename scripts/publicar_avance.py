#!/usr/bin/env python3
"""Publica un avance de agente en la bitacora viva de Rally Studio.

Uso:
    python scripts/publicar_avance.py --texto "Termine el acto 2 del guion" \
        --fuente guion-storyboard

Sale en la ventana (a) sin pedir aceptar/descartar: los avances son bitacora,
no propuestas. El telefono lo ve en la pestana Cierre, bloque "Avisos de la IA".

Un agente que quiera avisar cada tanto puede envolverlo en un bucle:
    while ($true) { python scripts/publicar_avance.py --texto "sigo vivo" ; Start-Sleep 600 }
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
    from content_store import validate_envelope
except ImportError:  # cuando se ejecuta desde la raíz del repo
    from scripts.content_store import validate_envelope

REPO_ROOT = Path(__file__).resolve().parent.parent
DEFAULT_DATA_DIR = REPO_ROOT / "dashboard" / "data"


def construir_sobre(texto: str, fuente: str, url: str, title: str, simulated: bool) -> dict:
    payload = {"text": texto}
    if url:
        payload["url"] = url
    return {
        "id": "avance-" + uuid.uuid4().hex[:10],
        "tab": "timeline",
        "slot": "main",
        "kind": "notice",
        "title": title or (fuente or "Avance"),
        "source": fuente,
        "created_at": datetime.now().astimezone().isoformat(timespec="seconds"),
        "confidence": "media",
        "simulated": bool(simulated),
        "payload": payload,
    }


def purgar(content_dir: Path, horas: int) -> int:
    """Borra avisos viejos: el buzón no debe crecer sin fin."""
    if horas <= 0:
        return 0
    limite = datetime.now().astimezone().timestamp() - horas * 3600
    borrados = 0
    for archivo in content_dir.glob("avance-*.json"):
        try:
            sobre = json.loads(archivo.read_text(encoding="utf-8"))
            cuando = datetime.fromisoformat(str(sobre.get("created_at"))).timestamp()
        except (OSError, ValueError):
            continue
        if cuando < limite:
            archivo.unlink(missing_ok=True)
            borrados += 1
    return borrados


def anotar_archivo(data_dir: Path, sobre: dict, horas: int) -> Path:
    """Deja el aviso también en `data/avisos.json`.

    Es la fuente que sirve cuando no hay servidor (GitHub Pages): `notify.js`
    lo lee cada 30 s. El buzón de sobres no se publica, este archivo sí.
    """
    destino = data_dir / "avisos.json"
    lista = []
    try:
        actual = json.loads(destino.read_text(encoding="utf-8"))
        if isinstance(actual, dict):
            actual = actual.get("avisos")
        if isinstance(actual, list):
            lista = [a for a in actual if isinstance(a, dict) and a.get("id")]
    except (OSError, ValueError):
        lista = []

    nombre = Path(str(sobre.get("source") or "agente")).name
    aviso = {
        "id": sobre["id"],
        "tipo": "avance",
        "titulo": sobre.get("title") or nombre,
        "texto": (sobre.get("payload") or {}).get("text", ""),
        "url": (sobre.get("payload") or {}).get("url", ""),
        "fuente": sobre.get("source", ""),
        "tab": "timeline",
        "slot": "main",
        "ts": sobre.get("created_at"),
    }
    lista = [a for a in lista if a.get("id") != aviso["id"]]
    lista.insert(0, aviso)

    if horas > 0:
        limite = datetime.now().astimezone().timestamp() - horas * 3600
        vivos = []
        for a in lista:
            try:
                cuando = datetime.fromisoformat(str(a.get("ts"))).timestamp()
            except (TypeError, ValueError):
                vivos.append(a)
                continue
            if cuando >= limite:
                vivos.append(a)
        lista = vivos

    lista = lista[:50]
    destino.parent.mkdir(parents=True, exist_ok=True)
    destino.write_text(json.dumps({"avisos": lista}, ensure_ascii=False, indent=2), encoding="utf-8")
    return destino


def main(argv=None) -> int:
    parser = argparse.ArgumentParser(description="Publicar un avance en la bitácora viva")
    parser.add_argument("--texto", required=True, help="qué hizo el agente (o '-' para leer stdin)")
    parser.add_argument("--fuente", default="agente", help="quién lo publica")
    parser.add_argument("--title", default="", help="título del aviso (por defecto la fuente)")
    parser.add_argument("--url", default="", help="enlace que abre el botón, si aplica")
    parser.add_argument("--simulated", action="store_true", help="marcar como dato simulado")
    parser.add_argument("--horas", type=int, default=24,
                        help="borrar avisos más viejos que estas horas (0 = no borrar)")
    parser.add_argument("--data-dir", default=os.environ.get("RALLY_DATA_DIR", str(DEFAULT_DATA_DIR)))
    parser.add_argument("--archivo", action="store_true",
                        help="dejarlo también en data/avisos.json (lo que ve GitHub Pages)")
    args = parser.parse_args(argv)

    texto = sys.stdin.read() if args.texto == "-" else args.texto
    texto = " ".join(texto.split())
    if not texto:
        print("El avance viene vacío: no hay nada que publicar.", file=sys.stderr)
        return 2
    if len(texto) > 600:
        texto = texto[:597].rstrip() + "..."

    sobre = construir_sobre(texto, args.fuente, args.url, args.title, args.simulated)
    errores = validate_envelope(sobre)
    if errores:
        for error in errores:
            print(f"- {error}", file=sys.stderr)
        return 1

    content_dir = Path(args.data_dir) / "content"
    content_dir.mkdir(parents=True, exist_ok=True)
    purgar(content_dir, args.horas)
    destino = content_dir / f"{sobre['id']}.json"
    destino.write_text(json.dumps(sobre, ensure_ascii=False, indent=2), encoding="utf-8")

    print(destino)
    if args.archivo:
        print(anotar_archivo(Path(args.data_dir), sobre, args.horas))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
