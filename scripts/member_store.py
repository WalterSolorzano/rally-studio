"""Miembros, invitaciones y sesiones de un proyecto local.

No habla HTTP. Guarda solo hashes de tokens; el token en claro se devuelve una
vez, al crearlo. La base vive en `dashboard/data/members.db` por defecto.
"""

from __future__ import annotations

import hashlib
import hmac
import secrets
import sqlite3
import time
from pathlib import Path

try:
    from store_base import SqliteStore
except ImportError:  # importado como paquete (scripts.member_store)
    from scripts.store_base import SqliteStore

ROLES = ("admin", "operator", "mentor", "member", "visitor")
ROLES_INVITABLES = ("mentor", "member", "visitor")
SENAL_DIAS = 30  # vida util de una sesion paralela (la cookie dura lo mismo)
SCHEMA = """
CREATE TABLE IF NOT EXISTS members (
    id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    device_id TEXT NOT NULL DEFAULT '',
    token_hash TEXT NOT NULL UNIQUE,
    created_at REAL NOT NULL,
    last_seen REAL NOT NULL DEFAULT 0,
    revoked INTEGER NOT NULL DEFAULT 0,
    avatar TEXT NOT NULL DEFAULT '',
    password_hash TEXT NOT NULL DEFAULT '',
    roles TEXT NOT NULL DEFAULT '',
    approved INTEGER NOT NULL DEFAULT 1
);
CREATE TABLE IF NOT EXISTS invites (
    token_hash TEXT PRIMARY KEY,
    project_id TEXT NOT NULL,
    created_by TEXT NOT NULL,
    created_at REAL NOT NULL,
    expires_at REAL NOT NULL,
    used_by TEXT,
    used_at REAL,
    role TEXT NOT NULL DEFAULT 'member'
);
CREATE TABLE IF NOT EXISTS sessions (
    token_hash TEXT PRIMARY KEY,
    project_id TEXT NOT NULL,
    member_id TEXT NOT NULL,
    created_at REAL NOT NULL,
    last_seen REAL NOT NULL DEFAULT 0,
    ip TEXT NOT NULL DEFAULT ''
);
CREATE INDEX IF NOT EXISTS idx_members_project ON members(project_id);
CREATE INDEX IF NOT EXISTS idx_invites_project ON invites(project_id);
CREATE INDEX IF NOT EXISTS idx_sessions_member ON sessions(member_id);
"""


def _hash(token: str) -> str:
    return hashlib.sha256(token.encode("utf-8")).hexdigest()


CLAVE_ITERACIONES = 120_000


def _hash_clave(clave: str) -> str:
    """Huella lenta de una clave personal (pbkdf2). Nunca se guarda la clave."""
    salt = secrets.token_bytes(16)
    dk = hashlib.pbkdf2_hmac("sha256", clave.encode("utf-8"), salt, CLAVE_ITERACIONES)
    return f"pbkdf2${CLAVE_ITERACIONES}${salt.hex()}${dk.hex()}"


def _clave_ok(clave: str, guardado: str) -> bool:
    try:
        algo, iteraciones, salt_hex, dk_hex = guardado.split("$")
    except (AttributeError, ValueError):
        return False
    if algo != "pbkdf2":
        return False
    try:
        dk = hashlib.pbkdf2_hmac(
            "sha256", clave.encode("utf-8"), bytes.fromhex(salt_hex), int(iteraciones)
        )
    except ValueError:
        return False
    return hmac.compare_digest(dk.hex(), dk_hex)


ROLES_DEL_ESTUDIO_MAX = 12


def _limpiar_roles(roles) -> list[str]:
    """Roles del estudio que toma una persona. Lista corta, sin repetidos.

    Acepta lista o texto separado por comas (asi viaja en la base). Los ids
    son cortos y en minusculas: `director`, `guion`, `presupuesto`...
    """
    if isinstance(roles, str):
        crudos = roles.split(",")
    elif isinstance(roles, (list, tuple, set)):
        crudos = list(roles)
    else:
        return []
    limpios: list[str] = []
    for crudo in crudos:
        clave = str(crudo or "").strip().lower()
        if not clave or len(clave) > 20:
            continue
        if not clave.replace("-", "").isalnum():
            continue
        if clave not in limpios:
            limpios.append(clave)
        if len(limpios) >= ROLES_DEL_ESTUDIO_MAX:
            break
    return limpios


class MemberStore(SqliteStore):
    ESQUEMA = SCHEMA

    def __init__(self, path: str | Path):
        super().__init__(path)
        self._conflicto = None
        # Ultimo acceso con clave correcta pero sin aprobacion del coordinador.
        self._pendiente = None
        # Bases creadas antes de los avatares y claves: se completan al abrir.
        with self._connect() as conn:
            columnas = {row["name"] for row in conn.execute("PRAGMA table_info(members)")}
            if "avatar" not in columnas:
                conn.execute("ALTER TABLE members ADD COLUMN avatar TEXT NOT NULL DEFAULT ''")
            if "password_hash" not in columnas:
                conn.execute(
                    "ALTER TABLE members ADD COLUMN password_hash TEXT NOT NULL DEFAULT ''"
                )
            if "roles" not in columnas:
                conn.execute("ALTER TABLE members ADD COLUMN roles TEXT NOT NULL DEFAULT ''")
            if "approved" not in columnas:
                # Los equipos que ya existen quedan aprobados: nadie se queda fuera.
                conn.execute(
                    "ALTER TABLE members ADD COLUMN approved INTEGER NOT NULL DEFAULT 1"
                )
            sesiones = {row["name"] for row in conn.execute("PRAGMA table_info(sessions)")}
            if "ip" not in sesiones:
                conn.execute("ALTER TABLE sessions ADD COLUMN ip TEXT NOT NULL DEFAULT ''")
            invitaciones = {row["name"] for row in conn.execute("PRAGMA table_info(invites)")}
            if "role" not in invitaciones:
                conn.execute(
                    "ALTER TABLE invites ADD COLUMN role TEXT NOT NULL DEFAULT 'member'"
                )
            conn.commit()

    @staticmethod
    def _member(row: sqlite3.Row) -> dict:
        return {
            "id": row["id"],
            "name": row["name"],
            "role": row["role"],
            "device_id": row["device_id"],
            "avatar": row["avatar"] or "",
            "roles": _limpiar_roles(row["roles"] or ""),
            "has_password": bool(row["password_hash"]),
            "revoked": bool(row["revoked"]),
            "approved": bool(row["approved"]),
            "pending": not bool(row["approved"]),
            "last_seen": row["last_seen"],
        }

    def has_members(self, project_id: str) -> bool:
        with self._connect() as conn:
            row = conn.execute(
                "SELECT 1 FROM members WHERE project_id = ? AND revoked = 0"
                " AND approved = 1 LIMIT 1",
                (project_id,),
            ).fetchone()
        return row is not None

    def has_any_members(self, project_id: str) -> bool:
        """Con al menos una fila (aunque este pendiente) el modo legado se cierra."""
        with self._connect() as conn:
            row = conn.execute(
                "SELECT 1 FROM members WHERE project_id = ? LIMIT 1", (project_id,)
            ).fetchone()
        return row is not None

    def bootstrap(self, project_id: str, admin_name: str, device_id: str,
                  password: str = "") -> dict:
        name = (admin_name or "").strip()
        if not name:
            raise ValueError("nombre-requerido")
        clave = (password or "").strip()
        if clave and len(clave) < 6:
            raise ValueError("clave-corta")
        if self.has_members(project_id):
            raise ValueError("proyecto-existente")
        token = secrets.token_urlsafe(32)
        member_id = "mem_" + secrets.token_hex(8)
        now = time.time()
        with self._connect() as conn:
            conn.execute(
                "INSERT INTO members (id, project_id, name, role, device_id, token_hash,"
                " created_at, last_seen, revoked, password_hash) VALUES (?, ?, ?, 'admin', ?, ?, ?, ?, 0, ?)",
                (member_id, project_id, name, device_id, _hash(token), now, now,
                 _hash_clave(clave) if clave else ""),
            )
            conn.commit()
            row = conn.execute("SELECT * FROM members WHERE id = ?", (member_id,)).fetchone()
        return {"project": project_id, "member": self._member(row), "token": token}

    def create_invite(self, project_id: str, actor_id: str, ttl_hours: int = 48,
                      role: str = "member") -> dict:
        invitado = (role or "member").strip().lower()
        if invitado not in ROLES_INVITABLES:
            # Un enlace no reparte admin: ese rol se asigna despues, a mano.
            raise ValueError("rol-invalido")
        with self._connect() as conn:
            actor = conn.execute(
                "SELECT * FROM members WHERE id = ? AND project_id = ? AND revoked = 0",
                (actor_id, project_id),
            ).fetchone()
            if actor is None or actor["role"] not in ("admin", "operator", "mentor"):
                raise ValueError("sin-permiso")
            token = secrets.token_urlsafe(24)
            now = time.time()
            # El visitante solo mira un rato: su enlace no vive mas de una hora
            # aunque el admin pida mas, y sirve una sola vez.
            horas = 1 if invitado == "visitor" else ttl_hours
            expires = now + float(horas) * 3600
            conn.execute(
                "INSERT INTO invites (token_hash, project_id, created_by, created_at,"
                " expires_at, role) VALUES (?, ?, ?, ?, ?, ?)",
                (_hash(token), project_id, actor_id, now, expires, invitado),
            )
            conn.commit()
        return {
            "token": token,
            "url_path": "join.html?t=" + token,
            "role": invitado,
            "expires_at": expires,
        }

    def claim_invite(
        self,
        token: str,
        name: str,
        device_id: str,
        avatar: str = "",
        password: str = "",
        roles="",
    ) -> dict:
        clean_name = (name or "").strip()
        if not clean_name:
            raise ValueError("nombre-requerido")
        if len(clean_name) > 40:
            raise ValueError("nombre-largo")
        clean_avatar = (avatar or "").strip()
        if len(clean_avatar) > 40:
            raise ValueError("avatar-largo")
        clean_roles = _limpiar_roles(roles)
        clave = (password or "").strip()
        if clave and len(clave) < 6:
            raise ValueError("clave-corta")
        ahora = time.time()
        with self._connect() as conn:
            conn.execute("BEGIN IMMEDIATE")
            inv = conn.execute(
                "SELECT * FROM invites WHERE token_hash = ?", (_hash(token),)
            ).fetchone()
            if inv is None:
                raise ValueError("invite-invalido")
            if inv["used_at"] is not None:
                raise ValueError("invite-usado")
            if inv["expires_at"] <= ahora:
                raise ValueError("invite-expirado")
            member_id = "mem_" + secrets.token_hex(8)
            session = secrets.token_urlsafe(32)
            rol = inv["role"] if "role" in inv.keys() else "member"
            if rol not in ROLES_INVITABLES:
                rol = "member"
            conn.execute(
                "INSERT INTO members (id, project_id, name, role, device_id, token_hash,"
                " created_at, last_seen, revoked, avatar, password_hash, roles, approved)"
                " VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?, ?, 0)",
                (
                    member_id,
                    inv["project_id"],
                    clean_name,
                    rol,
                    device_id,
                    _hash(session),
                    ahora,
                    ahora,
                    clean_avatar,
                    _hash_clave(clave) if clave else "",
                    ",".join(clean_roles),
                ),
            )
            conn.execute(
                "UPDATE invites SET used_by = ?, used_at = ? WHERE token_hash = ?",
                (member_id, ahora, inv["token_hash"]),
            )
            conn.commit()
            row = conn.execute("SELECT * FROM members WHERE id = ?", (member_id,)).fetchone()
        return {
            "project": inv["project_id"],
            "member": self._member(row),
            "session": session,
            "pending": not bool(row["approved"]),
        }

    def set_approved(self, project_id: str, member_id: str, approved: bool = True) -> dict:
        """Abre (o cierra) el acceso de una solicitud. Solo el servicio decide quien llama."""
        with self._connect() as conn:
            row = conn.execute(
                "SELECT * FROM members WHERE id = ? AND project_id = ? AND revoked = 0",
                (member_id, project_id),
            ).fetchone()
            if row is None:
                raise ValueError("miembro-inexistente")
            conn.execute(
                "UPDATE members SET approved = ? WHERE id = ?",
                (1 if approved else 0, member_id),
            )
            if not approved:
                conn.execute("DELETE FROM sessions WHERE member_id = ?", (member_id,))
            conn.commit()
            row = conn.execute("SELECT * FROM members WHERE id = ?", (member_id,)).fetchone()
        return self._member(row)

    @staticmethod
    def _nueva_sesion(conn: sqlite3.Connection, project_id: str, member_id: str,
                      ip: str = "") -> str:
        token = secrets.token_urlsafe(32)
        ahora = time.time()
        conn.execute(
            "INSERT OR REPLACE INTO sessions (token_hash, project_id, member_id,"
            " created_at, last_seen, ip) VALUES (?, ?, ?, ?, ?, ?)",
            (_hash(token), project_id, member_id, ahora, ahora, ip or ""),
        )
        return token

    def login(self, project_id: str, name: str, password: str, ip: str = "") -> dict | None:
        """Entra con nombre y clave personal, sin pedir un enlace nuevo.

        Devuelve None si el nombre no existe, no tiene clave, la clave no
        coincide o el miembro aun no esta aprobado. Antes devolvia sesion a los
        pendientes: el tablero rebotaba al login en cada pestana nueva.
        """
        limpio = (name or "").strip()
        clave = password or ""
        if not limpio or not clave:
            return None
        self._pendiente = None
        with self._connect() as conn:
            filas = conn.execute(
                "SELECT * FROM members WHERE project_id = ? AND revoked = 0"
                " AND password_hash <> '' AND name = ? COLLATE NOCASE",
                (project_id, limpio),
            ).fetchall()
            for fila in filas:
                if not _clave_ok(clave, fila["password_hash"]):
                    continue
                if not int(fila["approved"] or 0):
                    # La clave es buena: no es un intento fallido, es una espera.
                    self._pendiente = {"name": fila["name"], "member_id": fila["id"]}
                    return None
                token = self._nueva_sesion(conn, project_id, fila["id"], ip)
                conn.execute(
                    "UPDATE members SET last_seen = ? WHERE id = ?", (time.time(), fila["id"])
                )
                conn.commit()
                row = conn.execute("SELECT * FROM members WHERE id = ?", (fila["id"],)).fetchone()
                return {"project": project_id, "member": self._member(row), "session": token}
        return None

    def set_avatar(self, project_id: str, member_id: str, avatar: str) -> dict:
        limpio = (avatar or "").strip()
        if len(limpio) > 40:
            raise ValueError("avatar-largo")
        with self._connect() as conn:
            row = conn.execute(
                "SELECT 1 FROM members WHERE id = ? AND project_id = ?", (member_id, project_id)
            ).fetchone()
            if row is None:
                raise ValueError("miembro-inexistente")
            conn.execute("UPDATE members SET avatar = ? WHERE id = ?", (limpio, member_id))
            conn.commit()
        return {"id": member_id, "avatar": limpio}

    def rename(self, project_id: str, member_id: str, name: str) -> dict:
        """El nombre se puede corregir despues de entrar; la firma sigue siendo la misma."""
        limpio = (name or "").strip()
        if not limpio:
            raise ValueError("nombre-requerido")
        if len(limpio) > 40:
            raise ValueError("nombre-largo")
        with self._connect() as conn:
            row = conn.execute(
                "SELECT 1 FROM members WHERE id = ? AND project_id = ? AND revoked = 0",
                (member_id, project_id),
            ).fetchone()
            if row is None:
                raise ValueError("miembro-inexistente")
            conn.execute("UPDATE members SET name = ? WHERE id = ?", (limpio, member_id))
            conn.commit()
        return {"id": member_id, "name": limpio}

    def leer_invite(self, token: str) -> dict:
        """Lo que la pagina de entrada necesita: a que proyecto va y como entra."""
        with self._connect() as conn:
            inv = conn.execute(
                "SELECT * FROM invites WHERE token_hash = ?", (_hash(token or ""),)
            ).fetchone()
            if inv is None:
                raise ValueError("invite-invalido")
            if inv["used_at"] is not None:
                raise ValueError("invite-usado")
            if inv["expires_at"] <= time.time():
                raise ValueError("invite-expirado")
            rol = inv["role"] if "role" in inv.keys() else "member"
        return {
            "project": inv["project_id"],
            "role": rol if rol in ROLES_INVITABLES else "member",
            "expires_at": inv["expires_at"],
        }

    def leer_roster(self, token: str) -> dict:
        """Quien ya entro, para quien llega con el enlace y aun no tiene sesion.

        El token manda: solo se devuelve nombre, rol, avatar y si esta aprobado.
        """
        info = self.leer_invite(token)
        gente = [
            {
                "name": m.get("name", ""),
                "role": m.get("role", ""),
                "avatar": m.get("avatar", ""),
                "approved": bool(m.get("approved")),
            }
            for m in self.list_members(info["project"])
        ]
        return {"project": info["project"], "role": info["role"], "members": gente}

    def set_roles(self, project_id: str, member_id: str, roles) -> dict:
        limpios = _limpiar_roles(roles)
        with self._connect() as conn:
            row = conn.execute(
                "SELECT 1 FROM members WHERE id = ? AND project_id = ?", (member_id, project_id)
            ).fetchone()
            if row is None:
                raise ValueError("miembro-inexistente")
            conn.execute("UPDATE members SET roles = ? WHERE id = ?", (",".join(limpios), member_id))
            conn.commit()
        return {"id": member_id, "roles": limpios}

    def set_password(self, project_id: str, member_id: str, password: str) -> dict:
        clave = (password or "").strip()
        if clave and len(clave) < 6:
            raise ValueError("clave-corta")
        with self._connect() as conn:
            row = conn.execute(
                "SELECT 1 FROM members WHERE id = ? AND project_id = ?", (member_id, project_id)
            ).fetchone()
            if row is None:
                raise ValueError("miembro-inexistente")
            conn.execute(
                "UPDATE members SET password_hash = ? WHERE id = ?",
                (_hash_clave(clave) if clave else "", member_id),
            )
            conn.commit()
        return {"id": member_id, "has_password": bool(clave)}

    def abrir_sesion_admin(self, project_id: str, ip: str = "") -> dict:
        """Token nuevo para el primer admin del proyecto.

        Se usa con la llave maestra: no crea miembros ni cambia roles, solo
        reabre la sesion del dueno cuando pierde el navegador.

        La sesion nueva se guarda aparte y NO reemplaza la anterior: antes se
        pisaba el unico token del admin, asi que entrar desde otro dispositivo
        (o el telefono, o una prueba) echaba a todos los demas.
        """
        token = secrets.token_urlsafe(32)
        now = time.time()
        with self._connect() as conn:
            row = conn.execute(
                "SELECT * FROM members WHERE project_id = ? AND role = 'admin' AND revoked = 0"
                " ORDER BY created_at ASC LIMIT 1",
                (project_id,),
            ).fetchone()
            if row is None:
                raise ValueError("sin-admin")
            conn.execute(
                "INSERT OR REPLACE INTO sessions (token_hash, project_id, member_id,"
                " created_at, last_seen, ip) VALUES (?, ?, ?, ?, ?, ?)",
                (_hash(token), project_id, row["id"], now, now, ip or ""),
            )
            # Las sesiones del dueno no crecen sin fin: se olvidan las de mas de 30 dias.
            conn.execute(
                "DELETE FROM sessions WHERE member_id = ? AND last_seen < ?",
                (row["id"], now - SENAL_DIAS * 86400),
            )
            conn.execute("UPDATE members SET last_seen = ? WHERE id = ?", (now, row["id"]))
            conn.commit()
            row = conn.execute("SELECT * FROM members WHERE id = ?", (row["id"],)).fetchone()
        return {"project": project_id, "member": self._member(row), "session": token}

    def close_all_sessions(self, project_id: str) -> int:
        """Cierra toda sesion del proyecto y borra los token guardados.

        Boton de panico: si alguien pudo copiar un acceso, deja de servir de
        inmediato. El dueno vuelve a entrar con la llave maestra desde la
        computadora del servidor.
        """
        with self._connect() as conn:
            cur = conn.execute("DELETE FROM sessions WHERE project_id = ?", (project_id,))
            quitadas = cur.rowcount or 0
            # `token_hash` es UNIQUE: no se vacia a '' (chocaria entre miembros),
            # se marca con un valor que ningun token real puede producir.
            cur2 = conn.execute(
                "UPDATE members SET token_hash = 'off:' || id WHERE project_id = ?"
                " AND token_hash NOT LIKE 'off:%'",
                (project_id,),
            )
            quitadas += cur2.rowcount or 0
            conn.commit()
        return quitadas

    def pop_conflicto(self) -> dict | None:
        """Ultimo intento de usar una sesion desde otra IP, si hubo."""
        conflicto = self._conflicto
        self._conflicto = None
        return conflicto

    def pop_pendiente(self) -> dict | None:
        """Ultimo acceso con clave buena de un miembro sin aprobar."""
        pendiente = self._pendiente
        self._pendiente = None
        return pendiente

    def authenticate(self, project_id: str, token: str, ip: str = "",
                     via_proxy: bool = False) -> dict | None:
        """Devuelve el miembro solo si esta aprobado y la sesion es de esta IP.

        La IP se guarda al abrir la sesion. Una sesion vista desde otra IP (por
        ejemplo un token copiado de la red) no vale: eso es lo que hace inutil
        espiar el WiFi sin cifrar.

        `via_proxy` llega cuando la peticion entro por un tunel que corre en
        esta misma maquina (cloudflared). Ahi la IP de la cabecera cambia al
        abrir otra pestana o al pasar del telefono al portatil, y la sesion
        buena se caia. En ese caso la sesion se muda a la IP nueva; el vecino
        del WiFi, que llega directo, sigue bloqueado.
        """
        if not token:
            return None
        digest = _hash(token)
        now = time.time()
        with self._connect() as conn:
            row = conn.execute(
                "SELECT m.*, s.ip AS session_ip FROM sessions s"
                " JOIN members m ON m.id = s.member_id"
                " WHERE s.token_hash = ? AND s.project_id = ? AND m.project_id = ?"
                " AND m.revoked = 0 AND m.approved = 1",
                (digest, project_id, project_id),
            ).fetchone()
            if row is not None:
                guardada = (row["session_ip"] or "").strip()
                if guardada and ip and guardada != ip:
                    if via_proxy:
                        # Tunel en esta maquina: la sesion se muda, no se rompe.
                        conn.execute(
                            "UPDATE sessions SET ip = ? WHERE token_hash = ?", (ip, digest)
                        )
                    else:
                        self._conflicto = {
                            "member_id": row["id"], "name": row["name"],
                            "esperada": guardada, "vista": ip,
                        }
                        return None
                conn.execute(
                    "UPDATE sessions SET last_seen = ? WHERE token_hash = ?", (now, digest)
                )
            else:
                row = conn.execute(
                    "SELECT * FROM members WHERE project_id = ? AND token_hash = ?"
                    " AND revoked = 0 AND approved = 1",
                    (project_id, digest),
                ).fetchone()
            if row is None:
                return None
            conn.execute("UPDATE members SET last_seen = ? WHERE id = ?", (now, row["id"]))
            conn.commit()
            row = conn.execute("SELECT * FROM members WHERE id = ?", (row["id"],)).fetchone()
        return self._member(row)

    def list_members(self, project_id: str, incluir_revocados: bool = False) -> list[dict]:
        filtro = "" if incluir_revocados else " AND revoked = 0"
        with self._connect() as conn:
            rows = conn.execute(
                "SELECT * FROM members WHERE project_id = ?" + filtro
                + " ORDER BY created_at ASC",
                (project_id,),
            ).fetchall()
        return [self._member(row) for row in rows]

    def revoke_member(self, project_id: str, member_id: str) -> dict:
        with self._connect() as conn:
            row = conn.execute(
                "SELECT * FROM members WHERE id = ? AND project_id = ?",
                (member_id, project_id),
            ).fetchone()
            if row is None:
                raise ValueError("miembro-inexistente")
            if row["role"] == "admin" and not row["revoked"]:
                admins = conn.execute(
                    "SELECT COUNT(*) FROM members WHERE project_id = ? AND role = 'admin'"
                    " AND revoked = 0",
                    (project_id,),
                ).fetchone()[0]
                if admins <= 1:
                    raise ValueError("ultimo-admin")
            conn.execute("UPDATE members SET revoked = 1 WHERE id = ?", (member_id,))
            conn.execute(
                "DELETE FROM sessions WHERE member_id = ? AND project_id = ?",
                (member_id, project_id),
            )
            conn.commit()
        return {"id": member_id, "revoked": True}

    def set_role(self, project_id: str, member_id: str, role: str) -> dict:
        if role not in ROLES:
            raise ValueError("rol-invalido")
        with self._connect() as conn:
            row = conn.execute(
                "SELECT * FROM members WHERE id = ? AND project_id = ?",
                (member_id, project_id),
            ).fetchone()
            if row is None:
                raise ValueError("miembro-inexistente")
            if row["role"] == "admin" and role != "admin" and not row["revoked"]:
                admins = conn.execute(
                    "SELECT COUNT(*) FROM members WHERE project_id = ? AND role = 'admin'"
                    " AND revoked = 0",
                    (project_id,),
                ).fetchone()[0]
                if admins <= 1:
                    raise ValueError("ultimo-admin")
            conn.execute("UPDATE members SET role = ? WHERE id = ?", (role, member_id))
            conn.commit()
            row = conn.execute("SELECT * FROM members WHERE id = ?", (member_id,)).fetchone()
        return self._member(row)
