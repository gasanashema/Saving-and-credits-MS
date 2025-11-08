/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Logout = () => {
  const navigate = useNavigate();
  useEffect(() => {
    localStorage.clear();
    navigate("/login");
  }, []);
  return <div className="container">Loging out ................</div>;
};

export default Logout;
