---
name: storyboard
description: Convierte el guion PAS-V y la rúbrica del certamen en el storyboard de grabación del video de 120 s: tomas con contrato, dueño, tiempo y criterio de rúbrica, compiladas con build_shotlist.py, con referencias visuales encontradas o creadas para cada toma y un tablero compacto de qué buscar y qué crear. Úsala cuando haya que decidir qué se ve en cada segundo, repartir el trabajo entre especialistas, buscar o crear referencias, o auditar un shotlist.
---

# Storyboard — qué se ve en cada segundo

El storyboard no es un guion con dibujos: es **el contrato entre el director y cada
especialista**. Una toma sin `rubric_item` es trabajo que no suma puntos; una toma sin
`owner` es trabajo que nadie hace.

## Cuándo usarla

- Hay guion o al menos solución aprobada y hay que pasar a "qué se graba".
- Hay que repartir el video entre modeler, grafista, presupuestador, director.
- Hay que auditar un `shotlist.csv` que ya existe.
- El jurado o el equipo pregunta "¿esto qué puntos cubre?".
- El equipo pide "algo visual para saber qué buscar o crear" antes de grabar.

## Frontera con los motores

Este skill **produce contratos, fichas y tableros**. No toca el motor: ni
`scripts/build_shotlist.py`, ni `scripts/gen_script.py`, ni `tools/remix_audio.py`,
ni la máquina de estado del dashboard. Si algo del motor estorba (tiempos de audio,
whitelist de dueños), se reporta y se pide permiso; no se edita por cuenta propia.
El guion y la investigación profunda son fuente de verdad: el storyboard los lee, no
los reescribe.

## Precondición dura

No se escribe ni una toma si `brief.json` no tiene `project_name`, `team_name`,
`university`, `city` y `challenge_title`. Si faltan, **pregunta**; no los rellenes con un
ejemplo. Un storyboard inventado se ve perfecto y arruina la entrega.

## Los tres datos que bloquean tomas

Antes de empezar, mira qué está vacío. Cada falta bloquea tomas concretas:

| Falta | Bloquea | Por qué |
|---|---|---|
| `brief.json` vacío | rostros, territorio, cierre regional | no sabes a quién filmas ni qué ciudad nombras |
| `research/claims.json` = `[]` | toda toma con cifra del problema o del impacto | una cifra sin fuente viola la regla 2 del repo |
| `budget/budget.json` = `[]` | toda toma de costo | sin desglose no hay costo unitario ni costo por beneficiario |

Declara esas tomas como **bloqueadas** en `status` o en `notes`. No las rellenes con
estimaciones "que suenan bien".

## Procedimiento

### 0. El guion manda; el storyboard traduce

Antes de escribir una toma, el guion debe existir y ser específico del proyecto (reto,
causa, insight, mecanismo, prueba, economía). El storyboard **no inventa narrativa**: no
crea cifras, no reordena actos y no introduce beneficios ausentes del guion. Si una toma
necesita una frase que el guion no dice, se corrige el guion y se recompila el CSV.

Prueba de que el guion es específico: tapar el nombre del proyecto; si el texto sirve
igual para otro equipo, está rellenado con plantilla y no se puede storyboardear con
honestidad.

### 1. Fija los segundos, no los minutos

La rúbrica reparte el audio en fracciones, no en números redondos. Multiplica:

```
Acto I   0,17 × 120 = 20,4 s
Acto II  0,33 × 120 = 39,6 s
Acto III 0,29 × 120 = 34,8 s
Acto IV  0,21 × 120 = 25,2 s
```

Puedes usar decimales (`duration_s: 7.4`). El total debe dar **120,0 exactos**. Redondear
cada acto a un múltiplo de 5 desplaza hasta 4 pp y el video queda desalineado con la
rúbrica.

### 2. Diseña por acto con la gramática del corpus

| Acto | Debe verse | No debe verse | Fuente |
|---|---|---|---|
| I · Dolor | primer plano humano o territorial; detalle material de la pérdida; topónimo | logos, nombres del equipo, lectura del desafío, diapositiva de objetivos | `INFORME_INVESTIGACION` §9.2 |
| II · Mecanismo | solución nombrada; el mecanismo visible con el lenguaje que pide ese reto (render 3D, prototipo físico, corte, explosionada, diagrama de proceso, captura de interfaz, demo) | beneficios antes que mecanismo; render de relleno sin función | §9.3 |
| III · Prefactibilidad | costo unitario, alcance del piloto, quién paga, sostenibilidad | TIR, VAN, una cuarta cifra | §9.4 |
| IV · Cierre | vuelta al rostro del Acto I, tríada de métricas, escalabilidad regional | "gracias", logo final | §9.5 |

**El 3D es el tronco, no un adorno opcional.** El promedio de los ganadores internacionales
muestra "CAD 3D, vistas explosionadas" (§8.5) y el registro 2014–2026 lo repite: el 3D es
el lenguaje con el que un jurado técnico ve *cómo funciona* algo que todavía no existe. La
columna de viabilidad admite "diseño en 3D **o** prototipo físico", y hay campeones sin
render (BottleLife 2017, Ingeniarte 2021, Mentes Volcánicas 2025, MT Soluciones Creativas
2021 con maqueta física), pero eso no autoriza a saltarse el 3D: obliga a **pensar cómo se
aplica**.

Antes de diseñar el Acto II, decide el lenguaje con evidencia, en este orden:

1. **Intenta el 3D primero.** Pregunta: ¿qué parte de esta solución se puede modelar?
   Casi siempre hay algo: la pieza, el módulo, el ensamble, el flujo dentro del equipo, la
   comparación antes/después de la geometría, el corte que muestra el interior, la vista
   explosionada de los componentes, el montaje en el sitio real, la escala contra una
   persona. Si el reto es de proceso, servicio o dato, modela igual el **objeto físico que
   ese proceso toca** (bandeja, contenedor, sensor, punto de acopio, ruta) o el
   antes/después volumétrico.
2. **Si el 3D literal no aporta, adapta el lenguaje, no lo elimines.** Diagrama de proceso
   con volumen, corte esquemático, maqueta digital del flujo, gemelo del sistema en
   perspectiva, animación de cómo se mueve el material o el dato. La prueba es la misma:
   ¿el jurado entiende el mecanismo en 40 s sin que nadie se lo explique?
3. **Solo si de verdad no hay nada que modelar** (política, modelo de gestión puro,
   campaña), se declara en `notes` **qué se intentó en 3D y por qué se descartó**,
   argumentado por la naturaleza de la solución, no comparando con un ganador ajeno.
   "No aplica" sin ese intento escrito es un atajo, no una decisión.
4. Mirar ganadores **no es elegir plantilla.** Los retos casi nunca se repiten: si buscas
   "el ganador del mismo reto" y copias su lenguaje, produces la copia de la copia. El
   registro 2014–2026 se lee como **análisis de técnica**: cómo resolvieron el video, qué
   hicieron para ganar (cómo abrieron el mecanismo, cómo mostraron costo, cómo cerraron,
   qué ritmo, qué plano). De ahí se extrae el *criterio*, no el guion. La solución, el
   mecanismo y la idea visual se deciden leyendo el reto concreto en
   `research/challenges.json` y su propuesta en `research/soluciones_actuales.json`.
5. Regla mínima: **dos tomas de mecanismo**, y al menos una debe ser 3D o derivada de un
   modelo 3D cuando exista una pieza física que modelar.

### 2b. Innova en la forma, no en los datos

El jurado ve decenas de videos iguales: logo, diapositiva, voz en off explicando. Lo que
diferencia a un ganador es una **idea visual** que nadie más hizo con ese reto. En cada
toma pregúntate: *¿esta toma se podría haber hecho para cualquier proyecto?* Si la respuesta
es sí, no está terminada.

Criterios de forma que aparecen una y otra vez en el registro. Son **técnicas**, no
plantillas: se adaptan al reto propio, nunca se copian con su tema.

- **Medir el problema en pantalla**: llenar el cuadro con la cantidad real que se pierde
  (cajas, sacos, litros), no con una cifra flotante.
- **El objeto como protagonista**: el componente abierto, la pieza gastada, el residuo que
  se convierte, filmado como si fuera un producto de diseño.
- **Escala humana**: la mano, el cuerpo o la cinta métrica junto al modelo 3D para que el
  tamaño se entienda sin leer.
- **Antes/después en el mismo encuadre**, mismo lente, misma luz, mismo sujeto.
- **El bisne real**: alguien usando la solución, no el equipo posando con ella.
- **Herramientas del repo al servicio de la toma**: modeler para el 3D y las vistas
  explosionadas, grafista para el diagrama y el motion, presupuestador para la tabla,
  investigador para la cifra con fuente, recursos-video para el material de archivo. Si una
  toma puede resolverse con una herramienta que ya existe en el sistema, esa es la ruta,
  no externalizarla.
- **El detalle inesperado**: el sonido del mecanismo, el reflejo en el policarbonato, la
  textura que no se ve en un render limpio.

Prohibido confundir innovación con efectismo: sin transiciones de moda, sin zooms
gratuitos, sin emojis, sin morado `#7c3aed`. La innovación se mide en que el mecanismo se
entienda mejor, no en que el corte sea más llamativo.

### 2c. Diseña el sonido y las transiciones, no solo la imagen

El jurado juzga un video, no una presentación de fotos. Si el tablero solo dice qué se ve,
el editor improvisa y el resultado suena a plantilla. Cada toma lleva **dos decisiones más**:

| Campo | Qué se decide | Ejemplos que funcionan |
|---|---|---|
| `audio` | qué se oye en esa toma: música, sonido del objeto, silencio, voz | «solo ambiente de mercado, sin música»; «clic del pestillo cuando cierra»; «silencio 0,5 s antes de la cifra»; «cama baja, pulso 90 bpm» |
| `transicion` | cómo entra y cómo sale | «corte seco desde negro»; «match cut caja → bandeja»; «J-cut: la voz entra antes que la imagen»; «whip pan al mecanismo»; «fundido a negro de 4 frames» |

Reglas de sonido:

1. **Un color musical por acto, no una pista de fondo única.** El Acto I puede ir sin música
   (ambiente real); el II entra con pulso cuando aparece el mecanismo; el III baja a un tono
   sobrio para que las cifras se oigan; el IV resuelve. El cambio de acto se marca con el
   audio, no con un rótulo.
2. **La música se elige por tono y por lugar, nunca por costumbre.** La misma pista épica
   para todos los retos es la señal más rápida de video genérico. Antes de elegir, responde
   dos preguntas: ¿qué emoción pide esta historia? ¿de dónde es?

   | Si el reto es… | La música debe ser… | No uses |
   |---|---|---|
   | pérdida, duelo, abandono (Acto I) | escasa o inexistente; ambiente real, una nota sostenida | tambores épicos, «inspiracional» de librería |
   | comunitario y local (mercado, campo, barrio, oficio) | **del lugar**: instrumentos y ritmo reconocibles de esa región | música «latina» genérica, tropical de stock |
   | técnico, de mecanismo o de proceso | pulso limpio, pocos elementos, sin melodía que compita con la voz | orquesta completa, coros |
   | de cuidado o salud | cálida, lenta, sin dramatismo | cuerdas de suspenso |
   | de residuo, agua o energía | texturas, sonidos del material | épica de superación |
   | cierre y escala regional | la misma música local del Acto II, más cálida y resolviendo en el acorde inicial | himno genérico, subida de volumen artificial |

   Regla dura: si el problema es de un lugar, **la música tiene que sonar de ese lugar**. Un
   reto de un mercado nicaragüense con una pista nórdica de librería delata que nadie pensó
   en el territorio. Lo local no es adorno: es parte de la doble codificación.
3. **El sonido del objeto es la mejor prueba.** Un mecanismo que suena —el ventilador, el
   cierre, el grano cayendo— es más creíble que cualquier render mudo. Si la toma es un
   render 3D, el diseño de sonido lo aterriza.
4. **La cifra clave va sin música.** Bajar la cama 1–2 s bajo el dato duro hace que el
   jurado lo escuche. Música épica sobre el número lo vuelve decorado.
5. **El silencio es un recurso.** Medio segundo de nada antes de un corte o de un dato vale
   más que un whoosh.
6. **Nada de efectos en cada cambio.** Un whoosh por transición es la firma del video
   genérico. Máximo **una transición llamativa por acto**; el resto, corte seco.
7. **La voz manda sobre la música.** Si hay locución, la cama baja 6–9 dB bajo la voz y
   desaparece en la cifra y en la frase de cierre. Nunca compiten.

Reglas de transición:

- **Corte seco por defecto.** Es el que no envejece y el que el jurado no nota.
- **Una transición con significado por acto**: match cut cuando dos objetos comparten forma
  (caja → bandeja), corte al movimiento, J-cut/L-cut para adelantar la voz, barrido cuando
  el espacio es el mismo.
- **Prohibido** el repertorio de plantilla: giros 3D, film burn, glitch, zoom con rebote,
  letras que explotan. Si la transición llama más la atención que el contenido, está mal.
- La transición existe para **unir dos ideas**, no para tapar un salto de calidad entre
  tomas.

### 3. Escribe una toma por archivo

**No hay un número fijo de tomas.** El límite es el tiempo del acto y la claridad, no una
cuota. Un acto de 20 s puede tener 2 tomas largas o 6 cortas; lo que no puede es tener una
toma que no diga nada. Regla práctica: cada toma existe porque **cambia lo que el jurado
sabe** o **cambia lo que ve**. Si dos tomas cuentan lo mismo, se fusionan; si una idea
necesita tres encuadres para entenderse, se abren tres. Un storyboard de 9 tomas puede ser
mejor que uno de 20 y viceversa.

`shots/<ID>.yaml`, con estos campos y ninguno inventado:

| Campo | Regla |
|---|---|
| `id` | `S01`, `S02`… único |
| `act` | `I`, `II`, `III`, `IV` |
| `description` | qué se ve, en una frase concreta (no "plano bonito") |
| `asset_id` | `asset_<id>_<descripcion>`; para `modeler`, el `asset_id` del BOM |
| `asset_type` | `video_real`, `video_stock`, `render_3d`, `motion_2d`, `diagrama`, `captura_ui`, `tipografia`, `tabla`, `grafico_2d` |
| `duration_s` | número, puede llevar decimales |
| `status` | `pendiente`, `asignado`, `bloqueado`, … |
| `notes` | la regla de corpus que justifica la toma, con § |
| `rubric_item` | **obligatorio**; varios ítems separados por `;` |
| `claim_ids` | solo ids que existan en `research/claims.json`, separados por coma |
| `owner` | ver tabla de dueños |
| `depends_on` | ids de tomas que deben existir antes |
| `quality_tier` | `draft`, `revisar`, `final` |
| `audio` | opcional y **no compilado**: lo que se oye en la toma (música, sonido del objeto, silencio, voz). Va al tablero |
| `transicion` | opcional y **no compilado**: cómo entra y sale la toma |

Los dos últimos campos los ignora `build_shotlist.py` (solo valida los obligatorios), pero
no son decorativos: sin ellos el editor improvisa y el video suena a plantilla.

### 4. Asigna el dueño por tipo de asset

El compilador solo acepta ciertos dueños, y el tipo de asset decide cuál:

| asset_type | owner |
|---|---|
| `video_real` | `director` |
| `video_stock`, `video_macro` | `director` (o `recursos-video` cuando el whitelist lo incluya) |
| `render_3d` | `modeler` |
| `motion_2d`, `diagrama`, `tipografia`, `grafico_2d` | `grafista2d` |
| `captura_ui` | `grafista2d` |
| `tabla` | `presupuestador` o `pautador` |
| texto y voz | `guionista` |

Dueño válido en el compilador hoy: `guionista`, `modeler`, `pautador`, `presupuestador`,
`investigador`, `grafista2d`, `director`. **No existen** `web`, `voz`, `editor` ni
`recursos-video` en el whitelist: si una toma es de esos roles, ponle el dueño legal más
cercano y dilo en `notes`, o pide que se amplíe el whitelist. No dejes 8 tomas en
`grafista2d` porque "es el que dibuja".

### 5. Si el dueño es `modeler`, mira el BOM

`build_shotlist.py` indexa `budget/bom.csv` por la columna **`asset_id`** y exige que esa
fila tenga al menos una columna que empiece con `dim_` y termine en `_mm`
(`dim_ancho_mm`, `dim_alto_mm`, `dim_fondo_mm`). Cabecera canónica:

```
asset_id,nombre,tipo,dim_ancho_mm,dim_alto_mm,dim_fondo_mm,material
```

Si la cabecera cambia aunque sea un nombre, **ninguna toma de modeler compila** y el error
habla de un asset que sí existe. Cuando eso pasa, revisa la cabecera antes de tocar las
tomas.

### 6. Consigue la referencia: buscarla o crearla

Ninguna toma se planifica a ciegas. Hay **dos rutas válidas** y ninguna es obligatoria por sí
sola: buscar material que ya existe, o **crear la referencia visual**. Lo que no vale es
llenar el hueco con un banco genérico y llamarlo referencia del territorio.

**Ruta A — buscar material existente.** Un banco de imágenes te da «un mercado». El jurado vive
en **ese** mercado. Si el reto es de un municipio concreto, una foto de stock genérica destruye
credibilidad: el jurado reconoce que ese lugar no es el suyo, y con eso se cae el Acto I.

Jerarquía al buscar, de más específico a más genérico:

| Nivel | Fuente | Qué se saca de ahí | Consulta típica |
|---|---|---|---|
| 1 | Video del propio territorio: YouTube y Facebook local, noticiero municipal, canal de la alcaldía, cuenta del mercado | el lugar exacto, la ropa, el habla, la luz, el puesto, el piso | `"<municipio>" mercado <producto>` · `site:facebook.com "<municipio>" mercado` |
| 2 | Noticia o reportaje del mismo problema en el mismo país | el hecho visual duro: el montón, el descarte, la fila, el rostro | `merma <producto> <país>` · `pérdida de alimentos <departamento>` |
| 3 | Documental, ONG, FAO, universidad, tesis en video | el mecanismo y su escala real | `secador solar <producto> <país>` · `<tema> tesis <universidad>` |
| 4 | Canal técnico, foro, fabricante | cómo se ve la pieza: corte, soldadura, desarme, mantenimiento | `<componente> desarmado` · `<máquina> mantenimiento` |
| 5 | Banco de imágenes genérico | solo textura, clima, manos anónimas sin territorio | último recurso, y **se marca como tal** |

El nivel 1 y el nivel 2 no se cambian por el nivel 5: un banco no es el territorio. Pero eso
solo prohíbe **hacer pasar stock por el lugar**, no prohíbe planificar la toma.

**Ruta B — crear la referencia.** Es igual de válida y muchas veces mejor, sobre todo cuando el
territorio no está filmado. Se puede construir:

- boceto a mano o digital del encuadre (croquis con tercios, altura de cámara y dirección de luz);
- **render 3D o corte** de la pieza con las dimensiones reales del BOM;
- diagrama de bloques, de flujo o de estados;
- placa gráfica con el texto exacto que irá en pantalla («NOMBRE», «US$ 0,00», «RESIDUO → INSUMO»);
- montaje de referencia (moodboard) con varias imágenes para discutir un plano;
- imagen generada por IA como *reference frame*, si el equipo la usa.

Condición única de la ruta B: **se declara como referencia creada, nunca como registro del
lugar.** Un render no es una foto del mercado; una imagen IA no es prueba de que la problemática
exista. Si la toma exige el territorio real y solo hay referencia creada, la toma queda
`pendiente` con la orden de grabar: se planifica con el boceto y se graba en el lugar.

La ruta B también sirve para decidir **qué pedirle al especialista**: un render del colector con
su corte a 30° vale más que diez frases sobre el colector.

**Ficha, con o sin URL.** Toda referencia —encontrada o creada— entra con ficha:

```
toma: S02
ruta: A
url: https://www.youtube.com/watch?v=XXXXXXXX&t=42s
titulo: "Mercado de <ciudad>: la fruta que no se vende"
autor: <canal> · fecha: 2025-03-14 · minuto útil: 0:42–0:51
que_se_ve: mano descartando mango maduro en caja plástica
para_que_sirve: encuadre, luz y altura de cámara del descarte
uso: referencia de encuadre
```

Para la ruta B, `ruta: B` y en lugar de `url` va `archivo:` con la ruta del boceto, render o
placa, más `creado_por:` (quién lo hizo) y `herramienta:`. La ficha de una referencia creada no
necesita URL; la de una encontrada, sí, y se verifica abriéndola.

Verificación mínima de una referencia encontrada: abrir el enlace, saltar al minuto y comprobar
que lo que describes está en pantalla. **Un enlace que no abriste no es una referencia.**

Guarda las fichas en `reports/referencias/<Sxx>.md` o en una tabla dentro del storyboard. Si el
equipo trae su propio material filmado, esa es la referencia de nivel 0 y manda sobre todo lo
demás; si trae un boceto propio, también manda sobre cualquier búsqueda.

### 7. Compila

```bash
python scripts/build_shotlist.py     # OK: N tomas compiladas …
```

Con errores no se escribe el CSV. Corrige y repite. No edites `script/shotlist.csv` a mano:
se regenera y pierdes el cambio.

### 8. Cuenta la cobertura leyendo el CSV, no la tabla

```bash
python -c "import csv,re;r=list(csv.DictReader(open('script/shotlist.csv',encoding='utf-8')));print(sorted({t for x in r for t in re.findall(r'([a-e]\d)\b',x['rubric_item'])}))"
```

Lo que salga es la cobertura real. Si un ítem no aparece, no está cubierto, aunque tu
tabla diga que sí. Para cada ítem ausente decide: o le das una toma, o lo declaras cubierto
**fuera del video** con su destino (`pautado`, `presupuesto`, `canvas`).

### 9. Entrega el tablero visual, no un muro de texto

El contrato YAML no lo lee nadie del equipo. Lo que se usa en el rodaje es **una hoja de
contactos + una fila por toma** que responda tres preguntas: qué plano es, qué buscar y qué
crear. Reglas del tablero:

1. **Se genera desde el CSV**, no a mano: la plantilla
   `skills/storyboard/gen_storyboard_visual.py` lee el shotlist y escribe el HTML
   (`--csv` / `--out`). Si cambia una toma, se regenera; nunca se edita el HTML.
2. **Hoja de contactos arriba**: todos los fotogramas en una grilla densa (7 columnas), cada
   uno enlazado a su fila. Se ve el video completo de un vistazo, sin importar si son 9 o 30
   tomas.
3. **Una fila por toma**, con grid de cuatro zonas: fotograma · metadatos (plano, timecode,
   descripción, nota de la referencia, **sonido**, **transición**, «no debe verse») · **qué
   buscar** (consultas reales) · **qué crear** (órdenes al especialista). Los detalles
   (cámara, rúbrica) van en `<details>`.
4. **Pista de sonido visible**: una tira bajo la hoja de contactos con el color musical de
   cada acto y los cues (entrada de música, silencio antes de la cifra, SFX del mecanismo).
   El equipo tiene que poder leer el video con los ojos cerrados.
5. **Nada de tarjetas gigantes**: el alto crece con el número de tomas, no con el relleno. Si
   una fila ocupa más de ~140 px, el texto sobra o está mal jerarquizado. Referencia medida:
   ~4.000 px para 14 tomas, frente a 6.997 px de la versión densa.
6. **Fotogramas reales solo cuando corresponden**. Si la toma es territorial y no hay material
   del lugar, se dibuja una **placa** con el texto que irá en pantalla («NOMBRE», «US$ 0,00»,
   «RESIDUO → INSUMO») o se usa un **boceto/render creado** y se declara como referencia creada.
   Una foto de otro país fingiendo ser el territorio es peor que una placa.
7. **Cada imagen lleva su fuente**: `docs/img/ref/frames/` (captura de video con minuto),
   `docs/img/ref/yt/<id>.jpg` (miniatura) o el archivo propio creado (boceto, render, placa),
   con su ficha `ruta: B`. Nada de imágenes sin origen.
8. **PDF para imprimir**: Chrome headless `--headless=new --disable-gpu
   --no-pdf-header-footer --print-to-pdf`, con `@media print` que oculta `details`. Verifica
   el número de páginas; el de referencia son 7.

Para capturar un fotograma de YouTube sirve: abrir `watch?v=<id>&t=<seg>s`, pausar, fijar
`video.currentTime`, y capturar el elemento `video`. Si el reproductor no carga, se usa la
miniatura `maxresdefault.jpg` y se anota que es miniatura, no fotograma.

Enlaza el tablero desde `docs/STORYBOARD.md` con el comando que lo regenera, para que nadie
trabaje sobre una versión vieja.

## Las reglas que no se negocian

1. **Cero nombres de proyecto en los primeros 20 s.** El nombre aparece una vez en pantalla
   y una vez en la descripción de YouTube (H30: +10,1 pp, y el valor está en la descripción,
   no en el video).
2. **Tres cifras de dinero máximo en el Acto III**, cada una con su base. Si el desglose
   necesita más, usa barras proporcionales **sin etiqueta numérica**.
3. **Toda cifra lleva `claim_ids`.** Si el dato viene del presupuesto y el presupuesto no
   tiene ids, escribe la base en `notes` y dilo: es un hueco del sistema, no del video.
4. **Cierre Latam**: "piloto en [ciudad], replicable en toda América Latina". Nunca
   "gracias" ni logo.
5. **Sin emojis, sin morado #7c3aed**, tipografía solo de `brand/tokens.css`.
6. **120 s exactos**, medidos en el audio final con `ffprobe`. La suma de `duration_s` es
   nominal: no la presentes como medición.
7. **Ninguna toma se planifica a ciegas.** O hay referencia encontrada (con URL y minuto
   verificados) o hay referencia creada (boceto, render, placa, diagrama) declarada como tal.
   Una referencia creada nunca se presenta como registro del lugar.
8. **Cada toma lleva sonido y transición escritos.** Corte seco por defecto, una transición
   con intención por acto, y la cifra clave sin música encima.

## Errores que este skill previene

Todos salieron de pruebas reales:

| Error | Costo |
|---|---|
| Declarar cobertura 17/19 con un solo `rubric_item` por toma | la auditoría lee el CSV y ve 11/19 |
| `rubric_item` con varios ítems separados por coma | rompe el CSV; usa `;` |
| Toma `modeler` con asset que existe pero sin `dim_*_mm` | no compila |
| Afirmar "120 s medidos con ffprobe" sin audio | se cae en la primera revisión |
| Ocho tomas de tipos distintos con el mismo dueño | el especialista se satura y el resto no trabaja |
| Cifras del Acto III sin base | resta en prefactibilidad y en coherencia con el canvas |
| Acto III con cuatro o más números | viola §9.4 y satura al jurado |
| Audio cortado en 27/63/90 s contra una rúbrica 17/33/29/21 | el video no coincide con la matriz |
| Referencia de banco genérico presentada como el territorio | el jurado ve un lugar que no es el suyo y desconfía del Acto I |
| Render o imagen IA presentada como registro del lugar | el jurado lo detecta y la prueba del problema se vuelve decorado |
| Toma sin ninguna referencia, ni encontrada ni creada | se graba improvisando y el montaje no cierra |
| Enlace de referencia que nunca se abrió | el minuto no existe; el equipo pierde una tarde buscando un plano fantasma |
| Toma que inventa una cifra o un beneficio que el guion no dice | el video y el guion se contradicen frente al jurado |
| Guion que sirve igual para otro equipo | no dice qué hace este proyecto; el storyboard solo puede ilustrar relleno |
| Enlace que apunta a un id de banco disfrazado de video | el equipo abre un 404 y deja de confiar en el tablero |
| Rellenar el territorio con stock porque «no había tiempo» | pierde la capa local y con ella el podio de sede |
| Tablero de tarjetas gigantes (≈7.000 px) | el equipo no lo lee y graba a ciegas; se vuelve a un PDF de texto |
| Foto de otro continente presentada como el territorio | el jurado local lo detecta en el primer plano |
| Acto II sin ningún intento de 3D aunque había una pieza física que modelar | el mecanismo se explica con palabras y el jurado no ve nada verificable |
| Descartar el 3D con «no aplica» sin escribir qué se intentó | atajo disfrazado de decisión; se pierde el plus que separa a los finalistas |
| Acto II calcado del video de un ganador | el jurado reconoce el referente y el equipo queda como copia de la copia |
| Toma que sirve para cualquier proyecto | el video se ve competente y olvidable; no hay idea que el jurado recuerde |
| Una sola pista de fondo para los 120 s | el video no respira y los actos no se distinguen de oído |
| Música de librería genérica para un problema local | el jurado oye que el video no es de ese lugar; se pierde la capa local |
| Whoosh o efecto en cada transición | firma del video genérico; el jurado oye la plantilla |
| Música épica encima de la cifra del Acto III | el dato deja de escucharse y la prefactibilidad se pierde |
| Toma sin `audio` ni `transicion` en el tablero | el editor improvisa y el montaje suena a otro video |

## Auditoría rápida de un shotlist ajeno

1. `python scripts/build_shotlist.py` — ¿compila?
2. ¿El guion existe, es específico y las tomas lo siguen? ¿Alguna toma inventa una cifra o un beneficio que el guion no dice?
3. Suma `duration_s` — ¿120,0? ¿Por acto 20,4 / 39,6 / 34,8 / 25,2 (± 0,5)?
4. Cuenta ítems de rúbrica desde el CSV — ¿cuántos de 19?
5. ¿Alguna toma de los primeros 20 s menciona el proyecto?
6. ¿Cuántas cifras de dinero en el Acto III? ¿Cada una tiene base?
7. ¿Toda toma `modeler` tiene dims en el BOM?
8. ¿Los `claim_ids` existen en `claims.json`?
9. ¿Hay tomas bloqueadas por datos vacíos, y están marcadas como tales?
10. ¿Cada toma tiene referencia, encontrada (URL + minuto verificados) o creada (boceto/render/placa con ficha `ruta: B`)? ¿Alguna es stock genérico disfrazado de territorio, o un render presentado como registro del lugar?
11. ¿Existe `docs/storyboard_visual.html`, se regenera desde el CSV y la hoja de contactos muestra todas las tomas sin relleno? ¿Sus fotogramas tienen fuente?
12. ¿El Acto II intenta el 3D primero y lo descarta con razones escritas en `notes`, o usa el lenguaje de mecanismo que pide **ese** reto? ¿Hay al menos una toma derivada de un modelo 3D cuando existe una pieza física?
13. ¿Alguna toma se podría haber hecho para cualquier proyecto? Esa es la que falta innovar.
14. ¿Cada acto tiene su propio color musical y la cifra clave va sin música?
15. ¿Cada toma dice cómo entra y cómo sale? ¿Hay más de una transición efectista por acto?
16. ¿La música suena del lugar y del tono del reto, o es una pista de librería igual a la de cualquier equipo?

## Prompt para llevar esto a otra IA

```
Rol: director de produccion de un equipo de rally de innovacion.
Contexto: certamen <rally_type>, proyecto <project_name>, equipo <team_name>,
  ciudad <city>, reto <challenge_title>.
Entrada: script/script.md (guion ya escrito), brief.json, research/claims.json,
  budget/budget.json, budget/bom.csv, knowledge/rubric_matrices.md (§1, §3),
  INFORME_INVESTIGACION §9.2-9.6.
Tarea: traducir el guion a un storyboard de 120 s con tomas contractuales.
Restricciones:
  - El guion es la fuente de verdad: no inventes cifras, beneficios ni cambios de
    orden. Si una toma necesita algo que el guion no dice, dilo como hueco.
  - 120 s exactos con fracciones 17/33/29/21.
  - Cero nombres de proyecto en los primeros 20 s.
  - Acto II: el 3D es el tronco. Primero intenta modelar la pieza, el modulo, el
    ensamble, el corte o el montaje en el sitio; si el reto es de proceso, servicio
    o dato, modela el objeto fisico que ese proceso toca. Solo si de verdad no hay
    nada que modelar, usa diagrama/captura/demo y escribe que se intento en 3D y
    por que se descarto, argumentado por la naturaleza de la solucion. Minimo dos
    tomas de mecanismo.
  - Acto III con tres cifras de dinero como maximo, cada una con base.
  - Los ganadores (Proyectos Ganadores de Rally Latam.md) son analisis de tecnica,
    no plantillas: los retos casi nunca se repiten. Extrae criterio (como abrieron
    el mecanismo, como mostraron costo, como cerraron), nunca el guion ni el tema.
    La solucion y la idea visual se deciden con el reto propio
    (challenges.json) y su propuesta (soluciones_actuales.json).
  - No fijes un numero de tomas: las que el tiempo y la claridad pidan.
  - Innova en la forma: cada toma debe ser imposible de reutilizar en otro
    proyecto. Nada de efectismo, emojis ni morado #7c3aed.
  - Toda cifra debe existir en claims.json o budget.json.
  - owner solo entre: guionista, modeler, pautador, presupuestador,
    investigador, grafista2d, director.
  - Si owner es modeler, asset_id debe estar en bom.csv con columnas dim_*_mm.
  - Referencias: se puede buscar material real (territorio, noticia, documental,
    foro) o crear la referencia (boceto, render, placa, diagrama). Banco generico
    solo textura y marcado; una referencia creada nunca se presenta como registro
    del lugar.
  - Cada toma lleva audio y transicion en el tablero. Musica por acto, elegida por tono
    y por lugar: si el reto es de un lugar, la musica suena de ese lugar (instrumentos y
    ritmo reconocibles), no una pista de libreria. La cifra clave va sin musica; la voz
    manda. Corte seco por defecto, una transicion con intencion por acto.
  - Sin emojis, sin morado #7c3aed.
Formato de salida: JSON con claves actos (ventana, segundos, porcentaje, tono_musical),
  tomas (id, act, description, asset_id, asset_type, duration_s, owner,
  rubric_item, claim_ids, depends_on, plano, buscar [], crear [],
  audio, transicion, no_debe_verse), cobertura (items cubiertos, items fuera del video
  con su destino), referencias (toma, url, minuto, que_se_ve), bloqueos.
Idioma: espanol.
```
