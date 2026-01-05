import { motion } from 'framer-motion';
import { useLanguage } from '../../context/LanguageContext';
import StatsCard from '../../components/ui/StatsCard';
import { UsersIcon, BanknotesIcon, ArrowDownCircleIcon, ClockIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline';
import { useState, useEffect } from 'react';
import server from '../../utils/server';
import { toast } from 'sonner';

const fetchAdminDashboardData = async () => {
  try {
    const [membersRes, savingsRes, loansRes, paymentsRes] = await Promise.all([
      server.get('/members'),
      server.get('/saving/1000'), // All savings
      server.get('/loans/1000'), // All loans
      server.get('/loans/payments/recent') // Recent payments
    ]);

    return {
      members: membersRes.data || [],
      savings: savingsRes.data || [],
      loans: loansRes.data || [],
      payments: paymentsRes.data?.payments || paymentsRes.data || []
    };
  } catch (error) {
    console.error('Error fetching admin dashboard data:', error);
    return { members: [], savings: [], loans: [], payments: [] };
  }
};

const processAdminData = (rawData: any) => {
  const { members, savings, loans, payments } = rawData;

  // Stats
  const totalMembers = members.length;
  const totalSavings = savings.reduce((sum: number, s: any) => sum + (s.amount || 0), 0);
  const activeLoans = loans.filter((l: any) => l.status === 'active' || l.status === 'approved').length;
  const pendingRepayments = loans.filter((l: any) => l.status === 'active' || l.status === 'approved').length; // Assuming active loans need repayment

  // Monthly savings trend
  const currentYear = new Date().getFullYear();
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const savingsData = months.map((month, i) => {
    const monthStart = new Date(currentYear, i, 1);
    const monthEnd = new Date(currentYear, i + 1, 0);
    const savingsInMonth = savings.filter((s: any) => {
      const saveDate = new Date(s.date);
      return saveDate >= monthStart && saveDate <= monthEnd;
    });
    const totalAmount = savingsInMonth.reduce((sum: number, s: any) => sum + (s.amount || 0), 0);

    return {
      month,
      amount: totalAmount
    };
  });

  // Loan distribution
  const loanStatusCounts = {
    active: loans.filter((l: any) => l.status === 'active' || l.status === 'approved').length,
    paid: loans.filter((l: any) => l.status === 'paid').length,
    pending: loans.filter((l: any) => l.status === 'pending').length,
    rejected: loans.filter((l: any) => l.status === 'rejected' || l.status === 'cancelled').length
  };

  const loanDistribution = [
    { name: 'Active', value: loanStatusCounts.active },
    { name: 'Paid', value: loanStatusCounts.paid },
    { name: 'Pending', value: loanStatusCounts.pending },
    { name: 'Rejected', value: loanStatusCounts.rejected }
  ].filter(item => item.value > 0);

  // Repayment performance (simplified)
  const repaymentPerformance = months.map((month, i) => {
    const monthStart = new Date(currentYear, i, 1);
    const monthEnd = new Date(currentYear, i + 1, 0);
    const paymentsInMonth = payments.filter((p: any) => {
      const payDate = new Date(p.pay_date);
      return payDate >= monthStart && payDate <= monthEnd;
    });

    // For simplicity, assume all payments are on time
    const onTime = paymentsInMonth.length;
    const late = 0; // Could calculate based on due dates

    return {
      month,
      onTime: onTime > 0 ? 100 : 0, // Percentage
      late: late
    };
  });

  // Recent activity (combine savings, loans, payments)
  const recentActivity = [
    ...savings.slice(-5).map((s: any) => ({
      id: `saving_${s.id}`,
      type: 'savings',
      member: `${s.firstName} ${s.lastName}`,
      amount: s.amount,
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
  ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 10);

  return {
    stats: {
      totalMembers,
      totalSavings,
      activeLoans,
      pendingRepayments
    },
    savingsData,
    loanDistribution,
    repaymentPerformance,
    recentActivity
  };
};

const Dashboard: React.FC = () => {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>({
    stats: { totalMembers: 0, totalSavings: 0, activeLoans: 0, pendingRepayments: 0 },
    savingsData: [],
    loanDistribution: [],
    repaymentPerformance: [],
    recentActivity: []
  });
  

  useEffect(() => {
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

    loadData();
  }, []);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
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
      <div>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
          {t('dashboard')}
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          {t('dashboardOverview')}
        </p>
      </div>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div variants={item}>
          <StatsCard title={t('totalMembers')} value={data.stats.totalMembers.toString()} icon={<UsersIcon className="h-6 w-6" />} bgColor="bg-white dark:bg-gray-800" textColor="text-gray-800 dark:text-white" iconBgColor="bg-blue-500" />
        </motion.div>
        <motion.div variants={item}>
          <StatsCard title={t('totalSavings')} value={formatCurrency(data.stats.totalSavings)} icon={<CurrencyDollarIcon className="h-6 w-6" />} bgColor="bg-white dark:bg-gray-800" textColor="text-gray-800 dark:text-white" iconBgColor="bg-emerald-500" />
        </motion.div>
        <motion.div variants={item}>
          <StatsCard title={t('activeLoans')} value={data.stats.activeLoans.toString()} icon={<BanknotesIcon className="h-6 w-6" />} bgColor="bg-white dark:bg-gray-800" textColor="text-gray-800 dark:text-white" iconBgColor="bg-amber-500" />
        </motion.div>
        <motion.div variants={item}>
          <StatsCard title={t('pendingRepayments')} value={data.stats.pendingRepayments.toString()} icon={<ArrowDownCircleIcon className="h-6 w-6" />} bgColor="bg-white dark:bg-gray-800" textColor="text-gray-800 dark:text-white" iconBgColor="bg-purple-500" />
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