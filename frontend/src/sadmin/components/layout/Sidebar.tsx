import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useLanguage } from '../../../context/LanguageContext';
import { useTheme } from '../../../context/ThemeContext';
import { HomeIcon, UsersIcon, BanknotesIcon, ArrowDownCircleIcon, ChartBarIcon, BellIcon, Cog6ToothIcon, XMarkIcon, CurrencyDollarIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
interface SidebarProps {
  toggleSidebar: () => void;
}
const Sidebar: React.FC<SidebarProps> = ({
  toggleSidebar
}) => {
  const {
    t
  } = useLanguage();
  const {
    theme
  } = useTheme();
  const navItems = [{
    path: '/admin',
    name: t('dashboard'),
    icon: <HomeIcon className="w-6 h-6" />
  }, {
    path: '/admin/members',
    name: t('members'),
    icon: <UsersIcon className="w-6 h-6" />
  }, {
    path: '/admin/savings',
    name: t('savings'),
    icon: <CurrencyDollarIcon className="w-6 h-6" />
  }, {
    path: '/admin/loans',
    name: t('loans'),
    icon: <BanknotesIcon className="w-6 h-6" />
  }, {
    path: '/admin/repayments',
    name: t('repayments'),
    icon: <ArrowDownCircleIcon className="w-6 h-6" />
  }, {
    path: '/admin/penalties',
    name: t('penalties'),
    icon: <ExclamationTriangleIcon className="w-6 h-6" />
  }, {
    path: '/admin/reports',
    name: t('reports'),
    icon: <ChartBarIcon className="w-6 h-6" />
  }, {
    path: '/admin/notifications',
    name: t('notifications'),
    icon: <BellIcon className="w-6 h-6" />
  }, {
    path: '/admin/settings',
    name: t('settings'),
    icon: <Cog6ToothIcon className="w-6 h-6" />
  }];
  return <div className={`h-full w-64 flex-shrink-0 ${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'} border-r border-gray-200 dark:border-gray-700 flex flex-col`}>
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-2">
          <div className="bg-emerald-600 text-white p-2 rounded-lg">
            <CurrencyDollarIcon className="w-6 h-6" />
          </div>
          <span className="text-xl font-bold">UnitySave</span>
        </div>
        <button onClick={toggleSidebar} className="md:hidden text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">
          <XMarkIcon className="w-6 h-6" />
        </button>
      </div>
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-3">
          {navItems.map(item => <li key={item.path}>
              <NavLink to={item.path} end className={({
            isActive
          }) => `flex items-center px-4 py-3 rounded-lg transition-colors ${isActive ? 'bg-emerald-500 text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}>
                {item.icon}
                <span className="ml-3">{item.name}</span>
                {item.path === '/notifications' && <span className="ml-auto bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded-full">
                    3
                  </span>}
              </NavLink>
            </li>)}
        </ul>
      </nav>
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg">
          <h4 className="font-medium text-blue-700 dark:text-blue-300">
            {t('needHelp')}
          </h4>
          <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
            {t('contactSupport')}
          </p>
          <button className="mt-3 w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition-colors">
            {t('supportCenter')}
          </button>
        </div>
      </div>
    </div>;
};
export default Sidebar;