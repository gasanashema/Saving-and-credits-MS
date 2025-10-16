import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';
import { members } from '../utils/mockData';
import { MagnifyingGlassIcon, ChevronLeftIcon, ChevronRightIcon, XMarkIcon, UserIcon, BanknotesIcon, CurrencyDollarIcon, UserPlusIcon } from '@heroicons/react/24/outline';
import Modal from '../components/ui/Modal';
import { toast } from 'sonner';
interface Member {
  id: number;
  name: string;
  email: string;
  joinDate: string;
  totalSavings: number;
  phone?: string;
}
const Members: React.FC = () => {
  const {
    t
  } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [membersList, setMembersList] = useState<Member[]>(members as Member[]);
  // New member form state
  const [newMember, setNewMember] = useState({
    name: '',
    email: '',
    phone: '',
    joinDate: new Date().toISOString().split('T')[0],
    totalSavings: 0
  });
  const [errors, setErrors] = useState({
    name: '',
    email: '',
    phone: '',
    totalSavings: ''
  });
  const itemsPerPage = 8;
  // Filter members based on search term
  const filteredMembers = membersList.filter(member => member.name.toLowerCase().includes(searchTerm.toLowerCase()) || member.email.toLowerCase().includes(searchTerm.toLowerCase()));
  // Calculate pagination
  const indexOfLastMember = currentPage * itemsPerPage;
  const indexOfFirstMember = indexOfLastMember - itemsPerPage;
  const currentMembers = filteredMembers.slice(indexOfFirstMember, indexOfLastMember);
  const totalPages = Math.ceil(filteredMembers.length / itemsPerPage);
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };
  const handleViewDetails = (member: Member) => {
    setSelectedMember(member);
    setIsModalOpen(true);
  };
  const closeModal = () => {
    setIsModalOpen(false);
  };
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const {
      name,
      value
    } = e.target;
    setNewMember({
      ...newMember,
      [name]: value
    });
    // Clear the error when user starts typing
    if (errors[name as keyof typeof errors]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };
  const validateForm = () => {
    let isValid = true;
    const newErrors = {
      ...errors
    };
    // Validate name
    if (!newMember.name.trim()) {
      newErrors.name = t('nameRequired');
      isValid = false;
    }
    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!newMember.email.trim()) {
      newErrors.email = t('emailRequired');
      isValid = false;
    } else if (!emailRegex.test(newMember.email)) {
      newErrors.email = t('invalidEmail');
      isValid = false;
    }
    // Validate phone (optional but if provided, must be valid)
    if (newMember.phone && !/^\+?[0-9]{10,15}$/.test(newMember.phone)) {
      newErrors.phone = t('invalidPhone');
      isValid = false;
    }
    // Validate savings
    if (isNaN(Number(newMember.totalSavings)) || Number(newMember.totalSavings) < 0) {
      newErrors.totalSavings = t('invalidSavings');
      isValid = false;
    }
    setErrors(newErrors);
    return isValid;
  };
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }
    // Create new member with parsed values
    const newMemberWithId = {
      id: membersList.length + 1,
      name: newMember.name,
      email: newMember.email,
      phone: newMember.phone,
      joinDate: newMember.joinDate,
      totalSavings: Number(newMember.totalSavings)
    };
    // Update members list
    setMembersList([...membersList, newMemberWithId]);
    // Reset form
    setNewMember({
      name: '',
      email: '',
      phone: '',
      joinDate: new Date().toISOString().split('T')[0],
      totalSavings: 0
    });
    // Close modal
    setIsAddModalOpen(false);
    // Show success message
    toast.success(t('memberAddedSuccess'));
  };
  return <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
            {t('members')}
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            {t('manageMembersDescription')}
          </p>
        </div>
        <button onClick={() => setIsAddModalOpen(true)} className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg flex items-center">
          <UserPlusIcon className="h-5 w-5 mr-2" />
          {t('addMember')}
        </button>
      </div>
      {/* Search and Filter */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-4 border border-gray-200 dark:border-gray-700">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder={t('searchMembers')} className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
        </div>
      </div>
      {/* Members Table */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-700">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('memberName')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('email')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('joinDate')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('totalSaved')}
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('actions')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {currentMembers.map(member => <motion.tr key={member.id} className="hover:bg-gray-50 dark:hover:bg-gray-700" initial={{
              opacity: 0
            }} animate={{
              opacity: 1
            }} transition={{
              duration: 0.3
            }}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                        <span className="text-gray-500 dark:text-gray-300 font-medium">
                          {member.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {member.name}
                        </div>
                        {member.phone && <div className="text-sm text-gray-500 dark:text-gray-400">
                            {member.phone}
                          </div>}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {member.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {new Date(member.joinDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-emerald-600 dark:text-emerald-400">
                    {formatCurrency(member.totalSavings)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button onClick={() => handleViewDetails(member)} className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300">
                      {t('viewDetails')}
                    </button>
                  </td>
                </motion.tr>)}
              {currentMembers.length === 0 && <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                    {t('noData')}
                  </td>
                </tr>}
            </tbody>
          </table>
        </div>
        {/* Pagination */}
        <div className="bg-white dark:bg-gray-800 px-4 py-3 flex items-center justify-between border-t border-gray-200 dark:border-gray-700 sm:px-6">
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                {t('showing')}{' '}
                <span className="font-medium">{indexOfFirstMember + 1}</span>{' '}
                {t('to')}{' '}
                <span className="font-medium">
                  {indexOfLastMember > filteredMembers.length ? filteredMembers.length : indexOfLastMember}
                </span>{' '}
                {t('of')}{' '}
                <span className="font-medium">{filteredMembers.length}</span>{' '}
                {t('results')}
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 1} className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium ${currentPage === 1 ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'}`}>
                  <span className="sr-only">Previous</span>
                  <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
                </button>
                {Array.from({
                length: totalPages
              }, (_, i) => i + 1).map(page => <button key={page} onClick={() => setCurrentPage(page)} className={`relative inline-flex items-center px-4 py-2 border ${currentPage === page ? 'z-10 bg-blue-50 dark:bg-blue-900/30 border-blue-500 dark:border-blue-400 text-blue-600 dark:text-blue-400' : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'} text-sm font-medium`}>
                    {page}
                  </button>)}
                <button onClick={() => setCurrentPage(currentPage + 1)} disabled={currentPage === totalPages} className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium ${currentPage === totalPages ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'}`}>
                  <span className="sr-only">Next</span>
                  <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>
      {/* Member Details Modal */}
      <AnimatePresence>
        {isModalOpen && selectedMember && <motion.div initial={{
        opacity: 0
      }} animate={{
        opacity: 1
      }} exit={{
        opacity: 0
      }} className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                <div className="absolute inset-0 bg-gray-500 dark:bg-gray-900 opacity-75"></div>
              </div>
              <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
                &#8203;
              </span>
              <motion.div initial={{
            opacity: 0,
            scale: 0.95
          }} animate={{
            opacity: 1,
            scale: 1
          }} exit={{
            opacity: 0,
            scale: 0.95
          }} className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                <div className="absolute top-0 right-0 pt-4 pr-4">
                  <button type="button" onClick={closeModal} className="bg-white dark:bg-gray-800 rounded-md text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 focus:outline-none">
                    <span className="sr-only">Close</span>
                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>
                <div className="px-6 pt-5 pb-6">
                  <div className="flex items-center">
                    <div className="h-16 w-16 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                      <UserIcon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">
                        {selectedMember.name}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {selectedMember.email}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {selectedMember.phone && <span className="mr-3">{selectedMember.phone}</span>}
                        {t('joined')}:{' '}
                        {new Date(selectedMember.joinDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="mt-6 grid grid-cols-2 gap-4">
                    <div className="bg-emerald-50 dark:bg-emerald-900/30 rounded-xl p-4">
                      <div className="flex items-center">
                        <CurrencyDollarIcon className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
                        <div className="ml-3">
                          <p className="text-sm font-medium text-emerald-800 dark:text-emerald-300">
                            {t('totalSavings')}
                          </p>
                          <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                            {formatCurrency(selectedMember.totalSavings)}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-amber-50 dark:bg-amber-900/30 rounded-xl p-4">
                      <div className="flex items-center">
                        <BanknotesIcon className="h-8 w-8 text-amber-600 dark:text-amber-400" />
                        <div className="ml-3">
                          <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
                            {t('activeLoans')}
                          </p>
                          <p className="text-xl font-bold text-amber-600 dark:text-amber-400">
                            {formatCurrency(1200)} {/* Mock data */}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-6">
                    <h4 className="text-md font-semibold text-gray-800 dark:text-white mb-3">
                      {t('savingsHistory')}
                    </h4>
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg overflow-hidden">
                      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-600">
                        <thead>
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                              {t('date')}
                            </th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                              {t('amount')}
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                          {/* Mock savings history */}
                          <tr>
                            <td className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
                              {new Date().toLocaleDateString()}
                            </td>
                            <td className="px-4 py-2 text-sm text-right text-emerald-600 dark:text-emerald-400">
                              {formatCurrency(300)}
                            </td>
                          </tr>
                          <tr>
                            <td className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
                              {new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                            </td>
                            <td className="px-4 py-2 text-sm text-right text-emerald-600 dark:text-emerald-400">
                              {formatCurrency(250)}
                            </td>
                          </tr>
                          <tr>
                            <td className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
                              {new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                            </td>
                            <td className="px-4 py-2 text-sm text-right text-emerald-600 dark:text-emerald-400">
                              {formatCurrency(200)}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 px-6 py-3 flex items-center justify-end">
                  <button type="button" onClick={closeModal} className="bg-white dark:bg-gray-800 py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                    {t('close')}
                  </button>
                  <button type="button" className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                    {t('editMember')}
                  </button>
                </div>
              </motion.div>
            </div>
          </motion.div>}
      </AnimatePresence>
      {/* Add New Member Modal */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title={t('addNewMember')} size="lg">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('fullName')} *
              </label>
              <input type="text" id="name" name="name" value={newMember.name} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white" placeholder={t('enterFullName')} />
              {errors.name && <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.name}
                </p>}
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('email')} *
              </label>
              <input type="email" id="email" name="email" value={newMember.email} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white" placeholder={t('enterEmail')} />
              {errors.email && <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.email}
                </p>}
            </div>
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('phoneNumber')}
              </label>
              <input type="text" id="phone" name="phone" value={newMember.phone} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white" placeholder={t('enterPhoneNumber')} />
              {errors.phone && <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.phone}
                </p>}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="joinDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('joinDate')} *
                </label>
                <input type="date" id="joinDate" name="joinDate" value={newMember.joinDate} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white" />
              </div>
              <div>
                <label htmlFor="totalSavings" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('initialSavings')} *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <span className="text-gray-500 dark:text-gray-400">$</span>
                  </div>
                  <input type="number" id="totalSavings" name="totalSavings" value={newMember.totalSavings} onChange={handleInputChange} min="0" step="1" className="w-full pl-8 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white" placeholder="0" />
                </div>
                {errors.totalSavings && <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.totalSavings}
                  </p>}
              </div>
            </div>
          </div>
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              {t('cancel')}
            </button>
            <button type="submit" className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500">
              {t('addMember')}
            </button>
          </div>
        </form>
      </Modal>
    </div>;
};
export default Members;