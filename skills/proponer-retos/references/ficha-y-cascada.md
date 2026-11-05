# Ficha rápida, cascada anti-genérico y qué no hacer

Referencia de `proponer-retos/SKILL.md`. Cargala junto con `goal.md` y `anti-generico.md`
antes de generar o revisar fichas.

## 1. Compuertas en cascada (anti-genérico)

Las compuertas no son un checklist que se mira al final. Son **cascada**: cada una puede
abortar la opción antes de que llegue al PDF.

| Etapa | Compuerta | Si falla |
|---|---|---|
| Antes de redactar | Chain-of-thought (8 preguntas) | `RECHAZADA` — no se redacta |
| Antes de redactar | Encaje literal (objeto/actor del enunciado) | `RECHAZADA` |
| Antes de redactar | Bucle de decisión (decisor + umbral + plazo) | `RECHAZADA` |
| Redactando | Estado del arte (sustituto más fuerte + capacidad distinta) | `RECHAZADA` |
| Redactando | Precedente equivalente (mismo mecanismo) | `RECHAZADA` |
| Redactando | Factibilidad (instrumento + resolución + quién repara) | `RECHAZADA` |
| Redactando | Costo bottom-up (componentes × cantidad × precio = total, con fuente) | `RECHAZADA` |
| Redactando | Pagador con línea (institución + partida + cargo + bien + mantiene) | `RECHAZADA` |
| Redactando | Categoría justificada (definición + criterio) | `RECHAZADA` |
| Después de redactar | No herencia (no reutiliza escena, objeto, costo, ODS, insignia, precedente) | `RECHAZADA` |
| Después de redactar | **Test de swap** (cambia 2 palabras del problema; si la propuesta sigue igual, es genérica) | `RECHAZADA` — volver a paso 5 |
| Después de redactar | **FORBIDDEN_PHRASES** (detector regex de verbos huecos y abstracciones) | `RECHAZADA` — reescribir sin la frase |

La doctrina de cada compuerta está en `dossier-soluciones/SKILL.md`. El test de swap y el
detector de frases están en `references/anti-generico.md`.

## 2. Formato de cada solución (ficha rápida en chat)

Cada solución se devuelve como una **ficha compacta** para que el equipo la lea en menos de un
minuto y decida si la promueve al dossier o la descarta. **No se devuelven párrafos largos en el
chat** — eso es para el dossier PDF, que se genera después solo con las opciones seleccionadas.

```
## DESAFIO_0X · Opción 0Y · <Familia A–G>

**Título:** <máx 12 palabras, concreto, no el nombre del reto>
**Qué es:** <1 frase, máx 25 palabras: qué se construye, para quién, qué cambia>
**Cómo funciona:**
  1. <un paso, una línea>
  2. <un paso, una línea>
  3. <un paso, una línea>
  4. <un paso, una línea>
**Pagador:** <institución/empresa> · <partida/ingreso> · <cargo que firma> · <bien recibido>
**Métrica:** <número> <unidad física> · fuente: <claims.json / retos_razonamiento.json / "por validar">
**Ya existe:** <sustituto más fuerte con precio> — diferencia: <capacidad funcional nueva>
**Precedente:** <equipo, año, puesto, mecanismo> · <link video si hay>
**Mecanismo nuevo:** <tecnología/paper/caso> · <año> · <URL abrible> — cómo se usa: <una línea>   *(campo opcional, solo si la búsqueda web aportó algo)*
**Costo:** <total> = componentes × cantidad × precio · fuente: <URL o cotización, fecha>
**Por validar:** <supuesto más riesgoso> + <prueba barata en ≤ 1 semana>
**Pitch:** <una frase para el video de 60 s>
```

**Reglas de la ficha:**

- Sin párrafos largos, sin narrativa decorativa, sin jerga interna (nómina, jugador, canal,
  nodo, sesgo, ticket, mecanismo, saturación, probabilidad, win rate, score, «No documentado»).
- Sin sección «lo que el jurado va a atacar» — el riesgo va como `Por validar`.
- Sin estadísticas internas del motor — solo datos de impacto con fuente.
- Trazabilidad visible: cada número cita su fuente. Si no hay fuente, `por validar con el equipo`.
- Una opción por bloque. Las dos opciones del mismo reto NO se mezclan en un solo bloque.
- Si el equipo pide más detalle de una opción, se expande a formato dossier bajo pedido explícito.

### Lo que NO va en la ficha (va al dossier si el equipo la selecciona)

- Párrafo narrativo «qué es» de 150–250 palabras (ese es para el jurado, no para el equipo).
- ODS con figura oficial, insignias, detalles que suman, comentarios reglados.
- Ese contenido se genera después, solo para las opciones seleccionadas, con `gen_dossier.py`.

## 3. Qué no hacer

- **Nunca** propongas retos nuevos ni reformules el enunciado del comité.
- **Nunca** inventes cifras, precios, beneficiarios, años, equipos ni precedentes desde la memoria del modelo. Si no está en el banco interno, se marca `por validar con el equipo`.
- **Nunca** publiques una solución solo porque el motor la generó: si no pasa las compuertas en cascada, se descarta. El motor propone, no aprueba.
- **Nunca** devuelvas párrafos largos en el chat. La ficha rápida es para revisión; el dossier PDF es para el jurado y se genera después solo con las opciones seleccionadas.
- **Nunca** incluyas una sección de «lo que el jurado va a atacar»: no hay réplica. El riesgo se escribe como `Por validar` con su prueba barata.
- **Nunca** muestres estadísticas internas (saturación, score, probabilidad de victoria). Solo datos de impacto con fuente para vender la idea.
- **Nunca** uses frases de la lista `FORBIDDEN_PHRASES` ni patrones de `GENERIC_SMELLS` (ver `references/anti-generico.md`). Si aparecen, la opción se reescribe, no se maquilla.
- **Nunca** heredes escena, objeto, costo, ODS, insignia ni precedente de un dossier o versión anterior.
- No prometas que una solución "gana": presenta la ruta y su evidencia.
- No entregues soluciones genéricas sin caso, sin causa raíz o sin métrica.
- No fuerces temas del jurado nicaragüense (ciudades creativas, pobreza, ambiental, agro) si el enunciado no cae en esa familia. Las familias del §7 del goal son reconocimiento, no etiqueta obligatoria.
