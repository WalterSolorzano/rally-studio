# -*- coding: utf-8 -*-
"""Regenera dossier_latam_2026.md desde soluciones.json (fuente única de esta carpeta).

Sin jerga interna: nada de Nómina / Jugador / Canal / Nodo / Sesgos / Ticket / mecanismo.
Cada solución abre con la narrativa completa (150-250 palabras) y cierra con
Ya existe / Quién paga / Por validar.
"""
import json
import os

HERE = os.path.dirname(os.path.abspath(__file__))


BLOQUES = ["Ya existe", "Quién paga", "Por validar"]


def main():
    with open(os.path.join(HERE, "soluciones.json"), encoding="utf-8") as f:
        d = json.load(f)
    md = []
    md.append("# DOSSIER LATAM 2026 — 9 RETOS · PILOTO EN [CIUDAD], REPLICABLE EN AMÉRICA LATINA")
    md.append("")
    md.append("**Modo:** Latam (28 h). Presupuesto en USD. Sin siglas gubernamentales locales.")
    md.append("**Honestidad:** sin cifras sin fuente; lo no verificado va marcado *(estimación propia)*. "
              "Los precedentes quedan \"por cruzar\" contra `retos_razonamiento.json`.")
    md.append("")
    md.append("---")
    md.append("")

    for r in d["retos"]:
        md.append("## RETO %s · %s" % (r["id"], r["titulo"]))
        md.append("")
        md.append("**Categoría:** %s — %s" % (r["categoria"], r["categoria_porque"]))
        md.append("")
        md.append("**El reto:** %s" % r["descripcion"])
        md.append("")
        md.append("**ODS elegidos y por qué**")
        for n, nombre, just in r["ods"]:
            md.append("- **%s · %s.** %s" % (n, nombre, just))
        md.append("")
        if r.get("insignias"):
            md.append("**Insignias que aplican:** " + " · ".join(
                "%s (%s)" % (a, b) for a, b in r["insignias"]))
            md.append("")
        c = r["cadena"]
        md.append("**Cadena del problema**")
        md.append("- Problema: %s" % c["problema"])
        md.append("- Causa raíz: %s" % c["causa_raiz"])
        md.append("- Causa de la causa: %s" % c["insight"])
        md.append("- Solución: %s" % c["solucion"])
        md.append("- Métrica: %s" % c["metrica"])
        md.append("")
        md.append("### Dos soluciones posibles para este reto")
        md.append("")

        det = {k.lower(): v for k, v in (r.get("detalles") or [])}

        for lbl, key, real in (("Opción 01", "propuesta", "a"), ("Opción 02", "alterna", "b")):
            s = r[key]
            md.append("**%s — %s**" % (lbl, s["nombre"]))
            md.append("")
            md.append("*%s*" % s["claim"])
            md.append("")
            md.append("**Qué es.** %s" % s["que_es"])
            md.append("")
            md.append("**Cómo se ve en la práctica**")
            for i, paso in enumerate(s["como"], 1):
                md.append("%d. %s" % (i, paso))
            md.append("")
            md.append("- **Costo:** %s" % s["costo"])
            md.append("- **Insumos:** %s" % ", ".join(s["componentes"]))
            for m in s["metricas"]:
                md.append("- **Métrica:** %s" % m)
            md.append("- **Quién paga:** %s" % r["realidad"][real])
            md.append("")

        for b in BLOQUES:
            if b.lower() in det:
                md.append("**%s.** %s" % (b, det[b.lower()]))
                md.append("")

        md.append("**Pitch:** %s" % r["pitch"])
        md.append("")
        if r.get("senal"):
            md.append("**Señal que se repite en los ganadores.** %s" % r["senal"])
            md.append("")
        if r.get("analogias"):
            md.append("**Precedentes por tipo de solución**")
            for a in r["analogias"]:
                md.append("- %s · %s · %s. %s %s" % (
                    a.get("year", ""), a.get("equipo", ""), a.get("proyecto", ""),
                    a.get("que_hicieron", ""), a.get("por_que", "")))
            md.append("")
        md.append("**Comentarios.** Anoten aquí sus ideas, dudas y ajustes a las propuestas.")
        md.append("")
        md.append("---")
        md.append("")

    dst = os.path.join(HERE, "dossier_latam_2026.md")
    with open(dst, "w", encoding="utf-8", newline="\n") as f:
        f.write("\n".join(md))
    print("OK", dst, len(md), "lineas")


if __name__ == "__main__":
    main()
