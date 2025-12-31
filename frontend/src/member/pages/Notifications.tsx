import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../../context/LanguageContext';
import { BellIcon, InformationCircleIcon, EnvelopeOpenIcon } from '@heroicons/react/24/outline';
import { toast } from 'sonner';
import useMemberNotifications from '../../hooks/useMemberNotifications';
import Modal from '../../components/ui/Modal';

const Notifications: React.FC = () => {
  const { t } = useLanguage();
  const { notifications: notificationsList, unreadCount, loading, error, markAsRead, markAllAsRead } = useMemberNotifications();
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedNotification, setSelectedNotification] = useState<any>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const filteredNotifications = activeFilter === 'all' ? notificationsList : notificationsList.filter(n => !n.is_read);

  const handleMarkAsRead = async (id: number) => {
    await markAsRead(id);
    toast.success(t('markedAsRead'));
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
    toast.success(t('allMarkedAsRead'));
  };

  const handleViewNotification = async (notification: any) => {
    setSelectedNotification(notification);
    setModalOpen(true);
    if (!notification.is_read) {
      await markAsRead(notification.id);
    }
  };

  if (loading) return <div className="p-4 text-gray-500">{t('loading')}</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
            {t('notifications')}
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Messages from admins
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center"
          >
            <EnvelopeOpenIcon className="h-5 w-5 mr-2" />
            {t('markAllAsRead')}
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 flex flex-wrap gap-2">
        <button
          onClick={() => setActiveFilter('all')}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${
            activeFilter === 'all'
              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
              : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
        >
          {t('all')}
        </button>
        <button
          onClick={() => setActiveFilter('unread')}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${
            activeFilter === 'unread'
              ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
              : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
        >
          {t('unread')} {unreadCount > 0 && `(${unreadCount})`}
        </button>
      </div>

      {/* Notifications List */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        {filteredNotifications.length === 0 ? (
          <div className="p-8 text-center">
            <InformationCircleIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-2">
              {t('noNotifications')}
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              {activeFilter === 'all' ? 'You have no messages yet.' : 'You have no unread messages.'}
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredNotifications.map(notification => (
              <motion.li
                key={notification.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer ${!notification.is_read ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
                onClick={() => handleViewNotification(notification)}
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
                  {!notification.is_read && (
                    <button
                      onClick={() => handleMarkAsRead(notification.id)}
                      className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                      title={t('markAsRead')}
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

      {/* Notification Detail Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={selectedNotification?.title || 'Notification'}
        size="lg"
      >
        {selectedNotification && (
          <div className="space-y-4">
            <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
              <BellIcon className="h-4 w-4" />
              <span>{new Date(selectedNotification.created_at).toLocaleString()}</span>
            </div>
            <div className="prose dark:prose-invert max-w-none">
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                {selectedNotification.message}
              </p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Notifications;