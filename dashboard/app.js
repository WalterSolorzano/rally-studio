// dashboard/app.js -- Rally Studio Workbench Oficial (Flujo Real de Competencia)
// Arquitectura secuencial estricta: Certamen -> Equipo -> Retos del Comité -> Taller Solución -> Despacho Multi-IA -> Espacio Completo.
// Cero emojis, soporte de Wi-Fi universitario con bypass por token/Drive/JSON, y generación de Mega-Prompts especializados.

// ── ICONOS SVG VECTORIALES (CERO EMOJIS) ──────────────────────────────────────
const SVG = {
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
  spark: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>`,
  bell: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>`,
  check: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`,
  arrowRight: `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>`,
  arrowLeft: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>`,
  plus: `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>`,
  refresh: `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"></polyline><polyline points="1 20 1 14 7 14"></polyline><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>`,
  dotsVertical: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="1.5"></circle><circle cx="12" cy="5" r="1.5"></circle><circle cx="12" cy="19" r="1.5"></circle></svg>`,

  rallyLatamEmblem: `<svg width="26" height="26" viewBox="0 0 32 32" fill="none" style="vertical-align:middle;" title="Rally Latinoamericano de Innovación"><circle cx="16" cy="16" r="14" fill="#FFF1F2" stroke="#FECDD3" stroke-width="1.5"/><path d="M12 9C14 11 16 13 15 16C14 19 18 23 20 22C22 20 23 16 21 13C19 10 17 8 13 8Z" fill="#E11D48"/><ellipse cx="16" cy="16" rx="14" ry="5.5" stroke="#E11D48" stroke-width="1.2" stroke-dasharray="3 2" transform="rotate(-25 16 16)"/><circle cx="21" cy="12" r="1.8" fill="#F43F5E"/></svg>`,
  rallyNacEmblem: `<svg width="26" height="26" viewBox="0 0 32 32" fill="none" style="vertical-align:middle;" title="Rally Nacional Nicaragua Innova"><circle cx="16" cy="16" r="14" fill="#F5F3FF" stroke="#DDD6FE" stroke-width="1.5"/><path d="M16 8L10.5 22H21.5L16 8Z" fill="#7C3AED"/><circle cx="21" cy="11" r="2.8" fill="#F59E0B"/><path d="M9 22C12 20.5 20 20.5 23 22" stroke="#38BDF8" stroke-width="1.5"/></svg>`,
  uniCrestEmblem: `<svg width="26" height="26" viewBox="0 0 32 32" fill="none" style="vertical-align:middle;" title="Universidad Nacional de Ingeniería (UNI)"><circle cx="16" cy="16" r="14" fill="#003366"/><circle cx="16" cy="16" r="12.5" stroke="#FFB800" stroke-width="1.2"/><path d="M16 7L23 11V18C23 22 16 26 16 26C16 26 9 22 9 18V11L16 7Z" fill="#002244" stroke="#FFB800" stroke-width="1.2"/><path d="M16 11L18.5 16H13.5L16 11Z" fill="#FFB800"/><path d="M13 18H19" stroke="#FFB800" stroke-width="1.5"/></svg>`,

  latinAmericaIllustration: `
<svg width="290" height="170" viewBox="0 0 320 200" fill="none" xmlns="http://www.w3.org/2000/svg" style="max-width:100%; height:auto;">
  <defs>
    <!-- Paleta oficial Latam: Grises de precisión técnica y Rosa/Magenta vibrante -->
    <linearGradient id="latamGrayLand" x1="120" y1="10" x2="220" y2="190" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#64748B"/>
      <stop offset="40%" stop-color="#475569"/>
      <stop offset="85%" stop-color="#334155"/>
      <stop offset="100%" stop-color="#1E293B"/>
    </linearGradient>
    <linearGradient id="latamRoseOrbit" x1="30" y1="90" x2="290" y2="110" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#F0ABFC" stop-opacity="0.25"/>
      <stop offset="50%" stop-color="#C026D3" stop-opacity="0.95"/>
      <stop offset="100%" stop-color="#F0ABFC" stop-opacity="0.25"/>
    </linearGradient>
    <filter id="latamSoftShadow" x="60" y="10" width="220" height="190" filterUnits="userSpaceOnUse">
      <feDropShadow dx="0" dy="6" stdDeviation="8" flood-color="#C026D3" flood-opacity="0.2"/>
    </filter>
  </defs>

  <!-- Anillos Orbitales con micro-animación CSS -->
  <g class="anim-orbit">
    <ellipse cx="160" cy="104" rx="122" ry="42" stroke="url(#latamRoseOrbit)" stroke-width="2" stroke-dasharray="6 4" transform="rotate(-16 160 104)"/>
    <ellipse cx="160" cy="106" rx="134" ry="32" stroke="#F0ABFC" stroke-width="1.2" stroke-opacity="0.6" transform="rotate(22 160 106)"/>
  </g>

  <g filter="url(#latamSoftShadow)">
    <!-- Península de Baja California -->
    <path d="M84 24 C82 32, 86 42, 92 50 C94 54, 96 52, 94 44 C92 36, 88 28, 86 22 Z" fill="#64748B"/>

    <!-- México continental y Península de Yucatán -->
    <path d="M88 22 C96 22, 108 26, 116 32 C124 38, 130 36, 134 44 C138 48, 148 44, 154 44 C158 44, 160 48, 156 52 C152 56, 146 54, 142 58 C138 62, 134 68, 130 70 C124 68, 118 64, 112 56 C106 48, 98 42, 90 32 Z" fill="url(#latamGrayLand)"/>

    <!-- Istmo de Centroamérica -->
    <path d="M130 70 C136 70, 142 74, 148 78 C154 82, 160 84, 166 84 C172 84, 176 80, 182 82 C184 84, 184 88, 180 88 C174 88, 166 88, 160 86 C152 84, 144 80, 138 74 Z" fill="#475569"/>

    <!-- Islas del Caribe -->
    <path d="M148 50 C156 52, 168 56, 176 60 C174 62, 164 58, 152 54 Z" fill="#94A3B8"/>
    <ellipse cx="184" cy="64" rx="4" ry="2" fill="#C026D3"/>
    <ellipse cx="194" cy="67" rx="2.5" ry="1.5" fill="#F0ABFC"/>

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
             C250 104, 236 94, 218 86 Z" fill="#94A3B8" fill-opacity="0.45"/>
  </g>

  <!-- Nodos satelitales Rosa/Magenta con animación -->
  <g class="anim-beacon">
    <circle cx="216" cy="80" r="4" fill="#C026D3"/>
    <circle cx="216" cy="80" r="7" stroke="#F0ABFC" stroke-width="1.4" stroke-opacity="0.8"/>
  </g>
  <circle cx="140" cy="116" r="3" fill="#D946EF" class="anim-beacon"/>
  <circle cx="240" cy="140" r="2.8" fill="#E879F9" class="anim-beacon"/>
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
  <path d="M80 120 C100 114, 130 116, 165 114 C200 114, 230 116, 250 120 L250 126 L80 126 Z" fill="#047857"/>

  <!-- PLAYA ARENOSA DORADA A LO LARGO DE LA ORILLA (Visible en el recorte) -->
  <path d="M130 124 L240 124 L240 128 L130 128 Z" fill="#FDE68A"/>

  <!-- CADENA DE COLINAS Y PROMONTORIOS VERDES A LA IZQUIERDA -->
  <path d="M20 134 C40 116, 65 120, 95 126 C125 132, 145 122, 175 130 L175 142 L20 142 Z" fill="#0D9488"/>
  <path d="M40 136 C65 122, 90 126, 120 132 C140 136, 160 128, 180 136 L180 146 L40 146 Z" fill="#059669"/>
  <path d="M60 142 C85 130, 110 132, 135 138 C155 142, 175 136, 195 144 L195 152 L60 152 Z" fill="#10B981"/>

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

  landscapeBg: `
<div class="wizard-scenery-wrap">
  <div class="handwritten-script script-top">
    Dos caminos,<br>un mismo reto.
    <svg class="script-underline-svg" width="90" height="12" viewBox="0 0 90 12" fill="none">
      <path d="M3 8 C25 3, 60 4, 87 9" stroke="#0066FF" stroke-width="2" stroke-linecap="round"/>
    </svg>
  </div>
  <svg width="340" height="175" viewBox="0 0 340 175" fill="none" style="position:absolute; right:0; top:0;">
    <circle cx="260" cy="46" r="12" fill="#F59E0B" class="anim-sun"/>
    <path d="M205 70 C205 64, 210 59, 217 59 C221 54, 228 52, 235 54 C242 52, 249 55, 251 60 C256 60, 261 65, 261 70 Z" fill="#E2E8F0" fill-opacity="0.8" class="anim-cloud"/>
    <!-- Volcán con veta naranja -->
    <path d="M245 44 L180 134 L310 134 Z" fill="#1D4ED8"/>
    <path d="M245 44 L245 134 L310 134 Z" fill="#0284C7"/>
    <path d="M247 46 Q260 75 285 110" stroke="#F59E0B" stroke-width="3.5" stroke-linecap="round" class="anim-lava"/>
    <!-- Colinas y lago -->
    <path d="M150 132 C180 120, 220 126, 260 132 L260 146 L150 146 Z" fill="#0D9488"/>
    <rect x="220" y="132" width="120" height="32" fill="#0284C7"/>
    <path d="M240 140 Q280 144, 330 140" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" class="anim-water"/>
  </svg>
</div>`
};

// ── CATÁLOGO HISTÓRICO DE REFERENCIA (RALLY 2026) ────────────────────────────
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
      desc: "Genera script bpy con biseles mecánicos, puertos estancos IP67 y materiales realistas para planos de video.",
      status: "pending",
      result: ""
    },
    {
      id: "budget_alibaba",
      title: "Cotización Mayorista de Hardware & Partidas",
      ai: "Z.ai / Perplexity / Alibaba",
      desc: "Localiza proveedores mayoristas reales, calcula unidades para prototipo y flete del 18%.",
      status: "pending",
      result: ""
    },
    {
      id: "voice_audio",
      title: "Locución y Síntesis de Voz Emotiva",
      ai: "ElevenLabs / Chatterbox / Edge-TTS",
      desc: "Genera el archivo de audio para los 4 actos (120s exactos) con entonación empática latinoamericana.",
      status: "pending",
      result: ""
    }
  ];
}

// ── ESTADO REACTIVO DEL SISTEMA ─────────────────────────────────────────────
function getInitialState() {
  return {
    rally_type: null,
    hours_total: 28,
    hours_remaining: 28,
    rally_started: false,
    start_timestamp: null,
    official_start_time: "08:00 AM",
    team_name: "",
    university: "Universidad Nacional de Ingeniería (UNI)",
    city: "",
    team_logo: "shield",
    team_logo_img: "",
    project_name: "",
    category: "Innovación",
    challenge_id: "",
    challenge_title: "",
    
    // Retos ingresados por el usuario desde el comité oficial
    challenges: [],

    // Taller de Solución
    solution_raw_input: "",
    solution_thesis: "",
    solution_simple: "",
    solution_boosters: ["ods", "sensors"],
    solution_approved: false,

    // Tareas Multi-IA coordinadas
    tasks: getDefaultMultiAITasks(),

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
      { element: "Flete Internacional y Aranceles de Importación (18%)", units: 1, unit_cost: 650.00, url: "https://dhl.com" }
    ],

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
      pautado_chars_ok: false
    },

    // Enlaces de colaboración y nube (Bypass para Wi-Fi universitario)
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

// ── DETERMINAR ETAPA ACTUAL DEL PROCESO ──────────────────────────────────────
function getWorkflowStage() {
  if (!state.rally_type) return 0; // Certamen
  if (!state.team_name || !state.university) return 1; // Equipo
  if (!state.challenge_id) return 2; // Retos del comité
  if (!state.solution_approved) return 3; // Taller Solución
  return 4; // Despacho Multi-IA y Espacio de Trabajo
}

// ── NAVEGACIÓN MODULAR Y DEPENDENCIAS ─────────────────────────────────────────
const NAV_TABS = [
  { id: "certamen",   label: "00 Certamen",             level: 0, check: () => true },
  { id: "team",       label: "01 Identidad de Equipo",  level: 1, check: () => !!state.rally_type },
  { id: "challenges", label: "02 Retos del Comité",     level: 2, check: () => !!state.rally_type && !!state.team_name },
  { id: "solution",   label: "03 Taller de Solución",   level: 3, check: () => !!state.challenge_id },
  { id: "multi_ai",   label: "04 Despacho Multi-IA",    level: 4, check: () => state.solution_approved },
  { id: "pautado",    label: "05 Pautado Oficial",      level: 4, check: () => state.solution_approved && isPautadoComplete() },
  { id: "budget",     label: "06 Presupuesto de Marcha",level: 4, check: () => state.solution_approved && isBudgetValid() },
  { id: "resources",  label: "07 Bóveda de Recursos",   level: 4, check: () => state.solution_approved },
  { id: "canvas",     label: "08 Modelo Canvas",        level: 4, check: () => state.solution_approved },
  { id: "script",     label: "09 Guion 120s (4 Actos)", level: 5, check: () => isPautadoComplete() && isBudgetValid() },
  { id: "webdemo",    label: "10 Prototipo para Video", level: 5, check: () => isPautadoComplete() && isBudgetValid() },
  { id: "timeline",   label: "11 Hitos & Nomenclatura SIRLI", level: 1, check: () => !!state.rally_type }
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
    const saved = localStorage.getItem("rally_studio_production_state_2026_v3");
    if (saved) {
      state = Object.assign(getInitialState(), JSON.parse(saved));
      if (!state.tasks || !state.tasks.length) state.tasks = getDefaultMultiAITasks();
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
    if (event.key === "rally_studio_production_state_2026_v3" && event.newValue) {
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
    localStorage.setItem("rally_studio_production_state_2026_v3", JSON.stringify(state));
    if (syncBroadcastChannel) {
      syncBroadcastChannel.postMessage({ type: "AUTO_SYNC_STATE", state });
    }
  } catch (e) {}
  updateInspector();
  renderTopbar();
}

function resetProject() {
  if (confirm("¿Iniciar nuevo proyecto desde cero? Se limpiarán los datos locales para arrancar una nueva competencia.")) {
    localStorage.removeItem("rally_studio_production_state_2026_v3");
    state = getInitialState();
    activeTab = "certamen";
    syncUI();
  }
}

// ── SINCRONIZACIÓN DE EQUIPO (BYPASS PARA WI-FI UNIVERSITARIO) ─────────────────
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
    state = Object.assign(getInitialState(), imported);
    saveState();
    syncUI();
    alert("Dashboard sincronizado exitosamente con el equipo.");
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
    return { label: "Kickoff Oficial", time: "08:00 AM (Viernes)", desc: "Apertura oficial de retos en plataforma SIRLI" };
  }
  const now = Date.now();
  const start = state.start_timestamp || now;
  const elapsedSec = Math.floor((now - start) / 1000);
  const totalSec = (state.hours_total || 24) * 3600;
  const remainSec = Math.max(0, totalSec - elapsedSec);
  const elapsedHours = elapsedSec / 3600;

  if (elapsedHours < 4) {
    const remainToReg = Math.max(0, 4 * 3600 - elapsedSec);
    const rh = Math.floor(remainToReg / 3600);
    const rm = Math.floor((remainToReg % 3600) / 60);
    return { 
      label: "Inscripción SIRLI", 
      time: `12:00 PM (${rh}h ${rm}m)`, 
      desc: "Límite fatal de registro de integrantes y sede UNI en plataforma" 
    };
  }
  if (elapsedHours < 12) {
    const remainToTikTok = Math.max(0, 12 * 3600 - elapsedSec);
    const rh = Math.floor(remainToTikTok / 3600);
    const rm = Math.floor((remainToTikTok % 3600) / 60);
    return { 
      label: "Ventana TikTok", 
      time: `08:00 PM (${rh}h ${rm}m)`, 
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
      label: "CIERRE FINAL SIRLI", 
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
  if (!state.rally_type) {
    return { time: "--:--:--", status: "STANDBY" };
  }
  if (!state.rally_started) {
    return { time: `${state.hours_total || 24}:00:00`, status: "INICIO 08:00 AM" };
  }
  const now = Date.now();
  const start = state.start_timestamp || now;
  const elapsedSec = Math.floor((now - start) / 1000);
  const totalSec = (state.hours_total || 24) * 3600;
  const remainSec = Math.max(0, totalSec - elapsedSec);
  const h = Math.floor(remainSec / 3600).toString().padStart(2, "0");
  const m = Math.floor((remainSec % 3600) / 60).toString().padStart(2, "0");
  const s = Math.floor(remainSec % 60).toString().padStart(2, "0");
  return { time: `${h}:${m}:${s}`, status: "EN CURSO" };
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

  updateClockDisplay();
  timerInterval = setInterval(updateClockDisplay, 1000);
}

function startOfficialRallyTimer() {
  state.rally_started = true;
  state.start_timestamp = Date.now();
  saveState();
  startTimer();
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
  const certamen = state.rally_type === "latam" ? "Rally Latam 28h" : state.rally_type === "nacional" ? "Rally Nacional 24h" : "";
  const pName = state.team_name || state.project_name || "";
  const timerData = getTimerString();
  const deadlineData = getCurrentDeadlineAlert();

  el.innerHTML = `
    <div class="topbar-left">
      ${stage >= 2 ? `<button class="btn-toggle-sidebar" onclick="toggleSidebar()" title="Colapsar/Expandir menú lateral">${SVG.menu}</button>` : ""}
      <div class="brand-group" onclick="activeTab='certamen'; syncUI();" title="Ir al inicio de Rally Studio">
        ${SVG.logo}
        <span class="brand-text-navy">RALLY</span>
        <span class="brand-text-blue">STUDIO</span>
      </div>
      ${state.rally_type ? `
        <div class="topbar-emblems-group" title="${certamen}">
          <img src="${state.rally_type === 'latam' ? 'assets/logo_rally_latam.png' : 'assets/logo_rally_nacional.png'}" 
               class="topbar-emblem-img" 
               alt="${state.rally_type === 'latam' ? 'Rally Latinoamericano' : 'Rally Nacional Innova'}">
          <span class="topbar-emblem-divider"></span>
          <img src="assets/logo_uni_official.png" 
               class="topbar-uni-img" 
               alt="Universidad Nacional de Ingeniería (UNI)">
          ${state.team_logo_img ? `
            <span class="topbar-emblem-divider"></span>
            <img src="${state.team_logo_img}" class="topbar-team-avatar" alt="Team Logo" title="${state.team_name || 'Equipo'}">
          ` : ""}
        </div>
      ` : ""}
      ${pName ? `<span class="project-title-crumb">/ ${pName}</span>` : ""}
      ${state.challenge_id ? `<span class="challenge-title-crumb">Reto #${state.challenge_id}</span>` : ""}
    </div>
    <div class="topbar-actions">
      ${state.rally_type ? `
        <div id="topbar-deadline-pill" 
             class="deadline-pill ${state.rally_type === 'latam' ? 'latam' : 'nacional'}" 
             onclick="switchTab('timeline')" 
             title="${deadlineData.desc}">
          <span class="deadline-pill-dot"></span>
          <span class="deadline-pill-label">${deadlineData.label}</span>
          <span class="deadline-pill-time">${deadlineData.time}</span>
        </div>
      ` : ""}

      <div class="dropdown-wrapper">
        <button class="btn-icon-discreet" onclick="toggleProjectMenu(event)" id="btn-project-menu" title="Opciones de proyecto">
          ${SVG.dotsVertical}
        </button>
        <div id="project-dropdown" class="dropdown-menu-box" style="display:none; right:0; left:auto;">
          <a href="#" onclick="startOfficialRallyTimer(); return false;">${SVG.spark} Iniciar Cronómetro (Kickoff 08:00 AM)</a>
          <a href="#" onclick="state.rally_started=false; state.start_timestamp=null; saveState(); startTimer(); return false;">Pausar / Standby</a>
          <a href="#" onclick="resetProject(); return false;">Reiniciar Certamen (T=0)</a>
          <a href="#" onclick="exportProjectJson(); return false;">${SVG.download} Exportar Proyecto (.json)</a>
          <label style="cursor:pointer; display:flex; align-items:center; gap:8px; padding:9px 14px; font-size:12px; color:#1e293b;">
            ${SVG.upload} Importar Proyecto (.json)
            <input type="file" accept=".json" style="display:none;" onchange="importProjectJson(event)">
          </label>
        </div>
      </div>

      ${stage >= 2 ? `<button class="btn-pill-ghost" onclick="togglePanel()" title="Panel de Auditoría">${SVG.spark} Auditoría</button>` : ""}

      <div class="timer-pill-navy" id="timer-pill" title="Cronómetro oficial: calibrado a las 08:00 AM">
        ${SVG.clock}
        <span id="clock-timer">${timerData.time}</span>
        <span id="clock-status-tag" style="font-size:9.5px; opacity:0.75; font-weight:700; margin-left:4px;">${timerData.status}</span>
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
    multi_ai: renderViewMultiAI,
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
// 00 NIVEL 0: SELECCIÓN DE CERTAMEN (RÉPLICA EXACTA DE LA IMAGEN)
// ═════════════════════════════════════════════════════════════════════════════
function renderViewCertamen() {
  const isLatam = state.rally_type === 'latam';
  const isNac = state.rally_type === 'nacional';

  const checkCircleMagenta = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="12" fill="#C026D3"/><path d="M7 12.5l3.5 3.5 7-7" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  const checkCirclePurple = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="12" fill="#7C3AED"/><path d="M7 12.5l3.5 3.5 7-7" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

  return `
    <div class="wizard-canvas">
      ${SVG.landscapeBg}

      <div class="stepper-header">
        <span class="stepper-pill">PASO 01 DE 03</span>
        <div class="stepper-bars">
          <div class="stepper-bar-segment active"></div>
          <div class="stepper-bar-segment"></div>
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
            <h2 class="certamen-card-title">Rally Latinoamericano<br>de Innovación</h2>
            <p class="certamen-card-desc">Competencia internacional entre 8 países de América Latina.</p>
          </div>

          <div class="certamen-card-footer">
            <button class="btn-select-card ${isLatam ? 'filled-magenta' : 'outline-magenta'}" onclick="selectCertamen('latam', event)">
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
              <img src="assets/logo_rally_nacional.png" class="certamen-header-logo" alt="Rally Nacional Nicaragua Innova">
              <div>${isNac ? checkCirclePurple : SVG.uncheckedCircle}</div>
            </div>

            <div class="certamen-illustration-wrap">
              ${SVG.momotomboIllustration}
            </div>

            <div class="certamen-meta-tag nacional">RALLY NACIONAL</div>
            <h2 class="certamen-card-title">Rally Nacional Nicaragua<br>Innova</h2>
            <p class="certamen-card-desc">Certamen universitario territorial de 24 horas.</p>
          </div>

          <div class="certamen-card-footer">
            <button class="btn-select-card ${isNac ? 'filled-purple' : 'outline-purple'}" onclick="selectCertamen('nacional', event)">
              Seleccionar ${SVG.arrowRight}
            </button>
          </div>
        </div>
      </div>

      <!-- Botón de Continuar Centrado (Exacto a la composición de usuario) -->
      <div style="display:flex; justify-content:center; margin-top:32px;">
        <button id="btnProceedCertamen" class="btn-select-card ${isLatam ? 'filled-magenta' : 'filled-purple'}" 
                style="padding:14px 52px; font-size:14.5px; font-weight:800; border-radius:12px; box-shadow:0 8px 24px -4px ${isLatam ? 'rgba(192, 38, 211, 0.35)' : 'rgba(124, 58, 237, 0.35)'};" 
                onclick="proceedFromCertamen()">
          Continuar ${SVG.arrowRight}
        </button>
      </div>

      <div class="handwritten-script script-bottom">
        Ideas que<br>compiten.
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
  if (!state.rally_type) {
    state.rally_type = "nacional";
    state.hours_total = 24;
    state.hours_remaining = 24;
  }
  saveState();
  activeTab = "team";
  syncUI();
}

// ═════════════════════════════════════════════════════════════════════════════
// 01 NIVEL 1: IDENTIDAD DE EQUIPO & LOGOS
// ═════════════════════════════════════════════════════════════════════════════
function renderViewTeam() {
  const certLabel = state.rally_type === "latam" ? "Rally Latinoamericano (28h)" : "Rally Nacional (24h)";
  const rallyLogoSrc = state.rally_type === "latam" ? "assets/logo_rally_latam.png" : "assets/logo_rally_nacional.png";

  return `
    <div class="wizard-canvas">
      <div class="stepper-header" style="justify-content:space-between;">
        <div style="display:flex; align-items:center; gap:14px;">
          <span class="stepper-pill">PASO 02 DE 03</span>
          <div class="stepper-bars">
            <div class="stepper-bar-segment completed"></div>
            <div class="stepper-bar-segment active"></div>
            <div class="stepper-bar-segment"></div>
          </div>
        </div>
        <button class="btn-minimal-back" onclick="switchTab('certamen')" title="Volver a selección de certamen">
          ${SVG.arrowLeft}
          <span>Cambiar certamen</span>
        </button>
      </div>

      <h1 class="wizard-hero-title" style="margin-bottom:24px;">Identidad del <span class="title-accent">Equipo</span></h1>

      <div class="workbench-card" style="box-shadow:0 4px 24px rgba(9, 30, 66, 0.04); border:1px solid #e2e8f0; border-radius:18px; padding:32px 28px; background:#fff; max-width:960px; margin:0 auto;">
        <div class="team-step-grid">
          <!-- Columna Izquierda: Formulario de Datos -->
          <div style="display:flex; flex-direction:column; justify-content:space-between;">
            <div>
              <div class="form-group full" style="margin-bottom:22px;">
                <label style="font-weight:700; color:#091e42; font-size:12.5px; display:block; margin-bottom:8px;">NOMBRE OFICIAL DEL EQUIPO</label>
                <input type="text" id="tm-name" placeholder="Ej: Pinoleros Tech, Mentes Volcánicas, InnovaUNI" value="${state.team_name || ''}"
                  style="width:100%; box-sizing:border-box; padding:12px 14px; border:1.5px solid #cbd5e1; border-radius:10px; font-size:14px; font-weight:600; color:#091e42;"
                  oninput="updateTeamName(this.value)">
              </div>

              <div class="form-group full">
                <label style="font-weight:700; color:#091e42; font-size:12.5px; display:block; margin-bottom:8px;">LOGO OFICIAL DEL EQUIPO (IMAGEN PNG / JPG / SVG / WEBP)</label>
                ${state.team_logo_img ? `
                  <div class="logo-preview-box">
                    <img src="${state.team_logo_img}" alt="Logo de Equipo" style="max-height:56px; max-width:90px; object-fit:contain; border-radius:6px; border:1px solid #e2e8f0; background:#fff; padding:4px;">
                    <div style="flex:1;">
                      <div style="font-size:13px; font-weight:700; color:#0f172a;">Logo Cargado Exitosamente</div>
                      <div style="font-size:11px; color:#64748b;">Visible en la credencial y el topbar.</div>
                    </div>
                    <button type="button" class="btn-pill-light" style="font-size:11px; color:#ef4444;" onclick="removeTeamLogo()">Quitar</button>
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
                    <div style="width:44px; height:44px; border-radius:50%; background:#eff6ff; display:flex; align-items:center; justify-content:center; color:#0066ff;">
                      ${SVG.upload}
                    </div>
                    <div style="font-size:13px; font-weight:700; color:#1e293b;">Haz clic o arrastra aquí el logo oficial</div>
                    <div style="font-size:11px; color:#64748b;">Formatos: PNG, JPG, SVG o WebP (alta resolución)</div>
                  </label>
                `}
              </div>
            </div>

            <div style="display:flex; justify-content:space-between; align-items:center; margin-top:32px; border-top:1px solid #f1f5f9; padding-top:18px;">
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
            <div style="font-size:11px; font-weight:800; letter-spacing:0.08em; color:#64748b; text-transform:uppercase; margin-bottom:22px;">
              Previsualización de Identidad
            </div>

            <!-- 1. Logo del grupo en grande -->
            <div style="width:130px; height:130px; margin:0 auto; border-radius:18px; border:2px ${state.team_logo_img ? 'solid #003366' : 'dashed #cbd5e1'}; background:#ffffff; display:flex; align-items:center; justify-content:center; overflow:hidden;">
              ${state.team_logo_img 
                ? `<img id="preview-team-logo" src="${state.team_logo_img}" style="width:100%; height:100%; object-fit:contain; padding:10px;" alt="Logo Equipo">`
                : `<div style="text-align:center; color:#94a3b8; font-size:11px; padding:8px;">
                     <div style="margin-bottom:6px; opacity:0.6;">${SVG.upload}</div>
                     <div style="font-weight:700;">Logo del Equipo</div>
                   </div>`
              }
            </div>

            <!-- 2. Abajo los 2 logos UNI y Rally en más pequeño -->
            <div style="display:flex; align-items:center; justify-content:center; gap:16px; margin-top:20px;">
              <img src="assets/logo_uni_official.png" style="height:32px; width:auto; max-width:75px; object-fit:contain;" alt="Universidad Nacional de Ingeniería">
              <span style="color:#cbd5e1; font-weight:300; font-size:16px;">|</span>
              <img src="${rallyLogoSrc}" style="height:28px; width:auto; max-width:125px; object-fit:contain;" alt="Rally Oficial">
            </div>

            <!-- 3. Nombre del grupo en grande ahí abajo -->
            <div style="margin-top:22px; text-align:center;">
              <h2 id="preview-team-name" style="font-family:var(--font-sans); font-size:24px; font-weight:900; color:#091e42; margin-bottom:6px; letter-spacing:-0.03em; word-break:break-word; text-transform:uppercase;">
                ${state.team_name || 'NOMBRE DEL EQUIPO'}
              </h2>
              <div style="font-family:var(--font-sans); font-size:12px; font-weight:800; color:#003366; text-transform:uppercase; letter-spacing:0.05em;">
                Universidad Nacional de Ingeniería
              </div>
              <div style="font-family:var(--font-sans); font-size:11px; font-weight:600; color:#64748b; margin-top:4px;">
                ${state.rally_type === 'latam' ? 'Rally Latinoamericano de Innovación 28h' : 'Rally Nacional Nicaragua Innova 24h'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

function updateTeamName(val) {
  state.team_name = val;
  saveState();
  const el = document.getElementById("preview-team-name");
  if (el) {
    el.innerText = val.trim() || "NOMBRE DEL EQUIPO";
  }
  const topbarCrumb = document.querySelector(".project-title-crumb");
  if (topbarCrumb) {
    topbarCrumb.innerText = val.trim() ? `/ ${val.trim()}` : "";
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
  state.university = "Universidad Nacional de Ingeniería (UNI)";
  saveState();
  activeTab = "challenges";
  syncUI();
}

// ═════════════════════════════════════════════════════════════════════════════
// 02 NIVEL 2: RETOS DEL COMITÉ (INGESTA OFICIAL POR TEXTO / PDF / CATÁLOGO)
// ═════════════════════════════════════════════════════════════════════════════
function renderViewChallenges() {
  const hasChallenges = state.challenges && state.challenges.length > 0;
  const list = hasChallenges ? state.challenges : [];

  const filtered = list.filter(ch => {
    if (challengeFilter === "all") return true;
    return (ch.category || "").toLowerCase().includes(challengeFilter.toLowerCase());
  });

  return `
    <div class="wizard-canvas" style="max-width:1080px;">
      <div class="stepper-header" style="justify-content:space-between;">
        <div style="display:flex; align-items:center; gap:14px;">
          <span class="stepper-pill">PASO 03 DE 03</span>
          <div class="stepper-bars">
            <div class="stepper-bar-segment completed"></div>
            <div class="stepper-bar-segment completed"></div>
            <div class="stepper-bar-segment active"></div>
          </div>
        </div>
        <div style="display:flex; align-items:center; gap:8px;">
          <button class="btn-minimal-back" onclick="switchTab('team')" title="Volver a identidad de equipo">
            ${SVG.arrowLeft}
            <span>Editar equipo</span>
          </button>
          <a href="/docs/Matriz_Seleccion_Desafios_2026.docx" download class="btn-pill-light" style="font-size:11px; padding:5px 12px; text-decoration:none;">
            ${SVG.download} Matriz Word (.docx)
          </a>
        </div>
      </div>

      <h1 class="wizard-hero-title">Selección del <span class="title-accent">Reto</span> Oficial</h1>
      <p class="wizard-hero-desc">
        Pega el listado oficial anunciado por el comité evaluador a las 8:00 AM para cargar los retos en el radar y deliberar la propuesta ganadora.
      </p>

      <!-- Caja Principal de Ingesta de Retos Oficiales del Comité -->
      <div class="workbench-card" style="box-shadow:0 4px 20px rgba(9, 30, 66, 0.04); border:1.5px solid #bfdbfe; background:#fcfdfe; border-radius:18px; padding:22px; margin-bottom:24px;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
          <strong style="font-size:13px; color:#0066ff;">Pega aquí el texto de los retos anunciado por el comité (WhatsApp / PDF / Web):</strong>
          <span style="font-size:11px; color:#64748b; font-family:var(--font-mono);">Formato libre o numerado</span>
        </div>
        <textarea id="raw-committee-challenges" rows="3" style="width:100%; border:1px solid #cbd5e1; border-radius:8px; padding:12px; font-size:12px; font-family:var(--font-mono); box-sizing:border-box; background:#fff;"
          placeholder="Ej: RETO 01: Reconversión de motores en desuso...&#10;RETO 02: Redes de sensores de inundación...&#10;RETO 03: Protección de polinizadores nativos..."></textarea>
        
        <div style="display:flex; justify-content:space-between; align-items:center; margin-top:12px;">
          <span style="font-size:11.5px; color:#64748b;">El sistema estructurará cada reto y contrastará la demanda oficial contra la propuesta WOW.</span>
          <div style="display:flex; gap:8px;">
            <button class="btn-pill-light" style="font-size:11.5px;" onclick="loadReferenceChallenges()">
              ${SVG.refresh} Cargar Catálogo de Referencia (9 Retos)
            </button>
            <button class="btn-select-card filled" style="padding:8px 16px; font-size:12px;" onclick="processCommitteeChallengesInput()">
              Procesar y Cargar al Radar ${SVG.arrowRight}
            </button>
          </div>
        </div>
      </div>

      ${!hasChallenges ? `
        <div class="workbench-card" style="text-align:center; padding:40px 24px; background:#f8fafc; border:1px dashed #cbd5e1; border-radius:18px;">
          <p style="font-size:14px; font-weight:700; color:#091e42; margin-bottom:6px;">No hay retos cargados en el radar todavía.</p>
          <p style="font-size:12.5px; color:#64748b; margin-bottom:18px;">Pega los retos comunicados por el comité arriba o carga el banco histórico de referencia.</p>
          <button class="btn-select-card filled" onclick="loadReferenceChallenges()">Cargar Catálogo Histórico de Referencia (9 Retos 2026)</button>
        </div>
      ` : `
        <!-- Filtros de Categoría -->
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
          <div style="display:flex; gap:8px;">
            <button class="btn-pill-light" style="${challengeFilter === 'all' ? 'background:#0066ff; color:#fff; border-color:#0066ff;' : ''} padding:5px 12px; font-size:11.5px;" onclick="challengeFilter='all'; renderTab('challenges');">
              Todos los Retos (${list.length})
            </button>
            <button class="btn-pill-light" style="${challengeFilter === 'innovación' ? 'background:#0066ff; color:#fff; border-color:#0066ff;' : ''} padding:5px 12px; font-size:11.5px;" onclick="challengeFilter='innovación'; renderTab('challenges');">
              Innovación
            </button>
            <button class="btn-pill-light" style="${challengeFilter === 'impacto social' ? 'background:#0066ff; color:#fff; border-color:#0066ff;' : ''} padding:5px 12px; font-size:11.5px;" onclick="challengeFilter='impacto social'; renderTab('challenges');">
              Impacto Social
            </button>
          </div>
          <span style="font-size:12px; font-weight:700; color:#64748b; font-family:var(--font-mono);">${list.length} Retos Listos para Deliberación</span>
        </div>

        <!-- Lista Comparativa de Retos -->
        <div style="display:flex; flex-direction:column; gap:16px;">
          ${filtered.map(ch => {
            const isSelected = state.challenge_id === ch.id;
            const odsStr = Array.isArray(ch.ods) ? ch.ods.join(", ") : (ch.ods || "ODS 9");
            return `
              <div class="challenge-box ${isSelected ? 'active' : ''}" style="border-radius:14px; border:1.5px solid ${isSelected ? '#0066ff' : '#e2e8f0'}; box-shadow:0 2px 10px rgba(9, 30, 66, 0.03);">
                <div class="challenge-box-header" style="background:#ffffff; padding:16px 20px; border-bottom:1px solid #f1f5f9;">
                  <div style="display:flex; align-items:center; gap:10px;">
                    <span class="badge-status ${isSelected ? 'badge-ok' : 'badge-pending'}" style="font-family:var(--font-mono); font-size:10px;">RETO #${ch.id}</span>
                    <span style="font-size:11px; font-weight:700; color:#64748b;">${ch.category} · ${odsStr}</span>
                    ${isSelected ? `<span style="font-size:10px; font-weight:800; color:#047857; background:#ecfdf5; border:1px solid #a7f3d0; padding:2px 8px; border-radius:9999px;">RETO ELEGIDO</span>` : ""}
                  </div>
                  <div style="display:flex; align-items:center; gap:14px;">
                    <div style="text-align:right;">
                      <span style="font-family:var(--font-mono); font-size:14px; font-weight:800; color:${ch.winRate >= 90 ? '#047857' : '#0066ff'};">${ch.winRate || 88}%</span>
                      <span style="font-size:10px; color:#64748b; display:block;">Prob. Victoria</span>
                    </div>
                    <button class="btn-select-card ${isSelected ? 'outline' : 'filled'}" style="padding:6px 14px; font-size:11.5px;" onclick="selectChallenge('${ch.id}')">
                      ${isSelected ? 'Seleccionado ✓' : 'Seleccionar este Reto →'}
                    </button>
                  </div>
                </div>

                <div style="padding:14px 20px 4px 20px; background:#fff;">
                  <h3 style="font-size:15px; font-weight:800; color:#091e42; margin-bottom:12px; line-height:1.35;">${ch.title}</h3>
                </div>

                <div class="challenge-split" style="border-top:1px solid #f1f5f9;">
                  <div class="challenge-col req" style="padding:16px 20px;">
                    <span class="col-label" style="color:#64748b;">${SVG.shield} Demanda Oficial del Comité</span>
                    <p style="font-size:12.5px; color:#334155; line-height:1.55;">${ch.officialExpectation || 'Demanda técnica y comunitaria oficial.'}</p>
                  </div>
                  <div class="challenge-col wow" style="padding:16px 20px; background:#f8fafc; border-left:1px solid #f1f5f9;">
                    <span class="col-label" style="color:#0066ff;">${SVG.spark} Propuesta de Vanguardia (WOW)</span>
                    <p style="font-size:12.5px; color:#091e42; font-weight:600; line-height:1.55;">${ch.wowProposal || 'Enfoque de solución disruptivo con tecnología de vanguardia.'}</p>
                  </div>
                </div>
              </div>
            `;
          }).join("")}
        </div>
      `}
    </div>
  `;
}

function loadReferenceChallenges() {
  state.challenges = JSON.parse(JSON.stringify(OFFICIAL_CHALLENGES_2026));
  saveState();
  renderTab("challenges");
  alert("✓ Catálogo histórico de referencia cargado (9 retos oficiales).");
}

function processCommitteeChallengesInput() {
  const txt = (document.getElementById("raw-committee-challenges").value || "").trim();
  if (!txt) {
    alert("Pega el texto de los retos anunciado por el comité.");
    return;
  }

  // Parser inteligente por patrones de número/título
  const lines = txt.split("\n").map(l => l.trim()).filter(Boolean);
  const parsed = [];
  let current = null;

  lines.forEach(l => {
    const match = l.match(/^(?:reto|desaf[ií]o)?\s*#?\s*(\d+)[:\.\-\s]+(.*)/i);
    if (match) {
      if (current) parsed.push(current);
      current = {
        id: match[1].padStart(2, "0"),
        title: match[2].trim(),
        category: match[2].toLowerCase().includes("social") || match[2].toLowerCase().includes("comun") ? "Impacto Social" : "Innovación",
        ods: ["ODS 9", "ODS 12"],
        winRate: 90,
        compDensity: "Baja (Nueva edición)",
        officialExpectation: "",
        wowProposal: `Solución tecnológica modular asistida por telemetría autónoma y bajo consumo optimizada para resolver ${match[2].toLowerCase()}.`
      };
    } else if (current) {
      current.officialExpectation = (current.officialExpectation + " " + l).trim();
    }
  });
  if (current) parsed.push(current);

  if (parsed.length > 0) {
    state.challenges = parsed;
    saveState();
    renderTab("challenges");
    alert(`✓ ${parsed.length} retos del comité procesados y cargados al radar.`);
  } else {
    // Si no detectó números, crear 1 reto con todo el texto
    state.challenges = [{
      id: "01",
      title: lines[0],
      category: "Innovación",
      ods: ["ODS 9", "ODS 12"],
      winRate: 90,
      compDensity: "Nueva edición",
      officialExpectation: lines.slice(1).join(" ") || lines[0],
      wowProposal: `Arquitectura técnica modular con sensores in-situ y bajo consumo para ${lines[0].toLowerCase()}.`
    }];
    saveState();
    renderTab("challenges");
    alert("✓ Reto procesado y cargado al radar.");
  }
}

function selectChallenge(id) {
  const ch = (state.challenges || []).find(c => c.id === id) || OFFICIAL_CHALLENGES_2026.find(c => c.id === id);
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
// 03 NIVEL 3: TALLER DE SOLUCIÓN & PROMPT BUILDER
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
  state.description_one_line = state.solution_thesis;

  if (!state.pautado.solucion) {
    state.pautado.solucion = state.solution_thesis;
  }

  saveState();
  activeTab = "multi_ai";
  syncUI();
}

// ═════════════════════════════════════════════════════════════════════════════
// 04 NIVEL 4: DESPACHO MULTI-IA & MEGA-PROMPTS ESPECIALIZADOS
// ═════════════════════════════════════════════════════════════════════════════
function renderViewMultiAI() {
  const tasks = state.tasks || getDefaultMultiAITasks();

  return `
    <div class="page-header">
      <div>
        <h1 class="page-title">04 · Despacho Multi-IA & Coordinación en Paralelo</h1>
        <div class="page-desc">Coordina OpenCode, Antigravity y modelos externos gratuitos (Gemini, Perplexity, Alibaba) sin duplicar trabajo.</div>
      </div>
      <div style="display:flex; gap:8px;">
        <button class="btn-primary" onclick="copySyncToken()">${SVG.copy} Copiar Token para WhatsApp</button>
        <button class="btn-secondary" onclick="pasteSyncToken()">${SVG.upload} Pegar Token de Equipo</button>
      </div>
    </div>

    <!-- Banner de Seguridad para Wi-Fi Universitario -->
    <div class="wifi-bypass-card">
      <div>
        <strong style="font-size:12px; color:var(--text-main); display:block;">Colaboración en Red Universitaria (Bypass de Aislamiento Wi-Fi)</strong>
        <p style="font-size:11px; color:var(--text-muted); margin:0;">
          Si la red de la universidad bloquea la conexión IP local directa, compartan el Token por WhatsApp o utilicen la sincronización de archivos JSON en Google Drive.
        </p>
      </div>
      <div style="display:flex; gap:8px;">
        <a href="${state.google_drive_url}" target="_blank" class="btn-secondary" style="font-size:11px; text-decoration:none; display:inline-flex; align-items:center; gap:4px;">
          Abrir Google Drive ${SVG.external}
        </a>
        <button class="btn-secondary" style="font-size:11px;" onclick="exportProjectJson()">Exportar JSON</button>
      </div>
    </div>

    <!-- Cuadrícula de Tareas Multi-IA en Paralelo -->
    <div class="task-dispatch-grid">
      ${tasks.map(t => {
        let statusBadge = "";
        let cardClass = "";
        if (t.status === "in_progress") {
          statusBadge = `<span class="badge-status badge-warn">EN CURSO (TRABAJANDO)</span>`;
          cardClass = "in-progress";
        } else if (t.status === "completed") {
          statusBadge = `<span class="badge-status badge-ok">${SVG.check} COMPLETADO</span>`;
          cardClass = "completed";
        } else {
          statusBadge = `<span class="badge-status badge-pending">PENDIENTE</span>`;
        }

        const promptText = generateSpecificMegaPrompt(t.id);

        return `
          <div class="task-dispatch-card ${cardClass}">
            <div>
              <div class="task-header">
                <span class="task-ai-tag">${t.ai}</span>
                ${statusBadge}
              </div>
              <h3 class="task-title">${t.title}</h3>
              <p class="task-desc">${t.desc}</p>

              <!-- Vista previa del Prompt -->
              <div class="prompt-snippet-box">
                ${promptText}
              </div>

              <div style="display:flex; gap:8px; margin-bottom:12px;">
                <button class="btn-secondary" style="flex:1; font-size:11px; padding:4px 8px;" onclick="copySpecificMegaPrompt('${t.id}')">
                  ${SVG.copy} Copiar Mega-Prompt
                </button>
                <button class="btn-secondary" style="font-size:11px; padding:4px 8px; color:#d97706;" onclick="setTaskStatus('${t.id}', 'in_progress')">
                  Marcar "En Curso"
                </button>
              </div>

              <!-- Caja de Aterrizaje Ctrl+V -->
              <div>
                <textarea id="paste-result-${t.id}" class="landing-paste-area" placeholder="Pega aquí la respuesta generada por ${t.ai} (Ctrl+V)...">${t.result || ''}</textarea>
              </div>
            </div>

            <div style="display:flex; justify-content:space-between; align-items:center; margin-top:10px; pt:8px; border-top:1px solid var(--border-light);">
              <span style="font-size:10px; color:var(--text-muted); font-family:var(--font-mono);">Inyección automática</span>
              <button class="btn-primary" style="font-size:11px; padding:4px 10px;" onclick="injectTaskResult('${t.id}')">
                Inyectar Datos al Proyecto ${SVG.arrowRight}
              </button>
            </div>
          </div>
        `;
      }).join("")}
    </div>
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
  const cert = state.rally_type === "latam" ? "Rally Latinoamericano de Innovación (28h)" : "Rally Nacional Nicaragua Innova (24h)";

  if (taskId === "stats_poverty") {
    return `Actúa como Investigador Principal para el ${cert}.
Proyecto: "${pName}" enfocado en el reto: "${chTitle}".
Tesis: "${thesis}".
Instrucción estricta:
1. Extrae 3 estadísticas cuantitativas verificables con fuente real (ej: pérdidas en USD, personas afectadas, hectáreas).
2. Vincula directamente 2 metas oficiales de los ODS aplicables.
3. ${state.rally_type === 'nacional' ? 'Alinea con un Eje específico del Plan Nacional de Lucha contra la Pobreza de Nicaragua.' : 'Describe el modelo de transferencia y escalamiento modular para municipios de América Latina.'}
4. Proporciona las citas en formato APA 7 y una síntesis de 1 párrafo para la sección Problema del pautado (máximo 700 caracteres con espacios).`;
  }

  if (taskId === "patents_art") {
    return `Actúa como Especialista en Propiedad Intelectual y Patentes para el ${cert}.
Proyecto: "${pName}" enfocado en: "${chTitle}".
Tesis técnica: "${thesis}".
Instrucción estricta:
1. Busca 2 patentes o antecedentes técnicos en Google Patents / WIPO / Lens relacionados con esta temática.
2. Identifica los números de publicación y explica exactamente en qué se diferencia nuestra solución técnica (qué hace única nuestra arquitectura).
3. Redacta el bloque de 'Innovación y Diferenciación' para el documento pautado (máximo 800 caracteres con espacios, sin adjetivos vacíos, puramente técnico).`;
  }

  if (taskId === "blender_3d") {
    return `Actúa como Ingeniero Mecánico y Programador de Blender Python (bpy).
Proyecto: "${pName}" (${chTitle}).
Tesis: "${thesis}".
Instrucción estricta:
Genera un script de Python ejecutable en Blender 3.6+ / 4.x para modelar de forma paramétrica el prototipo del dispositivo.
Reglas:
- Carcasa estanca con esquinas biseladas (bevels), puertos IP67 o entradas de cable, y pernos métricos realistas.
- Materiales definidos mediante nodos PBR (plástico industrial rugoso, partes metálicas y panel translúcido).
- Cámara y luz tipo estudio configuradas para renderizar una imagen de alta resolución o rotación de 360 grados.
- Código limpio, sin dependencias externas, con comentarios breves.`;
  }

  if (taskId === "budget_alibaba") {
    return `Actúa como Ingeniero de Costos y Abastecimiento Internacional para el ${cert}.
Proyecto: "${pName}" (${chTitle}).
Tesis: "${thesis}".
Instrucción estricta:
Elabora el Presupuesto de Puesta en Marcha para el lote piloto de 10 unidades.
Reglas:
1. Cotiza 5 a 6 insumos reales de sitios mayoristas (Alibaba / distribuidores electrónicos).
2. Proporciona: Elemento, Unidades requeridas, Costo unitario en USD y Enlace de búsqueda real.
3. Incluye una partida obligatoria para Flete Internacional y Aranceles de Importación (18%).
4. El monto total final debe situarse estrictamente en el rango óptimo de $4,000 a $6,000 USD.`;
  }

  if (taskId === "voice_audio") {
    return `Actúa como Locutor Profesional de Pitch de Innovación.
Proyecto: "${pName}" (${chTitle}).
Tesis: "${thesis}".
Instrucción estricta:
Genera el texto de locución limpio para los 4 actos de 120 segundos (cadencia estricta de 135 palabras por minuto, total 250 a 270 palabras).
Reglas:
- Acto 1 (0–20s): Dolor humano y cifras cuantificadas. PROHIBIDO mencionar el nombre del proyecto o mostrar logos.
- Acto 2 (20–60s): Explicación técnica de la solución.
- Acto 3 (60–95s): Prefactibilidad y desglose de presupuesto en USD.
- Acto 4 (95–120s): Cierre de impacto y llamado a la acción.
- Entrega solo el texto continuo para sintetizador TTS, sin acotaciones ni corchetes.`;
  }

  return `Mega-Prompt especializado para ${pName} (${cert}).`;
}

function copySpecificMegaPrompt(taskId) {
  const promptText = generateSpecificMegaPrompt(taskId);
  navigator.clipboard.writeText(promptText);
  setTaskStatus(taskId, "in_progress");
  alert(`✓ Mega-Prompt para ${taskId} copiado al portapapeles. La tarea quedó marcada 'En Curso'.`);
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
  }

  saveState();
  renderTab("multi_ai");
  alert(`✓ Datos inyectados al proyecto y tarea marcada como 'Completado'.`);
}

// ═════════════════════════════════════════════════════════════════════════════
// 05 NIVEL 4: PAUTADO OFICIAL (< LÍMITES CON ESPACIOS)
// ═════════════════════════════════════════════════════════════════════════════
function renderViewPautado() {
  return `
    <div class="page-header">
      <div>
        <h1 class="page-title">05 · Documento Pautado Oficial</h1>
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
// 06 NIVEL 4: PRESUPUESTO DE PUESTA EN MARCHA
// ═════════════════════════════════════════════════════════════════════════════
function renderViewBudget() {
  const total = state.budget.reduce((a, b) => a + (b.units * b.unit_cost), 0);
  const isTooLow = total < 3000;
  const isTooHigh = total > 6500;
  const hasNotice = isTooLow || isTooHigh;

  return `
    <div class="page-header">
      <div>
        <h1 class="page-title">06 · Presupuesto de Puesta en Marcha</h1>
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
// 07 NIVEL 4: BÓVEDA DE RECURSOS, LOGOS & ENLACES FIJOS
// ═════════════════════════════════════════════════════════════════════════════
function renderViewResources() {
  return `
    <div class="page-header">
      <div>
        <h1 class="page-title">07 · Bóveda de Recursos, Logos & Entregables</h1>
        <div class="page-desc">Repositorio unificado de archivos para video pitch, enlaces de equipo y entregables oficiales.</div>
      </div>
      <button class="btn-primary" onclick="saveTeamHubLinks()">Guardar Enlaces de Equipo</button>
    </div>

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

    <div class="workbench-card">
      <h3 style="margin-bottom:12px;">Logos Oficiales para el Video Pitch (Acto 2 al 4)</h3>
      <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(200px, 1fr)); gap:12px;">
        <div style="border:1px solid var(--border-light); padding:12px; border-radius:6px; background:#f8fafc; text-align:center;">
          <div style="height:48px; display:flex; align-items:center; justify-content:center; gap:8px;">
            <img src="assets/logo_uni_official.png" style="max-height:44px; max-width:100px; object-fit:contain;" alt="Universidad Nacional de Ingeniería">
          </div>
          <strong style="font-size:11px; display:block;">Logo Institucional Sede</strong>
          <span style="font-size:10px; color:var(--text-muted);">${state.university || 'Universidad Nacional de Ingeniería'}</span>
        </div>

        <div style="border:1px solid var(--border-light); padding:12px; border-radius:6px; background:#f8fafc; text-align:center;">
          <div style="height:48px; display:flex; align-items:center; justify-content:center; gap:8px;">
            <img src="${state.rally_type === 'latam' ? 'assets/logo_rally_latam.png' : 'assets/logo_rally_nacional.png'}" style="max-height:44px; max-width:140px; object-fit:contain;" alt="Rally Oficial">
          </div>
          <strong style="font-size:11px; display:block;">Logo Oficial del Evento</strong>
          <span style="font-size:10px; color:var(--text-muted);">${state.rally_type === 'latam' ? 'Edición Continental (28h)' : 'Nacional Innova (24h)'}</span>
        </div>

        <div style="border:1px solid var(--border-light); padding:12px; border-radius:6px; background:#f8fafc; text-align:center;">
          <div style="height:48px; display:flex; align-items:center; justify-content:center; color:var(--text-main); font-weight:800; font-size:14px;">
            ${state.team_logo_img ? `<img src="${state.team_logo_img}" style="max-height:44px; max-width:120px; object-fit:contain;" alt="Logo Equipo">` : `${SVG.spark} ${state.team_name || 'EQUIPO'}`}
          </div>
          <strong style="font-size:11px; display:block;">Emblema de Equipo</strong>
          <span style="font-size:10px; color:var(--text-muted);">${state.team_name || 'Nombre de Equipo'}</span>
        </div>
      </div>
    </div>

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
            <td>Catálogo de retos + pronósticos WOW + tabla de votación</td>
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
// 08 MODELO CANVAS
// ═════════════════════════════════════════════════════════════════════════════
function renderViewCanvas() {
  return `
    <div class="page-header">
      <div>
        <h1 class="page-title">08 · Matriz de Negocio Canvas</h1>
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
// 09 GUION AUDIOVISUAL (4 ACTOS, 120 SEGUNDOS) & LOCUCIÓN WAV
// ═════════════════════════════════════════════════════════════════════════════
function renderViewScript() {
  const words = [state.script.acto1, state.script.acto2, state.script.acto3, state.script.acto4]
    .join(" ").trim().split(/\s+/).filter(Boolean).length;
  const estSeconds = Math.round((words / 135) * 60);

  return `
    <div class="page-header">
      <div>
        <h1 class="page-title">09 · Guion Audiovisual de 120 Segundos (4 Actos)</h1>
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
// 10 PROTOTIPO DIGITAL PARA TOMAS DE VIDEO
// ═════════════════════════════════════════════════════════════════════════════
function renderViewWebDemo() {
  const pName = state.project_name || "PROTOTIPO_ACTIVO";
  const isSocial = state.category === "Impacto Social";

  return `
    <div class="page-header">
      <div>
        <h1 class="page-title">10 · Prototipo Digital para Tomas de Video</h1>
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
// 11 CRONOGRAMA DE ENTREGA SIRLI, NOMENCLATURAS Y GUARDARRAÍLES
// ═════════════════════════════════════════════════════════════════════════════
const GUARDRAILS_DEFINITIONS = [
  {
    key: "team_sirli_registered",
    title: "1. Registro del Equipo en Plataforma SIRLI (Límite: 12:00 PM)",
    desc: "Todos los integrantes y la sede Universidad Nacional de Ingeniería (UNI) deben estar confirmados en la plataforma antes de mediodía.",
    risk: "Equipos no validados a las 12:00 PM quedan inhabilitados por el sistema central."
  },
  {
    key: "video_duration_ok",
    title: "2. Duración del Video Pitch (Estrictamente ≤ 119 Segundos)",
    desc: "El video no debe exceder los 2 minutos exactos (120s). Recomendado exportar a 1:55 - 1:58 min.",
    risk: "Un video de 121 segundos (2:01 min) es descalificado automáticamente por el software evaluador sin revisión humana."
  },
  {
    key: "video_unlisted_or_public",
    title: "3. Privacidad de YouTube: 'No listado' (Oculto) o 'Público'",
    desc: "Comprobar el enlace abriéndolo en una ventana de incógnito sin sesión de Google iniciada.",
    risk: "Subir el video en 'Privado' impide al jurado calificador reproducirlo, otorgando 0 puntos en el pitch."
  },
  {
    key: "naming_pdf_ok",
    title: "4. Nomenclatura Oficial del Archivo PDF Pautado",
    desc: "Nombrar el archivo exportado exactamente con el formato reglamentario generado en esta pantalla.",
    risk: "Nombres genéricos (ej. 'documento_final.pdf' o 'tarea.pdf') sufren penalización en la etapa de auditoría documental."
  },
  {
    key: "hashtags_included",
    title: "5. Hashtags Oficiales en YouTube y TikTok",
    desc: "Incluir en la descripción y título del video los tags oficiales requeridos para el certamen activo.",
    risk: "La omisión de los hashtags reglamentarios o de la etiqueta de la sede UNI invalida los puntos de interacción y difusión."
  },
  {
    key: "pautado_chars_ok",
    title: "6. Respeto Estricto de Caracteres en el Documento Pautado",
    desc: "Problema (≤1000), Solución (≤1500), Prefactibilidad (≤1500), Innovación (≤1000), Impacto (≤1000).",
    risk: "El sistema SIRLI trunca o rechaza textos que excedan el límite oficial de caracteres con espacios."
  }
];

function getOfficialNomenclatures() {
  const isLatam = state.rally_type === "latam";
  const rawTeam = state.team_name || "NOMBRE_EQUIPO";
  const teamClean = rawTeam.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9_]/g, "_").replace(/_+/g, "_");
  const chalId = (state.challenge_id || "01").toString().padStart(2, "0");
  const chal = OFFICIAL_CHALLENGES_2026.find(c => c.id === chalId) || (state.challenges && state.challenges.find(c => c.id === chalId)) || { title: "Innovación Tecnológica" };
  const shortTitle = chal.title.split(" ").slice(0, 6).join(" ");

  if (isLatam) {
    return {
      pdfName: `UNI_Reto${chalId}_${teamClean}_PAUTADO.pdf`,
      ytTitle: `Rally Latinoamericano de Innovación 2026 - Desafío ${chalId}: ${shortTitle} - Equipo ${teamClean}`,
      hashtags: [
        "#RallyLatinoamericano2026",
        "#RallyLatam",
        "#InnovacionLatam",
        "#SedeUNI",
        "#NicaraguaInnova"
      ],
      tiktokTip: "Subir video de interacción lúdica antes de las 08:00 PM (Viernes) para garantizar indexación en el feed y acumulación de métricas antes de la deliberación del jurado.",
      regimenDesc: "Certamen internacional de 28 horas continuas. Exige estricta coincidencia de datos y link público/no listado."
    };
  } else {
    return {
      pdfName: `Innova2026_Desafio${chalId}_${teamClean}_PAUTADO.pdf`,
      ytTitle: `Rally Nacional Nicaragua Innova 2026 - Reto ${chalId}: ${shortTitle} - ${teamClean}`,
      hashtags: [
        "#NicaraguaInnova2026",
        "#RallyNacionalInnova",
        "#UNI_Nicaragua",
        "#JuventudInnovadora",
        "#InnovacionUNI"
      ],
      tiktokTip: "Subir cápsula audiovisual de prototipo antes de las 08:00 PM para verificación temprana de los enlaces en la plataforma territorial.",
      regimenDesc: "Certamen nacional territorial de 24 horas continuas con sede oficial UNI."
    };
  }
}

function toggleGuardrail(key) {
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
  if (activeTab === "timeline") {
    renderTab("timeline");
  }
  updateInspector();
}

function renderViewTimeline() {
  const isLatam = state.rally_type === "latam";
  const nom = getOfficialNomenclatures();
  const allHashtagsStr = nom.hashtags.join(" ");
  const guardrails = state.guardrails || {};
  const currentDeadline = getCurrentDeadlineAlert();

  return `
    <div class="page-header" style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:14px;">
      <div>
        <h1 class="page-title">11 · Cronograma Oficial SIRLI & Guardarraíles Antidescalificación</h1>
        <div class="page-desc">Horarios oficiales de Nicaragua (UTC-6), nomenclaturas reglamentarias y directrices innegociables de entrega.</div>
      </div>
      <div style="display:flex; gap:10px; align-items:center; flex-wrap:wrap;">
        <span class="stepper-pill" style="background:#eff6ff; color:#003366; border:1px solid #bfdbfe; font-weight:700;">
          HORA NICARAGUA (UTC-6)
        </span>
        <span class="stepper-pill" style="${isLatam ? 'background:#fdf4ff; color:#a21caf; border:1px solid #f0abfc;' : 'background:#f5f3ff; color:#6d28d9; border:1px solid #ddd6fe;'} font-weight:700;">
          ${isLatam ? 'Rally Latam (28 Horas)' : 'Rally Nacional (24 Horas)'}
        </span>
      </div>
    </div>

    <!-- Banner Suave de Estado Actual del Cronograma -->
    <div style="background:#ffffff; border:1px solid #e2e8f0; border-radius:12px; padding:16px 20px; margin-bottom:20px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:14px; box-shadow:0 1px 3px rgba(0,0,0,0.02);">
      <div style="display:flex; align-items:center; gap:12px;">
        <div style="width:38px; height:38px; border-radius:10px; ${isLatam ? 'background:#fdf4ff; color:#c026d3; border:1px solid #f0abfc;' : 'background:#f5f3ff; color:#7c3aed; border:1px solid #ddd6fe;'} display:flex; align-items:center; justify-content:center;">
          ${SVG.clock}
        </div>
        <div>
          <div style="font-size:11px; font-weight:800; text-transform:uppercase; color:#64748b; letter-spacing:0.04em;">PRÓXIMO HITO CRÍTICO</div>
          <div style="font-size:15px; font-weight:800; color:#091e42;">${currentDeadline.label} — <span style="color:#003366;">${currentDeadline.time}</span></div>
        </div>
      </div>
      <div style="font-size:12px; color:#475569; max-width:440px; line-height:1.4;">
        ${currentDeadline.desc}
      </div>
    </div>

    <div class="timeline-grid">
      <!-- BLOQUE 1: GENERADOR OFICIAL DE NOMENCLATURAS Y TÍTULOS -->
      <div class="naming-box-card">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px; border-bottom:1px solid #f1f5f9; padding-bottom:10px;">
          <div>
            <h3 style="font-size:13.5px; font-weight:800; color:#091e42; margin:0 0 2px 0;">Nomenclaturas Oficiales Reglamentarias</h3>
            <p style="font-size:11.5px; color:#64748b; margin:0;">Copia y pega con 1 clic los nombres exactos para evitar penalizaciones por formato.</p>
          </div>
          <span style="font-size:10.5px; font-weight:700; background:#f8fafc; border:1px solid #e2e8f0; color:#475569; padding:4px 9px; border-radius:6px;">
            Atención al Detalle
          </span>
        </div>

        <div class="naming-field-group">
          <div class="naming-field-label">
            <span>Nombre Oficial del Archivo PDF (Pautado Oficial)</span>
            <span style="font-size:10.5px; color:#64748b; text-transform:none; font-weight:600;">Máx 15 MB · Formato PDF</span>
          </div>
          <div class="naming-input-row">
            <input type="text" class="naming-input-readonly" readonly value="${nom.pdfName}" id="input-pdf-name">
            <button class="btn-copy-action" onclick="copyToClipboardWithFeedback('${nom.pdfName}', 'Nombre de archivo PDF copiado')">
              ${SVG.copy} Copiar Nombre
            </button>
          </div>
        </div>

        <div class="naming-field-group">
          <div class="naming-field-label">
            <span>Título Reglamentario para el Video en YouTube</span>
            <span style="font-size:10.5px; color:#64748b; text-transform:none; font-weight:600;">YouTube 1080p · Modo No Listado</span>
          </div>
          <div class="naming-input-row">
            <input type="text" class="naming-input-readonly" readonly value="${nom.ytTitle}" id="input-yt-title">
            <button class="btn-copy-action" onclick="copyToClipboardWithFeedback('${nom.ytTitle}', 'Título de YouTube copiado')">
              ${SVG.copy} Copiar Título
            </button>
          </div>
        </div>
      </div>

      <!-- BLOQUE 2: BANCO DE HASHTAGS INNEGOCIABLES -->
      <div class="naming-box-card">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; border-bottom:1px solid #f1f5f9; padding-bottom:10px;">
          <div>
            <h3 style="font-size:13.5px; font-weight:800; color:#091e42; margin:0 0 2px 0;">Hashtags Oficiales Obligatorios (YouTube & TikTok)</h3>
            <p style="font-size:11.5px; color:#64748b; margin:0;">El reglamento exige incluir las etiquetas del certamen y la sede UNI.</p>
          </div>
          <button class="btn-copy-action" onclick="copyToClipboardWithFeedback('${allHashtagsStr}', 'Todos los hashtags oficiales copiados')">
            ${SVG.copy} Copiar Todos los Hashtags
          </button>
        </div>

        <div class="hashtag-cloud">
          ${nom.hashtags.map(t => `<span class="hashtag-pill">${t}</span>`).join("")}
        </div>

        <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:12px 14px; font-size:11.5px; color:#475569; line-height:1.5;">
          <strong>Directriz de Impacto en Redes:</strong> ${nom.tiktokTip}
        </div>
      </div>

      <!-- BLOQUE 3: CRONOGRAMA DE HITOS HORA NICARAGUA -->
      <div class="naming-box-card">
        <div style="margin-bottom:14px;">
          <h3 style="font-size:13.5px; font-weight:800; color:#091e42; margin:0 0 2px 0;">Cronograma de Hitos Innegociables (Hora Nicaragua UTC-6)</h3>
          <p style="font-size:11.5px; color:#64748b; margin:0;">Secuencia crítica para asegurar la entrega sin saturación ni descalificaciones.</p>
        </div>

        <table class="data-table">
          <thead>
            <tr>
              <th style="width:140px;">Hito / Hora</th>
              <th>Acción Crítica Innegociable</th>
              <th style="width:280px;">Riesgo / Penalización</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>08:00 AM (Viernes)</strong></td>
              <td>Apertura oficial de retos en plataforma SIRLI. Descarga de matrices y conformación de tesis.</td>
              <td>Elegir reto sin analizar precedentes satura la fase de investigación.</td>
            </tr>
            <tr style="background:#fdf4ff;">
              <td><strong style="color:#a21caf;">12:00 PM (Viernes)</strong></td>
              <td><strong>Límite fatal de inscripción en SIRLI.</strong> Todos los integrantes validados con sede UNI.</td>
              <td><span style="color:#a21caf; font-weight:700;">Descalificación automática:</span> el sistema no permite concursar a equipos sin registro al mediodía.</td>
            </tr>
            <tr>
              <td><strong>08:00 PM (Viernes)</strong></td>
              <td><strong>Ventana óptima para video TikTok (Interacción lúdica).</strong> Subir con hashtags oficiales.</td>
              <td>Subir tarde no permite ganar tracción en el algoritmo ni acumular votos antes del corte.</td>
            </tr>
            <tr>
              <td><strong>T-6 Horas</strong></td>
              <td>Congelamiento de claims y arquitectura técnica. Tesis bloqueada en el dashboard.</td>
              <td>Cambiar el enfoque técnico a última hora produce renders y guiones a medias.</td>
            </tr>
            <tr>
              <td><strong>T-4 Horas</strong></td>
              <td>Pautado oficial auditado (5 bloques validados) y presupuesto sustentado con cotizaciones.</td>
              <td>Exceder caracteres con espacios causa error de guardado en la plataforma.</td>
            </tr>
            <tr>
              <td><strong>T-2 Horas</strong></td>
              <td>Exportación final de video pitch (1080p, ≤119s) y subida a YouTube en modo 'No listado'.</td>
              <td>YouTube tarda entre 20 y 30 minutos en procesar la versión HD de 1080p.</td>
            </tr>
            <tr>
              <td><strong>T-1 Hora</strong></td>
              <td>Probar enlace en ventana de incógnito y cargar archivo PDF del pautado en SIRLI.</td>
              <td>Un video configurado en 'Privado' recibe calificación de 0 puntos del jurado.</td>
            </tr>
            <tr style="background:#f8fafc; font-weight:700;">
              <td><strong style="color:#003366;">T-0 Inmutable</strong></td>
              <td><strong>Cierre de plataforma.</strong> Confirmar comprobante de entrega en pantalla.</td>
              <td>La plataforma se bloquea al segundo exacto. Cero tolerancia a entregas tardías.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- BLOQUE 4: CHECKLIST ANTIDESCALIFICACIÓN (GUARDARRAÍLES) -->
      <div class="naming-box-card">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px; border-bottom:1px solid #f1f5f9; padding-bottom:10px;">
          <div>
            <h3 style="font-size:13.5px; font-weight:800; color:#091e42; margin:0 0 2px 0;">Checklist Antidescalificación (Guardarraíles)</h3>
            <p style="font-size:11.5px; color:#64748b; margin:0;">Marca cada casilla antes del envío definitivo para proteger la elegibilidad del equipo.</p>
          </div>
          <span style="font-size:11.5px; font-weight:800; color:#003366;">
            ${Object.values(guardrails).filter(Boolean).length} de ${GUARDRAILS_DEFINITIONS.length} Verificados
          </span>
        </div>

        <div class="guardrails-list">
          ${GUARDRAILS_DEFINITIONS.map(g => {
            const isChecked = !!guardrails[g.key];
            return `
              <div class="guardrail-item ${isChecked ? 'checked' : ''}" onclick="toggleGuardrail('${g.key}')">
                <div class="guardrail-checkbox-square">
                  ${isChecked ? SVG.check : ''}
                </div>
                <div style="flex:1;">
                  <div class="guardrail-title" style="${isChecked ? 'color:#003366;' : ''}">${g.title}</div>
                  <div class="guardrail-desc">${g.desc}</div>
                  <div style="font-size:11px; color:#94a3b8; margin-top:2px; font-weight:600;">⚠️ ${g.risk}</div>
                </div>
              </div>
            `;
          }).join("")}
        </div>
      </div>
    </div>
  `;
}

// ── INSPECTOR LATERAL DE AUDITORÍA ───────────────────────────────────────────
function updateInspector() {
  const panel = document.getElementById("panel");
  if (!panel) return;

  const stage = getWorkflowStage();
  if (stage < 2) return;

  const guardrails = state.guardrails || {};
  const guardrailsCount = Object.values(guardrails).filter(Boolean).length;
  const guardrailsTotal = GUARDRAILS_DEFINITIONS.length;
  const guardrailsOk = guardrailsCount === guardrailsTotal;

  let points = 0;
  if (state.rally_type) points += 10;
  if (state.team_name && state.university) points += 10;
  if (state.challenge_id) points += 15;
  if (state.solution_approved) points += 15;
  if (isPautadoComplete()) points += 15;
  if (isBudgetValid()) points += 10;
  if (isScriptComplete()) points += 10;
  if (guardrailsCount >= 5) points += 15;

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
        <div class="audit-item ${guardrailsOk ? 'ok' : 'pending'}" onclick="switchTab('timeline')" style="cursor:pointer;" title="Clic para revisar guardarraíles">
          <span>Guardarraíles SIRLI</span>
          <strong>${guardrailsCount}/${guardrailsTotal} OK</strong>
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
