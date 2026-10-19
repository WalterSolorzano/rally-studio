/* Rally Studio — puente de contenido en vivo.
 *
 * Escucha el buzón del servidor local (`/api/content/manifest`) y muestra las
 * propuestas que deja el agente (b) como tarjetas con Aceptar / Descartar.
 * Al aceptar, fusiona el contenido en el estado del usuario y avisa a app.js
 * por su mismo canal de sincronización.
 *
 * Este archivo NO toca la lógica de app.js ni de style.css: inyecta sus
 * propios estilos y solo escucha su canal público.
 */
(function () {
  "use strict";

  var POLL_MS = 2000;
  var STORAGE_KEY = "rally_studio_production_state_2026_v3";
  var CHANNEL_NAME = "rally_studio_auto_sync";
  var SEEN_KEY = "rally_content_seen";
  var DOCK_ID = "rally-content-dock";

  var rendered = Object.create(null);
  var busy = Object.create(null);
  var dock = null;

  function soportado() {
    return location.protocol === "http:" || location.protocol === "https:";
  }

  // -- utilidades -------------------------------------------------------

  function leerVistos() {
    try {
      var raw = sessionStorage.getItem(SEEN_KEY);
      var arr = raw ? JSON.parse(raw) : [];
      return Array.isArray(arr) ? arr : [];
    } catch (e) {
      return [];
    }
  }

  function marcarVisto(id) {
    try {
      var vistos = leerVistos();
      if (vistos.indexOf(id) === -1) {
        vistos.push(id);
        sessionStorage.setItem(SEEN_KEY, JSON.stringify(vistos));
      }
    } catch (e) {
      /* sin sessionStorage: se re-dibuja, no es grave */
    }
  }

  function yaVisto(id) {
    return leerVistos().indexOf(id) !== -1;
  }

  function textoDe(payload) {
    if (!payload || typeof payload !== "object") return "";
    if (typeof payload.text === "string") return payload.text;
    if (typeof payload.value === "string") return payload.value;
    return JSON.stringify(payload);
  }

  function filasDePresupuesto(payload) {
    var fuente = null;
    if (Array.isArray(payload)) fuente = payload;
    else if (payload && Array.isArray(payload.items)) fuente = payload.items;
    else if (payload && Array.isArray(payload.budget)) fuente = payload.budget;
    if (!fuente) return null;

    var filas = [];
    for (var i = 0; i < fuente.length; i++) {
      var it = fuente[i] || {};
      var units = Number(it.units);
      var unitCost = Number(it.unit_cost);
      if (!isFinite(units)) units = 1;
      if (!isFinite(unitCost)) unitCost = 0;
      var fila = {
        concept: String(it.concept || it.name || it.description || ""),
        category: String(it.category || "General"),
        units: units,
        unit_cost: unitCost
      };
      if (it.url) fila.url = String(it.url);
      filas.push(fila);
    }
    return filas;
  }

  // -- estado -----------------------------------------------------------

  function leerEstado() {
    var st = {};
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        var parsed = JSON.parse(raw);
        if (parsed && typeof parsed === "object") st = parsed;
      }
    } catch (e) {
      st = {};
    }
    return st;
  }

  function asegurarForma(st) {
    if (!st.pautado || typeof st.pautado !== "object") {
      st.pautado = { problema: "", solucion: "", prefactibilidad: "", innovacion: "", impacto: "" };
    }
    if (!st.script || typeof st.script !== "object") {
      st.script = { acto1: "", acto2: "", acto3: "", acto4: "" };
    }
    if (!Array.isArray(st.budget)) st.budget = [];
    return st;
  }

  function escribirEstado(st) {
    // `active_tab` no se toca nunca: el puente no cambia de pestaña.
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(st));
    } catch (e) {
      return;
    }

    // app.js escucha este canal; crear una instancia propia hace que la
    // pestaña que acepta también se refresque (el evento `storage` no se
    // dispara en la pestaña que escribe).
    try {
      if (typeof BroadcastChannel === "function") {
        var bc = new BroadcastChannel(CHANNEL_NAME);
        bc.postMessage({ type: "AUTO_SYNC_STATE", state: st });
        bc.close();
      } else {
        location.reload();
      }
    } catch (e) {
      try {
        location.reload();
      } catch (e2) {
        /* nada */
      }
    }
  }

  function fusionar(env) {
    if (!env || typeof env !== "object") return;
    var st = asegurarForma(leerEstado());
    var tab = env.tab;
    var slot = env.slot;
    var payload = env.payload;

    if (tab === "pautado" && typeof st.pautado[slot] === "string") {
      st.pautado[slot] = textoDe(payload);
    } else if (tab === "script" && typeof st.script[slot] === "string") {
      st.script[slot] = textoDe(payload);
    } else if (tab === "budget") {
      var filas = filasDePresupuesto(payload);
      if (filas && filas.length) st.budget = filas;
    } else {
      if (!st.propuestas || typeof st.propuestas !== "object") st.propuestas = {};
      st.propuestas[tab + ":" + slot] = payload;
    }

    escribirEstado(st);
  }

  // -- red --------------------------------------------------------------

  function pedirJSON(url) {
    return fetch(url, { cache: "no-store" }).then(function (res) {
      if (!res.ok) throw new Error("http " + res.status);
      return res.json();
    });
  }

  function postear(url) {
    return fetch(url, { method: "POST", cache: "no-store" }).then(function (res) {
      if (!res.ok) throw new Error("http " + res.status);
      return res.json().catch(function () {
        return { ok: true };
      });
    });
  }

  // -- interfaz ---------------------------------------------------------

  function asegurarDock() {
    if (dock && document.body.contains(dock)) return dock;
    if (!document.body) return null;

    dock = document.getElementById(DOCK_ID);
    if (!dock) {
      dock = document.createElement("div");
      dock.id = DOCK_ID;
      document.body.appendChild(dock);
    }
    inyectarEstilos();
    return dock;
  }

  function inyectarEstilos() {
    if (document.getElementById(DOCK_ID + "-styles")) return;
    var css =
      "#" + DOCK_ID + "{position:fixed;right:18px;bottom:18px;z-index:2147483000;" +
      "display:flex;flex-direction:column;gap:10px;max-width:360px;" +
      "font-family:system-ui,-apple-system,'Segoe UI',Roboto,sans-serif}" +
      "#" + DOCK_ID + ":empty{display:none}" +
      "#" + DOCK_ID + " .rally-content-card{background:#ffffff;border:1px solid #d7dced;" +
      "border-left:3px solid #1d45b9;border-radius:6px;padding:12px 14px;" +
      "box-shadow:0 8px 24px rgba(16,24,40,.18);color:#111827}" +
      "#" + DOCK_ID + " .rcc-head{display:flex;align-items:baseline;gap:8px;justify-content:space-between}" +
      "#" + DOCK_ID + " .rcc-title{font-size:13px;font-weight:700;line-height:1.3}" +
      "#" + DOCK_ID + " .rcc-badge{font-size:9px;letter-spacing:.08em;text-transform:uppercase;" +
      "background:#fde68a;color:#7c4a03;border-radius:3px;padding:2px 5px;white-space:nowrap}" +
      "#" + DOCK_ID + " .rcc-meta{font-size:11px;color:#5b6478;margin-top:4px;line-height:1.35}" +
      "#" + DOCK_ID + " .rcc-actions{display:flex;gap:8px;margin-top:10px}" +
      "#" + DOCK_ID + " button{font:inherit;font-size:11px;font-weight:600;cursor:pointer;" +
      "border-radius:4px;padding:5px 10px;border:1px solid #c7cede;background:#f6f7fb;color:#1f2937}" +
      "#" + DOCK_ID + " button[data-action='apply']{background:#1d45b9;border-color:#1d45b9;color:#fff}" +
      "#" + DOCK_ID + " button[disabled]{opacity:.55;cursor:default}";

    var style = document.createElement("style");
    style.id = DOCK_ID + "-styles";
    style.textContent = css;
    document.head.appendChild(style);
  }

  function crearTarjeta(item) {
    var card = document.createElement("div");
    card.className = "rally-content-card";
    card.setAttribute("data-proposal-id", item.id);

    var head = document.createElement("div");
    head.className = "rcc-head";

    var title = document.createElement("span");
    title.className = "rcc-title";
    title.textContent = item.title || "Propuesta";
    head.appendChild(title);

    if (item.simulated) {
      var badge = document.createElement("span");
      badge.className = "rcc-badge";
      badge.textContent = "Simulado";
      head.appendChild(badge);
    }

    var meta = document.createElement("div");
    meta.className = "rcc-meta";
    var partes = [item.tab, item.slot, item.source].filter(function (p) {
      return p;
    });
    meta.textContent = partes.join(" · ");

    var actions = document.createElement("div");
    actions.className = "rcc-actions";

    var apply = document.createElement("button");
    apply.type = "button";
    apply.setAttribute("data-action", "apply");
    apply.textContent = "Aceptar";

    var discard = document.createElement("button");
    discard.type = "button";
    discard.setAttribute("data-action", "discard");
    discard.textContent = "Descartar";

    actions.appendChild(apply);
    actions.appendChild(discard);

    card.appendChild(head);
    card.appendChild(meta);
    card.appendChild(actions);
    return card;
  }

  function quitarTarjeta(id) {
    delete rendered[id];
    var nodo = dock && dock.querySelector("[data-proposal-id='" + id + "']");
    if (nodo && nodo.parentNode) nodo.parentNode.removeChild(nodo);
  }

  function render(items) {
    var cont = asegurarDock();
    if (!cont) return;

    var vivos = Object.create(null);
    for (var i = 0; i < items.length; i++) {
      var item = items[i];
      if (!item || !item.id) continue;
      vivos[item.id] = true;
      if (yaVisto(item.id) || rendered[item.id]) continue;
      cont.appendChild(crearTarjeta(item));
      rendered[item.id] = true;
    }

    // Lo que ya no está en el manifiesto deja de mostrarse.
    for (var id in rendered) {
      if (!vivos[id]) quitarTarjeta(id);
    }
  }

  // -- acciones ---------------------------------------------------------

  function aceptar(id) {
    if (busy[id]) return Promise.resolve();
    busy[id] = true;

    return pedirJSON("/api/content/" + encodeURIComponent(id))
      .catch(function () {
        return null; // ya aplicada en otra pestaña
      })
      .then(function (env) {
        return postear("/api/content/" + encodeURIComponent(id) + "/apply").then(function () {
          if (env) fusionar(env);
          marcarVisto(id);
          quitarTarjeta(id);
        });
      })
      .catch(function () {
        /* fallo de red: silencio, se reintenta en el próximo ciclo */
      })
      .then(function () {
        delete busy[id];
      });
  }

  function descartar(id) {
    if (busy[id]) return Promise.resolve();
    busy[id] = true;

    return postear("/api/content/" + encodeURIComponent(id) + "/discard")
      .then(function () {
        marcarVisto(id);
        quitarTarjeta(id);
      })
      .catch(function () {
        /* fallo de red: silencio */
      })
      .then(function () {
        delete busy[id];
      });
  }

  function alPulsar(event) {
    var boton = event.target.closest ? event.target.closest("button[data-action]") : null;
    if (!boton) return;
    var card = boton.closest("[data-proposal-id]");
    if (!card) return;

    var id = card.getAttribute("data-proposal-id");
    var accion = boton.getAttribute("data-action");
    boton.disabled = true;

    if (accion === "apply") aceptar(id);
    else if (accion === "discard") descartar(id);
  }

  // -- ciclo ------------------------------------------------------------

  function poll() {
    if (!soportado()) return Promise.resolve();
    return pedirJSON("/api/content/manifest")
      .then(function (m) {
        var items = m && Array.isArray(m.items) ? m.items : [];
        render(items);
      })
      .catch(function () {
        /* servicio apagado: la ventana sigue funcionando igual */
      });
  }

  function iniciar() {
    if (!soportado()) return;
    asegurarDock();
    if (dock) dock.addEventListener("click", alPulsar);
    poll();
    setInterval(poll, POLL_MS);
  }

  window.RallyContentBridge = {
    poll: poll,
    apply: aceptar,
    discard: descartar
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", iniciar);
  } else {
    iniciar();
  }
})();
