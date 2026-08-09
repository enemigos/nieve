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

const value = rut.parse('18.972.631-7')
// RUT limpio con marca de tipo: '189726317'

rut.format(value)                  // '18.972.631-7'
rut.format(value, { dots: false }) // '18972631-7'

const kValue = rut.parse('9.068.826-k')
rut.format(kValue, { uppercase: false }) // '9.068.826-k'

rut.safeParse('18.972.631-0')
// {
//   success: false,
//   issue: {
//     kind: 'check_digit',
//     message: 'Invalid check digit: expected 7, received 0',
//     input: '18.972.631-0',
//     expected: '7',
//     received: '0',
//   },
// }

rut.is('9068826k') // true

rut.clean('0018.972.631-7')                 // '189726317'
rut.getVerifier('9.068.826')                 // 'K'
rut.compare('18.972.631-7', '189726317')     // true
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

value = rut.parse("18.972.631-7")  # "189726317"

rut.format(value)              # "18.972.631-7"
rut.format(value, dots=False)  # "18972631-7"

k_value = rut.parse("9.068.826-k")
rut.format(k_value, uppercase=False)  # "9.068.826-k"

rut.safe_parse("18.972.631-0")
rut.is_rut("9068826k")         # True (`is` es una palabra reservada de Python)

rut.clean("0018.972.631-7")                  # "189726317"
rut.get_verifier("9.068.826")                 # "K"
rut.compare("18.972.631-7", "189726317")     # True
```

### Con Pydantic

```python
from typing import Annotated
from pydantic import AfterValidator, BaseModel
from dud_cl.rut import parse

class User(BaseModel):
    national_id: Annotated[str, AfterValidator(parse)]

user = User(national_id="18.972.631-7")
user.national_id  # "189726317"
```

`RutError` hereda de `ValueError`, por lo que Pydantic procesa los errores de `parse`.

## API

| TS | Python | Uso |
|---|---|---|
| `parse` | `parse` | Valida la entrada. Devuelve el RUT limpio o informa un error. |
| `safeParse` | `safe_parse` | Valida la entrada sin lanzar errores. Devuelve el resultado. |
| `is` | `is_rut` | Indica si la entrada es correcta. |
| `format` | `format` | Da formato a un RUT validado. Usa `dots` y `uppercase` para definir la salida. |
| `clean` | `clean` | Quita el formato sin validar. |
| `compare` | `compare` | Compara dos RUT correctos. |
| `getVerifier` | `get_verifier` | Calcula el verificador de un cuerpo correcto. Devuelve `null` o `None` cuando el cuerpo es incorrecto. |

Tras validar la entrada, `parse` devuelve la cadena limpia (`189726317`).

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
