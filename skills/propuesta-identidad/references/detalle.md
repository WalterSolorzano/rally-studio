## Fuentes

- Biblioteca única: `design/fonts.js` → `FONT_LIBRARY` (**243 familias** verificadas por HTTP en
  10 grupos: sans 50, serif 39, display 39, condensada 9, cartoon 25, elegante 6,
  experimental 27, manuscrita 20, tecnica 12, mono 16), servidas desde Google Fonts con
  `loadFont(familia, pesos)`.
- `allFontOptions()` arma el selector con esos grupos; `parejaAleatoria()` elige título y
  cuerpo de grupos distintos para que dos propuestas no salgan con la misma pareja.
- Vetadas las tipografías viejas: `FONT_VETADAS` (Times New Roman, Georgia, Garamond, Arial,
  Courier, Verdana, Calibri, Comic Sans, Impact, Papyrus, Futura…) y `esFuenteVetada()` las
  rechaza tanto en `loadFont` como en `loadFontFromUrl` (por el `family=` de la URL). El kit
  avisa `'Fuente retirada: … es tipografia vieja.'`.
- `loadFontFromUrl` solo acepta `https` de `fonts.googleapis.com`, `fonts.gstatic.com`,
  `fonts.bunny.net`, `use.typekit.net` o `cdn.jsdelivr.net`. Cualquier otro host se bloquea y
  el kit lo informa en `statusKit`.
- `loadFont` sanea familia (`^[A-Za-z0-9][A-Za-z0-9 -]{0,60}$`) y pesos (`400;700` si vienen
  corruptos). Familia inválida no genera `<link>`.
- Una fuente sugerida por IA solo se aplica si está en `FONT_LIBRARY` (`fuenteOk()` en
  `kit.js`); si no, se queda la actual. Nunca inventar familias; `ia.js` arma sus prompts de
  `_titulos()` / `_cuerpos()` leyendo la biblioteca, no una lista fija.

## Prohibiciones gráficas

- **Thumbnail y piezas de portada:** prohibido resolver el gráfico con cuadrados,
  rectángulos, círculos o triángulos. Se usa foto real, vector complejo o un modelo de
  Blender; banco de imágenes cuando falte el objeto.
- **Carrusel:** sí puede usar figuras básicas como estructura.
- La imagen del thumbnail debe mostrar el **reto ya resuelto y su impacto**, no decoración.
  Se guarda en `S.thHeroImg` (local, dataURL, no se sincroniza), con efecto en `S.thHeroFx`
  (`foco | zoom | barrido | blur`).
- **Prioriza una foto real de la problemática y del reto** (personas, oficio, territorio,
  comunidad) sobre cualquier ilustración o render. Fuentes: Unsplash, Pexels o foto propia.
  Una ilustración solo si no existe registro fotográfico de la escena. Si no hay foto real,
  la portada queda marcada como pendiente: no se rellena con figuras ni se inventa la escena.
- La imagen no lleva texto, logos ni marcas de agua: el texto lo pone la plantilla.

## Reglas del thumbnail (fallos reales que no se repiten)

Comprobarlas en las seis variantes (`editorial, mapa, bold, minimal, poster, diagonal`),
no solo en la activa:

- **Contraste de titular:** claro sobre fondo oscuro, tinta sobre papel claro. Nunca tinta
  oscura sobre fondo oscuro; el caso `editorial` sin foto es oscuro y exige titular claro.
  Si la identidad trae un `bg` oscuro, `minimal` fuerza papel blanco (`thumbPaper()`).
- **Contraste de etiquetas:** ningún texto con menos de 4.5:1. La etiqueta de la esquina no
  usa fondos translúcidos claros con texto blanco (caso `diagonal`).
- **Croquis de Nicaragua siempre visible y completo:** dentro del lienzo, sin recortes en
  los bordes, con opacidad y trazo suficientes para reconocerse en las seis variantes. Si un
  adorno (círculo, disco, degradado) lo tapa, se quita el adorno. Pisos verificados en
  `kit.css`: `minimal` relleno ≥ .45, `bold` trazo 1.5 op .75, `poster` trazo 1.6 sobre
  papel, `diagonal` 28% abajo a la derecha. El croquis nunca va debajo de un adorno con
  `z-index` mayor.
- **Sin número de reto en la esquina:** "01" no comunica nada a un jurado. La esquina lleva
  una etiqueta de texto o el hashtag del equipo (`retoLabel()`); nunca un número suelto.
- **Sin duplicar el nombre del grupo:** vive en la cabecera. El pie muestra ciudad o
  etiqueta propia, jamás el mismo nombre (`kickerText()`).
- **Titular centrado verticalmente** entre la cabecera y la banda de firma, no pegado arriba.
- **Sin figuras básicas** (círculos, discos, triángulos) como decoración de portada.

## Rostros e iconos de asistente

Cuando una pieza lleva caras (avatares de asistentes, mascotas, iconos con carácter):

- **La cara se deriva del dibujo, no se pone a ojo.** Ojos y boca se calculan desde el
  radio del objeto (`er = r*0.135`, `ex = r*0.42`, boca `mw = r*0.42`). Coordenadas
  sueltas terminan con ojos flotando fuera de la figura o encima de un trazo.
- **Placa blanca detrás de la cara** antes de dibujar ojos y boca: ningún trazo del
  objeto puede cruzar el rostro.
- **Ojos chicos y asimétricos** (uno ~20% mayor). Ojos gigantes con brillo se leen como
  dibujo animado infantil, no como humor. La gracia va en lo que hace el objeto, no en
  la cara: cara muerta, situación absurda.
- Ceja solo si cambia el significado (duda, sospecha), nunca como adorno.
- Verificar sobre una hoja de contactos renderizada, no sobre el código: un `<rect>` o
  `<path>` sin `fill` sale **negro** en Chromium, y un `fill` duplicado invalida el SVG
  entero y lo deja en blanco.

## Banderas de país

Los emoji de bandera **no existen en Chromium sobre Windows**: salen las dos letras del
código de país. Nunca uses emoji para un dato.

- Dibuja la bandera como SVG de franjas (`<rect>` horizontales o verticales) y, cuando
  aplique, el cantón y el emblema simplificado (sol, rombo, escudo).
- Tamaño mínimo legible: 24×17 px. Va acompañada del número o del nombre, nunca sola.
- Si el país no tiene bandera dibujada, usa el nombre; no inventes una bandera genérica.


## Prueba antes de entregar

1. `node --check` en `shared.js`, `fonts.js`, `ia.js`, `kit.js`, `thumb.js`.
2. Abrir las cuatro páginas desde `http://127.0.0.1:8000/design/` y confirmar que
   `RallyDiseno` y el botón **IA diseño** existen.
3. `RallyDiseno.aplicarPatch({pal:{ac:'#…'}})` cambia `S.pal.ac`, el storage y el DOM.
4. `RallyDiseno.sincronizar()` devuelve `version`; recargar en perfil limpio aplica la
   sección remota.
5. En thumbnail: `minimal` sin imagen es tinta sobre papel claro; `editorial` sin imagen es
   titular claro sobre fondo oscuro. Con imagen, el titular es blanco y la capa `.hero`
   tiene la clase `fx-*`. Capturar las seis variantes a 1280×720 y mirar la imagen: el
   croquis debe reconocerse completo en cada una, sin "01" en la esquina ni nombre de grupo
   repetido en el pie.

## Generación de prompts para llevar la identidad a otra IA

Cuando el usuario quiera exportar la paleta, tipografías o tokens a otra IA
(OpenAI, Claude, Gemini, OpenCode, Antigravity…), genera el prompt con esta
estructura:

```
Rol: diseñador de identidad visual para proyectos de innovación universitaria.
Contexto: Rally de innovación, certamen <rally_type>, proyecto <project_name>,
  equipo <team_name>, ciudad <city>.
Entrada: `brand/palette.json`, `brand/tokens.css`, `design/fonts.js` (FONT_LIBRARY),
  `PRODUCT.md`, `DESIGN.md`.
Tarea: Generar propuestas de identidad visual (paleta, tipografías, tokens,
  dirección de logotipo, elementos gráficos).
Restricciones:
  - Sin morado (#7c3aed o similar), sin degradados estilo IA, sin glassmorphism,
    sin tarjetas repetidas.
  - Sin emojis como íconos en la web demo.
  - Fuentes solo de `FONT_LIBRARY` (243 familias verificadas).
  - Contraste WCAG AA como piso, AAA como meta.
  - Paleta de 5 colores con HEX y contraste del primario sobre el fondo
    (mínimo 4.5:1, objetivo 7:1).
  - Nombrado de assets: asset_<shotlist_id>_<descripcion>.<ext>.
Formato de salida: JSON con claves proyecto, equipo, ciudad, direccion (2
  opciones), paleta (5 colores HEX), tipografias (titulos/cuerpo/datos),
  personalidad (3 palabras), anti_ejemplos (2), concepto_logo, elementos_graficos
  (descripción de cada uno), contraste_verificado.
Idioma: español.
```

## Cómo sugerir un título o nombre de proyecto o producto

Sigue los patrones reales del banco SIRLI (`research/sirli/winners.jsonl`):

- **Inventado**: NEXORA, KINETIX
- **Objeto**: AVOCADO, LUMBRE
- **Compuesto**: NEXO-SOSTENIBLE
- **Territorio + número**: ALTIPLANO 360
- **Sufijo técnico**: BIOINNOVATECH
- **Juego**: DESUCHO, ERROR 404

Reglas:
- Nunca repites el nombre del proyecto más de una vez por sección.
- No hardcodees el nombre en scripts; léelo siempre de `brief.json`.
- El nombre debe entenderse fuera del país (Latam) o tener arraigo cultural
  (Nacional).
- El nombre no va en los primeros 20 s del video.
- Slogan, misión, visión e inspiración se recombina solo con lo que el usuario
  escribió. No inventas proyecto, público ni cifras.

## Cómo enseñar visualmente (identidad y materiales didácticos)

- Una sola distancia focal por secuencia con rótulos.
- Antes de dar por bueno un rótulo, mídelo: proyecta su caja a coordenadas de
  pantalla (u,v) y comprueba que queda dentro del cuadro con margen ≥6 %.
- Contraste garantizado: texto claro emisivo sobre placa oscura propia, o sombra
  de texto desplazada. Nunca texto gris sobre fondo iluminado.
- Un rótulo sin flecha que apunte a la pieza no dice nada.
- Varios rótulos en el mismo lado se pisan: lleva un registro por lado y reubica
  el siguiente candidato vertical hasta que no choque.
- Tipografía: regular antes que bold (el bold a 540p embota los acentos),
  acentos reales en español, tamaño ≥2 % de la altura del cuadro.
- El croquis de Nicaragua siempre visible y completo, sin recortes en los bordes.

## Cómo redactar guiones cuidando la pronunciación y el orden de palabras

- Escribe para ser escuchado, no leído: oraciones cortas, sujeto-verbo-objeto,
  evita subordinadas encajadas.
- Acentos reales en español; acrónimos se deletrean si no son de uso común.
- Cada cambio de idea necesita una pausa o transición explícita.
- Máximo 240-270 palabras (≈130-140 WPM) para ≤ 120 s de audio.
- No repitas el nombre del proyecto más de una vez por sección.

## Cómo sugerir elementos gráficos

- Thumbnail y piezas de portada: prohibido resolver con cuadrados, rectángulos,
  círculos o triángulos. Usa foto real, vector complejo o un modelo de Blender.
- La imagen del thumbnail muestra el reto ya resuelto y su impacto, no
  decoración.
- Prioriza una foto real de la problemática y del reto (personas, oficio,
  territorio, comunidad) sobre cualquier ilustración o render.
- La imagen no lleva texto, logos ni marcas de agua: el texto lo pone la
  plantilla.
- Elementos gráficos se exportan como PNG 2048×2048 con fondo transparente.
- Sin emojis como íconos en la web demo.
- Sin cards genéricas, sin morado (#7c3aed o similar), sin fuentes fuera de
  `brand/tokens.css`.

## Cómo crear modelos 3D (referencia)

Cuando la identidad necesite un modelo 3D para el video, la skill
`modelo-3d-blender` genera modelos o renders 3D con Blender, con ficha técnica
previa justificada por la rúbrica. Ver `skills/modelo-3d-blender/SKILL.md`.

- Nada de fuentes fuera de las declaradas en `brand/tokens.css` sin decirlo y justificarlo.
- Propón; no cambies la identidad del usuario sin que la acepte.
- Contraste WCAG AA como piso, AAA como meta.
- Si el equipo ya fijó marca y no quiere cambiarla, esta skill no se ejecuta.

## Criterios de diseño de UI (obligatorios)

Valen para cualquier app móvil, página web o prototipo de `site/`:

1. **Plan antes de ejecutar.** No se escribe HTML ni CSS sin un plan aprobado de
   una página: qué pantallas hay, qué muestra cada una, qué acción simula y qué
   se ve primero. Sin plan aprobado no arranca el código.
2. **Impeccable siempre.** Toda pregunta o decisión de diseño se resuelve con la
   skill `impeccable` cargada; si no está disponible, `ui-ux-pro-max` o
   `design-system`. Nunca se diseña de memoria.
3. **Paleta primero.** Si `brand/palette.json` ya está aprobada, se usa; solo se
   propone paleta nueva si no existe o el usuario pide cambiarla.
4. **Responsive obligatorio.** Se prueban tres anchos en el navegador: 375 px
   (móvil), 768 px (tablet) y 1280 px (desktop), con captura de cada uno. Sin los
   tres, no está entregado.
5. **Espaciado estandarizado.** Solo la escala de `DESIGN.md` (`xs 4, sm 8,
   md 12, lg 16, xl 24`). Sin márgenes inventados por elemento.
6. **Baneado lo genérico de IA:** cards como contenedor por defecto, morado
   #7c3aed, glassmorphism, degradados decorativos, emojis como íconos, sombras
   difusas y bordes redondeados en todo. La estructura se hace con jerarquía
   tipográfica, filas y divisores hairline (doctrina cardless de `DESIGN.md`).
7. **Visual antes que mecánico.** Lo que se entrega es un **recorrido por la UI
   que simula cómo funciona**: el estado se ve en pantalla con datos de ejemplo
   del brief, no formularios vacíos que solo existen para verse.
8. **Poco y claro.** Cada página muestra solo lo que el jurado necesita para
   entender el producto. Si un dato no ayuda, no va; nada de relleno.
9. **Recursos.** Si falta imagen, ícono, modelo o patrón, se genera con
   `modelo-3d-blender` o con un subagente y se sirve desde `assets/`.

## Herramientas de diseño

`impeccable` es **obligatoria** para todo criterio de diseño: se carga antes de
opinar. `ui-ux-pro-max` y `design-system` son refuerzos que se consultan con
`python scripts/herramientas.py necesita "<tarea>"` solo si impeccable no cubre
la tarea. La identidad se resuelve igual con preguntas, contraste medido y tokens
escritos a mano; esas herramientas guían el criterio, no sustituyen
`brand/tokens.css`.

## Punteros

- Paleta vigente: `brand/palette.json`.
- Tokens: `brand/tokens.css`.
- Generador desde logo: `scripts/gen_palette.py`.
- Doctrina visual del producto: `PRODUCT.md` y `DESIGN.md`.
