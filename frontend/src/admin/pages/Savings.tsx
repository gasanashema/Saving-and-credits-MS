import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useLanguage } from "../../context/LanguageContext";
import {
  MagnifyingGlassIcon,
  Squares2X2Icon,
  ListBulletIcon,
  FunnelIcon,
  ClockIcon
} from "@heroicons/react/24/outline";
import { toast } from "sonner";
import useSavings from "../../hooks/useSavings";
import { SavingType } from "../../types/savingTypes";
import server from "../../utils/server";

interface MemberOverview {
  id: number;
  nid: string;
  firstName: string;
  lastName: string;
  telephone: string;
  totalSavings: number;
  lastSavingDate: string;
  activeLoanCount: number;
  activeLoanAmount: number;
}

const Savings: React.FC = () => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'overview' | 'transactions'>('overview');
  
  // Overview Tab State
  const [overviewData, setOverviewData] = useState<MemberOverview[]>([]);
  const [overviewLoading, setOverviewLoading] = useState(true);
  const [overviewSearch, setOverviewSearch] = useState("");
  const [sortConfig, setSortConfig] = useState<{ key: keyof MemberOverview; direction: 'asc' | 'desc' } | null>({ key: 'totalSavings', direction: 'desc' });
  
  // Transactions Tab State (using existing hook)
  const { savings = [], loading: transactionsLoading, error: transactionsError, refresh: refreshTransactions } = useSavings(50);
  const [transactionSearch, setTransactionSearch] = useState("");

  const fetchOverview = async () => {
    setOverviewLoading(true);
    try {
      const resp = await server.get("/saving/overview", {
        params: { search: overviewSearch } 
      });
      setOverviewData(resp.data);
    } catch (error) {
      console.error("Failed to fetch saving overview:", error);
      toast.error(t("failedToFetchData"));
    } finally {
      setOverviewLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'overview') {
      // Debounce search
      const timer = setTimeout(() => {
        fetchOverview();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [overviewSearch, activeTab]);

  useEffect(() => {
    if (activeTab === 'transactions') {
      refreshTransactions();
    }
  }, [activeTab]);

  const handleSort = (key: keyof MemberOverview) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedOverview = React.useMemo(() => {
    if (!sortConfig) return overviewData;
    return [...overviewData].sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [overviewData, sortConfig]);

  const formatCurrency = (value: number) => {
    const num = Number(value);
    if (isNaN(num)) return Number(0).toLocaleString(undefined, { style: "currency", currency: "RWF", minimumFractionDigits: 0 });
    return num.toLocaleString(undefined, {
      style: "currency",
      currency: "RWF",
      minimumFractionDigits: 0,
    });
  };

  const filterTransactions = (savings || []).filter((saving: any) => {
    const q = transactionSearch.trim().toLowerCase();
    if (!q) return true;
    const name = (saving.firstName + " " + saving.lastName).toLowerCase();
    const date = String(saving.date ?? "").toLowerCase();
    return (
      name.includes(q) ||
      date.includes(q) 
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
        {/* REMOVED: Record Transaction button */}
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-1 inline-flex border border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${
            activeTab === 'overview'
              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
          }`}
        >
          <Squares2X2Icon className="h-5 w-5 mr-2" />
          {t("memberOverview")}
        </button>
        <button
          onClick={() => setActiveTab('transactions')}
          className={`flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${
            activeTab === 'transactions'
              ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
          }`}
        >
          <ListBulletIcon className="h-5 w-5 mr-2" />
          {t("recentTransactions")}
        </button>
      </div>

      {/* Content */}
      {activeTab === 'overview' && (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
                 <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                    type="text"
                    value={overviewSearch}
                    onChange={(e) => setOverviewSearch(e.target.value)}
                    placeholder={t("searchMembers")}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                </div>
                 <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">{t("sortBy")}:</span>
                     <select
                      value={sortConfig?.key || 'totalSavings'}
                      onChange={(e) => handleSort(e.target.value as keyof MemberOverview)}
                      className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm rounded-md dark:bg-gray-700 dark:text-white"
                    >
                      <option value="totalSavings">{t("totalSavings")}</option>
                      <option value="firstName">{t("name")}</option>
                      <option value="lastSavingDate">{t("lastActivity")}</option>
                    </select>
                </div>
            </div>
          
          {overviewLoading ? (
            <div className="text-center py-8 text-gray-500">{t("loading")}...</div>
          ) : (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {sortedOverview.map((item) => (
                    <motion.div 
                        key={item.id} 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                        className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5 hover:shadow-md transition-shadow"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{item.firstName} {item.lastName}</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">ID: {item.nid}</p>
                            </div>
                            <div className="text-right">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${item.activeLoanCount > 0 ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300' : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'}`}>
                                    {item.activeLoanCount > 0 ? `${item.activeLoanCount} Loans` : 'No Loans'}
                                </span>
                            </div>
                        </div>
                        
                        <div className="space-y-3">
                            <div>
                                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t("totalSavings")}</p>
                                <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">{formatCurrency(item.totalSavings)}</p>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4 pt-3 border-t border-gray-100 dark:border-gray-700">
                                <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t("activeLoans")}</p>
                                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                                        {formatCurrency(item.activeLoanAmount)}
                                    </p>
                                </div>
                                 <div className="text-right">
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t("lastActivity")}</p>
                                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                                        {item.lastSavingDate ? new Date(item.lastSavingDate).toLocaleDateString() : '-'}
                                    </p>
                                </div>
                            </div>
                            
                             <div className="pt-2">
                                <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                                    <span className="mr-2">📞</span> {item.telephone}
                                </p>
                            </div>
                        </div>
                    </motion.div>
                ))}
                 {sortedOverview.length === 0 && (
                     <div className="col-span-full text-center py-12 text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                        {t("noData")}
                    </div>
                )}
             </div>
          )}
        </div>
      )}

      {activeTab === 'transactions' && (
        <div className="space-y-4">
             <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                type="text"
                value={transactionSearch}
                onChange={(e) => setTransactionSearch(e.target.value)}
                placeholder={t("searchTransactions")}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>

            {transactionsLoading && <div className="text-sm text-gray-500">{t("loading")}</div>}
            {transactionsError && <div className="text-sm text-red-500">{transactionsError}</div>}

            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            {t("date")}
                            </th>
                             <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            {t("member")}
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            {t("phone")}
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            {t("amount")}
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {filterTransactions.map((saving: SavingType, i: number) => {
                         const shareValue = Number(saving.shareValue || saving.sharevalue || 0);
                         const numberOfShares = Number(saving.numberOfShares || 0);
                         const totalAmount = shareValue * numberOfShares;

                         return (
                          <motion.tr
                          key={saving.sav_id || i}
                          className="hover:bg-gray-50 dark:hover:bg-gray-700"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.15 }}
                        >
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                             {saving.date ? new Date(saving.date).toLocaleDateString() : "-"}
                           </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                              {saving.firstName ? saving.firstName + " " + saving.lastName : "-"}
                           </td>
                           <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                             {saving.telephone}
                           </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-emerald-600 dark:text-emerald-400">
                                 + {formatCurrency(totalAmount)}
                            </td>
                        </motion.tr>
                         );
                    })}
                    {filterTransactions.length === 0 && (
                        <tr>
                        <td colSpan={4} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                            {t("noData")}
                        </td>
                        </tr>
                    )}
                    </tbody>
                </table>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default Savings;
