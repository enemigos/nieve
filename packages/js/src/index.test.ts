import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import {
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

const valid = loadFixture<ValidCase[]>('valid.json')
const invalid = loadFixture<InvalidCase[]>('invalid.json')

describe('format', () => {
  it.each(valid)(
    '$input formats with dots',
    ({ input, formatted, formattedNoDots }) => {
      const rut = parse(input)
      expect(format(rut)).toBe(formatted)
      expect(format(rut, { dots: false })).toBe(formattedNoDots)
    },
  )
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
