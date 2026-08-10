/**
 * Normalize a RUT-like string: strip non-digits/K, uppercase K, drop leading zeros.
 * Does not validate the verifier or format.
 */
export function clean(input: unknown): string {
  return typeof input === 'string'
    ? input.replace(/[^0-9kK]+/g, '').replace(/^0+/, '').toUpperCase()
    : ''
}
