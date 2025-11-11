import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import { LanguageProvider } from "./context/LanguageContext";
import { AuthProvider } from "./context/AuthContext";
import { Toaster } from "sonner";

import Login from "./pages/Login";
import Logout from "./pages/Logout";
import NotFound from "./pages/NotFound";
import LandingPage from "./pages/LandingPage";
import Layout from "./components/layout/Layout";
import ProtectedRoute from "./components/auth/ProtectedRoute";

// Admin pages
import AdminDashboard from "./admin/pages/Dashboard";
import AdminMembers from "./admin/pages/Members";
import AdminSavings from "./admin/pages/Savings";
import AdminLoans from "./admin/pages/Loans";
import AdminRepayments from "./admin/pages/Repayments";
import AdminPenalties from "./admin/pages/Penalties";
import AdminReports from "./admin/pages/Reports";
import AdminNotifications from "./admin/pages/Notifications";
import AdminSettings from "./admin/pages/Settings";

// Member pages
import MemberDashboard from "./member/pages/Dashboard";

import MemberSavings from "./member/pages/Savings";
import MemberLoans from "./member/pages/Loans";
import MemberRepayments from "./member/pages/Repayments";
import MemberPenalties from "./member/pages/Penalties";
import MemberReports from "./member/pages/Reports";
import MemberNotifications from "./member/pages/Notifications";
import MemberSettings from "./member/pages/Settings";

export function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <BrowserRouter
            future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
          >
            <Toaster position="top-right" richColors />

            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/logout" element={<Logout />} />

              {/* 🔒 Admin Routes */}
              <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
                <Route path="/admin" element={<Layout />}>
                  <Route index element={<AdminDashboard />} />
                  <Route path="members" element={<AdminMembers />} />
                  <Route path="savings" element={<AdminSavings />} />
                  <Route path="loans" element={<AdminLoans />} />
                  <Route path="repayments" element={<AdminRepayments />} />
                  <Route path="penalties" element={<AdminPenalties />} />
                  <Route path="reports" element={<AdminReports />} />
                  <Route path="notifications" element={<AdminNotifications />} />
                  <Route path="settings" element={<AdminSettings />} />
                </Route>
              </Route>

              {/* 🔒 Member Routes */}
              <Route element={<ProtectedRoute allowedRoles={["member"]} />}>
                <Route path="/member" element={<Layout />}>
                  <Route index element={<MemberDashboard />} />

                  <Route path="savings" element={<MemberSavings />} />
                  <Route path="loans" element={<MemberLoans />} />
                  <Route path="repayments" element={<MemberRepayments />} />
                  <Route path="penalties" element={<MemberPenalties />} />
                  <Route path="reports" element={<MemberReports />} />
                  <Route path="notifications" element={<MemberNotifications />} />
                  <Route path="settings" element={<MemberSettings />} />
                </Route>
              </Route>

              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
