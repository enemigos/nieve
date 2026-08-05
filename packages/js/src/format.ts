import { clean } from './clean'
import type { FormatOptions } from './types'

/**
 * Format a RUT-like string for display.
 * Does not validate check digit.
 */
export function format(input: unknown, options: FormatOptions = {}): string {
  if (!input) {
    return ''
  }

  const rut = clean(input)
  // Need at least body digit + DV; otherwise avoid odd outputs like "-0".
  if (rut.length < 2) {
    return ''
  }

  const dots = options.dots ?? true
  const body = rut.slice(0, -1)
  const dv = rut.slice(-1)

  if (!dots) {
    return `${body}-${dv}`
  }

  let result = `${body.slice(-3)}-${dv}`
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
