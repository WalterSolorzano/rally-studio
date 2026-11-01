---
trigger: model_decision
description: Aplica al escribir o revisar el pautado oficial y el guion del video de 120 segundos.
---

# Pautado y guion

Reglas canónicas: `knowledge/rubric_matrices.md`, secciones 3 y 4. Este archivo no las
repite; solo dice cómo se usan.

## Pautado: cinco secciones

`problema`, `solucion`, `impacto`, `innovacion`, `prefactibilidad`.

- Mínimo 150 caracteres por sección; topes de Latam en `rubric_matrices.md` §4.
- No repitas el nombre del proyecto más de una vez por sección.
- No repitas el mismo dato en dos secciones.
- Cada estadística debe existir en `research/claims.json`, con fuente, URL, año y fecha
  de acceso. Si no está, se pide o se marca `[SIMULADO]`.

## Guion: 4 actos, ≤ 120 segundos

El reparto por actos y su fracción de tiempo están en `rubric_matrices.md` §3. Lo único
duro es la **duración del audio**: se mide con `ffprobe` y no puede pasar de 120 s.

- El conteo de palabras es una guía de escritura, nunca una regla de descalificación.
- Cierre Latam: "piloto en [ciudad], replicable en toda América Latina".
- Cada plano del `script/shotlist.csv` lleva `asset_id`; los assets se nombran
  `asset_<shotlist_id>_<descripcion>.<ext>`.
- Las cifras del documento y del video deben coincidir exactamente.

## Antes de dar por bueno un entregable

- `validate_pautado.py` sin errores.
- Audio generado ≤ 120 s y 4 actos presentes.
- Cifras del guion == cifras del presupuesto.
