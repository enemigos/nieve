import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import {
  clean,
  compare,
  format,
  getVerifier,
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

type UtilityCase = {
  input: string
  output: string
}

const valid = loadFixture<ValidCase[]>('valid.json')
const invalid = loadFixture<InvalidCase[]>('invalid.json')
const cleaned = loadFixture<UtilityCase[]>('clean.json')
const verifiers = loadFixture<UtilityCase[]>('check-digit.json')

describe('format', () => {
  it.each(valid)(
    '$input formats with dots',
    ({ input, formatted, formattedNoDots }) => {
      const rut = parse(input)
      expect(format(rut)).toBe(formatted)
      expect(format(rut, { dots: false })).toBe(formattedNoDots)
    },
  )

  it('formats K in lowercase when requested', () => {
    const rut = parse('9.068.826-k')
    expect(format(rut, { uppercase: false })).toBe('9.068.826-k')
    expect(format(rut, { dots: false, uppercase: false })).toBe('9068826-k')
  })
})

describe('clean', () => {
  it.each(cleaned)('normalizes $input', ({ input, output }) => {
    expect(clean(input)).toBe(output)
  })

  it('returns an empty string for non-string input', () => {
    expect(clean(189726317)).toBe('')
  })
})

describe('getVerifier', () => {
  it.each(verifiers)('calculates $output for $input', ({ input, output }) => {
    expect(getVerifier(input)).toBe(output)
  })

  it.each([
    null,
    18972631,
    '',
    'abc',
    '12K',
    '12 34',
    '1',
    '123456',
    '123456789',
    '0000000',
  ])(
    'returns null for invalid body $input',
    (input) => {
      expect(getVerifier(input)).toBeNull()
    },
  )
})

describe('compare', () => {
  it('compares canonical values of valid inputs', () => {
    expect(compare('18.972.631-7', '189726317')).toBe(true)
    expect(compare('18.972.631-7', '9.068.826-k')).toBe(false)
  })

  it('never considers invalid inputs equal', () => {
    expect(compare('18.972.631-0', '18.972.631-0')).toBe(false)
    expect(compare(null, null)).toBe(false)
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
      expect(result.issue.kind).toBe(kind)
    }
    expect(is(input)).toBe(false)
    expect(() => parse(input)).toThrow(RutError)
  })

  it('rejects non-string input as type', () => {
    const result = safeParse(189726317)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.issue.kind).toBe('type')
    }
    expect(is(189726317)).toBe(false)
  })

  it('rejects unrelated input instead of extracting digits (rut.js #15)', () => {
    expect(safeParse('chuma1996@gmail.com')).toMatchObject({
      success: false,
      issue: { kind: 'format' },
    })
  })

  it('rejects short progressive input (rut.js #25)', () => {
    for (const value of ['1', '17', '173', '1735', '17353']) {
      expect(is(value)).toBe(false)
    }
  })

  it('exposes the single parse issue on RutError', () => {
    try {
      parse('18.972.631-0')
      expect.unreachable()
    } catch (error) {
      expect(error).toBeInstanceOf(RutError)
      expect((error as RutError).issue.kind).toBe('check_digit')
    }
  })
})
