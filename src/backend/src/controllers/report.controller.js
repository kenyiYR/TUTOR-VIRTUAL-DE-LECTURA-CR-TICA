import Metric from "../models/Metric.js";

export async function getTeacherReminderReport(req, res) {
  try {
    const teacherId = req.userId;

    // Traemos solo métricas de tipo "reminder_sent"
    const metrics = await Metric.find({ kind: "reminder_sent" })
      .populate("user", "nombre email")
      .populate("reading", "titulo createdBy")
      .sort({ createdAt: 1 }) // cronológico
      .lean();

    // Filtramos solo las lecturas que pertenecen a este docente
    const ownMetrics = metrics.filter(
      (m) => m.reading && String(m.reading.createdBy) === String(teacherId)
    );

    // Agrupamos por (reading, user)
    const map = new Map();

    for (const m of ownMetrics) {
      const reading = m.reading;
      const user = m.user;

      if (!reading || !user) continue;

      const key = `${reading._id.toString()}|${user._id.toString()}`;

      if (!map.has(key)) {
        map.set(key, {
          readingId: reading._id.toString(),
          readingTitle: reading.titulo,
          studentId: user._id.toString(),
          studentName: user.nombre,
          studentEmail: user.email,
          remindersCount: 0,
          firstReminderAt: m.createdAt,
          lastReminderAt: m.createdAt,
        });
      }

      const entry = map.get(key);
      entry.remindersCount += 1;
      if (m.createdAt < entry.firstReminderAt) entry.firstReminderAt = m.createdAt;
      if (m.createdAt > entry.lastReminderAt) entry.lastReminderAt = m.createdAt;
    }

    const items = Array.from(map.values());

    return res.json({ ok: true, items });
  } catch (err) {
    req.log?.error?.({ err }, "Error generando reporte de recordatorios");
    return res.status(500).json({ ok: false, error: "Error interno" });
  }
}
