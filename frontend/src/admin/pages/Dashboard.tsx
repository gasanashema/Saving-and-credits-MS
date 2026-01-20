import { motion } from 'framer-motion';
import { useLanguage } from '../../context/LanguageContext';
import StatsCard from '../../components/ui/StatsCard';
import { UsersIcon, BanknotesIcon, ExclamationTriangleIcon, ArrowDownCircleIcon, ClockIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline';
import { useState, useEffect } from 'react';
import server from '../../utils/server';
import { toast } from 'sonner';

const fetchAdminDashboardData = async () => {
  try {
    const [membersRes, savingsRes, loansRes, paymentsRes, penaltiesRes] = await Promise.all([
      server.get('/members'),
      server.get('/saving/1000'), // All savings
      server.get('/loans/1000'), // All loans
      server.get('/loans/payments/recent'), // Recent payments
      server.get('/penalities/data/0/1000/all') // All penalties
    ]);

    return {
      members: membersRes.data || [],
      savings: savingsRes.data || [],
      loans: loansRes.data || [],
      payments: paymentsRes.data?.payments || paymentsRes.data || [],
      penalties: penaltiesRes.data || []
    };
  } catch (error) {
    console.error('Error fetching admin dashboard data:', error);
    return { members: [], savings: [], loans: [], payments: [], penalties: [] };
  }
};

const processAdminData = (rawData: any) => {
  const { members, savings, loans, payments, penalties } = rawData;

  // Stats
  // Stats
  // Ensure all values are parsed as numbers to avoid string concatenation
  const totalMembers = members.length;
  const totalSavings = savings.reduce((sum: number, s: any) => sum + Number(s.total || s.amount || 0), 0);
  const activeLoansAmount = loans.filter((l: any) => l.lstatus === 'active' || l.status === 'active').reduce((sum: number, l: any) => sum + Number(l.amount || 0), 0);
  
  // Calculate Net Savings: Total Savings - Active Loans
  const netSavings = totalSavings - activeLoansAmount;

  // Calculate Profits: Interests from PAID loans (PayedAmount - Principal)
  const profits = loans
    .filter((l: any) => l.lstatus === 'paid' || l.status === 'paid')
    .reduce((sum: number, l: any) => sum + (Number(l.payedAmount || 0) - Number(l.amount || 0)), 0);

  const unpaidPenalties = penalties.filter((p: any) => p.pstatus !== 'paid').reduce((sum: number, p: any) => sum + Number(p.amount || 0), 0);




  // Recent activity (combine savings, loans, payments)
  const recentActivity = [
    ...savings.slice(-5).map((s: any) => ({
      id: `saving_${s.sav_id}`,
      type: 'savings',
      member: `${s.firstName} ${s.lastName}`,
      amount: s.total || s.amount,
      date: s.date
    })),
    ...loans.slice(-5).map((l: any) => ({
      id: `loan_${l.loanId}`,
      type: 'loan',
      member: `${l.firstName} ${l.lastName}`,
      amount: l.amount,
      date: l.requestDate
    })),
    ...payments.slice(-5).map((p: any) => ({
      id: `payment_${p.pay_id}`,
      type: 'repayment',
      member: `${p.firstName} ${p.lastName}`,
      amount: p.amount,
      date: p.pay_date
    }))
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 10);

  return {
    stats: {
      totalMembers,
      totalMembers,
      totalSavings,
      netSavings, // Total - Active Loans
      activeLoansAmount,
      unpaidPenalties,
      profits // Revenue from paid loans
    },
    recentActivity
  };
};

const Dashboard: React.FC = () => {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>({
    stats: { totalMembers: 0, totalSavings: 0, netSavings: 0, activeLoansAmount: 0, unpaidPenalties: 0, profits: 0 },
    recentActivity: []
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const rawData = await fetchAdminDashboardData();
      const processedData = processAdminData(rawData);
      setData(processedData);
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-RW', {
      style: 'currency',
      currency: 'RWF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatCompactCurrency = (value: number) => {
    if (value >= 1000000) {
      return new Intl.NumberFormat('en-RW', {
        style: 'currency',
        currency: 'RWF',
        notation: 'compact',
        compactDisplay: 'short',
        maximumFractionDigits: 1
      }).format(value);
    }
    return formatCurrency(value);
  };

  const container = {
    hidden: {
      opacity: 0
    },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: {
      opacity: 0,
      y: 20
    },
    show: {
      opacity: 1,
      y: 0
    }
  };
  return <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
            {t('dashboard')}
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            {t('dashboardOverview')}
          </p>
        </div>
      </div>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div variants={item}>
          <StatsCard title={t('totalMembers')} value={data.stats.totalMembers.toString()} icon={<UsersIcon className="h-6 w-6" />} bgColor="bg-white dark:bg-gray-800" textColor="text-gray-800 dark:text-white" iconBgColor="bg-blue-500" />
        </motion.div>
        <motion.div variants={item}>
          <StatsCard title={t('totalSavings')} value={formatCompactCurrency(data.stats.netSavings)} icon={<CurrencyDollarIcon className="h-6 w-6" />} bgColor="bg-white dark:bg-gray-800" textColor="text-gray-800 dark:text-white" iconBgColor="bg-emerald-500" />
        </motion.div>
        <motion.div variants={item}>
          <StatsCard title={t('activeLoans')} value={formatCompactCurrency(data.stats.activeLoansAmount)} icon={<BanknotesIcon className="h-6 w-6" />} bgColor="bg-white dark:bg-gray-800" textColor="text-gray-800 dark:text-white" iconBgColor="bg-amber-500" />
        </motion.div>
        <motion.div variants={item}>
          <StatsCard title="Profits" value={formatCompactCurrency(data.stats.profits)} icon={<BanknotesIcon className="h-6 w-6" />} bgColor="bg-white dark:bg-gray-800" textColor="text-gray-800 dark:text-white" iconBgColor="bg-blue-500" />
        </motion.div>
      </div>
      {/* Recent Activity */}
      <motion.div variants={item}>
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
              {t('recentActivity')}
            </h3>
            <button className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300">
              {t('viewAll')}
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {t('type')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {t('member')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {t('amount')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {t('date')}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {data.recentActivity.map((activity: any) => <tr key={activity.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {activity.type === 'savings' ? <CurrencyDollarIcon className="h-5 w-5 text-emerald-500" /> : activity.type === 'loan' ? <BanknotesIcon className="h-5 w-5 text-amber-500" /> : <ArrowDownCircleIcon className="h-5 w-5 text-purple-500" />}
                        <span className="ml-2 text-sm font-medium text-gray-900 dark:text-white capitalize">
                          {activity.type}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                      {activity.member}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                      {formatCurrency(activity.amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                      <div className="flex items-center">
                        <ClockIcon className="h-4 w-4 text-gray-400 mr-1" />
                        {new Date(activity.date).toLocaleDateString()}
                      </div>
                    </td>
                  </tr>)}
              </tbody>
            </table>
          </div>
        </div>
      </motion.div>
    </motion.div>;
};
export default Dashboard;