from __future__ import annotations

from dataclasses import dataclass
from typing import Literal, NewType, TypeAlias

Rut = NewType("Rut", str)


@dataclass(frozen=True, slots=True)
class TypeIssue:
    kind: Literal["type"]
    message: str
    input: object


@dataclass(frozen=True, slots=True)
class FormatIssue:
    kind: Literal["format"]
    message: str
    input: str


@dataclass(frozen=True, slots=True)
class LengthIssue:
    kind: Literal["length"]
    message: str
    input: str


@dataclass(frozen=True, slots=True)
class CheckDigitIssue:
    kind: Literal["check_digit"]
    message: str
    input: str
    expected: str
    received: str


RutIssue: TypeAlias = TypeIssue | FormatIssue | LengthIssue | CheckDigitIssue


@dataclass(frozen=True, slots=True)
class SafeParseSuccess:
    success: Literal[True]
    output: Rut


@dataclass(frozen=True, slots=True)
class SafeParseFailure:
    success: Literal[False]
    issues: tuple[RutIssue, ...]


SafeParseResult: TypeAlias = SafeParseSuccess | SafeParseFailure
