# poder

Una librer&iacute;a para validar y formatear RUT chilenos en TypeScript y Python.

## Por qu&eacute; existe

Necesit&aacute;bamos validar RUT en TypeScript y Python sin mantener dos implementaciones distintas. Las alternativas m&aacute;s usadas llevan a&ntilde;os sin publicar versiones (`rut.js` desde 2021 y `rutjs` desde 2013) y todav&iacute;a tienen bugs abiertos. Por eso hicimos una implementaci&oacute;n estricta y compartimos los mismos casos de prueba entre ambos lenguajes.

Las dos implementaciones se comparan entre s&iacute;: `fixtures/conformance.json` tiene 435 casos generados desde el paquete Python y las dos suites los verifican, as&iacute; que cualquier diferencia de comportamiento rompe CI. Ambos paquetes se publican con la misma versi&oacute;n.

Los contratos y recetas est&aacute;n en la [referencia para LLMs](./llms.txt). Los cambios entre versiones est&aacute;n en el [changelog](./CHANGELOG.md).

## Instalar

```bash
npm i poder
pip install poder
```

`poder` reemplaza a `@dud-cl/rut` en npm y a `dud-cl-rut` en PyPI. Esos paquetes quedaron obsoletos y no reciben m&aacute;s versiones. La [gu&iacute;a de migraci&oacute;n](./CHANGELOG.md) est&aacute; en el changelog.

## TypeScript

Los ejemplos importan el paquete con el alias `rut` para que cada llamada se lea sola.

```ts
import * as rut from 'poder'

const value = rut.parse('21.272.789-K')
// RUT limpio con marca de tipo: '21272789K'

rut.format(value)                                 // '21.272.789-K'
rut.format(value, { style: 'plain' })             // '21272789-K'
rut.format(value, { verifierCase: 'lower' })      // '21.272.789-k'

rut.safeParse('21.272.789-0')
// {
//   success: false,
//   issue: {
//     kind: 'verifier',
//     message: 'El verificador no coincide. Reemplaza "0" por "K".',
//     input: '21.272.789-0',
//     expected: 'K',
//     received: '0',
//   },
// }

rut.safeParse('21.272.789-0', 'en')
// issue.message: 'RUT verifier does not match. Replace "0" with "K".'

rut.is('21272789k') // true

rut.clean('0021.272.789-k')                 // '21272789K' (no valida)
rut.getVerifier('21.272.789')               // 'K'
rut.compare('21.272.789-K', '21272789K')    // true
```

### Valores guardados

`format` acepta cualquier entrada que `parse` acepte y lanza `RutError` si no es un RUT, as&iacute; que un valor que vuelve de la base de datos se formatea sin castear a `Rut`:

```ts
const stored: string = '21272789K'

rut.format(stored) // '21.272.789-K'
```

### Con Zod

```ts
import * as z from 'zod'
import * as rut from 'poder'

const rutSchema = z.unknown().transform((input, context) => {
  const result = rut.safeParse(input)

  if (!result.success) {
    context.addIssue({
      code: 'custom',
      message: result.issue.message,
      params: { rutIssue: result.issue },
    })
    return z.NEVER
  }

  return result.output
})

const schema = z.object({
  nationalId: rutSchema,
})
```

El mensaje de Zod conserva `RutIssue.message`, el dato correcto queda como `Rut`, y el issue completo queda en `params.rutIssue`. Algunos resolvers de formularios descartan `params`; si tu interfaz depende de `kind`, guarda el `RutIssue` devuelto por `safeParse` en el estado del formulario.

### Con React

`formatPartial` da formato mientras la persona escribe. Devuelve `kind: 'formatted'` con el valor normalizado, o `kind: 'unsupported'` con la entrada intacta cuando no puede llegar a ser un RUT escribiendo m&aacute;s caracteres.

**Advertencia:** `formatPartial` no valida nada. Al normalizar puntos, guiones y espacios puede convertir una entrada que `parse` rechaza en una que acepta. Si importa la sintaxis original, usa `safeParse(raw)` y formatea el `Rut` validado con `format`. Si aceptas la normalizaci&oacute;n, valida el valor antes de guardarlo.

```tsx
import { useState } from 'react'
import * as rut from 'poder'

const [input, setInput] = useState('')
const [validation, setValidation] = useState<rut.SafeParseResult | null>(null)

function changeInput(raw: string) {
  const partial = rut.formatPartial(raw)

  if (partial.kind === 'unsupported') return

  setInput(partial.value)
  setValidation(partial.value ? rut.safeParse(partial.value) : null)
}

const issue = validation?.success === false ? validation.issue : null

// <input value={input} onChange={(event) => changeInput(event.target.value)} />
// {issue && <p>{issue.message}</p>}
```

### Con Valibot

```ts
import * as v from 'valibot'
import * as rut from 'poder'

const schema = v.object({
  nationalId: v.pipe(v.string(), v.check(rut.is, 'RUT incorrecto')),
})
```

## Python

Los ejemplos importan el paquete con el alias `rut` para que cada llamada se lea sola.

```python
import poder as rut

value = rut.parse("21.272.789-K")  # "21272789K"

rut.format(value)                          # "21.272.789-K"
rut.format(value, style="plain")           # "21272789-K"
rut.format(value, verifier_case="lower")   # "21.272.789-k"

rut.safe_parse("21.272.789-0")
# SafeParseFailure(
#     success=False,
#     issue=VerifierIssue(
#         kind="verifier",
#         message='El verificador no coincide. Reemplaza "0" por "K".',
#         input="21.272.789-0",
#         expected="K",
#         received="0",
#     ),
# )

rut.safe_parse("21.272.789-0", "en")
# issue.message: 'RUT verifier does not match. Replace "0" with "K".'

rut.is_rut("21272789k")  # True (`is` es una palabra reservada de Python)

rut.clean("0021.272.789-k")                # "21272789K" (no valida)
rut.get_verifier("21.272.789")             # "K"
rut.compare("21.272.789-K", "21272789K")   # True
```

### Con Pydantic

```python
from typing import Annotated
from pydantic import AfterValidator, BaseModel
from poder import parse

class User(BaseModel):
    national_id: Annotated[str, AfterValidator(parse)]

user = User(national_id="21.272.789-K")
user.national_id  # "21272789K"
```

`RutError` hereda de `ValueError`, por lo que Pydantic procesa los errores de `parse`.

## API

| TS | Python | Uso |
|---|---|---|
| `parse` | `parse` | Valida la entrada. Devuelve el RUT limpio o informa un error. Acepta `es` o `en`. |
| `safeParse` | `safe_parse` | Valida la entrada sin lanzar errores. Devuelve el resultado. Acepta `es` o `en`. |
| `is` | `is_rut` | Indica si la entrada es correcta. |
| `format` | `format` | Da formato a un RUT. Valida primero y lanza `RutError` si la entrada no es un RUT. |
| `formatPartial` | - | Da formato visual a una entrada parcial sin validarla. |
| `clean` | `clean` | Quita el formato sin validar. Su salida no es confiable. |
| `compare` | `compare` | Indica si dos entradas son el mismo RUT. |
| `getVerifier` | `get_verifier` | Calcula el verificador de un cuerpo correcto. Devuelve `null` o `None` cuando el cuerpo es incorrecto. |

Tras validar la entrada, `parse` devuelve la cadena limpia (`21272789K`).

Los errores usan espa&ntilde;ol (`es`) por defecto. Pasa `en` como segundo argumento de `parse`, `safeParse` o `safe_parse` para recibirlos en ingl&eacute;s.

### Qu&eacute; acepta el parser

```text
21.272.789-K
21.272.789K
21272789-K
21272789K
21.272.789-k
```

- La entrada debe ser una cadena de texto.
- Se ignoran los espacios al inicio y al final. Los espacios interiores no.
- El cuerpo tiene 7 u 8 d&iacute;gitos y no empieza con cero.
- Los puntos est&aacute;n todos o no est&aacute;n: `21.272789-K` se rechaza.
- El guion antes del verificador es opcional.
- La `k` se acepta en min&uacute;scula o may&uacute;scula.

El l&iacute;mite de 7 d&iacute;gitos es deliberado: descarta falsos positivos de m&oacute;dulo 11 en entradas cortas como `17353`. Tambi&eacute;n rechaza RUT reales muy bajos y valores de prueba como `1-9`, que reportan `length`.

### Tipos de error

`safeParse` devuelve un solo issue y cada `kind` significa una cosa:

| `kind` | Cu&aacute;ndo |
|---|---|
| `type` | La entrada no es una cadena de texto. |
| `format` | La sintaxis no es de un RUT: caracteres ajenos, separadores mezclados o mal puestos, cero inicial. |
| `length` | La sintaxis es correcta pero el cuerpo no tiene 7 u 8 d&iacute;gitos. Incluye `bodyLength` (`body_length` en Python). |
| `verifier` | El tama&ntilde;o es correcto pero el verificador no coincide. Incluye `expected` y `received`. |

`compare` devuelve `false` cuando alguna de las dos entradas es incorrecta, as&iacute; que no distingue "distintos" de "inv&aacute;lido". Usa `safeParse` cuando esa diferencia importe.

## Desarrollo

```bash
# TypeScript
pnpm install
pnpm test
pnpm build

# Python
cd packages/python
uv sync --extra dev
uv run pytest
uv run mypy
uv run ruff check .

# Casos compartidos y versiones
pnpm fixtures:conformance
pnpm check:versions
```

## Licencia

MIT
