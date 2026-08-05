import { describe, expect, it } from 'vitest'
import { checkDigit, clean as coreClean, format as coreFormat, is } from './index'
import {
  clean,
  format,
  getCheckDigit,
  validate,
} from './legacy'

describe('rut-cl/legacy', () => {
  it('exposes the rut.js export names', () => {
    expect(validate).toBe(is)
    expect(clean).toBe(coreClean)
    expect(format).toBe(coreFormat)
    expect(getCheckDigit).toBe(checkDigit)
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
})
