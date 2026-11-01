#!/usr/bin/env python3
"""Motor de soluciones para retos del Rally.

Regla de negocio: el reto lo aporta el usuario (o el comité). Este motor NUNCA
propone retos: solo construye soluciones aplicables para un reto dado, fundadas
en casos ganadores reales (2019-2026) y en el índice SIRLI (2017-2026).

Salida: JSON con 1-3 rutas de solución por reto. Cada ruta cita precedente,
recursos, ventana de 24/28 h, impacto verificable, encaje de rúbrica y riesgo.
Lo que no tiene fuente se etiqueta; nunca se inventa.
"""
from __future__ import annotations

import argparse
import json
import re
import sys
import unicodedata
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
RETOS_PATH = ROOT / "research" / "challenges.json"
CASOS_PATH = ROOT / "knowledge" / "retos_razonamiento.json"
BRIEF_PATH = ROOT / "brief.json"
WINNERS_PATH = ROOT / "research" / "sirli" / "winners.jsonl"
GRAFO_PATH = ROOT / "graphify-out" / "graph.json"

CATEGORIAS = {
    "nacional": ["tecnologica", "social", "procesos"],
    "latam": ["innovacion", "impacto_social"],
}

KEYWORDS = {
    "social": {
        "comunidad", "comunidades", "inclusion", "discapacidad", "salud",
        "educacion", "mujer", "mujeres", "juventud", "jovenes", "adulto",
        "mayor", "vivienda", "alimentacion", "artesania", "artesanos",
        "cultura", "agua", "saneamiento", "rural", "barrio", "familia",
        "seguridad", "vulnerable", "indigena", "afro", "cuidado",
    },
    "procesos": {
        "proceso", "procesos", "logistica", "trazabilidad", "cadena",
        "gestion", "organizacion", "cooperativa", "administracion",
        "comercio", "turismo", "produccion", "calidad", "beneficio",
        "postcosecha", "distribucion", "servicio", "operacion",
    },
    "tecnologica": {
        "sensor", "sensores", "telemetria", "iot", "inteligencia",
        "vision", "robot", "energia", "material", "materiales",
        "prototipo", "hardware", "software", "app", "plataforma",
        "automatizacion", "electronica", "mecanica", "dron", "impresion",
        "3d", "bateria", "panel", "solar", "valvula", "bomba",
    },
}

STOP = set("""
de la el los las un una unos unas y o u en con por para del al que se su sus
como mas menos sobre entre desde hasta durante sin tras cada cual cuales
""".split())

COMPONENTES = [
    ("lorawan", "Módulo LoRaWAN"), ("lora", "Módulo LoRa"),
    ("esp32", "Placa ESP32"), ("arduino", "Placa Arduino"),
    ("sensor", "Sensores"), ("telemetria", "Telemetría"),
    ("panel solar", "Panel solar"), ("solar", "Panel solar"),
    ("bateria", "Batería"), ("bomba", "Bomba"),
    ("valvula", "Válvula"), ("filtro", "Filtro"),
    ("tanque", "Tanque"), ("estructura", "Estructura"),
    ("modulo", "Módulos"), ("app", "Aplicación móvil"),
    ("plataforma", "Plataforma digital"), ("camara", "Cámara"),
    ("vision artificial", "Visión artificial"), ("motor", "Motor"),
    ("compost", "Compost"), ("biogas", "Biogás"),
    ("bambu", "Bambú"), ("tetra pak", "Tetra Pak reciclado"),
    ("impresion 3d", "Impresión 3D"), ("plc", "PLC"),
    ("purificacion", "Purificación de agua"), ("riego", "Riego"),
]

RUBRICA = {
    "nacional": [
        {"criterio": "Grado de Innovación, Creatividad y Hibridación Tecnológica", "puntos": 25},
        {"criterio": "Impacto Social, Territorial y Alineación con Políticas Públicas", "puntos": 25},
        {"criterio": "Viabilidad Técnica, Operativa y Uso de Recursos Locales", "puntos": 20},
        {"criterio": "Prefactibilidad Económica, Sostenibilidad y Modelo Canvas", "puntos": 15},
        {"criterio": "Calidad del Documento, Video Pitch y Coherencia de Marca", "puntos": 15},
    ],
    "latam": [
        {"criterio": "Grado de Innovación", "puntos": 30},
        {"criterio": "Impacto Positivo en la Sociedad", "puntos": 20},
        {"criterio": "Prefactibilidad Económica, Social y Ambiental", "puntos": 20},
        {"criterio": "Viabilidad Técnica", "puntos": 20},
        {"criterio": "Calidad de la Presentación", "puntos": 10},
    ],
}

VENTANAS = {
    "nacional": {
        "duracion": "24 h",
        "plan": [
            {"tramo": "0-2 h", "actividad": "Leer el reto y fijar beneficiario, restricción y métrica"},
            {"tramo": "2-5 h", "actividad": "Elegir ruta y dibujar arquitectura + BOM"},
            {"tramo": "5-14 h", "actividad": "Prototipo funcional y prueba física mínima"},
            {"tramo": "14-18 h", "actividad": "Medir, corregir y calcular costo unitario"},
            {"tramo": "18-22 h", "actividad": "Pautado, canvas y video de 120 s"},
            {"tramo": "22-24 h", "actividad": "Checklist SIRLI y entrega"},
        ],
    },
    "latam": {
        "duracion": "28 h",
        "plan": [
            {"tramo": "0-2 h", "actividad": "Leer el reto y fijar beneficiario, restricción y métrica"},
            {"tramo": "2-6 h", "actividad": "Arquitectura modular, BOM y plan de validación"},
            {"tramo": "6-16 h", "actividad": "Prototipo y prueba de concepto"},
            {"tramo": "16-21 h", "actividad": "Medición, costo unitario y replicabilidad"},
            {"tramo": "21-25 h", "actividad": "Pautado, canvas y video de 120 s"},
            {"tramo": "25-28 h", "actividad": "Checklist SIRLI y entrega"},
        ],
    },
}


def _norm(texto: str) -> str:
    texto = unicodedata.normalize("NFD", str(texto).lower())
    return "".join(c for c in texto if unicodedata.category(c) != "Mn")


def _tokens(texto: str) -> set[str]:
    return {t for t in re.findall(r"[a-z0-9]+", _norm(texto)) if len(t) > 2 and t not in STOP}


def cargar_json(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


def cargar_retos(path: Path = RETOS_PATH) -> list[dict]:
    if not path.exists():
        raise SystemExit(f"No existe {path}. El usuario debe aportar los retos primero.")
    retos = cargar_json(path)
    if not isinstance(retos, list) or not retos:
        raise SystemExit(
            "research/challenges.json esta vacio. Este motor no crea retos: "
            "ingesta los retos del usuario con scripts/ingest_challenges.py."
        )
    return retos


def importar_desde_brain(path: Path = ROOT / "brain" / "corpus" / "retos.md") -> list[dict]:
    """Lee brain/corpus/retos.md (registros del comité) y devuelve retos estructurados."""
    if not path.exists():
        raise SystemExit(f"No existe {path}. No hay retos del comité para importar.")
    texto = path.read_text(encoding="utf-8", errors="replace")
    bloques = re.split(r"^##\s+Registro\s+\d+\s*$", texto, flags=re.M)[1:]
    retos = []
    for bloque in bloques:
        def campo(nombre: str) -> str:
            m = re.search(rf"\*\*{nombre}\*\*:\s*(.+)", bloque)
            return m.group(1).strip() if m else ""

        seccion_ods = re.search(r"###\s+ods ids\s*(.*?)(?:\n\s*[-*]\s*\*\*|\Z)", bloque, re.S)
        ods = re.findall(r"ODS\s*\d+", seccion_ods.group(1), re.I) if seccion_ods else []
        reto = {
            "id": campo("id"),
            "title": campo("title"),
            "description": campo("description"),
            "category_fit": campo("category fit"),
            "ods_ids": [o.upper() for o in ods],
            "uses_local_resources": campo("uses local resources").lower() in ("si", "sí", "true"),
            "hardware_feasible_24h": campo("hardware feasible 24h").lower() in ("si", "sí", "true"),
            "prior_winner_precedent": campo("prior winner precedent"),
            "notes": campo("notes"),
        }
        if reto["id"] and reto["title"]:
            retos.append(reto)
    if not retos:
        raise SystemExit(f"{path} no tiene registros '## Registro N' legibles.")
    return retos


def cargar_casos(path: Path = CASOS_PATH) -> list[dict]:
    if not path.exists():
        raise SystemExit(f"No existe {path}. Falta el corpus de razonamiento de ganadores.")
    data = cargar_json(path)
    casos = data.get("casos", data) if isinstance(data, dict) else data
    if not casos:
        raise SystemExit(f"{path} no tiene casos.")
    return casos


def clasificar(reto: dict, certamen: str, forzada: str | None = None) -> tuple[str, str]:
    """Devuelve (categoria, justificacion) dentro de la taxonomia del certamen."""
    validas = CATEGORIAS[certamen]
    if forzada:
        if forzada not in validas:
            raise ValueError(f"Categoria '{forzada}' no valida para {certamen}. Use: {', '.join(validas)}")
        return forzada, "Definida por el equipo."

    fit = _norm(reto.get("category_fit", ""))
    if certamen == "nacional":
        if "social" in fit:
            return "social", "El banco clasifica el reto como social."
        if "tecnolog" in fit:
            return "tecnologica", "El banco clasifica el reto como tecnologico."
        if "proceso" in fit or "organiz" in fit:
            return "procesos", "El banco clasifica el reto como de procesos u organizacion."
    else:
        if "social" in fit:
            return "impacto_social", "El banco clasifica el reto como de impacto social."
        if "innov" in fit or "tecnolog" in fit:
            return "innovacion", "El banco clasifica el reto como de innovacion."

    texto = f"{reto.get('title', '')} {reto.get('description', '')}"
    tokens = _tokens(texto)
    scores = {cat: len(tokens & kws) for cat, kws in KEYWORDS.items()}

    if certamen == "latam":
        if scores["social"] >= scores["tecnologica"] and scores["social"] > 0:
            return "impacto_social", f"El enunciado apunta a impacto social ({scores['social']} senales)."
        return "innovacion", "El enunciado apunta a una solucion tecnica o de innovacion."

    orden = ["social", "procesos", "tecnologica"]
    ganadora = max(orden, key=lambda c: scores[c])
    if scores[ganadora] == 0:
        return "tecnologica", "Sin senales suficientes: se asume ruta tecnologica hasta que el equipo confirme."
    justificacion = {
        "social": "El enunciado prioriza personas, comunidad o inclusion.",
        "procesos": "El enunciado prioriza cadena, gestion u operacion.",
        "tecnologica": "El enunciado prioriza hardware, software o prototipo.",
    }[ganadora]
    return ganadora, f"{justificacion} ({scores[ganadora]} senales)."


def emparejar_casos(
    reto: dict,
    casos: list[dict],
    certamen: str | None = None,
    categoria: str | None = None,
) -> list[tuple[int, dict]]:
    """Puntua casos por especificidad: el titulo pesa mas que la descripcion."""
    texto_titulo = reto.get("title", "")
    texto_resto = f"{reto.get('description', '')} {' '.join(reto.get('ods_ids', []))}"
    tt_titulo = _tokens(texto_titulo)
    tt_total = tt_titulo | _tokens(texto_resto)
    puntuados = []
    for caso in casos:
        ct: set[str] = set()
        for tema in caso.get("temas", []):
            ct |= _tokens(tema)
        overlap_titulo = len(tt_titulo & ct)
        overlap_total = len(tt_total & ct)
        if overlap_total < 2 and overlap_titulo < 1:
            continue
        puntos = overlap_titulo * 3 + overlap_total
        if categoria and caso.get("categoria") == categoria:
            puntos += 2
        if certamen and caso.get("rally") == certamen:
            puntos += 1
        puntuados.append((puntos, caso))
    puntuados.sort(key=lambda par: (-par[0], -int(par[1].get("year", 0))))
    return puntuados


def precedentes_sirli(reto: dict, filas: list[dict], limite: int = 3) -> list[dict]:
    """Casos reales del mismo reto en SIRLI. Solo primeros lugares, sin estadisticas."""
    tt = _tokens(f"{reto.get('title', '')} {reto.get('description', '')}")
    vistos = set()
    salida = []
    for fila in filas:
        if fila.get("place") != 1:
            continue
        ct = _tokens(fila.get("challenge_name", ""))
        if len(tt & ct) < 2:
            continue
        clave = (fila.get("team"), fila.get("year"))
        if clave in vistos:
            continue
        vistos.add(clave)
        salida.append({
            "year": fila.get("year"),
            "equipo": fila.get("team"),
            "puesto": fila.get("place_label"),
            "pais": fila.get("country"),
            "reto": fila.get("challenge_name"),
            "video_url": fila.get("video_url", ""),
            "fuente": "research/sirli/winners.jsonl",
        })
        if len(salida) >= limite:
            break
    return salida


def evidencia_grafo(reto: dict, nodos: list[dict], limite: int = 5) -> list[dict]:
    tt = _tokens(f"{reto.get('title', '')} {reto.get('description', '')}")
    salida = []
    for nodo in nodos:
        fuente = nodo.get("source_file", "")
        if not any(k in fuente for k in ("claims", "ganadores", "retos")):
            continue
        etiqueta = nodo.get("label", "")
        if len(tt & _tokens(etiqueta)) < 2:
            continue
        salida.append({
            "dato": etiqueta,
            "fuente": nodo.get("source_url") or nodo.get("source_file", ""),
        })
        if len(salida) >= limite:
            break
    return salida


def recursos_de(texto: str) -> list[str]:
    n = _norm(texto)
    vistos = []
    for clave, nombre in COMPONENTES:
        if clave in n and nombre not in vistos:
            vistos.append(nombre)
    return vistos


def rubrica_para(certamen: str, categoria: str) -> list[dict]:
    criterios = RUBRICA[certamen]
    por_nombre = {c["criterio"]: c for c in criterios}
    if categoria in ("social", "impacto_social"):
        elegido = [c for c in criterios if "Impacto" in c["criterio"]]
    elif categoria == "procesos":
        elegido = [por_nombre["Viabilidad Técnica, Operativa y Uso de Recursos Locales"],
                   por_nombre["Prefactibilidad Económica, Sostenibilidad y Modelo Canvas"]]
    else:
        elegido = [c for c in criterios if "Innovación" in c["criterio"]]
    principal = elegido[0] if elegido else max(criterios, key=lambda c: c["puntos"])
    secundario = max((c for c in criterios if c is not principal), key=lambda c: c["puntos"])
    return [principal, secundario]


def _frase(texto: str, limite: int = 220) -> str:
    texto = re.sub(r"\s+", " ", str(texto or "")).strip()
    if len(texto) <= limite:
        return texto
    corte = texto.rfind(" ", 0, limite)
    return texto[: corte if corte > 0 else limite].rstrip() + "…"


def _ruta_desde_caso(reto: dict, caso: dict, certamen: str, categoria: str, indice: int) -> dict:
    proyecto = caso.get("proyecto", "Caso ganador")
    solucion = caso.get("solucion", "No documentado en la fuente")
    metrica = caso.get("metrica", "No documentado en la fuente")
    fuente = caso.get("fuente", "")
    tiene_metrica = bool(metrica) and "no documentado" not in _norm(metrica)

    titulo = f"{_frase(proyecto, 60)} aplicado a {_frase(reto.get('title', 'el reto'), 50)}"
    concepto = (
        f"{proyecto} demostró que {_frase(caso.get('insight', ''), 170)} "
        f"La ruta traslada ese principio al reto: {_frase(solucion, 220)}"
    )
    por_que = (
        f"El reto pide: {_frase(reto.get('description', reto.get('title', '')), 200)} "
        f"El caso {proyecto} ({caso.get('year')}) atacó el mismo núcleo: "
        f"{_frase(caso.get('problema', ''), 150)} "
        f"Causa raíz identificada: {_frase(caso.get('causa_raiz', ''), 120)}"
    )
    impacto = []
    if tiene_metrica:
        impacto.append({"dato": _frase(metrica, 200), "fuente": fuente})
    recursos = recursos_de(f"{solucion} {caso.get('problema', '')} {reto.get('description', '')}")
    riesgo = (
        "El jurado atacará la métrica si no se mide en el prototipo: "
        "definir instrumento y unidad antes de la hora 14."
        if not tiene_metrica else
        f"El jurado atacará la transferibilidad: demostrar que {_frase(metrica, 90)} se sostiene con recursos locales."
    )
    pitch = (
        f"Con {_frase(proyecto, 40)} adaptado, {_frase(reto.get('title', 'el reto'), 50)} se resuelve "
        f"con {_frase(metrica, 90) if tiene_metrica else 'un piloto medible (métrica por definir)'}."
    )
    return {
        "id": f"ruta-{indice}",
        "titulo": titulo,
        "concepto": concepto,
        "por_que_aplica": por_que,
        "etiqueta": "precedente",
        "cadena_razonamiento": {
            "problema": caso.get("problema", ""),
            "causa_raiz": caso.get("causa_raiz", ""),
            "insight": caso.get("insight", ""),
            "solucion": solucion,
            "metrica": metrica,
            "fuente": fuente,
        },
        "precedentes": [{
            "year": caso.get("year"),
            "equipo": caso.get("equipo"),
            "proyecto": proyecto,
            "puesto": caso.get("puesto"),
            "video_url": caso.get("video_url", ""),
            "fuente": fuente,
        }],
        "recursos": recursos,
        "ventana": VENTANAS[certamen],
        "impacto": impacto,
        "rubrica": rubrica_para(certamen, categoria),
        "riesgo": riesgo,
        "pitch": pitch,
    }


def _ruta_exploratoria(reto: dict, certamen: str, categoria: str) -> dict:
    return {
        "id": "ruta-exploratoria",
        "titulo": f"Hipótesis de solución para {_frase(reto.get('title', 'el reto'), 60)}",
        "concepto": (
            "No existe un caso ganador comparable en el corpus. La ruta se formula como hipótesis "
            "a validar con el beneficiario antes de construir: definir el proceso físico mínimo, "
            "medirlo y recién entonces prototipar."
        ),
        "por_que_aplica": (
            f"El reto pide: {_frase(reto.get('description', reto.get('title', '')), 240)} "
            "Sin precedente directo, el equipo debe levantar evidencia primaria."
        ),
        "etiqueta": "exploratoria",
        "cadena_razonamiento": {
            "problema": _frase(reto.get("description", ""), 260),
            "causa_raiz": "Por validar con el beneficiario.",
            "insight": "Sin precedente en el corpus de ganadores.",
            "solucion": "Hipótesis a validar.",
            "metrica": "Por definir.",
            "fuente": "research/challenges.json",
        },
        "precedentes": [],
        "recursos": recursos_de(reto.get("description", "")),
        "ventana": VENTANAS[certamen],
        "impacto": [],
        "rubrica": rubrica_para(certamen, categoria),
        "riesgo": "Sin precedente: el jurado exigirá evidencia primaria. No presentar como validado.",
        "pitch": "Hipótesis en validación: no usar cifras hasta medir el piloto.",
    }


def generar_soluciones(
    reto: dict,
    certamen: str,
    categoria: str | None = None,
    casos: list[dict] | None = None,
    propuestas: int = 3,
    winners: list[dict] | None = None,
    nodos_grafo: list[dict] | None = None,
) -> dict:
    if certamen not in CATEGORIAS:
        raise ValueError("certamen debe ser 'nacional' o 'latam'")
    cat, justificacion = clasificar(reto, certamen, categoria)
    casos = casos or []
    pares = emparejar_casos(reto, casos, certamen, cat)

    rutas = []
    for puntos, caso in pares:
        if puntos < 4:
            continue
        if len(rutas) >= propuestas:
            break
        rutas.append(_ruta_desde_caso(reto, caso, certamen, cat, len(rutas) + 1))
    if not rutas:
        rutas.append(_ruta_exploratoria(reto, certamen, cat))

    if winners is not None:
        extra = precedentes_sirli(reto, winners)
        if extra:
            for ruta in rutas:
                ruta["precedentes_sirli"] = extra

    if nodos_grafo:
        evidencia = evidencia_grafo(reto, nodos_grafo)
        if evidencia:
            for ruta in rutas:
                ruta["evidencia_grafo"] = evidencia

    return {
        "reto": {
            "id": reto.get("id"),
            "title": reto.get("title"),
            "description": reto.get("description"),
            "ods_ids": reto.get("ods_ids", []),
        },
        "certamen": certamen,
        "categoria": cat,
        "justificacion_categoria": justificacion,
        "soluciones": rutas,
    }


def _leer_brief(path: Path = BRIEF_PATH) -> dict:
    return cargar_json(path) if path.exists() else {}


def _leer_winners(path: Path = WINNERS_PATH) -> list[dict]:
    if not path.exists():
        return []
    return [json.loads(line) for line in path.read_text(encoding="utf-8").splitlines() if line.strip()]


def _leer_nodos(path: Path = GRAFO_PATH) -> list[dict]:
    if not path.exists():
        return []
    data = cargar_json(path)
    return data.get("nodes", []) if isinstance(data, dict) else []


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Genera soluciones para retos dados por el usuario.")
    grupo = parser.add_mutually_exclusive_group()
    grupo.add_argument("--reto", help="id del reto (ej. 01 o DESAFIO_01)")
    grupo.add_argument("--todos", action="store_true", help="todos los retos del banco")
    grupo.add_argument(
        "--importar-brain", nargs="?", const=str(ROOT / "brain" / "corpus" / "retos.md"),
        metavar="MD", help="importa los retos del comité desde brain/corpus/retos.md",
    )
    parser.add_argument("--certamen", choices=list(CATEGORIAS), help="nacional|latam (default: brief.json)")
    parser.add_argument("--categoria", help="fuerza la categoria del certamen")
    parser.add_argument("--propuestas", type=int, default=3, help="rutas por reto (default 3)")
    parser.add_argument("--json", dest="salida", help="archivo JSON de salida")
    parser.add_argument("--grafo", action="store_true", help="enriquece con graphify-out/graph.json")
    args = parser.parse_args(argv)

    if args.importar_brain:
        retos = importar_desde_brain(Path(args.importar_brain))
        RETOS_PATH.parent.mkdir(exist_ok=True)
        RETOS_PATH.write_text(json.dumps(retos, indent=2, ensure_ascii=False), encoding="utf-8")
        print(f"OK: {len(retos)} retos del comité importados en {RETOS_PATH}")
        return 0

    if not args.reto and not args.todos:
        print("ERROR: usa --reto, --todos o --importar-brain.", file=sys.stderr)
        return 2

    brief = _leer_brief()
    certamen = args.certamen or brief.get("rally_type") or ""
    certamen = certamen.lower()
    if certamen not in CATEGORIAS:
        print("ERROR: define el certamen en brief.json o con --certamen nacional|latam.", file=sys.stderr)
        return 2

    retos = cargar_retos()
    casos = cargar_casos()
    winners = _leer_winners()
    nodos = _leer_nodos() if args.grafo else None

    if args.todos:
        seleccion = retos
    else:
        clave = _norm(args.reto).replace("desafio", "").strip(" _-")
        seleccion = [r for r in retos if _norm(str(r.get("id", ""))).replace("desafio", "").strip(" _-") == clave]
        if not seleccion:
            print(f"ERROR: no existe el reto '{args.reto}'.", file=sys.stderr)
            return 2

    salida = {
        "certamen": certamen,
        "ciudad": brief.get("city", ""),
        "equipo": brief.get("team_name", ""),
        "retos": [
            generar_soluciones(r, certamen, args.categoria, casos, args.propuestas, winners, nodos)
            for r in seleccion
        ],
    }

    if args.salida:
        destino = Path(args.salida)
        destino.parent.mkdir(parents=True, exist_ok=True)
        destino.write_text(json.dumps(salida, indent=2, ensure_ascii=False), encoding="utf-8")
        print(f"OK: {len(salida['retos'])} reto(s) -> {args.salida}")
    else:
        for bloque in salida["retos"]:
            print(f"\n[{bloque['reto']['id']}] {bloque['reto']['title']}")
            print(f"  Categoria: {bloque['categoria']} — {bloque['justificacion_categoria']}")
            for ruta in bloque["soluciones"]:
                print(f"  - {ruta['titulo']} [{ruta['etiqueta']}]")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
