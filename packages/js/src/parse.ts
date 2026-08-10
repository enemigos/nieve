import { RutError } from './error'
import type { Language, Rut, RutIssue, SafeParseResult } from './types'
import { calculateVerifier } from './verifier'

/** Same shape gate as rut.js `validate`. */
const RUT_FORMAT =
  /^([1-9]\d{0,2}(\.?\d{3})*)-?[\dkK]$/

/** Body 7-8 digits + DV. Rejects short modulo-11 false positives. */
const MIN_CLEANED_LENGTH = 8
const MAX_CLEANED_LENGTH = 9

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

function asRut(value: string): Rut {
  return value as Rut
}

export function safeParse(
  input: unknown,
  language: Language = 'es',
): SafeParseResult {
  const messages = MESSAGES[language]

  if (typeof input !== 'string') {
    const issue = {
      kind: 'type',
      message: messages.type,
      input,
    } as const satisfies RutIssue

    return { success: false, issue }
  }

  if (!RUT_FORMAT.test(input)) {
    const issue = {
      kind: 'format',
      message: messages.format,
      input,
    } as const satisfies RutIssue

    return { success: false, issue }
  }

  const cleaned = input.replace(/[.-]/g, '').toUpperCase()

  if (
    cleaned.length < MIN_CLEANED_LENGTH ||
    cleaned.length > MAX_CLEANED_LENGTH
  ) {
    const issue = {
      kind: 'length',
      message: messages.length(cleaned.length - 1),
      input,
    } as const satisfies RutIssue

    return { success: false, issue }
  }

  const body = cleaned.slice(0, -1)
  const received = cleaned.slice(-1)
  const expected = calculateVerifier(body)

  if (expected !== received) {
    const issue = {
      kind: 'verifier',
      message: messages.verifier(expected, received),
      input,
      expected,
      received,
    } as const satisfies RutIssue

    return { success: false, issue }
  }

  return { success: true, output: asRut(cleaned) }
}

export function parse(input: unknown, language: Language = 'es'): Rut {
  const result = safeParse(input, language)

  if (!result.success) {
    throw new RutError(result.issue)
  }

  return result.output
}

export function is(input: unknown): boolean {
  return safeParse(input).success
}

/** Return whether two valid RUT inputs have the same canonical value. */
export function compare(left: unknown, right: unknown): boolean {
  const leftResult = safeParse(left)
  const rightResult = safeParse(right)

  return (
    leftResult.success &&
    rightResult.success &&
    leftResult.output === rightResult.output
  )
}
