import type { RutIssue } from './types'

export class RutError extends Error {
  readonly issues: readonly [RutIssue, ...RutIssue[]]

  constructor(issues: readonly [RutIssue, ...RutIssue[]]) {
    super(issues[0]?.message ?? 'Invalid RUT')
    this.name = 'RutError'
    this.issues = issues
  }
}
