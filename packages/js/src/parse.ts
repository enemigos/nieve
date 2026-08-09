import { checkDigit } from './check-digit'
import { RutError } from './error'
import type { Rut, RutIssue, SafeParseResult } from './types'

/** Same shape gate as rut.js `validate`. */
const RUT_FORMAT =
  /^([1-9]\d{0,2}(\.?\d{3})*)-?[\dkK]$/

/** Body 7-8 digits + DV. Rejects short modulo-11 false positives. */
const MIN_CLEANED_LENGTH = 8
const MAX_CLEANED_LENGTH = 9

function asRut(value: string): Rut {
  return value as Rut
}

export function safeParse(input: unknown): SafeParseResult {
  if (typeof input !== 'string') {
    const issue = {
      kind: 'type',
      message: 'Expected a string RUT',
      input,
    } as const satisfies RutIssue

    return { success: false, issue }
  }

  if (!RUT_FORMAT.test(input)) {
    const issue = {
      kind: 'format',
      message: 'Invalid RUT format',
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
      message: `RUT must be ${MIN_CLEANED_LENGTH}-${MAX_CLEANED_LENGTH} characters after cleaning`,
      input,
    } as const satisfies RutIssue

    return { success: false, issue }
  }

  const body = cleaned.slice(0, -1)
  const received = cleaned.slice(-1)
  const expected = checkDigit(body)

  if (expected !== received) {
    const issue = {
      kind: 'check_digit',
      message: `Invalid check digit: expected ${expected}, received ${received}`,
      input,
      expected,
      received,
    } as const satisfies RutIssue

    return { success: false, issue }
  }

  return { success: true, output: asRut(cleaned) }
}

export function parse(input: unknown): Rut {
  const result = safeParse(input)

  if (!result.success) {
    throw new RutError(result.issue)
  }

  return result.output
}

export function is(input: unknown): boolean {
  return safeParse(input).success
}
