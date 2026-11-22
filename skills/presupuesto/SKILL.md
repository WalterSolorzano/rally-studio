---
name: presupuesto
description: Arma el presupuesto del prototipo con filas justificadas, precios creíbles y enlace de respaldo, en la moneda del certamen activo. Úsala cuando haya que cotizar componentes, servicios o el piloto completo.
---

# Don Cangrejo (El Palmado) — Presupuesto del prototipo

**Veto de redacción:** el texto pasa por `skills/_comun/patrones-ia.md`; `verificar_identidad.py` (G4) lo comprueba en `state.json`.

## Navegador obligatorio (browser MCP)

Esta skill **no se completa sin el navegador**. Es la única forma de cumplir la
regla 2 (precio creíble) y la regla 3 (enlace concreto + `screenshot`).

1. Antes de escribir una fila, **abre la página del producto o servicio en el
   navegador real del usuario** (browser MCP, sesión ya iniciada) y copia el
   precio de hoy y la URL exacta del producto.
2. **Captura de evidencia obligatoria:** PNG guardado como
   `budget/shots/<id_fila>.png`, y su fecha en el campo `date` de la fila.
3. Si el navegador MCP no está conectado, **detente y pide al usuario instalar la
   extensión de browser y abrir la sesión**. No sigas con precios de memoria ni
   de búsqueda web sin abrir la página.
4. `[ESTIMADO]` solo se permite **después** de un intento documentado en el
   navegador (bloqueo anti-bot, cotización local). Sin intento, la fila no pasa.
5. `handoff` solo para login, 2FA o captcha interactivo. Nunca resuelvas un
   captcha.

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
   creíble. Construir no es gratis: un prototipo de hardware cuesta materiales,
   corte, impresión 3D, componentes y horas de taller. El presupuesto refleja
   el costo real del tipo de proyecto.
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
    cuadrar con el rango". La fuente de la cantidad es el canvas
    (`model_canvas`, p. ej. "25 colmenas") o el BOM: si el número no sale de
    ahí, es inventado.
11. **Sin obra indirecta ni herramientas.** No van filas de "flete y
    aranceles" ni "herramienta del taller": los presupuestos de los
    ganadores no las incluyen. En su lugar van **personas**: `tipo: salario`
    (técnico de soldadura, personal de instalación).
12. **Material, no pieza terminada.** Lo que el equipo fabrica (carcasas,
    gabinetes, soportes) se presupuesta como **material** (filamento,
    plástico, tornillería), nunca como servicio de impresión de terceros:
    el diseño lo hace el equipo a partir del análisis de necesidades.
13. **Costos de creación, no de ingeniería detallada.** La tabla lista lo
    que se compra o contrata para **crear el prototipo**. El desarrollo
    (software, horas de diseño del equipo) va aparte, no en esta tabla.
14. **Compatibilidad anotada.** Si se compran partes que deben trabajar
    juntas (batería, cargador, placa solar, sensores), la `nota` confirma
    que voltaje y corriente son compatibles.
15. **Dos vistas.** **Por producto** (`budget/budget_por_producto.json`,
    `units = 1`, precio de una unidad: la cifra que va en pautado, video y
    canvas) y **proyecto completo** (`budget/budget.json`, unidades del piloto
    más gastos compartidos). La segunda nunca contradice la suma de la primera.
16. **Bloques, no BOM.** Como el presupuesto de Ollnari (1er lugar Nacional en
    Procesos): bloques funcionales (energía, estructura, personal, logística),
    **6 a 10 filas** por vista, `units = 1`, total del bloque en `unit_cost` y
    el detalle en `nota`. El jurado compra un bloque, no 20 tornillos.
17. **Base declarada.** Cada tabla dice si es **por unidad** (una casa, un
    nodo), **por lote** (con su tamaño) o **por piloto** (todo el municipio).
    Una base por tabla: dos bases, dos tablas. Lote sin tamaño no se compara.
    C$ 12 150 por casa no es C$ 121 500 por lote de 10 casas.
18. **Cerrada o desglose, nunca los dos.** «Sistema completo instalado y
    probado» ya contiene bomba, tanque, base y mano de obra: esos componentes
    no suman aparte. Sumar ambos es doble conteo.
19. **Cero no es fila, es pendiente.** Una partida sin cotización no va en
    `partidas`: la tabla lleva solo filas con costo. Va a `desglose_pendiente`
    con lo que se espera cotizar, y a preguntas abiertas. Fila en cero, en
    `null` o «pendiente» son la misma tabla vacía.
20. **Armar no es operar.** Que un socio arme o instale no autoriza decir que
    opera o administra. El responsable se declara o queda `[FALTA: responsable]`.

## Detalle completo (leer antes de producir)

El procedimiento largo, las tablas y los ejemplos de esta skill están en
`references/detalle.md`. Es obligatorio leerlo antes de generar contenido: ahí viven las
reglas que no caben en esta portada.
