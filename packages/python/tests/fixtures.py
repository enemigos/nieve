from __future__ import annotations

import json
from pathlib import Path
from typing import Any

_DIRECTORY = Path(__file__).resolve().parents[3] / "fixtures"


def load(name: str) -> Any:
    return json.loads((_DIRECTORY / name).read_text(encoding="utf-8"))


VALID: list[dict[str, str]] = load("valid.json")
INVALID: list[dict[str, Any]] = load("invalid.json")
CLEANED: list[dict[str, str]] = load("clean.json")
VERIFIERS: list[dict[str, str | None]] = load("verifier.json")
MESSAGES: list[dict[str, Any]] = load("messages.json")
COMPARISONS: list[dict[str, Any]] = load("compare.json")
FORMATS: dict[str, Any] = load("format.json")
CONFORMANCE: list[dict[str, Any]] = load("conformance.json")["cases"]
