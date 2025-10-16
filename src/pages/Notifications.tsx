import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';
import { notifications } from '../utils/mockData';
import { BellIcon, CheckCircleIcon, ExclamationTriangleIcon, InformationCircleIcon, TrashIcon, EnvelopeOpenIcon, EnvelopeIcon } from '@heroicons/react/24/outline';
import { toast } from 'sonner';
interface Notification {
  id: number;
  title: string;
  message: string;
  date: string;
  read: boolean;
  type?: string;
}
const Notifications: React.FC = () => {
  const {
    t
  } = useLanguage();
  const [notificationsList, setNotificationsList] = useState<Notification[]>(notifications.map(n => ({
    ...n,
    type: n.title.toLowerCase().includes('loan') ? 'loan' : n.title.toLowerCase().includes('repayment') ? 'repayment' : n.title.toLowerCase().includes('member') ? 'member' : n.title.toLowerCase().includes('savings') ? 'savings' : 'system'
  })));
  const [activeFilter, setActiveFilter] = useState('all');
  const filteredNotifications = activeFilter === 'all' ? notificationsList : activeFilter === 'unread' ? notificationsList.filter(n => !n.read) : notificationsList.filter(n => n.type === activeFilter);
  const unreadCount = notificationsList.filter(n => !n.read).length;
  const markAsRead = (id: number) => {
    setNotificationsList(notificationsList.map(notification => notification.id === id ? {
      ...notification,
      read: true
    } : notification));
  };
  const markAllAsRead = () => {
    setNotificationsList(notificationsList.map(notification => ({
      ...notification,
      read: true
    })));
    toast.success(t('allMarkedAsRead'));
  };
  const deleteNotification = (id: number) => {
    setNotificationsList(notificationsList.filter(notification => notification.id !== id));
    toast.success(t('notificationDeleted'));
  };
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'loan':
        return <BellIcon className="h-5 w-5 text-amber-500" />;
      case 'repayment':
        return <BellIcon className="h-5 w-5 text-purple-500" />;
      case 'member':
        return <BellIcon className="h-5 w-5 text-blue-500" />;
      case 'savings':
        return <BellIcon className="h-5 w-5 text-emerald-500" />;
      default:
        return <BellIcon className="h-5 w-5 text-gray-500" />;
    }
  };
  return <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
            {t('notifications')}
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            {t('notificationsDescription')}
          </p>
        </div>
        {unreadCount > 0 && <button onClick={markAllAsRead} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center">
            <EnvelopeOpenIcon className="h-5 w-5 mr-2" />
            {t('markAllAsRead')}
          </button>}
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 flex flex-wrap gap-2">
        <button onClick={() => setActiveFilter('all')} className={`px-4 py-2 rounded-lg text-sm font-medium ${activeFilter === 'all' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}`}>
          {t('all')}
        </button>
        <button onClick={() => setActiveFilter('unread')} className={`px-4 py-2 rounded-lg text-sm font-medium ${activeFilter === 'unread' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}`}>
          {t('unread')} {unreadCount > 0 && `(${unreadCount})`}
        </button>
        <button onClick={() => setActiveFilter('loan')} className={`px-4 py-2 rounded-lg text-sm font-medium ${activeFilter === 'loan' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}`}>
          {t('loans')}
        </button>
        <button onClick={() => setActiveFilter('repayment')} className={`px-4 py-2 rounded-lg text-sm font-medium ${activeFilter === 'repayment' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}`}>
          {t('repayments')}
        </button>
        <button onClick={() => setActiveFilter('member')} className={`px-4 py-2 rounded-lg text-sm font-medium ${activeFilter === 'member' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}`}>
          {t('members')}
        </button>
        <button onClick={() => setActiveFilter('savings')} className={`px-4 py-2 rounded-lg text-sm font-medium ${activeFilter === 'savings' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}`}>
          {t('savings')}
        </button>
        <button onClick={() => setActiveFilter('system')} className={`px-4 py-2 rounded-lg text-sm font-medium ${activeFilter === 'system' ? 'bg-gray-300 text-gray-800 dark:bg-gray-600 dark:text-gray-200' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}`}>
          {t('system')}
        </button>
      </div>

      {/* Notifications List */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        {filteredNotifications.length === 0 ? <div className="p-8 text-center">
            <InformationCircleIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-2">
              {t('noNotifications')}
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              {activeFilter === 'all' ? t('noNotificationsMessage') : t('noFilteredNotificationsMessage')}
            </p>
          </div> : <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredNotifications.map(notification => <motion.li key={notification.id} initial={{
          opacity: 0
        }} animate={{
          opacity: 1
        }} transition={{
          duration: 0.3
        }} className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700 ${!notification.read ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.type || 'system')}
                    </div>
                    <div>
                      <div className="flex items-center">
                        <h3 className="text-sm font-medium text-gray-800 dark:text-white">
                          {notification.title}
                        </h3>
                        {!notification.read && <span className="ml-2 bg-blue-500 rounded-full w-2 h-2"></span>}
                      </div>
                      <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                        {notification.message}
                      </p>
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">
                        {new Date(notification.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    {!notification.read && <button onClick={() => markAsRead(notification.id)} className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300" title={t('markAsRead')}>
                        <EnvelopeOpenIcon className="h-5 w-5" />
                      </button>}
                    <button onClick={() => deleteNotification(notification.id)} className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300" title={t('delete')}>
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </motion.li>)}
          </ul>}
      </div>
    </div>;
};
export default Notifications;