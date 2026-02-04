import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../../context/LanguageContext';
import { members } from '../../utils/mockData';
import useLoans from '../../hooks/useLoans';
import { BackendLoan } from '../../types/loanTypes';
import { MagnifyingGlassIcon, PlusIcon, CheckCircleIcon, XCircleIcon, BanknotesIcon } from '@heroicons/react/24/outline';
import Modal from '../../components/ui/Modal';
import { toast } from 'sonner';
import server from '../../utils/server';

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
}

const tabs: Tab[] = ['all', 'pending', 'active', 'paid', 'rejected', 'cancelled'];

const Loans: React.FC = () => {
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<Tab>('all');

  // hook returns backend-shaped loans
  const { loans: backendLoans = [], loading, error, refresh } = useLoans(30);

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

      return {
        id: Number(l.loanId ?? Date.now()),
        member: memberName,
        amount,
        status,
        progress,
        date: l.requestDate ?? '',
        // backend doesn't provide purpose/term/interest/dueDate in sample, keep undefined
        notes: (l.re as string) || undefined
      } as UiLoan;
    });

    setDisplayLoans(converted);
  }, [backendLoans]);

  const [selectedLoan, setSelectedLoan] = useState<UiLoan | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // new loan form state
  const [newLoan, setNewLoan] = useState({
    member: '',
    amount: '',
    purpose: 'business',
    term: '6',
    interestRate: '5',
    notes: ''
  });

  const [errors, setErrors] = useState({
    member: '',
    amount: '',
    term: '',
    interestRate: ''
  });

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

  // Filtering: tab + search
  const filteredLoans = displayLoans
    .filter(loan => {
      // Admin sees everything appropriate for the tab. 
      // If activeTab is 'all', we might want to exclude 'cancelled' if that's the desired default view,
      // but the user said "And the admin should not be able to see the cancelled loans" in the previous turn,
      // and THEN said "Add the rejected and the canceled tab on the admin side".
      // This implies Admin SHOULD see them in the specific tab.
      // Usually 'all' includes everything. I will leave 'cancelled' in 'all' for admin unless specified otherwise.
      // Or I can hide it from 'all' but show in 'cancelled'.
      // Given "hide cancelled loans to admin" was the OLD instruction, and "Add the rejected and cancelled tab" is the NEW instruction,
      // I will assume visibility is desired.

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewLoan(prev => ({ ...prev, [name]: value }));
    if (errors[name as keyof typeof errors]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    let isValid = true;
    const newErrors = { ...errors };
    if (!newLoan.member) { newErrors.member = t('memberRequired'); isValid = false; }
    if (!newLoan.amount || isNaN(Number(newLoan.amount)) || Number(newLoan.amount) <= 0) { newErrors.amount = t('invalidAmount'); isValid = false; }
    if (!newLoan.term || isNaN(Number(newLoan.term)) || Number(newLoan.term) <= 0) { newErrors.term = t('invalidTerm'); isValid = false; }
    if (!newLoan.interestRate || isNaN(Number(newLoan.interestRate)) || Number(newLoan.interestRate) < 0) { newErrors.interestRate = t('invalidInterestRate'); isValid = false; }
    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const rate = Number(newLoan.interestRate) / 100; // Assuming interestRate is percentage
      const duration = Number(newLoan.term);
      const amount = Number(newLoan.amount);
      const amountTopay = amount + (amount * rate * duration / 12); // Simple interest calculation

      await server.post("/loans", {
        memberId: newLoan.member,
        amount,
        duration,
        re: newLoan.notes || newLoan.purpose,
        rate,
        amountTopay,
      });

      setNewLoan({ member: '', amount: '', purpose: 'business', term: '6', interestRate: '5', notes: '' });
      setIsAddModalOpen(false);
      toast.success(t('loanRequestSubmitted'));
      // Refresh loans list
      refresh();
    } catch (error) {
      console.error("Failed to submit loan:", error);
      toast.error(t('failedToSubmitLoan'));
    }
  };

  const handleStatusChange = async (loanId: number, newStatus: string) => {
    try {
      await server.get(`/loans/actions/${loanId}/${newStatus}`);
      setDisplayLoans(prev => prev.map(l => l.id === loanId ? { ...l, status: newStatus } : l));
      setIsViewModalOpen(false);
      toast.success(newStatus === 'approved' || newStatus === 'active' ? t('loanApproved') : t('loanRejected'));
      // Refresh the loans list
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
      <Modal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} title={t('loanDetails')}>
        {selectedLoan && (
          <div className="space-y-6">
            <div className="bg-amber-50 dark:bg-amber-900/30 p-4 rounded-xl">
              <div className="flex items-center">
                <BanknotesIcon className="h-8 w-8 text-amber-600 dark:text-amber-400" />
                <div className="ml-3">
                  <h3 className="text-lg font-medium text-amber-800 dark:text-amber-300">{formatCurrency(selectedLoan.amount)}</h3>
                  <p className="text-sm text-amber-700 dark:text-amber-400">{t('loanAmount')}</p>
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
                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${(selectedLoan.status === 'approved' || selectedLoan.status === 'active') ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' :
                  selectedLoan.status === 'rejected' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' :
                    selectedLoan.status === 'cancelled' ? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300' :
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

              {selectedLoan.term !== undefined && <div>
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('term')}</h4>
                <p className="text-base text-gray-800 dark:text-white">{selectedLoan.term} {t('months')}</p>
              </div>}

              {selectedLoan.interestRate !== undefined && <div>
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('interestRate')}</h4>
                <p className="text-base text-gray-800 dark:text-white">{selectedLoan.interestRate}%</p>
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

            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button onClick={() => setIsViewModalOpen(false)} className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                {t('close')}
              </button>

              {selectedLoan.status === 'pending' && <>
                <button onClick={() => handleStatusChange(selectedLoan.id, 'rejected')} className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 flex items-center">
                  <XCircleIcon className="h-5 w-5 mr-1" />{t('rejectLoan')}
                </button>
                <button onClick={() => handleStatusChange(selectedLoan.id, 'active')} className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 flex items-center">
                  <CheckCircleIcon className="h-5 w-5 mr-1" />{t('approveLoan')}
                </button>
              </>}
            </div>
          </div>
        )}
      </Modal>

      {/* Apply for Loan Modal */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title={t('applyForLoan')} size="lg">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="member" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('member')} *</label>
              <select id="member" name="member" value={newLoan.member} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white">
                <option value="">{t('selectMember')}</option>
                {members.map(member => <option key={member.id} value={member.id}>{member.name}</option>)}
              </select>
              {errors.member && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.member}</p>}
            </div>

            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('loanAmount')} *</label>
              <input type="number" id="amount" name="amount" value={newLoan.amount} onChange={handleInputChange} min="1" step="1" className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white" placeholder="0" />
              {errors.amount && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.amount}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="purpose" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('loanPurpose')} *</label>
                <select id="purpose" name="purpose" value={newLoan.purpose} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white">
                  {loanPurposes.map(p => <option key={p} value={p}>{t(p)}</option>)}
                </select>
              </div>

              <div>
                <label htmlFor="term" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('term')} ({t('months')}) *</label>
                <input type="number" id="term" name="term" value={newLoan.term} onChange={handleInputChange} min="1" max="36" className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white" />
                {errors.term && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.term}</p>}
              </div>

              <div>
                <label htmlFor="interestRate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('interestRate')} (%) *</label>
                <input type="number" id="interestRate" name="interestRate" value={newLoan.interestRate} onChange={handleInputChange} min="0" max="30" step="0.1" className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white" />
                {errors.interestRate && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.interestRate}</p>}
              </div>
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