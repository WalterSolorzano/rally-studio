# Storyboard de producción — video de 120 s

**Estado:** 14 tomas compiladas, 120,0 s de duración nominal, `build_shotlist.py` sin errores.
**Certamen activo:** Latam 28 h (`brief.json` → `rally_type: latam`).
**Naturaleza:** storyboard **paramétrico**. La estructura, los tiempos, la gramática visual y
el mapeo de rúbrica están cerrados; el contenido concreto (rostros, cifras, nombre, ciudad)
espera los datos del equipo.

> Contratos legibles por máquina: `shots/S01.yaml` … `shots/S14.yaml`.
> Compilado: `script/shotlist.csv`. Nadie edita el CSV a mano.
> Referencia visual, una fila por toma con fotograma real, «qué buscar» y «qué crear»:
> `docs/storyboard_visual.html` (también en PDF: `docs/storyboard_visual.pdf`).
> Se regenera desde el CSV con `python docs/_gen_storyboard_visual.py`.

```bash
python scripts/build_shotlist.py     # → OK: 14 tomas compiladas
```

Auditoría independiente (subagente) del 15-11-2026: `reports/auditoria_storyboard.md`.
Sus hallazgos están aplicados en esta versión; el detalle del corrigendo está en §8.

---

## 1. Reparto de tiempo (verificado contra la rúbrica)

| Acto | Ventana | s | % | Fracción de rúbrica (`rubric_matrices` §3) | Desvío |
|---|---|---|---|---|---|
| I · Dolor | 0:00–0:20 | 20 | 16,7 % | 17 % | −0,3 |
| II · Caja negra | 0:20–1:00 | 40 | 33,3 % | 33 % | +0,3 |
| III · Prefactibilidad | 1:00–1:35 | 35 | 29,2 % | 29 % | +0,2 |
| IV · Cierre | 1:35–2:00 | 25 | 20,8 % | 21 % | −0,2 |

Los 120,0 s son la **suma de los `duration_s`** de las 14 tomas, no una medición de audio.
La medición con `ffprobe` se hace sobre el archivo final, y hoy no existe: el único material
sonoro medido es la cama musical de `docs/audio_video.md`. El techo de 120 s de la rúbrica se
verifica en el render, no en este documento.

---

## 2. Gramática visual por acto

| Acto | Qué debe verse | Qué no debe verse | Evidencia |
|---|---|---|---|
| I | Plano humano o territorial; detalle material de la pérdida; topónimo en rótulo | Logos, nombres de integrantes, lectura del desafío, diapositiva de objetivos | `docs/INFORME_INVESTIGACION.md` §9.2 |
| II | Render 3D del prototipo, vista explosionada, diagrama de bloques, demo funcionando | Beneficios antes que mecanismo | §9.3; §8.5 punto 3 («el render 3D es el lenguaje común del pitch técnico») |
| III | Tres cifras de dinero como máximo: costo unitario, costo del piloto, costo por beneficiario | TIR, VAN, total sin desglose, precio sin proveedor, una cuarta cifra | §9.4; regla de oro 5 |
| IV | Vuelta al rostro del Acto I, tríada de métricas, línea de escalabilidad regional | «Gracias», logo final, buenos deseos sin cifra | §9.5 |

**Doble codificación** (§9.6): el video se evalúa dos veces, jurado local y jurado
internacional. Por eso el Acto I lleva toponimia reconocible (capa local) y el Acto IV lleva
costo en USD y réplica regional (capa universal).

### Lo que la medición visual del corpus dice (y no dice)

`research/sirli/analisis/resumen_visual.json` contiene los descriptores de 4.196 miniaturas y
112 hojas de fotogramas. Los p-valores que los comparan por puesto están en
`research/sirli/analisis/investigacion_profunda.md` §5 (contraste de miniaturas):
brillo, colorido, caras y densidad de bordes son **indistinguibles** entre 1.º, 2.º y 3.º.
Consecuencia para el storyboard: **no se gradúa color para "parecer ganador"**. Se optimiza
legibilidad —contraste de rótulo, una idea por pantalla— porque reduce costo cognitivo
(`investigacion_profunda.md` §6), no porque el píxel promedio premie.

---

## 3. Las 14 tomas

| # | Acto | Tiempo | Plano | Asset | Rúbrica | Dueño |
|---|---|---|---|---|---|---|
| S01 | I | 0:00–0:06 | Rostro del beneficiario en su contexto, primer plano | `asset_s01_rostro_beneficiario` | b1 | director |
| S02 | I | 0:06–0:13 | Detalle de la pérdida concreta (manos, herramienta, residuo) | `asset_s02_detalle_perdida` | b1 | director |
| S03 | I | 0:13–0:20 | Rótulo de territorio: mapa, un punto, población afectada | `asset_s03_mapa_territorio` | e4, b1 | grafista2d |
| S04 | II | 0:20–0:27 | Placa con una sola frase de tesis; nombre escrito, no hablado | `asset_s04_tesis_nombre` | e3 | guionista |
| S05 | II | 0:27–0:38 | Render 3D vista 3/4, giro de 30°, escala legible | `carcasa_principal` | a1, a2 | modeler |
| S06 | II | 0:38–0:50 | Caja negra abierta: explosionada + diagrama de bloques | `carcasa_principal` | a3, d1 | modeler |
| S07 | II | 0:50–1:00 | Demo real: interfaz o equipo operando, ≥4 s sin voz | `asset_s07_demo_funcionando` | a4, d3, d4 | grafista2d |
| S08 | III | 1:00–1:11 | Costo unitario (cifra 1 de 3) + barras proporcionales sin números | `asset_s08_costo_unitario` | c1 | presupuestador |
| S09 | III | 1:11–1:20 | Costo del piloto y costo por beneficiario (cifras 2 y 3) | `asset_s09_alcance_piloto` | c1 | presupuestador |
| S10 | III | 1:20–1:27 | Quién paga: tres nodos, la contraprestación social en cada flecha | `asset_s10_quien_paga` | b2 | pautador |
| S11 | III | 1:27–1:35 | Ciclo ambiental: residuo entra, insumo sale, ahorro en palabras | `asset_s11_ciclo_ambiental` | c4, c3 | grafista2d |
| S12 | IV | 1:35–1:44 | Vuelta al mismo rostro, mismo encuadre, transformación | `asset_s12_rostro_transformado` | b3 | director |
| S13 | IV | 1:44–1:53 | Tres contadores de métricas auditables, con fuente al pie | `asset_s13_contadores_metricas` | e1 | grafista2d |
| S14 | IV | 1:53–2:00 | Cierre: frase memorable + «piloto en [ciudad], replicable en toda América Latina» | `asset_s14_cierre_region` | e2 | guionista |

Cadena de dependencias: `S01→S02`, `S03→S04`, `S04→S05→S06→S07`, `S07→S08→S09→S10→S11`,
`S01+S11→S12→S13→S14`. Nada se despacha fuera de orden.

**Regla de las tres cifras.** El Acto III admite tres números de dinero en total, cada uno con
su base. S08 gasta uno (costo unitario) y sus barras de desglose van **sin etiqueta
numérica**; S09 gasta dos (costo del piloto, costo por beneficiario) y dice el alcance en
palabras («un lote piloto en un mercado municipal») en vez de en más números; S10 y S11 no
llevan cifras. Si se agrega una cuarta, se cae la regla de §9.4.

---

## 4. Cobertura de rúbrica (19 ítems oficiales)

Extraído del propio CSV, no de esta tabla: `rubric_item` de las 14 tomas declara **17 ítems
distintos** (a1 a2 a3 a4 b1 b2 b3 c1 c3 c4 d1 d3 d4 e1 e2 e3 e4).

| Ítem | Toma | Dónde |
|---|---|---|
| a1 innovadora | S05 | video |
| a2 capacidad creativa | S05 | video |
| a3 tecnologías apropiadas | S06 | video |
| a4 usabilidad | S07 | video |
| b1 problemática específica | S01, S02, S03 | video |
| b2 valor social > mercado | S10 | video |
| b3 calidad de vida | S12 | video |
| c1 sustentable económicamente | S08, S09 | video |
| c2 eficiencia energética | — | **fuera del video**: pautado + canvas |
| c3 optimiza recursos | S11 | video |
| c4 mejora ambiental | S11 | video |
| d1 base teórica documentada | S06 (diagrama de bloques) | video |
| d2 recursos de fácil obtención | — | **fuera del video**: pautado + presupuesto (BOM) |
| d3 acorde a usuarios | S07 | video |
| d4 técnicamente validada | S07 | video |
| e1 síntesis | S13 | video |
| e2 claridad de la solución | S14 | video |
| e3 propuesta de valor clara | S04 | video |
| e4 ilustraciones claras | S03 | video |

**Cobertura declarada: 17 de 19.** Los dos restantes se cubren fuera del video y así se
declara, como pide el protocolo del director. `c2` y `d2` no tienen defensa visual honesta:
la eficiencia energética se demuestra con ficha técnica, y los recursos de fácil obtención
con la lista de compra.

---

## 5. Conflictos y huecos detectados

1. **El audio existente no cuadra con la rúbrica.** `docs/audio_video.md` coloca los cortes
   de acto en 0:27 / 1:03 / 1:30 → 22,5 / 30 / 22,5 / 25 %. La matriz oficial pide
   17 / 33 / 29 / 21 %. Los cues están bien medidos (LUFS, true peak, ducking) pero **el mapa
   temporal está desplazado**. Hay que re-renderizar el plan de cues a 20 / 60 / 95 s.
   Este storyboard ya usa los tiempos de rúbrica, así que el audio es lo que se ajusta.
2. **Dos fuentes de datos vacías, no una.** `research/claims.json` = `[]` y
   `budget/budget.json` = `[]`. Sin cifras de problema no se ruedan S01 ni S03; sin cifras de
   costo no se ruedan S08 ni S09; sin cifras de impacto no se rueda S13. **Cinco de catorce
   tomas quedan bloqueadas por datos**, y con ellas los tres ítems que solo ellas sostienen
   (b1, c1, e1).
3. **`brief.json` está vacío.** No hay proyecto, equipo, universidad, ciudad ni reto. S01/S02/
   S12 no se pueden grabar sin saber a quién se filma, y S14 no se puede cerrar sin ciudad.
4. **`budget/bom.csv` solo tiene tornillos y una carcasa genérica.** S05 y S06 apuntan a
   `carcasa_principal` porque es la única fila con `dim_*_mm`; con el BOM real, esos
   `asset_id` cambian.
5. **El shotlist ya no está vacío.** Con 14 filas, `tools/remix_audio.py` deriva clics,
   tecleo y papel de las descripciones en vez de usar el mapa genérico por acto.
6. **Dos reglas de `script/guion_guia.md` estaban mal y quedaron corregidas:** decía que
   quedarse ≤110 s era favorable (H42 dice lo contrario: cuesta −6,0 pp) y atribuía a la
   delegación el +19,3 pp de H01, que es tamaño de sede; la delegación es H11 y va en contra.

---

## 6. ¿Puede un subagente hacer esto?

**Sí, y está probado con evidencia.** Un subagente leyó el corpus y produjo
`reports/storyboard_acto2_propuesta.md`: su Acto II independiente suma exactamente 40 s,
declara 10 ítems de rúbrica y cita `§9.3` línea por línea. Además auditó la primera versión
de este documento y encontró seis defectos reales, todos corregidos en §8. Es decir: un
subagente no solo puede escribir el storyboard, también puede refutarlo.

| Tarea | ¿Delegable? | Por qué |
|---|---|---|
| Escribir `shots/*.yaml` desde el guion y la rúbrica | Sí | Traducción de texto a contrato; el compilador valida campos, dueños, dependencias y BOM |
| Cubrir la matriz de 19 ítems | Sí, con la tabla delante | Mecánico si se le pasa `rubric_matrices.md` §1 |
| Derivar tiempos por acto | Sí | Aritmética sobre la fracción de rúbrica |
| Auditar contra rúbrica y corpus | Sí, mejor que uno mismo | Sin apego al propio borrador |
| Decidir qué se filma realmente | No | Depende del material y de la autorización del equipo |
| Poner cifras | **No** | Sin `claims.json` cualquier número es invención |
| Nombrar el proyecto o la ciudad | No | `brief.json` manda; inventarlo viola la regla 12 |

**Despacho listo para copiar** (protocolo del director, paso 4):

```
Rol: director de produccion de rally.
Zona de escritura: shots/*.yaml (no tocar script/shotlist.csv a mano).
Entrada: brief.json, knowledge/rubric_matrices.md §1 y §3,
  docs/INFORME_INVESTIGACION.md §9, research/claims.json, budget/bom.csv.
Tarea: escribir una toma por archivo con id, act, description, asset_id,
  asset_type, duration_s, status, notes, rubric_item (lista separada por ';'),
  claim_ids, owner, depends_on, quality_tier; luego `python scripts/build_shotlist.py`.
Restricciones: 120 s exactos; fracciones 17/33/29/21; cero nombres antes del
  segundo 20; tres cifras de dinero maximo en el Acto III; sin cifras fuera de
  claims.json; sin emojis ni morado #7c3aed.
Salida: informe con tomas creadas, cobertura de rubrica y huecos.
```

---

## 7. Próximos pasos, en orden

1. Llenar `brief.json` (proyecto, equipo, universidad, ciudad, reto). Sin eso nada se graba.
2. Cargar `research/claims.json` con cifras de problema e impacto. Desbloquea S01, S03, S13.
3. Cargar `budget/budget.json`. Desbloquea S08 y S09.
4. **H30 exige trabajo fuera del video:** el nombre del proyecto va en la **descripción de
   YouTube** (+10,1 pp), escrito una vez y sin repetirlo en pantalla. Dueño: guionista, al
   publicar. No es una toma, y sin esto se deja 10 pp sobre la mesa.
5. Reemplazar `asset_id` de S05 y S06 cuando el BOM tenga la pieza real.
6. Re-temporizar el audio a 0:20 / 1:00 / 1:35 (`tools/remix_audio.py --print-plan` primero).
7. Grabar S01, S02 y S12 en una sola sesión, misma luz y mismo lente, con consentimiento
   escrito de la persona filmada.
8. Servir este documento a la ventana como propuesta antes de tocar nada más.

---

## 8. Corrigendo de la auditoría independiente

| Hallazgo | Gravedad | Estado |
|---|---|---|
| Cobertura real 11/19 porque `rubric_item` admitía un solo ítem | Alta | **Corregido**: lista separada por `;` en las 14 tomas → 17 ítems auditables en el CSV |
| `budget.json` también vacío, bloqueaba 6 tomas y se declaraba 1 | Alta | **Corregido** en §5.2: cinco tomas bloqueadas por datos |
| «120 s medidos con ffprobe» era falso; son sumas de `duration_s` | Alta | **Corregido** en §1 |
| `guion_guia.md` invertía H42 (≤110 s cuesta −6,0 pp) | Alta | **Corregido** en el archivo |
| `guion_guia.md` atribuía a delegación el +19,3 pp de H01 (es sede; delegación es H11, en contra) | Alta | **Corregido**: regla retirada |
| Acto III sumaba 8+ cifras contra la regla de tres | Alta | **Corregido**: S08 una cifra, S09 dos, barras sin números |
| b2 mal mapeado a un flujo de pagos | Media | **Corregido**: S10 ahora prueba valor social > mercado y no lleva cifras |
| d1 mal mapeado a un render | Media | **Corregido**: S06 incorpora diagrama de bloques; sin él, d1 no se reclama |
| Cita «§7.2.4» inexistente y 4 s vs 8 s contradictorios | Media | **Corregido**: remite a `investigacion_profunda.md` §7.2, ≥4 s sin voz |
| §2 citaba `resumen_visual.json` para p-valores que están en otro archivo | Media | **Corregido**: p-valores en `investigacion_profunda.md` §5 |
| §6 se autocertificaba («ya está probado») | Media | **Corregido**: se cita la evidencia del subagente |
| H30 (nombre en la descripción, +10,1 pp) sin dueño | Media | **Corregido**: paso 4 de §7, dueño guionista |
| Acto I entero apoyado en b1; S03 declara también e4 | Baja | **Corregido** |
| Sin nota de consentimiento al filmar rostros | Baja | **Corregido** en S01, S12 y §7.7 |
