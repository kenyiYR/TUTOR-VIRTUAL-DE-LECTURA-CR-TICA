// src/frontend/services/reports.js
import { getToken } from "./auth.js";

const BASE =
  (typeof import.meta !== "undefined" &&
    import.meta.env &&
    import.meta.env.VITE_API_URL) ||
  process.env.VITE_API_URL ||
  "http://localhost:4000";

export async function getTeacherRemindersReport() {
  const r = await fetch(`${BASE}/api/reports/reminders/teacher`, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });

  const d = await r.json();
  if (!r.ok) {
    throw new Error(d.error || "No se pudo cargar el reporte de recordatorios");
  }

  const items = d.items || [];
  const totals =
    d.totals || {
      reminders: items.reduce((s, it) => s + (it.remindersCount || 0), 0),
      students: new Set(items.map((it) => it.studentId)).size,
      readings: new Set(items.map((it) => it.readingId)).size,
    };

  return { items, totals };
}
