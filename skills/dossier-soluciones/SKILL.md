---
name: dossier-soluciones
description: Convierte los retos del comité o del usuario en soluciones sustentadas y un dossier de 3 páginas por reto (PDF, Word, Excel), con precedentes ganadores y razonamiento problema-causa-insight-solución-métrica.
---

# Dossier de soluciones

Este sistema **no crea retos**: los entrega el usuario o el comité. Sin retos no hay dossier.

## Cuándo usarla

- Hay retos y el equipo pide ideas o un dossier PDF para deliberar.
- Hay que reformular una solución existente con otro mecanismo.

## Modo según certamen

| | Nacional (24 h) | Latam (28 h) |
|---|---|---|
| Territorio | municipio nicaragüense nombrado | laboratorio piloto, replicable en la región |
| Moneda | C$ con tasa BCN de `brief.json` | USD |
| Marco | PNDH 2022–2026, instituciones nacionales | ODS y estándares internacionales, sin siglas locales |
| Nombre | puede tener arraigo cultural | debe entenderse fuera del país |
| Cierre | beneficio nacional | «piloto en [ciudad], replicable en América Latina» |

No se mezclan los dos modos. Sin `rally_type` en `brief.json`, se pregunta antes de generar.

## Cómo se razona una solución

**1. Análisis sistémico antes de idear.** Escribe el sistema del reto: actores (quién lo
sufre, decide, opera y paga), flujos de materia y energía, capacidad instalada,
estacionalidad, normas y quién pierde si funciona. La idea resuelve al menos dos tensiones
a la vez (residuo y costo, desempleo y servicio, dato y decisión).

**2. La familia del reto, no el ejemplo cómodo.** Si el reto nombra un conjunto
(«electrodomésticos», «residuos del mercado»), la solución sirve para el conjunto aunque
cambien marca, año o modelo: un mecanismo que **mide y se adapta en el sitio**, o una ruta
de acopio y clasificación.

**3. Primero el banco, después la idea.** `knowledge/retos_razonamiento.json` guarda 20
casos (`id`, `temas`, `year`, `rally`, `categoria`, `equipo`, `puesto`, `problema`,
`causa_raiz`, `insight`, `solucion`, `metrica`, `video_url`). Se busca por **verbo del
mecanismo** («reutilizar», «medir», «trazar», «filtrar») y por `temas`, no por título. Se
aprovechan `insight` y `metrica`; si un campo dice «No documentado en la fuente», se razona
y se marca como estimación. Son **contexto de ganadores**, no estadística: 20 casos, solo
podios, erratas posibles. Antes de citar año, rally, equipo o puesto, contrasta con
`knowledge/ERRATAS.md` y la fuente del repo.

**4. Familias de mecanismos (ayuda de búsqueda, no puerta de entrada).** Sirven para
encontrar el precedente, no para descartar una idea que no encaje:

- **A. Objeto de siempre + instrumentación y control** — Techriders 2024.
- **B. Residuo + componente con especificación** — Mentes Volcánicas 2025, BottleLife 2017.
- **C. Dato + alguien que decide** — SITRACAFE 2026, Steel Innovators 2026.
- **D. Energía integrada a un objeto de uso diario** — LexoStop 2019, Banca Solar 2026.
- **E. Servicio comunitario que reemplaza la compra del objeto** — AVOCADO 2026.
- **F. Accesibilidad y adaptación al usuario** — BidiSign 2026, Geckakz 2016.
- **G. Módulo replicable con ruta de acopio** — STEM Synergy 2025, BioInnova 2023.

Ollnari (Operación Titán, 2025, Nacional, Procesos) es un caso de **C** con plataforma y
sello de origen; se usa como referencia de mecanismo, no como plantilla de texto.

**5. Cinco pruebas de descarte.** La idea pasa las cinco o se replantea: ¿lo monta mañana
un taller común sin nada nuevo? ¿el insumo varía tanto que no se estandariza? ¿alguien lo
usa a diario y paga? ¿la métrica es física (quintales, litros, vatios, horas, personas)?
¿qué gana quien lo opera y qué pierde el barrio sin él?

**6. Banderas de riesgo (con la condición que las resuelve).** No son prohibiciones:
hay ganadores que las tocaron. Cada bandera se escribe junto a su salida.

| Bandera | Se resuelve si… |
|---|---|
| Taller que repara y revende el residuo | hay una capa técnica o servicio colectivo que un taller común no replica |
| App que conecta oferta y demanda | existe acopio, logística u operador con nombre y costo |
| Capacitación como núcleo | acompaña a un objeto o servicio que funciona sin ella |
| Sensor suelto | alguien decide con el dato y hay plazo para actuar |
| Kit sin operador | quién lo opera y quién cobra está definido |
| Dependencia de donaciones | el ingreso por uso cubre reposición y mantenimiento |
| Mejora del mismo producto | cambia quién lo usa o quién paga |

**7. La prueba del día 400.** ¿El servicio sigue?, ¿quién cambió la pieza gastada y pagó?,
¿qué pasa si el operador se va? Si la respuesta es «depende de un proyecto nuevo», no está
terminada.

## Contenido

- **Dos soluciones por reto.** Opción 01 principal; Opción 02 con **mecanismo distinto**,
  independiente, no «fase 2» ni plan B. Misma jerarquía visual.
- **Insignias**: 2 o 3 por reto desde `knowledge/insignias.json`, solo `verified: true` y
  solo si el mecanismo las habilita; si no aplica, se omite la fila. No se inventan.
- **ODS**: figura oficial de la ONU (`E_SDG_Icons-NN.jpg`), nombre oficial en español y una
  línea específica, según
  <https://www.un.org/sustainabledevelopment/es/news/communications-material/>.
- Cada solución: nombre, claim, qué es, cómo funciona, beneficiario, componentes, costo
  estimado y métricas. **Lenguaje llano**: el término técnico se traduce en la misma frase
  («fisurómetro: regla pegada a los dos lados de una grieta»).
- **Párrafo que vende y dimensiona** (nodos, metros, litros, puntos).
- **Nombres que se entiendan solos** (sin metáfora corporativa); 3 detalles que suman por reto.
- **«En la práctica» obligatorio**, 350–450 caracteres: quién opera, quién paga y cuánto
  gana, de dónde salen insumos y equipos, qué esfuerzo exige arrancar.
- **No hay sección de «lo que el jurado va a atacar»**: no hay réplica. El riesgo se
  resuelve con una decisión de diseño dentro de la propuesta.
- Cadena obligatoria: problema → causa raíz → insight → solución → métrica.
- Precedentes con link de video; si falta, se dice y se compensa.
- Sin estadísticas internas del motor.

## Anatomía de página

- Sin portada ni índice; abre en el reto 01. Tres páginas por reto, sin huérfanas.
- Cabecera: número gigante (64 pt, cobalto), título, chip `CATEGORÍA · 01/09`.
- Orden: descripción → ODS → insignias → «Dos soluciones posibles» → Opción 01 →
  Opción 02 (página nueva) → detalles → cadena → métricas → señal → precedentes → pitch
  de 60 s → COMENTARIOS con líneas regladas.

## Jerarquía visual

- Rótulos navy `#0D1B35`; cuerpo `#334155`; metadatos `#5C7193`; cobalto `#0866F5` solo
  para número de reto, métrica clave, pasos y links.
- Secciones con regla hairline 1 px + rótulo mono. Sin tarjetas, sombras, emojis ni
  degradados. `break-inside: avoid` en filas y grupos.

## Entregables

- **PDF** A4 por Chrome headless (fuentes locales Plus Jakarta Sans + JetBrains Mono);
  **Word** espejo, con ODS como tabla de imagen oficial; **Excel** con Panel + una hoja por
  reto (ambas soluciones, detalles, métricas, comentarios editables).
- Comandos: `scripts/gen_dossier.py` (dossier curado) o `scripts/soluciones_motor.py` +
  `scripts/gen_soluciones_pdf.py` (borrador). Especificación de diseño: `references/dossier-soluciones.md`; doctrina: `docs/MOTOR_SOLUCIONES.md`.

## Validación antes de entregar

1. 3 páginas por reto, sin huérfanas; revisar el `y` máximo de cada página.
2. Sin `saturacion`, `probabilidad`, `win rate`, `score` ni «No documentado».
3. Por reto: 2 soluciones independientes, insignias verificadas, 3 detalles, links de
   video, ODS oficial y un «En la práctica» por solución.
4. Cada solución declara familia (A–G) o justifica por qué igual pasa las cinco pruebas.
5. Renderizar a PNG: sin cortes ni grupos partidos; COMENTARIOS completos en el área útil.
