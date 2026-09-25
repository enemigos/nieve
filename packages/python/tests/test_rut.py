from __future__ import annotations

from typing import Any

import pytest

from dud_cl import rut

from .fixtures import (
    CLEANED,
    COMPARISONS,
    CONFORMANCE,
    FORMATS,
    INVALID,
    MESSAGES,
    VALID,
    VERIFIERS,
)


@pytest.mark.parametrize("case", VALID, ids=lambda case: repr(case["input"]))
def test_accepts_valid(case: dict[str, str]) -> None:
    result = rut.safe_parse(case["input"])

    assert result.success is True
    assert result.output == case["cleaned"]
    assert rut.parse(case["input"]) == case["cleaned"]
    assert rut.is_rut(case["input"]) is True


@pytest.mark.parametrize("case", INVALID, ids=lambda case: repr(case["input"]))
def test_rejects_invalid(case: dict[str, Any]) -> None:
    result = rut.safe_parse(case["input"])

    assert result.success is False
    assert result.issue.kind == case["kind"]
    assert result.issue.input == case["input"]

    if isinstance(result.issue, rut.LengthIssue):
        assert result.issue.body_length == case["bodyLength"]

    assert rut.is_rut(case["input"]) is False
    with pytest.raises(rut.RutError):
        rut.parse(case["input"])


@pytest.mark.parametrize("value", [None, 189726317, True, {}, [], 1.5])
def test_rejects_non_string_as_type(value: object) -> None:
    result = rut.safe_parse(value)

    assert result.success is False
    assert result.issue.kind == "type"
    assert result.issue.input == value
    assert rut.is_rut(value) is False


def test_reports_original_input_not_trimmed_value() -> None:
    result = rut.safe_parse("  21.272.789-0  ")

    assert result.success is False
    assert result.issue.input == "  21.272.789-0  "


def test_rejects_unrelated_text_without_extracting_digits() -> None:
    result = rut.safe_parse("chuma1996@gmail.com")

    assert result.success is False
    assert result.issue.kind == "format"
    assert rut.is_rut(rut.clean("chuma1996@gmail.com")) is False


@pytest.mark.parametrize("value", ["1", "17", "173", "1735", "17353"])
def test_rejects_short_progressive_input(value: str) -> None:
    assert rut.is_rut(value) is False


@pytest.mark.parametrize("case", MESSAGES, ids=lambda case: repr(case["input"]))
def test_issue_messages(case: dict[str, Any]) -> None:
    for language in ("es", "en"):
        result = rut.safe_parse(case["input"], language)

        assert result.success is False
        assert result.issue.kind == case["kind"]
        assert result.issue.message == case[language]


def test_rut_error_is_value_error_with_single_issue() -> None:
    with pytest.raises(ValueError, match="El verificador no coincide") as error:
        rut.parse("21.272.789-0")

    assert isinstance(error.value, rut.RutError)
    assert error.value.issue.kind == "verifier"

    with pytest.raises(rut.RutError, match="RUT verifier does not match"):
        rut.parse("21.272.789-0", "en")


@pytest.mark.parametrize("case", FORMATS["cases"], ids=lambda case: repr(case["value"]))
def test_format_options(case: dict[str, str]) -> None:
    assert (
        rut.format(
            case["value"],
            style=case["style"],  # type: ignore[arg-type]
            verifier_case=case["verifierCase"],  # type: ignore[arg-type]
        )
        == case["output"]
    )


@pytest.mark.parametrize("case", VALID, ids=lambda case: repr(case["input"]))
def test_format_defaults(case: dict[str, str]) -> None:
    value = rut.parse(case["input"])

    assert rut.format(value) == case["dotted"]
    assert rut.format(value, style="plain") == case["plain"]


@pytest.mark.parametrize("value", FORMATS["rejected"])
def test_format_rejects_invalid_values(value: str) -> None:
    with pytest.raises(rut.RutError):
        rut.format(value)


def test_format_accepts_a_stored_canonical_value() -> None:
    stored = "21272789K"

    assert rut.format(stored) == "21.272.789-K"


@pytest.mark.parametrize("case", CLEANED, ids=lambda case: repr(case["input"]))
def test_clean(case: dict[str, str]) -> None:
    assert rut.clean(case["input"]) == case["output"]


def test_clean_non_string() -> None:
    assert rut.clean(189726317) == ""


@pytest.mark.parametrize("case", VERIFIERS, ids=lambda case: repr(case["input"]))
def test_get_verifier(case: dict[str, str | None]) -> None:
    assert rut.get_verifier(case["input"]) == case["output"]


@pytest.mark.parametrize("value", [None, 18972631, {}, True])
def test_get_verifier_non_string(value: object) -> None:
    assert rut.get_verifier(value) is None


@pytest.mark.parametrize("case", VALID, ids=lambda case: repr(case["input"]))
def test_get_verifier_agrees_with_parse(case: dict[str, str]) -> None:
    canonical = case["cleaned"]

    assert rut.get_verifier(canonical[:-1]) == canonical[-1]


@pytest.mark.parametrize("case", COMPARISONS, ids=lambda case: repr(case["left"]))
def test_compare(case: dict[str, Any]) -> None:
    assert rut.compare(case["left"], case["right"]) is case["equal"]


@pytest.mark.parametrize("case", CONFORMANCE, ids=lambda case: repr(case["input"]))
def test_conformance_with_the_typescript_package(case: dict[str, Any]) -> None:
    result = rut.safe_parse(case["input"])

    if case["outcome"] == "valid":
        assert result.success is True
        assert result.output == case["output"]
        assert rut.format(result.output) == case["dotted"]
        assert rut.format(result.output, style="plain") == case["plain"]
        return

    assert result.success is False
    assert result.issue.kind == case["outcome"]

    if isinstance(result.issue, rut.LengthIssue):
        assert result.issue.body_length == case["bodyLength"]
