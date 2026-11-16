# App en el teléfono, actualizada desde la PC, sin pagar y sin localhost

Pregunta: ¿se puede tener una app en Android que se actualice desde la PC madre del
proyecto, gratis?

Respuesta corta: **sí, y no hace falta app.** `script/teleprompter.html` es un solo
archivo con todo dentro. Se copia al teléfono, se abre con Chrome y funciona; graba,
escucha el micrófono y muestra las referencias. Actualizar es volver a copiar el archivo.
Costo: cero. Cuenta: ninguna. Servidor: ninguno. Nada expuesto a la red del evento.

## Medido en esta máquina (no es teoría)

Archivo copiado solo a una carpeta vacía y abierto como `file:///.../plan.html`,
Chrome de escritorio, viewport 390×844:

| prueba | resultado |
|---|---|
| peticiones a la red al abrir | **0** |
| `window.isSecureContext` | **`true`** |
| `navigator.serviceWorker` | `object` |
| `navigator.mediaDevices.getUserMedia` | `function` |
| `window.MediaRecorder` | `function` |
| `SpeechRecognition` | `function` |
| icono y manifest | incrustados en base64 (0 archivos hermanos) |
| tomas y miniaturas pintadas | 6 y 6 |
| desbordamiento horizontal | 0 |
| errores de consola | 0 |

Antes el HTML pedía `manifest.webmanifest` e `icono-192.png` al lado. Ya no: el
generador los incrusta en base64, así que el archivo es autosuficiente. Los sigue
escribiendo también en disco por si se abre por HTTP, pero para el teléfono sobran.

Contraste con servirlo por la red local (probado antes en `192.168.1.50`):
`isSecureContext = false` y `navigator.serviceWorker = undefined`, porque HTTP en una IP
no es origen seguro. Ahí sí haría falta HTTPS propio. Como archivo suelto, no.

## Camino recomendado: cero servidores

1. En la PC: `python skills/guion-storyboard/gen_teleprompter.py`
   → `script/teleprompter.html` (un solo archivo, ~250 kB con las referencias dentro).
2. Pasarlo al teléfono como cualquier archivo: cable USB, Google Drive, Telegram
   (enviado a ti mismo), correo. No hay nada que configurar.
3. Abrirlo con Chrome. Menú ⋮ → *Agregar a pantalla de inicio* si se quiere un ícono.
4. Para actualizar: se regenera en la PC y se copia otra vez. Sobrescribe el anterior.

Por qué esto resuelve lo que molestaba de localhost: el archivo no vive en ninguna red,
no se anuncia en la wifi del evento, no hay puerto abierto ni IP que cambiar cuando la
PC cambia de red, y nadie más que tenga el teléfono puede verlo.

## Límite honesto de `file://`

Medido en Chrome de escritorio. En **Chrome de Android** el archivo se abre bien desde
un gestor de archivos que entregue la ruta real (`file://`), pero algunos gestores
entregan `content://`, y en ese caso Chrome lo muestra como descarga. Dos salidas
completas, sin pagar:

- **Abrir desde el gestor de archivos con "Abrir con → Chrome"** (Files by Google
  normalmente entrega `file://`).
- **Servir el archivo desde la PC a un solo teléfono**, en la misma wifi, con
  `python tools/servir_rodaje.py`. Funciona, pero es lo que se quería evitar: expone la
  página en la red local. Queda como último recurso, no como norma.

## Si algún día hace falta una URL fija (opcional, gratis)

| camino | actualiza | costo | traba |
|---|---|---|---|
| Archivo suelto en el teléfono (recomendado) | copiando de nuevo | 0 | nada expuesto; el archivo no se sincroniza solo |
| `file://` + carpeta sincronizada por USB | al copiar | 0 | requiere cable |
| Cloudflare Pages / Netlify (arrastrar el HTML) | al volver a subir | 0 | URL pública: quien la tenga la ve; protección con clave es de pago |
| GitHub Pages | con cada push | 0 | repositorio público o cuenta de pago para privado |
| APK propio que se baja la versión nueva | **no en silencio** | 0 | Android exige confirmar cada instalación (`REQUEST_INSTALL_PACKAGES`); instalar sin preguntar requiere `INSTALL_PACKAGES`, permiso de sistema, o ser device owner |
| PWA con service worker | sí, offline | 0 | exige HTTPS; con `file://` no aplica y por HTTP local está bloqueado (medido) |
| Play Store (internal testing) | sí | ~25 USD una vez | no es gratis |

Ninguna de las filas con costo entra en "no pagaré nada". La primera sí, y es la que
menos expone el proyecto.

## Si no se quiere ni la app

`python tools/exportar_pdf.py` → `script/guion_rodaje.pdf`. Se imprime o se mira en el
teléfono y se graba con la cámara nativa, nombrando el archivo con el id de la toma
(`S03.mp4`). Detalle de calidad y de dónde queda cada cosa: `docs/RODAJE.md`.

## Qué cambió en el código por esto

- `gen_teleprompter.py`: `bloque_pwa()` incrusta icono (192 y 512, dibujado con PIL en
  memoria) y manifest como `data:` URI; `escribir_manifest()` sigue dejando los archivos
  en disco solo para el caso HTTP. Sin dependencias nuevas.
- `plantilla_teleprompter.html`: el `<head>` tiene el marcador `<!--__PWA__-->` en vez de
  dos rutas relativas.
- `tools/servir_rodaje.py`: se queda como opción secundaria, no como camino principal.
