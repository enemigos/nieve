#!/usr/bin/env node
/**
 * Import the built package the way a consumer does and assert core behavior.
 *
 * This runs with plain `node` and no dependencies, so CI can execute it on every
 * Node version the package claims to support. The pinned pnpm requires a newer
 * Node than the package does, which means the vitest suite cannot run on the
 * lowest supported version.
 *
 * Usage: node scripts/smoke.mjs
 */

import assert from 'node:assert/strict'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = dirname(dirname(fileURLToPath(import.meta.url)))
const entry = join(root, 'packages', 'js', 'dist', 'index.js')

const rut = await import(entry)

const value = rut.parse('21.272.789-K')

assert.equal(value, '21272789K')
assert.equal(rut.format(value), '21.272.789-K')
assert.equal(rut.format(value, { style: 'plain' }), '21272789-K')
assert.equal(rut.format(value, { verifierCase: 'lower' }), '21.272.789-k')
assert.equal(rut.format('  9068826k  '), '9.068.826-K')
assert.equal(rut.is('21272789k'), true)
assert.equal(rut.is('21.272789-K'), false)
assert.equal(rut.compare('21.272.789-K', '21272789K'), true)
assert.equal(rut.clean('0021.272.789-k'), '21272789K')
assert.equal(rut.getVerifier('21.272.789'), 'K')
assert.equal(rut.getVerifier('3,966,753'), null)

assert.deepEqual(rut.formatPartial('17353'), {
  kind: 'formatted',
  value: '1.735-3',
})
assert.deepEqual(rut.formatPartial('prefix21272789K'), {
  kind: 'unsupported',
  value: 'prefix21272789K',
})

const failure = rut.safeParse('21.272.789-0', 'en')

assert.equal(failure.success, false)
assert.equal(failure.issue.kind, 'verifier')
assert.equal(failure.issue.expected, 'K')
assert.equal(
  failure.issue.message,
  'RUT verifier does not match. Replace "0" with "K".',
)

const short = rut.safeParse('1-9')

assert.equal(short.issue.kind, 'length')
assert.equal(short.issue.bodyLength, 1)

assert.throws(() => rut.format('21.272789-K'), rut.RutError)

console.log(`smoke checks passed on node ${process.version}`)
