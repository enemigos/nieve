from __future__ import annotations

import json
from pathlib import Path

import pytest

from rut_cl import (
    RutError,
    check_digit,
    clean,
    format,
    is_rut,
    parse,
    safe_parse,
)

FIXTURES = Path(__file__).resolve().parents[3] / "fixtures"


def load_fixture(name: str) -> list[dict[str, object]]:
    return json.loads((FIXTURES / name).read_text(encoding="utf-8"))


valid = load_fixture("valid.json")
invalid = load_fixture("invalid.json")
clean_cases = load_fixture("clean.json")
check_digit_cases = load_fixture("check-digit.json")


@pytest.mark.parametrize("case", clean_cases)
def test_clean(case: dict[str, object]) -> None:
    assert clean(case["input"]) == case["output"]


def test_clean_non_strings() -> None:
    assert clean(189726317) == ""
    assert clean(None) == ""


@pytest.mark.parametrize("case", valid)
def test_format(case: dict[str, object]) -> None:
    assert format(case["input"]) == case["formatted"]
    assert format(case["input"], dots=False) == case["formattedNoDots"]


def test_format_empty_or_dv_only() -> None:
    assert format("") == ""
    assert format("0-0") == ""
    assert format("K") == ""


@pytest.mark.parametrize("case", check_digit_cases)
def test_check_digit(case: dict[str, object]) -> None:
    assert check_digit(case["input"]) == case["output"]


def test_check_digit_invalid() -> None:
    with pytest.raises(ValueError, match="Felipe Camiroaga"):
        check_digit("Felipe Camiroaga")
    with pytest.raises(ValueError, match='"0"'):
        check_digit(0)


@pytest.mark.parametrize("case", valid)
def test_accepts_valid(case: dict[str, object]) -> None:
    result = safe_parse(case["input"])
    assert result.success is True
    assert result.output == case["cleaned"]
    assert parse(case["input"]) == case["cleaned"]
    assert is_rut(case["input"]) is True


@pytest.mark.parametrize("case", invalid)
def test_rejects_invalid(case: dict[str, object]) -> None:
    result = safe_parse(case["input"])
    assert result.success is False
    assert result.issues[0].kind == case["kind"]
    assert is_rut(case["input"]) is False
    with pytest.raises(RutError):
        parse(case["input"])


def test_rejects_non_string_as_type() -> None:
    result = safe_parse(189726317)
    assert result.success is False
    assert result.issues[0].kind == "type"
    assert is_rut(189726317) is False


def test_rejects_email_digits_via_clean() -> None:
    extracted = clean("chuma1996@gmail.com")
    assert extracted == "1996"
    assert is_rut(extracted) is False
    result = safe_parse(extracted)
    assert result.success is False
    assert result.issues[0].kind == "length"


@pytest.mark.parametrize("value", ["1", "17", "173", "1735", "17353"])
def test_rejects_short_progressive_input(value: str) -> None:
    assert is_rut(value) is False
