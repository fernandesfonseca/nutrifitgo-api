import { createServer } from 'http';
import { URL, fileURLToPath } from 'url';
import { readFile } from 'fs/promises';
import { join, extname } from 'path';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const PORT = process.env.PORT || 3000;

// Função para carregar e executar handlers da API
async function loadApiHandler(filepath: string) {
  try {
    const module = await import(filepath);
    return module.default || module;
  } catch (error) {
    console.error(`Erro ao carregar handler: ${filepath}`, error);
    return null;
  }
}

// Servidor de desenvolvimento simples
const server = createServer(async (req, res) => {
  const url = new URL(req.url || '/', `http://localhost:${PORT}`);
  
  // Configurar CORS para desenvolvimento
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // Mapear rotas da API
  const pathname = url.pathname;
  
  if (pathname.startsWith('/api/')) {
    const apiPath = pathname.slice(4); // Remove '/api' prefix
    const handlerPath = join(__dirname, 'api', `${apiPath}.ts`);
    
    try {
      const handler = await loadApiHandler(handlerPath);
      if (handler && typeof handler === 'function') {
        await handler(req, res);
        return;
      }
    } catch (error) {
      console.error(`Erro ao executar handler para ${pathname}:`, error);
    }
  }
  
  // Resposta padrão para rotas não encontradas
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Rota não encontrada' }));
});

server.listen(PORT, () => {
  console.log(`🚀 Servidor de desenvolvimento rodando em http://localhost:${PORT}`);
  console.log(`📁 Servindo APIs da pasta: ${join(__dirname, 'api')}`);
});

export default server;