#!/usr/bin/env python3
"""Fail when the npm and PyPI packages do not carry the same version.

The two packages document identical behavior, so they are released in lockstep.
This runs in CI for both jobs.

Usage: python scripts/check_versions.py
"""

from __future__ import annotations

import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PACKAGE_JSON = ROOT / "packages" / "js" / "package.json"
PYPROJECT = ROOT / "packages" / "python" / "pyproject.toml"


def main() -> int:
    js_version = json.loads(PACKAGE_JSON.read_text(encoding="utf-8"))["version"]

    match = re.search(
        r'^version\s*=\s*"([^"]+)"',
        PYPROJECT.read_text(encoding="utf-8"),
        re.MULTILINE,
    )
    if match is None:
        print(f"no version found in {PYPROJECT.relative_to(ROOT)}", file=sys.stderr)
        return 1

    python_version = match.group(1)

    if js_version != python_version:
        print(
            "version mismatch: "
            f"@dud-cl/rut is {js_version}, dud-cl-rut is {python_version}. "
            "Release both packages with the same version.",
            file=sys.stderr,
        )
        return 1

    print(f"both packages are at {js_version}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
