# @dud-cl/rut

Valida y da formato a valores RUT de Chile en TypeScript.

La API usa objetos de resultado similares a los de Valibot y Zod.

## Instalar

```bash
npm i @dud-cl/rut
```

## Uso

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

## API

| API | Uso |
|---|---|
| `parse(input)` | Valida la entrada. Devuelve el RUT limpio o lanza `RutError`. |
| `safeParse(input)` | Valida la entrada sin lanzar errores. Devuelve el resultado. |
| `is(input)` | Indica si la entrada es correcta. |
| `format(rut, options?)` | Da formato a un RUT validado. Usa `dots` y `uppercase` para definir la salida. |
| `clean(input)` | Quita el formato sin validar. |
| `compare(left, right)` | Compara dos RUT correctos. |
| `getVerifier(body)` | Calcula el verificador de un cuerpo correcto. Devuelve `null` cuando el cuerpo es incorrecto. |

Tras validar la entrada, `parse` devuelve la cadena limpia (`189726317`).

La cadena limpia tiene 8 o 9 caracteres: un cuerpo de 7 u 8 cifras y un verificador. Entrega a `format` un valor devuelto por `parse`.

## Desarrollo

```bash
pnpm install
pnpm test
pnpm build
```

## Licencia

MIT
