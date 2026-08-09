# rut-cl

Lean Chilean RUT validation and formatting for TypeScript and Python.

Inspired by [rut.js](https://github.com/jlobos/rut.js), with a Valibot/Zod-shaped validation API.

## Install

```bash
npm i rut-cl
pip install rut-cl
```

## TypeScript

```ts
import * as rut from 'rut-cl'

const value = rut.parse('18.972.631-7')
// branded Rut string: '189726317'

rut.format(value)                  // '18.972.631-7'
rut.format(value, { dots: false }) // '18972631-7'

rut.safeParse('18.972.631-0')
// { success: false, issue: { kind: 'check_digit', ... } }

rut.is('9068826k') // true
```

### With Zod

```ts
import * as z from 'zod'
import * as rut from 'rut-cl'

const schema = z.object({
  nationalId: z.string().refine(rut.is, { message: 'Invalid RUT' }),
})
```

### With Valibot

```ts
import * as v from 'valibot'
import * as rut from 'rut-cl'

const schema = v.object({
  nationalId: v.pipe(v.string(), v.check(rut.is, 'Invalid RUT')),
})
```

### rut.js-compatible helpers

```ts
import { validate, clean, format, getCheckDigit } from 'rut-cl/legacy'
```

These ESM helpers preserve rut.js's permissive behavior for documented string inputs. Use the root entry point for strict validation.

## Python

```python
import rut_cl as rut

value = rut.parse("18.972.631-7")  # "189726317"

rut.format(value)              # "18.972.631-7"
rut.format(value, dots=False)  # "18972631-7"

rut.safe_parse("18.972.631-0")
rut.is_rut("9068826k")         # True (`is` is a Python keyword)
```

### With Pydantic

```python
from typing import Annotated
from pydantic import AfterValidator, BaseModel
from rut_cl import parse

class User(BaseModel):
    national_id: Annotated[str, AfterValidator(parse)]

user = User(national_id="18.972.631-7")
user.national_id  # "189726317"
```

`RutError` subclasses `ValueError`, so Pydantic maps `parse` failures cleanly.

## API

| TS | Python | Role |
|---|---|---|
| `parse` | `parse` | Validate; return cleaned RUT or throw/raise |
| `safeParse` | `safe_parse` | Validate; return success/failure result |
| `is` | `is_rut` | Return whether input is valid |
| `format` | `format` | Format a validated `Rut` (`dots` defaults to `true`) |

Canonical form after a successful parse is the cleaned string (`189726317`).

`parse` / `safeParse` / `is` require a canonical length of 8-9 (7-8 digit body + DV). Parsing is the supported way to create values accepted by `format`.

## Develop

```bash
# TypeScript
pnpm install
pnpm test
pnpm build

# Python
cd packages/python
uv sync --extra dev
uv run pytest
```

## License

MIT

The legacy helpers follow [rut.js](https://github.com/jlobos/rut.js) behavior (MIT).
