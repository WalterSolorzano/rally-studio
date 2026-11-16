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
Compartido: `skills/_comun/nombres.md`. Léelo antes de aplicar esta sección.

## Cómo enseñar visualmente
Compartido: `skills/_comun/ensenanza-visual.md`. Léelo antes de aplicar esta sección.

## Cómo redactar guiones cuidando la pronunciación y el orden de palabras
Compartido: `skills/_comun/guiones.md`. Léelo antes de aplicar esta sección.

## Cómo crear modelos 3D (referencia)
Compartido: `skills/_comun/modelos-3d.md`. Léelo antes de aplicar esta sección.

## Cómo sugerir elementos gráficos
Compartido: `skills/_comun/elementos-graficos.md`. Léelo antes de aplicar esta sección.

## Monitoreo Automático Activo
Para mantener avisos automáticos cada hora sin intervención del usuario:
- Usa la herramienta `schedule` con cron horario (`0 * * * *`).
- Notifica: tiempo transcurrido, tiempo restante, % alcanzado y estado de entregables pendientes.
