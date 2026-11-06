# Plan: corrección de contenido del dossier — patrones criticados + re-correr skill

Fecha: 2026-01-05. Sandbox: `dossier_latam_2026/`.
Origen: crítica directa del usuario al PDF `Dossier_Latam_2026.pdf` (commit `51d4204`).
Skills de proceso: `writing-plans` (este plan), luego `executing-plans` → `subagent-driven-development`.

## Especificación (verbatim del usuario, criterios de aceptación)

- "aplica jerarquia visual en las insignias que apliquen colores segun que son".
- "reto 1 opcion 1, el parrafo es inmenso y no me vende la idea, debo leerlo y sigo sin
  entender de una, y el como funciona tampoco ayuda".
- "reto 2 opcion 1, telefonos? si yo tuviera un telefono que seguro su precio no baja de
  2500 cordobas... lo venderia, asi que el analisis sistemico fallo ahi, ademas es un horror
  configurar o ver lo de bateria etc, no sabia que los telefonos tienen sensores de humedad,
  la idea no convence".
- "reto 2 opcion 2, mismo problema de celulares, la idea 1 y 2 es muy parecida".
- "reto 3 los parrafos cuesta entenderlos pero entiendo que es un refugio de polinizadores
  esa es valida muy buena" (solo redacción).
- "reto 3 opcion 2, no entendi esa senal, pense que era sembrar automatizado... no tiene
  sentido contar cosas eso no soluciona mucho".
- Mojibake visible: `ProtecciÃ³n`, `agrÃ­` (challenges/reportes).
- "reto 4 me preocupo porque habla de tetrapak 2025, ni idea que es eso... si es un ganador
  viejo explicalo, la gente no conoce las cosas".
- "reto 4, no reuses su idea del todo, guiate de ella pero trabajala independiente...
  desarrolla la idea completa dejando de lado ellos y al final menciona que se parece".
- "reto 4 opcion 2 no entendi, no parece un producto".
- "reto ultimo, ambas opciones son ilogicas, la gente ya hace eso, los rescatistas no agiliza
  nada, mapear la zona es obvio... buscan algo fuera de lo que se hace".
- Barra de calidad (NO hardcodear): dispositivo ESP32 con peticiones Bluetooth/WiFi, todos
  llevan celular = identificador, mapea zonas, se manda a los entes, tecnología nueva barata
  y masiva, usa cosas que todos tienen. "esa capacidad de ideas quiero".
- "revisa estos errores de redaccion... haz un plan de correccion completa desde las skills y
  al finalizar vuelves a correr la skill en el entregu de prueba, recuerda banear las cosas
  que te dije".

## Diagnóstico (estado actual, medido)

| Reto | Hallazgo |
|---|---|
| 01 | op1 `que_es` 200 palabras, no vende, `como` genérico (desmontar/acoplar/probar/entregar). op2 aceptable pero similar. |
| 02 | ambas opciones usan "celular en desuso": premisa inválida (nadie regala celular) + configuración hardware inviable + asunción de sensor de humedad sin fuente + opciones gemelas. Análisis sistémico falló. |
| 03 | op1 válida ("muy buena") pero párrafos difíciles + name-dropping "caso Ignis Code" en `que_es`. op2 no se entendió: "contar cosas" no soluciona. |
| 04 | op1 construida sobre "método Tetra Pak 2025" sin explicar qué es ni quién ganó; reutiliza su idea sin desarrollar la propia. op2 no parece producto. |
| 05-08 | "fallas parecidas" (no leídos por el usuario): probablemente mismos patrones — `que_es` largo, name-dropping, señal que no cierra. |
| 09 | ambas ilógicas/estándar: reto pide agilizar rescate, opción1 = "tablero de prioridades" (la gente ya hace), opción2 = "mapear la zona" (obvio). Falta "algo fuera de lo que se hace". |
| global | Mojibake en challenges/fichas (`ProtecciÃ³n`, `agrÃ­`). Insignias sin jerarquía visual ni color por tipo. |

## Decisiones de diseño (las "cosas que dijiste" → baneos)

Añadir a `archivado_2026-11-05/baneadas.json` (patrones, no ideas):

1. `celular_desecho_como_insumo` — usar celular propio/ajeno en desuso como componente:
   nadie lo dona (valor ≥ C$2500), configurar batería/hardware es inviable, asumir
   sensores sin fuente = inventar.
2. `idea_ajena_reutilizada_sin_desarrollo` — pegar la idea de un ganador (p. ej. "Tetra
   Pak 2025") como método propio sin explicarla ni desarrollar idea propia primero.
3. `name_dropping_sin_explicar` — mención de ganador/caso/premio en `que_es`/`claim` sin
   decir año, equipo, qué hizo; prohibido dentro de la idea; solo se permite como
   `analogia` con explicación.
4. `senal_que_no_resuelve` — "contar cosas"/"mapear lo obvio"/"tablero de prioridades"
   cuando el reto pide agilizar o hacer algo que nadie hace.
5. `que_es_inmenso` — `que_es` >150 palabras o que no se entienda de una lectura.
6. `opciones_gemelas` — opción1 y opción2 con mismo objeto/sistema/base.
7. `no_producto` — opción que no se pueda mostrar como objeto/servicio accionable
   ("no parece un producto").

Regla positiva (barra, forma — no contenido): mecanismo nuevo-barato-masivo que usa algo
que todos ya tienen (p. ej. celular ajeno solo como identificador pasivo Bluetooth, nunca
como hardware donado). Queda en skill como criterio, con el ejemplo marcado como referencia.

## Tareas (TDD-ish, commits frecuentes)

### T1 — Mojibake (bug primero, tests)
1. Diagnosticar byte-level: `challenges.json`, `fichas*.json`, `dossier_content.json`,
   reportes de compuerta. ¿`Ã` real en archivo o solo consola (PowerShell)?
2. Si real: reparar en origen (decode latin1→utf8 donde aplique) + test
   `tests/test_check_anti_generico.py` que falle si algún JSON de entrada del pipeline
   contiene `Ã`/`Â` en palabras UTF-8 (p. ej. `ProtecciÃ³n`).
3. Verificar: `python -m pytest tests/test_check_anti_generico.py -q` → rojo antes, verde
   después.

### T2 — Skill: reglas nuevas (`skills/dossier-soluciones/SKILL.md`)
Añadir sección "Reglas de redacción y venta" con:
- `que_es`: 80-150 palabras; primera frase = qué es en términos físicos/accionables;
  debe "vender" (leer una vez y entender de una).
- `como`: 4 pasos accionables, no genéricos ("desmontar/acoplar/probar/entregar" cuenta
  como genérico si no dice qué ni para quién).
- `senal`: debe resolver el reto, no solo medir/contar/mapear lo obvio.
- Insumos: validar con análisis sistémico que el insumo es real (nadie dona celular;
  no asumir sensores sin fuente).
- Opciones: objeto Y mecanismo distintos entre opción1/2; cada opción = producto/servicio
  mostrable.
- Idea propia primero: desarrollar la idea completa sin nombre del ganador; mencionar
  similitud al final, solo en `analogia` con año+equipo+qué hizo.
- Barra de calidad: mecanismo nuevo-barato-masivo con algo que todos tienen (forma, no
  hardcodear ESP32).
- Mojibake: ningún JSON de entrada con `Ã`/`Â`.
Test `test_skill_is_short` debe seguir pasando (skill corto).

### T3 — Compuerta: reglas nuevas (`scripts/check_anti_generico.py` + tests)
Añadir checks automáticos donde sea medible:
- `que_es` ≤150 palabras (y ≥80) → ya medible, añadir.
- Prohibidas nuevas en texto: `celular en desuso`, `teléfono en desuso`, `Tetra Pak 2025`
  sin contexto… (ajustar: `Tetra Pak` solo permitido en campo `analogia`).
- Mojibake `Ã`/`Â` en cualquier campo.
- Opción1 vs opción2: similitud de objeto (overlap de nouns/primera frase) → alerta.
Tests: `tests/test_check_anti_generico.py` nuevos casos (rojo → verde).

### T4 — Baneadas (`dossier_latam_2026/archivado_2026-11-05/baneadas.json`)
Añadir las 7 entradas de "Decisiones de diseño" con `motivo` citando la crítica.

### T5 — Regeneración de contenido (9 retos × 2 opciones)
Reescribir `dossier_latam_2026/_skill_run/dossier_content.json` con las reglas nuevas:
- 01: acortar `que_es` op1 a ≤150, `como` específico; mantener mecanismo.
- 02: descartar ambos "celular en desuso"; rediseñar opciones con insumo real y distinto.
- 03: op1 solo aliviar redacción + quitar name-dropping de `que_es`; op2: cambiar a algo
  que resuelva (no "contar").
- 04: op1 desarrollar idea propia, Tetra Pak solo en `analogia` con explicación
  (año/equipo); op2 convertir en producto claro.
- 05-08: aplicar mismos filtros (leer y corregir).
- 09: descartar ambas; diseñar opciones "fuera de lo que se hace" (barra ESP32 como forma).
- Regenerar ODS/insignias/analogías igual que antes (sellos disponibles, verified, analogías
  explicadas).
Opcional: delegar redacción a subagente (modelo `opencode-go/mimo-v2.6-flash`) con la skill.

### T6 — Insignias: jerarquía visual + color por tipo
- `docs/assets/dossier.css`: clases `.insignia--<tipo>` con color propio (marco/ODS/
  verified/etc. según `knowledge/insignias.json`), badge sólido, tamaño/tinta por
  jerarquía (título > tipo > detalle).
- `scripts/gen_dossier.py`: mapear tipo→clase en render de insignias (línea ~112-115).
- Test `tests/test_gen_dossier.py`:HTML contiene clase por tipo (rojo→verde).

### T7 — Regenerar entrega
1. Compuerta: `python scripts/check_anti_generico.py` → exit 0.
2. `python scripts/gen_dossier.py --json .../dossier_content.json --pdf
   dossier_latam_2026/Dossier_Latam_2026.pdf` → 27 págs.
3. Verificar PDF: sin prohibidas, sin mojibake, insignias con color, 2 opciones/reto.
4. Append log `dossier_latam_2026/analisis_log.txt` (FASE F).
5. Commit.

### T8 — Re-correr skill en entorno de prueba (cierre del usuario)
Correr la skill `dossier-soluciones` de punta a punta en `dossier_latam_2026/` (pipeline
completo: fichas → compuerta → expansión → PDF) hasta PASS con las reglas nuevas.
Reportar PASS/RECHAZADAS.

## Fora de alcance
- Motor `scripts/soluciones_motor.py`, dashboard, máquina de estado — no tocar.
- `gen_soluciones_pdf.py` sigue baneado para entrega.
- Video (siguiente etapa después de este plan).

## Cadena de ejecución
1. `executing-plans` (inline) o `subagent-driven-development` (por tareas independientes:
   T1-T4 paralelas por archivo; T5 depende de T2; T6 paralela; T7-T8 secuenciales).
2. Modelo de subagentes: `opencode-go/mimo-v2.6-flash` (autorizado).
3. Cada tarea → commit pequeño.
