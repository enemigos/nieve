import type { FormatOptions, Rut } from './types'

/**
 * Format a validated RUT for display.
 */
export function format(rut: Rut, options: FormatOptions = {}): string {
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
