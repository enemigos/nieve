# poder

Validate and format Chilean RUT values in Python.

The core API matches [`poder`](https://www.npmjs.com/package/poder) for TypeScript and uses `snake_case` names. Both packages share one set of fixtures, including a generated conformance suite that fails CI when the two implementations disagree, and both are released with the same version number. The TypeScript-only `formatPartial` helper is for progressive browser input and is intentionally omitted here.

## Motivation

The last releases of the legacy JavaScript libraries [`rut.js`](https://github.com/jlobos/rut.js) and [`rutjs`](https://github.com/jeam/rut) were published in 2021 and 2013, respectively, and they still have open issues. This package brings strict validation and structured issues to Python. See the [agent reference](https://github.com/enemigos/poder/blob/main/llms.txt) for complete contracts and recipes.

## Install

```bash
pip install poder
```

## Usage

Examples import the package as `rut` so each call reads on its own.

```python
import poder as rut

value = rut.parse("21.272.789-K")
# "21272789K"

rut.format(value)                          # "21.272.789-K"
rut.format(value, style="plain")           # "21272789-K"
rut.format(value, verifier_case="lower")   # "21.272.789-k"

rut.safe_parse("21.272.789-0", "en")
# SafeParseFailure(
#     success=False,
#     issue=VerifierIssue(
#         kind="verifier",
#         message='RUT verifier does not match. Replace "0" with "K".',
#         input="21.272.789-0",
#         expected="K",
#         received="0",
#     ),
# )

rut.is_rut("21272789k")  # True (the TypeScript name is `is`)

rut.clean("0021.272.789-k")                # "21272789K" (does not validate)
rut.get_verifier("21.272.789")             # "K"
rut.compare("21.272.789-K", "21272789K")   # True
```

### Accepted input

```text
21.272.789-K
21.272.789K
21272789-K
21272789K
21.272.789-k
```

- Input must be a string.
- Surrounding whitespace is ignored. Whitespace inside the value is not.
- The body contains 7 or 8 digits and does not start with zero.
- Dots are either all present in groups of three or entirely absent: `21.272789-K` is rejected.
- The hyphen before the verifier is optional.
- `k` is accepted in either case.

The 7-digit floor is deliberate: it rejects modulo-11 false positives in short input such as `17353`. It also rejects very low real RUT values and test values such as `1-9`, which report `length`.

### Issue kinds

`safe_parse` returns one issue, and each `kind` means one thing:

| `kind` | When |
|---|---|
| `type` | Input is not a string. |
| `format` | The syntax is not a RUT: stray characters, mixed or misplaced separators, a leading zero. |
| `length` | The syntax is valid but the body does not contain 7 or 8 digits. Carries `body_length`. |
| `verifier` | The size is valid but the verifier does not match. Carries `expected` and `received`. |

Narrow on the concrete dataclass or on `kind`:

```python
from poder import VerifierIssue, safe_parse

result = safe_parse("21.272.789-0")

if not result.success and isinstance(result.issue, VerifierIssue):
    result.issue.expected  # "K"
```

### Stored values

`format` accepts anything `parse` accepts and raises `RutError` for anything else, so a canonical value read back from storage formats directly:

```python
stored = "21272789K"

rut.format(stored)  # "21.272.789-K"
```

### With Pydantic

`parse` raises `RutError`, a `ValueError` subclass. Use it directly with `AfterValidator`:

```python
from typing import Annotated
from pydantic import AfterValidator, BaseModel
from poder import parse

class User(BaseModel):
    national_id: Annotated[str, AfterValidator(parse)]

user = User(national_id="21.272.789-K")
user.national_id  # "21272789K"
```

## API

| API | Purpose |
|---|---|
| `parse(input, language="es")` | Validate input. Return the canonical RUT or raise `RutError`. |
| `safe_parse(input, language="es")` | Validate input without raising. Return a structured result. |
| `is_rut(input)` | Return whether the input is valid. |
| `format(value, *, style="dotted", verifier_case="upper")` | Format a RUT. Validates first and raises `RutError` for invalid input. |
| `clean(input)` | Normalize input without validating it. The output is untrusted. |
| `compare(left, right)` | Return whether two inputs are the same RUT. |
| `get_verifier(body)` | Calculate the verifier for a valid body. Return `None` for an invalid body. |

`style` is `"dotted"` or `"plain"`. `verifier_case` is `"upper"` or `"lower"`.

Errors use Spanish (`es`) by default. Pass `en` as the second argument to `parse` or `safe_parse` for English messages.

`compare` returns `False` when either input is invalid, so it cannot distinguish "different" from "invalid". Use `safe_parse` when that difference matters.

Exported names: `Rut`, `Language`, `RutError`, `RutIssue`, `RutIssueKind`, `TypeIssue`, `FormatIssue`, `LengthIssue`, `VerifierIssue`, `SafeParseResult`, `SafeParseSuccess`, `SafeParseFailure`, `Style`, `VerifierCase`.

## Development

```bash
uv sync --extra dev
uv run pytest
uv run mypy
uv run ruff check .
```

## License

MIT
