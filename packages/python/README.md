# dud-cl-rut

Lean Chilean RUT validation and formatting for Python.

Same behavior as the TypeScript package, with snake_case names.

## Install

```bash
pip install dud-cl-rut
```

## Usage

```python
from dud_cl import rut

value = rut.parse("18.972.631-7")
# "189726317"

rut.format(value)                 # "18.972.631-7"
rut.format(value, dots=False)     # "18972631-7"

k_value = rut.parse("9.068.826-k")
rut.format(k_value, uppercase=False)  # "9.068.826-k"

rut.safe_parse("18.972.631-0")
# SafeParseFailure(success=False, issue=CheckDigitIssue(...))

rut.is_rut("9068826k")  # True  (TS export is `is`)

rut.clean("0018.972.631-7")                  # "189726317"
rut.get_verifier("9.068.826")                 # "K"
rut.compare("18.972.631-7", "189726317")     # True
```

### With Pydantic

`parse` raises `RutError`, a `ValueError` subclass, so it can be used directly with `AfterValidator`:

```python
from typing import Annotated
from pydantic import AfterValidator, BaseModel
from dud_cl.rut import parse

class User(BaseModel):
    national_id: Annotated[str, AfterValidator(parse)]

user = User(national_id="18.972.631-7")
user.national_id  # "189726317"
```

## API

| Function | Role |
|---|---|
| `parse(input)` | Validate; return cleaned RUT or raise `RutError` |
| `safe_parse(input)` | Validate; return success/failure result |
| `is_rut(input)` | Return whether input is valid (`is` in TypeScript) |
| `format(rut, *, dots=True, uppercase=True)` | Format a validated `Rut` |
| `clean(input)` | Normalize without validating |
| `compare(left, right)` | Compare canonical values; both inputs must be valid |
| `get_verifier(body)` | Calculate a valid body verifier; return `None` if invalid |

`parse` / `safe_parse` / `is_rut` require a canonical length of 8-9 (7-8 digit body + DV). `parse` and successful `safe_parse` results are the supported way to create values accepted by `format`.

## Develop

```bash
uv sync --extra dev
uv run pytest
uv run mypy
```

## License

MIT
