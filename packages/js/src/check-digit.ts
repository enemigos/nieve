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
