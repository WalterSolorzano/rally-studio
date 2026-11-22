#!/usr/bin/env python3
"""
validate_pautado.py -- Valida y cuenta caracteres (con espacios) por seccion en docs/pautado_draft.docx.

Delegado en checks/campo_chars.py: una sola fuente de verdad para los limites.
Lee los limites de plantillas/pautado_template.docx cuando la plantilla los declara.
Regla innegociable: si alguna seccion excede el maximo, devuelve codigo 1.
"""
import json
import pathlib
import re
import sys
from comun import utf8
utf8()

RAIZ = pathlib.Path(__file__).resolve().parent.parent
if str(RAIZ) not in sys.path:
    sys.path.insert(0, str(RAIZ))

from checks.campo_chars import (  # noqa: E402
    limites_para,
    revisar,
    secciones_por_encabezado,
    secciones_por_marcador,
    texto_docx,
)

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


def nombre_del_proyecto() -> str:
    """Nombre aprobado en el brief. Vacio mientras el equipo no lo defina."""
    try:
        datos = json.loads(pathlib.Path("brief.json").read_text(encoding="utf-8"))
    except (OSError, ValueError):
        return ""
    return str(datos.get("project_name") or "").strip()


def secciones_con_nombre_repetido(texto: str, nombre: str) -> list[str]:
    """Secciones donde el nombre aparece mas de una vez.

    Regla 3 de AGENTS.md: una vez por seccion. Repetirlo en cada parrafo lo
    convierte en ruido y gasta caracteres del tope. Con el nombre vacio no hay
    nada que medir: el brief espera al equipo y eso no es un error del pautado.
    """
    if not nombre:
        return []
    secciones = secciones_por_marcador(texto)
    if not secciones:
        secciones = secciones_por_encabezado(texto)
    patron = re.compile(re.escape(nombre), re.IGNORECASE)
    return sorted(
        campo for campo, cuerpo in secciones.items() if len(patron.findall(cuerpo)) > 1
    )


def main():
    if not DRAFT_PATH.exists():
        print("ERROR: docs/pautado_draft.docx no existe. Ejecuta python scripts/gen_pautado.py primero.")
        sys.exit(1)

    evento = rally_actual()
    try:
        hallazgos, conteos = revisar(DRAFT_PATH, TEMPLATE_PATH, evento)
    except Exception as exc:
        # Un docx truncado (Word cerrado a la fuerza, copia a medias) reventaba con
        # PackageNotFoundError. El equipo necesita la frase, no la pila de llamadas.
        print(f"ERROR: {DRAFT_PATH} no se puede abrir como Word ({exc}). "
              "Regenera el documento con python scripts/gen_pautado.py.")
        sys.exit(1)
    limites = limites_para(evento)

    print("\n" + "=" * 60)
    print("  AUDITORIA DE CARACTERES -- REPORTE PAUTADO (CON ESPACIOS)")
    print("=" * 60)

    # Regla 3 de AGENTS.md, medida sobre el texto entregado y no sobre la nota.
    nombre = nombre_del_proyecto()
    try:
        repetido = secciones_con_nombre_repetido(texto_docx(DRAFT_PATH), nombre)
    except Exception:
        repetido = []
    if repetido:
        print()
        print(f"  [X] El nombre del proyecto ('{nombre}') se repite mas de una vez en:")
        for campo in repetido:
            print(f"      {campo.upper()}")
        print("  -> Regla 3: una mencion por seccion como maximo. Repetirlo gasta")
        print("     caracteres del tope y convierte el nombre en ruido. Dejalo en la")
        print("     seccion donde presenta la solucion y quitalo del resto.")
        sys.exit(1)

    # Un pautado sin secciones reconocibles no se valida: antes, en modo Nacional
    # (sin topes) salia «VALIDACION EXITOSA» sobre un documento vacio, porque el
    # unico hallazgo critico vivia en `hallazgos` y ese bloque venia despues del
    # `return` del rally sin topes.
    criticos = [h for h in hallazgos if h["gravedad"] == "critico"]
    if criticos:
        print()
        for hallazgo in criticos:
            print(f"  [X] {hallazgo.get('campo', 'general')}: {hallazgo['que']}. {hallazgo['hacer']}")
        print("\n  ERROR: Ajusta los textos antes de enviar a SIRLI.")
        sys.exit(1)

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

    # Marcadores internos a la vista son sintoma de documento sin rellenar:
    # `{SEC_PROBLEMA}` no es texto para el jurado, y contarlos como contenido
    # hacia que un pautado vacio pasara la validacion. Se lee el documento entero
    # (parrafos y tablas): `[PENDIENTE]` dentro de una tabla tambien llega al jurado.
    try:
        texto_doc = texto_docx(DRAFT_PATH)
    except Exception:
        texto_doc = ""
    marcadores = sorted({t for t in ("{SEC_PROBLEMA}", "{SEC_SOLUCION}", "{SEC_IMPACTO}",
                                     "{SEC_INNOVACION}", "{SEC_PREFACTIBILIDAD}", "{SEC_END}",
                                     "[PENDIENTE]")
                         if t in texto_doc})
    if marcadores:
        print()
        print("  [X] El documento conserva marcadores de plantilla sin reemplazar:")
        for marca in marcadores:
            print(f"      {marca}")
        print("  -> Escribe el texto de cada seccion en la interfaz o en "
              "docs/pautado_draft.docx antes de enviar a SIRLI.")
        sys.exit(1)

    if hallazgos:
        print()
        for hallazgo in hallazgos:
            print(f"  -> {hallazgo.get('campo', 'general')}: {hallazgo['que']}. {hallazgo['hacer']}")
        print("\n  ERROR: Ajusta los textos antes de enviar a SIRLI.")
        sys.exit(1)

    print("\n  VALIDACION EXITOSA: Los campos analizados cumplen la rubrica de caracteres.")


if __name__ == "__main__":
    main()
