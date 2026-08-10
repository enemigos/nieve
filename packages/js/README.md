<p>
  <a href="https://dud.cl">
    <img src="https://raw.githubusercontent.com/panquequelol/rut-cl/main/dud-logo.png" alt="dud.cl" width="88" align="left">
  </a>
  <br>
  This package is maintained by <a href="https://dud.cl">dud.cl</a>, an independent digital and AI transformation studio for enterprises and corporations.
</p>
<br clear="left">

# @dud-cl/rut

Validate and format Chilean RUT values in TypeScript.

The API uses result objects similar to Valibot and Zod.

## Motivation

[`rut.js`](https://github.com/jlobos/rut.js) has not published an npm release since October 2021 and still has open validation and formatting issues. [`rutjs`](https://github.com/jeam/rut) has not received updates since July 2013. This package rejects unrelated text, partial input, and bodies with invalid lengths. It also returns typed issues in Spanish or English. See the [agent reference](https://github.com/panquequelol/rut-cl/blob/main/llms.txt) for complete contracts and recipes.

## Install

```bash
npm i @dud-cl/rut
```

## Usage

```ts
import * as rut from '@dud-cl/rut'

const value = rut.parse('21.272.789-K')
// Branded canonical RUT: '21272789K'

rut.format(value)                              // '21.272.789-K'
rut.format(value, { dots: false })             // '21272789-K'
rut.format(value, { uppercase: false })        // '21.272.789-k'
rut.formatPartial('17353')                     // '1.735-3' (partial input)

rut.safeParse('21.272.789-0', 'en')
// {
//   success: false,
//   issue: {
//     kind: 'verifier',
//     message: 'RUT verifier does not match. Replace "0" with "K".',
//     input: '21.272.789-0',
//     expected: 'K',
//     received: '0',
//   },
// }

rut.is('21272789k') // true

rut.clean('0021.272.789-k')                 // '21272789K'
rut.getVerifier('21.272.789')               // 'K'
rut.compare('21.272.789-K', '21272789K')    // true
```

### With Zod

```ts
import * as z from 'zod'
import * as rut from '@dud-cl/rut'

const rutSchema = z.unknown().transform((input, context) => {
  const result = rut.safeParse(input, 'en')

  if (!result.success) {
    context.addIssue({
      code: 'custom',
      message: result.issue.message,
      params: { rutIssue: result.issue },
    })
    return z.NEVER
  }

  return result.output
})

const schema = z.object({
  nationalId: rutSchema,
})
```

Zod receives `RutIssue.message`, successful data becomes a branded `Rut`, and the complete issue remains available in `params.rutIssue`. Some form resolvers discard `params`; keep the `RutIssue` returned by `safeParse` in form state when UI behavior depends on `kind`.

### With React

Format while the user types and retain the complete result so `kind`, `message`, `expected`, and `received` stay available.

**Warning:** `formatPartial` can turn raw input rejected by strict parsing into accepted input by normalizing dots, hyphens, and whitespace. Never trust its output without validation. If exact raw syntax matters, call `safeParse(raw)` and display the validated `Rut` with `format`. If normalization is acceptable, call `safeParse(formatPartial(raw))` before storing the value.

```tsx
import { useState } from 'react'
import * as rut from '@dud-cl/rut'

const [input, setInput] = useState('')
const [validation, setValidation] = useState<rut.SafeParseResult | null>(null)

function changeInput(raw: string) {
  const next = rut.formatPartial(raw)
  setInput(next)
  setValidation(next ? rut.safeParse(next, 'en') : null)
}

const issue = validation?.success === false ? validation.issue : null

// <input value={input} onChange={(event) => changeInput(event.target.value)} />
// {issue && <p>{issue.message}</p>}
```

### With Valibot

```ts
import * as v from 'valibot'
import * as rut from '@dud-cl/rut'

const schema = v.object({
  nationalId: v.pipe(v.string(), v.check(rut.is, 'Invalid RUT')),
})
```

## API

| API | Purpose |
|---|---|
| `parse(input, language?)` | Validate input. Return the canonical RUT or throw `RutError`. |
| `safeParse(input, language?)` | Validate input without throwing. Return a structured result. |
| `is(input)` | Return whether the input is valid. |
| `format(rut, options?)` | Format a validated RUT. Use `dots` and `uppercase` to control the output. |
| `formatPartial(input)` | Format partial input for display without validating it. |
| `clean(input)` | Normalize input without validating it. |
| `compare(left, right)` | Compare two valid RUT values. |
| `getVerifier(body)` | Calculate the verifier for a valid body. Return `null` for an invalid body. |

After validation, `parse` returns the canonical string (`21272789K`).

Errors use Spanish (`es`) by default. Pass `en` as the second argument to `parse` or `safeParse` for English messages.

The canonical string contains 8 or 9 characters: a 7- or 8-digit body and its verifier. Pass a value returned by `parse` to `format`. Use `formatPartial` only for editable display values. Its output is untrusted: normalization can make otherwise invalid raw syntax acceptable. Validate the raw input when exact syntax matters or validate the formatted output before accepting it. Unsupported or overlong text remains unchanged to avoid extracting a RUT from surrounding content.

## Development

```bash
pnpm install
pnpm test
pnpm build
```

## License

MIT
