# App Android de Rally Studio

Una app de 17 KB que abre el tablero en el teléfono. No tiene más pantallas que el
tablero: no guarda datos propios, no pide cuenta, no manda nada a ningún servidor.
Es una ventana al Rally Studio que tú tengas encendido.

**Lo compilado no está en el repositorio.** Aquí solo vive el código; cada equipo
compila su propia app con su propia dirección.

## Lo único que hay que editar

`apk/app/res/values/config.xml`:

```xml
<string name="app_url" translatable="false">http://192.168.1.50:8000/</string>
```

Acepta lo que el teléfono pueda abrir:

| Caso | Valor |
|---|---|
| Servidor en la misma red | `http://192.168.1.50:8000/` |
| Túnel privado (Tailscale) | `https://algo.ts.net/` |
| Sitio publicado (GitHub Pages) | `https://usuario.github.io/repo/dashboard/` |

Si se deja `ADDR`, la app pide la dirección una vez al abrir, la guarda y la
recuerda. Sirve para probar sin recompilar; el botón **Cambiar dirección**
aparece cuando el servidor no responde.

## Compilar

Necesita JDK 17 o superior y el Android SDK (`build-tools` + cualquier
`platform`). El SDK se busca en `ANDROID_HOME`, `ANDROID_SDK_ROOT` o
`%LOCALAPPDATA%\Android\Sdk`. No hace falta Gradle ni Android Studio.

```bash
python apk/build.py                                    # plantilla que pide la dirección
python apk/build.py --url http://192.168.1.50:8000/    # app ya apuntando a tu servidor
python apk/build.py --url https://mi-sitio/ --salida MiEquipo.apk
```

`--salida` acepta un nombre (queda en `apk/build/`) o una ruta. El APK queda
firmado con una llave de depuración que el script crea la primera vez. Esa firma
sirve para instalar en un teléfono propio; para publicar en una tienda hay que
firmar con una llave real (ver abajo).

Si el SDK no está completo:

```bash
sdkmanager "platform-tools" "build-tools;35.0.0" "platforms;android-35"
```

## Lo que hace por dentro

- `MainActivity.java`: un `WebView` con JavaScript, almacenamiento del sitio y
  cookies activadas. Es lo que necesita el tablero.
- Botón atrás del teléfono → navega atrás dentro del tablero.
- Un enlace a otro dominio (un PDF externo, YouTube) se abre en el navegador,
  no dentro de la app.
- Si el servidor no responde, muestra una pantalla con **Reintentar** y
  **Cambiar dirección**. No hay pantalla en blanco.
- Permite HTTP en claro (`network_security_config.xml` y
  `android:usesCleartextTraffic`) porque el servidor del rally corre en la red
  local sin certificado. Con HTTPS no estorba.
- Sin publicidad, sin analítica, sin permisos que no use: solo `INTERNET`,
  `ACCESS_NETWORK_STATE` y `POST_NOTIFICATIONS`.

## Límites conocidos

- **Las notificaciones del sistema no funcionan dentro del WebView.** El
  tablero las pide con la API del navegador y el WebView no la implementa. La
  campana de la app sigue mostrando la bitácora dentro de la pantalla.
- Sin servidor encendido no hay tablero: esta app no trae copia propia.
- Para GitHub Pages la dirección debe ser la del subdirectorio (`/dashboard/`),
  porque el workflow publica ahí.

## Compilar a mano (sin el script)

Los pasos que ejecuta `apk/build.py`, por si hay que revisarlo:

1. `aapt2 compile --dir res -o recursos.zip`
2. `aapt2 link -o sin-firmar.apk -I android.jar --manifest AndroidManifest.xml -R recursos.zip --java gen --min-sdk-version 24 --target-sdk-version 35`
3. `javac --release 11 -cp android.jar -d clases java/**/*.java gen/**/*.java`
4. `d8 --min-api 24 --lib android.jar --output dex clases/**/*.class`
5. meter `classes.dex` en el APK
6. `zipalign -f 4` y `apksigner sign`

## Publicar una versión que se pueda descargar

```bash
python apk/build.py --url https://tu-sitio/ --salida Rally.apk
```

Subir el `.apk` a una release de GitHub (`gh release create v1 rally.apk`) o a
cualquier enlace directo. Android pedirá permitir la instalación de orígenes
desconocidos: es normal en una app fuera de la tienda.

Para firmar con tu propia llave en vez de la de depuración:

```bash
keytool -genkeypair -keystore mi-llave.jks -alias rally -keyalg RSA -keysize 2048 -validity 10000
apksigner sign --ks mi-llave.jks --out Rally.apk apk/build/alineado.apk
```
