#!/usr/bin/env python3
"""
gen_budget.py -- Genera budget/budget.xlsx con formato formal a partir de budget/budget.json.
"""
import argparse
import json
import pathlib
import sys
import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter

from moneda import contexto, costo_unitario, formato, numero_excel
from comun import utf8
utf8()

BUDGET_JSON = pathlib.Path("budget/budget.json")
BUDGET_XLSX = pathlib.Path("budget/budget.xlsx")
BRIEF_JSON = pathlib.Path("brief.json")
STATE_JSON = pathlib.Path("dashboard/data/state.json")


def con_estado_vivo(items):
    """La tabla de la ventana manda: si el equipo edito ahi, el Excel lo respeta.

    budget.json es la semilla; state.json guarda lo que se cambio en la UI.
    Se cruzan por nombre de partida y se conservan descripcion, categoria y fecha.
    """
    if not STATE_JSON.exists():
        return items
    try:
        vivo = json.loads(STATE_JSON.read_text(encoding="utf-8-sig")).get("budget") or []
    except Exception:
        return items
    if not vivo:
        return items
    semilla = {str(i.get("element", "")).strip().lower(): i for i in items}
    salida = []
    for fila in vivo:
        base = dict(semilla.get(str(fila.get("element", "")).strip().lower(), {}))
        base.update({k: fila[k] for k in ("element", "units", "unit_cost", "url") if k in fila})
        salida.append(base)
    return salida

def main(argv=None):
    parser = argparse.ArgumentParser(
        description="Genera budget/budget.xlsx desde budget/budget.json y la paleta aprobada."
    )
    parser.add_argument(
        "--si",
        action="store_true",
        help="escribe aunque falten project_name, team_name o partidas",
    )
    args = parser.parse_args(argv)

    if not BUDGET_JSON.exists():
        print("ERROR: budget/budget.json no existe.")
        sys.exit(1)

    items = con_estado_vivo(json.loads(BUDGET_JSON.read_text(encoding="utf-8-sig")))
    brief = json.loads(BRIEF_JSON.read_text(encoding="utf-8-sig")) if BRIEF_JSON.exists() else {}
    if not args.si and (
        not (brief.get("project_name") and brief.get("team_name")) or not items
    ):
        # Sin partidas el Excel sale en cero y sin proyecto sale sin encabezado:
        # eso no es un presupuesto, es una planilla vacia que parece entregable.
        print(
            "ALTO: brief.json sin project_name/team_name o budget.json sin partidas. "
            "budget/budget.xlsx se queda como esta."
        )
        return 1
    ctx = contexto(brief)

    # Paleta de diseno del proyecto/grupo (brand/palette.json).
    # El color de la tabla NUNCA se hardcodea y NUNCA se inventa un default:
    # si no hay paleta aprobada, el generador se detiene.
    palette_path = pathlib.Path("brand/palette.json")
    if not palette_path.exists():
        raise SystemExit(
            "brand/palette.json pendiente: correr scripts/gen_palette.py "
            "y aprobar una ruta A/B/C antes de generar el presupuesto."
        )
    palette = json.loads(palette_path.read_text(encoding="utf-8-sig"))
    if palette.get("_status") != "aprobada":
        raise SystemExit(
            "brand/palette.json pendiente: aprobar una ruta A/B/C "
            "antes de generar el presupuesto."
        )
    # `gen_palette.py` escribe text_title/text_main/text_body; "text" no existe
    # en ese esquema, asi que el chequeo pedia una clave que el generador nunca
    # produce y el presupuesto quedaba imposible de generar.
    texto = palette.get("text") or palette.get("text_main") or palette.get("text_body")
    faltan = [k for k in ("primary", "accent") if not palette.get(k)]
    if not texto:
        faltan.append("text_main")
    if faltan:
        raise SystemExit("brand/palette.json incompleto: faltan " + ", ".join(faltan) + ".")

    def _rgb(key):
        h = str(palette.get(key, "")).lstrip("#")
        if len(h) != 6:
            raise SystemExit(
                "brand/palette.json: valor invalido en '%s' (%r)." % (key, palette.get(key))
            )
        return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4))

    COLOR_PRIMARIO = _rgb("primary")
    COLOR_ACENTO = _rgb("accent")
    clave_texto = next((k for k in ("text", "text_main", "text_body") if palette.get(k)), "text")
    COLOR_TEXTO = _rgb(clave_texto)
    hex_primary = "%02X%02X%02X" % COLOR_PRIMARIO
    hex_acento = "%02X%02X%02X" % COLOR_ACENTO
    hex_texto = "%02X%02X%02X" % COLOR_TEXTO
    print(f"OK: paleta del proyecto aplicada (primary #{hex_primary}).")
    unidad = "C$" if ctx.get("code") == "NIO" else "USD"
    if ctx["advertencia"]:
        print(f"WARN: {ctx['advertencia']}")

    wb = openpyxl.Workbook()
    ws = wb.active
    ws.title = "Presupuesto Puesta en Marcha"
    ws.views.sheetView[0].showGridLines = True

    # Estilos (colores derivados de la paleta del proyecto)
    font_title = Font(name="Calibri", size=14, bold=True, color=hex_primary)
    font_subtitle = Font(name="Calibri", size=10, color="595959")
    font_header = Font(name="Calibri", size=11, bold=True, color="FFFFFF")
    fill_header = PatternFill(start_color=hex_primary, end_color=hex_primary, fill_type="solid")
    font_bold = Font(name="Calibri", size=11, bold=True)
    align_center = Alignment(horizontal="center", vertical="center")
    align_left = Alignment(horizontal="left", vertical="center")
    align_right = Alignment(horizontal="right", vertical="center")
    thin_border = Border(
        left=Side(style='thin', color='D9D9D9'),
        right=Side(style='thin', color='D9D9D9'),
        top=Side(style='thin', color='D9D9D9'),
        bottom=Side(style='thin', color='D9D9D9')
    )

    # Titulos
    project_name = brief.get("project_name", "PROYECTO").upper()
    team_name = brief.get("team_name", "EQUIPO")
    ws.merge_cells("A1:H1")
    ws["A1"] = f"PRESUPUESTO - PUESTA EN MARCHA (PILOTO INICIAL): {project_name}"
    ws["A1"].font = Font(name="Calibri", size=16, bold=True, color=hex_texto)
    ws["A1"].alignment = Alignment(horizontal="center", vertical="center")

    ws.merge_cells("A2:H2")
    tasa_txt = f" | Tasa BCN: C$ {ctx['tasa']:,.2f} por USD" if ctx.get("tasa") else ""
    ws["A2"] = f"Equipo: {team_name} | Moneda base: {ctx['etiqueta']}{tasa_txt} | Metodologia: Costos mayoristas sustentados"
    ws["A2"].font = font_subtitle
    ws["A2"].alignment = Alignment(horizontal="center", vertical="center")

    # Encabezados de tabla (sin columna de fecha: la fecha vive en budget.json)
    headers = ["#", "Elemento / Insumo", "Descripcion (para que sirve)", "Unidades", f"Costo Unit. ({unidad})", f"Subtotal ({unidad})", "Tipo", "Fuente / Enlace"]
    row_idx = 4
    for col_idx, h in enumerate(headers, 1):
        cell = ws.cell(row=row_idx, column=col_idx, value=h)
        cell.font = font_header
        cell.fill = fill_header
        cell.alignment = align_center
        cell.border = thin_border

    total_general = 0.0
    row_start = 5

    for i, it in enumerate(items, 1):
        curr_row = row_start + i - 1
        units = float(it.get("units", 1))
        unit_cost = costo_unitario(it, ctx)
        if unit_cost is None:
            print(
                f"ERROR: '{it.get('element', f'Item {i}')}' no tiene costo en "
                f"{ctx['etiqueta']}. Agrega unit_cost_usd"
                + (" o define exchange_rate_bcn." if ctx['code'] == "NIO" else ".")
            )
            sys.exit(1)
        subtotal = round(units * unit_cost, 2)
        total_general += subtotal

        ws.cell(row=curr_row, column=1, value=i).alignment = align_center
        ws.cell(row=curr_row, column=2, value=it.get("element", "")).alignment = align_left
        ws.cell(row=curr_row, column=3, value=it.get("description", "")).alignment = align_left
        ws.cell(row=curr_row, column=4, value=units).alignment = align_center
        c_unit = ws.cell(row=curr_row, column=5, value=unit_cost)
        c_unit.alignment = align_center
        c_unit.number_format = numero_excel(ctx)
        
        c_sub = ws.cell(row=curr_row, column=6, value=subtotal)
        c_sub.alignment = align_center
        c_sub.number_format = numero_excel(ctx)
        
        ws.cell(row=curr_row, column=7, value=it.get("tipo") or it.get("category", "")).alignment = align_center
        ws.cell(row=curr_row, column=8, value=it.get("url", "")).alignment = align_left

        for col in range(1, 9):
            ws.cell(row=curr_row, column=col).border = thin_border

    # Fila de Total
    total_row = row_start + len(items)
    ws.merge_cells(start_row=total_row, start_column=1, end_row=total_row, end_column=5)
    ws.cell(row=total_row, column=1, value=f"TOTAL PROYECTADO DE PUESTA EN MARCHA ({unidad})").alignment = align_right
    ws.cell(row=total_row, column=1).font = font_bold
    
    cell_total = ws.cell(row=total_row, column=6, value=total_general)
    cell_total.font = font_bold
    cell_total.alignment = align_center
    cell_total.number_format = numero_excel(ctx)
    cell_total.fill = PatternFill(start_color=hex_acento, end_color=hex_acento, fill_type="solid")

    for col in range(1, 9):
        ws.cell(row=total_row, column=col).border = thin_border

    # Autoajustar ancho de columnas (la columna # es angosta a proposito)
    for col in ws.columns:
        max_len = max(len(str(cell.value or '')) for cell in col)
        col_idx = col[0].column
        col_letter = get_column_letter(col_idx)
        if col_idx == 1:
            ws.column_dimensions[col_letter].width = 4
        else:
            ws.column_dimensions[col_letter].width = min(max(max_len + 3, 10), 45)

    wb.save(BUDGET_XLSX)
    print(f"OK: {BUDGET_XLSX} generado exitosamente.")
    print(f"Total Presupuestado: {formato(total_general, ctx)}")

    if ctx.get("code") == "NIO" and not ctx.get("tasa"):
        # Sin tasa del BCN no se puede decir cuanto es en dolares: decir
        # "C$16.200 = $16.200" es una cifra inventada que el jurado leeria.
        print("WARN: No se compara con la banda en USD: falta exchange_rate_bcn en brief.json.")
        return 0

    total_usd = total_general / ctx["tasa"] if ctx.get("code") == "NIO" and ctx.get("tasa") else total_general
    if total_usd < 4000:
        print(f"WARN: Presupuesto ({formato(total_general, ctx)} = ${total_usd:,.2f} USD) inferior al rango optimo ($4,000 - $6,000 USD).")
    elif total_usd > 6000:
        print(f"WARN: Presupuesto ({formato(total_general, ctx)} = ${total_usd:,.2f} USD) excede el techo recomendado ($6,000 USD).")
    else:
        print(f"VALIDACION: Presupuesto dentro del rango ideal de victoria ($4,000 - $6,000 USD).")
    return 0

if __name__ == "__main__":
    sys.exit(main())
