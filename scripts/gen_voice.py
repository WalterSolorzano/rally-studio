#!/usr/bin/env python3
"""
gen_voice.py -- Sintetizador de voz adaptativo para el video pitch (<= 120s).
Selecciona automaticamente entre los dos motores principales segun hardware:
1. Chatterbox TTS (si hay GPU VRAM >= 4GB con CUDA, control de emocion).
2. Kokoro TTS (ligero, Apache 2.0, CPU o GPU modesta).
Fallback de emergencia: edge-tts o generador de tono/guia WAV estandar.
"""
import json
import pathlib
import subprocess
import sys
import io
import re

if sys.platform == "win32":
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")

BRIEF_PATH = pathlib.Path("brief.json")
NARRATION_PATH = pathlib.Path("script/narration.txt")
OUT_DIR = pathlib.Path("assets/voice")
OUT_MP3 = OUT_DIR / "narration.mp3"
OUT_WAV = OUT_DIR / "narration.wav"

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
        torchaudio.save(str(OUT_WAV), wav, model.sr)
        convert_wav_to_mp3()
        return True
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
            sf.write(str(OUT_WAV), full_audio, 24000)
            convert_wav_to_mp3()
            return True
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
            await communicate.save(str(OUT_MP3))
        asyncio.run(_run())
        if OUT_MP3.exists() and OUT_MP3.stat().st_size > 1000:
            return True
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
        
        with wave.open(str(OUT_WAV), 'w') as f:
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
        convert_wav_to_mp3()
        print(f"  NOTA: Generada pista de referencia tecnica ({duration_s}s) para edicion en {OUT_MP3}.")
        print("  Para habilitar voces neuronales humanas reales, instala:")
        print("    pip install kokoro soundfile numpy")
        print("    O bien: pip install edge-tts")
        return True
    except Exception as e:
        print(f"  ERROR al crear audio de emergencia: {e}")
        return False

def convert_wav_to_mp3():
    if not OUT_WAV.exists():
        return
    try:
        subprocess.run(["ffmpeg", "-y", "-i", str(OUT_WAV), "-b:a", "192k", str(OUT_MP3)],
                       stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=True)
    except Exception:
        # Si no hay ffmpeg, dejamos el WAV accesible
        pass

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

    if OUT_MP3.exists() or OUT_WAV.exists():
        target = OUT_MP3 if OUT_MP3.exists() else OUT_WAV
        print(f"\n  OK: Archivo de voz listo en {target}")
    else:
        print("\n  ERROR: No se pudo generar la pista de audio.")
        sys.exit(1)

if __name__ == "__main__":
    main()
