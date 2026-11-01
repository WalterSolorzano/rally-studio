# Dossier de soluciones · especificación técnica

Referencia de la doctrina descrita en `SKILL.md` → "Dossier de soluciones (entregable
editorial)". Sirve para regenerar el entregable sin volver a discutir el diseño.

## Paleta

| Rol | HEX | Uso |
|---|---|---|
| Navy | `#0D1B35` | títulos, etiquetas, chips, reglas de sección |
| Cobalto | `#0866F5` | número de reto, nombre de propuesta, métrica clave, links |
| Tinta | `#13213A` | texto principal |
| Cuerpo | `#334155` | párrafos |
| Metadato | `#5C7193` | puesto, notas, pie |
| Línea | `#DCE7F5` | hairline 1 px |
| Fondo suave | `#F8FAFD` | celdas alternas de Excel |

Prohibido: cian/celeste como color de texto, morado, degradados, sombras difusas,
glassmorphism, tarjetas repetidas, emojis.

## Tipografía

- `Plus Jakarta Sans` 400 / 600 / 700 / 800 — texto y títulos.
- `JetBrains Mono` 400 / 600 — rótulos, numeración, metadatos, links.
- Fuentes locales en `fuentes/*.ttf` declaradas con `@font-face`; nunca depender de Google
  Fonts al imprimir.

## Colores oficiales de los ODS (respaldo)

| ODS | HEX | ODS | HEX |
|---|---|---|---|
| 1 | `#E5243B` | 10 | `#DD1367` |
| 2 | `#DDA63A` | 11 | `#FD9D24` |
| 3 | `#4C9F38` | 12 | `#BF8B2E` |
| 4 | `#C5192D` | 13 | `#3F7E44` |
| 5 | `#FF3A21` | 14 | `#0A97D9` |
| 6 | `#26BDE2` | 15 | `#56C02B` |
| 7 | `#FCC30B` | 16 | `#00689D` |
| 8 | `#A21942` | 17 | `#19486A` |
| 9 | `#FD6925` | | |

Figura oficial: se inserta el archivo oficial de la ONU `E_SDG_Icons-NN.jpg` (466×466) a 11 mm.
La imagen ya trae el color, el número y el pictograma, así que **no se dibuja un cuadrado con el
número**: una recreación no se reconoce como sello y fue una corrección expresa del usuario.
Debajo, nombre oficial en español (8.4 pt navy) y una línea de justificación (7.9 pt cuerpo).
Los PNG/JPG se guardan en `fuentes/ods/odsNN.jpg` (los 11 que usan los retos de prueba: 2, 3, 6,
7, 8, 9, 11, 12, 13, 15, 16); si falta uno, se descarga de
`https://sdgs.un.org/sites/default/files/goals/E_SDG_Icons-NN.jpg` (dos dígitos, extensión `.jpg`).

```
.ods-logo { width: 11mm; height: 11mm; display: block; margin-bottom: 1.6mm; border-radius: 1mm }
```

Word: `run.add_picture(path, width=Cm(1.15))` dentro de la primera celda de la tabla del ODS.
Excel: `openpyxl.drawing.image.Image` anclada en `A{fila}` con 26×26 px y alto de fila 34.

## Estructura de página

```
@page A4 · márgenes 16 mm / 16 mm / 15 mm
sin portada · sin índice
section.reto { break-before: page }  (el primero no)
```

Cabecera:

```
[ 01 ]   Título del reto
         [CATEGORÍA · 01/09]
```

- `.cabeza` grid 36 mm + 1 fr, borde superior 4 px cobalto.
- `.num` 64 pt peso 800 cobalto, `line-height: .78`.
- `h2` 21 pt navy.

Secciones: `h3` mono 7.3 pt, mayúsculas, navy, `border-top: 1px solid #0D1B35`,
`margin: 3.6mm 0 1.8mm`, `break-after: avoid`.

Cierre del reto:

- `.pitch` — borde superior navy 2 px, texto 9.4 pt, rótulo `Pitch de 60 segundos · Opción 01`.
- `.comentarios` — rótulo cobalto, **10 líneas regladas** de 8.2 mm (una menos si la página 3
  trae mucho texto). De 12 en adelante la última cae fuera del área útil y Chrome la recorta sin
  avisar; si se agrega contenido a la página 3, se vuelve a contar.

Dos soluciones (misma jerarquía: nombre 19 pt navy en ambas, rótulo en chip claro):

```
.sol-head    { break-inside: avoid }              /* etiqueta + nombre + claim + qué es */
.sol.b       { break-before: page; border-top: 4px solid #0866F5; padding-top: 4mm }
.prop .name  { font-size: 19pt; color: #0D1B35 }  /* el cobalto queda para el número del reto */
.sol.b .prop .name { color: #0D1B35; font-size: 19pt }
.sol-tag     { mono 6.9pt cobalto; background #EDF3FE; border 1px #D3E2FA; padding .9mm 2.4mm }
.sol.b .prop .claim { font-size: 10.2pt }  .sol.b .prop .what { font-size: 8.7pt }
table.datos  { table-layout: fixed }  td.k { width: 36mm }   /* evita solapamiento etiqueta/valor */
table.datos.compact td { padding: 1.2mm 0; font-size: 8.2pt }
```

En la práctica (un párrafo por solución, después de la tabla de datos):

```
.real   { margin-top: 2mm; border-left: 2px solid #C8D8EE; padding-left: 3mm;
          font-size: 8.1pt; line-height: 1.34; color: #334155; max-width: 170mm;
          break-inside: avoid }
.real .k { mono 6.7pt navy, "En la práctica" }
```

Contenido obligatorio del párrafo (350–450 caracteres): quién opera, quién paga y cuánto gana ese
operador, de dónde salen insumos y equipos, y qué esfuerzo exige arrancar (personas, metros,
horario). En Word va como párrafo con run `EN LA PRÁCTICA` en Consolas 7 pt navy; en Excel, una
sección «En la práctica · Opción 01/02» con la fila mezclada A:D y alto 62.

Detalles que suman: `.detalles` grid 3 columnas, `.detalle` con borde izquierdo cobalto 2 px,
`.detalle .k` mono navy 6.8 pt y texto 7.9 pt. Tres por reto.

Insignias:

```
.insignias   { display: flex; flex-wrap: wrap; gap: 1.8mm 2.4mm; break-inside: avoid; margin-top: 3.2mm }
.insignias .lbl { mono 6.6pt navy, "INSIGNIAS QUE APLICAN" }
.insignia    { border: 1px solid #C8D8EE; border-radius: 1mm; padding: .9mm 2.2mm }
.insignia .n { mono 6.8pt navy uppercase }   /* nombre del marco o programa */
.insignia .t { 7.1pt #5C7193 }               /* calificador: por qué aplica */
```

Van dentro del bloque `.ods`, después de la grilla de ODS, así viajan siempre con el diagnóstico
y nunca solas a la página siguiente. Dos o tres por reto; si la fila necesita más de dos líneas,
se recorta.

## Redacción (lenguaje llano)

El lector del dossier no tiene por qué saber del oficio del reto. Reglas de escritura:

- **Ningún término técnico sin traducir.** Se nombra el objeto y se explica en la misma frase
  qué es y para qué sirve: «hotel de nidos: bloque de madera con agujeros y cañas huecas donde
  las abejas solitarias ponen sus huevos»; «bebedero: bandeja poco profunda con agua y piedras
  donde beben los insectos» (no es nada que se instale en un edificio); «fisurómetro: regla
  pegada a los dos lados de una grieta»; «retorta: horno cerrado sin oxígeno». La prueba: si el
  lector no puede dibujar el objeto con esa frase, falta la traducción.
- **El párrafo de presentación (`que_es`) tiene cuatro movimientos**: situación concreta →
  qué es la solución → qué incluye, con cada objeto explicado → cantidad y escala (8 a 12 nodos
  por sector, cuatro manzanas; franja de 3 a 6 m; 200 litros; ocho puntos de carga; garantía de
  90 días). Entre 380 y 650 caracteres. Menos de eso no vende; más, no cabe.
- **Los pasos de "Cómo funciona" no reintroducen la jerga** que la presentación acaba de traducir.
- **Los componentes llevan glosa corta entre paréntesis** cuando el nombre no es obvio:
  «Megóhmetro (mide fugas)», «Caja estanca IP65», «Radio de largo alcance o chip de datos»,
  «Fichas de conteo», «Reglas de grieta de acrílico», «Medidor de caudal mecánico»,
  «Trituradora de poda», «Plantines de totora y junco».

## Reglas de paginación

- Objetivo: 3 páginas por reto, 0 huérfanas.
  - Página 1: cabecera + descripción + ODS + Opción 01.
  - Página 2: Opción 02 + Detalles que suman + cadena + métricas (ambos grupos).
  - Página 3: señal + precedentes + pitch + comentarios.
- `break-inside: avoid` en `.analogia`, `.detalle`, `.mgroup` (cada grupo de métricas completo),
  `.pitch`, `.comentarios`, `.ods-item`, `.sol-head` y filas de tabla; `break-after: avoid` en
  encabezados; `break-before: page` en `.sol.b`.
- El grupo de métricas de la Opción 02 puede abrir la página 3: se acepta porque el rótulo
  `Opción 02 · Nombre` lo hace autosuficiente. Lo que no se acepta es una métrica suelta al pie
  o al inicio de una página.
- Verificar con el `y` máximo de cada página: si una página termina por debajo de ~590 pt de
  800 útiles, revisar que el bloque anterior no se haya partido; el hueco de cierre de la
  Opción 01 en la página 1 es esperado (la Opción 02 abre página nueva).

- **La solución sirve para toda la familia del reto.** Si el reto nombra un conjunto
  (electrodomésticos, residuos del mercado, puntos de acopio), el mecanismo tiene que valer para
  el conjunto: medir y adaptar en el sitio, o plano con tres medidas, o ruta de acopio. Una
  propuesta que solo funciona con el elemento más cómodo resuelve el ejemplo, no el reto.

## Generador

- `datos_dossier.py`: contenido curado por reto (propuesta, ODS, cadena, señal, analogías,
  videos). No meter retos de prueba aquí si el entregable es del usuario.
- `datos_extra.py`: `EXTRA["01".."09"]` con `alterna` (segunda solución) y `detalles` (3 pares
  etiqueta/texto). `datos_dossier.py` hace el merge al final.
- `datos_insignias.py`: `INSIGNIAS["01".."09"]` con 2 o 3 pares `(marco, por qué aplica)`. Se
  mergea igual que `EXTRA` y solo lista marcos reales; si un reto no habilita ninguno, se deja
  fuera en vez de inventar.
- Las dos soluciones no se encadenan: la Opción 02 no puede decir "vuelve al banco central", "se
  suma a la Opción 01" ni ninguna fórmula que la vuelva dependiente. Cada una cierra sola.
- `datos_realidad.py`: `REALIDAD["01".."09"]` con `a` y `b`, los párrafos «En la práctica» de cada
  opción (350–450 caracteres: operador, quién paga y cuánto gana, origen de insumos, esfuerzo de
  arranque). Se mergea como los demás.
- `generar_dossier_v3.py`: construye HTML → PDF (Chrome headless), DOCX (python-docx) y
  XLSX (openpyxl). Sin dict de riesgos: la sección de jurado se eliminó a propósito.
  `html_solucion(etiqueta, prop, real="", compacto=False)` imprime el párrafo `real` si viene.
- Excel: hoja `Panel` + una hoja por reto. Panel: Reto, Propuesta 01, Propuesta 02, Categoría,
  ODS, Beneficiario, Métrica clave, Precedente 1, Video del precedente (el hipervínculo vive en
  la columna 9). El bloque editable se llama "Comentarios e ideas del equipo" y trae columnas
  Idea / Responsable / Cómo se mide / Fecha.

## Checklist de salida

1. `paginas == 3 × retos`, sin páginas con menos de ~150 caracteres.
2. Sin `saturacion`, `probabilidad`, `win rate`, `winrate`, `score`, `No documentado`.
3. 2 soluciones independientes, 2 «En la práctica», 3 detalles, 2 links de video y 3 ODS con
   figura oficial por reto.
4. DOCX con el mismo orden, ambas opciones, los ODS con imagen insertada y el párrafo
   «EN LA PRÁCTICA» en cada una.
5. XLSX con 9 hojas de reto, segunda solución, «En la práctica · Opción 01/02» y filas de
   comentarios editables.
6. 10 líneas regladas de COMENTARIOS visibles; ninguna cortada al pie.
