import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../../context/LanguageContext';
import useLoans from '../../hooks/useLoans';
import { BackendLoan } from '../../types/loanTypes';
import { MagnifyingGlassIcon, BanknotesIcon, UserIcon, PhoneIcon, CalendarIcon } from '@heroicons/react/24/outline';
import Modal from '../../components/ui/Modal';
import { toast } from 'sonner';
import server from '../../utils/server';

type Tab = 'all' | 'pending' | 'active' | 'paid' | 'rejected' | 'cancelled';

interface UiLoan {
  id: number;
  memberId: number;
  member: string;
  telephone: string;
  amount: number;
  amountToPay: number;
  payedAmount: number;
  status: string;
  progress: number;
  date: string;
  purpose?: string;
  term?: number;
  interestRate?: number;
  dueDate?: string;
  notes?: string;
}

const tabs: Tab[] = ['all', 'pending', 'active', 'paid', 'rejected', 'cancelled'];

// Status colors configuration
const statusColors = {
  active: {
    header: 'from-green-500 to-green-600',
    badge: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    progress: 'bg-green-500',
  },
  paid: {
    header: 'from-blue-500 to-blue-600',
    badge: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    progress: 'bg-blue-500',
  },
  pending: {
    header: 'from-amber-500 to-amber-600',
    badge: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    progress: 'bg-amber-500',
  },
  rejected: {
    header: 'from-red-500 to-red-600',
    badge: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    progress: 'bg-red-500',
  },
  cancelled: {
    header: 'from-gray-500 to-gray-600',
    badge: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
    progress: 'bg-gray-500',
  },
  default: {
    header: 'from-gray-400 to-gray-500',
    badge: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
    progress: 'bg-gray-500',
  },
};

const Loans: React.FC = () => {
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<Tab>('all');

  const { loans: backendLoans = [], loading, error, refresh } = useLoans(50);

  const [displayLoans, setDisplayLoans] = useState<UiLoan[]>([]);

  useEffect(() => {
    const converted: UiLoan[] = (backendLoans || []).map((l: BackendLoan) => {
      const amount = Number(l.amount ?? 0);
      const amountToPay = Number(l.amountToPay ?? l.amountTopay ?? 0);
      const payed = Number(l.payedAmount ?? 0);
      const progress = amountToPay > 0 ? Math.round((payed / amountToPay) * 100) : 0;

      const rawStatus = (l.status ?? l.lstatus ?? '').toString();
      const status = rawStatus === 'approved' ? 'active' : rawStatus;

      const memberName = `${l.firstName ?? ''} ${l.lastName ?? ''}`.trim() || `#${l.memberId}`;

      return {
        id: Number(l.loanId ?? Date.now()),
        memberId: Number(l.memberId ?? 0),
        member: memberName,
        telephone: l.telephone ?? '',
        amount,
        amountToPay,
        payedAmount: payed,
        status,
        progress,
        date: l.requestDate ?? '',
        purpose: l.re as string || undefined,
        term: l.duration ? Number(l.duration) : undefined,
        interestRate: l.rate ? Number(l.rate) * 100 : undefined,
        notes: (l.re as string) || undefined
      } as UiLoan;
    });

    setDisplayLoans(converted);
  }, [backendLoans]);

  const [selectedLoan, setSelectedLoan] = useState<UiLoan | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

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

  const getStatusColors = (status: string) => {
    const normalizedStatus = status === 'approved' ? 'active' : status;
    return statusColors[normalizedStatus as keyof typeof statusColors] || statusColors.default;
  };

  const filteredLoans = displayLoans
    .filter(loan => {
      if (activeTab === 'all') return true;
      if (activeTab === 'active') return loan.status === 'active' || loan.status === 'approved';
      return loan.status === activeTab;
    })
    .filter(loan => {
      if (!searchTerm) return true;
      const q = searchTerm.toLowerCase();
      return (
        loan.member.toLowerCase().includes(q) ||
        loan.status.toLowerCase().includes(q) ||
        loan.amount.toString().includes(q)
      );
    });

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'RWF', minimumFractionDigits: 0 }).format(value);

  const handleViewLoan = (loan: UiLoan) => {
    setSelectedLoan(loan);
    setIsViewModalOpen(true);
  };

  const handleStatusChange = async (loanId: number, newStatus: string) => {
    try {
      await server.get(`/loans/actions/${loanId}/${newStatus}`);
      setDisplayLoans(prev => prev.map(l => l.id === loanId ? { ...l, status: newStatus } : l));
      setIsViewModalOpen(false);
      toast.success(newStatus === 'approved' || newStatus === 'active' ? t('loanApproved') : t('loanRejected'));
      refresh();
    } catch (error) {
      console.error('Failed to update loan status:', error);
      toast.error('Failed to update loan status');
    }
  };

  if (loading) return <div className="p-4 text-gray-500">{t('loading')}</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">{t('loans')}</h1>
        <p className="text-gray-500 dark:text-gray-400">{t('manageLoansDescription')}</p>
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

      {/* Search */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-4 border border-gray-200 dark:border-gray-700">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder={t('searchLoans')}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Cards Grid */}
      {filteredLoans.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-8 text-center border border-gray-200 dark:border-gray-700">
          <p className="text-gray-500 dark:text-gray-400">{t('noData')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredLoans.map((loan) => {
            const colors = getStatusColors(loan.status);
            return (
              <motion.div
                key={loan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => handleViewLoan(loan)}
              >
                {/* Card Header */}
                <div className={`bg-gradient-to-r ${colors.header} p-4`}>
                  <div className="flex justify-between items-start">
                    <div className="flex items-center">
                      <div className="bg-white/20 rounded-full p-2">
                        <BanknotesIcon className="h-6 w-6 text-white" />
                      </div>
                      <div className="ml-3">
                        <p className="text-white font-semibold text-lg">{formatCurrency(loan.amount)}</p>
                        <p className="text-white/80 text-sm">{t('loanAmount')}</p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors.badge}`}>
                      {t(loan.status === 'approved' ? 'active' : loan.status)}
                    </span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-4 space-y-4">
                  {/* Member Info */}
                  <div className="flex items-center space-x-3">
                    <div className="bg-gray-100 dark:bg-gray-700 rounded-full p-2">
                      <UserIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800 dark:text-white">{loan.member}</p>
                      {loan.telephone && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                          <PhoneIcon className="h-3 w-3 mr-1" />
                          {loan.telephone}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Progress Section */}
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-500 dark:text-gray-400">{t('repaymentProgress')}</span>
                      <span className="font-medium text-gray-800 dark:text-white">{loan.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                      <div 
                        className={`h-3 rounded-full transition-all ${colors.progress}`}
                        style={{ width: `${loan.progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Amount Details */}
                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{t('amountPaid')}</p>
                      <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                        {formatCurrency(loan.payedAmount)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{t('remainingBalance')}</p>
                      <p className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                        {formatCurrency(loan.amountToPay - loan.payedAmount)}
                      </p>
                    </div>
                  </div>

                  {/* Date and View Details on same line */}
                  <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-700">
                    <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                      <CalendarIcon className="h-4 w-4 mr-1" />
                      {loan.date ? new Date(loan.date).toLocaleDateString() : '-'}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewLoan(loan);
                      }}
                      className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${colors.header}`}
                    >
                      {t('viewDetails')}
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* View Modal */}
      <Modal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} title={t('loanDetails')}>
        {selectedLoan && (
          <div className="space-y-6">
            <div className={`bg-gradient-to-br ${getStatusColors(selectedLoan.status).header} p-4 rounded-xl`}>
              <div className="flex items-center">
                <BanknotesIcon className="h-8 w-8 text-white" />
                <div className="ml-3">
                  <h3 className="text-lg font-medium text-white">{formatCurrency(selectedLoan.amount)}</h3>
                  <p className="text-white/80 text-sm">{t('loanAmount')}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('member')}</h4>
                <p className="text-base text-gray-800 dark:text-white">{selectedLoan.member}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('status')}</h4>
                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColors(selectedLoan.status).badge}`}>
                  {t(selectedLoan.status === 'approved' ? 'active' : selectedLoan.status)}
                </span>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('applicationDate')}</h4>
                <p className="text-base text-gray-800 dark:text-white">{selectedLoan.date ? new Date(selectedLoan.date).toLocaleDateString() : '-'}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('repaymentProgress')}</h4>
                <div className="flex items-center">
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mr-2">
                    <div className={`h-2.5 rounded-full ${getStatusColors(selectedLoan.status).progress}`} style={{ width: `${selectedLoan.progress}%` }} />
                  </div>
                  <span className="text-sm text-gray-800 dark:text-white">{selectedLoan.progress}%</span>
                </div>
              </div>

              {selectedLoan.purpose && <div>
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('purpose')}</h4>
                <p className="text-base text-gray-800 dark:text-white capitalize">{t(selectedLoan.purpose)}</p>
              </div>}

              {selectedLoan.term !== undefined && <div>
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('term')}</h4>
                <p className="text-base text-gray-800 dark:text-white">{selectedLoan.term} {t('months')}</p>
              </div>}

              {selectedLoan.interestRate !== undefined && <div>
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('interestRate')}</h4>
                <p className="text-base text-gray-800 dark:text-white">{selectedLoan.interestRate}%</p>
              </div>}
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button onClick={() => setIsViewModalOpen(false)} className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                {t('close')}
              </button>

              {selectedLoan.status === 'pending' && <>
                <button onClick={() => handleStatusChange(selectedLoan.id, 'rejected')} className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
                  {t('rejectLoan')}
                </button>
                <button onClick={() => handleStatusChange(selectedLoan.id, 'active')} className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
                  {t('approveLoan')}
                </button>
              </>}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Loans;
