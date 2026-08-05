from __future__ import annotations

from rut_cl.clean import clean


def format(input: object, *, dots: bool = True) -> str:
    """Format a RUT-like value for display.

    Does not validate check digit.
    """
    if not input:
        return ""

    rut = clean(input)
    # Need at least body digit + DV; otherwise avoid odd outputs like "-0".
    if len(rut) < 2:
        return ""

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
