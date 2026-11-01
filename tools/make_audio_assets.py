#!/usr/bin/env python3
"""Genera la banda sonora y los SFX del video (100% sintesis DSP, sin samples de terceros).

Motivo: el repo no traia `assets/music/bed.mp3` ni `ambient.mp3` ni pistas con licencia.
En vez de bloquear la entrega, este script sintetiza dos camas (bed/ambient) y de ahi
deriva los tres cues y los SFX. Todo el material es original del proyecto: sin vocals,
sin licencias de terceros, reproducible bit a bit.

Uso:
    python tools/make_audio_assets.py            # todo
    python tools/make_audio_assets.py --only cues
    python tools/make_audio_assets.py --only beds
    python tools/make_audio_assets.py --only sfx

Salidas:
    assets/music/bed.mp3            4:48, 123 BPM, La menor, energia alta
    assets/music/ambient.mp3        5:00,  64 BPM, Re menor, energia baja, oscura
    assets/audio/cues/cue_01_tension.mp3     30 s  (-18 LUFS)
    assets/audio/cues/cue_02_drive.mp3       40 s  (-18 LUFS)
    assets/audio/cues/cue_02b_confidence.mp3 27 s  (-18 LUFS) variante filtrada
    assets/audio/cues/cue_03_resolve.mp3     35 s  (-18 LUFS)
    assets/audio/sfx/*.mp3
    assets/audio/manifest.json      duraciones, niveles medidos y hashes

Requiere: numpy, scipy, ffmpeg (en PATH o via --ffmpeg).
"""

from __future__ import annotations

import argparse
import hashlib
import json
import math
import os
import shutil
import subprocess
import sys
import tempfile
import wave
from pathlib import Path

import numpy as np
from scipy import signal
from scipy.io import wavfile

SR = 48_000
ROOT = Path(__file__).resolve().parent.parent
MUSIC = ROOT / "assets" / "music"
CUES = ROOT / "assets" / "audio" / "cues"
SFX = ROOT / "assets" / "audio" / "sfx"
MANIFEST = ROOT / "assets" / "audio" / "manifest.json"
CACHE = Path(tempfile.gettempdir()) / "rally_audio_beds.npz"

FFMPEG = os.environ.get("FFMPEG_BIN") or shutil.which("ffmpeg") or r"C:\Users\--X\Documents\rally-ganadores-2026\bin\ffmpeg.exe"

rng = np.random.default_rng(20261022)


# --------------------------------------------------------------------------- utils
def secs(t: float) -> int:
    return int(round(t * SR))


def db(x: float) -> float:
    return 10 ** (x / 20.0)


def t_axis(n: int) -> np.ndarray:
    return np.arange(n, dtype=np.float32) / SR


def noise(n: int) -> np.ndarray:
    return rng.standard_normal(n).astype(np.float32)


def pink(n: int) -> np.ndarray:
    """Ruido rosa por modelado espectral (1/sqrt(f)), normalizado a RMS 1 como noise()."""
    w = noise(n)
    spec = np.fft.rfft(w)
    f = np.fft.rfftfreq(n, 1 / SR)
    shape = np.ones_like(f)
    shape[1:] = 1.0 / np.sqrt(f[1:])
    shape /= shape.max()
    y = np.fft.irfft(spec * shape, n).astype(np.float32)
    return (y / (np.sqrt(np.mean(y ** 2)) + 1e-9)).astype(np.float32)


def sos(kind: str, freq, order: int = 2, gain_db: float = 0.0):
    if kind in ("lowpass", "highpass"):
        return signal.butter(order, freq, btype=kind, fs=SR, output="sos")
    if kind == "bandpass":
        return signal.butter(order, freq, btype="bandpass", fs=SR, output="sos")
    if kind == "peak":
        return signal.butter(order, freq, btype="peak", fs=SR, output="sos")
    raise ValueError(kind)


def filt(x: np.ndarray, kind: str, freq, order: int = 2) -> np.ndarray:
    return signal.sosfilt(sos(kind, freq, order), x).astype(np.float32)


def fade(x: np.ndarray, in_s: float = 0.0, out_s: float = 0.0) -> np.ndarray:
    n = len(x)
    y = x.copy()
    mult = (lambda a: a[:, None]) if y.ndim == 2 else (lambda a: a)
    if in_s > 0:
        k = min(secs(in_s), n)
        y[:k] *= mult(np.linspace(0, 1, k, dtype=np.float32) ** 1.5)
    if out_s > 0:
        k = min(secs(out_s), n)
        y[n - k:] *= mult(np.linspace(1, 0, k, dtype=np.float32) ** 1.5)
    return y


def env_exp(n: int, attack: float, decay: float) -> np.ndarray:
    """Envolvente ataque/decaimiento exponencial."""
    t = t_axis(n)
    a = np.clip(t / max(attack, 1e-4), 0, 1)
    a = a * a * (3 - 2 * a)  # smoothstep
    d = np.exp(-np.maximum(t - attack, 0) / max(decay, 1e-4))
    return (a * d).astype(np.float32)


def osc_sine(freq, dur: float, detune: float = 0.0, phase: float = 0.0) -> np.ndarray:
    n = secs(dur)
    t = t_axis(n)
    f = freq * (1 + detune)
    return np.sin(2 * np.pi * f * t + phase).astype(np.float32)


def osc_saw(freq, dur: float, detune: float = 0.0, harmonics: int = 16) -> np.ndarray:
    """Sierra con band-limit aproximado (suma de armonicos hasta Nyquist)."""
    n = secs(dur)
    t = t_axis(n)
    f = freq * (1 + detune)
    out = np.zeros(n, dtype=np.float32)
    kmax = int(min(harmonics, (SR / 2) / max(f, 1)))
    for k in range(1, kmax + 1):
        if f * k > SR / 2:
            break
        out += (np.sin(2 * np.pi * f * k * t) / k).astype(np.float32)
    return (out * (2 / np.pi)).astype(np.float32)


def osc_stack(freq, dur: float, detune: float = 0.0, partials=(1.0, 0.35, 0.14, 0.06)) -> np.ndarray:
    """Pad calido: pila de senos (sin sierra agresiva, sin aliasing)."""
    n = secs(dur)
    t = t_axis(n)
    f = freq * (1 + detune)
    out = np.zeros(n, dtype=np.float32)
    for k, amp in enumerate(partials, start=1):
        if f * k > SR / 2 - 500:
            break
        out += (np.sin(2 * np.pi * f * k * t) * amp).astype(np.float32)
    return out


def osc_tri(freq, dur: float, detune: float = 0.0) -> np.ndarray:
    n = secs(dur)
    t = t_axis(n)
    f = freq * (1 + detune)
    out = np.zeros(n, dtype=np.float32)
    kmax = int(min(15, (SR / 2) / max(f, 1)))
    for k in range(1, kmax + 1, 2):
        out += (((-1) ** ((k - 1) // 2)) * np.sin(2 * np.pi * f * k * t) / (k * k)).astype(np.float32)
    return (out * (8 / np.pi ** 2)).astype(np.float32)


def reverb(x: np.ndarray, decay: float = 0.8, mix: float = 0.25) -> np.ndarray:
    """Reverb por convolucion con IR sintetica decorrelacionada (estilo sala)."""
    n = secs(decay)
    t = t_axis(n)
    ir = (rng.standard_normal(n) * np.exp(-t / (decay / 3.2))).astype(np.float32)
    ir[: secs(0.004)] = 0  # predelay
    ir /= np.sqrt(np.sum(ir ** 2)) + 1e-9
    wet = signal.fftconvolve(x, ir, mode="full")[: len(x)].astype(np.float32)
    return (x * (1 - mix) + wet * mix).astype(np.float32)


def sweep_bandpass(x: np.ndarray, f0: float, f1: float, q: float = 1.2, blocks: int = 48) -> np.ndarray:
    """Filtro pasa-banda con centro que barre de f0 a f1 (crossfade entre bloques)."""
    n = len(x)
    bs = max(256, n // blocks)
    out = np.zeros(n, dtype=np.float32)
    win = np.hanning(bs).astype(np.float32)
    for i in range(0, n, bs):
        frac = i / max(n - 1, 1)
        fc = f0 * (f1 / f0) ** frac
        bw = max(fc / q, 40.0)
        lo, hi = max(fc - bw / 2, 20), min(fc + bw / 2, SR / 2 - 200)
        chunk = x[i:i + bs]
        if len(chunk) < 64:
            out[i:i + len(chunk)] += chunk
            continue
        y = signal.sosfilt(signal.butter(2, [lo, hi], btype="bandpass", fs=SR, output="sos"), chunk).astype(np.float32)
        w = win[: len(y)]
        out[i:i + len(y)] += y * w
    return out


def mix_into(dst: np.ndarray, src: np.ndarray, at_s: float, gain_db: float = 0.0, pan: float = 0.0) -> None:
    """Suma `src` (mono) en `dst` (n,2) en el segundo `at_s`. pan -1..1."""
    if gain_db == -np.inf:
        return
    i = secs(at_s)
    if i >= len(dst) or i < 0:
        return
    j = min(len(dst), i + len(src))
    seg = src[: j - i] * db(gain_db)
    gl = math.cos((pan + 1) * math.pi / 4)
    gr = math.sin((pan + 1) * math.pi / 4)
    dst[i:j, 0] += seg * gl
    dst[i:j, 1] += seg * gr


def norm_peak(x: np.ndarray, target_db: float) -> np.ndarray:
    p = float(np.max(np.abs(x))) + 1e-12
    return (x * (db(target_db) / p)).astype(np.float32)


def shelf(x: np.ndarray, freq: float, gain_db: float) -> np.ndarray:
    """Shelf simple por resta/suma de la banda alta (aproximacion de primer orden)."""
    if x.ndim == 2:
        return np.stack([shelf(x[:, c], freq, gain_db) for c in range(x.shape[1])], axis=1)
    band = filt(x, "highpass", freq, 2)
    return (x + band * (db(gain_db) - 1.0)).astype(np.float32)


def presence(x: np.ndarray, freq: float, gain_db: float, q: float = 1.4) -> np.ndarray:
    """Realce/corte de una banda (campana) sumando la salida del pasa-banda."""
    if x.ndim == 2:
        return np.stack([presence(x[:, c], freq, gain_db, q) for c in range(x.shape[1])], axis=1)
    band = signal.sosfilt(signal.butter(2, [freq / q, min(freq * q, SR / 2 - 500)], btype="bandpass", fs=SR, output="sos"), x)
    return (x + band.astype(np.float32) * (db(gain_db) - 1.0)).astype(np.float32)


def soft_clip(x: np.ndarray, drive: float = 1.0) -> np.ndarray:
    return np.tanh(x * drive).astype(np.float32)


def write_wav(path: Path, x: np.ndarray) -> Path:
    path.parent.mkdir(parents=True, exist_ok=True)
    wavfile.write(str(path), SR, np.clip(x, -1, 1).astype(np.float32))
    return path


def run(cmd: list[str]) -> str:
    p = subprocess.run(cmd, capture_output=True, text=True, encoding="utf-8", errors="replace")
    if p.returncode != 0:
        raise RuntimeError(f"ffmpeg fallo: {' '.join(cmd)}\n{p.stderr[-3000:]}")
    return p.stderr


def encode_mp3(wav: Path, mp3: Path, bitrate: str = "192k") -> Path:
    mp3.parent.mkdir(parents=True, exist_ok=True)
    run([FFMPEG, "-y", "-v", "error", "-i", str(wav), "-c:a", "libmp3lame", "-b:a", bitrate, "-ar", str(SR), str(mp3)])
    return mp3


# --------------------------------------------------------------------------- camas
def build_ambient(dur: float = 300.0) -> np.ndarray:
    """64 BPM, Re menor. Drone + pad oscuro + textura. Sin melodia pegajosa."""
    beat = 60 / 64
    bar = beat * 4          # 3.75 s
    bars = int(dur // bar)  # 80
    n = secs(bars * bar)
    out = np.zeros((n, 2), dtype=np.float32)

    # --- drone subgrave continuo (D1 + D2), con respiracion lenta
    t = t_axis(n)
    lfo = (0.5 + 0.5 * np.sin(2 * np.pi * 0.035 * t - 1.2)).astype(np.float32)
    drone = (osc_sine(36.71, n / SR) * (0.55 + 0.45 * lfo)
             + osc_sine(73.42, n / SR, detune=0.0015) * 0.32 * (0.6 + 0.4 * (1 - lfo)))
    drone = filt(drone, "lowpass", 180, 4)
    out[:, 0] += drone * db(-20)
    out[:, 1] += drone * db(-20.5)

    # --- quinta y septima entran por secciones (A1 bar 16, Bb1 bar 40)
    for f, start_bar, g in ((55.0, 16, -24), (58.27, 40, -26)):
        i = secs(start_bar * bar)
        seg = osc_sine(f, (n - i) / SR, detune=0.0008) * 0.5
        seg = filt(seg, "lowpass", 200, 4)
        seg = fade(seg, in_s=8.0, out_s=10.0)
        out[i:, 0] += seg * db(g)
        out[i:, 1] += seg * db(g - 0.5)

    # --- pad: acordes cada 8 compases, filtro lento, sin arpegios
    chords = [
        ("Dm", [146.83, 174.61, 220.00]),
        ("Bb", [116.54, 146.83, 174.61]),
        ("Gm", [98.00, 116.54, 146.83]),
        ("Am", [110.00, 130.81, 164.81]),
        ("Dm", [146.83, 174.61, 220.00]),
        ("Bb", [116.54, 146.83, 174.61]),
        ("Gm", [98.00, 116.54, 146.83]),
        ("A",  [110.00, 138.59, 164.81]),
        ("Dm", [146.83, 174.61, 220.00]),
        ("Dm", [146.83, 174.61, 220.00]),
    ]
    chord_bars = 8
    for ci, (_name, notes) in enumerate(chords):
        start = ci * chord_bars * bar
        if start >= bars * bar:
            break
        cdur = min(chord_bars * bar + 1.2, bars * bar - start)
        m = secs(cdur)
        pad = np.zeros(m, dtype=np.float32)
        for k, f in enumerate(notes):
            for det in (-0.0035, 0.0038):
                pad += osc_stack(f, cdur, detune=det, partials=(1.0, 0.28, 0.11)) * (0.42 / (1 + 0.25 * k))
            pad += osc_sine(f / 2, cdur) * 0.10  # cuerpo de octava
        pad = filt(pad, "lowpass", 780, 4)
        pad = filt(pad, "highpass", 90, 2)
        pad = reverb(pad, decay=1.6, mix=0.30)
        pad = fade(pad, in_s=2.2, out_s=2.6)
        mix_into(out, pad, start, -25.0, pan=-0.12)
        mix_into(out, np.roll(pad, 37), start, -26.5, pan=0.14)

    # --- textura de aire con oleadas
    tex = pink(n)
    tex = filt(tex, "bandpass", [300, 5200], 2)
    swell = (0.35 + 0.65 * (0.5 + 0.5 * np.sin(2 * np.pi * 0.018 * t + 0.7))).astype(np.float32)
    tex *= swell
    out[:, 0] += tex * db(-37)
    out[:, 1] += np.roll(tex, 1103) * db(-38)

    # --- pulso cardiaco cada 2 compases (lub-dub), sin melodia
    for b in range(0, bars, 2):
        thump = osc_sine(41.2, 0.5) * env_exp(secs(0.5), 0.004, 0.10)
        thump = filt(thump, "lowpass", 120, 4)
        mix_into(out, thump, b * bar + 0.02, -19.0, 0.0)
        dub = osc_sine(41.2, 0.4) * env_exp(secs(0.4), 0.004, 0.075)
        dub = filt(dub, "lowpass", 120, 4)
        mix_into(out, dub, b * bar + 0.30, -23.5, 0.0)

    # --- raspados metalicos esporadicos (tension)
    for b in (5, 13, 29, 45, 61, 73):
        if b >= bars:
            continue
        m = secs(2.4)
        sc = noise(m) * env_exp(m, 0.35, 0.55)
        sc = sweep_bandpass(sc, 900, 2600, q=3.0, blocks=24)
        sc = reverb(sc, decay=1.2, mix=0.35)
        mix_into(out, sc, b * bar + 0.8, -30.0, pan=0.35 if b % 2 else -0.35)

    out = soft_clip(out * 1.15, 1.0)
    return norm_peak(out, -3.0)


def build_bed(dur: float = 288.0) -> np.ndarray:
    """123 BPM, La menor. Groove de cuatro tiempos, bajo, arpegio filtrado. Energia alta."""
    beat = 60 / 123
    step = beat / 4
    bar = beat * 4
    bars = int(dur // bar)
    n = secs(bars * bar)
    out = np.zeros((n, 2), dtype=np.float32)

    def kick(g: float = 0.0) -> np.ndarray:
        m = secs(0.42)
        t = t_axis(m)
        f = 118 * np.exp(-t / 0.028) + 47
        body = np.sin(2 * np.pi * np.cumsum(f) / SR).astype(np.float32)
        body *= env_exp(m, 0.002, 0.115)
        click = filt(noise(secs(0.012)), "highpass", 1800, 2) * env_exp(secs(0.012), 0.0005, 0.004)
        body[: len(click)] += click * 0.5
        return soft_clip(body * 1.4, 1.2)

    def hat(open_: bool = False) -> np.ndarray:
        m = secs(0.22 if open_ else 0.055)
        h = filt(noise(m), "highpass", 7200 if not open_ else 6200, 4)
        h *= env_exp(m, 0.0008, 0.030 if open_ else 0.009)
        return h

    def clap() -> np.ndarray:
        m = secs(0.28)
        c = filt(noise(m), "bandpass", [1400, 4200], 2)
        e = env_exp(m, 0.001, 0.045)
        e[secs(0.012):] += env_exp(m - secs(0.012), 0.001, 0.05) * 0.6
        return (c * e[: len(c)]).astype(np.float32)

    def bass(freq: float, dur: float) -> np.ndarray:
        m = secs(dur)
        b = osc_saw(freq, dur, harmonics=8) * 0.7 + osc_sine(freq, dur) * 0.9
        b = filt(b, "lowpass", 340, 4)
        return (b * env_exp(m, 0.006, dur * 0.55)).astype(np.float32)

    def pluck(freq: float, dur: float = 0.30) -> np.ndarray:
        m = secs(dur)
        p = osc_saw(freq, dur, detune=0.002, harmonics=10) * 0.6 + osc_tri(freq * 2, dur) * 0.25
        p = filt(p, "lowpass", 2600, 2)
        p = filt(p, "highpass", 300, 2)
        return (p * env_exp(m, 0.004, 0.085)).astype(np.float32)

    def pad(notes, dur: float) -> np.ndarray:
        m = secs(dur)
        p = np.zeros(m, dtype=np.float32)
        for f in notes:
            p += osc_stack(f, dur, detune=-0.0025, partials=(1.0, 0.3, 0.12, 0.05)) * 0.30
            p += osc_stack(f, dur, detune=0.0031, partials=(1.0, 0.26, 0.10)) * 0.26
        p = filt(p, "lowpass", 1500, 4)
        p = filt(p, "highpass", 140, 2)
        return fade(p, in_s=0.6, out_s=1.0)

    # progresion: Am7 - Fmaj7 - Dm7 - Em7 (menor, sin "uplifting")
    prog = [
        ("Am7", [110.00, 130.81, 164.81, 196.00], 55.00),
        ("Fmaj7", [87.31, 110.00, 130.81, 164.81], 43.65),
        ("Dm7", [146.83, 174.61, 220.00, 261.63], 73.42),
        ("Em7", [164.81, 196.00, 246.94, 293.66], 82.41),
    ]

    # secciones en compases
    intro_end, build_end, main_end, break_end, main2_end = 8, 24, 88, 104, 144

    for b in range(bars):
        t0 = b * bar
        in_intro = b < intro_end
        in_build = intro_end <= b < build_end
        in_main = build_end <= b < main_end
        in_break = main_end <= b < break_end
        in_main2 = break_end <= b < main2_end
        in_outro = b >= main2_end
        dense = in_main or in_main2

        # pad de fondo (4 compases por acorde)
        if b % 4 == 0:
            name, notes, root = prog[(b // 4) % 4]
            g = -30.0 if (in_intro or in_break) else -26.0
            mix_into(out, pad(notes, bar * 4), t0, g, pan=0.0)

        # bombo
        if not in_break:
            if in_intro:
                if b >= 4:
                    mix_into(out, kick(), t0, -9.0)
                    mix_into(out, kick(), t0 + 2 * beat, -10.0)
            elif in_outro:
                if b < bars - 2:
                    mix_into(out, kick(), t0, -10.0)
            else:
                for k in range(4):
                    mix_into(out, kick(), t0 + k * beat, -6.5 if dense else -8.0)

        # charles
        if not in_break:
            for s in range(16):
                if dense:
                    vel = -21.0 if s % 4 == 2 else -25.0
                    if s % 2 == 1:
                        vel -= 2.5
                    mix_into(out, hat(), t0 + s * step, vel, pan=0.22)
                elif in_intro or in_build:
                    if s % 4 == 2:
                        mix_into(out, hat(), t0 + s * step, -23.0, pan=0.25)
            if dense and b % 2 == 1:
                mix_into(out, hat(open_=True), t0 + 3.5 * beat, -24.0, pan=0.3)

        # palmas en 2 y 4
        if dense:
            mix_into(out, clap(), t0 + beat, -22.0, pan=-0.1)
            mix_into(out, clap(), t0 + 3 * beat, -22.5, pan=-0.1)

        # bajo: 8 corcheas con octava
        if not in_break and not in_outro:
            name, notes, root = prog[(b // 4) % 4]
            pat = [0, 0, 3, 0, 0, 7, 0, 12]  # semitonos sobre la raiz
            for s, semi in enumerate(pat):
                if in_intro and s % 2 == 1:
                    continue
                f = root * (2 ** (semi / 12))
                g = -13.0 if dense else -16.0
                mix_into(out, bass(f, step * 1.8), t0 + s * 2 * step, g, pan=0.0)

        # arpegio filtrado (8 corcheas) solo en secciones densas y build
        if dense or in_build:
            name, notes, root = prog[(b // 4) % 4]
            order = [0, 1, 2, 3, 2, 1, 2, 3]
            for s in range(8):
                f = notes[order[s] % len(notes)]
                g = -23.0 if dense else -26.0
                mix_into(out, pluck(f, 0.26), t0 + s * 2 * step, g, pan=-0.28 if s % 2 else 0.28)

        # shaker 16avos en main2 (textura)
        if in_main2:
            for s in range(16):
                if s % 2 == 1:
                    sh = filt(noise(secs(0.04)), "bandpass", [5000, 11000], 2)
                    sh *= env_exp(secs(0.04), 0.001, 0.008)
                    mix_into(out, sh, t0 + s * step, -32.0, pan=0.4)

    out = soft_clip(out * 1.1, 1.0)
    out = shelf(out, 7000, -3.0)   # quita aspereza 8-16k
    return norm_peak(out, -2.5)


# --------------------------------------------------------------------------- cues
def cue_tension(ambient: np.ndarray, dur: float = 30.0) -> np.ndarray:
    """Oscuro, pulso lento, sin melodia. Derivado de ambient: lowpass + pulso subgrave."""
    src = ambient[: secs(dur)].copy()
    src = filt(src[:, 0] * 0.5 + src[:, 1] * 0.5, "lowpass", 340, 4)
    src = filt(src, "highpass", 32, 2)
    body = src * db(-3)

    n = secs(dur)
    pulse = np.zeros(n, dtype=np.float32)
    period = 60 / 64 * 2  # negra con puntillo ~ pulso lento (1.875 s)
    for i, at in enumerate(np.arange(0.4, dur - 0.5, period)):
        m = secs(0.95)
        p = (osc_sine(45.0, 0.95) * 0.85 + osc_sine(90.0, 0.95) * 0.30) * env_exp(m, 0.22, 0.42)
        p = filt(p, "lowpass", 140, 4)
        k = secs(at)
        j = min(n, k + len(p))
        pulse[k:j] += p[: j - k] * (db(-9) if i % 2 == 0 else db(-13))

    tex = pink(n)
    tex = filt(tex, "bandpass", [600, 2200], 2)
    swell = (0.4 + 0.6 * (0.5 + 0.5 * np.sin(2 * np.pi * 0.09 * t_axis(n) - 1.0))).astype(np.float32)
    tex *= swell * db(-26)

    out = np.stack([body + pulse + tex, body + np.roll(pulse, 13) + np.roll(tex, 401)], axis=1)
    out = presence(out, 900, 1.5, q=1.2)
    out = fade(out, in_s=0.9, out_s=1.6)
    return norm_peak(soft_clip(out, 1.05), -4.0)


def cue_drive(bed: np.ndarray, dur: float = 40.0) -> np.ndarray:
    """Ritmico 123 BPM para la demo. Toma una seccion densa con intro/outro limpios."""
    bar = (60 / 123) * 4
    start_bar = 32  # dentro de la seccion main
    start = secs(start_bar * bar)
    src = bed[start: start + secs(dur)].copy()
    if len(src) < secs(dur):
        padn = secs(dur) - len(src)
        src = np.vstack([src, np.zeros((padn, 2), dtype=np.float32)])

    # intro: 1.2 s con filtro que abre (evita entrada seca)
    k = secs(1.2)
    t = np.linspace(0, 1, k, dtype=np.float32)
    # aproximacion barata: crossfade entre version filtrada y version completa
    dark = np.stack([filt(src[:, c], "lowpass", 900, 2) for c in range(2)], axis=1)
    gain = (t ** 1.6)[:, None]
    src[:k] = dark[:k] * (1 - gain) + src[:k] * gain

    src = fade(src, in_s=0.35, out_s=2.2)
    return norm_peak(soft_clip(src, 1.0), -4.0)


def cue_confidence(cue2: np.ndarray, dur: float = 27.0) -> np.ndarray:
    """Variante filtrada del cue_02: sin sub, transientes suavizados, aire. Para Acto III."""
    bar = (60 / 123) * 4
    src = cue2[secs(bar): secs(bar) + secs(dur)].copy()
    if len(src) < secs(dur):
        src = np.vstack([src, np.zeros((secs(dur) - len(src), 2), dtype=np.float32)])
    out = np.stack([filt(src[:, c], "lowpass", 2000, 4) for c in range(2)], axis=1)
    out = np.stack([filt(out[:, c], "highpass", 95, 2) for c in range(2)], axis=1)
    out = presence(out, 1200, 1.5, q=1.3)

    # compresion suave: reduce picos de bombo sin matar el pulso
    env = np.abs(out).max(axis=1)
    sm = signal.sosfilt(signal.butter(1, 8, btype="lowpass", fs=SR, output="sos"), env).astype(np.float32)
    thr = np.percentile(sm, 88) + 1e-6
    gain = np.minimum(1.0, (thr / np.maximum(sm, 1e-6)) ** 0.35).astype(np.float32)
    out *= gain[:, None]
    out = fade(out, in_s=0.8, out_s=1.8)
    return norm_peak(soft_clip(out, 1.0), -4.0)


def cue_resolve(dur: float = 35.0) -> np.ndarray:
    """Calido, sin golpes. Pad menor->mayor (tercera de Picardia), sin arpegios."""
    n = secs(dur)
    out = np.zeros((n, 2), dtype=np.float32)
    chords = [
        ([146.83, 174.61, 220.00, 329.63], "Dm add9"),
        ([116.54, 146.83, 174.61, 220.00], "Bbmaj7"),
        ([110.00, 130.81, 174.61, 220.00], "F/A"),
        ([146.83, 185.00, 220.00, 329.63], "D add9 (mayor)"),
    ]
    seg = 8.0
    for i, (notes, _name) in enumerate(chords):
        start = i * seg
        if start >= dur:
            break
        length = min(seg + 2.4, dur - start)
        m = secs(length)
        p = np.zeros(m, dtype=np.float32)
        for k, f in enumerate(notes):
            for det in (-0.0032, 0.0, 0.0034):
                p += osc_sine(f, length, detune=det) * (0.40 / (1 + 0.3 * k))
                p += osc_tri(f * 2, length, detune=det) * (0.055 / (1 + 0.3 * k))
        p = filt(p, "lowpass", 2100, 2)
        p = filt(p, "highpass", 120, 2)
        p = reverb(p, decay=2.2, mix=0.34)
        p = fade(p, in_s=1.8 if i == 0 else 1.1, out_s=1.6)
        mix_into(out, p, start, -12.0, pan=-0.18)
        mix_into(out, np.roll(p, 211), start, -13.5, pan=0.20)

    # sub calido siguiendo la fundamental
    for i, f in enumerate((73.42, 58.27, 55.00, 73.42)):
        m = secs(seg + 1.0)
        s = osc_sine(f, seg + 1.0) * 0.6 + osc_sine(f * 2, seg + 1.0) * 0.18
        s = filt(s, "lowpass", 160, 4)
        s = fade(s, in_s=2.0, out_s=2.2)
        mix_into(out, s, i * seg, -19.0, 0.0)

    # aire alto muy tenue (no es melodia, es textura)
    t = t_axis(n)
    sh = np.sin(2 * np.pi * 1318.5 * t) * 0.5 + np.sin(2 * np.pi * 1760 * t + 1.1) * 0.35
    sh *= (0.5 + 0.5 * np.sin(2 * np.pi * 0.055 * t)).astype(np.float32) * db(-40)
    out[:, 0] += sh.astype(np.float32)
    out[:, 1] += np.roll(sh, 733).astype(np.float32)

    out = fade(out, in_s=1.2, out_s=2.6)
    out = presence(out, 1400, 1.5, q=1.1)
    return norm_peak(soft_clip(out, 1.02), -4.0)


# --------------------------------------------------------------------------- sfx
def sfx_whoosh() -> np.ndarray:
    dur = 1.30
    n = secs(dur)
    x = noise(n)
    a = sweep_bandpass(x, 260, 5200, q=1.1, blocks=40)
    b = sweep_bandpass(np.roll(x, 97), 180, 3000, q=0.9, blocks=40)
    y = a * 0.8 + b * 0.5
    e = np.concatenate([
        np.linspace(0, 1, secs(0.82), dtype=np.float32) ** 2.2,
        np.linspace(1, 0, n - secs(0.82), dtype=np.float32) ** 1.5,
    ])
    y = y[: len(e)] * e
    return norm_peak(y, -6.0)


def sfx_click() -> np.ndarray:
    dur = 0.09
    n = secs(dur)
    y = np.zeros(n, dtype=np.float32)
    t = t_axis(n)
    y += (np.sin(2 * np.pi * 2100 * t) * np.exp(-t / 0.006)).astype(np.float32) * 0.7
    y += (np.sin(2 * np.pi * 3400 * t) * np.exp(-t / 0.003)).astype(np.float32) * 0.4
    tr = filt(noise(secs(0.010)), "highpass", 3000, 2) * env_exp(secs(0.010), 0.0004, 0.003)
    y[: len(tr)] += tr * 0.8
    return norm_peak(y, -8.0)


def sfx_typing() -> np.ndarray:
    dur = 3.0
    n = secs(dur)
    y = np.zeros(n, dtype=np.float32)
    times = [0.04, 0.27, 0.40, 0.69, 0.93, 1.20, 1.41, 1.60, 1.96, 2.19, 2.35, 2.64]
    for i, at in enumerate(times):
        m = secs(0.075)
        k = filt(noise(m), "bandpass", [1600, 6200], 2)
        k *= env_exp(m, 0.0006, 0.008 + 0.004 * (i % 3))
        th = osc_sine(150 + 22 * (i % 4), 0.075) * env_exp(m, 0.001, 0.014)
        hit = k * 0.9 + th * 0.35
        s = secs(at)
        y[s: s + m] += hit * (0.75 + 0.25 * ((i * 37) % 10) / 10)
    return norm_peak(y, -8.0)


def sfx_riser() -> np.ndarray:
    dur = 3.0
    n = secs(dur)
    x = noise(n)
    y = sweep_bandpass(x, 300, 7500, q=1.6, blocks=64)
    t = t_axis(n)
    tone = np.sin(2 * np.pi * (180 * (5.0 ** (t / dur))) * t).astype(np.float32)
    tone = filt(tone, "lowpass", 4000, 2) * 0.25
    e = (np.linspace(0, 1, n, dtype=np.float32) ** 2.4)
    y = (y * 0.85 + tone) * e
    y[-secs(0.015):] *= np.linspace(1, 0, secs(0.015), dtype=np.float32)
    return norm_peak(y, -6.5)


def sfx_impact() -> np.ndarray:
    dur = 1.60
    n = secs(dur)
    t = t_axis(n)
    f = 66 * np.exp(-t / 0.10) + 37
    body = np.sin(2 * np.pi * np.cumsum(f) / SR).astype(np.float32)
    body *= env_exp(n, 0.002, 0.42)
    burst = filt(noise(n), "lowpass", 320, 4) * env_exp(n, 0.001, 0.06) * 0.55
    y = soft_clip(body * 1.5 + burst, 1.1)
    return norm_peak(y, -5.0)


def sfx_sub_drop() -> np.ndarray:
    dur = 2.0
    n = secs(dur)
    t = t_axis(n)
    f = 95 * np.exp(-t / 0.55) + 28
    y = np.sin(2 * np.pi * np.cumsum(f) / SR).astype(np.float32)
    y *= env_exp(n, 0.01, 0.85)
    y = filt(y, "lowpass", 160, 4)
    return norm_peak(y, -5.5)


def sfx_paper() -> np.ndarray:
    dur = 0.60
    n = secs(dur)
    y = np.zeros(n, dtype=np.float32)
    for at, ln, g in ((0.0, 0.13, 1.0), (0.16, 0.10, 0.75), (0.31, 0.16, 0.9), (0.50, 0.08, 0.5)):
        m = secs(ln)
        r = filt(noise(m), "bandpass", [1500, 7200], 2)
        am = (0.55 + 0.45 * np.sin(2 * np.pi * 42 * t_axis(m))).astype(np.float32)
        r *= env_exp(m, 0.006, ln * 0.35) * am
        s = secs(at)
        y[s: s + m] += r * g
    return norm_peak(y, -8.0)


# --------------------------------------------------------------------------- normalizacion
def loudnorm_2pass(src: Path, dst: Path, i: float, tp: float, bitrate: str = "192k") -> dict:
    """Normaliza a I LUFS / TP dB con loudnorm de dos pasadas (lineal cuando se puede)."""
    stderr = run([FFMPEG, "-hide_banner", "-nostats", "-i", str(src), "-af",
                  f"loudnorm=I={i}:TP={tp}:LRA=11:print_format=json", "-f", "null", "-"])
    js = stderr[stderr.rfind("{"): stderr.rfind("}") + 1]
    m = json.loads(js)
    af = (f"loudnorm=I={i}:TP={tp}:LRA=11:measured_I={m['input_i']}:measured_TP={m['input_tp']}:"
          f"measured_LRA={m['input_lra']}:measured_thresh={m['input_thresh']}:offset={m['target_offset']}:linear=true")
    run([FFMPEG, "-y", "-v", "error", "-i", str(src), "-af", af, "-ar", str(SR),
         "-c:a", "libmp3lame", "-b:a", bitrate, str(dst)])
    return {"input_i": float(m["input_i"]), "input_tp": float(m["input_tp"]), "input_lra": float(m["input_lra"])}


def measure(path: Path) -> dict:
    stderr = run([FFMPEG, "-hide_banner", "-nostats", "-i", str(path), "-af",
                  "ebur128=peak=true", "-f", "null", "-"])
    tail = stderr[stderr.rfind("Summary:"):]
    out = {}
    for line in tail.splitlines():
        line = line.strip()
        if line.startswith("I:"):
            out["lufs_i"] = float(line.split()[1])
        elif line.startswith("LRA:"):
            out["lra"] = float(line.split()[1])
        elif line.startswith("Peak:"):
            out["true_peak_db"] = float(line.split()[1])
    return out


# --------------------------------------------------------------------------- main
def main() -> int:
    global FFMPEG
    ap = argparse.ArgumentParser()
    ap.add_argument("--only", choices=["beds", "cues", "sfx", "all"], default="all")
    ap.add_argument("--ffmpeg", default=FFMPEG)
    ap.add_argument("--reuse-beds", action="store_true", help="reusa las camas ya sintetizadas (cache)")
    args = ap.parse_args()

    FFMPEG = args.ffmpeg
    if not Path(FFMPEG).exists() and not shutil.which(FFMPEG):
        print(f"ERROR: ffmpeg no encontrado ({FFMPEG}). Use --ffmpeg o la variable FFMPEG_BIN.", file=sys.stderr)
        return 2

    MUSIC.mkdir(parents=True, exist_ok=True)
    CUES.mkdir(parents=True, exist_ok=True)
    SFX.mkdir(parents=True, exist_ok=True)
    tmp = Path(tempfile.mkdtemp(prefix="rally_audio_"))
    manifest: dict = {"generated_by": "tools/make_audio_assets.py", "sample_rate": SR,
                      "license": "Original del proyecto (sintesis DSP). Sin samples de terceros. CC0-equivalente.",
                      "no_vocals": True, "beds": {}, "cues": {}, "sfx": {}}

    need_beds = args.only in ("beds", "cues", "all")
    ambient = bed = None
    if args.reuse_beds and CACHE.exists():
        z = np.load(CACHE)
        ambient, bed = z["ambient"], z["bed"]
        print(f"[cache] camas cargadas de {CACHE}")
        need_beds = False
    if need_beds:
        print("[beds] sintetizando ambient (5:00, 64 BPM)...")
        ambient = build_ambient()
        w = write_wav(tmp / "ambient.wav", ambient)
        p = loudnorm_2pass(w, MUSIC / "ambient.mp3", i=-20.0, tp=-2.0)
        manifest["beds"]["ambient.mp3"] = {"dur_s": 300.0, "bpm": 64, "key": "Dm", **p, **measure(MUSIC / "ambient.mp3")}

        print("[beds] sintetizando bed (4:48, 123 BPM)...")
        bed = build_bed()
        w = write_wav(tmp / "bed.wav", bed)
        p = loudnorm_2pass(w, MUSIC / "bed.mp3", i=-16.0, tp=-2.0)
        manifest["beds"]["bed.mp3"] = {"dur_s": round(len(bed) / SR, 2), "bpm": 123, "key": "Am", **p, **measure(MUSIC / "bed.mp3")}

        CACHE.parent.mkdir(parents=True, exist_ok=True)
        np.savez_compressed(CACHE, ambient=ambient.astype(np.float32), bed=bed.astype(np.float32))

    if args.only in ("cues", "all"):
        if ambient is None:
            ambient = build_ambient()
        if bed is None:
            bed = build_bed()
        print("[cues] cue_01_tension (30 s)...")
        c1 = cue_tension(ambient)
        p = loudnorm_2pass(write_wav(tmp / "c1.wav", c1), CUES / "cue_01_tension.mp3", i=-18.0, tp=-2.0)
        manifest["cues"]["cue_01_tension.mp3"] = {"dur_s": 30.0, "act": "I", "mood": "tension", **p, **measure(CUES / "cue_01_tension.mp3")}

        print("[cues] cue_02_drive (40 s)...")
        c2 = cue_drive(bed)
        p = loudnorm_2pass(write_wav(tmp / "c2.wav", c2), CUES / "cue_02_drive.mp3", i=-18.0, tp=-2.0)
        manifest["cues"]["cue_02_drive.mp3"] = {"dur_s": 40.0, "act": "II", "mood": "drive", **p, **measure(CUES / "cue_02_drive.mp3")}

        print("[cues] cue_02b_confidence (28 s)...")
        c2b = cue_confidence(c2, dur=28.0)
        p = loudnorm_2pass(write_wav(tmp / "c2b.wav", c2b), CUES / "cue_02b_confidence.mp3", i=-18.0, tp=-2.0)
        manifest["cues"]["cue_02b_confidence.mp3"] = {"dur_s": 28.0, "act": "III", "mood": "confidence",
                                                     "derived_from": "cue_02_drive.mp3", **p, **measure(CUES / "cue_02b_confidence.mp3")}

        print("[cues] cue_03_resolve (35 s)...")
        c3 = cue_resolve()
        p = loudnorm_2pass(write_wav(tmp / "c3.wav", c3), CUES / "cue_03_resolve.mp3", i=-18.0, tp=-2.0)
        manifest["cues"]["cue_03_resolve.mp3"] = {"dur_s": 35.0, "act": "IV", "mood": "resolve", **p, **measure(CUES / "cue_03_resolve.mp3")}

    if args.only in ("sfx", "all"):
        table = {
            "whoosh_acto.mp3": (sfx_whoosh, "transicion de acto"),
            "click_ui.mp3": (sfx_click, "clic de interfaz"),
            "typing_loop.mp3": (sfx_typing, "tecleo 3 s loop"),
            "riser_3s.mp3": (sfx_riser, "riser 3 s"),
            "impact_bass.mp3": (sfx_impact, "impacto grave"),
            "sub_drop.mp3": (sfx_sub_drop, "caida de sub"),
            "paper.mp3": (sfx_paper, "papel / documento"),
        }
        for name, (fn, desc) in table.items():
            print(f"[sfx] {name}...")
            y = fn()
            w = write_wav(tmp / f"{name}.wav", y)
            dst = SFX / name
            run([FFMPEG, "-y", "-v", "error", "-i", str(w), "-c:a", "libmp3lame", "-b:a", "192k", "-ar", str(SR), str(dst)])
            manifest["sfx"][name] = {"dur_s": round(len(y) / SR, 3), "desc": desc, "peak_db": -8.0 if "click" in name or "typing" in name or "paper" in name else -6.0,
                                     **measure(dst)}

    if args.only == "all" or args.only == "cues":
        # hashes para trazabilidad
        for grp in ("beds", "cues", "sfx"):
            for name, meta in manifest[grp].items():
                f = (MUSIC / name) if grp == "beds" else (CUES / name if grp == "cues" else SFX / name)
                if f.exists():
                    meta["sha256_12"] = hashlib.sha256(f.read_bytes()).hexdigest()[:12]
                    meta["bytes"] = f.stat().st_size

    if MANIFEST.parent.exists():
        prev = {}
        if MANIFEST.exists():
            try:
                prev = json.loads(MANIFEST.read_text(encoding="utf-8"))
            except Exception:
                prev = {}
        for grp in ("beds", "cues", "sfx"):
            merged = prev.get(grp, {})
            merged.update(manifest.get(grp, {}))
            manifest[grp] = merged
        MANIFEST.write_text(json.dumps(manifest, indent=2, ensure_ascii=False), encoding="utf-8")
        print(f"[ok] manifest -> {MANIFEST}")

    shutil.rmtree(tmp, ignore_errors=True)
    print(json.dumps({g: {k: v.get("lufs_i") for k, v in manifest[g].items()} for g in ("beds", "cues", "sfx")}, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
