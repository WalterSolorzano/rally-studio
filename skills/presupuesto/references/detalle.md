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

## Generación de prompts para llevar el presupuesto a otra IA

Cuando el usuario quiera exportar el presupuesto a otra IA
(OpenAI, Claude, Gemini, OpenCode, Antigravity…), genera el prompt con esta
estructura:

```
Rol: presupuestador de prototipos para rallues de innovación.
Contexto: Certamen <rally_type> (<hours_total> h), moneda <moneda>,
  proyecto <project_name>.
Entrada: `budget/budget.json`, `budget/budget_por_producto.json`,
  `budget/bom.csv`, `research/claims.json`.
Tarea: Generar filas de presupuesto justificadas, con precios creíbles y
  enlace de respaldo, en la moneda del certamen activo.
Restricciones:
  - Cada línea sale de `budget/bom.csv`, ficha del modeler o componentes del
    pautado. Nadie presupuesta en el aire.
  - Precios creíbles: ni regalados ni inflados; se busca la página del vendedor
    y se copia el precio de hoy.
  - Enlace obligatorio y concreto: página del producto o del servicio, nunca
    URL genérica.
  - Toda fila lleva `date` en el JSON (la exige el validador).
  - Sin TIR, VAN ni ROI complejo. Presupuesto de implementación superficial.
  - Element en lenguaje normal; detalle técnico en `description`.
  - Cifras coherentes con video, pautado y canvas.
  - Mano de obra: contrato mensual permanente y salario completo digno.
  - Sin emojis, sin degradados estilo IA, sin glassmorphism.
  - Idioma: español.
Formato de salida: JSON con claves proyecto, moneda, rally_type, filas ([]),
  cada una con element, category, tipo, description, units, unit_cost, total,
  url, date, nota; total_proyecto, rango_referencia.
Idioma: español.
```

## Cómo sugerir un título o nombre de proyecto o producto
Compartido: `skills/_comun/nombres.md`. Léelo antes de aplicar esta sección.

## Cómo enseñar visualmente

- Contraste garantizado: texto claro sobre fondo oscuro, o sombra de texto
  desplazada.
- Elementos gráficos se exportan como PNG 2048×2048 con fondo transparente.
- Sin emojis como íconos en la web demo.
- Tabla de presupuesto con paleta variable por equipo desde `brand/palette.json`.

## Cómo redactar guiones cuidando la pronunciación y el orden de palabras

- Los números del presupuesto deben coincidir exactamente con el guion.
- Escribe para ser escuchado: cifras dichas completas, no leídas de la tabla.
- Máximo 240-270 palabras (≈130-140 WPM) para ≤ 120 s de audio.

## Cómo crear modelos 3D (referencia)
Compartido: `skills/_comun/modelos-3d.md`. Léelo antes de aplicar esta sección.

## Cómo sugerir elementos gráficos
Compartido: `skills/_comun/elementos-graficos.md`. Léelo antes de aplicar esta sección.

## Punteros

- Datos: `budget/budget.json`, `budget/budget_por_producto.json`, `budget/bom.csv`.
- Documento: `budget/budget.xlsx`, `budget/budget_por_producto.xlsx`.
- Reglas del certamen: `knowledge/rubric_matrices.md` §2.
- Doctrina de soluciones: `skills/dossier-soluciones/SKILL.md`.
