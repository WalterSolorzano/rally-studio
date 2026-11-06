---
name: publicar-sitio
description: Construye y publica la web demo del proyecto en GitHub Pages o Netlify. Úsala cuando el usuario quiere que su prototipo tenga una URL pública para el video o la entrega.
---

# El del Ciber del Barrio — Publicar sitio

## Cuándo usarla

- El usuario termina el prototipo y necesita una URL pública.
- Pide "súbelo", "publícalo" o "que tenga link".

## Procedimiento

1. Verifica que `site/index.html` existe y abre bien en local.
2. Revisa lo mínimo antes de publicar:
   - no hay rutas absolutas rotas (`/assets/...` que solo existan en tu máquina),
   - no hay datos personales ni rutas de usuario,
   - el nombre del proyecto sale de `brief.json`, no está escrito a mano,
   - la página carga sin consola con errores.
3. Construye el sitio:

```bash
python scripts/publish_site.py
```

4. Despliegue:
   - **GitHub Pages:** activa en Settings → Pages → Source: GitHub Actions (workflow `.github/workflows/pages.yml` incluido en el repo). Luego `git add site/` y `git push`.
   - **Netlify:** instala Netlify CLI, autentícate, y corre `netlify deploy --prod --dir=site`.
   - Si no hay credenciales listas, no pidas tokens: explica los dos caminos en 4 líneas y deja el `site/` listo para que el usuario publique desde su cuenta.
   - Escribe la URL resultante en `brief.json` (`site_url`) y sirve el enlace al checklist (`--tab timeline --slot main`).

## Reglas

- Nunca publiques credenciales, `.env`, `scripts/freellmapi.key` ni el buzón de propuestas.
- No inventes una URL: si no se publicó, no hay link.
- No publiques sin que el usuario lo haya pedido explícitamente.
- No cambies el diseño del sitio en esta skill; eso es `propuesta-identidad`.

## Generación de prompts para llevar el sitio a otra IA

Cuando el usuario quiera exportar el sitio o su contenido a otra IA
(OpenAI, Claude, Gemini, OpenCode, Antigravity…), genera el prompt con esta
estructura:

```
Rol: publicador de web demo para rally de innovación.
Contexto: Proyecto <project_name>, certamen <rally_type>, sitio <site_url>.
Entrada: `site/index.html`, `brand/tokens.css`, `brief.json`.
Tarea: Verificar que el sitio existe, abre bien en local, no tiene rutas
  absolutas rotas, no tiene datos personales, y preparar el despliegue a
  GitHub Pages o Netlify.
Restricciones:
  - El nombre del proyecto sale de `brief.json`, no está escrito a mano.
  - No publiques credenciales, `.env`, `scripts/freellmapi.key` ni el buzón
    de propuestas.
  - No inventes una URL: si no se publicó, no hay link.
  - No publiques sin que el usuario lo haya pedido explícitamente.
  - Sin emojis, sin degradados estilo IA, sin glassmorphism.
  - Idioma: español.
Formato de salida: JSON con claves proyecto, sitio_existe, abre_local,
  rutas_rotas, datos_personales, nombre_desde_brief, url_publicada, despliegue.
Idioma: español.
```

## Cómo sugerir un título o nombre de proyecto o producto

Sigue los patrones reales del banco SIRLI (`research/sirli/winners.jsonl`):

- **Inventado**: NEXORA, KINETIX
- **Objeto**: AVOCADO, LUMBRE
- **Compuesto**: NEXO-SOSTENIBLE
- **Territorio + número**: ALTIPLANO 360
- **Sufijo técnico**: BIOINNOVATECH
- **Juego**: DESUCHO, ERROR 404

Reglas:
- Nunca repites el nombre del proyecto más de una vez por sección.
- No hardcodees el nombre en scripts; léelo siempre de `brief.json`.

## Cómo enseñar visualmente

- Contraste garantizado: texto claro sobre fondo oscuro, o sombra de texto
  desplazada.
- Elementos gráficos se exportan como PNG 2048×2048 con fondo transparente.
- Sin emojis como íconos en la web demo.

## Cómo redactar guiones cuidando la pronunciación y el orden de palabras

- Escribe para ser escuchado, no leído: oraciones cortas, sujeto-verbo-objeto,
  evita subordinadas encajadas.
- Acentos reales en español; acrónimos se deletrean si no son de uso común.
- Cada cambio de idea necesita una pausa o transición explícita.
- Máximo 240-270 palabras (≈130-140 WPM) para ≤ 120 s de audio.

## Cómo crear modelos 3D (referencia)

Ver `skills/modelo-3d-blender/SKILL.md` para el procedimiento completo de
modelado 3D con Blender y generación de renders para el video.

## Cómo sugerir elementos gráficos

- Sin emojis como íconos en la web demo.
- Sin cards genéricas, sin morado (#7c3aed o similar), sin fuentes fuera de
  `brand/tokens.css`.

## Punteros

- Script: `scripts/publish_site.py`.
- Workflow de Pages: `.github/workflows/pages.yml`.
- Guía manual: `docs/INSTALACION_Y_DESPLIEGUE.md`, sección 8.
