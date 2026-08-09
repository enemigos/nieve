import { describe, expect, it } from 'vitest'
import { is } from './index'
import {
  clean,
  format,
  getCheckDigit,
  validate,
} from './legacy'

describe('rut-cl/legacy', () => {
  it('exposes the rut.js export names', () => {
    expect(validate).toBeTypeOf('function')
    expect(clean).toBeTypeOf('function')
    expect(format).toBeTypeOf('function')
    expect(getCheckDigit).toBeTypeOf('function')
  })

  it('matches rut.js call sites', () => {
    expect(validate('18.972.631-7')).toBe(true)
    expect(validate('18.972.631-0')).toBe(false)
    expect(clean('18.972.631-7')).toBe('189726317')
    expect(format('189726317')).toBe('18.972.631-7')
    expect(format('189726317', { dots: false })).toBe('18972631-7')
    expect(getCheckDigit('18972631')).toBe('7')
    expect(getCheckDigit('9068826')).toBe('K')
  })

  it('preserves permissive rut.js behavior', () => {
    expect(validate('19')).toBe(true)
    expect(is('19')).toBe(false)
    expect(clean('12*345*678*k')).toBe('12345678K')
    expect(format('1')).toBe('-1')
    expect(format('abc')).toBe('-')
    expect(getCheckDigit('18.657.499-')).toBe('0')
  })
})
