"""El espejo de estado legado no puede culpar al servidor de un estado ajeno.

Medido en un servidor real con la misma entrada en las dos rutas que importan
estado:

    POST /api/state            {"state": {"clave con espacios!!": ...}} -> 500 error-interno
    POST /api/sections/import  {"state": {"clave con espacios!!": ...}} -> 400 clave-de-seccion-invalida

La clave inválida la manda el cliente. La ruta moderna ya lo decía; la legada
respondía 500, así que el cliente leía «el sistema está roto» y reintentaba el
mismo cuerpo.
"""
from __future__ import annotations

import json
import urllib.error
import urllib.request

import pytest

from tests.support import bootstrap, call, entrar

RUTA_LEGADA = "/api/state?project=main"
RUTA_MODERNA = "/api/sections/import?project=main"
CLAVE_ILEGAL = {"state": {"clave con espacios!!": {"text": "x"}}}


@pytest.fixture
def sesion(servidor):
    base, data_dir = servidor
    bootstrap(base, "main", "Ana")
    token = entrar(base, data_dir, "main", "Ana")
    return base, {"Cookie": f"rally_sesion={token}; rally_proyecto=main"}


def _crudo(base, ruta, cuerpo, cabeceras):
    req = urllib.request.Request(base + ruta, data=cuerpo, method="POST")
    req.add_header("Content-Type", "application/json")
    for clave, valor in cabeceras.items():
        req.add_header(clave, valor)
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            raw = resp.read().decode("utf-8")
            return resp.status, (json.loads(raw) if raw else {})
    except urllib.error.HTTPError as exc:
        raw = exc.read().decode("utf-8")
        return exc.code, (json.loads(raw) if raw else {})


def test_una_clave_ilegal_es_del_cliente_no_del_servidor(sesion):
    base, cabeceras = sesion
    status, body, _ = call("POST", base + RUTA_LEGADA, CLAVE_ILEGAL, headers=cabeceras)
    assert status == 400, body
    assert body["error"] == "clave-de-seccion-invalida"


def test_las_dos_rutas_contestan_lo_mismo_al_mismo_cuerpo(sesion):
    base, cabeceras = sesion
    legado = call("POST", base + RUTA_LEGADA, CLAVE_ILEGAL, headers=cabeceras)
    moderna = call("POST", base + RUTA_MODERNA, CLAVE_ILEGAL, headers=cabeceras)
    assert legado[0] == moderna[0] == 400
    assert legado[1]["error"] == moderna[1]["error"] == "clave-de-seccion-invalida"


def test_un_estado_ilegal_no_deja_nada_importado(sesion):
    base, cabeceras = sesion
    call("POST", base + RUTA_LEGADA, CLAVE_ILEGAL, headers=cabeceras)
    status, body, _ = call("GET", base + "/api/sections?project=main", headers=cabeceras)
    assert status == 200, body
    assert body["sections"] == {}


def test_un_cuerpo_roto_no_se_confunde_con_el_estado_del_equipo(sesion):
    base, cabeceras = sesion
    for ruta in (RUTA_LEGADA, RUTA_MODERNA):
        status, body = _crudo(base, ruta, b"{", cabeceras)
        assert status == 400, (ruta, body)
        assert body["error"] == "state-invalido"


def test_un_estado_valido_se_importa_y_se_puede_leer(sesion):
    base, cabeceras = sesion
    status, body, _ = call("POST", base + RUTA_LEGADA,
                           {"state": {"challenges": {"text": "un reto"}}}, headers=cabeceras)
    assert status == 200, body
    assert body["mode"] == "legacy-import"
    assert body["imported"] == ["challenges"]
    status, leido, _ = call("GET", base + "/api/sections?project=main", headers=cabeceras)
    assert status == 200
    assert leido["sections"]["challenges"]["data"] == {"text": "un reto"}
