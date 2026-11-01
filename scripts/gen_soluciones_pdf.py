#!/usr/bin/env python3
"""Genera el dossier PDF de soluciones para los retos del usuario.

Entrada: salida JSON de scripts/soluciones_motor.py.
Salida: docs/Dossier_Soluciones_<certamen>.pdf (via Chrome/Edge headless).

No imprime estadisticas internas: solo datos verificables de impacto y los
precedentes ganadores que sostienen cada solucion.
"""
from __future__ import annotations

import argparse
import html
import json
import shutil
import subprocess
import sys
import tempfile
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CSS_PATH = ROOT / "docs" / "assets" / "soluciones.css"
WINNERS_PATH = ROOT / "research" / "sirli" / "winners.jsonl"
BRIEF_PATH = ROOT / "brief.json"

PROHIBIDAS = ("saturacion", "saturación", "probabilidad", "win rate", "winrate", "score")

CHROME_CANDIDATES = [
    Path(r"C:\Program Files\Google\Chrome\Application\chrome.exe"),
    Path(r"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe"),
    Path(r"C:\Program Files\Microsoft\Edge\Application\msedge.exe"),
    Path(r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"),
]


def e(valor) -> str:
    return html.escape(str(valor if valor is not None else ""))


def assert_sin_estadisticas_internas(texto: str) -> None:
    bajo = texto.lower()
    for palabra in PROHIBIDAS:
        if palabra in bajo:
            raise ValueError(f"El dossier no puede mostrar estadisticas internas: '{palabra}'.")


def stats_winners(path: Path = WINNERS_PATH) -> dict:
    if not path.exists():
        return {"total": 0, "year_min": None, "year_max": None, "retos": 0}
    filas = [json.loads(l) for l in path.read_text(encoding="utf-8").splitlines() if l.strip()]
    years = [f.get("year") for f in filas if f.get("year")]
    return {
        "total": len(filas),
        "year_min": min(years) if years else None,
        "year_max": max(years) if years else None,
        "retos": len({f.get("challenge_name") for f in filas if f.get("challenge_name")}),
    }


def _tabla_precedentes(ruta: dict) -> str:
    filas = []
    for p in ruta.get("precedentes", []):
        filas.append((p.get("year"), p.get("equipo"), p.get("proyecto"), p.get("puesto"), p.get("video_url")))
    for p in ruta.get("precedentes_sirli", []):
        filas.append((p.get("year"), p.get("equipo"), p.get("reto"), p.get("puesto"), p.get("video_url")))
    if not filas:
        return ""
    filas_unicas = []
    vistos = set()
    for f in filas:
        clave = (f[0], f[1], f[2])
        if clave in vistos:
            continue
        vistos.add(clave)
        filas_unicas.append(f)
    cuerpo = []
    for year, equipo, proyecto, puesto, url in filas_unicas:
        enlace = f'<a href="{e(url)}">video</a>' if url else ""
        cuerpo.append(
            f"<tr><td>{e(year)}</td><td>{e(equipo)}</td><td>{e(proyecto)}</td>"
            f"<td>{e(puesto)}</td><td>{enlace}</td></tr>"
        )
    return (
        '<div class="label">Precedente ganador</div>'
        "<table><thead><tr><th>Año</th><th>Equipo</th><th>Proyecto / reto</th><th>Puesto</th><th>Video</th></tr></thead>"
        f"<tbody>{''.join(cuerpo)}</tbody></table>"
    )


def _bloque_impacto(ruta: dict) -> str:
    items = ruta.get("impacto", [])
    if not items:
        return (
            '<div class="impact"><div class="label">Impacto para vender la idea</div>'
            '<span class="pendiente">Por validar con el equipo: no hay cifra con fuente en el corpus.</span></div>'
        )
    filas = "".join(
        f"<div><strong>{e(i.get('dato'))}</strong><div class=\"source\">Fuente: {e(i.get('fuente'))}</div></div>"
        for i in items
    )
    return f'<div class="impact"><div class="label">Impacto para vender la idea</div>{filas}</div>'


def _bloque_grafo(ruta: dict) -> str:
    items = ruta.get("evidencia_grafo", [])
    if not items:
        return ""
    filas = "".join(
        f"<li>{e(i.get('dato'))} <span class=\"source\">({e(i.get('fuente'))})</span></li>" for i in items
    )
    return f'<div class="label" style="margin-top:2mm">Evidencia del cerebro</div><ul>{filas}</ul>'


def _cadena(ruta: dict) -> str:
    c = ruta.get("cadena_razonamiento", {})
    pasos = [
        ("Problema", c.get("problema")),
        ("Causa raíz", c.get("causa_raiz")),
        ("Insight", c.get("insight")),
        ("Solución", c.get("solucion")),
        ("Métrica", c.get("metrica")),
    ]
    return '<div class="chain">' + "".join(
        f"<div><b>{e(nombre)}</b>{e(valor)}</div>" for nombre, valor in pasos
    ) + "</div>"


def _card(ruta: dict) -> str:
    etiqueta = ruta.get("etiqueta", "exploratoria")
    chips = "".join(f'<span class="chip">{e(r)}</span>' for r in ruta.get("recursos", []))
    rubrica = ruta.get("rubrica", [])
    linea_rubrica = " · ".join(f"{e(c.get('criterio'))} ({e(c.get('puntos'))} pts)" for c in rubrica)
    precedentes = _tabla_precedentes(ruta)
    aviso = ""
    if etiqueta == "exploratoria":
        aviso = (
            '<div class="risk">Sin precedente directo en el corpus: presentar como hipótesis, '
            "no como solución validada.</div>"
        )
    return f"""
    <div class="card">
      <span class="tag {e(etiqueta)}">{e(etiqueta)}</span>
      <h3>{e(ruta.get('titulo'))}</h3>
      <p>{e(ruta.get('concepto'))}</p>
      <div class="label">Por qué aplica a este reto</div>
      <p>{e(ruta.get('por_que_aplica'))}</p>
      {_cadena(ruta)}
      {precedentes}
      {_bloque_impacto(ruta)}
      <div class="label">Recursos y componentes</div>
      <div class="chips">{chips or '<span class="chip">Definir BOM en budget/bom.csv</span>'}</div>
      <div class="rubric"><strong>Alineación con la rúbrica:</strong> {linea_rubrica}</div>
      <div class="risk">{e(ruta.get('riesgo'))}</div>
      {aviso}
      <div class="pitch">{e(ruta.get('pitch'))}</div>
      {_bloque_grafo(ruta)}
    </div>
    """


def _bloque_reto(bloque: dict) -> str:
    reto = bloque.get("reto", {})
    ods = ", ".join(reto.get("ods_ids", [])) or "Sin ODS declarados"
    cards = "".join(_card(r) for r in bloque.get("soluciones", []))
    return f"""
    <section class="reto">
      <div class="reto-head">
        <div class="id">RETO {e(reto.get('id'))}</div>
        <h2>{e(reto.get('title'))}</h2>
        <div class="badges">
          <span class="badge cat">{e(bloque.get('categoria'))}</span>
          <span class="badge">{e(ods)}</span>
          <span class="badge">{e(bloque.get('justificacion_categoria'))}</span>
        </div>
      </div>
      <p class="desc">{e(reto.get('description'))}</p>
      {cards}
    </section>
    """


def render_html(payload: dict, css: str | None = None, stats: dict | None = None) -> str:
    stats = stats or {}
    certamen = payload.get("certamen", "")
    equipo = payload.get("equipo") or "Equipo de innovación"
    ciudad = payload.get("ciudad") or ""
    css = css if css is not None else (CSS_PATH.read_text(encoding="utf-8") if CSS_PATH.exists() else "")

    base = ""
    if stats.get("total"):
        base = (
            f"Base analizada: <strong>{stats['total']:,} proyectos ganadores</strong> "
            f"({stats.get('year_min')}–{stats.get('year_max')}), "
            f"{stats.get('retos', 0)} retos distintos del Rally. "
            "Cada solución cita el caso que la sostiene y su fuente."
        ).replace(",", ".")
    else:
        base = "Cada solución cita el caso que la sostiene y su fuente."

    secciones = "".join(_bloque_reto(b) for b in payload.get("retos", []))
    titulo = f"Dossier de soluciones · Rally {certamen.capitalize()}"
    doc = f"""<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<title>{e(titulo)}</title>
<style>{css}</style>
</head>
<body>
  <section class="cover">
    <div class="kicker">Rally Studio · Motor de soluciones</div>
    <h1>Soluciones para los retos<br>del Rally {e(certamen.capitalize())}</h1>
    <div class="rule"></div>
    <p class="sub">Rutas aplicables, construidas sobre casos ganadores reales y con la evidencia citada.</p>
    <div class="meta">
      Equipo: <strong>{e(equipo)}</strong>{f" · {e(ciudad)}" if ciudad else ""}<br>
      Fecha: {date.today().isoformat()}<br>
      Retos analizados: {len(payload.get('retos', []))}
    </div>
    <div class="method">{base}</div>
  </section>
  {secciones}
  <div class="footer">Rally Studio · Dossier de soluciones · Las cifras sin fuente se marcan como pendientes de validar.</div>
</body>
</html>"""
    assert_sin_estadisticas_internas(doc)
    return doc


def find_chrome() -> Path:
    for candidato in CHROME_CANDIDATES:
        if candidato.exists():
            return candidato
    encontrado = shutil.which("chrome") or shutil.which("msedge")
    if encontrado:
        return Path(encontrado)
    raise SystemExit("No se encontro Chrome ni Edge para imprimir el PDF.")


def html_to_pdf(html_path: Path, pdf_path: Path) -> Path:
    chrome = find_chrome()
    pdf_path = pdf_path.resolve()
    pdf_path.parent.mkdir(parents=True, exist_ok=True)
    cmd = [
        str(chrome),
        "--headless=new",
        "--disable-gpu",
        "--no-pdf-header-footer",
        "--run-all-compositor-stages-before-draw",
        "--virtual-time-budget=4000",
        f"--print-to-pdf={pdf_path}",
        html_path.resolve().as_uri(),
    ]
    result = subprocess.run(cmd, capture_output=True, text=True, timeout=120)
    if not pdf_path.exists() or pdf_path.stat().st_size < 1000:
        detalle = (result.stderr or result.stdout or "").strip()[-500:]
        raise SystemExit(f"Chrome no genero el PDF. {detalle}")
    return pdf_path


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Genera el dossier PDF de soluciones.")
    parser.add_argument("--json", required=True, help="salida JSON del motor de soluciones")
    parser.add_argument("--out", help="ruta del PDF de salida")
    parser.add_argument("--html", help="guarda tambien el HTML intermedio")
    args = parser.parse_args(argv)

    payload = json.loads(Path(args.json).read_text(encoding="utf-8"))
    doc = render_html(payload, stats=stats_winners())
    certamen = payload.get("certamen", "rally")
    pdf = Path(args.out) if args.out else ROOT / "docs" / f"Dossier_Soluciones_{certamen}.pdf"

    build = Path(tempfile.mkdtemp(prefix="rally_soluciones_"))
    html_path = build / "dossier.html"
    html_path.write_text(doc, encoding="utf-8")
    if args.html:
        Path(args.html).write_text(doc, encoding="utf-8")
    html_to_pdf(html_path, pdf)
    print(f"OK: {pdf} ({pdf.stat().st_size // 1024} KB)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
