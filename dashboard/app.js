// dashboard/app.js — Rally Studio Dashboard
// Sin frameworks. Sin dependencias externas. Solo ES2020 vanilla.

const SECTIONS = [
  { id: "brief",        label: "01  Brief" },
  { id: "identity",     label: "02  Identidad" },
  { id: "challenges",   label: "03  Desafios" },
  { id: "research",     label: "04  Investigacion" },
  { id: "pautado",      label: "05  Pautado" },
  { id: "budget",       label: "06  Presupuesto" },
  { id: "canvas",       label: "07  Canvas" },
  { id: "bibliography", label: "08  Bibliografia" },
  { id: "script",       label: "09  Guion" },
  { id: "assets",       label: "10  Recursos" },
  { id: "clock",        label: "11  Reloj & Render" },
  { id: "publish",      label: "12  Publicar" },
];

// Estado global
let brief   = {};
let palette = {};
let active  = "brief";
let clockInterval = null;
let secondsRemaining = 0;

// ── INICIALIZAR ────────────────────────────────────────
async function init() {
  await loadData();
  renderTopbar();
  renderSidebar();
  renderPanel();
  renderSection(active);
  if (brief.hours_remaining) startClock(brief.hours_remaining * 3600);
  loadPaletteTokens();
}

async function loadData() {
  try {
    const r = await fetch("../brief.json");
    if (r.ok) brief = await r.json();
  } catch (_) { /* brief.json no existe aun */ }

  try {
    const r = await fetch("../brand/palette.json");
    if (r.ok) palette = await r.json();
  } catch (_) { /* sin paleta aun */ }
}

function loadPaletteTokens() {
  if (!palette.primary) return;
  const root = document.documentElement;
  if (palette.primary)   root.style.setProperty("--color-primary",   palette.primary);
  if (palette.secondary) root.style.setProperty("--color-secondary",  palette.secondary);
  if (palette.accent)    root.style.setProperty("--color-accent",     palette.accent);
  if (palette.bg)        root.style.setProperty("--bg",               palette.bg);
  if (palette.text)      root.style.setProperty("--text",             palette.text);
  root.style.setProperty("--accent", palette.primary);
}

// ── TOPBAR ─────────────────────────────────────────────
function renderTopbar() {
  const el = document.getElementById("topbar");
  el.innerHTML = `
    <span class="brand">Rally Studio</span>
    <span class="project-name">${brief.project_name || "— sin proyecto —"} / ${brief.team_name || ""}</span>
    <span class="rally-badge">${(brief.rally_type || "—").toUpperCase()} ${brief.hours_total ? brief.hours_total + "h" : ""}</span>
    <span class="clock-display" id="clock-top">--:--</span>
  `;
}

// ── SIDEBAR ─────────────────────────────────────────────
function renderSidebar() {
  const nav = document.querySelector("#sidebar nav");
  nav.innerHTML = SECTIONS.map(s =>
    `<a href="#" class="${s.id === active ? "active" : ""}" data-section="${s.id}">${s.label}</a>`
  ).join("");
  nav.querySelectorAll("a").forEach(a =>
    a.addEventListener("click", e => {
      e.preventDefault();
      active = a.dataset.section;
      renderSidebar();
      renderSection(active);
    })
  );
}

// ── PANEL DERECHO ────────────────────────────────────────
function renderPanel() {
  const statuses = [
    ["Brief",          brief.project_name      ? "ok"  : "todo"],
    ["Identidad",      palette.primary         ? "ok"  : "todo"],
    ["Investigacion",  "todo"],
    ["Pautado",        "todo"],
    ["Presupuesto",    "todo"],
    ["Guion",          "todo"],
    ["Voz",            "todo"],
    ["Video",          brief.video_url         ? "ok"  : "todo"],
  ];

  document.getElementById("panel").innerHTML = `
    <div class="panel-section">
      <div class="panel-title">Estado</div>
      ${statuses.map(([label, st]) =>
        `<div class="status-item">
          <span><span class="dot dot-${st}"></span>${label}</span>
        </div>`
      ).join("")}
    </div>
    <div class="panel-section">
      <div class="panel-title">Alertas</div>
      <div id="alerts"></div>
    </div>
    <div class="panel-section">
      <div class="panel-title">Reloj</div>
      <div class="clock-display" id="clock-panel">--:--</div>
      <div style="font-size:11px;color:var(--muted);margin-top:4px">horas restantes</div>
    </div>
  `;
}

// ── RELOJ ─────────────────────────────────────────────────
const ALERT_MSGS = {
  6:   "T-6h: Congela investigacion. Claims.json debe estar listo.",
  4:   "T-4h: Pautado y presupuesto deben terminar. Inicia renders en boceto.",
  3:   "T-3h: Revisa guion final. Graba web demo.",
  2:   "T-2h: Inicia render calidad MEDIA. Exporta GLB para la web.",
  1:   "T-1h: Prepara exportacion final del video.",
  0.5: "T-30min: CONGELA TODO. Solo exportacion y subida a SIRLI/YouTube.",
};
const alertedSet = new Set();

function startClock(seconds) {
  secondsRemaining = seconds;
  if (clockInterval) clearInterval(clockInterval);
  clockInterval = setInterval(() => {
    secondsRemaining = Math.max(0, secondsRemaining - 1);
    const h = Math.floor(secondsRemaining / 3600);
    const m = Math.floor((secondsRemaining % 3600) / 60);
    const str = `${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}`;
    const t = document.getElementById("clock-top");
    const p = document.getElementById("clock-panel");
    if (t) t.textContent = str;
    if (p) p.textContent = str;

    // Alertas
    const hoursLeft = secondsRemaining / 3600;
    for (const [hAlert, msg] of Object.entries(ALERT_MSGS)) {
      if (hoursLeft <= parseFloat(hAlert) && !alertedSet.has(hAlert)) {
        alertedSet.add(hAlert);
        const alertsEl = document.getElementById("alerts");
        if (alertsEl) {
          alertsEl.innerHTML += `<div class="alert-box">${msg}</div>`;
        }
      }
    }
    if (secondsRemaining === 0) clearInterval(clockInterval);
  }, 1000);
}

// ── SECCIONES ─────────────────────────────────────────────
function renderSection(id) {
  const main = document.getElementById("main");
  const label = SECTIONS.find(s => s.id === id)?.label || id;
  main.innerHTML = `<h2>${label}</h2>`;

  const renderers = {
    brief:        sectionBrief,
    identity:     sectionIdentity,
    challenges:   sectionChallenges,
    research:     sectionResearch,
    pautado:      sectionPautado,
    budget:       sectionBudget,
    canvas:       sectionCanvas,
    bibliography: sectionBibliography,
    script:       sectionScript,
    assets:       sectionAssets,
    clock:        sectionClock,
    publish:      sectionPublish,
  };
  (renderers[id] || (() => { main.innerHTML += `<div class="info-box">Seccion en construccion.</div>`; }))(main);
}

// ── SECCION: BRIEF ──────────────────────────────────────
function sectionBrief(main) {
  if (!brief.project_name) {
    main.innerHTML += `
      <div class="err-box">
        <strong>brief.json vacio o no encontrado.</strong><br>
        Ejecuta en terminal: <code>python scripts/init_brief.py</code><br>
        Luego recarga esta pagina.
      </div>`;
    return;
  }
  const fields = [
    ["Proyecto",     brief.project_name],
    ["Equipo",       brief.team_name],
    ["Universidad",  brief.university],
    ["Ciudad",       brief.city],
    ["Rally",        `${brief.rally_type?.toUpperCase()} (${brief.hours_total}h)`],
    ["Categoria",    brief.category],
    ["Desafio",      `${brief.challenge_id} — ${brief.challenge_title}`],
    ["ODS",          (brief.ods_ids || []).join(", ")],
    ["Descripcion",  brief.description_one_line],
    ["Entregable",   brief.deliverable_type],
    ["GPU VRAM",     `${brief.pc_gpu_vram_gb} GB`],
    ["RAM PC",       `${brief.pc_ram_gb} GB`],
    ["Eje Nal.",     brief.national_plan_axis || "—"],
  ];
  main.innerHTML += `
    <table>
      <tr><th>Campo</th><th>Valor</th></tr>
      ${fields.map(([k,v]) => `<tr><td>${k}</td><td>${v || "—"}</td></tr>`).join("")}
    </table>
    <div class="info-box">Para editar, ejecuta: <code>python scripts/init_brief.py</code></div>
  `;
}

// ── SECCION: IDENTIDAD ──────────────────────────────────
function sectionIdentity(main) {
  const hasPalette = palette.primary;
  main.innerHTML += `
    <h3>Paleta de colores</h3>
    ${hasPalette ? `
      <div class="palette-row">
        ${Object.entries(palette).filter(([k])=>!k.startsWith("_")).map(([k,v]) => `
          <div class="swatch-group">
            <div class="swatch" style="background:${v}" title="${v}"></div>
            <span class="swatch-label">${k}</span>
            <span class="swatch-label" style="font-size:10px">${v}</span>
          </div>`
        ).join("")}
      </div>
      <div class="info-box">Paleta activa. Fuente: ${palette._source || "manual"}</div>
    ` : `
      <div class="err-box">Sin paleta definida.</div>
    `}
    <p>Para generar paleta desde el logo:</p>
    <pre>python scripts/gen_palette.py brand/logo.png</pre>

    <h3>Tipografia</h3>
    <div class="type-preview">
      <h1 style="font-family:var(--font)">H1 — Titulo Principal (32px 800)</h1>
      <h2 style="font-family:var(--font)">H2 — Seccion (22px 700)</h2>
      <h3 style="font-family:var(--font)">H3 — Subseccion (16px 600)</h3>
      <p>Cuerpo de texto — 14px, interlineado 1.7. Legible para lectura rapida.</p>
    </div>
    <p style="margin-top:12px">Fuente del sistema usada. Para fuentes personalizadas, editar <code>brand/tokens.css</code>.</p>

    <h3>Estilo de diseno</h3>
    <div class="info-box">
      Reglas activas desde AGENTS.md:<br>
      · Sin cards genericas · Sin morado · Sin gradientes excesivos<br>
      · Iconos SVG propios por proyecto · Datos simulados marcados [SIMULADO]
    </div>
  `;
}

// ── SECCION: DESAFIOS ───────────────────────────────────
function sectionChallenges(main) {
  main.innerHTML += `
    <p>1. Agrega los desafios del rally a <code>research/challenges.json</code></p>
    <pre>[
  {
    "id": "01",
    "title": "Titulo del desafio",
    "description": "Descripcion completa",
    "ods_ids": ["ODS11", "ODS13"],
    "uses_local_resources": true,
    "has_prior_art_nicaragua": false,
    "notes": ""
  }
]</pre>
    <p>2. Ejecuta el scoring para ver cuales tienen mas probabilidad de ganar:</p>
    <pre>python scripts/score_challenges.py</pre>
    <p>El ranking considera: competencia historica 2019–2025, ODS cubiertos, materias primas locales.</p>
    <div class="info-box">
      Desafio actual en brief.json: <strong>${brief.challenge_id || "—"} — ${brief.challenge_title || "sin definir"}</strong>
    </div>
  `;
}

// ── SECCION: INVESTIGACION ──────────────────────────────
function sectionResearch(main) {
  main.innerHTML += `
    <p>Cada estadistica usada en el pautado DEBE existir en <code>research/claims.json</code>.</p>
    <h3>Formato de claims.json</h3>
    <pre>[
  {
    "stat": "X% de Y sufren Z en Nicaragua (2024)",
    "source": "INSS / OMS / BCN / etc.",
    "url": "https://fuente-oficial.org/dato",
    "year": 2024,
    "accessed": "2026-10-18"
  }
]</pre>
    <h3>Herramientas recomendadas</h3>
    <table>
      <tr><th>Herramienta</th><th>Para que</th></tr>
      <tr><td>Perplexity AI</td><td>Investigacion con fuentes citadas</td></tr>
      <tr><td>Espacenet / Lens.org</td><td>Busqueda de patentes</td></tr>
      <tr><td>BCN Nicaragua</td><td>Datos economicos locales verificados</td></tr>
      <tr><td>INIDE Nicaragua</td><td>Estadisticas demograficas y sociales</td></tr>
      <tr><td>SIRLI.org</td><td>Proyectos ganadores historicos del Rally</td></tr>
    </table>
    <div class="info-box">
      Stats verificadas: <strong>${brief.problem_stats_count || 0}</strong>
      (segun brief.json). Meta sugerida: >=5 claims solidos antes de escribir el pautado.
    </div>
  `;
}

// ── SECCION: PAUTADO ────────────────────────────────────
function sectionPautado(main) {
  const limits = brief.rally_type === "latam"
    ? [["Problema",1250],["Solucion",1250],["Prefactibilidad",1000],["Innovacion",1000],["Impacto",1500]]
    : [["Descripcion del proyecto",1500],["Problema",1000],["Solucion",1000],["Prefactibilidad",800],["Innovacion",800]];

  main.innerHTML += `
    <p>La maqueta oficial va en <code>docs/pautado_template.docx</code>.</p>
    <h3>Limites de caracteres (con espacios) — Modo ${(brief.rally_type||"—").toUpperCase()}</h3>
    <table>
      <tr><th>Seccion</th><th>Limite</th><th>Estado</th></tr>
      ${limits.map(([sec,lim]) => `<tr><td>${sec}</td><td>${lim}</td><td class="char-counter">ejecuta validate_pautado.py</td></tr>`).join("")}
    </table>
    <h3>Reglas de redaccion (AGENTS.md)</h3>
    <div class="info-box">
      · Nombre del proyecto: UNA sola vez por seccion<br>
      · Sin repetir informacion entre secciones<br>
      · Lenguaje para alguien que lee a carrera y no conoce ingenieria<br>
      · Cada parrafo responde a un item de la rubrica<br>
      · Plan Nacional + ODS en la seccion de Impacto
    </div>
    <h3>Comandos</h3>
    <pre>python scripts/gen_pautado.py        # genera draft desde brief + claims
python scripts/validate_pautado.py  # cuenta caracteres, bloquea si excede</pre>
  `;
}

// ── SECCION: PRESUPUESTO ────────────────────────────────
function sectionBudget(main) {
  main.innerHTML += `
    <h3>Rango objetivo</h3>
    <div class="info-box">USD $4,000 – $6,000. Menos es mejor SI tiene sustento. Nunca TIR/VAN/ROI complejo.</div>
    <h3>Columnas requeridas (budget.json)</h3>
    <table>
      <tr><th>Campo</th><th>Descripcion</th></tr>
      <tr><td>element</td><td>Nombre del componente</td></tr>
      <tr><td>description</td><td>Descripcion breve</td></tr>
      <tr><td>units</td><td>Cantidad</td></tr>
      <tr><td>unit_cost_usd</td><td>Precio unitario en USD</td></tr>
      <tr><td>total</td><td>units × unit_cost_usd (calculado)</td></tr>
      <tr><td>url</td><td>URL de Alibaba/AliExpress/etc. (OBLIGATORIO)</td></tr>
      <tr><td>date</td><td>Fecha de consulta del precio</td></tr>
      <tr><td>screenshot</td><td>Nombre del archivo de captura en budget/screenshots/</td></tr>
    </table>
    <div class="alert-box">
      Siempre incluir una linea de envio e importacion estimado.<br>
      Los precios de Alibaba NO incluyen envio — el jurado atento lo nota.
    </div>
    <h3>Comandos</h3>
    <pre>python scripts/gen_budget.py       # genera budget.xlsx desde budget.json
python scripts/validate_budget.py  # verifica URLs, rango de precio</pre>
  `;
}

// ── SECCION: CANVAS ──────────────────────────────────────
function sectionCanvas(main) {
  main.innerHTML += `
    <p>El canvas se genera desde <code>brief.json</code> y <code>research/competitors.md</code>.</p>
    <pre>python scripts/gen_canvas.py</pre>
    <div class="alert-box">
      Verificar que:<br>
      · Propuesta de valor coincida con Acto II del video y seccion Solucion del pautado<br>
      · Estructura de costos coincida con budget.xlsx<br>
      · Segmentos coincidan con el municipio/beneficiarios del brief
    </div>
  `;
}

// ── SECCION: BIBLIOGRAFIA ───────────────────────────────
function sectionBibliography(main) {
  main.innerHTML += `
    <p>Se genera automaticamente desde <code>research/claims.json</code> en formato APA 7.</p>
    <p>Incluye automaticamente la cita de las IAs utilizadas.</p>
    <pre>python scripts/gen_bibliography.py</pre>
    <div class="info-box">
      Recordatorio Rally Latam: "Referencias" y "Propuestas descartadas" son las secciones
      que mas equipos olvidan. Generan puntos diferenciadores faciles.
    </div>
  `;
}

// ── SECCION: GUION ──────────────────────────────────────
function sectionScript(main) {
  main.innerHTML += `
    <h3>Estructura 4 actos — 120 segundos totales</h3>
    <table>
      <tr><th>Acto</th><th>Tiempo</th><th>Funcion</th><th>Rubrica</th></tr>
      <tr>
        <td><strong>I</strong></td><td>0:00–0:20</td>
        <td>Estadistica critica + beneficiario afectado. SIN nombre del proyecto ni logo.</td>
        <td>Impacto, Calidad</td>
      </tr>
      <tr>
        <td><strong>II</strong></td><td>0:20–1:00</td>
        <td>Bautizo del proyecto + arquitectura tecnica (3D/CAD/UI). Mecanismo fisico visible.</td>
        <td>Innovacion, Viabilidad</td>
      </tr>
      <tr>
        <td><strong>III</strong></td><td>1:00–1:35</td>
        <td>Costo unitario, quien paga, economia circular, actores institucionales.</td>
        <td>Prefactibilidad</td>
      </tr>
      <tr>
        <td><strong>IV</strong></td><td>1:35–2:00</td>
        <td>3 metricas auditables + ODS + cierre con beneficiario del Acto I transformado.</td>
        <td>Todos x 5</td>
      </tr>
    </table>
    <h3>Palabras objetivo: 230–280 palabras (ritmo ~135 ppm)</h3>
    <h3>Comandos</h3>
    <pre>python scripts/gen_script.py   # genera script.md y shotlist.csv
python scripts/gen_voice.py    # genera narration.mp3 desde narration.txt</pre>
    <div class="info-box">
      Modo ${(brief.rally_type||"—").toUpperCase()}:<br>
      ${brief.rally_type === "latam"
        ? "El municipio es el laboratorio piloto. Cierre: replicable en toda LATAM. Costos en USD."
        : `Anclar a ${brief.city || "municipio"}. Plan Nacional eje: ${brief.national_plan_axis || "—"}. ODS animados.`}
    </div>
  `;
}

// ── SECCION: RECURSOS ────────────────────────────────────
function sectionAssets(main) {
  const dtype = brief.deliverable_type || "none";
  main.innerHTML += `
    <h3>Tipo de entregable: <strong>${dtype.toUpperCase()}</strong></h3>
    ${dtype === "3d" || dtype === "both" ? `
      <h3>Pipeline 3D (Blender)</h3>
      <div class="info-box">
        Antes de modelar: genera imagen conceptual con ChatGPT usando la paleta del proyecto.<br>
        Esa imagen es la referencia — el modelo debe coincidir con ella.<br>
        Usa assets CC0: Poly Haven (HDRI+texturas), ambientCG (PBR), Quaternius (modelos).
      </div>
      <div class="alert-box">
        Un proceso GPU a la vez. Boceto primero (EEVEE), final al ultimo (Cycles + denoise).
        Avisa cuando el render comience: puede durar hasta T-1h o mas.
      </div>
    ` : ""}
    ${dtype === "web" || dtype === "both" ? `
      <h3>Web Demo</h3>
      <div class="info-box">
        La web nunca se presenta al publico — es un recurso visual para el video.<br>
        Debe mostrar datos con iconos propios (SVG, paleta del proyecto).<br>
        Los datos simulados deben marcarse con [SIMULADO] en el HTML.
      </div>
    ` : ""}
    <h3>Nombramiento de archivos</h3>
    <pre>asset_A1_dato_estadistica.png
asset_A2_render_3d_frontal.glb
asset_A3_tabla_costos.svg
asset_A4_ods_animacion.mp4</pre>
    <p>El ID corresponde al acto en shotlist.csv.</p>
  `;
}

// ── SECCION: RELOJ ────────────────────────────────────────
function sectionClock(main) {
  main.innerHTML += `
    <h3>Tiempo restante configurado en brief.json: <strong>${brief.hours_remaining || "—"} horas</strong></h3>
    <p>El reloj del topbar cuenta desde que se carga el dashboard.</p>
    <p>Para el reloj de terminal (con alertas en consola):</p>
    <pre>python scripts/rally_clock.py</pre>
    <h3>Alertas programadas</h3>
    <table>
      <tr><th>Tiempo</th><th>Accion recomendada</th></tr>
      <tr><td>T-6h</td><td>Congela investigacion. Claims.json debe estar completo.</td></tr>
      <tr><td>T-4h</td><td>Pautado y presupuesto listos. Inicia renders en boceto.</td></tr>
      <tr><td>T-3h</td><td>Guion final revisado. Graba web demo con Playwright.</td></tr>
      <tr><td>T-2h</td><td>Render calidad MEDIA. Exporta GLB para la web.</td></tr>
      <tr><td>T-1h</td><td>Exportacion final del video. Verifica subtitulos y audio.</td></tr>
      <tr><td>T-30min</td><td>CONGELA TODO. Solo exportacion y subida a SIRLI/YouTube.</td></tr>
    </table>
    <h3>Monitor de recursos</h3>
    <pre>python scripts/render_watch.py   # muestra RAM/CPU cada 30s, pausa si RAM > 85%</pre>
  `;
}

// ── SECCION: PUBLICAR ────────────────────────────────────
function sectionPublish(main) {
  main.innerHTML += `
    <h3>Checklist SIRLI</h3>
    <table>
      <tr><th>Entregable</th><th>Estado</th></tr>
      <tr><td>Video en YouTube (≤ 120s)</td><td>${brief.video_url ? "URL: " + brief.video_url : "Pendiente"}</td></tr>
      <tr><td>Reporte pautado (PDF)</td><td>Pendiente</td></tr>
      <tr><td>Video TikTok (solo Latam)</td><td>${brief.rally_type === "latam" ? "Pendiente" : "No aplica (Nacional)"}</td></tr>
    </table>
    <h3>Web demo</h3>
    <p>${brief.site_url ? "URL: " + brief.site_url : "Pendiente — ejecuta:"}</p>
    <pre>python scripts/publish_site.py   # Netlify CLI
# o haz push a main para GitHub Pages automatico</pre>
    <h3>Pasos finales</h3>
    <pre>python scripts/validate_brief.py   # confirmar que todo esta OK
python scripts/validate_budget.py  # URLs y rango de precio
python scripts/validate_pautado.py # limites de caracteres</pre>
    <div class="alert-box">
      El procesamiento de YouTube puede tardar 15–30 min despues de subir.<br>
      Sube el video al menos 45 min antes del cierre para tener tiempo de verificar.
    </div>
  `;
}

// ── ARRANCAR ──────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", init);
