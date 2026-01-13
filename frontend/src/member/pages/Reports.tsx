import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import useMemberLoans from '../../hooks/useMemberLoans';
import useMemberPaymentHistory from '../../hooks/useMemberPaymentHistory';
import useMemberPenalties from '../../hooks/useMemberPenalties';
import useMemberSavings from '../../hooks/useMemberSavings';
import {
  ChartBarIcon, ArrowDownTrayIcon, CurrencyDollarIcon, BanknotesIcon,
  UserGroupIcon, ArrowUpIcon, DocumentChartBarIcon, ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import StatsCard from '../../components/ui/StatsCard';
import ChartCard from '../../components/ui/ChartCard';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area
} from 'recharts';
import { toast } from 'sonner';
import server from '../../utils/server';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import * as XLSX from 'xlsx';


const processData = (rawData: any) => {
  const { loans, payments, penalties, savings } = rawData;

  // Process payment history over months
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  let paymentGrowth = months.map((month, i) => {
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

  // If no real data, show some sample data for demo
  if (paymentGrowth.every(p => p.amount === 0)) {
    paymentGrowth = [
      { month: 'Jan', amount: 0, count: 0 },
      { month: 'Feb', amount: 15000, count: 2 },
      { month: 'Mar', amount: 22000, count: 3 },
      { month: 'Apr', amount: 18000, count: 2 },
      { month: 'May', amount: 25000, count: 4 },
      { month: 'Jun', amount: 30000, count: 5 },
      { month: 'Jul', amount: 28000, count: 4 },
      { month: 'Aug', amount: 35000, count: 6 },
      { month: 'Sep', amount: 32000, count: 5 },
      { month: 'Oct', amount: 40000, count: 7 },
      { month: 'Nov', amount: 38000, count: 6 },
      { month: 'Dec', amount: 45000, count: 8 }
    ];
  }

  // Process loan applications over months
  const loanGrowth = months.map((month, i) => {
    const monthStart = new Date(2024, i, 1);
    const monthEnd = new Date(2024, i + 1, 0);
    const loansInMonth = loans.filter((l: any) => {
      const requestDate = new Date(l.requestDate || l.request_date);
      return requestDate >= monthStart && requestDate <= monthEnd;
    });

    return {
      month,
      loans: loansInMonth.length
    };
  });

  // Process loan data
  const loanStatusCounts = {
    active: loans.filter((l: any) => l.status === 'active').length,
    paid: loans.filter((l: any) => l.status === 'paid').length,
    pending: loans.filter((l: any) => l.status === 'pending').length,
    rejected: loans.filter((l: any) => l.status === 'rejected' || l.status === 'cancelled').length
  };

  const loanStatus = [
    { name: 'Active', value: loanStatusCounts.active, color: '#3B82F6' },
    { name: 'Paid', value: loanStatusCounts.paid, color: '#10B981' },
    { name: 'Pending', value: loanStatusCounts.pending, color: '#F59E0B' },
    { name: 'Rejected', value: loanStatusCounts.rejected, color: '#EF4444' }
  ].filter(item => item.value > 0);

  // Calculate totals
  const totalLoans = loans
    .filter((l: any) => l.status === 'active')
    .reduce((sum: number, loan: any) => sum + ((loan.amountTopay || 0) - (loan.payedAmount || 0)), 0);
  const totalSavings = savings.reduce((sum: number, s: any) => sum + (s.amount || 0), 0);
  const totalPaid = payments.reduce((sum: number, p: any) => sum + (p.amount || 0), 0);
  const totalPenalties = penalties.reduce((sum: number, p: any) => sum + (p.amount || 0), 0);
  const paidPenalties = penalties.filter((p: any) => p.pstatus === 'paid').length;
  const pendingPenalties = penalties.filter((p: any) => p.pstatus === 'wait').length;

  return {
    paymentGrowth,
    loanGrowth,
    loanStatus,
    stats: {
      totalSavings,
      totalLoans,
      totalPaid,
      totalPenalties: totalPenalties
    }
  };
};

const Reports: React.FC = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { loans } = useMemberLoans();
  const { payments } = useMemberPaymentHistory();
  const { penalties } = useMemberPenalties();
  const { savings } = useMemberSavings();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>({
    paymentGrowth: [],
    loanGrowth: [],
    loanStatus: [],
    stats: {
      totalLoans: 0,
      totalLoanAmount: 0,
      totalPaid: 0,
      activeLoans: 0,
      totalPenalties: 0,
      paidPenalties: 0,
      pendingPenalties: 0,
      totalPenaltyAmount: 0
    }
  });
  
  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'];
  
  useEffect(() => {
    const processedData = processData({ loans, payments, penalties, savings });
    setData(processedData);
    setLoading(false);
  }, [loans, payments, penalties, savings]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'RWF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const reportRef = useRef<HTMLDivElement>(null);

  const exportToPDF = async () => {
    if (!reportRef.current) return;
    try {
      const canvas = await html2canvas(reportRef.current, { scale: 2 });
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgData = canvas.toDataURL('image/png');
      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save(`reports-${new Date().toISOString().split('T')[0]}.pdf`);
      toast.success('PDF exported successfully!');
    } catch (error) {
      toast.error('Failed to export PDF');
    }
  };

  const exportToExcel = () => {
    try {
      const workbook = XLSX.utils.book_new();
      const statsData = [['Metric', 'Value'], ['Total Members', data.stats.totalMembers], ['Total Savings', data.stats.totalSavings], ['Total Loans', data.stats.totalLoans], ['Active Loans', data.stats.activeLoans]];
      XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet(statsData), 'Statistics');
      XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(data.memberGrowth), 'Member Growth');
      XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(data.loanStatus), 'Loan Status');
      XLSX.writeFile(workbook, `reports-${new Date().toISOString().split('T')[0]}.xlsx`);
      toast.success('Excel exported successfully!');
    } catch (error) {
      toast.error('Failed to export Excel');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600 dark:text-gray-300">Loading reports...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6" ref={reportRef}>
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center">
            <DocumentChartBarIcon className="h-6 w-6 mr-2 text-blue-600" />
            Reports & Analytics
          </h1>
          <p className="text-gray-500 dark:text-gray-400">Comprehensive insights from your data</p>
        </div>
        <div className="flex space-x-3">
          <button 
            onClick={exportToPDF} 
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center"
          >
            <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
            PDF
          </button>
          <button 
            onClick={exportToExcel} 
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center"
          >
            <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
            Excel
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          {[
            { id: 'overview', icon: ChartBarIcon, label: 'Overview' },
            { id: 'payments', icon: CurrencyDollarIcon, label: 'Payments' },
            { id: 'savings', icon: BanknotesIcon, label: 'Savings' },
            { id: 'penalties', icon: ExclamationTriangleIcon, label: 'Penalties' }
          ].map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center px-6 py-3 text-sm font-medium ${
                activeTab === id
                  ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-500'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <Icon className="h-4 w-4 mr-2" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatsCard
              title="Total Savings"
              value={formatCurrency(data.stats.totalSavings)}
              icon={<CurrencyDollarIcon className="h-6 w-6" />}
              iconBgColor="bg-green-500"
            />
            <StatsCard
              title="Outstanding Loans"
              value={formatCurrency(data.stats.totalLoans)}
              icon={<BanknotesIcon className="h-6 w-6" />}
              iconBgColor="bg-blue-500"
            />
            <StatsCard
              title="Total Penalties"
              value={formatCurrency(data.stats.totalPenalties)}
              icon={<ExclamationTriangleIcon className="h-6 w-6" />}
              iconBgColor="bg-red-500"
            />
            <StatsCard
              title="Total Payments"
              value={formatCurrency(data.stats.totalPaid)}
              icon={<ArrowUpIcon className="h-6 w-6" />}
              iconBgColor="bg-yellow-500"
            />
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">All Transactions</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Description</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {(() => {
                    const allTransactions = [
                      ...savings.map((s: any) => ({
                        id: `saving_${s.id}`,
                        date: s.date,
                        type: 'Savings',
                        description: `Savings deposit`,
                        amount: s.amount,
                        status: 'Completed'
                      })),
                      ...loans.map((l: any) => ({
                        id: `loan_${l.loanId}`,
                        date: l.requestDate,
                        type: 'Loan',
                        description: `Loan application - ${l.re?.split(':')[0] || 'Personal'}`,
                        amount: l.amount,
                        status: l.status === 'active' ? 'Approved' : l.status === 'pending' ? 'Pending' : l.status === 'paid' ? 'Paid' : 'Rejected'
                      })),
                      ...payments.map((p: any) => ({
                        id: `payment_${p.pay_id}`,
                        date: p.pay_date,
                        type: 'Payment',
                        description: `Loan payment for Loan #${p.loanId}`,
                        amount: -p.amount, // Negative for payments out
                        status: 'Completed'
                      })),
                      ...penalties.map((p: any) => ({
                        id: `penalty_${p.p_id}`,
                        date: p.date,
                        type: 'Penalty',
                        description: `Penalty - ${p.reason || 'N/A'}`,
                        amount: -p.amount, // Negative for penalties
                        status: p.pstatus === 'paid' ? 'Paid' : 'Pending'
                      }))
                    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

                    return allTransactions.map((transaction) => (
                      <tr key={transaction.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {new Date(transaction.date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            transaction.type === 'Savings' ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100' :
                            transaction.type === 'Loan' ? 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100' :
                            transaction.type === 'Payment' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100' :
                            'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'
                          }`}>
                            {transaction.type}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                          {transaction.description}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <span className={transaction.amount >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                            {transaction.amount >= 0 ? '+' : ''}{formatCurrency(Math.abs(transaction.amount))}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {transaction.status}
                        </td>
                      </tr>
                    ));
                  })()}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'payments' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Loan Payment History</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Loan ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Recorder</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {payments.map((payment: any) => (
                    <tr key={payment.pay_id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {new Date(payment.pay_date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600 dark:text-green-400">
                        {formatCurrency(payment.amount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {payment.loanId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {payment.recorder_name}
                      </td>
                    </tr>
                  ))}
                  {payments.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">No payments found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'savings' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Savings History</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Type</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {savings.map((saving: any) => (
                    <tr key={saving.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {new Date(saving.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600 dark:text-green-400">
                        {formatCurrency(saving.amount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {saving.type || 'Deposit'}
                      </td>
                    </tr>
                  ))}
                  {savings.length === 0 && (
                    <tr>
                      <td colSpan={3} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">No savings found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'penalties' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Penalties History</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Reason</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {penalties.map((penalty: any) => (
                    <tr key={penalty.p_id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {new Date(penalty.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-red-600 dark:text-red-400">
                        {formatCurrency(penalty.amount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          penalty.pstatus === 'paid'
                            ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100'
                            : 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'
                        }`}>
                          {penalty.pstatus === 'paid' ? 'Paid' : 'Pending'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {penalty.reason || 'N/A'}
                      </td>
                    </tr>
                  ))}
                  {penalties.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">No penalties found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'loans' && (
        <div className="space-y-6">
          <ChartCard title="Loan Applications Over Time (12 Months)">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.loanGrowth}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="month" stroke="#6B7280" />
                  <YAxis stroke="#6B7280" />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: '#1F2937',
                      borderColor: '#374151',
                      color: '#F9FAFB'
                    }} 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="loans" 
                    stroke="#F59E0B" 
                    strokeWidth={3}
                    dot={{ fill: '#F59E0B', strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartCard title="Loan Status Distribution">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data.loanStatus}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {data.loanStatus.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </ChartCard>

            <ChartCard title="Monthly Loan Volume">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.loanGrowth}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="month" stroke="#6B7280" />
                    <YAxis stroke="#6B7280" />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: '#1F2937',
                        borderColor: '#374151',
                        color: '#F9FAFB'
                      }} 
                    />
                    <Bar dataKey="loans" fill="#EF4444" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </ChartCard>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;