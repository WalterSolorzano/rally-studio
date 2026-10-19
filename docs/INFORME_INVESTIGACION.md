# Informe de investigación y sustento del corpus

**Rally Studio — base documental, verificación de fuentes y estado de la evidencia**

| Campo | Valor |
|---|---|
| Versión | 1.0 |
| Fecha de corte | 19 de octubre de 2026 |
| Ámbito | Rally Latinoamericano de Innovación (28 h) y Rally Nacional de Innovación Nicaragua Innova (24 h) |
| Audiencia | Integrantes del repositorio, jurados, docentes y cualquier persona que quiera auditar de dónde sale lo que el sistema afirma |
| Documento hermano | [`docs/MANUAL_MAESTRO_RALLY_LATAM_Y_NICARAGUA_INNOVA_2026.md`](MANUAL_MAESTRO_RALLY_LATAM_Y_NICARAGUA_INNOVA_2026.md) (operativo) — este informe es el **sustento** |

---

## 0. Cómo leer este informe

El repositorio contiene investigación de tres orígenes distintos: **fuentes primarias oficiales**, **informes secundarios generados con apoyo de IA** y **heurísticas internas construidas por el equipo**. Mezclarlos sin etiquetas es la principal causa de error del corpus. Por eso cada afirmación relevante lleva un nivel de evidencia:

| Nivel | Significado | Cómo se comprobó |
|---|---|---|
| **[A] Primaria verificada** | Dato publicado por el organizador, la sede o un medio oficial, consultado directamente | `webfetch` a la fuente, octubre de 2026 |
| **[B] Secundaria consistente** | Dato de un informe del corpus que coincide con al menos otra fuente o con la lógica de la serie histórica | Contraste entre documentos del repo |
| **[C] Heurística interna** | Construcción propia del equipo (puntajes, rankings, umbrales) sin modelo estadístico publicado | Revisión del método declarado en el propio archivo |
| **[D] No verificado** | Dato citado pero cuya fuente no se pudo localizar o devuelve error | Intento de acceso a la URL citada |

**Regla de uso:** un dato [C] puede guiar una decisión, pero **no puede presentarse como estadística**. Un dato [D] **no debe usarse en un pautado, un guion o una diapositiva** hasta reemplazarse por una fuente [A] o [B].

Este informe no sustituye las bases oficiales de cada certamen. Si una base publicada entra en contradicción con este documento, manda la base.

---

## 1. Resumen ejecutivo

1. El corpus cubre **dos certámenes distintos**, con reglas, jurados, duración y rúbricas diferentes. La mayor parte de los errores detectados provienen de tratarlos como uno solo.
2. La **numeración de ediciones** estaba mal en al menos dos documentos del repo. La fuente oficial de octubre de 2026 confirma: 2019 = VI, 2021 = VIII, 2023 = X, 2024 = XI, 2025 = XII, 2026 = XIII.
3. Las cifras que el corpus atribuía a 2026 («3.900 estudiantes, 600+ equipos, 91 sedes») corresponden en realidad a **2025**. La edición 2026 registró **más de 5.200 protagonistas, 751 equipos y 113 sedes**.
4. El registro de ganadores de Nicaragua Innova quedó **verificado para 2023, 2025 y 2026** con fuente oficial. La edición 2024 sigue en nivel [B].
5. La atribución «Ollnari ganó en 2023» es **falsa**: en 2023 el primer lugar Tecnológico fue **TECNOCRAFT INNOVATOR** (Centro Tecnológico Josefa Toledo de Aguerri, Juigalpa). Ollnari/Operación Titán ganó **Procesos en 2025**.
6. La rúbrica latinoamericana **30/20/20/20/10 está verificada** contra la imagen oficial del repositorio. La rúbrica nacional **25/25/20/15/15 no tiene documento oficial en el repo**: es [B/C] y debe presentarse como reconstrucción.
7. Los **tres claims** de `research/claims.json` están **no verificados**: la URL de SINAPRED devuelve 404, la de CEPAL bloquea el acceso automatizado y la de IEEE no es localizable. No son citables como hechos.
8. El «30% más de probabilidad de podio» por hibridación ciberfísica **no tiene fuente ni cálculo**. Es una intuición razonable, no un hallazgo.
9. Los «win-rates» de 100,0 % y 84,5 % de `research/challenges_report.md` son **puntajes heurísticos**, no probabilidades. Dos desafíos empatan en 100 %, lo que demuestra que la escala no es probabilística.
10. El material de ejemplo contiene una **incoherencia numérica real**: el guion dice USD 4.850 y el presupuesto suma USD 4.450; además el guion tiene 155 palabras frente a un óptimo de 240–270, y promete «retorno en 14 meses», práctica que las propias reglas del repo prohíben.
11. El grafo de conocimiento (420 nodos, 732 aristas, 29 comunidades) **es real como estructura**, pero el 19 % de sus aristas (142) son **inferidas por IA** con confianza media 0,81. Es un mapa de relaciones, no una base de hechos.
12. La conclusión estratégica se sostiene: **los ganadores combinan anclaje territorial con lenguaje institucional y una demostración física verificable**. Lo que no se sostiene es presentar esa conclusión como una probabilidad medida.

---

## 2. Objeto y alcance

Este informe responde cuatro preguntas:

- **¿Qué son estos certámenes?** Origen, gobernanza, duración, categorías y actores.
- **¿Quién ha ganado y con qué?** Registro verificable 2016–2026, con énfasis en Nicaragua.
- **¿Cómo se evalúa?** Rúbricas, pautado, guion y reglas de plataforma.
- **¿Cuánto de lo que afirma el repositorio está probado?** Auditoría de claims, cifras y erratas.

**Fuera de alcance:** no evalúa proyectos concretos de usuarios, no sustituye las bases oficiales, no contiene el proyecto de ejemplo como si fuera real y no modifica el motor del workbench (`scripts/`, `dashboard/`, `site/`).

`brief.json` está vacío: no hay proyecto, equipo, universidad ni ciudad activos. Todo lo que aquí aparece son **datos de dominio**, no el proyecto de nadie.

---

## 3. Método

### 3.1 Procedimiento

1. **Inventario.** Se listó el corpus completo (`brain/corpus/`, `knowledge/`, `research/`, `docs/`, `graphify-out/`) y se identificaron duplicados por tamaño y contenido.
2. **Lectura dirigida.** Se leyeron el documento madre (`knowledge/rally_analysis.txt`, 57 KB), el manual maestro (31 KB), los informes de ganadores, las matrices de rúbrica, los pautados de referencia, el presupuesto y el guion.
3. **Extracción de afirmaciones.** Cada cifra, nombre de equipo, edición y regla se separó en una ficha con su fuente declarada.
4. **Verificación primaria.** Se consultaron directamente sitios oficiales: Nicaragua Creativa (Comisión Nacional de Economía Creativa), CONFEDI y ANFEI. Se registró el resultado de cada acceso.
5. **Contraste interno.** Se compararon las tres series de numeración, las cifras por edición, los ganadores y los límites de caracteres.
6. **Clasificación.** Cada afirmación recibió un nivel [A]–[D] y se redactó la errata cuando correspondía.

### 3.2 Herramientas y límites técnicos

- El **buscador web no devolvió resultados** durante la sesión; la verificación se hizo por acceso directo a URLs conocidas.
- `rallydeinnovacion.org` devolvió **HTTP 500** en todos los intentos. No se pudo consultar la web oficial del Rally Latinoamericano.
- La plataforma **SIRLI no se consultó directamente**. Lo que el informe dice sobre ella proviene del corpus y debe tratarse como [B].
- Los **PDF no se pudieron leer de forma nativa**; su contenido se reconstruyó desde los `.md` equivalentes y desde el documento madre.
- Los videos de YouTube citados en el corpus **no se verificaron**. Los IDs existen como referencia, no como evidencia reproducida.

### 3.3 Advertencia sobre los informes generados con IA

`brain/corpus/investigacion_pitch.md` (= `knowledge/winners_analysis.md`) y `brain/corpus/ganadores_analisis.md` son informes de investigación asistida. Contienen datos correctos mezclados con inferencias no marcadas y con una numeración de ediciones equivocada. **No deben citarse como fuente primaria.** Se usaron aquí solo como pistas, y cada dato relevante se contrastó después.

---

## 4. Los dos certámenes

### 4.1 Rally Latinoamericano de Innovación

**Qué es.** Competencia internacional de innovación que se corre en **28 horas continuas**, con equipos multidisciplinarios que resuelven un desafío abierto y entregan memoria técnica, video pitch de 120 segundos y publicación en la plataforma SIRLI.

**Gobernanza.** Organizan **CONFEDI** (Argentina), **ACOFI** (Colombia) y **ANFEI** (México), con consejos regionales de ingeniería. La edición 2026 se presentó como la **XIII** y reunió **11 países**. [A]

**Categorías.** Dos: **Innovación** e **Impacto Social**. [A/B]

**Escala histórica verificada:**

| Edición | Año | Alcance | Fuente |
|---|---|---|---|
| III | 2016 | +4.000 jóvenes, 74 sedes, 7 países | ANFEI [A] |
| XI | 2024 | 10.890 participantes, 1.305 equipos, 9 países | CONFEDI [A] |
| XII | 2025 | Nicaragua: +2.700 jóvenes, 22 universidades, 56 sedes, 300+ equipos | Nicaragua Creativa [A] |
| XIII | 2026 | 11 países, 9 desafíos; +200 sedes en la región; Nicaragua: +2.900 jóvenes, 24 universidades, 64 sedes | CONFEDI y Nicaragua Creativa [A] |

**Lectura de la serie.** La competencia creció de 7 países y 74 sedes (2016) a 11 países y más de 200 sedes (2026). Nicaragua pasó de participar con pocas sedes a ser **el segundo país con más sedes después de México** en 2026. [A]

**Implicación para el equipo:** el jurado internacional no evalúa su propio país; el mismo material pasa primero por un filtro nacional y luego por uno continental. Esto no es una opinión: es el diseño del certamen y explica el patrón de «doble filtro» descrito en §7.2. [B]

### 4.2 Rally Nacional de Innovación Nicaragua Innova

**Qué es.** Competencia nacional de **24 horas continuas**, organizada por la **Comisión Nacional de Economía Creativa** con **CNU, INATEC, MINJUVE, TELCOR y MEFCCA**, entre otras instituciones. [A]

**Categorías.** Tres: **Innovación Tecnológica**, **Innovación Social** e **Innovación de Procesos u Organizacional**. [A]

**Serie verificada:**

| Edición | Año | Fechas | Participantes | Equipos | Sedes | Mujeres | Fuente |
|---|---|---|---|---|---|---|---|
| I | 2023 | 22–23 sep | 2.346 estudiantes | 280 | 57 (25 municipios) | 47,2 % | Nicaragua Creativa [A] |
| II | 2024 | — | — | — | — | 47 % | Nicaragua Creativa (retrospectiva 2025) [A] |
| III | 2025 | 6–7 jun | 3.650 estudiantes | 661 | 91 | 49 % | Nicaragua Creativa [A] |
| IV | 2026 | 28–29 ago | +5.200 protagonistas | 751 | 113 | 46 % | Nicaragua Creativa [A] |

**Dotación humana 2025:** 453 mentores, 288 jurados, 91 coordinadores de sede, 12 desafíos. [A]
**Dotación humana 2026:** 783 mentores, 337 jurados de sede, 9 jurados nacionales, 37 centros tecnológicos y 28 universidades, 12 desafíos. [A]

**Lectura de la serie.** En tres años el certamen multiplicó por 2,2 los participantes y por 2 los equipos, y casi duplicó las sedes. La paridad de género se mantiene en torno al 46–49 %, por encima del promedio regional del Rally Latinoamericano (23 %). [A]

**Implicación para el equipo:** el Rally Nacional es **masivo y territorial**. El jurado valora que la solución se ancle a un municipio real, a un programa público existente y a un problema reconocible por la comunidad. La escala no impresiona; la pertinencia sí.

---

## 5. Registro de ganadores

### 5.1 Nicaragua Innova 2023 (I edición)

| Categoría | 1.º | 2.º |
|---|---|---|
| Tecnológica | **TECNOCRAFT INNOVATOR** — Centro Tecnológico Josefa Toledo de Aguerri, Juigalpa | **INNORTE** — UFLEP, Estelí |
| Social | **INGENOVA** — UNI, Managua | **AGROLIDAR** — CID UNAN-Managua |
| Procesos u Organizacional | **NAHUATL INNOVA** — UNI IES | **POVEDERS-UNI** — UNI RACCS, Estelí |

Fuente: Nicaragua Creativa, 26 de septiembre de 2023. [A]

> **Corrección importante:** el corpus atribuía el primer lugar de 2023 a «Ollnari» (INATEC Juigalpa). Es incorrecto. Ollnari/Operación Titán ganó **Procesos en 2025**, no en 2023.

### 5.2 Nicaragua Innova 2024 (II edición)

El corpus registra como premiados a **INNOVATEAM** (UNICIT), **FIDALOGIC** (UNP), **BIOINNOVA** (UNAN-Managua, CNIA), **AGROINNOVA** (UNA) y **Boson the Higgs / T1** (UNAN-León). La asignación por categoría no está suficientemente documentada. [B]

**Estado:** dato utilizable con reserva; no presentar como «ganador oficial de categoría X» sin la fuente primaria.

### 5.3 Nicaragua Innova 2025 (III edición)

| Categoría | 1.º | 2.º |
|---|---|---|
| Tecnológica | **Nexus Innova** — CNIA 1 — *Parque Ecoenergético Padre Miguel d'Escoto Brockmann* | **Yoltik-Nova** — RUPAP — viviendas de cáscara de cacao |
| Social | **Volca-Tech** — CNIA 1 — *CHANCENICA* | **Escuadrón Nic-Anáhuac 1** — RUPAP — *EcoCanje* |
| Procesos u Organizacional | **Operación Titán** — RUPAP — *OLLNARI* | **Los Templarios** — CNIA 1 — *EgroLab-Móvil* |

**Métricas declaradas por los equipos ganadores:**
- Nexus Innova: 3.500 personas beneficiadas por semana; 36.000 kg de residuos por año. [A]
- Yoltik-Nova: 80 viviendas; 12 toneladas por año; 45 empleos para comunidades indígenas. [A]
- EcoCanje: 7 puntos de reciclaje. [A]

Fuente: Nicaragua Creativa, 9–10 de junio de 2025. [A]

### 5.4 Nicaragua Innova 2026 (IV edición)

| Categoría | 1.º | 2.º | 3.º |
|---|---|---|---|
| Tecnológica | **AVOCADO** — UAM, Sede Jaguares — *Vitalia* | **SolarEduTech** — INATEC Gaspar García Laviana, Rivas — *Banca Solar Didáctica* | **Team Owlsight** — UNAN-Managua, CNIA Comandante Tomás Borge — *EcoGuard* |
| Social | **ELOHIM** — UNI CUR Estelí — *Centro Integral Josefa Toledo de Aguirre* | **Sinergia 360** — ULSA León — *BidiSign* | **NEXU-Humano** — UNAN-Managua — *Neuro-kit* |
| Procesos | **Lubanic** — INATEC Taller Lubán — *SITRACAFE* | **Team Rocket** — UNICA — *Coffee Bean Bridge* | **Coffee Power** — ULSA León — *Coffee Trace* |

Fuente: Nicaragua Creativa, 31 de agosto de 2026. [A]

### 5.5 Rally Latinoamericano — resultados de Nicaragua

| Año | Equipo | Universidad | Resultado | Solución |
|---|---|---|---|---|
| 2016 | **Econova** | UNAN-FAREM Estelí | 3.º Innovación | — |
| 2016 | **Geckakz** | UNAN-FAREM Estelí | 1.º Impacto Social (ex aequo) | Juego para niños no videntes |
| 2019 | **Lexonic** | UNI-RUPAP | 3.º Impacto Social | *LexoStop* |
| 2021 | **MT Soluciones Creativas** | UNI-RUPAP | 1.º Innovación | — |
| 2023 | **Güegüense Pinolero** | UNMRMA | 1.º Innovación | *Vivienda Digna* |
| 2023 | **Nicarq Sinergy** | UNI-RUSB | 2.º Impacto Social | — |
| 2024 | **Techriders** | UNI-RUSB | 1.º Innovación | Captación de agua |
| 2025 | **STEM Synergy** | UAM | 1.º Innovación | Huertos verticales |
| 2025 | **Mentes Volcánicas** | UNI-RUPAP | 1.º Impacto Social | Reaprovechamiento de Tetra Pak |

Fuentes: ANFEI 2016 [A]; Nicaragua Creativa 2025 y 2026 [A]; CONFEDI 2024 [A]; asignación de universidad [B].

> **Corrección:** `investigacion_pitch.md` atribuye Techriders a UNI-RUPAP. La fuente del equipo y los registros del repo apuntan a **UNI-RUSB**.

### 5.6 Rally Latinoamericano 2024 — podio internacional

| Categoría | 1.º | 2.º | 3.º |
|---|---|---|---|
| Innovación | **Techriders** (Nicaragua) | **Catalizadores del Cambio** (U. Viña del Mar, Chile) | **Tecnobioq** (IT Celaya, México) |
| Impacto Social | **Mexitech** (UPEMOR, México) | **Unabinnova** (U. Andrés Bello, Chile) | **Los Innovadores** (FACET-UNT, Argentina) |

Fuente: CONFEDI. [A]

### 5.7 Fase nacional nicaragüense del Rally Latam 2026

Clasificados registrados en el corpus: **IGNIS CODE** (1.º Innovación), **STEEL INNOVATORS** (2.º), **NANOBOTS** (3.º); **AVOCADO** (1.º Impacto Social), **SEMILLITAS** (2.º), **UNICOS** (3.º). [B]

**Advertencia:** AVOCADO ganó el Rally Nacional en agosto de 2026 (categoría Tecnológica) y además clasificó en la fase nacional del Rally Latam en octubre. Son **dos competencias distintas**; el corpus las mezcla en `winners_database.json`. No usar ese archivo como registro único.

---

## 6. Patrones de victoria

Los patrones que siguen se derivan de observar casos premiados. Son **regularidades empíricas**, no leyes. Cada uno indica qué está probado y qué es interpretación.

### 6.1 Anclaje nacional-institucional [B]

Los equipos nicaragüenses que ganan el certamen nacional tienden a:

- acoplarse a un **programa público existente** (parque ecoenergético, centro integral, banca solar didáctica, trazabilidad cafetalera);
- **micro-territorializar** el problema en un municipio con nombre propio;
- usar **nomenclatura local** (náhuatl, chorotega, «pinolero») sin sacrificar claridad técnica.

**Por qué funciona:** el jurado nacional incluye entes públicos que evalúan pertinencia territorial y continuidad institucional. Una solución que puede adoptar una alcaldía o un centro tecnológico tiene una ruta de implementación visible.

**Límite:** el anclaje sin demostración técnica se convierte en retórica. Los casos ganadores siempre añaden una métrica física verificable.

### 6.2 Doble filtro [B]

En el Rally Latinoamericano el mismo video pasa por un jurado nacional y luego por uno internacional. El patrón ganador es:

- **identidad en el nombre**, universalidad en el contenido;
- Nicaragua como **piloto**, América Latina como **mercado**;
- evitar siglas gubernamentales locales que un evaluador extranjero no entiende;
- cerrar con una frase de replicabilidad regional.

**Por qué funciona:** satisface dos criterios en tensión — pertinencia local y escalabilidad — con un solo relato.

### 6.3 Hibridación ciberfísica [C]

El corpus afirma que combinar **hardware comercial + software** da «30 % más probabilidad de podio». **No existe fuente ni cálculo que respalde ese porcentaje.** Lo que sí se observa en el registro es que muchos ganadores presentan un **artefacto físico mostrable** (prototipo, maqueta funcional, dispositivo) además del software.

**Reformulación defendible:** *los proyectos con una demostración física verificable tienden a comunicar mejor su factibilidad y a diferenciarse de las propuestas puramente digitales.* Es una hipótesis de trabajo, no un dato.

**Consecuencia práctica:** si el equipo construye hardware, debe mostrar el artefacto en cámara y declarar su costo unitario. Si no lo construye, no debe simularlo.

### 6.4 Tríada de métricas [B]

Los pitch ganadores suelen cerrar con tres cifras: **ambiental, económica y social**. Ejemplos del registro: 36.000 kg/año de residuos, 80 viviendas, 45 empleos; o 3.500 personas/semana, costo por nodo, puntos de reciclaje.

**Por qué funciona:** demuestra que el equipo entiende el impacto en tres dimensiones y facilita la comparación con la rúbrica.

**Límite:** las cifras deben ser **coherentes entre video, PDF y canvas**. La inconsistencia numérica es una de las causas de pérdida de puntos documentadas en el corpus.

### 6.5 Prototipo sobre maqueta [B]

El análisis audiovisual del documento madre distingue etapas: infraestructura electromecánica (2019–2020), crisis domésticas y residuos pandémicos (2021–2022), agua y vivienda (2023–2024), ecosistemas híbridos, biomateriales e IA (2025). La tendencia es hacia **sistemas que integran materiales, sensores y datos**, no piezas aisladas.

### 6.6 Naming con identidad [B]

Nombres como *Güegüense Pinolero*, *Mentes Volcánicas*, *Yoltik-Nova*, *EcoCanje* o *Vitalia* comparten una función: **ser recordables en un pitch de 120 segundos** y evocar territorio sin explicar el territorio.

### 6.7 Errores que el registro asocia a derrota [B/C]

El corpus identifica, sin medición formal:

- 3D hipercomplejo que consume tiempo de render y no aporta a la comprensión;
- precios distintos entre video y presupuesto;
- «fantasía térmica» (cifras de temperatura o eficiencia sin respaldo);
- diseño genérico de IA (gradientes morados, tarjetas repetidas, glassmorphism);
- promesas de retorno financiero (TIR, VAN, ROI) en un certamen que evalúa prefactibilidad, no inversión.

Estos errores son **criterios de revisión**, no estadísticas.

---

## 7. Rúbricas

### 7.1 Rally Latinoamericano — 100 puntos [A]

| Criterio | Peso |
|---|---|
| Innovación | 30 |
| Impacto | 20 |
| Prefactibilidad | 20 |
| Viabilidad técnica | 20 |
| Presentación | 10 |

Verificada contra `brain/corpus/rubrica_oficial.jpeg` (imagen oficial) y `knowledge/rubric_latam.md`.

**Lectura:** el 60 % del puntaje está en innovación + impacto. La presentación pesa 10, pero condiciona la percepción de los otros 90. Un pitch que no explica la innovación en 20 segundos pierde acceso a los 30 puntos.

### 7.2 Rally Nacional — 100 puntos [B/C]

| Criterio | Peso |
|---|---|
| Innovación | 25 |
| Impacto territorial / PNDH | 25 |
| Viabilidad local | 20 |
| Prefactibilidad / Canvas | 15 |
| Documento + pitch | 15 |

**Estado:** reconstrucción a partir de `knowledge/rubric_matrices.md` y del manual maestro. **No hay imagen ni PDF oficial de esta rúbrica en el repositorio.** Debe presentarse como aproximación y confirmarse con la base de cada edición.

### 7.3 Reglas de equipo y deliberación [B]

- Equipos de **4 a 10** integrantes.
- Al menos **un integrante de ingeniería**.
- Al menos **una mujer**.
- Opcional: egresado y docente asesor.
- Deliberación en sede: hasta **3 horas**. Deliberación internacional: hasta **72 horas**.
- **Coherencia numérica obligatoria** entre video, PDF y canvas.

Estas reglas provienen del corpus y del manual; deben confirmarse en SIRLI antes de inscribir.

---

## 8. Pautado

### 8.1 Rally Latinoamericano [A]

Cinco secciones con límites de caracteres verificados en `pautado_latam_ref.md`:

| Sección | Límite |
|---|---|
| Problemática | 1.250 |
| Solución | 1.250 |
| Impacto | 1.000 |
| Innovación | 1.000 |
| Prefactibilidad | 1.500 |
| **Total** | **6.000** |

El corpus repetía «1.000» para prefactibilidad. Es un error: el límite real es **1.500**.

Además, el reporte de referencia incluye **propuestas descartadas** y **referencias APA**. No son secciones con límite propio, pero suman credibilidad.

### 8.2 Rally Nacional [B]

El pautado nacional se organiza en cinco bloques equivalentes, con énfasis en:

- problema territorial y población afectada;
- solución y su operación local;
- impacto alineado al Plan Nacional de Lucha contra la Pobreza y para el Desarrollo Humano 2022–2026;
- innovación frente a lo ya existente en el municipio;
- prefactibilidad con costos en córdobas o dólares y tasa del BCN.

**Regla de estilo:** no repetir el nombre del proyecto más de una vez por sección. El nombre no sustituye la explicación.

### 8.3 Reglas de escritura

- Una idea por párrafo.
- Cifras con fuente, año y unidad.
- Nada de adjetivos sin dato («revolucionario», «único», «líder»).
- Costos con proveedor, unidad y URL de respaldo.
- Si un dato es simulado, se marca `[SIMULADO]`.

---

## 9. Guion PAS-V

### 9.1 Estructura [A/B]

| Acto | Tiempo | Función | Palabras objetivo |
|---|---|---|---|
| I — Dolor | 0–20 s | Gancho empático-estadístico | ~45 |
| II — Caja negra | 20–60 s | Mecánica técnica y nombre de la solución | ~90 |
| III — Prefactibilidad | 60–95 s | Costo, operación y economía circular | ~75 |
| IV — Cierre | 95–120 s | Impacto auditado y escalabilidad | ~55 |

**Total:** 120 segundos, 240–270 palabras, ~135 palabras por minuto.

Las dos fuentes del corpus describen los mismos cortes con distinta notación (0:20–1:00 = 20–60 s; 1:00–1:35 = 60–95 s; 1:35–2:00 = 95–120 s). Son consistentes. [B]

### 9.2 Reglas narrativas

- **Acto I:** nunca logos ni nombre del proyecto. Primero la persona afectada y el dato.
- **Acto II:** explicar la «caja negra» en lenguaje llano; recién aquí aparece el nombre.
- **Acto III:** costo unitario, costo de operación, quién paga y cómo se sostiene. Sin TIR, VAN ni ROI.
- **Acto IV:** tres métricas auditables y una frase de replicabilidad.

### 9.3 Estado del guion de ejemplo

`script/script.md` (HIDRO-VIGIA) presenta tres problemas:

1. **Extensión:** 155 palabras. Por debajo del rango 240–270; a 135 ppm quedaría en ~69 segundos y dejaría 50 segundos vacíos.
2. **Coherencia:** declara USD 4.850, mientras `budget/budget.json` suma **USD 4.450**.
3. **Regla:** promete «retorno estimado: 14 meses», prohibido por las propias reglas del repo.

Es material de ejemplo, pero demuestra exactamente el error que el sistema debe prevenir.

---

## 10. Selección de retos

`research/challenges_report.md` y `challenges_ranked.json` ordenan cinco desafíos con puntajes 100,0 / 100,0 / 84,5 / 83,5 / 64,5 y los llaman «probabilidad de victoria».

**Qué son realmente:** un **índice heurístico interno** que combina saturación histórica, ajuste a ODS, factibilidad de hardware y existencia de precedente ganador. No hay modelo probabilístico, ni tamaño de muestra, ni validación.

**Por qué importa:** dos desafíos empatan en 100,0 %. Una probabilidad no puede empatar en el máximo. Presentarlos como probabilidad es un error de comunicación que puede inducir a un equipo a elegir mal.

**Reformulación correcta:**

> «Puntaje de idoneidad estratégica (0–100), construido por el equipo a partir de cuatro criterios cualitativos. No es una probabilidad de victoria.»

**Criterios del índice:**

1. **Saturación:** cuántos equipos eligieron ese desafío en ediciones anteriores.
2. **Ajuste ODS:** vínculo directo con al menos un ODS y, en nacional, con el PNDH.
3. **Factibilidad:** posibilidad de prototipo físico con hardware comercial en 24–28 h.
4. **Precedente:** existencia de un ganador comparable en el registro.

**Uso recomendado:** como filtro para conversar, no como oráculo. La decisión final debe considerar el acceso real del equipo a usuarios, datos y proveedores.

---

## 11. Presupuesto y prefactibilidad

### 11.1 Reglas

- Rango del certamen: **USD 4.000–6.000** (el dossier usa 500–15.000 como rango de captura, pero el objetivo es 4.000–6.000).
- Cada fila: elemento, descripción, unidades, costo unitario, total, URL y captura.
- Solo **costos de implementación superficiales**: prototipo, despliegue piloto, operación inicial.
- **Sin TIR, VAN ni ROI.**
- Coherencia estricta con el video y el canvas.

### 11.2 Presupuesto de ejemplo

`budget/budget.json` tiene 8 filas y suma **USD 4.450,00**:

| # | Elemento | Total (USD) |
|---|---|---|
| 1 | 192,00 |
| 2 | 727,50 |
| 3 | 1.150,00 |
| 4 | 510,00 |
| 5 | 580,00 |
| 6 | 240,00 |
| 7 | 380,00 |
| 8 | 670,50 |
| **Total** | **4.450,00** |

**Estado de verificación:** las URLs de proveedor **no se pudieron confirmar** en la sesión (bloqueos 502/ERR de Alibaba, DigitalOcean, DHL y una ferretería local). Las capturas `screenshot_*.png` no están en la raíz del repositorio. Por tanto, el presupuesto es **aritméticamente correcto pero documentalmente incompleto**. [C]

### 11.3 Prefactibilidad en el pautado

La sección debe responder, en 1.500 caracteres:

1. ¿Cuánto cuesta un nodo/unidad?
2. ¿Cuántas unidades requiere el piloto?
3. ¿Quién opera y con qué costo mensual?
4. ¿Cómo se sostiene después del piloto?
5. ¿Qué se puede comprar localmente y qué se importa?

Si falta una de estas cinco, la sección no está completa.

---

## 12. Auditoría de claims

`research/claims.json` contiene tres afirmaciones. Ninguna superó la verificación.

| # | Afirmación | Fuente declarada | Resultado | Nivel |
|---|---|---|---|---|
| 1 | SINAPRED: 120.000 personas afectadas por inundaciones (2024) | `sinapred.gob.ni/informes-anuales-vulnerabilidad` | **HTTP 404**. La ruta no existe. No se localizó el informe. | **[D]** |
| 2 | CEPAL: 42 % de pérdidas por falta de telemetría en los primeros 30 minutos (2024) | `cepal.org/es/publicaciones/desastres-centroamerica-2024` | **HTTP 403** (bloqueo automatizado). No concluyente; la publicación no se pudo confirmar. | **[D]** |
| 3 | IEEE: 78 % de reducción de costos LoRaWAN vs. celular (2023) | `ieeexplore.ieee.org/document/lorawan-rural-monitoring-2023` | URL no localizable; IEEE usa identificadores numéricos, no slugs descriptivos. | **[D]** |

**Consecuencia:** el guion de ejemplo, el pautado y cualquier material que use estas cifras están construidos sobre datos no probados. Deben sustituirse o marcarse como estimación.

**Cómo reemplazarlos:**

- Inundaciones: usar informes de **UNDRR/OCHA** (1.534 eventos 2000–2022; +190 millones de afectados) citados en `pautado_latam_ref.md`, o datos de **UNICEF 2023** (10,8 millones de afectados en 19 países), verificando la publicación original.
- Pérdidas por falta de telemetría: buscar un estudio con DOI y muestra explícita; si no existe, reformular como «la detección tardía reduce la ventana de respuesta» sin porcentaje.
- LoRaWAN: usar la documentación técnica de Semtech o un artículo con DOI; el 78 % es plausible pero no está probado.

---

## 13. El grafo de conocimiento

### 13.1 Qué es

`graphify-out/graph.json` contiene **420 nodos** y **732 enlaces**. `GRAPH_REPORT.md` declara **29 comunidades** (20 mostradas, 9 omitidas por delgadas) y una composición de aristas:

| Tipo | Porcentaje | Aristas |
|---|---|---|
| Extraídas del texto | 81 % | ~590 |
| Inferidas por IA | 19 % | 142 |
| Ambiguas | 0 % | 0 |

Confianza media de las aristas inferidas: **0,81**.

### 13.2 Nodos de mayor influencia

| Nodo | Aristas |
|---|---|
| Rally Latinoamericano | 51 |
| Nicaragua | 20 |
| Rally Nacional | 16 |
| Jurado Nacional | 11 |
| Yoltik-Nova | 11 |
| Área Innovación | 10 |
| Hibridación sistémica | 10 |
| Rally Nacional IV Edición 2026 | 10 |
| UNI RUPAP | 10 |
| EcoCanje | 10 |

### 13.3 Qué significa y qué no

- **Significa:** el corpus está conectado; los conceptos rectores son los certámenes, el territorio, el jurado y los casos concretos. La estructura es útil para navegar y para detectar vacíos.
- **No significa:** que cada relación sea un hecho. El 19 % inferido es interpretación del modelo. Los tres claims no verificados aparecen como nodos de «evidencia»: el grafo los **mapea**, no los **valida**.
- **Riesgo:** citar el grafo como prueba. No lo es. Es un índice semántico.

### 13.4 Discrepancias del grafo

- El README dice **16 fuentes**; `brain/corpus_state.json` lista **17**.
- `dashboard/data/stats.generated.json` contiene datos de **otro proyecto (AquaNica, 6,5/28 h)**, no del grafo. No usar ese archivo para reportar el estado del corpus.

---

## 14. Erratas y discrepancias detectadas

| # | Dónde | Dice | Debe decir | Gravedad |
|---|---|---|---|---|
| 1 | `investigacion_pitch.md`, `ganadores_analisis.md` | 2019 = VIII, 2021 = X, 2023 = XII, 2025 = XIV | 2019 = VI, 2021 = VIII, 2023 = X, 2024 = XI, 2025 = XII, 2026 = XIII | Alta |
| 2 | Varios | 2026 nacional: 3.900 estudiantes, 600+ equipos, 91 sedes | 2026: +5.200, 751 equipos, 113 sedes (las otras cifras son de 2025) | Alta |
| 3 | `winners_database.json`, corpus | Ollnari ganó 2023 | Ganó Procesos 2025; en 2023 ganó TECNOCRAFT | Alta |
| 4 | `investigacion_pitch.md` | Techriders = UNI-RUPAP | Techriders = UNI-RUSB | Media |
| 5 | README / manual | Hibridación ciberfísica = 30 % más de podio | Sin fuente: reformular como hipótesis | Alta |
| 6 | `challenges_report.md` | «Probabilidad de victoria» 100 % / 84,5 % | «Puntaje de idoneidad estratégica», no probabilidad | Alta |
| 7 | `script/script.md` | USD 4.850 | USD 4.450 (según budget.json) | Alta |
| 8 | `script/script.md` | 155 palabras | 240–270 palabras | Media |
| 9 | `script/script.md` | Retorno estimado 14 meses | Eliminar: ROI prohibido | Alta |
| 10 | README | 16 fuentes | 17 en `corpus_state.json` | Baja |
| 11 | `rubric_matrices.md` | Prefactibilidad 1.000 caracteres | 1.500 | Media |
| 12 | `claims.json` | 3 claims con URL | 3 claims no verificados (1 URL 404) | Alta |
| 13 | `winners_database.json` | Mezcla Rally Nacional con fase nacional Latam | Separar por certamen y fecha | Media |
| 14 | `dashboard/data/stats.generated.json` | Estado del proyecto actual | Datos de AquaNica, otro proyecto | Media |

---

## 15. Limitaciones

1. **No se accedió a SIRLI.** Las reglas de plataforma son [B], no [A].
2. **La web oficial del Rally Latinoamericano está caída** (HTTP 500). La información continental se reconstruyó desde CONFEDI, ANFEI y medios nicaragüenses.
3. **La rúbrica nacional no está documentada oficialmente en el repo.** Los pesos 25/25/20/15/15 son una reconstrucción.
4. **La edición 2024 de Nicaragua Innova no tiene acta primaria localizada.** Los nombres son [B].
5. **Los videos no se verificaron.** El análisis audiovisual es interpretativo.
6. **El buscador web falló.** Puede haber fuentes mejores que no se consultaron.
7. **Las cifras de impacto de los equipos** (36.000 kg, 80 viviendas, 45 empleos) son **declaraciones de los equipos**, no auditorías independientes.
8. **El presupuesto de ejemplo no tiene URLs confirmadas.**
9. **La serie histórica 2014–2018 es incompleta.** Solo se verificó 2016 y, parcialmente, 2019.

---

## 16. Cómo se mantiene este informe

1. **Cada nueva edición:** actualizar §4.2, §5 y la bibliografía con la fuente oficial.
2. **Cada claim nuevo:** entrar por `research/claims.json` con URL, año y fecha de acceso; no se considera citable hasta superar verificación [A] o [B].
3. **Cada vez que cambie una rúbrica:** reemplazar la tabla y anotar la fecha.
4. **Cada errata corregida:** dejar la fila en §14 marcada como «corregida» durante una versión y luego retirarla.
5. **Regenerar el grafo** solo después de corregir el corpus, no antes: de lo contrario se consolidan los errores.

**Criterio de aceptación:** una afirmación de este informe es defendible si un tercero puede abrir la fuente citada y encontrar el dato. Si no, baja de nivel.

---

## 17. Bibliografía

### Fuentes primarias consultadas [A]

- ANFEI. (2016). *Rally Latinoamericano de Innovación 2016: ganadores internacionales*. https://www.anfei.mx/actividades/rally-latinoamericano-2016-ganadores-internacionales/
- Comisión Nacional de Economía Creativa. (2023, 26 de septiembre). *I Rally Nacional de Innovación Nicaragua Innova 2023*. Nicaragua Creativa. https://www.nicaraguacreativa.com
- Comisión Nacional de Economía Creativa. (2025, 9–10 de junio). *Ganadores del tercer Rally Nacional de Innovación Nicaragua Innova 2025*. Nicaragua Creativa. https://www.nicaraguacreativa.com
- Comisión Nacional de Economía Creativa. (2025, 15 de octubre). *XII Rally Latinoamericano de Innovación 2025*. Nicaragua Creativa. https://www.nicaraguacreativa.com
- Comisión Nacional de Economía Creativa. (2026, 31 de agosto). *Juventud protagoniza récord en el IV Rally Nacional de Innovación*. Nicaragua Creativa. https://www.nicaraguacreativa.com
- Comisión Nacional de Economía Creativa. (2026, 16 de octubre). *Nicaragua en el Rally Latinoamericano de Innovación 2026*. Nicaragua Creativa. https://www.nicaraguacreativa.com
- CONFEDI. (2024). *Latinoamérica innova: resultados 2024*. https://www.confedi.org.ar
- CONFEDI. (2026, 15 de octubre). *Con más de 200 sedes en once países comienza una nueva edición del Rally Latinoamericano de Innovación*. https://www.confedi.org.ar

### Documentos del corpus [B]

- `brain/corpus/rally_analisis.txt` — documento madre (57 KB, 38 fuentes declaradas), base del análisis histórico y audiovisual.
- `brain/corpus/ganadores_latam.md` — registro extenso de ganadores 2014–2026.
- `brain/corpus/ganadores_analisis.md` — análisis de patrones y gobernanza.
- `brain/corpus/rubrica_latam.md` — rúbrica continental y errores frecuentes.
- `brain/corpus/rubricas_matrices.md` — comparativa nacional/Latam.
- `brain/corpus/pautado_latam_ref.md` — pautado real del equipo V3RTIX (Rally Latam 2026).
- `brain/corpus/pautado_nacional_ref.md` — pautado de referencia nacional (OLLNARY).
- `brain/corpus/rubrica_oficial.jpeg` — imagen de la rúbrica continental.
- `docs/MANUAL_MAESTRO_RALLY_LATAM_Y_NICARAGUA_INNOVA_2026.md` — manual operativo.
- `graphify-out/GRAPH_REPORT.md` — auditoría del grafo.

### Fuentes declaradas y no verificadas [D]

- SINAPRED. *Informes anuales de vulnerabilidad* (2024). URL citada: `https://www.sinapred.gob.ni/informes-anuales-vulnerabilidad` — **404**.
- CEPAL. *Desastres en Centroamérica* (2024). URL citada: `https://www.cepal.org/es/publicaciones/desastres-centroamerica-2024` — **403/no concluyente**.
- IEEE. *LoRaWAN rural monitoring* (2023). URL citada: `https://ieeexplore.ieee.org/document/lorawan-rural-monitoring-2023` — **no localizable**.

---

## 18. Anexo: inventario del corpus

| Archivo | Tamaño | Función | Estado |
|---|---|---|---|
| `brain/corpus/rally_analisis.txt` | 57.341 B | Documento madre | [B] |
| `brain/corpus/ganadores_latam.md` | 257.480 B | Registro de ganadores | [B] |
| `brain/corpus/ganadores_analisis.md` | 30.548 B | Análisis de patrones | [B/C] |
| `brain/corpus/investigacion_pitch.md` | 25.779 B | Deep research | [C] |
| `brain/corpus/analisis_nicaragua.pdf` | 231.056 B | Casos nacionales | [B] |
| `brain/corpus/rubrica_oficial.jpeg` | 207.578 B | Rúbrica continental | [A] |
| `brain/corpus/pautado_latam_ref.md` | 12.738 B | Pautado real | [A] |
| `brain/corpus/pautado_nacional_ref.md` | 9.854 B | Pautado de referencia | [B] |
| `brain/corpus/rubricas_matrices.md` | — | Comparativa de rúbricas | [B/C] |
| `brain/corpus/claims_datos.md` | — | Claims | [D] |
| `brain/corpus/retos.md` / `retos_ranked.md` / `retos_reporte.md` | — | Banco de retos | [C] |
| `brain/corpus/ganadores_db.md` | — | Base de ganadores | [B/C] |
| `brain/corpus/guion_voz.md` | — | Guion de voz | [B] |

**Duplicados detectados** (mismo contenido, distinta ruta): `knowledge/rally_analysis.txt` = documento madre; `knowledge/winners_analysis.md` = `investigacion_pitch.md`; `Proyectos Ganadores de Rally Latam.md` = `ganadores_latam.md`; `knowledge/rubric_matrices.md` = `brain/corpus/rubricas_matrices.md`; `knowledge/rubric_latam.md` = `brain/corpus/rubrica_latam.md`; los dos manuales maestros son idénticos (31.472 B).

---

## 19. Cierre

El valor del corpus no está en la cantidad de documentos, sino en la **trazabilidad**. Un equipo que puede decir «este dato viene de aquí, esta rúbrica pesa así y este ganador hizo esto» toma mejores decisiones bajo presión que uno que repite cifras sin origen.

Lo que este informe defiende es simple:

- los certámenes son **dos**, no uno;
- los ganadores combinan **territorio, institución y demostración física**;
- las rúbricas favorecen **innovación e impacto** por encima de la presentación;
- el pitch de 120 segundos es una **estructura de cuatro actos**, no un resumen libre;
- y ninguna cifra vale más que su fuente.

Lo que este informe **no** defiende: que exista una fórmula probabilística del triunfo. No existe. Existen patrones, criterios y evidencia. Con eso se juega mejor; con eso no se garantiza nada.
