import { createServer } from 'http';
import { URL, fileURLToPath } from 'url';
import { join } from 'path';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const PORT = process.env.PORT || 3000;

async function loadApiHandler(filepath: string) {
  try {
    const module = await import(filepath);
    return (module as any).default || module;
  } catch (error) {
    console.error(`Erro ao carregar handler: ${filepath}`, error);
    return null;
  }
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url || '/', `http://localhost:${PORT}`);

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    res.writeHead(200).end();
    return;
  }

  const pathname = url.pathname;

  if (pathname.startsWith('/api/')) {
    const apiPath = pathname.slice(5); // remove '/api/'
    const handlerPath = join(__dirname, `${apiPath}.ts`);
    try {
      const handler = await loadApiHandler(handlerPath);
      if (handler && typeof handler === 'function') {
        await handler(req, res);
        return;
      }
    } catch (error) {
      console.error(`Erro ao executar handler para ${pathname}:`, error);
    }
  } else if (pathname === '/' || pathname === '') {
    const handlerPath = join(__dirname, `index.ts`);
    const handler = await loadApiHandler(handlerPath);
    if (handler) {
      await handler(req, res);
      return;
    }
  }

  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Rota não encontrada' }));
});

server.listen(PORT, () => {
  console.log(`Dev server http://localhost:${PORT}`);
});

export default server;
