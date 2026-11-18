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
Compartido: `skills/_comun/nombres.md`. Léelo antes de aplicar esta sección.

## Cómo enseñar visualmente

- Una sola distancia focal por secuencia con rótulos.
- Contraste garantizado: texto claro sobre fondo oscuro, o sombra de texto
  desplazada.
- Elementos gráficos se exportan como PNG 2048×2048 con fondo transparente.
- Sin emojis como íconos en la web demo.
- Nombrado de assets: `asset_<shotlist_id>_<descripcion>.<ext>`.

## Cómo redactar guiones cuidando la pronunciación y el orden de palabras
Compartido: `skills/_comun/guiones.md`. Léelo antes de aplicar esta sección.

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
