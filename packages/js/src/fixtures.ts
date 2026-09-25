import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { Language, RutIssueKind, RutStyle, VerifierCase } from './types'

const directory = join(
  dirname(fileURLToPath(import.meta.url)),
  '../../../fixtures',
)

function load<T>(name: string): T {
  return JSON.parse(readFileSync(join(directory, name), 'utf8')) as T
}

export type ValidCase = {
  readonly input: string
  readonly cleaned: string
  readonly dotted: string
  readonly plain: string
}

export type InvalidCase = {
  readonly input: string
  readonly kind: Exclude<RutIssueKind, 'type'>
  readonly bodyLength?: number
}

export type FormatCase = {
  readonly value: string
  readonly style: RutStyle
  readonly verifierCase: VerifierCase
  readonly output: string
}

export type PartialCase = {
  readonly input: string
  readonly kind: 'formatted' | 'unsupported'
  readonly value: string
}

export type MessageCase = {
  readonly input: unknown
  readonly kind: RutIssueKind
} & Record<Language, string>

export type CompareCase = {
  readonly left: unknown
  readonly right: unknown
  readonly equal: boolean
}

export type UtilityCase = {
  readonly input: string
  readonly output: string | null
}

export type ConformanceCase = {
  readonly input: unknown
  readonly outcome: 'valid' | RutIssueKind
  readonly output: string | null
  readonly dotted?: string
  readonly plain?: string
  readonly bodyLength?: number | null
}

export const valid = load<ValidCase[]>('valid.json')
export const invalid = load<InvalidCase[]>('invalid.json')
export const cleaned = load<UtilityCase[]>('clean.json')
export const verifiers = load<UtilityCase[]>('verifier.json')
export const messages = load<MessageCase[]>('messages.json')
export const comparisons = load<CompareCase[]>('compare.json')
export const partials = load<PartialCase[]>('format-partial.json')
export const formats = load<{
  readonly cases: FormatCase[]
  readonly rejected: string[]
}>('format.json')
export const conformance = load<{
  readonly cases: ConformanceCase[]
}>('conformance.json').cases
