import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../../context/LanguageContext';
import { MagnifyingGlassIcon, PlusIcon, CalendarIcon, UserIcon, PhoneIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline';
import Modal from '../../components/ui/Modal';
import { toast } from 'sonner';
import useMemberPaymentHistory from '../../hooks/useMemberPaymentHistory';
import server from '../../utils/server';

interface Payment {
  pay_id: number;
  pay_date: string;
  amount: number;
  loanId: number;
  loan_amount: number;
  amount_to_pay: number;
  payedAmount: number;
  loan_status: string;
  rate: number;
  duration: number;
  request_date: string;
  approved_date: string | null;
  purpose: string;
  firstName: string;
  lastName: string;
  telephone: string;
  recorder_name: string;
  approver_name?: string;
  remaining_amount: number;
  penalty_type?: string;
  penalty_amount?: number;
  penalty_status?: string;
}

interface NewPayment {
  loanId: string;
  amount: string;
  status?: string;
}

const Repayments: React.FC = () => {
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const { payments, summary, loading, error, refresh } = useMemberPaymentHistory();



  const handleMarkAsPaid = async (paymentId: number) => {
    try {
      await server.put(`/loans/payment/${paymentId}/mark-paid`);
      refresh();
      toast.success('Payment marked as paid successfully');
      setIsDetailModalOpen(false);
    } catch (error) {
      console.error('Mark as paid error:', error);
      toast.error('Failed to mark payment as paid');
    }
  };

  // Use summary from hook
  const totalPaid = summary.totalAmountPaid;
  const totalRemaining = summary.totalRemaining;

  // Fix search functionality
  const filteredPayments = payments.filter(payment => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase().trim();
    const fullName = `${payment.firstName} ${payment.lastName}`.toLowerCase();
    return (
      fullName.includes(searchLower) ||
      String(payment.amount).includes(searchLower) ||
      String(payment.remaining_amount).includes(searchLower)
    );
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'RWF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  if (loading) return <div className="p-4 text-gray-500">{t('loading')}</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;

  return (
    <div className="space-y-6">
      {/* Header with totals */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('totalPayments')}</h3>
          <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">{summary.totalPayments}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('totalAmountPaid')}</h3>
          <p className="mt-2 text-3xl font-bold text-emerald-600">{formatCurrency(totalPaid)}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('remainingBalance')}</h3>
          <p className="mt-2 text-3xl font-bold text-blue-600">{formatCurrency(totalRemaining)}</p>
        </div>
      </div>

      {/* Search and Add */}
      <div className="flex justify-between items-center">
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={t('searchPayments')}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg"
          />
        </div>

      </div>

      {/* Payments Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('date')}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('member')}</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('amountPaid')}</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('remainingBalance')}</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('actions')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredPayments.map((payment) => (
              <motion.tr 
                key={payment.pay_id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {new Date(payment.pay_date).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                  {`${payment.firstName} ${payment.lastName}`}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-emerald-600 dark:text-emerald-400">
                  {formatCurrency(payment.amount)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-gray-900 dark:text-white">
                  {formatCurrency(Number(payment.remaining_amount || 0))}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                  <button
                    onClick={() => {
                      setSelectedPayment(payment);
                      setIsDetailModalOpen(true);
                    }}
                    className="text-purple-600 hover:text-purple-900 dark:text-purple-400 dark:hover:text-purple-300"
                  >
                    View More
                  </button>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Payment Detail Modal */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title={t('paymentDetails')}
      >
        {selectedPayment && (
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-purple-100">{t('paymentAmount')}</p>
                  <h3 className="text-2xl font-bold">{formatCurrency(Number(selectedPayment.amount) || 0)}</h3>
                  <p className="text-sm text-purple-200 mt-1">
                    {new Date(selectedPayment.pay_date).toLocaleDateString()}
                  </p>
                </div>

              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Loan Details */}
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 space-y-4">
                <h4 className="font-medium text-gray-900 dark:text-white flex items-center">
                  <CurrencyDollarIcon className="h-5 w-5 mr-2 text-purple-500" />
                  {t('loanDetails')}
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-500">{t('loanAmount')}</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {formatCurrency(Number(selectedPayment.loan_amount) || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">{t('totalToPay')}</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {formatCurrency(Number(selectedPayment.amount_to_pay) || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">{t('remainingBalance')}</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {formatCurrency(Number(selectedPayment.remaining_amount || 0))}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">{t('recorder')}</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {selectedPayment.recorder_name || 'N/A'}
                    </span>
                  </div>
                  {selectedPayment.approver_name && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">{t('approver')}</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {selectedPayment.approver_name}
                      </span>
                    </div>
                  )}
                  <div className="pt-2">
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                      <div 
                        className="bg-purple-600 h-2.5 rounded-full" 
                        style={{ 
                          width: `${Math.min(100, Math.round(((Number(selectedPayment.payedAmount) || 0) / (Number(selectedPayment.amount_to_pay) || 1)) * 100)) || 0}%` 
                        }} 
                      />
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {Math.min(100, Math.round(((Number(selectedPayment.payedAmount) || 0) / (Number(selectedPayment.amount_to_pay) || 1)) * 100)) || 0}% {t('paid')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Member Details */}
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 space-y-4">
                <h4 className="font-medium text-gray-900 dark:text-white flex items-center">
                  <UserIcon className="h-5 w-5 mr-2 text-purple-500" />
                  Member Details
                </h4>
                <div className="space-y-2">
                  <div>
                    <span className="text-gray-500 block text-sm">{t('name')}</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {`${selectedPayment.firstName} ${selectedPayment.lastName}`}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500 block text-sm">{t('telephone')}</span>
                    <span className="font-medium text-gray-900 dark:text-white flex items-center">
                      <PhoneIcon className="h-4 w-4 mr-1 text-gray-400" />
                      {selectedPayment.telephone}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Penalty Information */}
            {selectedPayment.penalty_type && selectedPayment.penalty_type !== 'None' && (
              <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-4 border border-red-200 dark:border-red-800">
                <h4 className="font-medium text-red-900 dark:text-red-100 flex items-center mb-3">
                  <span className="text-red-500 mr-2">⚠️</span>
                  Penalty Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-red-700 dark:text-red-300 block">Penalty Type</span>
                    <span className="font-medium text-red-900 dark:text-red-100">
                      {selectedPayment.penalty_type}
                    </span>
                  </div>
                  <div>
                    <span className="text-red-700 dark:text-red-300 block">Amount</span>
                    <span className="font-medium text-red-900 dark:text-red-100">
                      {formatCurrency(Number(selectedPayment.penalty_amount) || 0)}
                    </span>
                  </div>
                  <div>
                    <span className="text-red-700 dark:text-red-300 block">Status</span>
                    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                      selectedPayment.penalty_status === 'paid' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' 
                        : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                    }`}>
                      {selectedPayment.penalty_status}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            {selectedPayment.loan_status !== 'paid' && (
              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-600">
                <button
                  onClick={() => setIsDetailModalOpen(false)}
                  className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                >
                  Close
                </button>
                <button
                  onClick={() => handleMarkAsPaid(selectedPayment.pay_id)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                >
                  Mark as Paid
                </button>
              </div>
            )}
          </div>
        )}
      </Modal>


    </div>
  );
};

export default Repayments;