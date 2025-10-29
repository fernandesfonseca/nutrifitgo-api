import 'dotenv/config';
import http from 'node:http';
import url from 'node:url';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Import handlers directly from TS source
import healthHandler from './api/health.ts';
import loginHandler from './api/auth/login.ts';

function decorateRes(res: any) {
  res.status = (code: number) => ({
    json: (obj: any) => {
      try { res.setHeader('Content-Type', 'application/json'); } catch {}
      res.statusCode = code;
      res.end(JSON.stringify(obj));
    },
  });
  res.json = (obj: any) => {
    try { res.setHeader('Content-Type', 'application/json'); } catch {}
    res.end(JSON.stringify(obj));
  };
  return res;
}

const server = http.createServer(async (req: any, res: any) => {
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
  } catch (e: any) {
    console.error('Handler error:', e);
    res.status(500).json({ error: 'Internal Server Error', message: String(e?.message || e) });
  }
});

const port = process.env.PORT ? Number(process.env.PORT) : 3006;
server.listen(port, () => {
  console.log(`Local API listening on http://localhost:${port}`);
  console.log('Endpoints: GET /health, POST /auth/login');
});
