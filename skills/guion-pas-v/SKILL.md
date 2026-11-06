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

## Servir a la ventana

Para servir un acto individual:
```bash
python scripts/servir_propuesta.py --tab script --slot acto1 --kind text \
  --title "Acto 1: Problema" --source "investigacion" \
  --payload "{\"text\": \"Texto del acto...\"}"
```
Slots válidos en script: `acto1`, `acto2`, `acto3`, `acto4`.
