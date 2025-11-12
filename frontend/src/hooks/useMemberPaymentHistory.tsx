import { useCallback, useEffect, useState } from "react";
import server from "../utils/server";
import { useAuth } from "../context/AuthContext";

export interface PaymentHistoryItem {
  pay_id: number;
  pay_date: string;
  amount: number;
  loanId: number;
  loan_amount: number;
  amount_to_pay: number;
  payedAmount: number;
  loan_status: string;
  rate: number;
  duration: number;
  request_date: string;
  approved_date: string | null;
  purpose: string;
  firstName: string;
  lastName: string;
  telephone: string;
  recorder_name: string;
  remaining_amount: number;
}

export interface PaymentHistorySummary {
  totalPayments: number;
  totalAmountPaid: number;
  totalRemaining: number;
}

export interface UseMemberPaymentHistoryResult {
  payments: PaymentHistoryItem[];
  summary: PaymentHistorySummary;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

/**
 * Fetch payment history for the current member from `loans/member-payments/:memberId`.
 */
export default function useMemberPaymentHistory(): UseMemberPaymentHistoryResult {
  const { user } = useAuth();
  const [payments, setPayments] = useState<PaymentHistoryItem[]>([]);
  const [summary, setSummary] = useState<PaymentHistorySummary>({
    totalPayments: 0,
    totalAmountPaid: 0,
    totalRemaining: 0
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPaymentHistory = useCallback(async () => {
    if (!user || !user.id) {
      setError("User not authenticated");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const resp = await server.get(`/loans/member-payment-history/${user.id}`);
      const data = resp?.data ?? resp;

      const rawPayments: any[] = Array.isArray(data?.payments) ? data.payments : [];
      const normalized: PaymentHistoryItem[] = rawPayments.map((p: any) => ({
        pay_id: Number(p.pay_id ?? 0),
        pay_date: p.pay_date ?? "",
        amount: Number(p.amount ?? 0),
        loanId: Number(p.loanId ?? 0),
        loan_amount: Number(p.loan_amount ?? 0),
        amount_to_pay: Number(p.amount_to_pay ?? 0),
        payedAmount: Number(p.payedAmount ?? 0),
        loan_status: String(p.loan_status ?? ""),
        rate: Number(p.rate ?? 0),
        duration: Number(p.duration ?? 0),
        request_date: p.request_date ?? "",
        approved_date: p.approved_date ?? null,
        purpose: p.purpose ?? "",
        firstName: p.firstName ?? "",
        lastName: p.lastName ?? "",
        telephone: p.telephone ?? "",
        recorder_name: p.recorder_name ?? "",
        remaining_amount: Number(p.remaining_amount ?? 0),
      }));

      setPayments(normalized);
      setSummary(data.summary || {
        totalPayments: normalized.length,
        totalAmountPaid: normalized.reduce((sum, p) => sum + p.amount, 0),
        totalRemaining: normalized.reduce((sum, p) => sum + p.remaining_amount, 0)
      });
    } catch (err) {
      console.error("useMemberPaymentHistory error:", err);
      setError(err instanceof Error ? err.message : String(err));
      setPayments([]);
      setSummary({ totalPayments: 0, totalAmountPaid: 0, totalRemaining: 0 });
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user && user.id) {
      void fetchPaymentHistory();
    }
  }, [fetchPaymentHistory, user]);

  return {
    payments,
    summary,
    loading,
    error,
    refresh: fetchPaymentHistory,
  };
}