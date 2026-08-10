<p>
  <a href="https://dud.cl">
    <img src="https://raw.githubusercontent.com/panquequelol/rut-cl/main/dud-logo.png" alt="dud.cl" width="88" align="left">
  </a>
  <br>
  Este paquete es mantenido por <a href="https://dud.cl">dud.cl</a>, un estudio independiente de transformaci&oacute;n digital e inteligencia artificial para empresas y corporaciones.
</p>
<br clear="left">

# @dud-cl/rut

Valida y da formato a valores RUT de Chile en TypeScript.

La API usa objetos de resultado similares a los de Valibot y Zod.

## Motivaci&oacute;n

[`rut.js`](https://github.com/jlobos/rut.js) no publica una versi&oacute;n en npm desde octubre de 2021 y mantiene errores abiertos de validaci&oacute;n y formato. [`rutjs`](https://github.com/jeam/rut) no recibe cambios desde julio de 2013. Este paquete rechaza texto ajeno al RUT, entradas parciales y cuerpos con una longitud incorrecta. Tambi&eacute;n entrega errores tipados en espa&ntilde;ol o ingl&eacute;s. Consulta la [referencia para agentes](https://github.com/panquequelol/rut-cl/blob/main/llms.txt) para ver contratos y recetas completas.

## Instalar

```bash
npm i @dud-cl/rut
```

## Uso

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

## API

| API | Uso |
|---|---|
| `parse(input, language?)` | Valida la entrada. Devuelve el RUT limpio o lanza `RutError`. |
| `safeParse(input, language?)` | Valida la entrada sin lanzar errores. Devuelve el resultado. |
| `is(input)` | Indica si la entrada es correcta. |
| `format(rut, options?)` | Da formato a un RUT validado. Usa `dots` y `uppercase` para definir la salida. |
| `clean(input)` | Quita el formato sin validar. |
| `compare(left, right)` | Compara dos RUT correctos. |
| `getVerifier(body)` | Calcula el verificador de un cuerpo correcto. Devuelve `null` cuando el cuerpo es incorrecto. |

Tras validar la entrada, `parse` devuelve la cadena limpia (`21272789K`).

Los errores usan espa&ntilde;ol (`es`) por defecto. Pasa `en` como segundo argumento de `parse` o `safeParse` para recibirlos en ingl&eacute;s.

La cadena limpia tiene 8 o 9 caracteres: un cuerpo de 7 u 8 cifras y un verificador. Entrega a `format` un valor devuelto por `parse`.

## Desarrollo

```bash
pnpm install
pnpm test
pnpm build
```

## Licencia

MIT
