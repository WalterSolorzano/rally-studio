#!/usr/bin/env python3
"""
validate_brief.py -- Falla con SystemExit si brief.json esta incompleto.
Ejecutar antes de cualquier generador.
"""
import json
import sys
import pathlib

from comun import utf8
utf8()

BRIEF_PATH = pathlib.Path("brief.json")

REQUIRED_KEYS = [
    "project_name",
    "team_name",
    "university",
    "city",
    "category",
    "challenge_id",
    "challenge_title",
    "rally_type",
    "hours_total",
    "has_logo",
    "has_palette",
    "has_components",
    "deliverable_type",
    "description_one_line",
    "ods_ids",
]

VALID_RALLY_TYPES = {"nacional", "latam"}
VALID_DELIVERABLE_TYPES = {"3d", "web", "both", "none"}

# Un municipio de verdad tiene nombre propio. Estos son el pais, la region o el modo.
MUNICIPIOS_GENERICOS = {
    "", "nicaragua", "nacional", "latam", "latinoamerica", "latinoamérica",
    "america latina", "américa latina", "centroamerica", "centroamérica",
}

# Siglas que un jurado internacional no tiene por que conocer.
SIGLAS_LOCALES = ("INATEC", "MINJUVE", "TELCOR", "MEFCCA", "CNU", "SIRLI", "CONFEDI")


def avisos_de_contexto(brief: dict) -> list[str]:
    """Reglas de certamen que no invalidan el brief pero deben avisarse.

    Item 397 del plan: el jurado Nacional exige municipio real y enlace con el Plan
    Nacional 2022-2026. Item 398: en Latam el presupuesto va en USD y sin siglas
    locales. Ninguna de las dos cosas se medía.
    """
    avisos: list[str] = []
    modo = str(brief.get("rally_type") or "").strip().lower()
    ciudad = str(brief.get("city") or "").strip()
    axis = str(brief.get("national_plan_axis") or "").strip()

    if modo == "nacional":
        if ciudad.lower() in MUNICIPIOS_GENERICOS:
            avisos.append(
                f"city='{ciudad}' no es un municipio real. El jurado Nacional pide "
                "anclaje territorial expreso (un municipio, no el pais)."
            )
        if not axis:
            avisos.append(
                "Falta 'national_plan_axis': el jurado Nacional exige enlazar con el "
                "Plan Nacional de Lucha contra la Pobreza 2022-2026."
            )

    if modo == "latam":
        if axis:
            avisos.append(
                "'national_plan_axis' declarado en un rally Latam: ese eje es del plan "
                "nicaraguense y el jurado es internacional."
            )
        if brief.get("exchange_rate_bcn"):
            avisos.append(
                "'exchange_rate_bcn' declarado en un rally Latam: el presupuesto va en "
                "USD, sin tasa local."
            )
        texto = json.dumps(
            {k: brief.get(k) for k in ("project_name", "challenge_title", "description_one_line")},
            ensure_ascii=False,
        ).lower()
        locales = [s for s in SIGLAS_LOCALES if s.lower() in texto]
        if locales:
            avisos.append(
                f"Siglas locales en un rally Latam: {', '.join(locales)}. Un evaluador "
                "extranjero no las conoce; nombra la institucion completa o quitala."
            )
    return avisos


def main():
    if not BRIEF_PATH.exists():
        print("❌ brief.json no existe.")
        print("   Ejecuta: python scripts/init_brief.py")
        sys.exit(1)

    try:
        brief = json.loads(BRIEF_PATH.read_text(encoding="utf-8"))
    except json.JSONDecodeError as e:
        print(f"❌ brief.json tiene JSON inválido: {e}")
        sys.exit(1)

    errors = []

    # Campos requeridos
    for key in REQUIRED_KEYS:
        val = brief.get(key)
        if val is None or val == "" or val == []:
            errors.append(f"Campo faltante o vacío: '{key}'")

    # Validaciones de valores
    rally_type = brief.get("rally_type", "")
    if rally_type not in VALID_RALLY_TYPES:
        errors.append(f"rally_type='{rally_type}' inválido. Debe ser: {VALID_RALLY_TYPES}")

    deliverable = brief.get("deliverable_type", "")
    if deliverable not in VALID_DELIVERABLE_TYPES:
        errors.append(
            f"deliverable_type='{deliverable}' inválido. Debe ser uno de: "
            "3d (solo modelo 3D), web (solo sitio demo), both (las dos cosas) "
            "o none (ninguna)."
        )

    hours = brief.get("hours_total", 0)
    if not isinstance(hours, (int, float)) or hours <= 0:
        errors.append("hours_total debe ser un número positivo")

    ods = brief.get("ods_ids", [])
    if not isinstance(ods, list) or len(ods) == 0:
        errors.append("ods_ids debe ser una lista con al menos un ODS (ej. ['ODS11'])")

    avisos = avisos_de_contexto(brief)

    if errors:
        print("❌ brief.json incompleto o con errores:\n")
        for e in errors:
            print(f"   · {e}")
        print("\n   Ejecuta: python scripts/init_brief.py")
        sys.exit(1)

    print(f"✅ brief.json válido")
    for aviso in avisos:
        print(f"   ⚠️  {aviso}")
    print(f"   Proyecto : {brief['project_name']}")
    print(f"   Equipo   : {brief['team_name']}")
    print(f"   Rally    : {brief['rally_type'].upper()} — {brief['hours_total']}h")
    print(f"   Desafío  : {brief['challenge_id']} · {brief['challenge_title']}")
    print(f"   ODS      : {', '.join(brief['ods_ids'])}")


if __name__ == "__main__":
    main()
