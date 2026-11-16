/* notify.js -- Notificaciones del teléfono.
 *
 * Tres hechos avisan: la IA entregó algo, alguien del equipo tocó una sección
 * y entró una persona nueva. El resto de la app no sabe de permisos: emite
 * `rally:aviso` en el documento y este archivo decide si suena.
 *
 * Reglas:
 * - El permiso se pide con un toque (el navegador lo exige), nunca al cargar.
 * - Un mismo aviso se notifica una sola vez, aunque el sondeo lo repita.
 * - Sin permiso, sin Notification o sin service worker: silencio, la bitácora
 *   dentro de la app sigue funcionando igual.
 */
(function (global) {
  "use strict";

  var CLAVE = "rally_notify";
  var VISTOS = "rally_notify_vistos";
  var TOPE_VISTOS = 200;
  var ICONO = "assets/app-icon-192.png";
  var EVENTO = "rally:aviso";

  var DEFECTO = {
    activo: false,
    propuesta: true, // la IA propone algo que hay que aceptar
    avance: true,    // la IA terminó un paso (solo bitácora)
    cambio: true,    // alguien actualizó una sección o un archivo
    equipo: false    // alguien entró al proyecto
  };

  var historial = []; // lo ya lanzado en esta pestaña (para probar)

  // Segunda fuente, sin backend: un archivo que los agentes escriben y que la
  // app lee cada 30 s. En local lo sirve `rally_service.py`; en GitHub Pages lo
  // publica el push. Si el archivo no existe, se deja de buscar.
  var ARCHIVO = "data/avisos.json";
  var CADA_ARCHIVO = 30000;
  var buscandoArchivo = true;

  function leer(clave, porDefecto) {
    try {
      var raw = global.localStorage.getItem(clave);
      if (!raw) return porDefecto;
      var dato = JSON.parse(raw);
      return dato && typeof dato === "object" ? dato : porDefecto;
    } catch (e) {
      return porDefecto;
    }
  }

  function escribir(clave, valor) {
    try {
      global.localStorage.setItem(clave, JSON.stringify(valor));
    } catch (e) {
      /* modo privado: las notificaciones duran lo que dura la pestaña */
    }
  }

  function prefs() {
    var guardado = leer(CLAVE, {});
    var salida = {};
    for (var k in DEFECTO) {
      salida[k] = typeof guardado[k] === "boolean" ? guardado[k] : DEFECTO[k];
    }
    return salida;
  }

  function guardar(cambios) {
    var siguiente = prefs();
    if (cambios && typeof cambios === "object") {
      for (var k in cambios) {
        if (k in DEFECTO && typeof cambios[k] === "boolean") siguiente[k] = cambios[k];
      }
    }
    escribir(CLAVE, siguiente);
    return siguiente;
  }

  function soportado() {
    return typeof global.Notification === "function";
  }

  function permiso() {
    if (!soportado()) return "no-soportado";
    return global.Notification.permission || "default";
  }

  function pedir() {
    if (!soportado()) return Promise.resolve("no-soportado");
    var estado = permiso();
    if (estado === "granted") {
      guardar({ activo: true });
      return Promise.resolve("granted");
    }
    if (estado === "denied") return Promise.resolve("denied");
    return global.Notification.requestPermission().then(function (r) {
      guardar({ activo: r === "granted" });
      return r;
    });
  }

  function vistos() {
    var lista = leer(VISTOS, []);
    return Array.isArray(lista) ? lista : [];
  }

  function marcar(id) {
    var lista = vistos();
    if (lista.indexOf(id) !== -1) return false;
    lista.push(id);
    escribir(VISTOS, lista.slice(-TOPE_VISTOS));
    return true;
  }

  function cuerpo(detalle) {
    var texto = String(detalle.texto || "").trim();
    if (texto) return texto.length > 140 ? texto.slice(0, 137) + "…" : texto;
    if (detalle.tipo === "propuesta") return "Propuesta nueva de " + (detalle.fuente || "la IA");
    if (detalle.tipo === "cambio") return "Se actualizó " + (detalle.slot || "una sección");
    if (detalle.tipo === "equipo") return "Alguien se sumó al proyecto";
    return "Nuevo avance";
  }

  function permitido(detalle, p) {
    if (!p.activo) return false;
    if (detalle.tipo === "avance" && !p.avance) return false;
    if (detalle.tipo === "propuesta" && !p.propuesta) return false;
    if (detalle.tipo === "cambio" && !p.cambio) return false;
    if (detalle.tipo === "equipo" && !p.equipo) return false;
    return true;
  }

  function insignia() {
    try {
      if (navigator.setAppBadge) {
        var n = (global.state && Array.isArray(global.state.avisos)) ? global.state.avisos.length : 0;
        if (n > 0) navigator.setAppBadge(n);
      }
    } catch (e) {}
  }

  function lanzar(detalle) {
    var titulo = String(detalle.titulo || "Rally Studio");
    var opciones = {
      body: cuerpo(detalle),
      icon: ICONO,
      badge: ICONO,
      tag: String(detalle.id || ""),
      renotify: true,
      vibrate: [40, 60, 40],
      data: { url: String(detalle.url || ""), tab: String(detalle.tab || ""), slot: String(detalle.slot || "") }
    };

    // Rastro para probar sin depender del centro de notificaciones del sistema:
    // el navegador puede aceptar el aviso y no dibujarlo (modo headless, Windows
    // sin notificaciones activas). Lo que sí es seguro es qué se le pidió.
    historial.push({ titulo: titulo, cuerpo: opciones.body, tipo: String(detalle.tipo || ""), ts: Date.now() });
    if (historial.length > 20) historial.shift();

    if (!global.navigator || !global.navigator.serviceWorker) {
      try { new global.Notification(titulo, opciones); } catch (e) {}
      return;
    }
    global.navigator.serviceWorker.getRegistration().then(function (reg) {
      if (reg && reg.active && reg.showNotification) {
        reg.showNotification(titulo, opciones);
      } else {
        try { new global.Notification(titulo, opciones); } catch (e) {}
      }
    }).catch(function () {
      try { new global.Notification(titulo, opciones); } catch (e) {}
    });
  }

  function emitir(a) {
    if (!a || !a.id) return;
    var detalle = {
      tipo: String(a.tipo || "avance"),
      id: String(a.id),
      titulo: String(a.titulo || a.title || "Rally Studio"),
      texto: String(a.texto || a.text || ""),
      tab: String(a.tab || ""),
      slot: String(a.slot || ""),
      fuente: String(a.fuente || a.source || ""),
      url: String(a.url || "")
    };
    alAviso({ detail: detalle });
  }

  function leerArchivo() {
    if (!buscandoArchivo) return;
    global.fetch(ARCHIVO, { cache: "no-store" })
      .then(function (r) {
        if (r.status === 404) {
          buscandoArchivo = false; // nadie está publicando avisos aquí
          return null;
        }
        return r.ok ? r.json() : null;
      })
      .then(function (dato) {
        if (!dato) return;
        var lista = Array.isArray(dato) ? dato : (Array.isArray(dato.avisos) ? dato.avisos : []);
        for (var i = 0; i < lista.length; i++) emitir(lista[i]);
      })
      .catch(function () {
        /* red caída o JSON a medio escribir: el próximo ciclo reintenta */
      });
  }

  function alAviso(ev) {
    var detalle = (ev && ev.detail) || {};
    var p = prefs();
    if (!permitido(detalle, p)) return;
    if (permiso() !== "granted") {
      // Sin permiso no hay notificación del sistema: el aviso ya quedó en la
      // bitácora, pero se pide permiso la próxima vez que el usuario toque.
      guardar({ activo: false });
      return;
    }
    if (!marcar(String(detalle.id || ""))) return;
    lanzar(detalle);
    insignia();
  }

  function probar() {    lanzar({
      id: "prueba-" + Date.now(),
      titulo: "Rally Studio",
      texto: "Así se ven los avisos de tus agentes",
      tipo: "avance",
      url: ""
    });
  }

  document.addEventListener(EVENTO, alAviso);

  // Lectura del archivo: espera dos segundos para no competir con la carga del
  // tablero y luego sigue cada 30 s mientras la pestaña exista.
  setTimeout(function () {
    leerArchivo();
    global.setInterval(leerArchivo, CADA_ARCHIVO);
  }, 2000);

  global.RallyNotificar = {
    prefs: prefs,
    guardar: guardar,
    pedir: pedir,
    permiso: permiso,
    soportado: soportado,
    probar: probar,
    emitir: emitir,
    refrescarArchivo: leerArchivo,
    _historial: function () { return historial.slice(); }
  };
})(window);
