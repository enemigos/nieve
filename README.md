# rut-cl

Lean Chilean RUT validation and formatting for TypeScript and Python.

Inspired by [rut.js](https://github.com/jlobos/rut.js), with a Valibot/Zod-shaped API: `parse` / `safeParse` / `is`, plus small helpers.

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
// { success: false, issues: [{ kind: 'check_digit', ... }] }

rut.is('9068826k') // true

rut.clean('18.972.631-k')  // '18972631K' (normalize only)
rut.checkDigit('18972631') // '7'
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

## Python

```python
import rut_cl as rut

value = rut.parse("18.972.631-7")  # "189726317"

rut.format(value)              # "18.972.631-7"
rut.format(value, dots=False)  # "18972631-7"

rut.safe_parse("18.972.631-0")
rut.is_rut("9068826k")         # True (`is` is a Python keyword)

rut.clean("18.972.631-k")      # "18972631K"
rut.check_digit("18972631")    # "7"
```

## API

| TS | Python | Role |
|---|---|---|
| `parse` | `parse` | Validate; return cleaned RUT or throw/raise |
| `safeParse` | `safe_parse` | Validate; return success/failure result |
| `is` | `is_rut` | Type guard |
| `format` | `format` | Display transform (`dots` default `true`) |
| `clean` | `clean` | Normalize only (no validation) |
| `checkDigit` | `check_digit` | Compute DV for a body |

Canonical form after a successful parse is the cleaned string (`189726317`).

`parse` / `safeParse` / `is` require a cleaned length of 8-9 (7-8 digit body + DV). That blocks short modulo-11 false positives from progressive typing or `clean()` on unrelated strings.

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

Cleaning/validation behavior follows [rut.js](https://github.com/jlobos/rut.js) (MIT). This is a separate package, not a drop-in republish of `rut.js`.
