---
name: guion-pas-v
description: Escribe o revisa el guion del pitch en 4 actos (PAS-V), respetando el límite estricto de 120 segundos y coherencia de cifras con presupuesto y claims.
---

# Guion PAS-V — Pitch de 120 segundos

## Cuándo usarla
- Redacción o ajuste del guion de video (`script/script.md` o por actos).
- El usuario pide estructurar el pitch o probar tiempos de locución.
- Preparar contenido para servir a la pestaña `script` del dashboard.

## Estructura de 4 Actos (PAS-V)

| Acto | Nombre | Duración | Reglas de oro |
|---|---|---|---|
| 1 | **Problema** | 0:00 - 0:25 (≤25s) | Gancho empático y datos con fuente. **Prohibido decir nombre del proyecto aquí**. |
| 2 | **Agitación** | 0:25 - 0:50 (≤25s) | Consecuencias de no resolverlo. Escala territorial o humana. |
| 3 | **Solución** | 0:50 - 1:30 (≤40s) | Presentación del proyecto. Cómo funciona técnica o socialmente. Webdemo/Prototipo. |
| 4 | **Validación** | 1:30 - 2:00 (≤30s) | Presupuesto resumido, impacto medible, llamada a la acción y cierre. |

## Reglas Innegociables
1. **Duración:** ≤ 120 segundos medidos en audio real. Estimación en texto: 240 a 270 palabras máximo (a 130-140 WPM).
2. **Coherencia total:** Los números de inversión deben coincidir exactamente con `budget/budget.json`.
3. **Respaldo:** Cada dato o porcentaje debe provenir de `research/claims.json`.
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
