import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';
import { repayments, loans } from '../utils/mockData';
import { MagnifyingGlassIcon, PlusIcon, ArrowDownCircleIcon } from '@heroicons/react/24/outline';
import Modal from '../components/ui/Modal';
import { toast } from 'sonner';
interface Repayment {
  id: number;
  member: string;
  loanRef: string;
  amount: number;
  balance: number;
  date: string;
  paymentMethod?: string;
}
const Repayments: React.FC = () => {
  const {
    t
  } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [repaymentsList, setRepaymentsList] = useState<Repayment[]>(repayments);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  // New repayment form state
  const [newRepayment, setNewRepayment] = useState({
    loanId: '',
    amount: '',
    paymentMethod: 'cash'
  });
  const [errors, setErrors] = useState({
    loanId: '',
    amount: ''
  });
  // Filter repayments based on search term
  const filteredRepayments = repaymentsList.filter(repayment => repayment.member.toLowerCase().includes(searchTerm.toLowerCase()) || repayment.loanRef.toLowerCase().includes(searchTerm.toLowerCase()) || repayment.amount.toString().includes(searchTerm) || repayment.balance.toString().includes(searchTerm));
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const {
      name,
      value
    } = e.target;
    setNewRepayment({
      ...newRepayment,
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
    // Validate loan
    if (!newRepayment.loanId) {
      newErrors.loanId = t('loanRequired');
      isValid = false;
    }
    // Validate amount
    if (!newRepayment.amount || isNaN(Number(newRepayment.amount)) || Number(newRepayment.amount) <= 0) {
      newErrors.amount = t('invalidAmount');
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
    // Find the loan
    const selectedLoan = loans.find(loan => loan.id === Number(newRepayment.loanId));
    if (!selectedLoan) {
      return;
    }
    const amount = Number(newRepayment.amount);
    // Get the previous balance
    let previousBalance = 0;
    const previousRepayment = repaymentsList.find(r => r.loanRef === `L-2023-${selectedLoan.id.toString().padStart(3, '0')}`);
    if (previousRepayment) {
      previousBalance = previousRepayment.balance;
    } else {
      // If no previous repayment, use the loan amount
      previousBalance = selectedLoan.amount;
    }
    // Calculate new balance
    const newBalance = previousBalance - amount;
    // Create new repayment
    const newRepaymentData: Repayment = {
      id: repaymentsList.length + 1,
      member: selectedLoan.member,
      loanRef: `L-2023-${selectedLoan.id.toString().padStart(3, '0')}`,
      amount,
      balance: newBalance,
      date: new Date().toISOString().split('T')[0],
      paymentMethod: newRepayment.paymentMethod
    };
    // Update repayments list
    setRepaymentsList([newRepaymentData, ...repaymentsList]);
    // Reset form
    setNewRepayment({
      loanId: '',
      amount: '',
      paymentMethod: 'cash'
    });
    // Close modal
    setIsAddModalOpen(false);
    // Show success message
    toast.success(t('paymentRecorded'));
  };
  return <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
            {t('repayments')}
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            {t('manageRepaymentsDescription')}
          </p>
        </div>
        <button onClick={() => setIsAddModalOpen(true)} className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center">
          <PlusIcon className="h-5 w-5 mr-2" />
          {t('recordPayment')}
        </button>
      </div>
      {/* Search and Filter */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-4 border border-gray-200 dark:border-gray-700">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder={t('searchRepayments')} className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
        </div>
      </div>
      {/* Repayments Table */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-700">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('date')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('member')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('loanReference')}
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('amountPaid')}
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('remainingBalance')}
                </th>
                {repaymentsList.some(r => r.paymentMethod) && <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {t('paymentMethod')}
                  </th>}
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredRepayments.map(repayment => <motion.tr key={repayment.id} className="hover:bg-gray-50 dark:hover:bg-gray-700" initial={{
              opacity: 0
            }} animate={{
              opacity: 1
            }} transition={{
              duration: 0.3
            }}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {new Date(repayment.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-200">
                    {repayment.member}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-200">
                    {repayment.loanRef}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-right text-emerald-600 dark:text-emerald-400">
                    {formatCurrency(repayment.amount)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-right text-gray-800 dark:text-gray-200">
                    {formatCurrency(repayment.balance)}
                  </td>
                  {repaymentsList.some(r => r.paymentMethod) && <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {repayment.paymentMethod ? t(repayment.paymentMethod) : '-'}
                    </td>}
                </motion.tr>)}
              {filteredRepayments.length === 0 && <tr>
                  <td colSpan={repaymentsList.some(r => r.paymentMethod) ? 6 : 5} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                    {t('noData')}
                  </td>
                </tr>}
            </tbody>
          </table>
        </div>
      </div>
      {/* Record Payment Modal */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title={t('recordPayment')}>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="loanId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('selectLoan')} *
              </label>
              <select id="loanId" name="loanId" value={newRepayment.loanId} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white">
                <option value="">{t('selectLoan')}</option>
                {loans.filter(loan => loan.status === 'approved').map(loan => <option key={loan.id} value={loan.id}>
                      {loan.member} - {formatCurrency(loan.amount)}
                    </option>)}
              </select>
              {errors.loanId && <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.loanId}
                </p>}
            </div>
            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('paymentAmount')} *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <span className="text-gray-500 dark:text-gray-400">$</span>
                </div>
                <input type="number" id="amount" name="amount" value={newRepayment.amount} onChange={handleInputChange} min="1" step="1" className="w-full pl-8 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white" placeholder="0" />
              </div>
              {errors.amount && <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.amount}
                </p>}
            </div>
            <div>
              <label htmlFor="paymentMethod" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('paymentMethod')} *
              </label>
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input type="radio" name="paymentMethod" value="cash" checked={newRepayment.paymentMethod === 'cash'} onChange={handleInputChange} className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300" />
                  <span className="ml-2 text-gray-700 dark:text-gray-300">
                    {t('cash')}
                  </span>
                </label>
                <label className="flex items-center">
                  <input type="radio" name="paymentMethod" value="bankTransfer" checked={newRepayment.paymentMethod === 'bankTransfer'} onChange={handleInputChange} className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300" />
                  <span className="ml-2 text-gray-700 dark:text-gray-300">
                    {t('bankTransfer')}
                  </span>
                </label>
                <label className="flex items-center">
                  <input type="radio" name="paymentMethod" value="mobileMoney" checked={newRepayment.paymentMethod === 'mobileMoney'} onChange={handleInputChange} className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300" />
                  <span className="ml-2 text-gray-700 dark:text-gray-300">
                    {t('mobileMoney')}
                  </span>
                </label>
              </div>
            </div>
          </div>
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              {t('cancel')}
            </button>
            <button type="submit" className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 flex items-center">
              <ArrowDownCircleIcon className="h-5 w-5 mr-2" />
              {t('recordPayment')}
            </button>
          </div>
        </form>
      </Modal>
    </div>;
};
export default Repayments;