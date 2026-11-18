#!/usr/bin/env python3
"""
validate_pautado.py -- Valida y cuenta caracteres (con espacios) por seccion en docs/pautado_draft.docx.

Delegado en checks/campo_chars.py: una sola fuente de verdad para los limites.
Lee los limites de plantillas/pautado_template.docx cuando la plantilla los declara.
Regla innegociable: si alguna seccion excede el maximo, devuelve codigo 1.
"""
import json
import pathlib
import sys
from comun import utf8
utf8()

RAIZ = pathlib.Path(__file__).resolve().parent.parent
if str(RAIZ) not in sys.path:
    sys.path.insert(0, str(RAIZ))

from checks.campo_chars import limites_para, revisar  # noqa: E402

DRAFT_PATH = pathlib.Path("docs/pautado_draft.docx")
# Un solo Word de plantilla: el de `plantillas/`. Los límites se leen de ahí.
TEMPLATE_PATH = pathlib.Path("plantillas/pautado_template.docx")


def rally_actual() -> str:
    """Tipo de rally del brief; sin brief se asume Latam (el que fija topes)."""
    try:
        datos = json.loads(pathlib.Path("brief.json").read_text(encoding="utf-8"))
    except (OSError, ValueError):
        return "latam"
    return (datos.get("rally_type") or "latam").strip().lower()


def main():
    if not DRAFT_PATH.exists():
        print("ERROR: docs/pautado_draft.docx no existe. Ejecuta python scripts/gen_pautado.py primero.")
        sys.exit(1)

    evento = rally_actual()
    hallazgos, conteos = revisar(DRAFT_PATH, TEMPLATE_PATH, evento)
    limites = limites_para(evento)

    print("\n" + "=" * 60)
    print("  AUDITORIA DE CARACTERES -- REPORTE PAUTADO (CON ESPACIOS)")
    print("=" * 60)

    if not limites:
        print(f"  Evento '{evento}': este rally no fija tope por seccion.")
        for campo, cuenta in sorted(conteos.items()):
            print(f"  [v] {campo.upper():<16}: {cuenta:>5} caracteres")
        print("\n  VALIDACION EXITOSA: se cuentan los caracteres, no se recortan.")
        return

    for campo, limite in limites.items():
        cuenta = conteos.get(campo)
        if cuenta is None:
            print(f"  [?] {campo.upper():<16}: campo no encontrado.")
            continue
        faltante = limite - cuenta
        if faltante < 0:
            print(f"  [X] {campo.upper():<16}: {cuenta:>5} / {limite:<5} ({faltante} chars) -> EXCEDIDO")
        else:
            pct = (cuenta / limite) * 100
            print(f"  [v] {campo.upper():<16}: {cuenta:>5} / {limite:<5} ({pct:5.1f}%) -> OK")

    if hallazgos:
        print()
        for hallazgo in hallazgos:
            print(f"  -> {hallazgo.get('campo', 'general')}: {hallazgo['que']}. {hallazgo['hacer']}")
        print("\n  ERROR: Ajusta los textos antes de enviar a SIRLI.")
        sys.exit(1)

    print("\n  VALIDACION EXITOSA: Los campos analizados cumplen la rubrica de caracteres.")


if __name__ == "__main__":
    main()
