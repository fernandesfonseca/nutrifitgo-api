export async function readJson<T = any>(req: any): Promise<T> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  const raw = Buffer.concat(chunks).toString("utf8");
  if (!raw) return {} as T;
  return JSON.parse(raw);
}
