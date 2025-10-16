import React, { useState, Children } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';
import { ChartBarIcon, ArrowDownTrayIcon, CurrencyDollarIcon, BanknotesIcon, UserGroupIcon, ArrowUpIcon } from '@heroicons/react/24/outline';
import StatsCard from '../components/ui/StatsCard';
import ChartCard from '../components/ui/ChartCard';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend, AreaChart, Area } from 'recharts';
import { toast } from 'sonner';
// Mock data for reports
const monthlyIncome = [{
  month: 'Jan',
  amount: 8500
}, {
  month: 'Feb',
  amount: 9200
}, {
  month: 'Mar',
  amount: 7800
}, {
  month: 'Apr',
  amount: 10500
}, {
  month: 'May',
  amount: 12000
}, {
  month: 'Jun',
  amount: 11300
}];
const memberGrowth = [{
  month: 'Jan',
  members: 85
}, {
  month: 'Feb',
  members: 92
}, {
  month: 'Mar',
  members: 98
}, {
  month: 'Apr',
  members: 105
}, {
  month: 'May',
  members: 112
}, {
  month: 'Jun',
  members: 124
}];
const savingsGrowth = [{
  month: 'Jan',
  savings: 150000
}, {
  month: 'Feb',
  savings: 172000
}, {
  month: 'Mar',
  savings: 195000
}, {
  month: 'Apr',
  savings: 218000
}, {
  month: 'May',
  savings: 232000
}, {
  month: 'Jun',
  savings: 245000
}];
const loanDistribution = [{
  purpose: 'Business',
  value: 45
}, {
  purpose: 'Education',
  value: 20
}, {
  purpose: 'Housing',
  value: 25
}, {
  purpose: 'Personal',
  value: 10
}];
const Reports: React.FC = () => {
  const {
    t
  } = useLanguage();
  const [activeTab, setActiveTab] = useState('overview');
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };
  const handleExport = (type: string) => {
    toast.success(`${t('exportStarted')} (${type})`);
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
            {t('reports')}
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            {t('reportsDescription')}
          </p>
        </div>
        <div className="flex space-x-3">
          <button onClick={() => handleExport('PDF')} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center">
            <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
            {t('exportPDF')}
          </button>
          <button onClick={() => handleExport('Excel')} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center">
            <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
            {t('exportExcel')}
          </button>
        </div>
      </div>

      {/* Report Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          <button onClick={() => setActiveTab('overview')} className={`px-6 py-3 text-sm font-medium ${activeTab === 'overview' ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-500' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}>
            {t('overview')}
          </button>
          <button onClick={() => setActiveTab('savings')} className={`px-6 py-3 text-sm font-medium ${activeTab === 'savings' ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-500' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}>
            {t('savings')}
          </button>
          <button onClick={() => setActiveTab('loans')} className={`px-6 py-3 text-sm font-medium ${activeTab === 'loans' ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-500' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}>
            {t('loans')}
          </button>
          <button onClick={() => setActiveTab('members')} className={`px-6 py-3 text-sm font-medium ${activeTab === 'members' ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-500' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}>
            {t('members')}
          </button>
        </div>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <motion.div variants={item}>
              <StatsCard title={t('totalSavings')} value={formatCurrency(245000)} icon={<CurrencyDollarIcon className="h-6 w-6" />} iconBgColor="bg-emerald-500" />
            </motion.div>
            <motion.div variants={item}>
              <StatsCard title={t('totalOutstandingLoans')} value={formatCurrency(87500)} icon={<BanknotesIcon className="h-6 w-6" />} iconBgColor="bg-amber-500" />
            </motion.div>
            <motion.div variants={item}>
              <StatsCard title={t('monthlyIncome')} value={formatCurrency(11300)} icon={<ArrowUpIcon className="h-6 w-6" />} iconBgColor="bg-blue-500" />
            </motion.div>
            <motion.div variants={item}>
              <StatsCard title={t('totalMembers')} value="124" icon={<UserGroupIcon className="h-6 w-6" />} iconBgColor="bg-purple-500" />
            </motion.div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <motion.div variants={item}>
              <ChartCard title={t('monthlyIncome')}>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyIncome} margin={{
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
                      <Bar dataKey="amount" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </ChartCard>
            </motion.div>
            <motion.div variants={item}>
              <ChartCard title={t('memberGrowth')}>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={memberGrowth} margin={{
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
                  }} />
                      <Line type="monotone" dataKey="members" stroke="#8B5CF6" strokeWidth={2} activeDot={{
                    r: 8
                  }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </ChartCard>
            </motion.div>
          </div>
        </>}

      {/* Savings Tab */}
      {activeTab === 'savings' && <div className="grid grid-cols-1 gap-6">
          <motion.div variants={item}>
            <ChartCard title={t('savingsGrowth')}>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={savingsGrowth} margin={{
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
                }} formatter={value => [formatCurrency(value as number), 'Total Savings']} />
                    <Area type="monotone" dataKey="savings" stroke="#10B981" fill="#10B981" fillOpacity={0.2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </ChartCard>
          </motion.div>
        </div>}

      {/* Loans Tab */}
      {activeTab === 'loans' && <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div variants={item}>
            <ChartCard title={t('loanDistribution')}>
              <div className="h-80 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={loanDistribution} cx="50%" cy="50%" labelLine={false} outerRadius={100} fill="#8884d8" dataKey="value" label={({
                  purpose,
                  value
                }) => `${t(purpose.toLowerCase())} ${value}%`}>
                      {loanDistribution.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                    </Pie>
                    <Tooltip formatter={value => [`${value}%`, 'Percentage']} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </ChartCard>
          </motion.div>
          <motion.div variants={item}>
            <ChartCard title={t('loanRepayments')}>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyIncome} margin={{
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
                    <Line type="monotone" dataKey="amount" stroke="#F59E0B" strokeWidth={2} activeDot={{
                  r: 8
                }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </ChartCard>
          </motion.div>
        </div>}

      {/* Members Tab */}
      {activeTab === 'members' && <div className="grid grid-cols-1 gap-6">
          <motion.div variants={item}>
            <ChartCard title={t('memberGrowth')}>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={memberGrowth} margin={{
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
                }} />
                    <Area type="monotone" dataKey="members" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </ChartCard>
          </motion.div>
        </div>}
    </motion.div>;
};
export default Reports;