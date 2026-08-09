from __future__ import annotations

from .types import Rut


def format(rut: Rut, *, dots: bool = True, uppercase: bool = True) -> str:
    """Format a validated RUT for display."""

    body = rut[:-1]
    verifier = rut[-1] if uppercase else rut[-1].lower()

    if not dots:
        return f"{body}-{verifier}"

    result = f"{body[-3:]}-{verifier}"
    rest = body[:-3]

    while len(rest) > 3:
        result = f"{rest[-3:]}.{result}"
        rest = rest[:-3]

    if rest:
        result = f"{rest}.{result}"

    return result
