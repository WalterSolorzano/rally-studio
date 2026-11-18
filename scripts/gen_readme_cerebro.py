"""Genera `assets/readme/cerebro.png` desde los datos reales del repositorio.

Fuentes (nada se escribe a mano aqui):
  - `brain/corpus/graphify-out/graph.json`  -> nodos, aristas, comunidades, documentos.
  - `research/sirli/winners.jsonl`          -> sedes, podios nacionales e internacionales.

El PNG se dibuja con el token del proyecto (`brand/tokens.css`) y las fuentes de
`docs/assets/fuentes/`. Si el grafo no existe, el script falla en vez de inventar cifras.
"""

from __future__ import annotations

import collections
import json
import random
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
GRAFO = ROOT / "brain" / "corpus" / "graphify-out" / "graph.json"
WINNERS = ROOT / "research" / "sirli" / "winners.jsonl"
SALIDA = ROOT / "assets" / "readme" / "cerebro.png"

ANCHO, ALTO = 3200, 1640
CUÑAS = 14  # comunidades dibujadas como cuña propia; el resto va al anillo final


def leer_grafo() -> dict:
    if not GRAFO.exists():
        sys.exit(f"Falta el grafo: {GRAFO}. Corre `graphify update brain/corpus` primero.")
    datos = json.loads(GRAFO.read_text(encoding="utf-8"))
    nodos = datos["nodes"]
    aristas = datos["links"]
    docs = {n["source_file"] for n in nodos if n.get("source_file")}
    por_comunidad = collections.defaultdict(list)
    for n in nodos:
        por_comunidad[n.get("community")].append(n)
    nombres = {}
    for n in nodos:
        nombres.setdefault(n.get("community"), n.get("community_name") or "sin nombre")
    grupos = sorted(por_comunidad.items(), key=lambda kv: len(kv[1]), reverse=True)
    return {
        "nodos": len(nodos),
        "aristas": len(aristas),
        "comunidades": len(por_comunidad),
        "docs": len(docs),
        "grupos": [(nombres[cid], miembros) for cid, miembros in grupos],
    }


def leer_ganadores() -> dict:
    filas = [
        json.loads(linea)
        for linea in WINNERS.read_text(encoding="utf-8").splitlines()
        if linea.strip()
    ]
    coleccion = collections.Counter(f.get("collection") for f in filas)
    sede = [f for f in filas if f.get("collection") == "sede"]
    por_anio = collections.Counter(f.get("year") for f in sede)
    paises = collections.Counter(
        (f.get("country") or "?", f.get("country_code") or "??")
        for f in filas
        if f.get("collection") == "internacional"
    )
    return {
        "sedes": coleccion["sede"],
        "nacional": coleccion["nacional"],
        "internacional": coleccion["internacional"],
        "anios": sorted(por_anio),
        "por_anio": dict(por_anio),
        "paises": paises.most_common(),
    }


def cuñas_svg(grupos: list[tuple[str, list[dict]]]) -> str:
    """Mapa radial: una cuña por comunidad, un punto por nodo."""
    cx, cy = 960, 820          # centro dentro del panel derecho
    r_min, r_max = 262, 610    # corona
    total = sum(len(m) for _, m in grupos)
    dibujadas = grupos[:CUÑAS]
    resto = grupos[CUÑAS:]
    partes: list[str] = []
    angulo = -90.0
    escala = total and 360.0 / total or 0.0
    etiquetas: list[tuple[str, float, float]] = []
    usados: list[tuple[float, str]] = []

    for indice, (nombre, miembros) in enumerate(dibujadas):
        arco = max(len(miembros) * escala, 1.6)
        inicio, fin = angulo, angulo + arco * 0.92
        angulo += arco
        rnd = random.Random(nombre)
        relleno = 0.045 if indice % 2 == 0 else 0.02
        partes.append(_sector(cx, cy, r_min, r_max, inicio, fin, f"rgba(220,231,248,{relleno})"))
        if arco >= 7.0:
            etiquetas.append((_limpiar(nombre), (inicio + fin) / 2, arco))
        # nodo central de la cuña = el mas conectado del grupo
        hub = miembros[0]["id"]
        puntos = []
        hx = cx + (r_min + 70) * _cos((inicio + fin) / 2)
        hy = cy + (r_min + 70) * _sin((inicio + fin) / 2)
        puntos.append(
            f'<circle cx="{hx:.1f}" cy="{hy:.1f}" r="9" fill="#eaf1fb"/>'
            f'<circle cx="{hx:.1f}" cy="{hy:.1f}" r="16" fill="none" stroke="#2aa7ad" stroke-opacity=".55"/>'
        )
        for n in miembros[1:]:
            t = rnd.random()
            radio = r_min + (r_max - r_min) * (0.08 + 0.92 * t ** 0.55)
            ang = inicio + rnd.random() * (fin - inicio)
            x = cx + radio * _cos(ang)
            y = cy + radio * _sin(ang)
            r = 3.4 + rnd.random() * 5.6
            op = 0.55 + 0.45 * (1 - t)
            if n["id"] == hub:
                continue
            puntos.append(
                f'<circle cx="{x:.1f}" cy="{y:.1f}" r="{r:.1f}" fill="#dfe9f7" fill-opacity="{op:.2f}"/>'
            )
        partes += puntos
        partes.append(
            _arco(cx, cy, r_max + 40, inicio, fin, "rgba(255,255,255,.34)", 3)
            + _arco(cx, cy, r_min - 22, inicio, fin, "rgba(255,255,255,.12)", 2)
        )

    if resto:
        arco = max(sum(len(m) for _, m in resto) * escala, 2.0)
        inicio, fin = angulo, angulo + arco
        rnd = random.Random("resto")
        for _ in range(min(sum(len(m) for _, m in resto), 120)):
            radio = r_min + (r_max - r_min) * rnd.random() ** 0.6
            ang = inicio + rnd.random() * (fin - inicio)
            partes.append(
                f'<circle cx="{cx + radio * _cos(ang):.1f}" cy="{cy + radio * _sin(ang):.1f}" '
                f'r="{3 + rnd.random() * 4:.1f}" fill="#8fa6c4" fill-opacity=".45"/>'
            )
        partes.append(_arco(cx, cy, r_max + 40, inicio, fin, "rgba(255,255,255,.12)", 2))
        etiquetas.append((f"{len(resto)} comunidades menores", (inicio + fin) / 2, fin - inicio))

    tope = r_max + 78
    for nombre, ang, arco in etiquetas:
        corto = nombre if len(nombre) <= 26 else nombre[:25] + "…"
        ancho = len(corto) * 8.6 + 20          # ancho aproximado del rotulo, en px del viewBox
        radio = tope
        for _ in range(6):                      # aleja el rotulo hasta que su arco no choque
            hueco = ancho / radio * 57.3        # grados que ocupa ese ancho a ese radio
            if not any(abs(((a - ang) + 180) % 360 - 180) < (hueco + 7) / 2 for a, _ in usados):
                break
            radio += 46
        usados.append((ang, corto))
        partes.append(_etiqueta(corto, cx, cy, radio, ang))
    return f'<svg class="mapa" viewBox="0 0 1920 1640" preserveAspectRatio="xMidYMid meet">{"".join(partes)}</svg>'


def _cos(grados: float) -> float:
    import math

    return math.cos(math.radians(grados))


def _sin(grados: float) -> float:
    import math

    return math.sin(math.radians(grados))


def _limpiar(nombre: str) -> str:
    limpio = nombre.replace(".md", "").replace(".pdf", "").replace("_", " ").strip()
    for corte in (" — ", " - ", ":"):
        limpio = limpio.split(corte)[0]
    return limpio


def _sector(cx: float, cy: float, r_in: float, r_out: float, inicio: float, fin: float, color: str) -> str:
    grande = 1 if (fin - inicio) > 180 else 0
    xi1, yi1 = cx + r_in * _cos(inicio), cy + r_in * _sin(inicio)
    xi2, yi2 = cx + r_in * _cos(fin), cy + r_in * _sin(fin)
    xo1, yo1 = cx + r_out * _cos(fin), cy + r_out * _sin(fin)
    xo2, yo2 = cx + r_out * _cos(inicio), cy + r_out * _sin(inicio)
    return (
        f'<path d="M {xi1:.1f} {yi1:.1f} A {r_in} {r_in} 0 {grande} 1 {xi2:.1f} {yi2:.1f} '
        f'L {xo1:.1f} {yo1:.1f} A {r_out} {r_out} 0 {grande} 0 {xo2:.1f} {yo2:.1f} Z" fill="{color}"/>'
    )


def _arco(cx: float, cy: float, r: float, inicio: float, fin: float, color: str, grosor: float) -> str:
    x1, y1 = cx + r * _cos(inicio), cy + r * _sin(inicio)
    x2, y2 = cx + r * _cos(fin), cy + r * _sin(fin)
    grande = 1 if (fin - inicio) > 180 else 0
    return (
        f'<path d="M {x1:.1f} {y1:.1f} A {r} {r} 0 {grande} 1 {x2:.1f} {y2:.1f}" '
        f'fill="none" stroke="{color}" stroke-width="{grosor}"/>'
    )


def _etiqueta(texto: str, cx: float, cy: float, r: float, ang: float) -> str:
    mitad = ang % 360
    x, y = cx + r * _cos(ang), cy + r * _sin(ang)
    rot = ang + 90
    if 90 < mitad < 270:
        rot += 180
        ancla = "end"
    else:
        ancla = "start"
    corto = texto if len(texto) <= 24 else texto[:23] + "…"
    return (
        f'<text x="{x:.1f}" y="{y:.1f}" transform="rotate({rot:.1f} {x:.1f} {y:.1f})" '
        f'text-anchor="{ancla}" class="eje">{_esc(corto)}</text>'
    )


def _esc(texto: str) -> str:
    return (
        str(texto)
        .replace("&", "&amp;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
    )


def html(grafo: dict, gan: dict) -> str:
    pesos = grafo["grupos"][:20]
    maximo = max(len(m) for _, m in pesos) or 1
    barras = "".join(
        f'<span style="flex:{len(m)/maximo:.3f}"></span>' for _, m in pesos
    )
    anios = gan["anios"]
    tope = max(gan["por_anio"].values()) or 1
    columnas = "".join(
        f'<div class="col"><b>{gan["por_anio"][a]:,}</b><i style="height:{gan["por_anio"][a] / tope * 190:.0f}px"></i><u>{str(a)[2:]}</u></div>'.replace(",", ".")
        for a in anios
    )
    paises = "".join(
        f'<div class="pais"><span class="chip">{codigo}</span><b>{_esc(nombre.title())}</b><i>{cuenta}</i></div>'
        for (nombre, codigo), cuenta in gan["paises"]
    )
    return f"""<!doctype html>
<html lang="es"><head><meta charset="utf-8"><style>
@font-face{{font-family:"PJS";src:url("{(ROOT / 'docs/assets/fuentes/PlusJakartaSans-400.ttf').as_uri()}")}}
@font-face{{font-family:"PJS";font-weight:800;src:url("{(ROOT / 'docs/assets/fuentes/PlusJakartaSans-800.ttf').as_uri()}")}}
@font-face{{font-family:"PJS";font-weight:700;src:url("{(ROOT / 'docs/assets/fuentes/PlusJakartaSans-700.ttf').as_uri()}")}}
@font-face{{font-family:"JBM";src:url("{(ROOT / 'docs/assets/fuentes/JetBrainsMono-400.ttf').as_uri()}")}}
@font-face{{font-family:"JBM";font-weight:600;src:url("{(ROOT / 'docs/assets/fuentes/JetBrainsMono-600.ttf').as_uri()}")}}
:root{{--primary:#1d45b9;--accent:#2aa7ad;--bg:#0a1424;--tinta:#eaf1fb;--tenue:#7f92ad;--linea:rgba(255,255,255,.12)}}
*{{margin:0;padding:0;box-sizing:border-box}}
body{{width:{ANCHO}px;height:{ALTO}px;background:radial-gradient(1200px 900px at 78% 45%,#10213c 0%,var(--bg) 70%);
  color:var(--tinta);font-family:"PJS",sans-serif;overflow:hidden;position:relative}}
.lienzo{{position:relative;width:100%;height:100%;display:grid;grid-template-columns:1180px 1fr;gap:40px;padding:110px 120px}}
.eyebrow{{font-family:"JBM",monospace;font-size:19px;letter-spacing:.42em;color:var(--accent);text-transform:uppercase}}
.kpis{{display:flex;gap:96px;margin-top:52px}}
.kpi b{{display:block;font-family:"JBM",monospace;font-weight:600;font-size:118px;line-height:.92;letter-spacing:-.03em}}
.kpi span{{display:block;margin-top:14px;font-family:"JBM",monospace;font-size:19px;letter-spacing:.3em;color:var(--tenue);text-transform:uppercase}}
h2{{margin-top:64px;padding-top:34px;border-top:1px solid var(--linea);font-family:"JBM",monospace;font-size:17px;
  font-weight:400;letter-spacing:.36em;color:var(--tenue);text-transform:uppercase}}
.mini{{display:flex;gap:74px;margin-top:26px}}
.mini div b{{font-family:"JBM",monospace;font-size:44px;font-weight:600;letter-spacing:-.02em}}
.mini div span{{display:block;margin-top:8px;font-family:"JBM",monospace;font-size:15px;letter-spacing:.26em;color:var(--tenue);text-transform:uppercase}}
.paises{{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:14px 22px;margin-top:22px;width:1000px}}
.pais{{display:flex;align-items:center;gap:12px;font-size:21px;white-space:nowrap}}
.chip{{font-family:"JBM",monospace;font-size:15px;letter-spacing:.08em;width:52px;height:34px;display:grid;place-items:center;
  border:1px solid rgba(255,255,255,.28);border-radius:3px;background:rgba(29,69,185,.30);color:#cfdcf2}}
.pais b{{font-weight:700}} .pais i{{font-family:"JBM",monospace;font-style:normal;color:var(--tenue)}}
.barra{{display:flex;gap:4px;height:16px;margin-top:26px;width:1000px}}
.barra span{{background:linear-gradient(180deg,#dce7f8,#9fb6d8);border-radius:1px;opacity:.85}}
.anios{{display:flex;align-items:flex-end;gap:26px;height:250px;margin-top:40px}}
.col{{display:flex;flex-direction:column;align-items:center;gap:10px;width:64px}}
.col b{{font-family:"JBM",monospace;font-size:17px;color:var(--tenue);font-weight:400}}
.col i{{width:64px;background:linear-gradient(180deg,#eef4ff,#b9cbe6);opacity:.9}}
.col u{{font-family:"JBM",monospace;font-size:17px;text-decoration:none;color:var(--tenue);letter-spacing:.1em}}
.derecha{{position:relative}}
.mapa{{position:absolute;inset:0;width:100%;height:100%}}
.eje{{font-family:"JBM",monospace;font-size:15px;fill:#9cb0cb;letter-spacing:.06em}}
.centro{{position:absolute;left:960px;top:820px;transform:translate(-50%,-50%);text-align:center;pointer-events:none}}
.centro b{{display:block;font-family:"JBM",monospace;font-size:132px;font-weight:600;letter-spacing:-.04em}}
.centro span{{display:block;margin-top:6px;font-family:"JBM",monospace;font-size:17px;letter-spacing:.34em;color:var(--tenue);text-transform:uppercase}}
.aro{{position:absolute;left:960px;top:820px;width:1180px;height:1180px;transform:translate(-50%,-50%);
  border:1px solid rgba(42,167,173,.35);border-radius:50%}}
.pie{{position:absolute;left:120px;bottom:96px;font-family:"JBM",monospace;font-size:15px;letter-spacing:.22em;color:#5f728c;text-transform:uppercase}}
</style></head><body><div class="lienzo">
<div>
  <div class="eyebrow">Corpus compilado · Rally Studio</div>
  <div class="kpis">
    <div class="kpi"><b>{grafo['nodos']}</b><span>nodos</span></div>
    <div class="kpi"><b>{grafo['aristas']}</b><span>relaciones</span></div>
    <div class="kpi"><b>{grafo['comunidades']}</b><span>comunidades</span></div>
  </div>
  <div class="mini">
    <div><b>{grafo['docs']}</b><span>documentos</span></div>
    <div><b>{gan['sedes']:,}</b><span>sedes mapeadas</span></div>
    <div><b>{gan['nacional']}</b><span>podios nacional</span></div>
    <div><b>{gan['internacional']}</b><span>podios internacional</span></div>
    <div><b>{len(gan['anios'])}</b><span>años de casos</span></div>
  </div>
  <h2>Podios internacionales por país</h2>
  <div class="paises">{paises}</div>
  <h2>Peso de cada comunidad del corpus</h2>
  <div class="barra">{barras}</div>
  <h2>Sedes por año</h2>
  <div class="anios">{columnas}</div>
</div>
<div class="derecha">
  <div class="aro"></div>
  {cuñas_svg(grafo['grupos'])}
  <div class="centro"><b>{grafo['nodos']}</b><span>nodos indexados</span></div>
</div>
<div class="pie">Una sola red: {grafo['aristas']} relaciones, {grafo['comunidades']} comunidades, {grafo['docs']} documentos enlazados</div>
</div></body></html>"""


def main() -> None:
    grafo = leer_grafo()
    gan = leer_ganadores()
    SALIDA.parent.mkdir(parents=True, exist_ok=True)
    temporal = ROOT / "assets" / "readme" / "_cerebro.html"
    temporal.write_text(html(grafo, gan), encoding="utf-8")
    try:
        from playwright.sync_api import sync_playwright
    except ImportError:
        sys.exit("Falta playwright: pip install playwright && playwright install chromium")

    with sync_playwright() as pw:
        navegador = pw.chromium.launch()
        pagina = navegador.new_page(viewport={"width": ANCHO, "height": ALTO}, device_scale_factor=1)
        pagina.goto(temporal.as_uri())
        pagina.wait_for_timeout(700)
        pagina.screenshot(path=str(SALIDA))
        navegador.close()
    temporal.unlink(missing_ok=True)
    print(
        f"{SALIDA.relative_to(ROOT)} -> {grafo['nodos']} nodos, {grafo['aristas']} relaciones, "
        f"{grafo['comunidades']} comunidades, {grafo['docs']} documentos, "
        f"{gan['sedes']} sedes, {gan['nacional']} nacionales, {gan['internacional']} internacionales"
    )


if __name__ == "__main__":
    main()
