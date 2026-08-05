/**
 * Drop-in `rut.js` surface.
 *
 * @example
 * ```ts
 * import { validate, clean, format, getCheckDigit } from 'rut-cl/legacy'
 * ```
 *
 * `validate` uses the modern length gate (cleaned length 8-9), so short
 * modulo-11 false positives from progressive typing are rejected.
 */
export { clean } from './clean'
export { format } from './format'
export { checkDigit as getCheckDigit } from './check-digit'
export { is as validate } from './parse'
export type { FormatOptions } from './types'
