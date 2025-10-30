import { applyCors } from "../_lib/cors";
import { readJson } from "../_lib/body";
import { createClient } from "@supabase/supabase-js";
import { SignJWT } from "jose";
import { z } from "zod";
const schema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
});
function supabase() {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_ANON_KEY;
    if (!url || !key)
        throw new Error("SUPABASE_URL/SUPABASE_ANON_KEY ausentes");
    return createClient(url, key, { auth: { persistSession: false } });
}
async function signJwt(payload) {
    const secret = process.env.JWT_SECRET;
    if (!secret)
        throw new Error("JWT_SECRET ausente");
    const enc = new TextEncoder().encode(secret);
    return new SignJWT(payload)
        .setProtectedHeader({ alg: "HS256" })
        .setIssuer("nutrifitgo")
        .setAudience("site")
        .setExpirationTime("15m")
        .sign(enc);
}
export default async function handler(req, res) {
    if (applyCors(req, res))
        return;
    if (req.method !== "POST") {
        res.status(405).json({ error: "Method Not Allowed" });
        return;
    }
    try {
        const body = await readJson(req);
        const { email, password } = schema.parse(body);
        const client = supabase();
        const { data, error } = await client.auth.signInWithPassword({ email, password });
        if (error || !data.user) {
            res.status(401).json({ error: "Invalid credentials" });
            return;
        }
        const accessToken = await signJwt({ sub: data.user.id, email: data.user.email });
        res.status(200).json({ accessToken, refreshToken: null, tokenType: "Bearer", expiresIn: 900 });
    }
    catch (e) {
        const msg = e?.issues ? "Validation error" : e?.message || "Unexpected error";
        res.status(400).json({ error: msg });
    }
}
