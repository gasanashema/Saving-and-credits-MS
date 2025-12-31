import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../../context/LanguageContext';
import { BellIcon, CheckCircleIcon, ExclamationTriangleIcon, InformationCircleIcon, TrashIcon, EnvelopeOpenIcon, EnvelopeIcon, PlusIcon, UserGroupIcon, PaperAirplaneIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { toast } from 'sonner';
import server from '../../utils/server';
import Modal from '../../components/ui/Modal';
import { useAuth } from '../../context/AuthContext';

interface Notification {
  id: number;
  title: string;
  message: string;
  created_at: string;
  is_read: boolean;
}

interface Group {
  id: number;
  name: string;
  created_at: string;
}

const Notifications: React.FC = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('inbox');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [admins, setAdmins] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Send forms
  const [sendToAdminForm, setSendToAdminForm] = useState({ receiverId: '', title: '', message: '' });
  const [sendToMemberForm, setSendToMemberForm] = useState({ receiverId: '', title: '', message: '' });
  const [sendToGroupForm, setSendToGroupForm] = useState({ groupId: '', title: '', message: '' });

  // Group creation
  const [groupForm, setGroupForm] = useState({ name: '', selectedMembers: [] as { type: 'admin' | 'member', id: number }[] });

  // View group members
  const [viewMembersGroup, setViewMembersGroup] = useState<Group | null>(null);
  const [groupMembers, setGroupMembers] = useState<any[]>([]);

  // Modals
  const [isSendModalOpen, setIsSendModalOpen] = useState(false);
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [isViewMembersModalOpen, setIsViewMembersModalOpen] = useState(false);
  const [sendTab, setSendTab] = useState('admin');

  useEffect(() => {
    if (user?.id) {
      fetchNotifications();
    }
    fetchGroups();
    fetchAdmins();
    fetchMembers();
  }, [user]);

  const fetchNotifications = async () => {
    try {
      const res = await server.get(`/notifications/admin/${user?.id}`);
      setNotifications(res.data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const fetchGroups = async () => {
    try {
      const res = await server.get('/notifications/groups');
      setGroups(res.data);
    } catch (error) {
      console.error('Error fetching groups:', error);
    }
  };

  const fetchAdmins = async () => {
    try {
      const res = await server.get('/users'); // Assuming there's a users endpoint
      setAdmins(res.data.filter((u: any) => u.role === 'admin' || u.role === 'supperadmin'));
    } catch (error) {
      console.error('Error fetching admins:', error);
    }
  };

  const fetchMembers = async () => {
    try {
      const res = await server.get('/members');
      setMembers(res.data);
    } catch (error) {
      console.error('Error fetching members:', error);
    }
  };

  const markAsRead = async (id: number) => {
    try {
      await server.put(`/notifications/read/${id}`);
      setNotifications(notifications.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch (error) {
      toast.error('Failed to mark as read');
    }
  };

  const handleSendToAdmin = async () => {
    if (!sendToAdminForm.receiverId || !sendToAdminForm.title || !sendToAdminForm.message) {
      toast.error('All fields are required');
      return;
    }
    setLoading(true);
    try {
      await server.post('/notifications/admin-to-admin', sendToAdminForm);
      toast.success('Message sent successfully');
      setSendToAdminForm({ receiverId: '', title: '', message: '' });
      setIsSendModalOpen(false);
    } catch (error) {
      toast.error('Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  const handleSendToMember = async () => {
    if (!sendToMemberForm.receiverId || !sendToMemberForm.title || !sendToMemberForm.message) {
      toast.error('All fields are required');
      return;
    }
    setLoading(true);
    try {
      await server.post('/notifications/admin-to-member', sendToMemberForm);
      toast.success('Message sent successfully');
      setSendToMemberForm({ receiverId: '', title: '', message: '' });
      setIsSendModalOpen(false);
    } catch (error) {
      toast.error('Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  const handleSendToGroup = async () => {
    if (!sendToGroupForm.groupId || !sendToGroupForm.title || !sendToGroupForm.message) {
      toast.error('All fields are required');
      return;
    }
    setLoading(true);
    try {
      await server.post('/notifications/group', sendToGroupForm);
      toast.success('Message sent to group successfully');
      setSendToGroupForm({ groupId: '', title: '', message: '' });
      setIsSendModalOpen(false);
    } catch (error) {
      toast.error('Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGroup = async () => {
    if (!groupForm.name || groupForm.selectedMembers.length === 0) {
      toast.error('Group name and members are required');
      return;
    }
    setLoading(true);
    try {
      await server.post('/notifications/groups', {
        name: groupForm.name,
        members: groupForm.selectedMembers
      });
      toast.success('Group created successfully');
      setGroupForm({ name: '', selectedMembers: [] });
      setIsGroupModalOpen(false);
      fetchGroups();
    } catch (error) {
      toast.error('Failed to create group');
    } finally {
      setLoading(false);
    }
  };

  const handleViewGroupMembers = async (group: Group) => {
    setLoading(true);
    try {
      const res = await server.get(`/notifications/groups/${group.id}/members`);
      setGroupMembers(res.data);
      setViewMembersGroup(group);
      setIsViewMembersModalOpen(true);
    } catch (error) {
      toast.error('Failed to load group members');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMember = async (member: any) => {
    if (!viewMembersGroup) return;

    setLoading(true);
    try {
      await server.delete(`/notifications/groups/${viewMembersGroup.id}/members`, {
        data: {
          recipientType: member.recipient_type,
          recipientId: member.recipient_id
        }
      });
      toast.success('Member removed from group');
      // Refresh the members list
      const res = await server.get(`/notifications/groups/${viewMembersGroup.id}/members`);
      setGroupMembers(res.data);
    } catch (error) {
      toast.error('Failed to remove member');
    } finally {
      setLoading(false);
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const tabs = [
    { id: 'inbox', label: 'Inbox', icon: BellIcon },
    { id: 'send', label: 'Send Message', icon: PaperAirplaneIcon },
    { id: 'groups', label: 'Groups', icon: UserGroupIcon },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
            Notifications
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Manage messages and groups
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-1 flex">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium flex items-center justify-center space-x-2 ${
              activeTab === tab.id
                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <tab.icon className="h-4 w-4" />
            <span>{tab.label}</span>
            {tab.id === 'inbox' && unreadCount > 0 && (
              <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1">
                {unreadCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Inbox Tab */}
      {activeTab === 'inbox' && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          {notifications.length === 0 ? (
            <div className="p-8 text-center">
              <InformationCircleIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-2">
                No messages
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                You have no messages yet.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
              {notifications.map(notification => (
                <motion.li
                  key={notification.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700 ${!notification.is_read ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center">
                        <h3 className="text-sm font-medium text-gray-800 dark:text-white">
                          {notification.title}
                        </h3>
                        {!notification.is_read && <span className="ml-2 bg-blue-500 rounded-full w-2 h-2"></span>}
                      </div>
                      <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                        {notification.message}
                      </p>
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">
                        {new Date(notification.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    {!notification.is_read && (
                      <button
                        onClick={() => markAsRead(notification.id)}
                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                        title="Mark as read"
                      >
                        <EnvelopeOpenIcon className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                </motion.li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Send Message Tab */}
      {activeTab === 'send' && (
        <div className="space-y-4">
          <button
            onClick={() => setIsSendModalOpen(true)}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Send New Message
          </button>
        </div>
      )}

      {/* Groups Tab */}
      {activeTab === 'groups' && (
        <div className="space-y-4">
          <button
            onClick={() => setIsGroupModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Create Group
          </button>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            {groups.length === 0 ? (
              <div className="p-8 text-center">
                <InformationCircleIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-2">
                  No groups
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Create your first notification group.
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                {groups.map(group => (
                  <li key={group.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-medium text-gray-800 dark:text-white">
                          {group.name}
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-500">
                          Created {new Date(group.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <button
                        onClick={() => handleViewGroupMembers(group)}
                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        View Members
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {/* Send Message Modal */}
      <Modal isOpen={isSendModalOpen} onClose={() => setIsSendModalOpen(false)} title="Send Message">
        <div className="space-y-4">
          {/* Tabs for send type */}
          <div className="flex border-b border-gray-200 dark:border-gray-700">
            {['admin', 'member', 'group'].map(type => (
              <button
                key={type}
                onClick={() => setSendTab(type)}
                className={`px-4 py-2 text-sm font-medium ${
                  sendTab === type
                    ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'text-gray-500 dark:text-gray-400'
                }`}
              >
                To {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>

          {sendTab === 'admin' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Select Admin
                </label>
                <select
                  value={sendToAdminForm.receiverId}
                  onChange={(e) => setSendToAdminForm({ ...sendToAdminForm, receiverId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                >
                  <option value="">Select Admin</option>
                  {admins.filter(a => a.user_id !== user?.id).map((admin: any) => (
                    <option key={admin.user_id} value={admin.user_id}>
                      {admin.fullname}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={sendToAdminForm.title}
                  onChange={(e) => setSendToAdminForm({ ...sendToAdminForm, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="Message title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Message
                </label>
                <textarea
                  value={sendToAdminForm.message}
                  onChange={(e) => setSendToAdminForm({ ...sendToAdminForm, message: e.target.value })}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="Message content"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => setIsSendModalOpen(false)}
                  className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendToAdmin}
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50"
                >
                  {loading ? 'Sending...' : 'Send'}
                </button>
              </div>
            </div>
          )}

          {sendTab === 'member' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Select Member
                </label>
                <select
                  value={sendToMemberForm.receiverId}
                  onChange={(e) => setSendToMemberForm({ ...sendToMemberForm, receiverId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                >
                  <option value="">Select Member</option>
                  {members.map((member: any) => (
                    <option key={member.id} value={member.id}>
                      {member.firstName} {member.lastName} ({member.telephone})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={sendToMemberForm.title}
                  onChange={(e) => setSendToMemberForm({ ...sendToMemberForm, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="Message title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Message
                </label>
                <textarea
                  value={sendToMemberForm.message}
                  onChange={(e) => setSendToMemberForm({ ...sendToMemberForm, message: e.target.value })}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="Message content"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => setIsSendModalOpen(false)}
                  className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendToMember}
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50"
                >
                  {loading ? 'Sending...' : 'Send'}
                </button>
              </div>
            </div>
          )}

          {sendTab === 'group' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Select Group
                </label>
                <select
                  value={sendToGroupForm.groupId}
                  onChange={(e) => setSendToGroupForm({ ...sendToGroupForm, groupId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                >
                  <option value="">Select Group</option>
                  {groups.map((group: Group) => (
                    <option key={group.id} value={group.id}>
                      {group.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={sendToGroupForm.title}
                  onChange={(e) => setSendToGroupForm({ ...sendToGroupForm, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="Message title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Message
                </label>
                <textarea
                  value={sendToGroupForm.message}
                  onChange={(e) => setSendToGroupForm({ ...sendToGroupForm, message: e.target.value })}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="Message content"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => setIsSendModalOpen(false)}
                  className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendToGroup}
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50"
                >
                  {loading ? 'Sending...' : 'Send'}
                </button>
              </div>
            </div>
          )}
        </div>
      </Modal>

      {/* Create Group Modal */}
      <Modal isOpen={isGroupModalOpen} onClose={() => setIsGroupModalOpen(false)} title="Create Notification Group">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Group Name
            </label>
            <input
              type="text"
              value={groupForm.name}
              onChange={(e) => setGroupForm({ ...groupForm, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              placeholder="Group name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Select Members
            </label>
            <div className="max-h-40 overflow-y-auto border border-gray-300 dark:border-gray-600 rounded-lg p-2">
              <div className="space-y-2">
                <div>
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Admins</h4>
                  {admins.map((admin: any) => (
                    <label key={admin.user_id} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={groupForm.selectedMembers.some(m => m.type === 'admin' && m.id === admin.user_id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setGroupForm({
                              ...groupForm,
                              selectedMembers: [...groupForm.selectedMembers, { type: 'admin', id: admin.user_id }]
                            });
                          } else {
                            setGroupForm({
                              ...groupForm,
                              selectedMembers: groupForm.selectedMembers.filter(m => !(m.type === 'admin' && m.id === admin.user_id))
                            });
                          }
                        }}
                        className="rounded"
                      />
                      <span className="text-sm text-gray-900 dark:text-white">{admin.fullname}</span>
                    </label>
                  ))}
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Members</h4>
                  {members.map((member: any) => (
                    <label key={member.id} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={groupForm.selectedMembers.some(m => m.type === 'member' && m.id === member.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setGroupForm({
                              ...groupForm,
                              selectedMembers: [...groupForm.selectedMembers, { type: 'member', id: member.id }]
                            });
                          } else {
                            setGroupForm({
                              ...groupForm,
                              selectedMembers: groupForm.selectedMembers.filter(m => !(m.type === 'member' && m.id === member.id))
                            });
                          }
                        }}
                        className="rounded"
                      />
                      <span className="text-sm text-gray-900 dark:text-white">{member.firstName} {member.lastName}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <button
              onClick={() => setIsGroupModalOpen(false)}
              className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateGroup}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Group'}
            </button>
          </div>
        </div>
      </Modal>

      {/* View Group Members Modal */}
      <Modal
        isOpen={isViewMembersModalOpen}
        onClose={() => setIsViewMembersModalOpen(false)}
        title={`Members of ${viewMembersGroup?.name || 'Group'}`}
      >
        <div className="space-y-4">
          {groupMembers.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-center">No members in this group</p>
          ) : (
            <div className="max-h-60 overflow-y-auto">
              <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                {groupMembers.map((member, index) => (
                  <li key={index} className="py-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {member.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                          {member.recipient_type}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          member.recipient_type === 'admin'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
                            : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                        }`}>
                          {member.recipient_type}
                        </span>
                        <button
                          onClick={() => handleRemoveMember(member)}
                          disabled={loading}
                          className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 disabled:opacity-50"
                          title="Remove from group"
                        >
                          <XMarkIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div className="flex justify-end">
            <button
              onClick={() => setIsViewMembersModalOpen(false)}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg"
            >
              Close
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Notifications;