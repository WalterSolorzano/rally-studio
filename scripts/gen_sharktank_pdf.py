#!/usr/bin/env python3
"""Genera el PDF de salud de la idea (skill sharktank).

Entrada: JSON con project, rally, date, summary, solid, findings, prior_art, queries.
Salida:  docs/sharktank_<slug>.pdf (Chrome/Edge headless).

Diseño: brand/tokens.css (primary #1d45b9, secondary #f81110, accent #2aa7ad).
No imprime puntajes ni probabilidades: solo hallazgos, supuestos y prior art verificable.
"""
from __future__ import annotations

import argparse
import html
import json
import re
import shutil
import subprocess
import sys
import tempfile
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT_DIR = ROOT / "docs"

CHROME_CANDIDATES = [
    Path(r"C:\Program Files\Google\Chrome\Application\chrome.exe"),
    Path(r"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe"),
    Path(r"C:\Program Files\Microsoft\Edge\Application\msedge.exe"),
    Path(r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"),
]

CSS = """
:root {
  --primary: #1d45b9; --secondary: #f81110; --accent: #2aa7ad;
  --bg: #ffffff; --ink: #111111; --muted: #626a7a; --grid: #e2e5ee; --wash: #f4f6fb;
  --sans: "Segoe UI", "Helvetica Neue", Arial, sans-serif;
}
@page { size: A4; margin: 18mm 16mm 18mm; }
@page :first { margin: 0; }
html { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
body { margin: 0; font-family: var(--sans); font-size: 10.2pt; line-height: 1.5;
  color: var(--ink); background: var(--bg); }
.cover { padding: 26mm 18mm 14mm; background: var(--wash); border-bottom: 4px solid var(--primary); }
.kicker { font-size: 9pt; letter-spacing: .14em; text-transform: uppercase;
  color: var(--primary); font-weight: 700; margin: 0 0 8mm; }
h1 { font-size: 24pt; line-height: 1.15; margin: 0 0 4mm; color: var(--ink); }
.sub { font-size: 11pt; color: var(--muted); margin: 0 0 6mm; }
.meta { display: flex; gap: 10mm; font-size: 9pt; color: var(--muted); }
main { padding: 10mm 18mm 14mm; }
h2 { font-size: 13pt; color: var(--primary); border-bottom: 1.5px solid var(--grid);
  padding-bottom: 2mm; margin: 9mm 0 3mm; }
h3 { font-size: 10.5pt; margin: 5mm 0 1.5mm; }
p, li { font-size: 10pt; }
.solid li { color: var(--ink); margin-bottom: 1.5mm; }
.solid li::marker { color: var(--accent); }
.finding { border-left: 3px solid var(--primary); background: var(--wash);
  padding: 3mm 4mm; margin: 0 0 3mm; page-break-inside: avoid; }
.finding.ide { border-left-color: var(--secondary); }
.tag { display: inline-block; font-size: 8pt; font-weight: 700; letter-spacing: .06em;
  text-transform: uppercase; padding: .6mm 2mm; margin-right: 2mm; border-radius: 2px;
  background: var(--primary); color: #fff; }
.tag.imp { background: var(--muted); }
.tag.sup { background: #fff; color: var(--primary); border: 1px solid var(--primary); }
.finding h3 { margin-top: 0; }
.why, .mit { font-size: 9.5pt; margin: 1mm 0; }
.why b, .mit b { color: var(--primary); }
table { width: 100%; border-collapse: collapse; font-size: 9pt; margin-top: 2mm; }
th { text-align: left; background: var(--wash); color: var(--primary);
  border-bottom: 1.5px solid var(--primary); padding: 2mm; }
td { border-bottom: 1px solid var(--grid); padding: 2mm; vertical-align: top; }
.q { font-family: Consolas, monospace; font-size: 8.5pt; color: var(--muted); }
.empty { color: var(--muted); font-style: italic; }
.foot { margin-top: 8mm; font-size: 8.5pt; color: var(--muted);
  border-top: 1px solid var(--grid); padding-top: 2mm; }
"""


def e(valor) -> str:
    return html.escape(str(valor if valor is not None else ""))


def slugify(texto: str) -> str:
    slug = re.sub(r"[^a-z0-9]+", "-", texto.lower()).strip("-")
    return slug[:60] or "proyecto"


def chrome_path() -> Path:
    for cand in CHROME_CANDIDATES:
        if cand.exists():
            return cand
    raise SystemExit("No se encontro Chrome/Edge para generar el PDF.")


def finding_html(f: dict) -> str:
    sev = f.get("severity", "idea")
    tipo = f.get("type", "supuesto")
    cls = "finding ide" if sev == "idea" else "finding"
    sev_label = "Idea" if sev == "idea" else "Implementación"
    sev_cls = "" if sev == "idea" else " imp"
    tipo_cls = " sup" if tipo == "supuesto" else ""
    return (
        f'<div class="{cls}">'
        f'<span class="tag{sev_cls}">{e(sev_label)}</span>'
        f'<span class="tag{tipo_cls}">{e(tipo.capitalize())}</span>'
        f'<span class="tag imp">{e(f.get("area", ""))}</span>'
        f"<h3>{e(f.get('title', ''))}</h3>"
        f'<p class="why"><b>Por qué:</b> {e(f.get("why", ""))}</p>'
        f'<p class="mit"><b>Mitigación:</b> {e(f.get("mitigation", ""))}</p>'
        f"</div>"
    )


def build_html(data: dict) -> str:
    solid = data.get("solid") or []
    findings = data.get("findings") or []
    prior = data.get("prior_art") or []
    queries = data.get("queries") or []

    solid_html = (
        "<ul class='solid'>" + "".join(f"<li>{e(s)}</li>" for s in solid) + "</ul>"
        if solid else '<p class="empty">Sin puntos sólidos documentados.</p>'
    )
    findings_html = (
        "".join(finding_html(f) for f in findings)
        if findings else '<p class="empty">No se hallaron fallas claras en la idea.</p>'
    )
    if prior:
        filas = "".join(
            "<tr>"
            f"<td>{e(p.get('publication') or 'sin número verificado')}</td>"
            f"<td>{e(p.get('year', ''))}</td>"
            f"<td>{e(p.get('holder', ''))}</td>"
            f"<td>{e(p.get('difference', ''))}</td>"
            "</tr>"
            for p in prior
        )
        prior_html = (
            "<table><tr><th>Publicación</th><th>Año</th><th>Titular</th>"
            f"<th>Diferencia con el proyecto</th></tr>{filas}</table>"
        )
    else:
        prior_html = '<p class="empty">Sin coincidencias claras en las fuentes consultadas.</p>'

    queries_html = (
        "<p class='q'>" + " · ".join(e(q) for q in queries) + "</p>" if queries else ""
    )

    return f"""<!DOCTYPE html>
<html lang="es"><head><meta charset="utf-8">
<title>Sharktank · {e(data.get('project', ''))}</title>
<style>{CSS}</style></head><body>
<header class="cover">
  <p class="kicker">Rally Studio · Salud de la idea</p>
  <h1>{e(data.get('project', 'Proyecto sin nombre'))}</h1>
  <p class="sub">{e(data.get('summary', ''))}</p>
  <div class="meta"><span>Certamen: {e(data.get('rally', ''))}</span>
  <span>Fecha: {e(data.get('date') or date.today().isoformat())}</span>
  <span>Hallazgos: {len(findings)}</span></div>
</header>
<main>
  <h2>Lo que ya aguanta</h2>
  {solid_html}
  <h2>Fallas posibles de la idea</h2>
  {findings_html}
  <h2>Patentes y proyectos parecidos</h2>
  {prior_html}
  <h2>Consultas realizadas</h2>
  {queries_html or '<p class="empty">Sin consultas externas.</p>'}
  <p class="foot">Documento de preparación interno. No es veredicto de jurado ni asesoría
  legal de propiedad intelectual. Los supuestos marcados requieren validación antes de
  afirmarlos ante el certamen.</p>
</main></body></html>"""


def main(argv=None) -> int:
    parser = argparse.ArgumentParser(description="Genera el PDF de salud de la idea (sharktank)")
    parser.add_argument("--payload", required=True, help="JSON con el informe")
    parser.add_argument("--out", default="", help="ruta PDF de salida (opcional)")
    args = parser.parse_args(argv)

    data = json.loads(Path(args.payload).read_text(encoding="utf-8-sig"))
    if not isinstance(data, dict):
        raise SystemExit("El payload debe ser un objeto JSON.")

    OUT_DIR.mkdir(exist_ok=True)
    slug = slugify(data.get("project", "proyecto"))
    out = Path(args.out) if args.out else OUT_DIR / f"sharktank_{slug}.pdf"
    out.parent.mkdir(parents=True, exist_ok=True)

    with tempfile.TemporaryDirectory() as tmp:
        html_path = Path(tmp) / "sharktank.html"
        html_path.write_text(build_html(data), encoding="utf-8")
        chrome = chrome_path()
        cmd = [
            str(chrome), "--headless", "--disable-gpu", "--no-sandbox",
            "--no-pdf-header-footer",
            f"--print-to-pdf={out}", html_path.as_uri(),
        ]
        proc = subprocess.run(cmd, capture_output=True, text=True, timeout=120)
        if proc.returncode != 0 or not out.exists():
            print(proc.stderr, file=sys.stderr)
            raise SystemExit(f"Fallo la generacion del PDF: {proc.stderr[:400]}")

    print(out)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
