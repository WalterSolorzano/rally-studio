#!/usr/bin/env python3
"""Construye la app Android de Rally Studio sin Gradle.

Uso:
    python apk/build.py                                  # plantilla (pide la dirección al abrir)
    python apk/build.py --url http://192.168.1.50:8000/   # app ya apuntando a un servidor
    python apk/build.py --url https://mi-sitio/ --salida Rally-prueba.apk

Necesita: JDK 17 o superior y el Android SDK (build-tools + un platform).
Busca el SDK en ANDROID_HOME, ANDROID_SDK_ROOT o %LOCALAPPDATA%\\Android\\Sdk.

El resultado queda en apk/build/. Nada de lo compilado se versiona: el
repositorio guarda solo el código, y cada equipo compila su propia app.
"""

from __future__ import annotations

import argparse
import json
import os
import shutil
import subprocess
import sys
import zipfile
from pathlib import Path

APK_DIR = Path(__file__).resolve().parent
APP_DIR = APK_DIR / "app"
BUILD_DIR = APK_DIR / "build"


def morir(mensaje: str) -> None:
    print("ERROR: " + mensaje, file=sys.stderr)
    raise SystemExit(1)


def buscar_sdk() -> Path:
    candidatos = []
    for clave in ("ANDROID_HOME", "ANDROID_SDK_ROOT"):
        valor = os.environ.get(clave)
        if valor:
            candidatos.append(Path(valor))
    local = os.environ.get("LOCALAPPDATA")
    if local:
        candidatos.append(Path(local) / "Android" / "Sdk")
    candidatos.append(Path.home() / "Android" / "Sdk")
    for ruta in candidatos:
        if (ruta / "build-tools").is_dir() and (ruta / "platforms").is_dir():
            return ruta
    morir("no encuentro el Android SDK. Define ANDROID_HOME.")


def version_mas_alta(carpeta: Path) -> Path:
    def clave(ruta: Path) -> list:
        partes = []
        for trozo in ruta.name.replace("-", ".").split("."):
            partes.append(int(trozo) if trozo.isdigit() else 0)
        return partes

    opciones = [p for p in carpeta.iterdir() if p.is_dir()]
    if not opciones:
        morir(f"{carpeta} está vacío: instala build-tools y un platform con sdkmanager.")
    return sorted(opciones, key=clave)[-1]


def herramienta(carpeta: Path, nombre: str) -> Path:
    for sufijo in (".exe", ".bat", ""):
        ruta = carpeta / (nombre + sufijo)
        if ruta.exists():
            return ruta
    morir(f"falta {nombre} en {carpeta}")


def buscar_java() -> tuple[Path, Path]:
    javac = shutil.which("javac")
    keytool = shutil.which("keytool")
    if javac and keytool:
        return Path(javac), Path(keytool)
    casa = os.environ.get("JAVA_HOME")
    if casa:
        base = Path(casa) / "bin"
        if (base / "javac.exe").exists():
            return base / "javac.exe", base / "keytool.exe"
    morir("no encuentro javac. Instala un JDK 17+ o define JAVA_HOME.")


def correr(comando: list, cwd: Path | None = None) -> None:
    resultado = subprocess.run(
        [str(p) for p in comando],
        cwd=str(cwd) if cwd else None,
        capture_output=True,
        text=True,
        encoding="utf-8",
        errors="replace",
    )
    if resultado.returncode != 0:
        print(" ".join(str(p) for p in comando), file=sys.stderr)
        print(resultado.stdout, file=sys.stderr)
        print(resultado.stderr, file=sys.stderr)
        morir("falló el paso anterior")


def escribir_config(destino: Path, url: str) -> None:
    """Reemplaza config.xml conservando el nombre que ve el teléfono."""
    nombre = "Rally"
    if destino.exists():
        for linea in destino.read_text(encoding="utf-8").splitlines():
            if 'name="app_name"' in linea and ">" in linea:
                nombre = linea.split(">", 1)[1].split("<", 1)[0] or nombre
                break
    texto = (
        '<?xml version="1.0" encoding="utf-8"?>\n'
        "<resources>\n"
        '    <string name="app_name">%s</string>\n'
        '    <string name="app_url" translatable="false">%s</string>\n'
        "</resources>\n" % (nombre, url)
    )
    destino.write_text(texto, encoding="utf-8")


def llave_debug(keytool: Path) -> Path:
    llave = BUILD_DIR / "debug.keystore"
    if llave.exists():
        return llave
    correr([
        keytool, "-genkeypair", "-keystore", llave, "-alias", "rally",
        "-storepass", "android", "-keypass", "android",
        "-keyalg", "RSA", "-keysize", "2048", "-validity", "10000",
        "-dname", "CN=Rally Studio, OU=App, O=Rally, L=Managua, C=NI",
    ])
    return llave


def main(argv=None) -> int:
    parser = argparse.ArgumentParser(description="Compila la app Android de Rally Studio")
    parser.add_argument("--url", default="", help="dirección del tablero; vacío = plantilla que la pide al abrir")
    parser.add_argument("--salida", default="", help="nombre del APK (por defecto Rally.apk)")
    args = parser.parse_args(argv)

    sdk = buscar_sdk()
    build_tools = version_mas_alta(sdk / "build-tools")
    platform = version_mas_alta(sdk / "platforms")
    android_jar = platform / "android.jar"
    if not android_jar.exists():
        morir(f"no encuentro {android_jar}")

    aapt2 = herramienta(build_tools, "aapt2")
    d8 = herramienta(build_tools, "d8")
    zipalign = herramienta(build_tools, "zipalign")
    apksigner = herramienta(build_tools, "apksigner")
    javac, keytool = buscar_java()

    print(f"SDK      {sdk}")
    print(f"build    {build_tools.name}   platform {platform.name}")

    trabajo = BUILD_DIR / "work"
    if trabajo.exists():
        shutil.rmtree(trabajo)
    shutil.copytree(APP_DIR, trabajo)

    url = args.url.strip()
    if url:
        escribir_config(trabajo / "res" / "values" / "config.xml", url)
        print(f"url      {url}")
    else:
        print("url      (la pide el teléfono al abrir)")

    gen = trabajo / "gen"
    gen.mkdir(parents=True, exist_ok=True)
    recursos = BUILD_DIR / "recursos.zip"
    correr([aapt2, "compile", "--dir", trabajo / "res", "-o", recursos])

    sin_firmar = BUILD_DIR / "sin-firmar.apk"
    correr([
        aapt2, "link", "-o", sin_firmar,
        "-I", android_jar,
        "--manifest", trabajo / "AndroidManifest.xml",
        "-R", recursos,
        "--java", gen,
        "--min-sdk-version", "24",
        "--target-sdk-version", "35",
        "--version-code", "1",
        "--version-name", "1.0",
        "--auto-add-overlay",
    ])

    fuentes = sorted(str(p) for p in (trabajo / "java").rglob("*.java"))
    generadas = sorted(str(p) for p in gen.rglob("*.java"))
    clases = BUILD_DIR / "clases"
    if clases.exists():
        shutil.rmtree(clases)
    clases.mkdir(parents=True)
    correr([javac, "--release", "11", "-nowarn", "-encoding", "UTF-8",
            "-cp", android_jar, "-d", clases] + fuentes + generadas)

    dex = BUILD_DIR / "dex"
    if dex.exists():
        shutil.rmtree(dex)
    dex.mkdir(parents=True)
    correr([d8, "--min-api", "24", "--lib", android_jar, "--output", dex]
           + sorted(str(p) for p in clases.rglob("*.class")))

    con_dex = BUILD_DIR / "con-dex.apk"
    shutil.copy2(sin_firmar, con_dex)
    with zipfile.ZipFile(con_dex, "a", zipfile.ZIP_DEFLATED) as paquete:
        paquete.write(dex / "classes.dex", "classes.dex")

    alineado = BUILD_DIR / "alineado.apk"
    correr([zipalign, "-f", "4", con_dex, alineado])

    llave = llave_debug(keytool)
    nombre = args.salida or "Rally.apk"
    if not nombre.lower().endswith(".apk"):
        nombre += ".apk"
    # `--salida` puede venir con ruta (absoluta o relativa al directorio actual):
    # si no, el APK queda junto al resto de la compilación.
    destino = Path(nombre)
    final = destino if destino.is_absolute() else (BUILD_DIR / destino)
    final.parent.mkdir(parents=True, exist_ok=True)
    correr([
        apksigner, "sign",
        "--ks", llave, "--ks-pass", "pass:android", "--key-pass", "pass:android",
        "--ks-key-alias", "rally",
        "--out", final, alineado,
    ])
    correr([apksigner, "verify", "--print-certs", final])

    tamano = final.stat().st_size
    print(f"\nlisto: {final}  ({tamano / 1024:.0f} KB)")
    print(json.dumps({"apk": str(final), "bytes": tamano, "url": url or "ADDR"}, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
