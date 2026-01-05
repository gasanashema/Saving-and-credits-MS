import { useEffect, useState } from 'react';
import server from '../utils/server';
import { useAuth } from '../context/AuthContext';

export default function useUnreadChats() {
  const { user } = useAuth();
  const [unread, setUnread] = useState<number>(0);

  useEffect(() => {
    let mounted = true;
    const fetchUnread = async () => {
      if (!user || !user.id) return setUnread(0);
      const type = user.role === 'member' ? 'member' : 'admin';
      try {
        const res = await server.get(`/chat/unread/${type}/${user.id}`);
        if (mounted && res.data && res.data.unread != null) {
          const count = Number(res.data.unread);
          setUnread(Number.isNaN(count) ? 0 : count);
        }
      } catch (err) {
        console.error('Failed to fetch unread chats', err);
      }
    };

    fetchUnread();

    const onStorage = () => fetchUnread();
    window.addEventListener('storage', onStorage);
    const onChatsChanged = () => fetchUnread();
    window.addEventListener('chats:changed', onChatsChanged as any);

    return () => {
      mounted = false;
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('chats:changed', onChatsChanged as any);
    };
  }, [user]);

  return { unread, setUnread };
}
