import { useCallback, useEffect, useState } from 'react';
import server from '../utils/server';
import { useAuth } from '../context/AuthContext';

export interface ChatMessage {
  id: number;
  sender_type: 'admin'|'member';
  sender_id: number;
  receiver_type: 'admin'|'member';
  receiver_id: number;
  message: string;
  is_read: boolean;
  created_at: string;
}

export default function useChats(otherType: 'admin'|'member'|null, otherId: number|null) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchConversation = useCallback(async () => {
    if (!user || !user.id || !otherType || otherId == null) return;
    setLoading(true);
    try {
      const resp = await server.get(`/chat/with/${otherType}/${otherId}`);
      const msgs = resp.data || [];
      setMessages(msgs);

      // mark any unread messages addressed to current user as read
      const myType = user?.role === 'member' ? 'member' : 'admin';
      const myId = user?.id;
      const toMark = msgs.filter((m: any) => m.receiver_type === myType && Number(m.receiver_id) === Number(myId) && !m.is_read);
      await Promise.all(toMark.map((m: any) => server.put(`/chat/read/${m.id}`)));
      if (toMark.length > 0) try { window.dispatchEvent(new CustomEvent('chats:changed')); } catch(e){}
    } catch (err) {
      console.error('useChats fetch error', err);
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, [user, otherType, otherId]);

  useEffect(() => {
    fetchConversation();
  }, [fetchConversation]);

  const sendMessage = useCallback(async (receiverType: 'admin'|'member', receiverId: number, message: string) => {
    // optimistic append with temporary id
    const optimistic = { id: Date.now(), sender_type: user?.role === 'member' ? 'member' : 'admin', sender_id: user?.id || 0, receiver_type: receiverType, receiver_id: receiverId, message, is_read: false, created_at: new Date().toISOString(), sending: true } as any;
    setMessages(prev => [...prev, optimistic]);
    try {
      const resp = await server.post('/chat/send', { receiverType, receiverId, message });
      const serverChat = resp?.data?.chat || (resp?.data?.id ? { id: resp.data.id, sender_type: optimistic.sender_type, sender_id: optimistic.sender_id, receiver_type: receiverType, receiver_id: receiverId, message, is_read: false, created_at: new Date().toISOString() } : null);
      if (serverChat && serverChat.id) {
        setMessages(prev => prev.map(m => (m.id === optimistic.id ? serverChat : m)));
      } else {
        setMessages(prev => prev.map(m => (m.id === optimistic.id ? { ...m, sending: false } : m)));
      }
      try { window.dispatchEvent(new CustomEvent('chats:changed')); } catch(e){}
      return resp.data;
    } catch (err) {
      console.error('sendMessage error', err);
      setMessages(prev => prev.map(m => (m.id === optimistic.id ? { ...m, failed: true, sending: false } : m)));
      throw err;
    }
  }, [user]);

  const markMessageRead = useCallback(async (messageId: number) => {
    try {
      await server.put(`/chat/read/${messageId}`);
      setMessages(prev => prev.map(m => m.id === messageId ? { ...m, is_read: true } : m));
    } catch (err) {
      console.error('markMessageRead error', err);
    }
  }, []);

  return { messages, loading, error, fetchConversation, sendMessage, markMessageRead };
}
