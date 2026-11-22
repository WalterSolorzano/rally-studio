# -*- coding: utf-8 -*-
"""El segundo clic en el mismo encargo no paga dos veces.

La duda era S-4 de la Fase 6: si el humano pulsa dos veces el mismo boton, se
crean dos trabajos y se cobra el encargo dos veces. El motor ya lo resuelve con
`AI_INFLIGHT` y la clave de cache, pero no habia ninguna prueba. Esto la mide
sin arrancar el servidor: `post_ai` solo usa `self` para leer el cuerpo y
responder, asi que se le puede pasar un objeto falso.
"""

from __future__ import annotations

import json
import sys
from pathlib import Path

import pytest

RAIZ = Path(__file__).resolve().parents[1]
for ruta in (str(RAIZ), str(RAIZ / "scripts")):
    if ruta not in sys.path:
        sys.path.insert(0, ruta)

import rally_service as rs  # noqa: E402

ENCARGO = (
    "Escribe el texto del problema para el pautado del piloto de agua en Somoto, "
    "Madriz: cuarenta familias acarrean agua novecientos metros, el pozo se seca "
    "tres meses al ano y la cooperativa ya administra el comite local."
)


class _Peticion:
    """Lo minimo que `post_ai` toca de un handler real."""

    def __init__(self, cuerpo: dict):
        self.headers = {}
        self.client_address = ("127.0.0.1", 0)
        self._cuerpo = json.dumps(cuerpo, ensure_ascii=False)
        self.respuestas: list[tuple[int, dict]] = []

    def leer_cuerpo(self) -> str:
        return self._cuerpo

    def cuerpo_objeto(self):
        """Mismo contrato que el handler real: 400 y None si no es un objeto."""
        try:
            data = json.loads(self._cuerpo or "null")
        except ValueError:
            self.send_json_response(400, {"ok": False, "status": "error", "message": "cuerpo-json-invalido"})
            return None
        if not isinstance(data, dict):
            self.send_json_response(400, {"ok": False, "status": "error", "message": "se-esperaba-un-objeto"})
            return None
        return data

    def send_json_response(self, code, obj, cors=True, con_cookie=False) -> None:
        self.respuestas.append((int(code), obj))

    def rechazo_rate_limit(self, extra: dict, mensaje: str) -> None:
        self.respuestas.append((429, {"status": "rate-limit", "message": mensaje}))


def _limpiar(rs) -> None:
    rs.AI_JOBS.clear()
    rs.AI_INFLIGHT.clear()
    rs.AI_CACHE.clear()
    rs.AI_BURST.clear()
    rs.AI_SPEND["day"] = ""
    rs.AI_SPEND["count"] = 0


@pytest.fixture
def motor(monkeypatch):
    """Motor sin red: sin proveedor real, sin hilo y con el gasto contado."""
    _limpiar(rs)
    gasto = {"veces": 0}
    real = rs._ai_spend_check

    def _contar(*args, **kwargs):
        gasto["veces"] += 1
        return True, ""

    monkeypatch.setattr(rs, "ai_rate_check", lambda handler: (True, {}, ""))
    monkeypatch.setattr(rs, "ai_provider_summary", lambda: {"status": "ok", "model": "m"})
    monkeypatch.setattr(rs, "_ai_job_worker", lambda *a, **k: None)
    monkeypatch.setattr(rs, "_ai_spend_check", _contar)
    monkeypatch.setattr(rs, "AI_USER_RATE_LIMIT", 0)
    yield gasto
    monkeypatch.setattr(rs, "_ai_spend_check", real)
    _limpiar(rs)


def _pedir(cuerpo: dict) -> _Peticion:
    peticion = _Peticion(cuerpo)
    rs.RallyApiHandler.post_ai(peticion, "/api/ai")
    return peticion


def test_el_segundo_clic_reusa_el_mismo_trabajo(motor):
    primero = _pedir({"prompt": ENCARGO, "model": ""})
    codigo, datos = primero.respuestas[-1]
    assert codigo == 200
    assert datos["status"] == "started"
    assert "dedup" not in datos
    trabajo = datos["job"]

    segundo = _pedir({"prompt": ENCARGO, "model": ""})
    codigo, datos = segundo.respuestas[-1]
    assert codigo == 200
    assert datos["dedup"] is True
    assert datos["job"] == trabajo
    assert datos["status"] == "started"


def test_el_segundo_clic_no_crea_otro_trabajo_ni_cobra(motor):
    _pedir({"prompt": ENCARGO, "model": ""})
    assert len(rs.AI_JOBS) == 1
    antes = motor["veces"]

    _pedir({"prompt": ENCARGO, "model": ""})
    assert len(rs.AI_JOBS) == 1
    assert motor["veces"] == antes, "el dedupe no debe volver a pasar por el control de gasto"
    assert antes == 1


def test_un_encargo_distinto_si_crea_su_propio_trabajo(motor):
    _pedir({"prompt": ENCARGO, "model": ""})
    otro = _pedir({"prompt": ENCARGO + " Ademas, menciona el mantenimiento de la bomba.", "model": ""})
    codigo, datos = otro.respuestas[-1]
    assert codigo == 200
    assert "dedup" not in datos
    assert len(rs.AI_JOBS) == 2
    assert motor["veces"] == 2


def test_un_encargo_que_ya_termino_se_vuelve_a_pedir(motor):
    """Si el trabajo anterior ya acabo, el mismo prompt no es un doble clic."""
    primero = _pedir({"prompt": ENCARGO, "model": ""})
    trabajo = primero.respuestas[-1][1]["job"]
    rs.AI_JOBS[trabajo]["status"] = "done"

    segundo = _pedir({"prompt": ENCARGO, "model": ""})
    codigo, datos = segundo.respuestas[-1]
    assert codigo == 200
    assert "dedup" not in datos
    assert len(rs.AI_JOBS) == 2
