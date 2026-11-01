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

- `.pitch` — borde superior navy 2 px, texto 9.4 pt.
- `.comentarios` — rótulo cobalto, 3 líneas regladas de 8.2 mm.

## Reglas de paginación

- Objetivo: 2 páginas por reto, 0 huérfanas.
- `break-inside: avoid` en `.analogia`, `.riesgo`, `.pitch`, `.comentarios`, `.ods-item`,
  filas de tabla.
- Si el bloque de comentarios se va a una tercera página, se reduce el ritmo (altura de línea,
  márgenes de `h3`, tamaño de pasos) hasta que entre. Nunca dejar una página con tres líneas.
- Verificar con el `y` máximo de cada página: si una página termina por debajo de ~590 pt de
  800 útiles, compactar o aceptar solo si el bloque anterior lo justifica.

## Generador

- `datos_dossier.py`: contenido curado por reto (propuesta, ODS, cadena, señal, analogías,
  videos). No meter retos de prueba aquí si el entregable es del usuario.
- `generar_dossier_v3.py`: construye HTML → PDF (Chrome headless), DOCX (python-docx) y
  XLSX (openpyxl).
- Excel: hoja `Panel` + una hoja por reto. El bloque editable se llama
  "Comentarios e ideas del equipo" y trae columnas Idea / Responsable / Cómo se mide / Fecha.

## Checklist de salida

1. `paginas == 2 × retos`, sin páginas con menos de ~150 caracteres.
2. Sin `saturacion`, `probabilidad`, `win rate`, `winrate`, `score`, `No documentado`.
3. 2 links de video por reto, 3 ODS con badge por reto.
4. DOCX con el mismo orden y los ODS como tabla con celda de color.
5. XLSX con 9 hojas de reto y filas de comentarios editables.
