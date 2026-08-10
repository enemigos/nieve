<p>
  <a href="https://dud.cl">
    <img src="https://raw.githubusercontent.com/panquequelol/rut-cl/main/dud-logo.png" alt="dud.cl" width="88" align="left">
  </a>
  <br>
  Este paquete lo mantiene <a href="https://dud.cl">dud.cl</a>, un estudio independiente que trabaja con empresas en transformaci&oacute;n digital e inteligencia artificial.
</p>
<br clear="left">

# RUT

Una librer&iacute;a para validar y formatear RUT chilenos en TypeScript y Python.

## Por qu&eacute; existe

Necesit&aacute;bamos validar RUT en TypeScript y Python sin mantener dos implementaciones distintas. Las alternativas m&aacute;s usadas llevan a&ntilde;os sin publicar versiones (`rut.js` desde 2021 y `rutjs` desde 2013) y todav&iacute;a tienen bugs abiertos. Por eso hicimos una implementaci&oacute;n estricta y compartimos los mismos casos de prueba entre ambos lenguajes.

Los contratos y recetas est&aacute;n en la [referencia para LLMs](./llms.txt). La [referencia para humanos](https://dud.cl/rut/) est&aacute; en dud.cl.

## Instalar

```bash
npm i @dud-cl/rut
pip install dud-cl-rut
```

## TypeScript

```ts
import * as rut from '@dud-cl/rut'

const value = rut.parse('21.272.789-K')
// RUT limpio con marca de tipo: '21272789K'

rut.format(value)                              // '21.272.789-K'
rut.format(value, { dots: false })             // '21272789-K'
rut.format(value, { uppercase: false })        // '21.272.789-k'
rut.formatPartial('17353')                     // '1.735-3' (entrada parcial)

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

rut.clean('0021.272.789-k')                 // '21272789K'
rut.getVerifier('21.272.789')               // 'K'
rut.compare('21.272.789-K', '21272789K')    // true
```

### Con Zod

```ts
import * as z from 'zod'
import * as rut from '@dud-cl/rut'

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

Formatea mientras la persona escribe y guarda el resultado completo para no perder `kind`, `message`, `expected` ni `received`.

**Advertencia:** `formatPartial` puede convertir una entrada cruda rechazada por el parser estricto en una entrada aceptable al normalizar puntos, guiones y espacios. Nunca confíes en su salida sin validarla. Si importa la sintaxis original, usa `safeParse(raw)` y formatea el `Rut` validado con `format`. Si aceptas la normalización, usa `safeParse(formatPartial(raw))` antes de guardar el valor.

```tsx
import { useState } from 'react'
import * as rut from '@dud-cl/rut'

const [input, setInput] = useState('')
const [validation, setValidation] = useState<rut.SafeParseResult | null>(null)

function changeInput(raw: string) {
  const next = rut.formatPartial(raw)
  setInput(next)
  setValidation(next ? rut.safeParse(next) : null)
}

const issue = validation?.success === false ? validation.issue : null

// <input value={input} onChange={(event) => changeInput(event.target.value)} />
// {issue && <p>{issue.message}</p>}
```

### Con Valibot

```ts
import * as v from 'valibot'
import * as rut from '@dud-cl/rut'

const schema = v.object({
  nationalId: v.pipe(v.string(), v.check(rut.is, 'RUT incorrecto')),
})
```

## Python

```python
from dud_cl import rut

value = rut.parse("21.272.789-K")  # "21272789K"

rut.format(value)                    # "21.272.789-K"
rut.format(value, dots=False)        # "21272789-K"
rut.format(value, uppercase=False)   # "21.272.789-k"

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

rut.clean("0021.272.789-k")                # "21272789K"
rut.get_verifier("21.272.789")             # "K"
rut.compare("21.272.789-K", "21272789K")  # True
```

### Con Pydantic

```python
from typing import Annotated
from pydantic import AfterValidator, BaseModel
from dud_cl.rut import parse

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
| `format` | `format` | Da formato a un RUT validado. Usa `dots` y `uppercase` para definir la salida. |
| `formatPartial` | - | Da formato visual a una entrada parcial sin validarla. |
| `clean` | `clean` | Quita el formato sin validar. |
| `compare` | `compare` | Compara dos RUT correctos. |
| `getVerifier` | `get_verifier` | Calcula el verificador de un cuerpo correcto. Devuelve `null` o `None` cuando el cuerpo es incorrecto. |

Tras validar la entrada, `parse` devuelve la cadena limpia (`21272789K`).

Los errores usan espa&ntilde;ol (`es`) por defecto. Pasa `en` como segundo argumento de `parse`, `safeParse` o `safe_parse` para recibirlos en ingl&eacute;s.

La cadena limpia tiene 8 o 9 caracteres: un cuerpo de 7 u 8 cifras y un verificador. Entrega a `format` un valor devuelto por `parse`. Usa `formatPartial` solo para presentar una entrada editable. Su salida no es confiable: puede normalizar una sintaxis cruda inválida hasta volverla aceptable. Valida la entrada cruda si importa su sintaxis exacta o valida la salida antes de aceptarla. El texto incompatible o demasiado largo queda sin cambios para evitar extraer un RUT desde otro contenido.

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
```

## Licencia

MIT
