const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const PORT = 8844;
const BLOG_ORIGIN = 'http://localhost:3000';

const server = http.createServer((req, res) => {
  if (req.url === '/') {
    // serve the homepage HTML only at the exact root path
    const filePath = path.join(ROOT, 'yooyeon-mindgym-home.html');
    fs.readFile(filePath, (err, data) => {
      if (err) { res.writeHead(404); res.end('not found'); return; }
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(data);
    });
    return;
  }

  // everything else (/blog/*, /_next/*, /favicon.ico, /api/*, ...) goes to the Next.js dev server
  const target = BLOG_ORIGIN + req.url;
  const proxyReq = http.request(target, { method: req.method, headers: req.headers }, (proxyRes) => {
    res.writeHead(proxyRes.statusCode, proxyRes.headers);
    proxyRes.pipe(res, { end: true });
  });
  proxyReq.on('error', (e) => {
    res.writeHead(502);
    res.end('Blog dev server not reachable: ' + e.message);
  });
  req.pipe(proxyReq, { end: true });
});

server.listen(PORT, () => {
  console.log(`Local homepage server running: http://localhost:${PORT}/`);
  console.log(`Everything else proxied to ${BLOG_ORIGIN}`);
});
