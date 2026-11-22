# -*- coding: utf-8 -*-
"""Modulo IA del servicio: lista de modelos, cache, dedupe y topes de gasto.

Estas pruebas tocan las funciones puras del motor sin arrancar el servidor. Lo
que se mide es lo que decide si un encargo gasta dinero: que modelo pasa, que
no se pague dos veces el mismo encargo, y donde estan los topes.
"""

import inspect
import sys
from pathlib import Path

import pytest

RAIZ = Path(__file__).resolve().parent.parent


@pytest.fixture(scope="module")
def rs():
    sys.path.insert(0, str(RAIZ / "scripts"))
    import rally_service  # noqa: E402

    return rally_service


def _reset_spend(rs):
    rs.AI_SPEND["day"] = ""
    rs.AI_SPEND["count"] = 0
    rs.AI_BURST["ts"] = 0.0
    rs.AI_BURST["count"] = 0


# --- lista de modelos ----------------------------------------------------


def test_sin_modelo_se_usa_el_defecto_y_pasa(rs):
    assert rs._model_allowed("")
    assert rs._model_allowed(None)


def test_el_modelo_barato_del_equipo_pasa(rs):
    assert rs._model_allowed("opencode-go/deepseek-v4.1-flash")


@pytest.mark.parametrize(
    "modelo",
    [
        "anthropic/claude-3-opus",
        "opencode-go/claude-sonnet",
        "kimi-k3",
        "opencode-go/deepseek-v4.1-pro",
        "google/gemini-2.5",
        "openai/gpt-6-max",
    ],
)
def test_los_modelos_caros_se_rechazan(rs, modelo):
    assert rs._model_allowed(modelo) is False


def test_lo_gratis_pasa_aunque_no_este_en_la_lista_blanca(rs):
    assert rs._model_allowed("opencode-go/algo-free")


def test_un_proveedor_ajeno_se_rechaza_aunque_el_precio_sea_bajo(rs):
    assert rs._model_allowed("otro-proveedor/modelo-barato") is False


def test_la_lista_negra_gana_sobre_la_blanca(rs, monkeypatch):
    """Aunque alguien agregue un modelo caro a la lista blanca, no pasa."""
    monkeypatch.setattr(rs, "AI_MODEL_ALLOW", tuple(rs.AI_MODEL_ALLOW) + ("opencode-go/opus-nuevo",))
    assert rs._model_allowed("opencode-go/opus-nuevo") is False


# --- cache: el mismo encargo no se paga dos veces ------------------------


def test_la_clave_de_cache_es_estable_y_distingue_encargo(rs):
    assert rs._ai_cache_key("hola", "m") == rs._ai_cache_key("hola", "m")
    assert rs._ai_cache_key("hola", "m") != rs._ai_cache_key("hola", "otro")
    assert rs._ai_cache_key("hola", "m") != rs._ai_cache_key("adios", "m")


def test_lo_guardado_se_devuelve_y_lo_vencido_no(rs, monkeypatch):
    monkeypatch.setattr(rs, "AI_CACHE", {})
    clave = rs._ai_cache_key("encargo", "m")
    rs._ai_cache_put(clave, "respuesta guardada")
    assert rs._ai_cache_get(clave) == "respuesta guardada"
    monkeypatch.setattr(rs, "AI_CACHE_TTL", -1)
    assert rs._ai_cache_get(clave) is None


def test_no_se_guarda_una_respuesta_vacia(rs, monkeypatch):
    monkeypatch.setattr(rs, "AI_CACHE", {})
    clave = rs._ai_cache_key("encargo", "m")
    rs._ai_cache_put(clave, "   ")
    assert rs._ai_cache_get(clave) is None


def test_un_encargo_ya_respondido_no_lanza_proceso(rs, monkeypatch):
    monkeypatch.setattr(rs, "AI_JOBS", {})
    arranque = rs._ai_cached_job("texto ya listo", "m")
    assert arranque["status"] == "started"
    job = rs.AI_JOBS[arranque["job"]]
    assert job["status"] == "done"
    assert job["text"] == "texto ya listo"
    assert "Sin gasto nuevo" in job["message"]


# --- dedupe: dos encargos iguales comparten un proceso -------------------


def test_el_mismo_encargo_en_vuelo_se_comparte(rs, monkeypatch):
    """La clave de cache es la misma y el job en vuelo se reutiliza."""
    monkeypatch.setattr(rs, "AI_INFLIGHT", {})
    monkeypatch.setattr(rs, "AI_JOBS", {})
    clave = rs._ai_cache_key("encargo repetido", "m")
    rs.AI_JOBS["job1"] = {"status": "running"}
    rs.AI_INFLIGHT[clave] = "job1"
    en_vuelo = rs.AI_INFLIGHT.get(clave)
    assert en_vuelo == "job1"
    assert rs.AI_JOBS.get(en_vuelo, {}).get("status") in ("queued", "running")


# --- topes de gasto ------------------------------------------------------


def test_el_tope_diario_rechaza_el_encargo_de_mas(rs, monkeypatch, tmp_path):
    monkeypatch.setattr(rs, "AI_USAGE_FILE", tmp_path / "ai_usage.json")
    monkeypatch.setattr(rs, "AI_DAILY_MAX", 2)
    monkeypatch.setattr(rs, "AI_BURST_MAX", 0)
    _reset_spend(rs)
    assert rs._ai_spend_check() == (True, "")
    assert rs._ai_spend_check() == (True, "")
    ok, aviso = rs._ai_spend_check()
    assert ok is False
    assert "Tope diario" in aviso


def test_el_tope_por_minuto_corta_la_rafaga(rs, monkeypatch, tmp_path):
    monkeypatch.setattr(rs, "AI_USAGE_FILE", tmp_path / "ai_usage.json")
    monkeypatch.setattr(rs, "AI_DAILY_MAX", 0)
    monkeypatch.setattr(rs, "AI_BURST_MAX", 1)
    _reset_spend(rs)
    assert rs._ai_spend_check()[0] is True
    ok, aviso = rs._ai_spend_check()
    assert ok is False
    assert "Demasiados encargos" in aviso


def test_el_tope_diario_en_cero_no_bloquea(rs, monkeypatch, tmp_path):
    monkeypatch.setattr(rs, "AI_USAGE_FILE", tmp_path / "ai_usage.json")
    monkeypatch.setattr(rs, "AI_DAILY_MAX", 0)
    monkeypatch.setattr(rs, "AI_BURST_MAX", 0)
    _reset_spend(rs)
    for _ in range(5):
        assert rs._ai_spend_check()[0] is True


def test_el_gasto_queda_anotado_en_el_archivo_del_dia(rs, monkeypatch, tmp_path):
    destino = tmp_path / "ai_usage.json"
    monkeypatch.setattr(rs, "AI_USAGE_FILE", destino)
    monkeypatch.setattr(rs, "AI_DAILY_MAX", 0)
    monkeypatch.setattr(rs, "AI_BURST_MAX", 0)
    _reset_spend(rs)
    rs._ai_spend_check()
    rs._ai_spend_check()
    guardado = rs.json.loads(destino.read_text(encoding="utf-8"))
    assert guardado["count"] == 2
    assert guardado["day"]


def test_el_archivo_del_dia_se_escribe_de_forma_atomica(rs, monkeypatch, tmp_path):
    """H-25: un corte a mitad deja el archivo anterior, no uno truncado."""
    destino = tmp_path / "ai_usage.json"
    monkeypatch.setattr(rs, "AI_USAGE_FILE", destino)
    monkeypatch.setattr(rs, "AI_DAILY_MAX", 0)
    monkeypatch.setattr(rs, "AI_BURST_MAX", 0)
    _reset_spend(rs)
    rs._ai_spend_check()
    assert not (tmp_path / "ai_usage.json.tmp").exists()
    assert rs.json.loads(destino.read_text(encoding="utf-8"))["count"] == 1


def test_la_escritura_del_gasto_ocurre_dentro_del_candado(rs):
    """H-25: dos encargos simultaneos no pueden leer y escribir el mismo archivo fuera del lock."""
    fuente = inspect.getsource(rs._ai_spend_check)
    dentro = fuente.index("_ai_spend_save()")
    candado = fuente.index("with AI_RATE_LOCK:")
    assert candado < dentro
    bloque = fuente[candado:fuente.rindex("return True")]
    assert any(line.startswith("        _ai_spend_save()") for line in bloque.splitlines())


def test_un_archivo_truncado_avisa_y_no_reinicia_en_silencio(rs, monkeypatch, tmp_path, capsys):
    """H-25: la corrupcion se anuncia; antes el cupo diario volvia a cero sin decir nada."""
    destino = tmp_path / "ai_usage.json"
    destino.write_text('{"day": "2026-11-20", "cou', encoding="utf-8")
    monkeypatch.setattr(rs, "AI_USAGE_FILE", destino)
    _reset_spend(rs)
    rs._ai_spend_load()
    assert "ai_usage.json ilegible" in capsys.readouterr().err
    assert rs.AI_SPEND["count"] == 0


def test_sin_archivo_no_hay_aviso_de_corrupcion(rs, monkeypatch, tmp_path, capsys):
    monkeypatch.setattr(rs, "AI_USAGE_FILE", tmp_path / "no_existe.json")
    _reset_spend(rs)
    rs._ai_spend_load()
    assert capsys.readouterr().err == ""


# --- tiempo maximo por trabajo -------------------------------------------


def test_el_techo_de_tiempo_es_un_entero_positivo(rs):
    assert isinstance(rs.AI_JOB_TIMEOUT, int)
    assert rs.AI_JOB_TIMEOUT > 0


def test_el_techo_de_tiempo_nunca_baja_de_treinta_segundos(rs):
    """Un valor chico no debe dejar al agente sin tiempo: el worker pone piso 30."""
    fuente = (RAIZ / "scripts" / "rally_service.py").read_text(encoding="utf-8")
    assert "max(30, AI_JOB_TIMEOUT)" in fuente
