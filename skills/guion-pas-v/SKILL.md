---
name: guion-pas-v
description: Escribe o revisa el guion del pitch en 4 actos (PAS-V), respetando el límite estricto de 120 segundos, coherencia de cifras con presupuesto y claims, y especificidad al reto y la solución (sin frases de plantilla ni secciones genéricas).
---

# Guion PAS-V — Pitch de 120 segundos

## Cuándo usarla
- Redacción o ajuste del guion de video (`script/script.md` o por actos).
- El usuario pide estructurar el pitch o probar tiempos de locución.
- Preparar contenido para servir a la pestaña `script` del dashboard.

## Estructura de 4 Actos (PAS-V)

Las cuatro funciones son fijas; el **contenido de cada acto no**. No hay frases
obligatorias ni secciones rellenables: el acto dice qué debe lograr, y el texto sale del
reto, la solución y los claims de este proyecto.

| Acto | Función | Ventana (rúbrica) | Qué debe lograr | Prohibido |
|---|---|---|---|---|
| I | **Problema** | 0:00–0:20,4 | que el jurado vea a quién le duele y cuánto, en <10 s | nombre del proyecto, logos, «somos estudiantes de» |
| II | **Mecanismo** | 0:20,4–1:00,0 | entender cómo funciona la solución, no lo bueno que es | beneficios antes del mecanismo, jerga sin imagen |
| III | **Prefactibilidad** | 1:00,0–1:34,8 | cuánto cuesta, quién paga, de qué vive el piloto | TIR, VAN, más de tres cifras de dinero |
| IV | **Cierre** | 1:34,8–2:00,0 | volver al usuario del Acto I y decir dónde se replica | «gracias», logo final, buenos deseos sin métrica |

Los segundos salen de la matriz (`knowledge/rubric_matrices.md` §3): 17 / 33 / 29 / 21 %.
Redondear a 20/40/35/25 es válido para escribir, pero el audio final se mide contra
20,4 / 39,6 / 34,8 / 25,2.

## El guion no se rellena: se deduce

Un guion genérico se reconoce porque podría servir para otro proyecto cambiando dos
palabras. Antes de escribir una línea, responde por escrito:

1. **Reto** literal del comité (no parafraseado a «falta de tecnología»).
2. **Causa raíz**: por qué ese reto sigue abierto hoy. Si no la puedes nombrar, no hay
   guion, hay presentación.
3. **Insight**: el dato o la observación que cambia la forma de ver el problema.
4. **Mecanismo propio**: qué hace *esta* solución, en pasos concretos y con la pieza que
   lo hace posible.
5. **Prueba**: qué ya se midió (prototipo, ensayo, piloto, entrevista) y con qué número.
6. **Economía**: costo del piloto, quién paga y qué se sostiene sin subsidio.

Si un acto no puede apoyarse en esos seis puntos, se deja el hueco marcado y se pide el
dato; no se cubre con una frase que suene bien.

### Frases que delatan un guion genérico

Prohibidas salvo que sean literalmente ciertas y verificables:

- «La solución se organiza en tres capas: captura, procesamiento e interfaz».
- «Cada módulo es independiente: si una pieza falla, el resto sigue operando».
- «Parámetros configurables, insumos de mercado local y mantenimiento propio».
- «Tiempo de respuesta, usuarios o sitios activos y costo por unidad operativa».
- «Talento nicaragüense al servicio de la comunidad» / «innovación diseñada para replicarse».
- «El problema no es la falta de esfuerzo, es la falta de una respuesta simple».
- «La operación se financia con una cuota mensual por usuario o sitio activo».

Ninguna de esas frases dice qué hace el proyecto. Si aparecen, el guion está sin escribir.

### El guion se adapta al tipo de reto

El Acto II no se escribe igual para todos. La tabla fija qué debe mostrar el mecanismo:

| Tipo de reto | El Acto II muestra | Cifra que importa |
|---|---|---|
| Físico / infraestructura | la pieza, el montaje, el corte o el render con dimensiones | costo del prototipo, capacidad por día |
| Proceso / logística | el flujo antes y después, cuellos de botella, tiempos | horas o mermas evitadas |
| Social / servicios | quién hace qué, recorrido del usuario, acuerdo entre actores | personas atendidas, costo por beneficiario |
| Digital / datos | pantalla real, dato que entra y decisión que sale | licencias, costo por sitio activo |
| Ambiental / circular | el residuo convertido en insumo, masa y energía | kg desviados, ingreso por subproducto |

Regla de aceptación: **si el guion se puede leer igual para otro equipo del certamen, no
sirve.** Se reescribe con el mecanismo y la prueba de este proyecto.

El 3D es el tronco del Acto II: es la forma más rápida de que el jurado vea cómo
funciona algo que aún no existe. Intenta modelar primero (pieza, módulo, ensamble, corte,
montaje en el sitio, o el objeto físico que toca un proceso). Solo si de verdad no hay nada
que modelar —política, gestión pura, campaña— se cambia a diagrama, captura o demo, y se
escribe por qué.

Los ganadores de `Proyectos Ganadores de Rally Latam.md` (registro 2014–2026) son
**análisis de técnica, no plantillas**: los retos casi nunca se repiten. De ahí se aprende
cómo abrieron el mecanismo, cómo mostraron el costo, cómo cerraron y qué ritmo usaron; no
se copia el tema ni el guion. Hay campeones sin render —BottleLife (2017), Ingeniarte
(2021), MT Soluciones Creativas (2021, maqueta física), Mentes Volcánicas (2025)— y eso
enseña que el criterio es abrir la caja negra, no cumplir una moda. Copiar el video de un
ganador produce la copia de la copia; el jurado reconoce el referente y el equipo pierde
autoría.

## El storyboard va después del guion

El guion es la fuente de verdad narrativa; el storyboard la traduce a planos. Nunca al
revés: si una toma necesita una frase que el guion no dice, se corrige el guion primero y
después se recompila el shotlist. El storyboard no inventa cifras, no cambia el orden de
los actos y no introduce un beneficio que el guion no sostiene.

Orden correcto: `reto → causa → insight → mecanismo → prueba → guion → shots/*.yaml →
script/shotlist.csv → docs/storyboard_visual.html`.

## Reglas Innegociables
1. **Duración:** ≤ 120 segundos medidos en audio real. Estimación en texto: 240 a 270 palabras máximo (a 130-140 WPM).
2. **Coherencia total:** Los números de inversión deben coincidir exactamente con `budget/budget.json`.
3. **Respaldo:** Cada dato o porcentaje debe provenir de `research/claims.json`.
4. **Especificidad:** el guion nombra el mecanismo, la pieza o el actor concreto de este proyecto. Si se puede reutilizar para otro equipo, se reescribe.
5. **Sin relleno de plantilla:** ninguna frase de la lista «delatan un guion genérico» entra sin ser literalmente cierta.
4. **Cierre según certamen:**
   - **Nacional:** Anclaje a municipio de Nicaragua y conexión con Plan Nacional / ODS.
   - **Latam:** Cierre: "Piloto en [Ciudad], replicable en toda América Latina".

## Generación de prompts para llevar el guion a otra IA

Cuando el usuario quiera exportar el guion a otra IA (OpenAI, Claude, Gemini,
OpenCode, Antigravity…), genera el prompt con esta estructura:

```
Rol: guionista de pitch de innovación, especialista en locución y pronunciación
  en español.
Contexto: Rally de innovación, certamen <rally_type> (<hours_total> h),
  acto <acto>, duración objetivo <dur> s, rubric_item <rubric_item>.
Entrada: `script/script.md`, `budget/budget.json`, `research/claims.json`.
Tarea: Escribir o revisar el guion del acto en 4 actos (PAS-V), cuidando la
  pronunciación, el orden de palabras y el flujo de ideas.
Restricciones:
  - ≤ 120 segundos medidos en audio real (estimación: 240-270 palabras máximo,
    130-140 WPM).
  - Los números del guion coinciden exactamente con `budget/budget.json`.
  - Cada dato o porcentaje proviene de `research/claims.json`.
  - Prohibido rellenar con frases de plantilla: cada oración nombra el mecanismo,
    el actor o la cifra de ESTE proyecto. Si sirve para otro equipo, se reescribe.
  - Las cuatro funciones (dolor, mecanismo, prefactibilidad, cierre) son fijas; el
    contenido de cada acto se deduce del reto, la causa raíz y la solución.
  - Prohibido decir el nombre del proyecto en el Acto 1.
  - Sin emojis, sin degradados estilo IA, sin glassmorphism.
  - Idioma: español con acentos reales.
  - Cierre según certamen: Nacional → municipio + Plan Nacional/ODS; Latam →
    "piloto en [ciudad], replicable en toda América Latina".
Formato de salida: JSON con claves acto, nombre, duracion_s, texto, palabras_estimadas,
  wpm, numeros_coherentes, claims_usados, cierre_certamen.
Idioma: español.
```

## Cómo redactar guiones cuidando la pronunciación, el orden de palabras y el orden de ideas

### Pronunciación
- Escribe para ser escuchado, no leído: oraciones cortas, sujeto-verbo-objeto,
  evita subordinadas encajadas.
- Acentos reales en español; acrónimos se deletrean si no son de uso común.
- Cada cambio de idea necesita una pausa o transición explícita.
- Lee el guion en voz alta antes de servirlo: si tropezás, reescribe esa frase.

### Orden de palabras
- Mantén el orden sujeto-verbo-objeto (SVO) en español.
- No dejes verbos al final de oraciones largas.
- Evita dobles negativos y construcciones pasivas innecesarias.
- Los números se dicen completos ("cuatro mil quinientos", no "4.500" leído en voz alta).

### Cambio de ideas
- Cada acto tiene una sola idea central; no mezcles problema con solución.
- Transiciones entre actos con conectores claros ("Entonces", "Pero ahora",
  "La respuesta es").
- No repitas el nombre del proyecto más de una vez por sección del pautado.

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
- El nombre no va en los primeros 20 s del video.

## Cómo enseñar visualmente (aplicado al guion y storyboard)

- Cada guion se acompaña de un storyboard con una imagen por toma.
- La imagen muestra el reto ya resuelto y su impacto, no decoración.
- Prioriza foto real de la problemática y del reto sobre ilustración o render.
- La imagen no lleva texto, logos ni marcas de agua: el texto lo pone la plantilla.
- Un rótulo sin flecha que apunte a la pieza no dice nada.
- Contraste garantizado: texto claro sobre fondo oscuro, o sombra de texto
  desplazada.

## Cómo sugerir elementos gráficos (para el video y el guion)

- Thumbnail y piezas de portada: prohibido resolver con cuadrados, rectángulos,
  círculos o triángulos. Usa foto real, vector complejo o un modelo de Blender.
- Elementos gráficos se exportan como PNG 2048×2048 con fondo transparente.
- Sin emojis como íconos en la web demo.
- Sin cards genéricas, sin morado (#7c3aed o similar), sin fuentes fuera de
  `brand/tokens.css`.
- Nombrado de assets: `asset_<shotlist_id>_<descripcion>.<ext>`.

## Cómo crear modelos 3D (referencia para el guion)

Cuando el guion necesite mostrar algo que no existe en fotografía, la skill
`modelo-3d-blender` genera modelos o renders 3D con Blender, con ficha técnica
previa justificada por la rúbrica. Ver `skills/modelo-3d-blender/SKILL.md`.

## Servir a la ventana

Para servir un acto individual:
```bash
python scripts/servir_propuesta.py --tab script --slot acto1 --kind text \
  --title "Acto 1: Problema" --source "investigacion" \
  --payload "{\"text\": \"Texto del acto...\"}"
```
Slots válidos en script: `acto1`, `acto2`, `acto3`, `acto4`.
