---
name: propuesta-diseno
description: Convierte el nombre, logo o una idea del equipo en propuestas de identidad visual (paleta, tipografías, tokens, dirección de logotipo). Úsala cuando el usuario no tiene marca, no le gusta la que tiene o pide que la interfaz se vea mejor.
---

# Propuesta de diseño

## Cuándo usarla

- El equipo no tiene logo, paleta ni tipografías.
- El usuario dice "no me gusta cómo se ve" o "propón una identidad".
- Hay un logo y hace falta derivar el resto del sistema.

## Procedimiento

### Requisitos previos (obligatorios)
- Instalar la skill `impeccable` (`npx skills add impeccable`) y la skill `frontend-design` (`npx skills add frontend-design`) antes de generar cualquier propuesta visual. Sin ambas skills instaladas, no se procede.
- Hacer preguntas de diseño al usuario antes de proponer: nombre del proyecto, a qué se dedica, público, tono (sobrio / cálido / técnico), si ya hay logo o color obligatorio, y en qué dispositivo se verá principalmente. Nunca proponer sin estas respuestas.
- `ui-ux-pro-max` y `design-system` son opcionales: instálalas solo si la tarea pide paleta, tipografía, tokens o accesibilidad que `brand/tokens.css` no resuelva. Consúltalas con `python scripts/herramientas.py necesita "<tarea>"`; no las instales por rutina.

1. Completa las preguntas de diseño pendientes del requisito previo (nombre, a qué se dedica,
   público, tono, logo/color obligatorio, dispositivo principal) antes de avanzar.
2. Si hay logo, léelo (`brand/logo.png` o el que indique) y extrae 2-3 colores dominantes.
   Si no hay logo, parte del nombre y del sector.
3. Propón **2 direcciones** distintas, no una. Cada dirección trae:
   - paleta de 5 colores con HEX y el contraste del primario sobre el fondo (mínimo 4.5:1,
     objetivo 7:1),
   - pareja tipográfica (títulos + UI + datos) con justificación en una línea,
   - 3 palabras de personalidad y 2 anti-ejemplos ("esto no es"),
   - una frase de concepto para el logotipo.
4. Recomienda una y explica por qué en dos líneas.
5. Cuando el usuario elija, escribe los tokens: actualiza `brand/palette.json` y
   `brand/tokens.css`, y sirve la propuesta a la ventana (`--tab team --slot main` para
   identidad, `--tab resources --slot main` para piezas gráficas).
6. Verifica contraste antes de dar por buena una paleta.

## Reglas

- Prohibido el morado `#7c3aed` y sus parientes, los degradados "estilo IA", el glassmorphism
  y las tarjetas repetidas.
- Nada de fuentes fuera de las declaradas en `brand/tokens.css` sin decirlo y justificarlo.
- Propón; no cambies la identidad del usuario sin que la acepte.
- Contraste WCAG AA como piso, AAA como meta.

## Punteros

- Paleta vigente: `brand/palette.json`.
- Tokens: `brand/tokens.css`.
- Generador desde logo: `scripts/gen_palette.py`.
- Doctrina visual: `PRODUCT.md` y `DESIGN.md`.
- Entregable dossier: `references/dossier-soluciones.md`.

## Dossier de soluciones (entregable editorial)

Cuando el pedido es un dossier de soluciones para retos de rally (PDF + Word + Excel), aplica
esta doctrina. Nació de una revisión real del usuario y es obligatoria.

### Cómo se razona una solución que gana

**1. Primero el banco, después la idea.** `knowledge/retos_razonamiento.json` guarda 20 casos
ganadores con `id`, `temas`, `año`, `rally`, `categoría`, `equipo`, `puesto`, `problema`,
`causa_raiz`, `insight`, `solucion`, `metrica`, `video_url`. Se busca por **verbo del mecanismo**
("reutilizar", "medir", "trazar", "filtrar") y por `temas`, nunca por título del reto. De cada caso
se extraen dos cosas: el `insight` (qué convención rompió) y la `metrica` (qué se mide para probarlo).
Si un campo dice "No documentado en la fuente", no se copia: se razona el mecanismo y la cifra se
marca como estimación. Si existe el caso que ganó ese mismo reto, se lee antes que nada y manda.

**2. Familias de mecanismos que ya ganaron.** Toda propuesta se declara en una de estas familias.
Si no cae en ninguna, es un oficio, no una propuesta.

- **A. Objeto de siempre + instrumentación y control.** Techriders 2024 convirtió una micropresa en
  un sistema con sensores, válvulas y telemetría. Gana porque el objeto tradicional se vuelve
  confiable y medible.
- **B. Residuo + componente nuevo con especificación.** Mentes Volcánicas 2025 (paneles de Tetra Pak
  con ruta de acopio), BottleLife 2017 (envases estructurales). Gana porque el desecho se convierte
  en un producto con ficha técnica, no en artesanía.
- **C. Dato + alguien que decide.** SITRACAFE 2026 (trazabilidad del beneficio de café), Ollnari 2023
  (origen garantizado), Steel Innovators 2026 (red de sensores). Gana si el dato llega a quien tiene
  que actuar esa misma semana.
- **D. Energía integrada a un objeto de uso diario.** LexoStop 2019 (parada eólico-solar), Banca Solar
  2026, DIGNA 2023 (panel más purificación de agua). Gana porque el objeto ya existía y ahora se
  sostiene solo.
- **E. Servicio comunitario que reemplaza la compra del objeto.** AVOCADO 2026 (motores domésticos
  convertidos en tracción comunitaria). Gana porque la comunidad usa el servicio todos los días en
  vez de comprar una máquina.
- **F. Accesibilidad y adaptación al usuario.** BidiSign 2026 (traductor de LENSEGUA), Elohim 2026
  (espacio adaptativo), Geckakz 2016 (juego para niños no videntes). Gana porque cambia quién puede
  usar algo que ya existe.
- **G. Módulo replicable con ruta de acopio.** Stem Synergy 2025 (huertos verticales con materiales
  reciclados), BioInnova 2023 (vivienda con agua, saneamiento y huerto). Gana porque se instala mil
  veces igual y el insumo tiene quién lo recoja.

**3. Cinco pruebas de descarte.** Antes de escribir, la idea pasa las cinco o se descarta:

1. ¿Podría montarlo mañana un taller común, sin nada nuevo? Entonces es un oficio, no una propuesta.
2. ¿El insumo varía tanto (marcas, años, modelos) que no se puede estandarizar? Entonces el mecanismo
   tiene que **medir y adaptarse en el sitio**, no prometer una norma fija ni una garantía por modelo.
3. ¿Alguien lo usa todos los días y paga por el servicio, o se vende una unidad y desaparece?
4. ¿La métrica es física (quintales, litros, vatios, horas, personas) o es una promesa?
5. ¿Qué gana quien lo opera y qué pierde el barrio si no existe?

**4. Anti-patrones.** Estos ya se descartaron y no vuelven:

- Taller que repara y revende el residuo con garantía (el reto 01 cayó aquí).
- Plataforma o app que "conecta" oferta y demanda sin acopio, logística ni operador.
- Capacitación y concientización como núcleo de la solución.
- Sensor o dispositivo suelto, sin nadie que decida con el dato.
- Kit que se entrega sin quién lo opere ni quién cobre por usarlo.
- Solución que depende de donaciones permanentes de tiempo o de insumos.
- Mejorar el mismo producto que ya existe sin cambiar quién lo usa ni quién paga.

**5. La prueba del día 400.** Al día 400, ¿el servicio sigue funcionando?, ¿quién cambió la pieza
gastada?, ¿quién pagó?, ¿qué pasa si el operador se va del barrio? Si la respuesta es "depende de un
proyecto nuevo", la propuesta todavía no está terminada.

### Contenido y pensamiento

- Nosotros **no creamos retos**: el usuario los entrega. Nosotros proponemos soluciones.
- **Dos soluciones por reto.** Opción 01 es la propuesta principal; Opción 02 ataca el mismo
  reto con un **mecanismo distinto**. No tienen que parecerse ni estar conectadas: pueden diferir
  en tecnología, en modelo de negocio, en escala o en la vía de acceso al beneficiario, y ninguna
  depende de la otra. Se piden dos porque el reto admite más de un camino, no porque la segunda
  sea el plan B de la primera. Ambas deben cumplir los criterios del reto y sostenerse solas.
- **Misma jerarquía visual entre las dos opciones.** El nombre de cada solución lleva el mismo
  tamaño y el mismo color (navy), y el rótulo va en el mismo chip. Cambiar tamaño o color de una
  respecto a la otra la degrada a subsección. Ningún nombre de solución repite el cobalto del
  número de reto: ese cobalto es del reto, no de la propuesta.
- **Insignias que aplican** (2 o 3 por reto, después de los ODS): marcos reales de reconocimiento,
  financiamiento o política a los que la solución puede postular — Ciudades Creativas UNESCO,
  Premio Latinoamérica Verde, Fondo de Agua, Fondo nacional de innovación, Marco de Sendai, REP de
  RAEE, Pacto Global, mercado de carbono. Cada insignia va con un calificador de tres o cuatro
  palabras que dice **por qué aplica a este reto** ("turismo de naturaleza", "obra replicable").
  Solo se listan si el mecanismo de la solución las habilita; nunca como relleno ni inventando
  programas.
- Cada solución lleva nombre propio, claim, qué es, cómo funciona, beneficiario, componentes,
  costo estimado y métricas. El diagnóstico solo existe para sostener la propuesta; nunca ocupa
  más espacio que ella.
- **Se escribe para alguien que no sabe del tema.** Ningún término técnico queda sin traducir:
  se nombra el objeto y se explica en la misma frase qué es y para qué sirve ("hotel de nidos:
  bloque de madera con agujeros y cañas huecas donde las abejas solitarias ponen sus huevos";
  "fisurómetro: regla pegada a los dos lados de una grieta"; "bebedero: bandeja poco profunda
  con agua y piedras donde beben los insectos"; "retorta: horno cerrado sin oxígeno").
- **El párrafo de presentación vende y dimensiona.** Abre con la situación concreta que resuelve,
  sigue con qué es la solución y cierra con lo que incluye y en qué cantidad (8 a 12 nodos por
  sector, cuatro manzanas, franja de 3 a 6 metros, ocho puntos de carga). Un párrafo de tres
  líneas no vende: el lector tiene que poder imaginarse el objeto instalado.
- **Los pasos de "cómo funciona" repiten el idioma llano**, no vuelven a la jerga que la
  presentación acaba de traducir.
- **"En la práctica" (obligatorio, uno por solución).** Después de la tabla de datos, un párrafo
  de 350 a 450 caracteres responde cuatro cosas: quién lo opera (junta vecinal, taller del
  barrio, cooperativa, municipio), quién paga y cuánto gana el que opera, de dónde salen los
  insumos y los equipos, y cuánto esfuerzo exige arrancar (personas, metros, horario). Se
  encabeza con el rótulo mono `En la práctica` y una regla vertical gris a la izquierda. Sin este
  párrafo la propuesta se lee como idea abierta: "se instalará" o "los usuarios podrán" no es
  una solución.
- **Nombres que se entiendan solos.** El nombre no es una abstracción corporativa: "MotorBank"
  hace pensar en un banco financiero o en un depósito de motores. Se elige un nombre que diga qué
  hace o qué entrega ("MotorListo", "Turno de Agua", "Briqueta Viva").
- **Es una idea, no un proyecto de ingeniería.** No desarrollar detalle constructivo ni plan de
  obra: la ejecución se resuelve después. Basta con que la idea se entienda y se vea viable.
- **Detalles que suman** (3 por reto): ganchos de buenas prácticas que elevan la propuesta sin
  añadir complejidad — economía circular, energía renovable de bajo costo, ciudades creativas y
  patrimonio (sobre todo en rally nacional), datos abiertos, compras públicas, alianzas con
  universidad o municipio, pago en residuo, empleo local. Se escriben en una línea cada uno y
  siempre conectados a la solución, no como relleno.
- **No hay sección de "lo que el jurado va a atacar".** En este formato el jurado no da derecho a
  réplica: todo se cubre dentro de la propuesta y se demuestra en el video y los documentos.
  El riesgo se resuelve con una decisión de diseño, no con un párrafo de defensa.
- Cadena obligatoria: problema → causa raíz → insight → solución → métrica. La causa raíz
  **nunca** es "No documentado": si falta la fuente, se razona el mecanismo y se marca la cifra
  como estimación a validar.
- **Precedentes por mecanismo.** Los retos casi nunca se repiten entre años, así que se busca el
  caso ganador que resolvió el mismo movimiento (residuo→kit, obra pasiva→telemetría, acopio→
  transformación) y se explica "por qué se parece". Si existe el caso que ganó **ese mismo reto**,
  es el primer precedente y se copia su mecanismo, no su redacción: el reto de motores lo ganó un
  equipo que no revendió motores, los volvió planta motriz de tracción comunitaria. Siempre se
  incluye el link del video; si el caso no tiene video, se dice y se compensa con un segundo
  precedente que sí lo tenga.
- La "señal que se repite en los ganadores" es una frase de patrón, no una estadística interna.
- No mostrar estadísticas internas del motor; solo datos que vendan la solución.

### Anatomía de página

- **Sin portada y sin índice.** El documento abre directo en el reto 01.
- Cabecera del reto: número gigante (64 pt, cobalto) a la izquierda, título a la derecha y
  debajo un chip navy con `CATEGORÍA · 01/09` en una sola línea.
- Orden: descripción breve → ODS → insignias que aplican → "Dos soluciones posibles" → Opción 01
  completa (nombre, claim, qué es, cómo funciona, datos y **En la práctica**) → Opción 02 (página
  nueva, rótulo `Reto NN · Opción 02`, misma estructura) → Detalles que suman (3 columnas) →
  cadena de razonamiento → métricas agrupadas por opción → señal → precedentes → pitch de 60 s →
  **COMENTARIOS** con líneas regladas.
- **Tres páginas por reto.** Página 1: cabecera + ODS + Opción 01. Página 2: Opción 02 +
  detalles + cadena + métricas. Página 3: señal + precedentes + pitch + comentarios.
- ODS con **la figura oficial de la ONU**, no una recreación. Se usa el archivo oficial del ODS
  (`E_SDG_Icons-NN.jpg`, 466×466) como imagen a 11 mm; la figura ya trae el color, el número y
  el pictograma. Prohibido reemplazarla por un cuadrado con el número en blanco, por un ícono
  propio o por un emoji: el lector tiene que reconocer el sello real. Debajo, nombre oficial en
  español y una línea de justificación. Nunca escribir solo "ODS 12".
- Insignias en una fila de píldoras (`border: 1px solid #C8D8EE`): rótulo mono navy y calificador
  en gris. Se acomodan en dos líneas como máximo; si ocupan más, sobra una insignia.
- Nada de páginas huérfanas: si el cierre no cabe, se compacta el ritmo vertical; no se deja una
  hoja con tres líneas.

### Jerarquía visual (no todo gris)

- Etiquetas de tabla y rótulos de sección en **navy `#0D1B35`**, no en gris.
- Acento cobalto `#0866F5` reservado a: número de reto, métrica clave, numeración de pasos y links.
  El nombre de cualquiera de las dos soluciones va en navy: el cobalto es del reto, no de la
  propuesta.
- Cuerpo en `#334155`; gris `#5C7193` solo para metadatos (puesto, notas al pie).
- Cada sección abre con una regla hairline 1 px + rótulo mono en mayúsculas: eso es la
  separación. Sin tarjetas, sin sombras, sin emojis, sin degradados.
- Prohibido el celeste/cian como color de texto; el azul de lectura es navy o cobalto.
- Nada de tablas o bloques cortados a mitad de página: `break-inside: avoid` en filas,
  analogías, grupos de métricas, detalles, pitch y comentarios; `break-after: avoid` en
  encabezados; `break-before: page` en la Opción 02.

### Entregables

- **PDF**: A4, Chrome headless, fuentes locales (`Plus Jakarta Sans` + `JetBrains Mono`).
- **Word**: espejo del PDF con la misma jerarquía, las dos opciones y los ODS como tabla con
  la imagen oficial del ODS insertada en la primera celda (no un número sobre color).
- **Excel**: hoja Panel con todos los retos (propuesta 01, propuesta 02, beneficiario, métrica
  clave, precedente y video) y una hoja por reto con ambas soluciones, detalles, métricas y
  bloque "Comentarios e ideas del equipo" con filas editables (idea, responsable, métrica, fecha).

### Fallos que ya costaron una revisión

Cada punto nació de una corrección del usuario. Si el entregable repite uno de estos, se devuelve.

1. **Una sola solución por reto.** Se piden dos, con mecanismo distinto y sin depender una de la
   otra. La segunda no es "fase 2" de la primera ni un plan B; se sostiene sola.
2. **Solución que cuelga de la otra.** Frases como "vuelve al banco central", "se suma a la
   Opción 01" o "aprovecha la red de la primera" rompen la independencia. Se reescriben.
3. **Jerga sin traducir.** Si aparece un objeto técnico sin explicar, el lector no entiende la
   idea ("hotel de nidos", "fisurómetro", "bebedero", "retorta", "biochar", "transesterificación").
   Todo término se traduce en la misma frase.
4. **Párrafo de presentación corto y sin escala.** Tres líneas no venden: falta la situación, qué
   incluye y cuánto (unidades, metros, litros, número de puntos, garantía). Sin cifras el reto
   suena a eslogan.
5. **Defensa ante el jurado.** No hay réplica. Todo se cubre con la propuesta y el video; el
   riesgo se resuelve con una decisión de diseño, no con un párrafo de ataque/mitigación.
6. **ODS decorativos.** No se eligen por quedar bien: cada ODS va con la razón concreta por la que
   la solución lo toca. Si la justificación sirve para cualquier reto, no sirve.
7. **Insignias inventadas o de relleno.** Solo marcos reales que el mecanismo habilita; si no
   aplica, se deja en dos insignias.
8. **Figura del ODS recreada.** Un cuadrado con el número no es el sello oficial. Se usa la
   imagen oficial de la ONU.
9. **Estadísticas internas del motor** (tasas de acierto, scores de precedentes). Solo datos que
   vendan la solución.
10. **Retos escritos por nosotros.** El usuario entrega los retos; nosotros solo proponemos. Nunca
    se inventa un reto ni se completa el enunciado con supuestos propios.
11. **Páginas casi vacías o elementos cortados.** Antes de entregar se mira el PDF renderizado,
    no solo el conteo de páginas. Y se cuentan las líneas regladas de comentarios: si el bloque
    se pasa del pie, Chrome recorta la última sin avisar.
12. **Propuesta sin operador ni incentivo.** Falta quién la opera, quién paga, cuánto gana y de
    dónde salen los materiales. Se corrige con el párrafo "En la práctica", no con más adjetivos.
13. **Nombre abstracto.** Un nombre que suena a institución ("banco", "fondo", "plataforma")
    antes que a producto confunde al lector. Se prueba el nombre en una frase: si hay que
    explicarlo, se cambia.
14. **Solución de oficio obvio.** Reparar y revender el residuo con garantía, sin capa técnica ni
    servicio colectivo. Cualquier taller lo hace, el insumo varía por marca y año, y no hay razón
    para que la gente vaya. Se corrige buscando qué función diaria puede prestar ese residuo y qué
    medición la vuelve confiable.

### Validación antes de entregar

1. Contar páginas: 3 por reto, sin huérfanas; revisar el `y` máximo de cada página.
2. Buscar palabras prohibidas (`saturacion`, `probabilidad`, `win rate`, `winrate`, `score`)
   y la cadena "No documentado".
3. Verificar que cada reto tenga sus 2 soluciones independientes, 2 o 3 insignias, 3 detalles,
   sus links de video, sus ODS con **la imagen oficial** (no un cuadrado con número) y **un
   párrafo "En la práctica" por solución**.
   Cada solución declara su familia de mecanismo (A–G) y pasa las cinco pruebas de descarte.
4. Renderizar páginas a PNG y mirar: sin cortes, sin grupos de métricas partidos entre páginas,
   sin repetición circular del nombre del reto.
5. Contar las líneas regladas de COMENTARIOS en el PDF: si la última queda fuera del área útil,
   se baja a la cantidad que entre (11 en A4 con esta maqueta).
