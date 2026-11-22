"""El instalador de la capa de agente (b) se prueba corriendo el .ps1 de verdad.

Cada caso arma un proyecto minimo en un directorio temporal (dos skills, el
script, requirements.txt y, si hace falta, un opencode.json) y ejecuta el
instalador con -SinDependencias -SinVerificarServidor: sin red y sin servidor.
"""
from __future__ import annotations

import json
import pathlib
import shutil
import subprocess
import sys

import pytest

RAIZ = pathlib.Path(__file__).resolve().parents[1]
SCRIPT = RAIZ / "scripts" / "setup_agente.ps1"

pytestmark = pytest.mark.skipif(
    sys.platform != "win32" or shutil.which("powershell") is None,
    reason="el instalador es de PowerShell sobre Windows",
)


def _proyecto(tmp_path: pathlib.Path, opencode: str | None = None) -> pathlib.Path:
    (tmp_path / "scripts").mkdir()
    shutil.copy2(SCRIPT, tmp_path / "scripts" / "setup_agente.ps1")
    (tmp_path / "requirements.txt").write_text("# vacio\n", encoding="utf-8")
    for nombre in ("uno", "dos"):
        skill = tmp_path / "skills" / nombre
        skill.mkdir(parents=True)
        (skill / "SKILL.md").write_text(f"# {nombre}\n", encoding="utf-8")
    if opencode is not None:
        (tmp_path / "opencode.json").write_text(opencode, encoding="utf-8")
    return tmp_path


def _correr(proyecto: pathlib.Path) -> subprocess.CompletedProcess:
    return subprocess.run(
        [
            "powershell", "-NoProfile", "-ExecutionPolicy", "Bypass",
            "-File", str(proyecto / "scripts" / "setup_agente.ps1"),
            "-SinDependencias", "-SinVerificarServidor",
        ],
        cwd=str(proyecto),
        capture_output=True,
        text=True,
        errors="replace",
        timeout=300,
    )


def _config(proyecto: pathlib.Path) -> dict:
    return json.loads((proyecto / "opencode.json").read_text(encoding="utf-8-sig"))


def test_sin_config_crea_playwright_habilitado_y_blender_apagado(tmp_path):
    proyecto = _proyecto(tmp_path)
    r = _correr(proyecto)
    assert r.returncode == 0, r.stdout + r.stderr
    cfg = _config(proyecto)
    assert cfg["$schema"] == "https://opencode.ai/config.json"
    assert cfg["mcp"]["playwright"]["enabled"] is True
    assert cfg["mcp"]["playwright"]["command"] == ["npx", "-y", "@playwright/mcp"]
    assert cfg["mcp"]["blender-mcp"]["enabled"] is False


def test_las_skills_quedan_en_los_dos_destinos(tmp_path):
    proyecto = _proyecto(tmp_path)
    _correr(proyecto)
    for destino in (".opencode", ".agents"):
        for nombre in ("uno", "dos"):
            assert (proyecto / destino / "skills" / nombre / "SKILL.md").exists()


def test_correr_dos_veces_no_cambia_el_archivo(tmp_path):
    proyecto = _proyecto(tmp_path)
    _correr(proyecto)
    primero = (proyecto / "opencode.json").read_bytes()
    r = _correr(proyecto)
    assert r.returncode == 0, r.stdout + r.stderr
    assert (proyecto / "opencode.json").read_bytes() == primero
    assert "ya declarado y habilitado" in r.stdout


def test_mcp_null_no_revienta_y_queda_un_objeto(tmp_path):
    proyecto = _proyecto(tmp_path, '{"mcp": null}')
    r = _correr(proyecto)
    assert r.returncode == 0, r.stdout + r.stderr
    assert "Add-Member" not in r.stdout + r.stderr
    assert "no era un objeto" in r.stdout
    assert _config(proyecto)["mcp"]["playwright"]["enabled"] is True


def test_mcp_que_no_es_objeto_se_reemplaza(tmp_path):
    proyecto = _proyecto(tmp_path, '{"mcp": "viejo"}')
    r = _correr(proyecto)
    assert r.returncode == 0, r.stdout + r.stderr
    assert "no era un objeto" in r.stdout
    assert isinstance(_config(proyecto)["mcp"], dict)


def test_json_invalido_avisa_sin_traceback(tmp_path):
    proyecto = _proyecto(tmp_path, '{"mcp": {')
    r = _correr(proyecto)
    assert r.returncode == 1
    salida = r.stdout + r.stderr
    assert "no es JSON valido" in salida
    assert "borralo" in salida
    assert "ConvertFrom-Json" not in salida
    # y no inventa un archivo a medias
    assert (proyecto / "opencode.json").read_text(encoding="utf-8") == '{"mcp": {'


def test_playwright_apagado_se_habilita_y_blender_se_apaga(tmp_path):
    proyecto = _proyecto(tmp_path, json.dumps({
        "mcp": {
            "playwright": {"type": "local", "command": ["npx", "-y", "@playwright/mcp"], "enabled": False},
            "blender-mcp": {"type": "local", "command": ["uvx", "blender-mcp"], "enabled": True},
        }
    }))
    r = _correr(proyecto)
    assert r.returncode == 0, r.stdout + r.stderr
    cfg = _config(proyecto)
    assert cfg["mcp"]["playwright"]["enabled"] is True
    assert cfg["mcp"]["blender-mcp"]["enabled"] is False


def test_los_mcps_que_ya_existian_no_desaparecen(tmp_path):
    proyecto = _proyecto(tmp_path, json.dumps({
        "model": "opencode-go/deepseek-v4.1-flash",
        "nota": "Configuración del equipo",
        "mcp": {"supabase": {"type": "local", "command": ["npx", "-y", "supabase-mcp"], "enabled": True}},
    }))
    _correr(proyecto)
    cfg = _config(proyecto)
    assert cfg["model"] == "opencode-go/deepseek-v4.1-flash"
    assert cfg["nota"] == "Configuración del equipo"
    assert cfg["mcp"]["supabase"]["enabled"] is True
    assert set(cfg["mcp"]) == {"supabase", "playwright", "blender-mcp"}
