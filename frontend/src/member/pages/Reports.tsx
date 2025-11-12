import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { 
  ChartBarIcon, ArrowDownTrayIcon, CurrencyDollarIcon, BanknotesIcon, 
  UserGroupIcon, ArrowUpIcon, DocumentChartBarIcon
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

const fetchReportsData = async () => {
  try {
    const [loansRes, paymentsRes, penaltiesRes] = await Promise.all([
      server.get('loans/member-loans'), // Member's loans
      server.get('loans/member-payments'), // Member's payments
      server.get('penalities/data/0/50/all') // Member's penalties
    ]);

    return {
      loans: loansRes.data || [],
      payments: paymentsRes.data?.payments || [],
      penalties: penaltiesRes.data || []
    };
  } catch (error) {
    console.error('Error fetching data:', error);
    return { loans: [], payments: [], penalties: [] };
  }
};

const processData = (rawData: any) => {
  const { loans, payments, penalties } = rawData;

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
  const totalLoans = loans.reduce((sum: number, loan: any) => sum + (loan.amountTopay || loan.amount || 0), 0);
  const totalPaid = payments.reduce((sum: number, p: any) => sum + (p.amount || 0), 0);
  const totalPenalties = penalties.reduce((sum: number, p: any) => sum + (p.amount || 0), 0);
  const paidPenalties = penalties.filter((p: any) => p.pstatus === 'paid').length;
  const pendingPenalties = penalties.filter((p: any) => p.pstatus === 'wait').length;

  return {
    paymentGrowth,
    loanStatus,
    stats: {
      totalLoans: loans.length,
      totalLoanAmount: totalLoans,
      totalPaid,
      activeLoans: loanStatusCounts.active,
      totalPenalties: penalties.length,
      paidPenalties,
      pendingPenalties,
      totalPenaltyAmount: totalPenalties
    }
  };
};

const Reports: React.FC = () => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>({
    paymentGrowth: [],
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
    const loadData = async () => {
      setLoading(true);
      try {
        const rawData = await fetchReportsData();
        const processedData = processData(rawData);
        setData(processedData);
      } catch (error) {
        toast.error('Failed to load reports data');
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
            { id: 'loans', icon: BanknotesIcon, label: 'Loans' }
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
              title="Total Loans"
              value={data.stats.totalLoans.toString()}
              icon={<BanknotesIcon className="h-6 w-6" />}
              iconBgColor="bg-blue-500"
            />
            <StatsCard
              title="Total Loan Amount"
              value={formatCurrency(data.stats.totalLoanAmount)}
              icon={<CurrencyDollarIcon className="h-6 w-6" />}
              iconBgColor="bg-green-500"
            />
            <StatsCard
              title="Total Paid"
              value={formatCurrency(data.stats.totalPaid)}
              icon={<ArrowUpIcon className="h-6 w-6" />}
              iconBgColor="bg-yellow-500"
            />
            <StatsCard
              title="Active Loans"
              value={data.stats.activeLoans.toString()}
              icon={<ChartBarIcon className="h-6 w-6" />}
              iconBgColor="bg-purple-500"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartCard title="Payment History (12 Months)">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.paymentGrowth}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="month" stroke="#6B7280" />
                    <YAxis stroke="#6B7280" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1F2937',
                        borderColor: '#374151',
                        color: '#F9FAFB'
                      }}
                      formatter={(value: any) => [formatCurrency(value), 'Amount']}
                    />
                    <Area
                      type="monotone"
                      dataKey="amount"
                      stroke="#10B981"
                      fill="#10B981"
                      fillOpacity={0.2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </ChartCard>

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
          </div>
        </div>
      )}

      {activeTab === 'payments' && (
        <div className="space-y-6">
          <ChartCard title="Payment Trend (12 Months)">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.paymentGrowth}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="month" stroke="#6B7280" />
                  <YAxis stroke="#6B7280" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1F2937',
                      borderColor: '#374151',
                      color: '#F9FAFB'
                    }}
                    formatter={(value: any) => [formatCurrency(value), 'Amount']}
                  />
                  <Line
                    type="monotone"
                    dataKey="amount"
                    stroke="#10B981"
                    strokeWidth={3}
                    dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartCard title="Payment Count by Month">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.paymentGrowth}>
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
                    <Bar dataKey="count" fill="#3B82F6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </ChartCard>

            <div className="space-y-6">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Penalty Summary</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Total Penalties</span>
                    <span className="font-medium">{data.stats.totalPenalties}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Paid</span>
                    <span className="font-medium text-green-600">{data.stats.paidPenalties}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Pending</span>
                    <span className="font-medium text-red-600">{data.stats.pendingPenalties}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Total Amount</span>
                    <span className="font-medium">{formatCurrency(data.stats.totalPenaltyAmount)}</span>
                  </div>
                </div>
              </div>
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