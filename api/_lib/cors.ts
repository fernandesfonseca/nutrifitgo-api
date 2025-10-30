export const allowOrigin = (origin?: string) => {
  const allowed = (process.env.CORS_ORIGINS ||
    "http://localhost:3000,http://localhost:3002,https://*.vercel.app,https://www.nutrifitgo.app")
    .split(",")
    .map((s) => s.trim());
  if (!origin) return "*";
  const ok = allowed.some((pat) => {
    if (pat.includes("*")) {
      const re = new RegExp("^" + pat.replace(/\./g, "\\.").replace(/\*/g, ".*") + "$");
      return re.test(origin);
    }
    return pat === origin;
  });
  return ok ? origin : allowed[0] || "*";
};

export function applyCors(req: any, res: any) {
  const origin = req.headers?.origin;
  res.setHeader("Access-Control-Allow-Origin", allowOrigin(origin));
  res.setHeader("Vary", "Origin");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET,POST,PUT,PATCH,DELETE,OPTIONS"
  );
  if (req.method === "OPTIONS") {
    res.statusCode = 204;
    res.end();
    return true;
  }
  return false;
}
