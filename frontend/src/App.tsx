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
import AdminLoanDetail from "./admin/pages/LoanDetail"; // Import AdminLoanDetail
import AdminRepayments from "./admin/pages/Repayments";
import AdminPenalties from "./admin/pages/Penalties";
import AdminReports from "./admin/pages/Reports";
import AdminNotifications from "./admin/pages/Notifications";
import AdminSettings from "./admin/pages/Settings";
import AdminChat from "./admin/pages/Chat";

// SuperAdmin pages
import SuperAdminDashboard from "./sadmin/pages/Dashboard";
import SuperAdminMembers from "./sadmin/pages/Members";
import SuperAdminSavings from "./sadmin/pages/Savings";
import SuperAdminLoans from "./sadmin/pages/Loans";
import SuperAdminRepayments from "./sadmin/pages/Repayments";
import SuperAdminPenalties from "./sadmin/pages/Penalties";
import SuperAdminReports from "./sadmin/pages/Reports";
import SuperAdminNotifications from "./sadmin/pages/Notifications";
import SuperAdminSettings from "./sadmin/pages/Settings";
import SuperAdminChat from "./sadmin/pages/Chat";

// Member pages
import MemberDashboard from "./member/pages/Dashboard";

import MemberSavings from "./member/pages/Savings";
import MemberLoans from "./member/pages/Loans";
import MemberLoanDetail from "./member/pages/LoanDetail"; // Import MemberLoanDetail
import MemberRepayments from "./member/pages/Repayments";
import MemberPenalties from "./member/pages/Penalties";
import MemberReports from "./member/pages/Reports";
import MemberNotifications from "./member/pages/Notifications";
import MemberSettings from "./member/pages/Settings";
import MemberChat from "./member/pages/Chat";
import HelpCenter from "./member/pages/HelpCenter";

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
              <Route element={<ProtectedRoute allowedRoles={["admin", "sadmin"]} />}>
                <Route path="/admin" element={<Layout />}>
                  <Route index element={<AdminDashboard />} />
                  <Route path="members" element={<AdminMembers />} />
                  <Route path="savings" element={<AdminSavings />} />
                  <Route path="loans" element={<AdminLoans />} />
                  <Route path="loans/:id" element={<AdminLoanDetail />} />
                  <Route path="repayments" element={<AdminRepayments />} />
                  <Route path="penalties" element={<AdminPenalties />} />
                  <Route path="reports" element={<AdminReports />} />
                  <Route path="notifications" element={<AdminNotifications />} />
                  <Route path="chat" element={<AdminChat />} />
                  <Route path="settings" element={<AdminSettings />} />
                </Route>
              </Route>

              {/* 🔒 Super Admin Routes */}
              <Route element={<ProtectedRoute allowedRoles={["admin", "sadmin"]} />}>
                <Route path="/super-admin" element={<Layout />}>
                  <Route index element={<SuperAdminDashboard />} />
                  <Route path="dashboard" element={<SuperAdminDashboard />} />
                  <Route path="members" element={<SuperAdminMembers />} />
                  <Route path="savings" element={<SuperAdminSavings />} />
                  <Route path="loans" element={<SuperAdminLoans />} />
                  <Route path="loans/:id" element={<AdminLoanDetail />} /> {/* Reuse Admin Detail for SuperAdmin */}
                  <Route path="repayments" element={<SuperAdminRepayments />} />
                  <Route path="penalties" element={<SuperAdminPenalties />} />
                  <Route path="reports" element={<SuperAdminReports />} />
                  <Route path="notifications" element={<SuperAdminNotifications />} />
                  <Route path="chat" element={<SuperAdminChat />} />
                  <Route path="settings" element={<SuperAdminSettings />} />
                </Route>
              </Route>

              {/* 🔒 Member Routes */}
              <Route element={<ProtectedRoute allowedRoles={["member"]} />}>
                <Route path="/member" element={<Layout />}>
                  <Route index element={<MemberDashboard />} />

                  <Route path="savings" element={<MemberSavings />} />
                  <Route path="loans" element={<MemberLoans />} />
                  <Route path="loans/:id" element={<MemberLoanDetail />} />
                  <Route path="repayments" element={<MemberRepayments />} />
                  <Route path="penalties" element={<MemberPenalties />} />
                  <Route path="reports" element={<MemberReports />} />
                  <Route path="notifications" element={<MemberNotifications />} />
                  <Route path="help" element={<HelpCenter />} />
                  <Route path="chat" element={<MemberChat />} />
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
