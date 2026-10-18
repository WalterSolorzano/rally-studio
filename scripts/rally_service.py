#!/usr/bin/env python3
"""
rally_service.py -- Backend HTTP ligero y autónomo para Rally Studio & Workbench.
Provee:
1. /api/telemetry : Métricas en tiempo real de CPU, RAM, latencia, tiempo de actividad y estado.
2. /api/scan-sources : Ingesta de archivos fuente (PDF, DOCX, TXT, MD, enlaces, patentes) en rallysistem y knowledge/.
3. /api/compile-docx : Compilación de secciones directamente en la plantilla Word (.docx) oficial del Rally.
4. Servidor de estáticos para dashboard/ y site/.
"""

import http.server
import socketserver
import json
import os
import sys
import time
import pathlib
import io
import re
import urllib.parse
import psutil
import docx

PORT = 8000
BASE_DIR = pathlib.Path(__file__).resolve().parent.parent
DASHBOARD_DIR = BASE_DIR / "dashboard"
SITE_DIR = BASE_DIR / "site"
SOURCES_DIR = BASE_DIR.parent / "rallysistem"

START_TIME = time.time()

# Matrices Oficiales de Rúbrica: Nacional (Nicaragua Innova) y LATAM (100 Puntos)
RALLY_RUBRICS = {
    "latam": {
        "title": "Rúbrica Internacional Oficial (Rally LATAM - 28H)",
        "total_points": 100,
        "criteria": {
            "innovacion": {
                "title": "Grado de innovación de la solución propuesta",
                "weight": 30,
                "items": [
                    "La solución es innovadora (arquitectura no trivial y disrupción frente al estado del arte)",
                    "El equipo mostró capacidad creativa y diferenciación radical (Efecto Wow)",
                    "El equipo utiliza tecnologías apropiadas para el desafío",
                    "Grado de usabilidad y ergonomía de la solución propuesta"
                ]
            },
            "impacto": {
                "title": "Impacto positivo de la propuesta en la sociedad",
                "weight": 20,
                "items": [
                    "La propuesta da solución a una problemática específica regional",
                    "La propuesta tiene un valor social por encima de su valor de mercado",
                    "La propuesta mejora la calidad de vida de los ciudadanos a escala"
                ]
            },
            "prefactibilidad": {
                "title": "Prefactibilidad económica y social y sustentabilidad ambiental",
                "weight": 20,
                "items": [
                    "La propuesta es sustentable desde el punto de vista económico ($4,000 - $6,000 USD lote piloto sin subsidio permanente)",
                    "La propuesta contempla la eficiencia energética y apela a fuentes renovables",
                    "La propuesta optimiza el uso de recursos y principios de economía circular",
                    "La propuesta presenta alternativas de mejora a una problemática ambiental específica"
                ]
            },
            "viabilidad": {
                "title": "Viabilidad técnica de la propuesta",
                "weight": 20,
                "items": [
                    "Base teórica sólida y documentada con citas técnicas / patentes internacionales",
                    "El concepto utiliza recursos y componentes de fácil obtención regional",
                    "La propuesta es acorde a las necesidades de los potenciales usuarios",
                    "La solución está técnicamente validada (sin suposiciones energéticas o térmicas inviables)"
                ]
            },
            "presentacion": {
                "title": "Calidad de la presentación (Pitch 120s & Pautado SIRLI)",
                "weight": 10,
                "items": [
                    "La presentación demuestra capacidad de síntesis (conteo estricto de caracteres con espacios)",
                    "La presentación transmite con claridad la solución propuesta en 120s exactos",
                    "La propuesta de valor es clara y se ajusta rigurosamente al desafío",
                    "Las ilustraciones / diagramas / CAD 3D son claros y pertinentes"
                ]
            }
        }
    },
    "nacional": {
        "title": "Rúbrica Oficial Jurado Nacional (Nicaragua Innova - 24H)",
        "total_points": 100,
        "criteria": {
            "innovacion_nac": {
                "title": "Grado de Innovación, Creatividad y Hibridación Tecnológica",
                "weight": 25,
                "items": [
                    "Originalidad y diferenciación frente a soluciones convencionales en el entorno local",
                    "Hibridación tecnológica accesible (IoT ESP32/LoRa, gemelos digitales, IA, bio-materiales locales)",
                    "Capacidad creativa y prototipo conceptual/físico presentado",
                    "Adaptabilidad de la tecnología a la infraestructura y conectividad nacional"
                ]
            },
            "impacto_territorial": {
                "title": "Impacto Social, Territorial y Alineación con Políticas Públicas (PNDH)",
                "weight": 25,
                "items": [
                    "Alineación explícita con el Plan Nacional de Lucha contra la Pobreza y Desarrollo Humano 2022-2026",
                    "Articulación con programas nacionales (Ciudades Creativas, Soberanía Alimentaria, Ley 763)",
                    "Anclaje territorial específico (municipios reales, microparques, zonas vulnerables)",
                    "Cuantificación del impacto social (familias, cooperativas, empleos directos beneficiados)"
                ]
            },
            "viabilidad_local": {
                "title": "Viabilidad Técnica, Operativa y Uso de Recursos Locales",
                "weight": 20,
                "items": [
                    "Factibilidad de implementación en talleres locales, centros tecnológicos INATEC o laboratorios CNU",
                    "Aprovechamiento de materias primas o pasivos ambientales locales (residuos autóctonos)",
                    "Sustentación teórica y técnica del diseño con rigor metodológico",
                    "Claridad operativa y rol de los beneficiarios en el mantenimiento de la solución"
                ]
            },
            "prefactibilidad_canvas": {
                "title": "Prefactibilidad Económica, Sostenibilidad y Modelo Comunitario / Canvas",
                "weight": 15,
                "items": [
                    "Presupuesto de inversión aterrizado a la economía nacional (desglose unitario en C$ y USD)",
                    "Modelo de sostenibilidad financiera viable (cooperativas, alcaldías municipales, MEFCCA)",
                    "Eficiencia en la relación costo-beneficio para pequeños productores o entidades públicas",
                    "Plan de implementación por fases a 12 meses con indicadores de cumplimiento medibles"
                ]
            },
            "calidad_entregables": {
                "title": "Calidad del Documento Técnico (hasta 10 págs.), Video Pitch y Naming Dual",
                "weight": 15,
                "items": [
                    "Documento técnico estructurado con normas APA y fuentes oficiales (BCN, INIDE, ministerios)",
                    "Video pitch de 2 minutos claro, persuasivo, con dicción fluida y calidad audiovisual",
                    "Naming dual efectivo (nombre de squad cultural/patriótico + marca registrable de la solución)",
                    "Identidad cultural y comunicación empática con el jurado interinstitucional"
                ]
            }
        }
    }
}
RALLY_RUBRIC_SPEC = RALLY_RUBRICS["latam"]["criteria"]

class RallyApiHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(DASHBOARD_DIR), **kwargs)

    def do_GET(self):
        url = urllib.parse.urlparse(self.path)
        if url.path == "/api/telemetry":
            self.send_telemetry()
        elif url.path == "/api/scan-sources":
            self.send_sources()
        elif url.path == "/api/rubric":
            self.send_rubric()
        elif url.path.startswith("/site"):
            # Servir demo territorial
            rel = url.path.replace("/site", "").lstrip("/")
            target = SITE_DIR / (rel if rel else "index.html")
            if target.exists() and target.is_file():
                self.serve_custom_file(target)
            else:
                self.send_error(404, "Site file not found")
        else:
            super().do_GET()

    def do_POST(self):
        url = urllib.parse.urlparse(self.path)
        if url.path == "/api/compile-docx":
            length = int(self.headers.get("Content-Length", 0))
            body = self.rfile.read(length).decode("utf-8")
            try:
                data = json.loads(body)
                result = compile_pautado_docx(data)
                self.send_json_response(200, result)
            except Exception as e:
                self.send_json_response(500, {"status": "error", "message": str(e)})
        else:
            self.send_error(404, "Endpoint no encontrado")

    def send_telemetry(self):
        cpu = psutil.cpu_percent(interval=None)
        mem = psutil.virtual_memory()
        uptime_sec = int(time.time() - START_TIME)
        payload = {
            "status": "online",
            "cpu_percent": cpu,
            "ram_used_mb": round((mem.total - mem.available) / (1024 * 1024), 1),
            "ram_percent": mem.percent,
            "uptime_sec": uptime_sec,
            "timestamp": int(time.time() * 1000)
        }
        self.send_json_response(200, payload)

    def send_rubric(self):
        query = urllib.parse.parse_qs(urllib.parse.urlparse(self.path).query)
        rubric_type = query.get("type", ["latam"])[0].lower()
        if rubric_type in RALLY_RUBRICS:
            self.send_json_response(200, {
                "active_type": rubric_type,
                "rubric": RALLY_RUBRICS[rubric_type],
                "all_rubrics": RALLY_RUBRICS
            })
        else:
            self.send_json_response(200, {
                "active_type": "latam",
                "rubric": RALLY_RUBRICS["latam"],
                "all_rubrics": RALLY_RUBRICS
            })

    def send_sources(self):
        scan_results = []
        target_dirs = [SOURCES_DIR, BASE_DIR / "knowledge"]
        for d in target_dirs:
            if not d.exists():
                continue
            for item in d.iterdir():
                if item.is_file() and not item.name.startswith("."):
                    ext = item.suffix.lower()
                    cat = "document"
                    if ext in [".png", ".jpg", ".jpeg", ".svg", ".avif"]:
                        cat = "image"
                    elif ext in [".docx", ".doc"]:
                        cat = "pautado"
                    elif ext in [".pdf"]:
                        cat = "analysis"
                    elif ext in [".md", ".txt"]:
                        cat = "research"
                    
                    scan_results.append({
                        "name": item.name,
                        "size": item.stat().st_size,
                        "category": cat,
                        "ext": ext,
                        "path": str(item)
                    })
        self.send_json_response(200, {"sources": scan_results, "total": len(scan_results)})

    def serve_custom_file(self, target_path):
        mime = "text/html"
        if target_path.suffix == ".css":
            mime = "text/css"
        elif target_path.suffix == ".js":
            mime = "application/javascript"
        elif target_path.suffix == ".png":
            mime = "image/png"
        elif target_path.suffix in [".jpg", ".jpeg"]:
            mime = "image/jpeg"
        elif target_path.suffix == ".svg":
            mime = "image/svg+xml"

        content = target_path.read_bytes()
        self.send_response(200)
        self.send_header("Content-Type", mime)
        self.send_header("Content-Length", str(len(content)))
        self.end_headers()
        self.wfile.write(content)

    def send_json_response(self, code, obj):
        body = json.dumps(obj).encode("utf-8")
        self.send_response(code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        self.wfile.write(body)

def compile_pautado_docx(data):
    rally_type = data.get("rally_type", "latam")
    pautado = data.get("pautado", {})
    team = data.get("team_name", "EQUIPO").upper()
    sede = data.get("university", "SEDE").upper()
    challenge = data.get("challenge_title", "DESAFÍO").strip()
    proj = data.get("project_name", "PROYECTO").upper()

    template_path = BASE_DIR / "knowledge" / ("pautado_latam_ref.docx" if rally_type == "latam" else "pautado_nacional_ref.docx")
    out_path = DASHBOARD_DIR / "docs" / "pautado_draft.docx"
    out_path.parent.mkdir(exist_ok=True)

    if template_path.exists():
        doc = docx.Document(template_path)
    else:
        doc = docx.Document()

    # Reemplazo inteligente de campos
    for p in doc.paragraphs:
        txt = p.text
        if "EQUIPO:" in txt:
            p.text = f"EQUIPO: \t{team}"
        elif "SEDE:" in txt:
            p.text = f"SEDE: \t{sede}"
        elif "DESAFÍO SELECCIONADO:" in txt:
            p.text = f"DESAFÍO SELECCIONADO: \t{challenge}"

    # Inyección de párrafos de contenido en los slots correspondientes
    inserted = False
    for i, p in enumerate(doc.paragraphs):
        t = p.text.upper()
        if "DESCRIPCIÓN DE LA PROBLEMÁTICA" in t and pautado.get("problema"):
            if i + 2 < len(doc.paragraphs):
                doc.paragraphs[i+2].text = pautado["problema"]
                inserted = True
        elif "DESCRIPCIÓN DE LA SOLUCIÓN" in t and pautado.get("solucion"):
            if i + 2 < len(doc.paragraphs):
                doc.paragraphs[i+2].text = pautado["solucion"]
                inserted = True
        elif "IMPACTO" in t and "1000" in t and pautado.get("impacto"):
            if i + 2 < len(doc.paragraphs):
                doc.paragraphs[i+2].text = pautado["impacto"]
                inserted = True
        elif "INNOVACIÓN" in t and "1000" in t and pautado.get("innovacion"):
            if i + 2 < len(doc.paragraphs):
                doc.paragraphs[i+2].text = pautado["innovacion"]
                inserted = True
        elif "PRE FACTIBILIDAD" in t and pautado.get("prefactibilidad"):
            if i + 2 < len(doc.paragraphs):
                doc.paragraphs[i+2].text = pautado["prefactibilidad"]
                inserted = True

    if not inserted:
        # Fallback si no hubieron slots directos
        doc.add_heading(f"PROYECTO: {proj}", level=0)
        doc.add_paragraph(f"Equipo: {team} | Sede: {sede}\nDesafío: {challenge}")
        for k in ["problema", "solucion", "impacto", "innovacion", "prefactibilidad"]:
            if pautado.get(k):
                doc.add_heading(k.upper(), level=1)
                doc.add_paragraph(pautado[k])

    doc.save(out_path)
    return {
        "status": "ok",
        "file": "/docs/pautado_draft.docx",
        "size": out_path.stat().st_size,
        "timestamp": int(time.time())
    }

if __name__ == "__main__":
    server_address = ("", PORT)
    with socketserver.TCPServer(server_address, RallyApiHandler) as httpd:
        print(f"Rally Service activo en http://localhost:{PORT}")
        httpd.serve_forever()
