#!/usr/bin/env node
// out/ 정적 서버 — Cloudflare Pages 의 _redirects(200 rewrite) 규칙을 그대로 따른다(로컬 e2e 용).
//   node scripts/serve-out.mjs [port=3918]
import http from 'node:http';
import { readFileSync, existsSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';
const ROOT = new URL('../out/', import.meta.url).pathname;
const PORT = Number(process.argv[2] || 3918);
const rules = readFileSync(join(ROOT, '_redirects'), 'utf8').split('\n').map((l) => l.trim().split(/\s+/)).filter((r) => r.length >= 3 && r[2] === '200');
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.txt': 'text/plain; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.webp': 'image/webp', '.woff2': 'font/woff2', '.ico': 'image/x-icon' };
const file = (p) => { const f = join(ROOT, p); if (existsSync(f) && statSync(f).isFile()) return f; const i = join(f, 'index.html'); return existsSync(i) ? i : null; };
http.createServer((req, res) => {
  let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  let f = file(p);
  if (!f) for (const [from, to] of rules) {
    const re = new RegExp('^' + from.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/:\w+/g, '[^/]+').replace(/\*/g, '.*') + '$');
    if (re.test(p)) { f = file(to); if (f) break; }
  }
  if (!f) { res.writeHead(404); return res.end('404'); }
  res.writeHead(200, { 'content-type': MIME[extname(f)] || 'application/octet-stream' });
  res.end(readFileSync(f));
}).listen(PORT, () => console.log('serve-out', PORT));
