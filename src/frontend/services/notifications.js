import { getToken } from "./auth.js";

const BASE =
  (typeof import.meta !== "undefined" &&
    import.meta.env &&
    import.meta.env.VITE_API_URL) ||
  process.env.VITE_API_URL ||
  "http://localhost:4000";

const H = (t) => ({
  "Content-Type": "application/json",
  ...(t ? { Authorization: `Bearer ${t}` } : {}),
});

export async function listMyNotifications() {
  const r = await fetch(`${BASE}/api/notifications/my`, {
    headers: H(getToken()),
  });

  const data = await r.json();
  if (!r.ok) throw new Error(data.error || "No se pudieron obtener las notificaciones");

  return data.notifications || [];
}

export async function markNotificationRead(id) {
  const r = await fetch(`${BASE}/api/notifications/${id}/read`, {
    method: "PATCH",
    headers: H(getToken()),
  });

  const data = await r.json();
  if (!r.ok) throw new Error(data.error || "No se pudo marcar como leída");

  return data.notification || data;
}
