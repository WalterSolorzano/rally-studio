(function () {
  "use strict";

  const statusEl = document.getElementById("admin-status");
  const listEl = document.getElementById("members-list");
  const inviteBtn = document.getElementById("create-invite");
  const copyBtn = document.getElementById("copy-invite");
  const inviteOut = document.getElementById("invite-url");
  const ttlSel = document.getElementById("invite-ttl");
  const tokenInput = document.getElementById("admin-token");
  const saveTokenBtn = document.getElementById("save-token");
  const sessionState = document.getElementById("session-state");
  const whoEl = document.getElementById("admin-who");
  const certamenBtn = document.getElementById("save-certamen");
  const form = document.getElementById("identity-form");
  const squadEl = document.getElementById("id-squad");
  const uniEl = document.getElementById("id-uni");
  const cityEl = document.getElementById("id-city");
  const logoFile = document.getElementById("id-logo-file");
  const logoPreview = document.getElementById("identity-logo-preview");
  const logoHint = document.getElementById("logo-hint");
  const closeAllBtn = document.getElementById("close-all");
  const auditBtn = document.getElementById("load-audit");
  const auditEl = document.getElementById("audit-list");

  const IDENTITY_KEYS = {
    team_name: "squad", university: "uni", city: "city", team_logo_img: "logo",
  };

  let sections = {};
  let identity = { team_name: "", university: "", city: "", team_logo_img: "", rally_type: "" };
  let logoCambiado = false;

  function project() {
    const fromUrl = new URLSearchParams(location.search).get("project");
    return (fromUrl || localStorage.getItem("rally_project") || "main").trim() || "main";
  }

  function token() {
    return localStorage.getItem("rally_session_token") || "";
  }

  function role() {
    return (localStorage.getItem("rally_member_role") || "").trim();
  }

  function puedeEditar() {
    const r = role();
    return r === "admin" || r === "operator";
  }

  function status(text) {
    statusEl.textContent = text || "";
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

  function fecha(ts) {
    const n = Number(ts);
    if (!n) return "sin registro";
    try {
      return new Date(n * 1000).toLocaleString("es", {
        day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit",
      });
    } catch (e) { return "sin registro"; }
  }

  // ── Sesión ──────────────────────────────────────────────────────────
  async function cargarSesion() {
    if (!token()) {
      sessionState.textContent = "Sin sesión.";
      return false;
    }
    try {
      const res = await api("/api/session");
      if (!res.ok) {
        sessionState.textContent = "Sesión vencida.";
        return false;
      }
      localStorage.setItem("rally_project", res.body.project || project());
      localStorage.setItem("rally_member_id", res.body.member.id);
      localStorage.setItem("rally_member_name", res.body.member.name);
      localStorage.setItem("rally_member_role", res.body.member.role);
      sessionState.textContent = "Sesión: " + res.body.member.name;
      pintarQuien(res.body.member);
      return true;
    } catch (e) {
      sessionState.textContent = "Sin conexión.";
      return false;
    }
  }

  function pintarQuien(member) {
    if (!member) return;
    const etiqueta = member.role === "operator" ? "operador" : member.role === "admin" ? "admin" : "miembro";
    whoEl.textContent = member.name + " · " + etiqueta;
  }

  async function guardarSesion() {
    const value = (tokenInput.value || "").trim();
    if (!value) { status("Pega el token."); return; }
    localStorage.setItem("rally_session_token", value);
    saveTokenBtn.disabled = true;
    const ok = await cargarSesion();
    saveTokenBtn.disabled = false;
    tokenInput.value = "";
    if (ok) { status(""); arrancar(); }
  }

  // ── Identidad + certamen ────────────────────────────────────────────
  async function cargarIdentidad() {
    const res = await api("/api/sections?since=0");
    if (res.status === 401) { status("Acceso vencido."); return; }
    if (!res.ok) { status("No se pudo leer el proyecto."); return; }
    sections = res.body.sections || {};
    Object.keys(IDENTITY_KEYS).forEach(function (key) {
      identity[key] = seccionValor(key);
    });
    identity.rally_type = seccionValor("rally_type");
    squadEl.value = identity.team_name || "";
    uniEl.value = identity.university || "";
    cityEl.value = identity.city || "";
    pintarLogo(identity.team_logo_img);
    marcarCertamen(identity.rally_type);
    if (!puedeEditar()) {
      [squadEl, uniEl, cityEl, logoFile, certamenBtn].forEach(function (el) { el.disabled = true; });
      document.querySelectorAll('input[name="rally"]').forEach(function (el) { el.disabled = true; });
      document.getElementById("save-identity").disabled = true;
      inviteBtn.disabled = true;
      status("Solo lectura: definido por admin.");
    }
  }

  function seccionValor(key) {
    const item = sections[key];
    return item && item.data !== null && item.data !== undefined ? item.data : "";
  }

  function marcarCertamen(tipo) {
    document.querySelectorAll(".choice-card").forEach(function (card) {
      const on = card.dataset.rally === tipo;
      card.classList.toggle("is-on", on);
      const radio = card.querySelector("input");
      if (radio) radio.checked = on;
    });
  }

  function pintarLogo(src) {
    if (src) {
      logoPreview.src = src;
      logoPreview.hidden = false;
      logoHint.hidden = true;
    } else {
      logoPreview.hidden = true;
      logoPreview.removeAttribute("src");
      logoHint.hidden = false;
    }
  }

  async function escribirSeccion(key, value) {
    const version = sections[key] ? Number(sections[key].version) || 0 : 0;
    const res = await api("/api/sections/" + encodeURIComponent(key), {
      method: "POST",
      body: JSON.stringify({ data: value, base_version: version }),
    });
    if (res.status === 403) return { ok: false, msg: "Sin permiso." };
    if (res.status === 409 || res.status === 423) return { ok: false, msg: "Ocupado por otro: reintenta." };
    if (!res.ok) return { ok: false, msg: "No se pudo guardar." };
    if (res.body.section) sections[key] = res.body.section;
    return { ok: true };
  }

  async function guardarCertamen() {
    const radio = document.querySelector('input[name="rally"]:checked');
    if (!radio) { status("Elige un certamen."); return; }
    const nuevo = radio.value;
    const hayTrabajo = !!(seccionValor("challenge_id") || seccionValor("solution_approved"));
    if (hayTrabajo && nuevo !== identity.rally_type) {
      const ok = window.confirm("Cambiar el certamen recalcula horas, moneda y rúbrica. ¿Seguir?");
      if (!ok) return;
    }
    certamenBtn.disabled = true;
    const r = await escribirSeccion("rally_type", nuevo);
    certamenBtn.disabled = false;
    if (!r.ok) { status(r.msg); return; }
    identity.rally_type = nuevo;
    marcarCertamen(nuevo);
    status("Certamen guardado.");
  }

  async function guardarIdentidad(ev) {
    if (ev) ev.preventDefault();
    const cambios = [
      ["team_name", squadEl.value.trim()],
      ["university", uniEl.value.trim()],
      ["city", cityEl.value.trim()],
    ];
    if (logoCambiado && logoPreview.src) {
      cambios.push(["team_logo_img", logoPreview.src]);
    }
    const pendientes = cambios.filter(function (c) {
      return String(identity[c[0]] || "") !== String(c[1] || "");
    });
    if (cambios[0][1] === "" || cambios[1][1] === "") { status("Squad y universidad son obligatorios."); return; }
    if (!pendientes.length) { status("Sin cambios."); return; }
    const btn = document.getElementById("save-identity");
    btn.disabled = true;
    for (const [key, value] of pendientes) {
      const r = await escribirSeccion(key, value);
      if (!r.ok) { btn.disabled = false; status(r.msg); return; }
      identity[key] = value;
    }
    btn.disabled = false;
    logoCambiado = false;
    status("Identidad guardada.");
  }

  // ── Accesos ─────────────────────────────────────────────────────────
  function avatar(member) {
    const span = document.createElement("span");
    span.className = "member-avatar";
    const id = window.RAV ? RAV.normalizar(member.avatar) : "";
    span.title = window.RAV ? RAV.rol(id) : "Avatar";
    span.innerHTML = window.RAV ? RAV.svg(id) : "";
    return span;
  }

  function etiquetaRol(role) {
    return role === "operator" ? "operador" : role === "admin" ? "admin" : "miembro";
  }

  function fila(member, unicoAdmin) {
    const row = document.createElement("div");
    row.className = "member-row" + (member.revoked ? " is-revoked" : "")
      + (member.pending ? " is-pending" : "");
    row.dataset.memberId = member.id;

    const name = document.createElement("span");
    name.className = "member-name";
    name.textContent = member.name;
    name.prepend(avatar(member));

    const rol = document.createElement("span");
    const oficios = (member.roles || []).map(function (r) {
      return window.RAV ? RAV.rolNombre(r) : r;
    }).join(" · ");
    if (role() === "admin" && !member.revoked && !member.pending && !unicoAdmin) {
      const sel = document.createElement("select");
      sel.className = "role-select";
      sel.setAttribute("aria-label", "Rol de " + member.name);
      [["admin", "Admin"], ["operator", "Operador"], ["member", "Miembro"]].forEach(function (opt) {
        const o = document.createElement("option");
        o.value = opt[0];
        o.textContent = opt[1];
        if (member.role === opt[0]) o.selected = true;
        sel.appendChild(o);
      });
      sel.addEventListener("change", function () { cambiarRol(member, sel.value); });
      rol.appendChild(sel);
    } else {
      const chip = document.createElement("span");
      chip.className = "role-chip is-" + (member.role || "member");
      chip.textContent = etiquetaRol(member.role);
      rol.appendChild(chip);
    }
    if (oficios) {
      const of = document.createElement("span");
      of.className = "member-seen";
      of.textContent = oficios;
      rol.appendChild(of);
    }

    const seen = document.createElement("span");
    seen.className = "member-seen";
    seen.textContent = member.pending
      ? "Esperando aprobación"
      : "Último acceso: " + fecha(member.last_seen);

    row.appendChild(name);
    row.appendChild(rol);
    row.appendChild(seen);

    if (!member.revoked && member.pending && role() === "admin") {
      const acciones = document.createElement("span");
      acciones.className = "member-actions";
      const si = document.createElement("button");
      si.type = "button";
      si.className = "primary";
      si.textContent = "Aprobar";
      si.setAttribute("data-member-id", member.id);
      si.addEventListener("click", function () { aprobar(member, true); });
      const no = document.createElement("button");
      no.type = "button";
      no.className = "danger";
      no.textContent = "Rechazar";
      no.setAttribute("data-member-id", member.id);
      no.addEventListener("click", function () { aprobar(member, false); });
      acciones.appendChild(si);
      acciones.appendChild(no);
      row.appendChild(acciones);
    } else if (!member.revoked && member.pending) {
      const espera = document.createElement("span");
      espera.className = "role-chip is-pending";
      espera.textContent = "Pendiente";
      row.appendChild(espera);
    } else if (!member.revoked && !unicoAdmin) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "danger";
      btn.textContent = "Retirar";
      btn.setAttribute("data-member-id", member.id);
      btn.addEventListener("click", function () { revocar(member); });
      row.appendChild(btn);
    }
    return row;
  }

  async function cargarMiembros() {
    if (!token()) { status("Abre tu enlace de invitación para entrar."); return; }
    status("");
    try {
      const res = await api("/api/members", { method: "GET" });
      if (res.status === 401) { status("Tu acceso ya no está activo."); return; }
      if (res.status === 403) { status("Sin permiso."); return; }
      if (!res.ok) { status("No se pudo cargar el equipo."); return; }
      const members = res.body.members || [];
      const admins = members.filter(function (m) { return m.role === "admin" && !m.revoked; }).length;
      listEl.innerHTML = "";
      members.forEach(function (m) { listEl.appendChild(fila(m, admins === 1 && m.role === "admin")); });
    } catch (e) {
      status("Sin conexión.");
    }
  }

  async function aprobar(member, aprobado) {
    try {
      const res = await api("/api/members/" + encodeURIComponent(member.id) + "/approve", {
        method: "POST", body: JSON.stringify({ approved: aprobado }),
      });
      if (!res.ok) {
        status(res.body.error === "sin-permiso" ? "Sin permiso." : "No se pudo guardar.");
        return;
      }
      status(aprobado ? "Solicitud aprobada." : "Solicitud rechazada.");
      cargarMiembros();
    } catch (e) { status("Sin conexión."); }
  }

  async function cambiarRol(member, nuevo) {
    try {
      const res = await api("/api/members/" + encodeURIComponent(member.id) + "/role", {
        method: "POST", body: JSON.stringify({ role: nuevo }),
      });
      if (!res.ok) {
        status(res.body.error === "ultimo-admin" ? "No puedes degradar al único admin." : "No se pudo cambiar el rol.");
        cargarMiembros();
        return;
      }
      status("Rol actualizado.");
      cargarMiembros();
    } catch (e) { status("Sin conexión."); }
  }

  async function crearInvitacion() {
    if (!puedeEditar()) { status("Sin permiso."); return; }
    inviteBtn.disabled = true;
    status("Creando enlace...");
    const ttl = Number(ttlSel && ttlSel.value) || 48;
    try {
      const res = await api("/api/invites", { method: "POST", body: JSON.stringify({ ttl_hours: ttl }) });
      if (!res.ok) { status("No se pudo crear el enlace."); return; }
      const url = location.origin + "/" + res.body.url_path;
      inviteOut.textContent = url;
      copyBtn.hidden = false;
      copyBtn.dataset.url = url;
      status("Enlace creado. Sirve una sola vez.");
    } catch (e) {
      status("Sin conexión.");
    } finally {
      inviteBtn.disabled = false;
    }
  }

  async function revocar(member) {
    const ok = window.confirm("¿Retirar el acceso de " + member.name + "? Su trabajo se conserva.");
    if (!ok) return;
    try {
      const res = await api("/api/members/" + encodeURIComponent(member.id) + "/revoke", {
        method: "POST", body: JSON.stringify({}),
      });
      if (!res.ok) {
        status(res.body.error === "ultimo-admin" ? "No puedes retirar al único admin." : "No se pudo retirar.");
        return;
      }
      status("Acceso retirado a " + member.name + ".");
      cargarMiembros();
    } catch (e) { status("Sin conexión."); }
  }

  async function cerrarTodo() {
    if (role() !== "admin") { status("Sin permiso."); return; }
    if (!window.confirm("Cierra todas las sesiones, incluida la tuya. ¿Seguir?")) return;
    closeAllBtn.disabled = true;
    try {
      const res = await api("/api/admin/panic", { method: "POST", body: JSON.stringify({}) });
      closeAllBtn.disabled = false;
      if (!res.ok) { status("No se pudo cerrar."); return; }
      status("Sesiones cerradas: " + (res.body.cerradas || 0) + ". Vuelve a entrar con la llave.");
      cargarMiembros();
    } catch (e) { closeAllBtn.disabled = false; status("Sin conexión."); }
  }

  const QUE_HIZO = {
    download: "Bajó un archivo",
    intruso: "Probó rutas sin sesión",
    sesion_cruzada: "Sesión usada desde otra máquina",
    panic: "Cerró todas las sesiones",
    approved: "Aprobó una solicitud",
    unapproved: "Rechazó una solicitud",
    role_changed: "Cambió un rol",
  };

  async function cargarRegistro() {
    status("");
    try {
      const res = await api("/api/events?limit=40", { method: "GET" });
      if (!res.ok) { status("No se pudo leer el registro."); return; }
      const eventos = res.body.events || [];
      auditEl.innerHTML = "";
      if (!eventos.length) {
        const vacio = document.createElement("p");
        vacio.className = "admin-hint";
        vacio.textContent = "Sin movimientos.";
        auditEl.appendChild(vacio);
        return;
      }
      eventos.slice().reverse().forEach(function (ev) {
        const row = document.createElement("div");
        row.className = "audit-row";
        const quien = document.createElement("span");
        quien.className = "audit-name";
        quien.textContent = ev.actor || "?";
        const que = document.createElement("span");
        que.className = "audit-what";
        const detalle = ev.detail || {};
        que.textContent = (QUE_HIZO[ev.action] || ev.action || "") +
          (detalle.file ? ": " + detalle.file : "") +
          (detalle.ip ? " · " + detalle.ip : "");
        const cuando = document.createElement("span");
        cuando.className = "member-seen";
        cuando.textContent = fecha(ev.at);
        row.appendChild(quien);
        row.appendChild(que);
        row.appendChild(cuando);
        auditEl.appendChild(row);
      });
    } catch (e) { status("Sin conexión."); }
  }

  // ── Arranque ────────────────────────────────────────────────────────
  document.querySelectorAll(".choice-card").forEach(function (card) {
    card.addEventListener("click", function () {
      if (!puedeEditar()) return;
      marcarCertamen(card.dataset.rally);
    });
  });

  logoFile.addEventListener("change", function (ev) {
    const file = ev.target.files && ev.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function (e) { pintarLogo(e.target.result); logoCambiado = true; };
    reader.readAsDataURL(file);
  });

  form.addEventListener("submit", guardarIdentidad);
  certamenBtn.addEventListener("click", guardarCertamen);
  inviteBtn.addEventListener("click", crearInvitacion);
  if (closeAllBtn) closeAllBtn.addEventListener("click", cerrarTodo);
  if (auditBtn) auditBtn.addEventListener("click", cargarRegistro);
  saveTokenBtn.addEventListener("click", guardarSesion);
  copyBtn.addEventListener("click", async function () {
    const url = copyBtn.dataset.url || "";
    if (!url) return;
    try { await navigator.clipboard.writeText(url); status("Enlace copiado."); }
    catch (e) { status("Copia manualmente el enlace."); }
  });

  async function arrancar() {
    const ok = await cargarSesion();
    if (!ok) { status("Entra con tu enlace o token."); return; }
    await cargarIdentidad();
    if (puedeEditar()) cargarMiembros();
  }

  arrancar();
})();
