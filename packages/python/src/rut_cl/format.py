from __future__ import annotations

from rut_cl.types import Rut


def format(rut: Rut, *, dots: bool = True) -> str:
    """Format a validated RUT for display."""

    body = rut[:-1]
    dv = rut[-1]

    if not dots:
        return f"{body}-{dv}"

    result = f"{body[-3:]}-{dv}"
    rest = body[:-3]

    while len(rest) > 3:
        result = f"{rest[-3:]}.{result}"
        rest = rest[:-3]

    if rest:
        result = f"{rest}.{result}"

    return result
