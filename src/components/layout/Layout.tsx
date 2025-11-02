import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";

// Import role-specific components
import AdminSidebar from "../../admin/components/layout/Sidebar";
import AdminNavbar from "../../admin/components/layout/Navbar";
import MemberSidebar from "../../member/components/layout/Sidebar";
import MemberNavbar from "../../member/components/layout/Navbar";
const Layout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { theme } = useTheme();
  const { user } = useAuth();


  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };
  return (
    <div
      className={`flex h-screen overflow-hidden ${
        theme === "dark" ? "dark bg-gray-900" : "bg-gray-50"
      }`}
    >
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{
              x: -300,
            }}
            animate={{
              x: 0,
            }}
            exit={{
              x: -300,
            }}
            transition={{
              duration: 0.3,
            }}
            className="fixed inset-y-0 left-0 z-50 md:relative"
          >
            {user?.role === 'admin' ? (
              <AdminSidebar toggleSidebar={toggleSidebar} />
            ) : (
              <MemberSidebar toggleSidebar={toggleSidebar} />
            )}
          </motion.div>
        )}
      </AnimatePresence>
      <div className="flex flex-col flex-1 w-full overflow-hidden">
        {user?.role === 'admin' ? (
          <AdminNavbar toggleSidebar={toggleSidebar} sidebarOpen={sidebarOpen} />
        ) : (
          <MemberNavbar toggleSidebar={toggleSidebar} sidebarOpen={sidebarOpen} />
        )}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-gray-50 dark:bg-gray-900">
          <div className="container mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
export default Layout;
