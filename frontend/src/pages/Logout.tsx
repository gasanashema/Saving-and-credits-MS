/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Logout = () => {
  const navigate = useNavigate();
  useEffect(() => {
    // Clear user data from localStorage
    localStorage.removeItem("user");
    localStorage.removeItem("token");

    // Dispatch storage event to notify AuthContext
    window.dispatchEvent(new Event("storage"));

    // Navigate to login
    navigate("/login");
  }, [navigate]);
  return <div className="container">Logging out ................</div>;
};

export default Logout;
