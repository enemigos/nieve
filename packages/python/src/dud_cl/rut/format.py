from __future__ import annotations

from ._syntax import group_thousands
from .parse import parse
from .types import Rut, Style, VerifierCase


def format(
    value: Rut | str,
    *,
    style: Style = "dotted",
    verifier_case: VerifierCase = "upper",
) -> str:
    """Format a RUT for display.

    Accepts a parsed ``Rut`` or any string ``parse`` accepts, which makes stored
    values usable without a cast. Raises ``RutError`` for invalid input, so it
    never returns a formatted string that is not a real RUT. Use ``safe_parse``
    for untrusted input.
    """
    canonical = parse(value)
    body = canonical[:-1]
    verifier = canonical[-1].lower() if verifier_case == "lower" else canonical[-1]

    if style == "plain":
        return f"{body}-{verifier}"

    return f"{group_thousands(body)}-{verifier}"
