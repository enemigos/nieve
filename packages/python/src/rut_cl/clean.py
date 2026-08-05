from __future__ import annotations

import re

_CLEAN_RE = re.compile(r"^0+|[^0-9kK]+")


def clean(input: object) -> str:
    """Normalize a RUT-like value: strip non-digits/K, uppercase K, drop leading zeros.

    Does not validate check digit or format.
    """
    if not isinstance(input, str):
        return ""
    return _CLEAN_RE.sub("", input).upper()
