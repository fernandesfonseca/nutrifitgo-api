# NutriFitGo API (Serverless, sem Nest)

API mínima baseada em Vercel Functions. Cada rota em `api/` é uma Function independente.

- Root Directory (Vercel): `apps/api`
- Runtime: Node.js 20 (definido em `vercel.json`)
- Build: não requer build; TypeScript é transpiled pelo Vercel

## Rotas
- `GET /health` → status simples da API
- `POST /auth/login` → autenticação via Supabase, retorna JWT (HS256) para o frontend

## Variáveis de ambiente
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `JWT_SECRET`
- `CORS_ORIGINS` (opcional, CSV; default cobre localhost, *.vercel.app e www.nutrifitgo.app)

## Como publicar
1. No projeto Vercel `backend-nutrifitgo`, defina Root Directory = `apps/api`.
2. Configure as envs acima (Preview/Production).
3. Redeploy com "Clear build cache".

## Integração com os frontends
- Defina `NEXT_PUBLIC_BACKEND_URL` (site/web) para o domínio público da API.
- Ex.: `https://api.nutrifitgo.app`.
