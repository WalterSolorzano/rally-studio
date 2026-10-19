#!/usr/bin/env python3
"""
gen_voice.py -- Sintetizador de voz adaptativo para el video pitch (<= 120s).
Selecciona automaticamente entre los dos motores principales segun hardware:
1. Chatterbox TTS (si hay GPU VRAM >= 4GB con CUDA, control de emocion).
2. Kokoro TTS (ligero, Apache 2.0, CPU o GPU modesta).
Fallback de emergencia: edge-tts o generador de tono/guia WAV estandar.

La entrega oficial es assets/voice/narration.mp4 (MP4 con audio AAC, sin video).
Los motores generan WAV/MP3 temporales y se transcodifican con ffmpeg.
"""
import json
import pathlib
import shutil
import subprocess
import sys
import io
import os

if sys.platform == "win32":
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")

BRIEF_PATH = pathlib.Path("brief.json")
NARRATION_PATH = pathlib.Path("script/narration.txt")
OUT_DIR = pathlib.Path("assets/voice")
OUT_MP4 = OUT_DIR / "narration.mp4"
TMP_MP3 = OUT_DIR / "narration.tmp.mp3"
TMP_WAV = OUT_DIR / "narration.tmp.wav"


def find_ffmpeg():
    """Localiza ffmpeg sin depender de que este en el PATH."""
    candidates = [
        os.environ.get("FFMPEG_BINARY"),
        shutil.which("ffmpeg"),
        r"C:\Program Files\Agent\dlls\x64\ffmpeg.exe",
        r"C:\ffmpeg\bin\ffmpeg.exe",
        str(pathlib.Path.home() / "AppData/Local/Microsoft/WinGet/Links/ffmpeg.exe"),
    ]
    for candidate in candidates:
        if candidate and pathlib.Path(candidate).exists():
            return candidate
    return None


def convert_to_mp4(source):
    """Convierte WAV/MP3 a MP4 con audio AAC. Devuelve True si la entrega existe."""
    ffmpeg = find_ffmpeg()
    if not ffmpeg:
        print("  ERROR: ffmpeg no esta instalado. Instala ffmpeg o define FFMPEG_BINARY.")
        return False
    if not pathlib.Path(source).exists():
        print(f"  ERROR: no existe el audio temporal {source}.")
        return False
    cmd = [
        ffmpeg, "-y", "-i", str(source), "-vn",
        "-c:a", "aac", "-b:a", "192k", "-ar", "48000", "-ac", "1",
        "-movflags", "+faststart", "-f", "mp4", str(OUT_MP4),
    ]
    result = subprocess.run(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.PIPE)
    if result.returncode != 0 or not OUT_MP4.exists():
        print("  ERROR: ffmpeg no pudo crear narration.mp4.")
        print(result.stderr.decode("utf-8", errors="replace")[-600:])
        return False
    return True

def get_clean_narration_text():
    if not NARRATION_PATH.exists():
        print(f"ERROR: {NARRATION_PATH} no existe. Ejecuta python scripts/gen_script.py primero.")
        sys.exit(1)
    raw = NARRATION_PATH.read_text(encoding="utf-8")
    # Remover encabezados de tiempo como [A1 - 0:00 - 0:20]
    clean_lines = []
    for line in raw.splitlines():
        line = line.strip()
        if line.startswith("[") and line.endswith("]"):
            continue
        if line:
            clean_lines.append(line)
    return " ".join(clean_lines)

def try_chatterbox(text, vram):
    print("  Intentando sintesis con Chatterbox TTS (emocion y presencia)...")
    try:
        from chatterbox.tts import ChatterboxTTS
        import torch
        import torchaudio
        device = "cuda" if (vram >= 4 and torch.cuda.is_available()) else "cpu"
        model = ChatterboxTTS.from_pretrained(device=device)
        wav = model.generate(text, exps=0.8, cfg_weight=0.45)
        torchaudio.save(str(TMP_WAV), wav, model.sr)
        return convert_to_mp4(TMP_WAV)
    except ImportError:
        print("  INFO: Chatterbox no esta instalado en este entorno.")
        return False
    except Exception as e:
        print(f"  WARN: Chatterbox fallo durante la ejecucion: {e}")
        return False

def try_kokoro(text):
    print("  Intentando sintesis con Kokoro TTS (modelo rapido y natural)...")
    try:
        from kokoro import KPipeline
        import soundfile as sf
        import numpy as np
        pipeline = KPipeline(lang_code="e")
        generator = pipeline(text, voice="ef_dora", speed=0.92, split_pattern=r"\n+")
        chunks = [audio for _, _, audio in generator]
        if chunks:
            full_audio = np.concatenate(chunks)
            sf.write(str(TMP_WAV), full_audio, 24000)
            return convert_to_mp4(TMP_WAV)
        return False
    except ImportError:
        print("  INFO: Kokoro no esta instalado en este entorno.")
        return False
    except Exception as e:
        print(f"  WARN: Kokoro fallo: {e}")
        return False

def try_edge_tts(text):
    print("  Intentando sintesis con Edge TTS (motor neural)...")
    try:
        import edge_tts
        import asyncio
        async def _run():
            communicate = edge_tts.Communicate(text, "es-NI-FedericoNeural")
            await communicate.save(str(TMP_MP3))
        asyncio.run(_run())
        if TMP_MP3.exists() and TMP_MP3.stat().st_size > 1000:
            return convert_to_mp4(TMP_MP3)
        return False
    except ImportError:
        print("  INFO: edge-tts no esta instalado.")
        return False
    except Exception as e:
        print(f"  WARN: edge-tts fallo: {e}")
        return False

def generate_emergency_mock_wav(text):
    """Genera una pista WAV silenciosa o de referencia para no detener el pipeline si no hay motor TTS instalado."""
    print("  Generando pista de audio guia (metronomo / referencia de duracion)...")
    try:
        import wave
        import struct
        import math
        sample_rate = 22050
        # Duracion proporcional al texto: ~135 palabras por minuto
        words = len(text.split())
        duration_s = min(max(int((words / 135) * 60), 20), 120)
        num_samples = duration_s * sample_rate
        
        with wave.open(str(TMP_WAV), 'w') as f:
            f.setnchannels(1)
            f.setsampwidth(2)
            f.setframerate(sample_rate)
            # Tono muy sutil cada segundo (metronomo guia)
            for i in range(num_samples):
                t = i / sample_rate
                val = 0
                if (i % sample_rate) < 1500: # bip breve al inicio de cada segundo
                    val = int(800 * math.sin(2 * math.pi * 440 * t))
                f.writeframes(struct.pack('<h', val))
        if not convert_to_mp4(TMP_WAV):
            return False
        print(f"  NOTA: Generada pista de referencia tecnica ({duration_s}s) en {OUT_MP4}.")
        print("  Para habilitar voces neuronales humanas reales, instala:")
        print("    pip install kokoro soundfile numpy")
        print("    O bien: pip install edge-tts")
        return True
    except Exception as e:
        print(f"  ERROR al crear audio de emergencia: {e}")
        return False

def main():
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    brief = json.loads(BRIEF_PATH.read_text(encoding="utf-8")) if BRIEF_PATH.exists() else {}
    vram = float(brief.get("pc_gpu_vram_gb", 0))

    text = get_clean_narration_text()
    word_count = len(text.split())
    print("\n" + "═" * 60)
    print("  MOTOR DE SINTESIS DE VOZ Y LOCUCION (RALLY STUDIO)")
    print("═" * 60)
    print(f"  Texto a sintetizar: {word_count} palabras.")
    print(f"  Recursos detectados: GPU VRAM = {vram} GB.")

    success = False
    if vram >= 4:
        success = try_chatterbox(text, vram) or try_kokoro(text) or try_edge_tts(text)
    else:
        success = try_kokoro(text) or try_edge_tts(text) or try_chatterbox(text, vram)

    if not success:
        generate_emergency_mock_wav(text)

    if OUT_MP4.exists():
        for temp in (TMP_WAV, TMP_MP3):
            if temp.exists():
                temp.unlink()
        size_mb = OUT_MP4.stat().st_size / (1024 * 1024)
        print(f"\n  OK: Locucion MP4 (AAC) lista en {OUT_MP4} ({size_mb:.2f} MB)")
    else:
        print("\n  ERROR: No se pudo generar la locucion en MP4.")
        sys.exit(1)

if __name__ == "__main__":
    main()
