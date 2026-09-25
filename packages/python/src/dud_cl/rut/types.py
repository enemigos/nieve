from __future__ import annotations

from dataclasses import dataclass
from typing import Literal, NewType, TypeAlias

Rut = NewType("Rut", str)
Language: TypeAlias = Literal["es", "en"]

#: ``dotted`` renders ``21.272.789-K``. ``plain`` renders ``21272789-K``.
Style: TypeAlias = Literal["dotted", "plain"]

#: Case of the ``K`` verifier. Digits are unaffected.
VerifierCase: TypeAlias = Literal["upper", "lower"]

RutIssueKind: TypeAlias = Literal["type", "format", "length", "verifier"]


@dataclass(frozen=True, slots=True)
class TypeIssue:
    """Input is not a string."""

    kind: Literal["type"]
    message: str
    input: object


@dataclass(frozen=True, slots=True)
class FormatIssue:
    """Input is a string whose syntax is not a RUT.

    Stray characters, mixed or misplaced separators, or a leading zero.
    """

    kind: Literal["format"]
    message: str
    input: str


@dataclass(frozen=True, slots=True)
class LengthIssue:
    """Syntax is valid but the body does not contain 7 or 8 digits."""

    kind: Literal["length"]
    message: str
    input: str
    body_length: int


@dataclass(frozen=True, slots=True)
class VerifierIssue:
    """Syntax and length are valid but the verifier does not match."""

    kind: Literal["verifier"]
    message: str
    input: str
    expected: str
    received: str


RutIssue: TypeAlias = TypeIssue | FormatIssue | LengthIssue | VerifierIssue


@dataclass(frozen=True, slots=True)
class SafeParseSuccess:
    success: Literal[True]
    output: Rut


@dataclass(frozen=True, slots=True)
class SafeParseFailure:
    success: Literal[False]
    issue: RutIssue


SafeParseResult: TypeAlias = SafeParseSuccess | SafeParseFailure
