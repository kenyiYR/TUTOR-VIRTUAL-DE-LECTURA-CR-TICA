import "dotenv/config";

export function systemAuth(req, res, next) {
  const headerKey = req.headers["x-system-api-key"];
  const queryKey = req.query.apikey;
  const key = headerKey || queryKey;

  if (!process.env.SYSTEM_API_KEY) {
    return res
      .status(500)
      .json({ ok: false, error: "SYSTEM_API_KEY no configurada" });
  }

  if (!key || key !== process.env.SYSTEM_API_KEY) {
    return res
      .status(401)
      .json({ ok: false, error: "Cliente de sistema no autorizado" });
  }

  next();
}
