---
name: sharktank
description: Úsala cuando el equipo tenga una idea de proyecto (reto + solución) y pida ver sus fallas, riesgos o puntos débiles antes de avanzar; también cuando pregunte "¿esto aguanta?", "¿qué puede salir mal?", "¿algo así ya existe?" o "¿ya está patentado?".
---

# Sharktank — salud de la idea

Detector de fallas de la idea, **no juez**. No simula jurado, no da puntaje, no obliga a
criticar: si algo está sólido, se dice sólido. Fallas de la idea inicial, no exigencia de
implementación perfecta. La auditoría contra la rúbrica la hace `auditar-entregable`.

## Entrada

1. `brief.json` (reto, `rally_type`, proyecto). Si está vacío, pedir al usuario: reto,
   solución en 5 líneas y contexto del municipio/población.
2. **Local-first:** leer `research/claims.json`, `knowledge/retos_razonamiento.json` y el
   pautado ya escrito antes de tocar la web. Lo que está en el repo no se vuelve a buscar.

## Análisis — 4 lentes

1. **Lógica:** ¿resuelve la causa o el síntoma? Lista explícita de supuestos sin probar.
2. **Técnica:** ¿los componentes prometen lo que pueden? ¿el mecanismo cierra?
3. **Social:** quién adopta, quién mantiene, quién pierde si funciona.
4. **Económica:** quién paga de verdad, costo recurrente, dependencia política.

Reglas de tono:

- Cada hallazgo: **Qué puede fallar** → **Por qué** (hecho con fuente o supuesto marcado) →
  **Qué lo mitigaría** (una frase).
- Separar `Hecho` (fuente en `claims.json` o web) de `Supuesto` (sin datos). Supuesto no es
  hallazgo fatal: es lo que hay que validar.
- Etiquetar `idea` (la premisa no cierra) vs `implementación` (detalles de ejecución que se
  resuelven después). Solo lo primero es urgente.
- Sección corta **"Lo que ya aguanta"** con 3–5 puntos.
- Máximo 8 hallazgos; el resto se agrupa. Sin puntajes, sin probabilidades de victoria.

## Barrido profundo de patentes y proyectos parecidos

Guardas anti-tokens (obligatorias):

- Nada de web para lo ya cubierto por `claims.json` o el corpus.
- **Una query por ángulo**, sin repetir sinónimos. Ángulos: mecanismo, campo de aplicación,
  formato de producto (patente / app / startup / ONG).
- Fuentes: Google Patents, WIPO PatentScope, Lens.org. Si el skill externo
  `uspto-database` está instalado, usar su metodología de consulta oficial USPTO; si no,
  mismas reglas: registro oficial, no blogs.
- Cada coincidencia: **número de publicación**, año, titular, una frase de diferencia con
  el proyecto. Sin número → marcar `sin número verificado`.
- Tras 6 queries bien formadas sin coincidencias claras, declarar
  "sin coincidencias claras en las fuentes consultadas". **Nunca inventar patentes.**

## Salida

1. PDF con el diseño del sistema (`brand/tokens.css`: primary #1d45b9, secondary #f81110,
   accent #2aa7ad; sin morado, sin cards genéricas, sin emojis):

   ```bash
   python scripts/gen_sharktank_pdf.py --payload sharktank_payload.json
   ```

   Sale en `docs/sharktank_<slug>.pdf`. Payload:

   ```json
   {
     "project": "…", "rally": "latam|nacional", "date": "YYYY-MM-DD",
     "summary": "párrafo del estado de la idea",
     "solid": ["…"],
     "findings": [
       {"area": "lógica|técnica|social|económica", "severity": "idea|implementación",
        "type": "hecho|supuesto", "title": "…", "why": "…", "mitigation": "…"}
     ],
     "prior_art": [
       {"publication": "US…/WO…", "year": 2021, "holder": "…", "difference": "…"}
     ],
     "queries": ["query usada"]
   }
   ```

2. Servir a la ventana para que el humano acepte o descarte:

   ```bash
   python scripts/servir_propuesta.py --tab solution --slot main --kind text \
     --title "Sharktank: fallas de la idea" --source "sharktank" --payload sobre.json
   ```

   El `sobre.json` lleva `{"text": "<resumen en 10 líneas + ruta del PDF>"}`. El PDF se
   conserva en `docs/` aunque el usuario descarte en la ventana.

## Errores comunes

- Inventar números de patente → invalida todo el informe.
- Obligar a crítica: "no encontré fallas claras" es un resultado válido.
- Tratar una duda de implementación como falla de la idea.
- Gastar queries web en datos que ya están en `research/claims.json`.
