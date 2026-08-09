# rut-cl (TypeScript)

Lean Chilean RUT validation and formatting for TypeScript.

Inspired by [rut.js](https://github.com/jlobos/rut.js), with a Valibot/Zod-shaped validation API.

## Install

```bash
npm i rut-cl
```

## Usage

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

## API

| Function | Role |
|---|---|
| `parse(input)` | Validate; return branded cleaned RUT or throw `RutError` |
| `safeParse(input)` | Validate; return `{ success, output }` or `{ success: false, issue }` |
| `is(input)` | Return whether input is valid |
| `format(rut, options?)` | Format a validated `Rut` (`dots` defaults to `true`) |

Canonical form after a successful parse is the cleaned string (`189726317`).

`parse` / `safeParse` / `is` require a canonical length of 8-9 (7-8 digit body + DV). `parse` and successful `safeParse` results are the supported way to create values accepted by `format`.

## Develop

```bash
pnpm install
pnpm test
pnpm build
```

## License

MIT

The legacy helpers follow [rut.js](https://github.com/jlobos/rut.js) behavior (MIT).
