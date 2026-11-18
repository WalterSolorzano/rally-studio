#!/usr/bin/env python3
"""
gen_pautado.py -- Genera docs/pautado_draft.docx a partir de brief.json, claims.json
y la plantilla oficial del certamen correspondiente (Nacional o Latam).
"""
import argparse
import json
import pathlib
import sys
import docx
from docx.shared import Inches
from docx.enum.text import WD_ALIGN_PARAGRAPH
from comun import utf8
utf8()

BRIEF_PATH = pathlib.Path("brief.json")
CLAIMS_PATH = pathlib.Path("research/claims.json")
TEMPLATE_PATH = pathlib.Path("plantillas/pautado_template.docx")
DRAFT_PATH = pathlib.Path("docs/pautado_draft.docx")

# Un solo Word de plantilla manda: `plantillas/pautado_template.docx`. Las copias
# que vivían en `docs/` y `knowledge/` eran los mismos bytes con otro nombre.
PLANTILLA_UNICA = pathlib.Path("plantillas/pautado_template.docx")

def get_reference_template(rally_type):
    if rally_type == "latam":
        ref = pathlib.Path("knowledge/pautado_latam_ref.docx")
    else:
        ref = PLANTILLA_UNICA
    return ref if ref.exists() else None

def _costo_declarado(items):
    """Suma de las partidas: usa `total` si viene, si no unidades x costo unitario.

    Antes solo leia `total`, que gen_budget calcula al exportar; con un
    budget.json escrito a mano el pautado decia "el costo total del presupuesto
    auditado", que no es una cifra.
    """
    total = 0.0
    moneda = "USD"
    for x in items:
        if not isinstance(x, dict):
            continue
        try:
            if x.get("total"):
                total += float(x["total"])
                continue
            unidades = float(x.get("units") or 0)
            unitario = x.get("unit_cost") or x.get("unit_cost_usd") or x.get("unit_cost_nio")
            if unitario:
                total += unidades * float(unitario)
            if x.get("unit_cost_nio"):
                moneda = "C$"
        except (TypeError, ValueError):
            continue
    return (total, moneda) if total > 0 else (None, moneda)


def create_default_document(brief, claims):
    import json as _j, pathlib as _p
    _total, _moneda = None, "USD"
    _bp = _p.Path("budget/budget.json")
    if _bp.exists():
        try:
            _data = _j.loads(_bp.read_text(encoding="utf-8"))
            _items = _data if isinstance(_data, list) else _data.get("items", [])
            _total, _moneda = _costo_declarado(_items)
        except Exception:
            _total = None
    # Sin partidas no se escribe una frase que parezca un monto.
    if _total:
        cost_str = (f"{_total:,.0f} C$" if _moneda == "C$" else f"${_total:,.0f} USD")
    else:
        cost_str = "[PENDIENTE] Falta el costo de implementación: sale de budget/budget.json"
    doc = docx.Document()
    # Margenes
    for section in doc.sections:
        section.top_margin = Inches(1.0)
        section.bottom_margin = Inches(1.0)
        section.left_margin = Inches(1.0)
        section.right_margin = Inches(1.0)

    title = doc.add_heading(f"REPORTE PAUTADO -- {brief.get('project_name','PROYECTO').upper()}", level=0)
    title.alignment = WD_ALIGN_PARAGRAPH.CENTER

    # Metadatos
    p_meta = doc.add_paragraph()
    p_meta.add_run(f"Equipo: {brief.get('team_name','--')}\n").bold = True
    p_meta.add_run(f"Universidad / Sede: {brief.get('university','--')}\n")
    p_meta.add_run(f"Ciudad Piloto: {brief.get('city','--')} | Categoría: {brief.get('category','--')}\n")
    p_meta.add_run(f"Desafío #{brief.get('challenge_id','--')}: {brief.get('challenge_title','--')}\n")
    p_meta.add_run(f"Rally: {brief.get('rally_type','--').upper()}\n")

    doc.add_paragraph("─" * 45)

    stats_text = " ".join([f"{c['stat']} ({c['source']}, {c['year']})." for c in claims]) if claims else ""
    # Sin cifras declaradas no se inventa una: se pide la que falta. Un jurado
    # que pregunta por la fuente no acepta "segun registros oficiales".
    falta_cifra = ("" if stats_text else
                   "[PENDIENTE] Falta la cifra con fuente: qué dato, de qué año y de qué "
                   "organismo. Sale de research/claims.json.")
    try:
        solution_text = (brief.get("solution_detail") or brief.get("solution")
                         or brief.get("description_one_line") or "")
    except AttributeError:
        solution_text = ""
    falta_solucion = ("" if solution_text.strip() else
                      "[PENDIENTE] Falta describir cómo funciona la solución, paso por paso, "
                      "y quién la opera.")
    falta_innovacion = ("" if (brief.get("innovation_detail") or "").strip() else
                        "[PENDIENTE] Falta decir qué hace esto que no haga ya la alternativa "
                        "convencional, y por qué aquí sí funciona.")
    ods_texto = ", ".join(str(o) for o in (brief.get("ods_ids") or [])) or "[PENDIENTE] Elegir los ODS"
    # El usuario escribe su impacto y su prefactibilidad; sin eso el campo se queda
    # en el ODS suelto y en la cifra del presupuesto, que no explica nada.
    impacto_texto = f"ODS a los que responde: {ods_texto}."
    detalle_impacto = (brief.get("impact_detail") or "").strip()
    if detalle_impacto:
        impacto_texto = f"{impacto_texto} {detalle_impacto}"
    prefactibilidad_texto = f"Costo estimado de implementación inicial: {cost_str}."
    detalle_prefactibilidad = (brief.get("prefactibilidad_detail") or "").strip()
    if detalle_prefactibilidad:
        prefactibilidad_texto = f"{prefactibilidad_texto} {detalle_prefactibilidad}"

    sections = [
        ("PROBLEMA", 1250, (stats_text + " " + falta_cifra).strip()),
        ("SOLUCION", 1250, (solution_text + " " + falta_solucion).strip()),
        ("PREFACTIBILIDAD", 1500, prefactibilidad_texto),
        ("INNOVACION", 1000, ((brief.get("innovation_detail") or "") + " " + falta_innovacion).strip()),
        ("IMPACTO", 1000, impacto_texto),
    ]

    sin_tope = (brief.get("rally_type") or "latam").strip().lower() != "latam"
    for sec_title, limit, content in sections:
        tope = "sin límite de caracteres" if sin_tope else f"Límite: {limit} caracteres con espacios"
        h = doc.add_heading(f"{sec_title} ({tope})", level=1)
        p = doc.add_paragraph(content)

    doc.save(DRAFT_PATH)
    print(f"OK: Creado documento base en {DRAFT_PATH}")

def main(argv=None):
    parser = argparse.ArgumentParser(
        description="Genera el borrador del pautado oficial desde brief.json y claims.json."
    )
    parser.add_argument(
        "--clean",
        action="store_true",
        help="ignora la plantilla y crea el documento base estandarizado",
    )
    parser.add_argument(
        "--si",
        action="store_true",
        help="escribe aunque falten project_name y team_name",
    )
    args = parser.parse_args(argv)

    if not BRIEF_PATH.exists():
        print("ERROR: brief.json no existe.")
        sys.exit(1)

    brief = json.loads(BRIEF_PATH.read_text(encoding="utf-8"))
    if not (brief.get("project_name") and brief.get("team_name")) and not args.si:
        # Con el brief vacio salia un Word con «REPORTE PAUTADO --» y el equipo en
        # blanco: se entregaba un documento falso. Mejor no escribirlo.
        print(
            "ALTO: brief.json sin project_name/team_name. El pautado necesita "
            "proyecto y equipo; docs/pautado_draft.docx se queda como esta."
        )
        return 1
    claims = json.loads(CLAIMS_PATH.read_text(encoding="utf-8")) if CLAIMS_PATH.exists() else []

    pathlib.Path("docs").mkdir(exist_ok=True)
    force_clean = args.clean

    if force_clean or not TEMPLATE_PATH.exists():
        create_default_document(brief, claims)
        return 0

    try:
        doc = docx.Document(TEMPLATE_PATH)
        replacements = {
            "{{PROYECTO}}": brief.get("project_name", ""),
            "{{EQUIPO}}": brief.get("team_name", ""),
            "{{UNIVERSIDAD}}": brief.get("university", ""),
            "{{CIUDAD}}": brief.get("city", ""),
            "{{DESAFIO}}": brief.get("challenge_title", ""),
            "{{DESCRIPCION}}": brief.get("description_one_line", ""),
        }
        replaced = 0
        for para in doc.paragraphs:
            for k, v in replacements.items():
                if k in para.text:
                    para.text = para.text.replace(k, v)
                    replaced += 1
        if replaced > 0:
            doc.save(DRAFT_PATH)
            print(f"OK: {DRAFT_PATH} generado a partir de plantilla ({replaced} etiquetas reemplazadas).")
            return 0
        else:
            print("INFO: La plantilla no tenia etiquetas {{...}}. Generando borrador pautado limpio estandarizado.")
            create_default_document(brief, claims)
            return 0
    except Exception as e:
        print(f"WARN: Error al procesar template ({e}). Generando documento estandar...")
        create_default_document(brief, claims)
        return 0

if __name__ == "__main__":
    sys.exit(main())
