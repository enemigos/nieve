# rut-cl (TypeScript)

Lean Chilean RUT validation and formatting for TypeScript.

Inspired by [rut.js](https://github.com/jlobos/rut.js), with a Valibot/Zod-shaped API: `parse` / `safeParse` / `is`, plus small helpers.

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

## API

| Function | Role |
|---|---|
| `parse(input)` | Validate; return branded cleaned RUT or throw `RutError` |
| `safeParse(input)` | Validate; return `{ success, output }` or `{ success: false, issues }` |
| `is(input)` | Type guard |
| `format(input, options?)` | Display transform (`dots` default `true`) |
| `clean(input)` | Normalize only (no validation) |
| `checkDigit(body)` | Compute DV for a body |

Canonical form after a successful parse is the cleaned string (`189726317`).

`parse` / `safeParse` / `is` require a cleaned length of 8-9 (7-8 digit body + DV). That blocks short modulo-11 false positives from progressive typing or `clean()` on unrelated strings.

## Develop

```bash
pnpm install
pnpm test
pnpm build
```

## License

MIT

Cleaning/validation behavior follows [rut.js](https://github.com/jlobos/rut.js) (MIT). This is a separate package, not a drop-in republish of `rut.js`.
