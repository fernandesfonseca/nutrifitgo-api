import { createServer, IncomingMessage, ServerResponse } from 'http';
import { URL, fileURLToPath, pathToFileURL } from 'url';
import { join } from 'path';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const PORT = process.env.PORT || 3000;

async function loadApiHandler(filepath: string) {
  try {
    const module = await import(pathToFileURL(filepath).href);
    return (module as any).default || module;
  } catch (error) {
    console.error(`Erro ao carregar handler: ${filepath}`, error);
    return null;
  }
}

function enhanceRes(res: ServerResponse) {
  (res as any).status = (code: number) => {
    res.statusCode = code;
    return res;
  };
  (res as any).json = (data: any) => {
    if (!res.getHeader('Content-Type')) res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(data));
  };
  (res as any).send = (data: any) => {
    if (typeof data === 'object') {
      if (!res.getHeader('Content-Type')) res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(data));
    } else {
      res.end(String(data));
    }
  };
  return res as ServerResponse & { status: (code: number) => any; json: (d: any) => void; send: (d: any) => void };
}

const server = createServer(async (req: IncomingMessage, res: ServerResponse) => {
  const xres = enhanceRes(res);
  const url = new URL(req.url || '/', `http://localhost:${PORT}`);

  xres.setHeader('Access-Control-Allow-Origin', '*');
  xres.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  xres.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    xres.writeHead(200).end();
    return;
  }

  const pathname = url.pathname;

  const tryFiles: string[] = [];
  if (pathname.startsWith('/api/')) {
    const apiPath = pathname.slice(5); // remove '/api/'
    tryFiles.push(join(__dirname, 'api', `${apiPath}.ts`));
  } else {
    // direct mapping without /api prefix
    const direct = pathname.slice(1) || 'index';
    tryFiles.push(join(__dirname, 'api', `${direct}.ts`));
  }

  for (const handlerPath of tryFiles) {
    try {
      const handler = await loadApiHandler(handlerPath);
      if (handler && typeof handler === 'function') {
        await handler(req, xres);
        return;
      }
    } catch (error) {
      console.error(`Erro ao executar handler para ${pathname}:`, error);
    }
  }

  xres.writeHead(404, { 'Content-Type': 'application/json' });
  (xres as any).json({ error: 'Rota não encontrada' });
});

server.listen(PORT, () => {
  console.log(`Dev server http://localhost:${PORT}`);
});

export default server;
