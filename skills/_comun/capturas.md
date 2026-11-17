## Cómo capturar la página para el video y el README

Publicar no es el final: el sitio casi siempre termina en el video o en el README, y
ahí se juzga por la captura, no por la URL. Una captura suelta parece un recorte de
pantalla; la misma captura dentro de un marco y sin ruido parece producto.

### 1. Limpia la pantalla antes de disparar

- Captura en **2× escala de dispositivo** (escritorio 1440×900 @2×; móvil 390×844 @3×).
  A 1× el texto se ve sucio al escalarlo en el video.
- Fuera de cuadro lo que no vende: barra de sincronización, toasts, banners de "modo
  demo", scrollbars, cursores, badge de entorno, botones de configuración inicial.
- El estado escrito en runtime (avisos de sync, "consultando…") **no se oculta con
  CSS**: se oculta por contenido con JS después de cargar, y se verifica en el PNG.
- Nada truncado (`Auditoría ...`) ni solapado (barra inferior encima del contenido).
  Se comprueba leyendo la imagen, no el DOM.
- A 390 px la app real puede tener solapes (un botón de borrar encima del texto, avisos
  de método ocupando media pantalla). Se ocultan **por selector en la captura**; el
  código de la app no se toca.

### 2. Siempre dentro de un marco de dispositivo

- Escritorio: marco de navegador con tres puntos y barra de URL.
- Móvil: bisel de teléfono con notch; `is_mobile=True`, `has_touch=True` y UA de iPhone,
  si no el layout "móvil" es una ventana angosta disfrazada.

### 3. El texto vive fuera de la imagen

- Dentro de la captura solo el texto que ya es parte de la UI.
- Títulos, pasos y pies de foto van en el README o en la plantilla del video.
- Si de verdad hace falta texto en la pieza, mínimo: un rótulo, una cifra.
- Nunca nombres de archivo (`.md`, `.pdf`, `grafo.json`) dentro de una figura: parece
  markdown filtrado.

### 4. Scroll largo (mostrar varias pantallas en una)

- Captura **la página completa** (`full_page=True`); cortar a un alto fijo parte frases
  y filas de tabla por la mitad y se lee como app rota.
- Corta cada tramo donde el layout respira (franja en blanco de lado a lado), no donde
  cae el número del alto. Si no hay franja quieta, busca la más cercana al objetivo.
- La barra fija se repite en cada tramo: recorta solo su alto en los tramos 2..n y deja
  una sola cabecera arriba de la pieza.
- Costura: banda de fundido blanco ancho (~60 px @3×). El crossfade de contenido deja
  **texto fantasma** (dos UIs legibles sobrepuestas): no se usa.
- Móvil: se puede mostrar todo el recorrido en un solo teléfono largo aunque la app real
  no apile esas pantallas; la gente entiende que es scroll.
- Simplificar la UI dentro de la captura vale solo para marketing. Una captura que
  documente el producto real se toma tal cual o se marca.

### 5. GIF de pantallas

- Entre dos capturas de UI, **nunca fundido cruzado**: se apilan las dos y se desplaza
  verticalmente la ventana, 4 pasos con easing suave (~50 ms por paso).
- Ritmo: ~900 ms por pantalla quieta, ~200 ms de transición.
- Los rótulos de cada pantalla se generan con la pieza y se leen de **una sola carpeta
  de salida**. Dos carpetas = se publican rótulos viejos sin avisar.
- Verifica el GIF como hoja de contactos: primer frame, una transición y el último.

### 6. Figuras del corpus (grafos y atlas)

- Un force-layout crudo de cientos de nodos es una bola de pelos: no se lee, no vende y
  los rótulos sobre el núcleo son ilegibles. Se publica con **layout estable** (ruedas o
  cunas por comunidad) y los nombres **fuera** del dibujo, con línea guía al centroide.
- En fondo oscuro, el texto y los datos son **blancos** (`#FFFFFF`, `#9AA9BE`), nunca
  azules sobre azul. El cyan se reserva para el acento, no para números.
- Composiciones y color de la figura salen de `brand/tokens.css`; nada de morado.

### 7. Verificación y destino

- Revisa el PNG generado con el ojo: solapamientos, truncados, imágenes que no cargaron,
  tipografías de reserva.
- Si la demo usa datos de ejemplo, la pieza lo marca `[SIMULADO]` **fuera** del área
  capturada.
- Guarda en una sola carpeta (`assets/readme/` o `audit/site/`) con el nombre de la
  pantalla, no con un hash.
- Con la captura en mano, actualiza el checklist (`--tab timeline --slot main`) y, si va
  al video, la fila de tomas (`script/shotlist.csv`).

### Receta mínima (Playwright)

```python
ctx = browser.new_context(viewport={"width": 390, "height": 844},
                          device_scale_factor=3, is_mobile=True, has_touch=True,
                          user_agent="Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 ...)")
page.add_style_tag(content=CLEAN_CSS)   # oculta sync, toasts, scrollbars
page.evaluate(CLEAN_JS)                 # oculta por texto lo escrito en runtime
page.screenshot(path="assets/readme/app_movil.png")
page.screenshot(path="assets/readme/app_movil_full.png", full_page=True)
```

Escritorio: 1440×900 @2×. Móvil: 390×844 @3×.
