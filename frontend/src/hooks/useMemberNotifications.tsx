import { useCallback, useEffect, useState } from "react";
import server from "../utils/server";
import { useAuth } from "../context/AuthContext";

export interface Notification {
  id: number;
  title: string;
  message: string;
  created_at: string;
  is_read: boolean;
}

export interface UseMemberNotificationsResult {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  markAsRead: (id: number) => Promise<void>;
  markAllAsRead: () => Promise<void>;
}

/**
 * Fetch notifications for the current member from `/notifications/member/:memberId`.
 */
export default function useMemberNotifications(): UseMemberNotificationsResult {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = useCallback(async () => {
    if (!user || !user.id) {
      setError("User not authenticated");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const resp = await server.get(`/notifications/member/${user.id}`);
      const rawNotifications: Notification[] = Array.isArray(resp.data) ? resp.data : [];

      setNotifications(rawNotifications);
    } catch (err) {
      console.error("useMemberNotifications error:", err);
      setError(err instanceof Error ? err.message : String(err));
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const markAsRead = useCallback(async (id: number) => {
    if (!user?.id) return;
    try {
      await server.put(`/notifications/read/${id}`);
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, is_read: true } : n)
      );
      // notify other parts of the app (including the unread hook) that notifications changed
      try { window.dispatchEvent(new CustomEvent('notifications:changed')); } catch (e) { /* ignore */ }
    } catch (err) {
      console.error("Mark as read error:", err);
    }
  }, [user?.id]);

  const markAllAsRead = useCallback(async () => {
    try {
      // Mark all locally for now, but ideally call a bulk update endpoint
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      try { window.dispatchEvent(new CustomEvent('notifications:changed')); } catch (e) { /* ignore */ }
    } catch (err) {
      console.error("Mark all as read error:", err);
    }
  }, []);

  useEffect(() => {
    if (user && user.id) {
      void fetchNotifications();
    }
  }, [fetchNotifications, user]);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return {
    notifications,
    unreadCount,
    loading,
    error,
    refresh: fetchNotifications,
    markAsRead,
    markAllAsRead,
  };
}