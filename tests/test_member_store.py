import json
import subprocess
import sys

import pytest

from scripts.member_store import MemberStore


def test_bootstrap_creates_admin_and_token(tmp_path):
    store = MemberStore(tmp_path / "members.db")
    out = store.bootstrap("main", "Ana", "dev-admin")
    assert out["project"] == "main"
    assert out["member"]["role"] == "admin"
    assert store.authenticate("main", out["token"])["name"] == "Ana"


def test_invite_is_single_use(tmp_path):
    store = MemberStore(tmp_path / "members.db")
    store.bootstrap("main", "Ana", "dev-admin")
    inv = store.create_invite("main", store.list_members("main")[0]["id"])
    first = store.claim_invite(inv["token"], "Luis", "dev-luis")
    assert first["member"]["role"] == "member"
    with pytest.raises(ValueError, match="invite-usado"):
        store.claim_invite(inv["token"], "Otra", "dev-x")


def test_expired_invite_is_rejected(tmp_path):
    store = MemberStore(tmp_path / "members.db")
    store.bootstrap("main", "Ana", "dev-admin")
    inv = store.create_invite("main", store.list_members("main")[0]["id"], ttl_hours=-1)
    with pytest.raises(ValueError, match="invite-expirado"):
        store.claim_invite(inv["token"], "Luis", "dev-luis")


def test_revoked_member_cannot_authenticate(tmp_path):
    store = MemberStore(tmp_path / "members.db")
    out = store.bootstrap("main", "Ana", "dev-admin")
    luis = store.claim_invite(
        store.create_invite("main", out["member"]["id"])["token"], "Luis", "dev-luis"
    )
    store.revoke_member("main", luis["member"]["id"])
    assert store.authenticate("main", luis["session"]) is None


def test_la_llave_maestra_no_echa_a_los_demas(tmp_path):
    # Cada entrada con la llave maestra pisaba el unico token del admin: entrar
    # desde el telefono dejaba fuera a la laptop y el navegador volvia al login.
    store = MemberStore(tmp_path / "members.db")
    out = store.bootstrap("main", "Ana", "dev-admin")
    laptop = store.abrir_sesion_admin("main")
    telefono = store.abrir_sesion_admin("main")
    assert laptop["session"] != telefono["session"]
    assert store.authenticate("main", out["token"])["name"] == "Ana"
    assert store.authenticate("main", laptop["session"])["name"] == "Ana"
    assert store.authenticate("main", telefono["session"])["name"] == "Ana"


def test_revocar_cierra_todas_las_sesiones(tmp_path):
    store = MemberStore(tmp_path / "members.db")
    out = store.bootstrap("main", "Ana", "dev-admin")
    luis = store.claim_invite(
        store.create_invite("main", out["member"]["id"])["token"], "Luis", "dev-luis"
    )
    with store._connect() as conn:
        conn.execute(
            "INSERT INTO sessions (token_hash, project_id, member_id, created_at, last_seen)"
            " VALUES ('x', 'main', ?, 0, 0)",
            (luis["member"]["id"],),
        )
    store.revoke_member("main", luis["member"]["id"])
    assert store.authenticate("main", luis["session"]) is None
    with store._connect() as conn:
        quedan = conn.execute(
            "SELECT COUNT(*) FROM sessions WHERE member_id = ?", (luis["member"]["id"],)
        ).fetchone()[0]
    assert quedan == 0


def test_only_hashes_are_stored(tmp_path):
    store = MemberStore(tmp_path / "members.db")
    out = store.bootstrap("main", "Ana", "dev-admin")
    raw = (tmp_path / "members.db").read_bytes()
    assert out["token"].encode() not in raw


def test_cannot_revoke_last_admin(tmp_path):
    store = MemberStore(tmp_path / "members.db")
    out = store.bootstrap("main", "Ana", "dev-admin")
    with pytest.raises(ValueError, match="ultimo-admin"):
        store.revoke_member("main", out["member"]["id"])


def test_operator_can_invite_and_member_cannot(tmp_path):
    store = MemberStore(tmp_path / "members.db")
    out = store.bootstrap("main", "Ana", "dev-admin")
    luis = store.claim_invite(
        store.create_invite("main", out["member"]["id"])["token"], "Luis", "dev-luis"
    )
    with pytest.raises(ValueError, match="sin-permiso"):
        store.create_invite("main", luis["member"]["id"])
    store.set_role("main", luis["member"]["id"], "operator")
    assert store.create_invite("main", luis["member"]["id"])["token"]


def test_avatar_y_clave_se_guardan_en_la_cuenta(tmp_path):
    store = MemberStore(tmp_path / "members.db")
    out = store.bootstrap("main", "Ana", "dev-admin")
    luis = store.claim_invite(
        store.create_invite("main", out["member"]["id"])["token"],
        "Luis",
        "dev-luis",
        avatar="zorro",
        password="girasol7",
    )
    assert luis["member"]["avatar"] == "zorro"
    assert luis["member"]["has_password"] is True
    # La clave no se guarda en claro.
    raw = (tmp_path / "members.db").read_bytes()
    assert b"girasol7" not in raw


def test_roles_del_estudio_se_eligen_por_persona(tmp_path):
    store = MemberStore(tmp_path / "members.db")
    out = store.bootstrap("main", "Ana", "dev-admin")
    luis = store.claim_invite(
        store.create_invite("main", out["member"]["id"])["token"],
        "Luis",
        "dev-luis",
        roles=["guion", "voz", "guion", "  "],
    )
    assert luis["member"]["roles"] == ["guion", "voz"]
    store.set_approved("main", luis["member"]["id"])
    # Se pueden cambiar despues, sin repetidos.
    cambiado = store.set_roles("main", luis["member"]["id"], "web, editor-video")
    assert cambiado["roles"] == ["web", "editor-video"]
    assert store.authenticate("main", luis["session"])["roles"] == ["web", "editor-video"]


def test_roles_ignoran_basura(tmp_path):
    store = MemberStore(tmp_path / "members.db")
    out = store.bootstrap("main", "Ana", "dev-admin")
    assert store.set_roles("main", out["member"]["id"], ["a" * 40, "../etc", "ok"])["roles"] == [
        "ok"
    ]


def test_base_vieja_gana_la_columna_roles(tmp_path):
    import sqlite3

    ruta = tmp_path / "vieja.db"
    con = sqlite3.connect(ruta)
    con.execute(
        "CREATE TABLE members (id TEXT PRIMARY KEY, project_id TEXT NOT NULL, name TEXT NOT NULL,"
        " role TEXT NOT NULL, device_id TEXT NOT NULL DEFAULT '', token_hash TEXT NOT NULL UNIQUE,"
        " created_at REAL NOT NULL, last_seen REAL NOT NULL DEFAULT 0,"
        " revoked INTEGER NOT NULL DEFAULT 0)"
    )
    con.execute(
        "INSERT INTO members VALUES ('mem_viejo', 'main', 'Ana', 'admin', '', 'h', 0, 0, 0)"
    )
    con.commit()
    con.close()
    store = MemberStore(ruta)
    assert store.list_members("main")[0]["roles"] == []


def test_login_con_nombre_y_clave(tmp_path):
    store = MemberStore(tmp_path / "members.db")
    out = store.bootstrap("main", "Ana", "dev-admin")
    store.claim_invite(
        store.create_invite("main", out["member"]["id"])["token"],
        "Luis",
        "dev-luis",
        password="girasol7",
    )
    luis = store.list_members("main")[-1]
    store.set_approved("main", luis["id"])
    dentro = store.login("main", "luis", "girasol7")
    assert dentro["member"]["name"] == "Luis"
    assert store.authenticate("main", dentro["session"])["name"] == "Luis"
    assert store.login("main", "Luis", "otra-clave") is None
    assert store.login("main", "Nadie", "girasol7") is None


def test_login_no_abre_sesion_a_un_pendiente(tmp_path):
    """La clave buena de una solicitud sin aprobar no es una entrada."""
    store = MemberStore(tmp_path / "members.db")
    out = store.bootstrap("main", "Ana", "dev-admin")
    store.claim_invite(
        store.create_invite("main", out["member"]["id"])["token"],
        "Luis",
        "dev-luis",
        password="girasol8",
    )
    assert store.login("main", "Luis", "girasol8") is None
    assert store.pop_pendiente()["name"] == "Luis"
    assert store.login("main", "Luis", "mala") is None
    assert store.pop_pendiente() is None


def test_sesion_no_se_cae_al_cambiar_de_ip_desde_el_tunel(tmp_path):
    """Otra pestana por cloudflared trae otra IP: la sesion se muda, no muere."""
    store = MemberStore(tmp_path / "members.db")
    out = store.bootstrap("main", "Ana", "dev-admin", password="girasol9")
    dentro = store.login("main", "Ana", "girasol9", ip="127.0.0.1")
    assert store.authenticate("main", dentro["session"], "190.10.20.30") is None
    assert store.pop_conflicto()["vista"] == "190.10.20.30"
    assert store.authenticate("main", dentro["session"], "190.10.20.30",
                              via_proxy=True)["name"] == "Ana"
    assert store.authenticate("main", dentro["session"], "190.10.20.30")["name"] == "Ana"


def test_sin_clave_no_se_puede_entrar_por_login(tmp_path):
    store = MemberStore(tmp_path / "members.db")
    out = store.bootstrap("main", "Ana", "dev-admin")
    store.claim_invite(
        store.create_invite("main", out["member"]["id"])["token"], "Luis", "dev-luis"
    )
    assert store.login("main", "Luis", "") is None
    assert store.login("main", "Luis", "cualquiera") is None


def test_una_base_vieja_gana_avatar_y_clave(tmp_path):
    # members.db creada antes del avatar y la clave: al abrirla se completan.
    import sqlite3

    ruta = tmp_path / "members.db"
    con = sqlite3.connect(ruta)
    con.executescript(
        "CREATE TABLE members (id TEXT PRIMARY KEY, project_id TEXT NOT NULL,"
        " name TEXT NOT NULL, role TEXT NOT NULL, device_id TEXT NOT NULL DEFAULT '',"
        " token_hash TEXT NOT NULL UNIQUE, created_at REAL NOT NULL,"
        " last_seen REAL NOT NULL DEFAULT 0, revoked INTEGER NOT NULL DEFAULT 0);"
    )
    con.commit()
    con.close()
    store = MemberStore(ruta)
    out = store.bootstrap("main", "Ana", "dev-admin")
    assert out["member"]["avatar"] == ""
    assert out["member"]["has_password"] is False


def test_bootstrap_cli_prints_join_url(tmp_path):
    out = subprocess.run(
        [sys.executable, "scripts/crear_proyecto.py",
         "--project", "equipo01", "--name", "Ana",
         "--data-dir", str(tmp_path)],
        capture_output=True, text=True, encoding="utf-8", timeout=30,
    )
    assert out.returncode == 0, out.stderr
    data = json.loads(out.stdout)
    assert data["project"] == "equipo01"
    assert data["join_url"].startswith("join.html?t=")
    assert data["member"]["role"] == "admin"
