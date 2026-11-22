/* Puerta de acceso del proyecto.
 *
 * Una sola forma visible: nombre y clave. La llave maestra vive en un
 * desplegable al pie y solo se necesita la primera vez, para abrir un
 * proyecto recien creado.
 *
 * La sesion queda en una cookie HttpOnly que pone el servidor: los scripts
 * de la pagina no pueden leerla ni robarla.
 */
(function () {
  "use strict";

  var params = new URLSearchParams(location.search);
  var volver = (params.get("volver") || "").trim();
  var form = document.getElementById("puerta-form");
  var formLlave = document.getElementById("puerta-form-llave");
  var panelLlave = document.getElementById("puerta-panel-llave");
  var llave = document.getElementById("puerta-llave");
  var nombre = document.getElementById("puerta-nombre");
  var persona = document.getElementById("puerta-persona");
  var clave = document.getElementById("puerta-clave");
  var verBtn = document.getElementById("puerta-ver");
  var boton = document.getElementById("puerta-entrar");
  var botonLlave = document.getElementById("puerta-entrar-llave");
  var estado = document.getElementById("puerta-estado");
  var nota = document.getElementById("puerta-nota");
  var miembros = document.getElementById("puerta-miembros");

  // GitHub Pages y Netlify no tienen servidor: no hay /api/entrar ni llave maestra.
  // En ese caso la llave se comprueba en el navegador. Ojo: eso NO protege nada
  // (el sitio es publico); solo evita miradas casuales. La llave por defecto es
  // `rally-latam-2026` y el valor guardado es su SHA-256.
  var ESTATICO =
    /(^|\.)github\.io$/i.test(location.hostname) ||
    /(^|\.)netlify\.app$/i.test(location.hostname) ||
    /(^|\.)pages\.dev$/i.test(location.hostname) ||
    location.protocol === "file:" ||
    /[?&]estatico=1/.test(location.search);
  var LLAVE_ESTATICA_SHA256 = "21d70e7f8425a06e794a985ce2b1b5974a49f1e8e390ff0db73382cf9c033eed";

  function huella(texto) {
    // Sin crypto.subtle (contexto no seguro) no se puede comprobar la llave.
    // Devolver "" la marcaba como incorrecta y culpaba a quien escribía la buena.
    if (!(window.crypto && crypto.subtle)) return Promise.reject(new Error("sin-crypto"));
    return crypto.subtle.digest("SHA-256", new TextEncoder().encode(texto))
      .then(function (buf) {
        return Array.prototype.map.call(new Uint8Array(buf), function (b) {
          return ("0" + b.toString(16)).slice(-2);
        }).join("");
      });
  }

  function decir(texto, tono) {    estado.textContent = texto || "";
    if (tono) estado.setAttribute("data-tono", tono);
    else estado.removeAttribute("data-tono");
  }

  if (ESTATICO) {
    // Sin servidor solo existe la llave: la forma de nombre y clave no aplica.
    nota.textContent = "Modo estático · sin servidor";
    miembros.textContent = "la llave se comprueba en tu navegador, no protege el contenido";
    llave.placeholder = "Tu llave";
    nombre.style.display = "block";
    panelLlave.open = true;
    form.hidden = true;
    boton.disabled = true;
    formLlave.addEventListener("submit", function (evento) {
      evento.preventDefault();
      var valor = (llave.value || "").trim();
      if (!valor) {
        decir("Escribe tu llave.", "error");
        llave.focus();
        return;
      }
      botonLlave.disabled = true;
      decir("Comprobando…");
      huella(valor).then(function (h) {
        if (h !== LLAVE_ESTATICA_SHA256) {
          decir("Esa llave no abre esta puerta.", "error");
          botonLlave.disabled = false;
          return;
        }
        try {
          localStorage.setItem("rally_session_token", "estatico");
          localStorage.setItem("rally_project", "main");
          localStorage.setItem("rally_member_name", (nombre.value || "").trim() || "Visita");
          localStorage.setItem("rally_member_role", "member");
        } catch (e) { /* sin almacenamiento */ }
        decir("Adentro. Abriendo el workbench…");
        location.replace(destino());
      }).catch(function () {
        decir("Este navegador no puede comprobar la llave aquí: abre el enlace desde https o desde localhost.", "error");
        botonLlave.disabled = false;
      });
    });
    return;
  }

  function destino() {
    var base = "/";
    // `volver` es una ruta de este sitio, nunca un destino libre: `/\evil.example`
    // lo lee el navegador como `//evil.example`, asi que un enlace de login
    // podia terminar en otro sitio con la sesion ya guardada.
    var ruta = String(volver || "").trim();
    var segura =
      ruta.charAt(0) === "/" &&
      ruta.charAt(1) !== "/" &&
      ruta.charAt(1) !== "\\" &&
      ruta.indexOf("\\") === -1;
    if (segura) base = ruta;
    return conProyecto(base);
  }

  // El proyecto no puede vivir solo en la URL: la sesion se valida contra el
  // proyecto del query o de la cookie del servidor. Si aqui se pierde, el
  // tablero rebota al login aunque la clave sea correcta.
  function proyectoActual() {
    var deUrl = (params.get("project") || "").trim();
    if (deUrl) return deUrl;
    try {
      return (localStorage.getItem("rally_project") || "main").trim() || "main";
    } catch (e) {
      return "main";
    }
  }

  function conProyecto(ruta) {
    var proyecto = proyectoActual();
    if (!proyecto || proyecto === "main" || /[?&]project=/.test(ruta)) return ruta;
    return ruta + (ruta.indexOf("?") === -1 ? "?" : "&") + "project=" + encodeURIComponent(proyecto);
  }

  // Si el enlace trae invitacion, no hay nada que teclear aqui.
  var enlace = params.get("t") || params.get("invitacion");
  if (enlace) {
    location.replace("join.html?t=" + encodeURIComponent(enlace));
    return;
  }

  fetch(conProyecto("/api/acceso/estado"), { headers: { "Accept": "application/json" } })
    .then(function (r) { return r.json(); })
    .then(function (body) {
      if (!body || !body.ok) {
        nota.textContent = "Servidor sin respuesta";
        return;
      }
      miembros.textContent = body.protegido
        ? body.miembros + (body.miembros === 1 ? " persona adentro" : " personas adentro")
        : "sin accesos todavía";
      if (body.protegido) {
        nota.textContent = "Tu nombre y tu clave";
      } else {
        // Proyecto recien creado: la llave maestra es la unica entrada.
        nota.textContent = "Primera vez · abre el proyecto";
        panelLlave.open = true;
        nombre.style.display = "block";
        miembros.textContent = "la llave está en data/acceso.txt";
        llave.focus();
      }
    })
    .catch(function () {
      nota.textContent = "Servidor sin respuesta";
    });

  function guardarSesion(body) {
    var m = body.member || {};
    try {
      localStorage.setItem("rally_session_token", body.session || "");
      localStorage.setItem("rally_project", body.project || "main");
      localStorage.setItem("rally_member_id", m.id || "");
      localStorage.setItem("rally_member_name", m.name || "");
      localStorage.setItem("rally_member_role", m.role || "member");
      if (m.name) localStorage.setItem("rally_user_name", m.name);
      if (m.avatar) localStorage.setItem("rally_user_mascot_id", m.avatar);
    } catch (e) { /* sin almacenamiento: la cookie basta */ }
    decir("Adentro. Abriendo el workbench…");
    location.replace(destino());
  }

  var TEXTOS_ERROR = {
    "llave-invalida": "Esa llave no abre esta puerta.",
    "llave-solo-local": "La llave maestra solo abre en la máquina del servidor. Usa tu nombre y clave.",
    "llave-vacia": "Escribe tu llave.",
    "clave-invalida": "Ese nombre y esa clave no coinciden.",
    "pendiente": "Tu clave es correcta. El coordinador todavía no aprueba tu entrada; avísale y vuelve a intentar.",
    "sin-admin": "El proyecto existe pero sin administrador. Corre crear_proyecto.py.",
    "origen-no-permitido": "Entrada desde otro origen bloqueada.",
    "demasiados-intentos": "Demasiados intentos. Espera unos minutos."
  };

  function fallar(res) {
    var codigo = (res.body && res.body.error) || "clave-invalida";
    if (codigo === "clave-invalida" && proyectoActual() === "main") {
      decir("Ese nombre y esa clave no coinciden. Si vienes de un enlace de invitación, ábrelo otra vez: este navegador no sabe a qué proyecto entras.", "error");
      return;
    }
    decir(TEXTOS_ERROR[codigo] || "No se pudo entrar.", "error");
  }

  function irAlDestino(res, botonActivo) {
    if (!res.ok) {
      fallar(res);
      botonActivo.disabled = false;
      espera(false);
      // Devolver el foco al campo que hay que corregir.
      if (botonActivo === botonLlave) llave.focus();
      else clave.focus();
      return;
    }
    guardarSesion(res.body);
  }

  function alternarVer() {
    var visible = verBtn.getAttribute("aria-pressed") !== "true";
    verBtn.setAttribute("aria-pressed", visible ? "true" : "false");
    var etiqueta = visible ? "Ocultar la clave" : "Mostrar la clave";
    verBtn.setAttribute("aria-label", etiqueta);
    verBtn.setAttribute("title", etiqueta);
    verBtn.textContent = visible ? "Ocultar" : "Ver";
    clave.type = visible ? "text" : "password";
    clave.focus();
  }
  verBtn.addEventListener("click", alternarVer);

  // Pegar un enlace de invitacion en cualquiera de los dos campos tambien entra.
  function esEnlace(valor) {
    return /[?&]t=/.test(valor);
  }

  form.addEventListener("submit", function (evento) {
    evento.preventDefault();
    var quien = (persona.value || "").trim();
    var secreto = clave.value || "";
    if (esEnlace(quien)) {
      location.replace("join.html?t=" + encodeURIComponent(quien.split("t=").pop()));
      return;
    }
    if (!quien) {
      decir("Escribe tu nombre.", "error");
      persona.focus();
      return;
    }
    if (!secreto) {
      decir("Escribe tu clave.", "error");
      clave.focus();
      return;
    }
    boton.disabled = true;
    decir("Comprobando…");
    espera(true);
    fetch(conProyecto("/api/entrar"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nombre: quien, clave: secreto })
    })
      .then(function (r) { return r.json().then(function (b) { return { ok: r.ok, body: b || {} }; }); })
      .then(function (res) { irAlDestino(res, boton); })
      .catch(function () {
        decir("No se pudo contactar al servidor.", "error");
        boton.disabled = false;
        espera(false);
      });
  });

  formLlave.addEventListener("submit", function (evento) {
    evento.preventDefault();
    var valor = (llave.value || "").trim();
    if (!valor) {
      decir("Escribe tu llave.", "error");
      llave.focus();
      return;
    }
    if (esEnlace(valor)) {
      location.replace("join.html?t=" + encodeURIComponent(valor.split("t=").pop()));
      return;
    }
    botonLlave.disabled = true;
    decir("Comprobando…");
    espera(true);
    fetch(conProyecto("/api/entrar"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ llave: valor, nombre: (nombre.value || "").trim() })
    })
      .then(function (r) { return r.json().then(function (b) { return { ok: r.ok, body: b || {} }; }); })
      .then(function (res) { irAlDestino(res, botonLlave); })
      .catch(function () {
        decir("No se pudo contactar al servidor.", "error");
        botonLlave.disabled = false;
        espera(false);
      });
  });

  // Carga y espera: la marca se dibuja mientras abre la puerta y mientras entra.
  var capaCarga = document.getElementById("puerta-carga");
  var capaEspera = document.getElementById("puerta-entrando");
  var naceCarga = Date.now();

  function quitarCarga() {
    if (!capaCarga || !capaCarga.classList) return;
    if (capaCarga.classList.contains("is-oculto")) return;
    capaCarga.classList.add("is-oculto");
  }

  function espera(encendida) {
    if (!capaEspera || !capaEspera.classList) return;
    if (encendida) {
      capaEspera.removeAttribute("hidden");
      void capaEspera.offsetWidth;
      capaEspera.classList.add("is-on");
      return;
    }
    // Salir tambien se anima: sin esto la capa desaparecia de golpe al fallar.
    capaEspera.classList.remove("is-on");
    setTimeout(function () {
      if (!capaEspera.classList.contains("is-on")) capaEspera.setAttribute("hidden", "");
    }, 420);
  }

  // Menos de medio segundo se siente un salto; mas de dos, se siente colgado.
  function abrirPuerta() {
    var falta = Math.max(0, 520 - (Date.now() - naceCarga));
    setTimeout(quitarCarga, falta);
  }
  if (document.readyState === "complete" || !window.addEventListener) abrirPuerta();
  else window.addEventListener("load", abrirPuerta);
  setTimeout(quitarCarga, 2600);

  persona.focus();
})();
