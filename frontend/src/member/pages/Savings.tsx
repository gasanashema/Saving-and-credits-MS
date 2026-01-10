import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useLanguage } from "../../context/LanguageContext";
import { MagnifyingGlassIcon, PlusIcon } from "@heroicons/react/24/outline";
import useMemberSavings from "../../hooks/useMemberSavings";
import Modal from "../components/ui/Modal";
import server from "../../utils/server";
import { useAuth } from "../../context/AuthContext";
import { toast } from "sonner";

interface SavingType {
  name: string;
  value: number;
  amount: number;
}

const Savings: React.FC = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [savingTypes, setSavingTypes] = useState<SavingType[]>([]);
  const [formData, setFormData] = useState({
    stId: '',
    numberOfShares: '',
    shareValue: '',
    phoneNumber: ''
  });
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState('');
  const [totalAmount, setTotalAmount] = useState(0);

  const { savings, totalSavings, loading, error, refresh } = useMemberSavings();

  useEffect(() => {
    if (isModalOpen) {
      const fetchSavingTypes = async () => {
        try {
          const response = await server.get('/saving/type/list');
          setSavingTypes(response.data);
        } catch (err) {
          console.error('Failed to fetch saving types:', err);
        }
      };
      fetchSavingTypes();
    }
  }, [isModalOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    // Validate form
    if (!formData.stId || !formData.numberOfShares || !formData.shareValue) {
      setModalError('Please fill in all required fields');
      return;
    }

    const shares = parseInt(formData.numberOfShares);
    const value = parseInt(formData.shareValue);

    if (isNaN(shares) || shares <= 0) {
      setModalError('Number of shares must be a positive number');
      return;
    }

    if (isNaN(value) || value <= 0) {
      setModalError('Share value must be a positive number');
      return;
    }

    setModalLoading(true);
    setModalError('');

    try {
      await server.post('/saving', {
        memberId: parseInt(user.id),
        stId: parseInt(formData.stId),
        numberOfShares: shares,
        shareValue: value
      });

      setIsModalOpen(false);
      setFormData({
        stId: '',
        numberOfShares: '',
        shareValue: '',
        phoneNumber: ''
      });
      setTotalAmount(0);
      refresh();
      toast.success('Saving recorded successfully');
    } catch (err: any) {
      console.error('Failed to save:', err);
      setModalError(err.response?.data?.error || err.message || 'Failed to save');
    } finally {
      setModalLoading(false);
    }
  };

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedType = savingTypes.find(type => type.value === parseInt(e.target.value));
    const shareValue = selectedType ? selectedType.amount : 0;
    const shares = parseInt(formData.numberOfShares) || 0;
    setFormData({
      ...formData,
      stId: e.target.value,
      shareValue: shareValue.toString()
    });
    setTotalAmount(shares * shareValue);
  };

  const handleSharesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const shares = parseInt(e.target.value) || 0;
    const shareValue = parseInt(formData.shareValue) || 0;
    setFormData({
      ...formData,
      numberOfShares: e.target.value
    });
    setTotalAmount(shares * shareValue);
  };

  const formatCurrency = (value: number) =>
    value.toLocaleString(undefined, {
      style: "currency",
      currency: "RWF",
      minimumFractionDigits: 0,
    });



  const filteredSavings = savings.filter((saving) => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return true;
    const date = String(saving.date).toLowerCase();
    const type = String(saving.type).toLowerCase();
    const amount = String(saving.amount).toLowerCase();
    return (
      date.includes(q) ||
      type.includes(q) ||
      amount.includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header with total savings */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
              {t("savings")}
            </h1>
            <p className="text-gray-500 dark:text-gray-400">
              {t("manageSavingsDescription")}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500 dark:text-gray-400">Total Savings</p>
            <p className="text-3xl font-bold text-emerald-600">{formatCurrency(totalSavings)}</p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-4 border border-gray-200 dark:border-gray-700">
        <div className="flex space-x-4">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t("searchTransactions")}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Save Now
          </button>
        </div>
      </div>

      {loading && <div className="text-sm text-gray-500">{t("loading")}</div>}
      {error && <div className="text-sm text-red-500">{error}</div>}

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-700">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t("no")}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Shares
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t("date")}
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t("amount")}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredSavings.map((saving, i) => (
                <motion.tr
                  key={saving.sav_id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.15 }}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {i + 1}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {saving.type}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {saving.numberOfShares} × {formatCurrency(saving.shareValue)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {new Date(saving.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium">
                    <span className="text-emerald-600 dark:text-emerald-400">
                      {formatCurrency(saving.amount)}
                    </span>
                  </td>
                </motion.tr>
              ))}
              {filteredSavings.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-4 text-center text-gray-500 dark:text-gray-400"
                  >
                    {t("noData")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add New Saving"
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Saving Type
            </label>
            <select
              value={formData.stId}
              onChange={handleTypeChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="">Select type</option>
              {savingTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Number of Shares
            </label>
            <input
              type="number"
              value={formData.numberOfShares}
              onChange={handleSharesChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              min="1"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Total Amount
            </label>
            <input
              type="text"
              value={formatCurrency(totalAmount)}
              readOnly
              className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-gray-100 dark:bg-gray-600 text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Phone Number (for payment)
            </label>
            <input
              type="tel"
              value={formData.phoneNumber}
              onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g. +250788123456"
            />
          </div>

          {modalError && (
            <div className="text-sm text-red-500">{modalError}</div>
          )}

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-600 rounded-md hover:bg-gray-200 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={modalLoading}
              className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-md hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50"
            >
              {modalLoading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </Modal>

    </div>
  );
};

export default Savings;
