export function requireRole(role) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ ok:false, error:'No autenticado' });
    if (req.user.rol !== role) return res.status(403).json({ ok:false, error:'No autorizado' });
    next();
  };
}
