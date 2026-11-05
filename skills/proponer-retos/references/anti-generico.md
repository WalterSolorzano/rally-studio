# Detector anti-genérico

> Este archivo es el **complemento operativo** del goal maestro (`references/goal.md`).
> Contiene: la lista cerrada de frases prohibidas con detector regex, los patrones sintácticos
> que huelen a genérico, el procedimiento del test de swap, los contrastes few-shot y la
> auto-auditoría obligatoria antes de entregar.

La diferencia entre una solución concreta y una genérica casi nunca está en la idea — está en el
lenguaje. Una IA puede tener una buena idea y arruinarla con verbos huecos, abstracciones y
actores sin nombre. Este archivo detecta esos fallos antes de que lleguen al PDF.

---

## 1. FORBIDDEN_PHRASES · detector regex

La IA no debe usar ninguna frase de esta lista, ni sus conjugaciones, ni sus sinónimos.
El detector se ejecuta con `re.search` (case-insensitive, sin acentos) sobre el texto de cada
solución antes de enviarla al PDF. Si hay match, la opción se reescribe — no se reemplaza la
palabra por un sinónimo igual de hueco.

### 1.1 Verbos huecos (sin mecanismo detrás)

```regex
\b(sensibili[zs]ar|concienti[zs]ar|fomentar|promover|impulsar|apotear|apalancar|potenciar|incentivar|estimular|difundir|divulgar|promocionar|visibili[zs]ar|sociali[zs]ar)\b
```

**Por qué se prohíben.** Son verbos de intención, no de mecanismo. «Sensibilizar a la
comunidad» no dice qué se hace, con qué, ni quién mide si funcionó. Si el mecanismo real es
«capacitar a 12 comerciantes del mercado en separación de residuos con 4 sesiones de 2 h
evaluadas con un quiz de 10 preguntas», se escribe eso — no «sensibilizar».

**Excepción.** Solo se permiten si en la misma frase aparece el cómo concreto (verbo de
mecanismo + objeto + métrica). En ese caso, el verbo hueco es decorativo y se recomienda cortar.

### 1.2 Sustantivos abstractos sin actor

```regex
\b(comunidad organizada|sociedad civil|actores involucrados|partes interesadas|stakeholders|comunidad en general|poblaci[oó]n beneficiada|comunidades vulnerables|jóvenes emprendedores|mujeres empoderadas)\b
```

**Por qué se prohíben.** Son actores sin nombre. Si el pagador u operador es «la comunidad
organizada», no hay pagador ni operador. La compuerta de Pagador con Línea exige un cargo que
firma (Director de Servicios Municipales, Alcalde, Gerente, Presidente de la cooperativa).

### 1.3 Modelos que no son producto

```regex
\b(econom[ií]a circular|desarrollo sostenible|desarrollo local|innovaci[oó]n social|impacto social|modelo de negocio|cadena de valor|ecosistema de|plataforma de|soluci[oó]n integral|soluci[oó]n hol[ií]stica|enfoque participativo|enfoque comunitario)\b
```

**Por qué se prohíben.** Son etiquetas, no productos. Una solución no es «economía circular»: es
«biodigestor comunitario que procesa 8 t/semana de residuos orgánicos del mercado y produce 320
L/mes de biol». La etiqueta puede acompañar como tag, no como núcleo.

### 1.4 Talleres y servicios disfrazados

```regex
\b(taller( (de|para|en))?.*|capacitaci[oó]n.*|mesa de desarme.*|servicio de.*|jornada de.*|campa[ñn]a de.*|voluntariado.*|programa de concienti[zs]aci[oó]n|compromiso ciudadano)\b
```

**Por qué se prohíben.** Están en la lista cerrada de `dossier-soluciones/SKILL.md` paso 7. Un
taller no se vende en un rally; un servicio depende de captar usuarios; una campaña de
concientización no cambia nada físico.

### 1.4b Reacondicionamiento, cambio de pieza y testeo (baneo específico)

```regex
\b(reacondicion(a|ar|amiento)|refurbish(ing)?|remanufactur(a|ar|ado)|rebuild|cambio de pieza(s)?|reemplazo de pieza(s)?|testeo de .+ usado|test de .+ (usado|dañado|viejo)|diagn[oó]stico de .+ (usado|dañado|viejo)|verificar .+ funcione|revisar .+ (estado|funciona)|reparar y revender|restaurar .+ (electrodoméstico|motor|aparato|dispositivo))\b
```

**Por qué se prohíben.** Reacondicionar, cambiar piezas o testear equipos usados son
operaciones de mantenimiento — no son productos. La IA tiende a proponer «clasificar los motores
dañados, testearlos, cambiar la pieza averiada y revenderlos» como si fuera innovación: es la
operación normal de cualquier taller existente. El jurado busca un mecanismo nuevo, no la
operación normal del sector hecha por un equipo universitario. Si el enunciado trata de
equipos dañados o usados, la solución debe transformar el recurso en algo distinto (un producto
nuevo, un componente con especificación, una función que el original no cumplía), no
restaurarlo a su función original.

**Excepción.** El diagnóstico es válido como **habilitador** de otra solución (por ejemplo,
clasificar para separar un componente con especificación que tiene mercado distinto) — pero no
como núcleo del producto.

### 1.4c Donaciones de equipos y hardware reusado como "solución"

```regex
\b(tel[eé]fonos? donados?|celulares? donados?|smartphones? donados?|celulares? usados?|tel[eé]fonos? usados?|donaci[oó]n de (equipo|dispositivo|tel[eé]fono|celular|computadora|laptop|tablet)|reusar (tel[eé]fono|celular|smartphone|laptop|tablet))\b
```

**Por qué se prohíben.** Reutilizar teléfonos donados o laptops viejas como núcleo de la
solución disfraza una dependencia logística: conseguir suficientes dispositivos donados en buen
estado, mantenerlos cargados, reemplazar los que se rompen. El modelo de «repartir X cosa
donada» es distribución, no innovación — y quien lo propone está escondiendo que la solución
real es el canal de donación, no el artefacto.

**Preferencia explícita.** Si el problema es de comunicación, alerta, lectura, control o
interacción, es preferible un **artefacto que se pueda fabricar o comprar masivamente** (un
sello, una ficha, un cartel físico, un sensor barato, una radio de bajo costo) a depender de
teléfonos donados. La solución distribuida en masa con un artefacto reproducible le gana al
modelo de reusar hardware ajeno. Si aun así se usan teléfonos, debe ser como acompañamiento de
un sistema mayor que se instala y mantiene — nunca como núcleo.

### 1.5 Kits y apps sin operador

```regex
\b(kit (educativo|did[aá]ctico|de (energ[ií]a|agua|agricultura))|sensor (suelto|aut[oó]nomo|de bajo costo)|app m[oó]vil|aplicaci[oó]n web|plataforma digital|formulario (digital|en l[ií]nea)|c[oó]digo QR|certificado de|sello de|auditor[ií]a de)\b
```

**Por qué se prohíben.** Están en la lista cerrada. Solo valen como acompañamiento de un
producto físico con operador identificado. Como núcleo, rechazan.

### 1.6 Relleno genérico

```regex
\b(a trav[eé]s de|mediante|por medio de|de manera|de forma|con el fin de|con el objetivo de|con el prop[oó]sito de|buscando|apuntando a|orientado a|enfocado en|dirigido a)\b
```

**Por qué se prohíben.** Son conectores que no aportan información. «Recolecta residuos a través
de bandejas» = «recolecta residuos con bandejas». Si el modelo los usa, está rellenando. Cortar
el conector deja al descubierto el hueco.

### 1.7 Métricas abstractas

```regex
\b(personas sensibilizadas|personas concientizadas|comunidades beneficiadas|vidas mejoradas|impacto positivo|cambio de mentalidad|toma de conciencia|apropiaci[oó]n del|adopci[oó]n del)\b
```

**Por qué se prohíben.** No se pueden medir físicamente. La métrica física es quintales, litros,
vatios, horas, personas (con actividad nombrada), córdobas, USD. «Personas sensibilizadas» no
se cuenta de forma verificable.

### 1.8 Frases hechas del rally

```regex
\b(soluci[oó]n innovadora|propuesta disruptiva|tecnolog[ií]a de impacto|modelo replicable|escala(ble|bilidad)|sostenibilidad|empoderamiento de|inclusi[oó]n de|diversidad e|enfoque de g[eé]nero)\b
```

**Por qué se prohíben.** Son frases que el jurado escucha en todos los pitches. No diferencian.
Si la solución es replicable, se demuestra con dos municipios nombrados donde se instalaría. Si es
escalable, se muestra el cálculo de 10 → 1.000 unidades.

### 1.9 Detector de weasel words

```regex
\b(algunos|muchos|varios|diversos|m[uú]ltiples|cierta|cierto tipo de|en general|por lo general|por lo regular|tendr[ií]a|podr[ií]a|deber[ií]a|se espera que|se anticipa que|se proyecta que)\b
```

**Por qué se prohíben.** Son palabras que permiten al modelo no comprometerse. Si no se sabe el
número, se escribe `por validar con el equipo` — no «algunos» ni «varios».

---

## 2. GENERIC_SMELLS · patrones sintácticos

Estos no son frases concretas, son **patrones** que huelen a genérico aunque no estén en la
lista anterior. Se detectan leyendo la solución y respondiendo a estas preguntas:

| # | Patrón | Pregunta | Rechaza si… |
|---|---|---|---|
| 1 | Actor sin nombre | ¿El actor principal aparece con nombre propio o solo con categoría? | «comunidad», «jóvenes», «mujeres», «productores» sin especificar cuál/cooperativa/sector. |
| 2 | Objeto no del enunciado | ¿El primer objeto de la escena está en el enunciado del reto? | la escena abre con «una app», «un sensor», «una plataforma» cuando el enunciado nombra «residuos orgánicos». |
| 3 | Verbo de intención sin objeto físico | ¿El verbo principal tiene un objeto físico directo? | «sensibiliza a», «fomenta la», «promueve el» sin objeto que se pueda tocar. |
| 4 | Métrica sin unidad física | ¿La métrica tiene unidad de medida concreta? | «impacto positivo», «apropiación», «participación» sin quintales/litros/vatios/horas/personas/córdobas. |
| 5 | Pagador sin cargo | ¿El pagador aparece con un cargo firmable? | «comunidad», «junta», «el proyecto» sin Director/Alcalde/Gerente/Presidente. |
| 6 | Sustituto débil | ¿El «ya existe» nombra el sustituto más fuerte, no el más primitivo? | «hoy no hay nada» o «hoy se hace a mano» cuando existe un producto comercial. |
| 7 | Capacidad distinta = precio | ¿La diferencia con el sustituto es funcional, no económica? | «más barato», «más accesible», «sin costo» sin capacidad funcional nueva. |
| 8 | Sin ventana de decisión | ¿Hay un decisor con umbral y plazo? | «la solución permite saber…» sin quién decide qué con ese dato y en qué plazo. |
| 9 | Precedente compartido | ¿El precedente ya se usó en otra opción del dossier? | el mismo `id` aparece en 2+ retos o en ambas opciones del mismo reto. |
| 10 | Sin prueba de mesa | ¿Se puede probar en una semana con costo conocido? | «se validará con un piloto de 6 meses» — el supuesto más riesgoso no se prueba barato. |
| 11 | **Término del enunciado ignorado** | ¿La solución trata el objeto exacto que nombra el enunciado, no uno relacionado? | el enunciado dice «motores domésticos» y la solución habla de «motores de molinos»; dice «residuos del mercado» y la solución trata «residuos industriales». |
| 12 | **Reacondicionamiento como núcleo** | ¿La solución propone transformar el recurso en algo distinto, no restaurarlo a su función original? | «testear, cambiar pieza y revender» como propuesta. |
| 13 | **Hardware donado como núcleo** | ¿La solución depende de equipos donados/usados para existir? | «teléfonos donados», «laptops viejas reutilizadas» como distribución del producto. |

Si la solución tiene 2 o más `GENERIC_SMELLS`, se reescribe desde el razonamiento (volver al
chain-of-thought del goal). No se parcha con sinonimos.

### 2.1 Lectura cuidadosa del término del enunciado (smell #11, ampliado)

Este es el fallo más sutil y el más común en Latam: la solución resuelve un problema
relacionado pero no el problema que el enunciado literal plantea. Antes de proponer, el modelo
subraya en el enunciado:

1. **El objeto exacto.** Si dice «motores domésticos», no propone soluciones para «motores de
   molinos» ni «motores industriales». Si dice «residuos orgánicos del mercado municipal», no
   propone soluciones para «residuos sólidos urbanos».
2. **El actor exacto.** Si dice «comerciantes formales», no propone soluciones para
   «comerciantes informales» ni «consumidores finales».
3. **El territorio exacto.** Si dice «zonas urbanas», no propone para «comunidades rurales
   aisladas» (y viceversa).
4. **La escala exacta.** Si dice «a nivel de manzana», no propone a «nivel nacional».

El chain-of-thought del goal ya pide `ENUNCIADO_LITERAL` con cita textual. Si la solución no
encaja con esa cita (no resuelve ese objeto, actor, territorio o escala), la opción se
`RECHAZA` en la compuerta 1 (Encaje literal) — pero la versión vieja era floja con esto. Ahora
se rechaza explícitamente cuando el objeto de la solución pertenece a una familia vecina pero
no a la que el enunciado nombra.

---

## 3. Test de swap (procedimiento obligatorio)

Esta es la compuerta final, la que más proposals genéricas caza. El test es simple:

### 3.1 Procedimiento

1. **Toma el enunciado del reto** y subraya dos palabras clave que nombren actor u objeto
   (por ejemplo: el tipo de recurso y el territorio nombrados en el enunciado).
2. **Cambia esas dos palabras** por otras dos de un problema distinto del mismo tipo
   (cambia el recurso por otro recurso de la misma familia, y el territorio por otro territorio).
3. **Lee la solución propuesta** sin cambiar nada y responde: ¿sigue sirviendo igual?
4. **Decisión:**
   - Si la solución **sigue sirviendo igual** → es genérica. `RECHAZADA`. Volver al chain-of-thought.
   - Si la solución **ya no sirve** (el mecanismo depende del tipo de residuo, del municipio,
     del actor) → pasa. No es genérica.

### 3.2 Trazado en el log

El test se documenta así en `docs/_build/compuerta_<certamen>.md`:

```markdown
### DESAFIO_0X · Opción 0Y · Test de swap

- Enunciado: «[cita textual del enunciado del reto tal como lo entregó el comité]».
- Palabras swap: «[palabra clave 1]» → «[otra del mismo tipo]»; «[palabra clave 2]» → «[otra]».
- Solución swapada: «[la solución propuesta, sin cambios]».
- ¿Sigue sirviendo igual? [SÍ/NO] — [por qué: el mecanismo depende/no depende de lo cambiado].
- Decisión: PASS si al menos 1 swap la tumba. ULTRA-GENÉRICA si 0/4 swaps la tumban.
```

### 3.3 Tipos de swap que más cuelan propuestas genéricas

| Tipo de swap | Cuela si la solución es… |
|---|---|
| Cambiar actor | «taller de capacitación para los comerciantes» (sirve para comerciantes, agricultores, jóvenes, mujeres — genérica). |
| Cambiar municipio | «plataforma digital que conecta» (sirve en cualquier ciudad — genérica). |
| Cambiar objeto | «kit educativo sobre» (sirve para residuos, energía, agua — genérica). |
| Cambiar época | «campaña de concientización» (sirve en 2024 o 2030 — genérica). |

Si la propuesta pasa los 4 swaps sin que ninguno la tumbe, es **ultra-genérica** y se rehace
desde el paso 2 del chain-of-thought.

---

## 4. Patrones de transformación (NO ejemplos hardcodeados)

**Importante.** Los retos y los precedentes salen del banco interno del usuario
(`research/challenges.json`, `brain/corpus/retos.md`, `knowledge/retos_razonamiento.json`,
`research/sirli/winners.jsonl`). Esta skill **no inventa retos ni cita casos concretos de
memoria**: cuando se necesite un ejemplo, se consulta el banco. Por eso esta sección no contiene
ejemplos cerrados con municipio o actor inventado — eso sesgaría al modelo a copiar la escena.

En su lugar, hay **patrones de transformación** que muestran cómo se reescribe una frase genérica
en una frase concreta, **independientemente del reto**. El modelo los aplica al texto que produce,
no los usa como plantilla de contenido.

### 4.1 Patrón «plataforma/app/sensor suelto» → «objeto instalado con operador»

```
GENÉRICO ❌  «Plataforma digital que conecta a [actor] con [otro actor] mediante una app móvil»
CONCRETO ✅  «[Objeto físico] instalado en [lugar específico del enunciado], operado por
              [actor con cargo], que produce [bien o servicio medible] vendido a
              [comprador con línea] a [precio con unidad]»
```

**Razón.** La app y la plataforma no son producto: no se llevan, no se instalan, no se mantienen.
El objeto físico sí. El patrón fuerza al modelo a nombrar el objeto, no la app que lo acompaña.

### 4.2 Patrón «sensibilizar/concientizar/capacitar» → «conducta medible en plazo»

```
GENÉRICO ❌  «Sensibiliza a la comunidad sobre [problema] mediante jornadas de concientización»
CONCRETO ✅  «[Número] [actor nombrado] adoptan [conducta observable] en [plazo] medido con
              [instrumento físico: ficha, sello, contador, libro de caja], con umbral
              de [X] para considerar que la conducta ocurrió»
```

**Razón.** La sensibilización no se mide; la conducta sí. Si la propuesta no puede nombrar la
conducta observable y el umbral, es porque no sabe qué quiere lograr.

### 4.3 Patrón «economía circular / desarrollo sostenible» → «ciclo con pagador y precio»

```
GENÉRICO ❌  «Modelo de economía circular que aprovecha [recurso] de manera sostenible»
CONCRETO ✅  «[Recurso del enunciado] se transforma en [producto] con [proceso físico],
              vendido a [comprador con nombre y línea] a [precio unitario], generando
              [ingreso o ahorro con número] que cubre [costo de operación]»
```

**Razón.** «Economía circular» es una etiqueta; un ciclo con comprador, precio y costo es una
operación. Si no hay comprador con precio, no hay ciclo — hay deseo.

### 4.4 Patrón «kit/sensor/taller» → «artefacto con quién opera, quién paga, quién repara»

```
GENÉRICO ❌  «Kit educativo para que la comunidad aprenda sobre [tema]»
CONCRETO ✅  «[Artefacto físico] operado por [actor con cargo] en [lugar], pagado por
              [comprador con partida/línea], reparado por [actor con nombre] cada
              [periodo], con [métrica física] que valida que funciona»
```

**Razón.** Un kit sin operador es chatarra didáctica. El patrón obliga a nombrar los tres roles
que mantienen el artefacto vivo: opera, paga, repara.

### 4.5 Patrón «comunidad/jóvenes/mujeres» → «actor con nombre propio o rol específico»

```
GENÉRICO ❌  «Empodera a las mujeres de la comunidad organizada»
CONCRETO ✅  «[Número] [mujeres con rol específico: presidentas de cooperativa, dueñas de
              puesto, etc.] aumentan [métrica] en [cantidad] durante [periodo]»
```

**Razón.** «Comunidad» no firma contratos ni paga facturas. El actor nombrado sí. El patrón
fuerza especificidad sin caer en un caso inventado: el modelo busca el actor en el enunciado
o en el banco, no lo inventa.

### 4.6 Patrón «innovación disruptiva / propuesta innovadora» → «capacidad distinta del sustituto»

```
GENÉRICO ❌  «Solución innovadora que transforma el sector mediante tecnología de impacto»
CONCRETO ✅  «A diferencia de [sustituto más fuerte con precio], este [objeto] puede
              [capacidad funcional nueva], lo que permite [caso de uso que el sustituto
              no cubre] en [condición donde el sustituto falla]»
```

**Razón.** «Innovación» sin capacidad distinta es marketing. El patrón ata la diferencia a una
función concreta que el sustituto no tiene — no a un adjetivo.

### 4.7 Patrón «metric abstracta» → «unidad física con fuente»

```
GENÉRICO ❌  «Genera impacto positivo en la calidad de vida de los beneficiarios»
CONCRETO ✅  «[Número] [unidad física: quintales/litros/vatios/horas/personas/córdobas/USD]
              medidos con [instrumento], fuente: [claims.json / retos_razonamiento.json /
              "por validar con el equipo"]»
```

**Razón.** El impacto abstracto no se audita; la unidad física sí. La fuente obliga al modelo a
no inventar — si no hay fuente, se marca `por validar`.

---

### 4.8 Cómo usar los patrones

1. El modelo escribe la primera versión de la solución.
2. La compara con los 7 patrones anteriores.
3. Si la frase genérica calza con el lado izquierdo de algún patrón, se reescribe con el lado
   derecho.
4. Si al reescribir no encuentra un actor, objeto, métrica o pagador concreto, es porque la
   solución no tiene suficiente información del reto: vuelve al chain-of-thought del goal, no se
   inventa el dato.

**Nota.** Los patrones NO son plantillas para copiar literalmente. Son contrastes que muestran
qué falta cuando el texto huele a genérico. La frase concreta final debe salir del enunciado del
reto y del banco interno, no de este archivo.

---

## 5. Auto-auditoría antes de entregar

Antes de que la opción llegue al PDF, la IA corre esta auditoría. Si cualquier ítem falla, la
opción vuelve al chain-of-thought.

```markdown
## Auto-auditoría · DESAFIO_0X · Opción 0Y

### FORBIDDEN_PHRASES
- [ ] No aparece ninguna frase de las secciones 1.1 a 1.9 del detector
- [ ] Verificado con `re.search` case-insensitive, sin acentos

### GENERIC_SMELLS
- [ ] Actor con nombre propio (no «comunidad», «jóvenes», «mujeres» solos)
- [ ] Primer objeto de la escena es del enunciado del reto
- [ ] Verbo principal tiene objeto físico directo
- [ ] Métrica con unidad física (quintales/litros/vatios/horas/personas/córdobas/USD)
- [ ] Pagador con cargo firmable (Director/Alcalde/Gerente/Presidente)
- [ ] «Ya existe» nombra sustituto más fuerte con precio
- [ ] Capacidad distinta es funcional (no «más barato»)
- [ ] Decisor con umbral y plazo identificados
- [ ] Precedente no usado en otra opción del dossier (contador ≤ 2)
- [ ] Prueba de mesa en ≤ 1 semana con costo conocido

### TEST DE SWAP
- [ ] Cambio de actor: la propuesta ya no sirve igual
- [ ] Cambio de municipio: la propuesta ya no sirve igual
- [ ] Cambio de objeto: la propuesta ya no sirve igual
- [ ] Cambio de época: la propuesta ya no sirve igual
- [ ] Si 0/4 swaps la tumbaron: ULTRA-GENÉRICA → rehacer desde chain-of-thought

### COMPUERTAS DEL DOSSIER (9)
- [ ] 1. Encaje literal (actor y objeto del enunciado)
- [ ] 2. Bucle de decisión (decisor + umbral + plazo)
- [ ] 3. Estado del arte (sustituto + precio + capacidad distinta)
- [ ] 4. Precedente equivalente (mismo mecanismo, no compartido >2 veces)
- [ ] 5. Factibilidad (instrumento + resolución + calibración + quién repara)
- [ ] 6. Costo bottom-up (componentes × cantidad × precio = total con fuente)
- [ ] 7. Pagador con línea (institución + partida + cargo + bien + mantiene)
- [ ] 8. Categoría justificada (definición + criterio)
- [ ] 9. No herencia (sin escena/objeto/costo/ODS/insignia/precedente de versión anterior)

### COHERENCIA INTERNA
- [ ] Cada componente de la lista aparece en el relato o en los pasos
- [ ] El costo se explica con esa lista de componentes
- [ ] La métrica se mide con lo que la solución instala
- [ ] El pitch nombra la solución actual y no otra
- [ ] La solución cubre la familia del reto, no el ejemplo cómodo

### RED SEGÚN CONTEXTO
- [ ] Si el reto es emergencia/desastre/sin cobertura: no QR/app/nube/SMS/GPS, lectura física
- [ ] Si el reto no lo implica: herramienta digital permitida

### RESULTADO
- [ ] PASS total → la opción entra al PDF
- [ ] RECHAZADA · Motivo: <frase concreta> · Acción: <regenerar / volver a chain-of-thought paso N>
```

---

## 6. Mantenimiento de la lista

Esta lista no es cerrada para siempre. Cada vez que la IA produzca una propuesta que el usuario
marque como genérica, **la frase nueva se agrega a la sección correspondiente** con la fecha
y el reto donde apareció. Esto hace que el detector mejore con cada iteración.

```markdown
## Histórico de frases añadidas

- 2026-11-06: versión inicial con secciones 1.1 a 1.9 y GENERIC_SMELLS 1 a 10.
- [fecha]: añadida frase X en sección Y.N tras detectarla en reto Z.
```

La calibración de `references/goal.md` sección 8 también aplica aquí: antes de confiar en el
detector, pásale una solución que ya sabes que es genérica. Debe cazarla. Si no, falta una frase
o un patrón.
