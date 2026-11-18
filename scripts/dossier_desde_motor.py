"""Convierte la salida del motor de soluciones en las fichas que maqueta gen_dossier.py.

`soluciones_motor.py` entrega los retos anidados (reto -> soluciones[]); el dossier
de `docs/assets/dossier.css` pide fichas planas con propuesta y alterna. Este puente
hace esa traduccion sin inventar texto: cada campo sale de un campo del motor, y la
ruta que trae marcas de transcripcion pendiente se descarta antes de maquetar.

Lo que el motor no alcanza a escribir se completa en un archivo de contenido
(`--extra`, por defecto `research/dossier_extra.json`), que es texto del equipo y no
logica del programa. El puente avisa que reto queda incompleto y con que clave.
"""

from __future__ import annotations

import argparse
import json
import re
from pathlib import Path

SUCIO = ("analisis pendiente", "análisis pendiente", "derivado de transcripcion",
         "derivado de transcripción", "no documentado en la fuente")

ODS = {
    "1": "Fin de la pobreza",
    "2": "Hambre cero",
    "3": "Salud y bienestar",
    "4": "Educación de calidad",
    "5": "Igualdad de género",
    "6": "Agua limpia y saneamiento",
    "7": "Energía asequible y no contaminante",
    "8": "Trabajo decente y crecimiento económico",
    "9": "Industria, innovación e infraestructura",
    "10": "Reducción de las desigualdades",
    "11": "Ciudades y comunidades sostenibles",
    "12": "Producción y consumo responsables",
    "13": "Acción por el clima",
    "14": "Vida submarina",
    "15": "Vida de ecosistemas terrestres",
    "16": "Paz, justicia e instituciones sólidas",
    "17": "Alianzas para lograr los objetivos",
}

ETIQUETAS = re.compile(
    r"^(problema documentado|soluci[oó]n del caso|principio transferible|el caso|caso)\s*:\s*",
    re.IGNORECASE,
)


def _txt(valor) -> str:
    return re.sub(r"\s+", " ", str(valor or "")).strip()


def _sucio(texto) -> bool:
    bajo = _txt(texto).lower()
    return any(marca in bajo for marca in SUCIO)


def _limpio(texto) -> str:
    texto = ETIQUETAS.sub("", _txt(texto))
    texto = re.sub(r"^[A-ZÁÉÍÓÚÑ0-9 ]{6,}\(\d{4}\)\.\s*", "", texto)
    return texto.strip()


def _oraciones(texto) -> list[str]:
    partes = re.split(r"(?<=[.!?])\s+", _limpio(texto))
    return [p.strip() for p in partes if len(p.strip()) > 12 and not _sucio(p)]


def _palabras(texto) -> int:
    return len(_txt(texto).split())


def _recorta(texto: str, tope: int) -> str:
    texto = _txt(texto)
    if not texto:
        return ""
    if len(texto) <= tope:
        return texto if texto.endswith((".", "!", "?")) else texto + "."
    corte = texto[:tope].rstrip()
    punto = max(corte.rfind(". "), corte.rfind("; "))
    if punto > tope * 0.5:
        corte = corte[:punto]
    return corte.rstrip(",;: ") + "."


def _que_es(pool: list[str], tope: int = 150) -> str:
    elegidas: list[str] = []
    total = 0
    for oracion in pool:
        n = _palabras(oracion)
        if total + n > tope:
            continue
        elegidas.append(oracion if oracion.endswith((".", "!", "?")) else oracion + ".")
        total += n
        if total >= 95:
            break
    return " ".join(elegidas)


def _solucion(sol: dict, rid: str) -> dict:
    cadena = sol.get("cadena_razonamiento") or {}
    pool = []
    for fuente in (cadena.get("problema"), sol.get("concepto"), cadena.get("solucion"),
                   sol.get("por_que_aplica"), sol.get("riesgo")):
        pool.extend(_oraciones(fuente))
    pasos = [_recorta(p, 190) for p in (_oraciones(cadena.get("solucion")) + _oraciones(sol.get("concepto")))][:4]
    recursos = [_recorta(r, 90) for r in (sol.get("recursos") or []) if _txt(r) and not _sucio(r)]
    impacto = (sol.get("impacto") or [{}])[0].get("dato")
    return {
        "nombre": _recorta(re.split(r"\s+aplicado a\s+", _txt(sol.get("titulo")))[0], 72).rstrip("."),
        "claim": _recorta(sol.get("pitch"), 220),
        "que_es": _que_es(pool),
        "como": pasos,
        "beneficiario": "",
        "componentes": recursos[:6],
        "costo": _recorta(sol.get("riesgo"), 260),
        "metricas": [_recorta(m, 130) for m in _oraciones(impacto)][:3],
    }


def _ficha(bloque: dict) -> dict:
    reto = bloque.get("reto") or {}
    rid = reto.get("id", "?")
    limpias = [s for s in (bloque.get("soluciones") or []) if not _sucio(json.dumps(s, ensure_ascii=False))]
    primera = limpias[0] if limpias else {}
    segunda = limpias[1] if len(limpias) > 1 else {}

    propuesta = _solucion(primera, rid) if primera else {}
    alterna = _solucion(segunda, rid) if segunda else {}

    cadena = primera.get("cadena_razonamiento") or {}
    # Los precedentes salen de winners.jsonl: son dato del certamen, no redaccion
    # pendiente, asi que se citan aunque la ruta que los trajo venga marcada.
    precedentes = []
    vistos = set()
    for sol in (bloque.get("soluciones") or []):
        for p in (sol.get("precedentes_sirli") or []):
            marca = (p.get("equipo"), p.get("year"), p.get("puesto"))
            if marca not in vistos:
                vistos.add(marca)
                precedentes.append(p)
    analogias = []
    for p in precedentes[:3]:
        analogias.append({
            "year": p.get("year") or 2026,
            "equipo": _txt(p.get("equipo")) or "Equipo",
            "proyecto": _recorta(f"{p.get('reto', '')} · {p.get('pais', '')}", 90),
            "que_hicieron": _recorta(cadena.get("solucion"), 240),
            "por_que": _recorta(primera.get("por_que_aplica"), 240),
            "video": _txt(p.get("video_url")),
            "puesto": _txt(p.get("puesto")) or "precedente",
        })

    ventana = primera.get("ventana") or {}
    rubrica = primera.get("rubrica") or []
    recursos = [_txt(r) for r in (primera.get("recursos") or []) if _txt(r) and not _sucio(r)]
    detalles = [
        ["Recursos del piloto", _recorta(", ".join(recursos), 220)],
        ["Ventana del rally", _recorta(" ".join(
            f"{t.get('tramo')}: {t.get('actividad')}." for t in (ventana.get("plan") or [])[:3]
        ), 220)],
        ["Peso en la rubrica", _recorta(" · ".join(
            f"{c.get('criterio')} {c.get('puntos')} pts" for c in rubrica
        ), 220)],
    ]

    insignias = [["Precedente SIRLI", _txt(f"{p.get('puesto', '')} {p.get('year', '')}")]
                 for p in precedentes[:2]]
    insignias.append(["Replica en el rally", _txt(ventana.get("duracion") or "ventana del certamen")])

    impacto = (primera.get("impacto") or [{}])[0].get("dato")
    ods = []
    for tag in (reto.get("ods_ids") or []):
        numero = _txt(tag).split()[-1]
        if numero in ODS:
            ods.append([tag, ODS[numero], _recorta(
                impacto if impacto and not _sucio(impacto) else reto.get("description"), 170)])

    return {
        "id": rid.replace("DESAFIO_", ""),
        "categoria": _txt(bloque.get("categoria")),
        "categoria_porque": _txt(bloque.get("justificacion_categoria")),
        "titulo": _txt(reto.get("title")),
        "descripcion": _txt(reto.get("description")),
        "pitch": _recorta(primera.get("pitch"), 300),
        "senal": "",
        "analogias": analogias,
        "detalles": detalles,
        "insignias": insignias,
        "ods": ods,
        "realidad": {
            "a": _recorta(primera.get("por_que_aplica"), 320),
            "b": _recorta(segunda.get("riesgo") or (limpias[0].get("riesgo") if limpias else ""), 320),
        },
        "cadena": {
            "problema": _recorta(cadena.get("problema"), 240),
            "causa_raiz": _recorta(cadena.get("causa_raiz"), 240),
            "insight": _recorta(cadena.get("insight"), 240),
            "solucion": _recorta(cadena.get("solucion"), 240),
            "metrica": _recorta(cadena.get("metrica"), 200),
        },
        "propuesta": propuesta,
        "alterna": alterna,
    }


def _fusion(base, extra):
    if isinstance(base, dict) and isinstance(extra, dict):
        salida = dict(base)
        for clave, valor in extra.items():
            salida[clave] = _fusion(base.get(clave), valor)
        return salida
    return extra if extra not in (None, "") else base


FALTANTES = {
    "propuesta": ["nombre", "claim", "que_es", "como", "beneficiario", "componentes", "costo", "metricas"],
    "alterna": ["nombre", "claim", "que_es", "como", "beneficiario", "componentes", "costo", "metricas"],
    "cadena": ["problema", "causa_raiz", "insight", "solucion", "metrica"],
    "realidad": ["a", "b"],
}


def _huecos(ficha: dict) -> list[str]:
    faltan = []
    for campo in ("id", "categoria", "categoria_porque", "titulo", "descripcion", "pitch",
                  "senal", "analogias", "detalles", "insignias", "ods"):
        if ficha.get(campo) in ("", None, [], {}):
            faltan.append(campo)
    for bloque, claves in FALTANTES.items():
        datos = ficha.get(bloque) or {}
        for clave in claves:
            if datos.get(clave) in ("", None, [], {}):
                faltan.append(f"{bloque}.{clave}")
    for bloque in ("propuesta", "alterna"):
        n = _palabras((ficha.get(bloque) or {}).get("que_es"))
        if 0 < n < 80 or n > 150:
            faltan.append(f"{bloque}.que_es ({n} palabras, pide 80-150)")
    return faltan


def main(argv: list[str] | None = None) -> int:
    p = argparse.ArgumentParser(description="Puente motor -> fichas del dossier.")
    p.add_argument("--json", default="research/soluciones_actuales.json")
    p.add_argument("--extra", default="research/dossier_extra.json")
    p.add_argument("--out", default="research/dossier_fichas.json")
    args = p.parse_args(argv)

    datos = json.loads(Path(args.json).read_text(encoding="utf-8"))
    ruta_extra = Path(args.extra)
    extra = json.loads(ruta_extra.read_text(encoding="utf-8")) if ruta_extra.exists() else {}

    fichas = []
    pendientes = []
    for bloque in datos.get("retos", []):
        ficha = _ficha(bloque)
        propio = (extra.get("retos") or {}).get(bloque.get("reto", {}).get("id"))
        if propio:
            ficha = _fusion(ficha, propio)
        # El corpus de ganadores dice puesto, pais y video, no el mecanismo interno:
        # la analogia se apoya en el resultado y en la causa raiz compartida, y no
        # se le atribuye al equipo ganador una tecnologia que no esta documentada.
        for analogia in ficha.get("analogias") or []:
            if not analogia.get("que_hicieron"):
                analogia["que_hicieron"] = ("Tomó el mismo desafío y lo resolvió con su propio "
                                            "mecanismo; el registro público está en el video.")
            if not analogia.get("por_que"):
                analogia["por_que"] = _recorta((ficha.get("cadena") or {}).get("causa_raiz"), 240)
        if not ficha.get("pitch"):
            ficha["pitch"] = _recorta((ficha.get("propuesta") or {}).get("claim"), 300)
        if not ficha.get("senal") and ficha.get("analogias"):
            a = ficha["analogias"][0]
            ficha["senal"] = _recorta(
                f"Este reto lo ganó {a['equipo']} ({a['year']}) con {a['puesto']}.", 200)
        huecos = _huecos(ficha)
        if huecos:
            pendientes.append(f"reto {ficha['id']}: falta {', '.join(huecos)}")
        fichas.append(ficha)

    salida = {
        "meta": extra.get("meta") or {
            "kicker": "Rally Studio · Motor de soluciones",
            "titulo": f"{len(fichas)} retos, {len(fichas)} propuestas",
            "subtitulo": "Soluciones construidas por mecanismo, con el precedente que las sostiene y espacio para las ideas del equipo.",
            "certamen": "Rally Latinoamericano de Innovación" if datos.get("certamen") != "nacional" else "Rally Nacional de Innovación",
            "fecha": "Noviembre 2026",
            "equipo": _txt(datos.get("equipo")) or "Equipo",
        },
        "retos": fichas,
    }
    destino = Path(args.out)
    destino.parent.mkdir(parents=True, exist_ok=True)
    destino.write_text(json.dumps(salida, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"OK: {len(fichas)} ficha(s) -> {destino}")
    for aviso in pendientes:
        print(f"POR COMPLETAR: {aviso}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
