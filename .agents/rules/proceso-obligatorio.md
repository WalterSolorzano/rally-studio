---
trigger: always_on
description: Aplica a toda corrida del rally: orden de las 13 fases, presupuestos de tiempo, estándares medibles y prohibiciones de diseño y de redacción.
---

# Proceso obligatorio: paso a paso, estándares y prohibiciones

Esta regla manda sobre cualquier prisa del agente. Un rally dura 24 h (Nacional) o 28 h
(Latam). Si una corrida termina en minutos, **no se ejecutó el proceso**: se saltaron fases.

## 0. Ley de tiempo

- Ninguna fase se cierra sin su artefacto y su compuerta. No existe "lo dejo listo después".
- Cada fase tiene un presupuesto de tiempo máximo. Agotarlo sin artefacto = se reporta el
  bloqueo, no se inventa el resultado.

| Fase | Pestaña | Presupuesto | Artefacto obligatorio | Compuerta |
|---|---|---|---|---|
| 00 | `certamen` | 10 min | `rally_type` y horas en `brief.json` | G0 |
| 01 | `team` | 30 min | nombre, universidad, ciudad, marca | G0 |
| 02 | `challenges` | 20 min | `challenge_id` + `challenge_title` | G0 |
| 03 | `solution` | 60 min | 3 opciones servidas, 1 aprobada | G4 |
| 04 | `impact` | 20 min | ODS + eje del plan (solo Nacional) | G2 |
| 05 | `multi_ai` | 15 min | prompts de despacho por pieza | — |
| 06 | `pautado` | 60 min | 5 secciones dentro de límites | G2 |
| 07 | `budget` | 45 min | filas con `units`, `unit_cost`, URL | G2 |
| 08 | `resources` | 40 min | assets nombrados por `shotlist_id` | — |
| 09 | `canvas` | 30 min | modelo coherente con presupuesto | — |
| 10 | `script` | 45 min | guion PAS-V ≤120 s + animatic | G6 |
| 11 | `webdemo` | 90 min | sitio con 6 bloques, 390 y 1440 | G3, G7 |
| 12 | `timeline` | 30 min | checklist verificado + QA | G8, G9 |

## 1. Paso a paso de la identidad (nada se escribe antes del paso 5)

La capa proyecto nace **vacía**: `brand/palette.json` está en `_status: pendiente`. El sitio
se ve sin color hasta que la identidad exista. Eso es correcto.

1. **Leer el reto.** `challenge_title`, sector, territorio y público salen de `brief.json`.
   Sin esto no se propone ni un color.
2. **Tres rutas, no una.** `scripts/gen_palette.py` propone A/B/C con contraste WCAG de cada
   par texto/fondo. Las tres deben ser distintas; ninguna puede ser la paleta de Rally Studio.
3. **Servir al buzón.** Las tres van a `--tab team --slot main` como propuesta. El humano
   ve, compara y elige. Una sola se acepta.
4. **Aprobar.** La elegida se escribe con `_status: "aprobada"` y `_generado_por`. Queda
   registrada en `dashboard/data/applied/`.
5. **Recién ahora** se aplican tokens: `brand/tokens.css`, `site/style.css`, documentos.
   Antes del paso 4, escribir un hex en cualquier entregable está prohibido.
6. **Verificar.** `python scripts/verificar_identidad.py` (o la compuerta G1 del plan) debe
   imprimir OK.

## 1.5 Paso a paso de la página (no se genera "de una")

El sitio tampoco se escribe a mano ni de golpe. Orden fijo, cada paso con su compuerta:

1. **Reto y datos.** `brief.json` con `project_name`, `challenge_description`, `city`, `sector`
   y al menos 3 cifras con URL en `research/claims.json`. Sin datos con fuente no hay página.
2. **Identidad aprobada.** `brand/palette.json` con `_status: "aprobada"`. Si está pendiente,
   el generador **se detiene**; no cae a un color por defecto.
3. **Generar.** `python scripts/gen_site.py` escribe `site/index.html` con los 6 bloques
   (hero + promesa, problema con cifra y fuente, cómo funciona en 2–3 pasos reales,
   3 métricas, prueba con tabla de costos y documentos, un solo CTA). Cero hex, cero
   `style=` inline, cero emojis.
4. **Probar.** `python scripts/probar_responsive.py` abre 390 / 768 / 1440 px, falla con
   scroll horizontal, cuerpo < 14 px o consola con errores, y deja `audit/site-{390,768,1440}.png`.
5. **Auditar.** Subagente auditor distinto del constructor revisa las capturas contra §2 y §3.
6. **Servir.** La página va al buzón como propuesta; el humano acepta o descarta.

## 2. Estándares de calidad medibles

Un entregable no está listo por verse bien. Debe cumplir, y se demuestra con comando:

- **Contraste** ≥4.5:1 en todo par texto/fondo (AA). Se imprime el número al aprobar la paleta.
- **Plantas de color**: máximo 2 familias además del neutro; el acento cubre ≤10 % del alto
  visible; el rojo solo señala error o pérdida.
- **Tipografía**: cuerpo ≥14 px en móvil, ≤3 familias por pantalla, una escala declarada.
- **Responsive**: probado a 390, 768 y 1440 px. Cero scroll horizontal. Capturas en `audit/`.
- **Carga cognitiva**: una idea por pantalla, ≤7 elementos visibles, ≤1 acción primaria.
  «Cómo funciona» lista **2 a 3 pasos reales** del brief: ni uno solo, ni relleno hasta tres.
- **Interfaz mínima** (`.agents/rules/ui-minima.md`): cero párrafos, cero datos técnicos,
  icono antes que palabra, `title` y `aria-label` en todo icono.
- **Accesibilidad**: `alt` en toda imagen, foco visible, navegable con teclado.

### 2.1 Estándares del generador (lo que el simulacro enseñó)

El primer simulacro generó una página que pasaba responsive pero no aguantaba lectura.
Estas reglas las aplica `scripts/gen_site.py` y son obligatorias en cualquier página nueva:

1. **El hero vende la solución, no repite el problema.** Si `hero-promesa` y
   `problema-texto` comparten la primera frase, el generador está mal, no el brief.
   Sin `solution` no hay hero: se detiene.
2. **Nada de texto mutilado.** Se corta en coma, punto y coma o fin de frase; nunca por
   conteo de palabras a media idea ("…que entrega agua segura").
3. **Cero marcadores internos en el HTML publicado.** Prohibido "pendiente de declarar",
   "Unidad de venta pendiente", rutas `../docs/…` que no existen al publicar. Si el dato
   falta, el bloque se omite.
4. **Ninguna cifra repetida en dos bloques.** La cifra vive en Métricas y su fuente en
   Problema; el hero no lleva cifra.
5. **Un solo CTA primario.** El secundario solo existe si hay una acción real (correo
   declarado); si no, la sección se elimina en vez de quedar muerta.
6. **La prueba se lee dentro de la página.** Tabla de costos renderizada en la sección;
   los enlaces solo apuntan a documentos con contenido (>200 B y no stub), copiados a
   `site/prueba/` para que sobrevivan a la publicación de la carpeta `site/`.
7. **Una fuente falsa no se enlaza.** Si la URL es `example.org/.com/.net` o `localhost`,
   la fuente queda como texto. Un enlace roto destruye más credibilidad que la cita sola.
8. **Todo paso listado es un paso del brief.** Prohibidos los genéricos de relleno
   ("Diagnóstico en el territorio", "Réplica documentada"). Si no hay 2 pasos reales,
   el generador se detiene y pide `pasos` o `solution`.
9. **Tildes reales** en todo texto fijo del generador y del brief que se publique.
10. **La compuerta se prueba en negativo.** Además de pasar, se inyecta un fallo
    (`div` de 900 px, hex en `site/`, paleta sin aprobar) y se comprueba que **falla**.

### 2.2 Gramática heredada del producto (`DESIGN.md`, solo lectura)

Rally Studio lleva años afinando su workbench y las IAs que trabajan en él producen buen
diseño por esa gramática, no por suerte. `DESIGN.md` y `dashboard/style.css` **no se editan**:
se copian sus reglas a la capa proyecto. Lo que se hereda:

1. **Doctrina sin cards.** La jerarquía la dan tipografía, divisores `1px solid
   var(--border-light)` y espacio negativo. Cero cajas flotantes, cero sombras difusas.
2. **Acento ≤10 %.** El color de marca solo en acciones primarias, foco y marcadores
   activos. Datos y paneles quedan neutros.
3. **Rigor tabular.** Toda cifra, precio, porcentaje o cronómetro en `--font-mono` con
   `font-variant-numeric: tabular-nums`.
4. **Ritmo de 4 px.** Solo `4 · 8 · 12 · 16 · 24 · 32 · 48`. Nada de 7 px ni 13 px de aire.
5. **Radios funcionales.** `--radius-sm` para botones e inputs; `--radius-lg` (18 px) es el
   techo. El radio no encierra páginas.
6. **Profundidad plana.** Sin sombra en reposo; como máximo una sombra sutil en topbar fija
   y otra en modal crítico. Nada más.
7. **Respuesta táctil de 120 ms** en hover y foco. Ni 300 ms ni animaciones decorativas.
8. **Píldora táctica.** Estado en `JetBrains Mono`, fondo `--bg-subtle`, borde hairline y
   micro-dot de 6 px. Prohibida la píldora de juguete (celeste saturado, mayúsculas gritonas,
   radio 9999 px).
9. **Foco visible real.** `outline: 2px solid var(--border-focus)` con `outline-offset: 2px`
   sobre el color propio del proyecto, no el cobalto ajeno.
10. **Cero estilos inline.** Todo estado y componente sale de una clase del sistema.

La identidad cromática **no** se hereda (regla 3 de §3); lo que se hereda es la disciplina
con la que se aplica la identidad propia.

## 3. Prohibiciones (baneadas, sin excepción)

1. **Textos que un icono resuelve.** Si el mensaje es "guardar", "cerrar", "atrás", "subir":
   icono con `title`/`aria-label`, no una frase.
2. **Emojis** en interfaz, código, entregables o nombres de archivo.
3. **Colores ajenos.** Ningún hex literal en la capa proyecto. Ni el cobalto de Rally Studio.
4. **Comentarios innecesarios.** Nada de `# aquí generamos la lista` ni bloques decorativos.
   Solo se comenta lo que no se puede leer del código (decisión, límite, fuente de un dato).
5. **Alta carga cognitiva.** Sin muros de texto, sin tablas de 10 columnas, sin menús anidados.
6. **Cards genéricas, glassmorphism, degradados morado/magenta, radios >18 px, sombras difusas.**
7. **Datos inventados.** Toda cifra sale de `research/claims.json` con URL, o se marca `[SIMULADO]`.
8. **Escribir en `site/`, `script/` o entregables sin maqueta aprobada.**

## 4. Subagentes obligatorios

| Cuándo | Subagente | Qué entrega |
|---|---|---|
| Dirección visual de una pantalla nueva | skill `impeccable` (y `frontend-design` si está instalada) | crítica de jerarquía, espaciado, color, motion |
| Antes de publicar o entregar | skill `auditar-entregable` + subagente `auditor` | hallazgos por gravedad con captura PNG |
| Sitio o demo web | subagente de responsive | 390/768/1440, cero scroll horizontal |

Reglas:

- El **auditor es siempre un subagente distinto** del que construyó. Nadie se aprueba solo.
- Un subagente por fase de interfaz, mínimo. La salida se pega en `docs/bitacora_fases.md`.
- Quién construye y quién audita cada etapa **no se decide sobre la marcha**: está en
  `python scripts/verificar_fases.py --mapa`. Ese mapa es la orden de despliegue.
- Si la skill no está instalada, se dice y se pide permiso para instalarla. No se simula.

Estado verificado de las skills de diseño (17/11/2026, `Get-ChildItem` sobre `skills/`,
`.agents/skills/`, `.opencode/skills/` y `%USERPROFILE%\.agents\skills`):

- **`impeccable`** — instalada y en uso (auditorías de la página generada).
- **`frontend-design`** — **no instalada** en ninguna de esas rutas. Mientras no se instale,
  la dirección visual de una pantalla nueva la cubre `impeccable` (o `ui-ux-pro-max` /
  `design-system` como respaldo); queda prohibido citarla como si se hubiera cargado.

## 5. Conexión entre fases

Cada fase **lee** el artefacto de la anterior y **escribe** en el buzón. Nada se escribe
directo en el entregable final.

```
certamen → team → challenges → solution → impact → pautado → budget
        → resources → canvas → script → webdemo → timeline
```

- Sin paleta aprobada no se maqueta. Sin maqueta aprobada no se programa. Sin animatic
  aprobado no se produce video.
- Cada transición deja una línea en `docs/bitacora_fases.md`:
  `fase | artefacto | compuerta | decisión humana | quién construyó | quién auditó`.
- **La compuerta corre antes de avanzar:** `python scripts/verificar_fases.py`. Falla si una
  etapa tiene artefacto sin que su dependencia lo tenga (etapa saltada), si la etapa cerró
  sin línea en la bitácora, si la línea está incompleta o si quien auditó es quien construyó.
  Al final imprime la **siguiente fase** y **las preguntas** que hay que hacerle al humano.
  `--mapa` muestra quién construye y quién audita cada etapa; `--fase 06` abre una sola.
- **Se firma con quien el mapa declara, no con cualquiera.** Si la fase 11 dice
  `construye: publicar-sitio | audita: impeccable + responsive`, la línea con
  `audito | profe` —o con `impeccable` a secas, sin el responsive— no cierra la fase:
  el gate compara las firmas contra el mapa y nombra las esperadas en el error.
- **La auditoría deja constancia.** Una firma no prueba que alguien revisó. Cada fase
  auditada por un agente exige `audit/NN-auditor.md` (más de 200 B, sin más del 40 % de
  `_pendiente_`); si falta o es plantilla, la fase no cierra. En la fase 00 audita el
  humano: su constancia es la columna `decisión`.
- **La compuerta no se declara, se demuestra.** También falla si la `decisión` no es
  `aceptada`/`descartada`, si el campo `compuerta` no cita un script registrado
  (`validate_brief.py`, `validate_budget.py`, `validate_pautado.py`, `verificar_identidad.py`,
  `probar_responsive.py`) que exista en `scripts/`, si la compuerta citada **no es la de esa
  etapa** (`verificar_fases.py --fase 06` dice cuáles admite) o si esa compuerta, **corrida en
  ese momento**, sale con código distinto de 0. "Revisado a ojo" o un nombre inventado no
  cierran una fase; un `validate_budget.py` sin correr tampoco.
- **Nadie avanza sin que el humano confirme que entró.** El acceso es un paso con
  dueño: un solo agente entrega la credencial, dicta el paso a paso de entrada y
  **espera** la confirmación del humano («ya entré»). Hasta esa confirmación no se
  despacha ninguna otra fase: si la credencial no abre, el problema es la credencial,
  no el resto del trabajo. Un agente por tarea; el hilo principal no carga las trece.
- **Un artefacto de relleno no cuenta: `_pendiente_` en más del 40 % de sus líneas, un HTML sin
  `hero-promesa`, un `assets/` sin ningún `asset_*` o un archivo de menos de 200 B **no** son
  artefacto. Así el stub del generador no desbloquea la etapa siguiente.

## 6. Qué hacer si falta un dato

Se pregunta, de a una. Nunca se rellena con un ejemplo ni con un supuesto. Un `brief.json`
vacío es un estado válido: significa que el equipo aún no definió su proyecto.
