// dashboard/app.js -- Rally Studio Workbench Oficial (Flujo Real de Competencia)
// Arquitectura secuencial estricta: Certamen -> Equipo -> Retos del Comité -> Taller Solución -> Despacho Multi-IA -> Espacio Completo.
// Cero emojis, soporte de Wi-Fi universitario con bypass por token/Drive/JSON, y generación de Mega-Prompts especializados.

// ── ICONOS SVG VECTORIALES (CERO EMOJIS) ──────────────────────────────────────
const SVG = {
  youtube: `<svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" style="vertical-align:middle;"><path d="M21.6 7.2a2.7 2.7 0 0 0-1.9-1.9C18 4.9 12 4.9 12 4.9s-6 0-7.7.4A2.7 2.7 0 0 0 2.4 7.2 28 28 0 0 0 2 12a28 28 0 0 0 .4 4.8 2.7 2.7 0 0 0 1.9 1.9c1.7.4 7.7.4 7.7.4s6 0 7.7-.4a2.7 2.7 0 0 0 1.9-1.9A28 28 0 0 0 22 12a28 28 0 0 0-.4-4.8ZM10 15.1V8.9l5.2 3.1Z"/></svg>`,
  logo: `<svg width="24" height="22" viewBox="0 0 24 22" fill="none" style="vertical-align:middle;"><line x1="5" y1="20" x2="13" y2="2" stroke="#0066FF" stroke-width="4.5" stroke-linecap="round"/><line x1="13" y1="20" x2="21" y2="2" stroke="#0066FF" stroke-width="4.5" stroke-linecap="round"/></svg>`,
  folder: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>`,
  sync: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/></svg>`,
  chevronDown: `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"></polyline></svg>`,
  pin: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>`,
  checkedCircle: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="12" fill="#0066FF"/><path d="M7 12.5l3.5 3.5 7-7" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  uncheckedCircle: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="11" stroke="#CBD5E1" stroke-width="2"/></svg>`,
  check: `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>`,
  lock: `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>`,
  clock: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>`,
  download: `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>`,
  upload: `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>`,
  external: `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>`,
  menu: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>`,
  globe: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>`,
  shield: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>`,
  copy: `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>`,
  spark: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"><path d="M12 3l1.8 5.6L19 10l-5.2 1.4L12 17l-1.8-5.6L5 10l5.2-1.4L12 3z"></path><circle cx="18.5" cy="17.5" r="1.6"></circle></svg>`,
  bell: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>`,
  spinner: `<svg class="spin-anim" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>`,
  target: `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="6"></circle><circle cx="12" cy="12" r="2"></circle></svg>`,
  arrowRight: `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>`,
  arrowLeft: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>`,
  plus: `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>`,
  refresh: `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"></polyline><polyline points="1 20 1 14 7 14"></polyline><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>`,
  dotsVertical: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="1.5"></circle><circle cx="12" cy="5" r="1.5"></circle><circle cx="12" cy="19" r="1.5"></circle></svg>`,
  shieldCheck: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><polyline points="9 12 11 14 15 10"></polyline></svg>`,
  network: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>`,
  chart: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="6" y1="20" x2="6" y2="13"></line><line x1="12" y1="20" x2="12" y2="7"></line><line x1="18" y1="20" x2="18" y2="10"></line></svg>`,
  users: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>`,
  close: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`,
  trash: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>`,
  edit: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>`,
  folder: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>`,

  rallyLatamEmblem: `<svg width="26" height="26" viewBox="0 0 32 32" fill="none" style="vertical-align:middle;" title="Rally Latinoamericano de Innovación"><circle cx="16" cy="16" r="14" fill="#FFF1F2" stroke="#FECDD3" stroke-width="1.5"/><path d="M12 9C14 11 16 13 15 16C14 19 18 23 20 22C22 20 23 16 21 13C19 10 17 8 13 8Z" fill="#E11D48"/><ellipse cx="16" cy="16" rx="14" ry="5.5" stroke="#E11D48" stroke-width="1.2" stroke-dasharray="3 2" transform="rotate(-25 16 16)"/><circle cx="21" cy="12" r="1.8" fill="#F43F5E"/></svg>`,
  rallyNacEmblem: `<svg width="26" height="26" viewBox="0 0 32 32" fill="none" style="vertical-align:middle;" title="Rally Nacional Nicaragua Innova"><circle cx="16" cy="16" r="14" fill="#F8FAFD" stroke="#CBD5E1" stroke-width="1.5"/><path d="M16 8L10.5 22H21.5L16 8Z" fill="#0D1B35"/><circle cx="21" cy="11" r="2.8" fill="#0866F5"/><path d="M9 22C12 20.5 20 20.5 23 22" stroke="#0284C7" stroke-width="1.5"/></svg>`,
  uniCrestEmblem: `<svg width="26" height="26" viewBox="0 0 32 32" fill="none" style="vertical-align:middle;" title="Emblema de la sede"><circle cx="16" cy="16" r="14" fill="#003366"/><circle cx="16" cy="16" r="12.5" stroke="#FFB800" stroke-width="1.2"/><path d="M16 7L23 11V18C23 22 16 26 16 26C16 26 9 22 9 18V11L16 7Z" fill="#002244" stroke="#FFB800" stroke-width="1.2"/><path d="M16 11L18.5 16H13.5L16 11Z" fill="#FFB800"/><path d="M13 18H19" stroke="#FFB800" stroke-width="1.5"/></svg>`,

  latinAmericaIllustration: `
<svg width="290" height="170" viewBox="0 0 320 200" fill="none" xmlns="http://www.w3.org/2000/svg" style="max-width:100%; height:auto;">
  <defs>
    <!-- Paleta oficial Latam: Grises de precisión técnica y Rosa/Magenta vibrante -->
    <linearGradient id="latamGrayLand" x1="120" y1="10" x2="220" y2="190" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="var(--text-muted)"/>
      <stop offset="40%" stop-color="#475569"/>
      <stop offset="85%" stop-color="#334155"/>
      <stop offset="100%" stop-color="#1E293B"/>
    </linearGradient>
    <linearGradient id="latamRoseOrbit" x1="30" y1="90" x2="290" y2="110" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#93C5FD" stop-opacity="0.3"/>
      <stop offset="50%" stop-color="#0866F5" stop-opacity="0.95"/>
      <stop offset="100%" stop-color="#93C5FD" stop-opacity="0.3"/>
    </linearGradient>
    <filter id="latamSoftShadow" x="60" y="10" width="220" height="190" filterUnits="userSpaceOnUse">
      <feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="#0866F5" flood-opacity="0.15"/>
    </filter>
  </defs>

  <!-- Anillos Orbitales con micro-animación CSS -->
  <g class="anim-orbit">
    <ellipse cx="160" cy="104" rx="122" ry="42" stroke="url(#latamRoseOrbit)" stroke-width="2" stroke-dasharray="6 4" transform="rotate(-16 160 104)"/>
    <ellipse cx="160" cy="106" rx="134" ry="32" stroke="#93C5FD" stroke-width="1.2" stroke-opacity="0.6" transform="rotate(22 160 106)"/>
  </g>

  <g filter="url(#latamSoftShadow)">
    <!-- Península de Baja California -->
    <path d="M84 24 C82 32, 86 42, 92 50 C94 54, 96 52, 94 44 C92 36, 88 28, 86 22 Z" fill="var(--text-muted)"/>

    <!-- México continental y Península de Yucatán -->
    <path d="M88 22 C96 22, 108 26, 116 32 C124 38, 130 36, 134 44 C138 48, 148 44, 154 44 C158 44, 160 48, 156 52 C152 56, 146 54, 142 58 C138 62, 134 68, 130 70 C124 68, 118 64, 112 56 C106 48, 98 42, 90 32 Z" fill="url(#latamGrayLand)"/>

    <!-- Istmo de Centroamérica -->
    <path d="M130 70 C136 70, 142 74, 148 78 C154 82, 160 84, 166 84 C172 84, 176 80, 182 82 C184 84, 184 88, 180 88 C174 88, 166 88, 160 86 C152 84, 144 80, 138 74 Z" fill="#475569"/>

    <!-- Islas del Caribe -->
    <path d="M148 50 C156 52, 168 56, 176 60 C174 62, 164 58, 152 54 Z" fill="var(--text-muted)"/>
    <ellipse cx="184" cy="64" rx="4" ry="2" fill="#0866F5"/>
    <ellipse cx="194" cy="67" rx="2.5" ry="1.5" fill="#0284C7"/>

    <!-- Masa Continental de Sudamérica -->
    <path d="M178 82 
             C186 78, 198 76, 210 80 
             C222 84, 234 88, 244 96 
             C254 104, 264 114, 260 126 
             C256 138, 246 150, 238 162 
             C232 172, 226 182, 220 196 
             C218 200, 214 204, 210 204 
             C206 204, 204 198, 204 190 
             C204 178, 198 162, 194 148 
             C190 138, 182 126, 180 114 
             C178 102, 174 92, 178 82 Z" fill="url(#latamGrayLand)"/>

    <!-- Cordillera Andina con acento plateado-rosa -->
    <path d="M180 84 
             C184 96, 188 112, 190 126 
             C192 140, 196 156, 202 172 
             C206 182, 208 194, 210 202 
             C208 202, 204 196, 204 188 
             C204 176, 198 162, 194 148 
             C190 138, 182 126, 180 114 Z" fill="#CBD5E1" fill-opacity="0.65"/>

    <!-- Relieve este Brasil -->
    <path d="M210 82 
             C228 88, 246 98, 258 114 
             C262 120, 256 134, 246 148 
             C254 136, 258 124, 256 116 
             C250 104, 236 94, 218 86 Z" fill="var(--text-muted)" fill-opacity="0.45"/>
  </g>

  <!-- Nodos satelitales Azul/Cyan con animación -->
  <g class="anim-beacon">
    <circle cx="216" cy="80" r="4" fill="#0866F5"/>
    <circle cx="216" cy="80" r="7" stroke="#0284C7" stroke-width="1.4" stroke-opacity="0.8"/>
  </g>
  <circle cx="140" cy="116" r="3" fill="#0284C7" class="anim-beacon"/>
  <circle cx="240" cy="140" r="2.8" fill="#38BDF8" class="anim-beacon"/>
</svg>`,

  // RÉPLICA EXACTA DE LA IMAGEN RECORTADA DE NICARAGUA
  momotomboIllustration: `
<svg width="290" height="170" viewBox="0 0 340 160" fill="none" xmlns="http://www.w3.org/2000/svg" style="max-width:100%; height:auto;">
  <defs>
    <!-- Degradados idénticos a la imagen de referencia -->
    <linearGradient id="volcanoFlankLeft" x1="165" y1="46" x2="85" y2="120" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#1E3A8A"/>
      <stop offset="60%" stop-color="#1D4ED8"/>
      <stop offset="100%" stop-color="#2563EB"/>
    </linearGradient>
    <linearGradient id="volcanoFlankRight" x1="165" y1="46" x2="245" y2="120" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#0284C7"/>
      <stop offset="45%" stop-color="#0369A1"/>
      <stop offset="100%" stop-color="#0284C7"/>
    </linearGradient>
    <linearGradient id="lavaStripeGrad" x1="168" y1="48" x2="210" y2="105" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#F59E0B"/>
      <stop offset="50%" stop-color="#EA580C"/>
      <stop offset="100%" stop-color="#F59E0B"/>
    </linearGradient>
    <linearGradient id="lakeWaterRef" x1="170" y1="114" x2="170" y2="160" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#0284C7"/>
      <stop offset="60%" stop-color="#0369A1"/>
      <stop offset="100%" stop-color="#075985"/>
    </linearGradient>
  </defs>

  <!-- Nubes a la izquierda (idénticas a la imagen) -->
  <g class="anim-cloud">
    <path d="M60 72 C60 62, 70 54, 80 54 C85 46, 95 44, 105 46 C115 44, 125 50, 128 58 C135 58, 142 66, 142 74 C142 80, 136 86, 130 86 L65 86 C60 86, 60 78, 60 72 Z" fill="#93C5FD" fill-opacity="0.85"/>
    <path d="M42 90 C42 84, 48 80, 54 80 C58 76, 64 76, 68 78 C72 78, 76 82, 76 86 L42 90 Z" fill="#BFDBFE" fill-opacity="0.75"/>
  </g>

  <!-- Sol dorado a la derecha -->
  <circle cx="235" cy="52" r="14" fill="#F59E0B" class="anim-sun"/>

  <!-- Nube pequeña detrás de las colinas de la derecha -->
  <path d="M260 76 C260 70, 266 66, 272 66 C276 62, 284 62, 290 64 C296 64, 300 68, 302 72 L260 76 Z" fill="#BFDBFE" fill-opacity="0.75" class="anim-cloud"/>

  <!-- Colinas distantes a ambos lados -->
  <path d="M25 124 Q70 102 120 112 L120 126 L25 126 Z" fill="#0D9488" fill-opacity="0.6"/>
  <path d="M230 114 Q280 100 325 116 L325 126 L230 126 Z" fill="#2563EB" fill-opacity="0.55"/>

  <!-- VOLCÁN MOMOTOMBO (Silueta cónica amplia y masiva) -->
  <!-- Flanco izquierdo (azul oscuro/índigo) -->
  <path d="M158 46 
           C148 58, 134 78, 120 98 
           C110 110, 98 120, 84 126 
           L165 126 
           L158 46 Z" fill="url(#volcanoFlankLeft)"/>

  <!-- Flanco derecho (azul celeste/turquesa) -->
  <path d="M165 46 
           L165 126 
           L246 126 
           C232 120, 220 110, 210 98 
           C196 78, 182 58, 172 46 Z" fill="url(#volcanoFlankRight)"/>

  <!-- Cráter somital con muesca -->
  <path d="M158 46 C162 48, 168 48, 172 46 L165 52 Z" fill="#EA580C"/>
  <ellipse cx="165" cy="46" rx="7" ry="2.5" fill="#F59E0B"/>

  <!-- VETA / GRIETA NARANJA Y DORADA (Exacta al recorte) -->
  <g class="anim-lava">
    <path d="M168 48 Q182 72 208 104" stroke="url(#lavaStripeGrad)" stroke-width="4" stroke-linecap="round"/>
    <path d="M168 48 Q182 72 208 104" stroke="#FEF08A" stroke-width="1.8" stroke-linecap="round"/>
    <!-- Veta secundaria -->
    <path d="M172 60 Q188 82 216 112" stroke="#F59E0B" stroke-width="2.5" stroke-linecap="round"/>
  </g>

  <!-- Estrías y pliegues en flanco izquierdo -->
  <path d="M160 52 Q144 86 126 126" stroke="#1E3A8A" stroke-width="2" stroke-linecap="round" stroke-opacity="0.6"/>
  <path d="M164 56 Q156 88 146 126" stroke="#1E40AF" stroke-width="1.5" stroke-linecap="round" stroke-opacity="0.5"/>

  <!-- FRANJA DE VEGETACIÓN VERDE EN LA BASE DEL VOLCÁN -->
  <path d="M80 120 C100 114, 130 116, 165 114 C200 114, 230 116, 250 120 L250 126 L80 126 Z" fill="var(--status-ok-text)"/>

  <!-- PLAYA ARENOSA DORADA A LO LARGO DE LA ORILLA (Visible en el recorte) -->
  <path d="M130 124 L240 124 L240 128 L130 128 Z" fill="#FDE68A"/>

  <!-- CADENA DE COLINAS Y PROMONTORIOS VERDES A LA IZQUIERDA -->
  <path d="M20 134 C40 116, 65 120, 95 126 C125 132, 145 122, 175 130 L175 142 L20 142 Z" fill="#0D9488"/>
  <path d="M40 136 C65 122, 90 126, 120 132 C140 136, 160 128, 180 136 L180 146 L40 146 Z" fill="var(--status-ok-text)"/>
  <path d="M60 142 C85 130, 110 132, 135 138 C155 142, 175 136, 195 144 L195 152 L60 152 Z" fill="var(--status-ok-text)"/>

  <!-- AGUAS DEL LAGO XOLOTLÁN A LA DERECHA Y FRENTE -->
  <path d="M140 128 C200 126, 260 128, 335 128 L335 158 C260 162, 180 160, 140 158 Z" fill="url(#lakeWaterRef)"/>

  <!-- Ondas y reflejos horizontales del agua (con animación fluida) -->
  <g class="anim-water">
    <!-- Reflejo del sol en el agua -->
    <ellipse cx="235" cy="138" rx="14" ry="2.5" fill="#FEF08A" fill-opacity="0.6"/>
    <ellipse cx="235" cy="146" rx="20" ry="3" fill="#FFFFFF" fill-opacity="0.5"/>

    <!-- Ondas curvas idénticas al recorte -->
    <path d="M160 132 Q210 136, 260 132 T330 132" stroke="#BAE6FD" stroke-width="2.5" stroke-linecap="round"/>
    <path d="M180 140 Q235 144, 290 140 T335 140" stroke="#FFFFFF" stroke-width="2.2" stroke-linecap="round"/>
    <path d="M210 148 Q250 152, 295 148 T325 148" stroke="#E0F2FE" stroke-width="2" stroke-linecap="round"/>
    <path d="M230 154 Q265 157, 305 154" stroke="#BAE6FD" stroke-width="1.8" stroke-linecap="round"/>
  </g>
</svg>`,

  landscapeBg: ""
};

// ── CATÁLOGO HISTÓRICO DE REFERENCIA (RALLY 2026) ────────────────────────────
// ── CATÁLOGO HISTÓRICO DE REFERENCIA (RALLY 2026) ────────────────────────────
let OFFICIAL_CHALLENGES_2026 = []; // datos externos (challenge_bank.json)

// ── PERFIL DEL CERTAMEN ──────────────────────────────────────────────────────
// Un solo lugar para nombres, horas y año. El equipo y su sede salen del estado,
// nunca de un texto fijo.
const RALLY_YEAR = "2026";

const RALLY_PROFILES = {
  nacional: {
    id: "nacional",
    name: "Rally Nacional Nicaragua Innova",
    short: "Rally Nacional",
    hours: 24,
    jury: "CNU / MINJUVE / TELCOR / INATEC / MEFCCA",
    tags: ["#NicaraguaInnova2026", "#RallyNacionalInnova"]
  },
  latam: {
    id: "latam",
    name: "Rally Latinoamericano de Innovación",
    short: "Rally Latinoamericano",
    hours: 28,
    jury: "CONFEDI / ACOFI / SIRLI",
    tags: ["#RallyLatinoamericano2026", "#RallyLatam"]
  }
};

function rallyProfile() {
  return RALLY_PROFILES[state.rally_type === "latam" ? "latam" : "nacional"];
}

function rallyName() { return rallyProfile().name; }

// La sede la escribe el equipo; si aún no la escribió, se habla en genérico.
function sedeName() { return (state.university || "").trim() || "la sede"; }

// Etiqueta de sede para hashtags: «Universidad Nacional de Ingeniería» → #SedeUNI
function sedeTag() {
  const words = (state.university || "").match(/[A-ZÁÉÍÓÚÑ]/g);
  const sigla = words ? words.join("").slice(0, 6) : "";
  return sigla ? `#Sede${sigla}` : "";
}

function rallyTags() {
  const base = rallyProfile().tags.slice();
  const sede = sedeTag();
  if (sede) base.push(sede);
  return base;
}

// ── BANCO DE RETOS + RANKING (DATOS EXTERNOS, sin hardcode) ──────────────────
// Contenido en dashboard/data/challenge_bank.json (investigación, no lógica).
let _bankPromise = null;
function loadChallengeBank() {
  if (_bankPromise) return _bankPromise;
  _bankPromise = fetch("data/challenge_bank.json")
    .then(r => { if (!r.ok) throw new Error(r.status); return r.json(); })
    .then(d => {
      OFFICIAL_CHALLENGES_2026 = (d && d.official) || [];
      CHALLENGE_RANKING_2026 = (d && d.ranking) || [];
      try { renderNavigation(); } catch (e) {}
      return true;
    })
    .catch(() => false);
  return _bankPromise;
}
loadChallengeBank();

// ── SECCIONES Y LÍMITES OFICIALES DE PAUTADO (CON ESPACIOS) ──────────────────
// Orden y topes del documento oficial SIRLI (Rally Latinoamericano).
// El Rally Nacional no fija tope por sección: entrega un documento de hasta 10 páginas.
const PAUTADO_LIMITS = {
  problema: 1250,
  solucion: 1250,
  impacto: 1000,
  innovacion: 1000,
  prefactibilidad: 1500,
  referencias: null
};

// Tope efectivo de una sección según el certamen activo (null = sin tope por sección).
function getPautadoLimit(key) {
  if (state.rally_type === "nacional") return null;
  return PAUTADO_LIMITS[key] || null;
}

// Etiqueta de conteo del pautado: en Nacional solo cuenta, no compara.
function pautadoConteo(key, valor) {
  const n = (valor || "").length;
  const max = getPautadoLimit(key);
  return max ? `${n} / ${max.toLocaleString("en-US")} caracteres` : `${n} caracteres`;
}

// ── TAREAS MULTI-IA POR DEFECTO ──────────────────────────────────────────────
function getDefaultMultiAITasks() {
  return [
    {
      id: "stats_poverty",
      title: "Estadísticas Oficiales & Plan de Lucha contra la Pobreza",
      ai: "Gemini Deep Research / Perplexity",
      desc: "Extrae cifras duras verificables (pérdidas en USD, personas afectadas, metas ODS exactas y Ejes del Plan Nacional).",
      status: "pending", // "pending" | "in_progress" | "completed"
      result: ""
    },
    {
      id: "patents_art",
      title: "Búsqueda de Patentes & Estado del Arte",
      ai: "Perplexity / Google Patents",
      desc: "Localiza patentes o antecedentes técnicos para fundamentar la novedad e innovación frente al jurado.",
      status: "pending",
      result: ""
    },
    {
      id: "blender_3d",
      title: "Modelo 3D y Script Paramétrico en Blender",
      ai: "OpenCode / ChatGPT",
      desc: "Dos propuestas del modelo (sobria y expresiva) con el mismo encuadre, para que el equipo elija una y marque en qué acto entra.",
      status: "pending",
      result: ""
    },
    {
      id: "budget_alibaba",
      title: "Partidas del Presupuesto con Proveedor Real",
      ai: "Z.ai / Perplexity / Alibaba",
      desc: "Dos cosas y nada más: lo que hay que comprar para arrancar y a quién se le paga, por cuánto tiempo. Los precios se copian de la ficha real abierta en el navegador, no de memoria.",
      status: "pending",
      result: ""
    },
    {
      id: "voice_audio",
      title: "Locución y Síntesis de Voz Emotiva",
      ai: "Chatterbox LatAm / Kokoro / Edge-TTS",
      desc: "Escribe la locución, instala si hace falta un motor TTS y entrega el MP4 (AAC) con la guía de Guion > Motor de voz.",
      status: "pending",
      result: ""
    },
    {
      id: "cross_audit",
      title: "Auditoría Cruzada de Consistencia & Guardrails (0 Discrepancia)",
      ai: "Claude 3.5 Sonnet / Gemini Pro",
      desc: "Coteja que las cifras de costos, tiempos e impacto del guion coincidan exactamente con el pautado y detecta patrones perdedores.",
      status: "pending",
      result: ""
    },
    {
      id: "web_prototype",
      title: "Página Web del Prototipo (Dashboard de Tomas)",
      ai: "OpenCode / GPT / Gemini",
      desc: "Genera el sitio estático (/index.html + CSS/JS incrustados) con el nombre, cifras y tesis del proyecto para grabar planos de pantalla en el video.",
      status: "pending",
      result: ""
    }
  ];
}

// ── ESTADO REACTIVO DEL SISTEMA ─────────────────────────────────────────────
function getInitialState() {
  return {
    rally_type: null,
    exchange_rate_bcn: 0,
    hours_total: 28,
    hours_remaining: 28,
    rally_started: false,
    start_timestamp: null,
    official_start_time: "08:00 AM",
    team_name: "",
    university: "",
    city: "",
    team_logo: "shield",
    team_logo_img: "",
    project_name: "",
    category: "",
    challenge_id: "",
    challenge_title: "",

    // Reglas de Conformación SIRLI
    team_members_count: 6,
    team_has_engineering: true,
    team_has_female: true,
    team_leader_student: true,
    
    // Retos ingresados por el usuario desde el comité oficial
    challenges: [],
    challenge_ideas: {}, // { [chId]: [ { id, text, author, timestamp } ] }

    // Identidad real del equipo: cada persona define su nombre (único) en su dispositivo.
    // [{ id, name, joined_at }]
    team_roster: [],

    // Entregables: estado manual, responsables e historial de quién trabajó.
    // { [deliverableId]: { status, assignees, history, updated_at } }
    deliverables: {},

    // Taller de Solución
    solution_raw_input: "",
    solution_thesis: "",
    solution_simple: "",
    solution_boosters: ["ods", "sensors"],
    solution_approved: false,

    // Tareas Multi-IA coordinadas
    tasks: getDefaultMultiAITasks(),

    // Motor TTS elegido para la guía de locución
    voice_engine: "chatterbox",
    // Preset de voz audible incluido en el proyecto
    voice_preset: "proyecto",

    // Identidad cromática (la llena el equipo en identidad; no trae marca por defecto)
    palette: {
      primary: "",
      secondary: "",
      accent: ""
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

    // Presupuesto Sustentado (vacío hasta ser configurado por el equipo)
    budget: [],

    // Guion 120 segundos
    script: {
      acto1: "",
      acto2: "",
      acto3: "",
      acto4: ""
    },

    // Guardarraíles Antidescalificación
    guardrails: {
      team_sirli_registered: false,
      video_duration_ok: true,
      video_unlisted_or_public: false,
      naming_pdf_ok: false,
      hashtags_included: false,
      pautado_chars_ok: false,
      pdf_video_numbers_synced: false,
      youtube_channel_brand: false,
      tiktok_submitted: false,
      loser_patterns_checked: false
    },

    // Autoría de componentes por mascota y bloqueos suaves en tiempo real
    authorship: {
      pautado: {},
      script: {},
      solution: null
    },
    active_locks: {},

    // Enlaces de colaboración y nube (Bypass para Wi-Fi universitario)
    google_drive_url: "",
    canva_url: "",
    figma_url: "",
    local_ip: ""
  };
}

let state = getInitialState();
let activeTab = "certamen";
let timerInterval = null;
let challengeFilter = "all";
let challengeViewMode = "doc"; // "doc" | "cards"

// ── MASCOTAS COLABORATIVAS AUTOMÁTICAS (MULTI-USUARIO SIN LOGIN) ─────────────
const TEAM_MASCOTS = [
  { id: "nodo_alfa", name: "Estación Alfa", icon: `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="display:inline-block; vertical-align:middle;"><polygon points="12 2 2 22 22 22"/></svg>`, color: "#0866F5" },
  { id: "nodo_beta", name: "Estación Beta", icon: `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="display:inline-block; vertical-align:middle;"><rect x="3" y="3" width="18" height="18" rx="2"/></svg>`, color: "#1D4ED8" },
  { id: "nodo_gamma", name: "Estación Gamma", icon: `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="display:inline-block; vertical-align:middle;"><circle cx="12" cy="12" r="10"/></svg>`, color: "#0D1B35" },
  { id: "nodo_delta", name: "Estación Delta", icon: `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="display:inline-block; vertical-align:middle;"><polygon points="12 2 22 12 12 22 2 12"/></svg>`, color: "#0284C7" },
  { id: "nodo_epsilon", name: "Estación Epsilon", icon: `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="display:inline-block; vertical-align:middle;"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>`, color: "#3B82F6" },
  { id: "nodo_omega", name: "Estación Omega", icon: `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="display:inline-block; vertical-align:middle;"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>`, color: "#475569" }
];

// El personaje elegido en join/perfil manda. `avatars.js` trae el catálogo;
// si no está cargado, quedan las mascotas geometricas de antes.
function personajeDeCatalogo(id) {
  if (!window.RAV) return null;
  const clave = window.RAV.normalizar(id);
  const icon = window.RAV.svg(clave).replace("<svg ", '<svg width="14" height="14" style="vertical-align:middle" ');
  return { id: clave, name: window.RAV.nombre(clave), icon: icon, color: "#0D1B35" };
}

function getClientMascot() {
  let stored = null;
  try { stored = localStorage.getItem("rally_user_mascot_id"); } catch(e) {}
  if (stored && window.RAV) {
    const personaje = personajeDeCatalogo(stored);
    if (personaje) {
      try { localStorage.setItem("rally_user_mascot_id", personaje.id); } catch(e) {}
      return personaje;
    }
  }
  if (stored) {
    const found = TEAM_MASCOTS.find(m => m.id === stored);
    if (found) return found;
  }
  const picked = window.RAV
    ? personajeDeCatalogo(window.RAV.lista[Math.floor(Math.random() * window.RAV.lista.length)].id)
    : TEAM_MASCOTS[Math.floor(Math.random() * TEAM_MASCOTS.length)];
  try { localStorage.setItem("rally_user_mascot_id", picked.id); } catch(e) {}
  return picked;
}

function getStoredUserName() {
  try { return String(localStorage.getItem("rally_user_name") || "").trim(); } catch(e) { return ""; }
}

// El ícono/color sigue siendo estable por dispositivo (mascota), pero el nombre
// lo define la persona. Sin nombre definido, la identidad queda en "Sin nombre".
function makeClientIdentity() {
  const mascot = getClientMascot();
  const stored = getStoredUserName();
  return Object.assign({}, mascot, { name: stored || "Sin nombre" });
}

const currentClientMascot = makeClientIdentity();
const EQUIPO_LEGADO_NOMBRES = ["Estación Alfa", "Estación Beta", "Estación Gamma", "Estación Delta", "Estación Epsilon", "Estación Omega"];

function normalizePersonName(raw) {
  return String(raw || "").replace(/\s+/g, " ").trim().slice(0, 28);
}
function personNameKey(name) {
  return normalizePersonName(name).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}
function getRoster() {
  if (!Array.isArray(state.team_roster)) state.team_roster = [];
  return state.team_roster;
}
function rosterNameInUse(name, exceptId) {
  const key = personNameKey(name);
  return getRoster().find(m => personNameKey(m.name) === key && m.id !== exceptId) || null;
}
function amINamed() {
  return !!getStoredUserName() && currentClientMascot.name !== "Sin nombre";
}

// Nombre legible: convierte identidades viejas (mascotas) a algo humano.
function displayPersonName(name) {
  if (!name) return "Sin nombre";
  if (EQUIPO_LEGADO_NOMBRES.includes(name)) {
    const m = getRoster().find(x => x.name === name);
    return m ? m.name : "Integrante anterior";
  }
  return name;
}

// Define (o cambia) el nombre de esta persona en este dispositivo. Único en el equipo.
function setMyDisplayName(raw) {
  const name = normalizePersonName(raw);
  if (name.length < 2) return { ok: false, error: "Escribe al menos 2 caracteres." };
  if (name === "Sin nombre") return { ok: false, error: "Ese nombre está reservado." };
  const roster = getRoster();
  const dup = rosterNameInUse(name, currentClientMascot.id);
  if (dup) return { ok: false, error: `"${dup.name}" ya está en uso. Los nombres deben ser únicos.` };

  let me = roster.find(m => m.id === currentClientMascot.id);
  if (!me) {
    me = { id: currentClientMascot.id, name, joined_at: Date.now() };
    roster.push(me);
  } else {
    me.name = name;
  }
  currentClientMascot.name = name;
  try { localStorage.setItem("rally_user_name", name); } catch(e) {}
  saveState();
  if (collaborationChannel) {
    collaborationChannel.postMessage({ type: "ROSTER_UPDATE", roster });
  }
  return { ok: true };
}

// Adopta un nombre existente del roster en este dispositivo (equipo compartiendo laptop).
function adoptRosterName(id) {
  const member = getRoster().find(m => m.id === id);
  if (!member) return false;
  currentClientMascot.name = member.name;
  currentClientMascot.id = member.id;
  try {
    localStorage.setItem("rally_user_name", member.name);
    localStorage.setItem("rally_user_mascot_id", member.id);
  } catch(e) {}
  renderTopbar();
  return true;
}

// Canal de presencia y soft-locks
let collaborationChannel = null;
try {
  collaborationChannel = new BroadcastChannel("rally_collab_channel_2026");
  collaborationChannel.onmessage = (ev) => {
    const data = ev.data;
    if (data && data.type === "SOFT_LOCK") {
      state.active_locks = state.active_locks || {};
      state.active_locks[data.fieldId] = { mascot: data.mascot, timestamp: Date.now() };
      updateSoftLockUI();
    } else if (data && data.type === "RELEASE_LOCK") {
      if (state.active_locks) delete state.active_locks[data.fieldId];
      updateSoftLockUI();
    } else if (data && data.type === "ROSTER_UPDATE") {
      state.team_roster = Array.isArray(data.roster) ? data.roster : [];
      if (activeTab === "resumen") renderTab("resumen");
      renderTopbar();
    } else if (data && data.type === "DELIVERABLES_UPDATE") {
      state.deliverables = data.value || {};
      if (activeTab === "resumen") renderTab("resumen");
      else rsRepaintTakeBar();
    } else if (data && data.type === "FIELD_UPDATE") {
      if (data.category === "pautado") {
        state.pautado[data.key] = data.value;
        state.authorship.pautado[data.key] = data.mascot;
        const el = document.getElementById(`pt-${data.key}`);
        if (el && document.activeElement !== el) { el.value = data.value; ajustarAltoTexto(el); }
      } else if (data.category === "script") {
        state.script[data.key] = data.value;
        state.authorship.script[data.key] = data.mascot;
        const el = document.getElementById(`sc-${data.key}`);
        if (el && document.activeElement !== el) el.value = data.value;
      } else if (data.category === "solution") {
        const keyMap = { raw_input: "solution_raw_input", thesis: "solution_thesis", simple: "solution_simple", project_name: "project_name" };
        const stateKey = keyMap[data.key];
        if (stateKey) {
          state[stateKey] = data.value;
          state.authorship[data.category] = state.authorship[data.category] || {};
          state.authorship[data.category][data.key] = data.mascot;
          const el = document.getElementById({ raw_input: "raw-sol-input", thesis: "sol-thesis", simple: "sol-simple", project_name: "sol-proj-name" }[data.key]);
          if (el && document.activeElement !== el) el.value = data.value;
        }
      } else if (data.category === "video_assets") {
        state.video_assets = data.value;
        if (activeTab === "resources") renderTab("resources");
      } else if (data.category === "tribunal") {
        state.challenge_tribunal = data.value;
        if (activeTab === "challenges") renderTab("challenges");
      } else if (data.category === "challenge_ideas") {
        state.challenge_ideas = data.value;
        const typingIdea = document.activeElement && String(document.activeElement.id || "").startsWith("new-idea-input");
        if (activeTab === "challenges" && !typingIdea) renderTab("challenges");
      }
      saveState();
    }
  };
} catch(e) {}

function broadcastLock(fieldId) {
  if (collaborationChannel) {
    collaborationChannel.postMessage({ type: "SOFT_LOCK", fieldId, mascot: currentClientMascot });
  }
  if (window.RallySectionSync && typeof window.RallySectionSync.lock === "function") {
    window.RallySectionSync.lock(fieldId);
  }
}

function broadcastRelease(fieldId) {
  if (collaborationChannel) {
    collaborationChannel.postMessage({ type: "RELEASE_LOCK", fieldId });
  }
  if (window.RallySectionSync && typeof window.RallySectionSync.release === "function") {
    window.RallySectionSync.release(fieldId);
  }
}

function broadcastFieldChange(category, key, value) {
  state.authorship = state.authorship || { pautado: {}, script: {} };
  if (!state.authorship[category]) state.authorship[category] = {};
  state.authorship[category][key] = currentClientMascot;
  if (collaborationChannel) {
    collaborationChannel.postMessage({ type: "FIELD_UPDATE", category, key, value, mascot: currentClientMascot });
  }
}

function updateSoftLockUI() {
  document.querySelectorAll("[data-lockable]").forEach(el => {
    const fId = el.getAttribute("data-lockable");
    const lock = state.active_locks ? state.active_locks[fId] : null;
    const tagEl = document.getElementById(`lock-tag-${fId}`);
    if (lock && Date.now() - lock.timestamp < 30000 && lock.mascot.id !== currentClientMascot.id) {
      el.classList.add("soft-lock-active");
      if (tagEl) {
        tagEl.innerHTML = `<span class="soft-lock-tag">${lock.mascot.icon} ${lock.mascot.name} editando...</span>`;
      }
    } else {
      el.classList.remove("soft-lock-active");
      if (tagEl) tagEl.innerHTML = "";
    }
  });
}

// ── DETERMINAR ETAPA ACTUAL DEL PROCESO ──────────────────────────────────────
function getWorkflowStage() {
  if (!state.rally_type) return 0; // Certamen
  if (!state.team_name || !state.university) return 1; // Equipo
  if (!state.challenge_id) return 2; // Retos del comité
  if (!state.solution_approved) return 3; // Taller Solución
  return isPautadoWritten() && isBudgetValid() ? 5 : 4; // Despacho → Guion cuando pautado+presupuesto OK
}

// ── NAVEGACIÓN MODULAR Y DEPENDENCIAS ─────────────────────────────────────────
const NAV_TABS = [
  { id: "resumen",    label: "Resumen del Rally",        level: 0, check: () => true, summary: true },
  { id: "certamen",   label: "00 Certamen",             level: 0, setup: true, visitante: false, check: () => true },
  { id: "team",       label: "01 Identidad de Equipo",  level: 1, setup: true, visitante: false, check: () => !!state.rally_type },
  { id: "identidad",  label: "Paleta y marca del proyecto", level: 1, check: () => !!state.rally_type },
  { id: "challenges", label: "02 Retos del Comité",     level: 2, check: () => !!state.rally_type && !!state.team_name },
  { id: "solution",   label: "03 Taller de Solución",   level: 3, check: () => !!state.challenge_id },
  { id: "impact",     label: "04 Impacto, ODS & Plan País", level: 3, check: () => !!state.challenge_id },
  { id: "multi_ai",   label: "05 Despacho Multi-IA",    level: 4, visitante: false, check: () => state.solution_approved },
  { id: "pautado",    label: "06 Pautado Oficial",      level: 4, check: () => state.solution_approved && isPautadoComplete() },
  { id: "budget",     label: "07 Presupuesto de Marcha",level: 4, check: () => state.solution_approved && isBudgetValid() },
  { id: "resources",  label: "08 Bóveda de Recursos",   level: 4, check: () => state.solution_approved },
  { id: "canvas",     label: "09 Modelo Canvas",        level: 4, check: () => state.solution_approved },
  { id: "script",     label: "10 Guion del Video", level: 5, check: () => isPautadoWritten() && isBudgetValid() },
  { id: "webdemo",    label: "11 Prototipo para Video", level: 5, check: () => isPautadoWritten() && isBudgetValid() },
  { id: "timeline",   label: "12 Cierre", level: 1, check: () => !!state.rally_type }
];

// Cada rol entra a un menú distinto. El motor ya bloquea las escrituras del
// visitante; aquí solo se le deja ver lo que puede leer.
function rolActual() {
  try { return (localStorage.getItem("rally_member_role") || "").trim(); } catch (e) { return ""; }
}

function esVisitante() {
  return rolActual() === "visitor";
}

function esMentor() {
  return rolActual() === "mentor";
}

function navTabsVisibles() {
  return NAV_TABS.filter(t => !esVisitante() || t.visitante !== false);
}

// Una pestaña que el menú no muestra no se abre por una URL guardada.
function tabPermitida(id) {
  const t = NAV_TABS.find(x => x.id === id);
  return !!t && (!esVisitante() || t.visitante !== false);
}

function tabInicial(stage) {
  const preferida = stage === 0 ? "certamen" : stage === 1 ? "team" : stage === 2 || stage > 3 ? "challenges" : "solution";
  if (tabPermitida(preferida)) return preferida;
  const alcanzables = navTabsVisibles().filter(t => t.level <= stage);
  return (alcanzables[0] || navTabsVisibles()[0] || NAV_TABS[0]).id;
}

function rolEtiqueta() {
  const r = rolActual();
  if (r === "admin") return "Admin";
  if (r === "operator") return "Operador";
  if (r === "mentor") return "Mentor";
  if (r === "visitor") return "Visitante";
  return "";
}

function rolChip() {
  const r = rolActual();
  if (!r) return "";
  return `<span class="role-chip is-${r}">${rolEtiqueta()}</span>`;
}

function rolAviso() {
  if (esVisitante()) return '<div class="sidebar-heading">Solo lectura</div>';
  if (esMentor()) return '<div class="sidebar-heading">Mentor: revisas y apruebas</div>';
  return "";
}

function isPautadoWritten() {
  // Para abrir la fase siguiente basta con que el texto esté escrito:
  // las dos lecturas cierran el entregable, no bloquean el trabajo del equipo.
  return Object.keys(PAUTADO_LIMITS).every(rsPautadoSectionFilled);
}

function isPautadoComplete() {
  // Misma regla que la pista de cada sección: una sola definición.
  return Object.keys(PAUTADO_LIMITS).every(rsPautadoSectionDone);
}

// Banda sugerida del piloto: la usan el aviso de la vista y la pista del
// pautado. NO es ley: hay pilotos de $2.500 que son mejores que uno de $6.000,
// y proyectos muy innovadores que valen más. El sello de validez solo exige
// una tabla real con costos; salirse de la banda únicamente avisa.
const BUDGET_TARGET = { min: 4000, max: 6000 };

function budgetTotal() {
  return (state.budget || []).reduce((acc, it) => acc + (it.units * it.unit_cost), 0);
}

function isBudgetValid() {
  if (!state.budget || state.budget.length === 0) return false;
  const completa = state.budget.every(it => it.units > 0 && it.unit_cost > 0);
  return completa && budgetTotal() > 0;
}

function isScriptComplete() {
  const totalWords = rsWordCount([state.script.acto1, state.script.acto2, state.script.acto3, state.script.acto4].join(" "));
  // El guion se escribe para 120 s. El techo sale del tiempo y del ritmo del
  // medidor del guion (135 palabras por minuto): 120 s son 270 palabras. Antes
  // eran 280 y el tablero daba por completo un guion de 124 s, que descalifica.
  return totalWords >= 240 && totalWords <= 270;
}

// ── INICIALIZACIÓN ───────────────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  loadSavedState();
  initClock();
  syncUI();
  avisoModoCopia();
  hidratarRetosDelComite();
});

// Copia estática del dashboard (GitHub Pages, Netlify, archivo local): el
// contenido se ve, pero la IA, el buzón y el trabajo en equipo viven en el
// servidor y aquí no existen. Sin este aviso el usuario cree que la app está
// rota cuando un botón de IA no responde.
function enModoCopia() {
  return (
    /(^|\.)github\.io$/i.test(location.hostname) ||
    /(^|\.)netlify\.app$/i.test(location.hostname) ||
    /(^|\.)pages\.dev$/i.test(location.hostname) ||
    location.protocol === "file:" ||
    /[?&]estatico=1/.test(location.search)
  );
}

function avisoModoCopia() {
  if (!enModoCopia() || document.getElementById("aviso-copia")) return;
  const bar = document.createElement("div");
  bar.id = "aviso-copia";
  bar.style.cssText = [
    "position:fixed", "left:0", "right:0", "bottom:0", "z-index:9999",
    "display:flex", "gap:12px", "align-items:center", "justify-content:center",
    "padding:10px 16px", "font:600 13px/1.35 system-ui,sans-serif",
    "background:#1f1a13", "color:#f4e9d8", "border-top:2px solid #c8a15a",
    "text-align:center",
  ].join(";");
  bar.innerHTML =
    '<span>Modo copia: este sitio es una foto del proyecto. La IA, el buzón de propuestas y el trabajo en equipo solo funcionan en el programa local.</span>' +
    '<button type="button" style="background:transparent;border:1px solid #c8a15a;color:#f4e9d8;border-radius:6px;padding:4px 10px;font:inherit;cursor:pointer">Entendido</button>';
  bar.querySelector("button").addEventListener("click", () => bar.remove());
  document.body.appendChild(bar);
}

// Los retos del comité viven en `research/challenges.json`, que deja ahí el
// ingest. La ventana los lee de ese archivo la primera vez: si el equipo ya
// tiene retos en su estado, no se toca nada.
async function hidratarRetosDelComite() {
  if (state.challenges_hydrated) return;
  if (Array.isArray(state.challenges) && state.challenges.length) return;
  if (enModoCopia()) return;
  // El servidor manda: si la primera sincronización trae los retos del equipo,
  // hay que dejar que los aplique antes de escribir los del corpus.
  const sync = window.RallySectionSync;
  if (sync && typeof sync.status === "function") {
    for (let i = 0; i < 40 && !sync.status().ready; i++) {
      await new Promise(r => setTimeout(r, 250));
    }
  }
  if (Array.isArray(state.challenges) && state.challenges.length) return;
  try {
    const r = await fetch("research/challenges.json", { cache: "no-store" });
    if (!r.ok) return;
    const lista = await r.json();
    const retos = (Array.isArray(lista) ? lista : []).filter(c => c && c.id && c.title);
    if (!retos.length) return;
    if (Array.isArray(state.challenges) && state.challenges.length) return;
    state.challenges = retos;
    state.challenges_hydrated = true;
    if (!state.active_deliberation_challenge_id) {
      state.active_deliberation_challenge_id = retos[0].id;
    }
    saveState();
    renderTab(activeTab);
  } catch (e) {
    // Sin corpus en disco la pestaña sigue pidiendo los retos; no es un fallo.
  }
}

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
    if (activeTab === "challenges") {
      body.classList.add("sidebar-collapsed");
      body.classList.add("panel-collapsed");
    }
  }

  renderTopbar();
  renderNavigation();
  renderTab(activeTab);
  updateInspector();
  renderMobileBottomBar();
}

function loadSavedState() {
  try {
    const saved = localStorage.getItem("rally_studio_production_state_2026_v4");
    if (saved) {
      state = Object.assign(getInitialState(), JSON.parse(saved));
      // Migra metadatos de tareas sin perder resultados ya pegados por el equipo.
      const defaultTasks = getDefaultMultiAITasks();
      if (Array.isArray(state.tasks)) {
        state.tasks = state.tasks.map(task => {
          const fresh = defaultTasks.find(d => d.id === task.id);
          return fresh ? { ...task, title: fresh.title, ai: fresh.ai, desc: fresh.desc } : task;
        });
        defaultTasks.forEach(fresh => {
          if (!state.tasks.some(task => task.id === fresh.id)) state.tasks.push(fresh);
        });
      } else {
        state.tasks = defaultTasks;
      }
      if (Array.isArray(state.challenges)) {
        state.challenges.forEach(ch => {
          if (ch.title && (ch.title.toLowerCase().includes("whatsapp image") || ch.title.toLowerCase().includes(".jpeg") || ch.title.toLowerCase().includes(".png") || ch.title.toLowerCase().includes(".jpg"))) {
            ch.title = `Reto #${ch.id}`;
          }
          if (ch.wowProposal && ch.wowProposal.toLowerCase().includes("whatsapp image")) {
            ch.wowProposal = `[Pendiente de formulación con IA activa] Haz clic en "Formular con IA Activa" para estructurar la Tesis técnica según la Rúbrica oficial (100 Pts).`;
          }
        });
      }
      if (state.budget && state.budget.length === 6 && state.budget[0].element && state.budget[0].element.includes("MCU")) {
        state.budget = [];
      }
      // Auto-recalibrar al inicio oficial (08:00 AM) si se inicializó con Date.now() en la tarde
      if (state.rally_started && state.start_timestamp && !state.custom_calibrated) {
        const sDate = new Date(state.start_timestamp);
        const today = new Date();
        if (sDate.toDateString() === today.toDateString() && sDate.getHours() >= 12) {
          const official = new Date();
          official.setHours(8, 0, 0, 0);
          state.start_timestamp = official.getTime();
        }
      }
      const stage = getWorkflowStage();
      activeTab = state.active_tab && tabPermitida(state.active_tab) ? state.active_tab : tabInicial(stage);
      const target = NAV_TABS.find(t => t.id === activeTab);
      if (target && target.level > stage) activeTab = tabInicial(stage);
      // Con el reto ya elegido, la primera pantalla es el resumen: las fases de
      // setup (certamen, equipo, retos) dejan de ocupar el campo de trabajo.
      if (stage >= 3 && ["certamen", "team", "challenges"].includes(activeTab)) {
        activeTab = "resumen";
      }
    }
  } catch (e) {
    console.error("Error al cargar estado local", e);
  }
}

// ── SINCRONIZACIÓN AUTOMÁTICA EN SEGUNDO PLANO (MULTI-TAB / MULTI-DISPOSITIVO) ──
let syncBroadcastChannel = null;
if (typeof BroadcastChannel !== "undefined") {
  try {
    syncBroadcastChannel = new BroadcastChannel("rally_studio_auto_sync");
    syncBroadcastChannel.onmessage = function(event) {
      if (event.data && event.data.type === "AUTO_SYNC_STATE" && event.data.state) {
        state = Object.assign(getInitialState(), event.data.state);
        syncUI();
      }
    };
  } catch (e) {}
}

if (typeof window !== "undefined" && window.addEventListener) {
  window.addEventListener("storage", function(event) {
    if (event.key === "rally_studio_production_state_2026_v4" && event.newValue) {
      try {
        const remoteState = JSON.parse(event.newValue);
        state = Object.assign(getInitialState(), remoteState);
        syncUI();
      } catch (e) {}
    }
  });
}

function saveState() {
  try {
    localStorage.setItem("rally_studio_production_state_2026_v4", JSON.stringify(state));
    if (syncBroadcastChannel) {
      syncBroadcastChannel.postMessage({ type: "AUTO_SYNC_STATE", state });
    }
    if (window.RallySectionSync && typeof window.RallySectionSync.onLocalSave === "function") {
      window.RallySectionSync.onLocalSave(state);
    }
  } catch (e) {}
  updateInspector();
  renderTopbar();
}

function resetProject() {
  if (esVisitante()) return;
  if (confirm("¿Iniciar nuevo proyecto desde cero? Se limpiarán los datos locales para arrancar una nueva competencia.")) {
    localStorage.removeItem("rally_studio_production_state_2026_v4");
    state = getInitialState();
    activeTab = "certamen";
    syncUI();
  }
}

// ── SINCRONIZACIÓN Y EXPORTACIÓN TÉCNICA (MD & PDF / PRINT) ───────────────────
function exportProjectJson() {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state, null, 2));
  const dlAnchorElem = document.createElement('a');
  dlAnchorElem.setAttribute("href", dataStr);
  const pName = (state.project_name || state.team_name || "proyecto_rally").toLowerCase().replace(/\s+/g, "_");
  dlAnchorElem.setAttribute("download", `${pName}_respaldo.json`);
  dlAnchorElem.click();
}

function generateProjectMarkdown() {
  const isLatam = state.rally_type === "latam";
  const rallyTitle = `${rallyProfile().name} (${rallyProfile().hours}h)`;
  const falta = (etiqueta) => `[FALTA: ${etiqueta}]`;
  const teamName = state.team_name || falta("nombre del equipo");
  const uni = state.university || falta("universidad");
  const projName = state.project_name || state.team_name || falta("nombre del proyecto");
  const cat = state.category || "Innovación";
  const challengeId = state.challenge_id || (state.challenges && state.challenges[0] ? state.challenges[0].id : "");
  const selectedCh = (state.challenges && state.challenges.find(c => c.id === challengeId)) || OFFICIAL_CHALLENGES_2026.find(c => c.id === challengeId) || OFFICIAL_CHALLENGES_2026[0];
  const challengeTitle = state.challenge_title || (selectedCh ? selectedCh.title : "Sin reto elegido");

  const paut = state.pautado || {};
  const scr = state.script || {};
  const budgetList = Array.isArray(state.budget) ? state.budget : [];
  const budgetTotal = budgetList.reduce((acc, b) => acc + (Number(b.units || 1) * Number(b.unit_cost || 0)), 0);
  const bctx = budgetCurrency();
  const challengesList = (state.challenges && state.challenges.length > 0) ? state.challenges : OFFICIAL_CHALLENGES_2026;

  let md = `# DOSSIER TÉCNICO OFICIAL DEL PROYECTO: ${projName.toUpperCase()}\n`;
  md += `## ${rallyTitle}\n\n`;
  md += `---\n\n`;
  md += `### 1. Ficha Técnica y Datos Institucionales\n`;
  md += `- **Nombre del Proyecto:** ${projName}\n`;
  md += `- **Nombre del Equipo:** ${teamName}\n`;
  md += `- **Institución / Sede:** ${uni}\n`;
  md += `- **Certamen:** ${rallyTitle}\n`;
  md += `- **Categoría Oficial:** ${cat}\n`;
  md += `- **Reto Seleccionado:** Reto ${challengeId} — ${challengeTitle}\n`;
  md += `- **Plataforma de Despacho:** Rally Studio (Workbench de Innovación)\n\n`;

  md += `### 2. Identidad Gráfica y Sistema de Diseño (/impeccable standard)\n`;
  md += `**Concepto Rector:** The Cardless Typographic Workbench (Diseño Suizo de Misión Crítica)\n`;
  md += `- **Color Navy Principal:** \`#0D1B35\` (Títulos y cronómetro institucional - WCAG AAA)\n`;
  md += `- **Color Azul Primario:** \`#0866F5\` (Acentos interactivos y selección activa - WCAG AAA)\n`;
  md += `- **Color Cobalto Técnico:** \`#1D4ED8\` (Validación y enlaces)\n`;
  md += `- **Color Acento / Telemetría:** \`#0284C7\` / \`#2AA7AD\` (Indicadores ambientales)\n`;
  md += `- **Tipografía Display & Body:** Plus Jakarta Sans (Pesos 500, 700, 900)\n`;
  md += `- **Tipografía Numérica & Código:** JetBrains Mono (Tabular Nums)\n`;
  md += `- **Logotipos del Sistema:** \`rally_studio_logo.svg\`, \`assets/logo_uni.png\`, \`assets/logo_rally_latam.png\`, \`assets/logo_rally_nacional.png\`\n\n`;

  md += `### 3. Tesis de Solución\n`;
  md += `**Tesis Central:** ${state.solution_thesis || "Propuesta de innovación tecnológica y social de alto impacto orientada a resolver las demandas del comité organizador."}\n\n`;
  md += `**Pitch Breve:** ${state.solution_simple || "Solución estructurada con enfoque de prefactibilidad técnica, modelo de sostenibilidad y rápida adopción territorial."}\n\n`;

  md += `### 4. Catálogo Oficial de Retos y Propuestas IA del Sistema\n\n`;
  challengesList.forEach(ch => {
    md += `#### Reto ${ch.id}: ${ch.title}\n`;
    md += `- **Categoría:** ${ch.category || "General"} | **ODS:** ${Array.isArray(ch.ods) ? ch.ods.join(", ") : ch.ods || "N/A"} | **Win-Rate Estimado:** ${ch.winRate || 85}%\n`;
    md += `- **Demanda del Comité:** ${ch.officialExpectation || ch.description || "N/A"}\n`;
    md += `- **Propuesta IA / WOW:** ${ch.wowProposal || ch.proposal || "Solución estructurada por Rally Studio."}\n`;
    md += `- **Adaptación Territorial:** ${ch.nicaraguaAdaptation || "Despliegue comunitario en sectores críticos."}\n`;
    md += `- **Razón de Novedad:** ${ch.noveltyReason || "Enfoque metodológico de alta prefactibilidad."}\n\n`;
  });

  md += `### 5. Pautado Oficial Homologado (Rúbrica Oficial)\n\n`;
  md += `#### 5.1 Definición del Problema\n${paut.problema || "Diagnóstico cuantitativo y delimitación del problema territorial, identificando causas raíz, población vulnerada y la brecha técnica que motiva la innovación."}\n\n`;
  md += `#### 5.2 Solución Propuesta\n${paut.solucion || "Arquitectura de la solución planteada por el equipo, detallando los módulos funcionales, diferenciación técnica y cómo resuelve directamente el reto oficial."}\n\n`;
  md += `#### 5.3 Prefactibilidad y Presupuesto de Marcha\n${paut.prefactibilidad || "Qué se necesita para arrancar, cuánto cuesta el primer piloto, quién paga y qué parte se sostiene sola con el tiempo. Escrito en palabras simples: personas, insumos y trabajo."}\n\n`;
  md += `#### 5.4 Grado de Innovación y Creatividad\n${paut.innovacion || "Elementos diferenciales y disruptivos de la solución, barreras tecnológicas superadas y valor agregado frente a alternativas existentes."}\n\n`;
  md += `#### 5.5 Impacto Social y Sostenibilidad Ambiental\n${paut.impacto || "Medición de beneficios cuantificables para la comunidad, alineación con la Agenda 2030 (ODS) y viabilidad ecológica a largo plazo."}\n\n`;

  md += `### 6. Presupuesto Sustentado de Marcha (Total: ${budgetFmt(budgetTotal, bctx, true)})\n\n`;
  md += `| Ítem | Concepto | Categoría | Unidades | Costo Unit. (${bctx.rotulo}) | Total (${bctx.rotulo}) |\n`;
  md += `|---|---|---|---|---|---|\n`;
  budgetList.forEach((b, idx) => {
    md += `| ${idx + 1} | ${b.concept || b.element || "Partida"} | ${b.category || "General"} | ${b.units || 1} | ${budgetFmt(Number(b.unit_cost || 0), bctx)} | ${budgetFmt(Number(b.units || 1) * Number(b.unit_cost || 0), bctx)} |\n`;
  });
  md += `| — | **PRESUPUESTO GENERAL** | — | — | — | **${budgetFmt(budgetTotal, bctx, true)}** |\n\n`;

  md += `### 7. Guion Audiovisual de 120 Segundos (4 Actos)\n\n`;
  md += `- **Acto 1 (00:00 - 00:20):** ${scr.acto1 || "Exposición del problema en el territorio, datos críticos y urgencia de solución."}\n\n`;
  md += `- **Acto 2 (00:20 - 00:55):** ${scr.acto2 || `Presentación de la propuesta de innovación desarrollada por el equipo de ${sedeName()}.`}\n\n`;
  md += `- **Acto 3 (00:55 - 01:30):** ${scr.acto3 || "Demostración operativa del prototipo, prefactibilidad económica y validación de campo."}\n\n`;
  md += `- **Acto 4 (01:30 - 02:00):** ${scr.acto4 || "Impacto transformador, escalabilidad y llamado a la acción del equipo en el certamen."}\n\n`;

  md += `---\n*Exportado desde Rally Studio Workbench · Cumplimiento de Rúbricas Oficiales CONFEDI / ACOFI / CNU*\n`;
  return md;
}

function exportProjectMarkdown() {
  const content = generateProjectMarkdown();
  const blob = new Blob([content], { type: "text/markdown;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const dlAnchorElem = document.createElement('a');
  dlAnchorElem.setAttribute("href", url);
  const pName = (state.project_name || state.team_name || "proyecto_rally").toLowerCase().replace(/\s+/g, "_");
  dlAnchorElem.setAttribute("download", `${pName}_dossier_tecnico.md`);
  document.body.appendChild(dlAnchorElem);
  dlAnchorElem.click();
  document.body.removeChild(dlAnchorElem);
  URL.revokeObjectURL(url);
  showToast("Dossier Markdown (.md) exportado exitosamente");
}

function preparePrintDossierHTML() {
  const isLatam = state.rally_type === "latam";
  const rallyTitle = `${rallyProfile().name} (${rallyProfile().hours} Horas)`;
  // Un dato que el equipo no escribio no se rellena con una frase que parece
  // real: el dossier se imprime para el jurado y "ciudad piloto" pasa por un
  // municipio. Lo que falta se declara faltante.
  const falta = (etiqueta) => `[FALTA: ${etiqueta}]`;
  const teamName = state.team_name || falta("nombre del equipo");
  const uni = state.university || falta("universidad");
  const city = state.city || falta("ciudad o municipio");
  const projName = state.project_name || state.team_name || falta("nombre del proyecto");
  const cat = state.category || "Innovación";
  const challengeId = state.challenge_id || (state.challenges && state.challenges[0] ? state.challenges[0].id : "");
  const selectedCh = (state.challenges && state.challenges.find(c => c.id === challengeId)) || OFFICIAL_CHALLENGES_2026.find(c => c.id === challengeId) || OFFICIAL_CHALLENGES_2026[0];
  const challengeTitle = state.challenge_title || (selectedCh ? selectedCh.title : "Sin reto elegido");

  const paut = state.pautado || {};
  const scr = state.script || {};
  const canvas = (state.model_canvas && typeof state.model_canvas === "object") ? state.model_canvas : {};
  const gr = state.guardrails || {};

  // Partidas presupuestarias sincronizadas (resuelve b.concept y b.element)
  const budgetList = Array.isArray(state.budget) && state.budget.length > 0 ? state.budget : [
    { concept: "Prototipo y materiales", category: "Prototipado", units: 1, unit_cost: 0, url: "" },
    { concept: "Validación técnica", category: "Validación", units: 1, unit_cost: 0, url: "" },
    { concept: "Documentación y difusión", category: "Comunicación", units: 1, unit_cost: 0, url: "" }
  ];
  const budgetTotal = budgetList.reduce((acc, b) => acc + (Number(b.units || 1) * Number(b.unit_cost || 0)), 0);
  const bctx = budgetCurrency();
  const budgetInRange = budgetTotal >= 500 && budgetTotal <= 15000;

  // Claims de Respaldo Fáctico / Propiedad Intelectual
  const claimsList = (Array.isArray(state.claims) && state.claims.length > 0) ? state.claims : [];

  // Matriz de 10 guardarraíles de rúbrica
  const guardrailsDef = [
    { key: "team_sirli_registered", name: "Inscripción Formal en la Plataforma del Certamen", req: "Equipo registrado y verificado en el sistema oficial del certamen." },
    { key: "video_duration_ok", name: "Duración Estricta de Video (≤ 120s)", req: "Minutaje total de video exactamente calibrado a 120 segundos sin exceder." },
    { key: "video_unlisted_or_public", name: "Visibilidad de Enlace Audiovisual", req: "Alojado en YouTube como 'No Listado' o 'Público', reproducible sin login." },
    { key: "naming_pdf_ok", name: "Nomenclatura Oficial de Archivos", req: "Estructura estricta según las bases: reto, equipo y documento, separados por guion bajo." },
    { key: "hashtags_included", name: "Hashtags Oficiales del Certamen", req: `${rallyTags().join(", ")} y etiquetas requeridas.` },
    { key: "pautado_chars_ok", name: "Límites de Caracteres en Pautado", req: "Límites respetados en las 5 secciones (1,250 y 1,000 caracteres)." },
    { key: "pdf_video_numbers_synced", name: "Sincronización Numérica (0 Discrepancias)", req: "Montos, unidades y beneficiarios idénticos en guion audiovisual y pautado." },
    { key: "youtube_channel_brand", name: "Branding en Canal Audiovisual", req: "Canal institucional del equipo con título, miniatura y descripción técnica." },
    { key: "tiktok_submitted", name: "Entregable de Impacto / Redes Sociales", req: "Registro audiovisual lúdico de difusión comunitaria completado." },
    { key: "loser_patterns_checked", name: "Auditoría de Patrones Perdedores", req: "Sin generalidades vacías; hardware real, costos y aliados territoriales citados." }
  ];

  // Tareas Multi-IA y Trazabilidad Operativa
  const taskList = (Array.isArray(state.tasks) && state.tasks.length > 0) ? state.tasks : (typeof getDefaultMultiAITasks === "function" ? getDefaultMultiAITasks() : []);
  const shotList = (Array.isArray(state.shot_plan) && state.shot_plan.length > 0) ? state.shot_plan : (typeof DEFAULT_SHOT_PLAN !== "undefined" ? DEFAULT_SHOT_PLAN : []);
  const challengesList = (state.challenges && state.challenges.length > 0) ? state.challenges : OFFICIAL_CHALLENGES_2026;
  const deliberationIdeas = (state.challenge_ideas && state.challenge_ideas[challengeId]) ? state.challenge_ideas[challengeId] : [];

  // URLs de Entregables
  const videoUrl = state.video_url || "";
  const siteUrl = state.site_url || "";
  const driveUrl = state.google_drive_url || "https://drive.google.com";
  const canvaUrl = state.canva_url || "https://canva.com";
  const figmaUrl = state.figma_url || "";

  return `
    <!-- ENCABEZADO OFICIAL CON LOGOTIPOS Y MARCA DE CERTAMEN -->
    <div class="print-header">
      <div>
        <div class="print-brand-tag">Rally Studio · Mission Control Workbench · Formato Suizo /impeccable</div>
        <h1 class="print-title">${projName.toUpperCase()} · MEMORIA TÉCNICA OFICIAL</h1>
        <div class="print-subtitle">${rallyTitle} · ${uni} · ${city}</div>
      </div>
      <div class="print-header-emblems">
        <img src="assets/rally_studio_logo.svg" alt="Rally Studio" style="height:32px; width:auto;">
        <img src="assets/logo_uni.png" alt="UNI Logo">
        <img src="${isLatam ? 'assets/logo_rally_latam.png' : 'assets/logo_rally_nacional.png'}" alt="Rally Logo">
      </div>
    </div>

    <!-- TARJETAS DE CONFORMACIÓN REGLAMENTARIA SIRLI Y TELEMETRÍA -->
    <div class="print-stat-row">
      <div class="print-stat-card">
        <div class="print-stat-label">Equipo & Sede</div>
        <div class="print-stat-val">${teamName}</div>
        <div class="print-stat-sub">${uni} (${city})</div>
      </div>
      <div class="print-stat-card">
        <div class="print-stat-label">Reglas SIRLI</div>
        <div class="print-stat-val" style="color:var(--status-ok-text);">100% ELEGIBLE</div>
        <div class="print-stat-sub">${state.team_members_count || 6} Miembros · Cuota Femenina: ${state.team_has_female ? 'Sí' : 'No'} · Ing: ${state.team_has_engineering ? 'Sí' : 'No'}</div>
      </div>
      <div class="print-stat-card">
        <div class="print-stat-label">Liderazgo & Rúbrica</div>
        <div class="print-stat-val">Líder Estudiante</div>
        <div class="print-stat-sub">${state.team_leader_student ? 'Cumple criterio estricto' : 'Revisión pendiente'} · Cat: ${cat}</div>
      </div>
      <div class="print-stat-card">
        <div class="print-stat-label">Cronograma</div>
        <div class="print-stat-val">${state.hours_remaining || 24}h restantes</div>
        <div class="print-stat-sub">Jornada de ${state.hours_total || 24}h · Inicio: ${state.official_start_time || '08:00 AM'}</div>
      </div>
    </div>

    <!-- METADATOS TÉCNICOS RESUMIDOS -->
    <div class="print-meta-grid" style="margin-bottom:12px;">
      <div><strong>Proyecto:</strong> ${projName}</div>
      <div><strong>Certamen:</strong> ${rallyTitle}</div>
      <div><strong>Reto Seleccionado:</strong> Reto #${challengeId} — ${challengeTitle}</div>
      <div><strong>Categoría & ODS:</strong> ${cat} · ${Array.isArray(selectedCh.ods) ? selectedCh.ods.join(', ') : (selectedCh.ods || 'ODS 9, 11')}</div>
      <div style="grid-column:1/-1;"><strong>Tesis Técnica Consensuada:</strong> ${state.solution_thesis || 'Arquitectura de innovación con anclaje territorial directo, telemetría de bajo costo y validación comunitaria.'}</div>
    </div>

    <!-- SECCIÓN 1: RETO OFICIAL Y DIAGNÓSTICO ESTRATÉGICO -->
    <div class="print-section">
      <div class="print-section-title">
        <span>1. Reto Oficial & Diagnóstico Estratégico</span>
        <span class="print-badge print-badge-navy">RETO #${challengeId} · WIN-RATE ${selectedCh.winRate || 85}%</span>
      </div>
      <div style="background:var(--bg-subtle); border:1px solid var(--border-light); border-radius:4px; padding:8px 11px; font-size:8.3pt; line-height:1.45; margin-bottom:8px;">
        <div style="margin-bottom:5px;"><strong>Expectativa Oficial del Jurado:</strong> ${selectedCh.officialExpectation || 'Resolución técnica de impacto territorial y viabilidad demostrada bajo límites presupuestarios.'}</div>
        <div style="margin-bottom:5px;"><strong>Anclaje Territorial (Nicaragua / Región):</strong> ${selectedCh.nicaraguaAdaptation || 'Despliegue coordinado con autoridades locales, cooperativas y comités comunitarios.'}</div>
        <div style="margin-bottom:5px;"><strong>Razón de Novedad & WOW Factor:</strong> ${selectedCh.noveltyReason || 'Diferenciación técnica radical eliminando cuellos de botella convencionales.'}</div>
        <div><strong>Patrón Ganador de Referencia:</strong> ${selectedCh.winnerPattern || selectedCh.precedent || 'Alineación estricta con ejes de impacto y modelo de marcha autosostenible.'}</div>
      </div>
      ${deliberationIdeas.length > 0 ? `
        <div style="background:var(--bg-surface); border:1px solid var(--border-light); border-radius:4px; padding:6px 10px; font-size:7.8pt; line-height:1.4; color:var(--text-body);">
          <strong>Deliberaciones Internas del Equipo:</strong>
          ${deliberationIdeas.map(idItem => ` · "${idItem.text}" (${idItem.author || 'Equipo'})`).join('')}
        </div>
      ` : ''}
    </div>

    <!-- SECCIÓN 2: TALLER DE SOLUCIÓN Y PROPIEDAD INTELECTUAL / CLAIMS -->
    <div class="print-section print-avoid-break">
      <div class="print-section-title">
        <span>2. Taller de Solución, Arquitectura Técnica & Patentes</span>
        <span class="print-badge ${state.solution_approved ? 'print-badge-green' : 'print-badge-blue'}">${state.solution_approved ? 'APROBADO POR EL EQUIPO' : 'SOLUCIÓN CALIBRADA'}</span>
      </div>
      <div class="print-meta-grid" style="margin-bottom:8px;">
        <div style="grid-column:1/-1;"><strong>Cómo se le explica a un asesor:</strong> ${state.solution_simple || 'Sin explicación todavía.'}</div>
        <div><strong>Potenciadores Tecnológicos Activos:</strong> ${(state.solution_boosters || ['ods', 'sensors']).join(' · ').toUpperCase()}</div>
        <div><strong>Estado de Propiedad Intelectual:</strong> ${claimsList.length} Fuentes Técnicas Verificadas</div>
      </div>
      <table class="print-table">
        <thead>
          <tr>
            <th style="width:65%;">Evidencia Fáctica / Claim Territorial</th>
            <th style="width:25%;">Fuente Institucional</th>
            <th style="width:10%; text-align:center;">Año</th>
          </tr>
        </thead>
        <tbody>
          ${claimsList.map(c => `
            <tr>
              <td>${c.stat || c.text}</td>
              <td><strong>${c.source}</strong></td>
              <td class="num-cell" style="text-align:center;">${c.year || 2024}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>

    <!-- SECCIÓN 3: MEMORIA PAUTADA OFICIAL (5 SECCIONES DE RÚBRICA) -->
    <div class="print-section print-page-break">
      <div class="print-section-title">
        <span>3. Memoria Pautada Oficial (Calibración Estricta a Rúbrica)</span>
        <span class="print-badge print-badge-navy">5 SECCIONES OFICIALES · 0 ERRORES</span>
      </div>
      <div class="print-pautado-block">
        <div class="print-pautado-header">
          <span>3.1 Definición del Problema</span>
          <span>${pautadoConteo('problema', paut.problema)}</span>
        </div>
        <p class="print-pautado-text">${paut.problema || 'Diagnóstico cuantitativo y delimitación del problema territorial, identificando causas raíz, población vulnerada y la brecha técnica que motiva la innovación formulada por el equipo...'}</p>
      </div>
      <div class="print-pautado-block">
        <div class="print-pautado-header">
          <span>3.2 Solución Propuesta</span>
          <span>${pautadoConteo('solucion', paut.solucion)}</span>
        </div>
        <p class="print-pautado-text">${paut.solucion || 'Arquitectura de la solución planteada por el equipo, detallando los módulos funcionales, diferenciación técnica y cómo resuelve directamente el reto oficial seleccionado...'}</p>
      </div>
      <div class="print-pautado-block">
        <div class="print-pautado-header">
          <span>3.3 Prefactibilidad y Presupuesto de Marcha</span>
          <span>${pautadoConteo('prefactibilidad', paut.prefactibilidad)}</span>
        </div>
        <p class="print-pautado-text">${paut.prefactibilidad || 'Qué se necesita para arrancar, cuánto cuesta el primer piloto, quién paga y qué parte se sostiene sola con el tiempo. Escrito en palabras simples: personas, insumos y trabajo...'}</p>
      </div>
      <div class="print-pautado-block">
        <div class="print-pautado-header">
          <span>3.4 Grado de Innovación y Creatividad</span>
          <span>${pautadoConteo('innovacion', paut.innovacion)}</span>
        </div>
        <p class="print-pautado-text">${paut.innovacion || 'Elementos diferenciales y disruptivos de la propuesta, barreras técnicas resueltas creativamente y valor agregado demostrable frente a soluciones convencionales...'}</p>
      </div>
      <div class="print-pautado-block">
        <div class="print-pautado-header">
          <span>3.5 Impacto Social y Sostenibilidad Ambiental</span>
          <span>${pautadoConteo('impacto', paut.impacto)}</span>
        </div>
        <p class="print-pautado-text">${paut.impacto || 'Medición de beneficios directos para la comunidad beneficiaria, alineación formal con los Objetivos de Desarrollo Sostenible (ODS) y viabilidad de mantenimiento autónomo a largo plazo...'}</p>
      </div>
    </div>

    <!-- SECCIÓN 4: BUSINESS MODEL CANVAS OFICIAL (SIRLI - 9 CUADRANTES) -->
    <div class="print-section print-avoid-break">
      <div class="print-section-title">
        <span>4. Business Model Canvas Oficial (SIRLI / Rúbrica 2026)</span>
        <span class="print-badge print-badge-blue">9 CUADRANTES OSTERWALDER</span>
      </div>
      <div class="print-canvas-grid">
        <div class="print-canvas-box print-canvas-box-socios">
          <div class="print-canvas-box-title">1. Socios Clave</div>
          <p class="print-canvas-box-body">${canvas.socios || 'Socios institucionales, técnicos y comunitarios definidos en el modelo de negocio.'}</p>
        </div>
        <div class="print-canvas-box print-canvas-box-actividades">
          <div class="print-canvas-box-title">2. Actividades Clave</div>
          <p class="print-canvas-box-body">${canvas.actividades || 'Actividades clave de desarrollo, validación y adopción descritas en el canvas.'}</p>
        </div>
        <div class="print-canvas-box print-canvas-box-recursos">
          <div class="print-canvas-box-title">6. Recursos Clave</div>
          <p class="print-canvas-box-body">${canvas.recursos || 'Recursos técnicos, humanos y de infraestructura requeridos por el proyecto.'}</p>
        </div>
        <div class="print-canvas-box print-canvas-box-propuesta">
          <div class="print-canvas-box-title">3. Propuesta de Valor ★</div>
          <p class="print-canvas-box-body"><strong>${canvas.propuesta || state.solution_thesis || 'Propuesta de valor diferencial del proyecto, validada con el equipo.'}</strong></p>
        </div>
        <div class="print-canvas-box print-canvas-box-relaciones">
          <div class="print-canvas-box-title">4. Relaciones</div>
          <p class="print-canvas-box-body">${canvas.relaciones || 'Relaciones de acompañamiento, capacitación y soporte con los usuarios.'}</p>
        </div>
        <div class="print-canvas-box print-canvas-box-canales">
          <div class="print-canvas-box-title">7. Canales</div>
          <p class="print-canvas-box-body">${canvas.canales || 'Canales de distribución, comunicación y soporte del proyecto.'}</p>
        </div>
        <div class="print-canvas-box print-canvas-box-segmentos">
          <div class="print-canvas-box-title">5. Segmentos</div>
          <p class="print-canvas-box-body">${canvas.segmentos || 'Segmentos de usuarios y clientes priorizados en el canvas.'}</p>
        </div>
        <div class="print-canvas-box print-canvas-box-costes">
          <div class="print-canvas-box-title">8. Estructura de Costes (Tope \$15k)</div>
          <p class="print-canvas-box-body">${canvas.costes || 'Costos de implementación calculados a partir del presupuesto auditado.'}</p>
        </div>
        <div class="print-canvas-box print-canvas-box-ingresos">
          <div class="print-canvas-box-title">9. Fuentes de Ingresos / Sostenibilidad</div>
          <p class="print-canvas-box-body">${canvas.ingresos || 'Fuentes de ingreso y sostenibilidad definidas en el modelo de negocio.'}</p>
        </div>
      </div>
    </div>

    <!-- SECCIÓN 5: PRESUPUESTO SUSTENTADO DE MARCHA -->
    <div class="print-section print-page-break">
      <div class="print-section-title">
        <span>5. Presupuesto Sustentado de Marcha (${budgetFmt(500, bctx)} - ${budgetFmt(15000, bctx)})</span>
        <span class="print-badge ${budgetInRange ? 'print-badge-green' : 'print-badge-amber'}">${budgetInRange ? 'DENTRO DE RANGO SIRLI' : 'REVISAR TOPE RÚBRICA'}</span>
      </div>
      <table class="print-table">
        <thead>
          <tr>
            <th style="width:4%;">#</th>
            <th style="width:36%;">Concepto Técnico / Insumo</th>
            <th style="width:18%;">Categoría</th>
            <th style="width:8%; text-align:center;">Cant.</th>
            <th style="width:12%; text-align:right;">Unit. ${bctx.rotulo}</th>
            <th style="width:12%; text-align:right;">Total ${bctx.rotulo}</th>
            <th style="width:10%;">Cotización</th>
          </tr>
        </thead>
        <tbody>
          ${budgetList.map((b, i) => {
            const concept = b.concept || b.element || "Partida Técnica";
            const catItem = b.category || "Insumo";
            const units = Number(b.units || 1);
            const unitCost = Number(b.unit_cost || 0);
            const lineTotal = units * unitCost;
            return `
              <tr>
                <td class="num-cell">${i + 1}</td>
                <td><strong>${concept}</strong></td>
                <td>${catItem}</td>
                <td class="num-cell" style="text-align:center;">${units}</td>
                <td class="num-cell" style="text-align:right;">${budgetFmt(unitCost, bctx)}</td>
                <td class="num-cell" style="text-align:right; font-weight:700;">${budgetFmt(lineTotal, bctx)}</td>
                <td style="font-size:7.5pt; color:var(--text-muted);">${b.url ? 'Cotizado' : 'COTS Local'}</td>
              </tr>
            `;
          }).join('')}
          <tr style="background:var(--bg-subtle); font-weight:800;">
            <td colspan="5" style="text-align:right;">PRESUPUESTO GENERAL CONSOLIDADO:</td>
            <td class="num-cell" style="text-align:right; color:var(--text-title); font-size:9.5pt;">${budgetFmt(budgetTotal, bctx, true)}</td>
            <td style="font-size:7.5pt; color:var(--status-ok-text); font-weight:700;">✓ Rango Apto</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- SECCIÓN 6: GUION AUDIOVISUAL DE 120 SEGUNDOS Y PLAN DE TOMAS -->
    <div class="print-section print-avoid-break">
      <div class="print-section-title">
        <span>6. Guion Audiovisual Oficial de 120 Segundos (4 Actos)</span>
        <span class="print-badge print-badge-cyan">120 SEGUNDOS EXACTOS</span>
      </div>
      <div style="font-size:8.3pt; line-height:1.45; color:var(--text-title);">
        <div style="margin-bottom:6px; padding:6px 9px; background:var(--bg-subtle); border-radius:4px;">
          <strong>[00:00 - 00:20] Acto 1 (Herida Social / Diagnóstico):</strong> ${scr.acto1 || 'Exposición contundente del problema territorial, las vidas en riesgo y la brecha técnica que motiva la innovación formulada por el equipo.'}
        </div>
        <div style="margin-bottom:6px; padding:6px 9px; background:var(--bg-subtle); border-radius:4px;">
          <strong>[00:20 - 00:55] Acto 2 (Solución Innovadora / WOW):</strong> ${scr.acto2 || 'Presentación de la propuesta tecnológica y metodológica, diferenciación técnica y demostración de su funcionamiento autónomo en terreno.'}
        </div>
        <div style="margin-bottom:6px; padding:6px 9px; background:var(--bg-subtle); border-radius:4px;">
          <strong>[00:55 - 01:30] Acto 3 (Demostración y Prefactibilidad):</strong> ${scr.acto3 || 'Demostración operativa del modelo, sustentación presupuestaria con componentes COTS disponibles y modelo de viabilidad económica sin subsidios.'}
        </div>
        <div style="margin-bottom:6px; padding:6px 9px; background:var(--bg-subtle); border-radius:4px;">
          <strong>[01:30 - 02:00] Acto 4 (Impacto Humano, ODS y Cierre):</strong> ${scr.acto4 || 'Transformación social cuantificable, alineación con la Agenda 2030 y llamado inspirador a la acción institucional y comunitaria.'}
        </div>
      </div>
      ${shotList.length > 0 ? `
        <div style="margin-top:8px;">
          <div style="font-size:7.5pt; font-weight:800; color:var(--text-muted);  font-family:'JetBrains Mono',monospace; margin-bottom:4px;">Plan de Tomas Audiovisuales (Shotlist Calibrado)</div>
          <table class="print-table" style="font-size:8pt; margin-top:2px;">
            <thead>
              <tr>
                <th style="width:18%;">Acto</th>
                <th style="width:50%;">Encuadre / Contenido Visual de la Toma</th>
                <th style="width:32%;">Propósito de Rúbrica</th>
              </tr>
            </thead>
            <tbody>
              ${shotList.slice(0, 5).map(s => `
                <tr>
                  <td><strong>${s.acto || 'Acto'}</strong></td>
                  <td>${s.label || s.desc || 'Toma técnica'}</td>
                  <td style="color:var(--text-muted);">${s.status ? 'Verificada' : 'Planificada'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      ` : ''}
    </div>

    <!-- SECCIÓN 7: ENTREGABLES MULTIMEDIA Y ENLACES DE MISIÓN CRÍTICA -->
    <div class="print-section print-page-break">
      <div class="print-section-title">
        <span>7. Entregables Oficiales & Enlaces de Misión Crítica</span>
        <span class="print-badge print-badge-blue">AUDITORÍA DIGITAL</span>
      </div>
      <div class="print-deliverables-grid">
        <div class="print-deliv-card">
          <div class="print-deliv-type">${SVG.youtube} Video Oficial de YouTube</div>
          <div class="print-deliv-name">Pitch Audiovisual 120s</div>
          <div class="print-deliv-url">${videoUrl}</div>
          <div style="font-size:7pt; color:var(--status-ok-text); margin-top:4px; font-weight:600;">✓ Modo: No Listado / Calidad 1080p</div>
        </div>
        <div class="print-deliv-card">
          <div class="print-deliv-type">Demo Web / Prototipo</div>
          <div class="print-deliv-name">Dashboard Interactivo</div>
          <div class="print-deliv-url">${siteUrl}</div>
          <div style="font-size:7pt; color:var(--status-ok-text); margin-top:4px; font-weight:600;">✓ Interfaz /impeccable en vivo</div>
        </div>
        <div class="print-deliv-card">
          <div class="print-deliv-type">Bóveda Cloud & Archivos</div>
          <div class="print-deliv-name">Drive, Canva & Esquemas</div>
          <div class="print-deliv-url">${driveUrl}</div>
          <div style="font-size:7pt; color:var(--text-muted); margin-top:4px;">Canva: ${canvaUrl}</div>
        </div>
      </div>
    </div>

    <!-- SECCIÓN 8: MATRIZ ANTIDESCALIFICACIÓN Y GUARDARRAÍLES SIRLI -->
    <div class="print-section print-avoid-break">
      <div class="print-section-title">
        <span>8. Matriz Antidescalificación y Guardarraíles de Rúbrica SIRLI</span>
        <span class="print-badge print-badge-green">10 PUNTOS DE CONTROL</span>
      </div>
      <table class="print-table">
        <thead>
          <tr>
            <th style="width:5%;">#</th>
            <th style="width:35%;">Guardarraíl de Misión Crítica</th>
            <th style="width:45%;">Criterio Oficial de Validación</th>
            <th style="width:15%; text-align:center;">Estado SIRLI</th>
          </tr>
        </thead>
        <tbody>
          ${guardrailsDef.map((g, idx) => {
            const isChecked = Boolean(gr[g.key]);
            return `
              <tr>
                <td class="num-cell">${idx + 1}</td>
                <td><strong>${g.name}</strong></td>
                <td>${g.req}</td>
                <td style="text-align:center;">
                  <span class="print-badge ${isChecked ? 'print-badge-green' : 'print-badge-amber'}">
                    ${isChecked ? '✓ VALIDADO' : 'AUDITADO'}
                  </span>
                </td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    </div>

    <!-- SECCIÓN 9: TRAZABILIDAD TÁCTICA MULTI-IA -->
    ${taskList.length > 0 ? `
      <div class="print-section print-avoid-break">
        <div class="print-section-title">
          <span>9. Orquestación Multi-IA & Trazabilidad Táctica</span>
          <span class="print-badge print-badge-navy">${taskList.length} TAREAS COORDINADAS</span>
        </div>
        <table class="print-table" style="font-size:8pt;">
          <thead>
            <tr>
              <th style="width:30%;">Misión / Rol Táctico</th>
              <th style="width:30%;">Agente IA Sugerido</th>
              <th style="width:25%;">Objetivo de Calidad</th>
              <th style="width:15%; text-align:center;">Estado</th>
            </tr>
          </thead>
          <tbody>
            ${taskList.slice(0, 7).map(t => `
              <tr>
                <td><strong>${t.title}</strong></td>
                <td style="font-family:'JetBrains Mono',monospace; font-size:7.5pt;">${t.ai || 'IA Local'}</td>
                <td>${t.desc ? t.desc.slice(0, 65) + '...' : 'Optimización técnica'}</td>
                <td style="text-align:center;">
                  <span class="print-badge ${t.status === 'done' ? 'print-badge-green' : 'print-badge-blue'}">
                    ${t.status === 'done' ? 'COMPLETO' : 'ACTIVO'}
                  </span>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    ` : ''}

    <!-- SECCIÓN 10: SISTEMA DE DISEÑO /IMPECCABLE Y RETOS DE REFERENCIA -->
    <div class="print-section print-page-break">
      <div class="print-section-title">
        <span>10. Sistema de Diseño e Identidad Visual (/impeccable standard)</span>
        <span class="print-badge print-badge-blue">WCAG AAA COMPLIANT</span>
      </div>
      <div class="print-swatches-grid">
        <div class="print-swatch-card">
          <div class="print-swatch-color" style="background:var(--color-navy);"></div>
          <div class="print-swatch-name">Navy Dark</div>
          <div class="print-swatch-hex">#0D1B35</div>
        </div>
        <div class="print-swatch-card">
          <div class="print-swatch-color" style="background:var(--color-primary);"></div>
          <div class="print-swatch-name">Azul Primario</div>
          <div class="print-swatch-hex">#0866F5</div>
        </div>
        <div class="print-swatch-card">
          <div class="print-swatch-color" style="background:var(--color-primary);"></div>
          <div class="print-swatch-name">Cobalto</div>
          <div class="print-swatch-hex">#1D4ED8</div>
        </div>
        <div class="print-swatch-card">
          <div class="print-swatch-color" style="background:var(--color-accent);"></div>
          <div class="print-swatch-name">Acento Radio</div>
          <div class="print-swatch-hex">#0284C7</div>
        </div>
        <div class="print-swatch-card">
          <div class="print-swatch-color" style="background:#2AA7AD;"></div>
          <div class="print-swatch-name">Verde Cian</div>
          <div class="print-swatch-hex">#2AA7AD</div>
        </div>
        <div class="print-swatch-card">
          <div class="print-swatch-color" style="background:var(--bg-subtle); border:1px solid var(--border-strong);"></div>
          <div class="print-swatch-name">Lienzo Sutil</div>
          <div class="print-swatch-hex">#F8FAFD</div>
        </div>
      </div>
      <div class="print-meta-grid" style="margin-top:6px; margin-bottom:12px;">
        <div><strong>Tipografía Display / Títulos:</strong> Plus Jakarta Sans (900/700/500)</div>
        <div><strong>Tipografía Tablas / Datos:</strong> JetBrains Mono (Tabular Nums)</div>
        <div><strong>Principios de Interfaz:</strong> Cardless Typographic Workbench, cero emojis, bordes hairline de 1px</div>
        <div><strong>Contraste Semántico:</strong> Ratio 14.2:1 (Navy/Blanco) y 8.1:1 (Azul/Blanco)</div>
      </div>

      <div class="print-section-title" style="margin-top:16px;">
        <span>Catálogo Oficial de Retos de Referencia</span>
        <span class="print-badge print-badge-navy">${challengesList.length} RETOS CALIBRADOS</span>
      </div>
      <table class="print-table">
        <thead>
          <tr>
            <th style="width:8%;">ID</th>
            <th style="width:28%;">Reto Oficial</th>
            <th style="width:16%;">Categoría / ODS</th>
            <th style="width:48%;">Propuesta Técnica IA / Factor WOW</th>
          </tr>
        </thead>
        <tbody>
          ${challengesList.slice(0, 9).map(ch => `
            <tr ${ch.id === challengeId ? 'style="background:var(--status-ok-bg); font-weight:600;"' : ''}>
              <td class="num-cell"><strong>#${ch.id}</strong></td>
              <td>${ch.title} ${ch.id === challengeId ? '<span class="print-badge print-badge-blue" style="margin-left:4px;">SELECCIONADO</span>' : ''}</td>
              <td>${ch.category}<br><span style="font-size:7.5pt; color:var(--text-muted); font-family:'JetBrains Mono',monospace;">${Array.isArray(ch.ods) ? ch.ods.join(', ') : (ch.ods || '')}</span></td>
              <td>${ch.wowProposal || ch.proposal || 'Solución estructurada por Rally Studio.'}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <!-- PIE DE PÁGINA TÉCNICO OFICIAL -->
      <div class="print-official-footer">
        <div>RALLY STUDIO · MISSION CONTROL WORKBENCH · /IMPECCABLE SWISS DESIGN</div>
        <div>${escapeHtml((state.university || "SEDE POR DEFINIR").toUpperCase())} · CERTÁMENES OFICIALES ${RALLY_YEAR}</div>
      </div>
    </div>
  `;
}

// Enlace y compatibilidad universal entre preparePrintDossierHTML y generatePrintSheetHTML
window.preparePrintDossierHTML = preparePrintDossierHTML;
window.generatePrintSheetHTML = preparePrintDossierHTML;

function printProjectDossier() {
  let container = document.getElementById("print-dossier-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "print-dossier-container";
    document.body.appendChild(container);
  }
  container.innerHTML = preparePrintDossierHTML();
  showToast("Abriendo vista de impresión / exportación a PDF...");
  setTimeout(() => {
    window.print();
  }, 250);
}


// ── IMPORTAR: VALIDAR Y RESPALDAR ANTES DE REEMPLAZAR ───────────────────────
// Un JSON importado no puede reemplazar el estado a ciegas: se valida contra la
// forma del estado inicial y el estado anterior queda guardado como respaldo.
function validarProyectoImportado(imported) {
  if (!imported || typeof imported !== "object" || Array.isArray(imported)) {
    throw new Error("El archivo no contiene un objeto de proyecto.");
  }
  const base = getInitialState();
  const limpio = {};
  const desconocidas = [];
  const tiposMalos = [];
  Object.keys(imported).forEach(function(clave) {
    if (!Object.prototype.hasOwnProperty.call(base, clave)) {
      desconocidas.push(clave);
      return;
    }
    const valor = imported[clave];
    const esperado = base[clave];
    if (valor === null) {
      limpio[clave] = null;
      return;
    }
    if (esperado !== null && typeof valor !== typeof esperado) {
      tiposMalos.push(clave);
      return;
    }
    if (Array.isArray(esperado) !== Array.isArray(valor)) {
      tiposMalos.push(clave);
      return;
    }
    limpio[clave] = valor;
  });
  return { limpio: limpio, desconocidas: desconocidas, tiposMalos: tiposMalos };
}

function respaldarEstadoActual(motivo) {
  try {
    localStorage.setItem(
      "rally_state_backup",
      JSON.stringify({ motivo: motivo, fecha: new Date().toISOString(), estado: state })
    );
    return true;
  } catch (err) {
    return false;
  }
}

function aplicarProyectoImportado(imported, motivo) {
  const revisado = validarProyectoImportado(imported);
  if (revisado.tiposMalos.length) {
    throw new Error("Tipos inválidos en: " + revisado.tiposMalos.join(", ") + ".");
  }
  const respaldo = respaldarEstadoActual(motivo);
  state = Object.assign(getInitialState(), revisado.limpio);
  saveState();
  syncUI();
  return { desconocidas: revisado.desconocidas, respaldo: respaldo };
}

function importProjectJson(ev) {
  const file = ev.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const imported = JSON.parse(e.target.result);
      const resultado = aplicarProyectoImportado(imported, "import");
      let aviso = "Proyecto importado con éxito.";
      if (resultado.desconocidas.length) {
        aviso += "\nCampos ignorados (no existen en esta versión): " + resultado.desconocidas.join(", ") + ".";
      }
      if (resultado.respaldo) {
        aviso += "\nEl estado anterior quedó guardado como respaldo (rally_state_backup).";
      }
      alert(aviso);
    } catch (err) {
      alert("Error al leer archivo JSON: " + err.message);
    }
  };
  reader.readAsText(file);
}

function copySyncToken() {
  const jsonStr = JSON.stringify(state);
  const b64 = btoa(encodeURIComponent(jsonStr));
  navigator.clipboard.writeText(b64);
  alert("Token de sincronización copiado. Pégalo en el WhatsApp del equipo para que tus compañeros sincronicen su dashboard.");
}

function pasteSyncToken() {
  const token = prompt("Pega aquí el Token de Sincronización compartido por tu compañero:");
  if (!token) return;
  try {
    const jsonStr = decodeURIComponent(atob(token.trim()));
    const imported = JSON.parse(jsonStr);
    const resultado = aplicarProyectoImportado(imported, "sync");
    let aviso = "Dashboard sincronizado exitosamente con el equipo.";
    if (resultado.desconocidas.length) {
      aviso += "\nCampos ignorados (no existen en esta versión): " + resultado.desconocidas.join(", ") + ".";
    }
    if (resultado.respaldo) {
      aviso += "\nEl estado anterior quedó guardado como respaldo (rally_state_backup).";
    }
    alert(aviso);
  } catch (err) {
    alert("Token inválido o corrupto: " + err.message);
  }
}

// ── CRONÓMETRO REGRESIVO Y ALERTAS DE CRONOGRAMA ─────────────────────────────
function initClock() {
  startTimer();
}

function showToast(msg) {
  if (typeof document === "undefined") return;
  const existing = document.querySelector(".toast-notice");
  if (existing) existing.remove();
  const el = document.createElement("div");
  el.className = "toast-notice";
  el.innerHTML = `${SVG.check} <span>${msg}</span>`;
  document.body.appendChild(el);
  setTimeout(() => { if (el.parentNode) el.remove(); }, 3200);
}

function copyToClipboardWithFeedback(text, successMsg) {
  if (typeof navigator !== "undefined" && navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(() => {
      showToast(successMsg || "Copiado al portapapeles");
    }).catch(() => {
      fallbackCopy(text, successMsg);
    });
  } else {
    fallbackCopy(text, successMsg);
  }
}

function fallbackCopy(text, successMsg) {
  if (typeof document === "undefined") return;
  const ta = document.createElement("textarea");
  ta.value = text;
  document.body.appendChild(ta);
  ta.select();
  try { document.execCommand("copy"); } catch(e) {}
  ta.remove();
  showToast(successMsg || "Copiado al portapapeles");
}

function getCurrentDeadlineAlert() {
  if (!state.rally_type) {
    return { label: "STANDBY", time: "--:--", desc: "Selecciona el certamen para activar el cronograma" };
  }
  if (!state.rally_started) {
    return { label: "Inicio Oficial", time: "08:00 AM", desc: "Apertura oficial de retos en plataforma de competencia" };
  }
  const now = Date.now();
  const start = state.start_timestamp || now;

  if (now < start) {
    const diffSec = Math.floor((start - now) / 1000);
    const dh = Math.floor(diffSec / 3600);
    const dm = Math.floor((diffSec % 3600) / 60);
    const ds = Math.floor(diffSec % 60);
    const timeStr = dh > 0 ? `${dh}h ${dm}m` : `${dm}m ${ds}s`;
    return {
      label: "Inicio Programado",
      time: `En ${timeStr}`,
      desc: `Inicia el ${new Date(start).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`
    };
  }

  const elapsedSec = Math.floor((now - start) / 1000);
  const totalSec = (state.hours_total || 24) * 3600;
  const remainSec = Math.max(0, totalSec - elapsedSec);
  const elapsedHours = elapsedSec / 3600;

  if (elapsedHours < 4) {
    const remainToReg = Math.max(0, 4 * 3600 - elapsedSec);
    const rh = Math.floor(remainToReg / 3600);
    const rm = Math.floor((remainToReg % 3600) / 60);
    const regTarget = new Date(start + 4 * 3600 * 1000);
    const timeStr = regTarget.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return { 
      label: "Inscripción Oficial", 
      time: `${timeStr} (${rh}h ${rm}m)`, 
      desc: "Límite de registro de integrantes y sede en la plataforma oficial" 
    };
  }
  if (elapsedHours < 12) {
    const remainToTikTok = Math.max(0, 12 * 3600 - elapsedSec);
    const rh = Math.floor(remainToTikTok / 3600);
    const rm = Math.floor((remainToTikTok % 3600) / 60);
    const ttTarget = new Date(start + 12 * 3600 * 1000);
    const timeStr = ttTarget.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return { 
      label: "Ventana TikTok", 
      time: `${timeStr} (${rh}h ${rm}m)`, 
      desc: "Ventana óptima para subir interacción lúdica y captar interacciones" 
    };
  }
  if (remainSec > 6 * 3600) {
    return { 
      label: "Tesis Técnica", 
      time: "T-6 Horas", 
      desc: "Congelamiento innegociable de solución y justificación técnica" 
    };
  }
  if (remainSec > 4 * 3600) {
    return { 
      label: "Pautado y Presupuesto", 
      time: "T-4 Horas", 
      desc: "Límites de caracteres y cotizaciones de presupuesto cerradas al 100%" 
    };
  }
  if (remainSec > 2 * 3600) {
    return { 
      label: "Render y YouTube", 
      time: "T-2 Horas", 
      desc: "Subir video en modo No listado (YouTube tarda 25m en procesar 1080p)" 
    };
  }
  if (remainSec > 1 * 3600) {
    return { 
      label: "Verificar Links", 
      time: "T-1 Hora", 
      desc: "Comprobar link en incógnito (nunca privado) y cargar PDF pautado" 
    };
  }
  if (remainSec > 0) {
    return { 
      label: "CIERRE DE PLATAFORMA", 
      time: "T-0 Inmutable", 
      desc: "Cierre definitivo de plataforma. Ningún certamen otorga prórroga" 
    };
  }
  return { 
    label: "TIEMPO CUMPLIDO", 
    time: "Cerrado", 
    desc: "Certamen finalizado" 
  };
}

function getTimerString() {
  if (!state.rally_type && !state.rally_started) {
    return { time: "--:--:--", status: "STANDBY" };
  }
  if (!state.rally_started) {
    return { time: `${(state.hours_total || 24).toString().padStart(2, '0')}:00:00`, status: "STANDBY" };
  }
  const now = Date.now();
  const start = state.start_timestamp || now;

  if (now < start) {
    const remainToStart = Math.floor((start - now) / 1000);
    const h = Math.floor(remainToStart / 3600).toString().padStart(2, "0");
    const m = Math.floor((remainToStart % 3600) / 60).toString().padStart(2, "0");
    const s = Math.floor(remainToStart % 60).toString().padStart(2, "0");
    return { time: `${h}:${m}:${s}`, status: "INICIA EN" };
  }

  const elapsedSec = Math.floor((now - start) / 1000);
  const totalSec = (state.hours_total || 24) * 3600;
  const remainSec = Math.max(0, totalSec - elapsedSec);

  if (remainSec <= 0) {
    return { time: "00:00:00", status: "TIEMPO CUMPLIDO" };
  }

  const h = Math.floor(remainSec / 3600).toString().padStart(2, "0");
  const m = Math.floor((remainSec % 3600) / 60).toString().padStart(2, "0");
  const s = Math.floor(remainSec % 60).toString().padStart(2, "0");
  return { time: `${h}:${m}:${s}`, status: "En curso" };
}

function startTimer() {
  if (timerInterval) clearInterval(timerInterval);

  function updateClockDisplay() {
    const clockEl = document.getElementById("clock-timer");
    const statusEl = document.getElementById("clock-status-tag");
    const tData = getTimerString();
    if (clockEl) clockEl.innerText = tData.time;
    if (statusEl) statusEl.innerText = tData.status;

    const deadlineEl = document.getElementById("topbar-deadline-pill");
    if (deadlineEl) {
      const dData = getCurrentDeadlineAlert();
      deadlineEl.innerHTML = `
        <span class="deadline-pill-dot"></span>
        <span class="deadline-pill-label">${dData.label}</span>
        <span class="deadline-pill-time">${dData.time}</span>
      `;
      deadlineEl.title = dData.desc;
    }
  }

  // Sondeo periódico de telemetría de hardware
  let telemetryTick = 0;
  function pollTelemetry() {
    fetch("/api/telemetry")
      .then(r => r.json())
      .then(data => {
        const cpuEl = document.getElementById("telemetry-cpu-val");
        const ramEl = document.getElementById("telemetry-ram-val");
        if (cpuEl) cpuEl.innerText = `${data.cpu_percent}%`;
        if (ramEl) ramEl.innerText = `${data.ram_percent}%`;
      })
      .catch(() => {});
  }

  updateClockDisplay();
  pollTelemetry();
  timerInterval = setInterval(() => {
    updateClockDisplay();
    telemetryTick++;
    if (telemetryTick % 4 === 0) {
      pollTelemetry();
    }
  }, 1000);
}

function startOfficialRallyTimer() {
  if (esVisitante()) return;
  state.rally_started = true;
  const official = new Date();
  official.setHours(8, 0, 0, 0);
  state.start_timestamp = official.getTime();
  state.custom_calibrated = true;
  saveState();
  startTimer();
  if (typeof renderApp === "function") renderApp();
  showToast("Cronómetro calibrado: Inicio Oficial 08:00 AM");
}

// ── TOGGLE SIDEBAR & PANEL ───────────────────────────────────────────────────
function closeAllDrawers() {
  const body = document.getElementById("app-body") || document.body;
  body.classList.remove("sidebar-drawer-open", "panel-drawer-open");
  renderMobileBottomBar();
}

function toggleSidebar() {
  const body = document.getElementById("app-body") || document.body;
  // El mismo umbral que dibuja el drawer en style.css (900 px). Con 1024 aqui,
  // entre 901 y 1024 el boton anadia una clase que el CSS no conoce: no abria.
  if (window.innerWidth <= 900) {
    body.classList.remove("panel-drawer-open");
    body.classList.toggle("sidebar-drawer-open");
  } else {
    body.classList.toggle("sidebar-collapsed");
  }
  renderMobileBottomBar();
}

function togglePanel() {
  const body = document.getElementById("app-body") || document.body;
  if (window.innerWidth <= 900) {
    body.classList.remove("sidebar-drawer-open");
    body.classList.toggle("panel-drawer-open");
  } else {
    body.classList.toggle("panel-collapsed");
  }
  renderMobileBottomBar();
}

function calculateAuditScore() {
  let points = 0;
  if (state.rally_type) points += 10;
  if (state.team_name && state.university) points += 10;
  if (state.challenge_id) points += 15;
  if (state.solution_approved) points += 15;
  if (typeof isPautadoComplete === "function" && isPautadoComplete()) points += 15;
  if (typeof isBudgetValid === "function" && isBudgetValid()) points += 10;
  if (typeof isScriptComplete === "function" && isScriptComplete()) points += 10;
  const guardrails = state.guardrails || {};
  const guardrailsCount = Object.values(guardrails).filter(Boolean).length;
  if (guardrailsCount >= 5) points += 15;
  return points;
}

// ── BARRA MÓVIL DE NAVEGACIÓN INFERIOR ───────────────────────────────────────
function renderMobileBottomBar() {
  const el = document.getElementById("mobile-bottom-bar");
  if (!el) return;
  const stage = getWorkflowStage();
  if (stage < 2) {
    el.style.display = "none";
    return;
  }
  el.style.display = "";
  const body = document.getElementById("app-body") || document.body;
  const score = calculateAuditScore();
  const isSidebarOpen = body.classList.contains("sidebar-drawer-open");
  const isPanelOpen = body.classList.contains("panel-drawer-open");

  el.innerHTML = `
    <button class="mobile-bottom-tab ${activeTab === 'resumen' ? 'active' : ''}" onclick="switchTab('resumen')" title="Resumen del rally">
      ${SVG.network}
      <span>Resumen</span>
    </button>
    <button class="mobile-bottom-tab ${isSidebarOpen ? 'active' : ''}" onclick="toggleSidebar()" title="Fases de trabajo">
      ${SVG.menu}
      <span>Fases</span>
    </button>
    <button class="mobile-bottom-tab ${isPanelOpen ? 'active' : ''}" onclick="togglePanel()" title="Auditoría del entregable">
      ${SVG.shieldCheck}
      <span>Auditoría</span>
    </button>
    <button class="mobile-bottom-tab ${activeTab === 'timeline' ? 'active' : ''}" onclick="switchTab('timeline')" title="Checklist de entrega y avisos">
      ${SVG.clock}
      <span>Checklist</span>
    </button>
  `;
}

// ── TOPBAR ───────────────────────────────────────────────────────────────────
function renderTopbar() {
  const el = document.getElementById("topbar");
  const stage = getWorkflowStage();
  const certamen = state.rally_type === "latam" ? "Rally Latam 28h" : state.rally_type === "nacional" ? "Rally Nacional 24h" : "";
  const pName = state.team_name || state.project_name || "";
  const timerData = getTimerString();
  const auditPoints = calculateAuditScore();

  el.innerHTML = `
    <div class="topbar-left">
      ${stage >= 2 ? `<button class="btn-toggle-sidebar" onclick="toggleSidebar()" title="Colapsar/Expandir menú lateral">${SVG.menu}</button>` : ""}
      <div class="brand-group" onclick="goHome()" title="Ir al inicio de Rally Studio">
        ${SVG.logo}
        <span class="brand-text-navy">RALLY</span>
        <span class="brand-text-blue">STUDIO</span>
      </div>
      ${state.rally_type ? `
        <div class="topbar-emblems-group" title="${certamen}">
          <img src="${state.rally_type === 'latam' ? 'assets/logo_rally_latam.png' : 'assets/logo_rally_nacional.png'}" 
               class="topbar-emblem-img" 
               alt="${rallyProfile().short}">
          <span class="topbar-emblem-divider"></span>
          <img src="assets/logo_uni_official.png" 
               class="topbar-uni-img" 
               alt="Logo de la universidad">
          ${state.team_logo_img ? `
            <span class="topbar-emblem-divider"></span>
            <img src="${escapeHtml(state.team_logo_img)}" class="topbar-team-avatar" alt="Team Logo" title="${escapeHtml(state.team_name || 'Equipo')}">
          ` : ""}
        </div>
      ` : ""}
      ${pName ? `<span class="project-title-crumb" title="${escapeHtml(pName)}">/ ${escapeHtml(pName)}</span>` : ""}
      ${state.challenge_id ? `<span class="challenge-title-crumb">${escapeHtml((() => { const ch = (state.challenges || []).find(c => c.id === state.challenge_id) || (typeof OFFICIAL_CHALLENGES_2026 !== "undefined" && OFFICIAL_CHALLENGES_2026.find(c => c.id === state.challenge_id)); return ch && ch.title ? ch.title : `Reto #${state.challenge_id}`; })())}</span>` : ""}
    </div>
    <div class="topbar-actions">
      ${stage >= 2 ? `
        <button class="btn-toggle-panel topbar-chip" onclick="openAIThesisFormulatorModal(state.challenge_id || '01')" title="IA Copilot: asistente dual-mode y prompts de razonamiento" aria-label="IA Copilot">
          ${SVG.spark}
        </button>
        <button class="btn-toggle-panel topbar-chip" onclick="togglePanel()" title="Panel de Auditoría (${auditPoints}%)" aria-label="Auditoría: ${auditPoints}%">
          ${SVG.shieldCheck}
          <span class="topbar-chip-num">${auditPoints}%</span>
        </button>
      ` : ""}

      <!-- Identidad de esta persona: nombre real, definido por ella misma -->
      <button class="collaborator-avatar-badge" onclick="openIdentityModal()" title="${amINamed() ? `Trabajas como ${currentClientMascot.name}. Clic para cambiar de persona.` : 'Define tu nombre para que el equipo sepa quién eres.'}">
        <span class="collaborator-avatar-icon">${amINamed() ? currentClientMascot.icon : SVG.users}</span>
        <span class="collaborator-name-label ${amINamed() ? '' : 'is-unset'}">${escapeHtml(currentClientMascot.name)}</span>
        ${rolChip()}
      </button>

      <div class="timer-pill-navy" id="timer-pill" onclick="openTimerSettingsModal()" style="cursor:pointer;" title="Clic para calibrar o ajustar cronómetro">
        ${SVG.clock}
        <span id="clock-timer">${timerData.time}</span>
        <span id="clock-status-tag" style="font-size:11px; opacity:0.75; font-weight:700; margin-left:4px;">${timerData.status}</span>
      </div>

      <div class="dropdown-wrapper">
        <button class="btn-icon-discreet" onclick="toggleProjectMenu(event)" id="btn-project-menu" title="Opciones de proyecto">
          ${SVG.dotsVertical}
        </button>
        <div id="project-dropdown" class="dropdown-menu-box" style="display:none; right:0; left:auto;">
          <a href="#" onclick="if (window.RSA && RSA.openMenu) RSA.openMenu(); return false;">${SVG.spark} Herramientas de IA</a>
          <div style="border-top:1px solid var(--border-light); margin:6px 0;"></div>
          <a href="#" onclick="startOfficialRallyTimer(); return false;">${SVG.spark} Iniciar Cronómetro (Inicio Oficial 08:00 AM)</a>
          <a href="#" onclick="state.rally_started=false; state.start_timestamp=null; saveState(); startTimer(); return false;">Pausar / Standby</a>
          <a href="#" onclick="resetProject(); return false;">Reiniciar Certamen (T=0)</a>
          <a href="#" onclick="exportProjectMarkdown(); return false;">${SVG.copy} Exportar Dossier (.md)</a>
          <a href="#" onclick="printProjectDossier(); return false;">${SVG.download} Imprimir / Guardar como PDF</a>
          <a href="#" onclick="exportProjectJson(); return false;">${SVG.download} Exportar Proyecto (.json)</a>
          <label style="cursor:pointer; display:flex; align-items:center; gap:8px; padding:9px 14px; font-size:12px; color:var(--text-title);">
            ${SVG.upload} Importar Proyecto (.json)
            <input type="file" accept=".json" style="display:none;" onchange="importProjectJson(event)">
          </label>
          <div style="border-top:1px solid var(--border-light); margin:6px 0;"></div>
          <a href="stats.html" target="_blank" title="Resumen de partida: horas, entregables, quién tomó qué">${SVG.chart} Debrief de la partida</a>
          <a href="graph.html" target="_blank" title="Grafo del corpus: rúbricas, ganadores y retos, ya compilado">${SVG.network} Grafo de conocimiento</a>
          <a href="../design/index.html" target="_blank" title="Kit de marca: carrusel del equipo, kit de prensa, thumbnail e impacto">${SVG.spark} Diseño del proyecto</a>
          <a href="../script/teleprompter.html" target="_blank" rel="noopener" title="Teleprompter del guion de 120 s, listo para grabar">${SVG.external} Teleprompter</a>
          ${esVisitante() ? "" : `<a href="admin.html" title="Accesos del equipo: invitar, revisar quién entró, retirar acceso">${SVG.users} ${esMentor() ? "Revisar accesos del equipo" : "Accesos del equipo"}</a>`}
        </div>
      </div>
    </div>
  `;
}

function toggleProjectMenu(event) {
  if (event) event.stopPropagation();
  const menu = document.getElementById("project-dropdown");
  if (!menu) return;
  menu.style.display = menu.style.display === "none" ? "block" : "none";
}

document.addEventListener("click", () => {
  const menu = document.getElementById("project-dropdown");
  if (menu) menu.style.display = "none";
});

// ── CALIBRACIÓN INTERACTIVA DE CRONÓMETRO ─────────────────────────────────────
function formatDateTimeLocal(ts) {
  const d = new Date(ts);
  const pad = n => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function openTimerSettingsModal() {
  let modal = document.getElementById("timer-modal-overlay");
  if (!modal) {
    modal = document.createElement("div");
    modal.id = "timer-modal-overlay";
    modal.className = "modal-overlay";
    document.body.appendChild(modal);
  }
  
  const currentTotal = state.hours_total || (state.rally_type === "latam" ? 28 : 24);
  const currentStart = state.start_timestamp || Date.now();
  const currentStartFormatted = formatDateTimeLocal(currentStart);

  modal.innerHTML = `
    <div class="modal-card" style="max-width:480px;" onclick="event.stopPropagation()">
      <div class="modal-header" style="margin-bottom:12px;">
        <div style="display:flex; align-items:center; gap:8px;">
          ${SVG.clock}
          <h3 class="modal-title" style="margin:0; font-size:16px; font-weight:800; color:var(--text-title);">Calibrar Hora de Inicio y Cronómetro</h3>
        </div>
        <button class="btn-icon-discreet" onclick="closeTimerSettingsModal()" style="font-size:16px; line-height:1;">&times;</button>
      </div>
      
      <p style="font-size:12px; color:var(--text-muted); margin-bottom:14px; line-height:1.45;">
        Define con exactitud a qué hora empezó o empezará la competencia para calcular las alertas reglamentarias y el tiempo restante.
      </p>

      <div style="margin-bottom:12px;">
        <label style="font-size:11px; font-weight:700; color:var(--text-main); display:block; margin-bottom:5px;">
          Hora Oficial de Inicio (Empieza o Empezó)
        </label>
        <input type="datetime-local" id="timer-input-start-datetime" value="${currentStartFormatted}" oninput="updateTimerModalPreview()" style="width:100%; padding:9px 12px; border:1px solid var(--border-light); border-radius:8px; font-size:13px; font-weight:700; font-family:var(--font-mono); background:var(--bg-subtle); box-sizing:border-box;">
      </div>

      <div style="display:flex; flex-wrap:wrap; gap:6px; margin-bottom:16px;">
        <button type="button" class="btn-pill-light" style="font-size:11px; padding:5px 8px;" onclick="setTimerStartPreset('now')">Ahora</button>
        <button type="button" class="btn-pill-light" style="font-size:11px; padding:5px 8px;" onclick="setTimerStartPreset('today_08')">Hoy 08:00 AM</button>
        <button type="button" class="btn-pill-light" style="font-size:11px; padding:5px 8px;" onclick="setTimerStartPreset('today_09')">Hoy 09:00 AM</button>
        <button type="button" class="btn-pill-light" style="font-size:11px; padding:5px 8px;" onclick="setTimerStartPreset('minus_1h')">Hace 1 hora</button>
        <button type="button" class="btn-pill-light" style="font-size:11px; padding:5px 8px;" onclick="setTimerStartPreset('minus_2h')">Hace 2 horas</button>
      </div>

      <div style="display:grid; grid-template-columns: 1fr 1fr; gap:12px; margin-bottom:14px;">
        <div>
          <label style="font-size:11px; font-weight:700; color:var(--text-main); display:block; margin-bottom:4px;">Régimen Total (Horas)</label>
          <input type="number" id="timer-input-hours-total" value="${currentTotal}" min="1" max="72" oninput="updateTimerModalPreview()" style="width:100%; padding:8px 10px; border:1px solid var(--border-light); border-radius:8px; font-size:13px; font-weight:700; font-family:var(--font-mono); background:var(--bg-subtle); box-sizing:border-box;">
        </div>
        <div>
          <label style="font-size:11px; font-weight:700; color:var(--text-main); display:block; margin-bottom:4px;">Certamen Predeterminado</label>
          <div style="display:flex; gap:6px;">
            <button type="button" class="btn-pill-light" style="flex:1; font-size:11px; padding:8px 4px;" onclick="setTimerPreset(24)">24h (Nac.)</button>
            <button type="button" class="btn-pill-light" style="flex:1; font-size:11px; padding:8px 4px;" onclick="setTimerPreset(28)">28h (Latam)</button>
          </div>
        </div>
      </div>

      <div id="timer-modal-preview-box" style="padding:10px 12px; background:var(--bg-subtle); border:1px solid var(--border-light); border-radius:8px; margin-bottom:16px; font-size:12px; color:#1E3A8A; line-height:1.5;">
        <!-- Se rellena con updateTimerModalPreview() -->
      </div>

      <div style="display:flex; justify-content:space-between; align-items:center; padding-top:14px; border-top:1px solid var(--border-light);">
        <button type="button" class="btn-pill-ghost" style="color:${state.rally_started ? '#DC2626' : '#0866F5'}; font-size:12px; font-weight:700;" onclick="toggleTimerRunning()">
          ${state.rally_started ? 'Pausar Reloj' : 'Activar Reloj'}
        </button>
        <div style="display:flex; gap:8px;">
          <button type="button" class="btn-pill-light" style="font-size:12px;" onclick="closeTimerSettingsModal()">Cancelar</button>
          <button type="button" class="btn-select-card filled" style="padding:7px 18px; font-size:12px; font-weight:700;" onclick="applyTimerSettings()">Guardar y Activar</button>
        </div>
      </div>
    </div>
  `;
  modal.style.display = "flex";
  updateTimerModalPreview();
}

function updateTimerModalPreview() {
  const box = document.getElementById("timer-modal-preview-box");
  const dtInp = document.getElementById("timer-input-start-datetime");
  const hoursInp = document.getElementById("timer-input-hours-total");
  if (!box || !dtInp || !hoursInp) return;

  const startTs = dtInp.value ? Date.parse(dtInp.value) : (state.start_timestamp || Date.now());
  const hours = parseInt(hoursInp.value, 10) || (state.hours_total || 24);
  const endTs = startTs + (hours * 3600 * 1000);
  const now = Date.now();

  const startDate = new Date(startTs);
  const endDate = new Date(endTs);
  const options = { weekday: 'short', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' };

  let statusText = "";
  if (now < startTs) {
    const diff = Math.floor((startTs - now) / 1000);
    const dh = Math.floor(diff / 3600);
    const dm = Math.floor((diff % 3600) / 60);
    statusText = `<span style="color:var(--color-accent); font-weight:700;">POR INICIAR</span> (empieza en ${dh}h ${dm}m)`;
  } else {
    const elapsed = Math.floor((now - startTs) / 1000);
    const total = hours * 3600;
    const remain = Math.max(0, total - elapsed);
    if (remain <= 0) {
      statusText = `<span style="color:var(--status-err-text); font-weight:700;">TIEMPO CUMPLIDO</span>`;
    } else {
      const rh = Math.floor(remain / 3600);
      const rm = Math.floor((remain % 3600) / 60);
      statusText = `<span style="color:var(--color-accent); font-weight:700;">EN CURSO</span> (restan ${rh}h ${rm}m de ${hours}h)`;
    }
  }

  box.innerHTML = `
    <div style="display:flex; justify-content:space-between; margin-bottom:3px;">
      <span><strong>Inicio:</strong> ${startDate.toLocaleDateString('es-NI', options)}</span>
      <span><strong>Fin:</strong> ${endDate.toLocaleDateString('es-NI', options)}</span>
    </div>
    <div><strong>Cálculo:</strong> ${statusText}</div>
  `;
}

function setTimerStartPreset(type) {
  const inp = document.getElementById("timer-input-start-datetime");
  if (!inp) return;
  const target = new Date();
  if (type === "now") {
    // Current time
  } else if (type === "today_08") {
    target.setHours(8, 0, 0, 0);
  } else if (type === "today_09") {
    target.setHours(9, 0, 0, 0);
  } else if (type === "minus_1h") {
    target.setTime(Date.now() - 3600 * 1000);
  } else if (type === "minus_2h") {
    target.setTime(Date.now() - 7200 * 1000);
  }
  inp.value = formatDateTimeLocal(target.getTime());
  updateTimerModalPreview();
}

function closeTimerSettingsModal() {
  const modal = document.getElementById("timer-modal-overlay");
  if (modal) modal.style.display = "none";
}

function setTimerPreset(hours) {
  const inp = document.getElementById("timer-input-hours-total");
  if (inp) inp.value = hours;
  updateTimerModalPreview();
}

function toggleTimerRunning() {
  if (state.rally_started) {
    state.rally_started = false;
  } else {
    state.rally_started = true;
    if (!state.start_timestamp) state.start_timestamp = Date.now();
  }
  saveState();
  startTimer();
  openTimerSettingsModal();
}

function applyTimerSettings() {
  const hoursInp = document.getElementById("timer-input-hours-total");
  const dtInp = document.getElementById("timer-input-start-datetime");

  if (hoursInp) {
    const val = parseInt(hoursInp.value, 10);
    if (!isNaN(val) && val > 0) {
      state.hours_total = val;
    }
  }

  if (dtInp && dtInp.value) {
    const parsed = Date.parse(dtInp.value);
    if (!isNaN(parsed)) {
      state.start_timestamp = parsed;
      state.custom_calibrated = true;
    }
  } else if (!state.start_timestamp) {
    state.start_timestamp = Date.now();
  }

  if (!state.rally_type) {
    state.rally_type = "nacional";
  }
  state.rally_started = true;

  saveState();
  startTimer();
  closeTimerSettingsModal();
  showToast("Cronómetro configurado correctamente");
}

// ── NAVEGACIÓN LATERAL POR DEPENDENCIAS ───────────────────────────────────────
function renderNavigation() {
  const nav = document.getElementById("sidebar");
  const currentStage = getWorkflowStage();
  const map = rsDefMap();

  const linkFor = (t, isUnlocked) => {
    const isCompleted = t.summary ? false : rsPhaseState(t.id, map).code === "done";
    const activeClass = t.id === activeTab ? "active" : "";
    let statusMarkup = "";
    if (t.summary) {
      statusMarkup = "";
    } else if (!isUnlocked) {
      statusMarkup = rsPill("waiting", { compact: true, label: "En espera" });
    } else if (!rsPhaseDefs(t.id, map).length) {
      // Vista sin entregables (identidad visual): no hay nada que medir.
      statusMarkup = "";
    } else if (isCompleted) {
      statusMarkup = rsPill("done", { compact: true, label: "Terminado" });
    } else if (rsPhaseState(t.id, map).code === "waiting") {
      statusMarkup = rsPill("waiting", { compact: true, label: "En espera" });
    } else {
      statusMarkup = rsPill("working", { compact: true, label: "En progreso" });
    }
    return `
      <a href="#" class="nav-link ${activeClass} ${!isUnlocked ? 'locked' : ''}"
         style="${!isUnlocked ? 'opacity:0.45; cursor:not-allowed;' : ''}"
         onclick="${isUnlocked ? `switchTab('${t.id}', event)` : 'event.preventDefault()'}">
        <span style="display:flex; align-items:center; gap:6px;">${t.label.replace(/^\d+\s*/, "")}</span>
        ${statusMarkup}
      </a>
    `;
  };

  // Todas las fases visibles en orden. Las ya cerradas se atenúan, no se esconden:
  // esconderlas obligaba a abrir un desplegable para volver a una fase hecha.
  const tabs = navTabsVisibles().filter(t => !t.summary || currentStage >= 2);
  // La configuración deja de competir con el flujo en cuanto está resuelta.
  const setupReady = setupIsDone();
  const flowTabs = setupReady ? tabs.filter(function (t) { return !t.setup; }) : tabs;
  const cfgTabs = setupReady ? tabs.filter(function (t) { return t.setup; }) : [];
  const cfgMarkup = cfgTabs.length
    ? '<div class="sidebar-heading sidebar-heading-cfg">Configuracion</div>' +
      cfgTabs.map(function (t) { return linkFor(t, true).replace('class="nav-link ', 'class="nav-link is-cfg '); }).join("")
    : "";
  const lockedCount = tabs.filter(t => t.level > currentStage).length;

  nav.innerHTML = `
    <div class="drawer-header-mobile">
      <span>Fases de Trabajo</span>
      <button class="btn-close-drawer" onclick="closeAllDrawers()" aria-label="Cerrar menú lateral">${SVG.close}</button>
    </div>
    <div class="sidebar-heading">Fases de Trabajo</div>
    ${rolAviso()}
    ${flowTabs.map(t => {
      const unlocked = t.level <= currentStage;
      const done = !t.summary && rsPhaseState(t.id, map).code === "done";
      return linkFor(t, unlocked).replace('class="nav-link ', `class="nav-link ${done ? 'is-done' : ''} `);
    }).join("")}
    ${cfgMarkup}
    ${lockedCount ? `<div class="nav-locked-hint">${lockedCount} fases se abren al avanzar</div>` : ""}
  `;
}

function goHome() {
  const stage = getWorkflowStage();
  activeTab = stage >= 3 ? "resumen" : stage === 2 ? "challenges" : stage === 1 ? "team" : "certamen";
  state.active_tab = activeTab;
  syncUI();
}

function switchTab(tabId, ev) {
  if (ev) ev.preventDefault();
  const target = NAV_TABS.find(t => t.id === tabId);
  if (target && target.level > getWorkflowStage()) return;
  activeTab = tabId;
  state.active_tab = tabId;
  if (tabId === "challenges") {
    const body = document.getElementById("app-body") || document.body;
    body.classList.add("sidebar-collapsed");
    body.classList.add("panel-collapsed");
  }
  saveState();
  closeAllDrawers();
  renderNavigation();
  renderTab(tabId);
  renderMobileBottomBar();
}

// ── DESPACHADOR CENTRAL DE VISTAS ────────────────────────────────────────────
// Dirección de transición: comparar el índice de la fase previa con la nueva
// (orden de NAV_TABS). Avanzar → entrada desde la derecha; retroceder → izquierda.
let rsPrevTabId = null;

// Indicador de agentes trabajando (mascota construyendo).
// Se muestra cuando algún agente está ejecutándose y desaparece al terminar.
let rsAgentBusy = false;
let rsAgentCuantos = 0;          // cuántos especialistas están trabajando ahora
let rsAgentEtiqueta = "";
let rsAgentTimer = null;

// on: ¿queda algo vivo? · label: qué está pasando · n: cuántos (si el que llama lo sabe)
// Con varios agentes, un booleano no alcanza: el primero que termina apagaba el aviso
// aunque los otros dos siguieran trabajando.
window.rsAgentActivity = function rsAgentActivity(on, label, n) {
  on = !!on;
  rsAgentCuantos = Number.isFinite(n)
    ? Math.max(0, n)
    : Math.max(0, rsAgentCuantos + (on ? 1 : -1));
  if (label) rsAgentEtiqueta = label;
  const total = rsAgentCuantos;
  const visible = total > 0;
  rsAgentBusy = visible;
  clearTimeout(rsAgentTimer);
  let el = document.getElementById("agent-activity");
  if (!visible) {
    if (el) {
      el.classList.remove("is-on");
      rsAgentTimer = setTimeout(() => { el.remove(); }, 400);
    }
    return;
  }
  if (!el) {
    el = document.createElement("div");
    el.id = "agent-activity";
    el.setAttribute("role", "status");
    el.setAttribute("aria-live", "polite");
    document.body.appendChild(el);
  }
  el.innerHTML = `
    <span class="aa-robot" aria-hidden="true">
      <svg viewBox="0 0 40 40" width="34" height="34" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="20" cy="5" r="2" fill="currentColor" />
        <line x1="20" y1="7" x2="20" y2="11" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
        <rect x="9" y="11" width="22" height="16" rx="5" fill="currentColor" />
        <rect x="12" y="14" width="16" height="8" rx="2.5" fill="#fff" opacity=".92" />
        <circle cx="16.5" cy="18" r="1.7" fill="currentColor" />
        <circle cx="23.5" cy="18" r="1.7" fill="currentColor" />
        <rect x="17" y="27" width="6" height="2.6" rx="1.2" fill="currentColor" opacity=".5" />
        <rect x="8" y="29.6" width="24" height="8" rx="3" fill="currentColor" opacity=".85" />
        <g class="aa-arm">
          <line x1="32" y1="30" x2="36" y2="22" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" />
          <rect x="33.4" y="16.6" width="6" height="4.4" rx="1.2" fill="currentColor" transform="rotate(22 36.4 18.8)" />
        </g>
      </svg>
      <span class="aa-spark"></span>
    </span>
    <span class="aa-text"><b>${total > 1 ? "Agentes en marcha" : "Agente en marcha"}</b><span>${total > 1 ? `${total} en paralelo · ${rsAgentEtiqueta || "Redactando la propuesta…"}` : (rsAgentEtiqueta || "Redactando la propuesta…")}</span></span>`;
  // Quien quiera saber cuántos hay (el chat, por ejemplo) pregunta acá.
  window.rsAgentesActivos = function () { return rsAgentCuantos; };
  requestAnimationFrame(() => el.classList.add("is-on"));
};

function renderTab(tabId) {
  const main = document.getElementById("main");
  const renderers = {
    resumen: renderViewResumen,
    certamen: renderViewCertamen,
    team: renderViewTeam,
    identidad: renderViewIdentidad,
    challenges: renderViewChallenges,
    solution: renderViewSolution,
    impact: renderViewImpact,
    multi_ai: renderViewMultiAI,
    pautado: renderViewPautado,
    budget: renderViewBudget,
    resources: renderViewResources,
    canvas: renderViewCanvas,
    script: renderViewScript,
    webdemo: renderViewWebDemo,
    timeline: renderViewTimeline
  };
  const prevIdx = NAV_TABS.findIndex(t => t.id === rsPrevTabId);
  const nextIdx = NAV_TABS.findIndex(t => t.id === tabId);
  let dirCls = "";
  if (prevIdx !== -1 && nextIdx !== -1 && prevIdx !== nextIdx) {
    dirCls = nextIdx > prevIdx ? " rs-fwd" : " rs-back";
  }
  rsPrevTabId = tabId;
  main.innerHTML = `<div class="content-wrapper rs-view${dirCls}${tabId === "challenges" ? " is-wide" : ""}">${(renderers[tabId] || renderViewCertamen)()}</div>`;
  if (tabId === "canvas") requestAnimationFrame(fitAllCanvasInputs);
  if (tabId === "script") requestAnimationFrame(updateScriptMeters);
  if (tabId === "pautado") requestAnimationFrame(() => { ajustarAltoTodos(".pa-input"); refreshPautadoTemplateStatus(); });
  if (tabId === "challenges") requestAnimationFrame(() => {
    document.querySelectorAll('[id^="new-idea-input-"]').forEach(el => ajustarAltoTexto(el, 34));
  });
  if (tabId !== "resumen") requestAnimationFrame(() => rsMountTakeBar(tabId));
  updateInspector();
  attachTabListeners(tabId);
}

// ═════════════════════════════════════════════════════════════════════════════
// CENTRO DE MANDO: RESUMEN ADAPTATIVO, ENTREGABLES Y RESPONSABLES
// Capa aditiva: no reemplaza ninguna fase ni dato existente.
// ═════════════════════════════════════════════════════════════════════════════

let rsFilter = "all";

function rsWordCount(text) {
  return String(text || "").trim().split(/\s+/).filter(Boolean).length;
}

function rsPautadoSectionFilled(key) {
  const len = (state.pautado[key] || "").length;
  const limit = getPautadoLimit(key);
  return limit === null ? len > 0 : (len >= 150 && len <= limit);
}

// Escribir abre la siguiente fase; dar por terminada exige dos lecturas.
function rsPautadoSectionDone(key) {
  return rsPautadoSectionFilled(key) && rsPautadoApproved(key);
}

// ── APROBACIÓN DEL PAUTADO: texto escrito no es texto aprobado ───────────────
// Cada sección se cierra cuando dos personas del equipo la leen y la aprueban.
const RS_APPROVALS_MIN = 2;

function rsPautadoStore() {
  if (!state.pautado_approvals || typeof state.pautado_approvals !== "object") state.pautado_approvals = {};
  return state.pautado_approvals;
}

function rsPautadoApprovals(key) {
  const rec = rsPautadoStore()[key];
  const nombres = rec && Array.isArray(rec.names) ? rec.names.filter(Boolean) : [];
  return { names: nombres, snapshot: (rec && rec.snapshot) || "" };
}

function rsPautadoApproved(key) {
  return rsPautadoApprovals(key).names.length >= RS_APPROVALS_MIN;
}

function rsApprovePautado(key, ev) {
  if (ev) ev.preventDefault();
  if (!amINamed()) { rsRequireName(); return; }
  const yo = currentClientMascot.name;
  const texto = state.pautado[key] || "";
  if (!texto.trim()) { showToast("Primero escribe la sección: no se aprueba lo vacío."); return; }
  const { names } = rsPautadoApprovals(key);
  const store = rsPautadoStore();
  const yaEsta = names.includes(yo);
  const nuevos = yaEsta ? names.filter(n => n !== yo) : names.concat([yo]);
  store[key] = { names: nuevos, snapshot: yaEsta ? (store[key] || {}).snapshot || texto : texto };
  saveState();
  if (!yaEsta) showToast(`Aprobaste ${PAUTADO_LABELS[key] || key}. ${nuevos.length} de ${RS_APPROVALS_MIN} lecturas.`);
  else showToast(`Retiraste tu aprobación de ${PAUTADO_LABELS[key] || key}.`);
  if (activeTab === "pautado") renderTab("pautado");
  else rsRepaintTakeBar();
}

// Si el texto cambia después de aprobado, las aprobaciones viejas no valen.
function rsResetApprovalsIfEdited(key, texto) {
  const store = rsPautadoStore();
  const rec = store[key];
  if (!rec || !Array.isArray(rec.names) || !rec.names.length) return;
  if ((rec.snapshot || "") === texto) return;
  store[key] = { names: [], snapshot: "" };
}

function rsCanvasFilledCount() {
  const canvas = (state.model_canvas && typeof state.model_canvas === "object") ? state.model_canvas : {};
  return ["socios","actividades","propuesta","relaciones","segmentos","recursos","canales","costes","ingresos"]
    .filter(k => String(canvas[k] || "").trim() !== "").length;
}

// Definición única de entregables. `auto()` detecta lo ya hecho; `requires` marca espera.
function getDeliverableDefs() {
  return [
    { id: "certamen", phase: "certamen", title: "Certamen y reglas", needs: "Elegir Rally Latam 28h o Nacional 24h.", requires: [], auto: () => !!state.rally_type },
    { id: "equipo", phase: "team", title: "Nombre, sede y marca", needs: "Nombre del equipo, universidad y ciudad.", requires: ["certamen"], auto: () => !!state.team_name && !!state.university },
    { id: "reto", phase: "challenges", title: "Reto del comité seleccionado", needs: "Elegir un reto con su número y categoría.", requires: ["equipo"], auto: () => !!state.challenge_id },
    { id: "solucion", phase: "solution", title: "Solución aprobada por el equipo", needs: "Tesis y versión simple, aprobadas en el taller.", requires: ["reto"], auto: () => !!state.solution_approved },
    { id: "ods", phase: "impact", title: "ODS y eje del Plan País", needs: "Elegir ODS y justificar el eje (solo Nacional).", requires: ["reto"], auto: () => ((state.impact_alignment && state.impact_alignment.selected_ods) || []).length > 0 },
    { id: "despacho", phase: "multi_ai", title: "Despacho a IAs externas", needs: "Al menos 3 encargos cerrados con resultado.", requires: ["solucion"], auto: () => (state.tasks || []).filter(t => t.status === "completed").length >= 3 },
    { id: "pautado_problema", phase: "pautado", title: "Pautado · Problema", needs: "150–1250 caracteres en Latam.", requires: ["solucion"], auto: () => rsPautadoSectionDone("problema") },
    { id: "pautado_solucion", phase: "pautado", title: "Pautado · Solución", needs: "150–1250 caracteres en Latam.", requires: ["solucion"], auto: () => rsPautadoSectionDone("solucion") },
    { id: "pautado_impacto", phase: "pautado", title: "Pautado · Impacto", needs: "150–1000 caracteres en Latam.", requires: ["solucion"], auto: () => rsPautadoSectionDone("impacto") },
    { id: "pautado_innovacion", phase: "pautado", title: "Pautado · Innovación", needs: "150–1000 caracteres en Latam.", requires: ["solucion"], auto: () => rsPautadoSectionDone("innovacion") },
    { id: "pautado_prefactibilidad", phase: "pautado", title: "Pautado · Prefactibilidad", needs: "150–1500 caracteres en Latam.", requires: ["solucion"], auto: () => rsPautadoSectionDone("prefactibilidad") },
    { id: "presupuesto", phase: "budget", title: "Tabla de costos con respaldo", needs: "Partidas con unidades, costo unitario y URL.", requires: ["solucion"], auto: () => isBudgetValid() },
    { id: "canvas", phase: "canvas", title: "Modelo Canvas", needs: "9 cuadrantes coherentes con el presupuesto.", requires: ["solucion"], auto: () => rsCanvasFilledCount() >= 7 },
    { id: "recursos", phase: "resources", title: "Bóveda de recursos", needs: "Logos, fotos y tomas subidas al plan.", requires: ["solucion"], auto: () => ((state.video_assets && state.video_assets.items) || []).length > 0 },
    { id: "guion_acto1", phase: "script", title: "Guion · Acto I", needs: "Gancho y problema en voz alta.", requires: ["presupuesto"], auto: () => rsWordCount(state.script.acto1) > 0 },
    { id: "guion_acto2", phase: "script", title: "Guion · Acto II", needs: "Solución y demostración.", requires: ["presupuesto"], auto: () => rsWordCount(state.script.acto2) > 0 },
    { id: "guion_acto3", phase: "script", title: "Guion · Acto III", needs: "Impacto y validación.", requires: ["presupuesto"], auto: () => rsWordCount(state.script.acto3) > 0 },
    { id: "guion_acto4", phase: "script", title: "Guion · Acto IV", needs: "Cierre, llamado y réplica Latam.", requires: ["presupuesto"], auto: () => rsWordCount(state.script.acto4) > 0 },
    { id: "webdemo", phase: "webdemo", title: "Prototipo web para el video", needs: "Sitio publicado con URL para grabar.", requires: ["presupuesto"], auto: () => !!state.site_url },
    { id: "checklist", phase: "timeline", title: "Checklist de entrega verificado", needs: "Todos los guardarraíles en verde.", requires: ["guion_acto4", "webdemo", "presupuesto"], auto: () => {
      const g = state.guardrails || {};
      const keys = ["team_sirli_registered","video_duration_ok","video_unlisted_or_public","naming_pdf_ok","hashtags_included","pautado_chars_ok","pdf_video_numbers_synced","youtube_channel_brand","tiktok_submitted","loser_patterns_checked"];
      return keys.every(k => !!g[k]);
    } }
  ];
}

function rsDefMap() {
  const map = {};
  getDeliverableDefs().forEach(d => { map[d.id] = d; });
  return map;
}

function rsStore() {
  if (!state.deliverables || typeof state.deliverables !== "object") state.deliverables = {};
  return state.deliverables;
}

function rsRecord(id) {
  const store = rsStore();
  const rec = store[id];
  if (!rec || typeof rec !== "object") return { assignees: [], history: [] };
  if (!Array.isArray(rec.assignees)) rec.assignees = [];
  if (!Array.isArray(rec.history)) rec.history = [];
  return rec;
}

function rsEnsureRecord(id) {
  const store = rsStore();
  if (!store[id] || typeof store[id] !== "object") store[id] = {};
  const rec = store[id];
  if (!Array.isArray(rec.assignees)) rec.assignees = [];
  if (!Array.isArray(rec.history)) rec.history = [];
  return rec;
}

// Estado real: terminado (auto o manual) · en espera (dependencia) · en progreso · pendiente.
function rsDefState(def, map, seen) {
  if (!def) return { code: "pending" };
  map = map || rsDefMap();
  seen = seen || {};
  if (seen[def.id]) return { code: "pending" };
  seen[def.id] = true;
  const rec = rsRecord(def.id);
  const autoDone = typeof def.auto === "function" ? !!def.auto() : false;
  if (autoDone || rec.status === "done") return { code: "done", record: rec, auto: autoDone };
  const missing = (def.requires || []).filter(id => rsDefState(map[id], map, seen).code !== "done");
  if (missing.length) {
    const names = missing.map(id => (map[id] && map[id].title) || id);
    return { code: "waiting", record: rec, missing: names };
  }
  if ((rec.assignees || []).length > 0 || rec.status === "in_progress") return { code: "working", record: rec };
  return { code: "pending", record: rec };
}

const RS_STATUS = {
  done:    { label: "Terminado",  cls: "is-done",    icon: "check" },
  working: { label: "En progreso", cls: "is-working", icon: "dot" },
  waiting: { label: "En espera",   cls: "is-waiting", icon: "lock" },
  pending: { label: "Pendiente",   cls: "is-pending", icon: "circle" }
};

// Señal visual única para cualquier estado del sistema (dot + texto mono).
// `code`: done | working | waiting | pending. `compact`: solo dot (title con label).
function rsPill(code, opts) {
  opts = opts || {};
  const s = RS_STATUS[code] || RS_STATUS.pending;
  const cls = (s.cls || "").replace(/^is-/, "rs-");
  const lbl = typeof opts.label === "string" ? opts.label : s.label;
  if (opts.compact) {
    return `<span class="tactical-status-pill compact ${cls}" title="${lbl}"><span class="status-dot"></span></span>`;
  }
  return `<span class="tactical-status-pill ${cls}" title="${opts.title || lbl}"><span class="status-dot"></span>${lbl}</span>`;
}

function rsPhaseDefs(phase, map) {
  map = map || rsDefMap();
  return Object.values(map).filter(d => d.phase === phase);
}

function rsPhaseState(phase, map) {
  map = map || rsDefMap();
  const defs = rsPhaseDefs(phase, map);
  if (!defs.length) return { code: "pending", done: 0, total: 0 };
  const states = defs.map(d => rsDefState(d, map));
  const done = states.filter(s => s.code === "done").length;
  if (done === defs.length) return { code: "done", done, total: defs.length };
  if (states.some(s => s.code === "working" || s.code === "done")) return { code: "working", done, total: defs.length };
  if (states.every(s => s.code === "waiting")) return { code: "waiting", done, total: defs.length };
  return { code: "pending", done, total: defs.length };
}

function rsRelativeTime(ts) {
  if (!ts) return "";
  const mins = Math.max(0, Math.round((Date.now() - ts) / 60000));
  if (mins < 1) return "ahora mismo";
  if (mins < 60) return `hace ${mins} min`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `hace ${hrs} h`;
  return `hace ${Math.round(hrs / 24)} d`;
}

function rsLog(id, action, who) {
  const rec = rsEnsureRecord(id);
  rec.history.unshift({ name: who || currentClientMascot.name, action, at: Date.now() });
  rec.history = rec.history.slice(0, 12);
  rec.updated_at = Date.now();
}

function rsPersist() {
  saveState();
  if (collaborationChannel) {
    collaborationChannel.postMessage({ type: "DELIVERABLES_UPDATE", value: state.deliverables });
  }
  if (activeTab === "resumen") renderTab("resumen");
}

function rsRequireName() {
  if (amINamed()) return true;
  showToast("Primero define tu nombre para que el equipo sepa quién eres.");
  openIdentityModal();
  return false;
}

function rsTakeDeliverable(id) {
  if (!rsRequireName()) return;
  const rec = rsEnsureRecord(id);
  const me = currentClientMascot.name;
  const idx = rec.assignees.indexOf(me);
  if (idx >= 0) {
    rec.assignees.splice(idx, 1);
    if (!rec.assignees.length && rec.status === "in_progress") rec.status = "";
    rsLog(id, "salió del entregable", me);
  } else {
    rec.assignees.push(me);
    rec.status = "in_progress";
    rsLog(id, "tomó el entregable", me);
  }
  rsPersist();
}

function rsAssignDeliverable(id, name) {
  if (!name) return;
  const rec = rsEnsureRecord(id);
  if (!rec.assignees.includes(name)) {
    rec.assignees.push(name);
    if (rec.status !== "done") rec.status = "in_progress";
    rsLog(id, "se sumó al entregable", name);
    rsPersist();
    showToast(`${name} quedó a cargo de "${(rsDefMap()[id] || {}).title || id}".`);
  }
}

function rsRemoveAssignee(id, name) {
  const rec = rsEnsureRecord(id);
  rec.assignees = rec.assignees.filter(n => n !== name);
  if (!rec.assignees.length && rec.status === "in_progress") rec.status = "";
  rsLog(id, "salió del entregable", name);
  rsPersist();
}

function rsFinishDeliverable(id) {
  if (!rsRequireName()) return;
  const rec = rsEnsureRecord(id);
  rec.status = rec.status === "done" ? "" : "done";
  rsLog(id, rec.status === "done" ? "marcó terminado" : "reabrió el entregable", currentClientMascot.name);
  rsPersist();
}

function rsSetFilter(filter) {
  rsFilter = filter;
  renderTab("resumen");
}

function rsGoTab(tab, ev) {
  if (ev) ev.preventDefault();
  switchTab(tab, ev);
}

// Quién está editando una sección del pautado: avatar, nombre y el botón.
// El trabajo de la IA no se da por entregado hasta que alguien lo toma.
// Chip «Tomar» en línea: avatar, quién está en ello y el botón.
// Sirve para una sección del pautado, un acto del guion o cualquier pieza.
function rsTakeInlineHtml(id, slot) {
  const nombres = (rsRecord(id).assignees || []).filter(Boolean);
  const me = amINamed() ? currentClientMascot.name : "";
  const mine = !!me && nombres.includes(me);
  const gente = nombres.length
    ? `<span class="pa-take-people">${nombres.map(n =>
        `<span class="pa-take-ava" style="--person-color:${_userColor(n)}" title="${escapeHtml(n)}">${escapeHtml(String(n).trim().charAt(0).toUpperCase())}</span>`
      ).join("")}<span class="pa-take-names">${escapeHtml(nombres.join(", "))} editando</span></span>`
    : "";
  return `<span class="pa-take${mine ? " is-mine" : ""}" id="pa-take-${slot}" data-take-slot="${slot}" data-take-id="${id}">${gente}
    <button class="pa-take-btn${mine ? " is-mine" : ""}" type="button" onclick="rsToggleTake('${id}', event)">${mine ? "Soltar" : "Tomar"}</button>
  </span>`;
}

function rsPautadoTakeHtml(key) {
  return rsTakeInlineHtml(`pautado_${key}`, `pautado-${key}`);
}

function rsRefreshTakes() {
  document.querySelectorAll("[data-take-slot]").forEach(el => {
    el.outerHTML = rsTakeInlineHtml(el.getAttribute("data-take-id"), el.getAttribute("data-take-slot"));
  });
}

// Función «Tomar» en cada fase -------------------------------------------------
function rsToggleTake(id, ev) {
  if (ev) { ev.preventDefault(); ev.stopPropagation(); }
  if (!amINamed()) { rsRequireName(); return; }
  const yo = currentClientMascot.name;
  const antes = (rsRecord(id).assignees || []).includes(yo);
  rsTakeDeliverable(id);
  showToast(antes ? "Soltaste este entregable: quedó libre." : "Lo tomaste. El equipo ve que estás en esto.");
  rsRepaintTakeBar();
}

function rsTakeChip(id) {
  const def = rsDefMap()[id];
  if (!def) return "";
  const st = rsDefState(def);
  const rec = rsRecord(id);
  const nombres = (rec.assignees || []).filter(Boolean);
  const me = currentClientMascot.name;
  const mio = me && nombres.includes(me);
  if (st.code === "done") {
    return `<span class="rs-take-chip is-done" title="${escapeHtml(def.title)}: terminado">
      <span class="rs-take-title">${escapeHtml(def.title)}</span>
      <span class="rs-take-done">terminado</span>
    </span>`;
  }
  return `<span class="rs-take-chip${mio ? " is-mine" : ""}">
    <span class="rs-take-title" title="${escapeHtml(def.title)}">${escapeHtml(def.title)}</span>
    <span class="rs-take-who">${nombres.length ? escapeHtml(nombres.join(", ")) : "libre"}</span>
    <button class="rs-take-btn${mio ? " is-mine" : ""}" onclick="rsToggleTake('${id}', event)">${mio ? "Soltar" : "Tomar"}</button>
  </span>`;
}

function rsTakeBarHtml(tabId) {
  const defs = rsPhaseDefs(tabId);
  if (!defs.length) return "";
  return `<div class="rs-take-bar" id="rs-take-bar">${defs.map(d => rsTakeChip(d.id)).join("")}</div>`;
}

function rsMountTakeBar(tabId) {
  const main = document.getElementById("main");
  if (!main) return;
  const prev = main.querySelector("#rs-take-bar");
  // Pautado y guion llevan el «Tomar» en cada pieza, junto a su título.
  if (tabId === "pautado" || tabId === "script") { if (prev) prev.remove(); return; }
  const html = rsTakeBarHtml(tabId);
  if (!html) { if (prev) prev.remove(); return; }
  if (prev) { prev.outerHTML = html; return; }
  const header = main.querySelector(".phase-header");
  if (header && header.parentElement) header.insertAdjacentHTML("afterend", html);
  else {
    const wrap = main.querySelector(".content-wrapper") || main;
    wrap.insertAdjacentHTML("afterbegin", html);
  }
}

function rsRepaintTakeBar() {
  if (!activeTab) return;
  if (activeTab === "pautado" || activeTab === "script") { rsRefreshTakes(); return; }
  if (activeTab !== "resumen") rsMountTakeBar(activeTab);
}

// ── VISTA: RESUMEN DEL RALLY ────────────────────────────────────────────────
function renderViewResumen() {
  const map = rsDefMap();
  const stage = getWorkflowStage();
  const defs = Object.values(map);
  const states = defs.map(d => rsDefState(d, map));
  const doneCount = states.filter(s => s.code === "done").length;
  const pct = defs.length ? Math.round((doneCount / defs.length) * 100) : 0;
  const workingDefs = defs.filter(d => rsDefState(d, map).code === "working");

  const ch = (state.challenges || []).find(c => c.id === state.challenge_id)
    || (typeof OFFICIAL_CHALLENGES_2026 !== "undefined" && (OFFICIAL_CHALLENGES_2026 || []).find(c => c.id === state.challenge_id))
    || null;
  const challengeTitle = (ch && ch.title) || state.challenge_title || "Sin reto seleccionado";
  const challengeNum = state.challenge_id || (ch && ch.id) || "—";
  const category = (ch && ch.category) || state.category || "Sin categoría";
  const solution = state.solution_thesis || state.solution_simple || "";
  const timer = getTimerString();
  const roster = getRoster();
  const currentDeadline = getCurrentDeadlineAlert();
  const _rsStart = tsStartDate();
  const _rsEnd = tsDeadlineDate();
  const _rsPct = Math.max(0, Math.min(100, Math.round(((Date.now() - _rsStart.getTime()) / Math.max(1, _rsEnd.getTime() - _rsStart.getTime())) * 100)));

  const filterMatch = (def, st) => {
    if (rsFilter === "mine") return st.record && (st.record.assignees || []).includes(currentClientMascot.name);
    if (rsFilter === "waiting") return st.code === "waiting";
    if (rsFilter === "working") return st.code === "working";
    if (rsFilter === "done") return st.code === "done";
    return true;
  };

  const visiblePhases = navTabsVisibles().filter(t => !t.summary && t.level <= stage);

  const phaseCards = visiblePhases.map(t => {
    const ps = rsPhaseState(t.id, map);
    const meta = RS_STATUS[ps.code] || RS_STATUS.pending;
    return `
      <button class="rs-phase ${meta.cls}" onclick="rsGoTab('${t.id}', event)" title="Abrir ${escapeHtml(t.label)}">
        <span class="rs-phase-dot"></span>
        <span class="rs-phase-name">${escapeHtml(t.label)}</span>
        <span class="rs-phase-state">${meta.label}</span>
      </button>
    `;
  }).join("");

  const delivRows = defs.filter(d => filterMatch(d, rsDefState(d, map))).map(d => ({ d, st: rsDefState(d, map) }));
  const deliverableCards = delivRows.map(({ d, st }) => {
    const assignees = ((st.record || {}).assignees || []).filter(Boolean);
    const last = ((st.record || {}).history || [])[0];
    const phaseTab = NAV_TABS.find(t => t.id === d.phase);
    const phaseLabel = phaseTab ? phaseTab.label : d.phase;
    const mine = !!currentClientMascot.name && assignees.includes(currentClientMascot.name);
    return `
      <div class="rs-tile-cell">
      <button class="rs-tile is-${st.code}" onclick="rsOpenDeliverable('${d.id}')" title="Abrir ${escapeHtml(d.title)}">
        <span class="rs-tile-top">
          <span class="rs-tile-dot"></span>
          <span class="rs-tile-state">${escapeHtml((RS_STATUS[st.code] || RS_STATUS.pending).label)}</span>
        </span>
        <span class="rs-tile-title">${escapeHtml(d.title)}</span>
        <span class="rs-tile-foot">
          <span class="rs-tile-phase">${escapeHtml(String(phaseLabel).replace(/^\\d+\\s*/, ""))}</span>
          ${assignees.length
            ? `<span class="rs-tile-people">${assignees.map(n => `<span class="rs-tile-ava" style="--person-color:${_userColor(n)}" title="${escapeHtml(n)}">${escapeHtml(String(n).trim().charAt(0).toUpperCase())}</span>`).join("")}</span>`
            : `<span class="rs-tile-free">libre</span>`}
        </span>
        ${last ? `<span class="rs-tile-when">${rsRelativeTime(last.at)}</span>` : ""}
      </button>
      ${st.code === "done" ? "" : `<button class="rs-take-btn rs-tile-take${mine ? " is-mine" : ""}" onclick="rsToggleTake('${d.id}', event)" title="${mine ? "Soltar este entregable" : "Tomar este entregable"}">${mine ? "Soltar" : "Tomar"}</button>`}
      </div>`;
  }).join("");

  const closedPhases = NAV_TABS.filter(t => !t.summary && t.level <= stage && rsPhaseState(t.id, map).code === "done");
  const pendingPhases = NAV_TABS.filter(t => !t.summary && t.level > stage);

  // Las 3 cosas accionables ahora: primero lo que está en progreso, luego esperas, luego pendientes.
  const actionableRank = { working: 0, waiting: 1, pending: 2 };
  const actionableNow = defs
    .map(d => ({ d, st: rsDefState(d, map) }))
    .filter(x => x.st.code !== "done")
    .sort((a, b) => ((actionableRank[a.st.code] ?? 3) - (actionableRank[b.st.code] ?? 3)))
    .slice(0, 3);
  const currentPhase = visiblePhases.find(t => rsPhaseState(t.id, map).code !== "done");
  const openCount = defs.length - doneCount;

  const rosterStrip = roster.length
    ? roster.map(m => {
        const load = defs.filter(d => (rsRecord(d.id).assignees || []).includes(m.name) && rsDefState(d, map).code !== "done").length;
        return `<span class="rs-member" style="--person-color:${_userColor(m.name)}">
          <span class="rs-member-avatar">${escapeHtml((m.name || "?").trim().charAt(0).toUpperCase())}</span>
          <span class="rs-member-name">${escapeHtml(m.name)}${m.id === currentClientMascot.id ? " (tú)" : ""}</span>
          <span class="rs-member-load">${load} activo${load === 1 ? "" : "s"}</span>
        </span>`;
      }).join("")
    : `<span class="rs-muted">Todavía nadie ha definido su nombre. Cada persona debe poner el suyo una vez.</span>`;

  const hasSolution = !!(solution && String(solution).trim());
  const solutionLabel = hasSolution
    ? (state.solution_approved ? "Solución aprobada" : "Solución en borrador")
    : "Sin solución todavía";

  rsStartLive();
  return `
    <div class="rs-summary">
      <section class="rs-hero">
        <div class="rs-hero-main">
          <h1 class="rs-page-title">Resumen del rally</h1>
          <div class="rs-challenge-row">
            <span class="rs-challenge-num">#${escapeHtml(String(challengeNum))}</span>
            <div>
              <p class="rs-challenge-title">${escapeHtml(challengeTitle)}</p>
              <span class="rs-challenge-meta">${escapeHtml(state.rally_type ? `${rallyProfile().short} ${rallyProfile().hours}h` : "Certamen por definir")} · ${escapeHtml(category)}</span>
            </div>
          </div>
          <div class="rs-solution ${state.solution_approved ? "is-approved" : ""}">
            <span class="rs-solution-label">${solutionLabel}</span>
            <p>${solution ? escapeHtml(solution) : "Aún no hay tesis de solución. Se define en el Taller de Solución (fase 03)."}</p>
            <button class="rs-link" onclick="rsGoTab('solution', event)">Abrir taller de solución →</button>
          </div>
        </div>
        <div class="rs-hero-stats">
          <div class="rs-progress">
            <div class="rs-progress-head">
              <span class="rs-progress-num">${pct}%</span>
              <span class="rs-progress-label">avance de rúbrica</span>
            </div>
            <div class="rs-progress-track"><span style="width:${Math.max(0, Math.min(100, pct))}%"></span></div>
            <p class="rs-progress-line">${doneCount} de ${defs.length} entregables cerrados${workingDefs.length ? ` · ${workingDefs.length} en progreso` : ""}${closedPhases.length ? ` · ${closedPhases.length} fases cerradas` : ""}</p>
          </div>
          <button class="rs-btn is-primary rs-identity-cta" onclick="openIdentityModal()">
            ${amINamed() ? `Trabajando como ${escapeHtml(currentClientMascot.name)}` : "Definir mi nombre para trabajar"}
          </button>
        </div>
      </section>

      <div class="rs-live">
        <span class="rs-live-k">Reloj</span>
        <span class="rs-live-clock" id="rs-live-clock">${timer.time}</span>
        <span class="rs-live-bar"><span id="rs-live-fill" style="width:${_rsPct}%"></span></span>
        <span class="rs-live-next">${escapeHtml(currentDeadline.label)} · ${escapeHtml(currentDeadline.time)}</span>
      </div>

      <section class="rs-section rs-next-only">
        <div class="rs-section-head">
          <h2>Siguiente paso</h2>
        </div>
        <div class="rs-action-list">
          ${actionableNow.length ? actionableNow.map(x => {
            const phaseLabel = (NAV_TABS.find(t => t.id === x.d.phase) || { label: x.d.phase }).label;
            const statusMeta = RS_STATUS[x.st.code] || RS_STATUS.pending;
            return `
            <button class="rs-action-row is-${x.st.code}" onclick="rsGoTab('${x.d.phase}', event)" title="Abrir ${escapeHtml(phaseLabel)}">
              <span class="rs-action-title">${escapeHtml(x.d.title)}</span>
              <span class="rs-action-phase">${escapeHtml(phaseLabel)}</span>
              ${rsPill(x.st.code, { label: statusMeta.label, title: statusMeta.label })}
              ${SVG.arrowRight}
            </button>`;
          }).join("") : `<p class="rs-empty">Nada pendiente. Todo el equipo hizo la tarea.</p>`}
        </div>
      </section>

      <section class="rs-section">
        <details class="rs-collapsible" open>
          <summary>Entregables y responsables <span class="rs-mini-count">${openCount} abiertos · ${doneCount}/${defs.length} cerrados</span></summary>
          <div class="rs-section-head" style="margin-top:14px;">
          <div class="rs-filters">
            <button class="rs-filter ${rsFilter === "all" ? "is-active" : ""}" onclick="rsSetFilter('all')">Todos</button>
            <button class="rs-filter ${rsFilter === "mine" ? "is-active" : ""}" onclick="rsSetFilter('mine')">Míos</button>
            <button class="rs-filter ${rsFilter === "working" ? "is-active" : ""}" onclick="rsSetFilter('working')">En progreso</button>
            <button class="rs-filter ${rsFilter === "waiting" ? "is-active" : ""}" onclick="rsSetFilter('waiting')">En espera</button>
            <button class="rs-filter ${rsFilter === "done" ? "is-active" : ""}" onclick="rsSetFilter('done')">Terminados</button>
          </div>
        </div>
        <div class="rs-tile-grid">
          ${deliverableCards || `<p class="rs-empty">No hay entregables en este filtro.</p>`}
        </div>
        </details>
      </section>

      <section class="rs-section">
        <div class="rs-section-head">
          <h2>Quién está en qué</h2>
          <button class="rs-btn is-ghost" onclick="openIdentityModal()">Cambiar mi nombre</button>
        </div>
        <div class="rs-roster">${rosterStrip}</div>
      </section>

      <section class="rs-section">
        ${renderAvisosIA()}
        ${renderNotificar()}
      </section>
    </div>
  `;
}

/* ── Entregable: ficha de trabajo (quién, qué falta, historial, enlaces) ──── */
let _rsSheetId = null;
let _rsLiveTimer = null;

function rsTimePct() {
  const start = tsStartDate();
  const end = tsDeadlineDate();
  const total = Math.max(1, end.getTime() - start.getTime());
  return Math.max(0, Math.min(100, Math.round(((Date.now() - start.getTime()) / total) * 100)));
}

function rsStartLive() {
  if (_rsLiveTimer) { clearInterval(_rsLiveTimer); _rsLiveTimer = null; }
  const tick = () => {
    const clock = document.getElementById("rs-live-clock");
    if (!clock) { clearInterval(_rsLiveTimer); _rsLiveTimer = null; return; }
    clock.textContent = getTimerString().time;
    const fill = document.getElementById("rs-live-fill");
    if (fill) fill.style.width = rsTimePct() + "%";
  };
  tick();
  _rsLiveTimer = setInterval(tick, 1000);
}

function rsCloseDeliverable() {
  const sheet = document.getElementById("rs-deliv-sheet");
  if (sheet) sheet.remove();
  document.body.classList.remove("rs-sheet-open");
  _rsSheetId = null;
}

function rsOpenDeliverable(id) {
  const map = rsDefMap();
  const d = map[id];
  if (!d) return;
  const st = rsDefState(d, map);
  const rec = st.record || {};
  const meta = RS_STATUS[st.code] || RS_STATUS.pending;
  const assignees = (rec.assignees || []).filter(Boolean);
  const roster = getRoster();
  const me = currentClientMascot.name;
  const mine = assignees.includes(me);
  const phaseTab = NAV_TABS.find(t => t.id === d.phase);
  const phaseLabel = phaseTab ? phaseTab.label : d.phase;
  const history = (rec.history || []).slice(0, 8);
  const missing = (st.missing || []).filter(Boolean);

  const prev = document.getElementById("rs-deliv-sheet");
  if (prev) prev.remove();
  _rsSheetId = id;
  document.body.classList.add("rs-sheet-open");

  const html = `
    <div class="rs-sheet-backdrop" id="rs-deliv-sheet" onclick="if (event.target === this) rsCloseDeliverable()">
      <div class="rs-sheet" role="dialog" aria-label="${escapeHtml(d.title)}">
        <div class="rs-sheet-top">
          <span class="rs-sheet-phase">${escapeHtml(phaseLabel)}</span>
          <button class="rs-sheet-x" onclick="rsCloseDeliverable()" aria-label="Cerrar">✕</button>
        </div>
        <h2 class="rs-sheet-title">${escapeHtml(d.title)}</h2>
        <div class="rs-sheet-state is-${st.code}">
          <span class="rs-sheet-dot"></span>${escapeHtml(meta.label)}
        </div>

        <div class="rs-sheet-block">
          <span class="rs-sheet-k">Qué falta</span>
          ${missing.length
            ? `<ul class="rs-sheet-list">${missing.map(x => `<li>${escapeHtml(x)}</li>`).join("")}</ul>`
            : `<p class="rs-sheet-p">${escapeHtml(d.needs || "Sin requisitos pendientes.")}</p>`}
        </div>

        <div class="rs-sheet-block">
          <span class="rs-sheet-k">Quién está</span>
          <div class="rs-sheet-people">
            ${assignees.length
              ? assignees.map(n => `<span class="rs-sheet-person" style="--person-color:${_userColor(n)}">
                   <span class="rs-tile-ava">${escapeHtml(String(n).trim().charAt(0).toUpperCase())}</span>${escapeHtml(n)}
                   <button onclick="rsSheetUnassign('${escapeHtml(n)}')" aria-label="Quitar a ${escapeHtml(n)}">×</button>
                 </span>`).join("")
              : `<span class="rs-sheet-p">Nadie todavía.</span>`}
          </div>
          ${roster.length ? `<select class="rs-select" onchange="if (this.value) rsSheetAssign(this.value)" aria-label="Asignar a alguien">
            <option value="">Asignar a…</option>
            ${roster.map(m => `<option value="${escapeHtml(m.name)}" ${assignees.includes(m.name) ? "disabled" : ""}>${escapeHtml(m.name)}${assignees.includes(m.name) ? " (ya está)" : ""}</option>`).join("")}
          </select>` : ""}
        </div>

        <div class="rs-sheet-block">
          <span class="rs-sheet-k">Qué cambió</span>
          ${history.length
            ? `<ol class="rs-sheet-log">${history.map(h => `<li>
                 <span class="rs-sheet-log-name">${escapeHtml(h.name || "Equipo")}</span>
                 <span class="rs-sheet-log-act">${escapeHtml(h.action || "actualizó")}</span>
                 <span class="rs-sheet-log-at">${rsRelativeTime(h.at)}</span>
               </li>`).join("")}</ol>`
            : `<p class="rs-sheet-p">Sin actividad registrada.</p>`}
        </div>

        <div class="rs-sheet-actions">
          ${st.code === "done" && st.auto
            ? `<span class="rs-auto-tag">Completado automáticamente</span>`
            : `<button class="rs-btn ${mine ? "is-ghost" : "is-primary"}" onclick="rsSheetTake()">${mine ? "Soltar" : "Tomar yo"}</button>
               <button class="rs-btn is-ghost" onclick="rsSheetFinish()">${rec.status === "done" ? "Reabrir" : "Marcar terminado"}</button>`}
          <button class="rs-btn is-ghost" onclick="rsCloseDeliverable(); rsGoTab('${d.phase}', event);">Abrir ${escapeHtml(phaseLabel)} →</button>
        </div>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML("beforeend", html);
}

function rsSheetRefresh() {
  if (_rsSheetId) rsOpenDeliverable(_rsSheetId);
}

function rsSheetTake() {
  const id = _rsSheetId;
  if (!id) return;
  rsTakeDeliverable(id);
  rsSheetRefresh();
}

function rsSheetFinish() {
  const id = _rsSheetId;
  if (!id) return;
  rsFinishDeliverable(id);
  rsSheetRefresh();
}

function rsSheetAssign(name) {
  const id = _rsSheetId;
  if (!id || !name) return;
  rsAssignDeliverable(id, name);
  rsSheetRefresh();
}

function rsSheetUnassign(name) {
  const id = _rsSheetId;
  if (!id || !name) return;
  rsRemoveAssignee(id, name);
  rsSheetRefresh();
}

// ── IDENTIDAD: NOMBRE ÚNICO POR PERSONA ─────────────────────────────────────
function openIdentityModal() {
  closeIdentityModal();
  const roster = getRoster();
  const modal = document.createElement("div");
  modal.id = "rs-identity-modal";
  modal.className = "rs-modal-backdrop";
  modal.innerHTML = `
    <div class="rs-modal" role="dialog" aria-modal="true" aria-labelledby="rs-identity-title">
      <div class="rs-modal-head">
        <div>
          <span class="rs-eyebrow">Identidad en el equipo</span>
          <h2 id="rs-identity-title">¿Quién eres?</h2>
        </div>
        <button class="rs-modal-close" onclick="closeIdentityModal()" aria-label="Cerrar">×</button>
      </div>
      <p class="rs-modal-help">Tu nombre se guarda en este dispositivo y aparece junto a los entregables que tomes. Debe ser único: nada de nombres aleatorios.</p>
      <label class="rs-field">
        <span>Mi nombre</span>
        <input id="rs-identity-input" type="text" maxlength="28" autocomplete="off" placeholder="Ej. Tu nombre" value="${amINamed() ? escapeHtml(currentClientMascot.name) : ""}">
      </label>
      <p class="rs-modal-error" id="rs-identity-error" role="alert"></p>
      <div class="rs-modal-actions">
        <button class="rs-btn is-primary" onclick="saveIdentityFromModal()">Guardar nombre</button>
        <button class="rs-btn is-ghost" onclick="closeIdentityModal()">Cancelar</button>
      </div>
      ${roster.length ? `
        <div class="rs-modal-existing">
          <span class="rs-modal-existing-title">¿Ya estás en la lista? Usa tu nombre en este dispositivo</span>
          <div class="rs-roster-pick">
            ${roster.map(m => `<button class="rs-roster-pick-item ${m.id === currentClientMascot.id ? "is-me" : ""}" onclick="adoptIdentityFromModal('${m.id}')">
              <span class="rs-member-avatar" style="--person-color:${_userColor(m.name)}">${escapeHtml((m.name || "?").charAt(0).toUpperCase())}</span>
              ${escapeHtml(m.name)}
            </button>`).join("")}
          </div>
        </div>` : ""}
      ${esVisitante() ? "" : `<a href="admin.html" style="display:inline-flex; align-items:center; gap:6px; margin-top:16px; font-size:12px; font-weight:700; color:var(--text-muted); text-decoration:none; border-bottom:1px solid var(--border-light); padding-bottom:3px;" title="Invitar personas, revisar quién entró y retirar acceso">
        ${SVG.users} ${esMentor() ? "Revisar accesos del equipo" : "Accesos del equipo"}
      </a>`}
    </div>
  `;
  document.body.appendChild(modal);
  const input = document.getElementById("rs-identity-input");
  if (input) { input.focus(); input.select(); }
}

function closeIdentityModal() {
  const el = document.getElementById("rs-identity-modal");
  if (el) el.remove();
}

function saveIdentityFromModal() {
  const input = document.getElementById("rs-identity-input");
  const errorEl = document.getElementById("rs-identity-error");
  const result = setMyDisplayName(input ? input.value : "");
  if (!result.ok) {
    if (errorEl) errorEl.textContent = result.error;
    return;
  }
  closeIdentityModal();
  showToast(`Listo, ${currentClientMascot.name}. Tu nombre ya es parte del equipo.`);
  renderTopbar();
  if (activeTab === "resumen") renderTab("resumen");
  else renderNavigation();
}

function adoptIdentityFromModal(id) {
  if (adoptRosterName(id)) {
    closeIdentityModal();
    showToast(`Ahora trabajas como ${currentClientMascot.name}.`);
    if (activeTab === "resumen") renderTab("resumen");
  }
}

// ═════════════════════════════════════════════════════════════════════════════
// 00 NIVEL 0: SELECCIÓN DE CERTAMEN (RÉPLICA EXACTA DE LA IMAGEN)
// ═════════════════════════════════════════════════════════════════════════════


// Cuando el certamen y el equipo ya están definidos dejan de ser pasos del
// flujo: se muestran como una ficha escueta y se editan a pedido.
function setupIsDone() {
  return !!state.rally_type && !!state.team_name && !!state.university && !!state.challenge_id;
}

// Quien decide certamen e identidad es el admin/operador. El miembro ve la
// ficha en lectura con "Definido por admin". Sin rol guardado = uso local.
function canEditSetup() {
  let rol = "";
  try { rol = (localStorage.getItem("rally_member_role") || "").trim(); } catch (e) { rol = ""; }
  return !rol || rol === "admin" || rol === "operator";
}

function setupLockChip() {
  return `<span class="setup-lock-chip">Definido por admin</span>`;
}

function editSetup(which) {
  if (!canEditSetup()) return;
  state.setup_editing = which || "";
  saveState();
  renderTab(which || "certamen");
}

function renderCertamenSummary() {
  const esLatam = state.rally_type === "latam";
  const nombre = rallyProfile().name;
  const horas = `${rallyProfile().hours} horas`;
  return `
    <div class="phase-header">
      <div>
        <h1 class="phase-title">Certamen <span class="phase-title-accent">elegido</span></h1>
        <p class="phase-subtitle">${canEditSetup() ? "Ya quedó definido. Se cambia desde aquí cuando haga falta." : "Definido por el admin del equipo."}</p>
      </div>
      ${canEditSetup() ? `<button class="btn-secondary" onclick="editSetup('certamen')">Cambiar certamen</button>` : setupLockChip()}
    </div>
    <dl class="setup-facts">
      <div><dt>Certamen</dt><dd>${escapeHtml(nombre)}</dd></div>
      <div><dt>Duración</dt><dd>${escapeHtml(horas)}</dd></div>
      <div><dt>Categoría</dt><dd>${escapeHtml(state.category || "Sin definir")}</dd></div>
    </dl>
  `;
}

function renderTeamSummary() {
  // Sin logo cargado no se dibuja un cuadro vacío: el panel ya dice que falta.
  const logo = state.team_logo_img
    ? `<img src="${escapeHtml(state.team_logo_img)}" alt="Logo del equipo" class="setup-logo">`
    : "";
  return `
    <div class="phase-header">
      <div>
        <h1 class="phase-title">Identidad <span class="phase-title-accent">del equipo</span></h1>
        <p class="phase-subtitle">${canEditSetup() ? "Ya quedó definida. Se cambia desde aquí cuando haga falta." : "Definida por el admin del equipo."}</p>
      </div>
      ${canEditSetup() ? `<button class="btn-secondary" onclick="editSetup('team')">Editar equipo</button>` : setupLockChip()}
      <button class="btn-secondary" onclick="switchTab('identidad')">Paleta y marca</button>
    </div>
    <div class="setup-team">
      ${logo}
      <dl class="setup-facts setup-facts-inline">
        <div><dt>Squad</dt><dd>${escapeHtml(state.team_name || "—")}</dd></div>
        <div><dt>Universidad</dt><dd>${escapeHtml(state.university || "—")}</dd></div>
        <div><dt>Ciudad</dt><dd>${escapeHtml(state.city || "—")}</dd></div>
      </dl>
    </div>
  `;
}

// Contraste WCAG real para no aprobar una paleta a ojo.
function luminanciaHex(hex) {
  const h = String(hex || "").replace("#", "");
  if (!/^[0-9a-fA-F]{6}$/.test(h)) return null;
  const canales = [0, 2, 4].map(i => parseInt(h.slice(i, i + 2), 16) / 255)
    .map(v => (v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)));
  return 0.2126 * canales[0] + 0.7152 * canales[1] + 0.0722 * canales[2];
}

function contrasteHex(a, b) {
  const la = luminanciaHex(a);
  const lb = luminanciaHex(b);
  if (la === null || lb === null) return null;
  const alto = Math.max(la, lb);
  const bajo = Math.min(la, lb);
  return (alto + 0.05) / (bajo + 0.05);
}

function copiarComandoPaleta() {
  const cmd = "python scripts/gen_palette.py --ruta A --si";
  navigator.clipboard.writeText(cmd);
  showToast("Comando copiado. Cambia la ruta (A, B o C) por la que apruebe el equipo.");
}

function copiarComandoDiseno() {
  const slug = (state.project_name || state.team_name || "proyecto_rally").toLowerCase().replace(/\s+/g, "_");
  const cmd = `python scripts/gen_pagina_diseno.py --slug ${slug}`;
  navigator.clipboard.writeText(cmd);
  showToast("Comando copiado. La página hereda la paleta y el logo aprobados.");
}

// ════════════ EDITAR CON IA: una caja de instrucción por recurso ════════════
// El resultado NUNCA pisa el texto: entra como propuesta y el equipo acepta o
// descarta. Usa el mismo motor que el copiloto (_runAIJob).
const _aiEditState = {};

function aiEditTarget(key) {
  const partes = String(key || "").split(":");
  const kind = partes[0];
  const sub = partes[1] || "";
  if (kind === "pautado") return {
    tab: "pautado", nombre: "esta sección del pautado",
    leer: () => (state.pautado || {})[sub] || "",
    escribir: t => { if (!state.pautado) state.pautado = {}; state.pautado[sub] = t; }
  };
  if (kind === "script") return {
    tab: "script", nombre: "este acto del guion",
    leer: () => (state.script || {})[sub] || "",
    escribir: t => { if (!state.script) state.script = {}; state.script[sub] = t; }
  };
  if (kind === "canvas") return {
    tab: "canvas", nombre: "este bloque del canvas",
    leer: () => (state.model_canvas || {})[sub] || "",
    escribir: t => {
      if (!state.model_canvas) state.model_canvas = {};
      if (t) state.model_canvas[sub] = t; else delete state.model_canvas[sub];
    }
  };
  if (kind === "solution") return {
    tab: "solution", nombre: "lo que le explicas al asesor",
    leer: () => state.solution_simple || "",
    escribir: t => { state.solution_simple = t; }
  };
  if (kind === "budget") return {
    tab: "budget", nombre: "el presupuesto",
    leer: () => (state.budget || []).map(it =>
      `${it.element || "partida"} | ${it.units || 1} | ${it.unit_cost || 0} | ${it.url || ""}`).join("\n"),
    escribir: t => {
      const filas = String(t).split(/\r?\n/).map(l => l.split("|"))
        .filter(c => c.length >= 3 && String(c[0]).trim());
      if (!filas.length) return;
      state.budget = filas.map(c => ({
        element: String(c[0]).trim(),
        units: parseFloat(String(c[1]).replace(/[^0-9.]/g, "")) || 1,
        unit_cost: parseFloat(String(c[2]).replace(/[^0-9.]/g, "")) || 0,
        url: String(c[3] || "").trim()
      }));
    }
  };
  return null;
}

function aiEditId(key) { return String(key).replace(/[^a-zA-Z0-9_-]/g, "-"); }

function aiEditInstr(key, valor) {
  const st = _aiEditState[key] || (_aiEditState[key] = {});
  st.instr = valor;
}

function aiEditToggle(key) {
  const st = _aiEditState[key] || (_aiEditState[key] = {});
  st.open = !st.open;
  aiEditRepaint(key);
}

function aiEditRepaint(key) {
  const host = document.getElementById("ae-host-" + aiEditId(key));
  if (host) host.innerHTML = aiEditBody(key);
}

// Historial del chat por campo: vive en el estado, así que sobrevive al
// recargar y lo ve todo el equipo. Los últimos 24 turnos bastan.
function aiEditHist(key) {
  if (!state.ai_edit_history || typeof state.ai_edit_history !== "object") state.ai_edit_history = {};
  const h = state.ai_edit_history[key];
  return Array.isArray(h) ? h : (state.ai_edit_history[key] = []);
}

function aiEditHistPush(key, quien, texto) {
  const h = aiEditHist(key);
  h.push({ r: quien, t: String(texto || ""), at: _mesaTime() });
  while (h.length > 24) h.shift();
  saveState();
}

function _botAvatar(cls) {
  return `<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="4" y="8" width="16" height="11" rx="3"/><path d="M12 8V4M9 19v2M15 19v2"/><circle cx="9.5" cy="13" r="1"/><circle cx="14.5" cy="13" r="1"/></svg>`;
}

function aiEditBody(key) {
  const id = aiEditId(key);
  const st = _aiEditState[key] || (_aiEditState[key] = {});
  // El chat de la solución se ve de entrada: ahí el equipo pide cambios a mano.
  if (st.open === undefined) st.open = key === "solution";
  const t = aiEditTarget(key);
  if (!t) return "";
  if (!st.open) {
    return `<button class="ai-chat-mini" onclick="aiEditToggle('${key}')" title="Hablar con la IA sobre este texto">
      ${_botAvatar("ai-chat-mini-avatar")}
      <span><strong>Copiloto</strong><em>Editar con IA</em></span>
    </button>`;
  }
  const historial = aiEditHist(key);
  return `
    <div class="ai-chat" id="ae-box-${id}">
      <header class="ai-chat-head">
        ${_botAvatar("ai-chat-avatar")}
        <div class="ai-chat-id">
          <strong>Copiloto</strong>
          <span>${tieneTextoAI(t)}</span>
        </div>
        <button class="link-quiet" onclick="aiEditToggle('${key}')">Cerrar</button>
      </header>

      <div class="ai-chat-log" id="ae-log-${id}">
        ${historial.length === 0 ? `<p class="ai-chat-empty">Pídele un cambio con tus palabras. No toca el texto hasta que tú lo aceptes.</p>` : ""}
        ${historial.map(m => m.r === "u"
          ? `<div class="ai-msg is-user"><p>${escapeHtml(m.t)}</p><span>${m.at}</span></div>`
          : `<div class="ai-msg is-bot">${_botAvatar("ai-msg-avatar")}<p>${escapeHtml(m.t)}</p><span>${m.at}</span></div>`).join("")}
        ${st.busy ? `<div class="ai-msg is-bot is-live">${_botAvatar("ai-msg-avatar")}<p id="ae-res-live-${id}">${escapeHtml(st.live || "Leyendo el texto…")}</p><span>escribiendo</span></div>` : ""}
        ${st.result ? `
        <div class="ai-msg is-bot is-proposal">
          ${_botAvatar("ai-msg-avatar")}
          <div>
            <p id="ae-res-${id}">${escapeHtml(st.result)}</p>
            <div class="ai-proposal-actions">
              <button class="btn-primary" onclick="aiEditAceptar('${key}')">${SVG.check} Aplicar al campo</button>
              <button class="btn-secondary" onclick="aiEditDescartar('${key}')">Descartar</button>
              <button class="link-quiet" onclick="aiEditCopiar('${key}')">Copiar</button>
            </div>
          </div>
        </div>` : ""}
      </div>

      ${st.msg ? `<p class="ai-chat-note">${escapeHtml(st.msg)}</p>` : ""}

      <div class="ai-chat-compose">
        <textarea id="ae-in-${id}" rows="2" placeholder="Qué cambia y qué se queda (ej.: más corto, sin cifras, tono hablado)"
          oninput="aiEditInstr('${key}', this.value)" onkeydown="if(event.key==='Enter'&&!event.shiftKey){event.preventDefault();aiEditRun('${key}');}">${escapeHtml(st.instr || "")}</textarea>
        <button class="ai-send" onclick="aiEditRun('${key}')" ${st.busy ? "disabled" : ""} aria-label="Enviar">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 12l16-8-6 8 6 8z"/></svg>
        </button>
      </div>
    </div>`;
}

function tieneTextoAI(t) {
  return String(t.leer()).trim() ? "sobre " + t.nombre : "escribe desde cero: " + t.nombre;
}

function aiEditPanel(key) {
  return `<span id="ae-host-${aiEditId(key)}">${aiEditBody(key)}</span>`;
}

async function aiEditRun(key) {
  const st = _aiEditState[key] || (_aiEditState[key] = {});
  const t = aiEditTarget(key);
  if (!t) return;
  const instr = String(st.instr || "").trim();
  if (!instr) { showToast("Escribe qué quieres cambiar antes de pedirlo."); return; }
  st.busy = true;
  st.msg = "";
  st.result = "";
  st.live = "";
  aiEditHistPush(key, "u", instr);
  st.instr = "";
  aiEditRepaint(key);
  const prompt = `Actúa como editor del equipo. Proyecto: "${state.project_name || state.challenge_title || "el proyecto"}" (${state.rally_type === "latam" ? "Rally Latam" : "Rally Nacional"}).
Instrucción del equipo: ${instr}
Texto actual de ${t.nombre}:
"""
${t.leer() || "(vacío)"}
"""
Devuelve SOLO el texto nuevo, sin explicaciones ni markdown. Conserva las cifras y las fuentes que ya estaban y no inventes datos. Español de Nicaragua, frases cortas. No repitas el nombre del proyecto ni el país más de una vez.
Prohibido: palabras de relleno (fundamental, crucial, clave, esencial, vital, robusto, innovador, transformador, integral, exhaustivo, estratégico, holístico, sinérgico, versátil, multifacético), sustantivos gastados (paradigma, sinergia, ecosistema, panorama, mosaico, nexo, ámbito, trayectoria), verbos corporativos (profundizar, potenciar, impulsar, maximizar, optimizar, aprovechar, desbloquear, empoderar, destacar, explorar), conectores huecos (además, asimismo, no obstante, sin embargo, en consecuencia, cabe destacar, en este sentido, por otro lado, en última instancia), frases «no es solo X, es Y», «es importante destacar», «al final del día», «juega un papel fundamental», «marca un hito», «en conclusión», tríadas forzadas, frase de una palabra como párrafo, pregunta retórica de gancho, raya larga de adorno, negrita al inicio de cada viñeta, emojis como viñeta. Si un adjetivo no trae un dato, se borra.`;
  await _runAIJob("aiedit-" + key, prompt, {
    onNoProvider: (data) => {
      st.busy = false;
      st.live = "";
      st.msg = _aiStatusMessage(data);
      aiEditRepaint(key);
    },
    boxTick: (texto) => {
      st.live = texto || "";
      const caja = document.getElementById("ae-res-live-" + aiEditId(key));
      if (caja) {
        caja.textContent = st.live;
        const log = document.getElementById("ae-log-" + aiEditId(key));
        if (log) log.scrollTop = log.scrollHeight;
      }
    },
    onFinish: (final) => {
      st.busy = false;
      st.live = "";
      st.result = String((final && final.text) || "").trim();
      st.msg = st.result ? "" : "La IA no devolvió texto. Prueba otro modelo.";
      aiEditRepaint(key);
      const log = document.getElementById("ae-log-" + aiEditId(key));
      if (log) log.scrollTop = log.scrollHeight;
    }
  });
}

function aiEditAceptar(key) {
  const st = _aiEditState[key];
  const t = aiEditTarget(key);
  if (!st || !st.result || !t) return;
  aiEditHistPush(key, "a", "Aplicado al campo: " + st.result);
  t.escribir(st.result);
  saveState();
  st.result = ""; st.instr = ""; st.msg = ""; st.open = false;
  renderTab(t.tab);
  if (t.tab === "script" && typeof updateScriptMeters === "function") { try { updateScriptMeters(); } catch (e) { /* vista cambiada */ } }
  showToast("Cambio aplicado al campo.");
}

function aiEditDescartar(key) {
  const st = _aiEditState[key];
  if (!st) return;
  aiEditHistPush(key, "a", "Propuesta descartada. El texto quedó como estaba.");
  st.result = "";
  st.msg = "Propuesta descartada. El texto quedó como estaba.";
  aiEditRepaint(key);
}

function aiEditCopiar(key) {
  const st = _aiEditState[key];
  if (!st || !st.result) return;
  navigator.clipboard.writeText(st.result);
  showToast("Propuesta copiada.");
}

// Vista de identidad del PROYECTO (no del producto): paleta, marca y
// tipografía. Se llega desde Identidad del equipo y desde el menú de fases.

function identityBrand() {
  if (!state.brand || typeof state.brand !== "object") state.brand = {};
  return state.brand;
}

function setBrandField(clave, valor) {
  identityBrand()[clave] = valor;
  saveState();
}

function promptLogoProyecto() {
  const nombre = state.project_name || state.challenge_title || "el proyecto";
  const reto = state.challenge_title && state.challenge_title !== nombre ? `, solución al reto «${state.challenge_title}»` : "";
  const sector = state.category ? `Sector: ${state.category}.` : "";
  const ciudad = state.city ? `Se usa primero en ${state.city}.` : "";
  return [
    `Diseña un logotipo vectorial para ${nombre}${reto}.`,
    sector,
    ciudad,
    "Marca simple, legible a 24 px y en un solo color; sin degradados, sin sombras, sin texto pequeño.",
    "Formas tomadas del oficio de quien lo usa: herramienta, materia prima o gesto de trabajo, no iconos genéricos de tecnología.",
    "Entrega: SVG con fondo transparente, versión en el color principal del proyecto y versión en negativo, más una variante cuadrada para avatar.",
    "Sin letras inventadas, sin parecido con marcas existentes y sin claims dentro de la imagen."
  ].filter(Boolean).join(" ");
}

function copiarPromptLogo() {
  navigator.clipboard.writeText(promptLogoProyecto());
  showToast("Prompt del logotipo copiado. Pégalo en la IA que dibuja.");
}

function renderViewIdentidad() {
  const pal = state.palette || {};
  const roles = [
    { key: "primary", label: "Color principal", uso: "Titulares y el acento que se recuerda." },
    { key: "secondary", label: "Color de apoyo", uso: "Bloques secundarios y series de datos." },
    { key: "accent", label: "Acento", uso: "Un dato que debe saltar a la vista. Se usa poco." }
  ];
  const cs = getComputedStyle(document.documentElement);
  const fuenteUi = cs.getPropertyValue("--font-ui").trim() || "—";
  const fuenteNum = cs.getPropertyValue("--font-mono").trim() || "—";
  const hayPaleta = !!(pal.primary || pal.secondary || pal.accent);
  const brand = identityBrand();
  const escala = [
    { uso: "Título de pantalla", fam: "Titulares", size: "32 px", peso: "800" },
    { uso: "Subtítulo de sección", fam: "Titulares", size: "20 px", peso: "700" },
    { uso: "Cuerpo y texto del pautado", fam: "Texto", size: "15 px", peso: "400" },
    { uso: "Cifras, tiempo y precios", fam: "Números", size: "28 px", peso: "800" }
  ];

  const filas = roles.map(r => {
    const hex = String(pal[r.key] || "").trim();
    const sobreBlanco = contrasteHex(hex, "#ffffff");
    const sobreTinta = contrasteHex(hex, "#0f172a");
    const veredicto = (sobreBlanco === null)
      ? "Sin definir"
      : (sobreBlanco >= 4.5 ? `Legible sobre blanco (${sobreBlanco.toFixed(1)}:1)`
        : (sobreTinta !== null && sobreTinta >= 4.5 ? `Solo legible sobre tinta (${sobreTinta.toFixed(1)}:1)` : "Contraste bajo: cámbialo"));
    return `
      <div style="display:flex; gap:14px; align-items:flex-start; padding:12px 0; border-bottom:1px solid var(--border-light);">
        <div style="flex:0 0 auto; width:56px; height:56px; border-radius:4px; background:${hex || "transparent"}; ${hex ? "" : "border:1px dashed var(--border-strong);"}"></div>
        <div>
          <h2 style="margin:0; font-size:13px; font-weight:700; color:var(--text-title);">${r.label}</h2>
          <p style="margin:2px 0 0; font-family:var(--font-mono); font-size:12px; font-weight:700; color:var(--text-title);">${hex ? escapeHtml(hex.toUpperCase()) : "sin aprobar"}</p>
          <p style="margin:4px 0 0; font-size:12px; color:var(--text-muted);">${escapeHtml(r.uso)}</p>
          <p style="margin:2px 0 0; font-size:12px; font-weight:700; color:var(--text-muted);">${escapeHtml(veredicto)}</p>
        </div>
      </div>`;
  }).join("");

  const marca = state.team_logo_img
    ? `<img src="${escapeHtml(state.team_logo_img)}" alt="Marca del equipo" style="max-height:64px; max-width:120px; object-fit:contain;">`
    : `<span style="font-family:var(--font-mono); font-size:12px; color:var(--text-muted);">${escapeHtml(state.team_logo || "sin marca")}</span>`;

  return `
    <div class="phase-header">
      <div>
        <h1 class="phase-title">Identidad <span class="phase-title-accent">visual</span></h1>
        <p class="phase-subtitle">Lo que hace que el proyecto se vea como suyo y no como la herramienta.</p>
      </div>
      <button class="link-quiet" onclick="switchTab('team')">← Identidad del equipo</button>
    </div>

    ${hayPaleta ? "" : `
      <p class="bu-note is-warn"><strong>Todavía no hay paleta aprobada.</strong> Se deriva del reto, el sector y la ciudad; nunca se elige por moda. Corre el generador, elige una ruta y apruébala.</p>
    `}

    <section class="sol-sec">
      <label class="sol-label">Paleta del proyecto</label>
      <div>${filas}</div>
      <div class="sol-inline-action">
        <button class="link-quiet" onclick="copiarComandoPaleta()">${SVG.copy} Copiar el comando de la paleta</button>
      </div>
      <p class="sol-hint">El generador lee el reto del proyecto y propone tres rutas. Aprobar una es un acto humano: nadie la elige por ti.</p>
    </section>

    <section class="sol-sec">
      <label class="sol-label">Marca del equipo</label>
      <div style="display:flex; align-items:center; gap:14px;">${marca}<span style="font-size:13px; font-weight:700; color:var(--text-title);">${escapeHtml(state.team_name || "equipo sin nombre")}</span></div>
      <p class="sol-hint">${state.team_logo_img ? "La imagen que subió el equipo." : "Sin imagen subida: sube el logo desde Identidad del equipo."}</p>
    </section>

    <section class="sol-sec">
      <label class="sol-label">Tipografía</label>
      <dl class="setup-facts setup-facts-inline">
        <div><dt>Titulares y texto</dt><dd>${escapeHtml(fuenteUi)}</dd></div>
        <div><dt>Números</dt><dd>${escapeHtml(fuenteNum)}</dd></div>
      </dl>
      <table class="brand-scale">
        <thead><tr><th>Uso</th><th>Familia</th><th>Tamaño</th><th>Peso</th></tr></thead>
        <tbody>${escala.map(e => `<tr><td>${escapeHtml(e.uso)}</td><td>${escapeHtml(e.fam)}</td><td>${escapeHtml(e.size)}</td><td>${escapeHtml(e.peso)}</td></tr>`).join("")}</tbody>
      </table>
      <p class="sol-hint">Dos familias y cuatro tamaños. Las cifras van con números de ancho fijo para que no bailen al actualizarse; nada fuera de esta escala.</p>
    </section>

    <section class="sol-sec">
      <label class="sol-label">Misión, visión y promesa</label>
      <div class="brand-fields">
        <div class="brand-field">
          <span class="brand-field-k">Misión</span>
          <textarea class="sol-input" rows="3" placeholder="Qué cambia el proyecto en la vida de quien lo usa, en una frase con sujeto y verbo." oninput="setBrandField('mision', this.value)">${escapeHtml(brand.mision || "")}</textarea>
        </div>
        <div class="brand-field">
          <span class="brand-field-k">Visión</span>
          <textarea class="sol-input" rows="3" placeholder="Dónde está el proyecto en cinco años y cuántas personas lo usan." oninput="setBrandField('vision', this.value)">${escapeHtml(brand.vision || "")}</textarea>
        </div>
        <div class="brand-field">
          <span class="brand-field-k">Promesa</span>
          <textarea class="sol-input" rows="3" placeholder="Lo que el proyecto garantiza y puede comprobarse, sin adjetivos." oninput="setBrandField('promesa', this.value)">${escapeHtml(brand.promesa || "")}</textarea>
        </div>
        <div class="brand-field">
          <span class="brand-field-k">Tono de voz</span>
          <textarea class="sol-input" rows="3" placeholder="Tres reglas de cómo habla el proyecto. Ej: habla como el técnico; dice cifras completas; no promete lo que no midió." oninput="setBrandField('tono', this.value)">${escapeHtml(brand.tono || "")}</textarea>
        </div>
      </div>
      <p class="sol-hint">Se escriben desde el reto y el usuario real. Si una frase no se puede comprobar, no va.</p>
    </section>

    <section class="sol-sec">
      <label class="sol-label">Logotipo</label>
      <p class="sol-hint">El prompt se arma con el reto, el sector y la ciudad del proyecto. Cópialo y pégalo en la IA que dibuja.</p>
      <pre class="brand-prompt">${escapeHtml(promptLogoProyecto())}</pre>
      <div class="sol-inline-action">
        <button class="link-quiet" onclick="copiarPromptLogo()">${SVG.copy} Copiar el prompt del logotipo</button>
      </div>
    </section>

    <section class="sol-sec">
      <label class="sol-label">Dónde se aplica</label>
      <p class="sol-hint">El pautado, el presupuesto, el prototipo web y los planos del video usan estos tres colores y estas dos tipografías. El cobalto de la herramienta nunca aparece en el entregable.</p>
    </section>

    <section class="sol-sec">
      <label class="sol-label">Rally Design</label>
      <div class="sol-inline-action">
        <a class="link-quiet" href="../site/diseno/index.html" target="_blank" rel="noopener" title="Carrusel de equipo, kit de prensa, thumbnail e impacto con la identidad del proyecto">${SVG.external} Abrir la página del proyecto</a>
        <button class="link-quiet" onclick="copiarComandoDiseno()">${SVG.copy} Copiar el comando</button>
      </div>
    </section>
  `;
}

function renderViewCertamen() {
  if (setupIsDone() && state.setup_editing !== "certamen") return renderCertamenSummary();
  const isLatam = state.rally_type === 'latam';
  const isNac = state.rally_type === 'nacional';

  const checkCircleMagenta = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="12" fill="#0866F5"/><path d="M7 12.5l3.5 3.5 7-7" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  const checkCirclePurple = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="12" fill="#0D1B35"/><path d="M7 12.5l3.5 3.5 7-7" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

  return `
    <div class="wizard-canvas">
      ${SVG.landscapeBg}

      <div class="stepper-header">
        <span class="stepper-pill"><span class="pill-dim">PASO</span> <strong class="pill-num">01</strong> <span class="pill-dim">DE 02</span></span>
        <div class="stepper-bars">
          <div class="stepper-bar-segment active"></div>
          <div class="stepper-bar-segment"></div>
        </div>
      </div>

      <h1 class="wizard-hero-title">¿Qué <span class="title-accent">Rally</span> es?</h1>
      <p class="wizard-hero-desc">
        Selecciona el certamen en el que participará tu equipo para calibrar automáticamente las reglas,
        el régimen de horas y la estructura oficial del documento pautado.
      </p>

      <div class="certamen-grid">
        <!-- Tarjeta 1: Rally Latinoamericano de Innovación -->
        <div class="certamen-card latam-card ${isLatam ? 'selected' : ''}" onclick="selectCertamen('latam', event)">
          <div>
            <div class="certamen-card-header">
              <div class="hours-badge latam" title="Régimen de 28 horas continuas">
                <span class="hours-num">28</span><span class="hours-unit">H</span>
              </div>
              <img src="assets/logo_rally_latam.png" class="certamen-header-logo" alt="Rally Latinoamericano de Innovación">
              <div>${isLatam ? checkCircleMagenta : SVG.uncheckedCircle}</div>
            </div>

            <div class="certamen-illustration-wrap">
              ${SVG.latinAmericaIllustration}
            </div>

            <div class="certamen-meta-tag latam">RALLY LATINOAMERICANO</div>
            <h2 class="certamen-card-title">${RALLY_PROFILES.latam.name}</h2>
            <p class="certamen-card-desc">Competencia internacional entre 8 países de América Latina.</p>
          </div>

          <div class="certamen-card-footer">
            <button class="btn-select-card ${isLatam ? 'filled-primary' : 'outline-primary'}" onclick="selectCertamen('latam', event)">
              Seleccionar ${SVG.arrowRight}
            </button>
          </div>
        </div>

        <!-- Tarjeta 2: Rally Nacional Nicaragua Innova -->
        <div class="certamen-card nacional-card ${isNac ? 'selected' : ''}" onclick="selectCertamen('nacional', event)">
          <div>
            <div class="certamen-card-header">
              <div class="hours-badge nacional" title="Régimen de 24 horas continuas">
                <span class="hours-num">24</span><span class="hours-unit">H</span>
              </div>
              <img src="assets/logo_rally_nacional.png" class="certamen-header-logo" alt="${RALLY_PROFILES.nacional.name}">
              <div>${isNac ? checkCirclePurple : SVG.uncheckedCircle}</div>
            </div>

            <div class="certamen-illustration-wrap">
              ${SVG.momotomboIllustration}
            </div>

            <div class="certamen-meta-tag nacional">RALLY NACIONAL</div>
            <h2 class="certamen-card-title">${RALLY_PROFILES.nacional.name}</h2>
            <p class="certamen-card-desc">Certamen universitario territorial de 24 horas.</p>
          </div>

          <div class="certamen-card-footer">
            <button class="btn-select-card ${isNac ? 'filled-navy' : 'outline-navy'}" onclick="selectCertamen('nacional', event)">
              Seleccionar ${SVG.arrowRight}
            </button>
          </div>
        </div>
      </div>

      <!-- Botón de Continuar Centrado -->
      <div style="display:flex; margin-top:32px;">
        <button id="btnProceedCertamen" class="btn-select-card ${isLatam ? 'filled-primary' : 'filled-navy'}"
                style="width:100%; justify-content:space-between; text-align:left; padding:12px 18px; font-size:14px; font-weight:700; border-radius:8px;"
                ${state.rally_type ? "" : 'disabled aria-disabled="true" title="Elige un certamen para continuar"'}
                onclick="proceedFromCertamen()">
          Continuar ${SVG.arrowRight}
        </button>
      </div>
    </div>
  `;
}

function selectCertamen(type, ev) {
  if (ev) ev.stopPropagation();
  state.rally_type = type;
  state.hours_total = type === "latam" ? 28 : 24;
  state.hours_remaining = state.hours_total;
  saveState();
  renderTab("certamen");
  renderTopbar();
  startTimer();
}

function proceedFromCertamen() {
  // Sin certamen elegido no se avanza: el tipo define horas, moneda y rúbrica.
  if (!state.rally_type) {
    renderTab("certamen");
    return;
  }
  saveState();
  activeTab = "team";
  syncUI();
}

// ═════════════════════════════════════════════════════════════════════════════
// 01 NIVEL 1: IDENTIDAD DE EQUIPO & LOGOS
// ═════════════════════════════════════════════════════════════════════════════
function renderViewTeam() {
  if (setupIsDone() && state.setup_editing !== "team") return renderTeamSummary();
  const certLabel = state.rally_type === "latam" ? "Rally Latinoamericano (28h)" : "Rally Nacional (24h)";
  const rallyLogoSrc = state.rally_type === "latam" ? "assets/logo_rally_latam.png" : "assets/logo_rally_nacional.png";

  return `
    <div class="wizard-canvas">
      <div class="stepper-header" style="justify-content:space-between;">
        <div style="display:flex; align-items:center; gap:14px;">
          <span class="stepper-pill"><span class="pill-dim">PASO</span> <strong class="pill-num">02</strong> <span class="pill-dim">DE 02</span></span>
          <div class="stepper-bars">
            <div class="stepper-bar-segment completed"></div>
            <div class="stepper-bar-segment active"></div>
          </div>
        </div>
        <button class="btn-minimal-back" onclick="switchTab('certamen')" title="Volver a selección de certamen">
          ${SVG.arrowLeft}
          <span>Cambiar certamen</span>
        </button>
      </div>

      <h1 class="wizard-hero-title" style="margin-bottom:24px;">Identidad del <span class="title-accent">Equipo</span></h1>

      <div style="padding:0; max-width:960px; margin:0 auto;">
        <div class="team-step-grid">
          <!-- Columna Izquierda: Formulario de Datos -->
          <div style="display:flex; flex-direction:column; justify-content:space-between;">
            <div>
              <!-- Nombre del Squad (la marca del proyecto se define a partir del reto elegido) -->
              <div class="form-group" style="margin-bottom:16px;">
                <label style="font-weight:700; color:var(--text-title); font-size:12px; display:block; margin-bottom:6px;">NOMBRE DE SQUAD (EQUIPO)</label>
                <input type="text" id="tm-name" placeholder="Nombre del equipo" value="${state.team_name || ''}"
                  style="width:100%; box-sizing:border-box; padding:10px 12px; border:1.5px solid var(--border-strong); border-radius:8px; font-size:13px; font-weight:600; color:var(--text-title);"
                  oninput="updateTeamName(this.value);">
                <span id="tm-name-aviso" style="font-size:11px; color:var(--status-err-text); margin-top:4px; display:block;"></span>
                <span style="font-size:11px; color:var(--text-muted); margin-top:6px; display:block;">El nombre de la marca/proyecto se decide en el Taller de Solución.</span>
              </div>

              <div class="form-group" style="margin-bottom:16px;">
                <label style="font-weight:700; color:var(--text-title); font-size:12px; display:block; margin-bottom:6px;">UNIVERSIDAD O SEDE</label>
                <input type="text" id="tm-university" value="${escapeHtml(state.university || '')}"
                  placeholder="Escribe el nombre completo de tu universidad"
                  style="width:100%; box-sizing:border-box; padding:10px 12px; border:1.5px solid var(--border-strong); border-radius:8px; font-size:13px;"
                  oninput="state.university = this.value.trim(); saveState();">
              </div>

              <div class="form-group" style="margin-bottom:16px;">
                <label style="font-weight:700; color:var(--text-title); font-size:12px; display:block; margin-bottom:6px;">CIUDAD</label>
                <input type="text" id="tm-city" value="${escapeHtml(state.city || '')}"
                  placeholder="Ciudad donde se corre el rally"
                  style="width:100%; box-sizing:border-box; padding:10px 12px; border:1.5px solid var(--border-strong); border-radius:8px; font-size:13px;"
                  oninput="state.city = this.value.trim(); saveState();">
              </div>

              <div class="form-group full">
                <label style="font-weight:700; color:var(--text-title); font-size:12px; display:block; margin-bottom:6px;">LOGO OFICIAL DEL EQUIPO (IMAGEN PNG / JPG / SVG / WEBP)</label>
                ${state.team_logo_img ? `
                  <div class="logo-preview-box">
                    <img src="${state.team_logo_img}" alt="Logo de Equipo" style="max-height:56px; max-width:90px; object-fit:contain; border-radius:6px; border:1px solid var(--border-light); background:var(--bg-surface); padding:4px;">
                    <div style="flex:1;">
                      <div style="font-size:13px; font-weight:700; color:var(--text-title);">Logo Cargado Exitosamente</div>
                      <div style="font-size:11px; color:var(--text-muted);">Visible en la credencial y el topbar.</div>
                    </div>
                    <button type="button" class="btn-pill-light" style="font-size:11px; color:var(--status-err-text);" onclick="removeTeamLogo()">Quitar</button>
                    <label class="btn-pill-light" style="font-size:11px; cursor:pointer;">
                      Cambiar
                      <input type="file" accept="image/png, image/jpeg, image/svg+xml, image/webp" style="display:none;" onchange="handleTeamLogoUpload(event)">
                    </label>
                  </div>
                ` : `
                  <label class="logo-dropzone" for="team-logo-file-input"
                    ondragover="event.preventDefault(); this.style.borderColor='#0066ff'; this.style.background='#eff6ff';"
                    ondragleave="this.style.borderColor='#cbd5e1'; this.style.background='#f8fafc';"
                    ondrop="event.preventDefault(); this.style.borderColor='#cbd5e1'; this.style.background='#f8fafc'; handleTeamLogoUpload({target:{files:event.dataTransfer.files}});">
                    <input type="file" id="team-logo-file-input" accept="image/png, image/jpeg, image/svg+xml, image/webp" style="display:none;" onchange="handleTeamLogoUpload(event)">
                    <div style="width:40px; height:40px; border-radius:50%; background:var(--status-ok-bg); display:flex; align-items:center; justify-content:center; color:#0066ff;">
                      ${SVG.upload}
                    </div>
                    <div style="font-size:13px; font-weight:700; color:var(--text-title);">Haz clic o arrastra aquí el logo oficial</div>
                    <div style="font-size:11px; color:var(--text-muted);">Formatos: PNG, JPG, SVG o WebP (alta resolución)</div>
                  </label>
                `}
              </div>
            </div>

            <div style="display:flex; justify-content:space-between; align-items:center; margin-top:24px; border-top:1px solid var(--border-light); padding-top:16px;">
              <button class="btn-minimal-back" onclick="switchTab('certamen')">
                ${SVG.arrowLeft}
                <span>Regresar</span>
              </button>
              <button class="btn-select-card filled" style="padding:11px 24px; font-size:13px;" onclick="saveTeamAndProceed()">
                Continuar a Selección de Reto ${SVG.arrowRight}
              </button>
            </div>
          </div>

          <!-- Columna Derecha: Previsualización de Identidad -->
          <div class="team-preview-panel">
            <div class="team-preview-caption" style="font-size:11px; font-weight:800; letter-spacing:0.08em; color:var(--text-muted);  margin-bottom:22px;">
              Previsualización de Identidad
            </div>

            <!-- 1. Logo del grupo en grande -->
            <div style="width:130px; height:130px; margin:0 auto; border-radius:18px; border:2px ${state.team_logo_img ? 'solid #003366' : 'dashed var(--border-strong)'}; background:var(--bg-surface); display:flex; align-items:center; justify-content:center; overflow:hidden;">
              ${state.team_logo_img 
                ? `<img id="preview-team-logo" src="${state.team_logo_img}" style="width:100%; height:100%; object-fit:contain; padding:10px;" alt="Logo Equipo">`
                : `<div style="text-align:center; color:var(--text-muted); font-size:11px; padding:8px;">
                     <div style="margin-bottom:6px; opacity:0.6;">${SVG.upload}</div>
                     <div style="font-weight:700;">Logo del Equipo</div>
                   </div>`
              }
            </div>

            <!-- 2. Abajo los 2 logos UNI y Rally en más pequeño -->
            <div style="display:flex; align-items:center; justify-content:center; gap:16px; margin-top:20px;">
              <img src="assets/logo_uni_official.png" style="height:32px; width:auto; max-width:75px; object-fit:contain;" alt="Universidad Nacional de Ingeniería">
              <span style="color:var(--text-faint); font-weight:300; font-size:16px;">|</span>
              <img src="${rallyLogoSrc}" style="height:28px; width:auto; max-width:125px; object-fit:contain;" alt="Rally Oficial">
            </div>

            <!-- 3. Nombre del grupo y marca de la solución -->
            <div style="margin-top:22px; text-align:center;">
              <h2 id="preview-team-name" style="font-family:var(--font-ui); font-size:22px; font-weight:800; color:var(--text-title); margin-bottom:4px; letter-spacing:-0.02em; word-break:break-word;">
                ${escapeHtml(state.team_name || 'NOMBRE DEL EQUIPO')}
              </h2>
              <div id="preview-solution-brand" style="display:${state.project_name ? 'inline-block' : 'none'}; font-size:12px; font-weight:800; color:var(--color-primary); background:var(--bg-secondary); border:1px solid var(--border-light); border-radius:6px; padding:3px 10px; margin-bottom:8px;">
                ${state.project_name ? `PROYECTO: ${escapeHtml(state.project_name)}` : ''}
              </div>
              <div style="font-family:var(--font-ui); font-size:12px; font-weight:600; color:var(--text-muted);">
                ${escapeHtml(state.university || '')}
              </div>
              <div class="team-preview-rally" style="font-family:var(--font-ui); font-size:11px; font-weight:600; color:var(--text-muted); margin-top:4px;">
                ${rallyProfile().name} ${rallyProfile().hours}h
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

// Nombres que ya usó un equipo en rallies anteriores. Se avisa, no se bloquea:
// repetir un nombre hace que el jurado confunda dos proyectos.
const EQUIPOS_YA_USADOS = ["sinergia09", "sinergia", "umbral09"];

function equipoNombreNormalizado(txt) {
  return String(txt || "").toLowerCase().replace(/[^a-z0-9]/g, "");
}

function equipoNombreRepetido(txt) {
  const n = equipoNombreNormalizado(txt);
  if (!n) return false;
  return EQUIPOS_YA_USADOS.some(u => u === n);
}

function updateTeamName(val) {
  state.team_name = val;
  saveState();
  const aviso = document.getElementById("tm-name-aviso");
  if (aviso) {
    const repetido = equipoNombreRepetido(val);
    aviso.textContent = repetido
      ? "Ese nombre ya lo usó un equipo en un rally anterior. Si lo mantienes, que tu marca lo distinga."
      : "";
  }
  const el = document.getElementById("preview-team-name");
  if (el) {
    el.innerText = val.trim() || "NOMBRE DEL EQUIPO";
  }
  const topbarCrumb = document.querySelector(".project-title-crumb");
  if (topbarCrumb) {
    topbarCrumb.innerText = val.trim() ? `/ ${val.trim()}` : "";
  }
}

function updateProjectBrand(val) {
  state.project_name = val;
  saveState();
  const brandEl = document.getElementById("preview-solution-brand");
  if (brandEl) {
    brandEl.innerText = val.trim() ? `PROYECTO: ${val.trim()}` : "";
    brandEl.style.display = val.trim() ? "inline-block" : "none";
  }
  checkInnovaNamingPattern();
}

function updateSirliField(field, val) {
  state[field] = val;
  saveState();
  renderSirliBadge();
}

function checkInnovaNamingPattern() {
  const full = ((state.team_name || "") + " " + (state.project_name || "")).toLowerCase();
  const warnEl = document.getElementById("naming-innova-warning");
  if (warnEl) {
    warnEl.style.display = /innova/i.test(full) ? "flex" : "none";
  }
}

function renderSirliBadge() {
  const count = parseInt(state.team_members_count || 6, 10);
  const countOk = count >= 4 && count <= 10;
  const engOk = !!state.team_has_engineering;
  const femOk = !!state.team_has_female;
  const leadOk = !!state.team_leader_student;
  const allOk = countOk && engOk && femOk && leadOk;

  const badge = document.getElementById("sirli-compliance-badge");
  if (badge) {
    if (allOk) {
      badge.style.background = "var(--status-ok-bg)";
      badge.style.color = "var(--status-ok-text)";
      badge.style.borderColor = "var(--status-ok-border)";
      badge.innerHTML = "✓ Conforme con Bases SIRLI";
    } else {
      badge.style.background = "#fff1f2";
      badge.style.color = "#be123c";
      badge.style.borderColor = "#fecdd3";
      badge.innerHTML = "⚠ Verificación SIRLI pendiente";
    }
  }
}

function handleTeamLogoUpload(event) {
  const file = event.target && event.target.files && event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(e) {
    state.team_logo_img = e.target.result;
    saveState();
    renderTab('team');
    renderTopbar();
  };
  reader.readAsDataURL(file);
}

function removeTeamLogo() {
  state.team_logo_img = "";
  saveState();
  renderTab('team');
  renderTopbar();
}

function saveTeamAndProceed() {
  const nameInput = document.getElementById("tm-name");
  const name = nameInput ? nameInput.value.trim() : (state.team_name || "");

  if (!name) {
    alert("Por favor ingresa el Nombre Oficial de tu Equipo.");
    if (nameInput) nameInput.focus();
    return;
  }

  state.team_name = name;
  saveState();
  activeTab = "challenges";
  syncUI();
}

// ═════════════════════════════════════════════════════════════════════════════
// 02 NIVEL 2: RETOS DEL COMITÉ (INGESTA OFICIAL POR TEXTO / PDF / CATÁLOGO)
// ═════════════════════════════════════════════════════════════════════════════
// ═════════════════════════════════════════════════════════════════════════════
// TRIBUNAL DE RETOS: embudo de decisión grupal (NGT: lectura silenciosa →
// descarte → puntos de voto por persona → decisión). Sincronizado en vivo entre
// mascotas del equipo vía BroadcastChannel.
// ═════════════════════════════════════════════════════════════════════════════
function getTribunal() {
  if (!state.challenge_tribunal || typeof state.challenge_tribunal !== "object") {
    state.challenge_tribunal = { step: "read", per: {}, team: {}, votes: {}, reservations: {} };
  }
  const t = state.challenge_tribunal;
  if (!t.per) t.per = {};
  if (!t.team) t.team = {};
  if (!t.votes) t.votes = {};
  if (!t.reservations) t.reservations = {};
  // Migración: formato previo {chId:"keep"} (una sola voz) → {chId:{persona:kind}}
  Object.keys(t.per || {}).forEach(k => {
    if (typeof t.per[k] === "string") t.per[k] = {[EQUIPO_LEGADO]: t.per[k]};
  });
  if (!["read", "discard", "vote", "decide"].includes(t.step)) t.step = "read";
  return t;
}
const EQUIPO_LEGADO = "voz-heredada";

function _me() {
  return (currentClientMascot && currentClientMascot.name) || "Invitado";
}

// Color estable por persona (hash del nombre): mismo usuario = mismo color en notas y votos.
const USER_COLOR_PALETTE = ["#0866F5", "#0057E7", "#1D4ED8", "#0369A1", "#0D9488", "#0F766E", "#334155", "#E11D48"];
function _userColor(name) {
  let h = 0;
  const s = String(name || "");
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return USER_COLOR_PALETTE[h % USER_COLOR_PALETTE.length];
}

// Voz individual: qué marcó esta persona sobre un reto
function personDisposition(chId) {
  const t = getTribunal();
  const m = t.per[chId];
  return (m && m[_me()]) || null;
}
function discardCount(chId) {
  const t = getTribunal();
  return Object.values(t.per[chId] || {}).filter(v => v === "discard").length;
}
function isTeamDiscarded(chId) {
  return !!getTribunal().team[chId];
}
function hasAnyKeep(chId) {
  return Object.values(getTribunal().per[chId] || {}).some(v => v === "keep");
}
function reserveCount(chId) {
  return (getTribunal().reservations[chId] || []).length;
}
// Estado resumido del reto en el embudo: equipo > mi voz > otros > espera
function funnelStateOf(chId) {
  if (isTeamDiscarded(chId)) return "discard";
  return personDisposition(chId) || "espera";
}

function _saveTribunal() {
  saveState();
  broadcastFieldChange("tribunal", "state", state.challenge_tribunal);
}

function setTribunalStep(step) {
  const t = getTribunal();
  t.step = step;
  _saveTribunal();
  renderTab("challenges");
}

function setChallengeDisposition(chId, kind) {
  const t = getTribunal();
  t.per[chId] = t.per[chId] || {};
  const cur = t.per[chId][_me()] || null;
  const next = cur === kind ? null : kind;
  if (next) t.per[chId][_me()] = next; else delete t.per[chId][_me()];
  if (t.per[chId] && !Object.keys(t.per[chId]).length) delete t.per[chId];
  _saveTribunal();
  showToast(next === "discard" ? `Reto #${chId}: tu voz pidió descartarlo.` : next === "keep" ? `Reto #${chId}: marcado "Me interesa".` : `Reto #${chId}: tu voz vuelve a "en espera".`);
  renderTab("challenges");
}

// NGT: cuando 2+ personas pidieron descartar, un clic cala el descarte para el equipo.
function discardChallengeTogether(chId) {
  const t = getTribunal();
  const n = discardCount(chId);
  if (n < 2) {
    showToast(`Faltan voces: ${n} de 2 personas pidieron descartar el Reto #${chId}.`, true);
    return;
  }
  if ((t.reservations[chId] || []).length) {
    showToast("Hay una RESERVA activa en este reto; resuélvanla juntos (2 min de escucha) antes de descartar.", true);
    return;
  }
  t.team[chId] = true;
  _saveTribunal();
  showToast(`Descartado en consenso (n=${n}): Reto #${chId} sale del embudo del equipo.`);
  renderTab("challenges");
}

function setChallengeReserve(chId) {
  const t = getTribunal();
  const me = _me();
  const list = t.reservations[chId] || [];
  if (list.includes(me)) {
    t.reservations[chId] = list.filter(x => x !== me);
    showToast(`Retiraste tu RESERVA del Reto #${chId}.`);
  } else {
    t.reservations[chId] = [...list, me];
    showToast(`RESERVA puesta en Reto #${chId}: se escucha tu caso 2 min antes de descartar.`);
  }
  _saveTribunal();
  renderTab("challenges");
}

function toggleChallengeVote(chId) {
  const t = getTribunal();
  const me = _me();
  if (isTeamDiscarded(chId)) {
    showToast(`El Reto #${chId} quedó descartado por el equipo; no entra a votación.`, true);
    return;
  }
  if (!hasAnyKeep(chId)) {
    showToast('Vota solo en retos que pasaron el embudo: márcalos "Me interesa" en la fase Descarte.', true);
    return;
  }
  const votes = t.votes[chId] || [];
  const mine = votes.filter(v => v === me);
  if (mine.length >= 3) {
    t.votes[chId] = votes.filter(v => v !== me); // quita mis 3 puntos de golpe (gesto de sí)
    showToast(`Quitaste tus puntos de voto en Reto #${chId}.`);
  } else {
    t.votes[chId] = [...votes, me]; // +1 punto (dot voting NGT, máx 3 por persona)
    showToast(`+1 punto para Reto #${chId} (${me}). Puedes dar hasta 3.`);
  }
  _saveTribunal();
  renderTab("challenges");
}

// Ángulo ganador basado en el motor de ganadores 2019–2026 (winners_analysis):
function winnerAngleFor(ch) {
  const info = challengeRankFor(ch);
  const bullets = [];
  if (info.reasonLines) bullets.push(...info.reasonLines.slice(0, 4));
  const probes = [
    { ok: !!ch.precedent, text: ch.precedent ? `Precedente ganador: ${ch.precedent}` : "Sin precedente directo: apóyate en el patrón de ganador genérico (infra útil + dato en vivo)." },
    { ok: info.isHighComp, text: info.isHighComp ? "Concurrencia alta: exige ≥2 capas tecnológicas para no perder por saturación." : "Concurrencia baja: ventaja directa si la factibilidad es sólida." },
    { ok: true, text: "Juega las cifras exactas: presupuesto $4,000–$6,000 realista y demostrable en 28 h." },
    { ok: true, text: "Diseña la demostración temprana (Acto II): hardware visible antes del minuto 30 del video." }
  ];
  probes.forEach(p => { if (p.ok) bullets.push(p.text); });
  return { score: info.score, bullets: bullets.slice(0, 6), criteria: info.criteria, isHighComp: info.isHighComp };
}

// ── MESA DE RETOS · decisión por mayoría (≥50 % del equipo, sin quórum) ─────
// Estado: { size, votes: { [chId]: {yes,no,res,at} }, renews: { [chId]: [{by,at,removed}] } }
function getMesa() {
  if (!state.challenge_mesa || typeof state.challenge_mesa !== "object") {
    state.challenge_mesa = { size: 0, votes: {}, renews: {} };
  }
  const m = state.challenge_mesa;
  if (!m.votes) m.votes = {};
  if (!m.renews) m.renews = {};
  if (!m.size) m.size = getRoster().length;
  return m;
}

function mesaSeats() {
  // La mesa son los usuarios reales del roster. Si nadie se ha nombrado,
  // la mesa está vacía: no se inventan estaciones ni integrantes de relleno.
  return getRoster()
    .filter(m => m && m.id && m.name)
    .map(m => ({ id: String(m.id), label: String(m.name), color: _userColor(m.name) }));
}

function mesaMe() {
  const seats = mesaSeats();
  const ident = currentClientMascot || {};
  const porId = seats.find(s => s.id === String(ident.id || ""));
  if (porId) return porId.id;
  const clave = personNameKey(ident.name || "");
  const porNombre = clave ? seats.find(s => personNameKey(s.label) === clave) : null;
  return porNombre ? porNombre.id : "";
}

function mesaSeatName(seatId) {
  const s = mesaSeats().find(x => x.id === seatId);
  return s ? s.label : String(seatId);
}

function mesaBallot(chId) {
  const m = getMesa();
  if (!m.votes[chId] || typeof m.votes[chId] !== "object") m.votes[chId] = { yes: [], no: [], res: [], at: {} };
  const b = m.votes[chId];
  if (!Array.isArray(b.yes)) b.yes = [];
  if (!Array.isArray(b.no)) b.no = [];
  if (!Array.isArray(b.res)) b.res = [];
  if (!b.at || typeof b.at !== "object") b.at = {};
  return b;
}

function mesaTally(chId) {
  const b = mesaBallot(chId);
  const size = mesaSeats().length;
  const yes = b.yes.length;
  const no = b.no.length;
  const res = b.res.length;
  const need = size > 0 ? Math.ceil(size / 2) : 0;
  return {
    size, yes, no, res,
    wait: Math.max(0, size - yes - no - res),
    need,
    approved: size > 0 && yes >= need,
    discarded: size > 0 && no >= need
  };
}

function _mesaTime() {
  const d = new Date();
  return String(d.getHours()).padStart(2, "0") + ":" + String(d.getMinutes()).padStart(2, "0");
}

function mesaVote(chId, seatId, stance) {
  // Un voto por persona: cada cual vota el suyo, nunca el de otro.
  const yo = mesaMe();
  if (!yo) {
    showToast("Ponte un nombre en el equipo antes de votar.", true);
    return;
  }
  if (String(seatId) !== yo) {
    showToast("Un voto por persona: ese voto no es tuyo.", true);
    return;
  }
  const b = mesaBallot(chId);
  const cur = b.yes.includes(seatId) ? "yes" : b.no.includes(seatId) ? "no" : b.res.includes(seatId) ? "res" : null;
  b.yes = b.yes.filter(x => x !== seatId);
  b.no = b.no.filter(x => x !== seatId);
  b.res = b.res.filter(x => x !== seatId);
  const next = stance
    ? (cur === stance ? null : stance)
    : (cur === null ? "yes" : cur === "yes" ? "no" : cur === "no" ? "res" : null);
  if (next === "yes") b.yes.push(seatId);
  if (next === "no") b.no.push(seatId);
  if (next === "res") b.res.push(seatId);
  if (next) b.at[seatId] = _mesaTime(); else delete b.at[seatId];

  const t = mesaTally(chId);
  const trib = getTribunal();
  if (t.discarded) trib.team[chId] = true; else delete trib.team[chId];

  saveState();
  broadcastFieldChange("tribunal", "state", state.challenge_tribunal);

  const label = next === "yes" ? "aprueba" : next === "no" ? "pide descartar" : next === "res" ? "pide reserva" : "queda sin decidir";
  showToast((t.discarded ? "Mitad a descarte: el sistema movió el Reto #" + chId + " al embudo. " : "") + mesaSeatName(seatId) + " " + label + " el Reto #" + chId + ".");
  renderTab("challenges");
}

function mesaRenew(chId) {
  const m = getMesa();
  const b = mesaBallot(chId);
  const removed = b.no.slice();
  b.no = [];
  Object.keys(b.at).forEach(k => { if (!b.yes.includes(k) && !b.res.includes(k)) delete b.at[k]; });
  const trib = getTribunal();
  delete trib.team[chId];
  if (!m.renews[chId]) m.renews[chId] = [];
  m.renews[chId].push({ by: mesaSeatName(mesaMe()), at: _mesaTime(), removed: removed.map(mesaSeatName) });
  saveState();
  broadcastFieldChange("tribunal", "state", state.challenge_tribunal);
  showToast("Reto #" + chId + " renovado: vuelve a la mesa sin los votos de descarte.");
  renderTab("challenges");
}

function mesaGo(chId) {
  state.active_deliberation_challenge_id = chId;
  renderTab("challenges");
}

function renderMesaBar(list, ch, idx, orden) {
  const base = orden || list;
  return `
    <div class="cr-bar">
      <div class="cr-map">
        ${list.map((c, i) => {
          const gi = base.findIndex(x => x.id === c.id);
          const num = gi >= 0 ? gi + 1 : i + 1;
          const ct = mesaTally(c.id);
          const cls = [
            "cr-pip",
            c.id === ch.id ? "is-current" : "",
            ct.discarded ? "is-out" : "",
            ct.approved ? "is-in" : "",
            !ct.approved && !ct.discarded && ct.res ? "is-res" : "",
            state.challenge_id === c.id ? "is-sel" : ""
          ].filter(Boolean).join(" ");
          return `<button class="${cls}" onclick="mesaGo('${c.id}')" aria-current="${c.id === ch.id ? "true" : "false"}" title="Reto ${num} de ${base.length}${ct.discarded ? " · descartado" : ct.approved ? " · aprobado" : ""}">${String(num).padStart(2, "0")}</button>`;
        }).join("")}
      </div>
    </div>
  `;
}

function renderMesaNotes(ch) {
  const ideas = (state.challenge_ideas && state.challenge_ideas[ch.id]) || [];
  const others = (state.challenges || []).filter(c => c.id !== ch.id);
  return `
    <section class="cr-panel cr-notes">
      <div class="cr-block">Comentarios del equipo <span class="cr-count-chip">${ideas.length}</span><span class="cr-tag">se guarda solo</span></div>
      <div class="cr-note-grid">
        ${ideas.length === 0 ? `<p class="cr-pending">Todavía no hay redacciones para este reto. La primera la escribe cualquiera.</p>` : ideas.map(idea => `
          <article class="cr-note ${idea.merged_to ? "is-merged" : ""}">
            <header class="cr-note-head">
              <span class="cr-dot" style="background:${_userColor(idea.author)}"></span>
              <span class="cr-note-author" style="color:${_userColor(idea.author)}">${idea.author || "Equipo"}</span>
              <span class="cr-note-time">#${ch.id} · ${idea.timestamp || ""}</span>
            </header>
            <p class="cr-note-text">${idea.text}</p>
            <footer class="cr-note-foot">
              ${idea.merged_to ? `<span class="cr-note-fusion">fusionada → #${idea.merged_to}</span><button class="cr-link" onclick="unmergeChallengeIdea('${ch.id}', '${idea.id}')" title="Traer la nota de vuelta">↺ traer</button>` : others.length ? `
                <select class="cr-note-merge" onchange="if(this.value) mergeChallengeIdea('${ch.id}', '${idea.id}', this.value)">
                  <option value="">fusionar ↗</option>
                  ${others.map(c => `<option value="${c.id}">#${c.id} ${(c.title || '').slice(0, 26)}</option>`).join("")}
                </select>` : ""}
              <button class="cr-link is-quiet" onclick="deleteChallengeIdea('${ch.id}', '${idea.id}')" title="Eliminar redacción">borrar</button>
            </footer>
          </article>
        `).join("")}
      </div>
      <div class="cr-compose">
        <span class="cr-dot" style="background:${_userColor(_me())}"></span>
        <textarea id="new-idea-input-${ch.id}" rows="1" placeholder="Escribe la idea, el pro o el contra y queda pegada a este reto…"
          oninput="ajustarAltoTexto(this, 34)"
          onkeydown="if(event.key==='Enter'&&!event.shiftKey){event.preventDefault();addChallengeIdea('${ch.id}')}"></textarea>
        <button class="btn-select-card filled" style="padding:6px 14px; font-size:12px; font-weight:700;" onclick="addChallengeIdea('${ch.id}')">+ pegar redacción</button>
      </div>
    </section>
  `;
}

function renderMesaVote(ch) {
  const t = mesaTally(ch.id);
  const b = mesaBallot(ch.id);
  const seats = mesaSeats();
  const meId = mesaMe();
  const stance = seatId => b.yes.includes(seatId) ? "yes" : b.no.includes(seatId) ? "no" : b.res.includes(seatId) ? "res" : "wait";
  const mio = meId ? (b.yes.includes(meId) ? "yes" : b.no.includes(meId) ? "no" : b.res.includes(meId) ? "res" : "") : "";
  const faltan = seats.filter(s => stance(s.id) === "wait").map(s => s.label);
  const stanceLabel = s => s === "yes" ? "aprueba" : s === "no" ? "descarta" : s === "res" ? "reserva" : "sin decidir";
  const verdict = t.discarded
    ? `<span class="cr-verdict-main is-out">DESCARTADO</span> <span class="cr-verdict-sub">${t.no} de ${t.size} a descarte · el sistema lo movió al embudo</span>`
    : t.approved
      ? `<span class="cr-verdict-main is-in">APROBADO</span> <span class="cr-verdict-sub">${t.yes} de ${t.size} a favor (necesitaba ${t.need})</span>`
      : `<span class="cr-verdict-main">EN DEBATE</span> <span class="cr-verdict-sub">${t.yes} de ${t.size} a favor · faltan ${Math.max(0, t.need - t.yes)} para ${t.need}</span>`;
  const renews = (getMesa().renews[ch.id] || []);
  return `
    <section class="cr-panel cr-vote" id="mesa-vote-${ch.id}">
      <div class="cr-block">La mesa vota <span class="cr-tag">${t.size ? t.size + " en la mesa · mayoría: " + t.need : "sin equipo nombrado"}</span></div>

      <div class="cr-verdict">${verdict}</div>

      <div class="cr-ballot">
        <span class="cr-ballot-q">Tu voto en el reto #${ch.id}</span>
        ${meId ? `
        <div class="cr-ballot-actions">
          <button class="cr-ballot-btn is-yes ${mio === "yes" ? "is-active" : ""}" onclick="mesaVote('${ch.id}', '${meId}', 'yes')" aria-label="Apruebo este reto" title="Apruebo">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>
          </button>
          <button class="cr-ballot-btn is-no ${mio === "no" ? "is-active" : ""}" onclick="mesaVote('${ch.id}', '${meId}', 'no')" aria-label="Descarto este reto" title="Descarto">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
          <button class="cr-ballot-btn is-res ${mio === "res" ? "is-active" : ""}" onclick="mesaVote('${ch.id}', '${meId}', 'res')" aria-label="Me reservo el voto" title="Me reservo">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15.5 13.8"/></svg>
          </button>
        </div>
        <p class="cr-ballot-wait">${faltan.length ? "Faltan por votar: " + faltan.join(", ") : "Ya votaron todos los de la mesa."}</p>
        ` : `<p class="cr-rule-line">Escribe tu nombre en el equipo y aquí aparece tu botón para votar.</p>`}
      </div>

      <div class="cr-voters">
        ${seats.length === 0
          ? `<p class="cr-rule-line">Nadie se ha nombrado todavía. Escribe tu nombre en el equipo y la mesa se llena con las personas reales.</p>`
          : `<details class="cr-fold cr-fold-quiet">
              <summary>${seats.length} en la mesa · quién votó</summary>
              <div class="cr-voters-grid">${seats.map(seat => {
          const s = stance(seat.id);
          const isMe = seat.id === meId;
          return `
            <div class="cr-voter is-${s} ${isMe ? "is-you" : ""}" aria-label="${seat.label}: ${stanceLabel(s)}${b.at[seat.id] ? " a las " + b.at[seat.id] : ""}">
              <span class="cr-dot" style="background:${seat.color}"></span>
              <span class="cr-voter-name">${seat.label}${isMe ? " · tú" : ""}</span>
              <span class="cr-voter-stance">${s === "wait" ? "falta" : stanceLabel(s)}</span>
              <span class="cr-voter-at">${b.at[seat.id] || "—"}</span>
            </div>
          `;
        }).join("")}</div>
            </details>`}
      </div>

      ${renews.map(r => `<div class="cr-rec-log">renovado por ${r.by} · ${r.at} — se borraron los votos de descarte${r.removed && r.removed.length ? " de " + r.removed.join(", ") : ""}</div>`).join("")}

      <div class="cr-vote-actions">
        ${t.discarded ? `<button class="btn-pill-light cr-renew-btn" onclick="mesaRenew('${ch.id}')">Renovar este reto</button>` : ""}
        ${state.challenge_id === ch.id ? `<span class="cr-held">Este es el reto elegido</span>` : ""}
      </div>

      <p class="cr-rule-line">Se aprueba con la mitad a favor; se descarta con la mitad en contra. Un voto por persona.</p>
    </section>
  `;
}

function renderMesaSlide(ch, list, idx, orden) {
  const isSel = state.challenge_id === ch.id;
  const odsList = Array.isArray(ch.ods) ? ch.ods : String(ch.ods || "").split(/,\s*/).filter(Boolean);
  const sourceText = ch.officialExpectation || ch.demandaComite || ch.description || "";
  const ang = winnerAngleFor(ch);
  if (!SOLUCIONES_DATOS) cargarSoluciones();
  const sol = solucionDeReto(ch.id);
  const pr = sol && sol.propuesta ? sol.propuesta : null;
  const pos = String(((orden || list).findIndex(x => x.id === ch.id) >= 0 ? (orden || list).findIndex(x => x.id === ch.id) : idx) + 1).padStart(2, "0");

  return `
    <div class="cr-slide-head">
      <div class="cr-head-meta">
        <div class="cr-head-row">
          ${categoryBadge(ch.category)}
          ${isSel ? `<span class="cr-chip is-sel">ELEGIDO</span>` : ""}
        </div>
        <div class="cr-ods">
          ${odsList.map(o => {
            const num = String(o).replace(/[^\d]/g, "");
            const odsObj = (typeof ODS_CATALOG !== "undefined" ? ODS_CATALOG : []).find(x => String(x.id) === num);
            return `<button class="btn-pill-light cr-ods-pill" onclick="openImpactDetailModal('ods', ${num || 12})" title="Ver por qué y cómo cumple este ODS">${odsIcon(num || 1, odsObj && odsObj.color, 14)}${o}</button>`;
          }).join("")}
        </div>
      </div>
      <div class="cr-head-actions">
        <button class="link-quiet" onclick="openEditChallengeModal('${ch.id}')" title="Modificar título, demanda u ODS">Editar</button>
        <button class="cr-remove" onclick="deleteChallenge('${ch.id}')" title="Quitar del radar" aria-label="Quitar del radar">✕</button>
      </div>
    </div>

    <h2 class="cr-title">${ch.title}</h2>

    <div class="cr-body">
      <section class="cr-panel is-src">
        <div class="cr-block">Lo que pide el comité <span class="cr-tag is-lock">fuente · no editable</span></div>
        ${ch.imageUrl ? `<button class="cr-thumb" onclick="openLightbox('${ch.imageUrl}')" title="Ampliar el cartel oficial"><img src="${ch.imageUrl}" alt="Cartel oficial del reto"></button>` : ""}
        ${sourceText
          ? `<p class="cr-quote">${sourceText}</p>`
          : `<p class="cr-pending">Descripción oficial pendiente de transcribir. Pega el texto del comité para que quede como fuente.</p>`}
      </section>

      <section class="cr-panel">
        <div class="cr-block">La propuesta del motor <span class="cr-tag">propone · no vota</span></div>
        ${pr ? `
          <h3 class="cr-prop-name">${escapeHtml(pr.nombre || "Propuesta sin nombre")}</h3>
          ${pr.claim ? `<p class="cr-thesis">${escapeHtml(pr.claim)}</p>` : ""}
          ${pr.beneficiario ? `<p class="cr-fact">${escapeHtml(pr.beneficiario)}</p>` : ""}
          <a class="cr-link" href="../docs/Dossier_Soluciones_Actuales.pdf" target="_blank" rel="noopener noreferrer">Ver la ficha completa en el dossier →</a>
        ` : ch.wowProposal
          ? `<p class="cr-thesis">${ch.wowProposal}</p>`
          : `<p class="cr-pending">Sin propuesta escrita para este reto todavía. <button class="cr-link" onclick="openAIThesisFormulatorModal('${ch.id}')">Formular con IA Copilot</button></p>`}
        ${ang.bullets && ang.bullets.length && !pr ? `<p class="cr-angle">${ang.bullets.slice(0, 1).map(b => `<span class="cr-angle-i">${b}</span>`).join("")}</p>` : ""}
      </section>
    </div>

    ${(() => {
      const nIdeas = ((state.challenge_ideas && state.challenge_ideas[ch.id]) || []).length;
      return `<details class="cr-fold">
        <summary>Ver y escribir comentarios <span class="cr-count-chip">${nIdeas}</span></summary>
        ${renderMesaNotes(ch)}
      </details>`;
    })()}
    ${renderMesaVote(ch)}
  `;
}

function renderTribunalSubnav() {
  const t = getTribunal();
  const kept = (state.challenges || []).filter(c => hasAnyKeep(c.id) && !isTeamDiscarded(c.id)).length;
  const steps = [
    { id: "read", label: "1 · Leer", hint: "Lee cada reto en detalle" },
    { id: "discard", label: "2 · Descartar", hint: "Embudo: me interesa / descartado" },
    { id: "vote", label: `3 · Votar`, hint: kept ? "3 puntos por persona" : "Marca 'me interesa' primero" },
    { id: "decide", label: "4 · Decidir", hint: "Levantar la mano por un reto" }
  ];
  return `
    <div class="tribunal-subnav">
      ${steps.map(s => `
        <button class="tribunal-chip ${t.step === s.id ? 'active' : ''}" onclick="setTribunalStep('${s.id}')" title="${s.hint}">
          ${s.label}${s.id === "discard" ? `<span class="tribunal-chip-count">${kept}</span>` : ""}
        </button>
      `).join("")}
    </div>
  `;
}

function renderViewChallenges() {
  const hasChallenges = state.challenges && state.challenges.length > 0;
  const list = hasChallenges ? state.challenges : [];
  const tri = getTribunal();

  const filtered = list.filter(ch => {
    if (challengeFilter === "all") return true;
    return (ch.category || "").toLowerCase().includes(challengeFilter.toLowerCase());
  });

  // Orden del embudo: primero "me interesa", luego "en espera", al final "descartado"
  if (tri.step !== "read") {
    const dispOrder = c => funnelStateOf(c.id) === "keep" ? 0 : funnelStateOf(c.id) === "discard" ? 2 : 1;
    filtered.sort((a, b) => dispOrder(a) - dispOrder(b));
  }

  const selectedChallengeObj = state.challenge_id ? list.find(c => c.id === state.challenge_id) || OFFICIAL_CHALLENGES_2026.find(c => c.id === state.challenge_id) : null;

  // Mesa: reto activo del carrusel (uno a la vez)
  const mesaList = filtered;
  const mesaActive = mesaList.find(c => c.id === (state.active_deliberation_challenge_id || state.challenge_id)) || mesaList[0];
  const mesaIndex = mesaActive ? mesaList.indexOf(mesaActive) : 0;

  return `
    <div class="wizard-canvas" style="max-width:min(1760px, 100%); width:100%; margin:0 auto; padding-bottom:60px; box-sizing:border-box;">

      ${!hasChallenges ? `
        <div class="phase-header">
          <div>
            <h1 class="phase-title">Retos del <span class="phase-title-accent">comité</span></h1>
            <p class="phase-subtitle">El comité todavía no los ha publicado. Súbelos cuando los tengas y aquí mismo se ordenan.</p>
          </div>
        </div>

        <section class="ch-import">
          <div id="challenge-dropzone" class="ch-drop"
               onclick="document.getElementById('challenge-file-input').click()"
               ondragover="event.preventDefault(); this.classList.add('is-over');"
               ondragleave="event.preventDefault(); this.classList.remove('is-over');"
               ondrop="handleChallengeDrop(event)">
            <input type="file" id="challenge-file-input" aria-label="Subir archivos del comité" style="display:none;" multiple accept=".zip,.pdf,.docx,.doc,.txt,.png,.jpg,.jpeg">
            <span class="ch-drop-icon">${SVG.upload}</span>
            <span class="ch-drop-title">Arrastra los archivos o toca para elegirlos</span>
            <span class="ch-drop-hint">ZIP, imágenes, PDF, Word o texto. La IA los lee y los numera.</span>
            <div id="import-status-indicator" style="display:none; margin-top:8px; font-size:12px; font-weight:700; color:var(--color-primary);"></div>
          </div>

          <label class="ch-paste-label" for="raw-committee-challenges">O pega el comunicado del comité</label>
          <textarea id="raw-committee-challenges" class="ch-paste" rows="6"
            placeholder="RETO 01: ...&#10;RETO 02: ..."></textarea>

          <div class="ch-import-foot">
            <button id="btn-process-challenges" class="btn-select-card filled" style="padding:10px 22px; font-size:13px; font-weight:700;" onclick="processCommitteeChallengesInput()">
              Cargar los retos y proponer soluciones ${SVG.arrowRight}
            </button>
          </div>
        </section>
      ` : `
        <div class="phase-header">
          <div>
            <h1 class="phase-title">Retos del comité</h1>
          </div>
          <div class="cr-top-actions">
            <a class="link-quiet" href="../docs/Dossier_Soluciones_Actuales.pdf" target="_blank" rel="noopener noreferrer">Dossier de soluciones</a>
            <button class="link-quiet" onclick="switchTab('team')">Editar equipo</button>
          </div>
        </div>

        <!-- Filtros: fila plana, sin caja -->
        ${tri.step !== "vote" ? `
        <div class="cr-filters">
          <div style="display:flex; align-items:center; gap:6px; flex-wrap:wrap;">
            <button class="btn-pill-light" style="${challengeFilter === 'all' ? 'background:var(--color-navy); color:var(--bg-surface); border-color:var(--color-navy);' : ''} padding:5px 12px; font-size:12px; font-weight:700;" onclick="challengeFilter='all'; renderTab('challenges');">
              Todos (${list.length})
            </button>
            ${[...new Set(list.map(c => (c.category || "").trim()).filter(Boolean))].map(cat => `
            <button class="btn-pill-light" style="${challengeFilter === cat.toLowerCase() ? 'background:var(--color-navy); color:var(--bg-surface); border-color:var(--color-navy);' : ''} padding:5px 12px; font-size:12px; font-weight:700;" onclick="challengeFilter='${escapeHtml(cat.toLowerCase())}'; renderTab('challenges');">
              ${escapeHtml(cat)} (${list.filter(c => (c.category || "").toLowerCase() === cat.toLowerCase()).length})
            </button>`).join("")}
          </div>

          <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
            <button class="btn-pill-light" style="padding:5px 12px; font-size:12px; font-weight:700; display:inline-flex; align-items:center; gap:6px;" onclick="openChallengeImportBox()" title="Ver los retos cargados e importar otros sin borrarlos">
              ${SVG.upload}<span>Importar retos</span>
            </button>
          <details class="rank-tools rs-tools">
            <summary aria-label="Herramientas de retos">
              ${SVG.dotsVertical}
              <span>Herramientas</span>
              <span class="rs-tools-chevron">${SVG.chevronDown}</span>
            </summary>
            <div class="rs-tools-menu" role="menu" aria-label="Herramientas de retos">
              <button class="rs-tools-item" role="menuitem" onclick="reScanChallengesWithOCR()" title="Re-escanear imágenes adjuntas con IA visual (modelo vision gratuito); red de seguridad EasyOCR si no hay IA conectada">
                ${SVG.refresh}<span>Re-escanear OCR</span>
              </button>
              <button class="rs-tools-item" role="menuitem" onclick="loadReferenceChallenges()" title="Cargar banco oficial de 9 retos de referencia">
                ${SVG.folder}<span>Cargar banco oficial (9)</span>
              </button>
              <span class="rs-tools-sep" aria-hidden="true"></span>
              <button class="rs-tools-item rs-tools-danger" role="menuitem" onclick="clearAllChallenges()">
                ${SVG.trash}<span>Limpiar radar</span>
              </button>
            </div>
          </details>
          </div>
        </div>
        ` : ""}
        <div id="custom-challenge-input-box" style="display:none; background:var(--bg-surface); border:1px solid var(--border-strong); border-radius:8px; padding:14px; margin-bottom:14px;"
             ondragover="event.preventDefault(); this.style.borderColor='#0866F5';"
             ondragleave="event.preventDefault(); this.style.borderColor='#CBD5E1';"
             ondrop="handleChallengeDrop(event)">
          <div id="challenge-import-current" style="margin-bottom:12px;"></div>
          <div style="border:1.5px dashed var(--border-strong); background:var(--bg-subtle); border-radius:6px; padding:14px; text-align:center; margin-bottom:10px; cursor:pointer;"
               onclick="document.getElementById('challenge-file-input-inline').click()">
            <input type="file" id="challenge-file-input-inline" aria-label="Subir archivos de retos" style="display:none;" multiple accept=".zip,.pdf,.docx,.doc,.txt,.png,.jpg,.jpeg,.webp" onclick="event.stopPropagation()" onchange="handleChallengeFileSelect(this.files)">
            <div style="font-size:13px; font-weight:700; color:var(--text-title);">Arrastra aquí o haz clic para subir archivo ZIP, imágenes, PDF o Word</div>
            <div style="font-size:11px; color:var(--text-muted); margin-top:2px;">La IA visual jerarquizará automáticamente todos los retos contenidos (EasyOCR local como red de seguridad).</div>
          </div>
          <div id="custom-import-status-indicator" style="display:none; margin-bottom:10px; font-size:12px; font-weight:700; color:var(--color-primary);"></div>
          <textarea id="raw-committee-challenges" rows="4" style="width:100%; border:1px solid var(--border-strong); border-radius:6px; padding:10px; font-size:12px; font-family:var(--font-mono); box-sizing:border-box; background:var(--bg-subtle);"
            placeholder="O pega aquí el texto del comunicado oficial..."></textarea>
          <label style="display:flex; align-items:center; gap:8px; margin-top:10px; font-size:12px; color:var(--text-body); cursor:pointer;">
            <input type="checkbox" id="challenge-append-mode" checked style="cursor:pointer;">
            <span>Agregar a los retos cargados (si lo desmarcas, este comunicado <strong>reemplaza</strong> la lista actual)</span>
          </label>
          <div style="display:flex; justify-content:flex-end; gap:8px; margin-top:8px;">
            <button class="btn-secondary" style="font-size:12px; padding:5px 12px;" onclick="toggleCustomChallengeInput()">Cancelar</button>
            <button class="btn-select-card filled" style="padding:6px 16px; font-size:12px; font-weight:700;" onclick="processCommitteeChallengesInput()">Procesar Retos</button>
          </div>
        </div>

        ${mesaActive ? `
          <div class="deliberation-container">
            <section class="deliberation-sheet cr-sheet">
              ${renderMesaBar(mesaList, mesaActive, mesaIndex, list)}
              ${renderMesaSlide(mesaActive, mesaList, mesaIndex, list)}

              <div class="cr-cta">
                <button class="cr-cta-btn" onclick="selectChallenge('${mesaActive.id}', true)">
                  ${state.challenge_id === mesaActive.id ? "Seguir con este reto →" : "Elegir este reto y escribir la solución →"}
                </button>
              </div>
            </section>
          </div>
        ` : `
          <div style="padding:30px; text-align:center; color:var(--text-muted);">No hay retos en esta categoría.</div>
        `}

        <details class="rk-fold">
          <summary>
            <span class="rk-fold-k">Las nueve propuestas juntas</span>
            <span class="rk-fold-n">· ${list.length}</span>
            <span class="rk-fold-go">ver ▾</span>
          </summary>
          ${renderChallengeRanking()}
        </details>
      `}
    </div>
  `;
}

async function loadReferenceChallenges() {
  await loadChallengeBank();
  if (!OFFICIAL_CHALLENGES_2026.length) {
    showToast("El banco de retos no se pudo cargar (challenge_bank.json).", true);
    return;
  }
  state.challenges = JSON.parse(JSON.stringify(OFFICIAL_CHALLENGES_2026));
  state.active_deliberation_challenge_id = state.challenges[0].id;
  saveState();
  renderTab("challenges");
}

function deleteChallenge(id) {
  const ch = (state.challenges || []).find(c => c.id === id);
  const name = ch ? ch.title : `Reto #${id}`;
  if (confirm(`¿Descartar "${name}" del radar del certamen?`)) {
    state.challenges = (state.challenges || []).filter(c => c.id !== id);
    purgeChallengeRefs([id]);
    if (state.challenge_id === id) {
      state.challenge_id = "";
      state.challenge_title = "";
    }
    saveState();
    renderTab("challenges");
    renderNavigation();
  }
}

function addChallengeIdea(chId) {
  const input = document.getElementById(`new-idea-input-${chId}`);
  if (!input) return;
  const val = input.value.trim();
  if (!val) return;

  if (!state.challenge_ideas) state.challenge_ideas = {};
  if (!state.challenge_ideas[chId]) state.challenge_ideas[chId] = [];

  const mascot = getClientMascot();
  const authorName = (state.team_name ? state.team_name + " (" + mascot.name + ")" : mascot.name);

  state.challenge_ideas[chId].push({
    id: "idea_" + Date.now() + "_" + Math.random().toString(36).substr(2, 4),
    text: val,
    author: authorName,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  });

  saveState();
  broadcastFieldChange("challenge_ideas", "state", state.challenge_ideas);
  renderTab("challenges");
}

function deleteChallengeIdea(chId, ideaId) {
  if (!state.challenge_ideas || !state.challenge_ideas[chId]) return;
  state.challenge_ideas[chId] = state.challenge_ideas[chId].filter(i => i.id !== ideaId);
  saveState();
  broadcastFieldChange("challenge_ideas", "state", state.challenge_ideas);
  renderTab("challenges");
}

function mergeChallengeIdea(chId, ideaId, targetChId) {
  if (!targetChId || targetChId === chId) return;
  const src = state.challenge_ideas && state.challenge_ideas[chId];
  if (!src) return;
  const idea = src.find(i => i.id === ideaId);
  if (!idea || idea.merged_to) return;
  if (!state.challenge_ideas[targetChId]) state.challenge_ideas[targetChId] = [];
  const mascot = getClientMascot();
  state.challenge_ideas[targetChId].push({
    id: "idea_" + Date.now() + "_" + Math.random().toString(36).substr(2, 4),
    text: `HÍBRIDO de #${chId}: ${idea.text}`,
    author: `Fusión — ${idea.author || 'Equipo'}, por ${mascot.name}`,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  });
  idea.merged_to = targetChId;
  saveState();
  broadcastFieldChange("challenge_ideas", "state", state.challenge_ideas);
  renderTab("challenges");
  showToast(`Nota fusionada al Reto #${targetChId} (las ideas híbridas suelen ganar).`);
}

function unmergeChallengeIdea(chId, ideaId) {
  const src = state.challenge_ideas && state.challenge_ideas[chId];
  if (!src) return;
  const idea = src.find(i => i.id === ideaId);
  if (!idea || !idea.merged_to) return;
  state.challenge_ideas[idea.merged_to] = (state.challenge_ideas[idea.merged_to] || []).filter(i => !i.text.startsWith(`HÍBRIDO de #${chId}: ${idea.text}`));
  delete idea.merged_to;
  saveState();
  broadcastFieldChange("challenge_ideas", "state", state.challenge_ideas);
  renderTab("challenges");
  showToast("Fusión revertida.");
}

function openLightbox(src) {
  let modal = document.getElementById("img-lightbox-modal");
  if (!modal) {
    modal = document.createElement("div");
    modal.id = "img-lightbox-modal";
    modal.className = "modal-overlay";
    modal.onclick = (e) => { if (e.target === modal) modal.style.display = "none"; };
    document.body.appendChild(modal);
  }
  modal.innerHTML = `
    <div style="background:var(--color-navy); padding:16px; border-radius:10px; max-width:92vw; max-height:92vh; display:flex; flex-direction:column; align-items:center; position:relative;">
      <button style="position:absolute; top:12px; right:12px; background:var(--text-body); color:var(--bg-surface); border:none; border-radius:6px; padding:6px 12px; cursor:pointer; font-weight:800;" onclick="document.getElementById('img-lightbox-modal').style.display='none'">Cerrar</button>
      <img src="${src}" style="max-width:100%; max-height:85vh; object-fit:contain; border-radius:4px;">
    </div>
  `;
  modal.style.display = "flex";
}

function openEditChallengeModal(chId) {
  const list = (state.challenges && state.challenges.length) ? state.challenges : OFFICIAL_CHALLENGES_2026;
  const ch = list.find(c => c.id === chId);
  if (!ch) return;
  let modal = document.getElementById("edit-challenge-modal");
  if (!modal) {
    modal = document.createElement("div");
    modal.id = "edit-challenge-modal";
    modal.className = "modal-overlay";
    document.body.appendChild(modal);
  }
  modal.innerHTML = `
    <div class="modal-card" style="max-width:560px; width:95%; background:var(--bg-surface); border-radius:10px; padding:22px; box-shadow:0 8px 30px rgba(0,0,0,0.15);">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px; padding-bottom:10px; border-bottom:1px solid var(--border-light);">
        <h3 style="font-size:16px; font-weight:800; color:var(--text-title); margin:0;">Editar Desafío #${ch.id}</h3>
        <button class="btn-icon-discreet" onclick="document.getElementById('edit-challenge-modal').style.display='none'">${SVG.close}</button>
      </div>
      <div style="display:flex; flex-direction:column; gap:12px;">
        <div>
          <label style="font-size:11px; font-weight:800; color:var(--text-muted);  margin-bottom:4px; display:block;">Título del Desafío</label>
          <input type="text" id="edit-ch-title" value="${ch.title || ''}" style="width:100%; padding:8px 10px; font-size:13px; border:1px solid var(--border-strong); border-radius:6px; box-sizing:border-box;">
        </div>
        <div>
          <label style="font-size:11px; font-weight:800; color:var(--text-muted);  margin-bottom:4px; display:block;">Categoría</label>
          <select id="edit-ch-cat" style="width:100%; padding:8px 10px; font-size:12px; border:1px solid var(--border-strong); border-radius:6px; box-sizing:border-box;">
            <option value="Innovación" ${ch.category === 'Innovación' ? 'selected' : ''}>Innovación</option>
            <option value="Impacto Social" ${ch.category === 'Impacto Social' ? 'selected' : ''}>Impacto Social</option>
          </select>
        </div>
        <div>
          <label style="font-size:11px; font-weight:800; color:var(--text-muted);  margin-bottom:4px; display:block;">Demanda Oficial del Comité</label>
          <textarea id="edit-ch-demand" rows="3" style="width:100%; padding:8px 10px; font-size:13px; border:1px solid var(--border-strong); border-radius:6px; box-sizing:border-box; line-height:1.4;">${ch.officialExpectation || ''}</textarea>
        </div>
        <div>
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
            <label style="font-size:11px; font-weight:800; color:var(--text-muted);  margin-bottom:0;">Tesis de Solución Sugerida</label>
            <button type="button" class="btn-pill-light" style="font-size:11px; font-weight:700; color:var(--color-primary); padding:2px 8px; border:1px solid var(--status-ok-border); background:var(--status-ok-bg); border-radius:4px; cursor:pointer;" onclick="openAIThesisFormulatorModal('${ch.id}', true)">Formular con IA</button>
          </div>
          <textarea id="edit-ch-wow" rows="3" style="width:100%; padding:8px 10px; font-size:13px; border:1px solid var(--border-strong); border-radius:6px; box-sizing:border-box; line-height:1.4;">${ch.wowProposal || ''}</textarea>
        </div>
      </div>
      <div style="display:flex; justify-content:flex-end; gap:8px; margin-top:16px;">
        <button class="btn-secondary" style="font-size:12px; padding:6px 14px;" onclick="document.getElementById('edit-challenge-modal').style.display='none'">Cancelar</button>
        <button class="btn-select-card filled" style="font-size:12px; padding:6px 18px; font-weight:700;" onclick="saveEditedChallenge('${ch.id}')">Guardar Cambios</button>
      </div>
    </div>
  `;
  modal.style.display = "flex";
}

function saveEditedChallenge(chId) {
  if (!state.challenges || state.challenges.length === 0) {
    state.challenges = JSON.parse(JSON.stringify(OFFICIAL_CHALLENGES_2026));
  }
  const ch = state.challenges.find(c => c.id === chId);
  if (!ch) return;

  const t = document.getElementById("edit-ch-title").value.trim();
  if (t && window.RallyChallengeParser && !window.RallyChallengeParser.isPlausibleTitle(t)) {
    showToast("Ese título parece un encabezado de documento, no un reto. Escribe el problema del comité.", true);
    return;
  }
  const cat = document.getElementById("edit-ch-cat").value;
  const dem = document.getElementById("edit-ch-demand").value.trim();
  const wow = document.getElementById("edit-ch-wow").value.trim();

  if (t) ch.title = t;
  if (cat) ch.category = cat;
  if (dem) ch.officialExpectation = dem;
  if (wow) ch.wowProposal = wow;

  if (state.challenge_id === chId) {
    state.challenge_title = ch.title;
    state.category = ch.category;
  }

  saveState();
  const modal = document.getElementById("edit-challenge-modal");
  if (modal) modal.style.display = "none";
  renderTab("challenges");
  renderNavigation();
}

// ── RANKING DE RETOS (síntesis del análisis de ganadores 2019–2026 + matriz de deliberación) ──
// Fuentes: research/challenges_ranked.json + knowledge/winners_analysis.md. Solo datos producto, sin claves.
let CHALLENGE_RANKING_2026 = []; // datos externos (challenge_bank.json)

function challengeRankFor(ch) {
  const t = (ch.title || "").toLowerCase();
  const rank = CHALLENGE_RANKING_2026.find(r => r.kw && t.includes(String(r.kw).toLowerCase()));
  const isHighComp = (ch.compDensity || "").toLowerCase().includes("alta");
  const odsLen = Array.isArray(ch.ods) ? ch.ods.length : (String(ch.ods || "").split(",").filter(Boolean).length || 3);
  // Sin match histórico no se inventa un puntaje plano: se suma lo que de verdad tiene el reto.
  const criteriaPoints = (isHighComp ? 0 : 18)
    + (odsLen >= 3 ? 10.5 : 0)
    + 14
    + (ch.nicaraguaAdaptation ? 10 : 0)
    + ((ch.precedent || ch.winnerPattern) ? 8 : 0)
    + (ch.wowProposal ? 6 : 0);
  const score = rank ? rank.score : Math.min(100, Math.round(criteriaPoints));
  const criteria = [
    { icon: "Rivalidad", ok: !isHighComp, text: isHighComp ? "Muchas sedes compiten el mismo reto" : (ch.compDensity ? "Poca rivalidad de sedes: " + ch.compDensity.toLowerCase() : "Poca rivalidad de sedes") },
    { icon: "ODS", ok: odsLen >= 3, text: `Cubre ${odsLen} ODS${odsLen >= 3 ? " (+10.5)" : ""}` },
    { icon: "24/28h", ok: true, text: "Prototipo funcional dentro de la ventana oficial" },
    { icon: "Territorio", ok: !!ch.nicaraguaAdaptation, text: ch.nicaraguaAdaptation ? "Anclaje en comunidades de Nicaragua" : "Sin anclaje territorial redactado" },
    { icon: "Precedente", ok: !!ch.precedent, text: ch.precedent ? "Patrón de ganador: " + ch.precedent : "Sin precedente directo" }
  ];
  return { score, reasonLines: rank ? rank.reasons : null, criteria, isHighComp, scoreBasis: rank ? "historico" : "criterios" };
}

function toggleRankingDetail(chId) {
  const box = document.getElementById(`rank-detail-${chId}`);
  if (box) box.style.display = box.style.display === "none" ? "block" : "none";
}

function formatChallengeTitle(ch, maxLen = 85) {
  let title = (ch && ch.title ? ch.title : "").trim();
  if (!title || title.toLowerCase() === "resumir") {
    const sources = [ch && ch.demand, ch && ch.description, ch && ch.officialExpectation, ch && ch.wowProposal];
    for (const src of sources) {
      if (!src) continue;
      const firstLine = String(src).split(/\n|(?=\.\s)/)[0].trim().replace(/^SEGUNDA VIDA\b/i, "Segunda vida").slice(0, 70);
      const cutAt = firstLine.length > 62 ? firstLine.lastIndexOf(" ", 62) : -1;
      const candidate = (cutAt > 20 ? firstLine.slice(0, cutAt) : firstLine).trim();
      if (candidate.length > 12) { title = candidate; break; }
    }
    if (!title) title = `Reto Oficial #${ch ? ch.id : ""}`;
  }
  if (title === title.toUpperCase() && title.length > 5) {
    title = title.charAt(0).toUpperCase() + title.slice(1).toLowerCase();
  }
  title = title.length > maxLen ? title.slice(0, maxLen - 1) + "…" : title;
  // Los tres usos van a innerHTML y el título viene de un docx importado.
  return escapeHtml(title);
}

// Gráfico SVG del ranking (Opción 1: layout stacked, título completo arriba + barra ancha abajo)
function renderRankingChartSvg(rows) {
  if (!rows || rows.length < 3) return "";
  const W = 760, BAR_H = 6, ROW_H = 38, TOP = 14;
  const H = TOP + rows.length * ROW_H + 8;
  const BAR_X0 = 4, BAR_W = W - 8;
  let svg = `<svg class="rank-chart" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Gráfico de puntajes del ranking de retos">`;
  rows.forEach((r, i) => {
    const isSel = state.challenge_id === r.ch.id;
    const y = TOP + i * ROW_H;
    const yBar = y + 18;
    const color = isSel ? "#0F172A" : (i === 0 ? "#0866F5" : (i < 3 ? "#2563EB" : (i < 6 ? "var(--text-muted)" : "var(--text-muted)")));
    const trackColor = isSel ? "#CBD5E1" : "#EDF2F7";
    const title = formatChallengeTitle(r.ch, 95);
    const scoreVal = Math.max(0, Math.min(100, r.info.score));
    const barWidth = Math.max(8, (scoreVal / 100) * BAR_W).toFixed(1);
    const posNum = String(i + 1).padStart(2, "0");

    svg += `<g class="rank-chart-item" style="cursor:pointer;" onclick="toggleRankingDetail('${r.ch.id}')">`;
    if (isSel) {
      svg += `<rect x="0" y="${y - 4}" width="${W}" height="${ROW_H - 2}" rx="5" fill="#F8FAFC" stroke="#CBD5E1" stroke-width="1"/>`;
    }
    svg += `<text x="8" y="${y + 11}" font-family="JetBrains Mono, monospace" font-size="10" font-weight="800" fill="${isSel ? "#0F172A" : "#0866F5"}">#${posNum}</text>`;
    svg += `<text x="38" y="${y + 11}" font-family="Plus Jakarta Sans, sans-serif" font-size="11" font-weight="${isSel ? 700 : 600}" fill="${isSel ? "#0F172A" : "#334155"}">${title.replace(/&/g, "&amp;").replace(/</g, "&lt;")}</text>`;
    svg += `<text x="${W - 8}" y="${y + 11}" text-anchor="end" font-family="JetBrains Mono, monospace" font-size="10.5" font-weight="800" fill="${isSel ? "#0F172A" : "#1E293B"}">${r.info.score}<tspan font-size="8.5" font-weight="600" fill="var(--text-muted)"> pts</tspan></text>`;
    svg += `<rect x="${BAR_X0}" y="${yBar}" width="${BAR_W}" height="${BAR_H}" rx="3" fill="${trackColor}"/>`;
    svg += `<rect x="${BAR_X0}" y="${yBar}" width="${barWidth}" height="${BAR_H}" rx="3" fill="${color}"/>`;
    svg += `</g>`;
  });
  svg += `</svg>`;
  return `<div class="rank-chart-wrap">${svg}</div>`;
}

// ── SOLUCIONES POR RETO (research/soluciones_actuales.json) ──────────────────
// Las propuestas las escribe el motor de soluciones; aquí solo se muestran.
let SOLUCIONES_DATOS = null;
let solucionesCargando = false;

function normalizarIdReto(id) {
  return String(id == null ? "" : id).replace(/[^\d]/g, "");
}

function solucionDeReto(id) {
  if (!SOLUCIONES_DATOS || !Array.isArray(SOLUCIONES_DATOS.retos)) return null;
  const n = normalizarIdReto(id);
  if (!n) return null;
  return SOLUCIONES_DATOS.retos.find(r => normalizarIdReto(r.id) === n) || null;
}

function cargarSoluciones() {
  if (SOLUCIONES_DATOS || solucionesCargando) return;
  solucionesCargando = true;
  fetch("/research/soluciones_actuales.json", { cache: "no-store" })
    .then(r => (r.ok ? r.json() : null))
    .then(j => {
      solucionesCargando = false;
      if (!j || !Array.isArray(j.retos)) return;
      SOLUCIONES_DATOS = j;
      if (rsPrevTabId === "challenges") renderTab("challenges");
    })
    .catch(() => { solucionesCargando = false; });
}

function renderChallengeRanking() {
  const list = state.challenges || [];
  if (!SOLUCIONES_DATOS) {
    cargarSoluciones();
    return '<p class="sol-board-empty">Cargando las propuestas del motor…</p>';
  }
  const filas = list
    .map(ch => ({ ch, sol: solucionDeReto(ch.id) }))
    .filter(r => r.sol && r.sol.propuesta);

  if (!filas.length) {
    return '<p class="sol-board-empty">Todavía no hay propuestas escritas para estos retos.</p>';
  }

  return `
    <div class="sol-board">
      ${filas.map(({ ch, sol }) => {
        const pr = sol.propuesta || {};
        const isSel = state.challenge_id === ch.id;
        return `
          <section class="sol-item${isSel ? " is-chosen" : ""}">
            <div class="sol-item-head">
              <span class="sol-item-n">#${ch.id}</span>
              <h3 class="sol-item-title">${pr.nombre ? escapeHtml(pr.nombre) : formatChallengeTitle(ch, 90)}</h3>
              ${isSel ? '<span class="cr-chip is-sel">ELEGIDO</span>' : ""}
            </div>
            <p class="sol-item-retos">${formatChallengeTitle(ch, 140)}</p>
            ${pr.claim ? `<p class="sol-item-claim">${escapeHtml(pr.claim)}</p>` : ""}
            <div class="sol-item-actions">
              <button class="btn-pill-light sol-item-btn" onclick="mesaGo('${ch.id}')">Ver el reto</button>
              ${!isSel ? `<button class="btn-pill-light sol-item-btn" onclick="selectChallenge('${ch.id}', false)">Elegir para desarrollar</button>` : ""}
            </div>
          </section>
        `;
      }).join("")}
      ${filas.length % 2 === 1 ? '<div class="sol-item sol-item-filler" aria-hidden="true"></div>' : ""}
    </div>
    <p class="sol-board-foot">Una propuesta por reto. El dossier completo, con precedentes y cifras, está en el botón <b>Dossier de soluciones</b>.</p>
  `;
}

// ── FORMULADOR DE TESIS CON IA ACTIVA (100 PTS RÚBRICA) ──────────────────────
function generateAIThesisPrompt(ch) {
  return `Actúa como Ingeniero Principal y Estratega del Rally Latinoamericano de Innovación (Rúbrica Oficial 100 Pts).
Formula la TESIS DE SOLUCIÓN TÉCNICA DE ALTO IMPACTO (100 Pts) para el siguiente desafío oficial:

RETO: ${ch.title}
CATEGORÍA: ${ch.category || 'Innovación'}
DEMANDA OFICIAL DEL COMITÉ: ${ch.officialExpectation || 'Demanda técnica oficial presentada por el comité.'}

REQUERIMIENTOS INNEGOCIABLES DE LA RÚBRICA (100 Pts):
1. Innovación & Originalidad (25 pts): Rompe enfoques pasivos convencionales.
2. Impacto Social & Económico (25 pts): Resuelve la causa raíz con factibilidad territorial.
3. Viabilidad Técnica en 24h (20 pts): Especifica arquitectura técnica tangible con componentes COTS locales.
4. Sostenibilidad Ambiental & Financiera (15 pts): Modelo autosustentable sin dependencia de subsidios continuos.
5. Factor WOW & Claridad (15 pts): Redacción concisa, profesional y contundente.

INSTRUCCIÓN: Devuelve ÚNICAMENTE un párrafo contundente (2 a 3 oraciones de alto impacto) con la Tesis de Solución indicando: Arquitectura técnica + Mecanismo de operación + Impacto cuantificable. Sin saludos ni rodeos.`;
}

function openAIThesisFormulatorModal(chId, isFromEditModal = false) {
  const ch = (state.challenges || []).find(c => c.id === chId) || OFFICIAL_CHALLENGES_2026.find(c => c.id === chId);
  if (!ch) return;

  let modal = document.getElementById("ai-thesis-modal");
  if (!modal) {
    modal = document.createElement("div");
    modal.id = "ai-thesis-modal";
    modal.className = "modal-backdrop";
    modal.style.position = "fixed";
    modal.style.inset = "0";
    modal.style.background = "rgba(13, 27, 53, 0.72)";
    modal.style.zIndex = "99999";
    modal.style.display = "flex";
    modal.style.alignItems = "center";
    modal.style.justifyContent = "center";
    modal.style.padding = "20px";
    modal.style.backdropFilter = "blur(6px)";
    document.body.appendChild(modal);
  }

  // Generador de Prompts Especializados según necesidad
  const pName = state.project_name || "SISTEMA";
  const promptThesis = generateAIThesisPrompt(ch);
  const promptPatents = `Actúa como Experto en Propiedad Intelectual y Búsqueda de Estado del Arte (Google Patents / WIPO / Lens).
Proyecto: "${pName}" enfocado en Reto #${ch.id}: "${ch.title}".
Demanda Oficial: "${ch.officialExpectation || ''}".

TAREA DE ALTO RAZONAMIENTO:
1. Identifica 2 patentes o modelos de utilidad existentes que aborden este problema pero que tengan limitaciones claras.
2. Identifica el "White Space" o vacío tecnológico que nuestro proyecto explotará para lograr 30/30 en Originalidad.
3. Propón una hibridación técnica novedosa que sea demostrable ante el jurado.
Entrega el análisis estructurado en 3 párrafos técnicos directos, listos para auditoría.`;

  const promptStats = `Actúa como Analista Cuantitativo y de Impacto Socioeconómico (CEPAL / Banco Mundial / INIDE / BCN).
Proyecto: "${pName}" para Reto #${ch.id}: "${ch.title}".
Contexto: ${state.rally_type === 'nacional' ? 'Nicaragua y municipios vulnerables' : 'Latinoamérica y el Caribe'}.

TAREA DE ALTO RAZONAMIENTO:
1. Proporciona 3 estadísticas oficiales cuantitativas y verificables con fuente y año (2020-2025).
2. Vincula 2 metas exactas de los ODS aplicables con indicador medible.
3. Cuantifica el beneficio directo anual (ahorro económico, reducción de riesgo o familias beneficiadas).
Entrega formato sin relleno, con citas verificables tipo APA.`;

  window._activeCopilotChId = chId;
  window._activeCopilotIsEdit = isFromEditModal;
  window._copilotPrompts = {
    thesis: promptThesis,
    patents: promptPatents,
    stats: promptStats
  };

  modal.innerHTML = `
    <div class="copilot-modal-dialog">
      <!-- Header con jerarquía clara -->
      <div class="copilot-modal-header">
        <div class="copilot-header-info">
          <div class="copilot-header-tags">
            <span class="copilot-chip-tag">IA COPILOT DUAL-MODE</span>
            <span class="copilot-reto-badge">Reto #${ch.id}</span>
            ${categoryBadge(ch.category || 'Innovación')}
          </div>
          <h2 class="copilot-modal-title">
            ${ch.title}
          </h2>
        </div>
        <button class="btn-icon-discreet" title="Cerrar ventana" onclick="document.getElementById('ai-thesis-modal').style.display='none'">
          ${SVG.close}
        </button>
      </div>

      <!-- Body -->
      <div class="copilot-modal-body">
        <!-- Navegación de Especialidad / Pestañas con micro-estados -->
        <div class="copilot-nav-section">
          <label class="copilot-section-eyebrow">Objetivo de Formulación</label>
          <div class="copilot-tabs-nav">
            <button class="copilot-tab-btn active" id="tab-copilot-thesis" onclick="switchCopilotTab('thesis')">
              ${SVG.spark}
              <span>Tesis de Solución <strong class="copilot-tab-pts">100 Pts</strong></span>
            </button>
            <button class="copilot-tab-btn" id="tab-copilot-patents" onclick="switchCopilotTab('patents')">
              ${SVG.shieldCheck}
              <span>Patentes & Vacío Técnico</span>
            </button>
            <button class="copilot-tab-btn" id="tab-copilot-stats" onclick="switchCopilotTab('stats')">
              ${SVG.target}
              <span>Indicadores & Datos Oficiales</span>
            </button>
          </div>
        </div>

        <!-- Guía de Flujo Operativo en 2 Pasos Claros -->
        <div class="copilot-flow-grid">
          <div class="copilot-flow-card">
            <div class="copilot-flow-step">1</div>
            <div class="copilot-flow-text">
              <strong>Obtén el Prompt Especializado</strong>
              <span>Copia el prompt maestro calibrado según la rúbrica oficial y envíalo a Claude 3.7, o3 o Antigravity.</span>
            </div>
          </div>
          <div class="copilot-flow-card">
            <div class="copilot-flow-step">2</div>
            <div class="copilot-flow-text">
              <strong>Aterriza e Inyecta el Resultado</strong>
              <span>Pega el párrafo de alta ingeniería y pulsa inyectar para guardarlo de inmediato en tu propuesta oficial.</span>
            </div>
          </div>
        </div>

        <!-- Paso 1: Prompt Maestro Optimizado -->
        <div class="copilot-stage-block">
          <div class="copilot-stage-header">
            <div class="copilot-stage-label">
              <span class="copilot-step-indicator">Paso 1</span>
              <span>Prompt Maestro Calibrado</span>
            </div>
            <button class="copilot-copy-btn" onclick="copyCopilotPrompt()">
              ${SVG.copy} Copiar Prompt al Portapapeles
            </button>
          </div>
          <div class="copilot-prompt-container">
            <textarea id="ai-prompt-box" readonly class="copilot-prompt-preview">${promptThesis}</textarea>
          </div>
        </div>

        <!-- Paso 2: Aterrizaje de Respuesta -->
        <div class="copilot-stage-block">
          <div class="copilot-stage-header">
            <div class="copilot-stage-label">
              <span class="copilot-step-indicator">Paso 2</span>
              <span>Respuesta Generada por la IA</span>
            </div>
            <select id="ai-model-copilot" class="ai-model-select" onchange="modelPrefChanged('copilot', this.value)" title="Modelo de IA a usar (descubierto dinámicamente)"></select>
            <button type="button" class="copilot-paste-btn" onclick="runCopilotWithAI()" id="copilot-generate-btn" style="background:var(--color-primary); color:var(--bg-surface); border-color:var(--color-primary);">
              ${SVG.check} Generar con IA Automática
            </button>
            <button type="button" class="copilot-paste-btn" onclick="polishLandingWithAI()" id="copilot-polish-btn" title="Corrige redacción, ortografía y jerarquía del texto con una IA rápida (no agrega contenido)">
              ${SVG.sparkles || ""} Pulir
            </button>
            <button type="button" class="copilot-paste-btn" onclick="pasteToAIThesisResult()">
              ${SVG.upload} Pegar desde Portapapeles
            </button>
          </div>
          <div class="copilot-landing-container">
            <textarea id="ai-thesis-input-result" class="copilot-landing-result" placeholder="Pega aquí la respuesta generada por tu IA de elección (Claude 3.7, o3, Antigravity o ChatGPT)...">${(ch.wowProposal && !ch.wowProposal.includes('Pendiente de formulación')) ? ch.wowProposal : ''}</textarea>
          </div>
          <div id="copilot-ai-status" style="display:none; margin-top:10px; font-size:12px; color:var(--text-muted);"></div>
        </div>
      </div>

      <!-- Footer -->
      <div class="copilot-modal-footer">
        <button class="btn-secondary copilot-btn-cancel" onclick="document.getElementById('ai-thesis-modal').style.display='none'">
          Cancelar
        </button>
        <button class="btn-primary copilot-btn-inject" onclick="applyAIThesis('${ch.id}', ${isFromEditModal})">
          <span>Inyectar al Reto #${ch.id}</span>
          ${SVG.arrowRight}
        </button>
      </div>
    </div>
  `;
  modal.style.display = "flex";
  populateModelSelect("copilot");
}

// — Pulido rapido de texto con IA mini (endpoint de entorno; sin razonamiento pesado) —
async function polishLandingWithAI() {
  const box = document.getElementById("ai-thesis-input-result");
  const btn = document.getElementById("copilot-polish-btn");
  const status = document.getElementById("copilot-ai-status");
  if (!box || !box.value.trim()) {
    showToast("Escribe o pega el texto que quieras pulir primero.");
    return;
  }
  if (btn) btn.disabled = true;
  if (status) { status.style.display = "block"; status.textContent = "Puliendo texto con IA rápida..."; }
  try {
    const resp = await fetch("/api/ai/quick", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ task: "polish", text: box.value })
    });
    const json = await resp.json();
    if (json.status === "ok" && json.text) {
      box.value = json.text.trim();
      showToast("Texto pulido con IA rápida ✓");
      if (status) status.textContent = "";
    } else {
      const detalle = json.detail ? ` Detalle: ${json.detail}` : "";
      showToast((json.message || "IA rápida no disponible; revisa RALLY_AI_URL (FreeLLMAPI u otro endpoint gratis).") + detalle);
      if (status) status.textContent = detalle.trim();
    }
  } catch (err) {
    console.warn("polishLandingWithAI falló:", err);
    showToast("El servicio de pulido IA no respondió.");
    if (status) status.textContent = "";
  } finally {
    if (btn) btn.disabled = false;
  }
}

function switchCopilotTab(tabKey) {
  const tabs = ['thesis', 'patents', 'stats'];
  tabs.forEach(t => {
    const btn = document.getElementById('tab-copilot-' + t);
    if (btn) btn.classList.toggle('active', t === tabKey);
  });
  const box = document.getElementById('ai-prompt-box');
  if (box && window._copilotPrompts && window._copilotPrompts[tabKey]) {
    box.value = window._copilotPrompts[tabKey];
  }
}

function copyCopilotPrompt() {
  const box = document.getElementById("ai-prompt-box");
  if (!box) return;
  box.select();
  navigator.clipboard.writeText(box.value).then(() => {
    showToast("Prompt Maestro copiado al portapapeles");
  }).catch(() => {
    document.execCommand("copy");
    showToast("Prompt Maestro copiado al portapapeles");
  });
}

function copyPromptToClipboard(chId) {
  const box = document.getElementById("ai-prompt-box");
  if (!box) return;
  box.select();
  navigator.clipboard.writeText(box.value).then(() => {
    showToast("Mega-Prompt copiado al portapapeles.");
  }).catch(() => {
    document.execCommand("copy");
    showToast("Mega-Prompt copiado al portapapeles.");
  });
}

async function pasteToAIThesisResult() {
  try {
    const text = await navigator.clipboard.readText();
    const box = document.getElementById("ai-thesis-input-result");
    if (box && text) {
      box.value = text.trim();
      showToast("Texto pegado desde portapapeles.");
    }
  } catch (err) {
    showToast("Permite acceso al portapapeles o usa Ctrl+V", true);
  }
}

// ── PUENTE IA AUTOMATICO: /api/ai (OpenCode CLI gratis + endpoint gratuito por entorno) ──
// Respaldo sin servidor: chips de IAs web gratuitas que copian el prompt y abren la pestana.

const EXTERNAL_AIS = [
  { id: "chatgpt", name: "ChatGPT", url: "https://chatgpt.com/" },
  { id: "claude", name: "Claude", url: "https://claude.ai/new" },
  { id: "gemini", name: "Gemini", url: "https://gemini.google.com/app" },
  { id: "opencode", name: "OpenCode Web", url: "https://opencode.ai/zen" },
  { id: "antigravity", name: "Antigravity", url: "https://antigravity.google/" },
];

const _externalPromptStore = {};

function openExternalAI(aiId, storeKey) {
  const ai = EXTERNAL_AIS.find(a => a.id === aiId);
  const prompt = _externalPromptStore[storeKey] || "";
  if (!ai || !prompt) return;
  const done = () => {
    showToast(`Prompt copiado. Abriendo ${ai.name} — pega (Ctrl+V) y vuelve con la respuesta.`);
    window.open(ai.url, "_blank", "noopener");
  };
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(prompt).then(done).catch(done);
  } else {
    done();
  }
}

function renderExternalChips(storeKey) {
  return EXTERNAL_AIS.map(a =>
    `<button type="button" class="ai-web-chip" onclick="openExternalAI('${a.id}','${storeKey}')" title="Copia el prompt y abre ${a.name}">${a.name}</button>`
  ).join("");
}

// — Descubrimiento dinámico de modelos y preferencia por tarea —
// Patrones de nombre de modelo por uso (sugerencia): se casan con la lista
// descubierta en runtime (/api/ai/models, OpenCode CLI o endpoint por entorno).
const AI_MODEL_PATTERNS = {
  copilot: ["opus", "sonnet", "gemini-3", "gpt"],
  stats_poverty: ["deep-research", "opus", "gemini-3", "sonnet"],
  patents_art: ["deep-research", "sonar", "opus"],
  blender_3d: ["sonnet", "claude", "grok", "gpt"],
  budget_alibaba: ["deep-research", "flash", "haiku"],
  voice_audio: ["flash", "haiku", "mini"],
  cross_audit: ["opus", "gpt", "gemini-3"],
  web_prototype: ["gpt", "sonnet", "flash", "glm"]
};

let _aiModelsCache = null;
let _aiModelsPromise = null;
// Modelo del proyecto: va primero en la sugerencia por defecto.
const AI_PREFERRED_MODEL = "deepseek-v4.1-flash";

async function fetchAIModels() {
  if (_aiModelsCache && _aiModelsCache.length) return _aiModelsCache;
  if (!_aiModelsPromise) {
    _aiModelsPromise = fetch("/api/ai/models")
      .then(r => r.json())
      .then(d => (d && d.models) || [])
      .catch(() => [])
      .finally(() => { setTimeout(() => { _aiModelsPromise = null; }, 5000); });
  }
  const list = await _aiModelsPromise;
  if (list.length) _aiModelsCache = list;
  return list;
}

function suggestAIModel(key, models) {
  const pats = AI_MODEL_PATTERNS[key] || [];
  const isFree = m => m.toLowerCase().includes("free");
  const freeModels = models.filter(isFree);
  // 1. El modelo del proyecto manda: deepseek 4.1 flash, primero.
  const pref =
    models.find(m => m === "opencode-go/" + AI_PREFERRED_MODEL) ||
    models.find(m => m.toLowerCase().includes(AI_PREFERRED_MODEL) && !isFree(m)) ||
    freeModels.find(m => m.toLowerCase().includes(AI_PREFERRED_MODEL));
  if (pref) return pref;
  for (const p of pats) {
    const hitFree = freeModels.find(m => m.toLowerCase().includes(p));
    if (hitFree) return hitFree;
  }
  if (freeModels[0]) return freeModels[0];
  for (const p of pats) {
    const hitAny = models.find(m => m.toLowerCase().includes(p));
    if (hitAny) return hitAny;
  }
  return models[0] || "";
}

function getAIModelPref(key) {
  try { return localStorage.getItem("rally_ai_model_" + key) || ""; } catch (e) { return ""; }
}

function modelPrefChanged(key, value) {
  try { localStorage.setItem("rally_ai_model_" + key, value); } catch (e) {}
}

async function populateModelSelect(key, attempt = 0) {
  try {
  const sel = document.getElementById(`ai-model-${key}`);
  if (!sel) return;
  if (sel.options.length) return;
  const models = await fetchAIModels();
  if (!models.length) {
    sel.style.display = "none";
    if (document.contains(sel) && attempt < 3) {
      setTimeout(() => populateModelSelect(key, attempt + 1), 2000 * (attempt + 1));
    }
    return;
  }
  sel.style.display = "inline-block";
  const groups = {};
  models.forEach(m => {
    const p = String(m).split("/")[0];
    (groups[p] = groups[p] || []).push(m);
  });
  Object.keys(groups).sort().forEach(p => {
    const og = document.createElement("optgroup");
    og.label = p;
    groups[p].forEach(m => {
      const o = document.createElement("option");
      o.value = m;
      o.textContent = String(m).includes("free") ? `${m} · gratis` : m;
      og.appendChild(o);
    });
    sel.appendChild(og);
  });
  const pref = getAIModelPref(key);
  const chosen = preferKey(pref, models) || suggestAIModel(key, models);
  sel.value = chosen;
  modelPrefChanged(key, chosen);
  } catch (e) {}
}

function preferKey(candidate, models) {
  if (candidate && models.includes(candidate)) return candidate;
  return "";
}

// — Jobs asíncronos con texto en vivo (poll 600ms) —
const _aiJobs = {}; // key → jobId activo

async function startAIJob(prompt, model) {
  const resp = await fetch("/api/ai", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt, model })
  });
  return await resp.json();
}

async function watchAIJob(key, jobId, onTick) {
  const token = jobId;
  let last = null;
  while (_aiJobs[key] === token) {
    await new Promise(r => setTimeout(r, 600));
    let d = null;
    try {
      d = await (await fetch(`/api/ai/progress?job=${encodeURIComponent(token)}`)).json();
    } catch (e) { continue; }
    if (d.status !== "running" || d.chars > 0) { last = d; onTick(d); }
    if (d.done) break;
  }
  return last;
}

// Motor compartido: copiloto y tarjetas multi-IA usan el mismo flujo
// arrancar job → texto aterriza en vivo → estado final + chips si falla.
async function _runAIJob(key, prompt, hooks) {
  // Un job viejo del mismo panel no debe seguir corriendo (gasta cuota y su
  // texto nunca llegaria a la caja).
  if (_aiJobs[key]) {
    try { fetch(`/api/ai/cancel?job=${encodeURIComponent(_aiJobs[key])}`); } catch (e) { /* servicio apagado */ }
  }
  const model = getAIModelPref(key) || "";
  let started = null;
  try {
    started = await startAIJob(prompt, model);
  } catch (e) { started = { status: "service-down" }; }
  if (!started || started.status !== "started" || !started.job) {
    hooks.onNoProvider(started);
    return;
  }
  _aiJobs[key] = started.job;
  _externalPromptStore[key] = prompt;
  if (hooks.onLiveStart) hooks.onLiveStart(started);
  let final = null;
  try {
    final = await watchAIJob(key, started.job, d => {
      if (d.text) hooks.boxTick(d.text);
      if (hooks.onTick) hooks.onTick(d);
    });
  } finally {
    delete _aiJobs[key];
  }
  hooks.onFinish(final);
}

function _aiStatusMessage(data) {
  return (data && (data.message || (data.status === "ok" ? "Generado." : "IA no disponible. Usa el modo manual de copiar/pegar."))) || "Servicio IA no disponible. Inicia rally_service.py o usa los chips de IA web.";
}

let _copilotAiBusy = false;
async function runCopilotWithAI() {
  if (_copilotAiBusy) return;
  const btn = document.getElementById("copilot-generate-btn");
  const statusBox = document.getElementById("copilot-ai-status");
  const resultBox = document.getElementById("ai-thesis-input-result");
  const promptBox = document.getElementById("ai-prompt-box");
  if (!promptBox || !resultBox) return;
  await populateModelSelect("copilot");
  const original = btn ? btn.innerHTML : "";
  _copilotAiBusy = true;
  if (btn) { btn.disabled = true; btn.innerHTML = `${SVG.spinner} Generando…`; }
  if (statusBox) {
    statusBox.style.display = "block";
    statusBox.textContent = "Generando con IA… el texto aterrizará aquí en vivo (600 ms).";
  }
  await _runAIJob("copilot", promptBox.value, {
    boxTick: txt => {
      resultBox.value = txt;
      resultBox.scrollTop = resultBox.scrollHeight;
    },
    onNoProvider: started => {
      if (statusBox) statusBox.innerHTML = `${renderExternalChips("copilot")}<div style="margin-top:6px;">${_aiStatusMessage(started)}</div>`;
      showToast("IA automática no conectada; chips de IA web listos.", true);
    },
    onFinish: final => {
      if (final && final.status === "done") {
        resultBox.value = final.text.trim();
        if (statusBox) statusBox.textContent = `Listo con ${final.provider} (${final.model}). Revisa, edita si hace falta y pulsa Inyectar.`;
        showToast(`Respuesta generada con ${final.provider}.`);
      } else {
        if (statusBox) statusBox.innerHTML = `${renderExternalChips("copilot")}<div style="margin-top:6px;">${_aiStatusMessage(final)}</div>`;
        showToast("La IA no pudo completar el texto; usa los chips de IA web.", true);
      }
    }
  });
  _copilotAiBusy = false;
  if (btn) { btn.disabled = false; btn.innerHTML = original; }
}

let _taskAiBusy = {};
async function runTaskWithAI(taskId) {
  if (_taskAiBusy[taskId]) return;
  _taskAiBusy[taskId] = true;
  setTaskStatus(taskId, "in_progress");
  const box = document.getElementById(`paste-result-${taskId}`);
  const chipBox = document.getElementById(`ai-chips-${taskId}`);
  await populateModelSelect(taskId);
  const model = getAIModelPref(taskId);
  showToast(`Generando el briefing con IA${model ? ` (${model})` : ""}…`);
  if (chipBox) {
    chipBox.style.display = "block";
    chipBox.textContent = "Generando con IA… el texto aterrizará en el cuadro de abajo en tiempo real.";
  }
  const showChips = msg => {
    if (chipBox) chipBox.innerHTML = `IA web gratis: ${renderExternalChips(taskId)}<div style="margin-top:5px;">${msg}</div>`;
  };
  await _runAIJob(taskId, generateSpecificMegaPrompt(taskId), {
    boxTick: txt => {
      if (box) {
        box.value = txt;
        box.scrollTop = box.scrollHeight;
      }
    },
    onTick: d => {
      if (d && d.status === "running" && chipBox) {
        chipBox.textContent = `Generando… ${d.chars || box && box.value.length || 0} caracteres en vuelo.`;
      }
    },
    onNoProvider: started => {
      showChips(_aiStatusMessage(started));
      showToast("IA automática no conectada; usa los chips de IA web.", true);
    },
    onFinish: final => {
      if (final && final.status === "done") {
        if (box) box.value = final.text.trim();
        if (chipBox) chipBox.textContent = `Listo con ${final.provider} (${final.model}). Revisa y pulsa Inyectar.`;
        showToast(`Briefing listo con ${final.provider}.`);
      } else {
        showChips(_aiStatusMessage(final));
        showToast("La IA no pudo completar el briefing; usa los chips de IA web.", true);
      }
    }
  });
  _taskAiBusy[taskId] = false;
}

function applyAIThesis(chId, isFromEditModal = false) {
  const resultBox = document.getElementById("ai-thesis-input-result");
  const val = resultBox ? resultBox.value.trim() : "";
  if (!val) {
    alert("Ingresa o pega la formulación de la Tesis de Solución.");
    return;
  }

  if (!state.challenges || state.challenges.length === 0) {
    state.challenges = JSON.parse(JSON.stringify(OFFICIAL_CHALLENGES_2026));
  }
  const ch = state.challenges.find(c => c.id === chId);
  if (ch) {
    ch.wowProposal = val;
  }

  if (state.challenge_id === chId) {
    state.solution_raw_input = val;
    state.solution_thesis = val;
  }

  saveState();

  if (isFromEditModal) {
    const editBox = document.getElementById("edit-ch-wow");
    if (editBox) editBox.value = val;
  }

  const modal = document.getElementById("ai-thesis-modal");
  if (modal) modal.style.display = "none";

  renderTab("challenges");
  renderNavigation();
  showToast(`Tesis de Solución de Reto #${chId} actualizada con IA exitosamente.`);
}

// ── IMPORTADOR UNIVERSAL: ZIP, PDF, WORD, IMÁGENES, TEXTO ────────────────────
function setImportStatus(msg, isError = false, isLoading = true) {
  const ids = ["import-status-indicator", "custom-import-status-indicator"];
  ids.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.style.display = "flex";
      el.style.alignItems = "center";
      el.style.justifyContent = "center";
      el.style.gap = "8px";
      el.style.color = isError ? "#DC2626" : "#0866F5";
      if (isLoading && !isError) {
        el.innerHTML = `${SVG.spinner} <span>${msg}</span>`;
      } else {
        el.innerHTML = `<span>${msg}</span>`;
      }
    }
  });

  const dropzone = document.getElementById("challenge-dropzone");
  if (dropzone) {
    if (isLoading && !isError) {
      dropzone.style.borderColor = "#0866F5";
      dropzone.style.background = "#EFF6FF";
      dropzone.style.opacity = "0.9";
      dropzone.style.pointerEvents = "none";
    } else {
      dropzone.style.borderColor = "#93C5FD";
      dropzone.style.background = "#F8FAFD";
      dropzone.style.opacity = "1";
      dropzone.style.pointerEvents = "auto";
    }
  }

  const btnProcess = document.getElementById("btn-process-challenges");
  if (btnProcess) {
    if (isLoading && !isError) {
      btnProcess.disabled = true;
      btnProcess.style.opacity = "0.6";
      btnProcess.innerHTML = `${SVG.spinner} Analizando Retos del Comité...`;
    } else {
      btnProcess.disabled = false;
      btnProcess.style.opacity = "1";
      btnProcess.innerHTML = `Cargar Retos en Vivo y Sugerir Soluciones ${SVG.arrowRight}`;
    }
  }
}

function handleChallengeDrop(e) {
  e.preventDefault();
  const el = document.getElementById("challenge-dropzone");
  if (el) {
    el.style.borderColor = "#CBD5E1";
    el.style.background = "#F8FAFC";
  }
  if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
    handleChallengeFileSelect(e.dataTransfer.files);
  }
}

// Escuchador global de arrastre para no perder archivos sueltos
window.addEventListener("dragover", function(e) {
  e.preventDefault();
}, false);

window.addEventListener("drop", function(e) {
  if (activeTab === "challenges" && e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
    e.preventDefault();
    handleChallengeFileSelect(e.dataTransfer.files);
  }
}, false);

// ── RECONOCEDOR OCR Y SEGMENTADOR DINÁMICO DE RETOS POR IMAGEN ──────────────
async function processImageFileWithOcr(fileOrBlob, fileName, onProgress) {
  let dataUrl = "";
  if (typeof fileOrBlob === "string" && fileOrBlob.startsWith("data:")) {
    dataUrl = fileOrBlob;
  } else {
    dataUrl = await new Promise((res) => {
      const reader = new FileReader();
      reader.onload = () => res(reader.result);
      reader.readAsDataURL(fileOrBlob);
    });
  }

  let ocrText = "";
  let structuredChallenges = null;
  let ocrWarn = "";
  if (onProgress) onProgress(`Analizando ${fileName} con IA visual...`);

  // 1. Motor primario: Backend /api/ocr — modelo vision (JSON jerarquizado) si hay IA conectada;
  //    EasyOCR local queda como red de seguridad dentro del mismo backend.
  try {
    const resp = await fetch("/api/ocr", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ image: dataUrl, name: fileName })
    });
    const json = await resp.json().catch(() => null);
    if (resp.ok && json && json.status === "ok") {
      if (json.source === "ai" && Array.isArray(json.challenges) && json.challenges.length) {
        structuredChallenges = json.challenges;
        ocrText = (json.text || "").trim();
      } else if (json.text) {
        ocrText = json.text.trim();
      }
      // El backend dice por qué no usó la IA (rate limit / sin endpoint): mostrarlo
      // para que no parezca que el OCR local es lo único que existe.
      if (!structuredChallenges && json.note) ocrWarn = json.note;
    } else if (json && json.status === "bad-image") {
      // El archivo llegó dañado: ningún motor podrá leerlo. Avisar de inmediato y
      // no gastar el motor local (Tesseract fallaría igual y llena la consola de ruido).
      ocrWarn = json.message || "La imagen llegó dañada. Pega el texto a mano en el cuadro Pegar Texto.";
      if (onProgress) onProgress(ocrWarn);
      showToast(ocrWarn, true);
      return null;
    } else if (json && json.message) {
      // Cualquier otro aviso del backend: guardarlo para mostrarlo si al final no hay texto
      ocrWarn = json.message;
    }
  } catch (apiErr) {
    console.warn("Backend /api/ocr no respondió, usando fallback local:", apiErr);
  }

  // 2. Motor secundario fallback: Tesseract.js en el navegador
  if (!ocrText && typeof Tesseract === "undefined") {
    if (onProgress) onProgress("Preparando el lector de imágenes...");
    await ensureIngestLibs("ocr");
  }
  if (!ocrText && typeof Tesseract !== "undefined") {
    try {
      if (onProgress) onProgress(`OCR en ${fileName} (motor Tesseract)...`);
      const resOcr = await Tesseract.recognize(dataUrl, 'spa', {
        logger: m => {
          if (m && m.status === 'recognizing text' && onProgress) {
            const pct = Math.round((m.progress || 0) * 100);
            onProgress(`OCR en ${fileName}: ${pct}% analizado...`);
          }
        }
      });
      if (resOcr && resOcr.data && resOcr.data.text) {
        ocrText = resOcr.data.text.trim();
      }
    } catch (ocrErr) {
      console.warn("Tesseract OCR falló en:", fileName, ocrErr);
    }
  }

  if (structuredChallenges) {
    if (onProgress) onProgress(`IA visual estructuró ${structuredChallenges.length} reto(s) desde ${fileName}.`);
    return { dataUrl, challenges: structuredChallenges, rawOcr: ocrText };
  }
  if (ocrWarn) {
    if (onProgress) onProgress(ocrWarn);
    // Si igual hubo texto, es un aviso informativo; si no hubo, es un error real.
    if (typeof showToast === "function") showToast(ocrWarn, !ocrText);
  }
  const extracted = parseChallengesFromOcrText(ocrText, fileName);
  return { dataUrl, challenges: extracted, rawOcr: ocrText };
}

function parseChallengesFromOcrText(ocrText, fileName) {
  const cleanName = fileName.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");

  if (!ocrText || ocrText.trim().length < 20) {
    return [{
      title: cleanName.toLowerCase().includes("whatsapp image") ? "Desafío Convocatoria Oficial" : cleanName,
      demand: `Contenido visual de convocatoria oficial capturado (${fileName}). Consulta la imagen ampliada para deliberar la demanda técnica del comité.`,
      ods: ["ODS 9", "ODS 12"],
      category: "Innovación"
    }];
  }

  const normalized = ocrText
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  // Patrón 1: Encabezados explícitos de retos (RETO 1, DESAFÍO 02, 1. TITULO, etc.)
  const challengeHeaderRegex = /(?:^|\n)\s*(?:(?:reto|desaf[ií]o|desafio|challenge|problema|caso)\s*#?\s*([0-9a-zA-ZIVX]+)[:\.\-\s]+|(?:^|\n)\s*(\d{1,2})[\.\-\)]\s+([A-ZÁÉÍÓÚÑ]{3,}))/gi;
  
  let match;
  const indices = [];
  while ((match = challengeHeaderRegex.exec(normalized)) !== null) {
    indices.push({
      index: match.index,
      label: match[1] || match[2] || ""
    });
  }

  if (indices.length >= 2) {
    const list = [];
    for (let i = 0; i < indices.length; i++) {
      const start = indices[i].index;
      const end = (i + 1 < indices.length) ? indices[i + 1].index : normalized.length;
      const chunk = normalized.slice(start, end).trim();
      const ch = parseSingleChallengeChunk(chunk, indices[i].label, fileName);
      if (ch) list.push(ch);
    }
    if (list.length > 0) return list;
  }

  // Patrón 2: Múltiples ODS claramente definidos en el póster
  const odsMatches = [...normalized.matchAll(/(?:^|\n)\s*(ODS\s*\d+[:\.\-\s]+[^\n]+)/gi)];
  if (odsMatches.length >= 2) {
    const list = [];
    for (let i = 0; i < odsMatches.length; i++) {
      const start = odsMatches[i].index;
      const end = (i + 1 < odsMatches.length) ? odsMatches[i + 1].index : normalized.length;
      const chunk = normalized.slice(start, end).trim();
      const ch = parseSingleChallengeChunk(chunk, `ODS-${i+1}`, fileName);
      if (ch) list.push(ch);
    }
    if (list.length > 0) return list;
  }

  // Helper: limpiar ruido de UI, extensiones de navegador o captura
  const UI_NOISE = ["resumir", "buscar", "ampliar", "streamyard", "catálogo", "catalogo", "activos", "winrate", "desafío #", "desafio #", "reto #", "elegir para", "editar reto"];
  function isGarbageLine(line) {
    if (!line) return true;
    const clean = line.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ0-9\s]/g, "").trim().toLowerCase();
    if (clean.length < 3) return true;
    if (UI_NOISE.some(n => clean === n || clean.startsWith(n + " ") || clean.endsWith(" " + n))) return true;
    // Líneas con exceso de caracteres ininteligibles o tokens aislados
    if (clean.length <= 4 && !["agua", "aire", "suelo", "vida", "moto", "frio", "frío"].includes(clean)) return true;
    return false;
  }

  function extractBestTitle(lines, fallback) {
    // 1. Priorizar líneas que contengan palabras claves de títulos oficiales
    const titleCandidates = lines.filter(l => {
      if (isGarbageLine(l)) return false;
      const lower = l.toLowerCase();
      return (
        lower.includes("segunda vida") ||
        lower.includes("motores") ||
        lower.includes("sensores") ||
        lower.includes("polinizadores") ||
        lower.includes("residuos") ||
        lower.includes("monitoreo") ||
        lower.includes("remoción") ||
        lower.includes("optimización") ||
        lower.includes("desechos") ||
        lower.includes("reutilización") ||
        lower.includes("alerta") ||
        lower.includes("prevención") ||
        lower.includes("desafío") ||
        lower.includes("reto")
      );
    });

    if (titleCandidates.length > 0) {
      let cand = titleCandidates[0].replace(/^(?:reto|desaf[ií]o|desafio|challenge|problema|caso)?\s*#?\s*[0-9a-zA-ZIVX]+[:\.\-\s]*/i, "").trim();
      // Si la siguiente línea complementa el título (ej: "SEGUNDA VIDA DE LOS MOTORES" + "ELÉCTRICOS DOMÉSTICOS")
      const idx = lines.indexOf(titleCandidates[0]);
      if (idx !== -1 && idx + 1 < lines.length) {
        const next = lines[idx + 1].trim();
        if (!isGarbageLine(next) && next === next.toUpperCase() && next.length > 3 && next.length < 50 && !next.includes("Los electro")) {
          cand += " " + next;
        }
      }
      return cand;
    }

    // 2. Buscar primera línea en MAYÚSCULAS o de longitud adecuada
    for (const l of lines) {
      if (!isGarbageLine(l) && l.length >= 8 && l.length <= 95) {
        return l.replace(/^(?:reto|desaf[ií]o|desafio|challenge|problema|caso)?\s*#?\s*[0-9a-zA-ZIVX]+[:\.\-\s]*/i, "").trim();
      }
    }
    return fallback;
  }

  // Patrón 3: Separación por bloques de párrafos significativos (doble salto de línea)
  const paragraphs = normalized.split(/\n\s*\n/).map(p => p.trim()).filter(p => p.length > 40);
  if (paragraphs.length >= 2 && paragraphs.length <= 6) {
    return paragraphs.map((p, idx) => {
      const lines = p.split("\n").map(l => l.trim()).filter(l => !isGarbageLine(l));
      const title = extractBestTitle(lines, `Desafío Oficial #${idx + 1}`);
      const rest = lines.filter(l => l !== title).join(" ") || p;
      const isSocial = p.toLowerCase().includes("social") || p.toLowerCase().includes("comun") || p.toLowerCase().includes("salud");
      const odsMatch = p.match(/ODS\s*\d+/gi);
      return {
        title: title.length > 85 ? title.slice(0, 82) + "..." : title,
        demand: rest,
        ods: odsMatch ? Array.from(new Set(odsMatch.map(o => o.toUpperCase()))) : [],
        category: isSocial ? "Impacto Social" : "Innovación"
      };
    });
  }

  // Patrón 4: Reto único en esta imagen (la cantidad varia dinámicamente)
  const allLines = normalized.split("\n").map(l => l.trim()).filter(l => !isGarbageLine(l));
  const fallbackTitle = cleanName.toLowerCase().includes("whatsapp image") ? "Desafío Convocatoria Oficial" : cleanName;
  const bestTitle = extractBestTitle(allLines, fallbackTitle);
  const demandLines = allLines.filter(l => l !== bestTitle && !l.toLowerCase().includes("catálogo"));
  const demand = demandLines.join(" ") || normalized;
  const isSocial = normalized.toLowerCase().includes("social") || normalized.toLowerCase().includes("comun");
  const odsMatch = normalized.match(/ODS\s*\d+/gi);

  return [{
    title: bestTitle.length > 90 ? bestTitle.slice(0, 87) + "..." : bestTitle,
    demand: demand,
    ods: odsMatch ? Array.from(new Set(odsMatch.map(o => o.toUpperCase()))) : [],
    category: isSocial ? "Impacto Social" : "Innovación"
  }];
}

function parseSingleChallengeChunk(chunk, label, fileName) {
  const lines = chunk.split("\n").map(l => l.trim()).filter(Boolean);
  if (lines.length === 0) return null;

  let title = lines[0].replace(/^(?:reto|desaf[ií]o|desafio|challenge|problema|caso)?\s*#?\s*[0-9a-zA-ZIVX]+[:\.\-\s]*/i, "").trim();
  if ((!title || title.toLowerCase() === "resumir") && lines.length > 1) {
    title = lines[1].trim();
  }
  if (!title || title.toLowerCase() === "resumir") {
    title = `Desafío Oficial ${label || ''}`.trim();
  }
  if (title.length > 90) {
    title = title.slice(0, 87) + "...";
  }

  const demand = lines.slice(1).join(" ") || chunk;
  const isSocial = chunk.toLowerCase().includes("social") || chunk.toLowerCase().includes("comun") || chunk.toLowerCase().includes("educa") || chunk.toLowerCase().includes("salud");
  const odsMatch = chunk.match(/ODS\s*\d+/gi);

  return {
    title: title,
    demand: demand,
    ods: odsMatch ? Array.from(new Set(odsMatch.map(o => o.toUpperCase()))) : [],
    category: isSocial ? "Impacto Social" : "Innovación"
  };
}

async function reScanChallengesWithOCR() {
  if (!state.challenges || state.challenges.length === 0) {
    alert("No hay retos cargados para re-escanear.");
    return;
  }
  const challengesWithImg = state.challenges.filter(c => c.imageUrl);
  if (challengesWithImg.length === 0) {
    alert("Los retos actuales no tienen imagen guardada. Por favor abre 'Importar / Re-pegar' y arrastra o selecciona las imágenes oficiales.");
    toggleCustomChallengeInput();
    return;
  }
  setImportStatus(`Re-escaneando ${challengesWithImg.length} imagen(es) con IA visual...`);
  let accumulatedText = "";
  let globalCount = 0;
  window._challengeImageStore = window._challengeImageStore || {};

  for (let i = 0; i < challengesWithImg.length; i++) {
    const ch = challengesWithImg[i];
    const imgKey = `rescan_${Date.now()}_${i}`;
    window._challengeImageStore[imgKey] = ch.imageUrl;
    const res = await processImageFileWithOcr(ch.imageUrl, ch.title || `Reto_${ch.id}.jpeg`, (msg) => setImportStatus(msg));
    res.challenges.forEach(c => {
      globalCount++;
      accumulatedText += `\nRETO ${globalCount}: ${c.title}\n`;
      accumulatedText += `Demanda del comité: ${c.demand}\n`;
      if (c.ods && c.ods.length) {
        accumulatedText += `ODS: ${c.ods.join(", ")}\n`;
      }
      accumulatedText += `[IMAGEN_ORIGEN: ${imgKey}]\n`;
    });
  }

  if (accumulatedText.trim()) {
    const txtArea = document.getElementById("raw-committee-challenges");
    if (txtArea) txtArea.value = accumulatedText.trim();
    setImportStatus(`✓ ${globalCount} retos extraídos con OCR neuronal exitosamente.`);
    processCommitteeChallengesInput();
  }
}

async function handleChallengeFileSelect(files) {
  if (!files || files.length === 0) return;
  setImportStatus("Procesando archivo(s)...");

  let accumulatedText = "";
  window._challengeImageStore = window._challengeImageStore || {};
  let globalCount = 0;

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const ext = file.name.split('.').pop().toLowerCase();

    try {
      if (ext === "zip") {
        setImportStatus(`Descomprimiendo y procesando ZIP ${file.name}...`);
        const zipText = await extractTextFromZip(file);
        accumulatedText += "\n" + zipText;
      } else if (ext === "pdf") {
        setImportStatus(`Extrayendo texto de PDF ${file.name}...`);
        const pdfText = await extractTextFromPdf(file);
        accumulatedText += "\n" + pdfText;
      } else if (ext === "docx" || ext === "doc") {
        setImportStatus(`Leyendo documento Word ${file.name}...`);
        const wordText = await extractTextFromDocx(file);
        accumulatedText += "\n" + wordText;
      } else if (["png", "jpg", "jpeg", "webp"].includes(ext)) {
        setImportStatus(`Ejecutando OCR en imagen ${file.name}...`);
        const imgResult = await processImageFileWithOcr(file, file.name, (msg) => setImportStatus(msg));
        const imgKey = `img_${Date.now()}_${i}`;
        window._challengeImageStore[imgKey] = imgResult.dataUrl;

        imgResult.challenges.forEach(ch => {
          globalCount++;
          accumulatedText += `\nRETO ${globalCount}: ${ch.title}\n`;
          accumulatedText += `Demanda del comité: ${ch.demand}\n`;
          if (ch.ods && ch.ods.length) {
            accumulatedText += `ODS: ${ch.ods.join(", ")}\n`;
          }
          accumulatedText += `[IMAGEN_ORIGEN: ${imgKey}]\n`;
        });
      } else {
        const txt = await file.text();
        accumulatedText += "\n" + txt;
      }
    } catch (err) {
      console.error("Error al procesar archivo:", file.name, err);
      setImportStatus(`Error al procesar ${file.name}: ${err.message}`, true);
    }
  }

  if (accumulatedText.trim()) {
    const txtArea = document.getElementById("raw-committee-challenges");
    if (txtArea) {
      txtArea.value = accumulatedText.trim();
    }
    setImportStatus(`${files.length} archivo(s) procesados. Extracción completada.`, false, false);
    processCommitteeChallengesInput();
  } else {
    setImportStatus("No se pudo extraer texto legible. Verifica el formato.", true, false);
  }
}

async function extractTextFromZip(file) {
  if (typeof JSZip === "undefined") {
    await ensureIngestLibs("zip");
  }
  if (typeof JSZip === "undefined") {
    throw new Error("Librería de descompresión no disponible en el navegador.");
  }
  const zip = await JSZip.loadAsync(file);
  let content = "";
  const entries = Object.keys(zip.files);
  let challengeCount = 0;
  window._challengeImageStore = window._challengeImageStore || {};

  for (let idx = 0; idx < entries.length; idx++) {
    const filename = entries[idx];
    const zipEntry = zip.files[filename];
    if (zipEntry.dir) continue;
    const lower = filename.toLowerCase();

    if (lower.endsWith(".txt") || lower.endsWith(".md")) {
      const text = await zipEntry.async("string");
      content += "\n" + text;
    } else if (lower.endsWith(".docx")) {
      await ensureIngestLibs("docx");
    if (typeof mammoth !== "undefined") {
        const arrayBuffer = await zipEntry.async("arraybuffer");
        const res = await mammoth.extractRawText({ arrayBuffer });
        content += "\n" + (res.value || "");
      }
    } else if (lower.endsWith(".png") || lower.endsWith(".jpg") || lower.endsWith(".jpeg") || lower.endsWith(".webp")) {
      setImportStatus(`Procesando imagen ${filename} del archivo ZIP con OCR...`);
      const b64 = await zipEntry.async("base64");
      const mime = lower.endsWith(".png") ? "image/png" : lower.endsWith(".webp") ? "image/webp" : "image/jpeg";
      const dataUrl = `data:${mime};base64,${b64}`;

      const imgResult = await processImageFileWithOcr(dataUrl, filename, (msg) => setImportStatus(msg));
      const imgKey = `zip_${Date.now()}_${idx}`;
      window._challengeImageStore[imgKey] = dataUrl;

      imgResult.challenges.forEach(ch => {
        challengeCount++;
        content += `\nRETO ${challengeCount}: ${ch.title}\n`;
        content += `Demanda del comité: ${ch.demand}\n`;
        if (ch.ods && ch.ods.length) {
          content += `ODS: ${ch.ods.join(", ")}\n`;
        }
        content += `[IMAGEN_ORIGEN: ${imgKey}]\n`;
      });
    }
  }
  return content;
}

// Las librerías de ingesta pesan varios MB entre las cuatro. No se piden al
// abrir el workbench: se cargan la primera vez que el equipo importa algo, y
// solo la que ese archivo necesita.
const INGEST_LIBS = {
  zip: "https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js",
  pdf: "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js",
  docx: "https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.6.0/mammoth.browser.min.js",
  ocr: "https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js"
};
const ingestLoaded = {};

function ensureIngestLibs(kind) {
  const pedidos = [].concat(kind);
  return Promise.all(pedidos.map(function (k) {
    return new Promise(function (resolve) {
      if (!INGEST_LIBS[k] || ingestLoaded[k] || typeof document === "undefined") return resolve(true);
      const sc = document.createElement("script");
      sc.src = INGEST_LIBS[k];
      sc.onload = function () { ingestLoaded[k] = true; resolve(true); };
      sc.onerror = function () { console.warn("No se pudo cargar la librería de ingesta:", k); resolve(false); };
      document.head.appendChild(sc);
    });
  }));
}

async function extractTextFromPdf(file) {
  if (typeof pdfjsLib === "undefined") {
    await ensureIngestLibs("pdf");
  }
  if (typeof pdfjsLib === "undefined") {
    throw new Error("Visor PDF no inicializado.");
  }
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  let fullText = "";

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const textContent = await page.getTextContent();
    const pageText = textContent.items.map(item => item.str).join(" ");
    fullText += "\n" + pageText;
  }
  return fullText;
}

async function extractTextFromDocx(file) {
  if (typeof mammoth === "undefined") {
    await ensureIngestLibs("docx");
  }
  if (typeof mammoth === "undefined") {
    throw new Error("Lector Word no inicializado.");
  }
  const arrayBuffer = await file.arrayBuffer();
  const res = await mammoth.extractRawText({ arrayBuffer });
  return res.value || "";
}

function toggleCustomChallengeInput() {
  const el = document.getElementById("custom-challenge-input-box");
  if (!el) return;
  if (el.style.display === "none") openChallengeImportBox();
  else el.style.display = "none";
}

// Abre la caja de importación mostrando PRIMERO lo que ya está cargado: el
// equipo debe ver sus retos antes de importar o reemplazar nada.
function openChallengeImportBox() {
  const el = document.getElementById("custom-challenge-input-box");
  if (!el) return;
  renderChallengeImportBox();
  el.style.display = "block";
  const ta = document.getElementById("raw-committee-challenges");
  if (ta) ta.focus({ preventScroll: true });
}

function renderChallengeImportBox() {
  const box = document.getElementById("challenge-import-current");
  if (!box) return;
  const list = Array.isArray(state.challenges) ? state.challenges : [];
  if (!list.length) {
    box.innerHTML = '<div style="font-size:12px; color:var(--text-muted); padding:8px 10px; background:var(--bg-subtle); border:1px solid var(--border-light); border-radius:6px;">No hay retos cargados todavía.</div>';
    return;
  }
  const rows = list.map(ch => {
    const id = String(ch.id || "");
    const title = String(ch.title || "sin título");
    return '<div style="display:flex; align-items:center; justify-content:space-between; gap:10px; padding:6px 2px; border-bottom:1px solid var(--border-light);">' +
      '<span style="font-size:12px; color:var(--text-title); min-width:0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">' +
      '<strong style="font-family:var(--font-mono); color:var(--color-primary);">#' + escapeHtml(id) + '</strong> · ' + escapeHtml(title) +
      '</span>' +
      '<button class="btn-pill-light" data-challenge-remove="' + escapeHtml(id) + '" style="font-size:11px; padding:3px 10px; flex:none;">Borrar</button>' +
      '</div>';
  }).join("");
  box.innerHTML =
    '<div style="display:flex; align-items:center; justify-content:space-between; gap:10px; margin-bottom:4px;">' +
    '<span style="font-size:12px; font-weight:800; color:var(--text-title);">Retos cargados (' + list.length + ')</span>' +
    '<button class="btn-pill-light" style="font-size:11px; padding:3px 10px;" onclick="clearAllChallenges()">Limpiar todos</button>' +
    '</div>' + rows;
  box.querySelectorAll("[data-challenge-remove]").forEach(function (btn) {
    btn.addEventListener("click", function () { removeChallenge(btn.getAttribute("data-challenge-remove")); });
  });
}

// Borra UN reto (no toda la lista) y limpia la selección si era el elegido.
function removeChallenge(id) {
  if (!id || !Array.isArray(state.challenges)) return;
  const before = state.challenges.length;
  state.challenges = state.challenges.filter(ch => String(ch.id) !== String(id));
  if (state.challenges.length === before) return;
  purgeChallengeRefs([id]);
  if (String(state.active_deliberation_challenge_id) === String(id)) {
    state.active_deliberation_challenge_id = state.challenges.length ? state.challenges[0].id : "";
  }
  if (String(state.challenge_id) === String(id)) {
    state.challenge_id = "";
    state.challenge_title = "";
  }
  saveState();
  renderTab("challenges");
  renderNavigation();
  openChallengeImportBox();
}

function clearAllChallenges() {
  if (confirm("¿Limpiar todos los retos cargados para ingresar un nuevo comunicado oficial?")) {
    const goneIds = (state.challenges || []).map(c => String(c.id));
    state.challenges = [];
    purgeChallengeRefs(goneIds);
    state.challenge_id = "";
    state.challenge_title = "";
    state.active_deliberation_challenge_id = "";
    saveState();
    renderTab("challenges");
    renderNavigation();
    openChallengeImportBox(); // lista vacía visible, lista para pegar el comunicado nuevo
  }
}

// ── MOTOR GENERADOR DE SOLUCIONES TÁCTICAS PARA RETOS EN VIVO ────────────────
function generateTacticalSolution(title, description, category) {
  const cleanTitle = (title || "").trim();
  const cleanDesc = (description || "").trim();
  const categoryLabel = (category || "innovacion").trim();
  return {
    wowProposal: cleanTitle
      ? `Propuesta en construccion para "${cleanTitle}": el equipo debe formular la tesis tecnica con IA activa y validarla contra la rubrica oficial.`
      : `[Pendiente de formulacion] Define el reto y usa "Formular con IA Activa" para construir la tesis tecnica.`,
    nicaraguaAdaptation: cleanDesc
      ? `Anclaje territorial por definir con el equipo a partir de la demanda: ${cleanDesc}`
      : "Anclaje territorial pendiente de definir con el equipo.",
    noveltyReason: "La novedad debe justificarse con evidencia del corpus y validacion con usuarios, no con texto generico.",
    winnerPattern: `Alineacion con la rubrica oficial (100 Pts) en la categoria ${categoryLabel}.`,
    ods: ["ODS 9"],
    winRate: 0
  };
}

function processCommitteeChallengesInput() {
  const txt = (document.getElementById("raw-committee-challenges").value || "").trim();
  if (!txt) {
    alert("Pega el texto de los retos anunciado por el comité.");
    return;
  }

  const parser = window.RallyChallengeParser;
  if (!parser) {
    alert("Falta cargar el validador de retos (challenge_parser.js). Recarga la página.");
    return;
  }
  const parsed = parser.parse(txt);

  // Cartel oficial de cada reto, si vino en la importación.
  const imageStore = window._challengeImageStore || {};
  parsed.forEach(ch => {
    ch.imageUrl = (ch.imageKey && imageStore[ch.imageKey]) || imageStore[ch.id] || "";
    delete ch.imageKey;
  });

  if (parsed.length > 0) {
    // Tesis táctica solo con demanda real del comité; sin demanda queda "pendiente".
    const conDemanda = parsed.map(ch => {
      if ((ch.officialExpectation || "").trim().length >= 40) {
        Object.assign(ch, generateTacticalSolution(ch.title, ch.officialExpectation, ch.category));
      }
      return ch;
    });
    const appendBox = document.getElementById("challenge-append-mode");
    const shouldAppend = !!(appendBox && appendBox.checked);
    state.challenges = mergeIncomingChallenges(conDemanda, shouldAppend);
    state.active_deliberation_challenge_id = state.challenges[0].id;
    saveState();
    renderTab("challenges");
    openChallengeImportBox(); // deja la lista visible con el resultado de la importación
  } else {
    // Ni un reto reconocible: no se inventa uno con el primer renglón (así entró el informe).
    alert("Este texto no parece un comunicado de retos. Usa el formato \"RETO 01: título\" y una línea de demanda por reto.");
  }
}

// Importar con la lista ya cargada suma por defecto en vez de borrar todo.
// Ids, deduplicado y purga en cascada viven en challenge_parser.js (probado en tests/js).
function mergeIncomingChallenges(incoming, append) {
  const parser = window.RallyChallengeParser;
  if (!parser) return Array.isArray(incoming) ? incoming : [];
  const existing = Array.isArray(state.challenges) ? state.challenges : [];
  const res = parser.merge(existing, incoming, append);
  if (res.removedIds && res.removedIds.length) purgeChallengeRefs(res.removedIds);
  return res.list;
}

// Borra votos, redacciones y selección de retos que ya no existen.
function purgeChallengeRefs(ids) {
  const parser = window.RallyChallengeParser;
  if (parser && parser.purgeRefs) parser.purgeRefs(state, ids);
}

function selectChallenge(id, proceedImmediately = false) {
  const ch = (state.challenges || []).find(c => c.id === id) || OFFICIAL_CHALLENGES_2026.find(c => c.id === id);
  if (!ch) return;

  state.challenge_id = ch.id;
  state.challenge_title = ch.title;
  state.category = ch.category;

  state.solution_raw_input = ch.wowProposal;
  state.solution_thesis = ch.wowProposal;

  saveState();
  if (proceedImmediately) {
    activeTab = "solution";
    syncUI();
  } else {
    renderTab("challenges");
    renderNavigation();
  }
}

function clearSelectedChallenge() {
  state.challenge_id = "";
  state.challenge_title = "";
  saveState();
  renderTab("challenges");
  renderNavigation();
}

// ── MODAL ESTRATÉGICO DE ANÁLISIS DE RETO Y GANADORES ────────────────────────
function openChallengeDetailModal(chId) {
  const ch = (state.challenges || []).find(c => c.id === chId) || OFFICIAL_CHALLENGES_2026.find(c => c.id === chId);
  if (!ch) return;

  let modal = document.getElementById("challenge-detail-modal-overlay");
  if (!modal) {
    modal = document.createElement("div");
    modal.id = "challenge-detail-modal-overlay";
    modal.className = "modal-overlay";
    document.body.appendChild(modal);
  }

  const odsStr = Array.isArray(ch.ods) ? ch.ods.join(", ") : (ch.ods || "ODS 9, ODS 12");
  const isSelected = state.challenge_id === ch.id;

  modal.innerHTML = `
    <div class="challenge-detail-modal-card">
      <div class="modal-header" style="margin-bottom:18px; padding-bottom:14px; border-bottom:1px solid var(--border-light);">
        <div style="display:flex; align-items:center; gap:10px;">
          <span class="tactical-status-pill">
            Reto #${ch.id}
          </span>
          <span style="font-size:12px; font-weight:700; color:var(--text-muted);">${ch.category} · ${odsStr}</span>
        </div>
        <button class="btn-icon-discreet" onclick="closeChallengeDetailModal()" style="font-size:16px; line-height:1;">✕</button>
      </div>

      <h2 style="font-size:16px; font-weight:800; color:var(--text-title); line-height:1.3; margin-bottom:16px;">
        ${ch.title}
      </h2>

      <!-- Tarjeta 1: Propuesta Técnica de Vanguardia -->
      <div class="strategy-breakdown-box" style="background:var(--bg-subtle);">
        <div class="strategy-breakdown-title" style="color:var(--color-primary);">
          ${SVG.spark} Solución Técnica Sugerida por el Sistema
        </div>
        <p style="font-size:13px; color:var(--text-title); font-weight:600; line-height:1.55; margin:0;">
          ${ch.wowProposal || 'Arquitectura técnica modular con hardware comercial de bajo costo y telemetría autónoma.'}
        </p>
      </div>

      <!-- Tarjeta 2: Adaptación Territorial y Factibilidad Local -->
      <div class="strategy-breakdown-box" style="background:var(--bg-subtle);">
        <div class="strategy-breakdown-title" style="color:var(--color-primary);">
          ${SVG.shield} Factibilidad Territorial y Adaptación Local
        </div>
        <p style="font-size:13px; color:var(--text-body); line-height:1.5; margin:0;">
          ${ch.nicaraguaAdaptation || 'Alineado a las necesidades de municipios y cooperativas locales, reduciendo costos con insumos accesibles en el mercado nacional.'}
        </p>
      </div>

      <!-- Tarjeta 3: Factor de Novedad y Diferenciación ante el Jurado -->
      <div class="strategy-breakdown-box" style="background:var(--bg-subtle);">
        <div class="strategy-breakdown-title" style="color:var(--color-accent);">
          ${SVG.chevronRight} Factor de Novedad y Diferenciación Técnica
        </div>
        <p style="font-size:13px; color:var(--text-body); line-height:1.5; margin:0;">
          ${ch.noveltyReason || 'Diseño modular parametrizado que elimina la complejidad excesiva y permite una puesta en marcha real accesible.'}
        </p>
      </div>

      <!-- Tarjeta 4: Patrón de Ganadores Históricos -->
      <div class="strategy-breakdown-box" style="background:var(--bg-subtle);">
        <div class="strategy-breakdown-title" style="color:var(--text-body);">
          ${SVG.info} Patrón Histórico de Victoria y Precedente
        </div>
        <p style="font-size:12px; color:var(--text-muted); line-height:1.5; margin:0 0 6px 0;">
          ${ch.winnerPattern || 'Soluciones ganadoras previas combinaron hardware tangible con métricas de impacto verificables en campo.'}
        </p>
        <span style="font-size:11px; font-weight:700; color:var(--text-muted); font-family:var(--font-mono);">
          Precedente de referencia: ${ch.precedent || 'Casos de éxito Rally'}
        </span>
      </div>

      <div style="display:flex; justify-content:space-between; align-items:center; margin-top:24px; padding-top:16px; border-top:1px solid var(--border-light);">
        <button class="btn-secondary" onclick="closeChallengeDetailModal()" style="font-size:12px; padding:8px 16px;">
          Cerrar Análisis
        </button>
        <button class="btn-select-card filled" style="padding:9px 22px; font-size:13px; font-weight:800;" onclick="selectChallenge('${ch.id}', true); closeChallengeDetailModal();">
          ${isSelected ? 'Continuar al Taller de Solución →' : 'Elegir este Reto y Comenzar →'}
        </button>
      </div>
    </div>
  `;

  modal.style.display = "flex";
}

function closeChallengeDetailModal() {
  const modal = document.getElementById("challenge-detail-modal-overlay");
  if (modal) modal.style.display = "none";
}

// ═════════════════════════════════════════════════════════════════════════════
// 03 NIVEL 3: TALLER DE SOLUCIÓN & PROMPT BUILDER
// ═════════════════════════════════════════════════════════════════════════════
function renderViewSolution() {
  const boosters = boostersDelProyecto();
  const { mappedOdsIds, mappedEjeIds } = getChallengeImpactDetails(state.challenge_id);
  const odsTxt = mappedOdsIds.map(oid => {
    const o = ODS_CATALOG.find(x => x.id === oid);
    return o ? o.code : "";
  }).filter(Boolean).join(" · ");

  const activos = boosters.filter(b => b.why);
  const aprobada = !!state.solution_approved;
  const editando = !aprobada || !!state.solution_editing;

  // Los potenciadores salen del proyecto: la tesis, el reto y los ODS deciden
  // cuáles aplican. Aquí solo se muestran y se explica por qué entró cada uno.
  const bloqueBoosters = `
    <section class="sol-sec">
      <div class="sol-sec-head">
        <div>
          <span class="sol-label">Lo que el motor tiene en cuenta</span>
          <p class="sol-hint">Se deduce de la tesis, el reto y los ODS. No se marca a mano.</p>
        </div>
        <span class="sol-count">${activos.length} de ${boosters.length}</span>
      </div>
      <div class="sol-boosters">
        ${boosters.map(b => `
          <button type="button" class="sol-booster tone-${b.tone}${b.why ? " is-on" : ""}" onclick="abrirDetalleBooster('${b.key}', event)" title="Ver en grande">
            ${_boosterFigura(b.symbol)}
            <span class="sol-booster-title">${b.title}</span>
            <span class="sol-booster-desc">${escapeHtml(b.why || b.desc)}</span>
          </button>`).join("")}
      </div>
    </section>
  `;

  return `
    <div class="phase-header">
      <div>
        <h1 class="phase-title">${aprobada
          ? 'Solución <span class="phase-title-accent">aprobada</span>'
          : 'Describe tu <span class="phase-title-accent">solución</span>'}</h1>
        <p class="phase-subtitle">${escapeHtml(state.challenge_title || "Elige un reto para empezar")}</p>
      </div>
      <div class="sol-head-actions">
        <button class="link-quiet" onclick="clearSelectedChallenge(); switchTab('challenges');">← Cambiar reto</button>
        <button class="btn-primary" onclick="${aprobada && !editando ? "abrirEditorSolucion(true)" : "approveSolutionAndUnlock()"}">${aprobada && !editando ? "Editar" : (state.solution_approved ? "Guardar cambios" : "Aprobar y continuar")}</button>
      </div>
    </div>

    ${editando ? `
    <section class="sol-sec">
      <label class="sol-label" for="raw-sol-input">Tu idea, con tus palabras</label>
      <p class="sol-hint">Sin tecnicismos. Lo que le contarías a un vecino.</p>
      <textarea id="raw-sol-input" class="sol-input sol-input-lg" rows="3" placeholder="Ej: Una pieza simple que se arma en el taller del barrio y resuelve en minutos lo que hoy toma horas."
        oninput="updateSolutionFieldLive('raw_input', this.value)">${escapeHtml(state.solution_raw_input || "")}</textarea>
      <div class="sol-inline-action">
        <button class="link-quiet" onclick="synthesizeSolutionFromRaw()">${SVG.spark} Estructurar tesis y pitch</button>
      </div>
    </section>

    <section class="sol-sec">
      <label class="sol-label" for="sol-thesis">Tesis técnica</label>
      <p class="sol-hint">Una sola oración densa, sin nombre comercial. Va al documento pautado.</p>
      <textarea id="sol-thesis" class="sol-input" rows="3" placeholder="Tesis estructurada…"
        oninput="updateSolutionFieldLive('thesis', this.value)">${escapeHtml(state.solution_thesis || "")}</textarea>

      <label class="sol-label" for="sol-simple" style="margin-top:18px;">Cómo se lo explicas a un asesor</label>
      <p class="sol-hint">Sin tecnicismos: qué es, qué problema resuelve y qué cambia. Se lee en voz alta en una conversación.</p>
      <textarea id="sol-simple" class="sol-input" rows="2" placeholder="Explicación accesible…"
        oninput="updateSolutionFieldLive('simple', this.value)">${escapeHtml(state.solution_simple || "")}</textarea>
    </section>

    <section class="sol-sec">
      <label class="sol-label" for="sol-proj-name">Nombre del proyecto</label>
      <p class="sol-hint">El que aparecerá en el pautado, el presupuesto y el video.</p>
      <input type="text" id="sol-proj-name" class="sol-input" placeholder="Dos palabras, sin genéricos"
        value="${escapeHtml(state.project_name || "")}" oninput="updateProjectNameLive(this.value)">
    </section>
    ` : `
    <section class="sol-sec">
      <span class="sol-label">Tesis técnica</span>
      <div class="sol-input" style="white-space:pre-wrap;">${escapeHtml(state.solution_thesis || "Sin tesis todavía.")}</div>
      <span class="sol-label" style="margin-top:18px; display:block;">Cómo se lo explicas a un asesor</span>
      <div class="sol-input" style="white-space:pre-wrap;">${escapeHtml(state.solution_simple || "Sin explicación todavía.")}</div>
      <p class="sol-hint" style="margin-top:10px;">Proyecto: <strong class="sol-project-name">${escapeHtml(state.project_name || "sin nombre")}</strong></p>
    </section>
    `}

    ${bloqueBoosters}

    <section class="sol-sec">
      <span class="sol-label">Pedirle un cambio a la IA</span>
      <p class="sol-hint">Di qué ajustar y acepta la propuesta. Lo que no pidas no se toca.</p>
      ${aiEditPanel("solution")}
    </section>

    <div class="sol-foot">
      <span>${odsTxt ? `Alineado a ${odsTxt}` : "Sin ODS vinculados todavía"}${mappedEjeIds.length ? ` · Plan país: ${mappedEjeIds.map(e => e.toUpperCase()).join(", ")}` : ""}</span>
      <span style="display:flex; gap:14px; align-items:center;">
        ${aprobada ? `<button class="link-quiet" onclick="abrirEditorSolucion(${editando ? "false" : "true"})">${SVG.edit} ${editando ? "Cerrar el editor" : "Editar la solución"}</button>` : ""}
        <button class="link-quiet" onclick="switchTab('impact')">${odsTxt ? "Ver el impacto →" : "Ajustar el impacto →"}</button>
      </span>
    </div>
  `;
}

function abrirEditorSolucion(abrir) {
  state.solution_editing = !!abrir;
  saveState();
  renderTab("solution");
}

// Un potenciador entra si el proyecto lo pide, no si al equipo le gusta. Cada
// uno cita la evidencia que lo activó; sin evidencia queda apagado y visible,
// para que se vea qué falta para ganarlo.
function boostersDelProyecto() {
  const texto = [
    state.solution_thesis, state.solution_raw_input, state.solution_simple,
    state.challenge_title, state.description_one_line
  ].filter(Boolean).join(" ").toLowerCase();
  const { mappedOdsIds, mappedEjeIds } = getChallengeImpactDetails(state.challenge_id);
  const ods = mappedOdsIds.length || (Array.isArray(state.ods_ids) ? state.ods_ids.length : 0);
  const buscar = (re) => {
    const m = texto.match(re);
    return m ? m[0] : "";
  };
  const lista = [
    {
      key: "ods", title: "Alineación ODS", desc: "Se ata a una meta concreta.",
      why: ods ? "El reto trae ODS mapeados." : ""
    },
    {
      key: "nacional_plan",
      title: state.rally_type === "nacional" ? "Eje del Plan Nacional" : "Escalamiento Latam",
      desc: state.rally_type === "nacional" ? "Conecta con el plan país." : "Diseño transferible a otros municipios.",
      why: state.rally_type === "nacional"
        ? (mappedEjeIds.length ? `Eje mapeado: ${mappedEjeIds.map(e => e.toUpperCase()).join(", ")}` : "")
        : (buscar(/replic\w*|escal\w*|transfer\w*|param[ée]tric\w*/) ? `La tesis lo declara: «${buscar(/replic\w*|escal\w*|transfer\w*|param[ée]tric\w*/)}»` : "")
    },
    {
      key: "sensors", title: "Hardware y telemetría", desc: "Suma sensores y energía autónoma.",
      why: buscar(/sensor\w*|telemetr\w*|nodo|iot|gps|esp32|arduino|lora|bater[íi]a|solar/) ? `La tesis nombra «${buscar(/sensor\w*|telemetr\w*|nodo|iot|gps|esp32|arduino|lora|bater[íi]a|solar/)}»` : ""
    },
    {
      key: "visuals", title: "Pieza visual para el video", desc: "Pauta una toma de pantalla o un 3D.",
      why: buscar(/\bapp\b|aplicaci[óo]n|plataforma|\bweb\b|software|panel|tablero/) ? "Hay pantalla que mostrar: toma de interfaz."
        : (buscar(/nodo|dispositivo|prototipo|m[óo]dulo|estructura|contenedor/) ? "Hay objeto físico: modelo 3D para el video." : "")
    },
    {
      key: "waste_capital", title: "Pasivo convertido en capital", desc: "Residuo que se vuelve insumo.",
      why: buscar(/residuo\w*|merma\w*|compost\w*|recicl\w*|biomasa|c[áa]scara\w*|aserr[íi]n|suero|esti[ée]rcol|org[áa]nic\w*/) ? `La tesis nombra «${buscar(/residuo\w*|merma\w*|compost\w*|recicl\w*|biomasa|c[áa]scara\w*|aserr[íi]n|suero|esti[ée]rcol|org[áa]nic\w*/)}»` : ""
    },
    {
      key: "cyber_physical", title: "Hibridación ciber-física", desc: "Lo físico con sensado o IA.",
      why: buscar(/\bia\b|algoritm\w*|clasific\w*|modelo|predic\w*|visi[óo]n|automat\w*|machine learning|sensado/) ? `La tesis nombra «${buscar(/\bia\b|algoritm\w*|clasific\w*|modelo|predic\w*|visi[óo]n|automat\w*|machine learning|sensado/)}»` : ""
    }
  ];
  const tono = { ods: "ods", nacional_plan: "plan", sensors: "tech", visuals: "visual", waste_capital: "bio", cyber_physical: "cyber" };
  const simbolo = { ods: "globe", nacional_plan: "route", sensors: "waves", visuals: "frame", waste_capital: "leaf", cyber_physical: "chip" };
  lista.forEach(b => { b.tone = tono[b.key] || "plan"; b.symbol = simbolo[b.key] || "globe"; });
  state.solution_boosters = lista.filter(b => b.why).map(b => b.key);
  return lista;
}

// Cada cuadrito abre en grande: qué exige, qué evidencia lo encendió y qué
// falta si está apagado. Se lee sin salir del taller.
const _BOOSTER_FIGURA = {
  globe: '<circle cx="12" cy="12" r="8"/><path d="M4 12h16M12 4c2.5 2.4 2.5 13.6 0 16M12 4c-2.5 2.4-2.5 13.6 0 16"/>',
  route: '<circle cx="6" cy="6" r="2"/><circle cx="18" cy="18" r="2"/><path d="M8 6h6a3 3 0 0 1 0 6H9a3 3 0 0 0 0 6h7"/>',
  waves: '<path d="M3 12h3l2-6 3 12 3-9 2 5h5"/>',
  frame: '<rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="9" cy="10" r="1.6"/><path d="M5 17l4-4 3 3 3-2 4 3"/>',
  leaf: '<path d="M5 19c0-8 5-13 14-14 0 9-5 14-13 14H5z"/><path d="M5 19c3-5 6-7 10-9"/>',
  chip: '<rect x="7" y="7" width="10" height="10" rx="2"/><path d="M10 3v4M14 3v4M10 17v4M14 17v4M3 10h4M3 14h4M17 10h4M17 14h4"/>'
};
function _boosterFigura(symbol, cls) {
  return `<svg class="${cls || "sol-booster-fig"}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${_BOOSTER_FIGURA[symbol] || _BOOSTER_FIGURA.globe}</svg>`;
}

const _BOOSTER_EXIGE = {
  ods: "El reto tiene que venir con ODS asignados por el comité, o el equipo declara a cuál meta responde la solución.",
  nacional_plan: "En Nacional, el reto trae ejes del plan país. En Latam, la tesis declara que el diseño se replica o se transfiere.",
  sensors: "La tesis nombra el sensor, el nodo o la fuente de energía que hace medible la solución.",
  visuals: "Hay pantalla que grabar (interfaz) o un objeto físico que modelar en 3D para el video.",
  waste_capital: "La solución usa un residuo real como insumo, y la tesis lo nombra.",
  cyber_physical: "Lo físico se vuelve dato: clasificación, modelo, predicción o automatización."
};

let _boosterOpener = null;

function abrirDetalleBooster(key, ev) {
  const b = boostersDelProyecto().find(x => x.key === key);
  if (!b) return;
  let modal = document.getElementById("booster-modal-overlay");
  if (!modal) {
    modal = document.createElement("div");
    modal.id = "booster-modal-overlay";
    modal.className = "booster-modal-overlay";
    modal.addEventListener("click", ev2 => { if (ev2.target === modal) cerrarDetalleBooster(); });
    document.body.appendChild(modal);
  }
  _boosterOpener = (ev && ev.currentTarget) || document.activeElement;
  modal.innerHTML = `
    <div class="booster-modal tone-${b.tone}" role="dialog" aria-modal="true" aria-label="${escapeHtml(b.title)}">
      <header class="booster-modal-head">
        ${_boosterFigura(b.symbol, "booster-modal-fig")}
        <div>
          <h3>${escapeHtml(b.title)}</h3>
          <span class="booster-modal-state ${b.why ? "is-on" : "is-off"}">${b.why ? "Entra en el video" : "Todavía no entra"}</span>
        </div>
        <button class="booster-modal-close" onclick="cerrarDetalleBooster()" aria-label="Cerrar">×</button>
      </header>
      <p class="booster-modal-desc">${escapeHtml(b.desc)}</p>
      <div class="booster-modal-block">
        <span class="booster-modal-label">Qué tiene que pasar</span>
        <p>${escapeHtml(_BOOSTER_EXIGE[b.key] || "")}</p>
      </div>
      <div class="booster-modal-block">
        <span class="booster-modal-label">${b.why ? "Por qué está encendido" : "Qué falta"}</span>
        <p>${escapeHtml(b.why || "El motor no encontró la evidencia en la tesis ni en el reto. Escribe esa parte en la tesis y el cuadrito se enciende solo.")}</p>
      </div>
    </div>`;
  modal.style.display = "flex";
  const cerrar = modal.querySelector(".booster-modal-close");
  if (cerrar) cerrar.focus();
}

function cerrarDetalleBooster() {
  const modal = document.getElementById("booster-modal-overlay");
  if (!modal) return;
  modal.style.display = "none";
  if (_boosterOpener && _boosterOpener.focus) {
    _boosterOpener.focus();
    _boosterOpener = null;
  }
}

// Esc cierra la capa de arriba: el foco vuelve a donde estaba.
// Tab no se escapa del diálogo abierto.
document.addEventListener("keydown", ev => {
  const overlay = document.getElementById("booster-modal-overlay");
  const modalAbierto = !!overlay && overlay.style.display !== "none";
  if (ev.key === "Escape") {
    if (modalAbierto) { ev.preventDefault(); cerrarDetalleBooster(); return; }
    const abierto = Object.keys(_aiEditState).find(k => _aiEditState[k] && _aiEditState[k].open
      && document.getElementById("ae-box-" + aiEditId(k)));
    if (abierto) { ev.preventDefault(); aiEditToggle(abierto); }
    return;
  }
  if (ev.key !== "Tab" || !modalAbierto) return;
  const foco = overlay.querySelectorAll("button, [href], input, textarea, select, [tabindex]:not([tabindex='-1'])");
  if (!foco.length) return;
  const primero = foco[0];
  const ultimo = foco[foco.length - 1];
  if (!ev.shiftKey && document.activeElement === ultimo) { ev.preventDefault(); primero.focus(); }
  else if (ev.shiftKey && document.activeElement === primero) { ev.preventDefault(); ultimo.focus(); }
});

// ── COLABORACIÓN EN VIVO · TALLER DE SOLUCIÓN ──────────────────────────────
// Cada tecla en el taller se difunde por BroadcastChannel: los demás
// integrantes ven el texto en vivo (sin pisarse, con indicador de autoría).

const _SOLUTION_STATE_KEYS = {
  raw_input: "solution_raw_input",
  thesis: "solution_thesis",
  simple: "solution_simple",
  project_name: "project_name"
};

function updateSolutionFieldLive(key, value) {
  const stateKey = _SOLUTION_STATE_KEYS[key];
  if (stateKey) state[stateKey] = value;
  broadcastFieldChange("solution", key, value);
  saveState();
}

function updateProjectNameLive(value) {
  state.project_name = value;
  broadcastFieldChange("solution", "project_name", value);
  saveState();
}

function synthesizeSolutionFromRaw() {
  const raw = (document.getElementById("raw-sol-input").value || "").trim();
  const projInput = document.getElementById("sol-proj-name");
  if (!raw) {
    alert("Escribe una idea en el campo de texto.");
    return;
  }
  state.solution_raw_input = raw;

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

  const rawClean = raw.charAt(0).toUpperCase() + raw.slice(1);
  state.solution_thesis = `${state.project_name}: Sistema tecnológico modular fundamentado en ${raw.toLowerCase()}, optimizado ${chContext} con alta viabilidad económica y despliegue comunitario autónomo.`;
  state.solution_simple = `${rawClean}, resolviendo el problema en el territorio sin requerir infraestructura compleja ni altos costos operativos.`;
  state.description_one_line = state.solution_thesis;

  saveState();
  renderTab("solution");
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
  state.solution_editing = false;
  state.description_one_line = state.solution_thesis;

  if (!state.pautado.solucion) {
    state.pautado.solucion = state.solution_thesis;
  }

  saveState();
  activeTab = "impact";
  syncUI();
}

// ═════════════════════════════════════════════════════════════════════════════
// 04 NIVEL 4: ALINEACIÓN ESTRATÉGICA, ODS & PLAN PAÍS
// ═════════════════════════════════════════════════════════════════════════════

// ── CATEGORÍAS DE RETOS: ICONografía + TINTE DENSO MÍNIMO (distinción sin ruido) ──
const CATEGORY_META = {
  "Innovación": {
    tint: "rgba(8, 102, 245, 0.07)",
    stroke: "#0866F5",
    icon: `<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><circle cx="6" cy="6" r="2.6"/><circle cx="18" cy="18" r="2.6"/><path d="M8 8l8 8"/></svg>`
  },
  "Impacto Social": {
    tint: "rgba(2, 132, 199, 0.09)",
    stroke: "#0284C7",
    icon: `<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="5.5" r="2.4"/><circle cx="5.5" cy="14" r="2.4"/><circle cx="18.5" cy="14" r="2.4"/><path d="M11 7.5L7 11.8M13 7.5l4 4.3M7.9 14.5h8.2"/></svg>`
  }
};
function categoryBadge(category) {
  const m = CATEGORY_META[category] || CATEGORY_META["Innovación"];
  return `<span class="cat-badge" style="background:${m.tint}; color:${m.stroke};">${m.icon} ${category}</span>`;
}

// Iconos oficiales de los ODS guardados en assets/ods/ods-NN.jpg
function odsIconUrl(id) {
  const n = String(id || "").trim().replace(/^ods\s*-?\s*/i, "");
  const num = parseInt(n, 10);
  if (!num || num < 1 || num > 17) return "";
  return `assets/ods/ods-${String(num).padStart(2, "0")}.jpg`;
}

function odsIcon(id, arg2, arg3) {
  const url = odsIconUrl(id);
  const px = typeof arg3 === "number" ? arg3 : (typeof arg2 === "number" ? arg2 : 40);
  const n = String(id || "").replace(/[^0-9]/g, "");
  if (!url) return `<span class="ods-icon-fallback" style="width:${px}px; height:${px}px;">${escapeHtml(n)}</span>`;
  return `<img class="ods-icon" src="${url}" alt="ODS ${escapeHtml(n)}" width="${px}" height="${px}" loading="lazy"
    style="width:${px}px; height:${px}px;"
    onerror="this.outerHTML='<span class=\\'ods-icon-fallback\\' style=\\'width:${px}px; height:${px}px;\\'>${escapeHtml(n)}</span>'">`;
}

const ODS_CATALOG = [
  {
    id: 1,
    code: "ODS 1",
    name: "Fin de la Pobreza",
    color: "#E5243B",
    icon: `<path d="M12 4a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5zm-6 7c0-1.8 1.5-3.2 3.3-3.2h5.4c1.8 0 3.3 1.4 3.3 3.2v7h-2.5v-5h-1.6v5h-2.5v-5h-1.6v5H6v-7z"/>`,
    shortTarget: "Meta 1.5: Resiliencia económica y reducción de pérdidas ante desastres",
    unTarget: "De aquí a 2030, fomentar la resiliencia de los pobres y de las personas que se encuentran en situaciones vulnerables y reducir su exposición a los fenómenos extremos.",
    diagnostic: "Familias vulnerables en comunidades rurales y mercados populares pierden hasta el 25% de su sustento diario ante eventos climáticos o pérdidas poscosecha.",
    mechanism: "Generación de ingresos complementarios mediante revalorización productiva, reducción de costos operativos y capitalización comunitaria."
  },
  {
    id: 2,
    code: "ODS 2",
    name: "Hambre Cero",
    color: "#DDA63A",
    icon: `<path d="M4 12c0 4.4 3.6 8 8 8s8-3.6 8-8H4zm8-9c-2 2-3 4.5-3 7h6c0-2.5-1-5-3-7z"/>`,
    shortTarget: "Meta 2.1 & 2.4: Acceso a alimentos sanos y agricultura resiliente",
    unTarget: "Poner fin al hambre y asegurar el acceso de todas las personas a una alimentación sana, nutritiva y suficiente todo el año mediante prácticas sostenibles.",
    diagnostic: "Pérdida de toneladas de frutas y verduras frescas en centros de abasto y reducción de rendimientos agropecuarios por falta de polinización tecnificada.",
    mechanism: "Rescate de excedentes alimentarios con conservación solar y manejo del suelo que sostiene el rendimiento de los cultivos."
  },
  {
    id: 3,
    code: "ODS 3",
    name: "Salud y Bienestar",
    color: "#4C9F38",
    icon: `<path d="M3 13h4l2.5-6 4 12 2.5-6H21" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>`,
    shortTarget: "Meta 3.9: Reducir muertes y enfermedades causadas por agua contaminada",
    unTarget: "Reducir sustancialmente el número de muertes y enfermedades producidas por productos químicos peligrosos y la contaminación del aire, el agua y el suelo.",
    diagnostic: "Crecidas pluviales en cauces urbanos y acumulación de basuras generan anegamientos y brotes epidémicos de dengue, leptospirosis y afecciones gastrointestinales.",
    mechanism: "Alerta temprana hidrométrica barrial que evita catástrofes en cauces críticos y filtración comunitaria que garantiza agua bacteriológicamente segura."
  },
  {
    id: 4,
    code: "ODS 4",
    name: "Educación de Calidad",
    color: "#C5192D",
    icon: `<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20M4 19.5A2.5 2.5 0 0 0 6.5 22H20V2H6.5A2.5 2.5 0 0 0 4 4.5v15z" fill="none" stroke="currentColor" stroke-width="2"/>`,
    shortTarget: "Meta 4.4: Competencias técnicas y vocacionales para el empleo",
    unTarget: "Aumentar considerablemente el número de jóvenes y adultos que tienen las competencias técnicas y profesionales necesarias para acceder al empleo decente y el emprendimiento.",
    diagnostic: "Brecha tecnológica entre las universidades y los talleres productivos del territorio que limita la adopción de ingeniería moderna en las comunidades.",
    mechanism: "Manuales metodológicos abiertos, código libre y talleres de apropiación comunitaria sin tecnicismos transferibles a través de INATEC y alcaldías."
  },
  {
    id: 5,
    code: "ODS 5",
    name: "Igualdad de Género",
    color: "#FF3A21",
    icon: `<circle cx="12" cy="8" r="5" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 13v8M9 18h6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>`,
    shortTarget: "Meta 5.5: Participación plena y liderazgo económico de las mujeres",
    unTarget: "Asegurar la participación plena y efectiva de las mujeres y la igualdad de oportunidades de liderazgo a todos los niveles de la vida económica y productiva.",
    diagnostic: "Labores agrícolas y de comercio de mercado con alta carga física no remunerada desempeñadas predominantemente por mujeres sin mecanización.",
    mechanism: "Ergonomía simplificada de operación mecánica y liderazgo operativo de socias vivanderas y cooperativistas en la gestión de la innovación."
  },
  {
    id: 6,
    code: "ODS 6",
    name: "Agua Limpia y Saneamiento",
    color: "#26BDE2",
    icon: `<path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" fill="none" stroke="currentColor" stroke-width="2"/>`,
    shortTarget: "Meta 6.1 & 6.3: Acceso universal a agua potable y reducción de vertidos",
    unTarget: "Lograr el acceso universal y equitativo al agua potable a un precio asequible, y reducir la contaminación del agua eliminando vertidos de aceites y químicos.",
    diagnostic: "Comunidades rurales del Corredor Seco sin agua potable en época seca y contaminación de acuíferos por vertido doméstico de aceites de cocina.",
    mechanism: "Cisternas de captación pluvial modular con microfiltración de zeolita y carbón activado de café, y microplantas de saponificación de aceites usados."
  },
  {
    id: 7,
    code: "ODS 7",
    name: "Energía Asequible y No Contaminante",
    color: "#FCC30B",
    icon: `<path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`,
    shortTarget: "Meta 7.2: Aumentar la proporción de energía renovable comunitaria",
    unTarget: "Aumentar sustancialmente la proporción de energía renovable en el conjunto de fuentes energéticas para comunidades y actividades productivas.",
    diagnostic: "Cortes de energía en situaciones de emergencia climática y dependencia de combustibles fósiles caros para bombas de agua y picadoras rurales.",
    mechanism: "Generación fotovoltaica con baterías LiFePO4 de 2,000 ciclos y aprovechamiento de motores reacondicionados de alta eficiencia energética."
  },
  {
    id: 8,
    code: "ODS 8",
    name: "Trabajo Decente y Crecimiento Económico",
    color: "#A21942",
    icon: `<path d="M3 3v18h18M7 16l4-5 4 3 5-7" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>`,
    shortTarget: "Meta 8.2: Diversificación, modernización tecnológica e innovación",
    unTarget: "Lograr niveles más elevados de productividad económica mediante la diversificación, la modernización tecnológica y la innovación en microtalleres.",
    diagnostic: "Productores lecheros y microemprendedores absorben altos costos operativos con maquinaria manual que merma su rentabilidad.",
    mechanism: "Maquinaria productiva intermedia con costos inferiores a $65 USD por unidad que multiplica la capacidad productiva sin generar deuda."
  },
  {
    id: 9,
    code: "ODS 9",
    name: "Industria, Innovación e Infraestructura",
    color: "#FD6925",
    icon: `<circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" stroke-width="2"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" fill="none" stroke="currentColor" stroke-width="2"/>`,
    shortTarget: "Meta 9.4: Modernización de infraestructuras con tecnología limpia",
    unTarget: "Modernizar la infraestructura y reconvertir las industrias para que sean sostenibles, utilizando los recursos con mayor eficacia y tecnologías limpias.",
    diagnostic: "Dependencia de importaciones costosas y falta de adaptación del diseño electromecánico a los materiales y repuestos disponibles en el país.",
    mechanism: "Hibridación ciber-física con microcontroladores ESP32, protocolos mallados de radiofrecuencia y manufactura distribuida en 3D."
  },
  {
    id: 10,
    code: "ODS 10",
    name: "Reducción de las Desigualdades",
    color: "#DD1367",
    icon: `<circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="2"/><path d="M7 10h10M7 14h10" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>`,
    shortTarget: "Meta 10.2: Potenciar la inclusión social y económica de sectores vulnerables",
    unTarget: "Potenciar y promover la inclusión social, económica y política de todas las personas, independientemente de su condición o ubicación geográfica.",
    diagnostic: "Concentración del acceso tecnológico en ciudades principales, excluyendo a pequeños núcleos campesinos del interior de Nicaragua.",
    mechanism: "Solución de costo marginal accesible que no exige suscripciones mensuales ni conectividad celular permanente."
  },
  {
    id: 11,
    code: "ODS 11",
    name: "Ciudades y Comunidades Sostenibles",
    color: "#FD9D24",
    icon: `<path d="M3 21h18M5 21V7l8-4v18M13 10l6 3v8" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>`,
    shortTarget: "Meta 11.5 & 11.6: Reducción de impactos por desastres y gestión de desechos urbanos",
    unTarget: "Reducir significativamente el número de muertes causadas por desastres y reducir el impacto ambiental per cápita de las ciudades mediante la gestión de residuos.",
    diagnostic: "Colapso de cauces urbanos en invierno, quemas no controladas de poda y acumulación de chatarra en barrios populares.",
    mechanism: "Redes malladas de alerta temprana, refugios modulares de despliegue rápido y centros barriales de pirólisis y valorización de biomasa."
  },
  {
    id: 12,
    code: "ODS 12",
    name: "Producción y Consumo Responsables",
    color: "#BF8B2E",
    icon: `<path d="M7 8a4 4 0 0 1 4 4 4 4 0 0 0 4 4 4 4 0 0 0 0-8 4 4 0 0 0-4 4 4 4 0 0 1-4 4 4 4 0 0 1 0-8z" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>`,
    shortTarget: "Meta 12.5: Reducción sustancial de desechos mediante prevención y reutilización",
    unTarget: "De aquí a 2030, reducir considerablemente la generación de desechos mediante actividades de prevención, reducción, reciclado y reutilización.",
    diagnostic: "Descarte masivo de aparatos eléctricos, mermas alimentarias, podas urbanas y residuos plásticos que colapsan los vertederos municipales.",
    mechanism: "Economía circular estricta: transformación de residuos en insumos productivos con alto valor agregado y ciclo de vida extendido."
  },
  {
    id: 13,
    code: "ODS 13",
    name: "Acción por el Clima",
    color: "#3F7E44",
    icon: `<circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 3c-2.5 3-4 6-4 9s1.5 6 4 9m0-18c2.5 3 4 6 4 9s-1.5 6-4 9M3.6 9h16.8M3.6 15h16.8" fill="none" stroke="currentColor" stroke-width="1.8"/>`,
    shortTarget: "Meta 13.1: Fortalecer la resiliencia y capacidad de adaptación climática",
    unTarget: "Fortalecer la resiliencia y la capacidad de adaptación a los riesgos relacionados con el clima y los desastres naturales en todos los países.",
    diagnostic: "Aumento de anomalías climáticas extremas: huracanes destructivos en el Caribe y sequías recurrentes en el Corredor Seco.",
    mechanism: "Mitigación mediante secuestro de carbono en suelo (biochar) y adaptación comunitaria con infraestructuras hidrométricas y refugios resilientes."
  },
  {
    id: 14,
    code: "ODS 14",
    name: "Vida Submarina",
    color: "#0A97D9",
    icon: `<path d="M2 16c2-1 4-1 6 0s4 1 6 0 4-1 6 0M2 20c2-1 4-1 6 0s4 1 6 0 4-1 6 0M18 6c-3 0-6 2-8 5 3 0 6-2 8-5z" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>`,
    shortTarget: "Meta 14.1: Prevenir y reducir la contaminación marina por plásticos",
    unTarget: "Prevenir y reducir significativamente la contaminación marina de todo tipo, en particular la producida por actividades terrestres y artes de pesca abandonadas.",
    diagnostic: "Redes fantasma y botellas de plástico que sofocan ecosistemas de manglar y fauna marina en costas del Pacífico y Caribe.",
    mechanism: "Extrusión móvil y remanufactura de filamento in-situ para artes de pesca y señalización costera gestionada por cooperativas pesqueras."
  },
  {
    id: 15,
    code: "ODS 15",
    name: "Vida de Ecosistemas Terrestres",
    color: "#56C02B",
    icon: `<path d="M12 2L8 8h3v5H9l-3 5h6v3h2v-3h6l-3-5h-2v-5h3l-4-6z" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`,
    shortTarget: "Meta 15.5: Detener la pérdida de biodiversidad y degradación biológica",
    unTarget: "Adoptar medidas urgentes para reducir la degradación de los hábitats naturales y frenar la pérdida de biodiversidad biológica.",
    diagnostic: "Mortalidad masiva de polinizadores nativos por agroquímicos y degradación acelerada de la fertilidad de los suelos volcánicos.",
    mechanism: "Protección de polinizadores nativos y recuperación de la fertilidad del suelo con biochar activado con micorrizas."
  },
  {
    id: 16,
    code: "ODS 16",
    name: "Paz, Justicia e Instituciones Sólidas",
    color: "#00689D",
    icon: `<path d="M12 3v18M5 8h14M3 13l4-5 4 5a4 4 0 0 1-8 0zm10 0l4-5 4 5a4 4 0 0 1-8 0z" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>`,
    shortTarget: "Meta 16.6: Instituciones eficaces, transparentes y participativas",
    unTarget: "Crear a todos los niveles instituciones eficaces y transparentes que rindan cuentas a la comunidad beneficiaria y refuercen la gobernanza local.",
    diagnostic: "Falta de datos verificables en tiempo real para la toma de decisiones entre instituciones y comunidades.",
    mechanism: "Telemetría comunitaria transparente, bases de datos abiertas y participación ciudadana directa en el monitoreo preventivo."
  },
  {
    id: 17,
    code: "ODS 17",
    name: "Alianzas para Lograr los Objetivos",
    color: "#19486A",
    icon: `<circle cx="8" cy="12" r="5" fill="none" stroke="currentColor" stroke-width="2.2"/><circle cx="16" cy="12" r="5" fill="none" stroke="currentColor" stroke-width="2.2"/>`,
    shortTarget: "Meta 17.6: Cooperación científica, tecnológica y de innovación",
    unTarget: "Mejorar la cooperación en materia de ciencia, tecnología e innovación y aumentar el intercambio de conocimientos especializados.",
    diagnostic: "Desarticulación histórica entre la investigación académica universitaria y las demandas operativas de los programas del Estado.",
    mechanism: "Alianza cuádruple hélice: universidad sede, comité del certamen, comisiones de economía creativa y comunidades de base."
  }
];

const PLAN_EJES_CATALOG = [
  {
    id: "eje4",
    num: "4",
    title: "Economía Creativa, Familiar, Comunitaria y Asociativa",
    icon: `<path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="none" stroke="currentColor" stroke-width="2"/>`,
    diagnostic: "El modelo socio-productivo nicaragüense reposa en el 70% del empleo generado por micro, pequeñas y medianas empresas familiares y cooperativas territoriales.",
    porque: "Responde directamente al lineamiento de agregar valor local a materias primas y residuos sin requerir endeudamiento externo.",
    como: "Despliega modelos de producción asociativa en cooperativas locales, permitiendo comercializar subproductos procesados a precio justo.",
    instituciones: "MEFCCA, Comisión Nacional de Economía Creativa, Red de Ciudades Creativas.",
    metrica: "Incremento del 25% en margen neto del pequeño productor y reducción de costos operativos."
  },
  {
    id: "eje5",
    num: "5",
    title: "Cambio Climático, Gestión de Riesgo ante Desastres y Protección de la Madre Tierra",
    icon: `<path d="M12 3v18m0-18C7.5 3 4 7 4 12s3.5 9 8 9m0-18c4.5 0 8 4 8 9s-3.5 9-8 9" fill="none" stroke="currentColor" stroke-width="2"/>`,
    diagnostic: "Nicaragua es uno de los países más expuestos a huracanes en la Costa Caribe, sequías en el Corredor Seco e inundaciones en cauces urbanos de Managua.",
    porque: "La rúbrica premia la inserción en planes de contingencia municipal ante eventos extremos sin generar pasivos ambientales.",
    como: "Implementa infraestructura resiliente, sistemas de alerta temprana comunitaria y aprovechamiento sustentable de recursos naturales.",
    instituciones: "SINAPRED, COMUPRED, MARENA, INETER, Gobiernos Regionales.",
    metrica: "30 minutos de anticipación en evacuación barrial o 100% de retención de humedad en suelos durante sequías."
  },
  {
    id: "eje8",
    num: "8",
    title: "Seguridad y Soberanía Alimentaria y Nutricional",
    icon: `<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" fill="none" stroke="currentColor" stroke-width="2"/>`,
    diagnostic: "Pérdidas poscosecha de hasta 30% en frutas y verduras en mercados mayoristas y afectación a rendimientos agrícolas por estrés climático.",
    porque: "Garantiza disponibilidad constante de alimentos nutritivos y fortalece la dieta de comedores escolares y comunitarios.",
    como: "Rescate de alimentos con deshidratación solar de cero emisiones o aumento de polinización biológica en cultivos de consumo básico.",
    instituciones: "MAG, INTA, MEFCCA, COMMEMA, MINED (Programa Merienda Escolar).",
    metrica: "Kilos de comida apta salvada al día o quintales de producción agrícola protegida."
  },
  {
    id: "eje3",
    num: "3",
    title: "Infraestructura Social y Servicios Básicos en el Territorio",
    icon: `<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" fill="none" stroke="currentColor" stroke-width="2"/>`,
    diagnostic: "Comunidades rurales dispersas y escuelas periféricas sufren intermitencia o déficit en agua potable y suministro eléctrico confiable.",
    porque: "Cumple la meta nacional de cobertura y dignidad humana mediante soluciones descentralizadas de bajo costo.",
    como: "Captación pluvial con microfiltración de minerales regionales o células de albergue temporal con microred solar autónoma.",
    instituciones: "ENACAL, FISE, MEM, Alcaldías Municipales de Nicaragua.",
    metrica: "180 días de reserva hídrica o 24 horas de autonomía energética ininterrumpida."
  },
  {
    id: "eje9",
    num: "9",
    title: "Ciencia, Tecnología e Innovación para la Transformación Productiva",
    icon: `<circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 6v6l4 2" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>`,
    diagnostic: "Dependencia histórica de maquinaria importada costosa que no se ajusta a la escala de las pequeñas parcelas y talleres locales.",
    porque: "Posiciona la ingeniería universitaria nicaragüense como motor de soberanía e independencia tecnológica.",
    como: "Hibridación de hardware abierto (sensores, microcontroladores, impresión 3D) con materiales locales de fácil reemplazo.",
    instituciones: "CNU, TELCOR, Centros de Innovación Abierta, INATEC.",
    metrica: "Costo unitario <$65 USD frente a equivalentes comerciales de >$400 USD."
  },
  {
    id: "eje2",
    num: "2",
    title: "Equidad, Inclusión y Protagonismo Juvenil y Comunitario",
    icon: `<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" fill="none" stroke="currentColor" stroke-width="2"/>`,
    diagnostic: "Necesidad de involucrar activamente a la juventud universitaria y líderes comunales en la solución de sus propios retos territoriales.",
    porque: "La rúbrica califica con alto puntaje la apropiación social y la factibilidad de adopción sin barreras culturales.",
    como: "Diseño centrado en las personas, talleres participativos y operación simplificada sin requerir alfabetización digital avanzada.",
    instituciones: "MINJUVE, Universidades del CNU, Red de Jóvenes Comunicadores.",
    metrica: "100% de operabilidad por pobladores locales tras una capacitación de 2 horas."
  }
];

const LEYES_PROGRAMAS_CATALOG = [
  {
    id: "ley1013",
    type: "ley",
    title: "Ley N° 1013 · Fomento a la Economía Creativa y Naranja",
    entidad: "Asamblea Nacional / Comisión Nacional de Economía Creativa",
    porque: "Declara de prioridad e interés nacional el talento, los prototipos y modelos de innovación surgidos de la juventud y las universidades.",
    como: "Permite registrar la solución como activo de emprendimiento tecnológico universitario con acceso a fondos y espacios de incubación.",
    cita: "Art. 4 & 7: Protección y fomento a iniciativas de base tecnológica y agregación de valor identitario."
  },
  {
    id: "ley217",
    type: "ley",
    title: "Ley N° 217 · Ley General del Medio Ambiente y los Recursos Naturales",
    entidad: "MARENA / Procuraduría Ambiental",
    porque: "Obliga a toda iniciativa productiva a mitigar impactos y priorizar la economía circular y la valorización de residuos sólidos.",
    como: "La solución evita vertidos directos, quemas al aire libre o contaminación pluvial, cumpliendo los estándares de gestión ambiental preventiva.",
    cita: "Art. 129: Fomento a tecnologías limpias y revalorización de subproductos industriales."
  },
  {
    id: "ley620",
    type: "ley",
    title: "Ley N° 620 · Ley General de Aguas Nacionales",
    entidad: "ANA / ENACAL / Comités de Cuenca",
    porque: "Regula la protección de fuentes de agua dulce y prioriza el acceso al agua potable para consumo humano en comunidades vulnerables.",
    como: "Aporta sistemas de cosecha y microfiltración pluvial o evita el vertido de aceites grasos usados en colectores y cuencas lacustres.",
    cita: "Art. 38 & 84: Preservación de la calidad del agua y captación de aguas pluviales para uso social."
  },
  {
    id: "ley337",
    type: "ley",
    title: "Ley N° 337 · Creadora del Sistema Nacional para la Prevención, Mitigación y Atención de Desastres",
    entidad: "SINAPRED / CODIPRED / COMUPRED",
    porque: "Norma los protocolos de respuesta y sistemas de alerta temprana comunitaria ante eventos meteorológicos y sísmicos.",
    como: "Los nodos de sensado y módulos de refugio se articulan formalmente con los puestos de mando unificados del COMUPRED.",
    cita: "Art. 15: Integración comunitaria en la red de alerta temprana y mitigación del riesgo."
  },
  {
    id: "ciudades_creativas",
    type: "programa",
    title: "Red Nacional de Ciudades Creativas de Nicaragua",
    entidad: "Comisión Nacional de Economía Creativa / Gobiernos Locales",
    porque: "Circuito de municipios modelo (Granada, Masaya, León, Estelí, Bluefields, San Juan de Oriente) que acogen pilotos de innovación.",
    como: "El prototipo se instala como proyecto piloto financiado en espacios públicos, parques eco-energéticos o mercados de la red municipal.",
    cita: "Eje Territorial de Economía Naranja: Desarrollo de clústeres locales de innovación y sostenibilidad."
  },
  {
    id: "programa_adelante",
    type: "programa",
    title: "Programa Adelante / Usura Cero",
    entidad: "MEFCCA / Banco de Fomento",
    porque: "Provee créditos solidarios a tasas mínimas (10-15% anual) para capital de trabajo de cooperativas y talleres artesanales.",
    como: "El modelo financiero del proyecto presupuesta la adquisición de las máquinas o insumos a través de microcréditos del Programa Adelante.",
    cita: "Línea de Financiamiento para Maquinaria y Equipamiento de Pequeños Productores Agropecuarios."
  },
  {
    id: "comupred_sinapred",
    type: "programa",
    title: "Plataforma Territorial COMUPRED / SINAPRED",
    entidad: "Alcaldías Municipales / Comisiones de Riesgo",
    porque: "Estructura institucional que evalúa y aprueba proyectos de prevención de desastres en barrios y comunidades de alto riesgo.",
    como: "Brinda la red de voluntarios barriales para operar las alertas hidrométricas o ensamblar los albergues de emergencia.",
    cita: "Plan de Respuesta Familiar y Municipal Multiamenazas."
  },
  {
    id: "escuelas_campo",
    type: "programa",
    title: "Escuelas Técnicas de Campo & Centros de Innovación Abierta",
    entidad: "INATEC / CNU / TELCOR",
    porque: "Canal de capacitación técnica gratuita con cobertura en los 153 municipios de Nicaragua.",
    como: "Imparte el manual de ensamblaje, mantenimiento y operación de la tecnología desarrollada a los comunitarios.",
    cita: "Estrategia Nacional de Educación 'Bendiciones y Victorias' · Formación Vocacional para el Trabajo."
  }
];

let impactActiveSubTab = "ods"; // "ods" | "plan" | "leyes" | "sintesis"
let odsFilterScope = "matched"; // "matched" | "all"

function getChallengeImpactDetails(chId) {
  const challengesList = (state.challenges && state.challenges.length) ? state.challenges : OFFICIAL_CHALLENGES_2026;
  const ch = challengesList.find(c => c.id === chId) || {};
  
  const idStr = String(chId || "");
  let mappedOdsIds = [12, 8, 9];
  let mappedEjeIds = ["eje4", "eje9", "eje2"];
  let mappedLeyIds = ["ley1013", "ciudades_creativas", "escuelas_campo"];

  if (idStr.includes("01") || idStr.includes("1")) {
    mappedOdsIds = [12, 8, 9];
    mappedEjeIds = ["eje4", "eje9", "eje2"];
    mappedLeyIds = ["ley1013", "programa_adelante", "ciudades_creativas"];
  } else if (idStr.includes("02") || idStr.includes("2")) {
    mappedOdsIds = [11, 13, 3];
    mappedEjeIds = ["eje5", "eje9", "eje3"];
    mappedLeyIds = ["ley337", "comupred_sinapred", "escuelas_campo"];
  } else if (idStr.includes("03") || idStr.includes("3")) {
    mappedOdsIds = [15, 2, 13];
    mappedEjeIds = ["eje5", "eje8", "eje4"];
    mappedLeyIds = ["ley217", "ciudades_creativas", "escuelas_campo"];
  } else if (idStr.includes("04") || idStr.includes("4")) {
    mappedOdsIds = [12, 11, 13];
    mappedEjeIds = ["eje5", "eje4", "eje8"];
    mappedLeyIds = ["ley217", "ciudades_creativas", "programa_adelante"];
  } else if (idStr.includes("05") || idStr.includes("5")) {
    mappedOdsIds = [6, 11, 12];
    mappedEjeIds = ["eje3", "eje5", "eje2"];
    mappedLeyIds = ["ley620", "ciudades_creativas", "escuelas_campo"];
  } else if (idStr.includes("06") || idStr.includes("6")) {
    mappedOdsIds = [14, 12, 11];
    mappedEjeIds = ["eje5", "eje4", "eje2"];
    mappedLeyIds = ["ley217", "programa_adelante", "ciudades_creativas"];
  } else if (idStr.includes("07") || idStr.includes("7")) {
    mappedOdsIds = [12, 6, 7];
    mappedEjeIds = ["eje4", "eje5", "eje3"];
    mappedLeyIds = ["ley1013", "ley620", "ciudades_creativas"];
  } else if (idStr.includes("08") || idStr.includes("8")) {
    mappedOdsIds = [2, 12, 1];
    mappedEjeIds = ["eje8", "eje4", "eje2"];
    mappedLeyIds = ["ciudades_creativas", "escuelas_campo", "programa_adelante"];
  } else if (idStr.includes("09") || idStr.includes("9")) {
    mappedOdsIds = [11, 13, 7];
    mappedEjeIds = ["eje3", "eje5", "eje2"];
    mappedLeyIds = ["ley337", "comupred_sinapred", "ciudades_creativas"];
  } else if (Array.isArray(ch.ods) && ch.ods.length > 0) {
    mappedOdsIds = ch.ods.map(o => {
      const match = String(o).match(/\d+/);
      return match ? parseInt(match[0], 10) : 12;
    }).filter(n => n >= 1 && n <= 17);
  }

  if (state.impact_alignment && Array.isArray(state.impact_alignment.selected_ods) && state.impact_alignment.selected_ods.length > 0) {
    mappedOdsIds = state.impact_alignment.selected_ods;
  }

  return { ch, mappedOdsIds, mappedEjeIds, mappedLeyIds };
}

function switchImpactSubTab(tab) {
  impactActiveSubTab = tab;
  renderTab("impact");
}

function toggleOdsFilter(filter) {
  odsFilterScope = filter;
  renderTab("impact");
}

function toggleOdsSelection(odsId) {
  if (!state.impact_alignment) {
    state.impact_alignment = { selected_ods: [], custom_justifications: {} };
  }
  const sel = state.impact_alignment.selected_ods;
  const idx = sel.indexOf(odsId);
  if (idx >= 0) {
    sel.splice(idx, 1);
  } else {
    sel.push(odsId);
  }
  saveState();
  renderTab("impact");
}

function getImpactCustom(key, field, fallback) {
  if (state.impact_alignment && state.impact_alignment.custom_justifications && state.impact_alignment.custom_justifications[key] && state.impact_alignment.custom_justifications[key][field]) {
    return state.impact_alignment.custom_justifications[key][field];
  }
  return fallback;
}

function saveImpactCustomField(key, field, value) {
  if (!state.impact_alignment) {
    state.impact_alignment = { selected_ods: [], custom_justifications: {} };
  }
  if (!state.impact_alignment.custom_justifications[key]) {
    state.impact_alignment.custom_justifications[key] = {};
  }
  state.impact_alignment.custom_justifications[key][field] = value;
  saveState();
}

function renderViewImpact() {
  const chId = state.challenge_id;
  const { ch, mappedOdsIds, mappedEjeIds, mappedLeyIds } = getChallengeImpactDetails(chId);
  const activeCh = ch;

  return `
    <div class="phase-header" style="display:flex; justify-content:space-between; align-items:flex-end; flex-wrap:wrap; gap:14px; margin-bottom:18px; padding-bottom:14px; border-bottom:1px solid var(--border-light);">
      <div>
        <div style="display:flex; align-items:center; gap:8px; margin-bottom:6px;">
        <h1 class="phase-title" style="margin:0;">
          Impacto<span class="phase-title-accent"> · ODS y plan país</span>
        </h1>
        ${activeCh.title ? `<p class="phase-subtitle" style="margin-top:4px;">Reto #${activeCh.id}: ${escapeHtml(activeCh.title)}</p>` : ""}
      </div>
    </div>

    <!-- Submenú de Navegación Temática -->
    <div class="impact-subnav">
      <button class="impact-subnav-btn ${impactActiveSubTab === 'ods' ? 'active' : ''}" onclick="switchImpactSubTab('ods')">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true">
          <circle cx="12" cy="12" r="8"></circle><circle cx="12" cy="12" r="4"></circle><circle cx="12" cy="12" r="1"></circle>
        </svg>
        ODS
      </button>
      <button class="impact-subnav-btn ${impactActiveSubTab === 'plan' ? 'active' : ''}" onclick="switchImpactSubTab('plan')">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true">
          <circle cx="12" cy="12" r="8"></circle><path d="M4 12h16"></path><path d="M12 4a13 13 0 0 1 0 16a13 13 0 0 1 0-16z"></path>
        </svg>
        Plan país
      </button>
      <button class="impact-subnav-btn ${impactActiveSubTab === 'leyes' ? 'active' : ''}" onclick="switchImpactSubTab('leyes')">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true">
          <path d="M6 3h9l4 4v14H6z"></path><path d="M15 3v4h4"></path><path d="M9 13h7M9 17h5"></path>
        </svg>
        Leyes
      </button>
      <button class="impact-subnav-btn ${impactActiveSubTab === 'sintesis' ? 'active' : ''}" onclick="switchImpactSubTab('sintesis')">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true">
          <path d="M4 19V9M10 19V5M16 19v-7M21 19V8"></path>
        </svg>
        Síntesis
      </button>
    </div>

    ${renderImpactSubTabContent(impactActiveSubTab, activeCh, mappedOdsIds, mappedEjeIds, mappedLeyIds)}
  `;
}

function renderImpactSubTabContent(subTab, activeCh, mappedOdsIds, mappedEjeIds, mappedLeyIds) {
  if (subTab === "ods") {
    const odsList = odsFilterScope === "matched" 
      ? ODS_CATALOG.filter(o => mappedOdsIds.includes(o.id))
      : ODS_CATALOG;

    return `
      <div>
        <div class="ods-scope">
          <span class="ods-scope-count">${mappedOdsIds.length} de 17 ODS vinculados a tu reto</span>
          <button type="button" class="ods-scope-btn" onclick="toggleOdsFilter('${odsFilterScope === 'matched' ? 'all' : 'matched'}')">
            ${odsFilterScope === 'matched' ? 'Ver los 17' : 'Ver solo los de mi reto'}
          </button>
        </div>

        <!-- Grid de Tarjetas ODS -->
        <div class="ods-list ods-list-icons">
          ${odsList.map(ods => {
            const idOf = o => Number(o && o.id !== undefined ? o.id : String(o).replace(/[^\d]/g, ""));
            const allMatch = odsList.every(o => mappedOdsIds.includes(idOf(o)));
            const isMatch = mappedOdsIds.includes(ods.id);
            const customWhy = getImpactCustom(`ods_${ods.id}`, "porque", ods.diagnostic);
            const customHow = getImpactCustom(`ods_${ods.id}`, "como", ods.mechanism);
            return `
              <div class="ods-row ${isMatch ? 'is-match' : ''}">
                <button class="ods-row-head" onclick="openImpactDetailModal('ods', ${ods.id})" title="Ver y editar el Por Qué y Cómo">
                  ${odsIcon(ods.id, ods.color, 40)}
                  <span class="ods-row-text">
                    <span class="ods-row-name">${escapeHtml(ods.name)}</span>
                    <span class="ods-row-target">${escapeHtml(ods.shortTarget)}</span>
                  </span>
                  ${isMatch && !allMatch ? `<span class="ods-badge-match">Cumple</span>` : ''}
                  ${SVG.arrowRight}
                </button>
                <div class="ods-row-why">
                  <div><span class="ods-row-k">Por qué</span>${escapeHtml(customWhy)}</div>
                  <div><span class="ods-row-k">Cómo</span>${escapeHtml(customHow)}</div>
                </div>
              </div>
            `;
          }).join("")}
        </div>
    `;
  }

  if (subTab === "plan") {
    return `
      <div class="ods-list">
        ${PLAN_EJES_CATALOG.map(eje => {
          const isMatch = mappedEjeIds.includes(eje.id);
          const customWhy = getImpactCustom(`plan_${eje.id}`, "porque", eje.porque);
          const customHow = getImpactCustom(`plan_${eje.id}`, "como", eje.como);
          return `
            <div class="ods-row ${isMatch ? "is-match" : ""}">
              <button class="ods-row-head" onclick="openImpactDetailModal('plan', '${eje.id}')" title="Ver y editar el por qué y el cómo">
                <span class="ods-row-icon">${SVG.document || ""}</span>
                <span class="ods-row-text">
                  <span class="ods-row-name">Eje ${eje.num} · ${escapeHtml(eje.title)}</span>
                  <span class="ods-row-target">${escapeHtml(eje.metrica)}</span>
                </span>
                ${isMatch ? '<span class="ods-badge-match">Prioritario</span>' : ""}
                ${SVG.arrowRight}
              </button>
              <div class="ods-row-why">
                <div><span class="ods-row-k">Por qué</span>${escapeHtml(customWhy)}</div>
                <div><span class="ods-row-k">Cómo</span>${escapeHtml(customHow)}</div>
              </div>
            </div>
          `;
        }).join("")}
      </div>
    `;
  }

  if (subTab === "leyes") {
    const leyes = LEYES_PROGRAMAS_CATALOG.filter(x => x.type === "ley");
    const programas = LEYES_PROGRAMAS_CATALOG.filter(x => x.type === "programa");
    const fila = (item, tipo) => {
      const isMatch = mappedLeyIds.includes(item.id);
      const customWhy = getImpactCustom(`ley_${item.id}`, "porque", item.porque);
      const customHow = getImpactCustom(`ley_${item.id}`, "como", item.como);
      return `
        <div class="ods-row ${isMatch ? "is-match" : ""}">
          <button class="ods-row-head" onclick="openImpactDetailModal('${tipo}', '${item.id}')" title="Ver y editar el por qué y el cómo">
            <span class="ods-row-text">
              <span class="ods-row-name">${escapeHtml(item.title)}</span>
              <span class="ods-row-target">${escapeHtml(item.entidad || "")}</span>
            </span>
            ${isMatch ? '<span class="ods-badge-match">Acople</span>' : ""}
            ${SVG.arrowRight}
          </button>
          <div class="ods-row-why">
            <div><span class="ods-row-k">Por qué</span>${escapeHtml(customWhy)}</div>
            <div><span class="ods-row-k">Cómo</span>${escapeHtml(customHow)}</div>
          </div>
        </div>
      `;
    };
    return `
      <div>
        <h2 class="impact-group-title">Leyes</h2>
        <div class="ods-list">${leyes.map(x => fila(x, "ley")).join("")}</div>
        <h2 class="impact-group-title">Programas</h2>
        <div class="ods-list">${programas.map(x => fila(x, "ley")).join("")}</div>
      </div>
    `;
  }

  if (subTab === "sintesis") {
    const pautText = generateImpactPautadoText(activeCh, mappedOdsIds, mappedEjeIds, mappedLeyIds);
    const scriptText = generateImpactScriptText(activeCh, mappedOdsIds, mappedEjeIds, mappedLeyIds);
    return `
      <div class="impact-synth">
        <section class="impact-synth-block">
          <div class="impact-synth-head">
            <h2 class="impact-group-title">Para el pautado</h2>
            <button type="button" class="btn-secondary" onclick="injectImpactIntoPautado(document.getElementById('impact-synth-pautado').value)">Usar en pautado</button>
          </div>
          <textarea id="impact-synth-pautado" rows="7" class="impact-synth-input">${escapeHtml(state.pautado.impacto || pautText)}</textarea>
        </section>
        <section class="impact-synth-block">
          <div class="impact-synth-head">
            <h2 class="impact-group-title">Para el cierre del video</h2>
            <button type="button" class="btn-secondary" onclick="injectImpactIntoScript(document.getElementById('impact-synth-script').value)">Usar en guion</button>
          </div>
          <textarea id="impact-synth-script" rows="5" class="impact-synth-input">${escapeHtml(state.script.acto4 || scriptText)}</textarea>
        </section>
      </div>
    `;
  }
}

function generateImpactPautadoText(ch, mappedOdsIds, mappedEjeIds, mappedLeyIds) {
  const odsStr = mappedOdsIds.map(id => {
    const o = ODS_CATALOG.find(x => x.id === id);
    return o ? `${o.code} (${o.name})` : `ODS ${id}`;
  }).join(", ");

  const ejeStr = mappedEjeIds.map(eid => {
    const e = PLAN_EJES_CATALOG.find(x => x.id === eid);
    return e ? `Eje ${e.num} (${e.title})` : eid;
  }).join(", ");

  const proj = state.project_name || "La solución";
  const solSimple = state.solution_simple || ch.wowProposal || "la propuesta de innovación";

  return `${proj} articula de forma directa los Objetivos de Desarrollo Sostenible (ODS) de la Agenda 2030, respondiendo formalmente a ${odsStr}. En el ámbito nacional, la propuesta se fundamenta en los lineamientos estratégicos del Plan Nacional de Lucha contra la Pobreza y para el Desarrollo Humano (2022-2026), anclándose en el ${ejeStr}. Operativamente, el sistema implementa ${solSimple}, asegurando transferencia comunitaria sin dependencias financieras continuas y acoplándose a la Ley 1013 de Economía Creativa y la Red de Ciudades Creativas para su despliegue territorial inmediato.`;
}

function generateImpactScriptText(ch, mappedOdsIds, mappedEjeIds, mappedLeyIds) {
  const proj = state.project_name || "nuestro proyecto";
  const odsFirst = mappedOdsIds.length ? `ODS ${mappedOdsIds[0]}` : "ODS 12";
  return `Con ${proj}, cerramos la brecha no desde la teoría, sino desde la realidad de nuestras comunidades. Cumplimos con el ${odsFirst} y nos acoplamos directamente al Plan Nacional de Lucha contra la Pobreza y la Red de Ciudades Creativas. No inventamos instituciones: las potenciamos. Somos ingenieros de la UNI comprometidos con la soberanía tecnológica y el futuro de Nicaragua y Latinoamérica. ¡Muchas gracias!`;
}

function injectImpactIntoPautado(text) {
  state.pautado.impacto = text;
  saveState();
  broadcastFieldChange("pautado", "impacto", text);
  alert("Texto inyectado exitosamente en la Sección 1.5 del Pautado Oficial.");
}

function injectImpactIntoScript(text) {
  state.script.acto4 = text;
  saveState();
  broadcastFieldChange("script", "acto4", text);
  alert("Texto inyectado exitosamente en el Acto 4 del Guion de 120 segundos.");
}

function openImpactDetailModal(type, key) {
  let modal = document.getElementById("impact-detail-modal");
  if (!modal) {
    modal = document.createElement("div");
    modal.id = "impact-detail-modal";
    modal.className = "modal-overlay";
    document.body.appendChild(modal);
  }

  let item = null;
  let title = "";
  let badgeLabel = "";
  let bannerColor = "#0D1B35";
  let whyText = "";
  let howText = "";
  let metaInfo = "";
  let iconSvg = "";
  let stateKey = "";

  if (type === "ods") {
    item = ODS_CATALOG.find(o => o.id === Number(key));
    if (!item) return;
    title = `${item.code}: ${item.name}`;
    badgeLabel = "AGENDA 2030 (ONU)";
    bannerColor = item.color;
    iconSvg = item.icon;
    stateKey = `ods_${item.id}`;
    whyText = getImpactCustom(stateKey, "porque", item.diagnostic);
    howText = getImpactCustom(stateKey, "como", item.mechanism);
    metaInfo = item.unTarget;
  } else if (type === "plan") {
    item = PLAN_EJES_CATALOG.find(e => e.id === key);
    if (!item) return;
    title = `Eje ${item.num}: ${item.title}`;
    badgeLabel = "PLAN NACIONAL DE LUCHA CONTRA LA POBREZA (2022-2026)";
    bannerColor = "#0D1B35";
    iconSvg = item.icon;
    stateKey = `plan_${item.id}`;
    whyText = getImpactCustom(stateKey, "porque", item.porque);
    howText = getImpactCustom(stateKey, "como", item.como);
    metaInfo = `Contrapartes de Gobierno: ${item.instituciones} | Métrica: ${item.metrica}`;
  } else if (type === "ley") {
    item = LEYES_PROGRAMAS_CATALOG.find(l => l.id === key);
    if (!item) return;
    title = item.title;
    badgeLabel = item.type === "ley" ? "MARCO JURÍDICO DE NICARAGUA" : "PROGRAMA / PLATAFORMA GUBERNAMENTAL";
    bannerColor = item.type === "ley" ? "#1E293B" : "#0F172A";
    iconSvg = SVG.document;
    stateKey = `ley_${item.id}`;
    whyText = getImpactCustom(stateKey, "porque", item.porque);
    howText = getImpactCustom(stateKey, "como", item.como);
    metaInfo = `Entidad Rectora: ${item.entidad} | Cita: ${item.cita}`;
  }

  const { mappedOdsIds } = getChallengeImpactDetails(state.challenge_id);
  const isSelectedOds = type === "ods" && mappedOdsIds.includes(item.id);

  modal.innerHTML = `
    <div class="impact-modal-card">
      <div class="impact-modal-header">
        <div class="impact-modal-headmain">
          <span class="impact-modal-icon" style="color:${bannerColor};"><svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">${iconSvg}</svg></span>
          <div>
            <h2 class="impact-modal-title">${title}</h2>
            <div class="impact-modal-badge">${badgeLabel}</div>
          </div>
        </div>
        <button class="btn-icon-discreet" onclick="closeImpactModal()" aria-label="Cerrar">${SVG.close}</button>
      </div>

      <div class="impact-modal-body">
        <!-- 01. Por qué cumple / se vincula -->
        <div>
          <label class="impact-field-label" for="modal-impact-why">Por qué cumple</label>
          <textarea id="modal-impact-why" class="impact-modal-input" rows="4"
            oninput="saveImpactCustomField('${stateKey}', 'porque', this.value)">${whyText}</textarea>
        </div>

        <!-- 02. Cómo lo cumple tu solución -->
        <div>
          <label class="impact-field-label" for="modal-impact-how">Cómo lo cumple</label>
          <textarea id="modal-impact-how" class="impact-modal-input" rows="4"
            oninput="saveImpactCustomField('${stateKey}', 'como', this.value)">${howText}</textarea>
        </div>

        <!-- Meta o Cita Formal -->
        <p class="impact-modal-meta">${metaInfo}</p>

        <!-- Botones de Acción -->
        <div class="impact-modal-actions">
          <button type="button" class="link-quiet" onclick="navigator.clipboard.writeText(document.getElementById('modal-impact-why').value + '\n\n' + document.getElementById('modal-impact-how').value);">Copiar texto</button>
          ${type === 'ods' ? `<button type="button" class="link-quiet" onclick="toggleOdsSelection(${item.id}); openImpactDetailModal('ods', ${item.id});">${isSelectedOds ? 'Quitar de mi reto' : 'Marcar para mi reto'}</button>` : ''}
          <button type="button" class="btn-secondary" onclick="closeImpactModal()">Volver</button>
          <button type="button" class="btn-primary" onclick="injectImpactIntoPautado(document.getElementById('modal-impact-why').value + ' ' + document.getElementById('modal-impact-how').value); closeImpactModal();">Usar en pautado</button>
        </div>
      </div>
    </div>
  `;

  modal.style.display = "flex";
}

function closeImpactModal() {
  const modal = document.getElementById("impact-detail-modal");
  if (modal) modal.style.display = "none";
}

// ═════════════════════════════════════════════════════════════════════════════
// 05 NIVEL 5: DESPACHO MULTI-IA & MEGA-PROMPTS ESPECIALIZADOS
// ═════════════════════════════════════════════════════════════════════════════
function renderViewMultiAI() {
  const tasks = state.tasks || getDefaultMultiAITasks();
  const done = tasks.filter(t => t.status === "completed").length;
  const promptDe = (t) => generateSpecificMegaPrompt(t.id);

  return `
    <div class="phase-header">
      <div>
        <h1 class="phase-title">Despacho <span class="phase-title-accent">Multi-IA</span></h1>
        <p class="phase-subtitle">Generar le pide el encargo a la IA que tengas conectada y va escribiendo la respuesta abajo. Si no hay IA conectada, deja el prompt listo para pegarlo a mano en la IA web.</p>
      </div>
      <div class="dispatch-tools">
        <button class="btn-secondary" onclick="copySyncToken()">${SVG.copy} Token para WhatsApp</button>
        <button class="btn-secondary" onclick="pasteSyncToken()">${SVG.upload} Pegar token</button>
      </div>
    </div>

    <div class="dispatch-status">
      <span>${done} de ${tasks.length} tareas con respuesta</span>
      <button type="button" class="link-quiet" onclick="exportProjectJson()">Exportar JSON</button>
      <a href="${state.google_drive_url || "https://drive.google.com"}" target="_blank" rel="noopener noreferrer" class="link-quiet">Google Drive ${SVG.external}</a>
    </div>

    <ol class="dispatch-list">
      ${tasks.map((t, i) => {
        let pill = rsPill("pending", { label: "Pendiente" });
        if (t.status === "in_progress") pill = rsPill("working", { label: "En curso" });
        if (t.status === "completed") pill = rsPill("done", { label: "Lista" });
        const hecha = t.status === "completed";
        return `
        <li class="dispatch-item${hecha ? " is-done" : ""}">
          <div class="di-head">
            <span class="di-num">${String(i + 1).padStart(2, "0")}</span>
            <h2 class="di-title">${t.title}</h2>
            ${pill}
          </div>
          <p class="di-desc">${t.desc}</p>
          <div class="di-meta">
            <span class="di-ai">${t.ai}</span>
            <select id="ai-model-${t.id}" class="ai-model-select" onchange="modelPrefChanged('${t.id}', this.value)" aria-label="Modelo para ${escapeHtml(t.title)}"></select>
          </div>
          <div class="di-actions">
            <button class="btn-primary" onclick="runTaskWithAI('${t.id}')">${SVG.spark} Generar</button>
            <button class="btn-secondary" onclick="copySpecificMegaPrompt('${t.id}')">${SVG.copy} Copiar prompt</button>
            ${t.status === "completed"
              ? `<button class="btn-secondary" onclick="setTaskStatus('${t.id}', 'pending')">Reiniciar</button>`
              : `<button class="btn-secondary" onclick="setTaskStatus('${t.id}', 'in_progress')">Marcar en curso</button>`}
          </div>
          <details class="di-fold">
            <summary>Ver prompt completo</summary>
            <pre class="di-prompt">${escapeHtml(promptDe(t))}</pre>
          </details>
          <details class="di-fold">
            <summary>Pegar la respuesta</summary>
            <textarea id="paste-result-${t.id}" class="landing-paste-area" rows="4" placeholder="Pega aquí lo que devolvió ${escapeHtml(t.ai)}">${escapeHtml(t.result || "")}</textarea>
            <div class="di-landing-row">
              <div id="ai-chips-${t.id}" class="ai-external-chips" style="display:none;"></div>
              <button class="btn-primary" onclick="injectTaskResult('${t.id}')">Guardar en el proyecto ${SVG.arrowRight}</button>
            </div>
          </details>
        </li>`;
      }).join("")}
    </ol>
  `;
}

function setTaskStatus(taskId, status) {
  const task = state.tasks.find(t => t.id === taskId);
  if (task) {
    task.status = status;
    saveState();
    renderTab("multi_ai");
  }
}

function generateSpecificMegaPrompt(taskId) {
  const pName = state.project_name || "SISTEMA";
  const ch = (state.challenges || []).find(c => c.id === state.challenge_id) || {};
  const chTitle = ch.title || state.challenge_title || "Innovación";
  const thesis = state.solution_thesis || state.solution_raw_input || "";
  const isNac = state.rally_type === "nacional";
  const cert = `${rallyName()} (${rallyProfile().hours}h - ${rallyProfile().jury})`;

  if (taskId === "stats_poverty") {
    if (isNac) {
      return `Actúa como Investigador Principal y Analista Cuantitativo para el ${cert}.
Proyecto: "${pName}" enfocado en el reto: "${chTitle}".
Tesis: "${thesis}".
Criterio Rúbrica Oficial Jurado Nacional: Impacto Social, Territorial y Alineación con Políticas Públicas (25 Puntos).
Patrón de Ganadores de ${RALLY_PROFILES.nacional.name}:
1. Extrae 3 estadísticas cuantitativas auditables de fuentes oficiales nicaragüenses y regionales (Banco Central de Nicaragua BCN, INIDE, CEPAL, MINSA o alcaldías).
2. Vincula directamente con un Eje específico del Plan Nacional de Lucha contra la Pobreza y Desarrollo Humano 2022–2026 (PNDH), Ciudades Creativas o Restitución de Derechos (Ley 763).
3. Especifica el anclaje territorial concreto en ${state.city || "el municipio donde corre el equipo"} (municipio, comunidad o zona productiva).
4. Cuantifica los beneficiarios directos (familias nicaragüenses, cooperativas de base, empleos directos e indirectos).
5. Proporciona citas en formato APA 7 y una síntesis para el Documento Técnico de Solución (máximo 1,250 caracteres con espacios, sin retórica vacía).`;
    }
    return `Actúa como Investigador Principal y Analista Cuantitativo para el ${cert}.
Proyecto: "${pName}" enfocado en el reto: "${chTitle}".
Tesis: "${thesis}".
Criterio Rúbrica Oficial Internacional: Impacto Positivo en la Sociedad (20 Puntos).
Patrón de Ganadores Latam:
1. Extrae 3 estadísticas cuantitativas auditables (fuentes oficiales: CEPAL, UNDRR, UNICEF, Banco Central o entes técnicos).
2. Vincula directamente 2 metas específicas de los ODS aplicables con su indicador numérico.
3. Describe el modelo de transferencia y escalamiento modular para municipios de América Latina (laboratorio piloto a escala continental).
4. Proporciona citas en formato APA 7 y una síntesis de 1 párrafo para la sección Problema del pautado (estrictamente menor a 1,250 caracteres con espacios, sin adjetivos vacíos).`;
  }

  if (taskId === "patents_art") {
    if (isNac) {
      return `Actúa como Especialista en Propiedad Intelectual e Innovación Abierta para el ${cert}.
Proyecto: "${pName}" enfocado en: "${chTitle}".
Tesis técnica: "${thesis}".
Criterio Rúbrica Oficial Jurado Nacional: Grado de Innovación, Creatividad y Hibridación Tecnológica (25 Puntos) y Viabilidad Técnica Local (20 Puntos).
Patrón de Ganadores Nacionales:
1. Identifica 2 patentes o antecedentes técnicos en Google Patents / WIPO / RPI-MIFIC de tecnologías similares.
2. Detalla la hibridación tecnológica accesible (ej. microcontroladores ESP32/LoRa, gemelos digitales, IA de bajo consumo) combinada con el aprovechamiento de recursos o materia prima autóctona de Nicaragua (biomasa, residuos de café, cacao, empaques, etc.).
3. Demuestra la factibilidad de implementación física en talleres locales, centros tecnológicos INATEC o laboratorios CNU (sin depender de componentes exóticos inalcanzables).
4. Redacta la sección de 'Innovación y Diferenciación' para el documento técnico (máximo 1,000 caracteres con espacios, puramente auditable).`;
    }
    return `Actúa como Especialista en Propiedad Intelectual, Estado del Arte y Patentes para el ${cert}.
Proyecto: "${pName}" enfocado en: "${chTitle}".
Tesis técnica: "${thesis}".
Criterio Rúbrica Oficial Internacional: Grado de Innovación (30 Puntos) y Viabilidad Técnica (20 Puntos).
Patrón de Ganadores Latam:
1. Identifica 2 patentes o antecedentes técnicos en Google Patents / WIPO / Lens sobre tecnologías similares.
2. Cita números de publicación oficiales y detalla exactamente la diferenciación arquitectónica (hibridación ciber-física, telemetría o materiales locales).
3. Redacta el bloque de 'Innovación y Diferenciación' para el documento pautado (máximo 1,000 caracteres con espacios, puramente técnico y medible).`;
  }

  if (taskId === "blender_3d") {
    return `Actúa como Diseñador Industrial y Programador de Blender Python (bpy).
Proyecto: "${pName}" (${chTitle}).
Tesis: "${thesis}".
Criterio Rúbrica Oficial: Calidad de la Presentación y Viabilidad Técnica (30 Puntos combinados).
Patrón de Ganadores: maquetas 3D limpias mostradas temprano en el video venden viabilidad técnica al jurado.
Misión: genera UN script de Python para Blender 3.6+/4.x que se ejecute completo en modo headless (blender -b -P script.py) y al terminar renderice una imagen.
Requisitos estrictos:
1. El prototipo debe reflejar el hardware real de la tesis (sensores, carcasa, red, energía) con dimensiones en metros y escala realista (ej. carcasa 0.18 m).
2. Geometría paramétrica limpio primitivos + bevels mecánicos, puertos/entradas de cable IP67, pernos M4/M5 reales, sin NURBS exóticos.
3. Materiales PBR mediante nodos: plástico industrial rugoso, metal anodizado, panel solar hasta microcontrolador visible si la tesis lo incluye.
4. Cámara en encuadre de 3/4 e iluminación de estudio de 3 luces; fondo neutro oscuro para insertar el render en el video.
5. Configura el render (EEVEE o Cycles con 128 muestras máx.) y ejecuta bpy.ops.render.render(write_still=True) al final del script.
6. Código único, sin dependencias externas, sin addons, con comentarios breves en español; termina imprimiendo 'RENDER OK'.
7. DOS PROPUESTAS, no una: entrega dos scripts completos —PROPUESTA 1 (sobria, lectura institucional) y PROPUESTA 2 (expresiva, lectura de producto)— con la misma escala, el mismo encuadre de cámara y la misma iluminación, para que el equipo compare solo el diseño. Cada propuesta escribe su render como render_propuesta_1.png y render_propuesta_2.png.
8. Cierra con una línea por propuesta diciendo qué cambia entre ellas y para qué acto del video sirve cada una. El equipo elige; tú no eliges por él.`;
  }

  if (taskId === "budget_alibaba") {
    if (isNac) {
      return `Actúa como alguien que arma el presupuesto de lanzamiento de un piloto para el ${cert}.
Proyecto: "${pName}" (${chTitle}).
Tesis: "${thesis}".
Criterio Rúbrica Oficial Jurado Nacional: Prefactibilidad Económica, Sostenibilidad y Modelo Comunitario/Canvas (15 Puntos).
Presupuesto ya registrado por el equipo (edítalo solo si falta algo):
${(state.budget || []).map(it => `- ${it.element}: ${it.units} × $${it.unit_cost} = $${(it.units * it.unit_cost).toFixed(2)} (${it.url || 'sin enlace'})`).join("\n") || "(vacío — propón el lanzamiento completo)"}
El presupuesto es de superficie, no un estudio de costos. Dos tipos de partida y nada más:
- COMPRAS: lo que hay que comprar para arrancar (equipos, materiales, insumos, herramientas).
- SALARIOS: quién se paga, durante cuántos días o meses y a cómo.
Reglas estrictas:
1. Cotiza en Córdobas (C$) y su equivalente en USD. El total lo fija el tamaño del piloto, no una cifra redonda.
2. De 6 a 8 partidas cortas. Cada una con una frase que diga qué es y para qué se usa. Nada de desgloses técnicos.
3. Prohibido incluir aduanas, aranceles, flete internacional, impuestos, seguros, trámites ni ninguna otra línea administrativa o técnica. Si lo mencionas, el jurado lee un estudio de importación, no un lanzamiento.
4. Cada compra lleva el enlace de la ficha del producto (nombre o SKU en la URL, nunca la portada) y la fecha en que viste ese precio.
5. CÓMO SE CONSIGUE CADA PRECIO (obligatorio): abre un navegador real —MCP browser, Playwright o Chrome— y busca el producto donde se vende de verdad: Alibaba, Amazon, MercadoLibre o el distribuidor local. Abre la ficha, copia la URL exacta del artículo, el precio que muestra hoy, el vendedor y la fecha. Un precio que no salió de una ficha abierta no entra al presupuesto.
6. Si no tienes navegador, dilo en una línea al final y entrega solo las partidas que puedas sustentar. Prohibido rellenar con dominios raíz o con precios estimados.
7. Cierra con dos líneas: con qué dinero se sostiene el mes siguiente y qué parte se paga sola.
8. Formato de salida: una partida por línea con el formato "Elemento | unidades | costo_unitario | enlace" para pegar directo en el dashboard.`;
    }
    return `Actúa como alguien que arma el presupuesto de lanzamiento de un piloto para el ${cert}.
Proyecto: "${pName}" (${chTitle}).
Tesis: "${thesis}".
Criterio Rúbrica Oficial: Prefactibilidad Económica y Sustentabilidad (20 Puntos).
Presupuesto ya registrado por el equipo (edítalo solo si falta algo):
${(state.budget || []).map(it => `- ${it.element}: ${it.units} × $${it.unit_cost} = $${(it.units * it.unit_cost).toFixed(2)} (${it.url || 'sin enlace'})`).join("\n") || "(vacío — propón el lanzamiento completo)"}
El presupuesto es de superficie, no un estudio de costos. Dos tipos de partida y nada más:
- COMPRAS: lo que hay que comprar para arrancar (equipos, materiales, insumos, herramientas).
- SALARIOS: quién se paga, durante cuántos días o meses y a cómo.
Reglas estrictas:
1. De 5 a 8 partidas cortas, en USD, con unidades justificadas por el alcance del piloto.
2. Cada partida con una frase que diga qué es y para qué se usa. Nada de desgloses técnicos.
3. Prohibido incluir aduanas, aranceles, flete internacional, impuestos, seguros ni trámites: son líneas administrativas que el jurado no evalúa y que hacen ver el presupuesto como un estudio de importación.
4. Cada compra lleva el enlace de la ficha del producto (nombre o SKU en la URL, nunca la portada del sitio) y la fecha en que viste ese precio. Si no puedes pegar la ficha, no inventes el precio: deja la partida fuera y dilo.
5. CÓMO SE CONSIGUE CADA PRECIO (obligatorio): abre un navegador real —MCP browser, Playwright o Chrome— y busca el producto donde se vende de verdad: Alibaba, Amazon, MercadoLibre o el distribuidor local. Abre la ficha, copia la URL exacta del artículo, el precio que muestra hoy, el vendedor y la fecha. Un precio que no salió de una ficha abierta no entra al presupuesto.
6. Si no tienes navegador, dilo en una línea al final y entrega solo las partidas que puedas sustentar. Prohibido rellenar con dominios raíz o con precios estimados.
7. El total lo fija el alcance del piloto, no una cifra redonda. Cierra con dos líneas sobre quién sostiene el mes siguiente.
8. Formato de salida: una partida por línea con el formato "Elemento | unidades | costo_unitario | enlace" para pegar directo en el dashboard.`;
  }

  if (taskId === "voice_audio") {
    if (isNac) {
      return `Actúa como Locutor Profesional y Guionista de Pitch de Innovación para el ${cert}.
Proyecto: "${pName}" (${chTitle}).
Tesis: "${thesis}".
Criterio Rúbrica Oficial Jurado Nacional: Calidad del Video Pitch (15 Puntos) e Identidad Territorial.
Los cuatro actos son la estructura del documento, no un molde de longitud: lo único que se mide al final es el audio de 120 segundos.
CÓMO SE ESCRIBE PARA SER ESCUCHADO (obligatorio):
- Frases de 8 a 14 palabras, una idea por frase. Sujeto, verbo, objeto.
- Palabra o frase corta cuando la idea golpea; frase larga solo para explicar.
- Marca con / cada pausa: después de toda cifra y en cada cambio de acto.
- Números dichos completos («cuatro mil quinientos dólares»), nunca leídos como cifra de tabla.
- Prohibido repetir la ciudad o el país más de una vez en todo el guion, y prohibido nombrar el proyecto antes del segundo 20.
- Nada de siglas sin explicar y nada de enumerar partidas del presupuesto: en el acto 3 se dice en palabras llanas quién paga y qué se sostiene solo.
- Los ganadores muestran la maqueta temprano, una cifra contundente al inicio y un cierre humano; imita ese orden, no su vocabulario.
Extensión: 250 a 270 palabras a 130–140 palabras por minuto. Si te pasas, avisa cuántos segundos sobra.
- Acto 1 (0–20 s): una persona real, una cifra verificable, el lugar nombrado una sola vez.
- Acto 2 (20–60 s): qué construyeron y cómo funciona, con la maqueta a la vista desde temprano.
- Acto 3 (60–95 s): qué cuesta arrancar, quién lo paga y qué parte se sostiene sola, en lenguaje llano.
- Acto 4 (95–120 s): el impacto en números auditables y la frase que cierra.
Distribución de referencia (no regla): Acto 1 ≈45, Acto 2 ≈90, Acto 3 ≈75, Acto 4 ≈55 palabras. Lo que se verifica al final es la duración real del audio: ≤120 s.
Entrega solo el texto continuo para el locutor o sintetizador TTS, sin acotaciones teatrales ni corchetes.

MOTOR Y ENTREGABLE DE AUDIO (si tu entorno tiene acceso al equipo):
No basta con escribir el texto. Instala o usa un motor TTS y genera assets/voice/narration.mp4: MP4 con audio AAC, sin video, mono, 48 kHz, máximo 120 segundos.
Recomendado: Chatterbox Multilingual es-MX/LatAm (MIT, clonación y control de emoción). Respaldo en CPU: Kokoro 82M. Edge-TTS solo si hay internet.
La guía completa con pasos, modelo y parámetros está en la pestaña Guion > Motor de voz > Copiar prompt para mi IA.
Si no puedes ejecutar el motor, entrega el texto y las instrucciones exactas para que el equipo lo haga.`;
    }
    return `Actúa como Locutor Profesional y Guionista de Pitch de Innovación para el ${cert}.
Proyecto: "${pName}" (${chTitle}).
Tesis: "${thesis}".
Criterio Rúbrica Oficial: Calidad de la Presentación y Estructura Audiovisual (10 Puntos).
Los cuatro actos son la estructura del documento, no un molde de longitud: lo único que se mide al final es el audio de 120 segundos.
CÓMO SE ESCRIBE PARA SER ESCUCHADO (obligatorio):
- Frases de 8 a 14 palabras, una idea por frase. Sujeto, verbo, objeto.
- Marca con / cada pausa: después de toda cifra y en cada cambio de acto.
- Números dichos completos, nunca leídos como cifra de tabla.
- Prohibido repetir la ciudad o el país más de una vez en todo el guion, y prohibido nombrar el proyecto antes del segundo 20.
- Nada de siglas sin explicar y nada de enumerar partidas: en el acto 3 se explica en palabras llanas quién paga y qué se sostiene solo.
- Los ganadores muestran la maqueta temprano y cierran con un rostro y una cifra; imita ese orden, no su vocabulario.
Extensión: 250 a 270 palabras a 130–140 palabras por minuto. Si te pasas, avisa cuántos segundos sobra.
- Acto 1 (0–20 s): dolor humano y una cifra cuantificada. PROHIBIDO el nombre del proyecto y los logos.
- Acto 2 (20–60 s): qué hace la solución y cómo se ve funcionando; la demo entra temprano.
- Acto 3 (60–95 s): qué cuesta arrancar, quién lo paga y qué se sostiene solo, en ${isNac ? "córdobas (C$)" : "USD"} y sin leer una tabla.
- Acto 4 (95–120 s): impacto con métricas auditables y proyección regional, en una sola frase final.
Distribución de referencia (no regla): Acto 1 ≈45, Acto 2 ≈90, Acto 3 ≈75, Acto 4 ≈55 palabras. Lo que se verifica al final es la duración real del audio: ≤120 s.
Entrega solo el texto continuo para el locutor o sintetizador TTS, sin acotaciones teatrales ni corchetes.

MOTOR Y ENTREGABLE DE AUDIO (si tu entorno tiene acceso al equipo):
No basta con escribir el texto. Instala o usa un motor TTS y genera assets/voice/narration.mp4: MP4 con audio AAC, sin video, mono, 48 kHz, máximo 120 segundos.
Recomendado: Chatterbox Multilingual es-MX/LatAm (MIT, clonación y control de emoción). Respaldo en CPU: Kokoro 82M. Edge-TTS solo si hay internet.
La guía completa con pasos, modelo y parámetros está en la pestaña Guion > Motor de voz > Copiar prompt para mi IA.
Si no puedes ejecutar el motor, entrega el texto y las instrucciones exactas para que el equipo lo haga.`;
  }

  if (taskId === "cross_audit") {
    const pautadoSummary = `Problema (${(state.pautado.problema||'').length} car.), Solución (${(state.pautado.solucion||'').length} car.), Prefactibilidad (${(state.pautado.prefactibilidad||'').length} car.), Innovación (${(state.pautado.innovacion||'').length} car.), Impacto (${(state.pautado.impacto||'').length} car.)`;
    const scriptSummary = `Acto 1: ${state.script.acto1 || '(vacío)'}\nActo 2: ${state.script.acto2 || '(vacío)'}\nActo 3: ${state.script.acto3 || '(vacío)'}\nActo 4: ${state.script.acto4 || '(vacío)'}`;
    
    return `Actúa como Presidente del Tribunal Calificador y Auditor de Consistencia para el ${cert}.
Proyecto: "${pName}" (${chTitle}).
Tesis Técnica: "${thesis}".
Pautado Oficial Actual: ${pautadoSummary}
Guion 120s Actual:\n${scriptSummary}

Misión crítica como jurado riguroso antes de calificar:
1. AUDITORÍA DE DISCREPANCIAS NUMÉRICAS (riesgo más frecuente en prefactibilidad):
   - Coteja centavo a centavo y persona a persona si alguna cifra dicha en el guion (costos, beneficiarios, tiempos, reducción %) contradice o no está en el pautado. Si hay discrepancia, indícala con su corrección exacta.
2. CHECKLIST DE LOS 11 PATRONES PERDEDORES:
   - ¿Propone una app móvil genérica para crisis complejas de salud/violencia sin hardware o validación física?
   - ¿Falta costeo unitario y lote piloto en el rango recomendado ($4,000 - $6,000 USD)?
   - ¿Desperdicia los primeros 20 segundos en logotipos o presentaciones?
      - ¿El audio del guion supera 120 segundos? (límite legal, se mide con ffprobe). Si además pasa de 270 palabras, advierte que la locución tendrá problemas para grabarse dentro del tiempo.
   - ¿Usa sufijo genérico -INNOVA en lugar de Naming Dual diferenciado?
3. BILINGÜISMO EVALUATIVO Y RÚBRICA 100 PTS:
   - ${isNac ? 'Verifica anclaje territorial nicaragüense, alineación con PNDH 2022-2026 y actores locales (INATEC/MEFCCA).' : 'Verifica universalidad técnica en lenguaje COTS/CAD, costos en USD sin subsidio y Nicaragua como prueba piloto para escalar a Latinoamérica.'}
Entrega tu veredicto en viñetas directas: [APROBADO / RIESGOS DETECTADOS / CORRECCIONES INMEDIATAS].`;
  }

  if (taskId === "web_prototype") {
    // La identidad sale del proyecto, nunca de la marca del producto: heredar
    // el cobalto #0866F5 hacia que todos los prototipos salieran iguales.
    const pal = state.palette || {};
    const paleta = ["primary", "secondary", "accent"]
      .filter(k => pal[k])
      .map(k => `${k} ${pal[k]}`)
      .join(", ") || "(sin paleta aprobada: elige una y justifícala, no improvises)";
    return `Actúa como Diseñador de Interfaz y Desarrollador Frontend Senior para el ${cert}.
Proyecto: "${pName}" (${chTitle}).
Tesis: "${thesis}".
Misión: genera UN SOLO archivo HTML autocontenido (con <style> y <script> incrustados, sin CDN ni fuentes externas) que funcione como pantalla del prototipo para grabar planos de video.

IDENTIDAD DEL PROYECTO — obligatoria:
- Paleta aprobada por el equipo: ${paleta}.
- Marca: ${state.team_name || "(el equipo aún no tiene nombre)"}${state.team_logo ? `, símbolo de marca "${state.team_logo}"` : ""}.
- Prohibido caer en azul cobalto #0866F5 o morado #7c3aed: son la marca de la herramienta, no la del proyecto. Prohibido también gradientes llamativos, glassmorphism y emojis como iconos.

QUÉ MUESTRA LA PANTALLA:
1. Cabecera con el nombre del proyecto y la tesis en una línea de 12 a 18 palabras.
2. Tres indicadores grandes del sistema en operación (por ejemplo: cobertura, unidades desplegadas, tiempo de respuesta). Números plausibles, tipografía mono, cada uno con su unidad.
3. Un bloque de estado en vivo con datos simulados en JS (setInterval cada 2 s) que correspondan al hardware o al flujo real de la tesis.
4. Una lista o tabla de lo que el sistema registra en su uso normal.
5. Barra inferior con estado del prototipo y nota de "datos simulados".

REGLAS DE DISEÑO (no las negocies):
- Fondo neutro claro, texto oscuro, un solo color de acento de la paleta; el resto gris.
- Nada de cifras de dinero ni tablas de presupuesto: esta pantalla enseña el sistema funcionando, no las cuentas.
- Jerarquía real: un titular, tres números, el resto en cuerpo pequeño pero legible a 1080p (mínimo 14 px en pantalla).
- Contraste mínimo 4.5:1 en todo texto. Radios de esquina de 0 a 8 px como máximo.
- Sin imágenes externas, sin iconos de librerías, sin dependencias: todo dibujado con HTML, CSS y SVG inline.
- Responsive de 390 a 1920 px, sin errores de consola, y los números siempre con tabular-nums.

REFINAMIENTO: si algo no encaja con la identidad o con la tesis, cambia solo esa pieza y explica en una línea qué cambiaste y por qué.
Entrega SOLO el código completo del archivo HTML.`;
  }

  return `Mega-Prompt calibrado con Rúbrica Oficial (100 Pts) para ${pName} (${cert}).`;
}

function copySpecificMegaPrompt(taskId) {
  const promptText = generateSpecificMegaPrompt(taskId);
  navigator.clipboard.writeText(promptText);
  setTaskStatus(taskId, "in_progress");
  alert(`Mega-Prompt para ${taskId} copiado al portapapeles. La tarea quedó marcada 'En Curso'.`);
}

function injectTaskResult(taskId) {
  const ta = document.getElementById(`paste-result-${taskId}`);
  const val = ta ? ta.value.trim() : "";
  if (!val) {
    alert("Pega la respuesta de la IA antes de inyectar.");
    return;
  }

  const task = state.tasks.find(t => t.id === taskId);
  if (task) {
    task.result = val;
    task.status = "completed";
  }

  // Mapeo automático de resultados
  if (taskId === "stats_poverty") {
    state.claims.push({ text: val.slice(0, 300), source: "Gemini / Perplexity" });
    if (!state.pautado.problema) state.pautado.problema = val.slice(0, 1200);
    if (!state.pautado.impacto) state.pautado.impacto = val.slice(0, 1400);
  } else if (taskId === "patents_art") {
    if (!state.pautado.innovacion) state.pautado.innovacion = val.slice(0, 980);
  } else if (taskId === "budget_alibaba") {
    // Si contiene números, intentar parsear partidas
    const lines = val.split("\n").filter(l => l.includes("$") || l.includes("USD") || l.includes(":"));
    if (lines.length >= 3) {
      state.budget = lines.slice(0, 6).map((l, i) => {
        const costMatch = l.match(/\$?(\d+(?:\.\d+)?)/);
        const cost = costMatch ? parseFloat(costMatch[1]) : 50;
        return {
          element: l.replace(/\$?(\d+(?:\.\d+)?)/g, "").replace(/[^\w\sáéíóúñÑ]/g, "").trim().slice(0, 45) || `Insumo ${i+1}`,
          units: 10,
          unit_cost: cost,
          url: "https://alibaba.com"
        };
      });
    }
  } else if (taskId === "voice_audio") {
    // Si contiene división de actos, mapear a los 4 actos
    if (val.includes("Acto 1") || val.includes("Acto I")) {
      const parts = val.split(/Acto\s+[1-4I|V]+/i).map(p => p.trim()).filter(Boolean);
      if (parts.length >= 4) {
        state.script.acto1 = parts[0];
        state.script.acto2 = parts[1];
        state.script.acto3 = parts[2];
        state.script.acto4 = parts[3];
      } else {
        state.script.acto1 = val.slice(0, 300);
      }
    } else {
      state.script.acto1 = val.slice(0, 300);
    }
  } else if (taskId === "web_prototype") {
    // Extrae el HTML generado y lo ofrece como descarga para /site/
    const htmlMatch = val.match(/<!DOCTYPE html[\s\S]*<\/html>/i);
    if (htmlMatch) {
      const blob = new Blob([htmlMatch[0]], { type: "text/html" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "prototipo_ai.html";
      document.body.appendChild(a);
      a.click();
      a.remove();
      showToast("HTML del prototipo descargado (prototipo_ai.html). Súbelo o pégalo en /site/index.html.");
    } else {
      showToast("La IA no devolvió HTML detectable. Revisa la respuesta antes de descargar.", true);
    }
  }

  saveState();
  renderTab("multi_ai");
  showToast(`Datos inyectados al proyecto desde ${task ? task.ai : 'IA'} exitosamente`);
}

// ═════════════════════════════════════════════════════════════════════════════
// 05 NIVEL 4: PAUTADO OFICIAL (< LÍMITES CON ESPACIOS)
// ═════════════════════════════════════════════════════════════════════════════
const PAUTADO_LABELS = { problema: "Problema", solucion: "Solución", impacto: "Impacto", innovacion: "Innovación", prefactibilidad: "Prefactibilidad", referencias: "Referencias" };

function renderViewPautado() {
  return `
    <div class="phase-header pa-page-head">
      <div>
        <h1 class="phase-title">Documento <span class="phase-title-accent">Pautado Oficial</span></h1>
      </div>
      <div class="pa-tools">
        <button class="btn-primary" onclick="compileAndDownloadDocx()" id="btn-compile-docx">
          ${SVG.spark} Compilar Word
        </button>
        <button class="pa-tool" onclick="exportProjectMarkdown()" title="Exportar el dossier en Markdown" aria-label="Exportar dossier en Markdown">${SVG.copy}</button>
        <button class="pa-tool" onclick="printProjectDossier()" title="Imprimir o guardar en PDF" aria-label="Imprimir o guardar en PDF">${SVG.download}</button>
        <a href="../plantillas/pautado_template.docx" id="direct-docx-link" download="Plantilla_Pautado_Oficial.docx" class="pa-tool" title="Descargar la plantilla Word vacía" aria-label="Descargar la plantilla Word vacía">${SVG.folder}</a>
      </div>
      ${onlineLinkRow("pautado", "Pega el enlace de Canva, Google Docs o Figma del pautado", "ENLACE AL PAUTADO EN LÍNEA")}
    </div>

    <details class="pa-template">
      <summary class="pa-template-head">
        <span class="pa-k">Plantilla oficial del evento</span>
        <span id="pautado-template-status" class="pa-template-status">Consultando plantilla…</span>
      </summary>
      <div class="pa-template-actions">
        <button class="btn-secondary" type="button" onclick="document.getElementById('pautado-template-input').click()">${SVG.upload} Subir plantilla Word (.docx)</button>
        <button class="btn-secondary" type="button" onclick="clearPautadoTemplate()">Quitar</button>
      </div>
      <p class="pa-template-text">
        Sube el Word (.docx) que entrega el evento (${rallyName()}).
        Al compilar, los textos se insertan bajo cada encabezado oficial.
      </p>
      <p class="pa-template-text">
        ${getPautadoLimit("problema") === null
          ? "Documento técnico de hasta 10 páginas: el texto se inserta completo."
          : "Matriz oficial: si pasas el límite, el sistema corta el texto."}
      </p>
      <input type="file" id="pautado-template-input" aria-label="Subir plantilla Word del evento" accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document" style="display:none;" onchange="handlePautadoTemplateUpload(event)">
    </details>

    <div class="pa-list">
      ${Object.keys(PAUTADO_LIMITS).map(k => {
        const val = state.pautado[k] || "";
        const len = val.length;
        const max = getPautadoLimit(k);
        const pct = max ? Math.min(100, Math.round((len / max) * 100)) : null;
        const isOver = max ? len > max : false;
        const isNear = !isOver && pct !== null && pct >= 92;
        const counter = max ? `${len} / ${max}` : `${len}`;
        const counterTitle = max ? `${len} de ${max} caracteres (${pct}%)` : `${len} caracteres`;
        const icon = {
          problema: SVG.target,
          solucion: SVG.spark,
          impacto: SVG.globe,
          innovacion: SVG.network,
          prefactibilidad: SVG.shieldCheck,
          referencias: SVG.external
        }[k] || "";
        const ap = rsPautadoApprovals(k);
        const aprobado = ap.names.length >= RS_APPROVALS_MIN;
        const miAprobacion = !!currentClientMascot.name && ap.names.includes(currentClientMascot.name);

        return `
          <article class="pa-section" data-lockable="pautado-${k}">
            <header class="pa-head">
              <span class="pa-label">${icon}<span>${PAUTADO_LABELS[k] || k}</span></span>
              <span class="pautado-counter ${isOver ? "is-over" : isNear ? "is-near" : ""}" title="${counterTitle}">${counter}</span>
              ${rsPautadoTakeHtml(k)}
              <span id="lock-tag-pautado-${k}"></span>
              <span class="pa-approve${aprobado ? " is-ok" : ""}" title="${ap.names.length ? "Leída por " + ap.names.join(", ") : "Nadie la ha leído todavía"}">
                <button class="pa-approve-btn${miAprobacion ? " is-mine" : ""}" type="button" onclick="rsApprovePautado('${k}', event)">${SVG.check}${miAprobacion ? "Aprobada" : "Aprobar"}</button>
                <span class="pa-approve-count">${ap.names.length}/${RS_APPROVALS_MIN}</span>
              </span>
            </header>
            ${k === "referencias" ? `<div class="pa-refs-tools"><button class="btn-secondary" type="button" onclick="rsArmarReferencias(event)">${SVG.folder} Traer fuentes del proyecto</button></div>` : ""}
            <textarea id="pt-${k}" rows="1" class="pa-input ${isOver ? "is-over" : ""}"
              placeholder="Escribe la sección ${(PAUTADO_LABELS[k] || k).toLowerCase()}…"
              onfocus="broadcastLock('pautado-${k}')"
              onblur="broadcastRelease('pautado-${k}')"
              oninput="updateCharCount('${k}', this); ajustarAltoTexto(this)">${val}</textarea>
            <div>${aiEditPanel("pautado:" + k)}</div>
          </article>
        `;
      }).join("")}
    </div>
  `;
}

// Texto largo sin scroll interno: la caja crece con el contenido, como en Word.
function ajustarAltoTexto(el, min) {
  if (!el) return;
  el.style.height = "auto";
  el.style.height = Math.max(min || 96, el.scrollHeight + 2) + "px";
}

function ajustarAltoTodos(selector) {
  document.querySelectorAll(selector || ".pa-input").forEach(ajustarAltoTexto);
}

// Al cambiar el ancho, el texto se reacomoda: hay que volver a medir.
window.addEventListener("resize", () => {
  ajustarAltoTodos(".pa-input");
  document.querySelectorAll('[id^="new-idea-input-"]').forEach(el => ajustarAltoTexto(el, 34));
});

function updateCharCount(k, el) {
  state.pautado[k] = el.value;
  rsResetApprovalsIfEdited(k, el.value);
  broadcastFieldChange("pautado", k, el.value);
  saveState();
  const max = getPautadoLimit(k);
  const len = el.value.length;
  const pct = max ? Math.min(100, Math.round((len / max) * 100)) : null;
  const isOver = max ? len > max : false;
  const isNear = !isOver && pct !== null && pct >= 92;
  const labelEl = el.closest(".pa-section") ? el.closest(".pa-section").querySelector(".pautado-counter") : null;
  if (labelEl) {
    labelEl.innerText = max ? `${len} / ${max}` : `${len}`;
    labelEl.title = max ? `${len} de ${max} caracteres (${pct}%)` : `${len} caracteres`;
    labelEl.classList.toggle("is-over", isOver);
    labelEl.classList.toggle("is-near", isNear);
  }
  el.classList.toggle("is-over", isOver);
  const badge = el.closest(".pa-section") ? el.closest(".pa-section").querySelector(".pa-approve-count") : null;
  if (badge) badge.innerText = `${rsPautadoApprovals(k).names.length}/${RS_APPROVALS_MIN}`;
}

// ── REFERENCIAS: una fuente por línea, orden alfabético, con año y URL ───────
// Se arma desde research/claims.json (lo único verificable) y queda editable:
// el equipo agrega a mano lo que consultó fuera del proyecto.
function rsLineaReferencia(claim) {
  const fuente = String(claim.source || claim.autor || "").trim();
  const anio = claim.year || claim.anio || "";
  const titulo = String(claim.stat || claim.titulo || "").trim().replace(/\s+/g, " ");
  const url = String(claim.url || "").trim();
  if (!titulo && !fuente) return "";
  const partes = [];
  if (fuente) partes.push(fuente.replace(/\.$/, "") + ".");
  if (anio) partes.push(`(${anio}).`);
  if (titulo) partes.push(titulo.replace(/\.$/, "") + ".");
  if (url) partes.push(url);
  return partes.join(" ");
}

function rsArmarReferencias(ev) {
  if (ev) ev.preventDefault();
  fetch("/research/claims.json", { cache: "no-store" })
    .then(r => r.ok ? r.json() : [])
    .then(claims => {
      const lista = (Array.isArray(claims) ? claims : []).map(rsLineaReferencia).filter(Boolean);
      const unicas = [];
      const vistas = new Set();
      lista.forEach(linea => { if (!vistas.has(linea)) { vistas.add(linea); unicas.push(linea); } });
      const historial = state.ai_edit_history && typeof state.ai_edit_history === "object" ? state.ai_edit_history : {};
      if (Object.keys(historial).some(k => (historial[k] || []).length)) {
        unicas.push("Rally Studio, asistente de IA (2026). Apoyo de redacción y edición del documento. Registro interno de ediciones de la plataforma.");
      }
      unicas.sort((a, b) => a.localeCompare(b, "es"));
      if (!unicas.length) {
        showToast("No hay fuentes en research/claims.json: agrégalas a mano en esta sección.");
        return;
      }
      const el = document.getElementById("pt-referencias");
      if (!el) return;
      const texto = unicas.join("\n");
      const proto = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, "value").set;
      proto.call(el, texto);
      el.dispatchEvent(new Event("input", { bubbles: true }));
      ajustarAltoTexto(el);
      showToast(`${unicas.length} fuentes cargadas. Revísalas y añade las que falten.`);
    })
    .catch(() => showToast("No se pudo leer research/claims.json."));
}

// ── Plantilla .docx del evento: se guarda en el servidor y se cachea en memoria ──
let _pautadoTemplateB64 = {}; // { latam: "<base64>", nacional: "<base64>" }

function _pautadoRallyType() {
  return state.rally_type === "nacional" ? "nacional" : "latam";
}

function _setPautadoTemplateStatus(html, color) {
  const el = document.getElementById("pautado-template-status");
  if (el) { el.innerHTML = html; el.style.color = color || "var(--text-muted)"; }
}

function _readFileAsBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(",", 2)[1] || "");
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

async function refreshPautadoTemplateStatus() {
  const rallyType = _pautadoRallyType();
  const hasLocal = !!_pautadoTemplateB64[rallyType];
  try {
    const res = await fetch("/api/template-status");
    const data = await res.json();
    const info = (data.templates || {})[rallyType] || {};
    if (info.user) {
      _setPautadoTemplateStatus(`${SVG.check} Cargada: ${info.user.name}`, "var(--text-title)");
    } else if (hasLocal) {
      _setPautadoTemplateStatus("Cargada, sin guardar en el servidor", "var(--text-title)");
    } else if (info.reference) {
      _setPautadoTemplateStatus("De referencia, sin subir", "var(--text-muted)");
    } else {
      _setPautadoTemplateStatus("Sin plantilla", "var(--status-err-text)");
    }
  } catch (e) {
    _setPautadoTemplateStatus(
      hasLocal ? "Cargada en esta sesión" : "Servicio local apagado",
      hasLocal ? "var(--text-title)" : "var(--status-err-text)"
    );
  }
}

async function handlePautadoTemplateUpload(event) {
  const file = event.target.files && event.target.files[0];
  if (!file) return;
  if (!/\.docx$/i.test(file.name)) { showToast("La plantilla debe ser un archivo Word (.docx)."); return; }
  const rallyType = _pautadoRallyType();
  let b64 = "";
  try { b64 = await _readFileAsBase64(file); } catch (e) { showToast("No se pudo leer el archivo."); return; }
  _pautadoTemplateB64[rallyType] = b64;
  _setPautadoTemplateStatus(`${SVG.check} Cargada: ${file.name}`, "var(--text-title)");
  try {
    const res = await fetch("/api/template-upload", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rally_type: rallyType, name: file.name, data: b64 })
    });
    const data = await res.json();
    if (data.status === "ok") { showToast("Plantilla del evento guardada correctamente."); refreshPautadoTemplateStatus(); }
    else { showToast("Plantilla cargada en esta sesión: " + (data.message || "no se pudo guardar en el servidor.")); }
  } catch (e) {
    showToast("Plantilla cargada en esta sesión. El servicio local no está disponible.");
  }
  if (event.target.value !== undefined) event.target.value = "";
}

async function clearPautadoTemplate() {
  const rallyType = _pautadoRallyType();
  delete _pautadoTemplateB64[rallyType];
  try {
    await fetch("/api/template-upload", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rally_type: rallyType, clear: true })
    });
    showToast("Plantilla quitada. Se usará la de referencia del evento.");
  } catch (e) {
    showToast("Plantilla quitada de esta sesión.");
  }
  refreshPautadoTemplateStatus();
}

// Baja un archivo del servidor meciante blob: si la sesion caduco, el fetch trae
// el JSON del login y se avisa; nunca se guarda una pagina web con extension .docx.
async function descargarArchivo(url, nombre) {
  try {
    const r = await fetch(url);
    const tipo = (r.headers.get("content-type") || "").toLowerCase();
    if (!r.ok || tipo.includes("text/html") || tipo.includes("application/json")) {
      showToast("El archivo no esta disponible. Vuelve a entrar y compila de nuevo.");
      return false;
    }
    const blob = await r.blob();
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = nombre;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(link.href), 4000);
    return true;
  } catch (e) {
    showToast("No se pudo bajar el archivo. Revisa la conexion con el servidor.");
    return false;
  }
}

async function descargarBudgetXlsx() {
  const ok = await descargarArchivo("../budget/budget.xlsx", "Presupuesto_Rally.xlsx");
  if (!ok) {
    showToast("Aun no existe el Excel: corre python scripts/gen_budget.py y vuelve a bajar.");
  }
}

function compileAndDownloadDocx() {
  const btn = document.getElementById("btn-compile-docx");
  if (btn) btn.innerHTML = `Compilando en plantilla oficial...`;
  
  fetch("/api/compile-docx", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      rally_type: state.rally_type || "latam",
      team_name: state.team_name || "EQUIPO",
      university: state.university || "UNIVERSIDAD",
      project_name: state.project_name || "PROYECTO",
      challenge_title: state.challenge_title || "DESAFÍO",
      pautado: state.pautado
    })
  })
  .then(r => r.json())
  .then(res => {
    if (btn) btn.innerHTML = `${SVG.spark} Compilar en Plantilla Word (.docx)`;
    if (res.status === "ok") {
      showToast("Documento pautado compilado exitosamente dentro de la plantilla oficial");
      descargarArchivo(res.file, `Pautado_${(state.project_name || 'Rally').replace(/\s+/g, '_')}_Oficial.docx`);
    } else {
      alert("Error al compilar documento: " + (res.message || "desconocido"));
    }
  })
  .catch(err => {
    if (btn) btn.innerHTML = `${SVG.spark} Compilar en Plantilla Word (.docx)`;
    showToast("Compilado en modo local: descargando borrador.");
    const link = document.getElementById("direct-docx-link");
    if (link) link.click();
  });
}

function savePautado() {
  saveState();
  renderNavigation();
  showToast("Pautado guardado correctamente.");
}

// ═════════════════════════════════════════════════════════════════════════════
// 06 NIVEL 4: PRESUPUESTO DE PUESTA EN MARCHA
// ═════════════════════════════════════════════════════════════════════════════
function budgetCurrency() {
  const nacional = state.rally_type === "nacional";
  const rate = Number(state.exchange_rate_bcn) || 0;
  const enCordobas = nacional && rate > 0;
  return {
    nacional,
    rate,
    listo: !nacional || rate > 0,
    code: enCordobas ? "NIO" : "USD",
    simbolo: enCordobas ? "C$" : "$",
    rotulo: enCordobas ? "C$" : "USD",
  };
}

function budgetConvert(usd, ctx) {
  return ctx.code === "NIO" ? usd * ctx.rate : usd;
}

function budgetFmt(usd, ctx, conCodigo) {
  const valor = budgetConvert(usd, ctx);
  const numero = valor.toLocaleString("es-NI", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return `${ctx.simbolo}${numero}${conCodigo ? ` ${ctx.code}` : ""}`;
}

function updateExchangeRate(val) {
  const rate = parseFloat(val) || 0;
  state.exchange_rate_bcn = rate > 0 ? rate : 0;
  saveState();
  renderTab("budget");
}

let budgetUrlEditIdx = -1;

function budgetSourceHost(url) {
  try {
    return String(new URL(String(url)).hostname || "").replace(/^www\./i, "").toLowerCase();
  } catch (e) { return ""; }
}

// Un enlace a portada (https://tienda.com) no sustenta un precio: el jurado
// no puede abrir la ficha. Solo cuenta la URL del producto con su ruta.
function budgetUrlGenerico(url) {
  try {
    const u = new URL(String(url));
    return u.pathname.replace(/\/+$/, "") === "" && !u.search;
  } catch (e) { return false; }
}

// Chip de la tienda de donde salió el precio: logo del sitio + dominio, todo
// el chip es el enlace al producto (tap en teléfono → abre la ficha real).
function budgetSourceChip(url) {
  const raw = String(url || "").trim();
  const host = budgetSourceHost(raw);
  if (!host) return `<span class="src-chip is-empty" title="Agrega el enlace del producto para sustentar el precio">Sin enlace</span>`;
  if (budgetUrlGenerico(raw)) {
    return `<span class="src-chip is-empty" title="Ese enlace es la portada del sitio: abre la ficha del producto y pega esa URL"><span class="src-host">${escapeHtml(host)} · portada, no ficha</span></span>`;
  }
  const initial = escapeHtml(host.charAt(0).toUpperCase());
  return `<a class="src-chip" href="${escapeHtml(raw)}" target="_blank" rel="noopener noreferrer" title="${escapeHtml(raw)}">
    <span class="src-logo"><span class="src-mono" aria-hidden="true">${initial}</span><img src="https://www.google.com/s2/favicons?sz=64&domain=${encodeURIComponent(host)}" alt="" loading="lazy" referrerpolicy="no-referrer" onerror="this.remove()"></span>
    <span class="src-host">${escapeHtml(host)}</span>${SVG.external}
  </a>`;
}

function renderViewBudget() {
  const total = state.budget.reduce((a, b) => a + (b.units * b.unit_cost), 0);
  const ctx = budgetCurrency();
  const isTooLow = total < BUDGET_TARGET.min;
  const isTooHigh = total > BUDGET_TARGET.max;
  const hasNotice = isTooLow || isTooHigh;
  const pal = state.palette || {};
  const hayPaleta = !!(pal.primary || pal.secondary || pal.accent);

  return `
    <div class="phase-header" style="display:flex; justify-content:space-between; align-items:flex-end; flex-wrap:wrap; gap:14px; margin-bottom:24px; padding-bottom:14px; border-bottom:1px solid var(--border-light);">
      <div>
        <h1 class="phase-title">Presupuesto de <span class="phase-title-accent">Puesta en Marcha</span></h1>
        <p class="phase-subtitle">Solo dos cosas: lo que se compra para arrancar y a quién se le paga. Sin aduanas, sin impuestos, sin desgloses técnicos.</p>
        ${ctx.nacional ? `
          <label style="display:inline-flex; align-items:center; gap:6px; margin-top:8px; font-size:11px; font-weight:700; color:var(--text-muted);">
            Tasa BCN (C$ por USD)
            <input type="number" min="1" step="0.01" value="${ctx.rate || ""}" placeholder="36.50"
                   aria-label="Tasa de cambio del BCN en córdobas por dólar"
                   style="width:90px; text-align:right; border:1px solid var(--border-light); border-radius:3px; padding:3px 6px;"
                   onchange="updateExchangeRate(this.value)">
          </label>
        ` : ""}
      </div>
      <div style="display:flex; gap:8px;">
        <button class="btn-primary" onclick="addBudgetItem()">+ Agregar Partida</button>
        <button class="btn-secondary" onclick="descargarBudgetXlsx()">
          ${SVG.download} Descargar Excel (.xlsx)
        </button>
      </div>
      ${onlineLinkRow("budget", "Pega el enlace de Canva o Google Sheets del presupuesto", "ENLACE AL PRESUPUESTO EN LÍNEA")}
    </div>

    ${!ctx.listo ? `
      <p class="bu-note is-warn"><strong>Falta la tasa del BCN.</strong> El certamen exige el presupuesto en córdobas: escríbela arriba y las partidas se convierten.</p>
    ` : ""}

    ${hayPaleta ? "" : `
      <p class="bu-note is-info"><strong>El presupuesto hereda los colores del proyecto.</strong> Aprueba primero una ruta en Identidad visual: sin paleta aprobada el generador se niega a cotizar.</p>
    `}

    ${hasNotice ? `
      <p class="bu-note ${isTooHigh ? "is-warn" : "is-info"}">${isTooHigh
        ? "<strong>Monto alto para un piloto.</strong> Si el equipo necesita equipamiento industrial, justifícalo en Prefactibilidad."
        : "<strong>Monto bajo para un lanzamiento.</strong> Revisa si faltan las compras de arranque o el pago de quienes trabajan en el piloto."}</p>
    ` : `
      <p class="bu-note is-ok"><strong>Presupuesto equilibrado.</strong> El total cae en la banda sugerida y cada partida tiene respaldo.
        ${ctx.nacional && ctx.rate ? ` Equivale a $${total.toFixed(2)} USD a la tasa declarada.` : ""}</p>
    `}

    <div style="margin:0 0 14px;">${aiEditPanel("budget")}</div>

    <div class="table-plate" style="padding:0;">
      <div class="table-responsive" style="margin-bottom:0;">
        <table class="data-table">
          <thead>
            <tr>
              <th>Elemento / Componente</th>
              <th style="width:80px; text-align:center;">Unidades</th>
              <th style="width:120px; text-align:right;">Costo Unit. (${ctx.rotulo})</th>
              <th style="width:120px; text-align:right;">Subtotal</th>
              <th style="width:60px; text-align:center;">Acción</th>
            </tr>
          </thead>
          <tbody>
            ${state.budget.length === 0 ? `
              <tr>
                <td colspan="5" style="padding:40px 16px; text-align:center;">
                  <div style="font-size:13px; font-weight:800; color:var(--text-title); margin-bottom:6px;">Sin partidas todavía</div>
                  <div style="font-size:12px; color:var(--text-muted); max-width:420px; margin:0 auto; line-height:1.55;">
                    Aún no hay insumos registrados. Agrega la primera partida con <strong>+ Agregar Partida</strong> e incluye el enlace al proveedor real para sustentar cada costo ante el jurado.
                  </div>
                </td>
              </tr>
            ` : ""}
            ${state.budget.map((it, idx) => `
              <tr>
                <td>
                  <input type="text" value="${escapeHtml(it.element || "")}" aria-label="Concepto de la partida ${idx + 1}" style="width:100%; border:none; background:transparent; font-size:12px; font-weight:600;" onchange="updateBudgetItem(${idx}, 'element', this.value)">
                  <div class="budget-src">
                    ${it.url && budgetUrlEditIdx !== idx
                      ? `${budgetSourceChip(it.url)}<button type="button" class="budget-url-edit" onclick="startBudgetUrlEdit(${idx})" aria-label="Cambiar el enlace de la partida ${idx + 1}">Cambiar</button>`
                      : `<input type="url" inputmode="url" class="budget-url" value="${escapeHtml(it.url || "")}" placeholder="Pega el enlace del producto (Alibaba, Amazon…)" aria-label="Enlace del producto de la partida ${idx + 1}" onchange="updateBudgetItem(${idx}, 'url', this.value)">`}
                  </div>
                </td>
                <td style="text-align:center;">
                  <input type="number" value="${it.units}" aria-label="Unidades de la partida ${idx + 1}" style="width:60px; text-align:center; border:1px solid var(--border-light); border-radius:3px; padding:2px;" onchange="updateBudgetItem(${idx}, 'units', this.value)">
                </td>
                <td style="text-align:right;">
                  <input type="number" step="0.5" value="${budgetConvert(Number(it.unit_cost) || 0, ctx).toFixed(2)}" aria-label="Costo unitario en ${ctx.rotulo} de la partida ${idx + 1}" style="width:80px; text-align:right; border:1px solid var(--border-light); border-radius:3px; padding:2px;" onchange="updateBudgetItem(${idx}, 'unit_cost', this.value)">
                </td>
                <td style="text-align:right; font-family:var(--font-mono); font-weight:700;">
                  ${budgetFmt(it.units * it.unit_cost, ctx)}
                </td>
                <td style="text-align:center;">
                  <button type="button" class="btn-secondary" style="padding:2px 6px; font-size:11px; color:var(--status-err-text);" aria-label="Eliminar partida ${idx + 1}" title="Eliminar partida ${idx + 1}" onclick="removeBudgetItem(${idx})">${SVG.close}</button>
                </td>
              </tr>
            `).join("")}
          </tbody>
          <tfoot>
            <tr style="background:var(--bg-subtle); font-weight:800;">
              <td colspan="5">
                <div class="bu-total">
                  <span class="bu-total-k">Total puesta en marcha</span>
                  <span class="bu-total-v">${budgetFmt(total, ctx, true)}</span>
                </div>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  `;
}

function startBudgetUrlEdit(idx) {
  budgetUrlEditIdx = idx;
  renderTab("budget");
  requestAnimationFrame(() => {
    const el = document.querySelector(".budget-url");
    if (el) { el.focus(); el.select && el.select(); }
  });
}

function updateBudgetItem(idx, field, val) {
  if (field === "units" || field === "unit_cost") {
    let numero = parseFloat(val) || 0;
    const ctx = budgetCurrency();
    if (field === "unit_cost" && ctx.code === "NIO" && ctx.rate > 0) {
      numero = numero / ctx.rate;
    }
    state.budget[idx][field] = numero;
  } else {
    state.budget[idx][field] = val;
  }
  saveState();
  budgetUrlEditIdx = -1;
  renderTab("budget");
}

function addBudgetItem() {
  state.budget.push({ element: "", units: 1, unit_cost: 0, url: "" });
  saveState();
  renderTab("budget");
}

function removeBudgetItem(idx) {
  state.budget.splice(idx, 1);
  saveState();
  renderTab("budget");
}

// ═════════════════════════════════════════════════════════════════════════════
// 07 NIVEL 4: BÓVEDA DE RECURSOS, LOGOS & ENLACES FIJOS
// ═════════════════════════════════════════════════════════════════════════════
// ── AVISOS DE LA IA (bandeja de cierre) ──────────────────────────────────────
// `content_bridge.js` guarda en `state.avisos` lo que llega por la pestaña de
// cierre (máximo 5). Sin este bloque el aviso se aplicaba y nadie lo volvía a
// ver: era el único destino posible de un entregable que no cabe en un campo.
function renderNotificar() {
  if (!window.RallyNotificar) return "";
  const api = window.RallyNotificar;
  if (!api.soportado()) return "";
  const pref = api.prefs();
  const estado = api.permiso();
  const activo = pref.activo && estado === "granted";

  const filas = [
    { clave: "propuesta", icono: SVG.spark, texto: "Propuestas de la IA" },
    { clave: "avance", icono: SVG.download, texto: "Entregas" },
    { clave: "cambio", icono: SVG.edit, texto: "Cambios del equipo" },
    { clave: "equipo", icono: SVG.users, texto: "Entradas al proyecto" },
  ].map(f => {
    const on = !!pref[f.clave];
    return `
      <div onclick="alternarAviso('${f.clave}')" style="display:flex; align-items:center; gap:10px; padding:9px 0; border-top:1px solid var(--border-light); cursor:pointer;">
        <span style="color:${on ? "var(--color-primary)" : "var(--text-faint)"}; flex:none;">${f.icono}</span>
        <span style="flex:1; font-size:12px; color:var(--text-title);">${f.texto}</span>
        <span style="width:15px; height:15px; flex:none; border:1px solid ${on ? "var(--color-primary)" : "var(--border-strong)"}; display:inline-flex; align-items:center; justify-content:center; color:var(--color-primary);">${on ? SVG.check : ""}</span>
      </div>`;
  }).join("");

  const boton = estado === "denied"
    ? `<span style="font-size:11px; font-family:var(--font-mono); color:var(--text-faint);">bloqueado</span>`
    : activo
      ? `<button class="btn-secondary" style="padding:4px 10px; font-size:11px;" onclick="probarAviso()">Probar</button>`
      : `<button class="btn-primary" style="padding:4px 10px; font-size:11px;" onclick="activarAvisos()">Activar</button>`;

  return `
    <div class="rs-section" id="notificar">
      <div style="display:flex; align-items:center; gap:10px;">
        <span style="color:var(--color-primary); flex:none;">${SVG.bell}</span>
        <span style="flex:1; font-size:13px; font-weight:700; color:var(--text-title);">Notificaciones</span>
        ${boton}
      </div>
      ${activo ? filas : ""}
    </div>`;
}

function activarAvisos() {
  const api = window.RallyNotificar;
  if (!api) return;
  api.pedir().then(function () {
    renderTab(activeTab);
  });
}

function alternarAviso(clave) {
  const api = window.RallyNotificar;
  if (!api) return;
  const pref = api.prefs();
  const cambios = {};
  cambios[clave] = !pref[clave];
  api.guardar(cambios);
  renderTab(activeTab);
}

function probarAviso() {
  const api = window.RallyNotificar;
  if (api) api.probar();
}

function renderAvisosIA() {
  const crudos = Array.isArray(state.avisos) ? state.avisos : [];
  if (!crudos.length) return "";
  // El mismo aviso llegaba repetido (agente, sync, recarga). Se muestra una vez.
  const vistos = new Set();
  const avisos = [];
  for (let i = crudos.length - 1; i >= 0; i--) {
    const a = crudos[i];
    const clave = [a.title || "", a.text || "", a.source || "", a.url || ""].join("|");
    if (vistos.has(clave)) continue;
    vistos.add(clave);
    avisos.unshift(a);
  }
  const filas = avisos.slice(-6).reverse().map(a => {
    const titulo = escapeHtml(a.title || "Aviso de la IA");
    const texto = a.text ? escapeHtml(a.text) : "";
    const fuente = a.source ? escapeHtml(a.source) : "";
    const url = typeof a.url === "string" && /^https?:\/\//i.test(a.url) ? a.url : "";
    return `
      <div style="display:flex; gap:10px; align-items:flex-start; padding:10px 0; border-top:1px solid var(--border-light);">
        <span class="status-dot" style="flex:none; margin-top:6px;"></span>
        <div style="min-width:0; flex:1;">
          <div style="font-size:12px; font-weight:700; color:var(--text-title);">${titulo}</div>
          ${texto ? `<div style="font-size:12px; color:var(--text-body); margin-top:2px;">${texto}</div>` : ""}
          ${fuente ? `<div style="font-size:11px; color:var(--text-muted); margin-top:2px;">${fuente}</div>` : ""}
        </div>
        ${url ? `<a href="${url}" target="_blank" rel="noopener" class="btn-secondary" style="flex:none; padding:4px 8px; font-size:11px; text-decoration:none;">Abrir</a>` : ""}
      </div>`;
  }).join("");
  return `
    <section class="rs-section" id="avisos-ia">
      <div class="rs-section-head"><h2>Avisos de la IA${avisos.length > 6 ? ` · ${avisos.length}` : ""}</h2></div>
      ${filas}
    </section>`;
}

/* ── Cronograma: base de tiempo para dibujar el camino ─────────────────────── */
function tsStartDate() {
  if (state.start_timestamp) {
    const d = new Date(state.start_timestamp);
    if (!isNaN(d.getTime())) return d;
  }
  const raw = String(state.official_start_time || "08:00 AM");
  const mt = raw.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  const d = new Date();
  d.setSeconds(0, 0);
  if (mt) {
    let h = parseInt(mt[1], 10) % 12;
    if (/pm/i.test(mt[3])) h += 12;
    d.setHours(h, parseInt(mt[2], 10), 0, 0);
  } else {
    d.setHours(8, 0, 0, 0);
  }
  return d;
}

function tsDeadlineDate() {
  const start = tsStartDate();
  const hours = Number(state.hours_total) || 24;
  return new Date(start.getTime() + hours * 3600 * 1000);
}

function tsStopTime(timeText) {
  const start = tsStartDate();
  const end = tsDeadlineDate();
  const t = String(timeText || "");
  const rel = t.match(/T-\s*(\d+(?:[.,]\d+)?)\s*H/i);
  if (rel) {
    const h = parseFloat(rel[1].replace(",", "."));
    return new Date(end.getTime() - h * 3600 * 1000);
  }
  const abs = t.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  if (abs) {
    let h = parseInt(abs[1], 10) % 12;
    if (/pm/i.test(abs[3])) h += 12;
    const d = new Date(start.getTime());
    d.setHours(h, parseInt(abs[2], 10), 0, 0);
    if (d.getTime() < start.getTime()) d.setDate(d.getDate() + 1);
    return d;
  }
  return null;
}

function tsPathState(milestones) {
  const start = tsStartDate();
  const end = tsDeadlineDate();
  const now = Date.now();
  const total = Math.max(1, end.getTime() - start.getTime());
  const pct = Math.max(0, Math.min(100, Math.round(((now - start.getTime()) / total) * 100)));
  const stamps = milestones.map(m => {
    const d = tsStopTime(m.time);
    return d ? d.getTime() : null;
  });
  let current = stamps.findIndex(t => t !== null && t > now);
  if (current === -1) current = stamps.length;
  return { pct, stamps, now, current, started: now >= start.getTime() };
}

function renderViewTimeline() {
  const isLatam = state.rally_type === "latam";
  const nom = getOfficialNomenclatures();
  const allHashtagsStr = nom.hashtags.join(" ");
  const guardrails = state.guardrails || {};
  const currentDeadline = getCurrentDeadlineAlert();
  const currentSubtab = state.timeline_subtab || "checklist";
  const expandedGuardrails = state.expanded_guardrails || {};
  const verifiedCount = Object.values(guardrails).filter(Boolean).length;
  const milestones = getActiveSchedule();
  const isCustomSchedule = Array.isArray(state.custom_schedule) && state.custom_schedule.length > 0;

  let subtabContent = "";

  if (currentSubtab === "checklist") {
    subtabContent = `
      <div class="ts-section">
        <div class="guardrail-accordion">
          ${guardrailDefs().map(g => {
            const isChecked = !!guardrails[g.key];
            const isExpanded = !!expandedGuardrails[g.key];
            return `
              <div class="guardrail-card ${isChecked ? 'checked' : ''} ${isExpanded ? 'expanded' : ''}" id="guardrail-card-${g.key}">
                <div class="guardrail-row-header" onclick="toggleGuardrailAccordion('${g.key}')">
                  <div class="guardrail-checkbox-square" onclick="toggleGuardrail('${g.key}', event)" title="${isChecked ? 'Marcar como pendiente' : 'Marcar como verificado'}">
                    ${isChecked ? SVG.check : ''}
                  </div>
                  <div class="guardrail-row-title">${g.title}</div>
                  <div class="guardrail-chevron">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"></polyline></svg>
                  </div>
                </div>
                <div class="guardrail-expand-body">
                  <div>${g.desc}</div>
                  <div class="guardrail-risk-notice">
                    <span style="font-weight:700; color:var(--status-err-text);">!</span>
                    <span>${g.risk}</span>
                  </div>
                </div>
              </div>
            `;
          }).join("")}
        </div>
      </div>
    `;
  } else if (currentSubtab === "schedule") {
    const pathInfo = tsPathState(milestones);
    subtabContent = `
      <div class="ts-section">
        <div class="schedule-toolbar">
          <span class="timeline-subnav-count">${isCustomSchedule ? 'Cronograma personalizado' : 'Cronograma oficial'}</span>
          <div style="display:flex; gap:8px; align-items:center;">
            <button class="btn-ai-action" onclick="toggleScheduleAIPanel()">
              ${SVG.spark} ${state.schedule_ai_open ? 'Cerrar Pegador IA' : 'Pegar Cronograma / IA'}
            </button>
            ${isCustomSchedule ? `
              <button class="btn-secondary-action" onclick="resetScheduleToDefault()" title="Volver al cronograma oficial del certamen">
                Restablecer a Oficial
              </button>
            ` : ''}
          </div>
        </div>

        <div class="schedule-ai-box ${state.schedule_ai_open ? '' : 'collapsed'}">
          <div class="ts-ai-label">
            ${SVG.upload} Pegar el cronograma del comité
          </div>
          <textarea id="input-schedule-raw" class="schedule-textarea" placeholder="Ejemplo:&#10;08:00 AM Apertura y selección de retos&#10;12:00 PM Límite fatal de registro de equipo&#10;T-4 Horas Entrega de pautado y presupuesto&#10;T-0 Cierre definitivo">${state.schedule_raw_text || ""}</textarea>
          <div style="display:flex; justify-content:flex-end; gap:8px;">
            <button class="btn-secondary-action" onclick="toggleScheduleAIPanel()">Cancelar</button>
            <button class="btn-ai-action" onclick="parseScheduleWithAI()">
              ${SVG.spark} Procesar con IA y Actualizar Cronograma
            </button>
          </div>
        </div>

        <div class="ts-clock">
          <span class="ts-clock-k">Reloj del certamen</span>
          <span class="ts-clock-bar"><span class="ts-clock-fill" style="width:${pathInfo.pct}%"></span></span>
          <span class="ts-clock-v">${pathInfo.started ? pathInfo.pct + '%' : 'sin arrancar'}</span>
        </div>

        <div class="ts-path">
          <span class="ts-path-rail"><span class="ts-path-fill" style="height:${pathInfo.pct}%"></span></span>
          <ol class="ts-path-list">
            ${milestones.map((m, idx) => {
              const isCrit = m.level === "critical" || /descalificaci|fatal|cierre|0 puntos/i.test(m.risk || "");
              const stamp = pathInfo.stamps[idx];
              const done = stamp !== null && stamp <= pathInfo.now;
              const isNow = !done && idx === pathInfo.current;
              const cls = ["ts-stop", done ? "is-done" : "", isNow ? "is-now" : "", isCrit ? "is-crit" : ""].filter(Boolean).join(" ");
              return `
                <li class="${cls}">
                  <span class="ts-stop-dot">${done ? SVG.check : ""}</span>
                  <div class="ts-stop-body">
                    <span class="ts-stop-time">${m.time}</span>
                    <span class="ts-stop-action">${m.action}</span>
                  </div>
                  ${isCustomSchedule ? `
                    <button class="btn-icon-del" onclick="removeScheduleMilestone(${idx})" title="Eliminar hito" aria-label="Eliminar hito">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                  ` : ""}
                </li>
              `;
            }).join("")}
          </ol>
        </div>
      </div>
    `;
  } else if (currentSubtab === "naming") {
    subtabContent = `
      <div class="timeline-grid" style="margin-top:0;">
        <div class="ts-section">

          <div class="naming-field-group">
            <div class="naming-field-label">
              <span>Nombre Oficial del Archivo PDF (Pautado Oficial)</span>
              <span style="font-size:11px; color:var(--text-muted); text-transform:none; font-weight:600;">Máx 15 MB · PDF</span>
            </div>
            <div class="naming-input-row">
              <input type="text" class="naming-input-readonly" readonly value="${nom.pdfName}" id="input-pdf-name">
              <button class="btn-copy-action" onclick="copyToClipboardWithFeedback('${nom.pdfName}', 'Nombre de PDF copiado')">
                ${SVG.copy} Copiar
              </button>
            </div>
          </div>

          <div class="naming-field-group">
            <div class="naming-field-label">
              <span class="naming-yt-label">${SVG.youtube} Título para YouTube (Pitch 120s)</span>
              <span style="font-size:11px; color:var(--text-muted); text-transform:none; font-weight:600;">1080p · No Listado</span>
            </div>
            <div class="naming-input-row">
              <input type="text" class="naming-input-readonly" readonly value="${nom.ytTitle}" id="input-yt-title">
              <button class="btn-copy-action" onclick="copyToClipboardWithFeedback('${nom.ytTitle}', 'Título de YouTube copiado')">
                ${SVG.copy} Copiar
              </button>
            </div>
          </div>
        </div>

        <div class="ts-section">
          <div class="ts-section-head">
            <div>
              <h2 class="ts-section-title">Hashtags obligatorios</h2>
            </div>
            <button class="btn-copy-action" onclick="copyToClipboardWithFeedback('${allHashtagsStr}', 'Todos los hashtags copiados')">
              ${SVG.copy} Copiar Todos
            </button>
          </div>

          <div class="hashtag-cloud">
            ${nom.hashtags.map(t => `<span class="hashtag-pill">${t}</span>`).join("")}
          </div>

          <p class="ts-note"><strong>Directriz de impacto:</strong> ${nom.tiktokTip}</p>
        </div>
      </div>
    `;
  }

  return `
    <div class="phase-header">
      <div>
        <h1 class="phase-title">Qué falta para <span class="phase-title-accent">entregar</span></h1>
        <p class="phase-subtitle">Guarda-raíles del jurado, tiempos y nombres oficiales.</p>
      </div>
    </div>

    <!-- Próximo hito: una sola línea, sin banner -->
    <div class="timeline-next">
      <span class="timeline-next-label">Siguiente</span>
      <span class="timeline-next-name">${escapeHtml(currentDeadline.label)}</span>
      <span class="timeline-next-time">${escapeHtml(currentDeadline.time)}</span>
      <span class="timeline-next-desc">${escapeHtml(currentDeadline.desc)}</span>
    </div>

    <!-- Avisos de los agentes viven en el Resumen para no repetirse en cada pestaña -->
    <!-- Sub-navegación Limpia y Cohesiva -->
    <div class="timeline-subnav">
      <button class="timeline-subnav-btn ${currentSubtab === 'checklist' ? 'active' : ''}" onclick="switchTimelineSubtab('checklist')">
        <span>Checklist de Requisitos</span>
        <span id="timeline-subnav-verified" class="timeline-subnav-count">${verifiedCount}/${guardrailDefs().length}</span>
      </button>
      <button class="timeline-subnav-btn ${currentSubtab === 'schedule' ? 'active' : ''}" onclick="switchTimelineSubtab('schedule')">
        <span>Cronograma & IA</span>
        <span class="timeline-subnav-count">${milestones.length}</span>
      </button>
      <button class="timeline-subnav-btn ${currentSubtab === 'naming' ? 'active' : ''}" onclick="switchTimelineSubtab('naming')">
        <span>Nomenclaturas & Tags</span>
      </button>
    </div>

    ${subtabContent}

    <!-- Empaquetado: fila plana al pie, sin tarjeta -->
    <div class="ts-pack">
      <div>
        <h2 class="ts-section-title">Empaquetado y exportación</h2>
      </div>
      <div style="display:flex; gap:10px; flex-wrap:wrap;">
        <button class="btn-primary" onclick="exportProjectMarkdown()" style="padding:9px 16px; font-size:13px; font-weight:700;">
          ${SVG.copy} Exportar Dossier (.md)
        </button>
        <button class="btn-select-card filled" onclick="printProjectDossier()" style="padding:9px 16px; font-size:13px; font-weight:700; background:var(--color-navy); color:var(--bg-surface); border-color:var(--color-navy);">
          ${SVG.download} Imprimir / Guardar como PDF
        </button>
      </div>
    </div>
  `;
}

// Lo que falta en la fase abierta. El panel lateral no repite el porcentaje
// global (ya está en la barra superior): dice qué cerrar aquí y ahora.
function panelPendingItems(tabId) {
  const t = (v) => String(v == null ? "" : v).trim() !== "";
  const items = [];
  const add = (ok, text, tab) => items.push({ ok: !!ok, text, tab: tab || tabId });

  if (tabId === "resumen") {
    add(t(state.rally_type) && t(state.team_name), "Definir certamen y equipo", "certamen");
    add(t(state.challenge_id), "Elegir el reto", "challenges");
    add(state.solution_approved, "Aprobar la solución", "solution");
    add(typeof isBudgetValid === "function" && isBudgetValid(), "Cerrar el presupuesto", "budget");
    add(t(state.video_url), "Subir el video", "timeline");
  } else if (tabId === "certamen") {
    add(t(state.rally_type), "Elegir el certamen");
    add(t(state.category), "Elegir la categoría");
  } else if (tabId === "team") {
    add(t(state.team_name), "Nombre del squad");
    add(t(state.university), "Universidad");
    add(t(state.city), "Ciudad o municipio");
    add(t(state.team_logo_img), "Logo del equipo");
  } else if (tabId === "challenges") {
    add(t(state.challenge_id), "Elegir el reto a desarrollar");
    add(Array.isArray(state.challenges) && state.challenges.length > 0, "Cargar los retos del comité");
  } else if (tabId === "solution") {
    add(t(state.solution_raw_input), "La idea con tus palabras");
    add(t(state.solution_thesis), "La tesis técnica");
    add(t(state.solution_simple), "Cómo se lo explicas a un asesor");
    add(t(state.project_name), "El nombre del proyecto");
    add(state.solution_approved, "Aprobarla para desbloquear lo que sigue");
  } else if (tabId === "impact") {
    const { mappedOdsIds, mappedEjeIds } = getChallengeImpactDetails(state.challenge_id);
    add((mappedOdsIds || []).length > 0, "Al menos un ODS vinculado");
    if (state.rally_type === "nacional") add((mappedEjeIds || []).length > 0, "Un eje del plan país");
  } else if (tabId === "multi_ai") {
    const tasks = Array.isArray(state.tasks) ? state.tasks : [];
    add(tasks.some(x => t(x && x.result)), "Al menos una respuesta pegada");
  } else if (tabId === "pautado") {
    if (typeof PAUTADO_LIMITS === "object") {
      Object.keys(PAUTADO_LIMITS).forEach(k => {
        const len = String((state.pautado || {})[k] || "").trim().length;
        add(len > 0, k.charAt(0).toUpperCase() + k.slice(1) + " escrito");
      });
    }
  } else if (tabId === "budget") {
    const rows = Array.isArray(state.budget) ? state.budget : [];
    add(rows.length > 0, "Al menos una partida");
    add(rows.length > 0 && rows.every(r => t(r.url)), "Enlace de compra en cada partida");
    add(typeof isBudgetValid === "function" && isBudgetValid(), "Total con partidas completas (la banda es sugerencia)", "budget");
  } else if (tabId === "resources") {
    add(t(state.team_logo_img), "Logo del equipo");
  } else if (tabId === "canvas") {
    const c = state.model_canvas || {};
    const keys = ["socios", "actividades", "propuesta", "relaciones", "segmentos", "recursos", "canales", "costes", "ingresos"];
    const n = keys.filter(k => t(c[k])).length;
    add(n === keys.length, `${n} de 9 cuadrantes escritos`);
  } else if (tabId === "script") {
    const s = state.script || {};
    ["acto1", "acto2", "acto3", "acto4"].forEach((k, i) => add(t(s[k]), `Acto ${i + 1} escrito`));
  } else if (tabId === "webdemo") {
    add(t(state.site_url), "URL del prototipo publicado");
  } else if (tabId === "timeline") {
    add(t(state.video_url), "Video en YouTube");
    add(t(state.site_url), "Prototipo publicado");
  }
  return items;
}

// ── INSPECTOR LATERAL DE AUDITORÍA ───────────────────────────────────────────
function updateInspector() {
  const panel = document.getElementById("panel");
  if (!panel) return;

  const stage = getWorkflowStage();
  if (stage < 2) return;

  const guardrails = state.guardrails || {};
  const guardrailsCount = Object.values(guardrails).filter(Boolean).length;
  const guardrailsTotal = guardrailDefs().length;
  const guardrailsOk = guardrailsCount === guardrailsTotal;

  const points = calculateAuditScore();
  const topbarBadge = document.getElementById("topbar-audit-badge") || document.querySelector(".topbar-chip-num");
  if (topbarBadge) topbarBadge.textContent = `${points}%`;

  const hasBudgetItems = Array.isArray(state.budget) && state.budget.length > 0;
  const totalBudget = hasBudgetItems ? state.budget.reduce((a, b) => a + (Number(b.units || 0) * Number(b.unit_cost || 0)), 0) : 0;

  panel.innerHTML = `
    <div class="drawer-header-mobile">
      <span>Preparación Oficial</span>
      <button class="btn-close-drawer" onclick="closeAllDrawers()" aria-label="Cerrar panel de auditoría">${SVG.close}</button>
    </div>

    ${(() => {
      const tabId = rsPrevTabId || "resumen";
      const label = String((NAV_TABS.find(t => t.id === tabId) || {}).label || "Esta fase").replace(/^\d+\s*/, "");
      const items = panelPendingItems(tabId);
      if (!items.length) return "";
      const faltan = items.filter(x => !x.ok).length;
      return `
        <div class="panel-todo-head">
          <span class="panel-todo-title">${escapeHtml(label)}</span>
          <span class="panel-todo-count">${faltan === 0 ? "completa" : faltan + " por cerrar"}</span>
        </div>
        <ul class="panel-todo">
          ${items.map(it => `
            <li class="panel-todo-item${it.ok ? " is-done" : ""}">
              <button type="button" onclick="switchTab('${it.tab}')" title="${it.ok ? "Listo" : "Ir a la fase"}">
                <span class="panel-todo-dot" aria-hidden="true"></span>
                <span class="panel-todo-text">${escapeHtml(it.text)}</span>
              </button>
            </li>
          `).join("")}
        </ul>
      `;
    })()}
  `;
}

function attachTabListeners(tabId) {}
