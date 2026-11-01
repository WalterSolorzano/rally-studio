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

## Colores oficiales de los ODS (badge)

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

Badge: cuadrado de 9 mm, radio 1.2 mm, número en blanco, peso 800. Debajo, nombre del ODS en
navy y una línea de justificación en cuerpo.

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
- `.comentarios` — rótulo cobalto, 12 líneas regladas de 8.2 mm.

Dos soluciones:

```
.sol-head    { break-inside: avoid }              /* etiqueta + nombre + claim + qué es */
.sol.b       { break-before: page; border-top: 4px solid #0866F5; padding-top: 4mm }
.sol.b .prop .name { color: #0D1B35; font-size: 16.5pt }   /* la opción 2 no compite en cobalto */
.sol.b .prop .claim { font-size: 9.8pt }  .sol.b .prop .what { font-size: 8.8pt }
.sol-tag     { mono 6.9pt navy }          /* "Opción 01" / "Reto 09 · Opción 02" */
table.datos  { table-layout: fixed }  td.k { width: 33mm }   /* evita solapamiento etiqueta/valor */
table.datos.compact td { padding: 1.3mm 0; font-size: 8.2pt }
```

Detalles que suman: `.detalles` grid 3 columnas, `.detalle` con borde izquierdo cobalto 2 px,
`.detalle .k` mono navy 6.8 pt y texto 7.9 pt. Tres por reto.

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

## Generador

- `datos_dossier.py`: contenido curado por reto (propuesta, ODS, cadena, señal, analogías,
  videos). No meter retos de prueba aquí si el entregable es del usuario.
- `datos_extra.py`: `EXTRA["01".."09"]` con `alterna` (segunda solución) y `detalles` (3 pares
  etiqueta/texto). `datos_dossier.py` hace el merge al final.
- `generar_dossier_v3.py`: construye HTML → PDF (Chrome headless), DOCX (python-docx) y
  XLSX (openpyxl). Sin dict de riesgos: la sección de jurado se eliminó a propósito.
- Excel: hoja `Panel` + una hoja por reto. Panel: Reto, Propuesta 01, Propuesta 02, Categoría,
  ODS, Beneficiario, Métrica clave, Precedente 1, Video del precedente (el hipervínculo vive en
  la columna 9). El bloque editable se llama "Comentarios e ideas del equipo" y trae columnas
  Idea / Responsable / Cómo se mide / Fecha.

## Checklist de salida

1. `paginas == 3 × retos`, sin páginas con menos de ~150 caracteres.
2. Sin `saturacion`, `probabilidad`, `win rate`, `winrate`, `score`, `No documentado`.
3. 2 soluciones, 3 detalles, 2 links de video y 3 ODS con badge por reto.
4. DOCX con el mismo orden, ambas opciones y los ODS como tabla con celda de color.
5. XLSX con 9 hojas de reto, segunda solución y filas de comentarios editables.
