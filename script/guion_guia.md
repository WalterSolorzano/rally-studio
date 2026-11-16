# Guía práctica: construir un buen guion de pitch SIRLI

Referencia: `brain/corpus/ganadores_latam.md` (Anatomía del Video Ganador, 4 micro-actos),
`script/script.md` (esqueleto vacío), `research/sirli/analisis/hipotesis.csv` (42 hipótesis,
3 a favor: delegación, nombre del proyecto en descripción, duración ≤110 s).

Límite: **120 segundos medidos en el audio**. 240–270 palabras de referencia de escritura.
**CERO logos ni nombres del proyecto en los primeros 20 segundos.**

---

## Los 4 micro-actos (segundo a segundo)

| Micro-acto | Tiempo (rúbrica) | Función | Criterio de rúbrica activado | Ejemplo real de ganador |
|---|---|---|---|---|
| I | 0:00–0:20,4 | Gancho y dolor cuantificado | Impacto social + Calidad de presentación | STEM Synergy: "Según la FAO, para 2050 la producción mundial deberá aumentar un 60%" |
| II | 0:20,4–1:00,0 | Revelación técnica y prototipo 3D | Innovación + Viabilidad técnica | Techriders: modelo 3D de micropresa con válvulas y sensores LoRaWAN |
| III | 1:00,0–1:34,8 | Prefactibilidad y economía circular | Prefactibilidad económica + Sustentabilidad | Techriders: costos de lote piloto $4,500 USD, hectáreas irrigadas |
| IV | 1:34,8–2:00,0 | Escalabilidad y cierre | Integración de 5 criterios + Recordación | STEM Synergy: "convertimos cualquier espacio en una oportunidad para cultivar vida" |

El reparto exacto es 17 / 33 / 29 / 21 % de 120 s. Los nombres y los ejemplos son
ilustrativos: la función es fija, el contenido se deduce del reto y la solución.

---

## Checklist de redacción (sí / no)

Basado en las hipótesis que sobrevivieron al análisis sistémico (H30 y H42 del video;
H01 es de sede, no de guion) — ver `research/sirli/analisis/investigacion_profunda.md`:

| # | Regla | Estado | Evidencia |
|---|---|---|---|
| 1 | Mencionar el **nombre del proyecto en la descripción** del video | ✅ A favor | H30: +10,1 pp |
| 2 | Duración del video **entre 110 y 120 segundos** | ✅ A favor | H42: quedarse **≤110 s cuesta −6,0 pp** (36,8 % vs 42,8 % en podio) |
| 3 | ~~Equipo con más integrantes nombrados (delegación)~~ **retirada** | ⚠️ Sin respaldo | H01 (+19,3 pp) es **tamaño de sede**, no delegación; la delegación es H11 y va en contra. No usar esta regla. |
| 4 | CERO logos/nombres en los primeros 20 segundos | ✅ Reglamento | Regla de oro #6 del AGENTS.md |
| 5 | 4 actos exactos (PAS-V) | ✅ Reglamento | Rúbrica SIRLI |
| 6 | Métricas con fuente oficial (BCN, INIDE, CEPAL, OMS, FAO) | ✅ Reglamento | claims.json obligatorio |
| 7 | Usar testimonio de usuario | ❌ En contra | 0 % uso en guiones premiados recientes |
| 8 | Repetir el nombre del proyecto más de una vez por sección | ❌ En contra | Regla de oro #3 |
| 9 | Usar morado #7c3aed o cards genéricas | ❌ En contra | Regla de oro #4 |

---

## Esqueleto que se adapta (no se rellena)

Las cuatro funciones son fijas; las preguntas de abajo son **las que cada acto debe
responder**, no campos que se rellenan con una frase hecha. Cada respuesta se escribe con
el material de este proyecto: su mecanismo, su actor, su cifra.

```
[ACTO I · 0:00–0:20,4] Dolor
¿A quién le duele, dónde y cuánto?  ______________________
¿Qué se ve en los primeros 5 segundos? ___________________
Dato con fuente y año (claims.json): _____________________
(Prohibido: nombres del equipo o del proyecto, logos, leer el reto.)

[ACTO II · 0:20,4–1:00,0] Mecanismo
Frase de tesis: ¿qué hace la solución, en una oración? ___
Paso 1 / paso 2 / paso 3 del mecanismo real: ______________
¿Qué pieza, gesto o pantalla lo demuestra? ________________
¿Qué se ve mientras se dice (corte, render, demo)? _______
(Prohibido: beneficios antes de mecanismo, jerga sin imagen.)

[ACTO III · 1:00,0–1:34,8] Prefactibilidad
Costo del piloto y su base: ______________________________
¿Quién paga y con qué recurrencia? ________________________
¿Qué se sostiene sin subsidio? ____________________________
Máximo tres cifras de dinero en todo el acto. Sin TIR ni VAN.

[ACTO IV · 1:34,8–2:00,0] Cierre
¿Qué cambió para el usuario del Acto I? ___________________
Tríada: ambiental / económica / social ____________________
¿Dónde más se replica y con qué condición? _______________
Cierre Latam: «piloto en <ciudad>, replicable en toda América Latina».
(Prohibido: «gracias», logo final.)
```

### Tabla de adaptación del Acto II

El mecanismo se cuenta distinto según el reto. Esto decide qué se muestra y qué cifra
manda:

| Reto | Se muestra | Cifra que manda |
|---|---|---|
| Físico / infraestructura | pieza, montaje, corte o render con dimensiones | costo del prototipo, capacidad/día |
| Proceso / logística | flujo antes/después, cuello de botella, tiempo | horas o mermas evitadas |
| Social / servicios | actores, recorrido del usuario, acuerdos | personas atendidas, costo/beneficiario |
| Digital / datos | pantalla real, dato que entra y decisión que sale | licencias, costo por sitio |
| Ambiental / circular | residuo → insumo, masa y energía | kg desviados, ingreso por subproducto |

### Frases prohibidas (delatan guion de plantilla)

- «tres capas: captura, procesamiento e interfaz»
- «cada módulo es independiente»
- «parámetros configurables, insumos locales, mantenimiento propio»
- «tiempo de respuesta, usuarios activos y costo por unidad operativa»
- «talento nicaragüense al servicio de la comunidad»
- «el problema no es la falta de esfuerzo, es la falta de una respuesta simple»
- «la operación se financia con una cuota mensual por usuario o sitio activo»

Ninguna dice qué hace el proyecto. Si aparecen, el guion no está escrito: está rellenado.
Prueba de aceptación: **si el guion sirve igual para otro equipo, se reescribe.**

---

## Pasos de producción

1. Antes de escribir: dejar por escrito reto literal, causa raíz, insight, mecanismo, prueba y economía. Sin esos seis puntos no se escribe guion.
2. Escribir con el esqueleto adaptable, 240–270 palabras, respondiendo cada acto con el mecanismo y la cifra de este proyecto.
3. Pasar la prueba de especificidad: tapar el nombre del proyecto y ver si el guion sigue siendo reconocible. Si no, reescribir.
4. Medir con cronómetro leyendo en voz alta: debe caber en ≤120 s.
5. Verificar que no haya nombre del proyecto en los primeros 20 s.
6. Verificar que cada cifra tenga fuente en `research/claims.json`.
7. Ejecutar `python scripts/gen_script.py` cuando `brief.json` tenga proyecto, reto y claims — **solo como borrador**. Sus frases por defecto son genéricas: se reemplazan por las del proyecto antes de grabar.
8. Grabar locución con voz grave (≤100 Hz, ver `brain/corpus/guion_voz.md`).
9. **Después del guion**, derivar las tomas: `shots/*.yaml` → `script/shotlist.csv` → `docs/storyboard_visual.html`. El storyboard no se escribe antes ni cambia el orden de los actos.

Orden correcto: `reto → causa → insight → mecanismo → prueba → guion → storyboard`. Si una toma pide una frase que el guion no tiene, se corrige el guion y se recompila; nunca al revés.

---

## Qué evitar (errores frecuentes de perdedores)

- Empezar presentando integrantes del equipo (gasta los 20 s más valiosos).
- Leer textualmente la hoja del desafío.
- Usar solo aplicación móvil sin hardware tangible para problemas físicos.
- Afirmar abstractamente sin mostrar el mecanismo (no abrir la "caja negra" técnica).
- Desechar el segundo minuto en buenos deseos comunitarios sin métricas de costo.
- Dejar el video en modo Privado en YouTube (descalificación automática).
