# NutriFitGo API (serverless)

API minimalista (Vercel Functions) com endpoints:
- GET /health
- POST /auth/login (Supabase Auth → JWT HS256)

## Rodando local

```bash
npm install
npm run dev
# Servidor em http://localhost:3006
```

Env vars (crie `.env.local`):
```
SUPABASE_URL=...
SUPABASE_ANON_KEY=...
JWT_SECRET=uma-chave-segura
CORS_ORIGINS=http://localhost:3000,http://localhost:3002,https://*.vercel.app,https://www.nutrifitgo.app
```

## Deploy (Vercel)
- Framework Preset: Other
- Root Directory: (projeto raiz)
- Node.js: 20.x
- Runtimes (Advanced): vazio
- Envs em Preview/Production conforme acima

