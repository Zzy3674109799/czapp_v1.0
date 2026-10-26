import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'www');
const host = process.env.HOST || '0.0.0.0';
const port = Number(process.env.PORT || 8081);

const types = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.jsx': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
};

function safePath(urlPath) {
  const pathname = decodeURIComponent(new URL(urlPath, 'http://local').pathname);
  const filePath = pathname === '/' ? '/index.html' : pathname;
  const fullPath = path.normalize(path.join(root, filePath));
  return fullPath.startsWith(root) ? fullPath : null;
}

const server = http.createServer(async (req, res) => {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.writeHead(405);
    res.end('Method not allowed');
    return;
  }

  const fullPath = safePath(req.url);
  if (!fullPath) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  try {
    const data = await fs.readFile(fullPath);
    res.writeHead(200, {
      'Content-Type': types[path.extname(fullPath)] || 'application/octet-stream',
      'Cache-Control': 'no-store',
    });
    if (req.method !== 'HEAD') res.end(data);
    else res.end();
  } catch {
    const fallback = await fs.readFile(path.join(root, 'index.html'));
    res.writeHead(200, {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store',
    });
    if (req.method !== 'HEAD') res.end(fallback);
    else res.end();
  }
});

server.listen(port, host, () => {
  console.log(`Cunzai dev server: http://${host}:${port}/`);
});
