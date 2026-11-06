#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
Modelo de tipo de solución SIRLI.

Clasifica cada video en uno de cuatro tipos de solución a partir de:
  - description (texto del video en YouTube)
  - challenge_theme (tema del desafío)
  - t_* flags (transcripción: t_demo, t_solucion, t_problema, etc.)
  - category (ÁREA INNOVACIÓN / ÁREA IMPACTO SOCIAL)

Tipos:
  producto   -> objeto físico vendible (dispositivo, kit, panel, filtro, medidor)
  fisico     -> infraestructura/construcción (vivienda, muro, piso, techo, cisterna, mobiliario)
  electronica-> hardware con circuito/programación (sensor, arduino, IoT, app, QR, microcontrolador)
  integrado  -> combina >=2 de los tipos anteriores (sistema híbrido)

Luego compara tasas de primer lugar por tipo, separando:
  - sede (NICARAGUA)          -> nacional
  - nacional (LATAM)          -> nacional
  - internacional (LATAM)     -> latam

Salidas:
  research/sirli/analisis/modelo_solucion.json
  research/sirli/analisis/modelo_solucion.md
  research/sirli/analisis/figuras/modelo_solucion_tipo.png
"""
from __future__ import annotations

import json
import re
from collections import Counter
from pathlib import Path

import numpy as np
import pandas as pd

ROOT = Path(__file__).resolve().parents[1]
AN = ROOT / "research" / "sirli" / "analisis"
FIG = AN / "figuras"
FIG.mkdir(parents=True, exist_ok=True)

AZUL, ROJO, ACERO, GRIS, INK = "#1d45b9", "#f81110", "#2aa7ad", "#9aa3b2", "#111827"

# --------------------------------------------------------------------------
# Palabras clave para clasificar tipo de solución
# --------------------------------------------------------------------------
PRODUCTO_KW = [
    "producto", "dispositivo", "kit", "aparato", "herramienta", "prototipo",
    "máquina", "maquina", "equipo", "placa", "panel", "filtro", "sensor",
    "medidor", "detector", "alarma", "interruptor", "contador", "reloj",
    "contenedor", "tanque", "cisterna", "barril", "pileta", "biodigestor",
    "generador", "turbina", "motor", "batería", "bateria", "panel solar",
    "celda", "modulo", "modulo", "dispositivo", "artefacto", "utensilio",
]
FISICO_KW = [
    "vivienda", "casa", "hogar", "construcción", "construccion", "muro",
    "piso", "techo", "bloque", "ladrillo", "concreto", "cemento", "estructura",
    "infraestructura", "mobiliario", "banca", "parada", "vivienda digna",
    "modulo", "módulo", "refugio", "albergue", "piso", "pared", "paredes",
    "cimiento", "fundación", "fundacion", "acabado", "revestimiento",
]
ELECTRONICA_KW = [
    "sensor", "arduino", "circuito", "placa", "microcontrolador", "iot",
    "telemetría", "telemetria", "lora", "gps", "wifi", "bluetooth",
    "app", "aplicación", "aplicacion", "software", "sistema de alerta",
    "detector", "medidor electrónico", "medidor electronico", "panel de control",
    "rele", "relé", "módulo", "modulo", "electrónica", "electronica",
    "placa de circuito", "firmware", "código", "codigo", "programa",
    "qr", "código qr", "codigo qr", "automatización", "automatizacion",
    "dron", "drones", "robot", "robótica", "robotica", "actuador",
]

# Rangos de año para clasificar nacional vs LATAM
def es_latam(collection: str) -> bool:
    """internacional y nacional son LATAM; sede es nacional (NICARAGUA)."""
    return collection in ("nacional", "internacional")


def clasifica_tipo(row: pd.Series) -> str:
    """Devuelve 'producto', 'fisico', 'electronica', 'integrado' o 'no_clasificado'."""
    texto = " ".join([
        str(row.get("description") or ""),
        str(row.get("challenge_theme") or ""),
        str(row.get("title") or ""),
    ]).lower()
    t = texto

    flags = {
        "producto": any(k in t for k in PRODUCTO_KW),
        "fisico": any(k in t for k in FISICO_KW),
        "electronica": any(k in t for k in ELECTRONICA_KW),
    }

    # Usar flags de transcripción como refuerzo
    t_demo = pd.to_numeric(row.get("t_demo"), errors="coerce")
    t_solucion = pd.to_numeric(row.get("t_solucion"), errors="coerce")
    if pd.notna(t_demo) and t_demo >= 1:
        # demo suele implicar producto o electronica funcionando
        flags["producto"] = flags["producto"] or True
    if pd.notna(t_solucion) and t_solucion >= 1:
        flags["producto"] = flags["producto"] or True

    activos = [k for k, v in flags.items() if v]
    if len(activos) == 0:
        return "no_clasificado"
    if len(activos) >= 2:
        return "integrado"
    return activos[0]


def carga() -> pd.DataFrame:
    df = pd.read_csv(AN / "dataset_videos.csv", encoding="utf-8-sig")
    df = df.rename(columns={c: c.strip().lstrip("\ufeff") for c in df.columns})
    for c in ("won", "place_best", "year", "has_meta", "has_text"):
        df[c] = pd.to_numeric(df[c], errors="coerce")
    df["challenge_name"] = df["challenge_name"].fillna("").astype(str).str.strip()
    df["category"] = df["category"].fillna("").astype(str).str.strip()
    df["country"] = df["country"].fillna("").astype(str).str.upper().str.strip()
    df["sede"] = df["sede"].fillna("").astype(str).str.strip()
    df["team"] = df["team"].fillna("").astype(str).str.strip()
    df["description"] = df["description"].fillna("").astype(str)
    df["title"] = df["title"].fillna("").astype(str)
    df["challenge_theme"] = df["challenge_theme"].fillna("").astype(str)
    # solo sede 2021+ (muestra fiable: podio completo desde 2021)
    df = df[(df["collection"] == "sede") & (df["year"] >= 2021)].copy()
    df["tipo"] = df.apply(clasifica_tipo, axis=1)
    df["es_latam"] = df["collection"].apply(es_latam)
    return df


def wilson(k: int, n: int, z: float = 1.96) -> tuple[float, float]:
    if n == 0:
        return (0.0, 0.0)
    p = k / n
    d = 1 + z * z / n
    c = (p + z * z / (2 * n)) / d
    m = z * np.sqrt(p * (1 - p) / n + z * z / (4 * n * n)) / d
    return (max(0.0, c - m), min(1.0, c + m))


def fmt_pct(x: float) -> str:
    if x is None or (isinstance(x, float) and np.isnan(x)):
        return "—"
    return f"{x * 100:.1f}%".replace(".", ",")


def analiza_tipo(df: pd.DataFrame, label: str) -> dict:
    """Tabla de tipo de solución vs tasa de primer lugar para un subconjunto."""
    sub = df.copy()
    res = {"label": label, "n": int(len(sub)), "por_tipo": {}}
    for tipo in ["producto", "fisico", "electronica", "integrado", "no_clasificado"]:
        t = sub[sub.tipo == tipo]
        if len(t) < 10:
            res["por_tipo"][tipo] = {"n": int(len(t)), "tasa": None, "ic": None, "won": int(t.won.sum()) if len(t) else 0}
            continue
        k = int(t.won.sum())
        n = int(len(t))
        lo, hi = wilson(k, n)
        res["por_tipo"][tipo] = {"n": n, "tasa": round(k / n, 4), "ic": [round(lo, 4), round(hi, 4)], "won": k}
    # comparación chi2 entre tipos clasificados (excluye no_clasificado)
    clas = sub[sub.tipo != "no_clasificado"]
    if len(clas) >= 40 and clas.tipo.nunique() >= 2:
        tab = pd.crosstab(clas.tipo, clas.won)
        if tab.shape[0] >= 2 and tab.shape[1] >= 2:
            from scipy import stats
            chi2, p, dof, _ = stats.chi2_contingency(tab.values)
            res["chi2"] = round(float(chi2), 3)
            res["p"] = round(float(p), 4)
            res["dof"] = int(dof)
    return res


def main() -> int:
    df = carga()
    print(f"Filas modeladas (sede 2021+): {len(df)}")
    print(f"Tipos: {df.tipo.value_counts().to_dict()}")
    print()

    out = {"filas": int(len(df)), "tipos_globales": df.tipo.value_counts().to_dict(),
           "nacional": {}, "latam": {}}

    # Nacional = sede NICARAGUA
    nic = df[df.country == "NICARAGUA"]
    out["nacional"] = analiza_tipo(nic, "Nacional (sede NICARAGUA, 2021+)")
    print(f"Nacional NIC: n={len(nic)}")

    # LATAM = nacional + internacional (excluye NIC sede para no duplicar)
    latam = df[df.es_latam == True]
    out["latam"] = analiza_tipo(latam, "LATAM (nacional+internacional, 2021+)")
    print(f"LATAM: n={len(latam)}")

    # También por país dentro de LATAM
    out["por_pais_latam"] = {}
    for pais in sorted(latam.country.unique()):
        sub = latam[latam.country == pais]
        if len(sub) >= 30:
            out["por_pais_latam"][pais] = analiza_tipo(sub, f"{pais} (LATAM)")

    # Guardar JSON
    destino = AN / "modelo_solucion.json"
    destino.write_text(json.dumps(out, indent=2, ensure_ascii=False), encoding="utf-8")
    print(f"\nEscrito: {destino}")

    # Guardar markdown
    md = generar_md(out)
    (AN / "modelo_solucion.md").write_text(md, encoding="utf-8")
    print("Escrito: analisis/modelo_solucion.md")

    # Figura
    genera_figura(out)
    print(f"Escrito: {FIG / 'modelo_solucion_tipo.png'}")
    return 0


def generar_md(out: dict) -> str:
    lines = [
        "# Modelo de tipo de solución SIRLI",
        "",
        "Clasificación automática de cada video en uno de cuatro tipos de solución:",
        "**producto** (objeto vendible), **físico** (infraestructura/construcción),",
        "**electrónica** (hardware con circuito/programación), **integrado** (mezcla de ≥2).",
        "",
        "Muestra: sede 2021–2026 (podio completo). Separado nacional vs LATAM.",
        "",
    ]
    for clave in ("nacional", "latam"):
        sec = out[clave]
        lines.append(f"## {sec['label']}")
        lines.append(f"Filas: {sec['n']}")
        lines.append("")
        lines.append("| Tipo | n | Tasa 1.º | IC 95% |")
        lines.append("|---|---|---|---|")
        for tipo in ["producto", "fisico", "electronica", "integrado"]:
            d = sec["por_tipo"].get(tipo, {})
            if d.get("tasa") is None:
                lines.append(f"| {tipo} | {d.get('n',0)} | — | — |")
            else:
                ic = d["ic"]
                lines.append(f"| {tipo} | {d['n']} | {fmt_pct(d['tasa'])} | [{fmt_pct(ic[0])}, {fmt_pct(ic[1])}] |")
        lines.append("")
        if "chi2" in sec:
            lines.append(f"Chi² entre tipos: χ²={sec['chi2']}, p={sec['p']}, dof={sec['dof']}")
            lines.append("")
    lines.append("## Por país (LATAM, n≥30)")
    lines.append("| País | producto | físico | electrónica | integrado |")
    lines.append("|---|---|---|---|---|")
    for pais, sec in out.get("por_pais_latam", {}).items():
        fila = [pais]
        for tipo in ["producto", "fisico", "electronica", "integrado"]:
            d = sec["por_tipo"].get(tipo, {})
            fila.append(fmt_pct(d["tasa"]) if d.get("tasa") is not None else "—")
        lines.append("| " + " | ".join(fila) + " |")
    return "\n".join(lines)


def genera_figura(out: dict) -> None:
    import matplotlib
    matplotlib.use("Agg")
    import matplotlib.pyplot as plt

    tipos = ["producto", "fisico", "electronica", "integrado"]
    x = np.arange(len(tipos))
    w = 0.35

    fig, axes = plt.subplots(1, 2, figsize=(10, 4), dpi=160)

    for ax, (clave, titulo) in zip(axes, [("nacional", "Nacional (sede NIC)"), ("latam", "LATAM")]):
        sec = out[clave]
        tasas = []
        ns = []
        for tipo in tipos:
            d = sec["por_tipo"].get(tipo, {})
            tasas.append(d["tasa"] * 100 if d.get("tasa") is not None else 0)
            ns.append(d["n"])
        bars = ax.bar(x, tasas, width=w, color=[AZUL, ROJO, ACERO, GRIS])
        for i, (bar, n_) in enumerate(zip(bars, ns)):
            ax.text(bar.get_x() + bar.get_width() / 2, bar.get_height() + 1,
                    f"{tasas[i]:.0f}%\n(n={n_})", ha="center", va="bottom", fontsize=7.5)
        ax.set_xticks(x, [t.upper() for t in tipos])
        ax.set_ylabel("% de primeros lugares")
        ax.set_title(titulo)
        ax.set_ylim(0, max(tasas) * 1.35 + 5)
        ax.axhline(sec["n"] and sec["por_tipo"].get("producto", {}).get("tasa", 0.4) * 100,
                   color=INK, ls=":", lw=0.8)

    fig.tight_layout()
    fig.savefig(FIG / "modelo_solucion_tipo.png", facecolor="white")
    plt.close(fig)


if __name__ == "__main__":
    raise SystemExit(main())
