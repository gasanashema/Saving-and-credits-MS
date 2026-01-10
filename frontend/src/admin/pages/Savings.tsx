import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useLanguage } from "../../context/LanguageContext";
import {
  PlusIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import Modal from "../../components/ui/Modal";
import { toast } from "sonner";
import useSavings from "../../hooks/useSavings";
import useAllMembers from "../../hooks/useAllMembers";
import { SavingType } from "../../types/savingTypes";
import server from "../../utils/server";

const Savings: React.FC = () => {
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [transactionData, setTransactionData] = useState({
    memberId: "",
    stId: "",
    numberOfShares: "",
    shareValue: "",
  });
  const [errors, setErrors] = useState({ memberId: "", stId: "", numberOfShares: "", shareValue: "" });
  const [savingTypes, setSavingTypes] = useState([]);

  // useSavings returns the data (query handles ordering)
  const { savings = [], loading, error, refresh } = useSavings(30);
  const { members = [] } = useAllMembers();

  // Debug: log raw data so you can inspect keys coming from the API
  useEffect(() => {
    console.debug("useSavings -> raw data:", savings);
  }, [savings]);

  // Fetch saving types
  useEffect(() => {
    const fetchSavingTypes = async () => {
      try {
        const resp = await server.get("/saving/type/list");
        setSavingTypes(resp.data);
      } catch (error) {
        console.error("Failed to fetch saving types:", error);
      }
    };
    fetchSavingTypes();
  }, []);

  const formatCurrency = (value: number) =>
    value.toLocaleString(undefined, {
      style: "currency",
      currency: "RWF",
      minimumFractionDigits: 0,
    });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setTransactionData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = { ...errors };
    let valid = true;
    if (!transactionData.memberId) {
      newErrors.memberId = t("memberRequired");
      valid = false;
    }
    if (!transactionData.stId) {
      newErrors.stId = t("savingTypeRequired");
      valid = false;
    }
    if (
      !transactionData.numberOfShares ||
      isNaN(Number(transactionData.numberOfShares)) ||
      Number(transactionData.numberOfShares) <= 0
    ) {
      newErrors.numberOfShares = t("invalidNumberOfShares");
      valid = false;
    }
    if (
      !transactionData.shareValue ||
      isNaN(Number(transactionData.shareValue)) ||
      Number(transactionData.shareValue) <= 0
    ) {
      newErrors.shareValue = t("invalidShareValue");
      valid = false;
    }
    setErrors(newErrors);
    return valid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    try {
      await server.post("/saving", {
        memberId: transactionData.memberId,
        stId: transactionData.stId,
        numberOfShares: Number(transactionData.numberOfShares),
        shareValue: Number(transactionData.shareValue),
      });
      setTransactionData({ memberId: "", stId: "", numberOfShares: "", shareValue: "" });
      setIsAddModalOpen(false);
      toast.success(t("savingRecorded"));
      // Refresh savings list
      refresh();
    } catch (error) {
      console.error("Failed to add saving:", error);
      toast.error(t("failedToRecordSaving"));
    }
  };

  const filteredSavings = (savings || []).filter((saving: any) => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return true;
    const date = String(saving.date ?? "").toLowerCase();
    const type = String(saving.type ?? "").toLowerCase();
    const amount = String(
      saving.sharevalue * saving.numberOfShares
    ).toLowerCase();
    const balance = String(
      saving.sharevalue * saving.numberOfShares
    ).toLowerCase();
    return (
      date.includes(q) ||
      type.includes(q) ||
      amount.includes(q) ||
      balance.includes(q)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
            {t("savings")}
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            {t("manageSavingsDescription")}
          </p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg flex items-center"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          {t("recordTransaction")}
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-4 border border-gray-200 dark:border-gray-700">
        <div className="relative">
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
                  {t("name")}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t("phone")}
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
              {filteredSavings.map((saving: SavingType, i: number) => (
                <motion.tr
                  key={i}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.15 }}
                >
                  
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {i+1}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    { saving.firstName?saving.firstName + " " + saving.lastName : "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    { saving.telephone}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {saving.date
                      ? new Date(saving.date).toLocaleDateString()
                      : "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium">
                    <span className="text-emerald-600 dark:text-emerald-400">
                      +{" "}
                      {formatCurrency(
                        saving.sharevalue * saving.numberOfShares
                      )}
                    </span>
                  </td>
                </motion.tr>
              ))}
              {filteredSavings.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
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
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title={t("recordSaving")}
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label
                htmlFor="memberId"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                {t("member")} *
              </label>
              <select
                id="memberId"
                name="memberId"
                value={transactionData.memberId}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="">{t("selectMember")}</option>
                {members.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.firstName} {member.lastName}
                  </option>
                ))}
              </select>
              {errors.memberId && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.memberId}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="stId"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                {t("savingType")} *
              </label>
              <select
                id="stId"
                name="stId"
                value={transactionData.stId}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="">{t("selectSavingType")}</option>
                {savingTypes.map((type: any) => (
                  <option key={type.value} value={type.value}>
                    {type.name}
                  </option>
                ))}
              </select>
              {errors.stId && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.stId}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="numberOfShares"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                {t("numberOfShares")} *
              </label>
              <input
                type="number"
                id="numberOfShares"
                name="numberOfShares"
                value={transactionData.numberOfShares}
                onChange={handleInputChange}
                min="1"
                step="1"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="0"
              />
              {errors.numberOfShares && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.numberOfShares}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="shareValue"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                {t("shareValue")} *
              </label>
              <input
                type="number"
                id="shareValue"
                name="shareValue"
                value={transactionData.shareValue}
                onChange={handleInputChange}
                min="1"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="0"
              />
              {errors.shareValue && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.shareValue}
                </p>
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {t("cancel")}
            </button>
            <button
              type="submit"
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
            >
              {t("recordSaving")}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Savings;
