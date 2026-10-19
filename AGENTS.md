# AGENTS.md — Rally Studio

## LEER ESTO PRIMERO. SIEMPRE.

Eres un agente trabajando en un proyecto de rally de innovación.
Tu contexto es: `brief.json` + este archivo. Nada más hasta que hayas leído ambos.

---

## Reglas de oro (innegociables)

1. Lee `brief.json` antes de generar CUALQUIER contenido.
2. No inventes datos. Cada estadística debe existir en `research/claims.json`.
3. No repitas el nombre del proyecto más de una vez por sección del pautado.
4. Sin cards genéricas, sin morado (#7c3aed o similar), sin fuentes fuera de `brand/tokens.css`.
5. Presupuesto: solo costos de implementación superficiales — sin TIR, VAN, ROI complejo.
6. Video ≤ 120 segundos. Estructura exacta de 4 actos (ver `knowledge/rubric_latam.md`).
7. Assets nombrados: `asset_<shotlist_id>_<descripcion>.<ext>`
8. Un proceso GPU a la vez. Consulta `scripts/render_watch.py` antes de lanzar render.
9. Cada hora avisa cuánto tiempo queda y el estado de cada entregable.
10. Al llegar a T-6h, propón congelar assets y preparar exportación final.
11. Olvida proyectos anteriores. Solo existe el proyecto actual en `brief.json`.
12. No hardcodees el nombre del proyecto en scripts. Léelo siempre de `brief.json`.

---

## Modo de operación según rally_type

### Nacional (24h)
- Categorías: Tecnológica / Social / Procesos u Organizacional
- Jurado: CNU, MINJUVE, TELCOR, INATEC, MEFCCA
- Anclar a **municipio real** de Nicaragua
- Conectar con **Plan Nacional de Lucha contra la Pobreza y para el Desarrollo Humano 2022–2026**
- Mencionar ODS relevantes animados con la paleta del proyecto
- Citar **Ciudades Creativas** si el proyecto aplica
- Presupuesto puede incluir C$ (córdobas) con tasa del BCN

### Latam (28h)
- Categorías: Innovación / Impacto Social
- Jurado: académicos internacionales (NO nicaragüenses)
- El municipio es el **"laboratorio piloto"** — no el único destino
- La solución es **modular, paramétrica y replicable** en toda LATAM
- Costos siempre en **USD**
- Sin siglas gubernamentales locales que un evaluador extranjero no entienda
- Cierre del video: "piloto en [ciudad], replicable en toda América Latina"

---

## Paralelismo autorizado

Corren en paralelo (no bloquean GPU/CPU intensivamente):
- Investigación + claims.json
- Pautado (gen_pautado.py)
- Presupuesto (gen_budget.py)
- Canvas (gen_canvas.py)
- Guion (gen_script.py)
- Paleta (gen_palette.py)
- Bibliografía (gen_bibliography.py)

Un proceso a la vez (bloquea GPU/CPU):
- Render 3D (Blender headless)
- TTS (gen_voice.py)
- Grabación web (Playwright)
- Exportación de video final (ffmpeg)

---

## Anti-patrones prohibidos

- NO generar diseños "estilo IA": gradientes morados, glassmorphism, cards repetidas, bordes redondeados en todo.
- NO usar emojis como íconos en la web demo.
- NO afirmar que datos son reales si son simulados. Marcar con `[SIMULADO]` en HTML/código.
- NO hardcodear el nombre del proyecto en scripts. Leerlo siempre de `brief.json`.
- NO renderizar en resolución final hasta T-2h.
- NO poner nombre del proyecto en los primeros 20 s del video.
- NO repetir datos entre secciones del pautado.
- NO enviar a SIRLI hasta que validate_brief.py, validate_budget.py y validate_pautado.py pasen sin errores.

---

## Estructura de datos clave

```
brief.json           → fuente única de verdad
research/claims.json → [{stat, source, url, year, accessed}]
budget/budget.json   → [{element, description, units, unit_cost_usd, total, url, screenshot, date}]
script/shotlist.csv  → [id, act, description, asset_id, asset_type, duration_s, status, notes]
brand/palette.json   → {primary, secondary, accent, bg, text}
brand/tokens.css     → variables CSS derivadas de palette.json
```

---

## Checklist de entregables SIRLI/Rally

- [ ] brief.json completo y validado
- [ ] docs/pautado_draft.docx — caracteres dentro del límite
- [ ] budget/budget.xlsx — rango $4,000–$6,000 USD con URLs
- [ ] docs/canvas.md — coherente con presupuesto
- [ ] script/script.md — guion 4 actos ≤ 120 s
- [ ] assets/voice/narration.mp3 — ≤ 120 s
- [ ] Video final en YouTube (URL en brief.json → video_url)
- [ ] Web demo en GitHub Pages/Netlify (URL en brief.json → site_url)

---

## Ahorro de tokens

- Lee solo los rangos necesarios de archivos grandes.
- No vuelques logs completos. Usa `| Select-Object -First 25` en PowerShell.
- En tests usa `--tb=short -q`.
- No repitas código ya mostrado en la conversación.
- Prefiere búsquedas simbólicas sobre lectura completa de archivos.

---

## Herramientas disponibles

| Herramienta | Propósito | Cuándo |
|-------------|-----------|--------|
| Antigravity | Investigación, pautado, scripts rápidos | Cuando se necesite velocidad |
| OpenCode | Desarrollo web, 3D scripts, código largo | Cuando se necesite contexto largo |
| Chatterbox / Kokoro | TTS para narración | gen_voice.py elige automáticamente |
| Blender headless | Modelos 3D y renders | Solo con referencia visual previa |
| Playwright | Captura de web demo | Después de que site/ esté completo |
| Colormind API | Paleta desde logo | gen_palette.py |
| ffmpeg | Edición y exportación de video | Última etapa |
