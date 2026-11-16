---
name: sugerir-por-fase
description: Da sugerencias cortas y accionables para una etapa concreta del flujo (certamen, equipo, retos, solución, impacto, despacho, pautado, presupuesto, recursos, canvas, guion, prototipo, checklist). Úsala cuando el usuario pide "qué me falta aquí" o "cómo mejoro esto".
---

# Café Presto con Ansiedad — Sugerir por fase

## Cuándo usarla

- El usuario está en una pestaña y pregunta qué hacer, qué falta o cómo subir el puntaje.
- Pide una revisión rápida de una etapa, no un documento entero.

## Procedimiento

1. Identifica la etapa por el nombre de la pestaña (`certamen`, `team`, `challenges`,
   `solution`, `impact`, `multi_ai`, `pautado`, `budget`, `resources`, `canvas`, `script`,
   `webdemo`, `timeline`).
2. Mira lo que el usuario ya tiene: `GET http://localhost:8000/api/state`. Si el servidor no
   responde, pídele que te pegue el contenido de esa pestaña.
3. Lee la rúbrica del certamen activo en `.agents/rules/rubricas-y-puntajes.md` y quédate con
   los criterios de mayor peso que toca esta etapa.
4. Devuelve **máximo 5 sugerencias**, ordenadas por impacto en puntaje. Cada una:
   - una línea de qué cambiar,
   - una línea de por qué sube puntaje (criterio y peso),
   - si aplica, el dato que falta para poder hacerlo.
5. Termina con **una** acción concreta para los próximos 15 minutos.
6. Si el usuario acepta, produce el cambio y sírvelo con `servir-a-ventana`.

## Reglas

- Cada sugerencia debe validarse contra la rúbrica del certamen activo
  (`.agents/rules/rubricas-y-puntajes.md`) antes de devolverse: indicar el criterio de mayor
  peso que toca y por qué sube puntaje. Ninguna sugerencia se da sin esta validación.
- No reescribas toda la sección si no te lo piden: sugiere.
- Nada de consejos genéricos ("mejora la redacción"). Cada sugerencia debe poder ejecutarse.
- Si falta un dato de base, esa es la primera sugerencia: conseguirlo.
- Respeta los límites de caracteres del pautado y la duración del guion.
- `slides` es opcional y solo se instala si el usuario pide un pitch deck además del video de 120 s; nunca reemplaza el guion ni el video.

## Generación de prompts para llevar las sugerencias a otra IA

Cuando el usuario quiera exportar las sugerencias de fase a otra IA
(OpenAI, Claude, Gemini, OpenCode, Antigravity…), genera el prompt con esta
estructura:

```
Rol: mentor de rally de innovación, especialista en rúbricas de evaluación.
Contexto: Etapa <etapa>, certamen <rally_type>, proyecto <project_name>.
Entrada: `GET http://localhost:8000/api/state`, `.agents/rules/rubricas-y-puntajes.md`.
Tarea: Dar máximo 5 sugerencias cortas y accionables para la etapa, ordenadas por
  impacto en puntaje.
Restricciones:
  - Cada sugerencia debe validarse contra la rúbrica del certamen activo.
  - Máximo 5 sugerencias, ordenadas por impacto en puntaje.
  - Cada sugerencia: una línea de qué cambiar, una línea de por qué sube puntaje
    (criterio y peso), dato que falta para poder hacerlo.
  - Termina con una acción concreta para los próximos 15 minutos.
  - No reescribas toda la sección si no te lo piden: sugiere.
  - Nada de consejos genéricos ("mejora la redacción"). Cada sugerencia debe poder
    ejecutarse.
  - Si falta un dato de base, esa es la primera sugerencia: conseguirlo.
  - Respeta los límites de caracteres del pautado y la duración del guion.
  - Sin emojis, sin degradados estilo IA, sin glassmorphism.
  - Idioma: español.
Formato de salida: JSON con claves etapa, rally_type, sugerencias ([]), cada una con
  cambiar, por_que_sube_puntaje, dato_falta, accion_15min.
Idioma: español.
```

## Cómo sugerir un título o nombre de proyecto o producto
Compartido: `skills/_comun/nombres.md`. Léelo antes de aplicar esta sección.

## Cómo enseñar visualmente

- Una sola distancia focal por secuencia con rótulos.
- Contraste garantizado: texto claro sobre fondo oscuro, o sombra de texto
  desplazada.
- Elementos gráficos se exportan como PNG 2048×2048 con fondo transparente.
- Sin emojis como íconos en la web demo.

## Cómo redactar guiones cuidando la pronunciación y el orden de palabras
Compartido: `skills/_comun/guiones.md`. Léelo antes de aplicar esta sección.

## Cómo crear modelos 3D (referencia)
Compartido: `skills/_comun/modelos-3d.md`. Léelo antes de aplicar esta sección.

## Cómo sugerir elementos gráficos
Compartido: `skills/_comun/elementos-graficos.md`. Léelo antes de aplicar esta sección.

## Punteros

- Etapas y qué debe existir en cada una: `AGENTS.md`.
- Rúbricas: `.agents/rules/rubricas-y-puntajes.md`.
- Pautado y guion: `.agents/rules/pautado-y-guion.md`.
