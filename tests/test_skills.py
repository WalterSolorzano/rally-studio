from pathlib import Path

import pytest

NUCLEO = [
    "contexto-rally",
    "guiar-usuario",
    "servir-a-ventana",
    "ingestar-investigacion",
    "auditar-entregable",
]


@pytest.mark.parametrize("nombre", NUCLEO)
def test_skill_has_valid_frontmatter(nombre):
    texto = Path(f"skills/{nombre}/SKILL.md").read_text(encoding="utf-8")
    assert texto.startswith("---")
    cabecera = texto.split("---")[1]
    assert "name:" in cabecera and "description:" in cabecera


@pytest.mark.parametrize("nombre", NUCLEO)
def test_skill_is_short(nombre):
    assert len(Path(f"skills/{nombre}/SKILL.md").read_bytes()) <= 8_000
