"""Subir un recurso: la cabecera manda, y un cuerpo enorme no se lee.

Medido en `POST /api/asset-upload` con la cabecera `Content-Length` mal puesta:

    Content-Length: abc  -> 413 {"error": "cuerpo-demasiado-grande", "max_bytes": 52428800}
    Content-Length: -5   -> 413 {"error": "cuerpo-demasiado-grande", "max_bytes": 52428800}

El permiso real sí funcionaba (un cuerpo de más de 50 MB se rechaza antes de
leerlo), pero la respuesta culpaba al tamaño cuando el problema era la cabecera:
quien leyera ese mensaje iría a recortar un archivo que no tiene nada que ver.
"""
from __future__ import annotations

import json
import socket
import urllib.parse

import pytest

from tests.support import REPO_ROOT, bootstrap, entrar

RUTA = "/api/asset-upload?project=equipo01"


def _puerto(base: str) -> int:
    return urllib.parse.urlparse(base).port


def _crudo(base: str, cabeceras: list[str], cuerpo: bytes = b"") -> tuple[int, dict]:
    peticion = (
        f"POST {RUTA} HTTP/1.1\r\nHost: 127.0.0.1\r\n"
        + "".join(f"{c}\r\n" for c in cabeceras)
        + "Connection: close\r\n\r\n"
    ).encode("utf-8") + cuerpo
    with socket.create_connection(("127.0.0.1", _puerto(base)), timeout=10) as s:
        s.sendall(peticion)
        trozos = []
        while True:
            parte = s.recv(4096)
            if not parte:
                break
            trozos.append(parte)
    respuesta = b"".join(trozos).decode("utf-8", "replace")
    cabeza, _, resto = respuesta.partition("\r\n\r\n")
    status = int(cabeza.split(" ")[1])
    return status, (json.loads(resto) if resto.strip() else {})


@pytest.fixture
def sesion(servidor):
    base, data_dir = servidor
    bootstrap(base, "equipo01", "Ana")
    token = entrar(base, data_dir, "equipo01", "Ana")
    return base, f"Cookie: rally_sesion={token}; rally_proyecto=equipo01"


def test_una_cabecera_que_no_es_numero_es_peticion_mal_armada(sesion):
    base, galleta = sesion
    status, body = _crudo(base, [galleta, "X-Asset-Name: foto.png", "Content-Length: abc"])
    assert status == 400, body
    assert body["error"] == "cuerpo-invalido"
    assert body["message"] == "Content-Length no es un numero"
    assert "max_bytes" not in body


def test_una_cabecera_negativa_tampoco_es_un_cuerpo_enorme(sesion):
    base, galleta = sesion
    status, body = _crudo(base, [galleta, "X-Asset-Name: foto.png", "Content-Length: -5"])
    assert status == 400, body
    assert body["error"] == "cuerpo-invalido"
    assert body["message"] == "Content-Length negativo"


def test_un_cuerpo_de_verdad_enorme_sigue_rechazandose_antes_de_leerlo(sesion):
    base, galleta = sesion
    status, body = _crudo(
        base,
        [galleta, "X-Asset-Name: foto.png", "Content-Length: 67108864"],
        cuerpo=b"hola",
    )
    assert status == 413, body
    assert body["error"] == "cuerpo-demasiado-grande"
    assert body["max_bytes"] == 50 * 1024 * 1024


def test_una_subida_normal_guarda_el_archivo_con_el_nombre_saneado(sesion):
    base, galleta = sesion
    updir = (REPO_ROOT / "dashboard" / "assets_uploads").resolve()
    existia = updir.exists()
    status, body = _crudo(
        base,
        [galleta, "X-Asset-Name: ..%2F..%2Ffoto%20de%20prueba.png", "Content-Length: 4"],
        cuerpo=b"PNG!",
    )
    assert status == 200, body
    assert body["status"] == "ok"
    guardado = updir / f"{body['id']}__{body['name']}"
    assert "/" not in body["name"] and "\\" not in body["name"]
    try:
        assert guardado.is_file()
        assert guardado.resolve().parent == updir
    finally:
        guardado.unlink(missing_ok=True)
        # `test_paquete_limpio` vigila que el paquete no viaje con subidas
        # personales: si la carpeta la creo esta prueba, se va con el archivo.
        if not existia and updir.is_dir() and not any(updir.iterdir()):
            updir.rmdir()
