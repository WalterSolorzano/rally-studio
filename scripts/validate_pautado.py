#!/usr/bin/env python3
"""
validate_pautado.py -- Valida y cuenta caracteres (con espacios) por seccion en docs/pautado_draft.docx.
Regla innegociable: si alguna seccion excede el limite maximo, devuelve codigo de error 1.
"""
import sys
import io
import re
import pathlib
import docx

if sys.platform == "win32":
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")

DRAFT_PATH = pathlib.Path("docs/pautado_draft.docx")

# Limites oficiales con espacios
LIMITS = {
    "problema": 1250,
    "solucion": 1250,
    "prefactibilidad": 1000,
    "innovacion": 1000,
    "impacto": 1500
}

def main():
    if not DRAFT_PATH.exists():
        print("ERROR: docs/pautado_draft.docx no existe. Ejecuta python scripts/gen_pautado.py primero.")
        sys.exit(1)

    try:
        doc = docx.Document(DRAFT_PATH)
    except Exception as e:
        print(f"ERROR: No se pudo abrir {DRAFT_PATH}: {e}")
        sys.exit(1)

    full_text = "\n".join([p.text for p in doc.paragraphs])
    tables_text = "\n".join([" ".join([c.text for c in row.cells]) for table in doc.tables for row in table.rows])
    combined_text = full_text + "\n" + tables_text

    print("\n" + "═" * 60)
    print("  AUDITORIA DE CARACTERES -- REPORTE PAUTADO (CON ESPACIOS)")
    print("═" * 60)

    has_errors = False
    found_any = False

    for section, limit in LIMITS.items():
        pattern = rf"\{{SEC_{section.upper()}\}}(.*?)\{{SEC_END\}}"
        match = re.search(pattern, combined_text, re.DOTALL | re.IGNORECASE)
        
        if match:
            found_any = True
            content = match.group(1).strip()
            count = len(content)
            diff = limit - count
            status = "OK" if diff >= 0 else "EXCEDIDO"
            if diff < 0:
                has_errors = True
                print(f"  [X] {section.upper():<16}: {count:>5} / {limit:<5} ({diff} chars) -> {status}")
            else:
                pct = (count / limit) * 100
                print(f"  [v] {section.upper():<16}: {count:>5} / {limit:<5} ({pct:5.1f}%) -> {status}")
        else:
            # Buscar por encabezados de parrafos
            print(f"  [?] {section.upper():<16}: Etiqueta {{SEC_{section.upper()}}} no encontrada directamente.")

    if not found_any:
        print("\n  NOTA: No se encontraron marcadores {SEC_...}. Evaluando longitud global del texto.")
        total_len = len(combined_text.strip())
        print(f"  Total caracteres detectados: {total_len} (Limite global recomendado: ~6,000)")
        if total_len > 7000:
            print("  WARN: El documento supera los 7,000 caracteres totales.")
            has_errors = True

    if has_errors:
        print("\n  ERROR: Ajusta los textos antes de enviar a SIRLI.")
        sys.exit(1)
    else:
        print("\n  VALIDACION EXITOSA: Los campos analizados cumplen con la rubrica de caracteres.")

if __name__ == "__main__":
    main()
