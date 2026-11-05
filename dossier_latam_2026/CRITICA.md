# Crítica del dossier Latam 2026

## Veredicto en una línea

El PDF está bien maquetado y mal pensado: es un re-skin de `research/soluciones_actuales.json`
con escenas viejas (picadora, grieta), un servicio disfrazado de producto (suscripción,
alquiler) y pagadores que no tienen partida. No es un dossier de soluciones; es un catálogo de
ideas plausibles.

## Qué muestran los ganadores: producto, lugar o app

En los podios documentados, la forma dominante es **artefacto o infraestructura con medidas y
un lugar concreto**, no una idea genérica:

- **LexoStop (2019):** parada de bus con techo eólico + solar. Producto/infraestructura, lugar
  específico.
- **MT Soluciones (2021):** vivienda social bioclimática, con costos unitarios. Producto.
- **DIGNA (2023):** casa modular de 44.18 m², SODIS, panel de 400 W, fosa FAFA. Producto con
  medidas.
- **BioInnova (2023):** vivienda con agua, saneamiento y huertos. Sistema territorial.
- **Techriders (2024):** micropresas telemetradas con LoRaWAN, lote piloto de USD 4,500.
  Infraestructura + instrumentación, ladera concreta.
- **STEM Synergy (2025):** huertos verticales con recirculación y −40 % de peso estructural.
  Producto/sistema.
- **Mentes Volcánicas (2025):** paneles constructivos de Tetra Pak sismorresistentes. Producto.
- **IGNIS CODE (2026):** micro-refugios bio-climáticos autónomos para polinizadores. Producto.
- **UNICOS (2026):** hábitats artificiales modulares para meliponas. Producto modular.
- **AVOCADO (2026):** motores de electrodomésticos convertidos en tracción rural. Producto/
  sistema con motor rescatado.

Las plataformas aparecen, pero cuando **la transacción es el producto**: trazabilidad del café
(SITRACAFE), traducción LENSEGUA (BidiSign), comercio artesanal (Ollnari). No ganan como una
capa digital sobre un servicio que ya existe.

**Patrón:** el ganador muestra un objeto, una obra o un sistema con una medida física y un
usuario concreto. Ninguno de los casos revisados tiene una suscripción o un alquiler como
núcleo. El ganador de polinizadores no fue una colmena tradicional: fue un refugio autónomo
(IGNIS CODE) o un hábitat modular (UNICOS). El de motores no fue una picadora: fue tracción
rural (AVOCADO).

## Hallazgos, por gravedad

### 1. CRÍTICO — R01 Op02: la picadora de maíz no es un electrodoméstico

**Ubicación:** R01, Opción 02, narrativa de apertura.
**Qué pasa:** el reto habla de lavadoras, microondas, licuadoras, caminadoras, bombas y
herramientas; la escena abre con «una picadora de maíz pierde su motor». La picadora es la
máquina que recibe el motor, no el objeto del reto. La escena viene heredada de «Abono de
Mercado» en `research/soluciones_actuales.json`, no del enunciado.
**Qué hacer:** abrir con el electrodoméstico y su dueño; la picadora aparece después como uso
final, justificada. Si el objeto de la escena no está en la lista del enunciado, no es ese reto.

### 2. CRÍTICO — R02 Op01: un teléfono para una grieta que tarda años

**Ubicación:** R02, Opción 01, «Vigía de Talud».
**Qué pasa:** la grieta evoluciona en años y la municipalidad no repara; no hay decisión con
plazo ni umbral que cambie algo. Un teléfono con acelerómetro no es el instrumento: un ESP32
con inclinómetro o un fisurómetro de acrílico cuesta menos y mide mejor. El dato no tiene
decisor.
**Qué hacer:** elegir un riesgo con ventana corta (inundación, deslizamiento, alerta
comunitaria) y un decisor con umbral y plazo; si se insiste en la grieta, usar lectura física
barata y brigada, no teléfono.

### 3. CRÍTICO — R04 Op01 y R06 Op02: suscripción y alquiler no son producto

**Ubicación:** R04 Opción 01, «Suscripción de Astilla»; R06 Opción 02, «Trineo Filtrante».
**Qué pasa:** el ingreso principal es una cuota mensual o un alquiler por día. El cliente no se
lleva un artefacto; el modelo depende de captar suscriptores y de alquilar la chipeadora de
otro. Es el «servicio» que la skill prohíbe, con otro nombre.
**Qué hacer:** vender la chipeadora, la astilla o el carbón por unidad; o vender el trineo, no
alquilarlo. Si la respuesta a «¿qué se lleva el cliente cuando paga?» es «una cuota» o «un
acceso», no es solución.

### 4. CRÍTICO — «Quién paga» sin línea, contrato ni mantenimiento

**Ubicación:** R05 Op01 («guardia con pago simbólico»), R09 Op01 («jefe de manzana sin sueldo»),
R06 Op01 («junta compra entre familias»).
**Qué pasa:** ninguno de esos pagadores tiene partida, contrato ni responsable de mantenimiento.
La comunidad no es una línea presupuestaria. El día 400 la operación se cae.
**Qué hacer:** nombrar institución o empresa, partida o ingreso, cargo que firma, bien que
recibe y quién mantiene. Si no hay firma, no hay venta.

### 5. IMPORTANTE — «Ya existe» contra espantapájaros

**Ubicación:** R01, R05, R07, R08.
**Qué pasa:** los sustitutos son un multímetro, una regla pintada, una carretilla o un cuaderno.
El sustituto más fuerte es un banco de pruebas comercial, un servicio de monitoreo estructural,
un servicio municipal de chipeado o un probador de paneles. La diferencia queda en «más barato»
o «sin red», que no es capacidad.
**Qué hacer:** nombrar el sustituto más fuerte con precio y proveedor; exigir una capacidad
distinta (mide lo que el otro no, funciona donde el otro no, produce lo que el otro no).

### 6. IMPORTANTE — Precedentes repetidos y fuera de mecanismo

**Ubicación:** R01/R02/R05/R06/R09 citan Techriders; R04/R07/R08 citan Mentes Volcánicas;
R02/R06/R09 citan Ingeniarte. R03 cita BioInnova/STEM Synergy, no IGNIS CODE/UNICOS. R04 cita
paneles de Tetra Pak para poda.
**Qué pasa:** el precedente se usa como adorno de «innovación», no como prueba de mecanismo. El
mismo caso no puede sostener cinco retos distintos. En polinizadores, el precedente correcto es
el refugio autónomo (IGNIS CODE) o el hábitat modular (UNICOS), no un huerto vertical.
**Qué hacer:** precedente con mecanismo equivalente, máximo dos usos por dossier; si el caso es
de otro sector, no sirve. Para R04, un caso de pirólisis o biochar.

### 7. IMPORTANTE — Factibilidad no probada

**Ubicación:** R02 Op01 (acelerómetro de celular para grieta), R02 Op02 (micrófono de celular
para fuga), R07 Op02 (aceite de cocina como lubricante de cadena), R06 Op01 (bomba de diafragma
con piedras), R04 Op02 (retorta de tambor «sin humo negro»), R07 Op01 (depósito de 200 L por
USD 4).
**Qué pasa:** son supuestos físicos, no prototipos. La resolución del instrumento, la
calibración, el modo de falla y el mantenimiento no están escritos. «Por validar» reconoce el
riesgo, pero no lo convierte en puerta.
**Qué hacer:** ficha de factibilidad (variable, instrumento, resolución, calibración, falla,
quién repara) y prueba de mesa en una semana; si no se puede probar, no es prototipo.

### 8. IMPORTANTE — Costos sin suma

**Ubicación:** las 18 opciones.
**Qué pasa:** todos los costos son «estimación propia»; ninguno tiene componentes × cantidad ×
precio; algunos totales no cuadran (garrafa de 5 L + depósito de 200 L por USD 4). No hay URL
ni fecha de cotización.
**Qué hacer:** tabla bottom-up, suma = total, fuente o cotización con fecha, rubro dominante
marcado; la estimación se marca en el rubro, no en todo el bloque.

### 9. IMPORTANTE — Categoría inventada

**Ubicación:** R01–R05, R07, R09 como «Impacto Social»; R06 y R08 como «Innovación».
**Qué pasa:** el set de nueve retos no trae categoría. Se asigna por intuición, no por la
definición de la rúbrica.
**Qué hacer:** justificar con la definición del certamen y el criterio cumplido, o dejar «sin
categoría» si el certamen no la pide.

### 10. IMPORTANTE — El validador validó la forma, no el fondo

**Ubicación:** `_make_json.py`.
**Qué pasa:** revisa 150–250 palabras, cuatro pasos, jerga, componentes y costo en USD. No
revisa encaje, bucle de decisión, estado del arte, precedente, factibilidad, pagador ni
herencia. Por eso el PDF pasó con nueve opciones inservibles.
**Qué hacer:** compuerta de contenido antes de maquetar; el validador de forma no es un aval.

## Las 18 opciones, una por una

| Reto | Opción | Veredicto | Razón |
|---|---|---|---|
| R01 | Banco de Prueba de Motor | Pasa con reparación | Producto real; precedente AVOCADO no es el mismo mecanismo; categoría y costo por rehacer. |
| R01 | Kit de Acople a Máquina | **No pasa** | La escena abre con picadora de maíz, fuera del enunciado; hereda «Abono de Mercado». |
| R02 | Vigía de Talud | **No pasa** | Grieta de años, municipio que no repara, sin decisor; teléfono mal instrumento. |
| R02 | Oído de Tubería | **No pasa** | Micrófono de celular no es sensor de contacto; sin calibración; precedente y costo. |
| R03 | Caja de Abejas Nativas | Pasa con reparación | Producto y pagador; precedente equivocado (IGNIS CODE/UNICOS) y diferenciación débil frente al refugio autónomo. |
| R03 | Mezcla de Cobertura Florida | Pasa con reparación | Producto y pagador; precedente SEMILLITAS; falta evidencia de floración y costo. |
| R04 | Suscripción de Astilla | **No pasa** | Cuota mensual + chipeadora alquilada; no hay artefacto que el cliente se lleve. |
| R04 | Horno de Retorta | Pasa con reparación | Producto y pagador; precedente de pirólisis; emisiones y costo por probar. |
| R05 | Regla de Nivel | **No pasa** | Guardia con pago simbólico; sin partida ni mantenimiento. |
| R05 | Compuerta de Flotador | Pasa con reparación | Producto pasivo; pagador municipal; precedente y costo por rehacer. |
| R06 | Bomba de Pedal | Pasa con reparación | Producto; pagador junta/alcaldía con línea; válvulas y precedente por probar. |
| R06 | Trineo Filtrante | **No pasa** | Alquiler por día; no hay producto que se venda. |
| R07 | Garrafa con Depósito | **No pasa** | Costo imposible (USD 4 por garrafa + depósito 200 L) y comisión por litro; precedente. |
| R07 | Aceite para Cadena | **No pasa** | Aceite de cocina usado como lubricante: acidez/polimerización; estado del arte. |
| R08 | Probador Bajo Sol | Pasa con reparación | Producto; precedente; costo y capacidad por probar. |
| R08 | Panel de Segunda Vida | Pasa con reparación | Producto con garantía; precedente; costo. |
| R09 | Tablero de Manzana | **No pasa** | Jefe sin sueldo; precedente; pagador. |
| R09 | Talonario de Vales | Pasa con reparación | Artefacto físico de control; pagador y precedente por rehacer. |

**Resultado:** 9 de 18 no pasan; las otras 9 pasan solo con reparaciones. Ninguna está lista
para entregar.

## La única recomendación

No entregues este PDF. La primera cosa que cambiaría es **R04 Op01**: una suscripción como
solución base es exactamente lo que un jurado desarma en la primera pregunta. La segunda es
**R02 Op01**: un teléfono para una grieta que nadie va a reparar no cambia ninguna decisión.
Sin esas dos, el resto sigue siendo un catálogo de ideas, no un dossier de soluciones.
