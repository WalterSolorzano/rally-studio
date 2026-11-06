#!/usr/bin/env python3
"""
check_anti_generico.py
======================

Compuerta regex ejecutable para la skill `proponer-retos`.

Lee un JSON de soluciones (el que produce `soluciones_motor.py`) y aplica:
  1. FORBIDDEN_PHRASES (lista cerrada de regex, 9 categorías)
  2. GENERIC_SMELLS (patrones sintácticos verificables por texto)
  3. Encaje literal (el objeto de la solución debe aparecer en el enunciado del reto)
  4. Término del enunciado (no se aceptan soluciones para problemas vecinos)
  5. Baneos específicos: reacondicionamiento, hardware donado, taller como núcleo

Cada opción que no pasa devuelve `RECHAZADA` con motivo concreto. La salida es:
  - Markdown con la traza por opción (para `docs/_build/compuerta_<certamen>.md`)
  - JSON con el resultado por opción (para integración con el motor)
  - Código de salida 0 si todo PASS, 1 si hay RECHAZADAS.

Uso:
    python scripts/check_anti_generico.py \\
        --json docs/_build/soluciones.json \\
        --out-md docs/_build/compuerta_nacional.md \\
        --out-json docs/_build/compuerta_nacional.json

Formato del JSON de entrada (mínimo esperado por solución):

    {
      "reto_id": "DESAFIO_01",
      "reto_enunciado": "texto literal del enunciado del comité",
      "opciones": [
        {
          "id": "01",
          "titulo": "...",
          "que_es": "...",
          "como_funciona": ["paso 1", "paso 2", ...],
          "pagador": "institución · partida · cargo · bien",
          "metrica": "número unidad · fuente",
          "ya_existe": "sustituto · diferencia",
          "precedente": "equipo · año · puesto · mecanismo · url",
          "costo": "total = componentes × cantidad · fuente",
          "por_validar": "supuesto + prueba barata",
          "pitch": "una frase",
          "mecanismo_nuevo": "tecnología · año · url · cómo se usa"  # opcional
        },
        {
          "id": "02",
          ...
        }
      ]
    }
"""

from __future__ import annotations

import argparse
import json
import re
import sys
import unicodedata
from dataclasses import dataclass, field, asdict
from pathlib import Path
from typing import Iterable


# ---------------------------------------------------------------------------
# Utilidades
# ---------------------------------------------------------------------------

def _quitar_acentos(s: str) -> str:
    """Quita acentos para que el match sea insensible a tildes."""
    if s is None:
        return ""
    return "".join(
        c for c in unicodedata.normalize("NFKD", s)
        if not unicodedata.combining(c)
    )


def _normalizar(s: str) -> str:
    """Lowercase + sin acentos para regex case-insensitive sin sorpresas."""
    if s is None:
        return ""
    return _quitar_acentos(s).lower()


# ---------------------------------------------------------------------------
# FORBIDDEN_PHRASES — 9 categorías + 2 baneos adicionales (1.4b, 1.4c)
# ---------------------------------------------------------------------------

# Cada entrada: (categoría, patrón regex, descripción corta para el reporte)
# Los patrones se compilan con re.IGNORECASE sobre texto sin acentos.

FORBIDDEN_PATTERNS: list[tuple[str, str, str]] = [
    # 1.1 Verbos huecos
    (
        "1.1_verbos_huecos",
        r"\b(sensibiliz(ar|a)|concientiz(ar|a)|fomentar|promover|impulsar|apotear|apalancar|"
        r"potenciar|incentivar|estimular|difundir|divulgar|promocionar|visibiliz(ar|a)|"
        r"socializ(ar|a))\b",
        "Verbo de intención sin mecanismo detrás",
    ),
    # 1.2 Sustantivos abstractos sin actor
    (
        "1.2_actores_sin_nombre",
        r"\b(comunidad organizada|sociedad civil|actores involucrados|partes interesadas|"
        r"stakeholders|comunidad en general|poblacion beneficiada|comunidades vulnerables|"
        r"jovenes emprendedores|mujeres empoderadas)\b",
        "Actor sin nombre propio (no firma ni paga)",
    ),
    # 1.3 Modelos que no son producto
    (
        "1.3_etiquetas_no_producto",
        r"\b(economia circular|desarrollo sostenible|desarrollo local|innovacion social|"
        r"impacto social|modelo de negocio|cadena de valor|ecosistema de|plataforma de|"
        r"solucion integral|solucion holistica|enfoque participativo|enfoque comunitario)\b",
        "Etiqueta abstracta como núcleo del producto",
    ),
    # 1.4 Talleres y servicios disfrazados
    (
        "1.4_taller_servicio",
        r"\b(taller( (de|para|en))?|capacitacion|mesa de desarme|servicio de|jornada de|"
        r"campana de|voluntariado|programa de concientizacion|compromiso ciudadano)\b",
        "Taller/servicio/campaña como núcleo",
    ),
    # 1.4b Reacondicionamiento, cambio de pieza, testeo (BANEOS NUEVOS)
    (
        "1.4b_reacondicionamiento",
        r"\b(reacondicion(a|ar|amiento)|refurbish(ing)?|remanufactur(a|ar|ado)|rebuild|"
        r"cambio de pieza|reemplazo de pieza|testeo de .+ usado|test de .+ (usado|daniado|viejo)|"
        r"diagnostico de .+ (usado|daniado|viejo)|verificar .+ funcione|"
        r"revisar .+ (estado|funciona)|reparar y revender|"
        r"restaurar .+ (electrodomestico|motor|aparato|dispositivo))\b",
        "Reacondicionamiento, testeo o cambio de pieza como núcleo (mantenimiento, no innovación)",
    ),
    # 1.4c Donaciones de equipos y hardware reusado (BANEOS NUEVOS)
    (
        "1.4c_hardware_donado",
        r"\b(telefonos? donados?|celulares? donados?|smartphones? donados?|"
        r"celulares? usados?|telefonos? usados?|"
        r"celulares? en desuso|telefonos? en desuso|celulares? desechad[oa]s?|"
        r"telefonos? desechad[oa]s?|celular en desuso|telefono en desuso|"
        r"donacion de (equipo|dispositivo|telefono|celular|computadora|laptop|tablet)|"
        r"reusar (telefono|celular|smartphone|laptop|tablet))\b",
        "Hardware donado/usado como núcleo (dependencia logística disfrazada de solución)",
    ),
    # 1.5 Kits y apps sin operador
    (
        "1.5_kit_app_sensor",
        r"\b(kit (educativo|didactico|de (energia|agua|agricultura))|"
        r"sensor (suelto|autonomo|de bajo costo)|app movil|aplicacion web|"
        r"plataforma digital|formulario (digital|en linea)|codigo qr|"
        r"certificado de|sello de|auditoria de)\b",
        "Kit/app/sensor/certificado como núcleo (sin operador o sin objeto físico)",
    ),
    # 1.6 Relleno genérico
    (
        "1.6_relleno",
        r"\b(a traves de|mediante|por medio de|de manera|de forma|con el fin de|"
        r"con el objetivo de|con el proposito de|buscando|apuntando a|orientado a|"
        r"enfocado en|dirigido a)\b",
        "Conector hueco que rellena sin aportar",
    ),
    # 1.7 Métricas abstractas
    (
        "1.7_metrica_abstracta",
        r"\b(personas sensibilizadas|personas concientizadas|comunidades beneficiadas|"
        r"vidas mejoradas|impacto positivo|cambio de mentalidad|toma de conciencia|"
        r"apropiacion del|adopcion del)\b",
        "Métrica no medible físicamente",
    ),
    # 1.8 Frases hechas del rally
    (
        "1.8_frases_hechas",
        r"\b(solucion innovadora|propuesta disruptiva|tecnologia de impacto|"
        r"modelo replicable|escalabilidad|sostenibilidad|empoderamiento de|"
        r"inclusion de|diversidad e|enfoque de genero)\b",
        "Frase hecha que no diferencia (el jurado la escucha en todos los pitches)",
    ),
    # 1.9 Weasel words
    (
        "1.9_weasel_words",
        r"\b(algunos|muchos|varios|diversos|multiples|cierta|cierto tipo de|"
        r"en general|por lo general|por lo regular|tendria|podria|deberia|"
        r"se espera que|se anticipa que|se proyecta que)\b",
        "Weasel word que evita compromiso con un número",
    ),
]


# ---------------------------------------------------------------------------
# GENERIC_SMELLS — patrones sintácticos (los que se pueden detectar por regex)
# Los que requieren razonamiento (decisor con umbral, prueba de mesa, etc.)
# no se chequean aquí: viven en la auto-auditoría del goal.md.
# ---------------------------------------------------------------------------

GENERIC_SMELL_PATTERNS: list[tuple[str, str, str]] = [
    (
        "smell_3_verbo_intencion_sin_objeto",
        r"\b(sensibiliz(a|ar) (a |la |el |los |las )|foment(a|ar) (la |el |los |las )|"
        r"promueve (la |el |los |las )|impuls(a|ar) (la |el |los |las ))\b",
        "Verbo de intención seguido de categoría abstracta (sin objeto físico directo)",
    ),
]

# UTF-8 doble-codificado (Ã© → é): prohibido en cualquier campo del dossier.
MOJIBAKE_RX = re.compile("[\u00c3\u00c2][\x80-\xff]")

# Nombre de ganador/marca ajena: solo permitido en el campo de precedente/analogía.
NAME_DROPPING_RX = re.compile(r"tetra\s*pak", re.IGNORECASE)

QUE_ES_MAX_PALABRAS = 150


# ---------------------------------------------------------------------------
# Datos
# ---------------------------------------------------------------------------

@dataclass
class Rechazo:
    """Resultado del chequeo de una opción."""
    reto_id: str
    opcion_id: str
    estado: str  # "PASS" o "RECHAZADA"
    motivos: list[str] = field(default_factory=list)
    """Lista de motivos concretos (vacía si PASS)."""


# ---------------------------------------------------------------------------
# Chequeos
# ---------------------------------------------------------------------------

def _campos_a_texto(opcion: dict) -> str:
    """Concatena los campos de la opción en un solo string para el regex."""
    partes = [
        opcion.get("titulo", ""),
        opcion.get("que_es", ""),
        " ".join(opcion.get("como_funciona", []) or []),
        opcion.get("pagador", ""),
        opcion.get("metrica", ""),
        opcion.get("ya_existe", ""),
        opcion.get("precedente", ""),
        opcion.get("costo", ""),
        opcion.get("por_validar", ""),
        opcion.get("pitch", ""),
        opcion.get("mecanismo_nuevo", "") or "",
    ]
    return " \n ".join(p for p in partes if p)


def chequear_forbidden_phrases(texto: str) -> list[tuple[str, str, str]]:
    """Aplica todos los regex de FORBIDDEN_PHRASES. Devuelve lista de (categoría, frase_match, descripción)."""
    texto_n = _normalizar(texto)
    matches = []
    for categoria, patron, desc in FORBIDDEN_PATTERNS:
        try:
            rx = re.compile(patron, re.IGNORECASE)
        except re.error as e:
            # Si un patrón está mal, lo reportamos pero no abortamos el chequeo entero.
            matches.append((categoria, f"<regex_error: {e}>", desc))
            continue
        for m in rx.finditer(texto_n):
            matches.append((categoria, m.group(0), desc))
    return matches


def chequear_generic_smells(texto: str) -> list[tuple[str, str, str]]:
    """Aplica los GENERIC_SMELL que son detectables por regex."""
    texto_n = _normalizar(texto)
    matches = []
    for categoria, patron, desc in GENERIC_SMELL_PATTERNS:
        rx = re.compile(patron, re.IGNORECASE)
        for m in rx.finditer(texto_n):
            matches.append((categoria, m.group(0), desc))
    return matches


def _stem(s: str) -> str:
    """Stem muy básico: quita plurales simples (s/es) para matching flexible."""
    if len(s) > 4:
        if s.endswith("es"):
            return s[:-2]
        if s.endswith("s"):
            return s[:-1]
    return s


def chequear_encaje_literal(enunciado: str, opcion: dict) -> list[str]:
    """Comprueba que los sustantivos clave del enunciado aparecen en la solución.

    Heurística: extrae sustantivos/keywords del enunciado (>=5 caracteres, sin stopwords),
    los reduce a un stem básico (quita plurales), y verifica que al menos 2 de los stems
    principales aparecen en el texto de la opción. Si no aparece ninguno o solo 1, RECHAZA.

    El umbral es "al menos 2 stems presentes" (no un porcentaje fijo) porque lo que importa
    es que el objeto principal del enunciado aparezca, no que se repita todo el vocabulario.
    Una solución legítima puede parafrasear sin repetir todas las palabras.
    """
    if not enunciado:
        return []
    stopwords = {
        "the", "and", "for", "with", "that", "this", "from", "into", "are", "was",
        "los", "las", "del", "por", "para", "con", "una", "uno", "sin",
        "que", "han", "hay", "sus", "mas", "como", "cuando", "donde",
        "estos", "estas", "sobre", "entre", "ante", "tras", "anos", "ano",
    }
    enunciado_n = _normalizar(enunciado)
    # Tokens: palabras de 5+ caracteres que no sean stopwords
    tokens_enunciado = [
        t for t in re.findall(r"\b[a-z]{5,}\b", enunciado_n)
        if t not in stopwords
    ]
    if not tokens_enunciado:
        return []
    texto_opcion = _normalizar(_campos_a_texto(opcion))
    # Stems únicos del enunciado, ordenados por longitud descendente (más informativos primero)
    stems_unicos = list(dict.fromkeys(
        sorted((_stem(t) for t in tokens_enunciado), key=len, reverse=True)
    ))
    # Tomar los 8 stems principales (no 5: con 5 perdemos palabras como "fisuras"
    # en enunciados que tienen muchas palabras largas pero poco informativas)
    stems_clave = stems_unicos[:8]
    # Para cada stem, buscarlo como palabra o prefijo en el texto de la solución
    presentes = []
    faltantes = []
    for stem in stems_clave:
        # Match: el stem (o sus primeros 5 caracteres) aparece como inicio de palabra.
        # Usamos prefijo de 5 caracteres para tolerar: acentos quitados (fisuró→fisur),
        # variaciones sing/plur, y derivaciones léxicas (fisura → fisurómetro).
        prefijo = stem[:5]
        patron = re.compile(rf"\b{re.escape(prefijo)}", re.IGNORECASE)
        if patron.search(texto_opcion):
            presentes.append(stem)
        else:
            faltantes.append(stem)
    # Criterio: al menos 2 de los stems principales deben aparecer
    if len(presentes) < 2:
        return [
            f"Encaje literal débil: solo {len(presentes)} de {len(stems_clave)} palabras clave "
            f"del enunciado aparecen en la solución. "
            f"Presentes: {', '.join(presentes) if presentes else 'ninguna'}. "
            f"Faltan: {', '.join(faltantes[:5])}. "
            f"¿La solución resuelve el enunciado literal o un problema vecino?"
        ]
    return []


def chequear_término_específico(enunciado: str, opcion: dict) -> list[str]:
    """Detecta términos específicos del enunciado que se contradicen con la solución.

    Caso típico: enunciado dice «motores domésticos» y la solución habla de
    «motores de molinos» o «motores industriales».

    Heurística: si el enunciado tiene [sustantivo] + [adjetivo calificativo], y la solución
    usa el mismo sustantivo con un adjetivo distinto, RECHAZA.
    """
    if not enunciado:
        return []
    enunciado_n = _normalizar(enunciado)
    texto_opcion = _normalizar(_campos_a_texto(opcion))
    motivos = []

    # Pares sustantivo + adjetivo comunes en retos (lista no exhaustiva, ampliable)
    pares_criticos = [
        ("domestic", "industrial"), ("domestic", "molino"), ("domestic", "comercial"),
        ("industrial", "domestic"), ("industrial", "comercial"),
        ("comercial", "domestic"), ("comercial", "industrial"),
        ("organico", "plastico"), ("organico", "industrial"),
        ("plastico", "organico"),
        ("urbano", "rural"), ("rural", "urbano"),
        ("formal", "informal"), ("informal", "formal"),
        ("publico", "privado"), ("privado", "publico"),
        ("escolar", "laboral"), ("laboral", "escolar"),
        ("agricola", "industrial"), ("industrial", "agricola"),
        ("ganadero", "agricola"), ("agricola", "ganadero"),
    ]

    for a, b in pares_criticos:
        # Si el enunciado menciona `a` y la solución menciona `b` con el mismo sustantivo base
        # Prefijo sin \b final: matchea plurales/derivados (domesticos, industriales).
        if re.search(rf"\b{a}", enunciado_n) and re.search(rf"\b{b}", texto_opcion):
            # Verificar que comparten sustantivo base: «motores X» o «residuos X»
            # Buscar el sustantivo que acompaña a `a` en el enunciado
            sustantivos_a = re.findall(rf"\b([a-z]{{4,}}) {a}", enunciado_n)
            sustantivos_b = re.findall(rf"\b([a-z]{{4,}}) {b}", texto_opcion)
            # Si hay solapamiento de sustantivos, es el mismo término con adjetivo cambiado
            if sustantivos_a and sustantivos_b:
                comunes = set(sustantivos_a) & set(sustantivos_b)
                if comunes:
                    motivos.append(
                        f"Término del enunciado cambiado: el enunciado dice «{list(comunes)[0]} {a}» "
                        f"y la solución habla de «{list(comunes)[0]} {b}». "
                        f"La solución resuelve un problema vecino, no el del enunciado."
                    )
    return motivos


def chequear_opcion(reto_id: str, enunciado: str, opcion: dict) -> Rechazo:
    """Corre todos los chequeos sobre una opción y devuelve el resultado."""
    oid = opcion.get("id", "?")
    texto = _campos_a_texto(opcion)
    rechazo = Rechazo(reto_id=reto_id, opcion_id=oid, estado="PASS", motivos=[])

    faltantes_motor = opcion.get("_campos_faltantes_motor", [])
    if faltantes_motor:
        rechazo.motivos.append(
            "[MOTOR_SCHEMA] Ruta del motor incompleta para ficha rápida; faltan: "
            + ", ".join(faltantes_motor)
            + ". Completarla antes de aprobarla."
        )

    # 1. FORBIDDEN_PHRASES
    for cat, frase, desc in chequear_forbidden_phrases(texto):
        rechazo.motivos.append(
            f"[FORBIDDEN · {cat}] «{frase}» — {desc}"
        )

    # 2. GENERIC_SMELL (regex-detectables)
    for cat, frase, desc in chequear_generic_smells(texto):
        rechazo.motivos.append(
            f"[SMELL · {cat}] «{frase}» — {desc}"
        )

    # 3. Encaje literal (palabras clave del enunciado presentes en la solución)
    for m in chequear_encaje_literal(enunciado, opcion):
        rechazo.motivos.append(f"[ENCAJE_LITERAL] {m}")

    # 4. Término específico (no cambiar «domésticos» por «molinos»)
    for m in chequear_término_específico(enunciado, opcion):
        rechazo.motivos.append(f"[TERMINO_ENUNCIADO] {m}")

    # 5. Métrica sin unidad física (chequeo simple)
    metrica = opcion.get("metrica", "") or ""
    # Unidades físicas + conteos de beneficiarios con nombre concreto
    unidades = [
        # Medidas físicas
        "quintales", "litros", "vatios", "watts", "horas", "kg", "toneladas",
        "metros", "m2", "m3", "kw", "kwh", "gramos", "milimetros", "mm",
        # Monedas
        "cordobas", "usd", "$",
        # Conteos válidos de beneficiarios/objetos
        "personas", "viviendas", "familias", "productos", "unidades",
        "puestos", "cooperativas", "talleres", "mercados", "escuelas",
        "comunidades", "barrios", "manzanas", "hectareas",
        # Singulares también
        "quintal", "litro", "tonelada", "metro", "persona", "vivienda",
        "familia", "producto", "unidad", "puesto", "cooperativa",
    ]
    if metrica and not any(u in _normalizar(metrica) for u in unidades):
        # Permitir "por validar" como métrica honesta
        if "por validar" not in _normalizar(metrica):
            rechazo.motivos.append(
                f"[METRIC_UNIDAD] Métrica sin unidad física reconocida: «{metrica}». "
                f"Debe usar quintales/litros/vatios/horas/personas/córdobas/USD/kg/toneladas/"
                f"viviendas/familias/puestos/cooperativas u otro conteo concreto."
            )

    # 6. Pagador sin cargo (chequeo simple)
    pagador = opcion.get("pagador", "") or ""
    cargos = ["director", "alcalde", "alcaldesa", "gerente", "presidente",
              "ministerio", "alcaldia", "coordinador", "jefe", "secretario",
              "concejal", "rector", "decano"]
    if pagador and not any(c in _normalizar(pagador) for c in cargos):
        # Permitir «empresa» como comprador privado
        if "empresa" not in _normalizar(pagador) and "fundacion" not in _normalizar(pagador):
            rechazo.motivos.append(
                f"[PAGADOR_CARGO] Pagador sin cargo firmable: «{pagador}». "
                f"Debe nombrar Director/Alcalde/Gerente/Presidente/etc. "
                f"«Comunidad», «junta», «pago simbólico» no cuentan."
            )

    # 7. Mojibake: UTF-8 doble-codificado en cualquier campo
    if MOJIBAKE_RX.search(texto):
        m = MOJIBAKE_RX.search(texto)
        rechazo.motivos.append(
            f"[MOJIBAKE] UTF-8 doble-codificado en el texto: {m.group(0)!r}. "
            f"Reparar el JSON en origen antes de entregar."
        )

    # 8. que_es excede el límite de palabras (80-150; el mínimo se valida en gen_dossier)
    que_es = opcion.get("que_es", "") or ""
    n_que_es = len(que_es.split())
    if n_que_es > QUE_ES_MAX_PALABRAS:
        rechazo.motivos.append(
            f"[QUE_ES_LARGO] que_es tiene {n_que_es} palabras (máx {QUE_ES_MAX_PALABRAS}). "
            f"Acortar a 80-150: primera frase = qué es físico, leer una vez y entender de una."
        )

    # 9. Name-dropping fuera del campo de precedente/analogía
    texto_sin_precedente = " \n ".join(
        p for p in (
            opcion.get("titulo", ""),
            que_es,
            " ".join(opcion.get("como_funciona", []) or []),
            opcion.get("pitch", ""),
        ) if p
    )
    nd = NAME_DROPPING_RX.search(_normalizar(texto_sin_precedente))
    if nd:
        rechazo.motivos.append(
            f"[NAME_DROPPING] «{nd.group(0)}» aparece dentro de la idea. "
            f"El caso ajeno solo va en el campo de precedente/analogía, con año y equipo."
        )

    # Estado final
    if rechazo.motivos:
        rechazo.estado = "RECHAZADA"
    return rechazo


def chequear_gemelas(opciones: list[dict]) -> list[str]:
    """Dos opciones del mismo reto con el mismo objeto (que_es casi idéntico) = una idea."""
    if len(opciones) < 2:
        return []
    a = {t for t in re.findall(r"\b[a-z]{5,}\b", _normalizar(opciones[0].get("que_es", "") or ""))}
    b = {t for t in re.findall(r"\b[a-z]{5,}\b", _normalizar(opciones[1].get("que_es", "") or ""))}
    if not a or not b:
        return []
    jaccard = len(a & b) / len(a | b)
    if jaccard >= 0.5:
        ids = f"{opciones[0].get('id', '?')} y {opciones[1].get('id', '?')}"
        return [
            f"[OPCIONES_GEMELAS] que_es de las opciones {ids} comparten "
            f"{jaccard:.0%} del vocabulario: misma idea disfrazada de dos. "
            f"Objeto Y mecanismo distintos."
        ]
    return []


# ---------------------------------------------------------------------------
# Generación de reportes
# ---------------------------------------------------------------------------

def render_markdown(rechazos: list[Rechazo], enunciados: dict[str, str]) -> str:
    """Genera el markdown con la traza por opción para `docs/_build/compuerta_<certamen>.md`."""
    lines = ["# Compuerta anti-genérico · reporte de chequeo\n"]
    total = len(rechazos)
    rechazadas = sum(1 for r in rechazos if r.estado == "RECHAZADA")
    lines.append(f"**Resumen:** {total - rechazadas} PASS · {rechazadas} RECHAZADAS · {total} total\n")
    lines.append("---\n")

    for r in rechazos:
        lines.append(f"## {r.reto_id} · Opción {r.opcion_id}")
        enunciado = enunciados.get(r.reto_id, "")
        if enunciado:
            lines.append(f"\n> **Enunciado del comité:** {enunciado}\n")
        if r.estado == "PASS":
            lines.append("\n✅ **PASS** — pasó todas las compuertas regex.\n")
        else:
            lines.append("\n❌ **RECHAZADA** — motivos:\n")
            for m in r.motivos:
                lines.append(f"- {m}")
            lines.append("\n**Acción:** regenerar la opción o volver al chain-of-thought del goal.md.\n")
        lines.append("---\n")
    return "\n".join(lines)


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def cargar_solutions(json_path: Path) -> list[dict]:
    """Carga fichas rápidas o la salida agrupada de soluciones_motor.py."""
    data = json.loads(json_path.read_text(encoding="utf-8-sig"))
    if isinstance(data, list):
        return data
    if isinstance(data, dict):
        if "retos" in data:
            return data["retos"]
        if "soluciones" in data:
            return data["soluciones"]
        # Si es un solo reto
        if "reto_id" in data:
            return [data]
    raise ValueError(
        f"Formato de JSON no reconocido. Se esperaba lista de retos o dict con 'retos'/'soluciones'. "
        f"Encontrado: {type(data).__name__}"
    )


def normalizar_reto(reto: dict) -> tuple[str, str, list[dict]]:
    """Adapta un bloque de soluciones_motor.py al contrato de la compuerta."""
    meta = reto.get("reto") if isinstance(reto.get("reto"), dict) else reto
    rid = reto.get("reto_id") or reto.get("id") or meta.get("id") or "DESAFIO_?"
    titulo = meta.get("title", "")
    descripcion = meta.get("description", "")
    enunciado = " ".join(parte for parte in (titulo, descripcion) if parte)
    opciones = reto.get("opciones") or reto.get("soluciones") or []
    return rid, enunciado, [normalizar_opcion(opcion) for opcion in opciones]


def normalizar_opcion(opcion: dict) -> dict:
    """Mapea una ruta del motor a los campos que la compuerta puede auditar."""
    cadena = opcion.get("cadena_razonamiento") or {}
    precedentes = opcion.get("precedentes") or []
    precedente = " | ".join(
        " · ".join(str(precedente.get(campo, "")) for campo in ("equipo", "year", "proyecto", "puesto"))
        for precedente in precedentes
    )
    normalizada = {
        "id": opcion.get("id", "?"),
        "titulo": opcion.get("titulo", ""),
        "que_es": opcion.get("que_es") or opcion.get("concepto", ""),
        "como_funciona": opcion.get("como_funciona", []),
        "pagador": opcion.get("pagador", ""),
        "metrica": opcion.get("metrica") or cadena.get("metrica", ""),
        "ya_existe": opcion.get("ya_existe", ""),
        "precedente": opcion.get("precedente") or precedente,
        "costo": opcion.get("costo", ""),
        "por_validar": opcion.get("por_validar") or opcion.get("riesgo", ""),
        "pitch": opcion.get("pitch", ""),
        "mecanismo_nuevo": opcion.get("mecanismo_nuevo", "") or "",
    }
    if "concepto" in opcion or "cadena_razonamiento" in opcion:
        normalizada["_campos_faltantes_motor"] = [
            campo for campo in ("pagador", "ya_existe", "costo") if not normalizada[campo]
        ]
    return normalizada


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(
        description="Compuerta regex anti-genérico para la skill proponer-retos.",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=__doc__,
    )
    parser.add_argument(
        "--json", required=True, type=Path,
        help="Ruta al JSON de soluciones (output de soluciones_motor.py).",
    )
    parser.add_argument(
        "--out-md", type=Path, default=None,
        help="Ruta donde escribir el reporte markdown (default: stdout).",
    )
    parser.add_argument(
        "--out-json", type=Path, default=None,
        help="Ruta donde escribir el resultado JSON (default: no escribir).",
    )
    parser.add_argument(
        "--verbose", "-v", action="store_true",
        help="Imprimir todos los motivos (no solo los RECHAZADA).",
    )
    args = parser.parse_args(argv)

    if not args.json.exists():
        print(f"ERROR: no existe {args.json}", file=sys.stderr)
        return 2

    retos = cargar_solutions(args.json)
    rechazos: list[Rechazo] = []
    enunciados: dict[str, str] = {}

    for reto in retos:
        rid, enunciado, opciones = normalizar_reto(reto)
        enunciados[rid] = enunciado
        # Si el reto trae una sola opción suelta (no en lista)
        if not opciones and "opcion_id" in reto:
            opciones = [normalizar_opcion(reto)]
        gemelas = chequear_gemelas(opciones)
        for opcion in opciones:
            r = chequear_opcion(rid, enunciado, opcion)
            r.motivos.extend(gemelas)
            if gemelas:
                r.estado = "RECHAZADA"
            rechazos.append(r)

    # Reporte markdown
    md = render_markdown(rechazos, enunciados)
    if args.out_md:
        args.out_md.parent.mkdir(parents=True, exist_ok=True)
        args.out_md.write_text(md, encoding="utf-8")
        print(f"Reporte markdown: {args.out_md}", file=sys.stderr)
    else:
        print(md)

    # JSON de resultado
    if args.out_json:
        args.out_json.parent.mkdir(parents=True, exist_ok=True)
        args.out_json.write_text(
            json.dumps([asdict(r) for r in rechazos], indent=2, ensure_ascii=False),
            encoding="utf-8",
        )
        print(f"Reporte JSON: {args.out_json}", file=sys.stderr)

    # Resumen stderr
    total = len(rechazos)
    rechazadas = sum(1 for r in rechazos if r.estado == "RECHAZADA")
    print(f"\n=== Resumen: {total - rechazadas} PASS · {rechazadas} RECHAZADAS · {total} total ===",
          file=sys.stderr)

    if args.verbose:
        for r in rechazos:
            if r.estado == "PASS":
                print(f"  ✅ {r.reto_id} · Opción {r.opcion_id} — PASS", file=sys.stderr)

    # Exit code: 1 si hay rechazadas, 0 si todo PASS
    return 1 if rechazadas > 0 else 0


if __name__ == "__main__":
    sys.exit(main())
