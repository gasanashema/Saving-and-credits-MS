import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../../context/LanguageContext';
import { toast } from 'sonner';
import server from '../../utils/server';
import useChats from '../../hooks/useChats';
import { useAuth } from '../../context/AuthContext';

const Chat: React.FC = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [partners, setPartners] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const { messages, loading, sendMessage, fetchConversation } = useChats(selected ? selected.partnerType : null, selected ? (selected.user_id ?? selected.id) : null);
  const [text, setText] = useState('');
  const messagesRef = useRef<HTMLDivElement | null>(null);

  const loadPartners = async () => {
    try {
      const res = await server.get('/chat/partners');
      setPartners(res.data || []);
    } catch (err) {
      console.error('Failed to load partners', err);
    }
  };

  useEffect(() => { void loadPartners(); }, []);

  // auto-scroll on messages change
  useEffect(() => {
    if (!messagesRef.current) return;
    messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
  }, [messages]);

  // refresh partners when chats change
  useEffect(() => {
    const onChange = () => loadPartners();
    window.addEventListener('chats:changed', onChange as any);
    return () => window.removeEventListener('chats:changed', onChange as any);
  }, []);

  const handleSelect = (p: any) => {
    setSelected(p);
    // fetch conversation is handled by useChats effect but ensure immediate fetch
    setTimeout(() => fetchConversation(), 50);
  };

  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!selected) return;
    if (!text.trim()) return;
    setSending(true);
    try {
      await sendMessage(selected.partnerType === 'admin' ? 'admin' : 'member', selected.user_id ?? selected.id, text.trim());
      setText('');
      // refresh messages and partners
      setTimeout(() => { fetchConversation(); window.dispatchEvent(new CustomEvent('chats:changed')); }, 200);
    } catch (err: any) {
      console.error(err);
      try { const msg = err?.response?.data?.error || err?.message || 'Failed to send message'; toast.error(msg); } catch(e){}
    } finally {
      setSending(false);
    }
  };

  const initials = (name: string) => name.split(' ').map(s => s[0]).slice(0,2).join('').toUpperCase();

  return (
    <motion.div initial={{opacity:0}} animate={{opacity:1}} className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">{t('chat') || 'Chat'}</h1>
        <p className="text-gray-500 dark:text-gray-400">{t('chatDescription') || 'Message with admins'}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[600px]">
        <div className="col-span-1 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-lg p-4 shadow">
          <h3 className="font-medium mb-3 text-gray-900 dark:text-gray-100">Admins</h3>
          <ul className="divide-y max-h-[520px] overflow-auto">
            {partners.length === 0 && <li className="text-sm text-gray-500 dark:text-gray-400 py-3">No conversations yet</li>}
            {partners.map(p => (
              <li key={(p.user_id ?? p.id)} onClick={() => handleSelect(p)} className={`py-3 px-2 cursor-pointer flex items-center gap-3 ${selected && (selected.user_id ?? selected.id) === (p.user_id ?? p.id) ? 'bg-gray-100 dark:bg-gray-800 rounded' : 'hover:bg-gray-50 dark:hover:bg-gray-800'}`}>
                <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center font-semibold">{initials(p.fullname)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium truncate text-gray-900 dark:text-gray-100">{p.fullname}</div>
                    {p.unreadCount > 0 && <span className="bg-indigo-600 text-white text-xs px-2 py-0.5 rounded">{p.unreadCount}</span>}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 truncate mt-1">{p.lastMessage ? p.lastMessage.message : 'No messages yet'}</div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="col-span-2 lg:col-span-2 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-lg p-4 shadow flex flex-col">
          {!selected ? (
            <div className="flex-1 flex items-center justify-center text-gray-500 dark:text-gray-400">Select an admin to start chatting</div>
          ) : (
            <>
              <div className="flex items-center justify-between border-b pb-3 mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center font-semibold">{initials(selected.fullname)}</div>
                  <div>
                    <div className="font-medium">{selected.fullname}</div>
                    <div className="text-xs text-gray-500">{selected.email ?? selected.telephone}</div>
                  </div>
                </div>
              </div>

              <div ref={messagesRef} className="flex-1 overflow-auto space-y-4 mb-3 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                {loading && <div className="text-sm text-gray-500 dark:text-gray-400">Loading messages...</div>}
                {!loading && messages.length === 0 && <div className="text-sm text-gray-500 dark:text-gray-400">No messages yet. Say hello 👋</div>}
                {!loading && messages.map(m => {
                  const isMine = m.sender_type === (user?.role === 'member' ? 'member' : 'admin') && Number(m.sender_id) === Number(user?.id);
                  return (
                    <div key={m.id} className={`flex items-end gap-3 ${isMine ? 'justify-end' : 'justify-start'}`}>
                      {!isMine && (
                        <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-semibold text-xs">{initials(selected?.fullname || 'AD')}</div>
                      )}

                      <div className={`max-w-[80%] p-3 ${isMine ? 'bg-emerald-600 text-white shadow-md rounded-lg rounded-br-none' : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm rounded-lg rounded-bl-none'} ${m.failed ? 'border border-red-400' : ''}`}>
                        <div className="text-sm whitespace-pre-wrap break-words">{m.message}</div>
                        <div className={`${isMine ? 'text-xs text-emerald-100' : 'text-xs text-gray-500 dark:text-gray-400'} mt-2 text-right`}>{new Date(m.created_at).toLocaleString()}</div>

                        {m.sending && <div className="text-xs text-yellow-100 mt-2">Sending...</div>}
                        {m.failed && isMine && (
                          <div className="mt-2 flex items-center gap-2">
                            <button onClick={async () => {
                              try {
                                await server.post('/chat/send', { receiverType: selected.partnerType === 'admin' ? 'admin' : 'member', receiverId: selected.user_id ?? selected.id, message: m.message });
                                await fetchConversation();
                                window.dispatchEvent(new CustomEvent('chats:changed'));
                                toast.success('Message sent');
                              } catch (err: any) {
                                console.error('retry error', err);
                                toast.error(err?.response?.data?.error || err?.message || 'Retry failed');
                              }
                            }} className="px-2 py-1 bg-white dark:bg-gray-800 border rounded text-sm text-red-600">Retry</button>
                            <div className="text-xs text-red-500">Failed to send</div>
                          </div>
                        )}
                      </div>

                      {isMine && <div className="w-6 flex items-end"><span className="text-xs text-gray-300 dark:text-gray-400">You</span></div>}
                    </div>
                  );
                })}
              </div>

              <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                <textarea value={text} onChange={e => setText(e.target.value)} onKeyDown={e => { if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); void handleSend(); } }} placeholder={`Message ${selected.fullname}...`} className="w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-600 rounded-lg p-3 resize-none focus:outline-none focus:ring-2 focus:ring-emerald-200 dark:focus:ring-emerald-700" rows={3} />
                <div className="flex items-center justify-between mt-2">
                  <div className="text-xs text-gray-500 dark:text-gray-400">Press Ctrl+Enter to send</div>
                  <div>
                    <button onClick={() => { setText(''); }} className="px-3 py-1 mr-2 border rounded text-sm">Clear</button>
                    <button disabled={sending} onClick={handleSend} className={`px-4 py-2 ${sending ? 'bg-gray-400' : 'bg-emerald-600 hover:bg-emerald-700'} text-white rounded shadow`}>{sending ? 'Sending...' : 'Send'}</button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default Chat;
