---
name: dossier-soluciones
description: Convierte los retos del comité o del usuario en soluciones sustentadas y un dossier de 3 páginas por reto (PDF, Word, Excel), con precedentes ganadores y razonamiento problema-causa-insight-solución-métrica.
---

# Labia Interna — Dossier de soluciones

Este sistema **no crea retos**: los entrega el usuario o el comité. Sin retos no hay dossier.

## Regla dura: el diseño del PDF ya está decidido

**Se usa el diseño que ya tenemos. No se inventa otro.** El dossier se maqueta siempre con
`scripts/gen_dossier.py` sobre el JSON de contenido, y el resultado debe coincidir con el
PDF de referencia aprobado (`Soluciones_Prueba_09_Retos.pdf`, o el que indique el usuario).

- Prohibido escribir CSS propio, plantillas propias, portadas nuevas o «una versión mejorada
  del diseño».
- Prohibido cambiar márgenes, tipografías, colores, rejillas o el orden de las secciones para
  esta entrega concreta.
- Si el texto nuevo no entra en el diseño, se recorta el texto; nunca se rediseña la página.
- Antes de dar el PDF por terminado: abrir la referencia y el PDF generado, comparar página
  por página, y renderizar a PNG. Si la anatomía no calza, el entregable está mal aunque el
  contenido sea bueno.

## Cuándo usarla

- Hay retos y el equipo pide ideas o un dossier PDF para deliberar.
- Hay que reformular una solución existente con otro mecanismo.

## Modo según certamen

| | Nacional (24 h) | Latam (28 h) |
|---|---|---|
| Territorio | municipio nicaragüense nombrado | laboratorio piloto, replicable en la región |
| Moneda | C$ con tasa BCN de `brief.json` | USD |
| Marco | PNDH 2022–2026, instituciones nacionales | ODS y estándares internacionales, sin siglas locales |
| Nombre | puede tener arraigo cultural | debe entenderse fuera del país |
| Cierre | beneficio nacional | «piloto en [ciudad], replicable en América Latina» |

No se mezclan los dos modos. Sin `rally_type` en `brief.json`, se pregunta antes de generar.

## Compuerta de contenido: nueve campos antes de escribir

Esta compuerta se corre **por opción**, antes de redactar. Si un campo no se llena con una
frase concreta, la opción no entra: no se maquilla después con la narrativa. La tabla de
trabajo se guarda junto al JSON; el PDF solo muestra la versión limpia.

| # | Campo | Se escribe así | Se rechaza si… |
|---|---|---|---|
| 1 | **Encaje literal** | «El reto nombra: [lista literal del enunciado]. Esta opción atiende a [actor] con [objeto de esa lista]. El mecanismo funciona para [3 casos de la lista] o se justifica el subconjunto.» | el actor u objeto no está en el enunciado; la escena abre con un objeto que el reto no nombra; el mecanismo solo funciona para un caso. |
| 2 | **Bucle de decisión** | «La decisión es [X]; la toma [quién] con el umbral [Y] en [plazo Z]; si no se actúa, pasa [consecuencia].» | no hay decisor, no hay umbral o el plazo no existe. Si el fenómeno tarda años y la decisión se toma en semanas, el sensor no es la solución. |
| 3 | **Estado del arte** | «Hoy la mejor alternativa es [producto/servicio/práctica], cuesta [precio o costo] y se consigue en [lugar o proveedor]. No basta porque [límite concreto]. Esta opción hace [capacidad distinta].» | el sustituto es un armatoste casero o una práctica manual; la diferencia es solo «más barato», «más bonito» o «sin red». |
| 4 | **Precedente equivalente** | «[Equipo, año, puesto] resolvió [mecanismo] con [artefacto]. Esta opción usa el mismo mecanismo: [equivalencia en una frase].» | el caso es de otro mecanismo o de otro sector; el mismo precedente se repite más de dos veces en el dossier. |
| 5 | **Factibilidad** | «Mide [variable] con [instrumento]; resolución [X]; calibración [Y]; falla en [modo]; lo repara [quién].» | la resolución del instrumento es mayor que el fenómeno; el proceso exige una condición que el usuario no puede mantener; no hay prueba de mesa en una semana. |
| 6 | **Costo de abajo hacia arriba** | «[Componente] × [cantidad] × [precio unitario] = [total]. Fuente: [URL o cotización, fecha]. El rubro dominante es [X].» | el total no es la suma; no hay fuente ni fecha; el total es menor que la suma de los componentes listados. |
| 7 | **Pagador con línea** | «Compra [institución/empresa/persona] con [partida/ingreso]; firma [cargo]; recibe [bien]; mantiene [quién].» | el pagador es «la junta», «la comunidad», «el guardia con pago simbólico» o «el jefe sin sueldo»; no hay partida, contrato ni mantenimiento. |
| 8 | **Categoría justificada** | «Categoría [X] porque la rúbrica la define como [definición] y esta solución cumple [criterio].» | se asigna por intuición o por defecto; el set de retos no trae categoría y se inventa una. |
| 9 | **No herencia** | «Esta opción no reutiliza escena, actor, dispositivo, costo, claim ni precedente de un dossier o una versión anterior; si coincide en el tema, se reescribió desde el enunciado.» | el texto conserva una escena u objeto de la versión anterior que el reto no nombra. |

**Cómo se usa.** Se llena la tabla para las dos opciones de cada reto. Una sola celda
«rechaza» elimina la opción: se genera otra, no se baja el estándar. Las tablas se guardan en
`docs/_build/compuerta_<certamen>.md` o junto al JSON del dossier. Sin esa tabla no se corre el
generador del PDF.

## Cómo se razona una solución

La cadena obligatoria (problema → causa raíz → insight → solución → métrica) se recorre en
este orden; cada paso descarta lo que no aguanta y afina lo que queda.

**1. Diagnóstico: problema → causa raíz → insight.** Separa síntoma de causa. Nunca
escribas «causa no documentada»: razona el mecanismo y marca toda cifra como «estimación a
validar».

**2. Inventario y descomposición del recurso.** Si el reto trae un recurso o residuo
(motores dañados, poda, plásticos), descríbelo completo antes de idear: cantidad, estado,
componentes, materiales, peso, quién lo genera y cuánto cuesta obtenerlo. Divide el recurso
en sus partes: cada parte puede ser un producto distinto, no una sola idea.

**3. Análisis sistémico antes de idear.** Escribe el sistema del reto: actores (quién lo
sufre, decide, opera y paga), flujos de materia y energía, capacidad instalada,
estacionalidad, normas y quién pierde si funciona. La idea resuelve al menos dos tensiones
a la vez (residuo y costo, desempleo y servicio, dato y decisión). Toda idea debe tener un
beneficiario identificable.

**4. La familia del reto, no el ejemplo cómodo.** Si el reto nombra un conjunto
(«electrodomésticos», «residuos del mercado»), la solución sirve para el conjunto aunque
cambien marca, año o modelo: un mecanismo que **mide y se adapta en el sitio**, o una ruta
de acopio y clasificación. **La escena abre con el objeto o recurso que el enunciado nombra**,
no con la máquina que lo usa después: si el reto habla de un insumo, la escena empieza en ese
insumo; el producto final puede aparecer después, nunca como el objeto del reto. Si el objeto
de la escena no está en la lista, se justifica por escrito por qué pertenece al conjunto; si
no, se descarta.

**5. Primero el banco, después la idea.** `knowledge/retos_razonamiento.json` guarda 20
casos (`id`, `temas`, `year`, `rally`, `categoria`, `equipo`, `puesto`, `problema`,
`causa_raiz`, `insight`, `solucion`, `metrica`, `video_url`). Se busca por **verbo del
mecanismo** («reutilizar», «medir», «trazar», «filtrar») y por `temas`, no por título. Se
aprovechan `insight` y `metrica`; si un campo dice «No documentado en la fuente», se razona
y se marca como estimación. Son **contexto de ganadores**, no estadística: 20 casos, solo
podios, erratas posibles. Antes de citar año, rally, equipo o puesto, contrasta con
`knowledge/ERRATAS.md` y la fuente del repo.

**6. Familias de mecanismos (ayuda de búsqueda, no puerta de entrada).** Sirven para
encontrar el precedente, no para descartar una idea que no encaje:

- **A. Objeto de siempre + instrumentación y control** — Techriders 2024.
- **B. Residuo + componente con especificación** — Mentes Volcánicas 2025, BottleLife 2017.
- **C. Dato + alguien que decide** — SITRACAFE 2026, Steel Innovators 2026.
- **D. Energía integrada a un objeto de uso diario** — LexoStop 2019, Banca Solar 2026.
- **E. Servicio comunitario que reemplaza la compra del objeto** — AVOCADO 2026.
- **F. Accesibilidad y adaptación al usuario** — BidiSign 2026, Geckakz 2016.
- **G. Módulo replicable con ruta de acopio** — STEM Synergy 2025, BioInnova 2023.

Ollnari (Operación Titán, 2025, Nacional, Procesos) es un caso de **C** con plataforma y
sello de origen; se usa como referencia de mecanismo, no como plantilla de texto.

**7. Lo obvio no basta — y una lista cerrada de lo que no es solución.** Nombra las soluciones
típicas —taller que repara y revende, venta como chatarra, donación, reventa, campaña de
concientización— y comprueba que la tuya no sea una de ellas a secas.

**Lista cerrada: esto no entra como opción, ni con otro nombre.**

- **Taller, servicio, mesa de desarme o capacitación** como núcleo. Un taller no se vende en un
  rally y suele existir ya: el electricista que rebobina, el jabonero del mercado, el técnico
  que evalúa paneles.
- **Suscripción, alquiler, arriendo, membresía, comisión por intermediación o pago por uso**
  como ingreso principal. Son modelos de negocio, no productos: el cliente no se lleva un
  artefacto y el ingreso depende de captar usuarios o de alquilar el activo de otro.
- **App, QR o formulario como producto.** Una app puede acompañar, pero no es el artefacto que
  se instala, se vende y se mantiene.
- **Kit sin operador, sensor suelto o certificado/sello/auditoría como núcleo.** Ya están en la
  tabla de banderas; si no hay quien opere, decida o compre, no es solución.
- **Donación, voluntariado o heroísmo.** Si el modelo se rompe cuando cada actor busca su
  interés, está mal.

Cada opción debe ser un **producto, un sistema o una infraestructura con activo propio**: un
objeto que se instala, un stock con garantía, un envase retornable, una obra que se mantiene. La
prueba es física: **¿qué se lleva el cliente cuando paga?** Si la respuesta es «una cuota», «un
acceso» o «una idea», no es producto.

| Racionalización | Por qué no |
|---|---|
| «La suscripción es un modelo con activo propio» | El activo es alquilado o del operador; el cliente no se lleva nada y el ingreso depende de captar suscriptores. |
| «El municipio paga la cuota» | Sigue siendo un servicio; solo vale si compra el artefacto y lo opera. |
| «Es economía circular» | No exime: el producto se vende por unidad o no es producto. |
| «El jurado valora el modelo de negocio» | Valora un artefacto concreto; un modelo no se puede mostrar ni tocar. |
| «El guardia/jefe lo hace por la comunidad» | Sin sueldo o partida no hay operación sostenida; el día 400 falla. |
| «El sensor es barato» | Barato no es útil si nadie decide con el dato. |
| «Ya existe, pero es más barato» | Precio no es capacidad; el sustituto más fuerte sigue ganando. |
| «El precedente es de otro tema, pero innova» | El precedente debe compartir mecanismo, no vibra. |

**Banderas rojas.** Si aparece una, la opción no entra: se puede describir sin nombrar un
objeto que el cliente se lleve; el ingreso principal es una cuota; el pagador es una
organización sin presupuesto; el «ya existe» es una herramienta suelta o una práctica manual; el
mismo precedente aparece en tres retos; la métrica es «personas sensibilizadas»; el costo total
es menor que la suma de los componentes; la escena usa un objeto que el reto no nombra.


**8. Generación divergente antes de converger.** Mínimo 10 ideas por mecanismos distintos,
sin cortar las malas todavía:

- transformar el recurso en un producto nuevo (cambiar su función, no repararlo);
- herramienta de educación gratuita (kits, laboratorios, material de práctica para escuelas sin recursos);
- infraestructura comunitaria básica (agua, energía, alimentos, conectividad);
- medio de ingreso para población vulnerable (microtaller, cooperativa, cadena de producción inclusiva);
- apoyo a personas en situación de riesgo o dependencia (con límites de seguridad; nunca dispositivos médicos sin validación);
- sistema ciberfísico: hardware accesible + software/datos que den valor al territorio o a una política pública;
- modelo que cierra el ciclo: el producto o su operación regenera el recurso o financia su propia recolección.

**9. Cinco pruebas de descarte.** La idea pasa las cinco o se replantea: ¿lo monta mañana
un taller común sin nada nuevo? ¿el insumo varía tanto que no se estandariza? ¿alguien lo
usa a diario y paga? ¿la métrica es física (quintales, litros, vatios, horas, personas)?
¿qué gana quien lo opera y qué pierde el barrio sin él?

**10. Filtro de impacto.** Elimina lo que no pase; cada idea declara:

- beneficiario concreto: quién, cuántos, qué cambia en su vida;
- ODS que atiende y por qué, no por etiqueta;
- economía circular: qué residuo evita, qué material recupera, si el ciclo cierra;
- acceso: gratuito o de bajo costo para quien más lo necesita, con financiamiento sostenible;
- dignidad y participación: la comunidad opera o co-diseña, no solo recibe.

Sin beneficiario identificable, sin ciclo de recursos o sin quien lo financie, se descarta.

**11. Evaluación de las tres mejores (siete lentes).** Técnica (¿se fabrica con lo
disponible?), económica (costos, ingreso, punto de equilibrio simple), financiamiento y
mercado, social (aceptación, quién opera, riesgo de causar daño), ambiental, legal y
seguridad, y escala (¿funciona con 10 unidades y con 1,000?, ¿sirve para toda la familia del
reto o solo para el ejemplo cómodo?).

**12. Banderas de riesgo restantes (con la condición que las resuelve).** No son
prohibiciones: hay ganadores que las tocaron. Cada bandera se escribe junto a su salida.
Las de taller/servicio y donación ya quedaron cerradas en el paso 7.

| Bandera | Se resuelve si… |
|---|---|
| App que conecta oferta y demanda | existe acopio, logística u operador con nombre y costo |
| Capacitación como núcleo | acompaña a un objeto o servicio que funciona sin ella |
| Sensor suelto | alguien decide con el dato y hay plazo para actuar |
| Kit sin operador | quién lo opera y quién cobra está definido |
| Mejora del mismo producto | cambia quién lo usa o quién paga |
| Dependencia de un solo caso | el mecanismo cubre la familia completa del reto |

**Prueba de «ya existe» (obligatoria).** Nombra **el sustituto más fuerte que hoy se
consigue**, no el más primitivo: el producto comercial, el servicio municipal o la práctica
con precio o costo y quién lo provee. Escribe su precio o costo, dónde se consigue y **qué límite concreto** tiene.
Después, en una frase, la **capacidad distinta** de esta idea: mide algo que el sustituto no
mide, funciona en una condición donde el sustituto no funciona, o produce un bien que el
sustituto no entrega. Si la diferencia es «más barato», «más bonito» o «sin red», no alcanza.
Una herramienta suelta o una práctica manual no son el estado del arte: son el punto de
partida del usuario.

**Prueba de la ventana de decisión.** Si el fenómeno tarda años en cambiar (un proceso
estructural, geológico o ambiental lento) y la decisión se toma en semanas, el sensor no es la solución: se reemplaza
por una lectura física barata y una brigada, o se elige otro riesgo del reto con ventana
corta. El dato solo vale si alguien decide algo antes de que sea tarde.


**13. Revisión crítica (tipo sharktank).** Etiqueta cada hallazgo como HECHO o SUPUESTO,
separa fallas de la idea de fallas de implementación, y anota 3–5 puntos que ya aguantan.
La auditoría completa la hace la skill `sharktank`; aquí basta el autoexamen antes de
redactar.

**14. Validación barata.** Para cada finalista, una prueba que se haga en menos de una
semana, con costo estimado, que confirme o tumbe el supuesto más riesgoso.

**15. La prueba del día 400.** ¿El servicio sigue?, ¿quién cambió la pieza gastada y pagó?,
¿qué pasa si el operador se va? Si la respuesta es «depende de un proyecto nuevo», no está
terminada.

**16. Prueba final anti-genérico.** Cambia dos palabras del problema por otro problema
distinto. Si la propuesta sigue sirviendo igual, es genérica: rehazla desde el paso 2.

## Contenido

- **Dos soluciones por reto.** Opción 01 principal; Opción 02 con **mecanismo distinto**,
  independiente, no «fase 2» ni plan B. Misma jerarquía visual. Si la 02 no puede vivir sin
  la 01, no es una segunda opción: es un paso.
- **Insignias**: 2 o 3 por reto desde `knowledge/insignias.json`, solo `verified: true` y
  solo si el mecanismo las habilita; si no aplica, se omite la fila. No se inventan.
- **ODS**: figura oficial de la ONU (`E_SDG_Icons-NN.jpg`), nombre oficial en español y una
  línea específica, según
  <https://www.un.org/sustainabledevelopment/es/news/communications-material/>.

### El «qué es»: escena, no ficha técnica

El «qué es» es un **párrafo narrativo de 80 a 150 palabras** (cuenta las palabras, no lo
estimes). Conteo obligatorio antes de maquetar. **Primera frase = qué es en términos
físicos**: el objeto o sistema nombrado de una, sin contexto previo. Prueba: alguien que
lee una sola vez entiende la idea y quiere seguirla; si no la entiende de una, no vende y
se reescribe.

- **Cuenta una escena**: quién la usa, qué hace con ella, qué cambia en su vida.
- **Dentro del párrafo no van precios, componentes ni métricas.** Esos datos van en sus
  campos, no en la idea: «bomba centrífuga de baja altura acoplada a motor…» es una línea de
  especificación, no una solución que alguien quiera comprar.
- El párrafo cierra con **por qué esto no es lo que ya existe**.
- El término técnico se traduce en la misma frase (el nombre del instrumento seguido de lo
  que mide y cómo se usa).
- **Sin name-dropping**: nombre de ganador, premio o caso ajeno prohibido dentro de `que_es`
  y `claim`. La idea se desarrolla propia, completa e independiente; la similitud con un
  caso conocido se menciona solo al final, en el campo de analogías/precedentes, con año,
  equipo y qué hizo ese caso.
- Debajo del párrafo, en campos aparte: claim, cómo funciona (4 pasos), beneficiario,
  componentes, costo estimado y métricas.

**`como` accionable**: los 4 pasos nombran quién hace qué con qué objeto, en orden
operable. «Desmontar / acoplar / probar / entregar» sin actor ni destino es genérico y se
rechaza.

**La señal resuelve, no cuenta**: resumen/señal del reto debe decir cómo la opción
agiliza, sustituye o resuelve algo que hoy no se hace. «Contar cosas», «mapear lo obvio» o
«tablero de prioridades» cuando el reto pide otra cosa = no resuelve.

**Insumo real (análisis sistémico)**: antes de idear, validar que el insumo existe de
verdad y que alguien lo entrega —nadie dona un celular que vale C$2500+, hay que
venderlo—. No asumir sensores ni capacidades de hardware sin fuente que lo diga. Si el
insumo es dudoso, la opción se descarta o cambia de insumo.

**Opciones gemelas**: opción 01 y 02 con el mismo objeto o el mismo mecanismo = una sola
idea disfrazada de dos. Objeto Y mecanismo distintos, ambos mostrables como
producto/servicio («no parece producto» se rechaza).

**Barra de calidad de la idea** (forma, no contenido): mecanismo **nuevo, barato y
masivo** que usa algo que todos ya tienen —p. ej. un dispositivo con Bluetooth/WiFi que
aprovecha que toda persona lleva celular (el celular ajeno solo como identificador
pasivo, nunca como hardware donado)—. No es plantilla: es la altura mínima de
imaginación esperada.

**Ejemplo de forma (plantilla, no texto para copiar):**

> [Quién] vive en [dónde] y hoy [qué problema concreto]. La idea es [objeto o sistema] que
> [qué hace] y [qué cambia]. Se usa así: [cómo se opera en una frase]. En lugar de [lo que
> recibe hoy], la persona [qué recibe o ve]. Cualquier [familia del reto] puede [resultado]
> por [condición de acceso]. Por eso no es [sustituto más fuerte]: [capacidad distinta].

Ese párrafo también expone los huecos: ¿quién lo opera?, ¿quién paga?, ¿qué pasa si falla?
Se resuelven en `Quién paga` y `Por validar`, no escondiéndolos.

### Jerga interna: prohibida en lo que lee el jurado

No aparecen en el dossier: **nómina, jugador, canal, nodo, sesgo, ticket, mecanismo,
«est. canon», saturación, probabilidad, win rate, score, «No documentado»**. Son términos
del sistema. Se traducen a lenguaje de calle: «canal» → «quién lo vende o lo instala»,
«ticket» → «prueba de 2 semanas», «mecanismo» → «cómo funciona».

### Tres campos fijos por solución

- **Ya existe:** dos sustitutos actuales + la diferencia en una frase.
- **Quién paga:** quién cobra, cuánto y qué gana cada actor. Dos rutas válidas: comprador
  privado con interés propio, o **partida pública** (municipio, ministerio, cooperación)
  cuando la solución es un bien social. Si es pública, nombrar la partida, la obligación o
  el costo evitado y quién mantiene. Sin donaciones supuestas.
- **Por validar:** el supuesto más riesgoso y la prueba barata que lo confirma o lo tumba.

### Resto del contenido

- **Verbos con mecanismo, no huecos**: si aparece «fomentar», «sensibilizar», «conectar» o
  «empoderar», que venga con el cómo concreto detrás; el verbo solo no dice qué se hace.
- **Nombres que se entiendan solos** (sin metáfora corporativa); 3 detalles que suman por reto.
- **No hay sección de «lo que el jurado va a atacar»**: no hay réplica. El riesgo se
  resuelve con una decisión de diseño dentro de la propuesta.
- Cadena obligatoria: problema → causa raíz → insight → solución → métrica.
- Precedentes con link de video; si falta, se dice y se compensa.
- Sin estadísticas internas del motor.

## Cuatro reglas que evitan el dossier incoherente

**1. Una solución es un objeto completo, no un párrafo.** Narrativa, claim, 4 pasos,
componentes, costo, métrica, «ya existe», «quién paga», «por validar», pitch y precedente
pertenecen a la misma solución y se escriben **juntos**. Si cambia la idea, se reescriben
todos sus campos en el mismo movimiento. Nunca se heredan componentes, costo, pitch ni
precedente de una versión anterior: así se produjo un dossier donde el texto hablaba de un
probador y la lista de insumos decía «bomba, manguera y marco de riego», o donde el pitch
vendía una solución que ya no existía.

Señales de que esto pasó: dos opciones del mismo reto comparten insumos, el costo no se
explica con la lista de componentes, el pitch nombra algo que no está en el texto, un
precedente cita el nombre de una solución anterior, o las insignias y los ODS hablan de un
mecanismo que ya no está.

**2. La red se juzga según el reto, no por reflejo.** La restricción de cero red aplica
**solo cuando el reto la implica**: desastre, emergencia, comunidad sin cobertura, zona
rural aislada, operación en el momento en que la antena se cae. Ahí sí: nada de QR, nube,
SMS ni GPS. En un reto de acopio, horticultura, energía o residuos con mercado normal, una
aplicación o un mensaje **sí valen** y no se descartan por prejuicio. Pregunta primero:
«¿en este contexto hay red, luz y alguien que la use todos los días?»; si la respuesta es
sí, la restricción no aplica.

Donde sí aplica:

- **Prohibido el QR y el formulario como producto.** Un QR es una puerta a una base de
  datos que no está; en un desastre la antena se cae primero. Un formulario no cambia nada
  físico: no es una solución.
- **Prohibido depender de red para el aviso crítico**: si la alarma solo existe en una
  pantalla con saldo, no cuenta.
- **La lectura tiene que ser física y visible**: color, bandera, varilla, ficha, talón.
- **La energía se resuelve en el objeto**: pedal, flotador, contrapeso, batería con panel.
- **Nada de confiar en la memoria o la buena voluntad**: número único, copia, sello, doble
  registro. El control se puede reconstruir en una mesa.

**3. Quién paga: interés propio o partida pública. La conciencia no paga facturas.**
Hay dos modelos legítimos y un modelo que no existe:

- **Comprador privado con interés propio.** Quien paga gana algo suyo y medible: miel,
  fruta, agua, tiempo, plata, salud, menos deshierbe. Es el modelo de taller, bodega,
  ferretería, agricultor o familia.
- **Servicio social con partida pública.** Cuando la solución es un bien público —riesgo,
  agua, salud, emergencia, espacio común—, es **normal y correcto** que la pague el Estado:
  municipio, alcaldía, ministerio, empresa pública o cooperación internacional. En América
  Latina eso es la regla, no la excepción. No hay que pedir perdón por eso ni forzar un
  autofinanciamiento que nadie va a pagar. Lo que sí se exige es nombrar el pago con
  precisión:
  - qué partida o programa la compra (gestión de riesgo, agua y saneamiento, mantenimiento
    verde, operativo de emergencia, agricultura urbana);
  - por qué le conviene al Estado: obligación legal, servicio que ya presta, costo evitado
    (excavación, relleno, atención de emergencia, subsidio que ya paga);
  - quién firma el contrato y quién mantiene, para que la compra no sea un regalo único.

El modelo que no existe es **el que no tiene pagador**: el que depende de donaciones
supuestas, de que el vecino sea buena gente, de una campaña de concientización o de que
alguien compre un certificado que puede evitar. Por eso quedan fuera como núcleo:

- **Certificados, sellos y auditorías** como producto principal: el que puede evitarlos, los
  evita; el que los compra solo gana si otro los exige.
- **Campañas de sensibilización**, jornadas de limpieza y «compromiso ciudadano» sin un
  bien o servicio concreto detrás.
- **Modelos que se rompen si cada actor busca su interés**: si el flujo depende de heroísmo,
  el modelo está mal.

Prueba rápida: escribe en una línea quién firma el pago —un particular, una empresa o una
partida pública— y qué recibe a cambio. Si no hay firma ni bien recibido, no hay venta.

**4. Un dossier o una versión anterior no es fuente de verdad.** Cualquier JSON, PDF o
borrador previo conserva escenas, actores, costos y errores. Se lee solo para (a) no repetir
una propuesta y (b) comprobar que la nueva no heredó nada. No se copian escenas, objetos,
claims, costos, ODS, insignias, precedentes ni señales. Si una opción nueva coincide con la
vieja en el objeto o el actor, se reescribe desde el enunciado del reto. Los ODS y las
insignias se re-derivan de `knowledge/insignias.json` y de la lista oficial; no se heredan.

## Corregir con bisturí, no con hacha

Cuando una crítica señala un punto —un costo que no cuadra, un comprador que no existe, una
dependencia que no aplica—, se corrige **ese punto** y se conserva la idea que funcionaba.
Cambiar toda la propuesta por una observación parcial es cómo se pierden las buenas ideas.
Antes de reescribir una solución, escribe: qué parte queda, qué parte cambia y por qué el
cambio no rompe la escena que ya vendía.

## Ley de rechazo total (anti-contaminación)

Cuando el usuario recibe el PDF y **no le gusta nada** (rechazo total del dossier, no una
corrección puntual):

1. **Borrar todas las soluciones** del ciclo actual: JSON de salida, drafts y contenido
   derivado salen del pipeline activo.
2. **Archivar las baneadas solo si el usuario lo pidió** — y solo en el archivo de archivo
   (`baneadas.json` con fecha y motivo). Si no lo pidió, se borran sin archivar.
3. **Regenerar desde cero** con el motor y la compuerta, **sin leer archivos viejos**: nada
   de `research/soluciones_actuales.json`, `contenido_final.py`, `soluciones.json` previos ni
   drafts. Esa lectura es exactamente lo que contamina las soluciones nuevas con las viejas.
4. El usuario manda: si pide otro enfoque, se cambia de enfoque, no se hace un re-skin.

Corrección puntual (una opción, un costo) ≠ rechazo total: para eso aplica «Corregir con
bisturí», de arriba. La ley solo se dispara con rechazo explícito del PDF completo.

## Anatomía de página

- Sin portada ni índice; abre en el reto 01. Tres páginas por reto, sin huérfanas.
- Cabecera: número gigante (64 pt, cobalto), título, chip `CATEGORÍA · 01/09`.
- Orden: descripción → ODS → insignias → «Dos soluciones posibles» → Opción 01 →
  Opción 02 (página nueva) → detalles → cadena → métricas → señal → precedentes → pitch
  de 60 s → COMENTARIOS con líneas regladas.

## Jerarquía visual

- Rótulos navy `#0D1B35`; cuerpo `#334155`; metadatos `#5C7193`; cobalto `#0866F5` solo
  para número de reto, métrica clave, pasos y links.
- Secciones con regla hairline 1 px + rótulo mono. Sin tarjetas, sombras, emojis ni
  degradados. `break-inside: avoid` en filas y grupos.

## Entregables

- **Diseño:** ver «Regla dura: el diseño del PDF ya está decidido» (arriba). Siempre
  `scripts/gen_dossier.py`; nunca CSS propio.
- **PDF** A4 por Chrome headless (fuentes locales Plus Jakarta Sans + JetBrains Mono);
  **Word** espejo, con ODS como tabla de imagen oficial; **Excel** con Panel + una hoja por
  reto (ambas soluciones, detalles, métricas, comentarios editables).
- Comandos: `scripts/gen_dossier.py` (dossier curado) o `scripts/soluciones_motor.py` +
  `scripts/gen_soluciones_pdf.py` (borrador). Especificación de diseño: `references/dossier-soluciones.md`; doctrina: `docs/MOTOR_SOLUCIONES.md`.

## Validación antes de entregar

1. **Diseño**: el PDF salió del generador aprobado; misma anatomía que la referencia
   (número grande + título, ODS, insignias, dos opciones, métricas, señal, precedentes,
   pitch, comentarios). Cero CSS propio.
2. 3 páginas por reto, sin huérfanas; revisar el `y` máximo de cada página.
3. **Narrativa**: cada «qué es» tiene entre 80 y 150 palabras, abre con el qué es físico,
   se entiende de una lectura y no contiene precios ni componentes dentro del párrafo.
4. **Jerga**: cero apariciones de nómina, jugador, canal, nodo, sesgo, ticket, mecanismo,
   «est. canon», `saturacion`, `probabilidad`, `win rate`, `score` ni «No documentado».
5. **No taller / no servicio**: ningún nombre de opción es taller, servicio, mesa de desarme
   ni capacitación. Cada una es producto, sistema o modelo con activo propio.
6. **Sin donaciones supuestas**: cada solución trae `Quién paga` con el flujo de dinero y lo
   que gana cada actor.
7. **Ya existe**: dos sustitutos actuales nombrados y la diferencia en una frase, por opción.
8. **Familia del reto**: la solución cubre el conjunto, no el ejemplo más cómodo.
9. Por reto: 2 soluciones independientes, insignias verificadas, 3 detalles, links de
   video, ODS oficial.
10. Cada solución declara familia (A–G) o justifica por qué igual pasa las cinco pruebas.
11. Renderizar a PNG: sin cortes ni grupos partidos; COMENTARIOS completos en el área útil.
12. Correr el verificador de texto sobre el PDF final (conteo de palabras, términos
    prohibidos, aparición literal de cada narrativa) antes de decir que está listo.
13. **Coherencia interna, opción por opción**: cada componente de la lista aparece en el
    relato o en los pasos; el costo se explica por esa lista; la métrica se mide con lo que
    la solución instala; el pitch nombra la solución actual y no otra.
14. **Red según contexto**: si el reto es emergencia, desastre o comunidad sin cobertura,
    ninguna opción depende de QR, aplicación, SMS, nube o GPS y la lectura es física. Si el
    reto no lo implica, la herramienta digital se permite y no se penaliza.
15. **Pagador identificado**: cada opción declara quién firma el pago —particular, empresa
    o partida pública— y qué recibe a cambio. En soluciones sociales la partida pública es
    válida y se nombra (programa, obligación, costo evitado); no se exige autofinanciamiento
    ni se presenta la donación como modelo. Sin certificados, sellos ni concientización como
    núcleo.
16. **Sin nombres muertos**: ningún precedente, ODS, insignia o señal cita una solución de
    una versión anterior. Se busca el nombre viejo en todo el JSON antes de maquetar.
17. **Precedentes honestos**: el `por_que` describe el mecanismo del caso, no el de la
    solución propia, y el puesto/año coinciden con `knowledge/retos_razonamiento.json` o con
    la fuente del repo.
18. **El `.md` y el JSON son espejo**: se regeneran desde el mismo JSON; ninguno se edita a
    mano.
19. **La skill que se carga es la que se editó**: `skills/<nombre>/SKILL.md` se copia a
    `.opencode/skills/` y `.agents/skills/` (o se corre `scripts/setup_agente.ps1`). Si esas
    copias quedan viejas, el agente lee la versión anterior y repite los mismos errores.
20. **Encaje literal**: cada opción nombra el objeto/actor del enunciado y el mecanismo cubre
    al menos 3 casos de la lista, o se justifica el subconjunto.
21. **Bucle de decisión**: cada opción tiene decisor, umbral y plazo; la ventana de decisión es
    menor que la evolución del fenómeno.
22. **Estado del arte**: cada opción nombra el sustituto más fuerte con precio o costo y
    proveedor, y una capacidad distinta; no alcanza «más barato» ni «sin red».
23. **Precedente equivalente**: el `por_que` describe el mismo mecanismo; ningún precedente se
    repite más de dos veces en el dossier.
24. **Factibilidad**: variable, instrumento, resolución, calibración, modo de falla y quién
    repara; hay prueba de mesa en una semana.
25. **Costo bottom-up**: componentes × cantidad × precio = total; fuente o cotización con
    fecha; el total no es menor que la suma.
26. **Pagador con línea**: institución/empresa, partida o ingreso, cargo que firma, bien
    recibido y quién mantiene; no «junta», «comunidad», «pago simbólico» ni «sin sueldo».
27. **Categoría justificada**: definición de la rúbrica + criterio cumplido, o «sin categoría»
    si el certamen no la pide.
28. **No herencia**: se comparó contra el dossier o la versión anterior y ninguna opción
    conserva escena, objeto, costo, ODS, insignia o precedente heredado.
29. **Compuerta completa**: las tablas por reto están llenas y ninguna opción con celda
    «rechaza» llegó al PDF.
30. **UTF-8 limpio**: ningún JSON de entrada contiene mojibake (`Ã©`, `Ã­`, «ProtecciÃ³n»);
    si aparece, se repara en origen antes de generar.
31. **Insumo real**: el insumo de cada opción existe y alguien lo entrega (análisis
    sistémico); sin hardware asumido sin fuente ni donaciones de objetos de valor.

## Calibrar la compuerta

Antes de confiar en la compuerta, pásale una solución que ya sabes que no sirve —de un
dossier anterior o de una propuesta descartada—. Debe rechazarla. Si la aprueba, falta un
campo o una regla está floja. No se calibra con el caso que estás escribiendo: se calibra
con uno que ya falló.

