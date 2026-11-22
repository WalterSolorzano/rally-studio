(function () {
  "use strict";

  const params = new URLSearchParams(location.search);
  const token = (params.get("t") || "").trim();
  const form = document.getElementById("join-form");
  const input = document.getElementById("join-name");
  const clave = document.getElementById("join-clave");
  const verClave = document.getElementById("join-ver");
  const button = document.getElementById("join-submit");
  const status = document.getElementById("join-status");
  const contenedor = document.getElementById("join-avatares");
  const contenedorRoles = document.getElementById("join-roles");
  const quien = document.getElementById("join-quien");

  /* Como entra el invitado lo decide el enlace, no el invitado: el motor
   * guarda el rol en la invitacion y aqui solo se anuncia. */
  const ROLES_ENTRADA = {
    mentor: { titulo: "Mentor", detalle: "revisa y aprueba" },
    visitor: { titulo: "Visitante", detalle: "solo lectura" },
    member: { titulo: "Miembro", detalle: "" },
  };

  /* El personaje se arma por capas: pelo, accesorio, camisa y color. No depende
   * del rol ni del oficio: todos entran con la cara basica y la cambian. */
  var basePersonaje = "av_profe";
  var capas = { pelo: "p1", accesorio: "a0", camisa: "c1", tono: "t1" };
  var vistaCara = document.getElementById("join-cara");
  var vistaNom = document.getElementById("join-cara-nom");
  var pasoTono = document.getElementById("join-tono-paso");
  var filas = {
    pelo: document.getElementById("join-pelos"),
    accesorio: document.getElementById("join-accesorios"),
    tono: document.getElementById("join-tonos"),
    camisa: document.getElementById("join-camisas"),
  };

  function ravOk() {
    return !!(window.RAV && typeof RAV.espec === "function" && RAV.capas && RAV.partes);
  }

  function specActual() {
    if (!ravOk()) return basePersonaje;
    return RAV.espec(basePersonaje, capas);
  }

  function pintarVista() {
    if (!vistaCara || !window.RAV) return;
    const spec = specActual();
    vistaCara.innerHTML = RAV.svg(spec);
    if (vistaNom && ravOk()) vistaNom.textContent = RAV.etiqueta(RAV.partes(spec));
    if (pasoTono) pasoTono.hidden = capas.accesorio === "a0";
  }

  function muestraDe(nombre, avatar) {
    if (nombre === "camisa" || nombre === "tono") {
      return '<span class="estudio-tono" style="background:' + avatar.color + '"></span>';
    }
    const elegido = {
      pelo: nombre === "pelo" ? avatar.id : capas.pelo,
      accesorio: nombre === "accesorio" ? avatar.id : capas.accesorio,
      camisa: capas.camisa,
      tono: capas.tono,
    };
    return RAV.svg(RAV.espec(basePersonaje, elegido));
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
    if (!ravOk() || !filas.pelo) return;
    capas = RAV.partes(RAV.espec(basePersonaje, capas));
    pintarCapa("pelo", RAV.capas.pelos);
    pintarCapa("accesorio", RAV.capas.accesorios);
    pintarCapa("tono", RAV.capas.tonos || []);
    pintarCapa("camisa", RAV.capas.camisas);
    pintarVista();
  }

  if (filas.pelo) {
    Object.keys(filas).forEach(function (nombre) {
      if (!filas[nombre]) return;
      filas[nombre].addEventListener("change", function (e) { cambioCapa(nombre, e); });
    });
  }

  function cambioCapa(nombre, event) {
    const casilla = event.target;
    if (!casilla || !casilla.value || !ravOk()) return;
    capas[nombre] = casilla.value;
    pintarVista();
  }

  /* Icono por rol: una figura antes que la palabra, no emoji. */
  var ICONOS = {
    director: '<path d="M3 8h18v12H3z"/><path d="M3 8l3-4h13l-3 4"/><path d="M9 12h6M9 16h6"/>',
    guion: '<path d="M6 3h8l4 4v14H6z"/><path d="M14 3v4h4"/><path d="M9 12h6M9 16h6"/>',
    presupuesto: '<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M8 7h8"/><circle cx="9" cy="12" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="9" cy="16" r="1"/><circle cx="15" cy="16" r="1"/>',
    pautado: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 10h18M9 10v10"/>',
    canvas: '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18M15 3v18M3 9h18M3 15h18"/>',
    documentos: '<path d="M3 6h6l2 3h10v11H3z"/>',
    "editor-video": '<rect x="3" y="5" width="12" height="14" rx="2"/><path d="M15 9l6-3v12l-6-3z"/>',
    investigacion: '<circle cx="11" cy="11" r="6"/><path d="M15.5 15.5L21 21"/>',
    voz: '<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0"/><path d="M12 18v3"/>',
    "modelo-3d": '<path d="M12 3l8 4.5-8 4.5-8-4.5z"/><path d="M4 7.5v9L12 21l8-4.5v-9"/><path d="M12 12v9"/>',
    web: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18"/><circle cx="6.5" cy="6.5" r=".8"/>',
    auditor: '<path d="M2 12s4-6 10-6 10 6 10 6-4 6-10 6S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
  };

  function iconoRol(id) {
    var trazo = ICONOS[id];
    if (!trazo) return "";
    return '<svg class="join-rol-ico" viewBox="0 0 24 24" aria-hidden="true" focusable="false">' + trazo + "</svg>";
  }

  function pintarRoles() {
    if (!contenedorRoles || !window.RAV) return;
    contenedorRoles.innerHTML = RAV.roles
      .map(function (rol) {
        return (
          '<input type="checkbox" id="rol-' + rol.id + '" name="rol" value="' + rol.id + '">' +
          '<label for="rol-' + rol.id + '">' + iconoRol(rol.id) + "<span>" + rol.nombre + "</span></label>"
        );
      })
      .join("");
  }

  pintarPersonaje();
  pintarRoles();

  // --- Cargador: el logo se dibuja y no se va antes de que se pueda leer ---
  const cargador = document.getElementById("join-loader");
  const nace = Date.now();
  function programar(fn, ms) {
    if (typeof window.setTimeout === "function") return window.setTimeout(fn, ms);
    if (typeof setTimeout === "function") return setTimeout(fn, ms);
    return 0;
  }
  function quitarCargador() {
    if (!cargador || !cargador.classList) return;
    if (cargador.classList.contains("is-oculto")) return;
    cargador.classList.add("is-oculto");
    programar(function () {
      if (cargador.parentNode) cargador.parentNode.removeChild(cargador);
    }, 500);
  }
  // Menos de ~500 ms se siente un salto; mas de 2.5 s se siente colgado.
  function abrirTarjeta() {
    programar(quitarCargador, Math.max(0, 520 - (Date.now() - nace)));
  }
  if (document.readyState === "complete" || typeof window.addEventListener !== "function") {
    abrirTarjeta();
  } else {
    window.addEventListener("load", abrirTarjeta);
  }
  programar(quitarCargador, 2600);

  var rolEntrada = "";

  function anunciarRol(rol, info) {
    const ficha = ROLES_ENTRADA[rol] || ROLES_ENTRADA.member;
    rolEntrada = rol;
    if (quien) {
      quien.setAttribute(
        "aria-label",
        "Entras como " + ficha.titulo + (ficha.detalle ? " · " + ficha.detalle : "")
      );
      quien.innerHTML =
        (ravOk() ? RAV.svg(RAV.espec(basePersonaje, capas)) : "") +
        "<span>" +
        '<i class="join-quien-kicker">Entras como</i>' +
        '<strong class="join-quien-rol">' + ficha.titulo + "</strong>" +
        '<em class="join-quien-det">' +
        (ficha.detalle || "el enlace lo trae") +
        "</em></span>";
      if (quien.classList) quien.classList.add("is-lleno");
    }
    // El visitante entra por un enlace que arma el admin: no pone nombre, no
    // marca roles y no elige personaje. Solo mira.
    if (rol === "visitor") {
      const uno = document.getElementById("join-paso-1");
      const dos = document.getElementById("join-paso-2");
      const retrato = document.getElementById("join-avatares-fieldset");
      const atras = document.getElementById("join-atras");
      if (uno) uno.hidden = true;
      if (dos) dos.hidden = false;
      if (retrato) retrato.hidden = true;
      if (atras) atras.hidden = true;
      const titulo = dos && dos.querySelector ? dos.querySelector(".join-paso-titulo") : null;
      if (titulo) titulo.hidden = true;
      const guia = document.getElementById("join-guia");
      if (guia) guia.textContent = "Entras como visitante: ves todo el tablero y no escribes nada.";
      button.textContent = "Entrar como visitante";
      bienvenida(info);
      contarTiempo(info && info.expires_at);
      return;
    }
    pintarPersonaje();
    if (rol === "mentor") cargarRoster();
  }

  /* Roster: quien ya creo su usuario. La lista viaja atada al token del enlace,
   * asi que el mentor la ve antes de tener sesion. */
  var NOMBRE_ROL = {
    admin: "Admin",
    operator: "Operador",
    mentor: "Mentor",
    member: "Miembro",
    visitor: "Visitante",
  };

  function nombreRol(rol) {
    var clave = String(rol || "").trim().toLowerCase();
    if (NOMBRE_ROL[clave]) return NOMBRE_ROL[clave];
    if (window.RAV) {
      var r = RAV.rolNombre(clave);
      if (r && r !== clave) return r;
    }
    return clave ? clave.charAt(0).toUpperCase() + clave.slice(1) : "Sin rol";
  }

  function cargarRoster() {
    const panel = document.getElementById("join-panel-mentor");
    const lista = document.getElementById("join-roster");
    const nota = document.getElementById("join-roster-nota");
    if (!panel || !lista) return;
    panel.hidden = false;
    if (!token) {
      if (nota) nota.textContent = "Este enlace no trae invitación: pide uno nuevo al admin.";
      return;
    }
    fetch("/api/invite/roster?t=" + encodeURIComponent(token))
      .then(function (res) { return res.ok ? res.json() : null; })
      .then(function (cuerpo) {
        const gente = (cuerpo && (cuerpo.members || cuerpo.items)) || null;
        if (!Array.isArray(gente)) {
          if (nota) nota.textContent = "No se pudo leer la lista. Recarga la página.";
          return;
        }
        if (!gente.length) {
          if (nota) nota.textContent = "Todavía no hay nadie. Sé el primero.";
          return;
        }
        if (nota) nota.textContent = "";
        lista.innerHTML = gente
          .map(function (m) {
            const cara = window.RAV ? RAV.svg(window.RAV.normalizar(m.avatar)) : "";
            const rol = nombreRol(m.role);
            const dentro = m.approved ? "Dentro" : "Pendiente";
            return (
              '<li>' + cara +
              '<span class="join-roster-txt"><strong>' + (m.name || "Sin nombre") + "</strong>" +
              "<em>" + rol + "</em></span>" +
              '<span class="join-estado' + (m.approved ? " is-dentro" : "") + '">' + dentro + "</span></li>"
            );
          })
          .join("");
      })
      .catch(function () {
        if (nota) nota.textContent = "No se pudo leer la lista. Recarga la página.";
      });
  }

  /* El visitante no llena nada: entra por un rato y se va. Primero ve un
   * anuncio corto con el grupo y el logo de Rally, y arriba le queda el tiempo
   * que le falta en el enlace. */
  function bienvenida(info) {
    const capa = document.getElementById("join-anuncio");
    if (!capa) return;
    const nombre = document.getElementById("join-anuncio-nombre");
    if (nombre && info && info.project) {
      nombre.textContent = String(info.project).replace(/[-_]+/g, " ");
    }
    capa.hidden = false;
    const quitar = function () {
      if (capa.hidden) return;
      if (!capa.classList) { capa.hidden = true; return; }
      capa.classList.add("is-sale");
      programar(function () { capa.hidden = true; }, 240);
    };
    programar(quitar, 2600);
    capa.addEventListener("click", quitar);
  }

  var relojTiempo = 0;
  function contarTiempo(expira) {
    const caja = document.getElementById("join-tiempo");
    if (!caja || !expira) return;
    const fin = Number(expira) * 1000;
    const pintar = function () {
      const resto = Math.max(0, Math.floor((fin - Date.now()) / 1000));
      if (!resto) {
        caja.innerHTML = "<b>El enlace venció.</b> Pide otro al admin del equipo.";
        return;
      }
      const min = Math.ceil(resto / 60);
      const hora = Math.floor(min / 60);
      const texto = hora >= 1
        ? hora + (hora === 1 ? " h" : " h") + (min % 60 ? " " + (min % 60) + " min" : "")
        : min + " min";
      caja.innerHTML = "Te queda <b>" + texto + "</b> como visitante";
    };
    pintar();
    caja.hidden = false;
    if (relojTiempo) clearInterval(relojTiempo);
    relojTiempo = setInterval(pintar, 20000);
  }

  if (token) {
    fetch("/api/invite?t=" + encodeURIComponent(token))
      .then(function (res) { return res.ok ? res.json() : null; })
      .then(function (info) { if (info && info.ok) anunciarRol(info.role, info); })
      .catch(function () { /* sin aviso, la entrada sigue funcionando */ });
  }

  function mostrar(text, esError) {
    status.textContent = text || "";
    if (!status.classList) return;
    if (esError) status.classList.add("is-error");
    else status.classList.remove("is-error");
    if (esError && status.classList.remove) status.classList.remove("is-exito");
    // Reanimar el aviso para que el paso de un mensaje a otro se vea.
    status.classList.remove("is-entra");
    void status.offsetWidth;
    if (text) status.classList.add("is-entra");
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
    mostrar("Este enlace no trae invitación. Pide uno nuevo al administrador del equipo.", true);
    button.disabled = true;
  } else {
    input.focus();
  }

  // Escribir una clave nueva a ciegas termina en "no me acuerdo qué puse":
  // el boton la muestra mientras se escribe.
  if (verClave) {
    verClave.addEventListener("click", function () {
      const visible = verClave.getAttribute("aria-pressed") !== "true";
      verClave.setAttribute("aria-pressed", visible ? "true" : "false");
      const etiqueta = visible ? "Ocultar la clave" : "Mostrar la clave";
      verClave.setAttribute("aria-label", etiqueta);
      verClave.setAttribute("title", etiqueta);
      verClave.textContent = visible ? "Ocultar" : "Ver";
      clave.type = visible ? "text" : "password";
      clave.focus();
    });
  }

  // Dos hojas: primero quien eres (nombre, clave y roles), despues solo tu
  // personaje. El nombre es lo unico obligatorio para pasar de hoja.
  function mostrarPaso(numero) {
    const uno = document.getElementById("join-paso-1");
    const dos = document.getElementById("join-paso-2");
    if (!uno || !dos) return;
    const esDos = Number(numero) === 2;
    uno.hidden = esDos;
    dos.hidden = !esDos;
    // La hoja del personaje es otra pantalla: sin el encabezado ni el panel
    // lateral de la invitacion.
    if (document.body && document.body.classList) {
      document.body.classList.toggle("join-personaje", esDos);
    }
    if (esDos) {
      if (vistaCara && vistaCara.scrollIntoView) vistaCara.scrollIntoView({ block: "center" });
      mostrar("");
    } else {
      if (input && input.focus) input.focus();
      mostrar("");
    }
  }

  const siguiente = document.getElementById("join-siguiente");
  if (siguiente) {
    siguiente.addEventListener("click", function () {
      if (!input || !String(input.value || "").trim()) {
        mostrar("Escribe tu nombre para seguir.", true);
        if (input && input.focus) input.focus();
        return;
      }
      mostrarPaso(2);
    });
  }

  const atras = document.getElementById("join-atras");
  if (atras) {
    atras.addEventListener("click", function () { mostrarPaso(1); });
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

  function soltar() {
    button.disabled = false;
    if (button.classList) button.classList.remove("is-cargando");
    espera(false);
  }

  function espera(encendida) {
    const capa = document.getElementById("join-entrando");
    if (!capa) return;
    if (encendida) {
      if (capa.classList) capa.classList.remove("is-sale");
      capa.removeAttribute("hidden");
      return;
    }
    if (capa.hasAttribute("hidden")) return;
    // La capa se va desvaneciendo: si desaparece de golpe se siente un corte.
    if (!capa.classList) { capa.setAttribute("hidden", ""); return; }
    capa.classList.add("is-sale");
    programar(function () {
      capa.setAttribute("hidden", "");
      capa.classList.remove("is-sale");
    }, 220);
  }

  form.addEventListener("submit", async function (event) {
    event.preventDefault();
    const esVisitante = rolEntrada === "visitor";
    const name = esVisitante ? "Visitante" : (input.value || "").trim();
    const password = esVisitante ? "" : (clave.value || "").trim();
    const avatarInput = null;
    const avatar = esVisitante
      ? "av_visitante"
      : (avatarInput ? avatarInput.value : specActual());
    const roles = esVisitante ? [] : Array.prototype.map.call(
      form.querySelectorAll('input[name="rol"]:checked'),
      function (casilla) { return casilla.value; }
    );
    if (!name) {
      mostrar("Escribe tu nombre.", true);
      input.focus();
      return;
    }
    if (password && password.length < 6) {
      mostrar("La clave necesita al menos 6 caracteres.", true);
      clave.focus();
      return;
    }
    button.disabled = true;
    if (button.classList) button.classList.add("is-cargando");
    espera(true);
    mostrar("");
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
        mostrar(mensajeDe(body.error), true);
        soltar();
        return;
      }
      if (body.pending) {
        // La sesion todavia no sirve: el admin tiene que aprobar la solicitud.
        mostrar("Solicitud enviada. Tu usuario ya está creado; el admin del equipo lo aprueba y entras con tu nombre y clave.");
        if (status.classList) status.classList.add("is-exito");
        const irLogin = document.getElementById("join-ir-login");
        const enlaceLogin = document.getElementById("join-ir-login-a");
        if (irLogin && enlaceLogin) {
          enlaceLogin.href = "login.html?project=" + encodeURIComponent(body.project || "main");
          irLogin.hidden = false;
        }
        soltar();
        return;
      }
      if (!body.session || !body.member) {
        // Sin sesion o sin miembro no hay a donde ir: mejor decirlo que
        // guardar "undefined" y romper la siguiente pantalla.
        mostrar("El servidor respondió sin sesión. Recarga e intenta de nuevo.", true);
        soltar();
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
      mostrar("No se pudo contactar al servidor. Revisa la conexión e intenta de nuevo.", true);
      soltar();
    }
  });
})();
