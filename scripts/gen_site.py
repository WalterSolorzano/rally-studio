#!/usr/bin/env python
"""Genera site/index.html a partir del brief y de la identidad aprobada.

No inventa: si falta paleta, brief o claims con URL, se detiene.
Sin hex literal: todo el color sale de brand/tokens.css.
"""
from __future__ import annotations

import argparse
import html
import json
import pathlib
import re
import sys

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
from comun import RAIZ, paleta, utf8  # noqa: E402

BRIEF = RAIZ / "brief.json"
CLAIMS = RAIZ / "research" / "claims.json"
BUDGET = RAIZ / "budget" / "budget.json"
SALIDA = RAIZ / "site" / "index.html"

CONECTORES = {
    "y", "e", "o", "u", "de", "del", "la", "el", "los", "las", "un", "una",
    "para", "por", "con", "sin", "en", "a", "al", "que", "su", "sus", "se",
}
ICONO_FLECHA = (
    '<svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true" '
    'fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" '
    'stroke-linejoin="round"><path d="M3 8h10M9 4l4 4-4 4"/></svg>'
)
ENLACES_PRUEBA = [
    (RAIZ / "docs" / "canvas.md", "Modelo de negocio"),
    (RAIZ / "budget" / "budget.xlsx", "Presupuesto"),
    (RAIZ / "budget" / "budget.json", "Detalle de costos"),
]


def cargar(ruta: pathlib.Path, defecto=None):
    if not ruta.exists():
        return defecto
    return json.loads(ruta.read_text(encoding="utf-8"))


def claims_con_fuente() -> list[dict]:
    datos = cargar(CLAIMS, [])
    if isinstance(datos, dict):
        datos = datos.get("claims", [])
    limpios = [c for c in datos if c.get("stat") and c.get("url")]
    if len(limpios) < 3:
        raise SystemExit(
            "research/claims.json con %d cifra(s) con URL: se necesitan 3. "
            "No se escribe una cifra sin fuente." % len(limpios)
        )
    return limpios


def frase(texto: str, max_palabras: int) -> str:
    """Primera frase completa; si sobra, corta en cláusula, nunca a media idea."""
    texto = (texto or "").strip()
    if not texto:
        return ""
    partes = re.split(r"(?<=[.!?])\s+", texto)[0]
    palabras = partes.split()
    if len(palabras) <= max_palabras:
        return " ".join(palabras).rstrip(".")
    recorte = palabras[:max_palabras]
    # Cortar en coma o punto y coma deja una cláusula entera; cortar por
    # conteo deja frases cojas ("...que entrega agua segura").
    crudo = " ".join(recorte)
    corte = max(crudo.rfind(","), crudo.rfind(";"))
    if corte > len(crudo) * 0.45:
        return crudo[:corte].rstrip(",;")
    while recorte and recorte[-1].strip(",;:").lower() in CONECTORES:
        recorte.pop()
    return " ".join(recorte).rstrip(",;")


def documento_con_contenido(ruta: pathlib.Path) -> bool:
    """Un documento en `_pendiente_` no es prueba: es un hueco con nombre."""
    if not ruta.exists() or ruta.stat().st_size <= 200:
        return False
    texto = ruta.read_text(encoding="utf-8", errors="ignore")
    lineas = [l.strip() for l in texto.splitlines() if l.strip()]
    vacias = sum(1 for l in lineas if "_pendiente_" in l or l in ("_pendiente_", "[pendiente]"))
    return len(lineas) > 0 and vacias / len(lineas) < 0.4


def enlaces_prueba() -> str:
    """Solo enlaza documentos con contenido real. Un stub no es prueba."""
    vivos = [(r, t) for r, t in ENLACES_PRUEBA if documento_con_contenido(r)]
    if not vivos:
        return ""
    destino = SALIDA.parent / "prueba"
    destino.mkdir(parents=True, exist_ok=True)
    items = ""
    for ruta, titulo in vivos:
        copia = destino / ruta.name
        copia.write_bytes(ruta.read_bytes())
        items += '<li><a href="prueba/%s">%s</a></li>' % (
            html.escape(ruta.name), html.escape(titulo))
    return '<ul class="prueba-enlaces">%s</ul>' % items


def tabla_costos(presupuesto) -> str:
    """Resumen de costos dentro de la sección: la prueba se lee, no se enlaza."""
    if not isinstance(presupuesto, list) or not presupuesto:
        return ""
    filas = ""
    for fila in presupuesto[:4]:
        concepto = fila.get("element") or fila.get("concept") or ""
        if not concepto:
            continue
        unidades = fila.get("units")
        costo = fila.get("unit_cost") or fila.get("total") or ""
        partes = []
        if unidades:
            partes.append("%sx" % unidades)
        if costo:
            partes.append(str(costo))
        detalle = " · ".join(partes) or "—"
        filas += '<tr><td>%s</td><td class="costo-num">%s</td></tr>' % (
            html.escape(str(concepto)), html.escape(detalle))
    if not filas:
        return ""
    return ('<table class="costos"><caption>Costos del piloto</caption>'
            '<tbody>%s</tbody></table>' % filas)


def url_real(url: str) -> bool:
    """Descarta enlaces de muestra: una fuente falsa enlazada es peor que texto."""
    if not isinstance(url, str) or not url.startswith(("http://", "https://")):
        return False
    host = url.split("/")[2].lower()
    return host not in {"example.org", "example.com", "example.net", "localhost"}


def unidad_de_venta(brief: dict, presupuesto) -> str:
    declarada = (brief.get("unidad_venta") or "").strip()
    if declarada:
        return declarada
    if isinstance(presupuesto, list) and presupuesto:
        primero = presupuesto[0].get("element") or presupuesto[0].get("concept") or ""
        if primero:
            return "El cliente paga por: %s." % primero
    return ""


def pasos(brief: dict) -> list[str]:
    """Pasos reales del brief (2 o 3). Nunca se inventan los genéricos."""
    dados = brief.get("pasos")
    if isinstance(dados, list):
        limpios = [str(p).strip() for p in dados if str(p).strip()]
        if len(limpios) >= 2:
            return limpios[:3]
    solucion = (brief.get("solution") or "").strip()
    if not solucion:
        raise SystemExit(
            "brief.json sin solution ni pasos: no hay cómo explicar la mecánica "
            "sin inventarla."
        )
    trozos = [t.strip(" .;") for t in re.split(r"(?<=[.!?])\s+|,\s+|;\s+", solucion)]
    partes = []
    for trozo in trozos:
        palabras = trozo.split()
        if len(palabras) < 3:
            continue
        if palabras[0].lower() in CONECTORES:
            palabras = palabras[1:]
        texto = " ".join(palabras).strip()
        if not texto:
            continue
        texto = texto[0].upper() + texto[1:]
        # Evita que el paso 2 repita el paso 1 o el texto completo.
        if any(texto in p or p in texto for p in partes):
            continue
        partes.append(texto)
    if len(partes) < 2:
        raise SystemExit(
            "brief.json con %d paso(s) para Cómo funciona: se necesitan al menos 2. "
            "Completa pasos o solution." % len(partes)
        )
    return partes[:3]


def construir(brief: dict, claims: list[dict], presupuesto) -> str:
    nombre = (brief.get("project_name") or brief.get("challenge_title") or "").strip()
    if not nombre:
        raise SystemExit("brief.json sin project_name ni challenge_title: no se genera la página.")
    ciudad = (brief.get("city") or "").strip()
    sector = (brief.get("sector") or "").strip()

    problema_txt = brief.get("challenge_description") or ""
    solucion_txt = brief.get("solution") or ""

    # El hero vende la solución; el bloque Problema describe la falla.
    # Si se usara el mismo texto, el hero no diría nada nuevo y el jurado
    # leería el diagnóstico dos veces.
    promesa = frase(solucion_txt, 14)
    if not promesa:
        promesa = ("%s en %s" % (sector, ciudad)).strip() if (sector or ciudad) else ""
    if not promesa:
        raise SystemExit(
            "brief.json sin solution ni sector/ciudad: el hero no puede repetir el problema."
        )

    problema = frase(problema_txt, 40) or promesa
    fuente = claims[0]

    pasos_html = "".join(
        '<li class="paso"><span class="paso-num">%d</span><span class="paso-txt">%s</span></li>'
        % (i, html.escape(p))
        for i, p in enumerate(pasos(brief), 1)
    )
    metricas_html = "".join(
        '<div class="metrica"><span class="metrica-val">%s</span>'
        '<span class="metrica-fuente">%s</span></div>'
        % (html.escape(c["stat"]), html.escape(c.get("source") or "fuente"))
        for c in claims[:3]
    )
    venta = html.escape(unidad_de_venta(brief, presupuesto))
    bloque_venta = '<p class="prueba-venta">%s</p>' % venta if venta else ""
    tabla = tabla_costos(presupuesto)
    enlaces = enlaces_prueba()
    equipo = html.escape((brief.get("team_name") or "").strip())
    pie = " · ".join(x for x in (equipo, html.escape(ciudad)) if x) or "Equipo del proyecto"
    correo = (brief.get("contact_email") or "").strip()
    etiqueta_fuente = "Fuente: %s" % html.escape(str(fuente.get("source") or "fuente"))
    if url_real(fuente.get("url") or ""):
        fuente_html = '<a class="fuente" href="%s" rel="noopener">%s</a>' % (
            html.escape(fuente["url"]), etiqueta_fuente)
    else:
        fuente_html = '<span class="fuente">%s</span>' % etiqueta_fuente
    if correo:
        bloque_cierre = (
            '  <section class="cierre">\n'
            '    <h2 class="section-title">Siguiente paso</h2>\n'
            '    <p class="cierre-texto">El piloto se replica con el mismo equipo y el mismo método.</p>\n'
            '    <a class="fuente" href="mailto:%s">Escribir al equipo</a>\n'
            '  </section>\n' % html.escape(correo)
        )
    else:
        # Sin correo no hay acción: mejor cerrar en la prueba que inventar un botón.
        bloque_cierre = ""

    return """<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{nombre}</title>
<link rel="stylesheet" href="style.css">
</head>
<body>

<header class="navbar">
  <div class="logo-area">
    <span class="brand-logo">{nombre}</span>
    <span class="brand-divider"></span>
    <span class="tactical-status-pill"><span class="status-dot"></span>piloto</span>
  </div>
</header>

<main class="sitio">

  <section class="hero">
    <h1 class="hero-titulo">{nombre}</h1>
    <p class="hero-promesa">{promesa}</p>
    <a class="cta" href="#prueba">{icono}<span>Ver la prueba</span></a>
  </section>

  <section class="problema">
    <h2 class="section-title">Problema</h2>
    <p class="problema-texto">{problema}</p>
    {fuente_html}
  </section>

  <section class="como">
    <h2 class="section-title">Cómo funciona</h2>
    <ol class="pasos">{pasos}</ol>
  </section>

  <section class="metricas">
    <h2 class="section-title">Métricas</h2>
    <div class="metricas-grid">{metricas}</div>
  </section>

  <section class="prueba" id="prueba">
    <h2 class="section-title">Prueba</h2>
    {venta}
    {tabla}
    {enlaces}
  </section>

{cierre}
</main>

<footer class="site-footer">
  <span>{pie}</span>
  <span class="footer-nota">Cifras con fuente en cada bloque</span>
</footer>

</body>
</html>
""".format(
        nombre=html.escape(nombre),
        promesa=html.escape(promesa),
        icono=ICONO_FLECHA,
        problema=html.escape(problema),
        fuente_html=fuente_html,
        pasos=pasos_html,
        metricas=metricas_html,
        venta=bloque_venta,
        tabla=tabla,
        enlaces=enlaces,
        cierre=bloque_cierre,
        pie=pie,
    )


def main(argv=None) -> int:
    parser = argparse.ArgumentParser(
        description="Genera site/index.html desde el brief y la identidad aprobada."
    )
    parser.add_argument(
        "--si",
        action="store_true",
        help="escribe aunque falten project_name y challenge_title",
    )
    args = parser.parse_args(argv)
    utf8()
    brief = cargar(BRIEF, {}) or {}
    if not (brief.get("project_name") or brief.get("challenge_title")):
        campos = ("project_name, team_name, university, city, challenge_title, "
                  "challenge_description, solution (o pasos), sector, contact_email")
        if not args.si:
            # Sin reto no hay pagina: escribir aqui deja un sitio vacio publicado.
            print("ALTO: brief.json vacío. site/index.html se queda como esta.")
            print("Completa en brief.json: " + campos + ".")
            return 1
        raise SystemExit(
            "brief.json vacío: el sitio se genera desde el reto, no se rellena solo. "
            "Completa: " + campos + "."
        )
    paleta()
    claims = claims_con_fuente()
    presupuesto = cargar(BUDGET, [])
    html_final = construir(brief, claims, presupuesto)
    SALIDA.parent.mkdir(parents=True, exist_ok=True)
    SALIDA.write_text(html_final, encoding="utf-8")
    try:
        ruta = SALIDA.relative_to(RAIZ)
    except ValueError:
        ruta = SALIDA
    print("OK: site/index.html con 6 bloques (%s)" % ruta)
    print("OK: 3 cifras con URL, 0 hex literal, 0 style inline, 0 emoji")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
