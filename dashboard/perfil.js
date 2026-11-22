(function () {
  "use strict";

  const statusEl = document.getElementById("perfil-status");
  const quienEl = document.getElementById("quien-nombre");
  const avatarEstado = document.getElementById("avatar-estado");
  const botonEditar = document.getElementById("perfil-editar");
  const botonListo = document.getElementById("perfil-listo");

  // El personaje se puede mirar a pantalla completa: se oculta el resto.
  function modoPersonaje(encendido) {
    if (document.body && document.body.classList) {
      document.body.classList.toggle("perfil-personaje", !!encendido);
    }
    if (botonEditar) botonEditar.hidden = !!encendido;
    if (botonListo) botonListo.hidden = !encendido;
    if (encendido && window.scrollTo) window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (botonEditar) botonEditar.addEventListener("click", function () {
    modoPersonaje(true);
  });
  if (botonListo) botonListo.addEventListener("click", function () {
    modoPersonaje(false);
  });
  const claveEstado = document.getElementById("clave-estado");
  const nombreForm = document.getElementById("nombre-form");
  const nombreInput = document.getElementById("perfil-nombre");
  const nombreEstado = document.getElementById("nombre-estado");
  const claveInput = document.getElementById("perfil-clave");
  const claveForm = document.getElementById("clave-form");
  const quitarBtn = document.getElementById("clave-quitar");
  const estudioCara = document.getElementById("perfil-cara");
  const estudioNom = document.getElementById("perfil-cara-nom");
  const pasoTono = document.getElementById("perfil-tono-paso");
  const rolesContenedor = document.getElementById("perfil-roles");
  const rolesEstado = document.getElementById("roles-estado");
  const filas = {
    pelo: document.getElementById("perfil-pelos"),
    accesorio: document.getElementById("perfil-accesorios"),
    tono: document.getElementById("perfil-tonos"),
    camisa: document.getElementById("perfil-camisas"),
  };
  let basePersonaje = "av_profe";
  let capas = { pelo: "p1", accesorio: "a0", camisa: "c1", tono: "t1" };
  let guardando = false;
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
    if (window.RAV && typeof RAV.partes === "function") {
      const p = RAV.partes(member.avatar);
      basePersonaje = p.base;
      capas = { pelo: p.pelo, accesorio: p.accesorio, camisa: p.camisa, tono: p.tono };
      pintarPersonaje();
    }
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

  function specActual() {
    if (!(window.RAV && typeof RAV.espec === "function")) return basePersonaje;
    return RAV.espec(basePersonaje, capas);
  }

  function pintarVista() {
    if (!estudioCara || !window.RAV) return;
    const spec = specActual();
    estudioCara.innerHTML = RAV.svg(spec);
    if (estudioNom && typeof RAV.etiqueta === "function") {
      estudioNom.textContent = RAV.etiqueta(RAV.partes(spec));
    }
    if (pasoTono) pasoTono.hidden = capas.accesorio === "a0";
  }

  function muestraDe(nombre, avatar) {
    if (nombre === "camisa" || nombre === "tono") {
      return '<span class="estudio-tono" style="background:' + avatar.color + '"></span>';
    }
    return RAV.svg(RAV.espec(basePersonaje, {
      pelo: nombre === "pelo" ? avatar.id : capas.pelo,
      accesorio: nombre === "accesorio" ? avatar.id : capas.accesorio,
      camisa: capas.camisa,
      tono: capas.tono,
    }));
  }

  function pintarCapa(nombre, opciones) {
    const caja = filas[nombre];
    if (!caja || !window.RAV) return;
    caja.innerHTML = opciones
      .map(function (avatar) {
        const id = nombre + "-" + avatar.id;
        return (
          '<span class="estudio-pieza">' +
          '<input type="radio" id="' + id + '" name="' + nombre + '" value="' + avatar.id + '"' +
          (capas[nombre] === avatar.id ? " checked" : "") + ">" +
          '<label for="' + id + '" title="' + avatar.nombre + '">' + muestraDe(nombre, avatar) +
          '<span class="estudio-rotulo">' + avatar.nombre + "</span></label></span>"
        );
      })
      .join("");
  }

  function pintarPersonaje() {
    if (!window.RAV || !filas.pelo) return;
    if (window.RAV.lista && window.RAV.lista[0]) basePersonaje = basePersonaje || window.RAV.lista[0].id;
    pintarCapa("pelo", RAV.capas.pelos);
    pintarCapa("accesorio", RAV.capas.accesorios);
    pintarCapa("tono", RAV.capas.tonos || []);
    pintarCapa("camisa", RAV.capas.camisas);
    pintarVista();
  }

  function cambiarAvatar() {
    if (guardando) return;
    guardando = true;
    const spec = specActual();
    nota(avatarEstado, "Guardando…");
    return api("/api/member/avatar", {
      method: "POST",
      body: JSON.stringify({ avatar: spec }),
    }).then(function (res) {
      guardando = false;
      if (res.status === 401) { irAlLogin(); return; }
      if (!res.ok) {
        nota(avatarEstado, mensaje(res.body, res));
        return cargar();
      }
      nota(avatarEstado, "Personaje guardado.");
      try { localStorage.setItem("rally_user_mascot_id", res.body.avatar || spec); } catch (e) {}
    });
  }

  if (filas.pelo && window.RAV) {
    Object.keys(filas).forEach(function (nombre) {
      if (!filas[nombre]) return;
      filas[nombre].addEventListener("change", function (event) {
        if (!event.target || !event.target.value) return;
        capas[nombre] = event.target.value;
        pintarVista();
        cambiarAvatar();
      });
    });
  }

  function pintarAvatares() {
    pintarPersonaje();
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
    const res = await api("/api/member/yo");
    if (res.status === 401) { irAlLogin(); return; }
    if (!res.ok || !res.body.member) {
      // Si la lectura falla, la página no puede quedarse congelada: los
      // controles vuelven a estar disponibles para reintentar.
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
