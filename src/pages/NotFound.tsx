import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const NotFound: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center px-6"
      >
        <h1 className="text-9xl font-extrabold text-green-500 mb-4">404</h1>
        <h2 className="text-3xl md:text-4xl font-semibold mb-2">
          Oops! Page Not Found
        </h2>
        <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md mx-auto">
          The page you’re looking for doesn’t exist or has been moved.
        </p>

        <Link
          to="/"
          className="inline-block px-6 py-3 bg-green-500 text-white font-semibold rounded-xl shadow-md hover:bg-green-600 transition-all duration-300"
        >
          Go Back Home
        </Link>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.3 }}
        className="mt-10"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 200 200"
          className="w-40 h-40 text-green-500 opacity-80"
          fill="none"
          stroke="currentColor"
          strokeWidth="8"
        >
          <circle cx="100" cy="100" r="80" className="text-green-500" />
          <path
            strokeLinecap="round"
            d="M65 85 L85 105 M85 85 L65 105 M115 85 L135 105 M135 85 L115 105 M80 135 h40"
          />
        </svg>
      </motion.div>
    </div>
  );
};

export default NotFound;
