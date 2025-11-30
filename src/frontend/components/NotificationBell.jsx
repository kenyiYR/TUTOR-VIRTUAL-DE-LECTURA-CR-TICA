import { useEffect, useState } from "react";
import { Dropdown, Badge, Spinner } from "react-bootstrap";
import {
  listMyNotifications,
  markNotificationRead,
} from "../services/notifications.js";

function formatDate(value) {
  if (!value) return "";
  try {
    return new Date(value).toLocaleString("es-PE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return value;
  }
}

export default function NotificationBell() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const list = await listMyNotifications();
      // Seguridad extra: ordena de más reciente a más antiguo
      list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setItems(list);
    } catch (e) {
      console.error(e);
      setError("No se pudieron cargar las notificaciones");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const unreadCount = items.filter((n) => !n.readAt).length;

  async function handleMarkOne(id) {
    // Optimista: marcamos como leída en UI y después llamamos al backend
    const prev = items;
    const updated = prev.map((n) =>
      n._id === id ? { ...n, readAt: new Date().toISOString() } : n
    );
    setItems(updated);

    try {
      await markNotificationRead(id);
    } catch (e) {
      console.error(e);
      // Revertir si falla
      setItems(prev);
    }
  }

  return (
    <Dropdown align="end" className="notification-wrapper">
      <Dropdown.Toggle
        variant="outline-light"
        size="sm"
        className="notification-bell position-relative"
      >
        <span role="img" aria-label="Notificaciones">
          🔔
        </span>
        {unreadCount > 0 && (
          <Badge bg="danger" pill className="notification-badge">
            {unreadCount}
          </Badge>
        )}
      </Dropdown.Toggle>

      <Dropdown.Menu className="notification-menu">
        <div className="notification-menu-header">
          <strong>Notificaciones</strong>
          <div className="notification-menu-actions">
            {loading && <Spinner animation="border" size="sm" />}
            {!loading && (
              <button
                type="button"
                className="notification-refresh-btn"
                onClick={load}
              >
                Recargar
              </button>
            )}
          </div>
        </div>

        {error && (
          <div className="text-danger small px-3 py-1">{error}</div>
        )}

        {items.length === 0 && !loading && !error && (
          <div className="text-muted small px-3 py-2">
            No tienes notificaciones.
          </div>
        )}

        {items.map((n) => (
          <Dropdown.Item
            key={n._id}
            className={
              n.readAt
                ? "notification-item notification-item-read"
                : "notification-item notification-item-unread"
            }
            onClick={() => !n.readAt && handleMarkOne(n._id)}
          >
            <div className="notification-title">{n.title}</div>
            <div className="notification-message small">{n.message}</div>
            {n.createdAt && (
              <div className="notification-date small text-muted">
                {formatDate(n.createdAt)}
              </div>
            )}
          </Dropdown.Item>
        ))}
      </Dropdown.Menu>
    </Dropdown>
  );
}
