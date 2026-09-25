from __future__ import annotations

from typing import TypedDict

from ._syntax import (
    MAX_BODY_LENGTH,
    MIN_BODY_LENGTH,
    RUT_SYNTAX,
    strip_separators,
    trim_whitespace,
)
from ._verifier import _calculate_verifier
from .error import RutError
from .types import (
    FormatIssue,
    Language,
    LengthIssue,
    Rut,
    SafeParseFailure,
    SafeParseResult,
    SafeParseSuccess,
    TypeIssue,
    VerifierIssue,
)


class _Messages(TypedDict):
    type: str
    format: str
    length: str
    verifier: str


_MESSAGES: dict[Language, _Messages] = {
    "es": {
        "type": (
            'El RUT debe ser una cadena de texto. Usa un valor como "21.272.789-K" '
            "e intenta de nuevo."
        ),
        "format": (
            "El formato del RUT es incorrecto. Usa 7 u 8 d\u00edgitos y un "
            'verificador, por ejemplo, "21.272.789-K".'
        ),
        "length": (
            "El cuerpo del RUT debe tener 7 u 8 d\u00edgitos antes del verificador; "
            "tiene {body_length}. Corrige el cuerpo e intenta de nuevo."
        ),
        "verifier": (
            'El verificador no coincide. Reemplaza "{received}" por "{expected}".'
        ),
    },
    "en": {
        "type": (
            'RUT must be a string. Use a value such as "21.272.789-K", then try again.'
        ),
        "format": (
            "RUT format is incorrect. Use 7 or 8 digits and a verifier, "
            'for example, "21.272.789-K".'
        ),
        "length": (
            "RUT body must contain 7 or 8 digits before the verifier; it contains "
            "{body_length}. Correct the body, then try again."
        ),
        "verifier": (
            'RUT verifier does not match. Replace "{received}" with "{expected}".'
        ),
    },
}


def safe_parse(input: object, language: Language = "es") -> SafeParseResult:
    """Validate input without raising.

    Surrounding whitespace is ignored. Everything else must already be a RUT:
    dots are all present or all absent, the hyphen is optional, and ``k`` may be
    written in either case. ``issue.input`` always reports the original input.
    """
    messages = _MESSAGES[language]

    if not isinstance(input, str):
        return SafeParseFailure(
            success=False,
            issue=TypeIssue(kind="type", message=messages["type"], input=input),
        )

    value = trim_whitespace(input)

    if RUT_SYNTAX.fullmatch(value) is None:
        return SafeParseFailure(
            success=False,
            issue=FormatIssue(kind="format", message=messages["format"], input=input),
        )

    cleaned = strip_separators(value).upper()
    body = cleaned[:-1]
    received = cleaned[-1]

    if not MIN_BODY_LENGTH <= len(body) <= MAX_BODY_LENGTH:
        return SafeParseFailure(
            success=False,
            issue=LengthIssue(
                kind="length",
                message=messages["length"].format(body_length=len(body)),
                input=input,
                body_length=len(body),
            ),
        )

    expected = _calculate_verifier(body)

    if expected != received:
        return SafeParseFailure(
            success=False,
            issue=VerifierIssue(
                kind="verifier",
                message=messages["verifier"].format(
                    expected=expected,
                    received=received,
                ),
                input=input,
                expected=expected,
                received=received,
            ),
        )

    return SafeParseSuccess(success=True, output=Rut(cleaned))


def parse(input: object, language: Language = "es") -> Rut:
    """Validate input. Return the canonical RUT or raise ``RutError``."""
    result = safe_parse(input, language)
    if not result.success:
        raise RutError(result.issue)
    return result.output


def is_rut(input: object) -> bool:
    """Return whether input is a valid RUT.

    Named ``is_rut`` because ``is`` is a Python keyword (the TypeScript export
    is ``is``).
    """
    return safe_parse(input).success


def compare(left: object, right: object) -> bool:
    """Return whether two inputs are the same RUT.

    Returns ``False`` when either input is invalid, so it cannot distinguish
    "different" from "invalid". Validate with ``safe_parse`` when that matters.
    """
    left_result = safe_parse(left)
    right_result = safe_parse(right)
    return (
        left_result.success
        and right_result.success
        and left_result.output == right_result.output
    )
