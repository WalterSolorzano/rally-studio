## Generación de prompts para llevar la investigación a otra IA

Cuando el usuario quiera exportar el documento extraído a otra IA
(OpenAI, Claude, Gemini, OpenCode, Antigravity…), genera el prompt con esta
estructura:

```
Rol: analista de investigación externa para rallues de innovación.
Contexto: Certamen <rally_type>, documento <nombre_archivo>, tipo <pdf|docx|md>.
Entrada: `extraido.txt` (texto extraído en UTF-8), `research/claims.json`,
  `.agents/rules/modos-rally.md`, `.agents/rules/rubricas-y-puntajes.md`.
Tarea: Extraer contenido, contrastar con la rúbrica y alinearlo al certamen
  activo para servir como propuesta.
Restricciones:
  - Extrae el texto sin IA; no dependas del modelo para leer el archivo.
  - Toda cifra que se use debe existir en `research/claims.json` o venir con
    fuente y año en el documento. Si no, márcala como estimación.
  - Alinea al certamen activo (`brief.json` → `rally_type`).
  - Si `rally_type` está vacío: no adivines — pregunta el certamen.
  - Sin emojis, sin degradados estilo IA, sin glassmorphism.
  - Idioma: español.
Formato de salida: JSON con claves archivo, tipo, hechos ([]), opiniones ([]),
  cifras_con_fuente ([]), estimaciones ([]), destino_pestana, destino_slot,
  simulado.
Idioma: español.
```

## Cómo sugerir un título o nombre de proyecto o producto
Compartido: `skills/_comun/nombres.md`. Léelo antes de aplicar esta sección.

## Cómo enseñar visualmente
Compartido: `skills/_comun/ensenanza-visual.md`. Léelo antes de aplicar esta sección.

## Cómo redactar guiones cuidando la pronunciación y el orden de palabras
Compartido: `skills/_comun/guiones.md`. Léelo antes de aplicar esta sección.

## Cómo crear modelos 3D (referencia)
Compartido: `skills/_comun/modelos-3d.md`. Léelo antes de aplicar esta sección.

## Cómo sugerir elementos gráficos
Compartido: `skills/_comun/elementos-graficos.md`. Léelo antes de aplicar esta sección.

## Punteros

- Estadísticas citables: `research/claims.json`
- Reglas del certamen: `.agents/rules/modos-rally.md`
- Puntajes: `.agents/rules/rubricas-y-puntajes.md`
- Entrega a la ventana: skill `servir-a-ventana`
