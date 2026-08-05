import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import {
  checkDigit,
  clean,
  format,
  is,
  parse,
  RutError,
  safeParse,
} from './index'

const fixturesDir = join(
  dirname(fileURLToPath(import.meta.url)),
  '../../../fixtures',
)

function loadFixture<T>(name: string): T {
  return JSON.parse(readFileSync(join(fixturesDir, name), 'utf8')) as T
}

type ValidCase = {
  input: string
  cleaned: string
  formatted: string
  formattedNoDots: string
}

type InvalidCase = {
  input: string
  kind: 'type' | 'format' | 'length' | 'check_digit'
}

type CleanCase = { input: string; output: string }
type CheckDigitCase = { input: string; output: string }

const valid = loadFixture<ValidCase[]>('valid.json')
const invalid = loadFixture<InvalidCase[]>('invalid.json')
const cleanCases = loadFixture<CleanCase[]>('clean.json')
const checkDigitCases = loadFixture<CheckDigitCase[]>('check-digit.json')

describe('clean', () => {
  it.each(cleanCases)('$input -> $output', ({ input, output }) => {
    expect(clean(input)).toBe(output)
  })

  it('returns empty string for non-strings', () => {
    expect(clean(189726317)).toBe('')
    expect(clean(null)).toBe('')
  })
})

describe('format', () => {
  it.each(valid)(
    '$input formats with dots',
    ({ input, formatted, formattedNoDots }) => {
      expect(format(input)).toBe(formatted)
      expect(format(input, { dots: false })).toBe(formattedNoDots)
    },
  )

  it('returns empty string for empty or DV-only input', () => {
    expect(format('')).toBe('')
    expect(format('0-0')).toBe('')
    expect(format('K')).toBe('')
  })
})

describe('checkDigit', () => {
  it.each(checkDigitCases)('$input -> $output', ({ input, output }) => {
    expect(checkDigit(input)).toBe(output)
  })

  it('throws for non-digit bodies', () => {
    expect(() => checkDigit('Felipe Camiroaga')).toThrow(
      '"Felipe Camiroaga" as RUT is invalid',
    )
  })

  it('throws for non-string input', () => {
    expect(() => checkDigit(0)).toThrow('"0" as RUT is invalid')
  })
})

describe('safeParse / parse / is', () => {
  it.each(valid)('accepts $input', ({ input, cleaned }) => {
    const result = safeParse(input)
    expect(result).toEqual({ success: true, output: cleaned })
    expect(parse(input)).toBe(cleaned)
    expect(is(input)).toBe(true)
  })

  it.each(invalid)('rejects $input as $kind', ({ input, kind }) => {
    const result = safeParse(input)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.issues[0]?.kind).toBe(kind)
    }
    expect(is(input)).toBe(false)
    expect(() => parse(input)).toThrow(RutError)
  })

  it('rejects non-string input as type', () => {
    const result = safeParse(189726317)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.issues[0]?.kind).toBe('type')
    }
    expect(is(189726317)).toBe(false)
  })

  it('rejects email digits extracted via clean (rut.js #15)', () => {
    const extracted = clean('chuma1996@gmail.com')
    expect(extracted).toBe('1996')
    expect(is(extracted)).toBe(false)
    expect(safeParse(extracted)).toMatchObject({
      success: false,
      issues: [{ kind: 'length' }],
    })
  })

  it('rejects short progressive input (rut.js #25)', () => {
    for (const value of ['1', '17', '173', '1735', '17353']) {
      expect(is(value)).toBe(false)
    }
  })
})
