---
name: auditar-entregable
description: Revisa un entregable contra la rúbrica del certamen, las bases del evento y el propósito del grupo, y devuelve hallazgos ordenados por gravedad sin reescribir nada. Úsala antes de dar algo por terminado o cuando el usuario pida una revisión.
---

# La Tóxica que Revisa el Chat — Auditar un entregable

**Veto de redacción:** el texto pasa por `skills/_comun/patrones-ia.md`. Palabra o frase de esa lista se cambia por el dato o se borra; `scripts/verificar_identidad.py` (G4) lo comprueba en `state.json`.

## Navegador obligatorio (browser MCP)

La auditoría visual se hace **con el navegador, no de memoria**.

1. Abre el entregable en el navegador MCP y recorre las vistas que exige la
   auditoría (desktop y mobile, todas las pestañas del dashboard).
2. Cada hallazgo se sostiene con **captura PNG en `audit/`** (móvil, tabs,
   estados vacíos). Sin captura, el hallazgo no se reporta.
3. Verifica también la consola del navegador: los errores JS son hallazgo.
4. Si el navegador MCP no está conectado, detente y pide instalar la extensión y
   abrir la sesión.
5. `handoff` solo para login/2FA; nunca resuelvas captchas.

## Cuándo usarla

- Antes de cerrar una etapa o de exportar.
- El usuario pregunta "¿esto está bien?", "¿qué me falta?", "¿pasa la rúbrica?".
- Hay que decidir entre dos versiones.

## Procedimiento

1. Fija el objeto de la auditoría: qué archivo o sección, y a qué certamen pertenece.
2. Carga los criterios que aplican:
   - `.agents/rules/rubricas-y-puntajes.md` (pesos y qué mira cada criterio)
   - `.agents/rules/modos-rally.md` (exigencias propias de Nacional o Latam)
   - `.agents/rules/pautado-y-guion.md` si es pautado o guion
3. Revisa en este orden, porque es el orden en que un jurado pierde puntos:
   1. **Incumplimiento de bases** (descalifica o resta fuerte): límites de caracteres,
      duración del video, coherencia de cifras, datos inventados.
   2. **Criterios de mayor peso** del certamen activo.
   3. **Criterios secundarios**.
   4. **Forma**: marca, paleta, tipografías, naming de assets.
4. Devuelve **hallazgos**, no reescrituras:
   - `Gravedad` — `crítico` (pierde puntos o descalifica) / `importante` / `menor`
   - `Ubicación` — sección o línea
   - `Qué pasa` — una frase
   - `Qué hacer` — una frase accionable
5. Ordena por gravedad. Máximo 10 hallazgos: si hay más, agrupa los menores.
6. Cierra con **una** recomendación: lo único que cambiarías si solo hubiera tiempo para una
   cosa.

## Reglas

- Antes de dar un entregable como listo para SIRLI, ejecutar obligatoriamente:
  `python arsenal.py check-todo` (valida duración del video ≤ 120 s, coherencia de cifras entre
  guion y presupuesto, y caracteres por campo del pautado). Lo que falle vuelve a su
  especialista; el director no lo arregla a mano. Sin este check sin errores, no se sube a SIRLI.
- No inventes criterios. Si la rúbrica no dice algo, no lo presentes como requisito.
- No confundas "no me gusta" con "resta puntos".
- Si un dato no tiene respaldo, es un hallazgo crítico, no un detalle de estilo.
- No edites el entregable en esta skill: auditar y arreglar son pasos distintos, y el arreglo
  va por `servir-a-ventana` como propuesta.

## Generación de prompts para llevar la auditoría a otra IA

Cuando el usuario quiera exportar el informe de auditoría a otra IA
(OpenAI, Claude, Gemini, OpenCode, Antigravity…), genera el prompt con esta
estructura:

```
Rol: auditor de entregables para rally de innovación, especialista en rúbricas.
Contexto: Objeto <archivo_o_seccion>, certamen <rally_type>.
Entrada: `.agents/rules/rubricas-y-puntajes.md`, `.agents/rules/modos-rally.md`,
  `.agents/rules/pautado-y-guion.md`, `research/claims.json`.
Tarea: Revisar el entregable contra la rúbrica y devolver hallazgos ordenados
  por gravedad sin reescribir nada.
Restricciones:
  - Orden de revisión: 1) Incumplimiento de bases (límites de caracteres,
    duración del video, coherencia de cifras, datos inventados); 2) Criterios de
    mayor peso; 3) Criterios secundarios; 4) Forma (marca, paleta, tipografías,
    naming de assets).
  - Devuelve hallazgos, no reescrituras: Gravedad, Ubicación, Qué pasa, Qué hacer.
  - Máximo 10 hallazgos; agrupa los menores si hay más.
  - Antes de dar como listo para SIRLI: ejecutar `python arsenal.py check-todo`.
  - No inventes criterios. Si la rúbrica no dice algo, no lo presentes como
    requisito.
  - Sin emojis, sin degradados estilo IA, sin glassmorphism.
  - Idioma: español.
Formato de salida: JSON con claves objeto, rally_type, hallazgos ([]), cada uno
  con gravedad, ubicacion, que_pasa, que_hacer; recomendacion_unica.
Idioma: español.
```

## Cómo sugerir un título o nombre de proyecto o producto
Compartido: `skills/_comun/nombres.md`. Léelo antes de aplicar esta sección.

## Cómo enseñar visualmente

- Contraste garantizado: texto claro sobre fondo oscuro, o sombra de texto
  desplazada.
- Elementos gráficos se exportan como PNG 2048×2048 con fondo transparente.
- Sin emojis como íconos en la web demo.
- Forma: marca, paleta, tipografías, naming de assets (`asset_<shotlist_id>_<descripcion>.<ext>`).

## Cómo redactar guiones cuidando la pronunciación y el orden de palabras

- Escribe para ser escuchado, no leído: oraciones cortas, sujeto-verbo-objeto,
  evita subordinadas encajadas.
- Acentos reales en español; acrónimos se deletrean si no son de uso común.
- Cada cambio de idea necesita una pausa o transición explícita.
- Máximo 240-270 palabras (≈130-140 WPM) para ≤ 120 s de audio.
- Coherencia total: los números del guion coinciden exactamente con
  `budget/budget.json`.

## Cómo crear modelos 3D (referencia)
Compartido: `skills/_comun/modelos-3d.md`. Léelo antes de aplicar esta sección.

## Cómo sugerir elementos gráficos
Compartido: `skills/_comun/elementos-graficos.md`. Léelo antes de aplicar esta sección.

## Punteros

- Pesos y criterios: `.agents/rules/rubricas-y-puntajes.md`
- Reglas de cada certamen: `.agents/rules/modos-rally.md`
- Pautado y guion: `.agents/rules/pautado-y-guion.md`
- Cifras citables: `research/claims.json`
