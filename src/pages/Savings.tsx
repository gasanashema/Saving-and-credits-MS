import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';
import { members } from '../utils/mockData';
import { MagnifyingGlassIcon, PlusIcon, CurrencyDollarIcon, ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/outline';
import Modal from '../components/ui/Modal';
import { toast } from 'sonner';
// Mock savings history data
const savingsHistory = [{
  id: 1,
  memberId: 1,
  memberName: 'John Doe',
  amount: 500,
  type: 'deposit',
  date: '2023-06-01',
  balance: 2500
}, {
  id: 2,
  memberId: 2,
  memberName: 'Jane Smith',
  amount: 300,
  type: 'deposit',
  date: '2023-06-02',
  balance: 3200
}, {
  id: 3,
  memberId: 3,
  memberName: 'Robert Johnson',
  amount: 200,
  type: 'deposit',
  date: '2023-06-03',
  balance: 1800
}, {
  id: 4,
  memberId: 4,
  memberName: 'Emily Davis',
  amount: 450,
  type: 'deposit',
  date: '2023-06-04',
  balance: 4100
}, {
  id: 5,
  memberId: 1,
  memberName: 'John Doe',
  amount: 100,
  type: 'withdrawal',
  date: '2023-06-05',
  balance: 2400
}, {
  id: 6,
  memberId: 5,
  memberName: 'Michael Wilson',
  amount: 350,
  type: 'deposit',
  date: '2023-06-06',
  balance: 2900
}, {
  id: 7,
  memberId: 2,
  memberName: 'Jane Smith',
  amount: 250,
  type: 'withdrawal',
  date: '2023-06-07',
  balance: 2950
}, {
  id: 8,
  memberId: 6,
  memberName: 'Sarah Brown',
  amount: 500,
  type: 'deposit',
  date: '2023-06-08',
  balance: 1500
}];
const Savings: React.FC = () => {
  const {
    t
  } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [savingsData, setSavingsData] = useState(savingsHistory);
  const [transactionData, setTransactionData] = useState({
    memberId: '',
    amount: '',
    type: 'deposit'
  });
  const [errors, setErrors] = useState({
    memberId: '',
    amount: ''
  });
  // Filter savings based on search term
  const filteredSavings = savingsData.filter(saving => saving.memberName.toLowerCase().includes(searchTerm.toLowerCase()) || saving.date.includes(searchTerm) || saving.type.toLowerCase().includes(searchTerm.toLowerCase()));
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
    setTransactionData({
      ...transactionData,
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
    // Validate member
    if (!transactionData.memberId) {
      newErrors.memberId = t('memberRequired');
      isValid = false;
    }
    // Validate amount
    if (!transactionData.amount || isNaN(Number(transactionData.amount)) || Number(transactionData.amount) <= 0) {
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
    const selectedMember = members.find(m => m.id === Number(transactionData.memberId));
    if (!selectedMember) {
      return;
    }
    const amount = Number(transactionData.amount);
    const lastTransaction = savingsData.find(s => s.memberId === Number(transactionData.memberId));
    const currentBalance = lastTransaction ? lastTransaction.balance : selectedMember.totalSavings;
    const newBalance = transactionData.type === 'deposit' ? currentBalance + amount : currentBalance - amount;
    // Create new transaction
    const newTransaction = {
      id: savingsData.length + 1,
      memberId: Number(transactionData.memberId),
      memberName: selectedMember.name,
      amount,
      type: transactionData.type,
      date: new Date().toISOString().split('T')[0],
      balance: newBalance
    };
    // Add to savings data
    setSavingsData([newTransaction, ...savingsData]);
    // Reset form
    setTransactionData({
      memberId: '',
      amount: '',
      type: 'deposit'
    });
    // Close modal
    setIsAddModalOpen(false);
    // Show success message
    toast.success(t(transactionData.type === 'deposit' ? 'depositRecorded' : 'withdrawalRecorded'));
  };
  return <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
            {t('savings')}
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            {t('manageSavingsDescription')}
          </p>
        </div>
        <button onClick={() => setIsAddModalOpen(true)} className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg flex items-center">
          <PlusIcon className="h-5 w-5 mr-2" />
          {t('recordTransaction')}
        </button>
      </div>

      {/* Search and Filter */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-4 border border-gray-200 dark:border-gray-700">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder={t('searchTransactions')} className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
        </div>
      </div>

      {/* Savings History Table */}
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
                  {t('type')}
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('amount')}
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('balance')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredSavings.map(saving => <motion.tr key={saving.id} className="hover:bg-gray-50 dark:hover:bg-gray-700" initial={{
              opacity: 0
            }} animate={{
              opacity: 1
            }} transition={{
              duration: 0.3
            }}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {new Date(saving.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-200">
                    {saving.memberName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {saving.type === 'deposit' ? <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                          <ArrowUpIcon className="h-3 w-3 mr-1" />
                          {t('deposit')}
                        </span> : <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">
                          <ArrowDownIcon className="h-3 w-3 mr-1" />
                          {t('withdrawal')}
                        </span>}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium">
                    <span className={saving.type === 'deposit' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}>
                      {saving.type === 'deposit' ? '+' : '-'}{' '}
                      {formatCurrency(saving.amount)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-gray-800 dark:text-gray-200">
                    {formatCurrency(saving.balance)}
                  </td>
                </motion.tr>)}
              {filteredSavings.length === 0 && <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                    {t('noData')}
                  </td>
                </tr>}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Transaction Modal */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title={t('recordTransaction')}>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="memberId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('member')} *
              </label>
              <select id="memberId" name="memberId" value={transactionData.memberId} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white">
                <option value="">{t('selectMember')}</option>
                {members.map(member => <option key={member.id} value={member.id}>
                    {member.name}
                  </option>)}
              </select>
              {errors.memberId && <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.memberId}
                </p>}
            </div>

            <div>
              <label htmlFor="type" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('transactionType')} *
              </label>
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input type="radio" name="type" value="deposit" checked={transactionData.type === 'deposit'} onChange={handleInputChange} className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300" />
                  <span className="ml-2 text-gray-700 dark:text-gray-300">
                    {t('deposit')}
                  </span>
                </label>
                <label className="flex items-center">
                  <input type="radio" name="type" value="withdrawal" checked={transactionData.type === 'withdrawal'} onChange={handleInputChange} className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300" />
                  <span className="ml-2 text-gray-700 dark:text-gray-300">
                    {t('withdrawal')}
                  </span>
                </label>
              </div>
            </div>

            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('amount')} *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <span className="text-gray-500 dark:text-gray-400">$</span>
                </div>
                <input type="number" id="amount" name="amount" value={transactionData.amount} onChange={handleInputChange} min="1" step="1" className="w-full pl-8 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white" placeholder="0" />
              </div>
              {errors.amount && <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.amount}
                </p>}
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              {t('cancel')}
            </button>
            <button type="submit" className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 ${transactionData.type === 'deposit' ? 'bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500' : 'bg-red-600 hover:bg-red-700 focus:ring-red-500'}`}>
              {transactionData.type === 'deposit' ? t('recordDeposit') : t('recordWithdrawal')}
            </button>
          </div>
        </form>
      </Modal>
    </div>;
};
export default Savings;