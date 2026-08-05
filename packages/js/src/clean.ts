/**
 * Normalize a RUT-like string: strip non-digits/K, uppercase K, drop leading zeros.
 * Does not validate check digit or format.
 */
export function clean(input: unknown): string {
  return typeof input === 'string'
    ? input.replace(/^0+|[^0-9kK]+/g, '').toUpperCase()
    : ''
}
