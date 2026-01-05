import { useEffect, useState } from 'react';
import server from '../utils/server';
import { useAuth } from '../context/AuthContext';

export default function useUnreadNotifications() {
  const { user } = useAuth();
  const [unread, setUnread] = useState<number>(0);

  useEffect(() => {
    let mounted = true;
    const fetchUnread = async () => {
      if (!user || !user.id) return setUnread(0);
      const type = user.role === 'member' ? 'member' : 'admin';
      try {
        const res = await server.get(`/notifications/unread/${type}/${user.id}`);
        if (mounted && res.data && res.data.unread != null) {
          // backend may return numeric strings; coerce to a number safely
          const count = Number(res.data.unread);
          setUnread(Number.isNaN(count) ? 0 : count);
        }
      } catch (err) {
        console.error('Failed to fetch unread notifications', err);
      }
    };

    fetchUnread();

    // listen for storage events (login/logout) and refetch when they occur
    const onStorage = () => fetchUnread();
    window.addEventListener('storage', onStorage);

    // also listen for internal notifications changes so same-window updates reflect immediately
    const onNotificationsChanged = () => fetchUnread();
    window.addEventListener('notifications:changed', onNotificationsChanged as EventListener);

    return () => {
      mounted = false;
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('notifications:changed', onNotificationsChanged as EventListener);
    };
  }, [user]);

  return { unread, setUnread };
}
