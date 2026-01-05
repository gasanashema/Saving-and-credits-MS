import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import { AnimatePresence, motion } from 'framer-motion';
import { useTheme } from '../../../context/ThemeContext';
const Layout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const {
    theme
  } = useTheme();
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };
  return <div className={`flex h-screen overflow-hidden ${theme === 'dark' ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
      <AnimatePresence>
        {sidebarOpen && <motion.div initial={{
        x: -300
      }} animate={{
        x: 0
      }} exit={{
        x: -300
      }} transition={{
        duration: 0.3
      }} className="fixed inset-y-0 left-0 z-50 md:relative">
            <Sidebar toggleSidebar={toggleSidebar} />
          </motion.div>}
      </AnimatePresence>
      <div className="flex flex-col flex-1 w-full overflow-hidden">
        <Navbar toggleSidebar={toggleSidebar} sidebarOpen={sidebarOpen} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-gray-50 dark:bg-gray-900">
          <div className="container mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>;
};
export default Layout;