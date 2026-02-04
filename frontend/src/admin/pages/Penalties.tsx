import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../../context/LanguageContext';
import { MagnifyingGlassIcon, PlusIcon, ExclamationTriangleIcon, UserIcon, PhoneIcon, CheckCircleIcon, XMarkIcon } from '@heroicons/react/24/outline';
import Modal from '../../components/ui/Modal';
import useAllMembers from '../../hooks/useAllMembers';
import { toast } from 'sonner';
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
}

interface PenaltyType {
  value: number;
  name: string;
  amount: number;
}

interface NewPenalty {
  pType: string;
  amount: string;
  memberIds: number[];
}

const Penalties: React.FC = () => {
  const { t } = useLanguage();
  const { members } = useAllMembers();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedPenalty, setSelectedPenalty] = useState<Penalty | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [memberSearchInput, setMemberSearchInput] = useState('');
  const [showMemberDropdown, setShowMemberDropdown] = useState(false);
  
  const [penalties, setPenalties] = useState<Penalty[]>([]);
  const [penaltyTypes, setPenaltyTypes] = useState<PenaltyType[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [newPenalty, setNewPenalty] = useState<NewPenalty>({
    pType: '',
    amount: '',
    memberIds: []
  });

  const [errors, setErrors] = useState({
    pType: '',
    amount: '',
    memberIds: ''
  });

  // Filter members based on search
  const filteredMembers = members.filter(member =>
    `${member.firstName} ${member.lastName}`.toLowerCase().includes(memberSearchInput.toLowerCase()) ||
    String(member.id).includes(memberSearchInput)
  );

  const fetchPenalties = async () => {
    try {
      setLoading(true);
      const [penaltiesRes, totalRes, typesRes] = await Promise.all([
        server.get(`/penalities/data/0/50/${statusFilter}`),
        server.get(`/penalities/total/${statusFilter}`),
        server.get('/penalities/selectlist')
      ]);
      
      setPenalties(penaltiesRes.data);
      setTotal(totalRes.data);
      setPenaltyTypes(typesRes.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPenalties();
  }, [statusFilter]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewPenalty(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (name === 'pType') {
      const selectedType = penaltyTypes.find(type => type.value === Number(value));
      if (selectedType) {
        setNewPenalty(prev => ({
          ...prev,
          amount: selectedType.amount.toString()
        }));
      }
    }
    
    setErrors(prev => ({
      ...prev,
      [name]: ''
    }));
  };

  const toggleMember = (memberId: number) => {
    setNewPenalty(prev => ({
      ...prev,
      memberIds: prev.memberIds.includes(memberId)
        ? prev.memberIds.filter(id => id !== memberId)
        : [...prev.memberIds, memberId]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPenalty.pType || !newPenalty.amount || newPenalty.memberIds.length === 0) {
      setErrors({
        pType: !newPenalty.pType ? 'Penalty type is required' : '',
        amount: !newPenalty.amount ? 'Amount is required' : '',
        memberIds: newPenalty.memberIds.length === 0 ? 'Select at least one member' : ''
      });
      return;
    }

    try {
      // Create penalties for all selected members
      const promises = newPenalty.memberIds.map(memberId =>
        server.post('/penalities', {
          pType: Number(newPenalty.pType),
          amount: Number(newPenalty.amount),
          memberId: memberId
        })
      );

      await Promise.all(promises);
      setNewPenalty({ pType: '', amount: '', memberIds: [] });
      setMemberSearchInput('');
      setIsAddModalOpen(false);
      fetchPenalties();
      toast.success(`Penalty recorded for ${newPenalty.memberIds.length} member(s)`);
    } catch (error) {
      console.error('Penalty error:', error);
      toast.error('Failed to record penalty');
    }
  };

  const handlePayPenalty = async (penaltyId: number) => {
    try {
      await server.put(`/penalities/pay/${penaltyId}`);
      fetchPenalties();
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

      {/* Search and Add */}
      <div className="flex justify-between items-center">
        <div className="flex space-x-4">
          <div className="relative flex-1 max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search penalties..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2"
          >
            <option value="all">All Status</option>
            <option value="wait">Pending</option>
            <option value="paid">Paid</option>
          </select>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="ml-4 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Record Penalty
        </button>
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
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm space-x-2">
                  {penalty.pstatus === 'wait' && (
                    <button
                      onClick={() => handlePayPenalty(penalty.p_id)}
                      className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                    >
                      Mark Paid
                    </button>
                  )}
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
          </div>
        )}
      </Modal>

      {/* Add Penalty Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setMemberSearchInput('');
        }}
        title="Record Penalty"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="members" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Select Members * ({newPenalty.memberIds.length} selected)
            </label>
            <div className="mt-1 relative">
              <input
                type="text"
                placeholder="Search members by name or ID..."
                value={memberSearchInput}
                onChange={(e) => {
                  setMemberSearchInput(e.target.value);
                  setShowMemberDropdown(true);
                }}
                onFocus={() => setShowMemberDropdown(true)}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
              />
              
              {showMemberDropdown && (
                <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg max-h-64 overflow-y-auto">
                  {filteredMembers.length > 0 ? (
                    filteredMembers.map((member) => (
                      <label
                        key={member.id}
                        className="flex items-center px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer border-b border-gray-200 dark:border-gray-600 last:border-b-0"
                      >
                        <input
                          type="checkbox"
                          checked={newPenalty.memberIds.includes(member.id)}
                          onChange={() => toggleMember(member.id)}
                          className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                        />
                        <span className="ml-3 text-sm text-gray-900 dark:text-white">
                          {member.firstName} {member.lastName} (ID: {member.id})
                        </span>
                      </label>
                    ))
                  ) : (
                    <div className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">No members found</div>
                  )}
                </div>
              )}
              
              {errors.memberIds && <p className="mt-1 text-sm text-red-600">{errors.memberIds}</p>}
            </div>

            {/* Selected Members Tags */}
            {newPenalty.memberIds.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {newPenalty.memberIds.map((memberId) => {
                  const member = members.find(m => m.id === memberId);
                  return (
                    <div
                      key={memberId}
                      className="bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 px-3 py-1 rounded-full text-sm flex items-center"
                    >
                      <span>{member?.firstName} {member?.lastName}</span>
                      <button
                        type="button"
                        onClick={() => toggleMember(memberId)}
                        className="ml-2 hover:text-red-600 dark:hover:text-red-400"
                      >
                        <XMarkIcon className="h-4 w-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div>
            <label htmlFor="pType" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Penalty Type *
            </label>
            <select
              id="pType"
              name="pType"
              value={newPenalty.pType}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
            >
              <option value="">Select penalty type</option>
              {penaltyTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.name}
                </option>
              ))}
            </select>
            {errors.pType && <p className="mt-1 text-sm text-red-600">{errors.pType}</p>}
          </div>

          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Amount *
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">RWF</span>
              </div>
              <input
                type="number"
                id="amount"
                name="amount"
                value={newPenalty.amount}
                onChange={handleInputChange}
                className="pl-12 block w-full rounded-md border-gray-300 focus:border-red-500 focus:ring-red-500"
              />
            </div>
            {errors.amount && <p className="mt-1 text-sm text-red-600">{errors.amount}</p>}
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={() => {
                setIsAddModalOpen(false);
                setMemberSearchInput('');
              }}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
            >
              Record Penalty
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Penalties;