---
name: propuesta-producto
description: Diseña la pieza de producto del rally (app, web-app, landing o pieza 3D) paso a paso con compuertas de aprobación del humano. Úsala después de la identidad aprobada, cuando haya que decidir qué pantallas, qué módulos entran y cuáles se descartan antes de escribir código.
---

# El Maquetador de la 14 — Propuesta de producto

Nada se construye de un tiro. El diseño se decide en tramos cortos, y cada tramo necesita
el visto bueno del humano antes de abrir el siguiente. Una pieza que sale de un solo prompt
sale sin decisiones: nadie eligió qué entra, qué se descarta ni por qué.

Entradas: `brief.json` (reto, solución, público, 3 cifras con fuente) y la identidad
aprobada (`brand/palette.json` con `_status: "aprobada"`). Si alguna falta, esta skill se
detiene y lo dice. La paleta no se inventa aquí: eso es `propuesta-identidad`.

Salida: el bloque `producto` de `brief.json` (una sola fuente de verdad, no un archivo
nuevo: `design/plan_producto.md` no existe ni se crea). La ficha legible para el humano
sale de ahí con `python scripts/verificar_producto.py`.

## Leyes del tramo

1. **Una pieza, un protagonista.** El objeto que encarna el producto (un teléfono con la
   app, una escena, un visor). Si no se puede nombrar en una frase, no hay plan.
2. **Tres pantallas como techo.** Cuatro pantallas no caben en 120 s de video ni en una
   captura legible.
3. **Módulos con nombre y motivo.** Core (sin esto no hay producto), opcional (si sobra
   tiempo) y descartable (con el motivo escrito). Lo que se descarta queda registrado: así
   el jurado ve criterio, no huecos.
4. **Maqueta antes de código.** Primero un HTML estático aprobado; después la pieza real
   consume tokens. Cambiar la maqueta después de programar cuesta el triple.
5. **Preguntas con tope.** Máximo 10, cada una con opciones y una recomendada marcada.
6. **Recorte antes que sobrecarga.** Si el cronómetro (`control-tiempo-entrega`) marca poco
   tiempo, se caen primero los descartables declarados, no la calidad de lo que queda.
7. **Nada de datos inventados.** Las cifras salen de `research/claims.json`; lo simulado se
   marca `[SIMULADO]` fuera del área de captura.

## Compuertas (no se abre la siguiente sin cerrar la anterior)

### G0 · Entrada
Lee `brief.json` y `brand/palette.json`. Faltantes → detente y pide el dato, con la lista
exacta de campos vacíos. No propongas nada.

### G1 · Alcance (qué entra y qué no)
Pregunta como máximo 10 cosas, en una sola tanda, cada una con opciones y la recomendada
primero. Como mínimo: tipo de pieza, plataforma, protagonista y qué dos módulos son core.

Propón el corte:

| Módulo | Clase | Por qué |
|---|---|---|
| pantalla principal con la acción central | core | es el producto |
| historial o segundo estado | opcional | suma si hay tiempo |
| ajustes, onboarding, tour | descartable | no se juzga en 120 s |

Sirve la ficha al buzón (`--tab webdemo --slot main`) con el corte y las preguntas.
El humano responde **Apruebo** / **Cambia** / **Simplifica** / **Decide tú**.

### G2 · Maqueta
Un solo HTML estático, sin build, con la identidad aprobada y datos `[SIMULADO]`:
protagonista dominante en la primera pantalla, ≤3 pantallas, estados visibles, sin hex
literal, sin familias del motor. Se sirve al buzón y se aprueba mirándola (captura real en
`audit/`). Sin captura no hay aprobación.

```bash
python scripts/bajar_fuentes.py                         # woff2 locales, una vez
python scripts/gen_mockup.py                            # bisel + pantalla + tablero
```
`gen_mockup.py` exige `project_name` y `_status: aprobada`; escribe `design/mockup.html` y
`design/mockup.css`. La escena no vive en `site/`: ahí duplicaría tokens.

### G3 · Sistema
Declara en `brand/tokens.css` y en el plan lo que la pieza usa: escala de espacio, radios,
sombras, tabla de movimiento (qué, duración, tipo, salida `prefers-reduced-motion`),
estados (`hover`, `focus`, `disabled`, `vacio`, `error`) e iconografía (trazo uniforme).
Si un valor no está declarado, no se usa.

### G4 · Pieza
Construye consumiendo solo `var(--…)`, con las pantallas del plan aprobado. Cualquier
pantalla nueva exige volver a G1.

### G5 · Verificación
```bash
python scripts/verificar_producto.py      # plan completo y coherente
python scripts/probar_responsive.py       # 390 / 768 / 1440, sin scroll horizontal
python scripts/verificar_identidad.py     # tokens, contraste, cero hex
python arsenal.py check-todo              # incluye diseño y producto (paso 4)
```
Las tres en verde y una captura por pantalla en `audit/`. Después, `publicar-sitio`.

## El plan (`brief.json` → `producto`)

```json
{
  "producto": {
    "piece_type": "app-movil",
    "plataforma": "Android 12+, uso a una mano",
    "protagonista": "el objeto único que encarna el producto",
    "metafora": "qué se ve antes de leer una palabra",
    "pantallas": [
      {"id": "hoy", "muestra": "la acción central resuelta",
       "accion_simulada": "lo que el visitante puede tocar", "primero": true}
    ],
    "estados": ["hover", "focus", "disabled", "vacio", "error"],
    "motion": {"que": "una sola entrada", "duracion": "160ms", "tipo": "ease-out",
               "reduced": "sin desplazamiento, solo cambio de opacidad"},
    "iconografia": "trazo uniforme 1.5px, sin relleno",
    "data_source": "research/claims.json + site/mock_data.json [SIMULADO]",
    "marco": "bisel de teléfono 390x844",
    "tablero": "paleta, tipografía y dos principios",
    "modulos": {
      "core": ["..."],
      "opcional": ["..."],
      "descartable": [{"nombre": "...", "motivo": "..."}]
    }
  }
}
```

`scripts/verificar_producto.py` exige cada campo y falla con: sin protagonista, más de 3
pantallas, motion sin salida `reduced`, sin `data_source`, descartable sin motivo. Con
`brief.json` vacío el estado es válido: imprime PENDIENTE y no escribe nada.

## Cómo se ve un tramo cerrado

Por cada compuerta: qué se decidió, qué se descartó y con qué motivo, el archivo que lo
prueba y la captura. Un tramo sin decisión no se cierra.
