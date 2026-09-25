/**
 * Strip everything that is not a digit or `K`, uppercase the result, and drop
 * leading zeros.
 *
 * This is a lossy normalizer, not a validator: it happily turns unrelated text
 * into a RUT-looking string, and returns an empty string for non-string input.
 * Always pass the result through `parse`, `safeParse`, or `is` before using it.
 */
export function clean(input: unknown): string {
  return typeof input === 'string'
    ? input
        .replace(/[^0-9kK]+/g, '')
        .replace(/^0+/, '')
        .toUpperCase()
    : ''
}
