---
name: presupuesto
description: Arma el presupuesto del prototipo con filas justificadas, precios creíbles y enlace de respaldo, en la moneda del certamen activo. Úsala cuando haya que cotizar componentes, servicios o el piloto completo.
---

# Presupuesto del prototipo

## Cuándo usarla

- Hay que llenar `budget/budget.json` o `budget/budget.xlsx`.
- El pautado o el canvas necesitan cifras que cuadren.
- El usuario pide "cuánto cuesta" o "justifica el presupuesto".

## Moneda y modo

| | Nacional (24 h) | Latam (28 h) |
|---|---|---|
| Moneda principal | **C$** con la tasa BCN de `brief.json` (`exchange_rate_bcn`) | **USD** |
| Referencia | USD opcional, nunca principal | sin C$ ni tasas locales |
| Alcance | piloto en un municipio | piloto replicable, costo por unidad |

Si `rally_type` no está en `brief.json`, se pregunta antes de cotizar. No se
mezclan monedas en la misma tabla.

## Reglas de precio

1. **El precio se apoya en la ficha o el BOM.** Cada línea sale de lo que otro
   especialista declaró que se necesita (`budget/bom.csv`, ficha del modeler,
   componentes del pautado). Nadie presupuesta en el aire.
2. **Precios creíbles.** Ni regalados ni inflados: si algo cuesta 5 cuando en
   tienda cuesta 200, está mal; si cuesta 2 000 cuando el promedio es 50,
   también. Se busca la página del vendedor y se copia el precio de hoy.
3. **Enlace obligatorio.** Cada fila lleva `url` de respaldo y la fecha de
   consulta. Sin enlace, la fila no pasa. Si el precio es una estimación
   razonada, se marca `[ESTIMADO]` y se explica la base.
4. **Pagar por usar, casi nunca construir.** Alojamiento, mensajería, voz,
   hosting, transporte y maquila se contratan: es más barato, más rápido y más
   creíble. Ahora bien, **construir no es gratis**: un prototipo de hardware
   cuesta materiales, corte, impresión 3D, componentes y horas de taller; el
   software propio cuesta sobre todo tiempo. El presupuesto debe reflejar el
   costo real del tipo de proyecto, no asumir que "lo propio no cuesta".
5. **Gastos recurrentes para lo digital.** Si es app o web, incluye el plan
   anual y el costo por uso, no solo el gasto del primer día.
6. **Sin TIR, VAN ni ROI complejo.** Es un presupuesto de implementación
   superficial: qué se compra, cuánto cuesta y para qué sirve.
7. **Palabras normales.** La tabla la lee gente que no es ingeniera: nombre de
   la cosa, para qué sirve y cuántas unidades.
8. **Cifras coherentes.** El total del presupuesto debe coincidir con lo que
   dicen el video, el pautado y el canvas. Si cambia una cifra, se actualiza en
   los cuatro sitios.

## Formato de cada fila

```json
{
  "element": "Nombre claro del elemento",
  "category": "hardware | software | servicio | material | logistica",
  "description": "Para qué sirve en el prototipo",
  "units": 1,
  "unit_cost": 0,
  "total": 0,
  "url": "https://...",
  "date": "2026-11-01",
  "nota": "opcional: estimación o supuesto"
}
```

- `unit_cost_nio` en Nacional, `unit_cost_usd` en Latam (el campo genérico
  `unit_cost` se conserva para la tabla).
- `units` siempre numérico y mayor que cero.
- `total = units × unit_cost`, redondeado a dos decimales.

## Rango de referencia

- Latam: el presupuesto del piloto suele moverse en **USD 4 000–6 000**
  (marcado `[PATRÓN]`, no es regla de las bases). Si se sale del rango, se
  justifica por escrito.
- Nacional: no hay rango oficial verificado; se usa el costo real del piloto en
  C$ y se declara la tasa BCN aplicada.

## Verificación antes de entregar

1. Cada fila tiene `units`, `unit_cost`, `total` y `url`.
2. Los totales suman y coinciden con video, pautado y canvas.
3. La moneda corresponde al `rally_type`.
4. No hay filas duplicadas ni conceptos inventados.
5. `python scripts/validate_budget.py` (si existe) termina sin errores.

## Punteros

- Datos: `budget/budget.json`, `budget/bom.csv`.
- Documento: `budget/budget.xlsx`.
- Reglas del certamen: `knowledge/rubric_matrices.md` §2.
- Doctrina de soluciones: `skills/dossier-soluciones/SKILL.md`.
