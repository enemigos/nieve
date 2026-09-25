import { parse } from './parse'
import { groupThousands } from './syntax'
import type { FormatOptions, PartialFormat, Rut } from './types'

/** Accepts the characters `formatPartial` can normalize into a RUT prefix. */
const PARTIAL_SHAPE = /^(?:\d{0,9}|\d{0,8}K)$/

/**
 * Format editable input for display while it is being typed.
 *
 * Returns `kind: 'formatted'` with the normalized value, or `kind:
 * 'unsupported'` with the input unchanged when it cannot become a RUT by typing
 * more characters. Nothing is validated: a `formatted` value can still be
 * rejected by `parse`, and normalizing separators can turn raw syntax that
 * `parse` rejects into syntax it accepts. Validate before storing the value.
 */
export function formatPartial(input: unknown): PartialFormat {
  if (typeof input !== 'string') return { kind: 'unsupported', value: '' }

  const normalized = input.replace(/[.\s-]+/g, '').toUpperCase()

  if (!PARTIAL_SHAPE.test(normalized)) {
    return { kind: 'unsupported', value: input }
  }

  if (normalized.length < 2) return { kind: 'formatted', value: normalized }

  const body = normalized.slice(0, -1)
  const verifier = normalized.slice(-1)

  return { kind: 'formatted', value: `${groupThousands(body)}-${verifier}` }
}

/**
 * Format a RUT for display.
 *
 * Accepts a parsed `Rut` or any string `parse` accepts, which makes stored
 * values usable without an unsafe cast. Throws `RutError` for invalid input, so
 * it never returns a formatted string that is not a real RUT. Use `safeParse`
 * for untrusted input.
 */
export function format(
  value: Rut | string,
  options: FormatOptions = {},
): string {
  const canonical = parse(value)
  const body = canonical.slice(0, -1)
  const verifier =
    options.verifierCase === 'lower'
      ? canonical.slice(-1).toLowerCase()
      : canonical.slice(-1)

  if (options.style === 'plain') return `${body}-${verifier}`

  return `${groupThousands(body)}-${verifier}`
}
