import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { Bars3Icon, BellIcon, SunIcon, MoonIcon, ChevronDownIcon, UserCircleIcon, ArrowRightOnRectangleIcon, LanguageIcon } from '@heroicons/react/24/outline';
interface NavbarProps {
  toggleSidebar: () => void;
  sidebarOpen: boolean;
}
const Navbar: React.FC<NavbarProps> = ({
  toggleSidebar,
  sidebarOpen
}) => {
  const {
    user,
    logout
  } = useAuth();
  const {
    language,
    toggleLanguage,
    t
  } = useLanguage();
  const {
    theme,
    toggleTheme
  } = useTheme();
  const navigate = useNavigate();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  return <header className={`${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'} border-b border-gray-200 dark:border-gray-700`}>
      <div className="px-4 py-3 flex items-center justify-between">
        <div className="flex items-center">
          <button onClick={toggleSidebar} className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 focus:outline-none">
            <Bars3Icon className="h-6 w-6" />
          </button>
          <div className="ml-4 md:ml-6">
            <h1 className="text-xl font-semibold">
              {t('welcomeBack')}, {user?.name}
            </h1>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          {/* Language Toggle */}
          <button onClick={toggleLanguage} className="relative p-2 rounded-full text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">
            <LanguageIcon className="h-6 w-6" />
            <span className="absolute -top-1 -right-1 bg-emerald-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {language === 'en' ? 'EN' : 'RW'}
            </span>
          </button>
          {/* Theme Toggle */}
          <button onClick={toggleTheme} className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">
            {theme === 'dark' ? <SunIcon className="h-6 w-6" /> : <MoonIcon className="h-6 w-6" />}
          </button>
          {/* Notifications */}
          <div className="relative">
            <button onClick={() => setNotificationsOpen(!notificationsOpen)} className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">
              <BellIcon className="h-6 w-6" />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                3
              </span>
            </button>
            <AnimatePresence>
              {notificationsOpen && <motion.div initial={{
              opacity: 0,
              y: -10
            }} animate={{
              opacity: 1,
              y: 0
            }} exit={{
              opacity: 0,
              y: -10
            }} transition={{
              duration: 0.2
            }} className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden z-50 border border-gray-200 dark:border-gray-700">
                  <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold">
                      {t('notifications')}
                    </h3>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    <div className="p-3 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                      <div className="flex items-start">
                        <div className="flex-shrink-0 bg-blue-500 rounded-full p-2">
                          <BellIcon className="h-5 w-5 text-white" />
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium">Loan Approved</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Your loan request for $3,000 has been approved.
                          </p>
                          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                            2 hours ago
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="p-3 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                      <div className="flex items-start">
                        <div className="flex-shrink-0 bg-red-500 rounded-full p-2">
                          <BellIcon className="h-5 w-5 text-white" />
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium">Repayment Due</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Your loan repayment of $500 is due in 3 days.
                          </p>
                          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                            1 day ago
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="p-3 hover:bg-gray-50 dark:hover:bg-gray-700">
                      <div className="flex items-start">
                        <div className="flex-shrink-0 bg-green-500 rounded-full p-2">
                          <BellIcon className="h-5 w-5 text-white" />
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium">New Member</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Sarah Brown has joined the association.
                          </p>
                          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                            3 days ago
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="p-3 border-t border-gray-200 dark:border-gray-700 text-center">
                    <button className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm font-medium">
                      {t('viewAll')}
                    </button>
                  </div>
                </motion.div>}
            </AnimatePresence>
          </div>
          {/* User Menu */}
          <div className="relative">
            <button onClick={() => setUserMenuOpen(!userMenuOpen)} className="flex items-center space-x-2 rounded-full focus:outline-none">
              <img src={user?.avatar || 'https://ui-avatars.com/api/?name=User&background=0D8ABC&color=fff'} alt={user?.name || 'User'} className="h-9 w-9 rounded-full border-2 border-gray-200 dark:border-gray-700" />
              <ChevronDownIcon className="h-4 w-4 text-gray-500 dark:text-gray-400" />
            </button>
            <AnimatePresence>
              {userMenuOpen && <motion.div initial={{
              opacity: 0,
              y: -10
            }} animate={{
              opacity: 1,
              y: 0
            }} exit={{
              opacity: 0,
              y: -10
            }} transition={{
              duration: 0.2
            }} className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden z-50 border border-gray-200 dark:border-gray-700">
                  <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                    <p className="text-sm font-medium">{user?.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {user?.email}
                    </p>
                  </div>
                  <div className="py-1">
                    <button onClick={() => {
                  setUserMenuOpen(false);
                  navigate('/settings');
                }} className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                      <UserCircleIcon className="h-5 w-5 mr-2" />
                      {t('profile')}
                    </button>
                    <button onClick={handleLogout} className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                      <ArrowRightOnRectangleIcon className="h-5 w-5 mr-2" />
                      {t('logout')}
                    </button>
                  </div>
                </motion.div>}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>;
};
export default Navbar;