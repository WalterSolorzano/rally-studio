#!/usr/bin/env python3
"""Mezclador de audio del video: cues por acto + ducking contra la voz + SFX.

Independiente del motor de video. No importa nada de `scripts/`. Se puede llamar
desde `pitch_video.py`, desde el workbench o a mano.

  python tools/remix_audio.py --video assets/video.mp4 --voice assets/voice/narration.mp3 \
      --out assets/audio/final.mp4

Que hace
--------
1. Arma una cama musical continua con un cue distinto por acto:
      Acto I   0:00-0:27   cue_01_tension      (oscuridad, pulso lento)
      Acto II  0:27-1:03   cue_02_drive        (ritmo, demo de la app)
      Acto III 1:03-1:30   cue_02b_confidence  (misma pista, filtrada: confianza)
      Acto IV  1:30-2:00   cue_03_resolve      (calido, sin golpes)
   Cada corte lleva un whoosh que tapa la union.
2. Baja la musica cuando habla la voz (ducking por envolvente calculada, no por
   compresor a ciegas): -4 dB en pausas, -10 dB bajo la voz (6 dB de profundidad).
   Ataque 60 ms, release 400 ms, con relleno de huecos entre palabras.
3. Coloca los SFX del shotlist (whoosh de acto, clics de UI, tecleo, riser, impactos).
4. Normaliza el master a -14 LUFS integrado, true peak -1.5 dB, y mide.

La voz manda: si hay que elegir, se baja la musica, nunca la voz.

Flags utiles
------------
  --start 0 --dur 30        render parcial (pruebas)
  --music-db -4             offset de la cama respecto al nivel del cue (-18 LUFS)
  --duck-db 6               profundidad del ducking
  --no-sfx                  sin efectos
  --stems DIR               exporta voice/music/sfx por separado (para medir)
  --measure                 mide el resultado y lo imprime en JSON
  --print-plan              muestra el mapa de cues y SFX sin renderizar
  --shotlist script/shotlist.csv   tiempos reales de SFX (si tiene filas)
"""

from __future__ import annotations

import argparse
import csv
import json
import math
import os
import shutil
import subprocess
import sys
import tempfile
from dataclasses import dataclass, field
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DEFAULT_CUES = ROOT / "assets" / "audio" / "cues"
DEFAULT_SFX = ROOT / "assets" / "audio" / "sfx"
FFMPEG = os.environ.get("FFMPEG_BIN") or shutil.which("ffmpeg") or r"C:\Users\--X\Documents\rally-ganadores-2026\bin\ffmpeg.exe"
SR = 48_000

# Cue por acto: (nombre, inicio, fin, archivo, ganancia_db)
ACTS = [
    ("I",   0.0,  27.0, "cue_01_tension.mp3",      0.0),
    ("II",  27.0, 63.0, "cue_02_drive.mp3",        0.0),
    ("III", 63.0, 90.0, "cue_02b_confidence.mp3",  0.0),
    ("IV",  90.0, 120.0, "cue_03_resolve.mp3",     0.0),
]

# SFX por defecto (segundos, archivo, ganancia_db). El shotlist puede reemplazarlos.
DEFAULT_SFX_MAP = [
    (0.00,   "whoosh_acto.mp3", -7.0),
    (27.00,  "whoosh_acto.mp3", -5.0),
    (63.00,  "whoosh_acto.mp3", -5.0),
    (90.00,  "whoosh_acto.mp3", -4.0),
    (62.00,  "sub_drop.mp3",   -12.0),
    (87.00,  "riser_3s.mp3",    -9.0),
    (90.00,  "impact_bass.mp3", -5.0),
    (118.00, "impact_bass.mp3", -7.0),
    # demo de la app (Acto II): clics de tarjetas + tecleo
    (30.20,  "click_ui.mp3",   -13.0),
    (33.60,  "click_ui.mp3",   -13.0),
    (36.90,  "click_ui.mp3",   -14.0),
    (41.20,  "click_ui.mp3",   -13.0),
    (45.00,  "click_ui.mp3",   -14.0),
    (49.30,  "click_ui.mp3",   -14.0),
    (34.00,  "typing_loop.mp3", -19.0),
    # prefactibilidad / cierre
    (96.50,  "paper.mp3",      -15.0),
    (110.00, "click_ui.mp3",   -15.0),
]


# --------------------------------------------------------------------------- utilidades ffmpeg
def run(cmd: list[str], capture: bool = True) -> str:
    p = subprocess.run(cmd, capture_output=True, text=True, encoding="utf-8", errors="replace")
    if p.returncode != 0:
        tail = (p.stderr or "")[-4000:]
        raise RuntimeError(f"ffmpeg fallo ({p.returncode}):\n{' '.join(cmd)}\n{tail}")
    return p.stderr if capture else ""


def probe(path: Path) -> dict:
    """Duracion y streams sin ffprobe (solo hay ffmpeg en esta maquina)."""
    p = subprocess.run([FFMPEG, "-hide_banner", "-i", str(path)], capture_output=True, text=True,
                       encoding="utf-8", errors="replace")
    err = p.stderr or ""
    info = {"duration": None, "has_audio": False, "has_video": False}
    for line in err.splitlines():
        s = line.strip()
        if s.startswith("Duration:") and info["duration"] is None:
            hms = s.split("Duration:")[1].split(",")[0].strip()
            try:
                h, m, sec = hms.split(":")
                info["duration"] = int(h) * 3600 + int(m) * 60 + float(sec)
            except ValueError:
                pass
        if s.startswith("Stream") and "Audio:" in s:
            info["has_audio"] = True
        if s.startswith("Stream") and "Video:" in s:
            info["has_video"] = True
    return info


def measure(path: Path) -> dict:
    """LUFS integrado, LRA y true peak via ebur128."""
    err = run([FFMPEG, "-hide_banner", "-nostats", "-i", str(path), "-af", "ebur128=peak=true", "-f", "null", "-"])
    tail = err[err.rfind("Summary:"):]
    out: dict = {}
    for line in tail.splitlines():
        s = line.strip()
        try:
            if s.startswith("I:"):
                out["lufs_i"] = float(s.split()[1])
            elif s.startswith("LRA:"):
                out["lra"] = float(s.split()[1])
            elif s.startswith("Peak:"):
                out["true_peak_db"] = float(s.split()[1])
        except (IndexError, ValueError):
            continue
    return out


def loudnorm_measure(path: Path) -> dict:
    """Valores medidos de loudnorm (para la segunda pasada lineal)."""
    err = run([FFMPEG, "-hide_banner", "-nostats", "-i", str(path), "-af",
               "loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json", "-f", "null", "-"])
    i = err.rfind("{")
    j = err.rfind("}")
    if i < 0 or j < 0:
        return {}
    try:
        d = json.loads(err[i:j + 1])
    except json.JSONDecodeError:
        return {}
    out = {}
    for k in ("input_i", "input_lra", "input_tp", "input_thresh", "target_offset"):
        try:
            out[k] = float(d[k])
        except (KeyError, ValueError):
            continue
    return out


def decode_mono(path: Path, start: float = 0.0, dur: float | None = None) -> "object":
    """Decodifica a float32 mono 48 kHz (numpy)."""
    import numpy as np

    cmd = [FFMPEG, "-v", "error"]
    if start > 0:
        cmd += ["-ss", f"{start:.3f}"]
    if dur is not None:
        cmd += ["-t", f"{dur:.3f}"]
    cmd += ["-i", str(path), "-vn", "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"]
    p = subprocess.run(cmd, capture_output=True)
    if p.returncode != 0:
        raise RuntimeError(f"no se pudo decodificar {path}")
    return np.frombuffer(p.stdout, dtype="<f4").astype(np.float32)


def write_wav_stereo(path: Path, mono_or_stereo, sr: int = SR) -> Path:
    """Escribe WAV float32. Acepta mono (n,) o estereo (n,2)."""
    import numpy as np
    from scipy.io import wavfile

    x = np.asarray(mono_or_stereo, dtype=np.float32)
    if x.ndim == 1:
        x = np.stack([x, x], axis=1)
    wavfile.write(str(path), sr, np.clip(x, -1.0, 1.0))
    return path


# --------------------------------------------------------------------------- envolvente de ducking
def speech_gain_curve(voice_path: Path | None, start: float, dur: float, duck_db: float,
                      attack_ms: float = 60.0, release_ms: float = 400.0) -> tuple["object", dict]:
    """Curva de ganancia relativa (1.0 en pausas, 10^(-duck/20) bajo la voz).

    La ganancia absoluta la pone el bus musical (ver `bus_gain_db`).
    """
    import numpy as np

    n = int(round(dur * SR))
    base = 1.0
    ducked = 10 ** (-duck_db / 20.0)
    stats = {"voice_present": False, "speech_ratio": 0.0, "segments": 0}

    if voice_path is None or not Path(voice_path).exists():
        return np.full(n, base, dtype=np.float32), stats

    x = decode_mono(voice_path, start=start, dur=dur)
    if len(x) < SR // 10:
        return np.full(n, base, dtype=np.float32), stats

    frame = int(0.020 * SR)
    hop = int(0.010 * SR)
    nframes = max(1, 1 + (len(x) - frame) // hop)
    rms = np.empty(nframes, dtype=np.float32)
    for i in range(nframes):
        seg = x[i * hop: i * hop + frame]
        rms[i] = np.sqrt(np.mean(seg.astype(np.float64) ** 2) + 1e-12)
    dbv = 20 * np.log10(rms + 1e-9)

    floor = float(np.percentile(dbv, 15))
    peak = float(np.percentile(dbv, 97))
    hi = max(floor + 9.0, peak - 16.0)   # entra en "habla"
    lo = hi - 7.0                         # sale de "habla" (histeresis)

    speech = np.zeros(nframes, dtype=bool)
    active = False
    for i, d in enumerate(dbv):
        if active:
            active = d > lo
        else:
            active = d > hi
        speech[i] = active

    # rellena pausas cortas (<200 ms) y descarta islas (<120 ms)
    def fill(mask: np.ndarray, max_gap_frames: int) -> np.ndarray:
        out = mask.copy()
        i = 0
        while i < len(out):
            if not out[i]:
                j = i
                while j < len(out) and not out[j]:
                    j += 1
                if 0 < i and j < len(out) and (j - i) <= max_gap_frames:
                    out[i:j] = True
                i = j
            else:
                i += 1
        return out

    def drop_short(mask: np.ndarray, min_run: int) -> np.ndarray:
        out = mask.copy()
        i = 0
        while i < len(out):
            if out[i]:
                j = i
                while j < len(out) and out[j]:
                    j += 1
                if (j - i) < min_run:
                    out[i:j] = False
                i = j
            else:
                i += 1
        return out

    speech = fill(speech, int(0.20 / 0.010))
    speech = drop_short(speech, int(0.12 / 0.010))

    # objetivo por frame -> suavizado asimetrico a 10 ms -> interpolacion a muestras
    target = np.where(speech, ducked, base).astype(np.float32)
    a_att = math.exp(-1.0 / (attack_ms / 10.0))
    a_rel = math.exp(-1.0 / (release_ms / 10.0))
    smooth = np.empty(nframes, dtype=np.float32)
    cur = float(target[0])
    for i in range(nframes):
        tgt = float(target[i])
        a = a_att if tgt < cur else a_rel
        cur = a * cur + (1 - a) * tgt
        smooth[i] = cur
    t_idx = (np.arange(nframes) * hop).astype(np.float64)
    out = np.interp(np.arange(n), t_idx, smooth).astype(np.float32)

    stats["voice_present"] = True
    stats["speech_ratio"] = round(float(speech.mean()), 3)
    stats["segments"] = int(np.sum(np.diff(speech.astype(int)) == 1))
    stats["voice_floor_db"] = round(floor, 1)
    stats["voice_peak_db"] = round(peak, 1)
    stats["gate_hi_db"] = round(hi, 1)
    return out, stats


# --------------------------------------------------------------------------- plan
@dataclass
class Plan:
    acts: list[tuple[str, float, float, Path, float]]
    sfx: list[tuple[float, Path, float]]
    total: float
    voice: Path | None
    video: Path | None
    music_db: float
    duck_db: float
    bus_gain: float = -4.0
    stems: Path | None = None
    notes: list[str] = field(default_factory=list)


def build_sfx_map(shotlist: Path | None, sfx_dir: Path) -> tuple[list, list[str]]:
    """SFX por defecto; si el shotlist tiene filas, ajusta clics/tecleo a los planos reales."""
    notes: list[str] = []
    entries = list(DEFAULT_SFX_MAP)
    if shotlist and shotlist.exists():
        rows = list(csv.DictReader(shotlist.open(encoding="utf-8")))
        rows = [r for r in rows if (r.get("id") or "").strip()]
        if rows:
            t = 0.0
            derived: list[tuple[float, str, float]] = []
            for r in rows:
                try:
                    dur = float(r.get("duration_s") or 0)
                except ValueError:
                    dur = 0.0
                desc = " ".join(str(r.get(k, "")) for k in ("description", "visual_notes", "asset_type")).lower()
                act = str(r.get("act", "")).upper()
                if any(k in desc for k in ("card", "tarjeta", "boton", "botón", "ui", "pantalla", "app", "mapa")):
                    derived.append((round(t + 0.25, 2), "click_ui.mp3", -13.0))
                if any(k in desc for k in ("escribe", "teclea", "typing", "input", "formulario")):
                    derived.append((round(t + 0.15, 2), "typing_loop.mp3", -19.0))
                if any(k in desc for k in ("documento", "papel", "informe", "pdf")):
                    derived.append((round(t + 0.3, 2), "paper.mp3", -15.0))
                if act in ("A4", "IV") and not derived:
                    pass
                t += dur
            if derived:
                keep = [e for e in entries if "click_ui" not in e[1] and "typing_loop" not in e[1] and "paper" not in e[1]]
                entries = keep + derived
                notes.append(f"SFX de UI tomados de {shotlist.name} ({len(derived)} marcas)")
            else:
                notes.append(f"{shotlist.name} sin filas utiles: se usan los SFX por defecto")
        else:
            notes.append(f"{shotlist.name} no tiene planos todavia: se usan los SFX por defecto")
    out = [(at, sfx_dir / name, g) for at, name, g in entries if (sfx_dir / name).exists()]
    missing = {name for _, name, _ in entries if not (sfx_dir / name).exists()}
    if missing:
        notes.append("SFX faltantes: " + ", ".join(sorted(missing)))
    return out, notes


def build_plan(args) -> Plan:
    cues_dir = Path(args.cues)
    sfx_dir = Path(args.sfx)
    video = Path(args.video) if args.video else None
    voice = Path(args.voice) if args.voice else None

    vinfo = probe(video) if video and video.exists() else {"duration": None, "has_audio": False, "has_video": False}
    notes: list[str] = []

    total = 120.0
    if video and vinfo.get("duration"):
        total = min(120.0, float(vinfo["duration"]))
    elif voice and voice.exists():
        total = min(120.0, float(probe(voice).get("duration") or 120.0))
    if total < 119.5:
        notes.append(f"duracion del video {total:.1f} s: la cama se recorta al final del acto que corresponda")

    if voice is None and video and vinfo.get("has_audio"):
        voice = video
        notes.append("sin --voice: se usa el audio original del video como voz (y se reemplaza en la salida)")

    acts = []
    for name, s, e, fname, g in ACTS:
        if s >= total - 0.05:
            continue
        p = cues_dir / fname
        if not p.exists():
            raise SystemExit(f"FALTA el cue {p}. Corre: python tools/make_audio_assets.py")
        acts.append((name, s, min(e, total), p, g))

    sfx, sfx_notes = build_sfx_map(Path(args.shotlist) if args.shotlist else None, sfx_dir)
    notes += sfx_notes

    return Plan(acts=acts, sfx=[s for s in sfx if s[0] < total], total=total, voice=voice, video=video,
                music_db=args.music_db, duck_db=args.duck_db, notes=notes)


# --------------------------------------------------------------------------- grafo ffmpeg
def music_chain(plan: Plan, start: float, dur: float, env_path: Path | None, inputs: dict[str, int]) -> tuple[list[str], str]:
    """Cama musical: cues por acto con crossfade en los cortes, corte y ducking."""
    parts: list[str] = []
    labels: list[str] = []
    n = len(plan.acts)
    xf = 0.35  # solape del crossfade en cada corte de acto

    for i, (_name, s, e, _path, gain) in enumerate(plan.acts):
        idx = inputs[f"cue{i}"]
        act_len = max(0.4, e - s)
        seg = act_len + (xf if i < n - 1 else 0.0)  # cada cue cede el solape al siguiente
        parts.append(
            f"[{idx}:a]aformat=sample_fmts=fltp:channel_layouts=stereo,aresample={SR},"
            f"atrim=0:{seg:.3f},asetpts=PTS-STARTPTS,volume={gain:.2f}dB[m{i}]"
        )
        labels.append(f"[m{i}]")

    if n == 1:
        parts.append(f"{labels[0]}anull[musicfull]")
    else:
        cur = labels[0]
        for i in range(1, n):
            out = "[musicfull]" if i == n - 1 else f"[xf{i}]"
            parts.append(f"{cur}{labels[i]}acrossfade=d={xf}:c1=tri:c2=tri{out}")
            cur = out

    parts.append(f"[musicfull]atrim={start:.3f}:{start + dur:.3f},asetpts=PTS-STARTPTS,"
                 f"afade=t=in:st=0:d=0.30,afade=t=out:st={max(dur - 1.0, 0.1):.3f}:d=1.0[musiccut]")
    if env_path is not None:
        parts.append(f"[{inputs['env']}:a]aformat=sample_fmts=fltp:channel_layouts=stereo,aresample={SR},"
                     f"atrim=0:{dur:.3f},asetpts=PTS-STARTPTS[env]")
        parts.append(f"[musiccut][env]amultiply,volume={plan.bus_gain:.2f}dB[musicraw]")
        return parts, "[musicraw]"
    parts.append(f"[musiccut]volume={plan.bus_gain:.2f}dB[musicraw]")
    return parts, "[musicraw]"


def voice_chain(plan: Plan, start: float, dur: float, inputs: dict[str, int]) -> tuple[list[str], str]:
    if plan.voice is not None:
        vi = inputs["voice"]
        return ([f"[{vi}:a]aformat=sample_fmts=fltp:channel_layouts=stereo,aresample={SR},"
                 f"atrim={start:.3f}:{start + dur:.3f},asetpts=PTS-STARTPTS,"
                 f"highpass=f=85,acompressor=threshold=0.12:ratio=2.5:attack=8:release=180:makeup=1[voxraw]"],
                "[voxraw]")
    return ([f"anullsrc=r={SR}:cl=stereo,atrim=0:{dur:.3f}[voxraw]"], "[voxraw]")


def sfx_chain(plan: Plan, start: float, dur: float, inputs: dict[str, int], with_sfx: bool) -> tuple[list[str], str]:
    if not with_sfx or not plan.sfx:
        return ([f"anullsrc=r={SR}:cl=stereo,atrim=0:{dur:.3f}[sfxraw]"], "[sfxraw]")
    parts: list[str] = []
    labels: list[str] = []
    for i, (at, _path, g) in enumerate(plan.sfx):
        if at < start or at >= start + dur:
            continue
        idx = inputs[f"sfx{i}"]
        delay = int(round((at - start) * 1000))
        parts.append(f"[{idx}:a]aformat=sample_fmts=fltp:channel_layouts=stereo,aresample={SR},"
                     f"volume={g:.1f}dB,adelay={delay}|{delay}[s{i}]")
        labels.append(f"[s{i}]")
    if not labels:
        return ([f"anullsrc=r={SR}:cl=stereo,atrim=0:{dur:.3f}[sfxraw]"], "[sfxraw]")
    parts.append("".join(labels) + f"amix=inputs={len(labels)}:normalize=0:duration=longest,"
                                   f"atrim=0:{dur:.3f},asetpts=PTS-STARTPTS[sfxraw]")
    return parts, "[sfxraw]"


def build_graph(plan: Plan, start: float, dur: float, env_path: Path | None,
                inputs: dict[str, int], with_sfx: bool) -> tuple[str, str]:
    """Grafo del master completo. Devuelve (filter_complex, etiqueta del master)."""
    mp, ml = music_chain(plan, start, dur, env_path, inputs)
    vp, vl = voice_chain(plan, start, dur, inputs)
    sp, sl = sfx_chain(plan, start, dur, inputs, with_sfx)
    parts = mp + vp + sp
    parts.append(f"{ml}{vl}{sl}amix=inputs=3:normalize=0:duration=longest[premix]")
    return ";".join(parts), "[premix]"


def build_stem_graph(plan: Plan, start: float, dur: float, env_path: Path | None,
                     inputs: dict[str, int], with_sfx: bool, which: str) -> tuple[str, str]:
    """Grafo de un solo bus (para medir stems sin asplit)."""
    if which == "music":
        parts, label = music_chain(plan, start, dur, env_path, inputs)
    elif which == "voice":
        parts, label = voice_chain(plan, start, dur, inputs)
    else:
        parts, label = sfx_chain(plan, start, dur, inputs, with_sfx)
    return ";".join(parts), label


# --------------------------------------------------------------------------- render
def render(args) -> dict:
    plan = build_plan(args)
    out = Path(args.out)
    out.parent.mkdir(parents=True, exist_ok=True)
    total = plan.total
    start = float(args.start or 0.0)
    dur = float(args.dur) if args.dur else max(0.5, total - start)
    dur = min(dur, max(0.5, total - start))
    tmp = Path(tempfile.mkdtemp(prefix="rally_mix_"))
    report: dict = {"out": str(out), "video": str(plan.video) if plan.video else None,
                    "voice": str(plan.voice) if plan.voice else None,
                    "start": round(start, 3), "dur": round(dur, 3),
                    "music_db": plan.music_db, "duck_db": plan.duck_db, "notes": plan.notes,
                    "acts": [{"act": a[0], "from": a[1], "to": a[2], "cue": a[3].name} for a in plan.acts]}

    # 1) nivel de la voz (para anclar la musica, no al reves)
    voice_lufs = None
    if plan.voice is not None:
        vtmp = tmp / "voice_level.wav"
        vparts, vlabel = voice_chain(plan, start, dur, {"voice": 0})
        run([FFMPEG, "-y", "-v", "error", "-i", str(plan.voice), "-filter_complex", ";".join(vparts),
             "-map", vlabel, "-t", f"{dur:.3f}", "-c:a", "pcm_f32le", str(vtmp)])
        voice_lufs = measure(vtmp).get("lufs_i")
    report["voice_lufs"] = voice_lufs

    # la musica se ancla a la voz: nunca mas cerca que `--voice-margin` dB bajo ella
    cue_lufs = -18.0
    margin = float(args.voice_margin)
    bus_gain = plan.music_db
    if voice_lufs is not None:
        ceiling = voice_lufs - margin + abs(cue_lufs) + plan.duck_db  # = voz - margen + 18 + duck
        bus_gain = min(plan.music_db, ceiling)
        if bus_gain < plan.music_db - 0.05:
            report["notes"].append(
                f"musica bajada a {bus_gain:+.1f} dB para dejar {margin:.0f} dB bajo la voz ({voice_lufs:.1f} LUFS)")
    report["music_bus_db"] = round(float(bus_gain), 1)
    plan.bus_gain = bus_gain

    # 2) envolvente de ducking (relativa: 0 dB en pausas, -duck bajo la voz)
    env_path = None
    env_stats = {}
    if plan.voice is not None:
        try:
            env, env_stats = speech_gain_curve(plan.voice, start, dur, plan.duck_db)
            env_path = write_wav_stereo(tmp / "duck_env.wav", env)
        except Exception as exc:  # degradacion: sin ducking antes que romper el render
            report["notes"].append(f"ducking desactivado ({exc})")
            env_path = None
    report["ducking"] = env_stats

    # 3) entradas
    in_args: list[str] = []
    inputs: dict[str, int] = {}
    idx = 0

    if plan.video is not None:
        if start > 0:
            in_args += ["-ss", f"{start:.3f}"]
        in_args += ["-i", str(plan.video)]
        inputs["video"] = idx
        idx += 1

    if plan.voice is not None:
        in_args += ["-i", str(plan.voice)]
        inputs["voice"] = idx
        idx += 1

    for i, (_n, _s, _e, path, _g) in enumerate(plan.acts):
        in_args += ["-i", str(path)]
        inputs[f"cue{i}"] = idx
        idx += 1

    for i, (at, path, _g) in enumerate(plan.sfx):
        if start <= at < start + dur:
            in_args += ["-i", str(path)]
            inputs[f"sfx{i}"] = idx
            idx += 1

    if env_path is not None:
        in_args += ["-i", str(env_path)]
        inputs["env"] = idx
        idx += 1

    with_sfx = not args.no_sfx
    stem_dir = Path(args.stems) if args.stems else None
    graph, master = build_graph(plan, start, dur, env_path, inputs, with_sfx)

    # 3) stems (opcional): un ffmpeg por bus, sin asplit
    if stem_dir:
        stem_dir.mkdir(parents=True, exist_ok=True)
        for key, name in (("music", "music_ducked.wav"), ("voice", "voice.wav"), ("sfx", "sfx.wav")):
            if key == "sfx" and not with_sfx:
                continue
            sg, slabel = build_stem_graph(plan, start, dur, env_path, inputs, with_sfx, key)
            run([FFMPEG, "-y", "-v", "error"] + in_args + ["-filter_complex", sg,
                 "-map", slabel, "-t", f"{dur:.3f}", "-c:a", "pcm_f32le", str(stem_dir / name)])

    # 4) master a WAV, medir, y segunda pasada loudnorm lineal
    premaster = tmp / "premaster.wav"
    map_args = ["-map", master, "-t", f"{dur:.3f}", "-c:a", "pcm_f32le", str(premaster)]
    run([FFMPEG, "-y", "-v", "error"] + in_args + ["-filter_complex", graph] + map_args)

    m = measure(premaster)
    ln = loudnorm_measure(premaster)
    i_target, tp_target = -14.0, -2.0  # -2.0 en el limitador: el AAC sube ~0.3 dB el true peak
    af = (f"loudnorm=I={i_target}:TP={tp_target}:LRA=11:"
          f"measured_I={ln.get('input_i', m.get('lufs_i', i_target))}:"
          f"measured_LRA={ln.get('input_lra', m.get('lra', 7))}:"
          f"measured_TP={ln.get('input_tp', m.get('true_peak_db', -2))}:"
          f"measured_thresh={ln.get('input_thresh', -30)}:offset={ln.get('target_offset', 0)}:linear=true,"
          f"alimiter=limit={10 ** (tp_target / 20):.4f}:level=false")
    report["premaster"] = m

    # 5) salida final
    out_cmd = [FFMPEG, "-y", "-v", "error"]
    if plan.video is not None:
        out_cmd += (["-ss", f"{start:.3f}"] if start > 0 else []) + ["-i", str(plan.video)]
        out_cmd += ["-i", str(premaster)]
        out_cmd += ["-filter_complex", f"[1:a]{af}[aout]", "-map", "0:v:0", "-map", "[aout]",
                    "-c:v", "copy", "-c:a", "aac", "-b:a", "192k", "-ar", str(SR),
                    "-t", f"{dur:.3f}", "-movflags", "+faststart", str(out)]
    else:
        out_cmd += ["-i", str(premaster), "-af", af, "-c:a", "aac", "-b:a", "192k", "-ar", str(SR), str(out)]
    run(out_cmd)

    report["final"] = measure(out)
    report["loudness_ok"] = (abs(report["final"].get("lufs_i", -99) + 14) <= 1.0
                             and report["final"].get("true_peak_db", -99) <= -1.5)
    if m.get("lufs_i") is not None and report["final"].get("lufs_i") is not None:
        report["master_gain_db"] = round(float(report["final"]["lufs_i"] - m["lufs_i"]), 1)

    # 6) musica bajo la voz (si hay stems)
    if stem_dir and env_stats.get("voice_present"):
        report["music_under_voice"] = analyse_ducking(stem_dir / "music_ducked.wav", tmp / "duck_env.wav",
                                                      stem_dir / "voice.wav", plan.duck_db)
        report["stems_lufs"] = {k: measure(stem_dir / f"{k}.wav") for k in ("music_ducked", "voice", "sfx")
                                if (stem_dir / f"{k}.wav").exists()}
        mv = report["stems_lufs"].get("music_ducked", {}).get("lufs_i")
        vv = report["stems_lufs"].get("voice", {}).get("lufs_i")
        if mv is not None and vv is not None:
            report["voice_minus_music_lufs"] = round(float(vv - mv), 1)
        # niveles referidos al master final (lo que suena en el archivo entregado)
        g = report.get("master_gain_db", 0.0)
        mu = report["music_under_voice"]
        report["master_ref"] = {
            "voice_lufs": round(float(vv + g), 1) if vv is not None else None,
            "music_under_voice_dbfs": round(mu["music_rms_under_voice_dbfs"] + g, 1),
            "music_in_pauses_dbfs": round(mu["music_rms_in_pauses_dbfs"] + g, 1),
            "sfx_peak_dbfs": round(float(report["stems_lufs"].get("sfx", {}).get("true_peak_db", -99) + g), 1),
        }

    shutil.rmtree(tmp, ignore_errors=True)
    return report


def analyse_ducking(music_stem: Path, env_path: Path, voice_stem: Path, duck_db: float) -> dict:
    """Niveles reales: musica bajo la voz, musica en pausas, y margen voz-musica."""
    import numpy as np
    from scipy.io import wavfile

    def read_mono(p: Path):
        sr, x = wavfile.read(str(p))
        x = np.asarray(x, dtype=np.float32)
        if x.ndim == 2:
            x = x.mean(axis=1)
        return sr, x

    sr, music = read_mono(music_stem)
    _, env = read_mono(env_path)
    _, vox = read_mono(voice_stem)
    n = min(len(music), len(env), len(vox))
    music, env, vox = music[:n], env[:n], vox[:n]

    thr = 10 ** (-duck_db / 40.0)  # punto medio entre 0 dB y -duck
    ducked = env < thr
    base = env >= thr
    fully_ducked = env < (10 ** (-duck_db / 20.0)) * 1.15
    fully_base = env > 0.92

    def rms_db(x, mask):
        if not mask.any():
            return float("nan")
        return 20 * np.log10(np.sqrt(np.mean(x[mask].astype(np.float64) ** 2)) + 1e-12)

    under = rms_db(music, fully_ducked if fully_ducked.any() else ducked)
    pause = rms_db(music, fully_base if fully_base.any() else base)
    voice = rms_db(vox, fully_ducked if fully_ducked.any() else np.ones_like(vox, dtype=bool))
    return {"music_rms_under_voice_dbfs": round(under, 1),
            "music_rms_in_pauses_dbfs": round(pause, 1),
            "duck_depth_db": round(float(pause - under), 1) if base.any() and ducked.any() else None,
            "voice_rms_dbfs": round(voice, 1),
            "voice_minus_music_db": round(float(voice - under), 1) if ducked.any() else None,
            "speech_ratio": round(float(ducked.mean()), 3)}


# --------------------------------------------------------------------------- cli
def print_plan(plan: Plan) -> None:
    print("MAPA DE CUES")
    for name, s, e, path, g in plan.acts:
        print(f"  Acto {name:<3} {s:6.2f}-{e:6.2f}s  {path.name:<26} {g:+.1f} dB")
    print("SFX")
    for at, path, g in sorted(plan.sfx):
        print(f"  {at:7.2f}s  {path.name:<20} {g:+.1f} dB")
    print(f"Total {plan.total:.1f}s | musica {plan.music_db:+.1f} dB | duck {plan.duck_db:.1f} dB")
    for n in plan.notes:
        print(f"  nota: {n}")


def main() -> int:
    global FFMPEG
    ap = argparse.ArgumentParser(description="Mezcla cues + voz + SFX para el video del rally")
    ap.add_argument("--video", default=None, help="video de entrada (opcional: sin video se exporta solo audio)")
    ap.add_argument("--voice", default=None, help="locucion (mp3/wav/mp4). Si falta, usa el audio del video")
    ap.add_argument("--out", default=None, help="salida (.mp4 si hay video, .m4a/.mp3 si no)")
    ap.add_argument("--start", type=float, default=0.0)
    ap.add_argument("--dur", type=float, default=None)
    ap.add_argument("--cues", default=str(DEFAULT_CUES))
    ap.add_argument("--sfx", default=str(DEFAULT_SFX))
    ap.add_argument("--shotlist", default=str(ROOT / "script" / "shotlist.csv"))
    ap.add_argument("--music-db", type=float, default=-4.0, help="nivel de la cama en pausas (dB sobre el cue)")
    ap.add_argument("--duck-db", type=float, default=6.0, help="cuanto baja la musica bajo la voz")
    ap.add_argument("--voice-margin", type=float, default=14.0,
                    help="dB minimos entre la voz y la musica duckeada (baja la musica si hace falta)")
    ap.add_argument("--no-sfx", action="store_true")
    ap.add_argument("--stems", default=None, help="carpeta para exportar music/voice/sfx")
    ap.add_argument("--measure", action="store_true", help="imprime el informe JSON")
    ap.add_argument("--report-json", default=None, help="guarda el informe en un archivo")
    ap.add_argument("--print-plan", action="store_true")
    ap.add_argument("--ffmpeg", default=FFMPEG)
    args = ap.parse_args()

    FFMPEG = args.ffmpeg
    if not Path(FFMPEG).exists() and not shutil.which(FFMPEG):
        print(f"ERROR: ffmpeg no encontrado ({FFMPEG})", file=sys.stderr)
        return 2

    if args.print_plan:
        print_plan(build_plan(args))
        return 0

    if not args.out:
        ap.error("--out es obligatorio (o usa --print-plan)")

    report = render(args)
    if args.report_json:
        p = Path(args.report_json)
        p.parent.mkdir(parents=True, exist_ok=True)
        p.write_text(json.dumps(report, indent=2, ensure_ascii=False), encoding="utf-8")
    print(json.dumps(report, indent=2, ensure_ascii=False))
    return 0 if report.get("loudness_ok") else 1


if __name__ == "__main__":
    raise SystemExit(main())
