"""Lean Chilean RUT validation and formatting."""

from rut_cl.check_digit import check_digit
from rut_cl.clean import clean
from rut_cl.error import RutError
from rut_cl.format import format
from rut_cl.parse import ensure, is_rut, parse, safe_parse
from rut_cl.types import (
    CheckDigitIssue,
    FormatIssue,
    LengthIssue,
    Rut,
    RutIssue,
    SafeParseFailure,
    SafeParseResult,
    SafeParseSuccess,
    TypeIssue,
)

__all__ = [
    "CheckDigitIssue",
    "FormatIssue",
    "LengthIssue",
    "Rut",
    "RutError",
    "RutIssue",
    "SafeParseFailure",
    "SafeParseResult",
    "SafeParseSuccess",
    "TypeIssue",
    "check_digit",
    "clean",
    "ensure",
    "format",
    "is_rut",
    "parse",
    "safe_parse",
]
