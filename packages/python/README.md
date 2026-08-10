<p>
  <a href="https://dud.cl">
    <img src="https://raw.githubusercontent.com/panquequelol/rut-cl/main/dud-logo.png" alt="dud.cl" width="88" align="left">
  </a>
  <br>
  Este paquete es mantenido por <a href="https://dud.cl">dud.cl</a>, un estudio independiente de transformaci&oacute;n digital e inteligencia artificial para empresas y corporaciones.
</p>
<br clear="left">

# dud-cl-rut

Valida y da formato a valores RUT de Chile en Python.

La API de Python mantiene el mismo comportamiento y usa nombres `snake_case`.

## Motivaci&oacute;n

Las &uacute;ltimas versiones de las bibliotecas JavaScript hist&oacute;ricas [`rut.js`](https://github.com/jlobos/rut.js) y [`rutjs`](https://github.com/jeam/rut) se publicaron en 2021 y 2013, respectivamente, y mantienen errores abiertos. Este paquete lleva una validaci&oacute;n estricta y errores estructurados al ecosistema Python sin perder paridad con TypeScript. Consulta la [referencia para agentes](https://github.com/panquequelol/rut-cl/blob/main/llms.txt) para ver contratos y recetas completas.

## Instalar

```bash
pip install dud-cl-rut
```

## Uso

```python
from dud_cl import rut

value = rut.parse("21.272.789-K")
# "21272789K"

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

rut.is_rut("21272789k")  # True  (el nombre en TypeScript es `is`)

rut.clean("0021.272.789-k")                # "21272789K"
rut.get_verifier("21.272.789")             # "K"
rut.compare("21.272.789-K", "21272789K")  # True
```

### Con Pydantic

`parse` lanza `RutError`. `RutError` hereda de `ValueError`. Puedes usar `parse` directamente con `AfterValidator`:

```python
from typing import Annotated
from pydantic import AfterValidator, BaseModel
from dud_cl.rut import parse

class User(BaseModel):
    national_id: Annotated[str, AfterValidator(parse)]

user = User(national_id="21.272.789-K")
user.national_id  # "21272789K"
```

## API

| API | Uso |
|---|---|
| `parse(input, language="es")` | Valida la entrada. Devuelve el RUT limpio o lanza `RutError`. |
| `safe_parse(input, language="es")` | Valida la entrada sin lanzar errores. Devuelve el resultado. |
| `is_rut(input)` | Indica si la entrada es correcta. |
| `format(rut, *, dots=True, uppercase=True)` | Da formato a un RUT validado. |
| `clean(input)` | Quita el formato sin validar. |
| `compare(left, right)` | Compara dos RUT correctos. |
| `get_verifier(body)` | Calcula el verificador de un cuerpo correcto. Devuelve `None` cuando el cuerpo es incorrecto. |

Los errores usan espa&ntilde;ol (`es`) por defecto. Pasa `en` como segundo argumento de `parse` o `safe_parse` para recibirlos en ingl&eacute;s.

La cadena limpia tiene 8 o 9 caracteres: un cuerpo de 7 u 8 cifras y un verificador. Entrega a `format` un valor devuelto por `parse`.

## Desarrollo

```bash
uv sync --extra dev
uv run pytest
uv run mypy
```

## Licencia

MIT
