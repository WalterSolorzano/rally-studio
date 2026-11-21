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
         "--directo", "--actor-id", "pautador",
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


def test_directo_sin_actor_id_es_rechazado(servidor, tmp_path):
    base, data_dir = servidor
    boot = bootstrap(base, "equipo01", "Ana")
    payload = tmp_path / "p.json"
    payload.write_text(json.dumps({"text": "Sin firma"}), encoding="utf-8")
    env = {k: v for k, v in os.environ.items() if k != "RALLY_ACTOR_ID"}
    env["RALLY_DATA_DIR"] = str(data_dir)
    out = subprocess.run(
        [sys.executable, "scripts/servir_propuesta.py",
         "--tab", "pautado", "--slot", "problema", "--kind", "text",
         "--title", "T", "--payload", str(payload),
         "--server", base, "--project", "equipo01",
         "--token", boot["admin_token"], "--directo"],
        cwd=str(REPO_ROOT), capture_output=True, text=True, encoding="utf-8",
        timeout=30, env=env,
    )
    assert out.returncode == 6, out.stderr
    assert "actor-id" in out.stderr


def test_simulado_directo_sin_actor_cae_al_buzon(servidor, tmp_path):
    """--simulated nunca escribe directo: la falta de firma no aplica."""
    base, data_dir = servidor
    boot = bootstrap(base, "equipo01", "Ana")
    payload = tmp_path / "p.json"
    payload.write_text(json.dumps({"text": "Simulado"}), encoding="utf-8")
    env = {k: v for k, v in os.environ.items() if k != "RALLY_ACTOR_ID"}
    env["RALLY_DATA_DIR"] = str(data_dir)
    out = subprocess.run(
        [sys.executable, "scripts/servir_propuesta.py",
         "--tab", "pautado", "--slot", "problema", "--kind", "text",
         "--title", "T", "--payload", str(payload),
         "--server", base, "--project", "equipo01",
         "--token", boot["admin_token"], "--directo", "--simulated"],
        cwd=str(REPO_ROOT), capture_output=True, text=True, encoding="utf-8",
        timeout=30, env=env,
    )
    assert out.returncode == 0, out.stderr
    assert len(list((data_dir / "content").glob("*.json"))) == 1


def test_el_sobre_del_buzon_firma_al_autor(tmp_path, monkeypatch):
    payload = tmp_path / "p.json"
    payload.write_text(json.dumps({"text": "Firmado"}), encoding="utf-8")
    monkeypatch.setenv("RALLY_DATA_DIR", str(tmp_path / "datos"))
    codigo = main([
        "--tab", "pautado", "--slot", "problema", "--kind", "text",
        "--title", "T", "--payload", str(payload),
        "--actor", "presupuestador", "--actor-id", "presupuestador",
    ])
    assert codigo == 0
    sobres = list((tmp_path / "datos" / "content").glob("*.json"))
    env = json.loads(sobres[0].read_text(encoding="utf-8"))
    assert env["actor"] == "presupuestador"
    assert env["actor_id"] == "presupuestador"


def test_payload_que_no_es_objeto_se_rechaza(tmp_path, monkeypatch, capsys):
    """Un array no se envuelve en {"value": ...}: el sobre lo rechaza."""
    payload = tmp_path / "p.json"
    payload.write_text(json.dumps([1, 2]), encoding="utf-8")
    monkeypatch.setenv("RALLY_DATA_DIR", str(tmp_path / "datos"))
    codigo = main([
        "--tab", "pautado", "--slot", "problema", "--kind", "text",
        "--title", "T", "--payload", str(payload),
    ])
    assert codigo == 1
    assert "payload debe ser un objeto" in capsys.readouterr().err
    assert not (tmp_path / "datos" / "content").exists()
