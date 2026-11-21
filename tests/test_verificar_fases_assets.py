# -*- coding: utf-8 -*-
"""Regla 7 de AGENTS.md: un asset se llama `asset_<shotlist_id>_<descripcion>.<ext>`.

El verificador de etapas daba por bueno cualquier archivo que empezara con `asset_`,
asi que `asset_1.png` contaba como entregable aunque no se pudiera remontar a una toma.
Se mide sobre el nombre real del archivo, no sobre lo que dice el informe.
"""

from __future__ import annotations

import sys
from pathlib import Path

RAIZ = Path(__file__).resolve().parents[1]
if str(RAIZ) not in sys.path:
    sys.path.insert(0, str(RAIZ))

from scripts.verificar_fases import (  # noqa: E402
    ASSET_RX,
    _assets_bien_nombrados,
    _carpeta_con_assets,
)


def _tocar(carpeta: Path, *nombres: str) -> Path:
    carpeta.mkdir(parents=True, exist_ok=True)
    for nombre in nombres:
        (carpeta / nombre).write_bytes(b"x")
    return carpeta


def test_el_nombre_completo_cuenta(tmp_path):
    carpeta = _tocar(tmp_path / "assets", "asset_S01_bomba-instalada.png")
    assert _carpeta_con_assets(carpeta) is True


def test_el_prefijo_solo_no_basta(tmp_path):
    """`asset_1.png` tiene el prefijo y no es un asset de la regla."""
    carpeta = _tocar(tmp_path / "assets", "asset_1.png")
    assert _carpeta_con_assets(carpeta) is False


def test_un_nombre_sin_descripcion_no_cuenta(tmp_path):
    carpeta = _tocar(tmp_path / "assets", "asset_S01.png", "asset_S01_.png")
    assert _carpeta_con_assets(carpeta) is False


def test_una_foto_sin_prefijo_no_cuenta(tmp_path):
    carpeta = _tocar(tmp_path / "assets", "foto_pozo.png")
    assert _carpeta_con_assets(carpeta) is False


def test_carpeta_vacia_no_es_entregable(tmp_path):
    carpeta = tmp_path / "assets"
    carpeta.mkdir()
    assert _carpeta_con_assets(carpeta) is False


def test_basta_un_asset_bien_nombrado_entre_varios(tmp_path):
    carpeta = _tocar(tmp_path / "assets", "asset_1.png", "nota.txt",
                     "asset_S02_tanque-500-litros.jpg")
    assert _carpeta_con_assets(carpeta) is True
    bien = _assets_bien_nombrados(carpeta)
    assert [p.name for p in bien] == ["asset_S02_tanque-500-litros.jpg"]


def test_la_subcarpeta_cuenta(tmp_path):
    carpeta = tmp_path / "assets"
    _tocar(carpeta / "shotlist", "asset_A7_comite-reunido.webp")
    assert _carpeta_con_assets(carpeta) is True


def test_la_extension_larga_se_acepta(tmp_path):
    carpeta = _tocar(tmp_path / "assets", "asset_S03_pozo-seco.jpeg")
    assert _carpeta_con_assets(carpeta) is True


def test_el_patron_rechaza_lo_que_no_es_asset(tmp_path):
    for nombre in ("asset_S01_descripcion", "asset_S01_descripcion.", ".png",
                   "ASSET_S01_descripcion.png"):
        assert ASSET_RX.match(nombre) is None, nombre


def test_el_patron_acepta_id_numerico_y_alfanumerico():
    for nombre in ("asset_01_pozo.png", "asset_T12_agua.mp4", "asset_9A_casa.gif"):
        assert ASSET_RX.match(nombre) is not None, nombre
