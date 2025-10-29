// Simple local server to run the serverless handlers without Vercel CLI
// Usage: node dev-server.js (after `npm run -w apps/api build`)
import 'dotenv/config';
import http from 'node:http';
import url from 'node:url';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Dynamic imports from compiled dist
const healthHandler = (await import(resolve(__dirname, './dist/health.js'))).default;
const loginHandler = (await import(resolve(__dirname, './dist/auth/login.js'))).default;

function decorateRes(res) {
  res.status = (code) => ({
    json: (obj) => {
      try { res.setHeader('Content-Type', 'application/json'); } catch {}
      res.statusCode = code;
      res.end(JSON.stringify(obj));
    },
  });
  res.json = (obj) => {
    try { res.setHeader('Content-Type', 'application/json'); } catch {}
    res.end(JSON.stringify(obj));
  };
  return res;
}

const server = http.createServer(async (req, res) => {
  decorateRes(res);
  const parsed = url.parse(req.url || '/', true);
  const path = parsed.pathname || '/';

  try {
    if (path === '/health') {
      await healthHandler(req, res);
      return;
    }
    if (path === '/auth/login') {
      await loginHandler(req, res);
      return;
    }
    res.status(404).json({ error: 'Not Found' });
  } catch (e) {
    console.error('Handler error:', e);
    res.status(500).json({ error: 'Internal Server Error', message: String(e?.message || e) });
  }
});

const port = process.env.PORT ? Number(process.env.PORT) : 3006;
server.listen(port, () => {
  console.log(`Local API listening on http://localhost:${port}`);
  console.log('Endpoints: GET /health, POST /auth/login');
});
