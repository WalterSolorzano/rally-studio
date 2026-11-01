# Rúbricas del certamen: matriz Latam verificada y matriz Nacional pendiente

Documento normativo único de calificación. Las reglas operativas (video, pautado,
presupuesto) viven aquí y **solo aquí**; `.agents/rules/rubricas-y-puntajes.md`,
`knowledge/rubric_latam.md` y los manuales apuntan a este archivo en lugar de repetirlo.

Etiquetas de procedencia:

- **[BASES]**: texto literal de la rúbrica oficial. Se copia tal cual, con sus erratas.
- **[PATRÓN]**: observación sobre proyectos ganadores. Orienta, no puntúa.
- **[EQUIPO]**: convención interna del proyecto. Se puede cambiar sin tocar la rúbrica.
- **[POR VERIFICAR]**: afirmación sin fuente oficial en el repositorio.

## 0. Estado de verificación

| Matriz | Estado | Fuente | Qué falta |
|---|---|---|---|
| Rally Latinoamericano (28 h) | **verificada** | `rubrica_oficial_latam.jpeg` (imagen oficial, 5 criterios / 19 ítems) | nada |
| Nicaragua Innova (24 h) | **no verificada** | ninguna en el repositorio | bases o rúbrica oficial del año |

La matriz Nacional que circulaba antes (25/25/20/15/15 con ESP32/LoRa, «naming dual»,
«≤10 páginas» y «C$ y USD» como criterios) **no tiene fuente**. Los pesos se conservan
como hipótesis de trabajo, no como rúbrica. Mientras no lleguen las bases:

- el auditor **no puntúa** contra la Nacional: reporta «estimación sin rúbrica oficial»;
- se usan los criterios declarados abajo solo como lista de cobertura (¿el entregable
  toca el tema?), nunca como nota;
- se pide al humano el documento oficial y se carga aquí como `[BASES]`.

## 1. Rally Latinoamericano — rúbrica oficial (100 puntos)

Fuente: `rubrica_oficial_latam.jpeg`. Se transcribe literal, incluidas las erratas
marcadas `[sic]`. Son **19 ítems**, no 17.

### a) Grado de innovación de la solución propuesta — 30 puntos

1. La solución es innovadora
2. El equipo mostró capacidad creativa
3. El equipo utiliza tecnologías apropiada `[sic]` para el desafío
4. Grado de usabilidad de la solucion `[sic]` propuesta

### b) Impacto positivo de la propuesta en la sociedad — 20 puntos

1. La propuesta da solución a una problemática específica
2. La propuesta idea `[sic]` tiene un valor social por encima de su valor de mercado
3. La propuesta mejora la calidad de vida de los ciudadanos

### c) Prefactibilidad económica y social y sustentabilidad ambiental — 20 puntos

1. La propuesta es sustentable desde el punto de vista económico
2. La propuesta contempla la eficiencia energética y apela a fuentes renovables
3. La propuesta optimiza el uso de recursos
4. La propuesta presenta alternativas de mejora a una problematica `[sic]` ambiental específica

### d) Viabilidad técnica de la propuesta — 20 puntos

1. Base teórica sólida y documentada
2. El concepto utiliza recursos que son de fácil obtención
3. La propuesta es acorde a las necesidades de los potenciales usuarios
4. La solución es técnicamente validada

### e) Calidad de la presentación — 10 puntos

1. La presentación demuestra capacidad de síntesis
2. La presentación transmite con claridad la solución propuesta
3. La propuesta de valor es clara y se ajusta al desafío
4. Las ilustraciones son claras y pertinentes

### Lo que la rúbrica oficial NO dice

No fija monto en USD, ni límite de caracteres, ni duración exacta en segundos, ni
TikTok, ni patentes, ni CAD, ni renders 3D, ni «ergonomía» como ítem aparte. Todo eso
son patrones o requisitos de otros documentos y va etiquetado como tal.

## 2. Nicaragua Innova — criterios declarados, sin rúbrica verificada

Pesos **hipótesis** (sin fuente): 25 / 25 / 20 / 15 / 15. Nombres de criterio tomados de
la documentación interna; no son ítems oficiales.

| # | Criterio (hipótesis) | Peso | Qué debe cubrir el entregable [EQUIPO] |
|---|---|---|---|
| 1 | Innovación, creatividad e hibridación | 25 | originalidad frente a lo que ya existe en el país; mezcla de tecnologías o materiales; prototipo o concepto presentado |
| 2 | Impacto social y territorial | 25 | PNDH 2022–2026 citado; anclaje a un municipio concreto; beneficiarios cuantificados |
| 3 | Viabilidad técnica y recursos locales | 20 | se puede construir con talleres, centros INATEC o labs CNU; materias primas locales; quién lo mantiene |
| 4 | Prefactibilidad económica y modelo | 15 | presupuesto unitario en C$ con tasa BCN de `brief.json`; quién paga; plan por fases |
| 5 | Documento, video y coherencia de marca | 15 | documento ordenado y citado; video claro; una sola identidad visual |

Señales de patrón en ganadores nacionales **[PATRÓN]**, útiles pero no criterios:
municipio real nombrado, institución pública como socio, nombre con arraigo cultural,
cifras que el jurado puede cruzar entre video y documento. Nunca se puntúan.

## 3. Reglas del entregable audiovisual

- **Duración [BASES/POR VERIFICAR]**: 120 s máximo en el video de YouTube. El límite de
  duración sí puede descalificar; el número de palabras **no**. Se mide el audio
  generado con `ffprobe`, no un conteo de palabras.
- **Palabras [EQUIPO]**: la referencia de 240–270 palabras a 130–140 ppm es una guía de
  escritura. Superarla no descalifica: si el audio pasa de 120 s, se recorta el guion.
- **Reparto por actos [EQUIPO]**, como fracción del tiempo real del audio:

  | Acto | Fracción | Contenido |
  |---|---|---|
  | I — Problema | 17 % | situación concreta, rostro y territorio; el nombre del proyecto entra después |
  | II — Solución | 33 % | nombre comercial, mecanismo, lo que se ve funcionando |
  | III — Prefactibilidad | 29 % | costo unitario, quién paga, economía circular |
  | IV — Cierre | 21 % | métricas auditables, ODS, cierre regional |

- **Cobertura de rúbrica [EQUIPO]**: cada acto declara qué ítem de la matriz activa.
  El video no necesita cubrir los 19 ítems; el conjunto video + pautado sí.
- **TikTok: descartado.** No figura en la rúbrica oficial y el equipo decidió no
  producirlo. Ninguna skill lo exige. Ver `knowledge/ERRATAS.md`.

## 4. Reglas de pautado

- Cinco secciones: `problema`, `solucion`, `impacto`, `innovacion`, `prefactibilidad`.
- Mínimo 150 caracteres por sección.
- Topes por sección en Latam **[PATRÓN/POR VERIFICAR]**: 1250 / 1250 / 1000 / 1000 / 1500
  caracteres con espacios. En Nacional, sin tope declarado.
- Una estadística por afirmación, con fuente en `research/claims.json`. Sin fuente: se
  pide o se marca `[SIMULADO]`.
- No repetir el nombre del proyecto más de una vez por sección ni el mismo dato en dos
  secciones.

## 5. Errores que restan de verdad

1. Cifras del video que no coinciden con el presupuesto o el canvas.
2. Fantasía térmica o energética (consumo imposible para la carcasa).
3. Datos sin fuente verificable.
4. Diseño «estilo IA»: degradados morados, glassmorphism, tarjetas repetidas, emojis
   como íconos.
5. Audio de más de 120 s.

Nada de esta lista se presenta como «causa #1 de eliminación»: son riesgos, no reglas
escritas en las bases.
