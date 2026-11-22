/* Chat del proyecto — panel lateral sobre el servicio local.
 *
 * No inventa nada: manda a `POST /api/ai` (vía `RSA.analyze`) un prompt con
 * tres bloques verificables — brief.json, el estado real de la ventana y lo que
 * ya se le pidió a los 16 agentes — y deja que OpenCode lea el repositorio.
 * En GitHub Pages el servicio no existe: el chat lo dice y se apaga.
 */
(function () {
  "use strict";

  const LS_KEY = "rally_chat_v1";
  const MAX_MSG = 40;
  const MAX_PROMPT = 9000;
  const AI_BASE = (location.protocol === "file:" ? "http://localhost:8000" : location.origin) + "/api/ai";

  /* Modelo y dinero. El chat no elige modelo: `RSA.analyze` manda solo el prompt
   * y `scripts/rally_service.py` usa `AI_DEFAULT_MODEL`, que es este. La lista
   * permitida en el servidor es `opencode-go/`, así que aquí no cabe otro. */
  const MODELO = "opencode-go/deepseek-v4.1-flash";
  const PRECIO = { entrada: 0.14, salida: 0.28 }; // USD por millón de tokens
  const CARACTERES_POR_TOKEN = 3.6;               // español; se declara para poder corregirlo
  const TOPE_DIA_PREGUNTAS = 60;                  // el servidor corta en 120/día: 60 para el chat
  const TOPE_DIA_USD = 0.05;                      // 60 preguntas ≈ $0.036; el resto es aire
  const LS_USO = "rally_chat_uso_v1";

  const ESTATICO = (function () {
    const h = location.hostname;
    return (
      /github\.io$|netlify\.app$|pages\.dev$/.test(h) ||
      location.protocol === "file:" ||
      new URLSearchParams(location.search).has("estatico")
    );
  })();

  const ICONO = '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.4 8.4 0 0 1-8.5 8.4 9 9 0 0 1-3.9-.9L3 21l1.9-5a8.3 8.3 0 0 1-.9-3.9A8.4 8.4 0 0 1 12.5 3 8.4 8.4 0 0 1 21 11.5z"/></svg>';
  const CERRAR = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>';
  const ENVIAR = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12l16-8-6 16-2.5-6.5z"/></svg>';
  const AMPLIAR = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3H3v5M16 3h5v5M8 21H3v-5M16 21h5v-5"/></svg>';
  const REDUCIR = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 8h5V3M21 8h-5V3M3 16h5v5M21 16h-5v5"/></svg>';

  const CSS = `
  #rchat-fab{position:fixed;right:22px;bottom:22px;z-index:9200;width:56px;height:56px;border-radius:50%;
    border:none;cursor:pointer;display:grid;place-items:center;color:#fff;
    background:var(--color-navy,#0D1B35);box-shadow:var(--shadow-lg,0 12px 32px rgba(13,27,53,.28));
    transition:transform .16s ease,background .16s ease}
  #rchat-fab:hover{transform:translateY(-2px);background:var(--color-primary,#0866F5)}
  #rchat-fab[data-busy="1"]::after{content:"";position:absolute;top:6px;right:6px;width:10px;height:10px;
    border-radius:50%;background:var(--color-accent,#0284C7);box-shadow:0 0 0 3px #fff}
  #rchat{position:fixed;right:22px;bottom:90px;z-index:9201;width:440px;max-width:calc(100vw - 24px);
    height:min(660px,calc(100vh - 120px));display:none;flex-direction:column;overflow:hidden;
    background:var(--bg-surface,#fff);border:1px solid var(--border-light,#DCE7F5);
    border-radius:var(--radius-lg,18px);box-shadow:var(--shadow-lg,0 12px 32px rgba(13,27,53,.22));
    font-family:var(--font-ui,"Plus Jakarta Sans",sans-serif);color:var(--text-body,#334155)}
  #rchat[data-open="1"]{display:flex;animation:rchat-in .2s cubic-bezier(.16,1,.3,1) both}
  /* Abrir en grande: ocupa casi toda la pantalla sin tapar el indicador de agentes. */
  #rchat[data-max="1"]{left:50%;right:auto;bottom:auto;top:50%;transform:translate(-50%,-50%);
    width:min(980px,calc(100vw - 32px));height:min(880px,calc(100vh - 90px));
    animation:rchat-zoom .18s ease-out both}
  #rchat .rchat-max{background:none;border:none;padding:4px;cursor:pointer;color:var(--text-faint,#6B7C97);
    display:grid;place-items:center;margin-left:auto}
  #rchat .rchat-max:hover{color:var(--text-title,#0D1B35)}
  #rchat .rchat-chip + .rchat-max{margin-left:0}
  #rchat header{display:flex;align-items:center;gap:10px;padding:14px 16px;border-bottom:1px solid var(--border-light,#DCE7F5)}
  #rchat header b{font-family:var(--font-mono,"JetBrains Mono",monospace);font-size:var(--text-xs,11px);
    letter-spacing:.18em;text-transform:uppercase;color:var(--text-muted,#4E6285);font-weight:600}
  #rchat .rchat-chip{margin-left:auto;font-family:var(--font-mono,"JetBrains Mono",monospace);font-size:10px;
    letter-spacing:.08em;padding:3px 8px;border-radius:999px;border:1px solid var(--border-light,#DCE7F5);
    color:var(--text-faint,#6B7C97);white-space:nowrap;max-width:200px;overflow:hidden;text-overflow:ellipsis}
  #rchat .rchat-chip[data-ok="1"]{color:var(--status-ok-text,#047857);border-color:var(--status-ok-border,#BBF7D0);background:var(--status-ok-bg,#F0FDF4)}
  #rchat .rchat-chip[data-ok="0"]{color:var(--status-err-text,#DC2626);border-color:var(--status-err-border,#FECACA);background:var(--status-err-bg,#FEF2F2)}
  #rchat .rchat-x{background:none;border:none;padding:4px;cursor:pointer;color:var(--text-faint,#6B7C97);display:grid;place-items:center}
  #rchat .rchat-x:hover{color:var(--text-title,#0D1B35)}
  #rchat-log{flex:1;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:12px}
  #rchat-log p{margin:0;white-space:pre-wrap;word-break:break-word;font-size:var(--text-md,13px);line-height:1.55}
  .rchat-msg{max-width:92%;padding:10px 13px;border-radius:var(--radius-md,12px)}
  .rchat-msg[data-who="user"]{align-self:flex-end;background:var(--color-navy,#0D1B35);color:#fff;border-bottom-right-radius:4px}
  .rchat-msg[data-who="bot"]{align-self:flex-start;background:var(--bg-subtle,#F8FAFD);
    border:1px solid var(--border-light,#DCE7F5);color:var(--text-body,#334155);border-bottom-left-radius:4px}
  .rchat-msg[data-who="err"]{align-self:stretch;background:var(--status-err-bg,#FEF2F2);
    border:1px solid var(--status-err-border,#FECACA);color:var(--status-err-text,#DC2626);max-width:100%}
  .rchat-msg[data-who="info"]{align-self:stretch;background:var(--status-warn-bg,#FFFBEB);
    border:1px solid var(--status-warn-border,#FDE68A);color:var(--status-warn-text,#92400E);max-width:100%;
    font-family:var(--font-mono,"JetBrains Mono",monospace);font-size:var(--text-xs,11px);letter-spacing:.04em}
  .rchat-msg code{font-family:var(--font-mono,"JetBrains Mono",monospace);font-size:.92em;
    background:rgba(8,102,245,.08);color:var(--color-accent,#0284C7);padding:1px 4px;border-radius:4px}
  #rchat-ghost{align-self:flex-start;color:var(--text-faint,#6B7C97);font-family:var(--font-mono,"JetBrains Mono",monospace);
    font-size:var(--text-xs,11px);letter-spacing:.06em;display:flex;align-items:center;gap:8px}
  #rchat-ghost i{width:12px;height:12px;border:2px solid var(--border-strong,#CBD5E1);
    border-top-color:var(--color-primary,#0866F5);border-radius:50%;animation:rchat-spin .7s linear infinite}
  @keyframes rchat-spin{to{transform:rotate(360deg)}}
  #rchat-chips{display:flex;flex-wrap:wrap;gap:6px;padding:0 16px 10px}
  #rchat-chips button{font-family:var(--font-ui,"Plus Jakarta Sans",sans-serif);font-size:var(--text-xs,11px);
    padding:6px 10px;border-radius:999px;border:1px solid var(--border-light,#DCE7F5);background:var(--bg-secondary,#F0F6FF);
    color:var(--color-primary,#0866F5);cursor:pointer}
  #rchat-chips button:hover{background:var(--bg-surface,#fff);border-color:var(--border-focus,#0866F5)}
  #rchat form{display:flex;gap:8px;padding:12px 14px;border-top:1px solid var(--border-light,#DCE7F5);
    background:var(--bg-subtle,#F8FAFD);align-items:flex-end}
  #rchat textarea{flex:1;resize:none;min-height:40px;max-height:120px;padding:10px 12px;font-family:inherit;
    font-size:var(--text-md,13px);line-height:1.4;color:var(--text-main,#13213A);background:var(--bg-surface,#fff);
    border:1px solid var(--border-light,#DCE7F5);border-radius:var(--radius-md,12px);outline:none}
  #rchat textarea:focus{border-color:var(--border-focus,#0866F5)}
  #rchat textarea:disabled{background:var(--bg-muted,#F1F5F9);color:var(--text-faint,#6B7C97)}
  #rchat button[type="submit"]{width:40px;height:40px;border-radius:var(--radius-md,12px);border:none;cursor:pointer;
    display:grid;place-items:center;color:#fff;background:var(--color-primary,#0866F5);transition:background .15s}
  #rchat button[type="submit"]:hover{background:var(--color-primary-hover,#0057E7)}
  #rchat button[type="submit"]:disabled{background:var(--border-strong,#CBD5E1);cursor:not-allowed}
  #rchat .rchat-pie{display:flex;gap:10px;padding:0 16px 8px;font-family:var(--font-mono,"JetBrains Mono",monospace);
    font-size:10px;letter-spacing:.06em;color:var(--text-faint,#6B7C97);text-transform:uppercase}
  #rchat .rchat-uso{flex:1;min-width:0}
  #rchat .rchat-agente{color:var(--color-accent,#0284C7);white-space:nowrap}
  /* Adjuntos que el modelo trae del repositorio */
  #rchat .rchat-adj{margin-top:8px;display:flex;flex-direction:column;gap:8px}
  #rchat .rchat-adj figure{margin:0}
  #rchat .rchat-adj img{max-width:100%;max-height:220px;border-radius:var(--radius-md,12px);
    border:1px solid var(--border-light,#DCE7F5);background:var(--bg-muted,#F1F5F9);display:block;cursor:zoom-in}
  #rchat .rchat-adj video{width:100%;max-height:220px;border-radius:var(--radius-md,12px);
    border:1px solid var(--border-light,#DCE7F5);background:#000}
  #rchat .rchat-adj audio{width:100%}
  #rchat .rchat-adj figcaption{font-family:var(--font-mono,"JetBrains Mono",monospace);font-size:10px;
    color:var(--text-faint,#6B7C97);letter-spacing:.04em;margin-top:4px;word-break:break-all}
  #rchat .rchat-archivo{display:flex;align-items:center;gap:8px;border:1px solid var(--border-light,#DCE7F5);
    border-radius:var(--radius-md,12px);padding:8px 10px;background:var(--bg-surface,#fff)}
  #rchat .rchat-archivo b{font-size:var(--text-xs,11px);font-weight:600;color:var(--text-main,#13213A);
    word-break:break-all;flex:1;min-width:0}
  #rchat .rchat-archivo a,#rchat .rchat-archivo button{font-family:var(--font-mono,"JetBrains Mono",monospace);
    font-size:10px;letter-spacing:.06em;text-transform:uppercase;color:var(--color-primary,#0866F5);
    background:none;border:1px solid var(--border-light,#DCE7F5);border-radius:999px;padding:4px 8px;cursor:pointer;
    text-decoration:none}
  #rchat .rchat-archivo a:hover,#rchat .rchat-archivo button:hover{border-color:var(--border-focus,#0866F5)}
  #rchat .rchat-texto{margin-top:8px;border:1px solid var(--border-light,#DCE7F5);border-radius:var(--radius-md,12px);
    background:var(--bg-surface,#fff);overflow:hidden}
  #rchat .rchat-texto pre{margin:0;max-height:240px;overflow:auto;padding:10px 12px;white-space:pre-wrap;
    font-family:var(--font-mono,"JetBrains Mono",monospace);font-size:11px;line-height:1.5;color:var(--text-body,#334155)}
  #rchat .rchat-texto .rchat-barra{display:flex;gap:8px;align-items:center;padding:6px 10px;
    border-bottom:1px solid var(--border-light,#DCE7F5);background:var(--bg-subtle,#F8FAFD)}
  #rchat .rchat-texto .rchat-barra b{font-family:var(--font-mono,"JetBrains Mono",monospace);font-size:10px;
    letter-spacing:.05em;color:var(--text-muted,#4E6285);flex:1;min-width:0;word-break:break-all;font-weight:400}
  #rchat .rchat-copiar{font-family:var(--font-mono,"JetBrains Mono",monospace);font-size:10px;letter-spacing:.06em;
    text-transform:uppercase;color:var(--text-muted,#4E6285);background:var(--bg-surface,#fff);
    border:1px solid var(--border-light,#DCE7F5);border-radius:999px;padding:3px 8px;cursor:pointer}
  #rchat .rchat-copiar[data-ok="1"]{color:var(--status-ok-text,#15803D);border-color:var(--status-ok-border,#BBF7D0);
    background:var(--status-ok-bg,#F0FDF4)}
  #rchat .rchat-msg{position:relative;animation:rchat-msg-in .18s ease-out both}
  #rchat .rchat-msg > .rchat-copiar{position:absolute;top:6px;right:8px;opacity:0;transition:opacity .15s}
  #rchat .rchat-msg:hover > .rchat-copiar{opacity:1}
  @keyframes rchat-in{from{opacity:0;transform:translateY(10px) scale(.985)}to{opacity:1;transform:none}}
  @keyframes rchat-zoom{from{opacity:.5;transform:translate(-50%,-50%) scale(.97)}
    to{opacity:1;transform:translate(-50%,-50%) scale(1)}}
  @keyframes rchat-msg-in{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}
  @media (prefers-reduced-motion:reduce){
    #rchat[data-open="1"],#rchat[data-max="1"],#rchat .rchat-msg{animation:none}}
  @media (max-width:560px){#rchat{right:0;left:0;bottom:0;width:100%;max-width:100%;height:82vh;border-radius:18px 18px 0 0}
    #rchat-fab{right:14px;bottom:14px}}
  `;

  let panel, fab, log, input, form, chip, ghost, chips, pie, pieUso, pieAgente;
  let historial = [];
  let ocupado = false;
  let cancelable = false;
  let inicioJob = 0;
  let relojTimer = null;

  // ── estado de la ventana ──────────────────────────────────────────────────
  function leerEstado() {
    return fetch("/api/state", { cache: "no-store" })
      .then(function (r) { return r.json(); })
      .then(function (b) { return (b && b.state) || null; })
      .catch(function () {
        try {
          const raw = localStorage.getItem("rally_studio_production_state_2026_v4");
          return raw ? JSON.parse(raw) : null;
        } catch (e) { return null; }
      });
  }

  function txt(v) { return String(v == null ? "" : v).trim(); }

  // La solución del tablero no vive en `solution` (esa clave no existe): son
  // tres campos del taller, y el que el equipo aprobó es `solution_approved`.
  function solucionEscrita(st) {
    return txt(st.solution_thesis) || txt(st.solution_simple) || txt(st.solution_raw_input);
  }

  // Los 9 cuadrantes del lienzo, con los mismos nombres que usa app.js.
  const CANVAS_CLAVES = ["socios", "actividades", "propuesta", "relaciones", "segmentos",
    "recursos", "canales", "costes", "ingresos"];

  function resumenEstado(st) {
    if (!st) return "LA VENTANA ESTÁ VACÍA: el usuario no ha escrito nada todavía (o el servicio no responde). No inventes su proyecto.";
    const l = [];
    const cert = st.rally_type === "nacional"
      ? "Rally Nacional de Innovación (Nicaragua, 24 h, presupuesto en córdobas)"
      : "Rally Latinoamericano de Innovación (28 h, presupuesto en USD, solución replicable en LATAM)";
    l.push("Certamen: " + cert + " · horas totales: " + (st.hours_total || "?"));
    const quien = [st.project_name, st.team_name, st.university, st.city].map(txt);
    l.push("Proyecto: " + (quien[0] || "(sin nombre)") + " · Equipo: " + (quien[1] || "(sin nombre)") +
      " · " + (quien[2] || "(sin universidad)") + " · " + (quien[3] || "(sin ciudad)"));
    l.push("Reto: " + (txt(st.challenge_id) || "(sin elegir)") + " — " + (txt(st.challenge_title) || "(sin título)") +
      " · categoría: " + (txt(st.category) || "(sin categoría)"));
    const solucion = solucionEscrita(st);
    if (solucion) {
      l.push("Solución escrita: " + solucion.slice(0, 500) +
        (st.solution_approved ? " (aprobada por el equipo)" : " (sin aprobar)"));
      if (txt(st.solution_raw_input)) l.push("Problema escrito: " + txt(st.solution_raw_input).slice(0, 400));
    }
    // Pautado: 5 secciones con su longitud real.
    const pa = st.pautado || {};
    const secs = ["problema", "solucion", "impacto", "innovacion", "prefactibilidad"];
    l.push("Pautado (caracteres por sección): " + secs.map(function (k) {
      return k + "=" + (txt(pa[k]).length || "0/—");
    }).join(", "));
    // Presupuesto
    const filas = Array.isArray(st.budget) ? st.budget : [];
    const total = filas.reduce(function (a, r) {
      return a + (Number(r && r.units) || 0) * (Number(r && r.unit_cost) || 0);
    }, 0);
    l.push("Presupuesto: " + filas.length + " filas, total " + Math.round(total) + " USD" +
      (filas.length ? " (la banda 4.000–6.000 USD es sugerencia, no ley)" : " — VACÍO"));
    // Canvas
    const cv = st.model_canvas || {};
    const llenos = CANVAS_CLAVES.filter(function (k) { return txt(cv[k]); });
    l.push("Canvas: " + llenos.length + "/" + CANVAS_CLAVES.length + " cuadrantes con texto" +
      (llenos.length ? " (" + llenos.join(", ") + ")" : "") +
      (Object.keys(cv).length > llenos.length ? " · hay claves fuera del lienzo que no cuentan" : ""));
    // Guion
    const sc = st.script || {};
    const actos = [sc.acto1, sc.acto2, sc.acto3, sc.acto4].map(txt);
    const palabras = actos.join(" ").split(/\s+/).filter(Boolean).length;
    l.push("Guion: " + actos.map(function (a, i) { return "acto" + (i + 1) + (a ? " " + a.split(/\s+/).filter(Boolean).length + "p" : " vacío"); }).join(", ") +
      " · total " + palabras + " palabras (techo 240–270 para 120 s)");
    // Video
    const plan = Array.isArray(st.shot_plan) ? st.shot_plan : [];
    const assets = (st.video_assets && Array.isArray(st.video_assets.items)) ? st.video_assets.items.length : 0;
    l.push("Video: " + plan.length + " tomas en el plan, " + assets + " assets subidos");
    return l.join("\n");
  }

  function huecos(st) {
    const faltan = [];
    if (!st) return ["todo: la ventana vacía"];
    if (!txt(st.project_name)) faltan.push("nombre del proyecto (fase 01)");
    if (!txt(st.team_name)) faltan.push("nombre del equipo (fase 01)");
    if (!txt(st.challenge_id)) faltan.push("reto elegido (fase 02)");
    if (!solucionEscrita(st)) faltan.push("solución (fase 03)");
    else if (!st.solution_approved) faltan.push("aprobar la solución (fase 03)");
    const pa = st.pautado || {};
    ["problema", "solucion", "impacto", "innovacion", "prefactibilidad"].forEach(function (k) {
      if (!txt(pa[k])) faltan.push("pautado: " + k + " (fase 06)");
    });
    const filas = Array.isArray(st.budget) ? st.budget : [];
    if (!filas.length) faltan.push("presupuesto (fase 07)");
    else if (filas.some(function (r) { return !txt(r && r.url); })) faltan.push("URLs de respaldo en el presupuesto (fase 07)");
    if (!CANVAS_CLAVES.some(function (k) { return txt((st.model_canvas || {})[k]); })) faltan.push("canvas (fase 09)");
    const sc = st.script || {};
    if (![sc.acto1, sc.acto2, sc.acto3, sc.acto4].every(txt)) faltan.push("algún acto del guion (fase 10)");
    if (!(Array.isArray(st.shot_plan) && st.shot_plan.length)) faltan.push("plan de tomas (fase 10)");
    return faltan;
  }

  // Lo que ya se le pidió a cada agente especialista (RSA.historyAdd).
  function resumenAgentes() {
    if (!window.RSA || typeof window.RSA.historyList !== "function") return "(sin historial de agentes)";
    const ids = ["pautado", "presupuesto", "canvas", "guion", "video", "investigacion", "retos", "rubrica"];
    const out = [];
    ids.forEach(function (id) {
      const lista = window.RSA.historyList(id) || [];
      if (!lista.length) return;
      const h = lista[0];
      out.push("- " + id + " (" + (h.mode || "?") + "): " + String(h.resumen || "").slice(0, 240) +
        (h.pregunta ? "\n  pregunta: " + String(h.pregunta).slice(0, 240) : ""));
    });
    return out.length ? out.join("\n") : "(todavía no le pediste nada a ningún agente)";
  }

  function leerBrief() {
    return fetch("../brief.json", { cache: "no-store" })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (b) { return b || null; })
      .catch(function () { return null; });
  }

  function armarPrompt(pregunta, st, brief) {
    const partes = [];
    partes.push("Eres el asistente del equipo dentro de Rally Studio, el workbench de un rally de innovación.");
    partes.push(
      "Responde en español, en frases cortas y directas. No inventes cifras: si un dato no está en el contexto " +
      "de abajo ni en el repositorio, dilo y señala en qué pestaña se llena. No repitas el nombre del proyecto " +
      "más de una vez. Si te piden texto para el pautado, respeta la idea de una sola mención del nombre."
    );
    partes.push(
      "No tienes herramientas ni shell: no prometas ejecutar comandos. El inventario real de archivos va " +
      "más abajo; elige de ahí. Si lo que piden no está en el inventario, dilo en una línea."
    );
    partes.push(
      "Presupuesto de salida: máximo 180 palabras y sin repetir el contexto. Cada palabra se paga; si la respuesta " +
      "es una lista, usa líneas de menos de 12 palabras."
    );
    partes.push(
      "Para mostrar un archivo, copia su ruta exacta del inventario en una línea propia: el panel lo abre como " +
      "imagen, video, audio o texto con botón de copiar. Nunca pegues bloques de más de 40 líneas: da la ruta."
    );
    if (brief && Object.keys(brief).length) {
      const b = Object.assign({}, brief);
      delete b.password; delete b.key; delete b.token;
      partes.push("== brief.json (estado guardado) ==\n" + JSON.stringify(b).slice(0, 1400));
    }
    partes.push("== ESTADO REAL DE LA VENTANA ==\n" + resumenEstado(st));
    partes.push("== HUECOS DETECTADOS ==\n" + (huecos(st).length ? huecos(st).map(function (x) { return "- " + x; }).join("\n") : "ninguno: los 13 entregables tienen contenido"));
    partes.push("== LO QUE YA SE LE PIDIÓ A LOS AGENTES ==\n" + resumenAgentes());
    const inv = inventarioPara(pregunta);
    if (inv) partes.push("== ARCHIVOS DEL PROYECTO (inventario real) ==\n" + inv);
    partes.push("== PREGUNTA DEL EQUIPO ==\n" + pregunta);
    return partes.join("\n\n").slice(0, MAX_PROMPT);
  }

  // ── historial local ───────────────────────────────────────────────────────
  function claveHistorial(st) {
    const nombre = txt(st && st.project_name) || "sin-proyecto";
    return LS_KEY + ":" + nombre.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  }
  function guardar() {
    try {
      localStorage.setItem(claveHistorial(ultimoEstado), JSON.stringify(historial.slice(-MAX_MSG)));
    } catch (e) { /* storage lleno */ }
  }
  let ultimoEstado = null;

  // ── pintar ────────────────────────────────────────────────────────────────
  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }
  function conFormato(texto) {
    // Sólo `código` y **negrita**; el resto se escapa. Sin HTML del modelo.
    return esc(texto)
      .replace(/`([^`\n]+)`/g, "<code>$1</code>")
      .replace(/\*\*([^*\n]+)\*\*/g, "<strong>$1</strong>");
  }

  // ── adjuntos: imágenes, videos y textos del repositorio ───────────────────
  // El modelo puede nombrar un archivo del proyecto; aquí se resuelve a una URL
  // servible y se muestra. Sólo carpetas conocidas: nada de `..` hacia afuera ni
  // rutas absolutas, o el chat se convertiría en un lector de disco.
  const CARPETAS = ["assets", "docs", "design", "designs", "script", "site", "budget",
    "brain", "knowledge", "research", "brand", "plantillas", "dashboard"];
  const EXT_IMG = /\.(png|jpe?g|webp|gif|svg|avif)$/i;
  const EXT_VID = /\.(mp4|webm|mov|m4v|ogv)$/i;
  const EXT_SON = /\.(mp3|wav|ogg|m4a|aac)$/i;
  const EXT_TXT = /\.(md|txt|csv|json|jsonl|py|js|css|html|yml|yaml|tsv|srt|vtt)$/i;
  const EXT_PDF = /\.pdf$/i;
  const RX_RUTA = new RegExp(
    "(?:^|[\\s(`\"'\\[])((?:(?:" + CARPETAS.join("|") + ")/)[A-Za-z0-9_\\-./%áéíóúñÁÉÍÓÚÑ ]+?" +
    "\\.(?:png|jpe?g|webp|gif|svg|avif|mp4|webm|mov|m4v|ogv|mp3|wav|ogg|m4a|aac|md|txt|csv|json|jsonl|" +
    "py|js|css|html|yml|yaml|tsv|srt|vtt|pdf))(?=$|[\\s)`\"'\\],.;:])", "gim");

  const RUTAS = [];   // memo de la última respuesta, para no repetir fetch

  function rutaValida(bruta) {
    const limpia = String(bruta || "").replace(/^\.?\//, "").trim();
    if (!limpia || /^[a-zA-Z]:|^\\\\|\.\.\//.test(limpia)) return null;
    const primera = limpia.split("/")[0].toLowerCase();
    if (CARPETAS.indexOf(primera) < 0) return null;
    if (!/^[A-Za-z0-9_\-./%áéíóúñÁÉÍÓÚÑ ]+$/.test(limpia)) return null;
    return limpia.replace(/ /g, "%20");
  }

  function rutasDe(texto) {
    const vistas = {};
    const out = [];
    let m;
    RX_RUTA.lastIndex = 0;
    while ((m = RX_RUTA.exec(texto))) {
      const r = rutaValida(m[1]);
      if (r && !vistas[r]) { vistas[r] = 1; out.push(r); }
    }
    return out.slice(0, 6);   // seis adjuntos por respuesta; más es ruido
  }

  function urlDe(ruta) { return "../" + ruta; }

  // ── inventario de recursos (lo genera scripts/gen_recursos.py) ────────────
  // El modelo no puede listar carpetas (las reglas fijas del servidor prohíben
  // herramientas), así que el panel le entrega el inventario ya filtrado: él
  // sólo copia una ruta exacta y el navegador la pinta.
  let INVENTARIO = null;

  function leerInventario() {
    if (INVENTARIO) return Promise.resolve(INVENTARIO);
    return fetch("../assets/recursos.json", { cache: "no-store" })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (d) { INVENTARIO = (d && d.archivos) || []; return INVENTARIO; })
      .catch(function () { INVENTARIO = []; return INVENTARIO; });
  }

  function inventarioPara(pregunta) {
    if (!INVENTARIO || !INVENTARIO.length) return "";
    const q = String(pregunta || "").toLowerCase();
    const quiere = [];
    if (/imagen|im[aá]genes|foto|captura|pantallazo|portada|logo|png|jpe?g|svg/.test(q)) quiere.push("imagen");
    if (/v[ií]deo|clip|grabaci|mp4|webm/.test(q)) quiere.push("video");
    if (/audio|voz|m[uú]sica|locuci|mp3|wav|narraci/.test(q)) quiere.push("audio");
    if (/pdf|informe|dossier/.test(q)) quiere.push("pdf");
    if (/texto|guion|gui[oó]n|canvas|pautado|presupuesto|markdown|csv|json/.test(q)) quiere.push("texto");
    const palabras = (q.match(/[a-záéíóúñ0-9]{4,}/g) || []).filter(function (w) {
      return ["para", "sobre", "quiero", "puedes", "muestra", "muestrame", "muéstrame",
        "dame", "tienes", "ayuda", "imagen", "video", "audio", "archivo", "carpeta",
        "recurso", "recursos"].indexOf(w) < 0;
    });
    const puntos = INVENTARIO.map(function (f) {
      let s = 0;
      if (!quiere.length || quiere.indexOf(f.t) >= 0) s += 3;
      const bajo = f.p.toLowerCase();
      palabras.forEach(function (w) { if (bajo.indexOf(w) >= 0) s += 4; });
      if (s) s += 1 / (1 + f.kb / 500);   // preferir archivos que el panel aguanta
      return { f: f, s: s };
    }).filter(function (x) { return x.s > 0; });
    puntos.sort(function (a, b) { return b.s - a.s; });
    const top = puntos.slice(0, 24).map(function (x) {
      return "- " + x.f.p + " (" + x.f.t + ", " + x.f.kb + " kB)";
    });
    return INVENTARIO.length + " archivos indexados con scripts/gen_recursos.py. " +
      "Los más relacionados con la pregunta:\n" +
      (top.length ? top.join("\n") : "- (sin coincidencias: si hace falta otro, pide que lo suban a assets/)");
  }

  function botonCopiar(texto, etiqueta) {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "rchat-copiar";
    b.textContent = etiqueta || "copiar";
    b.addEventListener("click", function (ev) {
      ev.stopPropagation();
      const escribir = navigator.clipboard && navigator.clipboard.writeText
        ? navigator.clipboard.writeText(texto)
        : Promise.reject(new Error("sin portapapeles"));
      escribir.then(function () {
        b.setAttribute("data-ok", "1");
        b.textContent = "copiado";
        setTimeout(function () { b.removeAttribute("data-ok"); b.textContent = etiqueta || "copiar"; }, 1600);
      }).catch(function () {
        // Sin permisos de portapapeles: se selecciona para que el usuario copie.
        const sel = window.getSelection();
        const r = document.createRange();
        r.selectNodeContents(b.parentNode.querySelector("pre") || b.parentNode);
        sel.removeAllRanges();
        sel.addRange(r);
        b.textContent = "Ctrl+C";
      });
    });
    return b;
  }

  function adjuntar(caja, ruta) {
    const url = urlDe(ruta);
    if (EXT_IMG.test(ruta)) {
      const fig = document.createElement("figure");
      const a = document.createElement("a");
      a.href = url; a.target = "_blank"; a.rel = "noopener";
      const img = document.createElement("img");
      img.src = url; img.alt = ruta; img.loading = "lazy";
      img.addEventListener("error", function () {
        fig.parentNode && fig.parentNode.replaceChild(filaArchivo(ruta), fig);
      });
      a.appendChild(img);
      const cap = document.createElement("figcaption");
      cap.textContent = ruta;
      fig.appendChild(a); fig.appendChild(cap);
      caja.appendChild(fig);
      return;
    }
    if (EXT_VID.test(ruta) || EXT_SON.test(ruta)) {
      const fig = document.createElement("figure");
      const v = document.createElement(EXT_SON.test(ruta) ? "audio" : "video");
      v.controls = true;
      v.preload = "metadata";
      v.src = url;
      v.addEventListener("error", function () {
        // Navegador sin códec (o archivo movido): se deja el enlace, no un hueco.
        fig.parentNode && fig.parentNode.replaceChild(filaArchivo(ruta), fig);
      });
      const cap = document.createElement("figcaption");
      cap.textContent = ruta;
      fig.appendChild(v); fig.appendChild(cap);
      caja.appendChild(fig);
      return;
    }
    caja.appendChild(filaArchivo(ruta));
  }

  function filaArchivo(ruta) {
    const fila = document.createElement("div");
    fila.className = "rchat-archivo";
    const b = document.createElement("b");
    b.textContent = ruta;
    fila.appendChild(b);
    if (EXT_TXT.test(ruta)) {
      const ver = document.createElement("button");
      ver.type = "button";
      ver.textContent = "ver";
      ver.addEventListener("click", function () { abrirTexto(fila, ruta, ver); });
      fila.appendChild(ver);
    }
    const abrir = document.createElement("a");
    abrir.href = urlDe(ruta); abrir.target = "_blank"; abrir.rel = "noopener";
    abrir.textContent = EXT_PDF.test(ruta) ? "pdf" : "abrir";
    fila.appendChild(abrir);
    return fila;
  }

  function abrirTexto(fila, ruta, boton) {
    const ya = fila.parentNode.querySelector(".rchat-texto[data-ruta='" + ruta + "']");
    if (ya) { ya.remove(); boton.textContent = "ver"; return; }
    boton.textContent = "…";
    fetch(urlDe(ruta), { cache: "no-store" })
      .then(function (r) { if (!r.ok) throw new Error(r.status); return r.text(); })
      .then(function (txtLeido) {
        const tope = 200000;   // 200 kB: suficiente para leer y copiar, no para colgar el panel
        const recortado = txtLeido.length > tope;
        const cuerpo = recortado ? txtLeido.slice(0, tope) : txtLeido;
        const caja = document.createElement("div");
        caja.className = "rchat-texto";
        caja.setAttribute("data-ruta", ruta);
        const barra = document.createElement("div");
        barra.className = "rchat-barra";
        const nombre = document.createElement("b");
        nombre.textContent = ruta + " · " + cuerpo.split("\n").length + " líneas" +
          (recortado ? " (recortado)" : "");
        barra.appendChild(nombre);
        barra.appendChild(botonCopiar(txtLeido, "copiar todo"));
        const pre = document.createElement("pre");
        pre.textContent = cuerpo;
        caja.appendChild(barra); caja.appendChild(pre);
        fila.parentNode.insertBefore(caja, fila.nextSibling);
        boton.textContent = "ocultar";
        log.scrollTop = log.scrollHeight;
      })
      .catch(function () {
        boton.textContent = "no se pudo";
        setTimeout(function () { boton.textContent = "ver"; }, 1800);
      });
  }

  function burbuja(who, texto) {
    const d = document.createElement("div");
    d.className = "rchat-msg";
    d.setAttribute("data-who", who);
    const p = document.createElement("p");
    p.innerHTML = who === "user" ? esc(texto) : conFormato(texto);
    d.appendChild(p);
    if (who !== "user") {
      const rutas = rutasDe(texto);
      if (rutas.length) {
        const caja = document.createElement("div");
        caja.className = "rchat-adj";
        rutas.forEach(function (r) { adjuntar(caja, r); });
        d.appendChild(caja);
        RUTAS.push.apply(RUTAS, rutas);
      }
      const copiar = botonCopiar(texto, "copiar");
      copiar.classList.add("rchat-copiar");
      d.appendChild(copiar);
    }
    log.appendChild(d);
    log.scrollTop = log.scrollHeight;
    return d;
  }

  function pintarHistorial() {
    log.innerHTML = "";
    historial.forEach(function (m) { burbuja(m.who, m.text); });
    if (!historial.length) {
      burbuja("bot", "Pregúntame lo que quieras del proyecto o del rally. Sé tu reto, tu solución, el presupuesto y qué falta.");
    }
    log.scrollTop = log.scrollHeight;
  }

  function fantasma(visible, etiqueta) {
    if (!visible) {
      if (ghost && ghost.parentNode) ghost.parentNode.removeChild(ghost);
      ghost = null;
      return;
    }
    if (!ghost) {
      ghost = document.createElement("div");
      ghost.id = "rchat-ghost";
      ghost.innerHTML = "<i></i><span></span>";
      log.appendChild(ghost);
    }
    ghost.lastChild.textContent = etiqueta;
    log.scrollTop = log.scrollHeight;
  }

  function segundos() {
    return Math.round((Date.now() - inicioJob) / 1000);
  }

  function ocupar(v) {
    ocupado = v;
    cancelable = v;
    input.disabled = v || ESTATICO;
    form.querySelector('button[type="submit"]').disabled = v || ESTATICO;
    fab.setAttribute("data-busy", v ? "1" : "0");
    if (v) {
      inicioJob = Date.now();
      clearInterval(relojTimer);
      relojTimer = setInterval(function () {
        if (ghost) fantasma(true, "leyendo tu proyecto y el corpus · " + segundos() + " s (Enter para cortar)");
      }, 1000);
    } else {
      clearInterval(relojTimer);
      relojTimer = null;
    }
  }

  function chipProveedor() {
    if (ESTATICO) {
      chip.textContent = "sin servicio";
      chip.setAttribute("data-ok", "0");
      return;
    }
    fetch(AI_BASE + "/status", { cache: "no-store" })
      .then(function (r) { return r.json(); })
      .then(function (b) {
        const ok = b && b.status === "ok";
        chip.textContent = ok ? ((b.provider || "IA") + (b.model && b.model !== "auto" ? " · " + b.model : "")) : "sin IA";
        chip.setAttribute("data-ok", ok ? "1" : "0");
        chip.title = ok ? "proveedor conectado" : String((b && b.message) || "sin proveedor");
      })
      .catch(function () {
        chip.textContent = "servicio apagado";
        chip.setAttribute("data-ok", "0");
      });
  }

  // "¿hay agentes trabajando?" — el chat no lleva contador propio: pregunta al
  // indicador global, que es el único que sabe cuántos hay y cuándo terminan.
  function marcarAgente() {
    const vivos = typeof window.rsAgentesActivos === "function"
      ? window.rsAgentesActivos()
      : 0;
    if (!pieAgente) return;
    pieAgente.textContent = vivos > 0
      ? "· " + vivos + (vivos > 1 ? " agentes trabajando" : " agente trabajando")
      : "";
  }
  // El chat no cuenta por su cuenta: pregunta al indicador global. Antes sumaba
  // cada aviso (aunque fuera repetido) y su contador nunca volvía a cero, así que
  // el pie seguía anunciando trabajo con todo apagado.
  (function engancharActividad() {
    const previo = window.rsAgentActivity;
    window.rsAgentActivity = function (activo, etiqueta, n) {
      if (typeof previo === "function") { try { previo(activo, etiqueta, n); } catch (e) {} }
      marcarAgente();
    };
  })();

  // ── uso y costo ───────────────────────────────────────────────────────────
  // Los tokens son una estimación declarada: ni `POST /api/ai` ni
  // `GET /api/ai/progress` devuelven el consumo real (OpenCode escribe la
  // respuesta, no la telemetría del modelo), así que se cuenta por caracteres con
  // el factor de arriba y se muestra con «≈». El precio sí es el de tarifa.
  function tokensDe(texto) {
    return Math.ceil(String(texto || "").length / CARACTERES_POR_TOKEN);
  }

  function hoy() {
    const d = new Date();
    return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" +
      String(d.getDate()).padStart(2, "0");
  }

  function slug() {
    return (txt(ultimoEstado && ultimoEstado.project_name) || "sin-proyecto")
      .toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "sin-proyecto";
  }

  function leerUso() {
    let todo = {};
    try { todo = JSON.parse(localStorage.getItem(LS_USO) || "{}"); } catch (e) { todo = {}; }
    const k = slug();
    const u = todo[k] || {};
    if (u.dia !== hoy()) { u.dia = hoy(); u.preguntas = 0; u.tokIn = 0; u.tokOut = 0; u.usd = 0; }
    u.preguntas = u.preguntas || 0;
    u.tokIn = u.tokIn || 0;
    u.tokOut = u.tokOut || 0;
    u.usd = u.usd || 0;
    u.totalPreguntas = u.totalPreguntas || 0;
    u.totalTokIn = u.totalTokIn || 0;
    u.totalTokOut = u.totalTokOut || 0;
    u.totalUsd = u.totalUsd || 0;
    return { todo: todo, k: k, u: u };
  }

  function guardarUso(caja) {
    caja.todo[caja.k] = caja.u;
    try { localStorage.setItem(LS_USO, JSON.stringify(caja.todo)); } catch (e) {}
  }

  function plata(usd) { return "$" + Number(usd || 0).toFixed(4).replace(".", ","); }

  function miles(n) {
    return n >= 1000 ? (n / 1000).toFixed(1).replace(".", ",") + "k" : String(n);
  }

  function pintarUso() {
    if (!pieUso) return;
    const u = leerUso().u;
    pieUso.textContent = u.preguntas === 0
      ? "deepseek · 0 preguntas hoy"
      : "deepseek · " + u.preguntas + "/" + TOPE_DIA_PREGUNTAS + " hoy · ≈" +
        miles(u.tokIn + u.tokOut) + " tokens · ≈" + plata(u.usd);
    pieUso.title = "Estimado con " + plata(PRECIO.entrada) + "/M entrada y " +
      plata(PRECIO.salida) + "/M salida (" + MODELO + "). Acumulado del proyecto: " +
      u.totalPreguntas + " preguntas, ≈" + miles(u.totalTokIn + u.totalTokOut) +
      " tokens, ≈" + plata(u.totalUsd) + ".";
  }

  function anotarUso(prompt, respuesta) {
    const caja = leerUso();
    const tIn = tokensDe(prompt);
    const tOut = tokensDe(respuesta);
    const costo = (tIn * PRECIO.entrada + tOut * PRECIO.salida) / 1000000;
    const u = caja.u;
    u.preguntas += 1; u.tokIn += tIn; u.tokOut += tOut; u.usd += costo;
    u.totalPreguntas += 1; u.totalTokIn += tIn; u.totalTokOut += tOut; u.totalUsd += costo;
    guardarUso(caja);
    pintarUso();
    return { tIn: tIn, tOut: tOut, costo: costo };
  }

  function tope() {
    const u = leerUso().u;
    if (u.preguntas >= TOPE_DIA_PREGUNTAS) {
      return "Hoy ya van " + u.preguntas + " preguntas en este chat (tope del cliente: " +
        TOPE_DIA_PREGUNTAS + "). Vuelve mañana o usa ⋮ → Herramientas de IA.";
    }
    if (u.usd >= TOPE_DIA_USD) {
      return "Este chat gastó ≈" + plata(u.usd) + " hoy (tope del cliente: " +
        plata(TOPE_DIA_USD) + "). No es un cobro, es una guarda; mañana se reinicia.";
    }
    return null;
  }

  // ── enviar ────────────────────────────────────────────────────────────────
  function enviar(texto) {
    const pregunta = txt(texto);
    if (!pregunta || ocupado) return;
    if (ESTATICO) {
      burbuja("info", "El chat vive en tu programa local: abre el tablero desde el programa (http://localhost:" + (location.port || "8000") + "/dashboard/) y vuelve a preguntar.");
      return;
    }
    if (!window.RSA || typeof window.RSA.analyze !== "function") {
      burbuja("err", "No encontré el cliente de IA (super_agents.js). Recarga la página.");
      return;
    }
    const bloqueo = tope();
    if (bloqueo) {
      burbuja("info", bloqueo);
      return;
    }
    input.value = "";
    historial.push({ who: "user", text: pregunta });
    burbuja("user", pregunta);
    guardar();
    ocupar(true);
    marcarAgente(true);
    fantasma(true, "leyendo tu proyecto y el corpus…");

    Promise.all([leerEstado(), leerBrief()]).then(function (par) {
      const st = par[0];
      ultimoEstado = st;
      const prompt = armarPrompt(pregunta, st, par[1]);
      window.RSA.analyze(prompt, function (parcial) {
        if (parcial && parcial.kind === "running" && parcial.message) {
          fantasma(true, "trabajando · " + segundos() + " s");
        }
      }).then(function (res) {
        fantasma(false);
        ocupar(false);
        marcarAgente(false);
        if (res && res.ok) {
          const tb = res.text || "(respuesta vacía)";
          historial.push({ who: "bot", text: tb });
          burbuja("bot", tb);
          anotarUso(prompt, tb);
          guardar();
          return;
        }
        const notas = {
          "no-provider": "No hay IA conectada en el servicio local. Abre el menú ⋮ → Herramientas de IA para conectar una, o usa los chips de chats web.",
          "rate-limit": "Se alcanzó el límite de uso del servicio. Espera un minuto y reintenta.",
          "down": "El buzón local (rally_service) no responde. Arráncalo con `python scripts/rally_service.py`.",
          "timeout": "La IA no terminó en 5 minutos. Revisa el proveedor y reintenta.",
          "cancelled": "Pregunta cancelada."
        };
        burbuja("err", (notas[res && res.status] || "No pude responder.") +
          (res && res.message ? " " + res.message : ""));
      });
    });
  }

  // ── montar ────────────────────────────────────────────────────────────────
  function montar() {
    if (document.getElementById("rchat")) return;
    const style = document.createElement("style");
    style.textContent = CSS;
    document.head.appendChild(style);

    fab = document.createElement("button");
    fab.id = "rchat-fab";
    fab.type = "button";
    fab.title = "Preguntar al proyecto";
    fab.setAttribute("aria-label", "Preguntar al proyecto");
    fab.setAttribute("data-busy", "0");
    fab.innerHTML = ICONO;

    panel = document.createElement("section");
    panel.id = "rchat";
    panel.setAttribute("data-open", "0");
    panel.setAttribute("aria-label", "Chat del proyecto");
    panel.innerHTML =
      '<header><b>Preguntar al proyecto</b><span class="rchat-chip"></span>' +
      '<button class="rchat-max" type="button" title="Abrir en grande" aria-label="Abrir en grande">' + AMPLIAR + "</button>" +
      '<button class="rchat-x" type="button" title="Cerrar">' + CERRAR + "</button></header>" +
      '<div id="rchat-log"></div>' +
      '<div id="rchat-chips"></div>' +
      '<form><textarea rows="1" placeholder="¿Qué me falta para el guion?" aria-label="Tu pregunta"></textarea>' +
      '<button type="submit" title="Enviar">' + ENVIAR + "</button></form>" +
      '<div class="rchat-pie"><span class="rchat-uso"></span><span class="rchat-agente"></span></div>';

    document.body.appendChild(fab);
    document.body.appendChild(panel);
    log = panel.querySelector("#rchat-log");
    input = panel.querySelector("textarea");
    form = panel.querySelector("form");
    chip = panel.querySelector(".rchat-chip");
    chips = panel.querySelector("#rchat-chips");
    pie = panel.querySelector(".rchat-pie");
    pieUso = panel.querySelector(".rchat-uso");
    pieAgente = panel.querySelector(".rchat-agente");

    ["¿Qué me falta?", "¿Cuál es mi reto?", "¿Qué dice la rúbrica de impacto?", "Resume mi solución"]
      .forEach(function (t) {
        const b = document.createElement("button");
        b.type = "button";
        b.textContent = t;
        b.addEventListener("click", function () { enviar(t); });
        chips.appendChild(b);
      });

    if (ESTATICO) {
      input.placeholder = "El chat funciona en tu programa local";
      input.disabled = true;
      form.querySelector('button[type="submit"]').disabled = true;
      chips.style.display = "none";
    }

    // Historial del proyecto actual
    leerEstado().then(function (st) {
      ultimoEstado = st;
      try {
        const raw = localStorage.getItem(claveHistorial(st));
        historial = raw ? JSON.parse(raw) : [];
        if (!Array.isArray(historial)) historial = [];
      } catch (e) { historial = []; }
      pintarHistorial();
      pintarUso();
    });

    // Inventario de archivos que el modelo puede citar (se recarga al abrir)
    leerInventario();

    fab.addEventListener("click", function () {
      const abierto = panel.getAttribute("data-open") === "1";
      panel.setAttribute("data-open", abierto ? "0" : "1");
      if (!abierto) {
        chipProveedor();
        input.focus();
        log.scrollTop = log.scrollHeight;
      } else if (cancelable && window.RSA && window.RSA.cancelAnalysis) {
        window.RSA.cancelAnalysis();
        fantasma(false);
        ocupar(false);
        marcarAgente(false);
        burbuja("info", "Pregunta cancelada.");
      }
    });
    panel.querySelector(".rchat-max").addEventListener("click", function () {
      const grande = panel.getAttribute("data-max") === "1";
      panel.setAttribute("data-max", grande ? "0" : "1");
      this.innerHTML = grande ? AMPLIAR : REDUCIR;
      const texto = grande ? "Abrir en grande" : "Reducir";
      this.title = texto;
      this.setAttribute("aria-label", texto);
      log.scrollTop = log.scrollHeight;
    });
    panel.querySelector(".rchat-x").addEventListener("click", function () {
      panel.setAttribute("data-open", "0");
      if (cancelable && window.RSA && window.RSA.cancelAnalysis) {
        window.RSA.cancelAnalysis();
        fantasma(false);
        ocupar(false);
        marcarAgente(false);
      }
    });

    form.addEventListener("submit", function (ev) {
      ev.preventDefault();
      enviar(input.value);
    });
    input.addEventListener("keydown", function (ev) {
      if (ev.key === "Enter" && !ev.shiftKey) {
        ev.preventDefault();
        if (cancelable && window.RSA && window.RSA.cancelAnalysis) {
          window.RSA.cancelAnalysis();
          fantasma(false);
          ocupar(false);
          marcarAgente(false);
          burbuja("info", "Pregunta cancelada.");
          return;
        }
        enviar(input.value);
      }
    });
    input.addEventListener("input", function () {
      input.style.height = "auto";
      input.style.height = Math.min(120, input.scrollHeight) + "px";
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", montar);
  } else {
    montar();
  }
})();
