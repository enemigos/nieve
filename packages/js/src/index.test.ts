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
  kind: 'type' | 'format' | 'length' | 'verifier'
}

type UtilityCase = {
  input: string
  output: string
}

const valid = loadFixture<ValidCase[]>('valid.json')
const invalid = loadFixture<InvalidCase[]>('invalid.json')
const cleaned = loadFixture<UtilityCase[]>('clean.json')
const verifiers = loadFixture<UtilityCase[]>('verifier.json')

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
    const rut = parse('21.272.789-K')
    expect(format(rut, { uppercase: false })).toBe('21.272.789-k')
    expect(format(rut, { dots: false, uppercase: false })).toBe('21272789-k')
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
    expect(compare('21.272.789-K', '21272789K')).toBe(true)
    expect(compare('21.272.789-K', '9.068.826-k')).toBe(false)
  })

  it('never considers invalid inputs equal', () => {
    expect(compare('21.272.789-0', '21.272.789-0')).toBe(false)
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
    expect(is(clean('chuma1996@gmail.com'))).toBe(false)
  })

  it.each([
    {
      input: 189726317,
      es: 'El RUT debe ser una cadena de texto. Usa un valor como "21.272.789-K" e intenta de nuevo.',
      en: 'RUT must be a string. Use a value such as "21.272.789-K", then try again.',
    },
    {
      input: 'abc',
      es: 'El formato del RUT es incorrecto. Usa 7 u 8 d\u00edgitos y un verificador, por ejemplo, "21.272.789-K".',
      en: 'RUT format is incorrect. Use 7 or 8 digits and a verifier, for example, "21.272.789-K".',
    },
    {
      input: '1-9',
      es: 'El cuerpo del RUT debe tener 7 u 8 d\u00edgitos antes del verificador; tiene 1. Corrige el cuerpo e intenta de nuevo.',
      en: 'RUT body must contain 7 or 8 digits before the verifier; it contains 1. Correct the body, then try again.',
    },
    {
      input: '21.272.789-0',
      es: 'El verificador no coincide. Reemplaza "0" por "K".',
      en: 'RUT verifier does not match. Replace "0" with "K".',
    },
  ])('returns actionable messages for $input', ({ input, es, en }) => {
    expect(safeParse(input)).toMatchObject({
      success: false,
      issue: { message: es },
    })
    expect(safeParse(input, 'en')).toMatchObject({
      success: false,
      issue: { message: en },
    })
  })

  it('rejects short progressive input (rut.js #25)', () => {
    for (const value of ['1', '17', '173', '1735', '17353']) {
      expect(is(value)).toBe(false)
    }
  })

  it('exposes the single parse issue on RutError', () => {
    try {
      parse('21.272.789-0')
      expect.unreachable()
    } catch (error) {
      expect(error).toBeInstanceOf(RutError)
      expect((error as RutError).issue.kind).toBe('verifier')
    }
  })

  it('uses the selected language for RutError', () => {
    expect(() => parse('21.272.789-0')).toThrow(
      'El verificador no coincide. Reemplaza "0" por "K".',
    )
    expect(() => parse('21.272.789-0', 'en')).toThrow(
      'RUT verifier does not match. Replace "0" with "K".',
    )
  })
})
