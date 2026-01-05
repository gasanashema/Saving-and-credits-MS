import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { UserCircleIcon, KeyIcon, SunIcon, MoonIcon, LanguageIcon, CheckCircleIcon, PencilIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import Modal from '../../components/ui/Modal';
import { toast } from 'sonner';
import server from '../../utils/server';
const Settings: React.FC = () => {
  const {
    t,
    language,
    toggleLanguage
  } = useLanguage();
  const {
    theme,
    toggleTheme
  } = useTheme();
  const {
    user
  } = useAuth();
  // Form states
  const [name, setName] = useState(user?.name || user?.fullname || '');
  const [email, setEmail] = useState(user?.email || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  // Modal states
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  // Form errors
  const [profileErrors, setProfileErrors] = useState({
    name: '',
    email: ''
  });
  const [passwordErrors, setPasswordErrors] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const validateProfileForm = () => {
    let isValid = true;
    const errors = {
      name: '',
      email: ''
    };
    if (!name.trim()) {
      errors.name = t('nameRequired');
      isValid = false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      errors.email = t('emailRequired');
      isValid = false;
    } else if (!emailRegex.test(email)) {
      errors.email = t('invalidEmail');
      isValid = false;
    }
    setProfileErrors(errors);
    return isValid;
  };
  const validatePasswordForm = () => {
    let isValid = true;
    const errors = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    };
    if (!currentPassword) {
      errors.currentPassword = t('currentPasswordRequired');
      isValid = false;
    }
    if (!newPassword) {
      errors.newPassword = t('newPasswordRequired');
      isValid = false;
    } else if (newPassword.length < 8) {
      errors.newPassword = t('passwordTooShort');
      isValid = false;
    }
    if (!confirmPassword) {
      errors.confirmPassword = t('confirmPasswordRequired');
      isValid = false;
    } else if (newPassword !== confirmPassword) {
      errors.confirmPassword = t('passwordsDoNotMatch');
      isValid = false;
    }
    setPasswordErrors(errors);
    return isValid;
  };
  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateProfileForm()) {
      return;
    }
    // Mock update profile
    setTimeout(() => {
      setIsProfileModalOpen(false);
      toast.success(t('profileUpdated'));
    }, 500);
  };
  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validatePasswordForm()) {
      return;
    }
    // Mock password change
    setTimeout(() => {
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setIsPasswordModalOpen(false);
      toast.success(t('passwordChanged'));
    }, 500);
  };

  const handleResetPassword = async () => {
    if (!user?.id) {
      toast.error('User ID not found');
      return;
    }

    try {
      const endpoint = user.role === 'admin' ? `users/${user.id}/reset-password` : `members/${user.id}/reset-password`;
      await server.put(endpoint);
      toast.success('Password reset to default (12345)');
    } catch (error) {
      console.error('Reset password error:', error);
      toast.error('Failed to reset password');
    }
  };
  const handleProfileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const {
      name,
      value
    } = e.target;
    if (name === 'name') setName(value);
    if (name === 'email') setEmail(value);
    // Clear error
    if (profileErrors[name as keyof typeof profileErrors]) {
      setProfileErrors({
        ...profileErrors,
        [name]: ''
      });
    }
  };
  const handlePasswordInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const {
      name,
      value
    } = e.target;
    if (name === 'currentPassword') setCurrentPassword(value);
    if (name === 'newPassword') setNewPassword(value);
    if (name === 'confirmPassword') setConfirmPassword(value);
    // Clear error
    if (passwordErrors[name as keyof typeof passwordErrors]) {
      setPasswordErrors({
        ...passwordErrors,
        [name]: ''
      });
    }
  };
  return <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
          {t('settings')}
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          {t('settingsDescription')}
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Profile Settings */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center">
              <UserCircleIcon className="h-6 w-6 text-gray-500 dark:text-gray-400" />
              <h2 className="ml-2 text-lg font-semibold text-gray-800 dark:text-white">
                {t('profileSettings')}
              </h2>
            </div>
            <button onClick={() => setIsProfileModalOpen(true)} className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 flex items-center">
              <PencilIcon className="h-4 w-4 mr-1" />
              {t('edit')}
            </button>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-center mb-6">
              <div className="relative">
                <img src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || user?.fullname || 'User')}&background=0D8ABC&color=fff`} alt={user?.name || user?.fullname || 'User'} className="h-24 w-24 rounded-full border-2 border-gray-200 dark:border-gray-700" />
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                {t('name')}
              </h3>
              <p className="mt-1 text-base text-gray-800 dark:text-white">
                {user?.name || user?.fullname || name}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                {t('email')}
              </h3>
              <p className="mt-1 text-base text-gray-800 dark:text-white">
                {user?.email || email}
              </p>
            </div>
          </div>
        </div>
        {/* Password Settings */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center">
              <KeyIcon className="h-6 w-6 text-gray-500 dark:text-gray-400" />
              <h2 className="ml-2 text-lg font-semibold text-gray-800 dark:text-white">
                {t('changePassword')}
              </h2>
            </div>
            <div className="flex space-x-2">
              <button onClick={() => setIsPasswordModalOpen(true)} className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 flex items-center">
                <PencilIcon className="h-4 w-4 mr-1" />
                {t('change')}
              </button>
              <button onClick={handleResetPassword} className="text-orange-600 hover:text-orange-800 dark:text-orange-400 dark:hover:text-orange-300 flex items-center">
                <ArrowPathIcon className="h-4 w-4 mr-1" />
                Reset
              </button>
            </div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-center">
            <p className="text-gray-600 dark:text-gray-300">
              {t('passwordSecurityMessage')}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              {t('lastPasswordChange')}: 30 {t('daysAgo')}
            </p>
            <div className="mt-3 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded border border-yellow-200 dark:border-yellow-800">
              <p className="text-xs text-yellow-700 dark:text-yellow-300">
                Reset will change password to default: 12345
              </p>
            </div>
          </div>
        </div>
        {/* Theme Settings */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center mb-6">
            {theme === 'dark' ? <MoonIcon className="h-6 w-6 text-gray-500 dark:text-gray-400" /> : <SunIcon className="h-6 w-6 text-gray-500 dark:text-gray-400" />}
            <h2 className="ml-2 text-lg font-semibold text-gray-800 dark:text-white">
              {t('themeSettings')}
            </h2>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <SunIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('lightMode')}
              </span>
            </div>
            <button onClick={toggleTheme} className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${theme === 'dark' ? 'bg-gray-400' : 'bg-blue-600'}`}>
              <span className="sr-only">Toggle theme</span>
              <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${theme === 'dark' ? 'translate-x-0' : 'translate-x-5'}`} />
            </button>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('darkMode')}
              </span>
              <MoonIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
            </div>
          </div>
        </div>
        {/* Language Settings */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center mb-6">
            <LanguageIcon className="h-6 w-6 text-gray-500 dark:text-gray-400" />
            <h2 className="ml-2 text-lg font-semibold text-gray-800 dark:text-white">
              {t('languageSettings')}
            </h2>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('english')}
              </span>
            </div>
            <button onClick={toggleLanguage} className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${language === 'rw' ? 'bg-gray-400' : 'bg-blue-600'}`}>
              <span className="sr-only">Toggle language</span>
              <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${language === 'rw' ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('kinyarwanda')}
              </span>
            </div>
          </div>
        </div>
      </div>
      {/* Edit Profile Modal */}
      <Modal isOpen={isProfileModalOpen} onClose={() => setIsProfileModalOpen(false)} title={t('updateProfile')}>
        <form onSubmit={handleUpdateProfile} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('name')} *
              </label>
              <input type="text" id="name" name="name" value={name} onChange={handleProfileInputChange} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white" />
              {profileErrors.name && <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {profileErrors.name}
                </p>}
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('email')} *
              </label>
              <input type="email" id="email" name="email" value={email} onChange={handleProfileInputChange} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white" />
              {profileErrors.email && <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {profileErrors.email}
                </p>}
            </div>
            <div>
              <label htmlFor="avatar" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('profilePicture')}
              </label>
              <div className="flex items-center">
                <img src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || user?.fullname || 'User')}&background=0D8ABC&color=fff`} alt="Avatar" className="h-12 w-12 rounded-full mr-4" />
                <input type="file" id="avatar" name="avatar" className="hidden" />
                <label htmlFor="avatar" className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer">
                  {t('changeImage')}
                </label>
              </div>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {t('imageRequirements')}
              </p>
            </div>
          </div>
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button type="button" onClick={() => setIsProfileModalOpen(false)} className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              {t('cancel')}
            </button>
            <button type="submit" className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              {t('saveChanges')}
            </button>
          </div>
        </form>
      </Modal>
      {/* Change Password Modal */}
      <Modal isOpen={isPasswordModalOpen} onClose={() => setIsPasswordModalOpen(false)} title={t('changePassword')}>
        <form onSubmit={handleChangePassword} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('currentPassword')} *
              </label>
              <input type="password" id="currentPassword" name="currentPassword" value={currentPassword} onChange={handlePasswordInputChange} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white" />
              {passwordErrors.currentPassword && <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {passwordErrors.currentPassword}
                </p>}
            </div>
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('newPassword')} *
              </label>
              <input type="password" id="newPassword" name="newPassword" value={newPassword} onChange={handlePasswordInputChange} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white" />
              {passwordErrors.newPassword && <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {passwordErrors.newPassword}
                </p>}
            </div>
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('confirmPassword')} *
              </label>
              <input type="password" id="confirmPassword" name="confirmPassword" value={confirmPassword} onChange={handlePasswordInputChange} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white" />
              {passwordErrors.confirmPassword && <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {passwordErrors.confirmPassword}
                </p>}
            </div>
          </div>
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button type="button" onClick={() => setIsPasswordModalOpen(false)} className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              {t('cancel')}
            </button>
            <button type="submit" className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              {t('updatePassword')}
            </button>
          </div>
        </form>
      </Modal>
    </div>;
};
export default Settings;