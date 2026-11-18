---
name: contexto-rally
description: Carga el contexto del proyecto antes de trabajar. Lee brief.json, el índice del corpus y el estado vivo de la ventana, y decide qué documentos abrir. Úsala al empezar una sesión, antes de producir contenido o cuando falte un dato.
---

# San Google de los Ganadores — Contexto del rally

## Cuándo usarla

- Al empezar una sesión en este repositorio.
- Antes de producir cualquier contenido (pautado, retos, guion, presupuesto).
- Cuando falte un dato y no sepas si ya está en el corpus.

## Procedimiento

1. Lee `brief.json` completo. Es el estado del proyecto: certamen, equipo, reto, horas.
2. Lee `knowledge/INDICE.md`. Es el mapa del corpus: una línea por fuente con "cuándo sí"
   y "cuándo no".
3. Si el servidor está arriba, pide el estado real de la ventana:
   `curl -s http://localhost:8000/api/state`. Si responde `{"state": null}`, el usuario
   todavía no ha escrito nada: ese es un hueco que hay que preguntar.
4. **Di en voz alta qué vas a leer y por qué**, una línea por archivo. El usuario debe poder
   corregirte antes de que gastes contexto.
5. Abre solo esos archivos, y por rangos si son grandes.
6. Si el tema está en el corpus pero no sabes en qué archivo vive, pregúntale al cerebro en
   vez de abrirlo entero:
   `graphify query "<tema, con las palabras del usuario>" --graph brain/corpus/graphify-out/graph.json`
   Es local y no cuesta API: devuelve los nodos que tratan el tema y su archivo de origen.
7. Al abrir un documento, mira su bloque `## Relacionado` (al final). Son los vecinos que el
   corpus declara con una razón; el dato que falta suele estar en uno de ellos.
8. Si un dato no está en ninguna fuente, anótalo como hueco. No lo rellenes con lo que
   "suena bien".

## Reglas

- `brief.json` manda sobre cualquier suposición tuya.
- `research/claims.json` es la única lista de estadísticas citables. Si una cifra no está
  ahí, no la uses como hecho: márcala como estimación o pídela.
- El corpus tiene dos certámenes. Antes de leer nada del otro, confirma `rally_type`.
- Si `brief.json` trae datos de ejemplo (`hidro-vigia`, `mentes-pinoleras`), son residuo de
  una plantilla: no los presentes como si fueran del usuario.

## Modo del certamen

Confirmar `rally_type` en `brief.json` antes de leer cualquier fuente del otro certamen.

- **Nacional (24 h):** municipio real de Nicaragua, eje del Plan Nacional de Lucha contra la
  Pobreza 2022–2026, presupuesto en córdobas (C$) con tasa del BCN declarada en `brief.json`,
  siglas locales (CNU, MINJUVE, TELCOR, INATEC, MEFCCA), Ciudades Creativas si aplica, ODS
  animados con la paleta del proyecto.
- **Latam (28 h):** el municipio es laboratorio piloto (no el único destino), solución modular,
  paramétrica y replicable en toda América Latina, presupuesto en USD (sin C$ ni tasas locales),
  sin siglas gubernamentales locales, cierre del video: "piloto en [ciudad], replicable en toda
  América Latina".

## Generación de prompts para llevar el contexto a otra IA

Cuando el usuario quiera exportar el estado del proyecto a otra IA
(OpenAI, Claude, Gemini, OpenCode, Antigravity…), genera el prompt con esta
estructura:

```
Rol: asistente de proyecto de rally de innovación.
Contexto: Certamen <rally_type> (<hours_total> h), categoría <category>,
  reto <challenge_title>, equipo <team_name>, universidad <university>,
  ciudad <city>.
Entrada: `brief.json`, `knowledge/INDICE.md`, `research/claims.json`.
Tarea: Resumir el estado del proyecto y los próximos pasos, respetando las
  reglas del certamen activo.
Restricciones:
  - Sin inventar datos. Cada estadística debe existir en
    `research/claims.json`.
  - No hardcodees el nombre del proyecto; léelo de `brief.json`.
  - Sin emojis, sin degradados estilo IA, sin glassmorphism.
  - Idioma: español.
Formato de salida: JSON con claves rally_type, hours_total, category,
  challenge_title, project_name, team_name, university, city,
  description_one_line, proximos_pasos, huecos_pendientes.
Idioma: español.
```

## Cómo sugerir un título o nombre de proyecto o producto
Compartido: `skills/_comun/nombres.md`. Léelo antes de aplicar esta sección.

## Cómo enseñar visualmente

- Una sola distancia focal por secuencia con rótulos.
- Contraste garantizado: texto claro sobre fondo oscuro, o sombra de texto
  desplazada. Nunca texto gris sobre fondo iluminado.
- Elementos gráficos se exportan como PNG 2048×2048 con fondo transparente.
- Sin emojis como íconos en la web demo.

## Cómo redactar guiones cuidando la pronunciación y el orden de palabras
Compartido: `skills/_comun/guiones.md`. Léelo antes de aplicar esta sección.

## Cómo crear modelos 3D (referencia)
Compartido: `skills/_comun/modelos-3d.md`. Léelo antes de aplicar esta sección.

## Cómo sugerir elementos gráficos

- Thumbnail y piezas de portada: prohibido resolver con cuadrados, rectángulos,
  círculos o triángulos. Usa foto real, vector complejo o un modelo de Blender.
- Sin emojis como íconos en la web demo.
- Sin cards genéricas, sin morado (#7c3aed o similar), sin fuentes fuera de
  `brand/tokens.css`.

## Punteros

- Estado del proyecto: `brief.json`
- Mapa del corpus: `knowledge/INDICE.md`
- Cerebro consultable: `graphify query "<tema>" --graph brain/corpus/graphify-out/graph.json`
- Estadísticas citables: `research/claims.json`
- Reglas del evento: `AGENTS.md` y `.agents/rules/`
