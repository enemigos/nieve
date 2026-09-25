"""Shared syntax rules. Keep these aligned with the TypeScript package.

A body is either bare digits (``21272789``) or dot separated groups of three
digits after a leading group of one to three digits (``21.272.789``). Mixing the
two styles is rejected, and a leading zero is rejected. Body size is checked
separately so that a well formed token of the wrong size reports ``length``
instead of ``format``.
"""

from __future__ import annotations

import re

_BODY = r"(?:[1-9][0-9]{0,2}(?:\.[0-9]{3})+|[1-9][0-9]*)"

# Optional body, optional hyphen, verifier.
RUT_SYNTAX = re.compile(rf"{_BODY}?-?[0-9kK]")

# A body on its own, with an optional trailing hyphen.
BODY_SYNTAX = re.compile(rf"{_BODY}-?")

MIN_BODY_LENGTH = 7
MAX_BODY_LENGTH = 8

# Surrounding whitespace that both packages ignore: ASCII whitespace plus the
# no-break space, which is common in values pasted from documents. The set is
# explicit so TypeScript and Python trim exactly the same characters.
_TRIMMED = " \t\n\r\v\f\u00a0"


def trim_whitespace(value: str) -> str:
    return value.strip(_TRIMMED)


def strip_separators(value: str) -> str:
    """Remove the separators allowed by the syntax rules."""
    return value.replace(".", "").replace("-", "")


def group_thousands(digits: str) -> str:
    """Insert dots every three digits from the right."""
    result = digits[-3:]
    rest = digits[:-3]

    while rest:
        result = f"{rest[-3:]}.{result}"
        rest = rest[:-3]

    return result
