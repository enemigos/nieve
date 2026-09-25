"""Lean Chilean RUT validation and formatting."""

from ._verifier import get_verifier
from .clean import clean
from .error import RutError
from .format import format
from .parse import compare, is_rut, parse, safe_parse
from .types import (
    FormatIssue,
    Language,
    LengthIssue,
    Rut,
    RutIssue,
    RutIssueKind,
    SafeParseFailure,
    SafeParseResult,
    SafeParseSuccess,
    Style,
    TypeIssue,
    VerifierCase,
    VerifierIssue,
)

__all__ = [
    "FormatIssue",
    "Language",
    "LengthIssue",
    "Rut",
    "RutError",
    "RutIssue",
    "RutIssueKind",
    "SafeParseFailure",
    "SafeParseResult",
    "SafeParseSuccess",
    "Style",
    "TypeIssue",
    "VerifierCase",
    "VerifierIssue",
    "clean",
    "compare",
    "format",
    "get_verifier",
    "is_rut",
    "parse",
    "safe_parse",
]
