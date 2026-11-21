"""Verifica el canal entre roles.

Un canal por equipo: canal/NN-rol.json. Este script es el auditor deterministico:
no lee conversaciones, solo los contratos.

Uso:
    python scripts/verificar_canal.py <carpeta_canal>

Reglas que comprueba (de .agents/rules/proceso-obligatorio.md 5.0):
 1. Orden continuo desde 1 y nombre de archivo NN-rol.json.
 2. Todo rol con orden > 1 declara lee_de, y lo que declara existe.
 3. Toda pregunta abierta del contrato anterior aparece contestada en el siguiente.
 4. Ningun rol repite una cifra ya fijada en un contrato anterior con otro valor.
 5. Presupuesto: la partida cerrada y su desglose no suman dos veces, y no se
    entrega un presupuesto con la mayoria de filas en cero.
 6. Ningun rol afirma quien opera o administra sin declararlo en hechos.
 7. Un contrato cortado a mitad se marca parcial, dice que conservo y que le falta,
    y el siguiente declara de donde recupero. El trabajo parcial no se tira.
 8. El modo del rally lo fija brief.json, no la memoria de un rol: el primer contrato
    declara hechos.modo y ningun contrato posterior lo contradice ni cambia el total
    de horas.

Uso con brief explicito (para simulaciones con copia aislada):
    python scripts/verificar_canal.py <carpeta_canal> --brief <ruta>/brief.json
"""

from __future__ import annotations

import json
import re
import sys
from pathlib import Path

PATRON = re.compile(r"^(\d{2})-([a-z0-9_]+)\.json$")
CIFRA = re.compile(r"(?:C\$|USD|\$)\s?([\d][\d\s.,]*)")
ACENTOS = str.maketrans("áéíóúüñÁÉÍÓÚÜÑ", "aeiouunAEIOUUN")
CERRADA = re.compile(
    r"sistema completo|paquete completo|llave en mano|puesto en (?:casa|operacion)"
    r"|instalad[oa] y probad[oa]|todo incluido",
    re.IGNORECASE,
)
OPERA = re.compile(
    r"\b(?:opera|operara|operará|operado por|administra|administrara|administrará"
    r"|gestiona|gestionara|gestionará|es due[nñ]o)\b",
    re.IGNORECASE,
)
CLAVES_COSTO = ("costo_unitario_nio", "costo_unitario_usd", "costo_unitario", "unit_cost")
CLAVES_UNIDADES = ("unidades", "units")
BASES = {
    "unidad": "unidad", "unidades": "unidad", "unitario": "unidad", "unitaria": "unidad",
    "lote": "lote", "lotes": "lote", "por lote": "lote",
    "piloto": "piloto", "proyecto": "piloto", "por piloto": "piloto",
}
ESTADOS_PARCILES = {"parcial", "interrumpido", "bloqueado"}
FALTA_RX = re.compile(r"\[falta[^\]]*\]", re.IGNORECASE)
MODOS_VALIDOS = ("nacional", "latam")
HORAS_POR_MODO = {"nacional": 24, "latam": 28}
CLAVES_MODO = ("modo", "rally_type", "certamen")


def _parcial(contrato: dict) -> bool:
    """Un contrato cortado a mitad se declara, no se adivina por lo que le falta."""
    estado = _plano(contrato.get("estado") or "completo").strip()
    return estado in ESTADOS_PARCILES


def _plano(texto: str) -> str:
    """Minusculas y sin acentos: una pregunta escrita con tildes debe compararse igual."""
    return str(texto).translate(ACENTOS).lower()


def _palabras_clave(texto: str) -> set[str]:
    return {w for w in re.findall(r"[a-z0-9]+", _plano(texto)) if len(w) > 4}


def cargar(carpeta: Path) -> list[dict]:
    contratos = []
    for ruta in sorted(carpeta.glob("*.json")):
        m = PATRON.match(ruta.name)
        if not m:
            continue
        try:
            datos = json.loads(ruta.read_text(encoding="utf-8-sig"))
        except (OSError, ValueError) as exc:
            raise ValueError(f"{ruta.name}: no se puede leer como JSON ({exc})") from exc
        if not isinstance(datos, dict):
            raise ValueError(f"{ruta.name}: el contrato debe ser un objeto JSON, no {type(datos).__name__}")
        datos["_archivo"] = ruta.name
        datos["_orden_archivo"] = int(m.group(1))
        datos["_rol_archivo"] = m.group(2)
        contratos.append(datos)
    return contratos


def _numero(texto: str) -> str:
    """«24 300», «24,300» y «24300» son el mismo numero; «12,5» sigue siendo 12,5."""
    limpio = str(texto).strip().replace(" ", "").replace(" ", "")
    limpio = re.sub(r"(?<=\d)[.,](?=\d{3}\b)", "", limpio)
    limpio = limpio.strip(" .,")
    return limpio.replace(",", ".") if re.search(r"^\d+,\d{1,2}$", limpio) else limpio


def _cifras(valor) -> set[str]:
    if isinstance(valor, dict):
        out = set()
        for v in valor.values():
            out |= _cifras(v)
        return out
    if isinstance(valor, list):
        out = set()
        for v in valor:
            out |= _cifras(v)
        return out
    if isinstance(valor, str):
        return {_numero(c) for c in CIFRA.findall(valor)}
    if isinstance(valor, bool):
        return set()
    if isinstance(valor, (int, float)):
        # Una cifra escrita como numero JSON (4500) es la misma cifra que «USD 4500».
        return {_numero(f"{valor:g}")}
    return set()


def _costo(partida: dict) -> float | None:
    """Costo de la fila (unidades x unitario). None si no hay cifra usable."""
    unitario = None
    for clave in CLAVES_COSTO:
        if clave in partida:
            unitario = partida[clave]
            break
    if unitario is None:
        return None
    unidades = 1
    for clave in CLAVES_UNIDADES:
        if clave in partida:
            unidades = partida[clave]
            break
    try:
        return float(str(unitario).replace(",", ".")) * float(
            str(unidades).replace(",", ".")
        )
    except (TypeError, ValueError):
        return None


def _base(valor) -> str | None:
    """Normaliza la base de calculo: unidad, lote o piloto."""
    if valor is None:
        return None
    return BASES.get(_plano(valor).strip())


def _concepto(partida: dict) -> str:
    """Texto de la fila, sea cual sea el nombre de la clave.

    El presupuesto real usa `element` (AGENTS.md), el puente acepta `concept`, y las
    corridas del canal usaron `elemento` y `concepto`. Leer solo una de las cuatro deja
    la partida cerrada invisible y el doble conteo pasa sin que nadie lo vea.
    """
    for clave in ("elemento", "element", "concepto", "concept", "descripcion"):
        valor = partida.get(clave)
        if isinstance(valor, str) and valor.strip():
            return valor
    return ""


def _texto_de_afirmaciones(c: dict) -> str:
    """Lo que el contrato afirma, no lo que pregunta.

    Las preguntas abiertas son preguntas: no afirman nada y no se juzgan aqui.
    Las respuestas de las contestadas si son afirmaciones.
    """
    partes = [json.dumps(c.get("hechos") or {}, ensure_ascii=False)]
    for clave in ("partidas", "cuadre", "entregable", "resumen", "decisiones"):
        if clave in c:
            partes.append(json.dumps(c[clave], ensure_ascii=False))
    for item in c.get("preguntas_contestadas") or []:
        if isinstance(item, dict):
            partes.append(str(item.get("respuesta", "")))
        else:
            partes.append(str(item))
    return " ".join(partes)


def _brief(carpeta: Path, brief: Path | None = None) -> dict:
    """El brief manda sobre el modo del rally.

    Se busca solo en el canal, al lado del canal, o donde diga --brief. Nunca en la raiz
    del repo: una simulacion en carpeta aislada no debe heredar el proyecto real.
    """
    candidatos = []
    if brief is not None:
        candidatos.append(Path(brief))
    candidatos += [
        carpeta / "brief.json",
        carpeta.parent / "brief.json",
    ]
    for ruta in candidatos:
        if ruta.is_file():
            try:
                return json.loads(ruta.read_text(encoding="utf-8"))
            except (OSError, ValueError):
                return {}
    return {}


def _modo(valor) -> str | None:
    """Devuelve nacional o latam. Ambiguo o ausente devuelve None: no se adivina."""
    plano = _plano(valor)
    encontrados = [m for m in MODOS_VALIDOS if re.search(rf"\b{m}\b", plano)]
    return encontrados[0] if len(encontrados) == 1 else None


def _modo_declarado(c: dict) -> object:
    hechos = c.get("hechos") if isinstance(c.get("hechos"), dict) else {}
    for clave in CLAVES_MODO:
        if clave in hechos:
            return hechos[clave]
    return None


def _verificar_modo(contratos: list[dict], carpeta: Path, brief: Path | None) -> list[str]:
    """Regla 5.0.11: el modo sale de brief.json y no lo contradice nadie.

    Un contrato que dice «nacional 24 h» mientras brief.json dice latam 28 h no es
    un detalle de redaccion: cambia el jurado, la moneda y el largo de la cola.
    """
    fallos: list[str] = []
    datos = _brief(carpeta, brief)
    esperado = _modo(datos.get("rally_type", ""))
    horas_brief = datos.get("hours_total")
    referencia = esperado

    for c in contratos:
        crudo = _modo_declarado(c)
        declarado = _modo(crudo) if crudo is not None else None

        if crudo is None:
            if c["_orden_archivo"] == 1:
                fallos.append(
                    f"{c['_archivo']}: primer contrato sin hechos.modo. Regla 5.0.11: el modo "
                    "del rally se copia de brief.json, no se recuerda de memoria"
                )
            continue

        if declarado is None:
            fallos.append(
                f"{c['_archivo']}: hechos.modo {crudo!r} no dice un modo unico "
                f"({' o '.join(MODOS_VALIDOS)}). Regla 5.0.11"
            )
            continue

        if referencia is None:
            referencia = declarado
        elif declarado != referencia:
            origen = "brief.json" if esperado else "el primer contrato"
            fallos.append(
                f"{c['_archivo']}: declara modo {declarado} y {origen} dice {referencia}. "
                "Regla 5.0.11: cambia el jurado, la moneda y el largo de la cola"
            )

        hechos = c.get("hechos") if isinstance(c.get("hechos"), dict) else {}
        horas = hechos.get("horas_total")
        if isinstance(horas, (int, float)) and isinstance(horas_brief, (int, float)):
            if horas != horas_brief:
                fallos.append(
                    f"{c['_archivo']}: declara {horas} h y brief.json dice {horas_brief} h. "
                    "Regla 5.0.11"
                )
        elif isinstance(horas, (int, float)) and referencia in HORAS_POR_MODO:
            if horas != HORAS_POR_MODO[referencia]:
                fallos.append(
                    f"{c['_archivo']}: declara {horas} h para un rally {referencia}, que son "
                    f"{HORAS_POR_MODO[referencia]} h. Regla 5.0.11"
                )
    return fallos


def verificar(carpeta: Path, brief: Path | None = None) -> list[str]:
    fallos: list[str] = []
    try:
        contratos = cargar(carpeta)
    except (OSError, ValueError) as exc:
        return [f"contrato ilegible: {exc}"]
    if not contratos:
        return [f"canal vacio: no hay contratos NN-rol.json en {carpeta}"]

    ordenes: dict[int, list[str]] = {}
    for c in contratos:
        ordenes.setdefault(c["_orden_archivo"], []).append(c["_archivo"])
    repetidos = {n: v for n, v in ordenes.items() if len(v) > 1}
    if repetidos:
        for n, archivos in sorted(repetidos.items()):
            fallos.append(
                f"orden {n} repetido en {', '.join(archivos)}. Dos roles en el mismo numero: "
                f"el ultimo que escribe borra al primero (Regla 5.0.10)"
            )
        return fallos

    esperado = 1
    for c in contratos:
        if c["_orden_archivo"] != esperado:
            fallos.append(
                f"orden roto: se esperaba 01.. y llego {c['_archivo']} (salto de numeracion)"
            )
            break
        esperado += 1
        if c.get("orden") != c["_orden_archivo"]:
            fallos.append(
                f"{c['_archivo']}: el campo orden ({c.get('orden')}) no coincide con el archivo"
            )
        if c.get("rol") != c["_rol_archivo"]:
            fallos.append(
                f"{c['_archivo']}: el rol declarado ({c.get('rol')}) no coincide con el nombre"
            )

    for i, c in enumerate(contratos):
        if i == 0:
            continue
        lee = c.get("lee_de") or []
        if not lee:
            fallos.append(
                f"{c['_archivo']}: sin lee_de. Regla 5.0.1: un rol sin lee_de no cuenta como entregado"
            )
        for ref in lee:
            nombre = Path(str(ref)).name
            if (carpeta / nombre).exists():
                continue
            # Un rol tambien puede leer documentos de fuera del canal (la investigacion,
            # el brief). Se resuelve contra la carpeta padre y contra la ruta tal cual.
            if (carpeta.parent / nombre).exists():
                continue
            if Path(str(ref)).is_absolute() and Path(str(ref)).exists():
                continue
            if (carpeta.parent / str(ref)).exists():
                continue
            # El brief y los catalogos viven en la raiz del repo, y todo rol los lee.
            if (Path(__file__).resolve().parents[1] / str(ref)).exists():
                continue
            fallos.append(f"{c['_archivo']}: declara leer {ref} y ese archivo no existe")

    # Regla 3 con herencia: un contrato cortado a mitad no puede contestar lo que le
    # quedaba por delante. Sus preguntas pendientes no se pierden ni se cobran al
    # contrato cortado: pasan al siguiente que reanude y ese las contesta.
    pendientes: list[tuple[str, str]] = []
    for i, actual in enumerate(contratos):
        previo = contratos[i - 1] if i else {}
        for p in (previo.get("preguntas_abiertas") or []):
            if p:
                pendientes.append((previo.get("_archivo", ""), p))
        contestadas_txt = _plano(
            json.dumps(actual.get("preguntas_contestadas") or [], ensure_ascii=False)
        )
        if _parcial(actual):
            pendientes.extend(
                (actual["_archivo"], p) for p in (actual.get("preguntas_abiertas") or []) if p
            )
            continue
        quedan: list[tuple[str, str]] = []
        for origen, p in pendientes:
            claves = _palabras_clave(p)
            if claves and not (claves & _palabras_clave(contestadas_txt)):
                quedan.append((origen, p))
        pendientes = quedan
        for origen, p in pendientes:
            if origen == actual.get("_archivo"):
                continue
            fallos.append(
                f"{actual['_archivo']}: no contesta la pregunta de {origen}: {p!r}"
            )

    fijadas: dict[str, set[str]] = {}
    for c in contratos:
        hechos = c.get("hechos") or {}
        if not isinstance(hechos, dict):
            continue
        motivos = " ".join(
            f"{k} {v}" for k, v in hechos.items() if "motivo" in str(k).lower()
        ).lower()
        for clave, valor in hechos.items():
            if str(clave).lower().startswith("texto_"):
                continue
            cifras = _cifras(valor)
            if not cifras:
                continue
            previas = fijadas.get(str(clave))
            if previas is None:
                fijadas[str(clave)] = cifras
                continue
            if cifras == previas:
                continue
            if str(clave).lower() in motivos:
                continue
            fallos.append(
                f"{c['_archivo']}: {clave} cambia de {sorted(previas)} a {sorted(cifras)}"
                " sin motivo anotado en hechos"
            )

    for c in contratos:
        partidas = c.get("partidas")
        if not isinstance(partidas, list) or not partidas:
            continue
        filas = [(p, _costo(p)) for p in partidas if isinstance(p, dict)]
        con_costo = [(p, v) for p, v in filas if v is not None and v > 0]
        cerradas = [
            (p, v)
            for p, v in con_costo
            if CERRADA.search(f"{_concepto(p)} {p.get('nota', '')}")
        ]
        if cerradas:
            desglose = [(p, v) for p, v in con_costo if (p, v) not in cerradas]
            if desglose:
                fallos.append(
                    f"{c['_archivo']}: doble conteo: la partida cerrada "
                    f"{_concepto(cerradas[0][0])!r} ya incluye el sistema y "
                    f"{len(desglose)} partida(s) de desglose traen costo aparte. "
                    "Regla 5.0.6: partida cerrada o desglose, nunca los dos"
                )
        if len(con_costo) * 2 < len(filas):
            fallos.append(
                f"{c['_archivo']}: {len(filas) - len(con_costo)} de {len(filas)} "
                "partidas sin costo; el Excel exportado se ve vacio. "
                "Regla 5.0.6: una fila en cero no es una fila, es un pendiente"
            )
        if cerradas and len(con_costo) * 2 < len(filas):
            fallos.append(
                f"{c['_archivo']}: el presupuesto cuadra solo porque las partidas de "
                "desglose valen cero; el cuadre no prueba el costo de ningun componente"
            )

        hechos = c.get("hechos") if isinstance(c.get("hechos"), dict) else {}
        base = _base(hechos.get("base_calculo"))
        if base is None:
            fallos.append(
                f"{c['_archivo']}: el presupuesto no declara hechos.base_calculo "
                "(unidad | lote | piloto). Regla 5.0.8: sin base declarada la cifra no "
                "significa nada"
            )
        elif base == "lote":
            tamano = hechos.get("tamano_lote")
            try:
                tamano_ok = float(str(tamano).replace(",", ".")) > 0
            except (TypeError, ValueError):
                tamano_ok = False
            if not tamano_ok:
                fallos.append(
                    f"{c['_archivo']}: presupuesto por lote sin hechos.tamano_lote. "
                    "Regla 5.0.8: un lote sin tamano no se puede comparar"
                )
        for p, _ in filas:
            fila_base = _base(p.get("base_calculo"))
            if fila_base is None:
                continue
            if base is not None and fila_base != base:
                fallos.append(
                    f"{c['_archivo']}: la fila {p.get('elemento', '')!r} esta en base "
                    f"{fila_base!r} y el contrato en {base!r}. Regla 5.0.8: una sola "
                    "base por tabla"
                )
                break

    # Regla 5.0.7. El responsable puede venir declarado en un contrato anterior del
    # canal: el rol que cita "COOPAGUA administra" esta copiando un hecho ya fijado,
    # no inventando. Solo falla si nadie en la cadena lo declaro, o si el contrato
    # lo declara en [FALTA].
    operador_declarado = False
    for c in contratos:
        hechos = c.get("hechos") if isinstance(c.get("hechos"), dict) else {}
        propio = any(
            re.search(r"operador|responsab", str(k).lower())
            and not FALTA_RX.search(str(v))
            for k, v in hechos.items()
        )
        texto = FALTA_RX.sub(" ", _texto_de_afirmaciones(c))
        m = OPERA.search(texto)
        if m and not propio and not operador_declarado:
            fallos.append(
                f"{c['_archivo']}: afirma que alguien {m.group(0)!r} sin declararlo "
                "en hechos.operador. Regla 5.0.7: armar no es operar, instalar no es "
                "administrar; si no hay responsable, se marca [FALTA"
            )
        if propio:
            operador_declarado = True

    parciales: list[str] = []
    for c in contratos:
        if not _parcial(c):
            continue
        archivo = c["_archivo"]
        parciales.append(archivo)
        conservado = c.get("conservado")
        falta = c.get("falta")
        if not isinstance(conservado, list) or not conservado:
            fallos.append(
                f"{archivo}: se corto a mitad y no dice que quedo hecho en "
                "conservado. Regla 5.0.9: el trabajo parcial no se tira"
            )
        if not isinstance(falta, list) or not falta:
            fallos.append(
                f"{archivo}: se corto a mitad y no dice que quedo pendiente en "
                "falta. Regla 5.0.9: un corte sin pendiente declarado parece terminado"
            )

    for c in contratos:
        if not parciales:
            break
        hechos = c.get("hechos") if isinstance(c.get("hechos"), dict) else {}
        recuperado = _plano(hechos.get("recuperado_de", "")).strip()
        previos = [p for p in parciales if p < c["_archivo"]]
        if not previos:
            continue
        if not recuperado:
            fallos.append(
                f"{c['_archivo']}: hay un contrato anterior cortado ({', '.join(previos)}) "
                "y este no declara hechos.recuperado_de. Regla 5.0.9: se reanuda desde "
                "el trabajo conservado, no desde cero"
            )
        elif not any(p in recuperado for p in previos):
            fallos.append(
                f"{c['_archivo']}: declara recuperado_de {recuperado!r} y el contrato "
                f"cortado es {', '.join(previos)}. Regla 5.0.9"
            )

    fallos.extend(_verificar_modo(contratos, carpeta, brief))
    return fallos


def main(argv: list[str] | None = None) -> int:
    argv = list(sys.argv[1:] if argv is None else argv)
    brief: Path | None = None
    if "--brief" in argv:
        i = argv.index("--brief")
        if i + 1 >= len(argv):
            print("uso: python scripts/verificar_canal.py <carpeta_canal> [--brief <ruta>]")
            return 2
        brief = Path(argv[i + 1])
        del argv[i:i + 2]
        if not brief.is_file():
            print(f"ERROR: no existe el brief {brief}")
            return 2
    if not argv:
        print("uso: python scripts/verificar_canal.py <carpeta_canal> [--brief <ruta>]")
        return 2
    carpeta = Path(argv[0])
    if not carpeta.is_dir():
        print(f"ERROR: no existe la carpeta {carpeta}")
        return 2
    fallos = verificar(carpeta, brief)
    if fallos:
        print(f"CANAL ROTO ({len(fallos)} fallos):")
        for f in fallos:
            print(f"  - {f}")
        return 1
    print(f"CANAL OK ({len(cargar(carpeta))} contratos encadenados)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
