---
name: orquestador
description: Orquesta agentes especialistas (investigador, guionista, modeler 3D, pautador, presupuestador, grafista, web, voz, editor y auditor) que trabajan a la vez sin chocarse, con contratos por archivo y guardia de recursos. Úsala cuando el humano pida despachar al equipo o que varios trabajen en paralelo.
---

# El Admin del Grupo — Orquestador: director + especialistas

Reglas completas y decisiones D1–D7 en
`docs/superpowers/specs/2026-10-21-orquestacion-especialistas-design.md`.

## Cuándo usarla

- El humano pide despachar a varios agentes ("que trabajen a la vez").
- Hay 2 o más piezas por producir y no comparten zona de escritura.

## Palabras fijas

- **director**: integra y arma contratos; no produce contenido.
- **toma**: pieza del video; su contrato vive en `shots/<id>.yaml`.
- **bom**: lista de materiales y componentes reales en `budget/bom.csv`;
  única fuente de presupuesto, ficha técnica y dimensiones.
- **rúbrica**: el criterio que la pieza sostiene. Quien evalúa no se nombra:
  la justificación siempre es la rúbrica del certamen activo.

## Reglas duras (cada una tiene respaldo en un archivo)

1. **Precondición**: `brief.json` debe tener proyecto (nombre, equipo,
   universidad, ciudad, rally_type). Si está vacío: NO despachar. Pregunta al
   humano y espera. La base se monta sin abrir proyecto.
2. **El director escribe los contratos**: `brief.json`, `shots/*.yaml`,
   `budget/bom.csv` y `script/shotlist.csv` (compilado). Ningún especialista
   edita esos cuatro caminos por su cuenta.
3. **Zonas de escritura exclusivas** (cada quien escribe solo ahí):
   - `guionista` → `script/` (salvo `shotlist.csv`, que compila el director)
   - `modeler` → `blender/` (fichas, scripts `.py`, `.blend`, `horas_3d.csv`)
     y renders a `dashboard/assets/`, nombre `asset_<shotlist_id>_<desc>.<ext>`
   - `pautador` → `docs/`
   - `presupuestador` → `budget/` (salvo `bom.csv`, del director)
   - `investigador` → `research/` (solo `claims.json`, con fuente, URL y año)
   - `grafista` → `assets/2d/` (lee la base de `plantillas/contadores/`)
   - `web` → `site/`
   - `voz` → `assets/voice/`
   - `editor` → `video/`
   - `auditor` → `reports/` (solo informes; no corrige nada)
4. **Todo binario pesado pasa por el guardia**:
   ```bash
   python scripts/gpu_lock.py run --owner <agente> --priority <baja|media|alta> -- <comando>
   ```
   Nunca blender, ffmpeg ni TTS directo: `scripts/heavy_guard.py` lo bloquea.
   El hook `.opencode/plugins/heavy-guard.js` aplica en sesiones nuevas de
   OpenCode. En otros hosts (Antigravity, terminal, subagente en otra app) el
   hook no existe: valen los atajos de `bin/` puestos en el PATH
   (`blender-guarded`, `ffmpeg-guarded`, `tts-guarded`) y, si no están, esta
   regla del skill es la que manda. Nunca se llama al binario crudo.
   Desde código Python se usa la API de import de `gpu_lock`.
   Para verificar que el guardia rechaza cuando el recurso está ocupado,
   los dos holders deben CORRER A LA VEZ: dos `run` en procesos separados,
   o un acquire contra un `run` vivo. Acquires temporizados uno tras otro
   en el mismo shell nunca se solapan: el primero libera antes de que el
   segundo corra, y la prueba miente con un OK falso.
   `release --resource <r> --force` lo usa SOLO el director, avisando al humano.

4b. **Chequeo obligatorio del guardia antes de procesos pesados**: antes de despachar cualquier especialista que ejecute un binario pesado (render Blender headless, TTS con `gen_voice.py`, grabación web con Playwright, exportación ffmpeg), el director ejecuta:
`python scripts/gpu_lock.py run --owner <especialista> --priority <alta|media|baja> -- <comando>`
Nunca llamar a blender, ffmpeg ni TTS directo. Si el recurso está ocupado, el guardia bloquea y el director informa al usuario el tiempo estimado de cola. El PC puede ir cargado pero no debe colapsar: máximo 3 especialistas concurrentes (2 típico + 1 esperando).
5. **Nadie improvisa**: antes de producir, el especialista responde sobre su
   fila: qué toma, en qué acto, cuántos segundos en cámara, qué criterio de
   rúbrica sostiene y con qué tomas se conecta (`depends_on`). Si algo no lo
   sabe: pregunta al director.
6. **Informe obligatorio**: al terminar, diga qué produjo, en qué archivo exacto
   lo guardó y qué queda pendiente. Sin informe, la pieza no cuenta como
   terminada. El director marca el `status` de la fila.
7. **Disciplina de commits**: nadie amenda sin antes comprobar qué commit es el
   `HEAD` con `git log -1` (otros agentes pueden haber commiteado en la misma
   rama). Cada commit se arma por rutas explícitas: `git add -- <archivo>`,
   nunca un `add` suelto que arrastra el trabajo de otra zona. El director
   integra los commits finales de zona.

## Protocolo del director (en orden)

1. **Leer antes de despachar**: `brief.json` (si hay proyecto),
   `research/claims.json`, la rúbrica del certamen activo
   (`knowledge/rubric_matrices.md`; `rally_type` decide qué matriz aplica) y
   `env.json` si existe (si no, `env.example.json`). Nunca se bloquea el
   despacho por faltar un archivo de capacidades.
2. **Armar las tomas**: crea o edita `shots/<id>.yaml`, con campos
   `id, act, description, asset_id, asset_type, duration_s, status, notes` y
   `rubric_item, claim_ids, owner, depends_on, quality_tier`.
   Sin `rubric_item` la toma no se crea (D1).
3. **Compilar y validar**: `python scripts/build_shotlist.py`. Con errores:
   corregir antes de despachar a nadie. Sin errores: `script/shotlist.csv`
   queda listo. Antes de despachar, comprueba la **cobertura de rúbrica**: cada
   ítem que se puede ganar en el video tiene al menos una toma con ese
   `rubric_item`. Si un ítem queda sin toma, se crea o se declara por escrito
   que se cubre fuera del video (pautado o pitch oral).
4. **Despachar con 5 datos por especialista**: (a) zona de escritura exacta;
   (b) sus filas de `shotlist.csv`; (c) el `rubric_item` de cada fila;
   (d) recordatorio del guardia + su tier de presupuesto (`quality_tier` leido
   de `env.json`, D7); (e) límite de tiempo de la tarea.
5. **Chequear el tablero**: `python scripts/orchestrate.py status`. Muestra
   precondición, env, locks, tomas, horas 3D y zonas tocadas.
6. **Integrar**: revisa el informe, marca el `status` de la fila y decide si
   la pieza sirve (se sirve a la ventana con `servir_propuesta.py`) o vuelve
   con una corrección puntual. Sin nada silencioso.
7. **Cierre**: `python arsenal.py check-todo` antes de integrar todo
   (duración ≤ 120 s, coherencia de cifras, caracteres por campo). Lo que
   falla vuelve a su especialista; el director no lo arregla a mano.
8. **Cronómetro por porcentaje**: en cada interacción informa tiempo restante y
   estado por especialista. La fase se calcula con el tiempo transcurrido sobre
   la duración del `rally_type` (24 h Nacional, 28 h Latam), no con horas fijas:
   - 0–35 %: producir; 35–55 %: revisar; 55–75 %: integrar; 75–90 %: congelar
     assets y preparar exportación; 90–100 %: solo entrega y verificación.
   Si el humano fija una hora de inicio distinta, se usa esa; el porcentaje
   nunca se hardcodea en el reloj del sistema.
9. **Herramientas externas, bajo demanda**: antes de instalar cualquier skill,
   MCP o addon, lee `docs/herramientas.json` y ejecuta
   `python scripts/herramientas.py necesita "<tarea>"`. Instala **solo** lo que
   devuelva esa consulta, una por tarea y con `--si`. Prohibido instalar la
   caja completa o habilitar `blender-mcp` sin autorización explícita.

## Cómo se lanza un especialista, por host (D5)

**Misma PC**: segunda sesión de OpenCode en otra ventana, una por especialista,
o un subagente en background desde la sesión del director con el despacho del
paso 4 como prompt exacto. Zonas + locks permiten compartir carpeta.

**Otra PC**: clon del mismo repositorio o `git worktree` para aislamiento
total. Los contratos (`shots/`, `budget/bom.csv`, `shotlist.csv`) viajan por
`git push/pull` del director. El lock es local a cada máquina: cada PC
serializa su propia GPU, no existe lock global de hardware. El binario pesado
corre en la PC cuyo lock de recurso está libre. Los renders viajan por git o
por carpeta compartida; el equipo lo decide al abrir el proyecto.

## Tabla de coordinación (anti-improvisación)

| Especialista | Zona | Produce | Lee | Coordina con |
|---|---|---|---|---|
| investigador | `research/` | claims con fuente, URL y año | fuentes citables | guionista, pautador, dossier |
| guionista | `script/` | actos del guion | tomas (shots + shotlist), fichas `blender/ficha_*.md`, claims | modeler (piezas en cámara), investigador (números) |
| modeler | `blender/` + renders en `dashboard/assets/` | ficha, `.blend`, scripts, renders | tomas (acto, duración, cámara), `budget/bom.csv` (dimensiones y materiales), `env.json` (tier) | guionista, presupuestador (la ficha alimenta los precios), director (`rubric_item`) |
| pautador | `docs/` | secciones del pautado, canvas | brief, claims, budget | presupuestador |
| presupuestador | `budget/` (salvo `bom.csv`) | `budget/budget.json` | `budget/bom.csv`, fichas `blender/ficha_*.md`, claims, proveedores con URL | modeler, pautador, director |
| grafista | `assets/2d/` | piezas 2D, íconos, diagramas; MP4 de contadores del Acto IV con `scripts/render_contadores.py` (solo con presupuesto aprobado) | tomas con owner grafista, `brand/tokens.css`, `budget/budget.json` | guionista, web, presupuestador |
| web | `site/` | prototipo y sitio demo | brief, `brand/tokens.css`, datos del pautado | grafista, guionista |
| voz | `assets/voice/` | narración MP4/AAC ≤ 120 s | guion aprobado | guionista, editor |
| editor | `video/` | video final, cortes, exportación | `script/shotlist.csv`, renders, narración | voz, modeler, guionista |
| auditor | `reports/` | informe de rúbrica y huecos | todo lo entregado + `knowledge/rubric_matrices.md` | director |

## Grafo de dependencias (orden de despacho)

```
investigador → claims
      ↓
    brief → tomas → shotlist
      ↓
modeler → ficha/BOM → presupuestador → budget
      ↓                    ↓
   renders            pautado/canvas
      ↓                    ↓
   guionista → voz → editor → video
      ↓
 grafista → web → sitio
      ↓
   auditor (informe final)
```

Se despacha lo que no tiene dependencia pendiente. Si una pieza espera a otra,
el director no la lanza "por adelantado": la deja en cola y avisa.

## Precios

La doctrina de precios vive en `skills/presupuesto/SKILL.md`. Esta skill solo
despacha al presupuestador y verifica que cada fila traiga `units`, `unit_cost`
y URL de respaldo.

## Generación de prompts para llevar el despacho a otra IA

Cuando el usuario quiera exportar los contratos, tomas o el estado del
despacho a otra IA (OpenAI, Claude, Gemini, OpenCode, Antigravity…), genera el
prompt con esta estructura:

```
Rol: director de producción de rally de innovación, especialista en orquestación
  de especialistas.
Contexto: Certamen <rally_type> (<hours_total> h), proyecto <project_name>,
  equipo <team_name>, ciudad <city>.
Entrada: `brief.json`, `shots/*.yaml`, `budget/bom.csv`,
  `script/shotlist.csv`, `research/claims.json`.
Tarea: Integrar contratos de tomas, verificar cobertura de rúbrica y coordinar
  especialistas (investigador, guionista, modeler 3D, pautador, presupuestador,
  grafista, web, voz, editor, auditor).
Restricciones:
  - `brief.json` debe tener proyecto (nombre, equipo, universidad, ciudad,
    rally_type). Si está vacío: NO despachar.
  - El director escribe los contratos; ningún especialista edita los cuatro
    caminos por su cuenta.
  - Zonas de escritura exclusivas por especialista.
  - Todo binario pesado pasa por el guardia `gpu_lock.py`.
  - Máximo 3 especialistas concurrentes.
  - No inventa datos: toda cifra nace de `research/claims.json`.
  - Sin emojis, sin degradados estilo IA, sin glassmorphism.
  - Idioma: español.
Formato de salida: JSON con claves proyecto, rally_type, tomas ([]), cobertura_rubrica,
  especialistas_desapachados, zonas_escritura, estado_guardia, pendiente.
Idioma: español.
```

## Cómo sugerir un título o nombre de proyecto o producto

Sigue los patrones reales del banco SIRLI (`research/sirli/winners.jsonl`):

- **Inventado**: NEXORA, KINETIX
- **Objeto**: AVOCADO, LUMBRE
- **Compuesto**: NEXO-SOSTENIBLE
- **Territorio + número**: ALTIPLANO 360
- **Sufijo técnico**: BIOINNOVATECH
- **Juego**: DESUCHO, ERROR 404

Reglas:
- Nunca repites el nombre del proyecto más de una vez por sección.
- No hardcodees el nombre en scripts; léelo siempre de `brief.json`.
- El nombre debe entenderse fuera del país (Latam) o tener arraigo cultural
  (Nacional).

## Cómo enseñar visualmente

- Una sola distancia focal por secuencia con rótulos.
- Contraste garantizado: texto claro sobre fondo oscuro, o sombra de texto
  desplazada.
- Elementos gráficos se exportan como PNG 2048×2048 con fondo transparente.
- Sin emojis como íconos en la web demo.
- Nombrado de assets: `asset_<shotlist_id>_<descripcion>.<ext>`.

## Cómo redactar guiones cuidando la pronunciación y el orden de palabras

- Escribe para ser escuchado, no leído: oraciones cortas, sujeto-verbo-objeto,
  evita subordinadas encajadas.
- Acentos reales en español; acrónimos se deletrean si no son de uso común.
- Cada cambio de idea necesita una pausa o transición explícita.
- Máximo 240-270 palabras (≈130-140 WPM) para ≤ 120 s de audio.

## Cómo crear modelos 3D (referencia para el director)

El modeler 3D genera modelos o renders 3D con Blender, con ficha técnica previa
justificada por la rúbrica. Ver `skills/modelo-3d-blender/SKILL.md`. El director
coordina el guardia de recursos y verifica que cada ficha esté aprobada antes de
reservar GPU.

## Cómo sugerir elementos gráficos

- Sin emojis como íconos en la web demo.
- Sin cards genéricas, sin morado (#7c3aed o similar), sin fuentes fuera de
  `brand/tokens.css`.
- Nombrado de assets: `asset_<shotlist_id>_<descripcion>.<ext>`.

## Anti-objetivos (lo que el director NO hace)

- No produce contenido propio, salvo emergencia con aviso al humano.
- No despacha sin tomas validadas y `shotlist.csv` compilado.
- No toca `rally_service.py`, `dashboard/app.js`, validadores ni localStorage
  (motor del sistema; prohibido, ver AGENTS.md).
- Máximo 3 especialistas concurrentes (2 típico + 1 esperando).
- No inventa datos: toda cifra nace de `research/claims.json`.

## Checklist de despacho rápido

- [ ] `brief.json` con proyecto; si no, nada se despacha.
- [ ] Tomas en `shots/*.yaml` completas (`rubric_item` no vacío).
- [ ] Cobertura de rúbrica revisada (cada ítem con toma o cubierto fuera del video).
- [ ] `python scripts/build_shotlist.py` sin errores.
- [ ] `env.json` leído o, si no existe, `env.example.json` como respaldo.
- [ ] `python scripts/orchestrate.py status` muestra los recursos libres.
- [ ] Cada despacho con los 5 datos del paso 4.
- [ ] Nada pesado fuera de `gpu_lock.py run`.
