# Glosario de instancias: qué significa "nacional"

Tres cosas distintas llevan la palabra "nacional" en este proyecto. Confundirlas
mete datos falsos en el pautado y en el pitch, y el jurado lo nota.

## 1. Rally Latinoamericano de Innovación — instancia internacional

Podio continental por edición (2017 en adelante). Categorías: Innovación y
Impacto Social. Jurado académico internacional, prohibido evaluar al propio país.
Costos en dólares. Archivo del corpus: `ganadores_latam_internacional.md`
(58 filas en `research/sirli/winners.jsonl` con `collection=internacional`).

## 2. Rally Latinoamericano de Innovación — instancia nacional por país

La misma competencia, en su ronda nacional: cada país clasifica sus primeros,
segundos y terceros puestos. Es el archivo `ganadores_latam_instancia_nacional.md`
(363 filas, `collection=nacional`, 41 de ellas de Nicaragua), que es un índice:
cada edición vive en su propio archivo `ganadores_latam_instancia_nacional_<año>.md`
(2017–2026). Sigue siendo el Rally Latinoamericano: mismos desafíos, mismo formato
de 28 horas.

## 3. Rally Nacional Nicaragua Innova

Certamen **distinto**, no una fase del latinoamericano. Nació en 2023, dura 24
horas y lo organiza la Comisión Nacional de Economía Creativa con MIFIC, MEFCCA,
MINJUVE, INATEC, INTA y el CNU. Categorías: Tecnológica, Social y Procesos u
Organizacional. Jurado institucional nicaragüense. Premia 6 equipos (9 desde
2026). Fuente: `informe_investigacion.md` §3.1–3.2.

## Reglas para no equivocarse

1. Nunca escribas "ganadores nacionales" sin decir de cuál de los tres hablas.
   Di "podio internacional del Latinoamericano", "ronda nacional del
   Latinoamericano en Nicaragua" o "Rally Nacional Nicaragua Innova".
2. Un caso del Rally Nacional Nicaragua Innova no se cita como antecedente del
   Latinoamericano, ni al revés. Son certámenes separados.
3. Un ganador de la instancia nacional de otro país no es un caso nicaragüense:
   sirve como referencia regional, no como prueba local.
4. El campo `rally` de `casos_ganadores.md` vale `latam` o `nacional` según la
   fuente de cada caso. `nacional` **no** significa automáticamente Nicaragua
   Innova: verifica el caso antes de citarlo.
5. Si el dato no está en estos archivos, no existe: pregunta, no inventes.

<!-- relacionado:inicio -->

## Relacionado

- [ganadores_latam_internacional.md](ganadores_latam_internacional.md) — instancia internacional.
- [ganadores_latam_instancia_nacional.md](ganadores_latam_instancia_nacional.md) — instancia nacional del Rally Latam.
- [casos_ganadores.md](casos_ganadores.md) — casos del certamen nacional Nicaragua Innova.
