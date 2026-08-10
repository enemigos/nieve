# RUT

Valida y da formato a valores RUT de Chile en TypeScript y Python.

La API de TypeScript usa objetos de resultado similares a los de Valibot y Zod.

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

const schema = z.object({
  nationalId: z.string().refine(rut.is, { message: 'RUT incorrecto' }),
})
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
rut.safe_parse("21.272.789-0", "en")  # language="en"
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
| `clean` | `clean` | Quita el formato sin validar. |
| `compare` | `compare` | Compara dos RUT correctos. |
| `getVerifier` | `get_verifier` | Calcula el verificador de un cuerpo correcto. Devuelve `null` o `None` cuando el cuerpo es incorrecto. |

Tras validar la entrada, `parse` devuelve la cadena limpia (`21272789K`).

Los errores usan espa&ntilde;ol (`es`) por defecto. Pasa `en` como segundo argumento de `parse`, `safeParse` o `safe_parse` para recibirlos en ingl&eacute;s.

La cadena limpia tiene 8 o 9 caracteres: un cuerpo de 7 u 8 cifras y un verificador. Entrega a `format` un valor devuelto por `parse`.

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
