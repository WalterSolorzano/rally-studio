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

## Monitoreo Automático Activo
Para mantener avisos automáticos cada hora sin intervención del usuario:
- Usa la herramienta `schedule` con cron horario (`0 * * * *`).
- Notifica: tiempo transcurrido, tiempo restante, % alcanzado y estado de entregables pendientes.
