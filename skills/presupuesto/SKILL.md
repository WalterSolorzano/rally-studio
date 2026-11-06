---
name: presupuesto
description: Arma el presupuesto del prototipo con filas justificadas, precios creíbles y enlace de respaldo, en la moneda del certamen activo. Úsala cuando haya que cotizar componentes, servicios o el piloto completo.
---

# Don Cangrejo (El Palmado) — Presupuesto del prototipo

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
3. **Enlace obligatorio y concreto.** Cada fila lleva `url` de respaldo a la
   **página del producto o del servicio**, nunca una URL genérica (página
   principal, buscador, booking.com, wikipedia, etc.). Sin enlace, la fila no
   pasa. Si el precio no se pudo verificar hoy (páginas que bloquean bots,
   cotizaciones locales), se marca `[ESTIMADO]` en `nota`, se explica la base
   del cálculo y se usa la URL del producto de referencia más cercano.
   Toda fila lleva `date` en el JSON (la exige el validador), pero **la fecha
   NO se muestra en la tabla xlsx**.
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
7. **Palabras normales.** La tabla la lee gente que no es ingeniera: en
   `element` va el nombre de la cosa como la compraría una persona normal
   ("Radio de largo alcance", no "Módulo Heltec WiFi LoRa 32 V3"). El detalle
   técnico (marca, modelo, chip) va en `description`.
8. **Cifras coherentes.** El total del presupuesto debe coincidir con lo que
   dicen el video, el pautado y el canvas. Si cambia una cifra, se actualiza en
   los cuatro sitios.
9. **Mano de obra: contrato permanente, salario completo.** Si el prototipo
   requiere ensamble, instalación o maquila, se agregan filas `tipo: salario`
   con **contrato mensual permanente y salario completo digno**, no tarifas
   por hora ni jornales sueltos (referencia LATAM: técnico US$ 400–600/mes,
   ingeniero US$ 700–1 000/mes). El tiempo del equipo no es gratis; pagar
   "US$10 la hora" hace el presupuesto inverosímil para el jurado.
10. **Cantidad justificada.** Un `units` grande (p. ej. 10 nodos) solo pasa si
    `nota` explica el porqué: cobertura del sitio piloto, escenario de rescate,
    BOM del modeler o mínimo viable de la red. La cantidad no se elige "para
    cuadrar con el rango".
11. **Sin obra indirecta ni herramientas.** No van filas de "flete y
    aranceles" ni "herramienta del taller": los presupuestos de los
    ganadores no las incluyen. En su lugar van **personas**: `tipo: salario`
    (técnico de soldadura, personal de instalación).
12. **Material, no pieza terminada.** Lo que el equipo fabrica (carcasas,
    gabinetes, soportes) se presupuesta como **material** (filamento,
    plástico, tornillería), nunca como servicio de impresión de terceros:
    el diseño lo hace el equipo a partir del análisis de necesidades.
13. **Costos de creación, no de ingeniería detallada.** La tabla lista lo
    que se compra o contrata para **crear el prototipo**. No se desglosa
    ingeniería fina; el desarrollo (software, horas de diseño del equipo)
    va aparte, no en esta tabla.
14. **Compatibilidad anotada.** Si se compran partes que deben trabajar
    juntas (batería, cargador, placa solar, sensores), la `nota` confirma
    que voltaje y corriente son compatibles.
15. **Dos vistas: por producto y por proyecto.** Se entregan siempre dos
    tablas:
    - **Costo por producto** (`budget/budget_por_producto.json` + `.xlsx`):
      `units = 1` en cada fila, con el precio de **una sola unidad**. Esta es
      la cifra que se cita en pautado, video y canvas (el costo unitario del
      prototipo). Si requiere ensamble, incluye la parte del contrato mensual
      del técnico prorrateada por unidad (contrato ÷ unidades del piloto).
    - **Proyecto completo** (`budget/budget.json` + `.xlsx`): la misma lista
      multiplicada por las cantidades del piloto más los gastos compartidos
      (estación, hosting, transporte). El total del proyecto
      nunca contradice la suma de unidades × costo unitario de la vista
      producto.
16. **Agrupa en bloques, estilo ganador.** Como en el presupuesto de
    Ollnari (Operación Titán, 1er lugar Nacional en Procesos), la tabla se
    arma con **bloques funcionales**, no con el BOM pieza por pieza:
    electrónica y comunicaciones, energía, estructura y protección,
    estación de mando, personal, infraestructura digital, logística. Entre
    **6 y 10 filas** por vista. Cada fila lleva `units = 1` (proyecto) y su
    `unit_cost` es el total del bloque; los componentes, cantidades y
    precios unitarios van explicados en `nota`. El jurado compra un bloque,
    no 20 tornillos.

## Formato de cada fila

```json
{
  "element": "Nombre claro para público no técnico",
  "category": "hardware | software | servicio | material | logistica",
  "tipo": "pago_unico | suscripcion | salario | servicio | logistica",
  "description": "Para qué sirve; aquí sí el detalle técnico (marca, modelo)",
  "units": 1,
  "unit_cost": 0,
  "total": 0,
  "url": "https://... producto o servicio concreto",
  "date": "2026-11-01",
  "nota": "opcional: estimación, supuesto o justificación de la cantidad"
}
```

- `tipo` es obligatorio y así se muestra en la tabla:
  `pago_unico` (equipo/material que se compra una vez), `suscripcion`
  (plan anual/mensual), `salario` (mano de obra por horas), `servicio`
  (trabajo contratado por pieza: impresión 3D, maquila), `logistica`
  (flete, arancel, transporte).
- En filas `salario`: `units` = meses de contrato y `unit_cost` = salario
  mensual completo (contrato permanente; nunca por hora).
- `unit_cost_nio` en Nacional, `unit_cost_usd` en Latam (el campo genérico
  `unit_cost` se conserva para la tabla).
- `units` siempre numérico y mayor que cero.
- `total = units × unit_cost`, redondeado a dos decimales.

## Tabla xlsx (formato visible)

`gen_budget.py` arma la hoja. Estructura exigida:

- Fila 1: **"PRESUPUESTO"** en grande, en una celda unificada (merge) a lo
  largo de **toda** la tabla; debajo, subtítulo con proyecto, equipo y moneda.
- Encabezados: `# | Elemento / Insumo | Descripción | Unidades |
  Costo Unit. | Subtotal | Tipo | Fuente / Enlace`.
- **Sin columna de fecha**: la fecha vive solo en `budget/budget.json`.
- Fila final: total general en celda destacada, merge a lo ancho.
- **Paleta variable por equipo.** Los colores (título, encabezados, celda de
  total) salen de `brand/palette.json` del proyecto (`primary`, `accent`,
  `text`), nunca hardcodeados: cada grupo imprime la tabla con sus tokens de
  diseño. Si el proyecto aún no tiene paleta, se usa un neutro discreto
  como fallback.

## Rango de referencia

- Latam: el presupuesto del piloto suele moverse en **USD 4 000–6 000**
  (marcado `[PATRÓN]`, no es regla de las bases). Si se sale del rango, se
  justifica por escrito.
- Nacional: no hay rango oficial verificado; se usa el costo real del piloto en
  C$ y se declara la tasa BCN aplicada.

## Verificación antes de entregar

1. Cada fila tiene `units`, `unit_cost`, `total`, `url` y `tipo`.
2. Los totales suman y coinciden con video, pautado y canvas.
3. La moneda corresponde al `rally_type`.
4. No hay filas duplicadas, conceptos inventados ni URLs genéricas.
5. Hay al menos una fila de mano de obra (`salario` o `servicio`) si el
   prototipo requiere ensamble o instalación.
6. `python scripts/validate_budget.py` (si existe) termina sin errores.
7. Existe la vista por producto (`budget_por_producto.json`) y su suma
   cuadra con la vista de proyecto completo.

## Punteros

- Datos: `budget/budget.json`, `budget/budget_por_producto.json`, `budget/bom.csv`.
- Documento: `budget/budget.xlsx`, `budget/budget_por_producto.xlsx`.
- Reglas del certamen: `knowledge/rubric_matrices.md` §2.
- Doctrina de soluciones: `skills/dossier-soluciones/SKILL.md`.
