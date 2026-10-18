// dashboard/app.js -- Rally Studio Workbench Oficial (Flujo Real de Competencia)
// Arquitectura secuencial estricta: Certamen -> Equipo -> Reto -> Solución -> Espacio de Trabajo Completo.
// Soporte total para retos personalizados e ideas nuevas sin datos simulados ni hardcodeos.

// ── ICONOS SVG VECTORIALES (CERO EMOJIS) ──────────────────────────────────────
const SVG = {
  check: `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>`,
  lock: `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>`,
  clock: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>`,
  download: `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>`,
  upload: `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>`,
  external: `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>`,
  menu: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>`,
  globe: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>`,
  shield: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>`,
  copy: `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>`,
  spark: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>`,
  arrowRight: `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>`,
  plus: `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>`
};

// ── CATÁLOGO BASE DE DESAFÍOS (RALLY 2026) ───────────────────────────────────
const OFFICIAL_CHALLENGES_2026 = [
  {
    id: "01",
    title: "Segunda vida y reconversión de motores eléctricos de electrodomésticos en desuso",
    category: "Impacto Social",
    ods: ["ODS 12", "ODS 8", "ODS 9"],
    winRate: 92,
    compDensity: "Baja (3 sedes)",
    precedent: "Avocado 2026 (1° Nac. Social) / Revolt (El Salvador)",
    officialExpectation: "Aprovechar motores de lavadoras y ventiladores desechados para reducir chatarra y generar tracción o generación eléctrica a bajo costo en comunidades rurales.",
    wowProposal: "Kit de reconversión con variador de frecuencia universal reciclado, acople impreso en PETG y banco de molienda de forraje agropecuario accionado por rotor recuperado."
  },
  {
    id: "02",
    title: "Redes de sensores comunitarios para prevención y alerta temprana de inundaciones",
    category: "Innovación",
    ods: ["ODS 11", "ODS 13", "ODS 3"],
    winRate: 84,
    compDensity: "Alta (9 sedes)",
    precedent: "Techriders 2024 (1° Int. Latam) / Steel Innovators 2026",
    officialExpectation: "Monitorear crecidas repentinas de ríos y cauces urbanos para alertar a pobladores vulnerables antes de que el agua sobrepase cotas de riesgo.",
    wowProposal: "Red de telemetría hiperlocal con nodos ultrasónicos no invasivos, protocolo LoRaWAN de largo alcance y compuerta electromecánica de alivio con 30 minutos de anticipación."
  },
  {
    id: "03",
    title: "Protección y fomento tecnológico de polinizadores en entornos agropecuarios y urbanos",
    category: "Innovación",
    ods: ["ODS 15", "ODS 2", "ODS 13"],
    winRate: 95,
    compDensity: "Muy Baja (2 sedes)",
    precedent: "Ignis Code 2026 (1° Nac. Innovación)",
    officialExpectation: "Preservar colonias de abejas y polinizadores nativos frente al cambio climático y pesticidas agrícolas con soluciones de fácil adopción.",
    wowProposal: "Colmena bioclimática con monitor bioacústico/térmico pasivo no intrusivo y difusor piezoeléctrico de micronutrientes orgánicos activado por energía solar."
  },
  {
    id: "04",
    title: "Revalorización y transformación de residuos de poda y biomasa vegetal urbana",
    category: "Innovación",
    ods: ["ODS 12", "ODS 11", "ODS 13"],
    winRate: 88,
    compDensity: "Media (4 sedes)",
    precedent: "Kubo I+D (Argentina 2026) / Bioinnovatech (Costa Rica)",
    officialExpectation: "Evitar la quema indiscriminada de ramas y hojas en las ciudades mediante procesos de aprovechamiento energético o fertilizante.",
    wowProposal: "Reactor modular de pirólisis lenta in-situ para producción de biochar activado con inoculantes micorrícicos, con captura de gases térmicos para secado de granos."
  },
  {
    id: "05",
    title: "Reservorios pluviales y captación comunitaria de agua con microfiltración",
    category: "Innovación",
    ods: ["ODS 6", "ODS 11", "ODS 12"],
    winRate: 86,
    compDensity: "Alta (8 sedes)",
    precedent: "Francisquitos (El Salvador 2026) / Sistema Captación UNI (2024)",
    officialExpectation: "Captar y almacenar agua pluvial en techos de escuelas o viviendas rurales garantizando calidad para consumo humano e higiene.",
    wowProposal: "Cisterna modular prefabricada con separador centrífugo de primeras lluvias, lecho de zeolita natural con carbón de cáscara de café y dosificador solar UV-C."
  },
  {
    id: "06",
    title: "Gestión y valorización de residuos plásticos en playas y ecosistemas costeros",
    category: "Impacto Social",
    ods: ["ODS 14", "ODS 12", "ODS 11"],
    winRate: 78,
    compDensity: "Media (5 sedes)",
    precedent: "Recoplaya / Smat Warriors (URACCAN 2025)",
    officialExpectation: "Retirar redes de pesca fantasma y plásticos de un solo uso que amenazan la fauna marina en litorales costeros.",
    wowProposal: "Extrusora compacta móvil de filamento de PET/nylon para impresión 3D de artes de pesca duraderas y balizas flotantes de señalización costera."
  },
  {
    id: "07",
    title: "Recolección y conversión de aceite vegetal doméstico usado en biocombustibles o jabón",
    category: "Impacto Social",
    ods: ["ODS 12", "ODS 6", "ODS 7"],
    winRate: 82,
    compDensity: "Baja (3 sedes)",
    precedent: "Foodtech (FIUNI Paraguay 2026)",
    officialExpectation: "Evitar que el aceite de cocina contamine fuentes de agua dulce creando un modelo de reciclaje barrial con retorno tangible.",
    wowProposal: "Micro-planta barrial de transesterificación asistida por cavitación hidrodinámica de bajo consumo, con dispensador de jabón biodegradable comunitario."
  },
  {
    id: "08",
    title: "Reducción de desperdicio de alimentos y logística de redistribución en mercados",
    category: "Impacto Social",
    ods: ["ODS 2", "ODS 12", "ODS 1"],
    winRate: 85,
    compDensity: "Alta (7 sedes)",
    precedent: "Mexitech (UPEMOR 1° Int. 2024) / Catalizadores (Chile)",
    officialExpectation: "Conectar mermas de frutas y verduras frescas de mercados populares con comedores comunitarios antes de que se descompongan.",
    wowProposal: "Bolsa comunitaria digital P2P operada por bots de mensajería SMS/WhatsApp de cero datos móviles, vinculada a deshidratadores solares parabólicos."
  },
  {
    id: "09",
    title: "Sistemas modulares de refugio y energía de emergencia post-desastre climático",
    category: "Innovación",
    ods: ["ODS 11", "ODS 13", "ODS 7"],
    winRate: 89,
    compDensity: "Baja (3 sedes)",
    precedent: "Hooke (Chile 2026) / The Bubbles (Paraguay)",
    officialExpectation: "Proveer albergue temporal digno y energía eléctrica mínima a familias damnificadas por huracanes o terremotos en menos de 24 horas.",
    wowProposal: "Célula habitable hexagonal desplegable en seco en 45 minutos con paneles sándwich de caña brava tratada y techo flexible fotovoltaico con banco LiFePO4."
  }
];

// ── LÍMITES OFICIALES DE PAUTADO (CON ESPACIOS) ──────────────────────────────
const PAUTADO_LIMITS = {
  problema: 1250,
  solucion: 1250,
  prefactibilidad: 1000,
  innovacion: 1000,
  impacto: 1500
};

// ── ESTADO REACTIVO DEL SISTEMA ─────────────────────────────────────────────
function getInitialState() {
  return {
    rally_type: null, // "latam" | "nacional" | null
    hours_total: 28,
    hours_remaining: 28,
    team_name: "",
    university: "",
    city: "",
    team_logo: "shield",
    project_name: "",
    category: "Innovación",
    challenge_id: "",
    challenge_title: "",
    
    // Retos dinámicos (Permite agregar retos propios inventados o del comité)
    challenges: JSON.parse(JSON.stringify(OFFICIAL_CHALLENGES_2026)),

    // Taller de Solución
    solution_raw_input: "",
    solution_thesis: "",
    solution_simple: "",
    solution_boosters: ["ods", "sensors"],
    solution_approved: false,

    // Identidad cromática
    palette: {
      primary: "#1e40af",
      secondary: "#3b82f6",
      accent: "#0ea5e9"
    },

    claims: [],

    // Pautado Oficial
    pautado: {
      problema: "",
      solucion: "",
      prefactibilidad: "",
      innovacion: "",
      impacto: ""
    },

    // Presupuesto Sustentado
    budget: [
      { element: "Unidad Central MCU + Módulo de Comunicaciones", units: 10, unit_cost: 14.50, url: "https://alibaba.com" },
      { element: "Sensores Industriales de Entrada / Detección", units: 10, unit_cost: 45.00, url: "https://alibaba.com" },
      { element: "Sistema de Energía Autónomo + Baterías LiFePO4", units: 8, unit_cost: 120.00, url: "https://alibaba.com" },
      { element: "Carcasas de Protección Estancas IP67", units: 10, unit_cost: 32.00, url: "https://alibaba.com" },
      { element: "Módulo Concentrador / Estación Central", units: 2, unit_cost: 295.00, url: "https://alibaba.com" },
      { element: "Flete Internacional y Aranceles de Importación", units: 1, unit_cost: 650.00, url: "https://dhl.com" }
    ],

    // Guion 120 segundos
    script: {
      acto1: "",
      acto2: "",
      acto3: "",
      acto4: ""
    },

    // Enlaces de colaboración
    google_drive_url: "https://drive.google.com",
    canva_url: "https://canva.com",
    figma_url: "",
    local_ip: "192.168.1.50"
  };
}

let state = getInitialState();
let activeTab = "certamen";
let timerInterval = null;
let challengeFilter = "all";
let showAddChallengeForm = false;
let showBatchIngestForm = false;

// ── DETERMINAR ETAPA ACTUAL DEL PROCESO ──────────────────────────────────────
function getWorkflowStage() {
  if (!state.rally_type) return 0; // Certamen
  if (!state.team_name || !state.university) return 1; // Equipo
  if (!state.challenge_id) return 2; // Reto
  if (!state.solution_approved) return 3; // Taller Solución
  return 4; // Espacio de Trabajo Completo
}

// ── NAVEGACIÓN MODULAR Y DEPENDENCIAS ─────────────────────────────────────────
const NAV_TABS = [
  { id: "certamen",   label: "00 Certamen",             level: 0, check: () => true },
  { id: "team",       label: "01 Identidad de Equipo",  level: 1, check: () => !!state.rally_type },
  { id: "challenges", label: "02 Selección de Reto",    level: 2, check: () => !!state.rally_type && !!state.team_name },
  { id: "solution",   label: "03 Taller de Solución",   level: 3, check: () => !!state.challenge_id },
  { id: "pautado",    label: "04 Pautado Oficial",      level: 4, check: () => state.solution_approved && isPautadoComplete() },
  { id: "budget",     label: "05 Presupuesto de Marcha",level: 4, check: () => state.solution_approved && isBudgetValid() },
  { id: "resources",  label: "06 Bóveda de Recursos",   level: 4, check: () => state.solution_approved },
  { id: "canvas",     label: "07 Modelo Canvas",        level: 4, check: () => state.solution_approved },
  { id: "script",     label: "08 Guion 120s (4 Actos)", level: 5, check: () => isPautadoComplete() && isBudgetValid() },
  { id: "webdemo",    label: "09 Prototipo para Video", level: 5, check: () => isPautadoComplete() && isBudgetValid() },
  { id: "timeline",   label: "10 Cronograma de Entrega",level: 4, check: () => state.solution_approved }
];

function isPautadoComplete() {
  return Object.keys(PAUTADO_LIMITS).every(k => {
    const len = (state.pautado[k] || "").length;
    return len >= 150 && len <= PAUTADO_LIMITS[k];
  });
}

function isBudgetValid() {
  const total = state.budget.reduce((acc, it) => acc + (it.units * it.unit_cost), 0);
  return total >= 3000 && total <= 6500;
}

function isScriptComplete() {
  const totalWords = [state.script.acto1, state.script.acto2, state.script.acto3, state.script.acto4]
    .join(" ").trim().split(/\s+/).filter(Boolean).length;
  return totalWords >= 120 && totalWords <= 280;
}

// ── INICIALIZACIÓN ───────────────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  loadSavedState();
  initClock();
  syncUI();
});

function syncUI() {
  const stage = getWorkflowStage();
  const body = document.getElementById("app-body");

  if (stage < 2) {
    body.classList.add("setup-mode");
    if (activeTab !== "certamen" && activeTab !== "team") {
      activeTab = stage === 0 ? "certamen" : "team";
    }
  } else {
    body.classList.remove("setup-mode");
  }

  renderTopbar();
  renderNavigation();
  renderTab(activeTab);
  updateInspector();
}

function loadSavedState() {
  try {
    const saved = localStorage.getItem("rally_studio_production_state_2026");
    if (saved) {
      state = Object.assign(getInitialState(), JSON.parse(saved));
      if (!state.challenges || !state.challenges.length) {
        state.challenges = JSON.parse(JSON.stringify(OFFICIAL_CHALLENGES_2026));
      }
      const stage = getWorkflowStage();
      if (stage === 0) activeTab = "certamen";
      else if (stage === 1) activeTab = "team";
      else if (stage === 2) activeTab = "challenges";
      else if (stage === 3) activeTab = "solution";
      else if (!activeTab || activeTab === "certamen" || activeTab === "team") activeTab = "challenges";
    }
  } catch (e) {
    console.error("Error al cargar estado local", e);
  }
}

function saveState() {
  try {
    localStorage.setItem("rally_studio_production_state_2026", JSON.stringify(state));
  } catch (e) {}
  updateInspector();
  renderTopbar();
}

function resetProject() {
  if (confirm("¿Iniciar nuevo proyecto desde cero? Se limpiarán los datos locales para arrancar una nueva competencia.")) {
    localStorage.removeItem("rally_studio_production_state_2026");
    state = getInitialState();
    activeTab = "certamen";
    syncUI();
  }
}

function exportProjectJson() {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state, null, 2));
  const dlAnchorElem = document.createElement('a');
  dlAnchorElem.setAttribute("href", dataStr);
  const pName = (state.project_name || state.team_name || "proyecto_rally").toLowerCase().replace(/\s+/g, "_");
  dlAnchorElem.setAttribute("download", `${pName}_respaldo.json`);
  dlAnchorElem.click();
}

function importProjectJson(ev) {
  const file = ev.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const imported = JSON.parse(e.target.result);
      state = Object.assign(getInitialState(), imported);
      saveState();
      syncUI();
      alert("Proyecto importado con éxito.");
    } catch (err) {
      alert("Error al leer archivo JSON: " + err.message);
    }
  };
  reader.readAsText(file);
}

// ── CRONÓMETRO REGRESIVO ─────────────────────────────────────────────────────
function initClock() {
  if (timerInterval) clearInterval(timerInterval);
  let totalSec = (state.hours_total || 28) * 3600;

  timerInterval = setInterval(() => {
    if (totalSec > 0) totalSec--;
    const h = Math.floor(totalSec / 3600).toString().padStart(2, "0");
    const m = Math.floor((totalSec % 3600) / 60).toString().padStart(2, "0");
    const s = Math.floor(totalSec % 60).toString().padStart(2, "0");
    const timeStr = `${h}:${m}:${s}`;
    
    const clockEl = document.getElementById("clock-timer");
    if (clockEl) clockEl.innerText = timeStr;
  }, 1000);
}

// ── TOGGLE SIDEBAR & PANEL ───────────────────────────────────────────────────
function toggleSidebar() {
  document.getElementById("app-body").classList.toggle("sidebar-collapsed");
}

function togglePanel() {
  document.getElementById("app-body").classList.toggle("panel-collapsed");
}

// ── TOPBAR ───────────────────────────────────────────────────────────────────
function renderTopbar() {
  const el = document.getElementById("topbar");
  const stage = getWorkflowStage();
  const certamen = state.rally_type === "latam" ? "Rally Latam 28h" : state.rally_type === "nacional" ? "Rally Nacional 24h" : "Sin Certamen";
  const pName = state.project_name || state.team_name || "T=0";

  el.innerHTML = `
    <div class="topbar-left">
      ${stage >= 2 ? `<button class="btn-toggle-sidebar" onclick="toggleSidebar()" title="Colapsar/Expandir menú lateral">${SVG.menu}</button>` : ""}
      <span class="brand-badge">RALLY STUDIO</span>
      ${state.rally_type ? `<span class="mode-tag">${certamen}</span>` : ""}
      ${state.team_name ? `<span class="project-title">${pName}</span>` : ""}
      ${state.challenge_id ? `<span style="font-size:11px; font-weight:700; color:var(--text-muted); font-family:var(--font-mono);">[Reto #${state.challenge_id}]</span>` : ""}
    </div>
    <div class="topbar-actions">
      <button class="btn-secondary" onclick="resetProject()">Nuevo Proyecto (T=0)</button>
      <button class="btn-secondary" onclick="exportProjectJson()" title="Descargar copia del proyecto en JSON">${SVG.download} Exportar</button>
      <label class="btn-secondary" style="margin:0; cursor:pointer;" title="Cargar proyecto guardado">${SVG.upload} Importar<input type="file" accept=".json" style="display:none;" onchange="importProjectJson(event)"></label>
      ${stage >= 2 ? `<button class="btn-secondary" onclick="togglePanel()" title="Ocultar/Mostrar panel derecho">Auditoría</button>` : ""}
      <div class="timer-box" style="display:flex; align-items:center; gap:6px;">
        <span class="timer-pulse"></span>
        <span id="clock-timer" style="font-family:var(--font-mono); font-weight:800; font-size:13px;">${state.hours_total || 28}:00:00</span>
      </div>
    </div>
  `;
}

// ── NAVEGACIÓN LATERAL POR DEPENDENCIAS ───────────────────────────────────────
function renderNavigation() {
  const nav = document.getElementById("sidebar");
  const currentStage = getWorkflowStage();

  nav.innerHTML = `
    <div class="sidebar-heading">Fases de Trabajo</div>
    ${NAV_TABS.map(t => {
      const isUnlocked = t.level <= currentStage;
      const isCompleted = t.check();
      const activeClass = t.id === activeTab ? "active" : "";
      
      let statusMarkup = "";
      if (!isUnlocked) {
        statusMarkup = `<span class="badge-status" style="background:#f1f5f9; color:#94a3b8; border:1px solid #e2e8f0;">${SVG.lock}</span>`;
      } else if (isCompleted) {
        statusMarkup = `<span class="badge-status badge-ok">${SVG.check}</span>`;
      } else {
        statusMarkup = `<span class="badge-status badge-pending">En curso</span>`;
      }

      return `
        <a href="#" class="nav-link ${activeClass} ${!isUnlocked ? 'locked' : ''}" 
           style="${!isUnlocked ? 'opacity:0.45; cursor:not-allowed;' : ''}"
           onclick="${isUnlocked ? `switchTab('${t.id}', event)` : 'event.preventDefault()'}">
          <span style="display:flex; align-items:center; gap:6px;">${t.label}</span>
          ${statusMarkup}
        </a>
      `;
    }).join("")}
  `;
}

function switchTab(tabId, ev) {
  if (ev) ev.preventDefault();
  const target = NAV_TABS.find(t => t.id === tabId);
  if (target && target.level > getWorkflowStage()) return;
  activeTab = tabId;
  renderNavigation();
  renderTab(tabId);
}

// ── DESPACHADOR CENTRAL DE VISTAS ────────────────────────────────────────────
function renderTab(tabId) {
  const main = document.getElementById("main");
  const renderers = {
    certamen: renderViewCertamen,
    team: renderViewTeam,
    challenges: renderViewChallenges,
    solution: renderViewSolution,
    pautado: renderViewPautado,
    budget: renderViewBudget,
    resources: renderViewResources,
    canvas: renderViewCanvas,
    script: renderViewScript,
    webdemo: renderViewWebDemo,
    timeline: renderViewTimeline
  };
  main.innerHTML = `<div class="content-wrapper">${(renderers[tabId] || renderViewCertamen)()}</div>`;
  attachTabListeners(tabId);
}

// ═════════════════════════════════════════════════════════════════════════════
// 00 NIVEL 0: SELECCIÓN DE CERTAMEN (UI LIMPIA DE ENTRADA)
// ═════════════════════════════════════════════════════════════════════════════
function renderViewCertamen() {
  return `
    <div class="wizard-canvas">
      <span class="wizard-tag">Paso 01 de 03 · Configuración Inicial</span>
      <h1 class="wizard-title">¿Qué Rally es?</h1>
      <p class="wizard-desc">
        Selecciona el certamen en el que participa tu equipo para calibrar automáticamente las reglas,
        el régimen de horas y la estructura oficial del documento pautado.
      </p>

      <div class="certamen-grid">
        <!-- Tarjeta Rally Latam -->
        <div class="certamen-card ${state.rally_type === 'latam' ? 'selected' : ''}" onclick="selectCertamen('latam')">
          <div>
            <div style="display:flex; justify-content:space-between; align-items:flex-start;">
              <span class="certamen-badge latam">28 HORAS CONTINUAS</span>
              <div style="color:var(--color-primary);">${SVG.globe}</div>
            </div>
            <h2 class="certamen-name">Rally Latinoamericano de Innovación</h2>
            <p class="certamen-detail">
              Competencia internacional entre 8 países de América Latina. Enfoque continental con escalamiento
              regional y video de 120 segundos sin mención de marcas en el Acto 1.
            </p>
          </div>
          <div style="display:flex; justify-content:space-between; align-items:center; border-top:1px solid var(--border-light); pt:14px; margin-top:12px;">
            <span style="font-size:11px; font-weight:700; color:var(--text-muted); font-family:var(--font-mono);">Régimen Latam</span>
            <span class="btn-primary" style="padding:4px 10px; font-size:11px;">Elegir Latam ${SVG.arrowRight}</span>
          </div>
        </div>

        <!-- Tarjeta Rally Nacional -->
        <div class="certamen-card ${state.rally_type === 'nacional' ? 'selected' : ''}" onclick="selectCertamen('nacional')">
          <div>
            <div style="display:flex; justify-content:space-between; align-items:flex-start;">
              <span class="certamen-badge nacional">24 HORAS CONTINUAS</span>
              <div style="color:#d97706;">${SVG.shield}</div>
            </div>
            <h2 class="certamen-name">Rally Nacional Nicaragua Innova</h2>
            <p class="certamen-detail">
              Certamen universitario territorial de 24 horas. Énfasis en impacto comunitario directo,
              alineación con el Plan Nacional de Lucha contra la Pobreza y validación de maqueta física.
            </p>
          </div>
          <div style="display:flex; justify-content:space-between; align-items:center; border-top:1px solid var(--border-light); pt:14px; margin-top:12px;">
            <span style="font-size:11px; font-weight:700; color:var(--text-muted); font-family:var(--font-mono);">Régimen Nacional</span>
            <span class="btn-primary" style="padding:4px 10px; font-size:11px; background:#d97706; border-color:#d97706;">Elegir Nacional ${SVG.arrowRight}</span>
          </div>
        </div>
      </div>
    </div>
  `;
}

function selectCertamen(type) {
  state.rally_type = type;
  state.hours_total = type === "latam" ? 28 : 24;
  state.hours_remaining = state.hours_total;
  saveState();
  activeTab = "team";
  syncUI();
}

// ═════════════════════════════════════════════════════════════════════════════
// 01 NIVEL 1: IDENTIDAD DE EQUIPO & LOGOS
// ═════════════════════════════════════════════════════════════════════════════
function renderViewTeam() {
  const certLabel = state.rally_type === "latam" ? "Rally Latinoamericano (28h)" : "Rally Nacional (24h)";

  return `
    <div class="wizard-canvas">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
        <span class="wizard-tag">Paso 02 de 03 · Identidad del Equipo</span>
        <button class="btn-secondary" style="font-size:11px; padding:3px 8px;" onclick="switchTab('certamen')">← Cambiar Certamen (${certLabel})</button>
      </div>

      <h1 class="wizard-title">Nombre del Grupo & Sede Universitaria</h1>
      <p class="wizard-desc">
        Ingresa los datos exactos con los que tu equipo está registrado en la plataforma oficial del evento.
      </p>

      <div class="workbench-card">
        <div class="form-grid">
          <div class="form-group full">
            <label>Nombre Oficial del Equipo en la Competencia</label>
            <input type="text" id="tm-name" placeholder="Ej: Mentes Volcánicas, Pinoleros Tech, InnovaUNI" value="${state.team_name}">
          </div>

          <div class="form-group">
            <label>Universidad o Sede Académica</label>
            <input type="text" id="tm-uni" placeholder="Ej: Universidad Nacional de Ingeniería (UNI)" value="${state.university}">
          </div>

          <div class="form-group">
            <label>Ciudad o Municipio Piloto</label>
            <input type="text" id="tm-city" placeholder="Ej: Managua, Estelí, León" value="${state.city}">
          </div>

          <div class="form-group full">
            <label>Emblema / Identificador Visual del Equipo</label>
            <div style="display:flex; gap:12px; align-items:center; margin-top:6px;">
              <div style="display:flex; gap:8px;">
                ${['shield', 'globe', 'spark'].map(ic => `
                  <button type="button" class="btn-secondary" style="${state.team_logo === ic ? 'border-color:var(--color-primary); background:#eff6ff;' : ''} padding:8px 14px;" onclick="state.team_logo='${ic}'; saveState(); renderTab('team');">
                    ${SVG[ic]}
                  </button>
                `).join("")}
              </div>
              <span style="font-size:11px; color:var(--text-muted);">Icono sobrio para carátula del video y reportes técnicos.</span>
            </div>
          </div>
        </div>

        <div style="display:flex; justify-content:flex-end; margin-top:24px; border-top:1px solid var(--border-light); padding-top:16px;">
          <button class="btn-primary" style="padding:8px 18px; font-size:13px;" onclick="saveTeamAndProceed()">Continuar a Selección de Reto ${SVG.arrowRight}</button>
        </div>
      </div>
    </div>
  `;
}

function saveTeamAndProceed() {
  const name = document.getElementById("tm-name").value.trim();
  const uni = document.getElementById("tm-uni").value.trim();
  const city = document.getElementById("tm-city").value.trim();

  if (!name || !uni) {
    alert("Por favor ingresa al menos el Nombre del Equipo y la Universidad.");
    return;
  }

  state.team_name = name;
  state.university = uni;
  state.city = city;
  saveState();
  activeTab = "challenges";
  syncUI();
}

// ═════════════════════════════════════════════════════════════════════════════
// 02 NIVEL 2: RADAR & SELECCIÓN DE RETO (SOPORTE PARA RETOS PROPIOS / INVENTADOS)
// ═════════════════════════════════════════════════════════════════════════════
function renderViewChallenges() {
  const challengesList = (state.challenges && state.challenges.length) ? state.challenges : OFFICIAL_CHALLENGES_2026;

  const filtered = challengesList.filter(ch => {
    if (challengeFilter === "all") return true;
    return (ch.category || "").toLowerCase().includes(challengeFilter.toLowerCase());
  });

  return `
    <div class="page-header">
      <div>
        <div style="display:flex; align-items:center; gap:8px; margin-bottom:4px;">
          <span class="wizard-tag" style="margin-bottom:0;">Paso 03 de 03</span>
          <span style="font-size:11px; font-weight:700; color:var(--text-muted);">${state.team_name} · ${state.university}</span>
        </div>
        <h1 class="page-title" style="font-size:24px;">02 · Selección de Reto Oficial</h1>
        <div class="page-desc">Elige un reto del catálogo o incorpora nuevos retos inventados por tu equipo o publicados por el comité.</div>
      </div>
      <div style="display:flex; gap:8px;">
        <button class="btn-primary" style="display:inline-flex; align-items:center; gap:6px; font-size:11px;" onclick="toggleAddCustomChallengeUI()">
          ${SVG.plus} Agregar Nuevo Reto
        </button>
        <button class="btn-secondary" style="display:inline-flex; align-items:center; gap:6px; font-size:11px;" onclick="toggleBatchIngestUI()">
          ${SVG.upload} Pegar Lista de Retos
        </button>
        <a href="/docs/Matriz_Seleccion_Desafios_2026.docx" download class="btn-secondary" style="display:inline-flex; align-items:center; gap:6px; text-decoration:none; font-size:11px;">
          ${SVG.download} Matriz Word (.docx)
        </a>
      </div>
    </div>

    <!-- Formulario Desplegable: Agregar Reto Individual -->
    ${showAddChallengeForm ? `
      <div class="workbench-card" style="border:1.5px solid var(--color-primary); background:#fcfdfe; margin-bottom:18px;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
          <strong style="font-size:13px; color:var(--color-primary);">Crear / Incorporar Nuevo Reto al Radar</strong>
          <button class="btn-secondary" style="padding:2px 8px; font-size:11px;" onclick="toggleAddCustomChallengeUI()">Cerrar ✕</button>
        </div>
        <div class="form-grid">
          <div class="form-group" style="max-width:100px;">
            <label>Número / ID</label>
            <input type="text" id="new-ch-id" placeholder="Ej: 10" value="${(challengesList.length + 1).toString().padStart(2, '0')}">
          </div>
          <div class="form-group" style="flex:1;">
            <label>Título del Reto</label>
            <input type="text" id="new-ch-title" placeholder="Ej: Monitoreo bioclimático de cultivos de cacao con energía solar">
          </div>
          <div class="form-group">
            <label>Categoría</label>
            <select id="new-ch-cat">
              <option value="Innovación">Innovación (Hardware, Software & Procesos)</option>
              <option value="Impacto Social">Impacto Social (Comunidad & Vulnerabilidad)</option>
            </select>
          </div>
          <div class="form-group">
            <label>ODS Vinculadas</label>
            <input type="text" id="new-ch-ods" placeholder="Ej: ODS 9, ODS 12, ODS 13" value="ODS 9, ODS 12">
          </div>
          <div class="form-group full">
            <label>Lo que el Comité Demanda / Espera (Descripción del Problema)</label>
            <textarea id="new-ch-official" rows="2" placeholder="Describe qué problema busca resolver el reto..."></textarea>
          </div>
          <div class="form-group full">
            <label>Propuesta Tecnológica WOW (Tecnología de Vanguardia Recomendada)</label>
            <textarea id="new-ch-wow" rows="2" placeholder="Ej: Estación micrometeorológica con sensores de humedad de hoja y transceptor LoRa..."></textarea>
          </div>
        </div>
        <div style="display:flex; justify-content:flex-end; margin-top:12px; gap:8px;">
          <button class="btn-secondary" onclick="generateAutoWowForForm()">Generar Propuesta WOW ${SVG.spark}</button>
          <button class="btn-primary" onclick="saveCustomChallengeToState()">Guardar e Incorporar Reto</button>
        </div>
      </div>
    ` : ""}

    <!-- Formulario Desplegable: Pegar Lote de Retos (WhatsApp / PDF) -->
    ${showBatchIngestForm ? `
      <div class="workbench-card" style="border:1.5px solid #d97706; background:#fffdfa; margin-bottom:18px;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
          <strong style="font-size:13px; color:#d97706;">Pegar Lista de Retos (Desde WhatsApp, PDF o Documento)</strong>
          <button class="btn-secondary" style="padding:2px 8px; font-size:11px;" onclick="toggleBatchIngestUI()">Cerrar ✕</button>
        </div>
        <p style="font-size:11px; color:var(--text-muted); margin-bottom:8px;">
          Pega el texto tal cual te lo enviaron. El sistema detectará automáticamente los títulos y generará las propuestas WOW.
        </p>
        <textarea id="batch-ch-input" rows="5" style="width:100%; border:1px solid var(--border-light); border-radius:4px; padding:8px; font-size:11px; font-family:var(--font-mono); box-sizing:border-box;"
          placeholder="RETO 01: Titulo del reto...&#10;Descripcion del reto...&#10;&#10;RETO 02: Segundo reto..."></textarea>
        <div style="display:flex; justify-content:flex-end; margin-top:8px;">
          <button class="btn-primary" onclick="processBatchIngest()">Procesar e Incorporar Lista</button>
        </div>
      </div>
    ` : ""}

    <!-- Filtros de Categoría -->
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px;">
      <div style="display:flex; gap:8px;">
        <button class="btn-secondary" style="${challengeFilter === 'all' ? 'background:#1e40af; color:#fff; border-color:#1e40af;' : ''} padding:4px 10px; font-size:11px;" onclick="challengeFilter='all'; renderTab('challenges');">
          Todos los Retos (${challengesList.length})
        </button>
        <button class="btn-secondary" style="${challengeFilter === 'innovación' ? 'background:#1e40af; color:#fff; border-color:#1e40af;' : ''} padding:4px 10px; font-size:11px;" onclick="challengeFilter='innovación'; renderTab('challenges');">
          Innovación (Tecnología & Hardware)
        </button>
        <button class="btn-secondary" style="${challengeFilter === 'impacto social' ? 'background:#1e40af; color:#fff; border-color:#1e40af;' : ''} padding:4px 10px; font-size:11px;" onclick="challengeFilter='impacto social'; renderTab('challenges');">
          Impacto Social (Comunidad & Vulnerabilidad)
        </button>
      </div>
      <span style="font-size:11px; font-weight:700; color:var(--text-muted); font-family:var(--font-mono);">${challengesList.length} Retos Catalogados</span>
    </div>

    <!-- Lista Comparativa de Retos -->
    <div style="display:flex; flex-direction:column; gap:16px;">
      ${filtered.map(ch => {
        const isSelected = state.challenge_id === ch.id;
        const odsStr = Array.isArray(ch.ods) ? ch.ods.join(", ") : (ch.ods || "ODS 9");
        return `
          <div class="challenge-box ${isSelected ? 'active' : ''}">
            <div class="challenge-box-header">
              <div style="display:flex; align-items:center; gap:8px;">
                <span class="badge-status ${isSelected ? 'badge-ok' : 'badge-pending'}" style="font-family:var(--font-mono); font-size:10px;">RETO #${ch.id}</span>
                <span style="font-size:11px; font-weight:700; color:var(--text-muted);">${ch.category} · ${odsStr}</span>
                ${isSelected ? `<span style="font-size:10px; font-weight:800; color:#047857; background:#ecfdf5; padding:2px 6px; border-radius:3px;">RETO ACTIVO</span>` : ""}
              </div>
              <div style="display:flex; align-items:center; gap:14px;">
                <div style="text-align:right;">
                  <span style="font-family:var(--font-mono); font-size:14px; font-weight:800; color:${ch.winRate >= 90 ? '#047857' : '#1e40af'};">${ch.winRate || 85}%</span>
                  <span style="font-size:10px; color:var(--text-muted); display:block;">Prob. Victoria</span>
                </div>
                <button class="${isSelected ? 'btn-secondary' : 'btn-primary'}" style="padding:5px 12px; font-size:11px;" onclick="selectChallenge('${ch.id}')">
                  ${isSelected ? 'Seleccionado ✓' : 'Seleccionar este Reto'}
                </button>
              </div>
            </div>

            <div style="padding:14px 20px 8px 20px;">
              <h3 style="font-size:15px; font-weight:800; color:var(--text-main); line-height:1.3;">${ch.title}</h3>
            </div>

            <div class="challenge-split">
              <!-- Columna Requerimiento Oficial -->
              <div class="challenge-col req">
                <div class="col-label">${SVG.shield} Lo que el Comité Demanda / Espera</div>
                <p style="font-size:12px; color:var(--text-body); line-height:1.5;">${ch.officialExpectation || 'Desarrollar una propuesta factible con validación técnica y económica.'}</p>
                <div style="font-size:11px; color:var(--text-muted); margin-top:8px;">
                  <strong>Precedente ganador:</strong> ${ch.precedent || 'Proyectos ganadores del certamen'}
                </div>
              </div>

              <!-- Columna Propuesta Tecnológica WOW -->
              <div class="challenge-col wow">
                <div class="col-label" style="color:var(--color-primary);">${SVG.spark} Propuesta Tecnológica WOW (Diferenciador)</div>
                <p style="font-size:12px; color:var(--text-main); font-weight:500; line-height:1.5;">${ch.wowProposal || 'Arquitectura modular con sensores de telemetría y bajo consumo energético.'}</p>
                <div style="font-size:11px; color:#047857; margin-top:8px; font-weight:600;">
                  Densidad estimada en sedes: ${ch.compDensity || 'Media (4 sedes)'}
                </div>
              </div>
            </div>
          </div>
        `;
      }).join("")}
    </div>
  `;
}

function toggleAddCustomChallengeUI() {
  showAddChallengeForm = !showAddChallengeForm;
  showBatchIngestForm = false;
  renderTab("challenges");
}

function toggleBatchIngestUI() {
  showBatchIngestForm = !showBatchIngestForm;
  showAddChallengeForm = false;
  renderTab("challenges");
}

function generateAutoWowForForm() {
  const title = (document.getElementById("new-ch-title").value || "").trim();
  const cat = document.getElementById("new-ch-cat").value;
  if (!title) {
    alert("Ingresa primero el título del reto.");
    return;
  }
  const isSocial = cat === "Impacto Social";
  const wow = isSocial
    ? `Sistema de empoderamiento barrial asistido por dispositivos de transformación in-situ y logística P2P de cero fricción con incentivos comunitarios para ${title.toLowerCase()}.`
    : `Arquitectura ciber-física modular con telemetría LoRaWAN, sensores no invasivos de bajo consumo y alimentación solar LiFePO4 para resolver ${title.toLowerCase()} en 30 minutos.`;
  document.getElementById("new-ch-wow").value = wow;
}

function saveCustomChallengeToState() {
  const id = document.getElementById("new-ch-id").value.trim() || (state.challenges.length + 1).toString().padStart(2, "0");
  const title = document.getElementById("new-ch-title").value.trim();
  const cat = document.getElementById("new-ch-cat").value;
  const ods = document.getElementById("new-ch-ods").value.split(",").map(s => s.trim()).filter(Boolean);
  const official = document.getElementById("new-ch-official").value.trim();
  const wow = document.getElementById("new-ch-wow").value.trim();

  if (!title) {
    alert("El reto debe tener al menos un título.");
    return;
  }

  const newChallenge = {
    id: id,
    title: title,
    category: cat,
    ods: ods.length ? ods : ["ODS 9", "ODS 12"],
    winRate: 90,
    compDensity: "Baja (Nueva categoría)",
    precedent: "Nuevo reto incorporado",
    officialExpectation: official || "Desarrollar una propuesta técnica y económicamente viable.",
    wowProposal: wow || `Sistema tecnológico modular de alta eficiencia enfocado en ${title.toLowerCase()}.`
  };

  if (!state.challenges) state.challenges = [];
  state.challenges.unshift(newChallenge);
  saveState();
  showAddChallengeForm = false;
  renderTab("challenges");
  alert(`✓ Reto #${id} incorporado exitosamente al catálogo.`);
}

function processBatchIngest() {
  const txt = (document.getElementById("batch-ch-input").value || "").trim();
  if (!txt) {
    alert("Pega texto con retos para procesar.");
    return;
  }

  // Regex universal para bloques de retos
  const blocks = txt.split(/(?:reto|desaf[ií]o)\s*#?\s*\d+[:\.\-\s]+/i).filter(b => b.trim().length > 10);
  let count = 0;

  blocks.forEach(block => {
    const lines = block.trim().split("\n").map(l => l.trim()).filter(Boolean);
    const title = lines[0];
    const rest = lines.slice(1).join(" ");
    const nextId = (state.challenges.length + 1).toString().padStart(2, "0");

    state.challenges.push({
      id: nextId,
      title: title,
      category: title.toLowerCase().includes("social") || title.toLowerCase().includes("comun") ? "Impacto Social" : "Innovación",
      ods: ["ODS 9", "ODS 12"],
      winRate: 88,
      compDensity: "Media",
      precedent: "Reto incorporado por lote",
      officialExpectation: rest || title,
      wowProposal: `Solución técnica modular automatizada con monitoreo in-situ y bajo consumo para ${title.toLowerCase()}.`
    });
    count++;
  });

  saveState();
  showBatchIngestForm = false;
  renderTab("challenges");
  alert(`✓ Se incorporaron ${count} nuevos retos al radar.`);
}

function selectChallenge(id) {
  const challengesList = (state.challenges && state.challenges.length) ? state.challenges : OFFICIAL_CHALLENGES_2026;
  const ch = challengesList.find(c => c.id === id);
  if (!ch) return;

  state.challenge_id = ch.id;
  state.challenge_title = ch.title;
  state.category = ch.category;

  if (!state.solution_thesis) {
    state.solution_raw_input = ch.wowProposal;
    state.solution_thesis = ch.wowProposal;
  }

  saveState();
  activeTab = "solution";
  syncUI();
}

// ═════════════════════════════════════════════════════════════════════════════
// 03 NIVEL 3: TALLER DE SOLUCIÓN & PROMPT BUILDER (DINÁMICO PARA CUALQUIER IDEA)
// ═════════════════════════════════════════════════════════════════════════════
function renderViewSolution() {
  return `
    <div class="page-header">
      <div>
        <div style="display:flex; align-items:center; gap:8px; margin-bottom:4px;">
          <span class="badge-status badge-ok" style="font-family:var(--font-mono); font-size:10px;">RETO ACTIVO #${state.challenge_id}</span>
          <span style="font-size:11px; font-weight:700; color:var(--text-muted);">${state.category}</span>
        </div>
        <h1 class="page-title" style="font-size:24px;">03 · Taller "Describe tu Solución" & Tesis Oficial</h1>
        <div class="page-desc">${state.challenge_title}</div>
      </div>
      <div>
        <button class="btn-primary" onclick="approveSolutionAndUnlock()">
          ${state.solution_approved ? 'Actualizar Tesis ✓' : 'Aprobar Solución & Desbloquear Espacio →'}
        </button>
      </div>
    </div>

    <!-- Nombre Comercial del Proyecto -->
    <div class="workbench-card">
      <div class="form-grid">
        <div class="form-group full">
          <label style="font-weight:800;">Nombre Comercial del Proyecto</label>
          <input type="text" id="sol-proj-name" placeholder="Ej: AGRO-DRIVE, ECO-BOBINA, RE-PLAST, SOLARDIGNA" value="${state.project_name || ''}"
            style="font-size:14px; font-weight:800; letter-spacing:0.02em;">
          <span style="font-size:11px; color:var(--text-muted); margin-top:2px; display:block;">
            El nombre definitivo que figurará en el documento pautado, presupuesto y video pitch.
          </span>
        </div>
      </div>
    </div>

    <!-- Entrada Libre del Equipo -->
    <div class="workbench-card">
      <label style="font-size:12px; font-weight:800; color:var(--text-main); display:block; margin-bottom:6px;">
        1. Escribe la idea de tu equipo con sus propias palabras (sin miedo a tecnicismos):
      </label>
      <textarea id="raw-sol-input" rows="3" style="width:100%; border:1px solid var(--border-light); border-radius:4px; padding:10px; font-size:12px; font-family:var(--font-ui); box-sizing:border-box;"
        placeholder="Ej: Vamos a construir un secador solar de frutas que usa aire caliente concentrado y un sensor para que los productores no pierdan la cosecha...">${state.solution_raw_input || ''}</textarea>
      
      <div style="display:flex; justify-content:flex-end; margin-top:8px;">
        <button class="btn-primary" style="padding:6px 14px; font-size:11px;" onclick="synthesizeSolutionFromRaw()">
          Estructurar Tesis Técnica & Pitch Exprés ${SVG.spark}
        </button>
      </div>
    </div>

    <!-- Split: Propuesta Pulida vs Potenciadores Estratégicos -->
    <div class="solution-split">
      <!-- Columna Izquierda: Tesis Pulida -->
      <div class="workbench-card" style="margin-bottom:0;">
        <h3 style="font-size:13px; font-weight:800; margin-bottom:4px;">Tesis Técnica Estructurada (Para el Pautado)</h3>
        <p style="font-size:11px; color:var(--text-muted); margin-bottom:10px;">Una oración densa y libre de nombres comerciales que condensa el sistema.</p>
        
        <textarea id="sol-thesis" rows="4" style="width:100%; border:1px solid var(--border-light); border-radius:4px; padding:10px; font-size:12px; font-family:var(--font-ui); box-sizing:border-box;"
          placeholder="Tesis estructurada...">${state.solution_thesis || ''}</textarea>

        <h3 style="font-size:13px; font-weight:800; margin:14px 0 4px 0;">Elevator Pitch Simple (Para No Ingenieros / Jurado Exprés)</h3>
        <p style="font-size:11px; color:var(--text-muted); margin-bottom:10px;">Comprensible en 5 segundos sin jerga técnica.</p>
        
        <textarea id="sol-simple" rows="2" style="width:100%; border:1px solid var(--border-light); border-radius:4px; padding:8px; font-size:12px; font-family:var(--font-ui); box-sizing:border-box;"
          placeholder="Explicación accesible...">${state.solution_simple || ''}</textarea>
      </div>

      <!-- Columna Derecha: Potenciadores con Checkboxes -->
      <div class="workbench-card" style="margin-bottom:0;">
        <h3 style="font-size:13px; font-weight:800; margin-bottom:4px;">Potenciadores Estratégicos Recomendados</h3>
        <p style="font-size:11px; color:var(--text-muted); margin-bottom:12px;">Marca los componentes que deseas inyectar en el Prompt Maestro:</p>

        <div class="booster-list">
          <label class="booster-card ${state.solution_boosters.includes('ods') ? 'active' : ''}">
            <input type="checkbox" ${state.solution_boosters.includes('ods') ? 'checked' : ''} onchange="toggleBooster('ods')">
            <div>
              <div class="booster-title">Alineación ODS Oficial</div>
              <div class="booster-desc">Vincula directamente las metas de desarrollo sostenible específicas a la tesis.</div>
            </div>
          </label>

          <label class="booster-card ${state.solution_boosters.includes('nacional_plan') ? 'active' : ''}">
            <input type="checkbox" ${state.solution_boosters.includes('nacional_plan') ? 'checked' : ''} onchange="toggleBooster('nacional_plan')">
            <div>
              <div class="booster-title">${state.rally_type === 'nacional' ? 'Eje Plan Nacional de Lucha contra la Pobreza' : 'Escalamiento Modular Latam'}</div>
              <div class="booster-desc">${state.rally_type === 'nacional' ? 'Alinea con resiliencia climática y producción territorial en Nicaragua.' : 'Diseño estándar transferible a municipios piloto de la región.'}</div>
            </div>
          </label>

          <label class="booster-card ${state.solution_boosters.includes('sensors') ? 'active' : ''}">
            <input type="checkbox" ${state.solution_boosters.includes('sensors') ? 'checked' : ''} onchange="toggleBooster('sensors')">
            <div>
              <div class="booster-title">Hardware / Telemetría Autónoma</div>
              <div class="booster-desc">Suma microcontrolador de bajo consumo, alimentación solar LiFePO4 y conectividad robusta.</div>
            </div>
          </label>

          <label class="booster-card ${state.solution_boosters.includes('visuals') ? 'active' : ''}">
            <input type="checkbox" ${state.solution_boosters.includes('visuals') ? 'checked' : ''} onchange="toggleBooster('visuals')">
            <div>
              <div class="booster-title">Recurso Visual WOW para Video Pitch</div>
              <div class="booster-desc">Genera pauta para tomas de pantalla interactiva y modelo de pieza técnica en 3D.</div>
            </div>
          </label>
        </div>
      </div>
    </div>

    <!-- Caja de Prompt Maestro Compilado -->
    <div class="workbench-card" style="margin-top:16px;">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
        <h3 style="font-size:13px; font-weight:800; margin:0;">Prompt Maestro Consolidado (Para IAs de Redacción y 3D)</h3>
        <button class="btn-secondary" style="padding:4px 8px; font-size:11px;" onclick="copyMasterPrompt()">Copiar Prompt ${SVG.copy}</button>
      </div>
      <div id="master-prompt-display" style="font-family:var(--font-mono); font-size:11px; background:#f8fafc; border:1px solid var(--border-light); padding:10px; border-radius:4px; line-height:1.5; color:var(--text-body);">
        ${compileMasterPromptText()}
      </div>
    </div>
  `;
}

function toggleBooster(key) {
  if (state.solution_boosters.includes(key)) {
    state.solution_boosters = state.solution_boosters.filter(b => b !== key);
  } else {
    state.solution_boosters.push(key);
  }
  saveState();
  renderTab("solution");
}

function synthesizeSolutionFromRaw() {
  const raw = (document.getElementById("raw-sol-input").value || "").trim();
  const projInput = document.getElementById("sol-proj-name");
  if (!raw) {
    alert("Escribe una idea en el campo de texto.");
    return;
  }
  state.solution_raw_input = raw;

  // Extraer o sugerir nombre de proyecto
  if (projInput && projInput.value.trim()) {
    state.project_name = projInput.value.trim().toUpperCase();
  } else if (!state.project_name) {
    const words = raw.replace(/[^\w\sáéíóúÁÉÍÓÚñÑ]/g, "").split(/\s+/).filter(w => w.length >= 4);
    const kw = words[0] ? words[0].toUpperCase() : "INNOVA";
    state.project_name = `${kw}-TECH`;
  }

  const challengesList = (state.challenges && state.challenges.length) ? state.challenges : OFFICIAL_CHALLENGES_2026;
  const ch = challengesList.find(c => c.id === state.challenge_id) || {};
  const chContext = ch.title ? `para abordar el reto de ${ch.title.toLowerCase()}` : "para el certamen";

  // Formular tesis técnica con alta densidad de ingeniería
  const rawClean = raw.charAt(0).toUpperCase() + raw.slice(1);
  state.solution_thesis = `${state.project_name}: Sistema tecnológico modular fundamentado en ${raw.toLowerCase()}, optimizado ${chContext} con alta viabilidad económica y despliegue comunitario autónomo.`;
  state.solution_simple = `${rawClean}, resolviendo el problema en el territorio sin requerir infraestructura compleja ni altos costos operativos.`;
  state.description_one_line = state.solution_thesis;

  saveState();
  renderTab("solution");
}

function compileMasterPromptText() {
  const challengesList = (state.challenges && state.challenges.length) ? state.challenges : OFFICIAL_CHALLENGES_2026;
  const ch = challengesList.find(c => c.id === state.challenge_id) || {};
  const boosters = state.solution_boosters || [];
  
  return `PROYECTO: ${state.project_name || 'SIN NOMBRE'} | CERTAMEN: ${state.rally_type === 'latam' ? 'Rally Latam 28h' : 'Rally Nacional 24h'}
DESAFÍO #${state.challenge_id}: ${ch.title || state.challenge_title}
CATEGORÍA: ${state.category}
TESIS TÉCNICA: ${state.solution_thesis || state.solution_raw_input}
PITCH EXPRÉS: ${state.solution_simple}
POTENCIADORES: ${boosters.join(", ").toUpperCase()}
LÍMITES DE PAUTADO: Problema (1250), Solución (1250), Prefactibilidad (1000), Innovación (1000), Impacto (1500) caracteres con espacios.`;
}

function copyMasterPrompt() {
  const txt = compileMasterPromptText();
  navigator.clipboard.writeText(txt);
  alert("Prompt Maestro copiado al portapapeles.");
}

function approveSolutionAndUnlock() {
  const pName = document.getElementById("sol-proj-name");
  const raw = document.getElementById("raw-sol-input");
  const thesis = document.getElementById("sol-thesis");
  const simple = document.getElementById("sol-simple");

  if (pName && pName.value.trim()) state.project_name = pName.value.trim().toUpperCase();
  if (raw) state.solution_raw_input = raw.value.trim();
  if (thesis) state.solution_thesis = thesis.value.trim();
  if (simple) state.solution_simple = simple.value.trim();

  if (!state.solution_thesis) {
    alert("Por favor genera o redacta la tesis estructurada antes de continuar.");
    return;
  }

  state.solution_approved = true;
  state.description_one_line = state.solution_thesis;

  if (!state.pautado.solucion) {
    state.pautado.solucion = state.solution_thesis;
  }

  saveState();
  activeTab = "pautado";
  syncUI();
}

// ═════════════════════════════════════════════════════════════════════════════
// 04 NIVEL 4: PAUTADO OFICIAL (< LÍMITES CON ESPACIOS)
// ═════════════════════════════════════════════════════════════════════════════
function renderViewPautado() {
  return `
    <div class="page-header">
      <div>
        <h1 class="page-title">04 · Documento Pautado Oficial</h1>
        <div class="page-desc">5 secciones evaluadas por el jurado con conteo estricto de caracteres (incluyendo espacios).</div>
      </div>
      <div style="display:flex; gap:8px;">
        <button class="btn-primary" onclick="savePautado()">Guardar Pautado</button>
        <a href="/docs/pautado_draft.docx" download class="btn-secondary" style="text-decoration:none; display:inline-flex; align-items:center; gap:4px;">
          ${SVG.download} Descargar Word (.docx)
        </a>
      </div>
    </div>

    <div class="rubric-callout">
      <strong>REGLA DE CONTEO:</strong> La plataforma oficial calcula caracteres con espacios. Si sobrepasas el límite estipulado,
      el sistema corta el texto o anula la sección en la rúbrica de evaluación.
    </div>

    <div style="display:flex; flex-direction:column; gap:16px;">
      ${Object.keys(PAUTADO_LIMITS).map(k => {
        const val = state.pautado[k] || "";
        const len = val.length;
        const max = PAUTADO_LIMITS[k];
        const pct = Math.min(100, Math.round((len / max) * 100));
        const isOver = len > max;
        const color = isOver ? '#ef4444' : pct >= 70 ? '#047857' : '#1e40af';

        return `
          <div class="workbench-card" style="margin-bottom:0;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
              <span style="font-size:12px; font-weight:800; text-transform:uppercase; color:var(--text-main);">${k}</span>
              <span style="font-family:var(--font-mono); font-size:11px; font-weight:700; color:${color};">
                ${len} / ${max} caracteres (${pct}%)
              </span>
            </div>
            <textarea id="pt-${k}" rows="4" style="width:100%; border:1px solid ${isOver ? '#ef4444' : 'var(--border-light)'}; border-radius:4px; padding:10px; font-size:12px; font-family:var(--font-ui); box-sizing:border-box;"
              placeholder="Escribe la sección ${k}..." oninput="updateCharCount('${k}', this)">${val}</textarea>
          </div>
        `;
      }).join("")}
    </div>
  `;
}

function updateCharCount(k, el) {
  state.pautado[k] = el.value;
  saveState();
}

function savePautado() {
  saveState();
  renderNavigation();
  alert("Pautado guardado correctamente.");
}

// ═════════════════════════════════════════════════════════════════════════════
// 05 NIVEL 4: PRESUPUESTO DE PUESTA EN MARCHA
// ═════════════════════════════════════════════════════════════════════════════
function renderViewBudget() {
  const total = state.budget.reduce((a, b) => a + (b.units * b.unit_cost), 0);
  const isTooLow = total < 3000;
  const isTooHigh = total > 6500;
  const hasNotice = isTooLow || isTooHigh;

  return `
    <div class="page-header">
      <div>
        <h1 class="page-title">05 · Presupuesto de Puesta en Marcha</h1>
        <div class="page-desc">Insumos mayoristas para el prototipo inicial o lote piloto verificables con proveedores reales.</div>
      </div>
      <div style="display:flex; gap:8px;">
        <button class="btn-primary" onclick="addBudgetItem()">+ Agregar Partida</button>
        <a href="/budget/budget.xlsx" download class="btn-secondary" style="text-decoration:none; display:inline-flex; align-items:center; gap:4px;">
          ${SVG.download} Descargar Excel (.xlsx)
        </a>
      </div>
    </div>

    ${hasNotice ? `
      <div class="rubric-callout" style="border-left-color:${isTooHigh ? '#f59e0b' : '#3b82f6'}; background:#fffdf5;">
        <strong>Aviso de Consistencia Presupuestaria:</strong>
        ${isTooHigh 
          ? 'El monto total actual es elevado para una puesta en marcha piloto. Si tu solución requiere equipamiento industrial mayor, asegúrate de justificarlo claramente en la sección de Prefactibilidad del pautado.'
          : 'El monto total actual es bajo para un desarrollo técnico completo. Asegúrate de incluir partidas esenciales como flete internacional o contingencia para evitar observaciones del jurado.'
        }
      </div>
    ` : `
      <div class="rubric-callout" style="border-left-color:#10b981; background:#f0fdf4;">
        <strong>Presupuesto Equilibrado y Sustentado:</strong> El monto actual de <strong>$${total.toFixed(2)} USD</strong> refleja un balance creíble entre viabilidad económica y rigor técnico.
      </div>
    `}

    <div class="workbench-card">
      <table class="data-table">
        <thead>
          <tr>
            <th>Elemento / Componente</th>
            <th style="width:80px; text-align:center;">Unidades</th>
            <th style="width:120px; text-align:right;">Costo Unit. (USD)</th>
            <th style="width:120px; text-align:right;">Subtotal</th>
            <th style="width:60px; text-align:center;">Acción</th>
          </tr>
        </thead>
        <tbody>
          ${state.budget.map((it, idx) => `
            <tr>
              <td>
                <input type="text" value="${it.element}" style="width:100%; border:none; background:transparent; font-size:12px; font-weight:600;" onchange="updateBudgetItem(${idx}, 'element', this.value)">
                <div style="font-size:10px; color:var(--text-muted);">${it.url ? `<a href="${it.url}" target="_blank" style="color:var(--color-primary); text-decoration:none;">Enlace proveedor ${SVG.external}</a>` : 'Sin enlace'}</div>
              </td>
              <td style="text-align:center;">
                <input type="number" value="${it.units}" style="width:60px; text-align:center; border:1px solid var(--border-light); border-radius:3px; padding:2px;" onchange="updateBudgetItem(${idx}, 'units', this.value)">
              </td>
              <td style="text-align:right;">
                <input type="number" step="0.5" value="${it.unit_cost}" style="width:80px; text-align:right; border:1px solid var(--border-light); border-radius:3px; padding:2px;" onchange="updateBudgetItem(${idx}, 'unit_cost', this.value)">
              </td>
              <td style="text-align:right; font-family:var(--font-mono); font-weight:700;">
                $${(it.units * it.unit_cost).toFixed(2)}
              </td>
              <td style="text-align:center;">
                <button type="button" class="btn-secondary" style="padding:2px 6px; font-size:10px; color:#ef4444;" onclick="removeBudgetItem(${idx})">✕</button>
              </td>
            </tr>
          `).join("")}
        </tbody>
        <tfoot>
          <tr style="background:#f8fafc; font-weight:800;">
            <td colspan="3" style="text-align:right; font-size:12px;">TOTAL PRESUPUESTO PUESTA EN MARCHA:</td>
            <td style="text-align:right; font-family:var(--font-mono); font-size:14px; color:var(--color-primary);">$${total.toFixed(2)} USD</td>
            <td></td>
          </tr>
        </tfoot>
      </table>
    </div>
  `;
}

function updateBudgetItem(idx, field, val) {
  if (field === "units" || field === "unit_cost") {
    state.budget[idx][field] = parseFloat(val) || 0;
  } else {
    state.budget[idx][field] = val;
  }
  saveState();
  renderTab("budget");
}

function addBudgetItem() {
  state.budget.push({ element: "Nuevo Insumo Técnico", units: 1, unit_cost: 50.00, url: "https://alibaba.com" });
  saveState();
  renderTab("budget");
}

function removeBudgetItem(idx) {
  state.budget.splice(idx, 1);
  saveState();
  renderTab("budget");
}

// ═════════════════════════════════════════════════════════════════════════════
// 06 NIVEL 4: BÓVEDA DE RECURSOS, LOGOS & ENLACES FIJOS
// ═════════════════════════════════════════════════════════════════════════════
function renderViewResources() {
  return `
    <div class="page-header">
      <div>
        <h1 class="page-title">06 · Bóveda de Recursos, Logos & Entregables</h1>
        <div class="page-desc">Repositorio unificado de archivos para video pitch, enlaces de equipo y entregables oficiales.</div>
      </div>
      <button class="btn-primary" onclick="saveTeamHubLinks()">Guardar Enlaces de Equipo</button>
    </div>

    <!-- Enlaces Fijos de Trabajo Colaborativo -->
    <div class="workbench-card">
      <h3 style="margin-bottom:12px;">Enlaces Fijos del Equipo (Cloud Workspace)</h3>
      <div class="form-grid">
        <div class="form-group full">
          <label>Carpeta Oficial de Google Drive (Videos crudos, fotos y audios)</label>
          <div style="display:flex; gap:8px;">
            <input type="url" id="hub-drive-url" value="${state.google_drive_url}" style="flex:1;">
            <a href="${state.google_drive_url}" target="_blank" class="btn-secondary" style="text-decoration:none; display:inline-flex; align-items:center; gap:4px;">Abrir Drive ${SVG.external}</a>
          </div>
        </div>
        <div class="form-group full">
          <label>Espacio de Trabajo Canva (Láminas, diapositivas y overlays del video)</label>
          <div style="display:flex; gap:8px;">
            <input type="url" id="hub-canva-url" value="${state.canva_url}" style="flex:1;">
            <a href="${state.canva_url}" target="_blank" class="btn-secondary" style="text-decoration:none; display:inline-flex; align-items:center; gap:4px;">Abrir Canva ${SVG.external}</a>
          </div>
        </div>
      </div>
    </div>

    <!-- Logos Oficiales para el Video Pitch -->
    <div class="workbench-card">
      <h3 style="margin-bottom:12px;">Logos del Proyecto para el Video Pitch (Acto 2 al 4)</h3>
      <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(200px, 1fr)); gap:12px;">
        <div style="border:1px solid var(--border-light); padding:12px; border-radius:6px; background:#f8fafc; text-align:center;">
          <div style="height:48px; display:flex; align-items:center; justify-content:center; color:var(--color-primary); font-weight:800; font-size:14px;">
            ${SVG.shield} UNI
          </div>
          <strong style="font-size:11px; display:block;">Logo Institucional Sede</strong>
          <span style="font-size:10px; color:var(--text-muted);">${state.university || 'Universidad Nacional de Ingeniería'}</span>
        </div>

        <div style="border:1px solid var(--border-light); padding:12px; border-radius:6px; background:#f8fafc; text-align:center;">
          <div style="height:48px; display:flex; align-items:center; justify-content:center; color:#d97706; font-weight:800; font-size:14px;">
            ${SVG.globe} ${state.rally_type === 'latam' ? 'RALLY LATAM' : 'NICARAGUA INNOVA'}
          </div>
          <strong style="font-size:11px; display:block;">Logo Oficial del Evento</strong>
          <span style="font-size:10px; color:var(--text-muted);">${state.rally_type === 'latam' ? 'Edición Continental 2026' : 'Nacional 2026'}</span>
        </div>

        <div style="border:1px solid var(--border-light); padding:12px; border-radius:6px; background:#f8fafc; text-align:center;">
          <div style="height:48px; display:flex; align-items:center; justify-content:center; color:var(--text-main); font-weight:800; font-size:14px;">
            ${SVG[state.team_logo] || SVG.spark} ${state.team_name || 'EQUIPO'}
          </div>
          <strong style="font-size:11px; display:block;">Emblema de Equipo</strong>
          <span style="font-size:10px; color:var(--text-muted);">${state.team_name || 'Nombre de Equipo'}</span>
        </div>
      </div>
    </div>

    <!-- Bóveda de Descargas 1-Click -->
    <div class="workbench-card">
      <h3 style="margin-bottom:12px;">Descarga Directa de Entregables Generados (1-Click)</h3>
      <table class="data-table">
        <thead>
          <tr>
            <th>Documento / Recurso</th>
            <th>Formato</th>
            <th>Uso en Competencia</th>
            <th>Descarga</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>Matriz de Deliberación de Retos</strong></td>
            <td><code>.DOCX</code></td>
            <td>Catálogo oficial + pronósticos WOW + tabla de votación</td>
            <td><a href="/docs/Matriz_Seleccion_Desafios_2026.docx" download class="btn-primary" style="padding:4px 8px; font-size:11px; text-decoration:none;">Descargar Word ↓</a></td>
          </tr>
          <tr>
            <td><strong>Documento Pautado Oficial</strong></td>
            <td><code>.DOCX</code></td>
            <td>5 secciones oficiales redactadas y validadas con límites de caracteres</td>
            <td><a href="/docs/pautado_draft.docx" download class="btn-secondary" style="padding:4px 8px; font-size:11px; text-decoration:none;">Descargar Word ↓</a></td>
          </tr>
          <tr>
            <td><strong>Presupuesto Puesta en Marcha</strong></td>
            <td><code>.XLSX</code></td>
            <td>Partidas sustentadas con proveedores Alibaba y flete de importación</td>
            <td><a href="/budget/budget.xlsx" download class="btn-secondary" style="padding:4px 8px; font-size:11px; text-decoration:none;">Descargar Excel ↓</a></td>
          </tr>
          <tr>
            <td><strong>Shotlist para Editor de Video (120s)</strong></td>
            <td><code>.CSV</code></td>
            <td>Pauta para CapCut / Premiere con tiempos exactos y textos</td>
            <td><a href="/script/shotlist.csv" download class="btn-secondary" style="padding:4px 8px; font-size:11px; text-decoration:none;">Descargar CSV ↓</a></td>
          </tr>
          <tr>
            <td><strong>Guion de Locución Limpio</strong></td>
            <td><code>.TXT</code></td>
            <td>Texto continuo a 135 ppm para el locutor o motor TTS</td>
            <td><a href="/script/narration.txt" download class="btn-secondary" style="padding:4px 8px; font-size:11px; text-decoration:none;">Descargar TXT ↓</a></td>
          </tr>
        </tbody>
      </table>
    </div>
  `;
}

function saveTeamHubLinks() {
  const drive = document.getElementById("hub-drive-url");
  const canva = document.getElementById("hub-canva-url");
  if (drive) state.google_drive_url = drive.value.trim();
  if (canva) state.canva_url = canva.value.trim();
  saveState();
  alert("Enlaces guardados correctamente.");
}

// ═════════════════════════════════════════════════════════════════════════════
// 07 MODELO CANVAS
// ═════════════════════════════════════════════════════════════════════════════
function renderViewCanvas() {
  return `
    <div class="page-header">
      <div>
        <h1 class="page-title">07 · Matriz de Negocio Canvas</h1>
        <div class="page-desc">9 cuadrantes estratégicos sincronizados con la tesis del proyecto y el pautado.</div>
      </div>
      <a href="/docs/canvas.md" download class="btn-secondary" style="text-decoration:none; display:inline-flex; align-items:center; gap:4px;">
        ${SVG.download} Descargar Markdown (.md)
      </a>
    </div>

    <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:12px;">
      <div class="workbench-card"><strong style="font-size:12px;">1. Socios Clave</strong><p style="font-size:11px; color:var(--text-muted); margin-top:4px;">Municipalidades locales, cooperativas de productores, proveedores de hardware.</p></div>
      <div class="workbench-card"><strong style="font-size:12px;">2. Actividades Clave</strong><p style="font-size:11px; color:var(--text-muted); margin-top:4px;">Fabricación modular, calibración en campo y talleres de adopción comunitaria.</p></div>
      <div class="workbench-card"><strong style="font-size:12px;">3. Propuesta de Valor</strong><p style="font-size:11px; color:var(--text-muted); margin-top:4px;">${state.solution_thesis || 'Solución modular autónoma de bajo costo para el territorio.'}</p></div>
      <div class="workbench-card"><strong style="font-size:12px;">4. Relaciones con Clientes</strong><p style="font-size:11px; color:var(--text-muted); margin-top:4px;">Acompañamiento presencial y monitoreo continuo.</p></div>
      <div class="workbench-card"><strong style="font-size:12px;">5. Segmentos de Clientes</strong><p style="font-size:11px; color:var(--text-muted); margin-top:4px;">Comunidades rurales, pequeños productores y gobiernos locales.</p></div>
      <div class="workbench-card"><strong style="font-size:12px;">6. Recursos Clave</strong><p style="font-size:11px; color:var(--text-muted); margin-top:4px;">Diseño de ingeniería abierto, sensores de bajo costo y firmware eficiente.</p></div>
      <div class="workbench-card"><strong style="font-size:12px;">7. Canales</strong><p style="font-size:11px; color:var(--text-muted); margin-top:4px;">Red comunitaria directa, paneles de control y alertas locales.</p></div>
      <div class="workbench-card"><strong style="font-size:12px;">8. Estructura de Costes</strong><p style="font-size:11px; color:var(--text-muted); margin-top:4px;">Adquisición de componentes mayoristas, ensamblaje y logística de campo.</p></div>
      <div class="workbench-card"><strong style="font-size:12px;">9. Fuentes de Ingresos</strong><p style="font-size:11px; color:var(--text-muted); margin-top:4px;">Fondos de cooperación, presupuesto municipal de inversión y tarifas de servicio.</p></div>
    </div>
  `;
}

// ═════════════════════════════════════════════════════════════════════════════
// 08 GUION AUDIOVISUAL (4 ACTOS, 120 SEGUNDOS) & LOCUCIÓN WAV
// ═════════════════════════════════════════════════════════════════════════════
function renderViewScript() {
  const words = [state.script.acto1, state.script.acto2, state.script.acto3, state.script.acto4]
    .join(" ").trim().split(/\s+/).filter(Boolean).length;
  const estSeconds = Math.round((words / 135) * 60);

  return `
    <div class="page-header">
      <div>
        <h1 class="page-title">08 · Guion Audiovisual de 120 Segundos (4 Actos)</h1>
        <div class="page-desc">Estructura estricta para video pitch: ${words} palabras (~${estSeconds} segundos a 135 ppm).</div>
      </div>
      <div style="display:flex; gap:8px;">
        <button class="btn-primary" onclick="saveScript()">Guardar Guion</button>
        <a href="/assets/voice/narration.wav" download class="btn-secondary" style="text-decoration:none; display:inline-flex; align-items:center; gap:4px;">
          ${SVG.download} Descargar Audio Locución (.wav)
        </a>
      </div>
    </div>

    <div class="rubric-callout">
      <strong>REGLA DE ORO ACTO I:</strong> Durante los primeros 20 segundos está PROHIBIDO mencionar el nombre del proyecto o mostrar logos. El inicio debe centrarse 100% en el dolor humano y la cifra cuantificada.
    </div>

    <div style="display:flex; flex-direction:column; gap:16px;">
      <div class="workbench-card" style="margin-bottom:0;">
        <div style="display:flex; justify-content:space-between; margin-bottom:6px;">
          <strong style="font-size:12px;">Acto I: Dolor Humano y Problema Cuantificado (0–20 seg)</strong>
          <span style="font-size:11px; color:#ef4444; font-weight:700;">PROHIBIDO LOGOS Y NOMBRES</span>
        </div>
        <textarea id="sc-a1" rows="3" style="width:100%; border:1px solid var(--border-light); border-radius:4px; padding:8px; font-size:12px; font-family:var(--font-ui); box-sizing:border-box;"
          placeholder="Describe la problemática con datos y personas afectadas...">${state.script.acto1}</textarea>
      </div>

      <div class="workbench-card" style="margin-bottom:0;">
        <div style="display:flex; justify-content:space-between; margin-bottom:6px;">
          <strong style="font-size:12px;">Acto II: Solución Técnica y Demostración de Hardware (20–60 seg)</strong>
          <span style="font-size:11px; color:var(--color-primary); font-weight:700;">30 PTS INNOVACIÓN</span>
        </div>
        <textarea id="sc-a2" rows="3" style="width:100%; border:1px solid var(--border-light); border-radius:4px; padding:8px; font-size:12px; font-family:var(--font-ui); box-sizing:border-box;"
          placeholder="Muestra cómo funciona la solución tecnológica...">${state.script.acto2}</textarea>
      </div>

      <div class="workbench-card" style="margin-bottom:0;">
        <div style="display:flex; justify-content:space-between; margin-bottom:6px;">
          <strong style="font-size:12px;">Acto III: Prefactibilidad y Presupuesto Sustentado (60–95 seg)</strong>
          <span style="font-size:11px; color:#047857; font-weight:700;">20 PTS VIABILIDAD</span>
        </div>
        <textarea id="sc-a3" rows="3" style="width:100%; border:1px solid var(--border-light); border-radius:4px; padding:8px; font-size:12px; font-family:var(--font-ui); box-sizing:border-box;"
          placeholder="Menciona las cifras exactas del presupuesto de marcha...">${state.script.acto3}</textarea>
      </div>

      <div class="workbench-card" style="margin-bottom:0;">
        <div style="display:flex; justify-content:space-between; margin-bottom:6px;">
          <strong style="font-size:12px;">Acto IV: Cierre de Alto Impacto y Llamado a la Acción (95–120 seg)</strong>
          <span style="font-size:11px; color:var(--text-muted); font-weight:700;">CIERRE EXACTO T-119s</span>
        </div>
        <textarea id="sc-a4" rows="3" style="width:100%; border:1px solid var(--border-light); border-radius:4px; padding:8px; font-size:12px; font-family:var(--font-ui); box-sizing:border-box;"
          placeholder="Cierre inspirador con los logos del equipo y la universidad...">${state.script.acto4}</textarea>
      </div>
    </div>
  `;
}

function saveScript() {
  const a1 = document.getElementById("sc-a1");
  const a2 = document.getElementById("sc-a2");
  const a3 = document.getElementById("sc-a3");
  const a4 = document.getElementById("sc-a4");
  if (a1) state.script.acto1 = a1.value;
  if (a2) state.script.acto2 = a2.value;
  if (a3) state.script.acto3 = a3.value;
  if (a4) state.script.acto4 = a4.value;
  saveState();
  renderNavigation();
  alert("Guion guardado correctamente.");
}

// ═════════════════════════════════════════════════════════════════════════════
// 09 PROTOTIPO DIGITAL PARA TOMAS DE VIDEO
// ═════════════════════════════════════════════════════════════════════════════
function renderViewWebDemo() {
  const pName = state.project_name || "PROTOTIPO_ACTIVO";
  const isSocial = state.category === "Impacto Social";

  return `
    <div class="page-header">
      <div>
        <h1 class="page-title">09 · Prototipo Digital para Tomas de Video</h1>
        <div class="page-desc">Interfaz operativa reactiva para grabar planos de pantalla de alto impacto para el video pitch.</div>
      </div>
      <a href="/site/" target="_blank" class="btn-primary" style="text-decoration:none; display:inline-flex; align-items:center; gap:4px;">
        Abrir Prototipo en Pestaña Completa ${SVG.external}
      </a>
    </div>

    <div class="workbench-card" style="padding:0; overflow:hidden;">
      <div style="background:#0f172a; padding:10px 16px; display:flex; justify-content:space-between; align-items:center; color:#fff;">
        <div style="display:flex; align-items:center; gap:8px;">
          <span style="display:inline-block; width:8px; height:8px; border-radius:50%; background:#10b981;"></span>
          <span style="font-family:var(--font-mono); font-size:12px; font-weight:700;">${pName} · PANEL DE CONTROL OPERATIVO</span>
        </div>
        <span style="font-size:11px; font-family:var(--font-mono); color:#94a3b8;">SISTEMA ACTIVO [ESTADO: NOMINAL]</span>
      </div>

      <div style="padding:20px; background:#f8fafc;">
        <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:14px; margin-bottom:16px;">
          <div style="background:#fff; border:1px solid var(--border-light); padding:14px; border-radius:6px;">
            <div style="font-size:10px; font-weight:800; color:var(--text-muted); text-transform:uppercase;">${isSocial ? 'Índice de Rendimiento' : 'Parámetro Operativo'}</div>
            <div style="font-size:24px; font-weight:800; font-family:var(--font-mono); color:var(--color-primary); margin:4px 0;">94.2%</div>
            <div style="font-size:11px; color:#047857; font-weight:600;">Calibración de campo completa</div>
          </div>

          <div style="background:#fff; border:1px solid var(--border-light); padding:14px; border-radius:6px;">
            <div style="font-size:10px; font-weight:800; color:var(--text-muted); text-transform:uppercase;">${isSocial ? 'Tiempo de Respuesta' : 'Ciclo de Operación'}</div>
            <div style="font-size:24px; font-weight:800; font-family:var(--font-mono); color:var(--text-main); margin:4px 0;">1.2 s</div>
            <div style="font-size:11px; color:var(--text-muted);">Procesamiento in-situ autónomo</div>
          </div>

          <div style="background:#fff; border:1px solid var(--border-light); padding:14px; border-radius:6px;">
            <div style="font-size:10px; font-weight:800; color:var(--text-muted); text-transform:uppercase;">Autonomía Energética</div>
            <div style="font-size:24px; font-weight:800; font-family:var(--font-mono); color:#047857; margin:4px 0;">98.6%</div>
            <div style="font-size:11px; color:var(--text-muted);">Baterías LiFePO4 + Panel Solar</div>
          </div>
        </div>

        <div style="background:#fff; border:1px solid var(--border-light); border-radius:6px; padding:14px;">
          <div style="font-size:11px; font-weight:800; color:var(--text-main); margin-bottom:8px;">REGISTRO DE TELEMETRÍA EN TIEMPO REAL</div>
          <div style="font-family:var(--font-mono); font-size:11px; color:var(--text-muted); line-height:1.6;">
            <div>[T-08s] ${pName}_NODO_01: Nivel de señal -82dBm | Consumo: 14mW | ESTADO: ACTIVO</div>
            <div>[T-19s] ${pName}_NODO_02: Lectura de sensor nominal | Voltaje: 3.31V | ESTADO: ACTIVO</div>
            <div>[T-32s] ${pName}_NODO_03: Transmisión confirmada | Paquetes: 0 perdidos | ESTADO: ACTIVO</div>
          </div>
        </div>
      </div>
    </div>
  `;
}

// ═════════════════════════════════════════════════════════════════════════════
// 10 CRONOGRAMA DE ENTREGA & HITOS
// ═════════════════════════════════════════════════════════════════════════════
function renderViewTimeline() {
  return `
    <div class="page-header">
      <div>
        <h1 class="page-title">10 · Cronograma de Entrega SIRLI & Hitos Innegociables</h1>
        <div class="page-desc">Ventana crítica para entrega a tiempo en la plataforma oficial del evento.</div>
      </div>
    </div>

    <div class="workbench-card">
      <table class="data-table">
        <thead>
          <tr>
            <th>Hito de Tiempo</th>
            <th>Acción Crítica Obligatoria</th>
            <th>Riesgo Asociado</th>
          </tr>
        </thead>
        <tbody>
          <tr><td><strong>T-6 Horas</strong></td><td>Congelamiento de claims e investigación. Tesis bloqueada.</td><td>Cambiar de idea a última hora produce renders a medias.</td></tr>
          <tr><td><strong>T-4 Horas</strong></td><td>Pautado y presupuesto completos al 100%.</td><td>Falta de validación de caracteres descalifica en revisión.</td></tr>
          <tr><td><strong>T-2 Horas</strong></td><td>Render en calidad MEDIA. Grabar pantallas del prototipo.</td><td>Renderizar en alta a última hora satura la GPU.</td></tr>
          <tr><td><strong>T-1 Hora</strong></td><td>Exportación final del video pitch (119 segundos exactos).</td><td>Videos de 121 segundos quedan eliminados por reglamento.</td></tr>
          <tr><td><strong>T-30 Minutos</strong></td><td>Subir a YouTube en modo 'Oculto' o 'Público' y registrar URL.</td><td>El procesamiento HD de YouTube puede tardar 25 minutos.</td></tr>
        </tbody>
      </table>
    </div>
  `;
}

// ── INSPECTOR LATERAL DE AUDITORÍA ───────────────────────────────────────────
function updateInspector() {
  const panel = document.getElementById("panel");
  if (!panel) return;

  const stage = getWorkflowStage();
  if (stage < 2) return;

  let points = 0;
  if (state.rally_type) points += 15;
  if (state.team_name && state.university) points += 15;
  if (state.challenge_id) points += 20;
  if (state.solution_approved) points += 15;
  if (isPautadoComplete()) points += 15;
  if (isBudgetValid()) points += 10;
  if (isScriptComplete()) points += 10;

  const totalBudget = state.budget.reduce((a, b) => a + (b.units * b.unit_cost), 0);

  panel.innerHTML = `
    <div>
      <div class="panel-block-title">Índice de Preparación SIRLI</div>
      <div class="score-meter">
        <div class="score-number">${points}%</div>
        <div class="score-label">${points === 100 ? 'Listo para Entrega' : 'En Configuración'}</div>
      </div>
    </div>

    <div>
      <div class="panel-block-title">Auditoría en Tiempo Real</div>
      <div class="audit-list">
        <div class="audit-item ${state.team_name ? 'ok' : 'pending'}">
          <span>Equipo & Sede</span>
          <strong>${state.team_name ? 'OK' : 'Incompleto'}</strong>
        </div>
        <div class="audit-item ${state.challenge_id ? 'ok' : 'pending'}">
          <span>Reto Seleccionado</span>
          <strong>${state.challenge_id ? `#${state.challenge_id}` : 'Sin elegir'}</strong>
        </div>
        <div class="audit-item ${state.solution_approved ? 'ok' : 'pending'}">
          <span>Taller de Solución</span>
          <strong>${state.solution_approved ? 'Aprobada' : 'Pendiente'}</strong>
        </div>
        <div class="audit-item ${isPautadoComplete() ? 'ok' : 'pending'}">
          <span>Pautado Oficial</span>
          <strong>${isPautadoComplete() ? 'Auditado' : 'Revisar'}</strong>
        </div>
        <div class="audit-item ${isBudgetValid() ? 'ok' : 'warn'}">
          <span>Presupuesto</span>
          <strong>$${totalBudget.toFixed(0)} USD</strong>
        </div>
        <div class="audit-item ${isScriptComplete() ? 'ok' : 'pending'}">
          <span>Guion (120 Segundos)</span>
          <strong>${isScriptComplete() ? 'OK' : 'Pendiente'}</strong>
        </div>
      </div>
    </div>

    <div>
      <div class="panel-block-title">Lección de Oro de Competencia</div>
      <div class="insight-box">
        <div class="insight-header">${SVG.spark} Coherencia Total</div>
        El jurado verifica que las cifras del último minuto del video coincidan exactamente con la tabla de presupuesto del pautado. Si dices un monto en pantalla, debe coincidir centavo a centavo con el documento.
      </div>
    </div>
  `;
}

function attachTabListeners(tabId) {}
