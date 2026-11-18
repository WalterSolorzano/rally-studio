// dashboard/app_video.js -- Rally Studio: Estudio de Video, guion y prototipo.
//
// Se separo de app.js (8.9k lineas) porque es un bloque cerrado: plan de tomas,
// galeria de recursos, voz, guion, teleprompter, prototipo y cronograma.
// Se carga DESPUES de app.js: los presets de voz leen SVG, PAUTADO_LIMITS y
// RALLY_PROFILES al construirse. La logica no se toco, solo cambio de archivo.

// ── ESTUDIO DE VIDEO · plan de tomas + galería de recursos (flujo editora) ──
const DEFAULT_SHOT_PLAN = [
  { id: "a1_broll", acto: "Acto I", label: "B-roll del problema en campo o mercado (2–3 tomas)" },
  { id: "a1_ctx", acto: "Acto I", label: "Fotos de contexto con autorización de las personas" },
  { id: "a2_demo", acto: "Acto II", label: "Demostración de la maqueta o dispositivo en uso" },
  { id: "a3_dash", acto: "Acto III", label: "Capturas del dashboard / telemetría en vivo" },
  { id: "a3_par", acto: "Acto III", label: "Pivotes y toma de proveedor con costo real" },
  { id: "a4_crew", acto: "Acto IV", label: "Cierre con equipo completo en la entrada del campus" },
  { id: "branding", acto: "Extras", label: "Emblema y logos oficiales en máxima resolución" },
  { id: "audio_vo", acto: "Extras", label: "Locución de respaldo o pista de voz (MP4 con audio AAC)" },
  { id: "proto", acto: "Extras", label: "Prototipo web generado (captura en vivo del HTML)" }
];

let _assetUploadActo = "Extras";

function getVideoAssets() {
  state.video_assets = state.video_assets || { plan_done: [], items: [] };
  if (!Array.isArray(state.video_assets.plan_done)) state.video_assets.plan_done = [];
  if (!Array.isArray(state.video_assets.items)) state.video_assets.items = [];
  return state.video_assets;
}

function toggleShotPlan(id) {
  const va = getVideoAssets();
  va.plan_done = va.plan_done.includes(id) ? va.plan_done.filter(x => x !== id) : [...va.plan_done, id];
  saveState();
  broadcastFieldChange("video_assets", "state", va);
  renderTab("resources");
}

function setAssetUploadActo(val) {
  _assetUploadActo = val;
  const box = document.getElementById("video-studio-body");
  if (box) box.innerHTML = renderVideoStudio();
}

// Nombra la pieza como propuesta del acto que eligió el equipo. Si ya viene
// nombrada desde la IA (asset_<shotlist_id>[_pN]_...), se respeta.
function assetNombrePropuesta(name, va, acto) {
  const limpio = String(name || "recurso").replace(/[^\w.\-]+/g, "_");
  if (/^asset_[a-z0-9]+(_p\d+)?_/i.test(limpio)) return limpio;
  const ext = (limpio.match(/\.[a-z0-9]+$/i) || [""])[0];
  const desc = limpio.slice(0, limpio.length - ext.length) || "recurso";
  const nivel = (acto || "plan").replace(/[^\w]/g, "").toLowerCase();
  const hermanas = va.items.filter(it => /^asset_/i.test(it.name) && it.acto === acto).length;
  return `asset_${nivel}_p${hermanas + 1}_${desc}${ext}`;
}

async function uploadVideoAssets(inputEl) {
  const files = Array.from(inputEl.files || []);
  inputEl.value = "";
  if (!files.length) return;
  const actoEl = document.getElementById("video-upload-acto");
  const acto = actoEl ? actoEl.value : _assetUploadActo;
  showToast(`Subiendo ${files.length} recurso(s) al servidor de la bóveda…`);
  const va = getVideoAssets();
  for (const file of files) {
    try {
      const nombre = assetNombrePropuesta(file.name, va, acto);
      const resp = await fetch("/api/asset-upload", {
        method: "POST",
        headers: {
          "Content-Type": "application/octet-stream",
          "X-Asset-Name": encodeURIComponent(nombre),
          "X-Asset-Acto": encodeURIComponent(acto)
        },
        body: file
      });
      const data = await resp.json();
      if (data.status === "ok") {
        va.items.push({
          id: data.id, name: nombre, size: file.size, type: file.type || "",
          acto, owner: currentClientMascot.name, ts: data.timestamp,
          url: data.url
        });
      } else {
        showToast(`No se pudo subir ${nombre}. Isla del servidor activa?`, true);
      }
    } catch (e) {
      showToast(`No se pudo subir ${file.name} (servidor apagado).`, true);
    }
  }
  saveState();
  broadcastFieldChange("video_assets", "state", va);
  renderTab("resources");
  showToast("Recursos listos en la galería. La editora ya los ve.");
}

function deleteVideoAsset(id) {
  const va = getVideoAssets();
  va.items = va.items.filter(it => it.id !== id);
  if (va.approved) { Object.keys(va.approved).forEach(k => { if (va.approved[k] === id) delete va.approved[k]; }); }
  if (va.feedback) delete va.feedback[id];
  saveState();
  broadcastFieldChange("video_assets", "state", va);
  fetch("/api/asset-delete", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
  renderTab("resources");
}

// Un mismo plano puede tener varias propuestas: se agrupan por el shotlist_id
// del nombre (asset_<shotlist_id>_<propuesta>_<descripcion>.<ext>).
function assetBase(name) {
  const n = String(name || "").replace(/\.[a-z0-9]+$/i, "");
  const m = n.match(/^asset_([a-z0-9]+)(?:_p\d+)?_/i);
  return (m ? m[1] : n).toLowerCase();
}

function assetAprobada(va, it) {
  const aprob = va.approved || {};
  return aprob[assetBase(it.name)] === it.id;
}

function approveVideoAsset(id) {
  const va = getVideoAssets();
  if (!va.approved || typeof va.approved !== "object") va.approved = {};
  const it = va.items.find(x => x.id === id);
  if (!it) return;
  const base = assetBase(it.name);
  if (va.approved[base] === id) delete va.approved[base];
  else va.approved[base] = id;
  saveState();
  broadcastFieldChange("video_assets", "state", va);
  renderTab("resources");
}

// El feedback del equipo se convierte en el encargo exacto para la IA que
// rehace la pieza. Nunca toca el recurso aprobado: se copia y se manda fuera.
async function pedirCambioIA(id) {
  const va = getVideoAssets();
  const it = va.items.find(x => x.id === id);
  const caja = document.getElementById("fbc-" + id);
  const nota = document.getElementById("fb-" + id);
  if (!it || !caja) return;
  const texto = (nota ? nota.value : (va.feedback && va.feedback[id]) || "").trim();
  if (!texto) {
    showToast("Escribe primero qué cambia y qué se queda.", true);
    return;
  }
  if (!va.feedback || typeof va.feedback !== "object") va.feedback = {};
  va.feedback[id] = texto;
  saveState();
  caja.style.display = "block";
  caja.innerHTML = `<p class="bu-note is-info" id="fbc-msg-${id}">Redactando el encargo para la IA…</p>`;
  const prompt = `Actúa como director de arte del video del equipo.
Proyecto: "${state.project_name || state.challenge_title || "el proyecto"}".
Recurso: ${it.name} (acto ${it.acto}).
Lo que el equipo pide: ${texto}
Devuelve SOLO el encargo para la IA que genera la pieza, en tres líneas: 1) qué se conserva, 2) qué cambia, 3) formato de salida (PNG cuadrado o render de Blender). Sin explicaciones, sin markdown.`;
  await _runAIJob("asset-" + id, prompt, {
    onNoProvider: (data) => {
      const m = document.getElementById(`fbc-msg-${id}`);
      if (m) m.textContent = _aiStatusMessage(data);
    },
    boxTick: (t) => {
      const m = document.getElementById(`fbc-msg-${id}`);
      if (m) m.textContent = t || "";
    },
    onFinish: (final) => {
      const out = String((final && final.text) || "").trim();
      if (!out || !caja) return;
      va.encargos = va.encargos || {};
      va.encargos[id] = out;
      saveState();
      caja.innerHTML = `<p class="bu-note is-info">${escapeHtml(out)}</p>`
        + `<button class="btn-secondary" style="font-size:11px; padding:3px 8px;" onclick="copiarEncargo('${id}')">Copiar el encargo</button>`;
    }
  });
}

function copiarEncargo(id) {
  const va = getVideoAssets();
  const texto = (va.encargos && va.encargos[id]) || "";
  if (!texto) return;
  navigator.clipboard.writeText(texto)
    .then(() => showToast("Encargo copiado. Pégalo en la IA de imágenes o de 3D."))
    .catch(() => showToast("No se pudo copiar el encargo.", true));
}

function saveAssetFeedback(id) {
  const va = getVideoAssets();
  const box = document.getElementById(`fb-${id}`);
  if (!va.feedback || typeof va.feedback !== "object") va.feedback = {};
  const texto = box ? box.value.trim() : "";
  if (texto) va.feedback[id] = texto; else delete va.feedback[id];
  saveState();
  broadcastFieldChange("video_assets", "state", va);
  showToast(texto ? "Retroalimentación guardada con el recurso." : "Retroalimentación borrada.");
  renderTab("resources");
}

function downloadAsset(url, name) {
  const a = document.createElement("a");
  a.href = url; a.download = name; document.body.appendChild(a); a.click();
  a.remove();
}

function renderVideoStudio() {
  const va = getVideoAssets();
  const planRows = DEFAULT_SHOT_PLAN.map(p => {
    const done = va.plan_done.includes(p.id);
    return `
      <label class="shot-plan-row ${done ? "done" : ""}" style="padding:8px 0; display:flex; gap:10px; align-items:flex-start; border-bottom:1px solid var(--border-light); cursor:pointer;">
        <input type="checkbox" ${done ? "checked" : ""} onchange="toggleShotPlan('${p.id}')" style="margin-top:2px; accent-color:var(--color-primary);">
        <span style="font-size:12px; ${done ? "color:var(--color-primary); font-weight:600;" : "color:var(--text-main);"} font-family:var(--font-ui);">
          <span style="font-family:var(--font-mono); font-size:11px; color:var(--text-muted); margin-right:6px;">${p.acto}</span>${p.label}
        </span>
      </label>`;
  }).join("");
  const doneCount = va.plan_done.length;
  const pct = Math.round((doneCount / DEFAULT_SHOT_PLAN.length) * 100);

  const itemGroups = {};
  va.items.forEach(it => { (itemGroups[it.acto] = itemGroups[it.acto] || []).push(it); });
  const order = [...DEFAULT_SHOT_PLAN.map(p => p.acto)].filter((g, i, a) => a.indexOf(g) === i);
  Object.keys(itemGroups).forEach(g => { if (!order.includes(g)) order.push(g); });

  const gal = order.filter(acto => itemGroups[acto]).map(acto => {
    const items = itemGroups[acto].slice().reverse();
    return `
      <div style="margin-bottom:14px;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin:10px 0 6px 0; border-bottom:1px solid var(--border-light); padding-bottom:4px;">
          <span style="font-size:11px; font-weight:800; letter-spacing:0.05em; color:var(--text-muted); ">${acto} · ${items.length} recurso(s) · ${items.filter(x => assetAprobada(va, x)).length} aprobado(s)</span>
        </div>
        <div class="asset-grid">
          ${items.map(it => {
            const kb = it.size > 1048576 ? `${(it.size / 1048576).toFixed(1)} MB` : `${Math.round(it.size / 1024)} KB`;
            let thumb = "";
            if ((it.type || "").startsWith("image/")) thumb = `<img class="asset-thumb" src="${it.url}" loading="lazy" alt="">`;
            else if ((it.type || "").startsWith("video/")) thumb = `<video class="asset-thumb" src="${it.url}" controls preload="metadata" muted></video>`;
            else if ((it.type || "").startsWith("audio/")) thumb = `<div class="asset-thumb asset-thumb-fallback"><div style="font-size:11px; font-weight:700; color:var(--text-muted);">AUDIO</div><audio src="${it.url}" controls style="width:90%;"></audio></div>`;
            else thumb = `<div class="asset-thumb asset-thumb-fallback"><div style="font-size:11px; font-weight:700; color:var(--text-muted); ">${kb}</div></div>`;
            return `
              <div class="asset-card">
                ${thumb}
                <div style="padding:7px 9px;">
                  <div style="font-size:11px; font-weight:700; color:var(--text-main); word-break:break-all; line-height:1.3;">${it.name}</div>
                  <div style="font-size:11px; color:var(--text-muted); margin-top:3px; font-family:var(--font-mono);">${kb} · ${currentClientMascot && it.owner === currentClientMascot.name ? "tuyo" : it.owner}</div>
                  <div style="display:flex; align-items:center; justify-content:space-between; gap:6px; margin-top:5px;">
                    <span class="src-chip ${assetAprobada(va, it) ? "" : "is-empty"}">${assetAprobada(va, it) ? "Aprobada" : "Propuesta"}</span>
                    <button class="link-quiet" onclick="approveVideoAsset('${it.id}')">${assetAprobada(va, it) ? "Quitar" : "Aprobar"}</button>
                  </div>
                  <div style="display:flex; gap:6px; margin-top:6px;">
                    <button class="btn-secondary" style="font-size:11px; padding:3px 8px;" onclick="downloadAsset('${it.url}','${it.name.replace(/'/g, "\\'")}')">${SVG.download || "⬇"} Original</button>
                    <button class="btn-secondary" style="font-size:11px; padding:3px 8px; color:var(--status-err-text);" onclick="deleteVideoAsset('${it.id}')">Quitar</button>
                  </div>
                  <details class="di-fold" style="margin-top:6px;">
                    <summary>Retroalimentación</summary>
                    <textarea id="fb-${it.id}" rows="2" placeholder="Qué cambia y qué se queda" aria-label="Retroalimentación de este recurso"
                      style="width:100%; margin-top:5px; font-size:11px; padding:5px 7px; border:1px solid var(--border-light); border-radius:5px;">${escapeHtml((va.feedback && va.feedback[it.id]) || "")}</textarea>
                    <div style="display:flex; gap:6px; margin-top:5px;">
                      <button class="btn-secondary" style="font-size:11px; padding:3px 8px;" onclick="saveAssetFeedback('${it.id}')">Guardar</button>
                      <button class="btn-secondary" style="font-size:11px; padding:3px 8px;" onclick="pedirCambioIA('${it.id}')">Pedir el cambio a la IA</button>
                    </div>
                    <div id="fbc-${it.id}" style="display:none; margin-top:6px;"></div>
                  </details>
                </div>
              </div>`;
          }).join("")}
          ${!items.length ? `<span style="font-size:11px; color:var(--text-muted);">Sin recursos todavía de este acto.</span>` : ""}
        </div>
      </div>`;
  }).join("");

  return `
    <details class="di-fold" style="margin:0 0 16px;">
      <summary style="font-size:12px; font-weight:700; color:var(--text-title);">Plan de tomas · ${DEFAULT_SHOT_PLAN.length} planos · ${doneCount} hechos</summary>
      <div style="margin-top:8px;">${planRows}</div>
    </details>

    <div class="video-studio-grid" style="display:grid; grid-template-columns:1fr; gap:22px;">
      <div>
        <div style="display:flex; gap:8px; align-items:center; margin-bottom:8px;">
          <label class="btn-secondary" style="cursor:pointer; font-size:11px; display:inline-flex; align-items:center; gap:6px;">
            ${SVG.upload} Subir toma / recurso
            <input type="file" multiple accept="video/*,image/*,audio/*" style="display:none;" onchange="uploadVideoAssets(this)">
          </label>
          <select id="video-upload-acto" aria-label="Acto del video al que pertenece el recurso" onchange="setAssetUploadActo(this.value)" style="font-size:11px; padding:4px 8px; border:1px solid var(--border-light); border-radius:5px;">
            ${[... new Set(DEFAULT_SHOT_PLAN.map(p => p.acto))].map(a => `<option value="${a}" ${a === _assetUploadActo ? "selected" : ""}>${a}</option>`).join("")}
          </select>
          <span style="font-size:11px; color:var(--text-muted);">Sube original sin recortar; la editora lo exporta a CapCut.</span>
        </div>
        ${gal}
      </div>
    </div>
  `;
}

function renderViewResources() {  return `
    <div class="phase-header" style="display:flex; justify-content:space-between; align-items:flex-end; flex-wrap:wrap; gap:14px; margin-bottom:8px; padding-bottom:14px; border-bottom:1px solid var(--border-light);">
      <div>
        <h1 class="phase-title">Recursos<span class="phase-title-accent"> y entregables</span></h1>
        <p class="phase-subtitle">Archivos para el video, enlaces del equipo y entregables oficiales en un solo lugar.</p>
      </div>
    </div>

    <div class="wb-section" id="video-studio">
      <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:14px; margin-bottom:4px;">
        <div>
          <h3 class="wb-section-title" style="margin:0;">Estudio de video</h3>
          <p class="wb-note" style="margin:3px 0 12px;">Cada integrante sube sus tomas; la editora las previsualiza y las descarga en calidad original.</p>
        </div>
        <span style="font-size:11px; font-weight:700; color:var(--color-primary); white-space:nowrap;" id="video-plan-badge"></span>
      </div>
      <div id="video-studio-body">${renderVideoStudio()}</div>
    </div>

    <div class="wb-section">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
        <div>
          <h3 class="wb-section-title">Ingesta por carpeta fuente</h3>
          <p class="wb-note">
            Documentos, patentes, actas previas e imágenes detectadas en el directorio de trabajo.
          </p>
        </div>
        <button class="btn-secondary" onclick="scanFolderSources()" id="btn-scan-sources" style="font-size:11px;">
          ${SVG.sync} Escanear
        </button>
      </div>
      <div id="sources-scan-container" class="src-scan">
        <span class="src-scan-idle">Sin escanear todavía. Pulsa Escanear para listar lo que hay en la carpeta.</span>
      </div>
    </div>

    <div class="wb-section">
      <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px; margin-bottom:12px;">
        <h3 class="wb-section-title" style="margin:0;">Enlaces del equipo</h3>
        <button class="btn-primary" onclick="saveTeamHubLinks()" style="font-size:11px; padding:6px 12px;">Guardar enlaces</button>
      </div>
      <div class="form-grid">
        <div class="form-group full">
          <label>Google Drive · videos crudos, fotos y audios</label>
          <div style="display:flex; gap:8px;">
            <input type="url" id="hub-drive-url" aria-label="URL de la carpeta oficial de Google Drive" value="${state.google_drive_url}" style="flex:1;">
            <a href="${state.google_drive_url}" target="_blank" class="btn-secondary" style="text-decoration:none; display:inline-flex; align-items:center; gap:4px;">Abrir Drive ${SVG.external}</a>
          </div>
        </div>
        <div class="form-group full">
          <label>Canva · láminas, diapositivas y overlays</label>
          <div style="display:flex; gap:8px;">
            <input type="url" id="hub-canva-url" aria-label="URL del espacio de trabajo Canva" value="${state.canva_url}" style="flex:1;">
            <a href="${state.canva_url}" target="_blank" class="btn-secondary" style="text-decoration:none; display:inline-flex; align-items:center; gap:4px;">Abrir Canva ${SVG.external}</a>
          </div>
        </div>
      </div>
    </div>

    <div class="wb-section">
      <h3 class="wb-section-title">Logos para el video</h3>
      <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(200px, 1fr)); gap:12px;">
        <div style="border:1px solid var(--border-light); padding:12px; border-radius:8px; background:var(--bg-surface); text-align:center;">
          <div style="height:48px; display:flex; align-items:center; justify-content:center; gap:8px;">
            <img src="assets/logo_uni_official.png" style="max-height:44px; max-width:100px; object-fit:contain;" alt="Universidad Nacional de Ingeniería">
          </div>
          <strong style="font-size:11px; display:block;">Logo institucional</strong>
          <span style="font-size:11px; color:var(--text-muted);">${state.university || 'Universidad'}</span>
        </div>

        <div style="border:1px solid var(--border-light); padding:12px; border-radius:8px; background:var(--bg-surface); text-align:center;">
          <div style="height:48px; display:flex; align-items:center; justify-content:center; gap:8px;">
            <img src="${state.rally_type === 'latam' ? 'assets/logo_rally_latam.png' : 'assets/logo_rally_nacional.png'}" style="max-height:44px; max-width:140px; object-fit:contain;" alt="Rally Oficial">
          </div>
          <strong style="font-size:11px; display:block;">Logo del evento</strong>
          <span style="font-size:11px; color:var(--text-muted);">${state.rally_type === 'latam' ? 'Edición continental (28 h)' : 'Nacional (24 h)'}</span>
        </div>

        <div style="border:1px solid var(--border-light); padding:12px; border-radius:8px; background:var(--bg-surface); text-align:center;">
          <div style="height:48px; display:flex; align-items:center; justify-content:center; color:var(--text-main); font-weight:800; font-size:14px;">
            ${state.team_logo_img ? `<img src="${state.team_logo_img}" style="max-height:44px; max-width:120px; object-fit:contain;" alt="Logo Equipo">` : `${SVG.spark} ${state.team_name || 'EQUIPO'}`}
          </div>
          <strong style="font-size:11px; display:block;">Emblema de Equipo</strong>
          <span style="font-size:11px; color:var(--text-muted);">${state.team_name || 'Nombre de Equipo'}</span>
        </div>
      </div>
    </div>

    <div class="wb-section" id="entregables-ia">
      <h3 class="wb-section-title">Entregables generados</h3>
      <p class="wb-note">Descarga directa de cada archivo que produce el sistema.</p>
      <div class="table-responsive" style="margin-bottom:0;">
        <table class="data-table dl-table">
          <thead>
            <tr>
              <th>Documento / recurso</th>
              <th>Formato</th>
              <th>Uso en competencia</th>
              <th>Descarga</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Ficha de rodaje</strong></td>
              <td><code>.PDF</code></td>
              <td>Guion y plan de tomas para el equipo de grabación</td>
              <td><a href="entregables/guion_rodaje.pdf" target="_blank" rel="noopener" class="btn-secondary" style="padding:4px 8px; font-size:11px; text-decoration:none;">Abrir ↓</a></td>
            </tr>
            <tr>
              <td><strong>Teleprompter</strong></td>
              <td><code>HTML</code></td>
              <td>Texto a pantalla completa para grabar la locución</td>
              <td><a href="entregables/teleprompter.html" target="_blank" rel="noopener" class="btn-secondary" style="padding:4px 8px; font-size:11px; text-decoration:none;">Abrir ↓</a></td>
            </tr>
            <tr>
              <td><strong>Matriz de Deliberación de Retos</strong></td>
              <td><code>.DOCX</code></td>
              <td>Catálogo de retos + pronósticos WOW + tabla de votación</td>
              <td><a href="docs/Matriz_Seleccion_Desafios_2026.docx" download="Matriz_Seleccion_Desafios_2026.docx" class="btn-primary" style="padding:4px 8px; font-size:11px; text-decoration:none;">Descargar Word ↓</a></td>
            </tr>
            <tr>
              <td><strong>Documento Pautado Oficial</strong></td>
              <td><code>.DOCX</code></td>
              <td>5 secciones oficiales redactadas y validadas con límites de caracteres</td>
              <td><button type="button" class="btn-secondary" style="padding:4px 8px; font-size:11px;" onclick="compileAndDownloadDocx()">Compilar y descargar</button></td>
            </tr>
            <tr>
              <td><strong>Presupuesto Puesta en Marcha</strong></td>
              <td><code>.XLSX</code></td>
              <td>Compras de arranque y pago de quienes trabajan en el piloto</td>
              <td><a href="../budget/budget.xlsx" download class="btn-secondary" style="padding:4px 8px; font-size:11px; text-decoration:none;">Descargar Excel ↓</a></td>
            </tr>
            <tr>
              <td><strong>Shotlist para Editor de Video (120s)</strong></td>
              <td><code>.CSV</code></td>
              <td>Pauta para CapCut / Premiere con tiempos exactos y textos</td>
              <td><a href="../script/shotlist.csv" download class="btn-secondary" style="padding:4px 8px; font-size:11px; text-decoration:none;">Descargar CSV ↓</a></td>
            </tr>
            <tr>
              <td><strong>Locución Oficial</strong></td>
              <td><code>.MP4</code></td>
              <td>Pista de voz en MP4 con audio AAC, sin video, ≤120 segundos</td>
              <td><button type="button" class="btn-secondary" style="padding:4px 8px; font-size:11px;" onclick="handleNarrationDownload(event)">Descargar MP4 ↓</button></td>
            </tr>
            <tr>
              <td><strong>Guion de Locución Limpio</strong></td>
              <td><code>.TXT</code></td>
              <td>Texto continuo a 135 ppm para el locutor o motor TTS</td>
              <td><a href="../script/narration.txt" download class="btn-secondary" style="padding:4px 8px; font-size:11px; text-decoration:none;">Descargar TXT ↓</a></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function saveTeamHubLinks() {
  const drive = document.getElementById("hub-drive-url");
  const canva = document.getElementById("hub-canva-url");
  if (drive) state.google_drive_url = drive.value.trim();
  if (canva) state.canva_url = canva.value.trim();
  saveState();
  showToast("Enlaces de equipo guardados correctamente");
}

function scanFolderSources() {
  const cont = document.getElementById("sources-scan-container");
  if (cont) cont.innerHTML = `<span style="font-size:11px; color:var(--color-primary);">Escaneando directorio de proyecto y boveda...</span>`;
  
  fetch("/api/scan-sources")
    .then(r => r.json())
    .then(data => {
      if (!cont) return;
      if (!data.sources || data.sources.length === 0) {
        cont.innerHTML = `<span style="font-size:11px; color:var(--text-muted);">No se detectaron archivos fuente adicionales en la carpeta.</span>`;
        return;
      }
      cont.innerHTML = `
        <div style="display:flex; flex-direction:column; gap:6px;">
          ${data.sources.map(s => `
            <div style="display:flex; justify-content:space-between; align-items:center; background:var(--bg-surface); padding:6px 10px; border-radius:4px; border:1px solid var(--border-light);">
              <div style="display:flex; align-items:center; gap:6px; overflow:hidden;">
                <span class="badge-status badge-ok" style="font-size:11px;">${escapeHtml(String(s.category || "").toUpperCase())}</span>
                <span style="font-size:11px; font-weight:600; color:var(--text-main); white-space:nowrap; text-overflow:ellipsis; overflow:hidden;" title="${escapeHtml(s.path)}">
                  ${escapeHtml(s.name)}
                </span>
              </div>
              <span style="font-family:var(--font-mono); font-size:11px; color:var(--text-muted); font-variant-numeric:tabular-nums;">
                ${(s.size / 1024).toFixed(1)} KB
              </span>
            </div>
          `).join("")}
        </div>
      `;
      showToast(`Escaneo completado: ${data.total} recursos detectados`);
    })
    .catch(() => {
      if (cont) cont.innerHTML = `<span style="font-size:11px; color:var(--status-err-text);">No fue posible contactar el servicio de escaneo local.</span>`;
    });
}

// ═════════════════════════════════════════════════════════════════════════════
// 08 MODELO CANVAS
// ═════════════════════════════════════════════════════════════════════════════
function escapeHtml(text) {
  // Implementación única en `escape.js` (cargado antes que este archivo).
  return window.RallyEsc.esc(text);
}
// Plantillas preestablecidas de Canvas (solo cambian la guía por casilla; los datos del equipo se conservan)
const CANVAS_PRESETS = [
  {
    id: "sirli",
    name: "Oficial SIRLI (Rally Latam)",
    hints: {
      socios: "¿Quién te apoya en el territorio? Aliados institucionales, proveedores, cooperativas.",
      actividades: "¿Qué haces físicamente? Fabricación, instalación, calibración, capacitación.",
      propuesta: "La única oración que justifica el proyecto: tecnología + dolor resuelto + número.",
      relaciones: "¿Cómo acompaña al usuario? Presencial, soporte remoto, monitoreo continuo.",
      segmentos: "¿Quién sufre el problema exactamente? Cifra del segmento y ubicación.",
      recursos: "¿Qué necesitas tener? Hardware, firmware, laboratorio, equipo multidisciplinario.",
      canales: "¿Por donde llega la solución? Red comunitaria, app, alertas, visitas.",
      costes: "Qué se compra para arrancar y a quién se le paga. Compras y salarios, nada técnico.",
      ingresos: "¿Quién paga y cómo? Fondos de cooperación, presupuesto municipal, tarifas."
    }
  },
  {
    id: "lean",
    name: "Lean Canvas (validación rápida)",
    hints: {
      problemas: null,
      socios: "Aliados clave para validar rapido el piloto.",
      actividades: "Las 3 acciones que validan o tumban la tesis.",
      propuesta: "Factor diferenciador unico frente a soluciones existentes.",
      relaciones: "Como mides satisfaccion en campo (entrevistas, metricas).",
      segmentos: "Nicho inicial minimo viable y stakeholders.",
      recursos: "Recursos criticos del experimento (minimo necesarios).",
      canales: "Ruta mas corta al usuario real.",
      costes: "Costo por experimento y costo del piloto completo.",
      ingresos: "Modelo de financiamiento del piloto y escala."
    }
  },
  {
    id: "pitch",
    name: "Canvas de Pitch (video 120s)",
    hints: {
      socios: "Acto II: mencionar al aliado que da credibilidad.",
      actividades: "Acto II: demostracion en vivo de 40 segundos.",
      propuesta: "Acto I: frase de dolor humano con cifra del territorio.",
      relaciones: "Acto IV: evidencia social (ODS, comunidad).",
      segmentos: "Acto I: beneficiarios concretos con nombre del sector.",
      recursos: "Acto III: presupuesto exacto y hardware real.",
      canales: "Acto IV: donde ver la demo y quien lo acompana.",
      costes: "Acto III: cifras de prefactibilidad ($4k-$6k USD piloto).",
      ingresos: "Acto IV: frase memorable de cierre inspirador."
    }
  },
  {
    id: "uso",
    name: "Infraestructura por uso (app / web)",
    hints: {
      socios: "¿Quién ofrece la infraestructura que alquilas? Proveedores de hosting, pasarelas de pago, servicios de mensajería.",
      actividades: "¿Qué haces con tus propias manos? Código, diseño, capacitación. Lo que ya existe se contrata.",
      propuesta: "Qué problema se resuelve en una oración, con precio de uso por año: tecnología + dolor + costo anual.",
      relaciones: "Cómo se relaciona el usuario con la app: soporte dentro de la app, membresía, acompañamiento.",
      segmentos: "¿Quién se suscribe? Nombre del segmento y cuánto paga hoy por resolverlo.",
      recursos: "Mínimo propio: código, dominio, identidad. La infraestructura de cómputo se paga por uso.",
      canales: "Dónde vive y a través de qué canal se suscribe (web, app store, WhatsApp).",
      costes: "Gastos que se pagan cada año: membresías de servicios y planes por uso, no solo el día uno.",
      ingresos: "Membresía anual o plan por uso. Precio creíble: ni de regalo ni inflado; anotar el plan real del proveedor."
    }
  },
  {
    id: "ods",
    name: "Canvas de Impacto ODS",
    hints: {
      socios: "Socio institucional que pone el territorio, y aliado técnico que financia o acompaña.",
      actividades: "Las 3 acciones que producen cambio visible en el territorio.",
      propuesta: "Qué mejora, para quién, y por cuánto (cifra del problema). Un ODS protagonista.",
      relaciones: "Cómo se apropia la comunidad: talleres, acompañamiento, lenguaje simple.",
      segmentos: "Beneficiarios con nombre y lugar; cifra citable del segmento.",
      recursos: "Equipo local, hardware real y alianzas. Sin listas de deseos.",
      canales: "Con quién llega primero: gobierno local, escuela, centro comunal.",
      costes: "Costos de implementación del piloto con enlace de respaldo por partida.",
      ingresos: "Quién sostiene después del rally: presupuesto municipal, cooperación, tarifa simbólica."
    }
  }
];

function getCurrentCanvasPresetId() {
  const valid = CANVAS_PRESETS.map(p => p.id);
  return valid.includes(state.canvas_preset) ? state.canvas_preset : "sirli";
}

// Mega-prompt: arma el contexto completo (brief + reto + solución + presupuesto + formato)
// para que otra IA haga su propuesta de canvas y el equipo la compare aquí.
function buildCanvasExternalPrompt() {
  const canvas = (state.model_canvas && typeof state.model_canvas === "object") ? state.model_canvas : {};
  const bctxC = budgetCurrency();
  const budgetLine = (Array.isArray(state.budget) && state.budget.length ? state.budget : [])
    .slice(0, 12)
    .map(b => `- ${b.concept || b.element || "?"}: ${b.units || 1} × ${b.unit_cost || 0} ${bctxC.symbol} (${b.url || "sin enlace"})`)
    .join("\n") || "Sin partidas todavía.";
  const claimsLine = (Array.isArray(state.claims) && state.claims.length ? state.claims : [])
    .slice(0, 5)
    .map(c => `- "${c.stat}" (${c.source}, ${c.year})`)
    .join("\n") || "Sin cifras citables todavía.";
  const preset = CANVAS_PRESETS.find(p => p.id === getCurrentCanvasPresetId()) || CANVAS_PRESETS[0];
  return `Actúa como asesor de modelo de negocio para un proyecto de rally de innovación.

CONTEXTO
- Certamen: ${state.rally_type === "latam" ? "Rally Latinoamericano 28h (presupuesto en USD, replicable en LATAM)" : state.rally_type === "nacional" ? "Rally Nacional Nicaragüa 24h (presupuesto en córdobas, anclado al Plan Nacional)" : "certamen por definir"}
- Equipo: ${state.team_name || "(por definir)"} · ${state.university || "(sin universidad)"} · ${state.city || "(sin ciudad)"}
- Proyecto: ${state.project_name || "(sin nombre)"} — categoría ${state.category || "Innovación"}
- Reto ${state.challenge_id || "?"}: ${state.challenge_title || "por elegir"}
- Tesis de solución: ${state.solution_thesis || "por definir"}

CIFRAS CITABLES
${claimsLine}

PRESUPUESTO ACTUAL
${budgetLine}

LO QUE QUIERO
Propuesta para los 9 cuadrantes del Business Model Canvas (plantilla "${preset.name}"), en español simple, sin siglas y sin relleno:
Socios Clave · Actividades Clave · Propuesta de Valor · Relaciones · Segmentos · Recursos · Canales · Estructura de Costes · Fuentes de Ingresos.

REGLAS DE PRECIO
- Nada se construye desde cero si ya existe: se contrata por uso.
- Precios creíbles: ni locos ni regalados; si es digital, membresías anuales o planes por uso.
- Coherencia total con el presupuesto de arriba (mismos números).

Nuestro borrador (para que lo compares y lo mejores, no lo repitas):
${JSON.stringify(canvas, null, 2)}`;
}

function copyCanvasExternalPrompt() {
  copyToClipboardWithFeedback(buildCanvasExternalPrompt(), "Contexto copiado: pégalo en la otra IA y tráenos su propuesta.");
}

function canvasOnlineUrlChanged(val) {
  state.canvas_online_url = String(val || "").trim();
  saveState();
  renderTab("canvas");
}

// Enlace de "trabajo en línea" (Canva/Figma/Slides) reutilizable por pestaña.
function onlineUrlChanged(key, val) {
  state.delivery_links = (state.delivery_links && typeof state.delivery_links === "object") ? state.delivery_links : {};
  const v = String(val || "").trim();
  if (v) state.delivery_links[key] = v; else delete state.delivery_links[key];
  saveState();
  renderTab(activeTab);
}

function onlineLinkRow(key, placeholder, title) {
  const url = state.delivery_links && state.delivery_links[key] ? String(state.delivery_links[key]) : "";
  return `
    <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap; margin-top:10px; padding-top:10px; border-top:1px dashed var(--border-light);">
      <label style="font-size:11px; color:var(--text-muted); font-family:var(--font-mono); font-weight:700;">${title}</label>
      <input type="url" inputmode="url" placeholder="${escapeHtml(placeholder)}" value="${escapeHtml(url)}"
             onchange="onlineUrlChanged('${key}', this.value)"
             style="flex:1 1 260px; min-width:0; font-size:12px; padding:5px 9px; border:1px solid var(--border-light); border-radius:var(--radius-sm); background:var(--bg-surface); color:var(--text-body);">
      ${url ? `<a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer" class="btn-secondary" style="text-decoration:none; display:inline-flex; align-items:center; gap:4px; font-size:11px;">${SVG.external} Ver en línea</a>` : ""}
    </div>`;
}

function canvasPresetChanged(val) {
  state.canvas_preset = val;
  saveState();
  renderTab("canvas");
}

function populateCanvasCell(key, el) {
  const preset = CANVAS_PRESETS.find(p => p.id === getCurrentCanvasPresetId()) || CANVAS_PRESETS[0];
  const canvas = (state.model_canvas && typeof state.model_canvas === "object") ? state.model_canvas : {};
  const val = String(canvas[key] || "").trim();
  if (val) { el.textContent = val; el.classList.remove("is-empty"); }
  else { el.textContent = ""; el.classList.add("is-empty"); el.setAttribute("data-ph", preset.hints[key] || "Escribe aquí..."); }
}

function fitCanvasInput(el) {
  if (!el) return;
  el.style.flex = "0 0 auto";
  el.style.height = "auto";
  el.style.height = Math.max(46, el.scrollHeight) + "px";
}

function fitAllCanvasInputs() {
  document.querySelectorAll(".canvas-input").forEach(fitCanvasInput);
}

window.addEventListener("resize", () => {
  if (document.querySelector(".canvas-input")) fitAllCanvasInputs();
});

function handleCanvasCellInput(key, el) {
  el.classList.remove("is-empty");
  if (el.tagName === "TEXTAREA") fitCanvasInput(el);
  if (!state.model_canvas || typeof state.model_canvas !== "object") state.model_canvas = {};
  const raw = (el.tagName === "TEXTAREA" ? el.value : el.innerText) || "";
  const val = raw.replace(/\n{3,}/g, "\n\n").trim();
  if (val) state.model_canvas[key] = val; else delete state.model_canvas[key];
  saveState();
}

function resetCanvasToBase() {
  state.model_canvas = {};
  saveState();
  renderTab("canvas");
  showToast("Canvas restablecido a las guías base.");
}

function renderViewCanvas() {
  const preset = CANVAS_PRESETS.find(p => p.id === getCurrentCanvasPresetId()) || CANVAS_PRESETS[0];
  const canvas = (state.model_canvas && typeof state.model_canvas === "object") ? state.model_canvas : {};
  const hintOf = (key, fb) => {
    if (key === "propuesta" && String(canvas[key] || "").trim() === "" && state.solution_thesis) {
      return String(state.solution_thesis).slice(0, 160) + " — ajústala en tus palabras.";
    }
    return preset.hints && preset.hints[key] ? preset.hints[key] : fb;
  };
  const cells = [
    { n: 1, key: "socios", title: "Socios Clave", fallback: "Municipalidades locales, cooperativas de productores, proveedores de hardware." },
    { n: 2, key: "actividades", title: "Actividades Clave", fallback: "Fabricación modular, calibración en campo y talleres de adopción comunitaria." },
    { n: 3, key: "propuesta", title: "Propuesta de Valor", fallback: "La única oración que justifica el proyecto: tecnología + dolor resuelto + número." },
    { n: 4, key: "relaciones", title: "Relaciones con Clientes", fallback: "Acompañamiento presencial y monitoreo continuo." },
    { n: 5, key: "segmentos", title: "Segmentos de Clientes", fallback: "Comunidades rurales, pequeños productores y gobiernos locales." },
    { n: 6, key: "recursos", title: "Recursos Clave", fallback: "Diseño de ingeniería abierto, sensores de bajo costo y firmware eficiente." },
    { n: 7, key: "canales", title: "Canales", fallback: "Red comunitaria directa, paneles de control y alertas locales." },
    { n: 8, key: "costes", title: "Estructura de Costes", fallback: "Adquisición de componentes mayoristas, ensamblaje y logística de campo." },
    { n: 9, key: "ingresos", title: "Fuentes de Ingresos", fallback: "Fondos de cooperación, presupuesto municipal de inversión y tarifas de servicio." }
  ];
  const isDefaultCell = (cell) => String(canvas[cell.key] || "").trim() === "";
  return `
    <div class="phase-header">
      <div>
        <h1 class="phase-title">Modelo de negocio <span class="phase-title-accent">Canvas</span></h1>
        <p class="phase-subtitle">Nueve cuadrantes que se guardan solos. Los vacíos muestran la pregunta que deben responder.</p>
      </div>
      <div class="canvas-tools">
        <select onchange="canvasPresetChanged(this.value)" class="canvas-preset" aria-label="Plantilla de modelo de negocio">
          ${CANVAS_PRESETS.map(p => `<option value="${p.id}" ${p.id === getCurrentCanvasPresetId() ? "selected" : ""}>${p.name}</option>`).join("")}
        </select>
        <button class="btn-secondary" onclick="copyCanvasExternalPrompt()" title="Copia brief, reto, cifras y presupuesto para que otra IA escriba el canvas completo">
          ${SVG.copy} Contexto para IA
        </button>
        <button class="btn-secondary" onclick="resetCanvasToBase()" title="Vacía los nueve cuadrantes">Restablecer</button>
        <a href="../docs/canvas.md" download class="btn-secondary" style="text-decoration:none; display:inline-flex; align-items:center; gap:4px;">
          ${SVG.download} Markdown
        </a>
      </div>
    </div>

    <div class="canvas-board">
      ${cells.map(cell => `
        <div class="canvas-slot canvas-slot-${cell.key}">
          <label class="canvas-slot-label" for="cv-${cell.key}">
            ${cell.title}
          </label>
          <textarea id="cv-${cell.key}" class="canvas-input${isDefaultCell(cell) ? " is-empty" : ""}" rows="3" spellcheck="false"
            placeholder="${escapeHtml(hintOf(cell.key, cell.fallback))}"
            oninput="handleCanvasCellInput('${cell.key}', this)">${escapeHtml(String(canvas[cell.key] || "").trim())}</textarea>
          <div style="margin-top:4px;">${aiEditPanel("canvas:" + cell.key)}</div>
          ${cell.key === "costes" ? `<button class="link-quiet" onclick="switchTab('budget')">Ver las partidas del presupuesto</button>` : ""}
        </div>
      `).join("")}
    </div>

    <div class="canvas-foot">
      <label class="canvas-foot-label" for="canvas-online-url">Enlace al trabajo en línea</label>
      <div class="canvas-foot-row">
        <input id="canvas-online-url" type="url" inputmode="url" placeholder="Canva, Figma, Lucid o Slides" value="${escapeHtml(String(state.canvas_online_url || ""))}"
               onchange="canvasOnlineUrlChanged(this.value)" class="canvas-foot-input">
        ${state.canvas_online_url ? `<a href="${escapeHtml(state.canvas_online_url)}" target="_blank" rel="noopener noreferrer" class="btn-secondary" style="text-decoration:none; display:inline-flex; align-items:center; gap:4px;">${SVG.external} Ver</a>` : ""}
      </div>
    </div>
  `;
}

// ═════════════════════════════════════════════════════════════════════════════
// 09 GUION AUDIOVISUAL (4 ACTOS, 120 SEGUNDOS) & LOCUCIÓN MP4
// ═════════════════════════════════════════════════════════════════════════════
const VOICE_ENGINE_OPTIONS = {
  chatterbox: {
    label: "Chatterbox LatAm (recomendado)",
    tag: "MIT · clonación · local",
    summary: "<strong>La mejor opción para este proyecto.</strong> Es el motor de la voz que escuchaste: licencia MIT, clonación desde 5–12 s, control de emoción y un finetune oficial para español latinoamericano. Corre sin internet en CPU; en una laptop sin GPU tarda unas 7 veces el tiempo real.",
    url: "https://huggingface.co/ResembleAI/Chatterbox-Multilingual-es-mx-latam",
    prompt: `Actúa como ingeniero de audio de este proyecto de Rally de Innovación.

OBJETIVO
Instala y deja funcionando un motor TTS local para narrar el guion de 120 segundos en español latinoamericano. Genera el entregable final en assets/voice/narration.mp4: MP4 con audio AAC, sin video, mono, 48 kHz, 192 kbps y máximo 120 segundos.

MOTOR ELEGIDO
Chatterbox Multilingual V3, finetune oficial es-MX/LatAm de Resemble AI.
Modelo: https://huggingface.co/ResembleAI/Chatterbox-Multilingual-es-mx-latam
Código: https://github.com/resemble-ai/chatterbox
Licencia: MIT.
Por qué: acento latino, clonación zero-shot y control de emoción. En CPU tarda aproximadamente 7 veces el tiempo real; si hay GPU NVIDIA, úsala.

PASOS
1. Verifica Python 3.11, ffmpeg y al menos 4 GB libres. El modelo pesa cerca de 3 GB. Si falta ffmpeg en Windows: winget install Gyan.FFmpeg (o descarga una build estática) y comprueba ffmpeg -version.
2. Crea y activa un entorno aislado: python -m venv .venv-voz; en PowerShell: .venv-voz\Scripts\Activate.ps1
3. Instala: python -m pip install --upgrade pip; pip install chatterbox-tts soundfile numpy torch torchaudio
4. Descarga el finetune completo en una sola carpeta:
   huggingface-cli download ResembleAI/Chatterbox-Multilingual-es-mx-latam --local-dir models/latam
   Deben quedar t3_es_mx_latam.safetensors (2.14 GB), s3gen_v3.pt (1.06 GB), grapheme_mtl_merged_expanded_v1.json, ve.pt y conds.pt. Si falta alguno, bájalo del mismo repo con --include.
5. Carga el finetune con language_id="es". Si el loader estándar no acepta el checkpoint V3, usa este patrón: safe_open tensor por tensor para el T3, S3Gen con strict=False, MTLTokenizer y VoiceEncoder. En Windows, evita safetensors.load_file con el archivo de 2 GB; usa safe_open.
6. Para reproducir la voz interna que escuché, no pases audio_prompt_path: carga conds.pt del pack. Para una voz propia, usa una referencia de 12 s, 24 kHz, mono, limpia y con permiso.
7. Parámetros de la muestra que me gustó: exaggeration=0.8, cfg_weight=0.45, temperature=0.8, repetition_penalty=2.0.
8. Une los párrafos con 0.65 s de silencio y masteriza a -16 LUFS.
9. Convierte a MP4 AAC:
ffmpeg -i narracion.wav -vn -c:a aac -b:a 192k -ar 48000 -ac 1 -movflags +faststart assets/voice/narration.mp4
10. Verifica que la duración sea <=120 s y que el archivo exista.

ENTREGABLE
- assets/voice/narration.mp4
- assets/voice/narration.wav como master de respaldo
- un README breve con versiones, semilla y parámetros usados

NO HAGAS
- No clones la voz de una persona real sin permiso escrito.
- No subas los pesos del modelo al repositorio.
- No entregues MP3 ni WAV como archivo oficial.
- No uses una voz en inglés.`
  },
  kokoro: {
    label: "Kokoro 82M (CPU rápida)",
    tag: "Apache 2.0 · sin clonación",
    summary: "<strong>Respaldo para laptops lentas.</strong> 82 millones de parámetros, licencia Apache 2.0 y voz española aceptable. No clona voces y tiene menos control emocional, pero genera mucho más rápido que Chatterbox y casi no consume RAM.",
    url: "https://huggingface.co/hexgrad/Kokoro-82M",
    prompt: `Actúa como ingeniero de audio de este proyecto de Rally de Innovación.

OBJETIVO
Instala Kokoro-82M y genera la locución de 120 segundos en español latinoamericano. Entrega assets/voice/narration.mp4 (MP4 AAC, sin video, mono, 48 kHz, máximo 120 s).

MOTOR
Kokoro-82M, licencia Apache 2.0. Es el respaldo cuando el equipo no puede correr Chatterbox por RAM, CPU o tiempo.

PASOS
1. Verifica Python 3.10+ y ffmpeg.
2. python -m venv .venv-voz
3. pip install kokoro soundfile
4. Genera por párrafos con:
from kokoro import KPipeline
pipe = KPipeline(lang_code="e")
for _, _, audio in pipe(texto, voice="em_alex", speed=0.95):
    guardar(audio)
5. Voces españolas disponibles: em_alex (masculina), ef_dora (femenina), em_santa (masculina). Elige una y mantén la misma en todo el video.
6. Une los bloques con 0.5 s de silencio, normaliza a -16 LUFS y convierte:
ffmpeg -i narracion.wav -vn -c:a aac -b:a 192k -ar 48000 -ac 1 -movflags +faststart assets/voice/narration.mp4
7. Verifica duración <=120 s.

LIMITACIONES
Kokoro no clona voces. Si el equipo exige una voz propia, usa Chatterbox.
No inventes una voz de una persona real.`
  },
  edge: {
    label: "Edge-TTS (nube)",
    tag: "Gratis · requiere internet",
    summary: "<strong>La salida más rápida si hay internet.</strong> Voces neuronales de Microsoft en español de México y Colombia. No clona, no controla emoción y envía el guion a un servicio externo; úsalo solo como respaldo o para una primera maqueta.",
    url: "https://github.com/rany2/edge-tts",
    prompt: `Actúa como ingeniero de audio de este proyecto de Rally de Innovación.

OBJETIVO
Genera una locución provisional en español latinoamericano con Edge-TTS y entrega assets/voice/narration.mp4 (MP4 AAC, sin video, mono, 48 kHz, máximo 120 s).

ADVERTENCIA
Edge-TTS usa un servicio en la nube de Microsoft. Requiere internet y envía el texto fuera del equipo. Úsalo como maqueta o respaldo, no como opción principal si el guion es confidencial.

PASOS
1. Verifica Python y ffmpeg.
2. python -m venv .venv-voz
3. pip install edge-tts
4. Voces recomendadas: es-MX-JorgeNeural (masculina) o es-MX-DaliaNeural (femenina). También puedes probar es-CO-GonzaloNeural.
5. Genera:
edge-tts --voice es-MX-JorgeNeural --file script/narration.txt --write-media narration.mp3
6. Ajusta la velocidad si hace falta con --rate=-4%.
7. Convierte:
ffmpeg -i narration.mp3 -vn -c:a aac -b:a 192k -ar 48000 -ac 1 -movflags +faststart assets/voice/narration.mp4
8. Verifica duración <=120 s y que la voz elegida se mantenga en todo el video.

LIMITACIONES
Sin clonación, sin control fino de emoción y dependencia de internet. No uses una voz que imite a una persona real.`
  },
  xtts: {
    label: "XTTS-v2 (no comercial)",
    tag: "No comercial · legado",
    summary: "<strong>Solo si aceptas su licencia.</strong> Clona con 6 s de audio y entiende español, pero la Coqui Public Model License prohíbe uso comercial. Para un rally académico puede servir; para un emprendimiento, Chatterbox es la ruta limpia.",
    url: "https://huggingface.co/coqui/XTTS-v2",
    prompt: `Actúa como ingeniero de audio de este proyecto de Rally de Innovación.

OBJETIVO
Evalúa XTTS-v2 como motor de locución y, si el equipo acepta su licencia, genera assets/voice/narration.mp4 (MP4 AAC, sin video, mono, 48 kHz, máximo 120 s).

LICENCIA
XTTS-v2 usa la Coqui Public Model License. No permite uso comercial. Si el proyecto puede convertirse en empresa, no lo uses: elige Chatterbox (MIT). Documenta la decisión.

PASOS
1. Verifica Python 3.10–3.11, ffmpeg y 4 GB libres.
2. python -m venv .venv-voz
3. pip install TTS
4. Descarga el modelo:
from TTS.api import TTS
tts = TTS("tts_models/multilingual/multi-dataset/xtts_v2")
5. Genera con una referencia de 6–12 s, limpia y con permiso:
tts.tts_to_file(text=texto, speaker_wav="referencia.wav", language="es", file_path="narracion.wav")
6. Une párrafos con 0.5 s de silencio, normaliza a -16 LUFS y convierte:
ffmpeg -i narracion.wav -vn -c:a aac -b:a 192k -ar 48000 -ac 1 -movflags +faststart assets/voice/narration.mp4
7. Verifica duración <=120 s.

NO HAGAS
- No clones una voz real sin permiso.
- No uses XTTS-v2 en un producto comercial.
- No entregues MP3 como archivo oficial.`
  }
};

const VOICE_PRESETS = {
  proyecto: {
    label: "Locución final del proyecto",
    short: "Locución del proyecto",
    src: "/assets/voice/narration.mp4",
    meta: "77.8 s · MP4 AAC · voz interna · énfasis 0.80 / ritmo 0.45 · semilla 7",
    params: "exaggeration=0.8, cfg_weight=0.45, temperature=0.8, repetition_penalty=2.0, seed=7"
  },
  interna: {
    label: "Voz interna · muestra completa",
    short: "Voz interna estándar",
    src: "../assets/voice/previews/chatterbox_interna.mp3",
    meta: "62 s · MP3 64 kbps · voz de fábrica, sin clonar",
    params: "exaggeration=0.8, cfg_weight=0.45, temperature=0.8, repetition_penalty=2.0, seed=7"
  },
  expresiva: {
    label: "Voz interna · muestra expresiva",
    short: "Voz interna expresiva",
    src: "../assets/voice/previews/chatterbox_interna_e080_c045.mp3",
    meta: "9 s · MP3 64 kbps · la variante más expresiva",
    params: "exaggeration=0.8, cfg_weight=0.45, temperature=0.8, repetition_penalty=2.0, seed=7"
  }
};

function getVoicePresetData() {
  const select = document.getElementById("voice-preset-select");
  return VOICE_PRESETS[(select && select.value) || state.voice_preset] || VOICE_PRESETS.proyecto;
}

function renderVoiceEnginePanel() {
  const selectedId = VOICE_ENGINE_OPTIONS[state.voice_engine] ? state.voice_engine : "chatterbox";
  const selected = VOICE_ENGINE_OPTIONS[selectedId];
  const options = Object.entries(VOICE_ENGINE_OPTIONS)
    .map(([id, data]) => `<option value="${id}" ${id === selectedId ? "selected" : ""}>${data.label}</option>`)
    .join("");
  const presetId = VOICE_PRESETS[state.voice_preset] ? state.voice_preset : "proyecto";
  const preset = VOICE_PRESETS[presetId];
  const presetOptions = Object.entries(VOICE_PRESETS)
    .map(([id, data]) => `<option value="${id}" ${id === presetId ? "selected" : ""}>${data.label}</option>`)
    .join("");

  return `
    <section class="voice-engine" aria-labelledby="voice-engine-title">
      <div class="voice-engine-head">
        <div>
          <h2 id="voice-engine-title">Motor y preset de voz</h2>
          <p>Este proyecto ya incluye una locución real en <strong>Chatterbox Multilingual es-MX/LatAm</strong>. Escúchala, guárdala como preset y, si te gusta, instala el mismo motor con un clic. El entregable oficial es MP4 con audio AAC.</p>
        </div>
        <span class="rubric-tag">Preset incluido · MP4 AAC</span>
      </div>

      <div class="voice-preset">
        <div class="voice-preset-copy">
          <span class="voice-preview-label">Preset de voz</span>
          <strong id="voice-preset-name">${preset.label}</strong>
          <p id="voice-preset-meta">${preset.meta}</p>
        </div>
        <div class="voice-preset-controls">
          <label for="voice-preset-select">
            <span>Escuchar preset</span>
            <select id="voice-preset-select" onchange="updateVoicePresetUI()">${presetOptions}</select>
          </label>
          <button type="button" class="btn-primary" onclick="copyVoicePresetInstall()">Instalar todo con mi IA</button>
          <button type="button" class="btn-secondary" onclick="downloadVoicePreset()">Descargar preset .json</button>
        </div>
        <audio id="voice-preset-audio" controls preload="metadata" src="${preset.src}"></audio>
      </div>

      <details class="voice-engine-details voice-own-voice">
        <summary>¿Quieres poner tu propia voz? Tu IA te explica cómo</summary>
        <p>Sí. Puedes clonar tu voz con 10–20 segundos de audio limpio, o afinar el modelo con varias muestras para un resultado más estable. La clonación es rápida; el entrenamiento fino requiere más audio y tiempo. Pídele a tu IA que te explique cuál te conviene y que ejecute los pasos contigo.</p>
        <button type="button" class="btn-secondary" onclick="copyOwnVoiceGuide()">Copiar guía para usar mi voz</button>
      </details>

      <div class="voice-engine-controls">
        <label for="voice-engine-select">
          <span>Motor para tu IA</span>
          <select id="voice-engine-select" onchange="updateVoiceEngineUI()">${options}</select>
        </label>
        <button type="button" class="btn-primary" onclick="copyVoiceEnginePrompt()">Copiar prompt para mi IA</button>
        <button type="button" class="btn-secondary" onclick="downloadVoiceEngineGuide()">Descargar guía .md</button>
      </div>

      <div class="voice-engine-tagline"><span class="rubric-tag" id="voice-engine-tag">${selected.tag}</span></div>

      <div class="voice-engine-summary" id="voice-engine-summary">${selected.summary}</div>
      <p class="voice-engine-summary" style="margin-top:6px;">
        <a href="${selected.url}" target="_blank" rel="noopener" id="voice-engine-link">Ver modelo y licencia</a>
      </p>

      <details class="voice-engine-details">
        <summary>Ver el prompt completo que recibirá tu IA</summary>
        <pre id="voice-engine-prompt-preview">${escapeHtml(selected.prompt)}</pre>
      </details>

      <p class="voice-engine-note">El preset del proyecto ya está generado y se reproduce aquí. Las otras dos muestras son MP3 de referencia. El archivo que se entrega al jurado es <strong>assets/voice/narration.mp4</strong> (MP4 con audio AAC, sin video). “Instalar todo” copia un prompt: la instalación la ejecuta tu IA en tu equipo.</p>
    </section>
  `;
}

function getVoiceEngineData() {
  const select = document.getElementById("voice-engine-select");
  return VOICE_ENGINE_OPTIONS[(select && select.value) || "chatterbox"] || VOICE_ENGINE_OPTIONS.chatterbox;
}

function updateVoiceEngineUI() {
  const data = getVoiceEngineData();
  const summary = document.getElementById("voice-engine-summary");
  const tag = document.getElementById("voice-engine-tag");
  const link = document.getElementById("voice-engine-link");
  const prompt = document.getElementById("voice-engine-prompt-preview");
  const select = document.getElementById("voice-engine-select");

  if (select && state.voice_engine !== select.value) {
    state.voice_engine = select.value;
    saveState();
  }
  if (summary) summary.innerHTML = data.summary;
  if (tag) tag.textContent = data.tag;
  if (link) link.href = data.url;
  if (prompt) prompt.textContent = data.prompt;
}

function updateVoicePresetUI() {
  const data = getVoicePresetData();
  const select = document.getElementById("voice-preset-select");
  const name = document.getElementById("voice-preset-name");
  const meta = document.getElementById("voice-preset-meta");
  const audio = document.getElementById("voice-preset-audio");

  if (select && state.voice_preset !== select.value) {
    state.voice_preset = select.value;
    saveState();
  }
  if (name) name.textContent = data.label;
  if (meta) meta.textContent = data.meta;
  if (audio && audio.getAttribute("src") !== data.src) {
    audio.pause();
    audio.setAttribute("src", data.src);
    audio.load();
  }
}

function buildVoicePresetInstallPrompt() {
  const preset = getVoicePresetData();
  return `Actúa como ingeniero de audio de este proyecto de Rally de Innovación.

Quiero dejar instalado y reproducible el mismo preset de voz que ya trae el proyecto "${state.project_name || "actual"}".

${VOICE_ENGINE_OPTIONS.chatterbox.prompt}

PRESET EXACTO A REPRODUCIR
- Voz: interna del finetune, sin audio_prompt_path; carga conds.pt del pack.
- Parámetros: ${preset.params}.
- Pausas: 0.75 s entre párrafos.
- Master: -16 LUFS integrado, pico real -1.5 dBFS.
- Referencia audible incluida: ${preset.src} (${preset.meta}).
- Texto de referencia: script/narration.txt.
- Entregable: assets/voice/narration.mp4 (MP4 AAC, sin video, mono, 48 kHz, 192 kbps, ≤120 s).

Compara la referencia audible con tu resultado: mismo timbre, misma velocidad y pausas similares. Si no puedes igualar la voz interna, entrega el audio más cercano y documenta la diferencia.`;
}

function copyVoiceText(text, done, fail) {
  const fallback = () => {
    const area = document.createElement("textarea");
    area.value = text;
    area.setAttribute("readonly", "");
    area.style.position = "fixed";
    area.style.opacity = "0";
    document.body.appendChild(area);
    area.select();
    let copied = false;
    try { copied = document.execCommand("copy"); } catch (e) {}
    area.remove();
    copied ? done() : fail();
  };
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(done).catch(fallback);
  } else {
    fallback();
  }
}

function copyVoicePresetInstall() {
  copyVoiceText(
    buildVoicePresetInstallPrompt(),
    () => showToast("Instalación completa copiada. Pégala en tu IA: instalará el motor y reproducirá este mismo preset."),
    () => showToast("No se pudo copiar automáticamente. Descarga el preset .json y pásalo a tu IA.")
  );
}

function buildOwnVoicePrompt() {
  return `Actúa como ingeniero de audio y entrenador de voz para el proyecto "${state.project_name || "actual"}".

OBJETIVO
Explícame y ejecuta, paso a paso, cómo poner mi propia voz en la locución del proyecto. Quiero entender la diferencia entre clonar y entrenar, y elegir la ruta correcta según el tiempo y el equipo disponible.

1. CONSENTIMIENTO Y LÍMITES
- La voz debe ser mía o tener permiso escrito de la persona.
- No imites voces de terceros, famosos ni menores.
- Explícame qué se guarda, dónde y cómo borrarlo.

2. GRABACIÓN
- Para clonación zero-shot: 10–20 s limpios, una sola persona, sin música, eco ni ruido, 24 kHz o más, mono.
- Para afinar el modelo: 5–30 min de audio con transcripciones exactas, misma micrófono y tono.
- Dame un guion de grabación y una lista de verificación.

3. LIMPIEZA
- Normaliza a -16 LUFS, elimina silencios largos y revisa que no haya clipping.
- Si hace falta, recomienda una herramienta local y explica el comando.

4. CLONACIÓN CON CHATTERBOX (RÁPIDA)
- Usa el finetune ResembleAI/Chatterbox-Multilingual-es-mx-latam y language_id="es".
- Pasa mi muestra como audio_prompt_path.
- Parámetros de partida: exaggeration=0.8, cfg_weight=0.45, temperature=0.8, repetition_penalty=2.0.
- Genera una prueba corta y compárala con mi voz real.

5. ENTRENAMIENTO O AFINADO (OPCIONAL, MÁS TRABAJO)
- Explícame si de verdad hace falta afinar o si la clonación basta.
- Si conviene, describe el dataset, las transcripciones, el tiempo estimado, los requisitos de GPU y cómo evaluar el resultado.
- No prometas calidad de estudio sin datos suficientes.

6. ENTREGABLE
- Genera assets/voice/narration.mp4 (MP4 AAC, sin video, mono, 48 kHz, 192 kbps, ≤120 s).
- Masteriza a -16 LUFS y pico real -1.5 dBFS.
- Deja el texto en script/narration.txt y documenta la muestra usada.

Empieza preguntándome qué ruta quiero: clonar rápido o entrenar. Luego guíame con comandos concretos para Windows.`;
}

function copyOwnVoiceGuide() {
  copyVoiceText(
    buildOwnVoicePrompt(),
    () => showToast("Guía de voz propia copiada. Tu IA te explicará cómo grabarla, clonarla o entrenarla."),
    () => showToast("No se pudo copiar automáticamente. Abre el prompt y cópialo a mano.")
  );
}

function downloadVoicePreset() {
  const preset = getVoicePresetData();
  const slug = String(state.project_name || "proyecto")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "") || "proyecto";
  const payload = {
    name: preset.label,
    project: state.project_name || "",
    engine: "Chatterbox Multilingual V3 · finetune es-MX/LatAm",
    model: "ResembleAI/Chatterbox-Multilingual-es-mx-latam",
    license: "MIT",
    voice: "interna (conds.pt, sin audio_prompt_path)",
    params: preset.params,
    sample: preset.src,
    text_reference: "script/narration.txt",
    deliverable: "assets/voice/narration.mp4",
    format: "MP4 con audio AAC, sin video, mono, 48 kHz, 192 kbps, ≤120 s",
    generated_at: new Date().toISOString()
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `preset_voz_${slug}.json`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  showToast("Preset descargado. Tu IA puede instalarlo y reproducirlo.");
}

function copyVoiceEnginePrompt() {
  const data = getVoiceEngineData();
  const done = () => showToast("Prompt copiado. Pégalo en tu IA y pídele que instale el motor y genere assets/voice/narration.mp4.");
  const fail = () => showToast("No se pudo copiar automáticamente. Abre el prompt completo y cópialo a mano.");

  const fallback = () => {
    const area = document.createElement("textarea");
    area.value = data.prompt;
    area.setAttribute("readonly", "");
    area.style.position = "fixed";
    area.style.opacity = "0";
    document.body.appendChild(area);
    area.select();
    let copied = false;
    try { copied = document.execCommand("copy"); } catch (e) {}
    area.remove();
    copied ? done() : fail();
  };

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(data.prompt).then(done).catch(fallback);
  } else {
    fallback();
  }
}

function downloadVoiceEngineGuide() {
  const data = getVoiceEngineData();
  const header = `# Instalar el motor de voz · ${data.label}

${data.tag}

${data.summary.replace(/<[^>]+>/g, "")}

El entregable oficial es \`assets/voice/narration.mp4\`: MP4 con audio AAC, sin video, mono, 48 kHz y máximo 120 segundos. El preset del proyecto ya está generado en ese archivo; las otras dos muestras del panel son MP3 de referencia.

---

## Prompt para tu IA

`;
  const blob = new Blob([header + data.prompt], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "instalar_motor_de_voz.md";
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  showToast("Guía descargada. Pásasela a tu IA junto con el guion.");
}

// Ritmo de voz para 120 s. El guion no se mide en "cuatro puntos": se mide
// en palabras, porque lo que califica el jurado es el audio final.
const GUION_WPM = 135;
const GUION_MIN_PALABRAS = 240;
const GUION_MAX_PALABRAS = 280;

function scriptPalabras() {
  const texto = scriptFullText();
  if (!texto) return 0;
  return typeof rsWordCount === "function"
    ? rsWordCount(texto)
    : texto.trim().split(/\s+/).filter(Boolean).length;
}

function scriptMeterTexto() {
  const n = scriptPalabras();
  if (!n) {
    return "Aún no hay guion. El video dura 120 s: a ritmo de conversación son unas 270 palabras.";
  }
  const s = Math.round((n / GUION_WPM) * 60);
  if (n < GUION_MIN_PALABRAS) {
    return `${n} palabras ≈ ${s} s de voz. Faltan ${GUION_MIN_PALABRAS - n} para llenar los 120 s: alarga una historia o un dato, no repitas el nombre del lugar.`;
  }
  if (n > GUION_MAX_PALABRAS) {
    return `${n} palabras ≈ ${s} s de voz. Sobran ${n - GUION_MAX_PALABRAS}: el corte se hace en lo que no sostiene la historia.`;
  }
  return `${n} palabras ≈ ${s} s de voz. Entra en los 120 s. Marca con / cada pausa y no repitas el lugar más de una vez.`;
}

function renderViewScript() {
  const actos = [
    { key: "acto1", n: "I", title: "Problema", ph: "El problema, con una persona y una cifra reales. [pausa] después de la cifra." },
    { key: "acto2", n: "II", title: "Solución", ph: "Qué construyeron y cómo funciona, en tres frases cortas." },
    { key: "acto3", n: "III", title: "Factibilidad", ph: "Cuánto cuesta arrancar, quién lo paga y qué se sostiene solo. Sin leer cifras de una tabla." },
    { key: "acto4", n: "IV", title: "Cierre", ph: "El impacto en números y la frase que cierra. [pausa] antes de la última frase." }
  ];
  const authorship = (state.authorship && state.authorship.script) || {};
  const lleno = actos.some(x => String(state.script[x.key] || "").trim() !== "");

  return `
    <div class="phase-header">
      <div>
        <h1 class="phase-title">Guion <span class="phase-title-accent">del video</span></h1>
        <p class="phase-subtitle">Cuatro actos, de corrido. Escribes aquí y el teleprompter lo lee en pantalla.</p>
      </div>
      <div class="script-tools">
        <a class="btn-primary" href="../script/teleprompter.html" target="_blank" rel="noopener noreferrer" style="text-decoration:none; display:inline-flex; align-items:center; gap:6px;">
          ${SVG.play || ""} Abrir teleprompter
        </a>
        <button class="btn-secondary" onclick="copyFullScript()" title="Copia el guion entero para pegarlo en otra IA o en el teleprompter">Copiar</button>
        <button class="btn-secondary" onclick="saveScript()">Guardar</button>
      </div>
    </div>

    <div class="script-mode">
      <button type="button" class="script-mode-btn is-on" data-mode="edit" onclick="setScriptMode('edit')" id="script-mode-edit">Escribir</button>
      <button type="button" class="script-mode-btn" data-mode="read" onclick="setScriptMode('read')" id="script-mode-read">Leer completo</button>
      <a class="script-audio" href="../assets/voice/narration.mp4" download onclick="return handleNarrationDownload(event)">${SVG.download} Locución</a>
    </div>

    <p class="bu-note is-info" id="script-meter">${escapeHtml(scriptMeterTexto())}</p>

    <div id="script-edit" class="script-acts${lleno ? "" : " is-empty"}">
      ${actos.map(x => `
        <section class="script-act" data-lockable="script-${x.key}">
          <div class="script-act-head">
            <span class="script-act-n">${x.n}</span>
            <h2 class="script-act-title">${x.title}</h2>
            ${authorship[x.key] ? `<span class="collaborator-stamp">${authorship[x.key].icon} ${authorship[x.key].name}</span>` : ""}
            <span id="lock-tag-script-${x.key}"></span>
          </div>
          <textarea id="sc-${x.key}" class="script-input" rows="3" spellcheck="false"
            placeholder="${x.ph}"
            onfocus="broadcastLock('script-${x.key}')"
            onblur="broadcastRelease('script-${x.key}')"
            oninput="handleScriptInput('${x.key}', this)">${escapeHtml(String(state.script[x.key] || ""))}</textarea>
          <div style="margin-top:6px;">${aiEditPanel("script:" + x.key)}</div>
        </section>
      `).join("")}
    </div>

    <div id="script-read" class="script-read" hidden>
      <article id="script-read-body"></article>
      <p class="script-read-empty" id="script-read-empty">El guion está vacío. Escribe los cuatro actos y aquí se leen de corrido.</p>
    </div>
  `;
}

function scriptFullText() {
  const orden = ["acto1", "acto2", "acto3", "acto4"];
  return orden.map(k => String((state.script && state.script[k]) || "").trim()).filter(Boolean).join("\n\n");
}

function copyFullScript() {
  const txt = scriptFullText();
  if (!txt) { showToast("El guion está vacío todavía."); return; }
  navigator.clipboard.writeText(txt)
    .then(() => showToast("Guion completo copiado."))
    .catch(() => showToast("No se pudo copiar el guion."));
}

function setScriptMode(mode) {
  const edit = document.getElementById("script-edit");
  const read = document.getElementById("script-read");
  if (!edit || !read) return;
  const isRead = mode === "read";
  edit.hidden = isRead;
  read.hidden = !isRead;
  document.getElementById("script-mode-edit").classList.toggle("is-on", !isRead);
  document.getElementById("script-mode-read").classList.toggle("is-on", isRead);
  if (isRead) renderScriptRead();
  else requestAnimationFrame(updateScriptMeters);
}

function renderScriptRead() {
  const body = document.getElementById("script-read-body");
  const empty = document.getElementById("script-read-empty");
  if (!body) return;
  const actos = [["I", "acto1"], ["II", "acto2"], ["III", "acto3"], ["IV", "acto4"]];
  const partes = actos
    .map(([n, k]) => {
      const t = String((state.script && state.script[k]) || "").trim();
      if (!t) return "";
      return `<section class="script-read-act"><span class="script-act-n">${n}</span><p>${escapeHtml(t).replace(/\n{2,}/g, "</p><p>").replace(/\n/g, "<br>")}</p></section>`;
    })
    .filter(Boolean);
  body.innerHTML = partes.join("");
  if (empty) empty.hidden = partes.length > 0;
}

function handleScriptInput(key, el) {
  state.script[key] = el.value;
  broadcastFieldChange("script", key, el.value);
  saveState();
  updateScriptMeters();
}

function updateScriptMeters() {
  document.querySelectorAll(".script-input").forEach(el => {
    el.style.height = "auto";
    el.style.height = Math.max(52, el.scrollHeight) + "px";
  });
  const meter = document.getElementById("script-meter");
  if (meter) meter.textContent = scriptMeterTexto();
  const read = document.getElementById("script-read");
  if (read && !read.hidden) renderScriptRead();
}

function handleNarrationDownload(event) {
  if (event) event.preventDefault();
  const url = "/assets/voice/narration.mp4";
  fetch(url, { cache: "no-store" })
    .then(res => {
      if (!res.ok) throw new Error("missing");
      const link = document.createElement("a");
      link.href = url;
      link.download = "narration.mp4";
      document.body.appendChild(link);
      link.click();
      link.remove();
    })
    .catch(() => {
      showToast("Aún no hay locución generada. Genera la tarea de voz en Despacho Multi-IA y guarda el audio como /assets/voice/narration.mp4 (MP4 con audio AAC).");
    });
  return false;
}

function saveScript() {
  saveState();
  renderNavigation();
  showToast("Guion guardado correctamente.");
}

// ═════════════════════════════════════════════════════════════════════════════
// 10 PROTOTIPO DIGITAL PARA TOMAS DE VIDEO
// ═════════════════════════════════════════════════════════════════════════════
function renderViewWebDemo() {
  const siteUrl = String(state.site_url || "").trim();
  return `
    <div class="phase-header">
      <div>
        <h1 class="phase-title">Prototipo <span class="phase-title-accent">para el video</span></h1>
        <p class="phase-subtitle">${siteUrl ? "Lo que se graba en pantalla. Ábrelo en pestaña completa para grabar sin barras." : "Aquí se ve el prototipo que se graba para el video."}</p>
      </div>
      <div class="wd-tools">
        <button class="wd-chip is-on" data-dev="escritorio" onclick="setWebDemoDevice('escritorio')">Escritorio</button>
        <button class="wd-chip" data-dev="movil" onclick="setWebDemoDevice('movil')">Móvil</button>
        <a href="${escapeHtml(siteUrl || "../site/")}" target="_blank" rel="noopener noreferrer" class="btn-primary" style="text-decoration:none; display:inline-flex; align-items:center; gap:4px;">Abrir ${SVG.external}</a>
      </div>
    </div>

    <div class="wd-stage" id="wd-stage">
      <iframe id="wd-frame" class="wd-frame" src="${escapeHtml(siteUrl || "../site/")}" title="Prototipo del proyecto" loading="lazy" onload="wdCheckFrame(this)"></iframe>
      <div class="wd-empty" id="wd-empty" hidden>
        <p class="wd-empty-title">Todavía no hay prototipo</p>
        <p class="wd-empty-text">Se genera cuando el reto, la solución y el presupuesto están definidos. Si ya lo publicaste, pega la dirección aquí abajo.</p>
      </div>
    </div>

    <div class="wd-link">
      <label for="site-url" class="wd-link-label">Dirección publicada</label>
      <input id="site-url" type="url" inputmode="url" class="wd-link-input" value="${escapeHtml(siteUrl)}" placeholder="https://tu-proyecto.netlify.app" onchange="setSiteUrl(this.value)">
      <span class="wd-link-hint">Se usa en el checklist de entrega y abre desde el video.</span>
    </div>
  `;
}

function wdCheckFrame(frame) {
  let vacio = false;
  try {
    const doc = frame.contentDocument;
    const texto = doc && doc.body ? String(doc.body.innerText || "") : "";
    if (/Prototipo pendiente/i.test(texto)) vacio = true;
  } catch (e) { vacio = false; }
  const empty = document.getElementById("wd-empty");
  if (!empty) return;
  empty.hidden = !vacio;
  frame.style.display = vacio ? "none" : "";
}

function setWebDemoDevice(dev) {
  const stage = document.getElementById("wd-stage");
  if (!stage) return;
  stage.classList.toggle("is-movil", dev === "movil");
  document.querySelectorAll(".wd-chip").forEach(b => b.classList.toggle("is-on", b.dataset.dev === dev));
}

function setSiteUrl(value) {
  state.site_url = String(value || "").trim();
  saveState();
  renderTab("webdemo");
}

// ═════════════════════════════════════════════════════════════════════════════
// 11 CRONOGRAMA DE ENTREGA, NOMENCLATURAS Y REQUISITOS CRÍTICOS
// ═════════════════════════════════════════════════════════════════════════════
function guardrailDefs() {
  const isLatam = state.rally_type === "latam";
  return [
    {
      key: "team_sirli_registered",
      title: isLatam
        ? "1. Registro del Equipo en la Plataforma Latam (Límite: 12:00 PM)"
        : "1. Registro del Equipo en la Plataforma Nacional (Límite: 12:00 PM)",
      desc: `Todos los integrantes y la sede ${sedeName()} deben estar confirmados en la plataforma de ${rallyName()} antes de mediodía.`,
      risk: "Equipos no validados a las 12:00 PM quedan inhabilitados por el sistema central."
    },
    {
      key: "video_duration_ok",
      title: "2. Duración del Video Pitch (Estrictamente ≤ 119 Segundos)",
      desc: "El video no debe exceder los 2 minutos exactos (120s). Recomendado exportar a 1:55 - 1:58 min.",
      risk: "El límite es 120 segundos de audio: se mide con ffprobe antes de subir. Pasarse deja el video fuera de las bases, así que no se apuesta al margen."
    },
    {
      key: "video_unlisted_or_public",
      title: "3. Privacidad de YouTube: 'No listado' (Oculto) o 'Público'",
      desc: "Comprobar el enlace abriéndolo en una ventana de incógnito sin sesión de Google iniciada.",
      risk: "Subir el video en 'Privado' impide al jurado calificador reproducirlo, otorgando 0 puntos en el pitch."
    },
    {
      key: "naming_pdf_ok",
      title: isLatam
        ? "4. Nomenclatura Oficial del PDF Pautado (Formato Latam)"
        : "4. Nomenclatura Oficial del PDF Pautado (Formato Nacional)",
      desc: "Nombrar el archivo exportado exactamente con el formato reglamentario generado en esta pantalla.",
      risk: "Nombres genéricos (ej. 'documento_final.pdf' o 'tarea.pdf') sufren penalización en la etapa de auditoría documental."
    },
    {
      key: "hashtags_included",
      title: "5. Hashtags Oficiales en YouTube y TikTok",
      desc: `Incluir en la descripción y título del video los tags ${rallyTags().join(" y ")}, más la etiqueta de la sede.`,
      risk: "La omisión de los hashtags reglamentarios o de la etiqueta de la sede invalida los puntos de interacción y difusión."
    },
    {
      key: "pautado_chars_ok",
      title: "6. Respeto Estricto de Caracteres en el Documento Pautado",
      desc: state.rally_type === "nacional"
        ? "Sin tope por sección: el Rally Nacional no fija límite de caracteres, pero el documento debe ser completo."
        : `Problema (≤${PAUTADO_LIMITS.problema}), Solución (≤${PAUTADO_LIMITS.solucion}), Prefactibilidad (≤${PAUTADO_LIMITS.prefactibilidad}), Innovación (≤${PAUTADO_LIMITS.innovacion}), Impacto (≤${PAUTADO_LIMITS.impacto}).`,
      risk: "La plataforma de entrega trunca o rechaza textos que excedan el límite oficial de caracteres con espacios."
    },
    {
      key: "pdf_video_numbers_synced",
      title: "7. Sincronía Numérica Estricta PDF vs Video (Cero Discrepancia)",
      desc: isLatam
        ? "Las cifras de costos unitarios, la inversión del piloto y los beneficiarios citados en el video deben coincidir al dólar con el PDF: más de una cifra distinta resta credibilidad de inmediato."
        : "Las cifras de costos unitarios, la inversión del piloto y los beneficiarios citados en el video deben coincidir al córdoba con el PDF: más de una cifra distinta resta credibilidad de inmediato.",
      risk: "La discrepancia numérica entre el video y el PDF es el riesgo más frecuente en prefactibilidad económica: el jurado cruza las cifras."
    },
    {
      key: "youtube_channel_brand",
      title: "8. Canal Oficial de Marca-Equipo en YouTube (No canal personal)",
      desc: "Canal bautizado con el nombre del equipo, avatar propio y títulos con el formato [RETO] - EQUIPO - PROYECTO.",
      risk: "Subir desde cuentas personales desarticuladas proyecta informalidad y reduce la legitimidad visual ante el jurado."
    },
    {
      key: "tiktok_submitted",
      title: isLatam
        ? "9. Video TikTok de Interacción Internacional (Obligatorio SIRLI)"
        : "9. Video TikTok del Prototipo en Territorio (Obligatorio)",
      desc: isLatam
        ? "Cápsula lúdico-creativa de vinculación con equipos de otras sedes o países, publicada antes de las 08:00 PM con los hashtags oficiales."
        : "Cápsula del prototipo en el municipio piloto, publicada antes de las 08:00 PM con los hashtags oficiales del Rally Nacional.",
      risk: isLatam
        ? "En el Rally Latam, la interacción en TikTok es un entregable auditable que habilita puntajes decisivos de integración."
        : "En el Rally Nacional, la difusión territorial del prototipo es un entregable auditable que suma en la rúbrica de impacto."
    },
    {
      key: "loser_patterns_checked",
      title: "10. Auditoría de los 11 Patrones Perdedores (Anti-patrones descartados)",
      desc: "Descartar: app móvil genérica para crisis complejas, video >120s, logos en 0:00-0:20, sufijo -INNOVA trillado o falta de cotización mayorista.",
      risk: "Incurrir en cualquiera de estos 11 patrones condena la propuesta al promedio o al descarte inmediato por el tribunal."
    }
  ];
}

function getOfficialNomenclatures() {
  const isLatam = state.rally_type === "latam";
  const rawTeam = state.team_name || "NOMBRE_EQUIPO";
  const teamClean = rawTeam.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9_]/g, "_").replace(/_+/g, "_");
  const chalId = (state.challenge_id || "01").toString().padStart(2, "0");
  const chal = OFFICIAL_CHALLENGES_2026.find(c => c.id === chalId) || (state.challenges && state.challenges.find(c => c.id === chalId)) || { title: "Innovación Tecnológica" };
  const shortTitle = chal.title.split(" ").slice(0, 6).join(" ");

  if (isLatam) {
    return {
      pdfName: `${(state.university || "SEDE").split(/\s+/)[0].toUpperCase()}_Reto${chalId}_${teamClean}_PAUTADO.pdf`,
      ytTitle: `${rallyProfile().name} ${RALLY_YEAR} - Desafío ${chalId}: ${shortTitle} - Equipo ${teamClean}`,
      hashtags: rallyTags(),
      tiktokTip: "Subir video de interacción lúdica antes de las 08:00 PM (Viernes) para garantizar indexación en el feed y acumulación de métricas antes de la deliberación del jurado.",
      regimenDesc: `Certamen internacional de ${RALLY_PROFILES.latam.hours} horas continuas. Exige estricta coincidencia de datos y link público/no listado.`
    };
  } else {
    return {
      pdfName: `${RALLY_YEAR}_Desafio${chalId}_${teamClean}_PAUTADO.pdf`,
      ytTitle: `${rallyProfile().name} ${RALLY_YEAR} - Reto ${chalId}: ${shortTitle} - ${teamClean}`,
      hashtags: rallyTags(),
      tiktokTip: "Subir cápsula audiovisual de prototipo antes de las 08:00 PM para verificación temprana de los enlaces en la plataforma territorial.",
      regimenDesc: `Certamen nacional territorial de ${RALLY_PROFILES.nacional.hours} horas continuas con sede oficial.`
    };
  }
}

// Cronogramas por defecto (Nacional 24h y Latam 28h)
const DEFAULT_SCHEDULES = {
  nacional: [
    { time: "08:00 AM (Vie)", action: "Apertura oficial de retos en plataforma central y descarga de matrices.", risk: "Elegir reto sin evaluar precedentes satura la ideación.", level: "info" },
    { time: "12:00 PM (Vie)", action: "Límite fatal de inscripción de equipo y validación en la sede.", risk: "Descalificación automática si no hay registro al mediodía.", level: "critical" },
    { time: "08:00 PM (Vie)", action: "Ventana óptima para video TikTok de interacción lúdica.", risk: "Subir tarde resta visibilidad antes de la deliberación.", level: "warning" },
    { time: "T-6 Horas", action: "Congelamiento de claims y arquitectura técnica de la propuesta.", risk: "Cambiar arquitectura a última hora arruina guiones y renders.", level: "warning" },
    { time: "T-4 Horas", action: "Pautado oficial auditado (5 bloques) y presupuesto verificado con cotizaciones.", risk: "Exceder caracteres con espacios trunca el guardado.", level: "warning" },
    { time: "T-2 Horas", action: "Exportación final de video pitch (1080p, ≤119s) y carga en YouTube 'No listado'.", risk: "YouTube tarda 20-30 min en procesar versión Full HD.", level: "critical" },
    { time: "T-1 Hora", action: "Verificar link en ventana de incógnito y subir PDF del pautado oficial.", risk: "Video en 'Privado' recibe calificación de 0 puntos.", level: "critical" },
    { time: "T-0 Inmutable", action: "Cierre definitivo de plataforma y confirmación de comprobante en pantalla.", risk: "Cierre automático al segundo exacto sin prórroga.", level: "critical" }
  ],
  latam: [
    { time: "08:00 AM (Vie)", action: "Apertura de retos internacionales y selección preliminar de problemática.", risk: "No validar pertinencia con la matriz continental retrasa el avance.", level: "info" },
    { time: "12:00 PM (Vie)", action: "Confirmación obligatoria del equipo en el sistema SIRLI Latam.", risk: "Inhabilitación automática sin posibilidad de apelación.", level: "critical" },
    { time: "07:00 PM (Vie)", action: "Publicación de video TikTok de integración y difusión regional.", risk: "Pérdida del puntaje de interacción social en la rúbrica.", level: "warning" },
    { time: "T-8 Horas", action: "Bloqueo definitivo de la tesis técnica y modelo de negocio CANVAS.", risk: "Replantear la solución divide esfuerzos a horas del cierre.", level: "warning" },
    { time: "T-5 Horas", action: "Cierre de memoria técnica pautada y cálculo de impacto socioeconómico.", risk: "Incongruencia entre pautado y video causa penalización severa.", level: "warning" },
    { time: "T-2 Horas", action: "Subida de video pitch reglamentario (≤120s, YouTube no listado o público).", risk: "Demoras de transcodificación en YouTube dejan el link inaccesible.", level: "critical" },
    { time: "T-1 Hora", action: "Carga final del reporte PDF oficial con nomenclatura Continental.", risk: "Fallo de red a última hora impide emitir el hash de entrega.", level: "critical" },
    { time: "T-0 Inmutable (12:00 PM Sáb)", action: "Cierre fatal del certamen de 28 horas continuas.", risk: "El servidor rechaza solicitudes al milisegundo exacto.", level: "critical" }
  ]
};

function getActiveSchedule() {
  if (Array.isArray(state.custom_schedule) && state.custom_schedule.length > 0) {
    return state.custom_schedule;
  }
  const type = state.rally_type === "latam" ? "latam" : "nacional";
  return DEFAULT_SCHEDULES[type];
}

function switchTimelineSubtab(subtab) {
  state.timeline_subtab = subtab;
  saveState();
  if (activeTab === "timeline") {
    renderTab("timeline");
  }
}

function toggleGuardrail(key, event) {
  if (event) event.stopPropagation();
  if (!state.guardrails) {
    state.guardrails = {
      team_sirli_registered: false,
      video_duration_ok: true,
      video_unlisted_or_public: false,
      naming_pdf_ok: false,
      hashtags_included: false,
      pautado_chars_ok: false
    };
  }
  state.guardrails[key] = !state.guardrails[key];
  saveState();
  const card = document.getElementById(`guardrail-card-${key}`);
  if (card) {
    const isChecked = !!state.guardrails[key];
    card.classList.toggle("checked", isChecked);
    const box = card.querySelector(".guardrail-checkbox-square");
    if (box) box.innerHTML = isChecked ? SVG.check : "";
  } else if (activeTab === "timeline") {
    renderTab("timeline");
  }

  const verified = Object.values(state.guardrails || {}).filter(Boolean).length;
  const total = guardrailDefs().length;
  const subnavCounter = document.getElementById("timeline-subnav-verified");
  if (subnavCounter) subnavCounter.textContent = `${verified}/${total}`;

  updateInspector();
}

function toggleGuardrailAccordion(key) {
  if (!state.expanded_guardrails) state.expanded_guardrails = {};
  state.expanded_guardrails[key] = !state.expanded_guardrails[key];
  saveState();
  const card = document.getElementById(`guardrail-card-${key}`);
  if (card) {
    card.classList.toggle("expanded", !!state.expanded_guardrails[key]);
  } else if (activeTab === "timeline") {
    renderTab("timeline");
  }
}

function toggleAllGuardrails(expand) {
  state.expanded_guardrails = {};
  guardrailDefs().forEach(g => {
    state.expanded_guardrails[g.key] = !!expand;
    const card = document.getElementById(`guardrail-card-${g.key}`);
    if (card) card.classList.toggle("expanded", !!expand);
  });
  saveState();
}

function toggleScheduleAIPanel() {
  state.schedule_ai_open = !state.schedule_ai_open;
  saveState();
  const box = document.querySelector(".schedule-ai-box");
  if (box) {
    box.classList.toggle("collapsed", !state.schedule_ai_open);
  } else if (activeTab === "timeline") {
    renderTab("timeline");
  }
}

function parseScheduleWithAI() {
  const textarea = document.getElementById("input-schedule-raw");
  const rawText = textarea ? textarea.value.trim() : "";
  if (!rawText) {
    showToast("Pega primero el texto del cronograma");
    return;
  }

  const lines = rawText.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
  const parsed = [];
  const timeRegex = /(?:\b(?:T[-–]\s*\d+\s*(?:horas?|hrs?|h)?|\d{1,2}[:.]\d{2}\s*(?:AM|PM|am|pm|hrs?|h)?|\d{1,2}\s*(?:AM|PM|am|pm)|Hito\s*\d+|Viernes|Sábado|Domingo)[^:–—\-,]*)/i;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (/^(cronograma|agenda|horario|calendario|programa)\b/i.test(line) && line.length < 30) continue;

    let time = "";
    let action = "";
    let risk = "";

    const match = line.match(timeRegex);
    if (match) {
      time = match[0].trim().replace(/^[-*•\d+.)\s]+/, "");
      action = line.replace(match[0], "").replace(/^[:–—\-,\s]+/, "").trim();
    } else {
      const parts = line.split(/[:–—]/);
      if (parts.length > 1 && parts[0].length < 25) {
        time = parts[0].replace(/^[-*•\d+.)\s]+/, "").trim();
        action = parts.slice(1).join(" - ").trim();
      } else {
        time = `Hito ${parsed.length + 1}`;
        action = line.replace(/^[-*•\d+.)\s]+/, "").trim();
      }
    }

    if (!action) action = line;

    const lower = (line + " " + action).toLowerCase();
    let level = "info";
    if (/cierre|descalificaci[oó]n|l[ií]mite|fatal|inmutable|0 puntos|privad[oa]|penalizaci[oó]n|estricto/.test(lower)) {
      level = "critical";
      risk = "Riesgo crítico de descalificación o bloqueo si no se cumple a tiempo.";
    } else if (/alerta|advertencia|tarde|cuidado|[oó]ptim[oa]|riesgo|trunca|retraso/.test(lower)) {
      level = "warning";
      risk = "Posible impacto negativo en evaluación o saturación en plataforma.";
    } else {
      level = "info";
      risk = "Requisito operativo de seguimiento y sincronización del equipo.";
    }

    parsed.push({ time, action, risk, level });
  }

  if (parsed.length === 0) {
    showToast("No se detectaron hitos claros en el texto");
    return;
  }

  state.custom_schedule = parsed;
  state.schedule_ai_open = false;
  state.schedule_raw_text = rawText;
  saveState();
  showToast(`Cronograma procesado: ${parsed.length} hitos estructurados`);
  if (activeTab === "timeline") {
    renderTab("timeline");
  }
}

function resetScheduleToDefault() {
  state.custom_schedule = null;
  state.schedule_raw_text = "";
  saveState();
  showToast("Cronograma restablecido al formato oficial");
  if (activeTab === "timeline") {
    renderTab("timeline");
  }
}

function removeScheduleMilestone(idx) {
  const current = getActiveSchedule();
  const next = [...current];
  next.splice(idx, 1);
  state.custom_schedule = next;
  saveState();
  if (activeTab === "timeline") {
    renderTab("timeline");
  }
}
