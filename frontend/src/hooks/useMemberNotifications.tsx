import { useCallback, useEffect, useState } from "react";
import server from "../utils/server";
import { useAuth } from "../context/AuthContext";

export interface Notification {
  id: string;
  title: string;
  message: string;
  date: string;
  read: boolean;
  type: string;
}

export interface UseMemberNotificationsResult {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
}

/**
 * Fetch notifications for the current member from `notifications/`.
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
      const resp = await server.get(`/notifications/${user.id}`);
      const rawNotifications: any[] = Array.isArray(resp.data) ? resp.data : [];

      const normalized: Notification[] = rawNotifications.map((n: any) => ({
        id: String(n.id ?? ""),
        title: n.title ?? "",
        message: n.message ?? "",
        date: n.date ?? "",
        read: Boolean(n.read ?? false),
        type: n.type ?? "system",
      }));

      setNotifications(normalized);
    } catch (err) {
      console.error("useMemberNotifications error:", err);
      setError(err instanceof Error ? err.message : String(err));
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const markAsRead = useCallback(async (id: string) => {
    if (!user?.id) return;
    try {
      await server.put(`/notifications/${user.id}/${id}/read`);
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, read: true } : n)
      );
    } catch (err) {
      console.error("Mark as read error:", err);
    }
  }, [user?.id]);

  const markAllAsRead = useCallback(async () => {
    try {
      // Mark all locally for now
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (err) {
      console.error("Mark all as read error:", err);
    }
  }, []);

  useEffect(() => {
    if (user && user.id) {
      void fetchNotifications();
    }
  }, [fetchNotifications, user]);

  const unreadCount = notifications.filter(n => !n.read).length;

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