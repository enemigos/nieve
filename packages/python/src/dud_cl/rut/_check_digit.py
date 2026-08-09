from __future__ import annotations


def _check_digit(body: str) -> str:
    """Compute the modulo-11 check digit for a RUT body (digits only, no DV)."""
    if body == "" or not body.isascii() or not body.isdigit():
        raise ValueError(f'"{body}" as RUT is invalid')

    digits = [int(char) for char in body]
    total = sum(
        digit * ((index % 6) + 2) for index, digit in enumerate(reversed(digits))
    )
    digit = 11 - (total % 11)

    if digit == 10:
        return "K"
    if digit == 11:
        return "0"
    return str(digit)


def get_verifier(input: object) -> str | None:
    """Compute the verifier for a numeric body, or return None if invalid."""
    if not isinstance(input, str):
        return None

    body = input.strip().replace(".", "").replace(",", "").replace("-", "")
    if (
        len(body) not in (7, 8)
        or body.startswith("0")
        or not body.isascii()
        or not body.isdigit()
    ):
        return None

    return _check_digit(body)
