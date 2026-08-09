from __future__ import annotations

import json
from pathlib import Path

import pytest

from dud_cl import rut

FIXTURES = Path(__file__).resolve().parents[3] / "fixtures"


def load_fixture(name: str) -> list[dict[str, object]]:
    return json.loads((FIXTURES / name).read_text(encoding="utf-8"))


valid = load_fixture("valid.json")
invalid = load_fixture("invalid.json")
cleaned = load_fixture("clean.json")
verifiers = load_fixture("check-digit.json")


@pytest.mark.parametrize("case", valid)
def test_format(case: dict[str, object]) -> None:
    value = rut.parse(case["input"])
    assert rut.format(value) == case["formatted"]
    assert rut.format(value, dots=False) == case["formattedNoDots"]


def test_format_lowercase_k() -> None:
    value = rut.parse("9.068.826-k")
    assert rut.format(value, uppercase=False) == "9.068.826-k"
    assert rut.format(value, dots=False, uppercase=False) == "9068826-k"


@pytest.mark.parametrize("case", cleaned)
def test_clean(case: dict[str, object]) -> None:
    assert rut.clean(case["input"]) == case["output"]


def test_clean_non_string() -> None:
    assert rut.clean(189726317) == ""


@pytest.mark.parametrize("case", verifiers)
def test_get_verifier(case: dict[str, object]) -> None:
    assert rut.get_verifier(case["input"]) == case["output"]


@pytest.mark.parametrize(
    "value",
    [
        None,
        18972631,
        "",
        "abc",
        "12K",
        "12 34",
        "1",
        "123456",
        "123456789",
        "0000000",
    ],
)
def test_get_verifier_invalid_body(value: object) -> None:
    assert rut.get_verifier(value) is None


def test_compare_valid_inputs() -> None:
    assert rut.compare("18.972.631-7", "189726317") is True
    assert rut.compare("18.972.631-7", "9.068.826-k") is False


def test_compare_invalid_inputs() -> None:
    assert rut.compare("18.972.631-0", "18.972.631-0") is False
    assert rut.compare(None, None) is False


@pytest.mark.parametrize("case", valid)
def test_accepts_valid(case: dict[str, object]) -> None:
    result = rut.safe_parse(case["input"])
    assert result.success is True
    assert result.output == case["cleaned"]
    assert rut.parse(case["input"]) == case["cleaned"]
    assert rut.is_rut(case["input"]) is True


@pytest.mark.parametrize("case", invalid)
def test_rejects_invalid(case: dict[str, object]) -> None:
    result = rut.safe_parse(case["input"])
    assert result.success is False
    assert result.issue.kind == case["kind"]
    assert rut.is_rut(case["input"]) is False
    with pytest.raises(rut.RutError):
        rut.parse(case["input"])


def test_rejects_non_string_as_type() -> None:
    result = rut.safe_parse(189726317)
    assert result.success is False
    assert result.issue.kind == "type"
    assert rut.is_rut(189726317) is False


def test_rejects_unrelated_input_without_extracting_digits() -> None:
    result = rut.safe_parse("chuma1996@gmail.com")
    assert result.success is False
    assert result.issue.kind == "format"


@pytest.mark.parametrize("value", ["1", "17", "173", "1735", "17353"])
def test_rejects_short_progressive_input(value: str) -> None:
    assert rut.is_rut(value) is False


def test_rut_error_is_value_error_with_single_issue() -> None:
    with pytest.raises(ValueError, match="check digit") as error:
        rut.parse("18.972.631-0")
    assert isinstance(error.value, rut.RutError)
    assert error.value.issue.kind == "check_digit"
