"""Importar un proyecto JSON no puede reemplazar el estado a ciegas (Fase 6, S-3).

Antes: `state = Object.assign(getInitialState(), imported)` (dashboard/app.js).
Un campo desconocido entraba tal cual, un tipo equivocado rompia la pantalla y el
estado anterior se perdia sin respaldo. Estas pruebas corren el bloque real de
app.js en Node con un localStorage simulado.
"""

import shutil
from functools import partial
from pathlib import Path

import pytest

from tests.support import correr_node

NODE = shutil.which("node")
PROBE = Path(__file__).parent / "js" / "import_probe.js"

pytestmark = pytest.mark.skipif(NODE is None, reason="node no disponible para probar la importacion")

correr = partial(correr_node, NODE, PROBE)


def test_un_proyecto_valido_pasa_entero():
    datos = correr("validar", {"team_name": "Ñandú", "hours_total": 24})
    resultado = datos["resultado"]
    assert resultado["tiposMalos"] == []
    assert resultado["desconocidas"] == []
    assert resultado["limpio"] == {"team_name": "Ñandú", "hours_total": 24}


def test_un_campo_desconocido_se_ignora_y_se_avisa():
    datos = correr("validar", {"team_name": "Ñandú", "campo_inventado": 1})
    resultado = datos["resultado"]
    assert resultado["desconocidas"] == ["campo_inventado"]
    assert "campo_inventado" not in resultado["limpio"]


@pytest.mark.parametrize(
    "cuerpo",
    [
        {"hours_total": "veintiocho"},
        {"challenges": {"no": "es lista"}},
        {"team_name": 42},
    ],
)
def test_un_tipo_equivocado_no_entra(cuerpo):
    datos = correr("validar", cuerpo)
    assert len(datos["resultado"]["tiposMalos"]) == 1
    assert datos["resultado"]["limpio"] == {}


def test_null_se_acepta_como_valor_explicito():
    datos = correr("validar", {"rally_type": None})
    assert datos["resultado"]["tiposMalos"] == []
    assert datos["resultado"]["limpio"] == {"rally_type": None}


@pytest.mark.parametrize("cuerpo", [[], "texto", 7, None])
def test_un_json_que_no_es_objeto_se_rechaza(cuerpo):
    datos = correr("validar", cuerpo)
    assert "no contiene un objeto de proyecto" in datos["error"]


def test_aplicar_respalda_el_estado_anterior_y_sincroniza():
    datos = correr("aplicar", {"team_name": "Equipo nuevo", "hours_total": 24})
    assert datos["estado"]["team_name"] == "Equipo nuevo"
    assert datos["estado"]["team_logo"] == "shield"
    assert datos["respaldo"]["motivo"] == "import"
    assert datos["respaldo"]["estado"]["team_name"] == "Equipo viejo"
    assert datos["respaldo"]["fecha"]
    tipos = [c["kind"] for c in datos["llamadas"]]
    assert tipos == ["save", "sync"]


def test_aplicar_con_tipo_malo_no_toca_el_estado():
    datos = correr("aplicar", {"hours_total": "veintiocho"})
    assert "Tipos inválidos en: hours_total" in datos["error"]
    assert datos.get("estado") is None  # la sonda no devuelve estado cuando lanza


def test_app_js_ya_no_reemplaza_el_estado_a_ciegas():
    fuente = (Path(__file__).resolve().parents[1] / "dashboard" / "app.js").read_text(encoding="utf-8")
    assert "state = Object.assign(getInitialState(), imported);" not in fuente
    assert "aplicarProyectoImportado(imported" in fuente
    assert "rally_state_backup" in fuente
