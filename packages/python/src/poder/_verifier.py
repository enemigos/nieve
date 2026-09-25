from __future__ import annotations

import re

from ._syntax import (
    BODY_SYNTAX,
    MAX_BODY_LENGTH,
    MIN_BODY_LENGTH,
    strip_separators,
    trim_whitespace,
)

_DIGITS = re.compile(r"[0-9]+")


def _calculate_verifier(body: str) -> str:
    """Compute the modulo-11 verifier for a body of digits.

    Internal: callers must pass a body that already matched the syntax rules.
    """
    if _DIGITS.fullmatch(body) is None:
        raise ValueError(f'"{body}" is not a RUT body')

    total = sum(
        int(char) * ((index % 6) + 2) for index, char in enumerate(reversed(body))
    )
    digit = 11 - (total % 11)

    if digit == 10:
        return "K"
    if digit == 11:
        return "0"
    return str(digit)


def get_verifier(input: object) -> str | None:
    """Compute the verifier for a RUT body.

    Accepts the same body syntax as ``parse``, with an optional trailing hyphen
    and surrounding whitespace. Returns ``None`` for anything else.
    """
    if not isinstance(input, str):
        return None

    value = trim_whitespace(input)

    if BODY_SYNTAX.fullmatch(value) is None:
        return None

    body = strip_separators(value)

    if not MIN_BODY_LENGTH <= len(body) <= MAX_BODY_LENGTH:
        return None

    return _calculate_verifier(body)
