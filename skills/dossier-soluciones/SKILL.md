---
name: dossier-soluciones
description: Convierte los retos del comité o del usuario en un dossier formal de 3 páginas por reto (PDF, Word, Excel) con precedentes ganadores y razonamiento problema-causa-insight-solución-métrica. Úsala cuando piden el documento entregable. Si solo quieren ideas en el chat, usa `proponer-retos`.
---

# Labia Interna — Dossier de soluciones

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

## Compuerta de contenido: nueve campos antes de escribir

Esta compuerta se corre **por opción**, antes de redactar. Si un campo no se llena con una
frase concreta, la opción no entra: no se maquilla después con la narrativa. La tabla de
trabajo se guarda junto al JSON; el PDF solo muestra la versión limpia.

| # | Campo | Se escribe así | Se rechaza si… |
|---|---|---|---|
| 1 | **Encaje literal** | «El reto nombra: [lista literal del enunciado]. Esta opción atiende a [actor] con [objeto de esa lista]. El mecanismo funciona para [3 casos de la lista] o se justifica el subconjunto.» | el actor u objeto no está en el enunciado; la escena abre con un objeto que el reto no nombra; el mecanismo solo funciona para un caso. |
| 2 | **Bucle de decisión** | «La decisión es [X]; la toma [quién] con el umbral [Y] en [plazo Z]; si no se actúa, pasa [consecuencia].» | no hay decisor, no hay umbral o el plazo no existe. Si el fenómeno tarda años y la decisión se toma en semanas, el sensor no es la solución. |
| 3 | **Estado del arte** | «Hoy la mejor alternativa es [producto/servicio/práctica], cuesta [precio o costo] y se consigue en [lugar o proveedor]. No basta porque [límite concreto]. Esta opción hace [capacidad distinta].» | el sustituto es un armatoste casero o una práctica manual; la diferencia es solo «más barato», «más bonito» o «sin red». |
| 4 | **Precedente equivalente** | «[Equipo, año, puesto] resolvió [mecanismo] con [artefacto]. Esta opción usa el mismo mecanismo: [equivalencia en una frase].» | el caso es de otro mecanismo o de otro sector; el mismo precedente se repite más de dos veces en el dossier. |
| 5 | **Factibilidad** | «Mide [variable] con [instrumento]; resolución [X]; calibración [Y]; falla en [modo]; lo repara [quién].» | la resolución del instrumento es mayor que el fenómeno; el proceso exige una condición que el usuario no puede mantener; no hay prueba de mesa en una semana. |
| 6 | **Costo de abajo hacia arriba** | «[Componente] × [cantidad] × [precio unitario] = [total]. Fuente: [URL o cotización, fecha]. El rubro dominante es [X].» | el total no es la suma; no hay fuente ni fecha; el total es menor que la suma de los componentes listados. |
| 7 | **Pagador con línea** | «Compra [institución/empresa/persona] con [partida/ingreso]; firma [cargo]; recibe [bien]; mantiene [quién].» | el pagador es «la junta», «la comunidad», «el guardia con pago simbólico» o «el jefe sin sueldo»; no hay partida, contrato ni mantenimiento. |
| 8 | **Categoría justificada** | «Categoría [X] porque la rúbrica la define como [definición] y esta solución cumple [criterio].» | se asigna por intuición o por defecto; el set de retos no trae categoría y se inventa una. |
| 9 | **No herencia** | «Esta opción no reutiliza escena, actor, dispositivo, costo, claim ni precedente de un dossier o una versión anterior; si coincide en el tema, se reescribió desde el enunciado.» | el texto conserva una escena u objeto de la versión anterior que el reto no nombra. |

**Cómo se usa.** Se llena la tabla para las dos opciones de cada reto. Una sola celda
«rechaza» elimina la opción: se genera otra, no se baja el estándar. Las tablas se guardan en
`docs/_build/compuerta_<certamen>.md` o junto al JSON del dossier. Sin esa tabla no se corre el
generador del PDF.

## Detalle completo (leer antes de producir)

El procedimiento largo, las tablas y los ejemplos de esta skill están en
`references/detalle.md`. Es obligatorio leerlo antes de generar contenido: ahí viven las
reglas que no caben en esta portada.
