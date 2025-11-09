import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";

const LandingPage: React.FC = () => {
  const { user } = useAuth();
  
  return (
    <div className="relative min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-center items-center overflow-hidden px-4">
      
      {/* Background Image */}
      <motion.img
        src="https://umuseke.rw/wp-content/uploads/2022/06/arton7594.jpg"
        alt="Finance background"
        className="absolute top-0 left-0 w-full h-full object-cover z-0 brightness-75 dark:brightness-50"
        initial={{ scale: 1.2 }}
        animate={{ scale: 1 }}
        transition={{ duration: 2 }}
      />

      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="relative z-10 text-center max-w-2xl"
      >
        <h1 className="text-5xl md:text-6xl font-extrabold text-green-500 dark:text-green-400 mb-4">
          Welcome to UnitySave
        </h1>
        <p className="text-lg md:text-xl text-gray-100 dark:text-gray-200 mb-8">
          Simplify your finances. Manage savings, loans, and transactions seamlessly.
        </p>

        <Link
          to={user ? (user.role === 'admin' ? '/admin' : '/member') : '/login'}
          className="inline-block px-8 py-4 bg-green-500 text-white font-semibold rounded-2xl shadow-lg hover:bg-green-600 transform hover:scale-105 transition-all duration-300"
        >
          {user ? 'View Home' : 'Login Now'}
        </Link>
      </motion.div>

      {/* Decorative Floating Images */}
      <motion.div
        className="absolute bottom-10 right-10 flex flex-col space-y-4 z-10"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.5 }}
      >
        <img
          src="https://www.thegef.org/sites/default/files/styles/banner_image/public/2021-11/topics_banner_blendedfinance.jpg"
          alt="Wallet concept"
          className="w-36 md:w-40 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-500"
        />
        <img
          src="https://plus.unsplash.com/premium_photo-1681487769650-a0c3fbaed85a"
          alt="Coins and savings"
          className="w-36 md:w-40 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-500"
        />
      </motion.div>

      {/* Animated Tagline */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, delay: 0.7 }}
        className="relative z-10 mt-16 text-center max-w-md text-gray-100 dark:text-gray-200"
      >
        <p className="text-md md:text-lg">
          Start your journey today. UnitySave is designed for admins and members to stay on top of their financial goals.
        </p>
      </motion.div>
    </div>
  );
};

export default LandingPage;
