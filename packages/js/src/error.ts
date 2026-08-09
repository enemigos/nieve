import type { RutIssue } from './types'

export class RutError extends Error {
  readonly issue: RutIssue

  constructor(issue: RutIssue) {
    super(issue.message)
    this.name = 'RutError'
    this.issue = issue
  }
}
