<p>
  <a href="https://dud.cl">
    <img src="https://raw.githubusercontent.com/panquequelol/rut-cl/main/dud-logo.png" alt="dud.cl" width="88" align="left">
  </a>
  <br>
  This package is maintained by <a href="https://dud.cl">dud.cl</a>, an independent digital and AI transformation studio for enterprises and corporations.
</p>
<br clear="left">

# dud-cl-rut

Validate and format Chilean RUT values in Python.

The Python API matches the TypeScript behavior and uses `snake_case` names.

## Motivation

The last releases of the legacy JavaScript libraries [`rut.js`](https://github.com/jlobos/rut.js) and [`rutjs`](https://github.com/jeam/rut) were published in 2021 and 2013, respectively, and they still have open issues. This package brings strict validation and structured issues to Python while matching the TypeScript API. See the [agent reference](https://github.com/panquequelol/rut-cl/blob/main/llms.txt) for complete contracts and recipes.

## Install

```bash
pip install dud-cl-rut
```

## Usage

```python
from dud_cl import rut

value = rut.parse("21.272.789-K")
# "21272789K"

rut.format(value)                    # "21.272.789-K"
rut.format(value, dots=False)        # "21272789-K"
rut.format(value, uppercase=False)   # "21.272.789-k"

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

rut.clean("0021.272.789-k")                # "21272789K"
rut.get_verifier("21.272.789")             # "K"
rut.compare("21.272.789-K", "21272789K")  # True
```

### With Pydantic

`parse` raises `RutError`, a `ValueError` subclass. Use it directly with `AfterValidator`:

```python
from typing import Annotated
from pydantic import AfterValidator, BaseModel
from dud_cl.rut import parse

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
| `format(rut, *, dots=True, uppercase=True)` | Format a validated RUT. |
| `clean(input)` | Normalize input without validating it. |
| `compare(left, right)` | Compare two valid RUT values. |
| `get_verifier(body)` | Calculate the verifier for a valid body. Return `None` for an invalid body. |

Errors use Spanish (`es`) by default. Pass `en` as the second argument to `parse` or `safe_parse` for English messages.

The canonical string contains 8 or 9 characters: a 7- or 8-digit body and its verifier. Pass a value returned by `parse` to `format`.

## Development

```bash
uv sync --extra dev
uv run pytest
uv run mypy
```

## License

MIT
