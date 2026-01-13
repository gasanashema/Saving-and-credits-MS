import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../../context/LanguageContext';
import { PhoneIcon, EnvelopeIcon, ChatBubbleLeftRightIcon, UserIcon, BellIcon } from '@heroicons/react/24/outline';
import Modal from '../../components/ui/Modal';
import { toast } from 'sonner';
import server from '../../utils/server';
import useMemberNotifications from '../../hooks/useMemberNotifications';

interface Admin {
  user_id: number;
  fullname: string;
  telephone: string;
  email: string;
}

const HelpCenter: React.FC = () => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('help');
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAdmin, setSelectedAdmin] = useState<Admin | null>(null);
  const [messageModalOpen, setMessageModalOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const { notifications, unreadCount, loading: notificationsLoading, markAsRead } = useMemberNotifications();

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      const response = await server.get('/users/admin/contacts');
      setAdmins(response.data);
    } catch (err) {
      console.error('Failed to fetch admins:', err);
      setError('Failed to load admin contacts');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAdmin || !message.trim()) return;

    setSending(true);
    try {
      // Use the chat system to send message to admin
      await server.post('/chat/send', {
        receiverType: 'admin',
        receiverId: selectedAdmin.user_id,
        message: message.trim()
      });

      toast.success('Message sent successfully!');
      setMessage('');
      setMessageModalOpen(false);
      setSelectedAdmin(null);
    } catch (err) {
      console.error('Failed to send message:', err);
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const openMessageModal = (admin: Admin) => {
    setSelectedAdmin(admin);
    setMessageModalOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600 dark:text-gray-300">Loading help center...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-red-500 text-center">
        {error}
      </div>
    );
  }

  const tabs = [
    { id: 'help', label: 'Help Center', icon: ChatBubbleLeftRightIcon },
    { id: 'notifications', label: 'Notifications', icon: BellIcon, count: unreadCount },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center">
          <ChatBubbleLeftRightIcon className="h-6 w-6 mr-2 text-blue-600" />
          Help Center
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          Contact our administrators and view notifications
        </p>
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
            {tab.count && tab.count > 0 && (
              <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1">
                {tab.count > 99 ? '99+' : tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Help Tab */}
      {activeTab === 'help' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {admins.map((admin) => (
          <motion.div
            key={admin.user_id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
          >
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                  <UserIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  {admin.fullname}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Administrator</p>
              </div>
            </div>

            <div className="space-y-3">
              {admin.telephone && (
                <div className="flex items-center text-sm">
                  <PhoneIcon className="h-4 w-4 text-gray-400 mr-2" />
                  <span className="text-gray-700 dark:text-gray-300">{admin.telephone}</span>
                </div>
              )}

              {admin.email && (
                <div className="flex items-center text-sm">
                  <EnvelopeIcon className="h-4 w-4 text-gray-400 mr-2" />
                  <span className="text-gray-700 dark:text-gray-300">{admin.email}</span>
                </div>
              )}
            </div>

            <div className="mt-6 flex space-x-3">
              {admin.telephone && (
                <a
                  href={`tel:${admin.telephone}`}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center justify-center"
                >
                  <PhoneIcon className="h-4 w-4 mr-2" />
                  Call
                </a>
              )}
              <button
                onClick={() => openMessageModal(admin)}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center justify-center"
              >
                <ChatBubbleLeftRightIcon className="h-4 w-4 mr-2" />
                Message
              </button>
            </div>
          </motion.div>
        ))}
        </div>
      )}

      {/* Notifications Tab */}
      {activeTab === 'notifications' && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          {notificationsLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-500 dark:text-gray-400">Loading notifications...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-8 text-center">
              <BellIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-2">
                No notifications
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                You have no notifications yet.
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
                  className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer ${!notification.is_read ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-1">
                        <BellIcon className="h-5 w-5 text-blue-500" />
                      </div>
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
                    </div>
                    <div className="flex items-center space-x-2">
                      {!notification.is_read && (
                        <button
                          onClick={() => markAsRead(notification.id)}
                          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                          title="Mark as read"
                        >
                          Mark as read
                        </button>
                      )}
                    </div>
                  </div>
                </motion.li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Message Modal */}
      <Modal
        isOpen={messageModalOpen}
        onClose={() => setMessageModalOpen(false)}
        title={`Send Message to ${selectedAdmin?.fullname}`}
      >
        <form onSubmit={handleSendMessage} className="space-y-4">
          <div>
            <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Your Message
            </label>
            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="Type your message here..."
              required
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-600">
            <button
              type="button"
              onClick={() => setMessageModalOpen(false)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={sending}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 flex items-center"
            >
              {sending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Sending...
                </>
              ) : (
                <>
                  <ChatBubbleLeftRightIcon className="h-4 w-4 mr-2" />
                  Send Message
                </>
              )}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default HelpCenter;