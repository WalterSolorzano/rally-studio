"""La pizarra no puede anunciar a un compañero «anonimo» que no existe.

Medido en `POST /api/presence`:

    cuerpo roto  -> 200 {"ok": true}   y GET /api/presence mostraba {"actor": "anonimo"}
    sin actor    -> 200 {"ok": true}   y GET /api/presence mostraba {"actor": "anonimo"}

`presence_beat()` convertía un actor vacío en «anonimo» y el handler respondía
siempre `{"ok": true}`, así que quien mandaba un cuerpo roto creía que su latido
se había registrado y el equipo veía a alguien que no está.
"""
from __future__ import annotations

import json
import urllib.error
import urllib.request

import pytest

from tests.support import auth, bootstrap, call, entrar

RUTA_PRESENCIA = "/api/presence"


def _galleta(token, project):
    return "Cookie", f"rally_sesion={token}; rally_proyecto={project}"


def _crudo(base, ruta, cuerpo, token=None, project="presencia01"):
    datos = cuerpo if isinstance(cuerpo, bytes) else json.dumps(cuerpo).encode("utf-8")
    req = urllib.request.Request(base + ruta, data=datos, method="POST")
    req.add_header("Content-Type", "application/json")
    if token:
        clave, valor = _galleta(token, project)
        req.add_header(clave, valor)
    try:
        with urllib.request.urlopen(req, timeout=6) as resp:
            raw = resp.read().decode("utf-8")
            return resp.status, (json.loads(raw) if raw else {})
    except urllib.error.HTTPError as exc:
        raw = exc.read().decode("utf-8")
        return exc.code, (json.loads(raw) if raw else {})


@pytest.fixture
def sesion(servidor):
    base, data_dir = servidor
    bootstrap(base, "presencia01", "Ana")
    return base, entrar(base, data_dir, "presencia01", "Ana")


def _actores(base, token):
    clave, valor = _galleta(token, "presencia01")
    status, body, _ = call("GET", base + RUTA_PRESENCIA, headers={clave: valor})
    assert status == 200, body
    return body["actors"]


def test_un_cuerpo_roto_no_registra_a_nadie(sesion):
    base, token = sesion
    status, body = _crudo(base, RUTA_PRESENCIA, b"{", token)
    assert status == 400, body
    assert body["message"] == "cuerpo-json-invalido"
    assert _actores(base, token) == []


def test_un_latido_sin_actor_se_rechaza(sesion):
    base, token = sesion
    status, body = _crudo(base, RUTA_PRESENCIA, {}, token)
    assert status == 400, body
    assert body["error"] == "actor-requerido"
    assert _actores(base, token) == []


def test_un_latido_con_actor_si_aparece_y_no_hay_anonimos(sesion):
    base, token = sesion
    status, body = _crudo(base, RUTA_PRESENCIA, {"actor": "Ana", "tab": "pautado"}, token)
    assert status == 200, body
    assert body["ok"] is True
    assert body["presence"]["actor"] == "Ana"
    actores = _actores(base, token)
    assert [a["actor"] for a in actores] == ["Ana"]
    assert "anonimo" not in [a["actor"] for a in actores]


def test_el_arreglo_sigue_en_el_codigo():
    from tests.support import REPO_ROOT

    fuente = (REPO_ROOT / "scripts" / "rally_service.py").read_text(encoding="utf-8")
    assert "actor-requerido" in fuente
    inicio = fuente.index("def post_presence")
    cuerpo = fuente[inicio:inicio + 900]
    assert "self.cuerpo_objeto()" in cuerpo
    assert 'presence_beat(data.get("actor")' not in cuerpo
