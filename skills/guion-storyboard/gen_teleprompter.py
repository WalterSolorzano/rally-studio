#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
gen_teleprompter.py -- Guion + storyboard en un solo entregable de rodaje.

Entra:
    script/script.md            guion PAS-V (tabla por actos o prosa por acto)
    script/shotlist.csv         contrato de tomas compilado por build_shotlist.py
    script/movimiento.json      sidecar de movimiento por toma (lo crea este script si falta)
    brief.json                  proyecto, equipo, ciudad, certamen

Sale:
    script/teleprompter.html    una pagina, tres modos: Ritmo, Direccion, Telefono.

No toca el motor: no escribe en dashboard/, no modifica el shotlist, no
reimplementa la rubrica. Solo lee y presenta.

Uso:
    python skills/guion-storyboard/gen_teleprompter.py
    python skills/guion-storyboard/gen_teleprompter.py --csv script/shotlist.csv \\
        --script script/script.md --out script/teleprompter.html
    python skills/guion-storyboard/gen_teleprompter.py --demo --out tmp/teleprompter_demo.html

Regla dura que aplica: una imagen fija mas de STATIC_MAX segundos es tiempo muerto.
"""
from __future__ import annotations

import argparse
import base64
import csv
import io
import json
import re
import sys
from pathlib import Path

if sys.platform == "win32":
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")

RAIZ = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(RAIZ / "scripts"))

# Los actos salen de la base compartida: las fracciones se leen de
# knowledge/rubric_matrices.md y no se copian aqui.
from comun import ACTOS, COLORES, DURACION  # noqa: E402  (tras ajustar sys.path)

WPM_DEFECTO = 135
STATIC_MAX = 2.5
PALABRAS_MIN, PALABRAS_MAX = 240, 270

# Taxonomia de movimiento. Si una toma no declara tipo, se asume estatica (rojo).
TIPOS_MOV = {
    "camara": "la camara se mueve (paneo, dolly, seguimiento, handheld)",
    "objeto": "el mecanismo o el material se mueve dentro del cuadro",
    "motion2d": "graficos animados, contadores, barras, mapas",
    "persona": "accion real de una persona (no posado)",
    "transicion": "movimiento generado por el corte (match cut, whip pan, J-cut)",
    "3d": "orbit, explosionada, corte animado del modelo",
    "estatico": "plano fijo: solo se admite si dura menos de 2.5 s",
}

DEMO_TEXTOS = {
    "I": ("Cada semana, una tonelada de fruta madura termina en la basura del mercado. "
          "Segun la FAO, un tercio de lo que se produce nunca llega a un plato. "
          "La vendedora lo sabe: lo que no se vende hoy, manana se pudre."),
    "II": ("Nuestro modulo es una bandeja con dos camaras de aire que seca en seis horas lo que el sol tarda tres dias. "
           "El ventilador mueve aire caliente entre capas, el sensor corta cuando la humedad baja del doce por ciento. "
           "La pieza se imprime en el municipio, sin importar nada."),
    "III": ("El piloto cuesta cuatro mil quinientos dolares: dos bandejas, un ventilador y el sensor. "
            "Cada kilo rescatado deja sesenta centavos al productor. "
            "El mercado paga la mitad del equipo porque deja de comprar relleno."),
    "IV": ("Volvemos al mismo puesto, con la misma vendedora, y su bandeja ya no se vacia. "
           "Piloto en el municipio, replicable en toda America Latina."),
}

DEMO_SHOTS = [
    {"id": "S01", "act": "I", "duration_s": "4.8", "asset_id": "asset_S01_rostro_vendedora",
     "asset_type": "video_real", "status": "pendiente",
     "description": "Primer plano de la vendedora mirando a camara, fondo de puesto legible",
     "visual_notes": "Luz natural lateral", "audio": "Ambiente de mercado, sin musica",
     "transicion": "J-cut: el mercado se oye antes de verse",
     "movimiento": {"tipo": "persona", "detalle": "respira y mira a camara, mano trabajando"}},
    {"id": "S02", "act": "I", "duration_s": "5.2", "asset_id": "asset_S02_descarte_mano",
     "asset_type": "video_real", "status": "pendiente",
     "description": "Mano dejando el producto en la caja de descarte",
     "visual_notes": "Macro 85 mm", "audio": "Sonido real de la caja",
     "transicion": "Corte seco",
     "movimiento": {"tipo": "objeto", "detalle": "la fruta cae en la caja"}},
    {"id": "S03", "act": "II", "duration_s": "8.0", "asset_id": "asset_S03_render_modulo",
     "asset_type": "render_3d", "status": "asignado",
     "description": "Render del modulo con corte que muestra el flujo interno",
     "visual_notes": "Orbit lento 90 grados", "audio": "Pulso 90 bpm, sin melodia",
     "transicion": "Corte al movimiento",
     "movimiento": {"tipo": "3d", "detalle": "orbit de 90 grados con corte visible"}},
    {"id": "S04", "act": "II", "duration_s": "3.0", "asset_id": "asset_S04_placa_costo",
     "asset_type": "tipografia", "status": "pendiente",
     "description": "Placa con el costo unitario",
     "visual_notes": "Contador subiendo", "audio": "Silencio bajo la cifra",
     "transicion": "Corte seco",
     "movimiento": {"tipo": "motion2d", "detalle": "contador que sube y se detiene"}},
    {"id": "S05", "act": "III", "duration_s": "6.0", "asset_id": "asset_S05_persona_usa",
     "asset_type": "video_real", "status": "pendiente",
     "description": "Alguien usando la solucion en el sitio real",
     "visual_notes": "Handheld suave", "audio": "Sonido del objeto",
     "transicion": "Barrido al espacio",
     "movimiento": {"tipo": "camara", "detalle": "handheld siguiendo las manos"}},
    {"id": "S06", "act": "IV", "duration_s": "3.2", "asset_id": "asset_S06_cierre",
     "asset_type": "video_real", "status": "pendiente",
     "description": "Vuelta al rostro del Acto I",
     "visual_notes": "Mismo lente y luz que S01", "audio": "Musica local calida",
     "transicion": "Fundido de 4 frames",
     "movimiento": {"tipo": "estatico", "detalle": "plano fijo corto, cierra en 3.2 s"}},
]


def _leer(p: Path) -> str:
    try:
        return p.read_text(encoding="utf-8", errors="replace")
    except OSError:
        return ""


def _json(p: Path, defecto):
    try:
        return json.loads(p.read_text(encoding="utf-8"))
    except (OSError, ValueError):
        return defecto


def _limpiar(texto: str) -> str:
    t = re.sub(r"[_*`]+", " ", texto or "")
    t = re.sub(r"\s+", " ", t).strip()
    if t.lower() in {"pendiente", "por definir", "tbd", ""}:
        return ""
    return t


def _palabras(texto: str) -> int:
    return len([p for p in re.split(r"\s+", texto or "") if re.search(r"\w", p)])


def leer_guion(ruta: Path) -> dict[str, str]:
    """Devuelve {I,II,III,IV: texto}. Acepta tabla por actos o prosa con encabezados."""
    texto = _leer(ruta)
    actos = {k: "" for k, _, _ in ACTOS}
    if not texto:
        return actos

    # 1) tabla: | A1 | 0:00-0:20 | funcion | texto |
    for linea in texto.splitlines():
        if not linea.strip().startswith("|"):
            continue
        celdas = [c.strip() for c in linea.strip().strip("|").split("|")]
        if len(celdas) < 3:
            continue
        etiqueta = celdas[0].upper()
        mapa = {"A1": "I", "A2": "II", "A3": "III", "A4": "IV",
                "1": "I", "2": "II", "3": "III", "4": "IV",
                "I": "I", "II": "II", "III": "III", "IV": "IV"}
        acto = mapa.get(etiqueta)
        if acto and not actos[acto]:
            candidato = _limpiar(celdas[-1])
            if candidato:
                actos[acto] = candidato

    # 2) prosa: "## Acto I" ... hasta el siguiente encabezado
    if not any(actos.values()):
        partes = re.split(r"\n(?=#{1,4}\s)", texto)
        for bloque in partes:
            cabecera = bloque.splitlines()[0] if bloque.strip() else ""
            m = re.search(r"[Aa]cto\s*(I{1,3}V?|IV|[1-4])\b", cabecera)
            if not m:
                continue
            clave = m.group(1).upper()
            clave = {"1": "I", "2": "II", "3": "III", "4": "IV"}.get(clave, clave)
            if clave in actos and not actos[clave]:
                cuerpo = "\n".join(bloque.splitlines()[1:])
                actos[clave] = _limpiar(cuerpo)

    # 3) respaldo: el guion que el equipo escribio en el workbench.
    #    El tablero guarda su espejo en dashboard/data/state.json; si
    #    script/script.md esta vacio el teleprompter salia en blanco aunque
    #    el guion existiera en pantalla.
    if not any(actos.values()):
        estado = _json(RAIZ / "dashboard/data/state.json", {})
        guion = estado.get("script") if isinstance(estado, dict) else None
        if isinstance(guion, dict):
            for acto, clave in (("I", "acto1"), ("II", "acto2"), ("III", "acto3"), ("IV", "acto4")):
                texto = _limpiar(str(guion.get(clave) or ""))
                if texto:
                    actos[acto] = texto
    return actos


EXT_IMG = (".jpg", ".jpeg", ".png", ".webp")
REF_ANCHO = 760


def _miniatura(p: Path) -> str:
    """Convierte la referencia a JPEG pequeno en data URI (una sola pagina, sirve en el telefono)."""
    try:
        from PIL import Image
        im = Image.open(p).convert("RGB")
        if im.width > REF_ANCHO:
            im = im.resize((REF_ANCHO, round(im.height * REF_ANCHO / im.width)), Image.LANCZOS)
        buf = io.BytesIO()
        im.save(buf, "JPEG", quality=74, optimize=True)
        datos = buf.getvalue()
    except Exception:
        datos = p.read_bytes()
        mime = "image/png" if p.suffix.lower() == ".png" else "image/jpeg"
        return "data:%s;base64,%s" % (mime, base64.b64encode(datos).decode("ascii"))
    return "data:image/jpeg;base64," + base64.b64encode(datos).decode("ascii")


def buscar_ref(sid: str, explicita: str, carpetas: list[Path]) -> tuple[str, str]:
    """Devuelve (data_uri, nombre del archivo) de la referencia de la toma, o ('', '')."""
    candidatas: list[Path] = []
    if explicita:
        p = Path(explicita)
        candidatas.append(p if p.is_absolute() else RAIZ / p)
    for carpeta in carpetas:
        for ext in EXT_IMG:
            candidatas.append(carpeta / (sid + ext))
            candidatas.append(carpeta / (sid.lower() + ext))
    for p in candidatas:
        if p.is_file() and p.suffix.lower() in EXT_IMG:
            return _miniatura(p), p.name
    return "", ""


def leer_shots(ruta: Path) -> list[dict]:
    if not ruta.exists():
        return []
    filas = []
    with ruta.open(encoding="utf-8", errors="replace", newline="") as f:
        for fila in csv.DictReader(f):
            filas.append({k: (v or "").strip() for k, v in fila.items() if k})
    return filas


def normalizar_shots(filas: list[dict], mov: dict, refs: list[Path] | None = None) -> list[dict]:
    out = []
    for f in filas:
        sid = f.get("id", "").strip()
        if not sid:
            continue
        try:
            dur = float(str(f.get("duration_s", "0")).replace(",", ".") or 0)
        except ValueError:
            dur = 0.0
        m = mov.get(sid) or f.get("movimiento") or {}
        tipo = (m.get("tipo") or "").strip().lower()
        if tipo in {"fijo", "quieto", "static"}:
            tipo = "estatico"
        ref, ref_nombre = buscar_ref(sid, f.get("ref", "") or (m.get("ref") or ""), refs or [])
        out.append({
            "id": sid,
            "act": (f.get("act") or "").strip().upper()[:4],
            "dur": round(dur, 2),
            "desc": f.get("description", ""),
            "asset": f.get("asset_id", ""),
            "type": f.get("asset_type", ""),
            "owner": f.get("owner", ""),
            "rubric": f.get("rubric_item", ""),
            "notes": f.get("visual_notes", "") or f.get("notes", ""),
            "audio": f.get("audio", "") or m.get("audio", ""),
            "trans": f.get("transicion", "") or m.get("transicion", ""),
            "mov": tipo,
            "movDetalle": (m.get("detalle") or "").strip(),
            "ref": ref,
            "refNombre": ref_nombre,
        })
    # timecodes acumulados
    t = 0.0
    for i, s in enumerate(out):
        s["paso"] = i + 1
        s["start"] = round(t, 2)
        t += s["dur"]
        s["end"] = round(t, 2)
    return out


def auditar(shots: list[dict], wpm: int, actos_texto: dict[str, str], total: float) -> dict:
    """Tres relojes por acto: voz (palabras), metraje (tomas) y objetivo (rubrica).

    El veredicto compara la voz contra el metraje que existe, no contra el
    objetivo: decir "faltan 2 s" cuando sobran 8 s de voz sobre 10 s de imagen
    era una medicion falsa. El objetivo se informa al lado, sin juzgar.
    """
    resumen_actos = []
    for clave, nombre, frac in ACTOS:
        objetivo = round(total * frac, 1)
        palabras = _palabras(actos_texto.get(clave, ""))
        estimado = round(palabras / wpm * 60, 1) if wpm else 0.0
        del_acto = [s for s in shots if s["act"] == clave]
        metraje_acto = round(sum(s["dur"] for s in del_acto), 1)
        delta = round(estimado - metraje_acto, 1)
        delta_objetivo = round(estimado - objetivo, 1)

        if palabras == 0 and not del_acto:
            veredicto, tono = "Sin texto ni tomas", "vacio"
        elif palabras == 0:
            veredicto, tono = "Sin texto: %.1f s de imagen mudos" % metraje_acto, "vacio"
        elif not del_acto:
            veredicto, tono = "Sin tomas: %.1f s de voz sin imagen" % estimado, "vacio"
        elif abs(delta) <= 1.5:
            veredicto, tono = "Voz y metraje empatan (%.1f s)" % metraje_acto, "ok"
        elif delta > 0:
            veredicto, tono = ("La voz no cabe: %.1f s de voz en %.1f s de metraje (sobran %.1f s)"
                               % (estimado, metraje_acto, delta)), "lento"
        else:
            veredicto, tono = ("Falta voz: %.1f s de voz en %.1f s de metraje (faltan %.1f s)"
                               % (estimado, metraje_acto, abs(delta))), "rapido"
        resumen_actos.append({
            "id": clave, "nombre": nombre, "color": COLORES[clave],
            "objetivo": objetivo, "palabras": palabras, "estimado": estimado,
            "metraje": metraje_acto, "delta": delta, "delta_objetivo": delta_objetivo,
            "veredicto": veredicto, "tono": tono,
        })

    total_palabras = sum(a["palabras"] for a in resumen_actos)
    total_estimado = round(total_palabras / wpm * 60, 1) if wpm else 0.0

    if total_palabras == 0:
        palabras_juicio = "Sin texto: el guion esta pendiente."
    elif total_palabras < PALABRAS_MIN:
        palabras_juicio = "Corto: %d palabras (minimo %d)." % (total_palabras, PALABRAS_MIN)
    elif total_palabras > PALABRAS_MAX:
        palabras_juicio = "Largo: %d palabras (maximo %d)." % (total_palabras, PALABRAS_MAX)
    else:
        palabras_juicio = "En rango: %d palabras." % total_palabras

    metraje = sum(s["dur"] for s in shots)
    estaticas = []
    movido = 0.0
    sin_mov = []
    for s in shots:
        tipo = s["mov"]
        if tipo == "estatico" or not tipo:
            estaticas.append(s)
            if not tipo:
                sin_mov.append(s["id"])
        else:
            movido += s["dur"]
    violaciones = [s for s in shots
                   if (s["mov"] == "estatico" or not s["mov"]) and s["dur"] > STATIC_MAX]

    return {
        "actos": resumen_actos,
        "total_palabras": total_palabras,
        "total_estimado": total_estimado,
        "palabras_juicio": palabras_juicio,
        "metraje": round(metraje, 2),
        "movido": round(movido, 2),
        "pct_movido": round(movido / metraje * 100, 1) if metraje else 0.0,
        "estaticas": [s["id"] for s in estaticas],
        "sin_movimiento": sin_mov,
        "violaciones": [{"id": s["id"], "dur": s["dur"], "desc": s["desc"]} for s in violaciones],
        "static_max": STATIC_MAX,
    }


PLANTILLA_RUTA = Path(__file__).resolve().parent / "plantilla_teleprompter.html"
FUENTES_RUTA = Path(__file__).resolve().parent / "fuentes.css"


def _plantilla() -> str:
    """Plantilla HTML externa: la UI se edita sin tocar la logica.

    Las fuentes de la marca (docs/assets/fuentes) se incrustan en base64 para
    que el archivo se vea igual abierto desde el telefono, sin red.
    """
    html = PLANTILLA_RUTA.read_text(encoding="utf-8")
    if FUENTES_RUTA.is_file():
        css = FUENTES_RUTA.read_text(encoding="utf-8")
        html = html.replace("/*__FUENTES__*/", css)
    return html


def construir(acts_txt: dict[str, str], shots: list[dict], brief: dict, wpm: int,
              metodo: dict) -> tuple[str, dict, list[str]]:
    total = DURACION
    auditoria = auditar(shots, wpm, acts_txt, total)

    avisos = []
    if not brief.get("project_name"):
        avisos.append("brief.json sin project_name: la cabecera dice 'Proyecto sin definir'.")
    if auditoria["total_palabras"] == 0:
        avisos.append("script.md sin texto: el teleprompter mostrara el aviso de acto vacio.")
    if not shots:
        avisos.append("script/shotlist.csv vacio: compila shots/*.yaml antes de rodar.")
    if auditoria["sin_movimiento"]:
        avisos.append("Tomas sin tipo de movimiento: " + ", ".join(auditoria["sin_movimiento"]) + ".")
    if auditoria["violaciones"]:
        avisos.append("Tomas fijas de mas de %.1f s: %s." % (
            STATIC_MAX, ", ".join(v["id"] for v in auditoria["violaciones"])))
    if metodo["demo"]:
        avisos.insert(0, "MODO DEMO: tomas de ejemplo, no del proyecto. No sirve para entregar.")

    sin_ref = [s["id"] for s in shots if not s["ref"]]
    if sin_ref:
        avisos.append("Tomas sin referencia visual: " + ", ".join(sin_ref)
                      + " (pon %s/S01.jpg o usa el campo ref)." % "script/refs")

    datos = {
        "proyecto": brief.get("project_name", ""),
        "equipo": brief.get("team_name", ""),
        "certamen": (brief.get("rally_type", "") or "").upper(),
        "wpm": wpm,
        "total_s": total,
        "static_max": STATIC_MAX,
        "actos": auditoria["actos"],
        "textos": acts_txt,
        "shots": shots,
        "total_palabras": auditoria["total_palabras"],
        "total_estimado": auditoria["total_estimado"],
        "palabras_juicio": auditoria["palabras_juicio"],
        "metraje": auditoria["metraje"],
        "pct_movido": auditoria["pct_movido"],
        "estaticas": auditoria["estaticas"],
        "sin_movimiento": auditoria["sin_movimiento"],
        "violaciones": auditoria["violaciones"],
        "sin_ref": sin_ref,
        "avisos": avisos,
        "demo": bool(metodo["demo"]),
    }
    html = (_plantilla()
            .replace("<!--__PWA__-->", bloque_pwa(datos["proyecto"], datos["demo"]))
            .replace("__DATA__", json.dumps(datos, ensure_ascii=False))
            .replace("__WPM__", str(wpm))
            .replace("__SMAX__", str(STATIC_MAX))
            .replace("__TOTAL__", "02:00"))
    return html, datos, avisos


def _icono_png(lado: int) -> bytes:
    """Dos barras azules sobre blanco, dibujadas en memoria (sin archivos ni red)."""
    try:
        from PIL import Image, ImageDraw
    except Exception:  # noqa: BLE001
        return b""
    img = Image.new("RGB", (lado, lado), "#ffffff")
    d = ImageDraw.Draw(img)
    ancho = max(6, round(lado * 0.11))
    desp = round(lado * 0.06)
    for k in (0, 1):
        x0 = round(lado * (0.30 + 0.19 * k))
        largo = round(lado * 0.20)
        d.line([(x0, lado - desp), (x0 + largo, desp)], fill="#0866F5", width=ancho)
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    return buf.getvalue()


def _manifest(proyecto: str, demo: bool, start_url: str, iconos: dict[str, str]) -> dict:
    nombre = (proyecto or "Plan de rodaje").strip() or "Plan de rodaje"
    return {
        "name": nombre + (" (demo)" if demo else ""),
        "short_name": nombre if len(nombre) <= 12 else "Rodaje",
        "start_url": start_url,
        "scope": ".",
        "display": "standalone",
        "orientation": "portrait",
        "background_color": "#ffffff",
        "theme_color": "#0e0e0f",
        "lang": "es",
        "icons": [
            {"src": iconos["192"], "sizes": "192x192", "type": "image/png", "purpose": "any"},
            {"src": iconos["512"], "sizes": "512x512", "type": "image/png", "purpose": "any"},
        ],
    }


def bloque_pwa(proyecto: str, demo: bool) -> str:
    """Etiquetas del manifest y del icono, con los datos ya incrustados.

    Van en base64 dentro del propio HTML: el archivo se puede copiar solo al
    telefono y abrirse sin servidor ni red, y no queda ninguna peticion rota.
    """
    iconos, pngs = {}, {}
    for lado in (192, 512):
        datos = _icono_png(lado)
        pngs[lado] = datos
        iconos[str(lado)] = ("data:image/png;base64," + base64.b64encode(datos).decode()
                             if datos else "icono-%d.png" % lado)
    manifest = _manifest(proyecto, demo, Path("index.html").name, iconos)
    manifiesto = ("data:application/manifest+json;base64,"
                  + base64.b64encode(json.dumps(manifest, ensure_ascii=False).encode()).decode())
    return ('<link rel="icon" type="image/png" href="' + iconos["192"] + '">\n'
            '<link rel="manifest" href="' + manifiesto + '">\n'
            '<meta name="apple-mobile-web-app-capable" content="yes">\n'
            '<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">')


def escribir_manifest(destino: Path, proyecto: str, demo: bool) -> None:
    """Deja manifest.webmanifest e iconos junto al HTML.

    Solo sirve cuando la pagina se abre por HTTP (servidor de la red local): ahi
    el navegador exige que el manifest sea del mismo origen. Abierto como archivo
    suelto, el HTML ya lleva los datos dentro y estos archivos sobran.
    """
    carpeta = destino.parent
    iconos = {}
    for lado in (192, 512):
        datos = _icono_png(lado)
        if not datos:
            return
        (carpeta / ("icono-%d.png" % lado)).write_bytes(datos)
        iconos[str(lado)] = "icono-%d.png" % lado
    manifest = _manifest(proyecto, demo, destino.name, iconos)
    (carpeta / "manifest.webmanifest").write_text(
        json.dumps(manifest, ensure_ascii=False, indent=2), encoding="utf-8")


def main() -> int:
    ap = argparse.ArgumentParser(description="Guion + storyboard en un solo entregable de rodaje.")
    ap.add_argument("--script", default="script/script.md")
    ap.add_argument("--csv", default="script/shotlist.csv")
    ap.add_argument("--mov", default="script/movimiento.json")
    ap.add_argument("--brief", default="brief.json")
    ap.add_argument("--out", default="script/teleprompter.html")
    ap.add_argument("--wpm", type=int, default=WPM_DEFECTO)
    ap.add_argument("--refs", default="script/refs",
                    help="carpeta con las referencias visuales (S01.jpg, S02.png...)")
    ap.add_argument("--demo", action="store_true", help="tomas de ejemplo para revisar la pagina")
    ap.add_argument("--seed-mov", action="store_true",
                    help="crea script/movimiento.json con la taxonomia si no existe")
    args = ap.parse_args()

    ruta_script = RAIZ / args.script
    ruta_csv = RAIZ / args.csv
    ruta_mov = RAIZ / args.mov
    ruta_brief = RAIZ / args.brief
    salida = RAIZ / args.out

    acts_txt = leer_guion(ruta_script)
    brief = _json(ruta_brief, {})
    mov = _json(ruta_mov, {})

    if args.seed_mov and not ruta_mov.exists():
        semilla = {"_tipos": TIPOS_MOV, "_regla": "toda toma declara tipo y detalle; estatico solo si dura menos de %.1f s" % STATIC_MAX}
        for s in leer_shots(ruta_csv):
            if s.get("id"):
                semilla[s["id"]] = {"tipo": "", "detalle": ""}
        ruta_mov.parent.mkdir(parents=True, exist_ok=True)
        ruta_mov.write_text(json.dumps(semilla, ensure_ascii=False, indent=2), encoding="utf-8")
        print("seed -> " + str(ruta_mov.relative_to(RAIZ)))

    refs = [RAIZ / args.refs]
    if args.demo:
        refs.insert(0, RAIZ / args.refs / "demo")

    if args.demo:
        bruto = DEMO_SHOTS
        mov = {d["id"]: d["movimiento"] for d in DEMO_SHOTS}
        shots = normalizar_shots(bruto, mov, refs)
        acts_txt = DEMO_TEXTOS
    else:
        shots = normalizar_shots(leer_shots(ruta_csv), mov, refs)

    html, datos, avisos = construir(acts_txt, shots, brief, args.wpm, {"demo": args.demo})
    salida.parent.mkdir(parents=True, exist_ok=True)
    salida.write_text(html, encoding="utf-8")
    escribir_manifest(salida, brief.get("project_name", ""), args.demo)

    # Copia servible: `rally_service.py` solo sirve `dashboard/`, y el entregable
    # vive en `script/`. Sin esta copia el equipo no puede abrir el plan desde el
    # navegador. El modo demo no publica: pisaria el entregable real.
    if not args.demo:
        try:
            sys.path.insert(0, str(RAIZ / "tools"))
            from publicar_entregables import publicar, publicar_hermanos, reindexar

            publicado = publicar(salida, "teleprompter.html")
            if publicado:
                publicar_hermanos(salida)
                reindexar()
                print("    -> publicado en dashboard/entregables/teleprompter.html")
        except Exception as exc:  # noqa: BLE001
            print("    ! no se pudo publicar en dashboard/entregables: %s" % exc)

    print("OK  tomas=%d  palabras=%d  metraje=%.1fs  movimiento=%.1f%%"
          % (len(shots), datos["total_palabras"], datos["metraje"], datos["pct_movido"]))
    print("    violaciones_estaticas=%d  sin_tipo=%d"
          % (len(datos["violaciones"]), len(datos["actos"]) and len([s for s in shots if not s["mov"]])))
    print("    acto  voz(s)  metraje(s)  objetivo(s)  juicio")
    for a in datos["actos"]:
        print("    %-4s %7.1f %11.1f %12.1f  %s"
              % (a["id"], a["estimado"], a["metraje"], a["objetivo"], a["veredicto"]))
    if datos["total_palabras"]:
        print("    TOTAL voz=%.1fs metraje=%.1fs objetivo=%.0fs  %s"
              % (datos["total_estimado"], datos["metraje"], datos["total_s"], datos["palabras_juicio"]))
    for a in avisos:
        print("    ! " + a)
    print("    -> " + str(salida.relative_to(RAIZ)))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
