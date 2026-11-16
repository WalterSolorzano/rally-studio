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
  var boton = document.getElementById("puerta-entrar");
  var estado = document.getElementById("puerta-estado");
  var nota = document.getElementById("puerta-nota");
  var miembros = document.getElementById("puerta-miembros");
  var protegido = true;

  function decir(texto, tono) {
    estado.textContent = texto || "";
    if (tono) estado.setAttribute("data-tono", tono);
    else estado.removeAttribute("data-tono");
  }

  function destino() {
    if (!volver) return "/";
    if (/^[a-z]+:/i.test(volver) || volver.indexOf("//") === 0) return "/";
    return volver.charAt(0) === "/" ? volver : "/" + volver;
  }

  // Si el enlace trae invitacion, no hay nada que teclear aqui.
  var enlace = params.get("t") || params.get("invitacion");
  if (enlace) {
    location.replace("join.html?t=" + encodeURIComponent(enlace));
    return;
  }

  fetch("/api/acceso/estado", { headers: { "Accept": "application/json" } })
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

  form.addEventListener("submit", function (evento) {
    evento.preventDefault();
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

    fetch("/api/entrar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ llave: valor, nombre: (nombre.value || "").trim() })
    })
      .then(function (r) { return r.json().then(function (b) { return { ok: r.ok, body: b || {} }; }); })
      .then(function (res) {
        if (!res.ok) {
          var codigo = res.body.error || "llave-invalida";
          var textos = {
            "llave-invalida": "Esa llave no abre esta puerta.",
            "llave-vacia": "Escribe tu llave.",
            "sin-admin": "El proyecto existe pero sin administrador. Corre crear_proyecto.py.",
            "origen-no-permitido": "Entrada desde otro origen bloqueada."
          };
          decir(textos[codigo] || "No se pudo entrar.", "error");
          boton.disabled = false;
          return;
        }
        var m = res.body.member || {};
        try {
          localStorage.setItem("rally_session_token", res.body.session || "");
          localStorage.setItem("rally_project", res.body.project || "main");
          localStorage.setItem("rally_member_id", m.id || "");
          localStorage.setItem("rally_member_name", m.name || "");
          localStorage.setItem("rally_member_role", m.role || "member");
        } catch (e) { /* sin almacenamiento: la cookie basta */ }
        decir("Adentro. Abriendo el workbench…");
        location.replace(destino());
      })
      .catch(function () {
        decir("No se pudo contactar al servidor.", "error");
        boton.disabled = false;
      });
  });

  llave.focus();
  if (!protegido) nombre.value = "";
})();
