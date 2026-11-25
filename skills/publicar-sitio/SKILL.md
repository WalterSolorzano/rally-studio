---
name: publicar-sitio
description: Construye y publica la web demo del proyecto en GitHub Pages o Netlify. Úsala cuando el usuario quiere que su prototipo tenga una URL pública para el video o la entrega.
---

# Publicar la web demo del proyecto

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

Esta skill **no define** el diseño: lo publica. Las reglas viven en sus dueñas
(`AGENTS.md` → «Mapa de dueños») y aquí solo se exigen en verde.

1. **Plan de producto aprobado.** Dueña: `skills/propuesta-producto/SKILL.md`
   (G0→G5). Compuerta: `python scripts/verificar_producto.py`.
2. **Identidad aprobada.** Dueña: `skills/propuesta-identidad/SKILL.md`.
   Compuerta: `python scripts/verificar_identidad.py --tipo <pieza>`.
3. **Pieza sin genérico de IA.** Dueña: `skills/_comun/elementos-graficos.md`.
   Compuerta: `python scripts/probar_diseno.py --tipo <pieza>`.
4. **Capas limpias.** Compuerta: `python scripts/verificar_frontera.py`.
5. **Responsive medido.** Compuerta: `python scripts/probar_responsive.py --tipo <pieza>`
   (landing 390/768/1440; app-móvil escena 1440 y pantalla 390).
6. **Recursos faltantes.** Primero `skills/_comun/recetas-visuales.md`;
   `skills/modelo-3d-blender/SKILL.md` solo para pieza física, con
   `asset_<shotlist_id>_<descripcion>.<ext>`.

Si una compuerta falla, no se publica: se corrige en la skill dueña, no aquí.

## Procedimiento

1. Verifica que `site/index.html` existe y abre bien en local. Si es el stub de
   "Prototipo pendiente de generar", primero genéralo con el paso a paso de
   `.agents/rules/proceso-obligatorio.md` §1.5:
   `python scripts/gen_site.py --tipo <pieza>` (exige identidad aprobada; landing
   exige además 3 cifras con URL) y luego `python scripts/probar_responsive.py`.
2. Revisa lo mínimo antes de publicar:
   - no hay rutas absolutas rotas (`/assets/...` que solo existan en tu máquina),
   - no hay datos personales ni rutas de usuario,
   - el nombre del proyecto sale de `brief.json`, no está escrito a mano,
   - la página carga sin consola con errores.
3. Construye el sitio:

```bash
python scripts/publish_site.py
```

   Falla si `site/` no es autocontenido (tokens y fuentes dentro, cero CDN, cero
   `../brand`).

4. Despliegue:
   - **GitHub Pages:** activa en Settings → Pages → Source: GitHub Actions (workflow `.github/workflows/pages.yml` incluido en el repo). Luego `git add site/` y `git push`.
   - **Netlify:** instala Netlify CLI, autentícate, y corre `netlify deploy --prod --dir=site`.
   - Si no hay credenciales listas, no pidas tokens: explica los dos caminos en 4 líneas y deja el `site/` listo para que el usuario publique desde su cuenta.
   - Escribe la URL resultante en `brief.json` (`site_url`) y sirve el enlace al checklist (`--tab timeline --slot main`).

## Capturas de la página para el video y el README

Las reglas de captura tienen una sola dueña: `skills/_comun/capturas.md`. Léela antes
de disparar el primer screenshot. Resumen de lo que ahí se exige: limpiar el runtime
antes de capturar, marco de navegador o bisel de teléfono, texto fuera de la imagen,
nada de fundidos, una carpeta de salida por pieza y revisar el PNG con el ojo.

## Reglas

- Nunca publiques credenciales, `.env`, `scripts/freellmapi.key` ni el buzón de propuestas.
- No inventes una URL: si no se publicó, no hay link.
- No publiques sin que el usuario lo haya pedido explícitamente.
- No cambies el diseño del sitio en esta skill; eso es `propuesta-identidad` y
  `propuesta-producto`.

## Generación de prompts para llevar el sitio a otra IA

Cuando el usuario quiera exportar el sitio o su contenido a otra IA
(OpenAI, Claude, Gemini, OpenCode, Antigravity…), genera el prompt con esta
estructura:

```
Rol: publicador de web demo para rally de innovación.
Contexto: Proyecto <project_name>, certamen <rally_type>, sitio <site_url>.
Entrada: `site/index.html`, `site/tokens.css`, `brief.json`.
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

## Cómo resolver volumen sin pedir un modelo 3D
Compartido: `skills/_comun/recetas-visuales.md`. Léelo antes de aplicar esta sección.

## Cómo crear modelos 3D (referencia)
Compartido: `skills/_comun/modelos-3d.md`. Léelo antes de aplicar esta sección.

## Cómo sugerir elementos gráficos
Compartido: `skills/_comun/elementos-graficos.md`. Léelo antes de aplicar esta sección.

## Punteros

- Script: `scripts/publish_site.py`.
- Workflow de Pages: `.github/workflows/pages.yml`.
- Guía manual: `docs/INSTALACION_Y_DESPLIEGUE.md`, sección 8.
- Capturas para video y README: `skills/_comun/capturas.md`.
