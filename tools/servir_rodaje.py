#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""Sirve el plan de rodaje en la red local para abrirlo desde el telefono.

Uso:
    python tools/servir_rodaje.py            # puerto 8080
    python tools/servir_rodaje.py -p 9000

Cero costo, cero cuentas, cero tienda: la PC es el servidor. Cada vez que se
regenera script/teleprompter.html, el telefono ve la version nueva al recargar.
"""
from __future__ import annotations

import argparse
import http.server
import io
import socket
import socketserver
import sys
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent


def _utf8() -> None:
    if hasattr(sys.stdout, "buffer"):
        sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")


def ip_local() -> str:
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        s.connect(("8.8.8.8", 80))
        return s.getsockname()[0]
    except OSError:
        return "127.0.0.1"
    finally:
        s.close()


class Manejador(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *a, **kw):
        super().__init__(*a, directory=str(RAIZ), **kw)

    def end_headers(self):
        # sin cache: el telefono siempre ve lo ultimo que escribio la PC
        self.send_header("Cache-Control", "no-store, must-revalidate")
        super().end_headers()

    def log_message(self, fmt, *args):
        print("  " + fmt % args)


def main() -> int:
    _utf8()
    ap = argparse.ArgumentParser(description="Plan de rodaje por la red local")
    ap.add_argument("-p", "--puerto", type=int, default=8080)
    args = ap.parse_args()

    ip = ip_local()
    html = RAIZ / "script" / "teleprompter.html"
    pdf = RAIZ / "script" / "guion_rodaje.pdf"

    print("PC: " + ip)
    print("Telefono, misma wifi, abrir:")
    print("  http://%s:%d/script/teleprompter.html" % (ip, args.puerto))
    if pdf.exists():
        print("  http://%s:%d/script/guion_rodaje.pdf" % (ip, args.puerto))
    if not html.exists():
        print("  ! falta script/teleprompter.html: corre gen_teleprompter.py")
    print("Cortar: Ctrl+C. La pagina se actualiza al recargar, no hay que reinstalar.")

    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.ThreadingTCPServer(("0.0.0.0", args.puerto), Manejador) as srv:
        try:
            srv.serve_forever()
        except KeyboardInterrupt:
            print("\nfin")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
