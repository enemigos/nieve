declare const rutBrand: unique symbol

/** Canonical cleaned RUT string, e.g. `"21272789K"`. */
export type Rut = string & { readonly [rutBrand]: true }

export type Language = 'es' | 'en'

export type RutIssue =
  | {
      readonly kind: 'type'
      readonly message: string
      readonly input: unknown
    }
  | {
      readonly kind: 'format'
      readonly message: string
      readonly input: string
    }
  | {
      readonly kind: 'length'
      readonly message: string
      readonly input: string
    }
  | {
      readonly kind: 'verifier'
      readonly message: string
      readonly input: string
      readonly expected: string
      readonly received: string
    }

export type SafeParseResult =
  | { readonly success: true; readonly output: Rut }
  | {
      readonly success: false
      readonly issue: RutIssue
    }

export type FormatOptions = {
  readonly dots?: boolean
  readonly uppercase?: boolean
}
