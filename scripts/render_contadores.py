#!/usr/bin/env python3
"""
render_contadores.py -- Graba plantillas/contadores/index.html como MP4 del Acto IV.

Se ejecuta SOLO cuando el presupuesto esta aprobado:
  1. budget/budget.json existe y tiene partidas.
  2. `python scripts/validate_budget.py` pasa sin errores.
  3. El humano dio --aprobado (aprobacion explicita en la ventana o en el chat).

Sin esas tres cosas no graba nada: imprime el motivo y sale con codigo 2.

Salida: assets/2d/asset_A4_contadores.mp4
"""
from __future__ import annotations

import argparse
import json
import subprocess
import sys
import tempfile
from pathlib import Path
from urllib.parse import quote

if sys.platform == "win32":
    import io

    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")

ROOT = Path(__file__).resolve().parents[1]
BUDGET_JSON = ROOT / "budget" / "budget.json"
BRIEF_JSON = ROOT / "brief.json"
CLAIMS_JSON = ROOT / "research" / "claims.json"
PLANTILLA = ROOT / "plantillas" / "contadores" / "index.html"
SALIDA = ROOT / "assets" / "2d" / "asset_A4_contadores.mp4"

sys.path.insert(0, str(ROOT / "scripts"))
from moneda import contexto, costo_unitario, formato  # noqa: E402


def _leer_json(ruta: Path, default):
    try:
        return json.loads(ruta.read_text(encoding="utf-8-sig"))
    except Exception:
        return default


def _gate_presupuesto() -> str | None:
    """Devuelve el motivo del bloqueo, o None si el presupuesto esta aprobable."""
    if not BUDGET_JSON.exists():
        return "no existe budget/budget.json"
    items = _leer_json(BUDGET_JSON, None)
    if not isinstance(items, list) or not items:
        return "budget/budget.json esta vacio: todavia no hay presupuesto que aprobar"
    res = subprocess.run(
        [sys.executable, str(ROOT / "scripts" / "validate_budget.py")],
        cwd=str(ROOT), capture_output=True, text=True, encoding="utf-8", errors="replace",
    )
    if res.returncode != 0:
        detalle = (res.stdout or "").strip().splitlines()
        return "validate_budget.py fallo: " + (detalle[-1] if detalle else "sin detalle")
    return None


def _metricas_por_defecto(items: list, brief: dict) -> list:
    ctx = contexto(brief)
    total = 0.0
    for it in items:
        unit = costo_unitario(it, ctx)
        if unit is None:
            continue
        total += float(it.get("units", 1)) * unit
    return [
        {
            "value": 1250, "suffix": " L", "decimals": 0,
            "label": "Agua recuperada por familia al mes",
            "source": "Reemplazar con el claim y la fuente", "simulated": True,
        },
        {
            "value": 64, "suffix": "%", "decimals": 0,
            "label": "Demanda cubierta en el piloto",
            "source": "Reemplazar con el claim y la fuente", "simulated": True,
        },
        {
            "value": round(total, 2), "prefix": ctx["simbolo"], "decimals": 0,
            "label": "Costo de implementacion",
            "source": f"budget/budget.json - {len(items)} partidas", "simulated": False,
        },
    ]


def _payload(items: list, brief: dict, datos: dict | None) -> dict:
    if datos and isinstance(datos.get("metrics"), list) and datos["metrics"]:
        return datos
    return {
        "act": "Acto IV",
        "title": brief.get("project_name") or "Cifras del piloto",
        "metrics": _metricas_por_defecto(items, brief),
    }


def _transcodificar(webm: Path, destino: Path) -> None:
    from imageio_ffmpeg import get_ffmpeg_exe
    import gpu_lock

    destino.parent.mkdir(parents=True, exist_ok=True)
    ffmpeg = get_ffmpeg_exe()
    if not gpu_lock.acquire(["cpu"], owner="grafista", priority="media", timeout_s=180):
        raise RuntimeError("no se pudo tomar el recurso cpu (gpu_lock)")
    try:
        res = subprocess.run(
            [
                ffmpeg, "-y", "-i", str(webm),
                "-vf", "scale=1920:1080:flags=lanczos",
                "-c:v", "libx264", "-preset", "medium", "-crf", "18",
                "-pix_fmt", "yuv420p", "-movflags", "+faststart", "-an",
                str(destino),
            ],
            capture_output=True, text=True, encoding="utf-8", errors="replace",
        )
    finally:
        gpu_lock.release("grafista", ["cpu"])
    if res.returncode != 0 or not destino.exists() or destino.stat().st_size == 0:
        cola = (res.stderr or "").strip().splitlines()
        raise RuntimeError("ffmpeg no pudo crear el MP4: " + (cola[-1] if cola else "sin detalle"))


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--aprobado", action="store_true",
                        help="El humano aprobo el presupuesto en la ventana.")
    parser.add_argument("--data", type=Path, default=None,
                        help="JSON con {act,title,metrics:[...]}; si falta, se deriva del presupuesto.")
    args = parser.parse_args()

    motivo = _gate_presupuesto()
    if motivo:
        print(f"BLOQUEADO: {motivo}.")
        print("Nada se graba hasta que exista un presupuesto valido.")
        return 2
    if not args.aprobado:
        print("BLOQUEADO: falta --aprobado.")
        print("El MP4 solo se genera cuando el humano aprueba el presupuesto.")
        return 2
    if not PLANTILLA.exists():
        print(f"BLOQUEADO: no existe {PLANTILLA.relative_to(ROOT)}.")
        return 2

    items = _leer_json(BUDGET_JSON, [])
    brief = _leer_json(BRIEF_JSON, {})
    datos = _leer_json(args.data, None) if args.data else None
    payload = _payload(items, brief, datos)

    from playwright.sync_api import sync_playwright

    url = PLANTILLA.as_uri() + "?data=" + quote(json.dumps(payload, ensure_ascii=False))
    SALIDA.parent.mkdir(parents=True, exist_ok=True)

    with tempfile.TemporaryDirectory(prefix="contadores_") as tmp:
        with sync_playwright() as p:
            navegador = p.chromium.launch()
            contexto_video = navegador.new_context(
                viewport={"width": 1920, "height": 1080},
                record_video_dir=tmp,
                record_video_size={"width": 1920, "height": 1080},
            )
            pagina = contexto_video.new_page()
            pagina.goto(url, wait_until="load")
            pagina.wait_for_timeout(4200)  # 0.25 s delay + 1.8 s conteo + margen
            video = pagina.video
            contexto_video.close()
            navegador.close()
            webm = Path(video.path())
        _transcodificar(webm, SALIDA)

    tam = SALIDA.stat().st_size
    print(f"OK: {SALIDA.relative_to(ROOT)} ({tam:,} bytes)")
    simuladas = [m for m in payload["metrics"] if m.get("simulated")]
    if simuladas:
        print(f"WARN: {len(simuladas)} tarjeta(s) siguen marcadas [SIMULADO].")
    return 0


if __name__ == "__main__":
    sys.exit(main())
