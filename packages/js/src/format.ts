import type { FormatOptions, Rut } from './types'

/**
 * Format partial RUT input while it is being edited.
 * Leaves unsupported or overlong input unchanged so validation can reject it.
 * Warning: normalization can make otherwise invalid raw syntax parseable.
 * Never trust the output without validation.
 */
export function formatPartial(input: unknown): string {
  if (typeof input !== 'string') return ''

  if (/[^0-9kK.\s-]/.test(input)) return input

  const normalized = input.replace(/[.\s-]+/g, '').toUpperCase()

  if (!/^(?:\d{0,9}|\d{0,8}K)$/.test(normalized)) return input

  if (normalized.length < 2) return normalized

  const body = normalized.slice(0, -1)
  const verifier = normalized.slice(-1)
  const dottedBody = body.replace(/\B(?=(\d{3})+(?!\d))/g, '.')

  return `${dottedBody}-${verifier}`
}

/**
 * Format a validated RUT for display.
 */
export function format(rut: Rut, options: FormatOptions = {}): string {
  const dots = options.dots ?? true
  const body = rut.slice(0, -1)
  const verifier = options.uppercase === false
    ? rut.slice(-1).toLowerCase()
    : rut.slice(-1)

  if (!dots) {
    return `${body}-${verifier}`
  }

  let result = `${body.slice(-3)}-${verifier}`
  let rest = body.slice(0, -3)

  while (rest.length > 3) {
    result = `${rest.slice(-3)}.${result}`
    rest = rest.slice(0, -3)
  }

  if (rest.length > 0) {
    result = `${rest}.${result}`
  }

  return result
}
