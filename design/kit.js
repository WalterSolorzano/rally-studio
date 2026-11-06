// kit.js — lógica del kit de prensa + thumbnail
// Comparte identidad con design/index.html vía shared.js

var S = loadIdentity();

function $(id) { return document.getElementById(id); }

// Fuente sugerida solo si existe en la biblioteca del proyecto; si no, null.
function fuenteOk(nombre) {
  if (!nombre || typeof nombre !== 'string' || typeof FONT_LIBRARY === 'undefined') return null;
  var n = nombre.trim().toLowerCase();
  for (var i = 0; i < FONT_LIBRARY.length; i++) {
    if (FONT_LIBRARY[i].family.toLowerCase() === n) return FONT_LIBRARY[i].family;
  }
  return null;
}

function cssVar(name, val) {
  document.documentElement.style.setProperty(name, val);
}

// Paleta canonica compartida (ver shared.js):
//   bg fondo · bg2 fondo 2 · ac marca · ink texto · mu texto suave · gl formas
function kitPaper() {
  var bg2 = S.pal.bg2, bg = S.pal.bg;
  if (lumOf(bg2) != null && lumOf(bg2) > 0.85) return bg2;
  if (lumOf(bg) != null && lumOf(bg) > 0.85) return bg;
  return '#FFFFFF';
}

function applyPalette() {
  var paper = kitPaper();
  var ink = legibleInk(paper);
  var brand = brandColor(paper);
  cssVar('--paper', paper);
  cssVar('--primary', brand);
  cssVar('--navy', ink);
  cssVar('--accent', S.pal.ac || '#0284C7');
  var kit = $('kitPreview');
  if (kit) {
    kit.style.setProperty('--paper', paper);
    kit.style.setProperty('--primary', brand);
    kit.style.setProperty('--navy', ink);
    kit.style.setProperty('--accent', S.pal.ac);
  }
}

function syncControls() {
  $('teamName').value = S.team.name || '';
  $('logoText').value = (S.team.tag || '').replace('#', '').slice(0, 3) || '';
  $('bio').value = S.bio || '';
  var pj = proyectoDe();
  $('projName').value = pj.name || '';
  $('projClaim').value = pj.claim || '';
  $('projSector').value = pj.sector || '';
  $('projLogoText').value = pj.logoText || '';
  $('projProblem').value = pj.problem || '';
  $('projSolution').value = pj.solution || '';
  $('projAudience').value = pj.audience || '';
  $('projTone').value = pj.tone || 'cercano';
  $('projSlogan').value = pj.slogan || '';
  $('projMission').value = pj.mission || '';
  $('projVision').value = pj.vision || '';
  $('projInspiration').value = pj.inspiration || '';
  $('projExisting').value = pj.existing || '';
  $('projMascot').value = pj.mascot || 'auto';
  renderIdeasProyecto('name', pj.nameIdeas);
  $('uni').value = S.team.university || INSTITUTION_DEFAULT.name;
  $('city').value = S.team.city || '';
  $('cAc').value = S.pal.ac || '#0866F5';
  $('cInk').value = S.pal.ink || '#0D1B35';
  $('cMu').value = S.pal.mu || '#5C7193';
  $('cGl').value = S.pal.gl || '#DCE7F5';
  $('cBg').value = S.pal.bg || '#FFFFFF';
  $('cBg2').value = S.pal.bg2 || '#F0F6FF';
  $('fontTitle').innerHTML = allFontOptions();
  $('fontBody').innerHTML = allFontOptions();
  var ft = (S.fonts && S.fonts.t) || 'Plus Jakarta Sans';
  var fb = (S.fonts && S.fonts.b) || 'Barlow';
  $('fontTitle').value = ft;
  $('fontBody').value = fb;
}

function proyectoDe() {
  if (!S.team.proyecto || typeof S.team.proyecto !== 'object') S.team.proyecto = {};
  var p = S.team.proyecto;
  if (p.name === undefined) p.name = '';
  if (p.claim === undefined) p.claim = '';
  if (p.sector === undefined) p.sector = '';
  if (p.logoText === undefined) p.logoText = '';
  if (p.logoImg === undefined) p.logoImg = '';
  if (p.slogan === undefined) p.slogan = '';
  if (p.problem === undefined) p.problem = '';
  if (p.solution === undefined) p.solution = '';
  if (p.audience === undefined) p.audience = '';
  if (p.tone === undefined) p.tone = 'cercano';
  if (p.mission === undefined) p.mission = '';
  if (p.vision === undefined) p.vision = '';
  if (p.inspiration === undefined) p.inspiration = '';
  if (p.existing === undefined) p.existing = '';
  if (p.mascot === undefined) p.mascot = 'auto';
  if (!p.style || typeof p.style !== 'object') p.style = null;
  if (!p.pal || typeof p.pal !== 'object') p.pal = null;
  if (!p.fonts || typeof p.fonts !== 'object') p.fonts = null;
  if (!Array.isArray(p.nameIdeas)) p.nameIdeas = [];
  if (!Array.isArray(p.claimIdeas)) p.claimIdeas = [];
  return p;
}

/* ===== Marca del proyecto =====
   La marca de la solución no hereda la del equipo: se deriva de lo que ataca,
   a quién sirve y con qué tono. Los patrones de nombre salen de los ganadores
   SIRLI (naming dual 2025-2026, marcas inventadas, culturales y descriptivas).
   Los estilos visuales combinan la taxonomia de rebrand.gallery y los doce
   arquetipos de marca (Mark & Pearson). Nada se inventa: se recombina lo que
   el usuario escribe. */

var PROJ_STYLES = [
  { id:'eco', label:'Eco y cercana', archetype:'Cuidador', source:'Patagonia + USWDS · contraste AA verificado',
    desc:'Verde bosque, formas suaves y tipografía redonda. Habla de naturaleza sin caer en el cliché de hoja.',
    inspiration:'Empaques ecológicos y marcas de agricultura regenerativa: papel sin brillo, verde salvia y fotografía natural.',
    pal:{ ac:'#2F6F4E', ac2:'#7FA88F', ink:'#14281F', mu:'#5E7368', gl:'#D8E9DC', bg:'#FBFDF9', bg2:'#EEF6EF' },
    fonts:{ t:'Fredoka', b:'Nunito' } },
  { id:'juvenil', label:'Juvenil y lúdica', archetype:'Bufón', source:'Duolingo + Chupa Chups · contraste AA verificado',
    desc:'Coral, amarillo y tipografía de personalidad. Sirve para convocar jóvenes sin infantilizar el mensaje.',
    inspiration:'Identidades lúdicas contemporáneas: color saturado, tipografía expresiva y stickers, pero con grilla limpia.',
    pal:{ ac:'#C93418', ac2:'#FFB020', ink:'#1E1B2E', mu:'#6B6478', gl:'#FFE3B8', bg:'#FFFDF7', bg2:'#FFF1DE' },
    fonts:{ t:'Bricolage Grotesque', b:'Figtree' } },
  { id:'institucional', label:'Institucional y seria', archetype:'Gobernante', source:'IBM Carbon + Banco Mundial · contraste AA verificado',
    desc:'Azul profundo, serif de autoridad y aire editorial. Transmite rigor ante jurados y aliados públicos.',
    inspiration:'Informes institucionales y marcas cívicas: azul marino, serif de alto contraste y retícula estricta.',
    pal:{ ac:'#16437E', ac2:'#4A78B5', ink:'#0D1B35', mu:'#5C7193', gl:'#DCE7F5', bg:'#FFFFFF', bg2:'#F3F7FC' },
    fonts:{ t:'Libre Franklin', b:'Inter' } },
  { id:'tech', label:'Tecnológica y precisa', archetype:'Mago', source:'Stripe + Teenage Engineering · contraste AA verificado',
    desc:'Verde petróleo, grotesca geométrica y datos como textura. La tecnología se muestra, no se decora.',
    inspiration:'Fintech y hardware: geometría estricta, un color eléctrico y visualizaciones que explican el sistema.',
    pal:{ ac:'#00666F', ac2:'#22B8A6', ink:'#0B1F26', mu:'#4C6A72', gl:'#CFF3EE', bg:'#F7FEFC', bg2:'#E7FAF5' },
    fonts:{ t:'Space Grotesk', b:'IBM Plex Mono' } },
  { id:'comunitaria', label:'Comunitaria y humana', archetype:'Hombre común', source:'Oxfam + economía solidaria · contraste AA verificado',
    desc:'Terracota, crema y serif cálida. Pone rostro y territorio antes que producto.',
    inspiration:'Marcas de base comunitaria y economía solidaria: barro, papel kraft, serif humanista y fotografía documental.',
    pal:{ ac:'#A1402A', ac2:'#D98B63', ink:'#2B1A12', mu:'#7A5B4D', gl:'#F3D9C8', bg:'#FFF9F4', bg2:'#FBEDE1' },
    fonts:{ t:'Gabarito', b:'Onest' } },
  { id:'premium', label:'Premium y sobria', archetype:'Amante', source:'Aesop + Aman · contraste AA verificado',
    desc:'Negro cálido, dorado apagado y serif fina. Menos elementos, más intención.',
    inspiration:'Hotelería de autor y cosmética de lujo: mucho aire, serif fina, dorado mate y detalle artesanal.',
    pal:{ ac:'#7A5C1E', ac2:'#C9A227', ink:'#161412', mu:'#6E6355', gl:'#EDE3CC', bg:'#FFFDF8', bg2:'#F6F0E2' },
    fonts:{ t:'Jost', b:'Manrope' } },
  { id:'cultural', label:'Cultural y precolombina', archetype:'Creador', source:'Xcaret + marcas de origen · contraste AA verificado',
    desc:'Rojo, arena y tipografía con memoria. Nombra desde el territorio sin folclorizar.',
    inspiration:'Identidades culturales latinoamericanas: paleta de tierras, patrones geométricos y tipografía de cartel.',
    pal:{ ac:'#9E2B25', ac2:'#D4A373', ink:'#241612', mu:'#7B5147', gl:'#F2D7C9', bg:'#FFF8EC', bg2:'#F7E4C8' },
    fonts:{ t:'Archivo Black', b:'Karla' } },
  { id:'artesanal', label:'Artesanal y orgánica', archetype:'Creador', source:'Etsy + Patagonia Provisions · contraste AA verificado',
    desc:'Oliva, lino y serif de taller. Apta para agro, textiles y oficios.',
    inspiration:'Marcas de taller y origen: textura de lino, oliva apagado, serif con imperfección y sello de autor.',
    pal:{ ac:'#5E6E35', ac2:'#A3B18A', ink:'#22281A', mu:'#6C7355', gl:'#E4E7CF', bg:'#FCFBF4', bg2:'#F3F2E2' },
    fonts:{ t:'Wix Madefor Display', b:'Mulish' } },
  { id:'deportiva', label:'Energética y deportiva', archetype:'Héroe', source:'Nike + Strava · contraste AA verificado',
    desc:'Naranja de alta visibilidad, condensada y contraste duro. Para retos de acción y resistencia.',
    inspiration:'Equipamiento deportivo y automoción: condensada en mayúsculas, naranja de seguridad y negro técnico.',
    pal:{ ac:'#C2410C', ac2:'#D7FF00', ink:'#111111', mu:'#5F5B57', gl:'#FFD8B5', bg:'#FFFFFF', bg2:'#FFF0E2' },
    fonts:{ t:'Anton', b:'Barlow' } },
  { id:'minimal', label:'Minimalista corporativa', archetype:'Sabio', source:'Apple + Muji · contraste AA verificado',
    desc:'Gris, azul tinta y grotesca neutra. Claridad para explicar sistemas complejos.',
    inspiration:'Consultoría y software B2B: monocromo, mucho blanco, grotesca neutra y jerarquía por peso.',
    pal:{ ac:'#1F2937', ac2:'#94A3B8', ink:'#111827', mu:'#6B7280', gl:'#E5E7EB', bg:'#FFFFFF', bg2:'#F7F8FA' },
    fonts:{ t:'Schibsted Grotesk', b:'Inter' } },
  { id:'cientifica', label:'Científica y rigurosa', archetype:'Sabio', source:'Nature + Thermo Fisher · contraste AA verificado',
    desc:'Azul petróleo, monoespaciada y retícula de laboratorio. Los datos mandan.',
    inspiration:'Publicaciones científicas y healthtech: azul frío, monoespaciada para datos y diagramas legibles.',
    pal:{ ac:'#0B5F7A', ac2:'#6FB3C8', ink:'#0A1A21', mu:'#4C6670', gl:'#D6EDF3', bg:'#F9FCFD', bg2:'#EAF5F8' },
    fonts:{ t:'Syne', b:'Space Mono' } },
  { id:'experimental', label:'Experimental y audaz', archetype:'Forajido', source:'MSCHF + Spotify Wrapped · contraste AA verificado',
    desc:'Azul eléctrico, amarillo y tipografía variable. Para ideas que necesitan romper la sala.',
    inspiration:'Diseño generativo y cultura club: tipografía variable, contraste eléctrico y composición que se mueve.',
    pal:{ ac:'#1D4ED8', ac2:'#F5C518', ink:'#0B1020', mu:'#4B5563', gl:'#FDE68A', bg:'#FFFEF5', bg2:'#EEF2FF' },
    fonts:{ t:'Unbounded', b:'Space Grotesk' } }
];

// Por qué de cada pareja tipográfica: el jurado pregunta "por qué esa fuente",
// no solo "cuál". Cada razón ata la forma de la letra al tono del proyecto.
var PROJ_FONT_WHY = {
  eco: 'Fredoka tiene terminales redondeadas y geometría amable: se siente cercana sin volverse infantil. Nunito sostiene párrafos largos con la misma calidez.',
  juvenil: 'Bricolage Grotesque tiene ejes irregulares y detalles visibles: personalidad sin perder legibilidad. Figtree queda neutra para que el color mande.',
  institucional: 'Libre Franklin tiene una estructura cívica y remates rectos: autoridad sin serifa de libro. Inter mantiene la interfaz sobria.',
  tech: 'Space Grotesk tiene cortes y remates de ingeniería: se lee técnica, no decorativa. IBM Plex Mono separa datos y etiquetas del discurso.',
  comunitaria: 'Gabarito tiene curvas amplias y terminales redondeadas: cercana y territorial sin caer en infantil. Onest sostiene párrafos largos con calidez.',
  premium: 'Jost usa geometría fina y proporciones altas: lujo sobrio sin serifa clásica. Manrope baja el volumen y deja respirar.',
  cultural: 'Archivo Black tiene masa de cartel y esquinas firmes: memoria visual latinoamericana sin folclor. Karla equilibra con una sans moderna.',
  artesanal: 'Wix Madefor Display aporta una humanidad controlada de taller. Mulish suaviza el texto y evita que la marca se vuelva rústica de más.',
  deportiva: 'Anton es condensada pesada: impacto y velocidad en mayúsculas. Barlow es una grotesca deportiva que aguanta tablas y datos sin ruido.',
  minimal: 'Schibsted Grotesk tiene detalles nórdicos y ritmo limpio: claridad con carácter. Inter asegura legibilidad en pantalla y documentos.',
  cientifica: 'Syne tiene formas experimentales de laboratorio. Space Mono hace que cada cifra se lea como dato verificable, no como adorno.',
  experimental: 'Unbounded es una display variable de contraste amplio: rompe la sala. Space Grotesk ordena el texto para que el experimento siga siendo legible.'
};

var PROJ_STYLE_REFS = {
  eco: 'Patagonia, Notpla', juvenil: 'Duolingo, Chupa Chups', institucional: 'IBM, Banco Mundial',
  tech: 'Stripe, Teenage Engineering', comunitaria: 'Oxfam, Fondo de Mujeres', premium: 'Aesop, Aman',
  cultural: 'Xcaret, Marcas de origen', artesanal: 'Etsy, Patagonia Provisions', deportiva: 'Nike, Strava',
  minimal: 'Apple, Muji', cientifica: 'Nature, Thermo Fisher', experimental: 'MSCHF, Spotify Wrapped'
};

var SECTOR_LEX = {
  agua: { label:'agua', keys:['agua','hidric','pozo','riego','sequia','lluvia','potable','saneamiento','cauce'],
    roots:['cauce','aqua','fuente','pozo','lluvia','rio','marea','manantial'], objects:['Cauce','Fuente','Pozo','Lluvia','Marea','Manantial'],
    benefit:'agua segura', barrier:'cargar agua a pie', actor:'las familias', mechanism:'captación y filtración comunitaria', territory:'la cuenca',
    pun:'Sin Balde', tech:'Hidro' },
  agro: { label:'agro', keys:['agro','cultivo','cosecha','suelo','semilla','campo','agric','fertil','plaga','cafe','cacao'],
    roots:['surco','semilla','tallo','grano','huerto','tierra','cosecha','raiz'], objects:['Surco','Semilla','Tallo','Grano','Huerto','Cosecha'],
    benefit:'cosecha que rinde', barrier:'perder la cosecha', actor:'los productores', mechanism:'manejo de suelo y semilla', territory:'la finca',
    pun:'Cosecha Tardía', tech:'Agro' },
  residuos: { label:'residuos', keys:['residuo','basura','desecho','recicl','poda','biomasa','compost','plastico','reutiliz'],
    roots:['ciclo','reuso','segunda','compost','fibra','materia','sobra','vuelta'], objects:['Ciclo','Segunda Vida','Compost','Fibra','Materia'],
    benefit:'cero desperdicio', barrier:'quemar o enterrar residuos', actor:'las comunidades', mechanism:'separación y revalorización', territory:'el barrio',
    pun:'Desucho', tech:'Re' },
  energia: { label:'energía', keys:['energia','solar','electric','motor','bateria','volt','ilumin','combustible','panel'],
    roots:['solar','voltio','chispa','faro','luz','corriente','nodo','celda'], objects:['Chispa','Faro','Luz','Nodo','Celda','Corriente'],
    benefit:'energía que no se corta', barrier:'quedarse sin corriente', actor:'las familias', mechanism:'generación y almacenamiento local', territory:'la red',
    pun:'Modo Ahorro', tech:'Volt' },
  salud: { label:'salud', keys:['salud','medic','enferm','paciente','clinica','nutric','discapac','mental','embaraz'],
    roots:['vita','cuidado','pulso','aliento','remedio','calma','salud','abrigo'], objects:['Pulso','Aliento','Calma','Abrigo','Remedio'],
    benefit:'cuidado a tiempo', barrier:'esperar semanas', actor:'las personas', mechanism:'seguimiento cercano', territory:'la comunidad',
    pun:'Sin Fila', tech:'Vita' },
  educacion: { label:'educación', keys:['educa','escuela','estudiante','aprend','docente','aula','alfabet','niño','niñez'],
    roots:['lumen','saber','aula','voz','pagina','brújula','paso','semilla'], objects:['Lumen','Brújula','Página','Voz','Paso','Aula'],
    benefit:'aprendizaje que llega', barrier:'quedarse fuera del aula', actor:'los estudiantes', mechanism:'contenido y acompañamiento', territory:'la escuela',
    pun:'Fuera de Clase', tech:'Edu' },
  tech: { label:'tecnología', keys:['sensor','software','app','datos','algoritmo','iot','digital','automat','monitoreo','plataforma'],
    roots:['nexo','nodo','byte','senal','orbe','pulso','red','chip'], objects:['Nexo','Nodo','Señal','Orbe','Pulso','Red'],
    benefit:'datos que deciden', barrier:'decidir a ciegas', actor:'los operadores', mechanism:'sensores y monitoreo', territory:'la red',
    pun:'Error 404', tech:'Tech' },
  social: { label:'lo social', keys:['comunidad','mujer','joven','genero','inclusion','vulnerab','rural','indigena','migrante','violencia'],
    roots:['voz','puente','raiz','tejido','encuentro','orilla','semilla','comun'], objects:['Voz','Puente','Tejido','Encuentro','Orilla'],
    benefit:'oportunidades reales', barrier:'quedar fuera', actor:'las personas', mechanism:'redes de apoyo', territory:'el territorio',
    pun:'Nadie Afuera', tech:'Comun' },
  cultura: { label:'cultura', keys:['cultura','patrimonio','arte','musica','tradicion','identidad','lengua','memoria'],
    roots:['memoria','canto','arcilla','tejido','relato','fuego','tambor','raiz'], objects:['Memoria','Canto','Arcilla','Tejido','Relato','Tambor'],
    benefit:'memoria viva', barrier:'perder la tradición', actor:'las comunidades', mechanism:'registro y transmisión', territory:'el pueblo',
    pun:'Fuera de Museo', tech:'Cultura' },
  vivienda: { label:'vivienda', keys:['vivienda','casa','techo','habit','construc','barro','inundacion','asentamiento'],
    roots:['techo','hogar','barro','refugio','base','muro','patio','luz'], objects:['Techo','Hogar','Barro','Refugio','Patio'],
    benefit:'un hogar seguro', barrier:'vivir con riesgo', actor:'las familias', mechanism:'materiales y diseño local', territory:'el barrio',
    pun:'Bajo Techo', tech:'Casa' },
  transporte: { label:'movilidad', keys:['transporte','movilidad','trafico','bus','vehiculo','via','camino','ruta'],
    roots:['ruta','paso','via','rumbo','puente','nodo','viaje','cruce'], objects:['Ruta','Paso','Puente','Cruce','Rumbo','Viaje'],
    benefit:'moverse sin fricción', barrier:'perder horas en el traslado', actor:'los pasajeros', mechanism:'rutas y señalización', territory:'la ciudad',
    pun:'Sin Tranque', tech:'Movi' },
  economia: { label:'emprendimiento', keys:['emprend','negocio','mercado','venta','empleo','ingreso','financ','pyme','cooperativa'],
    roots:['grano','trato','valor','surco','red','oficio','capital','trueque'], objects:['Trato','Valor','Oficio','Red','Grano','Trueque'],
    benefit:'ingresos que se quedan', barrier:'vender por debajo del costo', actor:'los emprendedores', mechanism:'acceso a mercado y precio justo', territory:'la comunidad',
    pun:'Precio Justo', tech:'Econo' },
  alimento: { label:'alimento', keys:['alimento','comida','hambre','nutri','pesca','leche','pan','dieta','desperdicio'],
    roots:['miel','grano','huerto','mesa','sabor','cocina','red','levadura'], objects:['Miel','Grano','Mesa','Sabor','Cocina','Levadura'],
    benefit:'comida suficiente y sana', barrier:'comprar lo básico', actor:'las familias', mechanism:'producción y distribución local', territory:'la mesa',
    pun:'Sin Hambre', tech:'Nutri' },
  ambiente: { label:'ambiente', keys:['ambiente','clima','contamin','biodivers','poliniz','bosque','carbono','ecosistema'],
    roots:['verde','bosque','colmena','sombra','semilla','agua','aire','pulmon'], objects:['Bosque','Colmena','Sombra','Semilla','Aire','Pulmón'],
    benefit:'un entorno que respira', barrier:'perder biodiversidad', actor:'las comunidades', mechanism:'restauración y cuidado', territory:'el ecosistema',
    pun:'Sin Humo', tech:'Eco' },
  generico: { label:'el problema', keys:[],
    roots:['nexo','vita','raiz','puente','pulso','lumen','ciclo','semilla'], objects:['Nexo','Puente','Pulso','Lumen','Ciclo','Semilla'],
    benefit:'una solución que funciona', barrier:'seguir igual', actor:'las personas', mechanism:'trabajo en red', territory:'el territorio',
    pun:'Punto de Giro', tech:'Innova' }
};

var _STOP = (' de la el los las un una unos unas y o u en con sin para por que como mas menos al del se su sus es son ser esta este esto ' +
  'the and for with from into your you our their this that are was were will can not but its it’s ' +
  'proyecto solucion solución problema reto busca busca mediante travEs través cada cuando donde sobre entre ' +
  'agua luz vida nueva nuevo nuevas nuevos hace hacer tiene tener puede pueden debe deben zona zonas ' +
  'manera forma parte desde hasta porque aunque solo sólo alto alta bajo baja ' +
  'comunidad personas gente familias usuarios clientes ' +
  '').split(/\s+/).filter(Boolean);

function _normTxt(s) {
  return String(s || '').toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9ñ\s]/g, ' ');
}
function _palabras(s) {
  var seen = {}, out = [];
  _normTxt(s).split(/\s+/).forEach(function (w) {
    if (w.length < 4 || _STOP.indexOf(w) >= 0 || seen[w]) return;
    seen[w] = 1; out.push(w);
  });
  return out;
}
function _detectarSector(txt) {
  var t = _normTxt(txt);
  var mejor = null, hits = 0;
  for (var k in SECTOR_LEX) {
    if (!Object.prototype.hasOwnProperty.call(SECTOR_LEX, k) || k === 'generico') continue;
    var n = 0, keys = SECTOR_LEX[k].keys;
    for (var i = 0; i < keys.length; i++) if (t.indexOf(keys[i]) >= 0) n++;
    if (n > hits) { hits = n; mejor = k; }
  }
  return mejor || 'generico';
}
function _lexDe(p) {
  var txt = [p.problem, p.solution, p.sector, p.audience, p.claim].join(' ');
  if (p.sector) txt += ' ' + p.sector;
  return SECTOR_LEX[_detectarSector(txt)] || SECTOR_LEX.generico;
}
function _rng(seed) {
  var s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return function () { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
}
function _pick(a, r) { return a[Math.floor(r() * a.length)]; }
function _cap(s) { s = String(s || ''); return s ? s.charAt(0).toUpperCase() + s.slice(1) : s; }
function _stem(s) { return String(s || '').replace(/[aeiouáéíóú]$/i, ''); }
function _recorte(s, n) {
  var w = String(s || '').replace(/\s+/g, ' ').trim().split(' ');
  if (!w[0]) return '';
  return w.slice(0, n).join(' ');
}
function _fraseCorta(s, n) {
  var cortes = ['y', 'o', 'con', 'sin', 'para', 'por', 'de', 'del', 'la', 'el', 'los', 'las', 'un', 'una', 'que', 'en', 'al'];
  var w = String(s || '').replace(/\s+/g, ' ').trim().split(' ');
  while (w.length && cortes.indexOf(_normTxt(w[0])) >= 0) w.shift();
  w = w.slice(0, n);
  while (w.length && cortes.indexOf(_normTxt(w[w.length - 1])) >= 0) w.pop();
  return w.join(' ').replace(/[.,;:]+$/, '');
}
function _minusIni(s) {
  s = String(s || '');
  if (!s) return s;
  if (/^[A-ZÁÉÍÓÚÑ]{2,}/.test(s)) return s;
  return s.charAt(0).toLowerCase() + s.slice(1);
}
function _iniNombre(name) {
  var w = String(name || '').replace(/[^A-Za-zÁÉÍÓÚÑáéíóúñ0-9 ]/g, ' ').trim().split(/\s+/).filter(Boolean);
  if (!w.length) return '';
  if (w.length === 1) return w[0].slice(0, 3).toUpperCase();
  return w.slice(0, 3).map(function (x) { return x.charAt(0); }).join('').toUpperCase();
}
function _esc(s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
    return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c];
  });
}

var _seedN = 1;
function sugerirNombres() {
  var p = proyectoDe();
  var lex = _lexDe(p);
  var r = _rng(Date.now() + (++_seedN) * 7919);
  var out = [], used = {};
  function add(name, pattern, why) {
    name = String(name || '').replace(/\s+/g, ' ').trim();
    if (!name || used[name.toLowerCase()]) return;
    used[name.toLowerCase()] = 1;
    out.push({ name: name, pattern: pattern, why: why });
  }
  // 1 · marca inventada (NEXORA, KINETIX, INIVEZ)
  add(_cap(_stem(_pick(lex.roots, r))) + _pick(['ora', 'era', 'aria', 'alia', 'iva', 'ix'], r), 'inventado',
    'Raíz de ' + lex.label + ' + sufijo sonoro: el patrón de NEXORA o KINETIX.');
  // 2 · objeto cotidiano como marca (AVOCADO, LUMBRE, HOOKE)
  add(_pick(lex.objects, r), 'objeto', 'Un objeto concreto como marca: así funcionan AVOCADO o LUMBRE.');
  // 3 · compuesto en red / 360
  add(_cap(_pick(lex.roots, r)) + ' ' + _pick(['en Red', '360', 'Sin Límites', 'Común'], r), 'compuesto',
    'Dos piezas que se explican solas, como NEXO-SOSTENIBLE o ALTIPLANO 360.');
  // 4 · territorio real o genérico + número
  var terr = (S.team.city || '').trim() || _pick(['Territorio', 'Comunidad', 'Ruta', 'Origen', 'Altiplano'], r);
  add(_cap(terr) + ' ' + _pick(['360', '+', '2.0', 'Vivo'], r), 'territorio',
    (S.team.city ? 'Ancla en la ciudad real del equipo' : 'Ancla en territorio') + ', como ALTIPLANO 360.');
  // 5 · técnico bilingüe
  add(_cap(_pick(lex.roots, r)) + _pick(['Lab', 'Tech', 'IA', 'Link', 'Móvil'], r), 'técnico',
    'Raíz local + sufijo técnico: el patrón de BIOINNOVATECH o TECNO-ING.');
  // 6 · descriptivo con beneficio
  add(_cap(lex.benefit), 'descriptivo',
    'Marca que declara el beneficio de frente, sin adjetivo de relleno.');
  // 7 · humor o juego de palabras (solo si el tono lo permite)
  if (p.tone !== 'serio' && p.tone !== 'institucional') {
    add(lex.pun, 'juego', 'Un guiño memorable, como DESUCHO o ERROR 404.');
  }
  p.nameIdeas = out;
  return out;
}

function sugerirClaim() {
  var p = proyectoDe();
  var lex = _lexDe(p);
  var aud = (p.audience || '').trim() || lex.actor;
  var ben = lex.benefit;
  var sol = _fraseCorta(p.solution, 7);
  var opts = [
    _cap(ben) + ' para ' + aud + '.',
    'Menos ' + lex.barrier + '. Más ' + ben + '.',
    _cap(ben) + ', sin ' + lex.barrier + '.',
    sol ? _cap(_minusIni(sol)) + '.' : _cap(ben) + ' que se queda en ' + lex.territory + '.',
    'Para ' + aud + ', sin letra chica.'
  ];
  var seen = {}, out = [];
  opts.forEach(function (s) {
    if (!s || seen[s]) return;
    seen[s] = 1; out.push(s);
  });
  p.claimIdeas = out;
  return out;
}

function sugerirProposito() {
  var p = proyectoDe();
  var lex = _lexDe(p);
  var aud = (p.audience || '').trim() || lex.actor;
  var ben = lex.benefit;
  var sol = _fraseCorta(p.solution, 14) || lex.mechanism;
  var lugar = (S.team.city || '').trim() || 'cada territorio';
  p.mission = 'Acercar ' + ben + ' a ' + aud + ' con ' + _minusIni(sol) + ', sin ' + lex.barrier + '.';
  p.vision = 'Que tener ' + ben + ' sea la norma para ' + aud + ' en ' + lugar + ', no la excepción.';
  var st = p.style && p.style.id ? PROJ_STYLES.filter(function (x) { return x.id === p.style.id; })[0] : null;
  p.inspiration = st
    ? st.inspiration + ' Traducción: ' + st.desc
    : 'Una identidad propia del proyecto, distinta a la del equipo: parte de lo que ataca y de a quién sirve.';
  return { mission: p.mission, vision: p.vision, inspiration: p.inspiration };
}

/* --- Elementos gráficos y prompts para IA de imágenes ---
   Todo se deriva de lo que el usuario escribió y del estilo elegido.
   Si no hay estilo, no se inventa: se pide elegir uno. */
var PROJ_TEXTURES = {
  eco: { name:'Ondas de agua', note:'Curvas suaves, sin hoja ni gota literal.',
    css:'repeating-radial-gradient(circle at 12% 100%,transparent 0 13px,AC 13px 14px),repeating-radial-gradient(circle at 88% 0,transparent 0 19px,AC 19px 20px)' },
  juvenil: { name:'Confeti y puntos', note:'Puntos irregulares y una forma sólida de acento.',
    css:'radial-gradient(circle at 20% 25%,AC 0 3px,transparent 4px),radial-gradient(circle at 70% 65%,AC 0 2px,transparent 3px),radial-gradient(circle at 45% 85%,AC 0 2px,transparent 3px)' },
  institucional: { name:'Retícula editorial', note:'Líneas finas y mucho aire; nada decorativo.',
    css:'repeating-linear-gradient(90deg,AC 0 1px,transparent 1px 34px),repeating-linear-gradient(0deg,AC 0 1px,transparent 1px 34px)' },
  tech: { name:'Circuito modular', note:'Nodos y trazos rectos que explican un sistema.',
    css:'linear-gradient(90deg,AC 0 1px,transparent 1px 22px),linear-gradient(0deg,AC 0 1px,transparent 1px 22px),radial-gradient(circle at 22px 22px,AC 0 2px,transparent 3px)' },
  comunitaria: { name:'Tejido y arcos', note:'Trazos hechos a mano, textura de red comunal.',
    css:'repeating-radial-gradient(circle at 0 50%,transparent 0 9px,AC 9px 10px),repeating-radial-gradient(circle at 100% 50%,transparent 0 9px,AC 9px 10px)' },
  premium: { name:'Líneas de autor', note:'Hairlines doradas y espacio negativo.',
    css:'repeating-linear-gradient(135deg,AC 0 1px,transparent 1px 18px)' },
  cultural: { name:'Greca geométrica', note:'Patrón escalonado de memoria textil.',
    css:'conic-gradient(from 90deg at 8px 8px,AC 90deg,transparent 0),conic-gradient(from 270deg at 8px 8px,AC 90deg,transparent 0)' },
  artesanal: { name:'Trama de lino', note:'Cruce fino que simula papel y tejido.',
    css:'repeating-linear-gradient(0deg,AC 0 1px,transparent 1px 6px),repeating-linear-gradient(90deg,AC 0 1px,transparent 1px 6px)' },
  deportiva: { name:'Líneas de velocidad', note:'Diagonales duras y alto contraste.',
    css:'repeating-linear-gradient(115deg,AC 0 3px,transparent 3px 16px)' },
  minimal: { name:'Puntos neutros', note:'Una retícula de puntos casi invisible.',
    css:'radial-gradient(circle,AC 0 1px,transparent 1.5px) 0 0/14px 14px' },
  cientifica: { name:'Curvas de nivel', note:'Anillos concéntricos como mapa de datos.',
    css:'repeating-radial-gradient(circle at 30% 40%,transparent 0 8px,AC 8px 9px)' },
  experimental: { name:'Bloques generativos', note:'Franjas inclinadas con contraste eléctrico.',
    css:'repeating-linear-gradient(60deg,AC 0 8px,transparent 8px 22px),repeating-linear-gradient(-60deg,AC 0 2px,transparent 2px 30px)' }
};
function _rgba(hex, a) {
  var h = String(hex || '').replace('#', '');
  if (h.length === 3) h = h.split('').map(function (c) { return c + c; }).join('');
  if (h.length !== 6) return 'rgba(0,0,0,' + a + ')';
  var n = parseInt(h, 16);
  return 'rgba(' + ((n >> 16) & 255) + ',' + ((n >> 8) & 255) + ',' + (n & 255) + ',' + a + ')';
}
function _textoSobre(c) {
  var w = contrastRatio('#FFFFFF', c), d = contrastRatio('#0D1B35', c);
  if (w == null && d == null) return '#FFFFFF';
  return (w || 0) >= (d || 0) ? '#FFFFFF' : '#0D1B35';
}
function _formaTextura(id, color) {
  var c = color || '#16437E';
  var shapes = {
    eco: '<path d="M0 34 Q30 8 60 34 T120 34" fill="none" stroke="' + c + '" stroke-width="2.4"/><path d="M0 72 Q30 46 60 72 T120 72" fill="none" stroke="' + c + '" stroke-width="1.2" opacity=".55"/><circle cx="92" cy="98" r="4" fill="' + c + '"/>',
    juvenil: '<circle cx="18" cy="20" r="7" fill="' + c + '"/><path d="M52 12 l9 16 -18 0z" fill="' + c + '" opacity=".8"/><rect x="82" y="46" width="16" height="16" rx="4" fill="' + c + '" transform="rotate(18 90 54)"/><circle cx="34" cy="82" r="3" fill="' + c + '"/><path d="M70 92 q12 -14 24 0" fill="none" stroke="' + c + '" stroke-width="4"/>',
    institucional: '<path d="M0 40 H120 M0 80 H120 M40 0 V120 M80 0 V120" stroke="' + c + '" stroke-width=".8" opacity=".55"/><rect x="40" y="40" width="40" height="40" fill="none" stroke="' + c + '" stroke-width="2"/>',
    tech: '<path d="M10 22 H48 V58 H96 M48 22 V6 M48 58 H14 V96 H104" fill="none" stroke="' + c + '" stroke-width="2"/><circle cx="48" cy="22" r="4" fill="' + c + '"/><circle cx="96" cy="58" r="4" fill="' + c + '"/><circle cx="14" cy="96" r="4" fill="' + c + '"/>',
    comunitaria: '<path d="M-10 100 Q30 40 70 100 T150 100" fill="none" stroke="' + c + '" stroke-width="2"/><path d="M-10 70 Q30 10 70 70 T150 70" fill="none" stroke="' + c + '" stroke-width="2" opacity=".6"/><path d="M0 20 Q60 40 120 20" fill="none" stroke="' + c + '" stroke-width="1" stroke-dasharray="3 6"/>',
    premium: '<path d="M-20 40 L60 -40 M20 120 L120 20" stroke="' + c + '" stroke-width="1" opacity=".7"/><circle cx="86" cy="34" r="16" fill="none" stroke="' + c + '" stroke-width="1.2"/><circle cx="86" cy="34" r="3" fill="' + c + '"/>',
    cultural: '<path d="M0 100 H20 V80 H40 V60 H60 V40 H80 V20 H100 V0" fill="none" stroke="' + c + '" stroke-width="6"/><path d="M0 60 H10 V40 H30 V20 H50" fill="none" stroke="' + c + '" stroke-width="2" opacity=".55"/>',
    artesanal: '<path d="M0 24 H120 M0 48 H120 M0 72 H120 M0 96 H120" stroke="' + c + '" stroke-width="1" opacity=".45"/><path d="M24 0 V120 M48 0 V120 M72 0 V120 M96 0 V120" stroke="' + c + '" stroke-width="1" opacity=".28"/><path d="M8 12 l10 10 M36 44 l10 10 M70 76 l10 10" stroke="' + c + '" stroke-width="2"/>',
    deportiva: '<path d="M-20 100 L40 20 H70 L10 100z" fill="' + c + '"/><path d="M30 100 L90 20 H106 L46 100z" fill="' + c + '" opacity=".35"/><path d="M84 24 H120" stroke="' + c + '" stroke-width="6"/>',
    minimal: '<circle cx="16" cy="16" r="1.6" fill="' + c + '"/><circle cx="56" cy="16" r="1.6" fill="' + c + '"/><circle cx="96" cy="16" r="1.6" fill="' + c + '"/><circle cx="16" cy="56" r="1.6" fill="' + c + '"/><circle cx="56" cy="56" r="1.6" fill="' + c + '"/><circle cx="96" cy="56" r="1.6" fill="' + c + '"/><circle cx="16" cy="96" r="1.6" fill="' + c + '"/><circle cx="56" cy="96" r="1.6" fill="' + c + '"/><circle cx="96" cy="96" r="1.6" fill="' + c + '"/><path d="M0 112 H120" stroke="' + c + '" stroke-width="3"/>',
    cientifica: '<ellipse cx="60" cy="60" rx="52" ry="26" fill="none" stroke="' + c + '" stroke-width="1.2"/><ellipse cx="60" cy="60" rx="38" ry="18" fill="none" stroke="' + c + '" stroke-width="1.2" opacity=".7"/><ellipse cx="60" cy="60" rx="22" ry="10" fill="none" stroke="' + c + '" stroke-width="1.2" opacity=".5"/><circle cx="60" cy="60" r="3" fill="' + c + '"/>',
    experimental: '<rect x="-10" y="8" width="70" height="20" fill="' + c + '" transform="rotate(-18 25 18)"/><rect x="46" y="44" width="86" height="12" fill="' + c + '" opacity=".55" transform="rotate(-18 89 50)"/><rect x="-6" y="82" width="48" height="26" fill="' + c + '" opacity=".8" transform="rotate(-18 18 95)"/>'
  };
  return shapes[id] || '';
}
function _svgTextura(id, color) {
  var inner = _formaTextura(id, color);
  if (!inner) return '';
  return '<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120">' + inner + '</svg>';
}
function _cssTextura(id, color) {
  var t = PROJ_TEXTURES[id];
  if (!t) return '';
  var inner = _formaTextura(id, color);
  if (!inner) return t.css.replace(/AC/g, _rgba(color, .62));
  var svg = encodeURIComponent(_svgTextura(id, color)).replace(/\(/g, '%28').replace(/\)/g, '%29');
  return 'url(data:image/svg+xml,' + svg + ')';
}
function estiloDe(p) {
  if (!p || !p.style || !p.style.id) return null;
  return PROJ_STYLES.filter(function (x) { return x.id === p.style.id; })[0] || null;
}
function promptLogoProyecto() {
  var p = proyectoDe(), st = estiloDe(p);
  var nm = (p.name || '').trim() || '(escribe el nombre del proyecto)';
  var sec = (p.sector || '').trim() || '(sector)';
  var pal = p.pal || (st && st.pal) || {};
  var ac = (pal.ac || '#16437E').toUpperCase(), ink = (pal.ink || '#0D1B35').toUpperCase(), bg = (pal.bg || '#FFFFFF').toUpperCase();
  var arq = st ? st.archetype : '(elige un estilo de marca)';
  return 'Diseña un logotipo vectorial de nivel profesional para "' + nm + '", proyecto de ' + sec + '.\n' +
    'Concepto: símbolo único y memorable que represente la solución, no el problema. Arquetipo de marca: ' + arq + '.\n' +
    'Estilo: plano (flat vector), geométrico y limpio, sin degradados, sin sombras, sin 3D, sin mockup, sin texto adicional ni letras generadas por IA. Si incluye el nombre, usa tipografía sans geométrica bien espaciada y deletrea exactamente "' + nm + '".\n' +
    'Color: marca ' + ac + ', tinta ' + ink + ', fondo ' + bg + '. Máximo 3 colores planos.\n' +
    'Composición: marca centrada, margen de seguridad amplio, fondo liso, alto contraste. Debe leerse a 48 px y funcionar en blanco y negro.\n' +
    'Entrega: SVG o PNG con fondo transparente, 2048x2048, sin marca de agua. No incluyas pancartas, teléfonos ni escenas.';
}
function sugerirMascota(p) {
  if (p && p.mascot === 'no') return 'Sin mascota: usa un símbolo abstracto o monograma. Una mascota competiría con el logo y restaría seriedad.';
  var id = p && p.style && p.style.id;
  var map = {
    eco:'Un animal guía del territorio (ave, nutria o abeja) dibujado en una sola línea gruesa y plano de color. Cuerpo simple, cara expresiva, sin detalles realistas.',
    juvenil:'Una mascota geométrica con cabeza grande, extremidades simples y una expresión clara. Debe funcionar como sticker y como ícono de app.',
    institucional:'Sin mascota. Usa un símbolo abstracto de servicio público y una retícula estricta; una mascota restaría autoridad.',
    tech:'Un asistente modular: cabeza-pantalla o forma de nodo con dos ojos simples. Estilo isométrico plano, sin degradados.',
    comunitaria:'Una figura humana abstracta de cuerpo entero, sin rasgos étnicos inventados, acompañada de un objeto de la solución. Trazo grueso y cálido.',
    premium:'Sin mascota. Un monograma o sello tipográfico es más coherente con el tono sobrio.',
    cultural:'Un personaje inspirado en formas textiles locales, geométrico y respetuoso, sin caricaturizar personas reales. Paleta de tierras.',
    artesanal:'Una mascota de oficio: manos, herramientas o un animal de granja estilizado. Textura de sello y trazo imperfecto controlado.',
    deportiva:'Una mascota en pose de acción, silueta angulosa y contrastada, pensada para movimiento y sticker.',
    minimal:'Sin mascota. Un símbolo geométrico mínimo y un wordmark fuerte comunican mejor.',
    cientifica:'Una mascota microscópica o célula con ojos simples, dibujada como diagrama. Líneas finas y precisas.',
    experimental:'Una mascota deformada a propósito, con tipografía variable y colores eléctricos. Debe verse rara pero legible.'
  };
  var r = (id && map[id]) || 'Una mascota solo si el público es infantil o juvenil: forma simple, un solo color de marca y expresión clara.';
  if (p && p.mascot === 'si' && /^Sin mascota/.test(r)) {
    return 'Una mascota opcional de forma muy simple, un solo color de marca y expresión neutra, para usarla solo en redes y merch; en el video y el dossier manda el símbolo abstracto.';
  }
  return r;
}function promptMascotaProyecto() {
  var p = proyectoDe(), st = estiloDe(p);
  var nm = (p.name || '').trim() || '(nombre del proyecto)';
  var pal = (p.pal || (st && st.pal) || {});
  var ac = (pal.ac || '#16437E').toUpperCase(), gl = (pal.gl || '#DCE7F5').toUpperCase();
  return 'Diseña una mascota vectorial para "' + nm + '".\n' +
    'Dirección: ' + sugerirMascota(p) + '\n' +
    'Estilo: flat vector, contorno grueso y consistente, formas cerradas, sin degradados ni texturas fotorrealistas, sin texto.\n' +
    'Color: ' + ac + ' como color principal y ' + gl + ' como apoyo; máximo 3 colores planos.\n' +
    'Vistas: frente, perfil y una pose de acción. Fondo transparente, 2048x2048, cuerpo completo, centrada y con margen.\n' +
    'Debe leerse a 64 px y funcionar en una esquina del video sin tapar el mensaje.';
}
function promptProductoProyecto() {
  var p = proyectoDe(), st = estiloDe(p);
  var nm = (p.name || '').trim() || '(nombre del proyecto)';
  var sol = (p.solution || '').trim() || '(cómo resuelve el problema)';
  var pal = (p.pal || (st && st.pal) || {});
  var ac = (pal.ac || '#16437E').toUpperCase(), bg = (pal.bg || '#FFFFFF').toUpperCase();
  return 'Genera una imagen de producto/render conceptual de "' + nm + '".\n' +
    'Qué se ve: ' + sol + '.\n' +
    'Composición: producto protagonista, tres cuartos, fondo limpio ' + bg + ', luz suave de estudio, sombra corta y realista, sin personas inventadas ni texto.\n' +
    'Estilo: fotografía de producto editorial, materiales creíbles, acabado mate, detalle de marca en ' + ac + '.\n' +
    'Formato: 16:9, 4K, espacio negativo a la izquierda para poner titulares en el video.';
}

function estiloRecomendado(p) {
  var sec = _detectarSector([p.problem, p.solution, p.sector, p.audience].join(' '));
  var tone = p.tone || 'cercano';
  if (tone === 'serio') return 'institucional';
  if (tone === 'humor') return 'juvenil';
  if (tone === 'tecnico') return 'cientifica';
  if (tone === 'premium') return 'premium';
  var map = {
    agua: 'eco', agro: 'artesanal', residuos: 'eco', energia: 'tech', salud: 'comunitaria',
    educacion: 'juvenil', tech: 'tech', social: 'comunitaria', cultura: 'cultural',
    vivienda: 'comunitaria', transporte: 'minimal', economia: 'minimal', alimento: 'artesanal',
    ambiente: 'eco', generico: 'comunitaria'
  };
  return map[sec] || 'comunitaria';
}

function aplicarEstiloProyecto(id) {
  var st = PROJ_STYLES.filter(function (x) { return x.id === id; })[0];
  if (!st) return;
  var p = proyectoDe();
  p.style = { id: st.id, label: st.label, archetype: st.archetype, source: st.source };
  p.pal = { bg: st.pal.bg, bg2: st.pal.bg2, ac: st.pal.ac, ink: st.pal.ink, mu: st.pal.mu, gl: st.pal.gl };
  p.fonts = { t: fuenteOk(st.fonts.t) || st.fonts.t, b: fuenteOk(st.fonts.b) || st.fonts.b };
  saveIdentity(S);
  if (typeof loadFont === 'function') { loadFont(p.fonts.t); loadFont(p.fonts.b); }
  renderKit();
  var stEl = $('statusProyecto');
  if (stEl) stEl.textContent = 'Estilo aplicado al proyecto: ' + st.label + ' (' + st.archetype + '). La marca del equipo no cambió.';
}

function renderEstilosProyecto() {
  var box = $('projStyles');
  if (!box) return;
  var p = proyectoDe();
  var rec = estiloRecomendado(p);
  var activo = p.style && p.style.id;
  box.innerHTML = PROJ_STYLES.map(function (st) {
    var on = activo === st.id;
    var sugiere = rec === st.id;
    var borde = on ? st.pal.ac : (sugiere ? '#0D1B35' : 'rgba(13,27,53,.14)');
    var fondo = on ? st.pal.bg2 : '#FFFFFF';
    return '<button type="button" data-estilo="' + st.id + '" style="text-align:left;cursor:pointer;background:' + fondo + ';border:2px solid ' + borde + ';border-radius:10px;padding:9px 10px;font:inherit">' +
      '<span style="display:flex;gap:4px;margin-bottom:6px">' +
      [st.pal.ac, st.pal.ink, st.pal.gl, st.pal.bg2].map(function (c) {
        return '<i style="display:block;width:15px;height:15px;border-radius:4px;background:' + c + ';border:1px solid rgba(0,0,0,.08)"></i>';
      }).join('') + '</span>' +
      '<span style="display:block;font-size:12px;font-weight:800;color:' + st.pal.ink + '">' + _esc(st.label) + '</span>' +
      '<span style="display:block;font-size:10px;line-height:1.35;color:' + st.pal.mu + '">' + _esc(st.archetype) + (sugiere ? ' · recomendado' : '') + (on ? ' · elegido' : '') + '</span>' +
      '<span style="display:block;font-size:9px;line-height:1.35;color:' + st.pal.ink + ';opacity:.9;margin-top:2px">' + _esc(st.fonts.t) + ' + ' + _esc(st.fonts.b) + '</span>' +
      '<span style="display:block;font-size:9px;line-height:1.3;color:' + st.pal.mu + ';opacity:.8">ej. ' + _esc(PROJ_STYLE_REFS[st.id] || '') + '</span>' +
      '</button>';
  }).join('');
}

function renderIdeasProyecto(kind, list) {
  var box = $('projIdeas');
  if (!box) return;
  list = list || [];
  if (!list.length) { box.innerHTML = ''; return; }
  box.innerHTML = '<p class="note" style="margin:2px 0 6px">' + (kind === 'claim' ? 'Slogans propuestos. Elige uno.' : 'Nombres propuestos. Elige uno o escribe el tuyo.') + '</p>' +
    list.map(function (it) {
      var txt = kind === 'claim' ? it : it.name;
      var meta = kind === 'claim' ? '' : (it.pattern + ' · ' + it.why);
      return '<button type="button" data-kind="' + kind + '" data-idea="' + _esc(txt) + '" title="' + _esc(meta) + '" style="display:block;width:100%;text-align:left;margin-bottom:5px;padding:7px 9px;border:1px solid rgba(13,27,53,.16);border-radius:8px;background:#fff;cursor:pointer;font:inherit">' +
        '<span style="font-size:12px;font-weight:800;color:#0D1B35">' + _esc(txt) + '</span>' +
        (meta ? '<span style="display:block;font-size:10px;color:#5C7193;line-height:1.3">' + _esc(meta) + '</span>' : '') +
        '</button>';
    }).join('');
}

function renderProyecto() {
  var p = proyectoDe();
  var name = (p.name || '').trim();
  var slogan = (p.slogan || p.claim || '').trim();
  var sector = (p.sector || '').trim();
  var mark = (p.logoText || _iniNombre(name)).toUpperCase();
  var pp = p.pal || {};
  var ac = pp.ac || brandColor(kitPaper());
  var ink = pp.ink || legibleInk(kitPaper());
  var mu = pp.mu || '#5C7193';

  var nameEl = $('kitProjName');
  if (nameEl) {
    nameEl.textContent = name || '—';
    nameEl.style.color = ink;
    nameEl.style.fontFamily = p.fonts && p.fonts.t ? "'" + p.fonts.t + "',sans-serif" : '';
    nameEl.style.fontWeight = p.fonts && p.fonts.t ? '700' : '800';
  }
  var sloganEl = $('kitProjSlogan');
  if (sloganEl) { sloganEl.textContent = slogan; sloganEl.style.color = mu; }
  var sectorEl = $('kitProjSector');
  if (sectorEl) { sectorEl.textContent = sector; sectorEl.style.color = ac; }
  var styleEl = $('kitProjStyle');
  if (styleEl) {
    if (p.style && p.style.label) {
      styleEl.textContent = p.style.label + ' · ' + (p.style.archetype || '');
      styleEl.style.display = '';
      styleEl.style.background = pp.gl || '#EEF2FF';
      styleEl.style.color = ink;
    } else {
      styleEl.style.display = 'none';
    }
  }
  var logoEl = $('kitProjLogo');
  if (logoEl) {
    if (p.logoImg) {
      logoEl.textContent = '';
      logoEl.style.backgroundImage = 'url(' + p.logoImg + ')';
      logoEl.style.backgroundSize = 'contain';
      logoEl.style.backgroundRepeat = 'no-repeat';
      logoEl.style.backgroundPosition = 'center';
      logoEl.style.backgroundColor = '#fff';
    } else {
      logoEl.style.backgroundImage = '';
      logoEl.style.background = ac;
      logoEl.style.color = _textoSobre(ac);
      logoEl.textContent = mark;
    }
  }
  var ask = $('projAsk');
  if (ask) ask.style.display = name ? 'none' : '';
  var pairs = [['kitProjMission', p.mission], ['kitProjVision', p.vision], ['kitProjInspiration', p.inspiration]];
  pairs.forEach(function (pair) {
    var el = $(pair[0]);
    if (!el) return;
    var row = el.parentNode;
    if (pair[1]) { el.textContent = pair[1]; if (row) row.style.display = ''; }
    else { el.textContent = ''; if (row) row.style.display = 'none'; }
  });
  if (typeof loadFont === 'function' && p.fonts) {
    if (p.fonts.t) loadFont(p.fonts.t);
    if (p.fonts.b) loadFont(p.fonts.b);
  }
  renderEscalaProyecto(p);
  renderPaletaProyecto(p);
  renderTexturasProyecto(p);
  renderPromptsProyecto(p);
}

function renderEscalaProyecto(p) {
  var st = estiloDe(p);
  var rec = PROJ_STYLES.filter(function (x) { return x.id === estiloRecomendado(p); })[0];
  var base = st || rec;
  var ftEl = $('kitProjFonts');
  var typeEl = $('kitProjType');
  if (!base) { if (ftEl) ftEl.textContent = ''; if (typeEl) typeEl.innerHTML = ''; return; }
  var ft = (p.fonts && p.fonts.t) || base.fonts.t;
  var fb = (p.fonts && p.fonts.b) || base.fonts.b;
  if (typeof loadFont === 'function') { loadFont(ft); loadFont(fb); }
  if (ftEl) {
    ftEl.textContent = 'Títulos: ' + ft + ' · Cuerpo: ' + fb + (st ? '' : ' · sugeridas, elige un estilo para aplicarlas');
  }
  var whyEl = $('kitProjFontWhy');
  if (whyEl) {
    var why = PROJ_FONT_WHY[base.id];
    whyEl.textContent = why ? 'Por qué: ' + why : '';
  }
  if (typeEl) {
    var ink = (p.pal && p.pal.ink) || base.pal.ink;
    var mu = (p.pal && p.pal.mu) || base.pal.mu;
    typeEl.innerHTML =
      '<div class="font-row"><span class="tag">H1</span><span class="sample h1" style="font-family:\'' + _esc(ft) + '\',sans-serif;color:' + ink + '">' + _esc(p.name || 'Titular del proyecto') + '</span></div>' +
      '<div class="font-row"><span class="tag">H2</span><span class="sample h2" style="font-family:\'' + _esc(ft) + '\',sans-serif;color:' + ink + '">La solución en una línea</span></div>' +
      '<div class="font-row"><span class="tag">H3</span><span class="sample h3" style="font-family:\'' + _esc(ft) + '\',sans-serif;color:' + ink + '">CÓMO FUNCIONA</span></div>' +
      '<div class="font-row"><span class="tag">P</span><span class="sample body" style="font-family:\'' + _esc(fb) + '\',sans-serif;color:' + mu + '">Texto de apoyo para explicar el beneficio sin adjetivos de relleno. Jerarquía H1, H2, H3 y párrafo con la misma pareja tipográfica.</span></div>';
  }
}

function renderPaletaProyecto(p) {
  var box = $('kitProjPal');
  if (!box) return;
  var st = estiloDe(p);
  var rec = PROJ_STYLES.filter(function (x) { return x.id === estiloRecomendado(p); })[0];
  var base = st || rec;
  var pal = (p.pal && p.pal.ac ? p.pal : null) || (st && st.pal) || (rec && rec.pal);
  if (!pal) { box.innerHTML = ''; return; }
  var roles = [
    ['Marca', pal.ac], ['Acento 2', pal.ac2 || (base && base.pal && base.pal.ac2) || lighten(pal.ac, .28)],
    ['Tinta', pal.ink], ['Suave', pal.mu],
    ['Formas', pal.gl], ['Fondo', pal.bg], ['Fondo 2', pal.bg2],
    ['Tinte +20', lighten(pal.ac, .2)], ['Sombra -20', darken(pal.ac, .2)]
  ];
  box.innerHTML = roles.map(function (r) {
    return '<div class="proj-sw" style="background:#FFFFFF;color:#0D1B35">' +
      '<span style="display:block;height:26px;border-radius:5px;background:' + r[1] + ';border:1px solid rgba(0,0,0,.08)"></span>' +
      '<b>' + r[0] + '</b><i style="color:#475569">' + r[1].toUpperCase() + '</i></div>';
  }).join('');
}

function renderTexturasProyecto(p) {
  var box = $('kitProjPatterns');
  var note = $('kitProjTextureNote');
  if (!box) return;
  var st = estiloDe(p);
  var rec = PROJ_STYLES.filter(function (x) { return x.id === estiloRecomendado(p); })[0];
  var base = st || rec;
  var t = base && PROJ_TEXTURES[base.id];
  if (!t) { box.innerHTML = ''; if (note) note.textContent = ''; return; }
  var ac = (p.pal && p.pal.ac) || base.pal.ac;
  var gl = (p.pal && p.pal.gl) || base.pal.gl;
  box.innerHTML = '<div class="proj-tex" style="min-height:82px;background-size:84px 84px;background-repeat:repeat;border-radius:8px;background-color:' + gl + ';background-image:' + _cssTextura(base.id, ac) + '"></div>' +
    '<div class="proj-tex" style="min-height:82px;background-size:84px 84px;background-repeat:repeat;border-radius:8px;background-color:' + ac + ';background-image:' + _cssTextura(base.id, '#FFFFFF') + '"></div>' +
    '<div class="proj-tex" style="min-height:82px;background-size:84px 84px;background-repeat:repeat;border-radius:8px;background-color:' + ((p.pal && p.pal.bg) || base.pal.bg) + ';background-image:' + _cssTextura(base.id, ac) + '"></div>';
  if (note) note.textContent = t.name + ' · ' + t.note + ' Se descarga en PNG transparente, sin fondo.';
}

function _guardarArchivo(nombre, blob, statusEl, texto) {
  if (!blob || !blob.size) {
    if (statusEl) statusEl.textContent = 'El archivo salió vacío. Recarga la página e intenta otra vez.';
    return false;
  }
  var url = URL.createObjectURL(blob);
  var a = document.createElement('a');
  a.download = nombre;
  a.rel = 'noopener';
  a.href = url;
  document.body.appendChild(a);
  a.click();
  // No revocar el blob ni quitar el ancla: si el navegador aún está escribiendo
  // el archivo, la descarga se corta y queda un .crdownload que no abre.
  setTimeout(function () { a.remove(); }, 30000);
  if (statusEl) {
    statusEl.innerHTML = (texto || 'Archivo listo') +
      ' · <a href="' + url + '" download="' + nombre + '" style="color:inherit;text-decoration:underline">Guardar otra vez</a>' +
      ' · <a href="' + url + '" target="_blank" rel="noopener" style="color:inherit;text-decoration:underline">Abrir</a>';
  }
  return true;
}

function _descargarPNG(nombre, svg, opts) {
  opts = opts || {};
  var size = opts.size || 2048;
  var url = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml;charset=utf-8' }));
  var img = new Image();
  img.onload = function () {
    var c = document.createElement('canvas');
    c.width = size; c.height = size;
    var ctx = c.getContext('2d');
    // Fondo transparente a proposito: el asset se monta sobre video o canvas.
    if (opts.repeat) {
      var tile = size / 4;
      for (var y = 0; y < 4; y++) for (var x = 0; x < 4; x++) ctx.drawImage(img, x * tile, y * tile, tile, tile);
    } else {
      var m = size * 0.14;
      ctx.drawImage(img, m, m, size - 2 * m, size - 2 * m);
    }
    function guardar(href) {
      var a = document.createElement('a');
      a.href = href;
      a.download = nombre + '.png';
      a.rel = 'noopener';
      document.body.appendChild(a);
      a.click();
      setTimeout(function () { a.remove(); }, 30000);
      if (opts.statusEl) {
        opts.statusEl.innerHTML = 'Listo: ' + nombre + '.png · 2048×2048 · fondo transparente' +
          ' · <a href="' + href + '" download="' + nombre + '.png" style="color:inherit;text-decoration:underline">Guardar otra vez</a>' +
          ' · <a href="' + href + '" target="_blank" rel="noopener" style="color:inherit;text-decoration:underline">Abrir</a>';
      }
      if (opts.onDone) opts.onDone();
    }
    if (c.toBlob) {
      c.toBlob(function (b) {
        guardar(URL.createObjectURL(b));
      }, 'image/png');
    } else {
      guardar(c.toDataURL('image/png'));
    }
    URL.revokeObjectURL(url);
  };
  img.onerror = function () {
    URL.revokeObjectURL(url);
    if (opts.onError) opts.onError();
  };
  img.src = url;
}
function descargarPatronPNG(modo, blanco) {
  var p = proyectoDe();
  var st = estiloDe(p);
  var rec = PROJ_STYLES.filter(function (x) { return x.id === estiloRecomendado(p); })[0];
  var base = st || rec;
  if (!base) return;
  var color = blanco ? '#FFFFFF' : ((p.pal && p.pal.ac) || base.pal.ac);
  var svg = _svgTextura(base.id, color);
  if (!svg) return;
  var nombre = 'textura-' + base.id + '-' + (blanco ? 'blanca' : 'marca') + '-' + (modo === 'mosaico' ? 'mosaico' : 'motivo');
  var stEl = $('statusTexturas');
  if (stEl) stEl.textContent = 'Generando ' + nombre + '.png (2048 px, fondo transparente)…';
  _descargarPNG(nombre, svg, {
    repeat: modo === 'mosaico',
    size: 2048,
    statusEl: stEl,
    onError: function () { if (stEl) stEl.textContent = 'No se pudo generar el PNG. Recarga la página.'; }
  });
}

function renderPromptsProyecto(p) {
  var nm = (p.name || '').trim();
  var pl = $('promptLogo'), pm = $('promptMascota'), pp = $('promptProducto');
  if (pl) pl.value = nm ? promptLogoProyecto() : '';
  if (pm) pm.value = nm ? promptMascotaProyecto() : '';
  if (pp) pp.value = nm ? promptProductoProyecto() : '';
  var ask = $('projPromptAsk');
  if (ask) ask.style.display = nm && !p.logoImg ? '' : 'none';
  var hasLogo = $('projHasLogo');
  if (hasLogo) hasLogo.style.display = p.logoImg ? '' : 'none';
  var mNote = $('projMascotNote');
  if (mNote) mNote.textContent = nm ? sugerirMascota(p) : '';
  var existingRow = $('kitProjExistingRow');
  var existingVal = $('kitProjExisting');
  var raw = (p.existing || '').trim();
  if (existingRow) existingRow.style.display = raw ? '' : 'none';
  if (existingVal) {
    existingVal.textContent = raw;
    if (/^https?:\/\//i.test(raw)) {
      existingVal.href = raw; existingVal.style.textDecoration = 'underline';
    } else { existingVal.removeAttribute('href'); existingVal.style.textDecoration = 'none'; }
  }
}

function renderKit() {
  var tn = S.team.name || '';
  var logo = (S.team.tag || tn).replace('#', '').slice(0, 3).toUpperCase();
  // Logo del equipo (el que sube el kit). Si no hay, iniciales.
  var lg = teamLogo();
  $('kitName').textContent = tn;
  $('kitSub').textContent = S.team.kicker || S.team.foot || '';
  if (lg) {
    ['kitLogo','lv1','lv2','lv3'].forEach(function(b){
      var el=$(b); el.style.backgroundImage='url('+lg+')'; el.style.backgroundSize='contain'; el.style.backgroundRepeat='no-repeat'; el.style.backgroundPosition='center'; el.textContent='';
    });
  } else {
    $('kitLogo').textContent = logo; $('lv1').textContent = logo; $('lv2').textContent = logo; $('lv3').textContent = logo;
    $('kitLogo').style.backgroundImage=''; $('lv1').style.backgroundImage=''; $('lv2').style.backgroundImage=''; $('lv3').style.backgroundImage='';
  }
  $('kitBio').textContent = S.bio || '';
  renderProyecto();
  renderEstilosProyecto();
  // Institucion: logo de la UNI + nombre. La ciudad se queda vacia a proposito:
  // si no hay ciudad, la celda no se muestra.
  var uniLogo = (S.team && S.team.logoUni) || INSTITUTION_DEFAULT.symbol || INSTITUTION_DEFAULT.logo;
  var mark = $('kitUniMark');
  if (mark) {
    if (uniLogo) {
      mark.style.backgroundImage = 'url(' + uniLogo + ')';
      mark.style.display = 'block';
    } else {
      mark.style.backgroundImage = '';
      mark.style.display = 'none';
    }
  }
  $('kitUni').textContent = S.team.university || INSTITUTION_DEFAULT.name;
  var cityCell = $('kitCityCell');
  var city = S.team.city || '';
  $('kitCity').textContent = city;
  if (cityCell) cityCell.style.display = city ? '' : 'none';
  // fonts
  var ft = (S.fonts && S.fonts.t) || 'Plus Jakarta Sans';
  var fb = (S.fonts && S.fonts.b) || 'Barlow';
  ['fH1', 'fH2', 'fH3'].forEach(function (id) { $(id).style.fontFamily = "'" + ft + "',sans-serif"; });
  $('fBody').style.fontFamily = "'" + fb + "',sans-serif";
  $('fMono').style.fontFamily = "'JetBrains Mono',monospace";
  // palette: los 6 roles canonicos, compartidos con el carrusel y el thumbnail
  var pals = [
    { n: 'Marca', c: S.pal.ac },
    { n: 'Texto', c: S.pal.ink },
    { n: 'Suave', c: S.pal.mu },
    { n: 'Formas', c: S.pal.gl },
    { n: 'Fondo', c: S.pal.bg },
    { n: 'Fondo 2', c: S.pal.bg2 },
  ];
  $('kitPal').innerHTML = pals.map(function (p) {
    return '<div class="sw" style="background:' + p.c + '"><span>' + p.n + '</span></div>';
  }).join('');
  // team
  var mem = S.mem || [];
  var av = S.pal.ac || '#0866F5';
  $('kitTeam').innerHTML = mem.map(function (m, i) {
    var ini = (m.n || '?').charAt(0).toUpperCase();
    return '<div class="team-card"><div class="av" style="background:' + av + '">' + ini + '</div><div class="nm">' + (m.n || '') + ' ' + (m.s || '') + '</div><div class="rl">' + (m.r || '') + '</div></div>';
  }).join('') || '<div class="team-card"><div class="av" style="background:' + av + '">?</div><div class="nm">Sin integrantes</div><div class="rl">Agrega en el carrusel</div></div>';
  // logo variants colors (solo si no hay logo: se pintan con la marca)
  if (!lg) {
    var brand = brandColor(kitPaper());
    $('lv1').style.background = brand; $('lv1').style.color = '#fff';
    $('lv2').style.background = '#fff'; $('lv2').style.color = brand; $('lv2').style.border = '1px solid ' + brand;
    $('lv3').style.background = legibleInk(kitPaper()); $('lv3').style.color = '#fff';
    $('kitLogo').style.background = brand; $('kitLogo').style.color = '#fff';
  }
  $('kitName').style.fontFamily = "'" + ft + "',sans-serif";
  $('kitName').style.color = legibleInk(kitPaper());
  applyPalette();
  // load fonts
  loadFont(ft); loadFont(fb);
}

function saveAll() {
  S.team.name = $('teamName').value;
  var pr = proyectoDe();
  pr.name = $('projName').value;
  pr.claim = $('projClaim').value;
  pr.sector = $('projSector').value;
  pr.logoText = $('projLogoText').value;
  pr.problem = $('projProblem').value;
  pr.solution = $('projSolution').value;
  pr.audience = $('projAudience').value;
  pr.tone = $('projTone').value;
  pr.slogan = $('projSlogan').value;
  pr.mission = $('projMission').value;
  pr.vision = $('projVision').value;
  pr.inspiration = $('projInspiration').value;
  pr.existing = $('projExisting').value;
  pr.mascot = $('projMascot').value;
  var uniVal = ($('uni').value || '').trim();
  S.team.university = uniVal || INSTITUTION_DEFAULT.name;
  S.team.city = ($('city').value || '').trim();
  S.bio = $('bio').value;
  S.university = S.team.university;
  S.city = S.team.city;
  S.pal.ac = $('cAc').value;
  S.pal.ink = $('cInk').value;
  S.pal.mu = $('cMu').value;
  S.pal.gl = $('cGl').value;
  S.pal.bg = $('cBg').value;
  S.pal.bg2 = $('cBg2').value;
  if (!S.fonts) S.fonts = {};
  S.fonts.t = $('fontTitle').value;
  S.fonts.b = $('fontBody').value;
  saveIdentity(S);
}

function exportPNG(targetId, filename, statusId, btn) {
  var el = $(targetId);
  if (btn) btn.disabled = true;
  $(statusId).textContent = 'Generando PNG…';
  // Fondo blanco en el kit: es un documento, no un asset para video. Los
  // patrones gráficos sí salen transparentes por otra vía (_descargarPNG).
  html2canvas(el, { scale: 2, useCORS: true, backgroundColor: '#ffffff' }).then(function (canvas) {
    if (canvas.toBlob) {
      canvas.toBlob(function (blob) {
        _guardarArchivo(filename + '.png', blob, $(statusId), 'PNG listo: ' + filename + '.png');
      }, 'image/png');
    } else {
      var link = document.createElement('a');
      link.download = filename + '.png';
      link.href = canvas.toDataURL('image/png');
      document.body.appendChild(link);
      link.click();
      setTimeout(function () { link.remove(); }, 30000);
      $(statusId).textContent = 'PNG descargado: ' + filename + '.png';
    }
  }).catch(function (e) {
    $(statusId).textContent = 'Error: ' + e.message;
  }).finally(function () {
    if (btn) btn.disabled = false;
  });
}

function exportPDF(targetId, filename, statusId) {
  var el = $(targetId);
  if (!el || !window.html2canvas || !window.jspdf) {
    $(statusId).textContent = 'Faltan las librerías de exportación. Recarga la página.';
    return;
  }
  $(statusId).textContent = 'Generando PDF…';
  // Base blanca: si el fondo es transparente, el PDF sale con cajas negras.
  // 1.5x conserva nitidez de texto sin inflar el archivo (un kit largo pesaba 15 MB).
  html2canvas(el, { scale: 1.5, useCORS: true, backgroundColor: '#ffffff' }).then(function (canvas) {
    var pageW = 794; // ancho de A4 a 96 ppp, legible en pantalla y al imprimir
    var pageH = Math.round(pageW * canvas.height / canvas.width);
    var pdf = new jspdf.jsPDF({ orientation: pageH > pageW ? 'portrait' : 'landscape', unit: 'pt', format: [pageW, pageH], compress: true });
    var imgData = canvas.toDataURL('image/jpeg', 0.92);
    pdf.addImage(imgData, 'JPEG', 0, 0, pageW, pageH, undefined, 'FAST');
    var blob = pdf.output('blob');
    _guardarArchivo(filename + '.pdf', blob, $(statusId), 'PDF listo: ' + filename + '.pdf');
  }).catch(function (e) {
    $(statusId).textContent = 'Error al generar el PDF: ' + e.message;
  });
}

// --- listeners ---
function bind() {
  var ids = ['teamName', 'logoText', 'bio', 'uni', 'city', 'cAc', 'cInk', 'cMu', 'cGl', 'cBg', 'cBg2', 'fontTitle', 'fontBody',
    'projName', 'projClaim', 'projSector', 'projLogoText', 'projProblem', 'projSolution', 'projAudience', 'projTone',
    'projSlogan', 'projMission', 'projVision', 'projInspiration', 'projExisting', 'projMascot'];
  ids.forEach(function (id) {
    var el = $(id);
    if (!el) return;
    el.addEventListener('input', function () { saveAll(); renderKit(); });
    el.addEventListener('change', function () { saveAll(); renderKit(); });
  });
  // Extraccion de paleta desde el logo (la logica vive en shared.js
  // como funcion pura: asi se puede testear con imagenes sinteticas).
  function extractPaletteFromImage(src, cb) {
    var img = new Image();
    img.onload = function () {
      var c = document.createElement('canvas');
      c.width = 128; c.height = 128;
      var ctx = c.getContext('2d');
      ctx.drawImage(img, 0, 0, 128, 128);
      var data = ctx.getImageData(0, 0, 128, 128).data;
      var raw = extractPaletteFromPixels(data);
      if (!raw) { cb(null); return; }
      // La extraccion local ya sale en forma canonica; el saneo la deja
      // sin morado, con tinta legible y con acento de contraste real.
      var out = sanitizePalette(raw);
      out.hasBlack = raw.hasBlack;
      out.black = raw.black;
      cb(out);
    };
    img.onerror = function(){ cb(null); };
    img.src = src;
  }

  $('projLogoFile').addEventListener('change', function (e) {
    var f = e.target.files[0]; if (!f) return;
    $('projLogoFileName').textContent = f.name;
    if (!/^image\//.test(f.type || '')) { $('projLogoFileName').textContent = 'Solo imagenes: PNG o SVG.'; e.target.value = ''; return; }
    if (f.size > 3.5 * 1024 * 1024) { $('projLogoFileName').textContent = 'Maximo 3.5 MB. Comprime el logo.'; e.target.value = ''; return; }
    var r = new FileReader();
    r.onload = function () {
      proyectoDe().logoImg = r.result;
      saveIdentity(S);
      renderKit();
    };
    r.readAsDataURL(f);
  });

  // --- asistente de marca del proyecto ---
  function pedirDatos(minimo) {
    var p = proyectoDe();
    var faltan = [];
    if (minimo.indexOf('problema') >= 0 && !(p.problem || '').trim()) faltan.push('el problema que ataca');
    if (minimo.indexOf('publico') >= 0 && !(p.audience || '').trim()) faltan.push('a quién sirve');
    if (faltan.length) {
      var st = $('statusProyecto');
      if (st) st.textContent = 'Falta ' + faltan.join(' y ') + '. Escríbelo para que la sugerencia no invente.';
      return false;
    }
    return true;
  }

  $('sugerirNombres').addEventListener('click', function () {
    if (!pedirDatos('problema')) return;
    var list = sugerirNombres();
    saveIdentity(S);
    renderIdeasProyecto('name', list);
    var st = $('statusProyecto');
    if (st) st.textContent = 'Nombres basados en patrones de ganadores SIRLI. Elige uno o escribe el tuyo.';
  });

  $('sugerirClaim').addEventListener('click', function () {
    if (!pedirDatos('problema publico')) return;
    var list = sugerirClaim();
    saveIdentity(S);
    renderIdeasProyecto('claim', list);
    var st = $('statusProyecto');
    if (st) st.textContent = 'Slogans armados con tu problema y tu público. Elige uno.';
  });

  $('sugerirProposito').addEventListener('click', function () {
    if (!pedirDatos('problema publico')) return;
    var r = sugerirProposito();
    $('projMission').value = r.mission;
    $('projVision').value = r.vision;
    $('projInspiration').value = r.inspiration;
    saveAll();
    renderKit();
    var st = $('statusProyecto');
    if (st) st.textContent = 'Misión, visión e inspiración listas. Puedes editarlas.';
  });

  var ideasBox = $('projIdeas');
  if (ideasBox) {
    ideasBox.addEventListener('click', function (e) {
      var b = e.target.closest ? e.target.closest('button[data-idea]') : null;
      if (!b) return;
      var kind = b.getAttribute('data-kind');
      var val = b.getAttribute('data-idea');
      var p = proyectoDe();
      if (kind === 'claim') {
        $('projSlogan').value = val;
        p.slogan = val;
      } else {
        var prev = p.name || '';
        var prevIni = _iniNombre(prev);
        $('projName').value = val;
        p.name = val;
        var actualIni = ($('projLogoText').value || '').trim();
        if (!actualIni || actualIni.toUpperCase() === prevIni.toUpperCase()) {
          $('projLogoText').value = _iniNombre(val);
          p.logoText = _iniNombre(val);
        }
      }
      saveAll();
      renderKit();
      var st = $('statusProyecto');
      if (st) st.textContent = kind === 'claim' ? 'Slogan aplicado.' : 'Nombre aplicado. Puedes cambiarlo cuando quieras.';
    });
  }

  var stylesBox = $('projStyles');
  if (stylesBox) {
    stylesBox.addEventListener('click', function (e) {
      var b = e.target.closest ? e.target.closest('button[data-estilo]') : null;
      if (!b) return;
      aplicarEstiloProyecto(b.getAttribute('data-estilo'));
    });
  }

  var aplicarKit = $('aplicarProyectoKit');
  if (aplicarKit) {
    aplicarKit.addEventListener('click', function () {
      var p = proyectoDe();
      if (!p.pal || !p.fonts) {
        var st0 = $('statusProyecto');
        if (st0) st0.textContent = 'Primero elige un estilo de marca para el proyecto.';
        return;
      }
      S.pal.ac = p.pal.ac; S.pal.ink = p.pal.ink; S.pal.mu = p.pal.mu;
      S.pal.gl = p.pal.gl; S.pal.bg = p.pal.bg; S.pal.bg2 = p.pal.bg2;
      S.fonts.t = p.fonts.t; S.fonts.b = p.fonts.b;
      $('cAc').value = S.pal.ac; $('cInk').value = S.pal.ink; $('cMu').value = S.pal.mu;
      $('cGl').value = S.pal.gl; $('cBg').value = S.pal.bg; $('cBg2').value = S.pal.bg2;
      $('fontTitle').value = S.fonts.t; $('fontBody').value = S.fonts.b;
      saveAll();
      renderKit();
      var st = $('statusProyecto');
      if (st) st.textContent = 'Identidad del proyecto llevada al kit completo.';
    });
  }

  $('logoFile').addEventListener('change', function (e) {
    var f = e.target.files[0]; if (!f) return;
    $('logoFileName').textContent = f.name;
    var r = new FileReader();
    r.onload = function () {
      var boxes = ['kitLogo', 'lv1', 'lv2', 'lv3'];
      boxes.forEach(function (b) {
        var el = $(b);
        el.style.backgroundImage = 'url(' + r.result + ')';
        el.style.backgroundSize = 'contain';
        el.style.backgroundRepeat = 'no-repeat';
        el.style.backgroundPosition = 'center';
        el.textContent = '';
      });
      // El logo vive en S.team.logo: es el campo canonico que comparten
      // el carrusel, el kit y el thumbnail.
      S.team.logo = r.result;
      S.logo = r.result;
      saveIdentity(S);
      extractPaletteFromImage(r.result, function (pal) {
        if (!pal) return;
        function applySuggested(p, fonts, msg) {
          // Toda paleta (de IA o local) pasa por el mismo saneo:
          // negro permitido, morado vetado, contraste real exigido.
          // La IA entrega la forma cruda (primary/secondary/accent/text);
          // la conversion a la forma canonica la hace sanitizePaletteCruda.
          var sp = p && p.text != null ? sanitizePaletteCruda(p) : sanitizePalette(p);
          // Dato duro del pixel: si el logo tiene negro, ese negro es la tinta.
          // La IA no puede taparlo con un color de marca.
          if (pal.hasBlack && pal.black && lumOf(pal.black) <= 0.12) {
            sp.primary = pal.black;
            sp.notes.push('tinta = negro detectado en el logo');
          }
          var bgCand = sp.bg || '#ffffff';
          S.pal.bg = bgCand;
          var inkCand = sp.primary || '#0D1B35';
          S.pal.ink = inkCand;
          S.pal.ac = sp.accent || '#0866F5';
          S.pal.bg2 = sp.secondary || '#F0F6FF';
          // Tinta suave y formas se derivan de la propia paleta.
          S.pal.mu = lighten(inkCand, 0.35);
          S.pal.gl = lighten(S.pal.ac, 0.82);
          /* La fuente sugerida tiene que existir en la biblioteca del proyecto:
             si no está, no se cambia la actual. */
          if (fonts && fonts.title && fuenteOk(fonts.title)) S.fonts.t = fuenteOk(fonts.title);
          if (fonts && fonts.body && fuenteOk(fonts.body)) S.fonts.b = fuenteOk(fonts.body);
          var cAc = $('cAc'); if (cAc) cAc.value = S.pal.ac;
          var cInk = $('cInk'); if (cInk) cInk.value = S.pal.ink;
          var cMu = $('cMu'); if (cMu) cMu.value = S.pal.mu;
          var cGl = $('cGl'); if (cGl) cGl.value = S.pal.gl;
          var cBg = $('cBg'); if (cBg) cBg.value = S.pal.bg;
          var cBg2 = $('cBg2'); if (cBg2) cBg2.value = S.pal.bg2;
          var ft = $('fontTitle'); if (ft) ft.value = S.fonts.t;
          var fb = $('fontBody'); if (fb) fb.value = S.fonts.b;
          saveAll();
          renderKit();
          var st = $('statusKit'); if (st) st.textContent = msg || 'Paleta y fuente sugeridas desde tu logo.';
        }
        // Intentar motor backend con IA; fallback a extraccion local
        fetch('/api/ai/design', {
          method: 'POST',
          headers: (function () {
            var h = { 'Content-Type': 'application/json' };
            try {
              var actor = (localStorage.getItem('rally_presence_name') || '').trim().slice(0, 80);
              if (actor) h['X-Rally-Actor'] = actor;
            } catch (e) {}
            return h;
          })(),
          body: JSON.stringify({ colors: [pal.primary, pal.secondary, pal.accent], image: r.result })
        }).then(function (res) { return res.json(); }).then(function (data) {
          if (data && data.status === 'ok' && data.palette) {
            applySuggested(data.palette, data.fonts, 'Paleta y fuente sugeridas por IA desde tu logo.');
          } else {
            var par = parejaAleatoria();
            applySuggested(pal, { title: par.title, body: par.body }, 'Paleta sugerida localmente (sin IA).');
          }
        }).catch(function () {
          var par2 = parejaAleatoria();
          applySuggested(pal, { title: par2.title, body: par2.body }, 'Paleta sugerida localmente (sin IA).');
        });
      });
    };
    r.readAsDataURL(f);
  });
  $('addCustomFont').addEventListener('click', function () {
    var url = $('customFontUrl').value.trim();
    if (!url) return;
    var famUrl = (url.match(/family=([^&:]+)/) || [])[1];
    famUrl = famUrl ? decodeURIComponent(famUrl.replace(/\+/g, ' ')).split(',')[0].trim() : '';
    if (esFuenteVetada(famUrl)) {
      $('statusKit').textContent = 'Fuente retirada: ' + famUrl + ' es tipografia vieja. Usa la biblioteca del kit.';
      return;
    }
    loadFontFromUrl(url).then(function (ok) {
      if (!ok) {
        var st = $('statusKit');
        if (st) st.textContent = 'Fuente bloqueada: solo se aceptan https de Google Fonts, Bunny, Typekit o jsDelivr.';
        return;
      }
      // try to extract family name from url
      var m = url.match(/family=([^&:]+)/);
      var fam = m ? decodeURIComponent(m[1].replace(/\+/g, ' ')) : 'Custom';
      var opt = document.createElement('option');
      opt.value = fam; opt.textContent = fam + ' (custom)';
      $('fontTitle').appendChild(opt);
      $('fontBody').appendChild(opt.cloneNode(true));
      $('fontTitle').value = fam;
      $('fontBody').value = fam;
      saveAll(); renderKit();
    });
  });
  // Copiar prompts para IA de imágenes (sin backend).
  Array.prototype.forEach.call(document.querySelectorAll('button[data-copy]'), function (b) {
    b.addEventListener('click', function () {
      var ta = $(b.getAttribute('data-copy'));
      if (!ta) return;
      var txt = ta.value || '';
      if (!txt) return;
      var orig = b.textContent;
      function ok() { b.textContent = 'Copiado'; setTimeout(function () { b.textContent = orig; }, 1400); }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(txt).then(ok, function () { ta.select(); document.execCommand('copy'); ok(); });
      } else {
        ta.select(); document.execCommand('copy'); ok();
      }
    });
  });

  $('exportPngKit').addEventListener('click', function () { exportPNG('kitPreview', 'kit-prensa', 'statusKit', this); });
  $('exportPdfKit').addEventListener('click', function () { exportPDF('kitPreview', 'kit-prensa', 'statusKit'); });
  $('descargarMosaico').addEventListener('click', function () { descargarPatronPNG('mosaico', false); });
  $('descargarMotivo').addEventListener('click', function () { descargarPatronPNG('motivo', false); });
  $('descargarMotivoBlanco').addEventListener('click', function () { descargarPatronPNG('motivo', true); });

  // --- enviar a la ventana (buzon de seccion) ---
  var btnVentana = $('enviarVentana');
  if (btnVentana) {
    btnVentana.addEventListener('click', function () {
      var st = $('statusVentana');
      if (!window.RallyVentana) { if (st) st.textContent = 'ventana.js no cargó.'; return; }
      saveAll();
      btnVentana.disabled = true;
      if (st) st.textContent = 'Enviando a la ventana…';
      window.RallyVentana.enviarIdentidad(S).then(function (claves) {
        if (st) st.textContent = 'Enviado: ' + claves.join(', ') + '. La ventana ya lo tiene.';
      }).catch(function (e) {
        if (st) st.textContent = 'No se pudo enviar: ' + e.message;
      }).finally(function () {
        btnVentana.disabled = false;
      });
    });
  }
}

// init
syncControls();
bind();
renderKit();
var stVentana = $('statusVentana');
if (stVentana && window.RallyVentana && window.RallyVentana.servidorLocal()) {
  stVentana.textContent = 'Listo: el logo y la paleta se escriben en la ventana del rally.';
}
// load fonts
loadFont((S.fonts && S.fonts.t) || 'Plus Jakarta Sans');
loadFont((S.fonts && S.fonts.b) || 'Barlow');

(function () {
  var p = proyectoDe();
  var det = $('detProj');
  if (det && !(p.name || '').trim()) det.open = true;
})();

// El panel de IA tambien ve la marca del proyecto, sin tocar el motor.
if (window.RallyDiseno && typeof window.RallyDiseno.estadoParaIA === 'function') {
  var _estadoBase = window.RallyDiseno.estadoParaIA;
  window.RallyDiseno.estadoParaIA = function (ident) {
    var e = _estadoBase(ident);
    try { e.proyecto = proyectoDe(); } catch (x) {}
    return e;
  };
}

// brief.json -> identidad compartida (mismo cargador que el carrusel y el thumbnail)
cargarBrief(S, function () { syncControls(); renderKit(); });