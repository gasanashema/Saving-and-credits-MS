import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import useMemberLoans from '../../hooks/useMemberLoans';
import useLoanEligibility from '../../hooks/useLoanEligibility';
import useLoanPaymentDetails from '../../hooks/useLoanPaymentDetails';
import server from '../../utils/server';
import { BackendLoan, LoanPaymentDetails } from '../../types/loanTypes';
import { PlusIcon, CheckCircleIcon, XCircleIcon, BanknotesIcon, CreditCardIcon, ClockIcon } from '@heroicons/react/24/outline';
import Modal from '../../components/ui/Modal';
import { toast } from 'sonner';

// Add loan purposes for the form
const loanPurposes = ['business', 'education', 'housing', 'personal', 'emergency', 'agriculture'];

type Tab = 'all' | 'pending' | 'active' | 'paid' | 'rejected' | 'cancelled';

interface UiLoan {
  id: number;
  member: string;
  amount: number;
  status: string;
  progress: number; // 0-100
  date: string;
  purpose?: string;
  term?: number;
  interestRate?: number;
  dueDate?: string;
  notes?: string;
  amountToPay?: number;
  payedAmount?: number;
}

const tabs: Tab[] = ['all', 'pending', 'active', 'paid', 'rejected', 'cancelled'];

const Loans: React.FC = () => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<Tab>('all');

  // hook returns backend-shaped loans
  const { loans: backendLoans = [], loading, error, refresh } = useMemberLoans();
  // displayLoans is the UI list we render and update locally
  const [displayLoans, setDisplayLoans] = useState<UiLoan[]>([]);

  // Convert backend -> UI shape whenever backend data changes
  useEffect(() => {
    const converted: UiLoan[] = (backendLoans || []).map((l: BackendLoan) => {
      const amount = Number(l.amount ?? 0);
      const amountToPay = Number(l.amountToPay ?? l.amountTopay ?? 0);
      const payed = Number(l.payedAmount ?? 0);
      const progress = amountToPay > 0 ? Math.round((payed / amountToPay) * 100) : 0;

      // backend query returns 'lstatus' in sample -> hook normalization should set status,
      // but handle either lstatus or status here
      const rawStatus = (l.status ?? l.lstatus ?? '').toString();
      const status = rawStatus === 'approved' ? 'active' : rawStatus; // map approved -> active for UI

      const memberName = `${l.firstName ?? ''} ${l.lastName ?? ''}`.trim() || `#${l.memberId}`;

      const uiLoan = {
        id: Number(l.loanId ?? Date.now()),
        member: memberName,
        amount,
        status,
        progress,
        date: l.requestDate ?? '',
        // backend doesn't provide purpose/term/interest/dueDate in sample, keep undefined
        notes: (l.re as string) || undefined,
        amountToPay: Number(l.amountToPay ?? l.amountTopay ?? 0),
        payedAmount: Number(l.payedAmount ?? 0)
      } as UiLoan;

      return uiLoan;
    });

    // Sort loans by date (newest first)
    const sortedLoans = converted.sort((a, b) => {
      const dateA = new Date(a.date || 0).getTime();
      const dateB = new Date(b.date || 0).getTime();
      return dateB - dateA;
    });

    setDisplayLoans(sortedLoans);
  }, [backendLoans]);

  const [selectedLoan, setSelectedLoan] = useState<UiLoan | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentPhone, setPaymentPhone] = useState('');
  const [paymentErrors, setPaymentErrors] = useState({ amount: '', phone: '' });
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // payment details for selected loan
  const { paymentDetails, loading: paymentLoading, error: paymentError, refresh: refreshPaymentDetails } = useLoanPaymentDetails(selectedLoan?.id || null);

  const { user } = useAuth();
  const { eligibility, loading: eligibilityLoading, refresh: refreshEligibility } = useLoanEligibility();

  useEffect(() => {
    if (isAddModalOpen) {
      refreshEligibility();
    }
  }, [isAddModalOpen, refreshEligibility]);

  const maxLoanLimit = eligibility?.limit || 0;
  const isEligible = eligibility?.eligible || false;

  // Set default phone number when modal opens
  useEffect(() => {
    if (isPaymentModalOpen && user?.telephone) {
      setPaymentPhone(user.telephone);
    }
  }, [isPaymentModalOpen, user]);

  // new loan form state
  const [newLoan, setNewLoan] = useState({
    amount: '',
    purpose: 'business',
    notes: ''
  });

  const [errors, setErrors] = useState({
    amount: ''
  });

  // Calculate loan terms based on Rwanda market rates
  const calculateLoanTerms = (amount: number, purpose = 'personal') => {
    if (!amount) return { rate: 0, duration: 0, amountToPay: 0 };

    // Special case: 0% rate for amounts under 50K
    if (amount < 50000) {
      return { rate: 0, duration: 4, amountToPay: amount };
    }

    let annualRate = 18; // Default personal loan rate
    let duration = 6;

    // Special case: 0% rate for small amounts (emergency/personal)
    if (amount <= 100000 && (purpose === 'emergency' || purpose === 'personal')) {
      annualRate = 0;
      duration = 4;
      return { rate: 0, duration: 4, amountToPay: amount };
    }

    // Set rates based on loan purpose (Rwanda market rates)
    if (purpose === 'housing') {
      annualRate = 14; // Mortgage rates 11-16%
    } else if (purpose === 'business') {
      annualRate = 17; // SME loans 16-19%
    } else if (purpose === 'personal' || purpose === 'emergency') {
      annualRate = 18; // Personal loans 16-19%
    } else if (purpose === 'education') {
      annualRate = 15; // Lower rate for education
    } else {
      annualRate = 18; // Default
    }

    // Set duration based on amount
    if (amount <= 500000) {
      duration = 6;
    } else if (amount <= 1000000) {
      duration = 12;
    } else if (amount <= 2000000) {
      duration = 18;
    }

    // Calculate total amount using compound interest for the duration
    const monthlyRate = annualRate / 100 / 12;
    const amountToPay = amount * Math.pow(1 + monthlyRate, duration);

    return { rate: annualRate, duration, amountToPay };
  };

  const formatNumberWithCommas = (value: string) => {
    const numericValue = value.replace(/[^0-9]/g, '');
    return numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  const parseFormattedNumber = (value: string) => {
    return value.replace(/,/g, '');
  };

  const loanAmount = Number(parseFormattedNumber(newLoan.amount)) || 0;
  const { rate, duration, amountToPay } = calculateLoanTerms(loanAmount, newLoan.purpose);

  const tabColor = (tab: Tab) => {
    switch (tab) {
      case 'pending': return 'bg-amber-600 text-white';
      case 'active': return 'bg-green-600 text-white';
      case 'paid': return 'bg-blue-600 text-white';
      case 'rejected': return 'bg-red-600 text-white';
      case 'cancelled': return 'bg-gray-500 text-white';
      default: return 'bg-gray-600 text-white';
    }
  };

  // Filtering: tab
  const filteredLoans = displayLoans
    .filter(loan => {
      if (activeTab === 'all') return loan.status !== 'cancelled';
      if (activeTab === 'active') return loan.status === 'active' || loan.status === 'approved';
      return loan.status === activeTab;
    });

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'RWF', minimumFractionDigits: 0 }).format(value);

  const handleViewLoan = (loan: UiLoan) => {
    setSelectedLoan(loan);
    setIsViewModalOpen(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    if (name === 'amount') {
      const numericValue = Number(parseFormattedNumber(value));
      // Allow typing if within reasonable bounds (e.g. up to limit or slightly more before validation hits)
      // But user asked to limit him. Let's strictly limit or allow typing but show error? 
      // "system has to limit him". I'll let him type but validate on set/submit, or cap it?
      // "if he tries to add amount beyond limit... system has to limit him".
      // Let's cap the input visually or show toast?
      // I'll allow typing to let him see what he entered, but validate in validateForm and show red border/text.
      // Or I can prevent typing beyond limit. 
      // Preventing typing is annoying if limit is 0 (can't even type to test).
      // I'll stick to validation.

      const formattedValue = formatNumberWithCommas(value);
      setNewLoan(prev => ({ ...prev, [name]: formattedValue }));

      if (eligibility && numericValue > maxLoanLimit) {
        setErrors(prev => ({ ...prev, amount: `Maximum eligible amount is ${formatCurrency(maxLoanLimit)}` }));
      } else {
        if (errors.amount) setErrors(prev => ({ ...prev, amount: '' }));
      }
    } else {
      setNewLoan(prev => ({ ...prev, [name]: value }));
    }

    if (errors[name as keyof typeof errors]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    let isValid = true;
    const newErrors = { ...errors };
    const amount = Number(parseFormattedNumber(newLoan.amount));
    if (!newLoan.amount || isNaN(amount) || amount <= 0) {
      newErrors.amount = 'Please enter a valid loan amount';
      isValid = false;
    } else if (amount > maxLoanLimit) {
      newErrors.amount = `Maximum eligible amount is ${formatCurrency(maxLoanLimit)}`;
      isValid = false;
    }
    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const amount = Number(parseFormattedNumber(newLoan.amount));
      const { rate, duration, amountToPay } = calculateLoanTerms(amount);

      await server.post('/loans', {
        amount,
        duration,
        rate,
        amountTopay: amountToPay,
        re: `${newLoan.purpose}: ${newLoan.notes}`.trim(),
        status: 'pending'
      });

      setNewLoan({ amount: '', purpose: 'business', notes: '' });
      setIsAddModalOpen(false);
      toast.success(t('loanRequestSubmitted'));

      // Refresh the loans list
      refresh();
    } catch (error) {
      console.error('Loan application error:', error);
      toast.error('Failed to submit loan application');
    }
  };

  const handleStatusChange = async (loanId: number, action: string) => {
    try {
      await server.get(`/loans/actions/${loanId}/${action}`);
      if (action === 'delete') {
        setDisplayLoans(prev => prev.filter(l => l.id !== loanId));
        toast.success(t('loanDeleted') || 'Loan deleted successfully');
      } else if (action === 'cancel') {
        setDisplayLoans(prev => prev.map(l => l.id === loanId ? { ...l, status: 'cancelled' } : l));
        toast.success(t('loanCancelled') || 'Loan cancelled successfully');
      } else {
        setDisplayLoans(prev => prev.map(l => l.id === loanId ? { ...l, status: action } : l));
        toast.success(action === 'approved' || action === 'active' ? t('loanApproved') : t('loanRejected'));
      }
      refresh();
    } catch (error) {
      console.error('Status change error:', error);
      toast.error('Failed to update loan status');
    }
  };



  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLoan) return;

    const amount = Number(paymentAmount);
    if (isNaN(amount) || amount <= 0) {
      setPaymentErrors({ amount: t('invalidAmount'), phone: '' });
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
      // Record payment via API
      const response = await server.put('/loans/pay', {
        loanId: selectedLoan.id,
        amount,
        phone: paymentPhone
      });

      // Update local state to reflect payment
      setDisplayLoans(prev => prev.map(loan =>
        loan.id === selectedLoan.id
          ? { ...loan, payedAmount: (loan.payedAmount || 0) + amount }
          : loan
      ));

      // Refresh payment details if modal is still open
      if (isPaymentModalOpen) {
        refreshPaymentDetails();
      }

      setIsPaymentModalOpen(false);
      setPaymentAmount('');
      setPaymentPhone('');
      toast.success('Payment completed successfully! 🎉');
    } catch (error) {
      console.error('Payment recording error:', error);
      toast.error('Failed to process payment. Please try again.');
    } finally {
      setIsProcessingPayment(false);
    }
  };



  if (loading) return <div className="p-4 text-gray-500">{t('loading')}</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;

  // Calculate total active loans (remaining amount to pay)
  const totalActiveLoans = displayLoans
    .filter(loan => loan.status === 'active' || loan.status === 'approved')
    .reduce((sum, loan) => sum + ((loan.amountToPay ?? loan.amount) - (loan.payedAmount ?? 0)), 0);

  return (
    <div className="space-y-6">
      {/* Total Active Loans Summary */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl shadow-sm p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">{t('totalActiveLoans')}</h2>
            <p className="text-blue-100">{t('sumOfActiveLoans')}</p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold">{formatCurrency(totalActiveLoans)}</p>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">{t('loans')}</h1>
          <p className="text-gray-500 dark:text-gray-400">{t('manageLoansDescription')}</p>
        </div>
        <div className="flex space-x-3">
          <button onClick={() => setIsAddModalOpen(true)} className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg flex items-center">
            <PlusIcon className="h-5 w-5 mr-2" />
            {t('applyForLoan')}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center space-x-3">
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${activeTab === tab ? tabColor(tab) : 'bg-transparent text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
          >
            {t(tab)}
          </button>
        ))}
      </div>


      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-700">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('member')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('loanAmount')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('status')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('date')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('repaymentProgress')}</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('actions')}</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredLoans.map(loan => (
                <motion.tr key={loan.id} className="hover:bg-gray-50 dark:hover:bg-gray-700" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.25 }}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-200">{loan.member}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800 dark:text-gray-200">{formatCurrency(loan.amount)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${(loan.status === 'approved' || loan.status === 'active') ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' :
                      loan.status === 'rejected' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' :
                        loan.status === 'paid' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' :
                          loan.status === 'cancelled' ? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300' :
                            'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                      }`}>
                      {t(loan.status === 'approved' ? 'active' : loan.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{loan.date ? new Date(loan.date).toLocaleDateString() : '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                      <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${loan.progress}%` }} />
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400 mt-1 block">{loan.progress}%</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button onClick={() => handleViewLoan(loan)} className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300">{t('viewDetails')}</button>
                  </td>
                </motion.tr>
              ))}
              {filteredLoans.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">{t('noData')}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Modal */}
      <Modal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} title={t('loanDetails')} size="xl">
        {selectedLoan && (() => {
          // Calculate loan terms for selected loan
          const loanTerms = calculateLoanTerms(selectedLoan.amount, selectedLoan.notes?.split(':')[0] || 'personal');

          // Calculate remaining time (assuming loan starts from application date)
          const startDate = new Date(selectedLoan.date);
          const endDate = new Date(startDate);
          endDate.setMonth(endDate.getMonth() + loanTerms.duration);
          const now = new Date();
          const remainingMonths = Math.max(0, Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 30)));

          return (
            <div className="space-y-6">
              <div className="bg-amber-50 dark:bg-amber-900/30 p-4 rounded-xl">
                <div className="flex items-center">
                  <BanknotesIcon className="h-8 w-8 text-amber-600 dark:text-amber-400" />
                  <div className="ml-3">
                    <h3 className="text-lg font-medium text-amber-800 dark:text-amber-300">{formatCurrency(selectedLoan.amount)}</h3>
                    <p className="text-sm text-amber-700 dark:text-amber-400">Requested Amount</p>
                  </div>
                </div>
              </div>

              {/* Loan Terms Summary */}
              <div className="grid grid-cols-4 gap-4">
                <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg text-center">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Interest Rate</p>
                  <p className="text-xl font-bold text-blue-600 dark:text-blue-400">{loanTerms.rate}%</p>
                </div>
                <div className="bg-green-50 dark:bg-green-900/30 p-4 rounded-lg text-center">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Duration</p>
                  <p className="text-xl font-bold text-green-600 dark:text-green-400">{loanTerms.duration} months</p>
                </div>
                <div className="bg-purple-50 dark:bg-purple-900/30 p-4 rounded-lg text-center">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Amount to Pay</p>
                  <p className="text-xl font-bold text-purple-600 dark:text-purple-400">{formatCurrency(loanTerms.amountToPay)}</p>
                </div>
                <div className="bg-orange-50 dark:bg-orange-900/30 p-4 rounded-lg text-center">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Remaining Time</p>
                  <p className="text-xl font-bold text-orange-600 dark:text-orange-400">{remainingMonths} months</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('member')}</h4>
                  <p className="text-base text-gray-800 dark:text-white">{selectedLoan.member}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('status')}</h4>
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${(selectedLoan.status === 'approved' || selectedLoan.status === 'active') ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' :
                    selectedLoan.status === 'rejected' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' :
                      'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                    }`}>{t(selectedLoan.status === 'approved' ? 'active' : selectedLoan.status)}</span>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('applicationDate')}</h4>
                  <p className="text-base text-gray-800 dark:text-white">{selectedLoan.date ? new Date(selectedLoan.date).toLocaleDateString() : '-'}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('repaymentProgress')}</h4>
                  <div className="flex items-center">
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mr-2">
                      <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${selectedLoan.progress}%` }} />
                    </div>
                    <span className="text-sm text-gray-800 dark:text-white">{selectedLoan.progress}%</span>
                  </div>
                </div>

                {selectedLoan.purpose && <div>
                  <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('purpose')}</h4>
                  <p className="text-base text-gray-800 dark:text-white capitalize">{t(selectedLoan.purpose)}</p>
                </div>}



                {selectedLoan.dueDate && <div>
                  <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('dueDate')}</h4>
                  <p className="text-base text-gray-800 dark:text-white">{new Date(selectedLoan.dueDate).toLocaleDateString()}</p>
                </div>}
              </div>

              {selectedLoan.notes && <div>
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('notes')}</h4>
                <p className="text-base text-gray-800 dark:text-white mt-1">{selectedLoan.notes}</p>
              </div>}

              {/* Repayment Section */}
              {paymentDetails && (
                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4 flex items-center">
                    <CreditCardIcon className="h-5 w-5 mr-2" />
                    {t('repaymentDetails')}
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-xl">
                      <div className="flex items-center">
                        <BanknotesIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                        <div className="ml-3">
                          <h4 className="text-sm font-medium text-blue-800 dark:text-blue-300">{t('totalAmount')}</h4>
                          <p className="text-lg font-semibold text-blue-900 dark:text-blue-100">{formatCurrency(paymentDetails.summary.totalAmount)}</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-green-50 dark:bg-green-900/30 p-4 rounded-xl">
                      <div className="flex items-center">
                        <CheckCircleIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
                        <div className="ml-3">
                          <h4 className="text-sm font-medium text-green-800 dark:text-green-300">{t('paidAmount')}</h4>
                          <p className="text-lg font-semibold text-green-900 dark:text-green-100">{formatCurrency(paymentDetails.summary.paidAmount)}</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-red-50 dark:bg-red-900/30 p-4 rounded-xl">
                      <div className="flex items-center">
                        <ClockIcon className="h-6 w-6 text-red-600 dark:text-red-400" />
                        <div className="ml-3">
                          <h4 className="text-sm font-medium text-red-800 dark:text-red-300">{t('remainingAmount')}</h4>
                          <p className="text-lg font-semibold text-red-900 dark:text-red-100">{formatCurrency(paymentDetails.summary.remainingAmount)}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {paymentDetails.payments.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">{t('paymentHistory')}</h4>
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {paymentDetails.payments.map(payment => (
                          <div key={payment.pay_id} className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <div>
                              <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{formatCurrency(payment.amount)}</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">{new Date(payment.pay_date).toLocaleDateString()}</p>
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{payment.recorder_name}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                {selectedLoan.status === 'active' && (
                  <button onClick={() => setIsPaymentModalOpen(true)} className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 flex items-center">
                    <CreditCardIcon className="h-5 w-5 mr-1" />Pay with MTN MoMo
                  </button>
                )}

                <button onClick={() => setIsViewModalOpen(false)} className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                  {t('close')}
                </button>

                {selectedLoan.status === 'pending' && (
                  <button onClick={() => handleStatusChange(selectedLoan.id, 'cancel')} className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 flex items-center">
                    <XCircleIcon className="h-5 w-5 mr-1" />{t('cancelLoan')}
                  </button>
                )}

                {selectedLoan.status === 'cancelled' && (
                  <button onClick={() => handleStatusChange(selectedLoan.id, 'delete')} className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 flex items-center">
                    <XCircleIcon className="h-5 w-5 mr-1" />{t('delete')}
                  </button>
                )}
              </div>
            </div>
          );
        })()}
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
            <p className="text-gray-700 text-sm">Fake Payment Demo</p>
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
                    setPaymentPhone(e.target.value);
                    if (paymentErrors.phone) setPaymentErrors(prev => ({ ...prev, phone: '' }));
                  }}
                  className="w-full pl-16 px-3 py-3 border-2 border-yellow-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 dark:bg-gray-700 dark:text-white dark:border-yellow-600"
                  placeholder="78X XXX XXX"
                  disabled={isProcessingPayment}
                />
              </div>
              {paymentErrors.phone && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{paymentErrors.phone}</p>}
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Enter your MTN Mobile Money number</p>
            </div>

            {/* Payment Instructions */}
            {!isProcessingPayment ? (
              <div className="bg-yellow-50 dark:bg-yellow-900/30 p-4 rounded-xl border border-yellow-200 dark:border-yellow-700">
                <h4 className="font-medium text-yellow-800 dark:text-yellow-300 mb-2">Payment Instructions:</h4>
                <ol className="text-sm text-yellow-700 dark:text-yellow-400 space-y-1">
                  <li>1. Enter your MTN Mobile Money number</li>
                  <li>2. Enter the payment amount</li>
                  <li>3. Click "Pay Now" to complete the payment</li>
                </ol>
                <p className="text-xs text-yellow-600 dark:text-yellow-500 mt-2">This is a demo payment form. Payment will be recorded instantly.</p>
              </div>
            ) : (
              <div className="bg-blue-50 dark:bg-blue-900/30 p-6 rounded-xl border border-blue-200 dark:border-blue-700 text-center">
                <div className="flex items-center justify-center mb-4">
                  <div className="animate-pulse bg-blue-500 rounded-full p-3">
                    <CreditCardIcon className="h-8 w-8 text-white" />
                  </div>
                </div>
                <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-2">Processing Payment...</h4>
                <p className="text-sm text-blue-700 dark:text-blue-400 mb-3">
                  Recording your payment...
                </p>
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={() => {
                  setIsPaymentModalOpen(false);
                  setPaymentAmount('');
                  setPaymentPhone('');
                  setPaymentErrors({ amount: '', phone: '' });
                }}
                disabled={isProcessingPayment}
                className="px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50"
              >
                {isProcessingPayment ? 'Processing...' : 'Cancel'}
              </button>
              <button
                type="submit"
                disabled={isProcessingPayment}
                className="px-6 py-3 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 disabled:opacity-50 flex items-center"
              >
                {isProcessingPayment ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Processing Payment...
                  </>
                ) : (
                  <>
                    <CreditCardIcon className="h-5 w-5 mr-2" />
                    Pay Now
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </Modal>

      {/* Apply for Loan Modal */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title={t('applyForLoan')} size="lg">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">


            {/* Eligibility Banner */}
            {!eligibilityLoading && (
              <div className={`p-4 rounded-xl border ${isEligible ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                <h4 className={`font-semibold ${isEligible ? 'text-green-800' : 'text-red-800'}`}>
                  {isEligible ? '✅ You are Eligible' : '❌ Not Eligible'}
                </h4>
                <p className={`text-sm ${isEligible ? 'text-green-700' : 'text-red-700'}`}>
                  Max Limit: <strong>{formatCurrency(maxLoanLimit)}</strong>
                </p>
                {!isEligible && eligibility?.reason && <p className="text-xs text-red-600 mt-1">{eligibility.reason}</p>}
              </div>
            )}

            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('loanAmount')} *</label>
              <input
                type="text"
                id="amount"
                name="amount"
                value={newLoan.amount}
                onChange={handleInputChange}
                disabled={!isEligible}
                className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 dark:bg-gray-700 dark:text-white ${errors.amount ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500'}`}
                placeholder={isEligible ? `Enter amount (Max: ${formatCurrency(maxLoanLimit)})` : "Not eligible"}
              />
              {errors.amount && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.amount}</p>}
            </div>

            <div>
              <label htmlFor="purpose" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('loanPurpose')} *</label>
              <select id="purpose" name="purpose" value={newLoan.purpose} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white">
                {loanPurposes.map(p => <option key={p} value={p}>{t(p)}</option>)}
              </select>
            </div>

            <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/30 dark:to-blue-900/30 p-6 rounded-xl border border-green-200 dark:border-green-700">
              <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Loan Terms Preview</h4>
              {loanAmount === 0 ? (
                <p className="text-center text-gray-500 dark:text-gray-400">Enter a loan amount to see the calculations</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Interest Rate</p>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">{rate}%</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Duration</p>
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{duration} months</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Amount to Pay</p>
                    <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{formatCurrency(amountToPay)}</p>
                  </div>
                </div>
              )}
            </div>

            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('notes')}</label>
              <textarea id="notes" name="notes" value={newLoan.notes} onChange={handleInputChange} rows={3} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white" placeholder={t('additionalDetails')}></textarea>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">{t('cancel')}</button>
            <button type="submit" className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500">{t('submitApplication')}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Loans;