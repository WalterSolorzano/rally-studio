from pathlib import Path

DASH = Path(__file__).resolve().parent.parent / "dashboard"


def test_join_page_has_name_field_and_claim_endpoint():
    html = (DASH / "join.html").read_text(encoding="utf-8")
    js = (DASH / "join.js").read_text(encoding="utf-8")
    assert 'id="join-name"' in html
    assert 'id="join-form"' in html
    assert "/api/project/claim" in js
    assert "rally_session_token" in js
    assert "rally_project" in js


def test_section_sync_sends_session_and_project():
    js = (DASH / "section_sync.js").read_text(encoding="utf-8")
    assert "Authorization" in js
    assert "rally_session_token" in js
    assert "rally_project" in js
    assert "POLL_MS = 1000" in js
    assert "accessRevoked" in js


def test_section_sync_blocks_seeding_for_plain_members():
    js = (DASH / "section_sync.js").read_text(encoding="utf-8")
    assert '"operator"' in js and '"admin"' in js
    assert "sections/import" in js


def test_admin_page_has_member_and_invite_controls():
    html = (DASH / "admin.html").read_text(encoding="utf-8")
    js = (DASH / "admin.js").read_text(encoding="utf-8")
    assert 'id="members-list"' in html
    assert 'id="create-invite"' in html
    assert "/api/members" in js
    assert "/api/invites" in js
    assert "/revoke" in js
