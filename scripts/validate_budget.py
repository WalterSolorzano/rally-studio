#!/usr/bin/env python3
"""
validate_budget.py -- Valida budget/budget.json contra las reglas de rally:
1. URLs reales y obligatorias en cada renglon.
2. Fechas de cotizacion presentes.
3. Banda de precio sugerida ($3,000 - $7,000 USD; punto dulce $4,000 - $6,000):
   avisa, nunca bloquea. El monto lo decide el equipo.
4. Presencia de flete/arancel de importacion.
"""
import json
import pathlib
import sys
from moneda import contexto, costo_unitario, costo_unitario_usd, formato
from comun import utf8
utf8()

BUDGET_JSON = pathlib.Path("budget/budget.json")
BRIEF_JSON = pathlib.Path("brief.json")

def main():
    if not BUDGET_JSON.exists():
        print("ERROR: budget/budget.json no existe.")
        sys.exit(1)

    try:
        items = json.loads(BUDGET_JSON.read_text(encoding="utf-8-sig"))
    except Exception as e:
        print(f"ERROR: JSON corrupto en {BUDGET_JSON}: {e}")
        sys.exit(1)

    # Un presupuesto sin filas no es un presupuesto: la validacion pasaba con
    # "[]" y anunciaba exito sobre cero partidas.
    if not isinstance(items, list) or not items:
        print("ERROR: budget/budget.json debe ser una lista con al menos una partida.")
        sys.exit(1)

    errors = []
    warnings = []
    total = 0.0
    total_usd = 0.0
    has_shipping = False

    brief = json.loads(BRIEF_JSON.read_text(encoding="utf-8-sig")) if BRIEF_JSON.exists() else {}
    ctx = contexto(brief)
    if ctx["advertencia"]:
        warnings.append(ctx["advertencia"])

    print("\n" + "=" * 60)
    print("  AUDITORIA DE PRESUPUESTO (ALIBABA / FUENTES SUSTENTADAS)")
    print(f"  Moneda de presentacion: {ctx['etiqueta']}")
    print("=" * 60)

    for i, it in enumerate(items, 1):
        if not isinstance(it, dict):
            errors.append(f"Fila {i}: no es un objeto con element/units/unit_cost/url.")
            continue
        name = it.get("element", f"Item {i}")
        # `units: 0` pasaba como partida valida y `units: -3` restaba del total sin
        # avisar; un texto como "dos" reventaba con traceback. La cantidad entra al
        # total, asi que se mide antes de sumar.
        try:
            units = float(it.get("units", 0))
        except (TypeError, ValueError):
            errors.append(f"Fila {i} ({name}): units no es un numero ('{it.get('units')}').")
            continue
        if units <= 0:
            errors.append(f"Fila {i} ({name}): units debe ser mayor que cero (es {units:g}).")
            continue
        unit_cost = costo_unitario(it, ctx)
        unit_cost_usd = costo_unitario_usd(it, ctx)
        if unit_cost is None or unit_cost_usd is None:
            errors.append(
                f"Fila {i} ({name}): costo ausente o no convertible a "
                f"{ctx['etiqueta']}. Agrega unit_cost_usd"
                + (" o define exchange_rate_bcn." if ctx['code'] == "NIO" else ".")
            )
            continue
        total += units * unit_cost
        total_usd += units * unit_cost_usd

        # Chequeo URLs
        url = it.get("url", "").strip()
        if not url or not (url.startswith("http://") or url.startswith("https://")):
            errors.append(f"Fila {i} ({name}): URL invalida o ausente ('{url}').")

        # Chequeo Fecha
        date = it.get("date", "").strip()
        if not date:
            errors.append(f"Fila {i} ({name}): Fecha de cotizacion ausente.")

        # Chequeo explicacion: "sensor" no le dice nada a quien lee el documento.
        # El jurado no comparte el vocabulario del equipo; la fila se explica sola.
        descripcion = str(it.get("description", "")).strip()
        if len(descripcion.split()) < 6:
            errors.append(
                f"Fila {i} ({name}): la descripcion no explica nada "
                f"({len(descripcion.split())} palabras). Escribe que es, para que sirve "
                "y quien lo usa, sin siglas ni nombres tecnicos sueltos."
            )

        # Chequeo Flete: el presupuesto es de lanzamiento, no de importacion.
        # Aduanas y aranceles son ruido para el jurado: si aparecen, se avisa.
        elem_lower = name.lower() + " " + it.get("description", "").lower()
        if any(w in elem_lower for w in ["flete", "importacion", "arancel", "aduan"]):
            has_shipping = True

    if has_shipping:
        warnings.append("Hay una linea de aduana, flete o arancel. El presupuesto de lanzamiento solo lleva compras y salarios: quitala.")

    # La banda de precio es SUGERENCIA, no ley: un piloto de $2.500 puede ser
    # mejor que uno de $6.000, y un proyecto muy innovador puede costar $9.000.
    # Por eso todo lo economico va a ALERTAS y nunca bloquea la entrega.
    if total_usd < 3000 or total_usd > 7000:
        warnings.append(
            f"Total {formato(total, ctx)} (${total_usd:,.2f} USD) esta fuera de la banda "
            "habitual ($3,000 - $7,000 USD). Valido si el equipo lo justifica en Prefactibilidad."
        )
    elif total_usd < 4000 or total_usd > 6000:
        warnings.append(f"Total {formato(total, ctx)} (${total_usd:,.2f} USD) fuera del punto dulce optimo ($4,000 - $6,000 USD). Es solo sugerencia.")

    print(f"  Total auditado: {formato(total, ctx)} (${total_usd:,.2f} USD, {len(items)} partidas)")

    if warnings:
        print("\n  ALERTAS:")
        for w in warnings:
            print(f"  [!] {w}")

    if errors:
        print("\n  ERRORES BLOQUEANTES:")
        for e in errors:
            print(f"  [X] {e}")
        print("\n  ERROR: Corrige budget/budget.json antes de presentar.")
        sys.exit(1)

    print("\n  VALIDACION EXITOSA: El presupuesto cumple con la rigurosidad sustentada exigida.")

if __name__ == "__main__":
    main()
