#!/usr/bin/env python3
"""
arsenal.py -- Gestor del arsenal de Rally Studio.

Subcomandos:
  check-duracion [archivos...]   Regla oficial <= 120 s (ffprobe/ffmpeg).
  check-coherencia               Cruza cifras guion / narracion / pautado.
  check-campo [docx]             Caracteres por campo contra la plantilla.
  check-validadores              validate_brief, validate_budget y validate_pautado.
  check-todo                     Los tres checks en orden de gravedad.
  check-tiempo [--restante H]    Reloj del certamen: % alcanzado, fase y alerta roja.
  refresh [--write]              Actualiza versiones en arsenal.lock.yaml.
  status                         Resume el registro sin ejecutar checks.

Uso tipico antes de SIRLI:
  python arsenal.py check-todo
"""
from __future__ import annotations

import argparse
import importlib.util
import json
import pathlib
import re
import shutil
import subprocess
import sys

RAIZ = pathlib.Path(__file__).resolve().parent
LOCK = RAIZ / "arsenal.lock.yaml"
BRIEF = RAIZ / "brief.json"

# Permite `python arsenal.py` desde cualquier carpeta del repo.
if str(RAIZ) not in sys.path:
    sys.path.insert(0, str(RAIZ))

from checks import campo_chars, coherencia, duracion  # noqa: E402


def _version_comando(nombre: str, args: list[str]) -> str:
    exe = shutil.which(nombre) or shutil.which(f"{nombre}.exe")
    if not exe:
        return ""
    try:
        salida = subprocess.run(
            [exe, *args], capture_output=True, text=True, errors="replace", timeout=20,
        )
        texto = (salida.stdout or "") + (salida.stderr or "")
        match = re.search(r"\d+\.\d+(?:\.\d+)?", texto)
        return match.group(0) if match else "detectado"
    except Exception:
        return ""


def _version_paquete(modulo: str, dist: str | None = None) -> str:
    if importlib.util.find_spec(modulo) is None:
        return ""
    try:
        from importlib.metadata import version

        return version(dist or modulo)
    except Exception:
        return "instalado"


def _leer_lock() -> dict:
    import yaml

    if not LOCK.exists():
        return {"version": 1, "actualizado": "", "proposito": ""}
    return yaml.safe_load(LOCK.read_text(encoding="utf-8")) or {}


def _escribir_lock(datos: dict) -> None:
    import yaml

    LOCK.write_text(
        yaml.safe_dump(datos, allow_unicode=True, sort_keys=False, width=100),
        encoding="utf-8",
    )


def cmd_refresh(args: argparse.Namespace) -> int:
    datos = _leer_lock()
    detectadas = {
        "ffmpeg": _version_comando("ffmpeg", ["-version"]),
        "ffprobe": _version_comando("ffprobe", ["-version"]),
        "blender": _version_comando("blender", ["--version"]),
        "node": _version_comando("node", ["--version"]),
        "python": sys.version.split()[0],
        "edge-tts": _version_paquete("edge_tts"),
        "kokoro": _version_paquete("kokoro"),
        "chatterbox-tts": _version_paquete("chatterbox"),
        "piper-tts": _version_paquete("piper"),
        "python-docx": _version_paquete("docx", "python-docx"),
        "openpyxl": _version_paquete("openpyxl"),
        "pillow": _version_paquete("PIL", "pillow"),
        "pyyaml": _version_paquete("yaml", "pyyaml"),
    }
    if not detectadas["ffmpeg"]:
        ffmpeg = duracion.find_ffmpeg()
        if ffmpeg:
            detectadas["ffmpeg"] = _version_comando(ffmpeg, ["-version"]) or "imageio-ffmpeg"
    if not detectadas["ffprobe"]:
        ffprobe = duracion.find_ffprobe()
        if ffprobe:
            detectadas["ffprobe"] = _version_comando(ffprobe, ["-version"])

    for categoria, entradas in datos.items():
        if not isinstance(entradas, list):
            continue
        for entrada in entradas:
            if not isinstance(entrada, dict):
                continue
            nombre = entrada.get("nombre", "")
            if nombre in detectadas:
                entrada["version"] = detectadas[nombre]
    datos["actualizado"] = "2026-10-19"

    print(f"  {'HERRAMIENTA':<18} VERSION")
    for nombre, version in detectadas.items():
        estado = version or "no detectado"
        print(f"  {nombre:<18} {estado}")

    if args.write:
        _escribir_lock(datos)
        print(f"\n  OK: {LOCK} actualizado.")
    else:
        print("\n  Modo lectura. Usa --write para guardar.")
    return 0


def cmd_status(args: argparse.Namespace) -> int:
    datos = _leer_lock()
    print(f"  arsenal.lock.yaml -- actualizado: {datos.get('actualizado', 'sin fecha')}\n")
    for categoria, entradas in datos.items():
        if not isinstance(entradas, list):
            continue
        print(f"  {categoria.upper()}")
        for entrada in entradas:
            if not isinstance(entrada, dict):
                continue
            nombre = entrada.get("nombre", "?")
            estado = entrada.get("estado", "?")
            licencia = entrada.get("licencia", "?")
            version = entrada.get("version") or "-"
            print(f"    {nombre:<18} {version:<10} {estado:<16} {licencia}")
        print()
    return 0


def cmd_duracion(args: argparse.Namespace) -> int:
    rutas = [pathlib.Path(p) for p in args.archivos] if args.archivos else [
        pathlib.Path("assets/voice/narration.mp4"),
    ]
    presentes = [p for p in rutas if p.exists()]
    if not presentes:
        print("  PENDIENTE: no hay video ni locucion para medir.")
        print("  Buscado: " + ", ".join(str(p) for p in rutas))
        return 1
    hallazgos: list[dict] = []
    for ruta in presentes:
        segundos, _, motor = duracion.medir(ruta)
        etiqueta = f"{segundos:.1f} s" if segundos is not None else "ilegible"
        print(f"  {ruta}: {etiqueta} [{motor}]")
        hallazgos.extend(duracion.revisar(ruta))
    print(duracion.formatear(hallazgos))
    return 1 if any(h["gravedad"] == "critico" for h in hallazgos) else 0


def cmd_coherencia(args: argparse.Namespace) -> int:
    ignorar = {coherencia._canonico(coherencia._normalizar_token(x)) for x in args.ignorar}
    fuentes: dict[str, dict] = {}
    for nombre, ruta in {
        "guion": pathlib.Path(args.guion),
        "narracion": pathlib.Path(args.narracion),
        "pautado": pathlib.Path(args.pautado),
    }.items():
        if not ruta.exists():
            print(f"  PENDIENTE: {nombre} no existe ({ruta}).")
            continue
        fuentes[nombre] = coherencia.desde_archivo(ruta)
        print(f"  {nombre}: {len(fuentes[nombre])} cifras distintas")
    if len(fuentes) < 2:
        print("  PENDIENTE: hacen falta al menos dos entregables.")
        return 1
    if "pautado" not in fuentes:
        print("  PENDIENTE: sin pautado no se puede cerrar la coherencia antes de SIRLI.")
        return 1
    hallazgos = coherencia.comparar(fuentes, ignorar)
    if not hallazgos:
        print("  OK: las cifras coinciden.")
        return 0
    for h in hallazgos:
        icono = "!" if h["gravedad"] == "importante" else "."
        print(f"  [{icono}] {h['que']}")
        print(f"      -> {h['hacer']}")
    importantes = [h for h in hallazgos if h["gravedad"] == "importante"]
    print(f"\n  {len(importantes)} significativas de {len(hallazgos)} discrepancias.")
    return 1 if importantes else 0


def cmd_campo(args: argparse.Namespace) -> int:
    docx_path = pathlib.Path(args.docx)
    plantilla = pathlib.Path(args.plantilla)
    evento = getattr(args, "evento", "latam")
    if not docx_path.exists():
        print(f"  PENDIENTE: {docx_path} no existe.")
        return 1
    hallazgos, conteos = campo_chars.revisar(docx_path, plantilla, evento)
    limites = campo_chars.limites_para(evento)
    if not limites:
        print(f"  Evento '{evento}': sin tope por seccion. Solo se cuentan caracteres.")
        for campo, cuenta in sorted(conteos.items()):
            print(f"  {campo.upper():<16} {cuenta:>6}")
        return 0
    print("  CAMPO            CUENTA / LIMITE")
    for campo, limite in limites.items():
        cuenta = conteos.get(campo)
        if cuenta is None:
            print(f"  [.] {campo.upper():<13} {'--':>6} / {limite:<6}")
            continue
        marca = "X" if cuenta > limite else "v"
        print(f"  [{marca}] {campo.upper():<13} {cuenta:>6} / {limite:<6}  {(cuenta / limite) * 100:5.1f}%")
    if not hallazgos:
        print("\n  OK: todos los campos respetan su limite.")
        return 0
    print()
    for h in hallazgos:
        icono = "X" if h["gravedad"] == "critico" else "!"
        print(f"  [{icono}] {h.get('campo', '--')}: {h['que']} -> {h['hacer']}")
    return 1 if any(h["gravedad"] == "critico" for h in hallazgos) else 0


FASES_TIEMPO = (
    (0.35, "producir"),
    (0.55, "revisar"),
    (0.75, "integrar"),
    (0.90, "congelar assets y preparar exportacion"),
    (1.01, "entregar y verificar"),
)


def fase_de_tiempo(porcentaje: float) -> str:
    """Banda de la skill control-tiempo-entrega para un avance de 0.0 a 1.0."""
    for tope, fase in FASES_TIEMPO:
        if porcentaje < tope:
            return fase
    return FASES_TIEMPO[-1][1]


def _etapas_pendientes(brief: dict) -> list[str]:
    """Etapas que verificar_fases.py todavia no da por cerradas."""
    if str(RAIZ / "scripts") not in sys.path:
        sys.path.insert(0, str(RAIZ / "scripts"))
    try:
        import verificar_fases as vf
    except Exception:
        return []
    try:
        bitacora = vf.leer_bitacora()
        return [
            "%s %s" % (e["id"], e["nombre"])
            for e in vf.ETAPAS
            if not vf.existe(e, brief, bitacora)
        ]
    except Exception:
        return []


def estado_de_tiempo(brief: dict, pendientes: list[str] | None = None) -> dict:
    """Reloj del certamen en el formato que pide la skill control-tiempo-entrega."""
    total = float(brief.get("hours_total") or 0)
    restante = float(brief.get("hours_remaining") or 0)
    porcentaje = 0.0 if total <= 0 else max(0.0, min(1.0, 1.0 - restante / total))
    if pendientes is None:
        pendientes = _etapas_pendientes(brief)
    return {
        "rally_type": brief.get("rally_type") or "",
        "hours_total": total,
        "hours_remaining": restante,
        "porcentaje_alcanzado": round(porcentaje * 100, 1),
        "fase": fase_de_tiempo(porcentaje),
        "entregables_pendientes": pendientes,
        "congelar_assets": porcentaje >= 0.75,
        "alerta_roja": porcentaje >= 0.75,
    }


def cmd_tiempo(args: argparse.Namespace) -> int:
    ruta = pathlib.Path(getattr(args, "brief", BRIEF))
    brief = json.loads(ruta.read_text(encoding="utf-8-sig")) if ruta.exists() else {}
    if getattr(args, "restante", None) is not None:
        brief["hours_remaining"] = args.restante
    estado = estado_de_tiempo(brief)
    if getattr(args, "json", False):
        print(json.dumps(estado, ensure_ascii=False, indent=2))
        return 0
    transcurrido = estado["hours_total"] - estado["hours_remaining"]
    print("AVISO HORARIO - %s de %g h" % (
        (estado["rally_type"] or "sin certamen").upper(), estado["hours_total"]))
    print("  transcurrido : %g h" % transcurrido)
    print("  restante     : %g h" % estado["hours_remaining"])
    print("  alcanzado    : %.1f%% -> %s" % (estado["porcentaje_alcanzado"], estado["fase"]))
    if estado["alerta_roja"]:
        print("  ALERTA ROJA  : assets congelados, el pautado ya no se reescribe.")
    pendientes = estado["entregables_pendientes"]
    if pendientes:
        print("  faltan       : %s" % ", ".join(pendientes))
    else:
        print("  faltan       : nada, checklist cerrado.")
    return 0


VALIDADORES_SIRLI = ("validate_brief.py", "validate_budget.py", "validate_pautado.py")


def ejecutar_validadores(scripts: pathlib.Path | None = None, timeout: int = 180) -> list[dict]:
    """Corre los tres validadores que la regla 11 exige antes de SIRLI.

    El rally no se envia si uno esta en rojo: se devuelve la ultima linea de cada
    validador para que el error se lea, no solo el codigo de salida.
    """
    carpeta = pathlib.Path(scripts) if scripts else (RAIZ / "scripts")
    resultados = []
    for nombre in VALIDADORES_SIRLI:
        ruta = carpeta / nombre
        if not ruta.exists():
            resultados.append({"nombre": nombre, "codigo": 127, "detalle": "no existe"})
            continue
        res = subprocess.run(
            [sys.executable, str(ruta)], cwd=str(RAIZ),
            capture_output=True, text=True, errors="replace", timeout=timeout,
        )
        salida = ((res.stdout or "") + (res.stderr or "")).splitlines()
        lineas = [l.strip() for l in salida if l.strip()]
        resultados.append({
            "nombre": nombre,
            "codigo": res.returncode,
            "detalle": lineas[-1] if lineas else "",
        })
    return resultados


def cmd_validadores(args: argparse.Namespace) -> int:
    resultados = ejecutar_validadores(getattr(args, "scripts", None))
    for r in resultados:
        marca = "PASA" if r["codigo"] == 0 else "REVISAR"
        print("  %-24s %-8s %s" % (r["nombre"], marca, r["detalle"]))
    return 1 if any(r["codigo"] for r in resultados) else 0


def cmd_todo(args: argparse.Namespace) -> int:
    resultados: dict[str, int] = {}
    print("\n== 0. Validadores antes de SIRLI ==")
    resultados["validadores"] = cmd_validadores(
        argparse.Namespace(scripts=getattr(args, "scripts", None)))
    print("\n== 1. Duracion (regla oficial) ==")
    resultados["duracion"] = cmd_duracion(argparse.Namespace(archivos=args.archivos))
    print("\n== 2. Coherencia de cifras ==")
    resultados["coherencia"] = cmd_coherencia(argparse.Namespace(
        guion=args.guion, narracion=args.narracion, pautado=args.pautado, ignorar=args.ignorar,
    ))
    print("\n== 3. Caracteres por campo ==")
    resultados["campo"] = cmd_campo(argparse.Namespace(
        docx=args.docx, plantilla=args.plantilla, evento=getattr(args, "evento", "latam"),
    ))
    print("\n== 4. Diseno y producto ==")
    for nombre, script in (("producto", "verificar_producto.py"),
                           ("identidad", "verificar_identidad.py"),
                           ("frontera", "verificar_frontera.py")):
        ruta = RAIZ / "scripts" / script
        codigo = subprocess.run([sys.executable, str(ruta)], cwd=str(RAIZ),
                                capture_output=True, text=True).returncode
        print(f"  {script}: {'PASA' if codigo == 0 else 'REVISAR'}")
        resultados[nombre] = codigo

    print("\n== RESUMEN ==")
    for nombre, codigo in resultados.items():
        print(f"  {nombre:<12} {'PASA' if codigo == 0 else 'REVISAR'}")
    return 1 if any(resultados.values()) else 0


def construir_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        prog="arsenal.py",
        description="Checks deterministas y registro de herramientas del rally.",
    )
    sub = parser.add_subparsers(dest="comando", required=True)

    p = sub.add_parser("check-duracion", help="Valida <= 120 s y pista de audio")
    p.add_argument("archivos", nargs="*")
    p.set_defaults(func=cmd_duracion)

    p = sub.add_parser("check-coherencia", help="Cruza cifras entre entregables")
    p.add_argument("--guion", default="script/script.md")
    p.add_argument("--narracion", default="script/narration.txt")
    p.add_argument("--pautado", default="docs/pautado_draft.docx")
    p.add_argument("--ignorar", default="", help="Cifras permitidas, separadas por coma")
    p.set_defaults(func=cmd_coherencia)

    p = sub.add_parser("check-campo", help="Caracteres por campo del pautado")
    p.add_argument("--docx", default="docs/pautado_draft.docx")
    p.add_argument("--plantilla", default="plantillas/pautado_template.docx")
    p.add_argument("--evento", choices=["latam", "nacional"], default="latam",
                   help="Latam aplica topes por seccion; Nacional no los fija.")
    p.set_defaults(func=cmd_campo)

    p = sub.add_parser("check-validadores", help="validate_brief, budget y pautado antes de SIRLI")
    p.add_argument("--scripts", default=None, help="Carpeta de validadores (por defecto scripts/)")
    p.set_defaults(func=cmd_validadores)

    p = sub.add_parser("check-todo", help="Los tres checks antes de SIRLI")
    p.add_argument("archivos", nargs="*")
    p.add_argument("--scripts", default=None)
    p.add_argument("--guion", default="script/script.md")
    p.add_argument("--narracion", default="script/narration.txt")
    p.add_argument("--pautado", default="docs/pautado_draft.docx")
    p.add_argument("--docx", default="docs/pautado_draft.docx")
    p.add_argument("--plantilla", default="plantillas/pautado_template.docx")
    p.add_argument("--evento", choices=["latam", "nacional"], default="latam")
    p.add_argument("--ignorar", default="")
    p.set_defaults(func=cmd_todo)

    p = sub.add_parser("check-tiempo", help="Reloj del certamen y aviso horario")
    p.add_argument("--brief", default=str(BRIEF))
    p.add_argument("--restante", type=float, default=None,
                   help="Horas restantes; simula el reloj sin tocar brief.json")
    p.add_argument("--json", action="store_true", help="Salida JSON del estado")
    p.set_defaults(func=cmd_tiempo)

    p = sub.add_parser("refresh", help="Actualiza versiones en arsenal.lock.yaml")
    p.add_argument("--write", action="store_true")
    p.set_defaults(func=cmd_refresh)

    p = sub.add_parser("status", help="Resume el registro")
    p.set_defaults(func=cmd_status)

    return parser


def main(argv: list[str] | None = None) -> int:
    parser = construir_parser()
    args = parser.parse_args(argv)
    return args.func(args)


if __name__ == "__main__":
    raise SystemExit(main())
