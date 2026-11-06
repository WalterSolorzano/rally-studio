# -*- coding: utf-8 -*-
"""Genera el dossier de soluciones en PDF, Word y Excel a partir de un JSON.

El contenido vive en el JSON (lo produce `soluciones_motor.py` o lo escribe el
equipo a mano). Este archivo solo maqueta: no trae retos, ni textos, ni nombres
de soluciones adentro. Editar el contenido es editar el JSON.

    python scripts/gen_dossier.py --json research/soluciones_actuales.json \
        --pdf docs/Dossier_Soluciones.pdf --docx docs/Dossier_Soluciones.docx \
        --xlsx docs/Dossier_Soluciones.xlsx

Esquema mínimo por reto: id, titulo, categoria, categoria_porque, descripcion,
propuesta y alterna (nombre, claim, que_es, como[4], beneficiario, componentes[],
costo, metricas[]), realidad {a, b}, detalles [3 pares], insignias [2-3 pares],
ods [("ODS N", nombre, justificacion)], cadena {problema, causa_raiz, insight,
solucion, metrica}, senal, analogias [{year, equipo, proyecto, puesto,
que_hicieron, por_que, video}], pitch.
"""
from __future__ import annotations

import argparse
import html
import json
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / "docs" / "assets"
FUENTES = ASSETS / "fuentes"
ODS_DIR = FUENTES / "ods"
CSS_PATH = ASSETS / "dossier.css"

CHROME_CANDIDATOS = [
    Path(r"C:\Program Files\Google\Chrome\Application\chrome.exe"),
    Path(r"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe"),
    Path(r"C:\Program Files\Microsoft\Edge\Application\msedge.exe"),
]
CHROME = next((c for c in CHROME_CANDIDATOS if c.exists()), CHROME_CANDIDATOS[0])

META: dict = {}
RETOS: list = []
PDF = HTML = DOCX = XLSX = Path("dossier.pdf")


NAVY = "0D1B35"
COBALT = "0866F5"
CYAN = "0284C7"
INK = "13213A"
BODY = "334155"
MUTED = "5C7193"
LINE = "DCE7F5"
PAPER = "F8FAFD"

CSS = ""


ODS_COLOR = {
    "1": "#E5243B", "2": "#DDA63A", "3": "#4C9F38", "4": "#C5192D", "5": "#FF3A21",
    "6": "#26BDE2", "7": "#FCC30B", "8": "#A21942", "9": "#FD6925", "10": "#DD1367",
    "11": "#FD9D24", "12": "#BF8B2E", "13": "#3F7E44", "14": "#0A97D9", "15": "#56C02B",
    "16": "#00689D", "17": "#19486A",
}


def e(texto) -> str:
    return html.escape(str(texto), quote=False)


def html_solucion(etiqueta: str, prop: dict, real: str = "", compacto: bool = False) -> str:
    pasos = "".join(f"<li>{e(p)}</li>" for p in prop["como"])
    tabla = (
        f'<table class="datos{" compact" if compacto else ""}">'
        f'<tr><td class="k">Beneficiario</td><td>{e(prop["beneficiario"])}</td></tr>'
        f'<tr><td class="k">Componentes</td><td>{e(", ".join(prop["componentes"]))}</td></tr>'
        f'<tr><td class="k">Costo estimado</td><td>{e(prop["costo"])}</td></tr>'
        f"</table>"
    )
    return (
        f'<div class="sol{" b" if compacto else ""}">'
        f'<div class="sol-head">'
        f'<div class="sol-tag">{etiqueta}</div>'
        f'<div class="prop"><div class="name">{e(prop["nombre"])}</div>'
        f'<div class="claim">{e(prop["claim"])}</div>'
        f'<p class="what">{e(prop["que_es"])}</p></div>'
        f'</div>'
        f'<div class="sub">Cómo funciona</div><ol class="pasos">{pasos}</ol>'
        f'<div class="sub">Datos de la solución</div>{tabla}'
        + (f'<p class="real"><span class="k">En la práctica</span> {e(real)}</p>' if real else "")
        + f"</div>"
    )


def html_metricas(titulo: str, lista: list[str]) -> str:
    items = "".join(f"<li>{e(m)}</li>" for m in lista)
    return f'<div class="mgroup"><div class="sub">{e(titulo)}</div><ol class="pasos">{items}</ol></div>'


def clase_insignia(nombre: str, tag: str) -> str:
    """Color por tipo de insignia: premio, fondo/convocatoria o marco/estándar."""
    s = f"{nombre} {tag}".lower()
    if any(k in s for k in ("premio", "ganador", "podio", "1er lugar", "primer lugar")):
        return "insignia--premio"
    if any(k in s for k in ("fondo", "grant", "convocatoria", "subsidio", "beca")):
        return "insignia--fondo"
    if any(k in s for k in ("marco", "unesco", "pacto", "sendai", "red de",
                            "naciones unidas", "onu", "pnud", "pnuma")):
        return "insignia--marco"
    return ""


def html_retos() -> str:
    partes: list[str] = []
    for i, r in enumerate(RETOS, 1):
        ods = "".join(
            f'<div class="ods-item">'
            f'<img class="ods-logo" src="fuentes/ods/ods{c.split()[-1]}.jpg" alt="{e(c)}">'
            f'<div><div class="ods-name">{e(n)}</div>'
            f'<div class="ods-why">{e(j)}</div></div></div>'
            for c, n, j in r["ods"]
        )
        detalles = "".join(
            f'<div class="detalle"><div class="k">{e(k)}</div><p>{e(t)}</p></div>'
            for k, t in r["detalles"]
        )
        insignias = "".join(
            f'<span class="insignia {clase_insignia(n, t)}">'
            f'<span class="n">{e(n)}</span><span class="t">{e(t)}</span></span>'
            for n, t in r["insignias"]
        )
        analogias = "".join(
            f'<div class="analogia">'
            f'<div class="top"><div class="id">{a["year"]} · {e(a["equipo"])}</div>'
            f'<div class="puesto">{e(a["puesto"])}</div></div>'
            f'<div class="proy">{e(a["proyecto"])}</div>'
            f'<p class="txt"><span class="lbl-in">Qué hicieron · </span>{e(a["que_hicieron"])}</p>'
            f'<p class="txt"><span class="lbl-in">Por qué se parece · </span>{e(a["por_que"])}</p>'
            + (f'<div class="link"><span>Video · </span>{e(a["video"])}</div>' if a["video"] else "") +
            f'</div>'
            for a in r["analogias"]
        )
        metricas = html_metricas(f"Opción 01 · {r['propuesta']['nombre']}", r["propuesta"]["metricas"])
        metricas += html_metricas(f"Opción 02 · {r['alterna']['nombre']}", r["alterna"]["metricas"])
        partes.append(
            f'<section class="reto">'
            f'<div class="intro">'
            f'<div class="cabeza">'
            f'<div class="num">{r["id"]}</div>'
            f'<div class="hdr">'
            f'<h2>{e(r["titulo"])}</h2>'
            f'<div class="cat">{e(r["categoria"])} · {r["id"]}/09</div>'
            f'</div>'
            f'</div>'
            f'<p class="desc">{e(r["descripcion"])}</p>'
            f'<div class="ods"><h3 style="margin-top:0">ODS elegidos y por qué</h3><div class="ods-grid">{ods}</div>'
            f'<div class="insignias"><span class="lbl">Insignias que aplican</span>{insignias}</div></div>'
            f'</div>'
            f'<h3>Dos soluciones posibles para este reto</h3>'
            f'{html_solucion("Opción 01", r["propuesta"], r["realidad"]["a"])}'
            f'{html_solucion("Reto " + r["id"] + " · Opción 02", r["alterna"], r["realidad"]["b"], compacto=True)}'
            f'<h3>Detalles que suman</h3><div class="detalles">{detalles}</div>'
            f'<h3>Cadena de razonamiento</h3>'
            f'<table class="cadena">'
            f'<tr><td class="k">Problema</td><td>{e(r["cadena"]["problema"])}</td></tr>'
            f'<tr><td class="k">Causa raíz</td><td>{e(r["cadena"]["causa_raiz"])}</td></tr>'
            f'<tr><td class="k">Insight</td><td>{e(r["cadena"]["insight"])}</td></tr>'
            f'<tr><td class="k">Solución</td><td>{e(r["cadena"]["solucion"])}</td></tr>'
            f'<tr><td class="k">Métrica</td><td class="metric">{e(r["cadena"]["metrica"])}</td></tr>'
            f'</table>'
            f'<h3>Métricas para demostrar en el prototipo</h3>{metricas}'
            f'<h3>Señal que se repite en los ganadores</h3>'
            f'<div class="senal">{e(r["senal"])}</div>'
            f'<h3>Precedentes por tipo de solución</h3>{analogias}'
            f'<div class="pitch"><div class="t">Pitch de 60 segundos · Opción 01</div><p>{e(r["pitch"])}</p></div>'
            f'<div class="comentarios">'
            f'<div class="t">Comentarios · Reto {r["id"]}</div>'
            f'<div class="h">Anoten aquí sus ideas, dudas y ajustes a las propuestas.</div>'
            f'{"".join("<div class=\'linea\'></div>" for _ in range(10))}'
            f'</div>'
            f'</section>'
        )
    return "".join(partes)


def construir_html() -> str:
    """Arma el HTML y resuelve las rutas de fuentes y sellos ODS a file://."""
    uri = FUENTES.resolve().as_uri() + "/"
    hoja = CSS_PATH.read_text(encoding="utf-8").replace("fuentes/", uri)
    cuerpo = html_retos().replace("fuentes/", uri)
    return (
        '<!DOCTYPE html><html lang="es"><head><meta charset="utf-8">'
        f'<title>{e(META.get("titulo", "Dossier de soluciones"))}</title>'
        f"<style>{hoja}</style></head><body>\n\n{cuerpo}\n\n</body></html>"
    )


def build_pdf() -> None:
    HTML.write_text(construir_html(), encoding="utf-8")
    cmd = [
        str(CHROME),
        "--headless=new",
        "--disable-gpu",
        "--no-pdf-header-footer",
        "--allow-file-access-from-files",
        "--run-all-compositor-stages-before-draw",
        "--virtual-time-budget=6000",
        f"--print-to-pdf={PDF.resolve()}",
        HTML.resolve().as_uri(),
    ]
    subprocess.run(cmd, check=True, capture_output=True)
    print(f"PDF  : {PDF} ({PDF.stat().st_size // 1024} KB)")


# ---------------------------------------------------------------- DOCX
def build_docx() -> None:
    from docx import Document
    from docx.enum.table import WD_TABLE_ALIGNMENT
    from docx.enum.text import WD_ALIGN_PARAGRAPH
    from docx.oxml import OxmlElement
    from docx.oxml.ns import qn
    from docx.shared import Cm, Pt, RGBColor

    azul = RGBColor(0x0D, 0x1B, 0x35)
    cobalt = RGBColor(0x08, 0x66, 0xF5)
    cyan = RGBColor(0x0D, 0x1B, 0x35)
    gris = RGBColor(0x33, 0x41, 0x55)
    suave = RGBColor(0x5C, 0x71, 0x93)

    doc = Document()
    s = doc.sections[0]
    s.page_width, s.page_height = Cm(21), Cm(29.7)
    s.left_margin = s.right_margin = Cm(2.0)
    s.top_margin = Cm(1.8)
    s.bottom_margin = Cm(1.8)
    normal = doc.styles["Normal"]
    normal.font.name = "Segoe UI"
    normal.font.size = Pt(10)
    normal.paragraph_format.space_after = Pt(4)

    def p(texto="", size=10, bold=False, italic=False, color=gris, before=0, after=4, align=None):
        par = doc.add_paragraph()
        par.paragraph_format.space_before = Pt(before)
        par.paragraph_format.space_after = Pt(after)
        if align is not None:
            par.alignment = align
        run = par.add_run(str(texto))
        run.bold = bold
        run.italic = italic
        run.font.size = Pt(size)
        run.font.color.rgb = color
        return par

    def rotulo(texto):
        return p(texto.upper(), size=8, bold=True, color=azul, before=10, after=2)

    def sombrear(celda, hex_color):
        shd = OxmlElement("w:shd")
        shd.set(qn("w:val"), "clear")
        shd.set(qn("w:color"), "auto")
        shd.set(qn("w:fill"), hex_color)
        celda._tc.get_or_add_tcPr().append(shd)

    def borde_inferior(par):
        pPr = par._p.get_or_add_pPr()
        bordes = OxmlElement("w:pBdr")
        linea = OxmlElement("w:bottom")
        linea.set(qn("w:val"), "single")
        linea.set(qn("w:sz"), "4")
        linea.set(qn("w:space"), "6")
        linea.set(qn("w:color"), "DCE7F5")
        bordes.append(linea)
        pPr.append(bordes)

    def tabla_dos(filas, ancho_k=4.6):
        t = doc.add_table(rows=len(filas), cols=2)
        t.alignment = WD_TABLE_ALIGNMENT.CENTER
        for i, (k, v) in enumerate(filas):
            c0, c1 = t.rows[i].cells
            c0.width = Cm(ancho_k)
            c1.width = Cm(14.6)
            c0.text = ""
            r0 = c0.paragraphs[0].add_run(k.upper())
            r0.bold = True
            r0.font.size = Pt(7.5)
            r0.font.color.rgb = azul
            c1.text = ""
            r1 = c1.paragraphs[0].add_run(str(v))
            r1.font.size = Pt(9.5)
        return t

    # Inicio directo: sin portada ni índice
    for r in RETOS:
        p(r["id"], 56, True, color=cobalt, after=0)
        p(r["titulo"], 21, True, color=azul, after=4)
        par = doc.add_paragraph()
        par.paragraph_format.space_after = Pt(8)
        chip = par.add_run(f" {r['categoria'].upper()} · RETO {r['id']}/09 ")
        chip.bold = True
        chip.font.name = "Consolas"
        chip.font.size = Pt(7.5)
        chip.font.color.rgb = RGBColor(0xFF, 0xFF, 0xFF)
        sombrear_run = OxmlElement("w:shd")
        sombrear_run.set(qn("w:val"), "clear")
        sombrear_run.set(qn("w:fill"), "0D1B35")
        par._p.get_or_add_pPr().append(sombrear_run)
        p(r["descripcion"], 10, color=gris, after=4)

        rotulo("ODS elegidos y por qué")
        for c, n, j in r["ods"]:
            t = doc.add_table(rows=1, cols=2)
            t.alignment = WD_TABLE_ALIGNMENT.CENTER
            c0, c1 = t.rows[0].cells
            c0.width = Cm(1.6)
            c1.width = Cm(15.4)
            c0.text = ""
            par0 = c0.paragraphs[0]
            par0.alignment = WD_ALIGN_PARAGRAPH.CENTER
            num = c.split()[-1]
            par0.add_run().add_picture(str(ODS_DIR / f"ods{num}.jpg"), width=Cm(1.15))
            c1.text = ""
            rn = c1.paragraphs[0].add_run(f"{n}. ")
            rn.bold = True
            rn.font.size = Pt(9)
            rj = c1.paragraphs[0].add_run(j)
            rj.font.size = Pt(9)
            doc.add_paragraph().paragraph_format.space_after = Pt(0)

        par = doc.add_paragraph()
        par.paragraph_format.space_after = Pt(6)
        rl = par.add_run("INSIGNIAS QUE APLICAN: ")
        rl.bold = True
        rl.font.name = "Consolas"
        rl.font.size = Pt(7.5)
        rl.font.color.rgb = azul
        ri = par.add_run(" · ".join(f"{n} ({t})" for n, t in r["insignias"]))
        ri.font.size = Pt(9)

        def solucion(prop, etiqueta, real, grande=True):
            p(etiqueta.upper(), 7.5, True, color=cobalt, after=1)
            p(prop["nombre"], 19, True, color=azul, after=2)
            p(prop["claim"], 11, True, color=azul, after=4)
            p(prop["que_es"], 10, color=gris, after=4)
            p("CÓMO FUNCIONA", 7.5, True, color=azul, before=2, after=2)
            for i, paso in enumerate(prop["como"], 1):
                par = doc.add_paragraph()
                par.paragraph_format.left_indent = Cm(0.9)
                par.paragraph_format.space_after = Pt(2)
                rn = par.add_run(f"0{i}  ")
                rn.font.name = "Consolas"
                rn.font.size = Pt(8)
                rn.bold = True
                rn.font.color.rgb = cobalt
                rp = par.add_run(paso)
                rp.font.size = Pt(9.5)
            p("DATOS DE LA SOLUCIÓN", 7.5, True, color=azul, before=2, after=2)
            tabla_dos([
                ("Beneficiario", prop["beneficiario"]),
                ("Componentes", ", ".join(prop["componentes"])),
                ("Costo estimado", prop["costo"]),
            ])
            par = doc.add_paragraph()
            par.paragraph_format.left_indent = Cm(0.3)
            par.paragraph_format.space_before = Pt(4)
            par.paragraph_format.space_after = Pt(4)
            rk = par.add_run("EN LA PRÁCTICA  ")
            rk.font.name = "Consolas"
            rk.font.size = Pt(7)
            rk.bold = True
            rk.font.color.rgb = azul
            rt = par.add_run(real)
            rt.font.size = Pt(9.5)
            rt.font.color.rgb = gris

        rotulo("Dos soluciones posibles para este reto")
        solucion(r["propuesta"], "Opción 01", r["realidad"]["a"])
        solucion(r["alterna"], "Opción 02", r["realidad"]["b"], grande=False)

        rotulo("Detalles que suman")
        for k, t in r["detalles"]:
            par = doc.add_paragraph(style="List Bullet")
            par.paragraph_format.space_after = Pt(2)
            rk = par.add_run(f"{k}: ")
            rk.bold = True
            rk.font.size = Pt(9.5)
            rk.font.color.rgb = azul
            rt = par.add_run(t)
            rt.font.size = Pt(9.5)

        rotulo("Cadena de razonamiento")
        tabla_dos([
            ("Problema", r["cadena"]["problema"]),
            ("Causa raíz", r["cadena"]["causa_raiz"]),
            ("Insight", r["cadena"]["insight"]),
            ("Solución", r["cadena"]["solucion"]),
            ("Métrica", r["cadena"]["metrica"]),
        ])

        rotulo("Métricas para demostrar en el prototipo")
        for etiqueta, prop in [("Opción 01", r["propuesta"]), ("Opción 02", r["alterna"])]:
            p(f"{etiqueta} · {prop['nombre']}", 8, True, color=azul, before=4, after=2)
            for m in prop["metricas"]:
                par = doc.add_paragraph(style="List Bullet")
                par.paragraph_format.space_after = Pt(1)
                run = par.add_run(m)
                run.font.size = Pt(9.5)

        rotulo("Señal que se repite en los ganadores")
        par = doc.add_paragraph()
        par.paragraph_format.left_indent = Cm(0.4)
        par.paragraph_format.space_after = Pt(6)
        run = par.add_run(r["senal"])
        run.italic = True
        run.bold = True
        run.font.size = Pt(10)
        run.font.color.rgb = azul

        rotulo("Precedentes por tipo de solución, no por nombre del reto")
        for a in r["analogias"]:
            p(f"{a['year']} · {a['equipo']} · {a['puesto']}", 8.5, True, color=cyan, before=6, after=1)
            p(a["proyecto"], 11, True, color=azul, after=2)
            p("Qué hicieron", 7.5, True, color=suave, after=1)
            p(a["que_hicieron"], 9.5, color=gris, after=3)
            p("Por qué se parece a este reto", 7.5, True, color=suave, after=1)
            p(a["por_que"], 9.5, color=gris, after=2)
            p(f"Video: {a['video']}", 7.5, color=cyan, after=2) if a["video"] else None

        rotulo(f"Comentarios · Reto {r['id']}")
        p("Anoten aquí sus ideas, dudas y ajustes a la propuesta.", 8, italic=True, color=suave, after=3)
        for _ in range(10):
            par = doc.add_paragraph()
            par.paragraph_format.space_before = Pt(10)
            par.paragraph_format.space_after = Pt(10)
            borde_inferior(par)

        if r is not RETOS[-1]:
            doc.add_page_break()

    doc.save(DOCX)
    print(f"DOCX : {DOCX} ({DOCX.stat().st_size // 1024} KB)")


# ---------------------------------------------------------------- XLSX
def build_xlsx() -> None:
    from openpyxl import Workbook
    from openpyxl.drawing.image import Image as XLImage
    from openpyxl.styles import Alignment, Border, Font, PatternFill, Side
    from openpyxl.utils import get_column_letter

    wb = Workbook()
    ws = wb.active
    ws.title = "Panel"

    navy = PatternFill("solid", fgColor=NAVY)
    cobalt_fill = PatternFill("solid", fgColor=COBALT)
    soft = PatternFill("solid", fgColor="F1F5F9")
    idea_fill = PatternFill("solid", fgColor="FAFCFF")
    blanco = Font(color="FFFFFF", bold=True, size=10)
    titulo_font = Font(color="FFFFFF", bold=True, size=18)
    sub_font = Font(color="0D1B35", bold=True, size=11)
    key_font = Font(color="5C7193", bold=True, size=8)
    cuerpo = Font(color="13213A", size=10)
    link_font = Font(color="0284C7", size=9)
    thin = Side(style="thin", color=LINE)
    borde = Border(left=thin, right=thin, top=thin, bottom=thin)
    wrap = Alignment(wrap_text=True, vertical="top")

    def cabecera(hoja, fila, texto, ancho=4):
        hoja.merge_cells(start_row=fila, start_column=1, end_row=fila, end_column=ancho)
        c = hoja.cell(row=fila, column=1, value=texto)
        c.fill = navy
        c.font = blanco
        c.alignment = Alignment(vertical="center")
        hoja.row_dimensions[fila].height = 30

    def seccion(hoja, fila, texto):
        hoja.merge_cells(start_row=fila, start_column=1, end_row=fila, end_column=4)
        c = hoja.cell(row=fila, column=1, value=texto.upper())
        c.fill = soft
        c.font = key_font
        c.alignment = Alignment(vertical="center")
        hoja.row_dimensions[fila].height = 21
        return fila + 1

    def par(hoja, fila, clave, valor):
        a = hoja.cell(row=fila, column=1, value=clave)
        a.font = key_font
        a.alignment = wrap
        hoja.merge_cells(start_row=fila, start_column=2, end_row=fila, end_column=4)
        b = hoja.cell(row=fila, column=2, value=valor)
        b.font = cuerpo
        b.alignment = wrap
        return fila + 1

    # Panel
    cabecera(ws, 1, "RALLY STUDIO // PANEL DE SOLUCIONES", 9)
    ws.merge_cells("A2:I2")
    ws["A2"] = META["subtitulo"]
    ws["A2"].font = Font(color="334155", size=10)
    ws["A2"].alignment = wrap
    ws.row_dimensions[2].height = 34
    ws.merge_cells("A3:I3")
    ws["A3"] = f"{META['certamen']} · {META['equipo']} · {META['fecha']}"
    ws["A3"].font = Font(color="5C7193", size=9)

    encabezados = ["Reto", "Propuesta 01", "Propuesta 02", "Categoría", "ODS", "Beneficiario", "Métrica clave", "Precedente 1", "Video del precedente"]
    for j, h in enumerate(encabezados, 1):
        c = ws.cell(row=5, column=j, value=h)
        c.fill = navy
        c.font = blanco
        c.alignment = Alignment(wrap_text=True, vertical="center")
        c.border = borde
    ws.row_dimensions[5].height = 28

    for i, r in enumerate(RETOS, 6):
        valores = [
            f"{r['id']} · {r['titulo']}",
            r["propuesta"]["nombre"],
            r["alterna"]["nombre"],
            r["categoria"],
            " · ".join(c for c, _, _ in r["ods"]),
            r["propuesta"]["beneficiario"],
            r["cadena"]["metrica"],
            f"{r['analogias'][0]['year']} · {r['analogias'][0]['equipo']}",
        ]
        for j, v in enumerate(valores, 1):
            c = ws.cell(row=i, column=j, value=v)
            c.alignment = wrap
            c.font = cuerpo if j != 2 else sub_font
            c.border = borde
            if i % 2 == 0:
                c.fill = PatternFill("solid", fgColor="FBFDFF")
        link = ws.cell(row=i, column=9, value="Ver video" if r["analogias"][0]["video"] else "Sin video")
        if r["analogias"][0]["video"]:
            link.hyperlink = r["analogias"][0]["video"]
        link.font = link_font
        link.border = borde
        ws.row_dimensions[i].height = 46

    anchos = [30, 18, 18, 13, 14, 44, 34, 25, 14]
    for j, a in enumerate(anchos, 1):
        ws.column_dimensions[get_column_letter(j)].width = a
    ws.freeze_panes = "A6"

    # Hojas por reto
    for r in RETOS:
        corto = f"{r['id']} {r['propuesta']['nombre']}"[:28]
        h = wb.create_sheet(corto)
        h.sheet_view.showGridLines = False
        h.column_dimensions["A"].width = 26
        h.column_dimensions["B"].width = 52
        h.column_dimensions["C"].width = 30
        h.column_dimensions["D"].width = 24

        cabecera(h, 1, f"RETO {r['id']} · {r['titulo'].upper()}", 4)
        h.merge_cells("A2:D2")
        h["A2"] = f"{r['categoria']} · {r['categoria_porque']}"
        h["A2"].font = Font(color="5C7193", size=9, italic=True)
        h["A2"].alignment = wrap
        h.row_dimensions[2].height = 30

        f = 4
        f = seccion(h, f, "Descripción del reto")
        h.merge_cells(start_row=f, start_column=1, end_row=f, end_column=4)
        c = h.cell(row=f, column=1, value=r["descripcion"])
        c.font = cuerpo
        c.alignment = wrap
        h.row_dimensions[f].height = 48
        f += 2

        f = seccion(h, f, "Propuesta de solución")
        f = par(h, f, "Nombre", r["propuesta"]["nombre"])
        f = par(h, f, "Claim", r["propuesta"]["claim"])
        f = par(h, f, "Qué es", r["propuesta"]["que_es"])
        f = par(h, f, "Beneficiario", r["propuesta"]["beneficiario"])
        f = par(h, f, "Componentes", ", ".join(r["propuesta"]["componentes"]))
        f = par(h, f, "Costo estimado", r["propuesta"]["costo"])
        h.cell(row=f - 6, column=2).font = Font(color=NAVY, bold=True, size=14)
        f += 1

        f = seccion(h, f, "Cómo funciona")
        for i, paso in enumerate(r["propuesta"]["como"], 1):
            a = h.cell(row=f, column=1, value=f"Paso 0{i}")
            a.font = key_font
            a.alignment = wrap
            h.merge_cells(start_row=f, start_column=2, end_row=f, end_column=4)
            b = h.cell(row=f, column=2, value=paso)
            b.font = cuerpo
            b.alignment = wrap
            h.row_dimensions[f].height = 32
            f += 1
        f += 1

        f = seccion(h, f, "En la práctica · Opción 01")
        h.merge_cells(start_row=f, start_column=1, end_row=f, end_column=4)
        c = h.cell(row=f, column=1, value=r["realidad"]["a"])
        c.font = cuerpo
        c.alignment = wrap
        h.row_dimensions[f].height = 62
        f += 2

        f = seccion(h, f, "Segunda solución posible")
        f = par(h, f, "Nombre", r["alterna"]["nombre"])
        f = par(h, f, "Claim", r["alterna"]["claim"])
        f = par(h, f, "Qué es", r["alterna"]["que_es"])
        f = par(h, f, "Beneficiario", r["alterna"]["beneficiario"])
        f = par(h, f, "Componentes", ", ".join(r["alterna"]["componentes"]))
        f = par(h, f, "Costo estimado", r["alterna"]["costo"])
        h.cell(row=f - 6, column=2).font = Font(color=NAVY, bold=True, size=14)
        f += 1
        f = seccion(h, f, "Cómo funciona la segunda solución")
        for i, paso in enumerate(r["alterna"]["como"], 1):
            a = h.cell(row=f, column=1, value=f"Paso 0{i}")
            a.font = key_font
            a.alignment = wrap
            h.merge_cells(start_row=f, start_column=2, end_row=f, end_column=4)
            b = h.cell(row=f, column=2, value=paso)
            b.font = cuerpo
            b.alignment = wrap
            h.row_dimensions[f].height = 32
            f += 1
        f += 1

        f = seccion(h, f, "En la práctica · Opción 02")
        h.merge_cells(start_row=f, start_column=1, end_row=f, end_column=4)
        c = h.cell(row=f, column=1, value=r["realidad"]["b"])
        c.font = cuerpo
        c.alignment = wrap
        h.row_dimensions[f].height = 62
        f += 2

        f = seccion(h, f, "Detalles que suman")
        for k, t in r["detalles"]:
            a = h.cell(row=f, column=1, value=k)
            a.font = key_font
            a.alignment = wrap
            h.merge_cells(start_row=f, start_column=2, end_row=f, end_column=4)
            b = h.cell(row=f, column=2, value=t)
            b.font = cuerpo
            b.alignment = wrap
            h.row_dimensions[f].height = 34
            f += 1
        f += 1

        f = seccion(h, f, "ODS seleccionados y por qué")
        for cod, nom, why in r["ods"]:
            num = cod.split()[-1]
            a = h.cell(row=f, column=1, value=cod)
            a.font = Font(color=COBALT, bold=True, size=10)
            a.alignment = Alignment(vertical="center")
            b = h.cell(row=f, column=2, value=f"{nom}. {why}")
            h.merge_cells(start_row=f, start_column=2, end_row=f, end_column=4)
            b.font = cuerpo
            b.alignment = wrap
            h.row_dimensions[f].height = 34
            img = XLImage(str(ODS_DIR / f"ods{num}.jpg"))
            img.width = 26
            img.height = 26
            img.anchor = f"A{f}"
            h.add_image(img)
            f += 1
        f += 1

        f = seccion(h, f, "Insignias y programas que aplican")
        for nom, tag in r["insignias"]:
            a = h.cell(row=f, column=1, value=nom)
            a.font = key_font
            a.alignment = wrap
            h.merge_cells(start_row=f, start_column=2, end_row=f, end_column=4)
            b = h.cell(row=f, column=2, value=tag)
            b.font = cuerpo
            b.alignment = wrap
            h.row_dimensions[f].height = 22
            f += 1
        f += 1

        f = seccion(h, f, "Cadena de razonamiento")
        for clave, etiqueta in [("problema", "Problema"), ("causa_raiz", "Causa raíz"), ("insight", "Insight"), ("solucion", "Solución"), ("metrica", "Métrica")]:
            a = h.cell(row=f, column=1, value=etiqueta)
            a.font = key_font
            a.alignment = wrap
            h.merge_cells(start_row=f, start_column=2, end_row=f, end_column=4)
            b = h.cell(row=f, column=2, value=r["cadena"][clave])
            b.font = cuerpo
            b.alignment = wrap
            h.row_dimensions[f].height = 40
            f += 1
        f += 1

        f = seccion(h, f, "Métricas para demostrar en el prototipo")
        for etiqueta, prop in [("01", r["propuesta"]), ("02", r["alterna"])]:
            h.merge_cells(start_row=f, start_column=1, end_row=f, end_column=4)
            c = h.cell(row=f, column=1, value=f"Opción {etiqueta} · {prop['nombre']}")
            c.font = key_font
            f += 1
            for m in prop["metricas"]:
                h.merge_cells(start_row=f, start_column=1, end_row=f, end_column=4)
                c = h.cell(row=f, column=1, value="•  " + m)
                c.font = cuerpo
                c.alignment = wrap
                f += 1
        f += 1

        f = seccion(h, f, "Señal que se repite en los ganadores")
        h.merge_cells(start_row=f, start_column=1, end_row=f, end_column=4)
        c = h.cell(row=f, column=1, value=r["senal"])
        c.font = Font(color=INK, size=10, italic=True, bold=True)
        c.alignment = wrap
        h.row_dimensions[f].height = 38
        f += 2

        f = seccion(h, f, "Precedentes por tipo de solución")
        for a in r["analogias"]:
            h.merge_cells(start_row=f, start_column=1, end_row=f, end_column=4)
            c = h.cell(row=f, column=1, value=f"{a['year']} · {a['equipo']} · {a['proyecto']}")
            c.font = Font(color=CYAN, bold=True, size=10)
            c.alignment = wrap
            f += 1
            h.merge_cells(start_row=f, start_column=1, end_row=f, end_column=4)
            c = h.cell(row=f, column=1, value=f"Qué hicieron: {a['que_hicieron']}")
            c.font = cuerpo
            c.alignment = wrap
            h.row_dimensions[f].height = 32
            f += 1
            h.merge_cells(start_row=f, start_column=1, end_row=f, end_column=4)
            c = h.cell(row=f, column=1, value=f"Por qué se parece: {a['por_que']}")
            c.font = cuerpo
            c.alignment = wrap
            h.row_dimensions[f].height = 38
            f += 1
            h.merge_cells(start_row=f, start_column=1, end_row=f, end_column=4)
            c = h.cell(row=f, column=1, value=f"Video: {a['video']}" if a["video"] else "Sin video de referencia")
            if a["video"]:
                c.hyperlink = a["video"]
            c.font = link_font
            f += 1
        f += 1

        # Ideas
        f = seccion(h, f, "Comentarios e ideas del equipo")
        h.merge_cells(start_row=f, start_column=1, end_row=f, end_column=4)
        c = h.cell(row=f, column=1, value="Escriban una idea por fila. La propuesta de arriba es el punto de partida, no el techo.")
        c.font = Font(color="5C7193", size=9, italic=True)
        c.alignment = wrap
        f += 1
        for j, titulo in enumerate(["Idea / variante", "Responsable", "Cómo se mide", "Fecha"], 1):
            c = h.cell(row=f, column=j, value=titulo.upper())
            c.fill = cobalt_fill
            c.font = blanco
            c.border = borde
            c.alignment = Alignment(vertical="center")
        h.row_dimensions[f].height = 22
        f += 1
        for _ in range(14):
            for j in range(1, 5):
                c = h.cell(row=f, column=j)
                c.border = borde
                c.fill = idea_fill
                c.alignment = wrap
            h.row_dimensions[f].height = 26
            f += 1

    wb.save(XLSX)
    print(f"XLSX : {XLSX} ({XLSX.stat().st_size // 1024} KB)")


def cargar(ruta: Path) -> None:
    global META, RETOS
    datos = json.loads(ruta.read_text(encoding="utf-8"))
    META = datos.get("meta", {})
    RETOS = datos["retos"]
    # que_es: 80-150 palabras (regla de venta — leer una vez y entender de una)
    for reto in RETOS:
        for clave in ("propuesta", "alterna"):
            sol = reto.get(clave)
            if not isinstance(sol, dict) or "que_es" not in sol:
                continue
            n = len((sol.get("que_es") or "").split())
            if n < 80 or n > 150:
                raise ValueError(
                    f"reto {reto.get('id', '?')} {clave}: que_es tiene {n} palabras "
                    f"(rango 80-150). Acortar o alargar antes de maquetar."
                )


def main(argv: list[str] | None = None) -> int:
    p = argparse.ArgumentParser(description="Dossier de soluciones en PDF, DOCX y XLSX.")
    p.add_argument("--json", required=True, help="datos de los retos")
    p.add_argument("--pdf")
    p.add_argument("--docx")
    p.add_argument("--xlsx")
    p.add_argument("--html-only", action="store_true", help="solo escribe el HTML")
    args = p.parse_args(argv)

    global PDF, HTML, DOCX, XLSX
    cargar(Path(args.json))
    if not RETOS:
        print("el JSON no tiene retos")
        return 1

    base = Path(args.pdf or args.docx or args.xlsx or "dossier.pdf")
    PDF = Path(args.pdf) if args.pdf else base.with_suffix(".pdf")
    DOCX = Path(args.docx) if args.docx else base.with_suffix(".docx")
    XLSX = Path(args.xlsx) if args.xlsx else base.with_suffix(".xlsx")
    HTML = PDF.with_suffix(".html")
    for destino in (PDF, DOCX, XLSX):
        destino.parent.mkdir(parents=True, exist_ok=True)

    if args.html_only:
        HTML.write_text(construir_html(), encoding="utf-8")
        print(f"HTML : {HTML}")
        return 0

    if args.pdf:
        build_pdf()
    if args.docx or not args.pdf:
        build_docx()
    if args.xlsx or not args.pdf:
        build_xlsx()
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
