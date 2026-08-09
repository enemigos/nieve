/**
 * Compute the modulo-11 check digit for a RUT body (digits only, no DV).
 */
export function checkDigit(body: string): string {
  const digits = Array.from(body, Number)

  if (digits.length === 0 || digits.includes(Number.NaN)) {
    throw new Error(`"${String(body)}" as RUT is invalid`)
  }

  const sum = [...digits].reverse().reduce(
    (accumulator, currentValue, index) =>
      accumulator + currentValue * ((index % 6) + 2),
    0,
  )

  const digit = 11 - (sum % 11)

  if (digit === 10) {
    return 'K'
  }

  if (digit === 11) {
    return '0'
  }

  return String(digit)
}

/**
 * Compute the modulo-11 verifier for a numeric RUT body.
 * Common separators are ignored; invalid bodies return null.
 */
export function getVerifier(input: unknown): string | null {
  if (typeof input !== 'string') {
    return null
  }

  const body = input.trim().replace(/[.,-]/g, '')
  return /^[1-9]\d{6,7}$/.test(body) ? checkDigit(body) : null
}
