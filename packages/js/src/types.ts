declare const rutBrand: unique symbol

/** Canonical cleaned RUT string, e.g. `"21272789K"`. */
export type Rut = string & { readonly [rutBrand]: true }

export type Language = 'es' | 'en'

/** Input is not a string. */
export type TypeIssue = {
  readonly kind: 'type'
  readonly message: string
  readonly input: unknown
}

/** Input is a string whose syntax is not a RUT: stray characters, mixed or misplaced separators, leading zero. */
export type FormatIssue = {
  readonly kind: 'format'
  readonly message: string
  readonly input: string
}

/** Syntax is valid but the body does not contain 7 or 8 digits. */
export type LengthIssue = {
  readonly kind: 'length'
  readonly message: string
  readonly input: string
  readonly bodyLength: number
}

/** Syntax and length are valid but the verifier does not match the modulo-11 result. */
export type VerifierIssue = {
  readonly kind: 'verifier'
  readonly message: string
  readonly input: string
  readonly expected: string
  readonly received: string
}

export type RutIssue = TypeIssue | FormatIssue | LengthIssue | VerifierIssue

export type RutIssueKind = RutIssue['kind']

export type SafeParseSuccess = {
  readonly success: true
  readonly output: Rut
}

export type SafeParseFailure = {
  readonly success: false
  readonly issue: RutIssue
}

export type SafeParseResult = SafeParseSuccess | SafeParseFailure

/** `dotted` renders `21.272.789-K`. `plain` renders `21272789-K`. */
export type RutStyle = 'dotted' | 'plain'

/** Case of the `K` verifier. Digits are unaffected. */
export type VerifierCase = 'upper' | 'lower'

export type FormatOptions = {
  readonly style?: RutStyle
  readonly verifierCase?: VerifierCase
}

/**
 * Result of formatting editable input.
 * `formatted` carries the normalized display value. `unsupported` carries the
 * input unchanged because it cannot become a RUT by typing more characters.
 */
export type PartialFormat =
  | { readonly kind: 'formatted'; readonly value: string }
  | { readonly kind: 'unsupported'; readonly value: string }
