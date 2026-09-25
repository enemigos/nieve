# nieve

Validate and format Chilean RUT values in TypeScript.

The API uses result objects similar to Valibot and Zod.

## Motivation

[`rut.js`](https://github.com/jlobos/rut.js) has not published an npm release since October 2021 and still has open validation and formatting issues. [`rutjs`](https://github.com/jeam/rut) has not received updates since July 2013. This package rejects unrelated text, partial input, inconsistent separators, and bodies with invalid lengths. It returns typed issues in Spanish or English.

The same behavior ships as [`nieve`](https://pypi.org/project/nieve/) for Python. Both packages share one set of fixtures, including a generated conformance suite that fails CI when the two implementations disagree, and both are released with the same version number. See the [agent reference](https://github.com/enemigos/nieve/blob/main/llms.txt) for complete contracts and recipes.

## Install

```bash
npm i nieve
```

## Usage

Examples import the package as `rut` so each call reads on its own.

```ts
import * as rut from 'nieve'

const value = rut.parse('21.272.789-K')
// Branded canonical RUT: '21272789K'

rut.format(value)                                 // '21.272.789-K'
rut.format(value, { style: 'plain' })             // '21272789-K'
rut.format(value, { verifierCase: 'lower' })      // '21.272.789-k'

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

rut.clean('0021.272.789-k')                 // '21272789K' (does not validate)
rut.getVerifier('21.272.789')               // 'K'
rut.compare('21.272.789-K', '21272789K')    // true
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

`safeParse` returns one issue, and each `kind` means one thing:

| `kind` | When |
|---|---|
| `type` | Input is not a string. |
| `format` | The syntax is not a RUT: stray characters, mixed or misplaced separators, a leading zero. |
| `length` | The syntax is valid but the body does not contain 7 or 8 digits. Carries `bodyLength`. |
| `verifier` | The size is valid but the verifier does not match. Carries `expected` and `received`. |

### Stored values

`format` accepts anything `parse` accepts and throws `RutError` for anything else, so a canonical value read back from storage formats without a cast to `Rut`:

```ts
const stored: string = '21272789K'

rut.format(stored) // '21.272.789-K'
```

### With Zod

```ts
import * as z from 'zod'
import * as rut from 'nieve'

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

`formatPartial` formats input while it is being typed. It returns `kind: 'formatted'` with the normalized value, or `kind: 'unsupported'` with the input unchanged when it cannot become a RUT by typing more characters.

**Warning:** `formatPartial` validates nothing. Normalizing dots, hyphens, and whitespace can turn raw input that `parse` rejects into input it accepts. If exact raw syntax matters, call `safeParse(raw)` and display the validated `Rut` with `format`. Otherwise validate before storing the value.

```tsx
import { useState } from 'react'
import * as rut from 'nieve'

const [input, setInput] = useState('')
const [validation, setValidation] = useState<rut.SafeParseResult | null>(null)

function changeInput(raw: string) {
  const partial = rut.formatPartial(raw)

  if (partial.kind === 'unsupported') return

  setInput(partial.value)
  setValidation(partial.value ? rut.safeParse(partial.value, 'en') : null)
}

const issue = validation?.success === false ? validation.issue : null

// <input value={input} onChange={(event) => changeInput(event.target.value)} />
// {issue && <p>{issue.message}</p>}
```

### With Valibot

```ts
import * as v from 'valibot'
import * as rut from 'nieve'

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
| `format(value, options?)` | Format a RUT. Validates first and throws `RutError` for invalid input. |
| `formatPartial(input)` | Format partial input for display. Returns a `PartialFormat`, validates nothing. |
| `clean(input)` | Normalize input without validating it. The output is untrusted. |
| `compare(left, right)` | Return whether two inputs are the same RUT. |
| `getVerifier(body)` | Calculate the verifier for a valid body. Return `null` for an invalid body. |

`format` options are `style` (`'dotted'` by default, or `'plain'`) and `verifierCase` (`'upper'` by default, or `'lower'`).

Errors use Spanish (`es`) by default. Pass `en` as the second argument to `parse` or `safeParse` for English messages.

`compare` returns `false` when either input is invalid, so it cannot distinguish "different" from "invalid". Use `safeParse` when that difference matters.

Exported types: `Rut`, `Language`, `RutIssue`, `RutIssueKind`, `TypeIssue`, `FormatIssue`, `LengthIssue`, `VerifierIssue`, `SafeParseResult`, `SafeParseSuccess`, `SafeParseFailure`, `FormatOptions`, `RutStyle`, `VerifierCase`, `PartialFormat`.

## Development

```bash
pnpm install
pnpm test
pnpm build
```

## License

MIT
