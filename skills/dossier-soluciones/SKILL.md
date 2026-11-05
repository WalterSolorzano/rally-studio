---
name: dossier-soluciones
description: Convierte los retos del comité o del usuario en soluciones sustentadas y un dossier de 3 páginas por reto (PDF, Word, Excel), con precedentes ganadores y razonamiento problema-causa-insight-solución-métrica.
---

# Dossier de soluciones

Este sistema **no crea retos**: los entrega el usuario o el comité. Sin retos no hay dossier.

## Regla dura: el diseño del PDF ya está decidido

**Se usa el diseño que ya tenemos. No se inventa otro.** El dossier se maqueta siempre con
`scripts/gen_dossier.py` sobre el JSON de contenido, y el resultado debe coincidir con el
PDF de referencia aprobado (`Soluciones_Prueba_09_Retos.pdf`, o el que indique el usuario).

- Prohibido escribir CSS propio, plantillas propias, portadas nuevas o «una versión mejorada
  del diseño».
- Prohibido cambiar márgenes, tipografías, colores, rejillas o el orden de las secciones para
  esta entrega concreta.
- Si el texto nuevo no entra en el diseño, se recorta el texto; nunca se rediseña la página.
- Antes de dar el PDF por terminado: abrir la referencia y el PDF generado, comparar página
  por página, y renderizar a PNG. Si la anatomía no calza, el entregable está mal aunque el
  contenido sea bueno.

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

La cadena obligatoria (problema → causa raíz → insight → solución → métrica) se recorre en
este orden; cada paso descarta lo que no aguanta y afina lo que queda.

**1. Diagnóstico: problema → causa raíz → insight.** Separa síntoma de causa. Nunca
escribas «causa no documentada»: razona el mecanismo y marca toda cifra como «estimación a
validar».

**2. Inventario y descomposición del recurso.** Si el reto trae un recurso o residuo
(motores dañados, poda, plásticos), descríbelo completo antes de idear: cantidad, estado,
componentes, materiales, peso, quién lo genera y cuánto cuesta obtenerlo. Divide el recurso
en sus partes: cada parte puede ser un producto distinto, no una sola idea.

**3. Análisis sistémico antes de idear.** Escribe el sistema del reto: actores (quién lo
sufre, decide, opera y paga), flujos de materia y energía, capacidad instalada,
estacionalidad, normas y quién pierde si funciona. La idea resuelve al menos dos tensiones
a la vez (residuo y costo, desempleo y servicio, dato y decisión). Toda idea debe tener un
beneficiario identificable.

**4. La familia del reto, no el ejemplo cómodo.** Si el reto nombra un conjunto
(«electrodomésticos», «residuos del mercado»), la solución sirve para el conjunto aunque
cambien marca, año o modelo: un mecanismo que **mide y se adapta en el sitio**, o una ruta
de acopio y clasificación.

**5. Primero el banco, después la idea.** `knowledge/retos_razonamiento.json` guarda 20
casos (`id`, `temas`, `year`, `rally`, `categoria`, `equipo`, `puesto`, `problema`,
`causa_raiz`, `insight`, `solucion`, `metrica`, `video_url`). Se busca por **verbo del
mecanismo** («reutilizar», «medir», «trazar», «filtrar») y por `temas`, no por título. Se
aprovechan `insight` y `metrica`; si un campo dice «No documentado en la fuente», se razona
y se marca como estimación. Son **contexto de ganadores**, no estadística: 20 casos, solo
podios, erratas posibles. Antes de citar año, rally, equipo o puesto, contrasta con
`knowledge/ERRATAS.md` y la fuente del repo.

**6. Familias de mecanismos (ayuda de búsqueda, no puerta de entrada).** Sirven para
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

**7. Lo obvio no basta — y dos salidas quedan prohibidas.** Nombra las soluciones típicas
—taller que repara y revende, venta como chatarra, donación, reventa y campaña de
concientización— y comprueba que la tuya no sea una de ellas a secas.

Dos están cerradas, no son banderas:

- **Prohibido que una solución sea un taller, un servicio o una mesa de desarme.** Un taller
  no se vende en un rally y suele ser algo que ya existe: el electricista que rebobina, el
  jabonero del mercado, el técnico que evalúa paneles. Cada opción debe ser un **producto,
  un sistema o un modelo con activo propio** (un objeto que se instala, un stock con
  garantía, una infraestructura, un envase retornable).
- **Prohibido suponer donaciones** (motores donados, celulares donados, «horas-crédito»,
  «el municipio firma»). Si no está escrito **qué gana cada actor y quién paga**, eso no
  ocurre y el jurado lo desarma en una pregunta. Toda solución declara su flujo de dinero
  en una línea: quién cobra, cuánto y por qué le conviene.


**8. Generación divergente antes de converger.** Mínimo 10 ideas por mecanismos distintos,
sin cortar las malas todavía:

- transformar el recurso en un producto nuevo (cambiar su función, no repararlo);
- herramienta de educación gratuita (kits, laboratorios, material de práctica para escuelas sin recursos);
- infraestructura comunitaria básica (agua, energía, alimentos, conectividad);
- medio de ingreso para población vulnerable (microtaller, cooperativa, cadena de producción inclusiva);
- apoyo a personas en situación de riesgo o dependencia (con límites de seguridad; nunca dispositivos médicos sin validación);
- sistema ciberfísico: hardware accesible + software/datos que den valor al territorio o a una política pública;
- modelo que cierra el ciclo: el producto o su operación regenera el recurso o financia su propia recolección.

**9. Cinco pruebas de descarte.** La idea pasa las cinco o se replantea: ¿lo monta mañana
un taller común sin nada nuevo? ¿el insumo varía tanto que no se estandariza? ¿alguien lo
usa a diario y paga? ¿la métrica es física (quintales, litros, vatios, horas, personas)?
¿qué gana quien lo opera y qué pierde el barrio sin él?

**10. Filtro de impacto.** Elimina lo que no pase; cada idea declara:

- beneficiario concreto: quién, cuántos, qué cambia en su vida;
- ODS que atiende y por qué, no por etiqueta;
- economía circular: qué residuo evita, qué material recupera, si el ciclo cierra;
- acceso: gratuito o de bajo costo para quien más lo necesita, con financiamiento sostenible;
- dignidad y participación: la comunidad opera o co-diseña, no solo recibe.

Sin beneficiario identificable, sin ciclo de recursos o sin quien lo financie, se descarta.

**11. Evaluación de las tres mejores (siete lentes).** Técnica (¿se fabrica con lo
disponible?), económica (costos, ingreso, punto de equilibrio simple), financiamiento y
mercado, social (aceptación, quién opera, riesgo de causar daño), ambiental, legal y
seguridad, y escala (¿funciona con 10 unidades y con 1,000?, ¿sirve para toda la familia del
reto o solo para el ejemplo cómodo?).

**12. Banderas de riesgo restantes (con la condición que las resuelve).** No son
prohibiciones: hay ganadores que las tocaron. Cada bandera se escribe junto a su salida.
Las de taller/servicio y donación ya quedaron cerradas en el paso 7.

| Bandera | Se resuelve si… |
|---|---|
| App que conecta oferta y demanda | existe acopio, logística u operador con nombre y costo |
| Capacitación como núcleo | acompaña a un objeto o servicio que funciona sin ella |
| Sensor suelto | alguien decide con el dato y hay plazo para actuar |
| Kit sin operador | quién lo opera y quién cobra está definido |
| Mejora del mismo producto | cambia quién lo usa o quién paga |
| Dependencia de un solo caso | el mecanismo cubre la familia completa del reto |

**Prueba de «ya existe» (obligatoria).** Nombra **dos sustitutos actuales** —una app, un
oficio, un producto de ferretería, una práctica municipal— y di en una frase **qué hace
distinta** esta idea. Si no encuentras los dos, no buscaste: busca otra vez. Si la
diferencia es «más barato» o «más bonito», tampoco alcanza.


**13. Revisión crítica (tipo sharktank).** Etiqueta cada hallazgo como HECHO o SUPUESTO,
separa fallas de la idea de fallas de implementación, y anota 3–5 puntos que ya aguantan.
La auditoría completa la hace la skill `sharktank`; aquí basta el autoexamen antes de
redactar.

**14. Validación barata.** Para cada finalista, una prueba que se haga en menos de una
semana, con costo estimado, que confirme o tumbe el supuesto más riesgoso.

**15. La prueba del día 400.** ¿El servicio sigue?, ¿quién cambió la pieza gastada y pagó?,
¿qué pasa si el operador se va? Si la respuesta es «depende de un proyecto nuevo», no está
terminada.

**16. Prueba final anti-genérico.** Cambia dos palabras del problema por otro problema
distinto. Si la propuesta sigue sirviendo igual, es genérica: rehazla desde el paso 2.

## Contenido

- **Dos soluciones por reto.** Opción 01 principal; Opción 02 con **mecanismo distinto**,
  independiente, no «fase 2» ni plan B. Misma jerarquía visual. Si la 02 no puede vivir sin
  la 01, no es una segunda opción: es un paso.
- **Insignias**: 2 o 3 por reto desde `knowledge/insignias.json`, solo `verified: true` y
  solo si el mecanismo las habilita; si no aplica, se omite la fila. No se inventan.
- **ODS**: figura oficial de la ONU (`E_SDG_Icons-NN.jpg`), nombre oficial en español y una
  línea específica, según
  <https://www.un.org/sustainabledevelopment/es/news/communications-material/>.

### El «qué es»: escena, no ficha técnica

El «qué es» es un **párrafo narrativo de 150 a 250 palabras** (cuenta las palabras, no lo
estimes). Conteo obligatorio antes de maquetar.

- **Cuenta una escena**: quién la usa, qué hace con ella, qué cambia en su vida.
- **Dentro del párrafo no van precios, componentes ni métricas.** Esos datos van en sus
  campos, no en la idea: «bomba centrífuga de baja altura acoplada a motor…» es una línea de
  especificación, no una solución que alguien quiera comprar.
- El párrafo cierra con **por qué esto no es lo que ya existe**.
- El término técnico se traduce en la misma frase («fisurómetro: regla pegada a los dos lados
  de una grieta»).
- Debajo del párrafo, en campos aparte: claim, cómo funciona (4 pasos), beneficiario,
  componentes, costo estimado y métricas.

**Ejemplo de forma (idea por validar, no texto para copiar):**

> En muchas laderas hay casas con grietas en sus muros y nadie sabe si están quietas o
> moviéndose. Los instrumentos que lo miden cuestan cientos de dólares y los interpreta un
> ingeniero. La idea es convertir un celular viejo en ese instrumento: se coloca en una caja
> sellada fija al muro y, usando el sensor de movimiento que ya trae, registra la inclinación
> y las vibraciones de la pared las 24 horas. En lugar de números, la familia ve una luz en
> la pantalla: verde, amarillo o rojo, según cuánto se aleja la pared de su estado inicial.
> Si pasa a rojo, el sistema avisa a un responsable de la comunidad que ya sabe qué hacer.
> Cualquier barrio con casas en riesgo puede tener su red de vigilancia por una fracción de
> lo que cuesta un equipo profesional.

Ese párrafo también expone los huecos: ¿quién fija el umbral?, ¿quién responde?, ¿de dónde
sale el celular? Se resuelven en `Quién paga` y `Por validar`, no escondiéndolos.

### Jerga interna: prohibida en lo que lee el jurado

No aparecen en el dossier: **nómina, jugador, canal, nodo, sesgo, ticket, mecanismo,
«est. canon», saturación, probabilidad, win rate, score, «No documentado»**. Son términos
del sistema. Se traducen a lenguaje de calle: «canal» → «quién lo vende o lo instala»,
«ticket» → «prueba de 2 semanas», «mecanismo» → «cómo funciona».

### Tres campos fijos por solución

- **Ya existe:** dos sustitutos actuales + la diferencia en una frase.
- **Quién paga:** quién cobra, cuánto y qué gana cada actor (barrio, taller, escuela,
  municipio). Sin donaciones supuestas.
- **Por validar:** el supuesto más riesgoso y la prueba barata que lo confirma o lo tumba.

### Resto del contenido

- **Verbos con mecanismo, no huecos**: si aparece «fomentar», «sensibilizar», «conectar» o
  «empoderar», que venga con el cómo concreto detrás; el verbo solo no dice qué se hace.
- **Nombres que se entiendan solos** (sin metáfora corporativa); 3 detalles que suman por reto.
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

- **Diseño:** ver «Regla dura: el diseño del PDF ya está decidido» (arriba). Siempre
  `scripts/gen_dossier.py`; nunca CSS propio.
- **PDF** A4 por Chrome headless (fuentes locales Plus Jakarta Sans + JetBrains Mono);
  **Word** espejo, con ODS como tabla de imagen oficial; **Excel** con Panel + una hoja por
  reto (ambas soluciones, detalles, métricas, comentarios editables).
- Comandos: `scripts/gen_dossier.py` (dossier curado) o `scripts/soluciones_motor.py` +
  `scripts/gen_soluciones_pdf.py` (borrador). Especificación de diseño: `references/dossier-soluciones.md`; doctrina: `docs/MOTOR_SOLUCIONES.md`.

## Validación antes de entregar

1. **Diseño**: el PDF salió del generador aprobado; misma anatomía que la referencia
   (número grande + título, ODS, insignias, dos opciones, métricas, señal, precedentes,
   pitch, comentarios). Cero CSS propio.
2. 3 páginas por reto, sin huérfanas; revisar el `y` máximo de cada página.
3. **Narrativa**: cada «qué es» tiene entre 150 y 250 palabras, cuenta una escena y no
   contiene precios ni componentes dentro del párrafo.
4. **Jerga**: cero apariciones de nómina, jugador, canal, nodo, sesgo, ticket, mecanismo,
   «est. canon», `saturacion`, `probabilidad`, `win rate`, `score` ni «No documentado».
5. **No taller / no servicio**: ningún nombre de opción es taller, servicio, mesa de desarme
   ni capacitación. Cada una es producto, sistema o modelo con activo propio.
6. **Sin donaciones supuestas**: cada solución trae `Quién paga` con el flujo de dinero y lo
   que gana cada actor.
7. **Ya existe**: dos sustitutos actuales nombrados y la diferencia en una frase, por opción.
8. **Familia del reto**: la solución cubre el conjunto, no el ejemplo más cómodo.
9. Por reto: 2 soluciones independientes, insignias verificadas, 3 detalles, links de
   video, ODS oficial.
10. Cada solución declara familia (A–G) o justifica por qué igual pasa las cinco pruebas.
11. Renderizar a PNG: sin cortes ni grupos partidos; COMENTARIOS completos en el área útil.
12. Correr el verificador de texto sobre el PDF final (conteo de palabras, términos
    prohibidos, aparición literal de cada narrativa) antes de decir que está listo.

