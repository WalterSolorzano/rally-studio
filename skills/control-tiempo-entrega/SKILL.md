---
name: control-tiempo-entrega
description: Controla el cronómetro del certamen, avisa estado horario, congela entregables al 75% del tiempo y valida el checklist SIRLI con arsenal.py.
---

# Control de Tiempo y Entrega — Rally Studio

## Cuándo usarla
- Notificaciones periódicas automáticas de estado horario.
- Al alcanzar el 75% del tiempo del certamen (congelar assets).
- Antes del envío final a la plataforma SIRLI.

## Estados del Certamen

| % Tiempo | Acción Requerida |
|---|---|
| **0% - 50%** | Definición de brief, retos, claims de investigación y arquitectura de solución. |
| **50% - 75%** | Pautado cerrado, presupuesto con cotizaciones URL, guion aprobado y locución TTS. |
| **75% (Alerta Roja)** | **Congelamiento total de assets.** Prohibido reescribir pautado. Solo render, ensamble web y subida. |
| **90% - 100%** | Checklist final y envío a plataforma SIRLI. |

## Auditoría Final Obligatoria
Antes de cualquier confirmación de entrega o subida a SIRLI, ejecutar:
```powershell
python arsenal.py check-todo
```
Verifica:
1. Duración del video ≤ 120 segundos.
2. Coherencia de montos entre guion y presupuesto.
3. Caracteres dentro de límites por campo de pautado.

## Generación de prompts para llevar el estado de tiempo a otra IA

Cuando el usuario quiera exportar el cronómetro y estado de entrega a otra IA
(OpenAI, Claude, Gemini, OpenCode, Antigravity…), genera el prompt con esta
estructura:

```
Rol: controlador de tiempo de rally de innovación.
Contexto: Certamen <rally_type> (<hours_total> h), horas restantes
  <hours_remaining>, % alcanzado.
Entrada: `brief.json`, estado de entregables (pautado, presupuesto, guion,
  canvas, script, webdemo, timeline).
Tarea: Informar tiempo transcurrido, tiempo restante, % alcanzado y estado de
  entregables pendientes; decidir si se congelan assets al 75 %.
Restricciones:
  - 0-35 %: producir; 35-55 %: revisar; 55-75 %: integrar; 75-90 %: congelar
    assets y preparar exportación; 90-100 %: solo entrega y verificación.
  - Si el humano fija una hora de inicio distinta, se usa esa; el porcentaje
    nunca se hardcodea.
  - Sin emojis, sin degradados estilo IA, sin glassmorphism.
  - Idioma: español.
Formato de salida: JSON con claves rally_type, hours_total, hours_remaining,
  porcentaje_alcanzado, fase, entregables_pendientes, congelar_assets,
  alerta_roja.
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

## Monitoreo Automático Activo
Para mantener avisos automáticos cada hora sin intervención del usuario:
- Usa la herramienta `schedule` con cron horario (`0 * * * *`).
- Notifica: tiempo transcurrido, tiempo restante, % alcanzado y estado de entregables pendientes.
