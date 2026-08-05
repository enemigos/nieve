# rut-cl (Python)

Lean Chilean RUT validation and formatting for Python.

Same behavior as the TypeScript package, with snake_case names.

## Install

```bash
pip install rut-cl
```

## Usage

```python
import rut_cl as rut

value = rut.parse("18.972.631-7")
# "189726317"

rut.format(value)                 # "18.972.631-7"
rut.format(value, dots=False)     # "18972631-7"

rut.safe_parse("18.972.631-0")
# SafeParseFailure(success=False, issues=(CheckDigitIssue(...),))

rut.is_rut("9068826k")  # True  (TS export is `is`)

rut.clean("18.972.631-k")   # "18972631K"
rut.check_digit("18972631") # "7"
```

### With Pydantic

`ensure` raises `ValueError` and returns the cleaned RUT, so it drops straight into `AfterValidator`:

```python
from typing import Annotated
from pydantic import AfterValidator, BaseModel
from rut_cl import ensure

class User(BaseModel):
    national_id: Annotated[str, AfterValidator(ensure)]

user = User(national_id="18.972.631-7")
user.national_id  # "189726317"
```

## API

| Function | Role |
|---|---|
| `parse(input)` | Validate; return cleaned RUT or raise `RutError` |
| `safe_parse(input)` | Validate; return success/failure result |
| `ensure(input)` | Like `parse`, but raises `ValueError` (Pydantic-friendly) |
| `is_rut(input)` | Type guard (`is` in TypeScript) |
| `format(input, *, dots=True)` | Display transform |
| `clean(input)` | Normalize only |
| `check_digit(body)` | Compute DV |

`parse` / `safe_parse` / `ensure` / `is_rut` require cleaned length 8-9 (7-8 digit body + DV).

## Develop

```bash
uv sync --extra dev
uv run pytest
uv run mypy
```

## License

MIT
