import { motion } from 'framer-motion';
import { useLanguage } from '../../context/LanguageContext';
import StatsCard from '../../components/ui/StatsCard';
import ChartCard from '../../components/ui/ChartCard';
import { UsersIcon, BanknotesIcon, ArrowDownCircleIcon, ClockIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from 'recharts';
import { dashboardStats, savingsData, loanDistribution, repaymentPerformance, recentActivity } from '../../utils/mockData';
const Dashboard: React.FC = () => {
  const {
    t
  } = useLanguage();
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];
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
          <StatsCard title={t('totalMembers')} value={dashboardStats.totalMembers} icon={<UsersIcon className="h-6 w-6" />} bgColor="bg-white dark:bg-gray-800" textColor="text-gray-800 dark:text-white" iconBgColor="bg-blue-500" />
        </motion.div>
        <motion.div variants={item}>
          <StatsCard title={t('totalSavings')} value={formatCurrency(dashboardStats.totalSavings)} icon={<CurrencyDollarIcon className="h-6 w-6" />} bgColor="bg-white dark:bg-gray-800" textColor="text-gray-800 dark:text-white" iconBgColor="bg-emerald-500" />
        </motion.div>
        <motion.div variants={item}>
          <StatsCard title={t('activeLoans')} value={dashboardStats.activeLoans} icon={<BanknotesIcon className="h-6 w-6" />} bgColor="bg-white dark:bg-gray-800" textColor="text-gray-800 dark:text-white" iconBgColor="bg-amber-500" />
        </motion.div>
        <motion.div variants={item}>
          <StatsCard title={t('pendingRepayments')} value={dashboardStats.pendingRepayments} icon={<ArrowDownCircleIcon className="h-6 w-6" />} bgColor="bg-white dark:bg-gray-800" textColor="text-gray-800 dark:text-white" iconBgColor="bg-purple-500" />
        </motion.div>
      </div>
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div variants={item}>
          <ChartCard title={t('monthlySavingsTrend')}>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={savingsData} margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 5
              }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="month" stroke="#6B7280" />
                  <YAxis stroke="#6B7280" />
                  <Tooltip contentStyle={{
                  backgroundColor: '#1F2937',
                  borderColor: '#374151',
                  color: '#F9FAFB'
                }} formatter={value => [formatCurrency(value as number), 'Amount']} />
                  <Bar dataKey="amount" fill="#10B981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>
        </motion.div>
        <motion.div variants={item}>
          <ChartCard title={t('loanDistribution')}>
            <div className="h-80 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={loanDistribution} cx="50%" cy="50%" labelLine={false} outerRadius={100} fill="#8884d8" dataKey="value" label={({
                  name,
                  percent
                }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                    {loanDistribution.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={value => [`${value}%`, 'Percentage']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>
        </motion.div>
        <motion.div variants={item} className="lg:col-span-2">
          <ChartCard title={t('repaymentPerformance')}>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={repaymentPerformance} margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 5
              }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="month" stroke="#6B7280" />
                  <YAxis stroke="#6B7280" />
                  <Tooltip contentStyle={{
                  backgroundColor: '#1F2937',
                  borderColor: '#374151',
                  color: '#F9FAFB'
                }} formatter={value => [`${value}%`, '']} />
                  <Legend />
                  <Line type="monotone" dataKey="onTime" stroke="#10B981" strokeWidth={2} activeDot={{
                  r: 8
                }} />
                  <Line type="monotone" dataKey="late" stroke="#EF4444" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>
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
                {recentActivity.map(activity => <tr key={activity.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
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