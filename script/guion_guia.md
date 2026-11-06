# Guía práctica: construir un buen guion de pitch SIRLI

Referencia: `brain/corpus/ganadores_latam.md` (Anatomía del Video Ganador, 4 micro-actos),
`script/script.md` (esqueleto vacío), `research/sirli/analisis/hipotesis.csv` (42 hipótesis,
3 a favor: delegación, nombre del proyecto en descripción, duración ≤110 s).

Límite: **120 segundos medidos en el audio**. 240–270 palabras de referencia de escritura.
**CERO logos ni nombres del proyecto en los primeros 20 segundos.**

---

## Los 4 micro-actos (segundo a segundo)

| Micro-acto | Tiempo | Función | Criterio de rúbrica activado | Ejemplo real de ganador |
|---|---|---|---|---|
| I | 0:00–0:20 | Gancho y dolor cuantificado | Impacto social + Calidad de presentación | STEM Synergy: "Según la FAO, para 2050 la producción mundial deberá aumentar un 60%" |
| II | 0:20–1:00 | Revelación técnica y prototipo 3D | Innovación + Viabilidad técnica | Techriders: modelo 3D de micropresa con válvulas y sensores LoRaWAN |
| III | 1:00–1:35 | Prefactibilidad y economía circular | Prefactibilidad económica + Sustentabilidad | Techriders: costos de lote piloto $4,500 USD, hectáreas irrigadas |
| IV | 1:35–2:00 | Escalabilidad y cierre | Integración de 5 criterios + Recordación | STEM Synergy: "convertimos cualquier espacio en una oportunidad para cultivar vida" |

---

## Checklist de redacción (sí / no)

Basado en las 3 hipótesis que sobrevivieron al análisis sistémico:

| # | Regla | Estado | Evidencia |
|---|---|---|---|
| 1 | Mencionar el **nombre del proyecto en la descripción** del video | ✅ A favor | H30: +10,1 pp |
| 2 | Duración del video **≤ 110 segundos** | ✅ A favor | H42: >110 s cuesta −6,0 pp |
| 3 | Equipo con **más integrantes nombrados** (delegación) | ✅ A favor | H01: +19,3 pp |
| 4 | CERO logos/nombres en los primeros 20 segundos | ✅ Reglamento | Regla de oro #6 del AGENTS.md |
| 5 | 4 actos exactos (PAS-V) | ✅ Reglamento | Rúbrica SIRLI |
| 6 | Métricas con fuente oficial (BCN, INIDE, CEPAL, OMS, FAO) | ✅ Reglamento | claims.json obligatorio |
| 7 | Usar testimonio de usuario | ❌ En contra | 0 % uso en guiones premiados recientes |
| 8 | Repetir el nombre del proyecto más de una vez por sección | ❌ En contra | Regla de oro #3 |
| 9 | Usar morado #7c3aed o cards genéricas | ❌ En contra | Regla de oro #4 |

---

## Template rellenable (copiar y completar)

```
[ACTO I · 0:00–0:20] Gancho y dolor
Dato de impacto con fuente: _________________________________
Micro-historia del beneficiario: _____________________________
(No decir nombres del equipo ni del proyecto todavía.)

[ACTO II · 0:20–1:00] Revelación técnica
Nombre comercial del proyecto: _______________________________
Tesis funcional en una oración: ______________________________
Qué se muestra visualmente (CAD 3D, prototipo, flujo): ________

[ACTO III · 1:00–1:35] Prefactibilidad
Costo unitario del prototipo: ________________________________
Modelo de ingresos / quién paga: _____________________________
Ciclo ambiental (residuo → insumo): __________________________

[ACTO IV · 1:35–2:00] Escalabilidad y cierre
Impacto proyectado (métrica concreta): _______________________
ODS vinculados: _____________________________________________
Frase de cierre memorable: ___________________________________
```

---

## Pasos de producción

1. Escribir el guion con el template arriba (240–270 palabras).
2. Medir con cronómetro leyendo en voz alta: debe caber en ≤120 s.
3. Verificar que no haya nombre del proyecto en los primeros 20 s.
4. Verificar que cada cifra tenga fuente en `research/claims.json`.
5. Ejecutar `python scripts/gen_script.py` cuando `brief.json` tenga proyecto, reto y claims.
6. Grabar locución con voz grave (≤100 Hz, ver `brain/corpus/guion_voz.md`).
7. Sincronizar imágenes con los 4 micro-actos.

---

## Qué evitar (errores frecuentes de perdedores)

- Empezar presentando integrantes del equipo (gasta los 20 s más valiosos).
- Leer textualmente la hoja del desafío.
- Usar solo aplicación móvil sin hardware tangible para problemas físicos.
- Afirmar abstractamente sin mostrar el mecanismo (no abrir la "caja negra" técnica).
- Desechar el segundo minuto en buenos deseos comunitarios sin métricas de costo.
- Dejar el video en modo Privado en YouTube (descalificación automática).
