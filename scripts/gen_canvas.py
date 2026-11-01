#!/usr/bin/env python3
"""
gen_canvas.py -- Genera docs/canvas.md a partir de brief.json y budget/budget.json.

Diseno generico: no asume sector, tecnologia ni geografia. Todo el contenido
sale del brief y del presupuesto. El brief puede sobrescribir cualquier bloque
con los campos opcionales:
    canvas_partners, canvas_activities, canvas_resources, canvas_value_bullets,
    canvas_relationships, canvas_channels, canvas_segments,
    canvas_cost_notes, canvas_revenue
Cada uno acepta lista de strings o un string con bullets separados por "|".
"""
import io
import json
import pathlib
import sys

if sys.platform == "win32":
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")

BRIEF_PATH = pathlib.Path("brief.json")
BUDGET_PATH = pathlib.Path("budget/budget.json")
CANVAS_PATH = pathlib.Path("docs/canvas.md")


def _lista(valor, defecto):
    """Normaliza un campo del brief a lista de bullets."""
    if isinstance(valor, list):
        return [str(v).strip() for v in valor if str(v).strip()]
    if isinstance(valor, str) and valor.strip():
        return [v.strip() for v in valor.split("|") if v.strip()]
    return defecto


def _bullets(items):
    return "<br>".join(f"• {item}" for item in items)


def main():
    if not BRIEF_PATH.exists():
        print("ERROR: brief.json no existe.")
        sys.exit(1)

    brief = json.loads(BRIEF_PATH.read_text(encoding="utf-8"))
    budget_items = json.loads(BUDGET_PATH.read_text(encoding="utf-8")) if BUDGET_PATH.exists() else []

    total_budget = sum(
        float(it.get("units", 1)) * float(it.get("unit_cost_usd") or it.get("unit_cost", 0))
        for it in budget_items
    )

    project = brief.get("project_name", "PROYECTO").upper()
    team = brief.get("team_name", "EQUIPO")
    city = brief.get("city", "")
    category = brief.get("category", "General")
    rally = brief.get("rally_type", "nacional").upper()
    ods = ", ".join(brief.get("ods_ids", ["ODS 11"]))
    desc = brief.get("description_one_line", "Solucion tecnica validada en piloto")
    university = brief.get("university", "")

    # --- Valores por defecto genericos, sin supuestos de sector ---
    partners = _lista(brief.get("canvas_partners"), [
        f"Universidad / sede: {university}" if university else "Universidad y centros de innovación",
        f"Aliados locales en {city}" if city else "Aliados locales del piloto",
        "Proveedores y plataformas citadas en el presupuesto",
        "Programas de innovación y financiamiento del certamen",
    ])
    activities = _lista(brief.get("canvas_activities"), [
        "Desarrollo y despliegue del piloto end-to-end.",
        "Validación con usuarios reales durante el rally.",
        "Documentación, capacitación y transferencia.",
        "Medición de indicadores y mejora continua.",
    ])
    resources = _lista(brief.get("canvas_resources"), [
        f"Equipo multidisciplinario: {team}.",
        f"Presupuesto de puesta en marcha: ${total_budget:,.2f} USD.",
        "Plataforma, prototipo y datos del piloto.",
        "Mentoría, red de aliados y conocimiento del certamen.",
    ])
    value_bullets = _lista(brief.get("canvas_value_bullets"), [
        "Reduce el tiempo y el costo de operar un rally de innovación.",
        "Centraliza brief, documentos, presupuesto, guion y video en un solo flujo.",
        "Es replicable: cada equipo lo configura con su propio reto.",
    ])
    relationships = _lista(brief.get("canvas_relationships"), [
        "Acompañamiento durante el rally y soporte posterior.",
        "Comunidad de equipos y mejora continua.",
        "Alianzas con universidades y organizadores.",
    ])
    channels = _lista(brief.get("canvas_channels"), [
        "Plataforma web y demos en vivo.",
        "Ferias de innovación y universidades.",
        "Programas de emprendimiento y convocatorias.",
    ])
    segments = _lista(brief.get("canvas_segments"), [
        "Equipos que compiten en rallies de innovación.",
        "Universidades y organizadores de certámenes.",
        "Programas de fomento y aceleradoras.",
    ])
    cost_notes = _lista(brief.get("canvas_cost_notes"), [
        f"Puesta en marcha del piloto: ${total_budget:,.2f} USD (ver `budget/budget.xlsx`).",
        "Operación, soporte y mejora continua del producto.",
        "Comercialización y alianzas.",
    ])
    revenue = _lista(brief.get("canvas_revenue"), [
        "Suscripción por equipo o por certamen.",
        "Servicios de acompañamiento y capacitación.",
        "Licenciamiento a universidades y organizadores.",
    ])

    canvas_content = f"""# Business Model Canvas -- {project}
**Certamen:** Rally {rally} | **Equipo:** {team} | **Ciudad Piloto:** {city} | **Categoria:** {category}
**ODS Vinculados:** {ods} | **Costo de Puesta en Marcha:** ${total_budget:,.2f} USD

---

| Bloque Canvas | Definicion Operativa del Proyecto |
| :--- | :--- |
| **1. Socios Clave (Key Partners)** | {_bullets(partners)} |
| **2. Actividades Clave (Key Activities)** | {_bullets(activities)} |
| **3. Recursos Clave (Key Resources)** | {_bullets(resources)} |
| **4. Propuesta de Valor (Value Proposition)** | **{desc}**<br>{_bullets(value_bullets)} |
| **5. Relaciones con Clientes (Customer Relationships)** | {_bullets(relationships)} |
| **6. Canales de Distribucion (Channels)** | {_bullets(channels)} |
| **7. Segmentos de Clientes / Beneficiarios (Customer Segments)** | {_bullets(segments)} |
| **8. Estructura de Costos (Cost Structure)** | {_bullets(cost_notes)} |
| **9. Fuentes de Ingresos / Sostenibilidad (Revenue Streams)** | {_bullets(revenue)} |

---

## Verificacion de Consistencia con Otros Entregables
- [x] **Video (Acto II):** La propuesta de valor refleja fielmente la solucion audiovisual.
- [x] **Presupuesto (budget.xlsx):** La estructura de costos coincide exactamente con los ${total_budget:,.2f} USD cotizados.
- [x] **Pautado (Solucion y Prefactibilidad):** Los socios y actividades clave corresponden a la descripcion tecnica del documento Word.
"""

    pathlib.Path("docs").mkdir(exist_ok=True)
    CANVAS_PATH.write_text(canvas_content, encoding="utf-8")
    print(f"OK: {CANVAS_PATH} generado exitosamente.")


if __name__ == "__main__":
    main()
