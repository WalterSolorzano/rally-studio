---
trigger: model_decision
description: Aplica al redactar cualquier contenido y hay que decidir entre el certamen Nacional (Nicaragua Innova, 24 h) y el Latinoamericano (28 h).
---

# Modos de rally: Nacional vs. Latam

El modo manda `brief.json` → `rally_type`. Nunca asumas: si está vacío, pregunta.

## Nacional (Nicaragua Innova, 24 h)

- Categorías: Tecnológica / Social / Procesos u Organizacional.
- Jurado: CNU, MINJUVE, TELCOR, INATEC, MEFCCA.
- **Ancla a un municipio real** de Nicaragua. Nombra la comunidad, el microparque o la zona
  productiva; nada de "Nicaragua" en abstracto.
- Conecta con el **Plan Nacional de Lucha contra la Pobreza y para el Desarrollo Humano
  2022–2026** (PNDH) y con programas concretos (Ciudades Creativas, Soberanía Alimentaria,
  Restitución de Derechos / Ley 763).
- Cuantifica el impacto: familias, cooperativas, empleos directos.
- Presupuesto en **C$ y USD**, con tasa del BCN cuando aplique.
- Tono: emoción patriótica, identidad cultural, cercanía con el jurado interinstitucional.

## Latam (Rally Latinoamericano, 28 h)

- Categorías: Innovación / Impacto Social.
- Jurado: académicos internacionales. **No asumas contexto nicaragüense**.
- El municipio es el **laboratorio piloto**, no el único destino. La solución es **modular,
  paramétrica y replicable** en toda América Latina.
- Costos siempre en **USD**, con lógica de escala (B2B/B2G) y economía circular.
- Evita siglas gubernamentales locales que un evaluador extranjero no entienda.
- Cierre del video: "piloto en [ciudad], replicable en toda América Latina".

## Errores que cuestan puntos

- Mezclar modos: presupuesto en córdobas para jurado internacional, o siglas del PNDH en Latam.
- Escribir "Nicaragua" como único mercado en Latam.
- Escribir una solución genérica en Nacional sin municipio ni actor local.

## Ganadores: tres cosas distintas, nunca "nacionales" a secas

| Cómo se llama | Qué es | Dónde vive |
|---|---|---|
| Podio internacional del Rally Latinoamericano | Ganadores continentales por edición (2017–2026) | `ganadores_latam_internacional.md` |
| Ronda nacional del Rally Latinoamericano | Clasificación por país de la **misma** competencia (41 filas de Nicaragua); un archivo por año | `ganadores_latam_instancia_nacional.md` (+ `…_<año>.md`) |
| Rally Nacional Nicaragua Innova | Certamen **distinto** (2023+, 24 h, categorías Tecnológica/Social/Procesos u Organizacional) | `informe_investigacion.md` §3 |

- Escribe siempre cuál de los tres es: "ganadores nacionales" a secas es la frase
  que provoca el error.
- No cites un caso de Nicaragua Innova como antecedente del Latinoamericano, ni
  al revés.
- Un ganador de la ronda nacional de otro país es referencia regional, no prueba
  local nicaragüense.
- Detalle completo: `brain/corpus/glosario_instancias.md`.
