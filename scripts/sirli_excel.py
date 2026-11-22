#!/usr/bin/env python3
"""Arma el Excel del banco de ganadores SIRLI.

Cruza winners.jsonl + meta/videos.jsonl + transcripts/*.json y escribe
research/sirli/excel/ganadores_sirli.xlsx con hojas listas para filtrar.

    python scripts/sirli_excel.py
"""

from __future__ import annotations

import json
import re
import sys
from collections import Counter
from pathlib import Path

from openpyxl import Workbook
from openpyxl.styles import Alignment, Font, PatternFill
from openpyxl.utils import get_column_letter

ROOT = Path(__file__).resolve().parents[1]
SIRLI = ROOT / "research" / "sirli"
XLSX = SIRLI / "excel" / "ganadores_sirli.xlsx"

SOLUTION_HINTS = (
    "consiste",
    "propuesta",
    "proyecto",
    "solucion",
    "solución",
    "permite",
    "desarrollamos",
    "creamos",
    "dispositivo",
    "plataforma",
    "sistema",
    "prototipo",
    "tenemos como objetivo",
    "busca",
)
NOISE = (
    "suscribete",
    "suscríbete",
    "dale like",
    "instagram",
    "facebook",
    "tiktok",
    "whatsapp",
    "correo",
    "integrantes",
    "docente",
    "universidad tecnologica",
    "todos los derechos",
)


def clean(text: str) -> str:
    text = re.sub(r"https?://\S+", "", text)
    text = re.sub(r"#\w+", "", text)
    text = re.sub(r"[\U0001F300-\U0001FAFF\u2600-\u27BF]", "", text)
    return re.sub(r"\s+", " ", text).strip()


def split_lines(body: str) -> list[str]:
    raw = [clean(x) for x in re.split(r"[\n\r]+|(?<=[.!?])\s{2,}", body)]
    return [r for r in raw if len(r) > 22]


def solution_from_description(body: str) -> tuple[str, str]:
    lines = split_lines(body)
    if not lines:
        return "", ""
    good = [l for l in lines if any(h in l.lower() for h in SOLUTION_HINTS) and not any(n in l.lower() for n in NOISE)]
    if good:
        return " ".join(good[:3])[:900], "descripcion"
    fallback = [l for l in lines if not any(n in l.lower() for n in NOISE)]
    if fallback:
        return " ".join(fallback[:2])[:600], "descripcion (debil)"
    return "", ""


def solution_from_title(title: str) -> tuple[str, str]:
    if not title:
        return "", ""
    parts = [p.strip(" ._-|") for p in re.split(r"\s*[-|–]\s*|\s*#|_", title) if p.strip()]
    keep = []
    for p in parts:
        low = p.lower()
        if re.search(r"rally|sirli|latinoameric|latam|20\d\d|desaf[ií]o|sede|universidad|equipo\s*\d", low):
            continue
        if len(p) < 3:
            continue
        keep.append(p)
    core = " - ".join(keep) if keep else re.sub(r"[_]+", " ", parts[0] if parts else title)
    core = core.strip(" ._-|")
    if len(core) >= 3:
        return core[:200], "titulo (nombre del proyecto)"
    return "", ""


def heuristica_desafio(challenge: str) -> str:
    c = challenge.lower()
    tabla = [
        (r"residuo|basura|recicl|plastico|plástico", "Residuos y reciclaje"),
        (r"agua|h[ií]dric|potable|riego|lluvia", "Agua"),
        (r"energ|solar|el[eé]ctric", "Energía"),
        (r"aliment|nutric|hambre|cosecha|agro|caf[eé]|cacao|suelo", "Alimentación y agro"),
        (r"salud|medic|paciente|enfermedad|discapac", "Salud e inclusión"),
        (r"educ|escuela|estudiante|aprendizaje", "Educación"),
        (r"mujer|g[eé]nero|violencia", "Género"),
        (r"movilidad|transporte|tr[aá]fico|veh[ií]culo", "Movilidad"),
        (r"clima|inundaci|sequ[ií]a|riesgo|hurac", "Clima y riesgo"),
        (r"vivienda|hogar|construcci", "Vivienda"),
        (r"turismo|cultura|patrimonio|artesan", "Turismo y cultura"),
        (r"digital|app|software|sensor|inteligencia artificial|tecnolog", "Tecnología digital"),
        (r"emprend|pyme|mipyme|negocio|ingreso", "Emprendimiento"),
        (r"poliniz|abeja|biodivers|ecosistema|forest", "Biodiversidad"),
    ]
    for pat, label in tabla:
        if re.search(pat, c):
            return label
    return "Otro"


def main() -> int:
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    winners = [json.loads(l) for l in (SIRLI / "winners.jsonl").read_text(encoding="utf-8").splitlines() if l.strip()]
    meta: dict[str, dict] = {}
    mpath = SIRLI / "meta" / "videos.jsonl"
    if mpath.exists():
        for line in mpath.read_text(encoding="utf-8").splitlines():
            if line.strip():
                d = json.loads(line)
                meta[d["video_id"]] = d
    trans: dict[str, dict] = {}
    for p in (SIRLI / "transcripts").glob("*.json"):
        d = json.loads(p.read_text(encoding="utf-8"))
        trans[d["video_id"]] = d

    XLSX.parent.mkdir(parents=True, exist_ok=True)
    wb = Workbook()

    # ---------- hoja 1: ganadores ----------
    ws = wb.active
    ws.title = "Ganadores"
    headers = [
        "Año", "Colección", "Puesto", "Equipo", "País", "Sede", "Categoría",
        "N° desafío", "Desafío (problema)", "Solución (extraída)", "Fuente solución",
        "Tema", "Título del video", "Descripción completa del video", "Duración (s)",
        "Vistas", "Me gusta", "Canal", "Publicado", "Subtítulos", "URL del video",
        "Video ID", "Transcrito",
    ]
    ws.append(headers)
    bold = Font(bold=True, color="FFFFFF")
    fill = PatternFill("solid", fgColor="1F3864")
    for c in ws[1]:
        c.font = bold
        c.fill = fill
        c.alignment = Alignment(vertical="center", wrap_text=True)

    sol_cache: dict[str, tuple[str, str]] = {}
    src_counter: Counter = Counter()
    for w in winners:
        vid = w["video_id"] or ""
        m = meta.get(vid, {})
        if vid and vid not in sol_cache:
            body = m.get("description") or ""
            sol, src = solution_from_description(body)
            if not sol:
                sol, src = solution_from_title(m.get("title") or "")
            sol_cache[vid] = (sol, src)
        sol, src = sol_cache.get(vid, ("", ""))
        if vid in trans and (trans[vid].get("text") or "").strip():
            sol = trans[vid]["text"][:900]
            src = "transcripcion"
        src_counter[src] += 1
        ws.append([
            w["year"], w["collection"], w["place_label"] or "", w["team"], w["country"],
            w["sede"], w["category"], w["challenge_number"] or "", w["challenge_name"] or w["challenge"],
            sol, src, heuristica_desafio(w["challenge"] or ""), m.get("title") or "",
            clean(m.get("description") or "")[:3000], m.get("length_s"),
            m.get("view_count"), m.get("like_count"), m.get("channel") or "",
            (m.get("publish_date") or m.get("upload_date") or "")[:10],
            ", ".join(m.get("subtitle_langs") or []) or ("sin datos" if not m or m.get("failed") else "no"),
            w["video_url"] or "", vid, "sí" if vid in trans and trans[vid].get("text") else "",
        ])

    widths = [6, 14, 16, 30, 16, 26, 18, 6, 52, 70, 26, 20, 44, 80, 10, 10, 10, 24, 12, 14, 34, 14, 10]
    for i, width in enumerate(widths, 1):
        ws.column_dimensions[get_column_letter(i)].width = width
    ws.freeze_panes = "A2"
    ws.auto_filter.ref = f"A1:{get_column_letter(len(headers))}{ws.max_row}"
    for row in ws.iter_rows(min_row=2, min_col=9, max_col=10):
        for c in row:
            c.alignment = Alignment(wrap_text=True, vertical="top")

    # ---------- hoja 2: resumen ----------
    rs = wb.create_sheet("Resumen")
    rs.append(["Registros por año y colección"])
    rs["A1"].font = Font(bold=True, size=12)
    rs.append(["Año", "Sede", "Nacional", "Internacional", "Total"])
    years = sorted({w["year"] for w in winners})
    cols = ["sede", "nacional", "internacional"]
    for y in years:
        counts = [sum(1 for w in winners if w["year"] == y and w["collection"] == c) for c in cols]
        rs.append([y, *counts, sum(counts)])
    totals = [sum(1 for w in winners if w["collection"] == c) for c in cols]
    rs.append(["TOTAL", *totals, sum(totals)])

    rs.append([])
    rs.append(["Top 15 países (todas las colecciones)"])
    rs.cell(row=rs.max_row, column=1).font = Font(bold=True, size=12)
    for country, n in Counter(w["country"] for w in winners).most_common(15):
        rs.append([country, n])

    rs.append([])
    rs.append(["Cobertura de solución extraída"])
    rs.cell(row=rs.max_row, column=1).font = Font(bold=True, size=12)
    fuentes = src_counter
    for k, v in fuentes.most_common():
        rs.append([k or "(sin datos)", v])
    rs.column_dimensions["A"].width = 34
    for col in "BCDE":
        rs.column_dimensions[col].width = 12

    # ---------- hoja 3: desafios ----------
    ds = wb.create_sheet("Desafíos")
    ds.append(["Desafío (texto completo)", "N°", "Tema", "Equipos que lo trabajaron", "Años"])
    for c in ds[1]:
        c.font = bold
        c.fill = fill
    agg: dict[str, dict] = {}
    for w in winners:
        key = w["challenge_name"] or w["challenge"] or "(sin desafío)"
        item = agg.setdefault(key, {"n": 0, "num": w["challenge_number"] or "", "years": set()})
        item["n"] += 1
        item["years"].add(w["year"])
    for key, item in sorted(agg.items(), key=lambda kv: -kv[1]["n"]):
        years_txt = ", ".join(str(y) for y in sorted(item["years"]))
        ds.append([key, item["num"], heuristica_desafio(key), item["n"], years_txt])
    ds.append([])
    ds.append(["Por tema"])
    ds.cell(row=ds.max_row, column=1).font = Font(bold=True, size=12)
    for tema, n in Counter(heuristica_desafio(w["challenge"] or "") for w in winners).most_common():
        ds.append([tema, "", "", n, ""])
    ds.column_dimensions["A"].width = 70
    ds.column_dimensions["C"].width = 26
    ds.column_dimensions["D"].width = 24
    ds.column_dimensions["E"].width = 22
    ds.freeze_panes = "A2"

    # ---------- hoja 4: transcripciones ----------
    ts = wb.create_sheet("Transcripciones")
    ts.append(["Video ID", "Año", "Colección", "Equipo", "País", "Puesto", "Duración s", "Palabras", "Fuente", "Texto (inicio)"])
    for c in ts[1]:
        c.font = bold
        c.fill = fill
    for vid, d in sorted(trans.items(), key=lambda kv: (kv[1]["year"], kv[1]["team"])):
        text = d.get("text") or ""
        ts.append([
            vid, d["year"], d["collection"], d["team"], d["country"], d.get("place_label") or "",
            d.get("duration_s"), len(text.split()), d.get("caption_source"), text[:1500],
        ])
    ts.column_dimensions["D"].width = 28
    ts.column_dimensions["J"].width = 100
    for row in ts.iter_rows(min_row=2, min_col=10, max_col=10):
        for c in row:
            c.alignment = Alignment(wrap_text=True, vertical="top")
    ts.freeze_panes = "A2"

    # ---------- hoja 5: metodologia ----------
    ms = wb.create_sheet("Metodología")
    lines = [
        ("Fuente", "sirli.org/ganadores — colecciones sede, nacional e internacional, 2017–2026"),
        ("Registros", f"{len(winners)} premios; {len({w['video_id'] for w in winners if w['video_id']})} videos únicos"),
        ("Campo Desafío", "Texto publicado por SIRLI: número y enunciado del reto. Es el problema, no la solución."),
        ("Campo Solución", "Extraída automáticamente de la descripción pública del video en YouTube y, cuando existe, del nombre del proyecto en el título."),
        ("Campo Fuente solución", "Indica de dónde salió el texto: descripcion, descripcion (debil), titulo (nombre del proyecto) o transcripcion."),
        ("Transcripciones", f"{len(trans)} videos con subtítulos descargados (foco: internacional 2022–2026, nacional y sede de Nicaragua)."),
        ("Tema", "Clasificación por palabras clave del enunciado del desafío. Es orientativa."),
        ("Límite", "SIRLI no publica descripción del proyecto en la ficha del ganador; la solución depende del material que subió cada equipo a YouTube."),
        ("Categoría", "La colección internacional no expone categoría en el sitio."),
    ]
    for k, v in lines:
        ms.append([k, v])
        ms.cell(row=ms.max_row, column=1).font = Font(bold=True)
        ms.cell(row=ms.max_row, column=2).alignment = Alignment(wrap_text=True, vertical="top")
    ms.column_dimensions["A"].width = 22
    ms.column_dimensions["B"].width = 110

    wb.save(XLSX)
    print(f"excel: {XLSX}")
    print(f"filas ganadores: {ws.max_row - 1}")
    print("fuentes de solución:", dict(fuentes))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

