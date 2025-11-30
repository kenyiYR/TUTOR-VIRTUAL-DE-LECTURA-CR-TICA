import Metric from "../models/Metric.js";

export async function createSystemMetric(req, res) {
  try {
    const { kind, userId, assignmentId, readingId, meta } = req.body;

    if (!kind) {
      return res
        .status(400)
        .json({ ok: false, error: "kind es obligatorio" });
    }

    const metric = await Metric.create({
      kind,
      user: userId || undefined,
      assignment: assignmentId || undefined,
      reading: readingId || undefined,
      meta,
      source: "n8n",
    });

    return res.status(201).json({ ok: true, metric });
  } catch (err) {
    req.log?.error?.({ err }, "Error creando métrica (system)");
    return res.status(500).json({ ok: false, error: "Error interno" });
  }
}

// Para reportes futuros, por ahora solo lo dejamos declarado
export async function listMetrics(req, res) {
  try {
    const docs = await Metric.find().sort({ createdAt: -1 }).limit(200);
    return res.json({ ok: true, metrics: docs });
  } catch (err) {
    req.log?.error?.({ err }, "Error listando métricas");
    return res.status(500).json({ ok: false, error: "Error interno" });
  }
}
