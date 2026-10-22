"use strict";
// dashboard/super_agents.js — Super Agentes ("Herramientas") del dashboard.
// Módulo autocontenido: no toca el motor (app.js). Núcleo puro arriba,
// arranque de UI abajo (Tasks 3–5 del plan 2026-10-21-super-agentes).
//
// Contrato con el resto del proyecto:
// - Lee, JAMÁS escribe, el estado del tablero
//   (localStorage["rally_studio_production_state_2026_v3"]).
// - La IA va SOLO por el servicio local (scripts/rally_service.py):
//   POST /api/ai + GET /api/ai/progress (cliente entra en Task 4).
// - Historial con llaves rally_super_agents_*.
// globalThis.RSAprocessablepure disponible para tests vía node:vm.

(function () {
  const STORE_KEY = "rally_studio_production_state_2026_v3";
  const HISTORY_KEY = "rally_super_agents_history_v1";

  // Espejo de dashboard/app.js (getPautadoLimit): nunca fuente creativa.
  const PAUTADO_LIMITS = {
    problema: 1250, solucion: 1250, impacto: 1000, innovacion: 1000, prefactibilidad: 1500
  };
  const PAUTADO_MIN = 150; // .agents/rules/pautado-y-guion.md (mínimo por sección)
  const PAUTADO_LABELS = {
    problema: "Problema", solucion: "Solución", impacto: "Impacto",
    innovacion: "Innovación", prefactibilidad: "Prefactibilidad"
  };
  // Espejo de app.js:8220 — exactamente 9 bloques.
  const CANVAS_KEYS = [
    "socios", "actividades", "propuesta", "relaciones", "segmentos",
    "recursos", "canales", "costes", "ingresos"
  ];
  // Decisión del dueño: mismo rango en ambos certámenes (Nacional en C$ con
  // la tasa BCN de la conversión; USD canónico siempre en el estado).
  const BUDGET_MIN_USD = 4000;
  const BUDGET_MAX_USD = 6000;
  // .agents/rules/pautado-y-guion.md: locución 130–140 palabras/min → ~135.
  // Duración estimada = palabras / 2.25 segundos.
  const WPS = 2.25;
  const WORDS_MIN = 240;
  const WORDS_MAX = 270;

  const MOD = {};

  function p(severity, title, evidence) {
    return { title: String(title), severity, evidence: String(evidence == null ? "" : evidence) };
  }
  function countWords(text) {
    return String(text || "").trim().split(/\s+/).filter(Boolean).length;
  }
  function normalize(text) {
    return String(text || "").toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
  }
  function fmt(n) {
    return Number(n).toLocaleString("en-US");
  }
  // Decisión 12 de la spec: montos literales solamente. Números ≥ 1000 en
  // textos de costes/ingresos de canvas; la semántica la lleva la IA.
  function amountsOf(text) {
    const out = [];
    const re = /\d[\d.,]*(?=[^\d]|$)/g;
    const t = String(text || "");
    let m;
    while ((m = re.exec(t)) !== null) {
      const n = parseFloat(m[0].replace(/[.,]/g, ""));
      if (n >= 1000) out.push(n);
    }
    return out;
  }
  // Primera frase literal (≥ minLen caracteres ya normalizados) compartida
  // entre dos textos. Matching exacto, nada difuso.
  function sharedPhrase(a, b, minLen) {
    if (!a || a.length < minLen || !b || b.length < minLen) return "";
    for (let i = 0; i + minLen <= a.length; i++) {
      const sub = a.slice(i, i + minLen);
      if (b.includes(sub)) return sub;
    }
    return "";
  }

  // ── Estado (solo lectura) ────────────────────────────────────────────────
  MOD.readState = function readState() {
    try {
      const raw = localStorage.getItem(STORE_KEY);
      const st = raw ? JSON.parse(raw) : {};
      return st && typeof st === "object" ? st : {};
    } catch (e) {
      return {};
    }
  };

  // ── Checks locales deterministas ─────────────────────────────────────────
  MOD.scriptChecks = function scriptChecks(state, projectName) {
    const problems = [];
    const script = state && state.script;
    if (!script) return { problems };
    const quáli = [];
    const actNames = ["Acto I", "Acto II", "Acto III", "Acto IV"];
    const acts = [script.acto1, script.acto2, script.acto3, script.acto4];
    let total = 0;
    acts.forEach((t, i) => {
      const w = countWords(t);
      total += w;
      if (w === 0) problems.push(p("Critico", actNames[i] + " está vacío", "El acto " + (i + 1) + " del guion no tiene texto."));
    });
    if (total > 0) {
      const secs = Math.round(total / WPS);
      if (secs > 120) problems.push(p("Critico", "Duración estimada supera 120 s (" + secs + " s)", total + " palabras a ~135 palabras/min."));
      if (total < WORDS_MIN || total > WORDS_MAX) {
        problems.push(p("Mejora", "Palabras fuera del rango 240–270: " + total, "El guion completo tiene " + total + " palabras."));
      }
    }
    const pn = projectName && String(projectName).trim();
    if (pn && acts[0]) {
      const nc = normalize(acts[0]);
      const npn = normalize(pn);
      if (nc && npn && nc.includes(npn)) {
        problems.push(p("Critico", "Acto I menciona el nombre del proyecto (prohibido)", "Los primeros 20 s no llevan nombre ni logo del proyecto."));
      }
    }
    return { problems };
  };

  MOD.pautadoChecks = function pautadoChecks(state) {
    const problems = [];
    const pa = state && state.pautado && typeof state.pautado === "object" ? state.pautado : null;
    const esNac = state && state.rally_type === "nacional";
    if (!pa) {
      problems.push(p("Mejora", "El pautado está vacío: llénalo en la pestaña 06", ""));
      return { problems };
    }
    const keys = Object.keys(PAUTADO_LIMITS);
    if (keys.every((k) => !String(pa[k] || "").trim())) {
      problems.push(p("Mejora", "El pautado está vacío: llénalo en la pestaña 06", ""));
      return { problems };
    }
    const norm = {};
    keys.forEach((k) => { norm[k] = normalize(pa[k] || ""); });
    keys.forEach((k) => {
      const len = String(pa[k] || "").length;
      const limit = esNac ? null : PAUTADO_LIMITS[k];
      if (limit !== null && len > limit) {
        problems.push(p("Critico", PAUTADO_LABELS[k] + ": " + len + " caracteres exceden el tope " + limit + " del pautado", len + " > " + limit + " caracteres"));
      }
      if (limit !== null && len < PAUTADO_MIN) {
        problems.push(p("Mejora", PAUTADO_LABELS[k] + ": " + len + " caracteres (mínimo 150)", "La sección " + k + " es corta."));
      }
      if (limit === null && len === 0) {
        problems.push(p("Mejora", PAUTADO_LABELS[k] + ": sección vacía", "En Nacional no hay tope, pero la sección no puede quedar vacía."));
      }
    });
    // Datos repetidos entre secciones: frases literales ≥ 25 caracteres.
    for (let i = 0; i < keys.length; i++) {
      const a = norm[keys[i]];
      for (let j = i + 1; j < keys.length; j++) {
        const b = norm[keys[j]];
        const dup = sharedPhrase(a, b, 25);
        if (dup) {
          problems.push(p("Mejora", "Dato repetido en secciones " + PAUTADO_LABELS[keys[i]] + " y " + PAUTADO_LABELS[keys[j]], "Frase literal repetida (" + dup.length + " caracteres): \"" + dup.slice(0, 40) + "…\" Cada sección debe aportar información nueva."));
        }
      }
    }
    // Nombre del proyecto: máximo 1 mención por sección.
    const pn = normalize(state && state.project_name || "");
    if (pn) {
      keys.forEach((k) => {
        const c = norm[k].split(pn).length - 1;
        if (c > 1) {
          problems.push(p("Mejora", "El nombre del proyecto aparece " + c + " veces en " + PAUTADO_LABELS[k] + " (máximo 1 por sección)", "Sección " + k + "."));
        }
      });
    }
    return { problems };
  };

  MOD.budgetChecks = function budgetChecks(state) {
    const problems = [];
    const rows = state && Array.isArray(state.budget) ? state.budget : [];
    let totalUsd = 0;
    rows.forEach((r) => {
      const name = (r && (r.element || r.concept)) || "sin nombre";
      const units = Number(r && r.units) || 0;
      const cost = Number(r && r.unit_cost) || 0;
      totalUsd += units * cost;
      if (units <= 0) problems.push(p("Critico", "Fila '" + name + "': units debe ser > 0", "units=" + units));
      if (!r || !r.url) problems.push(p("Mejora", "Fila '" + name + "': sin URL de respaldo", "Cada fila necesita enlace del proveedor."));
    });
    const inRange = totalUsd >= BUDGET_MIN_USD && totalUsd <= BUDGET_MAX_USD;
    if (!inRange) {
      const esNac = state && state.rally_type === "nacional";
      const rate = esNac ? Number(state.exchange_rate_bcn) || 0 : 0;
      if (esNac && rate > 0) {
        const lo = Math.round(BUDGET_MIN_USD * rate);
        const hi = Math.round(BUDGET_MAX_USD * rate);
        problems.push(p("Critico", "Presupuesto fuera de rango: " + fmt(totalUsd) + " USD = " + fmt(Math.round(totalUsd * rate)) + " C$ (rango " + fmt(lo) + "–" + fmt(hi) + " C$)", "Rango $4,000–$6,000 USD convertido con tasa " + rate + " del BCN."));
      } else {
        problems.push(p("Critico", "Presupuesto fuera de rango: $" + fmt(totalUsd) + " USD (rango $4,000–$6,000 USD)", "Suma de units × unit_cost."));
      }
    }
    return { problems, totalUsd };
  };

  MOD.canvasChecks = function canvasChecks(state) {
    const problems = [];
    const canvas = state && state.model_canvas && typeof state.model_canvas === "object" ? state.model_canvas : {};
    const missing = CANVAS_KEYS.filter((k) => !String(canvas[k] || "").trim());
    if (missing.length) {
      problems.push(p("Mejora", "Faltan " + missing.length + " de 9 bloques del canvas: " + missing.join(", "), "Lista completa de bloques: " + CANVAS_KEYS.join(", ") + "."));
    }
    const total = MOD.budgetChecks(state).totalUsd;
    const shown = Math.round(total);
    if (shown > 0) {
      ["costes", "ingresos"].forEach((k) => {
        amountsOf(canvas[k] || "").forEach((n) => {
          if (n !== shown) {
            problems.push(p("Mejora", "Canvas '" + k + "' cita " + fmt(n) + " pero el presupuesto suma " + fmt(shown), "Monto en canvas = " + String(n) + "; presupuesto totalUsd = " + String(shown) + " USD (Alerta de Discrepancia Númérica)."));
          }
        });
      });
    }
    return { problems };
  };

  MOD.shotlistChecks = function shotlistChecks(state) {
    const problems = [];
    const plan = state && Array.isArray(state.shot_plan) ? state.shot_plan : [];
    if (!plan.length) return { problems };
    const seen = new Set();
    plan.forEach((row) => {
      const id = String((row && row.id) || "").trim();
      if (!id) return;
      if (seen.has(id)) {
        problems.push(p("Mejora", "Shotlist: id duplicado '" + id + "' en el plan de tomas", "Dos tomas comparten el id " + id + "."));
      }
      seen.add(id);
    });
    const ids = Array.from(seen);
    const re = ids.length
      ? new RegExp("^asset_(" + ids.join("|") + ")_[a-z0-9_\\-]+\\.[a-z0-9]+$", "i")
      : null;
    const items = state && state.video_assets && Array.isArray(state.video_assets.items) ? state.video_assets.items : [];
    items.forEach((it) => {
      const name = String((it && it.name) || "");
      if (!name) return;
      if (!re || !re.test(name)) {
        problems.push(p("Sugerencia", "Asset '" + name + "' no sigue la convención asset_<id>_<descripción>.<ext>", "Nombres de assets: asset_<shotlist_id>_<descripcion>.<ext>"));
      }
    });
    return { problems };
  };

  // ── Prompts (decisión 11: la tarea y el formato va dentro) ────────────────
  function contentBlock(agentId, state) {
    const vacio = "(sin contenido aún en la pestaña correspondiente)";
    if (agentId === "guion") {
      const s = (state && state.script) || {};
      return "Acto I: " + (s.acto1 || vacio) + "\nActo II: " + (s.acto2 || vacio) +
        "\nActo III: " + (s.acto3 || vacio) + "\nActo IV: " + (s.acto4 || vacio);
    }
    if (agentId === "presupuesto") {
      const rows = state && Array.isArray(state.budget) ? state.budget : [];
      if (!rows.length) return vacio;
      return rows.map((r) => "- " + ((r && (r.element || r.concept)) || "sin nombre") +
        " | " + ((r && r.category) || "") + " | unidades " + ((r && r.units) || 0) +
        " | costo unitario " + fmt((r && r.unit_cost) || 0) + " | " + ((r && r.url) || "sin URL")).join("\n");
    }
    if (agentId === "pautado") {
      const pa = (state && state.pautado) || {};
      return Object.keys(PAUTADO_LIMITS).map((k) => PAUTADO_LABELS[k] + ": " + (pa[k] || vacio)).join("\n\n");
    }
    if (agentId === "canvas") {
      const c = (state && state.model_canvas) || {};
      return CANVAS_KEYS.map((k) => k + ": " + (c[k] || vacio)).join("\n\n");
    }
    if (agentId === "videoEditor") {
      const plan = state && Array.isArray(state.shot_plan) ? state.shot_plan : [];
      if (!plan.length) return vacio;
      return plan.map((r) => "- " + (r && r.id) + " (" + (r && r.acto) + "): " + (r && r.label)).join("\n");
    }
    if (agentId === "docs") {
      return (state && state._rsa_doc_text) || vacio; // Task 5 lo alimenta
    }
    return vacio;
  }

  MOD.buildPrompt = function buildPrompt(agentCfg, rubricAgent, state, mode) {
    const st = state || {};
    const cfg = agentCfg || {};
    const rub = rubricAgent || { reglas: [], promptTarea: {}, salidaEsperada: {} };
    const parts = [];
    parts.push("[ROL]\nEres el Super Agente \"" + (cfg.name || cfg.id) + "\" del Rally Studio, asesor experto del certamen. Ayudas a un equipo de innovación a ganar evaluación perfecta.");
    parts.push("[RÚBRICA ACTIVA]\n" + (rub.reglas || []).map((r) => "- " + r.texto + " (ref: " + r.ref + ")").join("\n"));
    const ctxLines = ["- Certamen: " + (st.rally_type || "sin definir")];
    if (st.project_name) ctxLines.push("- Proyecto: " + st.project_name);
    if (st.challenge_title) ctxLines.push("- Reto: " + st.challenge_title);
    if (st.solution_thesis) ctxLines.push("- Solución: " + st.solution_thesis);
    if (st.exchange_rate_bcn) ctxLines.push("- Tasa BCN: " + st.exchange_rate_bcn + " C$/USD");
    parts.push("[CONTEXTO DEL PROYECTO]\n" + ctxLines.join("\n"));
    parts.push("[CONTENIDO ACTUAL]\n" + contentBlock(cfg.id, st));
    const tarea = (rub.promptTarea && rub.promptTarea[mode]) || "";
    parts.push("[TAREA]\n" + tarea);
    const salida = (rub.salidaEsperada && rub.salidaEsperada[mode]) || "";
    let salidaTxt = salida;
    if (mode === "directo") {
      salidaTxt += (salidaTxt ? "\n" : "") +
        "Responde EXCLUSIVAMENTE con JSON válido:\n" +
        '{"veredictos":[{"criterio":"...","estado":"Cumple|Parcial|Falla"}],' +
        ' "problemas":[{"titulo":"...","severidad":"Critico|Mejora|Sugerencia","evidencia":"...","correccion":"..."}],' +
        ' "ajustes":[{"texto de reemplazo","tab","slot"}],' +
        ' "visuales":["..."]}';
    }
    parts.push("[FORMATO DE SALIDA]\n" + salidaTxt);
    return parts.join("\n\n");
  };

  // ── Resultado de IA (JSON estructurado o crudo, nunca inventa) ────────────
  const AI_KEYS = ["veredictos", "problemas", "ajustes", "visuales"];
  MOD.parseAIResult = function parseAIResult(text) {
    const s = String(text == null ? "" : text);
    const i = s.indexOf("{");
    if (i < 0) return { format: "raw", text: s };
    const j = s.lastIndexOf("}");
    if (j <= i) return { format: "raw", text: s };
    try {
      const data = JSON.parse(s.slice(i, j + 1));
      if (data && typeof data === "object" && AI_KEYS.some((k) => k in data)) {
        return { format: "json", data };
      }
    } catch (e) { /* cae a raw */ }
    return { format: "raw", text: s };
  };

  // ── Historial (máx 10 por agente, más nuevo primero) ─────────────────────
  MOD.historyList = function historyList(agentId) {
    try {
      const h = JSON.parse(localStorage.getItem(HISTORY_KEY) || "{}");
      return Array.isArray(h && h[agentId]) ? h[agentId].slice(0, 10) : [];
    } catch (e) {
      return [];
    }
  };
  MOD.historyAdd = function historyAdd(agentId, entry) {
    let h = {};
    try { h = JSON.parse(localStorage.getItem(HISTORY_KEY) || "{}"); } catch (e) { h = {}; }
    if (!h || typeof h !== "object") h = {};
    const list = Array.isArray(h[agentId]) ? h[agentId].filter(Boolean) : [];
    const rec = Object.assign({ ts: Date.now() }, entry || {});
    list.unshift(rec);
    h[agentId] = list.slice(0, 10);
    try { localStorage.setItem(HISTORY_KEY, JSON.stringify(h)); } catch (e) { /* storage lleno */ }
    return h[agentId];
  };

  globalThis.RSA = MOD;

  // Arranque de UI: solo en navegador con topbar presente (Task 3).
  if (typeof window !== "undefined" && window.document && document.getElementById("topbar")) {
    // Boot de UI pendiente (Task 3 del plan).
  }
})();
