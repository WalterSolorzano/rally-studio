"""Base comun de los almacenes SQLite del proyecto.

`MemberStore` y `NubeStore` tenian el mismo `__init__` y el mismo `_connect`
copiados. Viven aqui para que un cambio de timeout o de journal mode se haga
una sola vez.

Cada almacen declara su `ESQUEMA` y, si lo necesita, su `TIMEOUT`.
"""

from __future__ import annotations

import sqlite3
from pathlib import Path


class SqliteStore:
    """Crea la carpeta, abre la conexion y aplica el esquema al construirse."""

    ESQUEMA = ""
    TIMEOUT = 10.0

    def __init__(self, path: str | Path):
        self.path = Path(path)
        self.path.parent.mkdir(parents=True, exist_ok=True)
        with self._connect() as conn:
            conn.executescript(self.ESQUEMA)

    def _connect(self) -> sqlite3.Connection:
        conn = sqlite3.connect(str(self.path), timeout=self.TIMEOUT)
        conn.row_factory = sqlite3.Row
        return conn
