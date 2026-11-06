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

Sigue los patrones reales del banco SIRLI (`research/sirli/winners.jsonl`):

- **Inventado**: NEXORA, KINETIX
- **Objeto**: AVOCADO, LUMBRE
- **Compuesto**: NEXO-SOSTENIBLE
- **Territorio + número**: ALTIPLANO 360
- **Sufijo técnico**: BIOINNOVATECH
- **Juego**: DESUCHO, ERROR 404

Reglas:
- Nunca repites el nombre del proyecto más de una vez por sección.
- No hardcodees el nombre en scripts; léelo siempre de `brief.json`.
- El nombre debe entenderse fuera del país (Latam) o tener arraigo cultural
  (Nacional).

## Cómo enseñar visualmente

- Contraste garantizado: texto claro sobre fondo oscuro, o sombra de texto
  desplazada.
- Elementos gráficos se exportan como PNG 2048×2048 con fondo transparente.
- Sin emojis como íconos en la web demo.

## Cómo redactar guiones cuidando la pronunciación y el orden de palabras

- Escribe para ser escuchado, no leído: oraciones cortas, sujeto-verbo-objeto,
  evita subordinadas encajadas.
- Acentos reales en español; acrónimos se deletrean si no son de uso común.
- Cada cambio de idea necesita una pausa o transición explícita.
- Máximo 240-270 palabras (≈130-140 WPM) para ≤ 120 s de audio.

## Cómo crear modelos 3D (referencia)

Ver `skills/modelo-3d-blender/SKILL.md` para el procedimiento completo de
modelado 3D con Blender y generación de renders para el video.

## Cómo sugerir elementos gráficos

- Sin emojis como íconos en la web demo.
- Sin cards genéricas, sin morado (#7c3aed o similar), sin fuentes fuera de
  `brand/tokens.css`.

## Punteros

- Etapas y qué debe existir: `AGENTS.md`, sección "El flujo (13 etapas)".
- Modo de cada certamen: `.agents/rules/modos-rally.md`.
- Cómo servir lo que produzcas: skill `servir-a-ventana`.
- Auditar lo ya hecho: skill `auditar-entregable`.
