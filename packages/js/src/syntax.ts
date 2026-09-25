/**
 * Shared syntax rules. Keep these aligned with the Python package.
 *
 * A body is either bare digits (`21272789`) or dot separated groups of three
 * digits after a leading group of one to three digits (`21.272.789`). Mixing the
 * two styles is rejected, and a leading zero is rejected. Body size is checked
 * separately so that a well formed token of the wrong size reports `length`
 * instead of `format`.
 */
const BODY = String.raw`(?:[1-9]\d{0,2}(?:\.\d{3})+|[1-9]\d*)`

/** Optional body, optional hyphen, verifier. */
export const RUT_SYNTAX = new RegExp(String.raw`^${BODY}?-?[\dkK]$`)

/** A body on its own, with an optional trailing hyphen. */
export const BODY_SYNTAX = new RegExp(String.raw`^${BODY}-?$`)

export const MIN_BODY_LENGTH = 7
export const MAX_BODY_LENGTH = 8

/**
 * Surrounding whitespace that both packages ignore: ASCII whitespace plus the
 * no-break space, which is common in values pasted from documents. The set is
 * explicit so TypeScript and Python trim exactly the same characters.
 */
const TRIMMED = /^[ \t\n\r\v\f\u00a0]+|[ \t\n\r\v\f\u00a0]+$/g

export function trimWhitespace(value: string): string {
  return value.replace(TRIMMED, '')
}

/** Remove the separators allowed by the syntax rules. */
export function stripSeparators(value: string): string {
  return value.replace(/[.-]/g, '')
}

/** Insert dots every three digits from the right. */
export function groupThousands(digits: string): string {
  let result = digits.slice(-3)
  let rest = digits.slice(0, -3)

  while (rest.length > 0) {
    result = `${rest.slice(-3)}.${result}`
    rest = rest.slice(0, -3)
  }

  return result
}
