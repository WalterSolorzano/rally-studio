#!/usr/bin/env python3
"""Genera el PDF de investigacion de ganadores con la identidad del proyecto.

Fuente de contenido: `brain/corpus/analisis_nicaragua.md` (markdown extraido
del informe de investigacion). Fuente de diseño: `brand/palette.json` y las
tipografias de `docs/assets/fuentes/` (Plus Jakarta Sans + JetBrains Mono).

El PDF anterior venia de una herramienta externa con su propia identidad
(marino calido y dorado). Este generador lo reemplaza: mismo contenido, ahora
con el token del proyecto y regenerable.

Uso:
    python scripts/gen_analisis_pdf.py
    python scripts/gen_analisis_pdf.py --md otra.md --out otro.pdf
"""

from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_JUSTIFY, TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (
    BaseDocTemplate,
    CondPageBreak,
    Flowable,
    Frame,
    KeepTogether,
    NextPageTemplate,
    PageBreak,
    PageTemplate,
    Paragraph,
    Spacer,
)

RAIZ = Path(__file__).resolve().parent.parent
FUENTES = RAIZ / "docs" / "assets" / "fuentes"
MD = RAIZ / "brain" / "corpus" / "analisis_nicaragua.md"
# La raiz es la fuente que `brain/sync_corpus.py` copia al corpus: si se genera
# directo en el corpus, el siguiente sync lo pisa con la version vieja.
SALIDA = RAIZ / "Rally_Innovacion_Nicaragua_Analisis.pdf"

# --- identidad -----------------------------------------------------------------
from comun import paleta as paleta_proyecto

try:
    PALETA = paleta_proyecto()
except SystemExit as exc:  # sin paleta aprobada: `--help` debe poder responder
    PALETA = {}
    _MOTIVO_PALETA = str(exc)
else:
    _MOTIVO_PALETA = ""


def _color(clave: str, respaldo: str):
    valor = PALETA.get(clave) or respaldo
    return colors.HexColor(valor)


PRIMARIO = _color("primary", "#4A5468")
SECUNDARIO = _color("bg_secondary", PALETA.get("bg") or "#EEF2FB")
ACENTO = _color("accent", "#4A5468")
TINTA = _color("text_title", PALETA.get("text_main") or "#4A5468")
TENUE = colors.HexColor("#4A5468")
LINEA = colors.HexColor("#C9D0DB")
VELO = colors.HexColor("#EEF2FB")

# Los mismos colores aprobados, en texto: reportlab los pide dentro del marcado.
HEX_PRIMARIO = str(PALETA.get("primary") or "#4A5468").lstrip("#")
HEX_ACENTO = str(PALETA.get("accent") or "#4A5468").lstrip("#")
HEX_TINTA = str(PALETA.get("text_title") or PALETA.get("text_main") or "#4A5468").lstrip("#")

for archivo, alias in (
    ("PlusJakartaSans-400.ttf", "PJS"),
    ("PlusJakartaSans-600.ttf", "PJS-Semi"),
    ("PlusJakartaSans-700.ttf", "PJS-Bold"),
    ("PlusJakartaSans-800.ttf", "PJS-Black"),
    ("JetBrainsMono-600.ttf", "Mono"),
):
    pdfmetrics.registerFont(TTFont(alias, str(FUENTES / archivo)))
pdfmetrics.registerFontFamily("PJS", normal="PJS", bold="PJS-Bold", italic="PJS", boldItalic="PJS-Bold")

MARGEN_IZQ, MARGEN_DER = 24 * mm, 20 * mm
MARGEN_SUP, MARGEN_INF = 26 * mm, 22 * mm


# --- estilos -------------------------------------------------------------------
def estilos() -> dict[str, ParagraphStyle]:
    return {
        "cuerpo": ParagraphStyle(
            "cuerpo", fontName="PJS", fontSize=10.5, leading=16.2, alignment=TA_JUSTIFY,
            textColor=TINTA, spaceAfter=6,
        ),
        "vineta": ParagraphStyle(
            "vineta", parent=None, fontName="PJS", fontSize=10.3, leading=15.4,
            leftIndent=14, bulletIndent=2, textColor=TINTA, spaceAfter=3, alignment=TA_LEFT,
        ),
        "vineta_num": ParagraphStyle(
            "vineta_num", fontName="PJS", fontSize=10.3, leading=15.6,
            leftIndent=16, textColor=TINTA, spaceAfter=5, alignment=TA_JUSTIFY,
        ),
        "h1": ParagraphStyle(
            "h1", fontName="PJS-Black", fontSize=23, leading=27, textColor=PRIMARIO,
            spaceBefore=4, spaceAfter=10,
        ),
        "h2": ParagraphStyle(
            "h2", fontName="PJS-Bold", fontSize=13.2, leading=17, textColor=TINTA,
            spaceBefore=12, spaceAfter=5, leftIndent=9, borderPadding=(0, 0, 0, 7),
        ),
        "h3": ParagraphStyle(
            "h3", fontName="PJS-Bold", fontSize=11.2, leading=15, textColor=PRIMARIO,
            spaceBefore=9, spaceAfter=3,
        ),
        "ojo": ParagraphStyle(
            "ojo", fontName="Mono", fontSize=7.6, leading=10, textColor=ACENTO,
        ),
    }


class Regla(Flowable):
    """Linea de color bajo un titulo. Ancho fijo, alto minimo."""

    def __init__(self, ancho: float, color=ACENTO, grosor: float = 2.2):
        super().__init__()
        self.ancho, self.color, self.grosor = ancho, color, grosor
        self.height = grosor + 2

    def draw(self):
        self.canv.setStrokeColor(self.color)
        self.canv.setLineWidth(self.grosor)
        self.canv.line(0, 1, self.ancho, 1)


class Documento(BaseDocTemplate):
    """Documento con indice automatico y cabecera con el capitulo en curso."""

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.capitulo = ""
        self.indice: list[tuple[int, str, int]] = []
        marco = Frame(
            MARGEN_IZQ, MARGEN_INF,
            A4[0] - MARGEN_IZQ - MARGEN_DER, A4[1] - MARGEN_SUP - MARGEN_INF,
            id="cuerpo", leftPadding=0, rightPadding=0, topPadding=0, bottomPadding=0,
        )
        self.addPageTemplates([
            PageTemplate(id="portada", frames=[Frame(MARGEN_IZQ, 0, A4[0] - MARGEN_IZQ - MARGEN_DER, A4[1], id="todo",
                                                     leftPadding=0, rightPadding=0,
                                                     topPadding=0, bottomPadding=0)],
                         onPage=self.pintar_portada),
            PageTemplate(id="contenido", frames=[marco], onPage=self.pintar_cuerpo),
        ])

    # -- decoracion de pagina ---------------------------------------------------
    def pintar_portada(self, lienzo, doc):
        ancho, alto = A4
        lienzo.setFillColor(PRIMARIO)
        lienzo.rect(0, 0, 14 * mm, alto, stroke=0, fill=1)
        lienzo.setFillColor(ACENTO)
        lienzo.rect(14 * mm, 0, 2.4 * mm, alto, stroke=0, fill=1)
        lienzo.setFillColor(SECUNDARIO)
        lienzo.rect(MARGEN_IZQ, alto - 46 * mm, 7 * mm, 7 * mm, stroke=0, fill=1)

    def pintar_cuerpo(self, lienzo, doc):
        ancho, alto = A4
        lienzo.saveState()
        # cabecera
        lienzo.setFont("PJS-Semi", 7.6)
        lienzo.setFillColor(TENUE)
        lienzo.drawString(MARGEN_IZQ, alto - MARGEN_SUP + 9 * mm, ROTULO)
        if self.capitulo:
            lienzo.setFont("Mono", 7.2)
            lienzo.setFillColor(ACENTO)
            lienzo.drawRightString(ancho - MARGEN_DER, alto - MARGEN_SUP + 9 * mm, self.capitulo.upper())
        lienzo.setStrokeColor(LINEA)
        lienzo.setLineWidth(0.5)
        lienzo.line(MARGEN_IZQ, alto - MARGEN_SUP + 6 * mm, ancho - MARGEN_DER, alto - MARGEN_SUP + 6 * mm)
        # pie
        lienzo.line(MARGEN_IZQ, MARGEN_INF - 5 * mm, ancho - MARGEN_DER, MARGEN_INF - 5 * mm)
        lienzo.setFont("PJS", 7.4)
        lienzo.setFillColor(TENUE)
        lienzo.drawString(MARGEN_IZQ, MARGEN_INF - 10 * mm, "Rally de Innovación Nicaragua · Registro y análisis de ganadores")
        lienzo.setFont("Mono", 8.2)
        lienzo.setFillColor(PRIMARIO)
        lienzo.drawRightString(ancho - MARGEN_DER, MARGEN_INF - 10 * mm, "%02d" % (doc.page - 1))
        lienzo.restoreState()

    def afterFlowable(self, flowable):
        nivel = getattr(flowable, "_nivel", None)
        if nivel is None:
            return
        texto = getattr(flowable, "_titulo", "")
        numero = getattr(flowable, "_numero", "")
        if nivel == 0:
            self.capitulo = texto
            self.indice.append((0, numero, texto, self.page - 1))


ROTULO = "INVESTIGACIÓN · RALLY DE INNOVACIÓN NICARAGUA"


# --- markdown ------------------------------------------------------------------
def escapar(texto: str) -> str:
    texto = texto.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
    texto = re.sub(
        r"(https?://[^\s<]+)",
        r'<link href="\1" color="#' + HEX_PRIMARIO + r'">\1</link>',
        texto,
    )
    return texto


def partir(texto: str) -> tuple[str, str]:
    """'3.2 Análisis por sede' -> ('3.2', 'Análisis por sede')."""
    m = re.match(r"^(\d+(?:\.\d+)?)\.?\s+(.*)$", texto)
    return (m.group(1), m.group(2)) if m else ("", texto)


def leer(md: Path) -> list[tuple[str, str]]:
    """Clasifica los encabezados por el numero, no por el nivel del markdown.

    El PDF de origen usa el mismo tamano para capitulo y subcapitulo, y ademas
    las recomendaciones numeradas ("1. Estructurar el pitch...") se ven igual
    que un capitulo. Por eso un numero de un solo nivel solo es capitulo la
    primera vez que aparece; las repeticiones son listas numeradas.
    """
    bloques: list[tuple[str, str]] = []
    siguiente = 1
    for linea in md.read_text(encoding="utf-8").splitlines():
        linea = linea.rstrip()
        if not linea:
            continue
        if linea.startswith("#"):
            nivel = len(linea) - len(linea.lstrip("#"))
            texto = linea[nivel:].strip()
            numero, _ = partir(texto)
            # Un capitulo es el siguiente numero entero en orden y con titulo
            # corto: las recomendaciones numeradas son frases largas.
            if numero.isdigit() and int(numero) == siguiente and len(texto) < 90:
                clase = "h1"
                siguiente += 1
            elif numero and "." in numero:
                clase = "h2"
            elif numero.isdigit():
                clase = "oli"
            elif nivel <= 2:
                clase = "h2"
            else:
                clase = "h3"
            bloques.append((clase, texto))
        elif linea.startswith("- "):
            bloques.append(("li", linea[2:].strip()))
        else:
            bloques.append(("p", linea))
    return bloques


def portada() -> list[Flowable]:
    alto_texto = A4[1]
    salida: list[Flowable] = [Spacer(1, alto_texto * 0.30)]

    def linea(texto: str, estilo: ParagraphStyle) -> Paragraph:
        p = Paragraph(texto, estilo)
        return p

    salida += [
        Paragraph("INVESTIGACIÓN Y ANÁLISIS · OCTUBRE 2026",
                  ParagraphStyle("eyebrow", fontName="Mono", fontSize=8.4, leading=11,
                                 textColor=ACENTO, leftIndent=0)),
        Spacer(1, 6 * mm),
        linea("RALLY DE<br/>INNOVACIÓN<br/>NICARAGUA",
              ParagraphStyle("titular", fontName="PJS-Black", fontSize=40, leading=43, textColor=PRIMARIO)),
        Spacer(1, 8 * mm),
        Regla(58 * mm, ACENTO, 3),
        Spacer(1, 7 * mm),
        linea("Registro completo de equipos ganadores y análisis profundo "
              "de los patrones que explican por qué ganan.",
              ParagraphStyle("bajada", fontName="PJS", fontSize=13.2, leading=19, textColor=TINTA)),
        Spacer(1, 9 * mm),
        linea("Dos competencias complementarias",
              ParagraphStyle("rot", fontName="PJS-Semi", fontSize=9, leading=12, textColor=TENUE)),
        Spacer(1, 2.5 * mm),
    ]
    for texto in (
        "Rally Nacional de Innovación «Nicaragua Innova» — 4 ediciones, 2023-2026.",
        "Rally Latinoamericano de Innovación — 13 ediciones, 2014-2026.",
    ):
        salida.append(Paragraph(
            texto,
            ParagraphStyle("punto", fontName="PJS", fontSize=10.4, leading=15.5,
                           textColor=TINTA, leftIndent=13, bulletIndent=0,
                           bulletFontName="PJS-Bold", bulletFontSize=10, bulletColor=ACENTO),
        ))
        salida[-1].bulletText = "▪"
    salida += [
        Spacer(1, 10 * mm),
        linea("Fuentes: nicaraguacreativa.com · rallydeinnovacion.org · UNAN · UNI · UAM · "
              "INATEC · El 19 Digital · La Gaceta · TN8 · SIRLI",
              ParagraphStyle("fuente", fontName="PJS", fontSize=8.2, leading=12, textColor=TENUE)),
    ]
    return salida


def seccion_indice(doc: Documento) -> list[Flowable]:
    filas: list[Flowable] = [
        Spacer(1, 6 * mm),
        Paragraph("CONTENIDO", ParagraphStyle("rot", fontName="Mono", fontSize=8, textColor=ACENTO)),
        Spacer(1, 4 * mm),
    ]
    for _, numero, titulo, pagina in doc.indice:
        filas.append(Paragraph(
            '<font name="Mono" color="#' + HEX_ACENTO + '" size="8.5">%s</font>'
            '&nbsp;&nbsp;&nbsp;%s<span color="#' + HEX_TINTA + '"><font name="Mono" size="8.5">'
            '&nbsp;&nbsp;·&nbsp;&nbsp;%02d</font></span>'
            % (numero or "·", escapar(titulo), pagina),
            ParagraphStyle("ind0", fontName="PJS-Bold", fontSize=12.5, leading=26, textColor=TINTA),
        ))
    filas += [
        Spacer(1, 8 * mm),
        Paragraph(
            "El capítulo 5 reúne los 23 patrones de los equipos ganadores: naming, "
            "clusters temáticos, evolución técnica, dominancia institucional, "
            "narrativa de guion y alineación con el marco de política pública.",
            ParagraphStyle("nota", fontName="PJS", fontSize=9.6, leading=15, textColor=TENUE,
                           backColor=VELO, borderPadding=(9, 10, 9, 10)),
        ),
    ]
    return filas


def historia(bloques: list[tuple[str, str]]) -> list[Flowable]:
    st = estilos()
    flujo: list[Flowable] = []
    primera = True
    for clase, texto in bloques:
        if clase == "h1":
            if not primera:
                flujo.append(PageBreak())
            primera = False
            numero, texto = partir(texto)
            if numero:
                flujo.append(Paragraph(
                    "CAPÍTULO %s" % numero,
                    ParagraphStyle("cap", fontName="Mono", fontSize=7.8, textColor=ACENTO),
                ))
            titulo = Paragraph(escapar(texto), st["h1"])
            titulo._nivel, titulo._titulo, titulo._numero = 0, texto, numero
            flujo.append(CondPageBreak(60 * mm))
            flujo.append(titulo)
            flujo.append(Regla(34 * mm, ACENTO, 2.6))
            flujo.append(Spacer(1, 5 * mm))
        elif clase == "h2":
            p = Paragraph(escapar(texto), st["h2"])
            flujo.append(p)
            flujo.append(Spacer(1, 1.5 * mm))
        elif clase == "h3":
            flujo.append(Paragraph(escapar(texto), st["h3"]))
        elif clase == "li":
            marcada = Paragraph(escapar(texto), st["vineta"])
            marcada.bulletText = "▪"
            marcada.bulletColor = ACENTO
            marcada.bulletFontName = "PJS-Bold"
            marcada.bulletFontSize = 7.5
            flujo.append(marcada)
        elif clase == "oli":
            numero, resto = partir(texto)
            fila = Paragraph('<font color="#' + HEX_PRIMARIO + '"><b>%s.</b></font>&nbsp;&nbsp;%s'
                             % (numero, escapar(resto)), st["vineta_num"])
            fila.bulletText = ""
            flujo.append(fila)
        else:
            flujo.append(Paragraph(escapar(texto), st["cuerpo"]))
    return flujo


def capitulos(bloques: list[tuple[str, str]]) -> list[tuple[int, str, str, int]]:
    """(nivel, numero, titulo, pagina) de cada capitulo, para la primera pasada."""
    salida = []
    for clase, texto in bloques:
        if clase != "h1":
            continue
        numero, titulo = partir(texto)
        salida.append((0, numero, titulo, 0))
    return salida


def construir(out: Path, md: Path) -> None:
    bloques = leer(md)
    meta = dict(pagesize=A4, title="Rally de Innovación Nicaragua — Registro y Análisis",
                author="Rally Studio", subject="Registro de ganadores y patrones")

    # primera pasada: el indice lleva la misma cantidad de lineas, asi que la
    # paginacion es la definitiva y solo cambian los numeros.
    borrador = Documento(str(out), **meta)
    borrador.indice = capitulos(bloques)
    borrador.build(portada() + [NextPageTemplate("contenido"), PageBreak()]
                   + seccion_indice(borrador) + [PageBreak()] + historia(bloques))
    paginas = [e for e in borrador.indice if e[3] > 0]

    final = Documento(str(out), **meta)
    final.indice = paginas or capitulos(bloques)
    final.build(portada() + [NextPageTemplate("contenido"), PageBreak()]
                + seccion_indice(final) + [PageBreak()] + historia(bloques))
    print("PDF: %s (%d KB)" % (out, out.stat().st_size // 1024))


def main(argv: list[str] | None = None) -> int:
    ap = argparse.ArgumentParser(description="PDF de la investigacion con la identidad del proyecto")
    ap.add_argument("--md", type=Path, default=MD)
    ap.add_argument("--out", type=Path, default=SALIDA)
    args = ap.parse_args(argv)
    if not PALETA:
        # Sin identidad aprobada el PDF saldria en gris: no se dibuja.
        print("ALTO: " + (_MOTIVO_PALETA or "brand/palette.json pendiente."))
        return 1
    if not args.md.is_file():
        print("Falta el contenido: %s" % args.md)
        return 1
    if not args.md.read_text(encoding="utf-8").strip():
        print("ALTO: %s esta vacio. El PDF se queda como esta." % args.md)
        return 1
    construir(args.out, args.md)
    return 0


if __name__ == "__main__":
    sys.exit(main())
