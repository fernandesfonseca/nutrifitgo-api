import { applyCors } from "./_lib/cors";

export default async function handler(req: any, res: any) {
  if (applyCors(req, res)) return;
  if (req.method !== "GET") {
    res.status(405).json({ error: "Method Not Allowed" });
    return;
  }
  res.status(200).json({ ok: true, service: "NutriFitGo API (serverless)", ts: new Date().toISOString() });
}
