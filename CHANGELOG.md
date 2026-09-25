# Changelog

`nieve` ships to npm and PyPI from this repository. Both packages share this
changelog and are released with the same version number. CI fails when the two
versions differ.

## 1.0.0

First release.

### Parser contract

- Input must be a string. Anything else reports the `type` issue kind.
- The body contains 7 or 8 digits and does not start with zero.
- Dots are either all present in groups of three or entirely absent. Mixed
  forms such as `21.272789-K` are rejected.
- The hyphen before the verifier is optional, and `k` is accepted in either
  case.
- Surrounding whitespace is ignored, including the no-break space common in
  pasted values. Whitespace inside the value is rejected. `issue.input` keeps
  the original, untrimmed input.
- Each issue kind means one thing: `format` for bad syntax, `length` for a well
  formed token whose body is not 7 or 8 digits, `verifier` for a modulo-11
  mismatch. `length` carries `bodyLength` (`body_length` in Python), and
  `verifier` carries `expected` and `received`.
- The 7-digit floor rejects modulo-11 false positives in short input such as
  `17353`. It also rejects test values such as `1-9`, which report `length`
  with the actual body size so an application can detect the case.

### API

- `format` validates before formatting and raises `RutError` for anything that
  is not a RUT, so it never returns a formatted string that is not a real RUT.
  It accepts any input `parse` accepts, which makes a canonical value read back
  from storage usable without a cast to `Rut`.
- `format` options are named values rather than booleans: `style` is `dotted`
  or `plain`, and `verifierCase` is `upper` or `lower`. Python uses `style` and
  `verifier_case`.
- `formatPartial` (TypeScript only) returns `{ kind: 'formatted', value }` or
  `{ kind: 'unsupported', value }`, so a caller can see when the input was left
  untouched instead of receiving a bare string.
- `clean` is a lossy normalizer and its output is documented as untrusted.
- `compare` returns `false` when either input is invalid, so it cannot
  distinguish "different" from "invalid".
- `getVerifier` accepts the same body syntax as `parse`, with an optional
  trailing hyphen. Commas are not separators.
- Both packages export every issue type, `RutIssueKind`, the result variants,
  and the option unions, so callers can narrow without restating string unions.

### Testing

- `fixtures/conformance.json` holds 435 cases generated from the Python
  package. Both test suites assert against it, so a behavior difference between
  the two implementations fails CI.
- Localized messages, `compare`, `format` options, and `getVerifier` results
  live in shared fixtures rather than being duplicated in each suite, which is
  where message drift between the two languages would otherwise hide.
- CI runs Python 3.10 through 3.13, and imports the built package with plain
  `node` on 20, 22, and 24 to check the supported runtimes against the artifact
  a consumer installs.
- Ruff lint and format checks cover the Python package and the maintenance
  scripts.
