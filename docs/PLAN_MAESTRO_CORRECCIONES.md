# Plan maestro de correcciones — Rally Studio

**Insumo:** `C:\Users\--X\Downloads\rally-sim-latam-2026\CRITICAS_Y_CORRECCIONES.md`
(26 + 7 críticas del usuario sobre el simulacro, agrupadas en 7 fallos de fondo).
**Objeto a corregir:** este repositorio (`rallysistem`), no el simulacro.
**Tesis:** el simulacro no falló por falta de contenido; falló por falta de **compuertas**.
Rally Studio ya tiene la identidad, los tokens y las skills. Lo que no tiene es el mecanismo
que impide que un agente los ignore.

---

## 0. Veredicto en una línea

El simulacro produjo artefactos y no proceso. Rally Studio tiene el proceso escrito y no lo
hace obligatorio. Este plan convierte cada crítica en una compuerta ejecutable dentro de
`rallysistem`, con archivo, comando y evidencia.

---

## 1. Qué diferencia a Rally Studio (la respuesta a "no sé qué lo tiene")

El simulacro copió la paleta de este repo y aun así salió genérico. La diferencia no es el
color: es que aquí el diseño está **declarado, prohibido y medido** antes de construir.

| # | Diferencia | Dónde vive | Por qué el simulacro no la tuvo |
|---|---|---|---|
| D1 | **Sistema de diseño declarado antes del código**, con nombre propio ("The Cardless Typographic Workbench") y reglas con nombre ("The No-Card Rule", "The Focused Accent Rule", "The Tabular Precision Rule"). | `DESIGN.md` (224 líneas) | No existía `DESIGN.md` en el simulacro hasta después del reclamo. |
| D2 | **Una sola fuente de verdad de color y tipografía**, en variables CSS, con cero `style="..."` inline (prohibido por escrito). | `dashboard/style.css` `:root` (líneas 6-74) | Se pintó a mano pantalla por pantalla. |
| D3 | **Doctrina sin tarjetas**: la jerarquía la hacen tipografía, divisores de 1px y espacio negativo; no cajas flotantes con sombra. | `DESIGN.md` §Elevation, `dashboard/style.css` | El simulacro cayó en el cliché de cards. |
| D4 | **Densidad medida**: escala de espaciado base 4 (`--space-1..7`), escala tipográfica de 5 pasos (11/12/13/16/22 px), radios 8/12/18 px, sombras en 3 niveles. | `dashboard/style.css` | Sin escala, todo es arbitrario. |
| D5 | **Bicromía táctica con proporción**: navy institucional + azul cobalto de acción, con la regla de que el azul ocupa ≤10 % de la superficie. | `DESIGN.md` §Colors | El simulacro usó 6 colores compitiendo (crítica C28). |
| D6 | **Rigor tabular**: números, cronómetros y puntajes siempre en `JetBrains Mono` + `tabular-nums`. | `DESIGN.md` §Typography | Sin criterio, la tipografía quedó en Segoe UI (crítica C27). |
| D7 | **Prohibiciones explícitas** (emojis, morado tipo IA, glassmorphism, toy badges, radios >18 px, dependencias pesadas). Un `Don't` escrito es una compuerta. | `DESIGN.md` §Don'ts | Sin "Don't", cada agente improvisa. |
| D8 | **Ley de interfaz mínima**: cero párrafos, cero datos técnicos en pantalla, icono antes que palabra, número solo si acciona una decisión. | `.agents/rules/ui-minima.md` | El simulacro explicaba con párrafos. |

**Conclusión operativa:** la corrección no es "hacer más bonito el simulacro". Es lograr que
`rallysistem` **no permita** que un agente construya sin D1-D8. Hoy mismo no lo impide: ver §2.

> Ojo con la capa: D1-D8 describen la identidad de **Rally Studio como producto** (el workbench).
> El proyecto del usuario **no hereda** esos colores: hereda los *métodos* (declarar, prohibir,
> medir, proporción, rigor tabular) y genera su propia identidad. Ver §0.1.

---

## 0.1 Principio rector: la base es general y nace vacía

Rally Studio es una **plantilla de arranque**. El usuario la toma, la abre con su reto y su
equipo, y **ahí** la IA genera la identidad, la paleta, el sitio y el maquetado. Por eso nada
del proyecto puede venir fijo.

Hay dos capas y no se mezclan:

| Capa | Qué es | ¿Fija? | Archivos |
|---|---|---|---|
| **Producto** | La identidad de Rally Studio (el taller, la herramienta). | **Sí, fija.** | `dashboard/*`, `DESIGN.md` |
| **Proyecto** | La identidad del equipo que corre el rally: su paleta, su sitio, su guion, su presupuesto. | **No. Nace vacía y se genera en la llamada.** | `brand/*`, `site/*`, `script/*`, `budget/*`, `assets/*` |

Cinco reglas que se derivan de esto y que rigen todo el plan:

- **R1 · Cero identidad fija en la capa proyecto.** Ningún hex literal en `site/`, `script/` ni
  entregables. Solo `var(--…)` que apunten a tokens generados.
- **R2 · Falta de identidad es error, no default.** Si no existe `brand/palette.json`, el
  generador **falla**. Nunca usa "un azul neutro".
- **R3 · `brand/` nace sin valores.** Solo un estado `"pendiente"`. Nada de paleta heredada.
- **R4 · La paleta se deriva del reto y del proyecto**, no del logo de la herramienta ni de una
  API externa a ciegas.
- **R5 · La identidad del producto no se hereda al proyecto.** El cobalto `#0866F5` es de Rally
  Studio; el equipo puede terminar con otra paleta y está bien.

> Si una corrección mete un color, una tipografía o un nombre fijo en la capa proyecto, está
> mal hecha aunque se vea bonita.

---

## 2. Agujeros verificados en `rallysistem` (evidencia, no opinión)

Estos cinco huecos explican por qué un agente nuevo puede repetir el simulacro dentro de este
repo.

### A2.1 La capa de proyecto no nace vacía: nace con una paleta heredada y falla en silencio

Esto no es "dos fuentes de verdad". Es peor: la capa que debe nacer **vacía** viene con una
paleta de otro proyecto, y cuando falta, el generador inventa una.

```
brand/palette.json   → primary #1d45b9, secondary #f81110, accent #2aa7ad  (colormind, de otro equipo)
brand/tokens.css     → los mismos 5 valores, sin bg/border/text/status/escala
site/style.css       → 21 hex literales del producto (#0866F5, #0D1B35…) grabados en el sitio del proyecto
```

Los generadores de contenido leen esa paleta heredada: `scripts/comun.py:34`,
`scripts/gen_budget.py:32`, `scripts/gen_report_figures.py:28`, `scripts/gen_analisis_pdf.py:53`,
y `scripts/gen_sharktank_pdf.py:7` escribe `#1d45b9` a mano en el docstring.

Y si `brand/palette.json` no existe, **no se detiene**: `scripts/gen_budget.py:57` imprime
`"WARN: brand/palette.json no encontrado; se usa azul neutro."` y `scripts/comun.py` función
`paleta()` hace `leer_json(PALETA, {}) or {}` y devuelve `{}`. Es la violación directa de R2 y R3.

**Es exactamente C4/C7/C28:** el agente abre `brand/`, encuentra una planta ajena (azul + rojo +
teal) y la estampa. No es que la identidad buena esté en otro archivo: es que **la identidad del
proyecto nunca se generó**, y el default silencioso le tapó el error.

### A2.2 El movimiento existe y no está declarado

```
Select-String -Path dashboard\*.css -Pattern prefers-reduced-motion  → 10 bloques (style.css x9, stats.css x1)
Select-String -Path dashboard\*.css -Pattern '@keyframes'            → 30 definiciones
duraciones reales: 120/140/150/160/180/200 ms + bucles ambientales 1.1s, 1.9s, 4s
```

El código ya cumple C30. Lo que falta es que `DESIGN.md` declare la tabla (duración, easing,
propósito) y la regla de los bucles. Sin declaración, el siguiente agente no sabe que existe y
vuelve a improvisar.

### A2.3 "Rally Design" existe como script, no como pantalla del flujo

`scripts/gen_pagina_diseno.py` genera `site/diseno/{index,kit,thumb,impacto}.html`, pero
ninguna pestaña del workbench lo abre y ninguna skill obliga a pasar por ahí. Críticas C19 y
C10 siguen abiertas.

### A2.4 No hay compuerta entre fase y fase

El workbench avanza por `stage`/`activeTab` (`dashboard/app.js:499, 829-905`) y el buzón
(`scripts/servir_propuesta.py`) sirve propuestas, pero **nada impide** que el agente genere
pautado, presupuesto y guion sin una sola aprobación humana. Fallos F-A y F-B sin cerrar.

### A2.5 El sitio es un stub, no una plantilla

`site/index.html` pesa **627 bytes** y dice, literal: *"Prototipo pendiente de generar"*. Su
`site/style.css` (6 021 bytes) es **el mismo archivo** que produjo el sitio genérico del
simulacro. Es decir: el simulacro arrancó de este stub y lo publicó sin construir nada encima.

```
Get-Content site\index.html
(Get-FileHash site\style.css).Hash   # 08DBDDC8... idéntico al site/style.css del simulacro
```

Crítica C1 sin cerrar: no hay plantilla de marketing, hay un marcador de posición.

---

## 3. Mega plan: 12 frentes de trabajo

Cada frente declara: críticas que cierra, cambio concreto, archivos, compuerta y evidencia.
Prioridad: **P0** = sin esto se repite el simulacro · **P1** = calidad de entrega · **P2** = pulido.
Frontera: los frentes marcados **[frontera]** tocan motor (`dashboard/*.js`, `scripts/rally_service.py`)
y requieren autorización del usuario; el resto es contenido y puede ejecutarse ya.

---

### W01 · La capa de proyecto nace vacía y se genera en la llamada — **P0**

**Cierra:** C4, C7, C9, C28, F-D, F-F · **Hueco:** A2.1

**Cambio:**
1. **`brand/` nace sin valores.** `brand/palette.json` queda en
   `{"_status": "pendiente", "_generado_por": null}` hasta que se invoque la generación. Nada de
   colormind heredado. `brand/tokens.css` queda como plantilla vacía con solo los nombres de
   variable y un comentario de cabecera.
2. **La paleta se deriva del reto y del proyecto**, no del logo de la herramienta. `gen_palette.py`
   recibe `challenge_title`, `challenge_id`, sector/territorio de `brief.json` y el logo **si el
   equipo lo aportó**; propone 3 rutas A/B/C con contraste WCAG de cada una.
3. **Falta de paleta = error.** `scripts/comun.py` función `paleta()` y `gen_budget.py:57` dejan de
   caer a `{}` / "azul neutro": lanzan `SystemExit` con `"brand/palette.json pendiente: correr
   gen_palette.py"`. Quitar el hex `#1d45b9` del docstring de `gen_sharktank_pdf.py:7`.
4. **Cero hex en la capa proyecto.** `site/style.css` deja de traer 21 hex del producto: solo
   `var(--…)` que el generador rellena. `site/index.html` pierde el `style="max-width:220px"` inline.
5. La paleta se genera **solo** con aprobación: imprime contraste y pide `--si`, como
   `herramientas.py`. La ruta aprobada queda servida en la ventana (checkpoint K4 de W08).

**Archivos:** `brand/palette.json`, `brand/tokens.css`, `scripts/gen_palette.py`,
`scripts/comun.py` (`paleta()`), `scripts/gen_budget.py:57`, `scripts/gen_sharktank_pdf.py:7`,
`site/style.css`, `site/index.html`.

**Compuerta G1 (dos partes, ambas obligatorias):**
```powershell
# G1a — la capa proyecto no arrastra identidad ajena
python -c "import json,sys;
p=json.load(open('brand/palette.json',encoding='utf-8'));
sys.exit(1) if p.get('_status')!='aprobada' and 'primary' in p else print('G1a OK')"
# G1b — cero hex literal fuera de dashboard/ y DESIGN.md
$h=Select-String -Path site\*.css,site\*.html -Pattern '#[0-9a-fA-F]{6}'; if($h){$h; exit 1} else {'G1b OK'}
```

**Evidencia de cierre:** G1a y G1b imprimen `OK` con `brand/` en estado `pendiente`, y la paleta
generada para un reto cambia de un proyecto a otro (dos `brief.json` distintos → dos paletas).

---

### W02 · Planta de color con proporciones, generada (no fija) — **P0**

**Cierra:** C28, F-F

**Cambio:** la planta no se escribe con colores de Rally Studio. Se define **la estructura de
proporciones** y `gen_palette.py` la rellena con la paleta del reto:

```
60 %  neutro generado     --bg-app / --bg-subtle / --bg-secondary    superficie y filas
30 %  tinta generada      --text-title / --text-main                 estructura, títulos
10 %  acción generada     --color-primary (el acento del proyecto)    solo botón primario y foco
 <1 % semántico fijo      error: rojo WCAG AA (configurable)          criticidad (nunca decorativo)
```

Reglas duras, válidas para cualquier paleta que se genere:
1. **Máximo 2 familias de color** además del neutro.
2. El rojo solo toca error o pérdida; nunca un elemento accionable.
3. El color de acento cubre ≤10 % del alto visible.
4. Todo par texto/fondo ≥4.5:1 (AA) y se imprime el contraste al aprobar.

La única parte fija es **el rojo de criticidad**: no es identidad, es semántica de error, y por eso
vive en `--status-err-*` del producto, no en `brand/`.

**Archivos:** `brand/tokens.css` (cabecera con la estructura 60-30-10 y un comentario por grupo),
`scripts/gen_palette.py` (emite los tres grupos con porcentaje declarado), `DESIGN.md` (una nota:
la planta del proyecto la produce el generador, no este archivo).

**Compuerta G2:** revisión de la pantalla ya generada —
(1) ¿cuántas familias de hex aparecen? ≤4 contando el neutro; (2) ¿el rojo aparece en algo que no
es error ni pérdida? (3) ¿el acento cubre más de 10 % del alto visible? (4) ¿el generador imprimió
el contraste de cada par? Una respuesta mala = no pasa.

---

### W03 · Tipografía con carácter y prueba de lectura en móvil — **P0**

**Cierra:** C27

**Cambio:** la pareja ya existe (Plus Jakarta Sans + JetBrains Mono). Falta lo que la crítica
nombra: elección explícita y prueba. `body` está en **13 px** (`dashboard/style.css`); a 390 px
eso es pequeño. Escala móvil: `--text-md: 14px`, `--text-lg: 17px`, interlineado 1.55 en cuerpo.
Declarar en `DESIGN.md` qué peso usa cada nivel (900 display / 700 títulos / 400 cuerpo) y que
**no hay tercera familia**.

**Archivos:** `dashboard/style.css` (media query) **[frontera]**, `DESIGN.md`, `brand/tokens.css`.

**Compuerta G3:** captura a 390 px y a 1440 px; medir cuerpo ≥14 px en móvil; verificar que
ningún texto corta ni provoca scroll horizontal (`ui-minima.md` ya lo exige).

---

### W04 · Rally Design como pantalla obligatoria del flujo — **P0**

**Cierra:** C7, C10, C19, C32, F-D · **Hueco:** A2.3

**Cambio:**
1. El módulo `site/diseno/` se genera y se enlaza desde la fase de identidad/equipo.
2. La skill `propuesta-identidad` **sirve 3 rutas** (A/B/C) al buzón (`--tab team --slot main`)
   con paleta, tipografía y dirección de logo **derivadas del reto** (§0.1, R4), antes de tocar
   ningún HTML. Las 3 rutas deben ser distintas entre sí; ninguna puede ser la paleta cruda de
   Rally Studio.
3. Regla de secuencia: sin las 3 rutas servidas y una aceptada, no se escribe `site/` ni se
   aplican tokens.

**Archivos:** `scripts/gen_pagina_diseno.py`, `skills/propuesta-identidad/SKILL.md`,
`skills/servir-a-ventana/SKILL.md`.

**Compuerta G4:**
```powershell
Test-Path site\diseno\index.html
Get-ChildItem dashboard\data\applied | Where-Object Name -match 'team|identidad' | Measure-Object
```
Exige: módulo generado **y** ≥1 propuesta aplicada de identidad.

---

### W05 · Sistema de movimiento — **P1**

**Cierra:** C30, F-F · **Hueco:** A2.2

**Cambio:** el movimiento ya está implementado (30 `@keyframes`, 10 bloques
`prefers-reduced-motion`, transiciones de 120-200 ms). Lo que falta es **declararlo** en
`DESIGN.md` para que no se improvise, y cerrar la brecha de duraciones:

| Interacción | Duración | Easing | Propósito |
|---|---|---|---|
| Hover / foco | 120 ms | ease-out | respuesta táctil |
| Cambio de estado (chip, fila) | 160 ms | ease-out | confirmar que algo pasó |
| Entrada de datos (fila nueva) | 200 ms | ease-out | mostrar de dónde vino |
| Pulso de estado vivo (baliza) | 2 s | ease-in-out, loop | indicar que algo está activo |
| Bucle ambiental (hoy 1.9 s / 4 s) | — | — | solo si el elemento significa "en vivo" |
| Prohibido | >300 ms decorativo | — | — |

**Archivos:** `DESIGN.md`, `dashboard/style.css` (ajustar las 3 reglas de 150/180 ms) **[frontera]**,
`dashboard/brand_board.css`.

**Compuerta G5:** toda animación del CSS de UI cae en una fila de la tabla; existe
`prefers-reduced-motion` en todo archivo CSS de UI que tenga `@keyframes`.

```powershell
$css = Get-ChildItem dashboard\*.css
$anim = ($css | Select-String -Pattern '@keyframes' | Measure-Object).Count
$redu = ($css | Select-String -Pattern 'prefers-reduced-motion' | Measure-Object).Count
if ($anim -gt 0 -and $redu -eq 0) { throw 'G5 FALLA: animaciones sin prefers-reduced-motion' } else { "G5 OK ($anim animaciones / $redu bloques reduced)" }
```

---

### W06 · Maqueta antes de código — **P0**

**Cierra:** C29, C32, F-G

**Cambio:** ninguna pantalla se programa sin maqueta aprobada. Para cada pantalla nueva: 3
wireframes (mapa, cola, recursos) en móvil y escritorio, servidos al buzón como propuesta.
Artefacto: `docs/wireframes/<pantalla>-{390,1440}.png`.

**Compuerta G6:** no existe propuesta de wireframe aplicada para esa pestaña ⇒ esa pestaña no se
implementa. Se audita contra `dashboard/data/applied/`.

---

### W07 · Narrativa de marketing del sitio — **P0**

**Cierra:** C1, C8, F-A · **Hueco:** A2.5

**Cambio:** `site/index.html` deja de ser el stub de 627 bytes ("Prototipo pendiente de
generar") y pasa a ser una **plantilla de 6 bloques sin contenido fijo**: el generador la rellena
con el reto y la paleta del proyecto. Ni un hex, ni un nombre, ni una cifra escrita a mano.

Orden fijo de bloques (estructura sí, contenido no):

1. **Hero**: nombre del producto + promesa en una línea (≤12 palabras) + una cifra con fuente.
2. **Problema**: una escena concreta con un dato de `research/claims.json` y su URL.
3. **Cómo funciona**: 3 pasos, uno por línea, sin párrafos.
4. **Métricas**: 3 números que el jurado pueda re-preguntar.
5. **Prueba**: enlace a canvas y presupuesto; unidad de venta explícita ("qué se lleva el
   cliente cuando paga").
6. **CTA**: una acción, un botón.

Reglas heredadas: `ui-minima.md` (cero párrafos), `DESIGN.md` (sin cards, sin emojis, sin morado),
y `R1` de §0.1 (cero hex literal, solo `var(--…)`).

**Archivos:** `site/index.html`, `site/style.css`, `scripts/gen_site.py` (nuevo, o el generador
que ya produzca el sitio).

**Compuerta G7:** los 6 bloques existen; ≥1 cifra con URL; capturas `audit/site-1440.png` y
`audit/site-390.png`; cero párrafos de más de 2 líneas; **cero hex literal en `site/`** (reusa G1b).

---

### W08 · Siete checkpoints humanos obligatorios — **P0**

**Cierra:** C6, C17, C18, C24, F-B · **Hueco:** A2.4

**Cambio:** protocolo escrito y registrado. Un checkpoint vale solo si hay una propuesta servida
y una decisión registrada (aceptada o descartada).

| # | Checkpoint | Pestaña / slot | Bloquea |
|---|---|---|---|
| K1 | Confirmar certamen (24 h / 28 h) | `certamen` / `main` | todo |
| K2 | Elegir reto entre los del comité | `challenges` / `main` | K3 |
| K3 | Elegir 1 de 3 soluciones | `solution` / `main` | pautado, canvas |
| K4 | Aprobar 1 de 3 rutas de marca | `team` / `main` | tokens, sitio |
| K5 | Aprobar pautado (5 secciones) | `pautado` / `problema..prefactibilidad` | guion |
| K6 | Aprobar guion y animatic | `script` / `acto1..4` | voz, render |
| K7 | Aprobar checklist de entrega | `timeline` / `main` | exportar |

**Archivos:** `skills/servir-a-ventana/SKILL.md`, `AGENTS.md` (§Cómo servir a la ventana),
`docs/PLAN_MAESTRO_CORRECCIONES.md` (este protocolo). Lectura automática por el motor:
**[frontera]** si se quiere bloquear de verdad en `dashboard/app.js`.

**Compuerta G8:** al cerrar la sesión, cada una de las 7 filas tiene decisión registrada en
`dashboard/data/applied/` o consta como pendiente declarada. Un checkpoint inventado no cuenta.

---

### W09 · Skills y subagentes declarados por fase — **P1**

**Cierra:** C10, C11, C22, C23, F-C

**Cambio:** bitácora de una línea por fase en `docs/bitacora_fases.md`:

```
F03 solución | skill: proponer-retos + dossier-soluciones | subagente: general (3 opciones) | K3 aceptada
```

Regla: fase sin skill registrada = fase no ejecutada. Toda sesión cierra con ≥2 skills y ≥1
subagente auditor (`auditar-entregable`).

**Compuerta G9:** la bitácora tiene una fila por cada fase tocada, y la última fila cita
`auditar-entregable`.

---

### W10 · 3D con ficha técnica previa, nunca improvisado — **P1**

**Cierra:** C2, C20

**Cambio:** el 3D entra solo si una toma del `script/shotlist.csv` lo pide. Secuencia:
ficha técnica aprobada → dimensiones desde `budget/bom.csv` → modelado por script → auditoría
geométrica → `asset_<shotlist_id>_<descripcion>.glb` en el destino de assets.
Un GLB creado después del reclamo no cuenta como fase (precedente del simulacro).

**Archivos:** `skills/modelo-3d-blender/SKILL.md`, `script/shotlist.csv`.

**Compuerta:** ficha aprobada (propuesta aceptada) + asset nombrado por `shotlist_id` +
`scripts/pre_render_check.py` sin errores.

---

### W11 · Animatic antes de producir el video — **P1**

**Cierra:** C13, C31, C26

**Cambio:** entregar un animatic de 30 s con los frames del shotlist
(`script/refs/demo/S01..S06.png`) antes de voz y render. Solo tras aprobación: TTS, medición y
exportación. El guion respeta ≤120 s y 240-270 palabras (`skills/_comun/guiones.md`).

**Compuerta:** animatic aprobado + `python arsenal.py check-todo` sin errores (duración,
coherencia de cifras, caracteres por campo).

---

### W12 · Cierre con QA y acceso remoto probado — **P0**

**Cierra:** C16, C21, C26, F-E

**Cambio:**
1. Antes de publicar túnel: crear miembro admin con nombre y clave, y **probar el login por la
   URL pública**, no por `127.0.0.1`. Documentar la diferencia entre llave maestra local y
   acceso remoto.
2. Cierre con la skill `auditar-entregable`: navegador real, capturas en `audit/`, consola
   revisada, máximo 10 hallazgos por gravedad y una recomendación única.
3. Prohibido decir "listo" sin G1-G9 en verde.

**Compuerta:** `audit/` con capturas de todas las pestañas (1440 y 390) + `arsenal.py check-todo`
limpio + bitácora W09 cerrada.

---

## 4. Matriz de trazabilidad

| Crítica | Frente | Crítica | Frente |
|---|---|---|---|
| C1 página genérica | W07 | C18 eligió solución | W08 |
| C2 sin 3D | W10 | C19 sin abrir Rally Design | W04 |
| C3 sin planeación | W06, W08 | C20 no propuso 3D | W10 |
| C4 no usó paleta del proyecto | W01, W02 | C21 login roto | W12 |
| C5 nombres inventados | W08 | C22 skills no usadas | W09 |
| C6 sin retroalimentación | W08 | C23 sin subagentes | W09 |
| C7 paleta inventada | W01, W04 | C24 sin preguntas | W08 |
| C8 diseño genérico | W02, W07 | C25 30 min vs 2 h | W08, W09 |
| C9 sin tokens | W01 | C26 sin QA | W12 |
| C10 no usó herramientas | W04, W09 | C27 tipografía genérica | W03 |
| C11 sin testeos internos | W09, W12 | C28 sin planta de color | W01, W02 |
| C12 sin responsive | W03, W07 | C29 sin proceso | W06 |
| C13 sin mapeo visual | W11 | C30 animaciones mínimas | W05 |
| C14 fases saltadas | W08 | C31 sin video propuesto | W11 |
| C15 no buscó soluciones | W08 (K3) | C32 sin maquetado | W04, W06 |
| C16 UI no lanzada | W12 | C33 proyecto de una pasada | W06, W08 |
| C17 sin propuestas | W04, W08 | F-A…F-E | W01-W12 |

**Cobertura: 33 de 33 críticas y 7 de 7 fallos de fondo.**

---

## 5. Orden de ejecución

### Bloque P0 — antes de la siguiente corrida (≈6 h de trabajo)
W01 → W02 → W03 → W04 → W06 → W07 → W08 → W12.

Criterio de salida: una corrida nueva **no puede** repetir C1, C4, C7, C8, C9, C19, C29, C32 ni
los fallos F-A, F-B, F-D.

Nota: la base queda en estado **`pendiente`** al terminar P0. Es lo correcto: una corrida de
prueba con dos `brief.json` distintos debe producir **dos paletas distintas**. Si ambas salen con
el mismo color, W01 no está cerrado.

### Bloque P1 — calidad de entrega (≈4 h)
W05 → W09 → W10 → W11.

Criterio de salida: movimiento con propósito, bitácora completa, 3D y video con aprobación previa.

### Bloque P2 — pulido continuo
Auditorías de `auditar-entregable` por pestaña, capturas en `audit/`, ajustes de densidad.

### Regla de las 24/28 horas
- **75 % del tiempo:** congelar assets, correr G1-G9, exportar.
- **Última hora:** solo QA y checklist. Si G1-G9 no están verdes, no se declara entregado.

---

## 6. Definition of Done

Una corrida está completa solo si:

- [ ] G1 verde: la capa proyecto nace vacía (`_status: pendiente`), cero hex literal en `site/`,
      y los generadores fallan si falta la paleta en vez de inventar un azul.
- [ ] G2 verde: planta 60-30-10 generada desde el reto (no fija) y aplicada por pantalla.
- [ ] G3 verde: cuerpo ≥14 px a 390 px, sin scroll horizontal, capturas tomadas.
- [ ] G4 verde: Rally Design generado y 3 rutas de marca servidas, 1 aceptada. *(enlace listo en
      `renderViewIdentidad`; falta la ruta aceptada: bloqueado por datos del proyecto)*
- [x] G5 verde: política de movimiento declarada en `DESIGN.md` y todo `@keyframes` con su
      `prefers-reduced-motion`. *(30 animaciones / 10 bloques reduced; escalones 120/160/200 ms
      normalizados en `dashboard/style.css`)*
- [ ] G6 verde: wireframes móvil y escritorio aprobados antes de implementar.
- [ ] G7 verde: `site/` con los 6 bloques de marketing y ≥1 cifra con URL.
- [ ] G8 verde: K1-K7 con decisión registrada.
- [ ] G9 verde: bitácora con ≥2 skills y ≥1 subagente auditor.
- [ ] 3D (si aplica) con ficha aprobada y asset nombrado por `shotlist_id`.
- [ ] Animatic aprobado antes de voz y render.
- [ ] Login remoto probado por URL pública antes de entregar enlace.
- [ ] `python arsenal.py check-todo` sin errores.
- [ ] `audit/` con capturas de todas las pestañas (1440 y 390) y consola limpia.

### Qué NO hacer
- No crear un segundo `DESIGN.md` ni una segunda paleta: `DESIGN.md` es capa producto (fija); la
  paleta del proyecto la produce `gen_palette.py` y nace vacía.
- No dejar un color, tipografía o nombre fijo en la capa proyecto (§0.1, R1-R5).
- No tocar el motor (`dashboard/app.js`, `scripts/rally_service.py`) sin autorización: es frontera.
- No inventar criterios de rúbrica que no estén en `.agents/rules/`.
- No declarar cerrada una compuerta sin pegar la salida del comando.

---

## 7. Verificación de este plan (ejecutable hoy)

```powershell
cd C:\Users\--X\Downloads\rallysistem

# A2.1 — la capa proyecto nace con paleta heredada y falla en silencio
Get-Content brand\palette.json                                                    # primary #1d45b9
(Select-String -Path site\*.css,site\*.html -Pattern '#[0-9a-fA-F]{6}' | Measure-Object).Count # 21
Select-String -Path scripts\gen_budget.py -Pattern 'azul neutro'                  # :57 default silencioso

# A2.2 — el movimiento existe y no está declarado en DESIGN.md
(Select-String -Path dashboard\*.css -Pattern '@keyframes' | Measure-Object).Count           # 30
(Select-String -Path dashboard\*.css -Pattern 'prefers-reduced-motion' | Measure-Object).Count # 10
Select-String -Path DESIGN.md -Pattern 'easing|duracion|duration'                            # 0

# A2.3 — Rally Design existe como script, no como pantalla del flujo
Test-Path scripts\gen_pagina_diseno.py                                                      # True
(Select-String -Path dashboard\*.js -Pattern 'Rally Design' -SimpleMatch | Measure-Object).Count # 0

# A2.4 — no hay registro de checkpoints
Test-Path docs\bitacora_fases.md                                                            # False

# A2.5 — el sitio es un stub
(Get-Item site\index.html).Length                                                          # 627
Get-Content site\index.html | Select-String 'pendiente de generar'
```

Cada resultado de arriba corresponde a un hueco de §2 y a un frente de §3. Cuando los comandos
cambien de resultado, el plan estará ejecutado.
