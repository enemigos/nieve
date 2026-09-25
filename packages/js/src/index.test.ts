import { describe, expect, it } from 'vitest'
import {
  cleaned,
  comparisons,
  conformance,
  formats,
  invalid,
  messages,
  partials,
  valid,
  verifiers,
} from './fixtures'
import {
  clean,
  compare,
  format,
  formatPartial,
  getVerifier,
  is,
  parse,
  RutError,
  safeParse,
} from './index'

describe('safeParse', () => {
  it.each(valid)('accepts $input', ({ input, cleaned: canonical }) => {
    expect(safeParse(input)).toEqual({ success: true, output: canonical })
    expect(parse(input)).toBe(canonical)
    expect(is(input)).toBe(true)
  })

  it.each(invalid)('rejects $input as $kind', ({ input, kind, bodyLength }) => {
    const result = safeParse(input)

    expect(result.success).toBe(false)
    if (result.success) return

    expect(result.issue.kind).toBe(kind)
    expect(result.issue.input).toBe(input)
    if (result.issue.kind === 'length') {
      expect(result.issue.bodyLength).toBe(bodyLength)
    }

    expect(is(input)).toBe(false)
    expect(() => parse(input)).toThrow(RutError)
  })

  it.each([null, undefined, 189726317, true, {}, []])(
    'rejects non-string %s as type',
    (input) => {
      const result = safeParse(input)

      expect(result.success).toBe(false)
      if (result.success) return

      expect(result.issue.kind).toBe('type')
      expect(result.issue.input).toBe(input)
    },
  )

  it('reports the original input, not the trimmed value', () => {
    const result = safeParse('  21.272.789-0  ')

    expect(result.success).toBe(false)
    if (result.success) return

    expect(result.issue.input).toBe('  21.272.789-0  ')
  })

  it('rejects unrelated text instead of extracting digits (rut.js #15)', () => {
    expect(safeParse('chuma1996@gmail.com')).toMatchObject({
      issue: { kind: 'format' },
    })
    expect(is(clean('chuma1996@gmail.com'))).toBe(false)
  })

  it('rejects short progressive input (rut.js #25)', () => {
    for (const value of ['1', '17', '173', '1735', '17353']) {
      expect(is(value)).toBe(false)
    }
  })
})

describe('issue messages', () => {
  it.each(messages)('$kind for $input', ({ input, kind, es, en }) => {
    expect(safeParse(input)).toMatchObject({ issue: { kind, message: es } })
    expect(safeParse(input, 'es')).toMatchObject({ issue: { message: es } })
    expect(safeParse(input, 'en')).toMatchObject({ issue: { kind, message: en } })
  })
})

describe('RutError', () => {
  it('carries the single issue that failed', () => {
    try {
      parse('21.272.789-0')
      expect.unreachable()
    } catch (error) {
      expect(error).toBeInstanceOf(RutError)
      expect((error as RutError).issue.kind).toBe('verifier')
    }
  })

  it('uses the selected language', () => {
    expect(() => parse('21.272.789-0')).toThrow(
      'El verificador no coincide. Reemplaza "0" por "K".',
    )
    expect(() => parse('21.272.789-0', 'en')).toThrow(
      'RUT verifier does not match. Replace "0" with "K".',
    )
  })
})

describe('format', () => {
  it.each(formats.cases)(
    '$value as $style/$verifierCase',
    ({ value, style, verifierCase, output }) => {
      expect(format(value, { style, verifierCase })).toBe(output)
    },
  )

  it.each(valid)('defaults to dotted uppercase for $input', (testCase) => {
    const rut = parse(testCase.input)

    expect(format(rut)).toBe(testCase.dotted)
    expect(format(rut, { style: 'plain' })).toBe(testCase.plain)
  })

  it.each(formats.rejected)('throws RutError for %j', (value) => {
    expect(() => format(value)).toThrow(RutError)
  })

  it('accepts a stored canonical value without a cast', () => {
    const stored: string = '21272789K'

    expect(format(stored)).toBe('21.272.789-K')
  })
})

describe('formatPartial', () => {
  it.each(partials)('$input becomes $kind', ({ input, kind, value }) => {
    expect(formatPartial(input)).toEqual({ kind, value })
  })

  it('returns an unsupported empty value for non-string input', () => {
    expect(formatPartial(189726317)).toEqual({ kind: 'unsupported', value: '' })
  })

  it('formats without making input valid', () => {
    const result = formatPartial('17353')

    expect(result).toEqual({ kind: 'formatted', value: '1.735-3' })
    expect(safeParse(result.value).success).toBe(false)
  })

  it('never extracts a RUT from surrounding text', () => {
    for (const { input, kind, value } of partials) {
      if (kind !== 'unsupported') continue

      expect(value).toBe(input)
      expect(safeParse(value).success).toBe(false)
    }
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
  it.each(verifiers)('$input yields $output', ({ input, output }) => {
    expect(getVerifier(input)).toBe(output)
  })

  it.each([null, undefined, 18972631, {}])(
    'returns null for non-string %s',
    (input) => {
      expect(getVerifier(input)).toBeNull()
    },
  )

  it('agrees with parse on every valid fixture', () => {
    for (const { cleaned: canonical } of valid) {
      expect(getVerifier(canonical.slice(0, -1))).toBe(canonical.slice(-1))
    }
  })
})

describe('compare', () => {
  it.each(comparisons)('$left vs $right is $equal', ({ left, right, equal }) => {
    expect(compare(left, right)).toBe(equal)
  })
})

describe('conformance with the Python package', () => {
  it.each(conformance)('$outcome for $input', (testCase) => {
    const result = safeParse(testCase.input)

    if (testCase.outcome === 'valid') {
      expect(result).toEqual({ success: true, output: testCase.output })
      expect(format(testCase.output as string)).toBe(testCase.dotted)
      expect(format(testCase.output as string, { style: 'plain' })).toBe(
        testCase.plain,
      )
      return
    }

    expect(result.success).toBe(false)
    if (result.success) return

    expect(result.issue.kind).toBe(testCase.outcome)
    if (result.issue.kind === 'length') {
      expect(result.issue.bodyLength).toBe(testCase.bodyLength)
    }
  })
})
