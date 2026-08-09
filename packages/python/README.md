# dud-cl-rut

Valida y da formato a valores RUT de Chile en Python.

La API de Python mantiene el mismo comportamiento y usa nombres `snake_case`.

## Instalar

```bash
pip install dud-cl-rut
```

## Uso

```python
from dud_cl import rut

value = rut.parse("18.972.631-7")
# "189726317"

rut.format(value)                 # "18.972.631-7"
rut.format(value, dots=False)     # "18972631-7"

k_value = rut.parse("9.068.826-k")
rut.format(k_value, uppercase=False)  # "9.068.826-k"

rut.safe_parse("18.972.631-0")
# SafeParseFailure(success=False, issue=CheckDigitIssue(...))

rut.is_rut("9068826k")  # True  (el nombre en TypeScript es `is`)

rut.clean("0018.972.631-7")                  # "189726317"
rut.get_verifier("9.068.826")                 # "K"
rut.compare("18.972.631-7", "189726317")     # True
```

### Con Pydantic

`parse` lanza `RutError`. `RutError` hereda de `ValueError`. Puedes usar `parse` directamente con `AfterValidator`:

```python
from typing import Annotated
from pydantic import AfterValidator, BaseModel
from dud_cl.rut import parse

class User(BaseModel):
    national_id: Annotated[str, AfterValidator(parse)]

user = User(national_id="18.972.631-7")
user.national_id  # "189726317"
```

## API

| API | Uso |
|---|---|
| `parse(input)` | Valida la entrada. Devuelve el RUT limpio o lanza `RutError`. |
| `safe_parse(input)` | Valida la entrada sin lanzar errores. Devuelve el resultado. |
| `is_rut(input)` | Indica si la entrada es correcta. |
| `format(rut, *, dots=True, uppercase=True)` | Da formato a un RUT validado. |
| `clean(input)` | Quita el formato sin validar. |
| `compare(left, right)` | Compara dos RUT correctos. |
| `get_verifier(body)` | Calcula el verificador de un cuerpo correcto. Devuelve `None` cuando el cuerpo es incorrecto. |

La cadena limpia tiene 8 o 9 caracteres: un cuerpo de 7 u 8 cifras y un verificador. Entrega a `format` un valor devuelto por `parse`.

## Desarrollo

```bash
uv sync --extra dev
uv run pytest
uv run mypy
```

## Licencia

MIT
