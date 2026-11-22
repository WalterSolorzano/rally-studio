# -*- coding: utf-8 -*-
"""Pruebas del almacen de secciones versionadas y de su respaldo (S-1).

La regla que se mide: escribir una seccion no borra la version anterior.
Antes de este arreglo, `write_section` hacia INSERT ... ON CONFLICT DO UPDATE
sobre la misma fila y el contenido viejo desaparecia; `events` guardaba que
hubo escritura pero no el dato.
"""

from __future__ import annotations

import pytest

from scripts.section_store import (
    SectionConflict,
    SectionLocked,
    SQLiteSectionStore,
    validar_version,
)

PROY = "proyecto-uno"
ACTOR = "guionista"
AID = "u-1"


@pytest.fixture()
def store(tmp_path):
    return SQLiteSectionStore(tmp_path / "sections.db")


def _escribir(store, key, data, base_version, actor_id=AID, actor=ACTOR):
    return store.write_section(PROY, key, data, base_version, actor, actor_id)


def test_primera_escritura_exige_candado(store):
    """Sin candado propio una seccion normal no se escribe."""
    with pytest.raises(SectionLocked):
        _escribir(store, "pautado.problema", {"texto": "a"}, 0)


def test_escribir_con_candado_sube_la_version(store):
    store.lock(PROY, "pautado.problema", ACTOR, AID)
    fila = _escribir(store, "pautado.problema", {"texto": "a"}, 0)
    assert fila["version"] == 1
    assert fila["data"] == {"texto": "a"}


def test_base_version_vieja_es_conflicto_409(store):
    store.lock(PROY, "pautado.problema", ACTOR, AID)
    _escribir(store, "pautado.problema", {"texto": "a"}, 0)
    with pytest.raises(SectionConflict) as exc:
        _escribir(store, "pautado.problema", {"texto": "b"}, 0)
    assert exc.value.current["version"] == 1


def test_candado_ajeno_bloquea(store):
    store.lock(PROY, "pautado.problema", ACTOR, AID)
    with pytest.raises(SectionLocked):
        store.lock(PROY, "pautado.problema", "otro", "u-2")


def test_unlock_libera_para_otro(store):
    store.lock(PROY, "pautado.problema", ACTOR, AID)
    store.unlock(PROY, "pautado.problema", AID)
    store.lock(PROY, "pautado.problema", "otro", "u-2")
    assert store.lock_held_by(PROY, "pautado.problema", "u-2") is True


def test_la_primera_escritura_no_deja_historial(store):
    store.lock(PROY, "pautado.problema", ACTOR, AID)
    _escribir(store, "pautado.problema", {"texto": "a"}, 0)
    assert store.historial(PROY, "pautado.problema") == []


def test_el_candado_solo_no_ensucia_el_historial(store):
    """`lock` inserta la fila con data null; eso no es contenido que respaldar."""
    store.lock(PROY, "pautado.problema", ACTOR, AID)
    _escribir(store, "pautado.problema", {"texto": "a"}, 0)
    assert store.historial(PROY, "pautado.problema") == []


def test_el_historial_guarda_la_version_anterior(store):
    store.lock(PROY, "pautado.problema", ACTOR, AID)
    _escribir(store, "pautado.problema", {"texto": "a"}, 0)
    _escribir(store, "pautado.problema", {"texto": "b"}, 1)
    historial = store.historial(PROY, "pautado.problema")
    assert len(historial) == 1
    assert historial[0]["version"] == 1
    assert historial[0]["data"] == {"texto": "a"}


def test_el_historial_viene_de_la_mas_reciente_a_la_mas_vieja(store):
    store.lock(PROY, "pautado.problema", ACTOR, AID)
    for i, texto in enumerate(("a", "b", "c")):
        _escribir(store, "pautado.problema", {"texto": texto}, i)
    historial = store.historial(PROY, "pautado.problema")
    assert [h["version"] for h in historial] == [2, 1]
    assert [h["data"]["texto"] for h in historial] == ["b", "a"]


def test_el_respaldo_no_pierde_ni_un_caracter(store):
    original = {"texto": "Agua acarreada 900 m — Somoto, Madriz", "cifras": [24300, 12150],
                "anidado": {"a": [1, 2, {"b": None}]}}
    store.lock(PROY, "pautado.problema", ACTOR, AID)
    _escribir(store, "pautado.problema", original, 0)
    _escribir(store, "pautado.problema", {"texto": "nuevo"}, 1)
    assert store.historial(PROY, "pautado.problema")[0]["data"] == original


def test_el_historial_respeta_el_limite(store):
    store.lock(PROY, "pautado.problema", ACTOR, AID)
    for i in range(4):
        _escribir(store, "pautado.problema", {"n": i}, i)
    assert len(store.historial(PROY, "pautado.problema", limit=2)) == 2
    assert len(store.historial(PROY, "pautado.problema", limit=0)) == 1


def test_el_historial_es_por_seccion(store):
    store.lock(PROY, "pautado.problema", ACTOR, AID)
    _escribir(store, "pautado.problema", {"texto": "a"}, 0)
    _escribir(store, "pautado.problema", {"texto": "b"}, 1)
    assert store.historial(PROY, "script.acto1") == []


def test_import_state_no_sobrescribe_y_no_respalda(store):
    store.lock(PROY, "pautado.problema", ACTOR, AID)
    _escribir(store, "pautado.problema", {"texto": "a"}, 0)
    resultado = store.import_state(PROY, {"pautado": {"problema": {"texto": "importado"},
                                                      "solucion": {"texto": "nueva"}}},
                                   "migracion", "u-0")
    assert "pautado.problema" in resultado["skipped"]
    assert "pautado.solucion" in resultado["imported"]
    assert store.read_state(PROY)["pautado"]["problema"] == {"texto": "a"}
    assert store.historial(PROY, "pautado.problema") == []


def test_read_state_oculta_claves_locales_y_vacios(store):
    store.write_section(PROY, "active_tab", "challenges", 0, ACTOR, AID)
    store.lock(PROY, "pautado.problema", ACTOR, AID)
    estado = store.read_state(PROY)
    assert "_sync" not in estado
    assert "pautado" not in estado


def test_write_deja_evento(store):
    store.lock(PROY, "pautado.problema", ACTOR, AID)
    _escribir(store, "pautado.problema", {"texto": "a"}, 0)
    acciones = [e["action"] for e in store.events(PROY)]
    assert "write" in acciones
    assert "lock" in acciones


def test_reapertura_conserva_el_historial(tmp_path):
    ruta = tmp_path / "sections.db"
    store = SQLiteSectionStore(ruta)
    store.lock(PROY, "pautado.problema", ACTOR, AID)
    _escribir(store, "pautado.problema", {"texto": "a"}, 0)
    _escribir(store, "pautado.problema", {"texto": "b"}, 1)
    otra = SQLiteSectionStore(ruta)
    assert otra.historial(PROY, "pautado.problema")[0]["data"] == {"texto": "a"}


def test_validar_version_acepta_entero_y_texto_numerico():
    assert validar_version(0) == 0
    assert validar_version("3") == 3


@pytest.mark.parametrize("valor", [None, "", "abc", {}, []])
def test_base_version_ilegible_es_400_no_error_interno(store, valor):
    store.lock(PROY, "pautado.problema", ACTOR, AID)
    with pytest.raises(ValueError, match="base-version-invalida"):
        _escribir(store, "pautado.problema", {"texto": "a"}, valor)
