#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
mapa_sistema.py -- Inventario verificable de Rally Studio.

Lee el repositorio (no lo modifica) y escribe:
  docs/MAPA_SISTEMA.md    mapa completo: skills, pestanas, modulos, entregables,
                          dependencias, duplicaciones y plan de fusion.
  docs/mapa_sistema.json  la misma informacion en crudo, para otros agentes.

Nada de esto toca el motor (rally_service.py, app.js, index.html).
"""
from __future__ import annotations

import io
import json
import re
import sys
from pathlib import Path

if sys.platform == "win32":
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")

RAIZ = Path(__file__).resolve().parents[1]
SKILLS = RAIZ / "skills"
SCRIPTS = RAIZ / "scripts"
TOOLS = RAIZ / "tools"
APP = RAIZ / "dashboard" / "app.js"
SALIDA_MD = RAIZ / "docs" / "MAPA_SISTEMA.md"
SALIDA_JSON = RAIZ / "docs" / "mapa_sistema.json"

# Secciones de relleno que hoy se repiten en casi todos los SKILL.md.
BOILERPLATE = [
    "Cómo sugerir un título o nombre de proyecto o producto",
    "Cómo enseñar visualmente",
    "Cómo redactar guiones cuidando la pronunciación",
    "Cómo crear modelos 3D",
    "Cómo sugerir elementos gráficos",
]

# Entregables oficiales del certamen y quien los produce.
ENTREGABLES = [
    ("brief.json", "estado unico del proyecto", "scripts/init_brief.py, crear_proyecto.py",
     "tabs certamen/team/challenges"),
    ("pautado (5 secciones)", "texto oficial del comite", "scripts/gen_pautado.py",
     "tab pautado -> servir_propuesta.py"),
    ("budget/budget.json + xlsx", "prefactibilidad economica", "scripts/gen_budget.py, validate_budget.py",
     "tab budget"),
    ("budget/bom.csv", "piezas y dimensiones para modelar", "skills/presupuesto + modeler",
     "skills/modelo-3d-blender"),
    ("docs/canvas.md", "modelo de negocio", "scripts/gen_canvas.py", "tab canvas"),
    ("script/script.md", "guion PAS-V 4 actos <=120 s", "scripts/gen_script.py", "tab script"),
    ("shots/*.yaml -> script/shotlist.csv", "contrato de tomas", "scripts/build_shotlist.py",
     "skills/storyboard"),
    ("docs/storyboard_visual.html", "tablero de rodaje", "skills/storyboard/gen_storyboard_visual.py",
     "generado desde el CSV"),
    ("assets/voice/narration.mp4", "locucion <=120 s", "scripts/gen_voice.py", "etapa voz"),
    ("video final", "YouTube con URL en brief.json", "editor + arsenal.py check-duracion", "tab timeline"),
    ("site/ publicado", "web demo", "scripts/publish_site.py", "tab webdemo"),
    ("dossier (PDF/Word/Excel)", "soluciones sustentadas", "scripts/gen_dossier.py, gen_soluciones_pdf.py",
     "skills/dossier-soluciones"),
    ("docs/STORYBOARD.md", "indice del rodaje", "skills/storyboard", "documento"),
    ("knowledge/INDICE.md", "mapa del corpus", "scripts/gen_indice.py", "documento"),
]

# Modulos del dashboard (fuera del motor) y para que existen.
MODULOS_DASH = [
    ("dashboard/app.js", "maquina de estado + 14 pestanas + renderers", "MOTOR: no se edita por contenido"),
    ("dashboard/content_bridge.js", "acepta propuestas del buzon (Aceptar/Descartar)", "puente contenido->ventana"),
    ("dashboard/section_sync.js", "sincroniza secciones entre miembros del equipo", "colaboracion"),
    ("dashboard/super_agents.js", "6 super agentes de revision por pestana", "auditoria inline"),
    ("dashboard/super_agents_rubrics.js", "rubricas que usan esos agentes", "datos de auditoria"),
    ("dashboard/challenge_parser.js", "parsea retos pegados por el usuario", "entrada de retos"),
    ("dashboard/stats.html/.js", "panel de estadisticas del corpus SIRLI", "vitrina"),
    ("dashboard/graph.html", "grafo de conocimiento navegable", "vitrina"),
    ("dashboard/dossier_preview.html", "previsualiza el dossier antes de exportar", "vitrina"),
    ("dashboard/join.html/.js", "union de miembros por invitacion", "multijugador"),
    ("dashboard/admin.html/.js", "administracion del proyecto", "multijugador"),
    ("dashboard/presence.js", "quien esta en linea y en que pestana", "multijugador"),
]


def _leer(p: Path) -> str:
    try:
        return p.read_text(encoding="utf-8", errors="replace")
    except OSError:
        return ""


def _frontmatter(texto: str) -> dict:
    m = re.match(r"^---\s*\n(.*?)\n---", texto, re.S)
    datos: dict[str, str] = {}
    if not m:
        return datos
    clave = None
    for linea in m.group(1).splitlines():
        if re.match(r"^[a-zA-Z_]+:", linea):
            clave, _, valor = linea.partition(":")
            datos[clave.strip()] = valor.strip()
        elif clave and linea.strip():
            datos[clave] += " " + linea.strip()
    return datos


def inventario_skills() -> list[dict]:
    filas = []
    for carpeta in sorted(p for p in SKILLS.iterdir() if p.is_dir()):
        f = carpeta / "SKILL.md"
        if not f.exists():
            continue
        texto = _leer(f)
        fm = _frontmatter(texto)
        titulos = re.findall(r"^#{2,3} (.+)$", texto, re.M)
        refs = sorted(set(re.findall(r"(?:scripts|tools)/[a-z_0-9]+\.py", texto)))
        refs_skill = sorted(set(re.findall(r"skills/[a-z0-9\-]+/", texto)))
        extras = sorted(p.name for p in carpeta.iterdir() if p.is_file() and p.name != "SKILL.md")
        filas.append({
            "id": carpeta.name,
            "descripcion": fm.get("description", ""),
            "lineas": len(texto.splitlines()),
            "scripts": refs,
            "skills_citadas": refs_skill,
            "extras": extras,
            "secciones_boilerplate": [b for b in BOILERPLATE if any(b[:28] in t for t in titulos)],
            "titulos": titulos,
        })
    return filas


def inventario_tabs() -> list[dict]:
    texto = _leer(APP)
    m = re.search(r"const NAV_TABS = \[(.*?)\n\];", texto, re.S)
    tabs = []
    if not m:
        return tabs
    for linea in m.group(1).splitlines():
        idm = re.search(r'id:\s*"([^"]+)"', linea)
        if not idm:
            continue
        tabs.append({
            "id": idm.group(1),
            "label": (re.search(r'label:\s*"([^"]+)"', linea) or [None, ""])[1] if False else (
                re.search(r'label:\s*"([^"]+)"', linea).group(1)
                if re.search(r'label:\s*"([^"]+)"', linea) else ""),
            "level": int((re.search(r'level:\s*(\d+)', linea) or re.search(r"level:\s*(\d+)", linea)).group(1))
            if re.search(r'level:\s*(\d+)', linea) else -1,
            "check": (re.search(r"check:\s*(.+?)\s*\}", linea).group(1)
                      if re.search(r"check:\s*(.+?)\s*\}", linea) else ""),
        })
    return tabs


def _docstring(texto: str) -> str:
    """Primera linea util del docstring del modulo, sin regex codiciosa."""
    lineas = texto.splitlines()
    i = 0
    while i < len(lineas) and lineas[i].lstrip().startswith("#"):
        i += 1
    resto = "\n".join(lineas[i:])
    if not resto.lstrip().startswith('"""'):
        return ""
    cuerpo = resto.lstrip()[3:]
    fin = cuerpo.find('"""')
    if fin >= 0:
        cuerpo = cuerpo[:fin]
    for linea in cuerpo.strip().splitlines():
        if linea.strip() and not linea.strip().startswith("--"):
            return linea.strip()
    return ""


def inventario_scripts() -> list[dict]:
    filas = []
    for f in sorted(SCRIPTS.glob("*.py")):
        texto = _leer(f)
        doc = _docstring(texto)[:150]
        filas.append({"archivo": f.name, "lineas": len(texto.splitlines()), "doc": doc[:150]})
    return filas


def inventario_scripts_en(carpeta: Path, nombre: str) -> str:
    """Primera linea util del docstring de un .py, para la tabla del mapa."""
    return _docstring(_leer(carpeta / nombre))[:110] or "—"


def cruces(skills: list[dict], scripts: list[dict]) -> dict:
    citados = {s for sk in skills for s in sk["scripts"]}
    huerfanos = [s["archivo"] for s in scripts
                 if f"scripts/{s['archivo']}" not in citados and s["archivo"] != "mapa_sistema.py"]
    sin_script = [sk["id"] for sk in skills if not sk["scripts"]]
    cuenta_boiler = {}
    for sk in skills:
        for b in sk["secciones_boilerplate"]:
            cuenta_boiler[b] = cuenta_boiler.get(b, 0) + 1
    return {
        "scripts_total": len(scripts),
        "scripts_citados": len(citados),
        "scripts_huerfanos": huerfanos,
        "skills_sin_script": sin_script,
        "boilerplate_por_seccion": cuenta_boiler,
    }


def md_inventario_skills(skills: list[dict]) -> str:
    out = ["| Skill | Lineas | Produce/usa | Scripts | Extras |", "|---|---|---|---|---|"]
    for s in skills:
        out.append("| `{id}` | {n} | {d} | {sc} | {ex} |".format(
            id=s["id"], n=s["lineas"],
            d=s["descripcion"][:110].replace("|", "/"),
            sc=", ".join(f"`{x.split('/')[-1]}`" for x in s["scripts"]) or "—",
            ex=", ".join(s["extras"]) or "—"))
    return "\n".join(out)


def md_inventario_tabs(tabs: list[dict]) -> str:
    out = ["| # | Pestana | Nivel | Se abre cuando |", "|---|---|---|---|"]
    for t in tabs:
        out.append("| `{id}` | {label} | {lvl} | {chk} |".format(
            id=t["id"], label=t["label"], lvl=t["level"], chk=t["check"].replace("|", "/")))
    return "\n".join(out)


def md_inventario_scripts(scripts: list[dict], criticos: set[str]) -> str:
    out = ["| Script | Lineas | Que hace | Critico |", "|---|---|---|---|"]
    for s in scripts:
        out.append("| `{a}` | {n} | {d} | {c} |".format(
            a=s["archivo"], n=s["lineas"], d=s["doc"] or "—",
            c="si" if s["archivo"] in criticos else ""))
    return "\n".join(out)


def md_entregables() -> str:
    out = ["| Entregable | Sirve para | Lo produce | Donde se sirve |", "|---|---|---|---|"]
    for nombre, fin, prod, donde in ENTREGABLES:
        out.append(f"| `{nombre}` | {fin} | {prod} | {donde} |")
    return "\n".join(out)


def md_modulos() -> str:
    out = ["| Modulo | Que es | Frontera |", "|---|---|---|"]
    for nombre, que, fr in MODULOS_DASH:
        out.append(f"| `{nombre}` | {que} | {fr} |")
    return "\n".join(out)


ANALISIS = """
## 1. Como se encadena hoy (una sola ruta)

```
brief.json
   |  (00 certamen, 01 equipo, 02 retos del comite)
   v
research/challenges.json  --(proponer-retos / soluciones_motor)-->  solucion aprobada
   |                                                                     |
   |  (03 taller, 04 impacto, 05 despacho)                               |
   v                                                                     v
research/claims.json  --(investigacion)-->  pautado (06)  --->  budget (07)  --->  canvas (09)
   |                                              |                  |
   |                                              +------------------+--> script/script.md (10)
   |                                                                     |
   |         shots/*.yaml --build_shotlist--> shotlist.csv + movimiento.json
   |                                                  |
   |                                 gen_teleprompter --> script/teleprompter.html  (rodaje)
   v                                                                     v
 assets 3D (modelo-3d-blender) ---> renders -----> video 120 s (11, 12) ---> YouTube
```

El eslabon que estaba roto —**guion -> shots -> shotlist -> tablero**— ya es uno solo:
`script/script.md` y `script/shotlist.csv` siguen mandando, `script/movimiento.json` añade el
movimiento por toma y `gen_teleprompter.py` los junta en `script/teleprompter.html`, que se usa
en el rodaje desde el telefono. `docs/storyboard_visual.html` queda como hoja imprimible, no
como paso obligatorio.

### 1.1 De donde sale cada cosa (corpus -> consumidores)

La investigacion profunda no alimenta una sola pestana: es la base de datos que nutre seis
consumidores distintos. Si se rompe `research/claims.json`, se caen todos a la vez.

| Fuente | Consumidor | Como llega |
|---|---|---|
| `research/claims.json` | pautado (06), guion, dossier, presupuesto | cifra citada con URL y año; `validate_pautado.py` e `arsenal.py check-coherencia` la vigilan |
| `knowledge/winners_database.json` + `winners_latam.md` | propuesta-identidad, proponer-retos, guion | nombre, patron de pitch y color ganador por año/equipo |
| `knowledge/retos_razonamiento.json` | soluciones_motor -> dossier-soluciones | cadena problema-causa-insight-solucion-metrica y precedente |
| `knowledge/rubric_matrices.md` §3 §4 | guion-storyboard, pautado, storyboard | fracciones 17/33/29/21 y limites de caracteres (una sola fuente) |
| `knowledge/voice_notes.md` | guion, gen_voice | WPM, pausas, modo de decir |
| `research/sirli/winners.jsonl` | propuesta-identidad, contexto-rally | patrones de nombre (inventado, objeto, compuesto, territorio, sufijo, juego) |
| `assets/` (audio, covers, gif) | storyboard -> teleprompter | pista de audio por acto y portada real, no cards genericas |

Regla: un dato entra a la ventana solo si existe en una de estas fuentes. Lo que no esta,
se pregunta, no se inventa.

## 2. Que se puede unir (ordenado por ahorro real)

### 2.1 Guion + storyboard -> un entregable vivo (prioridad 1) — HECHO
Hoy: `script/script.md` (texto), `script/shotlist.csv` (contrato), `docs/storyboard_visual.html`
(hoja de contactos) y la pestana `script` del dashboard. Cuatro vistas del mismo objeto.

Fusion propuesta: **`script/teleprompter.html`**, generado por
`skills/guion-storyboard/gen_teleprompter.py`, con dos modos en la misma pagina:
direccion de tomas (que se ve, que se oye, como entra y sale, con la referencia visual de
cada toma) y rodaje (teleprompter en el telefono que avanza con la voz del que lee y graba
a 4K). El guion y el CSV siguen siendo la fuente de verdad; el HTML es la vista de rodaje.
Ver `skills/guion-storyboard/SKILL.md`.

Estado: construido. `gen_teleprompter.py` + `plantilla_teleprompter.html` generan el HTML,
`script/movimiento.json` declara el movimiento por toma, `guion-pas-v` y `storyboard` quedan
consolidadas. La regla de movimiento (fija > 2.5 s = tiempo muerto) y el ritmo (240-270
palabras, 135 ppm) se auditan en la consola del generador: son decisiones del especialista,
no campos que el equipo ajuste.

Salida en papel: `tools/exportar_pdf.py` imprime el mismo HTML a `script/guion_rodaje.pdf`
(guion en cuadritos a la izquierda, referencia a la derecha, audio y corte en letra minima
debajo del cuadro) para quien graba con la camara nativa del telefono. Como se transcribe,
donde queda el clip y donde se logra la mejor calidad: `docs/RODAJE.md`.

### 2.2 Boilerplate de skills -> un solo bloque compartido (prioridad 2) — HECHO
Cinco secciones se repetian en casi todos los SKILL.md: sugerir nombre, ensenar
visualmente, redactar guiones, crear 3D, elementos graficos.

Estado: `tools/unificar_comun.py` agrupa las secciones por texto normalizado, elige la
variante dominante, la escribe en `skills/_comun/{nombres,ensenanza-visual,guiones,
modelos-3d,elementos-graficos}.md` y deja un puntero de dos lineas en cada skill. Solo
sustituye variantes que son subconjunto del canonico: si una skill tiene una version mas
rica (el procedimiento 3D real de `modelo-3d-blender`, la ensenanza visual de
`auditar-entregable`) se queda donde esta. Resultado medido: 49 punteros, 13,4 KB -> 1,6 KB
en secciones repetidas, `skills/*.md` paso de 242 KB a 233 KB sin perder ni una regla.
Idempotente (`--forzar` para regenerar los canonicos).

### 2.3 Dos skills de soluciones -> una con dos salidas (prioridad 3) — NO EJECUTADO
`proponer-retos` y `dossier-soluciones` comparten compuerta de nueve campos, cadena
problema-causa-insight-solucion-metrica y el mismo generador de PDF. `proponer-retos`
deberia ser el paso 1 (ficha en chat) y `dossier-soluciones` el paso 2 (PDF/Word/Excel),
declarado dentro del mismo skill como seccion "salida larga".
No se ejecuto a proposito: son 199 + 611 lineas y el motor de soluciones
(`scripts/soluciones_motor.py`) importa ambas por nombre; fusionar sin pruebas del motor
rompe el flujo que hoy funciona. Queda como propuesta con dueño.
No fusionar `sharktank`: es lente de riesgo, no de produccion.

### 2.4 Duplicacion de skills en tres carpetas (prioridad 2, mecanica) — HECHO
`skills/` es la fuente; `.opencode/skills/` y `.agents/skills/` son copias.
Estado: `python scripts/sync_skills.py` corrido -> 18 skills en las tres carpetas
(antes `.agents/skills` tenia 3 de 17). Correrlo despues de cualquier cambio en `skills/`.

### 2.5 Tabs que no tienen dueño de contenido — DECLARADO
`stats`, `graph`, `dossier_preview`, `join`, `admin` no aparecen en ninguna skill: son
vitrinas y multijugador. No falta skill; quedan declaradas "fuera del flujo" para que
nadie las busque en el guion.

## 3. Que depende de que (para no romper al fusionar)

| Si cambia... | Se rompe | Mitigacion |
|---|---|---|
| columnas de `script/shotlist.csv` | `build_shotlist.py`, tablero, teleprompter | el teleprompter lee por nombre de columna y tolera faltantes |
| orden de actos o fracciones 17/33/29/21 | guion, storyboard, teleprompter, auditoria | una sola constante en `rubric_matrices.md` §3 |
| `NAV_TABS` (ids) | `content_bridge.js` (slots por tab), `servir_propuesta.py` | no renombrar ids; el teleprompter se enlaza como archivo, no como tab |
| `state.script.actoN` | tab script, super_agents, teleprompter (modo vivo) | el teleprompter acepta `--acts` desde el estado o desde el markdown |
| `budget/bom.csv` cabecera `dim_*_mm` | todas las tomas `modeler` | congelar cabecera |

## 4. Regla de movimiento del video (lo que el usuario reclama)

Una imagen fija mas de ~2,5 s es tiempo muerto. El sistema no lo medía: `shotlist.csv` no
tenia campo de movimiento y el tablero no lo mostraba. El entregable unificado agrega
`script/movimiento.json` (sidecar, no toca el motor) con
`{ "<shot_id>": {"tipo": "...", "detalle": "..."} }`, tipos admitidos:
`camara` (paneo, dolly, seguimiento, handheld), `objeto` (el mecanismo se mueve),
`motion2d` (graficos animados, contadores, barras), `persona` (accion real),
`transicion` (match cut, whip pan, J-cut), `3d` (orbit, explosionada, corte animado).
El generador audita toda toma sin movimiento o con `duration_s > 2.5` y tipo estatico, y
cuenta el porcentaje de metraje en movimiento: `movimiento=89.4%`, `violaciones_estaticas=1`.
Es una regla de autoria, no un indicador de pantalla: el equipo no lo ve ni lo ajusta.

Cada toma ademas necesita un **cuadro de referencia** visible: el generador busca `ref` en el
`shotlist.csv` o en `movimiento.json`, y si no, `script/refs/<ID>.jpg|png|webp`. La imagen se
incrusta como data URI a 760 px, de modo que el entregable sigue siendo un solo archivo que
abre sin red en el telefono. Sin referencia, la tarjeta muestra un marco `crear` y el
generador lo lista en avisos. Para el tablero demo, `tools/dibujar_storyboard.py` reencuadra
el arte que ya existe en `assets/covers/` y dibuja encima las flechas de movimiento: seis
cuadros 16:9 en `script/refs/demo/`, numerados por paso.

## 5. Ley de interfaz minima (aplicada al entregable de rodaje)

Regla del usuario: nada de parrafos, nada de datos tecnicos en pantalla, icono antes que
palabra. Queda escrita en `.agents/rules/ui-minima.md` y aplicada en
`skills/guion-storyboard/plantilla_teleprompter.html`:

- cabecera: nombre + dos botones con icono y una palabra (Tomas, Rodar);
- tomas: reparto de los 4 actos y dos cifras (palabras, duracion); tablero visual, un cuadro
  16:9 por toma (numero de paso, duracion) con id, timecode, descripcion y detalle plegable
  (movimiento, audio, corte, rubrica, dueno);
- rodar: teleprompter con HUD de dos datos (toma en curso y siguiente) y controles solo con
  icono; el texto avanza con la voz del que lee.

Paleta: la de la app (`brand/tokens.css`, fondo blanco y texto `#111`), no un tema oscuro
propio. Unica excepcion justificada: el panel de rodaje `.tel` es negro porque esa pantalla
queda frente a la cara del actor y no debe iluminar la escena. Iconos con `title` +
`aria-label` (11 botones) y SVG con `aria-hidden` (28), verificados por
`tools/a11y_plantilla.py`.

Pantallas pendientes de pasar por la misma ley, en orden de trafico: `dashboard` (tabs
pautado y presupuesto muestran ayudas largas), `stats.html`, `graph.html`, `admin.html`,
`join.html`, `dossier_preview.html`. Criterio de aceptacion en la propia regla: contar
parrafos, debe dar cero.
"""


def main() -> int:
    skills = inventario_skills()
    tabs = inventario_tabs()
    scripts = inventario_scripts()
    c = cruces(skills, scripts)

    criticos = {"build_shotlist.py", "gen_script.py", "gen_pautado.py", "gen_budget.py",
                "servir_propuesta.py", "validate_pautado.py", "validate_budget.py",
                "validate_brief.py", "arsenal.py", "gen_voice.py"}

    md = []
    md.append("# Mapa del sistema Rally Studio\n")
    md.append("Generado por `python tools/mapa_sistema.py`. No editar a mano: se regenera.\n")
    md.append(f"Conteo: **{len(skills)} skills**, **{len(tabs)} pestanas**, "
              f"**{len(scripts)} scripts**, **{len(ENTREGABLES)} entregables**.\n")

    md.append("## Pestanas de la ventana (13 etapas + resumen)\n")
    md.append(md_inventario_tabs(tabs))
    md.append("")

    md.append("## Skills\n")
    md.append(md_inventario_skills(skills))
    md.append("")

    md.append("## Modulos del dashboard\n")
    md.append(md_modulos())
    md.append("")

    md.append("## Entregables\n")
    md.append(md_entregables())
    md.append("")

    md.append("## Scripts\n")
    md.append(md_inventario_scripts(scripts, criticos))
    md.append("")

    md.append("## Herramientas de analisis (`tools/`)\n")
    md.append("No son motor: son inspectores de solo lectura que se corren a mano.\n")
    md.append("| Archivo | Uso |\n|---|---|")
    for f in sorted(TOOLS.glob("*.py")):
        doc = inventario_scripts_en(TOOLS, f.name)
        md.append(f"| `tools/{f.name}` | {doc} |")
    md.append("")

    md.append("## Cruces automaticos\n")
    md.append(f"- Scripts sin skill que los cite: **{len(c['scripts_huerfanos'])}** "
              f"({', '.join(c['scripts_huerfanos'][:12])}{'…' if len(c['scripts_huerfanos']) > 12 else ''})")
    md.append(f"- Skills sin ningun script: {', '.join(c['skills_sin_script']) or 'ninguna'}")
    md.append("- Boilerplate repetido por skill:")
    for seccion, n in sorted(c["boilerplate_por_seccion"].items(), key=lambda kv: -kv[1]):
        md.append(f"  - {seccion}: en {n} de {len(skills)} skills")
    md.append("")
    md.append(ANALISIS)

    SALIDA_MD.parent.mkdir(parents=True, exist_ok=True)
    SALIDA_MD.write_text("\n".join(md), encoding="utf-8")

    SALIDA_JSON.write_text(json.dumps(
        {"skills": skills, "tabs": tabs, "scripts": scripts,
         "entregables": [e[0] for e in ENTREGABLES],
         "modulos": [m[0] for m in MODULOS_DASH], "cruces": c},
        ensure_ascii=False, indent=2), encoding="utf-8")

    print(f"OK  skills={len(skills)} tabs={len(tabs)} scripts={len(scripts)}")
    print(f"    huerfanos={len(c['scripts_huerfanos'])} sin_script={len(c['skills_sin_script'])}")
    print(f"    -> {SALIDA_MD.relative_to(RAIZ)}")
    print(f"    -> {SALIDA_JSON.relative_to(RAIZ)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
