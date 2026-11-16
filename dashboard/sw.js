/* Rally Studio — capa de instalación (PWA / APK vía WebView o PWABuilder).
 *
 * Regla única: el estado nunca se sirve de caché. Lo que se cachea es el
 * cascarón (html, css, js, iconos). Así el teléfono abre sin red, pero en
 * cuanto hay red pide la versión viva al servidor: los cambios que publica la
 * IA madre no pueden quedar atrapados en una copia vieja.
 */
var CACHE = "rally-studio-v3";
var CASCARON = [
  "./",
  "./index.html",
  "./style.css",
  "./app.js",
  "./challenge_parser.js",
  "./section_sync.js",
  "./content_bridge.js",
  "./presence.js",
  "./notify.js",
  "./super_agents.css",
  "./super_agents.js",
  "./manifest.webmanifest",
  "./assets/app-icon-192.png",
  "./assets/app-icon-512.png",
  "./entregables/index.html",
];

self.addEventListener("install", function (evento) {
  evento.waitUntil(
    caches.open(CACHE).then(function (c) {
      return c.addAll(CASCARON).catch(function () {
        /* un archivo que falte no debe impedir la instalación */
      });
    }).then(function () {
      return self.skipWaiting();
    })
  );
});

self.addEventListener("activate", function (evento) {
  evento.waitUntil(
    caches.keys().then(function (claves) {
      return Promise.all(
        claves.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); })
      );
    }).then(function () {
      return self.clients.claim();
    })
  );
});

self.addEventListener("fetch", function (evento) {
  var pedido = evento.request;
  if (pedido.method !== "GET") return;

  var url = new URL(pedido.url);
  // Otro origen (fuentes, CDN) y el API viven fuera de la caché.
  if (url.origin !== self.location.origin) return;
  if (url.pathname.indexOf("/api/") === 0) return;
  // Descargas de entregables: siempre del servidor, nunca una copia rancia.
  if (/\.(pdf|xlsx|csv|docx|mp4|webm|json)$/i.test(url.pathname)) return;

  evento.respondWith(
    fetch(pedido)
      .then(function (respuesta) {
        if (respuesta && respuesta.ok) {
          var copia = respuesta.clone();
          caches.open(CACHE).then(function (c) { c.put(pedido, copia); });
        }
        return respuesta;
      })
      .catch(function () {
        return caches.match(pedido).then(function (guardado) {
          return guardado || caches.match("./index.html");
        });
      })
  );
});

/* Tocar la notificación abre la app en el aviso que la produjo. */
self.addEventListener("notificationclick", function (evento) {
  evento.notification.close();
  var datos = (evento.notification && evento.notification.data) || {};
  var destino = datos.url || "./";
  evento.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then(function (ventanas) {
      for (var i = 0; i < ventanas.length; i++) {
        var v = ventanas[i];
        if (destino && destino !== "./" && v.navigate) {
          return v.focus().then(function () { return v.navigate(destino); }).catch(function () { return v.focus(); });
        }
        if (v.focus) return v.focus();
      }
      return self.clients.openWindow(destino || "./");
    })
  );
});
