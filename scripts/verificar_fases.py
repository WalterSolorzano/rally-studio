#!/usr/bin/env python3
"""verificar_fases.py -- Compuerta de orden y dependencia entre las 13 etapas.

Un rally son 24/28 horas con fases encadenadas. Esta compuerta impide que la IA
entregue una etapa cuyo insumo no existe todavia, y dice que falta preguntar.

Comprueba seis cosas:
    1. Ninguna etapa tiene su artefacto si una etapa anterior no lo tiene (salto).
    2. Cada etapa cerrada dejo linea completa en docs/bitacora_fases.md.
    3. En esa linea, quien construyo y quien audito son los que el mapa declara para esa
   fase (no "cualquiera"), y distinto entre si.
    4. El auditor dejo su informe en audit/NN-auditor.md, con contenido real.
    5. La compuerta citada es un script real de scripts/ (no texto inventado).
    6. Esa compuerta pertenece a la etapa que la cita, no a otra.
    7. Esa compuerta se ejecuta ahora y sale con codigo 0 (se demuestra, no se declara).

Uso:
    python scripts/verificar_fases.py            -> compuerta completa
    python scripts/verificar_fases.py --mapa     -> mapa de dependencias
    python scripts/verificar_fases.py --fase 06  -> que falta en esa etapa
Salida: lineas "OK/FAIL <chequeo>" y codigo 1 si algo falla.
"""
from __future__ import annotations

import argparse
import json
import pathlib
import re
import subprocess
import sys

RAIZ = pathlib.Path(__file__).resolve().parent.parent
BRIEF = RAIZ / "brief.json"
BITACORA = RAIZ / "docs" / "bitacora_fases.md"
AUDIT = RAIZ / "audit"
SCRIPTS = pathlib.Path(__file__).resolve().parent

# Una fase no se cierra citando "revisado a ojo": la compuerta de la bitacora
# tiene que ser un comando que exista y se pueda volver a correr. Solo entran
# scripts que comprueban; los generadores no son compuerta aunque escriban bonito.
COMPUERTAS = {
    "validate_brief.py",
    "validate_budget.py",
    "validate_pautado.py",
    "verificar_identidad.py",
    "probar_responsive.py",
    "verificar_fases.py",
}
DECISIONES = ("aceptada", "descartada")
# Este mismo proceso se cita como indice de orden; ejecutarlo se recursaria.
NO_EJECUTAR = {"verificar_fases.py"}
TIMEOUT_COMPUERTA = 180

# Cada etapa declara: de que depende, que artefacto la cierra, quien la construye,
# quien la audita y que hay que preguntar si el artefacto no existe.
ETAPAS = [
    {
        # El certamen cuenta solo cuando el humano lo confirmo en la bitacora:
        # brief.json trae un rally_type heredado que no es una decision.
        "id": "00", "nombre": "certamen", "prev": [],
        "campo": None, "archivo": None, "solo_bitacora": True,
        "construye": "profe", "audita": "humano",
        "pregunta": ["Que certamen corre: nacional (24 h) o latam (28 h)?"],
    },
    {
        "id": "01", "nombre": "team", "prev": ["00"],
        "campo": "team_name", "archivo": None,
        "construye": "propuesta-identidad", "audita": "impeccable",
        "pregunta": [
            "Como se llama el equipo?",
            "Que universidad y ciudad?",
            "El equipo ya tiene logo, o hay que proponer identidad?",
        ],
    },
    {
        "id": "02", "nombre": "challenges", "prev": ["00"],
        "campo": "challenge_title", "archivo": None,
        "construye": "proponer-retos", "audita": "sharktank",
        "pregunta": ["Que reto eligio el equipo de la lista del comite?"],
    },
    {
        "id": "03", "nombre": "solution", "prev": ["02"],
        "campo": "solution", "archivo": None,
        "construye": "profe", "audita": "sharktank",
        "pregunta": [
            "Como resuelve el reto, en una frase?",
            "Cuales son los 2 o 3 pasos reales de la solucion?",
        ],
    },
    {
        "id": "04", "nombre": "impact", "prev": ["03"],
        "campo": "ods_ids", "archivo": None,
        "construye": "profe", "audita": "auditar-entregable",
        "pregunta": ["A quien impacta y en que municipio real?"],
    },
    {
        "id": "05", "nombre": "multi_ai", "prev": ["03"],
        "campo": None, "archivo": "research/despacho.json",
        "construye": "orquestador", "audita": "auditar-entregable",
        "pregunta": ["Que pieza quiere delegar a una IA externa?"],
    },
    {
        "id": "06", "nombre": "pautado", "prev": ["03", "04"],
        "campo": None, "archivo": "docs/pautado_draft.docx",
        "construye": "profe", "audita": "auditar-entregable",
        "pregunta": ["Faltan datos de una de las 5 secciones del pautado: cual?"],
    },
    {
        "id": "07", "nombre": "budget", "prev": ["03"],
        "campo": None, "archivo": "budget/budget.json",
        "construye": "presupuesto", "audita": "auditar-entregable",
        "pregunta": ["Que proveedor, precio y enlace respalda cada partida?"],
    },
    {
        "id": "08", "nombre": "resources", "prev": ["01"],
        "campo": None, "archivo": "assets",
        "construye": "profe", "audita": "auditar-entregable",
        "pregunta": ["Que material ya tiene el equipo: logos, fotos, videos?"],
    },
    {
        "id": "09", "nombre": "canvas", "prev": ["07"],
        "campo": None, "archivo": "docs/canvas.md",
        "construye": "profe", "audita": "auditar-entregable",
        "pregunta": ["Quienes son los socios y de donde salen los ingresos?"],
    },
    {
        "id": "10", "nombre": "script", "prev": ["06", "09"],
        "campo": None, "archivo": "script/script.md",
        "construye": "guion-storyboard", "audita": "auditar-entregable",
        "pregunta": ["Que tono, quien narra y como cierra el video?"],
    },
    {
        "id": "11", "nombre": "webdemo", "prev": ["01", "09"],
        "campo": None, "archivo": "site/index.html",
        "construye": "publicar-sitio", "audita": "impeccable + responsive",
        "pregunta": ["Que se muestra en pantalla en el video?"],
    },
    {
        "id": "12", "nombre": "timeline", "prev": ["10", "11"],
        "campo": None, "archivo": "script/shotlist.csv",
        "construye": "control-tiempo-entrega", "audita": "auditar-entregable",
        "pregunta": ["Que entregable queda pendiente de subir?"],
    },
]

CAMPOS_LLENOS = lambda v: bool(v) and v not in ("", [], 0, {}, None)

# Cada etapa admite solo la compuerta que prueba SU artefacto. Citar la de otra
# fase no cierra nada: el trabajo que se dice probado esta en otro lado.
COMPUERTAS_DE = {
    "00": ["verificar_fases.py"],
    "01": ["verificar_identidad.py"],
    "02": ["validate_brief.py"],
    "03": ["validate_brief.py"],
    "04": ["validate_brief.py"],
    "05": ["validate_brief.py"],
    "06": ["validate_pautado.py"],
    "07": ["validate_budget.py"],
    "08": ["verificar_identidad.py"],
    "09": ["validate_budget.py"],
    "10": ["validate_pautado.py"],
    "11": ["verificar_identidad.py", "probar_responsive.py"],
    "12": ["validate_brief.py", "validate_budget.py", "validate_pautado.py"],
}
for _etapa in ETAPAS:
    _etapa["compuertas"] = COMPUERTAS_DE[_etapa["id"]]


def cargar_brief() -> dict:
    if not BRIEF.exists():
        return {}
    return json.loads(BRIEF.read_text(encoding="utf-8-sig"))


def _texto_util(ruta: pathlib.Path) -> bool:
    """Un documento lleno de `_pendiente_` no es un artefacto: es un hueco con nombre."""
    texto = ruta.read_text(encoding="utf-8", errors="ignore")
    lineas = [l.strip() for l in texto.splitlines() if l.strip()]
    if not lineas:
        return False
    vacias = sum(1 for l in lineas if "_pendiente_" in l or l in ("[pendiente]", "pendiente"))
    return vacias / len(lineas) < 0.4


def _carpeta_con_assets(carpeta: pathlib.Path) -> bool:
    """Solo cuenta un asset nombrado como manda la regla: asset_<shot>_<desc>.<ext>."""
    return any(p.is_file() and p.name.startswith("asset_") for p in carpeta.rglob("*"))


def existe(etapa: dict, brief: dict, bitacora: dict) -> bool:
    """Una etapa existe si su campo del brief esta lleno o su artefacto vivo tiene contenido."""
    if etapa.get("solo_bitacora"):
        return etapa["id"] in bitacora
    if etapa["campo"] and CAMPOS_LLENOS(brief.get(etapa["campo"])):
        return True
    destino = etapa["archivo"]
    if not destino:
        return False
    ruta = RAIZ / destino
    if not ruta.exists():
        return False
    if ruta.is_dir():
        return _carpeta_con_assets(ruta)
    if ruta.stat().st_size <= 200:
        return False
    sufijo = ruta.suffix.lower()
    if sufijo in (".md", ".json", ".csv", ".txt"):
        return _texto_util(ruta)
    if sufijo == ".html":
        # El stub del generador no es una pagina: la real lleva hero generado.
        return "hero-promesa" in ruta.read_text(encoding="utf-8", errors="ignore")
    return ruta.stat().st_size > 2000


def leer_bitacora() -> dict[str, dict[str, str]]:
    """Ultima linea de cada fase. Formato: fase|artefacto|compuerta|decision|construyo|audito"""
    if not BITACORA.exists():
        return {}
    filas: dict[str, dict[str, str]] = {}
    for linea in BITACORA.read_text(encoding="utf-8").splitlines():
        if "|" not in linea:
            continue
        partes = [p.strip() for p in linea.strip().strip("|").split("|")]
        if len(partes) != 6 or not partes[0][:2].isdigit():
            continue
        filas[partes[0][:2]] = dict(zip(
            ("fase", "artefacto", "compuerta", "decision", "construyo", "audito"), partes))
    return filas


def _firmas(valor: str) -> set[str]:
    """'impeccable + responsive' son dos firmas: se comparan por separado."""
    partes = re.split(r"\s*[+,/]\s*", (valor or "").strip())
    return {p.strip().strip("`'\"").lower() for p in partes if p.strip()}


def informe_auditoria(etapa: dict) -> str:
    """El auditor deja constancia en audit/NN-auditor.md; sin informe, la firma es una promesa."""
    if _firmas(etapa["audita"]) == {"humano"}:
        return ""
    relativa = "audit/%s-auditor.md" % etapa["id"]
    archivo = AUDIT / ("%s-auditor.md" % etapa["id"])
    if not archivo.exists():
        return "falta %s: %s audita pero no dejo informe" % (relativa, etapa["audita"])
    if archivo.stat().st_size <= 200 or not _texto_util(archivo):
        return "%s no es un informe: vacio o con mas del 40 %% de _pendiente_" % relativa
    return ""


def firma_valida(etapa: dict, fila: dict) -> str:
    """El mapa manda: se firma con quien el mapa declara, no con cualquiera."""
    construyo, audito = _firmas(fila["construyo"]), _firmas(fila["audito"])
    esperado_c, esperado_a = _firmas(etapa["construye"]), _firmas(etapa["audita"])
    if construyo != esperado_c:
        return "construyo '%s' pero la fase la construye '%s'" % (
            fila["construyo"], etapa["construye"])
    if audito != esperado_a:
        return "audito '%s' pero la fase la audita '%s'" % (
            fila["audito"], etapa["audita"])
    return ""


def compuertas_citadas(valor: str) -> list[str]:
    """Nombres .py citados en el campo compuerta, en orden."""
    return [t.strip("`'\"") for t in re.findall(r"[A-Za-z0-9_\-]+\.py", valor or "")]


def compuerta_valida(valor: str) -> str:
    """Devuelve el motivo del fallo, o cadena vacia si la compuerta es real."""
    citados = compuertas_citadas(valor)
    if not citados:
        return "sin comando .py citado (la compuerta se demuestra, no se declara)"
    for nombre in citados:
        if nombre not in COMPUERTAS:
            return "%s no es compuerta registrada" % nombre
        if not (SCRIPTS / nombre).exists():
            return "%s no existe en scripts/" % nombre
    return ""


def ejecutar_compuerta(valor: str, timeout: int = TIMEOUT_COMPUERTA) -> str:
    """Corre el comando citado de verdad. Devuelve el motivo del fallo, o vacio."""
    limpio = (valor or "").replace("`", " ").split()
    idx = next((i for i, t in enumerate(limpio) if t.endswith(".py")), None)
    if idx is None:
        return "sin comando .py citado"
    nombre = limpio[idx]
    if nombre in NO_EJECUTAR:
        return ""
    if nombre not in COMPUERTAS:
        return "%s no es compuerta registrada" % nombre
    extra = [t for t in limpio[idx + 1:] if not t.startswith("|")]
    try:
        res = subprocess.run(
            [sys.executable, "-X", "utf8", str(SCRIPTS / nombre)] + extra,
            cwd=str(RAIZ), capture_output=True, text=True,
            encoding="utf-8", errors="ignore", timeout=timeout,
        )
    except subprocess.TimeoutExpired:
        return "%s no termino en %s s" % (nombre, timeout)
    except OSError as exc:
        return "%s no se pudo ejecutar: %s" % (nombre, exc)
    if res.returncode != 0:
        salida = [l.strip() for l in (res.stdout or res.stderr or "").splitlines() if l.strip()]
        cola = salida[-1] if salida else "sin salida"
        return "%s salio con codigo %d: %s" % (nombre, res.returncode, cola[:100])
    return ""


def mapa() -> None:
    print("fase | etapa      | depende de | construye              | audita")
    for e in ETAPAS:
        print("%-4s | %-10s | %-10s | %-22s | %s" % (
            e["id"], e["nombre"], ",".join(e["prev"]) or "-", e["construye"], e["audita"]))


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--mapa", action="store_true")
    ap.add_argument("--fase")
    args = ap.parse_args()

    if args.mapa:
        mapa()
        return 0

    brief = cargar_brief()
    bitacora = leer_bitacora()
    fallos = []

    def ok(msg):
        print("OK   " + msg)

    def fail(msg):
        print("FAIL " + msg)
        fallos.append(msg)

    if args.fase:
        etapa = next((e for e in ETAPAS if e["id"] == args.fase), None)
        if not etapa:
            fail("fase %s no existe" % args.fase)
            return 1
        print("fase %s - %s" % (etapa["id"], etapa["nombre"]))
        print("  depende de : %s" % (",".join(etapa["prev"]) or "-"))
        print("  construye  : %s" % etapa["construye"])
        print("  audita     : %s" % etapa["audita"])
        print("  compuertas : %s" % ",".join(etapa["compuertas"]))
        print("  existe     : %s" % ("si" if existe(etapa, brief, bitacora) else "no"))
        if not existe(etapa, brief, bitacora):
            for i, p in enumerate(etapa["pregunta"], 1):
                print("  pregunta %d : %s" % (i, p))
        return 0

    # 1. ningun salto: si una etapa existe, sus predecesoras deben existir
    for e in ETAPAS:
        if not existe(e, brief, bitacora):
            continue
        faltan = [p for p in e["prev"] if not existe(next(x for x in ETAPAS if x["id"] == p), brief, bitacora)]
        if faltan:
            fail("etapa saltada: %s %s existe sin %s" % (
                e["id"], e["nombre"], ",".join(faltan)))
        else:
            ok("orden %s %s" % (e["id"], e["nombre"]))

    # 2. bitacora: toda etapa existente dejo linea completa
    for e in ETAPAS:
        if not existe(e, brief, bitacora):
            continue
        fila = bitacora.get(e["id"])
        if not fila:
            fail("sin bitacora: etapa %s %s no dejo linea" % (e["id"], e["nombre"]))
            continue
        vacios = [k for k, v in fila.items() if not v]
        if vacios:
            fail("bitacora incompleta %s: falta %s" % (e["id"], ",".join(vacios)))
            continue
        # 2b. la compuerta citada es un script real, no una frase
        motivo = compuerta_valida(fila["compuerta"])
        if motivo:
            fail("compuerta inventada %s: %s" % (e["id"], motivo))
            continue
        # 2c. la compuerta citada prueba esta etapa, no otra
        ajenas = [c for c in compuertas_citadas(fila["compuerta"]) if c not in e["compuertas"]]
        if ajenas:
            fail("compuerta ajena a la fase %s %s: %s (admitidas: %s)" % (
                e["id"], e["nombre"], ",".join(ajenas), ",".join(e["compuertas"])))
            continue
        # 2d. la compuerta se corre ahora: si no pasa, la fase no cerro
        motivo = ejecutar_compuerta(fila["compuerta"])
        if motivo:
            fail("compuerta no pasa %s %s: %s" % (e["id"], e["nombre"], motivo))
            continue
        if not fila["decision"].lower().startswith(DECISIONES):
            fail("decision invalida %s: '%s' (aceptada o descartada)" % (
                e["id"], fila["decision"]))
            continue
        # 3. se firma con quien el mapa declara, y nadie se audita solo
        motivo = firma_valida(e, fila)
        if motivo:
            fail("firma incorrecta %s %s: %s" % (e["id"], e["nombre"], motivo))
            continue
        # 3b. el auditor existe: dejo informe en audit/NN-auditor.md
        motivo = informe_auditoria(e)
        if motivo:
            fail("auditoria sin constancia %s %s: %s" % (e["id"], e["nombre"], motivo))
            continue
        ok("bitacora %s %s -> %s construyo, %s audito" % (
            e["id"], e["nombre"], e["construye"], e["audita"]))

    # 4. siguiente etapa, con las preguntas que desbloquean
    siguiente = next((e for e in ETAPAS if not existe(e, brief, bitacora)), None)
    if siguiente is None:
        ok("trece etapas con artefacto: nada que desbloquear")
    else:
        print("\nSIGUIENTE: fase %s %s (construye %s, audita %s)" % (
            siguiente["id"], siguiente["nombre"], siguiente["construye"], siguiente["audita"]))
        for i, p in enumerate(siguiente["pregunta"], 1):
            print("  pregunta %d: %s" % (i, p))

    if fallos:
        print("\n%d fallo(s)" % len(fallos))
        return 1
    print("\nOK: etapas en orden, bitacora completa, compuertas de la fase ejecutadas y en verde, firmas del mapa, informe del auditor y auditor distinto del constructor")
    return 0


if __name__ == "__main__":
    sys.exit(main())
