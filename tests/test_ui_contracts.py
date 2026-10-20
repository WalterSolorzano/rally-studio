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
