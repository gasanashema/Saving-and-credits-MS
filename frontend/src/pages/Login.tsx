import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useLanguage } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";
import { CurrencyDollarIcon } from "@heroicons/react/24/outline";
import auth from "../utils/Auth";
import { message } from "antd";

const Login: React.FC = () => {
  const [identifier, setIdentifier] = useState(""); // email or phone/NID
  const [password, setPassword] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { t } = useLanguage();
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  // ✅ Redirect if user already logged in
  useEffect(() => {
    if (isAuthenticated && user) {
      switch (user?.role.toLowerCase()) {
        case "admin":
          navigate("/admin", { replace: true });
          break;
        case "member":
          navigate("/member", { replace: true });
          break;
        case "super-admin":
          navigate("/super-admin", { replace: true });
          break;
        default:
          navigate("/", { replace: true });
      }
    }
  }, [isAuthenticated, user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // 🧹 Clear old user and token before new login
      localStorage.removeItem("user");
      localStorage.removeItem("token");

      const loginPayload = {
        username: identifier,
        password,
        role: isAdmin ? "admin" : "member",
      };

      const response = await auth(loginPayload);
      console.log("Login response:", response);

      if (!response.login) {
        throw new Error(response.error || "Invalid credentials");
      }

      const { token, role, id, fullname, email } = response;

      console.log(response);
      // 🧠 Store user info and token separately
      const userData = { id, fullname, email, role, token };
      localStorage.setItem("user", JSON.stringify(userData));
      localStorage.setItem("token", token); // Store token separately for axios interceptor
      window.dispatchEvent(new Event("storage")); 

      // ✅ Navigate based on role
      let page = "/";
      switch (role.toLowerCase()) {
        case "admin":
          page = "/admin";
          break;
        case "member":
          page = "/member";
          break;
        case "super-admin":
          page = "/super-admin";
          break;
        default:
          page = "/login";
      }

      navigate(page, { replace: true });
      message.success(`Welcome back, ${fullname}!`);
    } catch (err: any) {
      message.error(err.message || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full space-y-8 bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg"
      >
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-14 w-14 bg-emerald-600 text-white flex items-center justify-center rounded-xl">
            <CurrencyDollarIcon className="h-8 w-8" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white">
            UnitySave
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            {t("signInToContinue")}
          </p>
        </div>

        {/* Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Dynamic Input */}
            <div>
              <label
                htmlFor="identifier"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                {isAdmin ? t("email") : t("Phone")}
              </label>
              <input
                id="identifier"
                name="identifier"
                type={isAdmin ? "email" : "text"}
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-lg py-3 px-4 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder={
                  isAdmin ? "admin@unitysave.com" : "NID or +2507..."
                }
              />
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                {t("password")}
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-lg py-3 px-4 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="••••••••"
              />
            </div>
          </div>

          {/* Admin Toggle */}
          <div className="flex items-center justify-between">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={isAdmin}
                onChange={(e) => setIsAdmin(e.target.checked)}
                className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                I am an admin
              </span>
            </label>

            <div className="text-sm">
              <a
                href="#"
                className="font-medium text-emerald-600 hover:text-emerald-500 dark:text-emerald-400 dark:hover:text-emerald-300"
              >
                {t("forgotPassword")}
              </a>
            </div>
          </div>

          {/* Submit */}
          <div>
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 ${
                isLoading ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              {isLoading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 
                        0 5.373 0 12h4zm2 5.291A7.962 
                        7.962 0 014 12H0c0 3.042 
                        1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  {t("loading")}
                </>
              ) : (
                t("signIn")
              )}
            </button>
          </div>

          {/* Demo Info */}
          <div className="text-center text-sm text-gray-500 dark:text-gray-400">
            <p>Demo admin: admin@unitysave.com / password</p>
            <p>Demo member: +250788000000 / password</p>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default Login;
