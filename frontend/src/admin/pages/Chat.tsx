import React from 'react';
import ChatPanel from '../../components/admin/ChatPanel';
import { motion } from 'framer-motion';
import { useLanguage } from '../../context/LanguageContext';

const ChatPage: React.FC = () => {
  const { t } = useLanguage();
  return (
    <motion.div initial={{opacity:0}} animate={{opacity:1}} className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">{t('chat') || 'Chat'}</h1>
        <p className="text-gray-500 dark:text-gray-400">Send messages to admins, members, or groups</p>
      </div>
      <ChatPanel />
    </motion.div>
  );
};

export default ChatPage;
