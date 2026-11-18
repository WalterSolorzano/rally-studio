# Motor de soluciones para retos

Los retos los entrega el usuario o el comité. Este motor **no crea retos**: toma los retos
existentes y produce soluciones aplicables, sustentadas en casos ganadores, con razonamiento
explícito y un dossier listo para deliberar.

## Dos rutas, no una

| Ruta | Script | Qué produce |
|---|---|---|
| Dossier pulido (el que se entrega) | `scripts/gen_dossier.py` | PDF de 3 páginas por reto + Word editable + Excel por hoja |
| Borrador automático | `scripts/soluciones_motor.py` + `scripts/gen_soluciones_pdf.py` | tarjetas rápidas por reto para revisar antes de curar — **BORRADOR BANEADO para entrega**: su diseño no es el aprobado; entregar solo con `gen_dossier.py` |

El dossier pulido **no se escribe en el Python**: el contenido vive en un JSON y el script solo
maqueta. Cambiar texto es editar el JSON, nunca el generador.

## Comandos

```powershell
# Dossier pulido desde el contenido curado
python scripts/gen_dossier.py --json research/soluciones_actuales.json `
  --pdf docs/Dossier_Soluciones.pdf `
  --docx docs/Dossier_Soluciones.docx `
  --xlsx docs/Dossier_Soluciones.xlsx

# Solo el HTML, para revisar antes de imprimir
python scripts/gen_dossier.py --json research/soluciones_actuales.json --pdf docs/x.pdf --html-only

# Borrador automático del motor (antes de curar)
python scripts/soluciones_motor.py --todos --certamen nacional --grafo `
  --json docs/_build/soluciones.json
python scripts/gen_soluciones_pdf.py --json docs/_build/soluciones.json `
  --out docs/_build/Dossier_borrador.pdf
```

Opciones del motor: `--reto DESAFIO_01`, `--propuestas N`, `--categoria social`
(Nacional: `tecnologica|social|procesos`; Latam: `innovacion|impacto_social`).

## Qué contiene cada reto del dossier

Tres páginas, sin portada ni índice, y ninguna se parte a la mitad:

1. **La hoja del reto**: número, título, categoría en palabras, la descripción del comité en
   cuerpo de lectura, 3 ODS con la **figura oficial de la ONU** y 2 o 3 insignias que aplican.
   Nada más: la hoja se lee como una ficha, no como un formulario.
2. **Las dos soluciones**, separadas y de la misma jerarquía: **Opción 01** y **Opción 02** con
   mecanismo distinto, cada una con su «Cómo funciona» en cuatro pasos y su párrafo «En la
   práctica». Cierra la señal que se repite en los ganadores.
3. **Precedentes por mecanismo** con link de video, pitch de 60 segundos y bloque de COMENTARIOS
   con líneas regladas.

Cada solución lleva: nombre, claim, qué es, cómo funciona (4 pasos), beneficiario, componentes,
costo estimado y un párrafo **«En la práctica»** con quién la opera, quién paga y cuánto gana, de
dónde salen los insumos y qué esfuerzo exige arrancar.

`detalles` es opcional: si sus valores llegan vacíos, la sección «Detalles que suman» no se
imprime. Las métricas del prototipo y la cadena de razonamiento son material de trabajo del
equipo: **no se imprimen** en el PDF, el Word ni el Excel.

## Reglas

- **Nunca** se proponen retos nuevos ni se reescribe el enunciado del comité.
- **Nunca** se muestran estadísticas internas (saturación, score, probabilidad de victoria).
- La causa raíz **nunca** es "No documentado": se razona el mecanismo y la cifra se marca como
  estimación a validar.
- **No hay sección de "lo que el jurado va a atacar"**: no hay réplica; el riesgo se resuelve con
  una decisión de diseño dentro de la propuesta.
- Dos soluciones por reto, con mecanismo distinto y misma jerarquía visual.
- Precedentes por mecanismo, no por coincidencia del nombre del reto; siempre con link de video.
- ODS con la figura oficial (imagen), nunca un cuadrado con número.
- La solución sirve para **toda la familia del reto**, no para el ejemplo más cómodo.

El razonamiento completo (análisis sistémico, familias de mecanismos A–G, pruebas de descarte y
banderas de riesgo) vive en `skills/dossier-soluciones/SKILL.md`. Este documento solo dice cómo
ejecutarlo.

## Esquema del JSON

```json
{
  "meta": {"titulo": "...", "subtitulo": "...", "certamen": "...", "equipo": "...", "fecha": "..."},
  "retos": [{
    "id": "01", "titulo": "...", "categoria": "Impacto Social", "categoria_porque": "...",
    "descripcion": "...",
    "propuesta": {"nombre": "...", "claim": "...", "que_es": "...", "como": ["", "", "", ""],
                  "beneficiario": "...", "componentes": ["..."], "costo": "...", "metricas": ["..."]},
    "alterna":   {"...": "misma forma que propuesta"},
    "realidad": {"a": "párrafo En la práctica de la opción 01", "b": "..."},
    "detalles": [["Economía circular", "..."], ["...", "..."], ["...", "..."]],
    "insignias": [["Marco", "por qué aplica"], ["...", "..."]],
    "ods": [["ODS 12", "Producción y consumo responsables", "justificación"]],
    "cadena": {"problema": "", "causa_raiz": "", "insight": "", "solucion": "", "metrica": ""},
    "senal": "...",
    "analogias": [{"year": 2026, "equipo": "", "proyecto": "", "puesto": "",
                   "que_hicieron": "", "por_que": "", "video": "url"}],
    "pitch": "..."
  }]
}
```

Validar el JSON antes de maquetar: 2 soluciones por reto, 2 párrafos «En la práctica», 3 detalles,
2 o 3 insignias, 3 ODS con figura, 2 precedentes y un pitch.

## Salidas

- `docs/Dossier_Soluciones.pdf` — dossier pulido.
- `docs/Dossier_Soluciones.docx` — editable, con los sellos ODS insertados como imagen.
- `docs/Dossier_Soluciones.xlsx` — panel + una hoja editable por reto.
- `docs/_build/` — HTML intermedio y borradores (no se versiona).

## Fuentes de datos

| Archivo | Uso |
|---|---|
| `research/challenges.json` | Retos del usuario/comité (entrada) |
| `research/soluciones_actuales.json` | Contenido curado del dossier pulido |
| `knowledge/retos_razonamiento.json` | 20 casos ganadores con problema, causa, insight, solución y métrica |
| `research/sirli/winners.jsonl` | 5,136 podios 2017–2026 para precedentes y datos de método |
| `graphify-out/graph.json` | Evidencia del cerebro (claims, ganadores, retos) |
| `research/claims.json` | Cifras con fuente |
| `.agents/rules/rubricas-y-puntajes.md` | Puntajes por certamen |

Para añadir un caso: agrega un objeto a `casos` en `knowledge/retos_razonamiento.json`
con `temas`, `year`, `rally`, `categoria`, `equipo`, `proyecto`, `puesto`, `problema`,
`causa_raiz`, `insight`, `solucion`, `metrica`, `fuente` y `video_url`.

## Verificación

```powershell
python -m pytest tests/test_gen_dossier.py tests/test_soluciones_motor.py -q
```

Y sobre el PDF generado: 3 páginas por reto, ninguna palabra prohibida
(`saturacion`, `probabilidad`, `win rate`, `winrate`, `score`, «No documentado»), 27 sellos ODS
como imagen y las líneas de COMENTARIOS completas dentro del pie.

## Compuerta anti-genérico (`scripts/check_anti_generico.py`)

Detector regex que se corre sobre el JSON del motor antes de entregar fichas. Lee
`skills/proponer-retos/references/anti-generico.md` (una línea de baneo por frase: si el
detector falla, se agrega el patrón ahí y el script lo carga en la siguiente corrida).

```powershell
python scripts/check_anti_generico.py --json docs/_build/soluciones.json `
  --out-md docs/_build/compuerta.md --out-json docs/_build/compuerta.json
```

- Exit `0` = todo PASS · exit `1` = hay `RECHAZADA` (no entregar).
- Motivos: `[MOTOR_SCHEMA]` (ruta incompleta: faltan `pagador`/`ya_existe`/`costo`),
  `[FORBIDDEN · cat]` (11 categorías: verbos huecos, actores sin nombre, etiquetas no-producto,
  taller/servicio, reacondicionamiento 1.4b, hardware donado 1.4c, kit/app/sensor, relleno,
  métrica abstracta, frases hechas, weasel words), `[SMELL]`, `[ENCAJE_LITERAL]`,
  `[TERMINO_ENUNCIADO]`, métrica sin unidad, pagador sin cargo.
- Acepta el formato crudo del motor (`{certamen, retos:[{reto, soluciones}]}`) vía
  `normalizar_reto`/`normalizar_opcion`; también listas y `{soluciones: [...]}`.
- Calibración: `tests/test_check_anti_generico.py` (casos PASS + RECHAZAR sintéticos).
  Antes de confiar en la cascada, pásale una opción que ya falló: debe rechazarla.
