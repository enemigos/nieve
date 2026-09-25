import { RutError } from './error'
import {
  MAX_BODY_LENGTH,
  MIN_BODY_LENGTH,
  RUT_SYNTAX,
  stripSeparators,
  trimWhitespace,
} from './syntax'
import type { Language, Rut, RutIssue, SafeParseResult } from './types'
import { calculateVerifier } from './verifier'

type Messages = {
  readonly type: string
  readonly format: string
  readonly length: (bodyLength: number) => string
  readonly verifier: (expected: string, received: string) => string
}

const MESSAGES = {
  es: {
    type: 'El RUT debe ser una cadena de texto. Usa un valor como "21.272.789-K" e intenta de nuevo.',
    format:
      'El formato del RUT es incorrecto. Usa 7 u 8 d\u00edgitos y un verificador, por ejemplo, "21.272.789-K".',
    length: (bodyLength) =>
      `El cuerpo del RUT debe tener 7 u 8 d\u00edgitos antes del verificador; tiene ${bodyLength}. Corrige el cuerpo e intenta de nuevo.`,
    verifier: (expected, received) =>
      `El verificador no coincide. Reemplaza "${received}" por "${expected}".`,
  },
  en: {
    type: 'RUT must be a string. Use a value such as "21.272.789-K", then try again.',
    format:
      'RUT format is incorrect. Use 7 or 8 digits and a verifier, for example, "21.272.789-K".',
    length: (bodyLength) =>
      `RUT body must contain 7 or 8 digits before the verifier; it contains ${bodyLength}. Correct the body, then try again.`,
    verifier: (expected, received) =>
      `RUT verifier does not match. Replace "${received}" with "${expected}".`,
  },
} satisfies Record<Language, Messages>

function failure(issue: RutIssue): SafeParseResult {
  return { success: false, issue }
}

/**
 * Validate input without throwing.
 *
 * Surrounding whitespace is ignored. Everything else must already be a RUT:
 * dots are all present or all absent, the hyphen is optional, and `k` may be
 * written in either case. `issue.input` always reports the original input.
 */
export function safeParse(
  input: unknown,
  language: Language = 'es',
): SafeParseResult {
  const messages = MESSAGES[language]

  if (typeof input !== 'string') {
    return failure({ kind: 'type', message: messages.type, input })
  }

  const value = trimWhitespace(input)

  if (!RUT_SYNTAX.test(value)) {
    return failure({ kind: 'format', message: messages.format, input })
  }

  const cleaned = stripSeparators(value).toUpperCase()
  const body = cleaned.slice(0, -1)
  const received = cleaned.slice(-1)

  if (body.length < MIN_BODY_LENGTH || body.length > MAX_BODY_LENGTH) {
    return failure({
      kind: 'length',
      message: messages.length(body.length),
      input,
      bodyLength: body.length,
    })
  }

  const expected = calculateVerifier(body)

  if (expected !== received) {
    return failure({
      kind: 'verifier',
      message: messages.verifier(expected, received),
      input,
      expected,
      received,
    })
  }

  return { success: true, output: cleaned as Rut }
}

/** Validate input. Return the canonical RUT or throw `RutError`. */
export function parse(input: unknown, language: Language = 'es'): Rut {
  const result = safeParse(input, language)

  if (!result.success) {
    throw new RutError(result.issue)
  }

  return result.output
}

/** Return whether input is a valid RUT. */
export function is(input: unknown): boolean {
  return safeParse(input).success
}

/**
 * Return whether two inputs are the same RUT.
 * Returns `false` when either input is invalid, so it cannot distinguish
 * "different" from "invalid". Validate with `safeParse` when that matters.
 */
export function compare(left: unknown, right: unknown): boolean {
  const leftResult = safeParse(left)
  const rightResult = safeParse(right)

  return (
    leftResult.success &&
    rightResult.success &&
    leftResult.output === rightResult.output
  )
}
