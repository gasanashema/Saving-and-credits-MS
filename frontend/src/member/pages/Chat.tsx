import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../../context/LanguageContext';
import server from '../../utils/server';
import useChats from '../../hooks/useChats';
import { useAuth } from '../../context/AuthContext';

const Chat: React.FC = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [admins, setAdmins] = useState<any[]>([]);
  const [selectedAdmin, setSelectedAdmin] = useState<any>(null);
  const { messages, loading, sendMessage, fetchConversation } = useChats(selectedAdmin ? 'admin' : null, selectedAdmin ? selectedAdmin.user_id : null);
  const [text, setText] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const res = await server.get('/users');
        setAdmins((res.data || []).filter((u: any) => u.role === 'admin' || u.role === 'supperadmin' || u.role === 'sadmin'));
      } catch (err) {
        console.error(err);
      }
    };
    load();
  }, []);

  const handleSend = async () => {
    if (!selectedAdmin || !text.trim()) return;
    try {
      await sendMessage('admin', selectedAdmin.user_id, text.trim());
      window.dispatchEvent(new CustomEvent('chats:changed'));
      setText('');
      // refresh conversation
      setTimeout(() => fetchConversation(), 300);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <motion.div initial={{opacity:0}} animate={{opacity:1}} className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">{t('chat') || 'Chat'}</h1>
        <p className="text-gray-500 dark:text-gray-400">{t('chatDescription') || 'Message with admins'}</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-1 bg-white dark:bg-gray-800 rounded-lg p-4">
          <h3 className="font-medium mb-2">Admins</h3>
          <ul className="divide-y">
            {admins.map(a => (
              <li key={a.user_id} className={`py-2 cursor-pointer ${selectedAdmin?.user_id === a.user_id ? 'bg-gray-100' : ''}`} onClick={() => setSelectedAdmin(a)}>
                <div className="text-sm font-medium">{a.fullname}</div>
                <div className="text-xs text-gray-500">{a.email}</div>
              </li>
            ))}
          </ul>
        </div>
        <div className="col-span-2 bg-white dark:bg-gray-800 rounded-lg p-4 flex flex-col">
          {!selectedAdmin ? (
            <div className="text-gray-500">Select an admin to start chatting</div>
          ) : (
            <>
              <div className="flex-1 overflow-auto space-y-2 mb-4">
                {loading ? <div>Loading...</div> : messages.map(m => (
                  <div key={m.id} className={`p-2 rounded ${m.sender_type === 'member' ? 'bg-emerald-100 self-end' : 'bg-gray-100 self-start'}`}>
                    <div className="text-sm">{m.message}</div>
                    <div className="text-xs text-gray-400">{new Date(m.created_at).toLocaleString()}</div>
                  </div>
                ))}
              </div>
              <div className="mt-auto">
                <textarea value={text} onChange={e => setText(e.target.value)} className="w-full border rounded p-2" rows={3} />
                <div className="flex justify-end mt-2"><button onClick={handleSend} className="px-4 py-2 bg-blue-600 text-white rounded">Send</button></div>
              </div>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default Chat;
