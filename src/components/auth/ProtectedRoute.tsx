import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

interface ProtectedRouteProps {
  allowedRoles: ("admin" | "member" | "sadmin")[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="text-center mt-20 text-gray-600">Loading...</div>;
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    // redirect user to their own dashboard
    if (user.role === "admin") return <Navigate to="/admin/dashboard" replace />;
    if (user.role === "member") return <Navigate to="/member/dashboard" replace />;
    if (user.role === "sadmin") return <Navigate to="/super-admin/dashboard" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
