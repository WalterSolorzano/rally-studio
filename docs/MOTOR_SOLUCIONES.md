# Motor de soluciones para retos

Los retos los entrega el usuario o el comité. Este motor **no crea retos**: toma los
retos existentes y produce soluciones aplicables, sustentadas en casos ganadores,
con razonamiento explícito y un dossier PDF listo para deliberar.

## Comandos

```powershell
# 1. Importar los retos del comité desde el cerebro (si challenges.json está vacío)
python scripts/soluciones_motor.py --importar-brain

# 2. Generar soluciones para todos los retos del certamen activo
python scripts/soluciones_motor.py --todos --certamen nacional --grafo `
  --json docs/_build/soluciones.json

# 3. Generar el PDF
python scripts/gen_soluciones_pdf.py --json docs/_build/soluciones.json `
  --out docs/Dossier_Soluciones_nacional.pdf

# Alternativa: ingesta + dossier en un solo paso
python scripts/ingest_challenges.py retos.txt --dossier --certamen latam
```

Opciones del motor: `--reto DESAFIO_01`, `--propuestas N`, `--categoria social`
(Nacional: `tecnologica|social|procesos`; Latam: `innovacion|impacto_social`).

## Qué contiene cada solución

1. **Cadena de razonamiento**: problema → causa raíz → insight → solución → métrica.
   Sale del caso ganador, no de una plantilla.
2. **Precedente**: año, equipo, proyecto, puesto y video. Si no hay caso comparable,
   la ruta se marca `exploratoria` y se declara como hipótesis a validar.
3. **Impacto**: solo cifras con fuente. Sin fuente, se muestra "por validar con el equipo".
4. **Recursos**: componentes detectados en el enunciado.
5. **Rúbrica**: criterio principal y secundario con su puntaje, según el certamen.
6. **Riesgo y pitch**: lo que el jurado atacaría primero y una frase para el video.

## Reglas

- **Nunca** se proponen retos nuevos ni se reescribe el enunciado del comité.
- **Nunca** se muestran estadísticas internas (saturación, score, probabilidad de victoria).
  El dossier solo usa datos verificables para vender la idea.
- Ninguna cifra se inventa: si no está en el corpus, se marca como pendiente.
- La categoría se justifica con el enunciado y el `category_fit`; no se asume.
- Una solución sin precedente no se presenta como validada.

## Fuentes de datos

| Archivo | Uso |
|---|---|
| `research/challenges.json` | Retos del usuario/comité (entrada) |
| `knowledge/retos_razonamiento.json` | 20 casos ganadores con problema, causa, insight, solución y métrica |
| `research/sirli/winners.jsonl` | 5,136 podios 2017–2026 para precedentes y datos de método |
| `graphify-out/graph.json` | Evidencia del cerebro (claims, ganadores, retos) |
| `research/claims.json` | Cifras con fuente |
| `.agents/rules/rubricas-y-puntajes.md` | Puntajes por certamen |

Para añadir un caso: agrega un objeto a `casos` en `knowledge/retos_razonamiento.json`
con `temas`, `year`, `rally`, `categoria`, `equipo`, `proyecto`, `puesto`, `problema`,
`causa_raiz`, `insight`, `solucion`, `metrica`, `fuente` y `video_url`.
Si un campo no está en la fuente, escribe `No documentado en la fuente`.

## Salidas

- `docs/_build/soluciones.json` — datos intermedios.
- `docs/Dossier_Soluciones_<certamen>.pdf` — dossier con portada, método, un bloque
  por reto y una tarjeta por solución.

## Verificación

```powershell
python -m pytest tests/test_soluciones_motor.py tests/test_gen_soluciones_pdf.py tests/test_retos_razonamiento.py -q
```
