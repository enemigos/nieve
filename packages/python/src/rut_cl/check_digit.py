from __future__ import annotations

from rut_cl.clean import clean


def check_digit(input: object) -> str:
    """Compute the modulo-11 check digit for a RUT body (digits only, no DV)."""
    cleaned = clean(input)

    if cleaned == "" or not cleaned.isdigit():
        raise ValueError(f'"{input}" as RUT is invalid')

    digits = [int(char) for char in cleaned]
    total = sum(
        digit * ((index % 6) + 2) for index, digit in enumerate(reversed(digits))
    )
    digit = 11 - (total % 11)

    if digit == 10:
        return "K"
    if digit == 11:
        return "0"
    return str(digit)
