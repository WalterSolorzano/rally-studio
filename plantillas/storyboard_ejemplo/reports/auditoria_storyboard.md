# Auditoria del storyboard (Latam 28 h)

Fuentes contrastadas: `docs/STORYBOARD.md`, `shots/S01..S14.yaml`, `script/shotlist.csv`,
`knowledge/rubric_matrices.md` §1 y §3, `docs/INFORME_INVESTIGACION.md` §9.2-§9.6,
`script/guion_guia.md`, y los datos que esos documentos citan (verificados uno por uno).

## Aritmetica: sin errores

Suma de `duration_s` en `script/shotlist.csv`: 6+7+7+12+8+10+10+9+9+8+9+9+9+7 = 120.
Actos: I 20 s (16,7 %), II 40 s (33,3 %), III 35 s (29,2 %), IV 25 s (20,8 %).
Desvios contra 17/33/29/21: -0,3 / +0,3 / +0,2 / -0,2 pp. La tabla §1 del STORYBOARD dice
la verdad. Las ventanas de las 14 tomas son contiguas y sin solape.

## Gravedad alta

**H1. La cobertura real es 11 de 19, no 17.** La tabla §4 de `STORYBOARD.md` asigna items
que **ninguna toma declara** en su campo `rubric_item`. Items distintos en los 14 YAML:
b1 (S01,S02,S03), e3 (S04), a1 (S05), d1 (S06), d4 (S07), c1 (S08,S09), b2 (S10),
c4 (S11), b3 (S12), e1 (S13), e2 (S14) = **11**. Sin toma que los declare: **a2, a3, a4,
c3, d3, e4**. La tabla §4 los atribuye a S05+S06, S06, S07, S11, S07, S03+S08-S11, pero
el contrato es de un solo valor por toma. Cualquiera que audite el CSV ve 11/19.

**H2. El bloqueo por datos es mayor de lo declarado.** `STORYBOARD.md` §5.2 dice que solo
S13 queda bloqueada por `claims.json` vacio. Falso: `budget/budget.json` tambien es `[]`.
Sin cifras no se pueden rodar S01 (regla operativa de §9.2: "la primera frase debe contener
una cifra o una consecuencia fisica"), S03 ("cifra de poblacion afectada"), S08, S09 ni S13.
**6 de 14 tomas** dependen de datos que hoy no existen.

**H3. Procedencia falsa en §1.** "El total es exactamente 120 s, que es el techo duro medido
con `ffprobe`". No hay `ffprobe`: son 14 campos `duration_s` sumados. El unico audio medido
(`docs/audio_video.md`) tiene los cortes en 0:27 / 1:03 / 1:30. La frase contradice §5.1
del mismo documento.

**H4. `guion_guia.md` invierte su propia fuente (H42).** Regla 2: "Duracion <= 110 segundos
✅ a favor". En `research/sirli/analisis/hipotesis.csv`, H42 dice "Quedarse muy por debajo
del limite (<=110 s) cuesta", diff -0,0602 (36,8 % vs 42,8 % de primeros lugares). El efecto
va en contra. `STORYBOARD.md` acierta con 120 s, pero no reconcilia: el equipo recibe dos
instrucciones opuestas.

**H5. `guion_guia.md` regla 3 atribuye mal H01.** Dice "Equipo con mas integrantes nombrados
(delegacion) ✅ a favor, H01: +19,3 pp". H01 es "Las sedes pequenas dan mas primeros lugares
por equipo": habla de tamano de sede, no de personas. La hipotesis de delegacion es H11 y va
en contra ("la probabilidad de primer lugar cae con el tamano de la delegacion"). La regla 3
no tiene respaldo.

**H6. El Acto III rompe su propia regla de tres cifras.** §9.4 (linea 645) limita a tres
cifras: costo unitario, costo del piloto, costo por beneficiario. S08 pide desglose de tres
lineas y S09 pide unidades, beneficiarios, periodo, costo del piloto y costo por beneficiario:
ocho o mas cifras en 17 s. La nota de S08 cita la regla y la incumple en la misma linea.

## Gravedad media

**M1. b2 mal mapeado.** S10 ("quien paga: tres nodos con flechas de dinero") demuestra modelo
economico. El item b2 es "valor social por encima del valor de mercado". Un flujo de pagos
prueba lo contrario de lo que el item pide. b2 queda sin cobertura real.

**M2. d1 mal mapeado.** S06 es un render. d1 es "base teorica solida y documentada": un render
demuestra comprension del mecanismo (§9.3), no documentacion. d1 se cubre en pautado, no en
video.

**M3. Cita inexistente.** La nota de `shots/S07.yaml` invoca "(7.2.4)" para justificar
"8 s de demo valen mas que 20 de narracion". `docs/INFORME_INVESTIGACION.md` §7.2 no tiene
subsecciones ni contiene esa frase. Ademas la descripcion de la misma toma dice **4 s** sin
voz y la nota dice **8 s**: contradiccion interna.

**M4. Cita al artefacto equivocado en §2.** `resumen_visual.json` no contiene p-valores
(solo medias y n). Los p (0,169 a 1,000) estan en `investigacion_profunda.md` lineas 199-205.
Conclusion correcta, fuente mal citada. Nota: los n de `resumen_visual.json` por puesto suman
3.758, no 4.196.

**M5. Autocertificacion en §6.** "Sí, y ya esta probado: este storyboard lo produjo un agente
leyendo el corpus, y compila". No hay artefacto que pruebe la procedencia, y "compila" no es
"esta validado": el propio §5 lista cinco bloqueos. No lo uses como evidencia de delegabilidad.

**M6. Regla 1 de `guion_guia` sin dueno.** Nombre del proyecto en la descripcion de YouTube:
+10,1 pp (H30, verificado en `hipotesis.csv`). Es el unico efecto grande y real del corpus y
ninguna toma, dueno ni paso del plan lo asigna.

## Gravedad baja

**L1.** §2 cita "§8.5.3"; en el informe es el item 3 de la lista §8.5 (linea 594), no una
subseccion. **L2.** `investigacion_profunda.md` se cita sin ruta; vive en
`research/sirli/analisis/`. **L3.** S01, S02, S03 declaran todos b1: el Acto I entero depende
de un solo item. **L4.** S01/S12 filman un rostro real de beneficiario sin nota de
autorizacion de imagen; `guion_guia` regla 7 marca el testimonio como "en contra" (0 % en
premiados), asi que conviene declarar que es rostro sin voz.

## Lo que si esta bien y conviene no tocar

Regla de cero nombres antes de 0:20 (S01-S03 lo cumplen y S04 entra exacto en 0:20).
Reparto de actos. Cierre Latam de S14. Cadena de dependencias. Declaracion honesta de §5.1
(audio desalineado) y §5.3/§5.4 (`brief.json` y BOM vacios).
