/**
 * rut.js-compatible legacy helpers.
 *
 * @example
 * ```ts
 * import { validate, clean, format, getCheckDigit } from 'rut-cl/legacy'
 * ```
 *
 * These permissive functions match rut.js behavior. Prefer the modern root
 * entry point for new validation code.
 */
import { clean } from './clean'

export { clean }

const RUT_FORMAT = /^([1-9]\d{0,2}(\.?\d{3})*)-?[\dkK]$/

export function validate(input: unknown): boolean {
  if (typeof input !== 'string' || !RUT_FORMAT.test(input)) {
    return false
  }

  const rut = clean(input)
  let body = Number.parseInt(rut.slice(0, -1), 10)
  let index = 0
  let sum = 1

  while (body > 0) {
    sum = (sum + (body % 10) * (9 - (index++ % 6))) % 11
    body = Math.floor(body / 10)
  }

  const expected = sum > 0 ? String(sum - 1) : 'K'
  return expected === rut.slice(-1)
}

export function format(
  input: unknown,
  options: { readonly dots?: boolean } = { dots: true },
): string {
  if (!input) {
    return ''
  }

  const rut = clean(input)

  if (!options.dots) {
    return `${rut.slice(0, -1)}-${rut.slice(-1)}`
  }

  let result = `${rut.slice(-4, -1)}-${rut.slice(-1)}`

  for (let index = 4; index < rut.length; index += 3) {
    result = `${rut.slice(-3 - index, -index)}.${result}`
  }

  return result
}

export function getCheckDigit(input: unknown): string {
  const digits = Array.from(clean(input), Number)

  if (digits.length === 0 || digits.includes(Number.NaN)) {
    throw new Error(`"${String(input)}" as RUT is invalid`)
  }

  const sum = digits.reverse().reduce(
    (total, digit, index) => total + digit * ((index % 6) + 2),
    0,
  )
  const checkDigit = 11 - (sum % 11)

  if (checkDigit === 10) {
    return 'K'
  }

  if (checkDigit === 11) {
    return '0'
  }

  return String(checkDigit)
}
