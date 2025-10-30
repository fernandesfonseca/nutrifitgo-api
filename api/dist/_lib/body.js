export async function readJson(req) {
    const chunks = [];
    for await (const chunk of req)
        chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    const raw = Buffer.concat(chunks).toString("utf8");
    if (!raw)
        return {};
    return JSON.parse(raw);
}
