import json
import os
import subprocess
import sys

from scripts.servir_propuesta import _unir_valores, main, seccion_destino
from tests.support import REPO_ROOT, auth, bootstrap, call


def test_un_token_que_empieza_por_guion_no_se_confunde_con_una_bandera():
    """argparse lee `--token -abc` como dos opciones; el token es valido."""
    assert _unir_valores(["--token", "-abc"]) == ["--token=-abc"]
    assert _unir_valores(["--tab", "pautado", "--token", "-abc"]) == [
        "--tab=pautado", "--token=-abc"
    ]
    assert _unir_valores(["--simulated", "--token", "-abc"]) == [
        "--simulated", "--token=-abc"
    ]


def test_el_cli_acepta_un_token_que_empieza_por_guion(tmp_path, monkeypatch):
    payload = tmp_path / "propuesta.json"
    payload.write_text(json.dumps({"text": "Hola con guion"}), encoding="utf-8")
    monkeypatch.setenv("RALLY_DATA_DIR", str(tmp_path / "datos"))
    codigo = main([
        "--tab", "pautado", "--slot", "problema", "--kind", "text",
        "--title", "Problema", "--payload", str(payload),
        "--token", "-token-que-empieza-por-guion", "--simulated",
    ])
    assert codigo == 0


def test_mapeo_de_pestanas_a_secciones():
    assert seccion_destino("pautado", "problema") == "pautado.problema"
    assert seccion_destino("script", "acto2") == "script.acto2"
    assert seccion_destino("budget", "costos") == "budget"
    assert seccion_destino("resources", "main") == "resources"
    assert seccion_destino("timeline", "main") is None


def test_cli_escribe_directo_cuando_hay_token(servidor, tmp_path):
    base, data_dir = servidor
    boot = bootstrap(base, "equipo01", "Ana")
    payload = tmp_path / "propuesta.json"
    payload.write_text(json.dumps({"text": "Hola directo"}), encoding="utf-8")
    out = subprocess.run(
        [sys.executable, "scripts/servir_propuesta.py",
         "--tab", "pautado", "--slot", "problema", "--kind", "text",
         "--title", "Problema", "--payload", str(payload),
         "--directo",
         "--server", base, "--project", "equipo01", "--token", boot["admin_token"]],
        cwd=str(REPO_ROOT), capture_output=True, text=True, encoding="utf-8", timeout=30,
    )
    assert out.returncode == 0, out.stderr
    status, body, _ = call("GET", base + "/api/sections?project=equipo01",
                           headers=auth(boot["admin_token"]))
    assert status == 200
    assert body["sections"]["pautado.problema"]["data"] == "Hola directo"
    content_dir = data_dir / "content"
    assert not content_dir.exists() or not list(content_dir.glob("*.json"))


def test_sin_directo_escribe_buzon_aunque_haya_token(servidor, tmp_path):
    base, data_dir = servidor
    boot = bootstrap(base, "equipo01", "Ana")
    payload = tmp_path / "propuesta.json"
    payload.write_text(json.dumps({"text": "Hola buzon"}), encoding="utf-8")
    out = subprocess.run(
        [sys.executable, "scripts/servir_propuesta.py",
         "--tab", "pautado", "--slot", "problema", "--kind", "text",
         "--title", "Problema", "--payload", str(payload),
         "--server", base, "--project", "equipo01", "--token", boot["admin_token"]],
        cwd=str(REPO_ROOT), capture_output=True, text=True, encoding="utf-8", timeout=30,
        env={**os.environ, "RALLY_DATA_DIR": str(data_dir)},
    )
    assert out.returncode == 0, out.stderr
    assert len(list((data_dir / "content").glob("*.json"))) == 1
    status, body, _ = call("GET", base + "/api/sections?project=equipo01",
                           headers=auth(boot["admin_token"]))
    assert status == 200
    assert "pautado.problema" not in (body["sections"] or {})
