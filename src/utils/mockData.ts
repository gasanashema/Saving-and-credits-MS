// Mock data for the dashboard
export const members = [
  { id: 1, name: "Alice Mwiza" },
  { id: 2, name: "Jean Niyonzima" },
  { id: 3, name: "Claire Uwimana" },
  { id: 4, name: "Eric Habimana" }
];

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
export const loans = [
  // pending
  {
    id: 101,
    member: "Alice Mwiza",
    amount: 1500,
    status: "pending",
    progress: 0,
    date: "2025-10-01",
    purpose: "business",
    term: 12,
    interestRate: 5,
    dueDate: "2026-10-01",
    notes: "New shop stock"
  },
  {
    id: 102,
    member: "Jean Niyonzima",
    amount: 800,
    status: "pending",
    progress: 0,
    date: "2025-10-15",
    purpose: "personal",
    term: 6,
    interestRate: 4.5,
    dueDate: "2026-04-15",
    notes: ""
  },

  // active (previously 'approved' in earlier data)
  {
    id: 201,
    member: "Claire Uwimana",
    amount: 3000,
    status: "active",
    progress: 25,
    date: "2025-06-20",
    purpose: "housing",
    term: 24,
    interestRate: 6,
    dueDate: "2027-06-20",
    notes: "Renovation"
  },
  {
    id: 202,
    member: "Eric Habimana",
    amount: 1200,
    status: "active",
    progress: 40,
    date: "2025-04-10",
    purpose: "business",
    term: 12,
    interestRate: 5,
    dueDate: "2026-04-10",
    notes: "Inventory"
  },

  // paid
  {
    id: 301,
    member: "Alice Mwiza",
    amount: 500,
    status: "paid",
    progress: 100,
    date: "2024-09-01",
    purpose: "education",
    term: 6,
    interestRate: 3,
    dueDate: "2025-03-01",
    notes: "Tuition - completed"
  },
  {
    id: 302,
    member: "Jean Niyonzima",
    amount: 950,
    status: "paid",
    progress: 100,
    date: "2024-12-15",
    purpose: "personal",
    term: 6,
    interestRate: 4,
    dueDate: "2025-06-15",
    notes: "Repaid early"
  },

  // rejected
  {
    id: 401,
    member: "Claire Uwimana",
    amount: 2000,
    status: "rejected",
    progress: 0,
    date: "2025-09-05",
    purpose: "agriculture",
    term: 12,
    interestRate: 5.5,
    dueDate: "2026-09-05",
    notes: "Insufficient guarantor"
  }
];
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