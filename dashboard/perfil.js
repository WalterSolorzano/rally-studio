(function () {
  "use strict";

  const statusEl = document.getElementById("perfil-status");
  const quienEl = document.getElementById("quien-nombre");
  const avatarEstado = document.getElementById("avatar-estado");
  const claveEstado = document.getElementById("clave-estado");
  const nombreForm = document.getElementById("nombre-form");
  const nombreInput = document.getElementById("perfil-nombre");
  const nombreEstado = document.getElementById("nombre-estado");
  const claveInput = document.getElementById("perfil-clave");
  const claveForm = document.getElementById("clave-form");
  const quitarBtn = document.getElementById("clave-quitar");
  const contenedor = document.getElementById("perfil-avatares");
  const rolesContenedor = document.getElementById("perfil-roles");
  const rolesEstado = document.getElementById("roles-estado");
  let radios = [];
  let casillasRoles = [];

  const TEXTOS = {
    "clave-corta": "La clave necesita al menos 6 caracteres.",
    "avatar-largo": "Ese avatar no es válido.",
    "nombre-requerido": "Escribe tu nombre.",
    "nombre-largo": "El nombre tiene más de 40 caracteres. Acórtalo.",
    "miembro-inexistente": "Tu acceso ya no está activo. Pide un enlace nuevo.",
    "no-autenticado": "Tu acceso ya no está activo. Pide un enlace nuevo.",
    "sin-permiso": "Este proyecto no tiene cuentas por persona.",
    "origen-no-permitido": "El pedido vino de otro sitio.",
  };

  function project() {
    const fromUrl = new URLSearchParams(location.search).get("project");
    return (fromUrl || localStorage.getItem("rally_project") || "main").trim() || "main";
  }

  function token() {
    return localStorage.getItem("rally_session_token") || "";
  }

  function status(text) {
    statusEl.textContent = text || "";
  }

  function nota(el, text) {
    el.textContent = text || "";
  }

  function mensaje(body, res) {
    const clave = (body && body.error) || "";
    return TEXTOS[clave] || "No se pudo guardar. Intenta de nuevo.";
  }

  function conProyecto(path) {
    return path + (path.indexOf("?") >= 0 ? "&" : "?") + "project=" + encodeURIComponent(project());
  }

  async function api(path, options) {
    const opts = Object.assign({ cache: "no-store", headers: {} }, options || {});
    opts.headers = Object.assign({}, opts.headers);
    if (opts.body) opts.headers["Content-Type"] = "application/json";
    const t = token();
    if (t) opts.headers.Authorization = "Bearer " + t;
    const res = await fetch(conProyecto(path), opts);
    const body = await res.json().catch(function () { return {}; });
    return { status: res.status, ok: res.ok, body: body };
  }

  function irAlLogin() {
    location.replace("login.html?volver=/perfil.html");
  }

  function recordar(member) {
    try {
      localStorage.setItem("rally_user_name", member.name || "");
      if (member.avatar) localStorage.setItem("rally_user_mascot_id", member.avatar);
      if (member.id) localStorage.setItem("rally_member_id", member.id);
      if (member.role) localStorage.setItem("rally_member_role", member.role);
      localStorage.setItem("rally_project", project());
    } catch (e) { /* sin almacenamiento: la página sigue funcionando */ }
  }

  function pintarClave(tiene) {
    nota(claveEstado, tiene ? "Tienes clave: puedes entrar con tu nombre y tu clave." : "No tienes clave todavía.");
    quitarBtn.hidden = !tiene;
  }

  function pintar(member) {
    quienEl.textContent = (member.name || "Sin nombre") +
      (member.has_password ? " · con clave" : " · solo con enlace");
    if (nombreInput) nombreInput.value = member.name || "";
    const elegido = window.RAV ? RAV.normalizar(member.avatar) : (member.avatar || "");
    radios.forEach(function (radio) {
      radio.checked = radio.value === elegido;
      radio.disabled = false;
    });
    const mios = member.roles || [];
    casillasRoles.forEach(function (casilla) {
      casilla.checked = mios.indexOf(casilla.value) >= 0;
      casilla.disabled = false;
    });
    pintarClave(!!member.has_password);
    const panelRoles = rolesContenedor && typeof rolesContenedor.closest === "function"
      ? rolesContenedor.closest(".perfil-panel")
      : null;
    if (panelRoles) panelRoles.hidden = member.role === "visitor";
    recordar(member);
  }

  function guardarRoles() {
    const elegidos = casillasRoles.filter(function (c) { return c.checked; })
      .map(function (c) { return c.value; });
    casillasRoles.forEach(function (c) { c.disabled = true; });
    nota(rolesEstado, "Guardando…");
    return api("/api/member/roles", {
      method: "POST",
      body: JSON.stringify({ roles: elegidos }),
    }).then(function (res) {
      casillasRoles.forEach(function (c) { c.disabled = false; });
      if (res.status === 401) { irAlLogin(); return; }
      if (!res.ok) {
        nota(rolesEstado, mensaje(res.body, res));
        return cargar();
      }
      nota(rolesEstado, elegidos.length ? "Roles guardados." : "Sin roles por ahora.");
    });
  }

  function cambiarAvatar(radio) {
    if (!radio.checked) return;
    radios.forEach(function (otro) { otro.disabled = true; });
    nota(avatarEstado, "Guardando…");
    return api("/api/member/avatar", {
      method: "POST",
      body: JSON.stringify({ avatar: radio.value }),
    }).then(function (res) {
      radios.forEach(function (otro) { otro.disabled = false; });
      if (res.status === 401) { irAlLogin(); return; }
      if (!res.ok) {
        nota(avatarEstado, mensaje(res.body, res));
        return cargar();
      }
      nota(avatarEstado, "Personaje guardado.");
      try { localStorage.setItem("rally_user_mascot_id", res.body.avatar || radio.value); } catch (e) {}
    });
  }

  function pintarAvatares() {
    if (!contenedor || !window.RAV) return;
    contenedor.innerHTML = RAV.lista
      .map(function (avatar) {
        return (
          '<input type="radio" id="pf-' + avatar.id + '" name="avatar" value="' + avatar.id + '">' +
          '<label for="pf-' + avatar.id + '">' + RAV.svg(avatar.id) +
          "<span>" + avatar.nombre + "</span></label>"
        );
      })
      .join("");
    radios = Array.prototype.slice.call(contenedor.querySelectorAll('input[name="avatar"]'));
    radios.forEach(function (radio) {
      radio.addEventListener("change", function () { cambiarAvatar(radio); });
    });
  }

  function pintarRoles() {
    if (!rolesContenedor || !window.RAV) return;
    rolesContenedor.innerHTML = RAV.roles
      .map(function (rol) {
        return (
          '<input type="checkbox" id="pfr-' + rol.id + '" name="rol" value="' + rol.id + '">' +
          '<label for="pfr-' + rol.id + '">' + rol.nombre + "</label>"
        );
      })
      .join("");
    casillasRoles = Array.prototype.slice.call(rolesContenedor.querySelectorAll('input[name="rol"]'));
    casillasRoles.forEach(function (casilla) {
      casilla.addEventListener("change", function () { guardarRoles(); });
    });
  }

  async function cargar() {
    radios.forEach(function (radio) { radio.disabled = true; });
    const res = await api("/api/member/yo");
    if (res.status === 401) { irAlLogin(); return; }
    if (!res.ok || !res.body.member) {
      // Si la lectura falla, la página no puede quedarse congelada: los
      // controles vuelven a estar disponibles para reintentar.
      radios.forEach(function (radio) { radio.disabled = false; });
      casillasRoles.forEach(function (casilla) { casilla.disabled = false; });
      status("No se pudo leer tu perfil. Recarga la página.");
      return;
    }
    if (res.body.member.id === "legacy") {
      status("Este proyecto todavía no tiene cuentas por persona. Pide un enlace al administrador.");
      return;
    }
    pintar(res.body.member);
  }

  if (nombreForm) nombreForm.addEventListener("submit", async function (event) {
    event.preventDefault();
    const nombre = (nombreInput.value || "").trim();
    if (!nombre) {
      nota(nombreEstado, TEXTOS["nombre-requerido"]);
      nombreInput.focus();
      return;
    }
    if (nombre.length > 40) {
      nota(nombreEstado, TEXTOS["nombre-largo"]);
      return;
    }
    nombreInput.disabled = true;
    nota(nombreEstado, "Guardando…");
    const res = await api("/api/member/nombre", {
      method: "POST",
      body: JSON.stringify({ name: nombre }),
    });
    nombreInput.disabled = false;
    if (res.status === 401) { irAlLogin(); return; }
    if (!res.ok) {
      nota(nombreEstado, mensaje(res.body, res));
      return;
    }
    try {
      localStorage.setItem("rally_member_name", nombre);
      localStorage.setItem("rally_user_name", nombre);
    } catch (e) { /* sin almacenamiento: el servidor ya lo guardó */ }
    await cargar();
    nota(nombreEstado, "Nombre guardado.");
  });

  claveForm.addEventListener("submit", async function (event) {
    event.preventDefault();
    const clave = (claveInput.value || "").trim();
    if (clave.length < 6) {
      nota(claveEstado, TEXTOS["clave-corta"]);
      return;
    }
    nota(claveEstado, "Guardando…");
    const res = await api("/api/member/clave", {
      method: "POST",
      body: JSON.stringify({ clave: clave }),
    });
    if (res.status === 401) { irAlLogin(); return; }
    if (!res.ok) {
      nota(claveEstado, mensaje(res.body, res));
      return;
    }
    claveInput.value = "";
    await cargar();
    nota(claveEstado, "Clave guardada. Úsala con tu nombre para entrar.");
  });

  quitarBtn.addEventListener("click", async function () {
    const seguro = window.confirm(
      "¿Quitar tu clave? Después solo entrarás con un enlace nuevo."
    );
    if (!seguro) return;
    nota(claveEstado, "Quitando…");
    const res = await api("/api/member/clave", {
      method: "POST",
      body: JSON.stringify({ clave: "" }),
    });
    if (res.status === 401) { irAlLogin(); return; }
    if (!res.ok) {
      nota(claveEstado, mensaje(res.body, res));
      return;
    }
    pintarClave(false);
    await cargar();
    nota(claveEstado, "Tu clave quedó eliminada.");
  });

  pintarAvatares();
  pintarRoles();
  cargar();
})();
