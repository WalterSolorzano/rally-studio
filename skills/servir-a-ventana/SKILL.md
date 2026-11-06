---
name: servir-a-ventana
description: Entrega una propuesta a la interfaz para que el usuario la acepte o la descarte. Arma el sobre, elige pestaña y ranura correctas y ejecuta servir_propuesta.py. Úsala siempre que produzcas contenido que deba aparecer en la ventana.
---

# PedidosYa — Servir a la ventana

## Cuándo usarla

- Acabas de producir texto, filas de presupuesto, un acto del guion o cualquier contenido
  que el usuario deba ver en la interfaz.
- El usuario dice "pásalo al tablero", "ponlo en presupuesto" o "muéstrame eso".

## Procedimiento

1. Escribe el payload en un archivo JSON temporal. Formatos:
   - `pautado` y `script`: `{"text": "..."}`
   - `budget`: `{"items": [{"element": "...", "category": "...", "units": 1, "unit_cost": 0, "url": "..."}]}`
  (la tabla y los exports leen `element`; el puente también acepta `concept` y escribe ambos).
   - Otras pestañas: el objeto que tenga sentido para esa pestaña.
2. Elige `--tab` (una de las 13) y `--slot`:
   - `pautado` → `problema | solucion | impacto | innovacion | prefactibilidad`
   - `budget` → `costos`
   - `script` → `acto1 | acto2 | acto3 | acto4`
   - el resto → `main`
3. Ejecuta:

```bash
python scripts/servir_propuesta.py --tab pautado --slot problema --kind text \
  --title "Problema, versión revisada" --source "investigación externa" \
  --payload propuesta.json
```

4. Verifica que respondió con la ruta escrita. Si devuelve errores de validación, corrígelos
   y vuelve a intentar; no fuerces un `tab`/`slot` que no exista.
5. Dile al usuario, en una línea, **qué va a ver y dónde**: "Te dejé una propuesta en
   06 Pautado · Problema. Pulsa Aceptar para aplicarla."
6. Si el servidor no está corriendo, avísalo: sin servidor no hay buzón.

## Reglas

- Marca `--simulated` siempre que el contenido no sea real. La ventana lo muestra con
  distintivo y el usuario tiene derecho a saberlo.
- Una propuesta = un slot. No mezcles dos secciones en un mismo sobre.
- No sobrescribas nada por tu cuenta: el buzón existe para que el humano decida.
- Si el payload supera 5 MB, no lo sirvas: resume o divide.

## Generación de prompts para llevar la propuesta a otra IA

Cuando el usuario quiera exportar el contenido servido a otra IA
(OpenAI, Claude, Gemini, OpenCode, Antigravity…), genera el prompt con esta
estructura:

```
Rol: puente de entrega de contenido para rally de innovación.
Contexto: Pestaña <tab>, ranura <slot>, certamen <rally_type>.
Entrada: payload JSON del sobre (`{"text": "..."}` o `{"items": [...]}`).
Tarea: Revisar el contenido antes de servirlo a la ventana del dashboard.
Restricciones:
  - Una propuesta = un slot. No mezcles dos secciones en un mismo sobre.
  - No sobrescribas nada por tu cuenta: el buzón existe para que el humano decida.
  - Si el payload supera 5 MB, resúmelo o divídelo.
  - Marca `--simulated` si el contenido no es real.
  - Sin emojis, sin degradados estilo IA, sin glassmorphism.
  - Idioma: español.
Formato de salida: JSON con claves tab, slot, kind, title, source, payload,
  simulado, ruta_escrita.
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

- Validador y esquema: `scripts/content_store.py` (`ALLOWED_TABS`, `SLOTS_BY_TAB`).
- CLI: `scripts/servir_propuesta.py --help`.
- Cómo lo muestra la interfaz: `dashboard/content_bridge.js`.
