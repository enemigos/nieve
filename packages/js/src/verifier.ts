import {
  BODY_SYNTAX,
  MAX_BODY_LENGTH,
  MIN_BODY_LENGTH,
  stripSeparators,
  trimWhitespace,
} from './syntax'

/**
 * Compute the modulo-11 verifier for a body of digits.
 * Internal: callers must pass a body that already matched the syntax rules.
 */
export function calculateVerifier(body: string): string {
  if (!/^\d+$/.test(body)) {
    throw new Error(`"${body}" is not a RUT body`)
  }

  const sum = Array.from(body)
    .reverse()
    .reduce(
      (total, char, index) => total + Number(char) * ((index % 6) + 2),
      0,
    )

  const digit = 11 - (sum % 11)

  if (digit === 10) return 'K'
  if (digit === 11) return '0'

  return String(digit)
}

/**
 * Compute the verifier for a RUT body.
 * Accepts the same body syntax as `parse`, with an optional trailing hyphen and
 * surrounding whitespace. Returns `null` for anything else.
 */
export function getVerifier(input: unknown): string | null {
  if (typeof input !== 'string') return null

  const value = trimWhitespace(input)

  if (!BODY_SYNTAX.test(value)) return null

  const body = stripSeparators(value)

  if (body.length < MIN_BODY_LENGTH || body.length > MAX_BODY_LENGTH) {
    return null
  }

  return calculateVerifier(body)
}
