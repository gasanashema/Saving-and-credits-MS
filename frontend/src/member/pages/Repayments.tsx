import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../../context/LanguageContext';
import { PlusIcon, CalendarIcon, UserIcon, PhoneIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline';
import Modal from '../../components/ui/Modal';
import { toast } from 'sonner';
import useMemberPaymentHistory from '../../hooks/useMemberPaymentHistory';
import useLoanPaymentDetails from '../../hooks/useLoanPaymentDetails';
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
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const { payments, summary, loading, error, refresh } = useMemberPaymentHistory();
  
  // Payment modal state
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedLoanForPayment, setSelectedLoanForPayment] = useState<Payment | null>(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentPhone, setPaymentPhone] = useState('');
  const [paymentErrors, setPaymentErrors] = useState({ amount: '', phone: '' });
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Payment details for selected loan
  const { paymentDetails, loading: paymentLoading, refresh: refreshPaymentDetails } = useLoanPaymentDetails(selectedLoanForPayment?.loanId || null);
  console.log('Repayments page: payments data:', payments);
  console.log('Repayments page: summary:', summary);



  const handleMarkAsPaid = async (paymentId: number) => {
    console.log('handleMarkAsPaid called with paymentId:', paymentId);
    try {
      console.log('Making PUT request to /loans/payment/' + paymentId + '/mark-paid');
      await server.put(`/loans/payment/${paymentId}/mark-paid`);
      console.log('PUT request successful, refreshing data');
      refresh();
      toast.success('Payment marked as paid successfully');
      setIsDetailModalOpen(false);
    } catch (error) {
      console.error('Mark as paid error:', error);
      console.log('Failed to mark payment as paid');
      toast.error('Failed to mark payment as paid');
    }
  };

  // Use summary from hook
  const totalPaid = summary.totalAmountPaid;
  const totalRemaining = summary.totalRemaining;

  // No filtering
  const filteredPayments = payments;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'RWF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const handlePayNow = (payment: Payment) => {
    setSelectedLoanForPayment(payment);
    setPaymentAmount('');
    setPaymentPhone(payment.telephone || '');
    setIsPaymentModalOpen(true);
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLoanForPayment) return;

    const amount = Number(paymentAmount);
    if (isNaN(amount) || amount <= 0) {
      setPaymentErrors({ amount: t('invalidAmount') || 'Invalid amount', phone: '' });
      return;
    }

    if (!paymentPhone.trim()) {
      setPaymentErrors({ amount: '', phone: 'Phone number is required' });
      return;
    }

    if (paymentDetails && amount > paymentDetails.summary.remainingAmount) {
      setPaymentErrors({ amount: 'Amount exceeds remaining balance', phone: '' });
      return;
    }

    setIsProcessingPayment(true);

    try {
      const response = await server.put('/loans/pay', {
        loanId: selectedLoanForPayment.loanId,
        amount,
        phone: paymentPhone
      });

      setIsPaymentModalOpen(false);
      setPaymentAmount('');
      setPaymentPhone('');
      toast.success('Payment completed successfully! 🎉');
      refresh();
    } catch (error) {
      console.error('Payment recording error:', error);
      toast.error('Failed to process payment. Please try again.');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  console.log('Repayments page: loading:', loading, 'error:', error);
  if (loading) {
    console.log('Showing loading');
    return <div className="p-4 text-gray-500">{t('loading')}</div>;
  }
  if (error) {
    console.log('Showing error:', error);
    return <div className="p-4 text-red-500">{error}</div>;
  }
  console.log('Rendering repayments table');

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
                  {Number(payment.remaining_amount || 0) > 0 && (
                    <button
                      onClick={() => handlePayNow(payment)}
                      className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded mr-2"
                    >
                      {t('payNow')}
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setSelectedPayment(payment);
                      setIsDetailModalOpen(true);
                    }}
                    className="text-purple-600 hover:text-purple-900 dark:text-purple-400 dark:hover:text-purple-300"
                  >
                    {t('viewDetails')}
                  </button>
                </td>
              </motion.tr>
            ))}
            {filteredPayments.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">{t('noData')}</td>
              </tr>
            )}
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
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-600">
              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>


      {/* MTN Mobile Money Payment Modal */}
      <Modal isOpen={isPaymentModalOpen} onClose={() => setIsPaymentModalOpen(false)} title="">
        <div className="space-y-6">
          {/* MTN Header */}
          <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 p-6 rounded-xl text-center">
            <div className="flex items-center justify-center mb-2">
              <div className="bg-white rounded-full p-2 mr-3">
                <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">MTN</span>
                </div>
              </div>
              <h2 className="text-xl font-bold text-gray-800">MTN Mobile Money</h2>
            </div>
            <p className="text-gray-700 text-sm">Payment Demo</p>
          </div>

          <form onSubmit={handlePaymentSubmit} className="space-y-6">
            {paymentDetails && (
              <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-xl border border-blue-200 dark:border-blue-700">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-blue-700 dark:text-blue-300">Remaining Balance:</span>
                  <span className="font-semibold text-blue-800 dark:text-blue-200">{formatCurrency(paymentDetails.summary.remainingAmount)}</span>
                </div>
              </div>
            )}

            <div>
              <label htmlFor="paymentAmount" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Payment Amount (RWF) *</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <span className="text-gray-500 dark:text-gray-400">RWF</span>
                </div>
                <input
                  type="number"
                  id="paymentAmount"
                  value={paymentAmount}
                  onChange={(e) => {
                    setPaymentAmount(e.target.value);
                    if (paymentErrors.amount) setPaymentErrors(prev => ({ ...prev, amount: '' }));
                  }}
                  min="1"
                  step="1"
                  max={paymentDetails?.summary.remainingAmount || undefined}
                  className="w-full pl-12 px-3 py-3 border-2 border-yellow-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 dark:bg-gray-700 dark:text-white dark:border-yellow-600"
                  placeholder="Enter amount"
                  disabled={isProcessingPayment}
                />
              </div>
              {paymentErrors.amount && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{paymentErrors.amount}</p>}
            </div>

            <div>
              <label htmlFor="paymentPhone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">MTN Mobile Money Number *</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <span className="text-gray-500 dark:text-gray-400">+250</span>
                </div>
                <input
                  type="tel"
                  id="paymentPhone"
                  value={paymentPhone}
                  onChange={(e) => {
                    const value = e.target.value.replace(/^0+/, '');
                    setPaymentPhone(value);
                    if (paymentErrors.phone) setPaymentErrors(prev => ({ ...prev, phone: '' }));
                  }}
                  maxLength={9}
                  className="w-full pl-16 px-3 py-3 border-2 border-yellow-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 dark:bg-gray-700 dark:text-white dark:border-yellow-600"
                  placeholder="7XXXXXXXX"
                  disabled={isProcessingPayment}
                />
              </div>
              {paymentErrors.phone && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{paymentErrors.phone}</p>}
              <p className="mt-1 text-xs text-gray-500">Enter the phone number registered with MTN Mobile Money</p>
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={() => setIsPaymentModalOpen(false)}
                className="flex-1 px-4 py-3 text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                disabled={isProcessingPayment}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-3 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg font-medium shadow-sm transition-colors flex items-center justify-center"
                disabled={isProcessingPayment}
              >
                {isProcessingPayment ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </>
                ) : (
                  <>
                    <span className="mr-2">Pay</span>
                    {paymentAmount && (
                      <span className="font-bold">{formatCurrency(Number(paymentAmount))}</span>
                    )}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </Modal>


    </div>
  );
};

export default Repayments;
