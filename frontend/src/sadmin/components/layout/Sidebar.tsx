import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useLanguage } from "../../../context/LanguageContext";
import { useTheme } from "../../../context/ThemeContext";
import useUnreadChats from "../../../hooks/useUnreadChats";
import {
  HomeIcon,
  UsersIcon,
  BanknotesIcon,
  ArrowDownCircleIcon,
  ChartBarIcon,
  BellIcon,
  Cog6ToothIcon,
  XMarkIcon,
  CurrencyDollarIcon,
  ExclamationTriangleIcon,
  CubeIcon,
  WrenchScrewdriverIcon,
} from "@heroicons/react/24/outline";
interface SidebarProps {
  toggleSidebar: () => void;
}
const Sidebar: React.FC<SidebarProps> = ({ toggleSidebar }) => {
  const { t } = useLanguage();
  const { theme } = useTheme();

  const navItems = [
    {
      path: "/super-admin",
      name: t("dashboard"),
      icon: <HomeIcon className="w-6 h-6" />,
    },
    {
      path: "/super-admin/members",
      name: t("members"),
      icon: <UsersIcon className="w-6 h-6" />,
    },
    {
      path: "/super-admin/savings",
      name: t("savings"),
      icon: <CurrencyDollarIcon className="w-6 h-6" />,
    },
    {
      path: "/super-admin/loans",
      name: t("loans"),
      icon: <BanknotesIcon className="w-6 h-6" />,
    },
    {
      path: "/super-admin/loan-packages",
      name: "Loan Packages",
      icon: <CubeIcon className="w-6 h-6" />,
    },
    {
      path: "/super-admin/repayments",
      name: t("repayments"),
      icon: <ArrowDownCircleIcon className="w-6 h-6" />,
    },
    {
      path: "/super-admin/penalties",
      name: t("penalties"),
      icon: <ExclamationTriangleIcon className="w-6 h-6" />,
    },
    {
      path: "/super-admin/reports",
      name: t("reports"),
      icon: <ChartBarIcon className="w-6 h-6" />,
    },
    {
      path: "/super-admin/notifications",
      name: t("notifications"),
      icon: <BellIcon className="w-6 h-6" />,
    },
    {
      path: "/super-admin/utilities",
      name: "Utilities",
      icon: <WrenchScrewdriverIcon className="w-6 h-6" />,
    },
    {
      path: "/super-admin/settings",
      name: t("settings"),
      icon: <Cog6ToothIcon className="w-6 h-6" />,
    },
  ];
  return (
    <div
      className={`h-full w-64 flex-shrink-0 ${theme === "dark" ? "bg-gray-800 text-white" : "bg-white text-gray-800"} border-r border-gray-200 dark:border-gray-700 flex flex-col`}
    >
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-2">
          <div className="bg-emerald-600 text-white p-2 rounded-lg">
            <CurrencyDollarIcon className="w-6 h-6" />
          </div>
          <span className="text-xl font-bold">UnitySave</span>
        </div>
        <button
          onClick={toggleSidebar}
          className="md:hidden text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
        >
          <XMarkIcon className="w-6 h-6" />
        </button>
      </div>
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-3">
          {navItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                end
                className={({ isActive }) =>
                  `flex items-center px-4 py-3 rounded-lg transition-colors ${isActive ? "bg-emerald-500 text-white" : "hover:bg-gray-100 dark:hover:bg-gray-700"}`
                }
              >
                {item.icon}
                <span className="ml-3">{item.name}</span>
                {item.path === "/notifications" && (
                  <span className="ml-auto bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded-full">
                    3
                  </span>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};
export default Sidebar;
