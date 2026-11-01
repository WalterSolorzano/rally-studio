# Plan de correcciones — video, voz y mockups (Rally Studio)

**Origen:** auditoría del intento de producción en `rally-test-studio` (LATAM 2026, reto
`VENTA_SISTEMA`). Este documento no es un changelog: es la lista de fallos que cometimos,
por qué ocurrieron y la regla que debe regir la próxima versión del sistema fuente.

**Estado:** el video actual (`assets/video_final.mp4`, 120 s) técnicamente pasa los gates
(duración, coherencia, caracteres, movimiento, cero negros), pero **no está aprobado**:
la voz fue rechazada por el usuario y el montaje todavía se percibe lento.

---

## 1. Veredicto de la voz (bloqueante)

La voz entregada fue **Piper `es_AR-daniela-high`**, variante `v6_final`, 141,5 ppm,
117,5 s, con normalización fonética, pausas por cláusula/acto y post-FX.

**El usuario la rechazó:** «es súper lenta y antinatural». No hay voz preferida todavía.
No se debe volver a proponer Daniela como solución cerrada.

Diagnóstico honesto de por qué suena así:

| Causa | Evidencia | Efecto percibido |
|---|---|---|
| Pausas largas entre cláusulas | `clause_gap` 0,30 s y `act_gap` 0,75 s, 51 pausas en 117 s | Sensación de arrastre aunque el ppm sea 141 |
| Prosodia plana del modelo | Piper high no varía tono ni energía por frase | Voz de lectura, no de conversación |
| Pacing uniforme | Todas las frases al mismo ritmo | Sin énfasis en cifras ni en el cierre |
| Tono argentino sobre guion con voseo | Coherente gramaticalmente, pero el usuario no lo eligió | Choque de expectativa |
| Medición engañosa | 141 ppm parece normal (rango hablado 150–180) | El número no mide naturalidad |

**Regla:** ninguna voz se declara final por métricas. Se elige por escucha A/B a ciegas
con al menos 5 oyentes, y el usuario tiene veto.

---

## 2. Voces y motores baneados (no volver a proponer)

| Motor / voz | Estado | Motivo |
|---|---|---|
| Piper `es_AR-daniela-high` | **Rechazada en uso** | Lenta y antinatural para este guion |
| Otras voces Piper (`es_ES-*`, `es_MX-*`, `en_*`) | Baneadas | Misma prosodia plana; acento incorrecto |
| edge-tts (Microsoft) | Baneada | Voces «anuncio», entonación predecible, dependencia de servicio |
| Kokoro | Baneada | Artefactos y prosodia inestable en español |
| Chatterbox | Baneada | Inestable, clonación impredecible |
| F5-TTS | Baneada | Calidad irregular y costo de GPU |
| XTTS v2 | Baneada | Clonación con deriva y ruido |
| MeloTTS | Baneada | Plana y con pronunciación débil de cifras |

**No mostrar estas opciones en la ventana ni en demos.** Si se propone una voz nueva,
va con muestra, ficha técnica y comparación, no con una lista de motores.

---

## 3. Requisitos de la voz definitiva

1. **Ritmo percibido 150–165 ppm**, medido sobre el audio final (no sobre el texto).
2. **Pausas ≤ 0,25 s** entre cláusulas y ≤ 0,6 s entre actos.
3. **Variación de energía** de al menos 6 dB entre frases de énfasis y neutras.
4. **Cifras y siglas pronunciadas completas**: «cuatro mil cuatrocientos cincuenta»,
   «veintiocho horas», «Rally Studio», «UNI».
5. **Acento latino neutro o nicaragüense**; el voseo del guion se mantiene.
6. **ASR ≥ 97 % tolerante** y **0 clics** al unir frases.
7. **−16 LUFS / TP ≤ −1,5 dB** listo para mezcla.
8. **Una sola toma continua** o concatenación con fundidos de 10 ms y `adeclick`.
9. **Sin música ni SFX en la muestra de evaluación** (para juzgar solo la voz).
10. **Veto del usuario** antes de renderizar el video completo.

Protocolo de selección: 30 s del Acto I + 15 s del cierre, 5 candidatas, orden aleatorio,
misma frase, misma ganancia. Se elige la que gane en naturalidad, no en ppm.

---

## 4. Fallos de video y regla de corrección

| Fallo cometido | Consecuencia | Regla para la próxima |
|---|---|---|
| Tarjetas de texto laterales (`layout=split`) | Sensación de diapositiva, no de video | Texto siempre sobre metraje: lower third, centro o wordmark; nunca bloque lateral |
| Planos fijos de 5–7 s | Video «detenido» | Ningún tramo sin movimiento > 1,5 s (pan, zoom, push-in, parallax) |
| Cierre estático 7,25 s | El final se congela | El wordmark también se mueve: luz que barre, deriva y push-in del logo |
| Transiciones a negro | Cortes publicitarios, se pierde el hilo | Solo `cut`, `whip`, `flash`, `wipe`, `match_cut` |
| Texto desincronizado de la voz | El espectador lee antes o después | Cada bloque entra con su frase y sale antes del siguiente; entrada ≤ 300 ms |
| Bloques de más de 2 líneas | Muro de texto | Máximo 2 líneas y ≤ 14 palabras por bloque |
| Voz vieja en el render final | Hubo que re-muxear y luego re-renderizar | Renderizar una sola vez, con la voz aprobada y la mezcla cerrada |
| SFX duplicados (motor + mezcla) | Golpes dobles | El motor recibe la mezcla con `--no-music --no-sfx` |
| Metraje repetido (mismo clip 2–3 veces) | Se nota el stock | Cada clip aparece una vez; si falta, se busca uno nuevo o se usa UI/3D |
| Preview con voz descartada | Decisiones sobre material equivocado | El preview usa la misma voz y mezcla que el final |
| Subtítulos ausentes | El jurado en silencio pierde el mensaje | Subtítulos quemados opcionales, sincronizados al mismo cue |

---

## 5. Mockups y UI: zoom, movimiento y velocidad

Los mockups no pueden ser capturas quietas. Reglas:

1. **Zoom continuo:** 1,00 → 1,06 en cada plano, sin volver a 1,00 (evita el rebote).
2. **Paneo con intención:** seguir el cursor o el elemento que la voz menciona.
3. **Cursor animado** y clics reales; nada de pantallas sin interacción.
4. **Datos animados:** barras, contadores y cifras que suben al ritmo de la frase.
5. **Grabación acelerada:** la UI real se reproduce a 1,25×–1,5×; los tiempos
   muertos (carga, scroll) se cortan, no se aceleran.
6. **Cortes cada 1–2 s** dentro del mockup: cambio de foco, de panel o de zoom.
7. **Nada de scroll eterno:** cada gesto dura ≤ 1,5 s y termina en un estado legible.
8. **Texto del mockup legible a 1080p:** mínimo 22 px efectivos; si no se lee, se
   reemplaza por un close-up del panel.
9. **Sin capturas en blanco:** validar el frame antes de renderizar (un `fetch` que
   falla deja la pantalla vacía).

---

## 6. Ritmo y montaje del video

- **120 s exactos**, 4 actos: 0–27 problema, 27–63 app, 63–90 modelo, 90–120 cierre.
- **18–24 planos**, promedio 5–7 s por bloque narrativo, con movimiento interno cada 1,5 s.
- **Corte en el primer frame de cada frase**; el video respira con la voz, no con el reloj.
- **Sin silencios visuales:** si la voz calla, hay un gesto (zoom, dato, transición).
- **Cierre literal:** «Piloto en Managua, replicable en toda América Latina».
- **Cero ODS en pantalla.** Se declaran en la fase 04 del workbench.

---

## 7. Audio

| Elemento | Regla |
|---|---|
| Voz | −16 LUFS, TP ≤ −1,5 dB, mono 48 kHz |
| Música | 2–4 cues por acto, −8 dB bajo la voz, crossfade 1,3 s |
| Ducking | Envolvente de voz (RMS 20 ms), ataque 60 ms, release 400 ms, −6 dB |
| SFX | 7–9 golpes, fuera del duck, nunca sobre sílabas |
| Mezcla final | −16 LUFS integrado, LRA ≤ 6, TP ≤ −1,5 dB |
| Medición | `ebur128` sobre el archivo final, no sobre stems |

Aprendizaje: con `--music-db -19` la música quedaba 16,8 dB bajo la voz y desaparecía.
El punto útil fue **−8 dB** con duck de 6 dB (separación medida 11,8 dB).

---

## 8. Datos, cifras y hardcodeos

| Fallo | Corrección |
|---|---|
| ODS 9/4/17 fijos en datos, docs, sitio y video | `ods_ids: []`; el equipo declara ODS en fase 04; prohibido en el video |
| Fallbacks silenciosos (`or ["ODS 9","ODS 4","ODS 17"]`) | Ningún generador inventa datos: si falta, deja vacío y avisa |
| Cifras que no cruzaban entre guion, narración y pautado | Regla: toda cifra «significativa» vive en los tres o en ninguno |
| Líneas de ruido que ocultaban cifras al checker | No mezclar «video de 2 minutos» con la cifra de sedes en la misma línea |
| Desglose de partidas en prefactibilidad | Solo total + remisión al presupuesto; el detalle vive en `budget/` |
| Claims simulados citados como reales | Marcar `[SIMULADO]` o excluir del texto |

Cifras que deben sobrevivir en los tres entregables: **1.425 sedes**, **65.000 jóvenes**,
**28 horas**, **13 etapas**, **4.450 USD**, **120 s**. Si una no está en el guion, no se
mete en el pautado.

---

## 9. Proceso con agentes (lo que nos costó tiempo)

1. **Reportes que no coinciden con el disco.** Un agente reportó cues y mezclador que no
   existían. Regla: verificar con `Get-ChildItem`/`Test-Path` antes de anunciar entrega.
2. **Sobrescritura silenciosa.** Un agente reescribió `full_v6_final.mp3` después de la
   mezcla. Regla: nombrar tomas con hash/fecha o bloquear el archivo en uso.
3. **Archivos fantasma en el manifiesto.** `clips_manifest.json` nunca se escribió.
   Regla: el manifiesto se genera con el render, no después.
4. **Procesos pesados en paralelo.** Blender + ffmpeg + TTS compiten y alargan todo.
   Regla: un solo proceso pesado; `render_watch.py` antes de lanzar.
5. **Render a ciegas.** Se renderizaron 13 minutos con una voz que luego cambió.
   Regla: validar 10 s del tramo crítico antes del render completo.
6. **Promesas sin gate.** «Listo» sin `arsenal.py check-todo` en verde no es listo.

---

## 10. Gates obligatorios antes de entregar

```bash
python arsenal.py check-todo          # duración ≤120 s, coherencia, caracteres
python scripts/pitch_video.py --check # layouts, movimiento, sin negro, sin ODS
python -m unittest tests.test_pitch_video_static
python scripts/verify_motion.py assets/video_final.mp4
```

Criterios: `static frms = 0`, `black frms = 0`, `motion ≥ 3`, duración 120,00 s,
audio −16 ± 1 LUFS, TP ≤ −1,5 dB, 0 ODS visibles.

---

## 11. Plan de correcciones (prioridad)

### P0 — antes de cualquier entrega
1. Elegir voz con el protocolo de la sección 3 (sin Daniela por defecto).
2. Re-sintetizar el guion completo y medir ppm, pausas, ASR y clics.
3. Re-mezclar y renderizar una sola vez con la voz aprobada.
4. Verificar visualmente 16 frames (contact sheet) y el tramo de cierre.

### P1 — calidad percibida
5. Aplicar zoom/paneo a todos los mockups (sección 5).
6. Diversificar metraje: un uso por clip, sin repeticiones.
7. Ajustar el cierre para que nunca tenga un plano fijo.
8. Revisar contraste del lower third sobre metraje claro (scrim ≥ 0,34).

### P2 — sistema fuente
9. Eliminar los últimos hardcodeos ODS en `dashboard/app.js` y `scripts/rally_service.py`
   (requiere autorización: son motor).
10. Convertir `ods_ids` en dato declarado por el equipo y reflejarlo en el cerebro.
11. Generar `clips_manifest.json` junto con cada lote de Blender.
12. Añadir al gate una comprobación de repetición de clips y de planos fijos.
13. Documentar el protocolo de voz en `docs/audio_video.md`.

---

## 12. Anexo: métricas del intento (referencia)

- Video: 120,00 s, 1920×1080, 30 fps, H.264 CRF 18, AAC 192 kbps.
- Movimiento medio 9,53; 0 frames negros; 0 muestras estáticas a 4 fps.
- Mezcla: −15,8 LUFS integrado, LRA 2,3, TP −2,7 dBFS.
- Voz rechazada: 141,5 ppm, 117,5 s, 51 pausas, ASR 97,6 % tolerante.
- Presupuesto: 4.450 USD, 11 partidas con enlace; pautado dentro de límites.

Estos números describen el intento, **no** un estándar de aprobación. La aprobación es
escucha humana + gate en verde + revisión visual.
