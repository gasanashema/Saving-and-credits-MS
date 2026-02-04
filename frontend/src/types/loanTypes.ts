export interface BackendLoan {
  loanId: number;
  requestDate: string;
  re?: string | null;
  amount: number;
  rate: number;
  duration: number;
  applovedDate?: string | null;
  apploverId?: number | null;
  memberId: number;
  amountToPay: number;
  payedAmount: number;
  status: string; // normalized from lstatus or status
  id: number; // member id (joined)
  nid: string;
  firstName: string;
  lastName: string;
  // allow extra fields the backend may send
  [key: string]: any;
}

export interface Loan {
  id: number;
  member: string;
  amount: number;
  status: string;
  progress: number;
  date: string;
  purpose?: string;
  term?: number;
  interestRate?: number;
  dueDate?: string;
  notes?: string;
}

export type LoanStatus = 'pending' | 'active' | 'approved' | 'paid' | 'rejected';
export type LoanPurpose = 'business' | 'education' | 'housing' | 'personal' | 'emergency' | 'agriculture';

export interface LoanPayment {
  pay_id: number;
  pay_date: string;
  amount: number;
  recorder_name: string;
  [key: string]: any;
}

export interface LoanPaymentDetails {
  loan: BackendLoan;
  payments: LoanPayment[];
  summary: {
    totalAmount: number;
    paidAmount: number;
    remainingAmount: number;
    status: string;
  };
}

export interface LoanPackage {
  id: number;
  name: string;
  min_savings: number;
  max_loan_amount: number;
  min_membership_months: number;
  loan_multiplier: number;
  repayment_duration_months: number;
  interest_rate: number;
  description: string;
  status: 'active' | 'inactive';
}
