"""Almacén de propuestas de contenido y espejo del estado del usuario.

El buzón (`<root>/content/<id>.json`) es donde el agente (b) deja propuestas
para que la ventana (a) las muestre como aceptar/descartar. El espejo
(`<root>/state.json`) es una copia de solo lectura del estado que vive en el
navegador, para que (b) sepa qué tiene el usuario sin preguntar a ciegas.

Este módulo no sabe nada de HTTP: solo de archivos.
"""

from __future__ import annotations

import json
import re
import sys
import uuid
from pathlib import Path

ALLOWED_TABS = [
    "certamen",
    "team",
    "challenges",
    "solution",
    "impact",
    "multi_ai",
    "pautado",
    "budget",
    "resources",
    "canvas",
    "script",
    "webdemo",
    "timeline",
]

_PAUTADO_SLOTS = ["problema", "solucion", "impacto", "innovacion", "prefactibilidad"]

SLOTS_BY_TAB: dict[str, list[str]] = {tab: ["main"] for tab in ALLOWED_TABS}
SLOTS_BY_TAB["pautado"] = _PAUTADO_SLOTS
SLOTS_BY_TAB["budget"] = ["costos"]
SLOTS_BY_TAB["script"] = ["acto1", "acto2", "acto3", "acto4"]

ITEM_ID_RE = re.compile(r"^[a-z0-9][a-z0-9_-]{0,80}$")

MAX_BYTES = 5 * 1024 * 1024

REQUIRED_FIELDS = ("id", "tab", "slot", "kind", "payload", "simulated")


def validate_envelope(env: dict) -> list[str]:
    """Devuelve la lista de problemas del sobre. Vacía si es válido."""
    if not isinstance(env, dict):
        return ["el sobre no es un objeto"]

    errors: list[str] = []

    item_id = env.get("id")
    if not isinstance(item_id, str) or not ITEM_ID_RE.match(item_id):
        errors.append("id inválido")

    tab = env.get("tab")
    if tab not in ALLOWED_TABS:
        errors.append(f"tab inválido: {tab!r}")
    else:
        slot = env.get("slot")
        if slot not in SLOTS_BY_TAB[tab]:
            errors.append(f"slot inválido para {tab}: {slot!r}")

    kind = env.get("kind")
    if not isinstance(kind, str) or not kind.strip():
        errors.append("kind vacío")

    for field in REQUIRED_FIELDS:
        if field not in env:
            errors.append(f"falta {field}")

    if "simulated" in env and not isinstance(env["simulated"], bool):
        errors.append("simulated debe ser booleano")

    if "payload" in env and not isinstance(env["payload"], dict):
        errors.append("payload debe ser un objeto")

    return errors


def _raiz_en_path() -> None:
    aqui = Path(__file__).resolve().parent
    for ruta in (aqui.parent, aqui):
        if str(ruta) not in sys.path:
            sys.path.insert(0, str(ruta))


def revisar_contenido(tab: str, slot: str, payload: dict, evento: str = "latam") -> list[str]:
    """Lo que el humano va a leer se revisa antes de llegar a la ventana.

    Slop de IA y topes de caracteres salen de su fuente unica: no se repiten
    aqui ni se relajan para que pase una propuesta.
    """
    if not isinstance(payload, dict):
        return ["payload debe ser un objeto"]
    _raiz_en_path()
    from check_anti_generico import chequear_slop_ia
    from checks.campo_chars import limites_para

    problemas: list[str] = []
    if tab in ("pautado", "script"):
        texto = payload.get("text")
        if not isinstance(texto, str):
            return ["falta texto"]
        for _, patron, _desc in chequear_slop_ia(texto):
            problemas.append(f"slop: {patron}")
        if tab == "pautado":
            tope = limites_para(evento or "latam").get(slot)
            if tope and len(texto) > tope:
                problemas.append(f"{slot}: {len(texto)} > {tope} caracteres")
        return problemas

    if tab == "budget":
        items = payload.get("items")
        if not isinstance(items, list) or not items:
            return ["budget sin items"]
        for i, fila in enumerate(items):
            if not isinstance(fila, dict):
                problemas.append(f"fila {i}: no es un objeto")
                continue
            for campo in ("element", "units", "unit_cost", "url"):
                if campo == "element":
                    # El puente de la ventana acepta element o concept (AGENTS.md).
                    valor = fila.get("element") or fila.get("concept")
                else:
                    valor = fila.get(campo)
                if valor is None or (isinstance(valor, str) and not valor.strip()):
                    problemas.append(f"fila {i}: falta {campo}")
        return problemas

    return problemas


class ContentStore:
    """Acceso a archivos del buzón y del espejo de estado."""

    def __init__(self, root: Path):
        self.root = Path(root)
        self.content_dir = self.root / "content"
        self.state_path = self.root / "state.json"
        self.applied_dir = self.root / "applied"
        self.discarded_dir = self.root / "discarded"

    # -- esquema ---------------------------------------------------------

    def schema(self) -> dict:
        return {
            "tabs": list(ALLOWED_TABS),
            "slots": {tab: list(slots) for tab, slots in SLOTS_BY_TAB.items()},
        }

    # -- buzón -----------------------------------------------------------

    def _item_path(self, item_id: str) -> Path:
        if not isinstance(item_id, str) or not ITEM_ID_RE.match(item_id):
            raise KeyError(item_id)
        return self.content_dir / f"{item_id}.json"

    def _entries(self) -> list[Path]:
        if not self.content_dir.is_dir():
            return []
        return sorted(
            p for p in self.content_dir.iterdir() if p.is_file() and p.suffix == ".json"
        )

    def _load_valid(self, path: Path) -> dict | None:
        try:
            if path.stat().st_size > MAX_BYTES:
                return None
        except OSError:
            return None
        try:
            env = json.loads(path.read_text(encoding="utf-8-sig"))
        except (OSError, ValueError, RecursionError):
            return None
        if not isinstance(env, dict):
            return None
        if env.get("id") != path.stem:
            return None
        if validate_envelope(env):
            return None
        return env

    @staticmethod
    def _texto(valor) -> str:
        """Normaliza a texto: un created_at numérico de otra IA no rompe el orden."""
        if valor is None:
            return ""
        return valor if isinstance(valor, str) else str(valor)

    @classmethod
    def _summary(cls, env: dict) -> dict:
        return {
            "id": env["id"],
            "tab": env["tab"],
            "slot": env["slot"],
            "kind": env["kind"],
            "title": cls._texto(env.get("title")),
            "source": cls._texto(env.get("source")),
            "created_at": cls._texto(env.get("created_at")),
            "confidence": cls._texto(env.get("confidence")),
            "simulated": bool(env.get("simulated", False)),
        }

    def manifest(self) -> dict:
        items: list[dict] = []
        version = 0

        # La versión también tiene en cuenta la mtime del directorio: al
        # aplicar o descartar se borra un archivo y el manifiesto debe cambiar.
        if self.content_dir.is_dir():
            try:
                version = self.content_dir.stat().st_mtime_ns
            except OSError:
                version = 0

        for path in self._entries():
            try:
                version = max(version, path.stat().st_mtime_ns)
            except OSError:
                continue
            env = self._load_valid(path)
            if env is None:
                continue
            items.append(self._summary(env))

        items.sort(key=lambda i: (i["created_at"], i["id"]), reverse=True)
        return {"version": int(version), "items": items}

    def read(self, item_id: str) -> dict:
        path = self._item_path(item_id)
        if not path.is_file():
            raise KeyError(item_id)
        env = self._load_valid(path)
        if env is None:
            raise KeyError(item_id)
        return env

    def _move(self, item_id: str, target_dir: Path) -> None:
        src = self._item_path(item_id)
        target_dir.mkdir(parents=True, exist_ok=True)
        dst = target_dir / src.name
        try:
            if src.is_file():
                src.replace(dst)
        except FileNotFoundError:
            # Otra pestaña la movió entre la comprobación y el reemplazo:
            # el resultado deseado (ya no está en el buzón) se cumple igual.
            pass

    def apply(self, item_id: str) -> None:
        self._move(item_id, self.applied_dir)

    def discard(self, item_id: str) -> None:
        self._move(item_id, self.discarded_dir)

    # -- espejo de estado ------------------------------------------------

    def read_state(self) -> dict | None:
        if not self.state_path.is_file():
            return None
        try:
            data = json.loads(self.state_path.read_text(encoding="utf-8-sig"))
        except (OSError, ValueError, RecursionError):
            return None
        return data if isinstance(data, dict) else None

    def write_state(self, state: dict) -> None:
        self.root.mkdir(parents=True, exist_ok=True)
        tmp = self.state_path.with_name(f"state.{uuid.uuid4().hex}.tmp")
        tmp.write_text(json.dumps(state, ensure_ascii=False), encoding="utf-8")
        tmp.replace(self.state_path)
