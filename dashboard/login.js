/* Puerta de acceso del proyecto.
 *
 * Tres formas de entrar, una sola comprobacion:
 *   1. Llave maestra (data/acceso.txt) -> abre el proyecto y crea el admin.
 *   2. Token personal -> la sesion que devolvio tu invitacion.
 *   3. Enlace de invitacion pegado completo -> se manda a join.html.
 *
 * La sesion queda en una cookie HttpOnly que pone el servidor: los scripts
 * de la pagina no pueden leerla ni robarla.
 */
(function () {
  "use strict";

  var params = new URLSearchParams(location.search);
  var volver = (params.get("volver") || "").trim();
  var form = document.getElementById("puerta-form");
  var llave = document.getElementById("puerta-llave");
  var nombre = document.getElementById("puerta-nombre");
  var persona = document.getElementById("puerta-persona");
  var clave = document.getElementById("puerta-clave");
  var modoBtn = document.getElementById("puerta-modo");
  var boton = document.getElementById("puerta-entrar");
var verBtn = document.getElementById("puerta-ver");
  var estado = document.getElementById("puerta-estado");
  var nota = document.getElementById("puerta-nota");
  var miembros = document.getElementById("puerta-miembros");
  var protegido = true;
  var modo = "llave";

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
    if (!(window.crypto && crypto.subtle)) return Promise.resolve("");
    return crypto.subtle.digest("SHA-256", new TextEncoder().encode(texto))
      .then(function (buf) {
        return Array.prototype.map.call(new Uint8Array(buf), function (b) {
          return ("0" + b.toString(16)).slice(-2);
        }).join("");
      });
  }

  if (ESTATICO) {
    nota.textContent = "Modo estático · sin servidor";
    miembros.textContent = "la llave se comprueba en tu navegador, no protege el contenido";
    llave.placeholder = "Tu llave";
    nombre.style.display = "block";
    modoBtn.style.display = "none";
    form.addEventListener("submit", function (evento) {
      evento.preventDefault();
      var valor = (llave.value || "").trim();
      if (!valor) {
        decir("Escribe tu llave.", "error");
        llave.focus();
        return;
      }
      boton.disabled = true;
      decir("Comprobando…");
      huella(valor).then(function (h) {
        if (h !== LLAVE_ESTATICA_SHA256) {
          decir("Esa llave no abre esta puerta.", "error");
          boton.disabled = false;
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
      });
    });
    return;
  }

  function decir(texto, tono) {
    estado.textContent = texto || "";
    if (tono) estado.setAttribute("data-tono", tono);
    else estado.removeAttribute("data-tono");
  }

  function destino() {
    var base = "/";
    if (volver && !/^[a-z]+:/i.test(volver) && volver.indexOf("//") !== 0) {
      base = volver.charAt(0) === "/" ? volver : "/" + volver;
    }
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
      protegido = !!body.protegido;
      miembros.textContent = protegido
        ? body.miembros + (body.miembros === 1 ? " persona adentro" : " personas adentro")
        : "sin accesos todavía";
      if (protegido) {
        nota.textContent = "Pega tu llave o tu enlace de invitación";
        llave.placeholder = "Tu llave";
      } else {
        nota.textContent = "Primera vez · abre el proyecto";
        llave.placeholder = "XXXX-XXXX-XXXX";
        nombre.style.display = "block";
        miembros.textContent = "la llave está en data/acceso.txt";
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
    var codigo = (res.body && res.body.error) || "llave-invalida";
    decir(TEXTOS_ERROR[codigo] || "No se pudo entrar.", "error");
    boton.disabled = false;
  }

  function ponerModo(nuevo) {
    modo = nuevo === "persona" ? "persona" : "llave";
    form.setAttribute("data-modo", modo);
    llave.required = modo === "llave";
    persona.required = modo === "persona";
    clave.required = modo === "persona";
    modoBtn.textContent =
      modo === "persona" ? "Entrar con la llave del equipo" : "Entrar con mi nombre y clave";
    decir("");
    (modo === "persona" ? persona : llave).focus();
  }

  modoBtn.addEventListener("click", function () {
    ponerModo(modo === "persona" ? "llave" : "persona");
  });

  function alternarVer() {
    var visible = verBtn.getAttribute("aria-pressed") !== "true";
    verBtn.setAttribute("aria-pressed", visible ? "true" : "false");
    var etiqueta = visible ? "Ocultar la clave" : "Mostrar la clave";
    verBtn.setAttribute("aria-label", etiqueta);
    verBtn.setAttribute("title", etiqueta);
    llave.type = visible ? "text" : "password";
    clave.type = visible ? "text" : "password";
    (modo === "persona" ? clave : llave).focus();
  }
  verBtn.addEventListener("click", alternarVer);

  function entrarConClave() {
    var quien = (persona.value || "").trim();
    var secreto = clave.value || "";
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
    fetch(conProyecto("/api/entrar"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nombre: quien, clave: secreto })
    })
      .then(function (r) { return r.json().then(function (b) { return { ok: r.ok, body: b || {} }; }); })
      .then(function (res) {
        if (!res.ok) { fallar(res); return; }
        guardarSesion(res.body);
      })
      .catch(function () {
        decir("No se pudo contactar al servidor.", "error");
        boton.disabled = false;
      });
  }

  form.addEventListener("submit", function (evento) {
    evento.preventDefault();
    if (modo === "persona") {
      entrarConClave();
      return;
    }
    var valor = (llave.value || "").trim();
    if (!valor) {
      decir("Escribe tu llave.", "error");
      llave.focus();
      return;
    }
    if (/[?&]t=/.test(valor)) {
      location.replace("join.html?t=" + encodeURIComponent(valor.split("t=").pop()));
      return;
    }
    boton.disabled = true;
    decir("Comprobando…");

    fetch(conProyecto("/api/entrar"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ llave: valor, nombre: (nombre.value || "").trim() })
    })
      .then(function (r) { return r.json().then(function (b) { return { ok: r.ok, body: b || {} }; }); })
      .then(function (res) {
        if (!res.ok) { fallar(res); return; }
        guardarSesion(res.body);
      })
      .catch(function () {
        decir("No se pudo contactar al servidor.", "error");
        boton.disabled = false;
      });
  });

  llave.focus();
  if (!protegido) nombre.value = "";
})();
