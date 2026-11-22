# -*- coding: utf-8 -*-
"""Aislamiento de datos entre equipos e instancias (Fase 6, brecha S-5).

Dos preguntas concretas:

  1. ¿El motor respeta `RALLY_DATA_DIR`? Si no lo respeta, dos equipos en la
     misma maquina escriben en la misma base y un equipo puede leer el trabajo
     del otro.
  2. ¿Dos almacenes en rutas distintas se ignoran entre si? Es la prueba
     directa de que no hay estado compartido escondido en el modulo.

El motor calcula `DATA_DIR` al importarse, asi que la primera prueba necesita
un proceso aparte: monkeypatchear el entorno despues del import no cambia nada.
"""

from __future__ import annotations

import json
import subprocess
import sys
from pathlib import Path

from scripts.section_store import SQLiteSectionStore

RAIZ = Path(__file__).resolve().parents[1]

SONDA = """
import json, sys
sys.path.insert(0, sys.argv[1])
sys.path.insert(0, sys.argv[1] + "/scripts")
import rally_service as rs
print(json.dumps({
    "data_dir": str(rs.DATA_DIR),
    "store": type(rs.SECTION_STORE).__name__,
    "ruta_bd": str(getattr(rs.SECTION_STORE, "path", "")),
}))
"""


def _sonda(destino: Path) -> dict:
    """Importa el motor en un proceso limpio con RALLY_DATA_DIR apuntando a destino."""
    entorno = {
        "RALLY_DATA_DIR": str(destino),
        "PYTHONIOENCODING": "utf-8",
        "SYSTEMROOT": __import__("os").environ.get("SYSTEMROOT", ""),
        "PATH": __import__("os").environ.get("PATH", ""),
    }
    r = subprocess.run(
        [sys.executable, "-c", SONDA, str(RAIZ)],
        capture_output=True, env=entorno, timeout=120,
    )
    assert r.returncode == 0, r.stderr.decode("utf-8", errors="replace")[-800:]
    return json.loads(r.stdout.decode("utf-8", errors="replace").strip().splitlines()[-1])


def test_el_motor_escribe_en_la_carpeta_que_se_le_indica(tmp_path):
    destino = tmp_path / "equipo-a"
    datos = _sonda(destino)
    assert Path(datos["data_dir"]) == destino
    assert datos["store"] == "SQLiteSectionStore"
    assert Path(datos["ruta_bd"]).parent == destino


def test_dos_equipos_no_comparten_base(tmp_path):
    a, b = tmp_path / "equipo-a", tmp_path / "equipo-b"
    da, db = _sonda(a), _sonda(b)
    assert da["ruta_bd"] != db["ruta_bd"]
    assert a.is_dir() and b.is_dir()


def test_dos_almacenes_no_se_ven_entre_si(tmp_path):
    store_a = SQLiteSectionStore(tmp_path / "a" / "sections.db")
    store_b = SQLiteSectionStore(tmp_path / "b" / "sections.db")
    store_a.lock("proy", "pautado.problema", "pautador", "u-a")
    store_a.write_section("proy", "pautado.problema", {"texto": "de A"},
                          0, "pautador", "u-a")
    assert store_b.read_state("proy") == {}
    assert store_b.read_sections("proy")[1] == {}
    assert store_a.read_state("proy")["pautado"]["problema"] == {"texto": "de A"}
