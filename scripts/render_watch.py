#!/usr/bin/env python3
"""
render_watch.py -- Monitor de recursos (RAM y GPU) en tiempo real.
Previene desbordamiento y congelamiento de la PC durante renders pesados (Blender / TTS / Video).
Tambien da turno al GPU: un solo render a la vez (regla 8 de AGENTS.md).
"""
import json
import os
import pathlib
import tempfile
import time

import psutil

from comun import utf8

utf8()

RAM_ALERT_THRESHOLD = 85.0  # 85% de RAM
RAM_PANIC_THRESHOLD = 92.0  # 92% de RAM
MAX_RENDER_MIN = 20.0       # si un render pasa de esto, no aporta: bajar calidad o cortar

# Regla 8 de AGENTS.md: un proceso GPU a la vez. El candado vive fuera del repo
# para que dos copias aisladas del workbench tambien compitan por el mismo GPU.
LOCK_RENDER = pathlib.Path(tempfile.gettempdir()) / "rally_render.lock"


def turno_de_render(etiqueta: str = "render") -> bool:
    """Reserva el GPU. False si otro render vivo ya lo tiene.

    Un candado con el pid de un proceso que ya murio no bloquea: se descarta y se
    toma el turno, para que una corrida cancelada no deje el GPU prohibido para siempre.
    """
    if LOCK_RENDER.exists():
        try:
            datos = json.loads(LOCK_RENDER.read_text(encoding="utf-8"))
            pid = int(datos.get("pid") or 0)
        except (OSError, ValueError):
            pid = 0
        if pid and psutil.pid_exists(pid):
            print(
                f"\n[TURNO] Ya hay un render en curso (pid {pid}, "
                f"{datos.get('etiqueta', '?')}). Espera a que termine."
            )
            return False
        LOCK_RENDER.unlink(missing_ok=True)
    try:
        fd = os.open(str(LOCK_RENDER), os.O_CREAT | os.O_EXCL | os.O_WRONLY)
    except FileExistsError:
        return False
    with os.fdopen(fd, "w", encoding="utf-8") as f:
        json.dump({"pid": os.getpid(), "etiqueta": etiqueta, "inicio": time.time()}, f)
    return True


def liberar_render() -> None:
    """Suelta el turno del GPU."""
    LOCK_RENDER.unlink(missing_ok=True)


def presupuesto_excedido(inicio: float, max_min: float = MAX_RENDER_MIN) -> bool:
    """True si el render ya consumio mas tiempo del que aporta al video."""
    transcurrido_min = (time.time() - inicio) / 60.0
    if transcurrido_min > max_min:
        print(
            f"\n[PRESUPUESTO] Render en {transcurrido_min:.0f} min (limite {max_min:.0f}). "
            "Baja muestras/resolucion o elimina la pieza: no aporta comprension."
        )
        return True
    return False

def check_resources(task_name="Proceso Pesado"):
    """Llamable desde scripts de render para verificar si es seguro proceder."""
    mem = psutil.virtual_memory()
    if mem.percent >= RAM_PANIC_THRESHOLD:
        print(f"\n[ALERTA ROJA] Memoria RAM al {mem.percent:.1f}%. Peligro inminente de cuelgue.")
        print(f"Pausando {task_name} por 15 segundos para liberar buffer...")
        time.sleep(15)
        return False
    elif mem.percent >= RAM_ALERT_THRESHOLD:
        print(f"\n[AVISO] Memoria RAM elevada ({mem.percent:.1f}%). Procediendo con precaucion.")
    return True

def monitor_loop(interval_s=5):
    print("\n" + "═" * 60)
    print("  RALLY STUDIO -- MONITOR DE SALUD Y RENDIMIENTO DEL SISTEMA")
    print("═" * 60)
    print(f"  CPU Cores: {psutil.cpu_count(logical=True)} | RAM Total: {psutil.virtual_memory().total / (1024**3):.1f} GB")
    print("  Presiona Ctrl + C para detener el monitor.\n")

    try:
        while True:
            mem = psutil.virtual_memory()
            cpu = psutil.cpu_percent(interval=1)
            used_gb = mem.used / (1024**3)
            total_gb = mem.total / (1024**3)
            
            status = "NORMAL"
            if mem.percent >= RAM_PANIC_THRESHOLD:
                status = "CRITICO (PAUSAR RENDERS)"
            elif mem.percent >= RAM_ALERT_THRESHOLD:
                status = "PRECAUCION"

            print(f"\r  [RAM: {mem.percent:4.1f}% ({used_gb:.1f}/{total_gb:.1f} GB)] [CPU: {cpu:4.1f}%] -> Estado: {status:<24}", end="", flush=True)
            time.sleep(interval_s)
    except KeyboardInterrupt:
        print("\n\nMonitor detenido.")

if __name__ == "__main__":
    monitor_loop()
