#!/usr/bin/env python3
"""
Sincroniza la carpeta madre skills/ hacia .agents/skills/ y .opencode/skills/.
skills/ es la única fuente de verdad.
"""
from pathlib import Path
import shutil
import sys

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "skills"
DESTS = [
    ROOT / ".agents" / "skills",
    ROOT / ".opencode" / "skills",
]

def sync():
    if not SRC.exists():
        print(f"[ERROR] Origen no existe: {SRC}", file=sys.stderr)
        sys.exit(1)

    for dest in DESTS:
        dest.mkdir(parents=True, exist_ok=True)
        for item in SRC.iterdir():
            target = dest / item.name
            if item.is_dir():
                target.mkdir(parents=True, exist_ok=True)
                for subitem in item.iterdir():
                    subtarget = target / subitem.name
                    try:
                        if not subtarget.exists() or subitem.read_bytes() != subtarget.read_bytes():
                            shutil.copy2(subitem, subtarget)
                    except PermissionError:
                        pass
            else:
                try:
                    if not target.exists() or item.read_bytes() != target.read_bytes():
                        shutil.copy2(item, target)
                except PermissionError:
                    pass
        print(f"[OK] Sincronizado: skills/ -> {dest.relative_to(ROOT)}")

if __name__ == "__main__":
    sync()
