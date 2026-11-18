# -*- coding: utf-8 -*-
"""Sincroniza el corpus del cerebro (brain/corpus) desde las fuentes canonicas.

Regla: el cerebro aprende SOLO de conocimiento de dominio (rubricas, ganadores,
retos, claims, metodologia). Nunca del motor, ni de proyectos anteriores.

Uso:
    python brain/sync_corpus.py

Despues de sincronizar, reconstruir el grafo:
    graphify-out/.graphify_python  (ver brain/README.md)
"""

from __future__ import annotations

import json
import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CORPUS = ROOT / "brain" / "corpus"

# Fuente -> nombre limpio dentro del corpus.
# Nombres en ASCII a proposito: el graphify deriva los IDs de nodo de la ruta.
COPY = {
    # Documento canonico unico de investigacion (v3): consolida los informes de otras IA
    # y declara la jerarquia de fuentes contra el banco verificado research/sirli/.
    "docs/INFORME_INVESTIGACION.md": "informe_investigacion.md",
    "knowledge/winners_latam.md": "ganadores_latam.md",
    "knowledge/winners_analysis.md": "ganadores_analisis.md",
    "knowledge/rally_analysis.txt": "rally_analisis.txt",
    "knowledge/rubric_matrices.md": "rubricas_matrices.md",
    "knowledge/rubric_latam.md": "rubrica_latam.md",
    "knowledge/voice_notes.md": "guion_voz.md",
    "research/challenges_report.md": "retos_reporte.md",
    # NOTA: "Proyectos Ganadores de Rally Latam.md" y
    # "Análisis del Rally de Innovación.txt" de la raiz son duplicados byte a byte
    # de knowledge/winners_latam.md y knowledge/rally_analysis.txt.
    # Se usa la version de knowledge/ (la canonica segun knowledge/INDICE.md).
    "chatgptdeep-research-report.md": "investigacion_pitch.md",
    # El PDF de la raiz lo genera `scripts/gen_analisis_pdf.py` con el token del
    # proyecto; el corpus solo recibe la copia.
    "Rally_Innovacion_Nicaragua_Analisis.pdf": "analisis_nicaragua.pdf",
    # La rubrica oficial NO se copia como imagen: el cerebro lee texto. La
    # transcripcion literal vive en knowledge/rubric_matrices.md seccion 1.
    "knowledge/analisis_buenas_soluciones.md": "patrones_buenas_soluciones.md",
    "knowledge/ERRATAS.md": "erratas.md",
}

# Un archivo enorme mezcla dos instancias del certamen en un solo tema. Estas
# fuentes se parten al copiarlas: cada trozo es un documento propio del corpus.
SPLIT = {
    "knowledge/winners_latam.md": "dividir_ganadores",
}

# Archivos curados a mano que viven en el corpus y sync_corpus no produce.
MANUAL = [
    "analisis_nicaragua.md",
    "ganadores_cruzados.md",
    "glosario_instancias.md",
    "transcripciones_primeros_lugares_nic.md",
    "videos_sin_audio.md",
    "informe_estado_nic_transcripciones.md",
    "winners_sirli.md",
]

# Archivos que sync_corpus genero en una version anterior y ya no corresponden.
OBSOLETOS = ["ganadores_latam.md", "casos_ganadores.json", "ganadores_nacional.md"]

# Enlaces cruzados entre documentos del corpus.
#
# El grafo solo tiene aristas cuando un nodo apunta a otro. Sin enlaces, cada
# documento queda aislado: hoy son 36 arboles sin una sola relacion entre
# archivos, y las comunidades no pueden cruzar de un documento a otro. Esto es
# la materia prima para el pase semantico (necesita proveedor de LLM); mientras
# tanto, deja escrito que documento responde a que.
RELACIONADO: dict[str, list[tuple[str, str]]] = {
    "rubricas_matrices.md": [
        ("rubrica_latam.md", "puntero que manda aqui"),
        ("pautado_nacional_ref.md", "plantilla que la rubrica nacional califica"),
        ("pautado_latam_ref.md", "plantilla que la rubrica Latam califica"),
        ("erratas.md", "erratas detectadas en el texto oficial"),
        ("patrones_buenas_soluciones.md", "lo que el jurado premia en la practica"),
    ],
    "rubrica_latam.md": [("rubricas_matrices.md", "matriz oficial transcrita")],
    "erratas.md": [("rubricas_matrices.md", "texto normativo donde estan las erratas")],
    "casos_ganadores.md": [
        ("ganadores_db.md", "el mismo podio agrupado por fase"),
        ("ganadores_analisis.md", "por que ganaron esos casos"),
        ("ganadores_cruzados.md", "cruces entre instancias y años"),
        ("winners_sirli.md", "podios levantados con fuente"),
        ("retos.md", "retos que resolvieron"),
    ],
    "ganadores_db.md": [("casos_ganadores.md", "los mismos casos con razonamiento")],
    "winners_sirli.md": [("casos_ganadores.md", "ficha completa del caso"), ("ganadores_db.md", "podio por fase")],
    "ganadores_analisis.md": [("casos_ganadores.md", "casos individuales"), ("ganadores_cruzados.md", "patrones por pais y año")],
    "ganadores_cruzados.md": [("glosario_instancias.md", "que significa cada instancia")],
    "ganadores_latam_internacional.md": [
        ("ganadores_latam_instancia_nacional.md", "la otra mitad del mismo rally: ronda nacional"),
        ("glosario_instancias.md", "no confundir ronda nacional con certamen nacional"),
    ],
    "ganadores_latam_instancia_nacional.md": [
        ("ganadores_latam_internacional.md", "podio continental del mismo rally"),
        ("glosario_instancias.md", "no confundir ronda nacional con certamen nacional"),
    ],
    "glosario_instancias.md": [
        ("ganadores_latam_internacional.md", "instancia internacional"),
        ("ganadores_latam_instancia_nacional.md", "instancia nacional del Rally Latam"),
        ("casos_ganadores.md", "casos del certamen nacional Nicaragua Innova"),
    ],
    "retos.md": [("retos_ranked.md", "los mismos retos priorizados"), ("retos_reporte.md", "informe del banco de retos")],
    "retos_ranked.md": [("retos.md", "banco completo"), ("casos_ganadores.md", "quien gano con cada reto")],
    "retos_reporte.md": [("retos.md", "banco completo de retos")],
    "claims_datos.md": [
        ("informe_investigacion.md", "investigacion que usa estos claims"),
        ("patrones_buenas_soluciones.md", "patrones sostenidos por claims"),
    ],
    "informe_investigacion.md": [("analisis_nicaragua.md", "analisis del ecosistema nacional"), ("claims_datos.md", "cifras citables")],
    "analisis_nicaragua.md": [("informe_investigacion.md", "metodologia y fuentes"), ("retos_ranked.md", "retos priorizados")],
    "patrones_buenas_soluciones.md": [
        ("casos_ganadores.md", "casos de los que salen los patrones"),
        ("rubricas_matrices.md", "como se puntua cada patron"),
        ("insignias.md", "referencias externas verificadas"),
    ],
    "insignias.md": [("patrones_buenas_soluciones.md", "patrones verificados")],
    "investigacion_pitch.md": [("guion_voz.md", "guion de 120 s"), ("patrones_buenas_soluciones.md", "patrones de pitch que premia el jurado")],
    "guion_voz.md": [
        ("investigacion_pitch.md", "hallazgos sobre el pitch"),
        ("videos_sin_audio.md", "que se ve y no se oye en los videos de referencia"),
        ("rubricas_matrices.md", "reglas de duracion del entregable audiovisual"),
    ],
    "videos_sin_audio.md": [
        ("transcripciones_primeros_lugares_nic.md", "transcripcion de esos videos"),
        ("guion_voz.md", "guion que se escribe"),
    ],
    "transcripciones_primeros_lugares_nic.md": [("videos_sin_audio.md", "videos sin audio"), ("casos_ganadores.md", "ficha del mismo caso")],
    "informe_estado_nic_transcripciones.md": [("transcripciones_primeros_lugares_nic.md", "transcripciones que resume")],
    "pautado_nacional_ref.md": [("rubricas_matrices.md", "rubrica que lo califica"), ("pautado_latam_ref.md", "la variante Latam")],
    "pautado_latam_ref.md": [("rubricas_matrices.md", "rubrica que lo califica"), ("pautado_nacional_ref.md", "la variante nacional")],
}

MARCA_RELACIONADO = "<!-- relacionado:inicio -->"


def aplicar_relacionado() -> int:
    """Cierra cada documento con un bloque `## Relacionado` hacia sus vecinos.

    Se reescribe entero en cada sincronizacion (se corta en la marca), asi que
    correr el script dos veces no duplica nada. Los enlaces a archivos que no
    existen se omiten: el mapa puede nombrar un documento antes de crearlo.
    """
    mapa = {k: list(v) for k, v in RELACIONADO.items()}
    indice = "ganadores_latam_instancia_nacional.md"
    anios = sorted(p.name for p in CORPUS.glob(f"{GANADORES_POR_ANIO}*.md"))
    if anios:
        mapa.setdefault(indice, []).extend(
            (a, "podio nacional de ese año") for a in anios
        )
        for a in anios:
            mapa[a] = [(indice, "indice por pais y año")]

    tocados = 0
    for nombre, enlaces in mapa.items():
        dst = CORPUS / nombre
        if not dst.is_file():
            continue
        texto = dst.read_text(encoding="utf-8")
        corte = texto.find(MARCA_RELACIONADO)
        if corte != -1:
            texto = texto[:corte].rstrip() + "\n"
        lineas = [f"- [{otro}]({otro}) — {razon}." for otro, razon in enlaces if (CORPUS / otro).is_file()]
        if not lineas:
            continue
        bloque = [MARCA_RELACIONADO, "", "## Relacionado", ""] + lineas
        dst.write_text(texto.rstrip() + "\n\n" + "\n".join(bloque) + "\n", encoding="utf-8")
        tocados += 1
    return tocados

# JSON -> Markdown legible (si van como .json, graphify los trata como codigo/AST).
JSON_DOCS = {
    "research/claims.json": ("claims_datos.md", "Claims verificables"),
    "knowledge/winners_database.json": ("ganadores_db.md", "Casos ganadores por fase"),
    "research/challenges.json": ("retos.md", "Banco de retos"),
    "research/challenges_ranked.json": ("retos_ranked.md", "Retos priorizados"),
    "knowledge/insignias.json": ("insignias.md", "Marcos y referencias externas verificadas"),
    "knowledge/retos_razonamiento.json": (
        "casos_ganadores.md",
        "Casos ganadores con razonamiento (problema, causa, solucion)",
        "El campo `rally` vale `latam` o `nacional`. `nacional` significa clasificacion "
        "nacional del caso segun su fuente, NO automaticamente el Rally Nacional "
        "Nicaragua Innova. Verifica el caso antes de citarlo.",
    ),
}

# DOCX -> Markdown (texto plano, sin formato). Mas determinista para extraer.
# Un solo Word de plantilla (el nacional vive en plantillas/); el de Latam es otro.
DOCX = {
    "plantillas/pautado_template.docx": "pautado_nacional_ref.md",
    "knowledge/pautado_latam_ref.docx": "pautado_latam_ref.md",
}

# Nunca entran al cerebro.
# - LEEME.md / docs/ / scripts/ / dashboard/: instrucciones y motor, no conocimiento.
# - graphify-out/converted/: proyectos anteriores (regla 11 de AGENTS.md).
# - imagenes sueltas sin valor probatorio.


def docx_to_md(src: Path) -> str:
    from docx import Document

    doc = Document(str(src))
    out: list[str] = []
    for p in doc.paragraphs:
        t = p.text.strip()
        if not t:
            continue
        style = (p.style.name or "").lower()
        if style.startswith("heading"):
            level = "".join(c for c in style if c.isdigit()) or "2"
            out.append("#" * min(int(level) + 1, 6) + " " + t)
        else:
            out.append(t)
    for table in doc.tables:
        for row in table.rows:
            cells = [c.text.strip().replace("\n", " ") for c in row.cells]
            out.append("| " + " | ".join(cells) + " |")
    return "\n\n".join(out)


def json_to_md(src: Path, title: str, nota: str = "") -> str:
    """Renderiza datos JSON como Markdown legible.

    Sin esto, graphify clasifica los .json como codigo y los pasa por AST,
    que produce nodos basura. Como documento, el extractor semantico si
    entiende los claims y los casos ganadores.
    """
    data = json.loads(src.read_text(encoding="utf-8"))
    out: list[str] = [f"# {title}", ""]
    if nota:
        out.extend([f"> {nota}", ""])

    def scalar(v):
        if isinstance(v, bool):
            return "si" if v else "no"
        if v is None:
            return ""
        if isinstance(v, (int, float)):
            return str(v)
        return str(v).replace("\n", " ").strip()

    def walk(obj, depth=0):
        pad = "  " * depth
        if isinstance(obj, dict):
            for k, v in obj.items():
                key = str(k).replace("_", " ").strip()
                if isinstance(v, (dict, list)):
                    out.append("")
                    out.append(f"{'#' * min(depth + 2, 6)} {key}")
                    out.append("")
                    walk(v, depth + 1)
                else:
                    out.append(f"- **{key}**: {scalar(v)}")
        elif isinstance(obj, list):
            for i, item in enumerate(obj, 1):
                if isinstance(item, (dict, list)):
                    out.append("")
                    out.append(f"{'#' * min(depth + 2, 6)} Registro {i}")
                    out.append("")
                    walk(item, depth + 1)
                else:
                    out.append(f"- {scalar(item)}")
        else:
            out.append(f"- {scalar(obj)}")

    walk(data)
    return "\n".join(out)


# Prefijo de los archivos por año: main() borra los que ya no correspondan.
GANADORES_POR_ANIO = "ganadores_latam_instancia_nacional_"

AVISO_INTERNACIONAL = (
    "Que es: podio continental del Rally Latinoamericano de Innovacion (28 h, "
    "desde 2014). No son los ganadores del Rally Nacional Nicaragua Innova "
    "(certamen distinto, 24 h, desde 2023) ni la clasificacion por pais del "
    "propio Rally Latinoamericano."
)

AVISO_NACIONAL = (
    "Que es: ronda nacional de cada pais dentro del Rally Latinoamericano de "
    "Innovacion; la clasificacion de Nicaragua de este listado es de este rally. "
    "No es el Rally Nacional Nicaragua Innova, que es un certamen aparte "
    "(categorias Tecnologica, Social y Procesos u Organizacional). Escribe "
    "siempre cual de los dos estas citando: 'nacional' a secas confunde."
)


def dividir_ganadores(texto: str) -> list[tuple[str, str]]:
    """Parte el registro de ganadores por instancia y, la nacional, por año.

    Un solo archivo de 127 KB hace que el grafo trate el podio continental y las
    800 filas nacionales como un mismo tema. Separados, cada instancia forma su
    propia comunidad y se puede citar por separado.

    La instancia nacional tiene 363 filas en una tabla unica: dentro de un mismo
    archivo, una consulta de 2023 compite con filas de 2017 y el resultado se
    mezcla. Un archivo por año deja cada edicion como su propia unidad, y el
    archivo principal queda como indice con el resumen y los enlaces.

    El aviso de cada encabezado existe por un error real: el modelo confundia la
    ronda nacional del Rally Latinoamericano con el Rally Nacional Nicaragua
    Innova, que es otro certamen. El nombre del archivo y la primera linea dicen
    cual es cual.
    """
    bloques = texto.split("\n## ")
    partes: dict[str, list[str]] = {"internacional": [], "nacional": []}
    for bloque in bloques[1:]:
        titulo = bloque.split("\n", 1)[0].strip().lower()
        # Ojo: "internacional" contiene la cadena "nacional"; hay que mirar el inicio.
        destino = "nacional" if titulo.startswith("nacional") else "internacional"
        partes[destino].append("## " + bloque.rstrip())

    salida: list[tuple[str, str]] = []

    if partes["internacional"]:
        cuerpo = "\n\n".join(partes["internacional"])
        salida.append(
            (
                "ganadores_latam_internacional.md",
                "# Ganadores del Rally Latinoamericano: podio internacional (2017-2026)"
                f"\n\n> {AVISO_INTERNACIONAL}\n\n{cuerpo}\n",
            )
        )

    if partes["nacional"]:
        cabecera, filas, sueltas = [], [], []
        for linea in "\n\n".join(partes["nacional"]).splitlines():
            t = linea.strip()
            if t.startswith("| 20"):
                filas.append(t)
            elif t.startswith("|"):
                cabecera.append(t)
            elif t and not t.startswith("## Nacional") and set(t) != {"-"}:
                sueltas.append(linea)

        por_anio: dict[str, list[str]] = {}
        for fila in filas:
            anio = fila[1:].split("|")[0].strip()
            por_anio.setdefault(anio, []).append(fila)

        tabla_cab = "\n".join(cabecera)
        indice = [
            "## Resumen por año",
            "",
            "Cada año tiene su propio archivo; abre el que necesites en vez de leer todo.",
            "",
            "| Año | Equipos en el podio nacional | Archivo |",
            "|---|---|---|",
        ]
        ordenados = sorted(por_anio, reverse=True)
        for anio in ordenados:
            nombre = f"{GANADORES_POR_ANIO}{anio}.md"
            documento = (
                f"# Ganadores de la instancia nacional del Rally Latinoamericano, año {anio}"
                f"\n\n> {AVISO_NACIONAL}\n\n"
                f"Son {len(por_anio[anio])} equipos del podio nacional de {anio}, de todos los países.\n\n"
                f"{tabla_cab}\n" + "\n".join(por_anio[anio]) + "\n"
            )
            salida.append((nombre, documento))
            indice.append(f"| {anio} | {len(por_anio[anio])} | `{nombre}` |")

        cuerpo_indice = "\n".join(sueltas).strip()
        documento = (
            "# Ganadores de la instancia nacional del Rally Latinoamericano, por pais (2017-2026)"
            f"\n\n> {AVISO_NACIONAL}\n\n"
            + (f"{cuerpo_indice}\n\n" if cuerpo_indice else "")
            + f"Total: {len(filas)} equipos en {len(ordenados)} ediciones.\n\n"
            + "\n".join(indice)
            + "\n"
        )
        salida.append(("ganadores_latam_instancia_nacional.md", documento))

    return salida


def main() -> int:
    CORPUS.mkdir(parents=True, exist_ok=True)
    written, missing = [], []

    for rel, name in COPY.items():
        src = ROOT / rel
        if not src.is_file():
            missing.append(rel)
            continue
        dst = CORPUS / name
        shutil.copyfile(src, dst)
        written.append((name, dst.stat().st_size))

    for rel, name in DOCX.items():
        src = ROOT / rel
        if not src.is_file():
            missing.append(rel)
            continue
        text = docx_to_md(src)
        dst = CORPUS / name
        dst.write_text(text, encoding="utf-8")
        written.append((name, dst.stat().st_size))

    for rel, spec in JSON_DOCS.items():
        src = ROOT / rel
        if not src.is_file():
            missing.append(rel)
            continue
        name, title = spec[0], spec[1]
        nota = spec[2] if len(spec) > 2 else ""
        text = json_to_md(src, title, nota)
        dst = CORPUS / name
        dst.write_text(text, encoding="utf-8")
        written.append((name, dst.stat().st_size))

    # Fuentes que se parten al entrar: un documento por instancia del certamen.
    for rel, divisor in SPLIT.items():
        src = ROOT / rel
        if not src.is_file():
            missing.append(rel)
            continue
        partir = globals()[divisor]
        trozos = partir(src.read_text(encoding="utf-8"))
        # Los archivos por año se regeneran: si un año desaparece del origen, su
        # archivo viejo se quedaria en el corpus mintiendo.
        nombres = {n for n, _ in trozos}
        for viejo in CORPUS.glob(f"{GANADORES_POR_ANIO}*.md"):
            if viejo.name not in nombres:
                viejo.unlink(missing_ok=True)
        for name, text in trozos:
            dst = CORPUS / name
            dst.write_text(text, encoding="utf-8")
            written.append((name, dst.stat().st_size))

    # Archivos de una sincronizacion anterior que ya no corresponden.
    for name in OBSOLETOS:
        (CORPUS / name).unlink(missing_ok=True)

    # Enlaces cruzados: sin esto cada documento queda como arbol aislado.
    enlazados = aplicar_relacionado()

    # El proyecto real entra como un archivo mas, y solo cuando exista.
    # sync_corpus.py no lo borra: si esta, se queda.
    project = CORPUS / "proyecto_actual.md"
    manual = [n for n in MANUAL if (CORPUS / n).is_file()]
    state = {
        "corpus_files": len(written) + len(manual) + (1 if project.is_file() else 0),
        "project_file": project.name if project.is_file() else None,
        "missing_sources": missing,
        "files": [{"name": n, "bytes": s} for n, s in sorted(written)],
        "manual": [{"name": n, "bytes": (CORPUS / n).stat().st_size} for n in manual],
    }
    (ROOT / "brain" / "corpus_state.json").write_text(
        json.dumps(state, indent=2, ensure_ascii=False), encoding="utf-8"
    )

    print(f"Corpus: {len(written)} archivos -> {CORPUS}")
    print(f"Relacionado: {enlazados} documentos con enlaces cruzados")
    print(f"Proyecto actual: {project.name if project.is_file() else 'NO (el cerebro espera)'}")
    if missing:
        print("Fuentes ausentes: " + ", ".join(missing))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
