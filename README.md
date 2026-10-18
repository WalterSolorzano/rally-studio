# PROYECTO EJEMPLO -- EQUIPO EJEMPLO

> **Certamen:** Rally NACIONAL (24 horas continuas)  
> **Sede / Universidad:** Universidad de Ejemplo (Managua, Nicaragua)  
> **Categoria:** Tecnologica | **Desafio #00:** Desafío de ejemplo  
> **Alineacion Estrategica:** ODS11 | **Eje Plan Nacional:** Eje 1: Nicaragua Creativa  
> **Ultima sincronizacion:** 18/10/2026 (generado automaticamente por Rally Studio)

---

## 1. Tesis y Resumen Ejecutivo
**Sistema que resuelve el problema X usando tecnología Y para beneficiar a Z.**

Este repositorio contiene la arquitectura completa de ingenieria, documentacion pautada oficial, estudio de prefactibilidad economica sustentada, matriz Canvas, guion audiovisual de 120 segundos y recursos multimedia requeridos por el sistema de evaluacion SIRLI.

---

## 2. Estado de Entregables Oficiales (Auditoria en Vivo)

- [x] **Fuente Unica de Verdad:** `brief.json` configurado y validado.
- [x] **Identidad y Tokens:** `brand/palette.json` y `brand/tokens.css` (Contraste WCAG AA).
- [x] **Evidencia e Investigacion:** `research/claims.json` con fuentes verificables.
- [x] **Reporte Pautado Oficial:** `docs/pautado_draft.docx` (limite estricto de caracteres).
- [x] **Presupuesto Mayorista:** `budget/budget.xlsx` ($4,000 - $6,000 USD con enlaces y flete).
- [x] **Modelo Canvas:** `docs/canvas.md` coherente con costos y propuesta de valor.
- [x] **Referencias APA 7:** `docs/bibliography.md` con declaracion etica de uso de IA.
- [x] **Guion de Produccion:** `script/script.md` estructurado en 4 actos (120s exactos).
- [x] **Pista Guia de Locucion:** `assets/voice/narration.wav` o `.mp3`.
- [x] **Plataforma Web Demo:** Desplegada en `site/` (GitHub Pages / Netlify).

---

## 3. Toolkit de Comandos de Automatizacion

Todos los scripts operan de manera sincronizada y alimentan el dashboard local:

```bash
# Entrevista y Validacion de Brief
python scripts/init_brief.py            # Entrevista inicial guiada
python scripts/validate_brief.py        # Validador previo a generacion

# Identidad Visual y Scoring
python scripts/gen_palette.py brand/logo.png  # Extraccion de paleta y tokens CSS
python scripts/score_challenges.py      # Ranking predictivo de desafios 2014-2026

# Documentos Ejecutivos
python scripts/gen_pautado.py --clean   # Generador de pautado Word oficial
python scripts/validate_pautado.py      # Conteo auditado de caracteres con espacios
python scripts/gen_budget.py            # Generador de hoja Excel formal
python scripts/validate_budget.py       # Auditoria de URLs y coherencia de costos
python scripts/gen_canvas.py            # Generador de Business Model Canvas
python scripts/gen_bibliography.py      # Generador de bibliografia APA 7

# Produccion Audiovisual y Narrativa
python scripts/gen_script.py            # Guion 4 actos + shotlist.csv + locucion
python scripts/gen_voice.py             # Sintesis de voz adaptativa (Chatterbox / Kokoro)

# Monitor y Control de Tiempo
python scripts/render_watch.py          # Monitor de RAM/CPU para prevenir cuelgues
python scripts/rally_clock.py           # Cronometro regresivo y alertas criticas

# Publicacion y Despliegue
python scripts/gen_readme.py            # Actualizar esta biblia del proyecto
python scripts/publish_site.py          # Despliegue de demo a Netlify / Pages
```

---

## 4. Reglas Innegociables para Agentes de IA (`AGENTS.md`)
1. **Unica Fuente:** Ningun modulo ni redactor hardcodea datos; todo se lee de `brief.json` y `claims.json`.
2. **Cero Clichés de IA:** Prohibido el uso de gradientes morados, cards repetidas, sombras difusas o texto inflado.
3. **Puntuacion Estrategica:** Los ultimos 25 segundos del video y el pautado deben coincidir al 100% en costos unitarios y métricas.
4. **Respeto de Tiempos:** Subir el video a YouTube al menos 45 minutos antes del cierre de SIRLI.
