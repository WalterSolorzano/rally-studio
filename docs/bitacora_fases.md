# Bitácora de fases

Registro vivo de las 13 etapas. Lo lee `scripts/verificar_fases.py`: una etapa con
artefacto y sin línea aquí **no cuenta como cerrada**.

## Qué se anota y qué se transmite

Una línea por etapa cerrada. Seis campos separados por `|`, sin encabezado repetido:

```
fase | artefacto | compuerta | decisión | construyó | auditó
```

- **fase** — dos dígitos de la etapa (`00` … `12`).
- **artefacto** — qué quedó escrito y dónde (`brief.rally_type`, `budget/budget.json`).
- **compuerta** — qué comando lo probó (`validate_budget.py`, `verificar_identidad.py`).
  Solo scripts registrados y existentes: la compuerta se demuestra, no se declara.
  Además debe ser **la compuerta de esa etapa** y el `verificar_fases.py` la corre de
  nuevo: si no es de la fase o no sale en verde, la etapa no cierra.
- **decisión** — `aceptada` o `descartada` por el humano. Sin esto la fase no avanza.
- **construyó** — quién lo produjo (skill o agente).
- **auditó** — quién lo revisó: exactamente lo que el mapa declara en la columna
  «audita». **Debe ser distinto** de quien construyó, y ese auditor debe dejar su
  informe en `audit/NN-auditor.md` (con contenido real, no plantilla). Sin informe la
  fase no cierra, igual que sin compuerta en verde.

La línea es el mensaje entre fases: la etapa siguiente la lee para saber qué hereda.
Si un dato falta, no se escribe la línea: se pregunta y se anota la pregunta abajo.

## Mapa de dependencias

```
fase | etapa      | depende de | construye              | audita
00   | certamen   | -          | profe                  | humano
01   | team       | 00         | propuesta-identidad    | impeccable
02   | challenges | 00         | proponer-retos         | sharktank
03   | solution   | 02         | profe                  | sharktank
04   | impact     | 03         | profe                  | auditar-entregable
05   | multi_ai   | 03         | orquestador            | auditar-entregable
06   | pautado    | 03,04      | profe                  | auditar-entregable
07   | budget     | 03         | presupuesto            | auditar-entregable
08   | resources  | 01         | profe                  | auditar-entregable
09   | canvas     | 07         | profe                  | auditar-entregable
10   | script     | 06,09      | guion-storyboard       | auditar-entregable
11   | webdemo    | 01,09      | publicar-sitio         | impeccable + responsive
12   | timeline   | 10,11      | control-tiempo-entrega | auditar-entregable
```

Regla: ninguna etapa se escribe si una de sus dependencias no tiene artefacto.
`python scripts/verificar_fases.py` lo comprueba y nombra la etapa saltada.

## Preguntas abiertas

Nada definido todavía: `brief.json` está vacío por diseño. La compuerta imprime
qué preguntar en la fase que sigue.

## Registro

| fase | artefacto | compuerta | decisión | construyó | auditó |
|---|---|---|---|---|---|

*(vacío a propósito: ninguna etapa se cierra sin artefacto, compuerta en verde y decisión
humana. Con `brief.json` en blanco no hay etapa que cerrar.)*

## Revisiones del sistema

No son fases del certamen: son auditorías del propio motor. Se registran aquí porque
prueban el mecanismo antes de que exista un proyecto, y porque cada una dejó informe.

| fecha | alcance | construyó | auditó | informe |
|---|---|---|---|---|
| 2026-11-18 | Candado de escritura, orden 409/423, W04, W05 | profe | subagente general (rol auditor) | `audit/sistema-auditor.md` |
| 2026-11-18 | Prueba de novato: contexto cero, primer arranque | subagente general (rol usuario) | profe | `audit/prueba-novato.md` |
| 2026-11-18 | Arranque en copia limpia: dependencias, llave, descargas | subagente general (rol usuario) | profe | `audit/fase-a-arranque.md` |
| 2026-11-18 | Generadores en copia limpia: 23 generadores y validadores | subagente general (rol usuario) | profe | `audit/fase-b-generadores.md` |
| 2026-11-18 | Web demo en copia limpia: identidad, paleta, sitio | subagente general (rol usuario) | profe | `audit/fase-c-webdemo.md` |
| 2026-11-18 | Cadena completa con proyecto de prueba y auditoría de cierre | profe | profe | `audit/informe-auditoria-exhaustiva.md` |
| 2026-11-18 | Medición en navegador real: piso de lectura móvil, caché de la hoja y verificador de fases | profe | navegador (Chrome, instancia limpia) | `audit/g3-390.png`, `audit/g3-1440.png` |
| 2026-11-18 | Recorrido de pestañas a 1440 y 390, y arsenal sobre artefactos reales | profe | navegador + `arsenal.py` en copia con proyecto de prueba | `audit/tab-*.png`, `audit/informe-auditoria-exhaustiva.md` |
| 2026-11-18 | Las trece pestañas medidas con proyecto de prueba; botón de retos sin `onclick` corregido | profe | navegador (Chrome, instancia limpia) | `audit/tab-*-{1440,390}.png` |
| 2026-11-18 | Flujo con reto real en copia aislada: coherencia de cifras y pautado sin marcadores | profe | profe (fixture `rallysistem_lab/auditoria/`) | `rallysistem_lab/auditoria/fixture/final/` |
| 2026-11-18 | Barrido genérico de nombres demo y acentos reales en el pautado | profe | profe (`rallysistem_lab/auditoria/detector_hardcodes.py`) | `rallysistem_lab/auditoria/` |
| 2026-11-18 | Segunda pasada: marcas de ejemplo fuera del kit y teleprompter de muestra vacío | profe | profe (`rallysistem_lab/auditoria/detector_hardcodes.py`) | `rallysistem_lab/auditoria/` |
| 2026-11-18 | Efectos latentes cerrados: coherencia sin ruido, guardas en la suite, orden paleta→presupuesto | profe | `pytest` (366) y `arsenal.py` sobre el fixture | `checks/coherencia.py`, `tests/` |
| 2026-11-24 | Ley de identidad por capa: frontera motor→proyecto con `verificar_frontera.py`, alcance de `DESIGN.md` y `ui-minima.md`, pareja tipográfica por ruta y puente identidad | profe | `pytest` (939) + negativos inyectados en copia temporal | `scripts/verificar_frontera.py`, `scripts/puente_identidad.py`, `tests/test_verificar_frontera.py` |

Lo que encontró la prueba de novato y cómo se cerró:

- **Cerrado después, con autorización** (toca el motor): la descarga no era un cuelgue sino un
  302 al login —`/docs/pautado_draft.docx` exigía sesión y el navegador guardaba la pantalla de
  entrada con extensión `.docx`—. Ahora un documento sin sesión responde 401 en JSON, el botón baja
  el archivo por `fetch` y lo entrega como blob con su nombre, y «Descargar Excel» avisa que hay
  que generar el Excel en vez de dejar un enlace muerto. El otro: lo escrito en la interfaz vivía
  solo en `localStorage`; el espejo de estado ahora copia los campos de identidad, reto, impacto y
  enlaces a `brief.json`, sin borrar lo ya escrito con un campo vacío.
- **Corregido**: `gen_pautado.py` ya no revienta cuando `ods_ids` son números; `validate_budget.py`
  exige una descripción de ≥6 palabras por fila («sensor» solo no pasa); `requirements.txt`
  separa el núcleo de cinco paquetes de lo opcional —`playwright`, `soundfile`, `pdfplumber`—
  que antes se instalaban siempre y bajaban cientos de MB.
- **Corregido en copia aislada** (`rallysistem_lab/auditoria/`): `check-coherencia` ya no cuenta
  códigos de ODS, ids de reto, segundos de acto, cifras con fuente en `research/claims.json` ni
  partidas con URL de `budget/budget.json` como contradicciones del pitch; y `gen_pautado.py`
  acepta `impact_detail` y `prefactibilidad_detail`, para que el usuario redacte esas dos
  secciones en lugar de quedarse con el ODS suelto y el total del presupuesto.
- **Barrido genérico** (`rallysistem_lab/auditoria/detector_hardcodes.py`): busca marcas con guion,
  nombres de persona, municipios concretos y siglas de producto dentro de cadenas, en `scripts/`,
  `checks/`, `dashboard/`, `plantillas/` y `site/`. De 73 hallazgos, la mayoría son precedentes de
  ganadores y vocabulario del certamen; se limpiaron `gen_readme.py` (ciudad y país inventados en
  la portada del README), `app.js` (ciudad piloto `Managua` por defecto y el campo de nombre con
  tres marcas de ejemplo) y la copia suelta del teleprompter, que llevaba un guion de café con
  «Doña Marta» y Jinotega. El pautado ya escribe acentos reales: «Límite», «Categoría», «Desafío»,
  «implementación», «de qué año», «cómo funciona», «por qué aquí sí funciona».
- **Segunda pasada del barrido**: el kit de diseño proponía marcas concretas como ejemplo
  (siete nombres de fantasía) y la copia suelta del teleprompter conservaba un guion de café
  entero; ambas quedaron sin nombres propios. Los 70 hallazgos restantes son precedentes de
  ganadores, ejes del Plan Nacional, etiquetas de candado, `XXXX-XXXX-XXXX` del login y un
  `ROC-AUC` que el detector confunde con marca: ningún dato de proyecto impuesto al usuario.

- **Efectos latentes cerrados**: la coherencia ya no confunde con cifras del pitch la indicación de
  tempo del shotlist, el numeral de lista, el paso entre paréntesis, la etiqueta del acto (`A2`) ni
  el nombre del asset; el teleprompter de muestra y los generadores tienen guarda propia en
  `tests/`, para que una corrección sin efecto rompa la suite en vez de pasar inadvertida. El
  presupuesto avisa en pantalla que sin paleta aprobada el generador se niega a cotizar, y el
  validador explica en español qué significa cada valor de `deliverable_type`.

Regla de la revisión: la hace alguien distinto de quien construyó, y su veredicto puede ser
FALLA. La del 18 de noviembre encontró un candado huérfano en `publicar_seccion.py` que
dejaba la sección bloqueada quince minutos; se corrigió en el commit siguiente.

