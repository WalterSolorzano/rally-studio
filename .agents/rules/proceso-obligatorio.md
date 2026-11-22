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
9. **Prosa con huellas de IA.** Todo texto que lea el usuario (pautado, dossier, guion,
   presupuesto, interfaz, respuesta del agente) pasa por `chequear_slop_ia()` de
   `scripts/check_anti_generico.py`. La fuente única es `SLOP_IA_PATTERNS`; si esta regla y la
   lista discrepan, manda la lista. Se prohíben, sin excepción: adjetivos de relleno
   («fundamental», «clave», «robusto», «transformador»…), metáforas gastadas («ecosistema»,
   «paradigma», «sinergia»), verbos corporativos («profundizar», «aprovechar», «potenciar»,
   «empoderar»), conectores huecos («asimismo», «cabe destacar», «en este sentido»),
   muletillas («es importante destacar», «juega un papel crucial», «claro, aquí tienes»),
   paralelismo negativo («no es solo X, es Y»), cierre ceremonioso («en conclusión»), falso
   equilibrio («por un lado… por otro lado»), emoji como viñeta, comillas curvas, raya larga
   como remate, y artefactos de copiar y pegar (`utm_source=chatgpt`, `turn0search`).
   Un renglón con dato, cifra o nombre propio reemplaza al adjetivo; si no hay dato, se
   escribe el hecho sin valoración.

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

### 5.0 Canal entre roles

Un rol **no escribe su entregable antes de leer el contrato del rol anterior**. El canal es una
carpeta por equipo: `canal/`, con un archivo por rol y orden:

```
canal/01-pautador.json
canal/02-presupuestador.json
canal/03-guionista.json
```

Cada contrato tiene, como mínimo:

```json
{
  "rol": "presupuestador",
  "orden": 2,
  "lee_de": ["canal/01-pautador.json"],
  "hechos": { "costo_piloto": "C$ 24300", "familias": 2 },
  "preguntas_abiertas": ["cuánto paga cada familia"],
  "preguntas_contestadas": ["nombre del barrio → Barrio El Centro"],
  "entregable": "budget/budget.json"
}
```

Reglas que un auditor puede verificar sin preguntar nada:

1. **Sin `lee_de` no hay entregable.** Un archivo de rol sin `lee_de` se considera no entregado.
2. **El número no se inventa dos veces.** Toda cifra que un rol usa y ya existe en un contrato
   anterior se copia, no se recalcula. Si cambia, se anota el motivo en `hechos`.
3. **Las preguntas no se quedan huérfanas.** Toda `preguntas_abiertas` del contrato anterior
   aparece contestada en el siguiente (`preguntas_contestadas`) o escalada al mentor.
4. **El mentor lee el canal, no la conversación.** Su traza cuenta intervenciones: si un equipo
   necesita más de tres por fase, la skill no guía sola y se corrige la skill, no el equipo.
5. **Un rol no lee el entregable final del otro para reescribirlo.** Lee el contrato.
6. **Partida cerrada o desglose, nunca los dos.** Si una fila cubre el sistema completo instalado
   y probado, las filas de sus componentes no suman aparte: el total sería doble y el cuadre solo
   cerraría porque las filas del desglose valen cero. Más de la mitad de las filas en cero también
   se rechaza: lo que falta es pregunta abierta, no fila vacía.
7. **Armar no es operar.** Que un socio arme o instale el sistema no autoriza decir que lo opera
   ni que lo administra. Quien opera y quién da mantenimiento se declara en `hechos.operador`; si
   no se sabe, `[FALTA: responsable]`.
8. **Base de cálculo declarada.** El presupuesto dice si es **por unidad**, **por lote** (con su
   tamaño) o **por piloto**. Una sola base por tabla. Sin base, la cifra no se compara con nada.
9. **Un corte no borra el trabajo.** Si el encargo se interrumpe (red, tiempo, error), el contrato
   se guarda igual con `"estado": "parcial"`, `conservado` (lo que quedó hecho y se puede usar) y
   `falta` (lo pendiente). El rol que reanuda declara `hechos.recuperado_de` con el archivo del
   contrato cortado y sigue desde ahí, no desde cero. Un contrato sin `estado` se lee como
   `completo`; no se marca parcial lo que está terminado.
10. **Un rol, un archivo, un número.** Dos roles nunca comparten `NN-rol.json`: el segundo escribe
    encima y el primero desaparece sin dejar rastro. Si dos personas tocan la misma área, van dos
    contratos con números distintos y el mismo `lee_de`.
11. **El modo del rally no se recuerda, se copia.** El primer contrato declara `hechos.modo`
    (`nacional` | `latam`) tomado de `rally_type` en `brief.json`, y `hechos.horas_total` cuando
    fije el reloj. Ningún contrato posterior lo contradice. Un equipo que trabaja un nacional de
    24 h mientras el brief dice Latam de 28 h no tiene un error de redacción: cambia el jurado, la
    moneda y el largo de la cola, y lo descubre el jurado, no el equipo.
12. **Los contratos se escriben con `scripts/canal.py`.** `escribir(carpeta, nombre, datos)` valida
    el nombre, escribe a temporal, confirma JSON válido y deja la versión anterior en `.bak` antes
    de reemplazar. Nunca se sobrescribe un contrato con un write directo. `recuperar()` devuelve la
    versión anterior cuando hace falta.

Prueba de que el canal funciona: el rol siguiente cita en su contrato una cifra que **solo**
estaba en el contrato anterior. Si la cita sin haber leído, la prueba falla por coincidencia y
se repite con un dato que el rol siguiente no pudo adivinar.

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

## 5.1 Protocolo de pausa: qué se confirma y qué se pregunta

El agente **no encadena dos etapas**. Cerrar una etapa no autoriza abrir la siguiente: se
detiene y pide permiso. Tampoco resuelve por su cuenta nada que sea una decisión del equipo.

**Se pregunta siempre, antes de actuar:**

1. **Paso de etapa.** «La etapa 06 está cerrada con la compuerta G2 en verde. ¿Abrimos la 07
   (presupuesto) o la 03 (solución) necesita otra vuelta?»
2. **Diseño.** Paleta (A/B/C), tipografía, logotipo, layout, tono visual, iconografía y
   cualquier cambio de identidad. Se ofrecen opciones con su criterio y se espera elección.
3. **Contenido del proyecto.** Nombre, claim, cifra, fuente, municipio, público, ODS,
   categoría: nunca se inventa ni se completa con un ejemplo.
4. **Dinero.** Proveedor, precio, unidad y enlace de respaldo de cada fila del presupuesto.
5. **Guion y voz.** Tono, narrador, cierre, duración y qué se ve en cada toma.
6. **Publicación y terceros.** URL pública, YouTube, credenciales de acceso, cualquier
   servicio externo que consuma cuota o cree una cuenta.
7. **Borrado o sobrescritura.** Archivos, carpetas, contenido ya aprobado, commits.

**Formato de la pausa:** una sola pregunta por vez, con las opciones numeradas y el criterio
de cada una en una línea. Nada de «¿qué prefieres?» abierto ni de tres preguntas juntas.
Si la respuesta no llega, el estado se queda como está y se dice qué falta; no se avanza
con un supuesto.

**Lo que no se pregunta** (para no gastar la paciencia del equipo): formato de archivo,
orden de campos dentro de una plantilla, nombres internos de scripts, redacción de un log.

## 6. Qué hacer si falta un dato

Se pregunta, de a una. Nunca se rellena con un ejemplo ni con un supuesto. Un `brief.json`
vacío es un estado válido: significa que el equipo aún no definió su proyecto.
