(function () {
  "use strict";

  const params = new URLSearchParams(location.search);
  const token = (params.get("t") || "").trim();
  const form = document.getElementById("join-form");
  const input = document.getElementById("join-name");
  const clave = document.getElementById("join-clave");
  const button = document.getElementById("join-submit");
  const status = document.getElementById("join-status");
  const contenedor = document.getElementById("join-avatares");
  const contenedorRoles = document.getElementById("join-roles");
  const quien = document.getElementById("join-quien");
  const rolesFieldset = document.getElementById("join-roles-fieldset");

  /* Como entra el invitado lo decide el enlace, no el invitado: el motor
   * guarda el rol en la invitacion y aqui solo se anuncia. */
  const ROLES_ENTRADA = {
    mentor: { titulo: "Mentor", detalle: "revisa y aprueba", avatar: "av_mentor" },
    visitor: { titulo: "Visitante", detalle: "solo lectura", avatar: "av_visitante" },
    member: { titulo: "Miembro", detalle: "", avatar: "" },
  };

  function pintarAvatares() {
    if (!contenedor || !window.RAV) return;
    contenedor.innerHTML = RAV.lista
      .map(function (avatar, i) {
        return (
          '<input type="radio" id="av-' + avatar.id + '" name="avatar" value="' + avatar.id + '"' +
          (i === 0 ? " checked" : "") + ">" +
          '<label for="av-' + avatar.id + '">' + RAV.svg(avatar.id) +
          "<span>" + avatar.nombre + "</span></label>"
        );
      })
      .join("");
  }

  function pintarRoles() {
    if (!contenedorRoles || !window.RAV) return;
    contenedorRoles.innerHTML = RAV.roles
      .map(function (rol) {
        return (
          '<input type="checkbox" id="rol-' + rol.id + '" name="rol" value="' + rol.id + '">' +
          '<label for="rol-' + rol.id + '">' + rol.nombre + "</label>"
        );
      })
      .join("");
  }

  pintarAvatares();
  pintarRoles();

  function anunciarRol(rol) {
    const ficha = ROLES_ENTRADA[rol] || ROLES_ENTRADA.member;
    const linea = "Entras como " + ficha.titulo.toLowerCase() +
      (ficha.detalle ? " \u00b7 " + ficha.detalle : "");
    if (quien) {
      quien.setAttribute("aria-label", linea);
      quien.innerHTML = (ficha.avatar && window.RAV ? RAV.svg(ficha.avatar) : "") +
        "<span>" + linea + "</span>";
    }
    if (rol === "visitor" && rolesFieldset) rolesFieldset.hidden = true;
    if (ficha.avatar) {
      const radio = form.querySelector('input[name="avatar"][value="' + ficha.avatar + '"]');
      if (radio) radio.checked = true;
    }
  }

  if (token) {
    fetch("/api/invite?t=" + encodeURIComponent(token))
      .then(function (res) { return res.ok ? res.json() : null; })
      .then(function (info) { if (info && info.ok) anunciarRol(info.role); })
      .catch(function () { /* sin aviso, la entrada sigue funcionando */ });
  }

  function mostrar(text) {
    status.textContent = text || "";
  }

  // Los errores del motor viajan como codigos cortos ("invite-usado"). Un
  // codigo en pantalla no le dice nada a quien esta entrando: se traduce a una
  // frase que le diga que hacer.
  var TEXTOS = {
    "invite-usado": "Ese enlace ya se usó. Pide uno nuevo al administrador del equipo.",
    "invite-expirado": "Ese enlace venció. Pide uno nuevo al administrador del equipo.",
    "invite-invalido": "Ese enlace no es válido. Pide uno nuevo al administrador del equipo.",
    "nombre-invalido": "Escribe tu nombre (entre 1 y 40 caracteres).",
    "nombre-requerido": "Escribe tu nombre.",
    "nombre-largo": "El nombre tiene más de 40 caracteres. Acórtalo.",
    "clave-corta": "La clave necesita al menos 6 caracteres.",
    "avatar-largo": "Ese avatar no existe en esta versión. Recarga la página y elige otro.",
    "sin-permiso": "Tu usuario no tiene permiso para entrar a este proyecto.",
    "no-autenticado": "Tu sesión venció. Vuelve a entrar con el enlace.",
    "origen-no-permitido": "El enlace se abrió desde otro sitio. Copia la dirección completa y ábrela de nuevo.",
  };

  function mensajeDe(codigo) {
    var clave = String(codigo || "").trim();
    if (TEXTOS[clave]) return TEXTOS[clave];
    if (/^[a-z0-9-]+$/.test(clave)) {
      return "No se pudo entrar. El enlace pudo vencer o ya fue usado. Pide uno nuevo al administrador.";
    }
    return clave || "No se pudo entrar. El enlace pudo vencer o ya fue usado.";
  }

  if (!token) {
    mostrar("Este enlace no trae invitación. Pide uno nuevo al administrador del equipo.");
    button.disabled = true;
  } else {
    input.focus();
  }

  function deviceId() {
    let id = localStorage.getItem("rally_device_id");
    if (id) return id;
    // crypto.randomUUID solo existe en contexto seguro (https o localhost).
    // En una red local por http el navegador no lo ofrece y el enlace de
    // invitacion tiene que seguir funcionando: se cae a un id simple. No es un
    // secreto, es la marca del equipo.
    let uuid = "";
    try {
      if (window.crypto && typeof window.crypto.randomUUID === "function") {
        uuid = window.crypto.randomUUID();
      }
    } catch (error) {
      uuid = "";
    }
    if (!uuid) {
      uuid =
        Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 10);
    }
    id = "dev_" + uuid;
    localStorage.setItem("rally_device_id", id);
    return id;
  }

  form.addEventListener("submit", async function (event) {
    event.preventDefault();
    const name = (input.value || "").trim();
    const password = (clave.value || "").trim();
    const avatarInput = form.querySelector('input[name="avatar"]:checked');
    const avatar = avatarInput ? avatarInput.value : "";
    const roles = Array.prototype.map.call(
      form.querySelectorAll('input[name="rol"]:checked'),
      function (casilla) { return casilla.value; }
    );
    if (!name) {
      mostrar("Escribe tu nombre.");
      input.focus();
      return;
    }
    if (password && password.length < 6) {
      mostrar("La clave necesita al menos 6 caracteres.");
      clave.focus();
      return;
    }
    button.disabled = true;
    mostrar("Entrando...");
    try {
      const res = await fetch("/api/project/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: token,
          name: name,
          device_id: deviceId(),
          avatar: avatar,
          clave: password,
          roles: roles,
        }),
      });
      const body = await res.json().catch(function () { return {}; });
      if (!res.ok) {
        mostrar(mensajeDe(body.error));
        button.disabled = false;
        return;
      }
      if (body.pending) {
        // La sesion todavia no sirve: el admin tiene que aprobar la solicitud.
        mostrar("Solicitud enviada. Tu admin la aprueba y entras.");
        button.disabled = false;
        return;
      }
      if (!body.session || !body.member) {
        // Sin sesion o sin miembro no hay a donde ir: mejor decirlo que
        // guardar "undefined" y romper la siguiente pantalla.
        mostrar("El servidor respondió sin sesión. Recarga e intenta de nuevo.");
        button.disabled = false;
        return;
      }
      const previous = localStorage.getItem("rally_project") || "main";
      if (previous !== body.project) {
        localStorage.removeItem("rally_studio_production_state_2026_v4");
        localStorage.removeItem("rally_section_sync_meta_v1");
      }
      localStorage.setItem("rally_session_token", body.session);
      localStorage.setItem("rally_project", body.project);
      localStorage.setItem("rally_member_id", body.member.id);
      localStorage.setItem("rally_member_name", body.member.name);
      localStorage.setItem("rally_member_role", body.member.role);
      localStorage.setItem("rally_user_name", body.member.name);
      if (body.member.avatar) localStorage.setItem("rally_user_mascot_id", body.member.avatar);
      location.replace("/?project=" + encodeURIComponent(body.project));
    } catch (error) {
      mostrar("No se pudo contactar al servidor. Revisa la conexión e intenta de nuevo.");
      button.disabled = false;
    }
  });
})();
