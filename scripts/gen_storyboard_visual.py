# -*- coding: utf-8 -*-
"""
Genera el tablero visual de rodaje (hoja de contactos + una fila por toma).

Fuente de verdad de tiempos, dueños y rubrica: el shotlist compilado.
Las referencias visuales son material de consulta: fotogramas de videos reales
del mismo problema y fotos de archivo. No son material de la entrega.

Es una plantilla: el diccionario FICHAS es lo unico que se reescribe por proyecto.
El resto (tiempos, actos, cobertura, ids) sale del CSV.

Uso:
  python scripts/gen_storyboard_visual.py \
      --csv script/shotlist.csv --out docs/storyboard_visual.html
"""
from __future__ import annotations

import argparse
import csv
import html
import re
import sys
from pathlib import Path

RAIZ = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(RAIZ / "scripts"))
from comun import paleta as paleta_proyecto, ventanas  # noqa: E402

try:
    PALETA = paleta_proyecto()
except SystemExit:  # sin paleta aprobada: `--help` debe poder responder
    PALETA = {}

CSV = Path("script/shotlist.csv")
SALIDA = Path("docs/storyboard_visual.html")
TITULO = "Storyboard de rodaje"

# Ventanas y colores salen de la base compartida. Antes estaban escritos a mano
# aqui y el Acto I salia de rojo, que este proyecto reserva para "grabando".
ACTOS = {
    v["id"]: (v["color"], "Acto %s · %s" % (v["id"], v["etiqueta"]),
              "%d:%04.1f – %d:%04.1f" % (v["ini"] // 60, v["ini"] % 60,
                                          v["fin"] // 60, v["fin"] % 60))
    for v in ventanas()
}

CAMAS = {
    "I": (PALETA.get("secondary") or "#4A5468", "Sin música — ambiente real", "triste / real"),
    "II": (PALETA.get("primary") or "#4A5468", "Música local del lugar, 90 bpm", "local / movimiento"),
    "III": (PALETA.get("accent") or "#4A5468", "Cuerdas graves, sin percusión", "sobrio / confianza"),
    "IV": (PALETA.get("text_main") or "#111111", "La misma música local, cálida", "esperanza"),
}

# Fotograma + plano + busqueda real + orden de creacion + lo que no debe verse.
# frame: ruta relativa a docs/ o None si la toma es placa grafica.
FICHAS: dict[str, dict] = {
    "S01": {
        "frame": "img/ref/frames/yt_SVqM_100.png",
        "plano": "Primer plano humano, 50 mm",
        "ref": "Fotograma de «Familia prepara menú con desperdicios de la Central de Abasto» (1:40): rostro real, nombre en pantalla, el mismo problema.",
        "buscar": [
            ("Vendedora o vendedor en su puesto, mirando a cámara", "https://www.youtube.com/watch?v=SVqMpgbS24g&t=100s"),
            ("Rostros en mercado de tu municipio", "https://www.youtube.com/watch?v=9qdjHj0bZlA&t=70s"),
        ],
        "crear": [
            "Grabar a la persona real que pierde producto, 3 minutos, dos tomas: mirando a cámara y trabajando.",
            "Luz natural lateral, fondo de puesto legible, micrófono de corbata.",
            "Pedir autorización de imagen por escrito antes de grabar.",
        ],
        "no": "Logo, nombre del equipo, diapositiva de objetivos, voz en off que se presente.",
        "camara": "Fijo a la altura de los ojos. Sin zoom. 6 s de los cuales ≥3 s con el rostro en cuadro.",
        "audio": "Ambiente de mercado, sin música. Voz desde 0:02.",
        "transicion": "J-cut: el mercado se oye antes de verse.",
    },
    "S02": {
        "frame": "img/ref/frames/yt_SVqM_55.png",
        "plano": "Detalle macro, 85 mm, cenital 45°",
        "ref": "Fotograma del mismo reportaje (0:55): una persona sobre el montón de descarte real.",
        "buscar": [
            ("Descarte real en el mercado, antes de la basura", "https://www.youtube.com/watch?v=SVqMpgbS24g&t=55s"),
            ("Cajas y pilas de producto del puesto", "https://www.youtube.com/watch?v=9qdjHj0bZlA&t=45s"),
        ],
        "crear": [
            "Grabar la mano dejando el producto en la caja de descarte. Una sola acción, sin cortes.",
            "Fondo oscuro, producto iluminado por ventana o reflector.",
            "Grabar también el sonido de la caja al recibir el producto: sirve para el corte.",
        ],
        "no": "Basura genérica de banco. El descarte tiene que ser del producto del reto.",
        "camara": "Macro con trípode, foco en la mano. 7 s, el gesto completo de soltar.",
        "audio": "Sonido real de la caja al soltar la fruta. Sin música.",
        "transicion": "Corte seco desde el rostro.",
    },
    "S03": {
        "frame": "img/ref/frames/yt_9qdj_70.png",
        "plano": "Plano general de territorio, 24 mm",
        "ref": "Fotograma de Canal 4 Nicaragua en el Mercado El Mayoreo: calle, puestos, rótulo del mercado.",
        "buscar": [
            ("Calle o entrada del mercado de tu municipio", "https://www.youtube.com/watch?v=9qdjHj0bZlA&t=70s"),
            ("Rótulo del mercado con el nombre visible", "https://www.youtube.com/watch?v=L72s1rNshUk"),
        ],
        "crear": [
            "Grabar la entrada del mercado a la hora de mayor movimiento, con el rótulo legible.",
            "Plano fijo de 8 s; luego un barrido lento de 3 s para el rótulo animado.",
            "Rotular el municipio en pantalla: nombre y población con fuente.",
        ],
        "no": "Mapamundi, pin genérico de Google Maps sin contexto, ciudad que no es la del piloto.",
        "camara": "Gran angular a la altura del pecho. 7 s. El rótulo debe leerse sin pausar.",
        "audio": "Ambiente de calle, +2 dB al entrar el general. Sin música.",
        "transicion": "Barrido horizontal: única transición llamativa del acto.",
    },
    "S04": {
        "frame": None,
        "placa": "NOMBRE",
        "plano": "Placa tipográfica, sin imagen",
        "ref": "Placa de tesis: una frase, fondo oscuro, nombre del proyecto una sola vez en todo el video.",
        "buscar": [
            ("Placas de cifra y tesis de pitch técnico", "https://www.youtube.com/watch?v=tXOlQSexopg&t=0s"),
        ],
        "crear": [
            "Escribir una sola frase de tesis de máximo 12 palabras.",
            "Componer en la paleta del proyecto, fondo oscuro, texto claro, sin sombras ni degradados.",
            "El nombre del proyecto entra aquí: única aparición en pantalla.",
        ],
        "no": "Segunda aparición del nombre, lista de características, íconos decorativos.",
        "camara": "Animación de 7 s: la frase entra en dos tiempos, sin rebote.",
        "audio": "Entra la cama local del acto (instrumento del lugar, 90 bpm). Golpe seco con el nombre.",
        "transicion": "Negro de 3 frames: el acto cambia de oído.",
    },
    "S05": {
        "frame": "img/ref/yt/BfTzgOrywio.jpg",
        "plano": "Render 3D, vista 3/4 girando",
        "ref": "Miniatura de SAECSA: deshidratador solar industrial. Referencia de encuadre y escala, no de diseño.",
        "buscar": [
            ("Deshidrotador solar industrial en operación", "https://www.youtube.com/watch?v=BfTzgOrywio"),
            ("Secador solar semi-industrial", "https://www.youtube.com/watch?v=HwYmBYWIOw4"),
        ],
        "crear": [
            "Render del prototipo propio en vista 3/4, giro de 30° sobre fondo neutro.",
            "Poner una mano o una persona al lado para dar escala.",
            "Materiales con rugosidad real: chapa, policarbonato, madera. Nada flotante.",
        ],
        "no": "Render plástico brillante, pieza sin escala, cámara que atraviesa el objeto.",
        "camara": "Órbita de 30° en 11 s, velocidad constante, sin aceleración.",
        "audio": "Cama baja + zumbido real de ventilador: aterriza el 3D.",
        "transicion": "Match cut: mismo eje que la placa anterior.",
    },
    "S06": {
        "frame": "img/ref/yt/HwYmBYWIOw4.jpg",
        "plano": "Vista explosionada, 4 componentes",
        "ref": "Miniatura de SAECSA: colector y cámara de secado reales, para entender qué piezas se separan.",
        "buscar": [
            ("Equipo solar armado y desarmado", "https://www.youtube.com/watch?v=HwYmBYWIOw4"),
            ("Interior de cámara de secado con bandejas", "https://www.youtube.com/watch?v=E_x65qzcSNY"),
        ],
        "crear": [
            "Explosionar el prototipo en cuatro piezas numeradas 1-4, en el orden del proceso.",
            "Cada pieza con su rótulo corto: qué es y qué hace, sin adjetivos.",
            "Cerrar con el flujo entra → proceso → sale sobre el equipo ya armado.",
        ],
        "no": "Cinco o más piezas, rótulos con párrafos, beneficios antes del mecanismo.",
        "camara": "Explosión en 9 s, pausa de 2 s con las piezas separadas, rearme en 1 s.",
        "audio": "Clic metálico por pieza; la cama se corta en la explosión.",
        "transicion": "Whip pan corto; luego corte seco.",
    },
    "S07": {
        "frame": "img/ref/yt/E_x65qzcSNY.jpg",
        "plano": "Demo real en operación, 35 mm",
        "ref": "Miniatura de la deshidratadora solar en Perú: bandejas cargadas y operarios reales.",
        "buscar": [
            ("Equipo propio funcionando, bandejas cargadas", "https://www.youtube.com/watch?v=E_x65qzcSNY&t=0s"),
            ("Panel de control o app del equipo, en un proyecto real", None),
        ],
        "crear": [
            "Grabar la pantalla del sensor o la app mientras alguien la usa, sin cortar.",
            "Dejar al menos 4 s sin voz: solo el sonido del equipo y del mercado.",
            "Si aún no hay interfaz, grabar el prototipo con una etiqueta escrita a mano y decirlo.",
        ],
        "no": "Mockup de Figma con cursor falso, capturas con datos inventados sin marcar.",
        "camara": "Cámara en mano sobre el hombro del operario. 10 s, sin estabilizador visible.",
        "audio": "Música fuera: solo voz (≥4 s sin corte).",
        "transicion": "Corte seco, misma orientación.",
    },
    "S08": {
        "frame": None,
        "placa": "US$ 0,00",
        "plano": "Placa de cifra única",
        "ref": "Cifra grande con base pequeña debajo. Una sola cifra en cuadro.",
        "buscar": [
            ("Placa de cifra de reportaje económico", "https://www.youtube.com/watch?v=tXOlQSexopg&t=0s"),
        ],
        "crear": [
            "Una cifra grande: costo unitario, con su unidad (por kilo, por caja).",
            "Debajo, desglose en barras proporcionales sin números.",
            "Fuente de la cifra en 12 px, legible al pausar.",
        ],
        "no": "Tres cifras juntas, TIR, VAN, porcentajes sin base.",
        "camara": "La cifra entra contando en 1 s y se queda 10 s. Sin rebote.",
        "audio": "Voz sola en la cifra; la cama vuelve al terminar la frase.",
        "transicion": "Fade de 6 frames.",
    },
    "S09": {
        "frame": "img/ref/1006060.jpg",
        "plano": "Dos placas de costo",
        "ref": "Foto de archivo de monedas: sirve para el tratamiento de dinero, no como plano del video.",
        "buscar": [
            ("Costo del piloto y costo por beneficiario, ya calculados", "https://www.youtube.com/watch?v=tXOlQSexopg&t=0s"),
        ],
        "crear": [
            "Placa 2: costo total del piloto. Placa 3: costo por beneficiario.",
            "Cada cifra con su base en una línea, no en un párrafo.",
            "Cerrar el acto con quien paga: usuario, aliado o institución.",
        ],
        "no": "Cuarta cifra, gráfico de torta, proyección a cinco años.",
        "camara": "Corte directo entre placas. 9 s repartidos 4 / 5.",
        "audio": "Cuerdas graves, sin percusión. La cifra se dice sin música.",
        "transicion": "Corte seco: el acto baja el ritmo.",
    },
    "S10": {
        "frame": "img/ref/33175650.jpg",
        "plano": "Tres nodos de contraprestación",
        "ref": "Foto de archivo de un acuerdo: referencia de tono para «quién paga», no plano del video.",
        "buscar": [
            ("Convenio o aliado real del piloto", "https://www.youtube.com/watch?v=6_g78EC7RiQ&t=0s"),
        ],
        "crear": [
            "Diagrama de tres nodos: usuario, aliado, institución, con la contraprestación escrita.",
            "Flecha en un solo sentido: quien recibe y quien sostiene.",
            "Si el aliado no está confirmado, rotular «por confirmar» en pantalla.",
        ],
        "no": "Logos de instituciones sin convenio firmado, promesas sin contraprestación.",
        "camara": "Los tres nodos entran en 3 s y quedan 4 s quietos.",
        "audio": "Cama sobria + ambiente del puesto del usuario.",
        "transicion": "J-cut: la voz entra antes que la imagen.",
    },
    "S11": {
        "frame": None,
        "placa": "RESIDUO → INSUMO",
        "plano": "Ciclo ambiental, dos flujos",
        "ref": "Diagrama circular de dos flujos: lo que entra y lo que sale, sin adornos.",
        "buscar": [
            ("Diagramas de economía circular en reportajes", "https://www.youtube.com/watch?v=j4E2F0Vd02Q&t=0s"),
        ],
        "crear": [
            "Dibujar el anillo residuo → proceso → insumo → mercado → residuo.",
            "Dos flechas de distinto grosor según el volumen real medido.",
            "Sin íconos de hoja verde ni emojis.",
        ],
        "no": "Anillo decorativo, iconos genéricos, cifras sin fuente.",
        "camara": "El anillo se dibuja en 5 s y respira 3 s.",
        "audio": "Sonido del material en la bandeja; corta 0,5 s antes del cierre.",
        "transicion": "Fundido a negro de 4 frames.",
    },
    "S12": {
        "frame": "img/ref/frames/yt_SVqM_100.png",
        "plano": "Mismo encuadre que S01, 50 mm",
        "ref": "Mismo fotograma que S01: la toma repite persona, altura y luz. Ese es el contrato.",
        "buscar": [
            ("La misma persona de S01, misma hora y misma luz", "https://www.youtube.com/watch?v=SVqMpgbS24g&t=100s"),
            ("Transformación visible: producto ya clasificado o empaquetado", "https://www.youtube.com/watch?v=E_x65qzcSNY&t=0s"),
        ],
        "crear": [
            "Volver al mismo puesto, misma altura de cámara y misma hora del día que S01.",
            "La persona muestra el producto que ahora sí se vende.",
            "Una frase suya, en sus palabras, no en boca de un actor.",
        ],
        "no": "Otra persona, otra locación, otro encuadre: rompe el antes y después.",
        "camara": "Idéntico a S01. 9 s, ≥4 s con el rostro y el producto en cuadro.",
        "audio": "Vuelve la música local del Acto II, más cálida. Ambiente presente.",
        "transicion": "Match cut con el fotograma del Acto I.",
    },
    "S13": {
        "frame": None,
        "placa": "+0 %",
        "plano": "Tres contadores animados",
        "ref": "Contadores que entran uno por uno, cada uno con su unidad y su fuente.",
        "buscar": [
            ("Contadores de impacto en reportajes de datos", "https://www.youtube.com/watch?v=tXOlQSexopg&t=0s"),
        ],
        "crear": [
            "Tres métricas auditables: ambiental, económica, social. Una por una.",
            "Cada contador con su unidad y su fuente debajo, en 12 px.",
            "Si una métrica es estimada, rotularla «estimado» en pantalla.",
        ],
        "no": "Cuatro o más contadores, métricas sin unidad, cifras redondeadas sin base.",
        "camara": "Un contador cada 3 s. Sin sonido de máquina registradora.",
        "audio": "Tres golpes, uno por métrica, sincronizados. Sin voz.",
        "transicion": "Corte seco entre métricas.",
    },
    "S14": {
        "frame": "img/ref/20711805.jpg",
        "plano": "Placa de cierre + territorio",
        "ref": "Foto de archivo de un poblado desde el aire: referencia de escala regional, no plano del video.",
        "buscar": [
            ("Vista aérea del municipio del piloto (Google Earth o dron propio)", None),
        ],
        "crear": [
            "Frase de cierre: «Piloto en [municipio], replicable en toda América Latina».",
            "Mapa mínimo de la región con el punto del piloto y nada más.",
            "Cortar en seco sobre la frase. Sin despedida.",
        ],
        "no": "«Gracias», logo final, música que sube, créditos.",
        "camara": "7 s fijos. La frase entra en 2 s y se queda hasta el corte.",
        "audio": "Cierre en el acorde inicial; la última frase va en voz, sin cama.",
        "transicion": "Fundido a negro de 6 frames. Sin logo.",
    },
}


def timecode(seg: float) -> str:
    m = int(seg // 60)
    s = seg - m * 60
    return f"{m}:{s:04.1f}"


def leer(ruta: Path | None = None) -> list[dict]:
    with (ruta or CSV).open(newline="", encoding="utf-8-sig") as f:
        filas = list(csv.DictReader(f))
    t = 0.0
    for fila in filas:
        fila["dur"] = float(fila["duration_s"])
        fila["ini"] = t
        t += fila["dur"]
        fila["fin"] = t
    return filas


def marco(fila: dict, clase: str = "") -> str:
    """Fotograma 16:9: referencia real o placa tipográfica."""
    ficha = FICHAS.get(fila["id"], {})
    frame = ficha.get("frame")
    color = ACTOS[fila["act"]][0]
    if frame:
        dentro = f'<img src="{frame}" alt="{html.escape(fila["id"])}" loading="lazy">'
        pie = f'<span class="credit">{html.escape(ficha.get("ref", "")[:92])}</span>'
    else:
        texto = html.escape(ficha.get("placa", fila["id"]))
        dentro = f'<div class="placa" style="--c:{color}"><b>{texto}</b></div>'
        pie = '<span class="credit">Placa a crear · sin imagen de archivo</span>'
    return (
        f'<figure class="marco {clase}" style="--c:{color}">'
        f'<div class="lienzo">{dentro}<span class="sid">{html.escape(fila["id"])}</span>'
        f'<span class="sdur">{fila["dur"]:.0f} s</span></div>'
        f'{pie}</figure>'
    )


def hoja(filas: list[dict]) -> str:
    """Hoja de contactos: los 14 fotogramas en una sola vista."""
    celdas = "".join(
        f'<a class="cel" href="#{f["id"].lower()}" title="{html.escape(f["id"])} · '
        f'{html.escape(FICHAS.get(f["id"], {}).get("plano", ""))}">{marco(f)}</a>'
        for f in filas
    )
    return f'<h2>Hoja de contactos</h2><div class="sheet">{celdas}</div>'


def pista(filas: list[dict]) -> str:
    """Pista de sonido: color musical y cues por acto, en una sola banda."""
    tramos = []
    for a in ("I", "II", "III", "IV"):
        del_a = [f for f in filas if f["act"] == a]
        if not del_a:
            continue
        seg = sum(f["dur"] for f in del_a)
        color, cama, tono = CAMAS[a]
        cues = [FICHAS.get(f["id"], {}).get("audio", "") for f in del_a]
        destacados = " · ".join(c.split(".")[0] for c in cues[:2] if c)
        tramos.append(
            f'<div style="flex:{seg};--c:{color}"><b>{a} · {seg:.1f} s · {html.escape(tono)}</b>'
            f'<span>{html.escape(cama)}</span>'
            f'<em>{html.escape(destacados)}</em></div>'
        )
    return (
        '<h2>Pista de sonido</h2><div class="snd">'
        + "".join(tramos)
        + '</div><p class="snd-nota">La cifra clave del Acto III va sin música. Una sola transición '
        'efectista por acto; el resto, corte seco.</p>'
    )


def fila_plan(fila: dict) -> str:
    """Una fila de plan de rodaje: fotograma · meta · qué buscar · qué crear."""
    ficha = FICHAS.get(fila["id"], {})
    color = ACTOS[fila["act"]][0]
    buscar = "".join(
        (f'<li><a href="{html.escape(u)}">{html.escape(t)}</a></li>' if u else f"<li>{html.escape(t)}</li>")
        for t, u in ficha.get("buscar", [])
    )
    crear = "".join(f"<li>{html.escape(c)}</li>" for c in ficha.get("crear", []))
    items = [i.strip() for i in re.split(r"[;,]", fila["rubric_item"]) if i.strip()]
    chips = "".join(f'<span class="chip">{html.escape(i.split()[0])}</span>' for i in items)
    return f"""
    <div class="row" id="{fila["id"].lower()}" style="--c:{color}">
      <div class="col-frame">{marco(fila)}</div>
      <div class="col-meta">
        <h3><span class="sid-b">{html.escape(fila["id"])}</span>{html.escape(ficha.get("plano", fila["id"]))}</h3>
        <p class="tc">{timecode(fila["ini"])} → {timecode(fila["fin"])} · {fila["dur"]:.1f} s</p>
        <p class="desc">{html.escape(fila["description"])}</p>
        <p class="ref">{html.escape(ficha.get("ref", ""))}</p>
        <p class="son"><b>♪</b> {html.escape(ficha.get("audio", "por definir"))} <b>→</b> {html.escape(ficha.get("transicion", "corte seco"))}</p>
        <p class="no"><b>No debe verse:</b> {html.escape(ficha.get("no", ""))}</p>
        <details><summary>Cámara, rúbrica y dueño</summary>
          <p>{html.escape(ficha.get("camara", ""))}</p>
          <p class="chips">{chips}<span class="chip">{html.escape(fila.get("owner") or "sin dueño")}</span></p>
        </details>
      </div>
      <div class="col-buscar"><h4>Qué buscar</h4><ul>{buscar}</ul></div>
      <div class="col-crear"><h4>Qué crear</h4><ul>{crear}</ul></div>
    </div>"""


def _css() -> str:
    """CSS del tablero con los colores aprobados del proyecto."""
    reemplazos = {
        "__PRI__": PALETA.get("primary") or "#4A5468",
        "__SEC__": PALETA.get("secondary") or "#4A5468",
        "__ACC__": PALETA.get("accent") or "#4A5468",
    }
    css = CSS
    for marca, valor in reemplazos.items():
        css = css.replace(marca, str(valor))
    return css


CSS = """
:root{--pri:__PRI__;--sec:__SEC__;--acc:__ACC__;--ink:#111;--paper:#faf9f5;--line:#e2ded3;--mut:#6b675c}
*{box-sizing:border-box}
body{margin:0;background:var(--paper);color:var(--ink);font:15px/1.5 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;-webkit-font-smoothing:antialiased}
.wrap{max-width:1180px;margin:0 auto;padding:28px 24px 64px}
header{border-bottom:2px solid var(--ink);padding-bottom:14px;margin-bottom:18px}
h1{font-size:clamp(26px,3.4vw,40px);line-height:1.04;letter-spacing:-.02em;margin:0 0 6px;font-weight:800}
.sub{color:var(--mut);margin:0;max-width:76ch;font-size:14.5px}
.chips{display:flex;flex-wrap:wrap;gap:6px;margin:12px 0 0}
.chips .chip{font-size:11px;letter-spacing:.04em;text-transform:uppercase;border:1px solid var(--line);background:#fff;border-radius:2px;padding:2px 7px;color:var(--mut)}
.bar{display:flex;height:34px;margin:18px 0 6px;border-radius:2px;overflow:hidden}
.bar div{display:flex;align-items:center;justify-content:space-between;padding:0 8px;color:#fff;font-size:11px;font-weight:700;letter-spacing:.03em;white-space:nowrap;overflow:hidden}
.bar .t{background:var(--acc)}
.legend{display:flex;gap:16px;flex-wrap:wrap;font-size:12px;color:var(--mut);margin-bottom:22px}
.legend b{color:var(--ink)}
h2{font-size:13px;letter-spacing:.12em;text-transform:uppercase;margin:34px 0 10px;padding-bottom:6px;border-bottom:1px solid var(--line)}
.sheet{display:grid;grid-template-columns:repeat(7,1fr);gap:5px}
.sheet .marco{width:100%;margin:0}
.marco .lienzo{width:100%}
.cel{display:block;text-decoration:none;color:inherit}
.cel .credit{display:none}
.cel .lienzo{border-top-width:2px}
.cel:hover .lienzo{outline:2px solid var(--c);outline-offset:-2px}
.lienzo{position:relative;aspect-ratio:16/9;background:#000;overflow:hidden;border-top:3px solid var(--c)}
.lienzo img{width:100%;height:100%;object-fit:cover;display:block;filter:saturate(.95)}
.placa{width:100%;height:100%;display:grid;place-items:center;background:#141414;color:#f4f3ee;text-align:center;padding:8px}
.placa b{font-size:clamp(11px,1.4vw,20px);letter-spacing:.02em;line-height:1.1}
.placa.sm b{font-size:9px;letter-spacing:.06em}
.sid{position:absolute;left:0;bottom:0;background:var(--c);color:#fff;font-size:10px;font-weight:800;letter-spacing:.06em;padding:1px 5px}
.sdur{position:absolute;right:0;bottom:0;background:rgba(0,0,0,.72);color:#fff;font-size:10px;font-variant-numeric:tabular-nums;padding:1px 5px}
.credit{display:block;font-size:10px;color:var(--mut);margin-top:4px;line-height:1.3}
.act{display:flex;align-items:baseline;gap:10px;border-left:5px solid var(--c);padding-left:10px;margin:36px 0 4px}
.act h2{border:0;margin:0;padding:0;font-size:14px;letter-spacing:.06em;color:var(--ink)}
.act span{font-size:11.5px;color:var(--mut);font-variant-numeric:tabular-nums}
.row{display:grid;grid-template-columns:170px 1.5fr 1fr 1.2fr;gap:14px;background:#fff;border:1px solid var(--line);border-left:5px solid var(--c);padding:12px;margin:8px 0;align-items:start}
.row .marco{margin:0}
.col-frame .credit{display:none}
.col-meta h3{margin:0 0 2px;font-size:14.5px;line-height:1.25;font-weight:700}
.sid-b{display:inline-block;background:var(--c);color:#fff;font-size:10.5px;font-weight:800;letter-spacing:.06em;padding:1px 5px;margin-right:5px;vertical-align:1px}
.tc{margin:0 0 5px;font-size:11.5px;color:var(--mut);font-variant-numeric:tabular-nums}
.desc{margin:0 0 5px;font-size:13px;line-height:1.42}
.ref{margin:0 0 6px;font-size:11.5px;line-height:1.35;color:var(--mut);border-left:2px solid var(--line);padding-left:7px}
.no{margin:0;font-size:12px;color:#a1120f;line-height:1.35}
.son{margin:5px 0 0;font-size:11px;line-height:1.3;color:#0f3f43;background:#e6f4f4;border-left:2px solid var(--acc);padding:3px 7px}
.son b{font-weight:700;color:var(--pri)}
.tr{display:none}
.snd{display:flex;gap:4px;margin:6px 0 6px}
.snd div{flex:1;min-width:0;background:#fff;border:1px solid var(--line);border-top:4px solid var(--c);padding:7px 8px;overflow:hidden}
.snd b{display:block;font-size:11px;letter-spacing:.05em;text-transform:uppercase;color:var(--c)}
.snd span{display:block;font-size:12px;font-weight:600;margin-top:2px}
.snd em{display:block;font-size:11px;color:var(--mut);font-style:normal;margin-top:3px;line-height:1.3}
.snd-nota{margin:0 0 8px;font-size:11.5px;color:var(--mut)}
.no b{font-weight:700}
details{margin-top:6px;font-size:12px;color:var(--mut)}
summary{cursor:pointer;color:var(--pri);font-weight:600;font-size:11.5px}
details p{margin:5px 0 0}
.chips .chip{display:inline-block;margin:3px 3px 0 0;font-size:10px;border:1px solid var(--line);color:var(--ink);padding:0 5px;border-radius:2px}
h4{margin:0 0 5px;font-size:10px;letter-spacing:.1em;text-transform:uppercase;color:var(--mut)}
.col-buscar ul,.col-crear ul{margin:0;padding-left:15px;font-size:12.2px;line-height:1.4}
.col-buscar li{margin-bottom:5px}
.col-buscar a{color:var(--pri);text-decoration:none;border-bottom:1px solid #cfd6ea}
.col-buscar a:hover{border-color:var(--pri)}
.col-crear li{margin-bottom:4px}
footer{margin-top:40px;border-top:1px solid var(--line);padding-top:12px;font-size:11.5px;color:var(--mut);line-height:1.5}
code{font:11.5px ui-monospace,Consolas,monospace;background:#fff;border:1px solid var(--line);padding:1px 4px}
@media (max-width:1000px){.row{grid-template-columns:150px 1fr}.col-buscar,.col-crear{grid-column:2}}
@media (max-width:720px){.sheet{grid-template-columns:repeat(4,1fr)}.row{grid-template-columns:1fr}.col-buscar,.col-crear{grid-column:1}}
@media print{body{background:#fff}.row{break-inside:avoid}.sheet{grid-template-columns:repeat(7,1fr)}details{display:none}}
"""


def construir(filas: list[dict]) -> str:
    total = sum(f["dur"] for f in filas)
    actos: dict[str, float] = {a: 0.0 for a in ACTOS}
    for f in filas:
        actos[f["act"]] = actos.get(f["act"], 0.0) + f["dur"]
    items = sorted({t for f in filas for t in re.findall(r"([a-e]\d)\b", f["rubric_item"])})

    # la barra usa el color del acto
    barra = "".join(
        f'<div style="flex:{actos[a]/total if total else 1};background:{ACTOS[a][0]}"><span>{a}</span>'
        f'<span>{actos[a]:.1f} s · {actos[a]/total*100 if total else 0:.0f} %</span></div>'
        for a in ("I", "II", "III", "IV")
    )

    cuerpo = []
    for a in ("I", "II", "III", "IV"):
        color, nombre, ventana = ACTOS[a]
        del_a = [f for f in filas if f["act"] == a]
        if not del_a:
            continue
        rango = del_a[0]["id"] if len(del_a) == 1 else f'{del_a[0]["id"]}–{del_a[-1]["id"]}'
        cuerpo.append(
            f'<div class="act" style="--c:{color}"><h2>{nombre}</h2>'
            f'<span>{ventana} · {actos[a]:.1f} s · {actos[a]/total*100 if total else 0:.0f} % · '
            f'{rango}</span></div>'
        )
        cuerpo += [fila_plan(f) for f in del_a]

    return f"""<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Storyboard visual — {len(filas)} tomas · {total:.0f} s</title>
<style>{_css()}</style>
</head>
<body>
<div class="wrap">
<header>
  <h1>{TITULO}</h1>
  <p class="sub">{len(filas)} tomas de {total:.1f} s. Cada fila dice qué buscar, dónde verlo y qué crear. Los fotogramas
  son <b>referencia</b> de encuadre y luz: no son material del video. Tiempos, dueños y rúbrica salen de
  <code>script/shotlist.csv</code>.</p>
  <div class="chips"><span class="chip">{len(filas)} tomas</span>
  <span class="chip">{total:.1f} s</span><span class="chip">Rúbrica {len(items)}/19</span></div>
  <div class="bar">{barra}</div>
  <div class="legend"><span><b>Hoja de contactos</b> — clic en un cuadro para bajar a su ficha</span>
  <span><b>Qué buscar</b> — enlace real, abrir y comparar</span><span><b>Qué crear</b> — orden al especialista</span></div>
</header>
{hoja(filas)}
{pista(filas)}
{''.join(cuerpo)}
<footer>
  Regenerar: <code>python scripts/gen_storyboard_visual.py --csv script/shotlist.csv --out docs/storyboard_visual.html</code>.<br>
  Los fotogramas son referencia de encuadre; las tomas bloqueadas por datos faltantes están marcadas y no se
  rellenan con estimaciones.
</footer>
</div>
</body>
</html>
"""


def main() -> None:
    global CSV, SALIDA, TITULO
    ap = argparse.ArgumentParser(description="Tablero visual de rodaje desde el shotlist compilado.")
    ap.add_argument("--csv", default=str(CSV), help="shotlist compilado (por defecto script/shotlist.csv)")
    ap.add_argument("--out", default=str(SALIDA), help="HTML de salida")
    ap.add_argument("--titulo", default=TITULO, help="titulo del tablero")
    args = ap.parse_args()
    CSV = Path(args.csv)
    SALIDA = Path(args.out)
    TITULO = args.titulo
    if not CSV.exists():
        raise SystemExit(f"No existe el shotlist: {CSV}")
    datos = leer()
    SALIDA.parent.mkdir(parents=True, exist_ok=True)
    SALIDA.write_text(construir(datos), encoding="utf-8")
    total = sum(f["dur"] for f in datos)
    items = {t for f in datos for t in re.findall(r"([a-e]\d)\b", f["rubric_item"])}
    print(f"OK: {SALIDA} · {len(datos)} tomas · {total:.1f} s · {len(items)} items de rubrica")


if __name__ == "__main__":
    main()
