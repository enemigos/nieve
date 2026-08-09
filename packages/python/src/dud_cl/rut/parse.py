from __future__ import annotations

import re

from ._check_digit import _check_digit
from .error import RutError
from .types import (
    CheckDigitIssue,
    FormatIssue,
    LengthIssue,
    Rut,
    SafeParseFailure,
    SafeParseResult,
    SafeParseSuccess,
    TypeIssue,
)

# Same shape gate as rut.js `validate`.
_RUT_FORMAT = re.compile(r"^([1-9][0-9]{0,2}(\.?[0-9]{3})*)-?[0-9kK]$")

# Body 7-8 digits + DV. Rejects short modulo-11 false positives.
_MIN_CLEANED_LENGTH = 8
_MAX_CLEANED_LENGTH = 9


def clean(input: object) -> str:
    """Normalize a RUT-like string without validating it."""
    if not isinstance(input, str):
        return ""

    cleaned = re.sub(r"[^0-9kK]+", "", input).lstrip("0")
    return cleaned.upper()


def safe_parse(input: object) -> SafeParseResult:
    if not isinstance(input, str):
        return SafeParseFailure(
            success=False,
            issue=TypeIssue(
                kind="type",
                message="Expected a string RUT",
                input=input,
            ),
        )

    if _RUT_FORMAT.fullmatch(input) is None:
        return SafeParseFailure(
            success=False,
            issue=FormatIssue(
                kind="format",
                message="Invalid RUT format",
                input=input,
            ),
        )

    cleaned = input.replace(".", "").replace("-", "").upper()

    if (
        len(cleaned) < _MIN_CLEANED_LENGTH
        or len(cleaned) > _MAX_CLEANED_LENGTH
    ):
        return SafeParseFailure(
            success=False,
            issue=LengthIssue(
                kind="length",
                message=(
                    f"RUT must be {_MIN_CLEANED_LENGTH}-{_MAX_CLEANED_LENGTH} "
                    "characters after cleaning"
                ),
                input=input,
            ),
        )

    body = cleaned[:-1]
    received = cleaned[-1]
    expected = _check_digit(body)

    if expected != received:
        return SafeParseFailure(
            success=False,
            issue=CheckDigitIssue(
                kind="check_digit",
                message=(
                    f"Invalid check digit: expected {expected}, "
                    f"received {received}"
                ),
                input=input,
                expected=expected,
                received=received,
            ),
        )

    return SafeParseSuccess(success=True, output=Rut(cleaned))


def parse(input: object) -> Rut:
    result = safe_parse(input)
    if not result.success:
        raise RutError(result.issue)
    return result.output


def is_rut(input: object) -> bool:
    """Return whether input is a valid RUT.

    Named ``is_rut`` because ``is`` is a Python keyword (TS export is ``is``).
    """
    return safe_parse(input).success


def compare(left: object, right: object) -> bool:
    """Return whether two valid RUT inputs have the same canonical value."""
    left_result = safe_parse(left)
    right_result = safe_parse(right)
    return (
        left_result.success
        and right_result.success
        and left_result.output == right_result.output
    )
