---
name: guiar-usuario
description: Lleva al usuario por las 13 etapas del workbench, detecta qué falta en cada una y lo pregunta de a una. Úsala cuando el usuario no sepa por dónde empezar, cuando pida "qué sigue" o cuando una pestaña esté incompleta.
---

# Tu Última Neurona — Guiar al usuario

## Cuándo usarla

- El usuario abre el proyecto por primera vez.
- Pregunta "¿qué hago ahora?" o "¿qué me falta?".
- Una etapa está a medias y hay que desbloquear la siguiente.

## Procedimiento

1. Corre `contexto-rally` primero. Sin saber qué hay, no puedes saber qué falta.
2. Compara el estado con la tabla de etapas de `AGENTS.md` y elige **la primera incompleta**.
3. Para esa etapa, identifica **un solo hueco**. No enumeres diez carencias.
4. Haz **una pregunta a la vez**, concreta y respondible:
   - Bien: "¿En qué municipio de Nicaragua van a probar el prototipo?"
   - Mal: "Cuéntame sobre el equipo, el impacto y el presupuesto."
5. Cuando responda, registra el dato en `brief.json` (tu memoria del proyecto).
6. Si el campo también existe en la ventana, dile al usuario **dónde escribirlo**. No
   prometas que se rellena solo: la interfaz la escribe él.
7. Solo cuando la etapa esté completa, anuncia la siguiente y por qué depende de la anterior.

## Reglas

- **Nunca inventes** para poder avanzar. Si no hay respuesta, la etapa queda abierta.
- No hagas más de una pregunta por mensaje.
- Si el usuario pide saltarse una etapa, dile qué se rompe después (no bloquees, avisa).
- Si detectas una contradicción (dos cifras distintas en guion y presupuesto), señálala
  antes de seguir.
- Antes de guiar, leer `AGENTS.md` sección "El flujo (13 etapas)" (certamen → team → challenges → solution → impact → multi_ai → pautado → budget → resources → canvas → script → webdemo → timeline). Elegir la primera etapa incompleta y avanzar solo cuando la anterior esté completa. Nunca inventar datos para poder avanzar; si falta una respuesta, la etapa queda abierta y se pregunta al usuario.

## Generación de prompts para llevar el guiado a otra IA

Cuando el usuario quiera exportar el estado de las 13 etapas a otra IA
(OpenAI, Claude, Gemini, OpenCode, Antigravity…), genera el prompt con esta
estructura:

```
Rol: guía de usuario para rally de innovación, especialista en las 13 etapas.
Contexto: Certamen <rally_type>, etapa actual <etapa>, proyecto <project_name>.
Entrada: `brief.json`, `AGENTS.md` sección "El flujo (13 etapas)".
Tarea: Llevar al usuario por las 13 etapas, detectar qué falta en cada una y
  preguntar de a una.
Restricciones:
  - Corre `contexto-rally` primero. Sin saber qué hay, no puedes saber qué falta.
  - Elige la primera etapa incompleta. Identifica un solo hueco.
  - Haz una pregunta a la vez, concreta y respondible.
  - Cuando responda, registra el dato en `brief.json`.
  - Nunca inventes para poder avanzar. Si no hay respuesta, la etapa queda abierta.
  - No hagas más de una pregunta por mensaje.
  - Sin emojis, sin degradados estilo IA, sin glassmorphism.
  - Idioma: español.
Formato de salida: JSON con claves etapa_actual, etapa_incompleta, hueco,
  pregunta, datos_registrados, proxima_etapa.
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

- Etapas y qué debe existir: `AGENTS.md`, sección "El flujo (13 etapas)".
- Modo de cada certamen: `.agents/rules/modos-rally.md`.
- Cómo servir lo que produzcas: skill `servir-a-ventana`.
- Auditar lo ya hecho: skill `auditar-entregable`.
