import json
from pathlib import Path

import pytest

NUCLEO = [
    "contexto-rally",
    "guiar-usuario",
    "servir-a-ventana",
    "ingestar-investigacion",
    "auditar-entregable",
]

PRODUCCION = [
    "proponer-retos",
    "sugerir-por-fase",
    "propuesta-identidad",
    "dossier-soluciones",
    "presupuesto",
    "modelo-3d-blender",
    "publicar-sitio",
]

TODAS = NUCLEO + PRODUCCION


@pytest.mark.parametrize("nombre", TODAS)
def test_skill_has_valid_frontmatter(nombre):
    texto = Path(f"skills/{nombre}/SKILL.md").read_text(encoding="utf-8")
    assert texto.startswith("---")
    cabecera = texto.split("---")[1]
    assert "name:" in cabecera and "description:" in cabecera


@pytest.mark.parametrize("nombre", TODAS)
def test_skill_is_short(nombre):
    assert len(Path(f"skills/{nombre}/SKILL.md").read_bytes()) <= 8_000


# --- Ganadores: no volver a confundir certámenes -------------------------

CORPUS = Path("brain/corpus")


def test_ganadores_separados_por_instancia_y_sin_nombre_ambiguo():
    # El archivo se llamaba ganadores_nacional.md y el modelo confundía la ronda
    # nacional del Latinoamericano con el Rally Nacional Nicaragua Innova.
    assert not (CORPUS / "ganadores_nacional.md").exists()
    inter = (CORPUS / "ganadores_latam_internacional.md").read_text(encoding="utf-8")
    nac = (CORPUS / "ganadores_latam_instancia_nacional.md").read_text(encoding="utf-8")
    assert inter.startswith("# Ganadores del Rally Latinoamericano")
    assert nac.startswith("# Ganadores de la instancia nacional del Rally Latinoamericano")
    assert "> Que es:" in inter and "> Que es:" in nac
    assert "Nicaragua Innova" in nac


def test_nacional_partido_por_anio_con_indice_completo():
    # Un archivo de 105 KB mezclaba las 10 ediciones: una consulta de 2023
    # devolvía filas de 2017. Ahora el índice enlaza un archivo por año.
    indice = (CORPUS / "ganadores_latam_instancia_nacional.md").read_text(encoding="utf-8")
    anios = sorted(CORPUS.glob("ganadores_latam_instancia_nacional_*.md"))
    assert [p.name for p in anios] == [
        f"ganadores_latam_instancia_nacional_{a}.md" for a in range(2017, 2027)
    ]
    for ruta in anios:
        texto = ruta.read_text(encoding="utf-8")
        assert texto.startswith("# Ganadores de la instancia nacional")
        assert "Nicaragua Innova" in texto
        assert f"`{ruta.name}`" in indice


def test_glosario_de_instancias_existe_y_nombra_los_tres():
    texto = (CORPUS / "glosario_instancias.md").read_text(encoding="utf-8")
    assert "instancia internacional" in texto
    assert "instancia nacional por país" in texto
    assert "Rally Nacional Nicaragua Innova" in texto
    # El banco de casos avisa de que `rally: nacional` no implica Nicaragua Innova.
    casos = (CORPUS / "casos_ganadores.md").read_text(encoding="utf-8")
    assert "NO automaticamente el Rally Nacional" in casos


def test_regla_modos_rally_avisa_del_choque_de_nombres():
    regla = Path(".agents/rules/modos-rally.md").read_text(encoding="utf-8")
    assert "Ganadores: tres cosas distintas" in regla
    assert "ganadores_latam_internacional.md" in regla
    assert "ganadores_latam_instancia_nacional.md" in regla


# --- GitHub Pages: la puerta no depende del servidor ---------------------


def test_login_funciona_sin_servidor_estatico():
    js = Path("dashboard/login.js").read_text(encoding="utf-8")
    assert "github\\.io$" in js
    assert "LLAVE_ESTATICA_SHA256" in js
    # La rama estática devuelve antes de llamar a /api/acceso/estado.
    assert js.index("if (ESTATICO) {") < js.index('fetch("/api/acceso/estado"')


def test_cliente_de_ia_no_apunta_a_localhost_fijo():
    js = Path("dashboard/super_agents.js").read_text(encoding="utf-8")
    assert '"http://localhost:8000/api/ai"' not in js
    assert "location.origin" in js


# --- La rubrica entra al cerebro como texto, no como imagen -------------


def test_rubrica_no_se_copia_como_imagen():
    # Pasar de imagen a texto falla: el cerebro necesita la transcripcion.
    assert not (CORPUS / "rubrica_oficial.jpeg").exists()
    sync = Path("brain/sync_corpus.py").read_text(encoding="utf-8")
    assert "rubrica_oficial_latam.jpeg" not in sync


def test_la_portada_del_cerebro_sale_de_los_datos():
    # La imagen del README no lleva cifras escritas a mano: se dibuja desde el grafo
    # y desde winners.jsonl, o se queda vieja como la de 420 nodos.
    png = Path("assets/readme/cerebro.png")
    assert png.exists() and png.stat().st_size > 50_000
    fuente = Path("scripts/gen_readme_cerebro.py").read_text(encoding="utf-8")
    assert "graph.json" in fuente and "winners.jsonl" in fuente
    for cifra in ("642", "650", "129", "4.715", "4715", "36 documentos"):
        assert cifra not in fuente


def test_la_rubrica_transcrita_conserva_los_pesos():
    texto = Path("knowledge/rubric_matrices.md").read_text(encoding="utf-8")
    for peso in ("30 puntos", "20 puntos", "10 puntos"):
        assert peso in texto
    assert "19 ítems" in texto or "19 items" in texto


# --- El corpus se enlaza entre documentos, no queda en arboles sueltos ---


def test_cada_documento_del_corpus_cierra_con_relacionado():
    # Sin encabezado `## Relacionado` el grafo devuelve 36 componentes: cada
    # documento es un arbol y ninguno menciona a los demas.
    corpus = Path("brain/corpus")
    for md in corpus.glob("*.md"):
        texto = md.read_text(encoding="utf-8")
        assert "<!-- relacionado:inicio -->" in texto, md.name
        assert texto.count("<!-- relacionado:inicio -->") == 1, md.name


def test_el_chat_del_proyecto_esta_conectado():
    # Un chat que no se carga o que no lee el estado es un juguete: contesta
    # con el proyecto de otro. Debe leer /api/state, saber del corpus y usar el
    # cliente de IA que ya existe, no su propia copia del POST.
    chat = Path("dashboard/chat.js").read_text(encoding="utf-8")
    shell = Path("dashboard/index.html").read_text(encoding="utf-8")
    sw = Path("dashboard/sw.js").read_text(encoding="utf-8")
    assert '<script src="chat.js' in shell
    assert '"./chat.js"' in sw
    for pieza in ("/api/state", '"/api/ai', "/status", "RSA.analyze", "HUECOS DETECTADOS",
                  "resumenAgentes", "deepseek-v4.1-flash", "PRECIO", "TOPE_DIA_USD", "anotarUso",
                  "recursos.json", "inventarioPara(", "adjuntar(", "botonCopiar("):
        assert pieza in chat, pieza
    assert "fetch(AI_BASE, {" not in chat
    # El modelo no puede listar carpetas: las reglas fijas del servidor prohíben
    # herramientas y shell, así que el inventario se genera aparte y se le entrega.
    assert "PowerShell" not in chat and "Get-ChildItem" not in chat
    assert Path("scripts/gen_recursos.py").exists()
    inv = Path("assets/recursos.json")
    assert inv.exists() and inv.stat().st_size < 150_000
    datos = json.loads(inv.read_text(encoding="utf-8"))
    assert datos["archivos"] and {"p", "t", "kb"} <= set(datos["archivos"][0])


def test_el_indicador_de_agentes_cuenta_los_que_hay():
    # Con un booleano, el primero que terminaba apagaba el aviso de los otros dos,
    # y el chat se quedaba diciendo «1 agente trabajando» para siempre.
    app = Path("dashboard/app.js").read_text(encoding="utf-8")
    sup = Path("dashboard/super_agents.js").read_text(encoding="utf-8")
    chat = Path("dashboard/chat.js").read_text(encoding="utf-8")
    assert "rsAgentesActivos" in app and "rsAgentCuantos" in app
    assert "function rsAgentActivity(on, label, n)" in app
    assert '" en paralelo' in app or "en paralelo" in app
    assert "window.rsAgentActivity(agentBusy > 0" in sup
    assert "rsAgentesActivos()" in chat
    assert "1 agente trabajando" not in chat


def test_sync_corpus_declara_vecinos():
    sync = Path("brain/sync_corpus.py").read_text(encoding="utf-8")
    assert "RELACIONADO" in sync
    assert "aplicar_relacionado()" in sync
    assert "## Relacionado" in sync


def test_el_grafo_del_cerebro_tiene_relaciones_entre_archivos():
    import json

    g = Path("brain/corpus/graphify-out/graph.json")
    if not g.is_file():
        pytest.skip("grafo no construido")
    datos = json.loads(g.read_text(encoding="utf-8"))
    byid = {n["id"]: n for n in datos["nodes"]}
    cross = [
        l
        for l in datos["links"]
        if byid[l["source"]].get("source_file") != byid[l["target"]].get("source_file")
    ]
    assert len(cross) > 0
    assert all(l["relation"] == "references" for l in cross)
