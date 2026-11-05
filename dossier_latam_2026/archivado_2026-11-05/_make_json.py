# -*- coding: utf-8 -*-
"""Ensambla soluciones.json para scripts/gen_dossier.py desde contenido_final.py.

Una sola fuente: CONTENIDO trae cadena, ODS, insignias, precedentes, pitch y las
dos opciones completas (narrativa, pasos, componentes, costo, métrica, ya existe,
quién paga, por validar). Del repo solo se leen título, descripción y categoría,
que son del enunciado del reto, no de la solución.

Valida y aborta si algo no cuadra: 150-250 palabras, 4 pasos, términos
prohibidos, nombre que no sea taller/servicio, componentes mínimos, costo en USD
con marca de estimación e insignias dentro de knowledge/insignias.json.
"""
import json
import os
import re
import unicodedata

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.dirname(HERE)
SRC_RETO = os.path.join(REPO, "research", "soluciones_actuales.json")
MARCOS = os.path.join(REPO, "knowledge", "insignias.json")

from contenido_final import CONTENIDO  # noqa: E402

PROHIBIDOS = [
    "nómina", "nomina", "jugador", "canal local", "canal barrial", "nodo", "sesgo", "ticket",
    "mecanismo", "est. canon", "saturacion", "saturación", "probabilidad",
    "win rate", "score", "no documentado", "donad", "horas-crédito",
    "horas credito", "qr", "biodiésel", "biodiesel",
]
NOMBRE_PROHIBIDO = re.compile(r"\b(taller|servicio|mesa de desarme|capacitación)\b", re.I)


def _norm(s):
    s = unicodedata.normalize("NFD", s.lower())
    s = "".join(c for c in s if unicodedata.category(c) != "Mn")
    return [w for w in s.split() if w.isalpha()]


def match_title(a, b):
    A, B_ = _norm(a), _norm(b)
    return len(set(A) & set(B_)) / max(1, len(set(A) | set(B_))) >= 0.5


def _marcos_verificados():
    with open(MARCOS, encoding="utf-8") as f:
        d = json.load(f)
    return {m["nombre"] for m in d["marcos"] if m.get("verified")}


def _propuesta(bloque, beneficiario, num, etiqueta):
    texto = bloque["que_es"]
    palabras = len(re.findall(r"\w+", texto))
    if not 150 <= palabras <= 250:
        raise SystemExit("R%s %s: %d palabras (debe ser 150-250)" % (num, etiqueta, palabras))
    low = texto.lower()
    for t in PROHIBIDOS:
        hit = (t in low) if (" " in t or "." in t) else re.search(r"\b" + re.escape(t) + r"\b", low)
        if hit:
            raise SystemExit("R%s %s: término prohibido '%s'" % (num, etiqueta, t))
    if NOMBRE_PROHIBIDO.search(bloque["nombre"]):
        raise SystemExit("R%s %s: el nombre no puede ser taller/servicio" % (num, etiqueta))
    if len(bloque["como"]) != 4:
        raise SystemExit("R%s %s: 'como' debe tener 4 pasos" % (num, etiqueta))
    if len(bloque["componentes"]) < 3:
        raise SystemExit("R%s %s: faltan componentes" % (num, etiqueta))
    if "USD" not in bloque["costo"] or "estimación propia" not in bloque["costo"]:
        raise SystemExit("R%s %s: costo sin USD o sin marca de estimación" % (num, etiqueta))
    for campo in ("claim", "metrica", "ya_existe", "paga", "validar"):
        if not str(bloque.get(campo, "")).strip():
            raise SystemExit("R%s %s: falta '%s'" % (num, etiqueta, campo))
    return {
        "nombre": bloque["nombre"],
        "claim": bloque["claim"],
        "que_es": texto,
        "como": list(bloque["como"]),
        "beneficiario": beneficiario,
        "componentes": list(bloque["componentes"]),
        "costo": bloque["costo"],
        "metricas": [bloque["metrica"]],
    }


def main():
    with open(SRC_RETO, encoding="utf-8") as f:
        src = json.load(f)
    verificados = _marcos_verificados()
    puestos = {}
    for r in src["retos"]:
        for a in r.get("analogias", []):
            puestos[(a.get("year"), a.get("equipo"))] = a.get("puesto", "")

    out = {"meta": {
        "titulo": "Dossier de soluciones · Latam 2026",
        "subtitulo": "9 retos del comité · pilotos por validar",
        "certamen": "latam",
        "fecha": "",
    }, "retos": []}

    for num, C in CONTENIDO.items():
        src_r = next(r for r in src["retos"] if r["id"] == num)
        R = None
        for r in src["retos"]:
            if r["id"] == num:
                R = r
                break
        titulo = src_r["titulo"]

        if not 2 <= len(C["ods"]) <= 3:
            raise SystemExit("R%s: 2-3 ODS" % num)
        for nombre, _detalle in C["insignias"]:
            ok = any(nombre == v or v.startswith(nombre) or nombre.startswith(v)
                     for v in verificados)
            if not ok:
                raise SystemExit("R%s: insignia no verificada '%s'" % (num, nombre))

        a = _propuesta(C["a"], "por definir", num, "opción 01")
        b = _propuesta(C["b"], "por definir", num, "opción 02")

        ret = {
            "id": num,
            "titulo": titulo,
            "categoria": src_r.get("categoria", ""),
            "categoria_porque": C["categoria_porque"],
            "descripcion": src_r.get("descripcion", ""),
            "ods": [tuple(o) for o in C["ods"]],
            "propuesta": a,
            "alterna": b,
            "cadena": {
                "problema": C["cadena"]["problema"],
                "causa_raiz": C["cadena"]["causa"],
                "insight": C["cadena"]["insight"],
                "solucion": ("%s y %s: dos rutas independientes sobre el mismo problema."
                             % (a["nombre"], b["nombre"])),
                "metrica": C["cadena"]["metrica"],
            },
            "senal": src_r.get("senal", ""),
            "analogias": [
                {"year": y, "equipo": eq, "proyecto": pr, "puesto": puestos.get((y, eq), ""),
                 "que_hicieron": qh, "por_que": pq, "video": ""}
                for (y, eq, pr, qh, pq) in C["analogias"]
            ],
            "realidad": {"a": C["a"]["paga"], "b": C["b"]["paga"]},
            "detalles": [
                ["Ya existe", C["a"]["ya_existe"] + " / " + C["b"]["ya_existe"]],
                ["Quién paga", C["a"]["paga"] + " / " + C["b"]["paga"]],
                ["Por validar", C["a"]["validar"] + " / " + C["b"]["validar"]],
            ],
            "insignias": [list(i) for i in C["insignias"]],
            "pitch": C["pitch"],
        }
        out["retos"].append(ret)

    dst = os.path.join(HERE, "soluciones.json")
    with open(dst, "w", encoding="utf-8") as f:
        json.dump(out, f, ensure_ascii=False, indent=2)
    print("OK", dst, len(out["retos"]), "retos")


if __name__ == "__main__":
    main()
