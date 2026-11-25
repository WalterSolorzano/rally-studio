#!/usr/bin/env python3
"""
publish_site.py -- Script de publicacion y despliegue para la web demo en Netlify CLI o GitHub Pages.
"""
import subprocess
import shutil
import pathlib
import sys
from comun import utf8
utf8()

SITE_DIR = pathlib.Path("site")

# El sitio publicado no puede depender de brand/: tokens y fuentes viven dentro de site/.
PROHIBIDO_EN_SITE = ("../brand", "brand/tokens.css", "fonts.googleapis.com", "fonts.gstatic.com")


def autocontenido() -> list[str]:
    """Devuelve los enlaces externos o hacia brand/ que rompen el sitio publicado."""
    fallos: list[str] = []
    for archivo in SITE_DIR.rglob("*"):
        if archivo.suffix not in {".html", ".css"}:
            continue
        if "diseno" in archivo.parts:
            continue  # kit del sistema: no se publica como pieza del proyecto
        texto = archivo.read_text(encoding="utf-8", errors="replace")
        for marca in PROHIBIDO_EN_SITE:
            if marca in texto:
                fallos.append(f"{archivo.as_posix()}: {marca}")
    return fallos


def main():
    if not (SITE_DIR / "index.html").exists():
        print("ERROR: site/index.html no existe.")
        sys.exit(1)

    rotos = autocontenido()
    if rotos:
        print("ERROR: el sitio no es autocontenido; arregla antes de publicar:")
        for roto in rotos:
            print("  - " + roto)
        sys.exit(1)
    print("OK: site/ autocontenido (tokens y fuentes dentro, cero CDN)")

    print("\n" + "═" * 60)
    print("  RALLY STUDIO -- PUBLICACION DE LA WEB DEMO")
    print("═" * 60)

    # 1. Chequeo de Netlify CLI
    netlify_bin = shutil.which("netlify")
    if netlify_bin:
        print("  Detectado Netlify CLI. Iniciando despliegue de produccion...")
        try:
            res = subprocess.run([netlify_bin, "deploy", "--prod", f"--dir={SITE_DIR}"], check=True)
            print("  OK: Despliegue en Netlify completado exitosamente.")
            return
        except Exception as e:
            print(f"  WARN: Error al desplegar con Netlify: {e}")

    # 2. Alternativa GitHub Pages
    print("  INFO: Netlify CLI no disponible localmente o no autenticado.")
    print("  Para desplegar gratis en GitHub Pages:")
    print("  1. Haz commit de la carpeta 'site/'.")
    print("  2. Empuja los cambios al repositorio de GitHub: git push origin main")
    print("  3. El workflow .github/workflows/publish.yml publicara automaticamente tu sitio.")
    print(f"\n  Vista previa local disponible abriendo directamente: {SITE_DIR.resolve() / 'index.html'}")

if __name__ == "__main__":
    main()
