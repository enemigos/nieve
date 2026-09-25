# Changelog

`@dud-cl/rut` (npm) and `dud-cl-rut` (PyPI) share this changelog and are
released with the same version number. CI fails when the two versions differ.

## 0.4.0

First release where both packages are versioned in lockstep. The previous
releases were `@dud-cl/rut@0.3.0` and `dud-cl-rut@0.2.0`.

### Breaking

- `format` options are named values instead of booleans. Use
  `{ style: 'plain' }` instead of `{ dots: false }` and
  `{ verifierCase: 'lower' }` instead of `{ uppercase: false }`. Python uses
  `style="plain"` and `verifier_case="lower"`.
- `format` now validates its argument and raises `RutError` for anything that
  is not a RUT, instead of slicing the string and returning a wrong result. It
  accepts any input `parse` accepts, so a canonical value read back from storage
  no longer needs a cast to `Rut`.
- `formatPartial` (TypeScript only) returns `{ kind: 'formatted', value }` or
  `{ kind: 'unsupported', value }` instead of a bare string, so a caller can
  see when the input was left untouched.
- Inconsistent thousands separators are rejected. `21.272789-K`,
  `21272.789-K`, and `2.1272.789-K` previously parsed as valid. Dots are now
  either all present in groups of three or entirely absent.
- `getVerifier` no longer treats commas as separators. `"3,966,753"` returns
  `null`. It accepts the same body syntax as `parse`, with an optional trailing
  hyphen.
- Issue kinds now mean one thing each. `format` reports bad syntax, `length`
  reports a well formed token whose body is not 7 or 8 digits, and `verifier`
  reports a modulo-11 mismatch. Inputs such as `"1"` and `"0"` previously
  reported `format` while `"17"` reported `length`.

### Added

- `safeParse` and `parse` ignore surrounding whitespace, including the no-break
  space common in pasted values. Whitespace inside the value is still rejected.
  `issue.input` keeps the original, untrimmed input.
- The `length` issue carries `bodyLength` (`body_length` in Python).
- TypeScript exports `RutIssueKind`, `TypeIssue`, `FormatIssue`, `LengthIssue`,
  `VerifierIssue`, `SafeParseSuccess`, `SafeParseFailure`, `PartialFormat`,
  `RutStyle`, and `VerifierCase`.
- Python exports the same set through `dud_cl.rut`: `RutIssueKind`, the four
  issue dataclasses, `SafeParseSuccess`, `SafeParseFailure`, `Style`, and
  `VerifierCase`. Previously only the `RutIssue` union was importable even
  though `safe_parse` returned the concrete classes.
- `fixtures/conformance.json` holds 435 cases generated from the Python
  package. Both test suites assert against it, so a behavior difference between
  the two implementations fails CI.
- Localized messages, `compare`, `format` options, and `getVerifier` results
  moved into shared fixtures. They used to be duplicated by hand in each suite,
  which is where message drift would have gone unnoticed.
- Ruff lint and format checks for the Python package.
- CI runs Node 20, 22, and 24 and Python 3.10 through 3.13, matching what the
  package metadata claims to support.
