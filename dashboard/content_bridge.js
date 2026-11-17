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
  var STORAGE_KEY = "rally_studio_production_state_2026_v4";
  var CHANNEL_NAME = "rally_studio_auto_sync";
  var SEEN_KEY = "rally_content_seen";
  var DOCK_ID = "rally-content-dock";

  // Pestañas cuyo contenido va a un campo concreto del estado. `canvas` se
  // trata aparte porque escribe dentro de `model_canvas` (un objeto de 9
  // cuadrantes), no un campo plano.
  var CAMPOS_POR_TAB = {
    certamen: ["rally_type", "category", "hours_total"],
    team: ["team_name", "university", "city", "project_name", "team_logo_img"],
    challenges: ["challenge_id", "challenge_title"],
    solution: ["solution_raw_input", "solution_thesis", "solution_simple", "solution_approved"],
    impact: ["ods_ids", "national_plan_axis"],
    multi_ai: ["tasks"],
    resources: ["team_logo_img"],
    canvas: [],
    webdemo: ["site_url"]
  };

  // Nombres legibles: el dock no debe hablarle al usuario en jerga interna.
  var ETIQUETA_TAB = {
    certamen: "Certamen", team: "Equipo", challenges: "Reto", solution: "Solución",
    impact: "Impacto", multi_ai: "Despacho", pautado: "Documento pautado",
    budget: "Presupuesto", resources: "Recursos", canvas: "Canvas",
    script: "Guion", webdemo: "Prototipo", timeline: "Entrega", resumen: "Resumen"
  };
  var ETIQUETA_SLOT = {
    problema: "Problema", solucion: "Solución", impacto: "Impacto",
    innovacion: "Innovación", prefactibilidad: "Prefactibilidad",
    acto1: "Acto 1", acto2: "Acto 2", acto3: "Acto 3", acto4: "Acto 4",
    costos: "Costos", main: ""
  };

  var SUBIR_MS = 800;
  var MAX_FALLOS = 2;
  var REPOSO_MS = 10000;

  var fallos = 0;
  var salud = "ok";
  var proximoPoll = 0;
  var subidaPendiente = null;
  var suprimirSubida = 0;

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

  // Todo lo que entra por el buzón avisa a la app. `notify.js` escucha este
  // evento y decide si muestra una notificación del sistema; el puente no
  // necesita permiso ni sabe si el navegador lo concede.
  function avisar(env, tipo) {
    try {
      var payload = env && env.payload && typeof env.payload === "object" ? env.payload : {};
      var texto = textoDe(payload);
      var detalle = {
        tipo: tipo || "entrega",
        id: String((env && env.id) || ""),
        titulo: String((env && (env.title || env.source)) || "Rally Studio"),
        texto: texto,
        tab: String((env && env.tab) || ""),
        slot: String((env && env.slot) || ""),
        fuente: String((env && env.source) || ""),
        url: typeof payload.url === "string" ? payload.url : ""
      };
      document.dispatchEvent(new CustomEvent("rally:aviso", { detail: detalle }));
    } catch (e) {
      /* sin CustomEvent: la notificación es un extra, no un requisito */
    }
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

    // El estado del tablero guarda el costo canónico en USD. Si la propuesta
    // declara córdobas, se convierte con la tasa BCN del estado.
    var estado = leerEstado();
    var tasa = Number(estado.exchange_rate_bcn) || 0;
    var moneda = String((payload && (payload.currency || payload.moneda)) || "").toUpperCase();
    var enCordobas = moneda === "NIO" || moneda === "C$" || moneda === "CORDOBAS" || moneda === "CÓRDOBAS";

    var filas = [];
    for (var i = 0; i < fuente.length; i++) {
      var it = fuente[i] || {};
      var units = Number(it.units);
      var unitCost = Number(it.unit_cost);
      if (!isFinite(units)) units = 1;
      if (!isFinite(unitCost)) unitCost = 0;
      var itemMoneda = String(it.currency || it.moneda || "").toUpperCase();
      var itemEnCordobas = itemMoneda === "NIO" || itemMoneda === "C$" || itemMoneda === "CORDOBAS" || itemMoneda === "CÓRDOBAS";
      if ((enCordobas || itemEnCordobas) && tasa > 0) {
        unitCost = unitCost / tasa;
      }
      var texto = String(it.element || it.concept || it.name || it.description || "");
      var fila = {
        // La tabla y los exports de app.js leen `element`; el dossier lee
        // `concept`. Se escriben los dos con el mismo valor.
        element: texto,
        concept: texto,
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

  function escribirEstado(st, esRemoto) {
    // `active_tab` no se toca nunca: el puente no cambia de pestaña.
    if (!esRemoto) st._sync_ts = Date.now();
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

    // La sincronizacion del estado vive ahora en section_sync.js. Cada seccion
    // viaja sola y con version; aqui solo queda el buzon de propuestas.
  }

  function subirEstado() {
    // Compatibilidad con la API publica del puente. Ya no sube el estado
    // completo: section_sync.js manda solo las secciones que cambiaron.
  }

  function sincronizarRemoto() {
    return Promise.resolve();
  }

  function fusionar(env) {
    if (!env || typeof env !== "object") return false;
    var st = asegurarForma(leerEstado());
    var tab = env.tab;
    var slot = env.slot;
    var payload = env.payload;
    var cambio = false;

    if (tab === "pautado" && typeof st.pautado[slot] === "string") {
      st.pautado[slot] = textoDe(payload);
      cambio = true;
    } else if (tab === "script" && typeof st.script[slot] === "string") {
      st.script[slot] = textoDe(payload);
      cambio = true;
    } else if (tab === "budget") {
      var filas = filasDePresupuesto(payload);
      if (filas && filas.length) {
        st.budget = filas;
        cambio = true;
      }
    } else if (tab === "timeline") {
      // La pestaña de cierre no tiene un campo de texto: sus avisos son del
      // tipo "ya terminó, mira el resumen". Se guardan en `avisos` para no
      // perderlos y, si traen `payload.url`, el botón los abre.
      var previos = Array.isArray(st.avisos) ? st.avisos : [];
      // Un mismo aviso puede volver en cada sondeo: entra una sola vez por id.
      var repetido = previos.some(function (a) {
        return a && a.id && a.id === env.id;
      });
      if (repetido) return false;
      var aviso = {
        id: String(env.id || ""),
        title: String(env.title || ""),
        text: textoDe(payload),
        url: payload && typeof payload.url === "string" ? payload.url : "",
        source: String(env.source || ""),
        ts: Date.now()
      };
      if (!Array.isArray(st.avisos)) st.avisos = [];
      st.avisos.unshift(aviso);
      st.avisos = st.avisos.slice(0, 20);
      cambio = true;
    } else if (tab === "canvas") {
      // La IA devuelve los cuadrantes ya redactados para el reto elegido:
      // { cells: { socios: "...", propuesta: "...", ... } } o model_canvas.
      var cellsIn = (payload && (payload.cells || payload.model_canvas)) || null;
      if (cellsIn && typeof cellsIn === "object") {
        var keysCanvas = ["socios", "actividades", "propuesta", "relaciones", "segmentos", "recursos", "canales", "costes", "ingresos"];
        var nextCanvas = Object.assign({}, st.model_canvas || {});
        var tocado = false;
        for (var kc = 0; kc < keysCanvas.length; kc++) {
          var cellKey = keysCanvas[kc];
          var valCell = cellsIn[cellKey];
          if (typeof valCell === "string" && valCell.trim()) {
            nextCanvas[cellKey] = valCell.trim();
            tocado = true;
          }
        }
        if (tocado) { st.model_canvas = nextCanvas; cambio = true; }
      }
    } else if (CAMPOS_POR_TAB[tab] && payload && typeof payload === "object") {
      var campos = CAMPOS_POR_TAB[tab];
      for (var i = 0; i < campos.length; i++) {
        var campo = campos[i];
        if (Object.prototype.hasOwnProperty.call(payload, campo)) {
          st[campo] = payload[campo];
          cambio = true;
        }
      }
    }

    if (!cambio) return false;
    escribirEstado(st);
    return true;
  }

  // -- red --------------------------------------------------------------

  function pedirJSON(url) {
    return fetch(url, { cache: "no-store", headers: cabeceras() }).then(function (res) {
      if (!res.ok) throw new Error("http " + res.status);
      return res.json();
    });
  }

  function postear(url) {
    return fetch(url, { method: "POST", cache: "no-store", headers: cabeceras() }).then(function (res) {
      if (!res.ok) throw new Error("http " + res.status);
      return res.json().catch(function () {
        return { ok: true };
      });
    });
  }

  function cabeceras() {
    var headers = {};
    try {
      var token = localStorage.getItem("rally_session_token");
      if (token) headers.Authorization = "Bearer " + token;
    } catch (e) {}
    return headers;
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
    asegurarCabecera();
    return dock;
  }

  // El buzón arranca cerrado: es un aviso, no un panel que tape la pantalla.
  function asegurarCabecera() {
    if (!dock || dock.querySelector(".dock-head")) return;
    var head = document.createElement("button");
    head.type = "button";
    head.className = "dock-head";
    head.addEventListener("click", function () {
      dock.classList.toggle("is-open");
      actualizarCabecera();
    });
    dock.insertBefore(head, dock.firstChild);
    actualizarCabecera();
  }

  function actualizarCabecera() {
    if (!dock) return;
    var head = dock.querySelector(".dock-head");
    if (!head) return;
    var n = dock.querySelectorAll(".rally-content-card").length;
    var abierto = dock.classList.contains("is-open");
    head.innerHTML = "";
    var txt = document.createElement("span");
    txt.className = "dock-head-txt";
    txt.textContent = n === 0 ? "Buzón vacío" : n === 1 ? "1 propuesta" : n + " propuestas";
    head.appendChild(txt);
    var caret = document.createElement("span");
    caret.className = "dock-head-caret";
    caret.textContent = abierto ? "▾" : "▴";
    head.appendChild(caret);
    head.style.display = n === 0 ? "none" : "";
  }

  function inyectarEstilos() {
    if (document.getElementById(DOCK_ID + "-styles")) return;
    var css =
      "#" + DOCK_ID + "{position:fixed;right:18px;bottom:18px;z-index:2147483000;" +
      "display:flex;flex-direction:column;gap:8px;width:352px;max-width:calc(100vw - 36px);" +
      "max-height:calc(100vh - 140px);overflow-y:auto;overscroll-behavior:contain;" +
      "pointer-events:none;" +
      "font-family:var(--font-ui,system-ui,-apple-system,'Segoe UI',Roboto,sans-serif)}" +
      "#" + DOCK_ID + ":empty{display:none}" +
      "#" + DOCK_ID + " .rally-content-card{pointer-events:auto;background:var(--bg-surface,#fff);border:1px solid var(--border-light,#d7dced);" +
      "border-left:2px solid var(--color-primary,#0866F5);border-radius:8px;padding:12px 14px;" +
      "box-shadow:0 4px 12px rgba(13,27,53,.10);color:var(--text-main,#111827)}" +
      "#" + DOCK_ID + " .rcc-head{display:flex;align-items:baseline;gap:8px;justify-content:space-between}" +
      "#" + DOCK_ID + " .rcc-title{font-size:13px;font-weight:700;line-height:1.3}" +
      "#" + DOCK_ID + " .rcc-meta{font-size:11px;color:var(--text-muted,#5b6478);margin-top:4px;line-height:1.35}" +
      "#" + DOCK_ID + " .rcc-status{font-size:11px;color:var(--text-muted,#5b6478);background:var(--bg-subtle,#f6f7fb);" +
      "border:1px solid var(--border-light,#DCE7F5);border-radius:4px;padding:6px 8px;text-align:center}" +
      "#" + DOCK_ID + " .rcc-note{font-size:11px;color:var(--text-muted,#7c4a03);margin-top:8px}" +
      "#" + DOCK_ID + " .rcc-actions{display:flex;gap:8px;margin-top:10px}" +
      "#" + DOCK_ID + " button{font:inherit;font-size:11.5px;font-weight:600;cursor:pointer;" +
      "border-radius:6px;padding:6px 12px;border:1px solid var(--border-strong,#c7cede);" +
      "background:var(--bg-surface,#fff);color:var(--text-body,#1f2937)}" +
      "#" + DOCK_ID + " button[data-action='apply']{background:var(--color-primary,#0866F5);" +
      "border-color:var(--color-primary,#0866F5);color:#fff}" +
      "#" + DOCK_ID + " button[disabled]{opacity:.55;cursor:default}" +
      "#" + DOCK_ID + " .dock-head{pointer-events:auto;display:flex;align-items:center;justify-content:space-between;" +
      "gap:10px;padding:7px 12px;border:1px solid var(--border-strong,#DCE7F5);border-radius:999px;" +
      "background:var(--bg-surface,#fff);box-shadow:0 2px 10px rgba(13,27,53,.12);font:inherit;font-size:12px;" +
      "font-weight:700;color:var(--text-title,#13213A);cursor:pointer;align-self:flex-end;width:100%}" +
      "#" + DOCK_ID + " .dock-head-caret{font-size:10px;color:var(--text-muted,#5C7193)}" +
      "#" + DOCK_ID + ":not(.is-open){width:auto;max-width:min(240px,calc(100vw - 36px));background:none;overflow:visible}" +
      "#" + DOCK_ID + ":not(.is-open) .rally-content-card{display:none}" +
      "#" + DOCK_ID + " .rally-content-card{cursor:pointer}" +
      "#" + DOCK_ID + " .rally-content-card.is-collapsed{padding:9px 12px}" +
      "#" + DOCK_ID + " .rally-content-card.is-collapsed .rcc-meta," +
      "#" + DOCK_ID + " .rally-content-card.is-collapsed .rcc-actions," +
      "#" + DOCK_ID + " .rally-content-card.is-collapsed .rcc-note{display:none}" +
      "#" + DOCK_ID + " .rally-content-card.is-collapsed .rcc-title{" +
      "white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-size:12px;font-weight:600}" +
      "@media (min-width:1100px){" +
      "#" + DOCK_ID + "{right:calc(300px + 18px)}" +
      "body.panel-collapsed #" + DOCK_ID + "{right:18px}" +
      "}" +
      "@media (max-width:768px){" +
      "#" + DOCK_ID + "{left:10px;right:10px;bottom:calc(66px + env(safe-area-inset-bottom));width:auto;" +
      "max-width:none;max-height:42vh}" +
      "#" + DOCK_ID + " .rally-content-card{padding:10px 12px}" +
      "}";

    var style = document.createElement("style");
    style.id = DOCK_ID + "-styles";
    style.textContent = css;
    document.head.appendChild(style);
  }

  function puedeAceptar(tab) {
    if (tab === "pautado" || tab === "script" || tab === "budget") return true;
    if (tab === "timeline") return true; // aviso de cierre: queda guardado y abre el resumen
    return !!CAMPOS_POR_TAB[tab];
  }

  function crearTarjeta(item) {
    var card = document.createElement("div");
    card.className = "rally-content-card";
    card.setAttribute("data-proposal-id", item.id);

    var head = document.createElement("div");
    head.className = "rcc-head";

    var title = document.createElement("span");
    title.className = "rcc-title";
    // El título que llega trae el archivo de origen pegado ("… desde pautado_latam_ref").
    title.textContent = String(item.title || "Propuesta").replace(/\s+desde\s+[^\s]+$/i, "");
    head.appendChild(title);

    var meta = document.createElement("div");
    meta.className = "rcc-meta";
    var donde = [ETIQUETA_TAB[item.tab] || item.tab, ETIQUETA_SLOT[item.slot] || ""].filter(function (p) {
      return p;
    }).join(" · ");
    meta.textContent = donde;

    var actions = document.createElement("div");
    actions.className = "rcc-actions";

    if (puedeAceptar(item.tab)) {
      var apply = document.createElement("button");
      apply.type = "button";
      apply.setAttribute("data-action", "apply");
      apply.textContent = item.tab === "timeline" ? "Abrir" : "Aceptar";
      actions.appendChild(apply);
    }

    var discard = document.createElement("button");
    discard.type = "button";
    discard.setAttribute("data-action", "discard");
    discard.textContent = "Descartar";

    actions.appendChild(discard);

    card.appendChild(head);
    card.appendChild(meta);
    card.appendChild(actions);

    if (!puedeAceptar(item.tab)) {
      var nota = document.createElement("div");
      nota.className = "rcc-note";
      nota.textContent = "Esta pestaña todavía no tiene un campo donde mostrarla.";
      card.appendChild(nota);
    }

    // Solo la propuesta más reciente se abre; el resto queda en una línea.
    card.addEventListener("click", function (ev) {
      if (ev.target.closest("button")) return;
      card.classList.toggle("is-collapsed");
    });
    return card;
  }

  function plegarDock(cont) {
    var cards = cont.querySelectorAll(".rally-content-card");
    for (var i = 0; i < cards.length; i++) {
      if (i === cards.length - 1) cards[i].classList.remove("is-collapsed");
      else cards[i].classList.add("is-collapsed");
    }
  }

  function actualizarSalud() {
    var cont = asegurarDock();
    if (!cont) return;
    var nodo = cont.querySelector(".rcc-status");
    if (salud === "apagado") {
      if (!nodo) {
        nodo = document.createElement("div");
        nodo.className = "rcc-status";
        nodo.textContent = "Buzón local apagado — sin propuestas en vivo";
        cont.appendChild(nodo);
      }
    } else if (nodo && nodo.parentNode) {
      nodo.parentNode.removeChild(nodo);
    }
  }

  function quitarTarjeta(id) {
    delete rendered[id];
    var nodo = dock && dock.querySelector("[data-proposal-id='" + id + "']");
    if (nodo && nodo.parentNode) nodo.parentNode.removeChild(nodo);
    actualizarCabecera();
  }

  function render(items) {
    var cont = asegurarDock();
    if (!cont) return;

    var vivos = Object.create(null);
    for (var i = 0; i < items.length; i++) {
      var item = items[i];
      if (!item || !item.id) continue;
      vivos[item.id] = true;
      if (item.kind === "notice") {
        // Avance de un agente: no es una propuesta que se acepta o se descarta,
        // es bitácora. Se pliega sola y el sobre queda en el buzón hasta que
        // expire, así el teléfono también la ve al abrir.
        var cid = item.id;
        if (!rendered[cid]) {
          rendered[cid] = true;
          pedirJSON("/api/content/" + encodeURIComponent(cid))
            .then(function (env) {
              if (fusionar(env)) {
                marcarVisto(cid);
                avisar(env, "avance");
              }
            })
            .catch(function () {
              delete rendered[cid];
            });
        }
        continue;
      }
      if (yaVisto(item.id) || rendered[item.id]) continue;
      cont.appendChild(crearTarjeta(item));
      rendered[item.id] = true;
      avisar(item, "propuesta");
    }

    // Lo que ya no está en el manifiesto deja de mostrarse.
    for (var id in rendered) {
      if (!vivos[id]) quitarTarjeta(id);
    }

    plegarDock(cont);
    actualizarCabecera();
  }

  // -- acciones ---------------------------------------------------------

  function aceptar(id, boton) {
    if (busy[id]) return Promise.resolve(false);
    busy[id] = true;
    var ok = false;

    return pedirJSON("/api/content/" + encodeURIComponent(id))
      .catch(function () {
        return null; // ya aplicada en otra pestaña
      })
      .then(function (env) {
        return postear("/api/content/" + encodeURIComponent(id) + "/apply").then(function () {
          if (env) fusionar(env);
          // Un aviso de cierre trae a dónde ir (normalmente el resumen de la
          // partida). Se abre al aceptar, en otra pestaña.
          try {
            var destino = env && env.payload && env.payload.url;
            if (env && env.tab === "timeline" && typeof destino === "string" && destino) {
              window.open(destino, "_blank");
            }
          } catch (e) {
            /* sin permiso de ventana: el aviso queda guardado igual */
          }
          marcarVisto(id);
          quitarTarjeta(id);
          ok = true;
        });
      })
      .catch(function () {
        // Fallo de red: el botón vuelve a estar vivo y la tarjeta se
        // re-dibuja en el próximo ciclo.
        if (boton) boton.disabled = false;
        delete rendered[id];
      })
      .then(function () {
        delete busy[id];
        return ok;
      });
  }

  function descartar(id, boton) {
    if (busy[id]) return Promise.resolve(false);
    busy[id] = true;
    var ok = false;

    return postear("/api/content/" + encodeURIComponent(id) + "/discard")
      .then(function () {
        marcarVisto(id);
        quitarTarjeta(id);
        ok = true;
      })
      .catch(function () {
        if (boton) boton.disabled = false;
        delete rendered[id];
      })
      .then(function () {
        delete busy[id];
        return ok;
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

    if (accion === "apply") aceptar(id, boton);
    else if (accion === "discard") descartar(id, boton);
  }

  // -- ciclo ------------------------------------------------------------

  function poll() {
    if (!soportado()) return Promise.resolve();
    if (salud === "apagado" && Date.now() < proximoPoll) return Promise.resolve();
    return pedirJSON("/api/content/manifest")
      .then(function (m) {
        fallos = 0;
        if (salud !== "ok") {
          salud = "ok";
          actualizarSalud();
        }
        var items = m && Array.isArray(m.items) ? m.items : [];
        render(items);
      })
      .catch(function () {
        fallos += 1;
        if (fallos >= MAX_FALLOS) {
          salud = "apagado";
          proximoPoll = Date.now() + REPOSO_MS;
          actualizarSalud();
        }
      });
  }

  function escucharCambios() {
    // La sincronizacion de estado vive en section_sync.js. El puente solo
    // escucha propuestas del buzon; no sube el estado completo.
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
    discard: descartar,
    _filas: filasDePresupuesto,
    _fusionar: fusionar,
    _salud: function () {
      return salud;
    },
    _subirEstado: subirEstado,
    _puedeAceptar: puedeAceptar
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", iniciar);
  } else {
    iniciar();
  }
})();
