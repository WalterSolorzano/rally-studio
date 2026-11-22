const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = Number(process.env.PORT || 8000);
const HOST = process.env.HOST || '127.0.0.1';
const ROOT = __dirname;

// Servidor estatico de desarrollo: no publica el repositorio entero.
// Solo el tablero y sus recursos; nunca .git, scripts, claves ni bases.
const PRIVADOS = [
  '/.git', '/scripts/', '/locks/', '/node_modules/', '/tmp/',
  '/.env', '.key', '.token', '.db', '.ps1', '.bat'
];
const PUBLICOS = ['/dashboard/', '/assets/', '/brand/', '/research/', '/knowledge/'];
const EXT_PERMITIDAS = ['.html', '.css', '.js', '.svg', '.png', '.jpg', '.jpeg',
  '.webmanifest', '.woff2'];

function permitido(reqPath) {
  const ruta = reqPath.toLowerCase();
  if (PRIVADOS.some((p) => ruta.includes(p))) return false;
  if (PUBLICOS.some((p) => ruta.startsWith(p))) return true;
  return EXT_PERMITIDAS.includes(path.extname(ruta));
}

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  '.pdf': 'application/pdf',
  '.md': 'text/markdown; charset=utf-8'
};

const server = http.createServer((req, res) => {
  let reqPath;
  try {
    reqPath = decodeURIComponent(req.url.split('?')[0]);
  } catch (err) {
    res.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('400 Bad Request');
    return;
  }

  // Mock API telemetría para evitar errores 404
  if (reqPath === '/api/telemetry') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', timestamp: Date.now() }));
    return;
  }

  // Redirección directa desde raíz al dashboard
  if (reqPath === '' || reqPath === '/') {
    res.writeHead(302, { Location: '/dashboard/' });
    res.end();
    return;
  }

  if (reqPath.endsWith('/')) {
    reqPath += 'index.html';
  }

  // Aliases seguros para recursos requeridos desde raíz
  if (reqPath === '/app.js') reqPath = '/dashboard/app.js';
  if (reqPath === '/style.css') reqPath = '/dashboard/style.css';

  if (!permitido(reqPath)) {
    res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('403 Forbidden');
    return;
  }

  const filePath = path.join(ROOT, reqPath);

  if (!filePath.startsWith(ROOT)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('404 Not Found');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const mime = MIME[ext] || 'application/octet-stream';
    res.writeHead(200, {
      'Content-Type': mime,
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
    fs.createReadStream(filePath).pipe(res);
  });
});

server.on('error', (e) => {
  console.error('Server error:', e.message);
});

server.on('clientError', (err, socket) => {
  if (socket.writable) socket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
});

server.listen(PORT, HOST, () => {
  console.log(`Rally Studio server running at http://${HOST}:${PORT}/dashboard/`);
});
