import React, { useEffect, useState } from 'react';
import { PaperAirplaneIcon, UserGroupIcon, PlusIcon } from '@heroicons/react/24/outline';
import server from '../../utils/server';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import Modal from '../ui/Modal';
import { toast } from 'sonner';

const ChatPanel: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [admins, setAdmins] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);

  const [sendTab, setSendTab] = useState<'admin'|'member'|'group'>('admin');
  const [isSendOpen, setIsSendOpen] = useState(false);

  const [sendToAdminForm, setSendToAdminForm] = useState({ receiverId: '', title: '', message: '' });
  const [sendToMemberForm, setSendToMemberForm] = useState({ receiverId: '', title: '', message: '' });
  const [sendToGroupForm, setSendToGroupForm] = useState({ groupId: '', title: '', message: '' });

  const [groups, setGroups] = useState<any[]>([]);
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [groupForm, setGroupForm] = useState({ name: '', selectedMembers: [] as { type: 'admin'|'member', id: number }[] });

  // conversation modal state
  const [conversationOpen, setConversationOpen] = useState(false);
  const [conversationTarget, setConversationTarget] = useState<{ type: 'admin'|'member', id: number, name: string } | null>(null);
  const [conversationMessages, setConversationMessages] = useState<any[]>([]);
  const [conversationText, setConversationText] = useState('');

  const fetchConversation = async (type: 'admin'|'member', id: number) => {
    try {
      const res = await server.get(`/chat/with/${type}/${id}`);
      setConversationMessages(res.data || []);
    } catch (err) { console.error(err); }
  };

  const openConversation = (type: 'admin'|'member', id: number, name: string) => {
    setConversationTarget({ type, id, name });
    setConversationOpen(true);
    void fetchConversation(type, id);
  };

  const sendConversationMessage = async () => {
    if (!conversationTarget || !conversationText.trim()) return;
    try {
      await server.post('/chat/send', { receiverType: conversationTarget.type, receiverId: conversationTarget.id, message: conversationText.trim() });
      setConversationText('');
      void fetchConversation(conversationTarget.type, conversationTarget.id);
      window.dispatchEvent(new CustomEvent('chats:changed'));
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    fetchLists();
  }, []);

  const fetchLists = async () => {
    try {
      const [g, a, m] = await Promise.all([
        server.get('/notifications/groups'),
        server.get('/users'),
        server.get('/members')
      ]);
      setGroups(g.data || []);
      setAdmins((a.data || []).filter((x:any)=> x.role === 'admin' || x.role === 'supperadmin'));
      setMembers(m.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendToAdmin = async () => {
    if (!sendToAdminForm.receiverId || !sendToAdminForm.message) return toast.error('Fill all fields');
    try {
      await server.post('/chat/send', {
        receiverType: 'admin',
        receiverId: Number(sendToAdminForm.receiverId),
        message: sendToAdminForm.message
      });
      window.dispatchEvent(new CustomEvent('chats:changed'));
      toast.success('Sent');
      setIsSendOpen(false);
    } catch (err) { toast.error('Failed to send'); }
  };

  const handleSendToMember = async () => {
    if (!sendToMemberForm.receiverId || !sendToMemberForm.message) return toast.error('Fill all fields');
    try {
      await server.post('/chat/send', {
        receiverType: 'member',
        receiverId: Number(sendToMemberForm.receiverId),
        message: sendToMemberForm.message
      });
      window.dispatchEvent(new CustomEvent('chats:changed'));
      toast.success('Sent');
      setIsSendOpen(false);
    } catch (err) { toast.error('Failed to send'); }
  };

  const handleSendToGroup = async () => {
    if (!sendToGroupForm.groupId || !sendToGroupForm.message) return toast.error('Fill all fields');
    try {
      await server.post('/chat/group', { groupId: Number(sendToGroupForm.groupId), message: sendToGroupForm.message });
      window.dispatchEvent(new CustomEvent('chats:changed'));
      toast.success('Sent to group');
      setIsSendOpen(false);
    } catch (err) { toast.error('Failed to send'); }
  };

  const handleCreateGroup = async () => {
    if (!groupForm.name || groupForm.selectedMembers.length === 0) return toast.error('Provide name and members');
    try {
      await server.post('/notifications/groups', { name: groupForm.name, members: groupForm.selectedMembers });
      toast.success('Group created');
      setIsGroupModalOpen(false);
      fetchLists();
    } catch (err) { toast.error('Failed to create group'); }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">{t('chat') || 'Help Center'}</h2>
        <div className="flex items-center gap-2">
          <button onClick={()=> setIsGroupModalOpen(true)} className="px-3 py-2 bg-blue-600 text-white rounded-md flex items-center"><PlusIcon className="h-4 w-4 mr-2"/>Create Group</button>
          <button onClick={()=> setIsSendOpen(true)} className="px-3 py-2 bg-green-600 text-white rounded-md flex items-center"><PaperAirplaneIcon className="h-4 w-4 mr-2"/>Send</button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
        <h3 className="font-medium mb-2">Groups</h3>
        {groups.length === 0 ? <p className="text-sm text-gray-500">No groups</p> : (
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {groups.map(g => (
              <li key={g.id} className="py-2 flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium">{g.name}</div>
                  <div className="text-xs text-gray-500">Created {new Date(g.created_at).toLocaleDateString()}</div>
                </div>
                <div className="flex items-center space-x-2">
                  <button onClick={()=> { setSendTab('group'); setIsSendOpen(true); setSendToGroupForm(prev => ({...prev, groupId: String(g.id)})); }} className="text-blue-600">Message</button>
                  <button onClick={()=> { openConversation('member', Number(g.id), g.name); }} className="text-sm text-gray-500">View</button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Send Modal */}
      <Modal isOpen={isSendOpen} onClose={()=> setIsSendOpen(false)} title="Send Message">
        <div className="space-y-4">
          <div className="flex border-b border-gray-200 dark:border-gray-700">
            {['admin','member','group'].map((tab)=> (
              <button key={tab} onClick={()=> setSendTab(tab as any)} className={`px-4 py-2 text-sm ${sendTab===tab? 'border-b-2 border-blue-500 text-blue-600':'text-gray-500'}`}>To {tab}</button>
            ))}
          </div>

          {sendTab === 'admin' && (
            <div>
              <label className="block text-sm mb-1">Select Admin</label>
              <select value={sendToAdminForm.receiverId} onChange={e=> setSendToAdminForm({...sendToAdminForm, receiverId: e.target.value})} className="w-full px-3 py-2 border rounded">
                <option value="">Select</option>
                {admins.filter(a=> a.user_id !== user?.id).map(a=> <option key={a.user_id} value={a.user_id}>{a.fullname}</option>)}
              </select>
              <input className="w-full mt-2 px-3 py-2 border rounded" placeholder="Title" value={sendToAdminForm.title} onChange={e=> setSendToAdminForm({...sendToAdminForm, title: e.target.value})} />
              <textarea className="w-full mt-2 px-3 py-2 border rounded" rows={4} placeholder="Message" value={sendToAdminForm.message} onChange={e=> setSendToAdminForm({...sendToAdminForm, message: e.target.value})} />
              <div className="flex justify-between mt-2"><button onClick={()=> openConversation('admin', Number(sendToAdminForm.receiverId), 'Admin Conversation')} className="px-4 py-2 bg-gray-200 text-black rounded">Open</button><button onClick={handleSendToAdmin} className="px-4 py-2 bg-blue-600 text-white rounded">Send</button></div>
            </div>
          )}

          {sendTab === 'member' && (
            <div>
              <label className="block text-sm mb-1">Select Member</label>
              <select value={sendToMemberForm.receiverId} onChange={e=> setSendToMemberForm({...sendToMemberForm, receiverId: e.target.value})} className="w-full px-3 py-2 border rounded">
                <option value="">Select</option>
                {members.map(m=> <option key={m.id} value={m.id}>{m.firstName} {m.lastName} ({m.telephone})</option>)}
              </select>
              <input className="w-full mt-2 px-3 py-2 border rounded" placeholder="Title" value={sendToMemberForm.title} onChange={e=> setSendToMemberForm({...sendToMemberForm, title: e.target.value})} />
              <textarea className="w-full mt-2 px-3 py-2 border rounded" rows={4} placeholder="Message" value={sendToMemberForm.message} onChange={e=> setSendToMemberForm({...sendToMemberForm, message: e.target.value})} />
              <div className="flex justify-between mt-2"><button onClick={()=> openConversation('member', Number(sendToMemberForm.receiverId), 'Member Conversation')} className="px-4 py-2 bg-gray-200 text-black rounded">Open</button><button onClick={handleSendToMember} className="px-4 py-2 bg-blue-600 text-white rounded">Send</button></div>
            </div>
          )}

          {sendTab === 'group' && (
            <div>
              <label className="block text-sm mb-1">Select Group</label>
              <select value={sendToGroupForm.groupId} onChange={e=> setSendToGroupForm({...sendToGroupForm, groupId: e.target.value})} className="w-full px-3 py-2 border rounded">
                <option value="">Select</option>
                {groups.map(g=> <option key={g.id} value={g.id}>{g.name}</option>)}
              </select>
              <input className="w-full mt-2 px-3 py-2 border rounded" placeholder="Title" value={sendToGroupForm.title} onChange={e=> setSendToGroupForm({...sendToGroupForm, title: e.target.value})} />
              <textarea className="w-full mt-2 px-3 py-2 border rounded" rows={4} placeholder="Message" value={sendToGroupForm.message} onChange={e=> setSendToGroupForm({...sendToGroupForm, message: e.target.value})} />
              <div className="flex justify-between mt-2"><button onClick={()=> openConversation('member', Number(sendToGroupForm.groupId), 'Group Conversation')} className="px-4 py-2 bg-gray-200 text-black rounded">Open</button><button onClick={handleSendToGroup} className="px-4 py-2 bg-blue-600 text-white rounded">Send</button></div>
            </div>
          )}
        </div>
      </Modal>

      {/* Create Group Modal */}
      <Modal isOpen={isGroupModalOpen} onClose={()=> setIsGroupModalOpen(false)} title="Create Group">
        <div className="space-y-4">
          <input value={groupForm.name} onChange={e=> setGroupForm({...groupForm, name: e.target.value})} placeholder="Group name" className="w-full px-3 py-2 border rounded" />
          <div className="max-h-40 overflow-y-auto border rounded p-2">
            <div>
              <h4 className="text-sm font-medium">Admins</h4>
              {admins.map(a=> (
                <label key={a.user_id} className="flex items-center space-x-2"><input type="checkbox" checked={groupForm.selectedMembers.some(m=> m.type==='admin' && m.id===a.user_id)} onChange={e=> {
                  if (e.target.checked) setGroupForm({...groupForm, selectedMembers: [...groupForm.selectedMembers, {type:'admin', id: a.user_id}]});
                  else setGroupForm({...groupForm, selectedMembers: groupForm.selectedMembers.filter(m=> !(m.type==='admin' && m.id===a.user_id))});
                }} /> <span className="ml-2">{a.fullname}</span></label>
              ))}
            </div>
            <div className="mt-2">
              <h4 className="text-sm font-medium">Members</h4>
              {members.map(m=> (
                <label key={m.id} className="flex items-center space-x-2"><input type="checkbox" checked={groupForm.selectedMembers.some(s=> s.type==='member' && s.id===m.id)} onChange={e=> {
                  if (e.target.checked) setGroupForm({...groupForm, selectedMembers: [...groupForm.selectedMembers, {type:'member', id: m.id}]});
                  else setGroupForm({...groupForm, selectedMembers: groupForm.selectedMembers.filter(s=> !(s.type==='member' && s.id===m.id))});
                }} /> <span className="ml-2">{m.firstName} {m.lastName}</span></label>
              ))}
            </div>
          </div>
          <div className="flex justify-end"><button onClick={handleCreateGroup} className="px-4 py-2 bg-blue-600 text-white rounded">Create</button></div>
        </div>
      </Modal>

      {/* Conversation Modal */}
      <Modal isOpen={conversationOpen} onClose={()=> setConversationOpen(false)} title={conversationTarget?.name || 'Conversation'}>
        <div className="space-y-4">
          <div className="max-h-64 overflow-auto space-y-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
            {conversationMessages.map(m => {
              const isMine = m.sender_type === 'admin' && Number(m.sender_id) === Number(user?.id);
              return (
                <div key={m.id} className={`flex items-end gap-3 ${isMine ? 'justify-end' : 'justify-start'}`}>
                  {!isMine && <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs">{initials(conversationTarget?.name || 'MB')}</div>}
                  <div className={`p-3 max-w-[80%] ${isMine ? 'bg-emerald-600 text-white rounded-lg shadow-md rounded-br-none' : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg shadow-sm rounded-bl-none'}`}>
                    <div className="text-sm whitespace-pre-wrap">{m.message}</div>
                    <div className={`text-xs mt-1 ${isMine ? 'text-emerald-100' : 'text-gray-500 dark:text-gray-400'}`}>{new Date(m.created_at).toLocaleString()}</div>
                  </div>
                </div>
              );
            })}
          </div>
          <textarea value={conversationText} onChange={e=> setConversationText(e.target.value)} className="w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-600 rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-700" rows={3} />
          <div className="flex justify-end"><button onClick={sendConversationMessage} className="px-4 py-2 bg-blue-600 text-white rounded">Send</button></div>
        </div>
      </Modal>    </div>
  );
};

export default ChatPanel;
