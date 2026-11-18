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

  function mostrar(text) {
    status.textContent = text || "";
  }

  if (!token) {
    mostrar("Este enlace no trae invitación. Pide uno nuevo al administrador del equipo.");
    button.disabled = true;
  } else {
    input.focus();
  }

  function deviceId() {
    let id = localStorage.getItem("rally_device_id");
    if (!id) {
      id = "dev_" + crypto.randomUUID();
      localStorage.setItem("rally_device_id", id);
    }
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
        mostrar(body.error || "No se pudo entrar. El enlace pudo vencer o ya fue usado.");
        button.disabled = false;
        return;
      }
      if (body.pending) {
        // La sesion todavia no sirve: el admin tiene que aprobar la solicitud.
        mostrar("Solicitud enviada. Tu admin la aprueba y entras.");
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
