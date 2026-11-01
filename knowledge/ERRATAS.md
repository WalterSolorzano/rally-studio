# Erratas y decisiones de datos

Registro de correcciones aplicadas a las fuentes del proyecto. Sirve para que una
corrección no vuelva a perderse cuando alguien recopile el corpus desde un documento
anterior.

Formato: fecha · archivo afectado · qué decía · qué dice · fuente.

## 2026-11-01

### Rúbrica Latam

- **Antes**: `rubric_matrices.md` presentaba como oficiales ítems reescritos (ergonomía,
  patentes internacionales, rango $4,000–$6,000 USD, CAD/despiece, renders 3D, límites
  de 1250/1000/1500 caracteres, «120 s exactos»).
- **Ahora**: 19 ítems literales de `rubrica_oficial_latam.jpeg`, con erratas marcadas
  `[sic]`. Lo demás quedó etiquetado `[PATRÓN]` o `[EQUIPO]`.
- **Fuente**: imagen oficial en la raíz del repositorio.

### Rúbrica Nacional

- **Antes**: matriz 25/25/20/15/15 sin fuente, con ESP32/LoRa, «naming dual»,
  «≤10 páginas» y «C$ y USD» tratados como criterios.
- **Ahora**: estado `no_verificada`. Pesos como hipótesis y criterios como lista de
  cobertura. El auditor reporta «estimación sin rúbrica oficial» y no puntúa.
- **Pendiente**: bases o rúbrica oficial del año. Cuando lleguen, se cargan como
  `[BASES]` en `knowledge/rubric_matrices.md`.

### Regla de las 270 palabras

- **Antes**: «superar 270 palabras causa descalificación». Aparecía en
  `rubric_matrices.md`, `.agents/rules/pautado-y-guion.md`, `PRODUCT.md` y los manuales
  maestros.
- **Ahora**: lo que descalifica es la **duración** (>120 s), medida sobre el audio con
  `ffprobe`. El conteo de palabras es una guía de escritura.
- **Motivo**: la rúbrica oficial no menciona palabras ni 120 s exactos; el límite de 2
  minutos sí está en las bases del certamen.

### Acto III

- **Antes**: «causa #1 de eliminación si se omite».
- **Ahora**: riesgo redactado como riesgo. No hay jerarquía oficial de causas.

### TikTok

- **Decisión del equipo**: descartado. No se produce, no se exige y no se evalúa.
  La rúbrica oficial no lo menciona. Las menciones en documentos históricos se dejan
  como referencia, sin exigencia operativa.

### Casos ganadores

- **Ollnari** (equipo Operación Titán, UNI-RUPAP / INATEC): **2025, Rally Nacional,
  1er lugar en Innovación de Procesos u Organizacional**. Corregido desde 2023.
  Fuente primaria disponible: `Análisis del Rally de Innovación.txt`, línea sobre los
  videos ganadores de 2025, y `knowledge/winners_analysis.md`.
- **BioInnova** (equipo Nicarq Sinergy, UNI-RUSB): se mantiene como **2023, Rally
  Latam, 2do lugar internacional Impacto Social**. Es contexto de ganadores del cerebro,
  no una cifra que se cite en el pautado del proyecto actual.
- Regla general: un caso se cita con año, rally, equipo y puesto **solo si** el dato
  aparece en una fuente del repositorio. Si no, se marca como no verificado y no se usa
  como precedente.
