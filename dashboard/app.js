// dashboard/app.js -- Rally Studio Workbench Interactivo (Simulador de Competencia)
// Sin dependencias externas. Gestión de estado reactivo en memoria y persistencia local.

// ── CATÁLOGO OFICIAL DE DESAFÍOS (RALLY LATAM 2026) ──────────────────────────
const OFFICIAL_CHALLENGES_2026 = [
  {
    id: "01",
    title: "Segunda vida y reconversión de motores eléctricos de electrodomésticos en desuso",
    category: "Impacto Social",
    ods: ["ODS 12", "ODS 8", "ODS 9"],
    winRate: 92,
    compDensity: "Baja (3 sedes)",
    precedent: "Avocado 2026 (1° Nac. Social) / Revolt (El Salvador)",
    keyFactor: "Aprovechamiento directo de bobinados de cobre y rotores para maquinaria agropecuaria comunitaria."
  },
  {
    id: "02",
    title: "Redes de sensores comunitarios para prevención y alerta temprana de inundaciones",
    category: "Innovación",
    ods: ["ODS 11", "ODS 13", "ODS 3"],
    winRate: 84,
    compDensity: "Alta (9 sedes)",
    precedent: "Techriders 2024 (1° Int. Latam) / Steel Innovators 2026",
    keyFactor: "Hibridación ciber-física obligatoria: compuertas automatizadas o telemetría LoRaWAN con bajo consumo."
  },
  {
    id: "03",
    title: "Protección y fomento tecnológico de polinizadores en entornos agropecuarios y urbanos",
    category: "Innovación",
    ods: ["ODS 15", "ODS 2", "ODS 13"],
    winRate: 95,
    compDensity: "Muy Baja (2 sedes)",
    precedent: "Ignis Code 2026 (1° Nac. Innovación)",
    keyFactor: "Factor sorpresa máximo: sensores térmicos/acústicos no invasivos para colmenas meliponas."
  },
  {
    id: "04",
    title: "Revalorización y transformación de residuos de poda y biomasa vegetal urbana",
    category: "Innovación",
    ods: ["ODS 12", "ODS 11", "ODS 13"],
    winRate: 88,
    compDensity: "Media (4 sedes)",
    precedent: "Kubo I+D (Argentina 2026) / Bioinnovatech (Costa Rica)",
    keyFactor: "Gasificación o biochar pirólisis de bajo costo para fertilidad comunitaria."
  },
  {
    id: "05",
    title: "Reservorios pluviales y captación comunitaria de agua con microfiltración",
    category: "Innovación",
    ods: ["ODS 6", "ODS 11", "ODS 12"],
    winRate: 86,
    compDensity: "Alta (8 sedes)",
    precedent: "Francisquitos (El Salvador 2026) / Sistema Captación UNI (2024)",
    keyFactor: "Filtración por gravedad con carbón activo local y monitoreo continuo de turbidez."
  },
  {
    id: "06",
    title: "Gestión y valorización de residuos plásticos en playas y ecosistemas costeros",
    category: "Impacto Social",
    ods: ["ODS 14", "ODS 12", "ODS 11"],
    winRate: 78,
    compDensity: "Media (5 sedes)",
    precedent: "Recoplaya / Smat Warriors (URACCAN 2025)",
    keyFactor: "Transformación mecánica in-situ de redes fantasma en adoquines peatonales."
  },
  {
    id: "07",
    title: "Recolección y conversión de aceite vegetal doméstico usado en biocombustibles o jabón",
    category: "Impacto Social",
    ods: ["ODS 12", "ODS 6", "ODS 7"],
    winRate: 82,
    compDensity: "Baja (3 sedes)",
    precedent: "Foodtech (FIUNI Paraguay 2026)",
    keyFactor: "Logística inversa barrial con incentivos comunitarios y reactor artesanal seguro."
  },
  {
    id: "08",
    title: "Reducción de desperdicio de alimentos y logística de redistribución en mercados",
    category: "Impacto Social",
    ods: ["ODS 2", "ODS 12", "ODS 1"],
    winRate: 85,
    compDensity: "Alta (7 sedes)",
    precedent: "Mexitech (UPEMOR 1° Int. 2024) / Catalizadores (Chile)",
    keyFactor: "Modelo B2B ágil entre puestos de abasto y comedores sin fricción logística."
  },
  {
    id: "09",
    title: "Sistemas modulares de refugio y energía de emergencia post-desastre climático",
    category: "Innovación",
    ods: ["ODS 11", "ODS 13", "ODS 7"],
    winRate: 89,
    compDensity: "Baja (3 sedes)",
    precedent: "Hooke (Chile 2026) / The Bubbles (Paraguay)",
    keyFactor: "Ensamblaje en seco en menos de 45 minutos con materiales de empaque reutilizados."
  }
];

// ── PRESETS DE PALETAS GANADORAS REALES ──────────────────────────────────────
const PALETTE_PRESETS = {
  digna: {
    name: "DIGNA 2023 (Azul Solar & Bambú)",
    primary: "#0f4c81",
    secondary: "#d4a373",
    accent: "#2a9d8f",
    source: "Ganador Internacional Latam 2023"
  },
  techriders: {
    name: "Techriders 2024 (Azul Hidráulico & Grafito)",
    primary: "#1e40af",
    secondary: "#3b82f6",
    accent: "#0ea5e9",
    source: "Ganador Internacional Latam 2024"
  },
  mentes: {
    name: "Mentes Volcánicas 2025 (Basalto & Verde)",
    primary: "#1f2937",
    secondary: "#10b981",
    accent: "#f59e0b",
    source: "Ganador Internacional Latam 2025"
  },
  ignis: {
    name: "Ignis Code 2026 (Ámbar & Carbón)",
    primary: "#18181b",
    secondary: "#d97706",
    accent: "#f59e0b",
    source: "1° Lugar Nacional Innovación 2026"
  }
};

// ── ESTADO INICIAL VACÍO (SIMULACIÓN T=0) ───────────────────────────────────
function getInitialState() {
  return {
    rally_type: "latam",
    hours_total: 28,
    hours_remaining: 28,
    project_name: "",
    team_name: "",
    university: "",
    city: "",
    category: "Innovación",
    challenge_id: "",
    challenge_title: "",
    description_one_line: "",
    
    // Paleta
    palette: {
      primary: "#1e40af",
      secondary: "#3b82f6",
      accent: "#0ea5e9"
    },

    // Claims de Investigación
    claims: [],

    // Pautado (5 Secciones con texto real del usuario)
    pautado: {
      problema: "",
      solucion: "",
      prefactibilidad: "",
      innovacion: "",
      impacto: ""
    },

    // Presupuesto (partidas dinámicas)
    budget: [
      { element: "Unidad Central MCU + Transceptor LoRa", units: 10, unit_cost: 14.50, url: "https://alibaba.com/sample-mcu" },
      { element: "Sensores de Nivel / Entorno IP68", units: 10, unit_cost: 45.00, url: "https://alibaba.com/sample-sensor" },
      { element: "Sistema Solar Autónomo + Baterías", units: 8, unit_cost: 120.00, url: "https://alibaba.com/sample-solar" },
      { element: "Carcasas Estancas con Disipación", units: 10, unit_cost: 32.00, url: "https://alibaba.com/sample-enclosure" },
      { element: "Gateway Concentrador Exterior", units: 2, unit_cost: 295.00, url: "https://alibaba.com/sample-gateway" },
      { element: "Flete Internacional y Aranceles de Importación", units: 1, unit_cost: 650.00, url: "https://dhl.com" }
    ],

    // Guion (4 micro-actos)
    script: {
      acto1: "",
      acto2: "",
      acto3: "",
      acto4: ""
    }
  };
}

let state = getInitialState();
let activeTab = "brief";
let timerInterval = null;

// ── LÍMITES OFICIALES DE PAUTADO (CON ESPACIOS) ──────────────────────────────
const PAUTADO_LIMITS = {
  problema: 1250,
  solucion: 1250,
  prefactibilidad: 1000,
  innovacion: 1000,
  impacto: 1500
};

// ── INICIALIZACIÓN ───────────────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  loadSavedState();
  initClock();
  renderNavigation();
  renderTab(activeTab);
  updateInspector();
});

function loadSavedState() {
  try {
    const saved = localStorage.getItem("rally_studio_sim_state");
    if (saved) {
      state = Object.assign(getInitialState(), JSON.parse(saved));
    }
  } catch (e) {
    console.warn("No se pudo cargar localStorage:", e);
  }
}

function saveState() {
  try {
    localStorage.setItem("rally_studio_sim_state", JSON.stringify(state));
  } catch (e) {}
  updateInspector();
  renderTopbar();
}

function resetSimulation() {
  if (confirm("¿Reiniciar la simulación desde T=0? Se limpiarán los datos cargados.")) {
    state = getInitialState();
    saveState();
    renderNavigation();
    renderTab(activeTab);
    updateInspector();
  }
}

function loadBenchmarkProject() {
  // Carga el caso verificado de Techriders / Hidro-Vigía
  state.project_name = "HIDRO-VIGÍA";
  state.team_name = "Mentes Pinoleras";
  state.university = "Universidad Nacional de Ingeniería (UNI)";
  state.city = "Managua (Laboratorio Piloto)";
  state.category = "Innovación";
  state.challenge_id = "02";
  state.challenge_title = "Redes de sensores comunitarios para prevención y alerta temprana de inundaciones";
  state.description_one_line = "Sistema modular de telemetría hiperlocal con nodos ultrasónicos autónomos y compuertas inteligentes con 30 minutos de anticipación.";

  state.claims = [
    { stat: "120,000 personas en zonas críticas urbanas sufren anegaciones anuales en Centroamérica.", source: "SINAPRED / CEPAL", year: "2024", url: "https://sinapred.gob.ni" },
    { stat: "El 42% de pérdidas materiales ocurren en los primeros 30 minutos sin monitoreo de cauces.", source: "CEPAL", year: "2024", url: "https://cepal.org" },
    { stat: "Las redes LoRaWAN reducen en 78% el costo de telemetría frente a enlaces celulares dedicados.", source: "IEEE Sensors", year: "2023", url: "https://ieeexplore.ieee.org" }
  ];

  state.pautado.problema = "En las cuencas urbanas de América Latina, las crecidas repentinas y desbordamientos de cauces provocan anegaciones críticas que afectan a más de 120,000 personas anualmente. La ausencia de telemetría oportuna y el alto costo de las estaciones meteorológicas hidrológicas tradicionales (que superan los $30,000 USD por punto) impiden a las autoridades y brigadas vecinales actuar antes de que el agua ingrese a los hogares. Durante eventos hidroclimáticos extremos, el 42% de las pérdidas materiales se consuman en los primeros 30 minutos de la crecida por falta de un sistema de alerta descentralizado y de bajo consumo.";
  state.solucion = "Presentamos una arquitectura ciber-física distribuida basada en nodos sensores ultrasónicos autónomos colocados en puntos críticos de la red de drenaje. Cada nodo mide el nivel hidrométrico en tiempo real cada 60 segundos, transmitiendo datos agregados mediante protocolo LoRaWAN hacia gateways solares conectados a centros de mando y alarmas sonoras comunitarias. La solución opera con total independencia de la red eléctrica gracias a módulos fotovoltaicos de 50W y acumuladores LiFePO4 con autonomía de 15 días continuos de lluvia.";
  state.pautado.solucion = state.solucion;
  state.pautado.prefactibilidad = "El despliegue de un circuito piloto integral de 15 nodos sensores y 2 estaciones concentradoras demanda un costo de $4,450.00 USD, desglosado estrictamente con precios mayoristas de Shenzhen y suministros locales de fijación galvanizada. El esquema de sostenibilidad descansa en contratos de servicio B2G con alcaldías municipales para mantenimiento predictivo semestral, garantizando una vida útil de 7 años sin subsidio permanente y con un costo operativo marginal de $20 USD mensuales por nodo.";
  state.pautado.innovacion = "A diferencia de las estaciones convencionales costosas o de aplicaciones móviles que dependen de reportes manuales tardíos, nuestra propuesta introduce una compuerta electromecánica de alivio accionada automáticamente al superar el umbral crítico de 2.0 metros. El diseño mecánico IP67 incorpora disipación térmica pasiva sin partes móviles, membranas de compensación de presión Gore-Tex y ensamblaje modular con pernos estandarizados M6 que permite mantenimiento in-situ sin herramientas especializadas.";
  state.pautado.impacto = "Impacto directo medible: protección de 12,450 habitantes en la cuenca piloto de Managua con una ventana de evacuación anticipada de 30 minutos. Contribución explícita a los Objetivos de Desarrollo Sostenible: ODS 11 (Ciudades y Comunidades Resilientes), ODS 13 (Acción por el Clima) y ODS 3 (Salud y Bienestar). El modelo ha sido diseñado como un laboratorio de validación transferible a cualquier cuenca urbana de América Latina con idéntica topología hidráulica.";

  state.script.acto1 = "En América Latina, más de 120,000 personas enfrentan anualmente el impacto devastador de crecidas repentinas. El 42% de las pérdidas materiales se consuman en los primeros 30 minutos por falta de alerta temprana oportuna.";
  state.script.acto2 = "Para transformar esta realidad creamos HIDRO-VIGÍA. Red de nodos ultrasónicos autónomos anclados a la infraestructura pública que censan el nivel cada 60 segundos y transmiten vía LoRaWAN a las brigadas de protección civil.";
  state.script.acto3 = "Puesta en marcha validada: $4,450 USD para 15 nodos y dos estaciones base. Carcasas IP67 de policarbonato con disipación pasiva y autonomía solar de 15 días continuos sin red eléctrica.";
  state.script.acto4 = "12,450 habitantes protegidos con 30 minutos de anticipación. Validado en Managua como laboratorio piloto, escalable a toda la región. Aportando a ODS 11 y 13. HIDRO-VIGÍA: tecnología que salva vidas.";

  saveState();
  renderNavigation();
  renderTab(activeTab);
  updateInspector();
}

// ── RELOJ DE COMPETENCIA ─────────────────────────────────────────────────────
function initClock() {
  let totalSec = state.hours_remaining * 3600;
  if (timerInterval) clearInterval(timerInterval);

  timerInterval = setInterval(() => {
    totalSec = Math.max(0, totalSec - 1);
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;
    const str = `${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`;
    const el = document.getElementById("clock-timer");
    if (el) el.textContent = str;
  }, 1000);
}

// ── TOPBAR ───────────────────────────────────────────────────────────────────
function renderTopbar() {
  const el = document.getElementById("topbar");
  const pName = state.project_name ? state.project_name : "SIN PROYECTO (T=0)";
  const certamen = state.rally_type === "latam" ? "Rally Latam 28h" : "Rally Nacional 24h";

  el.innerHTML = `
    <div class="topbar-left">
      <span class="brand-badge">RALLY STUDIO</span>
      <span class="project-title">${pName}</span>
      <span class="mode-tag">${certamen}</span>
    </div>
    <div class="topbar-actions">
      <button class="btn-secondary" onclick="resetSimulation()">↺ T=0 (Reiniciar)</button>
      <button class="btn-secondary" onclick="loadBenchmarkProject()">⚡ Cargar Benchmark</button>
      <div class="timer-box">
        <span class="timer-pulse"></span>
        <span id="clock-timer">28:00:00</span>
      </div>
    </div>
  `;
}

// ── NAVEGACIÓN LATERAL ────────────────────────────────────────────────────────
const NAV_TABS = [
  { id: "brief",        label: "01 Brief & Setup",       check: () => !!state.project_name && !!state.challenge_id },
  { id: "challenges",   label: "02 Radar Desafíos",      check: () => !!state.challenge_id },
  { id: "identity",     label: "03 Identidad & Paleta",  check: () => !!state.palette.primary },
  { id: "research",     label: "04 Investigación/Claims",check: () => state.claims.length >= 3 },
  { id: "pautado",      label: "05 Pautado Interactivo", check: () => isPautadoComplete() },
  { id: "budget",       label: "06 Presupuesto $4k-$6k", check: () => isBudgetOptimal() },
  { id: "canvas",       label: "07 Modelo Canvas",       check: () => isPautadoComplete() },
  { id: "script",       label: "08 Guion 120s (4 Actos)",check: () => isScriptComplete() },
  { id: "webdemo",      label: "09 Web Demo para Video", check: () => true },
  { id: "timeline",     label: "10 Cronómetro & Hitos",  check: () => true }
];

function isPautadoComplete() {
  return Object.keys(PAUTADO_LIMITS).every(k => {
    const len = (state.pautado[k] || "").length;
    return len >= 300 && len <= PAUTADO_LIMITS[k];
  });
}

function isBudgetOptimal() {
  const total = state.budget.reduce((acc, it) => acc + (it.units * it.unit_cost), 0);
  return total >= 4000 && total <= 6000;
}

function isScriptComplete() {
  const totalWords = [state.script.acto1, state.script.acto2, state.script.acto3, state.script.acto4]
    .join(" ").trim().split(/\s+/).filter(Boolean).length;
  return totalWords >= 120 && totalWords <= 280;
}

function renderNavigation() {
  const nav = document.getElementById("sidebar");
  nav.innerHTML = `
    <div class="sidebar-heading">Fases de Trabajo</div>
    ${NAV_TABS.map(t => {
      const isOk = t.check();
      const statusClass = isOk ? "badge-ok" : "badge-pending";
      const statusText = isOk ? "Listo" : "Pendiente";
      const activeClass = t.id === activeTab ? "active" : "";
      return `
        <a href="#" class="nav-link ${activeClass}" onclick="switchTab('${t.id}', event)">
          <span>${t.label}</span>
          <span class="badge-status ${statusClass}">${statusText}</span>
        </a>
      `;
    }).join("")}
  `;
}

function switchTab(tabId, ev) {
  if (ev) ev.preventDefault();
  activeTab = tabId;
  renderNavigation();
  renderTab(tabId);
}

// ── VISTAS DEL WORKSPACE CENTRAL ─────────────────────────────────────────────
function renderTab(tabId) {
  const main = document.getElementById("main");
  const renderers = {
    brief: renderViewBrief,
    challenges: renderViewChallenges,
    identity: renderViewIdentity,
    research: renderViewResearch,
    pautado: renderViewPautado,
    budget: renderViewBudget,
    canvas: renderViewCanvas,
    script: renderViewScript,
    webdemo: renderViewWebDemo,
    timeline: renderViewTimeline
  };
  main.innerHTML = `<div class="content-wrapper">${(renderers[tabId] || renderViewBrief)()}</div>`;
  attachTabListeners(tabId);
}

// 01 BRIEF VIEW
function renderViewBrief() {
  return `
    <div class="page-header">
      <div>
        <h1 class="page-title">01 · Brief & Diagnóstico de Entrada</h1>
        <div class="page-desc">Define la identidad y restricción inicial del proyecto. Nada arranca sin este marco.</div>
      </div>
      <button class="btn-primary" onclick="saveBriefForm()">Guardar Brief</button>
    </div>

    <div class="rubric-callout">
      <strong>RÉGIMEN RALLY LATAM:</strong> El municipio no es la solución final, sino el <em>laboratorio piloto</em>. 
      La solución debe formularse con diseño modular y estandarización para transferirse a cualquier país de la región.
    </div>

    <div class="workbench-card">
      <h3>Datos de Registro en SIRLI</h3>
      <div class="form-grid">
        <div class="form-group">
          <label>Certamen / Duración</label>
          <select id="bf-rally-type" onchange="state.rally_type=this.value; saveState();">
            <option value="latam" ${state.rally_type==='latam'?'selected':''}>Rally Latinoamericano de Innovación (28 Horas)</option>
            <option value="nacional" ${state.rally_type==='nacional'?'selected':''}>Rally Nacional Nicaragua Innova (24 Horas)</option>
          </select>
        </div>
        <div class="form-group">
          <label>Categoría Oficial</label>
          <select id="bf-category">
            <option value="Innovación" ${state.category==='Innovación'?'selected':''}>Área Innovación (Tecnología, procesos y artefactos)</option>
            <option value="Impacto Social" ${state.category==='Impacto Social'?'selected':''}>Área Impacto Social (Comunidad, vulnerabilidad, inclusión)</option>
          </select>
        </div>
        <div class="form-group">
          <label>Nombre Comercial del Proyecto</label>
          <input type="text" id="bf-project-name" placeholder="Ej: HIDRO-VIGÍA, DIGNA, TECHRIDERS" value="${state.project_name}">
        </div>
        <div class="form-group">
          <label>Nombre del Equipo</label>
          <input type="text" id="bf-team-name" placeholder="Ej: Mentes Volcánicas, Güegüense Pinolero" value="${state.team_name}">
        </div>
        <div class="form-group">
          <label>Universidad / Sede Universitaria</label>
          <input type="text" id="bf-university" placeholder="Ej: Universidad Nacional de Ingeniería (UNI)" value="${state.university}">
        </div>
        <div class="form-group">
          <label>Ciudad / Municipio Piloto</label>
          <input type="text" id="bf-city" placeholder="Ej: Managua (Cuenca Cauce Oriental)" value="${state.city}">
        </div>
        <div class="form-group full">
          <label>Tesis de la Solución (UNA SOLA ORACIÓN SIN TECNICISMOS)</label>
          <input type="text" id="bf-description" placeholder="Ej: Sistema ciber-físico de telemetría hiperlocal que alerta crecidas con 30 minutos de anticipación." value="${state.description_one_line}">
        </div>
      </div>
    </div>

    <div class="workbench-card">
      <h3>Desafío Activo Vinculado</h3>
      <p style="font-size:12px;color:var(--text-muted);margin-bottom:10px;">
        ${state.challenge_id ? `<strong>Desafío #${state.challenge_id}:</strong> ${state.challenge_title}` : `<em>No se ha seleccionado desafío aún. Ve a la pestaña 02 Radar de Desafíos para elegirlo.</em>`}
      </p>
      <button class="btn-secondary" onclick="switchTab('challenges')">Ir al Radar de Desafíos 2026 →</button>
    </div>
  `;
}

function saveBriefForm() {
  state.project_name = document.getElementById("bf-project-name").value.trim();
  state.team_name = document.getElementById("bf-team-name").value.trim();
  state.university = document.getElementById("bf-university").value.trim();
  state.city = document.getElementById("bf-city").value.trim();
  state.category = document.getElementById("bf-category").value;
  state.description_one_line = document.getElementById("bf-description").value.trim();

  saveState();
  renderNavigation();
  alert("✓ Brief guardado. Estado actualizado en el inspector.");
}

// 02 RADAR DESAFÍOS VIEW
function renderViewChallenges() {
  return `
    <div class="page-header">
      <div>
        <h1 class="page-title">02 · Radar de Desafíos Oficiales (Rally Latam 2026)</h1>
        <div class="page-desc">Matriz histórica calculada sobre 13 ediciones previas (2014–2026).</div>
      </div>
    </div>

    <div class="rubric-callout">
      <strong>REGLA DE COMPETENCIA:</strong> Desafíos masivos como 'agua' o 'huertos' tienen alta concurrencia (8+ países). 
      Para ganar ahí se exige hibridación técnica (IoT + físico). Desafíos de nicho como 'polinizadores' o 'motores' ganan por baja saturación y sorpresa.
    </div>

    <div style="display:flex;flex-direction:column;gap:12px;">
      ${OFFICIAL_CHALLENGES_2026.map(ch => {
        const isSelected = state.challenge_id === ch.id;
        const borderStyle = isSelected ? "border-color:var(--color-primary);background:#eff6ff;" : "";
        return `
          <div class="workbench-card" style="margin-bottom:0;${borderStyle}">
            <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:8px;">
              <div>
                <span class="badge-status ${isSelected ? 'badge-ok' : 'badge-pending'}" style="margin-right:6px;">DESAFÍO #${ch.id}</span>
                <span style="font-size:11px;font-weight:700;color:var(--text-muted);">${ch.category} · ${ch.ods.join(", ")}</span>
                <h4 style="font-size:14px;font-weight:800;color:var(--text-main);margin-top:4px;">${ch.title}</h4>
              </div>
              <div style="text-align:right;">
                <div style="font-family:var(--font-mono);font-size:16px;font-weight:800;color:${ch.winRate>=90?'#047857':'#1e40af'}">${ch.winRate}%</div>
                <div style="font-size:10px;text-transform:uppercase;color:var(--text-muted);font-weight:700;">Prob. Victoria</div>
              </div>
            </div>
            
            <p style="font-size:12px;color:var(--text-body);margin-bottom:8px;line-height:1.4;">
              <strong>Factor Clave de Victoria:</strong> ${ch.keyFactor}
            </p>
            <div style="font-size:11px;color:var(--text-muted);margin-bottom:12px;">
              <strong>Precedente Histórico:</strong> ${ch.precedent} | <strong>Concurrencia:</strong> ${ch.compDensity}
            </div>

            <button class="${isSelected ? 'btn-primary' : 'btn-secondary'}" onclick="selectChallenge('${ch.id}')">
              ${isSelected ? '✓ Desafío Seleccionado' : 'Seleccionar este Desafío'}
            </button>
          </div>
        `;
      }).join("")}
    </div>
  `;
}

function selectChallenge(id) {
  const found = OFFICIAL_CHALLENGES_2026.find(c => c.id === id);
  if (found) {
    state.challenge_id = found.id;
    state.challenge_title = found.title;
    state.category = found.category;
    saveState();
    renderNavigation();
    renderTab('challenges');
  }
}

// 03 IDENTIDAD & PALETA VIEW
function renderViewIdentity() {
  const cr = getContrastRatio(state.palette.primary, "#ffffff");
  const wcag = cr >= 7 ? "AAA" : (cr >= 4.5 ? "AA" : "FAIL (Bajo)");

  return `
    <div class="page-header">
      <div>
        <h1 class="page-title">03 · Identidad Visual & Tokens de Color</h1>
        <div class="page-desc">Paleta de alto contraste para UI web, animación 3D y placas del video pitch.</div>
      </div>
    </div>

    <div class="workbench-card">
      <h3>Presets Históricos de Equipos Campeones</h3>
      <div style="display:grid;grid-template-columns:repeat(2, 1fr);gap:10px;margin-bottom:18px;">
        ${Object.entries(PALETTE_PRESETS).map(([key, p]) => `
          <div style="border:1px solid var(--border-light);padding:10px;border-radius:4px;cursor:pointer;background:var(--bg-subtle);" onclick="applyPreset('${key}')">
            <div style="font-size:11px;font-weight:700;color:var(--text-main);margin-bottom:6px;">${p.name}</div>
            <div style="display:flex;gap:6px;">
              <div style="width:24px;height:24px;border-radius:3px;background:${p.primary};" title="Primary"></div>
              <div style="width:24px;height:24px;border-radius:3px;background:${p.secondary};" title="Secondary"></div>
              <div style="width:24px;height:24px;border-radius:3px;background:${p.accent};" title="Accent"></div>
              <span style="font-size:10px;color:var(--text-muted);align-self:center;margin-left:4px;">${p.source}</span>
            </div>
          </div>
        `).join("")}
      </div>

      <h3>Personalización Manual & Contraste WCAG</h3>
      <div class="form-grid">
        <div class="form-group">
          <label>Color Primario (Autoridad / Títulos)</label>
          <div style="display:flex;gap:8px;">
            <input type="color" value="${state.palette.primary}" onchange="updateColor('primary', this.value)" style="width:40px;height:32px;padding:0;cursor:pointer;">
            <input type="text" value="${state.palette.primary}" onchange="updateColor('primary', this.value)">
          </div>
        </div>
        <div class="form-group">
          <label>Color Secundario (Fondos / Estructura)</label>
          <div style="display:flex;gap:8px;">
            <input type="color" value="${state.palette.secondary}" onchange="updateColor('secondary', this.value)" style="width:40px;height:32px;padding:0;cursor:pointer;">
            <input type="text" value="${state.palette.secondary}" onchange="updateColor('secondary', this.value)">
          </div>
        </div>
        <div class="form-group">
          <label>Color de Acento (Alertas / Telemetría)</label>
          <div style="display:flex;gap:8px;">
            <input type="color" value="${state.palette.accent}" onchange="updateColor('accent', this.value)" style="width:40px;height:32px;padding:0;cursor:pointer;">
            <input type="text" value="${state.palette.accent}" onchange="updateColor('accent', this.value)">
          </div>
        </div>
        <div class="form-group">
          <label>Contraste sobre Blanco</label>
          <div style="padding:7px 11px;background:var(--bg-subtle);border:1px solid var(--border-light);border-radius:4px;font-family:var(--font-mono);font-size:12px;font-weight:700;">
            ${cr.toFixed(2)}:1 · <span style="color:${cr>=4.5?'#047857':'#b91c1c'}">${wcag}</span>
          </div>
        </div>
      </div>
    </div>
  `;
}

function updateColor(key, val) {
  state.palette[key] = val;
  saveState();
  renderTab('identity');
}

function applyPreset(key) {
  const p = PALETTE_PRESETS[key];
  if (p) {
    state.palette.primary = p.primary;
    state.palette.secondary = p.secondary;
    state.palette.accent = p.accent;
    saveState();
    renderTab('identity');
  }
}

// 04 INVESTIGACIÓN & CLAIMS VIEW
function renderViewResearch() {
  return `
    <div class="page-header">
      <div>
        <h1 class="page-title">04 · Banco de Evidencias & Estadísticas Oficiales</h1>
        <div class="page-desc">Solo cifras registradas aquí pueden alimentar el pautado y el video pitch.</div>
      </div>
      <button class="btn-primary" onclick="addClaimRow()">+ Añadir Evidencia</button>
    </div>

    <div class="workbench-card">
      <h3>Estadísticas Verificadas en Registro</h3>
      ${state.claims.length === 0 ? `
        <div style="text-align:center;padding:24px;color:var(--text-muted);font-size:12px;">
          No hay evidencias cargadas. Añade al menos 3 datos de fuentes oficiales (BCN, INSS, CEPAL, OMS, SINAPRED).
        </div>
      ` : `
        <table class="data-table">
          <thead>
            <tr>
              <th>Dato Estadístico Crítico</th>
              <th>Fuente Oficial</th>
              <th>Año</th>
              <th>URL / Evidencia</th>
              <th>Acción</th>
            </tr>
          </thead>
          <tbody>
            ${state.claims.map((c, idx) => `
              <tr>
                <td><strong>${c.stat}</strong></td>
                <td>${c.source}</td>
                <td>${c.year}</td>
                <td><a href="${c.url}" target="_blank" style="color:var(--color-primary);text-decoration:none;">Enlace</a></td>
                <td><button class="btn-secondary" style="padding:2px 6px;font-size:10px;" onclick="removeClaim(${idx})">Eliminar</button></td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      `}
    </div>
  `;
}

function addClaimRow() {
  const stat = prompt("Ingresa el dato estadístico (ej: El 42% de pérdidas ocurren en los primeros 30 minutos):");
  if (!stat) return;
  const source = prompt("Fuente institucional oficial (ej: CEPAL, SINAPRED, INIDE):") || "Fuente Oficial";
  const year = prompt("Año del reporte:", "2024") || "2024";
  const url = prompt("URL de verificación:", "https://") || "https://";

  state.claims.push({ stat, source, year, url });
  saveState();
  renderNavigation();
  renderTab('research');
}

function removeClaim(idx) {
  state.claims.splice(idx, 1);
  saveState();
  renderNavigation();
  renderTab('research');
}

// 05 PAUTADO INTERACTIVO VIEW
function renderViewPautado() {
  return `
    <div class="page-header">
      <div>
        <h1 class="page-title">05 · Redacción Oficial de Reporte Pautado</h1>
        <div class="page-desc">Edición directa con conteo de caracteres con espacios en tiempo real.</div>
      </div>
      <button class="btn-primary" onclick="savePautadoTexts()">Guardar Pautado</button>
    </div>

    <div class="rubric-callout">
      <strong>REGLA DE REDACCIÓN DE CAMPEONES:</strong> Cero adjetivos inflados. Nombre del proyecto UNA sola vez por bloque. 
      Estructura telegráfica de alta densidad técnica para evaluadores que leen con prisa.
    </div>

    <div style="display:flex;flex-direction:column;gap:18px;">
      ${Object.entries(PAUTADO_LIMITS).map(([key, limit]) => {
        const val = state.pautado[key] || "";
        const len = val.length;
        const pct = Math.min((len / limit) * 100, 100);
        let colorClass = "";
        let statusLabel = `${len} / ${limit} caracteres`;

        if (len > limit) {
          colorClass = "over";
          statusLabel += ` (¡EXCEDIDO POR ${len - limit}!)`;
        } else if (pct >= 85) {
          colorClass = "warn";
        }

        const labels = {
          problema: "1. Descripción del Problema Detectado (Dolor Cuantificado)",
          solucion: "2. Solución Técnica Propuesta y Mecanismo Operativo",
          prefactibilidad: "3. Prefactibilidad Económica, Social y Ambiental",
          innovacion: "4. Grado de Innovación Radical y Diferenciación",
          impacto: "5. Impacto Comunitario, Métricas y Vinculación ODS"
        };

        return `
          <div class="workbench-card">
            <h3>
              <span>${labels[key]}</span>
              <span style="font-family:var(--font-mono);font-size:11px;font-weight:700;color:${len>limit?'#ef4444':'var(--text-muted)'}">${statusLabel}</span>
            </h3>
            <textarea id="pt-${key}" rows="4" oninput="updateCharCounter('${key}', ${limit}, this.value)">${val}</textarea>
            <div class="counter-bar-wrapper">
              <span style="font-size:10px;color:var(--text-muted);">0</span>
              <div class="progress-track">
                <div id="bar-${key}" class="progress-fill ${colorClass}" style="width:${pct}%;"></div>
              </div>
              <span style="font-size:10px;color:var(--text-muted);">${limit} máx</span>
            </div>
          </div>
        `;
      }).join("")}
    </div>
  `;
}

function updateCharCounter(key, limit, val) {
  state.pautado[key] = val;
  const len = val.length;
  const pct = Math.min((len / limit) * 100, 100);
  const bar = document.getElementById("bar-" + key);
  if (bar) {
    bar.style.width = pct + "%";
    bar.className = "progress-fill " + (len > limit ? "over" : (pct >= 85 ? "warn" : ""));
  }
  updateInspector();
}

function savePautadoTexts() {
  Object.keys(PAUTADO_LIMITS).forEach(k => {
    const el = document.getElementById("pt-" + k);
    if (el) state.pautado[k] = el.value;
  });
  saveState();
  renderNavigation();
  alert("✓ Pautado guardado. Conteo sincronizado con el inspector.");
}

// 06 PRESUPUESTO INTERACTIVO VIEW
function renderViewBudget() {
  const total = state.budget.reduce((acc, it) => acc + (it.units * it.unit_cost), 0);
  let statusBadge = "";
  if (total < 4000) {
    statusBadge = `<span class="badge-status badge-wip">BAJO (<$4,000 USD) - Riesgo de inverosimilitud</span>`;
  } else if (total > 6000) {
    statusBadge = `<span class="badge-status badge-pending" style="color:#b91c1c;">EXCEDIDO (>$6,000 USD)</span>`;
  } else {
    statusBadge = `<span class="badge-status badge-ok">RANGO ÓPTIMO GANADOR ($4,000–$6,000 USD)</span>`;
  }

  return `
    <div class="page-header">
      <div>
        <h1 class="page-title">06 · Presupuesto Sustentado de Puesta en Marcha</h1>
        <div class="page-desc">Cotizado con proveedores mayoristas verificados. Cero TIR o VAN especulativo.</div>
      </div>
      <div>
        ${statusBadge}
      </div>
    </div>

    <div class="workbench-card">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
        <h3>Partidas de Hardware y Despliegue Piloto</h3>
        <button class="btn-secondary" onclick="addBudgetItem()">+ Añadir Partida</button>
      </div>

      <table class="data-table">
        <thead>
          <tr>
            <th>Elemento / Insumo</th>
            <th style="width:70px;text-align:center;">Cant.</th>
            <th style="width:110px;text-align:right;">Costo Unit (USD)</th>
            <th style="width:110px;text-align:right;">Subtotal</th>
            <th>Proveedor / Enlace</th>
            <th style="width:60px;">Acción</th>
          </tr>
        </thead>
        <tbody>
          ${state.budget.map((b, idx) => `
            <tr>
              <td><input type="text" value="${b.element}" onchange="updateBudgetItem(${idx}, 'element', this.value)"></td>
              <td><input type="number" style="text-align:center;" value="${b.units}" onchange="updateBudgetItem(${idx}, 'units', parseFloat(this.value)||1)"></td>
              <td><input type="number" step="0.5" style="text-align:right;" value="${b.unit_cost}" onchange="updateBudgetItem(${idx}, 'unit_cost', parseFloat(this.value)||0)"></td>
              <td style="text-align:right;font-weight:700;">$${(b.units * b.unit_cost).toFixed(2)}</td>
              <td><input type="text" value="${b.url}" onchange="updateBudgetItem(${idx}, 'url', this.value)"></td>
              <td><button class="btn-secondary" style="padding:2px 6px;font-size:10px;" onclick="removeBudgetItem(${idx})">×</button></td>
            </tr>
          `).join("")}
          <tr style="background:var(--bg-subtle);font-weight:800;font-size:13px;">
            <td colspan="3" style="text-align:right;">TOTAL DE PUESTA EN MARCHA:</td>
            <td style="text-align:right;color:var(--color-primary);font-size:14px;">$${total.toFixed(2)} USD</td>
            <td colspan="2" style="font-size:11px;color:var(--text-muted);font-weight:normal;">*Incluye flete e importación</td>
          </tr>
        </tbody>
      </table>
    </div>
  `;
}

function updateBudgetItem(idx, key, val) {
  state.budget[idx][key] = val;
  saveState();
  renderTab('budget');
}

function addBudgetItem() {
  state.budget.push({ element: "Nuevo componente", units: 1, unit_cost: 50.00, url: "https://alibaba.com" });
  saveState();
  renderTab('budget');
}

function removeBudgetItem(idx) {
  state.budget.splice(idx, 1);
  saveState();
  renderTab('budget');
}

// 07 MODELO CANVAS VIEW
function renderViewCanvas() {
  return `
    <div class="page-header">
      <div>
        <h1 class="page-title">07 · Business Model Canvas Integral</h1>
        <div class="page-desc">Coherencia validada entre la propuesta de valor y la estructura de costos.</div>
      </div>
    </div>

    <div class="workbench-card">
      <div style="display:grid;grid-template-columns:repeat(3, 1fr);gap:12px;font-size:12px;">
        <div style="border:1px solid var(--border-light);padding:10px;border-radius:4px;">
          <div style="font-weight:700;color:var(--color-primary);margin-bottom:4px;">1. Socios Clave</div>
          <p style="color:var(--text-muted);line-height:1.4;">Alcaldías, SINAPRED, cooperativas agrícolas, proveedores mayoristas de electrónica.</p>
        </div>
        <div style="border:1px solid var(--border-light);padding:10px;border-radius:4px;">
          <div style="font-weight:700;color:var(--color-primary);margin-bottom:4px;">2. Actividades Clave</div>
          <p style="color:var(--text-muted);line-height:1.4;">Ensamble local con carcasas IP67, despliegue de red LoRaWAN y calibración de umbrales.</p>
        </div>
        <div style="border:1px solid var(--border-light);padding:10px;border-radius:4px;">
          <div style="font-weight:700;color:var(--color-primary);margin-bottom:4px;">3. Propuesta de Valor</div>
          <p style="color:var(--text-main);font-weight:600;line-height:1.4;">${state.description_one_line || "Definida en Brief"}</p>
        </div>
        <div style="border:1px solid var(--border-light);padding:10px;border-radius:4px;">
          <div style="font-weight:700;color:var(--color-primary);margin-bottom:4px;">4. Recursos Clave</div>
          <p style="color:var(--text-muted);line-height:1.4;">Sensores industriales, microcontroladores ESP32-S3, nodos solares LiFePO4.</p>
        </div>
        <div style="border:1px solid var(--border-light);padding:10px;border-radius:4px;">
          <div style="font-weight:700;color:var(--color-primary);margin-bottom:4px;">5. Relación con Clientes</div>
          <p style="color:var(--text-muted);line-height:1.4;">Soporte preventivo semestral, telemetría abierta para brigadas de rescate.</p>
        </div>
        <div style="border:1px solid var(--border-light);padding:10px;border-radius:4px;">
          <div style="font-weight:700;color:var(--color-primary);margin-bottom:4px;">6. Canales</div>
          <p style="color:var(--text-muted);line-height:1.4;">Instalación directa municipal y API de alertas tempranas para centros de socorro.</p>
        </div>
        <div style="border:1px solid var(--border-light);padding:10px;border-radius:4px;grid-column:1/-1;">
          <div style="font-weight:700;color:var(--color-primary);margin-bottom:4px;">7. Estructura de Costos vs. Ingresos</div>
          <p style="color:var(--text-muted);line-height:1.4;">
            <strong>Costos:</strong> Total puesta en marcha de $${state.budget.reduce((a,b)=>a+(b.units*b.unit_cost),0).toFixed(2)} USD.<br>
            <strong>Sostenibilidad:</strong> Modelo B2G por mantenimiento y licenciamiento de la red de telemetría a escala regional.
          </p>
        </div>
      </div>
    </div>
  `;
}

// 08 GUION EN 4 ACTOS VIEW
function renderViewScript() {
  const words = [state.script.acto1, state.script.acto2, state.script.acto3, state.script.acto4]
    .join(" ").trim().split(/\s+/).filter(Boolean).length;
  const durationEst = Math.round((words / 135) * 60);

  return `
    <div class="page-header">
      <div>
        <h1 class="page-title">08 · Guion de Producción Audiovisual (120 Segundos)</h1>
        <div class="page-desc">4 micro-actos matemáticos para satisfacer la rúbrica del jurado.</div>
      </div>
      <div style="font-family:var(--font-mono);font-size:12px;font-weight:700;">
        <span>${words} palabras</span> · <span style="color:${durationEst<=120?'#047857':'#b91c1c'}">~${durationEst}s</span>
      </div>
    </div>

    <div class="workbench-card">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
        <h3>Acto I: Gancho y Dolor Cuantificado (0:00–0:20)</h3>
        <span class="badge-status badge-wip">PROHIBIDO LOGOS Y NOMBRES</span>
      </div>
      <p style="font-size:11px;color:var(--text-muted);margin-bottom:8px;">Abre con estadística crítica y beneficiario afectado. Captura atención inmediata.</p>
      <textarea rows="2" oninput="state.script.acto1=this.value; saveState();">${state.script.acto1}</textarea>
    </div>

    <div class="workbench-card">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
        <h3>Acto II: Revelación de Solución & Caja Negra 3D (0:20–1:00)</h3>
        <span class="badge-status badge-ok">30 PTS INNOVACIÓN</span>
      </div>
      <p style="font-size:11px;color:var(--text-muted);margin-bottom:8px;">Bautizo del proyecto y explicación visual del mecanismo físico/digital (despiece, sensores).</p>
      <textarea rows="3" oninput="state.script.acto2=this.value; saveState();">${state.script.acto2}</textarea>
    </div>

    <div class="workbench-card">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
        <h3>Acto III: Prefactibilidad & Costos Unitarios (1:00–1:35)</h3>
        <span class="badge-status badge-ok">20 PTS PREFACTIBILIDAD</span>
      </div>
      <p style="font-size:11px;color:var(--text-muted);margin-bottom:8px;">Demostración de costo unitario ($4k-$6k), actores que financian y ciclo circular.</p>
      <textarea rows="2" oninput="state.script.acto3=this.value; saveState();">${state.script.acto3}</textarea>
    </div>

    <div class="workbench-card">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
        <h3>Acto IV: Métricas Auditables & Cierre Regional (1:35–2:00)</h3>
        <span class="badge-status badge-pending">CIERRE RECORDABLE</span>
      </div>
      <p style="font-size:11px;color:var(--text-muted);margin-bottom:8px;">3 métricas de impacto, iconos ODS con paleta propia y retorno al beneficiario transformado.</p>
      <textarea rows="2" oninput="state.script.acto4=this.value; saveState();">${state.script.acto4}</textarea>
    </div>
  `;
}

// 09 WEB DEMO VIEW
function renderViewWebDemo() {
  return `
    <div class="page-header">
      <div>
        <h1 class="page-title">09 · Plataforma Web Demo para Video Pitch</h1>
        <div class="page-desc">Grabación en vivo para tomas de cámara con zoom y dinamismo en el Acto II.</div>
      </div>
      <a href="/site/index.html" target="_blank" class="btn-primary" style="text-decoration:none;">Abrir Web Demo en Pestaña Completa ↗</a>
    </div>

    <div class="workbench-card" style="padding:0;overflow:hidden;">
      <iframe src="/site/index.html" style="width:100%;height:520px;border:none;"></iframe>
    </div>
  `;
}

// 10 TIMELINE VIEW
function renderViewTimeline() {
  return `
    <div class="page-header">
      <div>
        <h1 class="page-title">10 · Cronómetro Regresivo & Hitos Innegociables</h1>
        <div class="page-desc">Ventana crítica para entrega a tiempo en la plataforma SIRLI.</div>
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
          <tr>
            <td><strong>T-6 Horas</strong></td>
            <td>Congelamiento de claims e investigación. Brief bloqueado.</td>
            <td>Cambiar de idea a última hora produce renders a medias.</td>
          </tr>
          <tr>
            <td><strong>T-4 Horas</strong></td>
            <td>Pautado y presupuesto completos al 100%.</td>
            <td>Falta de validación de caracteres descalifica en revisión.</td>
          </tr>
          <tr>
            <td><strong>T-2 Horas</strong></td>
            <td>Render en calidad MEDIA. Grabar pantallas de la web demo.</td>
            <td>Renderizar en Cycles a última hora satura la GPU.</td>
          </tr>
          <tr>
            <td><strong>T-1 Hora</strong></td>
            <td>Exportación final del video pitch (119 segundos exactos).</td>
            <td>Videos de 121 segundos quedan eliminados por reglamento.</td>
          </tr>
          <tr>
            <td><strong>T-30 Minutos</strong></td>
            <td>Subir a YouTube en modo 'Oculto' o 'Público' y registrar URL.</td>
            <td>El procesamiento HD de YouTube puede tardar 25 minutos.</td>
          </tr>
        </tbody>
      </table>
    </div>
  `;
}

// ── INSPECTOR LATERAL DE AUDITORÍA DINÁMICO ──────────────────────────────────
function updateInspector() {
  const panel = document.getElementById("panel");
  if (!panel) return;

  // Cálculo de preparación global
  let points = 0;
  if (state.project_name && state.challenge_id) points += 20;
  if (state.claims.length >= 3) points += 15;
  if (isPautadoComplete()) points += 25;
  if (isBudgetOptimal()) points += 20;
  if (isScriptComplete()) points += 20;

  const totalBudget = state.budget.reduce((a, b) => a + (b.units * b.unit_cost), 0);

  panel.innerHTML = `
    <div>
      <div class="panel-block-title">Índice de Preparación SIRLI</div>
      <div class="score-meter">
        <div class="score-number">${points}%</div>
        <div class="score-label">${points===100?'Listo para Entrega':'En Configuración'}</div>
      </div>
    </div>

    <div>
      <div class="panel-block-title">Auditoría en Tiempo Real</div>
      <div class="audit-list">
        <div class="audit-item ${state.project_name?'ok':'pending'}">
          <span>Brief & Proyecto</span>
          <strong>${state.project_name?'OK':'Incompleto'}</strong>
        </div>
        <div class="audit-item ${state.challenge_id?'ok':'pending'}">
          <span>Desafío Seleccionado</span>
          <strong>${state.challenge_id?`#${state.challenge_id}`:'Sin elegir'}</strong>
        </div>
        <div class="audit-item ${state.claims.length>=3?'ok':'pending'}">
          <span>Banco de Evidencias</span>
          <strong>${state.claims.length} / 3 claims</strong>
        </div>
        <div class="audit-item ${isPautadoComplete()?'ok':'pending'}">
          <span>Pautado (Caracteres)</span>
          <strong>${isPautadoComplete()?'Auditado':'Revisar'}</strong>
        </div>
        <div class="audit-item ${isBudgetOptimal()?'ok':'warn'}">
          <span>Presupuesto Puesta en Marcha</span>
          <strong>$${totalBudget.toFixed(0)} USD</strong>
        </div>
        <div class="audit-item ${isScriptComplete()?'ok':'pending'}">
          <span>Guion (120 Segundos)</span>
          <strong>${isScriptComplete()?'OK':'Pendiente'}</strong>
        </div>
      </div>
    </div>

    <div>
      <div class="panel-block-title">Consejo del Campeón</div>
      <div class="insight-box">
        <div class="insight-header">💡 Lección de Oro Latam</div>
        El jurado continental evalúa que las cifras del último minuto del video coincidan centavo a centavo con el pautado. Si dices $4,450 en pantalla, debe ser idéntico en el Excel.
      </div>
    </div>
  `;
}

function attachTabListeners(tabId) {}

function getContrastRatio(hex1, hex2) {
  function lum(hex) {
    const rgb = hex.replace("#", "").match(/.{2}/g).map(x => parseInt(x, 16) / 255);
    const a = rgb.map(v => v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4));
    return 0.2126 * a[0] + 0.7152 * a[1] + 0.0722 * a[2];
  }
  const l1 = lum(hex1);
  const l2 = lum(hex2);
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}
