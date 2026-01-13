import { motion } from 'framer-motion';
import { useLanguage } from '../../context/LanguageContext';
import StatsCard from '../../components/ui/StatsCard';
import ChartCard from '../../components/ui/ChartCard';
import { UsersIcon, BanknotesIcon, ArrowDownCircleIcon, ClockIcon, CurrencyDollarIcon, BellIcon, CreditCardIcon } from '@heroicons/react/24/outline';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from 'recharts';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useMemberLoans from '../../hooks/useMemberLoans';
import useMemberPaymentHistory from '../../hooks/useMemberPaymentHistory';
import useMemberSavings from '../../hooks/useMemberSavings';
import useMemberNotifications from '../../hooks/useMemberNotifications';
import useMemberProfile from '../../hooks/useMemberProfile';
import useMemberPenalties from '../../hooks/useMemberPenalties';
import { toast } from 'sonner';
import server from '../../utils/server';

const processData = (rawData: any) => {
  const { loans, payments, savings, profile, penalties } = rawData;

  // Process payment history over months
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const paymentGrowth = months.map((month, i) => {
    const monthStart = new Date(2024, i, 1);
    const monthEnd = new Date(2024, i + 1, 0);
    const paymentsInMonth = payments.filter((p: any) => {
      const payDate = new Date(p.pay_date);
      return payDate >= monthStart && payDate <= monthEnd;
    });
    const totalAmount = paymentsInMonth.reduce((sum: number, p: any) => sum + (p.amount || 0), 0);

    return {
      month,
      amount: totalAmount,
      count: paymentsInMonth.length
    };
  });

  // Process loan data
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

  // Calculate totals (remaining amount for active loans)
  const totalLoans = (loans as any[])
    .filter((l: any) => l.status === 'active')
    .reduce((sum: number, l: any) => sum + (Number(l.amountToPay || 0) - Number(l.payedAmount || 0)), 0);
  // Calculate total savings from savings data
  const totalSavings = (savings as any[]).reduce((sum: number, s: any) => sum + Number(s.amount || 0), 0);
  const totalPenalties = (penalties as any[]).reduce((sum: number, p: any) => sum + Number(p.amount || 0), 0);

  // Repayment performance (simplified)
  const repaymentPerformance = months.map((month, i) => {
    const monthStart = new Date(2024, i, 1);
    const monthEnd = new Date(2024, i + 1, 0);
    const paymentsInMonth = payments.filter((p: any) => {
      const payDate = new Date(p.pay_date);
      return payDate >= monthStart && payDate <= monthEnd;
    });

    // For simplicity, assume all payments are on time
    const onTime = paymentsInMonth.length;
    const late = 0;

    return {
      month,
      onTime: onTime > 0 ? 100 : 0,
      late: late
    };
  });

  // Recent activity
  const recentActivity = [
    ...savings.slice(-5).map((s: any) => ({
      id: `saving_${s.id}`,
      type: 'savings',
      member: 'You', // Since it's member dashboard
      amount: s.amount,
      date: s.date
    })),
    ...loans.slice(-5).map((l: any) => ({
      id: `loan_${l.loanId}`,
      type: 'loan',
      member: 'You',
      amount: l.amount,
      date: l.requestDate
    })),
    ...payments.slice(-5).map((p: any) => ({
      id: `payment_${p.pay_id}`,
      type: 'repayment',
      member: 'You',
      amount: p.amount,
      date: p.pay_date
    }))
  ].sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 10);

  return {
    paymentGrowth,
    loanDistribution,
    stats: {
      totalLoans,
      totalSavings,
      totalPenalties
    },
    repaymentPerformance,
    recentActivity
  };
};

const Dashboard: React.FC = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { loans, refresh: refreshLoans } = useMemberLoans();
  const { payments, refresh: refreshPayments } = useMemberPaymentHistory();
  const { savings } = useMemberSavings();
  const { notifications, unreadCount } = useMemberNotifications();
  const { profile } = useMemberProfile();
  const { penalties } = useMemberPenalties();
  const [data, setData] = useState<any>({
    stats: { totalLoans: 0, totalSavings: 0, totalPenalties: 0 },
    recentActivity: []
  });
  const [paymentForm, setPaymentForm] = useState({
    loanId: '',
    amount: '',
    phone: ''
  });
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  useEffect(() => {
    console.log('Dashboard inputs:', { loansCount: loans.length, paymentsCount: payments.length, savingsCount: savings.length, penaltiesCount: penalties.length, profile });
    const processedData = processData({ loans, payments, savings, profile, penalties });
    console.log('Dashboard processedData sample:', processedData.recentActivity.slice(0,3));
    setData(processedData);
  }, [loans, payments, savings, profile, penalties]);

  const formatCurrency = (value: number) => {
    return `RWF ${value.toLocaleString()}`;
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentForm.loanId || !paymentForm.amount || !paymentForm.phone) {
      toast.error('Please fill all fields');
      return;
    }

    const amount = Number(paymentForm.amount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Invalid amount');
      return;
    }

    setIsProcessingPayment(true);
    try {
      await server.put('/loans/pay', {
        loanId: paymentForm.loanId,
        amount,
        phone: paymentForm.phone
      });

      setPaymentForm({ loanId: '', amount: '', phone: '' });
      toast.success('Payment successful!');
      refreshLoans();
      refreshPayments();
    } catch (error) {
      console.error('Payment error:', error);
      toast.error('Payment failed');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const activeLoans = loans.filter((l: any) => l.lstatus === 'active' || l.status === 'active');
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <motion.div variants={item}>
          <StatsCard title={t('totalLoans')} value={formatCurrency(data.stats.totalLoans)} icon={<BanknotesIcon className="h-6 w-6" />} bgColor="bg-white dark:bg-gray-800" textColor="text-gray-800 dark:text-white" iconBgColor="bg-blue-500" />
        </motion.div>
        <motion.div variants={item}>
          <StatsCard title={t('totalSavings')} value={formatCurrency(data.stats.totalSavings)} icon={<CurrencyDollarIcon className="h-6 w-6" />} bgColor="bg-white dark:bg-gray-800" textColor="text-gray-800 dark:text-white" iconBgColor="bg-emerald-500" />
        </motion.div>
        <motion.div variants={item}>
          <StatsCard title="Total Penalties" value={formatCurrency(data.stats.totalPenalties)} icon={<ArrowDownCircleIcon className="h-6 w-6" />} bgColor="bg-white dark:bg-gray-800" textColor="text-gray-800 dark:text-white" iconBgColor="bg-red-500" />
        </motion.div>
      </div>


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