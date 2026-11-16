---
name: publicar-sitio
description: Construye y publica la web demo del proyecto en GitHub Pages o Netlify. Úsala cuando el usuario quiere que su prototipo tenga una URL pública para el video o la entrega.
---

# El del Ciber del Barrio — Publicar sitio

## Navegador obligatorio (browser MCP)

Publicar y **verificar** el sitio no se hace sin el navegador.

1. Usa la sesión ya abierta del Chrome del usuario para activar GitHub Pages o
   Netlify y disparar el deploy. **Nunca pidas tokens ni credenciales.**
2. Verificación obligatoria tras publicar: abre la URL definitiva en el navegador
   MCP, comprueba que carga, que la consola no tiene errores y guarda una captura
   (`audit/site/<sha>.png`).
3. La URL solo cuenta si se vio funcionando; sin captura no se declara publicada.
4. Si el navegador MCP no está conectado, detente y pide instalar la extensión y
   abrir la sesión.
5. `handoff` solo para login/2FA; nunca resuelvas captchas.

## Cuándo usarla

- El usuario termina el prototipo y necesita una URL pública.
- Pide "súbelo", "publícalo" o "que tenga link".

## Compuerta de diseño (antes de construir)

No se construye ni publica la web demo sin cumplir esto:

1. **Plan aprobado primero:** pantallas, qué muestra cada una, qué acción simula
   y orden de aparición. Sin plan aceptado por el usuario no se escribe código.
2. **Preguntar si ya hay paleta aprobada** (`brand/palette.json`, `brand/tokens.css`)
   antes de proponer colores nuevos.
3. **Preguntas de diseño con `impeccable`** (o `ui-ux-pro-max` / `design-system`
   si no está), no de memoria. Criterios completos en
   `skills/propuesta-identidad/SKILL.md` → "Criterios de diseño de UI".
4. **Responsive obligatorio:** 375 / 768 / 1280 px verificados en el navegador,
   con captura de cada ancho.
5. **Cardless y sin genérico de IA:** sin cards por defecto, sin morado #7c3aed,
   sin glassmorphism, sin emojis como íconos. Espaciado solo con la escala de
   `DESIGN.md` (4/8/12/16/24).
6. **Se entrega un recorrido visual**, no un formulario: el sitio simula el
   producto con datos del brief. Poco contenido, cero relleno.
7. **Recursos faltantes:** `modelo-3d-blender` o un subagente los genera y quedan
   en `assets/` con el nombrado `asset_<shotlist_id>_<descripcion>.<ext>`.

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
Compartido: `skills/_comun/nombres.md`. Léelo antes de aplicar esta sección.

## Cómo enseñar visualmente
Compartido: `skills/_comun/ensenanza-visual.md`. Léelo antes de aplicar esta sección.

## Cómo redactar guiones cuidando la pronunciación y el orden de palabras
Compartido: `skills/_comun/guiones.md`. Léelo antes de aplicar esta sección.

## Cómo crear modelos 3D (referencia)
Compartido: `skills/_comun/modelos-3d.md`. Léelo antes de aplicar esta sección.

## Cómo sugerir elementos gráficos
Compartido: `skills/_comun/elementos-graficos.md`. Léelo antes de aplicar esta sección.

## Punteros

- Script: `scripts/publish_site.py`.
- Workflow de Pages: `.github/workflows/pages.yml`.
- Guía manual: `docs/INSTALACION_Y_DESPLIEGUE.md`, sección 8.
