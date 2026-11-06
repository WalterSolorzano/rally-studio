# Plan: README pulido — "vende la idea completa"

## Objetivo
Pulir README.md (y brain/README.md) para que sea una presentación de ventas completa del sistema: imágenes reales de la interfaz, GIF de funcionamiento, representaciones visuales, pruebas verificables y copia que venda el valor. Todo en español, sin inventar capturas que no existan.

## Alcance (solo archivos existentes; sin motor nuevo)
1. `PLAN_README_PULIDO.md` — este plan.
2. `assets/gif/funcionamiento.gif` — GIF animado construido con capturas REALES existentes (`docs/img/01-inicio.png`, `docs/img/03-arquitectura.png`, `docs/img/05-flujo.png`, `dash-pautado.png`, `dash-resumen.png`) usando el ffmpeg embebido de imageio. Si falla, se omite y se dejan capturas estáticas.
3. `README.md` — reestructura completa:
   - Hero: logo, badges, valor en una frase, CTA de instalación.
   - "El problema que resuelve" (venta del dolor: 3:00 AM, caos, descalificación).
   - "El sistema en acción" con capturas reales + GIF.
   - Flujo de trabajo (arquitectura + 13 etapas visual).
   - Los 16 asistentes (tabla ya existente, se mantiene).
   - Pruebas y validación: resultados reales de `python smoke.py` (6/6) y `arsenal.py check-todo`.
   - Certámenes lado a lado (Latam 28h USD vs Nacional 24h C$).
   - Entregables SIRLI checklist.
   - Instalación en 1 minuto.
   - Stack y límites honestos (no es oficial, no promete ganar).
4. `brain/README.md` — sección "El cerebro": grafo del conocimiento (imagen `graphify_knowledge_graph.png`), stats (294 nodos, 272 aristas, 34 comunidades), para qué sirve.
5. `git add`, commit, push a origin main.

## Criterios de aceptación
- README.md se lee como una landing de producto (dolor → solución → pruebas → cómo empezar).
- Al menos 3 imágenes reales del sistema embebidas.
- Sección de pruebas con salida real de comandos ejecutados (no inventada).
- brain/README.md menciona el grafo con su imagen y cifras.
- Commit subido a `origin main` y `git status` limpio salvo `design/kit.html` (pre-existente, ajeno).

## Riesgos
- ffmpeg embebido solo accesible por ruta absoluta larga; si el GIF no compila, avanzo sin él.
- No inventar estadísticas de victoria; solo usar `research/claims.json`.
