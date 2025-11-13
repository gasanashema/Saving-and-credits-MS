import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../../context/LanguageContext';
import { MagnifyingGlassIcon, ExclamationTriangleIcon, UserIcon, PhoneIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import Modal from '../../components/ui/Modal';
import { toast } from 'sonner';
import useMemberPenalties from '../../hooks/useMemberPenalties';
import server from '../../utils/server';

interface Penalty {
  p_id: number;
  date: string;
  amount: number;
  memberId: number;
  pstatus: 'wait' | 'paid';
  PayedArt: string | null;
  confirmedBy: number;
  firstName: string;
  lastName: string;
  id: number;
  telephone: string;
  reason: string;
}


const Penalties: React.FC = () => {
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPenalty, setSelectedPenalty] = useState<Penalty | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentPhone, setPaymentPhone] = useState('');

  const { penalties, total, loading, error, refresh } = useMemberPenalties();

  const getPenaltyTypeName = (pType: number) => {
    const types: { [key: number]: string } = {
      1: 'GUSIBA GUTERA',
      2: 'GUSAKUZA',
      3: 'GUKERERWA'
    };
    return types[pType] || 'Unknown';
  };

  const handlePayPenalty = async (penaltyId: number) => {
    try {
      await server.put(`/penalities/pay/${penaltyId}`);
      refresh();
      toast.success('Penalty marked as paid');
    } catch (error) {
      console.error('Payment error:', error);
      toast.error('Failed to mark penalty as paid');
    }
  };

  const filteredPenalties = penalties.filter(penalty => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase().trim();
    const fullName = `${penalty.firstName} ${penalty.lastName}`.toLowerCase();
    return (
      fullName.includes(searchLower) ||
      String(penalty.amount).includes(searchLower)
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

  const totalPenalties = penalties.length;
  const totalPaid = penalties.filter(p => p.pstatus === 'paid').length;
  const totalPending = penalties.filter(p => p.pstatus === 'wait').length;

  if (loading) return <div className="p-4 text-gray-500">{t('loading')}</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;

  return (
    <div className="space-y-6">
      {/* Header with totals */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Penalties</h3>
          <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">{totalPenalties}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Paid</h3>
          <p className="mt-2 text-3xl font-bold text-emerald-600">{totalPaid}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Pending</h3>
          <p className="mt-2 text-3xl font-bold text-red-600">{totalPending}</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={t('searchPenalties')}
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg"
        />
      </div>

      {/* Penalties Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Member</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Amount</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredPenalties.map((penalty) => (
              <motion.tr
                key={penalty.p_id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {new Date(penalty.date).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                  {`${penalty.firstName} ${penalty.lastName}`}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-red-600 dark:text-red-400">
                  {formatCurrency(penalty.amount)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    penalty.pstatus === 'paid'
                      ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100'
                      : 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'
                  }`}>
                    {penalty.pstatus === 'paid' ? 'Paid' : 'Pending'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                  <button
                    onClick={() => {
                      setSelectedPenalty(penalty);
                      setIsDetailModalOpen(true);
                    }}
                    className="text-purple-600 hover:text-purple-900 dark:text-purple-400 dark:hover:text-purple-300"
                  >
                    View Details
                  </button>
                </td>
              </motion.tr>
            ))}
            {filteredPenalties.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">{t('noData')}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Penalty Detail Modal */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title="Penalty Details"
      >
        {selectedPenalty && (
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-6 text-white">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-red-100">Penalty Amount</p>
                  <h3 className="text-2xl font-bold">{formatCurrency(Number(selectedPenalty.amount) || 0)}</h3>
                  <p className="text-sm text-red-200 mt-1">
                    {new Date(selectedPenalty.date).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                    selectedPenalty.pstatus === 'paid' 
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {selectedPenalty.pstatus === 'paid' ? 'Paid' : 'Pending'}
                  </span>
                </div>
              </div>
            </div>

            {selectedPenalty.reason && (
              <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-xl">
                <div className="flex items-center">
                  <ExclamationTriangleIcon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                  <div className="ml-3">
                    <h3 className="text-lg font-medium text-blue-800 dark:text-blue-300">{getPenaltyTypeName(Number(selectedPenalty.reason) || 0)}</h3>
                    <p className="text-sm text-blue-700 dark:text-blue-400">Penalty Reason</p>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 space-y-4">
              <h4 className="font-medium text-gray-900 dark:text-white flex items-center">
                <UserIcon className="h-5 w-5 mr-2 text-red-500" />
                Member Details
              </h4>
              <div className="space-y-2">
                <div>
                  <span className="text-gray-500 block text-sm">Name</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {`${selectedPenalty.firstName} ${selectedPenalty.lastName}`}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 block text-sm">Member ID</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {selectedPenalty.memberId}
                  </span>
                </div>
                {selectedPenalty.PayedArt && (
                  <div>
                    <span className="text-gray-500 block text-sm">Paid Date</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {new Date(selectedPenalty.PayedArt).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-600">
              {selectedPenalty.pstatus === 'wait' && (
                <button
                  onClick={() => {
                    setPaymentPhone(selectedPenalty.telephone || '');
                    setIsPaymentModalOpen(true);
                  }}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                >
                  Pay Now
                </button>
              )}
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

      {/* Payment Modal */}
      <Modal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        title="Pay Penalty"
      >
        <form onSubmit={(e) => {
          e.preventDefault();
          if (selectedPenalty) {
            handlePayPenalty(selectedPenalty.p_id);
            setIsPaymentModalOpen(false);
            setIsDetailModalOpen(false);
          }
        }} className="space-y-6">
          <div>
            <label htmlFor="paymentPhone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone Number *</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <PhoneIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="tel"
                id="paymentPhone"
                value={paymentPhone}
                onChange={(e) => setPaymentPhone(e.target.value)}
                className="w-full pl-10 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="Enter phone number"
                required
              />
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-xl">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-300">Amount to Pay:</span>
              <span className="font-semibold text-gray-800 dark:text-gray-200">
                {selectedPenalty ? formatCurrency(selectedPenalty.amount) : ''}
              </span>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-600">
            <button
              type="button"
              onClick={() => setIsPaymentModalOpen(false)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              Pay Now
            </button>
          </div>
        </form>
      </Modal>

    </div>
  );
};

export default Penalties;