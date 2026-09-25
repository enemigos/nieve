from __future__ import annotations

import re

_UNRELATED = re.compile(r"[^0-9kK]+")


def clean(input: object) -> str:
    """Strip everything that is not a digit or ``K``, uppercase, drop leading zeros.

    This is a lossy normalizer, not a validator: it happily turns unrelated text
    into a RUT-looking string, and returns an empty string for non-string input.
    Always pass the result through ``parse``, ``safe_parse``, or ``is_rut``
    before using it.
    """
    if not isinstance(input, str):
        return ""

    return _UNRELATED.sub("", input).lstrip("0").upper()
