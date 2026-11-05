# -*- coding: utf-8 -*-
"""Sandbox dossier_latam_2026: arma soluciones.json para scripts/gen_dossier.py.

Fuentes:
- contenido_final.py: narrativa aprobada (escena, sin jerga, sin donaciones,
  opciones que no son taller/servicio, test de "ya existe", quién paga).
- _build_final.py: cadena de causa, beneficiario, componentes y métricas base.
- research/soluciones_actuales.json (repo, SOLO LECTURA): categoria, descripcion,
  ods, insignias, senal, analogias. No se toman de ahí las soluciones.

Valida antes de escribir: 150-250 palabras por 'que_es', 4 pasos, sin términos
prohibidos, nombre de opción que no sea taller/servicio.
"""
import json
import os
import re
import unicodedata

import _build_final as B
from contenido_final import CONTENIDO

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.dirname(HERE)
SRC_RETO = os.path.join(REPO, "research", "soluciones_actuales.json")

PROHIBIDOS = [
    "nómina", "nomina", "jugador", "canal", "nodo", "sesgo", "ticket",
    "mecanismo", "est. canon", "saturacion", "saturación", "probabilidad",
    "win rate", "score", "no documentado", "donad", "horas-crédito",
    "horas credito",
]
NOMBRE_PROHIBIDO = re.compile(r"\b(taller|servicio|mesa de desarme|capacitación)\b", re.I)


def _norm(s):
    s = unicodedata.normalize("NFD", s.lower())
    s = "".join(c for c in s if unicodedata.category(c) != "Mn")
    return [w for w in s.split() if w.isalpha()]


def match_title(a, b):
    A, B_ = _norm(a), _norm(b)
    return len(set(A) & set(B_)) / max(1, len(set(A) | set(B_))) >= 0.5


def _propuesta(bloque, beneficiario, componentes, num, etiqueta):
    texto = bloque["que_es"]
    palabras = len(re.findall(r"\w+", texto))
    if not 150 <= palabras <= 250:
        raise SystemExit("R%s %s: %d palabras (debe ser 150-250)" % (num, etiqueta, palabras))
    low = texto.lower()
    for t in PROHIBIDOS:
        if " " in t or "." in t:
            hit = t in low
        else:
            hit = re.search(r"\b" + re.escape(t) + r"\b", low)
        if hit:
            raise SystemExit("R%s %s: término prohibido '%s'" % (num, etiqueta, t))
    if NOMBRE_PROHIBIDO.search(bloque["nombre"]):
        raise SystemExit("R%s %s: el nombre no puede ser taller/servicio" % (num, etiqueta))
    if len(bloque["como"]) != 4:
        raise SystemExit("R%s %s: 'como' debe tener 4 pasos" % (num, etiqueta))
    return {
        "nombre": bloque["nombre"],
        "claim": bloque["claim"],
        "que_es": texto,
        "como": list(bloque["como"]),
        "beneficiario": beneficiario,
        "componentes": list(componentes),
        "costo": bloque["costo"],
        "metricas": [bloque["metrica"]],
    }


def main():
    with open(SRC_RETO, encoding="utf-8") as f:
        src = json.load(f)

    out = {"meta": {
        "titulo": "Dossier de soluciones · Latam 2026",
        "subtitulo": "9 retos del comité · pilotos por validar",
        "certamen": "latam",
        "fecha": "",
    }, "retos": []}

    for R, src_r in zip(B.RETOS, src["retos"]):
        if not match_title(R["titulo"], src_r["titulo"]):
            raise SystemExit("fallo match canon/repo: %s vs %s" % (
                R["titulo"], src_r["titulo"]))
        num = R["num"]
        C = CONTENIDO[num]
        a = _propuesta(C["a"], R["nomina"][0], R["o1"]["comp"], num, "opción 01")
        b = _propuesta(C["b"], R["nomina"][0], R["o2"]["comp"], num, "opción 02")

        cat_porque = src_r.get("categoria_porque", "")
        if num == "01":
            cat_porque = ("El valor se mide en motores que vuelven a trabajar y en familias "
                          "que evitan comprar una máquina nueva, no en unidades vendidas.")

        ret = {
            "id": num,
            "titulo": R["titulo"],
            "categoria": src_r.get("categoria", ""),
            "categoria_porque": cat_porque,
            "descripcion": src_r.get("descripcion", ""),
            "ods": [tuple(o) for o in src_r.get("ods", [])],
            "propuesta": a,
            "alterna": b,
            "cadena": {
                "problema": R["cadena"]["problema"],
                "causa_raiz": R["cadena"]["causa"],
                "insight": R["cadena"]["insight"],
                "solucion": ("%s y %s: dos rutas independientes sobre el mismo problema."
                             % (C["a"]["nombre"], C["b"]["nombre"])),
                "metrica": ("%s (Opción 01); %s (Opción 02)."
                            % (C["a"]["metrica"], C["b"]["metrica"])),
            },
            "senal": src_r.get("senal", ""),
            "analogias": [
                {**an, "por_que": an.get("por_que", "").replace(
                    "Es el mismo mecanismo:", "Es la misma lógica:")}
                for an in src_r.get("analogias", [])
            ],
            "realidad": {"a": C["a"]["paga"], "b": C["b"]["paga"]},
            "detalles": [
                ["Ya existe", C["a"]["ya_existe"] + " / " + C["b"]["ya_existe"]],
                ["Quién paga", C["a"]["paga"] + " / " + C["b"]["paga"]],
                ["Por validar", C["a"]["validar"] + " / " + C["b"]["validar"]],
            ],
            "insignias": [list(i) for i in src_r.get("insignias", [])],
            "pitch": R.get("pitch", ""),
        }
        out["retos"].append(ret)

    dst = os.path.join(HERE, "soluciones.json")
    with open(dst, "w", encoding="utf-8") as f:
        json.dump(out, f, ensure_ascii=False, indent=2)
    print("OK", dst)


if __name__ == "__main__":
    main()
