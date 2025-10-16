// Mock data for the dashboard
export const members = [{
  id: 1,
  name: 'John Doe',
  email: 'john@example.com',
  joinDate: '2023-01-15',
  totalSavings: 2500
}, {
  id: 2,
  name: 'Jane Smith',
  email: 'jane@example.com',
  joinDate: '2023-02-20',
  totalSavings: 3200
}, {
  id: 3,
  name: 'Robert Johnson',
  email: 'robert@example.com',
  joinDate: '2023-01-05',
  totalSavings: 1800
}, {
  id: 4,
  name: 'Emily Davis',
  email: 'emily@example.com',
  joinDate: '2023-03-10',
  totalSavings: 4100
}, {
  id: 5,
  name: 'Michael Wilson',
  email: 'michael@example.com',
  joinDate: '2023-02-28',
  totalSavings: 2900
}, {
  id: 6,
  name: 'Sarah Brown',
  email: 'sarah@example.com',
  joinDate: '2023-04-05',
  totalSavings: 1500
}, {
  id: 7,
  name: 'David Miller',
  email: 'david@example.com',
  joinDate: '2023-03-22',
  totalSavings: 3700
}, {
  id: 8,
  name: 'Lisa Anderson',
  email: 'lisa@example.com',
  joinDate: '2023-01-30',
  totalSavings: 2200
}, {
  id: 9,
  name: 'James Taylor',
  email: 'james@example.com',
  joinDate: '2023-04-12',
  totalSavings: 1900
}, {
  id: 10,
  name: 'Jennifer White',
  email: 'jennifer@example.com',
  joinDate: '2023-02-15',
  totalSavings: 3400
}, {
  id: 11,
  name: 'Daniel Garcia',
  email: 'daniel@example.com',
  joinDate: '2023-03-05',
  totalSavings: 2800
}, {
  id: 12,
  name: 'Jessica Martinez',
  email: 'jessica@example.com',
  joinDate: '2023-01-25',
  totalSavings: 4300
}];
export const savingsData = [{
  month: 'Jan',
  amount: 12000
}, {
  month: 'Feb',
  amount: 19000
}, {
  month: 'Mar',
  amount: 15000
}, {
  month: 'Apr',
  amount: 22000
}, {
  month: 'May',
  amount: 18000
}, {
  month: 'Jun',
  amount: 25000
}, {
  month: 'Jul',
  amount: 27000
}, {
  month: 'Aug',
  amount: 24000
}, {
  month: 'Sep',
  amount: 30000
}, {
  month: 'Oct',
  amount: 28000
}, {
  month: 'Nov',
  amount: 32000
}, {
  month: 'Dec',
  amount: 35000
}];
export const loanDistribution = [{
  name: 'Business',
  value: 45
}, {
  name: 'Education',
  value: 20
}, {
  name: 'Housing',
  value: 25
}, {
  name: 'Personal',
  value: 10
}];
export const repaymentPerformance = [{
  month: 'Jan',
  onTime: 85,
  late: 15
}, {
  month: 'Feb',
  onTime: 80,
  late: 20
}, {
  month: 'Mar',
  onTime: 90,
  late: 10
}, {
  month: 'Apr',
  onTime: 88,
  late: 12
}, {
  month: 'May',
  onTime: 92,
  late: 8
}, {
  month: 'Jun',
  onTime: 95,
  late: 5
}];
export const recentActivity = [{
  id: 1,
  type: 'savings',
  member: 'John Doe',
  amount: 500,
  date: '2023-06-01'
}, {
  id: 2,
  type: 'loan',
  member: 'Jane Smith',
  amount: 2000,
  date: '2023-06-02'
}, {
  id: 3,
  type: 'repayment',
  member: 'Robert Johnson',
  amount: 300,
  date: '2023-06-03'
}, {
  id: 4,
  type: 'savings',
  member: 'Emily Davis',
  amount: 700,
  date: '2023-06-04'
}, {
  id: 5,
  type: 'loan',
  member: 'Michael Wilson',
  amount: 1500,
  date: '2023-06-05'
}];
export const loans = [{
  id: 1,
  member: 'John Doe',
  amount: 5000,
  status: 'approved',
  progress: 60,
  date: '2023-04-10'
}, {
  id: 2,
  member: 'Jane Smith',
  amount: 3000,
  status: 'pending',
  progress: 0,
  date: '2023-06-02'
}, {
  id: 3,
  member: 'Robert Johnson',
  amount: 2000,
  status: 'approved',
  progress: 75,
  date: '2023-03-15'
}, {
  id: 4,
  member: 'Emily Davis',
  amount: 7000,
  status: 'rejected',
  progress: 0,
  date: '2023-05-20'
}, {
  id: 5,
  member: 'Michael Wilson',
  amount: 4000,
  status: 'approved',
  progress: 30,
  date: '2023-05-05'
}, {
  id: 6,
  member: 'Sarah Brown',
  amount: 6000,
  status: 'pending',
  progress: 0,
  date: '2023-06-01'
}, {
  id: 7,
  member: 'David Miller',
  amount: 3500,
  status: 'approved',
  progress: 45,
  date: '2023-04-22'
}, {
  id: 8,
  member: 'Lisa Anderson',
  amount: 2500,
  status: 'approved',
  progress: 90,
  date: '2023-02-18'
}];
export const repayments = [{
  id: 1,
  member: 'John Doe',
  loanRef: 'L-2023-001',
  amount: 500,
  balance: 2000,
  date: '2023-05-10'
}, {
  id: 2,
  member: 'Robert Johnson',
  loanRef: 'L-2023-003',
  amount: 300,
  balance: 500,
  date: '2023-06-03'
}, {
  id: 3,
  member: 'Michael Wilson',
  loanRef: 'L-2023-005',
  amount: 400,
  balance: 2800,
  date: '2023-05-25'
}, {
  id: 4,
  member: 'David Miller',
  loanRef: 'L-2023-007',
  amount: 350,
  balance: 1925,
  date: '2023-05-22'
}, {
  id: 5,
  member: 'Lisa Anderson',
  loanRef: 'L-2023-008',
  amount: 250,
  balance: 250,
  date: '2023-06-01'
}];
export const notifications = [{
  id: 1,
  title: 'Loan Approved',
  message: 'Your loan request for $3,000 has been approved.',
  date: '2023-06-02',
  read: false
}, {
  id: 2,
  title: 'Repayment Due',
  message: 'Your loan repayment of $500 is due in 3 days.',
  date: '2023-06-01',
  read: true
}, {
  id: 3,
  title: 'New Member',
  message: 'Sarah Brown has joined the association.',
  date: '2023-05-30',
  read: true
}, {
  id: 4,
  title: 'Savings Goal Reached',
  message: "Congratulations! You've reached your savings goal of $5,000.",
  date: '2023-05-28',
  read: false
}, {
  id: 5,
  title: 'Meeting Reminder',
  message: 'Monthly association meeting scheduled for June 15th at 4:00 PM.',
  date: '2023-05-25',
  read: true
}];
// Dashboard stats
export const dashboardStats = {
  totalMembers: 124,
  totalSavings: 245000,
  activeLoans: 38,
  pendingRepayments: 12
};