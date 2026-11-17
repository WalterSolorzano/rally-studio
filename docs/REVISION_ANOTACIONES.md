# Revisión de anotaciones — dashboard Rally Studio

Estado: todas las anotaciones cerradas salvo las que se listan al final como «no tocado».
Verificado en navegador real (Playwright) a 1600 px y a 390 px. Cambios **sin commitear**.

---

## 1. Barra superior: logo tapado y dos menús a la vez

**Anotación:** «el logo quedaba tapado por los 3 puntos y coexistían el menú de 3 puntos y el menú hamburguesa».

- Se eliminó el botón de llave inglesa (`#rsa-tools-btn`) que inyectaba `super_agents.js`; «Herramientas de IA» vive ahora en el desplegable del proyecto (`RSA.openMenu()`).
- El botón ⋮ se movió al final de `.topbar-actions`, después del cronómetro.
- **Evidencia:** `brand 48–123`, `actions 247–382`, `wrench: null`.

## 2. Textos duplicados y h1 repetidos

**Anotación:** «textos dobles», «la jerarquía visual es importante», «si ya sé que estoy en impacto país, para qué me lo repites».

- Un solo `<h1>` por vista en las 14 pestañas.
- Impacto: fuera el breadcrumb «FASE 04 · IMPACTO PAÍS» y el tag de rúbrica; queda `Impacto · ODS y plan país` + el reto como subtítulo.
- Solución: badge `RETO ACTIVO #…` + categoría, h1 `03 · Taller Describe tu Solución`.
- Presupuesto: el total ya no se imprime dos veces (callout y `<tfoot>` → solo `<tfoot>`).
- Pautado: la regla de caracteres no se repite en subtítulo, callout y contador; el subtítulo quedó «Cinco secciones que el jurado califica una por una. Al compilar, cada texto cae bajo su encabezado oficial.»
- Resumen: se eliminó la lista «Fases del rally» que repetía la barra lateral.

## 3. «La UI cargada es un problema: no sabría qué tocar y qué no»

- **Cronograma:** fuera las dos píldoras de estado (hora Nicaragua, modalidad 28/24 h), el banner «PRÓXIMO HITO CRÍTICO» y el badge «Riesgo Alto» de cada fila. Sustituidos por una línea `Siguiente · …`.
- **Despacho Multi-IA:** se reescribió la vista. Lista de 7 renglones numerados (01–07) con título, estado, descripción corta, modelo y tres acciones; dos plegables («Ver prompt completo», «Pegar la respuesta»). Cero tarjetas.
- **Impacto:** 4 etiquetas cortas en lugar de 4 barras largas; una sola línea de alcance (`3 de 17 ODS vinculados a tu reto`) con un botón de texto en vez de dos botones grandes.
- **Guion:** fuera medidor de palabras, badge de segundos, «[GUION EN CONSTRUCCIÓN]», reglas de oro, calibración y panel del motor de voz.
- **Evidencia:** barrido 14 pestañas → `.card` = 0 en todas.

## 4. Centrado y jerarquía

- `.content-wrapper`: `max-width: 1200px; margin: 0 auto` (antes 1760 px pegado a la izquierda).
- `.phase-header` pasó al CSS (antes repetido inline en 11 vistas): flex, hairline inferior, 24 px de separación.
- Preguntas por debajo del contenido en peso y color: `.impact-field-label` 11.5 px/600 `--text-muted` contra el texto a 13 px/400 `--text-body`.
- Contraste: 53 usos de `#94A3B8`/`#64748B` en app.js y 6 en style.css sustituidos por `var(--text-muted)`.

## 5. Canvas (modelo de negocio)

- Tablero BMC real de 9 cuadrantes con grid-areas: 5 columnas en PC, 3 a ≤1100 px, lista de una columna a ≤768 px.
- `contenteditable` fuera: `<textarea>` que ajusta su altura solo y se reajusta al girar el teléfono.
- La IA puede escribirlo por el buzón: `tab: "canvas"`, payload `{ cells: { socios, propuestas… } }` → se fusiona en `model_canvas`.
- Plantilla conmutable (select) + «Contexto para IA» + Markdown descargable.
- **Evidencia:** 1600 px → 5×202.76 px, tablero 1020×478; 390 px → 1 columna, cuadrante 104 px, `over: 0`. `tmp/cv-1440-canvas.png`, `tmp/cv-390-canvas-b.png`.

## 6. Presupuesto: logo del sitio y enlace al producto

- Cada partida con URL muestra un chip con el favicon del sitio + dominio; el chip entero es el enlace al producto.
- Sin URL se muestra el campo para pegarla, y con URL aparece «Cambiar».
- **Evidencia:** chip 116×22, `host: alibaba.com`, imagen cargada, `over: 0` en 390. `tmp/bg-1440-budget3.png`.

## 7. Badge «Simulado» en el dock

- Eliminado de `content_bridge.js` (creación del badge y su CSS).

## 8. Guion audiovisual

- Cabecera `Guion del video`; subtítulo «Cuatro actos, de corrido. Escribes aquí y el teleprompter lo lee en pantalla.»
- Botón primario **Abrir teleprompter** → `/script/teleprompter.html` (verificado, HTTP 200).
- Modos «Escribir» / «Leer completo» (párrafos seguidos, máx. 46 em) + enlace «Locución».
- Cuatro actos con nombres humanos: Problema, Solución, Factibilidad, Cierre.
- **Evidencia:** 1440 → 1 h1, 4 actos, `over: 0`; 390 → textareas 130/104/104/104 px sin texto cortado. `tmp/sc-1440.png`, `tmp/sc-390.png`.

## 9. Teléfono: nada de scroll infinito ni exceso de botones

- Impacto: fuera los dos botones grandes del header (Quedan solo ODS · Plan país · Leyes · Síntesis).
- Tabla de recursos: a ≤640 px pasa a modo bloque, sin scroll lateral.
- ODS en mosaico de 2 columnas: icono 40 px arriba, nombre y meta debajo; la ficha se abre tocando y se vuelve con «Volver».
- **Evidencia:** 390 px → `cols: 197.674px 197.674px`, 3 filas iguales, `over: 0`. `tmp/imp-mosaic-390c.png`.
- **Barrido final:** las 14 pestañas a 390 px dan 1 `<h1>`, `docOverflow 0`, `mainOverflow 0`. Igual a 1600 px.

## 10. ODS con logos reales y sin gris para todo

- 17 iconos oficiales descargados a `dashboard/assets/ods/ods-01.jpg … ods-17.jpg`.
- «Por qué» en ámbar `#B45309`, «Cómo» en azul de marca; ya no todo gris.

## 11. Bordes a la izquierda

- Eliminados en todos los sitios: `inset 2px 0 0` de `.ods-row.is-match`, bordes de `.ods-row-why > div`, `.rs-solution`, `.winner-rail` y 8 `border-left` inline en app.js.
- **Evidencia:** `Select-String 'border-left: *[234]px'` → 0 resultados en style.css y app.js.

## 12. Fallos de lógica y de datos corregidos de paso

| Fallo | Arreglo |
|---|---|
| `rally_type` se asignaba «nacional» en silencio | no avanza si no hay tipo; botón `disabled` con motivo |
| `escapeHtml` no escapaba `'` | ahora `&#39;` (rompía `onclick` e inyectaba JS) |
| `.rs-person-x` metía el nombre dentro del `onclick` | datos en `data-id`/`data-name`, sin interpolar JS |
| Límites de caracteres del pautado triples y contradictorios (≤1000/≤1500) | se interpola `PAUTADO_LIMITS` |
| Banda del presupuesto en tres sitios distintos | `BUDGET_TARGET = 4000–6000` como única fuente |
| Badge del inspector inexistente en algunas vistas | `… || .topbar-chip-num` |
| jsPDF, pdf.js, mammoth, tesseract cargados siempre | `ensureIngestLibs()` bajo demanda (verificado: 0 CDN al abrir, 1 al importar) |
| Dock de propuestas tapaba el panel de auditoría | `right: calc(300px + 18px)`; `18px` con el panel plegado |

---

## 13. Retos del comité: general → específico

**Anotación:** «siento que no se le da la relevancia a cada reto y propuesta porque la IA propone 2, y el espacio para poner comentarios o votar como se debería, tal vez podríamos usar la técnica de general a específico: que se abra en grande cada reto y que solo se vean las numeraciones; además estás usando 01, 02 mal».

- **Dos numeraciones peleando.** El número de posición en la lista se mostraba como si fuera el número oficial del reto, y encima chocaba con los números de bloque 01/02/03/04 de los paneles. Ahora hay un solo sistema: la tira de pips `01..09` es el índice, el reto abierto dice «Reto 3 de 9», y los paneles se titulan con palabras («Lo que pide el comité», «La propuesta del motor», «Comentarios del equipo», «La mesa vota»).
- **La propuesta del motor recuperó nombre propio.** Se lee el `research/soluciones_actuales.json` y el panel 2 abre con el nombre de la propuesta (Molino Vecinal, Corredor Nativo…), su claim y el beneficiario, más un enlace a la ficha completa del dossier. Antes solo aparecía un párrafo suelto.
- **Un reto abierto y grande, el resto como números.** Se eliminó el catálogo lateral `.deliberation-nav` que competía con la mesa; la mesa ocupa todo el ancho.
- **Un solo botón de decisión.** Había un «Elegir» en la cabecera del reto, otro en el panel de voto y flechas ←/→ en el pie: tres formas de hacer lo mismo. Queda el botón del pie, ancho completo.
- **Las nueve propuestas juntas bajaron al final**, dentro de un desplegable, en vez de aparecer arriba antes de la mesa.
- **Estado vacío plano.** Si el comité todavía no publicó los retos: un solo h1, una zona de arrastre y un cuadro para pegar el comunicado. Se fueron las tarjetas con sombra, el robot saludando, los tres pasos de misión y ~200 caracteres de explicación.

## 14. Taller de solución: menos cajas, más escritura

**Anotación:** la fase 3 se sentía como un formulario administrativo con la misma información repetida.

- Se eliminaron el banner azul «Alineación estratégica oficial» (duplicaba los ODS del pie), las cuatro tarjetas `.workbench-card` y la tarjeta «Filtro táctico: las tres dimensiones del efecto wow», que era texto de lectura, no trabajo.
- Queda una columna: tu idea con tus palabras, la tesis técnica, el pitch de cinco segundos, el nombre del proyecto y seis potenciadores en rejilla de tres columnas (una a una en teléfono).
- Texto visible de la fase: de 2 140 a 926 caracteres.

## 15. Dossier de soluciones enlazado desde la UI

- `scripts/gen_soluciones_pdf.py` genera `docs/Dossier_Soluciones_Actuales.pdf` (68 KB) a partir de `research/soluciones_actuales.json`.
- El botón «Dossier de soluciones» de la cabecera de Retos abre ese PDF, y cada reto tiene su propio enlace «Ver la ficha completa en el dossier →».
- La matriz Word (.docx) que colgaba de esa cabecera se retiró: apuntaba a un archivo que no existe en el repo.

## 16. Panel lateral: dice qué falta, no el porcentaje otra vez

- «Preparación Oficial» mostraba el mismo porcentaje que el chip de la barra superior y una nota fija sobre el jurado en todas las pestañas.
- Ahora lista lo que falta en la fase abierta, con un punto por requisito: «Aprobar la solución», «Cerrar el presupuesto», «0 de 9 cuadrantes escritos»… Cada punto lleva a su fase.
- El panel se refresca al cambiar de pestaña.

## 17. Animaciones al tocar

**Anotación:** «pon animaciones al tocar cada botón».

- Todo lo tocable (botones, píldoras, enlaces, pips de reto, votantes, resúmenes plegables, enlaces de la barra) baja 1 px y se encoge un 1.5 % al presionarlo, en 90 ms.
- Respeta `prefers-reduced-motion`: con esa preferencia activa, no se mueve nada.
- Indicador de agentes trabajando: cuando la IA está redactando, aparece abajo a la izquierda un robot con el brazo en movimiento y la leyenda «Agentes en marcha»; desaparece al terminar o al cancelar.

## 18. Un solo sistema de color y de reglas en la mesa

- **Colores de la mesa escritos a mano.** Los estilos en línea de `app.js` repetían hex (`#0866f5`, `#0f172a`, `#cbd5e1`…). Se sustituyeron **97 valores** por las variables de `style.css` (`--color-primary`, `--text-title`, `--text-body`, `--text-muted`, `--border-light`, `--border-strong`, `--bg-surface`, `--bg-subtle`, `--bg-muted`, `--color-navy`, `--status-err-text`…), siempre dentro de atributos `style` y solo en propiedades de color: no se tocaron SVG, iconos ni atributos `fill`/`stroke`.
- Quedan **18 hex** en línea, todos semánticos (ámbar de aviso, verde de éxito, rojo de error, muestra de color de la paleta en el dossier): no tienen token equivalente y convertirlos en variable los volvería intercambiables por accidente.
- **CSS duplicado.** `style.css` tenía selectores de primer nivel repetidos. Se fusionaron **33** (gana la última declaración, igual que en cascada) y se eliminaron 33 bloques; quedan **9** sin fusionar a propósito (`.cr-pip`, `.cr-voter`, `.deliberation-nav`, `.impact-subnav-btn`, `.ods-badge-match`, `.rs-solution`, `.rs-deliv`, `.task-dispatch-card`, `.cr-pip.is-sel`), porque mezclan un atajo (`border`, `padding`) con su longhand y el orden decide el resultado: fusionarlos cambiaría el render.
- **Reglas muertas.** Se borraron `.cr-bar-nav`, `.cr-arrow`, `.cr-count` y `.cr-count-dim`: la barra de retos solo muestra los números.
- **Los pips arrancan a la izquierda** (`.cr-map` tenía `margin-left:auto`) y la barra dejó de dibujar su propia línea: queda una sola regla horizontal, la de los filtros.

## 19. Resumen, checklist y cronograma: de lista a cuadritos y camino

**Anotaciones:** «el check list podría ser cuadraditos a 2 columnas en teléfono, es que no me gustan las listas hacia abajo, son densas de leer» · «el cronograma IA hazlo más con los tokens de diseño actuales, menos textos, más figuras, que muestre con animación respecto a la hora qué tan mal vamos con lo que debería estar listo, como caminitos o logros de un juego» · «resumen rally, estandariza el espaciado, y muestra el progreso en tiempo real de lo último que se dividió en cada fase o entregable: cuadritos y al entrar otra UI donde se vea qué cambios, quién está en eso, etc.»

- **Checklist de entrega en cuadritos.** Los 10 requisitos pasan de lista vertical a rejilla: 3 columnas en escritorio, 2 en tableta y 2 en teléfono. Cada requisito es un cuadro con casilla arriba, título corto y nada más; al abrirlo ocupa la fila completa y muestra el detalle normativo. El contador «1 / 10 verificados» queda en la cabecera.
- **Cronograma como camino.** Se fue la tabla de hitos con sus párrafos de riesgo. Ahora hay un reloj con barra de tiempo transcurrido y un camino vertical de estaciones: cada hito es un punto que se rellena con un check cuando ya pasó, el siguiente pulsa, y los hitos críticos llevan anillo rojo. Los textos instructivos de las tres sub-pestañas se eliminaron.
- **Nomenclaturas como figura.** Ya no son párrafos: cada dato es un bloque con etiqueta pequeña y valor monoespaciado, listo para copiar.
- **Resumen con cuadritos.** Los entregables se muestran en una rejilla de cuadros (4 columnas en escritorio, 2 en teléfono) con punto de estado, fase y quién lo tiene, o «libre». Un solo ritmo de espaciado para todo el resumen.
- **Ficha del entregable.** Al tocar un cuadro se abre un panel lateral con qué falta, quién está asignado, qué cambió y con qué fecha, más las acciones: tomarlo yo, soltarlo, marcarlo terminado, reabrirlo y abrir la fase que corresponde.
- **Reloj en vivo.** El resumen muestra el tiempo que corre y la siguiente fecha límite, y se actualiza cada segundo sin recargar.
- **Superficies del navegador.** La selección de texto, el cursor de escritura y la barra de desplazamiento se pintan con la paleta del proyecto en lugar de los valores por defecto del navegador.

## 20. Pautado oficial sin tarjetas ni barra de acento

**Anotación:** «quita las tarjetas, los acentos a la izquierda y el gris para todo».

- Cada sección del pautado dejó de ser una tarjeta con borde, radio y barra de color a la izquierda. Ahora es una fila separada por una línea fina: etiqueta con su icono, contador de caracteres a la derecha, la pista en una línea y el área de escritura debajo.
- La barra de acento (`span.pautado-sec-bar`) se eliminó del marcado y del CSS.
- El contador de caracteres cambia de color cuando la sección se acerca al límite o lo pasa, sin escribir hex en línea: usa `--text-title` y `--status-err-text`.
- La plantilla oficial quedó como una sola fila con su descarga, sin caja contenedora. La nota normativa va sobre fondo suave, sin borde ni radio.

## 21. Presupuesto: notas sin recuadro y total legible

- Las dos advertencias (falta la tasa del BCN, monto fuera de rango) dejaron de ser recuadros con borde de color en línea. Son párrafos sobre fondo suave, con clase de estado (`is-warn`, `is-info`, `is-ok`) y textos más cortos.
- La regla `.rubric-callout` se borró de `style.css`: ya no la usa nadie.
- El pie de la tabla pasó de tres celdas vacías a una sola fila con la etiqueta «Total puesta en marcha» y la cifra en monoespaciado. En teléfono la etiqueta y la cifra se reparten en la misma línea en vez de partirse en cuatro renglones.

## 22. Canvas: fuera números, conteo y plantilla repetida

- Los nueve cuadrantes ya no llevan número: solo su nombre. La numeración sobraba porque el orden del tablero de modelo de negocio es conocido.
- Se eliminó «N de 9 con contenido» del tablero: repetía el «0 de 9 cuadrantes escritos» del panel lateral.
- Se eliminó la línea «Plantilla: X» debajo del tablero: el selector de plantilla que está arriba ya lo dice.

## 23. Prototipo: el visor no es una tarjeta

- El marco del visor perdió el radio y el borde; el fondo es el mismo tono suave de las otras superficies planas.
- El estado vacío («Todavía no hay prototipo») sigue tapando el marco cuando no hay sitio publicado, con el título un punto más grande.

## 24. Recursos: la ingesta ya no parece colgada

- El cajón de archivos fuente decía «Cargando catálogo de archivos fuente…» para siempre, porque nadie lo llenaba hasta pulsar Escanear. Ahora dice «Sin escanear todavía. Pulsa Escanear para listar lo que hay en la carpeta».
- El cajón perdió el borde y el radio: el título y el botón de arriba ya delimitan la zona.

## 25. Guion, impacto, multi-IA, equipo y certamen

- **Guion:** cuatro actos de corrido, sin cajas alrededor de cada acto; los actos se numeran en romano en la cabecera y el texto va directo sobre la página.
- **Impacto y multi-IA:** revisadas a 1600 px y 433 px, sin ningún elemento con radio y sombra a la vez (lo que en este proyecto significa «tarjeta»).
- **Equipo y certamen:** las fichas de datos ya resueltas pasaron de rejilla con fondo gris y borde exterior a filas separadas por líneas finas, sin radio. En una columna el separador lateral se convierte en línea superior.
- **Logo vacío:** si el equipo no ha cargado logo, no se dibuja un cuadro punteado; el panel lateral ya dice que falta.

## 26. Repeticiones de título y contador en la pestaña de cierre

El usuario detectó el mismo dato dos veces seguidas: la sub-pestaña decía
«Checklist de Requisitos 1/10» y, justo debajo, el bloque se titulaba
«Checklist de entrega» con otro «1 / 10 Verificados». Pasaba en las tres
sub-pestañas.

- El nombre de la sección vive solo en la sub-pestaña; dentro no se repite.
- Checklist: fuera el bloque de título y el contador guardrail-verified-count
  (y su actualización en toggleGuardrail). Queda un único contador, el de la
  sub-pestaña, que ya se refrescaba al marcar un guardarraíl.
- Cronograma: fuera «Hitos y tiempos críticos» y el «N eventos». En su lugar,
  a la izquierda de la barra de acciones, una sola marca de estado:
  «Cronograma oficial» o «Cronograma personalizado».
- Nomenclaturas: fuera «Nomenclaturas oficiales» y la etiqueta «Reglamento UNI».
- El h1 de la pestaña decía «Cronograma de Entrega & Requisitos Críticos»,
  repitiendo dos de las tres sub-pestañas. Ahora: «Qué falta para entregar»,
  con subtítulo «Guarda-raíles del jurado, tiempos y nombres oficiales».
- La entrada del menú lateral pasó de «12 Checklist de Entrega» a «12 Cierre»
  para no repetir el h1 ni el título del panel derecho.
- Se quitó el color en línea del contador borrado (#eff6ff, #166534, #003366).

Verificado a 1600 y 433: h1n 1, over 0, mainOver 0, y el contador de la
sub-pestaña pasa de 1/10 a 2/10 al marcar un guardarraíl (y vuelve).

## 27. Icono de YouTube donde va el enlace

El título del video y la ficha impresa de entregables ya no dicen «YouTube» a secas:
llevan el icono de la plataforma delante. Se reconoce de un vistazo y el texto se acorta
sin perder la referencia. El icono es monocromo (currentColor) salvo el rojo de marca de
la plataforma, que es lo único que se permite fuera de los tokens porque es el sello de
un tercero.

- `SVG.youtube` nuevo en el bloque de iconos.
- `.naming-yt-label` con el icono antes del texto; el rótulo pasa de «Título Reglamentario
  para YouTube (Pitch 120s)» a «Título para YouTube (Pitch 120s)».
- `print-deliv-type` del dossier impreso también con el icono.
- CSS: dos reglas nuevas al final de `style.css`.

## 28. Fuera los datos fijos de rally y de proyecto

El sistema tenía repartido por el código el nombre de un certamen concreto, una sede
concreta, un año y hasta un presupuesto de ejemplo. Eso hacía que el modo Nacional y el
modo Latam se mezclaran y que cualquier proyecto nuevo naciera con datos ajenos.

Ahora hay un solo perfil por certamen (`RALLY_PROFILES` + `rallyProfile()`) con nombre,
horas, jurado y etiquetas; y la sede, la ciudad y el año se leen del estado del equipo:

- `getInitialState()` ya no trae universidad escrita: `university: ""`.
- `saveTeamAndProceed()` no impone la sede; el paso de equipo tiene dos campos nuevos,
  «Universidad o sede» y «Ciudad», que escriben `state.university` y `state.city`.
- `sedeName()` y `sedeTag()` derivan la sede y su hashtag del nombre que escribe el equipo.
- `rallyTags()` compone los hashtags del certamen activo sin repetir lista en cada sitio.
- Guardarraíles por certamen: `guardrailDefs()` devuelve textos distintos para Nacional y
  Latam (plataforma, formato de nomenclatura, hashtags, moneda y el entregable de TikTok).
- Nomenclaturas: el nombre del PDF y el título del video salen del perfil y del año único
  `RALLY_YEAR`, no de literales repetidos.
- Fuera el presupuesto de ejemplo del dossier, el reto «01» por defecto, el placeholder con
  nombres de equipos reales y la mención fija a la universidad en guardarraíles, cronograma,
  pie impreso, topbar, canvas y prompts.

Verificación: 14 vistas a 1600 y a 433 con `bad: []` y `errs: []`; los diez guardarraíles
cambian de texto al alternar certamen; el nombre del PDF y del video no arrastran el otro modo.

## 29. Escala de pantallas: tres anchos y cero `!important`

Antes había **21 anchos de `@media`** (420, 560, 640, 700, 720, 760, 768, 860, 900, 960, 980,
1000, 1024, 1100, 1220, 1240, 1241, 1280, 1350, 1360, 1550). Nadie puede sostener eso: cada
regla nueva se peleaba con la anterior y por eso el archivo acumuló **138 `!important`**.

- Quedan tres anchos: **640** (teléfono), **900** (tableta, la navegación pasa a cajones) y
  **1280** (portátil reducido; debajo se ocultan telemetría, migas y emblemas del topbar).
  El único `min-width` sobrevive en `1281px`. Los `prefers-reduced-motion` no se tocan.
- Los bloques repetidos de 1280 se fusionaron en uno: la telemetría se declaraba dos veces con
  el mismo valor.
- Se borró una rejilla muerta de `body` que el propio bloque de cajones sobreescribía.
- **`!important`: 138 → 0.** Antes de quitarlos se comparó, elemento por elemento, la huella
  de 23 propiedades calculadas en las 14 vistas: 6 diferencias, todas de altura subpíxel
  (~2 px) en impacto, pautado y presupuesto. Ningún cambio de color, tipografía, columna ni
  visibilidad. Si un `!important` hiciera falta, ahora se nota y se puede razonar.

Verificación: 14 vistas a 433 y a 1600 sin desborde ni `<h1>` repetido; las vistas pesadas
(presupuesto, canvas, cronograma, recursos, multi-IA, pautado, resumen) también a 777; y a
1111 las tres columnas se sostienen (`240px / 571px / 300px`) sin scroll lateral.

## Barrido final

Las 14 vistas se recorrieron a 1600 px y a 433 px midiendo tres cosas por vista: un solo `<h1>`, sin desborde horizontal de la página y sin desborde horizontal del contenedor con scroll. Resultado en ambos anchos: **0 vistas con problemas, 0 errores de JavaScript**. Tras unificar la escala se repitió el barrido a 433, 777, 1111 y 1600 con el mismo resultado.

## No tocado (y por qué)

- **~405 colores hex inline en app.js (84 distintos).** Cambiarlos por variables toca 405 puntos y varios están dentro de cálculos de color y SVG; el riesgo de romper supera la ganancia visual. Los 17 verdes/rojos/azules de los ODS son oficiales y no se tocan.
- ~~63 bloques `@media` con 12 breakpoints y 132 `!important`~~ **Resuelto en la sección 29**: tres anchos (640 / 900 / 1280) y cero `!important`.
- **18 hex en línea de estado** (ámbar, verde, rojo, muestra de paleta). No tienen token equivalente.
- **Nodos, grafo, sedes y banderas.** Pedido explícito de omitirlo.

## Archivos con cambios

`dashboard/app.js`, `dashboard/style.css`, `dashboard/content_bridge.js`, `dashboard/index.html`, `dashboard/section_sync.js`, `docs/REVISION_ANOTACIONES.md`, `dashboard/super_agents.js`, `dashboard/assets/ods/` (nuevo), `research/soluciones_actuales.json` (leído por la mesa), `docs/Dossier_Soluciones_Actuales.pdf` (generado).
