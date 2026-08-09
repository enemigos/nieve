# RUT

Lean Chilean RUT validation and formatting for TypeScript and Python.

Inspired by [rut.js](https://github.com/jlobos/rut.js), with a Valibot/Zod-shaped validation API.

## Install

```bash
npm i @dud-cl/rut
pip install dud-cl-rut
```

## TypeScript

```ts
import * as rut from '@dud-cl/rut'

const value = rut.parse('18.972.631-7')
// branded Rut string: '189726317'

rut.format(value)                  // '18.972.631-7'
rut.format(value, { dots: false }) // '18972631-7'

const kValue = rut.parse('9.068.826-k')
rut.format(kValue, { uppercase: false }) // '9.068.826-k'

rut.safeParse('18.972.631-0')
// { success: false, issue: { kind: 'check_digit', ... } }

rut.is('9068826k') // true

rut.clean('0018.972.631-7')                 // '189726317'
rut.getVerifier('9.068.826')                 // 'K'
rut.compare('18.972.631-7', '189726317')     // true
```

### With Zod

```ts
import * as z from 'zod'
import * as rut from '@dud-cl/rut'

const schema = z.object({
  nationalId: z.string().refine(rut.is, { message: 'Invalid RUT' }),
})
```

### With Valibot

```ts
import * as v from 'valibot'
import * as rut from '@dud-cl/rut'

const schema = v.object({
  nationalId: v.pipe(v.string(), v.check(rut.is, 'Invalid RUT')),
})
```

## Python

```python
from dud_cl import rut

value = rut.parse("18.972.631-7")  # "189726317"

rut.format(value)              # "18.972.631-7"
rut.format(value, dots=False)  # "18972631-7"

k_value = rut.parse("9.068.826-k")
rut.format(k_value, uppercase=False)  # "9.068.826-k"

rut.safe_parse("18.972.631-0")
rut.is_rut("9068826k")         # True (`is` is a Python keyword)

rut.clean("0018.972.631-7")                  # "189726317"
rut.get_verifier("9.068.826")                 # "K"
rut.compare("18.972.631-7", "189726317")     # True
```

### With Pydantic

```python
from typing import Annotated
from pydantic import AfterValidator, BaseModel
from dud_cl.rut import parse

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
| `format` | `format` | Format a validated `Rut`; configure dots and `K` casing |
| `clean` | `clean` | Normalize without validating |
| `compare` | `compare` | Compare canonical values; both inputs must be valid |
| `getVerifier` | `get_verifier` | Calculate a valid body verifier; return `null`/`None` if invalid |

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
