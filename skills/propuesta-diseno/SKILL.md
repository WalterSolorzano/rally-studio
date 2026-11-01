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

### Contenido y pensamiento

- Nosotros **no creamos retos**: el usuario los entrega. Nosotros proponemos soluciones.
- **Dos soluciones por reto.** Opción 01 es la propuesta principal; Opción 02 ataca el mismo
  reto con un **mecanismo distinto** (no es la misma idea con otro nombre: una pasa por
  infraestructura y la otra por gestión comunitaria, o una por producto y la otra por servicio).
  Ambas deben cumplir los criterios del reto y ser defendibles por separado.
- Cada solución lleva nombre propio, claim, qué es, cómo funciona, beneficiario, componentes,
  costo estimado y métricas. El diagnóstico solo existe para sostener la propuesta; nunca ocupa
  más espacio que ella.
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
- **Precedentes por mecanismo, no por nombre del reto.** Los retos casi nunca se repiten entre
  años. Se busca el caso ganador que resolvió el mismo movimiento (residuo→kit, obra pasiva→
  telemetría, acopio→transformación) y se explica "por qué se parece". Un ganador del mismo
  reto no es evidencia, es circularidad. Siempre incluir el link del video.
- La "señal que se repite en los ganadores" es una frase de patrón, no una estadística interna.
- No mostrar estadísticas internas del motor; solo datos que vendan la solución.

### Anatomía de página

- **Sin portada y sin índice.** El documento abre directo en el reto 01.
- Cabecera del reto: número gigante (64 pt, cobalto) a la izquierda, título a la derecha y
  debajo un chip navy con `CATEGORÍA · 01/09` en una sola línea.
- Orden: descripción breve → ODS → "Dos soluciones posibles" → Opción 01 completa → Opción 02
  (página nueva, rótulo `Reto NN · Opción 02`) → Detalles que suman (3 columnas) → cadena de
  razonamiento → métricas agrupadas por opción → señal → precedentes → pitch de 60 s →
  **COMENTARIOS** con líneas regladas.
- **Tres páginas por reto.** Página 1: cabecera + ODS + Opción 01. Página 2: Opción 02 +
  detalles + cadena + métricas. Página 3: señal + precedentes + pitch + comentarios.
- ODS con **figura**: badge cuadrado del color oficial del ODS con su número en blanco, nombre
  y una línea de justificación. Nunca escribir solo "ODS 12".
- Nada de páginas huérfanas: si el cierre no cabe, se compacta el ritmo vertical; no se deja una
  hoja con tres líneas.

### Jerarquía visual (no todo gris)

- Etiquetas de tabla y rótulos de sección en **navy `#0D1B35`**, no en gris.
- Acento cobalto `#0866F5` reservado a: número de reto, nombre de la propuesta principal,
  métrica clave, numeración de pasos y links. La Opción 02 se titula en navy para no competir.
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
  celda de color.
- **Excel**: hoja Panel con todos los retos (propuesta 01, propuesta 02, beneficiario, métrica
  clave, precedente y video) y una hoja por reto con ambas soluciones, detalles, métricas y
  bloque "Comentarios e ideas del equipo" con filas editables (idea, responsable, métrica, fecha).

### Validación antes de entregar

1. Contar páginas: 3 por reto, sin huérfanas; revisar el `y` máximo de cada página.
2. Buscar palabras prohibidas (`saturacion`, `probabilidad`, `win rate`, `winrate`, `score`)
   y la cadena "No documentado".
3. Verificar que cada reto tenga sus 2 soluciones, 3 detalles, sus links de video y sus ODS con
   figura.
4. Renderizar páginas a PNG y mirar: sin cortes, sin grupos de métricas partidos entre páginas,
   sin repetición circular del nombre del reto.
