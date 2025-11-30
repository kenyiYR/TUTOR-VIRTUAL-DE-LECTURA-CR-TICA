import Notification from "../models/Notification.js";

export async function createSystemNotification(req, res) {
  try {
    const { userId, type, title, message, meta } = req.body;

    if (!userId || !type || !title || !message) {
      return res.status(400).json({
        ok: false,
        error: "userId, type, title y message son obligatorios",
      });
    }

    const notification = await Notification.create({
      user: userId,
      type,
      title,
      message,
      meta,
    });

    return res.status(201).json({ ok: true, notification });
  } catch (err) {
    req.log?.error?.({ err }, "Error creando notificación (system)");
    return res.status(500).json({ ok: false, error: "Error interno" });
  }
}

export async function listMyNotifications(req, res) {
  try {
    const notifications = await Notification.find({ user: req.userId })
      .sort({ createdAt: -1 })
      .limit(50);

    return res.json({ ok: true, notifications });
  } catch (err) {
    req.log?.error?.({ err }, "Error listando notificaciones");
    return res.status(500).json({ ok: false, error: "Error interno" });
  }
}

export async function markNotificationRead(req, res) {
  try {
    const { id } = req.params;

    const notification = await Notification.findOneAndUpdate(
      { _id: id, user: req.userId },
      { $set: { readAt: new Date() } },
      { new: true }
    );

    if (!notification) {
      return res
        .status(404)
        .json({ ok: false, error: "Notificación no encontrada" });
    }

    return res.json({ ok: true, notification });
  } catch (err) {
    req.log?.error?.({ err }, "Error marcando notificación como leída");
    return res.status(500).json({ ok: false, error: "Error interno" });
  }
}
