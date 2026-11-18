## 9. Punteros

- Motor: `scripts/soluciones_motor.py` · PDF: `scripts/gen_soluciones_pdf.py` + `docs/assets/soluciones.css`
- Casos: `knowledge/retos_razonamiento.json` · Erratas: `knowledge/ERRATAS.md` · Ganadores: `research/sirli/winners.jsonl`
- Doctrina completa: `skills/dossier-soluciones/SKILL.md`
- **Goal maestro**: `references/goal.md` · **Detector anti-genérico**: `references/anti-generico.md`
- **Ficha, cascada y qué no hacer**: `references/ficha-y-cascada.md`
- Cerebro: `brain/corpus/retos.md` · Rúbricas: `.agents/rules/rubricas-y-puntajes.md` · Docs: `docs/MOTOR_SOLUCIONES.md`

## Generación de prompts para llevar las soluciones a otra IA

Cuando el usuario quiera exportar las soluciones a otra IA
(OpenAI, Claude, Gemini, OpenCode, Antigravity…), genera el prompt con esta
estructura:

```
Rol: especialista en soluciones de innovación para rallies universitarios.
Contexto: Certamen <rally_type> (<hours_total> h), reto <reto_id>,
  categoría <categoria>, municipio <municipio>.
Entrada: `knowledge/retos_razonamiento.json`, `research/claims.json`,
  `research/sirli/winners.jsonl`, `knowledge/ERRATAS.md`.
Tarea: Generar dos soluciones por reto con razonamiento problema → causa raíz
  → insight → solución → métrica, con precedentes ganadores.
Restricciones:
  - No inventar retos ni casos desde la memoria.
  - Cifras, precios, beneficiarios y precedentes solo de `research/claims.json`,
    `knowledge/retos_razonamiento.json` o `knowledge/ERRATAS.md`.
  - Cada solución debe ser producto, sistema o infraestructura con activo propio.
  - Sin emojis, sin degradados estilo IA, sin glassmorphism.
  - Idioma: español.
Formato de salida: JSON con claves reto_id, soluciones (2), cada una con
  problema, causa_raiz, insight, solucion, metrica, precedente, ODS, costo_estimado,
  quien_paga, ya_existe, categoria_justificada.
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

## Cómo redactar guiones cuidando la pronunciación y el orden de palabras
Compartido: `skills/_comun/guiones.md`. Léelo antes de aplicar esta sección.

## Cómo crear modelos 3D (referencia)
Compartido: `skills/_comun/modelos-3d.md`. Léelo antes de aplicar esta sección.

## Cómo sugerir elementos gráficos

- Thumbnail y piezas de portada: prohibido resolver con cuadrados, rectángulos,
  círculos o triángulos. Usa foto real, vector complejo o un modelo de Blender.
- Sin emojis como íconos en la web demo.
- Sin cards genéricas, sin morado (#7c3aed o similar), sin fuentes fuera de
  `brand/tokens.css`.

## 10. Calibrar la compuerta

Antes de confiar en la cascada, pásale una solución que ya sabes que no sirve (de un dossier
anterior o descartada): debe devolver `RECHAZADA` con motivo. Si la aprueba, falta un campo o
una regla está floja. No se calibra con el caso que estás escribiendo, sino con uno que ya falló.
