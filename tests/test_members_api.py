from tests.support import auth, bootstrap, call, claim, approve, entrar


def test_claim_returns_session_and_second_claim_fails(servidor):
    base, _ = servidor
    boot = bootstrap(base, "equipo01", "Ana")
    status, body, _ = call("POST", base + "/api/project/claim", {
        "token": boot["join_token"], "name": "Luis", "device_id": "dev-luis",
    })
    assert status == 200
    assert body["member"]["name"] == "Luis"
    assert body["session"]
    status2, _, _ = call("POST", base + "/api/project/claim", {
        "token": boot["join_token"], "name": "Otra", "device_id": "dev-x",
    })
    assert status2 == 400


def test_sections_require_session_when_project_has_members(servidor):
    base, _ = servidor
    boot = bootstrap(base, "equipo01", "Ana")
    status, _, _ = call("GET", base + "/api/sections?project=equipo01")
    assert status == 401
    status2, body2, _ = call("GET", base + "/api/sections?project=equipo01",
                             headers=auth(boot["admin_token"]))
    assert status2 == 200


def test_member_cannot_create_invite(servidor):
    base, _ = servidor
    boot = bootstrap(base, "equipo01", "Ana")
    member = claim(base, boot["join_token"], "Luis")
    approve(base, "equipo01", member["member"]["id"], boot["admin_token"])
    status, _, _ = call("POST", base + "/api/invites?project=equipo01",
                        {"ttl_hours": 2}, headers=auth(member["session"]))
    assert status == 403


def test_admin_revokes_member_and_token_dies(servidor):
    base, _ = servidor
    boot = bootstrap(base, "equipo01", "Ana")
    member = claim(base, boot["join_token"], "Luis")
    status, _, _ = call(
        "POST",
        base + "/api/members/" + member["member"]["id"] + "/revoke?project=equipo01",
        {}, headers=auth(boot["admin_token"]),
    )
    assert status == 200
    status2, _, _ = call("GET", base + "/api/sections?project=equipo01",
                         headers=auth(member["session"]))
    assert status2 == 401


def test_project_without_members_requires_the_key(servidor):
    base, data_dir = servidor
    status, _, _ = call("GET", base + "/api/sections?project=main")
    assert status == 401
    session = entrar(base, data_dir)
    status, body, _ = call("GET", base + "/api/sections?project=main",
                           headers=auth(session))
    assert status == 200
    assert body["ok"] is True


def test_admin_can_create_invite_and_list_members(servidor):
    base, _ = servidor
    boot = bootstrap(base, "equipo01", "Ana")
    status, body, _ = call("POST", base + "/api/invites?project=equipo01",
                           {"ttl_hours": 2}, headers=auth(boot["admin_token"]))
    assert status == 200
    assert body["url_path"].startswith("join.html?t=")
    status2, body2, _ = call("GET", base + "/api/members?project=equipo01",
                             headers=auth(boot["admin_token"]))
    assert status2 == 200
    assert len(body2["members"]) == 1
    assert "token" not in body2["members"][0]

def test_lista_no_muestra_miembros_retirados(servidor):
    """La base guarda el retirado para auditoria, pero no aparece como si
    siguiera dentro del equipo."""
    base, _ = servidor
    boot = bootstrap(base, "equipo01", "Ana")
    member = claim(base, boot["join_token"], "Luis")
    call("POST", base + "/api/members/" + member["member"]["id"]
         + "/revoke?project=equipo01", {}, headers=auth(boot["admin_token"]))
    status, body, _ = call("GET", base + "/api/members?project=equipo01",
                           headers=auth(boot["admin_token"]))
    assert status == 200
    assert [m["name"] for m in body["members"]] == ["Ana"]


def test_lo_privado_del_equipo_exige_sesion(servidor):
    """Cualquier equipo de la red leia fotos, audios y el presupuesto con solo
    saber la URL: `/assets/` estaba abierto entero."""
    import urllib.error
    import urllib.request

    base, data_dir = servidor
    session = entrar(base, data_dir)

    class SinSalto(urllib.request.HTTPRedirectHandler):
        def redirect_request(self, *a, **k):
            return None

    abrir = urllib.request.build_opener(SinSalto).open

    def estado(ruta, token=None):
        req = urllib.request.Request(base + ruta)
        if token:
            req.add_header("Authorization", "Bearer " + token)
        try:
            with abrir(req, timeout=6) as resp:
                return resp.status
        except urllib.error.HTTPError as exc:
            return exc.code

    privadas = ("/budget/budget.json", "/research/claims.json",
                "/assets/logo_rally_latam.png")
    for ruta in privadas:
        assert estado(ruta) in (302, 401, 404), ruta

    # Con sesion abierta si se sirven: el candado es la sesion, no el borrado.
    assert estado("/assets/logo_rally_latam.png", session) == 200
    assert estado("/budget/budget.json", session) == 200


def test_solicitud_pendiente_no_ve_nada_hasta_aprobar(servidor):
    """El enlace se puede reenviar: sin aprobacion del admin no se entra."""
    base, _ = servidor
    boot = bootstrap(base, "equipo01", "Ana")
    member = claim(base, boot["join_token"], "Luis")
    assert member["pending"] is True

    status, _, _ = call("GET", base + "/api/sections?project=equipo01",
                        headers=auth(member["session"]))
    assert status == 401

    status, _, _ = call("GET", base + "/api/session?project=equipo01",
                        headers=auth(member["session"]))
    assert status == 401

    # Solo el admin aprueba; un pendiente no puede aprobarse a si mismo.
    status, _, _ = call(
        "POST",
        base + "/api/members/" + member["member"]["id"] + "/approve?project=equipo01",
        {"approved": True}, headers=auth(member["session"]),
    )
    assert status == 401

    approve(base, "equipo01", member["member"]["id"], boot["admin_token"])
    status, body, _ = call("GET", base + "/api/sections?project=equipo01",
                           headers=auth(member["session"]))
    assert status == 200


def test_panico_cierra_todas_las_sesiones(servidor):
    """Un toque del admin y nadie queda dentro, ni el mismo admin."""
    base, _ = servidor
    boot = bootstrap(base, "equipo01", "Ana")
    member = claim(base, boot["join_token"], "Luis")
    approve(base, "equipo01", member["member"]["id"], boot["admin_token"])

    status, _, _ = call("GET", base + "/api/sections?project=equipo01",
                        headers=auth(member["session"]))
    assert status == 200

    status, body, _ = call("POST", base + "/api/admin/panic?project=equipo01", {},
                           headers=auth(boot["admin_token"]))
    assert status == 200, body
    assert body["cerradas"] >= 1

    status, _, _ = call("GET", base + "/api/sections?project=equipo01",
                        headers=auth(member["session"]))
    assert status == 401
    status, _, _ = call("GET", base + "/api/sections?project=equipo01",
                        headers=auth(boot["admin_token"]))
    assert status == 401


def test_solo_admin_aprieta_el_panico(servidor):
    base, _ = servidor
    boot = bootstrap(base, "equipo01", "Ana")
    member = claim(base, boot["join_token"], "Luis")
    approve(base, "equipo01", member["member"]["id"], boot["admin_token"])
    status, _, _ = call("POST", base + "/api/admin/panic?project=equipo01", {},
                        headers=auth(member["session"]))
    assert status in (401, 403)
